export function formatarDataHistorico(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export const ACAO_PARTICIPIO: Record<string, string> = {
  CRIAR:       'Criou',
  ATUALIZAR:   'Atualizou',
  EXCLUIR:     'Excluiu',
  ENTRAR:      'Entrou',
  SAIR:        'Saiu',
  CONVIDAR:    'Convidou',
  CONSULTAR:   'Consultou',
  EXPORTAR:    'Exportou',
  ANULAR:      'Anulou',
  ENVIAR:      'Enviou',
  DUPLICAR:    'Duplicou',
  TRANSFERIR:  'Transferiu',
  CONSOLIDAR:  'Consolidou',
  ANONIMIZAR:  'Anonimizou',
  EXCLUIR_ITENS:                    'Excluiu itens',
  EXCLUIR_AUTOMATICAMENTE:          'Excluiu automaticamente',
  EXCLUIR_DADO:                     'Excluiu dado',
  EDITAR_EM_MASSA:                  'Editou em massa',
  REVERTER_TRANSFERENCIA:           'Reverteu transferência',
  ALTERAR_STATUS:                   'Alterou status',
  ALTERAR_PATENTE:                  'Alterou patente',
  REVOGAR_SESSAO:                   'Revogou sessão',
  FALHAR_AUTENTICACAO:              'Falhou autenticação',
  FALHAR_ASSINATURA_WEBHOOK:        'Falhou assinatura webhook',
  TENTAR_ACESSO_OUTRA_ORGANIZACAO:  'Tentou acessar outra organização',
  ATINGIR_LIMITE_TAXA:              'Atingiu limite de taxa',
  ACESSAR_ADMIN:                    'Acessou área Admin',
  CHAMAR_API:                       'Chamou API',
  CONCLUIR_JOB:                     'Concluiu job',
  FALHAR_JOB:                       'Falhou job',
  SINCRONIZAR_NCM:                  'Sincronizou NCM',
  AGENDAR_SINCRONIZACAO_NCM:        'Agendou sincronização NCM',
  INICIAR_EXECUCAO_TESTES:          'Iniciou execução de testes',
  CONCLUIR_EXECUCAO_TESTES:         'Concluiu execução de testes',
  INGERIR_LOGS_TESTE:               'Ingeriu logs de teste',
  GERAR_PLANO_TESTE:                'Gerou plano de teste',
  EXPANDIR_PLANO_TESTE:             'Expandiu plano de teste',
  REANALISAR_TESTE:                 'Reanalisou teste',
  APLICAR_CORRECAO_TESTE:           'Aplicou correção em teste',
  REJEITAR_ANALISE_TESTE:           'Rejeitou análise de teste',
  EXECUTAR_PENTEST:                 'Executou pentest',
  CRIAÇÃO:     'Criou',
  ALTERAÇÃO:   'Alterou',
  EXCLUSÃO:    'Excluiu',
}

function humanizar(codigo: string): string {
  return codigo
    .split('_')
    .map((p) => p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : '')
    .join(' ')
}

export function rotuloAcao(codigo: string | null | undefined): string {
  if (!codigo) return '—'
  return ACAO_PARTICIPIO[codigo] ?? humanizar(codigo)
}
