/**
 * Manual Smart Docs §08 Histórico — paridade com Pedido §09 e Configurador › Histórico.
 * SSOT prints: Drive `2. Smart Docs/tela_smart_read_historico_N.png` → `smart-docs-historico-N.png`
 */
import type { DocColunaTabela, DocPassoVisual } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

export const SCREENSHOT_SMART_DOCS_HISTORICO_TELA_PRINCIPAL =
  '/university/screenshots/smart-docs-historico-1.png'
export const SCREENSHOT_SMART_DOCS_HISTORICO_TABELA =
  '/university/screenshots/smart-docs-historico-2.png'
export const SCREENSHOT_SMART_DOCS_HISTORICO_FILTROS_EXPORTAR =
  '/university/screenshots/smart-docs-historico-3.png'

const SMART_READ_HISTORICO_COLUNAS: DocColunaTabela[] = [
  {
    coluna: 'Data/Hora',
    descricao: 'Momento em que o evento foi gravado (fuso da organização).',
    detalhes: ['Ordenação decrescente: o mais recente no topo'],
  },
  {
    coluna: 'Ação',
    descricao: 'O que aconteceu: ex.: **Criou**, **Atualizou**, **Excluiu**.',
  },
  {
    coluna: 'Local',
    descricao: 'Módulo e recurso: ex.: **Smart Docs | Leitura**, **Smart Docs | Lista**.',
  },
  {
    coluna: 'Usuário',
    descricao: 'Quem fez: nome e e-mail quando o ator é pessoa.',
  },
  {
    coluna: 'Detalhes',
    descricao: 'Resumo do que mudou: nome da leitura, status, campos alterados na conferência, etc.',
  },
]

function renumerarPassosHistorico(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const PASSOS_MANUAL_SMART_READ_HISTORICO: DocPassoVisual[] = renumerarPassosHistorico([
  {
    titulo: 'Visão geral',
    tituloCurto: 'Visão geral',
    paragrafos: [
      'No menu lateral inferior do **Smart Docs**, clique em **Histórico**. A tela abre no serviço de auditoria da organização, já filtrada para eventos do produto **Smart Docs** no workspace ativo.',
      'Os **três cards** no topo resumem volume e distribuição dos eventos da **página atual** (25 registros por página).',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 1,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_HISTORICO_TELA_PRINCIPAL,
            paragrafoAntes: 'Abra **Histórico** no menu lateral do Smart Docs',
          },
        ],
      },
    ],
    callout: {
      tipo: 'dica',
      texto:
        '**Configurador › Histórico**: convites, permissões e segurança da conta. **Histórico do Smart Docs**: leituras, conferência, exclusão e demais mutações do produto.',
    },
  },
  {
    titulo: 'Entender as colunas',
    tituloCurto: 'Colunas',
    paragrafos: [
      'Cada linha é um evento gravado quando uma ação **persiste no servidor**: nova leitura, alteração na conferência, exclusão, etc.',
    ],
    imagem: SCREENSHOT_SMART_DOCS_HISTORICO_TABELA,
    imagemAbaixoTexto: true,
    colunasTabela: [...SMART_READ_HISTORICO_COLUNAS],
  },
  {
    titulo: 'Filtrar e exportar',
    tituloCurto: 'Filtros',
    paragrafos: [
      'Use os filtros no cabeçalho das colunas para restringir por **Ação**, **Local**, **Usuário** ou período.',
      'No menu **Exportar**, baixe os registros **visíveis na página** em Excel, CSV, TXT, XML, PDF ou JSON.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 1,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_SMART_DOCS_HISTORICO_FILTROS_EXPORTAR,
            paragrafoAntes: 'Filtros por coluna e menu **Exportar**',
          },
        ],
      },
    ],
    callout: {
      tipo: 'aviso',
      texto: 'A exportação reflete o recorte atual (filtros + página).',
    },
  },
  {
    titulo: 'Paginação',
    tituloCurto: 'Paginação',
    paragrafos: [
      'A listagem carrega **25 eventos por página**. Use **Anterior** e **Próxima** na base da tela.',
    ],
  },
  {
    titulo: 'O que o Histórico registra',
    tituloCurto: 'Eventos',
    paragrafos: [
      'O Histórico do **Smart Docs** grava mutações relevantes: **Nova Leitura**, alterações na **Conferência**, exclusão de leituras, operações via **API** e ajustes que salvam no servidor.',
      'Consultas puras (abrir Lista, filtrar sem salvar painel, expandir linhas) **não** geram linha de auditoria.',
    ],
  },
])
