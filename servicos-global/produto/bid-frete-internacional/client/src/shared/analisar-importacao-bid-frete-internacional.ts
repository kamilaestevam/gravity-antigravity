/**
 * Análise de planilha de importação BID — POST multipart no servidor.
 */
import { injetarHeaderOverride } from '@gravity/shell'
import { analisarImportacaoBidResponseSchema } from '../../../shared/importacao-analisar-response-bid-frete-internacional'
import type { ModoPlanilhaImportacaoBidFreteInternacional } from '../../../shared/tipos-importacao-bid-frete-internacional'
import { BidFreteApiError, getApiContext } from './api'

const API_BASE = '/api/v1'

function headersMultipart(): Record<string, string> {
  const { idOrganizacao, userId } = getApiContext()
  const customHeaders: Record<string, string> = {
    'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'dev-key',
    ...injetarHeaderOverride(),
    'x-id-organizacao': idOrganizacao,
    'x-id-usuario': userId,
  }

  const idWorkspace =
    sessionStorage.getItem('gravity_id_workspace') ||
    sessionStorage.getItem('gravity_company_id') ||
    ''

  if (idWorkspace) customHeaders['x-id-workspace'] = idWorkspace

  return customHeaders
}

export async function analisarArquivoImportacaoBidFreteInternacional(
  file: File,
  modo: ModoPlanilhaImportacaoBidFreteInternacional,
) {
  const fd = new FormData()
  fd.append('arquivo', file)

  const res = await fetch(
    `${API_BASE}/bid-frete-internacional/importacao/analisar?modo=${modo}`,
    {
      method: 'POST',
      headers: headersMultipart(),
      body: fd,
    },
  )

  const raw = await res.json().catch(() => ({}))
  if (!res.ok) {
    const errBody = raw as { error?: { message?: string; code?: string } }
    throw new BidFreteApiError(
      errBody.error?.message ?? 'Erro ao analisar planilha',
      res.status,
      errBody.error?.code ?? 'ERRO_ANALISE',
    )
  }

  return analisarImportacaoBidResponseSchema.parse(raw)
}
