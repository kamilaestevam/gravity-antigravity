/**
 * dados-mock-lista-smart-read.ts — dados de demonstração (dev / UI sem legado)
 */

import type { Leitura, TransacaoLeitura } from './schemas'

export const TRANSACOES_MOCK_LISTA_SMART_READ: TransacaoLeitura[] = [
  {
    id_leitura: 'mock-leitura-bl-importacao',
    nome_leitura: 'Embarque BL — Março/2026',
    status_leitura: 'COMPLETED',
    total_arquivos: 2,
    media_acertos: 0.94,
    data_envio: '2026-06-10T14:32:00.000Z',
    origem_leitura: 'INTERFACE',
    nome_arquivo: 'pacote-embarque.pdf',
    mensagem_erro: null,
  },
  {
    id_leitura: 'mock-leitura-invoice-api',
    nome_leitura: 'Invoice cluster — API',
    status_leitura: 'COMPLETED',
    total_arquivos: 1,
    media_acertos: 0.88,
    data_envio: '2026-06-12T09:15:00.000Z',
    origem_leitura: 'API',
    nome_arquivo: 'invoices.zip',
    mensagem_erro: null,
  },
  {
    id_leitura: 'mock-leitura-processando',
    nome_leitura: 'Upload AWB + Packing',
    status_leitura: 'PROCESSING',
    total_arquivos: 3,
    media_acertos: null,
    data_envio: '2026-06-17T16:05:00.000Z',
    origem_leitura: 'INTERFACE',
    nome_arquivo: 'docs-comex.pdf',
    mensagem_erro: null,
  },
]

export const LEITURAS_MOCK_DETALHE: Record<string, Leitura> = {
  'mock-leitura-bl-importacao': {
    id_leitura: 'mock-leitura-bl-importacao',
    nome_leitura: 'Embarque BL — Março/2026',
    status_leitura: 'COMPLETED',
    total_arquivos: 2,
    arquivos_processados: 2,
    arquivos: [
      {
        id_arquivo: 'mock-arq-bl',
        nome_arquivo: 'BL-original.pdf',
        status_arquivo: 'COMPLETED',
        resultado_extracao: [
          { tipo_documento: 'Bill of Lading', dados: { accuracy: 0.96 } },
        ],
      },
      {
        id_arquivo: 'mock-arq-pack',
        nome_arquivo: 'packing-docs.pdf',
        status_arquivo: 'COMPLETED',
        resultado_extracao: [
          { tipo_documento: 'Invoice', dados: { accuracy: 0.91 } },
          { tipo_documento: 'Invoice', dados: { accuracy: 0.89 } },
          { tipo_documento: 'Packing List', dados: { accuracy: 0.93 } },
        ],
      },
    ],
  },
  'mock-leitura-invoice-api': {
    id_leitura: 'mock-leitura-invoice-api',
    nome_leitura: 'Invoice cluster — API',
    status_leitura: 'COMPLETED',
    total_arquivos: 1,
    arquivos_processados: 1,
    arquivos: [
      {
        id_arquivo: 'mock-arq-inv',
        nome_arquivo: 'invoice-set.pdf',
        status_arquivo: 'COMPLETED',
        resultado_extracao: [
          { tipo_documento: 'Invoice', dados: { accuracy: 0.87 } },
          { tipo_documento: 'AWB', dados: { accuracy: 0.9 } },
        ],
      },
    ],
  },
  'mock-leitura-processando': {
    id_leitura: 'mock-leitura-processando',
    nome_leitura: 'Upload AWB + Packing',
    status_leitura: 'PROCESSING',
    total_arquivos: 3,
    arquivos_processados: 1,
    arquivos: [
      {
        id_arquivo: 'mock-arq-awb',
        nome_arquivo: 'AWB-001.pdf',
        status_arquivo: 'COMPLETED',
        resultado_extracao: [{ tipo_documento: 'AWB', dados: {} }],
      },
      {
        id_arquivo: 'mock-arq-pl',
        nome_arquivo: 'packing-list.pdf',
        status_arquivo: 'PROCESSING',
        resultado_extracao: null,
      },
    ],
  },
}

export function deveUsarMockListaSmartReadClient(): boolean {
  const flag = import.meta.env.VITE_SMART_READ_MOCK_DADOS
  if (flag === 'false') return false
  return import.meta.env.DEV || flag === 'true'
}

export function listarTransacoesMockSmartRead(params?: {
  termo_busca?: string
}): { transacoes: TransacaoLeitura[]; total: number } {
  const termo = params?.termo_busca?.trim().toLowerCase()
  const filtradas = termo
    ? TRANSACOES_MOCK_LISTA_SMART_READ.filter((item) => {
        const nome = (item.nome_leitura ?? item.nome_arquivo ?? item.id_leitura).toLowerCase()
        return nome.includes(termo)
      })
    : TRANSACOES_MOCK_LISTA_SMART_READ
  return { transacoes: filtradas, total: filtradas.length }
}

export function obterLeituraMockSmartRead(idLeitura: string): Leitura | null {
  return LEITURAS_MOCK_DETALHE[idLeitura] ?? null
}
