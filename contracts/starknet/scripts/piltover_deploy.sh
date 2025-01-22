#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PILTOVER_DIR="$SCRIPT_DIR/../piltover"

cd "$PILTOVER_DIR" || {
    echo "Error: Could not change to piltover directory at $PILTOVER_DIR"
    exit 1
}

PILTOVER_CLASS_ADDR="0x0034c8b964ac018ee916398fdb59b5d1ad5946f23309bdac7b22db25b6c3e879"
STARKNET_L2_RPC="https://api.cartridge.gg/x/nums-starknet/katana"

starkli declare target/dev/piltover_appchain.contract_class.json --rpc $STARKNET_L2_RPC --account katana-0 --compiler-version 2.8.5
sleep 1
starkli deploy $PILTOVER_CLASS_ADDR --rpc $STARKNET_L2_RPC --account katana-0 --salt 0x1234 0 0 0 0