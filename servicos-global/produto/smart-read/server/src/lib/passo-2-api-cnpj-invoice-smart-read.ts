/**
 * passo-2-api-cnpj-invoice-smart-read.ts — Passo 2: status CNPJ na Receita Federal
 */

import type {
  DadosOficiaisCnpjLeitura,
  DocumentoAnaliseRisco,
  RiscoAduaneiroLeitura,
} from '../../../shared/analise-riscos-leitura-smart-read.js'
import {
  achatarCamposDadosLeitura,
  validarCnpjBrasil,
  valorTextoComparacaoCampo,
} from '../../../shared/analise-riscos-leitura-smart-read.js'
import { severidadeParaStatusMatriz } from '../../../shared/matriz-validacao-invoice-smart-read.js'
import { consultarCnpjReceitaSmartRead } from './cliente-consulta-cnpj-smart-read.js'

function extrairCnpjImportador(dados: Record<string, unknown>): string | null {
  const mapa = achatarCamposDadosLeitura(dados)
  for (const caminho of ['importer.cnpj', 'importer.taxId', 'buyer.cnpj']) {
    const v = mapa.get(caminho)
    const texto = valorTextoComparacaoCampo(v)
    if (texto) return texto
  }
  for (const [chave, valor] of mapa) {
    if (chave.includes('importer') && chave.toLowerCase().includes('cnpj')) {
      const texto = valorTextoComparacaoCampo(valor)
      if (texto) return texto
    }
  }
  return null
}

export async function executarPasso2ApiCnpjInvoice(
  documentos: DocumentoAnaliseRisco[],
): Promise<{ cnpj_oficial: DadosOficiaisCnpjLeitura | null; riscos: RiscoAduaneiroLeitura[] }> {
  const riscos: RiscoAduaneiroLeitura[] = []
  let cnpjOficial: DadosOficiaisCnpjLeitura | null = null

  for (const doc of documentos) {
    if (!doc.tipo_documento.toUpperCase().includes('INVOICE')) continue
    const cnpj = extrairCnpjImportador(doc.dados)
    if (!cnpj || !validarCnpjBrasil(cnpj)) continue

    const oficial = await consultarCnpjReceitaSmartRead(cnpj)
    if (!oficial) continue
    cnpjOficial = oficial

    const rotulo = `${doc.nome_arquivo} · ${doc.tipo_documento}`
    if (!oficial.ativo) {
      riscos.push({
        id: `risco-p2-cnpj-inativo`,
        origem: 'v1',
        severidade: 'critico',
        categoria: 'cnpj',
        titulo: 'CNPJ inativo ou irregular na Receita Federal',
        motivo: `CNPJ ${oficial.cnpj} consta como «${oficial.situacao_cadastral ?? 'situação não ativa'}» na consulta governamental.`,
        analise:
          'Importador com situação cadastral diferente de ATIVA na RFB impede registro da DUIMP e pode bloquear o desembarque.',
        evidencias: [{ documento: rotulo, campo: 'importer.cnpj', valor: oficial.cnpj }],
        secao_matriz: 'cadastral',
        id_regra_matriz: 'S2-02',
        motor_validacao: 'api',
        status_matriz: severidadeParaStatusMatriz('critico'),
      })
    }
    break
  }

  return { cnpj_oficial: cnpjOficial, riscos }
}
