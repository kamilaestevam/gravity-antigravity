// TST-FUN-LOGIN-000001 — Porteiro SSOT wiring (App.tsx)
// Plano: testes/testes-unitarios/login/plano-teste/PLANO-LOGIN-PORTEIRO-SSOT.json
// Substitui: testes/testes-funcionais/configurador/fluxo-signup-onboarding.test.ts (FONTE PRIMARIA)
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(import.meta.dirname, '../../..')

function lerArquivo(caminho: string): string {
  return readFileSync(resolve(ROOT, caminho), 'utf-8')
}

describe('TST-FUN-LOGIN-000001 — porteiro SSOT em App.tsx', () => {
  it('FUN-001: deve importar NavigateDestinoPosAutenticacao e useDestinoPosAutenticacao', () => {
    const app = lerArquivo('servicos-global/configurador/src/App.tsx')
    expect(app).toContain('NavigateDestinoPosAutenticacao')
    expect(app).toContain('useDestinoPosAutenticacao')
    expect(app).toContain('destino-pos-autenticacao')
  })

  it('FUN-002: RootRedirect e PublicRoute usam porteiro (nao Navigate fixo /hub)', () => {
    const app = lerArquivo('servicos-global/configurador/src/App.tsx')
    expect(app).not.toMatch(/return isSignedIn \?\s*\(\s*<Navigate to="\/hub"/)
    expect(app).toContain('<NavigateDestinoPosAutenticacao replace />')
  })

  it('FUN-003: ProtectedRoute redireciona trial quando destino é trial', () => {
    const app = lerArquivo('servicos-global/configurador/src/App.tsx')
    expect(app).toContain("destino === 'trial'")
    expect(app).toContain('ROTAS_POS_AUTH.trial')
  })

  it('FUN-004: resolver SSOT existe em routing/destino-pos-autenticacao.ts', () => {
    const resolver = lerArquivo('servicos-global/configurador/src/routing/destino-pos-autenticacao.ts')
    expect(resolver).toContain('resolverDestinoPosAutenticacao')
    expect(resolver).toContain('meDestinoPorteiroSchema')
    expect(resolver).toContain('limparCacheDestinoPosAutenticacao')
  })
})

describe('TST-FUN-LOGIN-000002 — Clerk fallbacks alinhados ao porteiro', () => {
  it('FUN-010: signUpFallbackRedirectUrl="/trial" em main.tsx', () => {
    const main = lerArquivo('servicos-global/configurador/src/main.tsx')
    expect(main).toContain('signUpFallbackRedirectUrl="/trial"')
    expect(main).not.toContain('signUpFallbackRedirectUrl="/hub"')
  })

  it('FUN-011: SSO callbacks usam /trial signup e /hub signin', () => {
    const app = lerArquivo('servicos-global/configurador/src/App.tsx')
    const signUpRedirects = app.match(/signUpFallbackRedirectUrl="([^"]+)"/g) ?? []
    expect(signUpRedirects.length).toBeGreaterThan(0)
    for (const match of signUpRedirects) {
      expect(match).toBe('signUpFallbackRedirectUrl="/trial"')
    }
    const signInRedirects = app.match(/signInFallbackRedirectUrl="([^"]+)"/g) ?? []
    for (const match of signInRedirects) {
      expect(match).toBe('signInFallbackRedirectUrl="/hub"')
    }
  })
})

describe('TST-FUN-LOGIN-000003 — guards defensivos onboarding/hub', () => {
  it('FUN-020: Onboarding verifica /me e redireciona se org existe', () => {
    const onboarding = lerArquivo('servicos-global/configurador/src/pages/Onboarding.tsx')
    expect(onboarding).toContain('/api/v1/me')
    expect(onboarding).toContain("navigate('/hub'")
    expect(onboarding).toContain('limparCacheDestinoPosAutenticacao')
  })

  it('FUN-021: Hub redireciona 401 hub/init → /trial', () => {
    const hub = lerArquivo('servicos-global/configurador/src/pages/SelecionarWorkspace.tsx')
    expect(hub).toContain('res.status === 401')
    expect(hub).toContain("navigate('/trial'")
  })

  it('FUN-022: SignUp OTP navega para /trial após verificação', () => {
    const login = lerArquivo('nucleo-global/Login/login-global/src/LoginGlobal.tsx')
    expect(login).toContain("navigate('/trial'")
  })

  it('FUN-023: logout limpa cache do porteiro via limparCacheTipoUsuario', () => {
    const hook = lerArquivo('servicos-global/configurador/src/hooks/use-carregar-tipo-usuario.ts')
    expect(hook).toContain('limparCacheDestinoPosAutenticacao')
  })
})
