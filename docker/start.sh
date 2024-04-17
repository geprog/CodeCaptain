#!/bin/bash

set -m # to make job control work
node .output/server/index.mjs --port 3000 --host 0.0.0.0 &
chroma run --path /app/data/chroma --port 8000 --host 0.0.0.0 &
fg %1 # gross!
