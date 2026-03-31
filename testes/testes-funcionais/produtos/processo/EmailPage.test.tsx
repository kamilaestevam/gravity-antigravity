/**
 * Testes funcionais — EmailPage (Produto Processo)
 * Localização: testes/testes-funcionais/produtos/processo/EmailPage.test.tsx
 *
 * Ferramentas: Vitest + @testing-library/react (jsdom)
 * Cobertura: layout 2-panel, busca, filtros de categoria, seleção de email,
 *            painel de detalhe, ações (responder/encaminhar/vincular),
 *            navegação por teclado, acessibilidade ARIA.
 */

// @vitest-environment jsdom

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import EmailPage from '../../../../produto/processo/client/src/pages/email/EmailPage'

// Reset shell store before each test
import { useShellStore } from '../../../../testes/testes-unitarios/produtos/processo/__mocks__/shell'

beforeEach(() => {
  useShellStore.setState({
    notifications: [],
    sidebarOpen: true,
    currentTheme: 'dark',
    tooltipsDisabled: false,
    currentUser: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
  })
})

// ─── Helpers ──────────────────────────────────────────────────────────────

function renderPage() {
  return render(<EmailPage />)
}

function getEmailListItems() {
  return screen.getAllByRole('option')
}

function getSearchInput() {
  return screen.getByPlaceholderText('Buscar por assunto ou remetente...')
}

function getCategoryPills() {
  return screen.getAllByRole('tab')
}

function clickCategoryPill(label: string) {
  const pill = screen.getByRole('tab', { name: label })
  fireEvent.click(pill)
}

function getNotifications() {
  return useShellStore.getState().notifications
}

// ─── 1. Renderização Básica ──────────────────────────────────────────────

describe('EmailPage — Renderização básica', () => {
  it('1. renderiza o título "E-mail" na página', () => {
    renderPage()
    expect(screen.getByText('E-mail')).toBeInTheDocument()
  })

  it('2. renderiza o campo de busca com placeholder correto', () => {
    renderPage()
    const input = getSearchInput()
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('3. renderiza todas as pills de categoria (Todos + 5 categorias)', () => {
    renderPage()
    const pills = getCategoryPills()
    expect(pills).toHaveLength(6)
    expect(screen.getByRole('tab', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Financeiro' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Operacional' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Documental' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Cliente' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Geral' })).toBeInTheDocument()
  })

  it('4. renderiza todos os 4 emails na lista', () => {
    renderPage()
    const items = getEmailListItems()
    expect(items).toHaveLength(4)
  })

  it('5. o primeiro email é selecionado por padrão', () => {
    renderPage()
    const items = getEmailListItems()
    expect(items[0]).toHaveAttribute('aria-selected', 'true')
    expect(items[1]).toHaveAttribute('aria-selected', 'false')
  })
})

// ─── 2. Lista de Emails — Conteúdo ──────────────────────────────────────

describe('EmailPage — Lista de emails', () => {
  it('6. mostra o nome do remetente de cada email', () => {
    renderPage()
    const items = getEmailListItems()
    expect(within(items[0]).getByText('Carlos Silva')).toBeInTheDocument()
    expect(within(items[1]).getByText('Agente Portuário')).toBeInTheDocument()
    expect(within(items[2]).getByText('Despachante')).toBeInTheDocument()
    expect(within(items[3]).getByText('Cliente')).toBeInTheDocument()
  })

  it('7. mostra o assunto de cada email', () => {
    renderPage()
    const items = getEmailListItems()
    expect(within(items[0]).getByText('Invoice Proforma - PO 2024/001')).toBeInTheDocument()
    expect(within(items[1]).getByText('Previsão de Chegada - Container MSKU1234567')).toBeInTheDocument()
    expect(within(items[2]).getByText('DI Registrada - Processo 2024/0150')).toBeInTheDocument()
    expect(within(items[3]).getByText('RE: Atualização do pedido')).toBeInTheDocument()
  })

  it('8. mostra o preview de cada email', () => {
    renderPage()
    const items = getEmailListItems()
    expect(within(items[0]).getByText(/Segue em anexo a invoice proforma/)).toBeInTheDocument()
    expect(within(items[1]).getByText(/Informamos que o container MSKU1234567/)).toBeInTheDocument()
    expect(within(items[2]).getByText(/A DI foi registrada com sucesso/)).toBeInTheDocument()
    expect(within(items[3]).getByText(/Gostaríamos de saber a previsão atualizada/)).toBeInTheDocument()
  })

  it('9. mostra indicador de não lido nos emails 1 e 4', () => {
    renderPage()
    const items = getEmailListItems()
    // Emails não lidos têm a classe em-list-item--unread
    expect(items[0].className).toContain('em-list-item--unread')
    expect(items[1].className).not.toContain('em-list-item--unread')
    expect(items[2].className).not.toContain('em-list-item--unread')
    expect(items[3].className).toContain('em-list-item--unread')
  })

  it('10. mostra estrela apenas no email 1 (starred)', () => {
    renderPage()
    const items = getEmailListItems()
    // Email 1 has a Star icon
    const starsInEmail1 = within(items[0]).queryAllByTestId('icon-Star')
    expect(starsInEmail1.length).toBeGreaterThan(0)
    // Email 2 does not
    const starsInEmail2 = within(items[1]).queryAllByTestId('icon-Star')
    expect(starsInEmail2).toHaveLength(0)
  })

  it('11. mostra contagem de anexos para emails com anexos', () => {
    renderPage()
    const items = getEmailListItems()
    // Email 1: 1 attachment
    const attachIcon1 = within(items[0]).queryAllByTestId('icon-Paperclip')
    expect(attachIcon1.length).toBeGreaterThan(0)
    // Email 2: 0 attachments — no Paperclip in the bottom section
    // (but Paperclip is also used in detail; check within list item bottom)
    expect(within(items[1]).queryByText('0')).not.toBeInTheDocument()
  })

  it('12. mostra tag de categoria em cada email', () => {
    renderPage()
    // Category labels appear in list items (and possibly detail)
    // All four categories should be visible
    const financeiros = screen.getAllByText('Financeiro')
    expect(financeiros.length).toBeGreaterThanOrEqual(1)
    const operacionais = screen.getAllByText('Operacional')
    expect(operacionais.length).toBeGreaterThanOrEqual(1)
    const documentais = screen.getAllByText('Documental')
    expect(documentais.length).toBeGreaterThanOrEqual(1)
    // 'Cliente' appears both as from name and category label
    const clientes = screen.getAllByText('Cliente')
    expect(clientes.length).toBeGreaterThanOrEqual(2) // from name + category tag (+ pill)
  })
})

// ─── 3. Painel de Detalhe ────────────────────────────────────────────────

describe('EmailPage — Painel de detalhe', () => {
  it('13. email selecionado mostra o painel de detalhe', () => {
    renderPage()
    // First email is selected by default, detail shows subject in both list and detail
    const subjects = screen.getAllByText('Invoice Proforma - PO 2024/001')
    // At least 2: one in list item, one in detail panel
    expect(subjects.length).toBeGreaterThanOrEqual(2)
  })

  it('14. detalhe mostra o assunto do email selecionado', () => {
    renderPage()
    // The subject appears in both list and detail; check detail-specific container
    const detailSubjects = screen.getAllByText('Invoice Proforma - PO 2024/001')
    // At least 2: one in list, one in detail
    expect(detailSubjects.length).toBeGreaterThanOrEqual(2)
  })

  it('15. detalhe mostra a data formatada completa', () => {
    renderPage()
    // formatFullDate for 2026-03-28T10:30:00Z should produce a date with 'março' and '2026'
    expect(screen.getByText(/2026/)).toBeInTheDocument()
    expect(screen.getByText(/março/i)).toBeInTheDocument()
  })

  it('16. detalhe mostra nome e email do remetente', () => {
    renderPage()
    // From name
    expect(screen.getByText('Carlos Silva')).toBeInTheDocument()
    // From email in angle brackets
    expect(screen.getByText(/carlos\.silva@exportador\.com/)).toBeInTheDocument()
  })

  it('17. detalhe mostra nome e email do destinatário', () => {
    renderPage()
    expect(screen.getByText(/Operações/)).toBeInTheDocument()
    expect(screen.getByText(/operacoes@importador\.com\.br/)).toBeInTheDocument()
  })

  it('18. detalhe mostra o corpo do email', () => {
    renderPage()
    expect(screen.getByText(/Valor FOB: USD 45,320\.00/)).toBeInTheDocument()
    expect(screen.getByText(/Condição de pagamento/)).toBeInTheDocument()
  })

  it('19. detalhe mostra lista de anexos para emails com anexos', () => {
    renderPage()
    // First email has 1 attachment
    expect(screen.getByText('Invoice_Proforma_PO2024001.pdf')).toBeInTheDocument()
    expect(screen.getByText('245 KB')).toBeInTheDocument()
    expect(screen.getByText(/Anexos \(1\)/)).toBeInTheDocument()
  })
})

// ─── 4. Interação — Seleção de Email ─────────────────────────────────────

describe('EmailPage — Seleção de email', () => {
  it('20. clicar em outro email muda a seleção', () => {
    renderPage()
    const items = getEmailListItems()

    // Click second email
    fireEvent.click(items[1])

    expect(items[0]).toHaveAttribute('aria-selected', 'false')
    expect(items[1]).toHaveAttribute('aria-selected', 'true')

    // Detail should now show email 2's subject
    expect(screen.getByText(/Container MSKU1234567/)).toBeInTheDocument()
    // And email 2's body
    expect(screen.getByText(/MSC DIANA/)).toBeInTheDocument()
  })

  it('20b. selecionar email 3 mostra seus 2 anexos no detalhe', () => {
    renderPage()
    const items = getEmailListItems()

    fireEvent.click(items[2])

    expect(screen.getByText('Comprovante_Registro_DI.pdf')).toBeInTheDocument()
    expect(screen.getByText('Extrato_DI.pdf')).toBeInTheDocument()
    expect(screen.getByText(/Anexos \(2\)/)).toBeInTheDocument()
  })
})

// ─── 5. Busca ────────────────────────────────────────────────────────────

describe('EmailPage — Busca', () => {
  it('21. busca filtra por assunto', () => {
    renderPage()
    const input = getSearchInput()

    fireEvent.change(input, { target: { value: 'Invoice' } })

    const items = getEmailListItems()
    expect(items).toHaveLength(1)
    expect(screen.getByText('Invoice Proforma - PO 2024/001')).toBeInTheDocument()
  })

  it('22. busca filtra por nome do remetente', () => {
    renderPage()
    const input = getSearchInput()

    fireEvent.change(input, { target: { value: 'Despachante' } })

    const items = getEmailListItems()
    expect(items).toHaveLength(1)
    expect(screen.getByText('DI Registrada - Processo 2024/0150')).toBeInTheDocument()
  })

  it('23. busca mostra estado vazio quando nenhum resultado', () => {
    renderPage()
    const input = getSearchInput()

    fireEvent.change(input, { target: { value: 'XYZABC_NAO_EXISTE' } })

    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByText('Nenhum e-mail encontrado')).toBeInTheDocument()
  })

  it('23b. busca é case-insensitive', () => {
    renderPage()
    const input = getSearchInput()

    fireEvent.change(input, { target: { value: 'invoice' } })

    const items = getEmailListItems()
    expect(items).toHaveLength(1)
  })
})

// ─── 6. Filtro de Categoria ──────────────────────────────────────────────

describe('EmailPage — Filtro de categoria', () => {
  it('24. filtro de categoria mostra apenas emails da categoria selecionada', () => {
    renderPage()

    clickCategoryPill('Financeiro')

    const items = getEmailListItems()
    expect(items).toHaveLength(1)
    expect(screen.getByText('Invoice Proforma - PO 2024/001')).toBeInTheDocument()
  })

  it('25. clicar na categoria ativa remove o filtro (mostra todos)', () => {
    renderPage()

    // Activate filter
    clickCategoryPill('Operacional')
    expect(getEmailListItems()).toHaveLength(1)

    // Click same category again to deactivate
    clickCategoryPill('Operacional')
    expect(getEmailListItems()).toHaveLength(4)
  })

  it('25b. clicar em "Todos" remove qualquer filtro de categoria', () => {
    renderPage()

    clickCategoryPill('Documental')
    expect(getEmailListItems()).toHaveLength(1)

    clickCategoryPill('Todos')
    expect(getEmailListItems()).toHaveLength(4)
  })

  it('25c. filtro Cliente mostra apenas email do cliente', () => {
    renderPage()

    clickCategoryPill('Cliente')

    const items = getEmailListItems()
    expect(items).toHaveLength(1)
    expect(screen.getByText('RE: Atualização do pedido')).toBeInTheDocument()
  })
})

// ─── 7. Ações (Botões) ──────────────────────────────────────────────────

describe('EmailPage — Ações', () => {
  it('26. botão Responder dispara notificação de sucesso', () => {
    renderPage()

    const responderBtn = screen.getByText('Responder')
    fireEvent.click(responderBtn)

    const notifications = getNotifications()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('success')
    expect(notifications[0].message).toBe('Resposta iniciada com sucesso')
  })

  it('27. botão Encaminhar dispara notificação de sucesso', () => {
    renderPage()

    const encaminharBtn = screen.getByText('Encaminhar')
    fireEvent.click(encaminharBtn)

    const notifications = getNotifications()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('success')
    expect(notifications[0].message).toBe('Encaminhamento iniciado com sucesso')
  })

  it('28. botão Vincular dispara notificação com assunto do email selecionado', () => {
    renderPage()

    const vincularBtn = screen.getByText('Vincular ao Follow-up')
    fireEvent.click(vincularBtn)

    const notifications = getNotifications()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('success')
    expect(notifications[0].message).toBe(
      'E-mail vinculado ao follow-up: Invoice Proforma - PO 2024/001'
    )
  })

  it('28b. botão Vincular usa assunto do email atualmente selecionado', () => {
    renderPage()
    const items = getEmailListItems()

    // Select email 3
    fireEvent.click(items[2])

    const vincularBtn = screen.getByText('Vincular ao Follow-up')
    fireEvent.click(vincularBtn)

    const notifications = getNotifications()
    expect(notifications[0].message).toBe(
      'E-mail vinculado ao follow-up: DI Registrada - Processo 2024/0150'
    )
  })
})

// ─── 8. Navegação por Teclado ────────────────────────────────────────────

describe('EmailPage — Navegação por teclado', () => {
  it('29. pressionar Enter seleciona o email', () => {
    renderPage()
    const items = getEmailListItems()

    fireEvent.keyDown(items[2], { key: 'Enter' })

    expect(items[2]).toHaveAttribute('aria-selected', 'true')
    expect(items[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('30. pressionar Space seleciona o email', () => {
    renderPage()
    const items = getEmailListItems()

    fireEvent.keyDown(items[3], { key: ' ' })

    expect(items[3]).toHaveAttribute('aria-selected', 'true')
    expect(items[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('30b. outras teclas não alteram a seleção', () => {
    renderPage()
    const items = getEmailListItems()

    fireEvent.keyDown(items[2], { key: 'Tab' })

    // First email should still be selected
    expect(items[0]).toHaveAttribute('aria-selected', 'true')
    expect(items[2]).toHaveAttribute('aria-selected', 'false')
  })
})

// ─── 9. Acessibilidade ARIA ─────────────────────────────────────────────

describe('EmailPage — Acessibilidade ARIA', () => {
  it('31. lista tem role=listbox e aria-label', () => {
    renderPage()
    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveAttribute('aria-label', 'Lista de e-mails')
  })

  it('31b. itens da lista têm role=option', () => {
    renderPage()
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(4)
  })

  it('31c. item selecionado tem aria-selected=true', () => {
    renderPage()
    const options = screen.getAllByRole('option')
    const selected = options.filter(
      (o) => o.getAttribute('aria-selected') === 'true'
    )
    expect(selected).toHaveLength(1)
  })

  it('31d. campo de busca tem aria-label', () => {
    renderPage()
    const input = screen.getByLabelText('Buscar e-mails')
    expect(input).toBeInTheDocument()
  })

  it('31e. pills de categoria têm role=tab e aria-selected', () => {
    renderPage()
    const tabs = getCategoryPills()
    // "Todos" is active by default
    const todosTab = screen.getByRole('tab', { name: 'Todos' })
    expect(todosTab).toHaveAttribute('aria-selected', 'true')

    const financeiroTab = screen.getByRole('tab', { name: 'Financeiro' })
    expect(financeiroTab).toHaveAttribute('aria-selected', 'false')
  })

  it('31f. tablist tem aria-label', () => {
    renderPage()
    const tablist = screen.getByRole('tablist')
    expect(tablist).toHaveAttribute('aria-label', 'Filtrar por categoria')
  })

  it('31g. botões de anexo têm aria-label com nome do arquivo', () => {
    renderPage()
    // First email is selected, has 1 attachment
    const downloadBtn = screen.getByLabelText('Baixar Invoice_Proforma_PO2024001.pdf')
    expect(downloadBtn).toBeInTheDocument()
  })

  it('31h. itens da lista têm tabIndex=0 para navegação por teclado', () => {
    renderPage()
    const options = screen.getAllByRole('option')
    options.forEach((option) => {
      expect(option).toHaveAttribute('tabindex', '0')
    })
  })
})

// ─── 10. Interações Combinadas ───────────────────────────────────────────

describe('EmailPage — Interações combinadas', () => {
  it('32. busca + filtro de categoria combinados', () => {
    renderPage()

    // Filter by 'operacional' category
    clickCategoryPill('Operacional')
    expect(getEmailListItems()).toHaveLength(1)

    // Add search that matches the operacional email
    const input = getSearchInput()
    fireEvent.change(input, { target: { value: 'Container' } })
    expect(getEmailListItems()).toHaveLength(1)

    // Change search to something that doesn't match operacional
    fireEvent.change(input, { target: { value: 'Invoice' } })
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByText('Nenhum e-mail encontrado')).toBeInTheDocument()
  })

  it('32b. limpar busca restaura emails do filtro de categoria ativo', () => {
    renderPage()

    clickCategoryPill('Documental')
    expect(getEmailListItems()).toHaveLength(1)

    const input = getSearchInput()
    fireEvent.change(input, { target: { value: 'DI' } })
    expect(getEmailListItems()).toHaveLength(1)

    // Clear search — should still show only documental
    fireEvent.change(input, { target: { value: '' } })
    expect(getEmailListItems()).toHaveLength(1)
  })

  it('32c. selecionar email, mudar filtro que exclui o email selecionado', () => {
    renderPage()
    const items = getEmailListItems()

    // Select email 2 (operacional)
    fireEvent.click(items[1])
    expect(items[1]).toHaveAttribute('aria-selected', 'true')

    // Filter by financeiro — email 2 is gone from list
    clickCategoryPill('Financeiro')
    const filteredItems = getEmailListItems()
    expect(filteredItems).toHaveLength(1)
    // The detail panel still shows the previously selected email
    // since selectedEmail is found from the full list, not filtered
    expect(screen.getByText(/Container MSKU1234567/)).toBeInTheDocument()
  })

  it('32d. múltiplas ações em sequência acumulam notificações', () => {
    renderPage()

    fireEvent.click(screen.getByText('Responder'))
    fireEvent.click(screen.getByText('Encaminhar'))
    fireEvent.click(screen.getByText('Vincular ao Follow-up'))

    const notifications = getNotifications()
    expect(notifications).toHaveLength(3)
    expect(notifications[0].message).toBe('Resposta iniciada com sucesso')
    expect(notifications[1].message).toBe('Encaminhamento iniciado com sucesso')
    expect(notifications[2].message).toContain('E-mail vinculado ao follow-up')
  })

  it('32e. trocar entre todos os 4 emails em sequência funciona', () => {
    renderPage()
    const items = getEmailListItems()

    // Select each email and verify detail changes
    fireEvent.click(items[1])
    expect(screen.getByText(/MSC DIANA/)).toBeInTheDocument()

    fireEvent.click(items[2])
    expect(screen.getByText(/24\/1234567-0/)).toBeInTheDocument()

    fireEvent.click(items[3])
    expect(screen.getByText(/Nosso estoque está baixo/)).toBeInTheDocument()

    fireEvent.click(items[0])
    expect(screen.getByText(/Valor FOB: USD 45,320\.00/)).toBeInTheDocument()
  })

  it('32f. email sem anexos não mostra seção de anexos no detalhe', () => {
    renderPage()
    const items = getEmailListItems()

    // Select email 2 (no attachments)
    fireEvent.click(items[1])

    expect(screen.queryByText(/Anexos \(/)).not.toBeInTheDocument()
  })
})
