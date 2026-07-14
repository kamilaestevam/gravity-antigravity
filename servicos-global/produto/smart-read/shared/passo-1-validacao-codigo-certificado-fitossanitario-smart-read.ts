/**
 * passo-1-validacao-codigo-certificado-fitossanitario-smart-read.ts — motor Código + Cross-Doc da matriz CF (CF1–CF9).
 */

import {
  regraMatrizCertificadoFitossanitarioPorId,
  type RegraMatrizCertificadoFitossanitario,
} from './matriz-validacao-certificado-fitossanitario-smart-read.js'
import type {
  ContextoAuditoriaV1Leitura,
  DocumentoAnaliseRisco,
  RegraAuditoriaV1,
  ResumoRiscosAduaneirosLeitura,
  RiscoAduaneiroLeitura,
} from './analise-riscos-leitura-smart-read.js'
import {
  achatarCamposDadosLeitura,
  valorTextoComparacaoCampo,
} from './analise-riscos-leitura-smart-read.js'
import { ehTipoCertificadoOrigem } from './passo-1-validacao-codigo-certificado-origem-smart-read.js'

type DocumentoLeitura = {
  rotulo: string
  tipo: string
  mapa: Map<string, unknown>
  dados: Record<string, unknown>
}

const CAMPOS_OBRIGATORIOS_NIMF12: Array<{ rotulo: string; caminhos: string[] }> = [
  { rotulo: 'número do certificado', caminhos: ['document.phytosanitaryCertificateNumber', 'phytosanitaryCertificateNumber', 'document.certificateNumber', 'certificateNumber'] },
  { rotulo: 'data de emissão', caminhos: ['document.issueDate', 'issueDate', 'document.date'] },
  { rotulo: 'país de origem', caminhos: ['countryOfOrigin', 'originCountry', 'goods.countryOfOrigin', 'country.origin'] },
  { rotulo: 'nome botânico', caminhos: ['botanicalName', 'goods.botanicalName', 'scientificName', 'goods.scientificName'] },
  { rotulo: 'descrição da mercadoria', caminhos: ['goods.description', 'merchandise.description', 'description', 'goods.name'] },
  { rotulo: 'quantidade', caminhos: ['goods.quantity', 'quantity', 'goods.totalQuantity'] },
  { rotulo: 'organismo emissor (ONPF)', caminhos: ['issuingAuthority', 'npqo.name', 'authority.name', 'issuingOrganization'] },
]

let contadorRiscoCf = 0

function criarRiscoCf(parcial: {
  regra: RegraMatrizCertificadoFitossanitario
  severidade: RiscoAduaneiroLeitura['severidade']
  categoria: RiscoAduaneiroLeitura['categoria']
  titulo: string
  motivo: string
  analise: string
  evidencias: RiscoAduaneiroLeitura['evidencias']
  status?: 'vermelho' | 'amarelo'
}): RiscoAduaneiroLeitura {
  contadorRiscoCf += 1
  return {
    id: `risco-cf-${contadorRiscoCf}`,
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

export function ehTipoCertificadoFitossanitario(tipo: string): boolean {
  const norm = tipo.toUpperCase()
  if (norm.includes('CERTIFICATE OF ORIGIN') || norm.includes('CERTIFICADO DE ORIGEM')) return false
  return (
    norm.includes('PHYTOSANITARY') ||
    norm.includes('FITOSSANIT') ||
    norm.includes('FITOSANIT') ||
    norm.includes('NIMF 12') ||
    norm.includes('NIMF12') ||
    /\bCFI\b/.test(norm) ||
    /\bCFR\b/.test(norm)
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

function tokensCoincidem(a: string, b: string): boolean {
  const tokensA = new Set(normalizarTexto(a).split(' ').filter((t) => t.length >= 3))
  const tokensB = new Set(normalizarTexto(b).split(' ').filter((t) => t.length >= 3))
  if (tokensA.size === 0 || tokensB.size === 0) return true
  for (const t of tokensA) if (tokensB.has(t)) return true
  return false
}

function normalizarNcm(ncm: string): string {
  return ncm.replace(/\D/g, '').slice(0, 8)
}

function ncmCompativel(a: string, b: string): boolean {
  const na = normalizarNcm(a)
  const nb = normalizarNcm(b)
  if (!na || !nb) return false
  const tamanho = Math.min(na.length, nb.length, 6)
  return na.slice(0, tamanho) === nb.slice(0, tamanho)
}

function pareceNomeBotanico(texto: string): boolean {
  const norm = texto.trim()
  if (!norm) return false
  const partes = norm.split(/\s+/)
  if (partes.length < 2) return false
  return /^[A-Z][a-z]+$/.test(partes[0]) && /^[a-z]+$/.test(partes[1])
}

/** Passo 1 CF — motor Código + Cross-Doc: regras determinísticas da matriz CF1–CF9. */
export function executarPasso1ValidacaoCodigoCertificadoFitossanitario(
  documentosEntrada: DocumentoAnaliseRisco[],
): { resumo: ResumoRiscosAduaneirosLeitura; contexto: ContextoAuditoriaV1Leitura } {
  contadorRiscoCf = 0
  const riscos: RiscoAduaneiroLeitura[] = []
  const regras: RegraAuditoriaV1[] = []

  const todos = coletarDocumentos(documentosEntrada)
  const certificados = todos.filter((d) => ehTipoCertificadoFitossanitario(d.tipo))
  const invoices = todos.filter((d) => d.tipo.includes('INVOICE'))
  const packings = todos.filter((d) => d.tipo.includes('PACKING'))
  const certificadosOrigem = todos.filter((d) => ehTipoCertificadoOrigem(d.tipo))
  const conhecimentos = todos.filter((d) => {
    const tipo = d.tipo
    return (
      tipo.includes('BILL OF LADING') ||
      tipo.includes('SEA WAYBILL') ||
      tipo.includes('AWB') ||
      tipo.includes('AIR WAYBILL') ||
      /(^|[^A-Z])(BL|MBL|HBL|B\/L)([^A-Z]|$)/.test(tipo)
    )
  })

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
    const regra = regraMatrizCertificadoFitossanitarioPorId(params.regraId)
    if (!regra) return
    const severidade =
      (params.status ?? (regra.severidade === 'bloq' ? 'vermelho' : 'amarelo')) === 'vermelho'
        ? 'critico'
        : 'atencao'
    riscos.push(
      criarRiscoCf({
        regra,
        severidade,
        categoria: 'documental',
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

  for (const cf of certificados) {
    const r = cf.rotulo
    const invoicePrincipal = invoices[0] ?? null
    const plPrincipal = packings[0] ?? null
    const coPrincipal = certificadosOrigem[0] ?? null
    const conhecimentoPrincipal = conhecimentos[0] ?? null
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    // ── CF3-01 — Número do certificado ────────────────────────────────────────
    const numeroCf = valorCampo(cf.mapa, [
      'document.phytosanitaryCertificateNumber',
      'phytosanitaryCertificateNumber',
      'document.certificateNumber',
      'certificateNumber',
      'document.number',
    ])
    if (numeroCf) {
      registrar('CF3-01', r, true, `Certificado ${numeroCf} identificado`)
    } else {
      registrar('CF3-01', r, false, 'Número do certificado fitossanitário não identificado na extração')
      falhar({
        regraId: 'CF3-01',
        doc: cf,
        titulo: 'Número do certificado ausente',
        motivo: 'A extração não identificou o número do certificado fitossanitário.',
        analise: 'O número único do certificado é requisito formal NIMF 12.',
        campo: 'document.phytosanitaryCertificateNumber',
        status: 'amarelo',
      })
    }

    // ── CF3-02 — Data de emissão ──────────────────────────────────────────────
    const dataEmissaoTexto = valorCampo(cf.mapa, [
      'document.issueDate',
      'document.date',
      'issueDate',
      'date',
    ])
    const dataEmissao = parseData(dataEmissaoTexto)
    if (dataEmissao) {
      const futura = dataEmissao > hoje
      registrar(
        'CF3-02',
        r,
        !futura,
        futura
          ? `Data de emissão futura (${dataEmissaoTexto})`
          : `Data de emissão ${dataEmissaoTexto} coerente`,
      )
      if (futura) {
        falhar({
          regraId: 'CF3-02',
          doc: cf,
          titulo: 'Data de emissão futura',
          motivo: `O certificado declara emissão em ${dataEmissaoTexto}, posterior à data atual.`,
          analise: 'Data de emissão futura invalida o documento fitossanitário (NIMF 12).',
          campo: 'document.issueDate',
          valor: dataEmissaoTexto,
          status: 'amarelo',
        })
      }
    } else {
      registrar('CF3-02', r, false, 'Data de emissão não identificada na extração')
      falhar({
        regraId: 'CF3-02',
        doc: cf,
        titulo: 'Data de emissão ausente',
        motivo: 'A extração não identificou a data de emissão do certificado.',
        analise: 'Data de emissão é campo obrigatório NIMF 12.',
        campo: 'document.issueDate',
        status: 'amarelo',
      })
    }

    // ── CF3-03 — País de origem × invoice/CO (gate) ───────────────────────────
    const paisOrigemCf = valorCampo(cf.mapa, [
      'countryOfOrigin',
      'originCountry',
      'goods.countryOfOrigin',
      'country.origin',
      'placeOfOrigin',
    ])
    const paisOrigemInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, [
          'goods.countryOfOrigin',
          'countryOfOrigin',
          'origin',
          'madeIn',
        ])
      : null
    const paisOrigemCo = coPrincipal
      ? valorCampo(coPrincipal.mapa, [
          'countryOfOrigin',
          'originCountry',
          'goods.countryOfOrigin',
          'country.origin',
        ])
      : null
    if (paisOrigemCf && (paisOrigemInvoice || paisOrigemCo)) {
      const coincideInvoice = paisOrigemInvoice ? tokensCoincidem(paisOrigemCf, paisOrigemInvoice) : true
      const coincideCo = paisOrigemCo ? tokensCoincidem(paisOrigemCf, paisOrigemCo) : true
      const ok = coincideInvoice && coincideCo
      registrar(
        'CF3-03',
        r,
        ok,
        ok
          ? `País de origem «${paisOrigemCf}» coerente com invoice/CO`
          : `País de origem do CF («${paisOrigemCf}») diverge de invoice (${paisOrigemInvoice ?? '—'}) ou CO (${paisOrigemCo ?? '—'})`,
      )
      if (!ok) {
        falhar({
          regraId: 'CF3-03',
          doc: cf,
          titulo: 'País de origem diverge do dossiê',
          motivo: `CF declara origem «${paisOrigemCf}» incompatível com invoice/CO do processo.`,
          analise:
            'País de origem deve casar com invoice (S3-05) e CO (CO2-04) — divergência invalida o amparo fitossanitário (NIMF 12; NIMF 7).',
          campo: 'countryOfOrigin',
          valor: paisOrigemCf,
          evidenciasExtras: [
            ...(invoicePrincipal && paisOrigemInvoice
              ? [{ documento: invoicePrincipal.rotulo, campo: 'goods.countryOfOrigin', valor: paisOrigemInvoice }]
              : []),
            ...(coPrincipal && paisOrigemCo
              ? [{ documento: coPrincipal.rotulo, campo: 'countryOfOrigin', valor: paisOrigemCo }]
              : []),
          ],
        })
      }
    } else {
      registrar('CF3-03', r, true, 'N/A — país de origem do CF e/ou invoice/CO não disponível para cruzar')
    }

    // ── CF4-01 — Nome botânico (gate) — checagem heurística na extração ───────
    const nomeBotanico = valorCampo(cf.mapa, [
      'botanicalName',
      'goods.botanicalName',
      'scientificName',
      'goods.scientificName',
      'botanical.name',
    ])
    if (nomeBotanico) {
      const binomial = pareceNomeBotanico(nomeBotanico)
      registrar(
        'CF4-01',
        r,
        binomial,
        binomial
          ? `Nome botânico «${nomeBotanico}» em formato binomial`
          : `Nome «${nomeBotanico}» pode não ser nome científico binomial`,
      )
      if (!binomial) {
        falhar({
          regraId: 'CF4-01',
          doc: cf,
          titulo: 'Nome botânico possivelmente incompleto',
          motivo: `O campo botânico «${nomeBotanico}» não está em formato gênero + espécie.`,
          analise: 'NIMF 12 exige nome científico binomial (ex.: Glycine max), não apenas nome comum.',
          campo: 'botanicalName',
          valor: nomeBotanico,
        })
      }
    } else {
      registrar('CF4-01', r, false, 'Nome botânico não identificado na extração')
      falhar({
        regraId: 'CF4-01',
        doc: cf,
        titulo: 'Nome botânico ausente',
        motivo: 'A extração não identificou o nome científico do vegetal.',
        analise: 'Nome botânico binomial é campo obrigatório NIMF 12.',
        campo: 'botanicalName',
      })
    }

    // ── CF4-02 — Descrição × invoice/PL (gate) ────────────────────────────────
    const descricaoCf = valorCampo(cf.mapa, [
      'goods.description',
      'merchandise.description',
      'description',
      'goods.name',
    ])
    const descricaoInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['goods.description', 'description', 'goods.name'])
      : null
    const descricaoPl = plPrincipal
      ? valorCampo(plPrincipal.mapa, ['goods.description', 'description', 'goods.name', 'contents.description'])
      : null
    const descricaoRef = descricaoInvoice ?? descricaoPl
    if (descricaoCf && descricaoRef) {
      const coincide = tokensCoincidem(descricaoCf, descricaoRef)
      registrar(
        'CF4-02',
        r,
        coincide,
        coincide
          ? 'Descrição coerente com invoice/PL'
          : `Descrição do CF difere: «${descricaoCf.slice(0, 60)}…» × «${descricaoRef.slice(0, 60)}…»`,
      )
      if (!coincide) {
        falhar({
          regraId: 'CF4-02',
          doc: cf,
          titulo: 'Descrição do CF diverge da invoice/PL',
          motivo: 'A descrição da mercadoria no certificado não corresponde à dos demais documentos.',
          analise: 'Divergência substancial na descrição invalida o amparo fitossanitário (NIMF 12).',
          campo: 'goods.description',
          valor: descricaoCf,
          evidenciasExtras: [
            ...(invoicePrincipal && descricaoInvoice
              ? [{ documento: invoicePrincipal.rotulo, campo: 'goods.description', valor: descricaoInvoice }]
              : []),
            ...(plPrincipal && descricaoPl
              ? [{ documento: plPrincipal.rotulo, campo: 'goods.description', valor: descricaoPl }]
              : []),
          ],
        })
      }
    } else {
      registrar('CF4-02', r, true, 'N/A — descrição do CF e/ou invoice/PL não disponível para cruzar')
    }

    // ── CF4-03 — Quantidade ≤ invoice/PL ──────────────────────────────────────
    const qtdCf = parseNumero(
      valorCampo(cf.mapa, ['goods.quantity', 'quantity', 'goods.totalQuantity']),
    )
    const qtdInvoice = invoicePrincipal
      ? parseNumero(
          valorCampo(invoicePrincipal.mapa, [
            'goods.totalQuantity',
            'goods.quantity',
            'totals.quantity',
          ]),
        )
      : null
    const qtdPl = plPrincipal
      ? parseNumero(
          valorCampo(plPrincipal.mapa, [
            'shipmentDetails.totalPackages',
            'packageSummary.totalPackages',
            'totalPackages',
            'goods.quantity',
          ]),
        )
      : null
    const qtdRef = qtdInvoice ?? qtdPl
    if (qtdCf !== null && qtdRef !== null) {
      const ok = qtdCf <= qtdRef
      registrar(
        'CF4-03',
        r,
        ok,
        ok
          ? `Quantidade do CF (${qtdCf}) ≤ referência (${qtdRef})`
          : `Quantidade do CF (${qtdCf}) maior que invoice/PL (${qtdRef})`,
      )
      if (!ok) {
        falhar({
          regraId: 'CF4-03',
          doc: cf,
          titulo: 'Quantidade do CF excede o embarcado',
          motivo: `O CF ampara ${qtdCf} unidades, mas a invoice/PL declara ${qtdRef}.`,
          analise: 'O certificado não pode amparar mais do que o embarcado (NIMF 12).',
          campo: 'goods.quantity',
          valor: String(qtdCf),
          status: 'amarelo',
        })
      }
    } else {
      registrar('CF4-03', r, true, 'N/A — quantidade do CF e/ou invoice/PL não disponível')
    }

    // ── CF4-04 — Volumes × PL/BL ────────────────────────────────────────────
    const volumesCf = parseNumero(
      valorCampo(cf.mapa, ['packages.count', 'numberOfPackages', 'goods.packages', 'totalPackages']),
    )
    const volumesPl = plPrincipal
      ? parseNumero(
          valorCampo(plPrincipal.mapa, [
            'shipmentDetails.totalPackages',
            'packageSummary.totalPackages',
            'totalPackages',
          ]),
        )
      : null
    if (volumesCf !== null && volumesPl !== null) {
      const ok = volumesCf === volumesPl
      registrar(
        'CF4-04',
        r,
        ok,
        ok
          ? `Volumes (${volumesCf}) coerentes com PL`
          : `Volumes do CF (${volumesCf}) divergem do PL (${volumesPl})`,
      )
      if (!ok) {
        falhar({
          regraId: 'CF4-04',
          doc: cf,
          titulo: 'Volumes do CF divergem do packing list',
          motivo: `CF declara ${volumesCf} volume(s) e PL declara ${volumesPl}.`,
          analise: 'Volumes e embalagem devem casar com PL e conhecimento (NIMF 12).',
          campo: 'packages.count',
          valor: String(volumesCf),
          status: 'amarelo',
        })
      }
    } else {
      registrar('CF4-04', r, true, 'N/A — volumes do CF e/ou PL não disponível')
    }

    // ── CF4-06 — Meio de transporte × BL/AWB ────────────────────────────────
    const transporteCf = valorCampo(cf.mapa, [
      'meansOfConveyance',
      'transport.mode',
      'shipment.transport',
      'conveyance',
    ])
    const transporteBl = conhecimentoPrincipal
      ? valorCampo(conhecimentoPrincipal.mapa, [
          'transport.mode',
          'vessel.name',
          'flight.number',
          'meansOfTransport',
        ])
      : null
    if (transporteCf && transporteBl) {
      const coincide = tokensCoincidem(transporteCf, transporteBl)
      registrar(
        'CF4-06',
        r,
        coincide,
        coincide
          ? `Transporte «${transporteCf}» coerente com conhecimento`
          : `Transporte do CF («${transporteCf}») difere do conhecimento («${transporteBl}»)`,
      )
    } else {
      registrar('CF4-06', r, true, 'N/A — transporte do CF e/ou conhecimento não disponível')
    }

    // ── CF6-01 — Embalagem de madeira ─────────────────────────────────────────
    const madeiraCf = valorCampo(cf.mapa, [
      'woodPackaging',
      'packaging.wood',
      'distinguishingMarks',
      'packages.material',
    ])
    const madeiraInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['woodPackaging', 'packaging.wood', 'packages.material'])
      : null
    if (madeiraCf?.toLowerCase().includes('wood') || madeiraCf?.toLowerCase().includes('madeira')) {
      const temIppc =
        madeiraCf.toUpperCase().includes('IPPC') ||
        madeiraCf.toUpperCase().includes('ISPM') ||
        (madeiraInvoice?.toUpperCase().includes('IPPC') ?? false)
      registrar(
        'CF6-01',
        r,
        temIppc,
        temIppc
          ? 'Embalagem de madeira com referência IPPC/ISPM'
          : 'Embalagem de madeira sem marca IPPC identificada',
      )
      if (!temIppc) {
        falhar({
          regraId: 'CF6-01',
          doc: cf,
          titulo: 'Embalagem de madeira sem marca IPPC',
          motivo: 'O CF referencia madeira mas não há marca IPPC/ISPM 15 identificada.',
          analise: 'Madeira de embalagem exige tratamento e marca IPPC (NIMF 15; Portaria MAPA 514/2022).',
          campo: 'woodPackaging',
          valor: madeiraCf,
          status: 'amarelo',
        })
      }
    } else {
      registrar('CF6-01', r, true, 'N/A — sem referência a embalagem de madeira no CF')
    }

    // ── CF7-02 — Vínculo CF × produto/NCM da invoice (gate) ───────────────────
    const ncmCf = valorCampo(cf.mapa, ['goods.ncm', 'ncm', 'hsCode', 'tariffCode'])
    const ncmInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['goods.ncm', 'ncm', 'items[].ncm'])
      : null
    const descricaoParaVinculo = descricaoCf ?? nomeBotanico
    const descricaoInvoiceVinculo = descricaoInvoice ?? null
    if (ncmCf && ncmInvoice) {
      const coincideNcm = ncmCompativel(ncmCf, ncmInvoice)
      registrar(
        'CF7-02',
        r,
        coincideNcm,
        coincideNcm
          ? `NCM ${ncmCf} coerente com a invoice (${ncmInvoice})`
          : `NCM do CF (${ncmCf}) diverge da invoice (${ncmInvoice})`,
      )
      if (!coincideNcm) {
        falhar({
          regraId: 'CF7-02',
          doc: cf,
          titulo: 'CF não ampara o produto da adição',
          motivo: `NCM no CF: ${ncmCf} · NCM na invoice: ${ncmInvoice}.`,
          analise:
            'O certificado fitossanitário deve amparar o produto/adição da DUIMP — divergência de NCM invalida o vínculo (RA art. 553).',
          campo: 'goods.ncm',
          valor: ncmCf,
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'goods.ncm', valor: ncmInvoice }]
            : [],
        })
      }
    } else if (descricaoParaVinculo && descricaoInvoiceVinculo) {
      const coincideDesc = tokensCoincidem(descricaoParaVinculo, descricaoInvoiceVinculo)
      registrar(
        'CF7-02',
        r,
        coincideDesc,
        coincideDesc
          ? 'Produto do CF coerente com a invoice (por descrição)'
          : 'Produto do CF diverge da invoice — sem NCM para cruzar',
      )
      if (!coincideDesc) {
        falhar({
          regraId: 'CF7-02',
          doc: cf,
          titulo: 'CF não ampara o produto declarado na invoice',
          motivo: 'A descrição do certificado não corresponde ao produto da fatura comercial.',
          analise: 'Vínculo CF × adição exige correspondência de produto/NCM (RA art. 553; anuência MAPA).',
          campo: 'goods.description',
          valor: descricaoParaVinculo,
        })
      }
    } else {
      registrar('CF7-02', r, true, 'N/A — NCM/descrição do CF e invoice não disponível para vínculo')
    }

    // ── CF9-02 — Consistência origem × triangulação ───────────────────────────
    if (paisOrigemCf && paisOrigemInvoice) {
      const coincide = tokensCoincidem(paisOrigemCf, paisOrigemInvoice)
      registrar(
        'CF9-02',
        r,
        coincide,
        coincide
          ? `Origem «${paisOrigemCf}» coerente com invoice`
          : `Origem do CF («${paisOrigemCf}») difere da invoice («${paisOrigemInvoice}»)`,
      )
      if (!coincide) {
        falhar({
          regraId: 'CF9-02',
          doc: cf,
          titulo: 'Inconsistência de origem no dossiê',
          motivo: `CF declara origem «${paisOrigemCf}» e invoice «${paisOrigemInvoice}».`,
          analise: 'Origem incoerente entre CF, invoice e CO é red flag fitossanitária (NIMF 7).',
          campo: 'countryOfOrigin',
          valor: paisOrigemCf,
          status: 'amarelo',
        })
      }
    } else {
      registrar('CF9-02', r, true, 'N/A — origem não disponível para triangulação')
    }

    // ── CF9-03 — Completude NIMF 12 (gate) ────────────────────────────────────
    const faltantes = CAMPOS_OBRIGATORIOS_NIMF12.filter(
      (campo) => !valorCampo(cf.mapa, campo.caminhos),
    ).map((c) => c.rotulo)
    const completo = faltantes.length === 0
    registrar(
      'CF9-03',
      r,
      completo,
      completo
        ? 'Campos obrigatórios NIMF 12 presentes na extração'
        : `Campos ausentes: ${faltantes.join(', ')}`,
    )
    if (!completo) {
      falhar({
        regraId: 'CF9-03',
        doc: cf,
        titulo: 'Certificado incompleto (NIMF 12)',
        motivo: `Campos obrigatórios não identificados: ${faltantes.join(', ')}.`,
        analise:
          'Certificado fitossanitário incompleto pode ser rejeitado na VIGIAGRO — retenção, tratamento ou destruição (NIMF 12).',
        campo: 'certificate',
      })
    }

    // ── CF9-04 — Risco fitossanitário consolidado (gate) ──────────────────────
    const falhasDoCf = riscos.filter((risco) =>
      risco.evidencias.some((e) => e.documento === r),
    )
    const gatesDoCf = falhasDoCf.filter((risco) => {
      const regra = risco.id_regra_matriz
        ? regraMatrizCertificadoFitossanitarioPorId(risco.id_regra_matriz)
        : undefined
      return regra?.severidade === 'bloq' && risco.status_matriz === 'vermelho'
    })
    registrar(
      'CF9-04',
      r,
      gatesDoCf.length === 0,
      gatesDoCf.length === 0
        ? 'Sem gate disparado — risco fitossanitário controlável se demais regras conformes'
        : `${gatesDoCf.length} gate(s) disparado(s) — medida fitossanitária provável (retenção/tratamento/reexportação/destruição)`,
    )
    if (gatesDoCf.length > 0) {
      falhar({
        regraId: 'CF9-04',
        doc: cf,
        titulo: 'Risco fitossanitário grave no certificado',
        motivo: `${gatesDoCf.length} gate(s) de validação falharam: ${gatesDoCf.map((g) => g.id_regra_matriz).join(', ')}.`,
        analise:
          'Certificado inválido ou incompleto pode resultar em retenção, tratamento quarentenário, reexportação ou destruição do envio (Portaria MAPA 177/2021; IN SDA 12/2018).',
        campo: 'certificate',
      })
    }
  }

  const criticos = riscos.filter((r) => r.severidade === 'critico').length
  const atencao = riscos.filter((r) => r.severidade === 'atencao').length
  const informativos = riscos.filter((r) => r.severidade === 'informativo').length

  return {
    resumo: { riscos, total: riscos.length, criticos, atencao, informativos },
    contexto: { regras, ncms_encontrados: [], tributos_ncm: [] },
  }
}
