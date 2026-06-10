/**
 * filtro-busca-pedido.test.ts — Busca da Lista cobre colunas do usuário.
 *
 * Bug original (2026-06-10): a busca da Lista de Pedidos filtrava apenas
 * campos fixos (numero_pedido & cia) — colunas criadas manualmente pelo
 * usuário eram invisíveis para a busca, tanto por NOME quanto por CONTEÚDO.
 *
 * `montarCondicoesBuscaPedido` é a fonte única do OR de busca usada por
 * GET /pedidos, GET /pedidos/lista/kpis e GET /pedidos/inicializacao.
 */

import { describe, it, expect } from 'vitest'
import {
  montarCondicoesBuscaPedido,
  colunaVisivelParaUsuario,
  type DbBuscaPedido,
} from '../../../../processos-core/src/services/filtro-busca-pedido.js'

// ── Mock mínimo do PrismaClient — apenas os delegates que a busca toca ───────

interface ColunaMock {
  id_coluna_usuario_pedido: string
  nome_coluna_usuario_pedido: string
  visibilidade_coluna_usuario_pedido: string | null
  tipos_usuario_workspace_permitidos_coluna_usuario_pedido: string[]
  criado_por_coluna_usuario_pedido: string
}

interface ValorMock {
  id_coluna_usuario_pedido: string
  vinculo_valor_coluna_usuario_pedido: string
  id_vinculo_valor_coluna_usuario_pedido: string
  valor_coluna_usuario_pedido: string
}

function criarDbMock(colunas: ColunaMock[], valores: ValorMock[]): DbBuscaPedido {
  return {
    pedidoListaColunaUsuario: {
      findMany: async () => colunas,
    },
    pedidoListaColunaUsuarioValor: {
      // Reaplica as condições OR que o helper monta (conteúdo + nome preenchido)
      findMany: async (args: Record<string, unknown>) => {
        const where = args.where as {
          OR: Array<{
            id_coluna_usuario_pedido: { in: string[] }
            valor_coluna_usuario_pedido: { contains?: string; not?: string }
          }>
        }
        return valores.filter(v => where.OR.some(cond => {
          if (!cond.id_coluna_usuario_pedido.in.includes(v.id_coluna_usuario_pedido)) return false
          const filtroValor = cond.valor_coluna_usuario_pedido
          if (filtroValor.contains !== undefined) {
            return v.valor_coluna_usuario_pedido.toLowerCase()
              .includes(filtroValor.contains.toLowerCase())
          }
          return v.valor_coluna_usuario_pedido !== (filtroValor.not ?? '')
        }))
      },
    },
  }
}

const colunaBase: ColunaMock = {
  id_coluna_usuario_pedido: 'col_margem',
  nome_coluna_usuario_pedido: 'Margem',
  visibilidade_coluna_usuario_pedido: 'todos',
  tipos_usuario_workspace_permitidos_coluna_usuario_pedido: [],
  criado_por_coluna_usuario_pedido: 'usr_dono',
}

const usuario = { idUsuario: 'usr_1', tiposUsuario: ['operador'] }

function extrairIdsPedido(condicoes: Array<Record<string, unknown>>): string[] {
  const cond = condicoes.find(c => 'id_pedido' in c) as
    { id_pedido: { in: string[] } } | undefined
  return cond?.id_pedido.in ?? []
}

function extrairIdsItem(condicoes: Array<Record<string, unknown>>): string[] {
  const cond = condicoes.find(c => 'itens_pedido' in c) as
    { itens_pedido: { some: { id_item: { in: string[] } } } } | undefined
  return cond?.itens_pedido.some.id_item.in ?? []
}

// ── Condições fixas ───────────────────────────────────────────────────────────

describe('montarCondicoesBuscaPedido — campos fixos', () => {
  it('sem colunas do usuário → só as 7 condições fixas, sem IN vazio', async () => {
    const db = criarDbMock([], [])
    const condicoes = await montarCondicoesBuscaPedido(db, 'PO-123', 'org_1', usuario)

    expect(condicoes).toHaveLength(7)
    expect(condicoes[0]).toEqual({ numero_pedido: { contains: 'PO-123', mode: 'insensitive' } })
    expect(condicoes.some(c => 'snapshots_empresa_pedido' in c)).toBe(true)
    expect(condicoes.some(c => 'id_pedido' in c)).toBe(false)
    expect(condicoes.some(c => 'itens_pedido' in c)).toBe(false)
  })
})

// ── Busca por CONTEÚDO de coluna do usuário ──────────────────────────────────

describe('montarCondicoesBuscaPedido — conteúdo de coluna do usuário', () => {
  it('valor de vínculo pedido que contém o termo → id_pedido IN', async () => {
    const db = criarDbMock(
      [colunaBase],
      [{
        id_coluna_usuario_pedido: 'col_margem',
        vinculo_valor_coluna_usuario_pedido: 'pedido',
        id_vinculo_valor_coluna_usuario_pedido: 'ped_42',
        valor_coluna_usuario_pedido: 'aprovado pela diretoria',
      }],
    )
    const condicoes = await montarCondicoesBuscaPedido(db, 'diretoria', 'org_1', usuario)
    expect(extrairIdsPedido(condicoes)).toEqual(['ped_42'])
  })

  it('valor de vínculo item que contém o termo → itens_pedido some id_item IN (promove o pai)', async () => {
    const db = criarDbMock(
      [colunaBase],
      [{
        id_coluna_usuario_pedido: 'col_margem',
        vinculo_valor_coluna_usuario_pedido: 'item',
        id_vinculo_valor_coluna_usuario_pedido: 'item_7',
        valor_coluna_usuario_pedido: 'lote especial',
      }],
    )
    const condicoes = await montarCondicoesBuscaPedido(db, 'especial', 'org_1', usuario)
    expect(extrairIdsItem(condicoes)).toEqual(['item_7'])
    expect(extrairIdsPedido(condicoes)).toEqual([])
  })

  it('valor que NÃO contém o termo → sem condição de IN', async () => {
    const db = criarDbMock(
      [colunaBase],
      [{
        id_coluna_usuario_pedido: 'col_margem',
        vinculo_valor_coluna_usuario_pedido: 'pedido',
        id_vinculo_valor_coluna_usuario_pedido: 'ped_42',
        valor_coluna_usuario_pedido: 'outra coisa',
      }],
    )
    const condicoes = await montarCondicoesBuscaPedido(db, 'diretoria', 'org_1', usuario)
    expect(condicoes.some(c => 'id_pedido' in c)).toBe(false)
  })
})

// ── Busca por NOME de coluna do usuário ──────────────────────────────────────

describe('montarCondicoesBuscaPedido — nome de coluna do usuário', () => {
  it('termo bate no nome da coluna → pedidos com a coluna PREENCHIDA entram', async () => {
    const db = criarDbMock(
      [colunaBase], // nome "Margem"
      [
        {
          id_coluna_usuario_pedido: 'col_margem',
          vinculo_valor_coluna_usuario_pedido: 'pedido',
          id_vinculo_valor_coluna_usuario_pedido: 'ped_preenchido',
          valor_coluna_usuario_pedido: '12%',
        },
        {
          id_coluna_usuario_pedido: 'col_margem',
          vinculo_valor_coluna_usuario_pedido: 'pedido',
          id_vinculo_valor_coluna_usuario_pedido: 'ped_vazio',
          valor_coluna_usuario_pedido: '',
        },
      ],
    )
    const condicoes = await montarCondicoesBuscaPedido(db, 'margem', 'org_1', usuario)
    expect(extrairIdsPedido(condicoes)).toEqual(['ped_preenchido'])
  })
})

// ── Visibilidade ──────────────────────────────────────────────────────────────

describe('montarCondicoesBuscaPedido — visibilidade', () => {
  const valorPrivado: ValorMock = {
    id_coluna_usuario_pedido: 'col_privada',
    vinculo_valor_coluna_usuario_pedido: 'pedido',
    id_vinculo_valor_coluna_usuario_pedido: 'ped_secreto',
    valor_coluna_usuario_pedido: 'confidencial',
  }
  const colunaPrivada: ColunaMock = {
    ...colunaBase,
    id_coluna_usuario_pedido: 'col_privada',
    nome_coluna_usuario_pedido: 'Anotação',
    visibilidade_coluna_usuario_pedido: 'privado',
    criado_por_coluna_usuario_pedido: 'usr_dono',
  }

  it('coluna privada de OUTRO usuário não entra na busca', async () => {
    const db = criarDbMock([colunaPrivada], [valorPrivado])
    const condicoes = await montarCondicoesBuscaPedido(db, 'confidencial', 'org_1', usuario)
    expect(condicoes.some(c => 'id_pedido' in c)).toBe(false)
  })

  it('coluna privada do PRÓPRIO usuário entra na busca', async () => {
    const db = criarDbMock([colunaPrivada], [valorPrivado])
    const condicoes = await montarCondicoesBuscaPedido(
      db, 'confidencial', 'org_1', { idUsuario: 'usr_dono', tiposUsuario: [] },
    )
    expect(extrairIdsPedido(condicoes)).toEqual(['ped_secreto'])
  })

  it('coluna restrita a roles respeita tipos do usuário', () => {
    const colunaRoles: ColunaMock = {
      ...colunaBase,
      visibilidade_coluna_usuario_pedido: 'roles',
      tipos_usuario_workspace_permitidos_coluna_usuario_pedido: ['gestor'],
    }
    expect(colunaVisivelParaUsuario(colunaRoles, { idUsuario: 'x', tiposUsuario: ['operador'] })).toBe(false)
    expect(colunaVisivelParaUsuario(colunaRoles, { idUsuario: 'x', tiposUsuario: ['gestor'] })).toBe(true)
  })
})

// ── Dedup ─────────────────────────────────────────────────────────────────────

describe('montarCondicoesBuscaPedido — dedup de vínculos', () => {
  it('dois valores da mesma coluna/pedido não duplicam o id no IN', async () => {
    const db = criarDbMock(
      [
        colunaBase,
        { ...colunaBase, id_coluna_usuario_pedido: 'col_obs', nome_coluna_usuario_pedido: 'Observação' },
      ],
      [
        {
          id_coluna_usuario_pedido: 'col_margem',
          vinculo_valor_coluna_usuario_pedido: 'pedido',
          id_vinculo_valor_coluna_usuario_pedido: 'ped_42',
          valor_coluna_usuario_pedido: 'urgente A',
        },
        {
          id_coluna_usuario_pedido: 'col_obs',
          vinculo_valor_coluna_usuario_pedido: 'pedido',
          id_vinculo_valor_coluna_usuario_pedido: 'ped_42',
          valor_coluna_usuario_pedido: 'urgente B',
        },
      ],
    )
    const condicoes = await montarCondicoesBuscaPedido(db, 'urgente', 'org_1', usuario)
    expect(extrairIdsPedido(condicoes)).toEqual(['ped_42'])
  })
})
