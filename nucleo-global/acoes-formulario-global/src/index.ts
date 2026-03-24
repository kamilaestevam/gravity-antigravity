/**
 * @nucleo/acoes-formulario-global — index
 * Ponto único de exportação.
 *
 * Componentes:
 *   - AcoesFormulario  → barra composta (Cancelar + Salvar) com animação
 *   - BotaoSalvar      → botão primário isolado
 *   - BotaoCancelar    → botão fantasma isolado
 *
 * Hook:
 *   - useDirty         → detecta alterações pendentes no formulário
 */

export { AcoesFormulario, BotaoSalvar, BotaoCancelar } from './acoes-formulario.js'
export { useDirty } from './use-dirty.js'
export type { AcoesFormularioProps, BotaoSalvarProps, BotaoCancelarProps } from './tipos.js'
