/**
 * recalcularAgregadosPedido.ts — Helper canônico de recalculo dos 5
 * agregados persistidos do Pedido a partir dos seus PedidoItens.
 *
 * Os 5 agregados são:
 *   - valor_total_pedido          = SUM(valor_total_item)
 *   - quantidade_total_pedido     = SUM(quantidade_inicial_item)
 *   - peso_liquido_total_pedido   = SUM(peso_liquido_unitario_item × quantidade_inicial_item)
 *   - peso_bruto_total_pedido     = SUM(peso_bruto_unitario_item   × quantidade_inicial_item)
 *   - cubagem_total_pedido        = SUM(cubagem_unitaria_item      × quantidade_inicial_item)
 *
 * REGRAS DE OURO:
 *   1. **`tx` é OBRIGATÓRIO.** O caller já está numa `$transaction` Prisma. O
 *      helper roda dentro dela — evita janela de inconsistência cross-request.
 *
 *   2. **`SELECT FOR UPDATE` no pedido pai** antes de calcular — lock pessimista
 *      contra lost-update entre dois requests editando itens em paralelo.
 *
 *   3. **Falha alto (Mandamento 08).** Lança erro se:
 *        - pedido não existe
 *        - id_organizacao não bate (defesa de isolamento)
 *      Caller aborta a transação. Sem best-effort, sem fallback silencioso.
 *
 *   4. **Schema intocável (Mandamento 02).** Helper só faz SELECT + UPDATE.
 *
 *   5. **Casas decimais por pedido.** Lê `casas_decimais_*_pedido` do pai e
 *      aplica `toFixed(casas)` consistente. Default seguro se NULL: 2 (valor),
 *      2 (quantidade), 3 (peso), 3 (cubagem).
 *
 * USO:
 *   await db.$transaction(async (tx) => {
 *     await tx.pedidoItem.update({ ... })
 *     await recalcularAgregadosPedido(tx, idPedido, idOrganizacao)
 *   })
 *
 * NÃO chame fora de `$transaction` — o helper lança erro se detectar.
 */

import type { PrismaClient } from '@prisma/client'
import { AppError } from './saldo-pedido.js'

// Mesmo padrão do saldo-pedido.ts: tipo Tx que preserva delegates de modelo.
type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

// Defaults aplicados quando casas_decimais_*_pedido é NULL no banco.
const CASAS_DEFAULT = {
  valor: 2,
  quantidade: 2,
  peso: 3,
  cubagem: 3,
} as const

/**
 * Linhas relevantes de um item para o recalculo. Não traz colunas a mais
 * (performance: select específico, não findMany completo).
 */
interface ItemAgregado {
  valor_total_item:           unknown
  quantidade_inicial_item:    unknown
  peso_liquido_unitario_item: unknown
  peso_bruto_unitario_item:   unknown
  cubagem_unitaria_item:      unknown
}

/**
 * Linhas relevantes do pedido pai (casas decimais + sanity check de org).
 */
interface PedidoCasas {
  id_organizacao: string
  casas_decimais_valor_pedido:      number | null
  casas_decimais_quantidade_pedido: number | null
  casas_decimais_peso_pedido:       number | null
  casas_decimais_cubagem_pedido:    number | null
}

function n(v: unknown): number {
  if (v == null) return 0
  const num = typeof v === 'object' ? Number((v as { toString(): string }).toString()) : Number(v)
  return isNaN(num) ? 0 : num
}

/**
 * Recalcula os 5 agregados persistidos de um Pedido a partir dos seus itens
 * e atualiza o registro do Pedido.
 *
 * @param tx              TransactionClient Prisma (obrigatório — chamar dentro de $transaction)
 * @param idPedido        ID do Pedido (chave física `id_pedido`)
 * @param idOrganizacao   ID da Organização dona (defesa de isolamento — REGRA 4 de cache)
 *
 * @throws AppError(404) se o pedido não existe ou não pertence à organização
 * @throws AppError(500) se houver inconsistência grave (ex: organização errada)
 */
export async function recalcularAgregadosPedido(
  tx: Tx,
  idPedido: string,
  idOrganizacao: string,
): Promise<void> {
  // ── 1. Lock pessimista no pedido pai ────────────────────────────────────────
  // SELECT ... FOR UPDATE evita lost-update entre 2 requests editando itens do
  // mesmo pedido em transações concorrentes. Fora de $transaction o lock não
  // funciona (Postgres exige tx) — por isso `tx` é obrigatório.
  //
  // Prisma 5.x não tem API tipada pra `FOR UPDATE` em findUnique. Usar
  // `$queryRaw` direto. O lock dura até o COMMIT da transação do caller.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Tabela física: "pedido" (snake_case via `@@map("pedido")`). NÃO usar
  // "Pedido" (PascalCase do model).
  //
  // Qualifier `"public".` obrigatório: `withOrganizacao` faz
  // `SET LOCAL search_path TO "tenant_<id>", public`. Existe um schema
  // `tenant_<id>` fantasma (resto do design schema-per-tenant abandonado
  // — ver seed.ts:39) com uma tabela `pedido` vazia. Sem qualifier, o
  // SELECT bate na tabela fantasma e retorna 0 linhas, falhando com
  // "Pedido nao encontrado" mesmo o pedido tendo sido criado em public.
  // Verificado em diagnóstico: tenant_<id>.pedido tem 0 rows, public.pedido
  // tem N rows; FROM "pedido" → 0, FROM "public"."pedido" → N.
  const lockResult = await (tx as any).$queryRaw`
    SELECT id_pedido, id_organizacao,
           casas_decimais_valor_pedido,
           casas_decimais_quantidade_pedido,
           casas_decimais_peso_pedido,
           casas_decimais_cubagem_pedido
      FROM "public"."pedido"
     WHERE id_pedido = ${idPedido}
       AND id_organizacao = ${idOrganizacao}
       FOR UPDATE
  ` as Array<PedidoCasas & { id_pedido: string }>

  if (!Array.isArray(lockResult) || lockResult.length === 0) {
    throw new AppError(404, `Pedido nao encontrado para recalcular agregados (id=${idPedido}, org=${idOrganizacao})`)
  }

  const pedido = lockResult[0]
  const casasValor    = pedido.casas_decimais_valor_pedido      ?? CASAS_DEFAULT.valor
  const casasQtd      = pedido.casas_decimais_quantidade_pedido ?? CASAS_DEFAULT.quantidade
  const casasPeso     = pedido.casas_decimais_peso_pedido       ?? CASAS_DEFAULT.peso
  const casasCubagem  = pedido.casas_decimais_cubagem_pedido    ?? CASAS_DEFAULT.cubagem

  // ── 2. SELECT itens (somente colunas necessárias) ──────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itens = await (tx as any).pedidoItem.findMany({
    where: { id_pedido: idPedido, id_organizacao: idOrganizacao },
    select: {
      valor_total_item:           true,
      quantidade_inicial_item:    true,
      peso_liquido_unitario_item: true,
      peso_bruto_unitario_item:   true,
      cubagem_unitaria_item:      true,
    },
  }) as ItemAgregado[]

  // ── 3. Calcular os 5 agregados ──────────────────────────────────────────────
  // Fórmulas:
  //   valor_total_pedido         = SUM(valor_total_item)
  //   quantidade_total_pedido    = SUM(quantidade_inicial_item)
  //   peso_liquido_total_pedido  = SUM(peso_liquido_unitario_item × quantidade_inicial_item)
  //   peso_bruto_total_pedido    = SUM(peso_bruto_unitario_item   × quantidade_inicial_item)
  //   cubagem_total_pedido       = SUM(cubagem_unitaria_item      × quantidade_inicial_item)
  //
  // Importante: peso/cubagem multiplicam pela quantidade. Bug histórico nas
  // implementações antigas (pedidos.ts:1348-1357) somava só o unitário.
  let somaValor   = 0
  let somaQtd     = 0
  let somaPesoLiq = 0
  let somaPesoBr  = 0
  let somaCubagem = 0

  for (const it of itens) {
    const qty = n(it.quantidade_inicial_item)
    somaValor   += n(it.valor_total_item)
    somaQtd     += qty
    somaPesoLiq += n(it.peso_liquido_unitario_item) * qty
    somaPesoBr  += n(it.peso_bruto_unitario_item)   * qty
    somaCubagem += n(it.cubagem_unitaria_item)      * qty
  }

  const valorTotal       = parseFloat(somaValor.toFixed(casasValor))
  const qtdTotal         = parseFloat(somaQtd.toFixed(casasQtd))
  const pesoLiquidoTotal = parseFloat(somaPesoLiq.toFixed(casasPeso))
  const pesoBrutoTotal   = parseFloat(somaPesoBr.toFixed(casasPeso))
  const cubagemTotal     = parseFloat(somaCubagem.toFixed(casasCubagem))

  // ── 4. UPDATE no pedido pai ─────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (tx as any).pedido.update({
    where: { id_pedido: idPedido },
    data: {
      valor_total_pedido:         valorTotal,
      quantidade_total_pedido:    qtdTotal,
      peso_liquido_total_pedido:  pesoLiquidoTotal,
      peso_bruto_total_pedido:    pesoBrutoTotal,
      cubagem_total_pedido:       cubagemTotal,
    },
  })
}

/**
 * Conjunto de campos que afetam pelo menos um dos 5 agregados.
 *
 * Caller usa para decidir se deve disparar o recalc após editar 1 campo
 * único de item (PATCH /:id/itens/:idItem/campo). Editar `incoterm_item`,
 * `descricao_item`, `referencia_*_item` (texto puro) NÃO entra na lista —
 * recalc seria desperdício.
 */
export const CAMPOS_ITEM_QUE_AFETAM_AGREGADO: ReadonlySet<string> = new Set([
  'valor_total_item',
  'valor_por_unidade_item',
  'quantidade_inicial_item',
  'quantidade_inicial_pedido', // alias público → físico via mapItem
  'peso_liquido_unitario_item',
  'peso_bruto_unitario_item',
  'cubagem_unitaria_item',
  // Cancelamento via PATCH /cancelar mexe em `quantidade_atual_item` mas
  // o recalc dos agregados que persistimos hoje (somente 5 acima) usa apenas
  // `quantidade_inicial_item`. Cancelamento é tratado em rota dedicada que
  // chama o helper independente da chave do campo — por isso este set não
  // precisa incluir `quantidade_atual_item` / `quantidade_cancelada_item`.
])

export function campoItemAfetaAgregado(campo: string): boolean {
  return CAMPOS_ITEM_QUE_AFETAM_AGREGADO.has(campo)
}
