// server/tests/chat.test.ts
import { describe, it, expect, vi } from 'vitest'
import { getConversationContext, buildSystemPrompt } from '../../../servicos-global/tenant/gabi/server/services/chat.js'
import prisma from '../../../servicos-global/tenant/gabi/server/lib/prisma.js'

vi.mock('../../../servicos-global/tenant/gabi/server/lib/prisma.js', () => ({
  default: {
    gabiMessage: {
      findMany: vi.fn(),
      count: vi.fn()
    }
  }
}))

describe('Chat Service', () => {
  it('buildSystemPrompt deve injetar name, tenant e activeServices corretor', () => {
    const prompt = buildSystemPrompt({
      userName: 'João',
      userRole: 'admin',
      tenantName: 'Minha Empresa',
      activeServices: ['Email', 'CRM']
    })

    expect(prompt).toContain('João (admin)')
    expect(prompt).toContain('Minha Empresa')
    expect(prompt).toContain('Email, CRM')
    expect(prompt).toContain('Nunca execute uma ação sem verificar permissão primeiro')
  })

  it('getConversationContext deve adicionar mensagem de sumarização quando as mensagens excederem o limite configurado (20)', async () => {
    // Simula 20 mensagens mais recentes
    const mockMessages = Array.from({ length: 20 }, (_, i) => ({
      role: 'user',
      content: `msg ${i}`,
      created_at: new Date()
    }))

    const findMany = prisma.gabiMessage.findMany as any
    const count = prisma.gabiMessage.count as any

    findMany.mockResolvedValueOnce(mockMessages)
    // Simula que haviam 25 mensagens totais
    count.mockResolvedValueOnce(25)

    const context = await getConversationContext('conversa-123', 20)

    // A primeira mensagem deve ser o aviso de sumarização
    expect(context[0].role).toBe('system')
    expect(context[0].content).toContain('Conversa sumarizada')
    // Tem as 20 originais + 1 do resumo = 21 no contexto retornado
    expect(context.length).toBe(21)
  })
})
