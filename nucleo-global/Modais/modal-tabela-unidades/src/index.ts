/**
 * @nucleo/modal-tabela-unidades
 * Modal com tabela de unidades + InputUnidade + hook canônico de listagem.
 *
 * Fonte da verdade: a lista de unidades vem do banco
 * `gravity-cadastros-*.unidade` via endpoint `/api/v1/cadastros/unidades`.
 * O hook `useUnidades()` cacheia em memória (singleton de módulo) e
 * expõe estado de loading/erro.
 *
 * Exportações:
 *   - ModalTabelaUnidadesGlobal — modal completo com tabela e busca
 *   - InputUnidade              — campo número + select de unidade
 *   - useUnidades               — hook React que retorna a lista canônica
 *   - invalidarCacheUnidades    — limpa o cache em memória (testes/mutações)
 *   - Unidade                   — tipo TypeScript da entidade do banco
 *   - TipoUnidade               — categoria (peso, volume, embalagem, ...)
 */

export { ModalTabelaUnidadesGlobal } from './ModalTabelaUnidadesGlobal.js'
export type { ModalTabelaUnidadesProps } from './ModalTabelaUnidadesGlobal.js'

export { InputUnidade } from './InputUnidade.js'
export type { InputUnidadeProps } from './InputUnidade.js'

export {
  useUnidades,
  invalidarCacheUnidades,
  unidadeSchema,
  listaUnidadesSchema,
  tipoUnidadeEnum,
} from './useUnidades.js'
export type { Unidade, UseUnidadesResult, TipoUnidade } from './useUnidades.js'
