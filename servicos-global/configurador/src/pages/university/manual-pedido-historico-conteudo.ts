/**
 * Manual Pedido §09 Histórico — paridade com §08 Configurações e Configurador › Histórico.
 * SSOT prints: Drive `1. Pedido/tela_pedido_historico_N.png` → `pedido-historico-N.png`
 */
import type { DocColunaTabela, DocPassoVisual } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

/** Drive `tela_pedido_historico_1.png` */
export const SCREENSHOT_PEDIDO_HISTORICO_TELA_PRINCIPAL =
  '/university/screenshots/pedido-historico-1.png'
/** Drive `tela_pedido_historico_2.png` */
export const SCREENSHOT_PEDIDO_HISTORICO_TABELA =
  '/university/screenshots/pedido-historico-2.png'
/** Drive `tela_pedido_historico_3.png` */
export const SCREENSHOT_PEDIDO_HISTORICO_FILTROS_EXPORTAR =
  '/university/screenshots/pedido-historico-3.png'

const PEDIDO_HISTORICO_COLUNAS_AUDITORIA: DocColunaTabela[] = [
  {
    coluna: 'Data/Hora',
    descricao: 'Momento em que o evento foi gravado (fuso da organização).',
    detalhes: ['Ordenação decrescente — o mais recente no topo'],
  },
  {
    coluna: 'Ação',
    descricao: 'O que aconteceu — ex.: **Criou**, **Transferiu**, **Editou em massa**.',
  },
  {
    coluna: 'Local',
    descricao: 'Módulo e recurso — ex.: **Pedido | Pedido**, **Pedido | Consolidacao**.',
  },
  {
    coluna: 'Usuário',
    descricao: 'Quem fez: nome e e-mail quando o ator é pessoa.',
  },
  {
    coluna: 'Detalhes',
    descricao: 'Resumo do que mudou — número do pedido, campos alterados, ID da transferência, etc.',
  },
]

function renumerarPassosHistorico(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const PASSOS_MANUAL_PEDIDO_HISTORICO: DocPassoVisual[] = renumerarPassosHistorico([
  {
    titulo: 'Visão geral',
    tituloCurto: 'Visão geral',
    paragrafos: [
      'No menu lateral inferior do **Pedido**, clique em **Histórico**. A tela abre no serviço de auditoria da organização, já filtrada para eventos do produto **Pedido** no workspace ativo.',
      'Os **três cards** no topo resumem volume e distribuição dos eventos da **página atual** (25 registros por página). Passe o mouse no ícone **(i)** de cada card para ver o tooltip.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 1,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_PEDIDO_HISTORICO_TELA_PRINCIPAL,
            paragrafoAntes: 'Abra **Histórico** no menu lateral do Pedido',
          },
        ],
      },
    ],
    callout: {
      tipo: 'dica',
      texto:
        '**Configurador › Histórico** — convites, permissões e segurança da conta. **Histórico do Pedido** — operações do módulo (Lista, Dashboard, Kanban, Configurações).',
    },
  },
  {
    titulo: 'O que registra',
    tituloCurto: 'O que registra',
    paragrafos: [
      'Referência completa do que o Histórico do **Pedido** grava no servidor — extraída do código (`auditLog` dedicado + captura automática de mutações na API). Expanda cada grupo para ver **código**, **rótulo na coluna Ação**, **tela de origem** e **quando acontece**.',
    ],
    mostrarCatalogoHistoricoPedido: true,
    catalogoHistoricoPedidoAposParagrafo: 0,
    callout: {
      tipo: 'lembrete',
      texto:
        'Algumas rotas geram **dois** registros (log dedicado + captura automática) — por exemplo **Duplicou** + **Criou**. Isso é esperado.',
    },
  },
  {
    titulo: 'Entender as colunas',
    tituloCurto: 'Colunas',
    paragrafos: [
      'Cada linha é um evento gravado automaticamente quando uma ação **persiste no servidor**.',
    ],
    imagem: SCREENSHOT_PEDIDO_HISTORICO_TABELA,
    imagemAbaixoTexto: true,
    colunasTabela: [...PEDIDO_HISTORICO_COLUNAS_AUDITORIA],
  },
  {
    titulo: 'Filtrar e exportar',
    tituloCurto: 'Filtros',
    paragrafos: [
      'Use os filtros no cabeçalho das colunas para restringir por **Ação**, **Local**, **Usuário** ou período. A busca textual percorre **Detalhes** e o nome do ator.',
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
            imagem: SCREENSHOT_PEDIDO_HISTORICO_FILTROS_EXPORTAR,
            paragrafoAntes: 'Filtros por coluna e menu **Exportar**',
          },
        ],
      },
    ],
    callout: {
      tipo: 'aviso',
      texto: 'A exportação reflete o recorte atual (filtros + página). Os cards do topo também consideram só a **página corrente**.',
    },
  },
  {
    titulo: 'Paginação',
    tituloCurto: 'Paginação',
    paragrafos: [
      'A listagem carrega **25 eventos por página**. Use **Anterior** e **Próxima** na base da tela para percorrer o histórico completo do workspace.',
    ],
  },
])
