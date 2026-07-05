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
 * - tela_pedido_lista_exportar_seta.png → pedido-lista-exportar-seta.png
 * - tela_pedido_lista_exportar_modal.png → pedido-lista-exportar-modal.png
 * - tela_pedido_lista_exportar_planilha.png → pedido-lista-exportar-planilha.png
 * - tela_pedido_lista_exportar_download.png → pedido-lista-exportar-download.png
 * Smart Import (Drive: tela_pedido_lista_novo_pedido_modal_importacao_*):
 * - tela_pedido_lista_novo_seta → pedido-lista-importar-seta-novo.png
 * - tela_pedido_lista_novo_pedido_seta → pedido-lista-importar-seta-novo-pedido.png
 * - tela_pedido_lista_novo_pedido_modal → pedido-lista-importar-seta-importacao.png
 * - tela_pedido_lista_novo_pedido_modal_importacao → pedido-lista-importar-modal.png
 * - tela_pedido_lista_novo_pedido_modal_importacao_passo_1 → pedido-lista-importar-upload.png
 * - tela_pedido_lista_novo_pedido_modal_importacao_passo_1_baixar_modelo_seta → pedido-lista-importar-template.png
 * - tela_pedido_lista_novo_pedido_modal_importacao_selecionar_planilha_seta → pedido-lista-importar-multiplas-abas.png
 * - tela_pedido_lista_novo_pedido_modal_importacao_passo_1_selecionar_pedidos → pedido-lista-importar-analisando.png
 * - tela_pedido_lista_novo_pedido_modal_importacao_passo_2_completo → pedido-lista-importar-mapeamento.png (+ lembrar)
 * - tela_pedido_lista_novo_pedido_modal_importacao_passo_2_select → pedido-lista-importar-confianca.png
 * - tela_pedido_lista_novo_pedido_modal_importacao_passo_2_modal → pedido-lista-importar-memoria.png
 * - tela_pedido_lista_novo_pedido_modal_importacao_passo_2_ver_documento → pedido-lista-importar-ver-documento.png
 * - tela_pedido_lista_novo_pedido_modal_importacao_passo_3_modal → pedido-lista-importar-preview-filtros.png
 * - tela_pedido_lista_novo_pedido_modal_importacao_passo_3_modal_expandido → pedido-lista-importar-preview-card.png
 * - tela_pedido_lista_novo_pedido_modal_importacao_passo_3_modal_expandido_aviso_erro → pedido-lista-importar-duplicata.png
 * - tela_pedido_lista_novo_pedido_modal_importacao_passo_3_modal_expandido_editando → pedido-lista-importar-sobrescrever-diff.png
 * - tela_pedido_lista_novo_pedido_modal_importacao_passo_4 → pedido-lista-importar-resultado.png
 * - tela_pedido_lista_novo_pedido_modal_importacao_tela_final → pedido-lista-importar-erros-csv.png (+ reverter)
 * Transferir (Drive: tela_pedido_lista_transferir_* → pedido-lista-transferir-*.png)
 * Consolidar (Drive: tela_pedido_lista_consolidar_* → pedido-lista-consolidar-*.png)
 * Edição em massa (Drive: tela_pedido_lista_edicao_em_massa_* → pedido-lista-edicao-massa-*.png)
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
const SCREENSHOT_PEDIDO_LISTA_EXPORTAR_SETA = '/university/screenshots/pedido-lista-exportar-seta.png'
const SCREENSHOT_PEDIDO_LISTA_EXPORTAR_MODAL = '/university/screenshots/pedido-lista-exportar-modal.png'
const SCREENSHOT_PEDIDO_LISTA_EXPORTAR_PLANILHA = '/university/screenshots/pedido-lista-exportar-planilha.png'
const SCREENSHOT_PEDIDO_LISTA_EXPORTAR_DOWNLOAD = '/university/screenshots/pedido-lista-exportar-download.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_SETA_NOVO =
  '/university/screenshots/pedido-lista-importar-seta-novo.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_SETA_NOVO_PEDIDO =
  '/university/screenshots/pedido-lista-importar-seta-novo-pedido.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MODAL = '/university/screenshots/pedido-lista-importar-modal.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_UPLOAD = '/university/screenshots/pedido-lista-importar-upload.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_TEMPLATE = '/university/screenshots/pedido-lista-importar-template.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MULTIPLAS_ABAS = '/university/screenshots/pedido-lista-importar-multiplas-abas.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_ANALISANDO = '/university/screenshots/pedido-lista-importar-analisando.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MAPEAMENTO = '/university/screenshots/pedido-lista-importar-mapeamento.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_CONFIANCA = '/university/screenshots/pedido-lista-importar-confianca.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MEMORIA = '/university/screenshots/pedido-lista-importar-memoria.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_LEMBRAR = '/university/screenshots/pedido-lista-importar-lembrar.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_VER_DOCUMENTO = '/university/screenshots/pedido-lista-importar-ver-documento.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_PREVIEW_FILTROS = '/university/screenshots/pedido-lista-importar-preview-filtros.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_PREVIEW_CARD = '/university/screenshots/pedido-lista-importar-preview-card.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_DUPLICATA = '/university/screenshots/pedido-lista-importar-duplicata.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_SOBRESCREVER_DIFF = '/university/screenshots/pedido-lista-importar-sobrescrever-diff.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_RESULTADO = '/university/screenshots/pedido-lista-importar-resultado.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_ERROS_CSV = '/university/screenshots/pedido-lista-importar-erros-csv.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_REVERTER = '/university/screenshots/pedido-lista-importar-reverter.png'
const SCREENSHOT_PEDIDO_LISTA_PAINEIS_SETA = '/university/screenshots/pedido-lista-paineis-seta.png'
const SCREENSHOT_PEDIDO_LISTA_PAINEIS_NOVO_SETA =
  '/university/screenshots/pedido-lista-paineis-novo-seta.png'
const SCREENSHOT_PEDIDO_LISTA_PAINEIS_NOVO_NOME_SETA =
  '/university/screenshots/pedido-lista-paineis-novo-nome-seta.png'
const SCREENSHOT_PEDIDO_LISTA_PAINEIS_NOVO_NOME_VALIDAR =
  '/university/screenshots/pedido-lista-paineis-novo-nome-validar.png'
const SCREENSHOT_PEDIDO_LISTA_PAINEIS_NOVO_NOME_VALIDADO =
  '/university/screenshots/pedido-lista-paineis-novo-nome-validado.png'

const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_COM_SELECAO =
  '/university/screenshots/pedido-lista-transferir-com-selecao-seta.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_ITEM_QTD_SALDO =
  '/university/screenshots/pedido-lista-transferir-item-qtd-inicial-saldo.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_ICONE_INICIAR =
  '/university/screenshots/pedido-lista-transferir-icone-iniciar.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_MODAL_TIPOS =
  '/university/screenshots/pedido-lista-transferir-modal-tipos.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_SETA =
  '/university/screenshots/pedido-lista-transferir-novo-pedido-seta.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_PASSO_2_SETA =
  '/university/screenshots/pedido-lista-transferir-novo-pedido-passo-2-seta.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_PASSO_2_QTD =
  '/university/screenshots/pedido-lista-transferir-novo-pedido-passo-2-qtd.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_PASSO_3_NUMERO =
  '/university/screenshots/pedido-lista-transferir-novo-pedido-passo-3-numero.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_PASSO_4_REVISAO =
  '/university/screenshots/pedido-lista-transferir-novo-pedido-passo-4-revisao.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_PASSO_5_CONFIRMAR =
  '/university/screenshots/pedido-lista-transferir-novo-pedido-passo-5-confirmar.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_PASSO_5_CONFIRMADO =
  '/university/screenshots/pedido-lista-transferir-novo-pedido-passo-5-confirmado.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_EM_TELA =
  '/university/screenshots/pedido-lista-transferir-novo-pedido-em-tela-criado.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_SELECIONAR_1 =
  '/university/screenshots/pedido-lista-transferir-existente-selecionar-1.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_SELECIONAR_2 =
  '/university/screenshots/pedido-lista-transferir-existente-selecionar-2.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_PASSO_1 =
  '/university/screenshots/pedido-lista-transferir-existente-passo-1.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_PASSO_2 =
  '/university/screenshots/pedido-lista-transferir-existente-passo-2.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_PASSO_3 =
  '/university/screenshots/pedido-lista-transferir-existente-passo-3.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_PASSO_3_CONFIRMAR =
  '/university/screenshots/pedido-lista-transferir-existente-passo-3-confirmar.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_PASSO_4 =
  '/university/screenshots/pedido-lista-transferir-existente-passo-4.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_PASSO_5 =
  '/university/screenshots/pedido-lista-transferir-existente-passo-5.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_CONFIRMADO =
  '/university/screenshots/pedido-lista-transferir-existente-confirmado.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_EM_TELA_1 =
  '/university/screenshots/pedido-lista-transferir-existente-em-tela-1.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_EM_TELA_2 =
  '/university/screenshots/pedido-lista-transferir-existente-em-tela-2.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_TELA_1 =
  '/university/screenshots/pedido-lista-transferir-reducao-tela-1.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_TELA_2 =
  '/university/screenshots/pedido-lista-transferir-reducao-tela-2.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_PASSO_1 =
  '/university/screenshots/pedido-lista-transferir-reducao-passo-1.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_PASSO_2 =
  '/university/screenshots/pedido-lista-transferir-reducao-passo-2.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_PASSO_3 =
  '/university/screenshots/pedido-lista-transferir-reducao-passo-3.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_PASSO_4 =
  '/university/screenshots/pedido-lista-transferir-reducao-passo-4.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_PASSO_5 =
  '/university/screenshots/pedido-lista-transferir-reducao-passo-5.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_MODAL_CONFIRMADO =
  '/university/screenshots/pedido-lista-transferir-reducao-modal-confirmado.png'
const SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_MODAL_CONFIRMADO_2 =
  '/university/screenshots/pedido-lista-transferir-reducao-modal-confirmado-2.png'

const SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_BOTAO_COM_SELECAO =
  '/university/screenshots/pedido-lista-consolidar-botao-com-selecao-seta.png'
const SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_1 =
  '/university/screenshots/pedido-lista-consolidar-passo-1-configurar.png'
const SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_2_MODAL =
  '/university/screenshots/pedido-lista-consolidar-passo-2-modal.png'
const SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_2_FILTRO_ORIGEM =
  '/university/screenshots/pedido-lista-consolidar-passo-2-filtro-origem.png'
const SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_2_DADOS_IGUAIS =
  '/university/screenshots/pedido-lista-consolidar-passo-2-dados-iguais.png'
const SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_2_DADOS_DIVERGENTES =
  '/university/screenshots/pedido-lista-consolidar-passo-2-dados-divergentes.png'
const SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_2_DADOS_VAZIOS =
  '/university/screenshots/pedido-lista-consolidar-passo-2-dados-vazios.png'
const SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_2_PROXIMO =
  '/university/screenshots/pedido-lista-consolidar-passo-2-proximo.png'
const SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_3 =
  '/university/screenshots/pedido-lista-consolidar-passo-3-confirmar.png'
const SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_CONCLUIDO_MODAL =
  '/university/screenshots/pedido-lista-consolidar-concluido-modal.png'
const SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_CONCLUIDO_LISTA =
  '/university/screenshots/pedido-lista-consolidar-concluido-lista.png'

const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_SELECAO =
  '/university/screenshots/pedido-lista-edicao-massa-selecao-seta.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_CAMPOS =
  '/university/screenshots/pedido-lista-edicao-massa-campos-a-editar.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_PREVIEW =
  '/university/screenshots/pedido-lista-edicao-massa-preview.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_OPCOES_PEDIDO =
  '/university/screenshots/pedido-lista-edicao-massa-campos-opcoes-pedido.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_OPCOES_ITEM =
  '/university/screenshots/pedido-lista-edicao-massa-campos-opcoes-item.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_OPCOES_COMBINADO =
  '/university/screenshots/pedido-lista-edicao-massa-campos-opcoes-combinado.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_CAMPO_ALFANUMERICO =
  '/university/screenshots/pedido-lista-edicao-massa-campo-alfanumerico.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_CAMPO_SELECT =
  '/university/screenshots/pedido-lista-edicao-massa-campo-select.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_ADICIONAR_CAMPO =
  '/university/screenshots/pedido-lista-edicao-massa-campos-adicionar-campo.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_REVISAO_MODAL =
  '/university/screenshots/pedido-lista-edicao-massa-revisao-modal.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_REVISAO_POR_PEDIDO =
  '/university/screenshots/pedido-lista-edicao-massa-revisao-por-pedido.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_REVISAO_TODOS =
  '/university/screenshots/pedido-lista-edicao-massa-revisao-todos-serao-alterados.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_REVISAO_ALTERADOS =
  '/university/screenshots/pedido-lista-edicao-massa-revisao-com-alteracao.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_REVISAO_SEM_EFEITO =
  '/university/screenshots/pedido-lista-edicao-massa-revisao-sem-alteracao.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_CONFIRMAR =
  '/university/screenshots/pedido-lista-edicao-massa-confirmar.png'
const SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_CONCLUIDO_MODAL =
  '/university/screenshots/pedido-lista-edicao-massa-concluido-modal.png'

const SCREENSHOT_PEDIDO_DASHBOARD_ICONE_ACESSO =
  '/university/screenshots/pedido-dashboard-icone-acesso.png'
const SCREENSHOT_PEDIDO_DASHBOARD_ICONE_TELA_1 =
  '/university/screenshots/pedido-dashboard-icone-tela-principal-1.png'
const SCREENSHOT_PEDIDO_DASHBOARD_ICONE_TELA_2 =
  '/university/screenshots/pedido-dashboard-icone-tela-principal-2.png'
const SCREENSHOT_PEDIDO_DASHBOARD_PAINEIS_SETA =
  '/university/screenshots/pedido-dashboard-paineis-seta.png'
const SCREENSHOT_PEDIDO_DASHBOARD_PAINEIS_NOVO_SETA =
  '/university/screenshots/pedido-dashboard-paineis-novo-seta.png'
const SCREENSHOT_PEDIDO_DASHBOARD_PAINEIS_NOVO_PREENCHIDO =
  '/university/screenshots/pedido-dashboard-paineis-novo-preenchido.png'
const SCREENSHOT_PEDIDO_DASHBOARD_PAINEIS_NOVO_FEITO =
  '/university/screenshots/pedido-dashboard-paineis-novo-feito.png'
const SCREENSHOT_PEDIDO_DASHBOARD_PAINEIS_RENOMEAR_EXCLUIR =
  '/university/screenshots/pedido-dashboard-paineis-renomear-excluir.png'
const SCREENSHOT_PEDIDO_DASHBOARD_PERIODO_SETA =
  '/university/screenshots/pedido-dashboard-periodo-seta.png'
const SCREENSHOT_PEDIDO_DASHBOARD_PERIODO_SELECAO =
  '/university/screenshots/pedido-dashboard-periodo-selecao.png'
const SCREENSHOT_PEDIDO_DASHBOARD_PERIODO_SELECAO_FEITA =
  '/university/screenshots/pedido-dashboard-periodo-selecao-feita.png'
const SCREENSHOT_PEDIDO_DASHBOARD_PERIODO_FILTRO_ATIVO =
  '/university/screenshots/pedido-dashboard-periodo-filtro-ativo.png'
const SCREENSHOT_PEDIDO_DASHBOARD_FILTRO =
  '/university/screenshots/pedido-dashboard-filtro.png'
const SCREENSHOT_PEDIDO_DASHBOARD_FILTROS_SELECAO_WIDGETS =
  '/university/screenshots/pedido-dashboard-filtros-selecao-widgets.png'
const SCREENSHOT_PEDIDO_DASHBOARD_STATUS =
  '/university/screenshots/pedido-dashboard-status.png'
const SCREENSHOT_PEDIDO_DASHBOARD_NOVO_SETA =
  '/university/screenshots/pedido-dashboard-novo-seta.png'
const SCREENSHOT_PEDIDO_DASHBOARD_NOVO_SUGESTOES_SETA =
  '/university/screenshots/pedido-dashboard-novo-sugestoes-seta.png'
const SCREENSHOT_PEDIDO_DASHBOARD_NOVO_SUGESTOES_MODAL =
  '/university/screenshots/pedido-dashboard-novo-sugestoes-modal.png'
const SCREENSHOT_PEDIDO_DASHBOARD_NOVO_SUGESTOES_MODAL_FEITO =
  '/university/screenshots/pedido-dashboard-novo-sugestoes-modal-feito.png'
const SCREENSHOT_PEDIDO_DASHBOARD_NOVO_CRIAR_ZERO_SETA =
  '/university/screenshots/pedido-dashboard-novo-criar-zero-seta.png'
const SCREENSHOT_PEDIDO_DASHBOARD_NOVO_CRIAR_ZERO_MODAL_1 =
  '/university/screenshots/pedido-dashboard-novo-criar-zero-modal-1.png'
const SCREENSHOT_PEDIDO_DASHBOARD_NOVO_CRIAR_ZERO_MODAL_SELECAO =
  '/university/screenshots/pedido-dashboard-novo-criar-zero-modal-selecao.png'
const SCREENSHOT_PEDIDO_DASHBOARD_NOVO_CRIAR_ZERO_MODAL_OPERACAO =
  '/university/screenshots/pedido-dashboard-novo-criar-zero-modal-operacao.png'
const SCREENSHOT_PEDIDO_DASHBOARD_NOVO_CRIAR_ZERO_MODAL_TIPO_GRAFICO =
  '/university/screenshots/pedido-dashboard-novo-criar-zero-modal-tipo-grafico.png'
const SCREENSHOT_PEDIDO_DASHBOARD_NOVO_CRIAR_ZERO_MODAL_TIPO_GRAFICO_FEITO =
  '/university/screenshots/pedido-dashboard-novo-criar-zero-modal-tipo-grafico-feito.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_SETA =
  '/university/screenshots/pedido-dashboard-tres-pontos-seta.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EDITAR_SETA =
  '/university/screenshots/pedido-dashboard-tres-pontos-editar-seta.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EDITAR_MODAL =
  '/university/screenshots/pedido-dashboard-tres-pontos-editar-modal.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EDITAR_MODAL_TITULO =
  '/university/screenshots/pedido-dashboard-tres-pontos-editar-modal-titulo.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EDITAR_MODAL_INDICADOR =
  '/university/screenshots/pedido-dashboard-tres-pontos-editar-modal-indicador.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EDITAR_MODAL_PERIODO =
  '/university/screenshots/pedido-dashboard-tres-pontos-editar-modal-periodo.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EDITAR_MODAL_TIPO_GRAFICO =
  '/university/screenshots/pedido-dashboard-tres-pontos-editar-modal-tipo-grafico.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_MOVER_SETA =
  '/university/screenshots/pedido-dashboard-tres-pontos-mover-seta.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_MOVER_LINHA =
  '/university/screenshots/pedido-dashboard-tres-pontos-mover-linha.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_MOVER_CONCLUIR =
  '/university/screenshots/pedido-dashboard-tres-pontos-mover-concluir.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_MUDAR_TAMANHO_SETA =
  '/university/screenshots/pedido-dashboard-tres-pontos-mudar-tamanho-seta.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_MUDAR_TAMANHO =
  '/university/screenshots/pedido-dashboard-tres-pontos-mudar-tamanho.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_MUDAR_TAMANHO_FEITO =
  '/university/screenshots/pedido-dashboard-tres-pontos-mudar-tamanho-feito.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EXCLUIR_SETA =
  '/university/screenshots/pedido-dashboard-tres-pontos-excluir-seta.png'
const SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EXCLUIDO =
  '/university/screenshots/pedido-dashboard-tres-pontos-excluido.png'
const SCREENSHOT_PEDIDO_DASHBOARD_DETALHAMENTO_GRAFICO_MOUSE =
  '/university/screenshots/pedido-dashboard-detalhamento-grafico-mouse.png'

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
            'Na barra da tabela, abra o menu **Exportar** para baixar o recorte atual — respeita **filtros**, **colunas visíveis** e **página** da lista virtual, no mesmo padrão dos demais produtos Gravity.',
            'No modal, escolha um dos **formatos** permitidos abaixo:',
          ],
          mostrarFormatosExportacaoPedidoLista: true,
          formatosExportacaoPedidoAposParagrafo: 1,
          galeriaComparacaoAposParagrafo: [
            {
              indice: 1,
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EXPORTAR_SETA,
                  paragrafoAntes: '**Abra** o menu **Exportar** na barra',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EXPORTAR_MODAL,
                  paragrafoAntes: '**Escolha** o formato no modal',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EXPORTAR_DOWNLOAD,
                  paragrafoAntes: '**Download** imediato na sua máquina',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EXPORTAR_PLANILHA,
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
          titulo: 'Importar dados',
          tituloCurto: 'Importar',
          paragrafos: [
            'O Smart Import prevê **dois caminhos**: **planilha modelo Gravity** (template `.xlsx` oficial) e **planilha do usuário** (arquivo do fornecedor). **Somente o template está homologado hoje** — o upload de planilha própria está **em breve**.',
          ],
          mostrarInfograficoPedidoListaImportarFormas: true,
          galeriaComparacaoAposCaminhosImportacao: [
            {
              tituloEtapa: '**Etapa 1 — Upload (template oficial):**',
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_SETA_NOVO,
                  paragrafoAntes: '**01.** Na Lista, clique em **+ Novo**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_SETA_NOVO_PEDIDO,
                  paragrafoAntes: '**02.** Escolha **Novo pedido**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MODAL,
                  paragrafoAntes: '**03.** Selecione **Importação**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_TEMPLATE,
                  paragrafoAntes: '**04.** Modal **Importar Pedidos** será aberto',
                },
              ],
            },
            {
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_TEMPLATE,
                  paragrafoAntes: '**05.** **Disponível** — **Baixar template** oficial (.xlsx)',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MULTIPLAS_ABAS,
                  paragrafoAntes: '**06.** Template: escolha a **aba** a importar',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_ANALISANDO,
                  paragrafoAntes: '**07.** **Em breve** — análise de planilha ou PDF do fornecedor',
                },
              ],
            },
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              tituloEtapa: '**Etapa 2 — Mapeamento:**',
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              infograficoMapeamentoImportarColunas: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MEMORIA,
                  paragrafoAntes: '**08.** Modal com o **resultado da importação**',
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
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MAPEAMENTO,
                  calloutAntes: {
                    tipo: 'dica',
                    texto: 'Cada linha liga uma **coluna do arquivo** a um **campo Gravity** — ajuste no dropdown se a IA errar.',
                  },
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_CONFIANCA,
                  calloutAntes: {
                    tipo: 'dica',
                    texto: 'Use a cor da confiança: **≥90%** verde (aceite), **50–89%** amarelo (confira), **<50%** cinza (mapeie ou ignore).',
                  },
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_LEMBRAR,
                  calloutAntes: {
                    tipo: 'dica',
                    texto:
                      'Se você já importou um arquivo com as **mesmas colunas**, o badge **Mapeamento salvo** indica que a memória foi reaplicada.',
                  },
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_VER_DOCUMENTO,
                  calloutAntes: {
                    tipo: 'dica',
                    texto: '**Ver documento** exibe o arquivo original ao lado da tabela — confira o PDF ou a planilha sem sair do modal.',
                  },
                },
              ],
            },
            {
              indice: 0,
              tituloEtapa: '**Etapa 3 — Preview:**',
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_PREVIEW_FILTROS,
                  paragrafoAntes: '**09.** Modal com o **Preview**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_PREVIEW_CARD,
                  paragrafoAntes: '**10.** Preview expandido',
                },
              ],
            },
            {
              indice: 0,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_DUPLICATA,
                  calloutAntes: {
                    tipo: 'dica',
                    texto:
                      'Pedido **já existente** no workspace? O card exibe aviso de **duplicata** — escolha **Sobrescrever**, **Criar novo** ou **Pular**. A decisão vale para todas as linhas daquele número.',
                  },
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_SOBRESCREVER_DIFF,
                  calloutAntes: {
                    tipo: 'dica',
                    texto: 'Ao **Sobrescrever**, o modal exibe o **diff** entre o pedido atual e os dados importados.',
                  },
                },
              ],
            },
            {
              indice: 0,
              tituloEtapa: '**Etapa 4 — Resultado:**',
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_RESULTADO,
                  paragrafoAntes: '**11.** Resultado e **Confirmação**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_ERROS_CSV,
                  paragrafoAntes: '**12.** Conferir na **lista**',
                },
              ],
            },
          ],
          mostrarCaminhosImportacaoPlanilhaPedidoLista: true,
          caminhosImportacaoPlanilhaAposParagrafo: 0,
          calloutAposParagrafo: {
            indice: 0,
            callout: {
              tipo: 'lembrete',
              texto:
                'Prints marcados **Em breve** (upload genérico, PDF, análise IA) ilustram o **caminho da planilha do usuário**, ainda em homologação. O passo a passo abaixo segue o **template oficial** — caminho homologado hoje.',
            },
          },
          callouts: [
            {
              tipo: 'dica',
              texto:
                'Confiança **verde (≥90%)**: aceite sem revisar. **Amarela (50–89%)**: confira o valor de exemplo. **Cinza (<50%)**: mapeie manualmente ou marque como **ignorado** se a coluna não for necessária.',
            },
            {
              tipo: 'dica',
              texto:
                'Pedidos importados nascem em **Rascunho** — revise na Lista e altere o status para **Aberto** quando estiver pronto para operação. A **reversão** só afeta rascunhos; pedidos já abertos permanecem intactos.',
            },
            {
              tipo: 'lembrete',
              texto:
                'Arquivos com **mais de 1.000 linhas** ou próximos do limite de **10 MB** podem ser recusados — divida em lotes menores e importe em sequência.',
            },
          ],
        },
        {
          titulo: 'Painéis',
          tituloCurto: 'Painéis',
          paragrafos: [],
          mostrarInfograficoSmartDocsListaPaineis: true,
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_PAINEIS_NOVO_SETA,
                  paragrafoAntes: '**01.** Clique em **+** na faixa de painéis',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_PAINEIS_NOVO_NOME_SETA,
                  paragrafoAntes:
                    '**02.** Informe um **nome** único (ex.: **Em andamento**, **Por incoterm**, **Saldo aberto**)',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_PAINEIS_NOVO_NOME_VALIDAR,
                  paragrafoAntes: '**03.** Confirme — o nome precisa ser **único** entre seus painéis',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_PAINEIS_NOVO_NOME_VALIDADO,
                  paragrafoAntes:
                    '**04.** Nova aba criada — personalize **filtros** e **colunas** (salva automaticamente no painel ativo)',
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
            'A **Lista** permite **transferir quantidade** de um item para **outro item**, **abrir um novo pedido** com o saldo transferido ou **reduzir a quantidade** do item selecionado sem destino — o foco é ajustar saldo quando a operação real diverge do previsto.',
            'Muitas vezes **exportadores** alteram entregas entre previstas e reais; aqui é o **controle de tudo**. Selecione **um ou mais itens**, clique em **Transferir** e escolha **Novo pedido**, **Pedido existente** ou **Redução simples** — quantidade, revisão e confirmação seguem lógica parecida nos três caminhos.',
          ],
          mostrarInfograficoPedidoListaTransferirFluxo: true,
          transferirInfograficoAposParagrafo: 1,
          galeriaComparacaoAposParagrafo: [
            {
              indice: 1,
              tituloEtapa: '**Início comum (passos 01–04):**',
              mostrarChipsTransferirTresTipos: true,
              textoIntro:
                'Antes de escolher **Novo pedido**, **Pedido existente** ou **Redução simples**, o fluxo é **o mesmo**: selecionar o item na Lista, abrir **Transferir** e só então escolher o tipo no modal (passo **04**).',
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_COM_SELECAO,
                  paragrafoAntes: '**01.** Marque **um ou mais itens**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_ITEM_QTD_SALDO,
                  paragrafoAntes: '**02.** Confira **quantidade inicial** e **saldo** do item',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_ICONE_INICIAR,
                  paragrafoAntes: '**03.** Clique em **Transferir** na barra de ações',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_MODAL_TIPOS,
                  paragrafoAntes: '**04.** Escolha o **tipo de transferência**',
                },
              ],
              calloutApos: [
                {
                  tipo: 'dica',
                  texto:
                    'O botão **Transferir** só fica **habilitado** quando **pelo menos um item** está selecionado na Lista.',
                },
                {
                  tipo: 'dica',
                  texto:
                    'É possível selecionar **vários itens de uma vez** — do **mesmo pedido** ou de **pedidos diferentes** — antes de abrir **Transferir**.',
                },
                {
                  tipo: 'dica',
                  texto:
                    'A partir do **passo 05**, cada tipo segue seu próprio assistente — os três caminhos abaixo partem deste mesmo ponto.',
                },
              ],
            },
            {
              indice: 1,
              tituloEtapa: '**Passo a passo para transferir item(s) para um novo pedido:**',
              chipTransferirTituloEtapa: 'novo',
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_SETA,
                  paragrafoAntes: '**05.** Selecione **Novo pedido**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_PASSO_2_SETA,
                  paragrafoAntes: '**06.** Informe a **quantidade** a transferir',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_PASSO_2_QTD,
                  paragrafoAntes: '**07.** Quantidade preenchida no campo',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_PASSO_3_NUMERO,
                  paragrafoAntes: '**08.** Defina o **número do novo PO**',
                },
              ],
            },
            {
              indice: 1,
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_PASSO_4_REVISAO,
                  paragrafoAntes: '**09.** **Revisão** antes de confirmar',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_PASSO_5_CONFIRMAR,
                  paragrafoAntes: '**10.** Clique em **Confirmar**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_PASSO_5_CONFIRMADO,
                  paragrafoAntes: '**11.** Transferência **confirmada** no modal',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_NOVO_PEDIDO_EM_TELA,
                  paragrafoAntes: '**12.** **Novo pedido** visível na Lista',
                },
              ],
            },
            {
              indice: 1,
              infograficoTransferirResultadoEsperado: 'novo',
              telas: [],
            },
            {
              indice: 1,
              tituloEtapa: '**Passo a passo para transferir item(s) para um pedido existente:**',
              chipTransferirTituloEtapa: 'existente',
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_SELECIONAR_1,
                  paragrafoAntes: '**05.** Selecione a opção **Pedido existente**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_SELECIONAR_2,
                  paragrafoAntes: '**06.** Selecione o **pedido de destino**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_PASSO_1,
                  paragrafoAntes: '**07.** Clique em **Próximo**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_PASSO_2,
                  paragrafoAntes: '**08.** Ajuste a **quantidade**',
                },
              ],
            },
            {
              indice: 1,
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_PASSO_3,
                  paragrafoAntes: '**09.** Revise a **transferência**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_PASSO_3_CONFIRMAR,
                  paragrafoAntes: '**10.** Clique em **Transferir**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_PASSO_4,
                  paragrafoAntes: '**11.** Resumo da operação',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_PASSO_5,
                  paragrafoAntes: '**12.** Clique em **Confirmar**',
                },
              ],
            },
            {
              indice: 1,
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_CONFIRMADO,
                  paragrafoAntes: '**13.** Transferência **confirmada**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_EM_TELA_1,
                  paragrafoAntes: '**14.** **Origem** — confira saldo e qtd. inicial na Lista',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_EXISTENTE_EM_TELA_2,
                  paragrafoAntes: '**15.** **Destino** — confira saldo após receber a transferência',
                },
              ],
            },
            {
              indice: 1,
              infograficoTransferirResultadoEsperado: 'existente',
              telas: [],
            },
            {
              indice: 1,
              tituloEtapa: '**Passo a passo para reduzir quantidade de itens de um pedido:**',
              chipTransferirTituloEtapa: 'reducao',
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_TELA_1,
                  paragrafoAntes: '**05.** Selecione a opção **Redução simples**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_TELA_2,
                  paragrafoAntes: '**06.** Clique em **Transferir**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_PASSO_1,
                  paragrafoAntes: '**07.** Item e saldo atual',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_PASSO_2,
                  paragrafoAntes: '**08.** Informe quanto **reduzir**',
                },
              ],
            },
            {
              indice: 1,
              colunas: 4,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_PASSO_3,
                  paragrafoAntes: '**09.** Revisão do impacto no saldo',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_PASSO_4,
                  paragrafoAntes: '**10.** Resumo antes de confirmar',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_PASSO_5,
                  paragrafoAntes: '**11.** Conclusão do assistente',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_MODAL_CONFIRMADO,
                  paragrafoAntes: '**12.** Redução **confirmada** no modal',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_TRANSFERIR_REDUCAO_MODAL_CONFIRMADO_2,
                  paragrafoAntes: '**13.** Saldo atualizado na **Lista** após a redução',
                },
              ],
            },
            {
              indice: 1,
              infograficoTransferirResultadoEsperado: 'reducao',
              telas: [],
            },
          ],
        },
        {
          titulo: 'Consolidar pedidos',
          tituloCurto: 'Consolidar',
          paragrafos: [
            '**Consolidar** une **dois ou mais pedidos** em um único PO, útil quando o mesmo fornecedor ou fluxo comercial permite agrupar linhas. A consolidação ocorre normalmente para iniciar a próxima etapa, que é o **embarque**.',
          ],
          calloutAposParagrafo: {
            indice: 0,
            callout: {
              tipo: 'aviso',
              texto:
                'Não é possível consolidar pedidos de **importação** e **exportação**.',
            },
          },
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_BOTAO_COM_SELECAO,
                  paragrafoAntes: '**01.** Com **dois ou mais pedidos** marcados, clique em **Consolidar**',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_1,
                  paragrafoAntes:
                    '**02.** Defina o **número do PO consolidado** e confira na **prévia** a quantidade de **pedidos**, **itens**, **inteiros** e **parciais** que serão consolidados',
                },
              ],
              calloutApos: {
                tipo: 'dica',
                texto:
                  'Com **Fundir itens** ativo, linhas com o mesmo **part number** viram **uma única linha** no PO novo, somando quantidades; sem a opção, todos os itens são **copiados** para o consolidado.',
              },
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_2_MODAL,
                  paragrafoAntes: '**03.** **Comparar pedidos consolidados**',
                },
              ],
              calloutApos: [
                {
                  tipo: 'dica',
                  texto:
                    'Use os filtros **Todos**, **Divergentes**, **Iguais** e **Vazios** para navegar rápido. Divergentes já vêm com **valor sugerido**; altere no dropdown se precisar.',
                },
                {
                  tipo: 'dica',
                  texto:
                    'O PO consolidado herda campos **iguais** + **escolhas do passo 2** + base do **primeiro pedido** da seleção; **valor total** = soma dos origens.',
                },
              ],
            },
            {
              indice: 0,
              infograficoConsolidarPasso2Regras: true,
              telas: [],
            },
            {
              indice: 0,
              layoutConsolidarExemplosPasso2: true,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_2_FILTRO_ORIGEM,
                  chipConsolidarExemplo: 'filtro_origem',
                  paragrafoAntes: 'Filtro por **pedido de origem** para focar conflitos de um PO específico',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_2_DADOS_IGUAIS,
                  chipConsolidarExemplo: 'igual',
                  paragrafoAntes: 'Campo **igual**, mesmo valor em **todos os pedidos e itens**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_2_DADOS_DIVERGENTES,
                  chipConsolidarExemplo: 'divergente',
                  paragrafoAntes: 'Campo **divergente**, campos **diferentes entre pedidos**. Seleção de qual prevalece',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_2_DADOS_VAZIOS,
                  chipConsolidarExemplo: 'vazio',
                  paragrafoAntes: 'Campo **vazio**, sem dado nos **pedidos selecionados**',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_PASSO_3,
                  paragrafoAntes: '**04.** Revise o resumo e clique em **Confirmar**',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_CONCLUIDO_MODAL,
                  paragrafoAntes: '**05.** Consolidação **concluída** no modal',
                },
              ],
            },
            {
              indice: 0,
              tituloEtapa: '**Resultado na Lista:**',
              layoutConsolidarResultadoUnificado: true,
              infograficoConsolidarResultadoEsperado: true,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_CONSOLIDAR_CONCLUIDO_LISTA,
                  paragrafoAntes: '**06.** Na Lista, o **PO consolidado** aparece com status **Consolidado**. Os pedidos de origem **deixam a grade principal**; ao **expandir** a linha, você vê quais POs foram unidos',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Edição em massa',
          tituloCurto: 'Edição em massa',
          paragrafos: [
            'Edite **diversos campos** de uma só vez na **lista** de **pedidos e itens**.',
          ],
          calloutAposParagrafo: {
            indice: 0,
            callout: {
              tipo: 'dica',
              texto:
                'Você pode selecionar **pedidos inteiros**, **itens avulsos** ou **mistura dos dois**. O modal adapta o escopo. **Colunas criadas pelo usuário** também entram na edição.',
            },
          },
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_SELECAO,
                  paragrafoAntes: '**01.** Com os pedidos e itens que deseja editar, clique em **Editar em Massa**',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_CAMPOS,
                  paragrafoAntes: '**02.** Escolha o **campo** que deseja editar',
                },
              ],
            },
            {
              indice: 0,
              infograficoEdicaoMassaPasso1Regras: true,
              mostrarCatalogoEdicaoMassaPedidoLista: true,
              telas: [],
            },
            {
              indice: 0,
              layoutEdicaoMassaExemplosPasso1: true,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_OPCOES_PEDIDO,
                  chipEdicaoMassaExemplo: 'nivel_pedido',
                  paragrafoAntes: 'Edição campos do **Pedido**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_OPCOES_ITEM,
                  chipEdicaoMassaExemplo: 'nivel_item',
                  paragrafoAntes: 'Edição de campos do **Item**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_OPCOES_COMBINADO,
                  chipEdicaoMassaExemplo: 'nivel_combinado',
                  paragrafoAntes: 'Campos de **Pedidos** e **Itens**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_CAMPO_ALFANUMERICO,
                  chipEdicaoMassaExemplo: 'tipo_texto',
                  paragrafoAntes: 'Campo **texto** — operação **substituir**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_CAMPO_SELECT,
                  chipEdicaoMassaExemplo: 'tipo_select',
                  paragrafoAntes: 'Campo **select** — dropdown com opções válidas (Incoterm, moeda, status…)',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_ADICIONAR_CAMPO,
                  chipEdicaoMassaExemplo: 'adicionar_campo',
                  paragrafoAntes: '**+ Adicionar campo** — inclua mais linhas de edição no mesmo lote',
                },
              ],
              calloutApos: [
                {
                  tipo: 'dica',
                  texto:
                    'Uma vez selecionado o **campo**, as opções de preenchimento seguem o padrão do sistema: **texto**, **número**, **select**, **data** e demais tipos.',
                },
                {
                  tipo: 'dica',
                  texto:
                    'É possível editar **mais de um campo** de uma vez: use **+ Adicionar campo** para incluir outra linha no mesmo lote.',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_PREVIEW,
                  paragrafoAntes: '**03.** **Preview** em tempo real — DE/PARA por pedido (debounce ~300 ms)',
                },
              ],
              calloutApos: {
                tipo: 'dica',
                texto:
                  'Se o valor já é **igual** em todos os pedidos, aparece **Múltiplos valores**. Revise antes de avançar. Com **dois ou mais pedidos** selecionados, campos **únicos** (como o **Nº do Pedido**) ficam **bloqueados** na operação **Substituir**.',
              },
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_REVISAO_MODAL,
                  paragrafoAntes: '**04.** Passo 2 — **Revisão** com pills de resumo (pedidos · itens · campos)',
                },
              ],
            },
            {
              indice: 0,
              infograficoEdicaoMassaPasso2Regras: true,
              telas: [],
            },
            {
              indice: 0,
              layoutEdicaoMassaExemplosPasso2: true,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_REVISAO_POR_PEDIDO,
                  chipEdicaoMassaExemplo: 'filtro_por_pedido',
                  paragrafoAntes: 'Filtro por **pedido de origem** — foco no DE/PARA de um PO',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_REVISAO_TODOS,
                  chipEdicaoMassaExemplo: 'filtro_todos',
                  paragrafoAntes: 'Filtro **Todos** — visão completa, inclusive linhas **sem efeito**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_REVISAO_ALTERADOS,
                  chipEdicaoMassaExemplo: 'filtro_alterados',
                  paragrafoAntes: 'Filtro **Alterados** — só registros que **mudam de fato**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_REVISAO_SEM_EFEITO,
                  chipEdicaoMassaExemplo: 'filtro_sem_efeito',
                  paragrafoAntes: 'Filtro **Sem efeito** — valor novo **igual ao atual** (não grava)',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_CONFIRMAR,
                  paragrafoAntes: '**05.** Revise e clique em **Confirmar**',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_LISTA_EDICAO_MASSA_CONCLUIDO_MODAL,
                  paragrafoAntes: '**06.** Edição **concluída** no modal (passo 3 — Resultado)',
                },
              ],
            },
            {
              indice: 0,
              infograficoEdicaoMassaResultadoEsperado: true,
              telas: [],
            },
          ],
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
      prefixoPassosVisuais: 'Dashboard',
      ancoraPassosPrefix: 'dashboard',
      mostrarMapaSubtopicosPassos: true,
      passosVisuais: renumerarPassos([
        {
          titulo: 'Visão geral',
          tituloCurto: 'Visão geral',
          imagem: SCREENSHOT_PEDIDO_DASHBOARD,
          imagemAbaixoTexto: true,
          paragrafos: [
            'O **Dashboard** é o painel de **BI personalizado** do Pedido: monte **widgets** (KPIs, gráficos de linha, barras, área e distribuição) a partir dos pedidos do workspace. Cada usuário salva **painéis**, **layout** e **filtros** próprios — sem alterar a visualização dos colegas.',
            'A barra superior concentra **período**, **status**, **filtros globais**, **visibilidade dos widgets** e o botão **+** para adicionar novos blocos. Os **KPIs fixos** no topo refletem o recorte atual; abaixo, a grade aceita redimensionar, mover e editar cada widget.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 3,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_ICONE_ACESSO,
                  paragrafoAntes: 'Abra a aba **Dashboard** no topo do Pedido',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_ICONE_TELA_1,
                  paragrafoAntes: 'Visão com **KPIs** e grade de widgets',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_ICONE_TELA_2,
                  paragrafoAntes: 'Painel montado com **gráficos** e **tabelas**',
                },
              ],
            },
          ],
          calloutAposParagrafo: {
            indice: 1,
            callout: {
              tipo: 'dica',
              texto:
                'O **período** escolhido no Dashboard pode **sincronizar** com o das abas **Insights** e **Lista** quando você usa os atalhos padrão — widgets individuais podem ter **período próprio** na edição.',
            },
          },
        },
        {
          titulo: 'Painéis',
          tituloCurto: 'Painéis',
          paragrafos: [
            'Assim como na **Lista**, o Dashboard usa **painéis** (abas) para guardar recortes diferentes: um painel **Operação**, outro **Financeiro**, outro **Por fornecedor**, cada um com widgets e filtros próprios.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_PAINEIS_SETA,
                  paragrafoAntes: '**01.** A faixa de **painéis** fica abaixo da barra de ferramentas',
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
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_PAINEIS_NOVO_SETA,
                  paragrafoAntes: 'Clique em **+** para **novo painel**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_PAINEIS_NOVO_PREENCHIDO,
                  paragrafoAntes: 'Informe um **nome** único',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_PAINEIS_NOVO_FEITO,
                  paragrafoAntes: 'Painel **criado** — monte widgets e filtros nele',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_PAINEIS_RENOMEAR_EXCLUIR,
                  paragrafoAntes: 'Menu do painel: **renomear** ou **excluir**',
                },
              ],
            },
          ],
          callout: {
            tipo: 'dica',
            texto:
              'Filtros de **período**, **status** e **widgets visíveis** ficam **salvos no painel ativo** — ao trocar de aba, cada painel restaura seu próprio recorte.',
          },
        },
        {
          titulo: 'Período, status e filtros',
          tituloCurto: 'Período e filtros',
          paragrafos: [
            'A barra do Dashboard aplica recortes **globais** a todos os widgets que não usam período próprio. Combine **período**, **status** e **filtros adicionais** para refinar o que entra nos gráficos.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_PERIODO_SETA,
                  paragrafoAntes: '**01.** Abra o seletor de **Período** na barra',
                },
              ],
            },
            {
              indice: 0,
              colunas: 3,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_PERIODO_SELECAO,
                  paragrafoAntes: 'Escolha um **intervalo** (7 dias, 30 dias, trimestre, personalizado…)',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_PERIODO_SELECAO_FEITA,
                  paragrafoAntes: 'Período **aplicado** — KPIs e widgets recalculam',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_PERIODO_FILTRO_ATIVO,
                  paragrafoAntes: 'Chip de **período ativo** na barra inferior',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_STATUS,
                  paragrafoAntes: '**02.** Filtro de **Status** — marque um ou vários status de pedido',
                },
              ],
            },
            {
              indice: 0,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_FILTRO,
                  paragrafoAntes: '**Filtros** adicionais por campo do catálogo',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_FILTROS_SELECAO_WIDGETS,
                  paragrafoAntes: 'Menu **Widgets** — exibir, ocultar e **reordenar** blocos da grade',
                },
              ],
            },
          ],
          callout: {
            tipo: 'dica',
            texto:
              'Dois ou mais filtros ativos geram **chips** na barra inferior. Use **Limpar** para resetar o recorte sem trocar de painel.',
          },
        },
        {
          titulo: 'Adicionar widget',
          tituloCurto: 'Adicionar widget',
          paragrafos: [
            'Use o botão **+** na barra para incluir widgets. Há dois caminhos: **Explorar sugestões** (atalhos prontos com base no catálogo do Pedido) ou **Criar do zero** (monte a consulta campo a campo).',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_NOVO_SETA,
                  paragrafoAntes: '**01.** Clique em **+** na barra do Dashboard',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_NOVO_SUGESTOES_SETA,
                  paragrafoAntes: '**02.** Escolha **Explorar sugestões**',
                },
              ],
            },
            {
              indice: 0,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_NOVO_SUGESTOES_MODAL,
                  paragrafoAntes: 'Modal com **sugestões** prontas (KPI, linha, barras, distribuição…)',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_NOVO_SUGESTOES_MODAL_FEITO,
                  paragrafoAntes: 'Widget **adicionado** à grade após confirmar',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_NOVO_CRIAR_ZERO_SETA,
                  paragrafoAntes: '**03.** Ou escolha **Criar do zero** no mesmo menu **+**',
                },
              ],
            },
            {
              indice: 0,
              colunas: 3,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_NOVO_CRIAR_ZERO_MODAL_1,
                  paragrafoAntes: 'Passo 1 — escolha **campos** do catálogo do Pedido',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_NOVO_CRIAR_ZERO_MODAL_SELECAO,
                  paragrafoAntes: 'Campos **selecionados** para a consulta',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_NOVO_CRIAR_ZERO_MODAL_OPERACAO,
                  paragrafoAntes: 'Defina a **operação** por campo (soma, contagem, média…)',
                },
              ],
            },
            {
              indice: 0,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_NOVO_CRIAR_ZERO_MODAL_TIPO_GRAFICO,
                  paragrafoAntes: 'Escolha o **tipo de gráfico** (KPI, linha, barras, área, pizza…)',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_NOVO_CRIAR_ZERO_MODAL_TIPO_GRAFICO_FEITO,
                  paragrafoAntes: 'Widget **criado** e posicionado na grade',
                },
              ],
            },
          ],
          callout: {
            tipo: 'dica',
            texto:
              'Sugestões **complementares** aparecem conforme você já tem widgets no painel — acelera montar visões correlatas (ex.: volume por status + evolução temporal).',
          },
        },
        {
          titulo: 'Menu do widget',
          tituloCurto: 'Menu do widget',
          paragrafos: [
            'Cada widget na grade expõe o menu **⋮** (três pontos) no canto. Por ele você **edita** a consulta, **move** na grade, **redimensiona** ou **exclui** o bloco.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_SETA,
                  paragrafoAntes: '**01.** Clique em **⋮** no widget desejado',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EDITAR_SETA,
                  paragrafoAntes: '**02.** **Editar** — abre o modal de configuração',
                },
              ],
            },
            {
              indice: 0,
              colunas: 3,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EDITAR_MODAL,
                  paragrafoAntes: 'Visão geral do **modal de edição**',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EDITAR_MODAL_TITULO,
                  paragrafoAntes: 'Aba **Título** — renomeie o widget',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EDITAR_MODAL_INDICADOR,
                  paragrafoAntes: 'Aba **Indicadores** — campos e operações',
                },
              ],
            },
            {
              indice: 0,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EDITAR_MODAL_PERIODO,
                  paragrafoAntes: 'Aba **Período** — intervalo **próprio** do widget',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EDITAR_MODAL_TIPO_GRAFICO,
                  paragrafoAntes: 'Aba **Tipo de gráfico** — altere visualização',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_MOVER_SETA,
                  paragrafoAntes: '**03.** **Mover** — rearranja a posição na grade',
                },
              ],
            },
            {
              indice: 0,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_MOVER_LINHA,
                  paragrafoAntes: 'Arraste para a **linha** desejada',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_MOVER_CONCLUIR,
                  paragrafoAntes: 'Posição **confirmada** na grade',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_MUDAR_TAMANHO_SETA,
                  paragrafoAntes: '**04.** **Mudar tamanho** — redimensione o widget',
                },
              ],
            },
            {
              indice: 0,
              colunas: 2,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_MUDAR_TAMANHO,
                  paragrafoAntes: 'Arraste a **borda** para ampliar ou reduzir',
                },
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_MUDAR_TAMANHO_FEITO,
                  paragrafoAntes: 'Novo **tamanho** aplicado',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EXCLUIR_SETA,
                  paragrafoAntes: '**05.** **Excluir** — remove o widget do painel',
                },
              ],
            },
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_TRES_PONTOS_EXCLUIDO,
                  paragrafoAntes: 'Widget **removido** — layout salvo automaticamente',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Detalhamento do gráfico',
          tituloCurto: 'Detalhamento',
          paragrafos: [
            'Em gráficos de **linha**, **barras** e **área**, passe o **mouse** sobre um ponto ou barra para ver o **detalhamento** do valor: data, campo, operação e total no recorte atual.',
          ],
          galeriaComparacaoAposParagrafo: [
            {
              indice: 0,
              colunas: 1,
              textoAcimaEstiloCorpo: true,
              telas: [
                {
                  legenda: '',
                  imagem: SCREENSHOT_PEDIDO_DASHBOARD_DETALHAMENTO_GRAFICO_MOUSE,
                  paragrafoAntes: '**Tooltip** ao passar o mouse sobre o gráfico',
                },
              ],
            },
          ],
        },
      ]),
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
