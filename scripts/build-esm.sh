#!/bin/bash
# build-esm.sh — Build a service for production
#
# Services with cross-service imports or custom Prisma generated paths
# (configurador, servicos-plataforma, cadastros) get a tsx-based loader
# that handles TypeScript at runtime — no esbuild bundling.
#
# Services with clean dependency graphs (pedido) get a full esbuild bundle.
#
# Usage: bash scripts/build-esm.sh <entry> <outfile> [extra esbuild flags...]
# Example: bash scripts/build-esm.sh server/index.ts dist/server.mjs --external:pg-boss

set -e

ENTRY="$1"
OUTFILE="$2"
shift 2

# ─── Detect if service needs tsx loader (can't be bundled) ───────────────────
USE_TSX=false
case "$ENTRY" in
  *configurador*|*servicos-plataforma*|*cadastros*)
    USE_TSX=true
    ;;
esac

if [ "$USE_TSX" = true ]; then
  OUTDIR=$(dirname "$OUTFILE")
  mkdir -p "$OUTDIR"

  # Calculate relative path from output file directory to entry file
  # Always use forward slashes (URLs require it, even on Windows)
  REL_ENTRY=$(node -e "const p=require('path'); console.log(p.relative('$OUTDIR', '$ENTRY').replace(/\\\\/g, '/'))")

  # Find the service's tsconfig (tsconfig.server.json preferred, fallback tsconfig.json)
  # Walk up from entry file to find it
  ENTRY_DIR=$(dirname "$ENTRY")
  TSCONFIG=""
  SEARCH_DIR="$ENTRY_DIR"
  while [ "$SEARCH_DIR" != "." ] && [ -n "$SEARCH_DIR" ]; do
    if [ -f "$SEARCH_DIR/tsconfig.server.json" ]; then
      TSCONFIG="$SEARCH_DIR/tsconfig.server.json"
      break
    elif [ -f "$SEARCH_DIR/tsconfig.json" ] && [ "$SEARCH_DIR" != "." ]; then
      TSCONFIG="$SEARCH_DIR/tsconfig.json"
      break
    fi
    SEARCH_DIR=$(dirname "$SEARCH_DIR")
  done

  REL_TSCONFIG=""
  TSCONFIG_LINE=""
  if [ -n "$TSCONFIG" ]; then
    REL_TSCONFIG=$(node -e "const p=require('path'); console.log(p.relative('$OUTDIR', '$TSCONFIG').replace(/\\\\/g, '/'))")
    TSCONFIG_LINE="register({ tsconfig: resolve(__dir, '${REL_TSCONFIG}') });"
  else
    TSCONFIG_LINE="register();"
  fi

  cat > "$OUTFILE" << LOADER
// Auto-generated tsx loader — do not edit
// Services with cross-service imports or custom Prisma paths cannot be
// bundled by esbuild. This loader uses Node.js module hooks to handle
// TypeScript imports at runtime via tsx.
import { register } from 'tsx/esm/api';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const __dir = dirname(fileURLToPath(import.meta.url));
${TSCONFIG_LINE}
await import(new URL('${REL_ENTRY}', import.meta.url).href);
LOADER

  echo "[build-esm] tsx loader created at $OUTFILE -> $REL_ENTRY"
  exit 0
fi

# ─── esbuild bundle (for services with clean dependency graphs) ──────────────

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

echo "[build-esm] esbuild bundle created at $OUTFILE"
