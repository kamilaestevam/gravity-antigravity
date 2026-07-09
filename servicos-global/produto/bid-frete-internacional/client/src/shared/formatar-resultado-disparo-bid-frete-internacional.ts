/**
 * Mensagens de feedback pós-disparo (criação de cotação e modal de envio).
 */

export type ResultadoDisparoItem = {
  id_fornecedor_bid_frete_internacional?: string
  nome_fornecedor_bid_frete_internacional?: string
  canal_disparo_cotacao_bid_frete_internacional?: string
  status_disparo_cotacao_bid_frete_internacional?: 'ENVIADO' | 'ERRO_ENVIO' | 'PENDENTE' | string
  erro_envio_disparo_cotacao_bid_frete_internacional?: string | null
}

export type ResultadoDisparoResumo = {
  disparos?: number
  enviados?: boolean
  enviados_ok?: number
  erros_envio?: number
  message?: string
  results?: ResultadoDisparoItem[]
}

export type FeedbackDisparoFormatado = {
  tipo: 'sucesso' | 'parcial' | 'erro' | 'aguardando' | 'nao_confirmado'
  titulo: string
  detalhe: string
}

export function tipoNotificacaoFeedbackDisparo(
  tipo: FeedbackDisparoFormatado['tipo'],
): 'success' | 'warning' | 'error' {
  if (tipo === 'sucesso') return 'success'
  if (tipo === 'parcial' || tipo === 'aguardando') return 'warning'
  return 'error'
}

export function corBordaFeedbackDisparo(tipo: FeedbackDisparoFormatado['tipo']): string {
  if (tipo === 'sucesso') return 'rgba(34, 197, 94, 0.35)'
  if (tipo === 'parcial' || tipo === 'aguardando') return 'rgba(245, 158, 11, 0.35)'
  return 'rgba(239, 68, 68, 0.35)'
}

function nomesFornecedoresResultado(results: ResultadoDisparoItem[], status: string): string[] {
  return results
    .filter(r => r.status_disparo_cotacao_bid_frete_internacional === status)
    .map(r => r.nome_fornecedor_bid_frete_internacional?.trim())
    .filter((n): n is string => !!n)
}

function resumirNomes(nomes: string[], max = 3): string {
  if (nomes.length === 0) return ''
  if (nomes.length <= max) return nomes.join(', ')
  return `${nomes.slice(0, max).join(', ')} +${nomes.length - max}`
}

export function formatarFeedbackDisparoBidFrete(
  resultado: ResultadoDisparoResumo | null | undefined,
  opts?: {
    disparoErro?: string | null
    /** UI durante polling — não afirma que e-mail foi enviado. */
    aguardandoConfirmacao?: boolean
    /** Timeout ou disparos ainda PENDENTE após espera. */
    naoConfirmado?: boolean
  },
): FeedbackDisparoFormatado {
  if (opts?.aguardandoConfirmacao) {
    return {
      tipo: 'aguardando',
      titulo: 'Cotação salva — confirmando envio',
      detalhe: 'Aguardando confirmação de entrega dos convites por e-mail. Isso pode levar alguns segundos.',
    }
  }
  if (opts?.disparoErro) {
    return {
      tipo: 'erro',
      titulo: 'Disparo não concluído',
      detalhe: opts.disparoErro,
    }
  }
  if (!resultado || (resultado.disparos ?? 0) === 0) {
    return {
      tipo: 'erro',
      titulo: 'Nenhum disparo gerado',
      detalhe: resultado?.message ?? 'Verifique os fornecedores selecionados e os canais de envio.',
    }
  }

  const results = resultado.results ?? []
  const pendentes = results.filter(r => r.status_disparo_cotacao_bid_frete_internacional === 'PENDENTE').length

  if (opts?.naoConfirmado || pendentes > 0) {
    const partes = [
      pendentes > 0
        ? `${pendentes} convite(s) ainda sem confirmação de entrega`
        : 'O envio não foi confirmado a tempo',
      'Abra os detalhes da cotação para ver o status real de cada fornecedor',
    ]
    return {
      tipo: 'nao_confirmado',
      titulo: 'Envio não confirmado',
      detalhe: partes.join(' — '),
    }
  }

  const enviadosOk = resultado.enviados_ok
    ?? results.filter(r => r.status_disparo_cotacao_bid_frete_internacional === 'ENVIADO').length
  const erros = resultado.erros_envio
    ?? results.filter(r => r.status_disparo_cotacao_bid_frete_internacional === 'ERRO_ENVIO').length
  const total = resultado.disparos ?? results.length

  if (resultado.enviados && erros === 0) {
    return {
      tipo: 'sucesso',
      titulo: 'Cotação enviada aos fornecedores',
      detalhe: `${enviadosOk} de ${total} disparo(s) entregue(s) com sucesso.`,
    }
  }

  if (enviadosOk > 0 && erros > 0) {
    const okNomes = resumirNomes(nomesFornecedoresResultado(results, 'ENVIADO'))
    const errNomes = resumirNomes(nomesFornecedoresResultado(results, 'ERRO_ENVIO'))
    const partes = [`${enviadosOk} enviado(s) com sucesso`]
    if (okNomes) partes.push(`ok: ${okNomes}`)
    partes.push(`${erros} com falha`)
    if (errNomes) partes.push(`falha: ${errNomes}`)
    const primeiroErro = results.find(
      r => r.status_disparo_cotacao_bid_frete_internacional === 'ERRO_ENVIO'
        && r.erro_envio_disparo_cotacao_bid_frete_internacional,
    )?.erro_envio_disparo_cotacao_bid_frete_internacional
    return {
      tipo: 'parcial',
      titulo: 'Disparo parcialmente concluído',
      detalhe: `${partes.join(' · ')}${primeiroErro ? ` — ${primeiroErro}` : ''}`,
    }
  }

  const errNomes = resumirNomes(nomesFornecedoresResultado(results, 'ERRO_ENVIO'))
  const primeiroErro = results.find(r => r.erro_envio_disparo_cotacao_bid_frete_internacional)
    ?.erro_envio_disparo_cotacao_bid_frete_internacional
  return {
    tipo: 'erro',
    titulo: 'Nenhum disparo foi entregue',
    detalhe: [
      resultado.message,
      errNomes ? `Fornecedores: ${errNomes}` : null,
      primeiroErro,
    ].filter(Boolean).join(' — ') || 'Verifique e-mails dos fornecedores e o serviço Resend.',
  }
}
