#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
APPCHAIN_DIR="$SCRIPT_DIR/.."

if [ $# -lt 2 ]; then
    echo "Error: Please provide a command and a profile name"
    echo "Usage: $0 [create|delete] <profile_name>"
    exit 1
fi

COMMAND=$1
PROFILE_NAME=$2
SLOT_PROJECT="nums-starknet"

JSON_FILE="$SCRIPT_DIR/../dojo/manifest_$PROFILE_NAME.json"

# Check if the TOML file exists
if [ ! -f "$JSON_FILE" ]; then
    echo "Error: JSON file not found at $JSON_FILE"
    exit 1
fi

WORLD_ADDR=$(jq -r '.world.address' "$JSON_FILE")

# Check if WorldContract address was found
if [ -z "$WORLD_ADDR" ]; then
    echo "Error: Could not find WorldContract address"
    exit 1
fi

case $COMMAND in
    "create")
        slot d create $SLOT_PROJECT katana --dev 
        sleep 1
        slot d create $SLOT_PROJECT torii --rpc https://api.cartridge.gg/x/$SLOT_PROJECT/katana --world $WORLD_ADDR
        ;;
    "delete")
        slot d delete $SLOT_PROJECT torii -f
        slot d delete $SLOT_PROJECT katana -f
        ;;
    *)
        echo "Invalid command. Use: create or delete"
        exit 1
        ;;
esac