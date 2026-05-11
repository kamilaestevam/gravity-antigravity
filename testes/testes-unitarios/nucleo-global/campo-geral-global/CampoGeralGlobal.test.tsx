/**
 * CampoGeralGlobal.test.tsx — testes unitários do componente base de campos.
 *
 * Foco: a regra "obrigatorio + vazio ⇒ borda vermelha automática" que é
 * documentada como REGRA OFICIAL DO GRAVITY (UX de obrigatórios). Sem
 * essa garantia em teste, qualquer refator silencioso pode quebrar a
 * sinalização visual em todos os formulários do monorepo.
 */
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CampoGeralGlobal } from '../../../../nucleo-global/Campos/campo-geral-global/src/CampoGeralGlobal.js'

describe('CampoGeralGlobal — regra obrigatorio + vazio', () => {
  it('NÃO aplica classe de erro quando obrigatorio=false (default)', () => {
    const { container } = render(
      <CampoGeralGlobal label="Nome">
        <input data-testid="i" />
      </CampoGeralGlobal>,
    )
    const wrapper = container.querySelector('.cg-wrapper')
    expect(wrapper?.className).not.toContain('cg-wrapper--erro')
  })

  it('NÃO aplica classe de erro quando só obrigatorio=true e vazio omitido', () => {
    const { container } = render(
      <CampoGeralGlobal label="Nome" obrigatorio>
        <input data-testid="i" />
      </CampoGeralGlobal>,
    )
    const wrapper = container.querySelector('.cg-wrapper')
    expect(wrapper?.className).not.toContain('cg-wrapper--erro')
    // Asterisco aparece no label
    expect(screen.getByText(/Nome \*/)).toBeTruthy()
  })

  it('NÃO aplica classe de erro quando vazio=true mas obrigatorio=false', () => {
    const { container } = render(
      <CampoGeralGlobal label="Nome" vazio>
        <input data-testid="i" />
      </CampoGeralGlobal>,
    )
    const wrapper = container.querySelector('.cg-wrapper')
    expect(wrapper?.className).not.toContain('cg-wrapper--erro')
  })

  it('APLICA classe de erro quando obrigatorio=true E vazio=true (regra oficial)', () => {
    const { container } = render(
      <CampoGeralGlobal label="Nome" obrigatorio vazio>
        <input data-testid="i" />
      </CampoGeralGlobal>,
    )
    const wrapper = container.querySelector('.cg-wrapper')
    expect(wrapper?.className).toContain('cg-wrapper--erro')
  })

  it('aplica classe de erro também quando erro="..." (mesmo sem vazio) — 2ª camada', () => {
    const { container } = render(
      <CampoGeralGlobal label="CNPJ" obrigatorio erro="CNPJ inválido">
        <input data-testid="i" />
      </CampoGeralGlobal>,
    )
    const wrapper = container.querySelector('.cg-wrapper')
    expect(wrapper?.className).toContain('cg-wrapper--erro')
    expect(screen.getByRole('alert').textContent).toBe('CNPJ inválido')
  })

  it('quando obrigatorio + vazio + erro: as duas camadas coexistem (vermelho + mensagem)', () => {
    const { container } = render(
      <CampoGeralGlobal label="CNPJ" obrigatorio vazio erro="Formato esperado XX.XXX.XXX/XXXX-XX">
        <input data-testid="i" />
      </CampoGeralGlobal>,
    )
    const wrapper = container.querySelector('.cg-wrapper')
    expect(wrapper?.className).toContain('cg-wrapper--erro')
    expect(screen.getByRole('alert').textContent).toBe('Formato esperado XX.XXX.XXX/XXXX-XX')
  })
})

describe('CampoGeralGlobal — label e asterisco', () => {
  it('mostra label sem asterisco quando obrigatorio=false', () => {
    render(
      <CampoGeralGlobal label="Email">
        <input />
      </CampoGeralGlobal>,
    )
    expect(screen.getByText('Email')).toBeTruthy()
    expect(screen.queryByText(/\*/)).toBeNull()
  })

  it('mostra label com asterisco quando obrigatorio=true', () => {
    render(
      <CampoGeralGlobal label="Email" obrigatorio>
        <input />
      </CampoGeralGlobal>,
    )
    expect(screen.getByText(/Email \*/)).toBeTruthy()
  })

  it('não renderiza label quando label não passado', () => {
    const { container } = render(
      <CampoGeralGlobal>
        <input data-testid="i" />
      </CampoGeralGlobal>,
    )
    expect(container.querySelector('label.cg-label')).toBeNull()
  })
})
