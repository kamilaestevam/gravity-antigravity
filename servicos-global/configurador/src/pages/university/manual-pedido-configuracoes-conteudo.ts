/**
 * Manual Pedido §08 Configuracoes — gerado por scripts/gerar-manual-pedido-configuracoes.mjs
 * Regere apos adicionar prints no Drive: node scripts/gerar-manual-pedido-configuracoes.mjs
 */
import type { DocPassoVisual } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const CALLOUT_SALVAR_CONFIGURACOES = {
  tipo: 'dica' as const,
  texto: 'É obrigatório salvar as modificações clicando em {{botao:salvar-configuracoes}}',
}

export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_ADICIONAR = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-adicionar.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_ADICIONAR_VER_DETALHES = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-adicionar-ver-detalhes.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_ADICIONAR_VER_DETALHES_ABERTO = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-adicionar-ver-detalhes-aberto.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_OCULTADO = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-ocultado.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_OCULTADO_EXIBIDO = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-ocultado-exibido.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_OCULTADO_EXIBIR = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-ocultado-exibir.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_OCULTAR_SETA = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-ocultar-seta.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_ATIVAR_FLUXO_1 = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-remover-ativar-fluxo-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_ATIVAR_FLUXO_2 = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-remover-ativar-fluxo-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_ATIVAR_FLUXO_3 = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-remover-ativar-fluxo-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_INFORMACAO = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-remover-informacao.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_INFORMACAO_DETALHES = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-remover-informacao-detalhes.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_LISTA_CARD_LISTA = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-remover-lista-card-lista.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_LISTA_SALVAR = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-remover-lista-salvar.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_LISTA_SALVAR_CONFIRMACAO_1 = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-remover-lista-salvar-confirmacao-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_LISTA_SALVAR_CONFIRMACAO_2 = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-remover-lista-salvar-confirmacao-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_LISTA_SALVAR_CONFIRMACAO_NAO_ESTA_TELA_LISTA = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-remover-lista-salvar-confirmacao-nao-esta-tela-lista.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_LISTA_SETA = '/university/screenshots/pedido-configuracoes-cards-ativos-disponiveis-remover-lista-seta.png'
export const SCREENSHOT_PEDIDO_CONFIG_CARDS_PERIODO_COMPARACAO = '/university/screenshots/pedido-configuracoes-cards-periodo-comparacao.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CAMPOS_CALCULADOS = '/university/screenshots/pedido-configuracoes-colunas-campos-calculados.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CASAS_DECIMAIS = '/university/screenshots/pedido-configuracoes-colunas-casas-decimais.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CASAS_DECIMAIS_EDITAR_1 = '/university/screenshots/pedido-configuracoes-colunas-casas-decimais-editar-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CASAS_DECIMAIS_EDITAR_2 = '/university/screenshots/pedido-configuracoes-colunas-casas-decimais-editar-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CASAS_DECIMAIS_EDITAR_3 = '/university/screenshots/pedido-configuracoes-colunas-casas-decimais-editar-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CASAS_DECIMAIS_EDITAR_4 = '/university/screenshots/pedido-configuracoes-colunas-casas-decimais-editar-4.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CASAS_DECIMAIS_EDITAR_5 = '/university/screenshots/pedido-configuracoes-colunas-casas-decimais-editar-5.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_FORMATO_DATA = '/university/screenshots/pedido-configuracoes-colunas-formato-data.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_FORMATO_DATA_FLUXO_1 = '/university/screenshots/pedido-configuracoes-colunas-formato-data-fluxo-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_FORMATO_DATA_FLUXO_2 = '/university/screenshots/pedido-configuracoes-colunas-formato-data-fluxo-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_FORMATO_DATA_FLUXO_3 = '/university/screenshots/pedido-configuracoes-colunas-formato-data-fluxo-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS = '/university/screenshots/pedido-configuracoes-colunas-personalizadas.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_1 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_2 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_CHECKBOX_1 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-checkbox-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_CHECKBOX_2 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-checkbox-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_CHECKBOX_3 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-checkbox-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_DATA_1 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-data-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_DATA_2 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-data-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_DATA_3 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-data-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_LISTA_1 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-lista-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_LISTA_2 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-lista-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_LISTA_3 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-lista-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_LISTA_4 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-lista-4.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_NUMERO_1 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-numero-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_NUMERO_2 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-numero-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_NUMERO_3 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-numero-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_PERCENTUAL_1 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-percentual-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_PERCENTUAL_2 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-percentual-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_PERCENTUAL_3 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-percentual-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TEXTO = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-texto.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TEXTO_1 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-texto-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TEXTO_NA_TELA = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-texto-na-tela.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TIPO_DOCUMENTO_1 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-tipo-documento-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TIPO_DOCUMENTO_2 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-tipo-documento-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TIPO_DOCUMENTO_3 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-tipo-documento-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TIPO_FORMULA_1 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-tipo-formula-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TIPO_FORMULA_2 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-tipo-formula-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TIPO_FORMULA_3 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-tipo-formula-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TIPO_FORMULA_4 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-criar-coluna-tipo-formula-4.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_EDITAR_COLUNA_1 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-editar-coluna-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_EDITAR_COLUNA_3 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-editar-coluna-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_EXCLUIR_COLUNA_1 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-excluir-coluna-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_EXCLUIR_COLUNA_2 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-excluir-coluna-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_EXCLUIR_COLUNA_3 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-excluir-coluna-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_EXCLUIR_COLUNA_4 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-excluir-coluna-4.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_OCULTAR_COLUNA_1 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-ocultar-coluna-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_OCULTAR_COLUNA_2 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-ocultar-coluna-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_OCULTAR_COLUNA_4 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-ocultar-coluna-4.png'
export const SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_OCULTAR_COLUNA_5 = '/university/screenshots/pedido-configuracoes-colunas-personalizadas-ocultar-coluna-5.png'
export const SCREENSHOT_PEDIDO_CONFIG_KANBAN_CARD_1 = '/university/screenshots/pedido-configuracoes-kanban-card-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_KANBAN_CARD_2 = '/university/screenshots/pedido-configuracoes-kanban-card-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_KANBAN_CARD_3 = '/university/screenshots/pedido-configuracoes-kanban-card-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_KANBAN_CARD_4 = '/university/screenshots/pedido-configuracoes-kanban-card-4.png'
export const SCREENSHOT_PEDIDO_CONFIG_KANBAN_COLUNAS = '/university/screenshots/pedido-configuracoes-kanban-colunas.png'
export const SCREENSHOT_PEDIDO_CONFIG_KANBAN_COLUNAS_1 = '/university/screenshots/pedido-configuracoes-kanban-colunas-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_KANBAN_COLUNAS_2 = '/university/screenshots/pedido-configuracoes-kanban-colunas-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_KANBAN_COLUNAS_3 = '/university/screenshots/pedido-configuracoes-kanban-colunas-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_KANBAN_COLUNAS_4 = '/university/screenshots/pedido-configuracoes-kanban-colunas-4.png'
export const SCREENSHOT_PEDIDO_CONFIG_KANBAN_MODAL_1 = '/university/screenshots/pedido-configuracoes-kanban-modal-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_KANBAN_MODAL_2 = '/university/screenshots/pedido-configuracoes-kanban-modal-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_KANBAN_MODAL_3 = '/university/screenshots/pedido-configuracoes-kanban-modal-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_KANBAN_MODAL_4 = '/university/screenshots/pedido-configuracoes-kanban-modal-4.png'
export const SCREENSHOT_PEDIDO_CONFIG_NUMERACAO = '/university/screenshots/pedido-configuracoes-numeracao.png'
export const SCREENSHOT_PEDIDO_CONFIG_STATUS_1 = '/university/screenshots/pedido-configuracoes-status-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_STATUS_2 = '/university/screenshots/pedido-configuracoes-status-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_STATUS_3 = '/university/screenshots/pedido-configuracoes-status-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_STATUS_4 = '/university/screenshots/pedido-configuracoes-status-4.png'
export const SCREENSHOT_PEDIDO_CONFIG_STATUS_5 = '/university/screenshots/pedido-configuracoes-status-5.png'
export const SCREENSHOT_PEDIDO_CONFIG_STATUS_6 = '/university/screenshots/pedido-configuracoes-status-6.png'
export const SCREENSHOT_PEDIDO_CONFIG_STATUS_7 = '/university/screenshots/pedido-configuracoes-status-7.png'
export const SCREENSHOT_PEDIDO_CONFIG_STATUS_ARRASTAR_1 = '/university/screenshots/pedido-configuracoes-status-arrastar-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_STATUS_ARRASTAR_2 = '/university/screenshots/pedido-configuracoes-status-arrastar-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_STATUS_NOVO_1 = '/university/screenshots/pedido-configuracoes-status-novo-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_STATUS_NOVO_2 = '/university/screenshots/pedido-configuracoes-status-novo-2.png'
export const SCREENSHOT_PEDIDO_CONFIG_STATUS_NOVO_3 = '/university/screenshots/pedido-configuracoes-status-novo-3.png'
export const SCREENSHOT_PEDIDO_CONFIG_STATUS_NOVO_4 = '/university/screenshots/pedido-configuracoes-status-novo-4.png'
export const SCREENSHOT_PEDIDO_CONFIG_TABELA_LINHAS_PAGINA = '/university/screenshots/pedido-configuracoes-tabela-linhas-pagina.png'
export const SCREENSHOT_PEDIDO_CONFIG_TABELA_LINHAS_PAGINA_1 = '/university/screenshots/pedido-configuracoes-tabela-linhas-pagina-1.png'
export const SCREENSHOT_PEDIDO_CONFIG_TABELA_PEDIDOS_EM_ATRASO_VERMELHO = '/university/screenshots/pedido-configuracoes-tabela-pedidos-em-atraso-vermelho.png'
export const SCREENSHOT_PEDIDO_CONFIG_TELA_PRINCIPAL = '/university/screenshots/pedido-configuracoes-tela-principal.png'

function renumerarPassosConfig(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => {
    const tituloCurto = passo.tituloCurto?.trim()
    // Tópicos do menu (sem ocultarNoSumario) → H2 visível no corpo, como «O que é».
    // Sub-passos ocultos do menu → rotuloPasso maiúsculo + borda lateral.
    const usarSubtituloGuia = Boolean(
      tituloCurto
      && !passo.rotuloPasso
      && passo.ocultarNoSumario,
    )
    return {
      ...passo,
      num: i + 1,
      ...(usarSubtituloGuia
        ? { rotuloPasso: tituloCurto, ocultarTituloPasso: true }
        : {}),
    }
  })
}

export const PASSOS_MANUAL_PEDIDO_CONFIGURACOES: DocPassoVisual[] = renumerarPassosConfig([
    {
      titulo: 'O que é',
      tituloCurto: 'O que é',
      paragrafos: [
        'No menu lateral, **Configurações** reúne as preferências do produto no workspace: **Cards**, **Tabela**, **Colunas**, **Kanban**, **Status**, **Numeração** e **Templates PDF**. Cada aba afeta a visualização ou regras do Pedido para todos os usuários do workspace (salvo cards e colunas da lista, que são por usuário).',
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 1,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_TELA_PRINCIPAL,
              paragrafoAntes: "Abra **Configurações** no menu lateral do Pedido",
            },
          ],
        },
      ],
    },
    {
      titulo: 'Cards',
      tituloCurto: 'Cards',
      paragrafos: [
        "Em **Cards**, o **período de comparação** define o recorte usado nos indicadores de tendência dos cards ativos no topo da **Lista** e **Insights**.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 1,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_PERIODO_COMPARACAO,
              paragrafoAntes: "Escolha **7 dias**, **30 dias**, **6 meses**, **1 ano** ou **Tudo**",
            },
          ],
        },
      ],
    },
    {
      titulo: "Cards — adicionar",
      tituloCurto: "Adicionar card",
      ocultarNoSumario: true,
      paragrafos: [
        "Na lista **Disponíveis para adicionar**, clique em **+** para incluir um card em **Ativos**.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 1,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_ADICIONAR,
              paragrafoAntes: "**01.** Clique em **+** no card desejado",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Cards — detalhes ao adicionar",
      tituloCurto: "Detalhes ao adicionar",
      ocultarNoSumario: true,
      paragrafos: [
        "Antes de incluir, **Ver detalhes** mostra **campo base**, **agregação** e **origem** — útil para entender o indicador.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 2,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_ADICIONAR_VER_DETALHES,
              paragrafoAntes: "Abra **Ver detalhes** na lista **Disponíveis**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_ADICIONAR_VER_DETALHES_ABERTO,
              paragrafoAntes: "Painel com campo, agregação e origem",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Cards — ocultar e exibir",
      tituloCurto: "Ocultar card",
      ocultarNoSumario: true,
      paragrafos: [
        "Use o ícone de **olho** para **ocultar** um card ativo sem removê-lo da lista — ele permanece em **Disponíveis** e pode ser **exibido** de novo.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 2,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_OCULTAR_SETA,
              paragrafoAntes: "**01.** Clique no **olho** do card ativo",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_OCULTADO,
              paragrafoAntes: "**02.** Card **oculto** — some do topo da tela",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_OCULTADO_EXIBIDO,
              paragrafoAntes: "**03.** Card de volta em **Ativos**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_OCULTADO_EXIBIR,
              paragrafoAntes: "**04.** **Exibir** novamente na lista",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Cards — remover da lista",
      tituloCurto: "Remover card",
      ocultarNoSumario: true,
      paragrafos: [
        "**Remover da lista** tira o card de **Ativos** e de **Disponíveis**. Confirme em **Salvar** — a alteração vale para o seu usuário; o card some do topo da **Lista**.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 1,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_LISTA_SETA,
              paragrafoAntes: "**01.** Clique em **×** para remover da lista",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_LISTA_CARD_LISTA,
              paragrafoAntes: "**02.** Card sai de **Ativos**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_LISTA_SALVAR,
              paragrafoAntes: "**03.** Clique em **Salvar**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_LISTA_SALVAR_CONFIRMACAO_1,
              paragrafoAntes: "**04.** Confirme a remoção",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_LISTA_SALVAR_CONFIRMACAO_2,
              paragrafoAntes: "**05.** Preferências **salvas**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_LISTA_SALVAR_CONFIRMACAO_NAO_ESTA_TELA_LISTA,
              paragrafoAntes: "**06.** Na **Lista**, o card não aparece mais no topo",
            },
          ],
        },
      ],
    },
    {
      titulo: "Cards — detalhes ao remover",
      tituloCurto: "Detalhes do card",
      ocultarNoSumario: true,
      paragrafos: [
        "Antes de remover, **Ver detalhes** mostra **campo base**, **agregação**, **origem** e **período** — útil para saber o que deixa de ser exibido.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 2,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_INFORMACAO,
              paragrafoAntes: "Abra **Ver detalhes** antes de remover",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_INFORMACAO_DETALHES,
              paragrafoAntes: "Resumo do card: campo, agregação e origem",
            },
          ],
        },
      ],
    },
    {
      titulo: "Cards — reativar após remover",
      tituloCurto: "Reativar card",
      ocultarNoSumario: true,
      paragrafos: [
        "Depois de remover, o card volta para **Disponíveis** — use **+** para **reativá-lo** e **Salvar** para aplicar.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 2,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_ATIVAR_FLUXO_2,
              paragrafoAntes: "**01.** **+** para adicionar de volta",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_CARDS_ATIVOS_DISPONIVEIS_REMOVER_ATIVAR_FLUXO_3,
              paragrafoAntes: "**02.** **Salvar** — card ativo novamente",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Tabela",
      tituloCurto: "Tabela",
      paragrafos: [
        "Em **Tabela**, defina **linhas por página** padrão da lista virtual.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 2,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_TABELA_LINHAS_PAGINA,
              paragrafoAntes: "**01.** **Linhas por página** padrão",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_TABELA_LINHAS_PAGINA_1,
              paragrafoAntes: "**02.** Selecione a quantidade",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Colunas",
      tituloCurto: "Colunas",
      paragrafos: [
        "Em **Colunas**, ajuste **casas decimais**, **formato de data** e **colunas personalizadas** da **Lista** — preferências do workspace para exibição de pedidos e itens.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 1,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CASAS_DECIMAIS,
              paragrafoAntes: "Abra **Colunas** — **Casas decimais**, **Formato de data** e **Personalizadas**",
            },
          ],
        },
      ],
    },
    {
      titulo: "Colunas — casas decimais",
      tituloCurto: "Casas decimais",
      ocultarNoSumario: true,
      paragrafos: [
        "**Casas decimais** define quantas casas exibir em colunas numéricas de **pedido** e **item**. Alterar valores existentes pode disparar **migração em background** — confirme o banner quando aparecer.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 1,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CASAS_DECIMAIS,
              paragrafoAntes: "Visão das colunas numéricas e grupos **Pedido** / **Personalizadas**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CASAS_DECIMAIS_EDITAR_1,
              paragrafoAntes: "**01.** Ajuste casas decimais de uma coluna",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CASAS_DECIMAIS_EDITAR_2,
              paragrafoAntes: "**02.** Use **−** e **+** ou digite o valor",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CASAS_DECIMAIS_EDITAR_3,
              paragrafoAntes: "**03.** Itens **herdam** casas do pedido pai quando aplicável",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CASAS_DECIMAIS_EDITAR_4,
              paragrafoAntes: "**04.** Banner de **migração** em pedidos existentes",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CASAS_DECIMAIS_EDITAR_5,
              paragrafoAntes: "**05.** Confirme e **Salvar**",
            },
          ],
        },
      ],
    },
    {
      titulo: "Colunas — formato de data",
      tituloCurto: "Formato de data",
      ocultarNoSumario: true,
      paragrafos: [
        "**Formato de Data** padroniza como datas aparecem na **Lista** e demais telas — escolha o padrão do workspace e salve.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 2,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_FORMATO_DATA,
              paragrafoAntes: "**01.** Abra **Colunas › Formato de Data**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_FORMATO_DATA_FLUXO_1,
              paragrafoAntes: "**02.** Selecione o **formato** (ex.: DD/MM/AAAA)",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_FORMATO_DATA_FLUXO_2,
              paragrafoAntes: "**03.** Preview do formato escolhido",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_FORMATO_DATA_FLUXO_3,
              paragrafoAntes: "**04.** **Salvar** preferências",
            },
          ],
        },
      ],
    },
    {
      titulo: "Colunas personalizadas — visão geral",
      tituloCurto: "Personalizadas",
      ocultarNoSumario: true,
      tagSecaoImportante: true,
      paragrafos: [
        "Esta é uma das seções **mais importantes** de **Configurações**: é pela **criação de novas colunas** que você **personaliza a Lista** do jeito que quiser — **Texto**, **Número**, **Data**, **Percentual**, **Lista**, **Checkbox**, **Tipo Documento** e **Fórmula**.",
      ],
      mostrarInfograficoPedidoConfigColunasPersonalizadas: true,
      infograficoPedidoConfigColunasPersonalizadasAposParagrafo: 0,
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 1,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS,
            },
          ],
        },
      ],
    },
    {
      titulo: "Criar coluna — Texto",
      tituloCurto: "Coluna Texto- Personalizada",
      ocultarNoSumario: true,
      paragrafos: [
        "Fluxo para coluna **Texto** — nome e visibilidade na lista.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 1,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_1,
              paragrafoAntes: "**01.** **+ Criar Coluna**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_2,
              paragrafoAntes: "**02.** Escolha tipo **Texto**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TEXTO,
              paragrafoAntes: "**03.** Modal de criação",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TEXTO_1,
              paragrafoAntes: "**04.** Informe o **nome**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TEXTO_NA_TELA,
              paragrafoAntes: "**05.** Coluna visível na **Lista** após salvar",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Criar coluna — Numérico",
      tituloCurto: "Coluna Numérico- Personalizada",
      ocultarNoSumario: true,
      paragrafos: [
        "Coluna **Numérico** para valores quantitativos customizados.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 3,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_NUMERO_1,
              paragrafoAntes: "**01.** Tipo **Numérico**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_NUMERO_2,
              paragrafoAntes: "**02.** Nome e opções",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_NUMERO_3,
              paragrafoAntes: "**03.** **Salvar** coluna",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Criar coluna — Data",
      tituloCurto: "Coluna Data- Personalizada",
      ocultarNoSumario: true,
      paragrafos: [
        "Coluna **Data** para campos de calendário customizados.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 3,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_DATA_1,
              paragrafoAntes: "**01.** Tipo **Data**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_DATA_2,
              paragrafoAntes: "**02.** Configure nome e formato",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_DATA_3,
              paragrafoAntes: "**03.** Coluna criada",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Criar coluna — Percentual",
      tituloCurto: "Coluna Percentual- Personalizada",
      ocultarNoSumario: true,
      paragrafos: [
        "Coluna **Percentual %** para indicadores em percentual.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 3,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_PERCENTUAL_1,
              paragrafoAntes: "**01.** Tipo **Percentual**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_PERCENTUAL_2,
              paragrafoAntes: "**02.** Nome da coluna",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_PERCENTUAL_3,
              paragrafoAntes: "**03.** **Salvar**",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Criar coluna — Lista (Select)",
      tituloCurto: "Coluna Lista- Personalizada",
      ocultarNoSumario: true,
      paragrafos: [
        "Coluna **Select/Lista** — defina opções fixas para seleção na tabela.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 2,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_LISTA_1,
              paragrafoAntes: "**01.** Tipo **Select/Lista**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_LISTA_2,
              paragrafoAntes: "**02.** Cadastre **opções**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_LISTA_3,
              paragrafoAntes: "**03.** Revise opções",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_LISTA_4,
              paragrafoAntes: "**04.** **Salvar** coluna",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Criar coluna — Checkbox",
      tituloCurto: "Coluna Checkbox- Personalizada",
      ocultarNoSumario: true,
      paragrafos: [
        "Coluna **Checkbox** para flags booleanas na lista.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 3,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_CHECKBOX_1,
              paragrafoAntes: "**01.** Tipo **Checkbox**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_CHECKBOX_2,
              paragrafoAntes: "**02.** Nome da coluna",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_CHECKBOX_3,
              paragrafoAntes: "**03.** **Salvar**",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Criar coluna — Tipo Documento",
      tituloCurto: "Coluna Tipo Documento- Personalizada",
      ocultarNoSumario: true,
      paragrafos: [
        "Coluna **Tipo Documento** para classificar anexos ou documentos vinculados.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 3,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TIPO_DOCUMENTO_1,
              paragrafoAntes: "**01.** Tipo **Tipo Documento**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TIPO_DOCUMENTO_2,
              paragrafoAntes: "**02.** Configure opções",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TIPO_DOCUMENTO_3,
              paragrafoAntes: "**03.** **Salvar**",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Criar coluna — Fórmula",
      tituloCurto: "Coluna Fórmula- Personalizada",
      ocultarNoSumario: true,
      paragrafos: [
        "Coluna **Fórmula** calcula valores a partir de outros campos — uma fórmula por tenant no backend.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 2,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TIPO_FORMULA_1,
              paragrafoAntes: "**01.** Tipo **Fórmula**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TIPO_FORMULA_2,
              paragrafoAntes: "**02.** Editor de expressão",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TIPO_FORMULA_3,
              paragrafoAntes: "**03.** Valide a fórmula",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_CRIAR_COLUNA_TIPO_FORMULA_4,
              paragrafoAntes: "**04.** **Salvar** coluna calculada",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Editar coluna personalizada",
      tituloCurto: "Editar coluna",
      ocultarNoSumario: true,
      paragrafos: [
        "Clique no **lápis** para editar nome, tipo ou opções de uma coluna existente.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 2,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_EDITAR_COLUNA_1,
              paragrafoAntes: "**01.** **Editar** coluna",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_EDITAR_COLUNA_3,
              paragrafoAntes: "**02.** Alterações e **Salvar**",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Ocultar coluna personalizada",
      tituloCurto: "Ocultar coluna",
      ocultarNoSumario: true,
      paragrafos: [
        "**Olho** oculta a coluna na **Lista** sem excluir — dados permanecem no banco.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 2,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_OCULTAR_COLUNA_1,
              paragrafoAntes: "**01.** **Ocultar** coluna",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_OCULTAR_COLUNA_2,
              paragrafoAntes: "**02.** Coluna oculta na lista",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_OCULTAR_COLUNA_4,
              paragrafoAntes: "**03.** **Exibir** novamente",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_OCULTAR_COLUNA_5,
              paragrafoAntes: "**04.** Coluna visível de volta",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Excluir coluna personalizada",
      tituloCurto: "Excluir coluna",
      ocultarNoSumario: true,
      paragrafos: [
        "**Excluir** remove a coluna customizada do workspace — operação irreversível; confirme no modal.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 2,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_EXCLUIR_COLUNA_1,
              paragrafoAntes: "**01.** **Excluir** coluna",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_EXCLUIR_COLUNA_2,
              paragrafoAntes: "**02.** Confirme a exclusão",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_EXCLUIR_COLUNA_3,
              paragrafoAntes: "**03.** Coluna removida da lista",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_PERSONALIZADAS_EXCLUIR_COLUNA_4,
              paragrafoAntes: "**04.** Estado final após salvar",
            },
          ],
        },
      ],
    },
    {
      titulo: "Campos calculados",
      tituloCurto: "Campos calculados",
      ocultarNoSumario: true,
      paragrafos: [
        "**Campos Calculados** concentra fórmulas de saldo e métricas derivadas aplicadas aos pedidos do workspace.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 1,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_COLUNAS_CAMPOS_CALCULADOS,
              paragrafoAntes: "Configure fórmulas e campos derivados",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Kanban",
      tituloCurto: "Kanban",
      paragrafos: [
        "Em **Kanban › Colunas**, escolha quais **status** aparecem como colunas no board — **olho** para ocultar, **+** para trazer status disponíveis.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 1,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_KANBAN_COLUNAS,
              paragrafoAntes: "**01.** Visão **Colunas** do Kanban",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_KANBAN_COLUNAS_1,
              paragrafoAntes: "**02.** Colunas **ativas**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_KANBAN_COLUNAS_2,
              paragrafoAntes: "**03.** **Ocultar** coluna de status",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_KANBAN_COLUNAS_3,
              paragrafoAntes: "**04.** Status **disponíveis** para adicionar",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_KANBAN_COLUNAS_4,
              paragrafoAntes: "**05.** **Salvar** preferências",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Kanban — card",
      tituloCurto: "Kanban card",
      ocultarNoSumario: true,
      rotuloPasso: "Kanban card",
      ocultarTituloPasso: true,
      paragrafos: [
        "**Kanban › Card** define campos visíveis em cada cartão: número, parceiro, data crítica, valor, incoterm e demais — **arraste** para reordenar.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 2,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_KANBAN_CARD_1,
              paragrafoAntes: "**01.** Campos **ativos** no card",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_KANBAN_CARD_2,
              paragrafoAntes: "**02.** **Olho** para ocultar campo",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_KANBAN_CARD_3,
              paragrafoAntes: "**03.** **Data crítica** e urgência",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_KANBAN_CARD_4,
              paragrafoAntes: "**04.** Preview e **Salvar**",
            },
          ],
        },
      ],
    },
    {
      titulo: "Kanban — modal",
      tituloCurto: "Kanban modal",
      ocultarNoSumario: true,
      rotuloPasso: "Kanban modal",
      ocultarTituloPasso: true,
      paragrafos: [
        "**Kanban › Modal** configura as abas **Pedido**, **Quantidades**, **Datas** e **Lembrete** ao clicar um cartão — adicione, remova ou reordene campos por aba.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 2,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_KANBAN_MODAL_1,
              paragrafoAntes: "**01.** Aba **Pedido** — campos do modal",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_KANBAN_MODAL_2,
              paragrafoAntes: "**02.** Aba **Quantidades**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_KANBAN_MODAL_3,
              paragrafoAntes: "**03.** Aba **Datas**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_KANBAN_MODAL_4,
              paragrafoAntes: "**04.** Preview e **Salvar**",
            },
          ],
        },
      ],
    },
    {
      titulo: "Status do pedido",
      tituloCurto: "Status",
      paragrafos: [
        "**Status** lista todos os status do workspace. **Arraste** para reordenar (reflete no Kanban). Status de **sistema** são fixos — sem editar ou excluir.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 1,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_STATUS_1,
              paragrafoAntes: "**01.** Lista de status",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_STATUS_2,
              paragrafoAntes: "**02.** Badge **sistema** em status fixos",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_STATUS_3,
              paragrafoAntes: "**03.** **Editar** status customizado",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_STATUS_4,
              paragrafoAntes: "**04.** **Cor** e **nome**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_STATUS_5,
              paragrafoAntes: "**05.** **Excluir** status (quando permitido)",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_STATUS_6,
              paragrafoAntes: "**06.** Confirmação de exclusão",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_STATUS_7,
              paragrafoAntes: "**07.** **Salvar** alterações",
            },
          ],
        },
      ],
      callout: CALLOUT_SALVAR_CONFIGURACOES,
    },
    {
      titulo: "Status — novo e reordenar",
      tituloCurto: "Novo status",
      ocultarNoSumario: true,
      rotuloPasso: "Novo status",
      ocultarTituloPasso: true,
      paragrafos: [
        "**Novo Status** cria etapas customizadas. **Arraste** a alça para reordenar — a ordem vale para **Lista**, **Kanban** e filtros.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 2,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_STATUS_NOVO_1,
              paragrafoAntes: "**01.** Clique em **Novo Status**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_STATUS_NOVO_2,
              paragrafoAntes: "**02.** Nome e **cor**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_STATUS_NOVO_3,
              paragrafoAntes: "**03.** Status criado na lista",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_STATUS_NOVO_4,
              paragrafoAntes: "**04.** **Salvar**",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_STATUS_ARRASTAR_1,
              paragrafoAntes: "**05.** **Arraste** para reordenar",
            },
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_STATUS_ARRASTAR_2,
              paragrafoAntes: "**06.** Nova ordem aplicada",
            },
          ],
        },
      ],
    },
    {
      titulo: "Numeração automática",
      tituloCurto: "Numeração",
      badgeEmDesenvolvimento: true,
      paragrafos: [
        "**Numeração** define **prefixo**, **dígitos**, **ano** e **reinício** do número automático de pedidos — preview mostra o formato antes de salvar.",
      ],
      galeriaComparacaoAposParagrafo: [
        {
          indice: 0,
          colunas: 1,
          textoAcimaEstiloCorpo: true,
          telas: [
            {
              legenda: '',
              imagem: SCREENSHOT_PEDIDO_CONFIG_NUMERACAO,
              paragrafoAntes: "Configure formato, prefixo e regras de sequência",
            },
          ],
        },
      ],
    },
])
