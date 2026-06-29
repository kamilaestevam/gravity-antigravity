/**
 * SSOT — ritmo vertical e alinhamento dos manuais University Gravity (Login, Hub, Configurador…).
 *
 * Documentação: documentos-tecnicos/produtos-gravity/university-gravity/ONBOARDING-DOCUMENTO.md §9.1.1 e §9.1.2
 *
 * Com font-size 0.9rem e line-height 1.8, 12px entre parágrafos ≈ 0,75 linha:
 * separa ideias sem “buraco” excessivo (evita 18–24px ad hoc espalhados no código).
 */
export const MANUAL_ESPACO_PARAGRAFO_PX = 12

/** Alinhamento do corpo narrativo (parágrafos e callouts) em todos os manuais descritivos. */
export const MANUAL_ALINHAMENTO_CORPO = 'justify' as const

/** Espaço entre o fim de um passo visual e a linha divisória do passo seguinte (≈ paddingTop do passo). */
export const MANUAL_ESPACO_ENTRE_PASSOS_PX = 22

/** Retorna margin-bottom: 12px entre parágrafos, 0 no último de cada bloco. */
export function manualMargemParagrafo(indice: number, total: number): number {
  return indice < total - 1 ? MANUAL_ESPACO_PARAGRAFO_PX : 0
}
