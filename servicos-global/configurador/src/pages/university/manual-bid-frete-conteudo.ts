import type { DocSecao } from './manual-configurador-conteudo'
import { renumerarPassos } from './manual-configurador-conteudo'
import { PASSOS_MANUAL_BID_FRETE_PAGAMENTO_TAXA_GRAVITY_FECHAMENTO } from './manual-bid-frete-pagamento-taxa-gravity-fechamento-conteudo'
import { PASSOS_MANUAL_BID_FRETE_CONFIGURACOES } from './manual-bid-frete-configuracoes-conteudo'
import { PASSOS_MANUAL_BID_FRETE_VISAO_FORNECEDOR } from './manual-bid-frete-visao-fornecedor-conteudo'
import {
  GALERIAS_BID_FRETE_BID_MANUAL,
  GALERIAS_BID_FRETE_NOVA_COTACAO_MANUAL_WIZARD,
  GALERIAS_BID_FRETE_NOVA_COTACAO_VISAO_GERAL,
  GALERIA_BID_FRETE_COMO_ACESSAR_VIA_INSIGHT,
  GALERIA_BID_FRETE_COMO_ACESSAR_VIA_LISTA,
} from './manual-bid-frete-nova-cotacao-manual-conteudo'
import { GALERIAS_BID_FRETE_PAINEL_COTACAO_ACESSO } from './manual-bid-frete-painel-cotacao-acesso-conteudo'
import { PASSOS_MANUAL_BID_FRETE_PAINEL_COTACAO_ABAS } from './manual-bid-frete-painel-cotacao-abas-conteudo'
import { screenshotBidFreteInt } from './manual-bid-frete-catalogo-screenshots'

const S = screenshotBidFreteInt

/** §4.02 — wizard manual da cotação avulsa (simulador Modal e Operação). */
const PASSO_COTACAO_AVULSA_MANUAL = {
  titulo: 'Cotação manual',
  tituloCurto: 'Cotação manual',
  ocultarNoSumario: true,
  rotuloPasso: 'Cotação avulsa - Manual',
  paragrafos: [
    'Clique primeiro no botão **+ Novo**, direcione para o menu **Cotação Avulsa** e finalize clicando na opção **Manual**.',
    'Neste subtópico, detalhamos exclusivamente o fluxo de criação através da opção **Manual** em **Cotação avulsa**.',
    'O fornecedor irá receber o pedido de cotação via **email**.',
    'Caso o usuário queira receber aviso via **email**, basta habilitar a função em **Configurações**.',
  ],
  galeriaComparacaoAposParagrafo: [
    ...GALERIAS_BID_FRETE_NOVA_COTACAO_MANUAL_WIZARD,
    {
      indice: 1,
      colunas: 1,
      telas: [{ legenda: '', imagem: S('solicitacao_email_fornecedor') }],
    },
    {
      indice: 2,
      colunas: 2,
      colunasGradeTemplate: '2fr 1fr',
      telas: [
        {
          legenda: '',
          imagem: S('solicitacao_aviso_envio_usuario_configuracoes'),
        },
        {
          legenda: '',
          imagem: S('solicitacao_aviso_envio_usuario_1'),
          preencherCelulaGrade: true,
          alturaMaxima: 240,
        },
      ],
      calloutApos: {
        tipo: 'dica',
        texto:
          'O usuário pode receber por **email** a cotação, como na imagem à **direita** acima.',
      },
    },
  ],
} as const

const LINK_MANUAL_HUB = '{{link:/university-gravity/docs/hub|Hub}}'
const LINK_MANUAL_BID_FRETE_CONFIGURACOES =
  '{{link:/university-gravity/academy/bid-frete/bid-frete-configuracoes|Configurações}}'

export const DOC_BID_FRETE_SUBTITULO =
  'Cotações de frete internacional: Insights, nova cotação manual, Painel da Cotação, Lista e comparativo de propostas'

export const DOC_BID_FRETE_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '0.1' },
  { rotulo: 'Atualizado em', valor: 'julho 2026' },
  { rotulo: 'Produto', valor: 'BID Frete Internacional' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/bid-frete-internacional', href: true },
]

export const DOC_BID_FRETE_SECAO: DocSecao = {
  num: 1,
  titulo: 'Visão geral',
  tituloTopico: 'O que é?',
  paragrafos: [
    'O **BID Frete Internacional** é a solução Gravity para **cotação**, **comparação** e **gestão de propostas** de frete no comércio exterior, abrangendo desde o pedido inicial até o fechamento com fornecedores.',
    'Gerencie o fluxo em **Insights** (KPIs e cockpit) e **Lista** (painéis, filtros e ações em lote).',
  ],
  galeriaComparacaoAposParagrafo: [
    {
      indice: 1,
      colunas: 1,
      textoAcimaEstiloCorpo: true,
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
            'No ' + LINK_MANUAL_HUB + ', na seção **Seus Produtos Gravity**, clique no ícone **BID Frete**.',
          ],
          imagem: S('acesso_via_hub'),
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Menu lateral: acesso rápido',
          paragrafos: [
            'A partir de qualquer outro **Produto Gravity**, clique no **seletor** localizado no topo do menu lateral e escolha a opção *_BID Frete Internacional_*.',
          ],
          imagem: S('acesso_via_menu_lateral'),
          imagemAbaixoTexto: true,
        },
      ]),
    },
    {
      titulo: 'Tipos de visualização BID Frete',
      tituloSumario: 'Tipos de visualização',
      modoCenarios: true,
      paragrafos: [
        'No topo do produto, as abas **Insights**, **Lista**, **Dashboard** e **Kanban** alternam entre **quatro visualizações** do mesmo escopo de cotações do workspace:',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Insights',
          paragrafos: [
            'Cockpit com **KPIs**, **mapa global**, **alertas**, **gráficos** e demais indicadores consolidados do workspace.',
          ],
          imagem: S('insight_1'),
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Lista',
          paragrafos: [
            'Visão de **cotações** e **lances**, **painéis**, **filtros**, **colunas customizáveis** e **exportação**.',
          ],
          imagem: S('lista'),
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Dashboard',
          paragrafos: [
            'Painel de BI **customizado** por usuário.',
          ],
          imagem: S('insight_2'),
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Kanban',
          paragrafos: [
            'Cartões organizados por **status** da cotação, com arrastar entre colunas.',
          ],
          imagem: S('insight_3'),
          imagemAbaixoTexto: true,
        },
      ]),
    },
    {
      titulo: 'Insights',
      tituloSumario: 'Insights',
      tituloTopicoAcademy: 'Mapa de métricas',
      prefixoPassosVisuais: 'Insights',
      ancoraPassosPrefix: 'insights',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'A aba **Insights** consolida a leitura operacional do workspace: **KPIs** por status, **mapa global** com **Rankings Globais**, alertas, funil, **câmbio PTAX** e gráficos. O quadro abaixo descreve os **dez indicadores** da tela. Avance nos subtópicos do menu para interagir com cada área. Personalize os cards em ' +
          LINK_MANUAL_BID_FRETE_CONFIGURACOES +
          '.',
      ],
      mostrarInfograficoBidFreteInsights: true,
      passosVisuais: renumerarPassos([
        {
          titulo: 'KPIs do topo',
          tituloCurto: 'KPIs do topo',
          paragrafos: [
            'A primeira linha da aba **Insights** exibe **três cards fixos** por status do workspace: **Aguardando aprovação**, **Aguardando resposta** e **Tempo médio de resposta**. Cada card traz **contagem**, **tendência** e **volume** na moeda do workspace. Passe o mouse para ver o resumo no **tooltip**; nos cards de aprovação e resposta, os **links** da cotação abrem o **Painel da Cotação** direto.',
          ],
          imagem: S('insight_1'),
          imagemAbaixoTexto: true,
          galeriaComparacaoAposImagem: [
            {
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: S('insight_tooltip_1_seta'),
                  paragrafoAntes:
                    '**Aguardando aprovação**: resumo de volume; no tooltip, clique no **link** da cotação para abrir o **Painel da Cotação**.',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_1_tela'),
                  paragrafoAntes:
                    '**Painel da Cotação** aberto pelo link do tooltip — ambiente para autorizar a operação.',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_2_seta'),
                  paragrafoAntes:
                    '**Aguardando resposta**: cotações pendentes nos fornecedores; no tooltip, o **link** leva ao **Painel da Cotação** da solicitação.',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_2_tela'),
                  paragrafoAntes:
                    '**Painel da Cotação** aberto pelo link do tooltip — analise propostas, status e histórico da cotação.',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_3'),
                  paragrafoAntes: '**Tempo médio de resposta**: monitore o cumprimento do **SLA** e a taxa de aprovações no prazo',
                },
              ],
              calloutApos: {
                tipo: 'dica',
                texto:
                  'Os **links** nos tooltips de **Aguardando aprovação** e **Aguardando resposta** levam ao mesmo **Painel da Cotação** acessível pelo mapa e pela **Lista**. O indicador **Tempo médio de resposta** resume o **SLA** (prazo alvo de resposta ou aprovação) sem atalho por cotação.',
              },
            },
          ],
        },
        {
          titulo: 'Mapa',
          tituloCurto: 'Mapa',
          paragrafos: [
            'É possível ter uma **visão global** das cotações em andamento no mapa da aba **Insights**. Cruze **rotas** e pins{{icone:pin-mapa-bid-frete}} no mapa, abra o **Painel da Cotação** na rota selecionada e lance cotações avulsas ou **BIDs** com {{botao:novo-bid-frete}}.',
          ],
          mostrarInfograficoBidFreteMapa: true,
          galeriaTelasAposTabela: [
            {
              legenda: 'Acesso as rotas',
              paragrafoAntes:
                'Selecione uma **rota** ou pin{{icone:pin-mapa-bid-frete}} para destacar o trecho e abrir o **Painel da Cotação**.',
              imagensCompostas: [
                {
                  figuras: [{ imagem: S('insight_mapa_seta') }],
                },
                {
                  paragrafoAntes:
                    'O tooltip resume **respostas**, **melhor preço** e saving do trecho. Clique em **Clique para ver cotações** para abrir o modal da rota.',
                  figuras: [{ imagem: S('insight_mapa_acesso_cotacoes_1') }],
                },
                {
                  paragrafoAntes:
                    'Consulte **status**, **melhor proposta** e atalhos de cada cotação vinculada à rota. Use **Abrir BID** ou **Abrir COT** para abrir o **Painel da Cotação**.',
                  figuras: [{ imagem: S('insight_mapa_acesso_cotacoes_2') }],
                },
              ],
            },
          ],
        },
        {
          titulo: 'Refinar mapa: filtros',
          tituloCurto: 'Filtros do Mapa',
          rotuloPasso: 'Filtros do Mapa',
          ocultarNoSumario: true,
          trilhaLateralContinuaAcademy: true,
          paragrafos: [
            'Combine filtros no painel **Refinar mapa** e recalcule pins e rotas em tempo real. O hub mantém apenas cotações relevantes.',
          ],
          mostrarInfograficoBidFreteFiltrosMapa: true,
          galeriaTelasAposTabela: [
            {
              legenda: 'Tipo de Operação - Filtro do Mapa',
              paragrafoAntes: 'Defina o **Tipo de Operação** desejado',
              imagensCompostas: [
                {
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_operacoes'),
                    },
                  ],
                },
                {
                  paragrafoAntes: 'O mapa destaca as rotas selecionadas em tempo real',
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_operacoes_resultado'),
                    },
                  ],
                },
              ],
              calloutDepois: {
                tipo: 'dica',
                texto:
                  'Por padrão, **Importação** e **Exportação** vêm selecionadas. Ajuste a combinação para refinar o escopo.',
              },
            },
            {
              legenda: 'Modal - Filtro do Mapa',
              paragrafoAntes: 'Combine os **modais** na sua busca',
              imagensCompostas: [
                {
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_modal'),
                    },
                  ],
                },
                {
                  paragrafoAntes: 'O mapa atualiza as operações visíveis na hora',
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_modal_resultado'),
                    },
                  ],
                },
              ],
            },
            {
              legenda: 'Origem - Filtro do Mapa',
              paragrafoAntes: 'Selecione a **origem** da busca',
              imagensCompostas: [
                {
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_origem'),
                    },
                  ],
                },
                {
                  paragrafoAntes: 'O mapa destaca os trechos correspondentes',
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_origem_resultado'),
                    },
                  ],
                },
              ],
            },
            {
              legenda: 'Destino - Filtro do Mapa',
              paragrafoAntes:
                'Selecione o **Destino** desejado. O mapa cruza essa escolha com **Tipo de Operação**, **Modal** e **Origem** e refina as rotas visíveis.',
              imagensCompostas: [
                {
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_destino_resultado'),
                    },
                  ],
                },
              ],
            },
            {
              legenda: 'Status da cotação - Filtro do Mapa',
              paragrafoAntes:
                'Marque as etapas em **Status** para afunilar a busca. O mapa exibe só cotações compatíveis com os critérios escolhidos.',
              imagensCompostas: [
                {
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_status'),
                    },
                  ],
                },
              ],
            },
          ],
          calloutAposGaleriaTabela: {
            tipo: 'dica',
            texto:
              'Lembre que os filtros são **cumulativos**. Ao cruzar critérios, você afunila o mapa em tempo real. Desmarque as seleções no menu para restaurar a visão completa.',
          },
        },
        {
          titulo: 'Controle de Exibição do Mapa',
          tituloCurto: 'Controle de Exibição do Mapa',
          rotuloPasso: 'Controle de Exibição do Mapa',
          ocultarNoSumario: true,
          trilhaLateralContinuaAcademy: true,
          paragrafos: [
            'Alterne os controles do mapa entre as visões expandida e compacta. Na versão reduzida, cada atalho abre o filtro correspondente, liberando espaço visual para a sua análise.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: S('insight_controle_exibicao'),
                },
              ],
            },
          ],
          subsecaoAposGaleriaTabela: {
            rotuloPasso: 'Controles',
            paragrafos: [
              'Gerencie a visualização do mapa por meio da barra de ferramentas. Alterne entre os modos globo e plano, aplique zoom, restaure a câmera, pause a rotação do globo e configure a exibição das rotas.',
            ],
            mostrarInfograficoBidFreteControlesMapa: true,
            galeriaTelas: [
              {
                legenda: 'Visualização em Globo',
                paragrafoAntes:
                  'Utilize o globo interativo para explorar o mapa mundial e acompanhar a distribuição geográfica das suas cotações ativas.',
                imagem: S('insight_visao_globo'),
                calloutDepois: {
                  tipo: 'dica',
                  texto:
                    'Para acessar a **visualização em globo**, abra o **mapa** na aba **Insights** e clique no ícone {{icone:globo-mapa-bid-frete}} na barra de controles.',
                },
              },
              {
                legenda: 'Vista mapa plano',
                paragrafoAntes:
                  'Utilize a visualização em **Mapa plano** para obter uma leitura direta e simultânea de todas as rotas ativas na sua tela.',
                imagem: S('insight_visao_mapa'),
                calloutDepois: {
                  tipo: 'dica',
                  texto:
                    'Para acessar a **visualização em mapa plano**, abra o **mapa** na aba **Insights** e clique no ícone {{icone:mapa-plano-bid-frete}} na barra de controles.',
                },
              },
              {
                legenda: 'Zoom in',
                paragrafoAntes:
                  'Aplique o **Zoom in** para focar em uma área restrita do mapa e inspecionar as conexões logísticas de perto.',
                imagem: S('insight_menu_mapa_zoom_in_1'),
                calloutDepois: {
                  tipo: 'dica',
                  texto:
                    'Para aplicar **Zoom in**, abra o **mapa** na aba **Insights** e clique no ícone {{icone:zoom-in-bid-frete}} na barra de controles.',
                },
              },
              {
                legenda: 'Zoom out',
                paragrafoAntes:
                  'Utilize o recurso **Zoom out** para afastar a visualização e recuperar o contexto geográfico das suas operações.',
                imagem: S('insight_menu_mapa_zoom_out_1'),
                calloutDepois: {
                  tipo: 'dica',
                  texto:
                    'Para aplicar **Zoom out**, abra o **mapa** na aba **Insights** e clique no ícone {{icone:zoom-out-bid-frete}} na barra de controles.',
                },
              },
              {
                legenda: 'Restaurar mapa',
                paragrafoAntes:
                  'Clique em **Restaurar** para redefinir o enquadramento e voltar à visão padrão de todas as suas rotas.',
                imagem: S('insight_visao_mapa_restaurar'),
                calloutDepois: {
                  tipo: 'dica',
                  texto:
                    'Para **restaurar** o enquadramento do mapa, abra o **mapa** na aba **Insights** e clique no ícone {{icone:restaurar-mapa-bid-frete}} na barra de controles.',
                },
              },
              {
                legenda: 'Ocultar linhas de rota',
                paragrafoAntes:
                  'Desative as **linhas de rota** para limpar a visualização do mapa e facilitar a leitura direta das suas localizações ativas.',
                imagem: S('insight_menu_mapa_ocultar_exibir_linha_resultado'),
                calloutDepois: {
                  tipo: 'dica',
                  texto:
                    'Para **ocultar as linhas de rota**, abra o **mapa** na aba **Insights** e clique no ícone {{icone:ocultar-linhas-bid-frete}} na barra de controles.',
                },
              },
              {
                legenda: 'Exibir linhas de rota',
                paragrafoAntes:
                  'Ative as **linhas de rota** para mapear visualmente os trajetos e analisar as conexões ativas na sua operação internacional.',
                imagem: S('insight_menu_mapa_ocultar_exibir_linha'),
                calloutDepois: {
                  tipo: 'dica',
                  texto:
                    'Para **exibir as linhas de rota**, abra o **mapa** na aba **Insights** e clique no ícone {{icone:exibir-linhas-bid-frete}} na barra de controles.',
                },
              },
              {
                legenda: 'Pausar rotação do globo',
                paragrafoAntes:
                  'Interrompa a **rotação automática** do globo para fixar a visualização e examinar rotas e terminais com mais precisão.',
                imagem: S('insight_visao_globo_pausar'),
                calloutDepois: {
                  tipo: 'dica',
                  texto:
                    'Para **pausar a rotação** do globo, abra o **mapa** na aba **Insights**, acesse a **visualização em globo** e clique no ícone {{icone:pausar-globo-bid-frete}} na barra de controles.',
                },
              },
            ],
          },
        },
        {
          titulo: 'Indicadores da grade',
          tituloCurto: 'Indicadores da grade',
          rotuloPasso: 'Indicadores da grade',
          omitirBordaLateralRotuloAcademy: true,
          paragrafos: [
            'Abaixo do bloco **mapa + Rankings**, a grade reúne **oito widgets**: alertas, funil, evolução mensal, **câmbio PTAX** e gráficos de composição. Cada card resume o escopo do workspace; clique para abrir detalhes na **Lista** quando disponível.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              layoutCardInsightGradeBidFrete: true,
              telas: [
                {
                  legenda: '03 · Alertas do dia',
                  imagem: S('insight_2'),
                  larguraMaxima: 559,
                  cardInsightGradeBidFrete: 3,
                },
                {
                  legenda: '04 · Funil por status',
                  imagem: S('insight_2'),
                  larguraMaxima: 568,
                  cardInsightGradeBidFrete: 4,
                },
                {
                  legenda: '05 · Evolução mensal',
                  imagem: S('insight_2'),
                  larguraMaxima: 686,
                  cardInsightGradeBidFrete: 5,
                },
                {
                  legenda: '06 · Distribuição por modal',
                  imagem: S('insight_2'),
                  larguraMaxima: 450,
                  cardInsightGradeBidFrete: 6,
                },
                {
                  legenda: '07 · Câmbio PTAX',
                  imagem: S('insight_2'),
                  larguraMaxima: 457,
                  cardInsightGradeBidFrete: 7,
                },
                {
                  legenda: '08 · Melhor cotação',
                  imagem: S('insight_3'),
                  larguraMaxima: 385,
                  cardInsightGradeBidFrete: 8,
                },
                {
                  legenda: '09 · Top Incoterms',
                  imagem: S('insight_3'),
                  larguraMaxima: 640,
                  cardInsightGradeBidFrete: 9,
                },
                {
                  legenda: '10 · Taxa de aprovação',
                  imagem: S('insight_3'),
                  larguraMaxima: 300,
                  cardInsightGradeBidFrete: 10,
                },
              ],
              calloutApos: {
                tipo: 'dica',
                texto:
                  'Personalize quais widgets aparecem na grade pelo menu **Widgets**: exiba, oculte e reordene os blocos conforme sua rotina.',
              },
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
        'A **Lista** concentra **cotações** e **BIDs** do workspace.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Visão geral da Lista',
          tituloCurto: 'Visão geral',
          paragrafos: [
            'Tabela com colunas customizáveis, chips de filtro e barra de ações: **Nova cotação**, painéis, exportar e ações em lote.',
          ],
          imagem: S('lista'),
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Localizar',
          tituloCurto: 'Localizar',
          paragrafos: [
            'Use **Localizar** para buscar por número, **status**, fornecedor ou coluna visível. O sistema mantém o foco na linha encontrada.',
          ],
          imagem: S('lista_localizar'),
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Tooltips das colunas',
          tituloCurto: 'Tooltips',
          rotuloPasso: 'Tooltips',
          paragrafos: [
            'Consulte **definições** e **regras de negócio** de cada coluna nos tooltips, em paridade com **Pedido** e **Smart Docs**.',
          ],
          galeriaTelasAposTabela: [
            { legenda: '', imagem: S('lista_tooltip_1') },
            { legenda: '', imagem: S('lista_tooltip_2') },
            { legenda: '', imagem: S('lista_tooltip_3') },
          ],
        },
        {
          titulo: 'Painéis',
          tituloCurto: 'Painéis',
          rotuloPasso: 'Painéis',
          paragrafos: [
            'Monte **abas** com filtros e colunas próprios. Cada painel guarda um recorte operacional (exemplo: crie o seu do jeito que quiser).',
          ],
          galeriaTelasAposTabela: [
            {
              legenda: '',
              imagem: S('lista_paineis'),
              paragrafoAntes: 'Gerencie **painéis** salvos abaixo da busca',
            },
            {
              legenda: '',
              imagem: S('lista_paineis_NOVO_1'),
              paragrafoAntes: '**Criar novo painel**: passo 1',
            },
            {
              legenda: '',
              imagem: S('lista_paineis_NOVO_2'),
              paragrafoAntes: '**Novo painel**: passo 2',
            },
            {
              legenda: '',
              imagem: S('lista_paineis_NOVO_3'),
              paragrafoAntes: '**Novo painel**: passo 3',
            },
            {
              legenda: '',
              imagem: S('lista_paineis_editar_1'),
              paragrafoAntes: '**Editar painel**: filtros e colunas',
            },
            {
              legenda: '',
              imagem: S('lista_paineis_editar_2'),
              paragrafoAntes: '**Edição de painel**: detalhe',
            },
          ],
          calloutAposGaleriaTabela: {
            tipo: 'dica',
            texto:
              'Os filtros permanecem **salvos no painel ativo**. Ao trocar de aba, cada painel restaura seus chips.',
          },
        },
        {
          titulo: 'Customizar colunas',
          tituloCurto: 'Customizar',
          rotuloPasso: 'Customizar',
          paragrafos: [
            'A **Lista** do BID Frete é **altamente customizável**: você monta a visualização ideal no menu **Colunas**, salva no **painel** ativo e o layout volta automaticamente na sua próxima visita.',
          ],
          mostrarInfograficoBidFreteListaCustomizacao: true,
          galeriaTelasAposTabela: [
            {
              legenda: '01 · Ocultar e exibir colunas nativas',
              pilaresCustomizacao: ['01', '02'],
              imagem: S('modal_coluna'),
              paragrafoAntes:
                'Abra **Colunas** na barra da tabela. **Desmarque** para **ocultar** campos de **cotação**; **marque** de volta para **exibir**.',
              calloutDepois: {
                tipo: 'dica',
                texto: 'A tabela atualiza na hora — só permanecem visíveis as colunas marcadas.',
              },
            },
            {
              legenda: '03 · Arrastar com sua preferência',
              pilaresCustomizacao: ['03'],
              simuladorBidFreteListaArrastarColunas: true,
              paragrafoAntes:
                'No mesmo menu, **arraste** os itens para definir a **ordem** das colunas na tabela.',
              calloutDepois: {
                tipo: 'dica',
                texto:
                  'Feche o menu ou clique fora quando terminar — as alterações ficam no painel ativo.',
              },
            },
            {
              legenda: '04 · Criar coluna customizada',
              pilaresCustomizacao: ['04'],
              imagensCompostas: [
                {
                  figuras: [
                    {
                      imagem: S('configuracoes_tabela'),
                      paragrafoAntes: 'No **BID Frete**, clique no menu lateral em **Configurações**',
                    },
                    {
                      imagem: S('configuracoes_colunas_formato_personalizadas'),
                      paragrafoAntes:
                        'Clique em **Colunas**, depois **Personalizadas** e **+ Criar Coluna**',
                    },
                  ],
                  paragrafoApos:
                    'Selecione o **tipo de coluna** que deseja, inclua o **nome** e clique em **Salvar**. A coluna será exibida na sua lista.',
                },
              ],
              calloutDepois: {
                tipo: 'dica',
                texto:
                  'Após salvar, a coluna aparece no menu **Colunas** da Lista para exibir e posicionar como as nativas. Detalhes em ' +
                  LINK_MANUAL_BID_FRETE_CONFIGURACOES +
                  '.',
              },
            },
          ],
          calloutAposGaleriaTabela: {
            tipo: 'dica',
            texto:
              'Preferências de coluna, ordem e painel são **por usuário** — cada pessoa salva o próprio layout sem afetar os colegas do workspace.',
          },
        },
        {
          titulo: 'Edição na tabela',
          tituloCurto: 'Edição',
          rotuloPasso: 'Edição',
          paragrafos: [
            'A **Lista** é **editável** para **cotações** respeitando as regras de cada coluna.',
            'Clique na célula editável para alterar o valor **in place**. A gravação ocorre ao confirmar (**Enter** ou sair do campo).',
          ],
          figurasAposParagrafo: [
            {
              indice: 1,
              imagem: S('lista_editar'),
              legenda: '',
              calloutApos: [
                {
                  tipo: 'dica',
                  texto:
                    'Em **BIDs agrupados**, edite cada cotação na **linha filha**; a linha pai do pacote e as linhas de **proposta** do fornecedor são **somente leitura**.',
                },
                {
                  tipo: 'dica',
                  texto:
                    'Campos **técnicos** bloqueados: **ID** e **Última atualização** (automática). **Origem** e **Destino** são rótulos derivados — edite **porto/aeroporto** conforme o **Modal** ou endereço/país/zipcode.',
                },
              ],
            },
          ],
          mostrarCatalogoColunasBidFreteLista: true,
          catalogoColunasBidFreteAposParagrafo: 1,
        },
        {
          titulo: 'Filtro das colunas',
          tituloCurto: 'Filtro das colunas',
          rotuloPasso: 'Filtro das colunas',
          paragrafos: [
            'Cada coluna expõe um **ícone de funil** no **cabeçalho**. Clique para abrir o popover: **ordenar** (crescente/decrescente), **filtrar por texto**, **marcar valores** (listas e pills) ou **intervalo numérico** (mín./máx.), conforme o tipo da coluna.',
            'Você pode **combinar** quantos filtros quiser na mesma tela — **Status** + **Modal** + **datas**, por exemplo — e o recorte fica cada vez mais específico. Salve o conjunto no **painel** ativo (veja **Painéis** acima) e reutilize depois.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 1,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '01 · Ícone de funil no cabeçalho',
                  imagem: S('lista_filtro_1'),
                  paragrafoAntes: '**Ícone de funil** no cabeçalho da coluna',
                },
                {
                  legenda: '02 · Popover: ordenar e filtrar',
                  imagem: S('lista_filtro_2'),
                  paragrafoAntes: 'Popover: **ordenar** e **filtrar**',
                },
                {
                  legenda: '03 · Combinação de filtros',
                  imagem: S('lista_filtro_4'),
                  paragrafoAntes: '**Combinação** de filtros + *_Limpar todos_*',
                },
              ],
            },
          ],
          callout: {
            tipo: 'dica',
            texto:
              'Os filtros ficam **salvos no painel ativo** — ao trocar de aba, cada painel traz seu próprio conjunto de chips. Monte recortes diferentes em painéis distintos (ex.: **Aguardando resposta + Marítimo**, **Aprovadas + Exportação**).',
          },
        },
        {
          titulo: 'Excluir',
          tituloCurto: 'Excluir',
          rotuloPasso: 'Excluir',
          paragrafos: [
            'Selecione a linha e use **Excluir** na barra de ações.',
            'O modal exibe um **preview** do que será removido e do que está bloqueado. A exclusão é **definitiva** e **não pode ser desfeita**.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 1,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '01 · Selecionar e excluir',
                  imagem: S('lista_excluir_1'),
                  paragrafoAntes: '**Selecione** a linha e clique **Excluir**',
                },
                {
                  legenda: '02 · Preview no modal',
                  imagem: S('lista_excluir_2'),
                  paragrafoAntes: '**Revise** o preview (permitidos e bloqueados) e **confirme** — ação irreversível',
                },
              ],
              calloutApos: {
                tipo: 'dica',
                texto:
                  'Após **aprovar** uma cotação, ela **não pode ser excluída** permanentemente — aparece como **bloqueada** no preview do modal.',
              },
            },
          ],
          callout: {
            tipo: 'dica',
            texto:
              'Para **BIDs agrupados**, todas as cotações filhas precisam ser excluíveis. Para **várias linhas**, marque pelo **checkbox** à esquerda e use **Excluir**.',
          },
        },
        {
          titulo: 'Exportar',
          tituloCurto: 'Exportar',
          rotuloPasso: 'Exportar',
          paragrafos: [
            'Na barra da tabela, abra o menu **Exportar** para baixar o recorte atual — respeita **filtros**, **colunas visíveis** e **página** da lista virtual, no mesmo padrão dos demais produtos Gravity.',
            'No modal, escolha um dos **formatos** permitidos abaixo:',
          ],
          mostrarFormatosExportacaoPedidoLista: true,
          formatosExportacaoPedidoAposParagrafo: 1,
          galeriaComparacaoAposParagrafo: [
            {
              indice: 1,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: S('exportar_1'),
                  paragrafoAntes: '**Escolha** o formato no modal',
                },
                {
                  legenda: '',
                  imagem: S('exportar_2'),
                  paragrafoAntes: '**Download** imediato na sua máquina',
                },
                {
                  legenda: '',
                  imagem: S('exportar_'),
                  paragrafoAntes: '**Abra** o arquivo',
                },
              ],
            },
          ],
          callout: {
            tipo: 'dica',
            texto:
              'Todos os formatos (**Excel**, **CSV**, **TXT**, **XML**, **JSON** e **PDF**) usam o **mesmo recorte** da tela — só muda a extensão do arquivo. Não é necessário aguardar processamento adicional.',
          },
        },
      ]),
    },
    {
      titulo: 'Cotação de frete internacional — O que é',
      tituloSumario: 'O que é',
      paragrafos: [
        'A **cotação de frete internacional** é o processo de **solicitar**, **receber**, **comparar e fechar** propostas de agentes de carga.',
      ],
    },
    {
      titulo: 'Cotação de frete internacional — Como acessar',
      tituloSumario: 'Como acessar',
      prefixoPassosVisuais: 'Como acessar',
      ancoraPassosPrefix: 'como-acessar-cotacao',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'No **BID Frete**, toda solicitação tem início nos botões {{botao:novo-bid-frete}} — pela aba **Insights** ou pela **Lista**.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Via Insight',
          tituloCurto: 'Via Insight',
          ocultarNoSumario: true,
          paragrafos: [
            'Clique no botão **+ novo** na aba **Insights** e siga até **Buscar Frete**.',
          ],
          galeriaComparacaoAposParagrafo: GALERIA_BID_FRETE_COMO_ACESSAR_VIA_INSIGHT,
        },
        {
          titulo: 'Via Lista',
          tituloCurto: 'Via Lista',
          ocultarNoSumario: true,
          paragrafos: [
            'Clique no botão **+ novo** na **Lista**, escolha **Nova cotação** e depois **Manual** em **Cotação avulsa** ou **BID**.',
          ],
          galeriaComparacaoAposParagrafo: GALERIA_BID_FRETE_COMO_ACESSAR_VIA_LISTA,
        },
      ]),
    },
    {
      titulo: 'Cotação de frete internacional — Tipos',
      tituloSumario: 'Tipos de cotação',
      prefixoPassosVisuais: 'Tipos de cotação',
      ancoraPassosPrefix: 'tipos-cotacao',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'No **BID Frete**, toda nova solicitação é classificada em **dois tipos**: **Cotação avulsa** (uma operação isolada) ou **BID** (conjunto de cotações em um único pacote).',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Cotação de frete internacional — Tipos',
          ocultarRotuloPasso: true,
          ocultarTituloPasso: true,
          ocultarNoSumario: true,
          mostrarInfograficoBidFreteCotacaoAvulsaVsBid: true,
          paragrafos: [],
        },
      ]),
    },
    {
      titulo: 'Cotação de frete internacional — Nova',
      tituloSumario: 'Nova cotação',
      prefixoPassosVisuais: 'Nova cotação',
      ancoraPassosPrefix: 'nova-cotacao',
      mostrarMapaSubtopicosPassos: true,
      ocultarTituloFluxoAcademy: true,
      passosVisuais: renumerarPassos([
        {
          titulo: 'Cotação avulsa',
          tituloCurto: 'Cotação avulsa',
          ocultarNoSumario: true,
          ocultarRotuloPasso: true,
          omitirBordaLateralRotuloAcademy: true,
          paragrafos: [
            'Exemplo de **cotação avulsa**, ou **cotação spot**, na **Lista** — uma solicitação, um frete, uma rota.',
          ],
          figurasAposParagrafo: [
            {
              indice: 0,
              imagem: S('lista_cotacao_avulsa'),
              legenda: 'Lista — cotação avulsa (spot) destacada na grade',
            },
          ],
        },
        {
          titulo: 'BID',
          tituloCurto: 'BID',
          ocultarNoSumario: true,
          ocultarRotuloPasso: true,
          omitirBordaLateralRotuloAcademy: true,
          paragrafos: [
            'Exemplo de **BID** — **várias cotações** vinculadas a um único **BID**. Usado em negociações de **médio** e **longo prazo** com fornecedores.',
          ],
          figurasAposParagrafo: [
            {
              indice: 0,
              imagem: S('lista_cotacao_bid'),
              legenda: 'Lista — BID com cotações vinculadas destacado na grade',
            },
          ],
        },
        {
          titulo: 'Nova cotação',
          tituloCurto: 'Nova cotação',
          estiloTituloWizard: true,
          paragrafos: [
            'É possível criar cotações na plataforma de **quatro formas**: **Manual**, **Smart Docs**, **planilha** e **API**.',
          ],
          mostrarInfograficoBidFreteCotacaoAvulsaFormas: true,
        },
        PASSO_COTACAO_AVULSA_MANUAL,
        {
          titulo: 'Cotação avulsa via Smart Docs',
          tituloCurto: 'Via Smart Docs',
          ocultarNoSumario: true,
          rotuloPasso: 'Cotação avulsa - Via Smart Doc',
          paragrafos: [
            'A **IA** extrai dados do documento comercial e pré-preenche a **cotação avulsa**. Recurso **em breve** no produto.',
          ],
          badgeEmDesenvolvimento: true,
        },
        {
          titulo: 'BID manual',
          tituloCurto: 'BID manual',
          ocultarNoSumario: true,
          rotuloPasso: 'BID',
          paragrafos: [
            'Neste subtópico, detalhamos exclusivamente o fluxo de criação através da opção **Manual** em **BID**.',
          ],
          galeriaComparacaoAposParagrafo: GALERIAS_BID_FRETE_BID_MANUAL,
        },
        {
          titulo: 'BID via planilha',
          tituloCurto: 'Via planilha',
          ocultarNoSumario: true,
          paragrafos: [
            'Importe **Excel**, **CSV** ou **XML** para gerar o **BID**. Recurso **em breve** no produto.',
          ],
          badgeEmDesenvolvimento: true,
        },
        {
          titulo: 'BID via Smart Docs',
          tituloCurto: 'Via Smart Docs',
          ocultarNoSumario: true,
          paragrafos: [
            'A **IA** extrai dados do documento comercial e pré-preenche o **BID**. Recurso **em breve**.',
          ],
          badgeEmDesenvolvimento: true,
        },
        {
          titulo: 'BID por API',
          tituloCurto: 'Por API',
          ocultarNoSumario: true,
          paragrafos: [
            'Integre via **API Cockpit** ou **ERP** para criar **BIDs**. Recurso **em breve**.',
          ],
          badgeEmDesenvolvimento: true,
        },
      ]),
    },
    {
      titulo: 'Cotação de frete internacional — Painel',
      tituloSumario: 'Painel da cotação',
      prefixoPassosVisuais: 'Painel da cotação',
      ancoraPassosPrefix: 'painel-cotacao',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'O **Painel da Cotação** é o espaço detalhado de cada solicitação: acompanhe o **status**, analise **valores e propostas**, compare **fornecedores**, consulte o **histórico de envio** e monitore as **respostas** recebidas.',
      ],
      figurasAposParagrafo: [
        {
          indice: 0,
          imagem: S('painel_cotacao'),
          legenda: 'Painel da Cotação',
        },
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Acesso ao painel de cotação e os acessos via lista e via insights',
          tituloCurto: 'Acesso ao painel de cotação e os acessos via lista e via insights',
          ocultarNoSumario: true,
          paragrafos: [
            'O **Painel da Cotação** pode ser acessado pela **Lista** de cotações ou pelos atalhos de **Insights** — mapa e **KPIs** levam ao mesmo cockpit da solicitação.',
          ],
          galeriaComparacaoAposParagrafo: [...GALERIAS_BID_FRETE_PAINEL_COTACAO_ACESSO],
        },
        ...PASSOS_MANUAL_BID_FRETE_PAINEL_COTACAO_ABAS,
      ]),
    },
    {
      titulo: 'Pagamento Taxa Gravity Fechamento',
      tituloSumario: 'Pagamento Taxa Gravity Fechamento',
      prefixoPassosVisuais: 'Pagamento Taxa Gravity Fechamento',
      ancoraPassosPrefix: 'pagamento-taxa-gravity-fechamento',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'Após o **fechamento** do frete na plataforma, a **Taxa de Fechamento** da Gravity (success fee, **podendo variar** — consulte **Gravity Store** e **Configurações**) é registrada conforme o **pagador** definido em **Configurações** — **comprador** (**Contratante Gravity**) ou **fornecedor**.',
      ],
      passosVisuais: PASSOS_MANUAL_BID_FRETE_PAGAMENTO_TAXA_GRAVITY_FECHAMENTO,
    },
    {
      titulo: 'Visão do fornecedor',
      tituloSumario: 'Visão do fornecedor',
      prefixoPassosVisuais: 'Visão do fornecedor',
      ancoraPassosPrefix: 'visao-fornecedor',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'Ambiente do **agente de carga**: receba disparos, envie propostas, acompanhe desempenho e responda por **login** ou **link público** com token.',
      ],
      passosVisuais: PASSOS_MANUAL_BID_FRETE_VISAO_FORNECEDOR,
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
