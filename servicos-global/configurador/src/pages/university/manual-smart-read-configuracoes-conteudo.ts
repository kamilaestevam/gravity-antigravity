/**
 * Manual Smart Docs §07 Configurações — paridade com Pedido §08.
 * SSOT prints: Drive `2. Smart Docs/tela_smart_read_configuracoes_*` → `smart-docs-configuracoes-*.png`
 */
import type { DocPassoVisual } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

export const SCREENSHOT_SMART_DOCS_CONFIG_SETA =
  '/university/screenshots/smart-docs-configuracoes-seta.png'
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
    titulo: 'Visão geral',
    tituloCurto: 'Visão geral',
    paragrafos: [
      'No menu lateral, **Configurações** reúne preferências do Smart Docs no workspace — principalmente **colunas personalizadas** para estender a **Lista** além das colunas nativas.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_CONFIG_SETA,
            paragrafoAntes: 'Abra **Configurações** no menu lateral do Smart Docs',
          },
        ],
      },
    ],
  },
  {
    titulo: 'Tela principal',
    tituloCurto: 'Tela principal',
    paragrafos: [
      'A tela centraliza abas administrativas do produto. Hoje o foco do manual é **Colunas personalizadas** — demais abas seguem o mesmo padrão de salvar por workspace.',
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
            paragrafoAntes: '**02.** **Salvar** — coluna disponível na Lista',
          },
        ],
      },
    ],
    callout: {
      tipo: 'dica',
      texto: 'Colunas nativas da leitura/documento estão catalogadas em **Lista › Detalhamento das colunas** — não se confundem com as personalizadas criadas aqui.',
    },
  },
])
