/**
 * fase-enriquecimento-analise-riscos-smart-read.ts — api (Receita/NCM) vs llm em voo
 */

import type { FaseEnriquecimentoAnaliseRiscos } from '../../../shared/rotulo-aguardando-motor-checklist-smart-read'

const fasePorChave = new Map<string, FaseEnriquecimentoAnaliseRiscos | null>()

export function marcarFaseEnriquecimentoAnaliseRiscosSmartRead(
  chave: string,
  fase: FaseEnriquecimentoAnaliseRiscos | null,
): void {
  if (fase === null) fasePorChave.delete(chave)
  else fasePorChave.set(chave, fase)
}

export function obterFaseEnriquecimentoAnaliseRiscosSmartRead(
  chave: string,
): FaseEnriquecimentoAnaliseRiscos | null {
  return fasePorChave.get(chave) ?? null
}

export function limparFasesEnriquecimentoAnaliseRiscosSmartRead(): void {
  fasePorChave.clear()
}
