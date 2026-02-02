#!/usr/bin/env bash
# Find 5 consecutive available ports for a consciousness instance
# Usage: ./find-ports.sh [start_port]
#        Returns the base port (5 consecutive ports will be used)
set -euo pipefail

START_PORT="${1:-18789}"
MAX_PORT=65530

check_port_available() {
  local port=$1
  ! lsof -ti :$port >/dev/null 2>&1
}

check_five_available() {
  local base=$1
  for i in 0 1 2 3 4; do
    local port=$((base + i))
    if ! check_port_available $port; then
      return 1
    fi
  done
  return 0
}

# Search for 5 consecutive available ports
port=$START_PORT
while [ $port -lt $MAX_PORT ]; do
  if check_five_available $port; then
    echo $port
    exit 0
  fi
  port=$((port + 1))  # Slide by 1 to find first available block
done

echo "No 5 consecutive ports available starting from $START_PORT" >&2
exit 1
