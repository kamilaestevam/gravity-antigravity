# Sistema de Testes — Arquitetura Técnica

> Documentação completa do **sistema de testes automatizado do Gravity**. Cobre os 6 tipos de teste, os **17 escopos**, os 3 ambientes, o cron diário, a integração Gemini, a UI Admin/Testes, e os endpoints de backend. **Esta é a fonte de verdade técnica.** Para regras e convenções, ver `documentos-tecnicos/testes/regras/`.

---

## Visão Macro

```
┌────────────────────────────────────────────────────────────────────┐
│                      ADMIN / TESTES (UI)                          │
│  LogTestes.tsx  │  ModalExecutarTestes  │  ModalAgendamentoTestes │
│  Abas: Em Execução · Executados · Plano de Teste        │
└─────────────────────────────┬──────────────────────────────────────┘
                              │ HTTP
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│              CONFIGURADOR SERVER (porta 8005)                     │
│  GET  /admin/planos-teste            ← registry + casos           │
│  POST /admin/testes/disparar         ← spawn E2E ou EMT (N runs)  │
│  GET  /admin/testes/status           ← execucoes_teste[] ativas   │
│  GET  /admin/testes                  ← histórico (model Teste)    │
│  POST /admin/testes/:id/reanalisar   ← Gemini analyzer            │
│  GET/POST /admin/agendamentos-teste  ← cron interno               │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
┌─────────────┐      ┌────────────────┐      ┌─────────────┐
│ PLAYWRIGHT  │      │ GEMINI 2.0     │      │ POSTGRES    │
│ (spawn)     │      │ (Flash + Pro)  │      │ TestLog +   │
│             │      │                │      │ TestSchedule│
│ Roda specs  │      │ Analisa falhas │      │             │
│ Tira prints │      │ Sugere diff    │      │ Persistência│
└──────┬──────┘      └────────────────┘      └─────────────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│ data/test-logs/AAAA-MM-DD.json (fallback legado)                 │
│ data/test-logs/runs/run-<id_execucao_teste>.json (markers ativos)│
│ data/test-logs/emt-resultado-teste-<id>.json (saída runner EMT)  │
│ test-results/screenshots, traces                                  │
│ playwright-report/index.html                                      │
└─────────────────────────────────────────────┘

       ▲
       │ (1x/dia, opção C)
       │
┌──────┴───────────────────────────────────┐
│ CRON EXTERNO (Railway scheduled job)     │
│ POST /admin/run-tests com payload do dia │
└──────────────────────────────────────────┘
```

---

## Os 6 Tipos de Teste

| Sigla | Tipo | Ferramenta | Onde mora | Quando roda |
|---|---|---|---|---|
| **UNI** | Unitário | Vitest | `testes/testes-unitarios/<escopo>/<sublocal>/` | Em todo PR + cron diário |
| **CON** | Contract | Vitest + Zod | `testes/testes-contract/<escopo>/<sublocal>/` | Em todo PR + cron diário |
| **FUN** | Funcional | Vitest + supertest | `testes/testes-funcionais/<escopo>/<sublocal>/` | Em todo PR + cron diário |
| **CRO** | Cross-tenant | Vitest + 2 tenants | `testes/testes-cross-tenant/<escopo>/<sublocal>/` | Cron diário |
| **E2E** | End-to-end | Playwright | `testes/testes-e2e/<escopo>/<sublocal>/` | Cron diário |
| **PEN** | Pentest | OWASP ZAP | `testes/testes-pentest/<escopo>/<sublocal>/` | Cron semanal |

---

## Os 17 Escopos

| Sigla | Escopo | Onde mora no código |
|---|---|---|
| `LOGIN` | Login | `nucleo-global/Login/login-global/` |
| `CONFIG` | Configurador (excluindo Admin) | `servicos-global/configurador/` |
| `ADMIN` | Painel Admin | `servicos-global/configurador/src/pages/admin/` |
| `HUB` | Shell pós-login | `servicos-global/shell/` |
| `CORE` | Núcleo Global (componentes) | `nucleo-global/` |
| `MARKET` | Marketplace público | `servicos-global/marketplace/` |
| `TENANT` | Serviços tenant | `servicos-global/tenant/*` |
| `DBASE` | Banco / Prisma | `servicos-global/configurador/prisma/` |
| `PEDIDO` | Produto Pedido | `produto/pedido/` |
| `NFIMP` | Produto NF Importação | `produto/nf-importacao/` |
| `LPCO` | Produto LPCO | `produto/lpco/` |
| `BIDFRT` | Produto BID Frete Internacional | `produto/bid-frete-internacional/` |
| `BIDCAM` | Produto Bid Câmbio | `produto/bid-cambio/` |
| `SIMCUS` | Produto SimulaCusto | `produto/simula-custo/` |
| `FINCOM` | Produto Financeiro Comex | `produto/financeiro-comex/` |
| `PROCSO` | Produto Processo | `produto/processo/` |
| `MBOTO` | Transversal — seletor universal de visualizações | `testes/*/menu-botoes/seletor-universal-visoes/` (ver [seletor universal](../../arquitetura/seletor-universal-visualizacoes.md)) |

---

## Sublocais — A Camada Intermediária

Cada escopo tem N sublocais (telas ou áreas). A hierarquia completa é:

```
ESCOPO → SUBLOCAL → TELA → PLANO DE TESTE
```

### Exemplos de sublocais por escopo

| Escopo | Sublocais conhecidos |
|---|---|
| LOGIN | Tela de Login, Recuperação de Senha, Cadastro |
| CONFIG | Organização, Workspaces, Usuários, Assinaturas, Financeiro, API Cockpit, Taxa de Câmbio |
| ADMIN | Visão Geral, Produtos Gravity, Organizações, Usuários Globais, Financeiro, Histórico Global, Destiny Railway, Segurança, NCM Siscomex, Testes |
| HUB | Acessar Workspace, Dashboard Hub |
| CORE | Botões, Campos, Modais, Tabelas, Layout, Mensageria, Tooltip |
| PEDIDO | Dashboard, Lista, Configurador, Importação, Edição em Massa |
| MBOTO | `menu-botoes/seletor-universal-visoes` — SLA 1s troca de aba (Pedido, BID, Processo) |
| (cada produto) | Dashboard, Lista, Configurador, ... |

---

## Os 3 Ambientes

| Ambiente | URL base | Quando rodar | Banco |
|---|---|---|---|
| **Local** | `http://localhost:8000` | Sempre (dev) | SQLite com seed |
| **Staging** | `https://staging.gravity.com.br` | Cron noturno | Postgres staging |
| **Produção** | `https://app.gravity.com.br` | Cron noturno (smoke tests apenas) | Postgres prod (read-only) |

**Regra:** o usuário escolhe o ambiente no agendamento. Não rodam os 3 sempre — só o que for selecionado.

---

## Estrutura de Pastas — `testes/`

```
testes/
│
├── README.md
├── playwright.fixtures.ts                ← fixture global (screenshot em todo teste)
├── test-plans-registry.json              ← catálogo central de IDs e paths
│
├── _fixtures/                            ← compartilhado entre tipos
│   ├── tenants.ts                        ← cria 2 tenants pra cross-tenant
│   ├── users.ts                          ← cria usuários por role
│   ├── auth.ts                           ← helpers de login/JWT
│   └── data-seed.ts                      ← seed de dados
│
├── _mapeamentos/                         ← testids extraídos dos componentes
│   └── <escopo>/<sublocal>.testids.json
│
├── _planos/                              ← planos de teste em JSON (gerados pelo agente)
│   └── <escopo>/<sublocal>.json
│
├── testes-unitarios/<escopo>/<sublocal>/TST-UNI-*.test.ts
├── testes-contract/<escopo>/<sublocal>/TST-CON-*.test.ts
├── testes-funcionais/<escopo>/<sublocal>/TST-FUN-*.test.ts
├── testes-cross-tenant/<escopo>/<sublocal>/TST-CRO-*.test.ts
├── testes-e2e/<escopo>/<sublocal>/TST-E2E-*.spec.ts
├── testes-pentest/<escopo>/<sublocal>/TST-PEN-*.yaml
│
├── test-results/                         ← gerado: screenshots, traces, JSON
└── playwright-report/                    ← gerado: HTML reports
```

---

## Convenção de IDs

### Formato
```
TST-{TIPO}-{ESCOPO}-{NNNNNN}
```

### Regras
- TIPO: 3 letras (UNI, CON, FUN, CRO, E2E, PEN)
- ESCOPO: 5-6 letras (LOGIN, CONFIG, ADMIN, ...)
- NNNNNN: 6 dígitos com zero-pad
- Numeração reseta por combinação tipo+escopo
- ID **não muda** após criação — refactors preservam o ID

### Exemplos válidos
- `TST-E2E-CONFIG-000013` — primeiro E2E do Configurador
- `TST-UNI-CORE-000042` — unitário 42 do CORE
- `TST-CRO-PEDIDO-000001` — primeiro cross-tenant do Pedido

---

## Fluxo Completo de uma Execução

### 1. Geração do plano (humano + agente)
```
Humano abre Admin/Testes → "Novo Plano"
  ↓
Seleciona escopo + sublocal
  ↓
Backend chama agente-plano-teste com inputs
  ↓
Agente extrai testids do componente + percorre 20 categorias
  ↓
Devolve JSON em testes/_planos/<escopo>/<sublocal>.json
  ↓
Humano valida no preview → aprova
  ↓
Plano vira entrada em testes/test-plans-registry.json
```

### 2. Execução (manual ou cron)

```
Trigger: humano clica "Rodar" OU cron dispara (gatilho_teste = cron)
  ↓
POST /admin/testes/disparar { planos: [...], ambiente? }
  ↓
validarNovaExecucaoTeste:
  - limite global (LIMITE_EXECUCOES_SIMULTANEAS_TESTE, default 3)
  - mesmo plano não pode rodar 2x (PLANO_EM_EXECUCAO)
  ↓
Grava marker em data/test-logs/runs/run-<id_execucao_teste>.json
  ↓
Runner E2E: spawn playwright → stdout em playwright-run-<id>.json
Runner EMT: spawn detached emt-background-runner.ts
  ↓
Ao concluir: appendTestLogEntries → model Teste (+ fallback JSON diário)
  ↓
Remove marker do run; frontend polling em GET /admin/testes/status
```

**Execuções simultâneas (2026-06):** vários runs podem estar ativos ao mesmo tempo (até o limite). A UI **Admin › Testes** separa **Em Execução** (markers ativos), **Executados** (histórico) e **Plano de Teste** (catálogo de planos do registry). Cada run tem `id_execucao_teste` único e `gatilho_teste` (`manual` | `cron` | `ci`).

### 2b. Execução EMT (teste em tela)

```
POST /admin/testes/disparar { planos: [TST-EMT-...], ambiente }
  ↓
Marker + emt-manifest-<id_execucao_teste>.json (planos + env)
  ↓
Runner filho detached (EMT_RUN_ID = id_execucao_teste)
  ↓
npx tsx run-*.ts → grava em resultado-teste/<runId>/*.png + RESULTADO.txt
  ↓
Ao terminar: emt-resultado-teste-<id_execucao_teste>.json
  ↓
coletarArtefatosEmt(script, runId) → emt_pasta + emt_prints só dessa subpasta
  ↓
Persiste em model Teste / data/test-logs (campo emt_pasta obrigatório)
```

**Organização:** `documentos-tecnicos/testes/regras/07-organizacao-plano-resultado-por-escopo.md`  
**Anti-padrão:** pasta `YYYY-MM-DD-*` compartilhada na raiz do escopo — mistura prints entre runs.  
**Legado:** `_current-run.json` e `emt-result-<id>.json` são migrados/lidos automaticamente se existirem.

### 3. Triagem (humano)
```
Humano abre LogTestes → vê 28 aprovados, 306 reprovados
  ↓
Filtra por escopo/tipo/data
  ↓
Expande linha reprovada → vê:
  - Resumo do erro
  - Motivo
  - Categoria (BUG_REAL / TESTE_DESATUALIZADO / ...)
  - Confiança (alta/media/baixa)
  - Diff sugerido (se confianca = alta)
  - Commit suspeito (se REGRESSAO_RECENTE)
  ↓
Humano decide:
  - "Aplicar correção" → backend faz Edit no arquivo + roda só esse teste
  - "Rejeitar análise" → marca como ruim (alimenta exemplos-ruins.md)
  - "Reanalizar" → força re-call do Gemini
```

---

## Backend — Endpoints

### Admin › Testes (implementados — prefixo `/api/v1/admin`)

| Rota | Função |
|---|---|
| `GET /admin/testes` | Lista histórico (model `Teste` + fallback JSON 7 dias) |
| `POST /admin/testes/disparar` | Dispara E2E ou EMT em background; retorna `{ started, id_execucao_teste }` |
| `GET /admin/testes/status` | `{ execucoes_teste[], limite_execucoes_simultaneas_teste, quantidade_execucoes_ativas_teste }` |
| `POST /admin/testes/:id_teste/reanalisar` | Re-análise Gemini |
| `POST /admin/testes/:id_teste/aplicar-correcao` | Aplica diff sugerido |
| `POST /admin/testes/:id_teste/rejeitar` | Marca análise como ruim |
| `GET /admin/planos-teste` | Lista planos do registry |
| `GET/POST/PATCH/DELETE /admin/agendamentos-teste` | CRUD agendamento cron |
| `GET /admin/testes-favoritos` | Lista favoritos do usuário autenticado (model `TesteFavoritoUsuario`, escopo `id_usuario`) |
| `POST /admin/testes-favoritos` | Salva combinação (produto + ambiente + tipos + planos); 409 `FAVORITO_DUPLICADO` / `FAVORITO_LIMITE` (máx. 20) |
| `DELETE /admin/testes-favoritos/:id_teste_favorito_usuario` | Remove favorito (ownership por `id_usuario` no `where`) |

**Contrato `*/admin/testes-favoritos` (Zod bilateral no front — `testeFavoritoUsuarioSchema`):** paridade nominal com a tabela `teste_favorito_usuario`. Campos: `id_teste_favorito_usuario`, `produto_teste_favorito_usuario`, `ambiente_teste_favorito_usuario`, `tipos_teste_favorito_usuario[]`, `planos_ids_teste_favorito_usuario[]`, `planos_resumo_teste_favorito_usuario` (Json snapshot), `data_criacao_teste_favorito_usuario`.

**Contrato `GET /admin/testes/status` (Zod bilateral no front):** cada item em `execucoes_teste` expõe `id_execucao_teste`, `data_inicio_execucao_teste`, `runner_execucao_teste` (`EMT`|`E2E`), `ambiente_teste`, `gatilho_teste`, `lista_planos_execucao_teste`, `lista_modulos_execucao_teste`.

**Env:** `LIMITE_EXECUCOES_SIMULTANEAS_TESTE` (default `3`, máx. `20`).

### Legado / referência histórica (não usar em código novo)

| Rota antiga | Substituída por |
|---|---|
| `POST /admin/run-tests` | `POST /admin/testes/disparar` |
| `GET /admin/run-tests/status` `{ running: bool }` | `GET /admin/testes/status` (array) |
| `GET /admin/test-logs` | `GET /admin/testes` |

### A criar ou expandir (ondas do Dream Team)
| Rota | Função | Onda |
|---|---|---|
| `POST /admin/test-plans/generate` | Chama agente-plano-teste | 2 |
| `POST /admin/test-plans/:id/expand` | Expande plano existente | 2 |
| `POST /admin/test-logs/:id/reanalyze` | Force re-análise via Gemini | 3 |
| `POST /admin/test-logs/:id/apply-fix` | Aplica diff sugerido | 3 |
| `POST /admin/test-logs/:id/reject-analysis` | Marca análise como ruim | 3 |
| `GET /admin/test-schedule` | Carrega config de agendamento | 2 |
| `POST /admin/test-schedule` | Persiste config de agendamento | 2 |
| `GET /admin/gemini-metrics` | Dashboard de custo/cache do Gemini | 4 |
| `POST /admin/run-pentest` | Dispara ZAP scan separado | 4 |

---

## Banco — Tabelas Novas

### `TestLog`
```prisma
model TestLog {
  id          String   @id @default(cuid())
  tenant_id   String   // sempre "platform" pra logs globais
  type        String   // UNI|CON|FUN|CRO|E2E|PEN
  escopo      String   // LOGIN|CONFIG|...
  sublocal    String?
  module      String
  test_name   String
  result      String   // APROVADO|REPROVADO|ERRO
  duration    String
  error_log   String?  @db.Text
  ai_analysis Json?
  screenshot  String?
  ambiente    String   // Local|Staging|Producao
  run_id      String   // agrupa logs do mesmo run
  created_at  DateTime @default(now())

  @@index([tenant_id])
  @@index([created_at])
  @@index([type, escopo])
  @@index([result])
  @@index([run_id])
}
```

### `TestSchedule`
```prisma
model TestSchedule {
  id            String   @id @default(cuid())
  tenant_id     String   // sempre "platform"
  ativo         Boolean  @default(false)
  frequencia    String   // Manual|Diario|Semanal
  hora          Int      // 0-23
  minuto        Int      // 0-59
  tipos         Json     // { uni, con, fun, cro, e2e, pen }
  escopos       String[] // ['CONFIG','PEDIDO',...]
  ambiente      String   // Local|Staging|Producao
  alertas       Json     // [{ nome, contato, condicao, canal }]
  ultima_exec   DateTime?
  proxima_exec  DateTime?
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  @@index([tenant_id])
  @@index([ativo])
}
```

### `TestPlan`
```prisma
model TestPlan {
  id                  String   @id            // TST-E2E-CONFIG-000013
  tenant_id           String                   // sempre "platform"
  versao              String
  tipo                String
  escopo              String
  sublocal            String
  tela                String
  rota                String
  criticidade         String
  ambientes           String[]
  componente_path     String
  spec_path           String?
  mapeamento_path     String
  cobertura_pct       Int
  passos_total        Int
  resumo_executivo    String   @db.Text
  plano_completo      Json                     // o JSON inteiro do plano
  ultima_execucao     DateTime?
  ultimo_resultado    String?
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt

  @@index([tenant_id])
  @@index([tipo, escopo])
}
```

---

## Cron Externo (Opção C — 10/10)

### Por que externo
- Não depende de máquina local ligada
- Não depende do server do Configurador estar de pé
- Logs ficam no provedor (Railway/GitHub) com retenção
- Reproduz ambiente limpo a cada run
- Pode rodar em paralelo

### Setup Railway (recomendado)
```yaml
# railway.toml
[[services]]
name = "test-runner-cron"
source = "."
dockerfile = "scripts/test-runner/Dockerfile"

[services.cron]
schedule = "0 3 * * *"   # 03:00 UTC todo dia
```

O container `test-runner-cron`:
1. Lê agendamento ativo via `GET /admin/agendamentos-teste`
2. Se há schedule para o minuto atual, dispara `POST /admin/testes/disparar` com os planos filtrados
3. Espera completar (polling em `GET /admin/testes/status` até `quantidade_execucoes_ativas_teste === 0`)
4. Encerra (Railway cobra só o tempo de execução)

### Setup alternativo: GitHub Actions
```yaml
# .github/workflows/test-runner-cron.yml
name: Test Runner Cron
on:
  schedule:
    - cron: '0 3 * * *'  # 03:00 UTC
jobs:
  run-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install
      - run: |
          curl -X POST $CONFIGURADOR_URL/api/v1/admin/testes/disparar \
            -H "Authorization: Bearer $TOKEN" \
            -d '{"planos":["TST-E2E-CONFIG-000001"],"ambiente":"Staging"}'
```

---

## Integração Gemini — Resumo

> Detalhes em `skills/testes/analista-erros-testes-gemini/integracao.md`

### Fluxo
```
Teste falha → playwright-parser.ts captura entry
  ↓
Backend chama analyzeTestFailure(input)
  ↓
Cache lookup (sha256 do errorLog + testName)
  ├─ HIT → devolve cached
  └─ MISS → continua
  ↓
Gemini 2.0 Flash com response_mime_type: application/json
  ↓
Validação Zod → validação extra (codigoDiff existe nos inputs?)
  ↓
Persiste em data/test-logs/AAAA-MM-DD.json
```

### Custo estimado
- Por análise: ~$0.0005-0.0009
- 100 falhas/dia: ~$1.50-2.70/mês
- 1.000 falhas/dia: ~$15/mês
- Cache hit rate esperado: ≥40% após 30 dias

### Variáveis de ambiente
```bash
GEMINI_API_KEY=AIza...        # https://aistudio.google.com/apikey
GEMINI_MODEL=gemini-2.0-flash # default
GEMINI_PRO_FALLBACK=true      # escala pro Pro se Flash der baixa confiança
```

---

## Camada `testes/infra/admin/` — lógica compartilhada da UI Admin/Testes

O painel **Admin › Testes** vive no Configurador (`servicos-global/configurador/src/pages/admin/`), mas a **lógica pura** que não depende de React ou HTTP fica em `testes/infra/admin/`.

```
┌─────────────────────────────────────────────────────────────┐
│  UI (Configurador)                                          │
│  ModalTestesExecutar.tsx · LogTestes.tsx · modais de plano  │
│  → fetch APIs · estado React · i18n · @nucleo/*             │
└────────────────────────────┬────────────────────────────────┘
                             │ import @testes/infra/admin/*
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  DOMÍNIO (testes/infra/admin/)                              │
│  Contratos Zod · mappers · rótulos · deduplicação           │
└────────────────────────────┬────────────────────────────────┘
                             │ Vitest
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  testes/testes-unitarios/configurador/*.test.ts             │
└─────────────────────────────────────────────────────────────┘
```

| Módulo | Arquivo | Responsabilidade |
|--------|---------|------------------|
| Favoritos de execução manual | `testes/infra/admin/testes-favoritos-admin.ts` | Contratos Zod (espelham a tabela `teste_favorito_usuario`), rótulos, snapshot `planos_resumo` e deduplicação. **Persistência no banco** (model `TesteFavoritoUsuario`, escopo `id_usuario`) via `adminTestesFavoritosApi` — desde 2026-06-11 substituiu o `localStorage`, que não sobrevivia a troca de navegador/máquina/janela anônima |

Detalhes operacionais: [`testes/infra/admin/README.md`](../../../testes/infra/admin/README.md).

**Regra:** novo helper de Admin/Testes sem JSX → `testes/infra/admin/` + teste unitário + doc; não criar `utils/` solto no Configurador.

---

## Frontend — Admin › Testes (`LogTestes.tsx`)

### Implementado (2026-06)
- Cards de passos (7d / 30d) e erros
- Abas **Em Execução**, **Executados** e **Plano de Teste**
  - Em Execução / Executados: colunas DATA/HORA, TIPO, LOCAL, O QUE FOI TESTADO, PASSOS, RESULTADO, DURAÇÃO
  - Plano de Teste: lista todo o registry (`GET /admin/planos-teste`) com colunas ID, ESCOPO, TELA, DATA, PASSOS, COBERTURA, STATUS; clique na linha abre `ModalDetalhePlanoTeste`
- Coluna de data escalável: as **3 datas mais recentes** aparecem por extenso e as demais ficam compactas (só a data) com ícone de visualizar + tooltip com data/hora completa — vale para Executados (`dataHora`) e Plano de Teste (`criadoEm`)
- Botão **Rodar** abre modal mesmo com runs ativos (bloqueia só no limite global)
- Polling `GET /admin/testes/status` enquanto há execuções ativas; toast ao concluir
- Expansão de linha EMT (prints, RESULTADO.txt) + análise IA Gemini
- Modal agendamento + favoritos de planos (`testes/infra/admin/`)

### A adicionar (Ondas 3-4)
- **Badge de tipo** (UNI/CON/FUN/CRO/E2E/PEN) com cor distinta
- **Badge de escopo** (LOGIN/CONFIG/...)
- **Filtros por tipo + escopo + ambiente + data**
- **Bloco "Análise Especialista IA — Gemini"** dentro da expansão:
  - Categoria (BUG_REAL, TESTE_DESATUALIZADO, FLAKY_TIMING, REGRESSAO_RECENTE, INFRA, NAO_CLASSIFICAVEL)
  - Confiança (alta/media/baixa)
  - Bloco de diff (sintaxe colorida)
  - Botão "Aplicar correção" (só se confiança = alta)
  - Botão "Reanalizar"
  - Botão "Rejeitar análise"
  - Commit suspeito (se REGRESSAO_RECENTE)
- **Aba "Plano de Teste"**: filtros e botão "Gerar plano para tela X" (a listagem básica já está na aba)
- **Tela "Métricas Gemini"**: custo do mês, cache hit rate, distribuição de categoria/confiança

---

## Próximas leituras

- [02-fluxo-execucao-detalhado.md](./02-fluxo-execucao-detalhado.md) — passo a passo de uma execução
- [03-integracao-gemini.md](./03-integracao-gemini.md) — código completo da integração
- [04-cron-externo.md](./04-cron-externo.md) — setup do Railway/GitHub Actions
- [../regras/01-convencao-ids.md](../regras/01-convencao-ids.md) — regras de nomenclatura
- [../regras/02-cobertura-obrigatoria.md](../regras/02-cobertura-obrigatoria.md) — regras de cobertura por tela
