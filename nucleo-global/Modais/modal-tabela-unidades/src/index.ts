/**
 * @nucleo/modal-tabela-unidades
 * Modal com tabela de unidades de medida Siscomex + InputUnidade composto.
 *
 * Exportações:
 *   - ModalTabelaUnidadesGlobal  — modal completo com tabela e busca
 *   - InputUnidade         — campo número + select de unidade (lado a lado)
 *   - UNIDADES_SISCOMEX    — lista completa de unidades Siscomex
 *   - OPCOES_UOM           — formato SelectOpcao para SelectGlobal
 *   - UNIDADES_PESO        — subconjunto: KG, KGBR, G, TON
 *   - UnidadeMedida        — tipo TypeScript
 */

export { ModalTabelaUnidadesGlobal } from './ModalTabelaUnidadesGlobal.js'
export type { ModalTabelaUnidadesProps } from './ModalTabelaUnidadesGlobal.js'

export { InputUnidade } from './InputUnidade.js'
export type { InputUnidadeProps } from './InputUnidade.js'

export { UNIDADES_SISCOMEX, OPCOES_UOM, UNIDADES_PESO } from './dados.js'
export type { UnidadeMedida } from './dados.js'
