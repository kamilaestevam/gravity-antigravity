# Plano de Teste em Tela — Pedido / Lista / Editar e Salvar

**ID:** TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001  
**Data:** 2026-06-06  
**Versão:** 2.0  
**Criticidade:** alta  
**Skill:** `skills/testes/teste-em-tela/SKILL.md`  
**Status:** Aguardando aprovação do dono

**Escopo pasta:** `testes/testes-em-tela/pedido/lista/editar-salvar/`  
**Plano + runner:** `plano-de-teste/` (este arquivo + `run-lista-editar-salvar.ts`)  
**Prints:** `../resultado-teste/<runId>/` — uma pasta por execução

---

## Resumo executivo

Validação visual com Playwright na **Lista de Pedidos**: edição inline e salvar do **número do pedido** e do **Part Number do item** na coluna **Nº PEDIDO / Nº ITEM**, incluindo alerta no pedido quando dois itens compartilham o mesmo Part Number.

---

## Plano do teste

```
Produto: Pedido
URL: https://usegravity.com.br/pedido/pedidos/lista
Coluna alvo: Nº PEDIDO / Nº ITEM (pedido → numero_pedido | item → part_number)
Critério de sucesso: toasts de sucesso nas edições + alerta âmbar após duplicata de Part Number (APROVADO = alerta visível; reprovado = alerta ausente)

Contrato EMT (SSOT): `data-testid="lista-alerta-part-number-duplicado-pedido"` (linha pai) e `lista-alerta-part-number-duplicado-item` (itens). Fallback do runner: ícone `svg` na célula `data-gtv-campo="numero_pedido"`.
```

---

## Prints planejados

| # | Arquivo | Estado capturado |
|---|---------|------------------|
| 01 | `01-pos-login.png` | Hub/pós-login |
| 02 | `02-lista-carregada.png` | Lista aberta — pedido expandido com itens visíveis |
| 03 | `03-editar-pedido-numero-sucesso.png` | Edição do **número do pedido** (coluna Nº PEDIDO / Nº ITEM, linha pai) salva |
| 04 | `04-editar-item-part-number-sucesso.png` | Edição do **Part Number** do 1º item (mesma coluna, linha filho) salva |
| 05 | `05-alerta-part-number-duplicado-pedido.png` | 2º item com mesmo Part Number → **alerta no pedido** (ícone âmbar) |
| 99 | `99-erro.png` | Só se falhar |

Viewport: **1440×900** (fixo)

---

## Roteiro de execução

### ETAPA 0 — Preparação
1. Confirmar ambiente (Produção: `https://usegravity.com.br` ou dev `localhost:8000`)
2. Runner cria `resultado-teste/<EMT_RUN_ID>/` automaticamente
3. Login com credenciais org de teste → print `01-pos-login.png`

### ETAPA 1 — Lista (editar e salvar)
1. Navegar `https://usegravity.com.br/pedido/pedidos/lista`
2. Expandir um pedido com **≥2 itens**; confirmar grade pai + filhos → print `02-lista-carregada.png`
3. Editar **número do pedido** na coluna **Nº PEDIDO / Nº ITEM** (linha pai, campo `numero_pedido`) e salvar — toast de sucesso → print `03-editar-pedido-numero-sucesso.png`
4. Editar **Part Number** do **primeiro item** na mesma coluna (linha filho, campo `part_number`) e salvar — toast de sucesso → print `04-editar-item-part-number-sucesso.png`
5. Editar **segundo item** com o **mesmo Part Number** do primeiro item e salvar — **APROVADO** quando existirem ≥2 itens com o mesmo PN **e** ícone âmbar visível no pedido pai e/ou nos itens (tooltip: “Existem itens com o mesmo Part Number neste pedido”) → print `05-alerta-part-number-duplicado-pedido.png`

### ETAPA 2 — Relatório
1. Gerar `RESULTADO.txt`:

```
TESTE EM TELA — lista-editar-salvar
Data: 2026-06-06
Produto: Pedido | URL: /pedido/pedidos/lista
Pasta: testes/testes-em-tela/pedido/lista/editar-salvar/resultado-teste/<runId>/

Resultado: PASSOU / FALHOU
```

---

## Diferença vs E2E

| | Este plano (EMT) | Plano E2E |
|--|------------------|-----------|
| Entrega | PNG + RESULTADO.txt | `.spec.ts` + CI |
| Assertivas | Manual/visual | `expect()` automatizado |
| Quando | Homologação pós-deploy | Regressão contínua |

---

## Execução

```bash
npx tsx testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-lista-editar-salvar.ts
```
