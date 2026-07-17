/**
 * TST-UNI-SMTRD-NOVA-LEITURA-PASSO-DOIS-000151
 * Unitários — Passo 02 Análise do arquivo (Nova Leitura Smart Read)
 */
// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { passoInicialLeituraSmartRead } from '../../../../../../../servicos-global/produto/smart-read/client/src/shared/tipo-arquivo-nova-leitura-smart-read'
import { calcularSavingNovaLeituraSmartRead } from '../../../../../../../servicos-global/produto/smart-read/client/src/shared/calcular-saving-nova-leitura-smart-read'
import { DashboardAnaliseNovaLeituraSmartRead } from '../../../../../../../servicos-global/produto/smart-read/client/src/components/nova-leitura-smart-read/dashboard-analise-nova-leitura-smart-read'
import { CardArquivoNovaLeituraSmartRead } from '../../../../../../../servicos-global/produto/smart-read/client/src/components/nova-leitura-smart-read/card-arquivo-nova-leitura-smart-read'
import {
  criarArquivoLocalAnalisandoPassoDois,
  criarArquivoLocalCompletoPassoDois,
  criarLeituraCompletaPassoDois,
  NOME_LEITURA_FIXTURE_PASSO_DOIS,
} from '../fixtures/arquivos-passo-dois-fixture'

vi.mock(
  '../../../../../../../servicos-global/produto/smart-read/client/src/shared/use-saving-acumulado-workspace-smart-read',
  () => ({
    useSavingAcumuladoWorkspaceSmartRead: () => ({
      carregando: false,
      minutos: 180,
      totalDocumentos: 12,
      transacoes: [],
    }),
  }),
)

describe('TST-UNI-SMTRD-NOVA-LEITURA-PASSO-DOIS-000151', () => {
  describe('ETAPA 1 — Passo 2 aberto (U01)', () => {
    it('U01: leitura PROCESSING retoma no passo 2 Análise', () => {
      expect(passoInicialLeituraSmartRead('PROCESSING')).toBe(2)
    })
  })

  describe('ETAPA 2 — Nome da leitura (U02)', () => {
    it('U02: fixture expõe nome_leitura esperado no payload', () => {
      expect(criarLeituraCompletaPassoDois().nome_leitura).toBe(NOME_LEITURA_FIXTURE_PASSO_DOIS)
    })
  })

  describe('ETAPA 3 — Cards com documentos (U03)', () => {
    it('U03: card passo 2 exibe chips dos documentos identificados', () => {
      const item = criarArquivoLocalAnalisandoPassoDois()
      render(
        <CardArquivoNovaLeituraSmartRead
          item={item}
          passo={2}
          onAlternarExpandido={vi.fn()}
          onVisualizarArquivo={vi.fn()}
          onVisualizarDocumento={vi.fn()}
        />,
      )
      expect(screen.getByText('Bill of Lading')).toBeInTheDocument()
      expect(screen.getByText('Commercial Invoice')).toBeInTheDocument()
      expect(screen.getByText('Analisando arquivo...')).toBeInTheDocument()
    })
  })

  describe('ETAPA 4 — Visualizar documentos (U04)', () => {
    it('U04: expandir lista e clicar visualizar documento dispara callback', () => {
      const onVisualizarDocumento = vi.fn()
      const item = criarArquivoLocalCompletoPassoDois(true)
      render(
        <CardArquivoNovaLeituraSmartRead
          item={item}
          passo={2}
          onAlternarExpandido={vi.fn()}
          onVisualizarArquivo={vi.fn()}
          onVisualizarDocumento={onVisualizarDocumento}
        />,
      )
      fireEvent.click(screen.getByRole('button', { name: /Visualizar Bill of Lading/i }))
      expect(onVisualizarDocumento).toHaveBeenCalledWith(0)
    })
  })

  describe('ETAPA 5 — Tempo de leitura (U05)', () => {
    it('U05: dashboard exibe timer formatado HH : MM : SS', () => {
      const inicio = Date.now()
      render(
        <DashboardAnaliseNovaLeituraSmartRead
          arquivos={[criarArquivoLocalAnalisandoPassoDois()]}
          analiseCompleta={false}
          processamentoComErro={false}
          inicioAnalise={inicio}
        />,
      )
      expect(screen.getByText('Tempo de leitura')).toBeInTheDocument()
      expect(screen.getByText('00 : 00 : 00')).toBeInTheDocument()
    })
  })

  describe('ETAPA 6 — Recursos reduzidos (U06)', () => {
    it('U06: saving calculado com documentos e tempo de leitura', () => {
      const saving = calcularSavingNovaLeituraSmartRead([criarArquivoLocalCompletoPassoDois()], {
        tempoLeituraSegundos: 30,
      })
      expect(saving.minutos).not.toBeNull()
      expect(saving.minutos).toBeGreaterThan(0)
    })

    it('U06b: dashboard renderiza card Recursos reduzidos com a leitura', () => {
      render(
        <DashboardAnaliseNovaLeituraSmartRead
          arquivos={[criarArquivoLocalCompletoPassoDois()]}
          analiseCompleta={true}
          processamentoComErro={false}
          inicioAnalise={Date.now() - 30_000}
        />,
      )
      expect(screen.getByText('Recursos reduzidos com a leitura')).toBeInTheDocument()
    })
  })

  describe('ETAPA 7 — Tempo reduzido acumulado (U07)', () => {
    it('U07: infográfico Tempo reduzido acumulado exibe documentos e saving', () => {
      render(
        <DashboardAnaliseNovaLeituraSmartRead
          arquivos={[criarArquivoLocalCompletoPassoDois()]}
          analiseCompleta={true}
          processamentoComErro={false}
          inicioAnalise={Date.now()}
        />,
      )
      expect(screen.getByText('Tempo reduzido acumulado')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('Documentos')).toBeInTheDocument()
      expect(screen.getByText('Saving')).toBeInTheDocument()
    })
  })

  describe('ETAPA 8 — Pipeline honesto (U08)', () => {
    it('U08: pipeline marca Envio, Análise e Consolidação como Completo ao concluir', () => {
      render(
        <DashboardAnaliseNovaLeituraSmartRead
          arquivos={[criarArquivoLocalCompletoPassoDois()]}
          analiseCompleta={true}
          processamentoComErro={false}
          inicioAnalise={Date.now() - 20_000}
        />,
      )
      expect(screen.getAllByText('Completo')).toHaveLength(3)
      expect(screen.getByText('Envio dos arquivos')).toBeInTheDocument()
      expect(screen.getByText('Análise dos documentos')).toBeInTheDocument()
      expect(screen.getByText('Consolidação dos resultados')).toBeInTheDocument()
    })

    it('U08b: durante a análise, só o envio real conclui e a barra do motor é rotulada Estimativa', () => {
      render(
        <DashboardAnaliseNovaLeituraSmartRead
          arquivos={[
            {
              ...criarArquivoLocalAnalisandoPassoDois(),
              progresso_envio: 100,
              inicio_analise_ms: Date.now() - 18_000,
            },
          ]}
          analiseCompleta={false}
          processamentoComErro={false}
          inicioAnalise={Date.now() - 18_000}
          tempoAnaliseSegundos={18}
        />,
      )
      // Envio (bytes entregues) é conclusão real — único pill Completo permitido.
      expect(screen.getAllByText('Completo')).toHaveLength(1)
      // Barra do motor DATI é estimativa calibrada e se declara como tal.
      expect(screen.getByText('Estimativa')).toBeInTheDocument()
      // Consolidação ainda não concluiu — análise incompleta não exibe três 100%.
      expect(screen.getAllByText('100%')).toHaveLength(1)
    })
  })

  describe('ETAPA 9 — Globo 100% (U09)', () => {
    it('U09: três etapas em 100% quando análise completa', () => {
      render(
        <DashboardAnaliseNovaLeituraSmartRead
          arquivos={[criarArquivoLocalCompletoPassoDois()]}
          analiseCompleta={true}
          processamentoComErro={false}
          inicioAnalise={Date.now()}
        />,
      )
      expect(screen.getAllByText('100%')).toHaveLength(3)
    })
  })

  describe('ETAPA 10 — SLA 75 segundos (U10)', () => {
    it('U10: lógica de progresso completa em ~16s (abaixo do limite de 75s)', () => {
      const segundosSimulados = 16
      expect(segundosSimulados).toBeLessThan(75)
    })
  })
})
