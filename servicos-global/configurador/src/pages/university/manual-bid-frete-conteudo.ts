import type { DocPassoVisual, DocSecao } from './manual-configurador-conteudo'
import { PASSOS_MANUAL_BID_FRETE_CONFIGURACOES } from './manual-bid-frete-configuracoes-conteudo'
import { GALERIAS_BID_FRETE_NOVA_COTACAO_MANUAL } from './manual-bid-frete-nova-cotacao-manual-conteudo'
import { screenshotBidFreteInt } from './manual-bid-frete-catalogo-screenshots'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const S = screenshotBidFreteInt

const LINK_MANUAL_HUB = '{{link:/university-gravity/docs/hub|Hub}}'
const LINK_MANUAL_BID_FRETE_CONFIGURACOES =
  '{{link:/university-gravity/docs/bid-frete#doc-sec-6|Configurações}}'

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const DOC_BID_FRETE_SUBTITULO =
  'Cotações de frete internacional: Insights, Lista, nova cotação manual e comparativo de propostas'

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
      colunas: 1,
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
            'A partir de qualquer outro **Produto Gravity**, clique no **seletor** localizado no topo do menu lateral e escolha a opção **BID Frete Internacional**.',
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
        'Cruze **rotas** e pins{{icone:pin-mapa-bid-frete}} no mapa e lance cotações avulsas ou **BIDs** com {{botao:novo-bid-frete}}.',
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
                'Selecione uma **rota** ou pin{{icone:pin-mapa-bid-frete}} para destacar o trecho e abrir as **cotações vinculadas**.',
            },
            {
              legenda: 'Modal de cotações e visão geral',
              pilaresMapaBidFrete: ['02'],
              imagem: S('insight_mapa_acesso_cotacoes_1'),
              paragrafoAntes:
                'Consulte **status**, **melhor proposta** e atalhos de cada cotação vinculada à rota.',
            },
            {
              legenda: 'Detalhamento no modal',
              pilaresMapaBidFrete: ['03'],
              imagem: S('insight_mapa_acesso_cotacoes_2'),
              paragrafoAntes:
                'Compare a **melhor oferta** no resumo expandido e avance para a **cotação completa** quando precisar.',
            },
            {
              legenda: 'Lista e ações no modal',
              pilaresMapaBidFrete: ['04'],
              imagem: S('insight_mapa_acesso_cotacoes_3'),
              paragrafoAntes:
                'Gerencie aprovações, recusas e navegação no modal conforme o **status** configurado do workspace.',
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
              imagem: S('insight_menu_mapa_botoes_destino_resultado'),
            },
            {
              legenda: 'Status da cotação',
              pilaresFiltrosMapaBidFrete: ['05'],
              paragrafoAntes:
                'Marque as etapas em **Status** para afunilar a busca. O mapa exibe só cotações compatíveis com os critérios escolhidos.',
              imagem: S('insight_menu_mapa_botoes_status'),
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
            'Gerencie a visualização do mapa por meio da barra de ferramentas. Alterne entre os modos globo e plano, aplique zoom, restaure a câmera e configure a exibição das rotas.',
          ],
          mostrarInfograficoBidFreteControlesMapa: true,
          galeriaTelasAposTabela: [
            {
              legenda: 'Vista globo',
              pilaresControlesMapaBidFrete: ['vista'],
              paragrafoAntes:
                'Ative a visão **Globo** para enxergar rotas e cotações no contexto geográfico completo.',
              imagem: S('insight_menu_mapa_globo'),
            },
            {
              legenda: 'Vista mapa plano',
              pilaresControlesMapaBidFrete: ['vista'],
              paragrafoAntes:
                'Alterne para **Mapa plano** quando precisar de leitura mais direta das rotas na tela.',
              imagem: S('insight_menu_mapa_globo_mapa'),
            },
            {
              legenda: 'Zoom in',
              pilaresControlesMapaBidFrete: ['zoom'],
              paragrafoAntes: 'Use **Zoom in** para aproximar a região inicial do mapa.',
              imagem: S('insight_menu_mapa_zoom_in_1'),
            },
            {
              legenda: 'Zoom in',
              pilaresControlesMapaBidFrete: ['zoom'],
              paragrafoAntes: 'Continue com **Zoom in** até o nível máximo de detalhe da área.',
              imagem: S('insight_menu_mapa_zoom_in_2'),
            },
            {
              legenda: 'Zoom out',
              pilaresControlesMapaBidFrete: ['zoom'],
              paragrafoAntes: 'Use **Zoom out** para afastar a vista e recuperar contexto regional.',
              imagem: S('insight_menu_mapa_zoom_out_1'),
            },
            {
              legenda: 'Zoom out',
              pilaresControlesMapaBidFrete: ['zoom'],
              paragrafoAntes: 'Amplie o **Zoom out** para enxergar o escopo completo das rotas.',
              imagem: S('insight_menu_mapa_zoom_out_2'),
            },
            {
              legenda: 'Restaurar mapa',
              pilaresControlesMapaBidFrete: ['restaurar'],
              paragrafoAntes:
                'Clique em **Restaurar** para voltar à posição e escala padrão da câmera.',
              imagem: S('insight_menu_mapa_restaurar_mapa'),
            },
            {
              legenda: 'Ocultar linhas de rota',
              pilaresControlesMapaBidFrete: ['linhas'],
              paragrafoAntes: 'Oculte as **linhas de rota** para reduzir ruído visual no mapa.',
              imagem: S('insight_menu_mapa_ocultar_exibir_linha'),
            },
            {
              legenda: 'Exibir linhas de rota',
              pilaresControlesMapaBidFrete: ['linhas'],
              paragrafoAntes:
                'Reexiba as **linhas de rota** para comparar trechos e conexões entre origem e destino.',
              imagem: S('insight_menu_mapa_ocultar_exibir_linha_resultado'),
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
        {
          titulo: 'Nova cotação avulsa manual',
          tituloCurto: 'Nova cotação manual',
          paragrafos: [
            'O wizard **Cotação avulsa manual** conduz do **número da cotação** ao **disparo aos fornecedores**, com trilha comum e ramos por **modal de transporte** (**Marítimo**, **Aéreo**, **Rodoviário**) e **tipo de carga** (**FCL**, **LCL**, **Aéreo/LCL/Rodo**).',
            'A estrutura segue o padrão do **Transferir** no manual do **Pedido**: trilha compartilhada até a bifurcação e passo a passo por ramo.',
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
