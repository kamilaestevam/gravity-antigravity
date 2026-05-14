import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/services/kb-search.js', () => ({
  searchKnowledgeBase: vi.fn(),
}))

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/lib/prisma.js', () => ({
  default: {
    $queryRawUnsafe: vi.fn(),
    gabiMensagemIndividual: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
  },
}))

vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn().mockReturnValue('KB FALLBACK CONTENT'),
    existsSync: vi.fn().mockReturnValue(false),
    readdirSync: vi.fn().mockReturnValue([]),
  },
  readFileSync: vi.fn().mockReturnValue('KB FALLBACK CONTENT'),
  existsSync: vi.fn().mockReturnValue(false),
  readdirSync: vi.fn().mockReturnValue([]),
}))

import { buildSystemPrompt, selectKnowledge, _resetRagCache } from '../../../servicos-global/servicos-plataforma/gabi/server/services/chat.js'
import { searchKnowledgeBase } from '../../../servicos-global/servicos-plataforma/gabi/server/services/kb-search.js'
import prisma from '../../../servicos-global/servicos-plataforma/gabi/server/lib/prisma.js'

const mockSearchKb = vi.mocked(searchKnowledgeBase)
const mockPrismaRaw = vi.mocked(prisma.$queryRawUnsafe)

describe('buildSystemPrompt', () => {
  it('gera prompt com knowledge content fornecido', () => {
    const prompt = buildSystemPrompt({
      userName: 'TestUser',
      userRole: 'admin',
      tenantName: 'TestOrg',
      activeServices: ['Gabi IA'],
      currentPage: '/produto/pedido',
      knowledgeContent: 'CHUNK RAG RELEVANTE',
      isRag: true,
    })

    expect(prompt).toContain('Voce e a Gabi')
    expect(prompt).toContain('CHUNK RAG RELEVANTE')
    expect(prompt).toContain('BUSCA SEMANTICA')
  })

  it('gera prompt com label de segmento quando nao e RAG', () => {
    const prompt = buildSystemPrompt({
      userName: 'TestUser',
      userRole: 'user',
      tenantName: 'TestOrg',
      activeServices: [],
      knowledgeContent: 'SEGMENTO ESTATICO',
      isRag: false,
    })

    expect(prompt).toContain('SEGMENTO ESTATICO')
    expect(prompt).not.toContain('BUSCA SEMANTICA')
  })

  it('inclui contexto da pagina quando fornecido', () => {
    const prompt = buildSystemPrompt({
      userName: 'User',
      userRole: 'user',
      tenantName: 'Org',
      activeServices: [],
      currentPage: '/produto/lpco',
    })

    expect(prompt).toContain('Pagina atual: /produto/lpco')
  })

  it('mostra pagina desconhecida quando nao fornecida', () => {
    const prompt = buildSystemPrompt({
      userName: 'User',
      userRole: 'user',
      tenantName: 'Org',
      activeServices: [],
    })

    expect(prompt).toContain('Pagina atual: desconhecida')
  })
})

describe('selectKnowledge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    _resetRagCache()
  })

  it('usa fallback quando pgvector nao esta disponivel', async () => {
    mockPrismaRaw.mockRejectedValueOnce(new Error('relation "gabi_kb_chunk" does not exist'))

    const result = await selectKnowledge('como funciona o pedido?')

    expect(result.ragMeta).toBeNull()
    expect(result.knowledge).toBeTruthy()
  })

  it('usa RAG quando pgvector esta disponivel e retorna chunks', async () => {
    mockPrismaRaw.mockResolvedValueOnce([{ '1': 1 }])

    mockSearchKb.mockResolvedValueOnce({
      chunks: 'CHUNK 1\nCHUNK 2',
      meta: {
        chunks_retornados: 2,
        score_similaridade_medio: 0.85,
        tempo_busca_ms: 15,
        tokens_total_chunks: 500,
      },
    })

    const result = await selectKnowledge('como funciona o pedido?', '/produto/pedido')

    expect(result.ragMeta).not.toBeNull()
    expect(result.ragMeta?.chunks_retornados).toBe(2)
    expect(result.knowledge).toContain('CHUNK 1')
  })

  it('faz fallback quando RAG falha com erro', async () => {
    mockPrismaRaw.mockResolvedValueOnce([{ '1': 1 }])

    mockSearchKb.mockRejectedValueOnce(new Error('embedding API down'))

    const result = await selectKnowledge('teste')

    expect(result.ragMeta).toBeNull()
    expect(result.knowledge).toBeTruthy()
  })

  it('faz fallback quando RAG retorna chunks vazios', async () => {
    mockPrismaRaw.mockResolvedValueOnce([{ '1': 1 }])

    mockSearchKb.mockResolvedValueOnce({
      chunks: '',
      meta: {
        chunks_retornados: 0,
        score_similaridade_medio: 0,
        tempo_busca_ms: 5,
        tokens_total_chunks: 0,
      },
    })

    const result = await selectKnowledge('algo sem resultado')

    expect(result.ragMeta).toBeNull()
  })
})
