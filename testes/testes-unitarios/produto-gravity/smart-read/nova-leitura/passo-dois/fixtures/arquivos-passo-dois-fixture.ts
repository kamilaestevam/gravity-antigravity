/**
 * Fixtures — Passo 02 Análise do arquivo (Nova Leitura Smart Read)
 */
import type { Leitura } from '../../../../../../../servicos-global/produto/smart-read/client/src/shared/schemas'
import type { ArquivoLocalNovaLeitura } from '../../../../../../../servicos-global/produto/smart-read/client/src/shared/tipo-arquivo-nova-leitura-smart-read'
import { criarArquivoFixturePassoUm } from '../../passo-um/fixtures/arquivos-passo-um-fixture'

export const NOME_LEITURA_FIXTURE_PASSO_DOIS = 'Leitura 742'
export const ID_LEITURA_FIXTURE_PASSO_DOIS = 'leitura-passo-dois-fixture-000151'

export function criarLeituraProcessandoPassoDois(): Leitura {
  return {
    id_leitura: ID_LEITURA_FIXTURE_PASSO_DOIS,
    nome_leitura: NOME_LEITURA_FIXTURE_PASSO_DOIS,
    status_leitura: 'PROCESSING',
    total_arquivos: 1,
    arquivos_processados: 0,
    arquivos: [
      {
        id_arquivo: 'arq-passo-dois-001',
        nome_arquivo: 'documento-teste.pdf',
        status_arquivo: 'PROCESSING',
        tempo_extracao_ia_ms: 4500,
        resultado_extracao: [
          { tipo_documento: 'Bill of Lading', dados: { numero: 'BL-001' } },
          { tipo_documento: 'Commercial Invoice', dados: { numero: 'INV-001' } },
        ],
      },
    ],
  }
}

export function criarLeituraCompletaPassoDois(): Leitura {
  return {
    ...criarLeituraProcessandoPassoDois(),
    status_leitura: 'COMPLETED',
    arquivos_processados: 1,
    arquivos: [
      {
        ...criarLeituraProcessandoPassoDois().arquivos[0]!,
        status_arquivo: 'COMPLETED',
      },
    ],
  }
}

export function criarArquivoLocalAnalisandoPassoDois(): ArquivoLocalNovaLeitura {
  const leitura = criarLeituraProcessandoPassoDois()
  return {
    id_arquivo_local: 'local-passo-dois-1',
    arquivo: criarArquivoFixturePassoUm('pdf'),
    status_arquivo_local: 'analisando',
    id_leitura: leitura.id_leitura,
    id_arquivo: 'arq-passo-dois-001',
    leitura,
    mensagem_erro: null,
    expandido: false,
  }
}

export function criarArquivoLocalCompletoPassoDois(expandido = true): ArquivoLocalNovaLeitura {
  const leitura = criarLeituraCompletaPassoDois()
  return {
    id_arquivo_local: 'local-passo-dois-2',
    arquivo: criarArquivoFixturePassoUm('pdf'),
    status_arquivo_local: 'completo',
    id_leitura: leitura.id_leitura,
    id_arquivo: 'arq-passo-dois-001',
    leitura,
    mensagem_erro: null,
    expandido,
  }
}
