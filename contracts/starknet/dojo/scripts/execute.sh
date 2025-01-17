#!/bin/bash

# Check if command and profile name are provided
if [ $# -lt 2 ]; then
    echo "Error: Please provide a command and a profile name"
    echo "Usage: $0 <command> <profile_name>"
    echo "Commands: set_config"
    exit 1
fi

# Get the command and profile name from the command line arguments
COMMAND="$1"
PROFILE_NAME="$2"
TOKEN_ADDR="$3"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Path to the TOML file
JSON_FILE="$SCRIPT_DIR/../manifest_$PROFILE_NAME.json"

# Check if the TOML file exists
if [ ! -f "$JSON_FILE" ]; then
    echo "Error: JSON file not found at $JSON_FILE"
    exit 1
fi

# Find the address where tag = "nums-game_actions"
CONFIG_ACTIONS_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-config_actions") | .address' "$JSON_FILE")


if [ -z "$CONFIG_ACTIONS_ADDR" ]; then
    echo "Error: Could not find address for tag 'nums-config_actions'"
    exit 1
fi

WORLD_ADDR=$(jq -r '.world.address' "$JSON_FILE")

# Check if WorldContract address was found
if [ -z "$WORLD_ADDR" ]; then
    echo "Error: Could not find WorldContract address"
    exit 1
fi

PILTOVER_ADDR="0x03df9031d9c01ea8f3104593d8340ae12e755af0aa6a0a2cbcf5620cb78614bf"
APPCHAIN_MESSAGE_HANDLER_ADDR="0x00d2a11b4cc83176d25270621b93fd208b94e5d6f9c7837234b98b2020224dd9"
APPCHAIN_SELECTOR="0x01da3edff9ce6947fbb72a3f32ef3d6d42ba492aebe47e1a4e73b9245686ea60"

# Execute commands based on the provided command
case "$COMMAND" in
    set_config)
        echo "Profile name: $PROFILE_NAME"
        echo "Config actions address: $CONFIG_ACTIONS_ADDR"
        # no rewards
        if [ -z "$TOKEN_ADDR" ]; then
            sozo execute $CONFIG_ACTIONS_ADDR set_config 0 0 20 1000 1 1 $PILTOVER_ADDR $APPCHAIN_MESSAGE_HANDLER_ADDR $APPCHAIN_SELECTOR --profile $PROFILE_NAME --world $WORLD_ADDR --fee eth
        else
            sozo execute $CONFIG_ACTIONS_ADDR set_config -- -c 0,0,20,1000,1,0,$TOKEN_ADDR,9,10,1,13,2,14,4,15,8,16,16,17,32,18,64,19,128,20,256 --profile $PROFILE_NAME --world $WORLD_ADDR
        fi
        ;;
esac