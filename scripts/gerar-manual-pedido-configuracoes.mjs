/**
 * Gera mapa de screenshots + passosVisuais da secao 08 Configuracoes (manual Pedido).
 * Uso: node scripts/gerar-manual-pedido-configuracoes.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const origemCandidatos = [
  'G:\\Meu Drive\\4. Gravity\\1. Manual e Onboarding\\1. Imagens para manual e onboarding\\6. Produtos Gravity\\1. Pedido',
  path.join(process.env.USERPROFILE ?? '', 'Google Drive', '4. Gravity', '1. Manual e Onboarding', '1. Imagens para manual e onboarding', '6. Produtos Gravity', '1. Pedido'),
  path.join(process.env.USERPROFILE ?? '', 'Meu Drive', '4. Gravity', '1. Manual e Onboarding', '1. Imagens para manual e onboarding', '6. Produtos Gravity', '1. Pedido'),
]

const origem = origemCandidatos.find((p) => fs.existsSync(p))
if (!origem) {
  console.error('Pasta do Drive nao encontrada')
  process.exit(1)
}

/** @param {string} base */
function driveBaseToSlug(base) {
  const trimmed = base.trim()
  const suffix = trimmed.replace(/^tela_pedido_configuracoes_tela_principal_?/, '')
  if (!suffix || suffix === trimmed.replace(/\s+$/, '')) {
    if (trimmed === 'tela_pedido_configuracoes_tela_principal' || trimmed.startsWith('tela_pedido_configuracoes_tela_principal ')) {
      return 'tela-principal'
    }
  }
  return suffix.toLowerCase().replace(/_/g, '-')
}

/** @param {string} slug */
function slugToConst(slug) {
  return slug.replace(/-/g, '_').toUpperCase()
}

/** @param {string} slug */
function slugToPath(slug) {
  return `/university/screenshots/pedido-configuracoes-${slug}.png`
}

/** @param {string} base */
function driveBaseToSlugFromFile(base) {
  if (base.trim() === 'tela_pedido_configuracoes_tela_principal') return 'tela-principal'
  return driveBaseToSlug(base)
}

const arquivos = fs
  .readdirSync(origem)
  .filter((f) => f.startsWith('tela_pedido_configuracoes_tela_principal') && f.endsWith('.png'))
  .map((f) => f.replace(/\.png$/i, ''))

const slugSet = new Map()
for (const base of arquivos) {
  const slug = driveBaseToSlugFromFile(base)
  slugSet.set(slug, base)
}

/** @param {string} slug */
function S(slug) {
  if (!slugSet.has(slug)) {
    throw new Error(`Screenshot ausente no Drive: ${slug}`)
  }
  return `SCREENSHOT_PEDIDO_CONFIG_${slugToConst(slug)}`
}

/** @param {string[]} slugs @param {number} [colunas] */
function galeria(slugs, colunas) {
  const cols = colunas ?? Math.min(slugs.length, 4)
  return {
    indice: 0,
    colunas: cols,
    textoAcimaEstiloCorpo: true,
    telas: slugs.map((slug, i) => ({
      legenda: '',
      imagem: `{${S(slug)}}`,
      ...(i === 0 && slugs.length === 1 ? {} : {}),
    })),
  }
}

/** @param {string} slug @param {string} paragrafoAntes */
function tela(slug, paragrafoAntes) {
  return {
    legenda: '',
    imagem: `{${S(slug)}}`,
    ...(paragrafoAntes ? { paragrafoAntes } : {}),
  }
}

/** @param {Array<{ slug: string, paragrafoAntes?: string }>} items @param {number} [colunas] */
function galeriaTelas(items, colunas) {
  const cols = colunas ?? Math.min(items.length, 4)
  return {
    indice: 0,
    colunas: cols,
    textoAcimaEstiloCorpo: true,
    telas: items.map(({ slug, paragrafoAntes }) => tela(slug, paragrafoAntes ?? '')),
  }
}

const passosSpec = [
  {
    titulo: 'Visão geral',
    tituloCurto: 'Visão geral',
    paragrafos: [
      'No menu lateral, **Configurações** reúne as preferências do produto no workspace: **Cards**, **Tabela**, **Colunas**, **Kanban**, **Status**, **Numeração** e **Templates PDF** — cada aba afeta a visualização ou regras do Pedido para todos os usuários do workspace (salvo cards e colunas da lista, que são por usuário).',
    ],
    galerias: [
      galeriaTelas([{ slug: 'tela-principal', paragrafoAntes: 'Abra **Configurações** no menu lateral do Pedido' }], 1),
    ],
  },
  {
    titulo: 'Cards — período de comparação',
    tituloCurto: 'Período cards',
    paragrafos: [
      'Em **Cards**, o **período de comparação** define o recorte usado nos indicadores de tendência dos cards ativos no topo da **Lista** e **Insights**.',
    ],
    galerias: [
      galeriaTelas([{ slug: 'cards-periodo-comparacao', paragrafoAntes: 'Escolha **7 dias**, **30 dias**, **6 meses**, **1 ano** ou **Tudo**' }], 1),
    ],
  },
  {
    titulo: 'Cards — adicionar',
    tituloCurto: 'Adicionar card',
    paragrafos: [
      'Na lista **Disponíveis para adicionar**, clique em **+** para incluir um card em **Ativos**. Use **Ver detalhes** para conferir campo base, agregação e origem antes de salvar.',
    ],
    galerias: [
      galeriaTelas(
        [
          { slug: 'cards-ativos-disponiveis-adicionar', paragrafoAntes: '**01.** Clique em **+** no card desejado' },
          { slug: 'cards-ativos-disponiveis-adicionar-ver-detalhes', paragrafoAntes: '**02.** **Ver detalhes** do card' },
          { slug: 'cards-ativos-disponiveis-adicionar-ver-detalhes-aberto', paragrafoAntes: '**03.** Painel com campo, agregação e origem' },
        ],
        3,
      ),
    ],
  },
  {
    titulo: 'Cards — ocultar e exibir',
    tituloCurto: 'Ocultar card',
    paragrafos: [
      'Use o ícone de **olho** para **ocultar** um card ativo sem removê-lo da lista — ele permanece em **Disponíveis** e pode ser **exibido** de novo.',
    ],
    galerias: [
      galeriaTelas(
        [
          { slug: 'cards-ativos-disponiveis-ocultar-seta', paragrafoAntes: '**01.** Clique no **olho** do card ativo' },
          { slug: 'cards-ativos-disponiveis-ocultado', paragrafoAntes: '**02.** Card **oculto** — some do topo da tela' },
          { slug: 'cards-ativos-disponiveis-ocultado-exibido', paragrafoAntes: '**03.** Card de volta em **Ativos**' },
          { slug: 'cards-ativos-disponiveis-ocultado-exibir', paragrafoAntes: '**04.** **Exibir** novamente na lista' },
        ],
        2,
      ),
    ],
  },
  {
    titulo: 'Cards — remover da lista',
    tituloCurto: 'Remover card',
    paragrafos: [
      '**Remover da lista** tira o card de **Ativos** e de **Disponíveis**. Confirme em **Salvar** — a alteração vale para o seu usuário; o card some do topo da **Lista**.',
    ],
    galerias: [
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          tela('cards-ativos-disponiveis-remover-lista-seta', '**01.** Clique em **×** para remover da lista'),
          tela('cards-ativos-disponiveis-remover-lista-card-lista', '**02.** Card sai de **Ativos**'),
          tela('cards-ativos-disponiveis-remover-lista-salvar', '**03.** Clique em **Salvar**'),
          tela('cards-ativos-disponiveis-remover-lista-salvar-confirmacao-1', '**04.** Confirme a remoção'),
          tela('cards-ativos-disponiveis-remover-lista-salvar-confirmacao-2', '**05.** Preferências **salvas**'),
          tela(
            'cards-ativos-disponiveis-remover-lista-salvar-confirmacao-nao-esta-tela-lista',
            '**06.** Na **Lista**, o card não aparece mais no topo',
          ),
        ],
      },
    ],
  },
  {
    titulo: 'Cards — detalhes ao remover',
    tituloCurto: 'Detalhes do card',
    paragrafos: [
      'Antes de remover, **Ver detalhes** mostra **campo base**, **agregação**, **origem** e **período** — útil para saber o que deixa de ser exibido.',
    ],
    galerias: [
      galeriaTelas(
        [
          { slug: 'cards-ativos-disponiveis-remover-informacao', paragrafoAntes: 'Abra **Ver detalhes** antes de remover' },
          { slug: 'cards-ativos-disponiveis-remover-informacao-detalhes', paragrafoAntes: 'Resumo do card: campo, agregação e origem' },
        ],
        2,
      ),
    ],
  },
  {
    titulo: 'Cards — reativar após remover',
    tituloCurto: 'Reativar card',
    paragrafos: [
      'Depois de remover, o card volta para **Disponíveis** — use **+** para **reativá-lo** e **Salvar** para aplicar.',
    ],
    galerias: [
      galeriaTelas(
        [
          { slug: 'cards-ativos-disponiveis-remover-ativar-fluxo-1', paragrafoAntes: '**01.** Card em **Disponíveis** após remoção' },
          { slug: 'cards-ativos-disponiveis-remover-ativar-fluxo-2', paragrafoAntes: '**02.** **+** para adicionar de volta' },
          { slug: 'cards-ativos-disponiveis-remover-ativar-fluxo-3', paragrafoAntes: '**03.** **Salvar** — card ativo novamente' },
        ],
        3,
      ),
    ],
  },
  {
    titulo: 'Tabela',
    tituloCurto: 'Tabela',
    paragrafos: [
      'Em **Tabela**, defina **linhas por página** padrão da lista virtual e se pedidos **atrasados** devem ser **destacados em vermelho**.',
    ],
    galerias: [
      galeriaTelas(
        [
          { slug: 'tabela-linhas-pagina', paragrafoAntes: '**01.** **Linhas por página** padrão' },
          { slug: 'tabela-linhas-pagina-1', paragrafoAntes: '**02.** Selecione a quantidade (ex.: 25, 50, 100)' },
          { slug: 'tabela-pedidos-em-atraso-vermelho', paragrafoAntes: '**03.** **Destacar pedidos atrasados em vermelho**' },
        ],
        3,
      ),
    ],
  },
  {
    titulo: 'Colunas — casas decimais',
    tituloCurto: 'Casas decimais',
    paragrafos: [
      '**Casas decimais** define quantas casas exibir em colunas numéricas de **pedido** e **item**. Alterar valores existentes pode disparar **migração em background** — confirme o banner quando aparecer.',
    ],
    galerias: [
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          tela('colunas-casas-decimais', 'Visão das colunas numéricas e grupos **Pedido** / **Personalizadas**'),
          tela('colunas-casas-decimais-editar-1', '**01.** Ajuste casas decimais de uma coluna'),
          tela('colunas-casas-decimais-editar-2', '**02.** Use **−** e **+** ou digite o valor'),
          tela('colunas-casas-decimais-editar-3', '**03.** Itens **herdam** casas do pedido pai quando aplicável'),
          tela('colunas-casas-decimais-editar-4', '**04.** Banner de **migração** em pedidos existentes'),
          tela('colunas-casas-decimais-editar-5', '**05.** Confirme e **Salvar**'),
        ],
      },
    ],
  },
  {
    titulo: 'Colunas — formato de data',
    tituloCurto: 'Formato de data',
    paragrafos: [
      '**Formato de Data** padroniza como datas aparecem na **Lista** e demais telas — escolha o padrão do workspace e salve.',
    ],
    galerias: [
      galeriaTelas(
        [
          { slug: 'colunas-formato-data', paragrafoAntes: '**01.** Abra **Colunas › Formato de Data**' },
          { slug: 'colunas-formato-data-fluxo-1', paragrafoAntes: '**02.** Selecione o **formato** (ex.: DD/MM/AAAA)' },
          { slug: 'colunas-formato-data-fluxo-2', paragrafoAntes: '**03.** Preview do formato escolhido' },
          { slug: 'colunas-formato-data-fluxo-3', paragrafoAntes: '**04.** **Salvar** preferências' },
        ],
        2,
      ),
    ],
  },
  {
    titulo: 'Colunas personalizadas — visão geral',
    tituloCurto: 'Personalizadas',
    paragrafos: [
      '**Personalizadas** lista colunas criadas pelo workspace. **Arraste** para reordenar, **olho** para ocultar, **+ Criar Coluna** para novos tipos (**Texto**, **Numérico**, **Data**, **Percentual**, **Lista**, **Checkbox**, **Tipo Documento**, **Fórmula**).',
    ],
    galerias: [
      galeriaTelas([{ slug: 'colunas-personalizadas', paragrafoAntes: 'Lista de colunas customizadas do workspace' }], 1),
    ],
  },
  {
    titulo: 'Criar coluna — Texto',
    tituloCurto: 'Coluna Texto',
    paragrafos: ['Fluxo para coluna **Texto** — nome e visibilidade na lista.'],
    galerias: [
      galeriaTelas(
        [
          { slug: 'colunas-personalizadas-criar-coluna-1', paragrafoAntes: '**01.** **+ Criar Coluna**' },
          { slug: 'colunas-personalizadas-criar-coluna-2', paragrafoAntes: '**02.** Escolha tipo **Texto**' },
          { slug: 'colunas-personalizadas-criar-coluna-texto', paragrafoAntes: '**03.** Modal de criação' },
          { slug: 'colunas-personalizadas-criar-coluna-texto-1', paragrafoAntes: '**04.** Informe o **nome**' },
          { slug: 'colunas-personalizadas-criar-coluna-texto-na-tela', paragrafoAntes: '**05.** Coluna visível na **Lista** após salvar' },
        ],
        1,
      ),
    ],
  },
  {
    titulo: 'Criar coluna — Numérico',
    tituloCurto: 'Coluna Numérico',
    paragrafos: ['Coluna **Numérico** para valores quantitativos customizados.'],
    galerias: [
      galeriaTelas(
        [
          { slug: 'colunas-personalizadas-criar-coluna-numero-1', paragrafoAntes: '**01.** Tipo **Numérico**' },
          { slug: 'colunas-personalizadas-criar-coluna-numero-2', paragrafoAntes: '**02.** Nome e opções' },
          { slug: 'colunas-personalizadas-criar-coluna-numero-3', paragrafoAntes: '**03.** **Salvar** coluna' },
        ],
        3,
      ),
    ],
  },
  {
    titulo: 'Criar coluna — Data',
    tituloCurto: 'Coluna Data',
    paragrafos: ['Coluna **Data** para campos de calendário customizados.'],
    galerias: [
      galeriaTelas(
        [
          { slug: 'colunas-personalizadas-criar-coluna-data-1', paragrafoAntes: '**01.** Tipo **Data**' },
          { slug: 'colunas-personalizadas-criar-coluna-data-2', paragrafoAntes: '**02.** Configure nome e formato' },
          { slug: 'colunas-personalizadas-criar-coluna-data-3', paragrafoAntes: '**03.** Coluna criada' },
        ],
        3,
      ),
    ],
  },
  {
    titulo: 'Criar coluna — Percentual',
    tituloCurto: 'Coluna Percentual',
    paragrafos: ['Coluna **Percentual %** para indicadores em percentual.'],
    galerias: [
      galeriaTelas(
        [
          { slug: 'colunas-personalizadas-criar-coluna-percentual-1', paragrafoAntes: '**01.** Tipo **Percentual**' },
          { slug: 'colunas-personalizadas-criar-coluna-percentual-2', paragrafoAntes: '**02.** Nome da coluna' },
          { slug: 'colunas-personalizadas-criar-coluna-percentual-3', paragrafoAntes: '**03.** **Salvar**' },
        ],
        3,
      ),
    ],
  },
  {
    titulo: 'Criar coluna — Lista (Select)',
    tituloCurto: 'Coluna Lista',
    paragrafos: ['Coluna **Select/Lista** — defina opções fixas para seleção na tabela.'],
    galerias: [
      galeriaTelas(
        [
          { slug: 'colunas-personalizadas-criar-coluna-lista-1', paragrafoAntes: '**01.** Tipo **Select/Lista**' },
          { slug: 'colunas-personalizadas-criar-coluna-lista-2', paragrafoAntes: '**02.** Cadastre **opções**' },
          { slug: 'colunas-personalizadas-criar-coluna-lista-3', paragrafoAntes: '**03.** Revise opções' },
          { slug: 'colunas-personalizadas-criar-coluna-lista-4', paragrafoAntes: '**04.** **Salvar** coluna' },
        ],
        2,
      ),
    ],
  },
  {
    titulo: 'Criar coluna — Checkbox',
    tituloCurto: 'Coluna Checkbox',
    paragrafos: ['Coluna **Checkbox** para flags booleanas na lista.'],
    galerias: [
      galeriaTelas(
        [
          { slug: 'colunas-personalizadas-criar-coluna-checkbox-1', paragrafoAntes: '**01.** Tipo **Checkbox**' },
          { slug: 'colunas-personalizadas-criar-coluna-checkbox-2', paragrafoAntes: '**02.** Nome da coluna' },
          { slug: 'colunas-personalizadas-criar-coluna-checkbox-3', paragrafoAntes: '**03.** **Salvar**' },
        ],
        3,
      ),
    ],
  },
  {
    titulo: 'Criar coluna — Tipo Documento',
    tituloCurto: 'Tipo Documento',
    paragrafos: ['Coluna **Tipo Documento** para classificar anexos ou documentos vinculados.'],
    galerias: [
      galeriaTelas(
        [
          { slug: 'colunas-personalizadas-criar-coluna-tipo-documento-1', paragrafoAntes: '**01.** Tipo **Tipo Documento**' },
          { slug: 'colunas-personalizadas-criar-coluna-tipo-documento-2', paragrafoAntes: '**02.** Configure opções' },
          { slug: 'colunas-personalizadas-criar-coluna-tipo-documento-3', paragrafoAntes: '**03.** **Salvar**' },
        ],
        3,
      ),
    ],
  },
  {
    titulo: 'Criar coluna — Fórmula',
    tituloCurto: 'Coluna Fórmula',
    paragrafos: ['Coluna **Fórmula** calcula valores a partir de outros campos — uma fórmula por tenant no backend.'],
    galerias: [
      galeriaTelas(
        [
          { slug: 'colunas-personalizadas-criar-coluna-tipo-formula-1', paragrafoAntes: '**01.** Tipo **Fórmula**' },
          { slug: 'colunas-personalizadas-criar-coluna-tipo-formula-2', paragrafoAntes: '**02.** Editor de expressão' },
          { slug: 'colunas-personalizadas-criar-coluna-tipo-formula-3', paragrafoAntes: '**03.** Valide a fórmula' },
          { slug: 'colunas-personalizadas-criar-coluna-tipo-formula-4', paragrafoAntes: '**04.** **Salvar** coluna calculada' },
        ],
        2,
      ),
    ],
  },
  {
    titulo: 'Editar coluna personalizada',
    tituloCurto: 'Editar coluna',
    paragrafos: ['Clique no **lápis** para editar nome, tipo ou opções de uma coluna existente.'],
    galerias: [
      galeriaTelas(
        [
          { slug: 'colunas-personalizadas-editar-coluna-1', paragrafoAntes: '**01.** **Editar** coluna' },
          { slug: 'colunas-personalizadas-editar-coluna-3', paragrafoAntes: '**02.** Alterações e **Salvar**' },
        ],
        2,
      ),
    ],
  },
  {
    titulo: 'Ocultar coluna personalizada',
    tituloCurto: 'Ocultar coluna',
    paragrafos: ['**Olho** oculta a coluna na **Lista** sem excluir — dados permanecem no banco.'],
    galerias: [
      galeriaTelas(
        [
          { slug: 'colunas-personalizadas-ocultar-coluna-1', paragrafoAntes: '**01.** **Ocultar** coluna' },
          { slug: 'colunas-personalizadas-ocultar-coluna-2', paragrafoAntes: '**02.** Coluna oculta na lista' },
          { slug: 'colunas-personalizadas-ocultar-coluna-4', paragrafoAntes: '**03.** **Exibir** novamente' },
          { slug: 'colunas-personalizadas-ocultar-coluna-5', paragrafoAntes: '**04.** Coluna visível de volta' },
        ],
        2,
      ),
    ],
  },
  {
    titulo: 'Excluir coluna personalizada',
    tituloCurto: 'Excluir coluna',
    paragrafos: ['**Excluir** remove a coluna customizada do workspace — operação irreversível; confirme no modal.'],
    galerias: [
      galeriaTelas(
        [
          { slug: 'colunas-personalizadas-excluir-coluna-1', paragrafoAntes: '**01.** **Excluir** coluna' },
          { slug: 'colunas-personalizadas-excluir-coluna-2', paragrafoAntes: '**02.** Confirme a exclusão' },
          { slug: 'colunas-personalizadas-excluir-coluna-3', paragrafoAntes: '**03.** Coluna removida da lista' },
          { slug: 'colunas-personalizadas-excluir-coluna-4', paragrafoAntes: '**04.** Estado final após salvar' },
        ],
        2,
      ),
    ],
  },
  {
    titulo: 'Campos calculados',
    tituloCurto: 'Campos calculados',
    paragrafos: [
      '**Campos Calculados** concentra fórmulas de saldo e métricas derivadas aplicadas aos pedidos do workspace.',
    ],
    galerias: [
      galeriaTelas([{ slug: 'colunas-campos-calculados', paragrafoAntes: 'Configure fórmulas e campos derivados' }], 1),
    ],
  },
  {
    titulo: 'Kanban — colunas',
    tituloCurto: 'Kanban colunas',
    paragrafos: [
      'Em **Kanban › Colunas**, escolha quais **status** aparecem como colunas no board — **olho** para ocultar, **+** para trazer status disponíveis.',
    ],
    galerias: [
      galeriaTelas(
        [
          { slug: 'kanban-colunas', paragrafoAntes: '**01.** Visão **Colunas** do Kanban' },
          { slug: 'kanban-colunas-1', paragrafoAntes: '**02.** Colunas **ativas**' },
          { slug: 'kanban-colunas-2', paragrafoAntes: '**03.** **Ocultar** coluna de status' },
          { slug: 'kanban-colunas-3', paragrafoAntes: '**04.** Status **disponíveis** para adicionar' },
          { slug: 'kanban-colunas-4', paragrafoAntes: '**05.** **Salvar** preferências' },
        ],
        1,
      ),
    ],
  },
  {
    titulo: 'Kanban — card',
    tituloCurto: 'Kanban card',
    paragrafos: [
      '**Kanban › Card** define campos visíveis em cada cartão: número, parceiro, data crítica, valor, incoterm e demais — **arraste** para reordenar.',
    ],
    galerias: [
      galeriaTelas(
        [
          { slug: 'kanban-card-1', paragrafoAntes: '**01.** Campos **ativos** no card' },
          { slug: 'kanban-card-2', paragrafoAntes: '**02.** **Olho** para ocultar campo' },
          { slug: 'kanban-card-3', paragrafoAntes: '**03.** **Data crítica** e urgência' },
          { slug: 'kanban-card-4', paragrafoAntes: '**04.** Preview e **Salvar**' },
        ],
        2,
      ),
    ],
  },
  {
    titulo: 'Kanban — modal',
    tituloCurto: 'Kanban modal',
    paragrafos: [
      '**Kanban › Modal** configura as abas **Pedido**, **Quantidades**, **Datas** e **Lembrete** ao clicar um cartão — adicione, remova ou reordene campos por aba.',
    ],
    galerias: [
      galeriaTelas(
        [
          { slug: 'kanban-modal-1', paragrafoAntes: '**01.** Aba **Pedido** — campos do modal' },
          { slug: 'kanban-modal-2', paragrafoAntes: '**02.** Aba **Quantidades**' },
          { slug: 'kanban-modal-3', paragrafoAntes: '**03.** Aba **Datas**' },
          { slug: 'kanban-modal-4', paragrafoAntes: '**04.** Preview e **Salvar**' },
        ],
        2,
      ),
    ],
  },
  {
    titulo: 'Status do pedido',
    tituloCurto: 'Status',
    paragrafos: [
      '**Status** lista todos os status do workspace. **Arraste** para reordenar (reflete no Kanban). Status de **sistema** são fixos — sem editar ou excluir.',
    ],
    galerias: [
      galeriaTelas(
        [
          { slug: 'status-1', paragrafoAntes: '**01.** Lista de status' },
          { slug: 'status-2', paragrafoAntes: '**02.** Badge **sistema** em status fixos' },
          { slug: 'status-3', paragrafoAntes: '**03.** **Editar** status customizado' },
          { slug: 'status-4', paragrafoAntes: '**04.** **Cor** e **nome**' },
          { slug: 'status-5', paragrafoAntes: '**05.** **Excluir** status (quando permitido)' },
          { slug: 'status-6', paragrafoAntes: '**06.** Confirmação de exclusão' },
          { slug: 'status-7', paragrafoAntes: '**07.** **Salvar** alterações' },
        ],
        1,
      ),
    ],
  },
  {
    titulo: 'Status — novo e reordenar',
    tituloCurto: 'Novo status',
    paragrafos: [
      '**Novo Status** cria etapas customizadas. **Arraste** a alça para reordenar — a ordem vale para **Lista**, **Kanban** e filtros.',
    ],
    galerias: [
      galeriaTelas(
        [
          { slug: 'status-novo-1', paragrafoAntes: '**01.** Clique em **Novo Status**' },
          { slug: 'status-novo-2', paragrafoAntes: '**02.** Nome e **cor**' },
          { slug: 'status-novo-3', paragrafoAntes: '**03.** Status criado na lista' },
          { slug: 'status-novo-4', paragrafoAntes: '**04.** **Salvar**' },
          { slug: 'status-arrastar-1', paragrafoAntes: '**05.** **Arraste** para reordenar' },
          { slug: 'status-arrastar-2', paragrafoAntes: '**06.** Nova ordem aplicada' },
        ],
        2,
      ),
    ],
  },
  {
    titulo: 'Numeração automática',
    tituloCurto: 'Numeração',
    paragrafos: [
      '**Numeração** define **prefixo**, **dígitos**, **ano** e **reinício** do número automático de pedidos — preview mostra o formato antes de salvar.',
    ],
    galerias: [
      galeriaTelas([{ slug: 'numeracao', paragrafoAntes: 'Configure formato, prefixo e regras de sequência' }], 1),
    ],
  },
]

// Collect all slugs used
const usedSlugs = new Set()
for (const passo of passosSpec) {
  for (const gal of passo.galerias) {
    for (const t of gal.telas) {
      const m = t.imagem.match(/\{SCREENSHOT_PEDIDO_CONFIG_(\w+)\}/)
      if (m) usedSlugs.add(m[1].toLowerCase().replace(/_/g, '-'))
    }
  }
}

// Verify all drive files are mapped
const allSlugs = [...slugSet.keys()]
const unused = allSlugs.filter((s) => !usedSlugs.has(s))
if (unused.length) {
  console.warn('Screenshots no Drive nao usados no manual:', unused.join(', '))
}

for (const slug of usedSlugs) {
  if (!slugSet.has(slug)) {
    console.error('Slug referenciado mas ausente no Drive:', slug)
    process.exit(1)
  }
}

// Generate ps1 map entries
const ps1Lines = [...slugSet.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([slug, base]) => {
    const dest = `pedido-configuracoes-${slug}.png`
    const key = base.trim() === 'tela_pedido_configuracoes_tela_principal' ? base : base.trim()
    return `  '${key}' = '${dest}'`
  })

const ps1Path = path.join(root, 'scripts', 'copiar-screenshots-manual-pedido.ps1')
let ps1 = fs.readFileSync(ps1Path, 'utf8')
const marker = '  # Kanban'
const insertBlock = `  # Configuracoes (tela principal)\n${ps1Lines.join('\n')}\n  # Kanban`
if (!ps1.includes('# Configuracoes (tela principal)')) {
  ps1 = ps1.replace(marker, insertBlock)
  fs.writeFileSync(ps1Path, ps1)
  console.log(`Atualizado ${ps1Path} com ${ps1Lines.length} entradas`)
}

// Generate constants
const constLines = [...slugSet.keys()]
  .sort()
  .map((slug) => `export const SCREENSHOT_PEDIDO_CONFIG_${slugToConst(slug)} = '${slugToPath(slug)}'`)

// Generate passos TS
function serializePassos() {
  const lines = []
  for (const p of passosSpec) {
    lines.push('    {')
    lines.push(`      titulo: ${JSON.stringify(p.titulo)},`)
    lines.push(`      tituloCurto: ${JSON.stringify(p.tituloCurto)},`)
    lines.push(`      paragrafos: [`)
    for (const para of p.paragrafos) {
      lines.push(`        ${JSON.stringify(para)},`)
    }
    lines.push(`      ],`)
    lines.push(`      galeriaComparacaoAposParagrafo: [`)
    for (const gal of p.galerias) {
      lines.push(`        {`)
      lines.push(`          indice: ${gal.indice},`)
      lines.push(`          colunas: ${gal.colunas},`)
      lines.push(`          textoAcimaEstiloCorpo: true,`)
      lines.push(`          telas: [`)
      for (const t of gal.telas) {
        const img = t.imagem.replace(/^\{|\}$/g, '')
        lines.push(`            {`)
        lines.push(`              legenda: '',`)
        lines.push(`              imagem: ${img},`)
        if (t.paragrafoAntes) {
          lines.push(`              paragrafoAntes: ${JSON.stringify(t.paragrafoAntes)},`)
        }
        lines.push(`            },`)
      }
      lines.push(`          ],`)
      lines.push(`        },`)
    }
    lines.push(`      ],`)
    lines.push(`    },`)
  }
  return lines.join('\n')
}

const outPath = path.join(
  root,
  'servicos-global/configurador/src/pages/university/manual-pedido-configuracoes-conteudo.ts',
)

const fileContent = `/**
 * Manual Pedido §08 Configuracoes — gerado por scripts/gerar-manual-pedido-configuracoes.mjs
 * Regere apos adicionar prints no Drive: node scripts/gerar-manual-pedido-configuracoes.mjs
 */
import type { DocPassoVisual } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

${constLines.join('\n')}

function renumerarPassosConfig(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const PASSOS_MANUAL_PEDIDO_CONFIGURACOES: DocPassoVisual[] = renumerarPassosConfig([
${serializePassos()}
])
`

fs.writeFileSync(outPath, fileContent)
console.log(`Gerado ${outPath}`)
console.log(`${slugSet.size} screenshots, ${passosSpec.length} passos`)
