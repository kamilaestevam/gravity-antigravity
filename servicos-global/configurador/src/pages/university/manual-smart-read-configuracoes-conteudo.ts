/**
 * Manual Smart Docs §07 Configurações — paridade com Pedido §08.
 * SSOT prints: Drive `7. Produtos Gravity/2. Smart Docs` → `smart-docs-configuracoes-*.png`
 *   acesso: tela_smart_docs_configuracoes_acesso | cards: tela_smart_docs_configuracoes_cards
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

function renumerarPassosConfig(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => {
    const tituloCurto = passo.tituloCurto?.trim()
    const usarSubtituloGuia = Boolean(
      tituloCurto
      && !passo.rotuloPasso
      && tituloCurto.toLocaleLowerCase('pt-BR') !== 'o que é',
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
    titulo: 'Cards — adicionar',
    tituloCurto: 'Adicionar card',
    paragrafos: [
      'Na lista **Disponíveis**, clique em **+** para incluir um card em **Ativos**.',
    ],
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
        ],
      },
    ],
    callout: {
      tipo: 'dica',
      texto: 'É obrigatório salvar as modificações clicando em {{botao:salvar-configuracoes}}',
    },
  },
])
