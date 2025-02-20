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

# Piltover address
STARKNET_MESSENGER_ADDR="0x4fd6c2c5b197704474f1b292b55ef32402fa3f2c623536197271dffd6664451"
NUMS_TOKEN_ADDR="0x735856330be19e6f39e277ebd39f9312f636b345fba0e44654dd0f5826a5cd0"

CONFIG_ACTIONS_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-config_actions") | .address' "$JSON_FILE")
JACKPOT_ACTIONS_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-jackpot_actions") | .address' "$JSON_FILE")
MESSAGE_CONSUMERS_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-message_consumers") | .address' "$JSON_FILE")

if [ -z "$CONFIG_ACTIONS_ADDR" ]; then
    echo "Error: Could not find address for tag 'nums-config_actions'"
    exit 1
fi

if [ -z "$JACKPOT_ACTIONS_ADDR" ]; then
    echo "Error: Could not find address for tag 'nums-jackpot_actions'"
    exit 1
fi

if [ -z "$MESSAGE_CONSUMERS_ADDR" ]; then
    echo "Error: Could not find address for tag 'nums-message_consumers'"
    exit 1
fi

WORLD_ADDR=$(jq -r '.world.address' "$JSON_FILE")

# Check if WorldContract address was found
if [ -z "$WORLD_ADDR" ]; then
    echo "Error: Could not find WorldContract address"
    exit 1
fi

APPCHAIN_DOJO_DIR="$SCRIPT_DIR/../../appchain"
# Change to appchain directory
cd "$APPCHAIN_DOJO_DIR" || {
    echo "Error: Could not change to appchain directory at $APPCHAIN_DOJO_DIR"
    exit 1
}

# Path to the TOML file
SLOT_JSON_FILE="manifest_slot.json"

# Check if the TOML file exists
if [ ! -f "$SLOT_JSON_FILE" ]; then
    echo "Error: slot JSON file not found at $JSON_FILE"
    exit 1
fi

APPCHAIN_HANDLER_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-message_handlers") | .address' "$SLOT_JSON_FILE")
APPCHAIN_CLAIMER_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-claim_actions") | .address' "$SLOT_JSON_FILE")



echo "CONFIG_ACTIONS_ADDR: $CONFIG_ACTIONS_ADDR"
echo "JACKPOT_ACTIONS_ADDR: $JACKPOT_ACTIONS_ADDR"
echo "MESSAGE_CONSUMERS_ADDR: $MESSAGE_CONSUMERS_ADDR"
echo "APPCHAIN_HANDLER_ADDR: $APPCHAIN_HANDLER_ADDR"
echo "APPCHAIN_CLAIMER_ADDR: $APPCHAIN_CLAIMER_ADDR"

if [ -z "$APPCHAIN_HANDLER_ADDR" ]; then
    echo "Error: Could not find address for tag 'nums-message_handlers'"
    exit 1
fi

if [ -z "$APPCHAIN_CLAIMER_ADDR" ]; then
    echo "Error: Could not find address for tag 'nums-claim_actions'"
    exit 1
fi

cd "$STARKNET_DOJO_DIR"

echo "Profile name: $PROFILE_NAME"

# Get current block time and convert to Unix timestamp, then add 1 minute
BLOCK_TIME=$(starkli block-time --rpc https://api.cartridge.gg/x/nums-appchain/katana)
# First convert to Unix timestamp, then add 60 seconds
BASE_TIME=$(date -d "$(echo $BLOCK_TIME | cut -d'+' -f1)+0000" "+%s")
GAME_EXPIRATION=$((BASE_TIME + 1286400))

echo "Game expiration: $GAME_EXPIRATION"

# Execute commands based on the provided command
case "$COMMAND" in
    set_config)
        echo "Config actions address: $CONFIG_ACTIONS_ADDR"
        echo "Appchain handler address: $APPCHAIN_HANDLER_ADDR"
        echo "Appchain claimer address: $APPCHAIN_CLAIMER_ADDR"
        sozo execute $CONFIG_ACTIONS_ADDR set_config 0 $STARKNET_MESSENGER_ADDR $MESSAGE_CONSUMERS_ADDR $CONFIG_ACTIONS_ADDR $JACKPOT_ACTIONS_ADDR $APPCHAIN_HANDLER_ADDR $APPCHAIN_CLAIMER_ADDR 0 20 1000 1 0 $GAME_EXPIRATION 0 $NUMS_TOKEN_ADDR 20 1 0x2 2 0x4 3 0x8 4 0x10 5 0x20 6 0x40 7 0x80 8 0x100 9 0x200 10 0x400 11 0x800 12 0x1000 13 0x2000 14 0x4000 15 0x8000 16 0x10000 17 0x20000 18 0x40000 19 0x80000 20 0x100000 --profile $PROFILE_NAME --world $WORLD_ADDR --fee eth
        ;;
    create_jackpot)
        TITLE="0x4e756d73204a61636b706f74" # "Nums Jackpot"
        EXPIRATION=$(( $(date +%s) + 60 )) # Current unix time + 1 minutes
        EXTENSION_TIME=0
        echo "Jackpot actions address: $JACKPOT_ACTIONS_ADDR"
        sozo execute $JACKPOT_ACTIONS_ADDR create_king_of_the_hill $TITLE $EXPIRATION $EXTENSION_TIME 1 --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    consume_claim_jackpot)
        echo "Consumer address: $MESSAGE_CONSUMERS_ADDR"
        PLAYER=$3
        sozo execute $MESSAGE_CONSUMERS_ADDR consume_claim_jackpot $PLAYER 0 0 --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    consume_claim_reward)
        echo "Consumer address: $MESSAGE_CONSUMERS_ADDR"
        PLAYER=$3
        sozo execute $MESSAGE_CONSUMERS_ADDR consume_claim_reward $PLAYER 0 1 --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    *)
        echo "Error: Unknown command '$COMMAND'"
        echo "Available commands: set_config, create_jackpot, consume_claim_jackpot, consume_claim_reward"
        exit 1
        ;;
esac
