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
 * - tela_smart_docs_status → smart-docs-status.png
 * - tela_smart_resultado_4 → smart-docs-nova-leitura-passo-4.png
 * - tela_smart_resultado_5 → smart-docs-nova-leitura-passo-4-performance.png
 * - tela_smart_resultado_6 → smart-docs-nova-leitura-passo-4-tempo-total.png
 * - tela_smart_resultado_7 → smart-docs-nova-leitura-passo-4-download-pacote.png
 * - tela_smart_resultado_1 → smart-docs-nova-leitura-passo-4-selecao.png
 * - tela_smart_resultado_2 → smart-docs-nova-leitura-passo-4-arquivos-baixados.png
 */
const SCREENSHOT_SMART_DOCS_TELA_PRINCIPAL = '/university/screenshots/smart-docs-tela-principal.png'
const SCREENSHOT_SMART_DOCS_ACESSO_HUB = '/university/screenshots/smart-docs-acesso-hub.png'
const SCREENSHOT_SMART_DOCS_ACESSO_MENU_LATERAL = '/university/screenshots/smart-docs-acesso-menu-lateral.png'
const SCREENSHOT_SMART_DOCS_LISTA = '/university/screenshots/smart-docs-lista.png'
const SCREENSHOT_SMART_DOCS_LISTA_VISAO_GERAL = '/university/screenshots/smart-docs-lista-visao-geral.png'
const SCREENSHOT_SMART_DOCS_STATUS = '/university/screenshots/smart-docs-status.png'
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
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_EXCLUIR_1 =
  '/university/screenshots/smart-docs-nova-leitura-passo-1-excluir-1.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_EXCLUIR_2 =
  '/university/screenshots/smart-docs-nova-leitura-passo-1-excluir-2.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_2_A =
  '/university/screenshots/smart-docs-nova-leitura-passo-2-a.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_2_B =
  '/university/screenshots/smart-docs-nova-leitura-passo-2-b.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_2_METRICAS =
  '/university/screenshots/smart-docs-nova-leitura-passo-2-metricas.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_TOKENS =
  '/university/screenshots/smart-docs-nova-leitura-tokens.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_2_AVANCAR =
  '/university/screenshots/smart-docs-nova-leitura-passo-2-avancar.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_1 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-conferencia-1.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_FILTROS =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-conferencia-filtros.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_FILTROS_EXEMPLO =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-conferencia-filtros-exemplo.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_SESSAO_JUNTAS =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-conferencia-campos-sessao-juntas.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_SESSAO_ITENS =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-conferencia-campos-sessao-itens.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_SESSAO_ITENS_ABERTO =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-conferencia-campos-sessao-itens-aberto.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_SESSAO_ABERTA =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-conferencia-campos-sessao-aberta.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_SESSAO_EDITAR =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-conferencia-campos-sessao-aberta-editar.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_SESSAO_EDITADO =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-conferencia-campos-sessao-aberta-editado.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_SESSAO_CONFERIDO =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-conferencia-campos-sessao-conferido.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CHECK_LIST_ACESSO_1 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-check-list-acesso-1.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CHECK_LIST_ACESSO_2 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-check-list-acesso-2.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CHECK_LIST_ACESSO_3 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-check-list-acesso-3.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CHECK_LIST_ACESSO_4 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-check-list-acesso-4.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMPARAR_ARQUIVO_1 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-comparar-arquivo-1.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMPARAR_ARQUIVO_2 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-comparar-arquivo-2.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMPARAR_ARQUIVO_3 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-comparar-arquivo-3.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMPARAR_ARQUIVO_4 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-comparar-arquivo-4.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMPARAR_ARQUIVO_5 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-comparar-arquivo-5.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_ANALISE_RISCO_1 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-analise-risco-1.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_ANALISE_RISCO_2 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-analise-risco-2.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_ANALISE_RISCO_3 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-analise-risco-3.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMUNICACAO_FORNECEDOR_1 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-comunicacao-fornecedor-1.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMUNICACAO_FORNECEDOR_2 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-comunicacao-fornecedor-2.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMUNICACAO_FORNECEDOR_3 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-comunicacao-fornecedor-3.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMUNICACAO_FORNECEDOR_4 =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-comunicacao-fornecedor-4.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONSULTOR_INTELIGENTE =
  '/university/screenshots/smart-docs-nova-leitura-passo-3-consultor-inteligente.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_4 =
  '/university/screenshots/smart-docs-nova-leitura-passo-4.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_4_SELECAO =
  '/university/screenshots/smart-docs-nova-leitura-passo-4-selecao.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_4_PERFORMANCE =
  '/university/screenshots/smart-docs-nova-leitura-passo-4-performance.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_4_TEMPO_TOTAL =
  '/university/screenshots/smart-docs-nova-leitura-passo-4-tempo-total.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_4_DOWNLOAD_PACOTE =
  '/university/screenshots/smart-docs-nova-leitura-passo-4-download-pacote.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_4_ARQUIVOS_BAIXADOS =
  '/university/screenshots/smart-docs-nova-leitura-passo-4-arquivos-baixados.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_4_ALTERADO_ERRO_METRICA =
  '/university/screenshots/smart-docs-nova-leitura-passo-4-alterado-erro-metrica.png'
function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const DOC_SMART_READ_SUBTITULO =
  'Leitura inteligente, gestão de documentos e riscos no COMEX: Insights, Lista e Nova Leitura'

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
      legenda: 'Tela principal do Smart Docs: Insights',
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
          titulo: 'Menu lateral: acesso rápido',
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
            'Abaixo, o catálogo completo com **edição** e **descrição**: referência antes de customizar a tabela.',
          ],
          mostrarCatalogoColunasListaSmartRead: true,
          calloutAposTabelaColunasPadrao: {
            tipo: 'dica',
            texto:
              'Todas as colunas acima vêm do **catálogo fixo** da plataforma. **15** já aparecem no painel **Padrão**; as demais você liga no menu **Colunas**. A cada leitura, o que muda é **quais** campos a IA preencheu: os vazios ficam *(vazio)* na Lista.',
          },
        },
        {
          titulo: 'Expandir linhas',
          tituloCurto: 'Expandir',
          paragrafos: [
            'Clique na **seta** à esquerda da linha para expandir.',
            'A **linha mãe** é a leitura (ex.: Leitura 477). As **linhas filhas** são cada documento extraído nessa leitura: ex.: 3 Invoices + 1 Packing List + 1 BL = **5 linhas filhas**.',
            'Na **primeira coluna** do cabeçalho da tabela, clique na **seta** ao lado do checkbox para **expandir** ou **recolher** todas as leituras visíveis na página de uma vez.',
            'Com todas expandidas, cada leitura mostra suas linhas filhas: o mesmo efeito de abrir linha a linha, em massa.',
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
                texto: 'A tabela atualiza na hora: só permanecem visíveis as colunas marcadas.',
              },
            },
            {
              legenda: 'Arrastar com sua preferência',
              pilaresCustomizacao: ['03'],
              simuladorSmartReadListaArrastarColunas: true,
              fraseDemonstracaoAnimada:
                '**Tela animada**: acompanhe a mão rearrastando os **cabeçalhos** da tabela para definir a ordem das colunas. O ciclo se repete automaticamente; você só observa, sem precisar clicar.',
              paragrafoAntes:
                'No mesmo menu, **arraste** os itens para definir a **ordem** das colunas na tabela.',
              calloutDepois: {
                tipo: 'dica',
                texto:
                  'Feche o menu ou clique fora quando terminar: as alterações ficam no painel ativo.',
              },
            },
          ],
          calloutAposGaleriaTabela: {
            tipo: 'dica',
            texto:
              'Você pode ir além e **criar colunas** próprias: **texto**, **número**, **data**, **fórmula** e outros tipos: para deixar a Lista ainda mais customizada. O processo completo está em ' +
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
            'Ao passar o mouse sobre uma célula de dado, o cursor exibe **bloqueio**: círculo vermelho com traço diagonal. Para **corrigir** valores, abra a leitura pelo **Nome da leitura** e use a etapa **Conferência**.',
          ],
          mostrarIndicadorCursorVisualizacao: true,
          indicadorCursorVisualizacaoAposParagrafo: 1,
          calloutAposParagrafo: {
            indice: 1,
            callout: {
              tipo: 'dica',
              texto:
                'Para **corrigir** dados extraídos, clique no **Nome da leitura** (link) e use o fluxo de **Conferência**: a edição não ocorre diretamente na Lista.',
            },
          },
        },
        {
          titulo: 'Filtro das colunas',
          tituloCurto: 'Filtro das colunas',
          paragrafos: [
            'O **filtro de coluna** refina o que aparece na tabela **dentro** do escopo já definido pelo **seletor de workspaces** (menu lateral) e pela **busca** da barra superior: não substitui nenhum dos dois.',
            'Cada coluna expõe um **ícone de funil** no **cabeçalho**. Clique para abrir o popover: **ordenar** (crescente/decrescente), **filtrar por texto**, **marcar valores** (listas e pills) ou **intervalo numérico** (mín./máx.), conforme o tipo da coluna.',
            'Filtros ativos viram **chips** na barra da tabela, no formato *_Nome da coluna: valor_*. Passe o mouse para ver a lista completa quando houver muitos valores; **clique no chip** para reeditar; use **×** no chip para remover **só aquele** filtro. Com dois ou mais filtros, aparece *_Limpar todos_*.',
            'Você pode **combinar** quantos filtros quiser na mesma tela: **Status** + **Tipo de documento** + **datas**, por exemplo: e o recorte fica cada vez mais específico. Essas **combinações** são o que transformam um painel genérico em uma visão de qualidade: salve o recorte no **painel** ativo e reutilize depois.',
          ],
          callout: {
            tipo: 'dica',
            texto:
              'Os filtros ficam **salvos no painel ativo**: ao trocar de aba, cada painel traz seu próprio conjunto de chips. Monte recortes diferentes em painéis distintos (ex.: **Concluída + Invoice**, **Em análise + Bill of Lading**).',
          },
        },
        {
          titulo: 'Excluir',
          tituloCurto: 'Excluir',
          paragrafos: [
            'Selecione a linha e use **Excluir** na barra de ações.',
            'O modal confirma a remoção: *_Excluir 1 leitura selecionada?_*: a ação remove a leitura e os documentos processados no Smart Docs e **não pode ser desfeita**.',
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
            texto: 'Para **excluir mais de uma leitura**, marque as linhas desejadas pelo **checkbox** à esquerda e use **Excluir**: o modal confirma a quantidade selecionada.',
          },
        },
        {
          titulo: 'Exportar',
          tituloCurto: 'Exportar',
          paragrafos: [
            'Na barra da tabela, abra o menu **Exportar** para baixar o recorte atual: respeita **filtros**, **colunas visíveis** e **página** da lista virtual, no mesmo padrão dos demais produtos Gravity.',
            'No modal, escolha um dos **formatos** abaixo. Todos usam o **mesmo recorte** da tela — só muda a extensão do arquivo.',
            'Na sequência: **download**, **arquivos** extraídos, resumo dos **seis formatos** e **planilha** aberta.',
          ],
          mostrarInfograficoSmartDocsListaExportarFormatos: true,
          infograficoSmartDocsListaExportarFormatosAposParagrafo: 2,
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
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
              ],
            },
            {
              indice: 1,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPORTAR_DOWNLOAD,
                  paragrafoAntes: '**Download** imediato na sua máquina',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_4_ARQUIVOS_BAIXADOS,
                  paragrafoAntes:
                    'Ex.: **arquivos** extraídos do pacote — PDF, JSON, TXT e **Excel** (.xlsx) por documento',
                },
              ],
            },
            {
              indice: 2,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
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
              'Não é necessário aguardar processamento adicional: o arquivo reflete exatamente o que você vê na **Lista** no momento da exportação.',
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
                    'A **faixa de painéis** fica abaixo da barra da tabela: troque de aba para restaurar o recorte salvo (**filtros**, **colunas** e **ordem**)',
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
                  paragrafoAntes: '**03.** Confirme: o **nome** precisa ser **único** entre seus painéis',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_PAINEIS_NOVO_NOME_VALIDADO,
                  paragrafoAntes:
                    '**04.** Nova aba criada: personalize **filtros** e **colunas** (salva automaticamente no painel ativo)',
                },
              ],
            },
          ],
          callout: {
            tipo: 'dica',
            texto:
              'Os filtros ficam **salvos no painel ativo**: ao trocar de aba, cada painel traz seu próprio conjunto de chips. Monte recortes diferentes em painéis distintos (ex.: **Concluída + Invoice**, **Em análise + Bill of Lading**).',
          },
        },
        {
          titulo: 'Transações (API)',
          tituloCurto: 'API',
          imagem: SCREENSHOT_SMART_DOCS_LISTA_TRANSACOES_API,
          imagemAbaixoTexto: true,
          paragrafos: [
            'A aba **Transações API** destaca leituras criadas pela **integração entre a Gravity e sistemas externos**: **ERP**, **sistemas de comércio exterior** e outros conectados via ' +
              LINK_MANUAL_API_COCKPIT +
              ' (`origem_leitura: API`). É o recorte ideal para reconciliar envios automáticos com o que foi feito na interface, na aba **Visão geral**.',
          ],
          calloutAposImagem: {
            tipo: 'dica',
            texto:
              'Lista vazia? Confira se a integração está ativa, se o token do API Cockpit aponta para o **workspace** correto e se já houve envio com origem API: ausência de linhas aqui não significa falha da Lista inteira.',
          },
          paragrafosAposImagem: [
            'Para **enviar um documento** do **Sistema Externo** e **receber a leitura de volta**, existem **três camadas**: **Sistema Externo** (ERP, COMEX…), **fronteira Gravity** (**API Cockpit** + token) e **Smart Docs** (IA + extração). O mapa abaixo usa um **PDF de Pedido de Compra** como exemplo.',
            '**Token + API** é a porta de entrada (Camada A → B): no ' +
              LINK_MANUAL_API_COCKPIT +
              ', o admin gera um token com **permissão de escrita** e **workspace** correto; o **Sistema Externo** faz **POST** do documento e recebe o **id da leitura**.',
            'Na **Camada C**, a **IA classifica** o arquivo e **extrai os campos** (nº pedido, itens, valores…). Para o **retorno**, o **Sistema Externo** consulta a **API** (GET) **ou** recebe um **Webhook** e então busca os dados completos com o mesmo token.',
            '**Webhook sozinho não substitui token**: ele só **notifica** o Sistema Externo. A aba **Transações API** acima é a **vitrine** para conferir se os envios via API chegaram ao workspace.',
          ],
          mostrarInfograficoListaLeituraSmartReadIntegracaoApiCockpit: true,
        },
      ]),
    },
    {
      titulo: 'Nova Leitura',
      tituloSumario: 'Nova Leitura',
      tituloTopicoAcademy: 'O que é?',
      paragrafos: [
        'O wizard **Nova Leitura** tem quatro etapas: {{wizard:1|Anexar}}, {{wizard:2|Análise do arquivo}}, {{wizard:3|Conferência}} e {{wizard:4|Resultado}}. Use o mapa abaixo para navegar.',
      ],
      figurasAposParagrafo: [
        {
          indice: 0,
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_4_PASSOS,
          legenda: 'Stepper · Anexar · Análise · Conferência · Resultado',
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
          titulo: 'Como iniciar uma nova leitura',
          tituloCurto: 'Como iniciar uma nova leitura',
          paragrafos: [
            'Existem **duas formas** de iniciar uma nova leitura: clique no botão **+ Novo** na aba **Insights** ou na aba **Lista**. O modal abre no passo **Anexar**, com o stepper das quatro etapas no topo.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_INSIGHTS_NOVA_LEITURA,
                  paragrafoAntes: 'Clique em **+ Novo** na aba **Insights**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_NOVA_LEITURA,
                  paragrafoAntes: 'Clique em **+ Novo** na aba **Lista**',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Status do Smart Docs',
          tituloCurto: 'Status',
          paragrafos: [
            'Cada leitura exibe uma **pill de Status** na coluna homônima da **Lista**: ela indica em qual **etapa do wizard** você parou (Anexar → Análise → Conferência → Resultado), distinto do processamento interno da IA.',
            'O fluxo **começa** em **Anexar arquivo** ao clicar **+ Novo** e **termina** em **Resultado das leituras** quando você conclui o passo 4. Cada transição tem um **gatilho** (botão do wizard ou evento de erro).',
          ],
          mostrarInfograficoSmartDocsStatusFluxo: true,
          infograficoSmartDocsStatusFluxoAposParagrafo: 1,
          figurasAposParagrafo: [
            {
              indice: 1,
              imagem: SCREENSHOT_SMART_DOCS_STATUS,
              legenda: 'Pills de Status na coluna da Lista',
            },
          ],
          calloutAposParagrafo: {
            indice: 1,
            callout: {
              tipo: 'dica',
              texto:
                'Se a extração falhar no legado, a pill exibe **Falhou** (em geral no passo 2). Os status **Em integração** e **Integração confirmada** estão reservados para quando a leitura for enviada via **API Cockpit**.',
            },
          },
        },
        {
          titulo: 'Anexar',
          tituloCurto: 'Anexar',
          etapaWizard: 1,
          estiloTituloWizard: true,
          paragrafos: [
            'Após clicar em **+ Novo**, abre-se a tela **Anexar** para enviar os documentos da leitura.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_GERAL,
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXAR_SETA,
                  paragrafoAntes: 'Clique em **área indicada**',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Selecionar arquivos',
          tituloCurto: 'Selecionar arquivos',
          rotuloPasso: 'Selecionar arquivos',
          ocultarNoSumario: true,
          paragrafos: [
            'Selecione **arquivos** pelo **explorador** ou **solte** na **área indicada** (PDF, imagens, XML, CSV, XLS/XLSX, até **50 MB** por arquivo).',
          ],
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXAR,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Card do arquivo',
          tituloCurto: 'Card',
          rotuloPasso: 'Card',
          ocultarNoSumario: true,
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXADO,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Cada anexo vira um **card** na sidebar com nome original, status **Arquivo enviado** e ícone **Visualizar** (nova aba). Com pelo menos um arquivo, **Enviar** avança para a **Análise do arquivo**.',
          ],
        },
        {
          titulo: 'Excluir',
          tituloCurto: 'Excluir',
          rotuloPasso: 'Excluir',
          ocultarNoSumario: true,
          paragrafos: [
            'Antes de **Enviar**, é possível **excluir** um anexo pelo ícone **Excluir** no card.',
          ],
          galeriaTelasAposTabela: [
            {
              legenda: '',
              imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_EXCLUIR_1,
            },
            {
              legenda: '',
              imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_EXCLUIR_2,
              paragrafoAntes: 'Confirme no **modal**. O arquivo sai da leitura antes de **Enviar**.',
            },
          ],
        },
        {
          titulo: 'Análise do arquivo',
          tituloCurto: 'Análise',
          etapaWizard: 2,
          estiloTituloWizard: true,
          paragrafos: [
            'Estamos no **segundo passo** da leitura. Agora as IAs do Gravity começam a trabalhar analisando os arquivos.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_2_A,
                  calloutDepois: {
                    tipo: 'dica',
                    texto:
                      'A variação de tempo depende de quantos documentos, do tamanho dos arquivos e da sua internet. Em documentos pequenos, de **10** a **20** segundos; em arquivos grandes, pode chegar a **um minuto e meio**.',
                  },
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_2_B,
                  paragrafoAntes:
                    'Com todas as análises concluídas, os cards exibem o tempo final, o **saving** da leitura e o acumulado do workspace.',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              rotuloPasso: 'CARD da análise do arquivo',
              telas: [
                {
                  legenda: '',
                  simuladorSmartReadCardAnaliseArquivo: true,
                  fraseDemonstracaoAnimada:
                    '**Tela animada**: acompanhe o cursor nas três etapas: **01** identificar e separar os documentos do arquivo, **02** conferir a lista separada e **03** abrir o **preview** de cada um pelo ícone **Visualizar**. O ciclo se repete automaticamente.',
                  paragrafoAntes:
                    'No card do arquivo, o Smart Doc mostra quantos documentos identificou. **Expanda** o card para ver cada um separado e use **Visualizar** para abrir o preview.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Tempo de leitura e saving',
          tituloCurto: 'Tempo e saving',
          rotuloPasso: 'Tempo de leitura e saving',
          ocultarNoSumario: true,
          etapaWizard: 2,
          paragrafos: [
            'Com a análise concluída, três cards no topo do painel resumem a leitura e o histórico do workspace.',
          ],
          lista: [
            '**Tempo de leitura**: mostra quanto tempo a IA levou nesta análise. O valor é exibido em **HH MM SS**.',
            '**Recursos reduzidos com a leitura**: estima os minutos de trabalho manual que você deixou de fazer nesta leitura. Abra **Base de cálculo** para revisar a metodologia.',
            '**Tempo reduzido acumulado**: consolida o histórico do workspace com quantidade de **documentos** processados e **saving** total em horas.',
          ],
          listaAposParagrafo: 0,
          listaEmLinha: true,
          listaColunas: 3,
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_2_METRICAS,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Uso de tokens',
          tituloCurto: 'Tokens',
          rotuloPasso: 'Uso de tokens',
          ocultarNoSumario: true,
          etapaWizard: 2,
          paragrafos: [
            'Na sidebar, o painel **Uso de IA** mostra o consumo de **tokens** desta leitura e o acumulado do plano no mês.',
          ],
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_TOKENS,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Avançar para Conferência',
          tituloCurto: 'Avançar',
          rotuloPasso: 'Avançar para Conferência',
          ocultarNoSumario: true,
          etapaWizard: 2,
          paragrafos: [
            'Com a análise concluída, o botão **Continuar** na base da sidebar é habilitado.',
            'Clique em **Continuar** para avançar da etapa **Análise do arquivo** para **Conferência**, onde você revisa e corrige os campos extraídos antes de concluir a leitura.',
          ],
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_2_AVANCAR,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Conferência',
          tituloCurto: 'Conferência',
          etapaWizard: 3,
          estiloTituloWizard: true,
          paragrafos: [
            'Estamos agora no **terceiro passo** do Smart Docs, **o mais importante de todos eles**. Aqui os dados extraídos serão organizados em abas e incluídos nos campos; é possível fazer conferência, edição, checklist e análise de risco feita pela **IA**.',
          ],
          mostrarInfograficoSmartDocsConferencia: true,
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Conferência de Campos',
          tituloCurto: 'Campos',
          rotuloPasso: 'Conferência de Campos',
          ocultarNoSumario: true,
          etapaWizard: 3,
          paragrafos: [
            'Na primeira aba, os dados extraídos aparecem por **seções**, com campos editáveis e barra de progresso da conferência.',
            'No topo, alterne entre **Verificados**, **Preenchidos**, **Vazios** e **Preenchidos alterados** para focar o que ainda precisa de revisão.',
            'Expanda **sessões** e **itens** para conferir campo a campo.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 1,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              rotuloPasso: 'Filtros da conferência',
              telas: [
                { legenda: '', imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_FILTROS },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_FILTROS_EXEMPLO,
                  paragrafoAntes: 'Exemplo com filtro ativo para localizar campos **vazios** ou **alterados**.',
                },
              ],
            },
            {
              indice: 2,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              rotuloPasso: 'Sessões e itens',
              telas: [
                { legenda: '', imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_SESSAO_JUNTAS },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_SESSAO_ITENS,
                  paragrafoAntes:
                    'Abas com a extração de todos os itens do documento; neste exemplo, da **Invoice** (**Item 1**, **Item 2**, **Item 3**…).',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_SESSAO_ITENS_ABERTO,
                  paragrafoAntes: 'Expanda a **sessão** e os **itens** para ver os campos extraídos.',
                },
                { legenda: '', imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_SESSAO_ABERTA },
              ],
            },
          ],
        },
        {
          titulo: 'Editar campos',
          tituloCurto: 'Editar campos',
          rotuloPasso: 'Editar campos',
          ocultarNoSumario: true,
          etapaWizard: 3,
          paragrafos: [
            'Clique no valor para **editar** o campo na conferência.',
            'A métrica de acertos e erros é com essa base: a cada campo extraído **editado** na conferência, consideramos **erro** do Smart Doc.',
          ],
          mostrarInfograficoSmartDocsEditarCamposMetrica: true,
          infograficoSmartDocsEditarCamposMetricaAposParagrafo: 1,
          figurasAposParagrafo: [
            { indice: 0, imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_SESSAO_EDITAR },
            { indice: 0, imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONFERENCIA_SESSAO_EDITADO },
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 1,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_4_ALTERADO_ERRO_METRICA,
                  paragrafoAntes:
                    'Exemplo do local que consta o resultado dos campos **alterados**.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Comparar arquivo',
          tituloCurto: 'Comparar',
          rotuloPasso: 'Comparar arquivo',
          ocultarNoSumario: true,
          etapaWizard: 3,
          paragrafos: [
            'O **Comparar arquivo** cruza campo a campo a leitura atual com um **segundo documento**. Útil ao enviar versão revisada ou quando você quer validar divergências antes de concluir.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMPARAR_ARQUIVO_1,
                  paragrafoAntes: 'Botão **Comparar arquivo** na barra da Conferência. Abre o modal lado a lado.',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMPARAR_ARQUIVO_2,
                  paragrafoAntes: 'Envie o **segundo documento** no painel direito para iniciar a comparação.',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMPARAR_ARQUIVO_3,
                  paragrafoAntes: 'Enquanto o arquivo comparado é processado, aguarde a extração pela IA.',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMPARAR_ARQUIVO_4,
                  paragrafoAntes: '**Resumo da comparação**: percentual de campos iguais e filtros por status.',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMPARAR_ARQUIVO_5,
                  paragrafoAntes: 'Tabela **campo a campo** por seção. Edite o documento atual direto na coluna esquerda.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Checklist',
          tituloCurto: 'Checklist',
          rotuloPasso: 'Checklist',
          ocultarNoSumario: true,
          etapaWizard: 3,
          paragrafos: [
            'O **Checklist** é a matriz de validação documental da Conferência: cada regra compara o que foi lido no PDF com critérios de código, APIs da Receita, cruzamento entre documentos da leitura e IA.',
            'Abra pelo ícone **Checklist** na barra da aba **Conferência de Campos**. O modal mostra contagem por status (**CONFORME**, **ATENÇÃO**, **FALHA**, **PENDENTE**, **N/A**), filtro por documento e seções expansíveis com o resultado de cada regra.',
          ],
          mostrarInfograficoSmartDocsChecklistConferencia: true,
          galeriaComparacaoAposParagrafo: [
            {
              indice: 1,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CHECK_LIST_ACESSO_1,
                  paragrafoAntes: 'Acesso ao **Checklist** pela barra da Conferência. Resumo por status e barra segmentada.',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CHECK_LIST_ACESSO_2,
                  paragrafoAntes: 'Seletor de **documento** e visão das seções da matriz (ex.: Identificação, Cadastral, Logística).',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CHECK_LIST_ACESSO_3,
                  paragrafoAntes: 'Detalhe de uma regra: status, resultado lido e ícone **i** com base legal quando disponível no SSOT.',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CHECK_LIST_ACESSO_4,
                  paragrafoAntes: 'Expanda seções para percorrer todas as regras do tipo de documento selecionado.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Consultor Inteligente',
          tituloCurto: 'Consultor',
          rotuloPasso: 'Consultor Inteligente',
          ocultarNoSumario: true,
          etapaWizard: 3,
          paragrafos: [
            'Na aba **Consultor Inteligente**, converse com a **IA** sobre a leitura. Use as sugestões prontas ou digite perguntas livres com contexto dos documentos.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_CONSULTOR_INTELIGENTE,
                },
              ],
            },
          ],
        },
        {
          titulo: 'Análise de Riscos',
          tituloCurto: 'Riscos',
          rotuloPasso: 'Análise de Riscos',
          ocultarNoSumario: true,
          etapaWizard: 3,
          paragrafos: [
            'Na aba **Análise de Riscos**, a IA e motores determinísticos apontam **alertas aduaneiros** por severidade (**Crítico**, **Atenção**, **Informativo**).',
            'Expanda cada risco para ver **motivo**, **evidências** no documento, **correção sugerida** e ações para aplicar na conferência. Marque como conferido conforme revisa.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 1,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_ANALISE_RISCO_1,
                  paragrafoAntes: 'Visão geral da aba: lista de riscos com severidade e busca.',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_ANALISE_RISCO_2,
                  paragrafoAntes: 'Risco **expandido**: análise, evidências e correção sugerida.',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_ANALISE_RISCO_3,
                  paragrafoAntes: 'Detalhe com **evidência visual** no documento ou ação de correção.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Comunicação com Fornecedor',
          tituloCurto: 'Fornecedor',
          rotuloPasso: 'Comunicação com Fornecedor',
          ocultarNoSumario: true,
          etapaWizard: 3,
          paragrafos: [
            'Na aba **Comunicação com Fornecedor**, monte o e-mail ao exportador a partir dos **riscos** (pré-selecionados) e dos **campos que você editou** na conferência (desmarcados por padrão).',
            'Marque o que entra na mensagem, revise o texto gerado e copie ou envie, alinhando pendências sem redigir tudo do zero.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 1,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMUNICACAO_FORNECEDOR_1,
                  paragrafoAntes: 'Introdução da aba: selecione **riscos** e **campos editados** para a comunicação.',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMUNICACAO_FORNECEDOR_2,
                  paragrafoAntes: 'Lista de **riscos** com checkboxes: todos vêm marcados por padrão.',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMUNICACAO_FORNECEDOR_3,
                  paragrafoAntes: 'Seção **campos editados**: marque os que devem constar no e-mail ao fornecedor.',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_3_COMUNICACAO_FORNECEDOR_4,
                  paragrafoAntes: '**Prévia do e-mail** gerado com os itens selecionados.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Resultado',
          tituloCurto: 'Resultado',
          etapaWizard: 4,
          estiloTituloWizard: true,
          paragrafos: [
            'No **Resultado**, a leitura concluída fica disponível na **Lista** e alimenta as métricas de **Insights**.',
            'Na **Lista**, o menu **Exportar** também permite baixar o recorte em outros formatos. Veja abaixo exemplos de **download** e **arquivos** extraídos.',
            'Em seguida, o resumo dos **seis formatos** da Lista e a **planilha** aberta.',
          ],
          mostrarInfograficoSmartDocsPerformanceResultado: true,
          infograficoSmartDocsPerformanceResultadoAposGaleriaParagrafo: 0,
          infograficoSmartDocsPerformanceResultadoAposGaleriaIndice: 0,
          mostrarInfograficoSmartDocsListaExportarFormatos: true,
          infograficoSmartDocsListaExportarFormatosAposParagrafo: 2,
          mostrarInfograficoSmartDocsResultadoIntegracaoAutomatica: true,
          infograficoSmartDocsResultadoIntegracaoAutomaticaAposGaleriaParagrafo: 2,
          infograficoSmartDocsResultadoIntegracaoAutomaticaAposGaleriaIndice: 2,
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_4,
                  paragrafoDepois:
                    'O painel **Performance de acertos** classifica os campos conferidos em **Dados validados** (acertos), **Ajustes de forma** (formatação ou equivalência, sem mudar o valor comercial) e **Corrigidos (IA)** (erros substituídos na conferência). A barra colorida resume a proporção de cada faixa.',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_4_PERFORMANCE,
                  calloutDepois: {
                    tipo: 'dica',
                    texto:
                      'Passe o mouse sobre **cada bloco** do painel para abrir o **tooltip** com o detalhamento da categoria e os percentuais.',
                  },
                },
              ],
            },
            {
              indice: 1,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_4_TEMPO_TOTAL,
                  paragrafoAntes:
                    'O card **Tempo total da leitura** exibe em **HH : MM : SS** quanto durou a análise desta leitura — abaixo do relógio, a contagem de **documentos** e **campos** processados.',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_4_DOWNLOAD_PACOTE,
                  paragrafoAntes:
                    'Na seção **Resultado das leituras**, baixe o **pacote ZIP** (formato DATI) de cada documento com **Baixar pacote docs**, ou use **Baixar selecionados** / **Baixar todos** na barra inferior.',
                  calloutDepois: {
                    tipo: 'dica',
                    texto:
                      'Vários documentos na mesma leitura? Marque **Selecionar todos** e depois **Baixar selecionados** ou **Baixar todos** para exportar de uma vez.',
                  },
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPORTAR_DOWNLOAD,
                  paragrafoAntes: '**Download** imediato na sua máquina',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_4_ARQUIVOS_BAIXADOS,
                  paragrafoAntes:
                    'Ex.: **arquivos** extraídos do pacote — PDF, JSON, TXT e **Excel** (.xlsx) por documento',
                },
              ],
            },
            {
              indice: 2,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              ampliarInferiorDireito: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_SMART_DOCS_LISTA_EXPORTAR_PLANILHA,
                  paragrafoAntes: 'Ex.: **Excel** (.xlsx) aberto na planilha',
                },
              ],
            },
          ],
        },
      ]),
    },
    {
      titulo: 'Configurações',
      tituloSumario: 'Configurações',
      prefixoPassosVisuais: 'Configurações',
      ancoraPassosPrefix: 'configuracoes',
      mostrarMapaSubtopicosPassos: true,
      passosVisuais: PASSOS_MANUAL_SMART_READ_CONFIGURACOES,
    },
    {
      titulo: 'Histórico',
      tituloSumario: 'Histórico',
      prefixoPassosVisuais: 'Histórico',
      ancoraPassosPrefix: 'historico',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'Pelo menu lateral inferior, **Histórico** abre a trilha de auditoria **só do Smart Docs**: filtrada automaticamente para o workspace ativo.',
        'O histórico registra **mudanças que salvam no servidor**. Navegar, filtrar ou exportar a tabela **não** gera nova linha.',
      ],
      callout: {
        tipo: 'dica',
        texto: 'O acesso exige permissão **historico:ver** no workspace.',
      },
      passosVisuais: PASSOS_MANUAL_SMART_READ_HISTORICO,
    },
  ],
}
