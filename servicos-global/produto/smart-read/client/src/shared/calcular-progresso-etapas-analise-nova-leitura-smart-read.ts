/**
 * Progresso simulado do pipeline IA (passo 2) — só atinge 100% quando a análise real termina.
 */

export type EtapaAnaliseProgresso = {
  id: number
  rotulo: string
  progresso: number
  status: 'pendente' | 'andamento' | 'completo'
}

export const PROGRESSO_MAXIMO_AGUARDANDO_ANALISE = 99
const TEMPO_FASE_RAPIDA_S = 16

function progressoLinearEtapa(
  elapsedSegundos: number,
  inicioEtapa: number,
  duracaoEtapa: number,
): number {
  if (elapsedSegundos <= inicioEtapa) return 0
  const linear = Math.round(((elapsedSegundos - inicioEtapa) / duracaoEtapa) * 100)
  return Math.min(PROGRESSO_MAXIMO_AGUARDANDO_ANALISE, linear)
}

function aplicarCreepAposFaseRapida(progresso: number, elapsedSegundos: number): number {
  if (elapsedSegundos <= TEMPO_FASE_RAPIDA_S) return progresso
  const extra = elapsedSegundos - TEMPO_FASE_RAPIDA_S
  const creep = Math.min(PROGRESSO_MAXIMO_AGUARDANDO_ANALISE - progresso, Math.floor(extra / 8))
  return Math.min(PROGRESSO_MAXIMO_AGUARDANDO_ANALISE, progresso + creep)
}

function statusEtapaEmAndamento(progresso: number): EtapaAnaliseProgresso['status'] {
  if (progresso <= 0) return 'pendente'
  return 'andamento'
}

export function calcularProgressoEtapasAnaliseNovaLeituraSmartRead(
  elapsedSegundos: number,
  analiseCompleta: boolean,
  processamentoComErro: boolean,
): EtapaAnaliseProgresso[] {
  if (processamentoComErro) {
    return [
      { id: 1, rotulo: 'Primeira análise', progresso: 0, status: 'pendente' },
      { id: 2, rotulo: 'Segunda análise', progresso: 0, status: 'pendente' },
      { id: 3, rotulo: 'Terceira análise', progresso: 0, status: 'pendente' },
    ]
  }

  if (analiseCompleta) {
    return [
      { id: 1, rotulo: 'Primeira análise', progresso: 100, status: 'completo' },
      { id: 2, rotulo: 'Segunda análise', progresso: 100, status: 'completo' },
      { id: 3, rotulo: 'Terceira análise', progresso: 100, status: 'completo' },
    ]
  }

  const p1 = aplicarCreepAposFaseRapida(progressoLinearEtapa(elapsedSegundos, 0, 6), elapsedSegundos)
  const p2 = aplicarCreepAposFaseRapida(progressoLinearEtapa(elapsedSegundos, 4, 8), elapsedSegundos)
  const p3 = aplicarCreepAposFaseRapida(progressoLinearEtapa(elapsedSegundos, 10, 6), elapsedSegundos)

  return [
    { id: 1, rotulo: 'Primeira análise', progresso: p1, status: statusEtapaEmAndamento(p1) },
    { id: 2, rotulo: 'Segunda análise', progresso: p2, status: statusEtapaEmAndamento(p2) },
    { id: 3, rotulo: 'Terceira análise', progresso: p3, status: statusEtapaEmAndamento(p3) },
  ]
}
