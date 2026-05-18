#!/bin/bash
# build-esm.sh — Build a service with esbuild in ESM format
# with CJS compatibility shims for __dirname, __filename, require()
#
# Usage: bash scripts/build-esm.sh <entry> <outfile> [extra esbuild flags...]
# Example: bash scripts/build-esm.sh server/index.ts dist/server.mjs --external:pg-boss

set -e

ENTRY="$1"
OUTFILE="$2"
shift 2

BANNER='import { createRequire } from "module"; import { fileURLToPath as __fileURLToPath } from "url"; import { dirname as __dirnameFn } from "path"; const require = createRequire(import.meta.url); const __filename = __fileURLToPath(import.meta.url); const __dirname = __dirnameFn(__filename);'

npx esbuild "$ENTRY" \
  --bundle \
  --platform=node \
  --target=node20 \
  --format=esm \
  --outfile="$OUTFILE" \
  --external:@prisma/client \
  --external:@prisma/engines \
  --banner:js="$BANNER" \
  "$@"
