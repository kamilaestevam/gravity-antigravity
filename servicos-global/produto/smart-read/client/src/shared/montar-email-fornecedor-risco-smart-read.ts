/**
 * montar-email-fornecedor-risco-smart-read.ts — rascunho de e-mail ao fornecedor (PT/EN/ES)
 */

import {
  aplicarCorrecaoSugeridaPadraoRisco,
  type RiscoAduaneiroLeitura,
} from '../../../shared/analise-riscos-leitura-smart-read'
import { NOME_PRODUTO_EXIBICAO } from './marca-smart-docs'

export type IdiomaEmailFornecedorRisco = 'pt' | 'en' | 'es'

const ROTULOS: Record<
  IdiomaEmailFornecedorRisco,
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

function valorAtualLegivel(valor: string | null | undefined, idioma: IdiomaEmailFornecedorRisco): string {
  const v = valor?.trim()
  if (!v) {
    return idioma === 'en' ? 'empty / not informed' : idioma === 'es' ? 'vacío / no informado' : 'vazio / não informado'
  }
  return v
}

function esperadoPorCampo(
  campo: string | undefined,
  titulo: string,
  idioma: IdiomaEmailFornecedorRisco,
): string {
  const c = (campo ?? '').toLowerCase()
  if (c.includes('cnpj') || c.includes('taxid') || titulo.toLowerCase().includes('cnpj')) {
    return idioma === 'en'
      ? 'valid Brazilian CNPJ (14 digits) or exporter Tax ID legible on the commercial document'
      : idioma === 'es'
        ? 'CNPJ brasileño válido (14 dígitos) o Tax ID del exportador legible en el documento comercial'
        : 'CNPJ brasileiro válido (14 dígitos) ou Tax ID do exportador legível no documento comercial'
  }
  if (c.includes('incoterm') || titulo.toLowerCase().includes('incoterm')) {
    return idioma === 'en'
      ? 'valid ICC Incoterm® 2020 code (e.g. FOB, CIF, EXW) as agreed in the contract'
      : idioma === 'es'
        ? 'código Incoterm® ICC 2020 válido (ej. FOB, CIF, EXW) según el contrato'
        : 'código Incoterm® ICC 2020 válido (ex.: FOB, CIF, EXW) conforme o contrato comercial'
  }
  if (c.includes('ncm') || titulo.toLowerCase().includes('ncm')) {
    return idioma === 'en'
      ? '8-digit NCM code per line item, consistent with the Mercosur TI Table (Siscomex)'
      : idioma === 'es'
        ? 'código NCM de 8 dígitos por ítem, conforme la Tabla TI Mercosur (Siscomex)'
        : 'código NCM de 8 dígitos por item, conforme Tabela TI NCM Mercosul (Siscomex)'
  }
  return idioma === 'en'
    ? 'complete and legible data as required for Brazilian customs clearance'
    : idioma === 'es'
      ? 'dato completo y legible según exigencias del despacho aduanero brasileño'
      : 'dado completo e legível conforme exigências do despacho aduaneiro brasileiro'
  }

export function formatarLinhaLegislacaoEmailRisco(
  risco: RiscoAduaneiroLeitura,
  idioma: IdiomaEmailFornecedorRisco,
): string {
  const r = aplicarCorrecaoSugeridaPadraoRisco(risco)
  const ev = r.evidencias[0]
  const campo = ev?.campo ?? r.titulo
  const atual = valorAtualLegivel(ev?.valor, idioma)
  const esperado = esperadoPorCampo(ev?.campo, r.titulo, idioma)
  const refNormativa =
    r.citacoes_normativas?.[0]?.referencia ??
    (idioma === 'en'
      ? 'DUIMP / Siscomex Single Window'
      : idioma === 'es'
        ? 'DUIMP / Ventanilla Única Siscomex'
        : 'DUIMP / Portal Único Siscomex')

  if (idioma === 'en') {
    return `• ${r.titulo}: in field \`${campo}\` the document shows **${atual}**; for Brazilian customs it must show **${esperado}** (${refNormativa}).`
  }
  if (idioma === 'es') {
    return `• ${r.titulo}: en el campo \`${campo}\` consta **${atual}**; para despacho en Brasil debe constar **${esperado}** (${refNormativa}).`
  }
  return `• ${r.titulo}: no campo \`${campo}\` consta **${atual}**; para despacho aduaneiro no Brasil deve constar **${esperado}** (${refNormativa}).`
}

function referenciaRisco(risco: RiscoAduaneiroLeitura, idioma: IdiomaEmailFornecedorRisco): string {
  const ev = risco.evidencias[0]
  const onde = ev ? [ev.documento, ev.campo].filter(Boolean).join(' · ') : '—'
  const t = ROTULOS[idioma]
  return `${t.referencia}: ${onde}`
}

export function montarEmailFornecedorRiscoSmartRead(
  risco: RiscoAduaneiroLeitura,
  idioma: IdiomaEmailFornecedorRisco,
): { assunto: string; corpo: string } {
  return montarEmailFornecedorRiscosSmartRead([risco], idioma)
}

export function montarEmailFornecedorRiscosSmartRead(
  riscosEntrada: RiscoAduaneiroLeitura[],
  idioma: IdiomaEmailFornecedorRisco,
): { assunto: string; corpo: string } {
  const riscos = riscosEntrada.map(aplicarCorrecaoSugeridaPadraoRisco)
  const t = ROTULOS[idioma]
  const n = riscos.length

  if (n === 0) {
    return { assunto: t.assunto, corpo: t.saudacao }
  }

  const linhasLegislacao = riscos.map((r) => formatarLinhaLegislacaoEmailRisco(r, idioma))
  const linhasCorrecao = riscos
    .map((r) => r.correcao_sugerida?.trim())
    .filter((c): c is string => Boolean(c))
    .map((c) => `  → ${c}`)

  const referencias = [...new Set(riscos.map((r) => referenciaRisco(r, idioma)))]

  const assunto =
    n === 1
      ? `${t.assunto} — ${riscos[0].titulo}`
      : t.assuntoMultiplo.replace('{n}', String(n))

  const corpo = [
    t.saudacao,
    '',
    n === 1 ? t.corpo : t.corpoMultiplo.replace('{n}', String(n)),
    '',
    ...linhasLegislacao,
    ...(linhasCorrecao.length > 0 ? ['', ...(idioma === 'en' ? ['Suggested action:'] : idioma === 'es' ? ['Acción sugerida:'] : ['Ação sugerida:']), ...linhasCorrecao] : []),
    '',
    ...referencias,
    '',
    t.baseLegal,
    '',
    t.encerramento,
  ].join('\n')

  return { assunto, corpo }
}

export function montarMensagemNotificacaoRiscoSmartRead(risco: RiscoAduaneiroLeitura): string {
  return montarMensagemNotificacaoRiscosSmartRead([risco])
}

export function montarMensagemNotificacaoRiscosSmartRead(riscos: RiscoAduaneiroLeitura[]): string {
  const linhas = riscos.map((risco) => {
    const r = aplicarCorrecaoSugeridaPadraoRisco(risco)
    const evidencia = r.evidencias[0]
    const onde = evidencia ? [evidencia.documento, evidencia.campo].filter(Boolean).join(' · ') : NOME_PRODUTO_EXIBICAO
    return [`[${r.severidade}] ${r.titulo}`, onde, r.correcao_sugerida ?? r.analise].join(' — ')
  })
  return [`[${NOME_PRODUTO_EXIBICAO}] ${riscos.length} risco(s) na conferência`, ...linhas].join('\n')
}
