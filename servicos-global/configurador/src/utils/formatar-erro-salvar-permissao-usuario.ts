import {
  mensagemErroVisaoFornecedorPorCodigo,
  type MensagemErroVisaoFornecedorPermissao,
} from '../../shared/mensagens-erro-visao-fornecedor-permissao.js'
import { isGravityApiError } from './gravity-api-error.js'

export interface ContextoErroSalvarPermissao {
  nomeProduto?: string
  nomeWorkspace?: string
}

export interface ErroSalvarPermissaoFormatado {
  /** Uma linha — toast */
  toast: string
  /** Multilinha — banner no modal */
  modal: string
}

function resolverMensagem(
  code: string | undefined,
  message: string,
  details: string[],
): MensagemErroVisaoFornecedorPermissao {
  if (code) {
    const cfg = mensagemErroVisaoFornecedorPorCodigo(code)
    if (cfg) {
      return {
        titulo: cfg.titulo,
        motivo: message || cfg.motivo,
        passos: details.length > 0 ? details : cfg.passos,
      }
    }
  }
  return {
    titulo: 'Não foi possível salvar as permissões',
    motivo: message,
    passos: details.length > 0
      ? details
      : ['Revise os dados do usuário e tente novamente.', 'Se persistir, contate o suporte com o horário do erro.'],
  }
}

export function formatarErroSalvarPermissaoUsuario(
  err: unknown,
  contexto: ContextoErroSalvarPermissao = {},
): ErroSalvarPermissaoFormatado {
  const code = isGravityApiError(err) ? err.code : undefined
  const message = err instanceof Error ? err.message : 'Falha desconhecida ao salvar permissões.'
  const details = isGravityApiError(err) ? err.details : []

  const cfg = resolverMensagem(code, message, details)

  const escopo = [
    contexto.nomeProduto ? `produto «${contexto.nomeProduto}»` : null,
    contexto.nomeWorkspace ? `workspace «${contexto.nomeWorkspace}»` : null,
  ].filter(Boolean).join(' · ')

  const toast = escopo
    ? `${cfg.titulo} (${escopo}). ${cfg.passos[0] ?? cfg.motivo}`
    : `${cfg.titulo}. ${cfg.passos[0] ?? cfg.motivo}`

  const linhasModal = [
    cfg.titulo,
    escopo ? `Contexto: ${escopo}.` : '',
    '',
    'Motivo:',
    cfg.motivo,
    '',
    'O que fazer:',
    ...cfg.passos.map((p) => `• ${p}`),
  ].filter((linha, idx) => !(linha === '' && idx === 2))

  return {
    toast,
    modal: linhasModal.join('\n'),
  }
}
