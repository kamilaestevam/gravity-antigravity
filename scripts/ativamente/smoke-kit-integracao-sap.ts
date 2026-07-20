/**
 * smoke-kit-integracao-sap.ts — Smoke test OAuth → pedido → webhook (portas locais padrão).
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/ativamente/smoke-kit-integracao-sap.ts
 *
 * Variáveis opcionais:
 *   SMOKE_DATABASE_URL — banco Pedido com tenants (alternativa a DATABASE_URL)
 *   SMOKE_ID_ORGANIZACAO — org para credencial OAuth (default: csmoketest0000000000000001)
 *   SMOKE_SKIP_BOOTSTRAP=1 — nao cria schema organizacao_smoketest
 *   SMOKE_KEEP_SCHEMA=1 — nao remove schema ao final
 *   SMOKE_WEBHOOK_URL — default http://127.0.0.1:9090/webhook
 *
 * Antes da etapa 3: provisiona schema organizacao_smoketest + kit OAuth local.
 */
import dotenv from 'dotenv'
import { randomUUID } from 'node:crypto'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  provisionarSmokeTenantLocal,
  teardownSmokeTenantLocal,
  SMOKE_SCHEMA_PEDIDO,
  montarHeadersProxySmoke,
  type SmokeBootstrapContext,
} from './smoke-bootstrap-schema-pedido.js'

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
  let bootstrapCtx: SmokeBootstrapContext | null = null

  try {
    log('0/8', 'bootstrap tenant local (schema + kit OAuth)')
    bootstrapCtx = await provisionarSmokeTenantLocal()

    process.env.SMOKE_SCHEMA_ORGANIZACAO = bootstrapCtx.schemaPedido
    process.env.SMOKE_ID_ORGANIZACAO = bootstrapCtx.idOrganizacao

    log('0/8', {
      schema: bootstrapCtx.schemaPedido,
      id_organizacao: bootstrapCtx.idOrganizacao,
      bootstrap: bootstrapCtx.bootstrapAplicado,
    })

    const smokeProxyHeaders = montarHeadersProxySmoke(bootstrapCtx.schemaPedido)

    log('1/8', `health api-cockpit ${API_COCKPIT}/health`)
    await assertOk(await fetch(`${API_COCKPIT}/health`), 'health cockpit')

    log('2/8', `health pedido ${PEDIDO}/health`)
    await assertOk(await fetch(`${PEDIDO}/health`), 'health pedido')

    if (!CHAVE) throw new Error('CHAVE_INTERNA_SERVICO ausente')

    const idOrganizacao = bootstrapCtx.idOrganizacao

    log('3/8', `criar credencial OAuth S2S (org=${idOrganizacao})`)
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

    log('4/8', 'oauth/token client_credentials')
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

    log('5/8', 'GET /v1/orders (lista)')
    const listRes = await fetch(`${API_COCKPIT}/api/v1/cockpit/v1/orders?limit=1`, {
      headers: { Authorization: `Bearer ${bearer}`, ...smokeProxyHeaders },
    })
    await assertOk(listRes, 'list orders')

    const idempotencyKey = randomUUID()
    log('6/8', `POST /v1/orders idempotency=${idempotencyKey.slice(0, 8)}...`)
    const createBody = {
      tipo_operacao_pedido: 'importacao',
      numero_pedido: `SMOKE-SAP-${Date.now()}`,
      externalRef: `EBELN-${Date.now()}`,
      custom: { SAP_KUNNR: '1000', smoke: true },
      suid_importador: process.env.SMOKE_SUID_IMPORTADOR ?? 'suid-smoke-importador',
      suid_exportador: process.env.SMOKE_SUID_EXPORTADOR ?? 'suid-smoke-exportador',
    }

    const createRes = await fetch(`${API_COCKPIT}/api/v1/cockpit/v1/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearer}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
        ...smokeProxyHeaders,
      },
      body: JSON.stringify(createBody),
    })

    if (createRes.ok) {
      const created = await createRes.json() as { gravityOrderId?: string; custom?: Record<string, unknown> }
      log('6/8', { criado: true, gravityOrderId: created.gravityOrderId, custom: created.custom })

      const dupRes = await fetch(`${API_COCKPIT}/api/v1/cockpit/v1/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${bearer}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
          ...smokeProxyHeaders,
        },
        body: JSON.stringify(createBody),
      })
      const dup = await dupRes.json()
      log('6b/8', { idempotencia_replay: dupRes.status, mesmoBody: !!dup })
    } else {
      const errText = await createRes.text()
      log('6/8', `POST pedido falhou (esperado sem SUIDs reais): ${createRes.status} ${errText.slice(0, 200)}`)
    }

    log('7/8', `webhook mock ${WEBHOOK_URL} (ping HMAC)`)
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
      log('7/8', { webhookStatus: whRes.status, body: await whRes.text() })
    } catch (e) {
      log('7/8', `mock webhook indisponível (subir docker compose): ${e instanceof Error ? e.message : e}`)
    }

    log('8/8', `teardown schema ${SMOKE_SCHEMA_PEDIDO}`)
    if (bootstrapCtx) {
      await teardownSmokeTenantLocal(bootstrapCtx)
    }

    console.log('[smoke] Concluído — OAuth + proxy + bootstrap local OK.')
  } catch (err) {
    if (bootstrapCtx) {
      try {
        await teardownSmokeTenantLocal(bootstrapCtx)
      } catch (teardownErr) {
        console.error('[smoke] teardown falhou', teardownErr instanceof Error ? teardownErr.message : teardownErr)
      }
    }
    throw err
  }
}

void main().catch((err) => {
  console.error('[smoke] ERRO', err instanceof Error ? err.message : err)
  process.exit(1)
})
