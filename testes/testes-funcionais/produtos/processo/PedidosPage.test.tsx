/**
 * PedidosPage.test.tsx — Testes funcionais para a pagina de Pedidos
 *
 * Valida renderizacao de header, stat cards, tabela de pedidos (pai),
 * itens (filha), acoes, formatacao de valores e estado vazio.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import React from 'react'
import PedidosPage from '../../../../produto/processo/client/src/pages/pedidos/PedidosPage'

describe('PedidosPage', () => {
  // ── Header ─────────────────────────────────────────────────────────────────

  it('1. renderiza titulo "Pedidos"', () => {
    render(<PedidosPage />)
    expect(screen.getByTestId('cabecalho-titulo')).toHaveTextContent('Pedidos')
  })

  it('2. renderiza subtitulo do cabecalho', () => {
    render(<PedidosPage />)
    expect(screen.getByTestId('cabecalho-subtitulo')).toHaveTextContent(
      'Pedidos de compra vinculados ao processo'
    )
  })

  // ── Stat Cards ─────────────────────────────────────────────────────────────

  it('3. exibe card Total Pedidos com valor 2', () => {
    render(<PedidosPage />)
    const cards = screen.getAllByTestId('card-basico')
    const totalCard = cards.find(c => c.getAttribute('data-titulo') === 'Total Pedidos')
    expect(totalCard).toBeDefined()
    const valor = within(totalCard!).getByTestId('card-valor')
    expect(valor).toHaveTextContent('2')
  })

  it('4. exibe card Valor FOB Total com formato USD', () => {
    render(<PedidosPage />)
    const cards = screen.getAllByTestId('card-basico')
    const fobCard = cards.find(c => c.getAttribute('data-titulo') === 'Valor FOB Total')
    expect(fobCard).toBeDefined()
    const valor = within(fobCard!).getByTestId('card-valor')
    // 84250 + 23800 = 108050 formatado em pt-BR como USD
    expect(valor.textContent).toMatch(/108[.,]050/)
  })

  it('5. exibe card Peso Total com formato kg', () => {
    render(<PedidosPage />)
    const cards = screen.getAllByTestId('card-basico')
    const pesoCard = cards.find(c => c.getAttribute('data-titulo') === 'Peso Total')
    expect(pesoCard).toBeDefined()
    const valor = within(pesoCard!).getByTestId('card-valor')
    // 12450.80 + 6320.50 = 18771.30
    expect(valor.textContent).toMatch(/18[.,]771/)
    expect(valor.textContent).toMatch(/kg/)
  })

  // ── Botao Novo Pedido ──────────────────────────────────────────────────────

  it('6. exibe botao "Novo Pedido"', () => {
    render(<PedidosPage />)
    const botoes = screen.getAllByTestId('botao-global')
    const novoPedido = botoes.find(b => b.textContent?.includes('Novo Pedido'))
    expect(novoPedido).toBeDefined()
  })

  // ── Tabela de Pedidos (linhas pai) ─────────────────────────────────────────

  it('7. renderiza tabela com linhas de pedidos', () => {
    render(<PedidosPage />)
    expect(screen.getByTestId('tabela-camadas')).toBeInTheDocument()
  })

  it('8. exibe linha do pedido PO-2026/001', () => {
    render(<PedidosPage />)
    expect(screen.getByTestId('tabela-row-ped-001')).toBeInTheDocument()
  })

  it('9. exibe linha do pedido PO-2026/002', () => {
    render(<PedidosPage />)
    expect(screen.getByTestId('tabela-row-ped-002')).toBeInTheDocument()
  })

  it('10. exibe nomes dos exportadores nas linhas', () => {
    render(<PedidosPage />)
    expect(screen.getByText('Shanghai Electronics Co.')).toBeInTheDocument()
    expect(screen.getByText('Dongguan Plastics Ltd.')).toBeInTheDocument()
  })

  it('11. exibe status badges dos pedidos (Confirmado, Pendente)', () => {
    render(<PedidosPage />)
    const badges = screen.getAllByTestId('status-badge')
    const textos = badges.map(b => b.textContent)
    expect(textos).toContain('Confirmado')
    expect(textos).toContain('Pendente')
  })

  it('12. exibe valores FOB formatados nas linhas', () => {
    render(<PedidosPage />)
    // 84250 formatado em pt-BR USD e 23800
    const text = screen.getByTestId('tabela-camadas').textContent ?? ''
    expect(text).toMatch(/84[.,]250/)
    expect(text).toMatch(/23[.,]800/)
  })

  it('13. exibe valores de peso formatados nas linhas', () => {
    render(<PedidosPage />)
    const text = screen.getByTestId('tabela-camadas').textContent ?? ''
    expect(text).toMatch(/12[.,]450/)
    expect(text).toMatch(/6[.,]320/)
  })

  // ── Itens (linhas filha) ───────────────────────────────────────────────────

  it('14. exibe descricoes dos itens nas linhas filhas', () => {
    render(<PedidosPage />)
    expect(screen.getByText('Placa controladora PCB modelo X-200')).toBeInTheDocument()
    expect(screen.getByText('Capacitor ceramico SMD 100nF')).toBeInTheDocument()
    expect(screen.getByText('Conector USB-C macho SMT')).toBeInTheDocument()
    expect(screen.getByText('Dissipador de calor aluminio 40x40mm')).toBeInTheDocument()
    expect(screen.getByText('Carcaca plastica ABS injetada modelo G-5')).toBeInTheDocument()
    expect(screen.getByText('Tampa traseira policarbonato transparente')).toBeInTheDocument()
  })

  it('15. exibe codigos NCM dos itens', () => {
    render(<PedidosPage />)
    expect(screen.getByText('8542.31.90')).toBeInTheDocument()
    expect(screen.getByText('8532.24.10')).toBeInTheDocument()
    expect(screen.getByText('8536.69.90')).toBeInTheDocument()
    expect(screen.getByText('7616.99.00')).toBeInTheDocument()
    expect(screen.getByText('3926.90.90')).toBeInTheDocument()
    expect(screen.getByText('3920.61.00')).toBeInTheDocument()
  })

  it('16. exibe quantidades com unidades nos itens', () => {
    render(<PedidosPage />)
    const text = screen.getByTestId('tabela-camadas').textContent ?? ''
    // 5000 UN, 50000 UN, 10000 UN, 5000 UN, 3000 UN, 3000 UN
    expect(text).toMatch(/5[.,]000\s*UN/)
    expect(text).toMatch(/50[.,]000\s*UN/)
    expect(text).toMatch(/10[.,]000\s*UN/)
    expect(text).toMatch(/3[.,]000\s*UN/)
  })

  it('17. exibe valor_total dos itens formatados em USD', () => {
    render(<PedidosPage />)
    const text = screen.getByTestId('tabela-camadas').textContent ?? ''
    // 35000, 12500, 18750, 18000, 15000, 8800
    expect(text).toMatch(/35[.,]000/)
    expect(text).toMatch(/12[.,]500/)
    expect(text).toMatch(/18[.,]750/)
    expect(text).toMatch(/18[.,]000/)
    expect(text).toMatch(/15[.,]000/)
    expect(text).toMatch(/8[.,]800/)
  })

  it('18. exibe status LI badges (Deferida, Dispensada, Pendente)', () => {
    render(<PedidosPage />)
    const badges = screen.getAllByTestId('status-badge')
    const textos = badges.map(b => b.textContent)
    expect(textos).toContain('Deferida')
    expect(textos).toContain('Dispensada')
    // Pendente aparece tanto em pedido quanto em itens
    expect(textos.filter(t => t === 'Pendente').length).toBeGreaterThanOrEqual(1)
  })

  it('19. exibe numero dos itens com padding de 3 digitos (001, 002, etc.)', () => {
    render(<PedidosPage />)
    const text = screen.getByTestId('tabela-camadas').textContent ?? ''
    expect(text).toContain('001')
    expect(text).toContain('002')
  })

  // ── Acoes ──────────────────────────────────────────────────────────────────

  it('20. exibe botao de acao "ver" para cada pedido', () => {
    render(<PedidosPage />)
    expect(screen.getByTestId('acao-ver-ped-001')).toBeInTheDocument()
    expect(screen.getByTestId('acao-ver-ped-002')).toBeInTheDocument()
  })

  it('21. exibe botao de acao "editar" para cada pedido', () => {
    render(<PedidosPage />)
    expect(screen.getByTestId('acao-editar-ped-001')).toBeInTheDocument()
    expect(screen.getByTestId('acao-editar-ped-002')).toBeInTheDocument()
  })

  // ── Busca ──────────────────────────────────────────────────────────────────

  it('22. exibe campo de busca com placeholder "Buscar pedidos..."', () => {
    render(<PedidosPage />)
    const busca = screen.getByTestId('tabela-busca')
    expect(busca).toHaveAttribute('placeholder', 'Buscar pedidos...')
  })

  // ── Contagem total de itens ────────────────────────────────────────────────

  it('23. renderiza todos os 6 itens distribuidos nos 2 pedidos', () => {
    render(<PedidosPage />)
    // Pedido 1 tem 4 filhos, pedido 2 tem 2 filhos = 6 linhas filha
    const childRowsPed1 = [
      screen.getByTestId('tabela-child-ped-001-0'),
      screen.getByTestId('tabela-child-ped-001-1'),
      screen.getByTestId('tabela-child-ped-001-2'),
      screen.getByTestId('tabela-child-ped-001-3'),
    ]
    const childRowsPed2 = [
      screen.getByTestId('tabela-child-ped-002-0'),
      screen.getByTestId('tabela-child-ped-002-1'),
    ]
    expect(childRowsPed1).toHaveLength(4)
    expect(childRowsPed2).toHaveLength(2)
  })

  // ── Acoes com console.log ──────────────────────────────────────────────────

  it('24. acao "ver" dispara console.log com id do pedido', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    render(<PedidosPage />)
    fireEvent.click(screen.getByTestId('acao-ver-ped-001'))
    expect(spy).toHaveBeenCalledWith('Ver pedido:', 'ped-001')
    spy.mockRestore()
  })

  it('25. acao "editar" dispara console.log com id do pedido', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    render(<PedidosPage />)
    fireEvent.click(screen.getByTestId('acao-editar-ped-002'))
    expect(spy).toHaveBeenCalledWith('Editar pedido:', 'ped-002')
    spy.mockRestore()
  })

  // ── Subtexto dos cards ─────────────────────────────────────────────────────

  it('26. card Total Pedidos exibe subtexto "6 itens no total"', () => {
    render(<PedidosPage />)
    const cards = screen.getAllByTestId('card-basico')
    const totalCard = cards.find(c => c.getAttribute('data-titulo') === 'Total Pedidos')
    const subtexto = within(totalCard!).getByTestId('card-subtexto')
    expect(subtexto).toHaveTextContent('6 itens no total')
  })

  it('27. card Valor FOB Total exibe subtexto "Soma de todos os pedidos"', () => {
    render(<PedidosPage />)
    const cards = screen.getAllByTestId('card-basico')
    const fobCard = cards.find(c => c.getAttribute('data-titulo') === 'Valor FOB Total')
    const subtexto = within(fobCard!).getByTestId('card-subtexto')
    expect(subtexto).toHaveTextContent('Soma de todos os pedidos')
  })

  it('28. card Peso Total exibe subtexto "Peso bruto acumulado"', () => {
    render(<PedidosPage />)
    const cards = screen.getAllByTestId('card-basico')
    const pesoCard = cards.find(c => c.getAttribute('data-titulo') === 'Peso Total')
    const subtexto = within(pesoCard!).getByTestId('card-subtexto')
    expect(subtexto).toHaveTextContent('Peso bruto acumulado')
  })

  // ── Variantes dos cards ────────────────────────────────────────────────────

  it('29. card Valor FOB Total tem variante "sucesso"', () => {
    render(<PedidosPage />)
    const cards = screen.getAllByTestId('card-basico')
    const fobCard = cards.find(c => c.getAttribute('data-titulo') === 'Valor FOB Total')
    expect(fobCard).toHaveAttribute('data-variante', 'sucesso')
  })

  it('30. card Peso Total tem variante "aviso"', () => {
    render(<PedidosPage />)
    const cards = screen.getAllByTestId('card-basico')
    const pesoCard = cards.find(c => c.getAttribute('data-titulo') === 'Peso Total')
    expect(pesoCard).toHaveAttribute('data-variante', 'aviso')
  })

  // ── Colunas da tabela ──────────────────────────────────────────────────────

  it('31. tabela exibe headers das colunas pai', () => {
    render(<PedidosPage />)
    expect(screen.getByText('Numero')).toBeInTheDocument()
    expect(screen.getByText('Exportador')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Valor FOB')).toBeInTheDocument()
    expect(screen.getByText('Peso Bruto (kg)')).toBeInTheDocument()
    expect(screen.getByText('Data Pedido')).toBeInTheDocument()
  })

  it('32. tabela exibe coluna de Acoes no header', () => {
    render(<PedidosPage />)
    expect(screen.getByText('Acoes')).toBeInTheDocument()
  })

  // ── Layout ─────────────────────────────────────────────────────────────────

  it('33. pagina usa layout "lista"', () => {
    render(<PedidosPage />)
    expect(screen.getByTestId('pagina-global')).toHaveAttribute('data-layout', 'lista')
  })

  // ── Numero do pedido nas linhas ────────────────────────────────────────────

  it('34. exibe numeros dos pedidos PO-2026/001 e PO-2026/002', () => {
    render(<PedidosPage />)
    expect(screen.getByText('PO-2026/001')).toBeInTheDocument()
    expect(screen.getByText('PO-2026/002')).toBeInTheDocument()
  })

  // ── Datas formatadas ───────────────────────────────────────────────────────

  it('35. exibe datas dos pedidos formatadas em pt-BR', () => {
    render(<PedidosPage />)
    const text = screen.getByTestId('tabela-camadas').textContent ?? ''
    // Dates formatted via toLocaleDateString — timezone may shift day
    const d1 = new Date('2026-01-15').toLocaleDateString('pt-BR')
    const d2 = new Date('2026-02-08').toLocaleDateString('pt-BR')
    expect(text).toContain(d1)
    expect(text).toContain(d2)
  })

  // ── Stats section presente ─────────────────────────────────────────────────

  it('36. renderiza secao de stats com 3 cards', () => {
    render(<PedidosPage />)
    const statsSection = screen.getByTestId('pagina-stats')
    const cards = within(statsSection).getAllByTestId('card-basico')
    expect(cards).toHaveLength(3)
  })

  // ── NCM com estilo monospace ───────────────────────────────────────────────

  it('37. NCM dos itens sao renderizados com fontFamily mono', () => {
    render(<PedidosPage />)
    const ncmEl = screen.getByText('8542.31.90')
    expect(ncmEl.style.fontFamily).toMatch(/mono/)
  })

  // ── Genero nos badges ──────────────────────────────────────────────────────

  it('38. badges de status pedido usam genero "masculino"', () => {
    render(<PedidosPage />)
    const badges = screen.getAllByTestId('status-badge')
    const confirmado = badges.find(b => b.textContent === 'Confirmado')
    expect(confirmado).toHaveAttribute('data-genero', 'masculino')
  })

  it('39. badges de status LI usam genero "feminino"', () => {
    render(<PedidosPage />)
    const badges = screen.getAllByTestId('status-badge')
    const deferida = badges.find(b => b.textContent === 'Deferida')
    expect(deferida).toHaveAttribute('data-genero', 'feminino')
  })

  // ── Botao variante ─────────────────────────────────────────────────────────

  it('40. botao Novo Pedido usa variante "primario"', () => {
    render(<PedidosPage />)
    const botoes = screen.getAllByTestId('botao-global')
    const novoPedido = botoes.find(b => b.textContent?.includes('Novo Pedido'))
    expect(novoPedido).toHaveAttribute('data-variante', 'primario')
  })
})
