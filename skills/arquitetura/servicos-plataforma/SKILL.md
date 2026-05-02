---
name: antigravity-servicos-plataforma
description: "Use esta skill sempre que uma tarefa envolver criação, modificação ou uso de serviços da organizacao ou serviços de produto do projeto Gravity. Define a diferença entre as duas naturezas de serviço, a estrutura obrigatória de pastas, as regras de autocontido, como expor fragment.prisma (pós-pivô Schema-per-Organizacao) e como o frontend integra os serviços. Todo agente consulta esta skill antes de criar ou modificar qualquer serviço."
---

# Gravity — Serviços de Organizacao e de Produto

## As Duas Naturezas de Serviço

Dentro de `servicos-global` existem duas categorias fundamentalmente diferentes. Esta distinção define onde os dados vivem e como a experiência unificada entre produtos é possível.

### Serviços da Organizacao

Existem uma vez por organizacao, independente de quantos produtos ela use. O email é da organizacao, não do produto. As atividades precisam aparecer unificadas em todos os produtos. O dashboard consolida KPIs de tudo.

- **Todos os 11 serviços rodam em processo único — o super-servidor de organizacao (porta 3001)**
- Cada serviço exporta um `serviceRouter`; o super-servidor (`servicos-global/servicos-plataforma/server/index.ts`) é o único `app.listen()`
- Acessados por todos os produtos via API REST
- Após o pivô Schema-per-Organizacao (2026-04-17), o **isolamento é feito pelo schema PostgreSQL** via SDK `@gravity/resolver-organizacao` (`withOrganizacao`/`withOrganizacaoContext`); models não carregam mais `id_organizacao` como coluna

### Serviços de Produto

São templates de funcionalidade reutilizáveis, mas os dados pertencem ao produto que os instancia. O helpdesk do NF Importação tem SLAs diferentes do helpdesk do Simulador Comex.

- O código é compartilhado — o banco é de cada produto
- Rodam dentro do servidor do produto, não em servidor separado
- Expõem `fragment.prisma` para composição no schema do produto

---

## Tabela Comparativa

| Característica | nucleo-global | servicos-global/servicos-plataforma | servicos-global/produto |
|:---|:---|:---|:---|
| Tem estado próprio? | ❌ Não | ✅ Sim | ✅ Sim |
| Tem backend? | ❌ Nunca | ✅ Sempre | ✅ Sempre |
| Banco próprio? | ❌ Nunca | ✅ Banco compartilhado da organizacao (schema-per-organizacao) | ❌ Banco do produto (schema-per-organizacao) |
| Chama API externa? | ❌ Nunca | ✅ Pode | ✅ Pode |
| Funciona offline? | ✅ Sempre | ❌ Não | ❌ Não |
| Roda onde? | No produto | Super-servidor `:3001` | Dentro do produto |

---

## Catálogo de Serviços da Organizacao

| Serviço | Por que é da organizacao |
|:---|:---|
| atividade | "Minhas tarefas" precisa ser unificado entre produtos |
| notificacao | Notificações do usuário transcendem o produto individual |
| dashboard | Consolidação de dados de faturamento e operação global |
| empresa | Dados cadastrais e governança do cliente |
| cronometro | Tempo do usuário, independe do produto |
| email | Uma inbox por organizacao, não por produto |
| whatsapp | Uma conversa por contato, não por produto |
| relatorios | Relatórios cruzados entre produtos |
| historico | Auditoria completa, não fragmentada |
| agendamento | Um calendário por usuário |
| gabi | Assistente IA com contexto cross-produto da organizacao |

---

## Catálogo de Serviços de Produto

| Serviço | Por que é produto |
|:---|:---|
| helpdesk | SLAs, agentes e filas são configurados por produto |
| checklist | Cada processo (ex: NF, Booking) tem itens específicos |
| auditoria | O log de alterações pertence ao histórico do produto |
| exportacao | Formatos de arquivos dependem do domínio do produto |

---

## Super-Servidor da Organizacao — Padrão Monolito Modular

Todos os 11 serviços compartilham um único processo Node.js. Isso elimina a sobrecarga de 11 portas, 11 processos e 11 conexões de banco separadas em dev e em produção.

```
servicos-global/servicos-plataforma/
├── server/
│   ├── index.ts       ← ÚNICO app.listen() — monta todos os serviceRouters
│   └── lib/
│       └── prisma.ts  ← instância Prisma compartilhada
├── middleware/
│   ├── auth.ts                       ← authMiddleware (x-tenant-id obrigatório)
│   ├── correlation.ts                ← correlationMiddleware (SUID automático)
│   ├── withInternalKeyValidation.ts  ← timingSafeEqual no x-chave-interna
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

> ⚠️ **REGRA ABSOLUTA:** A ordem geral de middlewares (correlation → health → parse → auth → erro) vive em [Observabilidade](../observabilidade/SKILL.md). Específico do super-servidor da organizacao: o `authMiddleware` exige header `x-tenant-id` (legacy, preservado por compatibilidade — o valor corresponde a `id_organizacao`), e logo depois entra `withInternalKeyValidation` que faz `timingSafeEqual` em `x-chave-interna` e devolve 403 se inválida.

---

## Estrutura Obrigatória — Serviço da Organizacao

```text
servicos-global/servicos-plataforma/[nome-do-servico]/
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
const timers = await fetch('/api/organizacao/timers?activity_id=123')

// ❌ proibido — importar código de outro serviço de organizacao
import { something } from '../cronometro/src/Cronometro'
```

---

## Como Escrever o fragment.prisma (pós-pivô Schema-per-Organizacao)

Cada serviço escreve apenas seu próprio fragment. Nunca edita o `schema.prisma` final.

**Regras obrigatórias pós-pivô para todo model:**
- **NÃO** carrega `id_organizacao` como coluna — o schema PostgreSQL **é** a organizacao
- `id_produto String?` nullable para tabelas que podem ter contexto de produto
- Sem `@@index([id_organizacao, ...])` — desnecessário (schema isola fisicamente)
- Acesso só via SDK `@gravity/resolver-organizacao` (`withOrganizacao`/`withOrganizacaoContext`)

```prisma
// servicos-global/servicos-plataforma/atividades/prisma/fragment.prisma

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

---

## Como Usar o id_produto nas Queries

Acesso **sempre via SDK** — o `withOrganizacao`/`withOrganizacaoContext` aplica `SET LOCAL search_path` para o schema da organizacao.

```typescript
// Dentro de um produto → só dados daquele produto
const activities = await withOrganizacao(req, async (db) =>
  db.activity.findMany({ where: { id_produto: 'simulador-comex' } })
)

// Na visão unificada "Minhas Atividades" → tudo do usuário
const activities = await withOrganizacao(req, async (db) =>
  db.activity.findMany({ where: { id_usuario: currentUser } })
)

// No Dashboard consolidado → tudo da organizacao (schema isola)
const count = await withOrganizacao(req, async (db) =>
  db.activity.count({ where: { status: 'pending' } })
)
```

---

## Como o Frontend Integra Serviços da Organizacao

O shell carrega a navegação e delega para o módulo correto via lazy loading:

```typescript
// nucleo-global/shell/navigation.tsx
const tenantModules = {
  atividades:  lazy(() => import('@tenant/atividades/src/Atividades')),
  email:       lazy(() => import('@tenant/email/src/Email')),
  whatsapp:    lazy(() => import('@tenant/whatsapp/src/WhatsApp')),
  dashboard:   lazy(() => import('@tenant/dashboard/src/Dashboard')),
  relatorios:  lazy(() => import('@tenant/relatorios/src/Relatorios')),
  historico:   lazy(() => import('@tenant/historico/src/Historico')),
  agendamento: lazy(() => import('@tenant/agendamento/src/Agendamento')),
  gabi:        lazy(() => import('@tenant/gabi/src/Gabi')),
}
```

> O produto declara no `PRODUCT_CONFIG` quais serviços usa e o shell carrega automaticamente. Consultar `antigravity-configurador` para os detalhes do service registry.

---

## Como o Backend Integra Serviços da Organizacao

```typescript
// produtos/simulador-comex/server/index.ts
// alias '@tenant/proxy' precisa estar em createTenantAliases(monorepoRoot, ['proxy', ...]) no vite.config
import { createOrganizacaoProxy } from '@tenant/proxy'
import { PRODUCT_CONFIG } from '../src/shared/config'

// Rotas específicas do produto
app.use('/api/v1/simulacoes', simulacoesRoutes)

// Serviços de produto (template local, banco deste produto)
app.use('/api/v1/helpdesk', helpdeskRoutes)

// Serviços da organizacao (proxy para servidor externo)
app.use('/api/organizacao', createOrganizacaoProxy({
  baseUrl: process.env.ORGANIZACAO_SERVICES_URL!,
  services: PRODUCT_CONFIG.organizacaoServices
}))
```

---

## Lidando com Latência — Chamadas Paralelas

> ⚠️ **REGRA ABSOLUTA:** Nunca usar `Promise.all` para chamadas em paralelo de serviços. O padrão oficial de degradação graciosa com `Promise.allSettled` vive em [Resiliência](../resiliencia/SKILL.md).

Quando uma tela precisa de dados de múltiplos serviços da organizacao, sempre usar `Promise.allSettled` — assim uma falha pontual de um serviço não derruba a tela inteira:

```typescript
// ✅ correto — 3 chamadas em paralelo, cada falha isolada
const [activitiesR, timersR, emailsR] = await Promise.allSettled([
  organizacaoAPI.get(`/activities?id_usuario=${idUsuario}&id_produto=simulador-comex`),
  organizacaoAPI.get(`/timers?id_usuario=${idUsuario}&active=true`),
  organizacaoAPI.get(`/email?unread=true&limit=5`),
])

const activities = activitiesR.status === 'fulfilled' ? activitiesR.value : null
const timers     = timersR.status     === 'fulfilled' ? timersR.value     : null
const emails     = emailsR.status     === 'fulfilled' ? emailsR.value     : null

// ❌ proibido — chamadas em série desnecessárias
const activities = await organizacaoAPI.get('/activities')
const timers     = await organizacaoAPI.get('/timers')
const emails     = await organizacaoAPI.get('/email')
```

---

## Tratamento de Indisponibilidade

> ⚠️ **REGRA ABSOLUTA:** O padrão de degradação graciosa (hook `useOrganizacaoService` retornando `{ data, error, isLoading }`, fallback `<ServiceUnavailable>` com retry) vive em [Resiliência](../resiliencia/SKILL.md).

---

## Comunicação entre Módulos — Event Bus

Quando múltiplos serviços da organizacao estão na mesma tela, eles se comunicam via event bus sem importar código um do outro:

```typescript
import { emit, on } from '@gravity/shell'

// No Cronômetro: quando o tempo acaba, avisa o sistema
emit('timer:stopped', { activity_id: '123', duration: 3600 })

// Na Atividade: escuta o evento para atualizar o status
on('timer:stopped', ({ activity_id, duration }) => {
  if (activity_id === currentId) refresh()
})
```

---

## Checklist — Antes de Criar um Serviço

- [ ] Definiu a natureza: organizacao ou produto?
- [ ] Se da organizacao: dados pertencem à organizacao e precisam ser unificados?
- [ ] Se de produto: dados têm regras diferentes por produto?
- [ ] Criou a estrutura `src/` + `server/` + `prisma/fragment.prisma`?
- [ ] Fragment **não** tem `id_organizacao` como coluna (schema-per-organizacao isola fisicamente)?
- [ ] Acesso ao banco somente via SDK `@gravity/resolver-organizacao` (`withOrganizacao`/`withOrganizacaoContext`)?
- [ ] Índices apenas para campos de domínio (não há mais `@@index([id_organizacao, ...])`)?
- [ ] O serviço não importa código de nenhum outro serviço?
- [ ] Barrel export no `index.ts` do `src/`?
- [ ] Rotas com prefixo `/api/v1/`?
- [ ] `server/routes.ts` exporta `[nome]ServiceRouter` (sem `app.listen()`)?
- [ ] Se tem pg-boss/workers/cron: extraiu para `server/init.ts`?
- [ ] Registrou o `serviceRouter` em `servicos-global/servicos-plataforma/server/index.ts`?
- [ ] Validação Zod em todas as rotas?
- [ ] Testes unitários e funcionais criados?
