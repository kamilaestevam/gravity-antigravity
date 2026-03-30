/**
 * Testes funcionais — Templates + Composição + Tokens (integração)
 * Localização: testes/testes-funcionais/nucleo-global/templates.test.tsx
 *
 * Ferramentas: Vitest (node)
 * Valida: composição correta dos templates com componentes existentes,
 *         propagação de props, estrutura de saída e integração entre camadas
 *
 * NOTA: PaginaTabelaGlobal depende de TabelaGlobal que importa react-dom.
 *       Testamos ela via mock da TabelaGlobal para isolar a integração.
 */

// @vitest-environment node
import React from 'react'
import { describe, it, expect, vi } from 'vitest'

// Mock de react-dom (TabelaGlobal usa createPortal)
vi.mock('react-dom', () => ({
  default: { createPortal: vi.fn((node: unknown) => node) },
  createPortal: vi.fn((node: unknown) => node),
}))

// Mock da TabelaGlobal para evitar dependências pesadas (@nucleo/tooltip-global, etc.)
vi.mock('../../../nucleo-global/Tabelas/tabela-global/src/tabela', () => ({
  TabelaGlobal: (props: Record<string, unknown>) =>
    React.createElement('div', { 'data-testid': 'tabela-mock', ...props }),
}))
vi.mock('../../../nucleo-global/Tabelas/tabela-global/src/index', () => ({
  TabelaGlobal: (props: Record<string, unknown>) =>
    React.createElement('div', { 'data-testid': 'tabela-mock', ...props }),
}))

// Mock do BotoesSalvarGlobal (depende de @nucleo/botao-global e @nucleo/tooltip-global)
vi.mock('../../../nucleo-global/Botoes/botoes-salvar-global/src/botoes-salvar', () => ({
  BotoesSalvarGlobal: (props: Record<string, unknown>) =>
    React.createElement('div', { 'data-testid': 'botoes-salvar-mock', ...props }),
  BotaoSalvar: (props: Record<string, unknown>) =>
    React.createElement('button', { 'data-testid': 'btn-salvar-mock', ...props }),
  BotaoCancelar: (props: Record<string, unknown>) =>
    React.createElement('button', { 'data-testid': 'btn-cancelar-mock', ...props }),
}))

// ─── Imports dos Templates ───────────────────────────────────────────────────
import { PaginaFormularioGlobal } from '../../../nucleo-global/Templates/pagina-formulario-global/src/PaginaFormularioGlobal'
import { PaginaDashboardGlobal } from '../../../nucleo-global/Templates/pagina-dashboard-global/src/PaginaDashboardGlobal'

// ─── Imports de Composição ───────────────────────────────────────────────────
import { StackGlobal } from '../../../nucleo-global/Composicao/stack-global/src/StackGlobal'
import { FlexGlobal } from '../../../nucleo-global/Composicao/flex-global/src/FlexGlobal'
import { GridGlobal } from '../../../nucleo-global/Composicao/grid-global/src/GridGlobal'
import { SecaoGlobal } from '../../../nucleo-global/Composicao/secao-global/src/SecaoGlobal'

// ─── Imports de Tokens ───────────────────────────────────────────────────────
import { cores, espacamento, raios } from '../../../nucleo-global/Tokens/index'

// ─── Tipos ───────────────────────────────────────────────────────────────────
import type { PaginaFormularioProps } from '../../../nucleo-global/Templates/pagina-formulario-global/src/tipos'
import type { PaginaDashboardProps } from '../../../nucleo-global/Templates/pagina-dashboard-global/src/tipos'

// ═══════════════════════════════════════════════════════════════════════════
// 1. BARREL EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Barrel Exports — Composicao', () => {
  it('todos os componentes exportam via barrel', async () => {
    const barrel = await import('../../../nucleo-global/Composicao/index')
    expect(barrel.StackGlobal).toBeDefined()
    expect(barrel.FlexGlobal).toBeDefined()
    expect(barrel.GridGlobal).toBeDefined()
    expect(barrel.SecaoGlobal).toBeDefined()
  })
})

describe('Barrel Exports — Templates', () => {
  it('PaginaFormularioGlobal exporta via barrel', async () => {
    const barrel = await import('../../../nucleo-global/Templates/index')
    expect(barrel.PaginaFormularioGlobal).toBeDefined()
    expect(barrel.PaginaDashboardGlobal).toBeDefined()
    expect(barrel.PaginaTabelaGlobal).toBeDefined()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 2. PaginaFormularioGlobal — Integração
// ═══════════════════════════════════════════════════════════════════════════

describe('PaginaFormularioGlobal — integração', () => {
  it('renderiza sem erros com props mínimas', () => {
    const result = PaginaFormularioGlobal({
      titulo: 'Nova Empresa',
      children: React.createElement('input', { type: 'text' }),
    })
    expect(result).toBeDefined()
  })

  it('usa layout formulario', () => {
    const result = PaginaFormularioGlobal({
      titulo: 'Editar',
      children: 'campos',
    })
    expect(result.props.layout).toBe('formulario')
  })

  it('renderiza botões quando aoSalvar e aoCancelar são fornecidos', () => {
    const result = PaginaFormularioGlobal({
      titulo: 'Novo',
      children: 'campos',
      aoSalvar: () => {},
      aoCancelar: () => {},
    })
    expect(result).toBeDefined()
  })

  it('semAcoes=true esconde a barra de ações', () => {
    const result = PaginaFormularioGlobal({
      titulo: 'Visualizar',
      children: 'conteúdo',
      semAcoes: true,
    })
    expect(result).toBeDefined()
  })

  it('usa BotoesSalvarGlobal com dirty/salvando', () => {
    const props: PaginaFormularioProps = {
      titulo: 'Teste',
      children: 'campos',
      dirty: true,
      salvando: false,
      aoSalvar: () => {},
      aoCancelar: () => {},
    }
    expect(props.dirty).toBe(true)
    expect(props.salvando).toBe(false)
  })

  it('renderiza full-width como Configurador (sem maxWidth)', () => {
    const result = PaginaFormularioGlobal({
      titulo: 'Teste',
      children: 'campos',
    })
    expect(result).toBeDefined()
    expect(result.props.layout).toBe('formulario')
  })

  it('aceita toolbar (abas de formulário)', () => {
    const toolbar = React.createElement('div', null, 'Abas')
    const result = PaginaFormularioGlobal({
      titulo: 'Teste',
      children: 'campos',
      toolbar,
    })
    expect(result.props.toolbar).toBeDefined()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 3. PaginaDashboardGlobal — Integração
// ═══════════════════════════════════════════════════════════════════════════

describe('PaginaDashboardGlobal — integração', () => {
  it('renderiza sem erros com props mínimas', () => {
    const result = PaginaDashboardGlobal({
      titulo: 'Dashboard',
      children: 'gráficos',
    })
    expect(result).toBeDefined()
  })

  it('usa layout lista', () => {
    const result = PaginaDashboardGlobal({
      titulo: 'Dashboard',
      children: 'gráficos',
    })
    expect(result.props.layout).toBe('lista')
  })

  it('aceita KPIs como slot', () => {
    const kpis = React.createElement('div', null, 'KPIs')
    const result = PaginaDashboardGlobal({
      titulo: 'Dashboard',
      kpis,
      children: 'gráficos',
    })
    expect(result.props.stats).toBeDefined()
  })

  it('aceita todos os slots opcionais', () => {
    const props: PaginaDashboardProps = {
      titulo: 'Dashboard',
      subtitulo: 'Visão geral',
      icone: React.createElement('span', null, 'icon'),
      acoes: React.createElement('button', null, 'Exportar'),
      viewToggle: React.createElement('div', null, 'Toggle'),
      kpis: React.createElement('div', null, 'KPIs'),
      toolbar: React.createElement('div', null, 'Filtros'),
      children: 'gráficos',
      className: 'meu-dash',
    }
    expect(props.titulo).toBe('Dashboard')
    expect(props.kpis).toBeDefined()

    const result = PaginaDashboardGlobal(props)
    expect(result.props.className).toBe('meu-dash')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 4. COMPOSIÇÃO CRUZADA — Templates + Composição + Tokens
// ═══════════════════════════════════════════════════════════════════════════

describe('Composição cruzada — integração completa', () => {
  it('SecaoGlobal + GridGlobal dentro de PaginaFormularioGlobal', () => {
    const conteudo = React.createElement(
      SecaoGlobal,
      { titulo: 'Dados Gerais' },
      React.createElement(
        GridGlobal,
        { colunas: 2, gap: 4 },
        React.createElement('input', { type: 'text', placeholder: 'Nome' }),
        React.createElement('input', { type: 'text', placeholder: 'CNPJ' })
      )
    )

    const result = PaginaFormularioGlobal({
      titulo: 'Nova Empresa',
      aoSalvar: () => {},
      children: conteudo,
    })

    expect(result).toBeDefined()
    expect(result.props.layout).toBe('formulario')
  })

  it('GridGlobal + SecaoGlobal dentro de PaginaDashboardGlobal', () => {
    const conteudo = React.createElement(
      GridGlobal,
      { colunas: 2, gap: 4 },
      React.createElement(SecaoGlobal, { titulo: 'Vendas', card: true }, 'Gráfico 1'),
      React.createElement(SecaoGlobal, { titulo: 'Clientes', card: true }, 'Gráfico 2')
    )

    const result = PaginaDashboardGlobal({
      titulo: 'Dashboard',
      children: conteudo,
    })

    expect(result).toBeDefined()
  })

  it('StackGlobal + FlexGlobal compostos corretamente', () => {
    const result = StackGlobal({
      gap: 6,
      children: React.createElement(
        FlexGlobal,
        { justificar: 'between', alinhar: 'center' },
        React.createElement('h2', null, 'Título'),
        React.createElement('button', null, 'Ação')
      ),
    })

    expect(result.props.style.flexDirection).toBe('column')
    expect(result.props.style.gap).toBe('1.5rem')
  })

  it('FlexGlobal + StackGlobal aninhados (layout complexo)', () => {
    const sidebar = StackGlobal({
      gap: 2,
      children: React.createElement('nav', null, 'menu'),
      style: { width: '250px' },
    })

    const main = StackGlobal({
      gap: 4,
      children: React.createElement('main', null, 'conteúdo'),
      style: { flex: '1' },
    })

    const result = FlexGlobal({
      gap: 6,
      alinhar: 'stretch',
      children: [sidebar, main],
    })

    expect(result.props.style.flexDirection).toBe('row')
    expect(result.props.style.gap).toBe('1.5rem')
  })

  it('tokens de cores são compatíveis com Configurador', () => {
    expect(cores.accent).toBe('#818cf8')
    expect(cores.bgBody).toBe('#0f172a')
    expect(cores.bgBase).toBe('#1e293b')
    expect(cores.success).toBe('#22c55e')
    expect(cores.danger).toBe('#ef4444')
  })

  it('tokens de espaçamento são consistentes com gap dos componentes', () => {
    const stack = StackGlobal({ gap: 4, children: null })
    expect(stack.props.style.gap).toBe(espacamento[4])

    const flex = FlexGlobal({ gap: 6, children: null })
    expect(flex.props.style.gap).toBe(espacamento[6])

    const grid = GridGlobal({ gap: 8, children: null })
    expect(grid.props.style.gap).toBe(espacamento[8])
  })

  it('raios são strings px válidas para uso em estilos', () => {
    expect(raios.pill).toBe('9999px')
    expect(raios.lg).toBe('12px')
    expect(raios.md).toBe('8px')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 5. FORMULÁRIO COMPLETO — Cenário real
// ═══════════════════════════════════════════════════════════════════════════

describe('Cenário real — formulário de cadastro completo', () => {
  it('monta formulário com múltiplas seções e grid de campos', () => {
    const formulario = PaginaFormularioGlobal({
      titulo: 'Nova Empresa',
      subtitulo: 'Cadastre uma nova empresa filha no sistema.',
      aoSalvar: () => {},
      aoCancelar: () => {},
      salvando: false,
      children: React.createElement(
        StackGlobal,
        { gap: 6 },
        // Seção 1: Dados Gerais
        React.createElement(
          SecaoGlobal,
          { titulo: 'Dados Gerais', subtitulo: 'Informações da empresa' },
          React.createElement(
            GridGlobal,
            { colunas: 2, gap: 4 },
            React.createElement('input', { placeholder: 'Razão Social' }),
            React.createElement('input', { placeholder: 'CNPJ' }),
            React.createElement('input', { placeholder: 'Inscrição Estadual' }),
            React.createElement('input', { placeholder: 'Email' })
          )
        ),
        // Seção 2: Endereço
        React.createElement(
          SecaoGlobal,
          { titulo: 'Endereço' },
          React.createElement(
            GridGlobal,
            { colunas: 3, gap: 4 },
            React.createElement('input', { placeholder: 'CEP' }),
            React.createElement('input', { placeholder: 'Cidade' }),
            React.createElement('input', { placeholder: 'Estado' })
          )
        ),
        // Seção 3: Configurações
        React.createElement(
          SecaoGlobal,
          { titulo: 'Configurações', card: true },
          React.createElement(
            FlexGlobal,
            { justificar: 'between', alinhar: 'center' },
            React.createElement('span', null, 'Ativo'),
            React.createElement('input', { type: 'checkbox' })
          )
        )
      ),
    })

    expect(formulario).toBeDefined()
    expect(formulario.props.layout).toBe('formulario')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 6. DASHBOARD COMPLETO — Cenário real
// ═══════════════════════════════════════════════════════════════════════════

describe('Cenário real — dashboard completo', () => {
  it('monta dashboard com KPIs + gráficos em grid', () => {
    const dashboard = PaginaDashboardGlobal({
      titulo: 'Dashboard Comercial',
      subtitulo: 'Visão geral do período',
      kpis: React.createElement(
        FlexGlobal,
        { gap: 4, wrap: true },
        React.createElement('div', { className: 'kpi-card' }, 'Receita: R$ 150k'),
        React.createElement('div', { className: 'kpi-card' }, 'Clientes: 342'),
        React.createElement('div', { className: 'kpi-card' }, 'Conversão: 12.5%'),
        React.createElement('div', { className: 'kpi-card' }, 'Tickets: 18')
      ),
      children: React.createElement(
        StackGlobal,
        { gap: 6 },
        React.createElement(
          GridGlobal,
          { colunas: 2, gap: 4 },
          React.createElement(SecaoGlobal, { titulo: 'Vendas por Mês', card: true }, 'Gráfico'),
          React.createElement(SecaoGlobal, { titulo: 'Top Produtos', card: true }, 'Gráfico')
        ),
        React.createElement(
          SecaoGlobal,
          { titulo: 'Últimas Transações', card: true },
          'Tabela de transações aqui'
        )
      ),
    })

    expect(dashboard).toBeDefined()
    expect(dashboard.props.layout).toBe('lista')
    expect(dashboard.props.stats).toBeDefined()
  })
})
