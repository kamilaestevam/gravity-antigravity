// Mock data for Historico — used in development/tests only.
// Actors and events represent realistic audit trail scenarios.

type TipoAtorHistoricoLog = 'USUARIO' | 'API' | 'IA' | 'JOB' | 'INTEGRACAO'
type StatusHistoricoLog = 'SUCESSO' | 'FALHA' | 'PARCIAL'

export interface MockAtor {
  nome: string
  tipo: TipoAtorHistoricoLog
  id: string
  ip?: string
}

export interface MockEvento {
  modulo_historico_log: string
  tipo_recurso_historico_log: string
  acao_historico_log: string
  detalhe_acao_historico_log: string
  estado_anterior_historico_log?: Record<string, unknown>
  estado_posterior_historico_log?: Record<string, unknown>
  status_historico_log?: StatusHistoricoLog
  mensagem_erro_historico_log?: string
}

export const ATORES: MockAtor[] = [
  { nome: 'Daniel Martins', tipo: 'USUARIO', id: 'user_001', ip: '187.45.12.88' },
  { nome: 'Ana Souza', tipo: 'USUARIO', id: 'user_002', ip: '200.186.30.5' },
  { nome: 'Carlos Lima', tipo: 'USUARIO', id: 'user_003', ip: '177.92.44.201' },
  { nome: 'Fernanda Costa', tipo: 'USUARIO', id: 'user_004', ip: '189.6.77.12' },
  { nome: 'Gabi AI', tipo: 'IA', id: 'ai_gabi', ip: undefined },
  { nome: 'API Externa v2', tipo: 'API', id: 'api_ext_v2', ip: '54.230.101.5' },
  { nome: 'API Marketplace', tipo: 'API', id: 'api_market', ip: '52.11.200.14' },
  { nome: 'Cron: Receita Federal', tipo: 'JOB', id: 'job_receita', ip: undefined },
  { nome: 'Cron: Backup Diário', tipo: 'JOB', id: 'job_backup', ip: undefined },
  { nome: 'Cron: Partition Manager', tipo: 'JOB', id: 'job_partition', ip: undefined },
  { nome: 'SAP ERP Conector', tipo: 'INTEGRACAO', id: 'int_sap', ip: '10.0.0.50' },
  { nome: 'Siscomex Gateway', tipo: 'INTEGRACAO', id: 'int_siscomex', ip: '200.152.38.155' },
  { nome: 'Stripe Billing', tipo: 'INTEGRACAO', id: 'int_stripe', ip: '54.187.174.169' },
]

export const EVENTOS: MockEvento[] = [
  // Pedido
  { modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'Pedido', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Criou o pedido #PED-2026-0441 — Acme Importações Ltda', estado_posterior_historico_log: { numero: 'PED-2026-0441', status: 'RASCUNHO', valor: 152400.00, moeda: 'USD' } },
  { modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'Pedido', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Alterou status do pedido #PED-2026-0441 de RASCUNHO para CONFIRMADO', estado_anterior_historico_log: { status: 'RASCUNHO' }, estado_posterior_historico_log: { status: 'CONFIRMADO' } },
  { modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'Pedido', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Alterou valor do pedido #PED-2026-0440 de USD 98.000 para USD 112.500', estado_anterior_historico_log: { valor: 98000, moeda: 'USD', incoterm: 'FOB' }, estado_posterior_historico_log: { valor: 112500, moeda: 'USD', incoterm: 'CIF' } },
  { modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'Pedido', acao_historico_log: 'DELETE', detalhe_acao_historico_log: 'Excluiu o pedido #PED-2026-0438 — cancelado pelo cliente', estado_anterior_historico_log: { numero: 'PED-2026-0438', status: 'RASCUNHO', valor: 45000 } },
  { modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'ItemPedido', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Adicionou item NCM 8471.30.19 — Notebook Dell XPS 15" (Qtd: 50)', estado_posterior_historico_log: { ncm: '8471.30.19', descricao: 'Notebook Dell XPS 15"', qtd: 50, unitario: 1800 } },
  { modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'Pedido', acao_historico_log: 'EXPORT', detalhe_acao_historico_log: 'Exportou pedido #PED-2026-0441 em formato CSV (128 linhas)' },
  { modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'Pedido', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Falha ao atualizar pedido #PED-2026-0437 — campo obrigatório ausente', status_historico_log: 'FALHA', mensagem_erro_historico_log: 'ValidationError: campo "pais_origem" é obrigatório' },

  // Auth
  { modulo_historico_log: 'auth', tipo_recurso_historico_log: 'Session', acao_historico_log: 'LOGIN', detalhe_acao_historico_log: 'Login realizado com sucesso via email+senha' },
  { modulo_historico_log: 'auth', tipo_recurso_historico_log: 'Session', acao_historico_log: 'LOGOUT', detalhe_acao_historico_log: 'Logout realizado — sessão encerrada pelo usuário' },
  { modulo_historico_log: 'auth', tipo_recurso_historico_log: 'Session', acao_historico_log: 'SESSION_REVOKED', detalhe_acao_historico_log: 'Sessão revogada pelo administrador — inatividade de 30 dias', status_historico_log: 'PARCIAL' },
  { modulo_historico_log: 'auth', tipo_recurso_historico_log: 'Session', acao_historico_log: 'AUTH_FAILURE', detalhe_acao_historico_log: 'Tentativa de acesso negada — token JWT expirado', status_historico_log: 'FALHA', mensagem_erro_historico_log: 'TokenExpiredError: jwt expired at 2026-04-03T22:00:00Z' },
  { modulo_historico_log: 'auth', tipo_recurso_historico_log: 'Session', acao_historico_log: 'AUTH_FAILURE', detalhe_acao_historico_log: 'Tentativa de acesso a recurso sem permissão suficiente (role: STANDARD)', status_historico_log: 'FALHA', mensagem_erro_historico_log: 'ForbiddenError: role STANDARD não tem acesso a /api/admin' },
  { modulo_historico_log: 'auth', tipo_recurso_historico_log: 'Session', acao_historico_log: 'LOGIN', detalhe_acao_historico_log: 'Login via SSO Google Workspace' },

  // Nota Fiscal
  { modulo_historico_log: 'nf-importacao', tipo_recurso_historico_log: 'NotaFiscal', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Criou NF-e #55002 — Importação de equipamentos eletrônicos', estado_posterior_historico_log: { numero: '55002', valor: 284500.00, cfop: '3102', emitente: 'Dell Inc.' } },
  { modulo_historico_log: 'nf-importacao', tipo_recurso_historico_log: 'NotaFiscal', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Corrigiu CFOP da NF-e #55001 de 3102 para 3128', estado_anterior_historico_log: { cfop: '3102' }, estado_posterior_historico_log: { cfop: '3128' } },
  { modulo_historico_log: 'nf-importacao', tipo_recurso_historico_log: 'NotaFiscal', acao_historico_log: 'IMPORT', detalhe_acao_historico_log: 'Importou 14 notas fiscais via XML (lote #NF-LOTE-2026-04)', estado_posterior_historico_log: { quantidade: 14, formato: 'XML', tamanho_kb: 382 } },
  { modulo_historico_log: 'nf-importacao', tipo_recurso_historico_log: 'NotaFiscal', acao_historico_log: 'DELETE', detalhe_acao_historico_log: 'Excluiu NF-e #54998 — duplicidade identificada', estado_anterior_historico_log: { numero: '54998', status: 'RASCUNHO' } },
  { modulo_historico_log: 'nf-importacao', tipo_recurso_historico_log: 'NotaFiscal', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Falha ao processar NF-e #55003 — XML inválido', status_historico_log: 'FALHA', mensagem_erro_historico_log: 'XMLParseError: elemento <infNFe> ausente no arquivo enviado' },

  // LPCO
  { modulo_historico_log: 'lpco', tipo_recurso_historico_log: 'Licenca', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Criou LPCO #LI-2026-00891 — Licença de Importação para máquinas industriais', estado_posterior_historico_log: { numero: 'LI-2026-00891', tipo: 'LI', ncm: '8457.10.00', valor_usd: 875000 } },
  { modulo_historico_log: 'lpco', tipo_recurso_historico_log: 'Licenca', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Atualizou vencimento da LI #LI-2026-00891 para 30/06/2026', estado_anterior_historico_log: { vencimento: '2026-03-31' }, estado_posterior_historico_log: { vencimento: '2026-06-30' } },
  { modulo_historico_log: 'lpco', tipo_recurso_historico_log: 'Licenca', acao_historico_log: 'CONSULTA', detalhe_acao_historico_log: 'Consultou status da LI #LI-2026-00890 no Siscomex — retorno: DEFERIDA' },
  { modulo_historico_log: 'lpco', tipo_recurso_historico_log: 'Licenca', acao_historico_log: 'EXPORT', detalhe_acao_historico_log: 'Exportou relatório de LPCOs vencendo em 30 dias (22 registros)' },

  // SimulaCusto
  { modulo_historico_log: 'simula-custo', tipo_recurso_historico_log: 'Simulacao', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Criou simulação #SIM-0291 — NCM 8471.30.19, origem China, valor USD 90.000', estado_posterior_historico_log: { ncm: '8471.30.19', origem: 'CN', valor_usd: 90000, modal: 'Marítimo' } },
  { modulo_historico_log: 'simula-custo', tipo_recurso_historico_log: 'Simulacao', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Recalculou simulação #SIM-0291 — alteração de modal para Aéreo', estado_anterior_historico_log: { modal: 'Marítimo', frete_usd: 1200 }, estado_posterior_historico_log: { modal: 'Aéreo', frete_usd: 8500 } },
  { modulo_historico_log: 'simula-custo', tipo_recurso_historico_log: 'Simulacao', acao_historico_log: 'CONSULTA', detalhe_acao_historico_log: 'Consultou PTAX do dia 04/04/2026 — USD/BRL: 5.7832 (fonte: BACEN)', estado_posterior_historico_log: { ptax: 5.7832, data: '2026-04-04', fonte: 'BACEN' } },
  { modulo_historico_log: 'simula-custo', tipo_recurso_historico_log: 'Simulacao', acao_historico_log: 'EXPORT', detalhe_acao_historico_log: 'Exportou simulação #SIM-0291 em PDF para envio ao cliente' },
  { modulo_historico_log: 'simula-custo', tipo_recurso_historico_log: 'TabelaNCM', acao_historico_log: 'SYNC', detalhe_acao_historico_log: 'Sincronizou tabela NCM com Siscomex — 47 registros atualizados', estado_posterior_historico_log: { atualizados: 47, novos: 3, removidos: 0 }, status_historico_log: 'PARCIAL' },

  // Bid Câmbio
  { modulo_historico_log: 'bid-cambio', tipo_recurso_historico_log: 'BidCambio', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Criou bid de câmbio #BID-FX-1102 — USD 500.000 compra, venc. 30/04/2026', estado_posterior_historico_log: { valor_usd: 500000, tipo: 'COMPRA', taxa: 5.79, vencimento: '2026-04-30' } },
  { modulo_historico_log: 'bid-cambio', tipo_recurso_historico_log: 'BidCambio', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Atualizou taxa do bid #BID-FX-1102 de 5,79 para 5,81', estado_anterior_historico_log: { taxa: 5.79 }, estado_posterior_historico_log: { taxa: 5.81 } },
  { modulo_historico_log: 'bid-cambio', tipo_recurso_historico_log: 'BidCambio', acao_historico_log: 'DELETE', detalhe_acao_historico_log: 'Cancelou bid #BID-FX-1100 — prazo de validade expirado', estado_anterior_historico_log: { status: 'ATIVO', taxa: 5.75 } },
  { modulo_historico_log: 'bid-cambio', tipo_recurso_historico_log: 'Cotacao', acao_historico_log: 'CONSULTA', detalhe_acao_historico_log: 'Consultou cotações de 5 bancos para USD 200.000 — melhor oferta: Bradesco 5,7810' },

  // Bid Frete
  { modulo_historico_log: 'bid-frete', tipo_recurso_historico_log: 'BidFrete', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Criou bid de frete #BID-FR-0341 — 2 contêineres 40HC Shanghai→Santos', estado_posterior_historico_log: { containers: 2, tipo: '40HC', origem: 'Shanghai', destino: 'Santos', valor_usd: 3200 } },
  { modulo_historico_log: 'bid-frete', tipo_recurso_historico_log: 'BidFrete', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Aceitou proposta do bid #BID-FR-0341 — Maersk Line USD 2.950/container', estado_anterior_historico_log: { status: 'ABERTO' }, estado_posterior_historico_log: { status: 'ACEITO', armador: 'Maersk', valor_aceito: 2950 } },
  { modulo_historico_log: 'bid-frete', tipo_recurso_historico_log: 'Proposta', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Registrou 4 propostas de armadores para bid #BID-FR-0341', estado_posterior_historico_log: { propostas: 4, menor_valor: 2950, maior_valor: 3400 } },

  // Processo
  { modulo_historico_log: 'processo', tipo_recurso_historico_log: 'Processo', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Abriu processo de importação #PROC-2026-0077 — DI vinculada ao pedido #PED-2026-0440', estado_posterior_historico_log: { numero: 'PROC-2026-0077', tipo: 'IMPORTACAO', di: 'pendente' } },
  { modulo_historico_log: 'processo', tipo_recurso_historico_log: 'Processo', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Atualizou status do processo #PROC-2026-0077 para DESEMBARAÇADO', estado_anterior_historico_log: { status: 'EM_DESPACHO' }, estado_posterior_historico_log: { status: 'DESEMBARACADO', data_desembaraco: '2026-04-03' } },
  { modulo_historico_log: 'processo', tipo_recurso_historico_log: 'Documento', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Anexou BL #MAEU-9182736450 ao processo #PROC-2026-0077', estado_posterior_historico_log: { tipo: 'BL', numero: 'MAEU-9182736450', arquivo: 'bl_maeu_9182736450.pdf' } },
  { modulo_historico_log: 'processo', tipo_recurso_historico_log: 'Processo', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Falha ao registrar DI — número já utilizado em outro processo', status_historico_log: 'FALHA', mensagem_erro_historico_log: 'ConflictError: DI 26/0001234-5 já vinculada ao processo PROC-2026-0071' },

  // Financeiro
  { modulo_historico_log: 'financeiro-comex', tipo_recurso_historico_log: 'Pagamento', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Registrou pagamento ao exterior #PAG-EXT-0812 — USD 152.400 via Swift', estado_posterior_historico_log: { valor: 152400, moeda: 'USD', banco: 'Itaú', swift: 'ITAUBRSP' } },
  { modulo_historico_log: 'financeiro-comex', tipo_recurso_historico_log: 'Pagamento', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Confirmou liquidação do pagamento #PAG-EXT-0812 — taxa efetiva: 5,8021', estado_anterior_historico_log: { status: 'PENDENTE' }, estado_posterior_historico_log: { status: 'LIQUIDADO', taxa_efetiva: 5.8021 } },
  { modulo_historico_log: 'financeiro-comex', tipo_recurso_historico_log: 'Receita', acao_historico_log: 'CONSULTA', detalhe_acao_historico_log: 'Consultou situação fiscal da empresa no Simples Nacional — regular', estado_posterior_historico_log: { situacao: 'REGULAR', cnpj: '12.345.678/0001-90' } },

  // Email
  { modulo_historico_log: 'email', tipo_recurso_historico_log: 'Email', acao_historico_log: 'ENVIO', detalhe_acao_historico_log: 'Enviou email "Confirmação do Pedido #PED-2026-0441" para fornecedor@acme.com', estado_posterior_historico_log: { assunto: 'Confirmação do Pedido #PED-2026-0441', destinatario: 'fornecedor@acme.com', message_id: '<msg.2026040411@gravity>' } },
  { modulo_historico_log: 'email', tipo_recurso_historico_log: 'Email', acao_historico_log: 'RECEBIMENTO', detalhe_acao_historico_log: 'Recebeu resposta do fornecedor acme.com — assunto: "Re: Confirmação do Pedido"', estado_posterior_historico_log: { assunto: 'Re: Confirmação do Pedido #PED-2026-0441', remetente: 'vendas@acme-supplier.com' } },
  { modulo_historico_log: 'email', tipo_recurso_historico_log: 'Email', acao_historico_log: 'ENVIO', detalhe_acao_historico_log: 'Gabi enviou email automático de follow-up para cliente — 3ª tentativa', estado_posterior_historico_log: { tipo: 'follow_up', tentativa: 3, destinatario: 'cliente@empresa.com.br' } },
  { modulo_historico_log: 'email', tipo_recurso_historico_log: 'Email', acao_historico_log: 'ENVIO', detalhe_acao_historico_log: 'Falha ao enviar email — domínio do destinatário bloqueado', status_historico_log: 'FALHA', mensagem_erro_historico_log: 'SMTPError: 550 5.1.1 The email address does not exist' },

  // WhatsApp
  { modulo_historico_log: 'whatsapp', tipo_recurso_historico_log: 'Conversa', acao_historico_log: 'ENVIO', detalhe_acao_historico_log: 'Enviou mensagem WhatsApp para +55 11 98765-4321 — notificação de desembaraço', estado_posterior_historico_log: { telefone: '+5511987654321', tipo: 'template', template: 'desembaraco_confirmado' } },
  { modulo_historico_log: 'whatsapp', tipo_recurso_historico_log: 'Conversa', acao_historico_log: 'RECEBIMENTO', detalhe_acao_historico_log: 'Recebeu mensagem de +55 11 98765-4321 — cliente solicitou prazo de entrega' },
  { modulo_historico_log: 'whatsapp', tipo_recurso_historico_log: 'Conversa', acao_historico_log: 'ENVIO', detalhe_acao_historico_log: 'Gabi respondeu automaticamente sobre prazo de entrega via WhatsApp' },

  // Configuração
  { modulo_historico_log: 'configuracao', tipo_recurso_historico_log: 'Configuracao', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Alterou configuração de notificações — ativou alertas por WhatsApp', estado_anterior_historico_log: { notif_whatsapp: false, notif_email: true }, estado_posterior_historico_log: { notif_whatsapp: true, notif_email: true } },
  { modulo_historico_log: 'configuracao', tipo_recurso_historico_log: 'Token', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Gerou novo token de API para integração com sistema ERP externo', estado_posterior_historico_log: { nome: 'ERP SAP Production', escopo: 'read:pedidos write:pedidos', expira_em: '2027-04-04' } },
  { modulo_historico_log: 'configuracao', tipo_recurso_historico_log: 'Token', acao_historico_log: 'DELETE', detalhe_acao_historico_log: 'Revogou token de API #tok_legacy_v1 — substituído por versão mais segura', estado_anterior_historico_log: { nome: 'ERP SAP Legacy', criado_em: '2024-01-15' } },
  { modulo_historico_log: 'configuracao', tipo_recurso_historico_log: 'Webhook', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Configurou webhook para eventos de pedido — endpoint: https://erp.empresa.com/gravity', estado_posterior_historico_log: { url: 'https://erp.empresa.com/gravity', eventos: ['pedido.criado', 'pedido.atualizado'] } },

  // Usuário
  { modulo_historico_log: 'usuario', tipo_recurso_historico_log: 'Usuario', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Convidou novo usuário pedro.alves@empresa.com com role STANDARD', estado_posterior_historico_log: { email: 'pedro.alves@empresa.com', role: 'STANDARD', produto_acesso: ['pedido', 'nf-importacao'] } },
  { modulo_historico_log: 'usuario', tipo_recurso_historico_log: 'Usuario', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Alterou permissão de pedro.alves@empresa.com de STANDARD para MASTER', estado_anterior_historico_log: { role: 'STANDARD' }, estado_posterior_historico_log: { role: 'MASTER' } },
  { modulo_historico_log: 'usuario', tipo_recurso_historico_log: 'Usuario', acao_historico_log: 'DELETE', detalhe_acao_historico_log: 'Removeu acesso do usuário saiu@empresa.com — colaborador desligado', estado_anterior_historico_log: { email: 'saiu@empresa.com', role: 'STANDARD', ativo: true } },

  // Dashboard / Relatório
  { modulo_historico_log: 'dashboard', tipo_recurso_historico_log: 'Dashboard', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Criou dashboard "Resumo Mensal de Importações — Abr/2026"', estado_posterior_historico_log: { nome: 'Resumo Mensal de Importações — Abr/2026', widgets: 8 } },
  { modulo_historico_log: 'relatorio', tipo_recurso_historico_log: 'Relatorio', acao_historico_log: 'EXPORT', detalhe_acao_historico_log: 'Exportou relatório "Posição de Estoque em Trânsito" em XLSX — 847 linhas' },
  { modulo_historico_log: 'relatorio', tipo_recurso_historico_log: 'Relatorio', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Agendou relatório semanal automático — toda segunda às 08h00', estado_posterior_historico_log: { nome: 'Posição Semanal Pedidos', cron: '0 8 * * 1', formato: 'XLSX' } },

  // Integração / Job
  { modulo_historico_log: 'integracao', tipo_recurso_historico_log: 'Integracao', acao_historico_log: 'SYNC', detalhe_acao_historico_log: 'Sincronizou 312 pedidos do SAP ERP para o Gravity — duração: 4.2s', estado_posterior_historico_log: { registros: 312, novos: 14, atualizados: 298, erros: 0 } },
  { modulo_historico_log: 'integracao', tipo_recurso_historico_log: 'Integracao', acao_historico_log: 'SYNC', detalhe_acao_historico_log: 'Falha na sincronização com SAP — timeout após 30s', status_historico_log: 'FALHA', mensagem_erro_historico_log: 'TimeoutError: SAP connection timeout after 30000ms — retrying in 5min' },
  { modulo_historico_log: 'integracao', tipo_recurso_historico_log: 'Integracao', acao_historico_log: 'SYNC', detalhe_acao_historico_log: 'Sincronizou tabela de NCMs com Siscomex — sincronização parcial (3 erros)', status_historico_log: 'PARCIAL', mensagem_erro_historico_log: 'PartialSyncWarning: 3 NCMs com formato inválido foram ignorados' },
  { modulo_historico_log: 'integracao', tipo_recurso_historico_log: 'Backup', acao_historico_log: 'BACKUP', detalhe_acao_historico_log: 'Backup diário concluído — 2.4 GB comprimido para 680 MB', estado_posterior_historico_log: { tamanho_original_gb: 2.4, comprimido_mb: 680, duracao_s: 47 } },

  // Compliance / LGPD
  { modulo_historico_log: 'compliance', tipo_recurso_historico_log: 'HistoryLog', acao_historico_log: 'ANONIMIZACAO_LGPD', detalhe_acao_historico_log: 'LGPD Art.18 — 47 logs anonimizados para id_ator_historico_log user_099. Motivo: solicitação de exclusão de dados pelo titular', estado_posterior_historico_log: { logs_anonimizados: 47, campos_limpos: ['nome_ator_historico_log', 'ip_ator_historico_log'] } },
]
