import type { DocPassoVisual, DocSecao } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const LINK_MANUAL_HUB = '{{link:/university-gravity/docs/hub|Hub}}'
const LINK_MANUAL_HUB_PRODUTOS =
  '{{link:/university-gravity/docs/hub#doc-sec-3|Seus Produtos Gravity}}'
const LINK_MANUAL_PEDIDO_CONFIGURACOES =
  '{{link:/university-gravity/docs/pedido#doc-sec-8|Configurações}}'
const LINK_MANUAL_PEDIDO_LISTA_DETALHAMENTO_COLUNAS =
  '{{link:/university-gravity/docs/pedido#manual-passo-lista-2|5.02 Detalhamento das colunas}}'
const LINK_MANUAL_PEDIDO_LISTA_PAINEIS =
  '{{link:/university-gravity/docs/pedido#manual-passo-lista-11|5.11 Painéis}}'

/**
 * SSOT: Drive `6. Produtos Gravity/1. Pedido` → `public/university/screenshots/pedido-*.png`
 * Nomenclatura: `pedido-{area}-{descricao}.png` (ex.: pedido-lista-visao-geral.png)
 *
 * Prints no Drive (`1. Pedido`):
 * - tela_pedido_visao_insight.png   → pedido-tela-principal.png
 * - tela_pedido_visao_lista.png     → pedido-lista.png
 * - tela_pedido_visao_dashboard.png → pedido-dashboard.png
 * - tela_pedido_visao_kanban.png    → pedido-kanban.png
 * - tela_pedido_acesso_via_hub.png  → pedido-acesso-hub.png
 * - tela_pedido_acesso_via_menu_lateral.png → pedido-acesso-menu-lateral.png
 * - tela_pedido_visao_lista_expandir_seta.png → pedido-lista-expandir-seta.png
 * - tela_pedido_visao_lista_itens_expandidos.png → pedido-lista-itens-expandidos.png
 * - tela_pedido_visao_lista_expandir_todos_seta.png → pedido-lista-expandir-todos-seta.png
 * - tela_pedido_visao_lista_itens_expandidos_todos.png → pedido-lista-expandir-todos-expandido.png
 * - tela_pedido_visao_lista_colunas_customizar.png → pedido-lista-colunas-customizar.png
 * - tela_pedido_visao_lista_colunas_arrastar.png → pedido-lista-colunas-arrastar.png
 * - tela_pedido_configuracoes_criar_coluna.png → pedido-configuracoes-criar-coluna.png
 * - tela_pedido_configuracoes_seta.png → pedido-configuracoes-seta.png
 * - tela_pedido_configuracoes_criar_coluna_modal.png → pedido-configuracoes-criar-coluna-modal.png
 * - tela_pedido_lista_edicao_selecionar_salvo.png → pedido-lista-edicao-selecionar-salvo.png
 * - tela_pedido_lista_edicao_selecionar_salvar.png → pedido-lista-edicao-selecionar-salvar.png
 * - tela_pedido_lista_edicao_selecionar_opcal.png → pedido-lista-edicao-selecionar-opcoes.png
 * - tela_pedido_lista_edicao_modal.png → pedido-lista-edicao-modal.png
 * - tela_pedido_lista_alertas.png → pedido-lista-alertas.png
 * - tela_pedido_lista_excluir_setas.png → pedido-lista-excluir-setas.png
 * - tela_pedido_lista_excluir_modal.png → pedido-lista-excluir-modal.png
 * - tela_pedido_lista_excluir_confirmacao.png → pedido-lista-excluir-confirmacao.png
 * - tela_pedido_lista_filtro_seta.png → pedido-lista-filtro-seta.png
 * - tela_pedido_lista_filtro_modal.png → pedido-lista-filtro-modal.png
 * - tela_pedido_lista_filtro_aplicado.png → pedido-lista-filtro-aplicado.png
 * - tela_pedido_lista_filtro_aplicado_2.png → pedido-lista-filtro-aplicado-2.png
 * - pedido-novo-pedido.png
 * - pedido-novo-item.png
 * - pedido-transferir.png
 * - pedido-consolidar.png
 * - pedido-edicao-massa.png
 * - pedido-gerar-documentos.png
 * - pedido-configuracoes.png
 */

const SCREENSHOT_PEDIDO_INSIGHTS = '/university/screenshots/pedido-tela-principal.png'
const SCREENSHOT_PEDIDO_LISTA = '/university/screenshots/pedido-lista.png'
const SCREENSHOT_PEDIDO_DASHBOARD = '/university/screenshots/pedido-dashboard.png'
const SCREENSHOT_PEDIDO_KANBAN = '/university/screenshots/pedido-kanban.png'
const SCREENSHOT_PEDIDO_ACESSO_HUB = '/university/screenshots/pedido-acesso-hub.png'
const SCREENSHOT_PEDIDO_ACESSO_MENU_LATERAL = '/university/screenshots/pedido-acesso-menu-lateral.png'
const SCREENSHOT_PEDIDO_LISTA_EXPANDIR_SETA = '/university/screenshots/pedido-lista-expandir-seta.png'
const SCREENSHOT_PEDIDO_LISTA_ITENS_EXPANDIDOS = '/university/screenshots/pedido-lista-itens-expandidos.png'
const SCREENSHOT_PEDIDO_LISTA_EXPANDIR_TODOS_SETA = '/university/screenshots/pedido-lista-expandir-todos-seta.png'
const SCREENSHOT_PEDIDO_LISTA_EXPANDIR_TODOS_EXPANDIDO = '/university/screenshots/pedido-lista-expandir-todos-expandido.png'
const SCREENSHOT_PEDIDO_LISTA_COLUNAS_CUSTOMIZAR = '/university/screenshots/pedido-lista-colunas-customizar.png'
const SCREENSHOT_PEDIDO_LISTA_COLUNAS_CUSTOMIZAR_ARRASTAR = '/university/screenshots/pedido-lista-colunas-arrastar.png'
const SCREENSHOT_PEDIDO_CONFIGURACOES_CRIAR_COLUNA = '/university/screenshots/pedido-configuracoes-criar-coluna.png'
const SCREENSHOT_PEDIDO_CONFIGURACOES_SETA = '/university/screenshots/pedido-configuracoes-seta.png'
const SCREENSHOT_PEDIDO_CONFIGURACOES_CRIAR_COLUNA_MODAL = '/university/screenshots/pedido-configuracoes-criar-coluna-modal.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_SELECIONAR_SALVO = '/university/screenshots/pedido-lista-edicao-selecionar-salvo.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_SELECIONAR_SALVAR = '/university/screenshots/pedido-lista-edicao-selecionar-salvar.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_SELECIONAR_OPCOES = '/university/screenshots/pedido-lista-edicao-selecionar-opcoes.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MODAL = '/university/screenshots/pedido-lista-edicao-modal.png'
const SCREENSHOT_PEDIDO_LISTA_ALERTAS = '/university/screenshots/pedido-lista-alertas.png'
const SCREENSHOT_PEDIDO_LISTA_EXCLUIR_SETAS = '/university/screenshots/pedido-lista-excluir-setas.png'
const SCREENSHOT_PEDIDO_LISTA_EXCLUIR_MODAL = '/university/screenshots/pedido-lista-excluir-modal.png'
const SCREENSHOT_PEDIDO_LISTA_EXCLUIR_CONFIRMACAO = '/university/screenshots/pedido-lista-excluir-confirmacao.png'
const SCREENSHOT_PEDIDO_LISTA_FILTROS_SETA = '/university/screenshots/pedido-lista-filtro-seta.png'
const SCREENSHOT_PEDIDO_LISTA_FILTROS_MODAL = '/university/screenshots/pedido-lista-filtro-modal.png'
const SCREENSHOT_PEDIDO_LISTA_FILTROS_APLICADO = '/university/screenshots/pedido-lista-filtro-aplicado.png'
const SCREENSHOT_PEDIDO_LISTA_FILTROS_APLICADO_2 = '/university/screenshots/pedido-lista-filtro-aplicado-2.png'

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const DOC_PEDIDO_SUBTITULO =
  'Gestão de pedidos no COMEX — do PO criado ao embarque, com transferências, consolidação e documentos'

export const DOC_PEDIDO_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '1.0' },
  { rotulo: 'Atualizado em', valor: 'julho 2026' },
  { rotulo: 'Produto', valor: 'Pedido' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/pedido', href: true },
]

export const DOC_PEDIDO_SECAO: DocSecao = {
  num: 1,
  titulo: 'Visão geral',
  paragrafos: [
    'O **Pedido** é o local da plataforma Gravity onde se faz a **gestão de pedidos** no comércio exterior — **todo o gerenciamento antes do embarque**. Pedidos **criados**, pedidos e itens **prontos**, pedidos **parciais**, **transferências** de pedidos e itens para **novo pedido** ou para **pedidos existentes**, **consolidação** de pedidos compatíveis, edição em massa e geração de documentos.',
    'É possível **gerenciar os pedidos** de **quatro formas diferentes**: **Insights**, **Lista**, **Dashboard** e **Kanban**.',
  ],
  galeriaComparacaoAposParagrafo: [
    {
      indice: 1,
      colunas: 4,
      telas: [
        { legenda: 'Insights', imagem: SCREENSHOT_PEDIDO_INSIGHTS },
        { legenda: 'Lista', imagem: SCREENSHOT_PEDIDO_LISTA },
        { legenda: 'Dashboard', imagem: SCREENSHOT_PEDIDO_DASHBOARD },
        { legenda: 'Kanban', imagem: SCREENSHOT_PEDIDO_KANBAN },
      ],
    },
  ],
  mostrarInfograficoPedidoVisaoGeral: true,
  fluxos: [
    {
      titulo: 'Como acessar o produto',
      tituloSumario: 'Como acessar o produto',
      modoCenarios: true,
      cenariosLadoALado: true,
      paragrafos: [
        'Com o **Pedido** contratado e habilitado no workspace, há **dois caminhos** para abrir o produto: pelo **Hub** ou pelo **menu lateral** (**acesso rápido**, a partir de outro Produto Gravity).',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Via Hub',
          paragrafos: [
            'No ' + LINK_MANUAL_HUB + ', na seção ' + LINK_MANUAL_HUB_PRODUTOS + ', clique no ícone **Pedido**.',
          ],
          imagem: SCREENSHOT_PEDIDO_ACESSO_HUB,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Menu lateral — acesso rápido',
          paragrafos: [
            'Já em outro **Produto Gravity** do mesmo workspace, abra o **seletor de produtos** no topo do menu lateral e escolha **Pedido**.',
          ],
          imagem: SCREENSHOT_PEDIDO_ACESSO_MENU_LATERAL,
          imagemAbaixoTexto: true,
        },
      ]),
    },
    {
      titulo: 'Tipos de visualização Pedido',
      tituloSumario: 'Tipos de visualização',
      modoCenarios: true,
      cenariosLadoALado: true,
      paragrafos: [
        'No topo do produto, as abas **Insights**, **Lista**, **Dashboard** e **Kanban** alternam entre **quatro visualizações** do mesmo escopo de pedidos do workspace:',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Insights',
          paragrafos: [
            'Cockpit com **KPIs** e **visão consolidada**.',
          ],
          imagem: SCREENSHOT_PEDIDO_INSIGHTS,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Lista',
          paragrafos: [
            'Visão de **pedidos** e **itens**, **edição na tabela**, **lista customizada**, **importar dados** e **exportar lista**.',
          ],
          imagem: SCREENSHOT_PEDIDO_LISTA,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Dashboard',
          paragrafos: [
            'Painel de BI **customizado** por usuário.',
          ],
          imagem: SCREENSHOT_PEDIDO_DASHBOARD,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Kanban',
          paragrafos: [
            'Cartões organizados por **status** do pedido, com arrastar entre colunas.',
          ],
          imagem: SCREENSHOT_PEDIDO_KANBAN,
          imagemAbaixoTexto: true,
        },
      ]),
    },
    {
      titulo: 'Visão Insights',
      tituloSumario: 'Visão Insights',
      paragrafos: [
        '**Insights** concentra os indicadores principais do **workspace**: volume de pedidos, status, evolução temporal e demais KPIs derivados dos pedidos ativos no escopo selecionado. O print e o mapa das métricas abaixo detalham cada bloco da tela.',
      ],
      figurasAposParagrafo: [
        {
          indice: 0,
          imagem: SCREENSHOT_PEDIDO_INSIGHTS,
          legenda: 'Tela Insights',
        },
      ],
      mostrarInfograficoPedidoInsights: true,
      passosVisuais: [],
    },
    {
      titulo: 'Visão Lista',
      tituloSumario: 'Visão Lista',
      prefixoPassosVisuais: 'Lista',
      ancoraPassosPrefix: 'lista',
      mostrarMapaSubtopicosPassos: true,
      passosVisuais: renumerarPassos([
        {
          titulo: 'Visão geral',
          tituloCurto: 'Visão geral',
          imagem: SCREENSHOT_PEDIDO_LISTA,
          imagemAbaixoTexto: true,
          paragrafos: [
            'A **Lista** é a forma mais **rápida** e **direta** de gerenciar pedidos no workspace: se assemelha a um **Excel**, mas **inteligente** e **integrado** à plataforma Gravity.',
            'Aqui você **inclui** pedidos e itens, **edita** na tabela, **exclui**, **transfere**, **consolida**, aplica **edição em massa**, **importa**, **exporta** e monta **painéis** salvos.',
            'Cada **linha mãe** é um pedido; as **linhas filhas** são os itens do PO. A barra superior reúne busca, **Novo pedido**, painéis e as ações em lote: **transferir**, **consolidar**, **edição em massa**, **excluir** e **gerar documentos**.',
          ],
          calloutAposParagrafo: {
            indice: 1,
            callout: {
              tipo: 'dica',
              texto: 'No **seletor de workspaces** do menu lateral, marque **um**, **vários** ou **todos de uma vez** (**Selecionar tudo**) e confirme. A **Lista** reúne os **pedidos** e **itens** dos workspaces selecionados.',
            },
          },
        },
        {
          titulo: 'Detalhamento das colunas',
          tituloCurto: 'Detalhamento das colunas',
          paragrafos: [
            'O menu **Colunas** oferece **236 campos nativos** (121 na linha mãe do pedido + 115 na linha filha do item). **121** já vêm ligados no painel **Padrão**; o restante você exibe quando precisar.',
            'Abaixo, o catálogo completo com **formato**, **edição**, **soma** e **espelhamento** — referência antes de customizar a tabela.',
          ],
          mostrarInfograficoPedidoCatalogoColunasLista: true,
        },
        {
          titulo: 'Expandir linhas',
          tituloCurto: 'Expandir',
          paragrafos: [
            'Clique na **seta** à esquerda da linha para expandir os itens.',
            'A **linha mãe** é o pedido (ex.: PO 12345). As **linhas filhas** são cada item daquele pedido.',
            'Na **primeira coluna** do cabeçalho da tabela, clique na **seta** ao lado do checkbox para **expandir** ou **recolher** todos os pedidos visíveis na página de uma vez.',
            'Com todos expandidos, cada pedido mostra suas linhas filhas. O mesmo efeito de abrir linha a linha, em massa.',
          ],
          figurasAposParagrafo: [
            {
              indice: 0,
              imagem: SCREENSHOT_PEDIDO_LISTA_EXPANDIR_SETA,
              legenda: 'Seta para expandir',
            },
            {
              indice: 1,
              imagem: SCREENSHOT_PEDIDO_LISTA_ITENS_EXPANDIDOS,
              legenda: 'Linha mãe e itens expandidos',
            },
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 2,
              colunas: 2,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: 'Seta Expandir todos no cabeçalho',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EXPANDIR_TODOS_SETA,
                },
                {
                  legenda: 'Todos os pedidos expandidos',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EXPANDIR_TODOS_EXPANDIDO,
                },
              ],
            },
          ],
        },
        {
          titulo: 'Customizar colunas',
          tituloCurto: 'Customizar',
          paragrafos: [
            'A **Lista** do Pedido é **altamente customizável**: você monta a visualização ideal no menu **Colunas**, salva no **painel** ativo e o layout volta automaticamente na sua próxima visita.',
          ],
          mostrarInfograficoPedidoListaCustomizacao: true,
          galeriaTelasAposTabela: [
            {
              legenda: '01 · Ocultar e exibir colunas nativas',
              pilaresCustomizacao: ['01', '02'],
              imagem: SCREENSHOT_PEDIDO_LISTA_COLUNAS_CUSTOMIZAR,
              paragrafoAntes:
                'Abra **Colunas** na barra da tabela. **Desmarque** para **ocultar** campos de **pedido** ou **item**; **marque** de volta para **exibir**.',
              calloutDepois: {
                tipo: 'dica',
                texto: 'A tabela atualiza na hora — só permanecem visíveis as colunas marcadas.',
              },
            },
            {
              legenda: '03 · Arrastar com sua preferência',
              pilaresCustomizacao: ['03'],
              imagem: SCREENSHOT_PEDIDO_LISTA_COLUNAS_CUSTOMIZAR_ARRASTAR,
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
                      imagem: SCREENSHOT_PEDIDO_CONFIGURACOES_SETA,
                      paragrafoAntes: 'No **Pedido**, clique no menu lateral em **Configurações**',
                    },
                    {
                      imagem: SCREENSHOT_PEDIDO_CONFIGURACOES_CRIAR_COLUNA,
                      paragrafoAntes:
                        'Clique em **Colunas**, depois **Personalizadas** e **+ Criar Coluna**',
                    },
                  ],
                  paragrafoApos:
                    'Selecione o **tipo de coluna** que deseja, inclua o **nome** e clique em **Salvar**. A coluna será exibida na sua lista.',
                },
                {
                  centralizar: false,
                  figuras: [
                    { imagem: SCREENSHOT_PEDIDO_CONFIGURACOES_CRIAR_COLUNA_MODAL },
                  ],
                },
              ],
              calloutDepois: {
                tipo: 'dica',
                texto:
                  'Após salvar, a coluna aparece no menu **Colunas** da Lista para exibir e posicionar como as nativas. Detalhes em ' +
                  LINK_MANUAL_PEDIDO_CONFIGURACOES +
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
          paragrafos: [
            'A **Lista** é **totalmente editável** — tanto **pedidos** quanto **itens** — respeitando as regras de cada coluna e campo definidas em ' +
              LINK_MANUAL_PEDIDO_LISTA_DETALHAMENTO_COLUNAS +
              '.',
            'Clique na célula editável para alterar o valor **in place**. A gravação ocorre ao confirmar (Enter ou sair do campo).',
          ],
          mostrarCatalogoColunasPedidoLista: true,
          catalogoColunasPedidoAposParagrafo: 1,
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_SELECIONAR_SALVO,
                  paragrafoAntes: '**Selecione** a célula editável',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_SELECIONAR_OPCOES,
                  paragrafoAntes: '**Opções** do tipo de campo',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_SELECIONAR_SALVAR,
                  paragrafoAntes: 'Confirme com **Salvar** ou **Enter**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MODAL,
                  paragrafoAntes: '**Drawer** com o formulário completo',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Filtro das colunas',
          tituloCurto: 'Filtro das colunas',
          paragrafos: [
            'O **filtro de coluna** refina o que aparece na tabela **dentro** do escopo já definido pelo **seletor de workspaces** (menu lateral) e pela **busca** da barra superior — não substitui nenhum dos dois.',
            'Cada coluna expõe um **ícone de funil** no **cabeçalho**. Clique para abrir o popover: **ordenar** (crescente/decrescente), **filtrar por texto**, **marcar valores** (listas e pills) ou **intervalo numérico** (mín./máx.), conforme o tipo da coluna.',
            'Filtros ativos viram **chips** na barra da tabela, no formato **`Nome da coluna: valor`**. Passe o mouse para ver a lista completa quando houver muitos valores; **clique no chip** para reeditar; use **×** no chip para remover **só aquele** filtro. Com dois ou mais filtros, aparece **Limpar todos**.',
            'Você pode **combinar** quantos filtros quiser na mesma tela — **Status** + **Incoterm** + **datas**, por exemplo — e o recorte fica cada vez mais específico. Essas **combinações** são o que transformam um painel genérico em uma visão de qualidade: salve o recorte no **painel** ativo (veja ' +
              LINK_MANUAL_PEDIDO_LISTA_PAINEIS +
              ') e reutilize depois.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 1,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_FILTROS_SETA,
                  paragrafoAntes: '**Ícone de funil** no cabeçalho da coluna',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_FILTROS_MODAL,
                  paragrafoAntes: 'Popover: **ordenar** e **filtrar**',
                },
              ],
            },
            {
              indice: 2,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_FILTROS_APLICADO,
                  paragrafoAntes: 'Chip **`Coluna: valor`** na barra',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_FILTROS_APLICADO_2,
                  paragrafoAntes: '**Combinação** de filtros + **Limpar todos**',
                },
              ],
            },
          ],
          callout: {
            tipo: 'dica',
            texto:
              'Os filtros ficam **salvos no painel ativo** — ao trocar de aba, cada painel traz seu próprio conjunto de chips. Monte recortes diferentes em painéis distintos (ex.: **Em andamento + FOB**, **Consolidado + Exportação**).',
          },
        },
        {
          titulo: 'Alertas na lista',
          tituloCurto: 'Alertas',
          paragrafos: [
            'A **Lista** sinaliza inconsistências entre a linha do **pedido** e suas **linhas de item** com ícone **âmbar (⚠)** na célula afetada. Os alertas ajudam a detectar campos que divergiram após edição parcial ou valores heterogêneos entre itens.',
          ],
          mostrarInfograficoPedidoListaAlertas: true,
          mostrarTabelaAlertasPedidoLista: true,
          imagem: SCREENSHOT_PEDIDO_LISTA_ALERTAS,
          imagemAbaixoTexto: true,
          callout: {
            tipo: 'dica',
            texto:
              '**Workspace** e **Tipo de operação** replicam automaticamente para todos os itens — **não** geram alerta de divergência. **NCM** e **Descrição** podem ter vários valores no mesmo pedido sem alerta âmbar.',
          },
        },
        {
          titulo: 'Excluir',
          tituloCurto: 'Excluir',
          paragrafos: [
            'Selecione a linha e use **Excluir** na barra de ações.',
            'O modal confirma a remoção. A ação remove o pedido ou item selecionado e **não pode ser desfeita**.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 1,
              colunas: 3,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EXCLUIR_SETAS,
                  paragrafoAntes: '**Selecione** a linha e clique **Excluir**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EXCLUIR_MODAL,
                  paragrafoAntes: '**Confirme** no modal (quantidade selecionada)',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EXCLUIR_CONFIRMACAO,
                  paragrafoAntes: '**Exclusão** concluída — ação irreversível',
                },
              ],
            },
          ],
          callout: {
            tipo: 'dica',
            texto:
              'Para **excluir mais de uma linha**, marque as desejadas pelo **checkbox** à esquerda e use **Excluir** — o modal confirma o que será removido. Você pode excluir **só um pedido**, **vários pedidos**, **só itens** ou **pedidos e itens** na mesma seleção.',
          },
        },
        {
          titulo: 'Exportar',
          tituloCurto: 'Exportar',
          paragrafos: [
            'Na barra da tabela, abra o menu **Exportar** para baixar o recorte atual (filtros + página visível).',
            'Escolha o formato — **Excel**, **CSV**, **PDF** ou **JSON** — mesmo padrão dos demais produtos Gravity com lista virtual.',
          ],
          callout: {
            tipo: 'dica',
            texto: 'O **download** inicia **imediatamente** na sua máquina. Não é necessário aguardar processamento adicional.',
          },
        },
        {
          titulo: 'Importar dados',
          tituloCurto: 'Importar',
          paragrafos: [
            'Na barra superior, use **Importar** para subir planilhas e criar ou atualizar pedidos e itens em lote.',
            'O assistente valida colunas obrigatórias do workspace antes de gravar. Corrija erros apontados e reenvie se necessário.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — `pedido-lista-importar.png`.',
          },
        },
        {
          titulo: 'Painéis',
          tituloCurto: 'Painéis',
          paragrafos: [
            'Pense no **Excel**: várias **planilhas** no mesmo arquivo — cada uma com layout próprio, mas todas sobre os **mesmos dados**. Os **painéis** funcionam assim na Lista.',
            'Cada painel é uma **aba** na faixa acima da tabela, com recorte independente: **colunas**, **ordem**, **filtros**, **larguras** e **busca**. O **Padrão** vem com o produto; o **+** cria uma nova planilha com o estado atual, pronta para personalizar.',
          ],
          mostrarInfograficoSmartDocsListaPaineis: true,
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — `pedido-lista-paineis.png`.',
          },
        },
        {
          titulo: 'Criar painel',
          tituloCurto: 'Novo painel',
          paragrafos: [
            '1. Clique em **+** na faixa de painéis.',
            '2. Informe um **nome** e confirme — precisa ser único entre seus painéis (ex.: **Em andamento**, **Por incoterm** ou **Saldo aberto**).',
            '3. A nova aba nasce com o layout atual; ajuste **filtros** e **colunas** para o recorte. As mudanças salvam automaticamente no painel ativo.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — `pedido-lista-painel-novo.png`, `pedido-lista-painel-nome.png`.',
          },
        },
        {
          titulo: 'Novo pedido e item',
          tituloCurto: 'Novo pedido e item',
          paragrafos: [
            'A criação de um **novo pedido** inicia um PO no workspace atual. Em seguida, inclua **itens** (linhas de produto) com quantidades, referências comerciais e demais campos do formulário — o pedido permanece em **rascunho** até você concluir o preenchimento e salvar.',
            'Na **Lista** (ou a partir das ações da barra superior), use **Novo pedido** para abrir o formulário. Preencha cabeçalho, fornecedor, incoterm, moeda e os campos obrigatórios do workspace.',
            'Com o pedido aberto, adicione **itens** informando produto, quantidade, preço unitário e referências. Cada item herda o contexto do pedido e pode ser editado individualmente no drawer.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — `pedido-novo-pedido.png`, `pedido-novo-item.png`.',
          },
        },
        {
          titulo: 'Transferir pedidos e itens',
          tituloCurto: 'Transferir',
          paragrafos: [
            '**Transferir** move pedidos e/ou itens selecionados para **outro workspace** da organização. A operação preserva o histórico no workspace de origem e registra o evento em **Histórico**. Misturas de importação e exportação geram **aviso**, mas a transferência pode prosseguir.',
            'Na **Lista**, marque os **pedidos** e/ou **itens** desejados, abra **Transferir** na barra de ações e escolha o workspace de destino. Revise o resumo no modal antes de confirmar.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — `pedido-transferir.png`.',
          },
        },
        {
          titulo: 'Consolidar pedidos',
          tituloCurto: 'Consolidar',
          paragrafos: [
            '**Consolidar** une **dois ou mais pedidos compatíveis** em um único PO — útil quando o mesmo fornecedor ou fluxo comercial permite agrupar linhas. Pedidos de **importação e exportação misturados** são **bloqueados**; a tela exibe banner e o botão fica desabilitado até a seleção ser corrigida.',
            'Na **Lista**, selecione os pedidos elegíveis, abra **Consolidar** e confirme o pedido resultante. Os itens das origens passam a compor o pedido consolidado; os pedidos de origem são encerrados conforme as regras do produto.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — `pedido-consolidar.png`.',
          },
        },
        {
          titulo: 'Edição em massa',
          tituloCurto: 'Edição em massa',
          paragrafos: [
            'A **edição em massa** altera **campos de pedido e de item** em paralelo para todos os registros selecionados na lista. Campos bloqueados, somente leitura ou calculados automaticamente não aparecem no formulário.',
            'Selecione pedidos e/ou itens na **Lista**, clique em **Edição em massa**, escolha os campos a atualizar e informe os novos valores. Ao salvar, o sistema aplica as mudanças em lote e exibe o resumo de registros afetados.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — `pedido-edicao-massa.png`.',
          },
        },
        {
          titulo: 'Gerar documentos',
          tituloCurto: 'Gerar documentos',
          paragrafos: [
            '**Gerar documentos** produz **PDFs e relatórios** a partir dos pedidos e itens selecionados, usando os **templates** configurados em **Configurações**. A ação está disponível na barra da **Lista** quando há seleção válida.',
            'Marque os pedidos (e itens, quando aplicável), abra **Gerar documento**, escolha o template e confirme. O arquivo é gerado no servidor e disponibilizado para download ou visualização conforme o template.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — `pedido-gerar-documentos.png`.',
          },
        },
      ]),
    },
    {
      titulo: 'Visão Dashboard',
      tituloSumario: 'Visão Dashboard',
      paragrafos: [
        'O **Dashboard** permite montar **widgets** personalizados (gráficos, tabelas e KPIs) a partir dos pedidos do workspace. Cada usuário salva seu próprio layout.',
      ],
      passosVisuais: [],
    },
    {
      titulo: 'Visão Kanban',
      tituloSumario: 'Visão Kanban',
      paragrafos: [
        'O **Kanban** organiza os pedidos em **colunas por status**. Arraste cartões entre colunas para atualizar o fluxo; as colunas visíveis são configuráveis em **Configurações › Kanban**.',
      ],
      passosVisuais: [],
    },
    {
      titulo: 'Configurações',
      tituloSumario: 'Configurações',
      paragrafos: [
        'No menu lateral, **Configurações** reúne as preferências do produto no workspace: **status** e rótulos, **colunas** da lista, **templates** de exportação/PDF, **Kanban**, casas decimais, formato de data e demais abas administrativas.',
      ],
      passosVisuais: [],
    },
    {
      titulo: 'Histórico',
      tituloSumario: 'Histórico',
      paragrafos: [
        'Pelo menu lateral, **Histórico** abre a trilha de auditoria dos pedidos do workspace — criação, edição, exclusão, transferência, consolidação e demais eventos gravados no servidor.',
      ],
      passosVisuais: [],
    },
  ],
}
