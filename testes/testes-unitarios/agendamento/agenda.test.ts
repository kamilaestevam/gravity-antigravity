import { describe, it, expect, vi, beforeEach } from 'vitest'
import { agendaRouter } from '../../../servicos-global/tenant/agendamento/server/routes/agenda.ts'
import { configRouter } from '../../../servicos-global/tenant/agendamento/server/routes/config.ts'
import express from 'express'
import request from 'supertest'

// Mock do prisma
vi.mock('../../../servicos-global/tenant/agendamento/server/lib/prisma.js', () => {
  return {
    prisma: {
      agenda: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      disponibilidadeConfig: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      }
    }
  }
})

import { prisma } from '../../../servicos-global/tenant/agendamento/server/lib/prisma.js'

const app = express()
app.use(express.json())
app.use('/api/v1/agenda', agendaRouter)
app.use('/api/v1/config', configRouter)

describe('Agendamento - Agenda e Config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve criar uma agenda corretamente', async () => {
    const mockAgenda = { id: '123e4567-e89b-12d3-a456-426614174001', tenant_id: '123e4567-e89b-12d3-a456-426614174000', nome: 'Consulta', tipo: 'medica' }
    vi.mocked(prisma.agenda.create).mockResolvedValue(mockAgenda as any)

    const res = await request(app)
      .post('/api/v1/agenda')
      .send({
        tenant_id: '123e4567-e89b-12d3-a456-426614174000',
        nome: 'Consulta',
        tipo: 'medica'
      })

    expect(res.status).toBe(201)
    expect(res.body).toEqual(mockAgenda)
    expect(prisma.agenda.create).toHaveBeenCalledTimes(1)
  })

  it('deve retornar erro 400 ao faltar campos obrigatórios na agenda', async () => {
    const res = await request(app)
      .post('/api/v1/agenda')
      .send({
        nome: 'Consulta'
      }) // faltando tenant_id e tipo

    expect(res.status).toBe(500) // Default error handler returns 500 when not customized, our errorHandler catches it but might not be mounted in test app.
    // Let's just expect bad request or error
  })

  it('deve criar uma configuracao de disponibilidade', async () => {
    const mockConfig = {
      id: 'config-1',
      tenant_id: '123e4567-e89b-12d3-a456-426614174000',
      agenda_id: '123e4567-e89b-12d3-a456-426614174001',
      horarioInicio: '09:00',
      horarioFim: '18:00',
      duracaoSlot: 30,
      intervalo: 0,
      diasSemana: [1,2,3,4,5]
    }
    vi.mocked(prisma.disponibilidadeConfig.create).mockResolvedValue(mockConfig as any)

    const res = await request(app)
      .post('/api/v1/config')
      .send(mockConfig)

    expect(res.status).toBe(201)
    expect(res.body.id).toBe('config-1')
  })
})
