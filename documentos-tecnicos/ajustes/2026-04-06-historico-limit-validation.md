# Ajuste — Histórico não exibe dados na tela de Pedidos

**Data:** 2026-04-06  
**Produto:** Pedido  
**Classificação:** MEDIUM  
**Decisão:** Ajuste (não reescrita)

---

## Problema

A aba Histórico na tela de Pedidos exibe tabela vazia para todos os usuários.

## Causa Raiz

Discrepância entre o `limit` enviado pelo componente frontend e o `max` permitido pelo schema Zod do backend.

| Ponto | Valor |
|---|---|
| Frontend envia | `limit=200` |
| Backend aceita (max) | `100` |

**Fluxo do erro:**
1. `Historico.tsx:559` → chama `GET /historico-api/api/v1/historico/logs?...&limit=200`
2. Vite proxy → encaminha para `http://localhost:8012/api/v1/historico/logs`
3. `ListHistoryQuerySchema` → valida `limit` → falha: `Number must be less than or equal to 100`
4. Controller retorna `400 VALIDATION_ERROR`
5. Componente: `if (!res.ok) throw new Error(...)` → cai no `catch` → `setLogs([])`
6. Tela mostra lista vazia sem mensagem de erro

## Arquivos Afetados

| Arquivo | Linha | Alteração |
|---|---|---|
| `servicos-global/tenant/historico-global/src/Historico.tsx` | 559 | `limit=200` → `limit=100` |

## Escopo da Mudança

**Somente** a linha 559 do componente `Historico.tsx`.  
Não envolve schema, banco, rotas, tipos, ou qualquer outro arquivo.

## Problema Secundário (não corrigido neste ajuste)

`server/index.ts:37` usa `import('../generated/index.js')` no health endpoint — caminho relativo incorreto (deveria ser `../../generated/index.js`). Está envolvido em `try/catch`, não causa falha de startup. Registrado para correção futura separada.

## Verificação Pós-Ajuste

- [ ] Frontend carrega histórico com dados reais
- [ ] Nenhuma regressão na paginação (cursor-based, continua funcionando com `limit=100`)
