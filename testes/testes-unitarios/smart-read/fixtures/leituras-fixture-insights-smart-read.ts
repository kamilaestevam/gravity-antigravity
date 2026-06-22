/**
 * Fixture mínima para testes unitários de Insights (não usada em runtime).
 */
import type { Leitura } from '../../../../servicos-global/produto/smart-read/client/src/shared/schemas.ts'

export const LEITURAS_FIXTURE_INSIGHTS: Record<string, Leitura> = {
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
          {
            tipo_documento: 'Bill of Lading',
            dados: { accuracy: 0.96, exportador: 'Asia Shipping LTDA', importador: 'Importadora Brasil SA' },
          },
        ],
      },
      {
        id_arquivo: 'mock-arq-pack',
        nome_arquivo: 'packing-docs.pdf',
        status_arquivo: 'COMPLETED',
        resultado_extracao: [
          {
            tipo_documento: 'Invoice',
            dados: { accuracy: 0.91, exportador: 'Shenzhen Export Co.', importador: 'Importadora Brasil SA' },
          },
          {
            tipo_documento: 'Invoice',
            dados: { accuracy: 0.89, exportador: 'Guangzhou Trading', importador: 'Comercial Norte Ltda' },
          },
          {
            tipo_documento: 'Packing List',
            dados: { accuracy: 0.93, exportador: 'Shenzhen Export Co.', importador: 'Importadora Brasil SA' },
          },
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
          {
            tipo_documento: 'Invoice',
            dados: { accuracy: 0.87, exportador: 'Euro Exports GmbH', importador: 'Distribuidora Sul' },
          },
          {
            tipo_documento: 'AWB',
            dados: { accuracy: 0.9, exportador: 'Lufthansa Cargo Hub', importador: 'Distribuidora Sul' },
          },
        ],
      },
    ],
  },
}
