import type { DocPassoVisual, DocSecao } from './manual-configurador-conteudo'
import { PASSOS_MANUAL_SMART_READ_CONFIGURACOES } from './manual-smart-read-configuracoes-conteudo'
import { PASSOS_MANUAL_SMART_READ_HISTORICO } from './manual-smart-read-historico-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const LINK_MANUAL_HUB = '{{link:/university-gravity/docs/hub|Hub}}'
const LINK_MANUAL_HUB_PRODUTOS =
  '{{link:/university-gravity/docs/hub#doc-sec-3|Seus Produtos Gravity}}'
const LINK_MANUAL_SMART_READ_CONFIGURACOES =
  '{{link:/university-gravity/docs/smart-read#doc-sec-7|Configurações}}'
const LINK_MANUAL_PEDIDO_LISTA =
  '{{link:/university-gravity/docs/pedido#doc-sec-5|Pedido · Visão Lista}}'
const LINK_MANUAL_API_COCKPIT = '{{link:/university-gravity/docs/api-cockpit|API Cockpit}}'

/**
 * SSOT: Drive `6. Produtos Gravity/2. Smart Docs` → `public/university/screenshots/smart-docs-*.png`
 * Copiar: `pwsh scripts/copiar-screenshots-manual-smart-docs.ps1`
 * - tela_smart_read_lista_filtro_seta.png → smart-docs-lista-filtro-seta.png
 * - tela_smart_read_lista_filtro_modal.png → smart-docs-lista-filtro-modal.png
 * - tela_smart_read_lista_filtro_final.png → smart-docs-lista-filtro-final.png
 * - tela_smart_read_lista_exportar_planilha.png → smart-docs-lista-exportar-planilha.png
 * - tela_smart_docs_tela_lista_paineis_novo_nome_validar → smart-docs-lista-paineis-novo-nome-validar.png
 * - tela_smart_docs_tela_lista_paineis_novo_nome_validado → smart-docs-lista-paineis-novo-nome-validado.png
 * - tela_smart_docs_tela_insight_tooltip_1 → smart-docs-insights-tooltip-1.png (Evolução diária — tooltip)
 * - tela_smart_docs_tela_insight_tooltip_2 → smart-docs-insights-tooltip-2.png (Campos corretos × errados — tooltip)
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
const SCREENSHOT_SMART_DOCS_LISTA_EXPORTAR_DOWNLOAD =
  '/university/screenshots/smart-docs-lista-exportar-download.png'
const SCREENSHOT_SMART_DOCS_LISTA_EXPORTAR_PLANILHA =
  '/university/screenshots/smart-docs-lista-exportar-planilha.png'
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
const SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_NOVO_NOME_VALIDAR =
  '/university/screenshots/smart-docs-lista-paineis-novo-nome-validar.png'
const SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_NOVO_NOME_VALIDADO =
  '/university/screenshots/smart-docs-lista-paineis-novo-nome-validado.png'
const SCREENSHOT_SMART_DOCS_LISTA_TRANSACOES_API = '/university/screenshots/smart-docs-lista-transacoes-api.png'
const SCREENSHOT_SMART_DOCS_LISTA_NOVA_LEITURA = '/university/screenshots/smart-docs-lista-nova-leitura.png'
const SCREENSHOT_SMART_DOCS_INSIGHTS_NOVA_LEITURA =
  '/university/screenshots/smart-docs-insights-nova-leitura.png'
const SCREENSHOT_SMART_DOCS_INSIGHTS_TOOLTIP_1 =
  '/university/screenshots/smart-docs-insights-tooltip-1.png'
const SCREENSHOT_SMART_DOCS_INSIGHTS_TOOLTIP_2 =
  '/university/screenshots/smart-docs-insights-tooltip-2.png'
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
  titulo: 'Entendendo o Smart Docs',
  tituloTopico: 'O que é Smart Docs',
  paragrafos: [
    'O Smart Docs é o produto Gravity de leitura inteligente, gestão de documentos e gestão de riscos no comércio exterior.',
  ],
  figurasAposParagrafo: [
    {
      indice: 0,
      imagem: SCREENSHOT_SMART_DOCS_TELA_PRINCIPAL,
      legenda: 'Tela principal do Smart Docs — Insights',
    },
  ],
  mostrarInfograficoSmartDocsOQueE: true,
  mostrarInfograficoSmartDocsDocumentos: true,
  fluxos: [
    {
      titulo: 'Como acessar o produto',
      tituloSumario: 'Como acessar o produto',
      modoCenarios: true,
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
            'Quando tiver em outro **Produto Gravity** do mesmo **workspace**, abra o **seletor de produtos** no topo do menu lateral e escolha **Smart Docs**.',
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
        'A gestão via **Smart Docs** pode ser feita utilizando **dois tipos de visualizações**: **Insights** e **Lista**.',
      ],
      modoCenarios: true,
      passosVisuais: renumerarPassos([
        {
          titulo: 'Insights',
          paragrafos: [
            'Cockpit com KPIs, gráficos de evolução, acurácia da IA, tipos de documento, economia estimada e rankings por emissor, **visão padrão** ao abrir o produto.',
          ],
          imagem: SCREENSHOT_SMART_DOCS_TELA_PRINCIPAL,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Lista',
          paragrafos: [
            'O acesso aos **detalhes das leituras** é feito por aqui (**passos**, **campos** e **downloads**): busca, colunas personalizáveis, painéis salvos, exclusão, exportação e visão **Transações (API)**.',
          ],
          imagem: SCREENSHOT_SMART_DOCS_LISTA,
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
        'A aba **Insights** consolida a leitura operacional do workspace: **KPIs** de volume e acurácia, **evolução diária**, distribuição por tipo de documento, **economia estimada** e rankings por emissor. O quadro abaixo descreve os **seis indicadores** da tela. Avance nos subtópicos do menu para interagir com cada área. Ajuste a base de cálculo em ' +
          LINK_MANUAL_SMART_READ_CONFIGURACOES +
          '.',
      ],
      mostrarInfograficoSmartDocsInsights: true,
      passosVisuais: renumerarPassos([
        {
          titulo: 'KPIs do topo',
          tituloCurto: 'KPIs do topo',
          paragrafos: [
            'A primeira linha da aba **Insights** exibe **quatro cards**: **documentos lidos**, **campos lidos**, **saving digitação** e **saving em erros**. Cada card resume o workspace com totais e variação quando disponível.',
          ],
          imagem: SCREENSHOT_SMART_DOCS_TELA_PRINCIPAL,
          imagemAbaixoTexto: true,
          calloutAposImagem: {
            tipo: 'dica',
            texto:
              'Os valores refletem apenas leituras **concluídas** no workspace. Métricas de economia dependem da **base de cálculo** definida em ' +
              LINK_MANUAL_SMART_READ_CONFIGURACOES +
              '.',
          },
        },
        {
          titulo: 'Indicadores da grade',
          tituloCurto: 'Indicadores da grade',
          rotuloPasso: 'Indicadores da grade',
          paragrafos: [
            'Abaixo dos KPIs, a grade reúne **cinco widgets**: evolução diária, acurácia dos campos, tipos de documento, economia estimada e ranking por emissor. Cada bloco resume o escopo do workspace; use **Base de cálculo →** no widget de economia para revisar a metodologia.',
            'Passe o mouse sobre **barras**, **fatias** e **blocos** dos gráficos da grade para abrir o **tooltip** com o recorte do período, volume de documentos e campos, acertos × erros e percentuais.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              layoutCardInsightGradeSmartDocs: true,
              telas: [
                {
                  legenda: '02 · Evolução diária',
                  imagem: SCREENSHOT_SMART_DOCS_TELA_PRINCIPAL,
                  larguraMaxima: 686,
                  cardInsightGradeSmartDocs: 2,
                },
                {
                  legenda: '03 · Campos corretos × errados',
                  imagem: SCREENSHOT_SMART_DOCS_TELA_PRINCIPAL,
                  larguraMaxima: 450,
                  cardInsightGradeSmartDocs: 3,
                },
                {
                  legenda: '04 · Tipos de documento',
                  imagem: SCREENSHOT_SMART_DOCS_TELA_PRINCIPAL,
                  larguraMaxima: 640,
                  cardInsightGradeSmartDocs: 4,
                },
                {
                  legenda: '05 · Economia estimada',
                  imagem: SCREENSHOT_SMART_DOCS_TELA_PRINCIPAL,
                  larguraMaxima: 457,
                  cardInsightGradeSmartDocs: 5,
                },
                {
                  legenda: '06 · Ranking por emissor',
                  imagem: SCREENSHOT_SMART_DOCS_TELA_PRINCIPAL,
                  larguraMaxima: 559,
                  cardInsightGradeSmartDocs: 6,
                },
              ],
              calloutApos: {
                tipo: 'dica',
                texto:
                  'Ajuste minuto digitado, valor por campo e demais parâmetros da **base de cálculo** em ' +
                  LINK_MANUAL_SMART_READ_CONFIGURACOES +
                  ' para refletir o custo real da operação.',
              },
            },
            {
              indice: 1,
              colunas: 2,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_INSIGHTS_TOOLTIP_1,
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_INSIGHTS_TOOLTIP_2,
                },
              ],
            },
          ],
        },
      ]),
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
          imagem: SCREENSHOT_SMART_DOCS_LISTA,
          imagemAbaixoTexto: true,
          paragrafos: [
            'A **Lista** concentra as leituras do workspace: busca, **edição**, colunas **personalizáveis**, **expansão** de linhas, exclusão, exportação, **painéis** salvos e visão **Transações (API)**.',
          ],
          calloutAposParagrafo: {
            indice: 0,
            callout: {
              tipo: 'dica',
              texto: 'No **seletor de workspaces** do menu lateral, marque **um**, **vários** ou **todos de uma vez** (*_Selecionar tudo_*) e confirme. A **Lista** reúne as **leituras** e **análises de documentos** dos workspaces selecionados.',
            },
          },
        },
        {
          titulo: 'Detalhamento das colunas',
          tituloCurto: 'Detalhamento das colunas',
          paragrafos: [
            'O menu **Colunas** oferece **260 campos nativos** (**15** na linha mãe da leitura + **245** na linha filha do documento). **15** já vêm ligados no painel **Padrão**; o restante você exibe quando precisar.',
            'Abaixo, o catálogo completo com **edição** e **descrição** — referência antes de customizar a tabela.',
          ],
          mostrarCatalogoColunasListaSmartRead: true,
          calloutAposTabelaColunasPadrao: {
            tipo: 'dica',
            texto:
              'Todas as colunas acima vêm do **catálogo fixo** da plataforma. **15** já aparecem no painel **Padrão**; as demais você liga no menu **Colunas**. A cada leitura, o que muda é **quais** campos a IA preencheu — os vazios ficam **—** na Lista.',
          },
        },
        {
          titulo: 'Expandir linhas',
          tituloCurto: 'Expandir',
          paragrafos: [
            'Clique na **seta** à esquerda da linha para expandir.',
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
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 2,
              colunas: 2,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: 'Seta Expandir todos no cabeçalho',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPANDIR_TODOS_SETA,
                },
                {
                  legenda: 'Todas as leituras expandidas',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPANDIR_TODOS_EXPANDIDO,
                },
              ],
            },
          ],
        },
        {
          titulo: 'Customizar colunas',
          tituloCurto: 'Customizar',
          paragrafos: [
            'A **Lista** do Smart Docs é **altamente customizável**: você monta a visualização ideal no menu **Colunas**, salva no **painel** ativo e o layout volta automaticamente na sua próxima visita.',
          ],
          mostrarInfograficoSmartDocsListaCustomizacao: true,
          galeriaTelasAposTabela: [
            {
              legenda: 'Ocultar e exibir colunas nativas',
              pilaresCustomizacao: ['01', '02'],
              imagem: SCREENSHOT_SMART_DOCS_LISTA_COLUNAS_CUSTOMIZAR,
              paragrafoAntes:
                'Abra **Colunas** na barra da tabela. **Desmarque** para **ocultar** métricas da leitura ou campos do catálogo; **marque** de volta para **exibir**.',
              calloutDepois: {
                tipo: 'dica',
                texto: 'A tabela atualiza na hora — só permanecem visíveis as colunas marcadas.',
              },
            },
            {
              legenda: 'Arrastar com sua preferência',
              pilaresCustomizacao: ['03'],
              simuladorSmartReadListaArrastarColunas: true,
              fraseDemonstracaoAnimada:
                '**Tela animada** — acompanhe a mão rearrastando os **cabeçalhos** da tabela para definir a ordem das colunas. O ciclo se repete automaticamente; você só observa, sem precisar clicar.',
              paragrafoAntes:
                'No mesmo menu, **arraste** os itens para definir a **ordem** das colunas na tabela.',
              calloutDepois: {
                tipo: 'dica',
                texto:
                  'Feche o menu ou clique fora quando terminar — as alterações ficam no painel ativo.',
              },
            },
          ],
          calloutAposGaleriaTabela: {
            tipo: 'dica',
            texto:
              'Você pode ir além e **criar colunas** próprias — **texto**, **número**, **data**, **fórmula** e outros tipos — para deixar a Lista ainda mais customizada. O processo completo está em ' +
              LINK_MANUAL_SMART_READ_CONFIGURACOES +
              '.',
          },
        },
        {
          titulo: 'Edição na tabela',
          tituloCurto: 'Edição',
          paragrafos: [
            'Diferente da **Lista** do ' +
              LINK_MANUAL_PEDIDO_LISTA +
              ', a **Lista** do Smart Docs é **somente para visualização**: você **consulta** leituras e documentos extraídos, mas **não edita** células **in place** na tabela.',
            'Ao passar o mouse sobre uma célula de dado, o cursor exibe **bloqueio** — círculo vermelho com traço diagonal. Para **corrigir** valores, abra a leitura pelo **Nome da leitura** e use a etapa **Conferência**.',
          ],
          mostrarIndicadorCursorVisualizacao: true,
          indicadorCursorVisualizacaoAposParagrafo: 1,
          calloutAposParagrafo: {
            indice: 1,
            callout: {
              tipo: 'dica',
              texto:
                'Para **corrigir** dados extraídos, clique no **Nome da leitura** (link) e use o fluxo de **Conferência** — a edição não ocorre diretamente na Lista.',
            },
          },
        },
        {
          titulo: 'Filtro das colunas',
          tituloCurto: 'Filtro das colunas',
          paragrafos: [
            'O **filtro de coluna** refina o que aparece na tabela **dentro** do escopo já definido pelo **seletor de workspaces** (menu lateral) e pela **busca** da barra superior — não substitui nenhum dos dois.',
            'Cada coluna expõe um **ícone de funil** no **cabeçalho**. Clique para abrir o popover: **ordenar** (crescente/decrescente), **filtrar por texto**, **marcar valores** (listas e pills) ou **intervalo numérico** (mín./máx.), conforme o tipo da coluna.',
            'Filtros ativos viram **chips** na barra da tabela, no formato *_Nome da coluna: valor_*. Passe o mouse para ver a lista completa quando houver muitos valores; **clique no chip** para reeditar; use **×** no chip para remover **só aquele** filtro. Com dois ou mais filtros, aparece *_Limpar todos_*.',
            'Você pode **combinar** quantos filtros quiser na mesma tela — **Status** + **Tipo de documento** + **datas**, por exemplo — e o recorte fica cada vez mais específico. Essas **combinações** são o que transformam um painel genérico em uma visão de qualidade: salve o recorte no **painel** ativo e reutilize depois.',
          ],
          callout: {
            tipo: 'dica',
            texto:
              'Os filtros ficam **salvos no painel ativo** — ao trocar de aba, cada painel traz seu próprio conjunto de chips. Monte recortes diferentes em painéis distintos (ex.: **Concluída + Invoice**, **Em análise + Bill of Lading**).',
          },
        },
        {
          titulo: 'Excluir',
          tituloCurto: 'Excluir',
          paragrafos: [
            'Selecione a linha e use **Excluir** na barra de ações.',
            'O modal confirma a remoção: *_Excluir 1 leitura selecionada?_* — a ação remove a leitura e os documentos processados no Smart Docs e **não pode ser desfeita**.',
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
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPORTAR_SETA,
                  paragrafoAntes: '**Abra** o menu **Exportar** na barra',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPORTAR_MODAL,
                  paragrafoAntes: '**Escolha** o formato no modal',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPORTAR_DOWNLOAD,
                  paragrafoAntes: '**Download** imediato na sua máquina',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPORTAR_PLANILHA,
                  paragrafoAntes: 'Ex.: **Excel** (.xlsx) aberto na planilha',
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
        {
          titulo: 'Painéis',
          tituloCurto: 'Painéis',
          paragrafos: [],
          mostrarInfograficoSmartDocsListaPaineis: true,
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_SETA,
                  paragrafoAntes:
                    'A **faixa de painéis** fica abaixo da barra da tabela — troque de aba para restaurar o recorte salvo (**filtros**, **colunas** e **ordem**)',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              tituloEtapa: 'Criar novo painel',
              textoIntro:
                'Clique em **+** na faixa para abrir o fluxo. O **nome** precisa ser **único** entre suas abas; depois personalize **filtros** e **colunas** só nesse painel.',
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_NOVO_SETA,
                  paragrafoAntes: '**01.** Clique em **+** na faixa de painéis',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_NOVO_NOME_SETA,
                  paragrafoAntes:
                    '**02.** Informe um **nome** único (ex.: **Em andamento**, **Finalizadas**, **Conferidas**)',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_NOVO_NOME_VALIDAR,
                  paragrafoAntes: '**03.** Confirme — o **nome** precisa ser **único** entre seus painéis',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_NOVO_NOME_VALIDADO,
                  paragrafoAntes:
                    '**04.** Nova aba criada — personalize **filtros** e **colunas** (salva automaticamente no painel ativo)',
                },
              ],
            },
          ],
          callout: {
            tipo: 'dica',
            texto:
              'Os filtros ficam **salvos no painel ativo** — ao trocar de aba, cada painel traz seu próprio conjunto de chips. Monte recortes diferentes em painéis distintos (ex.: **Concluída + Invoice**, **Em análise + Bill of Lading**).',
          },
        },
        {
          titulo: 'Transações (API)',
          tituloCurto: 'API',
          imagem: SCREENSHOT_SMART_DOCS_LISTA_TRANSACOES_API,
          imagemAbaixoTexto: true,
          paragrafos: [
            'A aba **Transações API** destaca leituras criadas pela **integração entre a Gravity e sistemas externos** — **ERP**, **sistemas de comércio exterior** e outros conectados via ' +
              LINK_MANUAL_API_COCKPIT +
              ' (`origem_leitura: API`). É o recorte ideal para reconciliar envios automáticos com o que foi feito na interface, na aba **Visão geral**.',
          ],
          calloutAposImagem: {
            tipo: 'dica',
            texto:
              'Lista vazia? Confira se a integração está ativa, se o token do API Cockpit aponta para o **workspace** correto e se já houve envio com origem API — ausência de linhas aqui não significa falha da Lista inteira.',
          },
          paragrafosAposImagem: [
            'Para **enviar um documento** do **Sistema Externo** e **receber a leitura de volta**, existem **três camadas**: **Sistema Externo** (ERP, COMEX…), **fronteira Gravity** (**API Cockpit** + token) e **Smart Docs** (IA + extração). O mapa abaixo usa um **PDF de Pedido de Compra** como exemplo.',
            '**Token + API** é a porta de entrada (Camada A → B): no ' +
              LINK_MANUAL_API_COCKPIT +
              ', o admin gera um token com **permissão de escrita** e **workspace** correto; o **Sistema Externo** faz **POST** do documento e recebe o **id da leitura**.',
            'Na **Camada C**, a **IA classifica** o arquivo e **extrai os campos** (nº pedido, itens, valores…). Para o **retorno**, o **Sistema Externo** consulta a **API** (GET) **ou** recebe um **Webhook** e então busca os dados completos com o mesmo token.',
            '**Webhook sozinho não substitui token** — ele só **notifica** o Sistema Externo. A aba **Transações API** acima é a **vitrine** para conferir se os envios via API chegaram ao workspace.',
          ],
          mostrarInfograficoListaLeituraSmartReadIntegracaoApiCockpit: true,
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
      prefixoPassosVisuais: 'Configurações',
      ancoraPassosPrefix: 'configuracoes',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'No menu lateral, **Configurações** reúne as preferências do Smart Docs no workspace — entre elas, a criação de **colunas customizadas** (**texto**, **número**, **data**, **fórmula** e outros tipos) para personalizar a **Lista** além das colunas nativas e do catálogo.',
      ],
      passosVisuais: PASSOS_MANUAL_SMART_READ_CONFIGURACOES,
    },
    {
      titulo: 'Histórico',
      tituloSumario: 'Histórico',
      prefixoPassosVisuais: 'Histórico',
      ancoraPassosPrefix: 'historico',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'Pelo menu lateral inferior, **Histórico** abre a trilha de auditoria **só do Smart Docs** — filtrada automaticamente para o workspace ativo.',
        'O histórico registra **mudanças que salvam no servidor**. Navegar, filtrar ou exportar a tabela **não** gera nova linha.',
      ],
      callout: {
        tipo: 'dica',
        texto: 'O acesso exige permissão **historico:ver** no workspace.',
      },
      passosVisuais: PASSOS_MANUAL_SMART_READ_HISTORICO,
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
  ],
}
