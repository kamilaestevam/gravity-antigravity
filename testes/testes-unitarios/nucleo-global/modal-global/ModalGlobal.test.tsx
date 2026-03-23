/**
 * Testes unitários — ModalGlobal
 * Localização: testes/testes-unitarios/nucleo-global/modal-global/ModalGlobal.test.tsx
 *
 * Ferramentas: Vitest + @testing-library/react (jsdom)
 * Cobertura alvo: abertura/fechamento, ESC, overlay click, abas, footer, provider
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModalGlobal, ModalProvider } from '../../../../nucleo-global/modal-global/src/modal-overlay'
import { abrirModal, fecharModal, fecharTodosModais } from '../../../../nucleo-global/modal-global/src/modal-manager'
import { useModalLocal } from '../../../../nucleo-global/modal-global/src/use-modal'
import type { AbaModal } from '../../../../nucleo-global/modal-global/src/tipos'

// ─── Helper ────────────────────────────────────────────────────────────────────

function ModalTeste({
  onClose,
  ...props
}: Partial<React.ComponentProps<typeof ModalGlobal>> & { onClose?: () => void }) {
  return (
    <ModalGlobal
      aberto
      titulo="Modal de Teste"
      aoFechar={onClose ?? vi.fn()}
      {...props}
    >
      <p>Conteúdo do modal</p>
    </ModalGlobal>
  )
}

// ─── 1. Abertura e renderização básica ────────────────────────────────────────

describe('ModalGlobal — abertura e renderização', () => {
  it('renderiza o modal quando aberto=true', () => {
    render(<ModalTeste />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Modal de Teste')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument()
  })

  it('não renderiza quando aberto=false', () => {
    render(<ModalGlobal aberto={false} titulo="Oculto" aoFechar={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza subtítulo quando fornecido', () => {
    render(<ModalTeste subtitulo="Subtítulo aqui" />)
    expect(screen.getByText('Subtítulo aqui')).toBeInTheDocument()
  })

  it('dialog tem aria-modal e aria-labelledby corretos', () => {
    render(<ModalTeste />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')
  })
})

// ─── 2. Fechamento pelo botão X ───────────────────────────────────────────────

describe('ModalGlobal — fechar por botão X', () => {
  it('chama aoFechar ao clicar no botão X', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ModalTeste onClose={onClose} />)

    await user.click(screen.getByLabelText('Fechar modal'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('não exibe botão X quando semFechar=true', () => {
    render(<ModalTeste semFechar />)
    expect(screen.queryByLabelText('Fechar modal')).not.toBeInTheDocument()
  })
})

// ─── 3. Fechamento por ESC ─────────────────────────────────────────────────────

describe('ModalGlobal — fechar por ESC', () => {
  it('chama aoFechar ao pressionar ESC', async () => {
    const onClose = vi.fn()
    render(<ModalTeste onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('não chama aoFechar quando fecharPorESC=false', () => {
    const onClose = vi.fn()
    render(<ModalTeste onClose={onClose} fecharPorESC={false} />)

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('não chama aoFechar quando semFechar=true', () => {
    const onClose = vi.fn()
    render(<ModalTeste onClose={onClose} semFechar />)

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})

// ─── 4. Fechamento por overlay ────────────────────────────────────────────────

describe('ModalGlobal — fechar por overlay', () => {
  it('chama aoFechar ao clicar no overlay', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ModalTeste onClose={onClose} />)

    const overlay = document.querySelector('.mg-overlay') as HTMLElement
    await user.click(overlay)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('não chama aoFechar quando fecharAoClicarOverlay=false', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ModalTeste onClose={onClose} fecharAoClicarOverlay={false} />)

    const overlay = document.querySelector('.mg-overlay') as HTMLElement
    await user.click(overlay)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('não fecha ao clicar dentro do dialog', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ModalTeste onClose={onClose} />)

    await user.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })
})

// ─── 5. Abas ─────────────────────────────────────────────────────────────────────

describe('ModalGlobal — abas', () => {
  const ABAS: AbaModal[] = [
    { id: 'geral', rotulo: 'Geral', conteudo: <p>Conteúdo da aba Geral</p> },
    { id: 'avancado', rotulo: 'Avançado', conteudo: <p>Conteúdo da aba Avançado</p> },
    { id: 'permissoes', rotulo: 'Permissões', conteudo: <p>Conteúdo da aba Permissões</p> },
  ]

  it('renderiza todas as abas na navegação', () => {
    render(<ModalGlobal aberto titulo="Com abas" aoFechar={vi.fn()} abas={ABAS} />)
    expect(screen.getByText('Geral')).toBeInTheDocument()
    expect(screen.getByText('Avançado')).toBeInTheDocument()
    expect(screen.getByText('Permissões')).toBeInTheDocument()
  })

  it('exibe o conteúdo da primeira aba por padrão', () => {
    render(<ModalGlobal aberto titulo="Com abas" aoFechar={vi.fn()} abas={ABAS} />)
    expect(screen.getByText('Conteúdo da aba Geral')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo da aba Avançado')).not.toBeInTheDocument()
  })

  it('troca de aba ao clicar em outra aba', async () => {
    const user = userEvent.setup()
    render(<ModalGlobal aberto titulo="Com abas" aoFechar={vi.fn()} abas={ABAS} />)

    await user.click(screen.getByText('Avançado'))
    expect(screen.getByText('Conteúdo da aba Avançado')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo da aba Geral')).not.toBeInTheDocument()
  })

  it('aba ativa tem aria-selected=true', async () => {
    const user = userEvent.setup()
    render(<ModalGlobal aberto titulo="Com abas" aoFechar={vi.fn()} abas={ABAS} />)

    const abaAvancado = screen.getByRole('tab', { name: 'Avançado' })
    await user.click(abaAvancado)
    expect(abaAvancado).toHaveAttribute('aria-selected', 'true')
  })

  it('aba desabilitada não troca o conteúdo', async () => {
    const user = userEvent.setup()
    const abasComDesabilitada: AbaModal[] = [
      ...ABAS.slice(0, 2),
      { id: 'desabilitada', rotulo: 'Desabilitada', conteudo: <p>NÃO DEVE APARECER</p>, desabilitada: true },
    ]
    render(<ModalGlobal aberto titulo="Com abas" aoFechar={vi.fn()} abas={abasComDesabilitada} />)

    await user.click(screen.getByText('Desabilitada'))
    expect(screen.queryByText('NÃO DEVE APARECER')).not.toBeInTheDocument()
  })
})

// ─── 6. Botões de footer ──────────────────────────────────────────────────────

describe('ModalGlobal — botões de footer', () => {
  it('renderiza botões no footer', () => {
    const onSalvar = vi.fn()
    render(
      <ModalTeste
        botoes={[
          { rotulo: 'Cancelar', variante: 'ghost', ao_clicar: vi.fn() },
          { rotulo: 'Salvar', variante: 'primary', ao_clicar: onSalvar },
        ]}
      />
    )

    expect(screen.getByText('Cancelar')).toBeInTheDocument()
    expect(screen.getByText('Salvar')).toBeInTheDocument()
  })

  it('chama callback do botão ao clicar', async () => {
    const user = userEvent.setup()
    const onSalvar = vi.fn()
    render(
      <ModalTeste botoes={[{ rotulo: 'OK', ao_clicar: onSalvar }]} />
    )

    await user.click(screen.getByText('OK'))
    expect(onSalvar).toHaveBeenCalledOnce()
  })

  it('botão desabilitado não chama callback', async () => {
    const user = userEvent.setup()
    const onClicar = vi.fn()
    render(
      <ModalTeste
        botoes={[{ rotulo: 'Bloqueado', ao_clicar: onClicar, desabilitado: true }]}
      />
    )

    await user.click(screen.getByText('Bloqueado'))
    expect(onClicar).not.toHaveBeenCalled()
  })
})

// ─── 7. Tamanhos ─────────────────────────────────────────────────────────────────

describe('ModalGlobal — tamanhos', () => {
  it.each(['sm', 'md', 'lg', 'xl', 'full'] as const)(
    'aplica max-width correto para tamanho %s',
    (tamanho) => {
      render(<ModalTeste tamanho={tamanho} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog.style.maxWidth).toBeTruthy()
    }
  )
})

// ─── 8. Modal Manager e ModalProvider ────────────────────────────────────────

describe('ModalProvider e modal-manager', () => {
  beforeEach(() => {
    act(() => {
      fecharTodosModais()
    })
  })

  it('ModalProvider não renderiza nada quando stack está vazio', () => {
    render(<ModalProvider />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('abrirModal + ModalProvider renderiza o modal', async () => {
    render(<ModalProvider />)

    act(() => {
      abrirModal('teste-provider', { titulo: 'Provider Modal', children: <p>Conteúdo via manager</p> })
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(screen.getByText('Provider Modal')).toBeInTheDocument()
  })

  it('fecharModal remove o modal do stack', async () => {
    render(<ModalProvider />)
    act(() => {
      abrirModal('para-fechar', { titulo: 'Fechar via manager' })
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    act(() => {
      fecharModal('para-fechar')
    })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('não empilha o mesmo id duas vezes', async () => {
    render(<ModalProvider />)
    act(() => {
      abrirModal('duplicado', { titulo: 'Modal 1' })
      abrirModal('duplicado', { titulo: 'Modal 1 duplicado' })
    })

    // Deve haver apenas 1 dialog
    await waitFor(() => {
      expect(screen.getAllByRole('dialog').length).toBe(1)
    })
  })
})

// ─── 9. useModalLocal ─────────────────────────────────────────────────────────

describe('useModalLocal', () => {
  function ComponenteComModal() {
    const { aberto, abrir, fechar } = useModalLocal()
    return (
      <>
        <button onClick={abrir}>Abrir</button>
        <ModalGlobal aberto={aberto} aoFechar={fechar} titulo="Local Modal">
          <p>Conteúdo local</p>
        </ModalGlobal>
      </>
    )
  }

  it('inicia fechado e abre ao clicar', async () => {
    const user = userEvent.setup()
    render(<ComponenteComModal />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await act(async () => {
      await user.click(screen.getByText('Abrir'))
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('fecha ao clicar no botão X', async () => {
    const user = userEvent.setup()
    render(<ComponenteComModal />)

    await act(async () => {
      await user.click(screen.getByText('Abrir'))
    })
    await act(async () => {
      await user.click(screen.getByLabelText('Fechar modal'))
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

// ─── 10. Scroll lock ──────────────────────────────────────────────────────────

describe('ModalGlobal — scroll lock', () => {
  it('trava o scroll do body enquanto aberto', () => {
    render(<ModalTeste />)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restaura o scroll do body após fechar', () => {
    const { rerender } = render(<ModalTeste />)
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<ModalGlobal aberto={false} titulo="Fechado" aoFechar={vi.fn()} />)
    expect(document.body.style.overflow).toBe('')
  })
})
