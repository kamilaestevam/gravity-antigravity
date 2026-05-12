/**
 * mapaPropagacaoPedidoItem.ts — Fonte única de verdade da propagação Pedido → PedidoItem.
 *
 * Módulo puro: zero dependências de cliente, servidor ou ORM. Pode ser
 * importado por qualquer camada (Zod, route handler, smart import, integração
 * externa) sem efeito colateral.
 *
 * Política (Mandamento 03 — DDD-PT, sem nomes legados):
 *   - **Origem**: nomes Prisma reais do model `Pedido` (sufixo `_pedido`).
 *   - **Destino**: nomes Prisma reais do model `PedidoItem` (sufixo `_item` ou `_item_pedido`).
 *   - **Sem aliases legados** (`incoterm`, `numero_proforma`, etc.) — quem ainda
 *     usa nome curto traduz para DDD ANTES de chamar este módulo.
 *
 * Quando aplica:
 *   - **CREATE** do Pedido (manual, smart import, integração) — copia 22
 *     campos diretos do Pedido para cada PedidoItem recém-criado.
 *   - **PATCH** de campo do Pedido (PUT/PATCH em pedido pai) — replica para
 *     os items filhos via `updateMany`. ⚠️ Hoje quebrado em pedidos.ts:1587
 *     (usa nome legado, dispara updateMany com coluna inexistente). Fix em
 *     tarefa separada — ver débito.
 *
 * O que NÃO está aqui:
 *   - Campos item-specific (quantidades, valores, peso unitário, NCM, etc.)
 *   - Campos pedido-only (numero_proforma_pedido, valor_total_pedido agregado, etc.)
 *   - Snapshot derivativos (nome_exportador_item ← snapshots_empresa_pedido)
 *     ficam na helper `derivarNomesEmpresaParaItem` por terem origem indireta.
 */

/**
 * Mapa direto Pedido → Item: copia o valor do campo do Pedido (chave) para o
 * campo correspondente no Item (valor). 22 entries.
 *
 * Estrutura agrupada por domínio comercial — facilita revisão e auditoria.
 */
export const MAPA_PROPAGACAO_PEDIDO_ITEM: Readonly<Record<string, string>> = Object.freeze({
  // ── Identidade comercial (5) ─────────────────────────────────────────────
  incoterm_pedido:                  'incoterm_item',
  moeda_pedido:                     'moeda_item',
  unidade_comercializada_pedido:    'unidade_comercializada_item',
  condicao_pagamento_pedido:        'condicao_pagamento_item',
  data_emissao_pedido:              'data_emissao_item',

  // ── Casas decimais — configuração de exibição (4) ────────────────────────
  casas_decimais_valor_pedido:      'casas_decimais_valor_item',
  casas_decimais_quantidade_pedido: 'casas_decimais_quantidade_item',
  casas_decimais_peso_pedido:       'casas_decimais_peso_item',
  casas_decimais_cubagem_pedido:    'casas_decimais_cubagem_item',

  // ── Câmbio (1) ────────────────────────────────────────────────────────────
  cobertura_cambial_pedido:         'cobertura_cambial_item',

  // ── Referências (3) ──────────────────────────────────────────────────────
  referencia_importador_pedido:     'referencia_importador_item',
  referencia_exportador_pedido:     'referencia_exportador_item',
  referencia_fabricante_pedido:     'referencia_fabricante_item',

  // ── Datas — Pedido Pronto (3) ────────────────────────────────────────────
  data_prevista_pedido_pronto:      'data_prevista_item_pronto',
  data_confirmada_pedido_pronto:    'data_confirmada_item_pronto',
  data_meta_pedido_pronto:          'data_meta_item_pronto',

  // ── Datas — Inspeção (3) ─────────────────────────────────────────────────
  data_prevista_inspecao_pedido:    'data_prevista_inspecao_item',
  data_confirmada_inspecao_pedido:  'data_confirmada_inspecao_item',
  data_meta_inspecao_pedido:        'data_meta_inspecao_item',

  // ── Datas — Coleta (3) ───────────────────────────────────────────────────
  data_prevista_coleta_pedido:      'data_prevista_coleta_item',
  data_confirmada_coleta_pedido:    'data_confirmada_coleta_item',
  data_meta_coleta_pedido:          'data_meta_coleta_item',
})

/**
 * Lista das chaves (campos do Pedido) que propagam. Útil para verificar
 * "este campo precisa replicar nos items?" em rotinas de PATCH.
 */
export const CAMPOS_PEDIDO_PROPAGAVEIS: ReadonlySet<string> = new Set(
  Object.keys(MAPA_PROPAGACAO_PEDIDO_ITEM),
)

/**
 * Dado um campo DDD do Pedido, devolve o campo DDD do Item correspondente,
 * ou `null` se não é propagável.
 *
 * @example
 *   obterCampoItemPropagado('incoterm_pedido') // 'incoterm_item'
 *   obterCampoItemPropagado('numero_pedido')   // null (pedido-only)
 */
export function obterCampoItemPropagado(campoPedido: string): string | null {
  return MAPA_PROPAGACAO_PEDIDO_ITEM[campoPedido] ?? null
}

/**
 * Dado o objeto de dados do Pedido (em formato DDD), devolve um objeto
 * pronto pra spread no `pedidoItem.create.data` contendo apenas os campos
 * propagáveis presentes (não-undefined). Não inclui nomes derivados de
 * snapshot — use `derivarNomesEmpresaParaItem` em conjunto.
 *
 * @example
 *   const pedidoData = { incoterm_pedido: 'FOB', moeda_pedido: 'USD', numero_pedido: 'P1' }
 *   const itemHerdado = construirCamposPropagadosParaItem(pedidoData)
 *   // { incoterm_item: 'FOB', moeda_item: 'USD' }  // numero_pedido NÃO propaga
 */
export function construirCamposPropagadosParaItem(
  pedidoData: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [campoPedido, campoItem] of Object.entries(MAPA_PROPAGACAO_PEDIDO_ITEM)) {
    if (campoPedido in pedidoData) {
      out[campoItem] = pedidoData[campoPedido]
    }
  }
  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// Derivativos de snapshot (3 campos)
//
// Os nomes de Exportador/Importador/Fabricante no item NÃO vêm direto de
// colunas do Pedido — vêm dos PedidoSnapshotEmpresa correspondentes, pelo
// papel. Por isso ficam aqui, separados do mapa direto.
// ─────────────────────────────────────────────────────────────────────────────

export interface SnapshotEmpresaParaItem {
  papel: string
  nome_empresa: string
}

export interface NomesEmpresaItem {
  nome_exportador_item: string | null
  nome_importador_item: string | null
  nome_fabricante_item: string | null
}

/**
 * Dada a lista de snapshots de empresa de um Pedido, devolve os 3 nomes
 * (exportador/importador/fabricante) prontos pra spread no item.
 *
 * @example
 *   const snapshots = [
 *     { papel: 'importador', nome_empresa: 'CDE' },
 *     { papel: 'exportador', nome_empresa: 'Shanghai Co.' },
 *   ]
 *   derivarNomesEmpresaParaItem(snapshots)
 *   // { nome_importador_item: 'CDE', nome_exportador_item: 'Shanghai Co.', nome_fabricante_item: null }
 */
export function derivarNomesEmpresaParaItem(
  snapshots: readonly SnapshotEmpresaParaItem[],
): NomesEmpresaItem {
  const buscar = (papel: string): string | null =>
    snapshots.find((s) => s.papel === papel)?.nome_empresa ?? null
  return {
    nome_exportador_item: buscar('exportador'),
    nome_importador_item: buscar('importador'),
    nome_fabricante_item: buscar('fabricante'),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Compatibilidade — PATCH legado
//
// O PATCH em pedidos.ts:1585-1591 ainda usa nomes LEGADOS (incoterm,
// numero_proforma, etc.) ao chamar `isPropagavel(campo)`. Mantemos esta
// função aqui pra não quebrar o consumidor, traduzindo legacy → DDD via
// dicionário interno antes de checar no MAPA.
//
// ⚠️  PATCH propagator está quebrado por outros motivos (updateMany com
// `[campo]: valor` usa nome legado que não existe como coluna no item).
// Fix completo do PATCH é DÉBITO SEPARADO — ver tarefa.
// ─────────────────────────────────────────────────────────────────────────────

const LEGADO_PARA_DDD_COMPAT: Readonly<Record<string, string>> = Object.freeze({
  incoterm:              'incoterm_pedido',
  numero_proforma:       'numero_proforma_pedido',
  numero_invoice:        'numero_invoice_pedido',
  referencia_importador: 'referencia_importador_pedido',
  referencia_exportador: 'referencia_exportador_pedido',
  referencia_fabricante: 'referencia_fabricante_pedido',
  condicao_pagamento:    'condicao_pagamento_pedido',
  tipo_operacao:         'tipo_operacao_pedido',
})

/**
 * Verifica se um campo do Pedido propaga para items. Aceita tanto nome DDD
 * (`incoterm_pedido`) quanto legacy (`incoterm`) — útil enquanto o PATCH não
 * foi migrado pra DDD puro.
 */
export function isPropagavel(campo: string): boolean {
  if (CAMPOS_PEDIDO_PROPAGAVEIS.has(campo)) return true
  const dddForm = LEGADO_PARA_DDD_COMPAT[campo]
  return dddForm !== undefined && CAMPOS_PEDIDO_PROPAGAVEIS.has(dddForm)
}
