// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as chatModule from '../../../servicos-global/servicos-plataforma/gabi/server/services/chat.js'

describe('agente v2 RAG', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('resolverKnowledgeParaPrompt retorna conteudo KB (fallback estatico sem pgvector)', async () => {
    const rag = await chatModule.resolverKnowledgeParaPrompt('como funciona o pedido?', '/pedido')

    expect(rag.knowledgeContent.length).toBeGreaterThan(0)
    expect(typeof rag.isRag).toBe('boolean')
  })

  it('buildSystemPromptV2 inclui nomenclatura Smart Docs e KB', () => {
    const prompt = chatModule.buildSystemPromptV2({
      userName: 'Maria',
      userRole: 'PADRAO',
      tenantName: 'org-1',
      activeServices: ['Pedido'],
      knowledgeContent: 'Base de teste',
      isRag: true,
      tipoUsuario: 'PADRAO',
      toolsDisponiveis: ['pedido.listar'],
    })

    expect(prompt).toContain('Smart Docs')
    expect(prompt).toContain('NUNCA diga "Smart Read"')
    expect(prompt).toContain('Base de teste')
  })
})
