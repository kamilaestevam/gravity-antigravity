/**
 * Manual Pedido §09 Histórico — paridade com §08 Configurações e Configurador › Histórico.
 * SSOT prints: Drive `1. Pedido/tela_pedido_historico_N.png` → `pedido-historico-N.png`
 */
import type { DocColunaTabela, DocPassoVisual } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

/** Drive `tela_pedido_historico_2.png` — tela de auditoria após abrir Histórico */
export const SCREENSHOT_PEDIDO_HISTORICO_TELA_PRINCIPAL =
  '/university/screenshots/pedido-historico-2.png'
/** Drive `tela_pedido_historico_1.png` — menu lateral inferior (clique em Histórico) */
const SCREENSHOT_PEDIDO_HISTORICO_MENU_SETA =
  '/university/screenshots/pedido-historico-1.png'
/** Drive `tela_pedido_historico_2.png` — tabela de eventos (mesma tela principal) */
export const SCREENSHOT_PEDIDO_HISTORICO_TABELA =
  '/university/screenshots/pedido-historico-2.png'
/** Drive `tela_pedido_historico_3.png` */
export const SCREENSHOT_PEDIDO_HISTORICO_FILTROS_EXPORTAR =
  '/university/screenshots/pedido-historico-3.png'

const PEDIDO_HISTORICO_COLUNAS_AUDITORIA: DocColunaTabela[] = [
  {
    coluna: 'Data/Hora',
    descricao: 'Momento em que o evento foi gravado (fuso da organização).',
    detalhes: ['Ordenação decrescente, com o mais recente no topo'],
  },
  {
    coluna: 'Ação',
    descricao: 'O que aconteceu, ex.: **Criou**, **Transferiu**, **Editou em massa**.',
  },
  {
    coluna: 'Local',
    descricao: 'Módulo e recurso, ex.: **Pedido | Pedido**, **Pedido | Consolidacao**.',
  },
  {
    coluna: 'Usuário',
    descricao: 'Quem fez: nome e e-mail quando o ator é pessoa.',
  },
  {
    coluna: 'Detalhes',
    descricao: 'Resumo do que mudou: número do pedido, campos alterados, ID da transferência, etc.',
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
      'A tela de **Histórico** exibe a trilha de auditoria do produto **Pedido** no workspace ativo, com a mesma interface do Configurador e escopo filtrado ao módulo. **Aqui ficam registradas as ações de todos os usuários**; o que é gravado está em {{link:/university-gravity/docs/pedido#manual-passo-historico-3|O que registra}}.',
      'Os **três cards** no topo resumem volume e distribuição dos eventos da **página atual** (25 registros por página). Passe o mouse no ícone **(i)** de cada card para ver o tooltip.',
    ],
    imagem: SCREENSHOT_PEDIDO_HISTORICO_TELA_PRINCIPAL,
    imagemAbaixoTexto: true,
    calloutAposImagem: [
      {
        tipo: 'dica',
        texto:
          '**Configurador › Histórico**: convites, permissões e segurança da conta. **Histórico do Pedido**: operações do módulo (Lista, Dashboard, Kanban, Configurações).',
      },
      {
        tipo: 'dica',
        texto: 'Apenas usuários **Master** têm acesso a esta tela.',
      },
    ],
  },
  {
    titulo: 'Como acessar',
    tituloCurto: 'Como acessar',
    paragrafos: [
      'Pelo menu lateral inferior, **Histórico** abre a trilha de auditoria **só do Pedido**, filtrada automaticamente para o workspace ativo.',
      'O histórico registra **mudanças que salvam no servidor**. Navegar, filtrar ou exportar a tabela **não** gera nova linha.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 1,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: SCREENSHOT_PEDIDO_HISTORICO_MENU_SETA,
            paragrafoAntes: '**01.** No menu lateral inferior do **Pedido**, clique em **Histórico**',
          },
          {
            legenda: '',
            imagem: SCREENSHOT_PEDIDO_HISTORICO_TELA_PRINCIPAL,
            paragrafoAntes: '**02.** A tela de auditoria abre filtrada ao produto **Pedido**',
          },
        ],
      },
    ],
    callout: {
      tipo: 'dica',
      texto:
        'O acesso exige permissão **historico:ver** no workspace. Usuários **Fornecedor** veem apenas linhas em que são ator ou alvo.',
    },
  },
  {
    titulo: 'O que registra',
    tituloCurto: 'O que registra',
    paragrafos: [
      'As ações exatas que o histórico registra estão descritas abaixo.',
    ],
    mostrarCatalogoHistoricoPedido: true,
    catalogoHistoricoPedidoAposParagrafo: 0,
    callout: {
      tipo: 'lembrete',
      texto:
        'Algumas rotas geram **dois** registros (log dedicado + captura automática), por exemplo **Duplicou** + **Criou**. Isso é esperado.',
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
          },
        ],
      },
    ],
    callout: {
      tipo: 'aviso',
      texto: 'A exportação reflete o recorte atual (filtros + página). Os cards do topo também consideram só a **página corrente**.',
    },
  },
])
