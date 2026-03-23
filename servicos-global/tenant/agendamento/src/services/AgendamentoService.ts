import { prisma } from '../../server/lib/prisma.js'
import { AppError } from '../../server/lib/errors.js'

export class AgendamentoService {
  async gerarSlots(tenant_id: string, agenda_id: string, dataInicio: Date, dataFim: Date) {
    const config = await prisma.disponibilidadeConfig.findUnique({
      where: { agenda_id },
    })

    if (!config || config.tenant_id !== tenant_id) {
      throw new AppError('Configuração de disponibilidade não encontrada para esta agenda', 404)
    }

    const { horarioInicio, horarioFim, duracaoSlot, intervalo, diasSemana } = config

    // Converter string HH:mm para minutos desde meia noite
    const [hInicio, mInicio] = horarioInicio.split(':').map(Number)
    const inicioMinutos = (hInicio ?? 0) * 60 + (mInicio ?? 0)

    const [hFim, mFim] = horarioFim.split(':').map(Number)
    const fimMinutos = (hFim ?? 0) * 60 + (mFim ?? 0)

    const slotsParaCriar = []

    let diaAtual = new Date(dataInicio)
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
            tenant_id,
            agenda_id,
            inicio: slotInicio,
            fim: slotFim,
            capacidade: 1, // Default,
          })

          tempoAtual += duracaoSlot + intervalo
        }
      }

      diaAtual.setDate(diaAtual.getDate() + 1)
    }

    if (slotsParaCriar.length === 0) {
      return []
    }

    await prisma.slot.createMany({
      data: slotsParaCriar,
    })

    return slotsParaCriar
  }

  async notificarReserva(reserva: any) {
    const NOTIFICACOES_URL = process.env.NOTIFICACOES_API_URL ?? 'http://localhost:8013/api/v1/notificacoes'
    
    // Tentativa de integração com Notificações (fire and forget ou aguardar sucesso)
    try {
      if (!reserva.email) return

      const payload = {
        tenant_id: reserva.tenant_id,
        canal: 'email',
        destinatario: reserva.email,
        titulo: 'Confirmação de Agendamento',
        mensagem: `A sua reserva foi confirmada com sucesso. ID da Reserva: ${reserva.id}`,
      }

      const response = await fetch(NOTIFICACOES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': crypto.randomUUID()
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        console.error('[AGENDAMENTO] Erro ao disparar notificação', response.status)
      }
    } catch (err) {
      console.error('[AGENDAMENTO] Falha na integração com Notificações:', err)
    }
  }
}
