/**
 * SSOT — erros ao conceder `visao_fornecedor:cotar` (Configurador → Permissões).
 * Usado no backend (AppError) e no frontend (toast + banner do modal).
 */

export const CODIGO_ERRO_FORNECEDOR_NAO_PROVISIONADO = 'FORNECEDOR_NAO_PROVISIONADO' as const
export const CODIGO_ERRO_FORNECEDOR_PENDENTE_APROVACAO = 'FORNECEDOR_PENDENTE_APROVACAO' as const
export const CODIGO_ERRO_FORNECEDOR_VINCULO_INATIVO = 'FORNECEDOR_VINCULO_INATIVO' as const
export const CODIGO_ERRO_FORNECEDOR_VINCULO_ORG_DIVERGENTE = 'FORNECEDOR_VINCULO_ORG_DIVERGENTE' as const
export const CODIGO_ERRO_BID_SYNC_FALHOU = 'BID_SYNC_FALHOU' as const
export const CODIGO_ERRO_BID_SYNC_INDISPONIVEL = 'BID_SYNC_INDISPONIVEL' as const

export type CodigoErroVisaoFornecedorPermissao =
  | typeof CODIGO_ERRO_FORNECEDOR_NAO_PROVISIONADO
  | typeof CODIGO_ERRO_FORNECEDOR_PENDENTE_APROVACAO
  | typeof CODIGO_ERRO_FORNECEDOR_VINCULO_INATIVO
  | typeof CODIGO_ERRO_FORNECEDOR_VINCULO_ORG_DIVERGENTE
  | typeof CODIGO_ERRO_BID_SYNC_FALHOU
  | typeof CODIGO_ERRO_BID_SYNC_INDISPONIVEL

export interface MensagemErroVisaoFornecedorPermissao {
  titulo: string
  motivo: string
  passos: string[]
}

const PASSOS_CONVITE_FORNECEDOR = [
  'Abra Configurador → Fornecedores e confirme que a empresa do agente existe no cartório.',
  'Convide o usuário como tipo Fornecedor, selecionando categoria (ex.: Agente de carga) e a empresa do cartório.',
  'Peça ao usuário para aceitar o convite e fazer login (status deve ficar ATIVO).',
  'Volte em Usuários → Permissões e marque «Pode cotar frete internacional».',
] as const

export const MENSAGENS_ERRO_VISAO_FORNECEDOR_PERMISSAO: Record<
  CodigoErroVisaoFornecedorPermissao,
  MensagemErroVisaoFornecedorPermissao
> = {
  [CODIGO_ERRO_FORNECEDOR_NAO_PROVISIONADO]: {
    titulo: 'Fornecedor não provisionado no Cadastros',
    motivo:
      'Este usuário ainda não tem vínculo ativo entre conta Gravity e empresa fornecedora no Cadastros.',
    passos: [...PASSOS_CONVITE_FORNECEDOR],
  },
  [CODIGO_ERRO_FORNECEDOR_PENDENTE_APROVACAO]: {
    titulo: 'Vínculo do fornecedor aguarda aprovação',
    motivo:
      'Existe cadastro de fornecedor, mas o vínculo na organização está com status PENDENTE_APROVACAO.',
    passos: [
      'Conclua a aprovação do vínculo do fornecedor no Cadastros (status ATIVO).',
      'Depois marque «Pode cotar frete internacional» e salve novamente.',
    ],
  },
  [CODIGO_ERRO_FORNECEDOR_VINCULO_INATIVO]: {
    titulo: 'Vínculo do fornecedor está inativo',
    motivo: 'O vínculo fornecedor_organizacao existe, mas está INATIVO nesta organização.',
    passos: [
      'Reative o vínculo do fornecedor no Cadastros ou reconvide o usuário com a empresa correta.',
      'Confirme status ATIVO antes de habilitar «Pode cotar frete internacional».',
    ],
  },
  [CODIGO_ERRO_FORNECEDOR_VINCULO_ORG_DIVERGENTE]: {
    titulo: 'Vínculo do fornecedor está em outra organização',
    motivo:
      'O usuário tem vínculo de fornecedor, mas não nesta organização. A permissão «cotar» exige vínculo ATIVO na mesma org do usuário.',
    passos: [
      'Convide o fornecedor vinculando-o à organização correta (org do importador/cliente).',
      'Ou edite permissões no workspace da organização onde o vínculo já está ATIVO.',
    ],
  },
  [CODIGO_ERRO_BID_SYNC_FALHOU]: {
    titulo: 'Falha ao sincronizar fornecedor no BID Frete',
    motivo: 'O Cadastros está ok, mas o espelho no BID Frete Internacional não foi atualizado.',
    passos: [
      'Verifique se o serviço BID Frete Internacional está rodando (porta 8023).',
      'Confirme CHAVE_INTERNA_SERVICO e BID_FRETE_INTERNATIONAL_SERVICE_URL no Configurador.',
      'Tente salvar a permissão novamente após o serviço voltar.',
    ],
  },
  [CODIGO_ERRO_BID_SYNC_INDISPONIVEL]: {
    titulo: 'Serviço BID indisponível para sincronização',
    motivo: 'CHAVE_INTERNA_SERVICO ausente no Configurador — não é possível vincular o usuário no BID.',
    passos: [
      'Configure CHAVE_INTERNA_SERVICO no .env do Configurador (mesmo valor dos demais serviços).',
      'Reinicie o Configurador e tente salvar novamente.',
    ],
  },
}

export function mensagemErroVisaoFornecedorPorCodigo(
  code: string,
): MensagemErroVisaoFornecedorPermissao | null {
  if (code in MENSAGENS_ERRO_VISAO_FORNECEDOR_PERMISSAO) {
    return MENSAGENS_ERRO_VISAO_FORNECEDOR_PERMISSAO[code as CodigoErroVisaoFornecedorPermissao]
  }
  return null
}

export function criarAppErrorVisaoFornecedorPermissao(
  code: CodigoErroVisaoFornecedorPermissao,
  statusCode = 422,
): { message: string; code: string; statusCode: number; details: string[] } {
  const cfg = MENSAGENS_ERRO_VISAO_FORNECEDOR_PERMISSAO[code]
  return {
    message: cfg.motivo,
    code,
    statusCode,
    details: [...cfg.passos],
  }
}
