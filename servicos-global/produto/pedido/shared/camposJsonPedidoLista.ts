/**
 * camposJsonPedidoLista.ts — Campos do Pedido armazenados em JSON (sem coluna Prisma)
 * que a Lista (ColunasPai) lê no top-level do row (ex: pais_fabricante).
 *
 * Smart Import grava em `dados_extras_importacao_pedido` e/ou `detalhes_operacionais_pedido`.
 * mapPedido deve "superficiar" estes campos para a UI enxergar após importação.
 */

export const CAMPOS_JSON_PEDIDO_LISTA: readonly string[] = [
  // Exportador (detalhes + extras)
  'nome_exportador',
  'endereco_exportador',
  'pais_exportador',
  'estado_exportador',
  'cidade_exportador',
  'zip_code_exportador',
  'exportador_ou_fabricante',
  'relacao_exportador_fabricante',
  'nome_contato_exportador',
  'email_contato_exportador',
  'whatsapp_contato_exportador',
  'cargo_contato_exportador',
  'departamento_contato_exportador',
  'cnpj_exportador',
  // Importador
  'nome_importador',
  'cnpj_importador',
  // Fabricante
  'nome_fabricante',
  'endereco_fabricante',
  'pais_fabricante',
  'estado_fabricante',
  'cidade_fabricante',
  'zip_code_fabricante',
  // OPE (detalhes_operacionais_pedido)
  'codigo_ope',
  'nome_ope',
  'endereco_ope',
  'pais_ope',
  'estado_ope',
  'cidade_ope',
  'zip_code_ope',
  'tin_ope',
  'email_ope',
  'situacao_ope',
  'versao_ope',
  'cnpj_raiz_empresa_responsavel',
] as const

/** Expõe campos JSON no shape plano consumido pelo frontend da Lista. */
export function superficiarCamposJsonPedido(
  extras: Record<string, unknown> | null | undefined,
  detalhes: Record<string, unknown> | null | undefined,
): Record<string, string | null> {
  const ex = extras ?? {}
  const det = detalhes ?? {}
  const out: Record<string, string | null> = {}

  for (const campo of CAMPOS_JSON_PEDIDO_LISTA) {
    const raw = ex[campo] ?? det[campo]
    if (raw === undefined || raw === null) continue
    const s = String(raw).trim()
    if (s.length > 0) out[campo] = s
  }

  return out
}
