# Relatório QA — Edição Inline de Item do Pedido
**Data:** 2026-04-06
**Ajuste relacionado:** documentos-tecnicos/ajustes/2026-04-06-edicao-inline-item-pedido.md
**Revisado por:** QA
**Nível de risco:** HIGH

---

## Arquivos Revisados

| Arquivo | Tipo de alteração |
|:--------|:------------------|
| `servicos-global/tenant/processos-core/src/routes/pedidos.ts` | Expansão do schema Zod + tradução de alias + recálculo de saldo |
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | Dispatch para rota `/pronta` + remoção de editabilidade indevida em campos filho |

---

## Checklist — 6 Categorias

### 1. Segurança

| Item | Status | Observação |
|:-----|:-------|:-----------|
| Zod safeParse em toda rota modificada | ✅ | `atualizarItemSchema.safeParse(req.body)` com 400 em falha |
| AppError para erros (não res.status direto) | ✅ | AppError(404) para item não encontrado; AppError nunca bypass |
| x-tenant-id extraído dos headers | ✅ | Nunca do body |
| Sem console.log com dados sensíveis | ✅ | Sem logs novos |
| Sem env vars hardcoded | ✅ | Nenhuma |
| prismaData populado apenas com campos Zod-validados | ✅ | `camposDiretos` vem do resultado do safeParse; nenhum campo arbitrário injetado |
| (Pré-existente) req.prisma sem null check | ⚠️ | TS18048 era pré-existente em toda a rota — não introduzido por este ajuste |

### 2. Tenant Isolation

| Item | Status | Observação |
|:-----|:-------|:-----------|
| findFirst com tenant_id + company_id antes do update | ✅ | `{ id, pedido_id, tenant_id, company_id }` — item não encontrado → 404 |
| Update Prisma não acessa dados de outro tenant | ✅ | Item confirmado para o tenant antes do update |
| Frontend sem acesso direto ao banco | ✅ | Tudo via pedidoItemApi (axios com headers de tenant) |

### 3. Code Standards

| Item | Status | Observação |
|:-----|:-------|:-----------|
| TypeScript strict, sem `any` novo | ✅ | `Record<string, unknown>` para prismaData — correto para dynamic mapping |
| ESModules (import/export) | ✅ | |
| Sem `@ts-ignore` | ✅ | |
| AppError para erros de negócio | ✅ | |
| Comentário documenta tradução de alias | ✅ | Linhas 82–84 em pedidos.ts |
| `camposEditaveisFilhos={[]}` — intencional e sem ambiguidade | ✅ | Editabilidade filho controlada exclusivamente por MAPA_COLUNAS_FILHO[key].editavel |

### 4. Testes

| Item | Status | Observação |
|:-----|:-------|:-----------|
| Regressão @critico Playwright | ✅ | 8/8 passaram (ver testes-em-tela/2026-04-06) |
| Teste do fluxo corrigido | ⚠️ | Sem spec Playwright — gap pré-existente registrado |
| Unitários para tradução de alias + recálculo de saldo | ⚠️ | GAP — não há testes unitários para processos-core/routes. Pré-existente na base. |
| Unitário para dispatch `/pronta` em handleEditarFilho | ⚠️ | GAP — sem cobertura unitária para este caminho de código |

**Cobertura de testes do processos-core:** gap pré-existente — nenhum `.test.ts` existe para rotas deste serviço. Não introduzido por este ajuste.

### 5. Arquitetura e Escopo

| Item | Status | Observação |
|:-----|:-------|:-----------|
| Alterações dentro dos 2 arquivos do Relatório de Impacto | ✅ | Sem alterações fora do escopo |
| Sem alteração em schema.prisma | ✅ | Apenas fragment.prisma lido (não modificado) |
| Sem imports não autorizados | ✅ | |
| Sem comunicação direta entre serviços tenant | ✅ | |
| Campos desabilitados (peso, cubagem) são campos que não existem em PedidoItem | ✅ | Confirmado via fragment.prisma — campos pertencem a ProcessoItem |

### 6. Qualidade Geral

| Item | Status | Observação |
|:-----|:-------|:-----------|
| Math.max(0, novoAtual) — guard correto contra saldo negativo | ✅ | |
| Item pré-carregado no findFirst (sem extra DB call) | ✅ | `quantidade_transferida_pedido` e `quantidade_cancelada_pedido` disponíveis |
| mapItem() na resposta — aliases corretos para o frontend | ✅ | `quantidade_inicial_item_pedido` e `quantidade_pronta_total` mapeados |
| import.meta.env.DEV guard no mock fallback | ✅ | Mock só ativo em desenvolvimento |
| Funções < 50 linhas | ✅ | Bloco PUT handler: ~35 linhas |
| **MINOR** aggregate pai não recalculado após edição de pronta | ⚠️ | Ver abaixo |

#### Detalhe — aggregate não recalculado (MINOR)

Após edição inline de `quantidade_pronta_total` de um item filho:
- A **linha do item** atualiza corretamente via `filhosCache` ✅
- A **linha do pedido pai** (`quantidade_pronta_itens_pedido_total`) **não recalcula** em tempo real ⚠️

O `setPedidos` no branch `quantidade_pronta_total` não soma os novos valores dos filhos para atualizar o aggregate do pai. A linha do pai só reflete o valor atualizado após o próximo fetch (scroll trigger, reload, etc.).

Comparação com o branch geral: o branch de `quantidade_inicial_item_pedido` já recalcula `quantidade_total_inicial_pedido` corretamente. O mesmo padrão deveria ser aplicado à pronta.

**Impacto:** UX — dado não é perdido, mas o usuário vê o aggregate desatualizado na linha pai até recarregar.
**Bloqueante para este ajuste:** Não — o comportamento pré-existente era ainda pior (edição não persistia). Registrado para ajuste futuro.

---

## Resumo das Ressalvas

| # | Categoria | Severidade | Descrição | Pré-existente? |
|:--|:----------|:-----------|:----------|:---------------|
| 1 | Testes | MEDIUM | Sem testes unitários para novos caminhos de código em processos-core | Sim (gap da base) |
| 2 | Qualidade | MINOR | `quantidade_pronta_itens_pedido_total` não recalculado em setPedidos após edição inline da pronta | Não (nova lacuna introduzida) |
| 3 | Segurança | INFO | req.prisma sem null check — TS18048 pré-existente | Sim |

---

## Decisão

**✅ APROVADO COM RESSALVAS**

- A correção primária (Zod schema + alias translation + saldo recálculo) está correta, segura e completa.
- A remoção de editabilidade indevida em campos filho (peso, cubagem, transferida) está correta.
- O dispatch para `/pronta` funciona corretamente no nível da persistência e do cache do item.
- Nenhuma regressão identificada nos 8 fluxos críticos.

**Ações recomendadas (não bloqueantes):**

1. Criar spec Playwright para edição inline de item (gap registrado em gaps-de-cobertura.md)
2. Ajuste futuro: recalcular `quantidade_pronta_itens_pedido_total` no `setPedidos` após edição da pronta do item filho
3. Criar testes unitários para `PUT /:id/itens/:itemId` em processos-core quando a suíte de testes da rota for iniciada
