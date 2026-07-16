/**
 * Conteúdo SSOT do módulo Gabi IA (Academy e futuro manual docs).
 * Baseado no serviço `servicos-plataforma/gabi` — chat agente, ajuda em campo, quota e ferramentas.
 */

import type { DocSecao } from './manual-login-conteudo'

export const DOC_GABI_SUBTITULO =
  'Assistente de IA integrada ao workspace: chat, ajuda em campos e insights no Hub'

export const DOC_GABI_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '1.0' },
  { rotulo: 'Atualizado em', valor: 'julho 2026' },
  { rotulo: 'Produto', valor: 'Gabi IA (plataforma)' },
  { rotulo: 'Serviço', valor: 'gabi, sidecar do Configurador' },
  { rotulo: 'Rota base', valor: 'disponível em todo o workspace' },
]

export const SCREENSHOT_HUB_GABI_INSIGHTS = '/university/screenshots/hub-gabi-insights-destaque.png'
export const SCREENSHOT_GABI_JANELA_CONTROLES = '/university/screenshots/gabi-janela-controles.png'
export const SCREENSHOT_GABI_JANELA_EXPANDIDA = '/university/screenshots/gabi-janela-expandida.png'

export const DOC_GABI_SECOES: DocSecao[] = [
  {
    num: 1,
    titulo: 'O que é a Gabi',
    paragrafos: [
      'A **Gabi** é a **base de Inteligência Artificial** da plataforma Gravity, presente em todo o workspace, do primeiro acesso à operação diária nos produtos contratados.',
      'Com ela você resolve **dúvidas simples** (onde clicar, o que significa um campo), **dúvidas complexas** (cruzar dados entre módulos, entender regras de COMEX) e solicita **alterações nos produtos** (criar, editar ou executar ações) **conforme as permissões da sua conta**.',
      'O **Guia Gravity** ensina o passo a passo das telas; a Gabi responde na hora, consulta dados reais da sua empresa e age quando você autoriza. Ela está conectada aos módulos Pedido, BID Frete, Configurador, Hub, Store e Admin, e também conhece a plataforma e o COMEX por meio de um manual inteligente.',
    ],
    callout: {
      tipo: 'dica',
      texto:
        'A Gabi é a camada de IA transversal do Gravity, mas a fonte da verdade continua sendo o banco de dados e as permissões da sua conta. Telas e Configurador permanecem essenciais para governança e operações estruturadas.',
    },
  },
  {
    num: 2,
    titulo: 'Onde encontrar a Gabi',
    imagem: SCREENSHOT_HUB_GABI_INSIGHTS,
    paragrafos: [
      'Existem **três pontos de contato** distintos. Confundir um com outro é comum no início: cada um tem um papel.',
      'O print abaixo destaca o **Gabi Insights** no Hub. O chat flutuante aparece em qualquer tela do workspace pelo botão roxo no canto.',
    ],
    lista: [
      '**Chat flutuante**: botão roxo com ícone de brilho no canto da tela, em Configurador e produtos contratados. Abre o painel de conversa com histórico, envio de mensagens e feedback.',
      '**Widget de onboarding**: em telas como trial, Store e Configurador, um painel compacto com saudação e **sugestões** conforme a rota atual (ex.: “Como criar workspace?” na tela de workspaces).',
      '**Gabi Insights no Hub**: painel no canto inferior direito do **Hub** com **alertas e dicas** dos produtos contratados. É um resumo proativo; **não** é o mesmo chat flutuante.',
      '**Ajuda em campo**: em formulários, o ícone de ajuda ao lado de um campo dispara explicação contextual (consome tokens da quota).',
    ],
    callout: {
      tipo: 'dica',
      texto:
        '**Gabi Insights** (Hub) mostra o que merece atenção agora. O **chat flutuante** é onde você pergunta, consulta e pede ações. São complementares.',
    },
  },
  {
    num: 3,
    titulo: 'O que a Gabi faz',
    paragrafos: [
      'No **chat**, a Gabi pode responder perguntas, consultar dados reais dos produtos, executar ações com transparência e registrar seu feedback.',
      'As ações são classificadas por **risco**: consultas seguem direto; alterações simples passam por validação; exclusões e mudanças graves exigem **sua confirmação** no chat antes de executar.',
      'Administradores Gravity têm acesso extra ao painel Admin (organizações, produtos, eventos de segurança), apenas para contas com esse perfil.',
    ],
    lista: [
      '**Responder perguntas** sobre a plataforma, fluxos e conceitos de COMEX, usando a base de conhecimento e o contexto da página em que você está.',
      '**Consultar dados reais**: listar e detalhar pedidos, KPIs e insights do Pedido; cotações e KPIs do BID Frete; organização, workspaces, usuários, assinaturas e histórico (leitura) no Configurador; catálogo da Store; visão do Hub.',
      '**Executar ações** nos produtos: criar ou editar pedidos, edição em massa, consolidar, transferir itens, duplicar, excluir (com preview), e operações administrativas quando você tem patente adequada.',
      '**Mostrar transparência**: na resposta, indica o que foi consultado ou alterado e se alguma ação aguarda sua confirmação.',
      '**Registrar feedback**: você pode avaliar a resposta (positivo/negativo) para melhoria contínua.',
      '**Lembrar preferências**: memórias por usuário e organização para personalizar respostas futuras.',
    ],
    callout: {
      tipo: 'seguranca',
      texto:
        'Antes de confirmar uma ação destrutiva ou financeira, leia a descrição exibida no chat. A Gabi mostra o que será alterado; cancelar é sempre possível até você confirmar.',
    },
  },
  {
    num: 4,
    titulo: 'Limites, permissões e auditoria',
    paragrafos: [
      'O acesso à Gabi é definido no **Configurador** para cada usuário: quem pode **consultar** dados e quem pode **pedir alterações**. Sem permissão de consulta, o chat não acessa registros; sem permissão de alteração, pedidos de criação ou exclusão ficam bloqueados.',
      'Cada organização tem **quota mensal de tokens** conforme o plano. Conversas, ajuda em campo e chamadas ao modelo consomem essa quota. Ao atingir 100%, novas interações são bloqueadas até o próximo ciclo ou upgrade.',
      'Conversas ficam **persistidas** por usuário. Ações executadas pela Gabi podem aparecer no **Histórico** do Configurador como eventos auditáveis, separado do histórico operacional de cada produto.',
    ],
    lista: [
      '**Não faz:** substituir as permissões da sua conta. Ela obedece ao que está definido no Configurador.',
      '**Não faz:** inventar números ou registros. Se não conseguir buscar o dado, ela informa o problema.',
      '**Não faz:** executar exclusões ou alterações financeiras sem sua confirmação no chat.',
      '**Não faz:** gravar cada clique seu na plataforma. O Histórico do Configurador registra eventos de auditoria definidos pelo sistema, não uma gravação contínua da Gabi.',
    ],
    callout: {
      tipo: 'aviso',
      texto:
        'Monitore o consumo de tokens em Configurador › Organização (quando disponível na sua conta) ou pergunte à Gabi sobre a quota restante do mês.',
    },
  },
]
