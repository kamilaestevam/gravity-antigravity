import PgBoss from 'pg-boss'

let boss: PgBoss

export async function initPgBoss(databaseUrl: string): Promise<PgBoss> {
  if (boss) return boss

  if (!databaseUrl) {
    throw new Error('[historico] ORGANIZACAO_DATABASE_URL é obrigatório para inicializar pg-boss')
  }

  boss = new PgBoss(databaseUrl)
  boss.on('error', (error) => console.error('[historico:pg-boss]', error))
  await boss.start()

  console.log('[historico] pg-boss iniciado')
  return boss
}

export function getBoss(): PgBoss {
  if (!boss) throw new Error('[historico] pg-boss não inicializado. Chame initPgBoss primeiro.')
  return boss
}
