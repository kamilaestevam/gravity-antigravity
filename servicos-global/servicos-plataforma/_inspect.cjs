const { PrismaClient } = require('./generated/index.js');
const prisma = new PrismaClient();
(async () => {
  for (const tab of ['notificacoes_titulo_corpo', 'contato_externo', 'configuracao_canal_tenant', 'configuracao_canal_organizacao']) {
    try {
      const cols = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='${tab}' ORDER BY ordinal_position`);
      console.log(`\n${tab}:`, cols.length ? cols.map(c => c.column_name).join(', ') : '(nao existe)');
    } catch (e) { console.log(`${tab}: ERR`, e.message) }
  }
  await prisma.$disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });
