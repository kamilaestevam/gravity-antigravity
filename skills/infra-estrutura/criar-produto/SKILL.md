---
name: antigravity-criar-produto
description: "Use esta skill para criar novos produtos na plataforma Gravity. Define os 23 passos obrigatórios: desde o registro em contracts.json até o seed de dados demo, passando por estrutura client/server, PRODUCT_CONFIG completo, 11 middlewares, composição Prisma com 3 índices, Clerk, i18n, testes, segurança 5 camadas, rate limiting e Definition of Done. Todo agente consulta esta skill antes de criar qualquer produto do zero."
---

# Gravity — Criar Novo Produto (Guia Completo)

## Regra Fundamental

Criar um produto no Gravity não é "criar uma pasta e codar". São **23 passos** que garantem que o produto nasce integrado, seguro e pronto para produção. Pular qualquer passo gera dívida técnica ou falha de segurança.

---

## Skills Obrigatórias Antes de Começar

Antes de criar qualquer produto, ler **obrigatoriamente**:

| Skill | Por quê |
|:---|:---|
| `antigravity-agent-policy` | Escopo e regras universais |
| `antigravity-code-standards` | Padrões de código |
| `antigravity-service-registry` | PRODUCT_CONFIG e navegação |
| `antigravity-ambiente` | Portas e dev servers |
| `antigravity-tenant-isolation` | Schema-per-Organização e 3 índices |
| `antigravity-seguranca-5-camadas` | 5 camadas de segurança |
| `antigravity-schema-composition` | Prisma fragments |
| `antigravity-observabilidade` | Logs, health check, Sentry |
| `antigravity-definition-of-done` | Critérios de entrega |
| `antigravity-onboarding-produto` | Wizard e dados demo |
| `antigravity-rate-limiting` | Rate limiting por organização |
| `antigravity-autenticacao-s2s` | JWT, x-internal-key, proxy |
| `9-mandamentos` | Regras absolutas (Clerk isolado, schema intocável, DDD, sem fallback) |

---

## Passo 1 — Registrar em contracts.json

Antes de escrever qualquer código, registrar o produto em `servicos-global/contracts.json`:

```json
{
  "services": {
    "meu-produto": {
      "baseUrl": "http://localhost:8025",
      "pathPrefix": "/api/v1/meu-produto"
    }
  }
}
```

**Como escolher a porta:**
- Super-servidor tenant (todos os 11 serviços): 3001 (reservado)
- Configurador: 8005 (reservado)
- Produtos em uso: 8020 (simula-custo), 8023 (bid-frete), 8025 (bid-cambio), 8026 (processo), 8027 (lpco), 8028 (nf-importacao), 8029 (financeiro-comex), 8030 (pedido)
- **Próxima disponível para produto: 8031+**
- Frontend dev: próxima após 5184 (simula-custo=5180, bid-frete=5181, bid-cambio=5002, nf-importacao=5183, financeiro-comex=5184)
- Ver lista completa em `servicos-global/contracts.json`

---

## Passo 2 — Criar Estrutura de Pastas

```text
produto/meu-produto/
├── package.json                    ← Workspaces: client + server
├── client/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx                ← Entry point (Clerk + Router)
│       ├── App.tsx                 ← Shell Layout + Rotas
│       ├── pages/                  ← Uma subpasta por tela
│       └── shared/
│           ├── config.ts           ← PRODUCT_CONFIG
│           ├── api.ts              ← Chamadas REST (com tenant context)
│           └── types.ts            ← Tipos do domínio (espelham Prisma enums)
│
├── server/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.ts                ← Motor (11 middlewares)
│       ├── routes/                 ← Endpoints /api/v1/
│       ├── middleware/             ← requireInternalKey, tenantIsolation
│       ├── services/               ← Lógica de negócio
│       ├── connectors/             ← APIs externas (se houver)
│       └── lib/                    ← Motores puros (calculators)
│   └── prisma/
│       ├── schema.base.prisma      ← Header (provider/db)
│       ├── fragment.prisma         ← Models (campos DDD: id_organizacao, id_produto, id_usuario + 3 índices)
│       └── schema.prisma           ← GERADO (INTOCÁVEL — Mandamento 02; .gitignore)
│
└── scripts/
    └── compose-schema.ts           ← Compõe base + fragments

testes/
├── testes-unitarios/meu-produto/   ← Testes unitários
├── testes-funcionais/meu-produto/  ← Testes funcionais (banco real)
└── testes-e2e/meu-produto/         ← Testes E2E (Playwright)
```

---

## Passo 3 — package.json (Raiz do Produto)

```json
{
  "name": "@gravity/meu-produto",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "db:compose": "node scripts/compose-schema.ts",
    "db:generate": "cd server && npx prisma generate",
    "db:migrate": "cd server && npx prisma migrate dev"
  }
}
```

---

## Passo 4 — Client: package.json

```json
{
  "name": "@gravity/meu-produto-client",
  "private": true,
  "type": "module",
  "dependencies": {
    "@clerk/clerk-react": "^5.x",
    "@phosphor-icons/react": "^2.x",
    "i18next": "^24.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "react-i18next": "^15.x",
    "react-router-dom": "^7.x",
    "zustand": "^5.x"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x",
    "vite": "^6.x"
  },
  "scripts": {
    "dev": "vite --port 5182",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Passo 5 — Client: tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@nucleo/*": ["../../../nucleo-global/*"],
      "@shell": ["../../../servicos-global/shell/index.ts"],
      "@shell/*": ["../../../servicos-global/shell/*"],
      "@tenant/*": ["../../../servicos-global/tenant/*"],
      "@produto/*": ["../../../servicos-global/produto/*"]
    }
  },
  "include": ["src"]
}
```

---

## Passo 6 — Client: vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const monorepoRoot = path.resolve(__dirname, '..', '..', '..')

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5182,       // ← próxima porta disponível
    fs: { allow: [monorepoRoot] },   // ← OBRIGATÓRIO para monorepo
    proxy: {
      '/api': {
        target: 'http://localhost:8025',  // ← porta do backend em contracts.json
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@nucleo/tabela-global': path.resolve(monorepoRoot, 'nucleo-global/Tabelas/tabela-global/src'),
      '@nucleo/modal-global': path.resolve(monorepoRoot, 'nucleo-global/Modais/modal-global/src'),
      // ... adicionar cada componente usado
      '@shell': path.resolve(monorepoRoot, 'servicos-global/shell/index.ts'),
      '@gravity/shell': path.resolve(monorepoRoot, 'servicos-global/shell'),
      '@tenant': path.resolve(monorepoRoot, 'servicos-global/tenant'),
    },
    dedupe: ['react', 'react-dom', '@clerk/clerk-react', 'react-router-dom', 'zustand'],
  },
  optimizeDeps: {
    include: ['zustand', 'i18next', '@clerk/clerk-react', '@phosphor-icons/react'],
  },
})
```

---

## Passo 7 — Client: main.tsx

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { App } from './App'
import './index.css'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_KEY}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
)
```

---

## Passo 8 — Client: App.tsx

```tsx
import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@shell'
import { useShellStore } from '@shell/store'
import { PRODUCT_CONFIG } from './shared/config'
import { setApiContext } from './shared/api'

const MinhaPage = lazy(() => import('./pages/MinhaPage'))

export function App() {
  const { currentUser } = useShellStore()

  useEffect(() => {
    if (currentUser?.idOrganizacao) {
      setApiContext({ idOrganizacao: currentUser.idOrganizacao, idUsuario: currentUser.id_usuario })
    }
  }, [currentUser])

  return (
    <Layout>
      <Suspense fallback={<div>Carregando...</div>}>
        <Routes>
          <Route path="/" element={<MinhaPage />} />
          {/* adicionar rotas do produto */}
        </Routes>
      </Suspense>
    </Layout>
  )
}

export { PRODUCT_CONFIG }
```

---

## Passo 9 — Client: shared/config.ts (PRODUCT_CONFIG)

```typescript
export interface NavigationItem {
  id: string
  label: string
  icon: string
  source: 'product' | 'tenant'
}

export const PRODUCT_CONFIG = {
  id: 'meu-produto',
  productId: 'meu-produto',   // ID para permissões no Configurador
  name: 'Meu Produto',
  port: 8025,                  // Porta do backend (contracts.json)

  // Serviços de tenant consumidos via proxy
  tenantServices: [
    'atividades', 'dashboard', 'relatorios',
    'historico', 'notificacoes', 'gabi',
  ] as const,

  // Serviços internos do produto (rodam no server deste produto)
  productServices: [
    'minha-engine',
  ] as const,

  // Menu lateral
  navigation: [
    { id: 'principal',   label: 'Principal',    icon: 'house',        source: 'product' },
    { id: 'atividades',  label: 'Atividades',   icon: 'check-circle', source: 'tenant'  },
    { id: 'dashboard',   label: 'Dashboard',    icon: 'bar-chart',    source: 'tenant'  },
    { id: 'relatorios',  label: 'Relatórios',   icon: 'file-text',    source: 'tenant'  },
    { id: 'historico',   label: 'Histórico',    icon: 'clock',        source: 'tenant'  },
    { id: 'gabi',        label: 'Gabi IA',      icon: 'sparkle',      source: 'tenant'  },
  ] satisfies NavigationItem[],

  features: {},
}
```

---

## Passo 10 — Client: shared/api.ts

```typescript
import { z } from 'zod'

// Mandamento 05: nunca {} as T — usar null + tratamento de loading
let context: { idOrganizacao: string; idUsuario: string } | null = null

export function setApiContext(ctx: { idOrganizacao: string; idUsuario: string }) {
  context = ctx
}

// Mandamento 06: toda resposta passa por schema.parse() antes de ser retornada
async function request<T>(endpoint: string, schema: z.ZodType<T>, options?: RequestInit): Promise<T> {
  if (!context) throw new Error('API context não inicializado — chame setApiContext primeiro')

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // O backend deve preferir extrair id_organizacao do JWT (nunca confiar em headers de cliente)
      'x-internal-key': import.meta.env.VITE_INTERNAL_KEY || '',
      ...options?.headers,
    },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Erro desconhecido' } }))
    throw new Error(error.error?.message || `HTTP ${response.status}`)
  }
  const json = await response.json()
  return schema.parse(json)  // Mandamento 06 + 09: contrato bilateral
}

// Exemplo — adaptar ao domínio do produto
export const api = {
  list:    () => request('/api/v1/recursos', recursoListSchema),
  getById: (id: string) => request(`/api/v1/recursos/${id}`, recursoSchema),
  create:  (data: CreateRecursoInput) => request('/api/v1/recursos', recursoSchema, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
}
```

---

## Passo 11 — Client: shared/types.ts

Espelhar todos os enums do Prisma e criar labels para UI:

```typescript
// Tipos que espelham os enums do fragment.prisma
export type StatusRecurso = 'RASCUNHO' | 'ATIVO' | 'ARQUIVADO'

export const STATUS_LABELS: Record<StatusRecurso, string> = {
  RASCUNHO: 'Rascunho',
  ATIVO: 'Ativo',
  ARQUIVADO: 'Arquivado',
}

export const STATUS_BADGE: Record<StatusRecurso, string> = {
  RASCUNHO: 'bg-yellow-100 text-yellow-800',
  ATIVO: 'bg-green-100 text-green-800',
  ARQUIVADO: 'bg-gray-100 text-gray-800',
}

// Interface principal do domínio (DDD — Mandamento 03)
export interface Recurso {
  id: string
  id_organizacao: string
  id_usuario: string
  titulo: string
  status: StatusRecurso
  created_at: string
  updated_at: string
}
```

---

## Passo 12 — Server: 11 Middlewares (index.ts)

Ordem exata e inegociável:

```typescript
import express from 'express'
import cors from 'cors'
import { join } from 'path'
import { correlationMiddleware } from './middleware/correlation'
import { requireInternalKey } from './middleware/internal-auth'
import { tenantIsolationMiddleware } from './middleware/tenant-isolation'
import { errorHandler } from './middleware/error-handler'
import { recursoRouter } from './routes/recursos'
import { prisma } from './lib/prisma'

const app = express()
const PORT = 8025  // ← contracts.json

// 1. Body Parser
app.use(express.json())

// 2. CORS
app.use(cors({ origin: ['http://localhost:5182', process.env.CONFIGURATOR_URL!] }))

// 3. Static (produção)
app.use(express.static(join(__dirname, '..', '..', 'client', 'dist')))

// 4. Health Check (sem auth — monitorado por UptimeRobot)
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', service: 'meu-produto', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'down', service: 'meu-produto' })
  }
})

// 5. Master Data (rotas públicas, sem auth)
// app.use('/api/v1/master-data', masterDataRouter)

// 6. Correlation ID
app.use(correlationMiddleware)

// 7. S2S Auth (x-internal-key)
app.use('/api/', requireInternalKey)

// 8. Isolamento de Organização — Schema-per-Organização via @gravity/tenant-resolver
//    (acesso ao banco SEMPRE via withTenant/withTenantContext; PrismaClient direto é PROIBIDO)
app.use(tenantIsolationMiddleware)

// 9. Product Routes
app.use('/api/v1/recursos', recursoRouter)

// 10. SPA Fallback (produção)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', '..', 'client', 'dist', 'index.html'))
})

// 11. Global Error Handler
app.use(errorHandler)

app.listen(PORT, () => console.log(`meu-produto server on :${PORT}`))
```

---

## Passo 13 — Server: fragment.prisma

**REGRA (Mandamento 03):** todo model DEVE ter `id_organizacao`, `id_produto`, `id_usuario` e os **3 índices obrigatórios**. Conforme `database-governance`, em produtos Schema-per-Organização os models não filtram por `id_organizacao` em queries (o schema **é** a organização) — mas mantêm o campo + índices durante a fase de transição (ADR-003 Fase 4).

```prisma
// produto/meu-produto/server/prisma/fragment.prisma
// Mandamento 02: schema.prisma final é INTOCÁVEL. O fragment é o único editável pelo agente do produto.

enum StatusRecurso {
  RASCUNHO
  ATIVO
  ARQUIVADO
}

model Recurso {
  id              String          @id @default(cuid())
  id_organizacao  String
  id_produto      String          @default("meu-produto")
  id_usuario      String

  titulo          String
  status          StatusRecurso   @default(RASCUNHO)

  is_demo         Boolean         @default(false)  // ← para dados demo (onboarding)

  created_at      DateTime        @default(now())
  updated_at      DateTime        @updatedAt

  // 3 índices obrigatórios — NUNCA omitir
  @@index([id_organizacao])
  @@index([id_organizacao, id_produto])
  @@index([id_organizacao, id_usuario])

  @@map("recursos")
}
```

---

## Passo 14 — Server: .env.example

```bash
# Banco de dados
DATABASE_URL=postgresql://user:pass@localhost:5432/meu-produto-db

# Autenticação
CLERK_SECRET_KEY=sk_test_...
INTERNAL_SERVICE_KEY=dev-internal-key-change-in-prod

# Serviços
TENANT_SERVICES_URL=http://localhost:3001
CONFIGURATOR_URL=http://localhost:3000

# Monitoramento
SENTRY_DSN=https://...

# Cliente
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Passo 15 — Server: Validação Zod em Toda Rota

```typescript
// server/src/routes/recursos.ts
import { Router } from 'express'
import { z } from 'zod'
import { AppError } from '../middleware/error-handler'

export const createRecursoSchema = z.object({
  titulo: z.string().min(1).max(200),
  status: z.enum(['RASCUNHO', 'ATIVO', 'ARQUIVADO']).optional(),
})

export type CreateRecursoInput = z.infer<typeof createRecursoSchema>

const router = Router()

router.post('/', async (req, res, next) => {
  try {
    const result = createRecursoSchema.safeParse(req.body)
    if (!result.success) {
      throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR')
    }
    const recurso = await req.prisma.recurso.create({ data: result.data })
    res.status(201).json({ data: recurso })
  } catch (err) { next(err) }
})

export { router as recursoRouter }
```

---

## Passo 16 — Proxy de Tenant

No servidor do produto, configurar o proxy para serviços de tenant:

```typescript
// Adicionar ao server/src/index.ts (após middleware 8)
import { createTenantProxy } from './proxy'
import { PRODUCT_CONFIG } from '../../client/src/shared/config'

app.use('/api/tenant', createTenantProxy({
  baseUrl: process.env.TENANT_SERVICES_URL!,
  services: [...PRODUCT_CONFIG.tenantServices],
}))
```

Ver skill `antigravity-autenticacao-s2s` para implementação completa do proxy.

---

## Passo 17 — Registrar no Configurador

Para que o produto apareça na plataforma:

1. **Catálogo** — adicionar via API ou seed no Configurador:
   - `POST /api/admin/products` com slug, nome, preço, status `ACTIVE`

2. **Shell** — o hook `useLoadAllowedProducts` consulta `/api/internal/tenant-products` no Configurador
   - Sem registro, o produto **nunca aparece** na sidebar

3. **Marketplace** — adicionar página de vendas em `servicos-global/marketplace/src/pages/`

---

## Passo 18 — Testes

Criar na pasta central `testes/`:

```text
testes/
├── testes-unitarios/meu-produto/
│   ├── types.test.ts              ← Validar enums e labels
│   ├── validators.test.ts         ← Validar schemas Zod
│   └── engine.test.ts             ← Lógica de negócio pura
├── testes-funcionais/meu-produto/
│   ├── recursos.test.ts           ← CRUD via supertest (banco real)
│   └── tenant-isolation.test.ts   ← Cross-tenant obrigatório
└── testes-e2e/meu-produto/
    └── fluxo-completo.spec.ts     ← Playwright (após plano aprovado)
```

**Cobertura mínima:** 70% unitário + 100% rotas críticas funcional.

---

## Passo 19 — Seed de Dados Demo

```typescript
// scripts/seed-demo.ts — usar withTenantContext do @gravity/tenant-resolver
import { withTenantContext } from '@gravity/tenant-resolver'

export async function seedDemo(idOrganizacao: string) {
  await withTenantContext(idOrganizacao, async (_ctx, rawDb) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = rawDb as any
    await db.recurso.createMany({
      data: [
        { id_organizacao: idOrganizacao, id_usuario: 'demo', titulo: 'Recurso Exemplo 1', is_demo: true },
        { id_organizacao: idOrganizacao, id_usuario: 'demo', titulo: 'Recurso Exemplo 2', is_demo: true },
      ]
    })
  })
}

export async function clearDemo(idOrganizacao: string) {
  await withTenantContext(idOrganizacao, async (_ctx, rawDb) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = rawDb as any
    await db.recurso.deleteMany({
      where: { id_organizacao: idOrganizacao, is_demo: true }
    })
  })
}
```

---

## Passo 20 — Rate Limiting

```typescript
// Adicionar ao server/src/index.ts (antes das rotas)
import rateLimit from 'express-rate-limit'

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  // Chave por organização extraída do JWT (preenchido por requireAuth ANTES deste middleware)
  // — nunca confiar em headers de cliente para isolamento
  keyGenerator: (req) => (req as any).auth?.idOrganizacao ?? req.ip,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Muitas requisições' } },
})

app.use('/api/', apiLimiter)
```

---

## Passo 21 — Segurança 5 Camadas

Validar todas antes de entregar:

| Camada | Implementação | Status |
|:---|:---|:---|
| 1. Rede | `x-internal-key` em toda chamada S2S | - [ ] |
| 2. Autenticação | Clerk JWT validado no server | - [ ] |
| 3. Autorização | Verificar permissão via Configurador | - [ ] |
| 4. Isolamento | Prisma middleware + RLS + 3 índices | - [ ] |
| 5. Auditoria | Mutações logadas no historico | - [ ] |

---

## Passo 22 — Observabilidade

```typescript
// Sentry + correlation ID + health check
// Ver skill antigravity-observabilidade para implementação completa
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
})
```

---

## Passo 23 — Wizard de Onboarding

Implementar wizard de 3-5 passos no primeiro acesso. Ver skill `antigravity-onboarding-produto`.

---

## Checklist Final — 23 Passos

### Registro e Infra
- [ ] 1. Registrado em `contracts.json` com porta e pathPrefix?
- [ ] 2. Estrutura de pastas criada (client/ + server/ + testes/)?
- [ ] 3. package.json com workspaces client + server?

### Client
- [ ] 4. Dependências instaladas (Clerk, i18next, zustand, phosphor)?
- [ ] 5. tsconfig.json com paths (`@nucleo/*`, `@shell`, `@tenant/*`, `@produto/*`)?
- [ ] 6. vite.config.ts com aliases, dedupe, optimizeDeps, fs.allow, proxy?
- [ ] 7. main.tsx com ClerkProvider + BrowserRouter?
- [ ] 8. App.tsx com Layout do Shell + setApiContext?
- [ ] 9. PRODUCT_CONFIG com id, port, tenantServices, productServices, navigation?
- [ ] 10. api.ts com `setApiContext({ idOrganizacao, idUsuario })`, `x-internal-key` e `schema.parse()` em todas as respostas (Mandamento 06)? `id_organizacao` extraído do JWT no backend, nunca confiando em headers de cliente.
- [ ] 11. types.ts espelhando enums do Prisma com labels e badges?

### Server
- [ ] 12. 11 middlewares na ordem correta?
- [ ] 13. fragment.prisma com `id_organizacao` + `id_produto` + `id_usuario` + 3 índices (DDD — Mandamento 03)?
- [ ] 14. .env.example completo?
- [ ] 15. Validação Zod em toda rota?
- [ ] 16. Proxy de tenant configurado?

### Plataforma
- [ ] 17. Registrado no Configurador (catálogo + marketplace)?

### Qualidade
- [ ] 18. Testes unitários + funcionais + cross-tenant?
- [ ] 19. Seed de dados demo com is_demo flag?
- [ ] 20. Rate limiting configurado?
- [ ] 21. 5 camadas de segurança validadas?
- [ ] 22. Observabilidade (Sentry + health check + correlation ID)?
- [ ] 23. Wizard de onboarding implementado?

---

## Após Criar — Validar com Definition of Done

Ver skill `antigravity-definition-of-done` para o checklist completo de entrega. O produto só está "Done" quando QA revisou e aprovou.
