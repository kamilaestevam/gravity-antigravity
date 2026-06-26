/**
 * analise-riscos-leitura-smart-read.ts — SSOT V1 determinístico + contratos API (V2/V3).
 */

import { z } from 'zod'

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
  }),
  llm_ativo: z.boolean(),
  aviso: z.string().nullable().optional(),
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
    return { indice, qty, precoUnit, totalLinha }
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
    'Preencha items[].ncm (8 dígitos) em cada linha da invoice na Conferência de Campos ou reenvie documento com NCM visível.',
  'NCM com formato suspeito':
    'Corrija o NCM para exatamente 8 dígitos numéricos na Conferência de Campos; confira zeros à esquerda.',
  'Divergência no total da linha':
    'Ajuste quantidade, preço unitário ou total da linha na Conferência de Campos para que qty × preço = total.',
  'Soma das linhas diverge do total do documento':
    'Alinhe values.totalDocumentValue com a soma das linhas ou inclua despesas adicionais documentadas na invoice.',
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

export function executarAuditoriaV1AnaliseRiscosLeitura(
  documentosEntrada: DocumentoAnaliseRisco[],
): { resumo: ResumoRiscosAduaneirosLeitura; contexto: ContextoAuditoriaV1Leitura } {
  contadorRisco = 0
  const riscos: RiscoAduaneiroLeitura[] = []
  const regras: RegraAuditoriaV1[] = []
  const documentos = coletarDocumentosEntrada(documentosEntrada)
  const ncmsGlobal = new Set<string>()

  for (const doc of documentos) {
    for (const ncm of extrairNcmsDados(doc.dados)) {
      const norm = normalizarNcm(ncm)
      if (norm) ncmsGlobal.add(norm)
    }

    const incoterm = valorCampo(doc.mapa, ['document.incoterm', 'incoterm'])
    const incotermOk = !!incoterm
    if (tiposIncluem(doc.tipo_documento, ['INVOICE', 'PACKING_LIST'])) {
      regras.push({
        id: `A1-incoterm-${doc.rotulo}`,
        passou: incotermOk,
        detalhe: incotermOk ? `Incoterm: ${incoterm}` : 'Incoterm ausente',
      })
      if (!incotermOk) {
        riscos.push(
          criarRisco({
            severidade: 'critico',
            categoria: 'incoterm',
            titulo: 'Incoterm ausente',
            motivo: 'Documento comercial sem Incoterm dificulta a classificação fiscal da operação.',
            analise:
              'Invoice e Packing List costumam exigir Incoterm para amarrar responsabilidades, frete e seguro na importação.',
            evidencias: [{ documento: doc.rotulo, campo: 'document.incoterm' }],
          }),
        )
      }
    }

    const cnpj =
      valorCampo(doc.mapa, ['importer.cnpj', 'importer.taxId']) ??
      valorCampo(doc.mapa, ['exporter.taxId', 'exporter.cnpj'])
    const exigeCnpj = tiposIncluem(doc.tipo_documento, ['INVOICE', 'BL', 'AWB', 'PACKING_LIST'])
    const cnpjPresente = !!cnpj
    if (exigeCnpj) {
      regras.push({
        id: `A2-cnpj-presente-${doc.rotulo}`,
        passou: cnpjPresente,
        detalhe: cnpjPresente ? `Tax ID: ${cnpj}` : 'CNPJ/Tax ID ausente',
      })
    }
    if (exigeCnpj && !cnpj) {
      riscos.push(
        criarRisco({
          severidade: 'critico',
          categoria: 'cnpj',
          titulo: 'CNPJ / Tax ID ausente',
          motivo: 'Participante da operação sem identificação fiscal legível no documento.',
          analise:
            'Importador ou exportador sem CNPJ/Tax ID impede validação cadastral e pode gerar retenção na conferência aduaneira.',
          evidencias: [{ documento: doc.rotulo, campo: 'importer.cnpj' }],
        }),
      )
    } else if (cnpj && /^\d/.test(cnpj.replace(/\s/g, ''))) {
      const cnpjValido = validarCnpjBrasil(cnpj)
      regras.push({
        id: `A2-cnpj-digitos-${doc.rotulo}`,
        passou: cnpjValido,
        detalhe: cnpjValido ? 'CNPJ com dígitos válidos' : 'CNPJ com dígitos inválidos',
      })
      if (!cnpjValido) {
        riscos.push(
          criarRisco({
            severidade: 'atencao',
            categoria: 'cnpj',
            titulo: 'CNPJ com formato inválido',
            motivo: 'O número informado não passa na validação de dígitos verificadores.',
            analise: 'Revise se houve erro de OCR ou digitação no CNPJ do participante.',
            evidencias: [{ documento: doc.rotulo, campo: 'importer.cnpj', valor: cnpj }],
          }),
        )
      }
    }

    const ncms = extrairNcmsDados(doc.dados)
    const exigeNcm = tiposIncluem(doc.tipo_documento, ['INVOICE', 'PACKING_LIST', 'BL'])
    if (exigeNcm) {
      regras.push({
        id: `A4-ncm-presente-${doc.rotulo}`,
        passou: ncms.length > 0,
        detalhe: ncms.length > 0 ? `NCMs: ${ncms.join(', ')}` : 'Nenhum NCM encontrado',
      })
    }
    if (exigeNcm && ncms.length === 0) {
      riscos.push(
        criarRisco({
          severidade: 'critico',
          categoria: 'ncm',
          titulo: 'NCM não identificado',
          motivo: 'Nenhum código NCM/HS foi encontrado nos itens ou mercadorias.',
          analise:
            'Sem NCM a operação fica exposta a divergência na classificação fiscal e exigência de retificação.',
          evidencias: [{ documento: doc.rotulo, campo: 'items[].ncm' }],
        }),
      )
    }

    for (const ncm of ncms) {
      const formatoOk = ncmFormatoValido(ncm)
      regras.push({
        id: `A5-ncm-formato-${doc.rotulo}-${ncm}`,
        passou: formatoOk,
        detalhe: formatoOk ? `NCM ${ncm} com 8 dígitos` : `NCM ${ncm} fora do padrão`,
      })
      if (!formatoOk) {
        riscos.push(
          criarRisco({
            severidade: 'atencao',
            categoria: 'ncm',
            titulo: 'NCM com formato suspeito',
            motivo: `O código "${ncm}" não está no padrão de 8 dígitos.`,
            analise: 'Confirme se o NCM foi lido corretamente ou se há zeros/casas decimais a mais.',
            evidencias: [{ documento: doc.rotulo, campo: 'ncm', valor: ncm }],
          }),
        )
      }
    }

    if (tiposIncluem(doc.tipo_documento, ['INVOICE'])) {
      const itens = extrairItensComerciais(doc.dados)
      let somaLinhas = 0
      let linhasComTotal = 0
      for (const item of itens) {
        if (item.qty !== null && item.precoUnit !== null && item.totalLinha !== null) {
          const esperado = item.qty * item.precoUnit
          const linhaOk = valoresProximos(esperado, item.totalLinha, Math.max(0.1, esperado * 0.01))
          regras.push({
            id: `C1-linha-${doc.rotulo}-${item.indice}`,
            passou: linhaOk,
            detalhe: linhaOk
              ? `Linha ${item.indice + 1}: ${item.qty} × ${item.precoUnit} = ${item.totalLinha}`
              : `Linha ${item.indice + 1}: esperado ${esperado}, lido ${item.totalLinha}`,
          })
          if (!linhaOk) {
            riscos.push(
              criarRisco({
                severidade: 'atencao',
                categoria: 'matematico',
                titulo: 'Divergência no total da linha',
                motivo: `Qty × preço unitário não confere com o total da linha ${item.indice + 1}.`,
                analise: 'Revise quantidade, preço unitário e total — pode ser erro de OCR ou arredondamento comercial.',
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
        if (item.totalLinha !== null) {
          somaLinhas += item.totalLinha
          linhasComTotal += 1
        }
      }

      const totalDoc = parseNumeroComercial(
        valorCampo(doc.mapa, ['values.totalDocumentValue', 'totalDocumentValue', 'totalValue']),
      )
      if (totalDoc !== null && linhasComTotal > 0) {
        const somaOk = valoresProximos(somaLinhas, totalDoc, Math.max(0.1, totalDoc * 0.01))
        regras.push({
          id: `C2-soma-${doc.rotulo}`,
          passou: somaOk,
          detalhe: somaOk
            ? `Soma linhas ${somaLinhas} = total ${totalDoc}`
            : `Soma linhas ${somaLinhas} ≠ total documento ${totalDoc}`,
        })
        if (!somaOk) {
          riscos.push(
            criarRisco({
              severidade: 'atencao',
              categoria: 'matematico',
              titulo: 'Soma das linhas diverge do total do documento',
              motivo: 'A soma dos totais de linha não confere com o valor total da invoice.',
              analise: 'Verifique descontos, outras despesas ou erro de extração nos totais.',
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
    }
  }

  const incoterms = documentos
    .map((doc) => ({
      rotulo: doc.rotulo,
      valor: valorCampo(doc.mapa, ['document.incoterm', 'incoterm']),
    }))
    .filter((item): item is { rotulo: string; valor: string } => !!item.valor)

  const incotermsUnicos = new Set(incoterms.map((i) => i.valor.trim().toUpperCase()))
  const incotermCruzadoOk = incotermsUnicos.size <= 1
  regras.push({
    id: 'I1-incoterm-cruzado',
    passou: incotermCruzadoOk,
    detalhe: incotermCruzadoOk
      ? 'Incoterms consistentes entre documentos'
      : `Incoterms distintos: ${[...incotermsUnicos].join(', ')}`,
  })
  if (!incotermCruzadoOk) {
    riscos.push(
      criarRisco({
        severidade: 'atencao',
        categoria: 'cruzado',
        titulo: 'Incoterm divergente entre documentos',
        motivo: 'Mais de um Incoterm foi lido na mesma leitura.',
        analise:
          'Divergência de Incoterm entre Invoice, PL ou outros docs pode indicar inconsistência comercial ou erro de extração.',
        evidencias: incoterms.map((i) => ({ documento: i.rotulo, campo: 'document.incoterm', valor: i.valor })),
      }),
    )
  }

  const ncmsPorDoc = documentos.map((doc) => ({
    rotulo: doc.rotulo,
    tipo: doc.tipo_documento,
    ncms: [...new Set(extrairNcmsDados(doc.dados).map(normalizarNcm))].filter(Boolean),
  }))

  const invoice = ncmsPorDoc.find((d) => d.tipo.includes('INVOICE'))
  const packing = ncmsPorDoc.find((d) => d.tipo.includes('PACKING'))
  let ncmCruzadoOk = true
  if (invoice && packing && invoice.ncms.length > 0 && packing.ncms.length > 0) {
    const setInvoice = new Set(invoice.ncms)
    const setPacking = new Set(packing.ncms)
    const faltandoPl = [...setInvoice].filter((ncm) => !setPacking.has(ncm))
    const extrasPl = [...setPacking].filter((ncm) => !setInvoice.has(ncm))
    ncmCruzadoOk = faltandoPl.length === 0 && extrasPl.length === 0
    regras.push({
      id: 'I2-ncm-cruzado',
      passou: ncmCruzadoOk,
      detalhe: ncmCruzadoOk
        ? 'NCMs Invoice = PL'
        : `Invoice [${invoice.ncms.join(', ')}] vs PL [${packing.ncms.join(', ')}]`,
    })
    if (!ncmCruzadoOk) {
      riscos.push(
        criarRisco({
          severidade: 'critico',
          categoria: 'ncm',
          titulo: 'Possível divergência de NCM entre Invoice e Packing List',
          motivo: 'Os conjuntos de NCM lidos nos dois documentos não coincidem.',
          analise:
            'NCM diferente entre documentos comerciais da mesma operação é um dos principais gatilhos de exigência aduaneira.',
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

export function mesclarRiscosAnaliseLeitura(
  v1: RiscoAduaneiroLeitura[],
  extras: RiscoAduaneiroLeitura[],
): ResumoRiscosAduaneirosLeitura {
  const vistos = new Set(v1.map((r) => `${r.titulo.toLowerCase()}|${r.evidencias[0]?.campo ?? ''}`))
  const mesclados = [...v1]
  let seq = mesclados.length
  for (const risco of extras) {
    const chave = `${risco.titulo.toLowerCase()}|${risco.evidencias[0]?.campo ?? ''}`
    if (vistos.has(chave)) continue
    vistos.add(chave)
    seq += 1
    mesclados.push({ ...risco, id: risco.id || `risco-llm-${seq}`, origem: risco.origem ?? 'llm' })
  }
  return montarResumo(mesclados)
}
