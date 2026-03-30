/**
 * Testes unitarios — Renomeacao de labels no Admin
 *
 * Verifica que:
 *   - "Produtos" foi renomeado para "Produtos Gravity" em pt/en/es
 *   - "Log de Testes" foi renomeado para "Testes" em pt/en/es
 *   - Todas as outras labels permanecem intactas
 */

import { describe, it, expect } from 'vitest'
import pt from '../../../nucleo-global/Utilidades/Localization/locales/pt.json'
import en from '../../../nucleo-global/Utilidades/Localization/locales/en.json'
import es from '../../../nucleo-global/Utilidades/Localization/locales/es.json'

describe('Renomeacao: Produtos → Produtos Gravity', () => {
  it('PT: admin.layout.produtos = "Produtos Gravity"', () => {
    expect((pt as Record<string, Record<string, Record<string, string>>>).admin.layout.produtos).toBe('Produtos Gravity')
  })

  it('EN: admin.layout.produtos = "Gravity Products"', () => {
    expect((en as Record<string, Record<string, Record<string, string>>>).admin.layout.produtos).toBe('Gravity Products')
  })

  it('ES: admin.layout.produtos = "Productos Gravity"', () => {
    expect((es as Record<string, Record<string, Record<string, string>>>).admin.layout.produtos).toBe('Productos Gravity')
  })
})

describe('Renomeacao: Log de Testes → Testes', () => {
  it('PT: admin.layout.log_testes = "Testes"', () => {
    expect((pt as Record<string, Record<string, Record<string, string>>>).admin.layout.log_testes).toBe('Testes')
  })

  it('EN: admin.layout.log_testes = "Tests"', () => {
    expect((en as Record<string, Record<string, Record<string, string>>>).admin.layout.log_testes).toBe('Tests')
  })

  it('ES: admin.layout.log_testes = "Pruebas"', () => {
    expect((es as Record<string, Record<string, Record<string, string>>>).admin.layout.log_testes).toBe('Pruebas')
  })
})

describe('Outras labels Admin NAO foram alteradas', () => {
  const expectedPt: Record<string, string> = {
    visao_geral: 'Visão Geral',
    organizacoes: 'Organizações',
    usuarios_globais: 'Usuários Globais',
    financeiro: 'Financeiro',
    historico_global: 'Histórico Global',
    deploy_railway: 'Deploy Railway',
    api_cockpit: 'API Cockpit',
    seguranca: 'Segurança',
  }

  for (const [key, expected] of Object.entries(expectedPt)) {
    it(`PT: admin.layout.${key} = "${expected}" (intacto)`, () => {
      expect((pt as Record<string, Record<string, Record<string, string>>>).admin.layout[key]).toBe(expected)
    })
  }
})
