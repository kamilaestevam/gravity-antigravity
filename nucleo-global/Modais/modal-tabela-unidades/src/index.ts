/**
 * @nucleo/modal-tabela-unidades
 * Modal com tabela de unidades de medida Siscomex + InputUnidade composto.
 *
 * Exportações:
 *   - ModalTabelaUnidades  — modal completo com tabela e busca
 *   - InputUnidade         — campo número + select de unidade (lado a lado)
 *   - UNIDADES_SISCOMEX    — lista completa de unidades Siscomex
 *   - OPCOES_UOM           — formato SelectOpcao para SelectGlobal
 *   - UNIDADES_PESO        — subconjunto: KG, KGBR, G, TON
 *   - UnidadeMedida        — tipo TypeScript
 */

export { ModalTabelaUnidades } from './ModalUnidadesTabela.js'
export type { ModalTabelaUnidadesProps } from './ModalUnidadesTabela.js'

export { InputUnidade } from './InputUnidade.js'
export type { InputUnidadeProps } from './InputUnidade.js'

export { UNIDADES_SISCOMEX, OPCOES_UOM, UNIDADES_PESO } from './dados.js'
export type { UnidadeMedida } from './dados.js'
