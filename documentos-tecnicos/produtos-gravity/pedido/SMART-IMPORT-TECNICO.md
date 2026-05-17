# Smart Import — Documento Técnico

> **Produto:** Pedido (COMEX)
> **Versão:** 1.3
> **Data:** Maio 2026
> **Status:** Implementado e em produção
>
> **Changelog 1.3 (maio/2026):**
> - Estrutura de arquivos atualizada — `ModalPedidoSmartImport.tsx` (antes `SmartImportModal.tsx`)
>   e `routes/importacoes-inteligentes-pedido.ts` (antes `routes/smartImport.ts`)
> - Nova seção **§ Robustez — 13 pontos cegos cobertos (P0/P1/P2/P3)** documentando
>   todos os AppError codes (`JSON_MALFORMADO`, `JSON_VAZIO`, `PDF_PROTEGIDO`,
>   `PDF_ESCANEADO`, encoding fallback latin1, conflitos de mapeamento, etc.)
> - Schema Zod compartilhado `smartImportPreviewSchema` em
>   `produto/pedido/shared/smart-import-schemas.ts` (REGRA 06+09 — contrato bilateral)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript strict, Vite |
| Backend | Express + TypeScript, Prisma ORM |
| IA — extração PDF | Google Gemini 2.5 Flash (via `@google/generative-ai`) |
| Parse Excel | SheetJS (`xlsx`) |
| Parse PDF fallback | `pdf-parse` |
| Validação | Zod bilateral (request + response) — schema único em `shared/smart-import-schemas.ts` |
| Auth | JWT Clerk (frontend) + `x-id-organizacao` + `x-id-usuario` + `x-chave-interna-servico` S2S |
| Hash | SHA-256 via Node.js `node:crypto` |
| Testes | Vitest (45+ testes) |

---

## Estrutura de Arquivos

```
produto/pedido/
├── shared/                                              ← Cross-tier (server + client)
│   ├── campos-pedido-ddd.ts                            ← SSOT dos 92 campos Pedido+Item
│   └── smart-import-schemas.ts                          ← Zod bilateral (REGRA 06+09)
├── client/
│   └── src/
│       ├── components/
│       │   └── SmartImport/
│       │       ├── ModalPedidoSmartImport.tsx          ← Orquestra as 4 etapas + estados globais
│       │       ├── EtapaUpload.tsx                     ← Passo 1: drag-and-drop de arquivo
│       │       ├── EtapaMapeamento.tsx                 ← Passo 2: mapeamento coluna → campo sistema
│       │       ├── EtapaPreview.tsx                    ← Passo 3: validação linha a linha
│       │       └── EtapaConfirmacao.tsx                ← Passo 4: resultado + opção de reverter
│       ├── shared/
│       │   ├── types.ts                                ← SmartImportPreview, ConflitoMapeamento, etc.
│       │   └── api.ts                                  ← smartImportApi (parse Zod na resposta)
│       └── vite.config.ts                              ← Proxy /api com timeout 120s
└── server/
    └── src/
        ├── routes/
        │   └── importacoes-inteligentes-pedido.ts      ← Rotas, Zod, rate limit, magic bytes PDF
        └── services/
            ├── smartImportService.ts                    ← Orquestrador principal + validações P0..P3
            ├── importEngine.ts                         ← Parser multi-formato + encoding fallback
            ├── geminiPdfExtractor.ts                   ← Extração de invoice PDF com Gemini
            └── mapeamentoMemoriaService.ts              ← Persistência de mapeamento por hash
```

---

## Tipos TypeScript

### Backend (`server/src/services/smartImportService.ts`)

```ts
export interface SmartImportPreview {
  total_linhas:         number
  total_pedidos:        number
  total_itens:          number
  mapeamento:           ColunaMapeadaBackend[]
  confianca_global:     number
  memoria_aplicada:     boolean
  preview_id:           string
  linhas:               SmartImportLinha[]
  limite_excedido:      boolean
  extrator_usado:       string   // 'gemini' | 'pdf-parse' | 'xlsx' | 'csv' | 'json' | 'xml' | 'txt'
  dados_brutos:         Array<{ linha: number; valores: Record<string, string> }>
  conflitos_mapeamento: ConflitoMapeamento[]   // P2.4 — 2+ colunas -> mesmo campo_sistema
}

// P2.4 — Conflito quando 2+ colunas apontam para o mesmo campo do sistema
export interface ConflitoMapeamento {
  campo_sistema:   string
  colunas_arquivo: string[]
}

export interface SmartImportLinha {
  linha_arquivo: number
  numero_pedido: string | null
  status:        'ok' | 'aviso' | 'erro'
  alertas:       SmartImportAlerta[]
  dados:         Record<string, unknown>
}

export interface SmartImportAlerta {
  campo:    string
  tipo:     'obrigatorio_ausente' | 'formato_invalido' | 'valor_negativo' | 'duplicado_sistema' | 'duplicado_arquivo'
  mensagem: string
  nivel:    'aviso' | 'erro'
}

export interface SmartImportConfirmar {
  preview_id:            string
  mapeamento_confirmado: ColunaMapeadaBackend[]
  decisoes_duplicatas:   Record<string, 'sobrescrever' | 'criar' | 'pular'>
  linhas_incluidas:      number[]
  salvar_mapeamento:     boolean
  numeros_editados?:     Record<number, string>
  linhas?:               SmartImportLinha[]  // fallback stateless (multi-instância)
}

export interface SmartImportResultado {
  criados:     number
  atualizados: number
  pulados:     number
  erros:       { linha: number; motivo: string }[]
  ids_criados: string[]
}
```

### `importEngine.ts`

```ts
export interface ParseResultado {
  linhas:        LinhaArquivo[]
  extrator_usado: string
}

export type LinhaArquivo = Record<string, string>
```

---

## API Endpoints

Todas as rotas ficam em `/api/v1/pedidos/importacoes-inteligentes`.

### `POST /analisar`

**Tipo:** `multipart/form-data` (campo `arquivo`)

**Headers obrigatórios:**
- `Authorization: Bearer <jwt>` (Clerk)
- `x-id-organizacao: <string>`
- `x-id-usuario: <string>`
- `x-chave-interna-servico: <string>` (S2S)

**Query params opcionais:**
- `?sheet=<nome-da-aba>` — para xlsx com múltiplas abas

**Rate limit:** 10 uploads por tenant por minuto.

**Validações (antes de chegar ao service):**
- Extensão: `.xlsx .xls .csv .xml .txt .json .pdf`
- Tamanho: máximo 10 MB (via multer)
- Magic bytes: PDF deve começar com `%PDF` (rejeita HTML com extensão .pdf)

**Resposta `200`:** `SmartImportPreview`

**Resposta especial (xlsx com múltiplas abas sem `?sheet`):**
```json
{ "multiplas_planilhas": true, "planilhas": ["Aba1", "Aba2"], "preview": null }
```

---

### `POST /confirmar`

**Body:** `SmartImportConfirmar` (validado por Zod)

**Segurança:** `preview_id` deve começar com `<tenant_id>-` (validado na rota **e** no service — defense in depth).

**Resposta `200`:** `SmartImportResultado`

---

### `POST /reverter`

**Body:** `{ ids_criados: string[] }` (máx. 500 IDs)

Cancela pedidos criados pelo import (soft delete via `status = 'cancelado'`). Só afeta pedidos com `status = 'rascunho'`.

**Resposta `200`:** `{ revertidos: number, ids: string[] }`

---

### `GET /campos`

Lista todos os campos mapeáveis, incluindo colunas customizadas do tenant.

**Resposta `200`:** `Array<{ valor: string; rotulo: string }>`

---

### `GET /template`

Download de planilha modelo (.xlsx) com cabeçalhos e uma linha de exemplo.

---

### `GET /mapeamento/:hash`

Retorna o mapeamento salvo para o hash de colunas informado, ou `null` se não houver memória.

---

### `POST /mapeamento/salvar`

Salva mapeamento confirmado associado ao hash de colunas.

---

## Serviço Principal (`smartImportService.ts`)

### Fluxo de `analisar()`

```
1. parseArquivo(buffer, nome) → { linhas, extrator_usado }
2. Extrair cabeçalhos + calcular hashColunas (SHA-256, 16 chars)
3. Buscar mapeamento salvo na memória (memoriaService.buscar)
   ├── Encontrou → aplicar memoria + popular exemplo_valor
   └── Não encontrou → mapearComIA() + inferirPorDados()
4. Aplicar mapeamento nas linhas (aplicarMapeamento)
5. Agrupar por numero_pedido para contagem
6. Buscar duplicatas no banco (pedido.findMany)
7. Marcar linhas duplicadas com alerta 'duplicado_sistema'
8. Salvar preview no previewCache (TTL 30 min, chave = tenantId-hash-timestamp)
9. Construir dados_brutos (linhas originais sem mapeamento)
10. Retornar SmartImportPreview com extrator_usado e dados_brutos
```

### Algoritmo de Mapeamento (`mapearComIA`)

Dois casos, avaliados em ordem:

**Caso 1 — Exact system field match (confiança 99%)**
> Quando o Gemini extrai um PDF, ele usa os nomes internos do sistema (`moeda_pedido`, `valor_unitario_item`, etc.) como nomes de coluna. Nesse caso, a coluna já é o campo — não precisa de matching.

```ts
if (camposSistema.includes(cabecalho)) {
  return { campo_sistema: cabecalho, confianca: 99, nivel: 'auto' }
}
```

**Caso 2 — Alias matching (arquivos Excel/CSV com nomes humanos)**

```ts
const cab = cabecalho.toLowerCase().trim().replace(/[_-]/g, ' ')
// "po_number" → "po number" → bate com alias "po number" do numero_pedido
```

- Match exato → score 97
- Match parcial (cab.includes(alias) ou alias.includes(cab)) → score 70–95
  - Requer `alias.length >= 4` para evitar falsos positivos
- Nível: score ≥ 90 → `auto` | score ≥ 50 → `confirmado` | resto → `ignorado`

**`exemplo_valor`:** primeiro valor não-vazio das 10 primeiras linhas da amostra, truncado a 80 chars.

### Inferência pelos dados (`inferirPorDados`)

Quando o alias matching não identificou o campo, analisa os valores:

| Detecção | Critério | Confiança |
|---|---|---|
| `incoterm` | 100% dos valores são Incoterms conhecidos (FOB, CIF, EXW…) | 92% |
| `moeda_pedido` | 100% dos valores são moedas ISO (USD, EUR, BRL…) | 91% |
| `ncm` | ≥ 70% dos valores têm 8 dígitos (padrão NCM/HS) | 88% |
| `data_embarque` | ≥ 80% dos valores são datas (DD/MM/AAAA, AAAA-MM-DD) | 72% |
| `valor_unitario_item` | ≥ 90% numéricos, algum > 10 | 58% |

### Validações por linha

| Campo | Regra | Nível |
|---|---|---|
| `numero_pedido` | Ausente → gerar automaticamente | aviso |
| `part_number` | Ausente | aviso |
| `quantidade_inicial_item_pedido` | Zero ou negativo | erro |
| `valor_unitario_item` | Negativo (preview) | erro |
| `ncm` | ≠ 8 dígitos numéricos | aviso |
| `data_embarque` | Data inválida | aviso |

### Validações adicionais em `confirmar()`

- `preview_id` deve começar com `tenantId + '-'` (defense in depth)
- `valor_unitario_item` negativo → linha vai para `erros[]`, não é criada
- Linhas não presentes em `linhas_incluidas` são ignoradas

---

## Extrator Gemini (`geminiPdfExtractor.ts`)

Ativo somente se `GEMINI_PDF_ENABLED=true` e `GEMINI_API_KEY` definido.

**Modelo:** `gemini-2.5-flash`

**Custo estimado:** ~$0.009 por invoice de 26 páginas / 66 itens.

**Timeout:** 90 segundos via `Promise.race`.

**Validação da resposta:** Schema Zod (`InvoiceArraySchema`) valida o JSON antes de usar.

**Mapeamento de campos Gemini → sistema:**

| Campo Gemini | Campo sistema |
|---|---|
| `po_number` (ou `invoice_number`) | `numero_pedido` |
| `shipper` | `exportador` |
| `manufacturer` | `fabricante` |
| `incoterms` | `incoterm` |
| `currency` | `moeda_pedido` |
| `invoice_date` | `data_emissao_pedido` |
| `code` | `part_number` |
| `description` | `descricao` |
| `unit` | `unidade` |
| `quantity` | `quantidade_inicial_item_pedido` |
| `unit_price` | `valor_unitario_item` |
| `total_amount` | `valor_item` |
| `customs_tariff` | `ncm` |

**Fallback:** se Gemini retornar `null` (inativo, timeout ou JSON inválido), tenta `pdf-parse`. Se também falhar, retorna linha com `_aviso` e `_conteudo` para que o usuário veja o erro.

---

## Hash de Colunas

```ts
// SHA-256 via Node.js crypto — 16 chars do digest hex
import { createHash } from 'node:crypto'

export function calcularHashColunas(cabecalhos: string[]): string {
  const str = cabecalhos.slice().sort().join('|').toLowerCase()
  return createHash('sha256').update(str).digest('hex').slice(0, 16)
}
```

- **Order-independent:** cabeçalhos são ordenados antes de hash
- **Case-insensitive:** convertido para minúsculas
- **16 chars hex** (suficiente para colisões desprezíveis em contexto de tenant)

Usado como chave de memória: mesmo arquivo com mesmas colunas reutiliza o mapeamento anterior.

---

## Memória de Mapeamento (`mapeamentoMemoriaService.ts`)

Persiste no banco o mapeamento confirmado para um hash de colunas de um tenant.

```ts
// Buscar
const salvo = await memoriaService.buscar(tenantId, hashColunas)

// Salvar (ao confirmar, se salvar_mapeamento = true)
await memoriaService.salvar(tenantId, hashColunas, mapeamentoConfirmado)
```

Quando memória é encontrada, `memoria_aplicada: true` é retornado no preview e exibido no UI.

---

## Preview Cache (em memória)

```ts
const previewCache = new Map<string, {
  data:      SmartImportLinha[]
  mapeamento: ColunaMapeadaBackend[]
  ts:        number
}>()

const PREVIEW_TTL_MS = 30 * 60 * 1000  // 30 minutos
```

- **Chave:** `${tenantId}-${hashColunas}-${Date.now()}`
- **Isolamento:** chave contém `tenantId`; `confirmar()` valida que `preview_id` começa com `tenantId + '-'`
- **TTL:** entradas expiradas são removidas a cada novo `analisar()`
- **Fallback stateless:** se o cache não tiver o preview (multi-instância / restart), usa `payload.linhas` enviado pelo client

---

## Frontend — SmartImportModal

### Estados e fluxo

```
Etapa 'upload'
  ├── Usuário arrasta/seleciona arquivo
  ├── Se xlsx com múltiplas abas → mostra seletor de aba (sem avançar)
  └── POST /analisar → loading com mensagens rotativas (PDF: 4s/msg, outros: 1.8s/msg)
      ├── PDF: "Enviando PDF para análise com IA... (pode levar até 60s)..."
      └── Outros: "Lendo colunas do arquivo...", "Mapeando campos com IA..."...

Etapa 'mapeamento'
  ├── Tabela de colunas com campo mapeado, confiança visual e exemplo_valor
  ├── Exibe extrator_usado: "✦ Extraído com IA (Gemini)" ou "parser: csv"
  ├── Badge "Mapeamento salvo" se memoria_aplicada
  ├── Aviso se confianca_global < 60%
  └── Usuário ajusta mapeamento manualmente

Etapa 'preview'
  ├── Lista linhas com status (ok/aviso/erro), dados mapeados e alertas
  ├── Decisão por pedido duplicado: sobrescrever / criar novo / pular
  ├── Edição inline do número do pedido
  └── Seleção de quais linhas incluir

Etapa 'confirmacao'
  ├── Criados / Atualizados / Pulados / Erros
  ├── Download de erros (.csv) se houver
  ├── Botão "Ver Pedidos Importados"
  └── Botão "Reverter esta importação" (cancela pedidos criados em rascunho)
```

### Mensagens de progresso por tipo de arquivo

```ts
const msgs = isPdf
  ? [
      'Enviando PDF para análise com IA...',
      'Extraindo itens do documento (pode levar até 60s)...',
      'Identificando campos: número do pedido, exportador, itens...',
      'Mapeando campos com IA...',
      'Verificando duplicatas no sistema...',
      'Preparando preview...',
    ]
  : [
      'Lendo colunas do arquivo...',
      'Mapeando campos com IA...',
      'Verificando duplicatas no sistema...',
      'Preparando preview...',
    ]
```

---

## Proxy Vite (dev)

```ts
'/api': {
  target: 'http://localhost:8026',
  changeOrigin: true,
  timeout:      120000,   // 120s — necessário para PDFs grandes via Gemini
  proxyTimeout: 120000,
}
```

---

## Segurança — Checklist 5 Camadas

- [x] **Rede**: rotas registradas após `tenantIsolationMiddleware`
- [x] **Autenticação**: `x-tenant-id` + `x-internal-key` obrigatórios
- [x] **Autorização**: `preview_id` validado na rota e no service (defense in depth)
- [x] **Isolamento**: `tenant_id` em todas as queries Prisma; cache isolado por `tenantId` no prefixo da chave
- [x] **Auditoria**: reversão via `status = 'cancelado'` (soft delete rastreável)
- [x] **Input**: extensão + tamanho + magic bytes PDF validados antes de processar
- [x] **Rate limit**: 10 uploads por tenant por minuto
- [x] **Validação IA**: resposta do Gemini validada via Zod antes de usar
- [x] **Timeout IA**: `Promise.race` com 90s para evitar hang indefinido

---

## Variáveis de Ambiente

| Variável | Obrigatório | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | PostgreSQL (schema `pedido`) |
| `CHAVE_INTERNA_SERVICO` | Sim | Chave S2S para autenticação entre serviços |
| `GEMINI_API_KEY` | Não | API Key do Google para extração de PDF |
| `GEMINI_PDF_ENABLED` | Não | `'true'` para ativar Gemini (padrão: desativado) |

---

## Banco de Dados — Modelos Relevantes

### `Pedido`

```prisma
model Pedido {
  id               String  @id
  tenant_id        String
  numero_pedido    String
  ...
  @@unique([tenant_id, numero_pedido])  // garante unicidade por tenant
  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@index([tenant_id, status])
  @@map("pedidos_comerciais")
}
```

### `PedidoItem`

```prisma
model PedidoItem {
  id                             String   @id
  tenant_id                      String
  pedido_id                      String
  descricao_item                 String
  quantidade_inicial_pedido      Decimal  @db.Decimal(18, 6)
  quantidade_atual_pedido        Decimal  @db.Decimal(18, 6)
  casas_decimais_quantidade_item Int      @default(2)
  valor_por_unidade_item         Decimal? @db.Decimal(18, 6)
  valor_total_item               Decimal? @db.Decimal(18, 6)
  casas_decimais_total_item      Int      @default(2)
  ...
  @@map("pedido_item")
}
```

> **Nota de nomenclatura:** Os campos Prisma usam nomes distintos dos campos lógicos de mapeamento:
> - Campo mapeado `descricao` → Prisma `descricao_item`
> - Campo mapeado `valor_unitario_item` → Prisma `valor_por_unidade_item`
> - Campo mapeado `valor_item` → Prisma `valor_total_item`
>
> Essa separação é intencional: os nomes de mapeamento (em `ALIASES_CAMPOS` e na extração Gemini) refletem o vocabulário do usuário, enquanto os nomes Prisma seguem a convenção interna do schema.

---

## Testes

```
server/src/services/
├── importEngine.test.ts          (18 testes)
│   ├── parseArquivo — csv (separador vírgula, ponto-e-vírgula, tab, aspas, linhas vazias)
│   ├── parseArquivo — json (array, conversão para string, erro se não-array)
│   ├── parseArquivo — xml (tags folha, conteúdo vazio)
│   ├── parseArquivo — formato desconhecido (lança erro)
│   ├── calcularHashColunas (length 16, determinístico, order-independent, case-insensitive)
│   └── listarPlanilhas (retorna [] para não-excel)
│
├── smartImportService.test.ts    (19 testes)
│   ├── mapearComIA — exact match sistema (confiança 99, todos os campos Gemini)
│   ├── mapearComIA — alias match ("Currency"→moeda_pedido, "Unit Price"→valor_unitario_item)
│   ├── mapearComIA — "PO Number"→numero_pedido
│   ├── mapearComIA — "Unit" mapeia para valor_unitario_item via "unit price" (score 80)
│   ├── mapearComIA — fabricante ≠ exportador (Manufacturer→fabricante, não exportador)
│   ├── mapearComIA — exemplo_valor: primeiro não-vazio, null se todos vazios, truncado a 80
│   ├── mapearComIA — normalização underscore ("po_number"→"po number"→numero_pedido)
│   ├── mapearComIA — ignorado para coluna sem correspondência
│   └── inferirPorDados — incoterm, ncm, moeda, data, valor, vazio, limiar ncm
│
└── confirmar.test.ts             (8 testes)
    ├── rejeita preview_id de outro tenant
    ├── cria pedido e retorna criados=1
    ├── pula linha com decisão 'pular'
    ├── atualiza pedido existente com decisão 'sobrescrever'
    ├── registra erro para valor_unitario_item negativo
    ├── exclui linhas não presentes em linhas_incluidas
    ├── retorna ids_criados com prefixo 'pedi_'
    └── captura erros do banco e registra por linha
```

**Total: 45 testes, todos passando.**

---

## Campos Mapeáveis

| Campo sistema | Aliases principais |
|---|---|
| `numero_pedido` | PO Number, Order Number, Purchase Order, Referencia |
| `tipo_operacao` | Type, Tipo, Operation |
| `exportador` | Supplier, Vendor, Shipper, Exporter |
| `fabricante` | Manufacturer, Maker, Brand |
| `incoterm` | Incoterm, Delivery Terms, Trade Terms |
| `moeda_pedido` | Currency, Moeda |
| `data_emissao_pedido` | Order Date, PO Date, Issue Date, Data Emissao |
| `data_embarque` | Ship Date, ETD, ETA, Data Embarque |
| `part_number` | Part Number, SKU, Item Code, Codigo |
| `ncm` | NCM, HS Code, Tariff Code, Harmonized Code |
| `descricao` | Description, Product Name, Goods Description |
| `quantidade_inicial_item_pedido` | Qty, Quantity, Qtd, Qtde |
| `unidade` | UOM, Unit of Measure |
| `valor_unitario_item` | Unit Price, Price, Unit Value, Unit Cost |
| `valor_item` | Total Value, Line Total, Line Amount |

> **Nota:** `fabricante` e `exportador` são campos distintos — `manufacturer` é alias exclusivo de `fabricante`, não de `exportador`.

---

## Decisões de Design Registradas

| Decisão | Motivo |
|---|---|
| `nodemon` ao invés de `tsx watch` | `tsx watch` no Windows causa EADDRINUSE loop (restart antes de liberar porta) |
| `Promise.race` para timeout Gemini | SDK `@google/generative-ai` não expõe `AbortSignal` de forma estável |
| Validação Zod na resposta do Gemini | Gemini ocasionalmente retorna JSON com campos extras ou ausentes |
| `dados_brutos` no preview | Permite que o usuário veja os valores originais do arquivo na tela de mapeamento |
| `extrator_usado` no preview | Transparência: usuário vê se o PDF foi extraído via IA ou parser local |
| SHA-256 no hash de colunas | XOR32 tem alta taxa de colisão para strings longas; SHA-256 é determinístico e collision-free na prática |
| `@@unique([tenant_id, numero_pedido])` | Impede duplicatas silenciosas de pedidos no mesmo tenant; migration inclui deduplicação automática de dados |
| Defense in depth no `confirmar()` | Validar `preview_id` tanto na rota quanto no service protege contra chamadas diretas ao service |
| `casas_decimais_quantidade_item = 2` | Alinhado com `@default(2)` do schema Prisma; valor 3 estava desincronizado |

---

## Robustez — 13 Pontos Cegos Cobertos (P0/P1/P2/P3)

Após relato do dono em maio/2026 ("queremos 0 pontos cegos dizendo exatamente
ao usuário por que a planilha não carregou e dando sugestões"), o fluxo foi
auditado e endurecido em 4 fases por prioridade.

### P0 — Erros do backend padronizados (AppError + code)

| Code | Significado |
|---|---|
| `ARQUIVO_AUSENTE` | Upload chegou sem arquivo anexado |
| `ARQUIVO_SEM_DADOS` | Planilha vazia (zero linhas de dado) |
| `FORMATO_NAO_SUPORTADO` | Extensão fora de .xlsx/.xls/.csv/.xml/.txt/.json/.pdf |
| `RATE_LIMIT_EXCEEDED` | >10 uploads/min para o mesmo tenant |
| `UNAUTHORIZED_PREVIEW` | `preview_id` não pertence ao tenant da sessão |
| `JSON_FORMATO_INVALIDO` | JSON válido mas sem array de objetos detectável |

Antes: backend jogava `new Error()` genérico → cliente exibia "Erro desconhecido".
Depois: cada erro tem code + message + sugestão contextual via `traduzirErroDetalhado()` no client.

### P1 — Master-detail e erros silenciosos de INSERT

- **P1.1 — Detecção de super-header**: heurística combinada (esparsidade × baixa
  diversidade) em `importEngine.ts` evita perder colunas em templates com agrupador na linha 1
- **P1.2 — Coerência master-detail** (`validarCoerenciaMasterDetail`):
  - PEDIDO duplicado no arquivo
  - ITEM antes de qualquer PEDIDO (ordem invertida)
  - ITEM com `numero_pedido` órfão
  - PEDIDO sem nenhum ITEM associado (aviso)
- **P1.3 — Falhas de INSERT param de ser silenciadas**: erros do banco não
  são mais engolidos — REGRA 08 (sem fallback silencioso)

### P2 — Coerência matemática, encoding, conflitos de mapeamento

- **P2.1 — Coerência matemática**: validar `qtd_inicial - qtd_pronta - qtd_transferida - qtd_cancelada ≥ 0`
- **P2.2 — CNPJ + email**:
  - CNPJ valida dígitos verificadores via `cnpjDigitoVerificadorValido()`
  - Email valida regex padrão (RFC 5322 simplificado)
- **P2.3 — Encoding latin1 vs UTF-8**: `decodificarComFallback()` em `importEngine.ts`
  tenta UTF-8 primeiro, conta replacement chars (`�`), cai para latin1 quando
  taxa > 0.1%. Log `[importEngine] encoding detectado como latin1 (...)`
  quando o fallback é usado (REGRA 08)
- **P2.4 — Conflitos de mapeamento** (2+ colunas → mesmo `campo_sistema`):
  - Server: `detectarConflitosMapeamento()` retorna `ConflitoMapeamento[]` no preview
  - Client: banner vermelho fixo + botão "Continuar" disabled enquanto houver conflito
  - Cálculo em tempo real do mapeamento atual (reflete edições do usuário)
  - Sem isso, último valor sobrescrevia o anterior em `aplicarMapeamento` (bug invisível)

### P3 — Edge cases

| Code | Detecção |
|---|---|
| `JSON_MALFORMADO` | `SyntaxError` ao fazer `JSON.parse()` |
| `JSON_VAZIO` | Array `[]` (válido mas sem dados) |
| `PDF_PROTEGIDO` | Erro do `pdf-parse` contendo `password\|encrypt\|protected` |
| `PDF_ESCANEADO` | Texto extraído < 30 chars (provavelmente só imagens) |
| Excel formula errors | Células com `#REF!`, `#N/A`, `#VALUE!`, `#DIV/0!`, `#NAME?`, `#NULL!`, `#NUM!` viram alertas de nível `erro` em `validarLinha()` |

Cada code tem entrada correspondente em `traduzirErroDetalhado()` no client
com título, mensagem, causa, sugestões e ações ("Baixar template", "Recarregar").

### Contrato bilateral Zod (REGRA 06 + REGRA 09)

`smart-import-schemas.ts` em `produto/pedido/shared/` define o contrato único:

- **Server** (`importacoes-inteligentes-pedido.ts:275`): `.parse()` antes de
  `res.json()` — defensive serialization. Falha alta se o service mudar payload
  sem atualizar o schema.
- **Client** (`api.ts:855`): `.parse()` a resposta antes de devolver à UI.
  Falha alta se o backend mudar payload sem atualizar o schema.

Schemas exportados: `colunaMapeadaSchema`, `smartImportAlertaSchema`,
`smartImportLinhaSchema`, `smartImportLinhaRawSchema`, `conflitoMapeamentoSchema`,
`smartImportPreviewSchema`.
