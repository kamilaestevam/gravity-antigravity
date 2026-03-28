---
name: antigravity-criar-produto
description: "Use esta skill para criar novos produtos na plataforma Gravity. Define o padrão técnico absoluto: estrutura dual client/server, os 11 middlewares obrigatórios, PRODUCT_CONFIG canônico e composição de schema Prisma com isolamento de tenant."
---

# Gravity — Skill de Criação de Novos Produtos (Arquitetura Canônica)

Esta skill define o rigor técnico absoluto para a criação de qualquer novo produto no ecossistema Gravity (Onda 4). Siga esta arquitetura para garantir conformidade com o monorepo e isolamento de dados RLS.

## 1. Regra de Ouro (Isolamento)
Todo produto reside em `produto/[nome-do-produto]/` e é dividido obrigatoriamente em:
- `/client`: Vite React SPA consumindo `@gravity/shell`.
- `/server`: Express Node.js isolado com banco próprio.

---

## 2. Estrutura de Pastas Obrigatória

```text
produto/[nome-do-produto]/
├── client/                     # Frontend Vite + React
│   ├── src/
│   │   ├── main.tsx            # Entry point (Clerk + Router)
│   │   ├── App.tsx             # Shell + Rotas do Produto
│   │   ├── pages/              # Telas (Estimativas, Dashboard, etc)
│   │   └── shared/
│   │       ├── config.ts       # PRODUCT_CONFIG (Registry)
│   │       ├── api.ts          # Chamadas REST
│   │       └── types.ts        # Interfaces do domínio
│   ├── vite.config.ts          # Aliases @nucleo, @shell, @tenant
│   └── tsconfig.json           # Paths alinhados
│
└── server/                      # Backend Express
    ├── src/
    │   ├── index.ts            # Motor (11 Middlewares)
    │   ├── routes/             # Endpoints /api/v1
    │   ├── middleware/         # requireInternalKey, tenantIsolation
    │   ├── services/           # Lógica (ex: tokenPool, docGen)
    │   ├── connectors/         # APIs externas (Bacen, Siscomex)
    │   └── lib/                # Motores puros (ex: calculator)
    ├── prisma/
    │   ├── schema.base.prisma  # Header (provider/db)
    │   ├── fragment.prisma     # Models (tenant_id obrigatório)
    │   └── schema.prisma       # GERADO (.gitignore)
    ├── scripts/
    │   └── compose-schema.js   # Automação de composição
    └── .env.example            # Template de envs
```

---

## 3. O Motor do Backend (Os 11 Middlewares)

O `server/src/index.ts` deve seguir esta ordem exata e inegociável:

1.  **Body Parser**: `app.use(express.json())`
2.  **CORS**: Configurar origens permitidas (Configurador + Client Local).
3.  **Static**: `express.static(join(__dirname, '..', '..', 'client', 'dist'))`
4.  **Health**: `/health` (Sem auth, monitorado pelo UptimeRobot).
5.  **Master Data**: `/api/v1/master-data` (Dados públicos, sem auth).
6.  **S2S Auth**: `requireInternalKey` (Valida o segredo entre serviços).
7.  **Tenant RLS**: `tenantIsolationMiddleware` (Injeta `req.prisma` com filtro/inject de `tenant_id`).
8.  **Product Routes**: `app.use('/api/v1/recurso', resourceRouter)`.
9.  **SPA Fallback**: `app.get('*')` servindo o `index.html` do client.
10. **Global Errors**: Handler para capturar `AppError` ou `Error`.
11. **Listen**: Porta definida (ex: 8020 para o primeiro produto).

---

## 4. O Sistema de Composição de Schema

Nenhum agente edita o `schema.prisma` diretamente.
1. Edite o `fragment.prisma`.
2. Rode `node scripts/compose-schema.js`.
3. Rode `npx prisma generate`.

**Regra RLS:** Todo model persistente deve ter:
```prisma
tenant_id  String
@@index([tenant_id])
```

---

## 5. O Entry Point do Frontend (`App.tsx`)

O produto deve instanciar o `Layout` do Shell:

```tsx
import { Layout } from '@shell'
import { PRODUCT_CONFIG } from './shared/config'

export function App() {
  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Rotas exclusivas do produto */}
          <Route path="/recurso" element={<RecursoPage />} />
          {/* Rotas de tenant são mapeadas pelo Shell via navigation config */}
        </Routes>
      </Suspense>
    </Layout>
  )
}
```

---

## 6. Checklist Técnico para Criar Novo Produto

- [ ] Criado diretório dual `client/` e `server/`?
- [ ] `PRODUCT_CONFIG` define `tenantServices` e `navigation` de forma precisa?
- [ ] `vite.config.ts` possui aliases `@nucleo`, `@shell` e `@tenant`?
- [ ] Server implementa os 11 middlewares na ordem correta?
- [ ] `tenantIsolationMiddleware` injeta `tenant_id` em todas as queries (RLS)?
- [ ] Script `compose-schema.js` gera o schema corretamente?
- [ ] `.env.example` documenta todas as dependências de infraestrutura?
- [ ] Portas definidas: Client (Porta base + 1), Server (Porta base)?

---
