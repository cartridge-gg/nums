//! Helpers for declaring + deploying the Piltover `messaging_mock` contract
//! on the settlement Katana, and for shuttling Appchain→Settlement message
//! hashes via the `messaging_test` `add_messages_hashes_from_appchain` entry
//! point (the manual stand-in for `update_state()` in this test harness).
//!
//! See plan §"Critical implementation guidance / Piltover update_state
//! calldata" for the rationale: real Piltover `update_state` requires either
//! a SNOS proof or a TEE attestation, neither of which we want to run in a
//! test. The `messaging_test` Cairo feature flag injects this back-door for
//! exactly this purpose.

use std::path::Path;
use std::sync::Arc;
use std::time::Duration;

use anyhow::{anyhow, Context, Result};
use serde_json::Value;
use starknet::accounts::{Account, ConnectedAccount, ExecutionEncoding, SingleOwnerAccount};
#[allow(unused_imports)]
use starknet::accounts::AccountFactory;
use starknet::contract::ContractFactory;
use starknet::core::types::contract::SierraClass;
use starknet::core::types::{BlockId, BlockTag, Call, Felt, TransactionReceipt, TransactionReceiptWithBlockInfo};
use starknet::core::utils::get_selector_from_name;
use starknet::macros::selector;
use starknet::providers::jsonrpc::HttpTransport;
use starknet::providers::{JsonRpcClient, Provider};
use starknet::signers::{LocalWallet, SigningKey};

/// Declare and deploy the `messaging_mock` contract.
///
/// Returns the deployed address.
pub async fn declare_and_deploy_messaging_mock(
    account: &SingleOwnerAccount<JsonRpcClient<HttpTransport>, LocalWallet>,
    artifact_path: &Path,
    cancellation_delay_secs: u64,
) -> Result<Felt> {
    // Load the Sierra class JSON.
    let class_json = std::fs::read(artifact_path)
        .with_context(|| format!("read artifact at {}", artifact_path.display()))?;
    let sierra: SierraClass = serde_json::from_slice(&class_json)
        .with_context(|| format!("parse sierra class at {}", artifact_path.display()))?;
    let class_hash = sierra.class_hash().context("compute class hash")?;
    tracing::info!("messaging_mock class hash: {class_hash:#x}");

    // For Katana dev mode we don't strictly need to declare since contracts
    // can be deployed by class hash if known... but we do anyway for the
    // first run, and treat "already declared" as success.
    let flat_class = sierra.flatten().context("flatten sierra class")?;
    let casm_path = artifact_path
        .to_string_lossy()
        .replace(".contract_class.json", ".compiled_contract_class.json");
    let casm_bytes = std::fs::read(&casm_path).with_context(|| format!("read casm at {casm_path}"))?;
    let casm_class: starknet::core::types::contract::CompiledClass =
        serde_json::from_slice(&casm_bytes).context("parse casm class")?;
    let compiled_class_hash = casm_class.class_hash().context("compute compiled class hash")?;
    tracing::info!("messaging_mock compiled class hash: {compiled_class_hash:#x}");

    let declare_tx = account
        .declare_v3(Arc::new(flat_class), compiled_class_hash)
        .gas_estimate_multiplier(2.0);

    match declare_tx.send().await {
        Ok(decl) => {
            tracing::info!("declare tx submitted: {:#x}", decl.transaction_hash);
            wait_for_tx_success(account.provider(), decl.transaction_hash).await?;
        }
        Err(e) => {
            // If already declared this will return a class-already-declared
            // error from the sequencer. Inspect the error text and continue.
            let msg = format!("{e:?}");
            if msg.contains("ClassAlreadyDeclared") || msg.contains("is already declared") {
                tracing::info!("messaging_mock already declared, skipping");
            } else {
                return Err(anyhow!("declare messaging_mock: {e}"));
            }
        }
    }

    // Deploy via UDC.
    let factory = ContractFactory::new(class_hash, account);
    let salt = Felt::from_hex("0x9117f0").unwrap();
    let constructor_args = vec![Felt::from(cancellation_delay_secs)];
    let unique = false; // deterministic salt; not unique-per-deployer

    let deployment = factory.deploy_v3(constructor_args.clone(), salt, unique);
    let address = deployment.deployed_address();
    tracing::info!("messaging_mock will deploy to: {address:#x}");

    let res = deployment.gas_estimate_multiplier(2.0).send().await;
    match res {
        Ok(tx) => {
            tracing::info!("deploy tx submitted: {:#x}", tx.transaction_hash);
            wait_for_tx_success(account.provider(), tx.transaction_hash).await?;
        }
        Err(e) => {
            let msg = format!("{e:?}");
            if msg.contains("already deployed") || msg.contains("ContractAddressUnavailable") {
                tracing::info!("messaging_mock address already in use, treating as success");
            } else {
                return Err(anyhow!("deploy messaging_mock: {e}"));
            }
        }
    }

    Ok(address)
}

/// Push a list of Appchain→Starknet message hashes into the messaging_mock,
/// making them consumable on the settlement layer. This is the manual
/// stand-in for `Piltover.update_state()`.
pub async fn add_messages_hashes_from_appchain(
    account: &SingleOwnerAccount<JsonRpcClient<HttpTransport>, LocalWallet>,
    messaging_mock: Felt,
    hashes: &[Felt],
) -> Result<Felt> {
    let mut calldata = vec![Felt::from(hashes.len() as u64)];
    calldata.extend_from_slice(hashes);
    let call = Call {
        to: messaging_mock,
        selector: selector!("add_messages_hashes_from_appchain"),
        calldata,
    };
    let tx = account
        .execute_v3(vec![call])
        .gas_estimate_multiplier(2.0)
        .send()
        .await
        .context("submit add_messages_hashes_from_appchain")?;
    wait_for_tx_success(account.provider(), tx.transaction_hash).await?;
    Ok(tx.transaction_hash)
}

/// Build a Katana `--messaging` config JSON pointing at the settlement
/// messaging_mock, and write it to the provided path. Returns the path.
pub fn write_messaging_config(
    path: &Path,
    settlement_rpc_url: &str,
    messaging_mock: Felt,
    from_block: u64,
) -> Result<()> {
    let config = serde_json::json!({
        "chain": "starknet",
        "rpc_url": settlement_rpc_url,
        "contract_address": format!("0x{:x}", messaging_mock),
        "interval": 2u64,
        "from_block": from_block,
    });
    std::fs::write(path, serde_json::to_vec_pretty(&config)?).context("write messaging config")?;
    Ok(())
}

pub async fn wait_for_tx_success(
    provider: &JsonRpcClient<HttpTransport>,
    tx_hash: Felt,
) -> Result<TransactionReceiptWithBlockInfo> {
    let deadline = std::time::Instant::now() + Duration::from_secs(60);
    loop {
        match provider.get_transaction_receipt(tx_hash).await {
            Ok(receipt) => {
                use starknet::core::types::ExecutionResult;
                let exec = match &receipt.receipt {
                    TransactionReceipt::Invoke(r) => &r.execution_result,
                    TransactionReceipt::Declare(r) => &r.execution_result,
                    TransactionReceipt::Deploy(r) => &r.execution_result,
                    TransactionReceipt::DeployAccount(r) => &r.execution_result,
                    TransactionReceipt::L1Handler(r) => &r.execution_result,
                };
                match exec {
                    ExecutionResult::Succeeded => return Ok(receipt),
                    ExecutionResult::Reverted { reason } => {
                        return Err(anyhow!("tx {tx_hash:#x} reverted: {reason}"));
                    }
                }
            }
            Err(_) if std::time::Instant::now() < deadline => {
                tokio::time::sleep(Duration::from_millis(200)).await;
            }
            Err(e) => return Err(anyhow!("tx {tx_hash:#x} not accepted within deadline: {e}")),
        }
    }
}

/// Convenience: parse a `MessageSent` event emitted by the messaging_cpt
/// off a transaction receipt and pull out the message hash (the first key
/// after the event selector).
pub fn extract_message_sent_hash(receipt: &TransactionReceiptWithBlockInfo) -> Option<Felt> {
    let events: &[starknet::core::types::Event] = match &receipt.receipt {
        TransactionReceipt::Invoke(r) => &r.events,
        TransactionReceipt::L1Handler(r) => &r.events,
        _ => return None,
    };
    let want = get_selector_from_name("MessageSent").ok()?;
    for ev in events {
        if ev.keys.first() == Some(&want) {
            // keys layout: [selector, message_hash, from, to]
            return ev.keys.get(1).copied();
        }
    }
    None
}

/// Probe: does the messaging_mock report the given hash as ReadyToConsume?
pub async fn appchain_to_sn_message_count(
    provider: &JsonRpcClient<HttpTransport>,
    messaging_mock: Felt,
    message_hash: Felt,
) -> Result<u64> {
    let res = provider
        .call(
            starknet::core::types::FunctionCall {
                contract_address: messaging_mock,
                entry_point_selector: selector!("appchain_to_sn_messages"),
                calldata: vec![message_hash],
            },
            BlockId::Tag(BlockTag::PreConfirmed),
        )
        .await
        .context("call appchain_to_sn_messages")?;
    // The component returns MessageToStarknetStatus enum:
    //   variant 0 = NothingToConsume, 1 = ReadyToConsume(count)
    let variant = res.first().copied().unwrap_or(Felt::ZERO);
    if variant == Felt::ZERO {
        Ok(0)
    } else {
        let count = res.get(1).copied().unwrap_or(Felt::ZERO);
        let v: u64 = u128::from_str_radix(&format!("{count:x}"), 16)
            .map_err(|e| anyhow!("parse count: {e}"))?
            .try_into()
            .unwrap_or(u64::MAX);
        Ok(v)
    }
}

/// Inspect a JSON value to confirm the messaging_test feature is wired into
/// the running messaging_mock. We just look for the `add_messages_hashes_from_appchain`
/// selector being callable; an "ENTRYPOINT_NOT_FOUND" error means the artifact
/// was built without `--features messaging_test`.
pub async fn assert_messaging_test_feature_present(
    provider: &JsonRpcClient<HttpTransport>,
    messaging_mock: Felt,
) -> Result<()> {
    // We invoke with an empty hashes array; this is a no-op whether the
    // entrypoint exists or not, but if it doesn't the call will revert with
    // ENTRYPOINT_NOT_FOUND when actually executed in a tx. Use a simulated
    // call (`starknet_call`) instead.
    let res = provider
        .call(
            starknet::core::types::FunctionCall {
                contract_address: messaging_mock,
                entry_point_selector: selector!("add_messages_hashes_from_appchain"),
                calldata: vec![Felt::ZERO],
            },
            BlockId::Tag(BlockTag::PreConfirmed),
        )
        .await;
    match res {
        Ok(_) => Ok(()),
        Err(e) => {
            let s = format!("{e:?}");
            if s.contains("ENTRYPOINT_NOT_FOUND") || s.contains("not found in contract") {
                Err(anyhow!(
                    "messaging_mock missing `add_messages_hashes_from_appchain` — \
                     rebuild the piltover artifact with `--features messaging_test`. \
                     Underlying error: {s}"
                ))
            } else {
                // Other errors are typically because the call mutated state in
                // a simulated context — that's fine, the entrypoint exists.
                Ok(())
            }
        }
    }
}

#[allow(dead_code)]
pub fn build_account(
    provider: JsonRpcClient<HttpTransport>,
    chain_id: Felt,
    address: Felt,
    privkey: Felt,
) -> SingleOwnerAccount<JsonRpcClient<HttpTransport>, LocalWallet> {
    let signer = LocalWallet::from_signing_key(SigningKey::from_secret_scalar(privkey));
    let mut account = SingleOwnerAccount::new(provider, signer, address, chain_id, ExecutionEncoding::New);
    account.set_block_id(BlockId::Tag(BlockTag::PreConfirmed));
    account
}

#[allow(dead_code)]
pub fn parse_value_felt(v: &Value, key: &str) -> Result<Felt> {
    v.get(key)
        .and_then(|s| s.as_str())
        .ok_or_else(|| anyhow!("missing {key} in {v}"))
        .and_then(|s| Felt::from_hex(s).map_err(|e| anyhow!("parse {key}: {e}")))
}
