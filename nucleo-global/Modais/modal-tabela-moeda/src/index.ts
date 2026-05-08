/**
 * @nucleo/modal-tabela-moeda
 * Modal com tabela de moedas + InputMoeda + hook canônico de listagem.
 *
 * Fonte da verdade: a lista de moedas vem do banco `gravity-cadastros-*.moeda`
 * via endpoint `/api/v1/cadastros/moedas`. O hook `useMoedas()` cacheia em
 * memória (singleton de módulo) e expõe estado de loading/erro.
 *
 * Exportações:
 *   - ModalTabelaMoedaGlobal — modal completo com tabela e busca
 *   - InputMoeda             — campo select de moeda + número (lado a lado)
 *   - useMoedas              — hook React que retorna a lista canônica
 *   - invalidarCacheMoedas   — limpa o cache em memória (testes/mutações)
 *   - Moeda                  — tipo TypeScript da entidade do banco
 */

export { ModalTabelaMoedaGlobal } from './ModalTabelaMoedaGlobal.js'
export type { ModalTabelaMoedaProps } from './ModalTabelaMoedaGlobal.js'

export { InputMoeda } from './InputMoeda.js'
export type { InputMoedaProps } from './InputMoeda.js'

export { useMoedas, invalidarCacheMoedas, moedaSchema, listaMoedasSchema } from './useMoedas.js'
export type { Moeda, UseMoedasResult } from './useMoedas.js'
