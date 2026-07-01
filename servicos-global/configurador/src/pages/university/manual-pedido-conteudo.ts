import type { DocPassoVisual, DocSecao } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const LINK_MANUAL_HUB = '{{link:/university-gravity/docs/hub|Hub}}'
const LINK_MANUAL_HUB_PRODUTOS =
  '{{link:/university-gravity/docs/hub#doc-sec-3|Seus Produtos Gravity}}'

/**
 * SSOT: Drive `6. Produtos Gravity/1. Pedido` → `public/university/screenshots/pedido-*.png`
 * Nomenclatura: `pedido-{area}-{descricao}.png` (ex.: pedido-lista-visao-geral.png)
 *
 * Prints no Drive (`1. Pedido`):
 * - tela_pedido_visao_insight.png   → pedido-tela-principal.png
 * - tela_pedido_visao_lista.png     → pedido-lista.png
 * - tela_pedido_visao_dashboard.png → pedido-dashboard.png
 * - tela_pedido_visao_kanban.png    → pedido-kanban.png
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
      paragrafos: [
        'Com o **Pedido** contratado e habilitado no workspace, há **dois caminhos** para abrir o produto: pelo **Hub** ou pelo **menu lateral** (**acesso rápido**, a partir de outro Produto Gravity).',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Via Hub',
          paragrafos: [
            'No ' + LINK_MANUAL_HUB + ', na seção ' + LINK_MANUAL_HUB_PRODUTOS + ', clique no ícone **Pedido**.',
          ],
        },
        {
          titulo: 'Menu lateral — acesso rápido',
          paragrafos: [
            'Já em outro **Produto Gravity** do mesmo workspace, abra o **seletor de produtos** no topo do menu lateral e escolha **Pedido**.',
          ],
        },
      ]),
    },
    {
      titulo: 'Tipos de visualização Pedido',
      tituloSumario: 'Tipos de visualização',
      paragrafos: [
        'No topo do produto, as abas **Insights**, **Lista**, **Dashboard** e **Kanban** alternam entre **quatro visualizações** do mesmo escopo de pedidos do workspace:',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Insights',
          paragrafos: [
            'Cockpit com KPIs e visão consolidada — aba padrão ao entrar no produto (`/pedido/pedidos/visao-geral`).',
          ],
        },
        {
          titulo: 'Lista',
          paragrafos: [
            'Operação diária: busca, colunas personalizáveis, painéis salvos, exclusão, exportação, expansão de linhas e edição em massa.',
          ],
        },
        {
          titulo: 'Dashboard',
          paragrafos: [
            'Painéis com widgets configuráveis — gráficos e indicadores montados pelo usuário.',
          ],
        },
        {
          titulo: 'Kanban',
          paragrafos: [
            'Cartões organizados por **status** do pedido, com arrastar entre colunas.',
          ],
        },
      ]),
    },
    {
      titulo: 'Visualização — Insights',
      tituloSumario: 'Visualização — Insights',
      paragrafos: [
        '**Insights** concentra os indicadores principais do workspace — volume de pedidos, status, evolução temporal e demais KPIs derivados dos pedidos **ativos** no escopo selecionado.',
      ],
      passosVisuais: [],
    },
    {
      titulo: 'Visualização — Lista',
      tituloSumario: 'Visualização — Lista',
      paragrafos: [
        'A **Lista** é a visualização operacional do Pedido: grade virtual com **customização por usuário** (colunas, painéis, filtros e preferências salvas só para você). Inclui ações em lote, drawer de edição, consolidação, transferência e exportação.',
      ],
      prefixoPassosVisuais: 'Lista',
      ancoraPassosPrefix: 'lista',
      mostrarMapaSubtopicosPassos: true,
      passosVisuais: renumerarPassos([
        {
          titulo: 'Visão geral',
          tituloCurto: 'Visão geral',
          paragrafos: [
            'Use este capítulo como **mapa da tela**. Os subtópicos abaixo serão detalhados com screenshots na próxima entrega (barra de ações, painéis, colunas, expandir linha, novo pedido, exclusão, exportação…).',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Aguardando prints — estrutura do sumário já reservada para os capítulos da Lista.',
          },
        },
      ]),
    },
    {
      titulo: 'Visualização — Dashboard',
      tituloSumario: 'Visualização — Dashboard',
      paragrafos: [
        'O **Dashboard** permite montar **widgets** personalizados (gráficos, tabelas e KPIs) a partir dos pedidos do workspace. Cada usuário salva seu próprio layout.',
      ],
      passosVisuais: [],
    },
    {
      titulo: 'Visualização — Kanban',
      tituloSumario: 'Visualização — Kanban',
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
