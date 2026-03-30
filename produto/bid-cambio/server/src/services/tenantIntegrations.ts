/**
 * tenantIntegrations.ts — Integracoes S2S com servicos de tenant
 * Centraliza chamadas fire-and-forget para: Atividades, Notificacoes, Historico, Gabi AI
 *
 * Todos os servicos usam:
 *   - x-internal-key: autenticacao S2S
 *   - x-tenant-id: isolamento de tenant
 *   - x-user-id: rastreamento de quem fez a acao
 */

import axios from 'axios'

const ATIVIDADES_URL = process.env.ATIVIDADES_SERVICE_URL ?? 'http://localhost:8012'
const NOTIFICACOES_URL = process.env.NOTIFICACOES_SERVICE_URL ?? 'http://localhost:8013'
const HISTORICO_URL = process.env.HISTORICO_SERVICE_URL ?? 'http://localhost:8014'
const GABI_URL = process.env.GABI_SERVICE_URL ?? 'http://localhost:8015'
const EMAIL_URL = process.env.EMAIL_SERVICE_URL ?? 'http://localhost:8022'
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY ?? ''

function s2sHeaders(tenantId: string, userId?: string) {
  return {
    'x-internal-key': INTERNAL_KEY,
    'x-tenant-id': tenantId,
    'x-user-id': userId ?? '',
    'Content-Type': 'application/json',
  }
}

// --- ATIVIDADES ---

export const atividadesIntegration = {
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
        product_id: 'bid-cambio',
        status: 'PENDENTE',
      }, {
        headers: s2sHeaders(tenantId, data.user_id),
        timeout: 10000,
      })
    } catch (err: any) {
      console.warn(`[BidCambio->Atividades] Falha:`, err.message)
    }
  },

  async parcelaAgendada(tenantId: string, userId: string, parcela: {
    referencia: string
    porcentagem: string
    data_agendamento: string
  }) {
    await this.criarAtividade(tenantId, {
      titulo: `Cambio agendado — ${parcela.referencia}`,
      descricao: `Cambio referente a ${parcela.porcentagem}%, agendado para ${parcela.data_agendamento}.`,
      tipo: 'FOLLOW_UP',
      prioridade: 'MEDIA',
      data_venc: parcela.data_agendamento,
      user_id: userId,
    })
  },

  async parcelaPaga(tenantId: string, userId: string, parcela: {
    referencia: string
    valor: string
    moeda: string
  }) {
    await this.criarAtividade(tenantId, {
      titulo: `Cambio pago — ${parcela.referencia}`,
      descricao: `Cambio ${parcela.moeda} ${parcela.valor} fechado com sucesso.`,
      tipo: 'TAREFA',
      prioridade: 'BAIXA',
      user_id: userId,
    })
  },

  async proximoVencimento(tenantId: string, userId: string, data: {
    referencia: string
    data_vencimento: string
  }) {
    await this.criarAtividade(tenantId, {
      titulo: `Cambio vencendo — ${data.referencia}`,
      descricao: `Parcela de cambio vence em ${data.data_vencimento}. Providenciar pagamento.`,
      tipo: 'FOLLOW_UP',
      prioridade: 'ALTA',
      data_venc: data.data_vencimento,
      user_id: userId,
    })
  },
}

// --- NOTIFICACOES ---

export const notificacoesIntegration = {
  async enviar(tenantId: string, userId: string, data: {
    titulo: string
    mensagem: string
    tipo?: string
    link?: string
  }) {
    try {
      await axios.post(`${NOTIFICACOES_URL}/api/v1/notificacoes`, {
        ...data,
        product_id: 'bid-cambio',
        user_id: userId,
      }, {
        headers: s2sHeaders(tenantId, userId),
        timeout: 10000,
      })
    } catch (err: any) {
      console.warn(`[BidCambio->Notificacoes] Falha:`, err.message)
    }
  },

  async cotacaoRespondida(tenantId: string, userId: string, data: {
    corretora_nome: string
    cotacao_id: string
  }) {
    await this.enviar(tenantId, userId, {
      titulo: `Nova proposta de cambio`,
      mensagem: `A corretora ${data.corretora_nome} respondeu sua cotacao.`,
      tipo: 'BID_RESPONSE',
      link: `/bid-cambio/cotacoes/${data.cotacao_id}`,
    })
  },

  async cotacaoAprovada(tenantId: string, userId: string, data: {
    corretora_nome: string
    economia_brl: string
  }) {
    await this.enviar(tenantId, userId, {
      titulo: `Cambio aprovado`,
      mensagem: `Taxa da ${data.corretora_nome} aprovada. Economia: R$ ${data.economia_brl}.`,
      tipo: 'BID_APPROVED',
    })
  },

  async cotacaoExpirada(tenantId: string, userId: string, data: {
    cotacao_id: string
  }) {
    await this.enviar(tenantId, userId, {
      titulo: `Cotacao de cambio expirada`,
      mensagem: `A cotacao ${data.cotacao_id} expirou sem aprovacao.`,
      tipo: 'BID_EXPIRED',
    })
  },
}

// --- HISTORICO ---

export const historicoIntegration = {
  async registrar(tenantId: string, userId: string, data: {
    acao: string
    entidade: string
    entidade_id: string
    detalhes?: Record<string, unknown>
  }) {
    try {
      await axios.post(`${HISTORICO_URL}/api/v1/historico`, {
        ...data,
        product_id: 'bid-cambio',
        user_id: userId,
      }, {
        headers: s2sHeaders(tenantId, userId),
        timeout: 10000,
      })
    } catch (err: any) {
      console.warn(`[BidCambio->Historico] Falha:`, err.message)
    }
  },
}

// --- EMAIL ---

export const emailIntegration = {
  async enviar(tenantId: string, data: {
    para: string
    assunto: string
    corpo_html: string
    anexos?: Array<{ nome: string; url: string }>
  }) {
    try {
      await axios.post(`${EMAIL_URL}/api/v1/email/enviar`, {
        ...data,
        product_id: 'bid-cambio',
      }, {
        headers: s2sHeaders(tenantId),
        timeout: 15000,
      })
    } catch (err: any) {
      console.warn(`[BidCambio->Email] Falha:`, err.message)
    }
  },
}
