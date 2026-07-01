import type { DocPassoVisual, DocSecao } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const LINK_MANUAL_HUB = '{{link:/university-gravity/docs/hub|Hub}}'
const LINK_MANUAL_HUB_PRODUTOS =
  '{{link:/university-gravity/docs/hub#doc-sec-3|Seus Produtos Gravity}}'
const LINK_MANUAL_SMART_READ_CONFIGURACOES =
  '{{link:/university-gravity/docs/smart-read#doc-sec-7|Configurações}}'

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
const SCREENSHOT_SMART_DOCS_LISTA_EXPORTAR_SETA =
  '/university/screenshots/smart-docs-lista-exportar-seta.png'
const SCREENSHOT_SMART_DOCS_LISTA_EXPORTAR_MODAL =
  '/university/screenshots/smart-docs-lista-exportar-modal.png'
const SCREENSHOT_SMART_DOCS_LISTA_EXPANDIR_SETA = '/university/screenshots/smart-docs-lista-expandir-seta.png'
const SCREENSHOT_SMART_DOCS_LISTA_LINHA_EXPANDIDA =
  '/university/screenshots/smart-docs-lista-linha-expandida.png'
const SCREENSHOT_SMART_DOCS_LISTA_EXPANDIR_TODOS_SETA =
  '/university/screenshots/smart-docs-lista-expandir-todos-seta.png'
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
const SCREENSHOT_SMART_DOCS_INSIGHTS_NOVA_LEITURA =
  '/university/screenshots/smart-docs-insights-nova-leitura.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_4_PASSOS =
  '/university/screenshots/smart-docs-nova-leitura-4-passos.png'
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
  { rotulo: 'Versão', valor: '1.1' },
  { rotulo: 'Atualizado em', valor: 'julho 2026' },
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
      modoCenarios: true,
      cenariosLadoALado: true,
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
      titulo: 'Requisitos técnicos',
      tituloSumario: 'Requisitos técnicos',
      paragrafos: [
        'Informações de **limites da plataforma** e **consumo de API** — úteis para operação, integrações e suporte quando a interface exibe **Muitas requisicoes**.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Limite de requisições (produção)',
          paragrafos: [
            'O backend do Smart Docs aplica **até 100 chamadas HTTP por minuto** por **organização** em produção — proteção contra abuso e picos que sobrecarregam o serviço.',
            'Esse limite conta **requisições**, não **documentos**: uma única consulta à **Lista** pode trazer **dezenas de leituras** e, em cada linha, **vários arquivos** (Invoice, BL, Packing etc.) dentro da mesma resposta.',
          ],
          callout: {
            tipo: 'aviso',
            texto: 'Se aparecer a faixa vermelha **Muitas requisicoes**, aguarde cerca de **1 minuto**, feche abas duplicadas do Smart Docs e recarregue — o contador da organização reinicia a cada minuto.',
          },
        },
        {
          titulo: 'O que a Lista busca ao abrir',
          paragrafos: [
            'Ao abrir a aba **Lista**, o produto dispara **4 consultas** em sequência rápida: listagem paginada (até **50** leituras por página), métrica de leituras realizadas, histórico para o card **Recursos reduzidos** (páginas de **100** leituras) e **painéis** salvos.',
            'Com a aba aberta, o card de saving **atualiza a cada 30 segundos** — isso também consome o limite por minuto.',
          ],
        },
        {
          titulo: 'Upload — Nova Leitura',
          paragrafos: [
            'No passo **Anexar**, cada arquivo enviado gera **1 requisição de upload**. Formatos: **PDF, JPG/JPEG, PNG, XML, CSV, XLS/XLSX**. Tamanho máximo: **50 MB por arquivo**.',
            'Vários anexos na mesma leitura são permitidos; documentos distintos dentro do **mesmo PDF** são separados na extração — sem multiplicar uploads.',
          ],
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
                'Feche o menu ou clique fora quando terminar — as alterações ficam no painel ativo.',
            },
          ],
          paragrafoAposGaleriaTabela:
            'Você pode ir além e **criar colunas** próprias — **texto**, **número**, **data**, **fórmula** e outros tipos — para deixar a Lista ainda mais customizada. O processo completo está em ' +
            LINK_MANUAL_SMART_READ_CONFIGURACOES +
            '.',
        },
        {
          titulo: 'Expandir linhas',
          tituloCurto: 'Expandir',
          paragrafos: [
            'Clique na **seta** à esquerda da linha para expandir os documentos sem sair da lista.',
            'A **linha mãe** é a leitura (ex.: Leitura 477). As **linhas filhas** são cada documento extraído nessa leitura — ex.: 3 Invoices + 1 Packing List + 1 BL = **5 linhas filhas**.',
            'Na **primeira coluna** do cabeçalho da tabela, clique na **seta** ao lado do checkbox para **expandir** ou **recolher** todas as leituras visíveis na página de uma vez.',
            'Com todas expandidas, cada leitura mostra suas linhas filhas — o mesmo efeito de abrir linha a linha, em massa.',
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
              imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPANDIR_TODOS_SETA,
              legenda: 'Seta Expandir todos no cabeçalho',
            },
            {
              indice: 3,
              imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPANDIR_TODOS_EXPANDIDO,
              legenda: 'Todas as leituras expandidas',
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
          callout: {
            tipo: 'dica',
            texto: 'Para **excluir mais de uma leitura**, marque as linhas desejadas pelo **checkbox** à esquerda e use **Excluir** — o modal confirma a quantidade selecionada.',
          },
        },
        {
          titulo: 'Exportar',
          tituloCurto: 'Exportar',
          paragrafos: [
            'Na barra da tabela, abra o menu **Exportar** para baixar o recorte atual (filtros + página visível).',
            'Escolha o formato — **Excel**, **CSV**, **PDF** ou **JSON** — mesmo padrão dos demais produtos Gravity com lista virtual.',
          ],
          figurasAposParagrafo: [
            {
              indice: 0,
              imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPORTAR_SETA,
              legenda: 'Menu Exportar',
            },
            {
              indice: 1,
              imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPORTAR_MODAL,
              legenda: 'Formatos disponíveis',
            },
          ],
          callout: {
            tipo: 'dica',
            texto: 'O **download** inicia **imediatamente** na sua máquina — não é necessário aguardar processamento adicional.',
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
          imagem: SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_SETA,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Criar painel',
          tituloCurto: 'Novo painel',
          paragrafos: [
            '1. Clique em **+** na faixa de painéis.',
            '2. Informe um **nome** e confirme — precisa ser único entre seus painéis (ex.: **Em andamento**, **Finalizadas**, **Conferidas** ou **Por região**).',
            '3. A nova aba nasce com o layout atual; ajuste **filtros** e **colunas** para o recorte — as mudanças salvam automaticamente no painel ativo.',
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
        'O wizard **Nova Leitura** tem quatro etapas: **Anexar**, **Análise do arquivo**, **Conferência** e **Resultado**. Use o mapa abaixo para navegar — hoje o manual detalha o **passo 1 (Anexar)**; as etapas 2 a 4 serão ampliadas conforme novos prints forem publicados.',
      ],
      figurasAposParagrafo: [
        {
          indice: 0,
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_4_PASSOS,
          legenda: 'Stepper — Anexar · Análise · Conferência · Resultado',
        },
      ],
      prefixoPassosVisuais: 'Nova Leitura',
      ancoraPassosPrefix: 'nova-leitura',
      mostrarMapaSubtopicosPassos: true,
      wizardEtapas: [
        { numero: 1, rotulo: 'Anexar' },
        { numero: 2, rotulo: 'Análise' },
        { numero: 3, rotulo: 'Conferência' },
        { numero: 4, rotulo: 'Resultado' },
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Iniciar',
          tituloCurto: 'Iniciar',
          paragrafos: [
            'Existem **duas formas** de iniciar uma nova leitura: clique no botão **+ Novo** na aba **Insights** ou na aba **Lista**. O modal abre no passo **Anexar**, com o stepper das quatro etapas no topo.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: 'Via Insights',
                  imagem: SCREENSHOT_SMART_DOCS_INSIGHTS_NOVA_LEITURA,
                },
                {
                  legenda: 'Via Lista',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_NOVA_LEITURA,
                },
              ],
            },
          ],
        },
        {
          titulo: 'Anexar',
          tituloCurto: 'Anexar',
          etapaWizard: 1,
          estiloTituloWizard: true,
          paragrafos: [
            'Após clicar em **+ Novo**, abre-se a tela do **passo 1 — Anexar** para enviar os documentos da leitura. O stepper no topo mostra as quatro etapas do wizard.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 2,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_GERAL,
                  paragrafoAntes:
                    'Nome da **leitura**, lista de **arquivos enviados** e botões **Cancelar** / **Enviar**.',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXAR,
                  paragrafoAntes:
                    'Selecione **arquivos** pelo **explorador** ou **solte** na **área indicada** (PDF, imagens, XML, CSV, XLS/XLSX — até **50 MB** por arquivo).',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Card do arquivo',
          tituloCurto: 'Card',
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXADO,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Cada anexo vira um **card** na sidebar com nome original, status **Arquivo enviado**, ícones **Visualizar** (nova aba) e **Excluir** (modal de confirmação). Com pelo menos um arquivo, **Enviar** avança para a **Análise do arquivo**.',
          ],
        },
        {
          titulo: 'Validação de formato',
          tituloCurto: 'Validação',
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_EXEMPLO_ERRO,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Arquivos fora da lista de extensões ou acima do limite exibem erro na interface — corrija o anexo antes de **Enviar**.',
          ],
        },
        {
          titulo: 'Análise do arquivo',
          tituloCurto: 'Análise',
          etapaWizard: 2,
          estiloTituloWizard: true,
          paragrafos: [
            'Após **Enviar**, o wizard avança para **Análise do arquivo** — a IA classifica os documentos e prepara a extração.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Seção em construção — aguardando prints da etapa **Análise do arquivo**.',
          },
        },
        {
          titulo: 'Conferência',
          tituloCurto: 'Conferência',
          etapaWizard: 3,
          estiloTituloWizard: true,
          paragrafos: [
            'Na **Conferência**, você revisa e corrige os campos extraídos antes de concluir a leitura.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Seção em construção — aguardando prints da etapa **Conferência**.',
          },
        },
        {
          titulo: 'Resultado',
          tituloCurto: 'Resultado',
          etapaWizard: 4,
          estiloTituloWizard: true,
          paragrafos: [
            'No **Resultado**, a leitura concluída fica disponível na **Lista** e alimenta as métricas de **Insights**.',
          ],
          callout: {
            tipo: 'lembrete',
            texto: 'Seção em construção — aguardando prints da etapa **Resultado**.',
          },
        },
      ]),
    },
    {
      titulo: 'Configurações',
      tituloSumario: 'Configurações',
      paragrafos: [
        'No menu lateral, **Configurações** reúne as preferências do Smart Docs no workspace — entre elas, a criação de **colunas customizadas** (**texto**, **número**, **data**, **fórmula** e outros tipos) para personalizar a **Lista** além das colunas nativas e do catálogo.',
      ],
      passosVisuais: [],
    },
  ],
}
