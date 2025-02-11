#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PILTOVER_DIR="$SCRIPT_DIR/../piltover"

cd "$PILTOVER_DIR" || {
    echo "Error: Could not change to piltover directory at $PILTOVER_DIR"
    exit 1
}

PILTOVER_CLASS_ADDR="0x07e32e97ad7d1809358418ec553d61d0f537fba13d5b8ac3aa479ec9c632ef95"
STARKNET_L2_RPC="https://api.cartridge.gg/x/nums-starknet-demo/katana"

starkli declare target/dev/piltover_appchain.contract_class.json --rpc $STARKNET_L2_RPC --account katana-0 --compiler-version 2.9.1
sleep 1
starkli deploy $PILTOVER_CLASS_ADDR --rpc $STARKNET_L2_RPC --account katana-0 --salt 0x1234 0x1234 0 0 0