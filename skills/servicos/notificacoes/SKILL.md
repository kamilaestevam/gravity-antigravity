---
name: antigravity-notificacoes
description: "Use esta skill sempre que uma tarefa envolver o serviço de notificações da plataforma Gravity. Define notificações como serviço de organização multicanal: sininho in-app (SSE com fallback polling 30s), email via Resend e WhatsApp condicional via Meta Cloud API. Cobre fila pg-boss com 20 workers paralelos, cron de varredura a cada 5 minutos, 8 tipos de notificação, deduplicação via singletonKey, badge com cap 9+, lookup flexível de usuário (Clerk ID ou email direto) e schema Prisma."
---

# Gravity — Serviço de Notificações

## O Que é Este Serviço

Serviço de organização — um sino por empresa, **cross-produto**. Notificações de qualquer produto chegam no mesmo sino do usuário.

**Três camadas de entrega:**

| Camada | Canal | Quando |
|:---|:---|:---|
| **In-app** | Sininho 🔔 | Sempre — toda notificação |
| **Email** | Resend | Sempre — via template |
| **WhatsApp** | Meta Cloud API | Condicional — por flag na atividade |

---

## Localização na Arquitetura

```text
servicos-global/tenant/notificacoes/
├── src/
│   ├── Notificacoes.tsx        ← dropdown do sino
│   └── index.ts
└── server/
    ├── routes.ts
    ├── notification-worker.ts  ← processamento do job
    ├── job-queue.ts            ← pg-boss setup
    └── cron.ts                 ← varredura a cada 5 min
```

---

## Arquitetura de Fluxo

```
Evento no produto (menção, tarefa, lembrete...)
  ↓
boss.send('send-notification', { type, activityId, idUsuario })
  singletonKey impede duplicatas
  ↓
pg-boss Queue (PostgreSQL)
  20 workers paralelos
  ↓
processNotificationJob()
  1. Busca atividade + workspace + responsáveis
  2. Resolve usuário (Clerk ID para autenticação, dados do Prisma)
  3. Cria notificação in-app (banco)
  4. sendEmail() → Resend
  5. Se flag WA + phone cadastrado → sendTextMessage() → Meta Cloud API
```

---

## Fila de Jobs — pg-boss

```typescript
// job-queue.ts
import PgBoss from 'pg-boss'

const boss = new PgBoss(process.env.TENANT_DATABASE_URL)
await boss.start()

// Worker com 20 jobs paralelos
await boss.work('send-notification', { teamSize: 20 }, async (job) => {
  await processNotificationJob(job.data)
  // throw relança automaticamente para pg-boss retentar
})
```

| Característica | Valor |
|:---|:---|
| Motor | PostgreSQL (mesmo DB da organização) |
| Fila | `send-notification` |
| Concorrência | 20 workers paralelos |
| Retry automático | Sim — `throw err` relança |
| Deduplicação | `singletonKey` por atividade+usuário |

**Enfileirar uma notificação:**

```typescript
await boss.send(
  'send-notification',
  { type: 'reminder', activityId: act.id, idUsuario, idOrganizacao },
  { singletonKey: `reminder-${act.id}-${idUsuario}` }  // sem duplicata
)
```

---

## Camada 1 — In-App (Sininho 🔔)

### SSE como principal + polling como fallback

```typescript
function initNotifications(idUsuario: string) {
  // SSE — tempo real
  const eventSource = new EventSource(`/api/v1/notificacoes/stream?id_usuario=${idUsuario}`)

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'new_notification') {
      appendNotification(data.notification)
      updateBadge(data.unread_count)
    }
  }

  // Fallback — caso SSE caia
  eventSource.onerror = () => {
    eventSource.close()
    startPolling()  // inicia polling 30s como fallback
  }

  // Polling de segurança — sempre ativo em paralelo (intervalo maior)
  setInterval(() => fetch('/api/v1/notificacoes').then(syncState), 30_000)
}
```

### Badge
- Nenhuma não lida: 🔔 (sem número)
- 1-9 não lidas: 🔔 3
- 10+ não lidas: 🔔 **9+**

### Ícones por tipo

| Tipo | Ícone | Cor |
|:---|:---|:---|
| `mentioned` | `ph-at` | `#818cf8` roxo |
| `next-step-assigned` | `ph-arrow-right` | `#10b981` verde |
| Outros | `ph-bell` | `#f59e0b` âmbar |

### Interações
- **Clicar no item** → marca como lida + navega para a atividade
- **Botão ✓** → dispensa (remove otimisticamente sem esperar API)
- **"Marcar todas como lidas"** → atualiza todas de uma vez

---

## Camada 2 — Email (Resend)

| Tipo | Template | Dados |
|:---|:---|:---|
| `mentioned` | `mention` | activity, `mencionadoPor` |
| `task-assigned` | `taskAssigned` | activity, `usuario` |
| `reminder` | `activityReminder` | activity, `usuario` |
| `next-step` | `nextStep` | activity, `usuario` |
| `meeting-invite` | `meetingInvite` | activity, `usuario`, empresa |
| `meeting-summary` | `meetingSummary` | activity, `usuario`, empresa |
| `recording` | `recording` | activity, `recording_url` |
| `gabi-summary` | `gabiSummary` | summary, `usuario` |

---

## Camada 3 — WhatsApp (Condicional)

Enviado **apenas** se a atividade tiver a flag marcada **e** o usuário tiver phone cadastrado:

| Flag na atividade | Tipos que disparam |
|:---|:---|
| `reminder_whatsapp: true` | `reminder`, `task-assigned`, `next-step` |
| `send_invite_whatsapp: true` | `meeting-invite` |
| `send_summary_whatsapp: true` | `meeting-summary` |
| `send_recording_whatsapp: true` | `recording` |

> **Regra:** falha no WhatsApp **não cancela o email** — erro capturado silenciosamente.

---

## Cron de Varredura (a cada 5 minutos)

```typescript
// cron.ts
cron.schedule("*/5 * * * *", async () => {
  await scanReminders()
  await scanNextSteps()
  await scanRecordings()
})
```

| Scan | Condição | Tipo enfileirado |
|:---|:---|:---|
| **A — Lembretes** | `reminder_at <= agora` + `reminder_sent: false` | `reminder` |
| **B — Próximo Passo** | `next_step_date <= amanhã` + `next_step_reminder_sent: false` | `next-step` |
| **C — Gravações** | `recording_url != null` + `recording_sent: false` | `recording` |

Após enfileirar, o campo `*_sent` é marcado `true` para evitar reenvio.

---

## Tipos de Notificação e Gatilhos

| Tipo | Gatilho | WhatsApp? |
|:---|:---|:---|
| `mentioned` | Usuário mencionado com @ em comentário | Não |
| `task-assigned` | Tarefa atribuída a um usuário | Se `reminder_whatsapp` |
| `reminder` | `reminder_at` vencido (cron) | Se `reminder_whatsapp` |
| `next-step` | `next_step_date` próximo (cron) | Se `reminder_whatsapp` |
| `meeting-invite` | Convite de reunião criado | Se `send_invite_whatsapp` |
| `meeting-summary` | Atendimento finalizado | Se `send_summary_whatsapp` |
| `recording` | Gravação enviada | Se `send_recording_whatsapp` |
| `gabi-summary` | Resumo solicitado à Gabi | Não |

---

## Worker — processNotificationJob

```typescript
async function processNotificationJob(data: {
  type: string
  activityId: string | null
  idUsuario: string    // Clerk ID ou email direto
  idOrganizacao: string
  extra?: Record<string, any>
}) {
  const activity = data.activityId
    ? await withTenant(data.idOrganizacao, (db) =>
        db.activity.findUnique({ where: { id: data.activityId }, include: { workspace: true } })
      )
    : null

  const user = await resolveUser(data.idUsuario)

  await withTenant(data.idOrganizacao, (db) =>
    db.notification.create({
      data: {
        id_organizacao: data.idOrganizacao,
        id_usuario:     data.idUsuario,
        type:           data.type,
        title:          buildTitle(data.type, activity),
        message:        buildMessage(data.type, activity, user),
        activity_id:    data.activityId,
      }
    })
  )

  emitToUser(data.idUsuario, 'new_notification', { type: data.type })

  await sendEmail({ to: user.email, template: TEMPLATES[data.type], data: { activity, user, ...data.extra } })

  if (shouldSendWhatsApp(data.type, activity) && user.phone) {
    try {
      await sendTextMessage(user.phone, buildWhatsAppText(data.type, activity))
    } catch (err) {
      console.error('WhatsApp notification failed (non-fatal):', err.message)
    }
  }
}

// Lookup flexível — Clerk ID (autenticação) ou email direto.
// Dados de perfil vêm do Prisma; Clerk só serve para autenticar.
async function resolveUser(idUsuario: string) {
  if (idUsuario.includes('@')) {
    return { email: idUsuario, name: idUsuario.split('@')[0], phone: null }
  }
  // Busca dados de usuário no banco (fonte da verdade — Mandamento 01)
  const usuario = await withTenant(idOrganizacao, (db) =>
    db.usuario.findUnique({ where: { id: idUsuario } })
  )
  return {
    email: usuario.email,
    name:  usuario.nome,
    phone: usuario.telefone ?? null
  }
}
```

---

## Rotas da API

```
# In-app
GET    /api/v1/notificacoes              ← listar 50 mais recentes
GET    /api/v1/notificacoes/stream       ← SSE — canal em tempo real
PUT    /api/v1/notificacoes/:id/read     ← marcar uma como lida
PUT    /api/v1/notificacoes/read-all     ← marcar todas como lidas
DELETE /api/v1/notificacoes/:id          ← dispensar notificação

# Dev
GET    /api/v1/notificacoes/test         ← inserir notificações de teste (dev only)
```

---

## Schema Prisma (fragment.prisma)

```prisma
// servicos-global/tenant/notificacoes/prisma/fragment.prisma

model Notification {
  id              String   @id @default(cuid())
  id_organizacao  String   @map("tenant_id")
  id_usuario      String   @map("user_id")          // Clerk ID ou email direto
  product_id      String?                            // de qual produto veio
  type            String                             // mentioned | task-assigned | reminder | etc.
  title           String?
  message         String
  read            Boolean  @default(false)
  activity_id     String?                            // para navegação direta

  created_at      DateTime @default(now())

  @@index([id_organizacao])
  @@index([id_organizacao, id_usuario])
  @@index([id_organizacao, id_usuario, read])
  @@index([id_organizacao, created_at])
}
```

---

## Checklist — Antes de Entregar

- [ ] SSE funcional com heartbeat 30s e auto-reconexão?
- [ ] Polling de 30s como fallback quando SSE cai?
- [ ] Badge com cap **9+** atualizando em tempo real?
- [ ] Dropdown com 50 mais recentes, não-lidas primeiro?
- [ ] Dispensar item otimisticamente sem esperar API?
- [ ] pg-boss com 20 workers paralelos e retry automático?
- [ ] `singletonKey` impedindo notificações duplicadas?
- [ ] Cron a cada 5 min varrendo lembretes, próximos passos e gravações?
- [ ] Campo `*_sent = true` após enfileirar para evitar reenvio?
- [ ] 8 tipos de notificação com templates de email corretos?
- [ ] WhatsApp condicional por flag na atividade + phone cadastrado?
- [ ] Falha no WhatsApp não cancela email — erro silencioso?
- [ ] Lookup flexível de usuário — Clerk ID ou email direto?
- [ ] `gabi-summary` aceita `activityId: null` e email direto?
- [ ] Fragment.prisma com Notification e índices obrigatórios?
