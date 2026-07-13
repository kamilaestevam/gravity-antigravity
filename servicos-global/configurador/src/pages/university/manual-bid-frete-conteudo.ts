import type { DocSecao } from './manual-configurador-conteudo'
import { renumerarPassos } from './manual-configurador-conteudo'
import { PASSOS_MANUAL_BID_FRETE_PAGAMENTO_TAXA_GRAVITY_FECHAMENTO } from './manual-bid-frete-pagamento-taxa-gravity-fechamento-conteudo'
import { PASSOS_MANUAL_BID_FRETE_CONFIGURACOES } from './manual-bid-frete-configuracoes-conteudo'
import { PASSOS_MANUAL_BID_FRETE_VISAO_FORNECEDOR } from './manual-bid-frete-visao-fornecedor-conteudo'
import {
  GALERIAS_BID_FRETE_BID_MANUAL,
  GALERIAS_BID_FRETE_NOVA_COTACAO_MANUAL_WIZARD,
  GALERIAS_BID_FRETE_NOVA_COTACAO_VISAO_GERAL,
} from './manual-bid-frete-nova-cotacao-manual-conteudo'
import { GALERIAS_BID_FRETE_PAINEL_COTACAO_ACESSO } from './manual-bid-frete-painel-cotacao-acesso-conteudo'
import { PASSOS_MANUAL_BID_FRETE_PAINEL_COTACAO_ABAS } from './manual-bid-frete-painel-cotacao-abas-conteudo'
import { screenshotBidFreteInt } from './manual-bid-frete-catalogo-screenshots'

const S = screenshotBidFreteInt

const LINK_MANUAL_HUB = '{{link:/university-gravity/docs/hub|Hub}}'
const LINK_MANUAL_BID_FRETE_CONFIGURACOES =
  '{{link:/university-gravity/docs/bid-frete#doc-sec-11|Configurações}}'

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
  paragrafos: [
    'O **BID Frete Internacional** é a solução Gravity para **cotação**, **comparação** e **gestão de propostas** de frete no comércio exterior, abrangendo desde o pedido inicial até o fechamento com fornecedores.',
    'Gerencie o fluxo em **Insights** (KPIs e cockpit) e **Lista** (painéis, filtros e ações em lote).',
  ],
  galeriaComparacaoAposParagrafo: [
    {
      indice: 1,
      colunas: 2,
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
      titulo: 'Insights',
      tituloSumario: 'Insights',
      prefixoPassosVisuais: 'Insights',
      ancoraPassosPrefix: 'insights',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'A aba **Insights** consolida **KPIs**, funil, câmbio e o **mapa global** de cotações. Personalize os cards em ' +
          LINK_MANUAL_BID_FRETE_CONFIGURACOES +
          '.',
        'Cruze **rotas** e pins{{icone:pin-mapa-bid-frete}} no mapa, abra o **Painel da Cotação** na rota selecionada e lance cotações avulsas ou **BIDs** com {{botao:novo-bid-frete}}.',
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
          mostrarInfograficoBidFreteMapa: true,
          galeriaTelasAposTabela: [
            {
              legenda: 'Selecionar rota no mapa',
              pilaresMapaBidFrete: ['01'],
              imagem: S('insight_mapa_seta'),
              paragrafoAntes:
                'Selecione uma **rota** ou pin{{icone:pin-mapa-bid-frete}} para destacar o trecho e abrir o **Painel da Cotação**.',
            },
          ],
        },
        {
          titulo: 'Refinar mapa: filtros',
          tituloCurto: 'Filtros do Mapa',
          paragrafos: [
            'Combine filtros no painel **Refinar mapa** e recalcule pins e rotas em tempo real. O hub mantém apenas cotações relevantes.',
          ],
          mostrarInfograficoBidFreteFiltrosMapa: true,
          galeriaTelasAposTabela: [
            {
              legenda: 'Tipo de Operação',
              pilaresFiltrosMapaBidFrete: ['01'],
              paragrafoAntes: 'Defina o **Tipo de Operação** desejado',
              imagensCompostas: [
                {
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_operacoes'),
                    },
                    {
                      imagem: S('insight_menu_mapa_botoes_operacoes_resultado'),
                      paragrafoAntes: 'O mapa destaca as rotas selecionadas em tempo real',
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
              legenda: 'Modal',
              pilaresFiltrosMapaBidFrete: ['02'],
              paragrafoAntes: 'Combine os **modais** na sua busca',
              imagensCompostas: [
                {
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_modal'),
                    },
                    {
                      imagem: S('insight_menu_mapa_botoes_modal_resultado'),
                      paragrafoAntes: 'O mapa atualiza as operações visíveis na hora',
                    },
                  ],
                },
              ],
            },
            {
              legenda: 'Origem',
              pilaresFiltrosMapaBidFrete: ['03'],
              paragrafoAntes: 'Selecione a **origem** da busca',
              imagensCompostas: [
                {
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_origem'),
                    },
                    {
                      imagem: S('insight_menu_mapa_botoes_origem_resultado'),
                      paragrafoAntes: 'O mapa destaca os trechos correspondentes',
                    },
                  ],
                },
              ],
            },
            {
              legenda: 'Destino',
              pilaresFiltrosMapaBidFrete: ['04'],
              paragrafoAntes:
                'Selecione o **Destino** desejado. O mapa cruza essa escolha com **Tipo de Operação**, **Modal** e **Origem** e refina as rotas visíveis.',
              imagensCompostas: [
                {
                  centralizar: false,
                  figuras: [
                    {
                      imagem: S('insight_menu_mapa_botoes_destino_resultado'),
                    },
                  ],
                },
              ],
            },
            {
              legenda: 'Status da cotação',
              pilaresFiltrosMapaBidFrete: ['05'],
              paragrafoAntes:
                'Marque as etapas em **Status** para afunilar a busca. O mapa exibe só cotações compatíveis com os critérios escolhidos.',
              imagensCompostas: [
                {
                  centralizar: false,
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
          titulo: 'Tooltips dos KPIs',
          tituloCurto: 'Tooltips KPIs',
          paragrafos: [
            'Passe o mouse sobre os indicadores da aba **Insights** para visualizar o resumo de volume, modais e cotações. Clique no **link** presente no tooltip para acessar os detalhes completos da operação imediatamente.',
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
                  paragrafoAntes: '**Aguardando aprovação**: resumo de volume e atalho direto para as cotações',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_1_tela'),
                  paragrafoAntes: '**Tela de destino**: ambiente acessado via atalho para você autorizar a operação',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_2_seta'),
                  paragrafoAntes: '**Aguardando resposta**: cotações pendentes nos fornecedores e datas de envio para o seu controle',
                },
                {
                  legenda: '',
                  imagem: S('insight_tooltip_2_tela'),
                  paragrafoAntes: '**Tela de destino**: ambiente acessado pelo atalho para você analisar a operação a fundo',
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
                  '**SLA** (Service Level Agreement) é o prazo alvo que o workspace define para resposta ou aprovação das cotações. O indicador **Tempo médio de resposta** compara o tempo real com essa meta.',
              },
            },
          ],
        },
        {
          titulo: 'Controle de Exibição do Mapa',
          tituloCurto: 'Controle de Exibição do Mapa',
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
        },
        {
          titulo: 'Controles do mapa',
          tituloCurto: 'Controles',
          paragrafos: [
            'Gerencie a visualização do mapa por meio da barra de ferramentas. Alterne entre os modos globo e plano, aplique zoom, restaure a câmera, pause a rotação do globo e configure a exibição das rotas.',
          ],
          mostrarInfograficoBidFreteControlesMapa: true,
          galeriaTelasAposTabela: [
            {
              legenda: 'Visualização em Globo',
              pilaresControlesMapaBidFrete: ['vista'],
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
              pilaresControlesMapaBidFrete: ['vista'],
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
              pilaresControlesMapaBidFrete: ['zoom'],
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
              pilaresControlesMapaBidFrete: ['zoom'],
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
              pilaresControlesMapaBidFrete: ['restaurar'],
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
              pilaresControlesMapaBidFrete: ['linhas'],
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
              pilaresControlesMapaBidFrete: ['linhas'],
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
              pilaresControlesMapaBidFrete: ['rotacao'],
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
      ]),
    },
    {
      titulo: 'Lista',
      tituloSumario: 'Lista',
      prefixoPassosVisuais: 'Lista',
      ancoraPassosPrefix: 'lista',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'A **Lista** concentra cotações e **BIDs** do workspace: **localize** registros, consulte tooltips, gerencie **painéis** e acompanhe o envio aos fornecedores.',
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
          paragrafos: [
            'Consulte **definições** e **regras de negócio** de cada coluna nos tooltips, em paridade com **Pedido** e **Smart Docs**.',
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
            'Monte **abas** com filtros e colunas próprios. Cada painel guarda um recorte operacional, como **Abertas + Marítimo** ou **Vencendo hoje**.',
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
                  paragrafoAntes: '**Editar painel**: filtros e colunas',
                },
                {
                  legenda: '',
                  imagem: S('lista_paineis_editar_2'),
                  paragrafoAntes: '**Edição de painel**: detalhe',
                },
              ],
            },
          ],
          callout: {
            tipo: 'dica',
            texto:
              'Os filtros permanecem **salvos no painel ativo**. Ao trocar de aba, cada painel restaura seus chips.',
          },
        },
      ]),
    },
    {
      titulo: 'Tipos de cotação',
      tituloSumario: 'Tipos de cotação',
      prefixoPassosVisuais: 'Tipos de cotação',
      ancoraPassosPrefix: 'tipos-cotacao',
      paragrafos: [
        'A plataforma oferece quatro formas distintas para incluir uma nova cotação: preenchimento **Manual**, importação via **planilha**, integração por **API** ou leitura inteligente via **Smart Docs**.',
        'O detalhamento de cada uma delas está no capítulo a seguir, **Nova cotação**.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Tipos de cotação',
          ocultarRotuloPasso: true,
          mostrarInfograficoBidFreteCotacaoAvulsaFormas: true,
          paragrafos: [],
        },
      ]),
    },
    {
      titulo: 'Nova cotação',
      tituloSumario: 'Nova cotação',
      prefixoPassosVisuais: 'Nova cotação',
      ancoraPassosPrefix: 'nova-cotacao',
      mostrarMapaSubtopicosPassos: true,
      passosVisuais: renumerarPassos([
        {
          titulo: 'Visão geral da Nova cotação',
          tituloCurto: 'Visão geral',
          paragrafos: [
            'No **BID Frete**, toda solicitação tem início nos botões {{botao:novo-bid-frete}}.',
          ],
          mostrarLegendaEscopoIconesBidFrete: true,
          bidFreteNovaCotacaoEscopoAposGaleriaParagrafo: 0,
          textoAntesLegendaEscopoIconesBidFrete:
            'A **legenda de ícones de escopo** explica os símbolos que aparecem neste capítulo.',
          galeriaComparacaoAposParagrafo: GALERIAS_BID_FRETE_NOVA_COTACAO_VISAO_GERAL,
        },
        {
          titulo: 'Cotação avulsa',
          tituloCurto: 'Cotação avulsa',
          paragrafos: [
            'A **Cotação avulsa** é uma solicitação **única** — um frete, uma rota, um pedido aos fornecedores. O **BID**, por outro lado, agrupa **várias cotações** em um único pacote para negociar o conjunto.',
          ],
          mostrarInfograficoBidFreteCotacaoAvulsaVsBid: true,
          bidFreteCotacaoAvulsaVsBidInfograficoAposParagrafo: 0,
          passosFilhos: [
            {
              titulo: 'Cotação manual',
              tituloCurto: 'Cotação manual',
              paragrafos: [
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
            },
            {
              titulo: 'Cotação via planilha',
              tituloCurto: 'Via planilha',
              paragrafos: [
                'Importe **Excel**, **CSV** ou **XML** para gerar a cotação avulsa. Recurso **em breve** no produto.',
              ],
              badgeEmDesenvolvimento: true,
            },
            {
              titulo: 'Cotação via Smart Docs',
              tituloCurto: 'Via Smart Docs',
              paragrafos: [
                'A **IA** extrai dados do documento comercial e pré-preenche a cotação. Recurso **em breve**.',
              ],
              badgeEmDesenvolvimento: true,
            },
            {
              titulo: 'Cotação por API',
              tituloCurto: 'Por API',
              paragrafos: [
                'Integre via **API Cockpit** ou **ERP** para criar cotações avulsas. Recurso **em breve**.',
              ],
              badgeEmDesenvolvimento: true,
            },
          ],
        },
        {
          titulo: 'BID',
          tituloCurto: 'BID',
          paragrafos: [
            'O **BID** agrupa **várias cotações** em um único pacote para negociar o conjunto com os fornecedores. A **Cotação avulsa**, por outro lado, é uma solicitação **única** — um frete, uma rota, um pedido isolado aos fornecedores.',
          ],
          mostrarInfograficoBidFreteCotacaoAvulsaVsBid: true,
          bidFreteCotacaoAvulsaVsBidInfograficoAposParagrafo: 0,
          passosFilhos: [
            {
              titulo: 'BID manual',
              tituloCurto: 'BID manual',
              paragrafos: [
                'Neste subtópico, detalhamos exclusivamente o fluxo de criação através da opção **Manual** em **BID**.',
              ],
              galeriaComparacaoAposParagrafo: GALERIAS_BID_FRETE_BID_MANUAL,
            },
            {
              titulo: 'BID via planilha',
              tituloCurto: 'Via planilha',
              paragrafos: [
                'Importe **Excel**, **CSV** ou **XML** para gerar o **BID**. Recurso **em breve** no produto.',
              ],
              badgeEmDesenvolvimento: true,
            },
            {
              titulo: 'BID via Smart Docs',
              tituloCurto: 'Via Smart Docs',
              paragrafos: [
                'A **IA** extrai dados do documento comercial e pré-preenche o **BID**. Recurso **em breve**.',
              ],
              badgeEmDesenvolvimento: true,
            },
            {
              titulo: 'BID por API',
              tituloCurto: 'Por API',
              paragrafos: [
                'Integre via **API Cockpit** ou **ERP** para criar **BIDs**. Recurso **em breve**.',
              ],
              badgeEmDesenvolvimento: true,
            },
          ],
        },
      ]),
    },
    {
      titulo: 'Painel da cotação',
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
      mostrarInfograficoBidFretePainelCotacao: true,
      figurasAposInfografico: [
        {
          paragrafoAntes:
            'O **Painel** é dividido em **três** partes: **menu superior**, **painel de insights** e acessos a **Visão geral**, **Dados gerais**, **Solicitação de Cotação**, **Propostas**, **Comentários** e **Documentos**.',
          imagem: S('painel_cotacao_divisao'),
          legenda: 'Painel da Cotação — menu superior, insights e abas do cockpit',
        },
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Acesso ao Painel da cotação',
          tituloCurto: 'Acesso ao Painel da cotação',
          paragrafos: [
            'O **Painel da Cotação** pode ser acessado de **três formas**: pelo **mapa** de **Insights**, pelo **tooltip** dos KPIs ou pela **Lista** de cotações.',
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
