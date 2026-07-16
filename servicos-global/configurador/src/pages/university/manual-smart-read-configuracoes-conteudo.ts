/**
 * Manual Smart Docs §07 Configurações — paridade com Pedido §08.
 * SSOT prints: Drive `7. Produtos Gravity/2. Smart Docs` → `smart-docs-configuracoes-*.png`
 *   acesso: tela_smart_docs_configuracoes_acesso | cards: tela_smart_docs_configuracoes_cards
 */
import type { DocPassoVisual } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const LINK_CONFIG_CARD =
  '{{link:/university-gravity/docs/smart-read#manual-passo-configuracoes-2|Card}}'
const LINK_CONFIG_VISAO_GERAL =
  '{{link:/university-gravity/docs/smart-read#manual-passo-configuracoes-9|Visão Geral}}'
const LINK_CONFIG_TABELAS =
  '{{link:/university-gravity/docs/smart-read#manual-passo-configuracoes-10|Tabelas}}'
const LINK_CONFIG_COLUNAS =
  '{{link:/university-gravity/docs/smart-read#manual-passo-configuracoes-11|Colunas}}'

export const SCREENSHOT_SMART_DOCS_CONFIG_ACESSO =
  '/university/screenshots/smart-docs-configuracoes-acesso.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_TELA_PRINCIPAL =
  '/university/screenshots/smart-docs-configuracoes-tela-principal.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_CARDS =
  '/university/screenshots/smart-docs-configuracoes-cards.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_CARDS_ADICIONAR =
  '/university/screenshots/smart-docs-configuracoes-cards-adicionar.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_COLUNAS_PERSONALIZADAS =
  '/university/screenshots/smart-docs-configuracoes-colunas-personalizadas.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_CRIAR_COLUNA_1 =
  '/university/screenshots/smart-docs-configuracoes-criar-coluna-1.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_CRIAR_COLUNA_2 =
  '/university/screenshots/smart-docs-configuracoes-criar-coluna-2.png'

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
      `No menu lateral, **Configurações** reúne as preferências do Smart Docs no workspace: ${LINK_CONFIG_CARD}, ${LINK_CONFIG_VISAO_GERAL}, ${LINK_CONFIG_TABELAS} e ${LINK_CONFIG_COLUNAS}. Cada aba afeta a visualização das leituras para todos os usuários do workspace (salvo cards e colunas da lista, que são por usuário).`,
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
  {
    titulo: 'Cards — detalhes ao adicionar',
    tituloCurto: 'Detalhes ao adicionar',
    paragrafos: [
      'Antes de incluir, **Ver detalhes** mostra **campo base**, **agregação** e **origem** — útil para entender o indicador.',
    ],
  },
  {
    titulo: 'Cards — ocultar e exibir',
    tituloCurto: 'Ocultar card',
    paragrafos: [
      'Use o ícone de **olho** para **ocultar** um card ativo sem removê-lo da lista — ele permanece em **Ativos** (oculto no preview) e pode ser **exibido** de novo.',
    ],
  },
  {
    titulo: 'Cards — remover da lista',
    tituloCurto: 'Remover card',
    paragrafos: [
      '**Remover** tira o card de **Ativos**. O card volta para **Disponíveis** e deixa de aparecer no topo da **Lista** e **Insights**.',
    ],
  },
  {
    titulo: 'Cards — detalhes ao remover',
    tituloCurto: 'Detalhes do card',
    paragrafos: [
      'Antes de remover, **Ver detalhes** mostra **campo base**, **agregação**, **origem** e **período** — útil para saber o que deixa de ser exibido.',
    ],
  },
  {
    titulo: 'Cards — reativar após remover',
    tituloCurto: 'Reativar card',
    paragrafos: [
      'Depois de remover, o card fica em **Disponíveis** — use **+** para **reativá-lo** em **Ativos**.',
    ],
  },
  {
    titulo: 'Visão Geral',
    tituloCurto: 'Visão Geral',
    paragrafos: [
      'Em **Visão Geral**, escolha quais **gráficos** aparecem no painel de **Insights**. Use o **olho** para ocultar ou exibir cada gráfico (série temporal, ranking, distribuição por tipo de documento e taxa de conferência).',
    ],
  },
  {
    titulo: 'Tabelas',
    tituloCurto: 'Tabela',
    paragrafos: [
      'Em **Tabelas**, defina **linhas por página** e **densidade** da tabela de leituras na **Lista**.',
    ],
  },
  {
    titulo: 'Colunas personalizadas — visão geral',
    tituloCurto: 'Colunas',
    paragrafos: [
      'Em **Colunas › Personalizadas**, crie campos próprios (**texto**, **número**, **data**, **fórmula**, **lista**, **checkbox**, **tipo documento**). **Arraste** para reordenar, **olho** para ocultar e **+ Criar Coluna** para novos tipos.',
    ],
    callout: {
      tipo: 'dica',
      texto: 'Colunas nativas da leitura/documento estão catalogadas em **Lista › Detalhamento das colunas**. Não se confundem com as personalizadas criadas aqui.',
    },
  },
  {
    titulo: 'Criar coluna — Texto',
    tituloCurto: 'Coluna Texto',
    paragrafos: [
      'Fluxo para coluna **Texto** — escolha o tipo, informe o **nome** e **Salvar**.',
    ],
  },
  {
    titulo: 'Criar coluna — Numérico',
    tituloCurto: 'Coluna Numérico',
    paragrafos: [
      'Coluna **Numérico** para valores quantitativos customizados na **Lista**.',
    ],
  },
  {
    titulo: 'Criar coluna — Data',
    tituloCurto: 'Coluna Data',
    paragrafos: [
      'Coluna **Data** para campos de calendário na tabela de leituras.',
    ],
  },
  {
    titulo: 'Criar coluna — Percentual',
    tituloCurto: 'Coluna Percentual',
    paragrafos: [
      'Coluna **Percentual** para taxas e proporções exibidas na **Lista**.',
    ],
  },
  {
    titulo: 'Criar coluna — Lista (Select)',
    tituloCurto: 'Coluna Lista',
    paragrafos: [
      'Coluna **Lista** com opções fixas para seleção na **Lista**.',
    ],
  },
  {
    titulo: 'Criar coluna — Checkbox',
    tituloCurto: 'Coluna Checkbox',
    paragrafos: [
      'Coluna **Checkbox** para flags booleanas (sim/não) na tabela.',
    ],
  },
  {
    titulo: 'Criar coluna — Tipo Documento',
    tituloCurto: 'Tipo Documento',
    paragrafos: [
      'Coluna **Tipo Documento** vinculada ao tipo de arquivo da leitura.',
    ],
  },
  {
    titulo: 'Criar coluna — Fórmula',
    tituloCurto: 'Coluna Fórmula',
    paragrafos: [
      'Coluna **Fórmula** calculada a partir de outras colunas da leitura.',
    ],
  },
  {
    titulo: 'Editar coluna personalizada',
    tituloCurto: 'Editar coluna',
    paragrafos: [
      'Use o **lápis** para renomear uma coluna personalizada existente.',
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
      '**Excluir** remove a coluna personalizada do workspace — a ação é definitiva após confirmar.',
    ],
  },
])
