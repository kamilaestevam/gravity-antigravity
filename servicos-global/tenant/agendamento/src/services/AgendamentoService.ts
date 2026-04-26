import { prisma } from '../../server/lib/prisma.js'
import { AppError } from '../../server/lib/errors.js'

export class AgendamentoService {
  async gerarSlots(tenant_id: string, agenda_id: string, dataInicio: Date, dataFim: Date) {
    const config = await prisma.configDisponibilidadeAgenda.findUnique({
      where: { id_agenda_config_disponibilidade_agenda: agenda_id },
    })

    if (!config || config.id_organizacao_config_disponibilidade_agenda !== tenant_id) {
      throw new AppError('Configuração de disponibilidade não encontrada para esta agenda', 404)
    }

    const horarioInicio = config.horario_inicio_config_disponibilidade_agenda
    const horarioFim = config.horario_fim_config_disponibilidade_agenda
    const duracaoSlot = config.duracao_slot_config_disponibilidade_agenda
    const intervalo = config.intervalo_config_disponibilidade_agenda
    const diasSemana = config.dias_semana_config_disponibilidade_agenda

    // Converter string HH:mm para minutos desde meia noite
    const [hInicio, mInicio] = horarioInicio.split(':').map(Number)
    const inicioMinutos = (hInicio ?? 0) * 60 + (mInicio ?? 0)

    const [hFim, mFim] = horarioFim.split(':').map(Number)
    const fimMinutos = (hFim ?? 0) * 60 + (mFim ?? 0)

    const slotsParaCriar: Array<{
      id_organizacao_horario_disponivel: string
      id_agenda_horario_disponivel: string
      inicio_horario_disponivel: Date
      fim_horario_disponivel: Date
      capacidade_horario_disponivel: number
    }> = []

    const diaAtual = new Date(dataInicio)
    diaAtual.setHours(0, 0, 0, 0)

    const limiteFim = new Date(dataFim)
    limiteFim.setHours(23, 59, 59, 999)

    while (diaAtual <= limiteFim) {
      const diaDaSemana = diaAtual.getDay() // 0 = Domingo, 1 = Segunda, ...

      if (diasSemana.includes(diaDaSemana)) {
        let tempoAtual = inicioMinutos

        while (tempoAtual + duracaoSlot <= fimMinutos) {
          const horaInicio = Math.floor(tempoAtual / 60)
          const minutoInicio = tempoAtual % 60

          const horaFim = Math.floor((tempoAtual + duracaoSlot) / 60)
          const minutoFim = (tempoAtual + duracaoSlot) % 60

          const slotInicio = new Date(diaAtual)
          slotInicio.setHours(horaInicio, minutoInicio, 0, 0)

          const slotFim = new Date(diaAtual)
          slotFim.setHours(horaFim, minutoFim, 0, 0)

          slotsParaCriar.push({
            id_organizacao_horario_disponivel: tenant_id,
            id_agenda_horario_disponivel: agenda_id,
            inicio_horario_disponivel: slotInicio,
            fim_horario_disponivel: slotFim,
            capacidade_horario_disponivel: 1,
          })

          tempoAtual += duracaoSlot + intervalo
        }
      }

      diaAtual.setDate(diaAtual.getDate() + 1)
    }

    if (slotsParaCriar.length === 0) {
      return []
    }

    await prisma.horarioDisponivel.createMany({
      data: slotsParaCriar,
    })

    return slotsParaCriar
  }

  async notificarReserva(reserva: {
    id_reserva_agenda: string
    id_organizacao_reserva_agenda: string
    email_reservante_reserva_agenda: string | null
  }) {
    const NOTIFICACOES_URL = process.env.NOTIFICACOES_API_URL ?? 'http://localhost:3001/api/v1/notificacoes'

    try {
      if (!reserva.email_reservante_reserva_agenda) return

      const payload = {
        tenant_id: reserva.id_organizacao_reserva_agenda,
        canal: 'email',
        destinatario: reserva.email_reservante_reserva_agenda,
        titulo: 'Confirmação de Agendamento',
        mensagem: `A sua reserva foi confirmada com sucesso. ID da Reserva: ${reserva.id_reserva_agenda}`,
      }

      const response = await fetch(NOTIFICACOES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': crypto.randomUUID(),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error('[AGENDAMENTO] Erro ao disparar notificação', response.status)
      }
    } catch (err) {
      console.error('[AGENDAMENTO] Falha na integração com Notificações:', err)
    }
  }
}
