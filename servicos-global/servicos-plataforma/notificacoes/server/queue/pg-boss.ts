import { PgBoss } from 'pg-boss'

let boss: PgBoss | undefined
let usingSharedBoss = false

const SEND_NOTIFICATION_QUEUE = 'send-notification'

/** Reusa a instância pg-boss do historico-global no cfg-back / org (uma instância por processo). */
export function setSharedBoss(shared: PgBoss): void {
  if (boss && !usingSharedBoss) {
    console.warn('[notificacoes] pg-boss próprio já inicializado; ignorando setSharedBoss')
    return
  }
  boss = shared
  usingSharedBoss = true
}

export async function initPgBoss(databaseUrl: string): Promise<PgBoss> {
  if (boss) return boss

  if (!databaseUrl) {
    throw new Error('ORGANIZACAO_DATABASE_URL is required to initialize pg-boss')
  }

  boss = new PgBoss(databaseUrl)
  boss.on('error', (error) => console.error('[notificacoes:pg-boss]', error))
  await boss.start()

  await ensureSendNotificationQueue()

  console.log('[notificacoes] pg-boss iniciado (instância própria)')
  return boss
}

export async function ensureSendNotificationQueue(): Promise<void> {
  const b = getBoss()
  await b.createQueue(SEND_NOTIFICATION_QUEUE).catch(() => { /* já existe */ })
}

export function getBoss(): PgBoss {
  if (!boss) throw new Error('pg-boss not initialized. Call initPgBoss or setSharedBoss first.')
  return boss
}
