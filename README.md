# Gravity

Plataforma multi-tenant SaaS B2B modular. Uma empresa assina a plataforma e passa a ter acesso a serviços compartilhados e a produtos verticais especializados.

---

## Estrutura do Monorepo

```
gravity/
├── nucleo-global/              ← Componentes React puro, sem estado de servidor
│   ├── tabela-global/          ← TabelaGlobal — tabela reutilizável
│   ├── modal-global/           ← ModalGlobal — modal com abas
│   ├── select/                 ← SelectGlobal
│   └── utils/                  ← Helpers compartilhados
│
├── servicos-global/
│   ├── tenant/                 ← Serviços que existem uma vez por empresa
│   │   ├── atividades/
│   │   ├── cronometro/
│   │   ├── email/
│   │   ├── whatsapp/
│   │   ├── dashboard/
│   │   ├── relatorios/
│   │   ├── historico/
│   │   ├── notificacoes/
│   │   ├── agendamento/
│   │   ├── gabi/
│   │   ├── api-cockpit/
│   │   └── conector-erp/
│   │
│   ├── produto/                ← Templates reutilizáveis — dados ficam no produto
│   │   └── helpdesk/
│   │
│   ├── configurador/           ← Clerk, Stripe, billing, permissões, Admin Panel
│   ├── marketplace/            ← Landing e catálogo de produtos (frontend puro)
│   └── devops/                 ← CI/CD, scripts, infraestrutura
│
├── produtos/                   ← Cada produto é um monorepo interno
│   └── simulacusto/
│       ├── client/             ← React
│       └── server/             ← Express + Prisma
│
└── scripts/                    ← compose-tenant-schema.ts, compose-schema.js
```

---

## Stack

| Camada | Tecnologia |
|:---|:---|
| Linguagem | TypeScript `strict: true` |
| Runtime | Node.js ≥ 20 |
| Frontend | React + lazy loading |
| Backend | Express + Zod |
| Banco | PostgreSQL + Prisma |
| Auth | Clerk (usuários) + JWT (s2s) |
| Billing | Stripe |
| Email | Resend |
| WhatsApp | Meta Cloud API |
| IA | OpenAI (Gabi) |
| Deploy | Railway |
| CI/CD | GitHub Actions |
| Testes | Vitest + Playwright |
| Monitoramento | Sentry + UptimeRobot |

---

## Aliases TypeScript

```typescript
@nucleo/*   → nucleo-global/*
@tenant/*   → servicos-global/tenant/*
@produto/*  → servicos-global/produto/*
```

---

## Ondas de Desenvolvimento

| Onda | O que é construído | Pré-requisito |
|:---|:---|:---|
| Onda 1 | Esqueleto do monorepo, schema Prisma base, Marketplace | Nenhum |
| Onda 2 | Núcleo UI, Shell, Configurador | Onda 1 concluída |
| Onda 3 | Serviços de tenant, serviços de produto | Onda 2 concluída |
| Onda 4 | Proxy, Auth Flow, DevOps | Onda 3 concluída |

---

## Primeiros Passos

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Consultar skills em skills/ para cada módulo
```

---

## Regras Fundamentais

- Todo arquivo é `.ts` ou `.tsx` — nenhum `.js` novo é aceito
- Toda rota tem schema Zod obrigatório
- Erros lançados via `AppError`, nunca `res.status()` direto
- Imports sempre via aliases `@nucleo/`, `@tenant/`, `@produto/`
- Nenhuma variável de ambiente hardcoded
- `tenant_id` obrigatório em toda query ao banco tenant
