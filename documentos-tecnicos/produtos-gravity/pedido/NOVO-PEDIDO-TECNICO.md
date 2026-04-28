# Novo Pedido — Documento Técnico

> **Produto:** Pedido (COMEX)
> **Versão:** 1.0
> **Data:** Abril 2026
> **Status:** Aguardando implementação

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript strict, Vite |
| Backend | Express + TypeScript, Prisma ORM |
| IA (mapeamento) | Gabi / Claude API (via `servicos-global/tenant/gabi`) |
| Banco | PostgreSQL (tenant isolado) |
| Validação | Zod em todas as rotas |
| Parse Excel | SheetJS (`xlsx`) — instalar via `npm install xlsx` |

---

## Estrutura de Arquivos

```
produto/pedido/
├── client/
│   └── src/
│       ├── components/
│       │   ├── DrawerPedido.tsx              ← Drawer criar/editar (substitui NovoPedido.tsx como página)
│       │   ├── DrawerPedido.css
│       │   ├── SmartImport/
│       │   │   ├── SmartImportModal.tsx      ← Modal de importação inteligente (substitui ImportarArquivo.tsx)
│       │   │   ├── SmartImportModal.css
│       │   │   ├── EtapaUpload.tsx           ← Passo 1: upload de arquivo
│       │   │   ├── EtapaMapeamento.tsx       ← Passo 2: mapeamento de colunas (IA + usuário)
│       │   │   ├── EtapaPreview.tsx          ← Passo 3: preview linha a linha com status
│       │   │   └── EtapaConfirmacao.tsx      ← Passo 4: resultado final
│       ├── shared/
│       │   ├── types.ts                      ← Tipos de import + drawer
│       │   └── api.ts                        ← smartImportApi + pedidoApi.criar/atualizar
│       └── pages/
│           └── ListaPedidos.tsx              ← Botões "Novo" e "Importar" integrados ao drawer/modal
└── server/
    └── src/
        ├── routes/
        │   └── smartImport.ts                ← Rotas de import inteligente
        └── services/
            ├── smartImportService.ts          ← Orquestra parse + IA + validação + criação
            ├── importEngine.ts               ← Já existe — adicionar parser Excel (SheetJS)
            └── mapeamentoMemoriaService.ts   ← Salva/recupera mapeamentos por tenant
```

---

## A. Drawer de Criação/Edição

### Tipos (`client/src/shared/types.ts`)

```ts
export interface DrawerPedidoProps {
  aberto: boolean
  pedidoId?: string          // undefined = criar, preenchido = editar
  onFechar: () => void
  onSalvo: (pedido: Pedido) => void
}
```

### Comportamento

- **Criar**: `pedidoId` undefined → drawer vazio → `POST /api/v1/pedidos`
- **Editar**: `pedidoId` preenchido → carrega pedido → `PUT /api/v1/pedidos/:id`
- Animação slide-in da direita, backdrop desfocado
- Largura: `480px` (desktop) / `100vw` (mobile)
- Fechar com Escape ou clique fora (confirmar se dados foram preenchidos)
- Scroll interno para campos + itens

### Integração em ListaPedidos.tsx

```tsx
// Estados
const [drawerAberto, setDrawerAberto] = useState(false)
const [pedidoEditandoId, setPedidoEditandoId] = useState<string | undefined>()

// Botão Novo
onClick={() => {
  setPedidoEditandoId(undefined)
  setDrawerAberto(true)
}}

// Clique na linha do pedido (para editar)
onRowClick={(pedido) => {
  setPedidoEditandoId(pedido.id)
  setDrawerAberto(true)
}}

// Drawer
<DrawerPedido
  aberto={drawerAberto}
  pedidoId={pedidoEditandoId}
  onFechar={() => setDrawerAberto(false)}
  onSalvo={() => {
    setDrawerAberto(false)
    carregarInicial()
  }}
/>
```

---

## B. Smart Import

### Tipos (`client/src/shared/types.ts`)

```ts
// Resultado do mapeamento de uma coluna
export interface ColunaMapeada {
  coluna_arquivo: string          // nome original da coluna no arquivo
  campo_sistema: string | null    // campo mapeado (null = ignorar)
  confianca: number               // 0-100
  nivel: 'auto' | 'confirmado' | 'manual' | 'ignorado'
  inferido_por: 'ia' | 'dados' | 'memoria' | 'usuario'
}

// Resultado do parse + mapeamento IA
export interface SmartImportPreview {
  total_linhas: number
  total_pedidos: number           // após agrupamento por numero_pedido
  total_itens: number
  mapeamento: ColunaMapeada[]
  confianca_global: number        // média ponderada
  memoria_aplicada: boolean       // se veio de mapeamento salvo
  linhas: SmartImportLinha[]
}

// Uma linha do arquivo após mapeamento
export interface SmartImportLinha {
  linha_arquivo: number
  numero_pedido: string | null
  status: 'ok' | 'aviso' | 'erro'
  alertas: SmartImportAlerta[]
  dados: Record<string, unknown>  // campos mapeados
}

export interface SmartImportAlerta {
  campo: string
  tipo: 'obrigatorio_ausente' | 'formato_invalido' | 'valor_negativo' | 'duplicado_sistema' | 'duplicado_arquivo'
  mensagem: string
  nivel: 'aviso' | 'erro'
}

// Decisão do usuário para cada duplicata
export type DecisaoDuplicata = 'sobrescrever' | 'criar' | 'pular'

// Payload de confirmação
export interface SmartImportConfirmar {
  preview_id: string              // token do preview em cache
  mapeamento_confirmado: ColunaMapeada[]
  decisoes_duplicatas: Record<string, DecisaoDuplicata>  // numero_pedido → decisão
  linhas_incluidas: number[]      // índices das linhas a importar
  salvar_mapeamento: boolean      // salvar para próxima vez
}

// Resultado final
export interface SmartImportResultado {
  criados: number
  atualizados: number
  pulados: number
  erros: { linha: number; motivo: string }[]
  ids_criados: string[]
}
```

### API Client (`client/src/shared/api.ts`)

```ts
export const smartImportApi = {
  // Upload + parse + mapeamento IA
  analisar: (arquivo: File) => {
    const formData = new FormData()
    formData.append('arquivo', arquivo)
    return request<SmartImportPreview>('/api/v1/pedidos/smart-import/analisar', {
      method: 'POST',
      body: formData,  // sem Content-Type — browser define boundary
    })
  },

  // Confirmar importação com decisões do usuário
  confirmar: (payload: SmartImportConfirmar) =>
    request<SmartImportResultado>('/api/v1/pedidos/smart-import/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Buscar mapeamento salvo para estrutura de arquivo
  mapeamentoSalvo: (hashColunas: string) =>
    request<ColunaMapeada[] | null>(`/api/v1/pedidos/smart-import/mapeamento/${hashColunas}`),
}
```

---

## Backend — Rotas (`server/src/routes/smartImport.ts`)

### `POST /api/v1/pedidos/smart-import/analisar`

**Entrada:** `multipart/form-data` com campo `arquivo`

**Lógica:**
```
1. Detectar formato pelo nome/extensão
2. Parse do arquivo → linhas brutas (importEngine)
3. Extrair cabeçalhos
4. Calcular hash dos cabeçalhos → buscar mapeamento salvo no banco
5. Se mapeamento salvo: aplicar + marcar inferido_por = 'memoria'
6. Se não: chamar Gabi/IA com cabeçalhos + amostra de dados (10 linhas)
7. IA retorna mapeamento com scores de confiança
8. Inferência pelos dados: confirmar/ajustar mapeamentos com baixa confiança
9. Aplicar mapeamento nas linhas
10. Agrupar por numero_pedido
11. Validar cada linha (gerar alertas)
12. Salvar preview em cache Redis (TTL 30min) → retornar preview_id
13. Retornar SmartImportPreview
```

**Resposta:** `200 SmartImportPreview`

---

### `POST /api/v1/pedidos/smart-import/confirmar`

**Zod schema:**
```ts
const ConfirmarSchema = z.object({
  preview_id: z.string(),
  mapeamento_confirmado: z.array(z.object({
    coluna_arquivo: z.string(),
    campo_sistema: z.string().nullable(),
    confianca: z.number(),
    nivel: z.enum(['auto', 'confirmado', 'manual', 'ignorado']),
    inferido_por: z.enum(['ia', 'dados', 'memoria', 'usuario']),
  })),
  decisoes_duplicatas: z.record(z.enum(['sobrescrever', 'criar', 'pular'])),
  linhas_incluidas: z.array(z.number()),
  salvar_mapeamento: z.boolean(),
})
```

**Lógica em `$transaction`:**
```
1. Recuperar preview do cache
2. Para cada linha incluída:
   a. Aplicar mapeamento confirmado
   b. Se duplicata: aplicar decisão (sobrescrever/criar/pular)
   c. Criar ou atualizar pedido com itens
3. Se salvar_mapeamento: persistir ColunaMapeada[] no banco (MapeamentoImport)
4. Registrar audit trail: canal = 'importacao', quantidade de pedidos
5. Retornar SmartImportResultado
```

---

### `GET /api/v1/pedidos/smart-import/mapeamento/:hash`

Retorna mapeamento salvo para o hash de colunas ou `null`.

---

## Backend — Serviços

### `smartImportService.ts`

```ts
export class SmartImportService {
  async analisar(tenantId: string, arquivo: Buffer, nomeArquivo: string): Promise<SmartImportPreview>
  async confirmar(tenantId: string, userId: string, payload: SmartImportConfirmar): Promise<SmartImportResultado>

  // Privados
  private async mapearComIA(cabecalhos: string[], amostra: Record<string,string>[]): Promise<ColunaMapeada[]>
  private inferirPorDados(col: string, valores: string[]): { campo: string; confianca: number } | null
  private calcularHashColunas(cabecalhos: string[]): string
  private validarLinha(linha: Record<string,unknown>): SmartImportAlerta[]
  private agruparPorNumeroPedido(linhas: Record<string,unknown>[]): PedidoImportado[]
}
```

### `importEngine.ts` — Adicionar parser Excel

```ts
// Adicionar ao método parseArquivo():
case 'xlsx':
case 'xls': {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, string>[]
}
```

### `mapeamentoMemoriaService.ts`

```ts
export class MapeamentoMemoriaService {
  async buscar(tenantId: string, hashColunas: string): Promise<ColunaMapeada[] | null>
  async salvar(tenantId: string, hashColunas: string, mapeamento: ColunaMapeada[]): Promise<void>
  async resetar(tenantId: string, hashColunas: string): Promise<void>
}
```

---

## Chamada IA (Gabi/Claude)

```ts
// Prompt enviado para a IA
const prompt = `
Você é um especialista em COMEX (comércio exterior) brasileiro.
Analise os cabeçalhos de uma planilha de pedidos e mapeie cada coluna para o campo correto do sistema.

Campos disponíveis no sistema:
- numero_pedido: Número/código do pedido (PO, SO, etc.)
- tipo_operacao: "importacao" ou "exportacao"
- exportador: Nome do fornecedor/exportador
- fabricante: Nome do fabricante
- incoterm: Termo de comércio (FOB, CIF, EXW, DDP, etc.)
- moeda_pedido: Moeda (USD, EUR, BRL, etc.)
- data_emissao_pedido: Data de emissão
- part_number: Código do produto
- ncm: Classificação fiscal NCM (8 dígitos)
- descricao: Descrição do produto
- quantidade_inicial: Quantidade
- unidade: Unidade de medida
- valor_unitario: Preço unitário
- valor_item: Valor total do item

Cabeçalhos do arquivo: ${JSON.stringify(cabecalhos)}
Amostra dos primeiros dados: ${JSON.stringify(amostra)}

Retorne JSON array com { coluna_arquivo, campo_sistema, confianca (0-100), motivo }.
Se não souber mapear, coluna_arquivo com campo_sistema null e confianca 0.
`
```

---

## Banco de Dados — Fragment Prisma

```prisma
// Adicionar ao fragment.prisma

model MapeamentoImport {
  id           String   @id @default(cuid())
  tenant_id    String
  product_id   String?
  hash_colunas String               // SHA256 dos cabeçalhos ordenados
  mapeamento   String               // JSON serializado de ColunaMapeada[]
  uso_count    Int      @default(1) // quantas vezes foi usado
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  @@unique([tenant_id, hash_colunas])
  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@map("mapeamento_import")
}
```

---

## Frontend — SmartImport (4 etapas)

### Etapa 1 — Upload
- Área drag-and-drop
- Aceita: `.xlsx`, `.xls`, `.csv`, `.xml`, `.txt`, `.json`
- Ao selecionar: chama `smartImportApi.analisar(file)`
- Exibe loading "Analisando arquivo..." durante IA

### Etapa 2 — Mapeamento
- Tabela: coluna do arquivo | campo sistema | confiança | ação
- Verde ✓ (>90%): auto-aplicado, usuário pode alterar
- Amarelo ⚠ (50-90%): selecionar de dropdown
- Cinza ? (<50%): selecionar de dropdown obrigatório
- Badge "Memória aplicada" se veio de mapeamento salvo
- Checkbox "Lembrar este mapeamento"

### Etapa 3 — Preview
- Tabela com todas as linhas do arquivo
- Coluna de status: ✓ ok · ⚠ aviso · ✗ erro
- Expandir linha para ver detalhes dos alertas
- Para duplicatas: dropdown por linha (Sobrescrever/Criar/Pular)
- Filtros: Mostrar tudo / Só erros / Só avisos
- Seleção em massa: "Selecionar todas as válidas"
- Contador: "X pedidos serão criados · Y atualizados · Z pulados"

### Etapa 4 — Resultado
- Resumo: criados / atualizados / pulados / erros
- Lista de erros restantes
- Botão "Ver Pedidos Importados" → filtra lista pelos IDs criados

---

## Integração em ListaPedidos.tsx

```tsx
// Estados
const [drawerAberto, setDrawerAberto] = useState(false)
const [pedidoEditandoId, setPedidoEditandoId] = useState<string | undefined>()
const [smartImportAberto, setSmartImportAberto] = useState(false)

// Botão Novo → abre drawer vazio
onClick={() => { setPedidoEditandoId(undefined); setDrawerAberto(true) }}

// Botão Importar → abre SmartImport (substituir console.info)
onClick={() => setSmartImportAberto(true)}

// Componentes
<DrawerPedido
  aberto={drawerAberto}
  pedidoId={pedidoEditandoId}
  onFechar={() => setDrawerAberto(false)}
  onSalvo={() => { setDrawerAberto(false); carregarInicial() }}
/>

<SmartImportModal
  aberto={smartImportAberto}
  onFechar={() => setSmartImportAberto(false)}
  onConcluido={(ids) => {
    setSmartImportAberto(false)
    carregarInicial()
    // opcional: filtrar lista pelos ids criados
  }}
/>
```

---

## Segurança — Checklist 5 Camadas

- [x] **Rede**: rotas registradas após `tenantIsolationMiddleware`
- [x] **Autenticação**: Clerk JWT validado
- [x] **Autorização**: permissão separada criar manual vs importar
- [x] **Isolamento**: `tenant_id` em todas as queries + mapeamentos
- [x] **Auditoria**: canal de criação registrado (`manual` / `importacao`)
- [x] **Upload**: validar tamanho máximo do arquivo (ex: 10MB), validar extensão

---

## Testes

```
testes/unitarios/pedido/
  smartImportService.test.ts
    ├── mapeamento IA — colunas em inglês mapeadas corretamente
    ├── mapeamento IA — colunas com erro de digitação mapeadas
    ├── inferência por dados — coluna com "FOB/CIF" → incoterm
    ├── inferência por dados — coluna com 8 dígitos → ncm
    ├── agrupamento — 3 linhas mesmo PO → 1 pedido, 3 itens
    ├── validação — quantidade negativa → erro
    ├── validação — duplicata → aviso
    ├── decisão sobrescrever — atualiza pedido existente
    ├── decisão pular — linha não importada
    ├── memória — salva e recupera mapeamento por hash
    └── cross-tenant — mapeamento de outro tenant não é retornado

  importEngine.test.ts
    ├── parse Excel — SheetJS retorna linhas corretas
    ├── parse CSV — auto-detecta separador
    └── parse XML — agrupa corretamente

testes/funcionais/pedido/
  smartImport.test.ts
    ├── POST /analisar — retorna mapeamento com confiança
    ├── POST /confirmar — cria pedidos e retorna IDs
    ├── POST /confirmar — aplica decisão de duplicata
    └── GET /mapeamento/:hash — retorna mapeamento salvo
```
