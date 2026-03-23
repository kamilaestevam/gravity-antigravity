/**
 * Testes unitários — TabelaGlobal
 * Localização: testes/testes-unitarios/nucleo-global/tabela-global/TabelaGlobal.test.tsx
 *
 * Ferramentas: Vitest + @testing-library/react (jsdom)
 * Cobertura alvo: renderização de colunas, filtragem, paginação, exportação, seleção, ações
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabelaGlobal } from '../../../../nucleo-global/tabela-global/src/tabela'
import type { Coluna, RegistroTabela } from '../../../../nucleo-global/tabela-global/src/tipos'

// ─── Fixtures ────────────────────────────────────────────────────────────────

interface Produto extends RegistroTabela {
  id: number
  nome: string
  preco: number
  status: 'ativo' | 'inativo'
  criado_em: string
}

const COLUNAS: Coluna<Produto>[] = [
  { key: 'nome', label: 'Nome', ordenavel: true, filtravel: true },
  { key: 'preco', label: 'Preço', tipo: 'currency', alinhamento: 'right' },
  {
    key: 'status',
    label: 'Status',
    tipo: 'badge',
    badgeConfig: { mapaClasses: { ativo: 'success', inativo: 'danger' } },
  },
  { key: 'criado_em', label: 'Criado em', tipo: 'date' },
]

function makeProdutos(count: number): Produto[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    nome: `Produto ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    preco: (i + 1) * 100.5,
    status: i % 2 === 0 ? 'ativo' : 'inativo',
    criado_em: '2024-03-15T00:00:00.000Z',
  }))
}

// ─── 1. Renderização de colunas ────────────────────────────────────────────────

describe('TabelaGlobal — renderização de colunas', () => {
  it('exibe os cabeçalhos de todas as colunas', () => {
    render(<TabelaGlobal colunas={COLUNAS} dados={makeProdutos(3)} />)

    expect(screen.getByText('Nome')).toBeInTheDocument()
    expect(screen.getByText('Preço')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Criado em')).toBeInTheDocument()
  })

  it('renderiza o conteúdo das células', () => {
    const dados = makeProdutos(2)
    render(<TabelaGlobal colunas={COLUNAS} dados={dados} />)

    expect(screen.getByText(dados[0].nome)).toBeInTheDocument()
    expect(screen.getByText(dados[1].nome)).toBeInTheDocument()
  })

  it('exibe mensagem de vazio quando não há dados', () => {
    render(<TabelaGlobal colunas={COLUNAS} dados={[]} mensagemVazia="Sem registros" />)
    expect(screen.getByText('Sem registros')).toBeInTheDocument()
  })

  it('exibe skeleton de carregamento quando carregando=true', () => {
    render(<TabelaGlobal colunas={COLUNAS} dados={[]} carregando />)
    const skeletons = document.querySelectorAll('.tg-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renderiza coluna com renderizador customizado', () => {
    const colunasCustom: Coluna<Produto>[] = [
      { key: 'nome', label: 'Nome', renderizar: (v) => <strong data-testid="custom-cell">{String(v)}-custom</strong> },
    ]
    render(<TabelaGlobal colunas={colunasCustom} dados={makeProdutos(1)} />)
    expect(screen.getByTestId('custom-cell').textContent).toMatch(/-custom$/)
  })

  it('oculta coluna marcada como oculta', () => {
    const colunasComOculta: Coluna<Produto>[] = [
      ...COLUNAS,
      { key: 'preco', label: 'COLUNA OCULTA', oculta: true },
    ]
    render(<TabelaGlobal colunas={colunasComOculta} dados={makeProdutos(1)} />)
    expect(screen.queryByText('COLUNA OCULTA')).not.toBeInTheDocument()
  })
})

// ─── 2. Filtros e busca ─────────────────────────────────────────────────────────

describe('TabelaGlobal — filtros e busca global', () => {
  it('filtra registros pela busca global', async () => {
    const user = userEvent.setup()
    const dados = makeProdutos(10)
    render(<TabelaGlobal colunas={COLUNAS} dados={dados} buscaGlobal />)

    const input = screen.getByRole('searchbox')
    await user.type(input, dados[0].nome)

    expect(screen.getByText(dados[0].nome)).toBeInTheDocument()
    // Os outros nomes não devem estar visíveis (paginados para fora ou filtrados)
    expect(screen.queryByText(dados[9].nome)).not.toBeInTheDocument()
  })

  it('exibe mensagem de vazio quando busca não encontra resultado', async () => {
    const user = userEvent.setup()
    render(<TabelaGlobal colunas={COLUNAS} dados={makeProdutos(5)} mensagemVazia="Nada encontrado" />)

    const input = screen.getByRole('searchbox')
    await user.type(input, 'zzz-nao-existe-999')

    expect(screen.getByText('Nada encontrado')).toBeInTheDocument()
  })

  it('filtra por filtro do tipo select', async () => {
    const user = userEvent.setup()
    const dados = makeProdutos(10)
    render(
      <TabelaGlobal
        colunas={COLUNAS}
        dados={dados}
        filtros={[{
          key: 'status',
          tipo: 'select',
          rotulo: 'Status',
          opcoes: [
            { valor: 'ativo', rotulo: 'Ativo' },
            { valor: 'inativo', rotulo: 'Inativo' },
          ],
        }]}
      />
    )

    // Abre painel de filtros
    await user.click(screen.getByText(/filtros/i))
    const selectStatus = screen.getByLabelText('Status') as HTMLSelectElement
    await user.selectOptions(selectStatus, 'inativo')

    // Todos os registros visíveis devem ser inativos
    const badgesDanger = document.querySelectorAll('.badge-danger')
    expect(badgesDanger.length).toBeGreaterThan(0)
    expect(document.querySelectorAll('.badge-success').length).toBe(0)
  })

  it('botão "Limpar filtros" reseta o estado', async () => {
    const user = userEvent.setup()
    render(
      <TabelaGlobal
        colunas={COLUNAS}
        dados={makeProdutos(10)}
        filtros={[{ key: 'nome', tipo: 'texto', rotulo: 'Nome' }]}
      />
    )

    await user.click(screen.getByText(/filtros/i))
    const input = screen.getByLabelText('Nome') as HTMLInputElement
    await user.type(input, 'zzz-nao-existe')

    expect(screen.getByText('Nenhum registro encontrado.')).toBeInTheDocument()

    await user.click(screen.getByText('Limpar filtros'))
    expect(screen.queryByText('Nenhum registro encontrado.')).not.toBeInTheDocument()
  })
})

// ─── 3. Paginação ───────────────────────────────────────────────────────────────

describe('TabelaGlobal — paginação', () => {
  const TOTAL = 35
  const POR_PAGINA = 10

  it('exibe informação correta de registros na primeira página', () => {
    render(<TabelaGlobal colunas={COLUNAS} dados={makeProdutos(TOTAL)} itensPorPagina={POR_PAGINA} />)
    expect(screen.getByText(`1–${POR_PAGINA} de ${TOTAL}`)).toBeInTheDocument()
  })

  it('navega para a próxima página', async () => {
    const user = userEvent.setup()
    render(<TabelaGlobal colunas={COLUNAS} dados={makeProdutos(TOTAL)} itensPorPagina={POR_PAGINA} />)

    await user.click(screen.getByLabelText('Próxima página'))

    expect(screen.getByText(`${POR_PAGINA + 1}–${POR_PAGINA * 2} de ${TOTAL}`)).toBeInTheDocument()
  })

  it('navega para a última página', async () => {
    const user = userEvent.setup()
    render(<TabelaGlobal colunas={COLUNAS} dados={makeProdutos(TOTAL)} itensPorPagina={POR_PAGINA} />)

    await user.click(screen.getByLabelText('Última página'))

    expect(screen.getByText(`31–${TOTAL} de ${TOTAL}`)).toBeInTheDocument()
  })

  it('botão de próxima página fica desabilitado na última', async () => {
    const user = userEvent.setup()
    render(<TabelaGlobal colunas={COLUNAS} dados={makeProdutos(POR_PAGINA)} itensPorPagina={POR_PAGINA} />)

    expect(screen.getByLabelText('Próxima página')).toBeDisabled()
  })

  it('botão de anterior fica desabilitado na primeira página', () => {
    render(<TabelaGlobal colunas={COLUNAS} dados={makeProdutos(TOTAL)} itensPorPagina={POR_PAGINA} />)
    expect(screen.getByLabelText('Página anterior')).toBeDisabled()
  })

  it('reseta para página 1 após busca', async () => {
    const user = userEvent.setup()
    render(<TabelaGlobal colunas={COLUNAS} dados={makeProdutos(TOTAL)} itensPorPagina={POR_PAGINA} />)

    await user.click(screen.getByLabelText('Próxima página'))
    expect(screen.getByText('2 / 4')).toBeInTheDocument()

    const input = screen.getByRole('searchbox')
    await user.type(input, 'Produto')
    expect(screen.getByText(/1 \//)).toBeInTheDocument()
  })
})

// ─── 4. Ordenação ────────────────────────────────────────────────────────────────

describe('TabelaGlobal — ordenação', () => {
  it('ordena coluna em ASC ao clicar no cabeçalho', async () => {
    const user = userEvent.setup()
    const dados: Produto[] = [
      { id: 1, nome: 'Zebra', preco: 10, status: 'ativo', criado_em: '' },
      { id: 2, nome: 'Abacaxi', preco: 20, status: 'ativo', criado_em: '' },
      { id: 3, nome: 'Mango', preco: 30, status: 'ativo', criado_em: '' },
    ]
    render(<TabelaGlobal colunas={COLUNAS} dados={dados} />)

    const headerNome = screen.getByText('Nome')
    await user.click(headerNome)

    const rows = screen.getAllByRole('row').slice(1) // excluir thead
    expect(within(rows[0]).getByText('Abacaxi')).toBeInTheDocument()
    expect(within(rows[2]).getByText('Zebra')).toBeInTheDocument()
  })

  it('inverte para DESC ao clicar novamente no mesmo cabeçalho', async () => {
    const user = userEvent.setup()
    const dados: Produto[] = [
      { id: 1, nome: 'Zebra', preco: 10, status: 'ativo', criado_em: '' },
      { id: 2, nome: 'Abacaxi', preco: 20, status: 'ativo', criado_em: '' },
    ]
    render(<TabelaGlobal colunas={COLUNAS} dados={dados} />)

    const headerNome = screen.getByText('Nome')
    await user.click(headerNome) // ASC
    await user.click(headerNome) // DESC

    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[0]).getByText('Zebra')).toBeInTheDocument()
  })
})

// ─── 5. Seleção em massa ───────────────────────────────────────────────────────

describe('TabelaGlobal — seleção', () => {
  it('habilita checkboxes quando selecao=true', () => {
    render(<TabelaGlobal colunas={COLUNAS} dados={makeProdutos(3)} selecao />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(1) // select-all + linhas
  })

  it('chama aoMudarSelecao ao selecionar linha', async () => {
    const user = userEvent.setup()
    const aoMudarSelecao = vi.fn()
    render(
      <TabelaGlobal
        colunas={COLUNAS}
        dados={makeProdutos(3)}
        selecao
        aoMudarSelecao={aoMudarSelecao}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // primeiro checkbox de linha (index 0 = select-all)

    expect(aoMudarSelecao).toHaveBeenCalledOnce()
    expect(aoMudarSelecao).toHaveBeenCalledWith([1])
  })

  it('select-all seleciona todos os registros filtrados', async () => {
    const user = userEvent.setup()
    const aoMudarSelecao = vi.fn()
    const dados = makeProdutos(3)
    render(
      <TabelaGlobal
        colunas={COLUNAS}
        dados={dados}
        selecao
        aoMudarSelecao={aoMudarSelecao}
      />
    )

    const checkboxSelectAll = screen.getAllByRole('checkbox')[0]
    await user.click(checkboxSelectAll)

    expect(aoMudarSelecao).toHaveBeenCalledWith([1, 2, 3])
  })

  it('exibe contador de selecionados', async () => {
    const user = userEvent.setup()
    render(<TabelaGlobal colunas={COLUNAS} dados={makeProdutos(5)} selecao />)

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1])
    await user.click(checkboxes[2])

    expect(screen.getByText('2 selecionados')).toBeInTheDocument()
  })
})

// ─── 6. Ações de linha ──────────────────────────────────────────────────────────

describe('TabelaGlobal — ações de linha', () => {
  it('exibe botão de ação e chama callback ao clicar', async () => {
    const user = userEvent.setup()
    const onEditar = vi.fn()
    const dados = makeProdutos(1)

    render(
      <TabelaGlobal
        colunas={COLUNAS}
        dados={dados}
        acoesLinha={[
          { id: 'editar', rotulo: 'Editar', ao_clicar: onEditar },
        ]}
      />
    )

    await user.click(screen.getByLabelText('Editar'))
    expect(onEditar).toHaveBeenCalledWith(dados[0])
  })

  it('oculta ação quando mostrar retorna false', () => {
    const dados = makeProdutos(1)
    render(
      <TabelaGlobal
        colunas={COLUNAS}
        dados={dados}
        acoesLinha={[
          { id: 'deletar', rotulo: 'Deletar', mostrar: () => false, ao_clicar: vi.fn() },
        ]}
      />
    )

    expect(screen.queryByLabelText('Deletar')).not.toBeInTheDocument()
  })
})

// ─── 7. Exportação ──────────────────────────────────────────────────────────────

describe('TabelaGlobal — exportação', () => {
  beforeEach(() => {
    // Mock somente do URL — suficiente para testar CSV/JSON export
    // Não mockamos document.createElement pois corrompe event listeners do jsdom
    vi.spyOn(global.URL, 'createObjectURL').mockReturnValue('blob:mock')
    vi.spyOn(global.URL, 'revokeObjectURL').mockImplementation(() => {})
    // Mock do click no anchor via prototype para evitar navegação real
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exibe botão CSV quando exportConfig tem csv', () => {
    render(
      <TabelaGlobal
        colunas={COLUNAS}
        dados={makeProdutos(2)}
        exportConfig={{ formatos: ['csv', 'json'] }}
      />
    )

    expect(screen.getByLabelText('Exportar CSV')).toBeInTheDocument()
    expect(screen.getByLabelText('Exportar JSON')).toBeInTheDocument()
  })

  it('cria Blob ao clicar em exportar CSV', async () => {
    const user = userEvent.setup()
    const blobSpy = vi.spyOn(globalThis, 'Blob')

    render(
      <TabelaGlobal
        colunas={COLUNAS}
        dados={makeProdutos(2)}
        exportConfig={{ formatos: ['csv'], nomeArquivo: 'produtos' }}
      />
    )

    await user.click(screen.getByLabelText('Exportar CSV'))
    expect(blobSpy).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining('Nome')]),
      expect.objectContaining({ type: expect.stringContaining('csv') })
    )
  })
})

// ─── 8. Acessibilidade ─────────────────────────────────────────────────────────

describe('TabelaGlobal — acessibilidade', () => {
  it('table tem role=region com aria-label', () => {
    render(<TabelaGlobal colunas={COLUNAS} dados={makeProdutos(2)} />)
    expect(screen.getByRole('region', { name: 'Tabela de dados' })).toBeInTheDocument()
  })

  it('tabela está aria-busy=true quando carregando', () => {
    render(<TabelaGlobal colunas={COLUNAS} dados={[]} carregando />)
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
  })

  it('campo de busca tem aria-label correto', () => {
    render(<TabelaGlobal colunas={COLUNAS} dados={[]} buscaPlaceholder="Buscar produto" />)
    expect(screen.getByRole('searchbox', { name: 'Buscar produto' })).toBeInTheDocument()
  })
})
