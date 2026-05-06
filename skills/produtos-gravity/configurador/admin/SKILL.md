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
- **Componente compartilhado:** [src/components/expandido-editor-vinculos](../../../../servicos-global/configurador/src/components/expandido-editor-vinculos/index.tsx) — mesmo componente usado em `/workspace/usuarios` (Configurador).
- **Audit:** `securityAudit.permissionChanged` continua sendo emitido na org do **alvo** (não do ator), com `acao_permissao: 'GRANTED' | 'REVOKED'`.

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
