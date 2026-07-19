import type { DocFluxo, DocGaleriaTela, DocPassoVisual, DocSecao } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const LINK_MANUAL_HUB = '{{link:/university-gravity/docs/hub|Hub}}'
const LINK_MANUAL_HUB_ACESSO_STORE = '{{link:/university-gravity/docs/hub#doc-sec-5|acessar a Gravity Store pelo Hub}}'
const LINK_MANUAL_ASSINATURAS = '{{link:/university-gravity/docs/configurador/assinaturas|Assinaturas}}'
const LINK_MANUAL_ASSINATURAS_CANCELAR =
  '{{link:/university-gravity/docs/configurador/assinaturas#doc-sec-6|Cancelar assinatura}}'

/** SSOT: Drive `4. Store` → `public/university/screenshots/store-*.png` */
const SCREENSHOT_STORE_PRIMEIRO_ACESSO = '/university/screenshots/store-primeiro-acesso.png'
const SCREENSHOT_STORE_MENU_SEGMENTADO = '/university/screenshots/store-menu-segmentado-todos.png'
const SCREENSHOT_STORE_CARDS = '/university/screenshots/store-cards-catalogo.png'
const SCREENSHOT_STORE_ATIVOS_LINHA = '/university/screenshots/store-ativos-em-linha.png'
const SCREENSHOT_STORE_EM_BREVE_LINHA = '/university/screenshots/store-em-breve-em-linha.png'
const SCREENSHOT_STORE_TODOS_LINHA = '/university/screenshots/store-todos-em-linha.png'
const SCREENSHOT_STORE_PRODUTOS_CONTRATADOS = '/university/screenshots/store-produtos-contratados.png'
const SCREENSHOT_STORE_PRODUTOS_NAO_CONTRATADOS = '/university/screenshots/store-produtos-nao-contratados.png'
const SCREENSHOT_STORE_PRODUTOS_ASSINADOS = '/university/screenshots/store-produtos-assinados.png'
const SCREENSHOT_STORE_ASSINAR_SETA = '/university/screenshots/store-assinar-produto-seta.png'
const SCREENSHOT_STORE_ASSINAR_ASSINADO = '/university/screenshots/store-assinar-produto-assinado.png'
const SCREENSHOT_STORE_ACESSO_ATALHO = '/university/screenshots/store-acesso-atalho.png'
const SCREENSHOT_HUB_ACESSO_STORE_123 = '/university/screenshots/hub-acesso-gravity-store-numeros-1-2-3.png'

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

const FLUXO_ACESSO_GRAVITY_STORE_GUIA: DocFluxo = {
  titulo: 'Como acessar a Gravity Store',
  tituloSumario: 'Como acessar a Gravity Store',
  passosVisuais: renumerarPassos([
    {
      rotuloPasso: 'Caminhos para Gravity Store via Hub',
      ocultarTituloPasso: true,
      titulo: 'Caminhos para Gravity Store via Hub',
      paragrafos: [
        'A Gravity Store é o catálogo de produtos Gravity. No Hub existem **três caminhos** principais até ela.',
        '1. **Botão “Ir para Gravity Store”**: aparece **apenas no primeiro acesso** ou enquanto a organização **não tiver nenhum Produto Gravity contratado**, como indicado pelo **1** na imagem.',
        '2. **Link “Gravity Store” (2 na imagem)** no cabeçalho de **Seus Produtos Gravity**. Este atalho fica **disponível de forma permanente**.',
        '3. **Painel Gravity Store** na faixa inferior (card em carrossel; ver seção **Vitrine Store**), **3** na imagem.',
        '4. **Menu do usuário**: de **qualquer tela** da plataforma, clique no **ícone do usuário** (canto superior direito) e escolha *_Ir para Gravity Store_*.',
      ],
      figurasAposParagrafo: [
        {
          indice: 3,
          imagem: SCREENSHOT_HUB_ACESSO_STORE_123,
          legenda: 'Caminhos 1, 2 e 3 na tela do Hub',
        },
        {
          indice: 4,
          imagem: SCREENSHOT_STORE_ACESSO_ATALHO,
          legenda: 'Menu do usuário: Ir para Gravity Store',
        },
      ],
    },
  ]),
}

const STORE_GALERIA_LINHAS_CATALOGO: DocGaleriaTela[] = [
  { legenda: 'Ativos', imagem: SCREENSHOT_STORE_ATIVOS_LINHA },
  { legenda: 'Em breve', imagem: SCREENSHOT_STORE_EM_BREVE_LINHA },
  { legenda: 'Todos', imagem: SCREENSHOT_STORE_TODOS_LINHA },
]

export const DOC_STORE_SUBTITULO =
  'Catálogo, contratação, filtros e status dos produtos'

export const DOC_STORE_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '1.0' },
  { rotulo: 'Atualizado em', valor: 'junho 2026' },
  { rotulo: 'Produto', valor: 'Gravity Store' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/store', href: true },
]

export const DOC_STORE_SECAO: DocSecao = {
  num: 1,
  titulo: 'Gravity Store',
  tituloTopico: 'O que é Gravity Store',
  paragrafos: [
    'A **Gravity Store** é o local para **contratar Produtos Gravity** (Pedido, Smart Docs e BID Frete). Após a assinatura, o produto aparece no ' + LINK_MANUAL_HUB + ' e pode ser habilitado por workspace.',
  ],
  imagem: SCREENSHOT_STORE_PRIMEIRO_ACESSO,
  layoutTextoImagemLateral: true,
  calloutAposParagrafo: {
    indice: 0,
    callout: {
      tipo: 'lembrete',
      texto: 'Somente **Master**, **Super Admin** e **Admin** da organização podem clicar em **Assinar**. Demais patentes visualizam o catálogo, mas o botão fica desabilitado.',
    },
  },
  fluxos: [
    FLUXO_ACESSO_GRAVITY_STORE_GUIA,
    {
      titulo: 'Buscar e filtrar',
      tituloSumario: 'Buscar e filtrar',
      paragrafos: [
        'Use a barra de ferramentas para localizar produtos e alternar entre visões do catálogo.',
      ],
      passosVisuais: renumerarPassos([
        {
          rotuloPasso: 'Menu segmentado',
          ocultarTituloPasso: true,
          titulo: 'Menu segmentado',
          imagem: SCREENSHOT_STORE_MENU_SEGMENTADO,
          imagemAbaixoTexto: true,
          paragrafos: [
            '**Buscar** filtra por nome ou descrição. O menu *_Todos · Ativo · Assinar · Em breve_* rola até a linha correspondente e destaca a aba ativa conforme você navega.',
            'Os chips de **categoria** (Comercial, Importação, Frete, Câmbio…) refinam a lista sem mudar de linha.',
          ],
        },
        {
          rotuloPasso: 'Cards do catálogo',
          ocultarTituloPasso: true,
          titulo: 'Cards do catálogo',
          imagem: SCREENSHOT_STORE_CARDS,
          imagemAbaixoTexto: true,
          paragrafos: [],
        },
      ]),
    },
    {
      titulo: 'Linhas do catálogo',
      tituloSumario: 'Linhas do catálogo',
      paragrafos: [
        'O catálogo é organizado em **quatro faixas** que podem coexistir na mesma página: **Assinar**, **Ativos**, **Em breve** e **Todos**.',
      ],
      passosVisuais: renumerarPassos([
        {
          rotuloPasso: 'Visões',
          ocultarTituloPasso: true,
          titulo: 'Visões',
          galeriaTelas: STORE_GALERIA_LINHAS_CATALOGO,
          paragrafos: [
            '**Ativos** reúne o que já está contratado. **Em breve** antecipa lançamentos sem botão de compra. **Todos** mostra o catálogo completo após busca e categoria.',
          ],
        },
      ]),
    },
    {
      titulo: 'Status dos produtos',
      tituloSumario: 'Status dos produtos',
      modoCenarios: true,
      paragrafos: [
        'O mesmo catálogo muda de apresentação conforme o vínculo da organização com cada Produto Gravity.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Já contratados',
          imagem: SCREENSHOT_STORE_PRODUTOS_CONTRATADOS,
          paragrafos: [
            'Produtos com assinatura **ativa** aparecem na linha **Ativos** e no puzzle iluminado.',
          ],
        },
        {
          titulo: 'Disponíveis para assinar',
          imagem: SCREENSHOT_STORE_PRODUTOS_NAO_CONTRATADOS,
          paragrafos: [
            'Produtos **Disponíveis** ficam na linha **Assinar**, com botão habilitado para quem tem permissão de compra.',
          ],
        },
        {
          titulo: 'Assinatura confirmada',
          imagem: SCREENSHOT_STORE_PRODUTOS_ASSINADOS,
          paragrafos: [
            'Após clicar em **Assinar**, o card atualiza o status e o produto passa a contar nos indicadores de contratados.',
          ],
        },
      ]),
    },
    {
      titulo: 'Contratar um produto',
      tituloSumario: 'Contratar um produto',
      paragrafos: [
        `A contratação é imediata na Store. Detalhes de cobrança, workspaces e renovação ficam em ${LINK_MANUAL_ASSINATURAS} no Configurador.`,
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Clicar em Assinar',
          imagem: SCREENSHOT_STORE_ASSINAR_SETA,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Na linha **Assinar**, localize o produto desejado e clique em **Assinar** no card, como indicado pela seta na imagem.',
          ],
          callout: {
            tipo: 'dica',
            texto: `Se acabou de entrar na plataforma, ${LINK_MANUAL_HUB_ACESSO_STORE} antes de contratar o primeiro módulo.`,
          },
        },
        {
          titulo: 'Produto contratado',
          imagem: SCREENSHOT_STORE_ASSINAR_ASSINADO,
          imagemAbaixoTexto: true,
          paragrafos: [
            `O sistema confirma a assinatura, atualiza contadores e move o produto para **Ativos**. Volte ao ${LINK_MANUAL_HUB} para abrir o módulo no workspace habilitado.`,
          ],
        },
      ]),
    },
    {
      titulo: 'Cancelar produto',
      tituloSumario: 'Cancelar produto',
      paragrafos: [
        'A **Gravity Store** é o local para **contratar** Produtos Gravity. O **cancelamento** não é feito nesta tela.',
        `Para encerrar uma assinatura, acesse ${LINK_MANUAL_ASSINATURAS_CANCELAR}.`,
      ],
      callout: {
        tipo: 'lembrete',
        texto: 'Somente usuários **Master** podem cancelar assinaturas. **Suspender** (bloqueio temporário) também é feito em Assinaturas, não na Store.',
      },
    },
  ],
}
