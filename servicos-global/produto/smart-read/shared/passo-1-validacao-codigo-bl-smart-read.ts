/**
 * passo-1-validacao-codigo-bl-smart-read.ts — motor Código + Cross-Doc da matriz BL (BL1–BL9).
 *
 * Regras determinísticas do Bill of Lading e cruzamentos com invoice/packing list da mesma leitura.
 * Regras semânticas (motor IA/RAG) ficam no Analista LLM (prompt-analista-bl).
 */

import {
  regraMatrizBlPorId,
  type RegraMatrizBl,
} from './matriz-validacao-bl-smart-read.js'
import type {
  ContextoAuditoriaV1Leitura,
  DocumentoAnaliseRisco,
  RegraAuditoriaV1,
  ResumoRiscosAduaneirosLeitura,
  RiscoAduaneiroLeitura,
} from './analise-riscos-leitura-smart-read.js'
import {
  achatarCamposDadosLeitura,
  validarCnpjBrasil,
  valorTextoComparacaoCampo,
} from './analise-riscos-leitura-smart-read.js'

type DocumentoLeitura = {
  rotulo: string
  tipo: string
  mapa: Map<string, unknown>
  dados: Record<string, unknown>
}

/** Incoterms exclusivos do modal aquaviário — os únicos plenamente típicos do BL (BL3-04). */
const INCOTERMS_EXCLUSIVOS_AQUAVIARIO = ['FAS', 'FOB', 'CFR', 'CIF'] as const

const TOLERANCIA_PESO_AMARELO = 0.02 // 2% — BL5-03
const TOLERANCIA_PESO_VERMELHO = 0.05 // 5% — BL5-03 (gate IN 680/06 art. 29, IV)

/**
 * BL5-04 — teto de peso bruto por contêiner (kg) por comprimento do type code ISO 6346.
 * Valores conservadores de max gross (ISO 668): 20' ≈ 30.480 kg, 40'/45' ≈ 34.000 kg.
 */
const MAX_GROSS_CONTEINER_20_KG = 30_480
const MAX_GROSS_CONTEINER_40_KG = 34_000

let contadorRiscoBl = 0

function criarRiscoBl(parcial: {
  regra: RegraMatrizBl
  severidade: RiscoAduaneiroLeitura['severidade']
  categoria: RiscoAduaneiroLeitura['categoria']
  titulo: string
  motivo: string
  analise: string
  evidencias: RiscoAduaneiroLeitura['evidencias']
  status?: 'vermelho' | 'amarelo'
}): RiscoAduaneiroLeitura {
  contadorRiscoBl += 1
  return {
    id: `risco-bl-${contadorRiscoBl}`,
    origem: 'v1',
    severidade: parcial.severidade,
    categoria: parcial.categoria,
    titulo: parcial.titulo,
    motivo: parcial.motivo,
    analise: parcial.analise,
    evidencias: parcial.evidencias,
    secao_matriz: parcial.regra.secao,
    id_regra_matriz: parcial.regra.id,
    motor_validacao: parcial.regra.motor,
    status_matriz:
      parcial.status ?? (parcial.severidade === 'critico' ? 'vermelho' : 'amarelo'),
  }
}

function rotuloDocumento(nomeArquivo: string, tipo: string, indice: number): string {
  return `${nomeArquivo} · ${tipo.trim() || `Documento ${indice + 1}`}`
}

function coletarDocumentos(documentos: DocumentoAnaliseRisco[]): DocumentoLeitura[] {
  return documentos.map((doc) => ({
    rotulo: rotuloDocumento(doc.nome_arquivo, doc.tipo_documento, doc.indice),
    tipo: doc.tipo_documento.toUpperCase(),
    mapa: achatarCamposDadosLeitura(doc.dados),
    dados: doc.dados,
  }))
}

function ehTipoBl(tipo: string): boolean {
  if (tipo.includes('AWB') || tipo.includes('AIR WAYBILL')) return false
  return (
    tipo.includes('BILL OF LADING') ||
    tipo.includes('SEA WAYBILL') ||
    /(^|[^A-Z])(BL|MBL|HBL|B\/L)([^A-Z]|$)/.test(tipo)
  )
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

function coletarValoresLista(mapa: Map<string, unknown>, base: string, sufixo: string): string[] {
  const valores: string[] = []
  for (const [chave, valor] of mapa) {
    if (chave.startsWith(base) && chave.endsWith(sufixo)) {
      const texto = valorTextoComparacaoCampo(valor)
      if (texto) valores.push(texto)
    }
  }
  return valores
}

/** Frete e sobretaxas discriminados no BL (BL6-02 — motor código). */
function extrairComponentesFreteBl(mapa: Map<string, unknown>): { temValor: boolean; resumo: string } {
  const totais = [
    valorCampo(mapa, ['freight.total_value', 'freight.totalValue', 'freight.basic_value']),
    ...coletarValoresLista(mapa, 'freight.additional_charges', 'Valor'),
    ...coletarValoresLista(mapa, 'freight.additional_charges', 'valor'),
  ]
  const numeros = totais
    .map((texto) => parseNumero(texto))
    .filter((n): n is number => n !== null && n > 0)
  if (numeros.length > 0) {
    const maior = Math.max(...numeros)
    return { temValor: true, resumo: formatarNumero(maior) }
  }
  for (const [chave, valor] of mapa) {
    if (!/freight/i.test(chave)) continue
    if (!/amount|value|valor|charge|collect|prepaid/i.test(chave)) continue
    const n = parseNumero(valorTextoComparacaoCampo(valor))
    if (n !== null && n > 0) {
      return { temValor: true, resumo: formatarNumero(n) }
    }
  }
  return { temValor: false, resumo: '' }
}

function regraPassou(regras: RegraAuditoriaV1[], regraId: string, rotulo: string): boolean {
  return regras.some((regra) => regra.id === `${regraId}-${rotulo}` && regra.passou)
}

/**
 * Suprime alertas LLM educacionais (BL6-02/04/05) quando prepaid/collect está coerente
 * com o Incoterm e os valores de frete estão discriminados — cenário válido, não risco.
 */
export function filtrarRiscosLlmBlFreteCoerente(
  riscos: RiscoAduaneiroLeitura[],
  regras: RegraAuditoriaV1[],
): RiscoAduaneiroLeitura[] {
  return riscos.filter((risco) => {
    const idRegra = risco.id_regra_matriz ?? ''
    if (!['BL6-02', 'BL6-04', 'BL6-05'].includes(idRegra)) return true
    if (risco.severidade === 'critico') return true
    const rotulo = risco.evidencias[0]?.documento
    if (!rotulo) return true
    if (!regraPassou(regras, 'BL6-01', rotulo)) return true
    if (idRegra === 'BL6-02' && !regraPassou(regras, 'BL6-02', rotulo)) return true
    return risco.severidade !== 'atencao'
  })
}

function parseNumero(valor: string | null | undefined): number | null {
  if (!valor) return null
  const limpo = valor.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')
  const n = Number.parseFloat(limpo)
  return Number.isFinite(n) ? n : null
}

function parseData(valor: string | null): Date | null {
  if (!valor?.trim()) return null
  const iso = valor.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  const br = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (br) return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]))
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? null : d
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Sobreposição de tokens significativos (≥3 caracteres) entre dois textos. */
function tokensCoincidem(a: string, b: string): boolean {
  const tokensA = new Set(normalizarTexto(a).split(' ').filter((t) => t.length >= 3))
  const tokensB = new Set(normalizarTexto(b).split(' ').filter((t) => t.length >= 3))
  if (tokensA.size === 0 || tokensB.size === 0) return true
  for (const t of tokensA) if (tokensB.has(t)) return true
  return false
}

function valoresProximosRelativo(a: number, b: number, tolerancia: number): boolean {
  const base = Math.max(Math.abs(a), Math.abs(b))
  if (base === 0) return true
  return Math.abs(a - b) / base <= tolerancia
}

function formatarNumero(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

/**
 * BL4-03 — Número de contêiner no padrão ISO 6346: 4 letras (dono + categoria U)
 * + 6 dígitos do serial + 1 dígito verificador calculado por pesos 2^posição mód. 11.
 */
const VALOR_LETRA_ISO_6346: Record<string, number> = {
  // Múltiplos de 11 (11, 22, 33) são pulados na numeração
  A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19, J: 20,
  K: 21, L: 23, M: 24, N: 25, O: 26, P: 27, Q: 28, R: 29, S: 30, T: 31,
  U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38,
}

export function validarNumeroConteinerIso6346(numero: string): boolean {
  const limpo = numero.replace(/[\s-]/g, '').toUpperCase()
  if (!/^[A-Z]{4}\d{7}$/.test(limpo)) return false

  let soma = 0
  for (let i = 0; i < 10; i += 1) {
    const ch = limpo[i]
    const valor = i < 4 ? VALOR_LETRA_ISO_6346[ch] : Number(ch)
    soma += valor * 2 ** i
  }
  const dv = soma % 11 === 10 ? 0 : soma % 11
  return dv === Number(limpo[10])
}

/**
 * BL2-05 — CNPJ alfanumérico (IN RFB 2.229/2024): 12 posições alfanuméricas
 * (A–Z/0–9) + 2 DV numéricos, Módulo 11 com conversão ASCII−48.
 */
export function validarCnpjAlfanumericoBl(cnpj: string): boolean {
  const limpo = cnpj.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  if (!/^[A-Z0-9]{12}\d{2}$/.test(limpo)) return false

  const valores = limpo.slice(0, 12).split('').map((ch) => ch.charCodeAt(0) - 48)
  const calcularDv = (nums: number[]): number => {
    let peso = 2
    let soma = 0
    for (let i = nums.length - 1; i >= 0; i -= 1) {
      soma += nums[i] * peso
      peso = peso === 9 ? 2 : peso + 1
    }
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }
  const dv1 = calcularDv(valores)
  if (dv1 !== Number(limpo[12])) return false
  const dv2 = calcularDv([...valores, dv1])
  return dv2 === Number(limpo[13])
}

function extrairNumeroBlPrincipal(doc: DocumentoLeitura): {
  numero: string | null
  master: string | null
} {
  const numero = valorCampo(doc.mapa, [
    'document.billOfLadingNumber',
    'billOfLadingNumber',
    'document.documentNumber',
    'document.number',
  ])
  const master = valorCampo(doc.mapa, [
    'document.masterBillOfLadingNumber',
    'masterBillOfLadingNumber',
  ])
  return { numero, master }
}

type ConteinerBl = {
  numero: string | null
  lacre: string | null
  tipo: string | null
  peso_bruto: number | null
}

function extrairConteineres(doc: DocumentoLeitura): ConteinerBl[] {
  const conteineres: ConteinerBl[] = []
  const dados = doc.dados as { containers?: unknown }
  if (Array.isArray(dados.containers)) {
    for (const item of dados.containers) {
      if (!item || typeof item !== 'object') continue
      const c = item as Record<string, unknown>
      conteineres.push({
        numero: valorTextoComparacaoCampo(c.container_number ?? c.containerNumber),
        lacre: valorTextoComparacaoCampo(c.container_seal ?? c.seal),
        tipo: valorTextoComparacaoCampo(c.container_type ?? c.type),
        peso_bruto: parseNumero(
          valorTextoComparacaoCampo(c.container_gross_weight ?? c.grossWeight),
        ),
      })
    }
  }
  if (conteineres.length === 0) {
    const numeros = coletarValoresLista(doc.mapa, 'containerNumbers', '')
    for (const numero of numeros) {
      conteineres.push({ numero, lacre: null, tipo: null, peso_bruto: null })
    }
  }
  return conteineres
}

/** Passo 1 BL — motor Código + Cross-Doc: regras determinísticas da matriz BL1–BL9. */
export function executarPasso1ValidacaoCodigoBl(
  documentosEntrada: DocumentoAnaliseRisco[],
): { resumo: ResumoRiscosAduaneirosLeitura; contexto: ContextoAuditoriaV1Leitura } {
  contadorRiscoBl = 0
  const riscos: RiscoAduaneiroLeitura[] = []
  const regras: RegraAuditoriaV1[] = []

  const todos = coletarDocumentos(documentosEntrada)
  const bls = todos.filter((d) => ehTipoBl(d.tipo))
  const invoices = todos.filter((d) => d.tipo.includes('INVOICE'))
  const packings = todos.filter((d) => d.tipo.includes('PACKING'))

  function registrar(regraId: string, rotulo: string, passou: boolean, detalhe: string) {
    regras.push({ id: `${regraId}-${rotulo}`, passou, detalhe })
  }

  function falhar(params: {
    regraId: string
    doc: DocumentoLeitura
    titulo: string
    motivo: string
    analise: string
    campo: string
    valor?: string | null
    status?: 'vermelho' | 'amarelo'
    evidenciasExtras?: RiscoAduaneiroLeitura['evidencias']
  }) {
    const regra = regraMatrizBlPorId(params.regraId)
    if (!regra) return
    const severidade =
      (params.status ?? (regra.severidade === 'bloq' ? 'vermelho' : 'amarelo')) === 'vermelho'
        ? 'critico'
        : 'atencao'
    riscos.push(
      criarRiscoBl({
        regra,
        severidade,
        categoria: regra.secao === 'pesos_medidas' ? 'matematico' : 'documental',
        titulo: params.titulo,
        motivo: params.motivo,
        analise: params.analise,
        evidencias: [
          { documento: params.doc.rotulo, campo: params.campo, valor: params.valor ?? undefined },
          ...(params.evidenciasExtras ?? []),
        ],
        status: params.status ?? (regra.severidade === 'bloq' ? 'vermelho' : 'amarelo'),
      }),
    )
  }

  // ── BL1-05 — BLs conflitantes para o mesmo embarque (cross-doc entre BLs) ────
  if (bls.length >= 2) {
    const numeros = bls
      .map((doc) => ({ doc, numero: extrairNumeroBlPrincipal(doc).numero }))
      .filter((par): par is { doc: DocumentoLeitura; numero: string } => !!par.numero)
    const numerosDistintos = new Set(numeros.map((par) => par.numero.replace(/[\s-]/g, '')))
    if (numerosDistintos.size > 1) {
      const primeiro = numeros[0]
      registrar(
        'BL1-05',
        primeiro.doc.rotulo,
        false,
        `BLs distintos no mesmo processo: ${[...numerosDistintos].join(' × ')}`,
      )
      falhar({
        regraId: 'BL1-05',
        doc: primeiro.doc,
        titulo: 'Conhecimentos marítimos conflitantes no processo',
        motivo: `Foram encontrados ${numerosDistintos.size} números de BL distintos para o mesmo embarque: ${[...numerosDistintos].join(', ')}.`,
        analise:
          'Reemissão de BL sem cancelamento do anterior gera risco de instrução com documento superado (RA art. 725; IN 680/06 art. 20 — carta de correção limitada a 30 dias / antes do registro).',
        campo: 'document.billOfLadingNumber',
        valor: [...numerosDistintos].join(', '),
        evidenciasExtras: numeros.slice(1).map((par) => ({
          documento: par.doc.rotulo,
          campo: 'document.billOfLadingNumber',
          valor: par.numero,
        })),
      })
    } else if (numeros.length > 0) {
      registrar(
        'BL1-05',
        numeros[0].doc.rotulo,
        true,
        'BL único no processo — sem conflito de versão',
      )
    }
  } else if (bls.length === 1) {
    registrar('BL1-05', bls[0].rotulo, true, 'BL único no processo — sem conflito de versão')
  }

  for (const bl of bls) {
    const r = bl.rotulo
    const { numero, master } = extrairNumeroBlPrincipal(bl)
    const ehHouse = !!master && !!numero && master.replace(/\s/g, '') !== numero.replace(/\s/g, '')

    // ── BL1-01 — Número do BL presente ────────────────────────────────────────
    if (numero) {
      registrar('BL1-01', r, true, `BL ${numero} identificado${master ? ` · master ${master}` : ''}`)
    } else {
      registrar('BL1-01', r, false, 'Número do BL não identificado na extração')
      falhar({
        regraId: 'BL1-01',
        doc: bl,
        titulo: 'Número do BL ausente',
        motivo: 'A extração não identificou o número do conhecimento marítimo.',
        analise:
          'O número do BL é a chave de vinculação com o CE-Mercante e conteúdo obrigatório do conhecimento (RA art. 553, I).',
        campo: 'document.billOfLadingNumber',
      })
    }

    // ── BL1-04 — Datas: emissão e shipped on board ────────────────────────────
    const dataEmissaoTexto = valorCampo(bl.mapa, ['document.date', 'document.documentDate'])
    const dataOnBoardTexto = valorCampo(bl.mapa, ['document.shippedOnBoardDate', 'shippedOnBoardDate'])
    const dataEmissao = parseData(dataEmissaoTexto)
    const dataOnBoard = parseData(dataOnBoardTexto)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const invoicePrincipal = invoices[0] ?? null
    const dataInvoice = invoicePrincipal
      ? parseData(
          valorCampo(invoicePrincipal.mapa, ['document.issueDate', 'document.date', 'issueDate']),
        )
      : null
    let dataOk = !!dataEmissao || !!dataOnBoard
    let detalheData = dataEmissaoTexto
      ? `Emissão ${dataEmissaoTexto}${dataOnBoardTexto ? ` · on board ${dataOnBoardTexto}` : ''}`
      : 'Data de emissão do BL ausente'
    if (dataEmissao && dataEmissao > hoje) {
      dataOk = false
      detalheData = `Data de emissão futura: ${dataEmissaoTexto}`
    }
    if (dataOnBoard && dataOnBoard > hoje) {
      dataOk = false
      detalheData = `Data de embarque (on board) futura: ${dataOnBoardTexto}`
    }
    if (dataEmissao && dataInvoice && dataEmissao < dataInvoice) {
      dataOk = false
      detalheData = `Emissão do BL (${dataEmissaoTexto}) anterior à da invoice`
    }
    if (dataEmissao && dataOnBoard && dataOnBoard < dataEmissao) {
      // On board antes da emissão é possível ("shipped on board" chancelado depois),
      // mas emissão muito posterior ao embarque merece conferência manual.
      detalheData += ' · on board anterior à emissão (conferir chancela)'
    }
    registrar('BL1-04', r, dataOk, detalheData)
    if (!dataOk) {
      falhar({
        regraId: 'BL1-04',
        doc: bl,
        titulo: 'Datas do BL inconsistentes',
        motivo: detalheData,
        analise:
          'Data ausente, futura ou anterior à invoice compromete a ordem cronológica do conjunto instrutivo (UCP 600 art. 20 — on board date; IN 680/06).',
        campo: 'document.shippedOnBoardDate',
        valor: dataOnBoardTexto ?? dataEmissaoTexto,
      })
    }

    // ── BL2-01 — Shipper vs exportador da invoice/PL ──────────────────────────
    const shipper = valorCampo(bl.mapa, ['exporter.name', 'shipper.name'])
    const exportadorInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['exporter.name', 'shipper.name'])
      : null
    if (shipper && exportadorInvoice) {
      const coincide = tokensCoincidem(shipper, exportadorInvoice)
      registrar(
        'BL2-01',
        r,
        coincide,
        coincide
          ? `Shipper «${shipper}» coerente com o exportador da invoice`
          : `Shipper «${shipper}» difere do exportador da invoice «${exportadorInvoice}»`,
      )
      if (!coincide) {
        falhar({
          regraId: 'BL2-01',
          doc: bl,
          titulo: 'Shipper do BL diverge do exportador da invoice',
          motivo: `Shipper «${shipper}» não coincide com o exportador da invoice «${exportadorInvoice}».`,
          analise:
            'Divergência de partes entre conhecimento e fatura pode ser triangulação legítima — sinalizar para conferência, não reprovar de pronto (RA art. 553; IN 680/06 art. 29, II).',
          campo: 'exporter.name',
          valor: shipper,
          status: 'amarelo',
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'exporter.name', valor: exportadorInvoice }]
            : [],
        })
      }
    } else if (shipper) {
      registrar('BL2-01', r, true, `Shipper «${shipper}» presente — sem invoice para cruzar`)
    } else {
      registrar('BL2-01', r, false, 'Shipper não identificado no BL')
      falhar({
        regraId: 'BL2-01',
        doc: bl,
        titulo: 'Shipper ausente no BL',
        motivo: 'A extração não identificou o shipper (embarcador) do conhecimento marítimo.',
        analise: 'Nome e endereço do shipper são conteúdo obrigatório do BL (RA art. 553).',
        campo: 'exporter.name',
      })
    }

    // ── BL2-02 — Consignee identificado ou "to order" com endosso ─────────────
    const consignee = valorCampo(bl.mapa, ['importer.name', 'consignee.name'])
    const consigneeNorm = consignee ? normalizarTexto(consignee) : ''
    const ehAOrdem = /\bTO ORDER\b|\bA ORDEM\b|\bTO THE ORDER\b/.test(consigneeNorm)
    const importadorInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['importer.name', 'consignee.name'])
      : null
    const cnpjBl = valorCampo(bl.mapa, ['importer.cnpj', 'consignee.cnpj', 'cnpj'])
    if (ehAOrdem) {
      // BL admite "to order" — a cadeia de endosso é semântica (BL2-03, motor IA);
      // aqui apenas registra que o gate exige endosso completo.
      registrar(
        'BL2-02',
        r,
        true,
        `Consignee "à ordem" («${consignee}») — cadeia de endosso conferida pela análise IA (BL2-03)`,
      )
    } else if (consignee && importadorInvoice) {
      const coincide = tokensCoincidem(consignee, importadorInvoice)
      registrar(
        'BL2-02',
        r,
        coincide,
        coincide
          ? `Consignee «${consignee}» coerente com o importador da invoice`
          : `Consignee «${consignee}» difere do importador da invoice «${importadorInvoice}»`,
      )
      if (!coincide) {
        falhar({
          regraId: 'BL2-02',
          doc: bl,
          titulo: 'Consignee do BL diverge do importador da invoice',
          motivo: `Consignee «${consignee}» não coincide com o importador «${importadorInvoice}».`,
          analise:
            'O consignatário deve identificar o importador (nome + CNPJ) ou ser "to order" com endosso completo — divergência impede a vinculação da carga (IN 680/06 art. 29, II; RA arts. 554–556).',
          campo: 'importer.name',
          valor: consignee,
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'importer.name', valor: importadorInvoice }]
            : [],
        })
      }
    } else if (consignee) {
      registrar('BL2-02', r, true, `Consignee «${consignee}» presente`)
    } else {
      registrar('BL2-02', r, false, 'Consignee não identificado no BL')
      falhar({
        regraId: 'BL2-02',
        doc: bl,
        titulo: 'Consignee ausente no BL',
        motivo: 'A extração não identificou o consignatário do conhecimento marítimo.',
        analise:
          'O consignee deve identificar o importador ou ser "to order" com cadeia de endosso completa (IN 680/06 art. 29, II; RA arts. 554–556).',
        campo: 'importer.name',
      })
    }

    // ── BL2-04 — Notify party (info) ──────────────────────────────────────────
    const notify = valorCampo(bl.mapa, ['notify_party.name', 'notifyParty.name', 'notify.name'])
    registrar(
      'BL2-04',
      r,
      true,
      notify ? `Notify party: «${notify}»` : 'N/A — notify party não citado no BL',
    )

    // ── BL2-05 — CNPJ no BL (máscara numérica ou alfanumérica) ────────────────
    if (cnpjBl) {
      const cnpjLimpo = cnpjBl.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
      const ehAlfanumerico = /[A-Z]/.test(cnpjLimpo)
      const valido = ehAlfanumerico
        ? validarCnpjAlfanumericoBl(cnpjLimpo)
        : validarCnpjBrasil(cnpjLimpo)
      registrar(
        'BL2-05',
        r,
        valido,
        valido
          ? `CNPJ ${cnpjBl} válido (${ehAlfanumerico ? 'alfanumérico IN 2.229/2024' : 'numérico'})`
          : `CNPJ ${cnpjBl} com dígito verificador inválido`,
      )
      if (!valido) {
        falhar({
          regraId: 'BL2-05',
          doc: bl,
          titulo: 'CNPJ do consignatário inválido no BL',
          motivo: `O CNPJ «${cnpjBl}» impresso no BL não passa na validação de dígito verificador.`,
          analise:
            'CNPJ inválido indica erro de OCR ou dado incorreto — red flag de fraude/erro de consignação (IN RFB 2119/2022; IN RFB 2.229/2024; IN 800/2007 Anexos III–IV).',
          campo: 'importer.cnpj',
          valor: cnpjBl,
        })
      }
      if (valido && ehAlfanumerico && dataEmissao && dataEmissao < new Date(2026, 6, 31)) {
        registrar(
          'BL2-05',
          `${r}-alfa`,
          false,
          `CNPJ alfanumérico em documento datado antes de 31/07/2026 (${dataEmissaoTexto}) — red flag OCR/fraude`,
        )
        falhar({
          regraId: 'BL2-05',
          doc: bl,
          titulo: 'CNPJ alfanumérico antes da vigência da IN 2.229/2024',
          motivo: `O BL traz CNPJ alfanumérico «${cnpjBl}» com data de emissão ${dataEmissaoTexto}, anterior à vigência de 31/07/2026.`,
          analise:
            'CNPJ alfanumérico só existe a partir de 31/07/2026 (IN RFB 2.229/2024) — documento anterior com CNPJ alfa é red flag de OCR ou adulteração.',
          campo: 'importer.cnpj',
          valor: cnpjBl,
        })
      }
    } else {
      registrar('BL2-05', r, true, 'N/A — CNPJ não impresso no BL (regra condicional)')
    }

    // ── BL2-05b — Estabelecimento consignatário = declarante (gate) ───────────
    const cnpjInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['importer.cnpj', 'importer.taxId', 'consignee.cnpj'])
      : null
    if (cnpjBl && cnpjInvoice) {
      const limpoBl = cnpjBl.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
      const limpoInvoice = cnpjInvoice.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
      const raizIgual = limpoBl.slice(0, 8) === limpoInvoice.slice(0, 8)
      const estabelecimentoIgual =
        limpoBl.length >= 12 && limpoInvoice.length >= 12
          ? limpoBl.slice(0, 12) === limpoInvoice.slice(0, 12)
          : raizIgual
      if (!raizIgual) {
        registrar(
          'BL2-05b',
          r,
          false,
          `CNPJ do BL (${cnpjBl}) com raiz diferente do importador da invoice (${cnpjInvoice})`,
        )
        falhar({
          regraId: 'BL2-05b',
          doc: bl,
          titulo: 'Consignatário do BL diverge do declarante',
          motivo: `A raiz do CNPJ consignado no BL (${cnpjBl}) difere da raiz do importador da invoice (${cnpjInvoice}).`,
          analise:
            'A DUIMP se vincula ao estabelecimento consignatário no CE — CNPJ divergente trava a vinculação NIC↔CE no Mercante (IN 680/06 arts. 15, VI e 44; IN 800/2007).',
          campo: 'importer.cnpj',
          valor: cnpjBl,
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'importer.cnpj', valor: cnpjInvoice }]
            : [],
        })
      } else if (!estabelecimentoIgual) {
        registrar(
          'BL2-05b',
          r,
          false,
          `Mesma raiz, estabelecimento (matriz/filial) divergente: BL ${cnpjBl} × invoice ${cnpjInvoice}`,
        )
        falhar({
          regraId: 'BL2-05b',
          doc: bl,
          titulo: 'Estabelecimento consignatário divergente (matriz × filial)',
          motivo: `BL consignado ao estabelecimento ${cnpjBl} e invoice ao ${cnpjInvoice} — mesma raiz, ordem/filial diferente.`,
          analise:
            'A raiz de 8 posições não identifica o estabelecimento — divergência matriz (/0001) × filial trava a vinculação da carga no Mercante (IN 680/06 arts. 15, VI e 44; Dicionário DI/RFB).',
          campo: 'importer.cnpj',
          valor: cnpjBl,
        })
      } else {
        registrar(
          'BL2-05b',
          r,
          true,
          `Estabelecimento consignatário coincide com o declarante (${cnpjBl})`,
        )
      }
    } else {
      registrar(
        'BL2-05b',
        r,
        true,
        'N/A — CNPJ não disponível no BL e/ou na invoice para conferir o estabelecimento',
      )
    }

    // ── BL3-01 — Navio e viagem ───────────────────────────────────────────────
    const navio = valorCampo(bl.mapa, ['shipment.vesselName', 'shipment.vessel_name', 'vesselName'])
    const viagem = valorCampo(bl.mapa, ['shipment.voyage_number', 'voyageNumber'])
    if (navio || viagem) {
      const vooOk = !!navio && !!viagem
      registrar(
        'BL3-01',
        r,
        vooOk,
        `Navio ${navio ?? '—'} · viagem ${viagem ?? 'não informada'}`,
      )
      if (!vooOk) {
        falhar({
          regraId: 'BL3-01',
          doc: bl,
          titulo: 'Navio ou viagem incompletos no BL',
          motivo: `Navio ${navio ?? 'ausente'} · viagem ${viagem ?? 'ausente'}.`,
          analise:
            'Nome do navio e número da viagem são a base da escala/manifesto no Mercante (IN 800/2007).',
          campo: 'shipment.vesselName',
          valor: navio ?? viagem,
          status: 'amarelo',
        })
      }
    } else {
      registrar('BL3-01', r, false, 'Navio e viagem não identificados no BL')
      falhar({
        regraId: 'BL3-01',
        doc: bl,
        titulo: 'Navio e viagem ausentes no BL',
        motivo: 'A extração não identificou o nome do navio nem o número da viagem.',
        analise:
          'Sem navio e viagem não há como conferir a escala e o manifesto no Mercante (IN 800/2007).',
        campo: 'shipment.vesselName',
      })
    }

    // ── BL3-02 — Portos POL/POD presentes ─────────────────────────────────────
    const portoOrigem = valorCampo(bl.mapa, [
      'shipment.port_of_origin',
      'shipment.ports.loading',
      'shipment.ports.origin',
      'portOfLoading',
    ])
    const portoDestino = valorCampo(bl.mapa, [
      'shipment.port_of_destination',
      'shipment.ports.destination',
      'shipment.ports.discharge',
      'portOfDischarge',
    ])
    if (!portoOrigem && !portoDestino) {
      registrar('BL3-02', r, false, 'Portos de embarque e descarga não identificados')
      falhar({
        regraId: 'BL3-02',
        doc: bl,
        titulo: 'Portos de embarque/descarga ausentes no BL',
        motivo: 'A extração não identificou POL (port of loading) nem POD (port of discharge).',
        analise:
          'POL, POD e destino final são obrigatórios no conhecimento e base da coerência com o Incoterm (RA art. 553).',
        campo: 'shipment.port_of_origin',
      })
    } else {
      registrar(
        'BL3-02',
        r,
        true,
        `Rota ${portoOrigem ?? '—'} → ${portoDestino ?? '—'} — cruzamento com Incoterm na análise IA`,
      )
    }

    // ── BL3-04 — Incoterm compatível com o modal marítimo (gate) ──────────────
    const incotermInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['incoterm', 'incoterms', 'document.incoterm'])
      : null
    const incotermBl = valorCampo(bl.mapa, ['incoterm', 'incoterms', 'document.incoterm'])
    const incotermEfetivo = incotermInvoice ?? incotermBl
    if (incotermEfetivo) {
      const sigla = normalizarTexto(incotermEfetivo).split(' ')[0] ?? ''
      const aquaviario = INCOTERMS_EXCLUSIVOS_AQUAVIARIO.some((termo) => sigla.startsWith(termo))
      if (aquaviario) {
        registrar('BL3-04', r, true, `Incoterm ${sigla} exclusivo aquaviário — coerente com o BL`)
      } else {
        // EXW/FCA/CPT/CIP/DAP/DPU/DDP são válidos no marítimo (multimodal) — a coerência
        // com a natureza da carga (contêiner/break bulk) é semântica e fica com a IA.
        registrar(
          'BL3-04',
          r,
          true,
          `Incoterm ${sigla} multimodal — coerência com a natureza da carga conferida pela análise IA`,
        )
      }
    } else {
      registrar('BL3-04', r, true, 'N/A — Incoterm não identificado na leitura para cruzar com o modal')
    }

    // ── BL3-05 — CE-Mercante / RUC (condicional) ──────────────────────────────
    const ce = valorCampo(bl.mapa, ['ce_mercante', 'ceMercante', 'numeroCe'])
    const ruc = valorCampo(bl.mapa, ['ruc'])
    if (ce || ruc) {
      const ceLimpo = ce?.replace(/\D/g, '') ?? null
      const ceValido = !ceLimpo || ceLimpo.length === 15
      const rucLimpa = ruc?.replace(/\s/g, '').toUpperCase() ?? null
      const rucValida = !rucLimpa || /^[A-Z0-9]{20,35}$/.test(rucLimpa)
      const ok = ceValido && rucValida
      registrar(
        'BL3-05',
        r,
        ok,
        ok
          ? `${ce ? `CE ${ce} com 15 dígitos` : ''}${ce && ruc ? ' · ' : ''}${ruc ? `RUC ${ruc} no padrão` : ''}`
          : `CE/RUC fora do padrão: ${!ceValido ? `CE ${ce}` : ''}${!ceValido && !rucValida ? ' e ' : ''}${!rucValida ? `RUC ${ruc}` : ''}`,
      )
      if (!ok) {
        falhar({
          regraId: 'BL3-05',
          doc: bl,
          titulo: 'CE-Mercante ou RUC fora do padrão',
          motivo: `${!ceValido ? `O CE «${ce}» não tem 15 dígitos. ` : ''}${!rucValida ? `A RUC «${ruc}» não segue o padrão do Portal Único.` : ''}`,
          analise:
            'CE de 15 dígitos e RUC no padrão são as chaves de vinculação da carga (IN 800/2007; Portal Único).',
          campo: 'ce_mercante',
          valor: ce ?? ruc,
        })
      }
    } else {
      registrar('BL3-05', r, true, 'N/A — CE-Mercante/RUC não citados no BL (regra condicional)')
    }

    // ── BL3-07 — Prazos Siscarga (exposição informada) ────────────────────────
    registrar(
      'BL3-07',
      r,
      true,
      'Janela Mercante: manifesto e desconsolidação HBL até 48h antes da atracação (rotas de exceção reduzidas). Atraso/retificação extemporânea = R$ 5.000 por ocorrência + bloqueio automático (IN 800/2007 arts. 22 e 44).',
    )

    // ── BL4-02 — Quantidade e espécie de volumes ──────────────────────────────
    const volumesTexto = valorCampo(bl.mapa, [
      'goods.total_packages',
      'totalPackages',
      'goods.totalPackages',
    ])
    const volumes = parseNumero(volumesTexto)
    const especieVolume = valorCampo(bl.mapa, ['goods.package_unit', 'packageUnit'])
    if (volumes !== null && volumes > 0 && Number.isInteger(volumes)) {
      registrar(
        'BL4-02',
        r,
        true,
        `${formatarNumero(volumes)} volume(s)${especieVolume ? ` (${especieVolume})` : ''} declarados`,
      )
    } else if (volumes !== null) {
      registrar('BL4-02', r, false, `Número de volumes inválido: ${volumesTexto}`)
      falhar({
        regraId: 'BL4-02',
        doc: bl,
        titulo: 'Número de volumes inválido no BL',
        motivo: `O total de volumes traz o valor inválido «${volumesTexto}».`,
        analise:
          'A quantidade de volumes deve ser inteiro maior que zero, com a espécie declarada (IN 800/2007 Anexo IV; RA art. 557).',
        campo: 'goods.total_packages',
        valor: volumesTexto,
      })
    } else {
      registrar('BL4-02', r, false, 'Quantidade de volumes ausente no BL')
      falhar({
        regraId: 'BL4-02',
        doc: bl,
        titulo: 'Quantidade de volumes ausente no BL',
        motivo: 'A extração não identificou o total de volumes do conhecimento.',
        analise:
          'Quantidade e espécie de volumes são conteúdo obrigatório do BL (IN 800/2007 Anexo IV).',
        campo: 'goods.total_packages',
      })
    }

    // ── BL4-03 — Contêineres ISO 6346 ─────────────────────────────────────────
    const conteineres = extrairConteineres(bl)
    const numerosConteiner = conteineres
      .map((c) => c.numero)
      .filter((n): n is string => !!n)
    if (numerosConteiner.length > 0) {
      const invalidos = numerosConteiner.filter((n) => !validarNumeroConteinerIso6346(n))
      const duplicados = numerosConteiner.filter(
        (n, i) => numerosConteiner.indexOf(n) !== i,
      )
      if (invalidos.length === 0 && duplicados.length === 0) {
        registrar(
          'BL4-03',
          r,
          true,
          `${numerosConteiner.length} contêiner(es) no padrão ISO 6346, sem duplicidade`,
        )
      } else {
        const partes = [
          invalidos.length > 0 ? `fora do padrão ISO 6346: ${invalidos.join(', ')}` : null,
          duplicados.length > 0 ? `duplicados: ${[...new Set(duplicados)].join(', ')}` : null,
        ].filter((p): p is string => !!p)
        registrar('BL4-03', r, false, `Contêiner(es) ${partes.join(' · ')}`)
        falhar({
          regraId: 'BL4-03',
          doc: bl,
          titulo: 'Contêiner fora do padrão ISO 6346 ou duplicado',
          motivo: `Contêiner(es) ${partes.join(' e ')}.`,
          analise:
            'O número de contêiner segue o padrão ISO 6346 (4 letras + 6 dígitos + DV) — número inválido indica erro de OCR ou preenchimento e trava o manifesto (ISO 6346; IN 800/2007).',
          campo: 'containers[].container_number',
          valor: [...new Set([...invalidos, ...duplicados])].join(', '),
        })
      }
    } else {
      registrar('BL4-03', r, true, 'N/A — nenhum contêiner citado no BL (carga solta/break bulk)')
    }

    // ── BL4-04 — Lacres por contêiner (condicional — FCL) ─────────────────────
    if (conteineres.length > 0) {
      const semLacre = conteineres.filter((c) => c.numero && !c.lacre)
      if (semLacre.length === 0) {
        registrar('BL4-04', r, true, 'Todos os contêineres com lacre declarado')
      } else {
        registrar(
          'BL4-04',
          r,
          false,
          `${semLacre.length} contêiner(es) sem lacre declarado: ${semLacre.map((c) => c.numero).join(', ')}`,
        )
        falhar({
          regraId: 'BL4-04',
          doc: bl,
          titulo: 'Contêiner sem lacre declarado no BL',
          motivo: `${semLacre.length} contêiner(es) sem número de lacre: ${semLacre.map((c) => c.numero).join(', ')}.`,
          analise:
            'Em carga FCL o lacre por contêiner é exigido e cruzado com o packing list — alteração de lacre gera procedimento fiscal (IN 800/2007).',
          campo: 'containers[].container_seal',
          status: 'amarelo',
        })
      }
    } else {
      registrar('BL4-04', r, true, 'N/A — sem contêineres para conferir lacres (regra condicional)')
    }

    // ── BL4-05 — Contagem em dois níveis vs PL/invoice ────────────────────────
    const plPrincipal = packings[0] ?? null
    const volumesPl = plPrincipal
      ? parseNumero(
          valorCampo(plPrincipal.mapa, [
            'shipmentDetails.totalPackages',
            'packageSummary.totalPackages',
            'totalPackages',
            'totalVolumes',
          ]),
        )
      : null
    if (volumes !== null && volumesPl !== null) {
      const iguais = volumes === volumesPl
      registrar(
        'BL4-05',
        r,
        iguais,
        iguais
          ? `Volumes do BL (${formatarNumero(volumes)}) conferem com o packing list`
          : `Volumes divergentes: BL ${formatarNumero(volumes)} × PL ${formatarNumero(volumesPl)} — conferir níveis pallet × caixas`,
      )
      if (!iguais) {
        falhar({
          regraId: 'BL4-05',
          doc: bl,
          titulo: 'Volumes do BL divergem do packing list',
          motivo: `BL declara ${formatarNumero(volumes)} volumes e o packing list ${formatarNumero(volumesPl)}.`,
          analise:
            'Divergência pode ser legítima quando os documentos contam níveis diferentes (pallets × caixas internas) — conferir a composição para evitar trava no Mercante (IN 680/06 arts. 18 e 29).',
          campo: 'goods.total_packages',
          valor: volumesTexto,
          status: 'amarelo',
          evidenciasExtras: plPrincipal
            ? [
                {
                  documento: plPrincipal.rotulo,
                  campo: 'shipmentDetails.totalPackages',
                  valor: String(volumesPl),
                },
              ]
            : [],
        })
      }
    } else {
      registrar('BL4-05', r, true, 'N/A — sem contagem de volumes no PL/invoice para cruzar com o BL')
    }

    // ── BL5-01 — Peso bruto ───────────────────────────────────────────────────
    const pesoBrutoTexto = valorCampo(bl.mapa, [
      'goods.shipment_gross_weight',
      'shipmentGrossWeight',
      'totalGrossWeight',
      'grossWeight',
    ])
    const pesoBruto = parseNumero(pesoBrutoTexto)
    if (pesoBruto !== null && pesoBruto > 0) {
      registrar('BL5-01', r, true, `Peso bruto ${formatarNumero(pesoBruto)} declarado`)
    } else {
      registrar('BL5-01', r, false, 'Peso bruto (gross weight) ausente ou igual a zero')
      falhar({
        regraId: 'BL5-01',
        doc: bl,
        titulo: 'Peso bruto ausente no BL',
        motivo: 'A extração não identificou gross weight válido (> 0) no BL.',
        analise:
          'O peso bruto total (e por contêiner quando multi) é conteúdo obrigatório do BL e base da conferência de 5% (IN 800/2007 Anexo IV; IN 680/06 art. 29, IV).',
        campo: 'goods.shipment_gross_weight',
        valor: pesoBrutoTexto,
      })
    }

    // ── BL5-02 — Cubagem / measurement (condicional) ──────────────────────────
    const cubagemTexto = valorCampo(bl.mapa, [
      'goods.total_shipment_volume',
      'totalShipmentVolume',
      'measurement',
    ])
    const cubagem = parseNumero(cubagemTexto)
    registrar(
      'BL5-02',
      r,
      true,
      cubagem !== null
        ? `Cubagem ${formatarNumero(cubagem)} declarada (base de frete W/M)`
        : 'N/A — measurement não citado no BL (regra condicional)',
    )

    // ── BL5-03 — Pesos BL × PL × Invoice (gate > 5%) ──────────────────────────
    const pesoPl = plPrincipal
      ? parseNumero(
          valorCampo(plPrincipal.mapa, [
            'shipmentDetails.totalGrossWeight',
            'packageSummary.totalGrossWeight',
            'totalGrossWeight',
            'grossWeight',
          ]),
        )
      : null
    const pesoInvoice = invoicePrincipal
      ? parseNumero(
          valorCampo(invoicePrincipal.mapa, [
            'shipment.grossWeight',
            'packageSummary.totalGrossWeight',
            'totalGrossWeight',
            'grossWeight',
          ]),
        )
      : null
    const referencias = [
      pesoPl !== null && plPrincipal ? { origem: plPrincipal, peso: pesoPl } : null,
      pesoInvoice !== null && invoicePrincipal ? { origem: invoicePrincipal, peso: pesoInvoice } : null,
    ].filter((ref): ref is { origem: DocumentoLeitura; peso: number } => !!ref)
    if (pesoBruto !== null && referencias.length > 0) {
      let piorDesvio = 0
      let piorReferencia = referencias[0]
      for (const ref of referencias) {
        const base = Math.max(Math.abs(pesoBruto), Math.abs(ref.peso))
        const desvio = base === 0 ? 0 : Math.abs(pesoBruto - ref.peso) / base
        if (desvio > piorDesvio) {
          piorDesvio = desvio
          piorReferencia = ref
        }
      }
      const percentual = (piorDesvio * 100).toFixed(1)
      if (piorDesvio > TOLERANCIA_PESO_VERMELHO) {
        registrar(
          'BL5-03',
          r,
          false,
          `Peso do BL diverge ${percentual}% (> 5%) de ${piorReferencia.origem.rotulo}`,
        )
        falhar({
          regraId: 'BL5-03',
          doc: bl,
          titulo: 'Divergência de peso acima de 5% (gate)',
          motivo: `Gross do BL ${formatarNumero(pesoBruto)} diverge ${percentual}% do peso de ${piorReferencia.origem.rotulo} (${formatarNumero(piorReferencia.peso)}).`,
          analise:
            'Divergência de peso acima de 5% supera a tolerância da IN 680/06 art. 29, IV — divergência grosseira expõe a perdimento (jurisprudência TRF3).',
          campo: 'goods.shipment_gross_weight',
          valor: pesoBrutoTexto,
          evidenciasExtras: [
            {
              documento: piorReferencia.origem.rotulo,
              campo: 'totalGrossWeight',
              valor: String(piorReferencia.peso),
            },
          ],
        })
      } else if (piorDesvio >= TOLERANCIA_PESO_AMARELO) {
        registrar(
          'BL5-03',
          r,
          false,
          `Peso do BL diverge ${percentual}% (entre 2% e 5%) de ${piorReferencia.origem.rotulo}`,
        )
        falhar({
          regraId: 'BL5-03',
          doc: bl,
          titulo: 'Divergência de peso entre 2% e 5%',
          motivo: `Gross do BL ${formatarNumero(pesoBruto)} diverge ${percentual}% do peso de ${piorReferencia.origem.rotulo} (${formatarNumero(piorReferencia.peso)}).`,
          analise:
            'Divergência dentro da tolerância de 5% da IN 680/06 art. 29, IV, mas acima de 2% — conferir antes do registro.',
          campo: 'goods.shipment_gross_weight',
          valor: pesoBrutoTexto,
          status: 'amarelo',
          evidenciasExtras: [
            {
              documento: piorReferencia.origem.rotulo,
              campo: 'totalGrossWeight',
              valor: String(piorReferencia.peso),
            },
          ],
        })
      } else {
        registrar(
          'BL5-03',
          r,
          true,
          `Peso do BL (${formatarNumero(pesoBruto)}) confere com PL/invoice — desvio ${percentual}%`,
        )
      }
    } else {
      registrar('BL5-03', r, true, 'N/A — sem peso no PL/invoice para cruzar com o BL')
    }

    // ── BL5-04 — VGM / payload por contêiner (gate) ───────────────────────────
    const conteineresComPeso = conteineres.filter(
      (c): c is ConteinerBl & { peso_bruto: number } => c.peso_bruto !== null && c.peso_bruto > 0,
    )
    if (conteineresComPeso.length > 0) {
      const acimaPayload = conteineresComPeso.filter((c) => {
        const tipoNorm = (c.tipo ?? '').replace(/\s/g, '').toUpperCase()
        const eh20 = tipoNorm.startsWith('2') || /\b20/.test(tipoNorm)
        const teto = eh20 ? MAX_GROSS_CONTEINER_20_KG : MAX_GROSS_CONTEINER_40_KG
        return c.peso_bruto > teto
      })
      if (acimaPayload.length === 0) {
        registrar(
          'BL5-04',
          r,
          true,
          `Peso por contêiner dentro do max gross ISO (${conteineresComPeso.length} conferido(s))`,
        )
      } else {
        registrar(
          'BL5-04',
          r,
          false,
          `Contêiner(es) acima do max gross ISO: ${acimaPayload.map((c) => `${c.numero ?? '—'} (${formatarNumero(c.peso_bruto)})`).join(', ')}`,
        )
        falhar({
          regraId: 'BL5-04',
          doc: bl,
          titulo: 'Peso por contêiner acima do payload máximo (VGM)',
          motivo: `Contêiner(es) com gross acima do máximo do equipamento: ${acimaPayload.map((c) => `${c.numero ?? '—'} com ${formatarNumero(c.peso_bruto)}`).join(', ')}.`,
          analise:
            'O peso bruto por contêiner não pode exceder o payload do type code ISO e deve casar com o VGM declarado (SOLAS Cap. VI, Reg. 2; ISO 6346).',
          campo: 'containers[].container_gross_weight',
          valor: acimaPayload.map((c) => c.numero ?? '—').join(', '),
        })
      }
    } else {
      registrar(
        'BL5-04',
        r,
        true,
        'N/A — sem peso por contêiner na extração para conferir VGM/payload',
      )
    }

    // ── BL5-05 — Consistência de unidades (kg × lbs / m³ × cft) ───────────────
    const unidadePeso = valorCampo(bl.mapa, ['goods.weight_unit', 'weightUnit'])
    if (unidadePeso && pesoBruto !== null && (pesoPl !== null || pesoInvoice !== null)) {
      const unidadeNorm = normalizarTexto(unidadePeso)
      const emLibras = unidadeNorm.startsWith('LB') || unidadeNorm === 'L'
      const pesoReferencia = pesoPl ?? pesoInvoice
      if (emLibras && pesoReferencia !== null) {
        const convertido = pesoBruto / 2.20462
        const coerente = valoresProximosRelativo(convertido, pesoReferencia, TOLERANCIA_PESO_VERMELHO)
        registrar(
          'BL5-05',
          r,
          coerente,
          coerente
            ? `BL em libras (${formatarNumero(pesoBruto)} lb ≈ ${formatarNumero(convertido)} kg) coerente com os demais documentos`
            : `BL em libras (${formatarNumero(pesoBruto)} lb) incoerente com o peso em kg dos demais documentos (${formatarNumero(pesoReferencia)})`,
        )
        if (!coerente) {
          falhar({
            regraId: 'BL5-05',
            doc: bl,
            titulo: 'Mistura de unidades de peso entre documentos',
            motivo: `O BL declara peso em libras (${formatarNumero(pesoBruto)} lb) incompatível com o peso em kg dos demais documentos (${formatarNumero(pesoReferencia)}).`,
            analise:
              'Mistura kg/lbs (fator ~2,20×) entre documentos gera declaração inexata (RA art. 725) — conferir a unidade declarada no BL.',
            campo: 'goods.weight_unit',
            valor: unidadePeso,
          })
        }
      } else {
        registrar('BL5-05', r, true, `Unidade de peso declarada: ${unidadePeso}`)
      }
    } else {
      registrar(
        'BL5-05',
        r,
        true,
        'Sem indício de mistura de unidades kg/lbs detectável pelo motor de código',
      )
    }

    // ── BL6-01 — Freight prepaid × collect coerente com o Incoterm ────────────
    const paymentTerms = valorCampo(bl.mapa, [
      'freight.payment_terms',
      'freightPaymentTerms',
      'paymentTerms',
    ])
    let freteCoerenteComIncoterm = false
    if (paymentTerms && incotermEfetivo) {
      const pagamentoNorm = normalizarTexto(paymentTerms)
      const sigla = normalizarTexto(incotermEfetivo).split(' ')[0] ?? ''
      const grupo = sigla.charAt(0)
      const esperadoPrepaid = grupo === 'C' || grupo === 'D'
      const esperadoCollect = grupo === 'E' || grupo === 'F'
      const ehPrepaid = pagamentoNorm.includes('PREPAID')
      const ehCollect = pagamentoNorm.includes('COLLECT')
      const divergente = (esperadoPrepaid && ehCollect) || (esperadoCollect && ehPrepaid)
      freteCoerenteComIncoterm = !divergente
      registrar(
        'BL6-01',
        r,
        !divergente,
        divergente
          ? `Frete ${paymentTerms} incoerente com Incoterm ${sigla} (grupo ${grupo} → ${esperadoPrepaid ? 'prepaid' : 'collect'})`
          : `Frete ${paymentTerms} coerente com o Incoterm ${sigla}`,
      )
      if (divergente) {
        falhar({
          regraId: 'BL6-01',
          doc: bl,
          titulo: 'Prepaid/Collect incoerente com o Incoterm',
          motivo: `O BL indica frete ${paymentTerms}, mas o Incoterm ${sigla} (grupo ${grupo}) espera ${esperadoPrepaid ? 'prepaid' : 'collect'}.`,
          analise:
            'Incoterms dos grupos C/D implicam frete pago na origem (prepaid) e E/F frete a pagar (collect) — divergência é red flag de valoração (Incoterms® 2020; AVA-GATT art. 8º, 2).',
          campo: 'freight.payment_terms',
          valor: paymentTerms,
        })
      }
    } else {
      registrar(
        'BL6-01',
        r,
        true,
        'N/A — cláusula de frete e/ou Incoterm não identificados para o cruzamento',
      )
    }

    // ── BL6-02 — Valores de frete discriminados (motor código quando coerente) ─
    const componentesFrete = extrairComponentesFreteBl(bl.mapa)
    if (paymentTerms && freteCoerenteComIncoterm && componentesFrete.temValor) {
      registrar(
        'BL6-02',
        r,
        true,
        `Frete ${paymentTerms} com valores discriminados (${componentesFrete.resumo}) — coerente com o Incoterm`,
      )
    } else if (paymentTerms && !componentesFrete.temValor) {
      registrar(
        'BL6-02',
        r,
        false,
        'Cláusula de frete presente, mas valores ou componentes não discriminados no BL',
      )
      falhar({
        regraId: 'BL6-02',
        doc: bl,
        titulo: 'Valores de frete não discriminados',
        motivo: `O BL indica frete ${paymentTerms}, porém não há valores ou componentes (freight charge, sobretaxas) identificáveis na extração.`,
        analise:
          'Frete e sobretaxas discriminados são base do AFRMM e da valoração — ausência impede conferência (IN 800/2007 Anexo IV).',
        campo: 'freight.total_value',
        valor: paymentTerms,
        status: 'amarelo',
      })
    } else {
      registrar(
        'BL6-02',
        r,
        true,
        'N/A — frete/Incoterm/valores insuficientes para avaliar componentes (regra IA)',
      )
    }

    // ── BL6-03 — Moeda do frete em ISO 4217 (condicional) ─────────────────────
    const moedaBl = valorCampo(bl.mapa, ['freight.currency', 'currency'])
    if (moedaBl) {
      const moedaNorm = moedaBl.trim().toUpperCase()
      const iso = /^[A-Z]{3}$/.test(moedaNorm)
      const moedaInvoice = invoicePrincipal
        ? valorCampo(invoicePrincipal.mapa, ['currency', 'currency.type', 'totals.currency'])
        : null
      let detalheMoeda = iso
        ? `Moeda ${moedaNorm} no padrão ISO 4217`
        : `Moeda «${moedaBl}» fora do padrão ISO 4217`
      let moedaOk = iso
      if (iso && moedaInvoice && moedaInvoice.trim().toUpperCase() !== moedaNorm) {
        moedaOk = false
        detalheMoeda = `Moeda do BL (${moedaNorm}) diferente da moeda da invoice (${moedaInvoice.trim().toUpperCase()})`
      }
      registrar('BL6-03', r, moedaOk, detalheMoeda)
      if (!moedaOk) {
        falhar({
          regraId: 'BL6-03',
          doc: bl,
          titulo: 'Moeda do frete inconsistente no BL',
          motivo: detalheMoeda,
          analise:
            'A moeda do frete deve estar em ISO 4217 e coerente com a invoice quando o frete também consta lá — base da conversão cambial (RA art. 97).',
          campo: 'freight.currency',
          valor: moedaBl,
          status: 'amarelo',
        })
      }
    } else {
      registrar('BL6-03', r, true, 'N/A — moeda do frete não impressa no BL (regra condicional)')
    }

    // ── BL7-03 — Validação pré-DUIMP (conferência dos dados do CE) ────────────
    const pendenciasCe = [
      pesoBruto === null || pesoBruto <= 0 ? 'peso' : null,
      !consignee && !cnpjBl ? 'consignatário' : null,
      volumes === null || volumes <= 0 ? 'volumes' : null,
    ].filter((p): p is string => !!p)
    registrar(
      'BL7-03',
      r,
      pendenciasCe.length === 0,
      pendenciasCe.length === 0
        ? 'Dados essenciais do CE presentes (peso, volumes e consignatário) — após a submissão da DUIMP o CE fica bloqueado para alteração'
        : `Dados do CE incompletos antes da DUIMP: ${pendenciasCe.join(', ')}`,
    )
    if (pendenciasCe.length > 0) {
      falhar({
        regraId: 'BL7-03',
        doc: bl,
        titulo: 'Dados do CE incompletos antes da DUIMP',
        motivo: `Faltam dados essenciais para a conferência pré-DUIMP: ${pendenciasCe.join(', ')}.`,
        analise:
          'NCM, frete, RUC e consignatário do CE devem estar conferidos antes de submeter a DUIMP — após a submissão o CE fica bloqueado para alteração (Portal Único/DUIMP; IN 680/06 art. 4º-A).',
        campo: 'goods',
        status: 'amarelo',
      })
    }

    // ── BL7-04 — Carta de correção (janela legal informada) ───────────────────
    registrar(
      'BL7-04',
      r,
      true,
      'Carta de correção com efeitos fiscais: só antes do registro da DI e dentro de 30 dias da emissão — fora disso, retificação formal com risco de multa (IN 680/06 art. 20; DL 37/66 art. 107, IV, "e").',
    )

    // ── BL9-04 — Risco de penalidade e bloqueio (consolidação) ────────────────
    const falhasDoBl = riscos.filter((risco) =>
      risco.evidencias.some((e) => e.documento === r),
    )
    const gatesDoBl = falhasDoBl.filter((risco) => {
      const regra = risco.id_regra_matriz ? regraMatrizBlPorId(risco.id_regra_matriz) : undefined
      return regra?.severidade === 'bloq' && risco.status_matriz === 'vermelho'
    })
    registrar(
      'BL9-04',
      r,
      gatesDoBl.length === 0,
      gatesDoBl.length === 0
        ? 'Sem gate disparado pelo motor de código — exposição base: multa R$ 5.000 por informação/retificação fora de prazo (DL 37/66 art. 107, IV, "e")'
        : `${gatesDoBl.length} gate(s) do motor de código disparado(s) — exposição a multa R$ 5.000/ocorrência, bloqueio automático, demurrage e armazenagem`,
    )
  }

  const criticos = riscos.filter((risco) => risco.severidade === 'critico').length
  const atencao = riscos.filter((risco) => risco.severidade === 'atencao').length
  const informativos = riscos.filter((risco) => risco.severidade === 'informativo').length

  return {
    resumo: { riscos, total: riscos.length, criticos, atencao, informativos },
    contexto: {
      regras,
      ncms_encontrados: [],
      tributos_ncm: [],
    },
  }
}
