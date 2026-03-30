/**
 * tenantIntegrations.ts — Integrações S2S com serviços de tenant
 * Centraliza chamadas para: Atividades, Notificações, Histórico, Gabi AI
 *
 * Todos os serviços usam:
 *   - x-internal-key: autenticação S2S
 *   - x-tenant-id: isolamento de tenant
 *   - x-user-id: rastreamento de quem fez a ação
 */

import axios from 'axios'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`[BidFrete] Variável de ambiente obrigatória não definida: ${name}`)
  return value
}

const ATIVIDADES_URL = process.env.ATIVIDADES_SERVICE_URL ?? requireEnv('ATIVIDADES_SERVICE_URL')
const NOTIFICACOES_URL = process.env.NOTIFICACOES_SERVICE_URL ?? requireEnv('NOTIFICACOES_SERVICE_URL')
const HISTORICO_URL = process.env.HISTORICO_SERVICE_URL ?? requireEnv('HISTORICO_SERVICE_URL')
const GABI_URL = process.env.GABI_SERVICE_URL ?? requireEnv('GABI_SERVICE_URL')
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY ?? ''

function s2sHeaders(tenantId: string, userId?: string) {
  return {
    'x-internal-key': INTERNAL_KEY,
    'x-tenant-id': tenantId,
    'x-user-id': userId ?? '',
    'Content-Type': 'application/json',
  }
}

// ─── ATIVIDADES (Meu Espaço) ───────────────────────────────────────────────────

export const atividadesIntegration = {
  /**
   * Cria uma atividade/tarefa no "Meu Espaço" do usuário
   */
  async criarAtividade(tenantId: string, data: {
    titulo: string
    descricao?: string
    tipo?: 'TAREFA' | 'FOLLOW_UP' | 'OUTRO'
    prioridade?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'
    data_venc?: string
    user_id?: string
  }) {
    try {
      await axios.post(`${ATIVIDADES_URL}/api/v1/atividades`, {
        ...data,
        product_id: 'bid-frete',
        status: 'PENDENTE',
      }, {
        headers: s2sHeaders(tenantId, data.user_id),
        timeout: 10000,
      })
    } catch (err: unknown) {
      console.warn(`[BidFrete→Atividades] Falha ao criar atividade:`, err instanceof Error ? err.message : 'Erro desconhecido')
    }
  },

  /** Cotação criada — lembrete para acompanhar */
  async cotacaoCriada(tenantId: string, userId: string, cotacao: { numero: string; origem_nome: string; destino_nome: string }) {
    await this.criarAtividade(tenantId, {
      titulo: `Acompanhar cotação ${cotacao.numero}`,
      descricao: `Cotação ${cotacao.origem_nome} → ${cotacao.destino_nome} criada. Acompanhar respostas dos fornecedores.`,
      tipo: 'FOLLOW_UP',
      prioridade: 'MEDIA',
      user_id: userId,
    })
  },

  /** Cotação com falta de informação */
  async faltaInformacao(tenantId: string, userId: string, cotacao: { numero: string; campos_faltantes: string[] }) {
    await this.criarAtividade(tenantId, {
      titulo: `Pendência de dados para cotação ${cotacao.numero}`,
      descricao: `Campos faltantes: ${cotacao.campos_faltantes.join(', ')}. Preencha para destravar a cotação.`,
      tipo: 'TAREFA',
      prioridade: 'ALTA',
      user_id: userId,
    })
  },

  /** Fornecedor respondeu — aguardando aprovação */
  async aguardandoAprovacao(tenantId: string, userId: string, cotacao: { numero: string; total_respostas: number }) {
    await this.criarAtividade(tenantId, {
      titulo: `Aprovar cotação ${cotacao.numero}`,
      descricao: `${cotacao.total_respostas} fornecedor(es) responderam. Acesse o comparativo para aprovar ou reprovar.`,
      tipo: 'TAREFA',
      prioridade: 'URGENTE',
      user_id: userId,
    })
  },

  /** Cotação próxima ao vencimento */
  async proximoVencimento(tenantId: string, userId: string, cotacao: { numero: string; data_limite: string }) {
    await this.criarAtividade(tenantId, {
      titulo: `Cotação ${cotacao.numero} vence em breve`,
      descricao: `Data limite: ${new Date(cotacao.data_limite).toLocaleDateString('pt-BR')}. Tome uma ação antes do vencimento.`,
      tipo: 'TAREFA',
      prioridade: 'URGENTE',
      data_venc: cotacao.data_limite,
      user_id: userId,
    })
  },
}

// ─── NOTIFICAÇÕES (Sininho) ─────────────────────────────────────────────────────

export const notificacoesIntegration = {
  /**
   * Envia notificação para o sininho do usuário
   * O serviço de notificações usa pg-boss como fila, então criamos via POST
   */
  async enviar(tenantId: string, data: {
    user_id: string
    tipo: string
    titulo: string
    mensagem: string
    link?: string
    product_id?: string
  }) {
    try {
      await axios.post(`${NOTIFICACOES_URL}/api/v1/notificacoes`, {
        ...data,
        product_id: data.product_id ?? 'bid-frete',
        read: false,
      }, {
        headers: s2sHeaders(tenantId, data.user_id),
        timeout: 10000,
      })
    } catch (err: unknown) {
      console.warn(`[BidFrete→Notificações] Falha ao enviar:`, err instanceof Error ? err.message : 'Erro desconhecido')
    }
  },

  /** Fornecedor respondeu cotação */
  async fornecedorRespondeu(tenantId: string, userId: string, data: { cotacao_numero: string; fornecedor_nome: string; cotacao_id: string }) {
    await this.enviar(tenantId, {
      user_id: userId,
      tipo: 'BID_RESPOSTA',
      titulo: `Nova resposta de ${data.fornecedor_nome}`,
      mensagem: `O fornecedor ${data.fornecedor_nome} respondeu a cotação ${data.cotacao_numero}.`,
      link: `/cotacoes/${data.cotacao_id}/comparativo`,
    })
  },

  /** Cotação aprovada — notificar fornecedor vencedor */
  async cotacaoAprovada(tenantId: string, userId: string, data: { cotacao_numero: string; fornecedor_nome: string }) {
    await this.enviar(tenantId, {
      user_id: userId,
      tipo: 'BID_APROVADA',
      titulo: `Cotação ${data.cotacao_numero} aprovada`,
      mensagem: `Fornecedor vencedor: ${data.fornecedor_nome}.`,
    })
  },

  /** Cotação expirou */
  async cotacaoExpirada(tenantId: string, userId: string, data: { cotacao_numero: string; cotacao_id: string }) {
    await this.enviar(tenantId, {
      user_id: userId,
      tipo: 'BID_EXPIRADA',
      titulo: `Cotação ${data.cotacao_numero} expirou`,
      mensagem: `O prazo de resposta da cotação expirou sem aprovação.`,
      link: `/cotacoes/${data.cotacao_id}`,
    })
  },
}

// ─── HISTÓRICO (Auditoria) ──────────────────────────────────────────────────────

export const historicoIntegration = {
  /**
   * Registra evento de auditoria no histórico global
   */
  async registrar(tenantId: string, data: {
    user_id: string
    acao: string
    entidade: string
    entidade_id: string
    campo?: string
    valor_antes?: string
    valor_depois?: string
    detalhes?: string
  }) {
    try {
      await axios.post(`${HISTORICO_URL}/api/v1/historico`, {
        ...data,
        product_id: 'bid-frete',
        timestamp: new Date().toISOString(),
      }, {
        headers: s2sHeaders(tenantId, data.user_id),
        timeout: 10000,
      })
    } catch (err: unknown) {
      console.warn(`[BidFrete→Histórico] Falha ao registrar:`, err instanceof Error ? err.message : 'Erro desconhecido')
    }
  },

  /** Cotação criada */
  async cotacaoCriada(tenantId: string, userId: string, cotacao: { id: string; numero: string }) {
    await this.registrar(tenantId, {
      user_id: userId,
      acao: 'CRIAR',
      entidade: 'cotacao',
      entidade_id: cotacao.id,
      detalhes: `Cotação ${cotacao.numero} criada`,
    })
  },

  /** BIDs disparados */
  async bidsDisparados(tenantId: string, userId: string, cotacao: { id: string; numero: string }, totalDisparos: number) {
    await this.registrar(tenantId, {
      user_id: userId,
      acao: 'DISPARAR',
      entidade: 'cotacao',
      entidade_id: cotacao.id,
      detalhes: `${totalDisparos} BIDs disparados para cotação ${cotacao.numero}`,
    })
  },

  /** Cotação aprovada */
  async cotacaoAprovada(tenantId: string, userId: string, cotacao: { id: string; numero: string }, fornecedorNome: string, valor: number) {
    await this.registrar(tenantId, {
      user_id: userId,
      acao: 'APROVAR',
      entidade: 'cotacao',
      entidade_id: cotacao.id,
      campo: 'status',
      valor_antes: 'AGUARDANDO_APROVACAO',
      valor_depois: 'APROVADA',
      detalhes: `Cotação ${cotacao.numero} aprovada. Fornecedor: ${fornecedorNome}. Valor: USD ${valor}`,
    })
  },

  /** Cotação reprovada */
  async cotacaoReprovada(tenantId: string, userId: string, cotacao: { id: string; numero: string }, motivo?: string) {
    await this.registrar(tenantId, {
      user_id: userId,
      acao: 'REPROVAR',
      entidade: 'cotacao',
      entidade_id: cotacao.id,
      campo: 'status',
      valor_antes: 'AGUARDANDO_APROVACAO',
      valor_depois: 'REPROVADA',
      detalhes: `Cotação ${cotacao.numero} reprovada. ${motivo ? `Motivo: ${motivo}` : ''}`,
    })
  },

  /** Fornecedor respondeu */
  async fornecedorRespondeu(tenantId: string, fornecedorNome: string, cotacao: { id: string; numero: string }, valor: number) {
    await this.registrar(tenantId, {
      user_id: 'system',
      acao: 'RESPONDER',
      entidade: 'cotacao',
      entidade_id: cotacao.id,
      detalhes: `Fornecedor ${fornecedorNome} respondeu cotação ${cotacao.numero} com USD ${valor}`,
    })
  },

  /** Avaliação de fornecedor */
  async fornecedorAvaliado(tenantId: string, userId: string, fornecedor: { id: string; nome: string }, notaGeral: number) {
    await this.registrar(tenantId, {
      user_id: userId,
      acao: 'AVALIAR',
      entidade: 'fornecedor',
      entidade_id: fornecedor.id,
      detalhes: `Fornecedor ${fornecedor.nome} avaliado com nota ${notaGeral.toFixed(1)}`,
    })
  },
}

// ─── GABI AI (Análise de Propostas) ─────────────────────────────────────────────

export const gabiIntegration = {
  /**
   * Solicita análise da Gabi sobre as propostas recebidas
   * Retorna recomendação de melhor custo-benefício
   */
  async analisarPropostas(tenantId: string, userId: string, data: {
    cotacao_numero: string
    origem: string
    destino: string
    respostas: Array<{
      fornecedor: string
      valor_total: number
      transit_time: number
      rating: number
    }>
  }): Promise<string | null> {
    try {
      const prompt = `Analise as propostas de frete para a cotação ${data.cotacao_numero} (${data.origem} → ${data.destino}):\n\n` +
        data.respostas.map((r, i) => `${i + 1}. ${r.fornecedor}: USD ${r.valor_total} | ${r.transit_time} dias | Rating ${r.rating}/5`).join('\n') +
        `\n\nQual a melhor opção custo-benefício? Considere preço, prazo e confiabilidade.`

      const response = await axios.post(`${GABI_URL}/api/v1/gabi/chat`, {
        message: prompt,
        context: 'bid-frete-analise',
        product_id: 'bid-frete',
      }, {
        headers: s2sHeaders(tenantId, userId),
        timeout: 30000,
      })

      return response.data?.reply ?? response.data?.message ?? null
    } catch (err: unknown) {
      console.warn(`[BidFrete→Gabi] Falha na análise:`, err instanceof Error ? err.message : 'Erro desconhecido')
      return null
    }
  },
}
