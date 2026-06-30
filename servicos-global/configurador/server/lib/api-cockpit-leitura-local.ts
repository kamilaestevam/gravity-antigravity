/**
 * Leitura direta no banco ORGANIZACAO quando o sidecar api-cockpit (:8016) falha.
 * Somente GET (listagem tokens + KPIs) — mutações continuam exigindo sidecar.
 */
import { getPrismaOrganizacao } from './prisma-organizacao.js'

export async function verificarTabelaApiTokenOrganizacao(): Promise<boolean> {
  try {
    const prisma = getPrismaOrganizacao()
    await prisma.$queryRaw`SELECT 1 FROM api_token LIMIT 1`
    return true
  } catch {
    return false
  }
}

export async function listarApiTokensOrganizacao(idOrganizacao: string) {
  const prisma = getPrismaOrganizacao()
  const tokens = await prisma.apiToken.findMany({
    where: {
      id_organizacao: idOrganizacao,
      revogado_api_token: false,
    },
    select: {
      id_api_token: true,
      id_organizacao: true,
      id_produto_gravity: true,
      id_usuario: true,
      nome_api_token: true,
      prefixo_api_token: true,
      escopo_api_token: true,
      validade_api_token: true,
      data_expiracao_api_token: true,
      limite_requisicoes_minuto_api_token: true,
      data_criacao_api_token: true,
    },
    orderBy: { data_criacao_api_token: 'desc' },
  })
  return { tokens }
}

function diaUtc(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function estatisticasLogRequisicaoApiOrganizacao(opcoes: {
  id_organizacao?: string
  serie?: 'diaria'
  dias?: number
}) {
  const prisma = getPrismaOrganizacao()
  const agora = Date.now()
  const h24 = new Date(agora - 24 * 60 * 60 * 1000)
  const diasJanela = opcoes.serie === 'diaria' ? (opcoes.dias ?? 30) : 0
  const inicioJanela =
    diasJanela > 0 ? new Date(agora - diasJanela * 24 * 60 * 60 * 1000) : h24

  const where: {
    data_criacao_log_requisicao_api: { gte: Date }
    id_organizacao?: string
  } = {
    data_criacao_log_requisicao_api: { gte: inicioJanela },
  }
  if (opcoes.id_organizacao) where.id_organizacao = opcoes.id_organizacao

  const rows = await prisma.logRequisicaoApi.findMany({
    where,
    select: {
      id_produto_gravity: true,
      codigo_resposta_http_log_requisicao_api: true,
      latencia_ms_log_requisicao_api: true,
      data_criacao_log_requisicao_api: true,
    },
  })

  let quantidadeRequisicoes = 0
  let quantidadeErros = 0
  let somaLatencia = 0
  const porIdProdutoGravity: Record<string, number> = {}
  const porFaixaCodigoRespostaHttp: Record<string, number> = {
    '2xx': 0,
    '3xx': 0,
    '4xx': 0,
    '5xx': 0,
  }
  const porDia: Record<string, { total: number; sucesso: number }> = {}

  for (const e of rows) {
    const ts = e.data_criacao_log_requisicao_api.getTime()

    if (diasJanela > 0) {
      const dia = diaUtc(e.data_criacao_log_requisicao_api)
      const slot = porDia[dia] ?? (porDia[dia] = { total: 0, sucesso: 0 })
      slot.total++
      if (e.codigo_resposta_http_log_requisicao_api < 500) slot.sucesso++
    }

    if (ts < h24.getTime()) continue
    quantidadeRequisicoes++
    somaLatencia += e.latencia_ms_log_requisicao_api
    if (e.codigo_resposta_http_log_requisicao_api >= 500) quantidadeErros++
    if (e.id_produto_gravity) {
      porIdProdutoGravity[e.id_produto_gravity] =
        (porIdProdutoGravity[e.id_produto_gravity] || 0) + 1
    }
    const grupo = `${Math.floor(e.codigo_resposta_http_log_requisicao_api / 100)}xx`
    if (grupo in porFaixaCodigoRespostaHttp) porFaixaCodigoRespostaHttp[grupo]++
  }

  const latenciaMedia =
    quantidadeRequisicoes > 0 ? Math.round(somaLatencia / quantidadeRequisicoes) : 0
  const percentualUptime =
    quantidadeRequisicoes > 0
      ? Number(((1 - quantidadeErros / quantidadeRequisicoes) * 100).toFixed(1))
      : 100
  const quantidadeProdutosDistintos = Object.keys(porIdProdutoGravity).length

  let serieDiariaLogRequisicaoApi:
    | { data: string; total: number; sucesso: number; percentual: number }[]
    | undefined
  if (diasJanela > 0) {
    serieDiariaLogRequisicaoApi = []
    for (let i = diasJanela - 1; i >= 0; i--) {
      const dia = diaUtc(new Date(agora - i * 24 * 60 * 60 * 1000))
      const slot = porDia[dia] ?? { total: 0, sucesso: 0 }
      const percentual =
        slot.total > 0 ? Number(((slot.sucesso / slot.total) * 100).toFixed(1)) : 100
      serieDiariaLogRequisicaoApi.push({
        data: dia,
        total: slot.total,
        sucesso: slot.sucesso,
        percentual,
      })
    }
  }

  return {
    quantidade_requisicoes_log_requisicao_api: quantidadeRequisicoes,
    quantidade_erros_log_requisicao_api: quantidadeErros,
    latencia_media_log_requisicao_api: latenciaMedia,
    percentual_uptime_log_requisicao_api: percentualUptime,
    quantidade_produtos_distintos_log_requisicao_api: quantidadeProdutosDistintos,
    por_id_produto_gravity: porIdProdutoGravity,
    por_faixa_codigo_resposta_http: porFaixaCodigoRespostaHttp,
    ...(serieDiariaLogRequisicaoApi
      ? { serie_diaria_log_requisicao_api: serieDiariaLogRequisicaoApi }
      : {}),
  }
}

export async function listarWebhooksOrganizacao(idOrganizacao: string) {
  const prisma = getPrismaOrganizacao()
  const webhooks = await prisma.webhookConfiguracao.findMany({
    where: { id_organizacao: idOrganizacao },
    select: {
      id_webhook_configuracao: true,
      id_organizacao: true,
      id_produto_gravity: true,
      id_usuario: true,
      url_webhook_configuracao: true,
      eventos_webhook_configuracao: true,
      ativo_webhook_configuracao: true,
      data_criacao_webhook_configuracao: true,
      data_atualizacao_webhook_configuracao: true,
    },
    orderBy: { data_criacao_webhook_configuracao: 'desc' },
  })
  return { webhooks }
}

export async function listarLogsRequisicaoApiOrganizacao(opcoes: {
  id_organizacao?: string
  id_produto_gravity?: string
  codigo_resposta_http_minimo?: number
  codigo_resposta_http_maximo?: number
  pagina?: number
  limite?: number
}) {
  const prisma = getPrismaOrganizacao()
  const pagina = Math.max(1, opcoes.pagina ?? 1)
  const limite = Math.min(100, Math.max(1, opcoes.limite ?? 50))

  const where: {
    id_organizacao?: string
    id_produto_gravity?: string
    codigo_resposta_http_log_requisicao_api?: { gte?: number; lte?: number }
  } = {}

  if (opcoes.id_organizacao) where.id_organizacao = opcoes.id_organizacao

  if (opcoes.id_produto_gravity) where.id_produto_gravity = opcoes.id_produto_gravity
  if (
    opcoes.codigo_resposta_http_minimo !== undefined ||
    opcoes.codigo_resposta_http_maximo !== undefined
  ) {
    where.codigo_resposta_http_log_requisicao_api = {
      ...(opcoes.codigo_resposta_http_minimo !== undefined
        ? { gte: opcoes.codigo_resposta_http_minimo }
        : {}),
      ...(opcoes.codigo_resposta_http_maximo !== undefined
        ? { lte: opcoes.codigo_resposta_http_maximo }
        : {}),
    }
  }

  const [total, rows] = await Promise.all([
    prisma.logRequisicaoApi.count({ where }),
    prisma.logRequisicaoApi.findMany({
      where,
      orderBy: { data_criacao_log_requisicao_api: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
  ])

  const logs = rows.map((e) => {
    const iso = e.data_criacao_log_requisicao_api.toISOString()
    const tIdx = iso.indexOf('T')
    const data = tIdx >= 0 ? iso.slice(0, tIdx) : iso
    const hora = tIdx >= 0 ? iso.slice(tIdx + 1, tIdx + 9) : ''
    const status = e.codigo_resposta_http_log_requisicao_api
    return {
      id_log_requisicao_api: e.id_log_requisicao_api,
      id_organizacao: e.id_organizacao,
      id_produto_gravity: e.id_produto_gravity,
      id_usuario: e.id_usuario,
      id_correlacao: e.id_correlacao,
      endpoint_log_requisicao_api: e.endpoint_log_requisicao_api,
      metodo_http_log_requisicao_api: e.metodo_http_log_requisicao_api,
      codigo_resposta_http_log_requisicao_api: status,
      latencia_ms_log_requisicao_api: e.latencia_ms_log_requisicao_api,
      data_criacao_log_requisicao_api: iso,
      data_log_requisicao_api: data,
      hora_log_requisicao_api: hora,
      resultado_log_requisicao_api:
        status < 400 ? 'SUCESSO' : status < 500 ? 'ERRO_CLIENTE' : 'ERRO_SERVIDOR',
    }
  })

  return {
    logs,
    paginacao: {
      pagina,
      limite,
      total,
      paginas: Math.ceil(total / limite),
    },
  }
}
