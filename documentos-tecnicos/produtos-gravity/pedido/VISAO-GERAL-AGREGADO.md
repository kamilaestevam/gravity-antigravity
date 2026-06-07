# Pedido — API agregada da Visão Geral (Insights)

> Agregação **server-side** para o painel Insights com escopo multi-workspace amplo. Evita transferir até 1000 pedidos só para montar KPIs/funil no cliente.

---

## Endpoint

```
GET /api/v1/pedidos/visao-geral/agregado?ids_workspaces=ws1,ws2,...
```

| Aspecto | Detalhe |
|---------|---------|
| Implementação | `servicos-global/produto/pedido/server/src/routes/visao-geral-agregado.ts` |
| Lógica pura | `servicos-global/produto/pedido/shared/visaoGeralResumoAggregate.ts` |
| Isolamento | `withOrganizacao` + `clausulaFiltroWorkspacePedido` |
| Limite | `LIMITE_PEDIDOS_VISAO_GERAL_AGREGADO` (1000) |
| Resposta | `{ data: ResumoAgregado }` validado com Zod no servidor |

---

## Quando o front usa agregado

`useVisaoGeralPedido.ts`:

- Escopo com **≥ 4 workspaces** (`ESCOPO_MINIMO_PARA_AGREGADO_SERVIDOR`) → prioriza agregado.
- Menos workspaces → pode montar no cliente com listagem existente.
- Se agregado falhar → **fallback client-side** com pedidos já em cache (sem mascarar erro em autorização).

Schemas bilaterais: `client/src/shared/visao-geral-schemas.ts` + parse em `api.ts` (`pedidoVisaoGeralApi.agregado`).

---

## Contrato (resumo)

Campos principais em `data`: `total`, `kpis`, `aprovacao`, `mensal`, `modal`, `funil`, `incoterms`, `alertas`, `moedas`, `sparkAndamento`, `sparkConcluido`, `maiorPedido`.

Testes:

- Unitário: `testes/testes-unitarios/pedido/visao-geral-resumo-aggregate.test.ts`
- Funcional MBOTO: `TST-FUN-MBOTO-000051`
- k6 (opcional): `testes/_scripts/k6/seletor-universal-visoes.js` (threshold API 200 ms p95)

---

## SLA

| Camada | Meta |
|--------|------|
| API agregado | ≤ 200 ms p95 ([sla-metas](../../../skills/governanca/lei/sla-metas/SKILL.md)) |
| Troca até Insights interativo | ≤ 1000 ms ([seletor universal](../../arquitetura/seletor-universal-visualizacoes.md)) |
