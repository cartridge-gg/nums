#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
STARKNET_DOJO_DIR="$SCRIPT_DIR/../dojo"

cd "$STARKNET_DOJO_DIR" || {
    echo "Error: Could not change to dojo directory at $STARKNET_DOJO_DIR"
    exit 1
}

MESSAGE_CONSUMERS_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-message_consumers") | .address' "manifest_dev.json")

if [ -z "$MESSAGE_CONSUMERS_ADDR" ]; then
    echo "Error: Could not find address for tag 'nums-message_consumers'"
    exit 1
fi

TOKENS_DIR="$SCRIPT_DIR/../tokens"
cd "$TOKENS_DIR" || {
    echo "Error: Could not change to tokens directory at $TOKENS_DIR"
    exit 1
}

UDC_DEPLOYER_ADDR="0x041a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf"
NUMS_TOKEN_CLASS="0x02f15829117137de13516250cb5480b394531f18878e84893c5308f05b0a0c62"
STARKNET_L2_RPC="http://0.0.0.0:2222"

echo "Message consumers address: $MESSAGE_CONSUMERS_ADDR"

starkli declare target/dev/nums_tokens_NumsToken.contract_class.json --rpc $STARKNET_L2_RPC --account katana-0 --compiler-version 2.8.5 
sleep 1
starkli invoke $UDC_DEPLOYER_ADDR deployContract $NUMS_TOKEN_CLASS 0x6e756d73 0x0 0x1 $MESSAGE_CONSUMERS_ADDR --account katana-0

