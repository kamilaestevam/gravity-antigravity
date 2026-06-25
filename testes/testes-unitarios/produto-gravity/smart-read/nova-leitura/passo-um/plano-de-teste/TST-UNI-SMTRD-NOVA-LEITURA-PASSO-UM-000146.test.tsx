/**
 * TST-UNI-SMTRD-NOVA-LEITURA-PASSO-UM-000146
 * Unitários — Passo 01 Anexar arquivo (Nova Leitura Smart Read)
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  ACCEPT_ARQUIVO_LEITURA_SMART_READ,
  EXTENSOES_ARQUIVO_LEITURA_SMART_READ,
  LIMITE_TAMANHO_ARQUIVO_LEITURA_SMART_READ_MB,
  lerArquivosIniciaisNovaLeitura,
} from '../../../../../../../servicos-global/produto/smart-read/client/src/shared/entrada-arquivo-leitura-smart-read'
import {
  criarArquivoLocalNovaLeitura,
  passoInicialLeituraSmartRead,
} from '../../../../../../../servicos-global/produto/smart-read/client/src/shared/tipo-arquivo-nova-leitura-smart-read'
import { AreaAnexarNovaLeituraSmartRead } from '../../../../../../../servicos-global/produto/smart-read/client/src/components/nova-leitura-smart-read/area-anexar-nova-leitura-smart-read'
import { FormatosAceitosAnexarNovaLeituraSmartRead } from '../../../../../../../servicos-global/produto/smart-read/client/src/components/nova-leitura-smart-read/formatos-aceitos-anexar-nova-leitura-smart-read'
import { CardArquivoNovaLeituraSmartRead } from '../../../../../../../servicos-global/produto/smart-read/client/src/components/nova-leitura-smart-read/card-arquivo-nova-leitura-smart-read'
import { PainelLateralArquivosNovaLeituraSmartRead } from '../../../../../../../servicos-global/produto/smart-read/client/src/components/nova-leitura-smart-read/painel-lateral-arquivos-nova-leitura-smart-read'
import {
  criarArquivoFixturePassoUm,
  criarTodosArquivosFixturePassoUm,
} from '../fixtures/arquivos-passo-um-fixture'

describe('TST-UNI-SMTRD-NOVA-LEITURA-PASSO-UM-000146', () => {
  describe('ETAPA 1 — Abertura da tela e passo 01 (U01–U02)', () => {
    it('U01: constantes do passo 1 expõem 8 extensões e accept do input', () => {
      expect(EXTENSOES_ARQUIVO_LEITURA_SMART_READ).toHaveLength(8)
      expect(ACCEPT_ARQUIVO_LEITURA_SMART_READ).toBe('.pdf,.jpg,.jpeg,.png,.xml,.csv,.xls,.xlsx')
      expect(LIMITE_TAMANHO_ARQUIVO_LEITURA_SMART_READ_MB).toBe(50)
    })

    it('U02: passo inicial ao abrir nova leitura é 1 (retomar PROCESSING vai ao 2)', () => {
      expect(passoInicialLeituraSmartRead('PROCESSING')).toBe(2)
      expect(passoInicialLeituraSmartRead('PENDING')).toBe(2)
      expect(passoInicialLeituraSmartRead('COMPLETED')).toBe(4)
    })

    it('U02b: lerArquivosIniciaisNovaLeitura hidrata arquivos da navegação', () => {
      const pdf = criarArquivoFixturePassoUm('pdf')
      const lista = lerArquivosIniciaisNovaLeitura({ arquivos_iniciais_leitura: [pdf] })
      expect(lista).toHaveLength(1)
      expect(lista[0]?.name).toBe('documento-teste.pdf')
    })
  })

  describe('ETAPA 2 — Anexar arquivos e tipos aceitos (U03–U04)', () => {
    it('U03: dropzone dispara onArquivosAdicionados ao selecionar arquivo', async () => {
      const onAdicionar = vi.fn()
      render(<AreaAnexarNovaLeituraSmartRead onArquivosAdicionados={onAdicionar} />)
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      expect(input).toBeTruthy()
      expect(input.accept).toBe(ACCEPT_ARQUIVO_LEITURA_SMART_READ)
      expect(input.multiple).toBe(true)

      const arquivo = criarArquivoFixturePassoUm('pdf')
      await userEvent.upload(input, arquivo)
      expect(onAdicionar).toHaveBeenCalledTimes(1)
      expect(onAdicionar.mock.calls[0]?.[0]).toHaveLength(1)
      expect(onAdicionar.mock.calls[0]?.[0][0]?.name).toBe('documento-teste.pdf')
    })

    it('U04: todos os 8 tipos geram File anexável via fixture', () => {
      const arquivos = criarTodosArquivosFixturePassoUm()
      expect(arquivos).toHaveLength(8)
      for (const arquivo of arquivos) {
        const local = criarArquivoLocalNovaLeitura(arquivo)
        expect(local.status_arquivo_local).toBe('anexado')
        expect(local.arquivo.name).toMatch(/\.(pdf|jpe?g|png|xml|csv|xls|xlsx)$/)
      }
    })

    it('U04b: UI lista os 8 formatos aceitos', () => {
      render(<FormatosAceitosAnexarNovaLeituraSmartRead />)
      expect(screen.getByRole('list').querySelectorAll('[role="listitem"]').length).toBe(8)
      expect(LIMITE_TAMANHO_ARQUIVO_LEITURA_SMART_READ_MB).toBe(50)
    })
  })

  describe('ETAPA 3 — Card após anexo (U05–U06)', () => {
    it('U05/U06: card exibe nome do arquivo e status anexado no passo 1', () => {
      const arquivo = criarArquivoFixturePassoUm('pdf')
      const item = criarArquivoLocalNovaLeitura(arquivo)
      render(
        <CardArquivoNovaLeituraSmartRead
          item={item}
          passo={1}
          onAlternarExpandido={vi.fn()}
          onVisualizarArquivo={vi.fn()}
          onVisualizarDocumento={vi.fn()}
          onRemover={vi.fn()}
        />,
      )
      expect(screen.getByText('documento-teste.pdf')).toBeInTheDocument()
      expect(screen.getByText('Arquivo enviado')).toBeInTheDocument()
    })
  })

  describe('ETAPA 4 — Visualizar (U07–U08)', () => {
    let openSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    })

    afterEach(() => {
      openSpy.mockRestore()
    })

    it('U07/U08: botão visualizar chama handler (simula window.open no modal)', () => {
      const onVisualizar = vi.fn()
      const arquivo = criarArquivoFixturePassoUm('pdf')
      const item = criarArquivoLocalNovaLeitura(arquivo)
      render(
        <CardArquivoNovaLeituraSmartRead
          item={item}
          passo={1}
          onAlternarExpandido={vi.fn()}
          onVisualizarArquivo={onVisualizar}
          onVisualizarDocumento={vi.fn()}
          onRemover={vi.fn()}
        />,
      )
      fireEvent.click(screen.getByRole('button', { name: /Visualizar original documento-teste\.pdf/i }))
      expect(onVisualizar).toHaveBeenCalledTimes(1)

      const url = URL.createObjectURL(arquivo)
      window.open(url, '_blank', 'noopener,noreferrer')
      expect(openSpy).toHaveBeenCalledWith(url, '_blank', 'noopener,noreferrer')
      URL.revokeObjectURL(url)
    })
  })

  describe('ETAPA 5 — Excluir (U09)', () => {
    it('U09: botão remover visível no passo 1 e dispara callback', () => {
      const onRemover = vi.fn()
      const item = criarArquivoLocalNovaLeitura(criarArquivoFixturePassoUm('pdf'))
      render(
        <CardArquivoNovaLeituraSmartRead
          item={item}
          passo={1}
          onAlternarExpandido={vi.fn()}
          onVisualizarArquivo={vi.fn()}
          onVisualizarDocumento={vi.fn()}
          onRemover={onRemover}
        />,
      )
      fireEvent.click(screen.getByRole('button', { name: /Remover documento-teste\.pdf/i }))
      expect(onRemover).toHaveBeenCalledTimes(1)
    })
  })

  describe('ETAPA 6 — Cancelar e Avançar/Enviar (U10–U11)', () => {
    it('U10: botão Cancelar dispara onCancelar', async () => {
      const onCancelar = vi.fn()
      const item = criarArquivoLocalNovaLeitura(criarArquivoFixturePassoUm('pdf'))
      render(
        <PainelLateralArquivosNovaLeituraSmartRead
          passo={1}
          nomeLeitura="Leitura 100"
          arquivos={[item]}
          enviando={false}
          podeContinuar={false}
          onConfirmarNome={vi.fn()}
          onRemoverArquivo={vi.fn()}
          onAlternarExpandido={vi.fn()}
          onVisualizarArquivo={vi.fn()}
          onVisualizarDocumento={vi.fn()}
          onEnviar={vi.fn()}
          onCancelar={onCancelar}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
      expect(onCancelar).toHaveBeenCalledTimes(1)
    })

    it('U11: Enviar habilitado com arquivo e dispara onEnviar (avanço passo 2)', async () => {
      const onEnviar = vi.fn()
      const item = criarArquivoLocalNovaLeitura(criarArquivoFixturePassoUm('pdf'))
      render(
        <PainelLateralArquivosNovaLeituraSmartRead
          passo={1}
          nomeLeitura="Leitura 100"
          arquivos={[item]}
          enviando={false}
          podeContinuar={false}
          onConfirmarNome={vi.fn()}
          onRemoverArquivo={vi.fn()}
          onAlternarExpandido={vi.fn()}
          onVisualizarArquivo={vi.fn()}
          onVisualizarDocumento={vi.fn()}
          onEnviar={onEnviar}
          onCancelar={vi.fn()}
        />,
      )
      const btnEnviar = screen.getByRole('button', { name: 'Enviar' })
      expect(btnEnviar).not.toBeDisabled()
      await userEvent.click(btnEnviar)
      expect(onEnviar).toHaveBeenCalledTimes(1)
    })

    it('U11b: Enviar desabilitado sem arquivos', () => {
      render(
        <PainelLateralArquivosNovaLeituraSmartRead
          passo={1}
          nomeLeitura="Leitura 100"
          arquivos={[]}
          enviando={false}
          podeContinuar={false}
          onConfirmarNome={vi.fn()}
          onRemoverArquivo={vi.fn()}
          onAlternarExpandido={vi.fn()}
          onVisualizarArquivo={vi.fn()}
          onVisualizarDocumento={vi.fn()}
          onEnviar={vi.fn()}
          onCancelar={vi.fn()}
        />,
      )
      expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled()
    })
  })
})
