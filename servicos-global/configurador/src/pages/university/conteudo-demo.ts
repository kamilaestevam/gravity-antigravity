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
          alt: 'Plataforma Gravity — visão geral',
          caption: 'A plataforma unificada de gestão de COMEX',
        },
      },
      {
        tipo: 'texto',
        dados: {
          text: 'O Gravity é uma plataforma SaaS desenvolvida para modernizar e centralizar a gestão de comércio exterior. Ele reúne em um único ambiente todas as operações que antes estavam distribuídas em planilhas, e-mails e sistemas desconectados — desde o acompanhamento de pedidos até a emissão de documentos fiscais.',
        },
      },
      {
        tipo: 'destaque',
        dados: {
          titulo: 'Por que o Gravity existe?',
          text: 'O COMEX brasileiro envolve dezenas de etapas, órgãos e documentos. O Gravity nasceu para dar visibilidade total ao processo, reduzir retrabalho e conectar todas as partes envolvidas em uma operação de importação ou exportação.',
        },
      },
      {
        tipo: 'heading',
        dados: { text: 'Os pilares da plataforma', nivel: 2 },
      },
      {
        tipo: 'texto',
        dados: {
          text: 'O Gravity é organizado em produtos independentes que se complementam: Pedido (gestão da demanda), Processo (fluxo operacional), Smart Read (leitura inteligente de documentos), BID Frete (cotação de fretes internacionais) e BID Câmbio (simulação de câmbio). Cada produto pode ser contratado separadamente.',
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
          text: 'Ao longo deste onboarding você vai aprender como navegar pela plataforma, configurar seu workspace, convidar sua equipe e começar a operar com o produto que a sua empresa contratou. Vamos começar!',
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
