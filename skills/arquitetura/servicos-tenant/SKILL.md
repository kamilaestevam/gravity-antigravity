---
name: antigravity-servicos-tenant
description: "Use esta skill sempre que uma tarefa envolver criação, modificação ou uso de serviços da organização ou serviços de produto do projeto Gravity. Define a diferença entre as duas naturezas de serviço, a estrutura obrigatória de pastas, as regras de autocontido, como expor fragment.prisma (pós-pivô Schema-per-Organização) e como o frontend integra os serviços. Todo agente consulta esta skill antes de criar ou modificar qualquer serviço."
---

# Gravity — Serviços Global

## As Duas Naturezas de Serviço

Dentro de `servicos-global` existem duas categorias fundamentalmente diferentes. Esta distinção define onde os dados vivem e como a experiência unificada entre produtos é possível.

### Serviços da Organização

Existem uma vez por organização, independente de quantos produtos ela use. O email é da organização, não do produto. As atividades precisam aparecer unificadas em todos os produtos. O dashboard consolida KPIs de tudo.

- **Todos os 11 serviços rodam em processo único — o super-servidor de organização (porta 3001)**
- Cada serviço exporta um `serviceRouter`; o super-servidor (`servicos-global/tenant/server/index.ts`) é o único `app.listen()`
- Acessados por todos os produtos via API REST
- Após o pivô Schema-per-Organização (2026-04-17), o **isolamento é feito pelo schema PostgreSQL** via SDK `@gravity/tenant-resolver` (`withTenant`/`withTenantContext`); models não carregam mais `id_organizacao` como coluna

### Serviços de Produto

São templates de funcionalidade reutilizáveis, mas os dados pertencem ao produto que os instancia. O helpdesk do NF Importação tem SLAs diferentes do helpdesk do Simulador Comex.

- O código é compartilhado — o banco é de cada produto
- Rodam dentro do servidor do produto, não em servidor separado
- Expõem `fragment.prisma` para composição no schema do produto

---

## Tabela Comparativa

| Característica | nucleo-global | servicos-global/tenant | servicos-global/produto |
|:---|:---|:---|:---|
| Tem estado próprio? | ❌ Não | ✅ Sim | ✅ Sim |
| Tem backend? | ❌ Nunca | ✅ Sempre | ✅ Sempre |
| Banco próprio? | ❌ Nunca | ✅ Banco compartilhado da organização (schema-per-organização) | ❌ Banco do produto (schema-per-organização) |
| Chama API externa? | ❌ Nunca | ✅ Pode | ✅ Pode |
| Funciona offline? | ✅ Sempre | ❌ Não | ❌ Não |
| Roda onde? | No produto | Super-servidor `:3001` | Dentro do produto |

---

## Catálogo de Serviços da Organização

| Serviço | Por que é da organização |
|:---|:---|
| atividade | "Minhas tarefas" precisa ser unificado entre produtos |
| notificacao | Notificações do usuário transcendem o produto individual |
| dashboard | Consolidação de dados de faturamento e operação global |
| empresa | Dados cadastrais e governança do cliente |
| cronometro | Tempo do usuário, independe do produto |
| email | Uma inbox por organização, não por produto |
| whatsapp | Uma conversa por contato, não por produto |
| relatorios | Relatórios cruzados entre produtos |
| historico | Auditoria completa, não fragmentada |
| agendamento | Um calendário por usuário |

---

## Catálogo de Serviços de Produto

| Serviço | Por que é produto |
|:---|:---|
| helpdesk | SLAs, agentes e filas são configurados por produto |
| checklist | Cada processo (ex: NF, Booking) tem itens específicos |
| auditoria | O log de alterações pertence ao histórico do produto |
| exportacao | Formatos de arquivos dependem do domínio do produto |

---

## Super-Servidor da Organização — Padrão Monolito Modular

Todos os 11 serviços compartilham um único processo Node.js. Isso elimina a sobrecarga de 11 portas, 11 processos e 11 conexões de banco separadas em dev e em produção.

```
servicos-global/tenant/
├── server/
│   ├── index.ts       ← ÚNICO app.listen() — monta todos os serviceRouters
│   └── lib/
│       └── prisma.ts  ← instância Prisma compartilhada
├── middleware/
│   ├── auth.ts                       ← authMiddleware (x-tenant-id obrigatório)
│   ├── correlation.ts                ← correlationMiddleware (UUID automático)
│   ├── withInternalKeyValidation.ts  ← timingSafeEqual no x-internal-key
│   ├── appError.ts                   ← classe AppError
│   └── errorHandler.ts               ← handler global de erros
└── [nome-do-servico]/
    ├── src/           ← componentes React
    └── server/
        └── routes.ts  ← exporta serviceRouter (sem app.listen!)
```

### Regras do Super-Servidor

- Cada serviço **exporta** `[nome]ServiceRouter` — nunca chama `app.listen()`
- O `server/index.ts` é o único responsável por `bootstrap()` e `app.listen(3001)`
- Serviços com inicialização assíncrona (pg-boss, workers, cron) usam `server/init.ts` separado
- `bootstrap()` é guardado por `NODE_ENV !== 'test'` para não disparar em testes

### Ordem dos Middlewares no Super-Servidor

```typescript
app.use(correlationMiddleware)          // 1. Gera/propaga x-correlation-id
app.get('/health', healthHandler)       // 2. Health check — sem auth
app.use('/webhook', express.raw(...))   // 3. Raw body para webhooks (antes do json)
app.use(express.json())                 // 4. Body parser
app.use(authMiddleware)                 // 5. Exige x-tenant-id (header de protocolo) → 401 se ausente
app.use(withInternalKeyValidation)      // 6. Valida x-internal-key → 403 se inválida
app.use(serviceRouter)                  // 7. Routers dos 11 serviços
app.use(errorHandler)                   // 8. Handler global de erros
```

> **Nota:** o header `x-tenant-id` é nome de protocolo HTTP em uso e não é renomeado por compatibilidade. O valor que ele transporta corresponde ao `id_organizacao` da request.

---

## Estrutura Obrigatória — Serviço da Organização

```text
servicos-global/tenant/[nome-do-servico]/
├── src/
│   ├── [NomeServico].tsx   ← componente principal
│   └── index.ts            ← barrel export
├── server/
│   ├── routes.ts           ← exporta serviceRouter (nunca app.listen!)
│   └── init.ts             ← (opcional) inicialização assíncrona (pg-boss, etc.)
└── prisma/
    └── fragment.prisma     ← modelo de dados (nunca editar schema.prisma diretamente)
```

---

## Estrutura Obrigatória — Serviço de Produto

```text
servicos-global/produto/[nome-do-servico]/
├── src/
│   ├── [NomeServico].tsx   ← componente principal
│   └── index.ts            ← barrel export
├── server/
│   └── routes.ts           ← rotas montadas dentro do servidor do produto
└── prisma/
    └── fragment.prisma     ← composto no schema do produto via compose-schema.js
```

---

## Regra de Autocontido

Cada serviço deve ser **autocontido em termos de deploy e banco de dados**, mas **pode consumir a API de outro serviço como cliente**.

```typescript
// ✅ correto — consumir outro serviço via API
const timers = await fetch('/api/tenant/timers?activity_id=123')

// ❌ proibido — importar código de outro serviço de tenant
import { something } from '../cronometro/src/Cronometro'
```

---

## Como Escrever o fragment.prisma (pós-pivô Schema-per-Organização)

Cada serviço escreve apenas seu próprio fragment. Nunca edita o `schema.prisma` final.

**Regras obrigatórias pós-pivô para todo model:**
- **NÃO** carrega `id_organizacao` como coluna — o schema PostgreSQL **é** a organização
- `id_produto String?` nullable para tabelas que podem ter contexto de produto
- Sem `@@index([id_organizacao, ...])` — desnecessário (schema isola fisicamente)
- Acesso só via SDK `@gravity/tenant-resolver` (`withTenant`/`withTenantContext`)

```prisma
// servicos-global/tenant/atividades/prisma/fragment.prisma

model Activity {
  id         String   @id @default(cuid())
  id_produto String?           // nullable — atividades podem não ter produto
  id_usuario String            // responsável
  title      String
  status     String
  due_date   DateTime?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([id_produto])
  @@index([id_usuario])
  @@index([status, created_at])
}
```

> Durante a janela de migração (ADR-003 Fases 2-3), `id_organizacao` pode permanecer em coluna. Após Fase 4 (Cleanup), é removido via migration.

---

## Como Usar o id_produto nas Queries

Acesso **sempre via SDK** — o `withTenant`/`withTenantContext` aplica `SET LOCAL search_path` para o schema da organização.

```typescript
// Dentro de um produto → só dados daquele produto
const activities = await withTenant(req, async (db) =>
  db.activity.findMany({ where: { id_produto: 'simulador-comex' } })
)

// Na visão unificada "Minhas Atividades" → tudo do usuário
const activities = await withTenant(req, async (db) =>
  db.activity.findMany({ where: { id_usuario: currentUser } })
)

// No Dashboard consolidado → tudo da organização (schema isola)
const count = await withTenant(req, async (db) =>
  db.activity.count({ where: { status: 'pending' } })
)
```

---

## Como o Frontend Integra Serviços da Organização

O shell carrega a navegação e delega para o módulo correto via lazy loading:

```typescript
// nucleo-global/shell/navigation.tsx
const tenantModules = {
  activities: lazy(() => import('@tenant/atividades/src/Atividades')),
  email:      lazy(() => import('@tenant/email/src/Email')),
  whatsapp:   lazy(() => import('@tenant/whatsapp/src/WhatsApp')),
  dashboard:  lazy(() => import('@tenant/dashboard/src/Dashboard')),
  reports:    lazy(() => import('@tenant/relatorios/src/Relatorios')),
  history:    lazy(() => import('@tenant/historico/src/Historico')),
  schedule:   lazy(() => import('@tenant/agendamento/src/Agendamento')),
  gabi:       lazy(() => import('@tenant/gabi/src/Gabi')),
}
```

> O produto declara no `PRODUCT_CONFIG` quais serviços usa e o shell carrega automaticamente. Consultar `antigravity-configurador` para os detalhes do service registry.

---

## Como o Backend Integra Serviços da Organização

```typescript
// produtos/simulador-comex/server/index.ts
import { createOrgProxy } from '@tenant/proxy'
import { PRODUCT_CONFIG } from '../src/shared/config'

// Rotas específicas do produto
app.use('/api/v1/simulacoes', simulacoesRoutes)

// Serviços de produto (template local, banco deste produto)
app.use('/api/v1/helpdesk', helpdeskRoutes)

// Serviços da organização (proxy para servidor externo)
app.use('/api/org', createOrgProxy({
  baseUrl: process.env.TENANT_SERVICES_URL!,
  services: PRODUCT_CONFIG.orgServices
}))
```

---

## Lidando com Latência — Chamadas Paralelas

Quando uma tela precisa de dados de múltiplos serviços da organização, sempre usar `Promise.all` — nunca chamadas em série:

```typescript
// ✅ correto — 3 chamadas em paralelo
const [activities, timers, emails] = await Promise.all([
  orgAPI.get(`/activities?id_usuario=${idUsuario}&id_produto=simulador-comex`),
  orgAPI.get(`/timers?id_usuario=${idUsuario}&active=true`),
  orgAPI.get(`/email?unread=true&limit=5`)
])

// ❌ proibido — chamadas em série desnecessárias
const activities = await orgAPI.get('/activities')
const timers = await orgAPI.get('/timers')
const emails = await orgAPI.get('/email')
```

---

## Tratamento de Indisponibilidade

Se o servidor de serviços da organização cair, os produtos continuam funcionando para tudo que é local. Features da organização ficam temporariamente indisponíveis.

```typescript
function AtividadesWrapper() {
  const { data, error, isLoading } = useOrgService('atividades')

  if (isLoading) return <Loading />
  if (error) return (
    <ServiceUnavailable
      service="atividades"
      message="Serviço temporariamente indisponível. Dados do produto funcionam normalmente."
      retryIn={30}
    />
  )

  return <Atividades data={data} />
}
```

---

## Comunicação entre Módulos — Event Bus

Quando múltiplos serviços da organização estão na mesma tela, eles se comunicam via event bus sem importar código um do outro:

```typescript
import { emit, on } from '@nucleo/shell'

// No Cronômetro: quando o tempo acaba, avisa o sistema
emit('timer:stopped', { activity_id: '123', duration: 3600 })

// Na Atividade: escuta o evento para atualizar o status
on('timer:stopped', ({ activity_id, duration }) => {
  if (activity_id === currentId) refresh()
})
```

---

## Checklist — Antes de Criar um Serviço

- [ ] Definiu a natureza: organização ou produto?
- [ ] Se da organização: dados pertencem à organização e precisam ser unificados?
- [ ] Se de produto: dados têm regras diferentes por produto?
- [ ] Criou a estrutura `src/` + `server/` + `prisma/fragment.prisma`?
- [ ] Fragment **não** tem `id_organizacao` como coluna (schema-per-organização isola fisicamente)?
- [ ] Acesso ao banco somente via SDK `@gravity/tenant-resolver` (`withTenant`/`withTenantContext`)?
- [ ] Índices apenas para campos de domínio (não há mais `@@index([id_organizacao, ...])`)?
- [ ] O serviço não importa código de nenhum outro serviço?
- [ ] Barrel export no `index.ts` do `src/`?
- [ ] Rotas com prefixo `/api/v1/`?
- [ ] `server/routes.ts` exporta `[nome]ServiceRouter` (sem `app.listen()`)?
- [ ] Se tem pg-boss/workers/cron: extraiu para `server/init.ts`?
- [ ] Registrou o `serviceRouter` em `servicos-global/tenant/server/index.ts`?
- [ ] Validação Zod em todas as rotas?
- [ ] Testes unitários e funcionais criados?
