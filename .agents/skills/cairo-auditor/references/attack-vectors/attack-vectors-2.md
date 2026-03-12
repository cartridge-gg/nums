# Cairo Attack Vectors (2/4): External Calls + Reentrancy + Messaging

**21. CEI violation on ERC1155 transfer path**
- **D:** state mutation happens after `safe_transfer_from` (directly or through helper chain).
- **FP:** critical state committed before interaction or robust non-reentrant guard blocks re-entry.

**22. Session self-call hazard**
- **D:** session execution loop permits calls to account contract itself.
- **FP:** explicit self-target block plus policy constraints prevent self-call.

**23. Selector fallback assumption**
- **D:** on syscall error, logic retries alternate selector and masks root failure.
- **FP:** single canonical selector with fail-fast behavior.

**24. Untrusted callback caller**
- **D:** callback handler mutates state without validating caller contract identity.
- **FP:** callback explicitly pinned to expected contract address.

**25. External call proxy without target constraints**
- **D:** privileged function forwards arbitrary `call_contract_syscall` target/selector/calldata.
- **FP:** strict allowlist, Merkle policy verification, or immutable target set.

**26. Cross-function reentrancy window**
- **D:** helper performs interaction; parent updates critical state after helper returns.
- **FP:** shared lock or state update-before-interaction across entire call chain.

**27. Transfer consistency mismatch**
- **D:** one transfer primitive disabled while equivalent primitive remains enabled (ForgeYields redeem NFT pattern).
- **FP:** mismatch is intentional and protected by additional invariants.

**28. Caller-controlled reward contract invocation**
- **D:** harvest/claim path takes arbitrary reward contract and invokes it.
- **FP:** caller and reward contract are both tightly policy-constrained.

**29. L1/L2 message replay gap**
- **D:** consumed message nonce/hash not tracked, allowing repeated processing.
- **FP:** replay set keyed by unique message hash and nonce.

**30. Callback state confusion with stale flags**
- **D:** callback logic depends on flags written only after interaction.
- **FP:** callback preconditions are finalized before external call.

**31. Fee-transfer call result ignored**
- **D:** transfer return value ignored and state progresses as if payment succeeded.
- **FP:** transfer failure reverts before state transition.

**32. External denial path swallowed**
- **D:** external call failures are caught/logged but execution continues into state writes.
- **FP:** denial path reverts or compensates with full rollback.

**33. ERC721 callback reentrancy on order fill**
- **D:** `transfer_from`/`safe_transfer_from` to callback-capable recipient happens before order status commit.
- **FP:** order status or nonce invariant prevents same-order reentry before callback.

**34. Fee-on-transfer token accounting drift**
- **D:** logic assumes nominal transfer amount equals received amount on external token call.
- **FP:** post-transfer balance delta is used for accounting.

**35. Message cancellation timestamp overwrite**
- **D:** repeated cancellation start overwrites prior timestamp and weakens timeout assumptions.
- **FP:** first cancellation timestamp is immutable or monotonic.

**36. Cross-domain origin verification missing**
- **D:** L1/L2 handler validates payload but not expected sender/domain binding.
- **FP:** explicit sender/domain hash verification in message path.

**37. Library-call target controlled by user input**
- **D:** `library_call`/dispatcher target derives from user-controlled path without allowlist.
- **FP:** target selector pair pinned to immutable registry.

**38. External decoder response schema trust**
- **D:** external decoder/sanitizer output is accepted without shape/value validation.
- **FP:** strict schema and bounds checks on returned payload.

**39. Cross-contract call succeeds with wrong selector casing fallback**
- **D:** retrying camelCase/snake_case on failure accidentally invokes unintended function.
- **FP:** explicit ABI mapping known at compile-time with no runtime selector fallback.

**40. Event emission before interaction finality**
- **D:** event logs success before external call outcome is known, confusing off-chain automation.
- **FP:** success events emitted only after all critical interactions and writes succeed.

**91. L1 handler replay by weak message keying**
- **D:** L1 handler marks processed messages with incomplete key material (missing nonce/sender/value domain).
- **FP:** replay key includes full domain-separated message identity.

**92. Dispatcher callback reentrancy via trusted adapter**
- **D:** adapter marked trusted can still re-enter caller path before state finalization.
- **FP:** reentrancy lock/effects-first invariant spans adapter callback boundaries.

**93. External return decoding without length validation**
- **D:** call result is decoded into struct/tuple without asserting expected span length.
- **FP:** decode path validates result shape/length before interpretation.

**94. Fallback-to-default on external read failure**
- **D:** failed external read (price/balance/config) silently falls back to unsafe default and continues.
- **FP:** failed read reverts or routes to explicit fail-safe mode.

**95. Multicall order dependence on mutable shared state**
- **D:** same transaction can reorder calls to bypass per-call assumptions (auth/limits/nonce checks).
- **FP:** order-independent invariants or explicit topological restrictions are enforced.

**96. Session signature replay across bundled calls**
- **D:** one signature/nonce authorizes multiple operations without per-call binding.
- **FP:** signature domain binds call set/hash and nonce monotonicity per execution.

**97. Bridge emit-before-lock/burn inconsistency**
- **D:** outbound bridge message/event emitted before asset lock/burn is irreversible.
- **FP:** bridge side effects are emitted only after asset state commit.

**98. External call target mutable in same tx path**
- **D:** target address can be changed then used immediately in same execution path without delay.
- **FP:** target mutation and target use are separated by governance delay/checkpoint.

**99. Post-interaction authorization check**
- **D:** external interaction occurs before caller/role authorization is fully validated.
- **FP:** full auth and policy checks happen strictly before any external interaction.

**100. Error-logging without rollback in privileged path**
- **D:** privileged flow catches/logs external error but keeps partial state updates.
- **FP:** privileged path either reverts or atomically compensates all partial state.
