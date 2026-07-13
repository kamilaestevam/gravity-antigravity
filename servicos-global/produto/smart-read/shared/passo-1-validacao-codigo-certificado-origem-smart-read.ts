/**
 * passo-1-validacao-codigo-certificado-origem-smart-read.ts — motor Código + Cross-Doc da matriz CO (CO1–CO9).
 */

import {
  regraMatrizCertificadoOrigemPorId,
  type RegraMatrizCertificadoOrigem,
} from './matriz-validacao-certificado-origem-smart-read.js'
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

type DocumentoLeitura = {
  rotulo: string
  tipo: string
  mapa: Map<string, unknown>
  dados: Record<string, unknown>
}

const VALIDADE_MERCOSUL_DIAS = 180
const VALIDADE_ALADI_DIAS = 60

let contadorRiscoCo = 0

function criarRiscoCo(parcial: {
  regra: RegraMatrizCertificadoOrigem
  severidade: RiscoAduaneiroLeitura['severidade']
  categoria: RiscoAduaneiroLeitura['categoria']
  titulo: string
  motivo: string
  analise: string
  evidencias: RiscoAduaneiroLeitura['evidencias']
  status?: 'vermelho' | 'amarelo'
}): RiscoAduaneiroLeitura {
  contadorRiscoCo += 1
  return {
    id: `risco-co-${contadorRiscoCo}`,
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

export function ehTipoCertificadoOrigem(tipo: string): boolean {
  const norm = tipo.toUpperCase()
  return (
    norm.includes('CERTIFICADO DE ORIGEM') ||
    norm.includes('CERTIFICATE OF ORIGIN') ||
    norm.includes('ORIGIN CERTIFICATE') ||
    norm.includes('CERTIFICADO ORIGEM') ||
    /\bCOD\b/.test(norm)
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

function diasEntre(inicio: Date, fim: Date): number {
  const ms = fim.getTime() - inicio.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function detectarPrazoValidadeDias(regime: string | null): number {
  if (!regime) return VALIDADE_MERCOSUL_DIAS
  const norm = normalizarTexto(regime)
  // Mercosul (inclusive ACE 18/35/36 intra-bloco) = 180 dias
  if (norm.includes('MERCOSUL')) return VALIDADE_MERCOSUL_DIAS
  // ALADI / ACE extra-Mercosul = 60 dias
  if (norm.includes('ALADI') || norm.includes('NALADI') || /\bACE\b/.test(norm)) {
    return VALIDADE_ALADI_DIAS
  }
  return VALIDADE_MERCOSUL_DIAS
}

/** Passo 1 CO — motor Código + Cross-Doc: regras determinísticas da matriz CO1–CO9. */
export function executarPasso1ValidacaoCodigoCertificadoOrigem(
  documentosEntrada: DocumentoAnaliseRisco[],
): { resumo: ResumoRiscosAduaneirosLeitura; contexto: ContextoAuditoriaV1Leitura } {
  contadorRiscoCo = 0
  const riscos: RiscoAduaneiroLeitura[] = []
  const regras: RegraAuditoriaV1[] = []

  const todos = coletarDocumentos(documentosEntrada)
  const certificados = todos.filter((d) => ehTipoCertificadoOrigem(d.tipo))
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
    const regra = regraMatrizCertificadoOrigemPorId(params.regraId)
    if (!regra) return
    const severidade =
      (params.status ?? (regra.severidade === 'bloq' ? 'vermelho' : 'amarelo')) === 'vermelho'
        ? 'critico'
        : 'atencao'
    riscos.push(
      criarRiscoCo({
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

  for (const co of certificados) {
    const r = co.rotulo
    const invoicePrincipal = invoices[0] ?? null
    const plPrincipal = packings[0] ?? null
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    // ── CO3-01 — Número do certificado ────────────────────────────────────────
    const numeroCo = valorCampo(co.mapa, [
      'document.certificateNumber',
      'certificateNumber',
      'document.number',
      'document.documentNumber',
    ])
    if (numeroCo) {
      registrar('CO3-01', r, true, `Certificado ${numeroCo} identificado`)
    } else {
      registrar('CO3-01', r, false, 'Número do certificado não identificado na extração')
      falhar({
        regraId: 'CO3-01',
        doc: co,
        titulo: 'Número do certificado ausente',
        motivo: 'A extração não identificou o número do certificado de origem.',
        analise: 'O número único do certificado é requisito formal (Res. ALADI 252; Dec. CMC 05/23).',
        campo: 'document.certificateNumber',
      })
    }

    // ── CO3-02 — Data de emissão × data da fatura (gate) ─────────────────────
    const dataEmissaoTexto = valorCampo(co.mapa, [
      'document.issueDate',
      'document.date',
      'issueDate',
      'date',
    ])
    const dataEmissao = parseData(dataEmissaoTexto)
    const dataInvoiceTexto = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['document.issueDate', 'document.date', 'issueDate'])
      : null
    const dataInvoice = parseData(dataInvoiceTexto)
    if (dataEmissao && dataInvoice) {
      const emissaoAnteriorFatura = dataEmissao < dataInvoice
      registrar(
        'CO3-02',
        r,
        !emissaoAnteriorFatura,
        emissaoAnteriorFatura
          ? `Emissão do CO (${dataEmissaoTexto}) anterior à da invoice (${dataInvoiceTexto})`
          : `Emissão do CO (${dataEmissaoTexto}) coerente com a invoice (${dataInvoiceTexto})`,
      )
      if (emissaoAnteriorFatura) {
        falhar({
          regraId: 'CO3-02',
          doc: co,
          titulo: 'Emissão do certificado anterior à fatura',
          motivo: `O CO foi emitido em ${dataEmissaoTexto}, antes da fatura comercial (${dataInvoiceTexto}).`,
          analise:
            'A emissão do CO não pode ser anterior à data da fatura comercial — invalida a preferência (Dec. CMC 05/23; Res. ALADI 252).',
          campo: 'document.issueDate',
          valor: dataEmissaoTexto,
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'document.issueDate', valor: dataInvoiceTexto }]
            : [],
        })
      }
    } else {
      registrar(
        'CO3-02',
        r,
        true,
        'N/A — data de emissão do CO e/ou da invoice não disponível para cruzar',
      )
    }

    // ── CO3-03 — Validade 180/60 dias (gate) ──────────────────────────────────
    const dataValidadeTexto = valorCampo(co.mapa, [
      'document.expiryDate',
      'document.validityDate',
      'validityDate',
      'expiryDate',
    ])
    const dataValidade = parseData(dataValidadeTexto)
    const acordoTexto = valorCampo(co.mapa, ['agreement', 'tradeAgreement', 'document.agreement'])
    const prazoDias = detectarPrazoValidadeDias(acordoTexto)
    if (dataEmissao && dataValidade) {
      const diasValidade = diasEntre(dataEmissao, dataValidade)
      const vencido = dataValidade < hoje
      const prazoIncorreto = Math.abs(diasValidade - prazoDias) > 5
      const ok = !vencido && !prazoIncorreto
      registrar(
        'CO3-03',
        r,
        ok,
        ok
          ? `Validade ${dataValidadeTexto} (${diasValidade} dias — regime ${prazoDias === VALIDADE_ALADI_DIAS ? 'ALADI/60' : 'Mercosul/180'})`
          : `${vencido ? `Certificado vencido (${dataValidadeTexto})` : `Prazo de validade ${diasValidade} dias diverge do esperado (${prazoDias})`}`,
      )
      if (!ok) {
        falhar({
          regraId: 'CO3-03',
          doc: co,
          titulo: vencido ? 'Certificado de origem vencido' : 'Prazo de validade incorreto',
          motivo: vencido
            ? `O certificado venceu em ${dataValidadeTexto} — perda do benefício tarifário.`
            : `O prazo entre emissão e validade (${diasValidade} dias) diverge do regime ${prazoDias === VALIDADE_ALADI_DIAS ? 'ALADI (60 dias)' : 'Mercosul (180 dias)'}.`,
          analise:
            'Certificado vencido ou com prazo incorreto implica perda da preferência tarifária (II cheio) — Dec. CMC 05/23; IN 680/06 art. 19, §2º.',
          campo: 'document.expiryDate',
          valor: dataValidadeTexto,
        })
      }
    } else if (dataEmissao) {
      const limite = new Date(dataEmissao)
      limite.setDate(limite.getDate() + prazoDias)
      const vencido = limite < hoje
      registrar(
        'CO3-03',
        r,
        !vencido,
        vencido
          ? `Sem data de validade explícita — emissão ${dataEmissaoTexto} + ${prazoDias} dias já expirou`
          : `Sem validade explícita — dentro do prazo estimado de ${prazoDias} dias desde ${dataEmissaoTexto}`,
      )
      if (vencido) {
        falhar({
          regraId: 'CO3-03',
          doc: co,
          titulo: 'Certificado presumivelmente vencido',
          motivo: `Sem data de validade no CO; a emissão ${dataEmissaoTexto} ultrapassa o prazo de ${prazoDias} dias.`,
          analise: 'Certificado fora do prazo de validade — perda do benefício tarifário.',
          campo: 'document.issueDate',
          valor: dataEmissaoTexto,
        })
      }
    } else {
      registrar('CO3-03', r, true, 'N/A — datas de emissão/validade não identificadas na extração')
    }

    // ── CO2-01 — Produtor × fabricante invoice/PL ─────────────────────────────
    const produtor = valorCampo(co.mapa, ['producer.name', 'manufacturer.name', 'producer'])
    const fabricanteInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['manufacturer.name', 'producer.name'])
      : null
    const fabricantePl = plPrincipal
      ? valorCampo(plPrincipal.mapa, ['manufacturer.name', 'producer.name'])
      : null
    if (produtor && (fabricanteInvoice || fabricantePl)) {
      const ref = fabricanteInvoice ?? fabricantePl!
      const coincide = tokensCoincidem(produtor, ref)
      registrar(
        'CO2-01',
        r,
        coincide,
        coincide
          ? `Produtor «${produtor}» coerente com o fabricante dos demais documentos`
          : `Produtor «${produtor}» difere do fabricante «${ref}»`,
      )
      if (!coincide) {
        falhar({
          regraId: 'CO2-01',
          doc: co,
          titulo: 'Produtor do CO diverge do fabricante da invoice/PL',
          motivo: `Produtor «${produtor}» não coincide com «${ref}».`,
          analise:
            'O produtor detém a DJO — divergência com o fabricante dos demais documentos merece conferência (Dec. CMC 05/23).',
          campo: 'producer.name',
          valor: produtor,
          status: 'amarelo',
        })
      }
    } else if (produtor) {
      registrar('CO2-01', r, true, `Produtor «${produtor}» presente — sem invoice/PL para cruzar`)
    } else {
      registrar('CO2-01', r, false, 'Produtor não identificado no certificado')
      falhar({
        regraId: 'CO2-01',
        doc: co,
        titulo: 'Produtor ausente no certificado',
        motivo: 'A extração não identificou o produtor/fabricante no certificado de origem.',
        analise: 'O produtor é parte obrigatória e detentor da DJO (Dec. CMC 05/23; Res. ALADI 252).',
        campo: 'producer.name',
        status: 'amarelo',
      })
    }

    // ── CO2-02 — Exportador × invoice ─────────────────────────────────────────
    const exportadorCo = valorCampo(co.mapa, ['exporter.name', 'shipper.name'])
    const exportadorInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['exporter.name', 'shipper.name'])
      : null
    if (exportadorCo && exportadorInvoice) {
      const coincide = tokensCoincidem(exportadorCo, exportadorInvoice)
      registrar(
        'CO2-02',
        r,
        coincide,
        coincide
          ? `Exportador «${exportadorCo}» coerente com a invoice`
          : `Exportador «${exportadorCo}» difere do exportador da invoice «${exportadorInvoice}»`,
      )
      if (!coincide) {
        falhar({
          regraId: 'CO2-02',
          doc: co,
          titulo: 'Exportador do CO diverge da invoice',
          motivo: `Exportador «${exportadorCo}» não coincide com «${exportadorInvoice}».`,
          analise:
            'Pode ser legítimo quando produtor ≠ exportador — conferir campo próprio no CO (Res. ALADI 252).',
          campo: 'exporter.name',
          valor: exportadorCo,
          status: 'amarelo',
        })
      }
    } else if (exportadorCo) {
      registrar('CO2-02', r, true, `Exportador «${exportadorCo}» presente`)
    } else {
      registrar('CO2-02', r, false, 'Exportador não identificado no certificado')
      falhar({
        regraId: 'CO2-02',
        doc: co,
        titulo: 'Exportador ausente no certificado',
        motivo: 'A extração não identificou o exportador no certificado de origem.',
        analise: 'Exportador deve constar no certificado (Res. ALADI 252).',
        campo: 'exporter.name',
        status: 'amarelo',
      })
    }

    // ── CO2-03 — Importador × invoice ───────────────────────────────────────────
    const importadorCo = valorCampo(co.mapa, ['importer.name', 'consignee.name'])
    const importadorInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['importer.name', 'consignee.name'])
      : null
    if (importadorCo && importadorInvoice) {
      const coincide = tokensCoincidem(importadorCo, importadorInvoice)
      registrar(
        'CO2-03',
        r,
        coincide,
        coincide
          ? `Importador «${importadorCo}» coerente com a invoice`
          : `Importador «${importadorCo}» difere do importador da invoice «${importadorInvoice}»`,
      )
      if (!coincide) {
        falhar({
          regraId: 'CO2-03',
          doc: co,
          titulo: 'Importador do CO diverge da invoice',
          motivo: `Importador «${importadorCo}» não coincide com «${importadorInvoice}».`,
          analise: 'O importador deve casar com o declarante da DUIMP e da invoice (RA arts. 121–124).',
          campo: 'importer.name',
          valor: importadorCo,
          status: 'amarelo',
        })
      }
    } else if (importadorCo) {
      registrar('CO2-03', r, true, `Importador «${importadorCo}» presente`)
    } else {
      registrar('CO2-03', r, false, 'Importador não identificado no certificado')
      falhar({
        regraId: 'CO2-03',
        doc: co,
        titulo: 'Importador ausente no certificado',
        motivo: 'A extração não identificou o importador no certificado de origem.',
        analise: 'Importador é parte obrigatória do certificado (Res. ALADI 252).',
        campo: 'importer.name',
        status: 'amarelo',
      })
    }

    // ── CO4-01 — Descrição × invoice (gate) ───────────────────────────────────
    const descricaoCo = valorCampo(co.mapa, [
      'goods.description',
      'merchandise.description',
      'description',
      'goods.name',
    ])
    const descricaoInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['goods.description', 'description', 'goods.name'])
      : null
    if (descricaoCo && descricaoInvoice) {
      const coincide = tokensCoincidem(descricaoCo, descricaoInvoice)
      registrar(
        'CO4-01',
        r,
        coincide,
        coincide
          ? 'Descrição da mercadoria coerente com a invoice'
          : `Descrição do CO difere da invoice: «${descricaoCo.slice(0, 60)}…» × «${descricaoInvoice.slice(0, 60)}…»`,
      )
      if (!coincide) {
        falhar({
          regraId: 'CO4-01',
          doc: co,
          titulo: 'Descrição do CO diverge da invoice',
          motivo: 'A descrição da mercadoria no certificado não corresponde à da fatura comercial.',
          analise:
            'Divergência substancial na descrição invalida a preferência tarifária (Res. ALADI 252; Dec. CMC 05/23).',
          campo: 'goods.description',
          valor: descricaoCo,
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'goods.description', valor: descricaoInvoice }]
            : [],
        })
      }
    } else {
      registrar('CO4-01', r, true, 'N/A — descrição do CO e/ou da invoice não disponível para cruzar')
    }

    // ── CO4-02 — NCM × invoice (gate) ─────────────────────────────────────────
    const ncmCo = valorCampo(co.mapa, ['goods.ncm', 'ncm', 'hsCode', 'tariffCode'])
    const ncmInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['goods.ncm', 'ncm', 'items[].ncm'])
      : null
    if (ncmCo && ncmInvoice) {
      const coincide = ncmCompativel(ncmCo, ncmInvoice)
      registrar(
        'CO4-02',
        r,
        coincide,
        coincide
          ? `NCM ${ncmCo} coerente com a invoice (${ncmInvoice})`
          : `NCM do CO (${ncmCo}) diverge da invoice (${ncmInvoice})`,
      )
      if (!coincide) {
        falhar({
          regraId: 'CO4-02',
          doc: co,
          titulo: 'NCM do certificado diverge da invoice',
          motivo: `NCM no CO: ${ncmCo} · NCM na invoice: ${ncmInvoice}.`,
          analise:
            'Divergência de classificação pode descaracterizar a origem e invalidar a preferência (Dec. CMC 05/23; IN 680/06 art. 19).',
          campo: 'goods.ncm',
          valor: ncmCo,
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'goods.ncm', valor: ncmInvoice }]
            : [],
        })
      }
    } else {
      registrar('CO4-02', r, true, 'N/A — NCM do CO e/ou da invoice não disponível para cruzar')
    }

    // ── CO4-03 — Quantidade ≤ invoice/PL ──────────────────────────────────────
    const qtdCo = parseNumero(
      valorCampo(co.mapa, ['goods.quantity', 'quantity', 'goods.totalQuantity']),
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
          ]),
        )
      : null
    const qtdRef = qtdInvoice ?? qtdPl
    if (qtdCo !== null && qtdRef !== null) {
      const ok = qtdCo <= qtdRef
      registrar(
        'CO4-03',
        r,
        ok,
        ok
          ? `Quantidade do CO (${qtdCo}) ≤ referência (${qtdRef})`
          : `Quantidade do CO (${qtdCo}) maior que invoice/PL (${qtdRef})`,
      )
      if (!ok) {
        falhar({
          regraId: 'CO4-03',
          doc: co,
          titulo: 'Quantidade do CO excede o embarcado',
          motivo: `O CO ampara ${qtdCo} unidades, mas a invoice/PL declara ${qtdRef}.`,
          analise: 'O certificado não pode amparar mais do que o embarcado (Res. ALADI 252).',
          campo: 'goods.quantity',
          valor: String(qtdCo),
          status: 'amarelo',
        })
      }
    } else {
      registrar('CO4-03', r, true, 'N/A — quantidade do CO e/ou invoice/PL não disponível')
    }

    // ── CO4-04 — Fatura vinculada (gate) ──────────────────────────────────────
    const faturaCo = valorCampo(co.mapa, [
      'linkedInvoice.number',
      'invoiceNumber',
      'commercialInvoice.number',
      'invoice.number',
    ])
    const faturaInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, [
          'document.invoiceNumber',
          'document.number',
          'invoiceNumber',
        ])
      : null
    if (faturaCo && faturaInvoice) {
      const limpoCo = faturaCo.replace(/[\s-]/g, '').toUpperCase()
      const limpoInv = faturaInvoice.replace(/[\s-]/g, '').toUpperCase()
      const coincide = limpoCo === limpoInv || limpoCo.includes(limpoInv) || limpoInv.includes(limpoCo)
      registrar(
        'CO4-04',
        r,
        coincide,
        coincide
          ? `Fatura ${faturaCo} vinculada ao processo`
          : `Fatura no CO (${faturaCo}) difere da invoice (${faturaInvoice})`,
      )
      if (!coincide) {
        falhar({
          regraId: 'CO4-04',
          doc: co,
          titulo: 'Fatura declarada no CO não corresponde à invoice',
          motivo: `O CO declara a fatura ${faturaCo}, mas o processo traz ${faturaInvoice}.`,
          analise:
            'Nº e data da fatura no CO devem casar com a invoice do processo (Res. ALADI 252; Dec. CMC 05/23).',
          campo: 'linkedInvoice.number',
          valor: faturaCo,
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'document.invoiceNumber', valor: faturaInvoice }]
            : [],
        })
      }
    } else {
      registrar('CO4-04', r, true, 'N/A — fatura no CO e/ou invoice não disponível para cruzar')
    }

    // ── CO9-03 — País de origem × invoice ─────────────────────────────────────
    const paisOrigemCo = valorCampo(co.mapa, [
      'countryOfOrigin',
      'originCountry',
      'goods.countryOfOrigin',
      'country.origin',
    ])
    const paisOrigemInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, [
          'goods.countryOfOrigin',
          'countryOfOrigin',
          'origin',
          'madeIn',
        ])
      : null
    if (paisOrigemCo && paisOrigemInvoice) {
      const coincide = tokensCoincidem(paisOrigemCo, paisOrigemInvoice)
      registrar(
        'CO9-03',
        r,
        coincide,
        coincide
          ? `País de origem «${paisOrigemCo}» coerente com a invoice`
          : `País de origem do CO («${paisOrigemCo}») difere da invoice («${paisOrigemInvoice}»)`,
      )
      if (!coincide) {
        falhar({
          regraId: 'CO9-03',
          doc: co,
          titulo: 'País de origem do CO diverge da invoice',
          motivo: `CO declara origem «${paisOrigemCo}» e a invoice «${paisOrigemInvoice}».`,
          analise:
            'Divergência de origem é red flag de falsa declaração — risco mais grave que a perda de benefício (RA arts. 30–35).',
          campo: 'countryOfOrigin',
          valor: paisOrigemCo,
          status: 'amarelo',
        })
      }
    } else {
      registrar('CO9-03', r, true, 'N/A — país de origem não disponível para cruzar')
    }

    // ── CO9-04 — Risco consolidado de perda de benefício (gate) ────────────────
    const falhasDoCo = riscos.filter((risco) =>
      risco.evidencias.some((e) => e.documento === r),
    )
    const gatesDoCo = falhasDoCo.filter((risco) => {
      const regra = risco.id_regra_matriz
        ? regraMatrizCertificadoOrigemPorId(risco.id_regra_matriz)
        : undefined
      return regra?.severidade === 'bloq' && risco.status_matriz === 'vermelho'
    })
    registrar(
      'CO9-04',
      r,
      gatesDoCo.length === 0,
      gatesDoCo.length === 0
        ? 'Sem gate disparado — benefício tarifário preservável se demais regras conformes'
        : `${gatesDoCo.length} gate(s) disparado(s) — risco de perda da preferência (II cheio)`,
    )
    if (gatesDoCo.length > 0) {
      falhar({
        regraId: 'CO9-04',
        doc: co,
        titulo: 'Risco de perda do benefício tarifário',
        motivo: `${gatesDoCo.length} gate(s) de validação falharam: ${gatesDoCo.map((g) => g.id_regra_matriz).join(', ')}.`,
        analise:
          'Certificado inválido ou incompleto implica recolhimento do II pela alíquota cheia — perda da preferência tarifária (RA arts. 121–124).',
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
