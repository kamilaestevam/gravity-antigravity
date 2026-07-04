/**
 * Cliente S2S Pedido → Smart Read (GET leitura/snapshot normalizado).
 */
import { LeituraSchema, type Leitura } from '../../../../smart-read/server/src/schemas/leitura-smart-read.js'
import { AppError } from '../errors/AppError.js'

const SMART_READ_SERVICE_URL = process.env.SMART_READ_SERVICE_URL ?? 'http://127.0.0.1:8033'

export async function obterLeituraSmartReadS2s(params: {
  idOrganizacao: string
  idUsuario: string
  idWorkspace: string
  idLeitura: string
}): Promise<Leitura> {
  const chave = process.env.CHAVE_INTERNA_SERVICO
  if (!chave) {
    throw new AppError('CHAVE_INTERNA_SERVICO nao configurada', 500, 'CONFIG_AUSENTE')
  }

  const url = `${SMART_READ_SERVICE_URL}/api/v1/smart-read/leituras/${encodeURIComponent(params.idLeitura)}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-chave-interna-servico': chave,
      'x-id-organizacao': params.idOrganizacao,
      'x-id-usuario': params.idUsuario,
      'x-id-workspace': params.idWorkspace,
    },
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    const texto = await response.text().catch(() => '')
    throw new AppError(
      `Smart Read indisponivel (${response.status}): ${texto.slice(0, 200)}`,
      response.status === 404 ? 404 : 502,
      'SMART_READ_INDISPONIVEL',
    )
  }

  const raw: unknown = await response.json()
  return LeituraSchema.parse(raw)
}

export async function obterIdSnapshotSmartReadS2s(params: {
  idOrganizacao: string
  idLeitura: string
  idWorkspace: string
}): Promise<string | null> {
  const chave = process.env.CHAVE_INTERNA_SERVICO
  if (!chave) return null

  const qs = new URLSearchParams()
  const url = `${SMART_READ_SERVICE_URL}/api/v1/smart-read/leituras/${encodeURIComponent(params.idLeitura)}/snapshot-id`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-chave-interna-servico': chave,
      'x-id-organizacao': params.idOrganizacao,
      'x-id-workspace': params.idWorkspace,
    },
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null)

  if (!response?.ok) return null
  const raw: unknown = await response.json()
  if (raw && typeof raw === 'object' && 'id_snapshot_leitura_smart_read' in raw) {
    const id = (raw as { id_snapshot_leitura_smart_read: unknown }).id_snapshot_leitura_smart_read
    return typeof id === 'string' ? id : null
  }
  return null
}
