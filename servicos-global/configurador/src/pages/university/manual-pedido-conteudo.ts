import type { DocPassoVisual, DocSecao } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const LINK_MANUAL_HUB = '{{link:/university-gravity/docs/hub|Hub}}'
const LINK_MANUAL_HUB_PRODUTOS =
  '{{link:/university-gravity/docs/hub#doc-sec-3|Seus Produtos Gravity}}'
const LINK_MANUAL_PEDIDO_CONFIGURACOES =
  '{{link:/university-gravity/docs/pedido#doc-sec-13|Configurações}}'

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
      paragrafos: [
        'A **Lista** é a forma mais **rápida** e **direta** de gerenciar pedidos no workspace: se assemelha a um **Excel**, mas **inteligente** e **integrado** à plataforma Gravity.',
        'Aqui você **inclui** pedidos e itens, **edita** na tabela, **exclui**, **transfere**, **consolida**, aplica **edição em massa**, **importa**, **exporta** e monta **painéis** salvos.',
      ],
      calloutAposParagrafo: {
        indice: 1,
        callout: {
          tipo: 'dica',
          texto: 'No **seletor de workspaces** do menu lateral, marque **um**, **vários** ou **todos de uma vez** (**Selecionar tudo**) e confirme. A **Lista** reúne os **pedidos** e **itens** dos workspaces selecionados.',
        },
      },
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
            'Cada **linha mãe** é um pedido; as **linhas filhas** são os itens do PO. A barra superior reúne busca, **Novo pedido**, painéis e as ações em lote: **transferir**, **consolidar**, **edição em massa**, **excluir** e **gerar documentos**.',
          ],
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
          mostrarInfograficoPedidoCatalogoColunasLista: true,
          mostrarTabelaColunasPadraoListaPedido: true,
          paragrafoAposGaleriaTabela:
            'Você pode ir além e **criar colunas** próprias — **texto**, **número**, **data**, **fórmula** e outros tipos — para deixar a Lista ainda mais customizada. O processo completo está em ' +
            LINK_MANUAL_PEDIDO_CONFIGURACOES +
            '.',
          calloutAposGaleriaTabela: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — galeria de customização reservada: `pedido-lista-colunas-customizar.png`, `pedido-lista-colunas-arrastar.png`.',
          },
        },
        {
          titulo: 'Edição na tabela',
          tituloCurto: 'Edição',
          paragrafos: [
            'Clique na célula editável para alterar o valor **in place**. A gravação ocorre ao confirmar (Enter ou sair do campo).',
            'No **Nº pedido**, o link abre o **drawer** com o formulário completo do PO e dos itens.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — `pedido-lista-edicao-celula.png`, `pedido-lista-edicao-drawer.png`.',
          },
        },
        {
          titulo: 'Excluir',
          tituloCurto: 'Excluir',
          paragrafos: [
            'Selecione a linha e use **Excluir** na barra de ações.',
            'O modal confirma a remoção. A ação remove o pedido ou item selecionado e **não pode ser desfeita**.',
            'Para **excluir mais de um pedido**, marque as linhas desejadas pelo **checkbox** à esquerda e use **Excluir**. O modal confirma a quantidade selecionada.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — `pedido-lista-excluir.png`, `pedido-lista-excluir-modal.png`.',
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
      titulo: 'Novo Pedido e Item',
      tituloSumario: 'Novo Pedido e Item',
      paragrafos: [
        'A criação de um **novo pedido** inicia um PO no workspace atual. Em seguida, inclua **itens** (linhas de produto) com quantidades, referências comerciais e demais campos do formulário — o pedido permanece em **rascunho** até você concluir o preenchimento e salvar.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Novo pedido',
          paragrafos: [
            'Na **Lista** (ou a partir das ações da barra superior), use **Novo pedido** para abrir o formulário. Preencha cabeçalho, fornecedor, incoterm, moeda e os campos obrigatórios do workspace.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — screenshot reservado: `pedido-novo-pedido.png`.',
          },
        },
        {
          titulo: 'Novo item',
          paragrafos: [
            'Com o pedido aberto, adicione **itens** informando produto, quantidade, preço unitário e referências. Cada item herda o contexto do pedido e pode ser editado individualmente no drawer.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — screenshot reservado: `pedido-novo-item.png`.',
          },
        },
      ]),
    },
    {
      titulo: 'Transferir Pedidos e Itens',
      tituloSumario: 'Transferir Pedidos e Itens',
      paragrafos: [
        '**Transferir** move pedidos e/ou itens selecionados para **outro workspace** da organização. A operação preserva o histórico no workspace de origem e registra o evento em **Histórico**. Misturas de importação e exportação geram **aviso**, mas a transferência pode prosseguir.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Selecionar e transferir',
          paragrafos: [
            'Na **Lista**, marque os **pedidos** e/ou **itens** desejados, abra **Transferir** na barra de ações e escolha o workspace de destino. Revise o resumo no modal antes de confirmar.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — screenshot reservado: `pedido-transferir.png`.',
          },
        },
      ]),
    },
    {
      titulo: 'Consolidar Pedidos',
      tituloSumario: 'Consolidar Pedidos',
      paragrafos: [
        '**Consolidar** une **dois ou mais pedidos compatíveis** em um único PO — útil quando o mesmo fornecedor ou fluxo comercial permite agrupar linhas. Pedidos de **importação e exportação misturados** são **bloqueados**; a tela exibe banner e o botão fica desabilitado até a seleção ser corrigida.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Selecionar e consolidar',
          paragrafos: [
            'Na **Lista**, selecione os pedidos elegíveis, abra **Consolidar** e confirme o pedido resultante. Os itens das origens passam a compor o pedido consolidado; os pedidos de origem são encerrados conforme as regras do produto.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — screenshot reservado: `pedido-consolidar.png`.',
          },
        },
      ]),
    },
    {
      titulo: 'Edição em Massa',
      tituloSumario: 'Edição em Massa',
      paragrafos: [
        'A **edição em massa** altera **campos de pedido e de item** em paralelo para todos os registros selecionados na lista. Campos bloqueados, somente leitura ou calculados automaticamente não aparecem no formulário.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Abrir e aplicar alterações',
          paragrafos: [
            'Selecione pedidos e/ou itens na **Lista**, clique em **Edição em massa**, escolha os campos a atualizar e informe os novos valores. Ao salvar, o sistema aplica as mudanças em lote e exibe o resumo de registros afetados.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — screenshot reservado: `pedido-edicao-massa.png`.',
          },
        },
      ]),
    },
    {
      titulo: 'Gerar Documentos',
      tituloSumario: 'Gerar Documentos',
      paragrafos: [
        '**Gerar documentos** produz **PDFs e relatórios** a partir dos pedidos e itens selecionados, usando os **templates** configurados em **Configurações**. A ação está disponível na barra da **Lista** quando há seleção válida.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Selecionar e gerar',
          paragrafos: [
            'Marque os pedidos (e itens, quando aplicável), abra **Gerar documento**, escolha o template e confirme. O arquivo é gerado no servidor e disponibilizado para download ou visualização conforme o template.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — screenshot reservado: `pedido-gerar-documentos.png`.',
          },
        },
      ]),
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
