import type { DocPassoVisual, DocSecao } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const LINK_MANUAL_HUB = '{{link:/university-gravity/docs/hub|Hub}}'
const LINK_MANUAL_HUB_PRODUTOS =
  '{{link:/university-gravity/docs/hub#doc-sec-3|Seus Produtos Gravity}}'

/**
 * SSOT: Drive `6. Produtos Gravity/2. Smart Docs` → `public/university/screenshots/smart-docs-*.png`
 * Copiar: `pwsh scripts/copiar-screenshots-manual-smart-docs.ps1`
 */
const SCREENSHOT_SMART_DOCS_TELA_PRINCIPAL = '/university/screenshots/smart-docs-tela-principal.png'
const SCREENSHOT_SMART_DOCS_ACESSO_HUB = '/university/screenshots/smart-docs-acesso-hub.png'
const SCREENSHOT_SMART_DOCS_ACESSO_MENU_LATERAL = '/university/screenshots/smart-docs-acesso-menu-lateral.png'
const SCREENSHOT_SMART_DOCS_LISTA = '/university/screenshots/smart-docs-lista.png'
const SCREENSHOT_SMART_DOCS_LISTA_COLUNAS_CUSTOMIZAR =
  '/university/screenshots/smart-docs-lista-colunas-customizar.png'
const SCREENSHOT_SMART_DOCS_LISTA_COLUNAS_CUSTOMIZAR_ARRASTAR =
  '/university/screenshots/smart-docs-lista-colunas-customizar-arrastar.png'
const SCREENSHOT_SMART_DOCS_LISTA_EXCLUIR_SETA = '/university/screenshots/smart-docs-lista-excluir-seta.png'
const SCREENSHOT_SMART_DOCS_LISTA_EXCLUIR_MODAL = '/university/screenshots/smart-docs-lista-excluir-modal.png'
const SCREENSHOT_SMART_DOCS_LISTA_EXCLUIR_CONFIRMACAO =
  '/university/screenshots/smart-docs-lista-excluir-confirmacao.png'
const SCREENSHOT_SMART_DOCS_LISTA_EXPANDIR_SETA = '/university/screenshots/smart-docs-lista-expandir-seta.png'
const SCREENSHOT_SMART_DOCS_LISTA_LINHA_EXPANDIDA =
  '/university/screenshots/smart-docs-lista-linha-expandida.png'
const SCREENSHOT_SMART_DOCS_LISTA_EXPANDIR_TODOS_EXPANDIDO =
  '/university/screenshots/smart-docs-lista-expandir-todos-expandido.png'
const SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_SETA = '/university/screenshots/smart-docs-lista-paineis-seta.png'
const SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_NOVO_SETA =
  '/university/screenshots/smart-docs-lista-paineis-novo-seta.png'
const SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_NOVO_NOME_SETA =
  '/university/screenshots/smart-docs-lista-paineis-novo-nome-seta.png'
const SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_NOVO_NOME_VALIDADO =
  '/university/screenshots/smart-docs-lista-paineis-novo-nome-validado.png'
const SCREENSHOT_SMART_DOCS_LISTA_TRANSACOES_API = '/university/screenshots/smart-docs-lista-transacoes-api.png'
const SCREENSHOT_SMART_DOCS_LISTA_NOVA_LEITURA = '/university/screenshots/smart-docs-lista-nova-leitura.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_GERAL =
  '/university/screenshots/smart-docs-nova-leitura-passo-1-geral.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXAR =
  '/university/screenshots/smart-docs-nova-leitura-passo-1-anexar.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXAR_SETA =
  '/university/screenshots/smart-docs-nova-leitura-passo-1-anexar-seta.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXADO =
  '/university/screenshots/smart-docs-nova-leitura-passo-1-anexado.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_EXEMPLO_ERRO =
  '/university/screenshots/smart-docs-nova-leitura-passo-1-exemplo-erro.png'

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const DOC_SMART_READ_SUBTITULO =
  'Leitura inteligente, gestão de documentos e riscos no COMEX — Insights, Lista e Nova Leitura'

export const DOC_SMART_READ_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '1.0' },
  { rotulo: 'Atualizado em', valor: 'junho 2026' },
  { rotulo: 'Produto', valor: 'Smart Docs' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/smart-read', href: true },
]

export const DOC_SMART_READ_SECAO: DocSecao = {
  num: 1,
  titulo: 'Visão geral',
  paragrafos: [
    'O **Smart Docs** é o produto Gravity de **leitura inteligente**, **gestão de documentos** e **gestão de riscos** no comércio exterior.',
  ],
  imagem: SCREENSHOT_SMART_DOCS_TELA_PRINCIPAL,
  layoutTextoImagemLateral: true,
  mostrarInfograficoSmartDocsDocumentos: true,
  fluxos: [
    {
      titulo: 'Como acessar o produto',
      tituloSumario: 'Como acessar o produto',
      paragrafos: [
        'Com o **Smart Docs** contratado e habilitado no workspace, há **dois caminhos** para abrir o produto: pelo **Hub** ou pelo **menu lateral** (**acesso rápido**, a partir de outro Produto Gravity).',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Via Hub',
          paragrafos: [
            'No ' + LINK_MANUAL_HUB + ', na seção ' + LINK_MANUAL_HUB_PRODUTOS + ', clique no ícone **Smart Docs**.',
          ],
          imagem: SCREENSHOT_SMART_DOCS_ACESSO_HUB,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Menu lateral — acesso rápido',
          paragrafos: [
            'Já em outro **Produto Gravity** do mesmo workspace, abra o **seletor de produtos** no topo do menu lateral e escolha **Smart Docs**.',
          ],
          imagem: SCREENSHOT_SMART_DOCS_ACESSO_MENU_LATERAL,
          imagemAbaixoTexto: true,
        },
      ]),
    },
    {
      titulo: 'Tipos de visualização Smart Docs',
      tituloSumario: 'Tipos de visualização',
      paragrafos: [
        'No topo do produto, as abas **Insights** e **Lista** alternam entre **duas visualizações** complementares do mesmo workspace:',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Insights',
          paragrafos: [
            'Cockpit com KPIs, gráficos de evolução, acurácia da IA, tipos de documento, economia estimada e rankings por emissor — visão padrão ao abrir o produto.',
          ],
          imagem: SCREENSHOT_SMART_DOCS_TELA_PRINCIPAL,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Lista',
          paragrafos: [
            'Operação diária das leituras: busca, colunas personalizáveis, painéis salvos, exclusão, exportação e visão **Transações (API)**.',
          ],
          imagem: SCREENSHOT_SMART_DOCS_LISTA,
          imagemAbaixoTexto: true,
        },
      ]),
    },
    {
      titulo: 'Visualização — Insights',
      tituloSumario: 'Visualização — Insights',
      paragrafos: [
        '**Insights** concentra KPIs, evolução das leituras, acurácia da IA, tipos de documento, economia estimada e rankings por emissor — tudo derivado das leituras **concluídas** no workspace.',
      ],
      figurasAposParagrafo: [
        {
          indice: 0,
          imagem: SCREENSHOT_SMART_DOCS_TELA_PRINCIPAL,
          legenda: 'Tela Insights',
        },
      ],
      mostrarInfograficoSmartDocsInsights: true,
      passosVisuais: [],
    },
    {
      titulo: 'Visualização — Lista',
      tituloSumario: 'Visualização — Lista',
      paragrafos: [
        'A **Lista** concentra as leituras do workspace: busca, colunas personalizáveis, expansão de linhas, exclusão, exportação, **painéis** salvos e visão **Transações (API)**.',
      ],
      prefixoPassosVisuais: 'Lista',
      ancoraPassosPrefix: 'lista',
      mostrarMapaSubtopicosPassos: true,
      passosVisuais: renumerarPassos([
        {
          titulo: 'Visão geral',
          tituloCurto: 'Visão geral',
          imagem: SCREENSHOT_SMART_DOCS_LISTA,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Cada linha é uma leitura com status, arquivos, acertos e origem (**Interface** ou **API**). A barra superior reúne busca, **Novo**, painéis e ações em lote.',
          ],
        },
        {
          titulo: 'Customizar colunas',
          tituloCurto: 'Customizar',
          paragrafos: [
            'A **Lista** do Smart Docs é **altamente customizável**: você monta a visualização ideal no menu **Colunas**, salva no **painel** ativo e o layout volta automaticamente na sua próxima visita.',
          ],
          mostrarInfograficoSmartDocsListaCustomizacao: true,
          mostrarTabelaColunasPadraoLista: true,
          galeriaTelasAposTabela: [
            {
              legenda: '01 · Ocultar e exibir colunas nativas',
              imagem: SCREENSHOT_SMART_DOCS_LISTA_COLUNAS_CUSTOMIZAR,
              paragrafoAntes:
                'Abra **Colunas** na barra da tabela. **Desmarque** para **ocultar** métricas da leitura ou campos do catálogo; **marque** de volta para **exibir**.',
              paragrafoDepois:
                'A tabela atualiza na hora — só permanecem visíveis as colunas marcadas.',
            },
            {
              legenda: '03 · Arrastar com sua preferência',
              imagem: SCREENSHOT_SMART_DOCS_LISTA_COLUNAS_CUSTOMIZAR_ARRASTAR,
              paragrafoAntes:
                'No mesmo menu, **arraste** os itens para definir a **ordem** das colunas na tabela.',
              paragrafoDepois:
                'Feche o menu ou clique fora quando terminar — as alterações ficam no painel ativo. Para **criar colunas customizadas** (pilar 04), o passo a passo está na seção **Configurações**.',
            },
          ],
        },
        {
          titulo: 'Expandir linhas',
          tituloCurto: 'Expandir',
          paragrafos: [
            'Clique na **seta** à esquerda da linha para expandir os documentos sem sair da lista.',
            'A **linha mãe** é a leitura (ex.: Leitura 477). As **linhas filhas** são cada documento extraído nessa leitura — ex.: 3 Invoices + 1 Packing List + 1 BL = **5 linhas filhas**.',
            'Use **Expandir todos** na barra da tabela para abrir todas as linhas visíveis na página de uma vez.',
          ],
          figurasAposParagrafo: [
            {
              indice: 0,
              imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPANDIR_SETA,
              legenda: 'Seta para expandir',
            },
            {
              indice: 1,
              imagem: SCREENSHOT_SMART_DOCS_LISTA_LINHA_EXPANDIDA,
              legenda: 'Linha mãe e filhas expandidas',
            },
            {
              indice: 2,
              imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPANDIR_TODOS_EXPANDIDO,
              legenda: 'Expandir todos',
            },
          ],
        },
        {
          titulo: 'Excluir',
          tituloCurto: 'Excluir',
          paragrafos: [
            'Selecione a linha e use **Excluir** na barra de ações.',
            'O modal confirma a remoção: **Excluir 1 leitura selecionada?** — a ação remove a leitura e os documentos processados no Smart Docs e **não pode ser desfeita**.',
          ],
          figurasAposParagrafo: [
            {
              indice: 0,
              imagem: SCREENSHOT_SMART_DOCS_LISTA_EXCLUIR_SETA,
              legenda: 'Atalho Excluir',
            },
            {
              indice: 1,
              imagem: SCREENSHOT_SMART_DOCS_LISTA_EXCLUIR_MODAL,
              legenda: 'Modal de confirmação',
            },
          ],
        },
        {
          titulo: 'Exportar',
          tituloCurto: 'Exportar',
          paragrafos: [
            'No menu **Exportar**, baixe o recorte atual da tabela (filtros + página visível) em **Excel**, **CSV**, **PDF** ou **JSON** — mesmo padrão dos demais produtos Gravity com lista virtual.',
          ],
        },
        {
          titulo: 'Painéis',
          tituloCurto: 'Painéis',
          imagem: SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_SETA,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Um **painel** guarda colunas, ordem, filtros e larguras da lista. O painel **Padrão** vem com o produto; você pode criar painéis próprios por usuário no workspace.',
          ],
        },
        {
          titulo: 'Criar painel',
          tituloCurto: 'Novo painel',
          paragrafos: [
            '1. Clique em **Novo painel** na faixa de painéis.',
            '2. Informe um **nome** e confirme — o nome precisa ser único entre seus painéis.',
            '3. Ajuste colunas e layout; as mudanças são salvas automaticamente no painel ativo.',
          ],
          figurasAposParagrafo: [
            {
              indice: 0,
              imagem: SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_NOVO_SETA,
              legenda: 'Novo painel',
            },
            {
              indice: 1,
              imagem: SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_NOVO_NOME_SETA,
              legenda: 'Nome do painel',
            },
            {
              indice: 2,
              imagem: SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_NOVO_NOME_VALIDADO,
              legenda: 'Nome validado',
            },
          ],
        },
        {
          titulo: 'Transações (API)',
          tituloCurto: 'API',
          imagem: SCREENSHOT_SMART_DOCS_LISTA_TRANSACOES_API,
          imagemAbaixoTexto: true,
          paragrafos: [
            'A visão **Transações** destaca leituras criadas pela **API** (`origem_leitura: API`) — útil para reconciliar integrações com o que foi enviado pela interface.',
          ],
        },
      ]),
    },
    {
      titulo: 'Nova Leitura',
      tituloSumario: 'Nova Leitura',
      paragrafos: [
        'O wizard **Nova Leitura** tem quatro passos: **Anexar**, **Análise do arquivo**, **Conferência** e **Resultado**. Este manual detalha o **passo 1**; os passos seguintes serão ampliados conforme novos prints forem publicados.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Abrir o wizard',
          imagem: SCREENSHOT_SMART_DOCS_LISTA_NOVA_LEITURA,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Na aba **Insights** ou **Lista**, clique em **Novo**. O modal abre no passo **Anexar** com o stepper no topo.',
          ],
        },
        {
          titulo: 'Tela de anexar',
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_GERAL,
          imagemAbaixoTexto: true,
          paragrafos: [
            'À esquerda: área de **clique ou arraste** com os formatos aceitos (PDF, imagens, XML, CSV, XLS/XLSX — até **50 MB** por arquivo). À direita: nome da leitura, lista de arquivos e botões **Cancelar** / **Enviar**.',
          ],
        },
        {
          titulo: 'Incluir anexos',
          paragrafos: [
            'Selecione um ou vários arquivos pelo explorador ou solte na zona indicada.',
          ],
          figurasAposParagrafo: [
            {
              indice: 0,
              imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXAR_SETA,
              legenda: 'Zona de anexar',
            },
            {
              indice: 0,
              imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXAR,
              legenda: 'Formatos aceitos',
            },
          ],
        },
        {
          titulo: 'Card do arquivo',
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXADO,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Cada anexo vira um **card** na sidebar com nome original, status **Arquivo enviado**, ícones **Visualizar** (nova aba) e **Excluir** (modal de confirmação). Com pelo menos um arquivo, **Enviar** avança para a **Análise do arquivo**.',
          ],
        },
        {
          titulo: 'Validação de formato',
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_EXEMPLO_ERRO,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Arquivos fora da lista de extensões ou acima do limite exibem erro na interface — corrija o anexo antes de **Enviar**.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: '**Análise**, **Conferência** e **Resultado das leituras** (passos 2 a 4) serão documentados na próxima entrega deste manual.',
          },
        },
      ]),
    },
  ],
}
