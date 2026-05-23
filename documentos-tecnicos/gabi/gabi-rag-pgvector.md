# Gabi RAG com pgvector — Documentacao Tecnica

## Visao Geral

A Gabi e a assistente IA da plataforma Gravity. Originalmente, toda a base de conhecimento (KB) era injetada como texto no system prompt (~310k tokens por chamada). O pipeline RAG com pgvector substitui essa injecao monolitica por busca semantica, entregando apenas os chunks mais relevantes para cada pergunta (~12k tokens max).

Beneficios:

- Reducao de ~96% no consumo de tokens por chamada
- Respostas mais relevantes por contexto filtrado
- Segmentacao automatica por produto/pagina
- Fallback automatico para KB estatica quando pgvector nao esta disponivel

## Arquitetura — Fluxo RAG

```
1. Usuario envia mensagem (query) + pagina atual
2. selectKnowledge() verifica se RAG esta disponivel
3. Se sim:
   a. Query -> embed via Gemini text-embedding-004 -> vetor 768d
   b. Cosine similarity contra tabela gabi_kb_chunk (pgvector)
   c. Filtra por segmento (PAGE_SEGMENT_MAP) se pagina mapeada
   d. Seleciona top-K chunks respeitando MAX_TOTAL_TOKENS
   e. Chunks formatados injetados no system prompt
4. Se nao (pgvector ausente ou erro):
   a. Fallback para KB estatica (arquivo .txt em disco)
   b. Segmento por rota ou KB completa
```

## Componentes

### fragment.prisma — Model GabiKbChunk

Caminho: `servicos-global/servicos-plataforma/gabi/prisma/fragment.prisma`

```prisma
model GabiKbChunk {
  id_gabi_kb_chunk             String  @id @default(cuid())
  hash_conteudo_gabi_kb_chunk  String  @unique
  conteudo_gabi_kb_chunk       String  @db.Text
  embedding_gabi_kb_chunk      Unsupported("vector(768)")
  segmento_gabi_kb_chunk       String
  titulo_secao_gabi_kb_chunk   String
  nivel_gabi_kb_chunk          Int     @default(1)
  tokens_gabi_kb_chunk         Int
  versao_kb_gabi_kb_chunk      String
  ordem_gabi_kb_chunk          Int     @default(0)
  data_criacao_gabi_kb_chunk     DateTime @default(now())
  data_atualizacao_gabi_kb_chunk DateTime @updatedAt

  @@index([segmento_gabi_kb_chunk], map: "gkc_seg_idx")
  @@index([versao_kb_gabi_kb_chunk], map: "gkc_ver_idx")
  @@map("gabi_kb_chunk")
}
```

O campo `embedding_gabi_kb_chunk` usa `Unsupported("vector(768)")` porque Prisma nao suporta o tipo `vector` nativamente. A tabela fisica e criada via migration SQL direta.

Indice HNSW para busca rapida:
```sql
CREATE INDEX gkc_embedding_hnsw_idx
ON gabi_kb_chunk
USING hnsw (embedding_gabi_kb_chunk vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### compile.ts — Compilacao da KB

Caminho: `servicos-global/servicos-plataforma/gabi/server/knowledge/compile.ts`

Coleta arquivos `.md` de `skills/` e `documentos-tecnicos/`, filtrando diretorios internos (governanca, dream-team, arquitetura, seguranca, etc.). Gera:

- `gravity-knowledge-base.txt` — KB completa filtrada
- `segments/*.txt` — 12 segmentos por produto (configurador, lpco, pedido, nf-importacao, bid-frete, bid-cambio, financeiro-comex, simula-custo, processo, dashboard, marketplace, api-cockpit)

### ingest.ts — Pipeline de Ingestao

Caminho: `servicos-global/servicos-plataforma/gabi/server/knowledge/ingest.ts`

Fluxo:

1. Le KB compilada + segmentos de `segments/`
2. Chunka por headers markdown (h1-h4), com split de chunks grandes (MAX_CHUNK_TOKENS = 800)
3. Hash SHA-256 de cada chunk para deduplicacao
4. Gera embeddings em batch (BATCH_SIZE = 20, delay 200ms entre batches) via Gemini `text-embedding-004` (768 dimensoes)
5. Upsert em cada schema `tenant_*` via `ON CONFLICT (hash_conteudo_gabi_kb_chunk) DO UPDATE`
6. Limpa chunks de versoes anteriores (versao = data do dia)
7. Cria indice HNSW se nao existir

Usa `pg` (node-postgres) diretamente para SQL raw com vetores — Prisma nao suporta o tipo `vector`.

### kb-search.ts — Busca Semantica

Caminho: `servicos-global/servicos-plataforma/gabi/server/services/kb-search.ts`

Constantes:

| Constante | Valor | Descricao |
|-----------|-------|-----------|
| EMBEDDING_MODEL | `text-embedding-004` | Modelo Gemini para embeddings |
| DEFAULT_TOP_K | 10 | Maximo de chunks retornados |
| MAX_TOTAL_TOKENS | 12000 | Limite total de tokens nos chunks selecionados |
| MIN_SIMILARITY | 0.3 | Score minimo de similaridade (cosine) |

Fluxo:

1. Embeda a query do usuario via Gemini
2. Busca `topK * 2` chunks candidatos com `$queryRawUnsafe` usando operador `<=>` (cosine distance)
3. Filtra por `segmento` se a pagina esta no PAGE_SEGMENT_MAP
4. Seleciona os top-K finais respeitando o limite de tokens total
5. Retorna chunks formatados + metadados (KbSearchMeta)

A similaridade e calculada como `1 - (embedding <=> query_vector)`. Somente chunks com similaridade > 0.3 sao considerados.

### chat.ts — Orquestrador de Conhecimento

Caminho: `servicos-global/servicos-plataforma/gabi/server/services/chat.ts`

Funcao principal: `selectKnowledge(query, page)`.

1. Verifica se RAG esta disponivel (tenta `SELECT 1 FROM gabi_kb_chunk LIMIT 1`, resultado cacheado em memoria)
2. Se disponivel, chama `searchKnowledgeBase()` e retorna chunks + meta
3. Se RAG falha ou retorna vazio, cai para `selectKnowledgeFallback()`:
   - Se pagina mapeada: retorna segmento(s) do disco
   - Se nao mapeada: retorna KB completa

O system prompt recebe label diferente conforme a fonte:
- RAG: "CHUNKS RELEVANTES VIA BUSCA SEMANTICA"
- Segmento estatico: "SEGMENTO RELEVANTE PARA A PAGINA ATUAL"
- KB completa: "BASE DE CONHECIMENTO DA PLATAFORMA GRAVITY"

### audit.ts — Metricas RAG no Log

Caminho: `servicos-global/servicos-plataforma/gabi/server/services/audit.ts`

Quando `ragMeta` esta presente:

- Anexa metricas RAG ao snapshot da conversa no campo `snapshot_conversa_gabi_log_uso`
- Formato: `[RAG] chunks=N score_medio=X busca_ms=Y tokens_chunks=Z`
- Log estruturado no console: `[GABI/RAG] chunks=N score=X busca=Yms tokens_kb=Z`

Metricas rastreadas (interface `KbSearchMeta`):

| Campo | Tipo | Descricao |
|-------|------|-----------|
| chunks_retornados | number | Quantidade de chunks selecionados |
| score_similaridade_medio | number | Media de similaridade dos chunks |
| tempo_busca_ms | number | Tempo total da busca (embed + query) |
| tokens_total_chunks | number | Soma de tokens dos chunks selecionados |

## Pre-requisitos

1. **Extensao pgvector** instalada no PostgreSQL:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Migration aplicada** com a tabela `gabi_kb_chunk` e coluna `vector(768)`

3. **GEMINI_API_KEY** configurada como variavel de ambiente (usada tanto no ingest quanto na busca)

4. **KB compilada** antes do ingest

## Como Executar

### 1. Compilar a KB

```bash
cd servicos-global/servicos-plataforma/gabi
npx tsx server/knowledge/compile.ts
```

Saida: `server/knowledge/gravity-knowledge-base.txt` + `server/knowledge/segments/*.txt`

### 2. Executar ingest (embeddings + upsert)

```bash
cd servicos-global/servicos-plataforma/gabi
GEMINI_API_KEY=... DATABASE_URL=... npx tsx server/knowledge/ingest.ts
```

O ingest percorre todos os schemas `tenant_*` automaticamente. Se nenhum schema tenant existir, insere no `public`.

Chunks de versoes anteriores sao deletados automaticamente apos o upsert.

## Fallback Automatico

O sistema opera em 3 niveis de fallback:

1. **RAG disponivel + chunks encontrados** — retorna chunks semanticos (melhor cenario)
2. **RAG disponivel mas 0 chunks** — cai para KB estatica segmentada
3. **RAG indisponivel** (pgvector ausente, tabela inexistente, erro) — cai para KB estatica

A verificacao de disponibilidade e feita uma unica vez e cacheada em memoria (`ragDisponivel`). O cache pode ser resetado via `_resetRagCache()` (exposto para testes).

Erros de RAG sao logados mas nunca propagados — a Gabi sempre responde, mesmo sem pgvector.

## Mapa de Segmentos (PAGE_SEGMENT_MAP)

Mapeia rotas do frontend para segmentos da KB, usado tanto no RAG quanto no fallback estatico:

| Rota | Segmento(s) |
|------|-------------|
| `/produto/lpco` | lpco |
| `/pedido` | pedido |
| `/produto/nf-importacao` | nf-importacao |
| `/bid-frete` | bid-frete |
| `/bid-cambio` | bid-cambio |
| `/produto/financeiro-comex` | financeiro-comex |
| `/simula-custo` | simula-custo |
| `/processo` | processo |
| `/configurador/organizacao` | configurador |
| `/configurador/workspaces` | configurador |
| `/configurador/usuarios` | configurador |
| `/configurador/assinaturas` | configurador |
| `/configurador/financeiro` | configurador |
| `/configurador/api-cockpit` | api-cockpit, configurador |
| `/configurador/conector-cargowise` | api-cockpit |
| `/admin` | configurador |
| `/store` | marketplace |
| `/hub` | dashboard, configurador |

Rotas nao mapeadas recebem a KB completa (fallback estatico) ou busca sem filtro de segmento (RAG).

A resolucao e por match exato primeiro, depois por prefixo (ex: `/pedido/123` resolve para `pedido`).
