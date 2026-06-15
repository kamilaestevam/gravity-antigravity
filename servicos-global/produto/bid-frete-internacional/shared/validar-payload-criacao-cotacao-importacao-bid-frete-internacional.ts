/**
 * Valida payload POST /cotacoes montado na importação — paridade CriarCotacaoSchema (server).
 */
import { z } from 'zod'
import { montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional } from './montar-payload-criacao-cotacao-importacao-bid-frete-internacional'
import {
  prepararCamposRotaCotacaoPersistencia,
  type ContextoCatalogoRota,
} from './rota-cotacao-bid-frete-internacional'
import type { LinhaImportacaoBidFreteInternacional } from './tipos-importacao-bid-frete-internacional'

export interface ErroPayloadImportacaoBid {
  campo: string
  mensagem: string
}

const criarCotacaoImportacaoPayloadSchema = z.object({
  id_bid_bid_frete_internacional: z.string().optional(),
  referencia_interna_cotacao_bid_frete_internacional: z.string().optional(),
  tipo_operacao_cotacao_bid_frete_internacional: z.enum(['IMPORTACAO', 'EXPORTACAO']),
  modal_cotacao_bid_frete_internacional: z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO']),
  modalidade_cotacao_bid_frete_internacional: z.enum([
    'FCL',
    'LCL',
    'AEREO_GERAL',
    'RODOVIARIO_FTL',
    'RODOVIARIO_LTL',
  ]),
  porto_origem_cotacao_bid_frete_internacional: z.string().optional(),
  porto_destino_cotacao_bid_frete_internacional: z.string().optional(),
  aeroporto_origem_cotacao_bid_frete_internacional: z.string().optional(),
  aeroporto_destino_cotacao_bid_frete_internacional: z.string().optional(),
  pais_origem_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  pais_destino_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  cidade_origem_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  cidade_destino_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  origem_codigo_cotacao_bid_frete_internacional: z.string().min(1),
  origem_nome_cotacao_bid_frete_internacional: z.string().min(1),
  origem_pais_cotacao_bid_frete_internacional: z.string().min(1),
  destino_codigo_cotacao_bid_frete_internacional: z.string().min(1),
  destino_nome_cotacao_bid_frete_internacional: z.string().min(1),
  destino_pais_cotacao_bid_frete_internacional: z.string().min(1),
  descricao_mercadoria_cotacao_bid_frete_internacional: z.string().min(1),
  ncm_cotacao_bid_frete_internacional: z.string().nullable().optional(),
  quantidade_volume_cotacao_bid_frete_internacional: z.number().int().positive(),
  tipo_container_cotacao_bid_frete_internacional: z.string().optional(),
  peso_kg_cotacao_bid_frete_internacional: z.number().positive().optional(),
  peso_ton_cotacao_bid_frete_internacional: z.number().positive().optional(),
  cubagem_m3_cotacao_bid_frete_internacional: z.number().positive().optional(),
  incoterm_cotacao_bid_frete_internacional: z.string().min(1),
  endereco_origem_cotacao_bid_frete_internacional: z.string().optional(),
  endereco_destino_cotacao_bid_frete_internacional: z.string().optional(),
  zipcode_origem_cotacao_bid_frete_internacional: z.string().optional(),
  zipcode_destino_cotacao_bid_frete_internacional: z.string().optional(),
  valor_meta_cotacao_bid_frete_internacional: z.number().positive().optional(),
  moeda_meta_cotacao_bid_frete_internacional: z.string().optional(),
  visibilidade_cotacao_bid_frete_internacional: z.enum(['DIRECIONADA', 'ABERTA']).optional(),
  anonima_cotacao_bid_frete_internacional: z.boolean().optional(),
  data_limite_resposta_cotacao_bid_frete_internacional: z.string().datetime().optional(),
}).superRefine((data, ctx) => {
  const preparado = prepararCamposRotaCotacaoPersistencia(data)
  if (!preparado.origem_codigo_cotacao_bid_frete_internacional) {
    ctx.addIssue({
      code: 'custom',
      message: 'Origem obrigatória para o modal selecionado',
      path: ['porto_origem_cotacao_bid_frete_internacional'],
    })
  }
  if (!preparado.destino_codigo_cotacao_bid_frete_internacional) {
    ctx.addIssue({
      code: 'custom',
      message: 'Destino obrigatório para o modal selecionado',
      path: ['porto_destino_cotacao_bid_frete_internacional'],
    })
  }
})

function formatarIssueZod(issue: z.ZodIssue): ErroPayloadImportacaoBid {
  const campo = issue.path.length > 0 ? String(issue.path[0]) : 'payload'
  const mensagem = issue.code === 'invalid_type' && issue.received === 'undefined'
    ? 'Campo obrigatório'
    : issue.message
  return { campo, mensagem }
}

export function validarPayloadCriacaoCotacaoImportacaoBidFreteInternacional(
  row: LinhaImportacaoBidFreteInternacional,
  idBid?: string,
  ctx: ContextoCatalogoRota = {},
): ErroPayloadImportacaoBid[] {
  const payload = montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional(row, idBid, ctx)
  const parsed = criarCotacaoImportacaoPayloadSchema.safeParse(payload)
  if (parsed.success) return []
  return parsed.error.issues.map(formatarIssueZod)
}
