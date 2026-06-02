/**
 * Smoke test produção — convite Clerk não deve apontar para localhost.
 *
 * Uso:
 *   railway service site-usegravity
 *   railway run npx tsx testes/testes-funcionais/configurador/smoke-convite-producao-url.ts
 */
import 'dotenv/config'

const APP_BASE = (process.env.APP_BASE_URL ?? '').replace(/\/$/, '')
const REDIRECT = `${APP_BASE}/cadastro/continuar`

async function main() {
  const erros: string[] = []

  if (!APP_BASE) erros.push('APP_BASE_URL ausente')
  if (APP_BASE.includes('localhost')) erros.push(`APP_BASE_URL aponta para localhost: ${APP_BASE}`)
  if (!APP_BASE.startsWith('https://www.usegravity.com.br')) {
    erros.push(`APP_BASE_URL inesperada: ${APP_BASE} (esperado https://www.usegravity.com.br)`)
  }

  const secret = process.env.CLERK_SECRET_KEY
  if (!secret) erros.push('CLERK_SECRET_KEY ausente')

  const siteRes = await fetch('https://www.usegravity.com.br/cadastro/continuar', { redirect: 'manual' })
  if (![200, 301, 302, 304].includes(siteRes.status)) {
    erros.push(`/cadastro/continuar retornou HTTP ${siteRes.status}`)
  }

  if (secret) {
    const email = `dmmltda+smoke-convite-${Date.now()}@gmail.com`
    const createRes = await fetch('https://api.clerk.com/v1/invitations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        redirect_url: REDIRECT,
      }),
    })
    if (!createRes.ok) {
      const body = await createRes.text()
      erros.push(`Clerk create invitation falhou (${createRes.status}): ${body}`)
    } else {
      const inv = (await createRes.json()) as { id: string; url?: string }
      if ((inv.url ?? '').includes('localhost')) {
        erros.push(`URL do convite contém localhost: ${inv.url}`)
      }
      if (inv.id) {
        await fetch(`https://api.clerk.com/v1/invitations/${inv.id}/revoke`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${secret}` },
        }).catch(() => {})
      }
      console.log(`Convite smoke criado e revogado: ${email}`)
      console.log(`redirect_url enviado: ${REDIRECT}`)
    }
  }

  if (erros.length > 0) {
    console.error('FALHA smoke produção convite:')
    for (const e of erros) console.error(`  - ${e}`)
    process.exit(1)
  }

  console.log('APROVADO smoke produção convite — APP_BASE_URL e Clerk OK')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
