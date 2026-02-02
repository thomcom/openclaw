#!/usr/bin/env bash
# Stop all consciousness layers
set -euo pipefail

echo "=== Stopping AgentiConsciousness Layers ==="
echo ""

# Find and kill all layer processes
for port in 18789 18790 18791 18792 18793; do
  pids=$(lsof -ti :$port 2>/dev/null | sort -u || true)
  if [ -n "$pids" ]; then
    layer=""
    case $port in
      18789) layer="gateway" ;;
      18790) layer="l1" ;;
      18791) layer="l2" ;;
      18792) layer="core-a" ;;
      18793) layer="core-b" ;;
    esac
    # Get unique PID (may have duplicates for IPv4/IPv6)
    unique_pid=$(echo "$pids" | head -1)
    echo "Stopping $layer (port $port, PID $unique_pid)..."
    for pid in $pids; do
      kill "$pid" 2>/dev/null || true
    done
  fi
done

echo ""
echo "=== All Layers Stopped ==="
