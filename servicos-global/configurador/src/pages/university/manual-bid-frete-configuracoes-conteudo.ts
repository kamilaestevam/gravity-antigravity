/**
 * Manual BID Frete §11 Configurações — todas as telas do Drive.
 */
import type { DocPassoVisual } from './manual-configurador-conteudo'
import { screenshotBidFreteInt } from './manual-bid-frete-catalogo-screenshots'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const S = screenshotBidFreteInt

function fig(sufixoDrive: string, paragrafoAntes: string) {
  return { legenda: '', imagem: S(sufixoDrive), paragrafoAntes }
}

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const PASSOS_MANUAL_BID_FRETE_CONFIGURACOES: DocPassoVisual[] = renumerarPassos([
  {
    titulo: 'Visão geral das Configurações',
    paragrafos: [
      'No menu lateral do **BID Frete Internacional**, **Configurações** concentra preferências do workspace: **status**, **numeração**, **taxa de câmbio**, **colunas** da lista, **cards** de Insights, **Kanban** e demais abas administrativas.',
    ],
    imagem: S('configuracoes_tabela'),
    imagemAbaixoTexto: true,
    galeriaComparacaoAposImagem: [
      {
        tituloEtapa: 'Cards de Insights',
        textoIntro: 'Gerencie **KPIs** do cockpit: período, inclusão e desativação de cards.',
        colunas: 4,
        textoAcimaEstiloCorpo: true,
        ampliarInferiorDireito: true,
        telas: [
          fig('configuracoes_cards_periodo_de_comparacao', '**01.** Período de **comparação**'),
          fig('configuracoes_cards_incluir', '**02.** **Incluir** card'),
          fig('configuracoes_cards_incluir_2', '**03.** Incluir card: detalhe'),
          fig('configuracoes_cards_desativar_1', '**04.** **Desativar** card: passo 1'),
        ],
      },
      {
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        ampliarInferiorDireito: true,
        telas: [fig('configuracoes_cards_desativar_2', '**05.** Desativar card: confirmação')],
      },
    ],
  },
  {
    titulo: 'Status e preferências',
    paragrafos: ['Defina **rótulos** dos status e **preferências gerais** do produto.'],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 2,
        textoAcimaEstiloCorpo: true,
        telas: [
          fig('configuracoes_status', '**Status**: fluxo e rótulos na Lista/Kanban'),
          fig('configuracoes_preferencia', '**Preferências**: comportamentos padrão'),
        ],
      },
    ],
  },
  {
    titulo: 'Numeração e taxa de câmbio',
    paragrafos: ['Configure **sequência de numeração** e **taxas de câmbio** de referência.'],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 2,
        textoAcimaEstiloCorpo: true,
        telas: [
          fig('configuracoes_numeracao', '**Numeração**: prefixo e próximo número'),
          fig('configuracoes_taxa_cambio', '**Taxa de câmbio**: moedas e cotações'),
        ],
      },
    ],
  },
  {
    titulo: 'Colunas da Lista',
    paragrafos: ['Personalize **casas decimais**, **datas** e **colunas customizadas**.'],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 3,
        textoAcimaEstiloCorpo: true,
        telas: [
          fig('configuracoes_colunas_casas_decimais', '**Casas decimais**'),
          fig('configuracoes_colunas_formato_datas', '**Formato de datas**'),
          fig('configuracoes_colunas_formato_personalizadas', '**Colunas personalizadas**'),
        ],
      },
    ],
  },
  {
    titulo: 'Kanban',
    paragrafos: ['Ajuste **colunas** e **cards** da visão Kanban.'],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 4,
        textoAcimaEstiloCorpo: true,
        telas: [
          fig('configuracoes_kanban', '**01.** Aba **Kanban** nas configurações'),
          fig('configuracoes_kanban_tela', '**02.** **Tela Kanban**: colunas'),
          fig('configuracoes_kanban_card_1', '**03.** Campos do **card**: parte 1'),
          fig('configuracoes_kanban_card_2', '**04.** Campos do **card**: parte 2'),
        ],
      },
    ],
  },
])
