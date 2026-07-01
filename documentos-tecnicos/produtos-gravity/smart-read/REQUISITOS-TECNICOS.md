# Smart Docs — Requisitos Técnicos (SSOT)

> **Produto:** `smart-read` (exibição: **Smart Docs**)  
> **BFF:** `servicos-global/produto/smart-read/server/` — porta **8033**  
> **Código do limiter:** `server/src/index.ts` (`apiLimiter`)

Documento de referência para **limites de API**, **upload**, **paginação** e **comportamento em produção**. O manual da Gravity University espelha a versão resumida para o usuário final.

---

## 1. Rate limiting (produção)

| Atributo | Valor |
|----------|-------|
| Biblioteca | `express-rate-limit` |
| Escopo | Todas as rotas `/api/*` do BFF Smart Docs |
| Janela | **60 segundos** (`windowMs: 60_000`) |
| Teto | **100 requisições HTTP** por janela |
| Chave | `x-id-organizacao` (header); se ausente, fallback para **IP** (`ipKeyGenerator`) |
| Ambientes | **Ativo** quando `NODE_ENV=production` (Railway/staging/prod). **Desligado** em local (`skip`) |
| Resposta 429 | `{ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Muitas requisicoes' } }` |

### Finalidade

Proteger o BFF contra **abuso e burst** (loops no front, scraping, tenant monopolizando o serviço). **Não** substitui anti-DDoS de borda (proxy/CDN).

### O que **não** entra no limite

- **Documentos por requisição:** o limitador conta **chamadas HTTP**, não PDFs/XMLs dentro do payload.
- **`GET /health`:** fora do prefixo `/api/`.

---

## 2. Requisição vs. documento

| Conceito | Comportamento |
|----------|---------------|
| **1 requisição HTTP** | Uma ida ao BFF (ex.: `GET /api/v1/smart-read/leituras?pagina=1&limite=50`) |
| **Várias leituras por resposta** | Cada página traz até **50** (lista) ou **100** (hook de saving) **linhas de leitura** |
| **Vários documentos por leitura** | Cada linha pode incluir **N arquivos** extraídos (Invoice, BL, Packing, etc.) no JSON — sem multiplicar o contador de rate limit |
| **Upload Nova Leitura** | **1 requisição POST** por arquivo enviado (`enviarLeitura`) |

---

## 3. Chamadas HTTP — aba Lista (mount)

Quando a aba **Lista** está ativa (`painelAtivo('lista')`), o front dispara **4 requisições** em paralelo ou sequência imediata:

| # | Hook / componente | Endpoint |
|---|-------------------|----------|
| 1 | `useTransacoesLeituraSmartRead` | `GET /api/v1/smart-read/leituras?pagina=1&limite=50` |
| 2 | `useTransacoesLeituraSmartRead` (paralelo) | `GET /api/v1/smart-read/leituras/metricas/readings` |
| 3 | `useSavingAcumuladoWorkspaceSmartRead` | `GET /api/v1/smart-read/leituras?pagina=1&limite=100` (+ páginas extras se `total > 100`) |
| 4 | `useListaPainelSmartRead` | `GET /api/v1/smart-read/lista/paineis` |

**Observação:** os itens 1 e 3 buscam a **mesma rota de listagem** com limites diferentes — candidato a consolidação futura.

### Enquanto a aba permanece aberta

- `useSavingAcumuladoWorkspaceSmartRead` **recarrega a cada 30 s** (`INTERVALO_RECARGA_PADRAO_MS`), paginando de 100 em 100 — soma ao consumo do rate limit.

### Abas keep-alive

- `SmartReadMultiView` monta abas já visitadas, mas fetch de lista/métricas só roda na aba **ativa** (`habilitado = painelAtivo(...)`). Ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) §9.

---

## 4. Upload — Nova Leitura (passo 1)

SSOT de código: `client/src/shared/entrada-arquivo-leitura-smart-read.ts`

| Regra | Valor |
|-------|-------|
| Tamanho máximo | **50 MB** por arquivo (`LIMITE_TAMANHO_ARQUIVO_LEITURA_SMART_READ_MB`) |
| Extensões | `pdf`, `jpg`, `jpeg`, `png`, `xml`, `csv`, `xls`, `xlsx` |
| Vários arquivos | Permitido no mesmo envio; **cada arquivo** = 1 POST de upload |
| Body JSON (BFF) | Limite global Express: **1 MB** (`express.json({ limit: '1mb' })`) — aplica-se a PATCH/POST JSON, não ao multipart de upload |

---

## 5. Paginação da lista

| Contexto | `limite` padrão |
|----------|-----------------|
| Tabela Lista (GTV) | **50** (`ITENS_POR_PAGINA` em `tabela-transacoes-leitura-smart-read.tsx`) |
| Hook saving / histórico workspace | **100** por página até esgotar `total` |

---

## 6. UI — erro «Muitas requisicoes»

| Camada | Comportamento |
|--------|---------------|
| BFF | HTTP **429** + JSON acima |
| Front | Mensagem traduzida na faixa vermelha da Lista (`sr-erro`); hook de painéis loga `[useListaPainelSmartRead] falha ao carregar painéis` |
| Causa típica | Bucket da organização (ou IP) esgotado — burst no mount, polling 30 s, várias abas/usuários, ou navegação repetida |

**Mitigação operacional (até ajuste de produto):** aguardar ~1 min, fechar abas duplicadas do Smart Docs, evitar refresh em loop.

---

## 7. Referências cruzadas

| Tema | Documento |
|------|-----------|
| Lista, painéis, progresso | [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) |
| Passo 1 upload | [NOVA-LEITURA-PASSO-UM-TECNICO.md](./NOVA-LEITURA-PASSO-UM-TECNICO.md) |
| Persistência / DATI vs Postgres | [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) |
| Manual University (usuário) | `servicos-global/configurador/src/pages/university/manual-smart-read-conteudo.ts` — fluxo **Requisitos técnicos** |
| Skill operacional | `skills/produtos-gravity/smart-read/SKILL.md` |

---

## 8. Histórico

| Data | Alteração |
|------|-----------|
| 2026-07-01 | Criação — rate limit, 4 req mount Lista, upload 50 MB, distinção req vs documento (incidente prod 429) |
