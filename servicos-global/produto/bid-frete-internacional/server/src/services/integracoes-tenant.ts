/**
 * integracoes-tenant.ts — Integrações S2S com serviços de tenant
 * Centraliza chamadas para: Atividades, Notificações, Histórico, Gabi AI
 *
 * Todos os serviços usam:
 *   - x-internal-key: autenticação S2S
 *   - x-id-organizacao: isolamento de tenant
 *   - x-id-usuario: rastreamento de quem fez a ação
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
const INTERNAL_KEY = process.env.CHAVE_INTERNA_SERVICO ?? ''

function s2sHeaders(tenantId: string, userId?: string) {
  return {
    'x-internal-key': INTERNAL_KEY,
    'x-id-organizacao': tenantId,
    'x-id-usuario': userId ?? '',
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
    id_usuario?: string
  }) {
    try {
      await axios.post(`${ATIVIDADES_URL}/api/v1/atividades`, {
        ...data,
        id_produto_gravity: 'bid-frete-internacional',
        status: 'PENDENTE',
      }, {
        headers: s2sHeaders(tenantId, data.id_usuario),
        timeout: 10000,
      })
    } catch (err: unknown) {
      console.warn(`[BidFrete→Atividades] Falha ao criar atividade:`, err instanceof Error ? err.message : 'Erro desconhecido')
    }
  },

  /** Cotação criada — lembrete para acompanhar */
  async cotacaoCriada(tenantId: string, userId: string, cotacao: { numero_cotacao_bid_frete_internacional: string; origem_nome_cotacao_bid_frete_internacional: string; destino_nome_cotacao_bid_frete_internacional: string }) {
    await this.criarAtividade(tenantId, {
      titulo: `Acompanhar cotação ${cotacao.numero_cotacao_bid_frete_internacional}`,
      descricao: `Cotação ${cotacao.origem_nome_cotacao_bid_frete_internacional} → ${cotacao.destino_nome_cotacao_bid_frete_internacional} criada. Acompanhar respostas dos fornecedores.`,
      tipo: 'FOLLOW_UP',
      prioridade: 'MEDIA',
      id_usuario: userId,
    })
  },

  /** Cotação com falta de informação */
  async faltaInformacao(tenantId: string, userId: string, cotacao: { numero_cotacao_bid_frete_internacional: string; campos_faltantes: string[] }) {
    await this.criarAtividade(tenantId, {
      titulo: `Pendência de dados para cotação ${cotacao.numero_cotacao_bid_frete_internacional}`,
      descricao: `Campos faltantes: ${cotacao.campos_faltantes.join(', ')}. Preencha para destravar a cotação.`,
      tipo: 'TAREFA',
      prioridade: 'ALTA',
      id_usuario: userId,
    })
  },

  /** Fornecedor respondeu — aguardando aprovação */
  async aguardandoAprovacao(tenantId: string, userId: string, cotacao: { numero_cotacao_bid_frete_internacional: string; total_respostas: number }) {
    await this.criarAtividade(tenantId, {
      titulo: `Aprovar cotação ${cotacao.numero_cotacao_bid_frete_internacional}`,
      descricao: `${cotacao.total_respostas} fornecedor(es) responderam. Acesse o comparativo para aprovar ou reprovar.`,
      tipo: 'TAREFA',
      prioridade: 'URGENTE',
      id_usuario: userId,
    })
  },

  /** Cotação próxima ao vencimento */
  async proximoVencimento(tenantId: string, userId: string, cotacao: { numero_cotacao_bid_frete_internacional: string; data_limite: string }) {
    await this.criarAtividade(tenantId, {
      titulo: `Cotação ${cotacao.numero_cotacao_bid_frete_internacional} vence em breve`,
      descricao: `Data limite: ${new Date(cotacao.data_limite).toLocaleDateString('pt-BR')}. Tome uma ação antes do vencimento.`,
      tipo: 'TAREFA',
      prioridade: 'URGENTE',
      data_venc: cotacao.data_limite,
      id_usuario: userId,
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
    id_usuario: string
    tipo: string
    titulo: string
    mensagem: string
    link?: string
    id_produto_gravity?: string
  }) {
    try {
      await axios.post(`${NOTIFICACOES_URL}/api/v1/notificacoes`, {
        ...data,
        id_produto_gravity: data.id_produto_gravity ?? 'bid-frete-internacional',
        read: false,
      }, {
        headers: s2sHeaders(tenantId, data.id_usuario),
        timeout: 10000,
      })
    } catch (err: unknown) {
      console.warn(`[BidFrete→Notificações] Falha ao enviar:`, err instanceof Error ? err.message : 'Erro desconhecido')
    }
  },

  /** Fornecedor respondeu cotação */
  async fornecedorRespondeu(tenantId: string, userId: string, data: { cotacao_numero: string; fornecedor_nome: string; id_cotacao_bid_frete_internacional: string }) {
    await this.enviar(tenantId, {
      id_usuario: userId,
      tipo: 'BID_RESPOSTA',
      titulo: `Nova resposta de ${data.fornecedor_nome}`,
      mensagem: `O fornecedor ${data.fornecedor_nome} respondeu a cotação ${data.cotacao_numero}.`,
      link: `/cotacoes/${data.id_cotacao_bid_frete_internacional}/comparativo`,
    })
  },

  /** Cotação aprovada — notificar fornecedor vencedor */
  async cotacaoAprovada(tenantId: string, userId: string, data: { cotacao_numero: string; fornecedor_nome: string }) {
    await this.enviar(tenantId, {
      id_usuario: userId,
      tipo: 'BID_APROVADA',
      titulo: `Cotação ${data.cotacao_numero} aprovada`,
      mensagem: `Fornecedor vencedor: ${data.fornecedor_nome}.`,
    })
  },

  /** Cotação expirou */
  async cotacaoExpirada(tenantId: string, userId: string, data: { cotacao_numero: string; id_cotacao_bid_frete_internacional: string }) {
    await this.enviar(tenantId, {
      id_usuario: userId,
      tipo: 'BID_EXPIRADA',
      titulo: `Cotação ${data.cotacao_numero} expirou`,
      mensagem: `O prazo de resposta da cotação expirou sem aprovação.`,
      link: `/cotacoes/${data.id_cotacao_bid_frete_internacional}`,
    })
  },
}

// ─── HISTÓRICO (Auditoria) ──────────────────────────────────────────────────────

export const historicoIntegration = {
  /**
   * Registra evento de auditoria no histórico global
   */
  async registrar(tenantId: string, data: {
    id_usuario: string
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
        id_produto_gravity: 'bid-frete-internacional',
        timestamp: new Date().toISOString(),
      }, {
        headers: s2sHeaders(tenantId, data.id_usuario),
        timeout: 10000,
      })
    } catch (err: unknown) {
      console.warn(`[BidFrete→Histórico] Falha ao registrar:`, err instanceof Error ? err.message : 'Erro desconhecido')
    }
  },

  /** Cotação criada */
  async cotacaoCriada(tenantId: string, userId: string, cotacao: { id: string; numero_cotacao_bid_frete_internacional: string }) {
    await this.registrar(tenantId, {
      id_usuario: userId,
      acao: 'CRIAR',
      entidade: 'cotacao',
      entidade_id: cotacao.id,
      detalhes: `Cotação ${cotacao.numero_cotacao_bid_frete_internacional} criada`,
    })
  },

  /** BIDs disparados */
  async bidsDisparados(tenantId: string, userId: string, cotacao: { id: string; numero_cotacao_bid_frete_internacional: string }, totalDisparos: number) {
    await this.registrar(tenantId, {
      id_usuario: userId,
      acao: 'DISPARAR',
      entidade: 'cotacao',
      entidade_id: cotacao.id,
      detalhes: `${totalDisparos} BIDs disparados para cotação ${cotacao.numero_cotacao_bid_frete_internacional}`,
    })
  },

  /** Cotação aprovada */
  async cotacaoAprovada(tenantId: string, userId: string, cotacao: { id: string; numero_cotacao_bid_frete_internacional: string }, fornecedorNome: string, valor: number) {
    await this.registrar(tenantId, {
      id_usuario: userId,
      acao: 'APROVAR',
      entidade: 'cotacao',
      entidade_id: cotacao.id,
      campo: 'status',
      valor_antes: 'AGUARDANDO_APROVACAO',
      valor_depois: 'APROVADA',
      detalhes: `Cotação ${cotacao.numero_cotacao_bid_frete_internacional} aprovada. Fornecedor: ${fornecedorNome}. Valor: USD ${valor}`,
    })
  },

  /** Cotação reprovada */
  async cotacaoReprovada(tenantId: string, userId: string, cotacao: { id: string; numero_cotacao_bid_frete_internacional: string }, motivo?: string) {
    await this.registrar(tenantId, {
      id_usuario: userId,
      acao: 'REPROVAR',
      entidade: 'cotacao',
      entidade_id: cotacao.id,
      campo: 'status',
      valor_antes: 'AGUARDANDO_APROVACAO',
      valor_depois: 'REPROVADA',
      detalhes: `Cotação ${cotacao.numero_cotacao_bid_frete_internacional} reprovada. ${motivo ? `Motivo: ${motivo}` : ''}`,
    })
  },

  /** Fornecedor respondeu */
  async fornecedorRespondeu(tenantId: string, fornecedorNome: string, cotacao: { id: string; numero_cotacao_bid_frete_internacional: string }, valor: number) {
    await this.registrar(tenantId, {
      id_usuario: 'system',
      acao: 'RESPONDER',
      entidade: 'cotacao',
      entidade_id: cotacao.id,
      detalhes: `Fornecedor ${fornecedorNome} respondeu cotação ${cotacao.numero_cotacao_bid_frete_internacional} com USD ${valor}`,
    })
  },

  /** Avaliação de fornecedor */
  async fornecedorAvaliado(tenantId: string, userId: string, fornecedor: { id: string; nome: string }, notaGeral: number) {
    await this.registrar(tenantId, {
      id_usuario: userId,
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
      valor_total_proposta_bid_frete_internacional: number
      dias_transito: number
      nota_global: number
    }>
  }): Promise<string | null> {
    try {
      const prompt = `Analise as propostas de frete para a cotação ${data.cotacao_numero} (${data.origem} → ${data.destino}):\n\n` +
        data.respostas.map((r, i) => `${i + 1}. ${r.fornecedor}: USD ${r.valor_total_proposta_bid_frete_internacional} | ${r.dias_transito} dias | Rating ${r.nota_global}/5`).join('\n') +
        `\n\nQual a melhor opção custo-benefício? Considere preço, prazo e confiabilidade.`

      const response = await axios.post(`${GABI_URL}/api/v1/gabi/chats`, {
        message: prompt,
        context: 'bid-frete-analise',
        id_produto_gravity: 'bid-frete-internacional',
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
