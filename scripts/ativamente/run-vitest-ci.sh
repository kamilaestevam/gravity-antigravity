#!/usr/bin/env bash
# run-vitest-ci.sh
#
# Roda cada vitest.config.ts em testes/ com seu escopo próprio.
# Falha o CI se qualquer suíte falhar — evita `npx vitest run` bare que
# coleta __tests__ espalhados sem aliases e quebra o deploy inteiro.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

mapfile -t CONFIGS < <(find testes -name 'vitest.config.ts' | sort)

if [ "${#CONFIGS[@]}" -eq 0 ]; then
  echo "[run-vitest-ci] Nenhum vitest.config.ts encontrado em testes/"
  exit 1
fi

echo "[run-vitest-ci] ${#CONFIGS[@]} suíte(s) de teste"

FAILED=0
for cfg in "${CONFIGS[@]}"; do
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "[run-vitest-ci] $cfg"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if ! npx vitest run --config "$cfg" --reporter=verbose; then
    FAILED=$((FAILED + 1))
  fi
done

if [ "$FAILED" -gt 0 ]; then
  echo ""
  echo "[run-vitest-ci] ❌ $FAILED suíte(s) falharam"
  exit 1
fi

echo ""
echo "[run-vitest-ci] ✅ Todas as suítes passaram"
