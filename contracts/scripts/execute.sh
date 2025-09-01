#!/bin/bash

# Check if command and profile name are provided
if [ $# -lt 2 ]; then
    echo "Error: Please provide a command and a profile name"
    echo "Usage: $0 <command> <profile_name>"
    echo "Commands: create_game, end_game, set_slot, king_me, claim_jackpot, claim_reward"
    exit 1
fi

# Get the command and profile name from the command line arguments
COMMAND="$1"
PROFILE_NAME="$2"

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
GAME_ACTIONS_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-game_actions") | .address' "$JSON_FILE")
CLAIM_ACTIONS_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-claim_actions") | .address' "$JSON_FILE")
JACKPOT_ACTIONS_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-jackpot_actions") | .address' "$JSON_FILE")

REWARD_ADDR=$(jq -r '.contracts[] | select(.tag == "nums-MockRewardToken") | .address' "$JSON_FILE")

if [ -z "$GAME_ACTIONS_ADDR" ]; then
    echo "Error: Could not find address for tag 'nums-game_actions'"
    exit 1
fi

WORLD_ADDR=$(jq -r '.world.address' "$JSON_FILE")

# Check if WorldContract address was found
if [ -z "$WORLD_ADDR" ]; then
    echo "Error: Could not find WorldContract address"
    exit 1
fi

# Execute commands based on the provided command
case "$COMMAND" in
    create_king_of_the_hill)
        EXPIRATION=$(($(date +%s) + 600))
        EXTENSION=100
        echo $EXPIRATION
        echo "Creating king of the hill for profile: $PROFILE_NAME"
        sozo execute $JACKPOT_ACTIONS_ADDR create_king_of_the_hill sstr:"King of the hill"  $EXPIRATION $EXTENSION 0x1 --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    create_game)
        echo "Creating game for profile: $PROFILE_NAME"
        sozo execute $GAME_ACTIONS_ADDR create_game 1 --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    set_slot)
        GAME_ID=$3
        SLOT_IDX=$4
        echo "Setting slot for profile: $PROFILE_NAME"
        sozo execute $GAME_ACTIONS_ADDR set_slot $GAME_ID $SLOT_IDX --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    end_game)
        GAME_ID=$3
        echo "Ending game for profile: $PROFILE_NAME"
        sozo execute $GAME_ACTIONS_ADDR end_game $GAME_ID --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    king_me)
        GAME_ID=$3
        echo "Kinging me for profile: $PROFILE_NAME"
        sozo execute $GAME_ACTIONS_ADDR king_me $GAME_ID --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    claim_jackpot)
        GAME_ID=$3
        echo "Claiming jackpot for profile: $PROFILE_NAME"
        sozo execute $CLAIM_ACTIONS_ADDR claim_jackpot $GAME_ID --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    claim_reward)
        echo "Claiming reward for profile: $PROFILE_NAME"
        sozo execute $CLAIM_ACTIONS_ADDR claim_reward --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    *)
        echo "Error: Unknown command '$COMMAND'"
        echo "Available commands: create_game, set_slot, king_me, claim_jackpot, claim_reward"
        exit 1
        ;;
esac