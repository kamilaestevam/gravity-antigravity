# Colunas do Usuário — Documento Técnico

> **Produto:** Pedido (COMEX)
> **Versão:** 1.0
> **Data:** Abril 2026

---

## Estrutura de Arquivos

```
produto/pedido/
├── client/src/
│   ├── components/
│   │   └── ConfiguracaoColunas/
│   │       ├── GerenciadorColunas.tsx     ← Tela de gerenciar colunas (em Configurações)
│   │       ├── GerenciadorColunas.css
│   │       ├── ModalNovaColuna.tsx        ← Modal criar/editar coluna
│   │       └── ModalNovaColuna.css
│   └── shared/
│       ├── types.ts                       ← ColunaUsuario, TipoColunaUsuario
│       └── api.ts                         ← colunasUsuarioApi
└── server/src/
    ├── routes/
    │   └── colunasUsuario.ts
    └── services/
        └── colunasUsuarioService.ts
```

---

## Tipos

```ts
export type TipoColunaUsuario =
  | 'texto'
  | 'numero'
  | 'data'
  | 'select'
  | 'checkbox'
  | 'percentual'
  | 'tipo_documento'

export type EscopoColunaUsuario = 'pedido' | 'item' | 'ambos'
export type VisibilidadeColunaUsuario = 'todos' | 'roles' | 'privado'

export interface ColunaUsuario {
  id: string
  tenant_id: string
  nome: string
  chave: string                         // slug do nome: ex "margem_negocio"
  tipo: TipoColunaUsuario
  escopo: EscopoColunaUsuario
  visibilidade: VisibilidadeColunaUsuario
  roles_permitidas?: string[]
  obrigatorio: boolean
  opcoes?: string[]                     // para tipo 'select' e 'tipo_documento'
  descricao?: string
  valor_padrao?: string
  ordem: number
  ativo: boolean
  created_by: string
  created_at: string
}

// Valor de uma coluna do usuário em um pedido/item
export interface ValorColunaUsuario {
  id: string
  tenant_id: string
  coluna_id: string
  vinculo: 'pedido' | 'item'
  vinculo_id: string
  valor: string                         // sempre string, conversão no frontend
}
```

---

## API Client

```ts
export const colunasUsuarioApi = {
  listar: () =>
    request<ColunaUsuario[]>('/api/v1/pedidos/colunas-usuario'),

  criar: (data: Omit<ColunaUsuario, 'id' | 'tenant_id' | 'chave' | 'created_by' | 'created_at'>) =>
    request<ColunaUsuario>('/api/v1/pedidos/colunas-usuario', {
      method: 'POST', body: JSON.stringify(data),
    }),

  atualizar: (id: string, data: Partial<ColunaUsuario>) =>
    request<ColunaUsuario>(`/api/v1/pedidos/colunas-usuario/${id}`, {
      method: 'PUT', body: JSON.stringify(data),
    }),

  excluir: (id: string) =>
    request<void>(`/api/v1/pedidos/colunas-usuario/${id}`, { method: 'DELETE' }),

  reordenar: (ids: string[]) =>
    request<void>('/api/v1/pedidos/colunas-usuario/reordenar', {
      method: 'POST', body: JSON.stringify({ ids }),
    }),

  // Valores
  salvarValores: (vinculo: 'pedido' | 'item', vinculo_id: string, valores: Record<string, string>) =>
    request<void>('/api/v1/pedidos/colunas-usuario/valores', {
      method: 'POST', body: JSON.stringify({ vinculo, vinculo_id, valores }),
    }),

  listarValores: (vinculo: 'pedido' | 'item', vinculo_id: string) =>
    request<ValorColunaUsuario[]>(`/api/v1/pedidos/colunas-usuario/valores?vinculo=${vinculo}&vinculo_id=${vinculo_id}`),
}
```

---

## Backend — Rotas (`routes/colunasUsuario.ts`)

### `GET /api/v1/pedidos/colunas-usuario`
Lista colunas ativas do tenant, filtrando por visibilidade (só retorna as que o usuário pode ver)

### `POST /api/v1/pedidos/colunas-usuario`

**Zod schema:**
```ts
z.object({
  nome: z.string().min(1).max(60),
  tipo: z.enum(['texto','numero','data','select','checkbox','percentual','tipo_documento']),
  escopo: z.enum(['pedido','item','ambos']),
  visibilidade: z.enum(['todos','roles','privado']),
  roles_permitidas: z.array(z.string()).optional(),
  obrigatorio: z.boolean().default(false),
  opcoes: z.array(z.string()).optional(),
  descricao: z.string().optional(),
  valor_padrao: z.string().optional(),
})
```

**Lógica:**
```
1. Validar Zod
2. Verificar limite: tenant já tem < 50 colunas
3. Verificar nome único no tenant
4. Gerar chave: slugify(nome) — ex: "Margem %" → "margem_percentual"
5. Calcular ordem: max(ordem) + 1
6. Criar ColunaUsuario
```

### `PUT /api/v1/pedidos/colunas-usuario/:id`
- Não permite alterar `tipo` (preserva integridade dos dados existentes)
- Permite alterar: nome, escopo, visibilidade, opcoes, descricao, obrigatorio, valor_padrao

### `DELETE /api/v1/pedidos/colunas-usuario/:id`
- Soft delete: `ativo = false` (preserva dados, some da interface)
- NÃO deleta os `ValorColunaUsuario` existentes

### `POST /api/v1/pedidos/colunas-usuario/reordenar`
Atualiza `ordem` de múltiplas colunas em `$transaction`

### `POST /api/v1/pedidos/colunas-usuario/valores`
Upsert de valores: para cada `{coluna_id, valor}`, faz `upsert` na tabela `ValorColunaUsuario`

### `GET /api/v1/pedidos/colunas-usuario/valores`
Retorna valores de todas as colunas do usuário para um pedido ou item

---

## Fragment Prisma

```prisma
model ColunaUsuarioPedido {
  id               String   @id @default(cuid())
  tenant_id        String
  product_id       String?
  nome             String
  chave            String
  tipo             String
  escopo           String   // 'pedido' | 'item' | 'ambos'
  visibilidade     String   // 'todos' | 'roles' | 'privado'
  roles_permitidas String[] @default([])
  obrigatorio      Boolean  @default(false)
  opcoes           String[] @default([])
  descricao        String?
  valor_padrao     String?
  ordem            Int      @default(0)
  ativo            Boolean  @default(true)
  created_by       String
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt

  valores ValorColunaUsuarioPedido[]

  @@unique([tenant_id, chave])
  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@map("colunas_usuario_pedido")
}

model ValorColunaUsuarioPedido {
  id         String   @id @default(cuid())
  tenant_id  String
  product_id String?
  coluna_id  String
  vinculo    String   // 'pedido' | 'item'
  vinculo_id String
  valor      String

  coluna ColunaUsuarioPedido @relation(fields: [coluna_id], references: [id])

  @@unique([tenant_id, coluna_id, vinculo_id])
  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, vinculo_id])
  @@map("valores_colunas_usuario_pedido")
}
```

---

## Frontend — GerenciadorColunas.tsx

Tela em Configurações do Produto:

```
┌──────────────────────────────────────────────────────┐
│  Colunas Customizadas                  [+ Nova Coluna]│
├──────────────────────────────────────────────────────┤
│  ⠿  Margem %        Percentual  Pedido   Todos   ✏🗑  │
│  ⠿  Prioridade      Select      Ambos    Todos   ✏🗑  │
│  ⠿  Ref. Interna    Texto       Item     Privado ✏🗑  │
│  ⠿  Tipo Doc        Tipo Doc    Pedido   Roles   ✏🗑  │
└──────────────────────────────────────────────────────┘
```

- Drag-and-drop para reordenar (usando `onReordenar`)
- Botão editar → abre `ModalNovaColuna` preenchido
- Botão excluir → confirma e faz soft delete

---

## Frontend — ModalNovaColuna.tsx

```
┌───────────────────────────────────┐
│  Nova Coluna                      │
├───────────────────────────────────┤
│  Nome          [________________] │
│  Tipo          [Percentual    ▼]  │
│  Escopo        [Ambos         ▼]  │
│  Visibilidade  [Todos         ▼]  │
│  Obrigatório   [ ] Sim            │
│  Valor padrão  [________________] │
│  Descrição     [________________] │
│                                   │
│  [Cancelar]          [Salvar]     │
└───────────────────────────────────┘
```

Quando tipo = `select` ou `tipo_documento`: exibe campo para adicionar opções da lista.

---

## Integração nas Features Existentes

### Tabela (ListaPedidos)
- `colunasUsuarioApi.listar()` na inicialização
- Adicionar ao `COLUNAS_PAI` as colunas do usuário com escopo `pedido` ou `ambos`
- Passar para `SelectColunasGlobal` como colunas normais

### Drawer (DrawerPedido)
- Carregar valores com `colunasUsuarioApi.listarValores('pedido', pedidoId)`
- Renderizar campos extras após os campos fixos
- Salvar com `colunasUsuarioApi.salvarValores()` junto ao POST/PUT do pedido

### Edição em Massa
- `colunasUsuarioApi.listar()` para adicionar ao seletor de campos
- Tipo da coluna define operações disponíveis (percentual → operações de número)

### Smart Import
- Incluir `chave` das colunas do usuário no dicionário de mapeamento
- Sugerir como colunas mapeáveis durante o import

### Exportação Excel
- Incluir valores das colunas do usuário nas linhas exportadas

### Gerar PDF
- Disponibilizar `{{coluna_chave}}` como variável no template Handlebars

---

## Testes

```
testes/unitarios/pedido/colunasUsuarioService.test.ts
  ├── criar coluna — chave gerada corretamente do nome
  ├── criar coluna — bloqueia se limite 50 atingido
  ├── criar coluna — bloqueia se nome duplicado no tenant
  ├── atualizar coluna — não permite mudar tipo
  ├── excluir coluna — soft delete, valores preservados
  ├── visibilidade roles — oculta para usuário sem role
  ├── salvar valores — upsert correto
  └── cross-tenant — coluna de outro tenant não retornada
```
