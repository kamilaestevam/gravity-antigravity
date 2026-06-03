# Painéis da Lista — Contrato técnico

> **Versão:** 1.0  
> **Data:** 2026-06-02  
> **Status:** Aprovado para implementação (Fase 0 concluída com glossário)  
> **Espelho de referência:** `DashboardPainelUsuarioGlobal` + `dashboard-pedido-paineis.ts`

---

## 1. Model Prisma (proposta — Coordenador aplica em `fragment.prisma`)

```prisma
/// Painéis da lista pessoais por usuário.
/// "Global" no nome: product-agnostic; provisório no banco do produto até serviço compartilhado.
model ListaPainelUsuarioGlobal {
  id_lista_painel_usuario_global               String   @id @default(cuid())
  id_organizacao                                String
  id_usuario                                    String
  id_produto_gravity                            String
  nome_lista_painel_usuario_global              String
  ordem_lista_painel_usuario_global             Int      @default(0)
  visivel_lista_painel_usuario_global           Boolean  @default(true)
  config_json_lista_painel_usuario_global       String   @default("{}") @db.Text
  data_criacao_lista_painel_usuario_global      DateTime @default(now())
  data_atualizacao_lista_painel_usuario_global DateTime @updatedAt

  @@index([id_organizacao])
  @@index([id_organizacao, id_usuario])
  @@index([id_organizacao, id_usuario, id_produto_gravity])
  @@map("lista_painel_usuario_global")
}
```

**Diferença em relação ao Dashboard:** `config_json_*` em vez de `widgets_json_*`; **`id_produto_gravity` obrigatório** (evita prefixo `bid_frete_` no CUID).

---

## 2. API REST (Pedido)

Base: `/api/v1/pedidos/lista/paineis`

| Método | Rota | Body | Resposta |
|--------|------|------|----------|
| GET | `/paineis` | — | `{ data: ListaPainel[] }` — bootstrap **Principal** se vazio |
| POST | `/paineis` | `{ nome: string }` | `{ data: ListaPainel }` |
| PUT | `/paineis/reordenar` | `{ ids: string[] }` | `{ data: { reordenado: true } }` |
| PUT | `/paineis/:id_lista_painel_usuario_global` | patch | `{ data: ListaPainel }` |
| DELETE | `/paineis/:id_lista_painel_usuario_global` | — | `{ data: { deletado: true } }` |

**Patch permitido:** `nome`, `is_visivel`, `config_json` (string JSON validada no servidor).

**Segurança:** `withOrganizacao`; filtrar por `id_usuario` do contexto; validar `id_produto_gravity` do produto Pedido; nunca aceitar `ids_workspaces` no painel no MVP.

---

## 3. Contrato JSON — `config_json` v1 (Zod bilateral)

Arquivo sugerido: `servicos-global/produto/pedido/shared/listaPainelConfigSchema.ts` (ou `client/src/shared/lista-painel-schemas.ts` + reexport no server).

```ts
// versao obrigatória para evolução sem quebra silenciosa
export const listaPainelConfigV1Schema = z.object({
  versao: z.literal(1),
  colunas_visiveis: z.array(z.string()),
  colunas_largura: z.record(z.string(), z.number()).optional(),
  aba_status_ativa: z.string(),
  filtros_coluna: z.record(z.string(), filtroAtivoSerializadoSchema),
  ordenacao: z.object({
    campo: z.string(),
    direcao: z.enum(['asc', 'desc']),
  }),
  busca: z.string().optional(),
  cards_topo: z.object({
    ids_visiveis: z.array(z.string()),
    periodo: z.string().optional(),
  }).optional(),
})
```

**Serialização de filtro enum:** `Set<string>` → `string[]` no JSON.

**Explicitamente proibido no v1:** `ids_workspaces_escopo` (fica no seletor lateral / `preferencia_usuario_coluna_pedido` meta global).

---

## 4. Migração de dados (painel Principal)

1. No primeiro GET, se não houver painéis → criar **Principal** (`ordem: 0`).
2. Ler `PreferenciaUsuarioColunaPedido` do usuário:
   - `colunas_visiveis` + `colunas_largura` → `config_json` do Principal.
   - `ids_workspaces_escopo` **permanece** na preferência global (não copiar para painel).
3. Frontend passa a persistir colunas via `PUT` no painel ativo, não mais PUT direto só de colunas (compat: manter rota antiga até transição completa — decisão na implementação).

---

## 5. Frontend (Pedido)

| Peça | Referência |
|------|------------|
| Barra de abas | `PedidosDashboard.tsx` (~L1758–1890) |
| API client | `paineisDashboardApi` → `paineisListaApi` |
| Estado | `painelListaAtualId`, `configByPainel` (Zustand opcional, espelho `dashboardStore`) |
| Escopo filiais | **Somente** `useEscopoWorkspacesPedido` — inalterado |
| Arquivo alvo | `Pedidos.tsx` ou extrair `PedidosListaPainelBar.tsx` |

---

## 6. Fases de implementação

### Fase 0 — Contrato e planos (esta entrega)

- [x] Glossário — `PAINEL-LISTA-GLOSSARIO.md`
- [x] Contrato — este arquivo
- [x] Pipeline — `PAINEL-LISTA-PLANO-ENTREGA.md`
- [ ] Plano de testes multi-agente (QA) — ver `testes/.../painel-lista/`

### Fase 1 — Pedido (MVP)

- Schema + migration (Coordenador)
- Rotas + Zod server
- UI barra de painéis + persistência `config_json`
- Testes unitários + funcionais + E2E executados

### Fase 2 — BID Frete Internacional (**obrigatória após Fase 1**)

- Mesmo model/tabela no banco do produto (ou tabela compartilhada com `id_produto_gravity`)
- Rotas `/api/v1/bid-frete-internacional/lista/paineis`
- Migrar `STORAGE_PREFS_INTL` localStorage → painel Principal
- UI na lista cliente/fornecedor conforme rotas existentes
- Planos de teste dedicados + regressão

### Fase 3 — Núcleo compartilhado (opcional, pós Fase 2)

- Componente `BarraPainelGlobal` em `nucleo-global` se duplicação for alta

### Fase 4 — Escopo por painel (somente com aprovação do dono)

- `ids_workspaces_escopo` em `config_json` v2

---

## 7. `contracts.json`

Registrar todas as rotas da seção 2 antes do merge do PR.

---

## 8. Referências cruzadas

- [PAINEL-LISTA-GLOSSARIO.md](./PAINEL-LISTA-GLOSSARIO.md)
- [PAINEL-LISTA-PLANO-ENTREGA.md](./PAINEL-LISTA-PLANO-ENTREGA.md)
- [COLUNAS-USUARIO-TECNICO.md](./COLUNAS-USUARIO-TECNICO.md)
