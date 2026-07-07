import type { DocPassoVisual, DocSecao } from './manual-configurador-conteudo'
import { PASSOS_MANUAL_BID_FRETE_CONFIGURACOES } from './manual-bid-frete-configuracoes-conteudo'
import { GALERIAS_BID_FRETE_NOVA_COTACAO_MANUAL } from './manual-bid-frete-nova-cotacao-manual-conteudo'
import { screenshotBidFreteInt } from './manual-bid-frete-catalogo-screenshots'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const S = screenshotBidFreteInt

const LINK_MANUAL_HUB = '{{link:/university-gravity/docs/hub|Hub}}'
const LINK_MANUAL_HUB_PRODUTOS =
  '{{link:/university-gravity/docs/hub#doc-sec-3|Seus Produtos Gravity}}'
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
      paragrafos: [
        'Com o **BID Frete** contratado e habilitado no workspace, abra pelo **Hub** ou pelo **menu lateral**.',
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
        'A aba **Insights** reúne **KPIs**, gráficos, funil, câmbio e o **mapa global** de cotações (cards em ' +
          LINK_MANUAL_BID_FRETE_CONFIGURACOES +
          ').',
        'Consulte **rotas** e pins no mapa, abra o detalhe ao clicar e use **+ Nova** para cotação avulsa ou **BID**.',
        'O mapa das métricas abaixo resume os **10 blocos** da tela; os subtópicos detalham **tooltips**, **mapa** e **Refinar mapa**.',
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
          titulo: 'Mapa',
          tituloCurto: 'Mapa',
          paragrafos: [
            'O **mapa global** é o **hub de cotações** do escopo: além de visualizar **rotas** e **pins**, você **acessa**, **consulta** e **age** sobre propostas direto na tela **Insights** — sem trocar de aba.',
          ],
          mostrarInfograficoBidFreteMapa: true,
          galeriaTelasAposTabela: [
            {
              legenda: '01 · Selecionar rota no mapa',
              pilaresMapaBidFrete: ['01'],
              imagem: S('insight_mapa_seta'),
              paragrafoAntes:
                'Clique em uma **rota** ou **pin** no mapa global para focalizar o trecho operacional e abrir o fluxo de cotações vinculadas.',
            },
            {
              legenda: '02 · Modal de cotações — visão geral',
              pilaresMapaBidFrete: ['02'],
              imagem: S('insight_mapa_acesso_cotacoes_1'),
              paragrafoAntes:
                'O modal lista todas as **cotações vinculadas** à rota selecionada, com status, melhor proposta e atalhos para o detalhe.',
            },
            {
              legenda: '03 · Detalhe da cotação no modal',
              pilaresMapaBidFrete: ['03'],
              imagem: S('insight_mapa_acesso_cotacoes_2'),
              paragrafoAntes:
                'Expanda uma proposta para ver **rota**, **carga**, **valores** e o comparativo da melhor oferta sem sair da tela **Insights**.',
            },
            {
              legenda: '04 · Lista e ações no modal',
              pilaresMapaBidFrete: ['04'],
              imagem: S('insight_mapa_acesso_cotacoes_3'),
              paragrafoAntes:
                'Na lista do modal, **aprove**, **recuse** ou **navegue** para a cotação completa — as ações refletem o status configurado do workspace.',
            },
          ],
        },
        {
          titulo: 'Refinar mapa — filtros',
          tituloCurto: 'Filtros do Mapa',
          paragrafos: [
            'O painel **Refinar mapa** é onde você **explora e combina** as opções do escopo, como **importação**, **exportação**, **modal**, **origem**, **destino**, **status** e demais critérios configurados. Cada filtro recalcula pins e rotas; o hub de cotações no mapa reflete só o que importa para sua análise.',
          ],
          mostrarInfograficoBidFreteFiltrosMapa: true,
          galeriaTelasAposTabela: [
            {
              legenda: 'Tipo de Operação',
              pilaresFiltrosMapaBidFrete: ['01'],
              imagensCompostas: [
                {
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_operacoes'),
                      paragrafoAntes: 'Selecione o **tipo de operação**',
                    },
                    {
                      imagem: S('insight_menu_mapa_botoes_operacoes_resultado'),
                      paragrafoAntes: 'O **mapa** irá exibir a seleção',
                    },
                  ],
                },
              ],
              calloutDepois: {
                tipo: 'dica',
                texto:
                  'Como padrão, o mapa vem com **Importação** e **Exportação** selecionadas. Ajuste a seleção para refinar o escopo.',
              },
            },
            {
              legenda: 'Modal',
              pilaresFiltrosMapaBidFrete: ['02'],
              imagensCompostas: [
                {
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_modal'),
                      paragrafoAntes: 'Escolha entre **um**, **dois** ou **todos** os modais',
                    },
                    {
                      imagem: S('insight_menu_mapa_botoes_modal_resultado'),
                      paragrafoAntes: 'Mapa exibe os **modais** selecionados',
                    },
                  ],
                },
              ],
            },
            {
              legenda: 'Origem',
              pilaresFiltrosMapaBidFrete: ['03'],
              imagensCompostas: [
                {
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_origem'),
                      paragrafoAntes: 'Expanda **Origem** e selecione o terminal ou região de partida',
                    },
                    {
                      imagem: S('insight_menu_mapa_botoes_origem_resultado'),
                      paragrafoAntes: 'Mapa exibe a **origem** selecionada',
                    },
                  ],
                },
              ],
            },
            {
              legenda: 'Destino',
              pilaresFiltrosMapaBidFrete: ['04'],
              paragrafoAntes:
                'Expanda **Destino** e selecione o terminal ou região de chegada. Os filtros anteriores (**Tipo de Operação**, **Modal** e **Origem**) permanecem ativos; o mapa refina as rotas com base na combinação.',
              imagem: S('insight_menu_mapa_botoes_destino_resultado'),
            },
            {
              legenda: 'Status da cotação',
              pilaresFiltrosMapaBidFrete: ['05'],
              paragrafoAntes:
                'Em **Status**, marque os status configurados do workspace. O mapa limita pins e rotas às cotações nesses estágios.',
              imagem: S('insight_menu_mapa_botoes_status'),
            },
          ],
          calloutAposGaleriaTabela: {
            tipo: 'dica',
            texto:
              'Os filtros são **cumulativos**: combinar **Tipo de Operação** + **Origem**, por exemplo, estreita o hub antes de acessar as cotações no mapa. Desmarque as opções no acordeão para restaurar a visão completa.',
          },
        },
        {
          titulo: 'Tooltips dos KPIs',
          tituloCurto: 'Tooltips KPIs',
          paragrafos: [
            'Nos tooltips da tela **Insights**, passe o mouse sobre **Aguardando aprovação**, **Aguardando resposta** e **Tempo médio de resposta** para ver volume, modais e lista de cotações. Pelo **link** de cada item, acesse a cotação direto.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: S('insight_tooltip_1_seta'),
                  paragrafoAntes: '**Aguardando aprovação**: passe o mouse para ver as cotações pendentes; pelo **link**, acesse direto a cotação',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_1_tela'),
                  paragrafoAntes: '**Aprovar cotação**: acesso direto via **link** anterior',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_2_seta'),
                  paragrafoAntes: '**Aguardando resposta**: passe o mouse para ver cotações enviadas e não respondidas; pelo **link**, acesse direto a cotação',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_2_tela'),
                  paragrafoAntes: '**Detalhes da cotação** — status, solicitações, rota e carga',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_3'),
                  paragrafoAntes: '**Tempo médio de resposta** — SLA e aprovações no prazo',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Refinar mapa — painel',
          tituloCurto: 'Painel Refinar',
          paragrafos: [
            'Os **ícones indicados** no print abaixo **expandem** ou **recolhem** o painel **Refinar mapa**; no rail compacto, cada atalho abre o filtro correspondente.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa'),
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
          mostrarInfograficoBidFreteControlesMapa: true,
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_globo'),
                  paragrafoAntes: '**Vista globo**',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_globo_mapa'),
                  paragrafoAntes: '**Vista mapa plano**',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_zoom_in_1'),
                  paragrafoAntes: '**Zoom in** — primeiro clique',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_zoom_in_2'),
                  paragrafoAntes: '**Zoom in** — segundo clique',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_zoom_out_1'),
                  paragrafoAntes: '**Zoom out** — primeiro clique',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_zoom_out_2'),
                  paragrafoAntes: '**Zoom out** — segundo clique',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_restaurar_mapa'),
                  paragrafoAntes: '**Restaurar mapa**',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_ocultar_exibir_linha'),
                  paragrafoAntes: '**Ocultar linhas** de rota',
                },
                {
                  legenda: '',
                  imagem: S('insight_menu_mapa_ocultar_exibir_linha_resultado'),
                  paragrafoAntes: '**Exibir linhas** de rota',
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
                  paragrafoAntes: '**Faixa de painéis** abaixo da barra de busca',
                },
                {
                  legenda: '',
                  imagem: S('lista_paineis_NOVO_1'),
                  paragrafoAntes: '**Criar novo painel** — passo 1',
                },
                {
                  legenda: '',
                  imagem: S('lista_paineis_NOVO_2'),
                  paragrafoAntes: '**Novo painel** — passo 2',
                },
                {
                  legenda: '',
                  imagem: S('lista_paineis_NOVO_3'),
                  paragrafoAntes: '**Novo painel** — passo 3',
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
                  paragrafoAntes: '**Editar painel** — filtros e colunas',
                },
                {
                  legenda: '',
                  imagem: S('lista_paineis_editar_2'),
                  paragrafoAntes: '**Edição de painel** — detalhe',
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
