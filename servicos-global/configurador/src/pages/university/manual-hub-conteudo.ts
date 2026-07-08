import type { DocFluxo, DocPassoVisual, DocSecao } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

/** SSOT: arquivos em public/university/screenshots/ */
const SCREENSHOT_HUB_SEM_PRODUTO_PUZZLES_OPACO = '/university/screenshots/hub-puzzles-opaco-sem-produto.png'
const SCREENSHOT_HUB_COM_PRODUTO_PUZZLES_ATIVOS = '/university/screenshots/hub-puzzles-ativos-com-produto.png'
const SCREENSHOT_HUB_INTRO_COM_SETA = '/university/screenshots/hub-tela-principal-com-seta.png'
const SCREENSHOT_HUB_MENU_SUPERIOR = '/university/screenshots/hub-menu-superior-seta-hub.png'
const SCREENSHOT_HUB_PUZZLES = '/university/screenshots/hub-puzzles-produtos-gravity.png'
const SCREENSHOT_HUB_ACESSO_STORE_123 = '/university/screenshots/hub-acesso-gravity-store-numeros-1-2-3.png'
const SCREENSHOT_HUB_MENU_USUARIO_STORE = '/university/screenshots/hub-menu-usuario-ir-gravity-store.png'
const SCREENSHOT_HUB_AGUARDANDO_ACAO = '/university/screenshots/hub-destaque-aguardando-acao.png'
const SCREENSHOT_HUB_CARROSSEL_VITRINE = '/university/screenshots/hub-carrossel-vitrine-gravity-store.png'
const SCREENSHOT_HUB_GABI_DESTAQUE = '/university/screenshots/hub-gabi-insights-destaque.png'

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

/** SSOT: fluxo «Acesso à Gravity Store» — reutilizado no manual do Hub e da Store. */
export const FLUXO_ACESSO_GRAVITY_STORE: DocFluxo = {
  titulo: 'Acesso à Gravity Store',
  tituloSumario: 'Acesso à Gravity Store',
  paragrafos: [
    'A Gravity Store é o catálogo de produtos Gravity. No Hub existem **três caminhos** principais até ela.',
  ],
  passosVisuais: renumerarPassos([
    {
      titulo: 'Caminhos para abrir a Store',
      paragrafos: [
        '1. **Botão “Ir para Gravity Store”**: aparece **apenas no primeiro acesso** ou enquanto a organização **não tiver nenhum Produto Gravity contratado**, como indicado pelo **1** na imagem.',
        '2. **Link “Gravity Store” (2 na imagem)** no cabeçalho de **Seus Produtos Gravity**. Este atalho fica **disponível de forma permanente**.',
        '3. **Painel Gravity Store** na faixa inferior (card em carrossel; ver seção **Vitrine Store**), **3** na imagem.',
      ],
      figurasAposParagrafo: [
        {
          indice: 2,
          imagem: SCREENSHOT_HUB_ACESSO_STORE_123,
          legenda: 'Caminhos 1, 2 e 3 na tela do Hub',
        },
      ],
      dicaAoLadoImagem: {
        callout: {
          tipo: 'dica',
          texto: 'Também é possível acessar a {{link:/university-gravity/docs/store|Gravity Store}} de **qualquer tela** da plataforma: clique no **ícone do usuário** (canto superior direito) e escolha *_Ir para Gravity Store_*.',
        },
        imagem: SCREENSHOT_HUB_MENU_USUARIO_STORE,
        legenda: 'Menu do usuário — Ir para Gravity Store',
      },
    },
  ]),
}

export const DOC_HUB_SUBTITULO =
  'Tela principal: Produtos Gravity, Store e Gabi Insights'

export const DOC_HUB_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '1.0' },
  { rotulo: 'Atualizado em', valor: 'junho 2026' },
  { rotulo: 'Produto', valor: 'Hub' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/hub', href: true },
]

export const DOC_HUB_SECAO: DocSecao = {
  num: 1,
  titulo: 'Hub: tela principal da plataforma',
  paragrafos: [
    'O **Hub** é a **tela principal da plataforma Gravity**, o painel central da operação — produtos contratados, Gravity Store, pendências e Gabi Insights em um só lugar.',
  ],
  figurasAposParagrafo: [
    {
      indice: 0,
      imagem: SCREENSHOT_HUB_INTRO_COM_SETA,
      legenda: 'Tela principal do Hub',
    },
  ],
  mostrarInfograficoHubTelas: true,
  fluxos: [
    {
      titulo: 'Acesso ao Hub',
      tituloSumario: 'Acesso ao Hub',
      passosVisuais: renumerarPassos([
        {
          titulo: 'Login na plataforma',
          paragrafos: [
            '**Primeira forma** de acessar o **Hub**: sempre que você **faz login** na plataforma Gravity, é **direcionado ao Hub** — a tela principal com saudação, workspace selecionado e visão geral da sua operação.',
          ],
          imagem: SCREENSHOT_HUB_INTRO_COM_SETA,
        },
        {
          titulo: 'Atalho no menu superior',
          paragrafos: [
            '**Segunda forma** de acessar o **Hub**: em **qualquer tela** autenticada da plataforma — Hub, produto, Gravity Store, Configurador ou Gravity University — o **menu superior** mantém o atalho **Hub** visível. Basta clicá-lo para voltar ao painel central.',
          ],
          imagem: SCREENSHOT_HUB_MENU_SUPERIOR,
          imagemAbaixoTexto: true,
        },
      ]),
    },
    {
      titulo: 'Seus produtos Gravity',
      tituloSumario: 'Seus produtos Gravity',
      modoCenarios: true,
      paragrafos: [
        'Aqui no **Hub** são exibidos **todos os produtos Gravity** na plataforma, **comprados e não comprados** pela organização.',
        'Por meio do Hub você **acessa qualquer produto Gravity** que a organização tenha contratado e habilitado no workspace. Pedido, Processo, Smart Docs, BID Frete, Simula Custo e demais módulos aparecem na seção **Seus Produtos Gravity**: Basta clicar no módulo para abrir o produto no workspace selecionado.',
      ],
      figurasAposParagrafo: [
        {
          indice: 1,
          imagem: SCREENSHOT_HUB_PUZZLES,
          legenda: 'Seção Seus Produtos Gravity',
        },
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Sem produto contratado',
          paragrafos: [
            'Quando nenhum **Produto Gravity** está contratado, os **ícones dos produtos** aparecem em prévia (cinza) e um banner convida a *_Ativar na Gravity Store_*.',
          ],
          imagem: SCREENSHOT_HUB_SEM_PRODUTO_PUZZLES_OPACO,
          imagemAbaixoTexto: true,
          callout: {
            tipo: 'dica',
            texto: 'Assim que entrar no Hub, vá até a {{link:/university-gravity/docs/store|Gravity Store}} e contrate seu primeiro produto para iniciar na plataforma.',
          },
        },
        {
          titulo: 'Com produto contratado',
          paragrafos: [
            'Com assinaturas **ativas**, os **Produtos Gravity contratados** ficam iluminados e clicáveis e abrem o produto no workspace selecionado.',
          ],
          imagem: SCREENSHOT_HUB_COM_PRODUTO_PUZZLES_ATIVOS,
          imagemAbaixoTexto: true,
        },
      ]),
    },
    FLUXO_ACESSO_GRAVITY_STORE,
    {
      titulo: 'Aguardando ação',
      tituloSumario: 'Aguardando ação',
      paragrafos: [
        'O card **Aguardando ação** reúne **pendências e alertas** do usuário nos **produtos contratados**, um panorama rápido do que precisa de ação no workspace.',
      ],
      callout: {
        tipo: 'dica',
        texto: 'Aqui é só o **resumo**. Para **controle total**, use o **dashboard de cada produto**.',
      },
      calloutAposPassos: true,
      passosVisuais: [
        {
          num: 1,
          titulo: 'Card Aguardando ação',
          ocultarRotuloPasso: true,
          ocultarTituloPasso: true,
          imagem: SCREENSHOT_HUB_AGUARDANDO_ACAO,
          imagemAbaixoTexto: true,
          paragrafos: [],
        },
      ],
    },
    {
      titulo: 'Vitrine Gravity Store no Hub',
      tituloSumario: 'Vitrine Gravity Store no Hub',
      modoCenarios: true,
      paragrafos: [
        'O painel inferior esquerdo **Gravity Store** é uma vitrine dos Produtos Gravity que você **ainda não contratou**.',
        'Cada card exibe um **selo de status** no canto superior:',
        '**Disponível** (verde): o produto já pode ser **contratado na Store**. Clique no card para abrir a vitrine.',
        '**Em breve** (âmbar): o produto já aparece no ecossistema, mas a **contratação ainda não foi liberada**. O card é só para conhecer o que vem aí.',
      ],
      figurasAposParagrafo: [
        {
          indice: 3,
          imagem: SCREENSHOT_HUB_CARROSSEL_VITRINE,
          legenda: 'Vitrine Gravity Store no Hub',
        },
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Carrossel da vitrine',
          paragrafos: [
            'O carrossel mostra somente produtos **disponíveis** ou **em breve**, os que você já contratou não aparecem aqui.',
            'A vitrine **gira automaticamente a cada 3,5 segundos**; ao passar o mouse, a rotação **pausa**.',
            'Use as **setas** e as **bolinhas** para navegar manualmente. Clique no card para abrir a {{link:/university-gravity/docs/store|Gravity Store}}.',
          ],
        },
      ]),
    },
    {
      titulo: 'Gabi Insights',
      tituloSumario: 'Gabi Insights',
      paragrafos: [
        'O painel **Gabi Insights** (canto inferior direito do Hub) resume **alertas e dicas** dos **Produtos Gravity contratados** — o que merece atenção agora, sem abrir cada dashboard.',
      ],
      callout: {
        tipo: 'dica',
        texto: 'Assim como **Aguardando ação**, os insights são um **resumo no Hub**. Para análise completa, abra o **dashboard do produto** indicado no card.',
      },
      calloutAposPassos: true,
      passosVisuais: renumerarPassos([
        {
          titulo: 'Painel no Hub',
          imagem: SCREENSHOT_HUB_GABI_DESTAQUE,
          imagemAbaixoTexto: true,
          paragrafos: [],
        },
        {
          titulo: 'O que entra',
          paragrafos: [
            'A Gabi cruza indicadores de **Pedido**, **BID Frete**, **BID Câmbio**, **Simula Custo**, **LPCO**, **NF de Importação** e demais produtos **ativos** no seu workspace.',
          ],
        },
        {
          titulo: 'Como navegar',
          paragrafos: [
            'Até **três cards** por página. Rotação automática **a cada 5 segundos** — passe o mouse para pausar. Use **setas** e **bolinhas** para mudar de página. O selo **AO VIVO** indica conteúdo atualizado.',
          ],
        },
        {
          titulo: 'Como ler um card',
          paragrafos: [
            'Cada card traz o **produto de origem** (ex.: PEDIDO · Atrasos), a **mensagem** em linguagem clara, um **número de apoio** quando couber e um **atalho** para agir (ex.: Corrigir agora).',
            'Destaque **âmbar** = **pendência**. Demais cores = oportunidade ou dica de uso da plataforma.',
          ],
        },
      ]),
    },
  ],
}
