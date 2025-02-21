#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
STARKNET_DOJO_DIR="$SCRIPT_DIR/../dojo"

cd "$STARKNET_DOJO_DIR" || {
    echo "Error: Could not change to dojo directory at $STARKNET_DOJO_DIR"
    exit 1
}

MESSAGE_CONSUMERS_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-message_consumers") | .address' "manifest_sepolia.json")

if [ -z "$MESSAGE_CONSUMERS_ADDR" ]; then
    echo "Error: Could not find address for tag 'nums-message_consumers'"
    exit 1
fi

TOKENS_DIR="$SCRIPT_DIR/../tokens"
cd "$TOKENS_DIR" || {
    echo "Error: Could not change to tokens directory at $TOKENS_DIR"
    exit 1
}

OWNER_ADDR="0x54f2b25070d70d49f1c1f7c10ef2639889fdac15894d3fba1a03caf5603eca3"
UDC_DEPLOYER_ADDR="0x041a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf"
NUMS_TOKEN_CLASS="0x033c310430ce63763c6faca4b1d0f489e5e2cfe87c12ba5850255e7088ef75f8"
STARKNET_L2_RPC="https://api.cartridge.gg/x/starknet/sepolia"

echo "Message consumers address: $MESSAGE_CONSUMERS_ADDR"

# echo "starkli declare target/dev/nums_tokens_NumsToken.contract_class.json --rpc $STARKNET_L2_RPC --compiler-version 2.9.1"

# starkli declare target/dev/nums_tokens_NumsToken.contract_class.json --rpc $STARKNET_L2_RPC --compiler-version 2.9.1
# sleep 1
starkli deploy $NUMS_TOKEN_CLASS $OWNER_ADDR $MESSAGE_CONSUMERS_ADDR --rpc $STARKNET_L2_RPC --salt 0x1337

