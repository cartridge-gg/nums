# Initial game creation
n_games="$1"
# use 0 if not provided
sleep_time="$2"

#
last_game_id=$(sozo call 0x07686a16189676ac3978c3b865ae7e3d625a1cd7438800849c7fd866e4b9afd1 uuid)
last_game_id=$(echo "$last_game_id" | grep -o '0x[0-9a-fA-F]*' | xargs printf "%d")

echo "Last game id: $last_game_id"

max_game_id=$((last_game_id + n_games))

echo "Creating initial games..."
for ((i=$last_game_id; i<=$max_game_id; i++)); do
    echo "Creating initial game $i"
    sozo execute game_actions create_game 1
    sozo execute game_actions set_slot "$i" 1
    if [ "$sleep_time" -gt 0 ]; then
        sleep $sleep_time
    fi
done
