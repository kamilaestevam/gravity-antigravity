import type { DocPassoVisual, DocSecao } from './manual-configurador-conteudo'
import { PASSOS_MANUAL_BID_FRETE_CONFIGURACOES } from './manual-bid-frete-configuracoes-conteudo'
import { GALERIAS_BID_FRETE_NOVA_COTACAO_MANUAL } from './manual-bid-frete-nova-cotacao-manual-conteudo'
import { screenshotBidFreteInt } from './manual-bid-frete-catalogo-screenshots'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const S = screenshotBidFreteInt

const LINK_MANUAL_HUB = '{{link:/university-gravity/docs/hub|Hub}}'
const LINK_MANUAL_HUB_PRODUTOS =
  '{{link:/university-gravity/docs/hub#doc-sec-3|Seus Produtos Gravity}}'
const LINK_MANUAL_GRAVITY_STORE_CONTRATADO =
  '{{link:/university-gravity/docs/store|contratado}}'
const LINK_MANUAL_BID_FRETE_CONFIGURACOES =
  '{{link:/university-gravity/docs/bid-frete#doc-sec-6|Configurações}}'

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const DOC_BID_FRETE_SUBTITULO =
  'Cotações de frete internacional — Insights, Lista, nova cotação manual e comparativo de propostas'

export const DOC_BID_FRETE_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '0.1' },
  { rotulo: 'Atualizado em', valor: 'julho 2026' },
  { rotulo: 'Produto', valor: 'BID Frete Internacional' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/bid-frete-internacional', href: true },
]

export const DOC_BID_FRETE_SECAO: DocSecao = {
  num: 1,
  titulo: 'Visão geral',
  paragrafos: [
    'O **BID Frete Internacional** é o produto Gravity para **cotação**, **comparativo** e **gestão de propostas** de frete no comércio exterior, do pedido de cotação ao fechamento com fornecedores.',
    'A gestão pode ser feita em **Insights** (KPIs e cockpit) e **Lista** (tabela operacional com painéis, filtros e ações em lote).',
  ],
  galeriaComparacaoAposParagrafo: [
    {
      indice: 1,
      colunas: 2,
      telas: [
        { legenda: 'Insights', imagem: S('insight_1') },
        { legenda: 'Lista', imagem: S('lista') },
      ],
    },
  ],
  fluxos: [
    {
      titulo: 'Como acessar o produto',
      tituloSumario: 'Como acessar o produto',
      modoCenarios: true,
      cenariosLadoALado: true,
      cenariosImagensAlinhadas: true,
      paragrafos: [
        'Com o **BID Frete** ' +
          LINK_MANUAL_GRAVITY_STORE_CONTRATADO +
          ' e habilitado no workspace, abra pelo **Hub** ou pelo **menu lateral**.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Via Hub',
          paragrafos: [
            'No ' + LINK_MANUAL_HUB + ', na seção ' + LINK_MANUAL_HUB_PRODUTOS + ', clique no ícone **BID Frete**.',
          ],
          imagem: S('acesso_via_hub'),
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Menu lateral — acesso rápido',
          paragrafos: [
            'Já em outro **Produto Gravity**, abra o **seletor de produtos** no topo do menu lateral e escolha **BID Frete Internacional**.',
          ],
          imagem: S('acesso_via_menu_lateral'),
          imagemAbaixoTexto: true,
        },
      ]),
    },
    {
      titulo: 'Insights',
      tituloSumario: 'Insights',
      prefixoPassosVisuais: 'Insights',
      ancoraPassosPrefix: 'insights',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'A aba **Insights** é o **cockpit gráfico**: **KPIs**, gráficos, funil, câmbio e indicadores de cotações (cards configuráveis em ' +
          LINK_MANUAL_BID_FRETE_CONFIGURACOES +
          ').',
        'Na mesma tela, o **mapa global** permite **visualizar rotas**, **consultar cotações** nos pins e abrir o detalhe ao clicar. Pelo botão **+ Nova** (canto superior direito) você inicia **cotação avulsa** ou **BID**.',
        'O print e o mapa das métricas abaixo resumem os blocos da tela; os subtópicos detalham **tooltips dos KPIs**, **mapa global** e painel **Refinar mapa**.',
      ],
      figurasAposParagrafo: [
        {
          indice: 0,
          imagem: S('insight_1'),
          legenda: 'Tela Insights',
        },
      ],
      mostrarInfograficoBidFreteInsights: true,
      passosVisuais: renumerarPassos([
        {
          titulo: 'Tooltips dos KPIs',
          tituloCurto: 'Tooltips KPIs',
          paragrafos: [
            'Passe o mouse sobre os cards **Aguardando aprovação**, **Aguardando resposta** e **Tempo médio de resposta** para abrir tooltips com **volume**, **contagem por modal** e **lista de cotações** (drill-down para a Lista).',
          ],
          calloutAposParagrafo: {
            indice: 0,
            callout: {
              tipo: 'dica',
              texto:
                '**Aguardando aprovação** exibe as cotações que aguardam **autorização de quem solicitou**: volume em aberto, quantidade e IDs das cotações pendentes.',
            },
          },
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: S('insight_tooltip_1_seta'),
                  paragrafoAntes: '**01.** Passe o mouse para ver as cotações aguardando aprovação de quem solicitou. Através do link pode acessar direto a cotação',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_1_tela'),
                  paragrafoAntes: '**02.** Analise e clique em **Aprovar cotação**',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_2_seta'),
                  paragrafoAntes: '**03.** Passe o mouse para ver todas as cotações enviadas e não respondidas. Através do link pode acessar direto a cotação',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_2_tela'),
                  paragrafoAntes: '**04.** Detalhes completos da cotação — status, solicitações, rota e carga',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_3'),
                  paragrafoAntes: '**05.** Tempo médio de resposta — SLA e aprovações no prazo',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Mapa — rotas e cotações',
          tituloCurto: 'Mapa e rotas',
          paragrafos: [
            'O **mapa global** exibe pins e rotas operacionais do escopo. Clique em uma **rota** ou pin para abrir o modal com **cotações vinculadas** e detalhes da melhor proposta.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: S('insight_mapa_seta'),
                  paragrafoAntes: '**01.** Selecionar rota no mapa',
                },
                {
                  legenda: '',
                  imagem: S('insight_mapa_acesso_cotacoes_1'),
                  paragrafoAntes: '**02.** Modal de cotações — visão geral',
                },
                {
                  legenda: '',
                  imagem: S('insight_mapa_acesso_cotacoes_2'),
                  paragrafoAntes: '**03.** Modal — detalhe da cotação',
                },
                {
                  legenda: '',
                  imagem: S('insight_mapa_acesso_cotacoes_3'),
                  paragrafoAntes: '**04.** Modal — lista e ações',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Refinar mapa — painel',
          tituloCurto: 'Painel Refinar',
          paragrafos: [
            'O painel lateral **Refinar mapa** concentra filtros e atalhos. Use o botão no topo para **expandir** ou **recolher**; quando recolhido, ícones compactos mantêm acesso rápido aos filtros.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa'),
                  paragrafoAntes: '**01.** Painel Refinar mapa — visão geral',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_expandir_menu'),
                  paragrafoAntes: '**02.** Expandir painel Refinar mapa',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_recolher_menu'),
                  paragrafoAntes: '**03.** Recolher — rail compacto de ícones',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_botoes'),
                  paragrafoAntes: '**04.** Visão geral dos botões de filtro',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Refinar mapa — filtros',
          tituloCurto: 'Filtros do mapa',
          paragrafos: [
            'Cada acordeão do painel (**Operação**, **Modal**, **Origem**, **Destino**, **Status**) abre opções de filtro; ao aplicar, o mapa recalcula pins e rotas visíveis.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_botoes_operacoes'),
                  paragrafoAntes: '**01.** Filtro Operação — opções',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_botoes_operacoes_resultado'),
                  paragrafoAntes: '**02.** Operação — mapa filtrado',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_botoes_status'),
                  paragrafoAntes: '**03.** Filtro Status',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_botoes_origem'),
                  paragrafoAntes: '**04.** Filtro Origem — opções',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_botoes_origem_resultado'),
                  paragrafoAntes: '**05.** Origem — mapa filtrado',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_botoes_destino_resultado'),
                  paragrafoAntes: '**06.** Destino — mapa filtrado',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_botoes_modal'),
                  paragrafoAntes: '**07.** Filtro Modal — opções',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_botoes_modal_resultado'),
                  paragrafoAntes: '**08.** Modal — mapa filtrado',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Controles do mapa',
          tituloCurto: 'Controles',
          paragrafos: [
            'Na barra superior do mapa, alterne **globo** e **mapa plano**, aplique **zoom**, **restaure** a vista padrão e **oculte ou exiba** linhas de rota.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_globo'),
                  paragrafoAntes: '**01.** Vista globo',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_globo_mapa'),
                  paragrafoAntes: '**02.** Vista mapa plano',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_zoom_in_1'),
                  paragrafoAntes: '**03.** Zoom in — passo 1',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_zoom_in_2'),
                  paragrafoAntes: '**04.** Zoom in — passo 2',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_zoom_out_1'),
                  paragrafoAntes: '**05.** Zoom out — passo 1',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_zoom_out_2'),
                  paragrafoAntes: '**06.** Zoom out — passo 2',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_restaurar_mapa'),
                  paragrafoAntes: '**07.** Restaurar mapa',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_ocultar_exibir_linha'),
                  paragrafoAntes: '**08.** Ocultar linhas de rota',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_ocultar_exibir_linha_resultado'),
                  paragrafoAntes: '**09.** Exibir linhas de rota',
                },
              ],
            },
          ],
        },
      ]),
    },
    {
      titulo: 'Lista',
      tituloSumario: 'Lista',
      prefixoPassosVisuais: 'Lista',
      ancoraPassosPrefix: 'lista',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'A **Lista** concentra cotações e BIDs do workspace: **localizar**, **tooltips** de colunas, **painéis** salvos, **Nova cotação** e acompanhamento do processo até o envio aos fornecedores.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Visão geral da Lista',
          tituloCurto: 'Visão geral',
          paragrafos: [
            'Tabela com colunas customizáveis, chips de filtro e barra de ações (**Nova cotação**, painéis, exportar e ações em lote).',
          ],
          imagem: S('lista'),
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Localizar',
          tituloCurto: 'Localizar',
          paragrafos: [
            'Use **Localizar** para buscar cotações por número, status, fornecedor ou qualquer coluna visível — o foco permanece na linha encontrada.',
          ],
          imagem: S('lista_localizar'),
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Tooltips das colunas',
          tituloCurto: 'Tooltips',
          paragrafos: [
            'Passe o mouse sobre cabeçalhos e células para ver **definições** e **regras de negócio** de cada campo — paridade com Pedido e Smart Docs.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 3,
              textoAcimaEstiloCorpo: true,
              telas: [
                { legenda: '', imagem: S('lista_tooltip_1') },
                { legenda: '', imagem: S('lista_tooltip_2') },
                { legenda: '', imagem: S('lista_tooltip_3') },
              ],
            },
          ],
        },
        {
          titulo: 'Painéis',
          tituloCurto: 'Painéis',
          paragrafos: [
            'Crie **abas** com filtros e colunas próprios — cada painel guarda um recorte operacional (ex.: **Abertas + Marítimo**, **Vencendo hoje**).',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: S('lista_paineis'),
                  paragrafoAntes: '**01.** Faixa de **painéis** abaixo da barra de busca',
                },
                {
                  legenda: '',
                  imagem: S('lista_paineis_NOVO_1'),
                  paragrafoAntes: '**02.** Criar **novo painel** — passo 1',
                },
                {
                  legenda: '',
                  imagem: S('lista_paineis_NOVO_2'),
                  paragrafoAntes: '**03.** Novo painel — passo 2',
                },
                {
                  legenda: '',
                  imagem: S('lista_paineis_NOVO_3'),
                  paragrafoAntes: '**04.** Novo painel — passo 3',
                },
              ],
            },
            {
              indice: 0,
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: S('lista_paineis_editar_1'),
                  paragrafoAntes: '**05.** **Editar** painel — filtros e colunas',
                },
                {
                  legenda: '',
                  imagem: S('lista_paineis_editar_2'),
                  paragrafoAntes: '**06.** Edição de painel — detalhe',
                },
              ],
            },
          ],
          callout: {
            tipo: 'dica',
            texto:
              'Filtros ficam **salvos no painel ativo** — ao trocar de aba, cada painel traz seu conjunto de chips.',
          },
        },
        {
          titulo: 'Nova cotação avulsa manual',
          tituloCurto: 'Nova cotação manual',
          paragrafos: [
            'O wizard **Cotação avulsa manual** guia do **número da cotação** ao **disparo aos fornecedores**. Há **passos comuns** (cabeçalho, cubagem, envio) e **ramos** conforme **modal de transporte** (Marítimo, Aéreo, Rodoviário) e **tipo de carga** (**FCL**, **LCL**, **Aéreo/LCL/Rodo**).',
            'A estrutura abaixo segue o mesmo padrão do **Transferir** no manual do Pedido: trilha compartilhada até a bifurcação, depois **passo a passo** por ramo.',
          ],
          mostrarInfograficoBidFreteNovaCotacaoFluxo: true,
          bidFreteNovaCotacaoInfograficoAposParagrafo: 1,
          galeriaComparacaoAposParagrafo: GALERIAS_BID_FRETE_NOVA_COTACAO_MANUAL,
        },
      ]),
    },
    {
      titulo: 'Configurações',
      tituloSumario: 'Configurações',
      prefixoPassosVisuais: 'Configurações',
      ancoraPassosPrefix: 'configuracoes',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'No menu lateral, **Configurações** reúne status, numeração, taxa de câmbio, colunas, cards de Insights e Kanban.',
      ],
      passosVisuais: PASSOS_MANUAL_BID_FRETE_CONFIGURACOES,
    },
  ],
}
