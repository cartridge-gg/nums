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
STARKNET_DOJO_DIR="$SCRIPT_DIR/../dojo"

# Change to dojo directory
cd "$STARKNET_DOJO_DIR" || {
    echo "Error: Could not change to dojo directory at $STARKNET_DOJO_DIR"
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
MESSAGE_HANDLERS_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-message_handlers") | .address' "$JSON_FILE")

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

STARKNET_MESSENGER_ADDR="0x03df9031d9c01ea8f3104593d8340ae12e755af0aa6a0a2cbcf5620cb78614bf"
STARKNET_CONSUMER_ADDR="0x05534f5e0d53fa29550fee451243f2b48b643b7bf98c904d3937b549e3812f52"

APPCHAIN_DOJO_DIR="$SCRIPT_DIR/../../appchain"
# Change to appchain directory
cd "$APPCHAIN_DOJO_DIR" || {
    echo "Error: Could not change to appchain directory at $APPCHAIN_DOJO_DIR"
    exit 1
}

APPCHAIN_HANDLER_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-message_handlers") | .address' "$JSON_FILE")
APPCHAIN_CLAIMER_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-claim_actions") | .address' "$JSON_FILE")

cd "$STARKNET_DOJO_DIR"

echo "Profile name: $PROFILE_NAME"

# Execute commands based on the provided command
case "$COMMAND" in
    set_config)
        echo "Config actions address: $CONFIG_ACTIONS_ADDR"
        echo "Appchain handler address: $APPCHAIN_HANDLER_ADDR"
        echo "Appchain claimer address: $APPCHAIN_CLAIMER_ADDR"
        if [ -z "$TOKEN_ADDR" ]; then
            # no rewards
            sozo execute $CONFIG_ACTIONS_ADDR set_config 0 $STARKNET_MESSENGER_ADDR $STARKNET_CONSUMER_ADDR $APPCHAIN_HANDLER_ADDR $APPCHAIN_CLAIMER_ADDR 0 20 1000 1 1 --profile $PROFILE_NAME --world $WORLD_ADDR --fee eth
        else
            sozo execute $CONFIG_ACTIONS_ADDR set_config 0 $STARKNET_MESSENGER_ADDR $STARKNET_CONSUMER_ADDR $APPCHAIN_HANDLER_ADDR $APPCHAIN_CLAIMER_ADDR 0 20 1000 1 0 $TOKEN_ADDR 9 10 1 13 2 14 4 15 8 16 16 17 32 18 64 19 128 20 256 --profile $PROFILE_NAME --world $WORLD_ADDR --fee eth
        fi
        ;;
    create_jackpot)
        TITLE="0x4e756d73204a61636b706f74" # "Nums Jackpot"
        EXPIRATION=$(( $(date +%s) + 60 )) # Current unix time + 1 minutes
        EXTENSION_TIME=0
        echo "Jackpot actions address: $JACKPOT_ACTIONS_ADDR"
        sozo execute $JACKPOT_ACTIONS_ADDR create_king_of_the_hill $TITLE $EXPIRATION $EXTENSION_TIME 1 --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    consume_claim)
        echo "Jackpot actions address: $STARKNET_CONSUMER_ADDR"
        PLAYER=$3
        sozo execute $STARKNET_CONSUMER_ADDR consume_claim_jackpot $PLAYER 0 0 --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    *)
        echo "Error: Unknown command '$COMMAND'"
        echo "Available commands: set_config, create_jackpot, consume_claim_jackpot"
        exit 1
        ;;
esac
