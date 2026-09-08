#!/usr/bin/env bash
# Rebuild ../counterspell-web and copy its dist into ./counterspell (the embedded demo).
set -euo pipefail
cd "$(dirname "$0")/.."
( cd ../counterspell-web && npm run build )
rm -rf counterspell
cp -r ../counterspell-web/dist counterspell
echo "counterspell/ synced from ../counterspell-web/dist ($(ls counterspell/replays | grep -c json) recording files)"
