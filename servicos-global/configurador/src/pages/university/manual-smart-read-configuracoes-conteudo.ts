/**
 * Manual Smart Docs §07 Configurações — paridade com Pedido §08.
 * SSOT prints: Drive `7. Produtos Gravity/2. Smart Docs` → `smart-docs-configuracoes-*.png`
 *   acesso: tela_smart_docs_configuracoes_acesso | cards: tela_smart_docs_configuracoes_cards
 *   tabelas: tela_smart_docs_configuracoes_list
 *   colunas: tela_smart_docs_configuracoes_colunas_1..4
 */
import type { DocPassoVisual } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const LINK_CONFIG_CARD =
  '{{link:/university-gravity/docs/smart-read#manual-passo-configuracoes-2|Card}}'

export const SCREENSHOT_SMART_DOCS_CONFIG_ACESSO =
  '/university/screenshots/smart-docs-configuracoes-acesso.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_TELA_PRINCIPAL =
  '/university/screenshots/smart-docs-configuracoes-tela-principal.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_CARDS =
  '/university/screenshots/smart-docs-configuracoes-cards.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_CARDS_ADICIONAR =
  '/university/screenshots/smart-docs-configuracoes-cards-adicionar.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_CARDS_ADICIONAR_SALVAR =
  '/university/screenshots/smart-docs-configuracoes-cards-adicionar-salvar.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_CARDS_LISTA_RESULTADO =
  '/university/screenshots/smart-docs-configuracoes-cards-lista-resultado.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_TABELAS =
  '/university/screenshots/smart-docs-configuracoes-tabelas.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_COLUNAS_1 =
  '/university/screenshots/smart-docs-configuracoes-colunas-1.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_COLUNAS_2 =
  '/university/screenshots/smart-docs-configuracoes-colunas-2.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_COLUNAS_3 =
  '/university/screenshots/smart-docs-configuracoes-colunas-3.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_COLUNAS_4 =
  '/university/screenshots/smart-docs-configuracoes-colunas-4.png'

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

export const PASSOS_MANUAL_SMART_READ_CONFIGURACOES: DocPassoVisual[] = renumerarPassosConfig([
  {
    titulo: 'O que é',
    tituloCurto: 'O que é',
    paragrafos: [
      `No menu lateral, **Configurações** reúne preferências de visualização do Smart Docs no workspace. Este guia cobre ${LINK_CONFIG_CARD}: período de comparação, ordem e quais indicadores aparecem no topo da **Lista** e **Insights**.`,
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_TELA_PRINCIPAL,
            paragrafoAntes: 'Visão geral das abas de **Configurações**',
          },
        ],
      },
    ],
  },
  {
    titulo: 'Card',
    tituloCurto: 'Card',
    paragrafos: [
      'Em **Cards**, o **período de comparação** define o recorte usado nos indicadores de tendência dos cards ativos no topo da **Lista** e **Insights**.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_CARDS,
            paragrafoAntes: 'Escolha **7 dias**, **30 dias**, **6 meses**, **1 ano** ou **Tudo**',
          },
        ],
      },
    ],
  },
  {
    titulo: 'Cards: adicionar',
    tituloCurto: 'Adicionar card',
    ocultarNoSumario: true,
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_CARDS_ADICIONAR,
            paragrafoAntes: 'Clique em **+** no card desejado',
          },
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_CARDS_ADICIONAR_SALVAR,
            paragrafoAntes:
              'Depois de incluir em **Ativos**, clique em **Salvar** no rodapé de **Configurações**',
          },
        ],
        calloutApos: {
          tipo: 'dica',
          texto: 'É obrigatório salvar as modificações clicando em {{botao:salvar-configuracoes}}',
        },
      },
      {
        indice: 1,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_CARDS_LISTA_RESULTADO,
            paragrafoAntes:
              'Após salvar, os cards do topo da **Lista** e **Insights** são atualizados conforme os indicadores ativos e o **período de comparação**',
          },
        ],
      },
    ],
    paragrafos: [
      'Na lista **Disponíveis**, clique em **+** para incluir um card em **Ativos**.',
      'Depois de **Salvar**, confira o resultado no topo da **Lista**.',
    ],
  },
  {
    titulo: 'Tabelas',
    tituloCurto: 'Tabela',
    paragrafos: [
      'Em **Tabelas**, defina **linhas por página** e **densidade** da tabela de leituras na **Lista**.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_TABELAS,
            paragrafoAntes: 'Escolha **linhas por página** e **densidade** na aba **Tabelas**',
          },
        ],
      },
    ],
  },
  {
    titulo: 'Colunas',
    tituloCurto: 'Colunas',
    paragrafos: [
      'Crie colunas personalizadas na sua **Lista**.',
      'Em **Colunas › Personalizadas**, crie campos próprios (**texto**, **número**, **data**, **percentual**, **lista**, **checkbox**). **Arraste** para reordenar, **lápis** para editar e **olho** para ocultar.',
      'Depois de **Salvar** em **Configurações**, confira a nova coluna na tabela da **Lista**.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 1,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_COLUNAS_1,
            paragrafoAntes: 'Clique em **+ Criar Coluna** em **Colunas › Personalizadas**',
          },
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_COLUNAS_2,
            paragrafoAntes:
              'No modal **Nova coluna**, escolha o **tipo**, informe o **nome**, defina **visibilidade** e **obrigatório** quando aplicável; clique em **Salvar**',
          },
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_COLUNAS_3,
            paragrafoAntes:
              'A coluna aparece em **Ativas**; clique em **Salvar** no rodapé de **Configurações**',
          },
        ],
        calloutApos: {
          tipo: 'dica',
          texto: 'É obrigatório salvar as modificações clicando em {{botao:salvar-configuracoes}}',
        },
      },
      {
        indice: 2,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_COLUNAS_4,
          },
        ],
      },
    ],
  },
])
