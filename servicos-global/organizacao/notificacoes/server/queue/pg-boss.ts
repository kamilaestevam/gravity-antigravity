import { PgBoss } from 'pg-boss'

let boss: PgBoss

export async function initPgBoss(databaseUrl: string) {
  if (boss) return boss

  if (!databaseUrl) {
    throw new Error('ORGANIZACAO_DATABASE_URL is required to initialize pg-boss')
  }

  boss = new PgBoss(databaseUrl)

  boss.on('error', (error) => console.error('pg-boss error:', error))

  await boss.start()

  // pg-boss v12 exige criação explícita da fila antes de registrar workers
  await boss.createQueue('send-notification', {
    retryLimit: 5,
    retryDelay: 60,
    retryBackoff: true,
    expireInHours: 24,
  })

  console.log('pg-boss started successfully in Notificações service')

  return boss
}

export function getBoss() {
  if (!boss) throw new Error('pg-boss not initialized. Call initPgBoss first.')
  return boss
}
