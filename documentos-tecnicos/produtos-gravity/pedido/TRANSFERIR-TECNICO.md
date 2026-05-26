# Transferir Pedidos — Documento Técnico

> **Produto:** Pedido (COMEX)
> **Versão:** 1.1
> **Data:** Abril 2026
> **Última atualização:** 2026-05-26
> **Status:** Implementado (client + server + testes funcionais)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript strict, Vite, TanStack Virtual |
| Backend | Express + TypeScript, Prisma ORM |
| Banco | PostgreSQL (tenant isolado via Prisma Extensions + RLS) |
| Validação | Zod em todas as rotas |
| Auth | Clerk JWT + `x-internal-key` S2S |
| Erros | `AppError` — nunca `res.status().json()` direto |

---

## Estrutura de Arquivos

```
produto/pedido/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ModalTransferir.tsx          ← Modal principal de transferência
│   │   │   ├── ModalTransferir.css
│   │   │   ├── ModalConsolidar.tsx          ← Já implementado
│   │   │   └── ModalConsolidar.css
│   │   ├── shared/
│   │   │   ├── types.ts                     ← Tipos de Transferência
│   │   │   ├── api.ts                       ← pedidoTransferirApi
│   │   │   └── mockData.ts                  ← Mocks DEV
│   │   └── pages/
│   │       └── ListaPedidos.tsx             ← Botão Transferir integrado
└── server/
    └── src/
        ├── routes/
        │   ├── transferir.ts                ← Rotas de transferência
        │   └── consolidar.ts                ← Já implementado
        └── services/
            └── transferirService.ts         ← Lógica de negócio
```

---

## Tipos TypeScript (`client/src/shared/types.ts`)

```ts
// Operações primitivas
export type OperacaoTransfer = 'reduzir' | 'alocar' | 'transformar'

// Cenários disponíveis
export type CenarioTransfer =
  | 'reducao_simples'
  | 'split_novo_pedido'
  | 'split_pedido_existente'
  | 'multi_split'
  | 'substituicao_pura'
  | 'split_substituicao'
  | 'split_data'
  | 'split_destino_logistico'
  | 'transfer_intercompany'
  | 'reversao'
  | 'agrupamento_inverso'

// Destino de um split
export interface TransferDestino {
  tipo: 'novo' | 'existente' | 'mesmo'
  pedido_id?: string              // preenchido se tipo = 'existente'
  quantidade: number
  // campos sobrepostos no destino (opcional por cenário)
  part_number?: string            // cenários 5a, 5b
  data_embarque?: string          // cenário 6
  porto_destino?: string          // cenário 7
  company_id?: string             // cenário 8
}

// Payload enviado ao backend
export interface TransferPayload {
  cenario: CenarioTransfer
  pedido_id: string               // pedido origem
  item_id: string                 // item origem
  quantidade_origem: number       // qty que será removida do origem
  destinos: TransferDestino[]     // onde vai a qty (1 para cenários simples, N para multi-split)
  numero_pedido_novo?: string     // quando cria novo pedido
  reverter_transfer_id?: string   // apenas para cenário 'reversao'
}

// Resposta do preview
export interface TransferPreview {
  cenario: CenarioTransfer
  origem: {
    pedido_numero: string
    item_part_number: string
    quantidade_atual: number
    quantidade_apos: number
    encerra: boolean
  }
  destinos: {
    tipo: 'novo' | 'existente'
    pedido_numero?: string
    quantidade: number
    alertas: string[]
  }[]
  alertas_globais: string[]
}

// Resposta do confirmar
export interface TransferResultado {
  pedido_origem_id: string
  pedidos_destino_ids: string[]
  pedidos_criados: string[]
  itens_excluidos: string[]       // se config excluir item qty=0 ativo
  pedidos_encerrados: string[]    // se config encerrar pedido qty=0 ativo
}

// Histórico de transferências (para reversão)
export interface TransferHistorico {
  id: string
  pedido_origem_id: string
  item_origem_id: string
  cenario: CenarioTransfer
  quantidade: number
  destinos: TransferDestino[]
  revertido: boolean
  created_at: string
  created_by: string
}
```

---

## API Client (`client/src/shared/api.ts`)

IDs legados de pedido podem conter `/` (ex: `pedi_id_1234567/26`). **Todo** segmento de path
(`id_pedido`, `id_transferencia_pedido`) deve passar por `pid()` = `encodeURIComponent`
antes de montar a URL — senão Express interpreta a barra como separador de rota → **404 Rota não encontrada**.

```ts
/** Codifica IDs legados que contêm '/' para uso em URLs */
function pid(id: string): string {
  return encodeURIComponent(id)
}

export const pedidoTransferirApi = {
  preview: (payload) =>
    request(`/api/v1/pedidos/${pid(payload.pedido_id)}/transferencias/preview`, { method: 'POST', ... }),

  confirmar: (payload) =>
    request(`/api/v1/pedidos/${pid(payload.pedido_id)}/transferencias/confirmar`, { method: 'POST', ... }),

  historico: (pedido_id) =>
    request(`/api/v1/pedidos/${pid(pedido_id)}/transferencias`),

  reverter: (pedido_id, transfer_id) =>
    request(`/api/v1/pedidos/${pid(pedido_id)}/transferencias/${pid(transfer_id)}/reverter`, { method: 'POST', ... }),
}
```

> **Regressão corrigida (2026-05-26):** preview/confirmar/historico/reverter passaram a usar `pid()`.
> Testes: `testes-unitarios/pedido/lista/transferir/pid-url-encoding.test.ts` e
> `testes-funcionais/pedido/Lista/transferir/url-pid-encoding.test.ts`.

---

## Backend — Rotas (`server/src/routes/transferencias-pedido.ts`)

### `POST /api/v1/pedidos/transferir/preview`

**Zod schema de entrada:**
```ts
const PreviewSchema = z.object({
  cenario: z.enum([
    'reducao_simples', 'split_novo_pedido', 'split_pedido_existente',
    'multi_split', 'substituicao_pura', 'split_substituicao',
    'split_data', 'split_destino_logistico', 'transfer_intercompany',
    'reversao', 'agrupamento_inverso'
  ]),
  pedido_id: z.string().uuid(),
  item_id: z.string().uuid(),
  quantidade_origem: z.number().positive(),
  destinos: z.array(z.object({
    tipo: z.enum(['novo', 'existente', 'mesmo']),
    pedido_id: z.string().uuid().optional(),
    quantidade: z.number().positive(),
    part_number: z.string().optional(),
    data_embarque: z.string().optional(),
    porto_destino: z.string().optional(),
    company_id: z.string().optional(),
  })).min(1),
})
```

**Lógica:**
1. Valida Zod
2. Busca pedido e item (com `tenant_id` obrigatório)
3. Verifica se `quantidade_origem` ≤ `item.quantidade_atual`
4. Para cada destino: valida se pedido existente pertence ao mesmo tenant
5. Detecta alertas (encerramento, qty zerada, destino logístico diferente)
6. Retorna `TransferPreview` sem alterar o banco

**Resposta:** `200 { TransferPreview }`

---

### `POST /api/v1/pedidos/transferir/confirmar`

**Lógica em `$transaction`:**
```
1. Buscar e validar pedido origem + item (tenant_id obrigatório)
2. Verificar permissão do usuário para o cenário
3. Para cada destino:
   a. Se tipo = 'existente': buscar pedido destino (tenant_id obrigatório)
   b. Se tipo = 'novo': criar novo Pedido com número fornecido + copiar campos base
   c. Criar ou atualizar PedidoItem no destino com quantidade
4. Reduzir quantidade do item origem
5. Se config 'excluir_item_qty_zero' ativo E item.quantidade_atual = 0: deletar item
6. Se config 'encerrar_pedido_qty_zero' ativo E todos itens = 0: status = 'consolidado'
7. Se config 'excluir_pedido_qty_zero' ativo E todos itens = 0: soft delete pedido
8. Criar registro em TransferHistorico
9. Registrar audit trail (historico service)
10. Recalcular agregados: quantidade_inicial_total, quantidade_transferida_total
```

**Resposta:** `201 { TransferResultado }`

---

### `GET /api/v1/pedidos/:id/transferencias`

Retorna histórico de transferências do pedido para uso na reversão.

---

### `POST /api/v1/pedidos/transferir/:transfer_id/reverter`

**Lógica:**
1. Busca `TransferHistorico` pelo id (com `tenant_id`)
2. Verifica se já foi revertido (`revertido = true` → erro)
3. Verifica se cenário é reversível (cenário `reducao_simples` e `transfer_intercompany` NÃO são reversíveis)
4. Devolve quantidade para o item origem
5. Remove quantidade dos destinos (se chegou a 0 e config ativo, exclui item/pedido)
6. Marca `TransferHistorico.revertido = true`
7. Registra audit trail

---

## Backend — Serviço (`server/src/services/transferirService.ts`)

```ts
export class TransferirService {
  async preview(tenantId: string, payload: PreviewInput): Promise<TransferPreview>
  async confirmar(tenantId: string, userId: string, payload: TransferPayload): Promise<TransferResultado>
  async reverter(tenantId: string, userId: string, transferId: string): Promise<TransferResultado>
  async historico(tenantId: string, pedidoId: string): Promise<TransferHistorico[]>

  // Privados
  private async validarQuantidade(tenantId: string, itemId: string, qtd: number): Promise<void>
  private async criarPedidoDestino(tenantId: string, numero: string, base: Pedido): Promise<Pedido>
  private async recalcularAgregados(tenantId: string, pedidoId: string): Promise<void>
  private async avaliarEncerramentoPedido(tenantId: string, pedidoId: string): Promise<void>
}
```

---

## Banco de Dados — Fragment Prisma

```prisma
// Adicionar ao fragment.prisma do processos-core

model TransferHistorico {
  id               String   @id @default(cuid())
  tenant_id        String
  product_id       String?
  pedido_origem_id String
  item_origem_id   String
  cenario          String
  quantidade       Float
  destinos_json    String   // JSON serializado de TransferDestino[]
  revertido        Boolean  @default(false)
  revertido_em     DateTime?
  revertido_por    String?
  created_at       DateTime @default(now())
  created_by       String

  pedido_origem    PedidoComercial @relation(fields: [pedido_origem_id], references: [id])

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, pedido_origem_id])
  @@map("transfer_historico")
}

// Adicionar relação em PedidoComercial:
// transferencias TransferHistorico[]
```

---

## Configurações (`ConfiguracaoPedido`)

Adicionar ao model de configurações do produto:

```prisma
// Transferências
transferir_encerrar_pedido_qty_zero    Boolean @default(false)
transferir_excluir_item_qty_zero       Boolean @default(false)
transferir_excluir_pedido_qty_zero     Boolean @default(false)

// Permissões por cenário (quais cenários estão habilitados)
transferir_cenarios_habilitados        String[] @default([])

// Consolidação
consolidar_aviso_divergencia           Boolean @default(true)
consolidar_fundir_itens_part_number    Boolean @default(false)
consolidar_usuario_escolhe_campos      Boolean @default(false)
```

---

## Frontend — Modal de Transferência

### Fluxo UX

```
1. Usuário seleciona pedido(s) na lista
2. Clica em "Transferir"
3. Modal abre:
   a. Passo 1 — Selecionar cenário (cards visuais com descrição)
   b. Passo 2 — Selecionar item e quantidade
   c. Passo 3 — Configurar destinos (varia por cenário)
   d. Passo 4 — Preview do impacto (chamada /preview)
   e. Passo 5 — Confirmar
4. Após confirmar: recarregar lista
```

### Componente

```
ModalTransferir.tsx
├── Passo 1: SeletorCenario (cards com ícone + descrição)
├── Passo 2: SeletorItemQuantidade (tabela de itens do pedido)
├── Passo 3: ConfigurarDestinos
│   ├── DestinoSimples (cenários 1, 2, 3, 5a)
│   ├── DestinoMultiplo (cenário 4)
│   ├── DestinoData (cenário 6)
│   ├── DestinoLogistico (cenário 7)
│   └── DestinoIntercompany (cenário 8)
├── Passo 4: PreviewImpacto (resultado do /preview com alertas)
└── Passo 5: Confirmação
```

---

## Integração em ListaPedidos.tsx

```tsx
// Estado
const [modalTransferirAberto, setModalTransferirAberto] = useState(false)

// Botão (já existe no código, substituir o onClick)
<BotaoGlobal
  variante="secundario"
  tamanho="pequeno"
  icone={<ArrowsLeftRight size={14} weight="duotone" />}
  disabled={pedidosSelecionados.length === 0}
  onClick={() => setModalTransferirAberto(true)}
>
  Transferir{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
</BotaoGlobal>

// Modal
{modalTransferirAberto && (
  <ModalTransferir
    pedidos={pedidosSelecionados}
    onFechar={() => setModalTransferirAberto(false)}
    onConcluido={() => {
      setModalTransferirAberto(false)
      setPedidosSelecionados([])
      carregarInicial()
    }}
  />
)}
```

---

## Segurança — Checklist 5 Camadas

- [x] **Rede**: rotas registradas após `tenantIsolationMiddleware`
- [x] **Autenticação**: Clerk JWT validado em todas as rotas
- [x] **Autorização**: verificar permissão por cenário antes de executar
- [x] **Isolamento**: `tenant_id` em todas as queries Prisma (origem e destino)
- [x] **Auditoria**: `TransferHistorico` + `historico service` em toda operação

---

## Testes

```
testes/
├── unitarios/
│   └── pedido/
│       └── transferirService.test.ts
│           ├── reducao_simples — qty reduz corretamente
│           ├── split_novo_pedido — novo pedido criado com qty correta
│           ├── split_pedido_existente — qty somada ao destino
│           ├── multi_split — soma de destinos = qty transferida
│           ├── substituicao_pura — part_number alterado, qty intacta
│           ├── reversao — qty restaurada, revertido=true
│           ├── config encerrar_pedido_qty_zero — pedido encerra quando tudo = 0
│           ├── config excluir_item_qty_zero — item removido quando qty = 0
│           └── cross-tenant — rejeita destino de outro tenant
└── funcionais/
    └── pedido/
        └── transferir.test.ts
            ├── POST /preview — retorna impacto sem alterar banco
            ├── POST /confirmar — executa e retorna resultado
            ├── POST /confirmar — rejeita qty > disponível
            └── POST /reverter — restaura estado anterior
```
