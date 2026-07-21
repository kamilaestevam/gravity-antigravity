import { isGravityApiError } from './gravity-api-error.js'

export interface ErroSalvarWorkspacesFormatado {
  /** Uma linha — toast */
  toast: string
  /** Multilinha — banner no modal */
  modal: string
}

interface MensagemErroWorkspace {
  titulo: string
  motivo: string
  passos: string[]
}

const MENSAGENS_POR_CODIGO: Record<string, MensagemErroWorkspace> = {
  UNAUTHORIZED: {
    titulo: 'Sessão expirada ou sem autenticação',
    motivo: 'O token de autenticação não foi enviado ou não é mais válido.',
    passos: [
      'Recarregue a página (F5) ou saia e entre novamente.',
      'Depois reabra o usuário e salve os workspaces vinculados.',
    ],
  },
  FORBIDDEN: {
    titulo: 'Não foi possível atualizar os workspaces vinculados',
    motivo: 'O servidor recusou a operação (workspace inválido, inativo ou fora da organização).',
    passos: [
      'Abra a aba Workspaces Vinculados e confira se os workspaces estão ativos.',
      'Remova vínculos inválidos e salve novamente.',
      'Se você for Admin (read-only), peça a um Super Admin para salvar.',
    ],
  },
  EDICAO_PROPRIA_NAO_PERMITIDA: {
    titulo: 'Não é permitido editar os próprios vínculos',
    motivo: 'Por segurança, você não pode alterar os workspaces vinculados à sua própria conta nesta tela.',
    passos: [
      'Peça a outro Super Admin ou Master para aplicar a alteração.',
    ],
  },
  INVALID_OPERATION: {
    titulo: 'Tipo de usuário não vincula a workspaces',
    motivo: 'Master, Admin e Super Admin têm acesso global e não usam vínculos formais de workspace.',
    passos: [
      'Altere apenas usuários Standard ou Fornecedor.',
    ],
  },
  VALIDATION_ERROR: {
    titulo: 'Dados de workspace inválidos',
    motivo: 'A lista de workspaces enviada não passou na validação.',
    passos: [
      'Feche e reabra o modal, selecione os workspaces novamente e salve.',
    ],
  },
  NOT_FOUND: {
    titulo: 'Usuário não encontrado',
    motivo: 'O usuário alvo não existe ou não está acessível para esta operação.',
    passos: [
      'Recarregue a lista de usuários e tente novamente.',
    ],
  },
}

function resolverMensagem(
  code: string | undefined,
  message: string,
  details: string[],
): MensagemErroWorkspace {
  if (code) {
    const cfg = MENSAGENS_POR_CODIGO[code]
    if (cfg) {
      return {
        titulo: cfg.titulo,
        motivo: message || cfg.motivo,
        passos: details.length > 0 ? details : cfg.passos,
      }
    }
  }
  return {
    titulo: 'Não foi possível atualizar os workspaces vinculados',
    motivo: message,
    passos: details.length > 0
      ? details
      : [
          message || 'Revise os workspaces vinculados e tente novamente.',
          'Se persistir, contate o suporte com o horário do erro.',
        ],
  }
}

/** Formata erro do PUT /api/v1/usuarios/:id/workspaces para toast + banner. */
export function formatarErroSalvarWorkspacesUsuario(err: unknown): ErroSalvarWorkspacesFormatado {
  const code = isGravityApiError(err) ? err.code : undefined
  const message = err instanceof Error ? err.message : 'Falha desconhecida ao atualizar workspaces.'
  const details = isGravityApiError(err) ? err.details : []

  const cfg = resolverMensagem(code, message, details)
  const resumoToast = cfg.motivo || cfg.passos[0] || 'Tente novamente.'

  const linhasModal = [
    cfg.titulo,
    '',
    'Motivo:',
    cfg.motivo,
    '',
    'O que fazer:',
    ...cfg.passos.map((p) => `• ${p}`),
  ]

  return {
    toast: `${cfg.titulo}. ${resumoToast}`,
    modal: linhasModal.join('\n'),
  }
}
