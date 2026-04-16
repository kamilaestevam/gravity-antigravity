# Padronização de Nomes — Telas Configurador (Workspace)

**Produto:** Configurador (Área do Cliente)
**Data:** 2026-04-16
**Status:** Aplicado

---

## A Regra — Nome Canônico Único

Cada tela do Configurador (workspace) possui um **nome canônico** em kebab-case idêntico em todas as camadas:

```
nome_canonico (kebab-case)
  = subpasta em testes/ (6 tipos)
    = segmento da rota (/workspace/{nome})
      = prefixo de endpoint (/api/v1/{nome})
        = componente front ({PascalCase}.tsx)
          = i18n key (workspace.layout.{nome})
```

---

## Tabela de Nomes Canônicos — 8 Telas Configurador

| # | Nome canônico | Tela (UI) | Componente (front) | Rota | Endpoint (back) | Model (banco) |
|---|---|---|---|---|---|---|
| 1 | `organizacao` | Organização | Organizacao.tsx | `/workspace/organizacao` | `/api/v1/organizacao` | Tenant |
| 2 | `workspaces` | Workspaces | Workspaces.tsx | `/workspace/workspaces` | `/api/v1/organizacao/companies` | Company |
| 3 | `usuarios` | Usuários | Usuarios.tsx | `/workspace/usuarios` | `/api/v1/usuarios` | User, UserMembership |
| 4 | `assinaturas` | Assinaturas | Assinaturas.tsx | `/workspace/assinaturas` | `/api/v1/assinaturas` | ProductConfig, Subscription |
| 5 | `financeiro` | Financeiro | Financeiro.tsx | `/workspace/financeiro` | `/api/v1/financeiro` | StripeEvent |
| 6 | `api-cockpit` | API Cockpit | ApiCockpit.tsx | `/workspace/api-cockpit` | `/api/v1/api-cockpit` | — (externo) |
| 7 | `historico-organizacao` | Histórico | HistoricoOrganizacao.tsx | `/workspace/historico-organizacao` | `/api/v1/historico-organizacao` | AuditLog |
| 8 | `taxa-cambio` | Taxa de Câmbio | TaxaCambio.tsx | `/workspace/taxa-cambio` | `/api/v1/taxa-cambio` | TaxaCambio |

---

## Mapa de Renames Aplicados

### Endpoints Backend

| Antes | Depois |
|---|---|
| `/api/v1/tenants` | `/api/v1/organizacao` |
| `/api/v1/tenants/companies` | `/api/v1/organizacao/companies` |
| `/api/v1/tenants/products` | `/api/v1/assinaturas` |
| `/api/v1/users` | `/api/v1/usuarios` |
| `/api/v1/billing` | `/api/v1/financeiro` |
| `/api/cockpit` | `/api/v1/api-cockpit` |
| — | `/api/v1/historico-organizacao` (novo) |
| `/api/v1/taxa-cambio` | mantido |

### i18n Keys (workspace.layout)

| Antes | Depois |
|---|---|
| `api_cockpit` | `api-cockpit` |
| hardcoded 'Taxa de Câmbio' | `taxa-cambio` |
| — | `historico-organizacao` (novo) |

---

## Subpastas de Teste

Idênticas ao nome canônico em cada um dos 6 tipos:
```
testes-unitarios/configurador/{nome-canonico}/
testes-funcionais/configurador/{nome-canonico}/
testes-contract/configurador/{nome-canonico}/
testes-cross-tenant/configurador/{nome-canonico}/
testes-e2e/configurador/{nome-canonico}/
testes-pentest/configurador/{nome-canonico}/
```

---

## Regra para Novas Telas

Ao criar uma nova tela do Configurador (workspace):

1. Definir o **nome canônico** em kebab-case
2. Usar esse nome em TODAS as camadas: rota, endpoint, componente (PascalCase), i18n, subpasta de teste
3. Adicionar a este documento
4. Criar subpasta em todos os 6 tipos de teste
