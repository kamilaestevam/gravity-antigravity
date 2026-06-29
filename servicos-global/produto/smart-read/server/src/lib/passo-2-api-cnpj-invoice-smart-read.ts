/**
 * passo-2-api-cnpj-invoice-smart-read.ts — Passo 2: status CNPJ na Receita Federal
 */

import type {
  DadosOficiaisCnpjLeitura,
  DocumentoAnaliseRisco,
  RegraAuditoriaV1,
  RiscoAduaneiroLeitura,
} from '../../../shared/analise-riscos-leitura-smart-read.js'
import {
  achatarCamposDadosLeitura,
  validarCnpjBrasil,
  valorTextoComparacaoCampo,
} from '../../../shared/analise-riscos-leitura-smart-read.js'
import { severidadeParaStatusMatriz } from '../../../shared/matriz-validacao-invoice-smart-read.js'
import { consultarCnpjReceitaSmartRead } from './cliente-consulta-cnpj-smart-read.js'

function rotuloDocumento(nomeArquivo: string, tipo: string, indice: number): string {
  return `${nomeArquivo} · ${tipo.trim() || `Documento ${indice + 1}`}`
}

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

function montarCnpjPorArquivo(documentos: DocumentoAnaliseRisco[]): Map<string, string> {
  const mapa = new Map<string, string>()
  for (const doc of documentos) {
    const cnpj = extrairCnpjImportador(doc.dados)
    if (cnpj && validarCnpjBrasil(cnpj) && !mapa.has(doc.nome_arquivo)) {
      mapa.set(doc.nome_arquivo, cnpj)
    }
  }
  return mapa
}

export async function executarPasso2ApiCnpjInvoice(
  documentos: DocumentoAnaliseRisco[],
): Promise<{
  cnpj_oficial: DadosOficiaisCnpjLeitura | null
  riscos: RiscoAduaneiroLeitura[]
  regras: RegraAuditoriaV1[]
}> {
  const riscos: RiscoAduaneiroLeitura[] = []
  const regras: RegraAuditoriaV1[] = []
  let cnpjOficial: DadosOficiaisCnpjLeitura | null = null
  const cnpjPorArquivo = montarCnpjPorArquivo(documentos)

  for (const doc of documentos) {
    if (!doc.tipo_documento.toUpperCase().includes('INVOICE')) continue

    const rotulo = rotuloDocumento(doc.nome_arquivo, doc.tipo_documento, doc.indice)
    const cnpj =
      extrairCnpjImportador(doc.dados) ?? cnpjPorArquivo.get(doc.nome_arquivo) ?? null

    if (!cnpj) {
      regras.push({
        id: `S2-02-${rotulo}`,
        passou: false,
        detalhe: 'CNPJ não extraído',
      })
      continue
    }

    if (!validarCnpjBrasil(cnpj)) {
      regras.push({
        id: `S2-02-${rotulo}`,
        passou: false,
        detalhe: `CNPJ inválido: ${cnpj}`,
      })
      continue
    }

    const oficial = await consultarCnpjReceitaSmartRead(cnpj)
    if (!oficial) {
      regras.push({
        id: `S2-02-${rotulo}`,
        passou: false,
        detalhe: `Consulta RFB indisponível — ${cnpj}`,
      })
      continue
    }

    cnpjOficial = oficial
    regras.push({
      id: `S2-02-${rotulo}`,
      passou: oficial.ativo,
      detalhe: oficial.ativo
        ? `ATIVA — ${oficial.razao_social ?? oficial.cnpj}`
        : `${oficial.situacao_cadastral ?? 'INATIVA'} — ${oficial.cnpj}`,
    })

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
  }

  return { cnpj_oficial: cnpjOficial, riscos, regras }
}
