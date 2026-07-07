/**
 * SSOT — ritmo vertical e alinhamento dos manuais University Gravity (Login, Hub, Configurador…).
 *
 * Documentação: documentos-tecnicos/produtos-gravity/university-gravity/ONBOARDING-DOCUMENTO.md §9.1.1 e §9.1.2
 *
 * Com font-size 0.9rem e line-height 1.8, 12px entre parágrafos ≈ 0,75 linha:
 * separa ideias sem “buraco” excessivo (evita 18–24px ad hoc espalhados no código).
 */
export const MANUAL_ESPACO_PARAGRAFO_PX = 12

/** Parágrafos dentro de subtópico em acordeão — respiro extra para leitura confortável. */
export const MANUAL_ESPACO_PARAGRAFO_ACORDEAO_PX = 16

/** Espaço entre bloco de texto e screenshot em subtópico recolhível. */
export const MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX = 6

/** Raio de chips/badges nos manuais (igual aos cards Versão · Produto · URL). */
export const MANUAL_RAIO_CHIP = 10

/** Alinhamento do corpo narrativo (parágrafos e callouts) em todos os manuais descritivos. */
export const MANUAL_ALINHAMENTO_CORPO = 'justify' as const

/** Tipografia base do corpo (sem cor — aplicar MANUAL_CORPO_70 no componente). */
export const MANUAL_CORPO_TIPOGRAFIA = {
  fontSize: '.9rem',
  lineHeight: 1.8,
  textAlign: MANUAL_ALINHAMENTO_CORPO,
  textJustify: 'inter-word',
} as const

/** Grid 50/50 texto + screenshot nas intros laterais (evita coluna estreita que impede justificar). */
export const MANUAL_GRID_TEXTO_IMAGEM = 'minmax(300px, 1fr) minmax(300px, 1fr)' as const

/** Altura fixa da legenda chip+texto em grades 3 colunas (Igual/Divergente/Vazio alinhados). */
export const MANUAL_ALTURA_LEGENDA_CHIP_GRADE_PX = 96

/** Edição em massa passo 1 — legendas mais curtas (nível Pedido/Item/Combinado). */
export const MANUAL_ALTURA_LEGENDA_CHIP_EDICAO_MASSA_NIVEL_PX = 48

/** Edição em massa passo 1 — legendas com texto em duas linhas (texto/select/+ campo). */
export const MANUAL_ALTURA_LEGENDA_CHIP_EDICAO_MASSA_CAMPO_PX = 72

/** Espaço entre o fim de um passo visual e a linha divisória do passo seguinte (≈ paddingTop do passo). */
export const MANUAL_ESPACO_ENTRE_PASSOS_PX = 22

/** Gap horizontal entre colunas em galerias PASSO (prints lado a lado). */
export const MANUAL_ESPACO_GRADE_GALERIA_PX = 24

/** Retorna margin-bottom: 12px entre parágrafos, 0 no último de cada bloco. */
export function manualMargemParagrafo(indice: number, total: number): number {
  return indice < total - 1 ? MANUAL_ESPACO_PARAGRAFO_PX : 0
}

/** Parágrafo seguido de callout no mesmo índice: sem margin-bottom (o callout define o respiro). */
export function manualMargemParagrafoAntesCallout(
  indice: number,
  total: number,
  indiceCallout?: number,
): number {
  if (indiceCallout === indice) return 0
  return manualMargemParagrafo(indice, total)
}

/** Callout entre parágrafos: 12px acima e abaixo quando há parágrafo depois. */
export function manualMargemCalloutAposParagrafo(indiceCallout: number, totalParagrafos: number): {
  marginTop: number
  marginBottom: number
} {
  return {
    marginTop: MANUAL_ESPACO_PARAGRAFO_PX,
    marginBottom: indiceCallout < totalParagrafos - 1 ? MANUAL_ESPACO_PARAGRAFO_PX : 0,
  }
}
