# Edição em Massa — Documento Técnico

> **Produto:** Pedido (COMEX)
> **Versão:** 2.0 (DDD-puro + Cascade Combinado)
> **Última atualização:** 2026-05-12
> **Status:** Implementado em produção

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript strict, Vite, react-i18next |
| Backend | Express + TypeScript, Prisma 5.22, `withOrganizacao` (resolver-organizacao) |
| Banco | PostgreSQL (isolamento por `id_organizacao` em todas as queries) |
| Validação | Zod em todas as rotas |
| Auth | Clerk JWT + `x-chave-interna-servico` para chamadas S2S |
| Erros | `AppError` — nunca `res.status().json()` direto |

---

## Estrutura de arquivos (DDD pós-refactor)

```
produto/pedido/
├── client/
│   └── src/
│       ├── components/
│       │   ├── ModalPedidosEdicaoMassa.tsx          ← Modal principal
│       │   └── ModalPedidosEdicaoMassa.css
│       ├── shared/
│       │   ├── types.ts                              ← TipoCampoEdicao, EdicaoMassa*
│       │   └── api.ts                                ← pedidoEdicaoMassaApi
│       └── pages/
│           └── Pedidos.tsx                           ← Botão "Editar em Massa"
└── server/
    └── src/
        ├── routes/
        │   └── edicoes-em-massa-pedido.ts           ← Rotas REST
        ├── services/
        │   └── edicaoEmMassaService.ts              ← Lógica + cascade
        └── shared/
            └── bulkSchemas.ts                        ← Zod compartilhado
```

---

## Endpoints

| Método | Caminho | Função |
|--------|---------|--------|
| `POST` | `/api/v1/pedidos/edicoes-em-massa/preview` | Calcula impacto sem alterar banco |
| `POST` | `/api/v1/pedidos/edicoes-em-massa/confirmar` | Executa edição em `$transaction` |

---

## Tipos TypeScript (`client/src/shared/types.ts`)

```ts
// Tipos de campo suportados (frontend)
export type TipoCampoEdicao =
  | 'texto'
  | 'numero'
  | 'data'
  | 'select'      // enum com opcoes pré-definidas
  | 'usuario'
  | 'ncm'         // NCM com máscara 0000.00.00

export type OperacaoCampo =
  | 'substituir'      // todos os tipos
  | 'somar'           // numero
  | 'subtrair'        // numero
  | 'percentual'      // numero (ex: +10% → ×1.1)
  | 'avancar_dias'    // data
  | 'recuar_dias'     // data

export interface CampoEdicaoMassa {
  campo: string                 // nome EXATO da coluna DDD (ex: 'incoterm_pedido', 'ncm_item')
  tipo: TipoCampoEdicao
  nivel: 'pedido' | 'item'
  operacao: OperacaoCampo
  valor: string | number
}

export interface EdicaoMassaPayload {
  pedido_ids: string[]
  campos: CampoEdicaoMassa[]
  nivel: 'pedido' | 'item' | 'combinado'    // aba selecionada
}

export interface EdicaoMassaPreview {
  pedidos_afetados: number
  itens_afetados: number
  campos_pedido_alterados: number    // pedidos × campos pedido
  campos_item_alterados: number      // itens × (campos item + cascade)
  campos: {
    campo: string
    nivel: 'pedido' | 'item'
    operacao: OperacaoCampo
    valor: string | number
    multiplos_valores: boolean
    valores_distintos?: string[]
    alertas: string[]
    cascade_para?: string            // coluna item-alvo (Combinado)
    overrides_sobrescritos?: number  // itens com valor pré-divergente
  }[]
  alertas_globais: string[]
  por_pedido?: Array<{ ... }>
}

export interface EdicaoMassaResultado {
  pedidos_atualizados: number
  itens_atualizados: number
  campos_pedido_alterados: number
  campos_item_alterados: number
  campos_alterados: string[]
  erros: { pedido_id: string; motivo: string }[]
}
```

---

## Regra Inviolável — Frontend = Banco (DDD-puro, sem ACL)

**O frontend envia o nome EXATO da coluna do Prisma.** Não há ACL legado→DDD no backend.

| ✅ Correto (DDD) | ❌ Errado (legado abandonado) |
|------------------|-------------------------------|
| `campo: 'incoterm_pedido'` | `campo: 'incoterm'` |
| `campo: 'tipo_operacao_pedido'` | `campo: 'tipo_operacao'` |
| `campo: 'quantidade_inicial_item'` | `campo: 'quantidade_inicial_pedido'` |
| `campo: 'ncm_item'` | `campo: 'ncm'` |
| `id_organizacao` | `tenant_id` |
| `id_workspace` | `company_id` |
| `id_pedido` | `id` |

A definição (`DefinicaoCampo`) em `ModalPedidosEdicaoMassa.tsx` tem `campo` com o nome DDD exato + `rotulo` com label canonical PT-BR (skill `ddd-nomenclatura` REGRA 9).

---

## Cascade Pedido → Item (aba "Combinado")

Na aba **Combinado**, alterações em campos de Pedido que têm equivalente em Item **propagam automaticamente** para todos os itens dos pedidos selecionados.

**Whitelist canônica** (`PARES_CASCADE_PEDIDO_ITEM` em `edicaoEmMassaService.ts`) — **25 pares**:

### Identificação (1)
- `tipo_operacao_pedido` → `tipo_operacao_item`

### Comerciais / financeiros (12)
- `incoterm_pedido` → `incoterm_item`
- `moeda_pedido` → `moeda_item`
- `condicao_pagamento_pedido` → `condicao_pagamento_item`
- `data_emissao_pedido` → `data_emissao_item`
- `referencia_importador_pedido` → `referencia_importador_item`
- `referencia_exportador_pedido` → `referencia_exportador_item`
- `referencia_fabricante_pedido` → `referencia_fabricante_item`
- `unidade_comercializada_pedido` → `unidade_comercializada_item`
- `casas_decimais_valor_pedido` → `casas_decimais_valor_item`
- `casas_decimais_quantidade_pedido` → `casas_decimais_quantidade_item`
- `casas_decimais_peso_pedido` → `casas_decimais_peso_item`
- `casas_decimais_cubagem_pedido` → `casas_decimais_cubagem_item`

### Datas de fluxo pronto/inspeção/coleta (9)
- `data_prevista_pedido_pronto` → `data_prevista_item_pronto`
- `data_confirmada_pedido_pronto` → `data_confirmada_item_pronto`
- `data_meta_pedido_pronto` → `data_meta_item_pronto`
- `data_prevista_inspecao_pedido` → `data_prevista_inspecao_item`
- `data_confirmada_inspecao_pedido` → `data_confirmada_inspecao_item`
- `data_meta_inspecao_pedido` → `data_meta_inspecao_item`
- `data_prevista_coleta_pedido` → `data_prevista_coleta_item`
- `data_confirmada_coleta_pedido` → `data_confirmada_coleta_item`
- `data_meta_coleta_pedido` → `data_meta_coleta_item`

### JSON pedido → coluna item (3)
- `nome_exportador` (chave em `detalhes_operacionais_pedido`) → `nome_exportador_item`
- `nome_importador` (idem) → `nome_importador_item`
- `nome_fabricante` (idem) → `nome_fabricante_item`

### Fora da whitelist (não cascadeiam)
- Datas rascunho/proforma/invoice (não têm coluna em Item)
- Identificadores específicos do Pedido (`porto_origem`, `porto_destino`, `numero_pedido`, etc.)
- Campos em JSON sem equivalente em Item (endereço, país, OPE, etc.)

### Prioridade quando o usuário adiciona ambos
Se o usuário adiciona `incoterm_pedido` + `incoterm_item` explicitamente na aba Combinado, o campo item **explícito vence sobre o cascade**.

---

## Campos em JSON `detalhes_operacionais_pedido`

31 chaves não-coluna do Pedido vivem como propriedades JSON dentro da coluna `detalhes_operacionais_pedido` (Json?):

- **Exportador (13):** `nome_exportador`, `endereco_exportador`, `pais_exportador`, `estado_exportador`, `cidade_exportador`, `zip_code_exportador`, `exportador_ou_fabricante`, `relacao_exportador_fabricante`, `nome_contato_exportador`, `email_contato_exportador`, `whatsapp_contato_exportador`, `cargo_contato_exportador`, `departamento_contato_exportador`
- **Importador (1):** `nome_importador`
- **Fabricante (6):** `nome_fabricante`, `endereco_fabricante`, `pais_fabricante`, `estado_fabricante`, `cidade_fabricante`, `zip_code_fabricante`
- **OPE (12):** `codigo_ope`, `nome_ope`, `endereco_ope`, `pais_ope`, `estado_ope`, `cidade_ope`, `zip_code_ope`, `tin_ope`, `email_ope`, `situacao_ope`, `versao_ope`, `cnpj_raiz_empresa_responsavel`

Lista mantida em `CAMPOS_DETALHES_OPERACIONAIS` no service. O preview e o confirmar fazem **merge JSON** (preservam outras chaves do JSON existentes).

---

## Campos bloqueados (calculados — nunca editáveis)

```ts
const CAMPOS_BLOQUEADOS_PEDIDO = new Set([
  // Agregados calculados pelo recalcularAgregadosPedido
  'valor_total_pedido',
  'quantidade_total_pedido',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
  // Sistema / identidade
  'id_pedido',
  'id_organizacao',
  'id_workspace',
  'id_status_pedido',
  'data_criacao_pedido',
  'data_atualizacao_pedido',
  'data_exclusao_pedido',
  'data_consolidacao_pedido',
  'ids_origem_consolidacao_pedido',
])

const CAMPOS_BLOQUEADOS_ITEM = new Set([
  'valor_total_item',
  'quantidade_atual_item',
  'quantidade_transferida_item',   // saldoEngine
  'id_item',
  'id_organizacao',
  'id_workspace',
  'id_pedido',
  'data_criacao_item',
  'data_atualizacao_item',
  'data_exclusao_item',
])
```

**Defesa em profundidade:** validação server-side rejeita campos bloqueados mesmo se o frontend tentar contornar. Cross-org attack mitigado — não é possível mudar `id_organizacao` via edição em massa.

---

## Backend — Rotas

### `POST /api/v1/pedidos/edicoes-em-massa/preview`

**Zod schema** (`edicoes-em-massa-pedido.ts`):
```ts
const CampoSchema = z.object({
  campo: z.string().min(1),
  tipo: z.enum(['texto', 'numero', 'data', 'select', 'usuario', 'ncm']),
  nivel: z.enum(['pedido', 'item']),
  operacao: z.enum(['substituir', 'somar', 'subtrair', 'percentual', 'avancar_dias', 'recuar_dias']),
  valor: z.union([z.string(), z.number()]),
})

const EdicaoMassaSchema = z.object({
  pedido_ids: z.array(z.string().min(1)).min(1),
  campos: z.array(CampoSchema).min(1),
  nivel: z.enum(['pedido', 'item', 'combinado']),
})
```

**Fluxo:**
1. Valida Zod
2. `withOrganizacao(req, async db => ...)` injeta `id_organizacao` no contexto
3. Service rejeita campos bloqueados (`validarCamposEditaveis`)
4. Busca pedidos com `id_organizacao` + `include: { itens_pedido }`
5. Calcula `itens_afetados` condicional (só se há campos item OU cascade ativo)
6. Calcula contadores granulares: `campos_pedido_alterados`, `campos_item_alterados`
7. Para cada campo: detecta múltiplos valores, calcula `cascade_para` e `overrides_sobrescritos`
8. Retorna `EdicaoMassaPreview` sem alterar o banco

### `POST /api/v1/pedidos/edicoes-em-massa/confirmar`

**Caminho rápido** (`updateMany`):
- Condições: todos campos são `substituir`, todos nivel='pedido', nenhum em `detalhes_operacionais_pedido`, sem cascade pendente
- Uma única SQL atualiza todos os pedidos independente do volume

**Caminho lento** (`$transaction`, timeout 60s):
- Loop por pedido:
  - Aplica campos pedido (incluindo merge JSON em `detalhes_operacionais_pedido`)
  - Aplica campos item explícitos (`tx.pedidoItem.update`) + cascade Pedido→Item se Combinado
  - Recalcula agregados (`recalcularAgregadosPedido`) se campos de quantidade foram alterados
- Audit trail via `historico-global` (fire-and-forget)

---

## Frontend — Modal (`ModalPedidosEdicaoMassa.tsx`)

### Fluxo UX (2 passos)

```
Passo 1 — Selecionar campos e valores
  ├── Toggle: Pedido / Item / Combinado
  ├── Combobox de campo (com busca por rotulo + grupo)
  ├── Select de operação (filtrada por TipoCampoEdicao)
  ├── Input de valor — RENDER POR TIPO:
  │   ├── select  → <select> com opcoes[] da definição
  │   ├── data    → <input type="date">
  │   ├── numero  → <input type="number">
  │   ├── ncm     → <input> com máscara 0000.00.00 + maxLength 10
  │   └── texto   → <input type="text">
  ├── + Adicionar campo
  └── Preview em tempo real (debounce 300ms → /preview)

Passo 2 — Confirmar
  ├── Resumo: X pedidos · Y itens · A campos pedido · B campos item
  ├── Lista campo→valor com alertas (multiplos_valores, overrides_sobrescritos)
  ├── Detalhe de/para por pedido
  └── Botão "Aplicar em Massa"
```

### Labels (sem i18n para PT-BR)

Por skill `ddd-nomenclatura/SKILL.md` REGRA 9, o label canonical em PT-BR vive no campo `rotulo` da `DefinicaoCampo`. O frontend usa `defAtual.rotulo` direto.

i18n só para EN/ES (futura). NÃO usar `t('pedido.massa_campos.*')` (antipadrão removido em 2026-05-12).

### Selects com `opcoes`

Definição extra em `DefinicaoCampo`:
```ts
opcoes?: { valor: string; rotulo: string }[]
```

Atualmente populado em 3 campos enum:
- `tipo_operacao_pedido` → Importação / Exportação
- `incoterm_pedido` → 11 incoterms (EXW...DDP)
- `cobertura_cambial_item` → Com Cobertura / Sem Cobertura

Outros campos com listas dinâmicas (moeda, unidade, NCM autocomplete) ficam para Fase 2.

---

## ⚠️ Anti-padrão proibido — Mock fallback silencioso

**NUNCA** mascarar erro da API com mock em DEV. Viola Mandamento 08.

### Caso real (corrigido em 2026-05-12)

```ts
// ❌ Versão antiga (api.ts) — gerou bug "5 itens afetados" mockado quando a API retornou 400
preview: (payload) =>
  request<EdicaoMassaPreview>('/api/v1/pedidos/edicoes-em-massa/preview', { ... })
    .catch(err => {
      if (import.meta.env.DEV) {
        return mockEdicaoMassaPreview(payload)  // BUG — mascara erro real
      }
    }),

// ✅ Versão atual — falha ruidosa
preview: (payload) =>
  request<EdicaoMassaPreview>('/api/v1/pedidos/edicoes-em-massa/preview', { ... }),
```

**Diagnóstico do bug original:** Zod schema desatualizado (sem `'ncm'`) → backend retornava 400 → frontend caía no mock que retornava 5 itens hardcoded de `MOCK_PEDIDOS_RESPONSE`. Usuário via dados falsos sem ser avisado.

---

## Segurança — Checklist 5 Camadas

- [x] **Rede:** rotas registradas após `withOrganizacao` middleware
- [x] **Autenticação:** Clerk JWT validado
- [x] **Autorização:** `id_organizacao` lido do contexto (não de payload)
- [x] **Isolamento:** `id_organizacao` obrigatório em TODAS as queries Prisma
- [x] **Auditoria:** histórico com campos, valores anteriores/novos, usuário e timestamp
- [x] **Campos bloqueados:** validação server-side rejeita calculados/sistema **incluindo `id_organizacao`, `id_workspace`** (fecha vetor cross-org)
- [x] **Falha ruidosa:** sem mock fallback (Mand. 08)

---

## Testes

```
server/src/services/edicaoEmMassaService.test.ts  (18 unitários)
  Fast path:
    ├── atualiza pedido com nome DDD via updateMany
  Slow path:
    ├── atualiza item com nome DDD direto (sem ACL)
    └── aplica operação somar usando valor atual da coluna DDD
  detalhes_operacionais_pedido:
    ├── grava chave JSON (nome_exportador)
    └── grava chave OPE (codigo_ope)
  Campos bloqueados:
    ├── rejeita valor_total_pedido
    ├── rejeita id_organizacao (cross-org)
    └── rejeita quantidade_transferida_item (saldoEngine)
  Preview:
    ├── lê valor direto da coluna do pedido
    ├── lê valor de detalhes_operacionais_pedido para chaves JSON
    └── lê valor de coluna DDD do item
  Cascade Combinado:
    ├── NÃO faz cascade na aba Pedido (mesmo com campo cascadeável)
    ├── faz cascade na aba Combinado para campo na whitelist
    ├── NÃO faz cascade para campo fora da whitelist
    ├── campo item explícito sobrescreve cascade do mesmo destino
    ├── preview Combinado retorna campos_pedido_alterados e campos_item_alterados
    ├── preview aba Pedido: itens_afetados=0
    └── cascade JSON pedido → coluna item (nome_exportador → nome_exportador_item)

server/src/services/edicaoEmMassaService.integration.test.ts  (11 integração — banco real)
  ├── preview lê quantidade_inicial_item direto da coluna DDD
  ├── persiste quantidade_inicial_item via nome DDD
  ├── persiste quantidade_pronta_item via nome DDD
  ├── persiste quantidade_cancelada_item via nome DDD
  ├── operação somar usa valor atual do banco
  ├── retorna contadores reais
  ├── recalcularAgregados atualiza quantidade_total_pedido
  ├── UPDATE de item respeita id_organizacao (org isolation)
  ├── rejeita campo bloqueado (quantidade_atual_item)
  └── rejeita id_organizacao no payload (cross-org)
```

---

## Skills de referência

- `skills/governanca/lei/9-mandamentos/SKILL.md` (Mand. 02 schema intocável; Mand. 03 DDD; Mand. 07 sincronia front+back; Mand. 08 sem fallback silencioso; Mand. 09 Zod bilateral)
- `skills/governanca/lei/ddd-nomenclatura/SKILL.md` (REGRA 1 sufixo; REGRA 9 label canonical)
- `skills/governanca/lei/isolamento-organizacao/SKILL.md` (`withOrganizacao`)
- `skills/governanca/lei/sdk-resolvedor-organizacao/SKILL.md` (contexto da organização)
- `skills/seguranca/seguranca-5-camadas/SKILL.md` (defesa em profundidade)
- `skills/seguranca/cross-boundary/SKILL.md` (rejeitar `id_organizacao` em payload)

---

## Histórico de versões

- **v2.0 (2026-05-12)** — DDD-puro + cascade Combinado + fix mock silencioso
  - Adiciona 21 colunas (6 Pedido + 14 PedidoItem + tipo_operacao_item)
  - Apaga ACL `legacyKeyToDddPedidoItem`
  - Adiciona `PARES_CASCADE_PEDIDO_ITEM` (25 pares)
  - `tenant_id` → `id_organizacao`, `incoterm` → `incoterm_pedido`, etc.
  - Selects para enums + máscara NCM
  - Remove mock fallback em DEV (Mand. 08)
  - Adiciona `campos_pedido_alterados` e `campos_item_alterados` no preview/resultado

- **v1.0 (Abril 2026)** — implementação inicial (substituída pela v2.0)
