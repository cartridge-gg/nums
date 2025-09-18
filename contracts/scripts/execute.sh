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

DEPLOYER_ADDR=0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec

if [ $PROFILE_NAME == 'sepolia']; then
   DEPLOYER_ADDR=0x047a8bfb23061af003dc4075f611221592ece0deb7b1d5ab4fabeb6abf49bdfc
fi

# Check if WorldContract address was found
if [ -z "$WORLD_ADDR" ]; then
    echo "Error: Could not find WorldContract address"
    exit 1
fi

# Execute commands based on the provided command
case "$COMMAND" in
    create_jackpot_factory)

        echo "Minting 100_000 reward tokens..."
        sozo execute $REWARD_ADDR mint $DEPLOYER_ADDR u256:100000000000000000000000 --profile $PROFILE_NAME  --wait 
        echo "Approving jackpot_actions to spend..."
        sozo execute $REWARD_ADDR approve $JACKPOT_ACTIONS_ADDR u256:100000000000000000000000 --profile $PROFILE_NAME  --wait 

       # GAME_CONFIG="0x1" # Option::None
        GAME_CONFIG="0x0 20 999 1 2000 180" # Option::Some
        REWARDS="0x1" # Option::None
        TOKEN="0x0 $REWARD_ADDR 0x0 u256:1000000000000000000000" # 1_000 STRK / jackpot
        JACKPOT_MODE="0x0" # KingOfTheHill
        TIMING="0x0" # TimeLimited
        INITIAL_DURATION="14400" # 4h
        EXTENSION_DURATION="0"
        MIN_SLOT="5"
        MAX_WINNERS="99"
        JACKPOT_COUNT="12"
       
        echo "$NAME $TOKEN $JACKPOT_MODE $MAX_WINNERS $MIN_SLOT $EXTENSION_MODE"
        echo "Creating jackpot factory for profile: $PROFILE_NAME"
        sozo execute $JACKPOT_ACTIONS_ADDR create_jackpot_factory str:"STRK Jackpot" $GAME_CONFIG $REWARDS $TOKEN $JACKPOT_MODE $TIMING $INITIAL_DURATION $EXTENSION_DURATION $MIN_SLOT $MAX_WINNERS $JACKPOT_COUNT --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    create_jackpot_factory_2)

        echo "Minting 100_000 reward tokens..."
        sozo execute $REWARD_ADDR mint $DEPLOYER_ADDR u256:100000000000000000000000 --profile $PROFILE_NAME  --wait 
        echo "Approving jackpot_actions to spend..."
        sozo execute $REWARD_ADDR approve $JACKPOT_ACTIONS_ADDR u256:100000000000000000000000 --profile $PROFILE_NAME  --wait 

        GAME_CONFIG="0x0 20 20 1 420 120" # Option::Some
        REWARDS="0x0 20 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20" # Option::Some
        TOKEN="0x0 $REWARD_ADDR 0x0 u256:10000000000000000000000"
        JACKPOT_MODE="0x0" # KingOfTheHill
        TIMING="0x0" # TimeLimited
        INITIAL_DURATION="300"
        EXTENSION_DURATION="0"
        MIN_SLOT="5"
        MAX_WINNERS="99"
        JACKPOT_COUNT="10"
       
        echo "$NAME $TOKEN $JACKPOT_MODE $MAX_WINNERS $MIN_SLOT $EXTENSION_MODE"
        echo "Creating jackpot factory for profile: $PROFILE_NAME"
        sozo execute $JACKPOT_ACTIONS_ADDR create_jackpot_factory str:"Rigged Jackpot" $GAME_CONFIG $REWARDS $TOKEN $JACKPOT_MODE $TIMING $INITIAL_DURATION $EXTENSION_DURATION $MIN_SLOT $MAX_WINNERS $JACKPOT_COUNT --profile $PROFILE_NAME --world $WORLD_ADDR
        ;;
    rescue_jackpot)
        echo "Rescue jackpot for profile: $PROFILE_NAME"
        sozo execute $JACKPOT_ACTIONS_ADDR rescue_jackpot $3 --profile $PROFILE_NAME --world $WORLD_ADDR
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