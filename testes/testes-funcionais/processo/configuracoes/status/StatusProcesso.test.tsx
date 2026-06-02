// TST-FUNC-PROC-STATUS-001 — Testes funcionais do componente StatusProcesso
// (Testing Library + jsdom). Cobre o fluxo de interacao do usuario com a tela.
//
// Categorias do plano (status-funcional.md):
//   STATUS-F01..F06   renderizacao inicial
//   STATUS-F07..F10   expandir/recolher rule editor
//   STATUS-F11..F14   GABI verde (regras validas)
//   STATUS-F15..F18   incompatibilidade tipo x condicao
//   STATUS-F19..F21   valor de comparacao ausente
//   STATUS-F22..F24   conflito logico no AND
//   STATUS-F25..F28   barra sticky de salvar (dirty state)
//   STATUS-F29..F31   adicionar/remover regras
//   STATUS-F32..F34   acessibilidade DOM (data-testid)
//   STATUS-F35..F37   isolamento de testes (cleanup)

// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import React from 'react'
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react'
import { act } from 'react'
import StatusProcesso from '../../../../../servicos-global/produto/processo/client/src/pages/configuracoes/status/StatusProcesso.js'

// Cleanup explicito apos cada teste (garante DOM e estado limpos).
afterEach(() => {
  cleanup()
})

// ── Helpers ────────────────────────────────────────────────────────────────

function abrirEditorDoStatus(idx: number) {
  const linhas = screen.getAllByTestId(/^status-row-/)
  const linha = linhas[idx]
  const pencil = within(linha).getByRole('button', { name: /Editar regras|Fechar editor de regras/i })
  act(() => {
    fireEvent.click(pencil)
  })
}

function pegarGabiVisivel() {
  return screen.queryByTestId('gabi-painel')
}

// ── STATUS-F01..F06  renderizacao inicial ──────────────────────────────────

describe('TESTE 1 — renderizacao basica', () => {
  it('renderiza pagina com 5 status mockados nos inputs editaveis', () => {
    render(<StatusProcesso />)

    expect(screen.getByText('Status do Processo')).toBeDefined()

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    const nomes = inputs.map(i => i.value)
    expect(nomes).toContain('Rascunho')
    expect(nomes).toContain('Aberto')
    expect(nomes).toContain('Em Embarque')
    expect(nomes).toContain('Em Desembaraço')
    expect(nomes).toContain('Concluído')

    expect(screen.getByRole('button', { name: /Novo Status/i })).toBeDefined()
    expect(screen.getAllByTestId(/^status-row-/)).toHaveLength(5)
  })

  it('cada status mostra pill de regras com contagem correta', () => {
    render(<StatusProcesso />)
    expect(screen.getAllByText(/2 regras/).length).toBeGreaterThanOrEqual(3)
    expect(screen.getAllByText(/1 regra/).length).toBeGreaterThanOrEqual(2)
  })
})

// ── STATUS-F07..F14  expandir + GABI verde ────────────────────────────────

describe('TESTE 2 — expandir editor + GABI valido', () => {
  it('click no pencil abre rule editor e GABI mostra "REGRAS VALIDAS"', () => {
    render(<StatusProcesso />)

    expect(pegarGabiVisivel()).toBeNull()

    abrirEditorDoStatus(0)

    const gabi = pegarGabiVisivel()
    expect(gabi).not.toBeNull()
    expect(gabi?.getAttribute('data-state')).toBe('ok')
    expect(within(gabi!).getByText(/REGRAS VÁLIDAS/i)).toBeDefined()
    expect(within(gabi!).getByText(/Clique em/i)).toBeDefined()
  })
})

// ── STATUS-F15..F18  incompatibilidade tipo × condicao ────────────────────

describe('TESTE 3 — incompatibilidade tipo do campo × condicao', () => {
  it('trocar condicao para "maior_que" em campo texto → GABI VERMELHO INVALIDO', () => {
    render(<StatusProcesso />)
    abrirEditorDoStatus(0)

    const linha = screen.getAllByTestId(/^status-row-/)[0]
    const selects = linha.querySelectorAll<HTMLSelectElement>('.sp-regra select')
    expect(selects.length).toBe(3)

    fireEvent.change(selects[2], { target: { value: 'maior_que' } })

    const gabi = pegarGabiVisivel()
    expect(gabi?.getAttribute('data-state')).toBe('erro')
    expect(within(gabi!).getByText(/REGRA INVÁLIDA/i)).toBeDefined()
    const textoErro = gabi!.textContent ?? ''
    expect(textoErro.includes('texto') || textoErro.includes('não funciona')).toBe(true)
  })

  it('"contem" em campo texto eh valido (texto aceita contem)', () => {
    render(<StatusProcesso />)
    abrirEditorDoStatus(0)
    const linha = screen.getAllByTestId(/^status-row-/)[0]
    const selects = linha.querySelectorAll<HTMLSelectElement>('.sp-regra select')

    fireEvent.change(selects[2], { target: { value: 'contem' } })
    const valor = linha.querySelector<HTMLInputElement>('.sp-regra-valor')
    fireEvent.change(valor!, { target: { value: 'IMP' } })

    expect(pegarGabiVisivel()?.getAttribute('data-state')).toBe('ok')
  })
})

// ── STATUS-F19..F21  valor de comparacao ausente ──────────────────────────

describe('TESTE 4 — valor de comparacao ausente', () => {
  it('condicao "igual" sem valor → GABI mostra "valor de comparacao"', () => {
    render(<StatusProcesso />)
    abrirEditorDoStatus(0)

    const linha = screen.getAllByTestId(/^status-row-/)[0]
    const selects = linha.querySelectorAll<HTMLSelectElement>('.sp-regra select')

    fireEvent.change(selects[2], { target: { value: 'igual' } })

    const gabi = pegarGabiVisivel()
    expect(gabi?.getAttribute('data-state')).toBe('erro')
    expect(gabi?.textContent).toMatch(/valor de comparação/i)
  })

  it('apos preencher o valor, GABI volta a "ok"', () => {
    render(<StatusProcesso />)
    abrirEditorDoStatus(0)
    const linha = screen.getAllByTestId(/^status-row-/)[0]
    const selects = linha.querySelectorAll<HTMLSelectElement>('.sp-regra select')

    fireEvent.change(selects[2], { target: { value: 'igual' } })
    const valorInput = linha.querySelector<HTMLInputElement>('.sp-regra-valor')
    fireEvent.change(valorInput!, { target: { value: 'IMP-2026/0150' } })

    expect(pegarGabiVisivel()?.getAttribute('data-state')).toBe('ok')
  })
})

// ── STATUS-F22..F24  conflito logico no AND ──────────────────────────────

describe('TESTE 5 — conflito vazio+preenchido no AND', () => {
  it('adicionar 2 regras opostas no mesmo campo (AND) → GABI VERMELHO conflito', () => {
    render(<StatusProcesso />)
    abrirEditorDoStatus(0)

    const linha = screen.getAllByTestId(/^status-row-/)[0]

    const btnAddRegra = within(linha).getByText(/Adicionar regra/i)
    fireEvent.click(btnAddRegra)

    const regras = linha.querySelectorAll('.sp-regra')
    expect(regras.length).toBe(2)

    const gabi = pegarGabiVisivel()
    expect(gabi?.getAttribute('data-state')).toBe('erro')
    expect(gabi?.textContent).toMatch(/"vazio" E "preenchido"/i)
  })

  it('apos trocar operador pra OR, conflito desaparece', () => {
    render(<StatusProcesso />)
    abrirEditorDoStatus(0)
    const linha = screen.getAllByTestId(/^status-row-/)[0]
    const btnAddRegra = within(linha).getByText(/Adicionar regra/i)
    fireEvent.click(btnAddRegra)

    expect(pegarGabiVisivel()?.getAttribute('data-state')).toBe('erro')

    const btnOR = within(linha).getByText(/OU \(qualquer uma\)/i)
    fireEvent.click(btnOR)

    expect(pegarGabiVisivel()?.getAttribute('data-state')).toBe('ok')
  })
})

// ── STATUS-F25..F28  barra sticky de salvar ───────────────────────────────

describe('TESTE 6 — barra sticky de salvar (dirty state)', () => {
  it('alterar nome do status habilita barra "Alteracoes nao salvas"', () => {
    render(<StatusProcesso />)

    expect(screen.queryByText(/Alterações não salvas/i)).toBeNull()

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    fireEvent.change(inputs[0], { target: { value: 'Rascunho EDITADO' } })

    expect(screen.getByText(/Alterações não salvas/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Salvar/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Restaurar padrão/i })).toBeDefined()
  })
})
