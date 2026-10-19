#!/usr/bin/env bash
# End-of-session wrapup: append a STATUS.md line and make a local commit. Usage: ./wrapup.sh "one line"
set -euo pipefail
cd "$(dirname "$0")"
line="${1:-wrapup}"
printf '\n- %s · claimed · %s\n' "$(date +%F)" "$line" >> STATUS.md
git add -A
git commit -q -m "wrapup: $line" || true
echo "STATUS.md updated and committed: $(pwd)/STATUS.md"
