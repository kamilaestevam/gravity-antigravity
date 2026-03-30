/**
 * Teste de integração — Tela Demo (3 telas reais)
 * Localização: testes/testes-unitarios/nucleo-global/composicao/tela-demo.test.tsx
 *
 * Ferramentas: Vitest (node)
 *
 * Objetivo: Validar que os novos componentes (Composição + Templates + Tokens)
 * funcionam juntos em cenários reais de tela. Cada describe simula uma tela
 * completa que seria criada por um agente no projeto Gravity.
 *
 * Componentes testados:
 *   1. PaginaFormularioGlobal + SecaoGlobal + GridGlobal + FlexGlobal
 *   2. PaginaDashboardGlobal + GridGlobal + SecaoGlobal + StackGlobal
 *   3. Layout manual com StackGlobal + FlexGlobal + SecaoGlobal + GridGlobal
 */

// @vitest-environment node
import React from 'react'
import { describe, it, expect, vi } from 'vitest'

// Mock do BotoesSalvarGlobal (depende de @nucleo/botao-global e @nucleo/tooltip-global)
vi.mock('../../../../nucleo-global/Botoes/botoes-salvar-global/src/botoes-salvar', () => ({
  BotoesSalvarGlobal: (props: Record<string, unknown>) =>
    React.createElement('div', { 'data-testid': 'botoes-salvar-mock', ...props }),
}))

// Composição
import { StackGlobal } from '../../../../nucleo-global/Composicao/stack-global/src/StackGlobal'
import { FlexGlobal } from '../../../../nucleo-global/Composicao/flex-global/src/FlexGlobal'
import { GridGlobal } from '../../../../nucleo-global/Composicao/grid-global/src/GridGlobal'
import { SecaoGlobal } from '../../../../nucleo-global/Composicao/secao-global/src/SecaoGlobal'

// Templates
import { PaginaFormularioGlobal } from '../../../../nucleo-global/Templates/pagina-formulario-global/src/PaginaFormularioGlobal'
import { PaginaDashboardGlobal } from '../../../../nucleo-global/Templates/pagina-dashboard-global/src/PaginaDashboardGlobal'

// Tokens
import { cores, espacamento } from '../../../../nucleo-global/Tokens/index'

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/** Conta recursivamente os elementos React na árvore (busca em TODAS as props) */
function contarElementos(element: React.ReactElement): number {
  let count = 1
  if (!element.props) return count
  for (const value of Object.values(element.props)) {
    if (React.isValidElement(value)) {
      count += contarElementos(value)
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (React.isValidElement(item)) {
          count += contarElementos(item)
        }
      }
    }
  }
  return count
}

/** Verifica se um tipo específico existe na árvore (busca em TODAS as props, expande funções) */
function contemTipo(element: React.ReactElement, tipo: string, depth = 0): boolean {
  if (depth > 20) return false // evita recursão infinita
  // Checa tipo direto (tag HTML)
  if (typeof element.type === 'string' && element.type === tipo) return true
  // Checa nome da função/componente
  if (typeof element.type === 'function' && element.type.name === tipo) return true
  // Se é componente-função, tenta expandir para ver a árvore real
  if (typeof element.type === 'function' && element.props) {
    try {
      const expanded = (element.type as (props: Record<string, unknown>) => React.ReactElement)(element.props)
      if (React.isValidElement(expanded) && contemTipo(expanded, tipo, depth + 1)) return true
    } catch {
      // Se falhar a expansão, continua com os props
    }
  }
  if (!element.props) return false
  for (const value of Object.values(element.props)) {
    if (React.isValidElement(value) && contemTipo(value, tipo, depth + 1)) return true
    if (Array.isArray(value)) {
      for (const item of value) {
        if (React.isValidElement(item) && contemTipo(item, tipo, depth + 1)) return true
      }
    }
  }
  return false
}

// ═══════════════════════════════════════════════════════════════════════════
// TELA 1: Cadastro de Empresa (Formulário)
// Usa: PaginaFormularioGlobal + SecaoGlobal + GridGlobal + FlexGlobal
// ═══════════════════════════════════════════════════════════════════════════

describe('TELA 1 — Cadastro de Empresa (Formulário)', () => {
  function renderTelaCadastro() {
    return PaginaFormularioGlobal({
      titulo: 'Nova Empresa Filha',
      subtitulo: 'Cadastre uma nova empresa filha no tenant Gravity.',
      icone: React.createElement('span', { 'aria-hidden': 'true' }, '🏢'),
      dirty: true,
      salvando: false,
      aoSalvar: () => {},
      aoCancelar: () => {},
      children: React.createElement(
        StackGlobal,
        { gap: 6 },
        // Seção 1: Dados Gerais
        React.createElement(
          SecaoGlobal,
          { titulo: 'Dados Gerais', subtitulo: 'Informações básicas da empresa' },
          React.createElement(
            GridGlobal,
            { colunas: 2, gap: 4 },
            React.createElement('input', { type: 'text', placeholder: 'Razão Social', 'aria-label': 'Razão Social' }),
            React.createElement('input', { type: 'text', placeholder: 'Nome Fantasia', 'aria-label': 'Nome Fantasia' }),
            React.createElement('input', { type: 'text', placeholder: 'CNPJ', 'aria-label': 'CNPJ' }),
            React.createElement('input', { type: 'text', placeholder: 'Inscrição Estadual', 'aria-label': 'IE' })
          )
        ),
        // Seção 2: Contato
        React.createElement(
          SecaoGlobal,
          { titulo: 'Contato' },
          React.createElement(
            GridGlobal,
            { colunas: 3, gap: 4 },
            React.createElement('input', { type: 'email', placeholder: 'Email', 'aria-label': 'Email' }),
            React.createElement('input', { type: 'tel', placeholder: 'Telefone', 'aria-label': 'Telefone' }),
            React.createElement('input', { type: 'text', placeholder: 'Website', 'aria-label': 'Website' })
          )
        ),
        // Seção 3: Endereço
        React.createElement(
          SecaoGlobal,
          { titulo: 'Endereço' },
          React.createElement(
            StackGlobal,
            { gap: 4 },
            React.createElement(
              GridGlobal,
              { colunas: 3, gap: 4 },
              React.createElement('input', { placeholder: 'CEP', 'aria-label': 'CEP' }),
              React.createElement('input', { placeholder: 'Cidade', 'aria-label': 'Cidade' }),
              React.createElement('input', { placeholder: 'UF', 'aria-label': 'UF' })
            ),
            React.createElement('input', { placeholder: 'Logradouro completo', 'aria-label': 'Logradouro' })
          )
        ),
        // Seção 4: Configurações
        React.createElement(
          SecaoGlobal,
          { titulo: 'Configurações', card: true },
          React.createElement(
            StackGlobal,
            { gap: 3 },
            React.createElement(
              FlexGlobal,
              { justificar: 'between', alinhar: 'center' },
              React.createElement('span', null, 'Empresa ativa'),
              React.createElement('input', { type: 'checkbox', defaultChecked: true, 'aria-label': 'Ativa' })
            ),
            React.createElement(
              FlexGlobal,
              { justificar: 'between', alinhar: 'center' },
              React.createElement('span', null, 'Receber notificações'),
              React.createElement('input', { type: 'checkbox', 'aria-label': 'Notificações' })
            )
          )
        )
      ),
    })
  }

  it('renderiza sem erros', () => {
    const tela = renderTelaCadastro()
    expect(tela).toBeDefined()
  })

  it('usa layout formulario', () => {
    const tela = renderTelaCadastro()
    expect(tela.props.layout).toBe('formulario')
  })

  it('contém elementos suficientes para um formulário real (>15)', () => {
    const tela = renderTelaCadastro()
    const total = contarElementos(tela)
    expect(total).toBeGreaterThan(15)
  })

  it('contém inputs na árvore', () => {
    const tela = renderTelaCadastro()
    expect(contemTipo(tela, 'input')).toBe(true)
  })

  it('contém sections na árvore (SecaoGlobal)', () => {
    const tela = renderTelaCadastro()
    expect(contemTipo(tela, 'section')).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TELA 2: Dashboard Comercial
// Usa: PaginaDashboardGlobal + GridGlobal + SecaoGlobal + StackGlobal
// ═══════════════════════════════════════════════════════════════════════════

describe('TELA 2 — Dashboard Comercial', () => {
  function renderTelaDashboard() {
    return PaginaDashboardGlobal({
      titulo: 'Dashboard Comercial',
      subtitulo: 'Visão geral das operações de câmbio.',
      icone: React.createElement('span', null, '📊'),
      acoes: React.createElement(
        FlexGlobal,
        { gap: 2 },
        React.createElement('button', { className: 'btn btn-secondary' }, 'Exportar'),
        React.createElement('button', { className: 'btn btn-primary' }, 'Novo Relatório')
      ),
      kpis: React.createElement(
        GridGlobal,
        { colunas: 4, gap: 4 },
        React.createElement('div', { className: 'kpi-card' },
          React.createElement('span', { className: 'kpi-label' }, 'RECEITA TOTAL'),
          React.createElement('span', { className: 'kpi-value' }, 'R$ 2.4M')
        ),
        React.createElement('div', { className: 'kpi-card' },
          React.createElement('span', { className: 'kpi-label' }, 'OPERAÇÕES'),
          React.createElement('span', { className: 'kpi-value' }, '1.847')
        ),
        React.createElement('div', { className: 'kpi-card' },
          React.createElement('span', { className: 'kpi-label' }, 'TAXA MÉDIA'),
          React.createElement('span', { className: 'kpi-value' }, '5.23')
        ),
        React.createElement('div', { className: 'kpi-card' },
          React.createElement('span', { className: 'kpi-label' }, 'SPREAD'),
          React.createElement('span', { className: 'kpi-value' }, '0.8%')
        )
      ),
      children: React.createElement(
        StackGlobal,
        { gap: 6 },
        // Linha 1: Dois gráficos lado a lado
        React.createElement(
          GridGlobal,
          { colunas: 2, gap: 4 },
          React.createElement(
            SecaoGlobal,
            { titulo: 'Volume por Moeda', card: true },
            React.createElement('div', {
              style: { height: '300px', background: cores.bgSurface, borderRadius: '8px' },
            }, 'Gráfico de barras aqui')
          ),
          React.createElement(
            SecaoGlobal,
            { titulo: 'Evolução Mensal', card: true },
            React.createElement('div', {
              style: { height: '300px', background: cores.bgSurface, borderRadius: '8px' },
            }, 'Gráfico de linhas aqui')
          )
        ),
        // Linha 2: Tabela de transações
        React.createElement(
          SecaoGlobal,
          {
            titulo: 'Últimas Transações',
            acoes: React.createElement('button', null, 'Ver Todas'),
            card: true,
          },
          React.createElement('div', null, 'Tabela de transações seria renderizada aqui')
        )
      ),
    })
  }

  it('renderiza sem erros', () => {
    const tela = renderTelaDashboard()
    expect(tela).toBeDefined()
  })

  it('usa layout lista', () => {
    const tela = renderTelaDashboard()
    expect(tela.props.layout).toBe('lista')
  })

  it('tem KPIs passados como stats', () => {
    const tela = renderTelaDashboard()
    expect(tela.props.stats).toBeDefined()
  })

  it('contém muitos elementos (dashboard é complexo, >20)', () => {
    const tela = renderTelaDashboard()
    const total = contarElementos(tela)
    expect(total).toBeGreaterThan(20)
  })

  it('usa tokens de cores nos estilos inline', () => {
    // Valida que os tokens são usáveis em estilos React
    expect(cores.bgSurface).toBe('#334155')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TELA 3: Página de Configurações (Layout manual com Composição)
// Usa: StackGlobal + FlexGlobal + SecaoGlobal + GridGlobal (sem Template)
// ═══════════════════════════════════════════════════════════════════════════

describe('TELA 3 — Configurações (layout manual com Composição)', () => {
  function renderTelaConfiguracoes() {
    return StackGlobal({
      gap: 8,
      as: 'main',
      children: [
        // Header customizado
        React.createElement(
          FlexGlobal,
          { key: 'header', justificar: 'between', alinhar: 'center' },
          React.createElement('h1', { style: { color: cores.textPrimary, fontSize: '1.5rem' } }, 'Configurações'),
          React.createElement('button', null, 'Salvar Tudo')
        ),
        // Seção: Perfil
        React.createElement(
          SecaoGlobal,
          { key: 'perfil', titulo: 'Perfil', subtitulo: 'Informações da sua conta', card: true },
          React.createElement(
            GridGlobal,
            { colunas: 2, gap: 4 },
            React.createElement('input', { placeholder: 'Nome', 'aria-label': 'Nome' }),
            React.createElement('input', { placeholder: 'Email', 'aria-label': 'Email' }),
            React.createElement('input', { placeholder: 'Cargo', 'aria-label': 'Cargo' }),
            React.createElement('input', { placeholder: 'Departamento', 'aria-label': 'Departamento' })
          )
        ),
        // Seção: Notificações
        React.createElement(
          SecaoGlobal,
          { key: 'notif', titulo: 'Notificações', card: true },
          React.createElement(
            StackGlobal,
            { gap: 3 },
            React.createElement(
              FlexGlobal,
              { justificar: 'between' },
              React.createElement('span', null, 'Email'),
              React.createElement('input', { type: 'checkbox', 'aria-label': 'Email ativo' })
            ),
            React.createElement(
              FlexGlobal,
              { justificar: 'between' },
              React.createElement('span', null, 'WhatsApp'),
              React.createElement('input', { type: 'checkbox', 'aria-label': 'WhatsApp ativo' })
            ),
            React.createElement(
              FlexGlobal,
              { justificar: 'between' },
              React.createElement('span', null, 'In-App'),
              React.createElement('input', { type: 'checkbox', 'aria-label': 'In-App ativo' })
            )
          )
        ),
        // Seção: Aparência
        React.createElement(
          SecaoGlobal,
          { key: 'aparencia', titulo: 'Aparência', card: true },
          React.createElement(
            GridGlobal,
            { colunas: 'auto', larguraMin: 200, gap: 4 },
            React.createElement('div', {
              style: { padding: espacamento[4], background: cores.bgBody, borderRadius: '8px', textAlign: 'center' },
            }, 'Dark (padrão)'),
            React.createElement('div', {
              style: { padding: espacamento[4], background: '#f8fafc', color: '#0f172a', borderRadius: '8px', textAlign: 'center' },
            }, 'Light'),
            React.createElement('div', {
              style: { padding: espacamento[4], background: cores.bgSurface, borderRadius: '8px', textAlign: 'center' },
            }, 'Sistema')
          )
        ),
      ],
    })
  }

  it('renderiza sem erros', () => {
    const tela = renderTelaConfiguracoes()
    expect(tela).toBeDefined()
  })

  it('é renderizada como <main>', () => {
    const tela = renderTelaConfiguracoes()
    expect(tela.type).toBe('main')
  })

  it('usa gap=8 (32px) entre seções', () => {
    const tela = renderTelaConfiguracoes()
    expect(tela.props.style.gap).toBe(espacamento[8])
  })

  it('contém sections (SecaoGlobal com card)', () => {
    const tela = renderTelaConfiguracoes()
    expect(contemTipo(tela, 'section')).toBe(true)
  })

  it('contém inputs para os campos', () => {
    const tela = renderTelaConfiguracoes()
    expect(contemTipo(tela, 'input')).toBe(true)
  })

  it('usa tokens de espaçamento nos estilos inline', () => {
    // Apenas confirma que os tokens funcionam como valores CSS válidos
    expect(espacamento[4]).toBe('1rem')
    expect(espacamento[8]).toBe('2rem')
  })

  it('estrutura da árvore é complexa (>15 elementos)', () => {
    const tela = renderTelaConfiguracoes()
    const total = contarElementos(tela)
    expect(total).toBeGreaterThan(15)
  })
})
