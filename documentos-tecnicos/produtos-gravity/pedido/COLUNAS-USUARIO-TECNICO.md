# Colunas do Usuário — Documento Técnico

> **Produto:** Pedido (COMEX)
> **Versão:** 1.1
> **Data:** Abril 2026
> **Última atualização:** 2026-06-09 — fluxo de exclusão com `ModalConfirmarExcluirGlobal`

---

## Estrutura de Arquivos

```
servicos-global/produto/pedido/
├── client/src/
│   ├── pages/
│   │   └── Configuracoes.tsx              ← Aba Colunas → Personalizadas (lista + exclusão)
│   ├── components/
│   │   └── ConfiguracaoColunas/
│   │       ├── GerenciadorColunas.tsx     ← Variante legada/alternativa de gerenciamento
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

## Frontend — Colunas Personalizadas (`Configuracoes.tsx`)

Tela em **Configurações do Produto** → sidebar **Colunas** → **Personalizadas** (`/pedido/configuracoes`):

```
┌──────────────────────────────────────────────────────┐
│  Colunas Personalizadas                [+ Nova Coluna] │
├──────────────────────────────────────────────────────┤
│  ⠿  Margem %        Percentual  Pedido   Ativo  ✏ X │
│  ⠿  Prioridade      Select      Ambos    Ativo  ✏ X │
│  ⠿  Ref. Interna    Texto       Item     Ativo  ✏ X │
└──────────────────────────────────────────────────────┘
```

- Drag-and-drop para reordenar (`pendingColunas` → `colunasUsuarioApi.reordenar`)
- Botão editar (✏) → painel inline de propriedades da coluna
- Botão excluir (X) → abre `ModalConfirmarExcluirGlobal` (não exclui imediatamente)

### Fluxo de exclusão (2026-06-09)

```
Usuário clica X
  → solicitarExcluirColunaPersonalizada(id)
  → ModalConfirmarExcluirGlobal
       titulo:  pedido.config.colunas.personalizadas.modal_excluir_titulo
       descricao: "... Os valores existentes serão preservados."
       nomeItem: nome da coluna
  → Usuário clica Excluir
       → botão entra em loading ("Excluindo...")
       → excluirColunaPersonalizadaConfirmada()
            → colunasUsuarioApi.excluir(id)
            → colunasUsuarioApi.listar() + atualiza estado
            → addNotification (sucesso ou erro)
            → em erro: throw (modal permanece aberto, botão "Falhou")
       → sucesso: flash "Excluído" → modal fecha (~1,2s)
```

**Componente do núcleo:** `@nucleo/modal-confirmar-excluir-global` — ver `PREVISAO_VISUAL.md` no pacote.

> **Variante alternativa:** `GerenciadorColunas.tsx` usa o mesmo modal com o mesmo contrato (`handleExcluirConfirmado`).

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

---

## Busca da Lista (2026-06-10)

A busca textual da Lista de Pedidos cobre as colunas do usuário em **nome** e **conteúdo**.

**Fonte única:** `servicos-global/produto/processos-core/src/services/filtro-busca-pedido.ts`
(`montarCondicoesBuscaPedido`) — consumida por:

| Rota | Uso |
|------|-----|
| `GET /api/v1/pedidos` | `where.AND = [{ OR: condicoes }]` (AND para não colidir com o OR do keyset/cursor) |
| `GET /api/v1/pedidos/lista/kpis` | `where.OR = condicoes` (cards batem com a lista filtrada) |
| `GET /api/v1/pedidos/inicializacao` | `where.AND = [{ OR: condicoes }]` |

**Famílias de match:**
1. Campos fixos do Pedido (número, referências, proforma, invoice)
2. Nomes das partes via `PedidoSnapshotEmpresa.nome_empresa`
3. Colunas do usuário:
   - **conteúdo** — `valor_coluna_usuario_pedido contains termo` (vínculo `pedido` ou `item`;
     match em item promove o pedido pai via `itens_pedido: { some: ... }`)
   - **nome** — termo contido no nome da coluna → pedidos com a coluna **preenchida**

**Regras:**
- Visibilidade respeitada (mesma regra do `ColunasUsuarioService.listar`): coluna `privado`
  só conta para o criador; `roles` só para tipos permitidos — sem isso a busca vazaria
  existência de dado privado.
- Teto de 5.000 vínculos coletados por busca (proteção de SLA contra termos de 1 letra).
- Colunas tipo `formula` não têm valor persistido — resultado de fórmula não é buscável
  no servidor (limitação conhecida).
- O filtro client-side da página (`Pedidos.tsx`, busca global) espelha as mesmas condições
  sobre `_colunas_usuario` — obrigatório manter os dois em sincronia (Mand. 07).

**Pendência (Coordenador):** índice trigram para sustentar o ILIKE no volume —
`CREATE EXTENSION IF NOT EXISTS pg_trgm;` +
`CREATE INDEX CONCURRENTLY idx_valor_coluna_usuario_pedido_valor_trgm ON valor_coluna_usuario_pedido USING gin (valor_coluna_usuario_pedido gin_trgm_ops);`

**Testes:** `servicos-global/produto/pedido/server/src/routes/filtro-busca-pedido.test.ts`
