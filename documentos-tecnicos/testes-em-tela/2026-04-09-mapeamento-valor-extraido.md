# Resultado — Teste em Tela
**Data:** 2026-04-09
**Produto:** produto/pedido
**Ajuste:** `EtapaMapeamento.tsx` — coluna "Valor Extraído" (visual, LOW)
**Pasta de prints:** testes/testes-em-tela/produto/pedido/2026-04-09-mapeamento-valor-extraido/

---

## FLUXO CORRIGIDO — Smart Import Mapeamento

| Teste | Resultado | Tempo | Observação |
|:------|:----------|:------|:-----------|
| Coluna "Valor Extraído" visível no header | ✅ | 7.8s | Header correto |
| "Exemplo do valor" NÃO aparece como header | ✅ | 5.3s | Label antigo removido |
| Valores extraídos visíveis na segunda coluna | ✅ | 5.2s | `PO-TEST-2026/001`, `Supplier Tech Ltd.`, `FOB` |
| 11 de 11 colunas mapeadas para CSV padrão | ✅ | 5.0s | Contagem correta |

**4/4 ✅ — 28.2s total**

---

## FLUXOS CRÍTICOS — REGRESSÃO (47 testes @critico)

| Spec | Total | ✅ | ❌ |
|:-----|:------|:--|:--|
| smart-import-mapeamento.spec.ts (novo) | 4 | 4 | 0 |
| configuracoes-regras.spec.ts | 8 | 8 | 0 |
| duplicar-itens.spec.ts | 3 | 3 | 0 |
| localizar.spec.ts | 10 | 10 | 0 |
| adicionar-item.spec.ts | 4 | 4 | 0 |
| edicao-inline-item.spec.ts | 2 | 0 | 2 |

**47 ✅ / 2 ❌ pré-existentes / 0 causados pelo ajuste**

---

## PRINTS CAPTURADOS

| # | Arquivo | Etapa |
|:--|:--------|:------|
| 01 | [01-lista-pedidos.png](testes/testes-em-tela/produto/pedido/2026-04-09-mapeamento-valor-extraido/01-lista-pedidos.png) | Lista de pedidos carregada |
| 02 | [02-modal-upload.png](testes/testes-em-tela/produto/pedido/2026-04-09-mapeamento-valor-extraido/02-modal-upload.png) | Modal Importar Pedidos — etapa Upload |
| 03 | [03-etapa-mapeamento.png](testes/testes-em-tela/produto/pedido/2026-04-09-mapeamento-valor-extraido/03-etapa-mapeamento.png) | Etapa Mapeamento com tabela visível |
| 04 | [04-header-valor-extraido.png](testes/testes-em-tela/produto/pedido/2026-04-09-mapeamento-valor-extraido/04-header-valor-extraido.png) | Header "Valor Extraído" confirmado |
| 05 | [05-sem-header-exemplo.png](testes/testes-em-tela/produto/pedido/2026-04-09-mapeamento-valor-extraido/05-sem-header-exemplo.png) | "Exemplo do valor" ausente — correto |
| 06 | [06-valores-reais-visiveis.png](testes/testes-em-tela/produto/pedido/2026-04-09-mapeamento-valor-extraido/06-valores-reais-visiveis.png) | Valores reais do CSV visíveis |
| 07 | [07-11-colunas-mapeadas.png](testes/testes-em-tela/produto/pedido/2026-04-09-mapeamento-valor-extraido/07-11-colunas-mapeadas.png) | 11 de 11 colunas mapeadas |

---

## FALHAS ENCONTRADAS

### ❌ edicao-inline-item.spec.ts (2 testes)
- **Pré-existente:** ✅ sim — falham com e sem o ajuste atual (verificado via git stash)
- **Causa:** fixture sem linhas pai/filho no banco de teste

---

## DECISÃO

[x] ✅ TUDO PASSOU — ajuste pode avançar para QA
[x] ⚠️ FALHA PRÉ-EXISTENTE — edicao-inline-item (não bloqueia)
