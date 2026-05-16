/**
 * ModalPassoPassoGlobal.test.tsx — testes unitarios das novas props
 * adicionadas na migracao dos modais multi-step para componente unificado.
 *
 * Props testadas: ocultarStepper, ocultarFooter, footerCustom, subtituloNode
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModalPassoPassoGlobal } from '../../../../nucleo-global/Modais/modal-passo-passo-global/src/ModalPassoPassoGlobal'

const PASSOS_MOCK = [
  { id: 1, label: 'Passo 1' },
  { id: 2, label: 'Passo 2' },
  { id: 3, label: 'Passo 3' },
]

const defaultProps = {
  titulo: 'Modal Teste',
  aberto: true,
  passos: PASSOS_MOCK,
  passoAtual: 1,
  onProximo: vi.fn(),
  onVoltar: vi.fn(),
  onFechar: vi.fn(),
}

describe('ModalPassoPassoGlobal — props de evolucao', () => {
  describe('ocultarStepper', () => {
    it('renderiza stepper por padrao (ocultarStepper = false)', () => {
      render(
        <ModalPassoPassoGlobal {...defaultProps}>
          <div>Conteudo</div>
        </ModalPassoPassoGlobal>,
      )
      // createPortal renderiza em document.body, nao no container
      const stepper = document.querySelector('[role="list"][aria-label="Passos"]')
      expect(stepper).not.toBeNull()
    })

    it('oculta stepper quando ocultarStepper = true', () => {
      render(
        <ModalPassoPassoGlobal {...defaultProps} ocultarStepper>
          <div>Conteudo</div>
        </ModalPassoPassoGlobal>,
      )
      const stepper = document.querySelector('[role="list"][aria-label="Passos"]')
      expect(stepper).toBeNull()
    })
  })

  describe('ocultarFooter', () => {
    it('renderiza footer padrao por padrao', () => {
      render(
        <ModalPassoPassoGlobal {...defaultProps}>
          <div>Conteudo</div>
        </ModalPassoPassoGlobal>,
      )
      // Footer padrao tem botao "Cancelar" (primeiro passo)
      expect(screen.getByText('Cancelar')).toBeTruthy()
    })

    it('oculta footer quando ocultarFooter = true', () => {
      render(
        <ModalPassoPassoGlobal {...defaultProps} ocultarFooter>
          <div>Conteudo</div>
        </ModalPassoPassoGlobal>,
      )
      expect(screen.queryByText('Cancelar')).toBeNull()
      expect(screen.queryByText('Proximo')).toBeNull()
    })
  })

  describe('footerCustom', () => {
    it('renderiza footer custom em vez do padrao', () => {
      const footerCustom = <button data-testid="btn-custom">Acao Custom</button>

      render(
        <ModalPassoPassoGlobal {...defaultProps} footerCustom={footerCustom}>
          <div>Conteudo</div>
        </ModalPassoPassoGlobal>,
      )

      expect(screen.getByTestId('btn-custom')).toBeTruthy()
      // Footer padrao NAO aparece
      expect(screen.queryByText('Cancelar')).toBeNull()
    })

    it('footerCustom tem prioridade sobre ocultarFooter', () => {
      const footerCustom = <span data-testid="custom-footer">Custom</span>

      render(
        <ModalPassoPassoGlobal {...defaultProps} footerCustom={footerCustom} ocultarFooter>
          <div>Conteudo</div>
        </ModalPassoPassoGlobal>,
      )

      // footerCustom aparece (tem prioridade no ternario)
      expect(screen.getByTestId('custom-footer')).toBeTruthy()
    })
  })

  describe('subtituloNode', () => {
    it('renderiza subtituloNode como ReactNode', () => {
      const node = <span data-testid="sub-node">Subtitulo Dinamico</span>

      render(
        <ModalPassoPassoGlobal {...defaultProps} subtituloNode={node}>
          <div>Conteudo</div>
        </ModalPassoPassoGlobal>,
      )

      expect(screen.getByTestId('sub-node')).toBeTruthy()
    })

    it('subtituloNode tem prioridade sobre subtitulo string', () => {
      const node = <span data-testid="sub-node">Node</span>

      render(
        <ModalPassoPassoGlobal {...defaultProps} subtitulo="String" subtituloNode={node}>
          <div>Conteudo</div>
        </ModalPassoPassoGlobal>,
      )

      expect(screen.getByTestId('sub-node')).toBeTruthy()
      expect(screen.queryByText('String')).toBeNull()
    })

    it('renderiza subtitulo string quando subtituloNode ausente', () => {
      render(
        <ModalPassoPassoGlobal {...defaultProps} subtitulo="Texto simples">
          <div>Conteudo</div>
        </ModalPassoPassoGlobal>,
      )

      expect(screen.getByText('Texto simples')).toBeTruthy()
    })
  })

  describe('renderizacao basica (regressao)', () => {
    it('renderiza titulo e children', () => {
      render(
        <ModalPassoPassoGlobal {...defaultProps}>
          <div data-testid="child">Conteudo filho</div>
        </ModalPassoPassoGlobal>,
      )

      expect(screen.getByText('Modal Teste')).toBeTruthy()
      expect(screen.getByTestId('child')).toBeTruthy()
    })

    it('nao renderiza nada quando aberto = false', () => {
      render(
        <ModalPassoPassoGlobal {...defaultProps} aberto={false}>
          <div>Conteudo</div>
        </ModalPassoPassoGlobal>,
      )

      // Portal nao renderiza nada quando aberto=false
      expect(document.querySelector('[role="dialog"]')).toBeNull()
    })

    it('mostra "Salvar" no ultimo passo', () => {
      render(
        <ModalPassoPassoGlobal {...defaultProps} passoAtual={3}>
          <div>Conteudo</div>
        </ModalPassoPassoGlobal>,
      )

      expect(screen.getByText('Salvar')).toBeTruthy()
    })

    it('mostra label custom do botao final', () => {
      render(
        <ModalPassoPassoGlobal {...defaultProps} passoAtual={3} labelBotaoFinal="Confirmar">
          <div>Conteudo</div>
        </ModalPassoPassoGlobal>,
      )

      expect(screen.getByText('Confirmar')).toBeTruthy()
    })
  })
})
