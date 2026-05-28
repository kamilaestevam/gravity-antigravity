# Plano de Testes Funcionais — BID Frete Internacional / Lista

**Escopo:** `BIDFRT` — rotas de cotações consumidas pela lista  
**Status:** implementado (specs em `testes/testes-funcionais/bid-frete-internacional/lista/`)  
**Data:** 26/05/2026

---

## Arquivos fonte

| Arquivo | Responsabilidade |
|---------|------------------|
| `server/src/routes/cotacoes.ts` | POST/GET — persistência para colunas da lista |

---

## Casos obrigatórios

### Workspace na criação (`cotacoes-lista-workspace.test.ts`)

| ID | Caso | Resultado esperado |
|----|------|-------------------|
| LST-F01 | POST com `x-id-workspace` | `id_workspace` persistido no create |
| LST-F02 | POST sem header workspace | `id_workspace` ausente no payload |
| LST-F03 | GET após POST | Lista retorna `id_workspace` para o front resolver nome |

---

## Execução

```bash
npx vitest run --config testes/testes-funcionais/bid-frete-internacional/vitest.config.ts testes/testes-funcionais/bid-frete-internacional/lista
```
