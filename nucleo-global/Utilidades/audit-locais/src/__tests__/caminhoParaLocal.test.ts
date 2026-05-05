import { describe, it, expect } from 'vitest'
import { caminhoParaLocal, formatarLocal, caminhoParaLocalString } from '../index'

describe('caminhoParaLocal — paths conhecidos', () => {
  // Login
  it.each([
    ['/api/v1/auth/login',          'Login'],
    ['/api/v1/auth/logout',         'Login'],
    ['/api/v1/auth/sessions',       'Login'],
    ['/api/v1/webhooks/clerk',      'Login | Webhook Clerk'],
  ])('%s → %s', (path, esperado) => {
    expect(caminhoParaLocalString(path)).toBe(esperado)
  })

  // Onboarding
  it('POST /api/v1/organizacoes (sem /me) é Onboarding', () => {
    expect(caminhoParaLocalString('/api/v1/organizacoes')).toBe('Onboarding')
    expect(caminhoParaLocalString('/api/v1/organizacoes/')).toBe('Onboarding')
  })

  // HUB
  it.each([
    ['/api/v1/hub',                              'HUB'],
    ['/api/v1/hub/init',                         'HUB'],
    ['/api/v1/me/preferencias',                  'HUB | Workspace ativo'],
    ['/api/v1/me/sugestoes-subdominio?base=foo', 'HUB | Subdomínio'],
  ])('%s → %s', (path, esperado) => {
    expect(caminhoParaLocalString(path)).toBe(esperado)
  })

  // Core
  it.each([
    ['/api/v1/notificacoes',           'Core | Notificações'],
    ['/api/v1/notificacoes/123/lida',  'Core | Notificações'],
    ['/api/v1/historico-global/logs',  'Core | Histórico Global'],
    ['/api/v1/admin/historico-global/logs', 'Core | Histórico Global'],
    ['/api/tenant/preferencias',       'Core | Preferências'],
  ])('%s → %s', (path, esperado) => {
    expect(caminhoParaLocalString(path)).toBe(esperado)
  })

  // Admin
  it.each([
    ['/api/v1/admin/visao-geral',     'Admin | Visão Geral'],
    ['/api/v1/admin/organizacoes',    'Admin | Organizações'],
    ['/api/v1/admin/usuarios',        'Admin | Usuários'],
    ['/api/v1/admin/produtos-gravity','Admin | Produtos Gravity'],
    ['/api/v1/admin/financeiro',      'Admin | Financeiro'],
    ['/api/v1/admin/deploy',          'Admin | Deploy'],
    ['/api/v1/admin/testes-gerais',   'Admin | Testes Gerais'],
    ['/api/v1/admin/seguranca',       'Admin | Segurança'],
    ['/api/v1/admin/eventos-seguranca', 'Admin | Segurança'],
    ['/api/v1/admin/integracao-ncm',  'Admin | NCM Siscomex'],
    ['/api/v1/admin/cadastros-globais','Admin | Cadastros Globais'],
    ['/api/v1/api-cockpit/admin',     'Admin | API Cockpit'],
  ])('%s → %s', (path, esperado) => {
    expect(caminhoParaLocalString(path)).toBe(esperado)
  })

  // Configurador (workspace pages)
  it.each([
    ['/api/v1/me/workspaces',                   'Configurador | Workspaces'],
    ['/api/v1/me/workspaces/abc123',            'Configurador | Workspaces'],
    ['/api/v1/organizacoes/me',                 'Configurador | Organização'],
    ['/api/v1/historico-organizacao',           'Configurador | Histórico'],
    ['/api/v1/usuarios',                        'Configurador | Usuários'],
    ['/api/v1/faturas',                         'Configurador | Financeiro'],
    ['/api/v1/api-cockpit',                     'Configurador | API Cockpit'],
    ['/api/v1/api-cockpit/tokens',              'Configurador | API Cockpit'],
    ['/api/v1/taxa-cambio',                     'Configurador | Taxa de Câmbio'],
    ['/api/v1/tokens-servico',                  'Configurador | Tokens de Serviço'],
    ['/api/v1/workspaces/abc/produtos',         'Configurador | Produtos do Workspace'],
    ['/api/v1/produtos',                        'Configurador | Produtos Gravity'],
  ])('%s → %s', (path, esperado) => {
    expect(caminhoParaLocalString(path)).toBe(esperado)
  })

  // Produtos
  it.each([
    ['/api/v1/pedido',                  'Pedido'],
    ['/api/v1/pedido/lista',            'Pedido | Lista'],
    ['/api/v1/pedido/dashboard',        'Pedido | Dashboard'],
    ['/api/v1/pedido/kanban',           'Pedido | Kanban'],
    ['/api/v1/pedido/configuracoes',    'Pedido | Configuracoes'],
    ['/api/v1/bid-frete/dashboard',     'Bid Frete | Dashboard'],
    ['/api/v1/bid-cambio/lista',        'Bid Câmbio | Lista'],
    ['/api/v1/lpco/configuracoes',      'LPCO | Configuracoes'],
    ['/api/v1/nf-importacao/lista',     'NF Importação | Lista'],
    ['/api/v1/processo/dashboard',      'Processo | Dashboard'],
    ['/api/v1/simula-custo/dashboard',  'Simula Custo | Dashboard'],
    ['/api/v1/financeiro-comex/lista',  'Financeiro Comex | Lista'],
  ])('%s → %s', (path, esperado) => {
    expect(caminhoParaLocalString(path)).toBe(esperado)
  })

  // Internos
  it('S2S internos → Sistema | S2S', () => {
    expect(caminhoParaLocalString('/api/v1/internal/eventos-seguranca')).toBe('Sistema | S2S')
  })
})

describe('caminhoParaLocal — fallbacks', () => {
  it('endpoint vazio + módulo conhecido → usa módulo', () => {
    const r = caminhoParaLocal(undefined, 'pedido', 'Pedido')
    expect(r.sessao).toBe('Pedido')
    expect(r.subsessao).toBe('Pedido')
  })

  it('endpoint vazio + módulo desconhecido → capitaliza', () => {
    const r = caminhoParaLocal(null, 'meu-modulo')
    expect(r.sessao).toBe('Meu Modulo')
  })

  it('endpoint vazio + tipoRecurso só → Desconhecido | TipoRecurso', () => {
    const r = caminhoParaLocal('', null, 'Pedido')
    expect(r.sessao).toBe('Desconhecido')
    expect(r.subsessao).toBe('Pedido')
  })

  it('tudo vazio → Desconhecido', () => {
    const r = caminhoParaLocal(null)
    expect(r.sessao).toBe('Desconhecido')
    expect(r.subsessao).toBeUndefined()
  })

  it('path absurdo + módulo conhecido → usa módulo', () => {
    const r = caminhoParaLocal('/path/totalmente/inventado', 'auth')
    expect(r.sessao).toBe('Login')
  })
})

describe('formatarLocal', () => {
  it('com subsessão', () => {
    expect(formatarLocal({ sessao: 'A', subsessao: 'B' })).toBe('A | B')
  })
  it('sem subsessão', () => {
    expect(formatarLocal({ sessao: 'A' })).toBe('A')
  })
})

describe('caminhoParaLocal — robustez de input', () => {
  it('querystring é ignorada', () => {
    expect(caminhoParaLocalString('/api/v1/me/workspaces?cursor=abc')).toBe('Configurador | Workspaces')
  })
  it('fragmento é ignorado', () => {
    expect(caminhoParaLocalString('/api/v1/admin/usuarios#section')).toBe('Admin | Usuários')
  })
  it('barras finais são ignoradas', () => {
    expect(caminhoParaLocalString('/api/v1/me/workspaces///')).toBe('Configurador | Workspaces')
  })
})
