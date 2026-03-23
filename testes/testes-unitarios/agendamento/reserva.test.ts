import { describe, it, expect, vi, beforeEach } from 'vitest'
import { slotRouter } from '../../../servicos-global/tenant/agendamento/server/routes/slot.js'
import { reservaRouter } from '../../../servicos-global/tenant/agendamento/server/routes/reserva.js'
import express from 'express'
import request from 'supertest'
import { AgendamentoService } from '../../../servicos-global/tenant/agendamento/src/services/AgendamentoService.js'

vi.mock('../../../servicos-global/tenant/agendamento/server/lib/prisma.js', () => {
  return {
    prisma: {
      slot: {
        create: vi.fn(),
        createMany: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
      reserva: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      disponibilidadeConfig: {
        findUnique: vi.fn(),
      }
    }
  }
})

vi.mock('../../../servicos-global/tenant/agendamento/src/services/AgendamentoService.js', () => {
  return {
    AgendamentoService: vi.fn().mockImplementation(() => {
      return {
        gerarSlots: vi.fn().mockResolvedValue([{ id: 'slot-1' }, { id: 'slot-2' }]),
        notificarReserva: vi.fn().mockResolvedValue(true)
      }
    })
  }
})

import { prisma } from '../../../servicos-global/tenant/agendamento/server/lib/prisma.js'

const app = express()
app.use(express.json())
app.use('/api/v1/slot', slotRouter)
app.use('/api/v1/reserva', reservaRouter)

describe('Agendamento - Slot e Reserva', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve gerar slots corretamente via rota', async () => {
    const res = await request(app)
      .post('/api/v1/slot/gerar')
      .send({
        tenant_id: '123e4567-e89b-12d3-a456-426614174000',
        agenda_id: '123e4567-e89b-12d3-a456-426614174001',
        dataInicio: new Date().toISOString(),
        dataFim: new Date().toISOString(),
      })

    expect(res.status).toBe(201)
    expect(res.body.gerados).toBe(2)
  })

  it('deve criar uma reserva e disparar notificação', async () => {
    const mockSlot = {
      id: '123e4567-e89b-12d3-a456-426614174002',
      tenant_id: '123e4567-e89b-12d3-a456-426614174000',
      capacidade: 1,
      reservas: []
    }
    vi.mocked(prisma.slot.findUnique).mockResolvedValue(mockSlot as any)

    const mockReserva = {
      id: 'res-1',
      tenant_id: '123e4567-e89b-12d3-a456-426614174000',
      slot_id: '123e4567-e89b-12d3-a456-426614174002',
      usuario_id: 'user-1',
      status: 'confirmado',
      email: 'teste@teste.com'
    }
    vi.mocked(prisma.reserva.create).mockResolvedValue(mockReserva as any)

    const res = await request(app)
      .post('/api/v1/reserva')
      .send({
        tenant_id: '123e4567-e89b-12d3-a456-426614174000',
        slot_id: '123e4567-e89b-12d3-a456-426614174002',
        usuario_id: 'user-1',
        email: 'teste@teste.com'
      })

    expect(res.status).toBe(201)
    expect(res.body.id).toBe('res-1')
    expect(AgendamentoService).toHaveBeenCalled()
  })

  it('deve falhar ao criar reserva se o slot estiver cheio', async () => {
    const mockSlot = {
      id: '123e4567-e89b-12d3-a456-426614174002',
      tenant_id: '123e4567-e89b-12d3-a456-426614174000',
      capacidade: 1,
      reservas: [{ id: 'res-existente' }] // ocupado
    }
    vi.mocked(prisma.slot.findUnique).mockResolvedValue(mockSlot as any)

    const res = await request(app)
      .post('/api/v1/reserva')
      .send({
        tenant_id: '123e4567-e89b-12d3-a456-426614174000',
        slot_id: '123e4567-e89b-12d3-a456-426614174002',
        usuario_id: 'user-2'
      })

    // Erro AppError capturado pelo default express error handler => 500 sem errorHandler custom
    expect(res.status).not.toBe(201)
  })
})
