# Carga perigosa (DG) — BID Frete Internacional

> **Entrega:** 2026-06-12 — escopo DG isolado (catálogo Cadastros + colunas na cotação)  
> **Lei:** `skills/governanca/lei/cadastros-snapshot-policy/SKILL.md` — catálogo ao vivo; cotação congela snapshot inline  
> **Skill produto:** `skills/produtos-gravity/bid-frete-internacional/SKILL.md`

---

## 1. Decisão de produto

| Camada | O quê | Por quê |
|--------|-------|---------|
| **Cadastros** | Catálogo global `mercadoria_perigosa` (lista ONU / Orange Book) | SSOT para combo UN + nome técnico + classe/divisão/PG |
| **Cotação BID** | 7 colunas inline em `cotacao_bid_frete_internacional` | Prestador precisa cotar com dados DG no disparo; snapshot na criação/edição |
| **Proposta** | **Não replica** campos DG | Lê da cotação via `id_cotacao_bid_frete_internacional` (FK) |

`quantidade_volume_cotacao_bid_frete_internacional` **não** é alterado por este escopo.

---

## 2. Catálogo Cadastros — `mercadoria_perigosa`

### 2.1 Model (global, sem `id_organizacao`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id_mercadoria_perigosa` | String @id | CUID |
| `numero_onu_mercadoria_perigosa` | String | Ex.: `1203` |
| `nome_tecnico_embarque_mercadoria_perigosa` | String | Nome PT (embarque) |
| `nome_ascii_mercadoria_perigosa` | String | Normalizado sem acento (busca) |
| `nome_ingles_mercadoria_perigosa` | String | Nome EN |
| `classe_mercadoria_perigosa` | Int | 1–9 |
| `divisao_mercadoria_perigosa` | String? | Ex.: `2.1` |
| `grupo_embalagem_mercadoria_perigosa` | String? | `I`, `II`, `III` |
| `versao_fonte_mercadoria_perigosa` | String | Ex.: `2025` |
| `ativo_mercadoria_perigosa` | Boolean | Default `true` |

**PK natural (unique):** `(numero_onu, nome_ascii, grupo_embalagem)`.

**Código:** `servicos-global/cadastros/prisma/fragment.prisma`  
**Migration:** `20260612140000_add_mercadoria_perigosa_catalogo`  
**Seed:** `prisma/seed-mercadorias-perigosas.ts` + `prisma/data/mercadorias-perigosas-canonicas.ts` (20 entradas iniciais)

### 2.2 API Cadastros (S2S)

| Método | Rota | Auth |
|--------|------|------|
| GET | `/api/v1/cadastros/mercadorias-perigosas` | `x-chave-interna-servico` |
| GET | `/api/v1/cadastros/mercadorias-perigosas/:codigo` | `x-chave-interna-servico` |

Query: `q`, `classe`, `limit`, `apenas_ativos` (default `true`).

**Arquivo:** `servicos-global/cadastros/server/src/routes/mercadorias-perigosas.ts`

---

## 3. Colunas na cotação BID

Migration: `20260612140000_add_carga_perigosa_cotacao_bid_frete_internacional`

| Campo | Tipo | Obrigatório quando DG |
|-------|------|------------------------|
| `eh_carga_perigosa_cotacao_bid_frete_internacional` | Boolean @default(false) | — |
| `numero_onu_cotacao_bid_frete_internacional` | String? | Sim |
| `nome_tecnico_embarque_cotacao_bid_frete_internacional` | String? | Sim |
| `classe_carga_perigosa_cotacao_bid_frete_internacional` | Int? | Sim |
| `divisao_carga_perigosa_cotacao_bid_frete_internacional` | String? | Não |
| `grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional` | String? | Sim, exceto classes 1, 2 e 7 |
| `observacoes_carga_perigosa_cotacao_bid_frete_internacional` | String? | Não (max 500 no Zod) |

**Fragment:** `servicos-global/produto/bid-frete-internacional/prisma/fragment.prisma`

---

## 4. API BID

### 4.1 Proxy dados-mestre (público, sem chave no browser)

| Método | Rota | Arquivo |
|--------|------|---------|
| GET | `/api/v1/bid-frete-internacional/dados-mestre/mercadorias-perigosas` | `server/src/routes/mercadorias-perigosas.ts` |

Resposta: `{ mercadorias_perigosas: MercadoriaPerigosa[], total: number }`  
Falha no Cadastros → HTTP **502** + log (não retorna lista vazia silenciosa).

### 4.2 POST/PATCH cotação

**Arquivo:** `server/src/routes/cotacoes.ts` — `CriarCotacaoSchema` + `superRefine` DG.

- POST `/api/v1/bid-frete-internacional/cotacoes` — persiste campos via spread em `create`
- PATCH `/api/v1/bid-frete-internacional/cotacoes/:id` — se `eh_carga_perigosa === false`, zera os 6 campos DG (`null`)

---

## 5. Frontend — Modal Nova Cotação

| Passo | UX |
|-------|-----|
| **1** | `OptionButton` **Carga Perigosa** (toggle `eh_carga_perigosa_cotacao_bid_frete_internacional`) |
| **3** | Se marcado: combo ONU (`SelectGlobal` + `useMercadoriasPerigosasCadastros`) espelha classe, divisão, PG e nome técnico (readonly) + textarea observações DG |

**Client:** `cadastrosApi.listarMercadoriasPerigosas` → proxy BID + Zod `listaMercadoriasPerigosasBidSchema`.

**Arquivos:**
- `client/src/pages/modal-nova-cotacao-bid-frete-internacional.tsx`
- `client/src/shared/cadastrosApi.ts`
- `client/src/shared/useCadastrosLogistica.ts` (`useMercadoriasPerigosasCadastros`)
- `client/src/shared/types.ts` (`Cotacao` — campos DG opcionais)

Ver também: [MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md](./MODAL-NOVA-COTACAO-BID-FRETE-INTERNACIONAL.md)

---

## 6. Proposta e disparo

- **Proposta:** sem colunas DG — consultar cotação pai.
- **E-mail/disparo ao prestador:** DG **não** incluído nesta entrega (pendência de produto).

---

## 7. Operação — bancos Railway

| Serviço | Volume | TCP público (migrate local) |
|---------|--------|-----------------------------|
| `gravity-cadastros-producao` | `postgres-volume-k04g` | `zephyr.proxy.rlwy.net:16684` |
| `gravity-bid-frete-internacional-producao` | `postgres-volume-CkF7` | `shinkansen.proxy.rlwy.net:28855` |

Env: `CADASTROS_DATABASE_URL` / `BID_FRETE_INTERNATIONAL_DATABASE_URL` no `configurador/.env` e sidecars.

**Migrate Cadastros:** `npx prisma migrate deploy` em `servicos-global/cadastros`  
**Seed:** `npx tsx servicos-global/cadastros/prisma/seed-mercadorias-perigosas.ts` (usar `DATABASE_URL` do Cadastros prod)  
**Migrate BID:** `npx prisma migrate deploy` em `servicos-global/produto/bid-frete-internacional`

---

## 8. Pendências (fora deste doc)

- Zod em `mapCotacaoFromServer` (resposta GET cotação) — PR follow-up
- Pacote `/testes-criar` no fechamento da tela
- DG no template de e-mail/disparo
