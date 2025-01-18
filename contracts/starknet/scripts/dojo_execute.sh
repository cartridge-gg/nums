#!/bin/bash

# Check if command and profile name are provided
if [ $# -lt 2 ]; then
    echo "Error: Please provide a command and a profile name"
    echo "Usage: $0 <command> <profile_name>"
    echo "Commands: set_config, create_jackpot"
    exit 1
fi

# Get the command and profile name from the command line arguments
COMMAND="$1"
PROFILE_NAME="$2"
TOKEN_ADDR="$3"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
DOJO_DIR="$SCRIPT_DIR/../dojo"

# Change to dojo directory
cd "$DOJO_DIR" || {
    echo "Error: Could not change to dojo directory at $DOJO_DIR"
    exit 1
}

# Path to the TOML file
JSON_FILE="manifest_$PROFILE_NAME.json"

# Check if the TOML file exists
if [ ! -f "$JSON_FILE" ]; then
    echo "Error: JSON file not found at $JSON_FILE"
    exit 1
fi

# Find the address where tag = "nums-game_actions"
CONFIG_ACTIONS_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-config_actions") | .address' "$JSON_FILE")
JACKPOT_ACTIONS_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-jackpot_actions") | .address' "$JSON_FILE")

if [ -z "$CONFIG_ACTIONS_ADDR" ]; then
    echo "Error: Could not find address for tag 'nums-config_actions'"
    exit 1
fi

if [ -z "$JACKPOT_ACTIONS_ADDR" ]; then
    echo "Error: Could not find address for tag 'nums-jackpot_actions'"
    exit 1
fi

WORLD_ADDR=$(jq -r '.world.address' "$JSON_FILE")

# Check if WorldContract address was found
if [ -z "$WORLD_ADDR" ]; then
    echo "Error: Could not find WorldContract address"
    exit 1
fi

PILTOVER_ADDR="0x03df9031d9c01ea8f3104593d8340ae12e755af0aa6a0a2cbcf5620cb78614bf"
APPCHAIN_MESSAGE_HANDLER_ADDR="0x047465e44f2786242f1399d27fc88d1547db60518914e1653ca49a0218bc02a0"
APPCHAIN_CONFIG_SELECTOR="0x01da3edff9ce6947fbb72a3f32ef3d6d42ba492aebe47e1a4e73b9245686ea60"
APPCHAIN_JACKPOT_SELECTOR="0x01823f61dad7acc9cbad9851d1fc09a3642eb3c83ad76070deff1d6cba7aad1c"

echo "Profile name: $PROFILE_NAME"

# Execute commands based on the provided command
case "$COMMAND" in
    set_config)
        echo "Config actions address: $CONFIG_ACTIONS_ADDR"
        if [ -z "$TOKEN_ADDR" ]; then
            # no rewards
            sozo execute $CONFIG_ACTIONS_ADDR set_config 0 0 20 1000 1 1 $PILTOVER_ADDR $APPCHAIN_MESSAGE_HANDLER_ADDR $APPCHAIN_CONFIG_SELECTOR --profile $PROFILE_NAME --world $WORLD_ADDR --fee eth
        else
            sozo execute $CONFIG_ACTIONS_ADDR set_config 0 0 20 1000 1 0 $TOKEN_ADDR 9 10 1 13 2 14 4 15 8 16 16 17 32 18 64 19 128 20 256 --profile $PROFILE_NAME --world $WORLD_ADDR
        fi
        ;;
    create_jackpot)
        TITLE="0x4e756d73204a61636b706f74" # "Nums Jackpot"
        EXPIRATION=$(( $(date +%s) + 3600 )) # Current unix time + 1 hour
        EXTENSION_TIME=0
        echo "Jackpot actions address: $JACKPOT_ACTIONS_ADDR"
        sozo execute $JACKPOT_ACTIONS_ADDR create_king_of_the_hill $TITLE $EXPIRATION $EXTENSION_TIME 1 $PILTOVER_ADDR $APPCHAIN_MESSAGE_HANDLER_ADDR $APPCHAIN_JACKPOT_SELECTOR --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    *)
        echo "Error: Unknown command '$COMMAND'"
        echo "Available commands: set_config, create_jackpot"
        exit 1
        ;;
esac
