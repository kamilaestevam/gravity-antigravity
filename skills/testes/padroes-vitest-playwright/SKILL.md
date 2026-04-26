---
name: antigravity-testes
description: "Use esta skill sempre que uma tarefa envolver criação ou execução de testes no projeto Gravity. Define a estrutura de pastas central, configurações técnicas de Vitest e Playwright, exemplos de código, cobertura obrigatória por módulo e contract tests com Zod. Para o processo de revisão, papel do QA e categorias obrigatórias do plano E2E, consultar antigravity-qa."
---

# Gravity — Testes

## Responsabilidades

| Tipo | Ferramenta | Responsável |
|:---|:---|:---|
| Unitários | Vitest | Agente que entregou o código |
| Funcionais | Vitest | Agente que entregou o código |
| E2E — plano | Playwright + Percy | QA cria, dono aprova |
| E2E — execução | Playwright + Percy | QA executa após aprovação do dono |

---

## Estrutura de Pastas — Central na Raiz

Todos os testes ficam em uma única pasta na raiz do monorepo. Nunca dentro de cada módulo — sempre centralizado.

```text
Gravity/
  └── testes/                       ← raiz do monorepo
      ├── testes-unitarios/          ← ÚNICO lugar de testes unitários
      │   ├── infra/                 ← scripts de infra/migração (migrate-tenants, bootstrap)
      │   │   └── migrate-tenants/
      │   ├── nucleo-global/
      │   │   ├── tabela-global/
      │   │   ├── modal-global/
      │   │   ├── shell/
      │   │   └── utilitarios-global/
      │   └── servicos-tenant/
      │       ├── atividades/
      │       ├── cronometro/
      │       ├── email/
      │       ├── whatsapp/
      │       ├── dashboard/
      │       ├── relatorios/
      │       ├── historico/
      │       ├── agendamento/
      │       ├── gabi/
      │       ├── produtos/
      │       └── simulador-comex/
      ├── testes-funcionais/
      │   ├── infra/                 ← funções com efeitos externos (pg.Pool, fs) mockados
      │   │   └── migrate-tenants/
      │   ├── nucleo-global/
      │   ├── servicos-tenant/
      │   └── produtos/
      └── testes-e2e/
          ├── infra/                 ← integração real com PostgreSQL (requer TEST_DATABASE_URL)
          │   └── migrate-tenants/
          ├── nucleo-global/
          ├── servicos-tenant/
          ├── produtos/
          └── simulador-comex/
              ├── plano-de-testes.md
              ├── funcional/
              ├── visual/
              └── resultados/
```

**Por que central:** um único lugar para rodar todos os testes, CI/CD aponta para um caminho só, visão consolidada de cobertura total, imports via aliases sem caminhos relativos frágeis.

### Exceção: pacotes publicáveis em `packages/`

Pacotes que vivem em `packages/` (ex: `packages/tenant-resolver`) mantêm seus testes **dentro do próprio pacote**, não na raiz `testes/`. Isso porque:
- São publicáveis independentemente (npm workspace)
- Precisam de configs Vitest separadas (unit vs E2E, timeout diferente)
- O CI do pacote roda isolado do monorepo

```text
packages/tenant-resolver/
├── vitest.config.ts           ← unit + integration (sem banco)
├── vitest.e2e.config.ts       ← E2E (requer DATABASE_URL real)
└── tests/
    ├── unit/
    ├── integration/
    └── *.e2e.test.ts
```

**Versão obrigatória do Vitest:** o monorepo usa `vitest@2` no root (compatível com `vite@5`). Nunca atualizar o root para `vitest@3+` sem antes atualizar `vite` para `vite@6` — a incompatibilidade gera `ERR_PACKAGE_PATH_NOT_EXPORTED: Package subpath './module-runner'` e quebra todas as suítes. Para `packages/` publicáveis com setup isolado, instalar `vitest@2` localmente no pacote (mesma versão, mesma razão).

### `coverage.include` — Obrigatório em toda config de cobertura

Sem `coverage.include`, o v8 escaneia **todo o monorepo** e gera relatório inútil (0.47% real, centenas de arquivos irrelevantes). Sempre escopar para o módulo sendo testado:

```typescript
coverage: {
  provider: 'v8',
  include: ['scripts/ativamente/migrate-tenants/_shared.ts'],   // ← escopar aqui
  thresholds: { lines: 70, branches: 70 },
}
```

> **Nota sobre thresholds:** quando um arquivo exporta muitos helpers triviais (ex: wrappers ANSI, constantes), o metric `functions` fica distorcido. Use `lines` + `branches` como métricas primárias. Remova `functions` do threshold quando o arquivo tiver funções intencionalmente não testadas (helpers de output, constantes derivadas).

---

## Testes Unitários — Vitest

### O que testar
- Toda função pura: formatadores, validadores, utilitários, helpers
- Todo componente do `nucleo-global` isolado
- Todo schema Zod — casos válidos, inválidos, de borda
- Toda lógica de negócio isolada nos services

### Cobertura mínima obrigatória
- `nucleo-global/`: **80%**
- Demais módulos: **70%**

### Regras
- Cada função pública tem pelo menos um teste para o caminho feliz e um para o caminho de erro
- Componentes React testados com `@testing-library/react` — testar comportamento, não implementação
- Mocks apenas para dependências externas — nunca mockar o que está sendo testado
- Nenhum `describe.skip` ou `it.skip` sem justificativa documentada no próprio teste

### Tipagem obrigatória em testes funcionais

**Regra:** Nenhum `: any` em arquivo de teste. O `check-deps.ts` bloqueia no commit e no CI.

Os 4 padrões mais comuns e como tipá-los corretamente:

```typescript
// ✅ 1. Error handler Express — NUNCA (err: any)
import express, { Request, Response, NextFunction } from 'express'

interface HttpError extends Error {
  statusCode?: number
  code?: string
}

app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.statusCode ?? 500).json({ error: { code: err.code, message: err.message } })
})

// ✅ 2. Middleware de contexto de teste — NUNCA (req as any)
type AppRequest = Request & {
  prisma: unknown
  idOrganizacao: string
  idWorkspace: string
  idUsuario: string
}

app.use((req: Request, _res: Response, next: NextFunction) => {
  const appReq = req as AppRequest  // assertion para tipo mais específico, não any
  appReq.prisma = prismaMock
  // Headers HTTP mantêm nomes históricos por compatibilidade de protocolo
  appReq.idOrganizacao = (req.headers['x-tenant-id'] as string) ?? 'org-test'
  appReq.idWorkspace = (req.headers['x-workspace-id'] as string) ?? 'workspace-test'
  appReq.idUsuario = (req.headers['x-user-id'] as string) ?? 'user-test'
  next()
})

// ✅ 3. Mock de $transaction — NUNCA (fn: any)
type TxCallback = (tx: unknown) => Promise<unknown>

const prismaMock = {
  $transaction: vi.fn().mockImplementation((fn: TxCallback) => fn(txMock)),
  pedido: { findMany: vi.fn(), create: vi.fn() },
}

// ✅ 4. Assertion em response body — NUNCA .map((s: any) =>)
interface StatusItem { id: string; nome: string; ordem: number }
const ordens = (res.body.data as StatusItem[]).map(s => s.ordem)

// ✅ 5. Mock com where tipado — NUNCA (args: any)
findMany: vi.fn().mockImplementation((args: { where?: { id_organizacao?: string; id?: string } }) => {
  return args.where?.id_organizacao === 'org-001' ? mockData : []
})

// ✅ 6. Record de mock — NUNCA Record<string, any>
const txMock: Record<string, unknown> = {
  pedido: { findUnique: vi.fn(), update: vi.fn() }
}
```

### Configuração padrão

```typescript
// vitest.config.ts — ambiente node (backend/utils)
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',   // 'jsdom' para hooks React
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './testes/testes-unitarios/resultados',
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
      }
    },
  }
})
```

### Configuração com `jsdom` — Hooks React (ex: Configurador)

Quando o teste usa `renderHook` / `waitFor` de `@testing-library/react`, o ambiente deve ser `jsdom`. O plugin `resolveTsFromJs` é obrigatório porque os arquivos são `.ts` mas os imports usam `.js` (ESModules).

```typescript
// testes/testes-unitarios/configurador/vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../..')  // aponta para a raiz do monorepo

const resolveTsFromJs = {
  name: 'resolve-ts-from-js',
  resolveId(source: string, importer: string | undefined) {
    if (source.endsWith('.js') && importer) {
      return path.resolve(path.dirname(importer), source.replace(/\.js$/, '.ts'))
    }
  },
}

export default defineConfig({
  plugins: [resolveTsFromJs],
  root,
  test: {
    globals: true,
    include: ['testes/testes-unitarios/configurador/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './testes/testes-unitarios/configurador/resultados',
      thresholds: { lines: 70, functions: 70, branches: 70 },
    },
  },
})
```

> O `environment` **não é definido** no config — cada arquivo de teste declara `// @vitest-environment jsdom` ou `// @vitest-environment node` no topo, permitindo misturar ambientes na mesma suite.

### Padrão `vi.hoisted()` — Mocks antes de imports

Em Vitest, `vi.mock(...)` é hoisted para o topo do arquivo, mas as variáveis declaradas fora do hoist **não estão disponíveis** lá. Use `vi.hoisted()` para criar mocks que serão usados tanto em `vi.mock()` quanto nos testes:

```typescript
// ✅ Padrão correto — mock de useAuth do Clerk
const { mockGetToken, mockUseAuth } = vi.hoisted(() => ({
  mockGetToken: vi.fn(),
  mockUseAuth:  vi.fn(),
}))

vi.mock('@clerk/clerk-react', () => ({
  useAuth: mockUseAuth,
}))

// Agora mockUseAuth está disponível nos testes:
mockUseAuth.mockReturnValue({
  isLoaded: true, isSignedIn: true, userId: 'user_123', getToken: mockGetToken,
})
```

```typescript
// ✅ Padrão correto — mock de Prisma em teste funcional
const { mockFindUnique, mockWsFindFirst } = vi.hoisted(() => ({
  mockFindUnique:  vi.fn(),
  mockWsFindFirst: vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario:   { findUnique: mockFindUnique, update: vi.fn() },
    workspace: { findFirst: mockWsFindFirst },
  },
}))
```

### Padrão `renderHook + waitFor` — Hooks React assíncronos

```typescript
// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { useLoadSystemRole, invalidateRoleCache } from '../../../servicos-global/configurador/src/hooks/useLoadSystemRole.js'

beforeEach(() => {
  vi.clearAllMocks()
  invalidateRoleCache()           // limpa cache entre testes
  vi.stubGlobal('fetch', vi.fn()) // isola fetch global
})

afterEach(() => {
  vi.unstubAllGlobals()
})

it('retorna role MASTER', async () => {
  mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: true, userId: 'u1', getToken: mockGetToken })
  mockGetToken.mockResolvedValue('valid-jwt')
  ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
    new Response(JSON.stringify({ usuario: { tipo_usuario: 'MASTER' } }), { status: 200 })
  )

  const { result } = renderHook(() => useLoadSystemRole())

  await waitFor(() => expect(result.current.isReady).toBe(true))
  expect(result.current.role).toBe('MASTER')
})
```

**Regras para hooks assíncronos:**
- `await waitFor(() => expect(result.current.isReady).toBe(true))` antes de qualquer assert de dados
- Nunca fazer assert imediato sem `waitFor` — o hook parte em estado `isReady=false`
- `invalidateRoleCache()` (ou equivalente) no `beforeEach` quando o hook tem cache por módulo
- Se o hook pode emitir updates após o assert, garantir que o mock está totalmente resolvido antes do fim do teste (evita warning de `act()`)

### Exemplo

```typescript
// testes/testes-unitarios/nucleo-global/utilitarios-global/formatadores.test.ts
import { describe, it, expect } from 'vitest'
import { formatarCNPJ, formatarMoeda } from '@nucleo/utilitarios-global'

describe('formatarCNPJ', () => {
  it('formata CNPJ válido corretamente', () => {
    expect(formatarCNPJ('12345678000195')).toBe('12.345.678/0001-95')
  })

  it('retorna string vazia para CNPJ inválido', () => {
    expect(formatarCNPJ('123')).toBe('')
  })

  it('lida com CNPJ já formatado', () => {
    expect(formatarCNPJ('12.345.678/0001-95')).toBe('12.345.678/0001-95')
  })
})
```

---

## Testes Funcionais — Vitest

### O que testar
- Toda rota da API — com Prisma mockado via `vi.hoisted()` ou com banco real, conforme o módulo
- **Configurador**: Prisma mockado (nenhum banco de teste disponível em CI) — ver padrão abaixo
- Middleware de isolamento de organização — tentativa de acesso cross-organização obrigatória
- Fluxos de negócio completos no backend
- Autenticação e autorização: token válido, inválido, expirado, sem permissão
- Composição de schema — fragment compila e gera models corretos

### Cobertura obrigatória
- Rotas críticas (auth, financeiro, isolamento de organização): **100%**
- Demais rotas: mínimo **70%**
- Nenhuma rota sobe para a onda seguinte sem teste funcional correspondente

### Regras
- Banco de teste isolado por suite — nunca compartilhar estado entre testes
- Cada teste limpa seus dados ao final (`afterEach` ou `afterAll`)
- Testar caminho feliz, caminho de erro e caso de borda
- **NUNCA** mockar o banco de dados nos testes funcionais
- Validar o estado final do banco de dados após a operação

### Configuração padrão

Testes funcionais de serviços organização **importam o app do super-servidor** (`servicos-global/tenant/server/index.ts`), não de serviços individuais. O plugin `resolveTsFromJs` é obrigatório porque os arquivos têm extensão `.ts` mas os imports usam `.js` (ESModules).

```typescript
// testes/testes-funcionais/servicos-tenant/vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../..')

// Resolve imports .js → .ts em tempo de teste
const resolveTsFromJs = {
  name: 'resolve-ts-from-js',
  resolveId(source: string, importer: string | undefined) {
    if (source.endsWith('.js') && importer) {
      const tsSource = source.replace(/\.js$/, '.ts')
      return path.resolve(path.dirname(importer), tsSource)
    }
  },
}

export default defineConfig({
  plugins: [resolveTsFromJs],
  test: {
    environment: 'node',
    globals: true,
    include: ['testes/testes-funcionais/servicos-tenant/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',           // impede bootstrap() de chamar app.listen() e pg-boss
      INTERNAL_API_KEY: 'test-key',
      ALLOWED_ORIGINS: 'http://localhost:5179',
    },
  },
  resolve: {
    alias: {
      '@nucleo': path.resolve(root, 'nucleo-global'),
      '@tenant': path.resolve(root, 'servicos-global/tenant'),
      '@produto': path.resolve(root, 'produto'),
    },
  },
})
```

### Setup obrigatório

```typescript
// testes/testes-funcionais/setup.ts
import { beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL } }
})

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})
```

### Exemplo — Teste via Super-Servidor

```typescript
// testes/testes-funcionais/servicos-tenant/tenant-server.test.ts
// @vitest-environment node

import { describe, it, expect, vi, beforeAll } from 'vitest'
import request from 'supertest'

// Mockar dependências pesadas ANTES de importar o app
vi.mock('../../../servicos-global/tenant/server/lib/prisma.js', () => ({
  prisma: { $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1n }]) },
}))
vi.mock('../../../servicos-global/tenant/historico-global/server/init.js', () => ({
  initHistorico: vi.fn().mockResolvedValue(undefined),
}))
// ... mockar os 11 service routers com async factories ...

// Importar DEPOIS dos mocks
import { app } from '../../../servicos-global/tenant/server/index.js'

const VALID_KEY = 'test-internal-key'
const validHeaders = {
  'x-tenant-id': 'tenant-aaa',
  'x-user-id': 'user-001',
  'x-chave-interna': VALID_KEY,
}

beforeAll(() => {
  process.env.INTERNAL_API_KEY = VALID_KEY
})

describe('GET /health', () => {
  it('retorna 200 sem autenticação', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.service).toBe('tenant-server')
  })
})

describe('Autenticação', () => {
  it('retorna 401 sem x-tenant-id', async () => {
    const res = await request(app).get('/api/v1/qualquer-rota')
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('retorna 403 com x-chave-interna inválida', async () => {
    const res = await request(app)
      .get('/api/v1/qualquer-rota')
      .set('x-tenant-id', 'tenant-aaa')
      .set('x-chave-interna', 'chave-errada')
    expect(res.status).toBe(403)
  })
})
```

---

## Testes E2E — Playwright + Percy

> Para o processo completo de E2E (plano, 11 categorias obrigatórias, fluxo de aprovação do dono), consultar `antigravity-qa`.

### Configuração padrão do Playwright

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './testes/testes-e2e',
  outputDir: './testes/testes-e2e/resultados',
  reporter: [
    ['html', { outputFolder: './testes/testes-e2e/resultados/relatorio' }],
    ['json', { outputFile: './testes/testes-e2e/resultados/resultados.json' }]
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
})
```

### Configuração do Percy — validação visual

```typescript
import percySnapshot from '@percy/playwright'

test('estado padrão da tela principal', async ({ page }) => {
  await page.goto('/simulacoes')
  await percySnapshot(page, 'Simulações — estado padrão')
})

test('modal de criação aberto', async ({ page }) => {
  await page.goto('/simulacoes')
  await page.getByRole('button', { name: 'Nova simulação' }).click()
  await percySnapshot(page, 'Simulações — modal de criação')
})
```

### Regras
- Nenhum spec criado sem plano aprovado pelo dono
- Testes E2E rodam em staging — nunca em produção
- Screenshots e traces salvos automaticamente em falhas
- Resultados salvos em `testes/testes-e2e/[modulo]/resultados/`
- Todo teste E2E deve ter pelo menos um snapshot do Percy em pontos críticos
- Não usar seletores CSS frágeis — preferir `data-testid`
- O QA é o único que executa testes E2E em staging

---

## Contract Tests — Zod

Cada serviço da organização exporta os schemas Zod dos seus endpoints. O mesmo schema que valida a rota serve como contrato da API. O CI valida que os contratos não foram quebrados antes do merge.

```typescript
// servicos-global/tenant/atividades/server/schemas.ts
import { z } from 'zod'

export const createActivitySchema = z.object({
  title: z.string().min(1).max(200),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']),
  due_date: z.string().datetime().optional(),
  id_usuario: z.string().cuid(),
  id_produto: z.string().optional(),
})

export const activityResponseSchema = z.object({
  id: z.string().cuid(),
  id_organizacao: z.string(),
  title: z.string(),
  status: z.string(),
  created_at: z.string().datetime(),
})

export type CreateActivityInput = z.infer<typeof createActivitySchema>
export type ActivityResponse = z.infer<typeof activityResponseSchema>
```

Se um endpoint mudar o payload sem versionar, o contract test falha e bloqueia o merge no CI.

---

## Meta de Cobertura por Módulo

| Módulo | Unitário | Funcional | E2E |
|:---|:---|:---|:---|
| nucleo-global | 80% | N/A | Smoke tests |
| servicos-tenant (cada) | 70% | 100% rotas críticas | Por produto |
| produtos | 70% | 100% rotas críticas | 11 categorias obrigatórias |
| configurador | 70% | 100% auth + billing | Fluxo completo de onboarding |

---

## Contract Tests com Zod (Dream Team)

Cada serviço exporta schemas Zod que funcionam como **contratos da API**. O CI valida que os contratos não foram quebrados antes do merge.

### Estrutura de Contract Tests

```typescript
// servicos-global/tenant/atividades/server/contracts.ts
export const createActivityContract = z.object({
  title: z.string().min(1).max(200),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']),
  id_usuario: z.string().cuid(),
  id_produto: z.string().optional(),
})

export const activityResponseContract = z.object({
  id: z.string().cuid(),
  id_organizacao: z.string(),
  title: z.string(),
  status: z.string(),
  created_at: z.string().datetime(),
})
```

### O que bloqueia o CI

| Mudança | Breaking? | CI |
|:---|:---|:---|
| Adicionar campo opcional ao response | Não | Passa |
| Remover campo do response | Sim | **Bloqueia** |
| Mudar tipo de campo | Sim | **Bloqueia** |
| Renomear endpoint | Sim | **Bloqueia** → versionar API |

### CI job para contract tests

```yaml
contract-check:
  runs-on: ubuntu-latest
  steps:
    - run: npm run test:contracts
```

> Para detalhes completos, ver skill `antigravity-contract-testing`.

---

## Checklist — Antes de Entregar Código com Testes

- [ ] Arquivos de teste na pasta `testes/` central na raiz do monorepo?
- [ ] Testes unitários cobrem funções puras e componentes?
- [ ] Cobertura unitária atinge o mínimo (80% nucleo, 70% demais)?
- [ ] Testes funcionais cobrem todas as rotas?
- [ ] Teste de isolamento cross-organização implementado para serviços da organização?
- [ ] Banco de teste limpo após cada suite funcional?
- [ ] Todos os testes passam sem warnings?
- [ ] Schemas Zod exportados como contratos de API?
- [ ] Contract tests implementados (consumer + provider)?
- [ ] CI bloqueia merge se contrato quebrar?
- [ ] Para E2E: plano criado e enviado ao dono para aprovação?
