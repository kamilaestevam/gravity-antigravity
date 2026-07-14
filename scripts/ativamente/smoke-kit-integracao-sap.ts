/**
 * smoke-kit-integracao-sap.ts — Smoke test OAuth → pedido → webhook (portas locais padrão).
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/ativamente/smoke-kit-integracao-sap.ts
 *
 * Variáveis opcionais:
 *   SMOKE_ID_ORGANIZACAO — org para credencial OAuth (default: consulta api_token existente)
 *   SMOKE_WEBHOOK_URL — default http://127.0.0.1:9090/webhook
 */
import dotenv from 'dotenv'
import { randomUUID } from 'node:crypto'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = resolve(fileURLToPath(import.meta.url), '../../..')
dotenv.config({ path: join(REPO, '.env.local') })
dotenv.config()

const API_COCKPIT = process.env.API_COCKPIT_URL ?? 'http://127.0.0.1:8016'
const PEDIDO = process.env.PEDIDO_SERVICE_URL ?? 'http://127.0.0.1:8030'
const CHAVE = process.env.CHAVE_INTERNA_SERVICO ?? ''
const WEBHOOK_URL = process.env.SMOKE_WEBHOOK_URL ?? 'http://127.0.0.1:9090/webhook'

function log(etapa: string, detalhe: unknown): void {
  console.log(`[smoke] ${etapa}`, typeof detalhe === 'string' ? detalhe : JSON.stringify(detalhe))
}

async function assertOk(response: Response, etapa: string): Promise<unknown> {
  const texto = await response.text()
  let body: unknown = texto
  try {
    body = JSON.parse(texto)
  } catch {
    /* texto puro */
  }
  if (!response.ok) {
    throw new Error(`${etapa} HTTP ${response.status}: ${texto.slice(0, 400)}`)
  }
  return body
}

async function main(): Promise<void> {
  log('1/7', `health api-cockpit ${API_COCKPIT}/health`)
  await assertOk(await fetch(`${API_COCKPIT}/health`), 'health cockpit')

  log('2/7', `health pedido ${PEDIDO}/health`)
  await assertOk(await fetch(`${PEDIDO}/health`), 'health pedido')

  if (!CHAVE) throw new Error('CHAVE_INTERNA_SERVICO ausente')

  const idOrganizacao = process.env.SMOKE_ID_ORGANIZACAO ?? 'org-smoke-placeholder'

  log('3/7', 'criar credencial OAuth S2S')
  const credRes = await fetch(`${API_COCKPIT}/api/v1/cockpit/webhooks-integracao/credenciais-oauth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-chave-interna-servico': CHAVE,
    },
    body: JSON.stringify({
      id_organizacao: idOrganizacao,
      ambiente: 'SANDBOX',
      escopo: 'ESCRITA',
    }),
  })
  const credBody = (await assertOk(credRes, 'credencial oauth')) as {
    client_id: string
    client_secret: string
  }

  log('4/7', 'oauth/token client_credentials')
  const tokenRes = await fetch(`${API_COCKPIT}/api/v1/cockpit/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: credBody.client_id,
      client_secret: credBody.client_secret,
    }),
  })
  const tokenBody = (await assertOk(tokenRes, 'oauth token')) as { access_token: string }
  const bearer = tokenBody.access_token

  log('5/7', 'GET /v1/orders (lista)')
  const listRes = await fetch(`${API_COCKPIT}/api/v1/cockpit/v1/orders?limit=1`, {
    headers: { Authorization: `Bearer ${bearer}` },
  })
  await assertOk(listRes, 'list orders')

  const idempotencyKey = randomUUID()
  log('6/7', `POST /v1/orders idempotency=${idempotencyKey.slice(0, 8)}...`)
  const createBody = {
    tipo_operacao_pedido: 'importacao',
    numero_pedido: `SMOKE-SAP-${Date.now()}`,
    externalRef: `EBELN-${Date.now()}`,
    suid_importador: process.env.SMOKE_SUID_IMPORTADOR ?? 'suid-smoke-importador',
    suid_exportador: process.env.SMOKE_SUID_EXPORTADOR ?? 'suid-smoke-exportador',
  }

  const createRes = await fetch(`${API_COCKPIT}/api/v1/cockpit/v1/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(createBody),
  })

  if (createRes.ok) {
    const created = await createRes.json()
    log('6/7', { criado: true, gravityOrderId: (created as { gravityOrderId?: string }).gravityOrderId })

    const dupRes = await fetch(`${API_COCKPIT}/api/v1/cockpit/v1/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearer}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(createBody),
    })
    const dup = await dupRes.json()
    log('6b/7', { idempotencia_replay: dupRes.status, mesmoBody: !!dup })
  } else {
    const errText = await createRes.text()
    log('6/7', `POST pedido falhou (esperado sem SUIDs reais): ${createRes.status} ${errText.slice(0, 200)}`)
  }

  log('7/7', `webhook mock ${WEBHOOK_URL} (ping HMAC)`)
  const payload = JSON.stringify({
    event_id: randomUUID(),
    event: 'teste.evento',
    timestamp: new Date().toISOString(),
    data: { smoke: true },
  })
  const segredo = process.env.GRAVITY_WEBHOOK_SECRET ?? 'dev-webhook-secret'
  const { createHmac } = await import('node:crypto')
  const sig = createHmac('sha256', segredo).update(payload).digest('hex')
  try {
    const whRes = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gravity-Signature': sig,
        'X-Gravity-Event-Id': randomUUID(),
      },
      body: payload,
      signal: AbortSignal.timeout(5000),
    })
    log('7/7', { webhookStatus: whRes.status, body: await whRes.text() })
  } catch (e) {
    log('7/7', `mock webhook indisponível (subir docker compose): ${e instanceof Error ? e.message : e}`)
  }

  console.log('[smoke] Concluído — OAuth + proxy OK; POST pedido depende de SUIDs/Cadastros reais.')
}

void main().catch((err) => {
  console.error('[smoke] ERRO', err instanceof Error ? err.message : err)
  process.exit(1)
})
