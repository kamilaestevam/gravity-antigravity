// @vitest-environment jsdom

/**
 * StatusProcesso.test.tsx — testes "em tela" do componente StatusProcesso.
 *
 * 5 testes com variações:
 *   1. Renderiza pagina com 5 status mockados
 *   2. Click no pencil expande o rule editor e GABI mostra VALIDA
 *   3. Trocar pra condicao incompativel ("maior_que" em texto) → GABI VERMELHO
 *   4. Condicao com valor vazio → GABI mostra erro de valor faltando
 *   5. AND com mesmo campo vazio+preenchido → GABI mostra conflito;
 *      ao trocar pra OR, GABI volta a verde
 *
 * Roda em jsdom (sem servidor, sem auth) via Vitest + Testing Library.
 */

import React from 'react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react'
import { act } from 'react'
import StatusProcesso from '../pages/configuracoes/status/StatusProcesso'

// Cleanup explicito apos cada teste (garante DOM e estado limpos).
afterEach(() => {
  cleanup()
})

// ── Helpers ────────────────────────────────────────────────────────────────

function abrirEditorDoStatus(idx: number) {
  const linhas = screen.getAllByTestId(/^status-row-/)
  const linha = linhas[idx]
  // Pencil eh o PRIMEIRO botao com title incluindo 'Editar' ou 'Fechar'
  const pencil = within(linha).getByRole('button', { name: /Editar regras|Fechar editor de regras/i })
  act(() => {
    fireEvent.click(pencil)
  })
}

function pegarGabiVisivel() {
  // Quando uma linha esta expandida, ha um painel GABI dentro dela
  return screen.queryByTestId('gabi-painel')
}

beforeEach(() => {
  // Estado fresco em cada teste (estado interno do componente)
})

// ── TESTE 1: render basico ─────────────────────────────────────────────────

describe('TESTE 1 — renderizacao basica', () => {
  it('renderiza pagina com 5 status mockados (Rascunho/Aberto/Em Embarque/Em Desembaraco/Concluido)', () => {
    render(<StatusProcesso />)

    expect(screen.getByText('Status do Processo')).toBeDefined()

    // Verifica todos os 5 nomes nos inputs editaveis
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    const nomes = inputs.map(i => i.value)
    expect(nomes).toContain('Rascunho')
    expect(nomes).toContain('Aberto')
    expect(nomes).toContain('Em Embarque')
    expect(nomes).toContain('Em Desembaraço')
    expect(nomes).toContain('Concluído')

    // Botao Novo Status visivel
    expect(screen.getByRole('button', { name: /Novo Status/i })).toBeDefined()

    // Conta linhas
    expect(screen.getAllByTestId(/^status-row-/)).toHaveLength(5)
  })

  it('cada status mostra pill de regras com a contagem correta', () => {
    render(<StatusProcesso />)
    // Rascunho tem 1 regra, Aberto tem 2, Em Embarque 2, Em Desembaraco 2, Concluido 1
    expect(screen.getAllByText(/2 regras/).length).toBeGreaterThanOrEqual(3)
    expect(screen.getAllByText(/1 regra/).length).toBeGreaterThanOrEqual(2)
  })
})

// ── TESTE 2: expandir + GABI valido ────────────────────────────────────────

describe('TESTE 2 — expandir editor e GABI valido', () => {
  it('clicar no pencil abre o rule editor e GABI mostra "REGRAS VALIDAS" (verde)', () => {
    render(<StatusProcesso />)

    expect(pegarGabiVisivel()).toBeNull()  // colapsado por default

    abrirEditorDoStatus(0)  // Rascunho

    const gabi = pegarGabiVisivel()
    expect(gabi).not.toBeNull()
    expect(gabi?.getAttribute('data-state')).toBe('ok')
    expect(within(gabi!).getByText(/REGRAS VÁLIDAS/i)).toBeDefined()
    expect(within(gabi!).getByText(/Clique em/i)).toBeDefined()
  })
})

// ── TESTE 3: incompatibilidade tipo×condicao ───────────────────────────────

describe('TESTE 3 — incompatibilidade tipo do campo × condicao', () => {
  it('trocar condicao do campo numero_processo (texto) para "maior_que" → GABI VERMELHO INVALIDO', () => {
    render(<StatusProcesso />)
    abrirEditorDoStatus(0)  // Rascunho com regra numero_processo + vazio

    const linha = screen.getAllByTestId(/^status-row-/)[0]
    const selects = linha.querySelectorAll<HTMLSelectElement>('.sp-regra select')
    expect(selects.length).toBe(3)

    // Troca condicao para "maior_que"
    fireEvent.change(selects[2], { target: { value: 'maior_que' } })

    const gabi = pegarGabiVisivel()
    expect(gabi?.getAttribute('data-state')).toBe('erro')
    expect(within(gabi!).getByText(/REGRA INVÁLIDA/i)).toBeDefined()
    // A mensagem de erro deve mencionar texto ou nao funciona
    const textoErro = gabi!.textContent ?? ''
    expect(textoErro.includes('texto') || textoErro.includes('não funciona')).toBe(true)
  })

  it('trocar pra "contem" no mesmo campo texto eh valido (texto aceita contem)', () => {
    render(<StatusProcesso />)
    abrirEditorDoStatus(0)
    const linha = screen.getAllByTestId(/^status-row-/)[0]
    const selects = linha.querySelectorAll<HTMLSelectElement>('.sp-regra select')

    fireEvent.change(selects[2], { target: { value: 'contem' } })
    // Precisa de valor — preenche
    const valor = linha.querySelector<HTMLInputElement>('.sp-regra-valor')
    fireEvent.change(valor!, { target: { value: 'IMP' } })

    const gabi = pegarGabiVisivel()
    expect(gabi?.getAttribute('data-state')).toBe('ok')
  })
})

// ── TESTE 4: valor de comparacao vazio ─────────────────────────────────────

describe('TESTE 4 — valor de comparacao ausente', () => {
  it('condicao "igual" sem valor preenchido → GABI mostra "valor de comparacao"', () => {
    render(<StatusProcesso />)
    abrirEditorDoStatus(0)

    const linha = screen.getAllByTestId(/^status-row-/)[0]
    const selects = linha.querySelectorAll<HTMLSelectElement>('.sp-regra select')

    fireEvent.change(selects[2], { target: { value: 'igual' } })
    // Nao preenche valor

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

// ── TESTE 5: conflito AND vazio+preenchido ─────────────────────────────────

describe('TESTE 5 — conflito vazio+preenchido no AND', () => {
  it('adicionar 2 regras opostas no mesmo campo (AND) → GABI VERMELHO conflito', () => {
    render(<StatusProcesso />)
    abrirEditorDoStatus(0)  // Rascunho default: AND, 1 regra (numero_processo + vazio)

    const linha = screen.getAllByTestId(/^status-row-/)[0]

    // Clica em "Adicionar regra" — a nova regra vem com numero_processo + preenchido
    const btnAddRegra = within(linha).getByText(/Adicionar regra/i)
    fireEvent.click(btnAddRegra)

    // Agora ha 2 regras conflitantes (mesmo campo, vazio + preenchido, modo AND)
    const regras = linha.querySelectorAll('.sp-regra')
    expect(regras.length).toBe(2)

    const gabi = pegarGabiVisivel()
    expect(gabi?.getAttribute('data-state')).toBe('erro')
    expect(gabi?.textContent).toMatch(/"vazio" E "preenchido"/i)
  })

  it('apos trocar operador pra OR, conflito desaparece (vazio OU preenchido eh ok)', () => {
    render(<StatusProcesso />)
    abrirEditorDoStatus(0)
    const linha = screen.getAllByTestId(/^status-row-/)[0]
    const btnAddRegra = within(linha).getByText(/Adicionar regra/i)
    fireEvent.click(btnAddRegra)

    // Conflito ativo
    expect(pegarGabiVisivel()?.getAttribute('data-state')).toBe('erro')

    // Troca pra OR
    const btnOR = within(linha).getByText(/OU \(qualquer uma\)/i)
    fireEvent.click(btnOR)

    expect(pegarGabiVisivel()?.getAttribute('data-state')).toBe('ok')
  })
})

// ── Extra: salvar dirty state ──────────────────────────────────────────────

describe('EXTRA — barra sticky de salvar', () => {
  it('alterar nome do status habilita barra "Alteracoes nao salvas" com Salvar + Restaurar', () => {
    render(<StatusProcesso />)

    // Estado limpo: sem barra
    expect(screen.queryByText(/Alterações não salvas/i)).toBeNull()

    // Edita nome do primeiro status
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    fireEvent.change(inputs[0], { target: { value: 'Rascunho EDITADO' } })

    // Barra aparece
    expect(screen.getByText(/Alterações não salvas/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Salvar/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Restaurar padrão/i })).toBeDefined()
  })
})
