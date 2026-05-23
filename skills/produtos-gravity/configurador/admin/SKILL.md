---
name: antigravity-admin
description: "Use esta skill sempre que uma tarefa envolver o painel administrativo interno do Gravity — exclusivo para a equipe Gravity, não para clientes. Cobre: gestão de todos os tenants (empresas mãe e filhas), produtos contratados, usuários e permissões globais, financeiro consolidado, histórico de alterações global, painel de deploy Railway, configurações da Gabi por organização, consumo de recursos, e monitoramento de APIs em tempo real (clientes e dependências externas) com alertas de queda."
---

# Gravity — Painel Admin (Interno)

## O Que é Este Painel

Interface exclusiva da equipe Gravity para gerenciar a plataforma como um todo. **Não é o Configurador** (que é para o cliente).

- **Quem acessa:** apenas usuários com `tipo_usuario = 'ADMIN'` (ou `is_gravity_admin = true`) — membros internos da equipe Gravity com acesso privilegiado.

> ⚠️ **REGRA ABSOLUTA:** Ver [9 Mandamentos](../../../governanca/lei/9-mandamentos/SKILL.md) — Regra 01: verificação SEMPRE via `/api/v1/me` (Prisma), nunca via `publicMetadata` do Clerk.
- **Princípio:** visibilidade total de todas as organizações, produtos, usuários, consumo, deploys e saúde da plataforma em um único lugar

---

## Posição na Arquitetura

O painel Admin vive **dentro do Configurador** como mais uma page, protegida por middleware:

```text
servicos-global/configurador/
└── src/pages/
    ├── workspace/          ← área do cliente
    ├── usuarios/
    ├── permissoes/
    ├── assinaturas/
    └── admin/              ← área exclusiva ADMIN (equipe Gravity)
        ├── AdminLayout.tsx
        ├── organizacoes/
        ├── financeiro/
        ├── deploy/
        ├── gabi/
        ├── consumo/
        └── apis/           ← monitor de APIs em tempo real
```

```typescript
// Middleware que protege todas as rotas /admin/*
function requireGravityAdmin(req, res, next) {
  if (req.auth.tipoUsuario !== 'ADMIN' && !req.auth.gravityAdmin) {
    return res.status(403).json({ error: 'Acesso restrito à equipe Gravity' })
  }
  next()
}
```

---

## Tela 1 — Organizações

**Stat cards:** Total de Organizações | Organizações Ativas | Organizações em Trial | Organizações Churn (últimos 30 dias)

| Coluna | Descrição |
|:---|:---|
| ORGANIZAÇÃO | Nome da organização |
| CNPJ | CNPJ da organização |
| STATUS | Ativo / Trial / Suspenso / Churned |
| PRODUTOS | Badges dos produtos contratados |
| workspaces | quantidade de workspaces |
| USUÁRIOS | Total de usuários ativos |
| PLANO | Básico / Pro / Enterprise |
| CRIADO EM | Data de cadastro |
| AÇÕES | Ver detalhes / Suspender / Excluir |

---

### Edição de Organização (PATCH /admin/organizacoes/:id)

Endpoint admin pra editar dados cadastrais da organização.

- **Campos suportados:** `nome_organizacao`, `subdominio_organizacao`, `status_organizacao`, `cnpj_organizacao`, `estado_organizacao` (UF maiúscula), `cidade_organizacao`, `segmento_organizacao`, `tipo_organizacao`. Todos opcionais. String vazia `""` significa "limpar campo" (vira `null` no banco — usar helper `vazioParaNull`).
- **Validação:** regex CNPJ `XX.XXX.XXX/XXXX-XX`, estado obrigatório UF (2 chars maiúsculas).
- **Auditoria:** `AuditService.log` captura diff de TODOS os campos alterados em `estado_anterior` e `estado_posterior_historico_log`.
- **Auto-edição** da própria org HQ (status) bloqueada — preserva integridade do tenant da plataforma.
- **Modal frontend:** `ModalEditarOrganizacao.tsx`. Popula state com valores existentes ao abrir (não limpa).
- **Histórico:** bug detectado em 2026-05-06 — 5 campos cadastrais (CNPJ, estado, cidade, segmento, tipo) eram silenciosamente ignorados. Correção alinhou os 5 elos da cadeia (Prisma/Zod req/rota/tipo TS/Zod resp) — ver REGRA "Paridade de Cadeia" em `database-governance`.

---

### Desativação de Usuário (PATCH /api/v1/usuarios/:id/status)

Endpoint admin pra desativar/reativar usuário com campo **persistido** `status_usuario` (enum `StatusUsuario { ATIVO, INATIVO }`).

- **Quem pode:** SUPER_ADMIN/ADMIN (cross-org), MASTER (intra-org). Whitelist via `requireUserManagementRole`.
- **Body:** `{ status_usuario: 'ATIVO' | 'INATIVO' }` (Zod `.strict()`).
- **5 validações:**
  1. Auto-proteção — ator não pode inativar a si mesmo (`403 AUTO_ALTERACAO_BLOQUEADA`).
  2. CONVIDADO não é inativável (`409 USUARIO_CONVIDADO_NAO_PODE_INATIVAR`) — usar `cancelarConvite`.
  3. Anti-bricking: bloqueia inativação do último MASTER ativo da org (`409 ULTIMO_MASTER_ATIVO_ORGANIZACAO`).
  4. Alvo cross-org só pra SAdmin/Admin; MASTER fica restrito ao próprio `id_organizacao`.
  5. Idempotência (mesmo status atual não regrava) + `404 NOT_FOUND` sem vazar existência.
- **Side-effects:**
  - `AuditService.log` / `securityAudit.roleChanged` com diff completo (Mand. 08 — sem fallback silencioso).
  - `invalidarCacheRequireAuth(idClerkUsuario)` — kick-out efetivo em ms no próximo request.
  - `requireAuth.ts` retorna `401 USUARIO_INATIVO` para sessão inativada. **Mand. 01 — sem chamada a Clerk.**
- **Modal frontend:** `Usuarios.tsx` (workspace) e `UsuariosAdmin.tsx` (admin). Toggle dispara HTTP real.
- **Bug histórico:** até 2026-05-12 o toggle era UI-only — Configurador mostrava INATIVO temporário e Admin sempre mostrava ATIVO (Mand. 08 — fallback silencioso). Corrigido com migration `20260512_status_usuario` (enum + coluna + índice) e 10 testes funcionais em `testes/testes-funcionais/configurador/usuarios/atualizar-status.test.ts`.

---

## Tela 2 — Produtos Contratados

Visão de quais produtos cada organização tem ativo.

| Organização | Produto | Plano | Contratado em | Vencimento | Status |
|:---|:---|:---|:---|:---|:---|
| AgroMax | Simulador Comex | Pro | 01/01/2026 | 01/01/2027 | Ativo |

---

## Tela 3 — Usuários e Permissões (Global)

Todos os usuários de todas as organizações em uma única visão.

**Ações por usuário:**
- Ver permissões detalhadas
- Suspender acesso
- Resetar senha (força reset no próximo login)
- **Impersonar usuário** (para suporte)

> ⚠️ **REGRA ABSOLUTA:** Ver [Observabilidade Mínima](../../../governanca/convencao-tecnica/observabilidade-minima/SKILL.md) — impersonação gera log obrigatório com `actor_type`, `triggered_by` e `impersonating`.

### Editor inline de vínculos workspace (linha expandida)

Decisão dono **2026-05-05**: a linha expandida da tabela usa o **padrão Assinaturas** (cânone em [criacao-telas](../../../ux/criacao-telas/SKILL.md)). Detalhes da implementação:

- **Master/SAdmin/Admin** — panel "Acesso implícito" read-only (Mand. 04). Para revogar, alterar `tipo_usuario`.
- **Standard/Fornecedor** — editor com checkboxes, multi-select, toggle Play/Pause individual, toolbar Habilitar/Bloquear em massa, Salvar/Descartar com badge de pendentes.
- **Lazy-load:** `GET /api/v1/admin/organizacoes/:id_organizacao/workspaces` (auth: `requireGravityAdmin` — SAdmin + ADMIN podem ler) — invocado quando a linha é expandida; cache em `workspacesPorOrg[id]` evita refetch.
- **Mutação:** `PUT /api/v1/usuarios/:id_usuario/workspaces` (replace-all atômico). Backend já suporta SUPER_ADMIN cross-org via desvio do filtro `id_organizacao` no findFirst do alvo.
- **Gating UI — opção α (decisão dono):** **apenas SUPER_ADMIN** edita vínculos via Admin Panel. ADMIN logado vê o editor em modo read-only (sem checkboxes, sem botões de ação). Para abrir esse poder ao ADMIN no futuro, mudar `podeEditar` em [UsuariosAdmin.tsx](../../../../servicos-global/configurador/src/pages/admin/UsuariosAdmin.tsx) e revisar [seguranca/permissoes](../../../seguranca/permissoes/SKILL.md).
- **Componente compartilhado:** [src/components/expandido-editor-vinculos](../../../../servicos-global/configurador/src/components/expandido-editor-vinculos/index.tsx) — mesmo componente usado em `/configurador/usuarios` (Configurador).
- **Audit:** `securityAudit.permissionChanged` continua sendo emitido na org do **alvo** (não do ator), com `acao_permissao: 'GRANTED' | 'REVOKED'`.

### Convite Cross-Org (Admin) — 2026-05-12

`POST /api/v1/admin/usuarios/convidar` (SUPER_ADMIN apenas) permite criar usuário **em qualquer organização** da plataforma. Diferente do convite regular `/v1/usuarios/convidar` (Master da própria org).

**Body obrigatório:**
```ts
{
  id_organizacao_alvo: string  // CUID — org onde será criado
  email_usuario: string
  nome_usuario: string
  tipo_usuario: 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR'
  workspaces_alvo?: 'all' | string[]  // obrigatório para PADRAO/FORNECEDOR
}
```

**Fluxo UI (`UsuariosAdmin.tsx`):**
1. `adminOrganizacoesApi.list({ limit: 200 })` carrega lista de orgs (CUID + nome)
2. Select de organização — `SelectGlobal` com `buscavel` habilitado
3. Ao escolher org, lazy-load workspaces via `adminOrganizacoesApi.listarWorkspaces(id)` (cache compartilhado com editor de vínculos)
4. Multiselect de workspaces (só aparece para PADRAO/FORNECEDOR): checkbox "Todos os workspaces ATIVOs" OU lista individual
5. Submit: `aoConvidarUsuario()` chama `adminUsuariosApi.convidar({...})`

**Regras de segurança** (validadas no service):
- ADMIN é read-only — 403 `ADMIN_SOMENTE_LEITURA`
- Org alvo existe e ATIVA — 404 `ORG_NOT_FOUND`
- SUPER_ADMIN/ADMIN exige `hospeda_colaboradores_gravity=true` na **org ALVO** — 403 `TIPO_GRAVITY_EXIGE_ORG_GRAVITY`
- Workspaces devem pertencer à org alvo — 403 `WORKSPACE_FORA_DA_ORG_ALVO`
- Email duplicado na org alvo — 409 `CONFLICT`
- Clerk recusa email duplicado — 409 `INVITATION_OR_USER_ALREADY_EXISTS`

**Service compartilhado:** `convidar-usuario-service.ts` (consumido por ambas as rotas).

**Audit:** `id_organizacao = id_organizacao_alvo` + `metadata_ator_historico_log.id_organizacao_ator` + `metadata.cross_org: boolean`.

**Documentação completa:** `documentos-tecnicos/arquitetura/convite-admin-cross-org.md`.

---

## Tela 4 — Financeiro

**Stat cards:** MRR | ARR | Churn do mês | Novos contratos do mês

---

## Tela 5 — Histórico de Alterações Global

Igual ao histórico de alterações da organização, mas com visão de todas as organizações.

**Filtros adicionais:** Por organização | Por tipo de ator: usuário, Gabi AI, sistema, Gravity Admin

> ⚠️ **REGRA ABSOLUTA:** Ver [Observabilidade Mínima](../../../governanca/convencao-tecnica/observabilidade-minima/SKILL.md) — acesso de Gravity Admin a histórico de outra organização gera log próprio com `action: 'ACESSO_ADMIN'`.

---

## Tela 6 — Deploy

Painel de controle de deploys de todos os serviços no Railway.

| Serviço | Ambiente | Versão | Status | Último deploy | Uptime | Ações |
|:---|:---|:---|:---|:---|:---|:---|
| configurador | production | v2.1.4 | 🟢 Online | há 2h | 99.9% | Deploy / Rollback |
| organizacao-services | production | v1.8.2 | 🟢 Online | há 5h | 100% | Deploy / Rollback |
| simulador-comex | production | v3.0.1 | 🟡 Alerta | há 1h | 98.2% | Deploy / Rollback |

---

## Tela 7 — Gabi AI (Global)

| Organização | Chamadas | Custo (USD) | % do limite | Status |
|:---|:---|:---|:---|:---|
| AgroMax | 1.243 | $8.40 | 42% | 🟢 Normal |
| ConstrutArt | 891 | $15.80 | 79% | 🟡 Alerta |

---

## Tela 9 — Monitor de APIs (Tempo Real)

Monitora dois tipos:
1. **APIs de clientes** — clientes consumindo os serviços do Gravity via API sem frontend (integração com ERP, WMS, etc.)
2. **APIs externas** — dependências da plataforma (Resend, Meta, Gemini, Clerk, Receita Federal, Railway)

**APIs externas:**

| API | Status | Latência | Uptime 30d |
|:---|:---|:---|:---|
| Resend | 🟢 Online | 120ms | 99.9% |
| Meta Cloud API | 🟢 Online | 89ms | 99.8% |
| Google Gemini | 🟡 Degradada | 2.400ms | 99.1% |
| Clerk | 🟢 Online | 45ms | 100% |
| Receita Federal | 🟢 Online | 890ms | 97.2% |

**Alertas automáticos:**
- API externa offline → email + WhatsApp para equipe Gravity
- Latência > 3x a média → status "Degradada" + alerta

> ⚠️ **REGRA ABSOLUTA:** Ver [Observabilidade Mínima](../../../governanca/convencao-tecnica/observabilidade-minima/SKILL.md) para health check obrigatório a cada 30s e métricas mínimas por API monitorada.

---

## Middleware de Observabilidade

```typescript
export function apiObservabilityMiddleware(req, res, next) {
  const start = Date.now()

  res.on('finish', () => {
    const latency = Date.now() - start
    setImmediate(() => {
      prisma.apiRequestLog.create({
        data: {
          id_organizacao: req.auth.idOrganizacao,
          endpoint:       req.path,
          method:         req.method,
          status_code:    res.statusCode,
          latency_ms:     latency,
          api_key_id:     req.auth?.apiKeyId,
          created_at:     new Date()
        }
      }).catch(console.error)

      checkApiAlerts(req.auth.idOrganizacao, req.path, res.statusCode, latency)
    })
  })
  next()
}
```

---

## Schema Prisma

> ⚠️ **REGRA ABSOLUTA:** Ver [9 Mandamentos](../../../governanca/lei/9-mandamentos/SKILL.md) — Regra 02: `schema.prisma` é INTOCÁVEL. Exemplos abaixo refletem o schema atual (campos em DDD: `id_organizacao`, `tipo_usuario`, `gravity_admin`).

```prisma
model ApiKey {
  id              String    @id @default(cuid())
  id_organizacao  String
  name            String
  key_hash        String    @unique  // hash SHA-256 — nunca plain text
  key_preview     String             // últimos 4 chars para exibição
  scopes          Json               // endpoints permitidos
  rate_limit      Int       @default(60)  // req/min
  expires_at      DateTime?
  active          Boolean   @default(true)
  last_used_at    DateTime?
  created_at      DateTime  @default(now())

  @@index([id_organizacao])
  @@index([key_hash])
}

model ApiRequestLog {
  id              String   @id @default(cuid())
  id_organizacao  String
  api_key_id      String?
  endpoint        String
  method          String
  status_code     Int
  latency_ms      Int
  created_at      DateTime @default(now())

  @@index([id_organizacao])
  @@index([id_organizacao, created_at])
  @@index([id_organizacao, status_code])
  @@index([api_key_id])
}

model ApiMonitor {
  id               String    @id @default(cuid())
  name             String
  service          String
  health_check_url String
  timeout_ms       Int       @default(5000)
  check_interval_s Int       @default(30)
  current_status   String    @default("unknown")
  current_latency  Int?
  last_checked_at  DateTime?
  created_at       DateTime  @default(now())
}

model ApiIncident {
  id          String    @id @default(cuid())
  api_id      String
  status      String
  started_at  DateTime  @default(now())
  resolved_at DateTime?
  duration_s  Int?
  error_msg   String?
}

model GravityAdmin {
  id                String   @id @default(cuid())
  clerk_id          String   @unique
  name              String
  email             String   @unique
  tipo_usuario      String   @default("ADMIN")  // ADMIN | VIEWER (subtipos internos)
  gravity_admin     Boolean  @default(true)
  active            Boolean  @default(true)
  created_at        DateTime @default(now())
}
```

---

## Checklist

- [ ] Painel Admin restrito a `tipo_usuario = 'ADMIN'` conforme [9 Mandamentos](../../../governanca/lei/9-mandamentos/SKILL.md)?
- [ ] Impersonação e acessos sensíveis com log conforme [Observabilidade Mínima](../../../governanca/convencao-tecnica/observabilidade-minima/SKILL.md)?
- [ ] Painel de Deploy Railway com logs e métricas em tempo real?
- [ ] Gestão de API Keys com escopo, rate limit e expiração?
- [ ] APIs externas com health check a cada 30s e histórico de incidentes?
- [ ] Alertas de queda via email e WhatsApp para equipe Gravity?
- [ ] Schema com ApiKey, ApiRequestLog, ApiMonitor, ApiIncident?


---

## Empresas e Parceiros (Cross-Org)

Tela admin **read-only** que lista empresas/parceiros de TODAS as organizações da plataforma.
Path: `/admin/empresas-e-parceiros`. Página: `EmpresasEParceirosAdmin.tsx`.

### Audiência
SUPER_ADMIN e ADMIN Gravity. Bloqueada para qualquer outro `tipo_usuario` por `requireGravityAdmin`.

### Pipeline backend
Frontend → `/api/v1/admin/empresas` (Configurador, porta 8005) → `requireAuth` → `requireGravityAdmin` → fetch S2S `/api/v1/admin/empresas` (Cadastros, porta 8031) → enrichment **batch** `IN(...)` em `Configurador.Organizacao` → audit log fire-and-forget em `AuditLogAdmin` → resposta.

### Garantias
- **Read-only por design** — admin investiga, não modifica. Edição/criação/inativação cross-org está desabilitada na UI; mudanças continuam exclusivas da tela do workspace.
- **Banner permanente** topo da tela: `CardBasicoGlobal variante="aviso"` explicando modo cross-org + audit log + read-only. Não dispensável.
- **Modal volume > 500** sempre aparece (sem checkbox "não perguntar mais"), sugerindo filtrar por organização ou tipo de parceiro antes de continuar.
- **Teto duro 200 por página** no Cadastros (clamp em servidor).
- **Audit log persistente** em `audit_log_admin` — toda chamada grava `id_usuario`, `tipo_usuario`, `acao=admin.empresas.list`, `recurso=empresa`, `filtros_json`, `qtd_resultados`, `ip_origem`, `correlation_id`.
- **Filtro por organização** via `SelectOrganizacaoAdminGlobal` (autocomplete com debounce 300ms) — input livre de UUID proibido.
- **Coluna `nome_organizacao`** sticky-left, clique navega para `/admin/organizacoes/:id`.
- **Falha alta (Mand. 08)** — se a Organizacao foi deletada do Configurador mas a empresa ainda existe no Cadastros, a coluna mostra `⟨organização removida⟩` (visível, nunca silencioso).

### Roadmap Fase 2
A Opção A (tab "Empresas e Parceiros" dentro de `OrganizacaoDetalheAdmin`, vista única-org) está documentada em `documentos-tecnicos/admin-cross-org-pattern.md` como follow-up. A Opção B (esta) entrega valor primeiro.

### Skill relacionada
- `skills/governanca/convencao-tecnica/lint-tenant-safety/SKILL.md` (seção "Exceções permitidas") — autorização da rota Cadastros sem `extrairIdOrganizacao`.

---

## Override de Organização Ativa (Admin Gravity)

Feature exclusiva de SUPER_ADMIN e ADMIN: ativar 🔑 "Trocar Organização" no menu do avatar permite visualizar **qualquer organização ativa** da plataforma como se fosse Master dela, dentro da mesma sessão. Documentação técnica completa: [documentos-tecnicos/arquitetura/organizacao-override-admin.md](../../../../documentos-tecnicos/arquitetura/organizacao-override-admin.md).

### Como funciona resumidamente
1. Admin clica 🔑 no menu do avatar (item disponível só quando `tipo_usuario ∈ {SUPER_ADMIN, ADMIN}`).
2. Modal lista orgs ATIVAS via `GET /api/v1/admin/organizacoes`. Admin escolhe.
3. `useOrganizacaoOverride().definirOverride({ id, nome })` grava em `ShellStore` + `localStorage` e navega para `/hub`.
4. Todo `fetch` subsequente injeta `x-organizacao-override: <id>` via `injetarHeaderOverride()`.
5. Middleware do SDK valida ator (JWT do Clerk), valida org alvo (Configurador), troca `idOrganizacao` + `nomeSchema`. Admin opera como Master daquela org até "Voltar para Gravity".

### Marca visual obrigatória durante override
- Banner âmbar fixo no topo (`BannerOrganizacaoOverride`).
- Borda dourada inset ao redor do shell (classe `.layout--override-ativo`).
- Item de menu vira "Voltar para Gravity" (estilo dourado).

### Audit log persistente (obrigatório)
Cada troca aceita pelo middleware dispara `POST /api/v1/internal/admin/audit-organizacao-override` no Configurador. Grava 1 row em `AuditLogAdmin` com:
- `acao = 'admin.organizacao_override.trocar'`
- `recurso = 'organizacao'`
- `filtros = { id_organizacao_origem, id_organizacao_destino, cross_org: true }`
- `id_usuario`, `tipo_usuario`, `ip_origem`, `correlation_id`

Fire-and-forget no SDK: falha do pipeline NÃO bloqueia a troca, mas é logada via `getLogger().warn()` (Mand. 08 — log alto sem derrubar a feature).

### Limitações conhecidas
- **Produtos legados sem SDK** (bid-frete, bid-cambio, bid-frete-internacional, simula-custo) usam `x-internal-key` + `x-id-organizacao` direto fora do middleware. Override é no-op neles até migrarem para `withOrganizacao`.
- **Workers / CRON** não recebem override (não há header HTTP). Background jobs continuam usando `withOrganizacaoContext(idOrganizacao, ...)` com a org concreta passada na tarefa.

### Anti-padrões proibidos
- ❌ Confiar no header sem validar JWT do Clerk.
- ❌ Persistir override fora do `localStorage` (cookies vazariam para subdomain).
- ❌ Audit log síncrono (bloqueia request crítica).
- ❌ Cache cruzado entre `id_organizacao` original e alvo.

### Skills relacionadas
- `skills/governanca/lei/sdk-resolvedor-organizacao/SKILL.md` — contrato do middleware.
- `skills/governanca/convencao-tecnica/observabilidade-minima/SKILL.md` — `AuditLogAdmin` é uma das fontes obrigatórias de log estruturado.
