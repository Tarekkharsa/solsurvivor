#!/bin/sh
# Builds the game and zips it for any static host: ../solsurvivor-web.zip
set -e
cd "$(dirname "$0")/.."
npx tsc -p .
npx vite build
rm -f ../solsurvivor-web.zip
(cd dist && zip -qr ../../solsurvivor-web.zip .)
echo "Wrote $(cd .. && pwd)/solsurvivor-web.zip ($(du -h ../solsurvivor-web.zip | cut -f1))"
