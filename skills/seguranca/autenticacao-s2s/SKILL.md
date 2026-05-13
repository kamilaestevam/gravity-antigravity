---
name: antigravity-autenticacao-s2s
description: "Use esta skill sempre que uma tarefa envolver comunicação service-to-service (S2S) — produto chamando serviço de organização, serviço de organização chamando Configurador, ou qualquer requisição entre serviços. Define os dois fluxos de autenticação (JWT Síncrono e Machine Token Assíncrono), quando usar cada um, como propagar o x-chave-interna, validação JWT independente, proxy de organização, a ordem dos middlewares e idempotência. Todo agente consulta esta skill antes de escrever qualquer chamada entre serviços."
---

# Gravity — Autenticação S2S (Service-to-Service)

## Por Que Dois Fluxos

A autenticação JWT do Clerk tem **expiração curta** (tipicamente 1 hora). Isso cria um problema para ações assíncronas e jobs em background: o token do usuário pode ter expirado antes do job executar.

A solução é ter dois fluxos distintos:

| Situação | Fluxo |
|:---|:---|
| Usuário fez a ação agora e está na tela | **JWT Síncrono** — propagar token do usuário |
| Job, cron, retry ou ação em background | **Machine Token** — token de serviço sem expiração curta |

---

## Fluxo 1 — JWT Síncrono

Usado quando o usuário está ativo e o token Clerk é válido. O produto simplesmente propaga o JWT do usuário para o serviço de organização.

```typescript
// Propagando JWT do usuário na chamada para serviço de organização
async function callTenantService(
  endpoint: string,
  req: Request,
  body?: unknown
) {
  return fetch(`${process.env.ORGANIZACAO_SERVICES_URL}${endpoint}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Authorization':    `Bearer ${req.auth.token}`,  // ← JWT do usuário
      'x-chave-interna':   process.env.INTERNAL_SERVICE_KEY!,
      'x-id-correlacao': req.correlationId,
      'Content-Type':     'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  })
}
```

**Quando usar:**
- Ações disparadas diretamente pelo usuário via UI
- Qualquer chamada dentro de um request-response síncrono
- Quando o token ainda é válido e o usuário está ativo

---

## Fluxo 2 — Machine Token (Service Token)

Usado para ações assíncronas, cron jobs e retries onde o JWT do usuário pode ter expirado. O serviço usa um token de serviço próprio.

```typescript
// Gerando um service token para ação assíncrona
async function getServiceToken(
  idOrganizacao: string,
  idUsuario: string
): Promise<string> {
  // O Configurador emite tokens de serviço com vida longa
  const response = await fetch(
    `${process.env.CONFIGURATOR_URL}/api/internal/service-token`,
    {
      method: 'POST',
      headers: {
        'x-chave-interna': process.env.INTERNAL_SERVICE_KEY!,
        'Content-Type':   'application/json'
      },
      body: JSON.stringify({ id_organizacao: idOrganizacao, id_usuario: idUsuario, scope: 'service' })
    }
  )
  const { token } = await response.json()
  return token
}

// Usando o service token em chamada assíncrona
async function callTenantServiceAsync(
  endpoint: string,
  idOrganizacao: string,
  idUsuario: string,
  body: unknown,
  idempotencyKey: string
) {
  const serviceToken = await getServiceToken(idOrganizacao, idUsuario)

  return fetch(`${process.env.ORGANIZACAO_SERVICES_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization':     `Bearer ${serviceToken}`,
      'x-chave-interna':    process.env.INTERNAL_SERVICE_KEY!,
      'x-chave-idempotencia': idempotencyKey,
      'Content-Type':      'application/json'
    },
    body: JSON.stringify(body)
  })
}
```

**Quando usar:**
- Cron jobs e processamento em background
- Retries de ações que falharam (ver `antigravity-cross-boundary`)
- Qualquer ação que pode demorar mais de 1 hora para ser tentada

---

## Segurança — x-chave-interna

O `x-chave-interna` é uma camada adicional de defesa (defense-in-depth). **Todo** serviço deve validar essa chave em chamadas internas, mesmo que o JWT seja válido.

**OBRIGATÓRIO: usar `timingSafeEqual` — nunca comparação direta (`!==`).** Comparação direta vaza informação sobre o tamanho correto da chave via timing attack.

```typescript
// servicos-global/servicos-plataforma/middleware/withInternalKeyValidation.ts
import { timingSafeEqual } from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'
import { AppError } from './appError.js'

export function withInternalKeyValidation(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const expected = process.env.INTERNAL_API_KEY
  const received = req.headers['x-chave-interna']

  if (!expected || !received || typeof received !== 'string') {
    next(new AppError('Forbidden', 403, 'FORBIDDEN'))
    return
  }

  try {
    const expectedBuf = Buffer.from(expected)
    const receivedBuf = Buffer.from(received)
    if (
      expectedBuf.length !== receivedBuf.length ||
      !timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      next(new AppError('Forbidden', 403, 'FORBIDDEN'))
      return
    }
  } catch {
    next(new AppError('Forbidden', 403, 'FORBIDDEN'))
    return
  }

  next()
}
```

> **Regras:** (1) `INTERNAL_API_KEY` deve ser rotacionada a cada trimestre. (2) Use `timingSafeEqual` — nunca `!==`. (3) Retornar 403, não 401, para não confundir com falta de autenticação de usuário.

---

## Ordem dos Middlewares no Super-Servidor Organização

```typescript
// Ordem obrigatória em servicos-global/servicos-plataforma/server/index.ts
app.use(correlationMiddleware)          // 1. Correlation ID (gera SUID se ausente)
app.get('/health', healthHandler)       // 2. Health check — sem auth, antes dos guards
app.use('/api/v1/email/webhook', express.raw({ type: 'application/json' }))  // 3. Raw body para webhooks
app.use(express.json())                 // 4. Body parser
app.use(authMiddleware)                 // 5. Exige x-tenant-id → 401 se ausente
app.use(withInternalKeyValidation)      // 6. Valida x-chave-interna → 403 se inválida
// ... service routers ...
app.use(errorHandler)                   // 7. Handler global de erros
```

**Por que `authMiddleware` antes de `withInternalKeyValidation`:**
- Toda chamada a serviços organização já carrega `x-tenant-id` (é o identificador do organização, não segredo)
- Falhar rápido em 401 antes de verificar a chave interna é semanticamente correto e mais informativo para debugging

---

## Tabela de Decisão — Qual Fluxo Usar

| Cenário | Fluxo | Token |
|:---|:---|:---|
| Usuário clicou em "Salvar" na UI | JWT Síncrono | `req.auth.token` |
| Webhook recebido de sistema externo | Machine Token | `getServiceToken()` |
| Cron job diário de relatórios | Machine Token | `getServiceToken()` |
| Retry de ação falha (cross-boundary) | Machine Token | `getServiceToken()` |
| Export de dados disparado pelo usuário | JWT Síncrono (se rápido) ou Machine Token (se demorado) | Avaliar tempo |
| Notificação automática ao completar job | Machine Token | `getServiceToken()` |

---

## Idempotência em Chamadas S2S

Para evitar processamento duplicado em retries:

```typescript
// O serviço receptor deve verificar idempotência
async function processAction(idempotencyKey: string, payload: unknown) {
  // 1. Verificar se já foi processado
  const existing = await prisma.processedAction.findUnique({
    where: { idempotencyKey }
  })
  if (existing) return { success: true, cached: true }

  // 2. Processar a ação
  const result = await doAction(payload)

  // 3. Registrar como processado
  await prisma.processedAction.create({
    data: { idempotencyKey, processedAt: new Date() }
  })

  return { success: true, result }
}
```

---

## Validação JWT Independente — Cada Serviço Valida
**Regra inviolável:** o servidor de organização NUNCA confia no produto cegamente. Ele valida o JWT de forma independente.

```typescript
// Em CADA serviço — configurador, organizacao-services, produtos
import { clerkMiddleware, requireAuth } from '@clerk/express'

// O serviço valida o JWT por conta própria
app.use(clerkMiddleware())
app.use(requireAuth())

// Não basta o produto dizer "o usuário é X" — o serviço confirma
```

Isso significa que mesmo se um produto for comprometido, ele não pode se passar por um usuário arbitrário nos serviços de organização.

---

## Proxy de Organização — Padrão para Produtos
Todo produto que consome serviços de organização usa um proxy que encapsula autenticação e retry:

```typescript
// servicos-global/servicos-plataforma/proxy/index.ts
import { PRODUCT_CONFIG } from './config'

export function createTenantProxy(config: {
  baseUrl: string
  services: string[]
}) {
  const router = Router()

  for (const service of config.services) {
    router.use(`/${service}`, async (req, res) => {
      try {
        const response = await fetch(`${config.baseUrl}/api/v1/${service}${req.path}`, {
          method: req.method,
          headers: {
            'Authorization': req.headers.authorization!,
            'x-chave-interna': process.env.INTERNAL_SERVICE_KEY!,
            'x-id-correlacao': req.correlationId,
            'Content-Type': 'application/json',
          },
          body: ['POST', 'PUT', 'PATCH'].includes(req.method)
            ? JSON.stringify(req.body) : undefined,
        })
        const data = await response.json()
        res.status(response.status).json(data)
      } catch (err) {
        res.status(503).json({
          error: { code: 'TENANT_SERVICE_UNAVAILABLE', message: 'Serviço temporariamente indisponível' }
        })
      }
    })
  }

  return router
}

// No servidor do produto:
app.use('/api/organizacao', createTenantProxy({
  baseUrl: process.env.ORGANIZACAO_SERVICES_URL!,
  services: PRODUCT_CONFIG.tenantServices,
}))
```

---

## Checklist — Antes de Qualquer Chamada S2S

- [ ] A chamada é síncrona (UI ativa)? → usar Fluxo 1 (JWT do usuário)
- [ ] A chamada é assíncrona (job, cron, retry)? → usar Fluxo 2 (Machine Token)
- [ ] O `x-chave-interna` está sendo enviado em toda chamada interna?
- [ ] O `x-id-correlacao` está sendo propagado?
- [ ] Se for retry/job, tem `x-chave-idempotencia` para evitar duplicação?
- [ ] O serviço receptor valida o JWT independentemente?
- [ ] O proxy de organização está configurado no servidor do produto?

---

## Endpoints S2S internos do Configurador

Catálogo dos endpoints que produtos chamam para validações de autorização. Todos exigem `x-chave-interna-servico` (sem isso → 401). NÃO recebem JWT do usuário (são S2S puro).

| Endpoint | Helper SDK | Quando usar | Resposta |
|---|---|---|---|
| `GET /api/v1/internal/acesso-produto/verificar` | `verificarAcessoProduto` (middleware) | Portão 3 — valida acesso usuário×workspace×produto | `{ permitido, motivo? }` |
| `GET /api/v1/internal/usuarios/:id/workspaces-habilitados?id_organizacao=X` | `obterWorkspacesHabilitadosDoUsuario` | Listas multi-workspace — quais workspaces o usuário pode acessar | `{ tipo_usuario, workspaces_habilitados: string[] }` |
| `GET /api/v1/internal/workspaces?ids=a,b,c` | `obterWorkspaces` (batch lookup) | Snapshot de nome+CNPJ de workspaces para produtos | `{ workspaces: [{ id, nome, cnpj, id_organizacao }] }` |

### Padrão de uso (`obterWorkspacesHabilitadosDoUsuario`)

```typescript
import { obterWorkspacesHabilitadosDoUsuario } from '@gravity/resolver-organizacao'

// Dentro de uma rota Express, após resolverOrganizacao
const { tipoUsuario, workspacesHabilitados } = await obterWorkspacesHabilitadosDoUsuario({
  configuradorBaseUrl: process.env.CONFIGURATOR_URL!,
  chaveInterna:        process.env.CHAVE_INTERNA_SERVICO!,
  idOrganizacao:       ctx.idOrganizacao,
  idUsuario:           ctx.idUsuario,
})

// Validar intersecção com o que foi solicitado
const habilitadosSet = new Set(workspacesHabilitados)
const bloqueados = idsSolicitados.filter((id) => !habilitadosSet.has(id))
if (bloqueados.length > 0) {
  return res.status(403).json({
    error: {
      code: 'WORKSPACE_NAO_AUTORIZADO',
      message: `${bloqueados.length} workspace(s) não autorizado(s)`,
      workspaces_bloqueados: bloqueados,
    },
  })
}
```

### Cross-organização (FORNECEDOR)

`obterWorkspacesHabilitadosDoUsuario` aceita usuário FORNECEDOR em organização diferente da `Usuario.id_organizacao` (cross-tenant). Para os demais tipos, divergência → 403 `ORGANIZACAO_MISMATCH`. Defesa em profundidade automática contra cross-org sem código extra.

### SSOT — regra de visibilidade

O endpoint replica a regra do `/api/v1/hub/init`:
- MASTER / SAdmin / Admin → todos workspaces `status_workspace='ATIVO'` da org
- PADRAO / FORNECEDOR → ATIVO **AND** `UsuarioWorkspace.ativo_usuario_workspace=true`

**Dívida D11** pede extração para `organizacaoService.workspacesAcessiveis(idUsuario, idOrganizacao, tipo)` para eliminar drift. Se mudar a regra, **mudar nos DOIS endpoints**.

### Testes que NÃO podem regredir

`servicos-global/configurador/server/__tests__/workspaces-habilitados-internal.test.ts` — 6 testes funcionais:
1. MASTER → todos ATIVO
2. PADRAO → só habilitados
3. FORNECEDOR → ignora cross-tenant mismatch
4. Usuário inexistente → 404
5. Sem chave interna → 401
6. PADRAO cross-org → 403

Sem essa cobertura, o endpoint pode regredir silenciosamente. Pre-commit hook roda Vitest.
