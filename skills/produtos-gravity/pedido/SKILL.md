---
name: antigravity-pedido
description: "Use esta skill em qualquer tarefa do produto Pedido (COMEX) — lista, formulário, edição em massa, consolidação, transferência, banco do Pedido. Define regras de negócio do produto, convenções específicas (campos @@unique, cascade Pedido→Item) e anti-padrões já erradicados."
---

# Gravity — Pedido (COMEX)

## O Que é o Pedido

Produto que gerencia ordens de compra/venda internacional (COMEX) com hierarquia
**Pedido → Itens**, suporte a importação e exportação, e ciclo de vida completo:
rascunho → aberto → consolidado/transferido → cancelado.

**Características-chave:**
- Hierarquia 1:N (Pedido tem N PedidoItem)
- Multi-tenant por `id_organizacao` (Mand. 04)
- DDD-puro em todas as camadas (banco/back/front) — sem ACL legado
- Cascade automático Pedido→Item em campos específicos (aba Combinado)
- 57 pares diretos Pedido→Item (SSOT em `shared/mapaPropagacaoPedidoItem.ts`) + 4 exclusivos da edição em massa

---

## Localização na Arquitetura

```text
servicos-global/produto/pedido/
├── prisma/
│   ├── fragment.prisma           ← fonte da verdade (Mand. 02)
│   └── schema.prisma             ← gerado por compose-pedido-schema.ts
├── client/src/
│   ├── pages/
│   │   ├── Pedidos.tsx           ← lista hierárquica (TabelaVirtualGlobal)
│   │   ├── PedidosKanban.tsx
│   │   ├── PedidoFormulario.tsx
│   │   └── Configuracoes.tsx
│   ├── components/
│   │   ├── ModalPedidoNovo.tsx
│   │   ├── ModalPedidosEdicaoMassa.tsx     ← edição em massa
│   │   ├── ModalPedidosConsolidar.tsx
│   │   ├── ModalPedidoTransferir.tsx
│   │   └── lista/                          ← ColunasPai, ColunasFilho
│   └── shared/
│       ├── types.ts              ← Pedido, PedidoItem, EdicaoMassa*
│       └── api.ts                ← clients HTTP
└── server/src/
    ├── routes/
    │   ├── edicoes-em-massa-pedido.ts
    │   ├── consolidacoes-pedido.ts
    │   ├── transferencias-pedido.ts
    │   └── ...
    ├── services/
    │   ├── edicaoEmMassaService.ts
    │   └── ...
    └── shared/
        └── bulkSchemas.ts        ← assertTiposHomogeneos, detectarTiposMistos

scripts/ativamente/compose-pedido-schema.ts   ← compõe schema.prisma do fragment
```

---

## Regras Absolutas (Referências SSOT)

> ⚠️ **Esta skill NÃO redefine regras absolutas. Apenas referencia.**

| Regra | Onde mora |
|-------|-----------|
| Schema intocável (`fragment.prisma` → script `compose-pedido-schema.ts`) | [Mand. 02](../../governanca/lei/9-mandamentos/SKILL.md) |
| Nomenclatura DDD (`id_pedido`, `tipo_operacao_pedido`, `id_organizacao`) | [ddd-nomenclatura](../../governanca/lei/ddd-nomenclatura/SKILL.md) |
| Frontend label canonical PT-BR via `rotulo`, não `t('key')` | [ddd-nomenclatura REGRA 9](../../governanca/lei/ddd-nomenclatura/SKILL.md) |
| Isolamento de organização via `withOrganizacao` | [isolamento-organizacao](../../governanca/lei/isolamento-organizacao/SKILL.md) |
| Sem fallback silencioso em DEV (mock que mascara API real) | [Mand. 08](../../governanca/lei/9-mandamentos/SKILL.md) |
| Zod = contrato bilateral (back valida = front parseia) | [Mand. 06 + 09](../../governanca/lei/9-mandamentos/SKILL.md) |

---

## Parte 1 — Edição em Massa

> Doc completo: [`documentos-tecnicos/produtos-gravity/pedido/EDICAO-EM-MASSA-TECNICO.md`](../../../documentos-tecnicos/produtos-gravity/pedido/EDICAO-EM-MASSA-TECNICO.md)
> Regras de negócio: [`EDICAO-EM-MASSA-REGRAS-NEGOCIO.md`](../../../documentos-tecnicos/produtos-gravity/pedido/EDICAO-EM-MASSA-REGRAS-NEGOCIO.md)

### Níveis de edição (3 abas)

| Aba | O que faz | Cascade automático? |
|-----|-----------|---------------------|
| **Combinado** (default) | Edita Pedido + Item com cascade automático em pares mapeados | ✅ 61 pares |
| **Pedido** | Edita só Pedido — itens permanecem | ❌ |
| **Item** | Edita só PedidoItem dos pedidos selecionados | ❌ |

### Cascade Pedido → Item — composição SSOT (~61 pares)

**SSOT:** `shared/mapaPropagacaoPedidoItem.ts` → `MAPA_PROPAGACAO_PEDIDO_ITEM` (57 pares diretos).
**Composição:** `edicaoEmMassaService.ts` importa o SSOT + 4 pares exclusivos da edição em massa:

- **SSOT (57):** identidade comercial, casas decimais, câmbio, referências, 35 datas (rascunho/proforma/invoice/consolidação/transferência), pronto/inspeção/coleta
- **Exclusivos massa (4):** `tipo_operacao_pedido→tipo_operacao_item` + 3× JSON `nome_*→nome_*_item`

**Regra:** campo item explícito vence sobre cascade do mesmo destino.

### Campos `@@unique` — convenção crítica

Campos com `@@unique` no schema **não podem** ser editados em massa via `substituir` com >1 pedido (geraria P2002).

**Hoje exposto:** `numero_pedido` (em `Pedido.@@unique([id_organizacao, numero_pedido])`).

**Defesa em 3 camadas:**

1. **Frontend** — Set `CAMPOS_UNIQUE` em `ModalPedidosEdicaoMassa.tsx`:
   - Input `disabled` + tooltip + badge quando multi-seleção
   - Botão "Revisar alterações" desabilitado
2. **Backend Zod** — Set espelhado `CAMPOS_UNIQUE_PEDIDO` em `edicoes-em-massa-pedido.ts` + `superRefine`
3. **Backend try/catch P2002** — fast path `updateMany` envolvido, converte em `AppError 422 UNIQUE_VIOLATION`

**Convenção ao expor novo campo `@@unique` em `CAMPOS_*_EDITAVEIS`:**
- Adicionar a `CAMPOS_UNIQUE` no frontend
- Adicionar a `CAMPOS_UNIQUE_PEDIDO` no backend Zod
- Sem isso, retorna 500 e ponto cego para o usuário

### Tipos mistos (importação + exportação)

**Padrão Pedido:** AVISAR e permitir (não bloquear). Coerente com Transferir.
- Banner azul no topo do Passo 1: "Pedidos de tipos diferentes selecionados"
- Banner laranja reforçado no Passo 2: "Atenção — tipos de operação diferentes"

**Não confundir** com Consolidar — esse BLOQUEIA (banner vermelho + botão disabled). Operações diferentes têm padrões diferentes.

### Render por tipo de campo

Tabela detalhada (texto/numero/data/select/ncm/usuario) vive em [`EDICAO-EM-MASSA-TECNICO.md`](../../../documentos-tecnicos/produtos-gravity/pedido/EDICAO-EM-MASSA-TECNICO.md) → seção "Frontend — Modal". Esta skill referencia para evitar dívida de manutenção quando a Fase 2 (moeda/unidade/decimal) for implementada.

### Auto-fill ao trocar `tipo_operacao_pedido`

Quando o usuário altera `tipo_operacao_pedido` em massa, o sistema preenche automaticamente o **lado nacional** (importador em IMP, exportador em EXP) com **nome + CNPJ do Workspace** de cada pedido. Não usa Empresa-da-Org do Cadastros.

Regras:
- Cada pedido pega o seu próprio workspace (`pedido.id_workspace`)
- Backend faz 1 chamada S2S batch ao Configurador (`GET /api/v1/internal/workspaces?ids=...`)
- Lado oposto é limpo (nome/CNPJ do tipo antigo viram NULL)
- Cascade auto-fill para `nome_*_item` nos itens
- Edição manual de `nome_exportador`/`nome_importador`/`cnpj_*` no mesmo batch vence sobre auto-fill
- Workspace sem CNPJ → avisa+permite (não bloqueia)
- Status crítico (≠ rascunho/aberto) → banner laranja preventivo
- Configurador offline → AppError 503 (Mand. 08)

Doc completo: [`EDICAO-EM-MASSA-TECNICO.md` §Auto-fill](../../../documentos-tecnicos/produtos-gravity/pedido/EDICAO-EM-MASSA-TECNICO.md).

### Dívidas arquiteturais sinalizadas

| Dívida | Razão |
|--------|-------|
| `ModalPedidoNovo` continua usando `obterEmpresaDaOrganizacao` | Refactor da criação de pedido (próxima entrega) |
| `Organizacao.suid_empresa_organizacao` desnecessário | Modelo Workspace=empresa supera esse conceito |
| Snapshots `PedidoSnapshotEmpresa` capturam empresa-da-org | Refactor do snapshot system |
| Visualização cross-workspace na Lista (Master vê todos) | Entrega arquitetural transversal — afeta todos os produtos |

---

## Parte 2 — Lista de Pedidos

> A consolidar — atualizar quando este produto receber atenção dedicada.

Pontos-chave conhecidos:
- `Pedidos.tsx` usa `TabelaVirtualGlobal` com 99 colunas pai (Pedido) e 165 colunas filho (PedidoItem)
- `ColunasPai.tsx`/`ColunasFilho.tsx` definem o catálogo de colunas
- `renderAgregado()` em `ColunasPai.tsx` é o padrão para valor + alerta de divergência (mostra valor do pedido + ícone laranja quando itens divergem — Issue resolvida 2026-05-12)
- Coluna NCM usa `renderAgregado` para padronizar (era bug de ícone duplicado, corrigido 2026-05-12)

---

## Parte 3 — Consolidar / Transferir / Outras Features

> A consolidar.

- **Consolidar:** BLOQUEIA mistura importação+exportação (regra de negócio)
- **Transferir:** AVISA mistura mas permite (cross-tenant possível)
- Ambos usam `bulkSchemas.ts` — `detectarTiposMistos()` síncrono e `assertTiposHomogeneos()` (refinement Zod)

---

## Parte 4 — Duplicar Pedido + Item (modal misto)

> Aprovado por Coordenador + Líder Técnico em 2026-05-11. Implementação em `ModalPedidosDuplicar.tsx` + backend `duplicarExcluirService.ts`.

O botão **Duplicar** trata 3 cenários numa interface única:

| Seleção | Backend chama | Resultado |
|---|---|---|
| Só pedidos | `POST /duplicacoes/confirmar` (1×) | N pedidos novos com todos os itens via cascade. Usuário digita o `numero_pedido` de cada cópia |
| Só itens | `POST /duplicacoes/itens` (1× por pedido pai) | M itens duplicados dentro do(s) pedido(s) pai(s) — sequência logo abaixo do original |
| Misto (pedido + item) | Ambos em paralelo (`Promise.all`) | Toast consolidado: "N pedidos e M itens duplicados" |

### Regra de ordenação após duplicação

**Inviolável** — qualquer alteração na ordenação da Lista deve respeitar esta regra:

- **Pedido novo** (criado por duplicação) → **primeira linha da Lista**
  - Garantido pelo `orderBy: data_criacao_pedido DESC` do `GET /pedidos` (offset pagination, `processos-core/routes/pedidos.ts:643-650`)
  - Como `data_criacao_pedido DateTime @default(now())` é `now()` no INSERT, o duplicado nasce no topo

- **Item novo** (duplicado dentro do mesmo pedido) → **linha imediatamente abaixo do original**
  - Implementado via renumeração 1..N em `duplicarExcluirService.ts:duplicarItens`
  - Para cada item duplicado: original na posição X → cópia na X+1, e itens seguintes shiftam +1
  - Lista virtual de ordem é construída antes; depois um único UPDATE por item renumera

### Quantidades de execução SEMPRE zeradas no item duplicado

`quantidade_pronta_item`, `quantidade_transferida_item` e `quantidade_cancelada_item` viram `0` no item novo.

**Motivo:** essas 3 colunas representam **execução real** (transferências para embarque, marcações de pronto, cancelamentos). Copiar literalmente criaria **saldo fantasma** — o item novo apareceria com "50 transferidas" sem nenhum processo de embarque correspondente.

`quantidade_inicial_item` e `quantidade_atual_item` são copiadas (o item nasce íntegro, como se fosse novo do zero).

### Aviso pré-duplicação

Se algum item selecionado tem qualquer das 3 quantidades > 0, o modal mostra um banner amarelo antes do botão Duplicar explicando que esses campos serão zerados (transparência total com o usuário).

### Sincronização pai↔filhos na seleção

Como a `TabelaVirtualGlobal` agora sincroniza pais e filhos (ver skill `arquitetura/nucleo-global`), marcar o checkbox de um pedido marca todos os itens dele. **O modal deve filtrar duplicação dupla:**

```ts
const itensFiltrados = useMemo(
  () => itens.filter(it => !idsPedidosSelecionados.has(it.pedido_id)),
  [itens, idsPedidosSelecionados],
)
```

Itens cujo pai já está em `pedidos` ficam de fora do `duplicarItens` — o cascade do pedido já cria as cópias. Sem o filtro, cada item seria duplicado 2 vezes: uma vez no pedido novo (via cascade) e outra no pedido original (via `/duplicacoes/itens`).

---

## Anti-padrões proibidos

### A1 — Mock fallback silencioso em DEV

```ts
// ❌ NUNCA
preview: (payload) =>
  request('/api/...').catch(err => {
    if (import.meta.env.DEV) return mockX(payload)
  })

// ✅ Falha ruidoso
preview: (payload) =>
  request('/api/...')
```

Mascarar erro real com mock em DEV viola Mand. 08. Caso real corrigido em 2026-05-12: preview retornava "5 itens afetados" mockado quando a API real respondia 400 — usuário não sabia.

### A2 — ACL legado→DDD no backend

Sistema é DDD-puro end-to-end. Frontend envia nome exato da coluna do Prisma (`incoterm_pedido`, `quantidade_inicial_item`, etc.). Sem `LEGACY_TO_DDD` map. Ver [`ddd-nomenclatura`](../../governanca/lei/ddd-nomenclatura/SKILL.md) — glossário canônico.

### A3 — Editar `schema.prisma` diretamente

Sempre editar `fragment.prisma` + rodar `npx tsx scripts/ativamente/compose-pedido-schema.ts` + `npx prisma db push`.

---

## Filtro Multi-Workspace (entrega 2026-05-13, commit `4bafb1b6`)

### Visão de 1 minuto

A Lista de Pedidos suporta filtro multi-workspace: usuário escolhe N workspaces no popover do header da coluna "Workspace" e vê pedidos+itens de todos juntos. Defesa em 3 camadas: UI (popover só mostra acessíveis), backend (`validarMultiWorkspace` via S2S → 403 com `workspaces_bloqueados[]`), Portão 3 (header `x-id-workspace` inalterado).

### Contratos críticos

- **Endpoint S2S**: `GET /api/v1/internal/usuarios/:id/workspaces-habilitados?id_organizacao=X` no Configurador retorna `{ tipo_usuario, workspaces_habilitados: string[] }`. SSOT da regra de visibilidade replica `/hub/init`.
- **Helper SDK**: `obterWorkspacesHabilitadosDoUsuario` em `@gravity/resolver-organizacao` — consumido pelos produtos para validar listas.
- **Query param**: `GET /api/v1/pedidos?ids_workspaces=cmo1,cmo2` (CSV). **Sobrepõe** o header `x-id-workspace` quando vem com ≥1 valor. Header continua sendo validado pelo Portão 3 separadamente.
- **Mand. 08**: ids fora da lista do usuário → 403 com `workspaces_bloqueados[]` explícito. NÃO há fallback silencioso.

### Regra de visibilidade (idêntica em `/hub/init` e endpoint S2S)

| Tipo | Workspaces visíveis |
|------|---------------------|
| MASTER / SUPER_ADMIN / ADMIN | Todos com `status_workspace='ATIVO'` da org |
| PADRAO / FORNECEDOR | ATIVO **AND** `UsuarioWorkspace.ativo_usuario_workspace=true` |

FORNECEDOR pode ser cross-organização (não exige org match). Mand. 04 NÃO se aplica a PADRAO/FORNECEDOR (sem bypass).

### Comportamento frontend (Lista)

- **Coluna "Workspace"** sempre visível na 3ª posição (após "Tipo de Operação"). Migração automática reposiciona para usuários com prefs antigas.
- **Mount**: filtro inicia com workspace ATIVO pré-marcado (init useEffect, UMA vez via `initializedFilterRef`).
- **Empty selection**: usuário desmarcar tudo = lista vazia (curto-circuito local, **sem fetch**). Coerência popover ↔ dados.
- **Chip híbrido**: 1-2 nomes diretos, 3+ "N selecionados". Clicável (reabre popover ancorado no chip). Tooltip `TooltipGlobal` com lista numerada.

### Quando mexer aqui — checklist

- [ ] Mudou regra de visibilidade? Atualizar **DOIS** lugares: `/hub/init` E `workspaces-habilitados-internal.ts`. Dívida D11 pede extração para serviço comum.
- [ ] Adicionou novo workspace status (além de ATIVO/INATIVO)? Verificar ambos endpoints + Portão 3.
- [ ] Tocou em `parseCsvQueryParam` no `processos-core/pedidos.ts`? Mantém dedup, trim, ignore vazios — invariantes do contrato.
- [ ] Mudou shape do `WorkspaceDisponivel` no `/hub/init`? Atualizar Zod schema `workspacesDisponiveisApi` em api.ts (Mand. 09 — Zod bilateral).

### Anti-padrões específicos (não repetir)

- **AP1**: enviar `?ids_workspaces=` quando `workspacesSelecionados === [workspaceAtivo]` — duplicaria trabalho do header. O `ehSelecaoDefault` checa exatamente isso.
- **AP2**: fazer fetch quando `workspacesSelecionados.length === 0` — backend cairia no header e mostraria pedidos do ativo. Curto-circuito local força lista vazia.
- **AP3**: repopular filtro automaticamente após "× Limpar" — quebra o modelo mental (usuário desmarcou de propósito). Init é UMA vez no mount.
- **AP4**: hardcoded "consolidar quando há N+" no chip — usar `rotulofiltro` único (`<=2 nomes / 3+ contagem`). Vale para todos os filtros enum.

### Documentos relacionados

- **Técnico**: `documentos-tecnicos/produtos-gravity/pedido/FILTRO-MULTI-WORKSPACE-TECNICO.md`
- **Regras**: `documentos-tecnicos/produtos-gravity/pedido/FILTRO-MULTI-WORKSPACE-REGRAS-NEGOCIO.md`
- **Auditoria DB**: `scripts/auditar-workspaces-pedidos.mjs`

---

## Helpers compartilhados (`shared/`)

### `shared/migracaoColunas.ts` (refactor D12 — 2026-05-13)

Helpers puros para migração de preferências de coluna do usuário quando uma entrega adiciona/reposiciona colunas built-in:

| Helper | Caso de uso | Idempotente? |
|--------|-------------|--------------|
| `inserirColunaAposAncora(visiveis, key, ancoras)` | Adicionar coluna NOVA nas prefs do usuário (entrega aumenta o set de colunas built-in) | ✅ Sim — se já existe, retorna no-op |
| `moverColunaParaAposAncora(visiveis, keyMover, keyApos)` | Reposicionar coluna EXISTENTE quando entrega muda posição padrão | ✅ Sim — se já está depois da âncora, retorna no-op |

**Composição padrão** (cobre ambos os casos numa migração):
```ts
const passoInserir = inserirColunaAposAncora(saved, 'nova_coluna', ['ancora1', 'ancora2'])
const passoMover   = moverColunaParaAposAncora(passoInserir.resultado, 'nova_coluna', 'ancora1')
const visiveis     = passoMover.resultado
const persistir    = passoInserir.mudou || passoMover.mudou
```

**Quando usar**: toda vez que uma entrega adicionar/reposicionar coluna built-in no Pedido. Substitui ~40 linhas inline por 2 chamadas testadas.

**Cobertura**: 16 testes unitários em `__tests__/migracaoColunas.test.ts` cobrindo edge cases (lista vazia, âncoras ausentes, idempotência, preservação de customização do usuário).

---

## Parte 5 — Internacionalização (i18n)

> Entrega 2026-05-22 — produto **100% i18n'd** em PT/EN/ES. Veja [arquitetura/traducao](../../arquitetura/traducao/SKILL.md) para o pipeline geral.

### Cobertura atual

- **2743 referências `t('pedido.*')`** no `pedido/client/src` — 0 missing (todas resolvem em pt.json).
- **24 arquivos `.tsx`** convertidos (todos os modais, formulários, lista, dashboard, kanban, configurações, smart import, snapshot, anexos, visão geral).
- Paridade pt/en/es 100% nas keys de `pedido.*`.

### Namespaces de keys do produto

| Namespace | Origem |
|-----------|--------|
| `pedido.dashboard.*` | PedidosDashboard.tsx |
| `pedido.kanban.*` / `pedido.kanban_colunas.*` | PedidosKanban + SecaoKanbanColunas |
| `pedido.excluir.*` | ModalPedidosExcluir |
| `pedido.lista.*` / `pedido.barra.*` / `pedido.coluna_pai.*` / `pedido.popover_filtro.*` | Pedidos.tsx + ColunasPai + barra/filtro |
| `pedido.visao_geral.*` | PedidosVisaoGeral.tsx |
| `pedido.config.*` / `pedido.config_colunas.*` | Configuracoes.tsx + ConfiguracaoColunas/* |
| `pedido.modal_novo.*` / `pedido.modal_item.*` | ModalPedidoNovo + ModalItemNovo |
| `pedido.modal_dup.*` / `pedido.modal_transf.*` / `pedido.modal_massa.*` / `pedido.modal_pdf.*` | modais correspondentes |
| `pedido.modal_col.*` / `pedido.card_usuario.*` | ConfiguracaoColunas/ModalNova + ConfiguracaoCards/ModalNovo |
| `pedido.smart_import.*` / `pedido.smart_preview.*` | SmartImport/* |
| `pedido.anexos.*` / `pedido.cel_anexos.*` | AnexosPainel + CelulaAnexosColuna |
| `pedido.drawer.*` / `pedido.formulario.*` | DrawerPedido + PedidoFormulario |
| `pedido.snapshot_cadastros.*` | configuracoes/PedidoSnapshotCadastros |
| `pedido.massa_campos.*` | rótulos de campo da edição em massa |

### Proteção contra regressão

Teste unitário `testes/testes-unitarios/pedido/i18n-paridade.test.ts` cobre:
- Toda key `t('pedido.*')` no client/src tem entry em `pt.json`
- Paridade pt → en e pt → es (sem keys faltantes)
- Sem valores vazios em `pedido.*`
- Variáveis `{{var}}` preservadas entre os 3 idiomas

Roda no CI a cada PR — adicionou key no pt sem rodar `npm run translate`, falha.

### Items adiados (refactor de assinatura de função pendente)

Hardcoded strings que ficaram fora do escopo i18n porque a função/módulo onde vivem **não recebe `t: TFunction`**:

1. `components/lista/ColunasFilho.tsx` — função `mapColunaUsuarioParaGTColuna` (1 string)
2. `pages/Pedidos.tsx` — constantes `COLUNAS_FILHO` (linhas ~657-2483) e `buildMapaColunasFilho` (linhas ~2486-3160), ~50 strings de metadata de coluna
3. `components/lista/ColunasPai.tsx` — helpers `renderQtdPedido`, `renderAgregado` (~3 strings)
4. `pages/PedidosVisaoGeral.tsx` — mocks de demo de alertas (fornecedores fictícios) — esperam dados reais do backend (Mand. 05)

**Quem corrigir**: passar `t: TFunction` como parâmetro nas funções acima e atualizar todos os callers no mesmo commit (Mand. 07 — sincronia de contratos).

### Anti-padrões i18n específicos do Pedido

- **AP4 — Shadowing de `t` em `.map(t => ...)`**: parâmetros de callback em arrays como tabs/colunas/status que usam `t` sobrescrevem o hook silenciosamente. Caso real corrigido em 2026-05-22 em `PedidosVisaoGeral.tsx` L3623. Sempre renomear o param antes de inserir `t()` dentro do bloco.
- **AP5 — Constantes module-level com labels**: declarar `const TIPO_LABELS = { ... }` fora do componente impede tradução. Mover para dentro do componente como `useMemo([t])` OU manter keys-only e resolver via `t()` no render.
- **AP6 — Helpers exportados sem `t`**: `mapColunaUsuario*`, `renderAgregado` etc. recebem dados mas não `t`. Tradução exige refactor de assinatura — Item 1-3 da lista de adiados acima.

---

## Status da skill

| Parte | Status |
|-------|--------|
| 1 — Edição em Massa | ✅ Consolidada |
| 2 — Lista de Pedidos | 🟡 Placeholder — a desenvolver |
| 2.1 — Filtro Multi-Workspace | ✅ Consolidada (2026-05-13) |
| 3 — Consolidar / Transferir | 🟡 Placeholder — a desenvolver |
| 5 — Internacionalização (i18n) | ✅ Consolidada (2026-05-22) |

---

## Referências cruzadas

| Para | Consultar |
|------|-----------|
| Schema composition | [arquitetura/schema-composition](../../arquitetura/schema-composition/SKILL.md) |
| Isolamento de org | [governanca/lei/isolamento-organizacao](../../governanca/lei/isolamento-organizacao/SKILL.md) |
| DDD nomenclatura | [governanca/lei/ddd-nomenclatura](../../governanca/lei/ddd-nomenclatura/SKILL.md) |
| 9 Mandamentos | [governanca/lei/9-mandamentos](../../governanca/lei/9-mandamentos/SKILL.md) |
| Cadastros snapshot policy (quando consumir Empresa/Moeda/NCM) | [governanca/lei/cadastros-snapshot-policy](../../governanca/lei/cadastros-snapshot-policy/SKILL.md) |
| Segurança 5 camadas | [seguranca/seguranca-5-camadas](../../seguranca/seguranca-5-camadas/SKILL.md) |
| UX criação de telas | [ux/criacao-telas](../../ux/criacao-telas/SKILL.md) |
| Testes | [testes](../../testes/SKILL.md) |
