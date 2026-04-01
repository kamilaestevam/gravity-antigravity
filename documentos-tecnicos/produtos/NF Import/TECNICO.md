# NF Importação — Documento Técnico Completo

> Versão: 1.0 | Atualizado: 2026-03-31 | Produto: `nf-importacao` | Porta: 8028 (server) / 5183 (client)

---

## 1. Visão Geral do Produto

**NF Importação** é um módulo de gestão de Notas Fiscais de Importação dentro do ecossistema Gravity. Gerencia o ciclo completo de uma NF fiscal de importação: da entrada do dado (XML, Smart Read, Portal Único, Manual, ERP) à composição de despesas e rateios, até a exportação para ERPs (TOTVS Protheus, SAP, SENIOR, CSV, XML, JSON, Custom).

### Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js + Express 4 + TypeScript strict |
| ORM | Prisma |
| Frontend | React 18 + Vite + React Router v6 |
| Testes | Vitest (unit) + Playwright (E2E) |
| Auth | x-internal-key (S2S) + Clerk (usuário final via configurador) |
| Isolamento | Multi-tenant com tenant_id + company_id em toda query |

---

## 2. Estrutura de Pastas

```
produto/nf-importacao/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx              ← Entry point com ClerkWrapper condicional
│       ├── App.tsx               ← Roteamento React Router v6
│       ├── shared/
│       │   ├── api.ts            ← Camada HTTP (axios) para todas as APIs
│       │   ├── config.ts         ← PRODUCT_CONFIG, feature flags
│       │   └── types.ts          ← Todos os tipos TypeScript
│       └── pages/
│           ├── NfLista/          ← Listagem de NFs com filtros
│           ├── NfDetalhe/        ← Detalhe com 6 abas
│           ├── NfNovaOrigem/     ← Wizard Step 1: canal de entrada
│           ├── NfNovaDuimp/      ← Wizard Step 2: dados da DUIMP
│           ├── NfNovaDespesas/   ← Wizard Step 3: despesas
│           ├── NfNovaRateio/     ← Wizard Step 4: rateio
│           ├── NfNovaFiscal/     ← Wizard Step 5: classificação fiscal
│           ├── NfNovaExportacao/ ← Wizard Step 6: exportação
│           └── Config/
│               ├── DespesaCatalogo/   ← Catálogo de despesas
│               ├── DespesaTemplate/   ← Templates de despesa
│               ├── ExportLayout/      ← Layouts de exportação
│               └── FavoritosFiscais/  ← Favoritos fiscais (NCM+fiscal)
└── server/
    ├── package.json
    └── src/
        ├── index.ts              ← Entry: middleware stack, CORS, health, rotas
        ├── lib/
        │   └── prisma.ts         ← Singleton do PrismaClient
        ├── middleware/
        │   ├── requireInternalKey.ts
        │   ├── tenantIsolation.ts
        │   ├── apiObservability.ts
        │   └── rateLimiter.ts
        ├── routes/
        │   ├── nfImportacao.ts   ← CRUD principal
        │   ├── nfItem.ts         ← Itens da NF
        │   ├── nfDespesa.ts      ← Despesas da NF
        │   ├── nfRateio.ts       ← Cálculo e aplicação de rateio
        │   ├── nfExportacao.ts   ← Exportação para ERP
        │   ├── nfImportar.ts     ← Importação de dados (XML, OCR, Portal)
        │   ├── nfDocumento.ts    ← Documentos anexos
        │   ├── nfHistorico.ts    ← Histórico append-only
        │   └── config.ts         ← Configurações (catálogo, template, layout, favoritos)
        ├── services/
        │   ├── nfStatusEngine.ts ← Máquina de estados da NF
        │   ├── rateioEngine.ts   ← Orquestração do rateio
        │   └── rateioAlgorithms.ts ← 9 algoritmos de rateio puro
        └── validators/
            ├── nfImportacao.ts   ← Schemas Zod para NF
            ├── nfItem.ts         ← Schemas Zod para itens
            ├── nfDespesa.ts      ← Schemas Zod para despesas
            └── config.ts         ← Schemas Zod para config
```

---

## 3. Servidor — index.ts

### Porta e Configuração

```typescript
const PORT = process.env.PORT || 8028
```

### Middleware Stack (ordem exata)

1. `helmet()` — headers de segurança (CSP desabilitado, COEP desabilitado)
2. `express.json({ limit: '10mb' })` — body parsing
3. CORS — origens permitidas: `http://localhost:5183`, `CLIENT_URL`, `CONFIGURATOR_URL`
4. Static files — `client/dist/`
5. `/health` — sem auth, verifica conexão com DB (Prisma)
6. Rate limiter — 100 req/min por tenant
7. `requireInternalKey` — valida header `x-internal-key`
8. `tenantIsolationMiddleware` — injeta `req.tenantId`, `req.userId`, `req.companyId`
9. `apiObservability` — métricas para API Cockpit
10. Rotas (ver seção 4)
11. Error handler global — retorna `{ error: { code, message, details } }`

### Headers CORS Permitidos
```
Content-Type, Authorization, x-internal-key, x-tenant-id, x-user-id, x-correlation-id, x-company-id
```

### SPA Fallback
Todas as rotas não mapeadas retornam `client/dist/index.html` para o React Router funcionar.

---

## 4. Rotas da API

Base path: `/api/v1/nf-importacao`

### 4.1 NF Principal (`nfImportacao.ts`)

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/` | Lista NFs com paginação e filtros |
| POST | `/` | Cria NF como rascunho |
| GET | `/:id` | Busca NF completa (com itens, despesas, documentos) |
| PUT | `/:id` | Atualiza NF (somente rascunho/em_composicao) |
| DELETE | `/:id` | Cancela NF (soft delete, muda status) |
| POST | `/:id/duplicar` | Duplica NF como novo rascunho |

#### GET `/` — Query Parameters
```
page: number (default 1)
limit: number (default 20)
status: rascunho | em_composicao | pronta | exportada | cancelada
busca: string (pesquisa em numero_nf, chave_acesso, exportador_nome, importador_nome, di_numero)
ordenar_por: string
direcao: asc | desc
```

#### POST `/` — Body Schema
```typescript
{
  company_id: string
  numero_nf?: string
  serie?: string
  chave_acesso?: string
  tipo_operacao: 'importacao' | 'importacao_indireta'
  natureza_operacao?: string
  data_emissao?: Date
  data_entrada?: Date
  exportador_nome?: string
  exportador_pais?: string
  importador_cnpj?: string
  importador_nome?: string
  moeda?: string (default 'USD')
  taxa_cambio?: Decimal
  valor_total_fob?: Decimal
  valor_frete?: Decimal
  valor_seguro?: Decimal
  valor_total_cif?: Decimal
  incoterm?: string
  via_transporte?: string
  porto_embarque?: string
  porto_destino?: string
  processo_id?: string
  di_numero?: string
  duimp_numero?: string
  canal_entrada?: 'MANUAL' | 'XML' | 'SMART_READ' | 'PORTAL_UNICO' | 'PROCESSO'
  observacoes?: string
}
```

#### Resposta GET `/:id` — Inclui
- `itens[]` ordenados por `numero_item`
- `despesas[]` com `rateios[]` aninhados
- `documentos[]`

---

### 4.2 Itens (`nfItem.ts`)

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/:id/itens` | Lista itens (ordenados por numero_item) |
| POST | `/:id/itens` | Adiciona item |
| PUT | `/:id/itens/:itemId` | Atualiza item (partial) |
| DELETE | `/:id/itens/:itemId` | Remove item |

#### POST — Body Completo (todos opcionais exceto NCM e descricao)
```typescript
{
  numero_item?: number          // Auto-incrementado se omitido
  ncm: string                   // 8-10 caracteres
  descricao: string
  cfop?: string
  quantidade: number            // Positivo
  unidade_medida?: string       // Default 'UN'
  peso_liquido?: Decimal
  peso_bruto?: Decimal
  valor_unitario?: Decimal
  valor_fob?: Decimal
  valor_frete_item?: Decimal
  valor_seguro_item?: Decimal
  valor_cif?: Decimal
  aliquota_ii?: Decimal
  valor_ii?: Decimal
  aliquota_ipi?: Decimal
  valor_ipi?: Decimal
  aliquota_pis?: Decimal
  valor_pis?: Decimal
  aliquota_cofins?: Decimal
  valor_cofins?: Decimal
  aliquota_icms?: Decimal
  valor_icms?: Decimal
  cst_ipi?: string
  cst_pis?: string
  cst_cofins?: string
  cst_icms?: string
  ex_tipi?: string
  fabricante?: string
  pais_origem?: string
}
```

---

### 4.3 Despesas (`nfDespesa.ts`)

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/:id/despesas` | Lista despesas (com rateios aninhados) |
| POST | `/:id/despesas` | Adiciona despesa |
| PUT | `/:id/despesas/:despesaId` | Atualiza despesa (partial) |
| DELETE | `/:id/despesas/:despesaId` | Remove despesa (cascade rateios) |
| POST | `/:id/despesas/smart-read` | Smart Read via OCR (async, 202) |
| POST | `/:id/despesas/aplicar-template` | Aplica template de despesas |

#### POST — Body
```typescript
{
  tipo: string
  descricao: string
  valor_total: Decimal
  moeda?: string               // Default 'BRL'
  taxa_cambio?: Decimal
  valor_brl?: Decimal
  metodo_rateio: 'PESO_LIQUIDO' | 'PESO_BRUTO' | 'VALOR_CIF' | 'VALOR_FOB' | 
                 'QUANTIDADE' | 'VALOR_II' | 'IGUALITARIO' | 'MANUAL' | 'CUSTOMIZADO'
  catalogo_despesa_id?: string
  fornecedor?: string
  numero_documento?: string
  data_documento?: Date
  observacoes?: string
}
```

#### Side Effect: POST despesa
Ao adicionar a primeira despesa, a NF transita automaticamente de `rascunho` → `em_composicao`.

---

### 4.4 Rateio (`nfRateio.ts`)

| Método | Path | Descrição |
|--------|------|-----------|
| POST | `/:id/rateio/preview` | Calcula rateio sem persistir |
| POST | `/:id/rateio/aplicar` | Aplica rateio (deleta antigos, cria novos) |
| PUT | `/:id/rateio/:rateioId` | Override manual de um rateio específico |

#### POST `/preview` — Resposta
```typescript
{
  despesas: [{
    despesaId: string
    tipo: string
    valorTotal: Decimal
    metodo: string
    resultado: {
      itens: [{ itemId: string, valor_rateado: Decimal, percentual: Decimal }]
      warnings: string[]
    }
  }]
  totalGeral: Decimal
  warnings: string[]
}
```

#### PUT `/:id/rateio/:rateioId` — Body
```typescript
{ valor_rateado: Decimal }  // Deve ser >= 0
```
Atualiza `metodo_usado` para `MANUAL`, recalcula `percentual`.

---

### 4.5 Exportação (`nfExportacao.ts`)

| Método | Path | Descrição |
|--------|------|-----------|
| POST | `/:id/exportar` | Gera arquivo de exportação |
| GET | `/:id/exportar/preview` | Preview em JSON sem exportar |

#### POST — Body
```typescript
{
  formato: 'TOTVS_PROTHEUS' | 'SAP' | 'SENIOR' | 'CSV' | 'XML' | 'JSON' | 'CUSTOM'
  layout_id?: string         // Para formato CUSTOM
}
```

#### Requisito
NF deve estar com status `pronta` ou `exportada`.
Side effect: NF em `pronta` transita para `exportada`.

#### Resposta
```typescript
{
  nf_importacao_id: string
  formato: string
  extensao: string            // '.csv', '.xml', '.json', etc.
  mime_type: string
  conteudo: string            // Base64 ou texto
  tamanho_bytes: number
  gerado_em: Date
}
```

---

### 4.6 Importação (`nfImportar.ts`)

| Método | Path | Descrição |
|--------|------|-----------|
| POST | `/importar/xml` | Importa XML DUIMP/DI |
| POST | `/importar/smart-read` | Importa via OCR (async) |
| POST | `/importar/portal-unico` | Importa do Portal Único |
| POST | `/importar/processo/:processoId` | Cria NF a partir de Processo Gravity |

#### POST `/importar/xml` — Body
```typescript
{
  company_id: string
  xml_content: string
  nome_arquivo: string
}
```

#### POST `/importar/portal-unico` — Body
```typescript
{
  company_id: string
  di_numero?: string
  duimp_numero?: string
  chave_acesso?: string       // Ao menos um dos três
}
```

#### POST `/importar/processo/:processoId` — Header
```
x-company-id: string         // Obrigatório
```

---

### 4.7 Documentos (`nfDocumento.ts`)

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/:id/documentos` | Lista documentos (desc por created_at) |
| POST | `/:id/documentos` | Faz upload de documento |
| DELETE | `/:id/documentos/:docId` | Remove documento |

#### POST — Body
```typescript
{
  nome_arquivo: string
  tipo_documento: string
  mime_type: string
  tamanho_bytes: number
  storage_key: string         // Chave no storage (S3/R2/etc.)
}
```

---

### 4.8 Histórico (`nfHistorico.ts`)

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/:id/historico` | Lista eventos (últimos 100, desc por created_at) |

**Read-only** — sem mutações.

---

### 4.9 Configurações (`config.ts`)

#### Catálogo de Despesas (`/config/despesas`)

| Método | Path |
|--------|------|
| GET | `/config/despesas` |
| POST | `/config/despesas` |
| PUT | `/config/despesas/:id` |
| DELETE | `/config/despesas/:id` |

Body POST:
```typescript
{
  company_id: string
  codigo: string              // Único por tenant+company
  nome: string
  tipo: string
  descricao?: string
  metodo_rateio_padrao?: string
  moeda_padrao?: string
  ativo?: boolean
}
```

#### Templates de Despesa (`/config/templates`)

| Método | Path |
|--------|------|
| GET | `/config/templates` |
| POST | `/config/templates` |
| PUT | `/config/templates/:id` |
| DELETE | `/config/templates/:id` |

Body POST (transacional — template + itens criados atomicamente):
```typescript
{
  company_id: string
  nome: string
  descricao?: string
  ativo?: boolean
  itens: [{
    tipo: string
    descricao: string
    metodo_rateio: string
    ordem: number
  }]
}
```

#### Layouts de Exportação (`/config/layouts`)

| Método | Path |
|--------|------|
| GET | `/config/layouts` |
| POST | `/config/layouts` |
| PUT | `/config/layouts/:id` |
| DELETE | `/config/layouts/:id` |

Body POST:
```typescript
{
  company_id: string
  nome: string
  descricao?: string
  formato: 'TOTVS_PROTHEUS' | 'SAP' | 'SENIOR' | 'CSV' | 'XML' | 'JSON' | 'CUSTOM'
  separador?: string
  encoding?: string
  ativo?: boolean
  campos: [{
    campo_origem: string
    campo_destino: string
    tipo: string
    formato?: string
    valor_padrao?: string
    ordem: number
  }]
}
```

#### Favoritos Fiscais (`/config/favoritos-fiscais`)

| Método | Path |
|--------|------|
| GET | `/config/favoritos-fiscais` |
| POST | `/config/favoritos-fiscais` |
| PUT | `/config/favoritos-fiscais/:id` |
| DELETE | `/config/favoritos-fiscais/:id` |

Body POST:
```typescript
{
  company_id: string
  nome: string
  descricao?: string
  ncm: string
  cfop?: string
  cst_ipi?: string
  cst_pis?: string
  cst_cofins?: string
  cst_icms?: string
  aliquota_ii?: Decimal
  aliquota_ipi?: Decimal
  aliquota_pis?: Decimal
  aliquota_cofins?: Decimal
  aliquota_icms?: Decimal
  ex_tipi?: string
  ativo?: boolean
}
```

---

## 5. Services (Lógica de Negócio)

### 5.1 nfStatusEngine.ts — Máquina de Estados

**Estados válidos**:
```
rascunho → em_composicao → pronta → exportada (terminal)
         ↘              ↘         ↘
          cancelada ←── cancelada ←─ cancelada (terminal)
```

**Transições válidas**:
```typescript
const TRANSITIONS = {
  rascunho: ['em_composicao', 'cancelada'],
  em_composicao: ['pronta', 'cancelada'],
  pronta: ['exportada', 'cancelada'],
  exportada: [],
  cancelada: [],
}
```

**Função principal**:
```typescript
transitarStatus({
  prisma, nfId, tenantId, companyId,
  statusNovo, userId, userNome?, descricao?, dadosExtras?
}) → { success, statusAnterior, statusNovo }
```

**Validação para `pronta`**:
- NF deve ter ≥ 1 item
- NF deve ter ≥ 1 despesa
- Todas as despesas devem ter rateios calculados

**Timestamps definidos automaticamente**:
- `data_inicio_composicao` quando → em_composicao
- `data_pronta` quando → pronta
- `data_exportacao` quando → exportada
- `data_cancelamento` quando → cancelada

**Side effect de toda transição**:
Cria `NfImportacaoHistorico` append-only com ação, descrição, dados anteriores/novos.

---

### 5.2 rateioEngine.ts — Orquestração do Rateio

```typescript
previewRateio(prisma, nfId, tenantId)
  → { despesas: [...], totalGeral, warnings }

aplicarRateio(prisma, nfId, tenantId, userId)
  → { despesas: [{ despesaId, rateioCriados }], totalRateios }
  // Deleta rateios antigos, cria novos em transação atômica
  // Valida: soma diff ≤ R$ 0,01

overrideManual(prisma, rateioId, novoValor, tenantId, userId)
  → { rateioId, valor_rateado, percentual }
  // Atualiza metodo_usado = 'MANUAL', recalcula percentual
  // Validação: valor >= 0, NF em em_composicao
```

---

### 5.3 rateioAlgorithms.ts — 9 Algoritmos de Rateio

Função pura (sem acesso a DB):

```typescript
calcularRateio(metodo, valorTotal, itens, valoresManual?)
  → { itens: [{ itemId, valor_rateado, percentual }], warnings }
```

| Método | Base de Cálculo |
|--------|----------------|
| `PESO_LIQUIDO` | proporcional a `item.peso_liquido` |
| `PESO_BRUTO` | proporcional a `item.peso_bruto` |
| `VALOR_CIF` | proporcional a `item.valor_cif` |
| `VALOR_FOB` | proporcional a `item.valor_fob` |
| `QUANTIDADE` | proporcional a `item.quantidade` |
| `VALOR_II` | proporcional a `item.valor_ii` |
| `IGUALITARIO` | divisão igual entre todos os itens |
| `MANUAL` | valores pré-definidos pelo usuário (validação) |
| `CUSTOMIZADO` | soma ponderada de combinação customizada de campos |

**Regras de arredondamento**:
- ROUND_HALF_UP a 2 casas decimais
- O último item absorve a diferença de centavos (`is_centavo_restante = true`)
- Fallback para IGUALITARIO se divisor for zero
- Nunca valores negativos

---

## 6. Modelos de Dados

### NfImportacao

```typescript
{
  id: string                   // Prefixo nfim_id_ + seq/ano
  tenant_id: string            // Obrigatório — isolamento multi-tenant
  company_id: string
  product_id: string
  user_id: string

  // Identificação
  numero_nf?: string
  serie?: string
  chave_acesso?: string
  tipo_operacao: 'importacao' | 'importacao_indireta'
  natureza_operacao?: string

  // Datas
  data_emissao?: Date
  data_entrada?: Date

  // Exportador / Importador
  exportador_nome?: string
  exportador_pais?: string
  importador_cnpj?: string
  importador_nome?: string

  // Câmbio e valores
  moeda?: string
  taxa_cambio?: Decimal
  valor_total_fob?: Decimal
  valor_frete?: Decimal
  valor_seguro?: Decimal
  valor_total_cif?: Decimal

  // Logística
  incoterm?: string
  via_transporte?: string
  porto_embarque?: string
  porto_destino?: string

  // Vínculos
  processo_id?: string
  di_numero?: string
  duimp_numero?: string
  duimp_data_registro?: Date

  // Totais calculados (string para precisão Decimal)
  total_fob: string
  total_frete: string
  total_seguro: string
  total_cif: string
  total_ii: string
  total_ipi: string
  total_pis: string
  total_cofins: string
  total_icms: string
  total_despesas: string
  total_nf: string

  // Controle
  canal_entrada: 'MANUAL' | 'XML' | 'SMART_READ' | 'PORTAL_UNICO' | 'PROCESSO'
  casas_decimais_valor?: number
  casas_decimais_qtd?: number
  status: 'rascunho' | 'em_composicao' | 'pronta' | 'exportada' | 'cancelada'

  // Timestamps de status
  data_inicio_composicao?: Date
  data_pronta?: Date
  data_exportacao?: Date
  data_cancelamento?: Date
  formato_exportado?: string

  // Observações
  observacoes?: string

  // Audit
  created_by: string
  updated_by?: string
  is_demo: boolean
  created_at: Date
  updated_at: Date

  // Relações
  itens: NfImportacaoItem[]
  despesas: NfImportacaoDespesa[]
  documentos: NfImportacaoDocumento[]
  historico: NfImportacaoHistorico[]
}
```

### NfImportacaoItem

```typescript
{
  id: string                   // Prefixo nfit_id_
  tenant_id: string
  company_id: string
  nf_importacao_id: string

  // Identificação
  numero_adicao?: string
  numero_item: number          // Auto-incrementado
  ncm: string                  // 8-10 dígitos
  descricao: string
  fabricante?: string
  pais_origem?: string

  // Quantidades
  quantidade_estatistica?: Decimal
  unidade_medida: string       // Default 'UN'
  quantidade_comercial?: Decimal
  unidade_medida_comercial?: string

  // Pesos
  peso_liquido?: Decimal
  peso_bruto?: Decimal

  // Valores comerciais
  valor_fob?: Decimal
  valor_frete?: Decimal
  valor_seguro?: Decimal
  valor_cif?: Decimal

  // Impostos
  ii_aliquota?: Decimal        // Imposto de Importação (%)
  ii_valor?: Decimal
  ipi_aliquota?: Decimal
  ipi_valor?: Decimal
  pis_aliquota?: Decimal
  pis_valor?: Decimal
  cofins_aliquota?: Decimal
  cofins_valor?: Decimal
  icms_aliquota?: Decimal
  icms_valor?: Decimal
  icms_base?: Decimal

  // Classificação fiscal
  cfop?: string
  cst_icms?: string
  cst_ipi?: string
  cst_pis?: string
  cst_cofins?: string
  ex_tipi?: string             // Ex-tarifário do TIPI

  // Benefício
  beneficio_fiscal?: string
  beneficio_descricao?: string

  // Totais
  total_despesas_rateadas?: Decimal
  total_item?: Decimal

  created_at: Date
  updated_at: Date
}
```

### NfImportacaoDespesa

```typescript
{
  id: string                   // Prefixo nfdp_id_
  tenant_id: string
  company_id: string
  nf_importacao_id: string

  // Identificação
  catalogo_despesa_id?: string  // Vínculo com catálogo
  nome: string
  descricao?: string
  valor_total: Decimal

  // Câmbio
  moeda?: string               // BRL, USD, EUR, etc.
  taxa_cambio?: Decimal
  valor_brl?: Decimal          // Convertido

  // Fornecedor
  cnpj_prestador?: string
  data_despesa?: Date

  // Método de rateio
  metodo_rateio: 'PESO_LIQUIDO' | 'PESO_BRUTO' | 'VALOR_CIF' | 'VALOR_FOB' |
                 'QUANTIDADE' | 'VALOR_II' | 'IGUALITARIO' | 'MANUAL' | 'CUSTOMIZADO'
  formula_customizada?: string

  // Origem
  origem: 'MANUAL' | 'TEMPLATE' | 'SMART_READ' | 'PLANILHA'
  documento_id?: string        // Vínculo com NfImportacaoDocumento

  // Contabilidade
  conta_contabil?: string
  centro_custo?: string

  created_at: Date
  updated_at: Date

  // Relação
  rateios: NfImportacaoRateio[]
}
```

### NfImportacaoRateio

```typescript
{
  id: string                   // Prefixo nfrt_id_
  tenant_id: string
  company_id: string
  despesa_id: string           // FK → NfImportacaoDespesa
  item_id: string              // FK → NfImportacaoItem

  valor_rateado: Decimal
  percentual_rateio: Decimal
  metodo_usado: string         // Método efetivamente utilizado
  is_override_manual: boolean  // True se usuário sobrescreveu
  is_centavo_restante: boolean // True se absorveu diferença de arredondamento

  created_at: Date
  updated_at: Date
}
```

### NfImportacaoDocumento

```typescript
{
  id: string
  tenant_id: string
  company_id: string
  nf_importacao_id: string

  tipo: string
  nome_arquivo: string
  mime_type: string
  tamanho_bytes: number
  storage_key: string          // Chave no armazenamento externo

  // Smart Read
  smart_read_processado?: boolean
  smart_read_resultado?: JSON  // Resultado OCR/AI

  created_by: string
  created_at: Date
}
```

### NfImportacaoHistorico (Append-Only)

```typescript
{
  id: string
  tenant_id: string
  company_id: string
  nf_importacao_id: string

  acao: string                 // Ex: 'STATUS_TRANSITION', 'CREATED', 'DESPESA_ADICIONADA'
  descricao: string
  dados_anteriores?: JSON
  dados_novos?: JSON

  user_id: string
  user_nome?: string
  created_at: Date
  // Sem updated_at — imutável
}
```

### DespesaCatalogo

```typescript
{
  id: string
  tenant_id: string
  company_id: string
  codigo: string               // Único por tenant+company
  nome: string
  descricao?: string
  metodo_rateio_padrao?: string
  conta_contabil?: string
  centro_custo?: string
  ativo: boolean
  created_by: string
  created_at: Date
  updated_at: Date
}
```

### DespesaTemplate + DespesaTemplateItem

```typescript
DespesaTemplate {
  id: string
  tenant_id: string
  company_id: string
  nome: string
  descricao?: string
  is_padrao: boolean
  ativo: boolean
  itens: DespesaTemplateItem[]
  created_at: Date
}

DespesaTemplateItem {
  id: string
  template_id: string
  tipo: string
  valor_padrao?: Decimal
  metodo_rateio: string
  ordem: number
}
```

### ExportLayout + ExportLayoutCampo

```typescript
ExportLayout {
  id: string
  tenant_id: string
  company_id: string
  nome: string
  descricao?: string
  formato: 'TOTVS_PROTHEUS' | 'SAP' | 'SENIOR' | 'CSV' | 'XML' | 'JSON' | 'CUSTOM'
  separador?: string
  codificacao?: string         // UTF-8, ISO-8859-1, etc.
  has_header: boolean
  has_footer: boolean
  header_template?: string
  footer_template?: string
  is_padrao: boolean
  ativo: boolean
  campos: ExportLayoutCampo[]
}

ExportLayoutCampo {
  id: string
  layout_id: string
  campo_origem: string         // Campo do modelo Gravity
  label?: string
  ordem: number
  tipo_dado: string
  formato?: string
  tamanho_fixo?: number        // Para arquivos posicionais
  posicao_inicio?: number
  alinhamento?: string         // LEFT, RIGHT, CENTER
  preenchimento?: string       // Char de padding
  valor_padrao?: string
  transformacao?: string       // Expressão de transformação
}
```

### FavoritoFiscal

```typescript
{
  id: string
  tenant_id: string
  company_id: string
  nome: string
  descricao?: string
  ncm: string
  uf_destino?: string
  tipo_operacao?: string

  // Códigos fiscais
  cfop?: string
  cst_icms?: string
  cst_ipi?: string
  cst_pis?: string
  cst_cofins?: string
  beneficio_fiscal?: string
  descricao_beneficio?: string

  // Alíquotas
  aliquota_ii?: Decimal
  aliquota_ipi?: Decimal
  aliquota_pis?: Decimal
  aliquota_cofins?: Decimal
  aliquota_icms?: Decimal
  ex_tipi?: string

  ativo: boolean
  created_by: string
  created_at: Date
  updated_at: Date
}
```

---

## 7. Geração de IDs

Formato: `{prefixo}{sequencial 7 dígitos}/{ano 2 dígitos}`

| Entidade | Prefixo | Exemplo |
|----------|---------|---------|
| NfImportacao | `nfim_id_` | `nfim_id_0000001/26` |
| NfImportacaoItem | `nfit_id_` | `nfit_id_0000001/26` |
| NfImportacaoDespesa | `nfdp_id_` | `nfdp_id_0000001/26` |
| NfImportacaoRateio | `nfrt_id_` | `nfrt_id_0000001/26` |

---

## 8. Client — App.tsx (Roteamento)

```typescript
// Rotas principais
/ → redirect → /nf-importacao
/nf-importacao → <NfLista />
/nf-importacao/nova → <NfNovaOrigem />  (Wizard Step 1)
/nf-importacao/nova/duimp → <NfNovaDuimp />
/nf-importacao/nova/despesas → <NfNovaDespesas />
/nf-importacao/nova/rateio → <NfNovaRateio />
/nf-importacao/nova/fiscal → <NfNovaFiscal />
/nf-importacao/nova/exportacao → <NfNovaExportacao />
/nf-importacao/:id → <NfDetalhe />       (aba padrão: itens)
/nf-importacao/:id/:tab → <NfDetalhe tab={tab} />
/nf-importacao/config/despesas → <DespesaCatalogo />
/nf-importacao/config/templates → <DespesaTemplate />
/nf-importacao/config/layouts → <ExportLayout />
/nf-importacao/config/favoritos → <FavoritosFiscais />
* → redirect → /nf-importacao
```

---

## 9. Client — shared/api.ts

### Context
```typescript
setApiContext({ tenantId: string, userId: string })
// Chamado uma vez no App.tsx ao inicializar
```

### Objetos de API

```typescript
nfApi = {
  listar(params?) → Promise<{ data: NfImportacao[], total }>
  buscarPorId(id) → Promise<NfImportacao>
  criar(data) → Promise<NfImportacao>
  atualizar(id, data) → Promise<NfImportacao>
  cancelar(id) → Promise<void>
  duplicar(id) → Promise<NfImportacao>
}

importarApi = {
  xml(file: File) → Promise<NfImportacao>
  smartRead(file: File) → Promise<{ preview, confianca }>
  portalUnico(duimpNumero: string) → Promise<NfImportacao>
  processo(processoId: string) → Promise<NfImportacao>
}

itemApi = {
  listar(nfId) → Promise<NfImportacaoItem[]>
  adicionar(nfId, data) → Promise<NfImportacaoItem>
  atualizar(nfId, itemId, data) → Promise<NfImportacaoItem>
  remover(nfId, itemId) → Promise<void>
}

despesaApi = {
  listar(nfId) → Promise<NfImportacaoDespesa[]>
  adicionar(nfId, data) → Promise<NfImportacaoDespesa>
  atualizar(nfId, despesaId, data) → Promise<NfImportacaoDespesa>
  remover(nfId, despesaId) → Promise<void>
  smartRead(nfId, file) → Promise<NfImportacaoDespesa[]>
  aplicarTemplate(nfId, templateId) → Promise<NfImportacaoDespesa[]>
}

rateioApi = {
  preview(nfId) → Promise<RateioPreviewResult[]>
  aplicar(nfId) → Promise<NfImportacaoRateio[]>
  override(nfId, rateioId, valor) → Promise<NfImportacaoRateio>
}

exportacaoApi = {
  gerar(nfId, formato, layoutId?) → Promise<{ url, nome_arquivo }>
  preview(nfId, formato, layoutId?) → Promise<{ conteudo, linhas }>
}

catalogoApi = {
  listar() → Promise<DespesaCatalogo[]>
  criar(data) → Promise<DespesaCatalogo>
  atualizar(id, data) → Promise<DespesaCatalogo>
  remover(id) → Promise<void>
}

templateApi = {
  listar() → Promise<DespesaTemplate[]>
  criar(data) → Promise<DespesaTemplate>
  atualizar(id, data) → Promise<DespesaTemplate>
  remover(id) → Promise<void>
}

layoutApi = {
  listar() → Promise<ExportLayout[]>
  criar(data) → Promise<ExportLayout>
  atualizar(id, data) → Promise<ExportLayout>
  remover(id) → Promise<void>
}

favoritoApi = {
  listar() → Promise<FavoritoFiscal[]>
  criar(data) → Promise<FavoritoFiscal>
  atualizar(id, data) → Promise<FavoritoFiscal>
  remover(id) → Promise<void>
}

documentoApi = {
  listar(nfId) → Promise<NfImportacaoDocumento[]>
  upload(nfId, file, tipo) → Promise<NfImportacaoDocumento>
  remover(nfId, docId) → Promise<void>
}

historicoApi = {
  listar(nfId) → Promise<NfImportacaoHistorico[]>
}
```

---

## 10. Client — shared/config.ts (PRODUCT_CONFIG)

```typescript
{
  id: 'nf-importacao',
  productId: 'nf-importacao',
  name: 'NF Importacao',
  port: 8028,

  tenantServices: [
    'historico', 'notificacoes', 'email',
    'dashboard', 'api-cockpit', 'conector-erp'
  ],

  productServices: [
    'rateio-engine', 'export-engine',
    'status-engine', 'smart-read'
  ],

  navigation: [
    { id: 'lista', label: 'Notas Fiscais', source: 'product' },
    { id: 'nova', label: 'Nova NF', source: 'product' },
    { id: 'config-despesas', label: 'Catalogo Despesas', source: 'product' },
    { id: 'config-templates', label: 'Templates', source: 'product' },
    { id: 'config-layouts', label: 'Layouts Export', source: 'product' },
    { id: 'config-favoritos', label: 'Favoritos Fiscais', source: 'product' },
    { id: 'historico', label: 'Historico', source: 'tenant' },
    { id: 'notificacoes', label: 'Notificacoes', source: 'tenant' },
  ],

  features: {
    rateio_multi_metodo: true,
    export_multi_formato: true,
    smart_read_duimp: true,
    smart_read_recibos: true,
    catalogo_despesas: true,
    templates_despesas: true,
    construtor_layout: true,
    favoritos_fiscais: true,
    integracao_processo: true,
    integracao_erp: true,
    ids_corporativos: true,
  }
}
```

---

## 11. Segurança e Isolamento Multi-Tenant

### Headers Obrigatórios (toda rota exceto /health)

| Header | Tipo | Descrição |
|--------|------|-----------|
| `x-internal-key` | string | Chave de serviço S2S |
| `x-tenant-id` | string | ID do tenant |
| `x-user-id` | string | ID do usuário |
| `x-company-id` | string (opcional) | Filtro por empresa |

### Regras de Isolamento

- TODA query Prisma filtra `WHERE tenant_id = :tenantId`
- Quando `x-company-id` presente, adiciona `AND company_id = :companyId`
- Nenhuma query sem filtro de `tenant_id` é permitida

### Erros

O error handler global retorna sempre:
```json
{
  "error": {
    "code": "NF_NOT_FOUND",
    "message": "NF não encontrada",
    "details": {}
  }
}
```

---

## 12. Implementações Placeholder (TODO)

As seguintes funcionalidades existem como stub no backend mas ainda precisam de implementação completa:

1. **Parser XML** (`nfImportar.ts`) — leitura completa de XML DUIMP/DI
2. **Smart Read OCR** — processamento assíncrono com IA/OCR
3. **Integração Portal Único** — chamadas à API Siscomex
4. **Formatadores de Exportação** — TOTVS Protheus, SAP, SENIOR
5. **Páginas do cliente** — todas as páginas são UI stub, precisam de formulários

---

## 13. Testes

### Unitários (Vitest)
```
produto/nf-importacao/server/src/lib/__tests__/    ← testes de lib
produto/nf-importacao/server/src/services/__tests__/ ← testes de services
produto/nf-importacao/server/src/validators/__tests__/ ← testes de validators
```

### E2E (Playwright)
```
testes/testes-e2e/nf-importacao/nf-importacao-completo.spec.ts
```
Configuração: `playwright.config.ts` → projeto `nf-importacao`, baseURL `http://localhost:5183`

### Cobertura Mínima
- 70% geral (regra Gravity para produtos)

---

## 14. Integração com o Ecossistema Gravity

| Serviço | Integração |
|---------|-----------|
| Configurador | Auth/tenant via Clerk, permissões |
| Histórico (tenant) | Audit trail automático |
| Dashboard (tenant) | KPIs do produto |
| Notificações | Alertas de status |
| Email | Notificações de exportação |
| API Cockpit | Métricas e tokens de API |
| Conector ERP | Integração SAP/TOTVS |
| Processo Gravity | Criação de NF a partir de processo |

---

## 15. Portas e URLs

| Ambiente | Frontend | Backend |
|----------|----------|---------|
| Desenvolvimento | `http://localhost:5183` | `http://localhost:8028` |
| API Prefix | — | `/api/v1/nf-importacao` |

---

*Documento gerado automaticamente a partir do código-fonte em 2026-03-31.*
