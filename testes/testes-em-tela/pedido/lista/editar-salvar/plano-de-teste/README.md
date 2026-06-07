# TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045

| Arquivo | Função |
|---------|--------|
| `plano-teste-em-tela.md` | Roteiro e prints |
| `run-lista-editar-salvar.ts` | Runner Playwright (sequência principal) |
| `run-lista-importador-emt.ts` | Runner dedicado — coluna **IMPORTADOR** |
| `run-lista-exportador-emt.ts` | Runner dedicado — coluna **EXPORTADOR** |

Colunas cobertas:

- **Nº PEDIDO / Nº ITEM** (prints 03–05)
- **TIPO DE OPERAÇÃO** (passos **06–12**)
- **IMPORTADOR** (`nome_importador`) — ETAPA 5 · `run-lista-importador-emt.ts`
- **EXPORTADOR** (`nome_exportador`) — ETAPA 6 · `run-lista-exportador-emt.ts`
- **REFERÊNCIA IMPORTADOR** (passos **13–16**)
- **REFERÊNCIA EXPORTADOR** (passos **17–20**)
- **INCOTERM** (passos **21–24**)
- **DESCRIÇÃO DO ITEM** (passos **25–28**)
- **PORTO DE ORIGEM** (ETAPA 11 — passo **29**, sub-passos 29.1–29.5)
- **PORTO DE DESTINO** (ETAPA 12 — passo **30**, sub-passos 30.1–30.5)
- **PAÍS DE ORIGEM** (ETAPA 13 — passo **31**)
- **PAÍS DE DESTINO** (ETAPA 14 — passo **32**)
- **AEROPORTO DE ORIGEM** (ETAPA 15 — passo **33**)
- **AEROPORTO DE DESTINO** (ETAPA 16 — passo **34**)
- **NCM** (ETAPA 17 — passos **35–41**)

Resultados: `../resultado-teste/<runId>/` (PNG + `RESULTADO.txt`).

**Runners dedicados (fora do disparo Admin do plano principal):**

```bash
npx tsx testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-lista-importador-emt.ts
npx tsx testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-lista-exportador-emt.ts
```
