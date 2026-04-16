# Padronização de Nomes — Telas Admin

**Produto:** Configurador (Painel Administrativo Gravity)
**Data:** 2026-04-16
**Status:** Em aplicação — nomes canônicos definidos, refactor em andamento

---

## A Regra — Nome Canônico Único

Cada tela do Admin possui um **nome canônico** em kebab-case que é idêntico em todas as camadas:

```
nome_canonico (kebab-case)
  = subpasta em testes/ (6 tipos)
    = segmento da rota (/admin/{nome})
      = prefixo de endpoint (/api/admin/{nome})
        = nome da view no front
          = i18n key (admin.{nome}.titulo)
```

---

## Tabela de Nomes Canônicos — 10 Telas Admin

| # | Nome canônico | Tela (UI) | Componente (front) | Rota | Endpoint (back) | Model (banco) |
|---|---|---|---|---|---|---|
| 1 | `visao-geral` | Visão Geral | VisaoGeralAdmin.tsx | `/admin/visao-geral` | `/api/admin/visao-geral` | Tenant |
| 2 | `usuarios-globais` | Usuários Globais | UsuariosGlobaisAdmin.tsx | `/admin/usuarios-globais` | `/api/admin/usuarios-globais` | User, GravityAdminPermission |
| 3 | `produtos-gravity` | Produtos Gravity | ProdutosGravityAdmin.tsx | `/admin/produtos-gravity` | `/api/admin/produtos-gravity` | Product, PriceTier, SpecialNegotiation |
| 4 | `financeiro-admin` | Financeiro Admin | FinanceiroAdmin.tsx | `/admin/financeiro-admin` | `/api/admin/financeiro-admin` | StripeEvent |
| 5 | `historico-global` | Histórico Global | HistoricoGlobalAdmin.tsx | `/admin/historico-global` | `/api/admin/historico-global` | AuditLog |
| 6 | `deploy` | Deploy | DeployAdmin.tsx | `/admin/deploy` | `/api/admin/deploy` | DeployLog |
| 7 | `api-cockpit` | API Cockpit | ApiCockpitAdmin.tsx | `/admin/api-cockpit` | `/api/admin/api-cockpit` | — (serviço externo) |
| 8 | `seguranca-admin` | Segurança | SegurancaAdmin.tsx | `/admin/seguranca-admin` | `/api/admin/seguranca-admin` | SecurityEvent, RateLimitMetric |
| 9 | `testes-gerais` | Testes Gerais | TestesGeraisAdmin.tsx | `/admin/testes-gerais` | `/api/admin/testes-gerais` | TestLog, TestSchedule, TestPlan |
| 10 | `ncm-integracao` | NCM Integração | NcmIntegracaoAdmin.tsx | `/admin/ncm-integracao` | `/api/admin/ncm-integracao` | — (serviço externo) |

---

## Mapa de Renames (de → para)

### Componentes Front (.tsx)

| Atual | Novo |
|---|---|
| `ProdutosAdmin.tsx` | `ProdutosGravityAdmin.tsx` |
| `AdminFinanceiro.tsx` | `FinanceiroAdmin.tsx` |
| `DeployRailwayAdmin.tsx` | `DeployAdmin.tsx` |
| `MonitorApisAdmin.tsx` | `ApiCockpitAdmin.tsx` |
| `LogTestes.tsx` + `PlanosTesteAdmin.tsx` + `MetricasGeminiAdmin.tsx` | `TestesGeraisAdmin.tsx` (consolida) |
| `NcmSyncAdmin.tsx` | `NcmIntegracaoAdmin.tsx` |

### Rotas (App.tsx)

| Atual | Novo |
|---|---|
| `/admin/usuarios` | `/admin/usuarios-globais` |
| `/admin/produtos` | `/admin/produtos-gravity` |
| `/admin/financeiro` | `/admin/financeiro-admin` |
| `/admin/historico` | `/admin/historico-global` |
| `/admin/deploy` | `/admin/deploy` (mantém) |
| `/admin/apis` | `/admin/api-cockpit` |
| `/admin/seguranca` | `/admin/seguranca-admin` |
| `/admin/testes` | `/admin/testes-gerais` |
| `/admin/ncm-sync` | `/admin/ncm-integracao` |

### Endpoints Backend (admin.ts)

| Atual | Novo |
|---|---|
| `/api/admin/users` | `/api/admin/usuarios-globais` |
| `/api/admin/billing/invoices` | `/api/admin/financeiro-admin/invoices` |
| `/api/admin/deploys` | `/api/admin/deploy` |
| `/api/admin/cockpit` | `/api/admin/api-cockpit` |
| `/api/admin/security` | `/api/admin/seguranca-admin` |
| `/api/admin/test-logs`, `/api/admin/test-plans`, `/api/admin/run-tests` | `/api/admin/testes-gerais/logs`, `/api/admin/testes-gerais/plans`, `/api/admin/testes-gerais/run` |
| `/api/admin/ncm-sync` | `/api/admin/ncm-integracao` |

### Subpastas de Teste (já aplicado)

Idênticas ao nome canônico em cada um dos 6 tipos:
```
testes-unitarios/admin/{nome-canonico}/
testes-funcionais/admin/{nome-canonico}/
testes-contract/admin/{nome-canonico}/
testes-cross-tenant/admin/{nome-canonico}/
testes-e2e/admin/{nome-canonico}/
testes-pentest/admin/{nome-canonico}/
```

### i18n Keys (pt.json)

| Atual | Novo |
|---|---|
| `admin.overview.titulo` | `admin.visao-geral.titulo` |
| `admin.users.titulo` | `admin.usuarios-globais.titulo` |
| `admin.products.titulo` | `admin.produtos-gravity.titulo` |
| `admin.financial.titulo` | `admin.financeiro-admin.titulo` |
| `admin.history.titulo` | `admin.historico-global.titulo` |
| `admin.deploy.titulo` | `admin.deploy.titulo` (mantém) |
| `admin.monitor.titulo` | `admin.api-cockpit.titulo` |
| `admin.security.titulo` | `admin.seguranca-admin.titulo` |
| `admin.tests.titulo` | `admin.testes-gerais.titulo` |
| — | `admin.ncm-integracao.titulo` |

---

## Ordem de Aplicação (segura)

1. Subpastas de teste (sem dependências de código) — **FEITO**
2. Documentação (este arquivo) — **FEITO**
3. i18n keys (pt.json e en.json) — texto, sem quebrar lógica
4. Rotas (App.tsx) — muda URLs, frontend precisa acompanhar
5. Componentes front (rename .tsx + imports) — breaking, muitos arquivos
6. Endpoints back (admin.ts + apiClient.ts) — breaking, muda contratos API
7. Sidebar labels (AdminLayout.tsx) — texto
8. Testes unitários/funcionais — ajustar mocks e assertions

---

## Regra para Novos Componentes Admin

Ao criar uma nova tela Admin:

1. Definir o **nome canônico** em kebab-case
2. Usar esse nome em TODAS as camadas: rota, endpoint, componente (PascalCase + Admin), i18n, subpasta de teste
3. Adicionar a este documento
4. Criar subpasta em todos os 6 tipos de teste
