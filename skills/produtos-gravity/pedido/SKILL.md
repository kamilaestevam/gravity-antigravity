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
- 25 pares Pedido↔Item canonicalmente mapeados

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
| **Combinado** (default) | Edita Pedido + Item com cascade automático em pares mapeados | ✅ 25 pares |
| **Pedido** | Edita só Pedido — itens permanecem | ❌ |
| **Item** | Edita só PedidoItem dos pedidos selecionados | ❌ |

### Cascade Pedido → Item — whitelist canônica (25 pares)

Vive em `edicaoEmMassaService.ts` → `PARES_CASCADE_PEDIDO_ITEM`. Categorias:

- **Identificação (1):** `tipo_operacao`
- **Comerciais/financeiros (12):** incoterm, moeda, condicao_pagamento, data_emissao, referencia_importador/exportador/fabricante, unidade_comercializada, casas_decimais_valor/quantidade/peso/cubagem
- **Datas fluxo pronto/inspeção/coleta (9):** prevista/confirmada/meta × pronto/inspecao/coleta
- **JSON pedido → coluna item (3):** nome_exportador, nome_importador, nome_fabricante

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

## Status da skill

| Parte | Status |
|-------|--------|
| 1 — Edição em Massa | ✅ Consolidada |
| 2 — Lista de Pedidos | 🟡 Placeholder — a desenvolver |
| 3 — Consolidar / Transferir | 🟡 Placeholder — a desenvolver |

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
