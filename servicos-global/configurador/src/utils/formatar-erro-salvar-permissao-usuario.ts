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

const MENSAGENS_POR_CODIGO_AUTH: Record<string, MensagemErroVisaoFornecedorPermissao> = {
  UNAUTHORIZED: {
    titulo: 'Sessão expirada ou sem autenticação',
    motivo: 'O token de autenticação não foi enviado ou não é mais válido.',
    passos: [
      'Recarregue a página (F5) ou saia e entre novamente.',
      'Depois reabra o usuário e salve as permissões.',
    ],
  },
  FORBIDDEN: {
    titulo: 'Não foi possível atualizar vínculos ou permissões',
    motivo: 'O servidor recusou a operação (workspace inválido/inativo ou sem permissão).',
    passos: [
      'Abra a aba Workspaces Vinculados e confira se os workspaces estão ativos.',
      'Remova vínculos inválidos, salve, e tente de novo as permissões.',
      'Se você for Admin (read-only), peça a um Super Admin para salvar.',
    ],
  },
  EDICAO_PROPRIA_NAO_PERMITIDA: {
    titulo: 'Não é permitido editar a si mesmo',
    motivo: 'Por segurança, vínculos e permissões do próprio usuário não podem ser alterados por esta tela.',
    passos: [
      'Peça a outro Super Admin ou Master para aplicar a alteração.',
    ],
  },
}

function resolverMensagem(
  code: string | undefined,
  message: string,
  details: string[],
): MensagemErroVisaoFornecedorPermissao {
  if (code) {
    const cfgFornecedor = mensagemErroVisaoFornecedorPorCodigo(code)
    if (cfgFornecedor) {
      return {
        titulo: cfgFornecedor.titulo,
        motivo: message || cfgFornecedor.motivo,
        passos: details.length > 0 ? details : cfgFornecedor.passos,
      }
    }
    const cfgAuth = MENSAGENS_POR_CODIGO_AUTH[code]
    if (cfgAuth) {
      return {
        titulo: cfgAuth.titulo,
        motivo: message || cfgAuth.motivo,
        passos: details.length > 0 ? details : cfgAuth.passos,
      }
    }
  }
  return {
    titulo: 'Não foi possível salvar as permissões',
    motivo: message,
    passos: details.length > 0
      ? details
      : [
          message || 'Revise os dados do usuário e tente novamente.',
          'Se persistir, contate o suporte com o horário do erro.',
        ],
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

  // Preferir motivo da API no toast — passos genéricos escondiam 401/403 reais.
  const resumoToast = cfg.motivo || cfg.passos[0] || 'Tente novamente.'
  const toast = escopo
    ? `${cfg.titulo} (${escopo}). ${resumoToast}`
    : `${cfg.titulo}. ${resumoToast}`

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
