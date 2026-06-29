import type { DocPassoVisual, DocSecao } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

/** SSOT: arquivos em public/university/screenshots/ */
const SCREENSHOT_HUB_SEM_PRODUTO_PUZZLES_OPACO = '/university/screenshots/hub-puzzles-opaco-sem-produto.png'
const SCREENSHOT_HUB_COM_PRODUTO = '/university/screenshots/hub-tela-com-produto-contratado.png'
const SCREENSHOT_HUB_COM_PRODUTO_PUZZLES_ATIVOS = '/university/screenshots/hub-puzzles-ativos-com-produto.png'
const SCREENSHOT_HUB_INTRO_COM_SETA = '/university/screenshots/hub-tela-principal-com-seta.png'
const SCREENSHOT_HUB_MENU_SUPERIOR = '/university/screenshots/hub-menu-superior-seta-hub.png'
const SCREENSHOT_HUB_PUZZLES = '/university/screenshots/hub-puzzles-produtos-gravity.png'
const SCREENSHOT_HUB_ACESSO_STORE_123 = '/university/screenshots/hub-acesso-gravity-store-numeros-1-2-3.png'
const SCREENSHOT_HUB_MENU_USUARIO_STORE = '/university/screenshots/hub-menu-usuario-ir-gravity-store.png'

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const DOC_HUB_SUBTITULO =
  'Tela principal: Produtos Gravity, Store e GABI'

export const DOC_HUB_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '1.0' },
  { rotulo: 'Atualizado em', valor: 'junho 2026' },
  { rotulo: 'Produto', valor: 'Hub' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/hub', href: true },
  { rotulo: 'Rota base', valor: '/hub' },
]

export const DOC_HUB_SECAO: DocSecao = {
  num: 1,
  titulo: 'Hub: Tela principal da plataforma',
  layoutTextoImagemLateral: true,
  imagem: SCREENSHOT_HUB_INTRO_COM_SETA,
  paragrafos: [
    'O **Hub** é a **tela principal da plataforma Gravity**, o painel central para onde você vai após o login e para onde pode voltar a qualquer momento pelo **ícone Hub** no menu superior das telas (em qualquer produto).',
    'Por meio do Hub você **acessa qualquer produto Gravity** que a organização tenha contratado e habilitado no workspace. Pedido, Processo, Smart Docs, BID Frete, Simula Custo e demais módulos aparecem na seção **Seus Produtos Gravity**: Basta clicar no módulo para abrir o produto no workspace selecionado.',
    'O Hub também é a porta de entrada da {{link:/university-gravity/docs/store|Gravity Store}}: Descubra módulos ainda não contratados, contrate novos produtos ou use os atalhos da vitrine e do banner quando ainda não houver nenhum módulo ativo.',
  ],
  figurasAposParagrafo: [
    {
      indice: 0,
      imagem: SCREENSHOT_HUB_MENU_SUPERIOR,
      legenda: 'Ícone Hub no menu superior',
    },
    {
      indice: 1,
      imagem: SCREENSHOT_HUB_PUZZLES,
      legenda: 'Seção Seus Produtos Gravity',
    },
  ],
  mostrarInfograficoHubTelas: true,
  fluxos: [
    {
      titulo: 'Seus Produtos Gravity',
      tituloSumario: 'Seus Produtos',
      modoCenarios: true,
      paragrafos: [
        'Aqui no **Hub** são exibidos **todos os produtos disponíveis** na plataforma — **comprados e não comprados** pela organização.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Sem produto contratado',
          paragrafos: [
            'Quando nenhum **Produto Gravity** está contratado, os **ícones dos módulos** aparecem em prévia (cinza) e um banner convida a **Ativar na Gravity Store**.',
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
            'O seletor de workspace no topo define em qual filial você entra ao clicar em um **Produto Gravity contratado**.',
          ],
          imagem: SCREENSHOT_HUB_COM_PRODUTO_PUZZLES_ATIVOS,
          imagemAbaixoTexto: true,
        },
      ]),
    },
    {
      titulo: 'Acesso à Gravity Store',
      tituloSumario: 'Acesso à Store',
      paragrafos: [
        'A Gravity Store é o catálogo de módulos Gravity. No Hub existem **três caminhos** principais até ela.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Caminhos para abrir a Store',
          paragrafos: [
            '1. **Banner “Ative seu primeiro módulo”**: CTA primário quando não há módulo contratado — como indicado pelo **1** na imagem.',
            '2. **Link Gravity Store** no cabeçalho de Seus Produtos Gravity — **2** na imagem.',
            '3. **Painel Gravity Store** na faixa inferior (card em carrossel — ver seção **Vitrine Store**) — **3** na imagem.',
          ],
          figurasAposParagrafo: [
            {
              indice: 2,
              imagem: SCREENSHOT_HUB_ACESSO_STORE_123,
              legenda: 'Caminhos 1, 2 e 3 na tela do Hub',
            },
          ],
          linkCapitulo: {
            texto: 'Manual completo da Gravity Store',
            href: '/university-gravity/docs/store',
          },
          callout: {
            tipo: 'dica',
            texto: 'Também é possível acessar a {{link:/university-gravity/docs/store|Gravity Store}} de **qualquer tela** da plataforma: clique no **ícone do usuário** (canto superior direito) e escolha **Ir para Gravity Store**.',
          },
        },
        {
          titulo: 'Menu do usuário — Ir para Gravity Store',
          ocultarRotuloPasso: true,
          ocultarTituloPasso: true,
          imagem: SCREENSHOT_HUB_MENU_USUARIO_STORE,
          imagemAbaixoTexto: true,
          paragrafos: [],
        },
      ]),
    },
    {
      titulo: 'Aguardando ação',
      tituloSumario: 'Aguardando ação',
      paragrafos: [
        'Na faixa **Operações em andamento**, o card **Aguardando ação** reúne **pendências e alertas** do usuário nos **produtos contratados** — um panorama rápido do que precisa de ação no workspace.',
      ],
      callout: {
        tipo: 'dica',
        texto: 'Aqui é só o **resumo**. Para **controle total**, use o **dashboard de cada produto**.',
      },
      passosVisuais: [],
    },
    {
      titulo: 'Vitrine Gravity Store no Hub',
      tituloSumario: 'Vitrine Store',
      modoCenarios: true,
      paragrafos: [
        'O painel inferior esquerdo **Gravity Store** é uma vitrine dos Produtos Gravity que você **ainda não contratou**.',
        'Cada card exibe um **selo de status** no canto superior:',
        '**Disponível** (verde): o produto já pode ser **contratado na Store** — clique no card para abrir a vitrine.',
        '**Em breve** (âmbar): o produto já aparece no ecossistema, mas a **contratação ainda não foi liberada** — o card é só para conhecer o que vem aí.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Carrossel da vitrine',
          imagem: SCREENSHOT_HUB_COM_PRODUTO,
          imagemAbaixoTexto: true,
          paragrafos: [
            'O carrossel mostra somente produtos **disponíveis** ou **em breve** — os que você já contratou não aparecem aqui.',
            'A vitrine **gira automaticamente a cada 3,5 segundos**; ao passar o mouse, a rotação **pausa**.',
            'Use as **setas** e as **bolinhas** para navegar manualmente. Clique no card para abrir a {{link:/university-gravity/docs/store|Gravity Store}}.',
          ],
        },
      ]),
    },
    {
      titulo: 'Insights da GABI',
      tituloSumario: 'Insights GABI',
      paragrafos: [
        'O painel **GABI AI** exibe até **três insights por página**, gerados a partir dos KPIs dos produtos ativos.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'De onde vêm os insights',
          imagem: SCREENSHOT_HUB_COM_PRODUTO,
          paragrafos: [
            'O frontend chama `GET /api/v1/hub/insights`. O backend agrega dashboards de **Pedido, BID Câmbio, BID Frete, Simula Custo, LPCO e NF Importação**: Somente produtos com assinatura ativa e acesso do usuário.',
            'Cada insight recebe **score** ponderado pelo **papel** (`tipo_usuario`). O motor mistura ~**90% alertas operacionais** e ~**10% dicas de plataforma** (mínimo 4, máximo 12 cards). Cache **5 min** por organização+usuário.',
          ],
        },
        {
          titulo: 'Rotação e navegação',
          paragrafos: [
            '**3 insights por página**: Auto-avanço **a cada 5 segundos**; pausa com o mouse sobre o painel.',
            'Badge **AO VIVO** (ponto verde). Setas ◀ ▶ e bolinhas trocam a página.',
          ],
        },
        {
          titulo: 'Anatomia de cada card',
          paragrafos: [
            '**Tag**: Origem (ex.: “PEDIDO · Atrasos”). Ícone foguete (default) ou aviso (warn).',
            '**Variante default**: Destaque índigo; **warn**: Destaque âmbar para pendências.',
            '**Texto**: Achado objetivo. **Stat** opcional no rodapé. **Link** abre o produto quando há `rota`.',
          ],
        },
      ]),
    },
  ],
}
