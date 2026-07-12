/**
 * passo-1-validacao-codigo-invoice-smart-read.ts — Passo 1 do pipeline: validações determinísticas (Código)
 */

import type { SecaoMatrizInvoice } from './matriz-validacao-invoice-smart-read.js'
import { severidadeParaStatusMatriz } from './matriz-validacao-invoice-smart-read.js'
import { executarPasso1ValidacaoCodigoPackingList } from './passo-1-validacao-codigo-packing-list-smart-read.js'
import { executarPasso1ValidacaoCodigoAwb } from './passo-1-validacao-codigo-awb-smart-read.js'
import { executarPasso1ValidacaoCodigoBl } from './passo-1-validacao-codigo-bl-smart-read.js'
import {
  formatarAnaliseDivergenciaLinha,
  formatarAnaliseDivergenciaSoma,
  textoExtracaoEhPlaceholder,
} from './texto-analise-riscos-leitura-smart-read.js'
import type {
  ContextoAuditoriaV1Leitura,
  DocumentoAnaliseRisco,
  RegraAuditoriaV1,
  ResumoRiscosAduaneirosLeitura,
  RiscoAduaneiroLeitura,
} from './analise-riscos-leitura-smart-read.js'
import {
  achatarCamposDadosLeitura,
  classificarSituacaoCodigoFiscal,
  extrairDescricaoItemLinha,
  extrairNcmsDados,
  validarCnpjBrasil,
  valorTextoComparacaoCampo,
} from './analise-riscos-leitura-smart-read.js'

const MOEDAS_ISO_4217 = new Set([
  'USD', 'EUR', 'GBP', 'BRL', 'JPY', 'CNY', 'CHF', 'CAD', 'AUD', 'MXN', 'ARS', 'CLP', 'COP', 'PEN',
])

const INCOTERMS_VALIDOS = new Set([
  'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF',
])

const REGEX_SWIFT = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/
const REGEX_IBAN = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/

type DocumentoInvoice = {
  rotulo: string
  tipo_documento: string
  mapa: Map<string, unknown>
  dados: Record<string, unknown>
}

let contadorRisco = 0

function criarRiscoCodigo(parcial: {
  id_regra: string
  secao: SecaoMatrizInvoice
  severidade: RiscoAduaneiroLeitura['severidade']
  categoria: RiscoAduaneiroLeitura['categoria']
  titulo: string
  motivo: string
  analise: string
  correcao_sugerida?: string
  evidencias: RiscoAduaneiroLeitura['evidencias']
}): RiscoAduaneiroLeitura {
  contadorRisco += 1
  return {
    id: `risco-p1-${contadorRisco}`,
    origem: 'v1',
    severidade: parcial.severidade,
    categoria: parcial.categoria,
    titulo: parcial.titulo,
    motivo: parcial.motivo,
    analise: parcial.analise,
    correcao_sugerida: parcial.correcao_sugerida,
    evidencias: parcial.evidencias,
    secao_matriz: parcial.secao,
    id_regra_matriz: parcial.id_regra,
    motor_validacao: 'codigo',
    status_matriz: severidadeParaStatusMatriz(parcial.severidade),
  }
}

function rotuloDocumento(nomeArquivo: string, tipo: string, indice: number): string {
  return `${nomeArquivo} · ${tipo.trim() || `Documento ${indice + 1}`}`
}

function coletarInvoices(documentos: DocumentoAnaliseRisco[]): DocumentoInvoice[] {
  return documentos
    .filter((d) => d.tipo_documento.toUpperCase().includes('INVOICE'))
    .map((doc) => ({
      rotulo: rotuloDocumento(doc.nome_arquivo, doc.tipo_documento, doc.indice),
      tipo_documento: doc.tipo_documento.toUpperCase(),
      mapa: achatarCamposDadosLeitura(doc.dados),
      dados: doc.dados,
    }))
}

function valorCampo(mapa: Map<string, unknown>, caminhos: string[]): string | null {
  for (const caminho of caminhos) {
    const direto = mapa.get(caminho)
    if (direto !== undefined) {
      const texto = valorTextoComparacaoCampo(direto)
      if (texto) return texto
    }
  }
  for (const [chave, valor] of mapa) {
    for (const caminho of caminhos) {
      const base = caminho.replace(/\[\]/g, '')
      if (chave.includes(base) || chave.toLowerCase().includes(caminho.toLowerCase())) {
        const texto = valorTextoComparacaoCampo(valor)
        if (texto) return texto
      }
    }
  }
  return null
}

function parseNumero(valor: string | null | undefined): number | null {
  if (!valor) return null
  const limpo = valor.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')
  const n = Number.parseFloat(limpo)
  return Number.isFinite(n) ? n : null
}

function valoresProximos(a: number, b: number, tolerancia = 0.05): boolean {
  return Math.abs(a - b) <= tolerancia
}

function parseDataEmissao(valor: string | null): Date | null {
  if (!valor?.trim()) return null
  const iso = valor.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  const br = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (br) return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]))
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? null : d
}

function extrairItens(dados: Record<string, unknown>) {
  const rows = dados.items ?? dados.itens ?? dados.lineItems
  if (!Array.isArray(rows)) return []
  return rows.map((row, indice) => {
    const r = row as Record<string, unknown>
    return {
      indice,
      partNumber: valorTextoComparacaoCampo(r.partNumber ?? r.sku ?? r.itemCode ?? r.productCode),
      qty: parseNumero(valorTextoComparacaoCampo(r.itemQuantity ?? r.quantity ?? r.qty)),
      precoUnit: parseNumero(
        valorTextoComparacaoCampo(r.itemUnitPriceWithCurrency ?? r.unitPrice ?? r.price),
      ),
      totalLinha: parseNumero(
        valorTextoComparacaoCampo(r.itemTotalPriceWithCurrency ?? r.totalPrice ?? r.total),
      ),
      unidade: valorTextoComparacaoCampo(r.unit ?? r.uom ?? r.unitOfMeasure),
      moeda: valorTextoComparacaoCampo(r.itemCurrency ?? r.currency)?.toUpperCase() ?? null,
      ncm: valorTextoComparacaoCampo(r.ncm ?? r.NCM),
      descricao: extrairDescricaoItemLinha(r),
    }
  })
}

function formatarValorRegra(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

function montarResumo(riscos: RiscoAduaneiroLeitura[]): ResumoRiscosAduaneirosLeitura {
  return {
    riscos,
    total: riscos.length,
    criticos: riscos.filter((r) => r.severidade === 'critico').length,
    atencao: riscos.filter((r) => r.severidade === 'atencao').length,
    informativos: riscos.filter((r) => r.severidade === 'informativo').length,
  }
}

/** Passo 1 — motor Código: aritmética, formatos, ISO, CNPJ módulo 11, NCM estrutural. */
export function executarPasso1ValidacaoCodigoInvoice(
  documentosEntrada: DocumentoAnaliseRisco[],
): { resumo: ResumoRiscosAduaneirosLeitura; contexto: ContextoAuditoriaV1Leitura } {
  contadorRisco = 0
  const riscos: RiscoAduaneiroLeitura[] = []
  const regras: RegraAuditoriaV1[] = []
  const ncmsGlobal = new Set<string>()
  const invoices = coletarInvoices(documentosEntrada)

  const cnpjPorArquivo = new Map<string, string>()
  for (const doc of documentosEntrada) {
    const mapaArquivo = achatarCamposDadosLeitura(doc.dados)
    const cnpjArquivo = valorCampo(mapaArquivo, ['importer.cnpj', 'importer.taxId', 'buyer.cnpj'])
    if (cnpjArquivo && validarCnpjBrasil(cnpjArquivo) && !cnpjPorArquivo.has(doc.nome_arquivo)) {
      cnpjPorArquivo.set(doc.nome_arquivo, cnpjArquivo)
    }
  }

  for (const doc of invoices) {
    for (const ncm of extrairNcmsDados(doc.dados)) {
      const norm = ncm.replace(/\D/g, '').slice(0, 8)
      if (norm) ncmsGlobal.add(norm)
    }

    // S1-01 Número invoice
    const numeroInvoice = valorCampo(doc.mapa, [
      'document.invoiceNumber',
      'invoiceNumber',
      'document.number',
      'number',
    ])
    regras.push({
      id: `S1-01-${doc.rotulo}`,
      passou: !!numeroInvoice,
      detalhe: numeroInvoice ? `Número: ${numeroInvoice}` : 'Número da invoice ausente',
    })
    if (!numeroInvoice) {
      riscos.push(
        criarRiscoCodigo({
          id_regra: 'S1-01',
          secao: 'identificacao',
          severidade: 'critico',
          categoria: 'documental',
          titulo: 'Número da Invoice ausente',
          motivo: 'Documento sem identificação única na extração.',
          analise:
            'Sem número da invoice não é possível vincular parcelas de câmbio nem registrar a DUIMP com rastreabilidade documental.',
          evidencias: [{ documento: doc.rotulo, campo: 'document.invoiceNumber' }],
        }),
      )
    }

    // S1-02 Data emissão
    const dataEmissao = valorCampo(doc.mapa, [
      'document.issueDate',
      'document.emissionDate',
      'issueDate',
      'date',
    ])
    const dataParsed = parseDataEmissao(dataEmissao)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    let dataOk = !!dataParsed
    let detalheData = dataEmissao ?? 'ausente'
    if (dataParsed) {
      if (dataParsed > hoje) {
        dataOk = false
        detalheData = `Data futura: ${dataEmissao}`
      } else {
        const dias = Math.floor((hoje.getTime() - dataParsed.getTime()) / 86_400_000)
        if (dias > 180) {
          dataOk = false
          detalheData = `Data antiga (${dias} dias): ${dataEmissao}`
        }
      }
    }
    regras.push({ id: `S1-02-${doc.rotulo}`, passou: dataOk, detalhe: detalheData })
    if (!dataParsed) {
      riscos.push(
        criarRiscoCodigo({
          id_regra: 'S1-02',
          secao: 'identificacao',
          severidade: 'atencao',
          categoria: 'documental',
          titulo: 'Data de emissão ausente',
          motivo: 'Invoice sem data de emissão legível na extração.',
          analise: 'A data de emissão é obrigatória para amarrar prazos cambiais e validade comercial.',
          evidencias: [{ documento: doc.rotulo, campo: 'document.issueDate' }],
        }),
      )
    } else if (!dataOk) {
      riscos.push(
        criarRiscoCodigo({
          id_regra: 'S1-02',
          secao: 'identificacao',
          severidade: 'atencao',
          categoria: 'documental',
          titulo: 'Data de emissão fora do intervalo esperado',
          motivo: `Data de emissão «${dataEmissao}» é futura ou tem mais de 180 dias.`,
          analise:
            'Datas futuras ou excessivamente antigas podem indicar erro de OCR, documento reutilizado ou operação fora do prazo comercial habitual.',
          evidencias: [{ documento: doc.rotulo, campo: 'document.issueDate', valor: dataEmissao }],
        }),
      )
    }

    // S1-04 Paginação (opcional — sem dado no PDF → N/A)
    const pageCount = valorCampo(doc.mapa, [
      'document.pageCount',
      'document.totalPages',
      'pagination.total',
    ])
    regras.push({
      id: `S1-04-${doc.rotulo}`,
      passou: true,
      detalhe: pageCount
        ? `Páginas: ${pageCount}`
        : 'N/A — paginação ausente no documento',
    })

    // S2-01 CNPJ módulo 11
    const cnpj =
      valorCampo(doc.mapa, ['importer.cnpj', 'importer.taxId', 'buyer.cnpj']) ??
      cnpjPorArquivo.get(doc.nome_arquivo) ??
      null
    const cnpjValido = !!cnpj && validarCnpjBrasil(cnpj)
    regras.push({
      id: `S2-01-${doc.rotulo}`,
      passou: cnpjValido,
      detalhe: cnpj ?? 'ausente',
    })
    if (!cnpj) {
      riscos.push(
        criarRiscoCodigo({
          id_regra: 'S2-01',
          secao: 'cadastral',
          severidade: 'critico',
          categoria: 'cnpj',
          titulo: 'CNPJ do importador ausente',
          motivo: 'Importador sem CNPJ na extração da invoice.',
          analise: 'Sem CNPJ não é possível consultar a base da Receita Federal nem validar razão social e endereço fiscal.',
          evidencias: [{ documento: doc.rotulo, campo: 'importer.cnpj' }],
        }),
      )
    } else if (!validarCnpjBrasil(cnpj)) {
      riscos.push(
        criarRiscoCodigo({
          id_regra: 'S2-01',
          secao: 'cadastral',
          severidade: 'critico',
          categoria: 'cnpj',
          titulo: 'CNPJ com dígitos verificadores inválidos',
          motivo: `CNPJ «${cnpj}» não passa na validação Módulo 11.`,
          analise: 'Erro de OCR ou digitação no CNPJ impede consulta cadastral e registro da DUIMP.',
          evidencias: [{ documento: doc.rotulo, campo: 'importer.cnpj', valor: cnpj }],
        }),
      )
    }

    // S3-01 Incoterm
    const incotermRaw = valorCampo(doc.mapa, ['document.incoterm', 'incoterm'])
    const incoterm = incotermRaw?.trim().toUpperCase().slice(0, 3) ?? null
    const incotermOk = incoterm != null && INCOTERMS_VALIDOS.has(incoterm)
    regras.push({
      id: `S3-01-${doc.rotulo}`,
      passou: incotermOk,
      detalhe: incotermRaw ?? 'ausente',
    })
    if (!incotermOk) {
      riscos.push(
        criarRiscoCodigo({
          id_regra: 'S3-01',
          secao: 'logistica',
          severidade: 'critico',
          categoria: 'incoterm',
          titulo: incotermRaw ? 'Incoterm inválido ou incompleto' : 'Incoterm ausente',
          motivo: incotermRaw
            ? `Incoterm «${incotermRaw}» não é sigla válida Incoterms® 2020.`
            : 'Documento comercial sem Incoterm na extração.',
          analise:
            'Incoterm de 3 letras com local nomeado define transferência de risco, frete e seguro na importação.',
          evidencias: [{ documento: doc.rotulo, campo: 'document.incoterm', valor: incotermRaw }],
        }),
      )
    }

    // S5-01 Moeda ISO
    const moeda = valorCampo(doc.mapa, ['currency.type', 'currency', 'document.currency'])?.toUpperCase()
    const moedaOk = moeda != null && MOEDAS_ISO_4217.has(moeda)
    regras.push({ id: `S5-01-${doc.rotulo}`, passou: moedaOk, detalhe: moeda ?? 'ausente' })
    if (!moedaOk) {
      riscos.push(
        criarRiscoCodigo({
          id_regra: 'S5-01',
          secao: 'financeiro',
          severidade: 'atencao',
          categoria: 'matematico',
          titulo: 'Moeda fora do padrão ISO 4217',
          motivo: moeda
            ? `Moeda «${moeda}» não reconhecida na tabela ISO 4217.`
            : 'Moeda da operação não identificada na extração.',
          analise: 'O fechamento de câmbio exige código ISO explícito (USD, EUR, GBP, BRL…).',
          evidencias: [{ documento: doc.rotulo, campo: 'currency.type', valor: moeda }],
        }),
      )
    }

    // S6-02 SWIFT/IBAN
    const swift = valorCampo(doc.mapa, ['payment.swift', 'bank.swift', 'swiftCode'])
    const iban = valorCampo(doc.mapa, ['payment.iban', 'bank.iban'])
    if (swift && !REGEX_SWIFT.test(swift.replace(/\s/g, '').toUpperCase())) {
      riscos.push(
        criarRiscoCodigo({
          id_regra: 'S6-02',
          secao: 'bancario',
          severidade: 'atencao',
          categoria: 'comercial',
          titulo: 'Código SWIFT/BIC com formato inválido',
          motivo: `SWIFT «${swift}» não corresponde ao padrão BIC (8 ou 11 caracteres).`,
          analise: 'Formato inválido de SWIFT impede instrução de pagamento internacional.',
          evidencias: [{ documento: doc.rotulo, campo: 'payment.swift', valor: swift }],
        }),
      )
    }
    if (iban && !REGEX_IBAN.test(iban.replace(/\s/g, '').toUpperCase())) {
      riscos.push(
        criarRiscoCodigo({
          id_regra: 'S6-02',
          secao: 'bancario',
          severidade: 'atencao',
          categoria: 'comercial',
          titulo: 'IBAN com formato inválido',
          motivo: `IBAN «${iban}» não passa na validação estrutural.`,
          analise: 'IBAN inválido bloqueia transferência internacional ao exportador.',
          evidencias: [{ documento: doc.rotulo, campo: 'payment.iban', valor: iban }],
        }),
      )
    }

    // S7-01 Peso bruto >= líquido
    const pesoBruto = parseNumero(valorCampo(doc.mapa, ['weights.grossWeight', 'grossWeight', 'totalGrossWeight']))
    const pesoLiquido = parseNumero(valorCampo(doc.mapa, ['weights.netWeight', 'netWeight', 'totalNetWeight']))
    if (pesoBruto != null && pesoLiquido != null && pesoBruto < pesoLiquido) {
      riscos.push(
        criarRiscoCodigo({
          id_regra: 'S7-01',
          secao: 'pesos_embalagens',
          severidade: 'atencao',
          categoria: 'documental',
          titulo: 'Peso bruto menor que peso líquido',
          motivo: `Gross Weight (${pesoBruto}) < Net Weight (${pesoLiquido}).`,
          analise: 'Fisicamente o peso bruto deve incluir embalagem e ser maior ou igual ao líquido.',
          evidencias: [
            {
              documento: doc.rotulo,
              campo: 'weights.grossWeight',
              valor: `${pesoBruto} vs ${pesoLiquido}`,
            },
          ],
        }),
      )
    }

    const itens = extrairItens(doc.dados)
    let somaLinhas = 0
    let linhasComTotal = 0
    let linhasVerificaveisMultiplicacao = 0
    let linhasDivergentesMultiplicacao = 0
    let ncmPresentes = 0
    let ncmInvalidos = 0

    for (const item of itens) {
      // S4-01 Part number
      if (!item.partNumber) {
        riscos.push(
          criarRiscoCodigo({
            id_regra: 'S4-01',
            secao: 'itens_fiscais',
            severidade: 'informativo',
            categoria: 'documental',
            titulo: `Part Number ausente — linha ${item.indice + 1}`,
            motivo: `Linha ${item.indice + 1} sem Part Number / SKU para amarração com histórico.`,
            analise: 'Referência de produto facilita catálogo DUIMP e rastreio de importações anteriores.',
            evidencias: [{ documento: doc.rotulo, campo: `items[${item.indice}].partNumber` }],
          }),
        )
      }

      // S4-03/04 NCM
      const sitNcm = classificarSituacaoCodigoFiscal(item.ncm)
      if (sitNcm !== 'ausente') {
        ncmPresentes += 1
        if (sitNcm !== 'completo') ncmInvalidos += 1
      }
      if (sitNcm === 'ausente') {
        riscos.push(
          criarRiscoCodigo({
            id_regra: 'S4-03',
            secao: 'itens_fiscais',
            severidade: 'critico',
            categoria: 'ncm',
            titulo: `NCM ausente — linha ${item.indice + 1}`,
            motivo: `Linha ${item.indice + 1}: NCM não informado${item.descricao ? ` para «${item.descricao.slice(0, 100)}»` : ''}.`,
            analise:
              'Sem NCM de 8 dígitos a classificação fiscal fica indefinida. O Passo 3 (Analista IA) sugerirá código com base na descrição.',
            evidencias: [{ documento: doc.rotulo, campo: `items[${item.indice}].ncm`, valor: item.descricao }],
          }),
        )
      } else if (sitNcm !== 'completo') {
        riscos.push(
          criarRiscoCodigo({
            id_regra: 'S4-04',
            secao: 'itens_fiscais',
            severidade: 'atencao',
            categoria: 'ncm',
            titulo: `NCM com estrutura inválida — linha ${item.indice + 1}`,
            motivo: `Linha ${item.indice + 1}: NCM «${item.ncm}» não possui 8 dígitos Mercosul.`,
            analise: 'NCM brasileiro exige 8 dígitos numéricos na Tabela TI. Pré-classificação semântica ocorre no Passo 3 (LLM).',
            evidencias: [{ documento: doc.rotulo, campo: `items[${item.indice}].ncm`, valor: item.ncm }],
          }),
        )
      }

      // S4-05 Unidade
      if (item.qty != null && !item.unidade) {
        riscos.push(
          criarRiscoCodigo({
            id_regra: 'S4-05',
            secao: 'itens_fiscais',
            severidade: 'informativo',
            categoria: 'documental',
            titulo: `Unidade de medida ausente — linha ${item.indice + 1}`,
            motivo: `Linha ${item.indice + 1} tem quantidade (${item.qty}) sem unidade comercial.`,
            analise: 'Unidade (Pç, Kg, Conjunto…) é exigida para conferência aduaneira por linha.',
            evidencias: [{ documento: doc.rotulo, campo: `items[${item.indice}].unit` }],
          }),
        )
      }

      // S5-03 Multiplicação linha
      if (item.qty != null && item.precoUnit != null && item.totalLinha != null) {
        linhasVerificaveisMultiplicacao += 1
        const esperado = item.qty * item.precoUnit
        const linhaOk = valoresProximos(esperado, item.totalLinha, Math.max(0.1, esperado * 0.01))
        if (!linhaOk) {
          linhasDivergentesMultiplicacao += 1
          riscos.push(
            criarRiscoCodigo({
              id_regra: 'S5-03',
              secao: 'financeiro',
              severidade: 'atencao',
              categoria: 'matematico',
              titulo: 'Divergência no total da linha',
              motivo: `Linha ${item.indice + 1}: itemQuantity × itemUnitPriceWithCurrency não confere com itemTotalPriceWithCurrency.`,
              analise: formatarAnaliseDivergenciaLinha({
                indiceLinha: item.indice,
                descricao: item.descricao,
                qty: item.qty,
                precoUnit: item.precoUnit,
                totalLido: item.totalLinha,
                moeda,
              }),
              evidencias: [
                {
                  documento: doc.rotulo,
                  campo: `items[${item.indice}]`,
                  valor: `${item.qty} × ${item.precoUnit} ≠ ${item.totalLinha}`,
                },
              ],
            }),
          )
        }
      }
      if (item.totalLinha != null) {
        somaLinhas += item.totalLinha
        linhasComTotal += 1
      }
    }

    // S5-04 Somatório
    const subtotal = parseNumero(
      valorCampo(doc.mapa, ['values.subtotal', 'subtotal', 'values.merchandiseTotal']),
    )
    const totalDoc = parseNumero(
      valorCampo(doc.mapa, ['values.totalDocumentValue', 'totalDocumentValue', 'totalValue']),
    )
    if (linhasComTotal > 0 && subtotal != null) {
      const somaOk = valoresProximos(somaLinhas, subtotal, Math.max(0.1, subtotal * 0.01))
      regras.push({
        id: `S5-04-${doc.rotulo}`,
        passou: somaOk,
        detalhe: somaOk
          ? `Σ linhas ${formatarValorRegra(somaLinhas)} = subtotal ${formatarValorRegra(subtotal)}`
          : `Σ linhas ${formatarValorRegra(somaLinhas)} ≠ subtotal ${formatarValorRegra(subtotal)}`,
      })
      if (!somaOk) {
        riscos.push(
          criarRiscoCodigo({
            id_regra: 'S5-04',
            secao: 'financeiro',
            severidade: 'atencao',
            categoria: 'matematico',
            titulo: 'Soma das linhas diverge do subtotal',
            motivo: 'A soma dos totais de linha não confere com o subtotal da invoice.',
            analise: formatarAnaliseDivergenciaSoma(somaLinhas, subtotal, moeda),
            evidencias: [
              {
                documento: doc.rotulo,
                campo: 'values.subtotal',
                valor: `Σ linhas ${somaLinhas} vs subtotal ${subtotal}`,
              },
            ],
          }),
        )
      }
    } else if (linhasComTotal > 0 && totalDoc != null) {
      const somaOk = valoresProximos(somaLinhas, totalDoc, Math.max(0.1, totalDoc * 0.01))
      regras.push({
        id: `S5-04-${doc.rotulo}`,
        passou: somaOk,
        detalhe: somaOk
          ? `Σ linhas ${formatarValorRegra(somaLinhas)} = total ${formatarValorRegra(totalDoc)}`
          : `Σ linhas ${formatarValorRegra(somaLinhas)} ≠ total ${formatarValorRegra(totalDoc)}`,
      })
      if (!somaOk) {
        riscos.push(
          criarRiscoCodigo({
            id_regra: 'S5-04',
            secao: 'financeiro',
            severidade: 'atencao',
            categoria: 'matematico',
            titulo: 'Soma das linhas diverge do total do documento',
            motivo: 'A soma dos totais de linha não confere com o valor total da invoice.',
            analise: formatarAnaliseDivergenciaSoma(somaLinhas, totalDoc, moeda),
            evidencias: [
              {
                documento: doc.rotulo,
                campo: 'values.totalDocumentValue',
                valor: `Σ linhas ${somaLinhas} vs total ${totalDoc}`,
              },
            ],
          }),
        )
      }
    }

    // S5-05 Fechamento financeiro
    const frete = parseNumero(valorCampo(doc.mapa, ['values.freight', 'freight', 'shipping']))
    const seguro = parseNumero(valorCampo(doc.mapa, ['values.insurance', 'insurance']))
    const desconto = parseNumero(valorCampo(doc.mapa, ['values.discount', 'discount']))
    const acrescimos = parseNumero(valorCampo(doc.mapa, ['values.otherCharges', 'otherCharges']))
    const baseSubtotal = subtotal ?? somaLinhas
    if (totalDoc != null && baseSubtotal > 0) {
      const esperadoTotal =
        baseSubtotal + (frete ?? 0) + (seguro ?? 0) + (acrescimos ?? 0) - (desconto ?? 0)
      const fechamentoOk = valoresProximos(esperadoTotal, totalDoc, Math.max(0.1, totalDoc * 0.01))
      regras.push({
        id: `S5-05-${doc.rotulo}`,
        passou: fechamentoOk,
        detalhe: fechamentoOk
          ? `Fechamento OK: ${esperadoTotal} ≈ ${totalDoc}`
          : `Esperado ${esperadoTotal}, lido ${totalDoc}`,
      })
      if (!fechamentoOk) {
        riscos.push(
          criarRiscoCodigo({
            id_regra: 'S5-05',
            secao: 'financeiro',
            severidade: 'atencao',
            categoria: 'matematico',
            titulo: 'Fechamento financeiro não confere',
            motivo: 'Subtotal + frete + seguro + acréscimos − descontos ≠ total global.',
            analise: `De acordo com a análise, ${baseSubtotal} + ${frete ?? 0} (frete) + ${seguro ?? 0} (seguro) + ${acrescimos ?? 0} (acréscimos) − ${desconto ?? 0} (descontos) deveria resultar em ${esperadoTotal.toFixed(2)}, mas values.totalDocumentValue consta ${totalDoc.toFixed(2)}.`,
            evidencias: [{ documento: doc.rotulo, campo: 'values.totalDocumentValue', valor: String(totalDoc) }],
          }),
        )
      }
    }

    // Registro no checklist para as demais regras de código — status deixa de ficar pendente
    // quando o motor validou e não encontrou problema (regra sem registro = pendente na UI).

    // S4-01 Part Number
    const linhasComPn = itens.filter((i) => i.partNumber).length
    regras.push({
      id: `S4-01-${doc.rotulo}`,
      passou: itens.length === 0 || linhasComPn === itens.length,
      detalhe:
        itens.length === 0
          ? 'N/A — sem linhas de item extraídas'
          : `${linhasComPn}/${itens.length} linha(s) com Part Number`,
    })

    // S4-04 NCM declarado (estrutura) — ausência total é tratada pela S4-03 (pré-classificação)
    regras.push({
      id: `S4-04-${doc.rotulo}`,
      passou: ncmInvalidos === 0,
      detalhe:
        itens.length === 0
          ? 'N/A — sem linhas de item extraídas'
          : ncmPresentes === 0
            ? 'N/A — NCM não declarado nas linhas (pré-classificação em S4-03)'
            : ncmInvalidos === 0
              ? `${ncmPresentes} NCM(s) com estrutura válida`
              : `${ncmInvalidos} NCM(s) fora do padrão de 8 dígitos`,
    })

    // S4-05 Unidades de medida
    const linhasComQtd = itens.filter((i) => i.qty != null)
    const linhasSemUnidade = linhasComQtd.filter((i) => !i.unidade).length
    regras.push({
      id: `S4-05-${doc.rotulo}`,
      passou: linhasSemUnidade === 0,
      detalhe:
        linhasComQtd.length === 0
          ? 'N/A — sem quantidades extraídas nas linhas'
          : linhasSemUnidade === 0
            ? `${linhasComQtd.length} linha(s) com quantidade e unidade comercial`
            : `${linhasSemUnidade} linha(s) com quantidade sem unidade comercial`,
    })

    // S5-02 Unicidade cambial — moeda das linhas = moeda dos totais
    const moedasOperacao = new Set(itens.map((i) => i.moeda).filter((m): m is string => !!m))
    if (moeda) moedasOperacao.add(moeda)
    const unicidadeOk = moedasOperacao.size <= 1
    regras.push({
      id: `S5-02-${doc.rotulo}`,
      passou: unicidadeOk,
      detalhe:
        moedasOperacao.size === 0
          ? 'N/A — moeda não extraída'
          : unicidadeOk
            ? `Moeda única na operação: ${[...moedasOperacao][0]}`
            : `Moedas divergentes: ${[...moedasOperacao].join(', ')}`,
    })
    if (!unicidadeOk) {
      riscos.push(
        criarRiscoCodigo({
          id_regra: 'S5-02',
          secao: 'financeiro',
          severidade: 'atencao',
          categoria: 'matematico',
          titulo: 'Mais de uma moeda na mesma invoice',
          motivo: `Foram lidas moedas distintas no documento: ${[...moedasOperacao].join(', ')}.`,
          analise: 'O fechamento de câmbio exige uma única moeda entre linhas e totais da invoice.',
          evidencias: [{ documento: doc.rotulo, campo: 'currency.type', valor: [...moedasOperacao].join(', ') }],
        }),
      )
    }

    // S5-03 Multiplicação de linha (resumo)
    regras.push({
      id: `S5-03-${doc.rotulo}`,
      passou: linhasDivergentesMultiplicacao === 0,
      detalhe:
        linhasVerificaveisMultiplicacao === 0
          ? 'N/A — linhas sem quantidade × preço × total para verificar'
          : linhasDivergentesMultiplicacao === 0
            ? `${linhasVerificaveisMultiplicacao} linha(s) verificadas — quantidade × preço confere`
            : `${linhasDivergentesMultiplicacao} linha(s) com total divergente`,
    })

    // S5-04 sem base de comparação
    if (linhasComTotal === 0 || (subtotal == null && totalDoc == null)) {
      regras.push({
        id: `S5-04-${doc.rotulo}`,
        passou: true,
        detalhe:
          linhasComTotal === 0
            ? 'N/A — linhas sem total extraído para somar'
            : 'N/A — subtotal/total do documento não extraído para comparar',
      })
    }

    // S5-06 Rateios finais
    const temValorGlobal = [frete, seguro, desconto, acrescimos].some((v) => v != null && v !== 0)
    regras.push({
      id: `S5-06-${doc.rotulo}`,
      passou: true,
      detalhe: temValorGlobal
        ? `Frete ${formatarValorRegra(frete ?? 0)} · seguro ${formatarValorRegra(seguro ?? 0)} · desconto ${formatarValorRegra(desconto ?? 0)} — rateio proporcional entre linhas`
        : 'N/A — sem frete, seguro ou desconto global para ratear',
    })

    // S6-02 SWIFT / IBAN (formato)
    const swiftOk = !swift || REGEX_SWIFT.test(swift.replace(/\s/g, '').toUpperCase())
    const ibanOk = !iban || REGEX_IBAN.test(iban.replace(/\s/g, '').toUpperCase())
    regras.push({
      id: `S6-02-${doc.rotulo}`,
      passou: swiftOk && ibanOk,
      detalhe:
        !swift && !iban
          ? 'N/A — SWIFT/IBAN não extraído do documento'
          : [
              swift ? `SWIFT ${swift}${swiftOk ? ' válido' : ' inválido'}` : null,
              iban ? `IBAN ${iban}${ibanOk ? ' válido' : ' inválido'}` : null,
            ]
              .filter(Boolean)
              .join(' · '),
    })

    // S7-01 Peso bruto ≥ líquido
    regras.push({
      id: `S7-01-${doc.rotulo}`,
      passou: pesoBruto == null || pesoLiquido == null || pesoBruto >= pesoLiquido,
      detalhe:
        pesoBruto == null || pesoLiquido == null
          ? 'N/A — pesos bruto/líquido não extraídos'
          : pesoBruto >= pesoLiquido
            ? `Bruto ${formatarValorRegra(pesoBruto)} ≥ líquido ${formatarValorRegra(pesoLiquido)}`
            : `Bruto ${formatarValorRegra(pesoBruto)} < líquido ${formatarValorRegra(pesoLiquido)}`,
    })

    // S7-02 Consistência de volumes
    const totalVolumes = parseNumero(
      valorCampo(doc.mapa, ['packages.count', 'packages.total', 'document.packageCount']),
    )
    regras.push({
      id: `S7-02-${doc.rotulo}`,
      passou: true,
      detalhe:
        totalVolumes == null
          ? 'N/A — contagem de volumes não extraída'
          : `${formatarValorRegra(totalVolumes)} volume(s) declarados no documento`,
    })
  }

  // Cruzamento entre documentos da leitura
  const todosDocs = documentosEntrada.map((doc) => ({
    rotulo: rotuloDocumento(doc.nome_arquivo, doc.tipo_documento, doc.indice),
    tipo: doc.tipo_documento.toUpperCase(),
    mapa: achatarCamposDadosLeitura(doc.dados),
    dados: doc.dados,
  }))

  const incoterms = todosDocs
    .map((d) => ({
      rotulo: d.rotulo,
      valor: valorCampo(d.mapa, ['document.incoterm', 'incoterm']),
    }))
    .filter((i): i is { rotulo: string; valor: string } => !!i.valor)
  const incotermsUnicos = new Set(incoterms.map((i) => i.valor.trim().toUpperCase()))
  if (incotermsUnicos.size > 1) {
    riscos.push(
      criarRiscoCodigo({
        id_regra: 'S3-01',
        secao: 'logistica',
        severidade: 'atencao',
        categoria: 'cruzado',
        titulo: 'Incoterm divergente entre documentos',
        motivo: 'Mais de um Incoterm foi lido na mesma leitura.',
        analise: `Incoterms distintos: ${[...incotermsUnicos].join(', ')} — unifique conforme contrato comercial.`,
        evidencias: incoterms.map((i) => ({ documento: i.rotulo, campo: 'document.incoterm', valor: i.valor })),
      }),
    )
  }

  const ncmsPorDoc = todosDocs.map((d) => ({
    rotulo: d.rotulo,
    tipo: d.tipo,
    ncms: [...new Set(extrairNcmsDados(d.dados).map((n) => n.replace(/\D/g, '').slice(0, 8)))].filter(Boolean),
  }))
  const invoice = ncmsPorDoc.find((d) => d.tipo.includes('INVOICE'))
  const packing = ncmsPorDoc.find((d) => d.tipo.includes('PACKING'))
  if (invoice && packing && invoice.ncms.length > 0 && packing.ncms.length > 0) {
    const setInv = new Set(invoice.ncms)
    const setPl = new Set(packing.ncms)
    const diverge =
      [...setInv].some((n) => !setPl.has(n)) || [...setPl].some((n) => !setInv.has(n))
    if (diverge) {
      riscos.push(
        criarRiscoCodigo({
          id_regra: 'S4-04',
          secao: 'itens_fiscais',
          severidade: 'atencao',
          categoria: 'cruzado',
          titulo: 'Possível divergência de NCM entre Invoice e Packing List',
          motivo: 'Os conjuntos de NCM lidos nos dois documentos não coincidem.',
          analise:
            'NCM diferente entre documentos comerciais da mesma operação é gatilho de exigência aduaneira.',
          evidencias: [
            { documento: invoice.rotulo, campo: 'items[].ncm', valor: invoice.ncms.join(', ') },
            { documento: packing.rotulo, campo: 'items[].ncm', valor: packing.ncms.join(', ') },
          ],
        }),
      )
    }
  }

  return {
    resumo: montarResumo(riscos),
    contexto: {
      regras,
      ncms_encontrados: [...ncmsGlobal],
      tributos_ncm: [],
    },
  }
}

/** Alias de compatibilidade — Passo 1 (motor Código) da invoice + matrizes do packing list, do AWB e do BL. */
export function executarAuditoriaV1AnaliseRiscosLeitura(
  documentosEntrada: DocumentoAnaliseRisco[],
): { resumo: ResumoRiscosAduaneirosLeitura; contexto: ContextoAuditoriaV1Leitura } {
  const invoice = executarPasso1ValidacaoCodigoInvoice(documentosEntrada)
  const packing = executarPasso1ValidacaoCodigoPackingList(documentosEntrada)
  const awb = executarPasso1ValidacaoCodigoAwb(documentosEntrada)
  const bl = executarPasso1ValidacaoCodigoBl(documentosEntrada)
  const semPacking = packing.contexto.regras.length === 0 && packing.resumo.total === 0
  const semAwb = awb.contexto.regras.length === 0 && awb.resumo.total === 0
  const semBl = bl.contexto.regras.length === 0 && bl.resumo.total === 0
  if (semPacking && semAwb && semBl) return invoice
  return {
    resumo: montarResumo([
      ...invoice.resumo.riscos,
      ...packing.resumo.riscos,
      ...awb.resumo.riscos,
      ...bl.resumo.riscos,
    ]),
    contexto: {
      ...invoice.contexto,
      regras: [
        ...invoice.contexto.regras,
        ...packing.contexto.regras,
        ...awb.contexto.regras,
        ...bl.contexto.regras,
      ],
    },
  }
}
