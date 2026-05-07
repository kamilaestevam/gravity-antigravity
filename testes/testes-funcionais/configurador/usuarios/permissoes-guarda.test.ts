// @vitest-environment node
// TST-FUN-CONFIG-PERM-GUARD-001 — Teste-guardião do Set PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS
//
// BLOQUEANTE DE CI. NUNCA pular com `.skip` ou `xit`. É a única defesa contra:
//   (a) entrada órfã no Set apontando para produto sem rotas/middleware reais
//   (b) produto novo ATIVO no catálogo entrando sem decisão explícita
//
// Decisão arquitetural 2026-05-04 — convenção `<slug>:<secao>:<acao>` (skill `permissoes`).
/// <reference types="vitest/globals" />

import { describe, it, expect } from 'vitest'
import {
  PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS,
  SECOES_PRODUTO,
  ACOES_PRODUTO,
  permissaoStringSchema,
  buildPermissaoString,
  parsePermissaoString,
} from '../../../../servicos-global/configurador/server/services/permissao-usuario-servico.js'
import { temBypassPermissao } from '../../../../servicos-global/configurador/shared/index.js'

describe('Permissões — guardião do Set PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS', () => {
  it('Set não pode estar vazio (Mandamento 08 — falha alto se houver regressão)', () => {
    expect(PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS.size).toBeGreaterThan(0)
  })

  it("contém 'pedido' (único produto com toggles ativos em 2026-05-04)", () => {
    expect(PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS.has('pedido')).toBe(true)
  })

  it('lista esperada de produtos AINDA NÃO implementados — atualizar quando produto migrar', () => {
    // Lista canônica do catálogo `ProdutoGravity` (seedProducts em produto-gravity-catalogo-service.ts)
    const slugsCatalogo = ['pedido', 'simula-custo', 'bid-frete', 'bid-cambio', 'nf-importacao']
    const ausentes = slugsCatalogo.filter(s => !PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS.has(s))

    // Quando alguém migrar (ex: simula-custo) deve adicionar ao Set E atualizar essa lista.
    // Se essa lista não bater com o real, falhar => alguém esqueceu de decidir.
    expect(ausentes.sort()).toEqual(['bid-cambio', 'bid-frete', 'nf-importacao', 'simula-custo'])
  })
})

describe('Permissões — formato canônico <slug>:<secao>:<acao>', () => {
  it('aceita strings válidas para todos os pares (secao, acao)', () => {
    for (const secao of SECOES_PRODUTO) {
      for (const acao of ACOES_PRODUTO) {
        const s = `pedido:${secao}:${acao}`
        const r = permissaoStringSchema.safeParse(s)
        expect(r.success, `falhou em "${s}": ${!r.success ? r.error.issues[0]?.message : ''}`).toBe(true)
      }
    }
  })

  it.each([
    ['email:dashboard:ver',          'seção legada (email não está em SECOES_PRODUTO)'],
    ['pedido:dashboard:READ',        'ação maiúscula (case)'],
    ['pedido:dashboard:write',       'ação inglesa legada'],
    ['Pedido:dashboard:ver',         'slug com maiúscula'],
    ['pedido:dashboard',             'sem ação'],
    ['pedido::ver',                  'seção vazia'],
    [':dashboard:ver',               'slug vazio'],
    ['pedido:invalida:ver',          'seção fora da lista'],
    ['pedido:dashboard:invalida',    'ação fora da lista'],
  ])('rejeita %s — %s', (s) => {
    expect(permissaoStringSchema.safeParse(s).success).toBe(false)
  })

  it('build/parse round-trip para todas as combinações canônicas', () => {
    for (const secao of SECOES_PRODUTO) {
      for (const acao of ACOES_PRODUTO) {
        const s = buildPermissaoString('pedido', secao, acao)
        const parsed = parsePermissaoString(s)
        expect(parsed).toEqual({ slug: 'pedido', secao, acao })
      }
    }
  })

  it('parsePermissaoString devolve null para entrada inválida', () => {
    expect(parsePermissaoString('lixo')).toBeNull()
    expect(parsePermissaoString('pedido:lixo:ver')).toBeNull()
  })
})

describe('Permissões — temBypassPermissao (Mandamento 04)', () => {
  it.each([
    ['SUPER_ADMIN', true],
    ['ADMIN',       true],
    ['MASTER',      true],
    ['PADRAO',      false],
    ['FORNECEDOR',  false],
    ['',            false],
  ] as const)('tipo_usuario=%s → %s', (tipo, esperado) => {
    expect(temBypassPermissao({ tipo_usuario: tipo })).toBe(esperado)
  })
})

describe('Permissões — constantes canônicas', () => {
  it('SECOES_PRODUTO tem exatamente 6 valores fixos', () => {
    expect([...SECOES_PRODUTO].sort()).toEqual(
      ['configuracao', 'dashboard', 'historico', 'kanban', 'lista', 'relatorios'].sort()
    )
  })

  it('ACOES_PRODUTO tem exatamente 2 valores fixos (ver/editar — em PT-BR)', () => {
    expect([...ACOES_PRODUTO].sort()).toEqual(['editar', 'ver'])
  })
})
