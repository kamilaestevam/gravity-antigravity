/**
 * Exemplos de conversa Gabi para a Academy — linguagem do usuário, comportamento real.
 */

export type DificuldadeGabiExemplo = 'facil' | 'media' | 'dificil'

export type ToolChipExemplo = {
  tool_id: string
  rotulo?: string
  sucesso: boolean
  duracao_ms: number
}

export type ConfirmacaoExemplo = {
  classe: 'WRITE_SAFE' | 'WRITE_DESTRUTIVA' | 'WRITE_FINANCEIRA'
  descricao: string
  estado?: 'pendente' | 'confirmado'
}

export type MensagemGabiExemplo = {
  role: 'user' | 'assistant'
  content: string
  hora: string
  tools?: ToolChipExemplo[]
  confirmacoes?: ConfirmacaoExemplo[]
  dados_alterados?: boolean
}

export type ExemploConversaGabi = {
  id: string
  titulo: string
  dificuldade: DificuldadeGabiExemplo
  contexto?: string
  mensagens: MensagemGabiExemplo[]
  nota?: string
}

export const EXEMPLOS_CONVERSA_GABI: ExemploConversaGabi[] = [
  {
    id: 'onboarding-facil',
    titulo: 'Primeiros passos na plataforma',
    dificuldade: 'facil',
    contexto: 'Tela de boas-vindas / trial',
    mensagens: [
      {
        role: 'user',
        content: 'Acabei de criar minha conta. Por onde eu começo?',
        hora: '09:14',
      },
      {
        role: 'assistant',
        content:
          'Bem-vindo à Gravity! Sugiro esta ordem:\n\n' +
          '1. **Guia Gravity › Bem Vindo** para conhecer a plataforma\n' +
          '2. **Configurador › Organização** para completar os dados da empresa\n' +
          '3. **Hub** para ver o que já está liberado no seu trial\n\n' +
          'Posso te guiar em qualquer uma dessas telas. O que prefere fazer agora?',
        hora: '09:14',
      },
    ],
    nota: 'Resposta orientada pelo manual da plataforma, sem alterar dados.',
  },
  {
    id: 'workspace-facil',
    titulo: 'O que é workspace?',
    dificuldade: 'facil',
    contexto: 'Configurador › Workspaces',
    mensagens: [
      {
        role: 'user',
        content: 'O que é um workspace?',
        hora: '10:02',
      },
      {
        role: 'assistant',
        content:
          '**Workspace** é a filial ou unidade em que sua equipe opera dentro da **organização** (sua empresa na Gravity).\n\n' +
          'Cada workspace pode ter produtos contratados, usuários e dados próprios.\n\n' +
          '**Organização** = a conta da empresa (plano, faturamento).\n' +
          '**Workspace** = onde o dia a dia acontece (Pedido, BID Frete, etc.).\n\n' +
          'Quer que eu liste os workspaces ativos da sua conta?',
        hora: '10:02',
      },
    ],
    nota: 'Se você pedir a lista, ela consulta os workspaces reais da conta.',
  },
  {
    id: 'pedidos-atrasados-media',
    titulo: 'Pedidos atrasados no mês',
    dificuldade: 'media',
    contexto: 'Produto Pedido',
    mensagens: [
      {
        role: 'user',
        content: 'Quantos pedidos estão atrasados este mês no workspace atual?',
        hora: '11:27',
      },
      {
        role: 'assistant',
        content:
          'Consultei os pedidos com entrega prevista já vencida neste mês.\n\n' +
          '**Resultado:** **7 pedidos** atrasados (de 43 ativos no período).\n\n' +
          'Os três mais antigos:\n' +
          '* PO-2026-0088: 12 dias de atraso\n' +
          '* PO-2026-0102: 9 dias\n' +
          '* PO-2026-0115: 6 dias\n\n' +
          'Quer abrir a lista filtrada ou ver o detalhe de algum pedido?',
        hora: '11:27',
        tools: [{ tool_id: 'pedido.listar', rotulo: 'Consultou pedidos', sucesso: true, duracao_ms: 412 }],
      },
    ],
    nota: 'Ela busca dados reais do módulo Pedido.',
  },
  {
    id: 'excluir-cotacao-media',
    titulo: 'Excluir cotação de frete',
    dificuldade: 'media',
    contexto: 'BID Frete Internacional',
    mensagens: [
      {
        role: 'user',
        content: 'Exclui a cotação BFI-2026-0142 para mim.',
        hora: '14:05',
      },
      {
        role: 'assistant',
        content:
          'Encontrei a cotação **BFI-2026-0142** (Santos → Rotterdam, status **Em cotação**).\n\n' +
          'Hoje, pelo chat, consigo **consultar** cotações de frete, mas **não excluir**. ' +
          'Para apagar com segurança, vá em:\n\n' +
          '**BID Frete Internacional › Lista** → localize BFI-2026-0142 → **Excluir**.\n\n' +
          'Posso mostrar propostas, indicadores ou outras cotações abertas.',
        hora: '14:05',
        tools: [{ tool_id: 'bid_frete.detalhar_cotacao', rotulo: 'Abriu a cotação', sucesso: true, duracao_ms: 286 }],
      },
    ],
    nota: 'No BID Frete ela consulta, mas exclusão ainda é feita na tela do produto.',
  },
  {
    id: 'criar-pedido-media',
    titulo: 'Criar pedido pelo chat',
    dificuldade: 'media',
    contexto: 'Produto Pedido',
    mensagens: [
      {
        role: 'user',
        content: 'Cria um pedido FOB USD para o exportador Acme Corp.',
        hora: '15:41',
      },
      {
        role: 'assistant',
        content:
          'Vou criar o pedido com estes dados:\n\n' +
          '* Exportador: **Acme Corp**\n' +
          '* INCOTERM: **FOB**\n' +
          '* Moeda: **USD**\n' +
          '* Número: gerado automaticamente\n\n' +
          'Confirma a criação?',
        hora: '15:41',
        confirmacoes: [{
          classe: 'WRITE_SAFE',
          descricao: 'Criar pedido FOB USD para Acme Corp',
          estado: 'pendente',
        }],
      },
      {
        role: 'user',
        content: 'Sim, pode criar.',
        hora: '15:42',
      },
      {
        role: 'assistant',
        content:
          'Pedido **PO-2026-0194** criado com sucesso neste workspace.\n\n' +
          'Quer incluir itens agora ou abrir na lista de pedidos?',
        hora: '15:42',
        tools: [{ tool_id: 'pedido.criar', rotulo: 'Criou o pedido', sucesso: true, duracao_ms: 518 }],
        dados_alterados: true,
      },
    ],
    nota: 'Alterações no Pedido passam pela sua confirmação no chat.',
  },
  {
    id: 'bid-cambio-kb-media',
    titulo: 'Pergunta sobre o BID Câmbio',
    dificuldade: 'media',
    contexto: 'Hub',
    mensagens: [
      {
        role: 'user',
        content: 'Qual a melhor taxa de câmbio disponível agora no BID Câmbio?',
        hora: '16:18',
      },
      {
        role: 'assistant',
        content:
          'No **BID Câmbio** ainda não consigo consultar taxas ao vivo pelo chat.\n\n' +
          'Posso explicar como funciona o módulo (simulação, fechamento, histórico). ' +
          'Para ver taxas e operar, abra **BID Câmbio** no Hub.\n\n' +
          'Quer um resumo de como fechar um câmbio?',
        hora: '16:18',
      },
    ],
    nota: 'Neste módulo ela explica o processo, mas ainda não acessa os dados ao vivo.',
  },
  {
    id: 'excluir-workspace-dificil',
    titulo: 'Excluir um workspace',
    dificuldade: 'dificil',
    contexto: 'Configurador › Workspaces',
    mensagens: [
      {
        role: 'user',
        content: 'Exclui o workspace Filial SP. Não usamos mais.',
        hora: '17:03',
      },
      {
        role: 'assistant',
        content:
          '**Atenção:** excluir um workspace é **irreversível**.\n\n' +
          '**Workspace:** Filial SP\n' +
          '**Usuários vinculados:** 4\n' +
          '**Produtos ativos:** Pedido, BID Frete\n\n' +
          'Os dados desta filial deixam de ficar acessíveis nesta conta. Só confirme se tiver certeza.',
        hora: '17:03',
        tools: [{ tool_id: 'config.detalhar_workspace', rotulo: 'Consultou o workspace', sucesso: true, duracao_ms: 198 }],
        confirmacoes: [{
          classe: 'WRITE_DESTRUTIVA',
          descricao: 'Excluir workspace Filial SP e desvincular usuários',
          estado: 'pendente',
        }],
      },
      {
        role: 'user',
        content: 'Confirmo. Pode excluir.',
        hora: '17:04',
      },
      {
        role: 'assistant',
        content:
          'Workspace **Filial SP** excluído. O registro ficou no histórico do Configurador.\n\n' +
          'Se precisar de outra filial, posso ajudar a criar um novo workspace.',
        hora: '17:04',
        tools: [{ tool_id: 'config.excluir_workspace', rotulo: 'Excluiu o workspace', sucesso: true, duracao_ms: 624 }],
        dados_alterados: true,
      },
    ],
    nota: 'Ações irreversíveis sempre pedem sua confirmação explícita.',
  },
  {
    id: 'sql-cruzamento-dificil',
    titulo: 'Cruzar pedidos e fretes',
    dificuldade: 'dificil',
    contexto: 'Produto Pedido',
    mensagens: [
      {
        role: 'user',
        content: 'Cruza pedidos em aberto com cotações de frete do mesmo exportador neste trimestre.',
        hora: '18:22',
      },
      {
        role: 'assistant',
        content:
          'Essa pergunta envolve Pedido e BID Frete ao mesmo tempo. Fiz uma consulta avançada nos dados da sua organização.\n\n' +
          '**Resumo:** 3 exportadores com pedido aberto **e** cotação ativa no trimestre.\n\n' +
          '* **Acme Corp**: 2 pedidos, 1 cotação marítima\n' +
          '* **Global Parts Ltd**: 1 pedido, 2 cotações\n' +
          '* **Nordic Supply**: 1 pedido, 1 cotação aérea\n\n' +
          'Quer ver a tabela completa ou aprofundar um exportador?',
        hora: '18:23',
        tools: [{ tool_id: 'gabi.consultar_dados', rotulo: 'Cruzou dados da organização', sucesso: true, duracao_ms: 891 }],
      },
    ],
    nota: 'Consultas avançadas exigem permissão Master ou superior na conta.',
  },
]

export const EXEMPLOS_CONVERSA_GABI_POR_ID = Object.fromEntries(
  EXEMPLOS_CONVERSA_GABI.map((e) => [e.id, e]),
) as Record<string, ExemploConversaGabi>

export const IDS_EXEMPLOS_AULA_O_QUE_E_GABI = [
  'onboarding-facil',
  'workspace-facil',
  'pedidos-atrasados-media',
  'excluir-cotacao-media',
  'criar-pedido-media',
  'bid-cambio-kb-media',
  'excluir-workspace-dificil',
  'sql-cruzamento-dificil',
] as const
