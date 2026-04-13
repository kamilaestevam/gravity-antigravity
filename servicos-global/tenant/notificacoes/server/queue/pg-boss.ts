import { PgBoss } from 'pg-boss'

let boss: PgBoss

export async function initPgBoss(databaseUrl: string) {
  if (boss) return boss

  if (!databaseUrl) {
    throw new Error('TENANT_DATABASE_URL is required to initialize pg-boss')
  }

  boss = new PgBoss(databaseUrl)

  boss.on('error', (error) => console.error('pg-boss error:', error))

  await boss.start()
  console.log('pg-boss started successfully in Notificações service')

  return boss
}

export function getBoss() {
  if (!boss) throw new Error('pg-boss not initialized. Call initPgBoss first.')
  return boss
}
