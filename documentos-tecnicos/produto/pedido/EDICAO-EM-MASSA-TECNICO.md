# Edição em Massa — Documento Técnico

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
| Banco | PostgreSQL (tenant isolado via Prisma Extensions + RLS) |
| Validação | Zod em todas as rotas |
| Auth | Clerk JWT + `x-internal-key` S2S |
| Erros | `AppError` — nunca `res.status().json()` direto |

---

## Estrutura de Arquivos

```
produto/pedido/
├── client/
│   └── src/
│       ├── components/
│       │   ├── ModalEdicaoEmMassa.tsx       ← Modal principal
│       │   └── ModalEdicaoEmMassa.css
│       ├── shared/
│       │   ├── types.ts                     ← Tipos de edição em massa
│       │   └── api.ts                       ← pedidoEdicaoMassaApi
│       └── pages/
│           └── ListaPedidos.tsx             ← Botão "Editar em Massa" integrado
└── server/
    └── src/
        ├── routes/
        │   └── edicaoEmMassa.ts             ← Rotas
        └── services/
            └── edicaoEmMassaService.ts      ← Lógica de negócio
```

---

## Tipos TypeScript (`client/src/shared/types.ts`)

```ts
// Tipos de campo suportados
export type TipoCampoEdicao = 'texto' | 'numero' | 'data' | 'select' | 'usuario'

// Operação aplicada ao campo
export type OperacaoCampo =
  | 'substituir'       // todos os tipos
  | 'somar'            // numero
  | 'subtrair'         // numero
  | 'percentual'       // numero (ex: +10% → ×1.1)
  | 'avancar_dias'     // data
  | 'recuar_dias'      // data

// Um campo a ser editado
export interface CampoEdicaoMassa {
  campo: string                 // key do campo (ex: 'incoterm', 'data_embarque')
  tipo: TipoCampoEdicao
  nivel: 'pedido' | 'item'
  operacao: OperacaoCampo
  valor: string | number        // novo valor ou delta (para somar/percentual/dias)
}

// Payload enviado ao backend
export interface EdicaoMassaPayload {
  pedido_ids: string[]
  campos: CampoEdicaoMassa[]
  nivel: 'pedido' | 'item' | 'combinado'
}

// Resposta do preview
export interface EdicaoMassaPreview {
  pedidos_afetados: number
  itens_afetados: number
  campos: {
    campo: string
    nivel: 'pedido' | 'item'
    operacao: OperacaoCampo
    valor: string | number
    multiplos_valores: boolean    // true se pedidos selecionados têm valores diferentes
    valores_distintos?: string[]  // lista de valores atuais distintos (para exibir no UI)
    alertas: string[]
  }[]
  alertas_globais: string[]
}

// Resposta do confirmar
export interface EdicaoMassaResultado {
  pedidos_atualizados: number
  itens_atualizados: number
  campos_alterados: string[]
  erros: { pedido_id: string; motivo: string }[]
}

// Campos bloqueados (calculados — nunca editáveis em massa)
export const CAMPOS_BLOQUEADOS_PEDIDO = new Set([
  'valor_total_pedido',
  'quantidade_inicial_total',
  'quantidade_transferida_total',
  'status',
  'id',
  'tenant_id',
  'product_id',
  'created_at',
  'updated_at',
  'deleted_at',
])

export const CAMPOS_BLOQUEADOS_ITEM = new Set([
  'valor_item',
  'quantidade_atual',
  'id',
  'tenant_id',
  'pedido_id',
  'created_at',
  'updated_at',
])
```

---

## API Client (`client/src/shared/api.ts`)

```ts
export const pedidoEdicaoMassaApi = {
  // Preview — mostra impacto antes de confirmar
  preview: (payload: EdicaoMassaPayload) =>
    request<EdicaoMassaPreview>('/api/v1/pedidos/edicao-em-massa/preview', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Confirmar — executa a edição
  confirmar: (payload: EdicaoMassaPayload) =>
    request<EdicaoMassaResultado>('/api/v1/pedidos/edicao-em-massa/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
```

### Mock DEV

```ts
function mockEdicaoMassaPreview(payload: EdicaoMassaPayload): EdicaoMassaPreview {
  const pedidos = MOCK_PEDIDOS.filter(p => payload.pedido_ids.includes(p.id))
  return {
    pedidos_afetados: pedidos.length,
    itens_afetados: pedidos.reduce((s, p) => s + (p.itens?.length ?? 0), 0),
    campos: payload.campos.map(c => {
      const valores = pedidos.map(p => String((p as Record<string,unknown>)[c.campo] ?? ''))
      const distintos = [...new Set(valores)]
      return {
        campo: c.campo,
        nivel: c.nivel,
        operacao: c.operacao,
        valor: c.valor,
        multiplos_valores: distintos.length > 1,
        valores_distintos: distintos,
        alertas: [],
      }
    }),
    alertas_globais: [],
  }
}

function mockEdicaoMassaConfirmar(payload: EdicaoMassaPayload): EdicaoMassaResultado {
  // Aplica alterações nos mocks em memória
  payload.pedido_ids.forEach(id => {
    const pedido = MOCK_PEDIDOS.find(p => p.id === id)
    if (!pedido) return
    payload.campos.forEach(c => {
      if (c.nivel === 'pedido') {
        aplicarOperacao(pedido, c)
      } else {
        pedido.itens?.forEach(item => aplicarOperacao(item, c))
      }
    })
  })
  return {
    pedidos_atualizados: payload.pedido_ids.length,
    itens_afetados: 0,
    campos_alterados: payload.campos.map(c => c.campo),
    erros: [],
  }
}

function aplicarOperacao(obj: Record<string, unknown>, c: CampoEdicaoMassa): void {
  const atual = obj[c.campo]
  switch (c.operacao) {
    case 'substituir':   obj[c.campo] = c.valor; break
    case 'somar':        obj[c.campo] = Number(atual || 0) + Number(c.valor); break
    case 'subtrair':     obj[c.campo] = Number(atual || 0) - Number(c.valor); break
    case 'percentual':   obj[c.campo] = Number(atual || 0) * (1 + Number(c.valor) / 100); break
    case 'avancar_dias': obj[c.campo] = adicionarDias(String(atual), Number(c.valor)); break
    case 'recuar_dias':  obj[c.campo] = adicionarDias(String(atual), -Number(c.valor)); break
  }
}
```

---

## Backend — Rotas (`server/src/routes/edicaoEmMassa.ts`)

### `POST /api/v1/pedidos/edicao-em-massa/preview`

**Zod schema:**
```ts
const CampoSchema = z.object({
  campo: z.string().min(1),
  tipo: z.enum(['texto', 'numero', 'data', 'select', 'usuario']),
  nivel: z.enum(['pedido', 'item']),
  operacao: z.enum(['substituir', 'somar', 'subtrair', 'percentual', 'avancar_dias', 'recuar_dias']),
  valor: z.union([z.string(), z.number()]),
})

const EdicaoMassaSchema = z.object({
  pedido_ids: z.array(z.string().uuid()).min(1),
  campos: z.array(CampoSchema).min(1),
  nivel: z.enum(['pedido', 'item', 'combinado']),
})
```

**Lógica:**
1. Valida Zod
2. Rejeita se `campo` está em `CAMPOS_BLOQUEADOS_PEDIDO` ou `CAMPOS_BLOQUEADOS_ITEM`
3. Busca pedidos com `tenant_id` obrigatório
4. Para cada campo, detecta se há múltiplos valores entre os pedidos selecionados
5. Retorna `EdicaoMassaPreview` sem alterar o banco

---

### `POST /api/v1/pedidos/edicao-em-massa/confirmar`

**Lógica em `$transaction`:**
```
1. Valida Zod + campos bloqueados
2. Busca todos os pedidos com tenant_id
3. Para cada pedido:
   a. Aplica campos de nível 'pedido' via prisma.pedido.update()
   b. Para campos de nível 'item': aplica em todos os PedidoItem do pedido
4. Aplica operação conforme tipo:
   - substituir → value direto
   - somar/subtrair → campo atual ± valor
   - percentual → campo atual × (1 + valor/100)
   - avancar_dias/recuar_dias → data atual ± N dias
5. Recalcula campos agregados (valor_total_pedido, quantidade_inicial_total, etc.)
6. Recalcula status via saldoEngine se campos de quantidade foram alterados
7. Registra audit trail: campos alterados, valores anteriores, valores novos, usuário
```

**Resposta:** `200 { EdicaoMassaResultado }`

---

## Backend — Serviço (`server/src/services/edicaoEmMassaService.ts`)

```ts
export class EdicaoEmMassaService {
  async preview(tenantId: string, payload: EdicaoMassaPayload): Promise<EdicaoMassaPreview>
  async confirmar(tenantId: string, userId: string, payload: EdicaoMassaPayload): Promise<EdicaoMassaResultado>

  // Privados
  private aplicarOperacao(valorAtual: unknown, operacao: OperacaoCampo, valor: string | number): unknown
  private recalcularAgregados(tenantId: string, pedidoId: string): Promise<void>
  private validarCamposEditaveis(campos: CampoEdicaoMassa[]): void  // rejeita CAMPOS_BLOQUEADOS
}
```

---

## Frontend — Modal (`ModalEdicaoEmMassa.tsx`)

### Fluxo UX (2 passos)

```
Passo 1 — Selecionar campos e valores
  ├── Toggle: Pedido / Item / Combinado
  ├── Lista de campos disponíveis (exceto bloqueados)
  │   ├── Cada campo: label + tipo de operação + input de valor
  │   ├── Campos com múltiplos valores: placeholder "Múltiplos valores"
  │   └── + Adicionar campo (para colunas do usuário)
  └── Preview em tempo real (debounce 300ms → chama /preview)

Passo 2 — Confirmar
  ├── Resumo: X pedidos · Y itens · Z campos alterados
  ├── Lista de campos com valor anterior → valor novo
  ├── Alertas se houver
  └── Botão "Aplicar em Massa"
```

### Props

```ts
interface ModalEdicaoEmMassaProps {
  pedidos: Pedido[]
  onFechar: () => void
  onConcluido: () => void
}
```

---

## Integração em ListaPedidos.tsx

```tsx
// Estado
const [modalEdicaoMassaAberto, setModalEdicaoMassaAberto] = useState(false)

// Botão (substituir o onClick atual que tem console.info)
<BotaoGlobal
  variante="secundario"
  tamanho="pequeno"
  icone={<PencilLine size={14} weight="duotone" />}
  disabled={pedidosSelecionados.length === 0}
  onClick={() => setModalEdicaoMassaAberto(true)}
>
  Editar em Massa{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
</BotaoGlobal>

// Modal
{modalEdicaoMassaAberto && (
  <ModalEdicaoEmMassa
    pedidos={pedidosSelecionados}
    onFechar={() => setModalEdicaoMassaAberto(false)}
    onConcluido={() => {
      setModalEdicaoMassaAberto(false)
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
- [x] **Autorização**: verificar permissão de edição em massa antes de executar
- [x] **Isolamento**: `tenant_id` em todas as queries Prisma
- [x] **Auditoria**: histórico com campos, valores anteriores/novos, usuário e timestamp
- [x] **Campos bloqueados**: validação server-side rejeita campos calculados mesmo se contornado no frontend

---

## Testes

```
testes/unitarios/pedido/edicaoEmMassaService.test.ts
  ├── substituir texto — campo atualizado em todos os pedidos
  ├── somar numero — 1000 + 100 = 1100
  ├── subtrair numero — 1000 - 100 = 900
  ├── percentual — 1000 + 10% = 1100
  ├── avancar_dias — 10/04 + 5 = 15/04
  ├── recuar_dias — 10/04 - 5 = 05/04
  ├── campo bloqueado — rejeita valor_total_pedido
  ├── multiplos_valores — detecta corretamente campos com valores distintos
  ├── nivel item — aplica em todos os itens dos pedidos selecionados
  ├── campo nao tocado — mantém valor original
  └── cross-tenant — rejeita pedidos de outro tenant

testes/funcionais/pedido/edicaoEmMassa.test.ts
  ├── POST /preview — retorna multiplos_valores corretamente
  ├── POST /confirmar — aplica alterações e retorna resultado
  ├── POST /confirmar — rejeita campo bloqueado
  └── POST /confirmar — rejeita pedidos de outro tenant
```
