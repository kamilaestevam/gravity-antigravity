/**
 * Conteúdo de demonstração das aulas (WIP).
 * Produção: virá do banco de dados via API (tabela `aula` + `bloco_conteudo`).
 */

export type TipoBloco =
  | 'heading'
  | 'texto'
  | 'imagem'
  | 'video'
  | 'citacao'
  | 'destaque'
  | 'definicao'
  | 'dois_colunas'
  | 'timeline'
  | 'destaque_escuro'

export interface BlocoConteudo {
  tipo: TipoBloco
  dados: Record<string, string | number>
}

export interface AulaDemo {
  slug: string
  titulo: string
  duracao: string
  blocos: BlocoConteudo[]
}

const AULAS_LOGIN: AulaDemo[] = [
  {
    slug: 'o-que-e-o-gravity',
    titulo: 'O que é o Gravity',
    duracao: '10m',
    blocos: [
      {
        tipo: 'heading',
        dados: { text: '1. O que é o Gravity?', nivel: 1 },
      },
      {
        tipo: 'imagem',
        dados: {
          src: 'assets/screenshots/login/o-que-e-o-gravity/hub-visao-geral.png', // PLAYWRIGHT_PENDENTE
          alt: 'Visão geral da plataforma Gravity — Hub principal',
          caption: 'A plataforma unificada de gestão de comércio exterior',
          largura: 'full',
        },
      },
      {
        tipo: 'texto',
        dados: {
          text: 'O Gravity é uma plataforma SaaS que centraliza toda a operação de comércio exterior em um único ambiente. Processos que antes dependiam de planilhas fragmentadas, e-mails dispersos e sistemas desconectados — pedidos, despachos aduaneiros, cotações de frete, câmbio e documentos fiscais — passam a operar de forma integrada, com rastreabilidade completa do início ao fim da operação.',
        },
      },
      {
        tipo: 'definicao',
        dados: {
          termo: 'COMEX',
          definicao: 'Comércio Exterior — conjunto de operações de importação e exportação reguladas pela Receita Federal, SISCOMEX e órgãos anuentes. Envolve documentação, logística, câmbio, tributos e compliance.',
        },
      },
      {
        tipo: 'heading',
        dados: { text: 'O problema que o Gravity resolve', nivel: 2 },
      },
      {
        tipo: 'dois_colunas',
        dados: {
          texto: 'Antes do Gravity, uma operação de importação típica exigia coordenar dezenas de e-mails entre importador, despachante e agente de carga, com informações espalhadas em arquivos Excel e PDFs sem versionamento. Qualquer atraso ou erro era identificado tarde demais, gerando multas e retrabalho. O Gravity reúne todos esses atores na mesma tela, com status em tempo real.',
          imagem_src: 'assets/screenshots/login/o-que-e-o-gravity/hub-workspaces-destaque.png', // PLAYWRIGHT_PENDENTE
          imagem_alt: 'HUB do Gravity com workspaces e produtos visíveis',
          imagem_lado: 'direita',
        },
      },
      {
        tipo: 'destaque',
        dados: {
          titulo: 'Abordagem modular',
          text: 'O Gravity é contratado por módulo. A sua empresa pode começar apenas com Pedido e adicionar Processo, Smart Read ou BID Frete conforme a operação crescer. Cada módulo já nasce integrado aos demais.',
          icone: 'info',
        },
      },
      {
        tipo: 'heading',
        dados: { text: 'Os produtos da plataforma', nivel: 2 },
      },
      {
        tipo: 'timeline',
        dados: {
          titulo: 'O ecossistema Gravity',
          itens: JSON.stringify([
            { label: 'Pedido', descricao: 'Centraliza a demanda de compra com rastreamento de status e edição em massa' },
            { label: 'Processo', descricao: 'Acompanha o fluxo operacional completo, do embarque ao desembaraço' },
            { label: 'Smart Read', descricao: 'Extrai e valida dados de documentos fiscais e aduaneiros automaticamente' },
            { label: 'BID Frete', descricao: 'Cotação e comparação de fretes internacionais em tempo real' },
            { label: 'BID Câmbio', descricao: 'Simulação de câmbio e acompanhamento de fechamento' },
          ]),
        },
      },
      {
        tipo: 'destaque_escuro',
        dados: {
          titulo: 'Caso de uso: trading de eletrônicos',
          texto: 'Uma trading importadora de componentes eletrônicos da Ásia operava com 12 planilhas simultâneas para acompanhar 80 processos mensais. Após implementar o Gravity (Pedido + Processo + Smart Read), o tempo médio de conferência documental caiu de 3 horas para 25 minutos por processo. A visibilidade em tempo real eliminou 90% das ligações internas de status.',
          imagem_src: 'assets/screenshots/login/o-que-e-o-gravity/processo-lista-com-dados.png', // PLAYWRIGHT_PENDENTE
          imagem_alt: 'Lista de processos com status em tempo real',
        },
      },
      {
        tipo: 'citacao',
        dados: {
          texto: 'Visibilidade total, do pedido ao desembaraço.',
          autor: 'Time Gravity',
        },
      },
      {
        tipo: 'texto',
        dados: {
          text: 'O Gravity é o ambiente onde todos os envolvidos em uma operação de COMEX — importador, despachante, agente de carga, financeiro — acessam a mesma informação, no mesmo momento. A próxima aula mostra como criar sua conta e dar os primeiros passos na plataforma.',
        },
      },
    ],
  },
  {
    slug: 'criando-sua-conta',
    titulo: 'Criando sua conta',
    duracao: '10m',
    blocos: [
      { tipo: 'heading', dados: { text: '2. Criando sua conta no Gravity', nivel: 1 } },
      { tipo: 'texto', dados: { text: 'O acesso ao Gravity começa pelo convite enviado pelo administrador da sua organização. Ao clicar no link do e-mail, você será direcionado para o cadastro com nome, e-mail corporativo e senha.' } },
      { tipo: 'destaque', dados: { titulo: 'Dica', text: 'Use seu e-mail corporativo. O domínio do e-mail é usado para associar automaticamente sua conta à organização correta.' } },
      { tipo: 'video', dados: { titulo: 'Como criar sua conta — demonstração', duracao: '3m' } },
      { tipo: 'texto', dados: { text: 'Após o cadastro, você será redirecionado para o Hub e verá os workspaces aos quais tem acesso. Se ainda não tiver acesso a nenhum workspace, entre em contato com o administrador.' } },
    ],
  },
  {
    slug: 'configurando-seu-perfil',
    titulo: 'Configurando seu perfil',
    duracao: '10m',
    blocos: [
      { tipo: 'heading', dados: { text: '3. Configurando seu perfil', nivel: 1 } },
      { tipo: 'texto', dados: { text: 'Com a conta criada, o próximo passo é completar seu perfil: foto, nome de exibição, fuso horário e idioma preferido (disponível em PT, EN e ES).' } },
      { tipo: 'imagem', dados: { alt: 'Tela de perfil do usuário', caption: 'Configurações de perfil' } },
      { tipo: 'texto', dados: { text: 'O idioma selecionado aqui será aplicado em toda a plataforma. Você pode alterá-lo a qualquer momento pelo seletor no canto superior direito de qualquer tela.' } },
      { tipo: 'destaque', dados: { titulo: 'Próximos passos', text: 'Com o perfil configurado, você está pronto para explorar o Hub e começar a trabalhar nos seus produtos.' } },
    ],
  },
]

export const CONTEUDO_DEMO: Record<string, AulaDemo[]> = {
  login: AULAS_LOGIN,
}

export function getAulaDemo(produto: string, faseSlug: string): AulaDemo | null {
  return CONTEUDO_DEMO[produto]?.find(a => a.slug === faseSlug) ?? null
}

export function getAulasDemo(produto: string): AulaDemo[] {
  return CONTEUDO_DEMO[produto] ?? []
}
