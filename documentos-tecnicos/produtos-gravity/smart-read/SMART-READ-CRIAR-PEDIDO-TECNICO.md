# Smart Docs → Pedido — criar pedido a partir de leitura (TASK-000408)

> **SSOT:** ponte Lista Pedido (+ Novo → Smart Docs) → wizard Smart Docs → `pedido` + `pedido_item` no banco Pedido.  
> **Código:** `servicos-global/produto/smart-read/` + `servicos-global/produto/pedido/server/`  
> **Contrato Zod bilateral:** `smart-read/shared/conversao-leitura-pedido-smart-read-schema.ts`

---

## 1. Entrada do usuário

| Onde | Ação |
|------|------|
| Pedido → Lista → **+ Novo** → **Smart Docs** | Redirect `window.location.href = '/smart-read/lista?origem=pedido&acao=nova-leitura'` |
| Feature flag | `pedido/client/src/shared/config.ts` → `PRODUCT_CONFIG.features.smart_read` |
| UI duplicada | `BarraAcoesPedido.tsx` e `Pedidos.tsx` (menu inline) — mesma regra |

Query params:

| Param | Função |
|-------|--------|
| `origem=pedido` | Wizard passo 4 chama `POST …/criar-pedido` ao concluir |
| `acao=nova-leitura` | Lista abre modal Nova Leitura automaticamente |

Toast de sucesso (1º linha): `Pedido {numero_pedido} criado no Pedido` (plural se `pedidos_criados.length > 1`).

---

## 2. Quatro camadas (arquitetura híbrida)

| Camada | Onde | Responsabilidade |
|--------|------|------------------|
| 1 DATI | Legado | Extração bruta — inalterada |
| 2 Snapshot | Postgres `gravity-smart-read-*` · `snapshot_leitura_smart_read` | `LeituraSchema` normalizado |
| 3 DE/PARA | Postgres `gravity-smart-read-*` · `conversao_leitura_pedido_smart_read` | Linhagem auditável + refs cross-banco |
| 4 Negócio | Postgres Pedido · `pedido` + `pedido_item` | Registros canônicos; canal `smart_read` no histórico |

**Orquestração:**

1. BFF Smart Read — `POST /api/v1/smart-read/leituras/:id_leitura/criar-pedido` (após wizard, `origem=pedido`)
2. BFF chama Pedido S2S — `POST /api/v1/pedidos/importacoes-smart-read/criar`
3. Pedido server busca leitura no Smart Read, converte, cria pedido(s) + snapshots NCM/moeda/unidade (best-effort)
4. BFF persiste `conversao_leitura_pedido_smart_read`

---

## 3. Rotas e contratos

### Smart Read (BFF `:8033`)

| Método | Rota | Função |
|--------|------|--------|
| `POST` | `/leituras/:id_leitura/criar-pedido` | Orquestrador; idempotente por `id_leitura` (`409 LEITURA_JA_CONVERTIDA`) |
| `GET` | `/leituras/:id_leitura/snapshot-id` | `{ id_snapshot_leitura_smart_read }` para S2S Pedido |

Registro: `servicos-global/contracts.json` → `smart-read.endpoints.leituras-pedido`.

### Pedido (S2S `:8030`)

| Método | Rota | Função |
|--------|------|--------|
| `POST` | `/importacoes-smart-read/criar` | Converte snapshot conferido → pedido+itens |

Body: `CriarPedidoDeLeituraSmartReadRequestSchema` (`id_leitura`, `id_snapshot_leitura_smart_read?`).  
Resposta: `CriarPedidoDeLeituraSmartReadRespostaSchema` (+ `pedidos_criados?` quando vários `numero_pedido` na leitura).

Headers S2S: `x-chave-interna-servico`, `x-id-organizacao`, `x-id-workspace` (obrigatório ≠ org), `x-id-usuario`, `x-nome-usuario`.  
Permissão: `pedido:lista:editar`.

Registro: `servicos-global/contracts.json` → `pedido.endpoints.importacoes-smart-read`.

---

## 4. Persistência Gravity — `conversao_leitura_pedido_smart_read`

| Atributo | Valor |
|----------|-------|
| Model | `ConversaoLeituraPedidoSmartRead` |
| Fragment | `smart-read/prisma/fragment.prisma` |
| Migration | `20260703230000_create_conversao_leitura_pedido_smart_read` |
| Deploy DB | `scripts/ativamente/migrate-smart-read-railway.ps1 -Ambiente producao` |
| Unique | `(id_organizacao, id_leitura_legado_conversao_leitura_pedido)` |

Colunas-chave: `id_pedido`, `ids_pedido_item_conversao_leitura_pedido` (JSON), `status_conversao_leitura_pedido_smart_read` (`sucesso` \| `parcial` \| `falha`), `detalhe_mapeamento_conversao_leitura_pedido` (JSON DE/PARA).

**Sem FK cross-banco** — referências por string (`id_pedido` vive no banco Pedido).

Detalhe completo da tabela e demais models: [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) §3.2.

---

## 5. Conversão DE/PARA

| Arquivo | Função |
|---------|--------|
| `shared/converter-leitura-para-pedido-smart-read.ts` | Legado/snapshot → campos Pedido + `detalhe_mapeamento` |
| `pedido/server/src/services/smartReadParaPedidoService.ts` | Cria 1 pedido por grupo `numero_pedido`; snapshots cadastros best-effort |
| `pedido/server/src/lib/buscar-snapshots-cadastros-iniciais-pedido.ts` | NCM/moeda/unidade (espelha `POST /pedidos`) |

---

## 6. Testes

| Arquivo | Cobertura |
|---------|-----------|
| `testes/.../converter-leitura-para-pedido-smart-read.test.ts` | Mapeamento invoice → pedido |
| `testes/.../buscar-snapshots-cadastros-iniciais-pedido.test.ts` | Snapshots best-effort |
| `testes/.../importacoes-smart-read-criar.test.ts` | Rota Pedido S2S (mock) |

---

## 7. Documentos relacionados

| Doc | Conteúdo |
|-----|----------|
| [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) | Onde vive cada dado Smart Read |
| [MIGRACAO-DATI-GRAVITY.md](./MIGRACAO-DATI-GRAVITY.md) | Checklist deploy Postgres Smart Read |
| [README.md](./README.md) | Índice Smart Docs |
