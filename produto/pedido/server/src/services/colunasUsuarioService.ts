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

// ── Service ────────────────────��─────────────────────────────────��────────────

export class ColunasUsuarioService {
  // ── Criar coluna ────────────��───────────────────────────���───────────────────

  async criar(tenantId: string, input: CriarColunaInput, db: Record<string, unknown>) {
    const prisma = db as any

    // 1. Limite de 50 colunas
    const total = await prisma.colunaUsuarioPedido.count({
      where: { tenant_id: tenantId, ativo: true },
    })
    if (total >= 50) {
      throw new AppError('Limite de 50 colunas atingido.', 422, 'LIMITE_COLUNAS')
    }

    // 2. Nome único por tenant
    const nomeExistente = await prisma.colunaUsuarioPedido.findFirst({
      where: { tenant_id: tenantId, nome: input.nome, ativo: true },
    })
    if (nomeExistente) {
      throw new AppError('Já existe uma coluna com este nome.', 409, 'NOME_DUPLICADO')
    }

    // 3. Gerar chave
    const chave = slugifyNome(input.nome)

    // Verificar unicidade da chave também
    const chaveExistente = await prisma.colunaUsuarioPedido.findFirst({
      where: { tenant_id: tenantId, chave },
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
      where: { tenant_id: tenantId },
      _max: { ordem: true },
    })
    const novaOrdem = (maxOrdem._max.ordem ?? 0) + 1

    // 5. Criar
    return prisma.colunaUsuarioPedido.create({
      data: {
        tenant_id:        tenantId,
        nome:             input.nome,
        chave,
        tipo:             input.tipo,
        escopo:           input.escopo,
        visibilidade:     input.visibilidade,
        roles_permitidas: input.roles_permitidas ?? [],
        obrigatorio:      input.obrigatorio ?? false,
        opcoes:           input.opcoes ?? [],
        descricao:        input.descricao,
        valor_padrao:     input.valor_padrao,
        ordem:            novaOrdem,
        ativo:            true,
        created_by:       input.created_by,
      },
    })
  }

  // ── Listar colunas (filtrado por visibilidade) ──────────────���────────────────

  async listar(tenantId: string, userId: string, userRoles: string[], db: Record<string, unknown>) {
    const prisma = db as any

    const colunas = await prisma.colunaUsuarioPedido.findMany({
      where: { tenant_id: tenantId, ativo: true },
      orderBy: { ordem: 'asc' },
    })

    // Filtra por visibilidade
    return colunas.filter((col: {
      visibilidade: string
      roles_permitidas: string[]
      created_by: string
    }) => {
      if (col.visibilidade === 'todos') return true
      if (col.visibilidade === 'privado') return col.created_by === userId
      if (col.visibilidade === 'roles') {
        return col.roles_permitidas.some((r: string) => userRoles.includes(r))
      }
      return false
    })
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
      where: { id, tenant_id: tenantId },
    })
    if (!coluna) {
      throw new AppError('Coluna não encontrada.', 404, 'NOT_FOUND')
    }

    // Valida nome único (se mudou)
    if (input.nome && input.nome !== coluna.nome) {
      const nomeExistente = await prisma.colunaUsuarioPedido.findFirst({
        where: { tenant_id: tenantId, nome: input.nome, ativo: true, id: { not: id } },
      })
      if (nomeExistente) {
        throw new AppError('Já existe uma coluna com este nome.', 409, 'NOME_DUPLICADO')
      }
    }

    return prisma.colunaUsuarioPedido.update({
      where: { id },
      data: {
        nome:             input.nome,
        escopo:           input.escopo,
        visibilidade:     input.visibilidade,
        roles_permitidas: input.roles_permitidas,
        obrigatorio:      input.obrigatorio,
        opcoes:           input.opcoes,
        descricao:        input.descricao,
        valor_padrao:     input.valor_padrao,
      },
    })
  }

  // ── Soft delete ──────────────────────────────────────────────────────────��───

  async excluir(tenantId: string, id: string, db: Record<string, unknown>) {
    const prisma = db as any

    const coluna = await prisma.colunaUsuarioPedido.findFirst({
      where: { id, tenant_id: tenantId },
    })
    if (!coluna) {
      throw new AppError('Coluna não encontrada.', 404, 'NOT_FOUND')
    }

    await prisma.colunaUsuarioPedido.update({
      where: { id },
      data: { ativo: false },
    })
  }

  // ── Reordenar ────────────────────────────���──────────────────────────────��────

  async reordenar(tenantId: string, ids: string[], db: Record<string, unknown>) {
    const prisma = db as any

    await prisma.$transaction(
      ids.map((id, idx) =>
        prisma.colunaUsuarioPedido.updateMany({
          where: { id, tenant_id: tenantId },
          data: { ordem: idx + 1 },
        }),
      ),
    )
  }

  // ── Salvar valores (upsert) ─────────────────────────────���────────────────────

  async salvarValores(tenantId: string, input: SalvarValoresInput, db: Record<string, unknown>) {
    const prisma = db as any

    await prisma.$transaction(
      Object.entries(input.valores).map(([coluna_id, valor]) =>
        prisma.valorColunaUsuarioPedido.upsert({
          where: {
            id_organizacao_id_coluna_id_vinculo: {
              id_organizacao: tenantId,
              id_coluna:      coluna_id,
              id_vinculo:     input.vinculo_id,
            },
          },
          create: {
            id_organizacao:                      tenantId,
            id_coluna:                           coluna_id,
            vinculo_valor_coluna_usuario_pedido: input.vinculo,
            id_vinculo:                          input.vinculo_id,
            valor_valor_coluna_usuario_pedido:   valor,
          },
          update: { valor_valor_coluna_usuario_pedido: valor },
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
      id_valor_coluna_usuario_pedido:      string
      id_organizacao:                      string
      id_coluna:                           string
      vinculo_valor_coluna_usuario_pedido: string
      id_vinculo:                          string
      valor_valor_coluna_usuario_pedido:   string
    }> = await prisma.valorColunaUsuarioPedido.findMany({
      where: {
        id_organizacao:                      tenantId,
        vinculo_valor_coluna_usuario_pedido: vinculo,
        id_vinculo:                          vinculoId,
      },
    })

    // Mapper: preserva contrato JSON `ValorColunaUsuario` do client (types.ts:911)
    return registros.map(r => ({
      id:         r.id_valor_coluna_usuario_pedido,
      tenant_id:  r.id_organizacao,
      coluna_id:  r.id_coluna,
      vinculo:    r.vinculo_valor_coluna_usuario_pedido,
      vinculo_id: r.id_vinculo,
      valor:      r.valor_valor_coluna_usuario_pedido,
    }))
  }
}
