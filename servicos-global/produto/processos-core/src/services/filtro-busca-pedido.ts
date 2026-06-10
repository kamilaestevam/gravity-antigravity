/**
 * filtro-busca-pedido.ts — Condições de busca textual da Lista de Pedidos.
 *
 * Fonte única do WHERE de busca, consumida por:
 *   - GET /api/v1/pedidos            (lista paginada — routes/pedidos.ts)
 *   - GET /api/v1/pedidos/lista/kpis (cards do topo — lista-pedido-kpis.ts)
 *
 * Cobre 3 famílias de match:
 *   1. Campos textuais fixos do Pedido (número, referências, proforma, invoice)
 *   2. Nomes das partes via snapshot (importador/exportador/fabricante)
 *   3. Colunas criadas pelo usuário:
 *      - por CONTEÚDO  — o valor persistido contém o termo (vínculo pedido OU item;
 *        item promove o pedido pai para o resultado)
 *      - por NOME      — o termo bate no nome da coluna → retorna os pedidos que
 *        têm aquela coluna preenchida
 *
 * Visibilidade (mesma regra do ColunasUsuarioService.listar): coluna 'privado'
 * só conta para quem criou; 'roles' só para tipos de usuário permitidos. Sem
 * isso a busca vazaria existência de dado de coluna privada de outro usuário.
 *
 * Limitação conhecida: colunas tipo 'formula' são calculadas no client e não
 * têm valor persistido — o resultado da fórmula não é buscável no servidor.
 */

interface ColunaUsuarioBuscaRow {
  id_coluna_usuario_pedido: string
  nome_coluna_usuario_pedido: string
  visibilidade_coluna_usuario_pedido: string | null
  tipos_usuario_workspace_permitidos_coluna_usuario_pedido: string[]
  criado_por_coluna_usuario_pedido: string
}

interface ValorColunaUsuarioBuscaRow {
  vinculo_valor_coluna_usuario_pedido: string
  id_vinculo_valor_coluna_usuario_pedido: string
}

/** Subconjunto estrutural do PrismaClient que a busca toca — evita `any`. */
export interface DbBuscaPedido {
  pedidoListaColunaUsuario: {
    findMany(args: Record<string, unknown>): Promise<ColunaUsuarioBuscaRow[]>
  }
  pedidoListaColunaUsuarioValor: {
    findMany(args: Record<string, unknown>): Promise<ValorColunaUsuarioBuscaRow[]>
  }
}

export interface UsuarioBuscaContexto {
  idUsuario: string
  tiposUsuario: string[]
}

/**
 * Teto de vínculos coletados na busca por colunas do usuário. Protege o SLA
 * (200ms p95) contra termos de 1 letra que casariam dezenas de milhares de
 * valores — o `IN (...)` da query principal ficaria gigante. 5k vínculos
 * cobre qualquer página de lista com folga.
 */
const LIMITE_VINCULOS_BUSCA = 5_000

export function colunaVisivelParaUsuario(
  col: ColunaUsuarioBuscaRow,
  usuario: UsuarioBuscaContexto,
): boolean {
  const vis = col.visibilidade_coluna_usuario_pedido
  if (!vis || vis === 'todos') return true
  if (vis === 'privado') return col.criado_por_coluna_usuario_pedido === usuario.idUsuario
  if (vis === 'roles') {
    return col.tipos_usuario_workspace_permitidos_coluna_usuario_pedido
      .some(r => usuario.tiposUsuario.includes(r))
  }
  return true
}

/**
 * Monta o array de condições OR do Prisma para o termo de busca.
 *
 * Uso: `where.AND = [{ OR: condicoes }]` na lista (o branch de cursor já usa
 * `where.OR` para o keyset — busca em AND não colide) ou `where.OR = condicoes`
 * quando não há outro OR no where.
 */
export async function montarCondicoesBuscaPedido(
  db: DbBuscaPedido,
  busca: string,
  idOrganizacao: string,
  usuario: UsuarioBuscaContexto,
): Promise<Array<Record<string, unknown>>> {
  const contem = { contains: busca, mode: 'insensitive' as const }

  const condicoes: Array<Record<string, unknown>> = [
    { numero_pedido: contem },
    { referencia_importador_pedido: contem },
    { referencia_exportador_pedido: contem },
    { referencia_fabricante_pedido: contem },
    { numero_proforma_pedido: contem },
    { numero_invoice_pedido: contem },
    { snapshots_empresa_pedido: { some: { nome_empresa: contem } } },
  ]

  const { vinculosPedido, vinculosItem } = await coletarVinculosColunasUsuario(
    db, busca, idOrganizacao, usuario,
  )
  if (vinculosPedido.length > 0) {
    condicoes.push({ id_pedido: { in: vinculosPedido } })
  }
  if (vinculosItem.length > 0) {
    condicoes.push({ itens_pedido: { some: { id_item: { in: vinculosItem } } } })
  }

  return condicoes
}

/**
 * Coleta os IDs de pedido/item cujas colunas do usuário casam com o termo —
 * por conteúdo (valor contém o termo) ou por nome (coluna cujo nome contém o
 * termo e que está preenchida no registro).
 */
async function coletarVinculosColunasUsuario(
  db: DbBuscaPedido,
  busca: string,
  idOrganizacao: string,
  usuario: UsuarioBuscaContexto,
): Promise<{ vinculosPedido: string[]; vinculosItem: string[] }> {
  const colunas = await db.pedidoListaColunaUsuario.findMany({
    where: { id_organizacao: idOrganizacao, ativo_coluna_usuario_pedido: true },
    select: {
      id_coluna_usuario_pedido: true,
      nome_coluna_usuario_pedido: true,
      visibilidade_coluna_usuario_pedido: true,
      tipos_usuario_workspace_permitidos_coluna_usuario_pedido: true,
      criado_por_coluna_usuario_pedido: true,
    },
  })

  const visiveis = colunas.filter(c => colunaVisivelParaUsuario(c, usuario))
  if (visiveis.length === 0) return { vinculosPedido: [], vinculosItem: [] }

  const termoNorm = busca.trim().toLowerCase()
  const idsVisiveis = visiveis.map(c => c.id_coluna_usuario_pedido)
  const idsNomeBate = visiveis
    .filter(c => c.nome_coluna_usuario_pedido.toLowerCase().includes(termoNorm))
    .map(c => c.id_coluna_usuario_pedido)

  const condicoesValor: Array<Record<string, unknown>> = [
    {
      id_coluna_usuario_pedido: { in: idsVisiveis },
      valor_coluna_usuario_pedido: { contains: busca, mode: 'insensitive' },
    },
  ]
  if (idsNomeBate.length > 0) {
    condicoesValor.push({
      id_coluna_usuario_pedido: { in: idsNomeBate },
      valor_coluna_usuario_pedido: { not: '' },
    })
  }

  const valores = await db.pedidoListaColunaUsuarioValor.findMany({
    where: { id_organizacao: idOrganizacao, OR: condicoesValor },
    select: {
      vinculo_valor_coluna_usuario_pedido: true,
      id_vinculo_valor_coluna_usuario_pedido: true,
    },
    take: LIMITE_VINCULOS_BUSCA,
  })

  const vinculosPedido = new Set<string>()
  const vinculosItem = new Set<string>()
  for (const v of valores) {
    if (v.vinculo_valor_coluna_usuario_pedido === 'item') {
      vinculosItem.add(v.id_vinculo_valor_coluna_usuario_pedido)
    } else {
      vinculosPedido.add(v.id_vinculo_valor_coluna_usuario_pedido)
    }
  }
  return { vinculosPedido: [...vinculosPedido], vinculosItem: [...vinculosItem] }
}
