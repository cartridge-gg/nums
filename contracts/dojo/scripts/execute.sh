#!/bin/bash

# Check if command and profile name are provided
if [ $# -lt 2 ]; then
    echo "Error: Please provide a command and a profile name"
    echo "Usage: $0 <command> <profile_name>"
    echo "Commands: auth, create_game, set_config"
    exit 1
fi

# Get the command and profile name from the command line arguments
COMMAND="$1"
PROFILE_NAME="$2"
TOKEN_ADDRESS="$3"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Path to the TOML file
TOML_FILE="$SCRIPT_DIR/../manifests/$PROFILE_NAME/deployment/manifest.toml"

# Check if the TOML file exists
if [ ! -f "$TOML_FILE" ]; then
    echo "Error: TOML file not found at $TOML_FILE"
    exit 1
fi

# Find the address where tag = "nums-actions"
ADDRESS=$(awk '/\[\[contracts\]\]/,/tag = "nums-actions"/ {
    if ($1 == "address" && $2 == "=") {
        gsub(/[",]/, "", $3)
        print $3
        exit
    }
}' "$TOML_FILE")

# Check if address was found
if [ -z "$ADDRESS" ]; then
    echo "Error: Could not find address for tag 'nums-actions'"
    exit 1
fi

# Find the WorldContract address
WORLD_ADDRESS=$(awk '/\[world\]/,/address =/ {
    if ($1 == "address" && $2 == "=") {
        gsub(/[",]/, "", $3)
        print $3
        exit
    }
}' "$TOML_FILE")

# Check if WorldContract address was found
if [ -z "$WORLD_ADDRESS" ]; then
    echo "Error: Could not find WorldContract address"
    exit 1
fi

# Execute commands based on the provided command
case "$COMMAND" in
    auth)
        echo "Granting authentication for profile: $PROFILE_NAME"
        sozo auth grant writer m:Name,$ADDRESS --profile $PROFILE_NAME --world $WORLD_ADDRESS
        sozo auth grant writer m:Slot,$ADDRESS --profile $PROFILE_NAME --world $WORLD_ADDRESS
        sozo auth grant writer m:Game,$ADDRESS --profile $PROFILE_NAME --world $WORLD_ADDRESS
        sozo auth grant writer m:Config,$ADDRESS --profile $PROFILE_NAME --world $WORLD_ADDRESS
        sozo auth grant writer m:Jackpot,$ADDRESS --profile $PROFILE_NAME --world $WORLD_ADDRESS
        sozo auth grant writer m:Reward,$ADDRESS --profile $PROFILE_NAME --world $WORLD_ADDRESS
        ;;
    create_game)
        echo "Creating game for profile: $PROFILE_NAME"
        sozo execute $ADDRESS create_game -c 0x1 --profile $PROFILE_NAME --world $WORLD_ADDRESS
        ;;
    set_config)
        echo "Setting config for profile: $PROFILE_NAME"
        # no rewards
        # sozo execute $ADDRESS set_config -c 0,0,20,1000,1,1 --profile $PROFILE_NAME --world $WORLD_ADDRESS
        if [ -z "$TOKEN_ADDRESS" ]; then
            sozo execute $ADDRESS set_config -c 0,0,20,1000,1,1 --profile $PROFILE_NAME --world $WORLD_ADDRESS
        else
            sozo execute $ADDRESS set_config -c 0,0,20,1000,1,0,$TOKEN_ADDRESS,9,10,1,13,2,14,4,15,8,16,16,17,32,18,64,19,128,20,256 --profile $PROFILE_NAME --world $WORLD_ADDRESS
        fi
        ;;
    *)
        echo "Error: Unknown command '$COMMAND'"
        echo "Available commands: auth, create_game, set_config"
        exit 1
        ;;
esac

echo "Command '$COMMAND' executed successfully with address: $ADDRESS for profile: $PROFILE_NAME and world: $WORLD_ADDRESS"