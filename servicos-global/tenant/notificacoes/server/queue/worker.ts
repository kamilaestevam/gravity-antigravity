import { getBoss } from './pg-boss'

// Simulated Prisma and Clerk clients for now. In a real app, these would come from
// a shared lib or context.
const prisma = {} as any 
const clerkClient = { users: { getUser: async (id: string) => ({ emailAddresses: [{ emailAddress: '' }], firstName: '', lastName: '', phoneNumbers: [{ phoneNumber: '' }] }) } } as any
const TEMPLATES: Record<string, string> = {}

export async function processNotificationJob(data: {
  type: string
  activityId: string | null
  userId: string    // Clerk ID ou email direto
  tenantId: string
  extra?: Record<string, any>
}) {
  const activity = data.activityId
    ? await prisma.activity.findUnique({ where: { id: data.activityId }, include: { company: true } })
    : null

  const user = await resolveUser(data.userId)

  await prisma.notification.create({
    data: {
      tenant_id:   data.tenantId,
      user_id:     data.userId,
      type:        data.type,
      title:       buildTitle(data.type, activity),
      message:     buildMessage(data.type, activity, user),
      activity_id: data.activityId,
    }
  })

  emitToUser(data.userId, 'new_notification', { type: data.type })

  await sendEmail({ to: user.email, template: TEMPLATES[data.type], data: { activity, user, ...data.extra } })

  if (shouldSendWhatsApp(data.type, activity) && user.phone) {
    try {
      await sendTextMessage(user.phone, buildWhatsAppText(data.type, activity))
    } catch (err: any) {
      console.error('WhatsApp notification failed (non-fatal):', err.message)
    }
  }
}

async function resolveUser(userId: string) {
  if (userId.includes('@')) {
    return { email: userId, name: userId.split('@')[0], phone: null }
  }
  const clerkUser = await clerkClient.users.getUser(userId)
  return {
    email: clerkUser.emailAddresses[0].emailAddress,
    name:  `${clerkUser.firstName} ${clerkUser.lastName}`,
    phone: clerkUser.phoneNumbers[0]?.phoneNumber || null
  }
}

function buildTitle(type: string, activity: any) { return 'Title' }
function buildMessage(type: string, activity: any, user: any) { return 'Message' }
function emitToUser(userId: string, event: string, payload: any) { console.log('Emitting SSE', userId, event, payload) }
async function sendEmail(args: any) { console.log('Sending Email', args) }
function shouldSendWhatsApp(type: string, activity: any) { return false }
async function sendTextMessage(phone: string, text: string) { console.log('Sending WA', phone, text) }
function buildWhatsAppText(type: string, activity: any) { return 'WA Text' }

export async function startWorker() {
  const boss = getBoss()
  await boss.work('send-notification', { teamConcurrency: 20 }, async (job) => {
    try {
      await processNotificationJob(job.data as any)
    } catch (err) {
      console.error('Failed to process notification job', err)
      throw err // triggers pg-boss retry
    }
  })
  console.log('Worker listening on send-notification queue with concurrency 20')
}
