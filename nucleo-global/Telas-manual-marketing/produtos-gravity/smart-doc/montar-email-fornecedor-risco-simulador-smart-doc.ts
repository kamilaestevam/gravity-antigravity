/**
 * montar-email-fornecedor-risco-simulador-smart-doc.ts — rascunho de e-mail ao fornecedor (mock com dados reais do simulador)
 */

import type { RiscoSimuladorSmartDoc } from './dados-riscos-simulador-smart-doc'

export type IdiomaEmailFornecedorRiscoSimulador = 'pt' | 'en' | 'es'

const ROTULOS: Record<
  IdiomaEmailFornecedorRiscoSimulador,
  {
    assunto: string
    assuntoMultiplo: string
    saudacao: string
    corpo: string
    corpoMultiplo: string
    encerramento: string
    referencia: string
    baseLegal: string
  }
> = {
  pt: {
    assunto: 'Solicitação de correção — documento comercial',
    assuntoMultiplo: 'Solicitação de correção — documento comercial ({n} itens)',
    saudacao: 'Prezado(a) fornecedor(a),',
    corpo:
      'Identificamos o(s) seguinte(s) ponto(s) a ajustar no documento enviado para nossa operação de importação no Brasil:',
    corpoMultiplo:
      'Identificamos {n} ponto(s) a ajustar nos documentos enviados para nossa operação de importação no Brasil:',
    encerramento:
      'Por favor, envie a versão corrigida ou confirme os ajustes. Os dados devem estar legíveis e alinhados às exigências do despacho aduaneiro brasileiro (DUIMP / Portal Único Siscomex). Permanecemos à disposição.',
    referencia: 'Referência',
    baseLegal:
      'Base legal: Instruções Normativas da RFB, Tabela TI NCM (Mercosul) e requisitos cadastrais do Portal Único de Comércio Exterior.',
  },
  en: {
    assunto: 'Correction request — commercial document',
    assuntoMultiplo: 'Correction request — commercial documents ({n} items)',
    saudacao: 'Dear supplier,',
    corpo: 'We identified the following item(s) to fix in the document submitted for our import operation into Brazil:',
    corpoMultiplo: 'We identified {n} item(s) to fix in the documents submitted for our import operation into Brazil:',
    encerramento:
      'Please send the corrected version or confirm the adjustments. Data must be legible and aligned with Brazilian customs clearance requirements (DUIMP / Siscomex Single Window).',
    referencia: 'Reference',
    baseLegal:
      'Legal basis: Brazilian Federal Revenue (RFB) regulations, Mercosur NCM TI Table, and Siscomex registration requirements.',
  },
  es: {
    assunto: 'Solicitud de corrección — documento comercial',
    assuntoMultiplo: 'Solicitud de corrección — documentos comerciales ({n} ítems)',
    saudacao: 'Estimado(a) proveedor(a),',
    corpo:
      'Identificamos el/los siguiente(s) punto(s) a corregir en el documento enviado para nuestra operación de importación en Brasil:',
    corpoMultiplo:
      'Identificamos {n} punto(s) a corregir en los documentos enviados para nuestra operación de importación en Brasil:',
    encerramento:
      'Por favor, envíe la versión corregida o confirme los ajustes. Los datos deben ser legibles y alineados con los requisitos aduaneros brasileños (DUIMP / Ventanilla Única Siscomex).',
    referencia: 'Referencia',
    baseLegal:
      'Base legal: Instrucciones Normativas de la RFB, Tabla TI NCM (Mercosur) y requisitos cadastrales del Portal Único Siscomex.',
  },
}

function valorAtualLegivel(valor: string | null | undefined, idioma: IdiomaEmailFornecedorRiscoSimulador): string {
  const v = valor?.trim()
  if (!v) {
    return idioma === 'en' ? 'empty / not informed' : idioma === 'es' ? 'vacío / no informado' : 'vazio / não informado'
  }
  return v
}

function esperadoPorCampo(
  campo: string | undefined,
  titulo: string,
  idioma: IdiomaEmailFornecedorRiscoSimulador,
): string {
  const c = (campo ?? '').toLowerCase()
  const t = titulo.toLowerCase()

  if (c.includes('cnpj') || c.includes('taxid') || t.includes('cnpj')) {
    return idioma === 'en'
      ? 'valid Brazilian CNPJ (14 digits) or exporter Tax ID legible on the commercial document'
      : idioma === 'es'
        ? 'CNPJ brasileño válido (14 dígitos) o Tax ID del exportador legible en el documento comercial'
        : 'CNPJ brasileiro válido (14 dígitos) ou Tax ID do exportador legível no documento comercial'
  }
  if (c.includes('incoterm') || t.includes('incoterm')) {
    return idioma === 'en'
      ? 'valid ICC Incoterm® 2020 code (e.g. FOB, CIF, EXW) as agreed in the contract'
      : idioma === 'es'
        ? 'código Incoterm® ICC 2020 válido (ej. FOB, CIF, EXW) según el contrato'
        : 'código Incoterm® ICC 2020 válido (ex.: FOB, CIF, EXW) conforme o contrato comercial'
  }
  if (c.includes('ncm') || t.includes('ncm')) {
    return idioma === 'en'
      ? '8-digit NCM code per line item, consistent with the Mercosur TI Table (Siscomex)'
      : idioma === 'es'
        ? 'código NCM de 8 dígitos por ítem, conforme la Tabla TI Mercosur (Siscomex)'
        : 'código NCM de 8 dígitos por item, conforme Tabela TIPI / Tabela TI NCM Mercosul (Siscomex)'
  }
  if (c.includes('hscode') || c.includes('hs') || t.includes('hs code')) {
    return idioma === 'en'
      ? 'valid HS Code aligned with NCM classification per line item'
      : idioma === 'es'
        ? 'código HS válido alineado con la clasificación NCM por ítem'
        : 'código HS válido alinhado à classificação NCM por item'
  }
  if (c.includes('issuedate') || c.includes('issue_date') || t.includes('emissão')) {
    return idioma === 'en'
      ? 'issue date within the accepted range for customs clearance (legible and consistent with shipment)'
      : idioma === 'es'
        ? 'fecha de emisión dentro del intervalo aceptado para despacho (legible y coherente con el embarque)'
        : 'data de emissão dentro do intervalo aceito para despacho aduaneiro (legível e coerente com o embarque)'
  }
  if (c.includes('unitofmeasure') || c.includes('uom') || t.includes('unidade de medida')) {
    return idioma === 'en'
      ? 'unit of measure per line item (e.g. KG, UN, PCS) as required on the commercial document'
      : idioma === 'es'
        ? 'unidad de medida por ítem (ej. KG, UN, PCS) según el documento comercial'
        : 'unidade de medida por item (ex.: KG, UN, PCS) conforme o documento comercial'
  }
  if (c.includes('netweight') || c.includes('weight') || t.includes('peso')) {
    return idioma === 'en'
      ? 'net/gross weight consistent across Invoice, Packing List and Bill of Lading'
      : idioma === 'es'
        ? 'peso neto/bruto coherente entre Invoice, Packing List y Bill of Lading'
        : 'peso líquido/bruto coerente entre Invoice, Packing List e Bill of Lading (Conhecimento de Embarque)'
  }
  if (c.includes('packages') || t.includes('volume')) {
    return idioma === 'en'
      ? 'package count consistent across Packing List and Bill of Lading'
      : idioma === 'es'
        ? 'cantidad de bultos coherente entre Packing List y Bill of Lading'
        : 'quantidade de volumes coerente entre Packing List e Bill of Lading (BL)'
  }
  if (c.includes('port') || t.includes('porto')) {
    return idioma === 'en'
      ? 'port of loading/discharge legible and aligned with Incoterm and Bill of Lading'
      : idioma === 'es'
        ? 'puerto de embarque/destino legible y alineado con Incoterm y Bill of Lading'
        : 'porto de embarque/destino legível e alinhado ao Incoterm e ao Bill of Lading (BL)'
  }

  return idioma === 'en'
    ? 'complete and legible data as required for Brazilian customs clearance'
    : idioma === 'es'
      ? 'dato completo y legible según exigencias del despacho aduanero brasileño'
      : 'dado completo e legível conforme exigências do despacho aduaneiro brasileiro'
}

export function formatarLinhaLegislacaoEmailRiscoSimulador(
  risco: RiscoSimuladorSmartDoc,
  idioma: IdiomaEmailFornecedorRiscoSimulador,
): string {
  const ev = risco.evidencias[0]
  const campo = ev?.campo ?? risco.titulo
  const atual = valorAtualLegivel(ev?.valor, idioma)
  const esperado = esperadoPorCampo(ev?.campo, risco.titulo, idioma)
  const refNormativa =
    idioma === 'en'
      ? 'DUIMP / Siscomex Single Window'
      : idioma === 'es'
        ? 'DUIMP / Ventanilla Única Siscomex'
        : 'DUIMP / Portal Único Siscomex'

  if (idioma === 'en') {
    return `• ${risco.titulo}: in field \`${campo}\` the document shows **${atual}**; for Brazilian customs it must show **${esperado}** (${refNormativa}).`
  }
  if (idioma === 'es') {
    return `• ${risco.titulo}: en el campo \`${campo}\` consta **${atual}**; para despacho en Brasil debe constar **${esperado}** (${refNormativa}).`
  }
  return `• ${risco.titulo}: no campo \`${campo}\` consta **${atual}**; para despacho aduaneiro no Brasil deve constar **${esperado}** (${refNormativa}).`
}

function referenciaRisco(risco: RiscoSimuladorSmartDoc, idioma: IdiomaEmailFornecedorRiscoSimulador): string {
  const ev = risco.evidencias[0]
  const onde = ev ? [ev.documento, ev.campo].filter(Boolean).join(' · ') : '—'
  return `${ROTULOS[idioma].referencia}: ${onde}`
}

export function montarEmailFornecedorRiscosSimuladorSmartDoc(
  riscos: RiscoSimuladorSmartDoc[],
  idioma: IdiomaEmailFornecedorRiscoSimulador,
): { assunto: string; corpo: string } {
  const t = ROTULOS[idioma]
  const n = riscos.length

  if (n === 0) {
    return { assunto: t.assunto, corpo: t.saudacao }
  }

  const linhasLegislacao = riscos.map((r) => formatarLinhaLegislacaoEmailRiscoSimulador(r, idioma))
  const linhasCorrecao = riscos
    .map((r) => r.correcao_sugerida?.trim())
    .filter((c): c is string => Boolean(c))
    .map((c) => `  → ${c}`)

  const referencias = [...new Set(riscos.map((r) => referenciaRisco(r, idioma)))]

  const assunto =
    n === 1 ? `${t.assunto} — ${riscos[0].titulo}` : t.assuntoMultiplo.replace('{n}', String(n))

  const corpo = [
    t.saudacao,
    '',
    n === 1 ? t.corpo : t.corpoMultiplo.replace('{n}', String(n)),
    '',
    ...linhasLegislacao,
    ...(linhasCorrecao.length > 0
      ? [
          '',
          ...(idioma === 'en' ? ['Suggested action:'] : idioma === 'es' ? ['Acción sugerida:'] : ['Ação sugerida:']),
          ...linhasCorrecao,
        ]
      : []),
    '',
    ...referencias,
    '',
    t.baseLegal,
    '',
    t.encerramento,
  ].join('\n')

  return { assunto, corpo }
}

export function montarMensagemNotificacaoRiscosSimuladorSmartDoc(riscos: RiscoSimuladorSmartDoc[]): string {
  const linhas = riscos.map((risco) => {
    const evidencia = risco.evidencias[0]
    const onde = evidencia ? [evidencia.documento, evidencia.campo].filter(Boolean).join(' · ') : 'Smart Docs'
    return [`[${risco.severidade}] ${risco.titulo}`, onde, risco.correcao_sugerida ?? risco.analise].join(' — ')
  })
  return [`[Smart Docs] ${riscos.length} risco(s) na conferência`, ...linhas].join('\n')
}
