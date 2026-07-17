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
    titulo: 'Cards: adicionar',
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
  {
    titulo: 'Tabelas',
    tituloCurto: 'Tabela',
    paragrafos: [
      'Em **Tabelas**, defina **linhas por página** e **densidade** da tabela de leituras na **Lista**.',
    ],
  },
  {
    titulo: 'Colunas personalizadas: visão geral',
    tituloCurto: 'Colunas',
    paragrafos: [
      'Em **Colunas › Personalizadas**, crie campos próprios (**texto**, **número**, **data**, **percentual**, **lista**, **checkbox**). **Arraste** para reordenar, **olho** para ocultar e **+ Criar Coluna** para novos tipos.',
    ],
    callout: {
      tipo: 'dica',
      texto: 'Colunas nativas da leitura/documento estão catalogadas em **Lista › Detalhamento das colunas**. Não se confundem com as personalizadas criadas aqui.',
    },
  },
  {
    titulo: 'Criar coluna: Texto',
    tituloCurto: 'Coluna Texto',
    paragrafos: [
      'Fluxo para coluna **Texto**: escolha o tipo, informe o **nome**, defina **visibilidade** e **obrigatório** quando aplicável, e **Salvar**.',
    ],
  },
  {
    titulo: 'Criar coluna: Numérico',
    tituloCurto: 'Coluna Numérico',
    paragrafos: [
      'Coluna **Numérico** para valores quantitativos customizados na **Lista**.',
    ],
  },
  {
    titulo: 'Criar coluna: Data',
    tituloCurto: 'Coluna Data',
    paragrafos: [
      'Coluna **Data** para campos de calendário na tabela de leituras (formato **DD/MM/AAAA** na Lista).',
    ],
  },
  {
    titulo: 'Criar coluna: Percentual',
    tituloCurto: 'Coluna Percentual',
    paragrafos: [
      'Coluna **Percentual** para taxas e proporções exibidas na **Lista**.',
    ],
  },
  {
    titulo: 'Criar coluna: Lista (Select)',
    tituloCurto: 'Coluna Lista',
    paragrafos: [
      'Coluna **Lista** com opções fixas para seleção na **Lista**.',
    ],
  },
  {
    titulo: 'Criar coluna: Checkbox',
    tituloCurto: 'Coluna Checkbox',
    paragrafos: [
      'Coluna **Checkbox** para flags booleanas (sim/não) na tabela.',
    ],
  },
  {
    titulo: 'Editar coluna personalizada',
    tituloCurto: 'Editar coluna',
    paragrafos: [
      'Use o **lápis** para renomear ou ajustar uma coluna personalizada existente.',
    ],
  },
  {
    titulo: 'Ocultar coluna personalizada',
    tituloCurto: 'Ocultar coluna',
    paragrafos: [
      'O **olho** oculta a coluna na **Lista** sem excluir a definição do workspace.',
    ],
  },
  {
    titulo: 'Excluir coluna personalizada',
    tituloCurto: 'Excluir coluna',
    paragrafos: [
      '**Excluir** remove a coluna personalizada do workspace: a ação é definitiva após confirmar.',
    ],
  },
])
