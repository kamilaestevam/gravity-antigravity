// @vitest-environment node
// TST-FUNC-CONF-SIGNUP-001 — Fluxo signup → onboarding → hub
// Valida: (1) signUpFallbackRedirectUrl aponta para /trial,
//         (2) guard do Onboarding redireciona para /hub se usuário já tem org,
//         (3) guard do hub redireciona para /trial se /api/v1/hub/init retorna 401,
//         (4) label de role não exibe "Standard" como fallback silencioso (Mand. 08).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(import.meta.dirname, '../../..')

function lerArquivo(caminho: string): string {
  return readFileSync(resolve(ROOT, caminho), 'utf-8')
}

// ─── 1. signUpFallbackRedirectUrl ──────────────────────────────────────────────
describe('signUpFallbackRedirectUrl em main.tsx', () => {
  it('ClerkProvider deve usar /trial como signUpFallbackRedirectUrl', () => {
    const conteudo = lerArquivo('servicos-global/configurador/src/main.tsx')
    expect(conteudo).toContain('signUpFallbackRedirectUrl="/trial"')
    expect(conteudo).not.toContain('signUpFallbackRedirectUrl="/hub"')
  })
})

// ─── 2. SSO callbacks em App.tsx ───────────────────────────────────────────────
describe('SSO callbacks em App.tsx', () => {
  it('AuthenticateWithRedirectCallback deve usar /trial para signUp e /hub para signIn', () => {
    const conteudo = lerArquivo('servicos-global/configurador/src/App.tsx')

    const signUpRedirects = conteudo.match(/signUpFallbackRedirectUrl="([^"]+)"/g) ?? []
    expect(signUpRedirects.length).toBeGreaterThan(0)
    for (const match of signUpRedirects) {
      expect(match).toBe('signUpFallbackRedirectUrl="/trial"')
    }

    const signInRedirects = conteudo.match(/signInFallbackRedirectUrl="([^"]+)"/g) ?? []
    expect(signInRedirects.length).toBeGreaterThan(0)
    for (const match of signInRedirects) {
      expect(match).toBe('signInFallbackRedirectUrl="/hub"')
    }
  })
})

// ─── 3. Fallback "Standard" removido (Mand. 08) ───────────────────────────────
describe('fallback de role no SelecionarWorkspace', () => {
  it('não deve exibir "Standard" como fallback quando tipo_usuario é nulo', () => {
    const conteudo = lerArquivo('servicos-global/configurador/src/pages/SelecionarWorkspace.tsx')
    expect(conteudo).not.toMatch(/roleReady\s*\?\s*['"]Standard['"]/)
  })
})

// ─── 4. Guard do Onboarding redireciona se já tem org ──────────────────────────
describe('guard do Onboarding (/trial)', () => {
  it('componente Onboarding deve verificar /api/v1/me e redirecionar se org existe', () => {
    const conteudo = lerArquivo('servicos-global/configurador/src/pages/Onboarding.tsx')
    expect(conteudo).toContain('/api/v1/me')
    expect(conteudo).toContain("navigate('/hub'")
    expect(conteudo).toContain('verificandoOrg')
  })
})

// ─── 5. Guard do hub redireciona para /trial se 401 ───────────────────────────
describe('guard do hub (SelecionarWorkspace)', () => {
  it('deve redirecionar para /trial quando hub/init retorna 401', () => {
    const conteudo = lerArquivo('servicos-global/configurador/src/pages/SelecionarWorkspace.tsx')
    expect(conteudo).toContain('res.status === 401')
    expect(conteudo).toContain("navigate('/trial'")
  })
})

// ─── 6. organizacao-service importa criarEmpresa (tabela empresa Cadastros) ───
describe('organizacao-service — saga onboarding Cadastros', () => {
  it('deve importar criarEmpresa/compensarEmpresa para POST /empresas', () => {
    const conteudo = lerArquivo('servicos-global/configurador/server/services/organizacao-service.ts')
    expect(conteudo).toMatch(/import\s*\{\s*criarEmpresa,\s*compensarEmpresa\s*\}/)
    expect(conteudo).toContain('await criarEmpresa(')
    expect(conteudo).toContain('await compensarEmpresa(')
    expect(conteudo).not.toMatch(/await criarFornecedor\(/)
  })
})

// ─── 7. cadastros-client usa prefixo /api/v1 ──────────────────────────────────
describe('cadastros-client URL com prefixo /api/v1', () => {
  it('getCadastrosUrl() deve incluir /api/v1 no retorno', () => {
    const conteudo = lerArquivo('servicos-global/configurador/server/services/cadastros-client.ts')
    expect(conteudo).toMatch(/return\s+`\$\{base\}\/api\/v1`/)
  })

  it('chamadas a /empresas e /fornecedores devem estar corretas com o prefixo', () => {
    const conteudo = lerArquivo('servicos-global/configurador/server/services/cadastros-client.ts')
    expect(conteudo).not.toContain("'http://localhost:8031/fornecedores'")
    expect(conteudo).toContain('/empresas')
    expect(conteudo).toContain('/fornecedores')
  })
})
