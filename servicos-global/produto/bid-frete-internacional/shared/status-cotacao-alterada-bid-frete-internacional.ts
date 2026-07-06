export const STATUS_COTACAO_POS_ENVIO_FORNECEDOR_BID_FRETE_INTERNACIONAL = [
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
  'AGUARDANDO_APROVACAO',
  'COTACAO_ALTERADA',
] as const

const CAMPOS_PATCH_IGNORAM_MARCA_COTACAO_ALTERADA = new Set([
  'id_workspace',
  'id_usuario',
  'data_criacao_cotacao_bid_frete_internacional',
  'data_aprovacao_cotacao_bid_frete_internacional',
  'data_cancelamento_cotacao_bid_frete_internacional',
  'ganho_valor_cotacao_bid_frete_internacional',
  'ganho_percentual_cotacao_bid_frete_internacional',
  'motivo_reprovacao_cotacao_bid_frete_internacional',
  'motivo_cancelamento_cotacao_bid_frete_internacional',
  'status_cotacao_bid_frete_internacional',
  'id_fornecedor_vencedor_cotacao_bid_frete_internacional',
  'numero_cotacao_bid_frete_internacional',
])

export function statusCotacaoPermiteMarcarAlterada(
  status: string | null | undefined,
): boolean {
  if (!status) return false
  return (STATUS_COTACAO_POS_ENVIO_FORNECEDOR_BID_FRETE_INTERNACIONAL as readonly string[]).includes(status)
}

export function patchDeveMarcarCotacaoAlterada(
  statusAtual: string | null | undefined,
  body: Record<string, unknown>,
): boolean {
  if (!statusCotacaoPermiteMarcarAlterada(statusAtual)) return false
  return Object.keys(body).some((campo) => !CAMPOS_PATCH_IGNORAM_MARCA_COTACAO_ALTERADA.has(campo))
}
