/**
 * Manual Smart Docs §07 Configurações — paridade com Pedido §08.
 * SSOT prints: Drive `7. Produtos Gravity/2. Smart Docs` → `smart-docs-configuracoes-*.png`
 *   acesso: tela_smart_docs_configuracoes_acesso | tela principal: tela_smart_docs_configuracoes
 */
import type { DocPassoVisual } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const LINK_CONFIG_CARD =
  '{{link:/university-gravity/docs/smart-read#manual-passo-configuracoes-3|Card}}'
const LINK_CONFIG_VISAO_GERAL =
  '{{link:/university-gravity/docs/smart-read#manual-passo-configuracoes-4|Visão Geral}}'
const LINK_CONFIG_TABELAS =
  '{{link:/university-gravity/docs/smart-read#manual-passo-configuracoes-5|Tabelas}}'
const LINK_CONFIG_COLUNAS =
  '{{link:/university-gravity/docs/smart-read#manual-passo-configuracoes-6|Colunas}}'

export const SCREENSHOT_SMART_DOCS_CONFIG_ACESSO =
  '/university/screenshots/smart-docs-configuracoes-acesso.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_TELA_PRINCIPAL =
  '/university/screenshots/smart-docs-configuracoes-tela-principal.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_COLUNAS_PERSONALIZADAS =
  '/university/screenshots/smart-docs-configuracoes-colunas-personalizadas.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_CRIAR_COLUNA_1 =
  '/university/screenshots/smart-docs-configuracoes-criar-coluna-1.png'
export const SCREENSHOT_SMART_DOCS_CONFIG_CRIAR_COLUNA_2 =
  '/university/screenshots/smart-docs-configuracoes-criar-coluna-2.png'

function renumerarPassosConfig(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
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
    titulo: 'Como acessar',
    tituloCurto: 'Como acessar',
    paragrafos: [
      'Pelo menu lateral do Smart Docs, **Configurações** abre as preferências do workspace.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_ACESSO,
            paragrafoAntes: 'No menu lateral, clique em **Configurações**',
          },
        ],
      },
    ],
  },
  {
    titulo: 'Card',
    tituloCurto: 'Card',
    paragrafos: [
      'Em **Card**, configure os indicadores exibidos no topo de **Insights** e **Lista**: **período de comparação**, cards **ativos** e **disponíveis** para adicionar.',
    ],
  },
  {
    titulo: 'Visão Geral',
    tituloCurto: 'Visão Geral',
    paragrafos: [
      'Em **Visão Geral**, escolha quais **gráficos** aparecem no painel de **Insights** (série temporal, ranking, distribuição por tipo de documento e taxa de conferência).',
    ],
  },
  {
    titulo: 'Tabelas',
    tituloCurto: 'Tabelas',
    paragrafos: [
      'Em **Tabelas**, defina **linhas por página** e **densidade** da tabela de leituras na **Lista**.',
    ],
  },
  {
    titulo: 'Colunas personalizadas',
    tituloCurto: 'Colunas',
    paragrafos: [
      'Em **Colunas › Personalizadas**, crie campos próprios (**texto**, **número**, **data**, **fórmula**, **lista**, **checkbox**, **tipo documento**) para aparecer na **Lista** e nos fluxos de leitura.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_COLUNAS_PERSONALIZADAS,
            paragrafoAntes: 'Aba **Colunas › Personalizadas**',
          },
        ],
      },
    ],
  },
  {
    titulo: 'Criar coluna',
    tituloCurto: 'Criar coluna',
    paragrafos: [
      'Clique em **+ Criar Coluna**, escolha o **tipo**, informe o **nome** e **Salvar**. A coluna passa a ficar disponível no seletor **Colunas** da Lista.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 2,
        textoAcimaEstiloCorpo: true,
        ampliarInferiorDireito: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_CRIAR_COLUNA_1,
            paragrafoAntes: '**01.** Escolha o **tipo** e o **nome** da coluna',
          },
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_CRIAR_COLUNA_2,
            paragrafoAntes: '**02.** **Salvar**. Coluna disponível na Lista',
          },
        ],
      },
    ],
    callout: {
      tipo: 'dica',
      texto: 'Colunas nativas da leitura/documento estão catalogadas em **Lista › Detalhamento das colunas**. Não se confundem com as personalizadas criadas aqui.',
    },
  },
])
