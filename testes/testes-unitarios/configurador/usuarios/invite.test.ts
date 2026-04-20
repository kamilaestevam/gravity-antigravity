// @vitest-environment node
// TST-UNIT-CONF-USER-001 — Usuarios.tsx: seletor de workspaces no convite
// Anti-regressão: garante que workspaces é enviado no payload do invite,
// membershipsMap é atualizado pós-invite, ARIA semantics dos checkboxes estão
// presentes no fonte, e a lógica pura de payload/podesSalvar está correta.
/// <reference types="vitest/globals" />

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root      = path.resolve(__dirname, '../../../..')
const source    = readFileSync(
  path.join(root, 'servicos-global/configurador/src/pages/workspace/Usuarios.tsx'),
  'utf-8',
)

// ─── 1. Análise estática — payload do invite ──────────────────────────────────
describe('TST-UNIT-CONF-USER-001 — Usuarios.tsx: payload do convite (análise estática)', () => {

  it('envia campo "workspaces" no body JSON do invite', () => {
    expect(source).toContain('workspaces: workspacesPayload')
  })

  it('computa workspacesPayload apenas para Standard e Fornecedor', () => {
    expect(source).toContain("fTipo === 'Standard' || fTipo === 'Fornecedor'")
  })

  it('envia "all" quando fTodosWorkspaces é true', () => {
    expect(source).toContain("fTodosWorkspaces ? 'all' : fWorkspacesSelecionados")
  })

  it('workspacesPayload é undefined para Master (não envia campo workspaces)', () => {
    // A ternária retorna undefined para qualquer tipo fora de Standard/Fornecedor
    const payloadBlock = source.slice(
      source.indexOf('workspacesPayload'),
      source.indexOf('workspacesPayload') + 200,
    )
    expect(payloadBlock).toContain(': undefined')
  })
})

// ─── 2. Análise estática — acessibilidade (WCAG 2.1 AA) ──────────────────────
describe('TST-UNIT-CONF-USER-001 — Usuarios.tsx: ARIA dos checkboxes customizados', () => {

  it('role="checkbox" presente no mínimo em 2 elementos (toggle + item da lista)', () => {
    const matches = source.match(/role="checkbox"/g)
    expect(matches).not.toBeNull()
    expect(matches!.length).toBeGreaterThanOrEqual(2)
  })

  it('aria-checked dinâmico no toggle: aria-checked={fTodosWorkspaces}', () => {
    expect(source).toContain('aria-checked={fTodosWorkspaces}')
  })

  it('aria-checked dinâmico nos itens da lista: aria-checked={selecionado}', () => {
    expect(source).toContain('aria-checked={selecionado}')
  })

  it('tabIndex={0} presente no mínimo em 2 checkboxes para navegação por teclado', () => {
    const matches = source.match(/tabIndex=\{0\}/g)
    expect(matches).not.toBeNull()
    expect(matches!.length).toBeGreaterThanOrEqual(2)
  })

  it('onKeyDown do toggle responde à tecla Space', () => {
    expect(source).toContain("e.key === ' '")
  })

  it('onKeyDown do toggle responde à tecla Enter', () => {
    expect(source).toContain("e.key === 'Enter'")
  })

  it('onKeyDown dos itens da lista responde à tecla Space', () => {
    const listKeyBlock = source.slice(
      source.indexOf('onKeyDown={(ev)'),
      source.indexOf('onKeyDown={(ev)') + 150,
    )
    expect(listKeyBlock).toContain("ev.key === ' '")
  })
})

// ─── 3. Análise estática — membershipsMap pós-invite ─────────────────────────
describe('TST-UNIT-CONF-USER-001 — Usuarios.tsx: atualização do membershipsMap', () => {

  it('setMembershipsMap atualiza o mapa com o id do usuário criado', () => {
    expect(source).toContain('setMembershipsMap(prev => ({ ...prev, [created.id]: ids }))')
  })

  it('atualização de membershipsMap ocorre apenas para Standard e Fornecedor', () => {
    const updateBlock = source.slice(
      source.indexOf('setMembershipsMap(prev =>') - 250,
      source.indexOf('setMembershipsMap(prev =>') + 10,
    )
    expect(updateBlock).toContain("'Standard'")
    expect(updateBlock).toContain("'Fornecedor'")
  })

  it('ids usa fTodosWorkspaces para decidir entre todos os espacos ou selecionados', () => {
    const idsBlock = source.slice(
      source.indexOf('setMembershipsMap(prev =>') - 120,
      source.indexOf('setMembershipsMap(prev =>'),
    )
    expect(idsBlock).toContain('fTodosWorkspaces ? espacos.map(e => e.id) : fWorkspacesSelecionados')
  })
})

// ─── 4. Análise estática — podesSalvar ───────────────────────────────────────
describe('TST-UNIT-CONF-USER-001 — Usuarios.tsx: condição podesSalvar', () => {

  it('podesSalvar verifica fWorkspacesSelecionados.length > 0 quando toggle inativo', () => {
    expect(source).toContain('fWorkspacesSelecionados.length > 0')
  })

  it('podesSalvar inclui verificação de fTodosWorkspaces', () => {
    const podesSalvarBlock = source.slice(
      source.indexOf('podesSalvar'),
      source.indexOf('podesSalvar') + 200,
    )
    expect(podesSalvarBlock).toContain('fTodosWorkspaces')
  })
})

// ─── 5. Lógica pura — workspacesPayload ──────────────────────────────────────
describe('TST-UNIT-CONF-USER-001 — workspacesPayload: lógica de construção', () => {

  type NivelAcesso = 'Master' | 'Standard' | 'Fornecedor' | 'Admin' | 'Super Admin'

  function buildWorkspacesPayload(
    fTipo: NivelAcesso,
    fTodosWorkspaces: boolean,
    fWorkspacesSelecionados: string[],
  ): 'all' | string[] | undefined {
    return (fTipo === 'Standard' || fTipo === 'Fornecedor')
      ? (fTodosWorkspaces ? 'all' : fWorkspacesSelecionados)
      : undefined
  }

  it('Standard + toggle ativo → "all"', () => {
    expect(buildWorkspacesPayload('Standard', true, [])).toBe('all')
  })

  it('Standard + toggle inativo + IDs selecionados → array de IDs', () => {
    expect(buildWorkspacesPayload('Standard', false, ['id1', 'id2'])).toEqual(['id1', 'id2'])
  })

  it('Fornecedor + toggle ativo → "all"', () => {
    expect(buildWorkspacesPayload('Fornecedor', true, [])).toBe('all')
  })

  it('Fornecedor + toggle inativo + ID selecionado → array', () => {
    expect(buildWorkspacesPayload('Fornecedor', false, ['id3'])).toEqual(['id3'])
  })

  it('Master → undefined (não usa seletor de workspaces)', () => {
    expect(buildWorkspacesPayload('Master', false, ['qualquer'])).toBeUndefined()
  })

  it('Admin → undefined', () => {
    expect(buildWorkspacesPayload('Admin', true, [])).toBeUndefined()
  })

  it('Super Admin → undefined', () => {
    expect(buildWorkspacesPayload('Super Admin', false, ['id1'])).toBeUndefined()
  })
})

// ─── 6. Lógica pura — podesSalvar ────────────────────────────────────────────
describe('TST-UNIT-CONF-USER-001 — podesSalvar: bloqueio de submit incompleto', () => {

  type NivelAcesso = 'Master' | 'Standard' | 'Fornecedor' | 'Admin' | 'Super Admin'

  function calcPodesSalvar(
    fNome: string,
    fEmail: string,
    fTipo: NivelAcesso,
    fTodosWorkspaces: boolean,
    fWorkspacesSelecionados: string[],
  ): boolean {
    return !!(
      fNome.trim() &&
      fEmail.trim() &&
      ((fTipo !== 'Standard' && fTipo !== 'Fornecedor') || fTodosWorkspaces || fWorkspacesSelecionados.length > 0)
    )
  }

  it('Standard + nome + email + toggle ativo → true', () => {
    expect(calcPodesSalvar('Ana', 'ana@empresa.com', 'Standard', true, [])).toBe(true)
  })

  it('Standard + nome + email + toggle inativo + sem seleção → false', () => {
    expect(calcPodesSalvar('Ana', 'ana@empresa.com', 'Standard', false, [])).toBe(false)
  })

  it('Standard + nome + email + toggle inativo + com seleção → true', () => {
    expect(calcPodesSalvar('Ana', 'ana@empresa.com', 'Standard', false, ['id1'])).toBe(true)
  })

  it('Fornecedor + nome + email + toggle inativo + sem seleção → false', () => {
    expect(calcPodesSalvar('Ana', 'ana@empresa.com', 'Fornecedor', false, [])).toBe(false)
  })

  it('Fornecedor + nome + email + toggle ativo → true', () => {
    expect(calcPodesSalvar('Ana', 'ana@empresa.com', 'Fornecedor', true, [])).toBe(true)
  })

  it('Master + nome + email (sem workspaces) → true', () => {
    expect(calcPodesSalvar('Ana', 'ana@empresa.com', 'Master', false, [])).toBe(true)
  })

  it('Standard + nome vazio → false mesmo com workspaces selecionados', () => {
    expect(calcPodesSalvar('', 'ana@empresa.com', 'Standard', true, [])).toBe(false)
  })

  it('Standard + email vazio → false', () => {
    expect(calcPodesSalvar('Ana', '', 'Standard', true, [])).toBe(false)
  })

  it('Standard + nome só com espaços → false', () => {
    expect(calcPodesSalvar('   ', 'ana@empresa.com', 'Standard', true, [])).toBe(false)
  })
})

// ─── 7. Lógica pura — atualização do membershipsMap ──────────────────────────
describe('TST-UNIT-CONF-USER-001 — membershipsMap: atualização pós-invite', () => {

  type NivelAcesso = 'Master' | 'Standard' | 'Fornecedor' | 'Admin' | 'Super Admin'

  const ESPACOS = [
    { id: 'emp_01', nome: 'Filial A', usuarios: [] },
    { id: 'emp_02', nome: 'Filial B', usuarios: [] },
  ]

  function buildMembershipsUpdate(
    fTipo: NivelAcesso,
    fTodosWorkspaces: boolean,
    fWorkspacesSelecionados: string[],
    espacos: { id: string }[],
    userId: string,
    prev: Record<string, string[]>,
  ): Record<string, string[]> | null {
    if (fTipo !== 'Standard' && fTipo !== 'Fornecedor') return null
    const ids = fTodosWorkspaces ? espacos.map(e => e.id) : fWorkspacesSelecionados
    return { ...prev, [userId]: ids }
  }

  it('Standard + "all" → insere todos os IDs de espacos no mapa', () => {
    const result = buildMembershipsUpdate('Standard', true, [], ESPACOS, 'usr_new', {})
    expect(result).toEqual({ usr_new: ['emp_01', 'emp_02'] })
  })

  it('Standard + IDs específicos → insere apenas os IDs selecionados', () => {
    const result = buildMembershipsUpdate('Standard', false, ['emp_01'], ESPACOS, 'usr_new', {})
    expect(result).toEqual({ usr_new: ['emp_01'] })
  })

  it('Fornecedor + "all" → insere todos os IDs de espacos', () => {
    const result = buildMembershipsUpdate('Fornecedor', true, [], ESPACOS, 'usr_new', {})
    expect(result).toEqual({ usr_new: ['emp_01', 'emp_02'] })
  })

  it('Master → null (não atualiza membershipsMap)', () => {
    const result = buildMembershipsUpdate('Master', true, [], ESPACOS, 'usr_new', {})
    expect(result).toBeNull()
  })

  it('Admin → null (não atualiza membershipsMap)', () => {
    const result = buildMembershipsUpdate('Admin', true, [], ESPACOS, 'usr_new', {})
    expect(result).toBeNull()
  })

  it('preserva entradas anteriores do mapa ao adicionar novo usuário', () => {
    const prev = { usr_existing: ['emp_01'] }
    const result = buildMembershipsUpdate('Standard', true, [], ESPACOS, 'usr_new', prev)
    expect(result).toMatchObject({ usr_existing: ['emp_01'], usr_new: ['emp_01', 'emp_02'] })
  })

  it('Standard + IDs específicos não inclui IDs não selecionados', () => {
    const result = buildMembershipsUpdate('Standard', false, ['emp_01'], ESPACOS, 'usr_new', {})
    expect(result!['usr_new']).not.toContain('emp_02')
  })
})
