# Tipo de Operação — Documentação Técnica Completa

**Última atualização:** 2026-04-07  
**Produto:** Pedido  
**Status:** ✅ Implementado

---

## 1. Conceito

O campo `tipo_operacao` define se um pedido é uma **compra do exterior** (importação) ou uma **venda para o exterior** (exportação). Esse campo governa:

- Qual parceiro é o **próprio tenant** (somente leitura, vem do Configurador)
- Qual parceiro é o **terceiro externo** (editável pelo usuário)
- Qual FK de parceiro é usada no banco
- Quais campos são exibidos/editáveis no front-end
- Como o pedido aparece em views como Kanban e Consolidação

---

## 2. Valores válidos

| Valor | Sigla comercial | Descrição |
|---|---|---|
| `importacao` | PO — Purchase Order | O tenant **compra** de um fornecedor estrangeiro |
| `exportacao` | SO — Sales Order | O tenant **vende** para um cliente estrangeiro |

Definido no Zod como:
```typescript
// servicos-global/tenant/processos-core/src/routes/pedidos.ts:48
tipo_operacao: z.enum(['importacao', 'exportacao'])
```

---

## 3. Banco de Dados

### 3.1 Fragment Prisma
**Arquivo:** `servicos-global/tenant/processos-core/prisma/fragment.prisma`

```prisma
model Pedido {
  tipo_operacao String  // 'importacao' | 'exportacao'

  // FKs de parceiros — apenas UM é preenchido por pedido
  importacao_exportador_id String?  // Se importacao: FK do fornecedor estrangeiro (Exterior)
  exportacao_importador_id String?  // Se exportacao: FK do cliente estrangeiro (Exterior)
  fabricante_id            String?  // FK do fabricante (independente do tipo)

  // JSON polimórfico — nomes dos parceiros armazenados localmente
  detalhes_operacionais Json?
  // Estrutura do JSON (completa após implementação 2026-04-07):
  // {
  //   "exportador_nome": string | null,   ← nome do fornecedor (editável em importacao)
  //   "importador_nome": string | null,   ← nome do cliente   (editável em exportacao)
  //   "fabricante_nome": string | null
  // }
}
```

### 3.2 Índice relevante

```prisma
@@index([tenant_id, tipo_operacao])
```

### 3.3 Estado atual dos campos no JSON

| Campo JSON | Existe | Surfaçado em mapPedido | Editável |
|---|---|---|---|
| `exportador_nome` | ✅ Sim | ✅ Sim | ✅ Apenas em `importacao` |
| `importador_nome` | ✅ Sim | ✅ Sim | ✅ Apenas em `exportacao` |
| `fabricante_nome` | ✅ Sim | ✅ Sim | ✅ Qualquer tipo |

---

## 4. Regra de Negócio — Parceiros por Tipo de Operação

### 4.1 Tabela mestre

| tipo_operacao | Campo             | FK no banco                | Origem                                        | Editável pelo usuário |
|---            |---                |---                         |---                                            |---                    |
| `importacao`  | `exportador_nome` | `importacao_exportador_id` | Parceiro externo (fornecedor)                 | ✅ Sim                |
| `importacao`  | `importador_nome` | *(sem FK)*                 | Tenant = próprio importador (Configurador)    | ❌ Não                |
| `exportacao`  | `exportador_nome` | *(sem FK)*                 | Tenant = próprio exportador (Configurador)    | ❌ Não                |
| `exportacao`  | `importador_nome` | `exportacao_importador_id` | Parceiro externo (cliente)                    | ✅ Sim                |

### 4.2 Lógica resumida

> O nome que vem de uma FK externa (parceiro de fora) **pode ser editado**.  
> O nome que representa o próprio tenant **vem do Configurador e é somente leitura**.

### 4.3 Nota sobre FKs inexistentes

Os campos `importacao_importador_id` e `exportacao_exportador_id` **não existem** no banco. Não são necessários porque o tenant é sempre uma das partes — seu nome já está no Configurador (workspace).

---

## 5. Backend

### 5.1 Arquivo principal
`servicos-global/tenant/processos-core/src/routes/pedidos.ts`

### 5.2 Função `mapPedido` — estado atual
```typescript
// linha 140–160
export function mapPedido(pedido: any): any {
  const det = (pedido.detalhes_operacionais as Record<string, unknown> | null) ?? {}
  return {
    ...pedido,
    exportador_nome: (det.exportador_nome as string | null | undefined) ?? null,
    importador_nome: (det.importador_nome as string | null | undefined) ?? null,
    fabricante_nome: (det.fabricante_nome as string | null | undefined) ?? null,
  }
}
```

### 5.3 `CAMPOS_EDITAVEIS` — estado atual
```typescript
const CAMPOS_EDITAVEIS = new Set([
  'exportador_nome',  // validação condicional por tipo_operacao feita no handler
  'importador_nome',  // validação condicional por tipo_operacao feita no handler
  'fabricante_nome',
  'importacao_exportador_id',
  'exportacao_importador_id',
  ...
])
```

### 5.4 PATCH `/:id/campo` — validação por tipo_operacao
```typescript
// Bloqueia edição do campo errado para o tipo de operação
if (campo === 'exportador_nome' && pedido.tipo_operacao === 'exportacao') {
  throw new AppError(400, 'exportador_nome nao pode ser editado em pedidos de exportacao — vem do Configurador')
}
if (campo === 'importador_nome' && pedido.tipo_operacao === 'importacao') {
  throw new AppError(400, 'importador_nome nao pode ser editado em pedidos de importacao — vem do Configurador')
}
```

### 5.5 PATCH `/:id/campo` — merge em detalhes_operacionais
```typescript
} else if (campo === 'exportador_nome' || campo === 'importador_nome' || campo === 'fabricante_nome') {
  const detAtual = typeof pedido.detalhes_operacionais === 'object' ...
  dadosUpdate = { detalhes_operacionais: { ...detAtual, [campo]: valor } }
}
```

### 5.6 PATCH `/:id/campo` — schema Zod
```typescript
const editarCampoSchema = z.object({
  campo:      z.string().min(1),
  valor:      z.unknown(),
  updated_at: z.string().datetime(),
})
```

### 5.7 Outros arquivos backend que referenciam os campos

| Arquivo | O que faz |
|---|---|
| `servicos-global/.../importacao.ts:110` | Grava `exportador_nome` em `detalhes_operacionais` ao importar pedido |
| `produto/pedido/server/src/routes/consolidar.ts:60` | `importador_nome` + `exportador_nome` como campos divergentes na comparação |
| `produto/pedido/server/src/routes/consolidar.ts:246` | Preserva `exportador_nome`, `importador_nome` e `fabricante_nome` do primeiro pedido em `detalhes_operacionais` |
| `produto/pedido/server/src/services/pdfService.ts:79` | Lê `exportador_nome` para gerar PDF |

---

## 6. Frontend

### 6.1 Interface `Pedido`
**Arquivo:** `produto/pedido/client/src/shared/types.ts`

```typescript
export interface Pedido {
  exportador_nome?: string | null
  importador_nome?: string | null
  importacao_exportador_id: string | null
  exportacao_importador_id: string | null
  tipo_operacao: 'importacao' | 'exportacao'
  ...
}
```

### 6.2 Colunas na tabela — ColunasPai.tsx (atualizado 2026-05-16)

As colunas `nome_exportador` e `nome_importador` são **campos-link** (não editáveis inline). Renderizam como badges clicáveis que navegam ao Configurador ou à tela de Empresas e Parceiros.

**Regra de renderização por tipo_operacao:**

| tipo_operacao | Importador | Exportador |
|---|---|---|
| `importacao` | Badge workspace (auto-preenchido via `workspacesMap`) + ícone `Buildings` | "Vincular Exportador" (vazio) ou badge contraparte + ícone `LinkSimple` |
| `exportacao` | "Vincular Importador" (vazio) ou badge contraparte + ícone `LinkSimple` | Badge workspace (auto-preenchido via `workspacesMap`) + ícone `Buildings` |

**Padrão visual permanente — Gravity Indigo (`#818cf8`):**
- **Modelo 01 (preenchido):** badge com `background: rgba(129, 140, 248, 0.12)`, `border: rgba(129, 140, 248, 0.28)`, `color: #818cf8`
- **Modelo 02 (vazio):** texto sublinhado pontilhado `color: #818cf8`
- Cores idênticas ao chip de filtro da tabela (`FiltrosColuna.css`)

**Deep-links:**
- Workspace → `urlEditarCnpjWorkspace()` (Configurador, modal de edição do workspace com "Voltar para Pedidos")
- Contraparte → `urlVincularExportador()` / `urlVincularImportador()` (Configurador, tela Empresas e Parceiros)

**Fonte de dados:**
- Workspace: `workspacesMap.get(row.id_workspace)?.nome` (carregado via `/api/v1/hub/init`)
- Contraparte: `cadastrosApi.listarExportadoresQuandoImportacao()` / `cadastrosApi.listarImportadoresQuandoExportacao()` (Cadastros, porta 8031)

### 6.3 `CAMPOS_PAI_TEXTO` — controla edição inline de filhos
```typescript
const CAMPOS_PAI_TEXTO = new Set([
  'exportador_nome', 'importador_nome', 'fabricante_nome', ...
])
```

### 6.4 `MAPA_COLUNAS_FILHO` — editabilidade condicional por tipo_operacao
```typescript
exportador_nome: {
  editavel: (row: PedidoItem) => (row as PedidoItemEnriquecido)._p?.tipo_operacao === 'importacao',
  render: (row) => <span>{p?.exportador_nome ?? '—'}</span>,
},
importador_nome: {
  editavel: (row: PedidoItem) => (row as PedidoItemEnriquecido)._p?.tipo_operacao === 'exportacao',
  campo: 'importador_nome',
  render: (row) => <span>{p?.importador_nome ?? '—'}</span>,
},
```

> O tipo `GTMapaColunasFilho.editavel` foi estendido de `boolean` para `boolean | ((item: C) => boolean)` para suportar esse padrão.

### 6.5 `handleEditarFilho` — propaga edição para o pedido pai
```typescript
const pedidoAtualizado = (campo === 'exportador_nome' || campo === 'importador_nome' || campo === 'fabricante_nome')
  ? await pedidoVirtualApi.editarCampo(pedido.id, campo, valor, pedido.updated_at)
  : await pedidoVirtualApi.editarCampo(pedido.id, campo, valor, pedido.updated_at)
```

### 6.6 Enriquecimento de item com dados do pedido pai
```typescript
_p: {
  exportador_nome: pedido.exportador_nome ?? null,
  importador_nome: pedido.importador_nome ?? null,
  ...
}
```

### 6.7 Edição em massa — ModalEdicaoEmMassa.tsx
```typescript
{ campo: 'exportador_nome', ...,
  visivel: (pedidos: Pedido[]) => pedidos.some(p => p.tipo_operacao === 'importacao') },
{ campo: 'importador_nome', rotulo: 'Importador — Nome', tipo: 'texto', nivel: 'pedido', grupo: 'Importador',
  visivel: (pedidos: Pedido[]) => pedidos.some(p => p.tipo_operacao === 'exportacao') },
```

`camposParaNivel` filtra por `visivel` antes de renderizar os campos:
```typescript
function camposParaNivel(nivel: NivelEdicao, pedidos: Pedido[] = []): DefinicaoCampo[] {
  const filtrar = (lista: DefinicaoCampo[]) =>
    lista.filter(d => !d.visivel || d.visivel(pedidos))
  ...
}
```

### 6.8 Outros arquivos frontend

| Arquivo | O que faz |
|---|---|
| `KanbanPedidos.tsx` linhas 54, 89, 91, 175 | Exibe `exportador_nome \|\| importador_nome` no card |
| `api.ts` | Mock SmartImport com `exportador_nome` hardcoded |
| `mockData.ts` linha 265 | Mock com `importador_nome: 'Argentina Importadora S.A.'` (exportacao) |

---

## 7. Nucleo Global — Alterações

**Arquivo:** `nucleo-global/Tabelas/tabela-virtual-global/src/tipos.ts`

```typescript
// GTMapaColunasFilho — editavel agora aceita função
export interface GTMapaColunasFilho<C = unknown> {
  editavel?: boolean | ((item: C) => boolean)  // ← estendido
  ...
}
```

**Arquivo:** `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx`

```typescript
// Handler para suportar editavel como função
const editavelMapa = typeof mapa?.editavel === 'function' ? mapa.editavel(item) : !!mapa?.editavel
const podeEditar = (editavelMapa || camposEditaveisFilhos.includes(col.key as string)) && !!onEditarFilho
```

---

## 8. Gaps fechados (2026-04-07)

| # | Gap | Status |
|---|---|---|
| G1 | `importador_nome` não estava em `detalhes_operacionais` / `mapPedido` | ✅ Corrigido |
| G2 | `exportador_nome` editável sem checar `tipo_operacao` | ✅ Corrigido — backend bloqueia em exportacao |
| G3 | `importador_nome` ausente de `CAMPOS_EDITAVEIS` | ✅ Corrigido |
| G4 | `importador_nome` ausente de `CAMPOS_PAI_TEXTO` | ✅ Corrigido |
| G5 | Edição em massa sem restrição por `tipo_operacao` | ✅ Corrigido — `visivel` por tipo |
| G6 | Kanban exibe campo sem lógica de tipo | ⚠️ Não alterado — `exportador_nome \|\| importador_nome` é aceitável por ora |
| G7 | `handleEditarFilho` não tratava `importador_nome` | ✅ Corrigido |
| G8 | Consolidação sem `importador_nome` nos campos divergentes | ✅ Corrigido |

---

## 9. Gaps pendentes / futuro

| # | Gap | Prioridade |
|---|---|---|
| P1 | Kanban: exibir somente o campo correto por `tipo_operacao` (agora usa `\|\|`) | Baixa |
| P2 | Permissões granulares para editar esses campos (Configurador) | Médio — pós-Configurador |
| P3 | Spec Playwright para editabilidade condicional por tipo_operacao | Médio |
| P4 | `duplicar-itens.spec.ts` com falha pré-existente (botão "Duplicar" toolbar) | Alto — issue separada |

---

## 10. Referências de código

| Símbolo | Arquivo | Linha |
|---|---|---|
| `tipo_operacao` enum Zod | `pedidos.ts` | 48 |
| `importacao_exportador_id` FK | `fragment.prisma` | 19 |
| `exportacao_importador_id` FK | `fragment.prisma` | 20 |
| `detalhes_operacionais` JSON | `fragment.prisma` | 58 |
| `mapPedido` | `pedidos.ts` | 140–160 |
| `CAMPOS_EDITAVEIS` | `pedidos.ts` | 489–510 |
| PATCH `/:id/campo` validação tipo_operacao | `pedidos.ts` | ~549–556 |
| PATCH `/:id/campo` detalhes_operacionais | `pedidos.ts` | 619 |
| `CAMPOS_PAI_TEXTO` | `ListaPedidos.tsx` | ~3029 |
| `MAPA_COLUNAS_FILHO` exportador/importador | `ListaPedidos.tsx` | ~545–560 |
| `handleEditarFilho` | `ListaPedidos.tsx` | ~4198 |
| Enriquecimento `_p.importador_nome` | `ListaPedidos.tsx` | ~4248, ~4284 |
| `DefinicaoCampo.visivel` | `ModalEdicaoEmMassa.tsx` | — |
| `camposParaNivel` filtro | `ModalEdicaoEmMassa.tsx` | — |
| `importador_nome` em `CAMPOS_COMPARAR` | `consolidar.ts` | 60 |
| `detalhes_operacionais` no consolidado | `consolidar.ts` | 246–257 |
| `GTMapaColunasFilho.editavel` tipo | `tipos.ts` (nucleo-global) | 177 |
| Handler `editavel` como função | `TabelaVirtualGlobal.tsx` | ~1641 |
