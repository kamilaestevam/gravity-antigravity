/**
 * Exemplos de conversa Gabi para a Academy — alinhados ao catálogo real de ferramentas.
 */

export type DificuldadeGabiExemplo = 'facil' | 'medio' | 'dificil'

export type ToolChipGabiExemplo = {
  tool_id: string
  sucesso: boolean
  duracao_ms: number
}

export type ConfirmacaoGabiExemplo = {
  classe: 'write_safe' | 'write_destrutiva' | 'write_financeira'
  descricao: string
  estado?: 'pendente' | 'confirmado'
}

export type MensagemGabiExemplo = {
  role: 'user' | 'assistant'
  content: string
  hora: string
  tools?: ToolChipGabiExemplo[]
  confirmacao?: ConfirmacaoGabiExemplo
  dados_alterados?: boolean
}

export type ExemploConversaGabi = {
  id: string
  dificuldade: DificuldadeGabiExemplo
  titulo: string
  contexto: string
  mensagens: MensagemGabiExemplo[]
}

export const EXEMPLOS_CONVERSA_GABI: ExemploConversaGabi[] = [
  {
    id: 'onboarding-primeiros-passos',
    dificuldade: 'facil',
    titulo: 'Onboarding: por onde começar',
    contexto: '/trial',
    mensagens: [
      {
        role: 'user',
        content: 'Acabei de criar minha conta. Qual o próximo passo?',
        hora: '09:14',
      },
      {
        role: 'assistant',
        content:
          'Bem-vindo à Gravity! Sugiro esta ordem:\n\n' +
          '1. **Configurador** → complete os dados da organização e crie seu primeiro **workspace**.\n' +
          '2. **Hub** → veja os produtos já disponíveis e o painel **Gabi Insights**.\n' +
          '3. **Guia Gravity** → trilha *Bem Vindo* e *Login* se quiser revisar telas com calma.\n\n' +
          'Posso te guiar em qualquer uma dessas etapas agora.',
        hora: '09:14',
      },
    ],
  },
  {
    id: 'o-que-e-workspace',
    dificuldade: 'facil',
    titulo: 'O que é workspace',
    contexto: '/configurador/workspaces',
    mensagens: [
      {
        role: 'user',
        content: 'O que é um workspace?',
        hora: '10:02',
      },
      {
        role: 'assistant',
        content:
          'No Gravity, **workspace** é a unidade onde sua equipe opera um recorte da organização: filial, projeto ou operação com produtos e usuários próprios.\n\n' +
          'A **organização** é a conta contratante; dentro dela você pode ter **vários workspaces**, cada um com assinaturas e permissões separadas.\n\n' +
          'Quer que eu **liste os workspaces** que você já tem acesso?',
        hora: '10:02',
      },
      {
        role: 'user',
        content: 'Sim, lista por favor.',
        hora: '10:03',
      },
      {
        role: 'assistant',
        content:
          'Encontrei **2 workspaces** ativos na sua organização:\n\n' +
          '* **Matriz Comex** · 8 usuários · Pedido, BID Frete\n' +
          '* **Filial SP** · 3 usuários · Pedido\n\n' +
          'Para criar outro, use Configurador → Workspaces → **Novo workspace**.',
        hora: '10:03',
        tools: [{ tool_id: 'config.listar_workspaces', sucesso: true, duracao_ms: 412 }],
      },
    ],
  },
  {
    id: 'pedidos-atrasados',
    dificuldade: 'medio',
    titulo: 'Pedidos atrasados no mês',
    contexto: '/produto/pedido',
    mensagens: [
      {
        role: 'user',
        content: 'Quantos pedidos estão atrasados este mês?',
        hora: '11:27',
      },
      {
        role: 'assistant',
        content:
          'Consultei os pedidos do workspace **Matriz Comex** no período atual.\n\n' +
          '**7 pedidos** estão com entrega prevista vencida e status ainda em **em_andamento** ou **aberto**.\n\n' +
          'Os três mais críticos:\n' +
          '* PO-2026-1184 · exportador Nordtek · 12 dias de atraso\n' +
          '* PO-2026-1099 · exportador Acme Corp · 8 dias\n' +
          '* PO-2026-1041 · exportador Global Parts · 5 dias\n\n' +
          'Quer abrir o detalhe de algum ou filtrar só os acima de 10 dias?',
        hora: '11:28',
        tools: [{ tool_id: 'pedido.listar', sucesso: true, duracao_ms: 891 }],
      },
    ],
  },
  {
    id: 'store-catalogo',
    dificuldade: 'medio',
    titulo: 'O que contratar na Store',
    contexto: '/store',
    mensagens: [
      {
        role: 'user',
        content: 'Quais produtos Gravity posso contratar agora?',
        hora: '15:41',
      },
      {
        role: 'assistant',
        content:
          'Na **Gravity Store** desta organização, estes módulos estão disponíveis para contratação:\n\n' +
          '* **Smart Docs** · leitura inteligente de documentos COMEX\n' +
          '* **BID Frete Internacional** · cotações e comparativo de fretes\n' +
          '* **Processo** · workflow de importação/exportação\n\n' +
          'Você já tem **Pedido** ativo. Quer comparar planos de algum produto?',
        hora: '15:41',
        tools: [{ tool_id: 'store.catalogo', sucesso: true, duracao_ms: 356 }],
      },
    ],
  },
  {
    id: 'excluir-cotacao-bid-frete',
    dificuldade: 'medio',
    titulo: 'Excluir cotação (limite real da Gabi)',
    contexto: '/produto/bid-frete',
    mensagens: [
      {
        role: 'user',
        content: 'Exclui a cotação BFI-2026-0142',
        hora: '16:08',
      },
      {
        role: 'assistant',
        content:
          'Localizei a cotação **BFI-2026-0142** (Shanghai → Santos · marítimo · status **em cotação**).\n\n' +
          'Hoje a Gabi **consulta** cotações do BID Frete, mas **não possui ferramenta de exclusão** nesse produto no catálogo atual.\n\n' +
          'Para excluir com segurança:\n' +
          '1. Abra **BID Frete** → aba **Lista**\n' +
          '2. Localize **BFI-2026-0142**\n' +
          '3. Use o menu de ações → **Excluir cotação**\n\n' +
          'Posso te mostrar o detalhe completo ou listar cotações do mesmo exportador.',
        hora: '16:09',
        tools: [{ tool_id: 'bid_frete.detalhar_cotacao', sucesso: true, duracao_ms: 524 }],
      },
    ],
  },
  {
    id: 'bid-cambio-somente-kb',
    dificuldade: 'dificil',
    titulo: 'BID Câmbio: só base de conhecimento',
    contexto: '/hub',
    mensagens: [
      {
        role: 'user',
        content: 'Qual a taxa de fechamento do meu BID Câmbio de hoje?',
        hora: '17:22',
      },
      {
        role: 'assistant',
        content:
          'O **BID Câmbio** ainda **não tem ferramenta conectada** à Gabi para consultar taxas ao vivo no seu workspace.\n\n' +
          'Posso explicar como funciona o fluxo de simulação e fechamento (conceitos, telas e regras), mas **não consigo ler nem alterar** cotações de câmbio pela API hoje.\n\n' +
          'Para ver taxas reais, abra o produto **BID Câmbio** no menu ou contrate o módulo na Store se ainda não estiver ativo.',
        hora: '17:23',
      },
    ],
  },
  {
    id: 'excluir-workspace-confirmacao',
    dificuldade: 'dificil',
    titulo: 'Excluir workspace com confirmação',
    contexto: '/configurador/workspaces',
    mensagens: [
      {
        role: 'user',
        content: 'Exclui o workspace Filial SP',
        hora: '18:05',
      },
      {
        role: 'assistant',
        content:
          'Encontrei o workspace **Filial SP** (3 usuários vinculados, produto Pedido).\n\n' +
          'Esta ação é **irreversível**: usuários perdem o vínculo e os dados do workspace deixam de aparecer no escopo.\n\n' +
          'Confirme abaixo para eu executar a exclusão.',
        hora: '18:05',
        tools: [{ tool_id: 'config.detalhar_workspace', sucesso: true, duracao_ms: 287 }],
        confirmacao: {
          classe: 'write_destrutiva',
          descricao: 'Excluir workspace "Filial SP" e desvincular 3 usuários.',
          estado: 'pendente',
        },
      },
      {
        role: 'user',
        content: 'Confirmo a exclusão.',
        hora: '18:06',
      },
      {
        role: 'assistant',
        content:
          'Workspace **Filial SP** excluído com sucesso.\n\n' +
          'Os usuários continuam na organização, mas sem vínculo com esse workspace. Você pode reatribuí-los em Configurador → Usuários.',
        hora: '18:06',
        tools: [{ tool_id: 'config.excluir_workspace', sucesso: true, duracao_ms: 1204 }],
        dados_alterados: true,
      },
    ],
  },
  {
    id: 'criar-pedido-rascunho',
    dificuldade: 'dificil',
    titulo: 'Criar pedido (escrita segura)',
    contexto: '/produto/pedido',
    mensagens: [
      {
        role: 'user',
        content: 'Cria um pedido rascunho para o exportador Acme Corp, incoterm FOB, moeda USD',
        hora: '14:18',
      },
      {
        role: 'assistant',
        content:
          'Vou criar o pedido com estes dados:\n\n' +
          '* Exportador: **Acme Corp**\n' +
          '* Status: **rascunho**\n' +
          '* Incoterm: **FOB**\n' +
          '* Moeda: **USD**\n\n' +
          'Confirma para eu gravar?',
        hora: '14:18',
        confirmacao: {
          classe: 'write_safe',
          descricao: 'Criar pedido rascunho · Acme Corp · FOB · USD',
          estado: 'pendente',
        },
      },
      {
        role: 'user',
        content: 'Pode criar.',
        hora: '14:19',
      },
      {
        role: 'assistant',
        content:
          'Pedido **PO-2026-1207** criado em rascunho.\n\n' +
          'Abra a lista de Pedidos para complementar itens e datas, ou peça para eu editar campos específicos.',
        hora: '14:19',
        tools: [{ tool_id: 'pedido.criar', sucesso: true, duracao_ms: 678 }],
        dados_alterados: true,
      },
    ],
  },
]

export const ROTULO_DIFICULDADE: Record<DificuldadeGabiExemplo, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
}
