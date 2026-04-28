/**
 * @nucleo/modal-tabela-moeda
 * Modal com tabela de moedas ISO 4217 / Siscomex + InputMoeda composto.
 *
 * Exportações:
 *   - ModalTabelaMoedaGlobal   — modal completo com tabela e busca
 *   - InputMoeda         — campo select de moeda + número (lado a lado)
 *   - MOEDAS_SISCOMEX    — lista completa de moedas
 *   - OPCOES_MOEDA       — formato SelectOpcao para SelectGlobal
 *   - MOEDAS_PRINCIPAIS  — subconjunto: USD, EUR, BRL, CNY, GBP, JPY
 *   - MoedaSiscomex      — tipo TypeScript
 */

export { ModalTabelaMoedaGlobal } from './ModalTabelaMoedaGlobal.js'
export type { ModalTabelaMoedaProps } from './ModalTabelaMoedaGlobal.js'

export { InputMoeda } from './InputMoeda.js'
export type { InputMoedaProps } from './InputMoeda.js'

export { MOEDAS_SISCOMEX, OPCOES_MOEDA, MOEDAS_PRINCIPAIS } from './dados.js'
export type { MoedaSiscomex } from './dados.js'
