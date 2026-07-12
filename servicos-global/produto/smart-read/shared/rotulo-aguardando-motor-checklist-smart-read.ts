/**
 * rotulo-aguardando-motor-checklist-smart-read.ts — textos padronizados do spinner por motor
 */

import type { MotorValidacaoMatrizPackingList } from './matriz-validacao-packing-list-smart-read.js'

export type FaseEnriquecimentoAnaliseRiscos = 'api' | 'llm'

export function rotuloAguardandoMotorChecklistSmartRead(
  motor: string,
  fase?: FaseEnriquecimentoAnaliseRiscos | null,
): { resultado: string; detalhe: string } {
  if (motor === 'api' || fase === 'api') {
    return {
      resultado: 'Aguardando Receita…',
      detalhe: 'Consulta à Receita Federal em andamento',
    }
  }
  if (motor === 'cross_doc') {
    return {
      resultado: 'Aguardando cruzamento documental…',
      detalhe: 'Cruzamento entre documentos em andamento',
    }
  }
  if (motor === 'cross_doc_rag') {
    return {
      resultado: 'Aguardando IA e cruzamento…',
      detalhe: 'Analista IA e cruzamento documental em andamento',
    }
  }
  if (motor === 'lpco') {
    return {
      resultado: 'Aguardando LPCO…',
      detalhe: 'Consulta ao módulo LPCO do Portal Único em andamento',
    }
  }
  if (motor === 'rag' || motor === 'api_llm' || motor === 'codigo_rag') {
    return {
      resultado: 'Aguardando IA…',
      detalhe: 'Analista IA com base normativa em andamento',
    }
  }
  return {
    resultado: 'Aguardando IA…',
    detalhe: 'Analista IA em execução',
  }
}

export function motorAguardaEnriquecimentoServidor(motor: string): boolean {
  const motores: MotorValidacaoMatrizPackingList[] = [
    'llm',
    'rag',
    'api_llm',
    'cross_doc_rag',
    'cross_doc',
    'api',
    'lpco',
  ]
  return motores.includes(motor as MotorValidacaoMatrizPackingList)
}
