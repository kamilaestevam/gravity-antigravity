/**
 * camposEdicaoMassa.ts — SSOT da edição em massa de Pedido/PedidoItem (Onda 2 — 2026-06-11)
 *
 * Regra de produto (dono, 2026-06-10): "se o campo pode ser editável na lista,
 * ele deve ser editável em massa" — incluindo colunas criadas pelo usuário.
 *
 * Este módulo deriva a lista de campos editáveis em massa a partir do
 * dicionário DDD (`campos-pedido-ddd.ts`) e mantém a ÚNICA blocklist do
 * sistema. Consumidores:
 *   - server/src/services/edicaoEmMassaService.ts (validação server-side)
 *   - client/src/shared/types.ts (re-export para o modal)
 *   - client/src/components/ModalPedidosEdicaoMassa.tsx (origem dos campos — Onda 3)
 *
 * Módulo puro: zero dependências de cliente, servidor ou banco.
 */

import {
  CAMPOS_PEDIDO_DDD,
  CAMPOS_ITEM_DDD,
  type CampoPedidoDDD,
  type TipoCampoDDD,
} from './campos-pedido-ddd'

// ── Colunas criadas pelo usuário (EAV) ────────────────────────────────────────
//
// Convenção de transporte: o campo de uma coluna de usuário viaja no payload
// como `coluna_usuario:<id_coluna_usuario_pedido>`. O service resolve o id e
// grava em PedidoListaColunaUsuarioValor (upsert por vínculo pedido/item).

export const PREFIXO_COLUNA_USUARIO = 'coluna_usuario:'

export function ehCampoColunaUsuario(campo: string): boolean {
  return campo.startsWith(PREFIXO_COLUNA_USUARIO)
}

/** Extrai o id da coluna de usuário de um campo `coluna_usuario:<id>`. */
export function idColunaUsuarioDeCampo(campo: string): string | null {
  if (!ehCampoColunaUsuario(campo)) return null
  const id = campo.slice(PREFIXO_COLUNA_USUARIO.length)
  return id.length > 0 ? id : null
}

// ── Blocklist única — campos NUNCA editáveis em massa ─────────────────────────
//
// Critérios (auditoria 2026-06-10, matriz campo a campo):
//   - Agregados calculados por recalcularAgregadosPedido / saldoEngine
//   - Identidade e sistema (ids, audit timestamps)
//   - Campos geridos por fluxo próprio (consolidação)

export const CAMPOS_BLOQUEADOS_PEDIDO: ReadonlySet<string> = new Set([
  // Agregados calculados pelo recalcularAgregadosPedido
  'valor_total_pedido',
  'quantidade_total_pedido',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
  // Sistema / identidade
  'id_pedido',
  'id_organizacao',
  'id_workspace',
  'id_status_pedido',
  'data_criacao_pedido',
  'data_atualizacao_pedido',
  'data_exclusao_pedido',
  // Fluxo de consolidação (gerido pelo workflow, não por edição)
  'data_consolidacao_pedido',
  'ids_origem_consolidacao_pedido',
])

export const CAMPOS_BLOQUEADOS_ITEM: ReadonlySet<string> = new Set([
  // Calculados
  'valor_total_item',
  'quantidade_atual_item',
  'quantidade_transferida_item', // saldoEngine — fluxo de transferência
  // Sistema / identidade
  'id_item',
  'id_organizacao',
  'id_workspace',
  'id_pedido',
  'data_criacao_item',
  'data_atualizacao_item',
  'data_exclusao_item',
])

// ── Campos que vivem como chaves JSON em detalhes_operacionais_pedido ─────────
// Não são colunas físicas do Pedido. Editáveis em massa via merge no JSON.
// Inclui chaves que NÃO estão no dicionário DDD de importação (cnpj_exportador,
// cnpj_importador — alvos do auto-fill de tipo_operacao_pedido).

export const CAMPOS_DETALHES_OPERACIONAIS: ReadonlySet<string> = new Set([
  // Exportador
  'nome_exportador',
  'cnpj_exportador',   // auto-fill: workspace.cnpj_workspace em EXP
  'endereco_exportador',
  'pais_exportador',
  'estado_exportador',
  'cidade_exportador',
  'zip_code_exportador',
  'exportador_ou_fabricante',
  'relacao_exportador_fabricante',
  'nome_contato_exportador',
  'email_contato_exportador',
  'whatsapp_contato_exportador',
  'cargo_contato_exportador',
  'departamento_contato_exportador',
  // Importador
  'nome_importador',
  'cnpj_importador',   // auto-fill: workspace.cnpj_workspace em IMP
  // Fabricante
  'nome_fabricante',
  'endereco_fabricante',
  'pais_fabricante',
  'estado_fabricante',
  'cidade_fabricante',
  'zip_code_fabricante',
  // OPE
  'codigo_ope',
  'nome_ope',
  'endereco_ope',
  'pais_ope',
  'estado_ope',
  'cidade_ope',
  'zip_code_ope',
  'tin_ope',
  'email_ope',
  'situacao_ope',
  'versao_ope',
  'cnpj_raiz_empresa_responsavel',
])

// ── Campos exclusivos do parser de importação — fora da edição em massa ───────

const CAMPOS_PARSER_ONLY: ReadonlySet<string> = new Set(['tipo_linha'])

// ── Extras de massa — colunas Prisma editáveis que ficam fora do dicionário ───
// de importação de propósito (o Smart Import força status='rascunho' e lê
// casas decimais da config — exibi-los no template de upload seria enganoso).

export interface CampoExtraMassa {
  campo: string
  rotulo: string
  tipo: TipoCampoDDD
  grupo: string
  /** select com opções dinâmicas (carregadas em runtime — ex: StatusPedido da org) */
  opcoesDinamicas?: boolean
}

export const CAMPOS_EXTRAS_MASSA_PEDIDO: readonly CampoExtraMassa[] = [
  { campo: 'status_pedido',                  rotulo: 'Status do Pedido',           tipo: 'select', grupo: 'Identificacao', opcoesDinamicas: true },
  { campo: 'casas_decimais_valor_pedido',      rotulo: 'Casas Decimais — Valor',     tipo: 'numero', grupo: 'Financeiro' },
  { campo: 'casas_decimais_quantidade_pedido', rotulo: 'Casas Decimais — Qtd.',      tipo: 'numero', grupo: 'Fisico' },
  { campo: 'casas_decimais_peso_pedido',       rotulo: 'Casas Decimais — Peso',      tipo: 'numero', grupo: 'Fisico' },
  { campo: 'casas_decimais_cubagem_pedido',    rotulo: 'Casas Decimais — Cubagem',   tipo: 'numero', grupo: 'Fisico' },
]

// ── Derivação — campos editáveis em massa por nível ───────────────────────────

export interface CampoEdicaoMassaDef {
  campo: string
  rotulo: string
  tipo: TipoCampoDDD
  grupo: string
  nivel: 'pedido' | 'item'
  opcoesSelect?: string[]
  opcoesDinamicas?: boolean
  /** true quando o campo grava em detalhes_operacionais_pedido (JSON) */
  armazenadoEmJson?: boolean
}

function dddParaDef(c: CampoPedidoDDD): CampoEdicaoMassaDef {
  return {
    campo: c.campo,
    rotulo: c.rotulo,
    tipo: c.tipo,
    grupo: c.grupo,
    nivel: c.nivel,
    opcoesSelect: c.opcoesSelect ? [...c.opcoesSelect] : undefined,
    armazenadoEmJson: CAMPOS_DETALHES_OPERACIONAIS.has(c.campo) || undefined,
  }
}

/** Campos do Pedido editáveis em massa (DDD − bloqueados − parser + extras). */
export const CAMPOS_EDICAO_MASSA_PEDIDO: readonly CampoEdicaoMassaDef[] = [
  ...CAMPOS_PEDIDO_DDD
    .filter(c => !CAMPOS_BLOQUEADOS_PEDIDO.has(c.campo) && !CAMPOS_PARSER_ONLY.has(c.campo))
    .map(dddParaDef),
  ...CAMPOS_EXTRAS_MASSA_PEDIDO.map(e => ({
    campo: e.campo,
    rotulo: e.rotulo,
    tipo: e.tipo,
    grupo: e.grupo,
    nivel: 'pedido' as const,
    opcoesDinamicas: e.opcoesDinamicas,
  })),
]

/** Campos do PedidoItem editáveis em massa (DDD − bloqueados). */
export const CAMPOS_EDICAO_MASSA_ITEM: readonly CampoEdicaoMassaDef[] = CAMPOS_ITEM_DDD
  .filter(c => !CAMPOS_BLOQUEADOS_ITEM.has(c.campo))
  .map(dddParaDef)

const SET_EDITAVEL_PEDIDO: ReadonlySet<string> = new Set([
  ...CAMPOS_EDICAO_MASSA_PEDIDO.map(c => c.campo),
  // Chaves JSON fora do dicionário de importação (cnpj_exportador, cnpj_importador)
  ...CAMPOS_DETALHES_OPERACIONAIS,
])

const SET_EDITAVEL_ITEM: ReadonlySet<string> = new Set(
  CAMPOS_EDICAO_MASSA_ITEM.map(c => c.campo),
)

/**
 * Verificador único de editabilidade em massa (Mand. 08 — falha ruidosa):
 * o que não está aqui é rejeitado pelo service com AppError 400.
 * Colunas de usuário (`coluna_usuario:<id>`) passam aqui; a existência,
 * escopo e tipo são validados pelo service contra o banco.
 */
export function campoEditavelEmMassa(campo: string, nivel: 'pedido' | 'item'): boolean {
  if (ehCampoColunaUsuario(campo)) return idColunaUsuarioDeCampo(campo) !== null
  return nivel === 'pedido' ? SET_EDITAVEL_PEDIDO.has(campo) : SET_EDITAVEL_ITEM.has(campo)
}

/** Motivo de bloqueio (para mensagens de erro precisas). */
export function motivoBloqueioCampo(campo: string, nivel: 'pedido' | 'item'): 'bloqueado' | 'desconhecido' | null {
  if (campoEditavelEmMassa(campo, nivel)) return null
  const bloqueados = nivel === 'pedido' ? CAMPOS_BLOQUEADOS_PEDIDO : CAMPOS_BLOQUEADOS_ITEM
  return bloqueados.has(campo) ? 'bloqueado' : 'desconhecido'
}
