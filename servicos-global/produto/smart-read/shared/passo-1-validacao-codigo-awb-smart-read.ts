/**
 * passo-1-validacao-codigo-awb-smart-read.ts — motor Código + Cross-Doc da matriz AWB (AW1–AW9).
 *
 * Regras determinísticas do Air Waybill e cruzamentos com invoice/packing list da mesma leitura.
 * Regras semânticas (motor IA/RAG) ficam no Analista LLM (prompt-analista-awb).
 */

import {
  regraMatrizAwbPorId,
  type RegraMatrizAwb,
} from './matriz-validacao-awb-smart-read.js'
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

/** Incoterms exclusivos do modal aquaviário — proibidos em carga aérea (AW3-04). */
const INCOTERMS_EXCLUSIVOS_AQUAVIARIO = ['FAS', 'FOB', 'CFR', 'CIF'] as const

const TOLERANCIA_PESO_AMARELO = 0.02 // 2% — AW5-03
const TOLERANCIA_PESO_VERMELHO = 0.05 // 5% — AW5-03 (gate IN 680/06 art. 29, IV)

/** Fator IATA TACT do peso volumétrico: volume (cm³) ÷ 6.000 = kg taxável (AW5-02). */
const FATOR_PESO_VOLUMETRICO_IATA = 6_000

let contadorRiscoAwb = 0

function criarRiscoAwb(parcial: {
  regra: RegraMatrizAwb
  severidade: RiscoAduaneiroLeitura['severidade']
  categoria: RiscoAduaneiroLeitura['categoria']
  titulo: string
  motivo: string
  analise: string
  evidencias: RiscoAduaneiroLeitura['evidencias']
  status?: 'vermelho' | 'amarelo'
}): RiscoAduaneiroLeitura {
  contadorRiscoAwb += 1
  return {
    id: `risco-awb-${contadorRiscoAwb}`,
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
 * AW1-01 — Número do AWB no padrão IATA (Res. 600a): 3 dígitos do prefixo da cia +
 * 8 dígitos do serial, sendo o último o dígito verificador = (7 primeiros) mód. 7.
 */
export function validarNumeroAwbIata(numero: string): boolean {
  const limpo = numero.replace(/[\s-]/g, '')
  if (!/^\d{11}$/.test(limpo)) return false
  const serial = limpo.slice(3, 10)
  const dv = Number(limpo[10])
  return Number(serial) % 7 === dv
}

/**
 * AW2-04 — CNPJ alfanumérico (IN RFB 2.229/2024): 12 posições alfanuméricas
 * (A–Z/0–9) + 2 DV numéricos, Módulo 11 com conversão ASCII−48.
 */
export function validarCnpjAlfanumericoAwb(cnpj: string): boolean {
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

/** Código IATA de aeroporto — 3 letras maiúsculas. */
function ehCodigoAeroportoIata(codigo: string): boolean {
  return /^[A-Z]{3}$/.test(codigo.trim().toUpperCase())
}

function extrairNumeroAwbPrincipal(doc: DocumentoLeitura): {
  numero: string | null
  mawb: string | null
  hawb: string | null
} {
  const mawb = valorCampo(doc.mapa, ['awbInfo.mawbNumber', 'mawbNumber'])
  const hawb = valorCampo(doc.mapa, ['awbInfo.hawbNumber', 'hawbNumber'])
  const generico = valorCampo(doc.mapa, [
    'awbInfo.awbNumber',
    'awbNumber',
    'document.documentNumber',
    'document.number',
  ])
  return { numero: mawb ?? generico, mawb, hawb }
}

/** Passo 1 AWB — motor Código + Cross-Doc: regras determinísticas da matriz AW1–AW9. */
export function executarPasso1ValidacaoCodigoAwb(
  documentosEntrada: DocumentoAnaliseRisco[],
): { resumo: ResumoRiscosAduaneirosLeitura; contexto: ContextoAuditoriaV1Leitura } {
  contadorRiscoAwb = 0
  const riscos: RiscoAduaneiroLeitura[] = []
  const regras: RegraAuditoriaV1[] = []

  const todos = coletarDocumentos(documentosEntrada)
  const awbs = todos.filter(
    (d) => d.tipo.includes('AWB') || d.tipo.includes('AIR WAYBILL'),
  )
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
    const regra = regraMatrizAwbPorId(params.regraId)
    if (!regra) return
    const severidade =
      (params.status ?? (regra.severidade === 'bloq' ? 'vermelho' : 'amarelo')) === 'vermelho'
        ? 'critico'
        : 'atencao'
    riscos.push(
      criarRiscoAwb({
        regra,
        severidade,
        categoria: regra.secao === 'pesos_taxavel' ? 'matematico' : 'documental',
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

  // ── AW1-05 — AWBs conflitantes para o mesmo embarque (cross-doc entre AWBs) ──
  if (awbs.length >= 2) {
    const numerosMaster = awbs
      .map((doc) => ({ doc, numero: extrairNumeroAwbPrincipal(doc).numero }))
      .filter((par): par is { doc: DocumentoLeitura; numero: string } => !!par.numero)
    const numerosDistintos = new Set(numerosMaster.map((par) => par.numero.replace(/[\s-]/g, '')))
    if (numerosDistintos.size > 1) {
      const primeiro = numerosMaster[0]
      registrar(
        'AW1-05',
        primeiro.doc.rotulo,
        false,
        `AWBs distintos no mesmo processo: ${[...numerosDistintos].join(' × ')}`,
      )
      falhar({
        regraId: 'AW1-05',
        doc: primeiro.doc,
        titulo: 'Conhecimentos aéreos conflitantes no processo',
        motivo: `Foram encontrados ${numerosDistintos.size} números de AWB distintos para o mesmo embarque: ${[...numerosDistintos].join(', ')}.`,
        analise:
          'Reemissão de AWB sem cancelamento do anterior gera risco de instrução com documento superado (RA art. 725; IN 680/06 art. 20).',
        campo: 'awbInfo.mawbNumber',
        valor: [...numerosDistintos].join(', '),
        evidenciasExtras: numerosMaster.slice(1).map((par) => ({
          documento: par.doc.rotulo,
          campo: 'awbInfo.mawbNumber',
          valor: par.numero,
        })),
      })
    } else if (numerosMaster.length > 0) {
      registrar(
        'AW1-05',
        numerosMaster[0].doc.rotulo,
        true,
        'AWB único no processo — sem conflito de versão',
      )
    }
  } else if (awbs.length === 1) {
    registrar('AW1-05', awbs[0].rotulo, true, 'AWB único no processo — sem conflito de versão')
  }

  for (const awb of awbs) {
    const r = awb.rotulo
    const { numero, mawb, hawb } = extrairNumeroAwbPrincipal(awb)
    const ehHouse = !!hawb

    // ── AW1-01 — Número do AWB (formato IATA + DV mód. 7) ────────────────────
    if (!numero) {
      registrar('AW1-01', r, false, 'Número do AWB não identificado na extração')
      falhar({
        regraId: 'AW1-01',
        doc: awb,
        titulo: 'Número do AWB ausente',
        motivo: 'A extração não identificou o número do conhecimento aéreo (MAWB).',
        analise:
          'O número do AWB no padrão IATA (prefixo da cia + serial com DV mód. 7) é obrigatório para manifestação no CCT (Res. IATA 600a; RA art. 553, I).',
        campo: 'awbInfo.mawbNumber',
      })
    } else if (validarNumeroAwbIata(numero)) {
      registrar('AW1-01', r, true, `AWB ${numero} válido no padrão IATA (DV mód. 7 confere)`)
    } else {
      registrar('AW1-01', r, false, `AWB ${numero} fora do padrão IATA ou DV inválido`)
      falhar({
        regraId: 'AW1-01',
        doc: awb,
        titulo: 'Número do AWB inválido no padrão IATA',
        motivo: `O número "${numero}" não segue o padrão IATA (3 dígitos do prefixo + 8 do serial) ou o dígito verificador (mód. 7) não confere.`,
        analise:
          'Número inválido indica erro de OCR/digitação ou documento irregular — impede a vinculação correta no CCT-Aéreo (Res. IATA 600a).',
        campo: 'awbInfo.mawbNumber',
        valor: numero,
      })
    }

    // ── AW1-04 — Data de emissão (execution date) ────────────────────────────
    const dataTexto = valorCampo(awb.mapa, [
      'awbInfo.awbDate',
      'document.date',
      'issueDate',
      'executionDate',
    ])
    const data = parseData(dataTexto)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    let dataOk = !!data
    let detalheData = dataTexto ?? 'Data de emissão (execution date) ausente'
    if (data && data > hoje) {
      dataOk = false
      detalheData = `Data futura: ${dataTexto}`
    }
    const invoicePrincipal = invoices[0] ?? null
    const dataInvoice = invoicePrincipal
      ? parseData(
          valorCampo(invoicePrincipal.mapa, ['document.issueDate', 'document.date', 'issueDate']),
        )
      : null
    if (data && dataInvoice && data < dataInvoice) {
      dataOk = false
      detalheData = `Emissão do AWB (${dataTexto}) anterior à da invoice`
    }
    const dataVoo = parseData(
      valorCampo(awb.mapa, ['awbInfo.flight.flightDate', 'flightDate', 'awbInfo.shippedOnBoardDate']),
    )
    if (data && dataVoo && data > dataVoo) {
      dataOk = false
      detalheData = `Emissão do AWB (${dataTexto}) posterior à data do voo`
    }
    registrar('AW1-04', r, dataOk, detalheData)
    if (!dataOk) {
      falhar({
        regraId: 'AW1-04',
        doc: awb,
        titulo: 'Data de emissão do AWB inconsistente',
        motivo: detalheData,
        analise:
          'Data ausente, futura, anterior à invoice ou posterior ao voo compromete a ordem cronológica do conjunto instrutivo (Convenção de Montreal art. 7º; IN 680/06).',
        campo: 'awbInfo.awbDate',
        valor: dataTexto,
      })
    }

    // ── AW1-06 — Aeroportos IATA 3-letter ────────────────────────────────────
    const aeroportoOrigem = valorCampo(awb.mapa, ['route.originAirport', 'originAirport'])
    const aeroportoDestino = valorCampo(awb.mapa, ['route.destinationAirport', 'destinationAirport'])
    if (!aeroportoOrigem && !aeroportoDestino) {
      registrar('AW1-06', r, false, 'Aeroportos de origem e destino não identificados')
      falhar({
        regraId: 'AW1-06',
        doc: awb,
        titulo: 'Aeroportos de origem/destino ausentes no AWB',
        motivo: 'A extração não identificou airport of departure nem of destination.',
        analise:
          'Origem e destino em código IATA de 3 letras são obrigatórios no AWB (Res. IATA 600a) e base da coerência de rota.',
        campo: 'route.originAirport',
      })
    } else {
      const invalidos = [
        aeroportoOrigem && !ehCodigoAeroportoIata(aeroportoOrigem) ? `origem "${aeroportoOrigem}"` : null,
        aeroportoDestino && !ehCodigoAeroportoIata(aeroportoDestino)
          ? `destino "${aeroportoDestino}"`
          : null,
      ].filter((v): v is string => !!v)
      if (invalidos.length > 0) {
        registrar('AW1-06', r, false, `Código IATA inválido: ${invalidos.join(' e ')}`)
        falhar({
          regraId: 'AW1-06',
          doc: awb,
          titulo: 'Código IATA de aeroporto fora do padrão',
          motivo: `Aeroporto com código fora do padrão IATA de 3 letras: ${invalidos.join(' e ')}.`,
          analise:
            'Códigos de aeroporto fora do padrão IATA indicam erro de extração ou preenchimento — conferir contra o documento original (Res. IATA 600a).',
          campo: 'route.originAirport',
          valor: [aeroportoOrigem, aeroportoDestino].filter(Boolean).join(' → '),
        })
      } else {
        registrar(
          'AW1-06',
          r,
          true,
          `Rota ${aeroportoOrigem ?? '—'} → ${aeroportoDestino ?? '—'} em código IATA válido`,
        )
      }
    }

    // ── AW2-01 — Shipper vs exportador da invoice/PL ─────────────────────────
    const shipper = valorCampo(awb.mapa, ['exporter.name', 'shipper.name'])
    const exportadorInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['exporter.name', 'shipper.name'])
      : null
    if (shipper && exportadorInvoice) {
      const coincide = tokensCoincidem(shipper, exportadorInvoice)
      registrar(
        'AW2-01',
        r,
        coincide,
        coincide
          ? `Shipper «${shipper}» coerente com o exportador da invoice`
          : `Shipper «${shipper}» difere do exportador da invoice «${exportadorInvoice}»`,
      )
      if (!coincide) {
        falhar({
          regraId: 'AW2-01',
          doc: awb,
          titulo: 'Shipper do AWB diverge do exportador da invoice',
          motivo: `Shipper «${shipper}» não coincide com o exportador da invoice «${exportadorInvoice}».`,
          analise:
            'Divergência de partes entre conhecimento e fatura é gatilho de exigência aduaneira (RA art. 553; Convenção de Montreal art. 5º).',
          campo: 'exporter.name',
          valor: shipper,
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'exporter.name', valor: exportadorInvoice }]
            : [],
        })
      }
    } else if (shipper) {
      registrar('AW2-01', r, true, `Shipper «${shipper}» presente — sem invoice para cruzar`)
    } else {
      registrar('AW2-01', r, false, 'Shipper não identificado no AWB')
      falhar({
        regraId: 'AW2-01',
        doc: awb,
        titulo: 'Shipper ausente no AWB',
        motivo: 'A extração não identificou o shipper (expedidor) do conhecimento aéreo.',
        analise: 'Nome e endereço do shipper são conteúdo obrigatório do AWB (Montreal art. 5º).',
        campo: 'exporter.name',
      })
    }

    // ── AW2-02 — Consignee identificado (AWB não admite "to order") ──────────
    const consignee = valorCampo(awb.mapa, ['importer.name', 'consignee.name'])
    const consigneeNorm = consignee ? normalizarTexto(consignee) : ''
    const ehAOrdem = /\bTO ORDER\b|\bA ORDEM\b/.test(consigneeNorm)
    const importadorInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['importer.name', 'consignee.name'])
      : null
    if (ehAOrdem) {
      registrar('AW2-02', r, false, `Consignee "à ordem" não é admitido em AWB: «${consignee}»`)
      falhar({
        regraId: 'AW2-02',
        doc: awb,
        titulo: 'Consignee "to order" em AWB',
        motivo: `O consignee está consignado "à ordem" («${consignee}») — o AWB não é título de crédito e não admite endosso.`,
        analise:
          'A Convenção de Montreal art. 15, §3 veda AWB negociável — o consignatário nominal é obrigatório para desembaraço (IN 680/06 art. 29, II).',
        campo: 'importer.name',
        valor: consignee,
      })
    } else if (consignee && importadorInvoice) {
      const coincide = tokensCoincidem(consignee, importadorInvoice)
      registrar(
        'AW2-02',
        r,
        coincide,
        coincide
          ? `Consignee «${consignee}» coerente com o importador da invoice`
          : `Consignee «${consignee}» difere do importador da invoice «${importadorInvoice}»`,
      )
      if (!coincide) {
        falhar({
          regraId: 'AW2-02',
          doc: awb,
          titulo: 'Consignee do AWB diverge do importador da invoice',
          motivo: `Consignee «${consignee}» não coincide com o importador «${importadorInvoice}».`,
          analise:
            'O consignatário nominal do AWB deve identificar o importador da operação (Montreal art. 15, §3; IN 680/06 art. 29, II).',
          campo: 'importer.name',
          valor: consignee,
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'importer.name', valor: importadorInvoice }]
            : [],
        })
      }
    } else if (consignee) {
      registrar('AW2-02', r, true, `Consignee nominal «${consignee}» presente`)
    } else {
      registrar('AW2-02', r, false, 'Consignee não identificado no AWB')
      falhar({
        regraId: 'AW2-02',
        doc: awb,
        titulo: 'Consignee ausente no AWB',
        motivo: 'A extração não identificou o consignatário do conhecimento aéreo.',
        analise:
          'Consignee nominal é obrigatório — o AWB não admite "to order" (Montreal art. 15, §3).',
        campo: 'importer.name',
      })
    }

    // ── AW2-03 — Notify party (info) ─────────────────────────────────────────
    const notify = valorCampo(awb.mapa, ['notifyParty.name', 'notify.name', 'alsoNotify'])
    registrar(
      'AW2-03',
      r,
      true,
      notify ? `Notify party: «${notify}»` : 'N/A — notify party não citado no AWB',
    )

    // ── AW2-04 — CNPJ no AWB (máscara numérica ou alfanumérica) ──────────────
    const cnpjAwb = valorCampo(awb.mapa, ['importer.cnpj', 'consignee.cnpj', 'cnpj'])
    if (cnpjAwb) {
      const cnpjLimpo = cnpjAwb.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
      const ehAlfanumerico = /[A-Z]/.test(cnpjLimpo)
      const valido = ehAlfanumerico
        ? validarCnpjAlfanumericoAwb(cnpjLimpo)
        : validarCnpjBrasil(cnpjLimpo)
      registrar(
        'AW2-04',
        r,
        valido,
        valido
          ? `CNPJ ${cnpjAwb} válido (${ehAlfanumerico ? 'alfanumérico IN 2.229/2024' : 'numérico'})`
          : `CNPJ ${cnpjAwb} com dígito verificador inválido`,
      )
      if (!valido) {
        falhar({
          regraId: 'AW2-04',
          doc: awb,
          titulo: 'CNPJ do consignatário inválido no AWB',
          motivo: `O CNPJ «${cnpjAwb}» impresso no AWB não passa na validação de dígito verificador.`,
          analise:
            'CNPJ inválido indica erro de OCR ou dado incorreto — red flag de fraude/erro de consignação (IN RFB 2119/2022; IN RFB 2.229/2024).',
          campo: 'importer.cnpj',
          valor: cnpjAwb,
        })
      }
      const dvValido = valido && ehAlfanumerico
      if (dvValido && data && data < new Date(2026, 6, 31)) {
        registrar(
          'AW2-04',
          `${r}-alfa`,
          false,
          `CNPJ alfanumérico em documento datado antes de 31/07/2026 (${dataTexto}) — red flag OCR/fraude`,
        )
        falhar({
          regraId: 'AW2-04',
          doc: awb,
          titulo: 'CNPJ alfanumérico antes da vigência da IN 2.229/2024',
          motivo: `O AWB traz CNPJ alfanumérico «${cnpjAwb}» com data de emissão ${dataTexto}, anterior à vigência de 31/07/2026.`,
          analise:
            'CNPJ alfanumérico só existe a partir de 31/07/2026 (IN RFB 2.229/2024) — documento anterior com CNPJ alfa é red flag de OCR ou adulteração.',
          campo: 'importer.cnpj',
          valor: cnpjAwb,
        })
      }
    } else {
      registrar('AW2-04', r, true, 'N/A — CNPJ não impresso no AWB (regra condicional)')
    }

    // ── AW2-05 — Consignatário no CCT: bloqueio automático no HAWB ───────────
    if (ehHouse) {
      const identificado = !!consignee || !!cnpjAwb
      registrar(
        'AW2-05',
        r,
        identificado,
        identificado
          ? `HAWB ${hawb} com consignatário identificado — sem risco de bloqueio automático`
          : `HAWB ${hawb} sem identificação do consignatário — bloqueio automático no CCT`,
      )
      if (!identificado) {
        falhar({
          regraId: 'AW2-05',
          doc: awb,
          titulo: 'HAWB sem consignatário identificado — bloqueio automático',
          motivo: `O HAWB ${hawb} não identifica o consignatário (nome/CNPJ/CPF/passaporte).`,
          analise:
            'A falta de identificação do consignatário no HAWB até a chegada do voo gera bloqueio automático da carga no CCT-Aéreo (Manual CCT Aéreo).',
          campo: 'importer.name',
        })
      }
    } else {
      registrar(
        'AW2-05',
        r,
        true,
        'N/A — documento é MAWB (a falta de consignatário não bloqueia no master)',
      )
    }

    // ── AW2-06 — Estabelecimento consignatário = declarante ──────────────────
    const cnpjInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['importer.cnpj', 'consignee.cnpj'])
      : null
    if (cnpjAwb && cnpjInvoice) {
      const limpoAwb = cnpjAwb.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
      const limpoInvoice = cnpjInvoice.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
      const raizIgual = limpoAwb.slice(0, 8) === limpoInvoice.slice(0, 8)
      const estabelecimentoIgual =
        limpoAwb.length >= 12 && limpoInvoice.length >= 12
          ? limpoAwb.slice(0, 12) === limpoInvoice.slice(0, 12)
          : raizIgual
      if (!raizIgual) {
        registrar(
          'AW2-06',
          r,
          false,
          `CNPJ do AWB (${cnpjAwb}) com raiz diferente do importador da invoice (${cnpjInvoice})`,
        )
        falhar({
          regraId: 'AW2-06',
          doc: awb,
          titulo: 'Consignatário do AWB diverge do declarante',
          motivo: `A raiz do CNPJ consignado no AWB (${cnpjAwb}) difere da raiz do importador da invoice (${cnpjInvoice}).`,
          analise:
            'A DUIMP se vincula ao estabelecimento consignatário — CNPJ divergente trava a vinculação no registro (IN 680/06 arts. 15, VI e 44).',
          campo: 'importer.cnpj',
          valor: cnpjAwb,
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'importer.cnpj', valor: cnpjInvoice }]
            : [],
        })
      } else if (!estabelecimentoIgual) {
        registrar(
          'AW2-06',
          r,
          false,
          `Mesma raiz, estabelecimento (matriz/filial) divergente: AWB ${cnpjAwb} × invoice ${cnpjInvoice}`,
        )
        falhar({
          regraId: 'AW2-06',
          doc: awb,
          titulo: 'Estabelecimento consignatário divergente (matriz × filial)',
          motivo: `AWB consignado ao estabelecimento ${cnpjAwb} e invoice ao ${cnpjInvoice} — mesma raiz, ordem/filial diferente.`,
          analise:
            'Divergência matriz (/0001) × filial trava a vinculação da DUIMP ao estabelecimento (IN 680/06 arts. 15, VI e 44; Dicionário DI/RFB).',
          campo: 'importer.cnpj',
          valor: cnpjAwb,
          status: 'amarelo',
        })
      } else {
        registrar(
          'AW2-06',
          r,
          true,
          `Estabelecimento consignatário coincide com o declarante (${cnpjAwb})`,
        )
      }
    } else {
      registrar(
        'AW2-06',
        r,
        true,
        'N/A — CNPJ não disponível no AWB e/ou na invoice para conferir o estabelecimento',
      )
    }

    // ── AW3-01 — Voo e data ───────────────────────────────────────────────────
    const numeroVoo = valorCampo(awb.mapa, ['awbInfo.flight.flightNumber', 'flightNumber'])
    const dataVooTexto = valorCampo(awb.mapa, ['awbInfo.flight.flightDate', 'flightDate'])
    if (numeroVoo || dataVooTexto) {
      let detalheVoo = `Voo ${numeroVoo ?? '—'} em ${dataVooTexto ?? 'data não informada'}`
      let vooOk = !!numeroVoo && !!dataVooTexto
      if (numeroVoo && numero) {
        const prefixoAwb = numero.replace(/[\s-]/g, '').slice(0, 3)
        detalheVoo += ` · prefixo AWB ${prefixoAwb}`
      }
      registrar('AW3-01', r, vooOk, detalheVoo)
      if (!vooOk) {
        falhar({
          regraId: 'AW3-01',
          doc: awb,
          titulo: 'Voo ou data do voo incompletos no AWB',
          motivo: detalheVoo,
          analise:
            'Número do voo e data são a base da manifestação no CCT-Aéreo (Manual CCT Aéreo; Res. IATA 600a).',
          campo: 'awbInfo.flight.flightNumber',
          valor: numeroVoo,
        })
      }
    } else {
      registrar('AW3-01', r, false, 'Voo e data não identificados no AWB')
      falhar({
        regraId: 'AW3-01',
        doc: awb,
        titulo: 'Voo e data ausentes no AWB',
        motivo: 'A extração não identificou número do voo nem data (flight/date).',
        analise:
          'Sem voo e data não há como conferir a manifestação e os prazos do CCT-Aéreo (Manual CCT Aéreo).',
        campo: 'awbInfo.flight.flightNumber',
      })
    }

    // ── AW3-02 — Routing coerente (registro base; semântica fica com a IA) ───
    registrar(
      'AW3-02',
      r,
      true,
      aeroportoOrigem && aeroportoDestino
        ? `Routing declarado ${aeroportoOrigem} → ${aeroportoDestino} — cruzamento com Incoterm na análise IA`
        : 'Routing incompleto — cruzamento com Incoterm limitado',
    )

    // ── AW3-04 — Incoterm compatível com o modal aéreo (gate) ────────────────
    const incotermInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['incoterm', 'incoterms', 'paymentTerms.incoterm'])
      : null
    const incotermAwb = valorCampo(awb.mapa, ['incoterm', 'incoterms'])
    const incotermEfetivo = incotermInvoice ?? incotermAwb
    if (incotermEfetivo) {
      const sigla = normalizarTexto(incotermEfetivo).split(' ')[0] ?? ''
      const aquaviario = INCOTERMS_EXCLUSIVOS_AQUAVIARIO.some((termo) => sigla.startsWith(termo))
      registrar(
        'AW3-04',
        r,
        !aquaviario,
        aquaviario
          ? `Incoterm ${sigla} é exclusivo aquaviário — incompatível com carga aérea`
          : `Incoterm ${sigla} compatível com o modal aéreo`,
      )
      if (aquaviario) {
        falhar({
          regraId: 'AW3-04',
          doc: awb,
          titulo: 'Incoterm marítimo usado em carga aérea',
          motivo: `A operação usa o Incoterm ${sigla}, exclusivo do modal aquaviário, com conhecimento aéreo.`,
          analise:
            'FAS/FOB/CFR/CIF são exclusivos aquaviário (Incoterms® 2020) — carga aérea usa EXW/FCA/CPT/CIP/DAP/DPU/DDP; o enquadramento incorreto compromete a valoração (IN 680/06 art. 15, VI).',
          campo: 'incoterm',
          valor: incotermEfetivo,
          evidenciasExtras:
            invoicePrincipal && incotermInvoice
              ? [{ documento: invoicePrincipal.rotulo, campo: 'incoterm', valor: incotermInvoice }]
              : [],
        })
      }
    } else {
      registrar('AW3-04', r, true, 'N/A — Incoterm não identificado na leitura para cruzar com o modal')
    }

    // ── AW3-05 — RUC (condicional) ────────────────────────────────────────────
    const ruc = valorCampo(awb.mapa, ['ruc', 'awbInfo.ruc'])
    if (ruc) {
      const rucLimpa = ruc.replace(/\s/g, '').toUpperCase()
      const rucValida = /^[0-9][A-Z]{2}[A-Z0-9]{25,32}$/.test(rucLimpa) || /^[A-Z0-9]{20,35}$/.test(rucLimpa)
      registrar(
        'AW3-05',
        r,
        rucValida,
        rucValida
          ? `RUC ${ruc} no padrão — retificável só até a primeira recepção/entrega no CCT`
          : `RUC ${ruc} fora do padrão do Portal Único`,
      )
      if (!rucValida) {
        falhar({
          regraId: 'AW3-05',
          doc: awb,
          titulo: 'RUC fora do padrão',
          motivo: `A RUC «${ruc}» citada no AWB não segue o padrão do Portal Único.`,
          analise:
            'RUC inválida impede a vinculação da carga; no CCT a RUC só é retificável até a primeira recepção/entrega (Manual CCT Aéreo).',
          campo: 'ruc',
          valor: ruc,
        })
      }
    } else {
      registrar('AW3-05', r, true, 'N/A — RUC não citada no AWB (regra condicional)')
    }

    // ── AW3-06 — Prazos CCT-Aéreo (exposição informada) ──────────────────────
    registrar(
      'AW3-06',
      r,
      true,
      'Janelas CCT-Aéreo: manifestar 4h antes da chegada (voo longo) ou 30 min após decolagem (voo curto); registrar chegada em 15 min; recepção em 12h (prorrogável 24h). Atraso = R$ 5.000 + bloqueio (IN 2143/2023).',
    )

    // ── AW4-02 — Número de volumes (pieces / RCP) ────────────────────────────
    const piecesTexto = valorCampo(awb.mapa, [
      'shipmentDetails.totalPackages',
      'totalPackages',
      'pieces',
    ])
    const pieces = parseNumero(piecesTexto)
    if (pieces !== null && pieces > 0 && Number.isInteger(pieces)) {
      registrar('AW4-02', r, true, `${formatarNumero(pieces)} volume(s) (pieces/RCP) declarados`)
    } else if (pieces !== null) {
      registrar('AW4-02', r, false, `Número de volumes inválido: ${piecesTexto}`)
      falhar({
        regraId: 'AW4-02',
        doc: awb,
        titulo: 'Número de volumes (pieces) inválido no AWB',
        motivo: `O campo "No. of pieces RCP" traz o valor inválido «${piecesTexto}».`,
        analise: 'O número de volumes deve ser inteiro maior que zero (Res. IATA 600a; IN 680/06 art. 29).',
        campo: 'shipmentDetails.totalPackages',
        valor: piecesTexto,
      })
    } else {
      registrar('AW4-02', r, false, 'Número de volumes (pieces/RCP) ausente')
      falhar({
        regraId: 'AW4-02',
        doc: awb,
        titulo: 'Número de volumes ausente no AWB',
        motivo: 'A extração não identificou o campo "No. of pieces RCP".',
        analise: 'A quantidade de volumes é conteúdo obrigatório do AWB (Res. IATA 600a; IN 680/06 art. 29).',
        campo: 'shipmentDetails.totalPackages',
      })
    }

    // ── AW4-03 — Contagem em dois níveis vs PL/invoice ───────────────────────
    const plPrincipal = packings[0] ?? null
    const volumesPl = plPrincipal
      ? parseNumero(
          valorCampo(plPrincipal.mapa, [
            'shipmentDetails.totalPackages',
            'totalPackages',
            'totalVolumes',
          ]),
        )
      : null
    if (pieces !== null && volumesPl !== null) {
      const iguais = pieces === volumesPl
      registrar(
        'AW4-03',
        r,
        iguais,
        iguais
          ? `Volumes do AWB (${formatarNumero(pieces)}) conferem com o packing list`
          : `Volumes divergentes: AWB ${formatarNumero(pieces)} × PL ${formatarNumero(volumesPl)} — conferir níveis ULD/pallet × caixas`,
      )
      if (!iguais) {
        falhar({
          regraId: 'AW4-03',
          doc: awb,
          titulo: 'Volumes do AWB divergem do packing list',
          motivo: `AWB declara ${formatarNumero(pieces)} pieces e o packing list ${formatarNumero(volumesPl)} volumes.`,
          analise:
            'Divergência pode ser legítima quando os documentos contam níveis diferentes (pallets ULD × caixas internas) — conferir a composição (IN 680/06 arts. 18 e 29).',
          campo: 'shipmentDetails.totalPackages',
          valor: piecesTexto,
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
      registrar(
        'AW4-03',
        r,
        true,
        'N/A — sem contagem de volumes no PL/invoice para cruzar com o AWB',
      )
    }

    // ── AW5-01 — Peso bruto (gross weight) ───────────────────────────────────
    const pesoBrutoTexto = valorCampo(awb.mapa, [
      'shipmentDetails.totalGrossWeight',
      'totalGrossWeight',
      'grossWeight',
    ])
    const pesoBruto = parseNumero(pesoBrutoTexto)
    if (pesoBruto !== null && pesoBruto > 0) {
      registrar('AW5-01', r, true, `Peso bruto ${formatarNumero(pesoBruto)} declarado`)
    } else {
      registrar('AW5-01', r, false, 'Peso bruto (gross weight) ausente ou igual a zero')
      falhar({
        regraId: 'AW5-01',
        doc: awb,
        titulo: 'Peso bruto ausente no AWB',
        motivo: 'A extração não identificou gross weight válido (> 0) no AWB.',
        analise:
          'O peso bruto com unidade declarada (K/L) é conteúdo obrigatório do AWB e base da conferência de 5% (Res. IATA 600a; IN 680/06 art. 29, IV).',
        campo: 'shipmentDetails.totalGrossWeight',
        valor: pesoBrutoTexto,
      })
    }

    // ── AW5-02 — Peso taxável (chargeable weight — fator 1:6.000) ────────────
    const pesoTaxavelTexto = valorCampo(awb.mapa, [
      'shipmentDetails.totalCubedWeight',
      'chargeableWeight',
      'totalCubedWeight',
    ])
    const pesoTaxavel = parseNumero(pesoTaxavelTexto)
    if (pesoTaxavel !== null && pesoBruto !== null) {
      const consistente = pesoTaxavel >= pesoBruto || valoresProximosRelativo(pesoTaxavel, pesoBruto, 0.01)
      registrar(
        'AW5-02',
        r,
        consistente,
        consistente
          ? `Peso taxável ${formatarNumero(pesoTaxavel)} ≥ peso real ${formatarNumero(pesoBruto)} (regra do maior — TACT 1:${FATOR_PESO_VOLUMETRICO_IATA})`
          : `Peso taxável ${formatarNumero(pesoTaxavel)} menor que o peso real ${formatarNumero(pesoBruto)} — inconsistente com a regra do maior`,
      )
      if (!consistente) {
        falhar({
          regraId: 'AW5-02',
          doc: awb,
          titulo: 'Peso taxável menor que o peso real',
          motivo: `Chargeable weight ${formatarNumero(pesoTaxavel)} declarado abaixo do gross weight ${formatarNumero(pesoBruto)}.`,
          analise:
            'O peso taxável é o maior entre o real e o volumétrico (cm³ ÷ 6.000) — valor menor que o real indica erro de cálculo ou extração (IATA TACT Rules).',
          campo: 'shipmentDetails.totalCubedWeight',
          valor: pesoTaxavelTexto,
        })
      }
    } else {
      registrar(
        'AW5-02',
        r,
        true,
        pesoTaxavel !== null
          ? `Peso taxável ${formatarNumero(pesoTaxavel)} declarado — sem peso real para recalcular`
          : 'N/A — chargeable weight não identificado na extração',
      )
    }

    // ── AW5-03 — Pesos AWB × PL × Invoice (gate > 5%) ────────────────────────
    const pesoPl = plPrincipal
      ? parseNumero(
          valorCampo(plPrincipal.mapa, [
            'shipmentDetails.totalGrossWeight',
            'totalGrossWeight',
            'grossWeight',
          ]),
        )
      : null
    const pesoInvoice = invoicePrincipal
      ? parseNumero(
          valorCampo(invoicePrincipal.mapa, [
            'shipment.grossWeight',
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
          'AW5-03',
          r,
          false,
          `Peso do AWB diverge ${percentual}% (> 5%) de ${piorReferencia.origem.rotulo}`,
        )
        falhar({
          regraId: 'AW5-03',
          doc: awb,
          titulo: 'Divergência de peso acima de 5% (gate)',
          motivo: `Gross do AWB ${formatarNumero(pesoBruto)} diverge ${percentual}% do peso de ${piorReferencia.origem.rotulo} (${formatarNumero(piorReferencia.peso)}).`,
          analise:
            'Divergência de peso acima de 5% supera a tolerância da IN 680/06 art. 29, IV — divergência grosseira expõe a perdimento.',
          campo: 'shipmentDetails.totalGrossWeight',
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
          'AW5-03',
          r,
          false,
          `Peso do AWB diverge ${percentual}% (entre 2% e 5%) de ${piorReferencia.origem.rotulo}`,
        )
        falhar({
          regraId: 'AW5-03',
          doc: awb,
          titulo: 'Divergência de peso entre 2% e 5%',
          motivo: `Gross do AWB ${formatarNumero(pesoBruto)} diverge ${percentual}% do peso de ${piorReferencia.origem.rotulo} (${formatarNumero(piorReferencia.peso)}).`,
          analise:
            'Divergência dentro da tolerância de 5% da IN 680/06 art. 29, IV, mas acima de 2% — conferir antes do registro.',
          campo: 'shipmentDetails.totalGrossWeight',
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
          'AW5-03',
          r,
          true,
          `Peso do AWB (${formatarNumero(pesoBruto)}) confere com PL/invoice — desvio ${percentual}%`,
        )
      }
    } else {
      registrar(
        'AW5-03',
        r,
        true,
        'N/A — sem peso no PL/invoice para cruzar com o AWB',
      )
    }

    // ── AW5-04 — Consistência de unidades (kg × lb) ──────────────────────────
    const unidadePeso = valorCampo(awb.mapa, ['shipmentDetails.weightUnit', 'weightUnit'])
    if (unidadePeso && pesoBruto !== null && (pesoPl !== null || pesoInvoice !== null)) {
      const unidadeNorm = normalizarTexto(unidadePeso)
      const emLibras = unidadeNorm.startsWith('L') && !unidadeNorm.startsWith('LT')
      const pesoReferencia = pesoPl ?? pesoInvoice
      if (emLibras && pesoReferencia !== null) {
        const convertido = pesoBruto / 2.20462
        const coerente = valoresProximosRelativo(convertido, pesoReferencia, TOLERANCIA_PESO_VERMELHO)
        registrar(
          'AW5-04',
          r,
          coerente,
          coerente
            ? `AWB em libras (${formatarNumero(pesoBruto)} lb ≈ ${formatarNumero(convertido)} kg) coerente com os demais documentos`
            : `AWB em libras (${formatarNumero(pesoBruto)} lb) incoerente com o peso em kg dos demais documentos (${formatarNumero(pesoReferencia)})`,
        )
        if (!coerente) {
          falhar({
            regraId: 'AW5-04',
            doc: awb,
            titulo: 'Mistura de unidades de peso entre documentos',
            motivo: `O AWB declara peso em libras (${formatarNumero(pesoBruto)} lb) incompatível com o peso em kg dos demais documentos (${formatarNumero(pesoReferencia)}).`,
            analise:
              'Mistura kg/lb (fator ~2,20×) entre documentos gera declaração inexata (RA art. 725) — conferir a unidade K/L declarada no AWB.',
            campo: 'shipmentDetails.weightUnit',
            valor: unidadePeso,
          })
        }
      } else {
        registrar('AW5-04', r, true, `Unidade de peso declarada: ${unidadePeso}`)
      }
    } else {
      registrar(
        'AW5-04',
        r,
        true,
        'Sem indício de mistura de unidades kg/lb detectável pelo motor de código',
      )
    }

    // ── AW5-05 — Dimensões × volumétrico (info) ──────────────────────────────
    registrar(
      'AW5-05',
      r,
      true,
      pesoTaxavel !== null && pesoBruto !== null
        ? `Peso volumétrico implícito: taxável ${formatarNumero(pesoTaxavel)} vs real ${formatarNumero(pesoBruto)} (fator TACT 1:${FATOR_PESO_VOLUMETRICO_IATA})`
        : 'N/A — sem dimensões/peso taxável para conferir a densidade',
    )

    // ── AW6-01 — Prepaid × Collect coerente com o Incoterm ───────────────────
    const paymentType = valorCampo(awb.mapa, [
      'charges.internationalFreight.paymentType',
      'paymentType',
      'freightPaymentType',
    ])
    if (paymentType && incotermEfetivo) {
      const pagamentoNorm = normalizarTexto(paymentType)
      const sigla = normalizarTexto(incotermEfetivo).split(' ')[0] ?? ''
      const grupo = sigla.charAt(0)
      const esperadoPrepaid = grupo === 'C' || grupo === 'D'
      const esperadoCollect = grupo === 'E' || grupo === 'F'
      const ehPrepaid = pagamentoNorm.includes('PREPAID') || pagamentoNorm === 'PP'
      const ehCollect = pagamentoNorm.includes('COLLECT') || pagamentoNorm === 'CC'
      const divergente = (esperadoPrepaid && ehCollect) || (esperadoCollect && ehPrepaid)
      registrar(
        'AW6-01',
        r,
        !divergente,
        divergente
          ? `Frete ${paymentType} incoerente com Incoterm ${sigla} (grupo ${grupo} → ${esperadoPrepaid ? 'prepaid' : 'collect'})`
          : `Frete ${paymentType} coerente com o Incoterm ${sigla}`,
      )
      if (divergente) {
        falhar({
          regraId: 'AW6-01',
          doc: awb,
          titulo: 'Prepaid/Collect incoerente com o Incoterm',
          motivo: `O AWB indica frete ${paymentType}, mas o Incoterm ${sigla} (grupo ${grupo}) espera ${esperadoPrepaid ? 'prepaid' : 'collect'}.`,
          analise:
            'Incoterms dos grupos C/D implicam frete pago na origem (prepaid) e E/F frete a pagar (collect) — divergência é red flag de valoração (Incoterms® 2020; AVA-GATT art. 8º, 2).',
          campo: 'charges.internationalFreight.paymentType',
          valor: paymentType,
        })
      }
    } else {
      registrar(
        'AW6-01',
        r,
        true,
        'N/A — indicador PP/CC e/ou Incoterm não identificados para o cruzamento',
      )
    }

    // ── AW6-03 — Moeda em ISO 4217 (condicional) ─────────────────────────────
    const moedaAwb = valorCampo(awb.mapa, ['charges.internationalFreight.currency', 'currency'])
    if (moedaAwb) {
      const moedaNorm = moedaAwb.trim().toUpperCase()
      const iso = /^[A-Z]{3}$/.test(moedaNorm)
      const moedaInvoice = invoicePrincipal
        ? valorCampo(invoicePrincipal.mapa, ['currency', 'totals.currency'])
        : null
      let detalheMoeda = iso
        ? `Moeda ${moedaNorm} no padrão ISO 4217`
        : `Moeda «${moedaAwb}» fora do padrão ISO 4217`
      let moedaOk = iso
      if (iso && moedaInvoice && moedaInvoice.trim().toUpperCase() !== moedaNorm) {
        moedaOk = false
        detalheMoeda = `Moeda do AWB (${moedaNorm}) diferente da moeda da invoice (${moedaInvoice.trim().toUpperCase()})`
      }
      registrar('AW6-03', r, moedaOk, detalheMoeda)
      if (!moedaOk) {
        falhar({
          regraId: 'AW6-03',
          doc: awb,
          titulo: 'Moeda do AWB inconsistente',
          motivo: detalheMoeda,
          analise:
            'A moeda do frete deve estar em ISO 4217 e coerente com a invoice quando o frete também consta lá — base da conversão cambial (RA art. 97).',
          campo: 'charges.internationalFreight.currency',
          valor: moedaAwb,
          status: 'amarelo',
        })
      }
    } else {
      registrar('AW6-03', r, true, 'N/A — moeda não impressa no AWB (regra condicional)')
    }

    // ── AW7-03 — Validação pré-DUIMP (conferência dos dados do CCT) ──────────
    const pendenciasCct = [
      pesoBruto === null || pesoBruto <= 0 ? 'peso' : null,
      !consignee && !cnpjAwb ? 'consignatário' : null,
    ].filter((p): p is string => !!p)
    registrar(
      'AW7-03',
      r,
      pendenciasCct.length === 0,
      pendenciasCct.length === 0
        ? 'Dados essenciais do CCT presentes (peso e consignatário) — retificação de chegada só em 15 min; RUC até a recepção'
        : `Dados do CCT incompletos antes da DUIMP: ${pendenciasCct.join(', ')}`,
    )
    if (pendenciasCct.length > 0) {
      falhar({
        regraId: 'AW7-03',
        doc: awb,
        titulo: 'Dados do CCT incompletos antes da DUIMP',
        motivo: `Faltam dados essenciais para a conferência pré-DUIMP: ${pendenciasCct.join(', ')}.`,
        analise:
          'Peso, consignatário, RUC e frete devem estar conferidos antes da DUIMP — a retificação de chegada só é possível em 15 min e a RUC até a recepção (Portal Único/DUIMP; Manual CCT Aéreo).',
        campo: 'awbInfo',
        status: 'amarelo',
      })
    }

    // ── AW9-04 — Risco de penalidade e bloqueio (consolidação) ───────────────
    const falhasDoAwb = riscos.filter((risco) =>
      risco.evidencias.some((e) => e.documento === r),
    )
    const gatesDoAwb = falhasDoAwb.filter((risco) => {
      const regra = risco.id_regra_matriz ? regraMatrizAwbPorId(risco.id_regra_matriz) : undefined
      return regra?.severidade === 'bloq' && risco.status_matriz === 'vermelho'
    })
    registrar(
      'AW9-04',
      r,
      gatesDoAwb.length === 0,
      gatesDoAwb.length === 0
        ? `Sem gate disparado pelo motor de código — exposição base: multa R$ 5.000 por informação fora de prazo (DL 37/66 art. 107, IV)`
        : `${gatesDoAwb.length} gate(s) do motor de código disparado(s) — exposição a multa R$ 5.000/ocorrência, bloqueio automático e armazenagem`,
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
