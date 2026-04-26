/**
 * colunasUsuarioService.ts — Lógica de negócio para colunas customizadas do usuário
 *
 * Regras de negócio:
 *   - Limite de 50 colunas por tenant
 *   - Nome único por tenant
 *   - Tipo não pode ser alterado após criação
 *   - Excluir = soft delete (ativo = false), dados preservados
 *   - Visibilidade filtra quais colunas o usuário pode ver
 *   - Chave gerada via slugify do nome (com tratamento especial de %)
 *   - tenant_id em TODAS as queries
 */

import { AppError } from '../errors/AppError.js'

// ── Tipos internos ───────────────────────────────���────────────────────────────

export interface CriarColunaInput {
  nome: string
  tipo: string
  escopo: string
  visibilidade: string
  roles_permitidas?: string[]
  obrigatorio?: boolean
  opcoes?: string[]
  descricao?: string
  valor_padrao?: string
  created_by: string
}

export interface AtualizarColunaInput {
  nome?: string
  escopo?: string
  visibilidade?: string
  roles_permitidas?: string[]
  obrigatorio?: boolean
  opcoes?: string[]
  descricao?: string
  valor_padrao?: string
}

export interface SalvarValoresInput {
  vinculo: string
  vinculo_id: string
  valores: Record<string, string>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Gera chave única a partir do nome da coluna.
 * "Margem %" → "margem_percentual"
 * "Ref. Interna" → "ref_interna"
 */
export function slugifyNome(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove acentos
    .replace(/%/g, '_percentual')     // % → _percentual
    .replace(/[^a-zA-Z0-9\s_]/g, '') // remove especiais (exceto espaço e _)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')            // espaços → _
    .replace(/_+/g, '_')             // colapsa __ → _
    .replace(/^_|_$/g, '')           // remove _ nas bordas
}

// ── ACL: mapeia row prisma (DDD) → contrato JSON legado consumido pelos routes ──
// Sub-onda 7n.1 renomeou 10 cols físicas; restantes ficam para 7n.2.
function mapColuna(c: Record<string, unknown>): Record<string, unknown> {
  return {
    id:               c.id_coluna_usuario_pedido,
    tenant_id:        c.id_organizacao,
    product_id:       c.id_produto_gravity,
    nome:             c.nome_coluna_usuario_pedido,
    chave:            c.chave_coluna_usuario_pedido,
    tipo:             c.tipo_coluna_usuario_pedido,
    escopo:           c.escopo_coluna_usuario_pedido,
    visibilidade:     c.visibilidade_coluna_usuario_pedido,
    roles_permitidas: c.tipos_usuario_workspace_permitidos_coluna_usuario_pedido,
    obrigatorio:      c.obrigatorio_coluna_usuario_pedido,
    opcoes:           c.opcoes_coluna_usuario_pedido,
    descricao:        c.descricao_coluna_usuario_pedido,
    valor_padrao:     c.valor_padrao_coluna_usuario_pedido,
    ordem:            c.ordem_coluna_usuario_pedido,
    ativo:            c.ativo_coluna_usuario_pedido,
    created_by:       c.criado_por_coluna_usuario_pedido,
    created_at:       c.data_criacao_coluna_usuario_pedido,
    updated_at:       c.data_atualizacao_coluna_usuario_pedido,
  }
}

// ── Service ────────────────────��─────────────────────────────────��────────────

export class ColunasUsuarioService {
  // ── Criar coluna ────────────��───────────────────────────���───────────────────

  async criar(tenantId: string, input: CriarColunaInput, db: Record<string, unknown>) {
    const prisma = db as any

    // 1. Limite de 50 colunas
    const total = await prisma.colunaUsuarioPedido.count({
      where: { id_organizacao: tenantId, ativo_coluna_usuario_pedido: true },
    })
    if (total >= 50) {
      throw new AppError('Limite de 50 colunas atingido.', 422, 'LIMITE_COLUNAS')
    }

    // 2. Nome único por tenant
    const nomeExistente = await prisma.colunaUsuarioPedido.findFirst({
      where: { id_organizacao: tenantId, nome_coluna_usuario_pedido: input.nome, ativo_coluna_usuario_pedido: true },
    })
    if (nomeExistente) {
      throw new AppError('Já existe uma coluna com este nome.', 409, 'NOME_DUPLICADO')
    }

    // 3. Gerar chave
    const chave = slugifyNome(input.nome)

    // Verificar unicidade da chave também
    const chaveExistente = await prisma.colunaUsuarioPedido.findFirst({
      where: { id_organizacao: tenantId, chave_coluna_usuario_pedido: chave },
    })
    if (chaveExistente) {
      throw new AppError(
        `A chave gerada "${chave}" já existe. Escolha um nome diferente.`,
        409,
        'CHAVE_DUPLICADA',
      )
    }

    // 4. Calcular próxima ordem
    const maxOrdem = await prisma.colunaUsuarioPedido.aggregate({
      where: { id_organizacao: tenantId },
      _max: { ordem_coluna_usuario_pedido: true },
    })
    const novaOrdem = (maxOrdem._max.ordem_coluna_usuario_pedido ?? 0) + 1

    // 5. Criar
    const created = await prisma.colunaUsuarioPedido.create({
      data: {
        id_organizacao:                    tenantId,
        nome_coluna_usuario_pedido:        input.nome,
        chave_coluna_usuario_pedido:       chave,
        tipo_coluna_usuario_pedido:        input.tipo,
        escopo_coluna_usuario_pedido:      input.escopo,
        visibilidade_coluna_usuario_pedido: input.visibilidade,
        tipos_usuario_workspace_permitidos_coluna_usuario_pedido: input.roles_permitidas ?? [],
        obrigatorio_coluna_usuario_pedido: input.obrigatorio ?? false,
        opcoes_coluna_usuario_pedido:      input.opcoes ?? [],
        descricao_coluna_usuario_pedido:   input.descricao,
        valor_padrao_coluna_usuario_pedido: input.valor_padrao,
        ordem_coluna_usuario_pedido:       novaOrdem,
        ativo_coluna_usuario_pedido:       true,
        criado_por_coluna_usuario_pedido:  input.created_by,
      },
    })
    return mapColuna(created)
  }

  // ── Listar colunas (filtrado por visibilidade) ──────────────���────────────────

  async listar(tenantId: string, userId: string, userRoles: string[], db: Record<string, unknown>) {
    const prisma = db as any

    const colunas = await prisma.colunaUsuarioPedido.findMany({
      where: { id_organizacao: tenantId, ativo_coluna_usuario_pedido: true },
      orderBy: { ordem_coluna_usuario_pedido: 'asc' },
    })

    // Filtra por visibilidade (campos DDD novos)
    const filtradas = colunas.filter((col: {
      visibilidade_coluna_usuario_pedido: string
      tipos_usuario_workspace_permitidos_coluna_usuario_pedido: string[]
      criado_por_coluna_usuario_pedido: string
    }) => {
      if (col.visibilidade_coluna_usuario_pedido === 'todos') return true
      if (col.visibilidade_coluna_usuario_pedido === 'privado') return col.criado_por_coluna_usuario_pedido === userId
      if (col.visibilidade_coluna_usuario_pedido === 'roles') {
        return col.tipos_usuario_workspace_permitidos_coluna_usuario_pedido.some((r: string) => userRoles.includes(r))
      }
      return false
    })
    return filtradas.map(mapColuna)
  }

  // ── Atualizar coluna ────────────────────────────��────────────────────────────

  async atualizar(
    tenantId: string,
    id: string,
    input: AtualizarColunaInput,
    db: Record<string, unknown>,
  ) {
    const prisma = db as any

    const coluna = await prisma.colunaUsuarioPedido.findFirst({
      where: { id_coluna_usuario_pedido: id, id_organizacao: tenantId },
    })
    if (!coluna) {
      throw new AppError('Coluna não encontrada.', 404, 'NOT_FOUND')
    }

    // Valida nome único (se mudou)
    if (input.nome && input.nome !== coluna.nome_coluna_usuario_pedido) {
      const nomeExistente = await prisma.colunaUsuarioPedido.findFirst({
        where: { id_organizacao: tenantId, nome_coluna_usuario_pedido: input.nome, ativo_coluna_usuario_pedido: true, id_coluna_usuario_pedido: { not: id } },
      })
      if (nomeExistente) {
        throw new AppError('Já existe uma coluna com este nome.', 409, 'NOME_DUPLICADO')
      }
    }

    const updated = await prisma.colunaUsuarioPedido.update({
      where: { id_coluna_usuario_pedido: id },
      data: {
        nome_coluna_usuario_pedido:        input.nome,
        escopo_coluna_usuario_pedido:      input.escopo,
        visibilidade_coluna_usuario_pedido: input.visibilidade,
        tipos_usuario_workspace_permitidos_coluna_usuario_pedido: input.roles_permitidas,
        obrigatorio_coluna_usuario_pedido: input.obrigatorio,
        opcoes_coluna_usuario_pedido:      input.opcoes,
        descricao_coluna_usuario_pedido:   input.descricao,
        valor_padrao_coluna_usuario_pedido: input.valor_padrao,
      },
    })
    return mapColuna(updated)
  }

  // ── Soft delete ──────────────────────────────────────────────────────────��───

  async excluir(tenantId: string, id: string, db: Record<string, unknown>) {
    const prisma = db as any

    const coluna = await prisma.colunaUsuarioPedido.findFirst({
      where: { id_coluna_usuario_pedido: id, id_organizacao: tenantId },
    })
    if (!coluna) {
      throw new AppError('Coluna não encontrada.', 404, 'NOT_FOUND')
    }

    await prisma.colunaUsuarioPedido.update({
      where: { id_coluna_usuario_pedido: id },
      data: { ativo_coluna_usuario_pedido: false },
    })
  }

  // ── Reordenar ────────────────────────────���──────────────────────────────��────

  async reordenar(tenantId: string, ids: string[], db: Record<string, unknown>) {
    const prisma = db as any

    await prisma.$transaction(
      ids.map((id, idx) =>
        prisma.colunaUsuarioPedido.updateMany({
          where: { id_coluna_usuario_pedido: id, id_organizacao: tenantId },
          data: { ordem_coluna_usuario_pedido: idx + 1 },
        }),
      ),
    )
  }

  // ── Salvar valores (upsert) ─────────────────────────────���────────────────────

  async salvarValores(tenantId: string, input: SalvarValoresInput, db: Record<string, unknown>) {
    const prisma = db as any

    await prisma.$transaction(
      Object.entries(input.valores).map(([coluna_id, valor]) =>
        prisma.pedidoValorColunaUsuario.upsert({
          where: {
            id_organizacao_id_coluna_usuario_pedido_id_vinculo_valor_coluna_usuario_pedido: {
              id_organizacao:                         tenantId,
              id_coluna_usuario_pedido:               coluna_id,
              id_vinculo_valor_coluna_usuario_pedido: input.vinculo_id,
            },
          },
          create: {
            id_organizacao:                         tenantId,
            id_coluna_usuario_pedido:               coluna_id,
            vinculo_valor_coluna_usuario_pedido:    input.vinculo,
            id_vinculo_valor_coluna_usuario_pedido: input.vinculo_id,
            valor_coluna_usuario_pedido:            valor,
          },
          update: { valor_coluna_usuario_pedido: valor },
        }),
      ),
    )
  }

  // ── Listar valores ──────────────��──────────────────────────────���─────────────

  async listarValores(
    tenantId: string,
    vinculo: string,
    vinculoId: string,
    db: Record<string, unknown>,
  ) {
    const prisma = db as any

    const registros: Array<{
      id_valor_coluna_usuario_pedido:         string
      id_organizacao:                         string
      id_coluna_usuario_pedido:               string
      vinculo_valor_coluna_usuario_pedido:    string
      id_vinculo_valor_coluna_usuario_pedido: string
      valor_coluna_usuario_pedido:            string
    }> = await prisma.pedidoValorColunaUsuario.findMany({
      where: {
        id_organizacao:                      tenantId,
        vinculo_valor_coluna_usuario_pedido: vinculo,
        id_vinculo_valor_coluna_usuario_pedido: vinculoId,
      },
    })

    // Mapper: preserva contrato JSON `ValorColunaUsuario` do client (types.ts:911)
    return registros.map(r => ({
      id:         r.id_valor_coluna_usuario_pedido,
      tenant_id:  r.id_organizacao,
      coluna_id:  r.id_coluna_usuario_pedido,
      vinculo:    r.vinculo_valor_coluna_usuario_pedido,
      vinculo_id: r.id_vinculo_valor_coluna_usuario_pedido,
      valor:      r.valor_coluna_usuario_pedido,
    }))
  }
}
