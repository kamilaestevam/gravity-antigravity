// @vitest-environment node
/**
 * Testes unitários — enviarWhatsApp() no notificador-sync-ncm.ts
 *
 * Tipo de módulo: Serviço (fire-and-forget S2S)
 * Cobertura: função enviarWhatsApp + despacho WhatsApp no fluxo principal
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mocks ────────────────────────────────────────────────────────────────────

const { mockFindUnique } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
}))

vi.mock('../../../servicos-global/cadastros/generated/index.js', () => ({
  PrismaClient: vi.fn(),
}))

// ── Setup ────────────────────────────────────────────────────────────────────

const prismaMock = {
  ncmSyncAgendamento: {
    findUnique: mockFindUnique,
  },
} as any

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn())

  process.env.CHAVE_INTERNA_SERVICO = 'test-chave-interna'
  process.env.WHATSAPP_SERVICE_URL = 'http://whatsapp-test:3099'
  process.env.EMAIL_SERVICE_URL = 'http://email-test:3098'
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.CHAVE_INTERNA_SERVICO
  delete process.env.WHATSAPP_SERVICE_URL
  delete process.env.EMAIL_SERVICE_URL
})

// Import DEPOIS dos mocks
const { despacharNotificacoesNcmSync } = await import(
  '../../../servicos-global/cadastros/server/src/services/notificador-sync-ncm.js'
)

// ── Helpers ──────────────────────────────────────────────────────────────────

function criarNotificador(overrides: Record<string, unknown> = {}) {
  return {
    id: 'notif-001',
    nome: 'João',
    contato: '5548999990000',
    condicao: 'Sempre',
    canal: 'WhatsApp',
    ...overrides,
  }
}

function mockFetchOk() {
  ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
    new Response(JSON.stringify({ success: true }), { status: 200 }),
  )
}

function mockFetchFail(status = 500) {
  ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
    new Response(JSON.stringify({ error: 'fail' }), { status }),
  )
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe('despacharNotificacoesNcmSync — canal WhatsApp', () => {
  it('despacha WhatsApp para destinatário com canal WhatsApp em SUCESSO', async () => {
    mockFindUnique.mockResolvedValue({
      notificadores_ncm_sync_agendamento: [criarNotificador({ canal: 'WhatsApp', condicao: 'Sempre' })],
    })
    mockFetchOk()

    await despacharNotificacoesNcmSync(prismaMock, 'SUCESSO', { total: 100, adicionados: 5, alterados: 2, removidos: 0, duracaoMs: 3000 })

    // Aguardar micro-tasks (fire-and-forget com void)
    await new Promise(r => setTimeout(r, 50))

    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls
    const whatsappCall = calls.find((c: unknown[]) => String(c[0]).includes('/api/v1/whatsapp/send'))
    expect(whatsappCall).toBeDefined()

    const body = JSON.parse(whatsappCall![1].body)
    expect(body.phone_number).toBe('5548999990000')
    expect(body.text).toContain('Sync NCM concluído')
  })

  it('despacha WhatsApp E Email para destinatário com canal Ambos', async () => {
    mockFindUnique.mockResolvedValue({
      notificadores_ncm_sync_agendamento: [criarNotificador({ canal: 'Ambos', condicao: 'Sempre' })],
    })
    mockFetchOk()

    await despacharNotificacoesNcmSync(prismaMock, 'SUCESSO', { total: 50, adicionados: 1, alterados: 0, removidos: 0, duracaoMs: 1000 })

    await new Promise(r => setTimeout(r, 50))

    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls
    const whatsappCall = calls.find((c: unknown[]) => String(c[0]).includes('/api/v1/whatsapp/send'))
    const emailCall = calls.find((c: unknown[]) => String(c[0]).includes('/api/v1/envios-email'))

    expect(whatsappCall).toBeDefined()
    expect(emailCall).toBeDefined()
  })

  it('NÃO despacha WhatsApp para destinatário com canal E-mail', async () => {
    mockFindUnique.mockResolvedValue({
      notificadores_ncm_sync_agendamento: [criarNotificador({ canal: 'E-mail', condicao: 'Sempre' })],
    })
    mockFetchOk()

    await despacharNotificacoesNcmSync(prismaMock, 'SUCESSO', { total: 10, adicionados: 0, alterados: 0, removidos: 0, duracaoMs: 500 })

    await new Promise(r => setTimeout(r, 50))

    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls
    const whatsappCall = calls.find((c: unknown[]) => String(c[0]).includes('/api/v1/whatsapp/send'))
    expect(whatsappCall).toBeUndefined()
  })

  it('envia headers S2S corretos (x-chave-interna-servico, x-id-organizacao)', async () => {
    mockFindUnique.mockResolvedValue({
      notificadores_ncm_sync_agendamento: [criarNotificador({ canal: 'WhatsApp', condicao: 'Sempre' })],
    })
    mockFetchOk()

    await despacharNotificacoesNcmSync(prismaMock, 'ERRO', null, 'Timeout no portal')

    await new Promise(r => setTimeout(r, 50))

    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls
    const whatsappCall = calls.find((c: unknown[]) => String(c[0]).includes('/api/v1/whatsapp/send'))
    expect(whatsappCall).toBeDefined()

    const headers = whatsappCall![1].headers
    expect(headers['x-chave-interna-servico']).toBe('test-chave-interna')
    expect(headers['x-id-organizacao']).toBe('system')
  })

  it('falha silenciosamente (fire-and-forget) quando WhatsApp retorna HTTP 500', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mockFindUnique.mockResolvedValue({
      notificadores_ncm_sync_agendamento: [criarNotificador({ canal: 'WhatsApp', condicao: 'Sempre' })],
    })
    mockFetchFail(500)

    // Não deve lançar
    await despacharNotificacoesNcmSync(prismaMock, 'SUCESSO', { total: 10, adicionados: 0, alterados: 0, removidos: 0, duracaoMs: 200 })

    await new Promise(r => setTimeout(r, 50))

    // Deve logar warning mas não lançar
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[notificador-sync-ncm] WhatsApp falhou para'),
    )

    warnSpy.mockRestore()
  })

  it('respeita condicao Apenas Erros — não despacha WhatsApp em SUCESSO', async () => {
    mockFindUnique.mockResolvedValue({
      notificadores_ncm_sync_agendamento: [criarNotificador({ canal: 'WhatsApp', condicao: 'Apenas Erros' })],
    })
    mockFetchOk()

    await despacharNotificacoesNcmSync(prismaMock, 'SUCESSO', { total: 10, adicionados: 0, alterados: 0, removidos: 0, duracaoMs: 200 })

    await new Promise(r => setTimeout(r, 50))

    expect(fetch).not.toHaveBeenCalled()
  })

  it('despacha WhatsApp com condicao Apenas Erros quando status=ERRO', async () => {
    mockFindUnique.mockResolvedValue({
      notificadores_ncm_sync_agendamento: [criarNotificador({ canal: 'WhatsApp', condicao: 'Apenas Erros' })],
    })
    mockFetchOk()

    await despacharNotificacoesNcmSync(prismaMock, 'ERRO', null, 'Falha de rede')

    await new Promise(r => setTimeout(r, 50))

    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls
    const whatsappCall = calls.find((c: unknown[]) => String(c[0]).includes('/api/v1/whatsapp/send'))
    expect(whatsappCall).toBeDefined()

    const body = JSON.parse(whatsappCall![1].body)
    expect(body.text).toContain('Sync NCM falhou')
  })

  it('usa URL correta do WHATSAPP_SERVICE_URL', async () => {
    mockFindUnique.mockResolvedValue({
      notificadores_ncm_sync_agendamento: [criarNotificador({ canal: 'WhatsApp', condicao: 'Sempre' })],
    })
    mockFetchOk()

    await despacharNotificacoesNcmSync(prismaMock, 'SUCESSO', { total: 1, adicionados: 0, alterados: 0, removidos: 0, duracaoMs: 100 })

    await new Promise(r => setTimeout(r, 50))

    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls
    const whatsappCall = calls.find((c: unknown[]) => String(c[0]).includes('/api/v1/whatsapp/send'))
    expect(whatsappCall![0]).toBe('http://whatsapp-test:3099/api/v1/whatsapp/send')
  })
})
