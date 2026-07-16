/** Catálogo completo de eventos gravados no audit trail — manual Configurador › Histórico. */

export interface HistoricoCatalogoColuna {
  chave: string
  rotulo: string
  largura?: string
  destaque?: boolean
}

export interface HistoricoCatalogoSecao {
  titulo: string
  colunas: HistoricoCatalogoColuna[]
  linhas: Array<Record<string, string> & { emBreve?: boolean }>
  notaRodape?: string
}

export const HISTORICO_CATALOGO_SECOES: HistoricoCatalogoSecao[] = [
  {
    titulo: '1. Configurador — registros dedicados',
    colunas: [
      { chave: 'num', rotulo: '#', largura: '4%' },
      { chave: 'traducao', rotulo: 'O que aparece na coluna Ação', largura: '28%', destaque: true },
      { chave: 'local', rotulo: 'Coluna Local (exemplo)', largura: '22%' },
      { chave: 'gatilho', rotulo: 'Origem técnica (API)', largura: '46%' },
    ],
    linhas: [
      { num: '1', traducao: 'Atualizou dados da organização', local: 'Configurador | Organização', gatilho: 'PATCH /api/v1/organizacoes/me' },
      { num: '2', traducao: 'Criou workspace', local: 'Configurador | Workspaces', gatilho: 'POST /api/v1/me/workspaces' },
      { num: '3', traducao: 'Atualizou workspace', local: 'Configurador | Workspaces', gatilho: 'PATCH /api/v1/me/workspaces/:id' },
      { num: '4', traducao: 'Excluiu workspace', local: 'Configurador | Workspaces', gatilho: 'DELETE /api/v1/me/workspaces/:id' },
      { num: '5', traducao: 'Trocou organização ativa', local: 'HUB', gatilho: 'PUT /api/v1/me/organizacao-ativa' },
      { num: '6', traducao: 'Convidou usuário', local: 'Configurador | Usuários', gatilho: 'Serviço de convite (convidar-usuario-service)' },
      { num: '7', traducao: 'Agendou sincronização de câmbio', local: 'Admin | Taxas moeda', gatilho: 'PATCH /api/v1/admin/taxas-moeda/agendamento' },
      { num: '8', traducao: 'Sincronizou tabela NCM', local: 'Admin | NCM Siscomex', gatilho: 'POST /api/v1/admin/integracao-ncm/sync' },
      { num: '9', traducao: 'Agendou sincronização NCM', local: 'Admin | NCM Siscomex', gatilho: 'POST …/integracao-ncm/agendar' },
      { num: '10', traducao: 'Enviou certificado digital', local: 'Admin', gatilho: 'Upload certificado Siscomex' },
      { num: '11', traducao: 'Removeu certificado digital', local: 'Admin', gatilho: 'Remover certificado' },
      { num: '12', traducao: 'Ativou certificado digital', local: 'Admin', gatilho: 'Ativar certificado' },
    ],
    notaRodape: 'Convites aparecem no Histórico do Configurador mesmo sem produto vinculado.',
  },
  {
    titulo: '2. Usuários — permissões, patentes e convites',
    colunas: [
      { chave: 'num', rotulo: '#', largura: '4%' },
      { chave: 'traducao', rotulo: 'O que aparece na coluna Ação', largura: '30%', destaque: true },
      { chave: 'detalhe', rotulo: 'Coluna Detalhes (exemplo)', largura: '30%' },
      { chave: 'gatilho', rotulo: 'Origem técnica (API)', largura: '36%' },
    ],
    linhas: [
      { num: '13', traducao: 'Concedeu ou revogou permissão', detalhe: 'Nome da permissão (ex.: ver lista de pedidos)', gatilho: 'PUT /api/v1/usuarios/:id/permissoes' },
      { num: '14', traducao: 'Concedeu ou revogou acesso a workspace', detalhe: 'Quais workspaces a pessoa pode usar', gatilho: 'PUT /api/v1/usuarios/:id/workspaces' },
      { num: '15', traducao: 'Alterou patente do usuário', detalhe: 'Ex.: Padrão → Master', gatilho: 'PATCH /api/v1/usuarios/:id/patente' },
      { num: '16', traducao: 'Desativou ou reativou usuário', detalhe: 'Status Ativo ↔ Inativo', gatilho: 'PATCH /api/v1/usuarios/:id/status' },
      { num: '17', traducao: 'Cancelou convite pendente', detalhe: 'Convite removido antes do cadastro', gatilho: 'DELETE /api/v1/usuarios/:id/convite' },
      { num: '18', traducao: 'Vinculou usuários ao novo workspace', detalhe: 'Padrão e Fornecedor com auto-vínculo', gatilho: 'Workspace criado + auto-vínculo em lote' },
    ],
  },
  {
    titulo: '3. Login e sessão',
    colunas: [
      { chave: 'num', rotulo: '#', largura: '4%' },
      { chave: 'traducao', rotulo: 'O que aparece na coluna Ação', largura: '28%', destaque: true },
      { chave: 'configurador', rotulo: 'Aparece no Histórico do Configurador?', largura: '22%' },
      { chave: 'gatilho', rotulo: 'Origem técnica', largura: '46%' },
    ],
    linhas: [
      { num: '19', traducao: 'Entrou na plataforma', configurador: 'Sim', gatilho: 'Webhook Clerk — sessão iniciada' },
      { num: '20', traducao: 'Saiu da plataforma', configurador: 'Sim', gatilho: 'Webhook Clerk — sessão encerrada' },
      { num: '21', traducao: 'Sessão revogada (logout forçado)', configurador: 'Sim', gatilho: 'Webhook Clerk — sessão revogada' },
      { num: '22', traducao: 'Falha no login', configurador: 'Sim', gatilho: 'Token inválido ou ausente' },
    ],
  },
  {
    titulo: '4. Segurança da conta',
    colunas: [
      { chave: 'num', rotulo: '#', largura: '4%' },
      { chave: 'traducao', rotulo: 'O que aparece na coluna Ação', largura: '32%', destaque: true },
      { chave: 'quando', rotulo: 'Quando acontece', largura: '64%' },
    ],
    linhas: [
      { num: '23', traducao: 'Negou acesso por falta de permissão', quando: 'Usuário tentou uma tela ou ação sem permissão (ex.: Pedido)' },
      { num: '24', traducao: 'Bloqueou acesso a outra organização', quando: 'Tentativa de ver dados de outra conta' },
      { num: '25', traducao: 'Falha de autenticação', quando: 'Login ou token rejeitado pelo sistema' },
      { num: '26', traducao: 'Atingiu limite de requisições', quando: 'Muitas tentativas em pouco tempo (rate limit)' },
      { num: '27', traducao: 'Falha na assinatura de webhook', quando: 'Integração externa (Clerk, Stripe, e-mail, WhatsApp)' },
      { num: '28', traducao: 'Criou, revogou ou rotacionou credencial', quando: 'Chaves de API e tokens de integração' },
      { num: '29', traducao: 'Acessou área administrativa Gravity', quando: 'Painel interno da plataforma' },
      { num: '30', traducao: 'Excluiu dado (LGPD / admin)', quando: 'Remoção solicitada ou operação administrativa' },
      { num: '31', traducao: 'Usou chave de API', quando: 'Chamada autenticada por API key' },
    ],
  },
  {
    titulo: '5. Registros automáticos no Configurador',
    colunas: [
      { chave: 'traducao', rotulo: 'O que aparece na coluna Ação', largura: '34%', destaque: true },
      { chave: 'detalhe', rotulo: 'Coluna Detalhes (padrão)', largura: '66%' },
    ],
    linhas: [
      { traducao: 'Criou', detalhe: 'Criou [tipo do registro] — ex.: assinatura, fornecedor, fatura' },
      { traducao: 'Atualizou', detalhe: 'Atualizou [tipo do registro] — ex.: editou usuário, suspendeu assinatura' },
      { traducao: 'Excluiu', detalhe: 'Excluiu [tipo do registro]' },
    ],
    notaRodape: 'O sistema grava sozinho quando alguém salva, edita ou exclui em telas do Configurador (Usuários, Assinaturas, Fornecedores, Financeiro, etc.). Algumas ações geram dois registros — um específico e um automático.',
  },
  {
    titulo: '5.1 Telas cobertas pelo registro automático',
    colunas: [
      { chave: 'traducao', rotulo: 'O que você fez na tela', largura: '40%', destaque: true },
      { chave: 'telas', rotulo: 'Área do Configurador', largura: '60%' },
    ],
    linhas: [
      { traducao: 'Editou cadastro ou status de usuário', telas: 'Usuários' },
      { traducao: 'Suspendeu, cancelou ou habilitou assinatura', telas: 'Assinaturas' },
      { traducao: 'Cadastrou ou alterou fornecedor', telas: 'Fornecedores' },
      { traducao: 'Alterou câmbio ou agendamento', telas: 'Taxas e moeda' },
      { traducao: 'Criou token ou webhook', telas: 'API Cockpit' },
      { traducao: 'Consultou ou emitiu fatura', telas: 'Financeiro' },
      { traducao: 'Habilitou produto no workspace', telas: 'Assinaturas › workspaces do produto' },
      { traducao: 'Gerou token de serviço', telas: 'Tokens de serviço (admin)' },
    ],
  },
  {
    titulo: '6. Produtos prontos — o que entra no histórico',
    colunas: [
      { chave: 'traducao', rotulo: 'Situação', largura: '34%', destaque: true },
      { chave: 'operacao', rotulo: 'Explicação', largura: '66%' },
    ],
    linhas: [
      { traducao: 'Registra', operacao: 'Alterações que **salvam no servidor**: criar, editar e excluir registros (pedido, leitura, cotação, etc.)' },
      { traducao: 'Registra', operacao: 'Operações especiais do produto — duplicar, transferir, aprovar cotação, disparar BID… quando o backend grava log dedicado' },
      { traducao: 'Não registra', operacao: 'Só **abrir** telas, filtrar, ordenar, visualizar lista ou dashboard sem salvar nada' },
      { traducao: 'Não registra', operacao: 'Preferências de coluna, painéis pessoais da lista e ajustes só no navegador' },
      { traducao: 'Não registra', operacao: 'Tentativas que **falharam** antes de gravar (erro de validação, sem permissão) — podem aparecer como Falha quando o sistema audita o bloqueio' },
    ],
    notaRodape: 'O histórico é trilha de **mudança de dados**, não gravação de tela. Veja o detalhe por produto nas tabelas abaixo.',
  },
  {
    titulo: '6.1 Pedido',
    colunas: [
      { chave: 'traducao', rotulo: 'O que aparece na coluna Ação', largura: '36%', destaque: true },
      { chave: 'operacao', rotulo: 'Quando acontece', largura: '64%' },
    ],
    linhas: [
      { traducao: 'Criou / Atualizou / Excluiu', operacao: 'Salvar pedido ou item, alterar status, anexos e demais edições na API' },
      { traducao: 'Duplicou', operacao: 'Duplicar pedido ou itens' },
      { traducao: 'Transferiu / Reverteu transferência', operacao: 'Mover pedido entre workspaces' },
      { traducao: 'Consolidou', operacao: 'Unir pedidos em um só' },
      { traducao: 'Editou em massa', operacao: 'Alteração em lote na lista' },
      { traducao: 'Excluiu itens / Excluiu automaticamente', operacao: 'Remoção de itens ou pedido vazio' },
    ],
    notaRodape: 'Algumas ações podem gerar **dois** registros (log específico + captura automática da API).',
  },
  {
    titulo: '6.2 BID Frete Internacional',
    colunas: [
      { chave: 'traducao', rotulo: 'O que aparece na coluna Ação', largura: '36%', destaque: true },
      { chave: 'operacao', rotulo: 'Quando acontece', largura: '64%' },
    ],
    linhas: [
      { traducao: 'Criou / Atualizou / Excluiu', operacao: 'Salvar cotação, BID, fornecedor, configurações e exclusões em lote' },
      { traducao: 'Duplicou', operacao: 'Duplicar cotações ou BIDs em lote' },
      { traducao: 'Aprovou / Reprovou', operacao: 'Decisão sobre cotação no comparativo' },
      { traducao: 'Disparou', operacao: 'Envio de BID aos fornecedores' },
      { traducao: 'Fornecedor respondeu', operacao: 'Proposta recebida na visão fornecedor' },
      { traducao: 'Avaliou fornecedor', operacao: 'Nota de avaliação após operação' },
    ],
  },
  {
    titulo: '6.3 Smart Docs (Smart Read)',
    colunas: [
      { chave: 'traducao', rotulo: 'O que aparece na coluna Ação', largura: '36%', destaque: true },
      { chave: 'operacao', rotulo: 'Quando acontece', largura: '64%' },
    ],
    linhas: [
      { traducao: 'Criou', operacao: 'Nova leitura (upload e início do processamento)' },
      { traducao: 'Atualizou', operacao: 'Salvar progresso da leitura, reordenar ou editar painéis da lista' },
      { traducao: 'Excluiu', operacao: 'Remover leitura' },
      { traducao: 'Criou / Atualizou / Excluiu', operacao: 'Demais mutações nas rotas do produto (análise, exportação que persiste, etc.)' },
    ],
    notaRodape: 'Perguntas ao assistente (QA) e navegação na conferência **sem salvar** não geram linha no histórico.',
  },
  {
    titulo: '6.4 Outros produtos Gravity',
    colunas: [
      { chave: 'traducao', rotulo: 'Produto', largura: '40%', destaque: true },
      { chave: 'telas', rotulo: 'Onde ver o histórico', largura: '60%' },
    ],
    linhas: [
      { traducao: 'Smart Read', telas: 'Menu lateral do Smart Read › Histórico' },
      { traducao: 'BID Frete Internacional', telas: 'Menu lateral do BID Frete › Histórico' },
      { traducao: 'BID Câmbio', telas: 'Menu lateral do BID Câmbio › Histórico', emBreve: true },
      { traducao: 'Processo', telas: 'Menu lateral do Processo › Histórico', emBreve: true },
      { traducao: 'LPCO', telas: 'Menu lateral do LPCO › Histórico', emBreve: true },
      { traducao: 'NF Importação', telas: 'Menu lateral da NF Importação › Histórico', emBreve: true },
      { traducao: 'Financeiro COMEX', telas: 'Menu lateral do Financeiro COMEX › Histórico', emBreve: true },
      { traducao: 'Simula Custo', telas: 'Menu lateral do Simula Custo › Histórico', emBreve: true },
    ],
    notaRodape: 'Nesses produtos o padrão é o mesmo: **Criou**, **Atualizou** ou **Excluiu** quando há gravação no servidor. Abra o Histórico pelo menu lateral de cada módulo.',
  },
  {
    titulo: '7. Operações do Admin Gravity (conta interna)',
    colunas: [
      { chave: 'traducao', rotulo: 'O que aparece na coluna Ação', largura: '40%', destaque: true },
      { chave: 'contexto', rotulo: 'Contexto', largura: '60%' },
    ],
    linhas: [
      { traducao: 'Acessou painel admin', contexto: 'Área restrita da equipe Gravity' },
      { traducao: 'Criou ou alterou organização / workspace', contexto: 'Gestão de clientes no admin' },
      { traducao: 'Emitiu ou anulou fatura admin', contexto: 'Financeiro interno' },
      { traducao: 'Consultou visão geral ou histórico global', contexto: 'Monitoramento da plataforma' },
      { traducao: 'Executou ou concluiu testes automatizados', contexto: 'Painel de qualidade' },
      { traducao: 'Gerou ou revisou plano de teste', contexto: 'Agentes de teste' },
      { traducao: 'Executou pentest', contexto: 'Segurança' },
      { traducao: 'Alterou deploy, produto ou configuração', contexto: 'Telas admin (Deploy, Produtos Gravity)' },
    ],
    notaRodape: 'Visível para Master quando o evento não está vinculado a um produto específico.',
  },
  {
    titulo: '8. Sistema em segundo plano',
    colunas: [
      { chave: 'traducao', rotulo: 'O que aparece na coluna Ação', largura: '36%', destaque: true },
      { chave: 'origem', rotulo: 'Origem', largura: '64%' },
    ],
    linhas: [
      { traducao: 'Concluiu ou falhou tarefa agendada', origem: 'Processos automáticos (jobs)' },
      { traducao: 'Anonimizou dados (LGPD)', origem: 'Solicitação de privacidade' },
      { traducao: 'Consultou histórico global', origem: 'Admin Gravity' },
      { traducao: 'Registro entre serviços', origem: 'Integração interna da plataforma' },
    ],
  },
  {
    titulo: '9. Colunas da tabela que você vê',
    colunas: [
      { chave: 'traducao', rotulo: 'Coluna na tela', largura: '32%', destaque: true },
      { chave: 'tela', rotulo: 'O que mostra', largura: '68%' },
    ],
    linhas: [
      { traducao: 'Data/Hora', tela: 'Momento em que o evento foi registrado' },
      { traducao: 'Ação', tela: 'Verbo do que aconteceu — ex.: Convidou, Atualizou, Excluiu' },
      { traducao: 'Local', tela: 'Tela ou módulo — ex.: Configurador | Usuários' },
      { traducao: 'Usuário', tela: 'Quem fez (nome e e-mail, quando for pessoa)' },
      { traducao: 'Detalhes', tela: 'Resumo do que mudou — permissão, convite, diff, etc.' },
    ],
    notaRodape: 'Os cards do topo (Total, Últimos 7 dias, Status) consideram só os **25 registros da página atual**.',
  },
]
