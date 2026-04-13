// Mock data for Historico — used in development/tests only.
// Actors and events represent realistic audit trail scenarios.

type ActorType = 'USER' | 'API' | 'AI' | 'JOB' | 'INTEGRATION'
type EventStatus = 'SUCCESS' | 'FAILURE' | 'PARTIAL'

export interface MockAtor {
  nome: string
  tipo: ActorType
  id: string
  ip?: string
}

export interface MockEvento {
  module: string
  resource_type: string
  action: string
  action_detail: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  status?: EventStatus
  error_message?: string
}

export const ATORES: MockAtor[] = [
  { nome: 'Daniel Martins', tipo: 'USER', id: 'user_001', ip: '187.45.12.88' },
  { nome: 'Ana Souza', tipo: 'USER', id: 'user_002', ip: '200.186.30.5' },
  { nome: 'Carlos Lima', tipo: 'USER', id: 'user_003', ip: '177.92.44.201' },
  { nome: 'Fernanda Costa', tipo: 'USER', id: 'user_004', ip: '189.6.77.12' },
  { nome: 'Gabi AI', tipo: 'AI', id: 'ai_gabi', ip: undefined },
  { nome: 'API Externa v2', tipo: 'API', id: 'api_ext_v2', ip: '54.230.101.5' },
  { nome: 'API Marketplace', tipo: 'API', id: 'api_market', ip: '52.11.200.14' },
  { nome: 'Cron: Receita Federal', tipo: 'JOB', id: 'job_receita', ip: undefined },
  { nome: 'Cron: Backup Diário', tipo: 'JOB', id: 'job_backup', ip: undefined },
  { nome: 'Cron: Partition Manager', tipo: 'JOB', id: 'job_partition', ip: undefined },
  { nome: 'SAP ERP Conector', tipo: 'INTEGRATION', id: 'int_sap', ip: '10.0.0.50' },
  { nome: 'Siscomex Gateway', tipo: 'INTEGRATION', id: 'int_siscomex', ip: '200.152.38.155' },
  { nome: 'Stripe Billing', tipo: 'INTEGRATION', id: 'int_stripe', ip: '54.187.174.169' },
]

export const EVENTOS: MockEvento[] = [
  // Pedido
  { module: 'pedido', resource_type: 'Pedido', action: 'CREATE', action_detail: 'Criou o pedido #PED-2026-0441 — Acme Importações Ltda', after: { numero: 'PED-2026-0441', status: 'RASCUNHO', valor: 152400.00, moeda: 'USD' } },
  { module: 'pedido', resource_type: 'Pedido', action: 'UPDATE', action_detail: 'Alterou status do pedido #PED-2026-0441 de RASCUNHO para CONFIRMADO', before: { status: 'RASCUNHO' }, after: { status: 'CONFIRMADO' } },
  { module: 'pedido', resource_type: 'Pedido', action: 'UPDATE', action_detail: 'Alterou valor do pedido #PED-2026-0440 de USD 98.000 para USD 112.500', before: { valor: 98000, moeda: 'USD', incoterm: 'FOB' }, after: { valor: 112500, moeda: 'USD', incoterm: 'CIF' } },
  { module: 'pedido', resource_type: 'Pedido', action: 'DELETE', action_detail: 'Excluiu o pedido #PED-2026-0438 — cancelado pelo cliente', before: { numero: 'PED-2026-0438', status: 'RASCUNHO', valor: 45000 } },
  { module: 'pedido', resource_type: 'ItemPedido', action: 'CREATE', action_detail: 'Adicionou item NCM 8471.30.19 — Notebook Dell XPS 15" (Qtd: 50)', after: { ncm: '8471.30.19', descricao: 'Notebook Dell XPS 15"', qtd: 50, unitario: 1800 } },
  { module: 'pedido', resource_type: 'Pedido', action: 'EXPORT', action_detail: 'Exportou pedido #PED-2026-0441 em formato CSV (128 linhas)' },
  { module: 'pedido', resource_type: 'Pedido', action: 'UPDATE', action_detail: 'Falha ao atualizar pedido #PED-2026-0437 — campo obrigatório ausente', status: 'FAILURE', error_message: 'ValidationError: campo "pais_origem" é obrigatório' },

  // Auth
  { module: 'auth', resource_type: 'Session', action: 'LOGIN', action_detail: 'Login realizado com sucesso via email+senha' },
  { module: 'auth', resource_type: 'Session', action: 'LOGOUT', action_detail: 'Logout realizado — sessão encerrada pelo usuário' },
  { module: 'auth', resource_type: 'Session', action: 'SESSION_REVOKED', action_detail: 'Sessão revogada pelo administrador — inatividade de 30 dias', status: 'PARTIAL' },
  { module: 'auth', resource_type: 'Session', action: 'AUTH_FAILURE', action_detail: 'Tentativa de acesso negada — token JWT expirado', status: 'FAILURE', error_message: 'TokenExpiredError: jwt expired at 2026-04-03T22:00:00Z' },
  { module: 'auth', resource_type: 'Session', action: 'AUTH_FAILURE', action_detail: 'Tentativa de acesso a recurso sem permissão suficiente (role: STANDARD)', status: 'FAILURE', error_message: 'ForbiddenError: role STANDARD não tem acesso a /api/admin' },
  { module: 'auth', resource_type: 'Session', action: 'LOGIN', action_detail: 'Login via SSO Google Workspace' },

  // Nota Fiscal
  { module: 'nf-importacao', resource_type: 'NotaFiscal', action: 'CREATE', action_detail: 'Criou NF-e #55002 — Importação de equipamentos eletrônicos', after: { numero: '55002', valor: 284500.00, cfop: '3102', emitente: 'Dell Inc.' } },
  { module: 'nf-importacao', resource_type: 'NotaFiscal', action: 'UPDATE', action_detail: 'Corrigiu CFOP da NF-e #55001 de 3102 para 3128', before: { cfop: '3102' }, after: { cfop: '3128' } },
  { module: 'nf-importacao', resource_type: 'NotaFiscal', action: 'IMPORT', action_detail: 'Importou 14 notas fiscais via XML (lote #NF-LOTE-2026-04)', after: { quantidade: 14, formato: 'XML', tamanho_kb: 382 } },
  { module: 'nf-importacao', resource_type: 'NotaFiscal', action: 'DELETE', action_detail: 'Excluiu NF-e #54998 — duplicidade identificada', before: { numero: '54998', status: 'RASCUNHO' } },
  { module: 'nf-importacao', resource_type: 'NotaFiscal', action: 'UPDATE', action_detail: 'Falha ao processar NF-e #55003 — XML inválido', status: 'FAILURE', error_message: 'XMLParseError: elemento <infNFe> ausente no arquivo enviado' },

  // LPCO
  { module: 'lpco', resource_type: 'Licenca', action: 'CREATE', action_detail: 'Criou LPCO #LI-2026-00891 — Licença de Importação para máquinas industriais', after: { numero: 'LI-2026-00891', tipo: 'LI', ncm: '8457.10.00', valor_usd: 875000 } },
  { module: 'lpco', resource_type: 'Licenca', action: 'UPDATE', action_detail: 'Atualizou vencimento da LI #LI-2026-00891 para 30/06/2026', before: { vencimento: '2026-03-31' }, after: { vencimento: '2026-06-30' } },
  { module: 'lpco', resource_type: 'Licenca', action: 'CONSULTA', action_detail: 'Consultou status da LI #LI-2026-00890 no Siscomex — retorno: DEFERIDA' },
  { module: 'lpco', resource_type: 'Licenca', action: 'EXPORT', action_detail: 'Exportou relatório de LPCOs vencendo em 30 dias (22 registros)' },

  // SimulaCusto
  { module: 'simula-custo', resource_type: 'Simulacao', action: 'CREATE', action_detail: 'Criou simulação #SIM-0291 — NCM 8471.30.19, origem China, valor USD 90.000', after: { ncm: '8471.30.19', origem: 'CN', valor_usd: 90000, modal: 'Marítimo' } },
  { module: 'simula-custo', resource_type: 'Simulacao', action: 'UPDATE', action_detail: 'Recalculou simulação #SIM-0291 — alteração de modal para Aéreo', before: { modal: 'Marítimo', frete_usd: 1200 }, after: { modal: 'Aéreo', frete_usd: 8500 } },
  { module: 'simula-custo', resource_type: 'Simulacao', action: 'CONSULTA', action_detail: 'Consultou PTAX do dia 04/04/2026 — USD/BRL: 5.7832 (fonte: BACEN)', after: { ptax: 5.7832, data: '2026-04-04', fonte: 'BACEN' } },
  { module: 'simula-custo', resource_type: 'Simulacao', action: 'EXPORT', action_detail: 'Exportou simulação #SIM-0291 em PDF para envio ao cliente' },
  { module: 'simula-custo', resource_type: 'TabelaNCM', action: 'SYNC', action_detail: 'Sincronizou tabela NCM com Siscomex — 47 registros atualizados', after: { atualizados: 47, novos: 3, removidos: 0 }, status: 'PARTIAL' },

  // Bid Câmbio
  { module: 'bid-cambio', resource_type: 'BidCambio', action: 'CREATE', action_detail: 'Criou bid de câmbio #BID-FX-1102 — USD 500.000 compra, venc. 30/04/2026', after: { valor_usd: 500000, tipo: 'COMPRA', taxa: 5.79, vencimento: '2026-04-30' } },
  { module: 'bid-cambio', resource_type: 'BidCambio', action: 'UPDATE', action_detail: 'Atualizou taxa do bid #BID-FX-1102 de 5,79 para 5,81', before: { taxa: 5.79 }, after: { taxa: 5.81 } },
  { module: 'bid-cambio', resource_type: 'BidCambio', action: 'DELETE', action_detail: 'Cancelou bid #BID-FX-1100 — prazo de validade expirado', before: { status: 'ATIVO', taxa: 5.75 } },
  { module: 'bid-cambio', resource_type: 'Cotacao', action: 'CONSULTA', action_detail: 'Consultou cotações de 5 bancos para USD 200.000 — melhor oferta: Bradesco 5,7810' },

  // Bid Frete
  { module: 'bid-frete', resource_type: 'BidFrete', action: 'CREATE', action_detail: 'Criou bid de frete #BID-FR-0341 — 2 contêineres 40HC Shanghai→Santos', after: { containers: 2, tipo: '40HC', origem: 'Shanghai', destino: 'Santos', valor_usd: 3200 } },
  { module: 'bid-frete', resource_type: 'BidFrete', action: 'UPDATE', action_detail: 'Aceitou proposta do bid #BID-FR-0341 — Maersk Line USD 2.950/container', before: { status: 'ABERTO' }, after: { status: 'ACEITO', armador: 'Maersk', valor_aceito: 2950 } },
  { module: 'bid-frete', resource_type: 'Proposta', action: 'CREATE', action_detail: 'Registrou 4 propostas de armadores para bid #BID-FR-0341', after: { propostas: 4, menor_valor: 2950, maior_valor: 3400 } },

  // Processo
  { module: 'processo', resource_type: 'Processo', action: 'CREATE', action_detail: 'Abriu processo de importação #PROC-2026-0077 — DI vinculada ao pedido #PED-2026-0440', after: { numero: 'PROC-2026-0077', tipo: 'IMPORTACAO', di: 'pendente' } },
  { module: 'processo', resource_type: 'Processo', action: 'UPDATE', action_detail: 'Atualizou status do processo #PROC-2026-0077 para DESEMBARAÇADO', before: { status: 'EM_DESPACHO' }, after: { status: 'DESEMBARACADO', data_desembaraco: '2026-04-03' } },
  { module: 'processo', resource_type: 'Documento', action: 'CREATE', action_detail: 'Anexou BL #MAEU-9182736450 ao processo #PROC-2026-0077', after: { tipo: 'BL', numero: 'MAEU-9182736450', arquivo: 'bl_maeu_9182736450.pdf' } },
  { module: 'processo', resource_type: 'Processo', action: 'UPDATE', action_detail: 'Falha ao registrar DI — número já utilizado em outro processo', status: 'FAILURE', error_message: 'ConflictError: DI 26/0001234-5 já vinculada ao processo PROC-2026-0071' },

  // Financeiro
  { module: 'financeiro-comex', resource_type: 'Pagamento', action: 'CREATE', action_detail: 'Registrou pagamento ao exterior #PAG-EXT-0812 — USD 152.400 via Swift', after: { valor: 152400, moeda: 'USD', banco: 'Itaú', swift: 'ITAUBRSP' } },
  { module: 'financeiro-comex', resource_type: 'Pagamento', action: 'UPDATE', action_detail: 'Confirmou liquidação do pagamento #PAG-EXT-0812 — taxa efetiva: 5,8021', before: { status: 'PENDENTE' }, after: { status: 'LIQUIDADO', taxa_efetiva: 5.8021 } },
  { module: 'financeiro-comex', resource_type: 'Receita', action: 'CONSULTA', action_detail: 'Consultou situação fiscal da empresa no Simples Nacional — regular', after: { situacao: 'REGULAR', cnpj: '12.345.678/0001-90' } },

  // Email
  { module: 'email', resource_type: 'Email', action: 'ENVIO', action_detail: 'Enviou email "Confirmação do Pedido #PED-2026-0441" para fornecedor@acme.com', after: { assunto: 'Confirmação do Pedido #PED-2026-0441', destinatario: 'fornecedor@acme.com', message_id: '<msg.2026040411@gravity>' } },
  { module: 'email', resource_type: 'Email', action: 'RECEBIMENTO', action_detail: 'Recebeu resposta do fornecedor acme.com — assunto: "Re: Confirmação do Pedido"', after: { assunto: 'Re: Confirmação do Pedido #PED-2026-0441', remetente: 'vendas@acme-supplier.com' } },
  { module: 'email', resource_type: 'Email', action: 'ENVIO', action_detail: 'Gabi enviou email automático de follow-up para cliente — 3ª tentativa', after: { tipo: 'follow_up', tentativa: 3, destinatario: 'cliente@empresa.com.br' } },
  { module: 'email', resource_type: 'Email', action: 'ENVIO', action_detail: 'Falha ao enviar email — domínio do destinatário bloqueado', status: 'FAILURE', error_message: 'SMTPError: 550 5.1.1 The email address does not exist' },

  // WhatsApp
  { module: 'whatsapp', resource_type: 'Conversa', action: 'ENVIO', action_detail: 'Enviou mensagem WhatsApp para +55 11 98765-4321 — notificação de desembaraço', after: { telefone: '+5511987654321', tipo: 'template', template: 'desembaraco_confirmado' } },
  { module: 'whatsapp', resource_type: 'Conversa', action: 'RECEBIMENTO', action_detail: 'Recebeu mensagem de +55 11 98765-4321 — cliente solicitou prazo de entrega' },
  { module: 'whatsapp', resource_type: 'Conversa', action: 'ENVIO', action_detail: 'Gabi respondeu automaticamente sobre prazo de entrega via WhatsApp' },

  // Configuração
  { module: 'configuracao', resource_type: 'Configuracao', action: 'UPDATE', action_detail: 'Alterou configuração de notificações — ativou alertas por WhatsApp', before: { notif_whatsapp: false, notif_email: true }, after: { notif_whatsapp: true, notif_email: true } },
  { module: 'configuracao', resource_type: 'Token', action: 'CREATE', action_detail: 'Gerou novo token de API para integração com sistema ERP externo', after: { nome: 'ERP SAP Production', escopo: 'read:pedidos write:pedidos', expira_em: '2027-04-04' } },
  { module: 'configuracao', resource_type: 'Token', action: 'DELETE', action_detail: 'Revogou token de API #tok_legacy_v1 — substituído por versão mais segura', before: { nome: 'ERP SAP Legacy', criado_em: '2024-01-15' } },
  { module: 'configuracao', resource_type: 'Webhook', action: 'CREATE', action_detail: 'Configurou webhook para eventos de pedido — endpoint: https://erp.empresa.com/gravity', after: { url: 'https://erp.empresa.com/gravity', eventos: ['pedido.criado', 'pedido.atualizado'] } },

  // Usuário
  { module: 'usuario', resource_type: 'Usuario', action: 'CREATE', action_detail: 'Convidou novo usuário pedro.alves@empresa.com com role STANDARD', after: { email: 'pedro.alves@empresa.com', role: 'STANDARD', produto_acesso: ['pedido', 'nf-importacao'] } },
  { module: 'usuario', resource_type: 'Usuario', action: 'UPDATE', action_detail: 'Alterou permissão de pedro.alves@empresa.com de STANDARD para MASTER', before: { role: 'STANDARD' }, after: { role: 'MASTER' } },
  { module: 'usuario', resource_type: 'Usuario', action: 'DELETE', action_detail: 'Removeu acesso do usuário saiu@empresa.com — colaborador desligado', before: { email: 'saiu@empresa.com', role: 'STANDARD', ativo: true } },

  // Dashboard / Relatório
  { module: 'dashboard', resource_type: 'Dashboard', action: 'CREATE', action_detail: 'Criou dashboard "Resumo Mensal de Importações — Abr/2026"', after: { nome: 'Resumo Mensal de Importações — Abr/2026', widgets: 8 } },
  { module: 'relatorio', resource_type: 'Relatorio', action: 'EXPORT', action_detail: 'Exportou relatório "Posição de Estoque em Trânsito" em XLSX — 847 linhas' },
  { module: 'relatorio', resource_type: 'Relatorio', action: 'CREATE', action_detail: 'Agendou relatório semanal automático — toda segunda às 08h00', after: { nome: 'Posição Semanal Pedidos', cron: '0 8 * * 1', formato: 'XLSX' } },

  // Integração / Job
  { module: 'integracao', resource_type: 'Integracao', action: 'SYNC', action_detail: 'Sincronizou 312 pedidos do SAP ERP para o Gravity — duração: 4.2s', after: { registros: 312, novos: 14, atualizados: 298, erros: 0 } },
  { module: 'integracao', resource_type: 'Integracao', action: 'SYNC', action_detail: 'Falha na sincronização com SAP — timeout após 30s', status: 'FAILURE', error_message: 'TimeoutError: SAP connection timeout after 30000ms — retrying in 5min' },
  { module: 'integracao', resource_type: 'Integracao', action: 'SYNC', action_detail: 'Sincronizou tabela de NCMs com Siscomex — sincronização parcial (3 erros)', status: 'PARTIAL', error_message: 'PartialSyncWarning: 3 NCMs com formato inválido foram ignorados' },
  { module: 'integracao', resource_type: 'Backup', action: 'BACKUP', action_detail: 'Backup diário concluído — 2.4 GB comprimido para 680 MB', after: { tamanho_original_gb: 2.4, comprimido_mb: 680, duracao_s: 47 } },

  // Compliance / LGPD
  { module: 'compliance', resource_type: 'HistoryLog', action: 'ANONIMIZACAO_LGPD', action_detail: 'LGPD Art.18 — 47 logs anonimizados para actor_id user_099. Motivo: solicitação de exclusão de dados pelo titular', after: { logs_anonimizados: 47, campos_limpos: ['actor_name', 'actor_ip'] } },
]
