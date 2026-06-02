import { z } from 'zod'

const classificacaoBidFreteInternacionalSchema = z.object({
  id_classificacao_bid_frete_internacional: z.string().optional(),
  email_fornecedor_classificacao_bid_frete_internacional: z.string().optional(),
  total_cotacoes_recebidas_classificacao_bid_frete_internacional: z.number().optional(),
  total_cotacoes_respondidas_classificacao_bid_frete_internacional: z.number().optional(),
  total_cotacoes_aprovadas_classificacao_bid_frete_internacional: z.number().optional(),
  taxa_resposta_classificacao_bid_frete_internacional: z.number().optional(),
  taxa_aprovacao_classificacao_bid_frete_internacional: z.number().optional(),
  tempo_medio_resposta_horas_classificacao_bid_frete_internacional: z.number().optional(),
  nota_global_classificacao_bid_frete_internacional: z.number().optional(),
  media_frete_classificacao_bid_frete_internacional: z.number().optional(),
  media_atendimento_classificacao_bid_frete_internacional: z.number().optional(),
  media_resposta_classificacao_bid_frete_internacional: z.number().optional(),
  media_confiabilidade_classificacao_bid_frete_internacional: z.number().optional(),
}).nullable()

export const visaoFornecedorBidFreteInternacionalDashboardResponseSchema = z.object({
  visao_fornecedor_bid_frete_internacional: z.object({
    fornecedor_bid_frete_internacional: z.object({
      id_fornecedor_bid_frete_internacional: z.string(),
      nome_fornecedor_bid_frete_internacional: z.string(),
      tipo_fornecedor_bid_frete_internacional: z.string(),
    }),
    metricas_visao_fornecedor_bid_frete_internacional: z.object({
      cotacoes_pendentes_visao_fornecedor_bid_frete_internacional: z.number(),
      propostas_enviadas_visao_fornecedor_bid_frete_internacional: z.number(),
      propostas_aprovadas_visao_fornecedor_bid_frete_internacional: z.number(),
      propostas_em_analise_visao_fornecedor_bid_frete_internacional: z.number(),
      propostas_reprovadas_visao_fornecedor_bid_frete_internacional: z.number(),
      disparos_recebidos_visao_fornecedor_bid_frete_internacional: z.number(),
      taxa_resposta_visao_fornecedor_bid_frete_internacional: z.string(),
      taxa_aprovacao_visao_fornecedor_bid_frete_internacional: z.string(),
    }),
    funil_visao_fornecedor_bid_frete_internacional: z.array(
      z.object({
        rotulo_funil_visao_fornecedor_bid_frete_internacional: z.string(),
        quantidade_funil_visao_fornecedor_bid_frete_internacional: z.number(),
        cor_funil_visao_fornecedor_bid_frete_internacional: z.string(),
      }),
    ),
    alertas_visao_fornecedor_bid_frete_internacional: z.array(
      z.object({
        rotulo_alerta_visao_fornecedor_bid_frete_internacional: z.string(),
        quantidade_alerta_visao_fornecedor_bid_frete_internacional: z.number(),
        tom_alerta_visao_fornecedor_bid_frete_internacional: z.enum(['amber', 'rose', 'emerald', 'blue']),
        rota_alerta_visao_fornecedor_bid_frete_internacional: z.string(),
      }),
    ),
    classificacao_bid_frete_internacional: classificacaoBidFreteInternacionalSchema,
  }),
})

export const visaoFornecedorBidFreteInternacionalCotacoesPendentesResponseSchema = z.object({
  visao_fornecedor_bid_frete_internacional: z.object({
    disparos_cotacao_bid_frete_internacional: z.array(z.record(z.string(), z.unknown())),
  }),
})

export const visaoFornecedorBidFreteInternacionalPropostasResponseSchema = z.object({
  visao_fornecedor_bid_frete_internacional: z.object({
    propostas_bid_frete_internacional: z.array(z.record(z.string(), z.unknown())),
    paginacao_visao_fornecedor_bid_frete_internacional: z.object({
      pagina: z.number(),
      limite: z.number(),
      total: z.number(),
      paginas: z.number(),
    }),
  }),
})

export const visaoFornecedorBidFreteInternacionalDesempenhoResponseSchema = z.object({
  visao_fornecedor_bid_frete_internacional: z.object({
    classificacao_bid_frete_internacional: classificacaoBidFreteInternacionalSchema,
    avaliacoes_bid_frete_internacional: z.array(z.record(z.string(), z.unknown())),
  }),
})

const modoAcessoRespostaDisparoSchema = z.enum(['criar', 'editar', 'bloqueado'])

const codigoBloqueioRespostaDisparoSchema = z.enum([
  'TOKEN_INVALID',
  'TOKEN_EXPIRED',
  'COTACAO_APROVADA',
  'COTACAO_REPROVADA',
  'COTACAO_CANCELADA',
  'COTACAO_EXPIRADA',
  'PROPOSTA_APROVADA',
  'PROPOSTA_REPROVADA',
  'PRAZO_RESPOSTA_ENCERRADO',
]).nullable()

export const visaoFornecedorBidFreteInternacionalPublicoDisparoResponseSchema = z.object({
  visao_fornecedor_bid_frete_internacional_publico: z.object({
    disparo_cotacao_bid_frete_internacional: z.record(z.string(), z.unknown()),
    modo_acesso_resposta_disparo_bid_frete_internacional: modoAcessoRespostaDisparoSchema,
    codigo_bloqueio_resposta_disparo_bid_frete_internacional: codigoBloqueioRespostaDisparoSchema,
  }),
})

export const visaoFornecedorBidFreteInternacionalTabelasValorResponseSchema = z.object({
  visao_fornecedor_bid_frete_internacional: z.object({
    tabelas_bid_frete_internacional: z.array(z.record(z.string(), z.unknown())),
  }),
})

export const visaoFornecedorBidFreteInternacionalTabelaValorItemResponseSchema = z.object({
  visao_fornecedor_bid_frete_internacional: z.object({
    tabela_bid_frete_internacional: z.record(z.string(), z.unknown()),
  }),
})

export const visaoFornecedorBidFreteInternacionalEnviarPropostaResponseSchema = z.object({
  visao_fornecedor_bid_frete_internacional: z.object({
    proposta_bid_frete_internacional: z.record(z.string(), z.unknown()),
  }),
})

export const visaoFornecedorBidFreteInternacionalPublicoEnviarPropostaResponseSchema = z.object({
  visao_fornecedor_bid_frete_internacional_publico: z.object({
    sucesso_envio_proposta_visao_fornecedor_bid_frete_internacional: z.boolean(),
    mensagem_visao_fornecedor_bid_frete_internacional_publico: z.string(),
    modo_acesso_resposta_disparo_bid_frete_internacional: modoAcessoRespostaDisparoSchema.optional(),
    proposta_bid_frete_internacional: z.record(z.string(), z.unknown()).optional(),
  }),
})

export type ModoAcessoRespostaDisparoBidFreteInternacional = z.infer<typeof modoAcessoRespostaDisparoSchema>
export type CodigoBloqueioRespostaDisparoBidFreteInternacional = z.infer<typeof codigoBloqueioRespostaDisparoSchema>

export type VisaoFornecedorBidFreteInternacionalDashboard =
  z.infer<typeof visaoFornecedorBidFreteInternacionalDashboardResponseSchema>['visao_fornecedor_bid_frete_internacional']

export type MetricasVisaoFornecedorBidFreteInternacional =
  VisaoFornecedorBidFreteInternacionalDashboard['metricas_visao_fornecedor_bid_frete_internacional']

export interface DesempenhoVisaoFornecedorBidFreteInternacional {
  nota_global_classificacao_bid_frete_internacional: number
  cotacoes_recebidas: number
  cotacoes_respondidas: number
  cotacoes_aprovadas: number
  tempo_medio_horas: number
  categorias: {
    frete: number
    atendimento: number
    prazo: number
    confiabilidade: number
  }
  avaliacoes_recentes: Array<{
    id_avaliacao_bid_frete_internacional: string
    nota_geral_avaliacao_bid_frete_internacional: number
    comentario_avaliacao_bid_frete_internacional: string | null
    data_criacao_avaliacao_bid_frete_internacional: string
    numero_cotacao_bid_frete_internacional: string | null
  }>
}

export function mapDesempenhoVisaoFornecedorFromServer(
  raw: z.infer<typeof visaoFornecedorBidFreteInternacionalDesempenhoResponseSchema>,
): DesempenhoVisaoFornecedorBidFreteInternacional {
  const visao = raw.visao_fornecedor_bid_frete_internacional
  const classificacao = visao.classificacao_bid_frete_internacional
  return {
    nota_global_classificacao_bid_frete_internacional:
      classificacao?.nota_global_classificacao_bid_frete_internacional ?? 0,
    cotacoes_recebidas: classificacao?.total_cotacoes_recebidas_classificacao_bid_frete_internacional ?? 0,
    cotacoes_respondidas: classificacao?.total_cotacoes_respondidas_classificacao_bid_frete_internacional ?? 0,
    cotacoes_aprovadas: classificacao?.total_cotacoes_aprovadas_classificacao_bid_frete_internacional ?? 0,
    tempo_medio_horas: classificacao?.tempo_medio_resposta_horas_classificacao_bid_frete_internacional ?? 0,
    categorias: {
      frete: classificacao?.media_frete_classificacao_bid_frete_internacional ?? 0,
      atendimento: classificacao?.media_atendimento_classificacao_bid_frete_internacional ?? 0,
      prazo: classificacao?.media_resposta_classificacao_bid_frete_internacional ?? 0,
      confiabilidade: classificacao?.media_confiabilidade_classificacao_bid_frete_internacional ?? 0,
    },
    avaliacoes_recentes: visao.avaliacoes_bid_frete_internacional.map((a) => ({
      id_avaliacao_bid_frete_internacional: String(a.id_avaliacao_bid_frete_internacional ?? ''),
      nota_geral_avaliacao_bid_frete_internacional: Number(a.nota_geral_avaliacao_bid_frete_internacional ?? 0),
      comentario_avaliacao_bid_frete_internacional:
        (a.comentario_avaliacao_bid_frete_internacional as string | null | undefined) ?? null,
      data_criacao_avaliacao_bid_frete_internacional: String(
        a.data_criacao_avaliacao_bid_frete_internacional ?? '',
      ),
      numero_cotacao_bid_frete_internacional: null,
    })),
  }
}

export type EtapaFunilVisaoFornecedorBidFreteInternacional = {
  rotulo: string
  quantidade: number
  cor: string
}

export type AlertaVisaoFornecedorBidFreteInternacional = {
  rotulo: string
  quantidade: number
  tom: 'amber' | 'rose' | 'emerald' | 'blue'
  rota: string
}

export function mapDashboardMetricasFromServer(
  metricas: MetricasVisaoFornecedorBidFreteInternacional,
  classificacao: z.infer<typeof classificacaoBidFreteInternacionalSchema>,
) {
  return {
    pendentes: metricas.cotacoes_pendentes_visao_fornecedor_bid_frete_internacional,
    propostas_enviadas: metricas.propostas_enviadas_visao_fornecedor_bid_frete_internacional,
    propostas_aprovadas: metricas.propostas_aprovadas_visao_fornecedor_bid_frete_internacional,
    propostas_em_analise: metricas.propostas_em_analise_visao_fornecedor_bid_frete_internacional,
    propostas_reprovadas: metricas.propostas_reprovadas_visao_fornecedor_bid_frete_internacional,
    disparos_recebidos: metricas.disparos_recebidos_visao_fornecedor_bid_frete_internacional,
    taxa_resposta: Number(metricas.taxa_resposta_visao_fornecedor_bid_frete_internacional),
    taxa_aprovacao: Number(metricas.taxa_aprovacao_visao_fornecedor_bid_frete_internacional),
    nota_global_classificacao_bid_frete_internacional:
      classificacao?.nota_global_classificacao_bid_frete_internacional ?? 0,
  }
}

export function mapFunilVisaoFornecedorFromServer(
  funil: VisaoFornecedorBidFreteInternacionalDashboard['funil_visao_fornecedor_bid_frete_internacional'],
): EtapaFunilVisaoFornecedorBidFreteInternacional[] {
  return funil.map((etapa) => ({
    rotulo: etapa.rotulo_funil_visao_fornecedor_bid_frete_internacional,
    quantidade: etapa.quantidade_funil_visao_fornecedor_bid_frete_internacional,
    cor: etapa.cor_funil_visao_fornecedor_bid_frete_internacional,
  }))
}

export function mapAlertasVisaoFornecedorFromServer(
  alertas: VisaoFornecedorBidFreteInternacionalDashboard['alertas_visao_fornecedor_bid_frete_internacional'],
): AlertaVisaoFornecedorBidFreteInternacional[] {
  return alertas.map((alerta) => ({
    rotulo: alerta.rotulo_alerta_visao_fornecedor_bid_frete_internacional,
    quantidade: alerta.quantidade_alerta_visao_fornecedor_bid_frete_internacional,
    tom: alerta.tom_alerta_visao_fornecedor_bid_frete_internacional,
    rota: alerta.rota_alerta_visao_fornecedor_bid_frete_internacional,
  }))
}

export function mapDashboardVisaoFornecedorFromServer(
  visao: VisaoFornecedorBidFreteInternacionalDashboard,
  fornecedor: { id_fornecedor_bid_frete_internacional: string; nome_fornecedor_bid_frete_internacional: string; tipo_fornecedor_bid_frete_internacional: string },
) {
  return {
    fornecedor,
    metricas: visao.metricas_visao_fornecedor_bid_frete_internacional,
    kpis: mapDashboardMetricasFromServer(
      visao.metricas_visao_fornecedor_bid_frete_internacional,
      visao.classificacao_bid_frete_internacional,
    ),
    funil: mapFunilVisaoFornecedorFromServer(visao.funil_visao_fornecedor_bid_frete_internacional),
    alertas: mapAlertasVisaoFornecedorFromServer(visao.alertas_visao_fornecedor_bid_frete_internacional),
  }
}
