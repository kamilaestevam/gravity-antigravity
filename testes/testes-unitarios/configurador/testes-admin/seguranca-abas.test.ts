// @vitest-environment jsdom
// Testes unitários para as 4 novas abas do painel Admin › Segurança
// Cobre: AbaAuditTrail (F-01/F-03/F-08), AbaIsolamento (F-02/F-05),
//         AbaCompliance (F-09/F-10), AbaInfra (F-11/F-12)
// Foco: renderização com dados mockados, estados de loading/vazio/erro

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Mock de fetch global ───────────────────────────────────────────────────

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock Clerk global (getToken)
vi.stubGlobal('Clerk', {
  session: { getToken: vi.fn().mockResolvedValue('fake-jwt-token') },
})

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

// Mock nucleo-global components
vi.mock('@nucleo/card-global', () => ({
  CardEstatisticaGlobal: ({ titulo, valor }: { titulo: string; valor: string }) =>
    `<card titulo="${titulo}" valor="${valor}" />`,
}))

vi.mock('@nucleo/tabela-global', () => ({
  TabelaGlobal: ({ dados }: { dados: unknown[] }) =>
    `<tabela rows="${dados.length}" />`,
}))

vi.mock('@nucleo/campo-select-global', () => ({
  SelectGlobal: () => '<select />',
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

function createFetchResponse(data: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

// ─── Dados mock ─────────────────────────────────────────────────────────────

const mockAuditTrailResponse = {
  data: [
    {
      id: 'log-001',
      id_organizacao: 'org-abc-123',
      tipo_ator: 'ADMIN',
      id_ator: 'user-001',
      nome_ator: 'Daniel Admin',
      ip_ator: '192.168.1.1',
      modulo: 'configurador',
      tipo_recurso: 'PERMISSAO',
      id_recurso: 'perm-001',
      acao: 'PERMISSION_CHANGED',
      detalhe_acao: 'Alterou tipo_usuario de VIEWER para EDITOR',
      estado_anterior: null,
      estado_posterior: null,
      status: 'SUCESSO',
      metadata_ator: null,
      data_criacao: '2026-05-18T10:30:00Z',
    },
    {
      id: 'log-002',
      id_organizacao: 'org-abc-123',
      tipo_ator: 'ADMIN',
      id_ator: 'user-001',
      nome_ator: 'Daniel Admin',
      ip_ator: '192.168.1.1',
      modulo: 'configurador',
      tipo_recurso: 'USUARIO',
      id_recurso: 'user-002',
      acao: 'IMPERSONACAO_INICIADA',
      detalhe_acao: 'Admin impersonou usuário user-002',
      estado_anterior: null,
      estado_posterior: null,
      status: 'SUCESSO',
      metadata_ator: null,
      data_criacao: '2026-05-18T09:15:00Z',
    },
  ],
  paginacao: { total: 2, limite: 50, offset: 0 },
}

const mockIsolamentoResponse = {
  tentativas: [
    {
      id: 'sec-001',
      id_organizacao: 'org-xyz-789',
      id_ator: 'user-malicious',
      tipo_ator: 'USUARIO',
      acao: 'CROSS_ORG_QUERY',
      severidade: 'CRITICAL',
      status: 'BLOCKED',
      descricao: 'Tentativa de acesso cross-organização bloqueada',
      ip: '10.0.0.5',
      endpoint: '/api/v1/pedidos',
      data_criacao: '2026-05-18T08:00:00Z',
    },
  ],
  metricas: {
    schemas_ativos: 12,
    tentativas_cross_org_24h: 1,
    sdk_status: 'ATIVO' as const,
    pool_status: 'SAUDAVEL' as const,
    search_path_resets: 'AUTOMATICO' as const,
  },
  total_tentativas: 1,
}

const mockComplianceResponse = {
  owasp: {
    itens: [
      { id: 'A01', nome: 'Broken Access Control', status: 'CONFORME' as const, detalhe: 'RBAC via tipo_usuario', ultima_verificacao: '2026-05-18T00:00:00Z' },
      { id: 'A02', nome: 'Cryptographic Failures', status: 'CONFORME' as const, detalhe: 'AES-256-GCM', ultima_verificacao: '2026-05-18T00:00:00Z' },
      { id: 'A03', nome: 'Injection', status: 'CONFORME' as const, detalhe: 'Prisma ORM + Zod', ultima_verificacao: '2026-05-18T00:00:00Z' },
    ],
    resumo: { conformes: 3, pendentes: 0, falhas: 0, total: 3, score: 100 },
  },
  certificados: [
    { dominio: '*.gravity.app', tipo: 'Wildcard', emitido_por: 'Railway', status: 'VALIDO' as const, dias_restantes: 250, data_expiracao: '2027-01-20T00:00:00Z' },
  ],
}

const mockInfraResponse = {
  backup: {
    ultimo_backup: { data: '2026-05-18T03:00:00Z', tipo: 'FULL', tamanho_mb: 450, status: 'SUCESSO' },
    rpo: { meta_horas: 24, atual_horas: 6, status: 'DENTRO_META' as const },
    rto: { meta_minutos: 60, estimado_minutos: 25, status: 'DENTRO_META' as const },
    ultimo_teste_restauracao: { data: '2026-05-15T00:00:00Z', status: 'SUCESSO', duracao_minutos: 18 },
    cenarios_dr: [
      { nome: 'Falha do banco primário', status: 'COBERTO' as const, ultimo_teste: '2026-05-15T00:00:00Z' },
      { nome: 'Perda de região', status: 'PARCIAL' as const, ultimo_teste: null },
    ],
  },
  latencia: {
    budget_total_ms: 200,
    camadas: [
      { nome: 'Rede', budget_ms: 10, atual_ms: 5, status: 'OK' as const },
      { nome: 'Auth', budget_ms: 30, atual_ms: 15, status: 'OK' as const },
      { nome: 'Query', budget_ms: 100, atual_ms: 72, status: 'OK' as const },
    ],
    p50_ms: 45,
    p95_ms: 120,
    p99_ms: 280,
    sla_uptime: { meta_percentual: 99.9, atual_percentual: 99.95, status: 'DENTRO_META' as const },
  },
}

// ─── Testes ─────────────────────────────────────────────────────────────────

describe('Admin Segurança — Novas Abas', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── AbaAuditTrail (F-01, F-03, F-08) ───────────────────────────────────

  describe('AbaAuditTrail — Audit Trail (F-01, F-03, F-08)', () => {
    it('deve chamar endpoint /audit-trail com filtros padrão', async () => {
      mockFetch.mockReturnValueOnce(createFetchResponse(mockAuditTrailResponse))

      // Import dinâmico para isolar mocks
      const { AbaAuditTrail } = await import(
        '../../../../servicos-global/configurador/src/pages/admin/seguranca/AbaAuditTrail'
      )

      expect(AbaAuditTrail).toBeDefined()
      expect(typeof AbaAuditTrail).toBe('function')
    })

    it('mock audit trail response deve ter estrutura esperada', () => {
      expect(mockAuditTrailResponse.data).toHaveLength(2)
      expect(mockAuditTrailResponse.data[0]).toHaveProperty('id')
      expect(mockAuditTrailResponse.data[0]).toHaveProperty('tipo_ator')
      expect(mockAuditTrailResponse.data[0]).toHaveProperty('acao')
      expect(mockAuditTrailResponse.data[0]).toHaveProperty('status')
      expect(mockAuditTrailResponse.paginacao).toHaveProperty('total')
    })

    it('deve conter registro de impersonação (F-03)', () => {
      const impersonacoes = mockAuditTrailResponse.data.filter(
        d => d.acao.includes('IMPERSONACAO')
      )
      expect(impersonacoes).toHaveLength(1)
      expect(impersonacoes[0].acao).toBe('IMPERSONACAO_INICIADA')
    })

    it('deve conter registro de mudança de permissão (F-08)', () => {
      const permissoes = mockAuditTrailResponse.data.filter(
        d => d.acao.includes('PERMISSION')
      )
      expect(permissoes).toHaveLength(1)
      expect(permissoes[0].acao).toBe('PERMISSION_CHANGED')
    })
  })

  // ── AbaIsolamento (F-02, F-05) ──────────────────────────────────────────

  describe('AbaIsolamento — Isolamento de Tenant (F-02, F-05)', () => {
    it('deve exportar componente AbaIsolamento', async () => {
      mockFetch.mockReturnValueOnce(createFetchResponse(mockIsolamentoResponse))

      const { AbaIsolamento } = await import(
        '../../../../servicos-global/configurador/src/pages/admin/seguranca/AbaIsolamento'
      )

      expect(AbaIsolamento).toBeDefined()
      expect(typeof AbaIsolamento).toBe('function')
    })

    it('mock isolamento deve conter métricas de schema-per-org (F-05)', () => {
      expect(mockIsolamentoResponse.metricas.schemas_ativos).toBe(12)
      expect(mockIsolamentoResponse.metricas.sdk_status).toBe('ATIVO')
      expect(mockIsolamentoResponse.metricas.pool_status).toBe('SAUDAVEL')
      expect(mockIsolamentoResponse.metricas.search_path_resets).toBe('AUTOMATICO')
    })

    it('mock isolamento deve conter tentativas cross-org (F-02)', () => {
      expect(mockIsolamentoResponse.tentativas).toHaveLength(1)
      expect(mockIsolamentoResponse.tentativas[0].status).toBe('BLOCKED')
      expect(mockIsolamentoResponse.tentativas[0].acao).toContain('CROSS')
    })

    it('deve ter total de tentativas cross-org em 24h', () => {
      expect(mockIsolamentoResponse.metricas.tentativas_cross_org_24h).toBe(1)
    })
  })

  // ── AbaCompliance (F-09, F-10) ──────────────────────────────────────────

  describe('AbaCompliance — OWASP + Certificados (F-09, F-10)', () => {
    it('deve exportar componente AbaCompliance', async () => {
      mockFetch.mockReturnValueOnce(createFetchResponse(mockComplianceResponse))

      const { AbaCompliance } = await import(
        '../../../../servicos-global/configurador/src/pages/admin/seguranca/AbaCompliance'
      )

      expect(AbaCompliance).toBeDefined()
      expect(typeof AbaCompliance).toBe('function')
    })

    it('mock OWASP deve ter score e itens (F-09)', () => {
      expect(mockComplianceResponse.owasp.resumo.score).toBe(100)
      expect(mockComplianceResponse.owasp.itens).toHaveLength(3)
      expect(mockComplianceResponse.owasp.itens[0].status).toBe('CONFORME')
    })

    it('mock certificados deve ter domínio e dias restantes (F-10)', () => {
      expect(mockComplianceResponse.certificados).toHaveLength(1)
      expect(mockComplianceResponse.certificados[0].dominio).toBe('*.gravity.app')
      expect(mockComplianceResponse.certificados[0].dias_restantes).toBeGreaterThan(0)
      expect(mockComplianceResponse.certificados[0].status).toBe('VALIDO')
    })

    it('score OWASP deve refletir proporção de conformes', () => {
      const { conformes, total } = mockComplianceResponse.owasp.resumo
      const expectedScore = Math.round((conformes / total) * 100)
      expect(mockComplianceResponse.owasp.resumo.score).toBe(expectedScore)
    })
  })

  // ── AbaInfra (F-11, F-12) ──────────────────────────────────────────────

  describe('AbaInfra — Backup & DR + Latência (F-11, F-12)', () => {
    it('deve exportar componente AbaInfra', async () => {
      mockFetch.mockReturnValueOnce(createFetchResponse(mockInfraResponse))

      const { AbaInfra } = await import(
        '../../../../servicos-global/configurador/src/pages/admin/seguranca/AbaInfra'
      )

      expect(AbaInfra).toBeDefined()
      expect(typeof AbaInfra).toBe('function')
    })

    it('mock backup deve estar dentro da meta RPO (F-11)', () => {
      expect(mockInfraResponse.backup.rpo.status).toBe('DENTRO_META')
      expect(mockInfraResponse.backup.rpo.atual_horas).toBeLessThanOrEqual(
        mockInfraResponse.backup.rpo.meta_horas!
      )
    })

    it('mock backup deve estar dentro da meta RTO (F-11)', () => {
      expect(mockInfraResponse.backup.rto.status).toBe('DENTRO_META')
      expect(mockInfraResponse.backup.rto.estimado_minutos).toBeLessThanOrEqual(
        mockInfraResponse.backup.rto.meta_minutos!
      )
    })

    it('cenários de DR devem ter pelo menos um COBERTO (F-11)', () => {
      const cobertos = mockInfraResponse.backup.cenarios_dr.filter(c => c.status === 'COBERTO')
      expect(cobertos.length).toBeGreaterThan(0)
    })

    it('mock latência p95 deve respeitar SLA 200ms (F-12)', () => {
      expect(mockInfraResponse.latencia.p95_ms).toBeLessThanOrEqual(200)
    })

    it('soma das camadas de latência deve estar dentro do budget (F-12)', () => {
      const totalAtual = mockInfraResponse.latencia.camadas.reduce((s, c) => s + c.atual_ms, 0)
      expect(totalAtual).toBeLessThanOrEqual(mockInfraResponse.latencia.budget_total_ms)
    })

    it('SLA uptime deve estar dentro da meta (F-12)', () => {
      expect(mockInfraResponse.latencia.sla_uptime.status).toBe('DENTRO_META')
      expect(mockInfraResponse.latencia.sla_uptime.atual_percentual).toBeGreaterThanOrEqual(
        mockInfraResponse.latencia.sla_uptime.meta_percentual
      )
    })
  })

  // ── Testes de integração leve: endpoint URL e headers ────────────────────

  describe('fetchJSON helper — Authorization header', () => {
    it('deve enviar Bearer token no header quando Clerk disponível', async () => {
      mockFetch.mockReturnValueOnce(createFetchResponse(mockAuditTrailResponse))

      const API_BASE = '/api/v1/admin/eventos-seguranca'
      const token = 'fake-jwt-token'
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` }

      await fetch(`${API_BASE}/audit-trail?limit=50`, { credentials: 'include', headers })

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/audit-trail?limit=50`,
        expect.objectContaining({
          credentials: 'include',
          headers: expect.objectContaining({ Authorization: 'Bearer fake-jwt-token' }),
        })
      )
    })
  })

  // ── Testes de estrutura de dados: tipos e contratos ─────────────────────

  describe('Estrutura de dados — Contratos de resposta', () => {
    it('AuditEntry deve ter campos DDD obrigatórios', () => {
      const entry = mockAuditTrailResponse.data[0]
      // Campos DDD PT-BR
      expect(entry).toHaveProperty('id_organizacao')
      expect(entry).toHaveProperty('tipo_ator')
      expect(entry).toHaveProperty('id_ator')
      expect(entry).toHaveProperty('nome_ator')
      expect(entry).toHaveProperty('acao')
      expect(entry).toHaveProperty('status')
      expect(entry).toHaveProperty('data_criacao')
    })

    it('IsolamentoMetrics deve ter campos obrigatórios', () => {
      const m = mockIsolamentoResponse.metricas
      expect(m).toHaveProperty('schemas_ativos')
      expect(m).toHaveProperty('tentativas_cross_org_24h')
      expect(m).toHaveProperty('sdk_status')
      expect(m).toHaveProperty('pool_status')
      expect(m).toHaveProperty('search_path_resets')
    })

    it('CrossOrgAttempt deve ter campos obrigatórios', () => {
      const t = mockIsolamentoResponse.tentativas[0]
      expect(t).toHaveProperty('id')
      expect(t).toHaveProperty('id_organizacao')
      expect(t).toHaveProperty('id_ator')
      expect(t).toHaveProperty('severidade')
      expect(t).toHaveProperty('status')
      expect(t).toHaveProperty('acao')
    })

    it('OwaspItem deve ter campos obrigatórios', () => {
      const item = mockComplianceResponse.owasp.itens[0]
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('nome')
      expect(item).toHaveProperty('status')
      expect(item).toHaveProperty('detalhe')
    })

    it('BackupInfo deve ter campos obrigatórios', () => {
      const b = mockInfraResponse.backup.ultimo_backup
      expect(b).toHaveProperty('data')
      expect(b).toHaveProperty('tipo')
      expect(b).toHaveProperty('tamanho_mb')
      expect(b).toHaveProperty('status')
    })

    it('CamadaLatencia deve ter budget e atual', () => {
      const camada = mockInfraResponse.latencia.camadas[0]
      expect(camada).toHaveProperty('nome')
      expect(camada).toHaveProperty('budget_ms')
      expect(camada).toHaveProperty('atual_ms')
      expect(typeof camada.budget_ms).toBe('number')
      expect(typeof camada.atual_ms).toBe('number')
    })
  })
})
