/**
 * passo-1-validacao-codigo-packing-list-smart-read.ts — motor Código + Cross-Doc da matriz PL (P1–P9).
 *
 * Regras determinísticas do packing list e cruzamentos com a invoice/BL da mesma leitura.
 * Regras semânticas (motor IA/RAG) ficam no Analista LLM (prompt-analista-packing-list).
 */

import {
  regraMatrizPackingListPorId,
  type RegraMatrizPackingList,
} from './matriz-validacao-packing-list-smart-read.js'
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

type ItemPackingList = {
  indice: number
  partNumber: string | null
  descricao: string | null
  quantidade: number | null
  volumes: number | null
  pesoLiquido: number | null
  pesoBruto: number | null
  cubagem: number | null
  tipoEmbalagem: string | null
}

/** Payload máximo (kg) por unidade de carga — teto conservador 40'HC (SOLAS/praxe). */
const PAYLOAD_MAXIMO_CONTAINER_KG = 28_600

/** Faixa plausível de densidade de carga geral embalada (kg/m³) — P5-08, nunca bloqueante. */
const DENSIDADE_MINIMA_KG_M3 = 8
const DENSIDADE_MAXIMA_KG_M3 = 4_000

const TOLERANCIA_CRUZAMENTO_PESO = 0.005 // 0,5% — P5-05
const TOLERANCIA_BL_AMARELO = 0.02 // 2% — P5-06
const TOLERANCIA_BL_VERMELHO = 0.05 // 5% — P5-06 (gate IN 680/06 art. 29, IV)

let contadorRiscoPl = 0

function criarRiscoPackingList(parcial: {
  regra: RegraMatrizPackingList
  severidade: RiscoAduaneiroLeitura['severidade']
  categoria: RiscoAduaneiroLeitura['categoria']
  titulo: string
  motivo: string
  analise: string
  evidencias: RiscoAduaneiroLeitura['evidencias']
  status?: 'vermelho' | 'amarelo'
}): RiscoAduaneiroLeitura {
  contadorRiscoPl += 1
  return {
    id: `risco-pl-${contadorRiscoPl}`,
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

/** Dígito verificador ISO 6346 — contêiner 4 letras + 7 dígitos. */
export function validarContainerIso6346(numero: string): boolean {
  const limpo = numero.replace(/[\s-]/g, '').toUpperCase()
  if (!/^[A-Z]{4}\d{7}$/.test(limpo)) return false
  const valores: Record<string, number> = {}
  let v = 10
  for (let c = 65; c <= 90; c += 1) {
    if (v % 11 === 0) v += 1
    valores[String.fromCharCode(c)] = v
    v += 1
  }
  let soma = 0
  for (let i = 0; i < 10; i += 1) {
    const ch = limpo[i]
    const valor = i < 4 ? valores[ch] : Number(ch)
    soma += valor * 2 ** i
  }
  return soma % 11 % 10 === Number(limpo[10])
}

function extrairContainers(doc: DocumentoLeitura): string[] {
  const bruto = doc.dados.containerNumbers
  if (Array.isArray(bruto)) {
    return bruto.map((c) => String(c).trim()).filter(Boolean)
  }
  const texto = valorCampo(doc.mapa, ['containerNumbers'])
  if (!texto) return []
  return texto
    .split(/[,;\n]/)
    .map((c) => c.trim())
    .filter((c) => /^[A-Za-z]{4}[\s-]?\d{7}$/.test(c))
}

function extrairItensPackingList(dados: Record<string, unknown>): ItemPackingList[] {
  const bruto = dados.items ?? dados.itens
  if (!Array.isArray(bruto)) return []
  return bruto.map((item, indice) => {
    const row = item as Record<string, unknown>
    const pacote =
      row.package && typeof row.package === 'object' && !Array.isArray(row.package)
        ? (row.package as Record<string, unknown>)
        : {}
    return {
      indice,
      partNumber: valorTextoComparacaoCampo(row.partNumber ?? row.sku ?? row.itemCode),
      descricao: valorTextoComparacaoCampo(
        row.productDescription ?? row.description ?? row.descricao,
      ),
      quantidade: parseNumero(
        valorTextoComparacaoCampo(row.totalProductQuantity ?? row.itemQuantity ?? row.quantity),
      ),
      volumes: parseNumero(valorTextoComparacaoCampo(pacote.unitQuantity ?? row.packages)),
      pesoLiquido: parseNumero(
        valorTextoComparacaoCampo(pacote.unitNetWeight ?? row.netWeight ?? row.totalNetWeight),
      ),
      pesoBruto: parseNumero(
        valorTextoComparacaoCampo(pacote.unitGrossWeight ?? row.grossWeight ?? row.totalGrossWeight),
      ),
      cubagem: parseNumero(
        valorTextoComparacaoCampo(pacote.totalCubicMeasurement ?? row.cubicMeasurement),
      ),
      tipoEmbalagem: valorTextoComparacaoCampo(pacote.type ?? row.packageType),
    }
  })
}

function extrairItensInvoice(dados: Record<string, unknown>) {
  const bruto = dados.items ?? dados.itens ?? dados.lineItems
  if (!Array.isArray(bruto)) return []
  return bruto.map((item, indice) => {
    const row = item as Record<string, unknown>
    return {
      indice,
      partNumber: valorTextoComparacaoCampo(row.partNumber ?? row.sku ?? row.itemCode ?? row.productCode),
      descricao: valorTextoComparacaoCampo(row.description ?? row.productDescription ?? row.descricao),
      quantidade: parseNumero(valorTextoComparacaoCampo(row.itemQuantity ?? row.quantity ?? row.qty)),
    }
  })
}

function valoresProximosRelativo(a: number, b: number, tolerancia: number): boolean {
  const base = Math.max(Math.abs(a), Math.abs(b))
  if (base === 0) return true
  return Math.abs(a - b) / base <= tolerancia
}

function formatarNumero(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

/** Prefixos NCM → anuência provável (tabela mínima embarcada — P8-04..P8-11). */
const ANUENCIAS_POR_PREFIXO_NCM: Array<{
  id_regra: string
  orgao: string
  prefixos: string[]
  exigencia: string
}> = [
  {
    id_regra: 'P8-04',
    orgao: 'ANVISA',
    prefixos: ['30', '3303', '3304', '3305', '3306', '3307', '2106', '9018', '9021', '9022'],
    exigencia: 'lote (batch) e validade (shelf life) no romaneio, quando aplicável',
  },
  {
    id_regra: 'P8-05',
    orgao: 'MAPA',
    prefixos: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '23', '3808'],
    exigencia: 'lote e origem no romaneio, quando aplicável',
  },
  {
    id_regra: 'P8-06',
    orgao: 'ANATEL',
    prefixos: ['8517', '8518', '8525', '8526', '8529', '8471'],
    exigencia: 'homologação ANATEL — modelo do equipamento é dado crítico',
  },
  {
    id_regra: 'P8-07',
    orgao: 'INMETRO',
    prefixos: ['9503', '8508', '8509', '8516', '8536', '4011', '8712'],
    exigencia: 'certificação compulsória INMETRO',
  },
  {
    id_regra: 'P8-08',
    orgao: 'Exército (PCE)',
    prefixos: ['93', '3601', '3602', '3603', '3604'],
    exigencia: 'CR/autorização do Exército para produto controlado',
  },
  {
    id_regra: 'P8-09',
    orgao: 'IBAMA',
    prefixos: ['4012', '2903', '2908', '3824', '0106', '4403'],
    exigencia: 'controle ambiental IBAMA (químicos, fauna/flora, pneus)',
  },
  {
    id_regra: 'P8-10',
    orgao: 'CNEN',
    prefixos: ['2844', '8401'],
    exigencia: 'autorização CNEN para material radioativo/nuclear',
  },
  {
    id_regra: 'P8-11',
    orgao: 'Polícia Federal',
    prefixos: ['2806', '2807', '2841', '2914', '2915', '2922', '2932', '2939'],
    exigencia: 'controle de precursores químicos (Portaria MJSP 240/2019)',
  },
]

function coletarNcmsDocumento(dados: Record<string, unknown>): string[] {
  const valores = new Set<string>()
  function visitar(no: unknown) {
    if (no == null) return
    if (Array.isArray(no)) {
      for (const item of no) visitar(item)
      return
    }
    if (typeof no === 'object') {
      for (const [chave, valor] of Object.entries(no as Record<string, unknown>)) {
        if (/ncm|hs_code|hsCode/i.test(chave)) {
          const texto = valorTextoComparacaoCampo(valor)
          if (texto) valores.add(texto.replace(/\D/g, '').slice(0, 8))
        } else if (valor != null && typeof valor === 'object') {
          visitar(valor)
        }
      }
    }
  }
  visitar(dados)
  return [...valores].filter(Boolean)
}

/** Passo 1 PL — motor Código + Cross-Doc: regras determinísticas da matriz P1–P9. */
export function executarPasso1ValidacaoCodigoPackingList(
  documentosEntrada: DocumentoAnaliseRisco[],
): { resumo: ResumoRiscosAduaneirosLeitura; contexto: ContextoAuditoriaV1Leitura } {
  contadorRiscoPl = 0
  const riscos: RiscoAduaneiroLeitura[] = []
  const regras: RegraAuditoriaV1[] = []

  const todos = coletarDocumentos(documentosEntrada)
  const packings = todos.filter((d) => d.tipo.includes('PACKING'))
  const invoices = todos.filter((d) => d.tipo.includes('INVOICE'))
  const conhecimentos = todos.filter((d) => d.tipo.includes('BL') || d.tipo.includes('AWB'))

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
    const regra = regraMatrizPackingListPorId(params.regraId)
    if (!regra) return
    const severidade =
      (params.status ?? (regra.severidade === 'bloq' ? 'vermelho' : 'amarelo')) === 'vermelho'
        ? 'critico'
        : 'atencao'
    riscos.push(
      criarRiscoPackingList({
        regra,
        severidade,
        categoria: regra.secao === 'pesos_consistencias' ? 'matematico' : 'documental',
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

  for (const pl of packings) {
    const r = pl.rotulo
    const itens = extrairItensPackingList(pl.dados)
    const containers = extrairContainers(pl)

    // ── P1-01 Identificação ─────────────────────────────────────────────────
    const numeroDocumento = valorCampo(pl.mapa, [
      'document.documentNumber',
      'document.number',
      'documentNumber',
    ])
    registrar(
      'P1-01',
      r,
      true,
      numeroDocumento
        ? `Packing list identificado — referência ${numeroDocumento}`
        : 'Packing list identificado pela extração — sem referência única impressa',
    )

    // ── P1-02 Data de emissão ───────────────────────────────────────────────
    const dataTexto = valorCampo(pl.mapa, ['document.date', 'document.documentDate', 'issueDate'])
    const data = parseData(dataTexto)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    let dataOk = !!data
    let detalheData = dataTexto ?? 'Data de emissão ausente'
    if (data) {
      if (data > hoje) {
        dataOk = false
        detalheData = `Data futura: ${dataTexto}`
      } else if ((hoje.getTime() - data.getTime()) / 86_400_000 > 180) {
        dataOk = false
        detalheData = `Data antiga (>180 dias): ${dataTexto}`
      }
    }
    const invoicePrincipal = invoices[0] ?? null
    const dataInvoice = invoicePrincipal
      ? parseData(
          valorCampo(invoicePrincipal.mapa, ['document.issueDate', 'document.date', 'issueDate']),
        )
      : null
    if (data && dataInvoice && data < dataInvoice) {
      dataOk = false
      detalheData = `Emissão do romaneio (${dataTexto}) anterior à da invoice`
    }
    registrar('P1-02', r, dataOk, detalheData)
    if (!dataOk) {
      falhar({
        regraId: 'P1-02',
        doc: pl,
        titulo: 'Data de emissão do romaneio inconsistente',
        motivo: detalheData,
        analise:
          'Data ausente, futura, antiga ou anterior à invoice compromete a coerência do conjunto instrutivo (IN 680/06 arts. 25–32).',
        campo: 'document.date',
        valor: dataTexto,
      })
    }

    // ── P1-03 Referência à invoice ──────────────────────────────────────────
    const referenciaInvoice = valorCampo(pl.mapa, [
      'document.invoiceNumber',
      'invoiceNumber',
      'additionalFields.Invoice',
    ])
    const numerosInvoices = invoices
      .map((inv) =>
        valorCampo(inv.mapa, ['document.invoiceNumber', 'invoiceNumber', 'document.number']),
      )
      .filter((n): n is string => !!n)
    if (!referenciaInvoice && numerosInvoices.length === 0) {
      registrar('P1-03', r, true, 'N/A — sem invoice na leitura e sem referência impressa no romaneio')
    } else if (!referenciaInvoice) {
      registrar('P1-03', r, false, 'Romaneio não referencia o número da invoice')
      falhar({
        regraId: 'P1-03',
        doc: pl,
        titulo: 'Romaneio sem referência à invoice',
        motivo: 'O packing list não cita o número da invoice do processo.',
        analise:
          'A vinculação romaneio ↔ invoice sustenta o conjunto instrutivo do despacho (IN 680/06 art. 18).',
        campo: 'document.invoiceNumber',
      })
    } else {
      const casa =
        numerosInvoices.length === 0 ||
        numerosInvoices.some(
          (n) => normalizarTexto(n) === normalizarTexto(referenciaInvoice),
        )
      registrar(
        'P1-03',
        r,
        casa,
        casa
          ? `Referência ${referenciaInvoice} confere com a invoice do processo`
          : `Referência ${referenciaInvoice} não casa com invoice(s): ${numerosInvoices.join(', ')}`,
      )
      if (!casa) {
        falhar({
          regraId: 'P1-03',
          doc: pl,
          titulo: 'Referência de invoice divergente no romaneio',
          motivo: `Romaneio cita «${referenciaInvoice}», mas a(s) invoice(s) da leitura têm número ${numerosInvoices.join(', ')}.`,
          analise: 'Referência divergente sugere documento de outro embarque no mesmo processo.',
          campo: 'document.invoiceNumber',
          valor: referenciaInvoice,
        })
      }
    }

    // ── P1-04 PO / Proforma (INFO) ──────────────────────────────────────────
    const poPl = valorCampo(pl.mapa, ['document.purchaseOrder', 'purchaseOrder', 'poNumber'])
    registrar(
      'P1-04',
      r,
      true,
      poPl ? `PO/Proforma citada: ${poPl}` : 'N/A — PO/Proforma não citada no romaneio',
    )

    // ── P1-05 Paginação ─────────────────────────────────────────────────────
    const paginas = valorCampo(pl.mapa, ['document.pageCount', 'document.totalPages', 'pagination.total'])
    registrar(
      'P1-05',
      r,
      true,
      paginas ? `Páginas declaradas: ${paginas}` : 'N/A — paginação ausente no documento',
    )

    // ── P2-03 CNPJ (COND) ───────────────────────────────────────────────────
    const cnpjPl = valorCampo(pl.mapa, ['importer.cnpj', 'importer.taxId'])
    if (!cnpjPl) {
      registrar('P2-03', r, true, 'N/A — CNPJ não impresso no romaneio (documento dispensa)')
    } else {
      const valido = validarCnpjBrasil(cnpjPl)
      const cnpjInvoice = invoicePrincipal
        ? valorCampo(invoicePrincipal.mapa, ['importer.cnpj', 'importer.taxId'])
        : null
      const igualInvoice =
        !cnpjInvoice || cnpjPl.replace(/\D/g, '') === cnpjInvoice.replace(/\D/g, '')
      registrar(
        'P2-03',
        r,
        valido && igualInvoice,
        !valido
          ? `CNPJ «${cnpjPl}» reprova no Módulo 11`
          : igualInvoice
            ? `CNPJ ${cnpjPl} válido e igual ao da invoice`
            : `CNPJ ${cnpjPl} difere do CNPJ da invoice (${cnpjInvoice})`,
      )
      if (!valido || !igualInvoice) {
        falhar({
          regraId: 'P2-03',
          doc: pl,
          titulo: !valido ? 'CNPJ inválido no romaneio' : 'CNPJ divergente entre romaneio e invoice',
          motivo: !valido
            ? `CNPJ «${cnpjPl}» não passa na validação Módulo 11.`
            : `CNPJ do romaneio (${cnpjPl}) difere do da invoice (${cnpjInvoice}).`,
          analise: 'CNPJ impresso divergente/inválido compromete a identificação do importador (IN RFB 2119/2022).',
          campo: 'importer.cnpj',
          valor: cnpjPl,
        })
      }
    }

    // ── P2-02 Consignee × importador da invoice ─────────────────────────────
    const nomeImportadorPl = valorCampo(pl.mapa, ['importer.name', 'consignee.name'])
    const nomeImportadorInv = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['importer.name', 'buyer.name'])
      : null
    if (!nomeImportadorPl || !nomeImportadorInv) {
      registrar(
        'P2-02',
        r,
        true,
        !nomeImportadorPl
          ? 'N/A — consignee não extraído do romaneio'
          : 'N/A — invoice sem importador extraído para cruzar',
      )
    } else {
      const coincide = tokensCoincidem(nomeImportadorPl, nomeImportadorInv)
      registrar(
        'P2-02',
        r,
        coincide,
        coincide
          ? `Consignee «${nomeImportadorPl}» coerente com a invoice`
          : `Consignee «${nomeImportadorPl}» ≠ importador da invoice «${nomeImportadorInv}»`,
      )
      if (!coincide) {
        falhar({
          regraId: 'P2-02',
          doc: pl,
          titulo: 'Consignee divergente do importador da invoice',
          motivo: `Romaneio indica «${nomeImportadorPl}»; invoice indica «${nomeImportadorInv}».`,
          analise: 'Partes divergentes entre documentos instrutivos geram exigência (IN 680/06 art. 15, I).',
          campo: 'importer.name',
          valor: nomeImportadorPl,
        })
      }
    }

    // ── P2-04 Notify (INFO) ─────────────────────────────────────────────────
    const notify = valorCampo(pl.mapa, ['notifyParty.name', 'notify.name', 'notifyParty'])
    registrar(
      'P2-04',
      r,
      true,
      notify ? `Notify party: ${notify}` : 'N/A — notify party não citado no romaneio',
    )

    // ── P2-06 Endereço do importador ────────────────────────────────────────
    const enderecoPl = valorCampo(pl.mapa, ['importer.address'])
    const enderecoInv = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['importer.address'])
      : null
    if (!enderecoPl || !enderecoInv) {
      registrar('P2-06', r, true, 'N/A — endereço ausente em um dos documentos para cruzar')
    } else {
      const coincide = tokensCoincidem(enderecoPl, enderecoInv)
      registrar(
        'P2-06',
        r,
        coincide,
        coincide ? 'Endereço do importador coerente com a invoice' : 'Endereço difere do da invoice',
      )
      if (!coincide) {
        falhar({
          regraId: 'P2-06',
          doc: pl,
          titulo: 'Endereço do importador divergente',
          motivo: 'O endereço no romaneio não coincide com o da invoice.',
          analise: 'Endereço divergente pode indicar filial distinta ou erro documental.',
          campo: 'importer.address',
          valor: enderecoPl,
        })
      }
    }

    // ── P2-07 Triangulação (INFO) ───────────────────────────────────────────
    const paisExportador = valorCampo(pl.mapa, ['exporter.country'])
    const paisOrigem = valorCampo(pl.mapa, ['document.originCountry', 'originCountry'])
    if (paisExportador && paisOrigem && !tokensCoincidem(paisExportador, paisOrigem)) {
      registrar(
        'P2-07',
        r,
        true,
        `Triangulação: exportador em ${paisExportador}, origem ${paisOrigem} — marcar para valoração/origem`,
      )
    } else {
      registrar(
        'P2-07',
        r,
        true,
        paisExportador && paisOrigem
          ? 'Exportador e origem no mesmo país — sem triangulação'
          : 'N/A — países de exportador/origem não extraídos',
      )
    }

    // ── P3-02 Contêiner ISO 6346 ────────────────────────────────────────────
    if (containers.length === 0) {
      registrar('P3-02', r, true, 'N/A — nenhum contêiner citado no romaneio')
    } else {
      const invalidos = containers.filter((c) => !validarContainerIso6346(c))
      registrar(
        'P3-02',
        r,
        invalidos.length === 0,
        invalidos.length === 0
          ? `${containers.length} contêiner(es) válidos no padrão ISO 6346`
          : `Contêiner(es) fora do ISO 6346: ${invalidos.join(', ')}`,
      )
      if (invalidos.length > 0) {
        falhar({
          regraId: 'P3-02',
          doc: pl,
          titulo: 'Contêiner fora do padrão ISO 6346',
          motivo: `Número(s) ${invalidos.join(', ')} reprovam no dígito verificador ISO 6346.`,
          analise: 'Contêiner inválido trava a vinculação da unidade de carga no CE-Mercante (IN RFB 800/2007).',
          campo: 'containerNumbers',
          valor: invalidos.join(', '),
        })
      }
    }

    // ── P3-06 Lacre (COND — FCL) ────────────────────────────────────────────
    const lacre = valorCampo(pl.mapa, ['seal', 'sealNumber', 'containers[].container_seal'])
    if (containers.length === 0) {
      registrar('P3-06', r, true, 'N/A — sem contêiner (não caracteriza FCL)')
    } else {
      registrar(
        'P3-06',
        r,
        !!lacre,
        lacre ? `Lacre informado: ${lacre}` : 'Carga em contêiner sem número de lacre no romaneio',
      )
      if (!lacre) {
        falhar({
          regraId: 'P3-06',
          doc: pl,
          titulo: 'Lacre ausente em carga FCL',
          motivo: 'O romaneio cita contêiner mas não informa número de lacre.',
          analise: 'O lacre garante a integridade da unidade de carga (IN RFB 800/2007).',
          campo: 'seal',
          status: 'amarelo',
        })
      }
    }

    // ── Totais de pesos/volumes/cubagem ─────────────────────────────────────
    const totalVolumes = parseNumero(valorCampo(pl.mapa, ['packageSummary.totalPackages']))
    const totalNet = parseNumero(valorCampo(pl.mapa, ['packageSummary.totalNetWeight']))
    const totalGross = parseNumero(valorCampo(pl.mapa, ['packageSummary.totalGrossWeight']))
    const totalCubagem = parseNumero(valorCampo(pl.mapa, ['packageSummary.totalCubicMeasurement']))

    // ── P3-07 Volumes por contêiner (dois níveis) ───────────────────────────
    registrar(
      'P3-07',
      r,
      true,
      containers.length <= 1
        ? 'N/A — carga em contêiner único ou sem contêiner'
        : totalVolumes != null
          ? `${containers.length} contêiner(es) e ${formatarNumero(totalVolumes)} volume(s) — conferir nível pallet × embalagem interna no CE`
          : `${containers.length} contêiner(es) — total de volumes não extraído para conferir`,
    )

    // ── P3-08 Modal compatível (BLOQ) ───────────────────────────────────────
    const modal = valorCampo(pl.mapa, ['shipmentDetails.transportMode', 'shipment.modal'])
    const temAeroporto = !!valorCampo(pl.mapa, [
      'shipmentDetails.origin.airport',
      'shipmentDetails.destination.airport',
    ])
    const modalNorm = modal ? normalizarTexto(modal) : null
    let contradicaoModal: string | null = null
    if (modalNorm && /AIR|AEREO/.test(modalNorm) && containers.length > 0) {
      contradicaoModal = `Modal aéreo declarado com contêiner marítimo (${containers.join(', ')})`
    } else if (modalNorm && /SEA|MARITIM|OCEAN/.test(modalNorm) && temAeroporto && containers.length === 0) {
      contradicaoModal = 'Modal marítimo declarado com aeroportos de origem/destino'
    }
    registrar(
      'P3-08',
      r,
      !contradicaoModal,
      contradicaoModal ??
        (modal ? `Modal ${modal} coerente com o equipamento citado` : 'N/A — modal não extraído'),
    )
    if (contradicaoModal) {
      falhar({
        regraId: 'P3-08',
        doc: pl,
        titulo: 'Contradição entre modal e equipamento',
        motivo: contradicaoModal,
        analise:
          'Documento de transporte incompatível com o equipamento impede a vinculação no sistema de carga do modal (IN 680/06 art. 15, VI).',
        campo: 'shipmentDetails.transportMode',
        valor: modal,
      })
    }

    // ── P3-09 VGM / payload (BLOQ) ──────────────────────────────────────────
    if (containers.length === 0 || totalGross == null) {
      registrar(
        'P3-09',
        r,
        true,
        containers.length === 0
          ? 'N/A — sem contêiner para conferir payload'
          : 'N/A — peso bruto total não extraído para conferir payload',
      )
    } else {
      const limite = containers.length * PAYLOAD_MAXIMO_CONTAINER_KG
      const dentro = totalGross <= limite
      registrar(
        'P3-09',
        r,
        dentro,
        dentro
          ? `Peso bruto ${formatarNumero(totalGross)} kg dentro do payload (${containers.length} × ${PAYLOAD_MAXIMO_CONTAINER_KG} kg)`
          : `Peso bruto ${formatarNumero(totalGross)} kg excede o payload máximo (${formatarNumero(limite)} kg)`,
      )
      if (!dentro) {
        falhar({
          regraId: 'P3-09',
          doc: pl,
          titulo: 'Peso bruto acima do payload do contêiner',
          motivo: `Total de ${formatarNumero(totalGross)} kg para ${containers.length} contêiner(es) — limite ≈ ${formatarNumero(limite)} kg.`,
          analise: 'Excesso sobre o payload viola o VGM (SOLAS Cap. VI, Reg. 2) e indica erro de peso ou unidade.',
          campo: 'packageSummary.totalGrossWeight',
          valor: String(totalGross),
        })
      }
    }

    // ── P4-01 Total de volumes ──────────────────────────────────────────────
    const volumesOk = totalVolumes != null && Number.isInteger(totalVolumes) && totalVolumes > 0
    registrar(
      'P4-01',
      r,
      volumesOk,
      totalVolumes == null
        ? 'Total de volumes não declarado no romaneio'
        : volumesOk
          ? `${formatarNumero(totalVolumes)} volume(s) declarados`
          : `Total de volumes inválido: ${formatarNumero(totalVolumes)}`,
    )
    if (!volumesOk) {
      falhar({
        regraId: 'P4-01',
        doc: pl,
        titulo: 'Total de volumes ausente ou inválido',
        motivo:
          totalVolumes == null
            ? 'O romaneio não declara o total de volumes da carga.'
            : `Total de volumes «${formatarNumero(totalVolumes)}» não é inteiro positivo.`,
        analise: 'A contagem de volumes é a função básica do romaneio (Manual RFB; IN RFB 800/2007).',
        campo: 'packageSummary.totalPackages',
        valor: totalVolumes == null ? undefined : String(totalVolumes),
      })
    }

    // ── P4-02 Numeração sequencial ──────────────────────────────────────────
    const somaVolumesItens = itens.reduce((acc, i) => acc + (i.volumes ?? 0), 0)
    registrar(
      'P4-02',
      r,
      totalVolumes == null || somaVolumesItens === 0 || somaVolumesItens === totalVolumes,
      somaVolumesItens === 0
        ? 'N/A — numeração por volume não extraída'
        : totalVolumes == null
          ? `Σ volumes por item = ${formatarNumero(somaVolumesItens)} — total geral não extraído`
          : somaVolumesItens === totalVolumes
            ? `Σ volumes por item (${formatarNumero(somaVolumesItens)}) = total declarado`
            : `Σ volumes por item (${formatarNumero(somaVolumesItens)}) ≠ total declarado (${formatarNumero(totalVolumes)})`,
    )
    if (totalVolumes != null && somaVolumesItens > 0 && somaVolumesItens !== totalVolumes) {
      falhar({
        regraId: 'P4-02',
        doc: pl,
        titulo: 'Contagem de volumes não fecha',
        motivo: `Soma dos volumes por item (${formatarNumero(somaVolumesItens)}) difere do total declarado (${formatarNumero(totalVolumes)}).`,
        analise: 'Lacuna ou duplicidade na numeração de volumes compromete a conferência física.',
        campo: 'packageSummary.totalPackages',
        valor: String(totalVolumes),
      })
    }

    // ── P4-05 Dimensões e cubagem ───────────────────────────────────────────
    const somaCubagem = itens.reduce((acc, i) => acc + (i.cubagem ?? 0), 0)
    if (totalCubagem == null && somaCubagem === 0) {
      registrar('P4-05', r, true, 'N/A — dimensões/cubagem não extraídas do romaneio')
    } else if (totalCubagem != null && somaCubagem > 0) {
      const fecha = valoresProximosRelativo(somaCubagem, totalCubagem, 0.01)
      registrar(
        'P4-05',
        r,
        fecha,
        fecha
          ? `Σ cubagem ${formatarNumero(somaCubagem)} m³ = total ${formatarNumero(totalCubagem)} m³`
          : `Σ cubagem ${formatarNumero(somaCubagem)} m³ ≠ total ${formatarNumero(totalCubagem)} m³`,
      )
      if (!fecha) {
        falhar({
          regraId: 'P4-05',
          doc: pl,
          titulo: 'Cubagem total não confere',
          motivo: `Soma das cubagens por item (${formatarNumero(somaCubagem)} m³) difere do total declarado (${formatarNumero(totalCubagem)} m³).`,
          analise: 'A cubagem alimenta o CE-Mercante — divergência gera trava de vinculação.',
          campo: 'packageSummary.totalCubicMeasurement',
          valor: String(totalCubagem),
        })
      }
    } else {
      registrar(
        'P4-05',
        r,
        true,
        totalCubagem != null
          ? `Cubagem total declarada: ${formatarNumero(totalCubagem)} m³`
          : `Cubagem somada dos itens: ${formatarNumero(somaCubagem)} m³`,
      )
    }

    // ── P4-06 Invoice × Packing — volumes ───────────────────────────────────
    const volumesInvoice = invoicePrincipal
      ? parseNumero(
          valorCampo(invoicePrincipal.mapa, [
            'packageSummary.totalPackages',
            'packages.count',
            'packages.total',
            'document.packageCount',
          ]),
        )
      : null
    if (totalVolumes == null || volumesInvoice == null) {
      registrar('P4-06', r, true, 'N/A — total de volumes ausente em um dos documentos para cruzar')
    } else {
      const iguais = totalVolumes === volumesInvoice
      registrar(
        'P4-06',
        r,
        iguais,
        iguais
          ? `Volumes conferem com a invoice (${formatarNumero(totalVolumes)})`
          : `Volumes do romaneio (${formatarNumero(totalVolumes)}) ≠ invoice (${formatarNumero(volumesInvoice)})`,
      )
      if (!iguais) {
        falhar({
          regraId: 'P4-06',
          doc: pl,
          titulo: 'Volumes divergentes entre romaneio e invoice',
          motivo: `Romaneio declara ${formatarNumero(totalVolumes)} volume(s); invoice declara ${formatarNumero(volumesInvoice)}.`,
          analise: 'Divergência de volumes entre documentos da mesma operação gera exigência (IN 680/06 art. 18).',
          campo: 'packageSummary.totalPackages',
          valor: String(totalVolumes),
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'packages.count', valor: String(volumesInvoice) }]
            : [],
        })
      }
    }

    // ── P4-08 Consistência de unidades (BLOQ) ───────────────────────────────
    const textoDocumento = JSON.stringify(pl.dados).toUpperCase()
    const temLbs = /\bLBS?\b/.test(textoDocumento)
    const temKg = /\bKGS?\b/.test(textoDocumento)
    const temCft = /\bCFT\b|\bCU\.?FT\b/.test(textoDocumento)
    const temM3 = /\bM3\b|\bM³\b|\bCBM\b/.test(textoDocumento)
    const misturaPeso = temLbs && temKg
    const misturaVolume = temCft && temM3
    registrar(
      'P4-08',
      r,
      !misturaPeso && !misturaVolume,
      misturaPeso || misturaVolume
        ? `Mistura de sistemas de unidades no documento: ${[misturaPeso ? 'kg × lbs' : null, misturaVolume ? 'm³ × cft' : null].filter(Boolean).join(' e ')}`
        : 'Sistema de unidades consistente no documento',
    )
    if (misturaPeso || misturaVolume) {
      falhar({
        regraId: 'P4-08',
        doc: pl,
        titulo: 'Mistura de sistemas de unidades',
        motivo: 'O romaneio mistura unidades métricas e imperiais (kg × lbs ou m³ × cft).',
        analise:
          'Conversão não declarada (fatores ~2,20 lb/kg ou ~35,3 cft/m³) é fonte clássica de divergência de peso (art. 725 RA).',
        campo: 'packageSummary.totalGrossWeight',
      })
    }

    // ── P5-01 / P5-02 Pesos declarados ──────────────────────────────────────
    const netItens = itens.reduce((acc, i) => acc + (i.pesoLiquido ?? 0) * (i.volumes ?? 1), 0)
    const grossItens = itens.reduce((acc, i) => acc + (i.pesoBruto ?? 0) * (i.volumes ?? 1), 0)
    const temNet = (totalNet != null && totalNet > 0) || netItens > 0
    const temGross = (totalGross != null && totalGross > 0) || grossItens > 0
    registrar(
      'P5-01',
      r,
      temNet,
      temNet
        ? `Peso líquido: ${formatarNumero(totalNet ?? netItens)} kg`
        : 'Peso líquido não declarado no romaneio',
    )
    if (!temNet) {
      falhar({
        regraId: 'P5-01',
        doc: pl,
        titulo: 'Peso líquido ausente',
        motivo: 'O romaneio não declara peso líquido total nem por item.',
        analise:
          'A ausência de net weight por item já fundamentou pena de perdimento (jurisprudência TRF3).',
        campo: 'packageSummary.totalNetWeight',
      })
    }
    registrar(
      'P5-02',
      r,
      temGross,
      temGross
        ? `Peso bruto: ${formatarNumero(totalGross ?? grossItens)} kg`
        : 'Peso bruto não declarado no romaneio',
    )
    if (!temGross) {
      falhar({
        regraId: 'P5-02',
        doc: pl,
        titulo: 'Peso bruto ausente',
        motivo: 'O romaneio não declara peso bruto total nem por volume.',
        analise: 'O peso bruto é dado obrigatório da unidade de carga (IN RFB 800/2007).',
        campo: 'packageSummary.totalGrossWeight',
      })
    }

    // ── P5-03 Gross ≥ Net (BLOQ) ────────────────────────────────────────────
    const netRef = totalNet ?? (netItens > 0 ? netItens : null)
    const grossRef = totalGross ?? (grossItens > 0 ? grossItens : null)
    if (netRef == null || grossRef == null) {
      registrar('P5-03', r, true, 'N/A — pesos bruto/líquido incompletos para comparar')
    } else {
      const ok = grossRef >= netRef
      registrar(
        'P5-03',
        r,
        ok,
        ok
          ? `Bruto ${formatarNumero(grossRef)} kg ≥ líquido ${formatarNumero(netRef)} kg (tara ${formatarNumero(grossRef - netRef)} kg)`
          : `Bruto ${formatarNumero(grossRef)} kg < líquido ${formatarNumero(netRef)} kg`,
      )
      if (!ok) {
        falhar({
          regraId: 'P5-03',
          doc: pl,
          titulo: 'Peso bruto menor que o líquido',
          motivo: `Gross ${formatarNumero(grossRef)} kg < Net ${formatarNumero(netRef)} kg — fisicamente impossível.`,
          analise: 'O peso bruto inclui a embalagem e deve ser ≥ ao líquido em cada volume e no total.',
          campo: 'packageSummary.totalGrossWeight',
          valor: `${formatarNumero(grossRef)} vs ${formatarNumero(netRef)}`,
        })
      }
    }

    // ── P5-04 Fechamento matemático ─────────────────────────────────────────
    if (grossItens > 0 && totalGross != null) {
      const fecha = valoresProximosRelativo(grossItens, totalGross, 0.01)
      registrar(
        'P5-04',
        r,
        fecha,
        fecha
          ? `Σ pesos por item ${formatarNumero(grossItens)} kg = total ${formatarNumero(totalGross)} kg`
          : `Σ pesos por item ${formatarNumero(grossItens)} kg ≠ total ${formatarNumero(totalGross)} kg`,
      )
      if (!fecha) {
        falhar({
          regraId: 'P5-04',
          doc: pl,
          titulo: 'Fechamento de pesos não confere',
          motivo: `A soma dos pesos por item (${formatarNumero(grossItens)} kg) difere do total declarado (${formatarNumero(totalGross)} kg).`,
          analise: 'Erro aritmético no romaneio caracteriza inexatidão documental (art. 725 RA).',
          campo: 'packageSummary.totalGrossWeight',
          valor: String(totalGross),
        })
      }
    } else {
      registrar('P5-04', r, true, 'N/A — sem pesos por item e total simultâneos para somar')
    }

    // ── P5-05 Invoice × Packing — pesos ─────────────────────────────────────
    const grossInvoice = invoicePrincipal
      ? parseNumero(
          valorCampo(invoicePrincipal.mapa, [
            'weights.grossWeight',
            'grossWeight',
            'totalGrossWeight',
            'packageSummary.totalGrossWeight',
          ]),
        )
      : null
    const netInvoice = invoicePrincipal
      ? parseNumero(
          valorCampo(invoicePrincipal.mapa, [
            'weights.netWeight',
            'netWeight',
            'totalNetWeight',
            'packageSummary.totalNetWeight',
          ]),
        )
      : null
    if ((grossRef == null || grossInvoice == null) && (netRef == null || netInvoice == null)) {
      registrar('P5-05', r, true, 'N/A — pesos ausentes na invoice ou no romaneio para cruzar')
    } else {
      const divergencias: string[] = []
      if (grossRef != null && grossInvoice != null && !valoresProximosRelativo(grossRef, grossInvoice, TOLERANCIA_CRUZAMENTO_PESO)) {
        divergencias.push(`bruto ${formatarNumero(grossRef)} kg ≠ ${formatarNumero(grossInvoice)} kg`)
      }
      if (netRef != null && netInvoice != null && !valoresProximosRelativo(netRef, netInvoice, TOLERANCIA_CRUZAMENTO_PESO)) {
        divergencias.push(`líquido ${formatarNumero(netRef)} kg ≠ ${formatarNumero(netInvoice)} kg`)
      }
      registrar(
        'P5-05',
        r,
        divergencias.length === 0,
        divergencias.length === 0
          ? 'Pesos conferem com a invoice (tolerância 0,5%)'
          : `Pesos divergentes da invoice: ${divergencias.join('; ')}`,
      )
      if (divergencias.length > 0) {
        falhar({
          regraId: 'P5-05',
          doc: pl,
          titulo: 'Pesos divergentes entre romaneio e invoice',
          motivo: `Divergência acima de 0,5%: ${divergencias.join('; ')}.`,
          analise: 'Pesos incoerentes entre documentos instrutivos geram exigência (IN 680/06 art. 18).',
          campo: 'packageSummary.totalGrossWeight',
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'weights.grossWeight', valor: grossInvoice != null ? String(grossInvoice) : undefined }]
            : [],
        })
      }
    }

    // ── P5-06 Conhecimento × Packing — 5% (BLOQ) ────────────────────────────
    const conhecimento = conhecimentos[0] ?? null
    const grossBl = conhecimento
      ? parseNumero(
          valorCampo(conhecimento.mapa, [
            'weights.grossWeight',
            'grossWeight',
            'totalGrossWeight',
            'containers[].container_gross_weight',
          ]),
        )
      : null
    if (!conhecimento || grossBl == null || grossRef == null) {
      registrar(
        'P5-06',
        r,
        true,
        !conhecimento
          ? 'N/A — conhecimento (BL/AWB) não presente na leitura para cruzar'
          : 'N/A — peso bruto ausente no conhecimento ou no romaneio',
      )
    } else {
      const desvio = Math.abs(grossRef - grossBl) / Math.max(grossBl, 1)
      const status = desvio > TOLERANCIA_BL_VERMELHO ? 'vermelho' : desvio >= TOLERANCIA_BL_AMARELO ? 'amarelo' : 'verde'
      registrar(
        'P5-06',
        r,
        status === 'verde',
        status === 'verde'
          ? `Peso bruto coerente com o conhecimento (desvio ${(desvio * 100).toFixed(1)}%)`
          : `Desvio de ${(desvio * 100).toFixed(1)}% entre romaneio (${formatarNumero(grossRef)} kg) e conhecimento (${formatarNumero(grossBl)} kg)`,
      )
      if (status !== 'verde') {
        falhar({
          regraId: 'P5-06',
          doc: pl,
          titulo: 'Peso divergente do conhecimento de embarque',
          motivo: `Romaneio ${formatarNumero(grossRef)} kg × conhecimento ${formatarNumero(grossBl)} kg — desvio ${(desvio * 100).toFixed(1)}%.`,
          analise:
            desvio > TOLERANCIA_BL_VERMELHO
              ? 'Desvio acima do teto de 5% da IN 680/06 art. 29, IV — gate de bloqueio.'
              : 'Desvio entre 2% e 5% — revisar antes do registro.',
          campo: 'packageSummary.totalGrossWeight',
          valor: String(grossRef),
          status,
          evidenciasExtras: [
            { documento: conhecimento.rotulo, campo: 'weights.grossWeight', valor: String(grossBl) },
          ],
        })
      }
    }

    // ── P5-08 Densidade plausível (Código + RAG — nunca bloqueante) ─────────
    const cubagemRef = totalCubagem ?? (somaCubagem > 0 ? somaCubagem : null)
    if (grossRef == null || cubagemRef == null || cubagemRef === 0) {
      registrar('P5-08', r, true, 'N/A — peso ou cubagem ausentes para calcular densidade')
    } else {
      const densidade = grossRef / cubagemRef
      const plausivel = densidade >= DENSIDADE_MINIMA_KG_M3 && densidade <= DENSIDADE_MAXIMA_KG_M3
      registrar(
        'P5-08',
        r,
        plausivel,
        plausivel
          ? `Densidade ${formatarNumero(densidade)} kg/m³ dentro da faixa plausível`
          : `Densidade ${formatarNumero(densidade)} kg/m³ fora da faixa plausível (${DENSIDADE_MINIMA_KG_M3}–${DENSIDADE_MAXIMA_KG_M3} kg/m³)`,
      )
      if (!plausivel) {
        falhar({
          regraId: 'P5-08',
          doc: pl,
          titulo: 'Densidade da carga fisicamente improvável',
          motivo: `${formatarNumero(grossRef)} kg em ${formatarNumero(cubagemRef)} m³ = ${formatarNumero(densidade)} kg/m³.`,
          analise:
            'Densidade fora da faixa plausível costuma indicar erro de extração ou unidade — cargas legítimas de baixa densidade existem (EPS, plásticos ocos), por isso a regra nunca bloqueia.',
          campo: 'packageSummary.totalCubicMeasurement',
          valor: String(cubagemRef),
          status: 'amarelo',
        })
      }
    }

    // ── P6-02 / P6-03 / P6-04 / P7-08 — itens × invoice ─────────────────────
    const itensInvoice = invoicePrincipal ? extrairItensInvoice(invoicePrincipal.dados) : []
    const pnsPl = itens.map((i) => i.partNumber).filter((p): p is string => !!p)
    const pnsInvoice = itensInvoice.map((i) => i.partNumber).filter((p): p is string => !!p)

    if (pnsInvoice.length === 0) {
      registrar('P6-02', r, true, 'N/A — invoice sem part numbers para cruzar')
    } else if (pnsPl.length === 0) {
      registrar('P6-02', r, false, 'Invoice traz part numbers, mas o romaneio não os repete')
      falhar({
        regraId: 'P6-02',
        doc: pl,
        titulo: 'Part numbers ausentes no romaneio',
        motivo: 'A invoice identifica os itens por part number e o romaneio não os traz.',
        analise: 'Sem PN não há amarração item a item entre romaneio e invoice.',
        campo: 'items[].partNumber',
        status: 'amarelo',
      })
    } else {
      const setPl = new Set(pnsPl.map(normalizarTexto))
      const setInv = new Set(pnsInvoice.map(normalizarTexto))
      const faltamNoPl = [...setInv].filter((p) => !setPl.has(p))
      const sobramNoPl = [...setPl].filter((p) => !setInv.has(p))
      registrar(
        'P6-02',
        r,
        faltamNoPl.length === 0 && sobramNoPl.length === 0,
        faltamNoPl.length === 0 && sobramNoPl.length === 0
          ? `${setPl.size} part number(s) casam com a invoice`
          : `PNs sem par: ${[...faltamNoPl, ...sobramNoPl].slice(0, 5).join(', ')}`,
      )

      // P6-04 — itens ausentes (BLOQ)
      registrar(
        'P6-04',
        r,
        faltamNoPl.length === 0 && sobramNoPl.length === 0,
        faltamNoPl.length === 0 && sobramNoPl.length === 0
          ? 'Nenhum item ausente entre romaneio e invoice'
          : `${faltamNoPl.length} item(ns) da invoice ausentes no romaneio; ${sobramNoPl.length} sem par na invoice`,
      )
      if (faltamNoPl.length > 0 || sobramNoPl.length > 0) {
        falhar({
          regraId: 'P6-04',
          doc: pl,
          titulo: 'Itens ausentes entre romaneio e invoice',
          motivo: `Sem correspondência: ${[...faltamNoPl, ...sobramNoPl].slice(0, 8).join(', ')}.`,
          analise:
            'Item presente em um documento e ausente no outro caracteriza mercadoria não manifestada — risco de perdimento (RA arts. 689/725).',
          campo: 'items[].partNumber',
        })
      }

      // P6-03 — quantidades por item (BLOQ)
      const divergentes: string[] = []
      for (const itemInv of itensInvoice) {
        if (!itemInv.partNumber || itemInv.quantidade == null) continue
        const pares = itens.filter(
          (i) => i.partNumber && normalizarTexto(i.partNumber) === normalizarTexto(itemInv.partNumber ?? ''),
        )
        if (pares.length === 0) continue
        const somaPl = pares.reduce((acc, i) => acc + (i.quantidade ?? 0), 0)
        if (somaPl > 0 && somaPl !== itemInv.quantidade) {
          divergentes.push(
            `${itemInv.partNumber}: PL ${formatarNumero(somaPl)} × invoice ${formatarNumero(itemInv.quantidade)}`,
          )
        }
      }
      registrar(
        'P6-03',
        r,
        divergentes.length === 0,
        divergentes.length === 0
          ? 'Quantidades por item conferem com a invoice'
          : `Quantidades divergentes: ${divergentes.slice(0, 5).join('; ')}`,
      )
      if (divergentes.length > 0) {
        falhar({
          regraId: 'P6-03',
          doc: pl,
          titulo: 'Quantidade por item divergente da invoice',
          motivo: divergentes.slice(0, 8).join('; '),
          analise:
            'Σ quantidades por item no romaneio deve fechar com a linha da invoice (IN 680/06 arts. 5º, §1º e 18; art. 725 RA).',
          campo: 'items[].totalProductQuantity',
        })
      }

      // P7-08 — mesmo item (descrição) com PN diferente (BLOQ)
      const conflitosPn: string[] = []
      for (const itemInv of itensInvoice) {
        if (!itemInv.descricao || !itemInv.partNumber) continue
        const mesmoDesc = itens.find(
          (i) =>
            i.descricao &&
            i.partNumber &&
            normalizarTexto(i.descricao) === normalizarTexto(itemInv.descricao ?? '') &&
            normalizarTexto(i.partNumber) !== normalizarTexto(itemInv.partNumber ?? ''),
        )
        if (mesmoDesc?.partNumber) {
          conflitosPn.push(`«${itemInv.descricao.slice(0, 60)}»: ${itemInv.partNumber} × ${mesmoDesc.partNumber}`)
        }
      }
      registrar(
        'P7-08',
        r,
        conflitosPn.length === 0,
        conflitosPn.length === 0
          ? 'Sem conflito de part number para o mesmo item'
          : `PNs conflitantes: ${conflitosPn.slice(0, 3).join('; ')}`,
      )
      if (conflitosPn.length > 0) {
        falhar({
          regraId: 'P7-08',
          doc: pl,
          titulo: 'Part number conflitante para o mesmo item',
          motivo: conflitosPn.slice(0, 5).join('; '),
          analise: 'O mesmo item com PNs distintos quebra a rastreabilidade e o catálogo DUIMP (art. 725 RA).',
          campo: 'items[].partNumber',
        })
      }
    }

    // ── P6-05 Valores indevidos (COND) ──────────────────────────────────────
    const textoValores = valorCampo(pl.mapa, ['items[].unitPrice', 'items[].totalPrice', 'values.totalDocumentValue'])
    registrar(
      'P6-05',
      r,
      true,
      textoValores
        ? `Romaneio traz valores comerciais (${textoValores}) — conferir coincidência com a invoice`
        : 'N/A — romaneio sem valores comerciais (dispensados no documento)',
    )

    // ── P6-06 País de origem (COND) ─────────────────────────────────────────
    const origemInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['document.originCountry', 'originCountry'])
      : null
    if (!paisOrigem) {
      registrar('P6-06', r, true, 'N/A — país de origem não citado no romaneio')
    } else if (origemInvoice && !tokensCoincidem(paisOrigem, origemInvoice)) {
      registrar('P6-06', r, false, `Origem ${paisOrigem} ≠ origem da invoice (${origemInvoice})`)
      falhar({
        regraId: 'P6-06',
        doc: pl,
        titulo: 'País de origem divergente da invoice',
        motivo: `Romaneio indica origem «${paisOrigem}»; invoice indica «${origemInvoice}».`,
        analise:
          'Origem ≠ procedência ≠ aquisição (RA arts. 15–16) — cruzar com a análise de triangulação antes do registro.',
        campo: 'document.originCountry',
        valor: paisOrigem,
        status: 'amarelo',
      })
    } else {
      registrar('P6-06', r, true, `País de origem: ${paisOrigem}`)
    }

    // ── P8-04..P8-11 Anuências por NCM (Cross-Doc + tabela) ────────────────
    const ncms = [
      ...new Set([
        ...coletarNcmsDocumento(pl.dados),
        ...(invoicePrincipal ? coletarNcmsDocumento(invoicePrincipal.dados) : []),
      ]),
    ]
    for (const anuencia of ANUENCIAS_POR_PREFIXO_NCM) {
      const disparados = ncms.filter((ncm) =>
        anuencia.prefixos.some((prefixo) => ncm.startsWith(prefixo)),
      )
      if (disparados.length === 0) {
        registrar(anuencia.id_regra, r, true, `N/A — nenhum NCM sujeito a ${anuencia.orgao} na operação`)
        continue
      }
      registrar(
        anuencia.id_regra,
        r,
        false,
        `Aviso — NCM ${disparados.join(', ')} sujeito a ${anuencia.orgao}: verificar ${anuencia.exigencia}`,
      )
    }

    // ── P8-12 Carga perigosa (BLOQ condicionada) ────────────────────────────
    const matchUn = textoDocumento.match(/\bUN[\s-]?(\d{4})\b/)
    const temClasseRisco = /\b(CLASS|CLASSE)\s*[1-9]\b|\bPACKING\s+GROUP\b|\bPG\s*(I{1,3})\b/.test(textoDocumento)
    if (!matchUn && !temClasseRisco) {
      registrar('P8-12', r, true, 'N/A — nenhum indício de carga perigosa (UN/classe) no documento')
    } else if (matchUn && temClasseRisco) {
      registrar('P8-12', r, true, `Carga perigosa documentada — UN ${matchUn[1]} com classe/packing group`)
    } else {
      registrar(
        'P8-12',
        r,
        false,
        matchUn
          ? `UN ${matchUn[1]} citado sem classe de risco/packing group no romaneio`
          : 'Indício de carga perigosa sem UN number no romaneio',
      )
      falhar({
        regraId: 'P8-12',
        doc: pl,
        titulo: 'Carga perigosa com dados incompletos',
        motivo: matchUn
          ? `O documento cita UN ${matchUn[1]} sem classe de risco ou packing group.`
          : 'Há indício de carga perigosa sem o UN number correspondente.',
        analise:
          'DG exige UN number, classe de risco e packing group no romaneio ou referência à DGD (IMDG/IATA DGR).',
        campo: 'observations',
      })
    }

    // ── P9-03 Aplicabilidade / P9-04 Risco de multa ─────────────────────────
    registrar(
      'P9-03',
      r,
      true,
      'Carga embalada com romaneio presente — checklist aplicável',
    )
    registrar(
      'P9-04',
      r,
      true,
      'Romaneio presente na leitura — multa do RA art. 728, VIII, «e» não aplicável',
    )
  }

  // ── P1-06 Packing duplicado no processo (BLOQ, entre PLs) ─────────────────
  if (packings.length > 1) {
    const porReferencia = new Map<string, DocumentoLeitura[]>()
    for (const pl of packings) {
      const ref =
        valorCampo(pl.mapa, ['document.invoiceNumber', 'invoiceNumber', 'document.documentNumber', 'document.number']) ??
        '(sem referência)'
      const chave = normalizarTexto(ref)
      porReferencia.set(chave, [...(porReferencia.get(chave) ?? []), pl])
    }
    for (const [, grupo] of porReferencia) {
      if (grupo.length < 2) continue
      const pesos = grupo.map((pl) =>
        parseNumero(valorCampo(pl.mapa, ['packageSummary.totalGrossWeight'])),
      )
      const divergem =
        pesos.some((p) => p != null) &&
        new Set(pesos.filter((p): p is number => p != null).map((p) => p.toFixed(1))).size > 1
      for (const pl of grupo) {
        registrar(
          'P1-06',
          pl.rotulo,
          !divergem,
          divergem
            ? `Dois romaneios para a mesma referência com pesos divergentes (${pesos.map((p) => (p == null ? '—' : formatarNumero(p))).join(' × ')} kg)`
            : 'Mais de um romaneio para a mesma referência — dados coincidem',
        )
        if (divergem) {
          falhar({
            regraId: 'P1-06',
            doc: pl,
            titulo: 'Romaneios conflitantes para a mesma invoice',
            motivo: 'Há dois packing lists vinculados à mesma referência com totais divergentes.',
            analise:
              'Revisão de fornecedor sem cancelamento do documento anterior — instruir o despacho com o documento superado gera declaração inexata (RA art. 725).',
            campo: 'document.invoiceNumber',
          })
        }
      }
    }
  } else {
    for (const pl of packings) {
      registrar('P1-06', pl.rotulo, true, 'Romaneio único no processo — sem conflito de versão')
    }
  }

  return {
    resumo: {
      riscos,
      total: riscos.length,
      criticos: riscos.filter((x) => x.severidade === 'critico').length,
      atencao: riscos.filter((x) => x.severidade === 'atencao').length,
      informativos: riscos.filter((x) => x.severidade === 'informativo').length,
    },
    contexto: {
      regras,
      ncms_encontrados: [],
      tributos_ncm: [],
    },
  }
}
