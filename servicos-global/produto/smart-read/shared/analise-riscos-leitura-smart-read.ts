/**
 * analise-riscos-leitura-smart-read.ts — SSOT V1 determinístico + contratos API (V2/V3).
 */

import { z } from 'zod'
import type { MotorValidacaoInvoice, SecaoMatrizInvoice, StatusMatrizInvoice } from './matriz-validacao-invoice-smart-read.js'
import type {
  MotorValidacaoPackingList,
  SecaoMatrizPackingList,
} from './matriz-validacao-packing-list-smart-read.js'
import {
  ehRiscoClassificacaoFiscal,
  formatarAnaliseDivergenciaLinha,
  formatarAnaliseDivergenciaSoma,
  textoExtracaoEhPlaceholder,
} from './texto-analise-riscos-leitura-smart-read.js'
import {
  ResumoUsoLlmLeituraSmartReadSchema,
  UsoLlmChamadaLeituraSmartReadSchema,
} from './uso-llm-leitura-smart-read.js'

export type SeveridadeRiscoAduaneiro = 'critico' | 'atencao' | 'informativo'

export type CategoriaRiscoAduaneiro =
  | 'ncm'
  | 'cnpj'
  | 'incoterm'
  | 'documental'
  | 'cruzado'
  | 'matematico'
  | 'comercial'
  | 'normativo'

export type EvidenciaRiscoAduaneiroLeitura = {
  documento: string
  campo?: string
  valor?: string | null
}

export type CitacaoNormativaRisco = {
  tipo: 'ncm_oficial' | 'kb_gravity' | 'instrucao_normativa' | 'portal_unico'
  referencia: string
  trecho?: string
}

export type RiscoAduaneiroLeitura = {
  id: string
  severidade: SeveridadeRiscoAduaneiro
  categoria: CategoriaRiscoAduaneiro
  titulo: string
  motivo: string
  analise: string
  correcao_sugerida?: string
  evidencias: EvidenciaRiscoAduaneiroLeitura[]
  citacoes_normativas?: CitacaoNormativaRisco[]
  origem?: 'v1' | 'llm'
  /** Matriz consolidada — seções da invoice (S1–S8) ou do packing list (P1–P9) */
  secao_matriz?: SecaoMatrizInvoice | SecaoMatrizPackingList
  id_regra_matriz?: string
  motor_validacao?: MotorValidacaoInvoice | MotorValidacaoPackingList
  status_matriz?: StatusMatrizInvoice
}

export type DadosOficiaisCnpjLeitura = {
  cnpj: string
  razao_social: string | null
  nome_fantasia: string | null
  situacao_cadastral: string | null
  ativo: boolean
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  municipio: string | null
  uf: string | null
  cep: string | null
  fonte: string | null
}

export type ResumoRiscosAduaneirosLeitura = {
  riscos: RiscoAduaneiroLeitura[]
  total: number
  criticos: number
  atencao: number
  informativos: number
}

export type TributosNcmLeitura = {
  codigo_ncm: string
  descricao_ncm: string | null
  valido: boolean
  fonte: string | null
  ii: number | null
  ipi: number | null
  pis: number | null
  cofins: number | null
}

export type RegraAuditoriaV1 = {
  id: string
  passou: boolean
  detalhe: string
}

export type ContextoAuditoriaV1Leitura = {
  regras: RegraAuditoriaV1[]
  ncms_encontrados: string[]
  tributos_ncm: TributosNcmLeitura[]
  cnpj_oficial?: DadosOficiaisCnpjLeitura | null
}

export const DocumentoAnaliseRiscoSchema = z.object({
  nome_arquivo: z.string().min(1),
  tipo_documento: z.string().min(1),
  indice: z.number().int().min(0),
  dados: z.record(z.string(), z.unknown()),
})

export const AnaliseRiscosLeituraRequestSchema = z.object({
  documentos: z.array(DocumentoAnaliseRiscoSchema).min(1),
  pergunta: z.string().trim().min(1).optional(),
  incluir_llm: z.boolean().optional().default(true),
  id_leitura_legado: z.string().min(8).optional(),
})

export const CitacaoNormativaRiscoSchema = z.object({
  tipo: z.enum(['ncm_oficial', 'kb_gravity', 'instrucao_normativa', 'portal_unico']),
  referencia: z.string().min(1),
  trecho: z.string().optional(),
})

export const RiscoAduaneiroLeituraSchema = z.object({
  id: z.string().optional(),
  severidade: z.enum(['critico', 'atencao', 'informativo']),
  categoria: z.enum(['ncm', 'cnpj', 'incoterm', 'documental', 'cruzado', 'matematico', 'comercial', 'normativo']),
  titulo: z.string().min(1),
  motivo: z.string().min(1),
  analise: z.string().min(1),
  correcao_sugerida: z.string().min(1).optional(),
  evidencias: z.array(
    z.object({
      documento: z.string(),
      campo: z.string().optional(),
      valor: z.string().nullable().optional(),
    }),
  ),
  citacoes_normativas: z.array(CitacaoNormativaRiscoSchema).optional(),
  origem: z.enum(['v1', 'llm']).optional(),
  secao_matriz: z
    .enum([
      'identificacao',
      'cadastral',
      'logistica',
      'itens_fiscais',
      'financeiro',
      'bancario',
      'pesos_embalagens',
      'legitimidade',
      'identificacao_vinculos',
      'partes_envolvidas',
      'transporte_cct',
      'volumes_embalagens',
      'pesos_consistencias',
      'itens_rastreabilidade',
      'catalogo_duimp',
      'regulatorio_anuencias',
      'legitimidade_risco',
    ])
    .optional(),
  id_regra_matriz: z.string().optional(),
  motor_validacao: z
    .enum(['codigo', 'api', 'llm', 'rag', 'cross_doc', 'codigo_rag', 'cross_doc_rag', 'api_llm'])
    .optional(),
  status_matriz: z.enum(['verde', 'amarelo', 'vermelho']).optional(),
})

export const AnaliseRiscosLeituraResponseSchema = z.object({
  resumo: z.object({
    riscos: z.array(RiscoAduaneiroLeituraSchema),
    total: z.number().int().min(0),
    criticos: z.number().int().min(0),
    atencao: z.number().int().min(0),
    informativos: z.number().int().min(0),
  }),
  contexto_v1: z.object({
    regras: z.array(
      z.object({
        id: z.string(),
        passou: z.boolean(),
        detalhe: z.string(),
      }),
    ),
    ncms_encontrados: z.array(z.string()),
    tributos_ncm: z.array(
      z.object({
        codigo_ncm: z.string(),
        descricao_ncm: z.string().nullable(),
        valido: z.boolean(),
        fonte: z.string().nullable(),
        ii: z.number().nullable(),
        ipi: z.number().nullable(),
        pis: z.number().nullable(),
        cofins: z.number().nullable(),
      }),
    ),
    cnpj_oficial: z
      .object({
        cnpj: z.string(),
        razao_social: z.string().nullable(),
        nome_fantasia: z.string().nullable(),
        situacao_cadastral: z.string().nullable(),
        ativo: z.boolean(),
        logradouro: z.string().nullable(),
        numero: z.string().nullable(),
        complemento: z.string().nullable(),
        bairro: z.string().nullable(),
        municipio: z.string().nullable(),
        uf: z.string().nullable(),
        cep: z.string().nullable(),
        fonte: z.string().nullable(),
      })
      .nullable()
      .optional(),
  }),
  llm_ativo: z.boolean(),
  aviso: z.string().nullable().optional(),
  uso_llm_chamada: UsoLlmChamadaLeituraSmartReadSchema.nullable().optional(),
  uso_llm_leitura: ResumoUsoLlmLeituraSmartReadSchema.nullable().optional(),
})

export type DocumentoAnaliseRisco = z.infer<typeof DocumentoAnaliseRiscoSchema>
export type AnaliseRiscosLeituraRequest = z.infer<typeof AnaliseRiscosLeituraRequestSchema>
export type AnaliseRiscosLeituraResponse = z.infer<typeof AnaliseRiscosLeituraResponseSchema>

const CHAVES_IGNORADAS = new Set(['accuracy', 'averageaccuracy', 'score', 'confidence', 'origem', 'id', '_id'])

export function valorTextoComparacaoCampo(valor: unknown): string | null {
  if (valor === null || valor === undefined || valor === '') return null
  if (typeof valor === 'boolean') return valor ? 'true' : 'false'
  if (typeof valor === 'number') return String(valor)
  if (typeof valor === 'string') return valor.trim()
  if (Array.isArray(valor)) return valor.map((item) => String(item)).join(', ')
  return JSON.stringify(valor)
}

function deveIgnorarChave(chave: string): boolean {
  return CHAVES_IGNORADAS.has(chave.toLowerCase())
}

export function achatarCamposDadosLeitura(
  dados: Record<string, unknown>,
  prefixo = '',
): Map<string, unknown> {
  const saida = new Map<string, unknown>()
  for (const [chave, valor] of Object.entries(dados)) {
    if (deveIgnorarChave(chave)) continue
    const caminho = prefixo ? `${prefixo}.${chave}` : chave
    if (valor !== null && typeof valor === 'object' && !Array.isArray(valor)) {
      for (const [subChave, subValor] of achatarCamposDadosLeitura(valor as Record<string, unknown>, caminho)) {
        saida.set(subChave, subValor)
      }
      continue
    }
    saida.set(caminho, valor)
  }
  return saida
}

type DocumentoLeituraAnalise = {
  rotulo: string
  tipo_documento: string
  mapa: Map<string, unknown>
  dados: Record<string, unknown>
}

function normalizarTipoDocumento(tipo: string): string {
  return tipo.trim().toUpperCase().replace(/\s+/g, '_')
}

function rotuloDocumento(nomeArquivo: string, tipo: string, indice: number): string {
  const tipoNorm = tipo.trim() || `Documento ${indice + 1}`
  return `${nomeArquivo} · ${tipoNorm}`
}

function coletarDocumentosEntrada(documentos: DocumentoAnaliseRisco[]): DocumentoLeituraAnalise[] {
  return documentos.map((doc) => ({
    rotulo: rotuloDocumento(doc.nome_arquivo, doc.tipo_documento, doc.indice),
    tipo_documento: normalizarTipoDocumento(doc.tipo_documento),
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

export function extrairNcmsDados(dados: Record<string, unknown>): string[] {
  const valores = new Set<string>()
  function visitar(no: unknown) {
    if (no === null || no === undefined) return
    if (Array.isArray(no)) {
      for (const item of no) visitar(item)
      return
    }
    if (typeof no === 'object') {
      for (const [chave, valor] of Object.entries(no as Record<string, unknown>)) {
        if (/ncm|hs_code|hsCode/i.test(chave)) {
          const texto = valorTextoComparacaoCampo(valor)
          if (texto) valores.add(texto)
        } else if (valor !== null && typeof valor === 'object') {
          visitar(valor)
        }
      }
    }
  }
  visitar(dados)
  return [...valores]
}

export function validarCnpjBrasil(valor: string | null | undefined): boolean {
  if (!valor) return false
  const digitos = valor.replace(/\D/g, '')
  if (digitos.length !== 14 || /^(\d)\1+$/.test(digitos)) return false
  const calcDigito = (base: string, pesos: number[]) => {
    const soma = base.split('').reduce((acc, d, i) => acc + Number(d) * pesos[i], 0)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }
  const base12 = digitos.slice(0, 12)
  const d1 = calcDigito(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = calcDigito(base12 + d1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return digitos === base12 + String(d1) + String(d2)
}

function normalizarNcm(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 8)
}

function ncmFormatoValido(valor: string): boolean {
  const digitos = normalizarNcm(valor)
  return digitos.length === 8 && digitos !== '00000000'
}

function tiposIncluem(tipo: string, alvos: string[]): boolean {
  return alvos.some((alvo) => tipo.includes(alvo) || alvo.includes(tipo))
}

function parseNumeroComercial(valor: string | null | undefined): number | null {
  if (!valor) return null
  const limpo = valor.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')
  const n = Number.parseFloat(limpo)
  return Number.isFinite(n) ? n : null
}

type ItemComercialLinha = {
  indice: number
  qty: number | null
  precoUnit: number | null
  totalLinha: number | null
  ncm: string | null
  hsCode: string | null
  descricao: string | null
}

export type SituacaoCodigoFiscal = 'ausente' | 'parcial' | 'completo' | 'formato_invalido'

export type ItemClassificacaoFiscalLeitura = {
  documento: string
  indice: number
  descricao: string | null
  ncm_lido: string | null
  hs_lido: string | null
  situacao_ncm: SituacaoCodigoFiscal
  situacao_hs: SituacaoCodigoFiscal
}

export function classificarSituacaoCodigoFiscal(valor: string | null | undefined): SituacaoCodigoFiscal {
  if (!valor?.trim() || textoExtracaoEhPlaceholder(valor)) return 'ausente'
  const digitos = valor.replace(/\D/g, '')
  if (digitos.length === 8 && digitos !== '00000000') return 'completo'
  if (digitos.length > 0 && digitos.length < 8) return 'parcial'
  return 'formato_invalido'
}

/** SSOT — descrição comercial de uma linha de item (invoice / packing). */
export function extrairDescricaoItemLinha(row: Record<string, unknown>): string | null {
  const descBruto = row.descriptions
  const descObj =
    descBruto !== null && typeof descBruto === 'object' && !Array.isArray(descBruto)
      ? (descBruto as Record<string, unknown>)
      : undefined
  const descString = typeof descBruto === 'string' ? descBruto : null

  const candidatos = [
    valorTextoComparacaoCampo(descString),
    valorTextoComparacaoCampo(descObj?.portuguese),
    valorTextoComparacaoCampo(descObj?.english),
    valorTextoComparacaoCampo(descObj?.descPt),
    valorTextoComparacaoCampo(descObj?.descEn),
    valorTextoComparacaoCampo(row.english),
    valorTextoComparacaoCampo(row.English),
    valorTextoComparacaoCampo(row.descEn),
    valorTextoComparacaoCampo(row.descPt),
    valorTextoComparacaoCampo(row.descricao),
    valorTextoComparacaoCampo(row.descricaoComercial),
    valorTextoComparacaoCampo(row.description),
    valorTextoComparacaoCampo(row.itemDescription),
    valorTextoComparacaoCampo(row.productDescription),
  ].filter((v): v is string => Boolean(v) && !textoExtracaoEhPlaceholder(v))
  return candidatos[0] ?? null
}

function extrairCodigoItem(row: Record<string, unknown>, chaves: string[]): string | null {
  for (const chave of chaves) {
    const texto = valorTextoComparacaoCampo(row[chave])
    if (texto && !textoExtracaoEhPlaceholder(texto)) return texto
  }
  return null
}

function extrairItensComerciais(dados: Record<string, unknown>): ItemComercialLinha[] {
  const bruto = dados.items
  if (!Array.isArray(bruto)) return []
  return bruto.map((item, indice) => {
    const row = item as Record<string, unknown>
    const qty = parseNumeroComercial(
      valorTextoComparacaoCampo(row.itemQuantity ?? row.quantity ?? row.qty),
    )
    const precoUnit = parseNumeroComercial(
      valorTextoComparacaoCampo(
        row.itemUnitPriceWithCurrency ?? row.unitPrice ?? row.price ?? row.itemUnitPrice,
      ),
    )
    const totalLinha = parseNumeroComercial(
      valorTextoComparacaoCampo(
        row.itemTotalPriceWithCurrency ?? row.totalPrice ?? row.total ?? row.itemTotalPrice,
      ),
    )
    const ncm = extrairCodigoItem(row, ['ncm', 'NCM', 'codigo_ncm'])
    const hsCode = extrairCodigoItem(row, ['hsCode', 'hs_code', 'HSCode', 'hs'])
    const descricao = extrairDescricaoItemLinha(row)
    return { indice, qty, precoUnit, totalLinha, ncm, hsCode, descricao }
  })
}

export function montarItensParaClassificacaoFiscal(
  documentos: DocumentoAnaliseRisco[],
): ItemClassificacaoFiscalLeitura[] {
  const saida: ItemClassificacaoFiscalLeitura[] = []
  for (const doc of documentos) {
    if (!doc.tipo_documento.toUpperCase().includes('INVOICE')) continue
    const rotulo = rotuloDocumento(doc.nome_arquivo, doc.tipo_documento, doc.indice)
    for (const item of extrairItensComerciais(doc.dados)) {
      saida.push({
        documento: rotulo,
        indice: item.indice,
        descricao: item.descricao,
        ncm_lido: item.ncm,
        hs_lido: item.hsCode,
        situacao_ncm: classificarSituacaoCodigoFiscal(item.ncm),
        situacao_hs: classificarSituacaoCodigoFiscal(item.hsCode),
      })
    }
  }
  return saida
}

function extrairMoedaDocumento(mapa: Map<string, unknown>): string | null {
  return valorCampo(mapa, ['currency.type', 'currency', 'document.currency', 'values.currency'])
}

function montarOQueRiscoClassificacaoFiscal(params: {
  indice: number
  tipo: 'ncm' | 'hs'
  situacao: SituacaoCodigoFiscal
  codigoLido: string | null
  descricao: string | null
}): string {
  const linha = params.indice + 1
  const rotuloTipo = params.tipo === 'ncm' ? 'NCM' : 'HS Code'
  const descSuffix = params.descricao ? ` para «${params.descricao.slice(0, 120)}»` : ''

  if (params.situacao === 'ausente') {
    return `Linha ${linha}: ${rotuloTipo} não informado no documento${descSuffix}.`
  }
  if (params.situacao === 'parcial') {
    const digitos = params.codigoLido?.replace(/\D/g, '') ?? ''
    return `Linha ${linha}: ${rotuloTipo} incompleto — consta «${params.codigoLido}» (${digitos.length} dígitos, esperados 8)${descSuffix}.`
  }
  if (params.situacao === 'formato_invalido') {
    return `Linha ${linha}: valor em ${rotuloTipo} («${params.codigoLido}») não é código fiscal válido de 8 dígitos${descSuffix}.`
  }
  return `Linha ${linha}: conferir ${rotuloTipo} informado${descSuffix}.`
}

export function montarAnaliseTecnicaClassificacaoFiscal(params: {
  tipo: 'ncm' | 'hs'
  situacao: SituacaoCodigoFiscal
  codigoLido: string | null
  descricao: string | null
}): string {
  const rotuloTipo = params.tipo === 'ncm' ? 'NCM' : 'HS Code'
  const desc = params.descricao?.slice(0, 200) ?? 'descrição técnica não legível na extração'

  if (params.situacao === 'ausente') {
    return params.tipo === 'ncm'
      ? `A mercadoria «${desc}» não possui NCM de 8 dígitos na extração. Sem código na Tabela TI NCM (Mercosul), a DUIMP não pode ser registrada com classificação fiscal definida para este item.`
      : `A mercadoria «${desc}» não possui HS Code correlato na extração. O código harmonizado complementa a classificação internacional da mercadoria.`
  }
  if (params.situacao === 'parcial') {
    return `O ${rotuloTipo} parcial «${params.codigoLido}» não permite validação no Siscomex nem confirmação de capítulo/posição para «${desc}». A classificação fiscal brasileira exige os 8 dígitos completos do NCM.`
  }
  if (params.situacao === 'formato_invalido') {
    return `O valor «${params.codigoLido}» não corresponde a um ${rotuloTipo} válido — pode ser rótulo de coluna capturado pelo OCR em vez do código fiscal da mercadoria «${desc}».`
  }
  return `Conferir aderência do ${rotuloTipo} informado à descrição técnica «${desc}».`
}

export type SugestaoClassificacaoFiscalLeitura = {
  documento: string
  indice: number
  tipo: 'ncm' | 'hs'
  situacao: SituacaoCodigoFiscal
  codigoLido: string | null
  codigoSugerido: string
  motivoTecnico: string
  descricao: string | null
  descricaoNcmOficial?: string | null
}

function tituloClassificacaoFiscal(tipo: 'ncm' | 'hs', situacao: SituacaoCodigoFiscal): string {
  const rotuloTipo = tipo === 'ncm' ? 'NCM' : 'HS Code'
  const tituloPorSituacao: Record<SituacaoCodigoFiscal, string> = {
    ausente: `${rotuloTipo} ausente — classificação fiscal a definir`,
    parcial: `${rotuloTipo} parcial — classificação fiscal a confirmar`,
    formato_invalido: `${rotuloTipo} com formato inválido — classificação a revisar`,
    completo: `${rotuloTipo} — conferir aderência à descrição`,
  }
  return tituloPorSituacao[situacao]
}

export function montarRiscoDeClassificacaoFiscalSugerida(
  sug: SugestaoClassificacaoFiscalLeitura,
): RiscoAduaneiroLeitura {
  const rotuloTipo = sug.tipo === 'ncm' ? 'NCM' : 'HS Code'
  const campo = sug.tipo === 'ncm' ? `items[${sug.indice}].ncm` : `items[${sug.indice}].hsCode`
  const de = sug.codigoLido?.trim() || 'ausente'
  const para = sug.codigoSugerido.replace(/\D/g, '').length >= 6
    ? sug.codigoSugerido.replace(/\D/g, '')
    : sug.codigoSugerido.trim()
  const descCurta = sug.descricao?.slice(0, 120) ?? 'item sem descrição legível'

  const motivo =
    sug.situacao === 'ausente'
      ? `Linha ${sug.indice + 1}: ${rotuloTipo} não informado — sugestão ${para} (de ${de} → ${para}) para «${descCurta}».`
      : `Linha ${sug.indice + 1}: ${rotuloTipo} «${de}» — sugestão ${para} (de ${de} → ${para}) para «${descCurta}».`

  let analise = sug.motivoTecnico.trim()
  if (sug.descricaoNcmOficial?.trim()) {
    analise += ` Descrição oficial na Tabela TI NCM (Siscomex): «${sug.descricaoNcmOficial.trim()}».`
  }

  const correcaoBase = `Corrija ${campo} de ${de} para ${para} porque ${sug.motivoTecnico.trim()}`

  return {
    id: `risco-llm-class-${sug.tipo}-${sug.indice}`,
    origem: 'llm',
    severidade: sug.situacao === 'ausente' ? 'critico' : 'atencao',
    categoria: 'ncm',
    titulo: tituloClassificacaoFiscal(sug.tipo, sug.situacao),
    motivo,
    analise,
    correcao_sugerida: correcaoBase,
    evidencias: [
      {
        documento: sug.documento,
        campo,
        valor: sug.codigoLido ?? sug.descricao ?? undefined,
      },
    ],
    citacoes_normativas: sug.descricaoNcmOficial?.trim()
      ? [
          {
            tipo: 'ncm_oficial' as const,
            referencia: `NCM ${para}`,
            trecho: sug.descricaoNcmOficial.trim(),
          },
        ]
      : undefined,
  }
}

function criarRiscoClassificacaoPendente(params: {
  documento: string
  indice: number
  tipo: 'ncm' | 'hs'
  situacao: SituacaoCodigoFiscal
  codigoLido: string | null
  descricao: string | null
}): RiscoAduaneiroLeitura {
  const rotuloTipo = params.tipo === 'ncm' ? 'NCM' : 'HS Code'
  const campo = params.tipo === 'ncm' ? `items[${params.indice}].ncm` : `items[${params.indice}].hsCode`
  const tituloPorSituacao: Record<SituacaoCodigoFiscal, string> = {
    ausente: `${rotuloTipo} ausente — classificação fiscal a definir`,
    parcial: `${rotuloTipo} parcial — classificação fiscal a confirmar`,
    formato_invalido: `${rotuloTipo} com formato inválido — classificação a revisar`,
    completo: `${rotuloTipo} — conferir aderência à descrição`,
  }

  return criarRisco({
    severidade: params.situacao === 'ausente' ? 'critico' : 'atencao',
    categoria: 'ncm',
    titulo: tituloPorSituacao[params.situacao],
    motivo: montarOQueRiscoClassificacaoFiscal(params),
    analise: montarAnaliseTecnicaClassificacaoFiscal(params),
    evidencias: [
      {
        documento: params.documento,
        campo,
        valor: params.codigoLido ?? params.descricao ?? undefined,
      },
    ],
  })
}

function valoresProximos(a: number, b: number, tolerancia = 0.05): boolean {
  return Math.abs(a - b) <= tolerancia
}

let contadorRisco = 0

function criarRisco(parcial: Omit<RiscoAduaneiroLeitura, 'id'>): RiscoAduaneiroLeitura {
  contadorRisco += 1
  return { id: `risco-v1-${contadorRisco}`, origem: 'v1', ...parcial }
}

function montarResumo(riscos: RiscoAduaneiroLeitura[]): ResumoRiscosAduaneirosLeitura {
  const enriquecidos = riscos.map(aplicarCorrecaoSugeridaPadraoRisco)
  return {
    riscos: enriquecidos,
    total: enriquecidos.length,
    criticos: enriquecidos.filter((r) => r.severidade === 'critico').length,
    atencao: enriquecidos.filter((r) => r.severidade === 'atencao').length,
    informativos: enriquecidos.filter((r) => r.severidade === 'informativo').length,
  }
}

const CORRECAO_POR_TITULO: Record<string, string> = {
  'Incoterm ausente':
    'Na aba Conferência de Campos, preencha document.incoterm com o Incoterm acordado (ex.: FOB, CIF, EXW) conforme o contrato comercial.',
  'CNPJ / Tax ID ausente':
    'Complete importer.cnpj ou exporter.taxId na Conferência de Campos com o CNPJ/Tax ID legível do participante da operação.',
  'CNPJ com formato inválido':
    'Revise o dígito a dígito na Conferência de Campos ou no PDF original — erro de OCR é comum em CNPJ.',
  'NCM não identificado':
    'Corrija para o NCM de 8 dígitos sugerido pela análise com base na descrição do item na Conferência de Campos. Sugestão — responsabilidade de classificação é do usuário.',
  'NCM com formato suspeito':
    'Corrija para o NCM de 8 dígitos indicado na sugestão técnica, conferindo zeros à esquerda e aderência à descrição do item.',
  'NCM parcial — classificação fiscal a confirmar':
    'Complete o NCM para 8 dígitos conforme a sugestão técnica na correção sugerida deste card.',
  'NCM ausente — classificação fiscal a definir':
    'Informe o NCM de 8 dígitos indicado na correção sugerida deste card.',
  'HS Code ausente — classificação fiscal a definir':
    'Informe o HS Code correlato indicado na correção sugerida deste card.',
  'HS Code parcial — classificação fiscal a confirmar':
    'Complete o HS Code conforme a sugestão técnica na correção sugerida deste card.',
  'NCM com formato inválido — classificação a revisar':
    'Corrija o NCM conforme o de/para indicado na correção sugerida deste card.',
  'HS Code com formato inválido — classificação a revisar':
    'Corrija o HS Code conforme o de/para indicado na correção sugerida deste card.',
  'Divergência no total da linha':
    'Ajuste itemQuantity, itemUnitPriceWithCurrency ou itemTotalPriceWithCurrency para que qty × preço unitário = total da linha.',
  'Soma das linhas diverge do total do documento':
    'Alinhe values.totalDocumentValue com a soma das linhas ou documente despesas adicionais na invoice.',
  'Incoterm divergente entre documentos':
    'Unifique o Incoterm em todos os documentos da leitura — use o valor do contrato comercial como referência.',
  'Possível divergência de NCM entre Invoice e Packing List':
    'Garanta que cada NCM da invoice apareça na packing list com a mesma classificação fiscal.',
}

const CORRECAO_POR_CATEGORIA: Partial<Record<CategoriaRiscoAduaneiro, string>> = {
  incoterm: 'Revise e alinhe o Incoterm nos documentos comerciais antes do despacho.',
  cnpj: 'Valide CNPJ/Tax ID do importador e exportador no cadastro e na Conferência de Campos.',
  ncm: 'Confirme NCM de 8 dígitos no Siscomex e na descrição dos itens.',
  normativo: 'Consulte a tabela NCM oficial e documentação complementar exigida para o código informado.',
  documental: 'Complete os campos obrigatórios do documento na Conferência de Campos.',
  cruzado: 'Alinhe os valores entre os documentos da mesma leitura antes de prosseguir.',
  matematico: 'Recalcule totais e confira arredondamentos comerciais na invoice.',
  comercial: 'Revise cláusulas comerciais e consistência entre exportador, importador e valores.',
}

export function aplicarCorrecaoSugeridaPadraoRisco(risco: RiscoAduaneiroLeitura): RiscoAduaneiroLeitura {
  if (risco.correcao_sugerida?.trim()) return risco

  if (ehRiscoClassificacaoFiscal(risco.titulo, risco.categoria) && risco.origem === 'v1') {
    return risco
  }

  const porTitulo = CORRECAO_POR_TITULO[risco.titulo]
  if (porTitulo) return { ...risco, correcao_sugerida: porTitulo }

  if (risco.titulo.includes('inválido ou inativo no Siscomex')) {
    const ncm = risco.evidencias[0]?.valor ?? 'informado'
    return {
      ...risco,
      correcao_sugerida: `Substitua o NCM ${ncm} por código ativo na Tabela TI/Siscomex ou corrija digitação na Conferência de Campos.`,
    }
  }

  if (risco.titulo.includes('com II elevado')) {
    return {
      ...risco,
      correcao_sugerida:
        'Confirme a classificação fiscal com despachante e simule landed cost considerando II elevado antes de fechar a operação.',
    }
  }

  const porCategoria = CORRECAO_POR_CATEGORIA[risco.categoria]
  if (porCategoria) return { ...risco, correcao_sugerida: porCategoria }

  return risco
}

export {
  executarPasso1ValidacaoCodigoInvoice,
  executarAuditoriaV1AnaliseRiscosLeitura,
} from './passo-1-validacao-codigo-invoice-smart-read.js'

export function mesclarRiscosAnaliseLeitura(
  v1: RiscoAduaneiroLeitura[],
  extras: RiscoAduaneiroLeitura[],
): ResumoRiscosAduaneirosLeitura {
  const mesclados = [...v1]
  const indicePorCampo = new Map<string, number>()
  mesclados.forEach((r, i) => {
    const campo = r.evidencias[0]?.campo
    if (campo) indicePorCampo.set(chaveEvidenciaRisco(r), i)
  })

  const vistosTituloCampo = new Set(
    mesclados.map((r) => `${r.titulo.toLowerCase()}|${r.evidencias[0]?.campo ?? ''}`),
  )

  let seq = mesclados.length
  for (const risco of extras) {
    const chaveCampo = chaveEvidenciaRisco(risco)
    const campo = risco.evidencias[0]?.campo ?? ''
    const idxExistente = indicePorCampo.get(chaveCampo)
    const ehClassificacao =
      ehRiscoClassificacaoFiscal(risco.titulo, risco.categoria) ||
      campo.includes('.ncm') ||
      campo.includes('.hsCode')

    if (idxExistente !== undefined && ehClassificacao) {
      const anterior = mesclados[idxExistente]
      mesclados[idxExistente] = {
        ...risco,
        id: anterior.id,
        origem: risco.origem ?? 'llm',
      }
      vistosTituloCampo.delete(`${anterior.titulo.toLowerCase()}|${campo}`)
      vistosTituloCampo.add(`${risco.titulo.toLowerCase()}|${campo}`)
      continue
    }

    const chaveTitulo = `${risco.titulo.toLowerCase()}|${campo}`
    if (vistosTituloCampo.has(chaveTitulo)) continue
    vistosTituloCampo.add(chaveTitulo)
    seq += 1
    mesclados.push({ ...risco, id: risco.id || `risco-llm-${seq}`, origem: risco.origem ?? 'llm' })
    if (campo) indicePorCampo.set(chaveCampo, mesclados.length - 1)
  }
  return montarResumo(mesclados)
}

function chaveEvidenciaRisco(risco: RiscoAduaneiroLeitura): string {
  const ev = risco.evidencias[0]
  return `${ev?.documento ?? ''}|${ev?.campo ?? ''}`.toLowerCase()
}
