/**
 * SSOT — eventos do Histórico do produto Pedido.
 * Fonte: auditLog explícito + createProductAuditPlugin (POST/PUT/PATCH/DELETE com res.json).
 * Rótulos da coluna Ação: historico-helpers.ts → rotuloAcao().
 * Nomes de tela: manual Pedido (Lista, Dashboard, Kanban, Configurações, Histórico).
 */

import { rotuloAcao } from '../../utils/historico-helpers'

export type EventoCatalogoHistoricoPedido = {
  acao: string
  rotulo: string
  tela: string
  quando: string
  /** Duplicata esperada (log dedicado + captura automática). */
  observacao?: string
}

export type GrupoCatalogoHistoricoPedido = {
  id: string
  titulo: string
  descricao?: string
  eventos: EventoCatalogoHistoricoPedido[]
}

function evt(
  acao: string,
  tela: string,
  quando: string,
  observacao?: string,
): EventoCatalogoHistoricoPedido {
  return {
    acao,
    rotulo: rotuloAcao(acao),
    tela,
    quando,
    ...(observacao ? { observacao } : {}),
  }
}

/** Ações com auditLog dedicado (verbo próprio na coluna Ação). */
const GRUPO_ACOES_DEDICADAS: GrupoCatalogoHistoricoPedido = {
  id: 'acoes-dedicadas',
  titulo: 'Ações dedicadas do Pedido',
  descricao:
    'Operações especiais gravadas com verbo próprio — além da captura automática da API, quando aplicável.',
  eventos: [
    evt('DUPLICAR', 'Lista › Duplicar', 'Confirmar duplicação de pedido ou itens selecionados.', 'Pode gerar também **Atualizou/Criou** na captura automática.'),
    evt('TRANSFERIR', 'Lista › Transferir', 'Confirmar transferência de quantidades entre workspaces.'),
    evt('REVERTER_TRANSFERENCIA', 'Lista › Transferir', 'Reverter uma transferência já concluída.'),
    evt('CONSOLIDAR', 'Lista › Consolidar', 'Confirmar união de pedidos em um só.'),
    evt('EDITAR_EM_MASSA', 'Lista › Edição em massa', 'Confirmar alteração em lote de campos na seleção.'),
    evt('EXCLUIR', 'Lista › Excluir', 'Confirmar exclusão definitiva (hard delete) de pedido(s).', 'Pode gerar também **Excluiu** na captura automática.'),
    evt('EXCLUIR_ITENS', 'Lista › Excluir', 'Confirmar remoção de itens selecionados de um pedido.'),
    evt('EXCLUIR_AUTOMATICAMENTE', 'Lista', 'Pedido excluído sozinho por ficar sem itens após remoções.'),
  ],
}

const GRUPO_LISTA_PEDIDO_ITENS: GrupoCatalogoHistoricoPedido = {
  id: 'lista-pedido-itens',
  titulo: 'Lista — pedido e itens',
  descricao: 'CRUD principal e edição in place na tabela ou drawer.',
  eventos: [
    evt('CRIAR', 'Lista', 'Criar **Novo pedido** (manual, API Cockpit ou fluxo pós-importação).'),
    evt('ATUALIZAR', 'Lista', 'Salvar pedido no **drawer** ou formulário completo.'),
    evt('ATUALIZAR', 'Lista', 'Editar **célula in place** de campo do pedido (Enter ou Salvar).'),
    evt('ATUALIZAR', 'Lista · Kanban', 'Alterar **status** do pedido (patch de status — lista, Kanban ou lote).'),
    evt('EXCLUIR', 'Lista', 'Excluir pedido via rota DELETE (quando usada).'),
    evt('CRIAR', 'Lista', 'Adicionar **item** a um pedido.'),
    evt('ATUALIZAR', 'Lista', 'Salvar **item** no drawer ou formulário.'),
    evt('ATUALIZAR', 'Lista', 'Editar **célula in place** de campo do item.'),
    evt('ATUALIZAR', 'Lista', '**Cancelar** item ou marcar como **pronta**.'),
    evt('EXCLUIR', 'Lista', 'Excluir **item** individual (DELETE).'),
    evt('ATUALIZAR', 'Lista', '**Reordenar** itens por arraste na grade expandida.'),
  ],
}

const GRUPO_LISTA_OPERACOES: GrupoCatalogoHistoricoPedido = {
  id: 'lista-operacoes',
  titulo: 'Lista — operações em lote e fluxos',
  descricao: 'Modais com preview + confirmar; previews também geram linha (captura automática).',
  eventos: [
    evt('CRIAR', 'Lista › Duplicar', 'Executar **preview** da duplicação.'),
    evt('CRIAR', 'Lista › Excluir', 'Executar **preview** da exclusão.'),
    evt('CRIAR', 'Lista › Transferir', 'Executar **preview** da transferência.'),
    evt('CRIAR', 'Lista › Consolidar', 'Executar **preview** da consolidação.'),
    evt('CRIAR', 'Lista › Edição em massa', 'Executar **preview** da edição em massa.'),
    evt('CRIAR', 'Lista', 'Executar **preview** de alteração de **status em lote**.'),
    evt('CRIAR', 'Lista', 'Confirmar alteração de **status em lote** na seleção.'),
  ],
}

const GRUPO_LISTA_IMPORT_EXPORT: GrupoCatalogoHistoricoPedido = {
  id: 'lista-import-export',
  titulo: 'Lista — importação e exportação',
  eventos: [
    evt('CRIAR', 'Lista › Importar', '**Smart Import** — analisar planilha enviada.'),
    evt('CRIAR', 'Lista › Importar', '**Smart Import** — confirmar importação após mapeamento.'),
    evt('CRIAR', 'Lista › Importar', '**Smart Import** — salvar **mapeamento** de colunas para reutilizar.'),
    evt('CRIAR', 'Lista › Importar', '**Smart Import** — **reverter** uma importação concluída.'),
    evt('CRIAR', 'Lista › Importar', 'Importação legada — enviar planilha (**importar**).'),
    evt('CRIAR', 'Lista › Importar', 'Importação legada — **confirmar** gravação.'),
    evt('CRIAR', 'Lista › Exportar', 'Gerar **exportação** da seleção ou recorte filtrado.'),
  ],
}

const GRUPO_LISTA_PERSONALIZACAO: GrupoCatalogoHistoricoPedido = {
  id: 'lista-personalizacao',
  titulo: 'Lista — painéis, colunas e preferências',
  eventos: [
    evt('CRIAR', 'Lista › Painéis', 'Criar **painel** (aba) com filtros e layout salvos.'),
    evt('ATUALIZAR', 'Lista › Painéis', 'Renomear ou editar painel ativo.'),
    evt('ATUALIZAR', 'Lista › Painéis', '**Reordenar** painéis por arraste.'),
    evt('EXCLUIR', 'Lista › Painéis', 'Excluir painel personalizado.'),
    evt('CRIAR', 'Lista › Colunas', 'Criar **coluna personalizada** (menu Colunas).'),
    evt('ATUALIZAR', 'Lista › Colunas', 'Editar definição de coluna personalizada.'),
    evt('ATUALIZAR', 'Lista › Colunas', '**Reordenar** colunas personalizadas.'),
    evt('ATUALIZAR', 'Lista › Colunas', 'Salvar **valor** em coluna personalizada (tipo livre).'),
    evt('CRIAR', 'Lista › Colunas', '**Analisar via Gabi** ao criar coluna por linguagem natural.'),
    evt('EXCLUIR', 'Lista › Colunas', 'Excluir coluna personalizada.'),
    evt('ATUALIZAR', 'Lista', 'Salvar **preferências de colunas** (visibilidade, ordem, escopo multi-workspace).'),
  ],
}

const GRUPO_LISTA_ANEXOS: GrupoCatalogoHistoricoPedido = {
  id: 'lista-anexos',
  titulo: 'Lista — anexos',
  eventos: [
    evt('CRIAR', 'Lista › Anexos', 'Enviar **anexo** a um pedido.'),
    evt('EXCLUIR', 'Lista › Anexos', 'Remover anexo do pedido.'),
  ],
}

const GRUPO_LISTA_GERAR_DOCUMENTO: GrupoCatalogoHistoricoPedido = {
  id: 'lista-gerar-documento',
  titulo: 'Lista — gerar documento',
  eventos: [
    evt('CRIAR', 'Lista › Gerar documento', 'Gerar **PDF** a partir de template (opção **salvar como anexo**).'),
    evt('CRIAR', 'Lista › Gerar documento', 'Gerar **documento comercial** por tipo e idioma (PI, CI, etc.).'),
  ],
}

const GRUPO_DASHBOARD: GrupoCatalogoHistoricoPedido = {
  id: 'dashboard',
  titulo: 'Dashboard',
  eventos: [
    evt('ATUALIZAR', 'Dashboard', 'Salvar layout completo de **widgets** (posição, tamanho, indicadores).'),
    evt('EXCLUIR', 'Dashboard', 'Remover **widget** do painel.'),
    evt('CRIAR', 'Dashboard › Painéis', 'Criar **painel** do dashboard.'),
    evt('ATUALIZAR', 'Dashboard › Painéis', 'Renomear ou editar painel do dashboard.'),
    evt('ATUALIZAR', 'Dashboard › Painéis', '**Reordenar** painéis do dashboard.'),
    evt('EXCLUIR', 'Dashboard › Painéis', 'Excluir painel do dashboard.'),
  ],
}

const GRUPO_KANBAN: GrupoCatalogoHistoricoPedido = {
  id: 'kanban',
  titulo: 'Kanban',
  eventos: [
    evt('ATUALIZAR', 'Kanban', 'Salvar **preferências** (colunas visíveis, ordem).'),
    evt('EXCLUIR', 'Kanban', 'Restaurar preferências **padrão** do Kanban.'),
  ],
}

const GRUPO_CONFIGURACOES: GrupoCatalogoHistoricoPedido = {
  id: 'configuracoes',
  titulo: 'Configurações',
  eventos: [
    evt('CRIAR', 'Configurações › Status', 'Criar **status** ou rótulo de coluna Kanban.'),
    evt('ATUALIZAR', 'Configurações › Status', '**Sincronizar** status com colunas do Kanban.'),
    evt('ATUALIZAR', 'Configurações › Status', 'Editar status existente.'),
    evt('EXCLUIR', 'Configurações › Status', 'Excluir status do workspace.'),
    evt('ATUALIZAR', 'Configurações › Status', '**Reordenar** status por arraste.'),
    evt('CRIAR', 'Configurações › Colunas', 'Criar **coluna nativa** do produto.'),
    evt('ATUALIZAR', 'Configurações › Colunas', 'Editar coluna nativa (tipo, regras, visibilidade).'),
    evt('EXCLUIR', 'Configurações › Colunas', 'Excluir coluna nativa.'),
    evt('ATUALIZAR', 'Configurações', 'Salvar **regras** (numeração, alertas, comportamento).'),
    evt('ATUALIZAR', 'Configurações', 'Salvar **preferências padrão** do workspace.'),
    evt('ATUALIZAR', 'Configurações', 'Salvar **preferências de usuário** (escopo de colunas).'),
    evt('CRIAR', 'Configurações › Cards', 'Adicionar **card** KPI à tela de Configurações.'),
    evt('ATUALIZAR', 'Configurações › Cards', 'Editar, ocultar ou reativar card.'),
    evt('EXCLUIR', 'Configurações › Cards', 'Remover card da grade.'),
    evt('ATUALIZAR', 'Configurações › Cards', '**Reordenar** cards por arraste.'),
    evt('ATUALIZAR', 'Configurações › Casas decimais', 'Alterar **casas decimais** por tipo de campo.'),
    evt('ATUALIZAR', 'Configurações › Campos calculados', 'Salvar **fórmula de saldo** personalizada.'),
    evt('EXCLUIR', 'Configurações › Campos calculados', 'Remover fórmula de saldo.'),
    evt('ATUALIZAR', 'Configurações', 'Alterar **política de snapshot** (atualização via Cadastros).'),
  ],
}

const GRUPO_AUXILIAR: GrupoCatalogoHistoricoPedido = {
  id: 'auxiliar',
  titulo: 'Captura automática — rotas auxiliares',
  descricao: 'Mutations que respondem com JSON e entram no histórico, embora não alterem pedidos diretamente.',
  eventos: [
    evt('CRIAR', 'Lista', 'Pergunta ao **Gabi** em tooltip de ajuda de campo (proxy ajuda-campo).'),
  ],
}

/** Interações que não geram linha no Histórico do Pedido. */
const GRUPO_NAO_REGISTRA: GrupoCatalogoHistoricoPedido = {
  id: 'nao-registra',
  titulo: 'O que não aparece no Histórico',
  descricao: 'Navegação e telemetria sem gravação auditável no historico_log.',
  eventos: [
    {
      acao: '—',
      rotulo: 'Não registra',
      tela: 'Todas',
      quando: 'Abrir telas, **filtrar**, **buscar**, expandir linhas ou painéis **sem salvar** no servidor.',
    },
    {
      acao: '—',
      rotulo: 'Não registra',
      tela: 'Insights',
      quando: 'Visualizar métricas e sugestões Gabi **sem mutação** de pedido.',
    },
    {
      acao: '—',
      rotulo: 'Não registra',
      tela: 'Lista',
      quando: 'Telemetria **eventos-comportamento** (personalização Gabi — resposta 204, fora do audit plugin).',
    },
    {
      acao: '—',
      rotulo: 'Não registra',
      tela: 'Histórico',
      quando: 'Consultar, filtrar, paginar ou **exportar** a tabela de auditoria (somente leitura).',
    },
  ],
}

export const GRUPOS_CATALOGO_HISTORICO_PEDIDO: GrupoCatalogoHistoricoPedido[] = [
  GRUPO_ACOES_DEDICADAS,
  GRUPO_LISTA_PEDIDO_ITENS,
  GRUPO_LISTA_OPERACOES,
  GRUPO_LISTA_IMPORT_EXPORT,
  GRUPO_LISTA_PERSONALIZACAO,
  GRUPO_LISTA_ANEXOS,
  GRUPO_LISTA_GERAR_DOCUMENTO,
  GRUPO_DASHBOARD,
  GRUPO_KANBAN,
  GRUPO_CONFIGURACOES,
  GRUPO_AUXILIAR,
  GRUPO_NAO_REGISTRA,
]

export const TOTAL_EVENTOS_CATALOGO_HISTORICO_PEDIDO = GRUPOS_CATALOGO_HISTORICO_PEDIDO
  .filter((g) => g.id !== 'nao-registra')
  .reduce((acc, g) => acc + g.eventos.length, 0)
