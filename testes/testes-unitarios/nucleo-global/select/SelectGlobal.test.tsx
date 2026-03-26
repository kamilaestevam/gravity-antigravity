/**
 * Testes unitários — SelectGlobal
 * Localização: testes/testes-unitarios/nucleo-global/select/SelectGlobal.test.tsx
 *
 * Ferramentas: Vitest + @testing-library/react (jsdom)
 * Cobertura alvo: abertura, seleção, busca, multi-select, chips, grupos, acessibilidade
 * Regra crítica: nunca deve usar <select> nativo do HTML
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectGlobal } from '../../../../nucleo-global/select/src/campo-select-global'
import type { SelectOpcao, SelectGrupo } from '../../../../nucleo-global/select/src/tipos'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const OPCOES: SelectOpcao[] = [
  { valor: 'sp', rotulo: 'São Paulo', descricao: 'Maior cidade do Brasil' },
  { valor: 'rj', rotulo: 'Rio de Janeiro' },
  { valor: 'bh', rotulo: 'Belo Horizonte' },
  { valor: 'poa', rotulo: 'Porto Alegre' },
  { valor: 'rec', rotulo: 'Recife' },
]

const GRUPOS: SelectGrupo[] = [
  {
    rotulo: 'Sudeste',
    opcoes: [
      { valor: 'sp', rotulo: 'São Paulo' },
      { valor: 'rj', rotulo: 'Rio de Janeiro' },
      { valor: 'bh', rotulo: 'Belo Horizonte' },
    ],
  },
  {
    rotulo: 'Sul',
    opcoes: [
      { valor: 'poa', rotulo: 'Porto Alegre' },
      { valor: 'cwb', rotulo: 'Curitiba' },
    ],
  },
]

// ─── REGRA CRÍTICA — Ausência de <select> nativo ─────────────────────────────

describe('SelectGlobal — REGRA CRÍTICA: sem <select> nativo', () => {
  it('não renderiza elemento <select> nativo no DOM', () => {
    render(<SelectGlobal opcoes={OPCOES} />)
    expect(document.querySelectorAll('select').length).toBe(0)
  })

  it('usa role=combobox no campo gatilho', () => {
    render(<SelectGlobal opcoes={OPCOES} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('usa role=listbox na lista de opções quando aberta', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('cada opção tem role=option', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} />)

    await user.click(screen.getByRole('combobox'))
    const options = screen.getAllByRole('option')
    expect(options.length).toBe(OPCOES.length)
  })
})

// ─── 1. Renderização inicial ──────────────────────────────────────────────────

describe('SelectGlobal — renderização inicial', () => {
  it('exibe placeholder quando nenhum valor selecionado', () => {
    render(<SelectGlobal opcoes={OPCOES} placeholder="Escolha uma cidade" />)
    expect(screen.getByText('Escolha uma cidade')).toBeInTheDocument()
  })

  it('exibe label quando fornecida', () => {
    render(<SelectGlobal opcoes={OPCOES} label="Cidade" />)
    expect(screen.getByText('Cidade')).toBeInTheDocument()
  })

  it('exibe hint quando fornecido e sem erro', () => {
    render(<SelectGlobal opcoes={OPCOES} hint="Selecione sua cidade principal" />)
    expect(screen.getByText('Selecione sua cidade principal')).toBeInTheDocument()
  })

  it('exibe mensagem de erro quando erro fornecido', () => {
    render(<SelectGlobal opcoes={OPCOES} erro="Campo obrigatório" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Campo obrigatório')
  })

  it('exibe valor selecionado no gatilho em modo controlado', () => {
    render(<SelectGlobal opcoes={OPCOES} valor="sp" aoMudarValor={vi.fn()} />)
    expect(screen.getByText('São Paulo')).toBeInTheDocument()
  })

  it('exibe asterisco quando obrigatorio=true', () => {
    render(<SelectGlobal opcoes={OPCOES} label="Cidade" obrigatorio />)
    expect(document.querySelector('.sg-obrigatorio')).toBeInTheDocument()
  })
})

// ─── 2. Abertura e fechamento do dropdown ─────────────────────────────────────

describe('SelectGlobal — abertura e fechamento', () => {
  it('abre o dropdown ao clicar no combobox', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} />)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('fecha o dropdown ao clicar fora', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <SelectGlobal opcoes={OPCOES} />
        <span>Fora do select</span>
      </div>
    )

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByText('Fora do select'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('fecha o dropdown ao pressionar ESC', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('não abre quando desabilitado', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} desabilitado />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('combobox tem aria-expanded=false quando fechado', () => {
    render(<SelectGlobal opcoes={OPCOES} />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })

  it('combobox tem aria-expanded=true quando aberto', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
  })
})

// ─── 3. Seleção de opção (single) ────────────────────────────────────────────

describe('SelectGlobal — seleção single', () => {
  it('chama aoMudarValor ao selecionar uma opção', async () => {
    const user = userEvent.setup()
    const aoMudarValor = vi.fn()
    render(<SelectGlobal opcoes={OPCOES} aoMudarValor={aoMudarValor} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: /São Paulo/ }))

    expect(aoMudarValor).toHaveBeenCalledOnce()
    expect(aoMudarValor).toHaveBeenCalledWith('sp')
  })

  it('fecha o dropdown após seleção single', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} aoMudarValor={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: /Rio de Janeiro/ }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opção selecionada tem aria-selected=true', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} valor="sp" aoMudarValor={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    const opcaoSP = screen.getByRole('option', { name: /São Paulo/ })
    expect(opcaoSP).toHaveAttribute('aria-selected', 'true')
  })

  it('deseleciona ao clicar na mesma opção (chama aoMudarValor com null)', async () => {
    const user = userEvent.setup()
    const aoMudarValor = vi.fn()
    render(<SelectGlobal opcoes={OPCOES} valor="sp" aoMudarValor={aoMudarValor} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: /São Paulo/ }))

    expect(aoMudarValor).toHaveBeenCalledWith(null)
  })

  it('botão de limpar chama aoMudarValor com null', async () => {
    const user = userEvent.setup()
    const aoMudarValor = vi.fn()
    render(<SelectGlobal opcoes={OPCOES} valor="rj" aoMudarValor={aoMudarValor} />)

    await user.click(screen.getByLabelText('Limpar seleção'))
    expect(aoMudarValor).toHaveBeenCalledWith(null)
  })

  it('não exibe botão de limpar quando nenhum valor selecionado', () => {
    render(<SelectGlobal opcoes={OPCOES} />)
    expect(screen.queryByLabelText('Limpar seleção')).not.toBeInTheDocument()
  })
})

// ─── 4. Multi-select ──────────────────────────────────────────────────────────

describe('SelectGlobal — multi-select', () => {
  it('keepsa dropdown aberto após seleção multiple', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} multiplo aoMudarValores={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: /São Paulo/ }))

    // Dropdown permanece aberto
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('chama aoMudarValores com array após múltiplas seleções', async () => {
    const user = userEvent.setup()
    const aoMudarValores = vi.fn()
    render(<SelectGlobal opcoes={OPCOES} multiplo valores={['sp']} aoMudarValores={aoMudarValores} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: /Rio de Janeiro/ }))

    expect(aoMudarValores).toHaveBeenCalledWith(['sp', 'rj'])
  })

  it('exibe chips para cada valor selecionado', () => {
    render(<SelectGlobal opcoes={OPCOES} multiplo valores={['sp', 'rj']} aoMudarValores={vi.fn()} />)
    expect(document.querySelectorAll('.sg-chip').length).toBe(2)
    expect(screen.getByText('São Paulo')).toBeInTheDocument()
    expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument()
  })

  it('remove chip ao clicar no X do chip', async () => {
    const user = userEvent.setup()
    const aoMudarValores = vi.fn()
    render(<SelectGlobal opcoes={OPCOES} multiplo valores={['sp', 'rj']} aoMudarValores={aoMudarValores} />)

    await user.click(screen.getByLabelText('Remover São Paulo'))
    expect(aoMudarValores).toHaveBeenCalledWith(['rj'])
  })

  it('botão limpar chama aoMudarValores com array vazio', async () => {
    const user = userEvent.setup()
    const aoMudarValores = vi.fn()
    render(<SelectGlobal opcoes={OPCOES} multiplo valores={['sp', 'rj', 'bh']} aoMudarValores={aoMudarValores} />)

    await user.click(screen.getByLabelText('Limpar seleção'))
    expect(aoMudarValores).toHaveBeenCalledWith([])
  })

  it('listbox tem aria-multiselectable=true em modo múltiplo', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} multiplo />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
  })
})

// ─── 5. Busca interna ──────────────────────────────────────────────────────────

describe('SelectGlobal — busca interna', () => {
  it('exibe campo de busca quando buscavel=true', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} buscavel />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
  })

  it('filtra opções ao digitar na busca', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} buscavel />)

    await user.click(screen.getByRole('combobox'))
    const busca = screen.getByPlaceholderText('Buscar...')
    await user.type(busca, 'paulo')

    const options = screen.getAllByRole('option')
    expect(options.length).toBe(1)
    expect(options[0]).toHaveTextContent('São Paulo')
  })

  it('exibe mensagem de não encontrado quando busca não retorna resultados', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} buscavel />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Buscar...'), 'zzz-nao-existe')

    expect(screen.getByText('Nenhuma opção encontrada')).toBeInTheDocument()
  })

  it('busca é case-insensitive', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} buscavel />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Buscar...'), 'PAULO')

    expect(screen.getAllByRole('option').length).toBe(1)
  })

  it('filtra pela descrição também', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} buscavel />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Buscar...'), 'Maior cidade')

    const options = screen.getAllByRole('option')
    expect(options.length).toBe(1)
    expect(options[0]).toHaveTextContent('São Paulo')
  })

  it('não exibe campo de busca quando buscavel=false', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} buscavel={false} />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.queryByPlaceholderText('Buscar...')).not.toBeInTheDocument()
  })
})

// ─── 6. Grupos de opções ──────────────────────────────────────────────────────

describe('SelectGlobal — grupos', () => {
  it('exibe rótulos de grupos', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal grupos={GRUPOS} />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByText('Sudeste')).toBeInTheDocument()
    expect(screen.getByText('Sul')).toBeInTheDocument()
  })

  it('exibe opções de todos os grupos', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal grupos={GRUPOS} />)

    await user.click(screen.getByRole('combobox'))
    const totalOpcoes = GRUPOS.reduce((sum, g) => sum + g.opcoes.length, 0)
    expect(screen.getAllByRole('option').length).toBe(totalOpcoes)
  })

  it('filtra opções dentro dos grupos pela busca', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal grupos={GRUPOS} buscavel />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Buscar...'), 'Curitiba')

    // Apenas o grupo Sul deve aparecer com Curitiba
    expect(screen.getByText('Sul')).toBeInTheDocument()
    expect(screen.queryByText('Sudeste')).not.toBeInTheDocument()
  })
})

// ─── 7. Opções desabilitadas ──────────────────────────────────────────────────

describe('SelectGlobal — opções desabilitadas', () => {
  const opcoesComDesabilitada: SelectOpcao[] = [
    { valor: 'sp', rotulo: 'São Paulo' },
    { valor: 'rj', rotulo: 'Rio de Janeiro', desabilitada: true },
  ]

  it('opção desabilitada tem aria-disabled=true', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={opcoesComDesabilitada} />)

    await user.click(screen.getByRole('combobox'))
    const opcaoRJ = screen.getByRole('option', { name: /Rio de Janeiro/ })
    expect(opcaoRJ).toHaveAttribute('aria-disabled', 'true')
  })

  it('não chama aoMudarValor ao clicar em opção desabilitada', async () => {
    const user = userEvent.setup()
    const aoMudarValor = vi.fn()
    render(<SelectGlobal opcoes={opcoesComDesabilitada} aoMudarValor={aoMudarValor} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: /Rio de Janeiro/ }))

    expect(aoMudarValor).not.toHaveBeenCalled()
  })
})

// ─── 8. Estado de carregamento ────────────────────────────────────────────────

describe('SelectGlobal — estado de carregamento', () => {
  it('exibe texto de carregamento', () => {
    render(<SelectGlobal opcoes={OPCOES} carregando />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('não abre dropdown quando carregando', async () => {
    const user = userEvent.setup()
    render(<SelectGlobal opcoes={OPCOES} carregando />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})

// ─── 9. Renderizador customizado ──────────────────────────────────────────────

describe('SelectGlobal — renderizadores customizados', () => {
  it('usa renderizarOpcao customizado na lista', async () => {
    const user = userEvent.setup()
    render(
      <SelectGlobal
        opcoes={OPCOES}
        renderizarOpcao={(op) => (
          <span data-testid={`option-custom-${op.valor}`}>🏙️ {op.rotulo}</span>
        )}
      />
    )

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByTestId('option-custom-sp')).toBeInTheDocument()
    expect(screen.getByTestId('option-custom-sp').textContent).toContain('🏙️ São Paulo')
  })
})

// ─── 10. Integração com formulário (hidden inputs) ────────────────────────────

describe('SelectGlobal — integração com form', () => {
  it('cria input hidden quando name é fornecido (single)', () => {
    render(<SelectGlobal opcoes={OPCOES} name="cidade" valor="sp" aoMudarValor={vi.fn()} />)
    const hidden = document.querySelector('input[type="hidden"][name="cidade"]') as HTMLInputElement
    expect(hidden).toBeInTheDocument()
    expect(hidden.value).toBe('sp')
  })

  it('cria múltiplos inputs hidden para multi-select', () => {
    render(
      <SelectGlobal
        opcoes={OPCOES}
        name="cidades"
        multiplo
        valores={['sp', 'rj']}
        aoMudarValores={vi.fn()}
      />
    )
    const hiddens = document.querySelectorAll('input[type="hidden"][name="cidades"]')
    expect(hiddens.length).toBe(2)
  })
})
