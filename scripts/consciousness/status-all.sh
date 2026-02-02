#!/usr/bin/env bash
# Check status of all consciousness layers
set -euo pipefail

echo "=== AgentiConsciousness Layer Status ==="
echo ""
printf "%-10s %-6s %-8s %-10s\n" "LAYER" "PORT" "PID" "STATUS"
printf "%-10s %-6s %-8s %-10s\n" "-----" "----" "---" "------"

for port in 18789 18790 18791 18792 18793; do
  case $port in
    18789) layer="gateway" ;;
    18790) layer="l1" ;;
    18791) layer="l2" ;;
    18792) layer="core-a" ;;
    18793) layer="core-b" ;;
  esac

  pid=$(lsof -ti :$port 2>/dev/null || true)

  if [ -n "$pid" ]; then
    status="✓ RUNNING"
  else
    pid="-"
    status="✗ STOPPED"
  fi

  printf "%-10s %-6s %-8s %s\n" "$layer" "$port" "$pid" "$status"
done

echo ""
echo "Adjacency: gateway <-> L1 <-> L2 <-> core-a/core-b"
echo ""
echo "=== Interaction ==="
echo ""
echo "Send message to gateway (external interface):"
echo "  ./scripts/consciousness/send.sh \"Hello, consciousness!\""
echo ""
echo "Send to specific layer:"
echo "  ./scripts/consciousness/send.sh l1 \"Message for L1\""
echo ""
echo "Web UI (gateway only):"
echo "  http://127.0.0.1:18789/__openclaw__/"
