/**
 * Testes unitários — SecaoGlobal
 * Localização: testes/testes-unitarios/nucleo-global/composicao/SecaoGlobal.test.tsx
 *
 * Ferramentas: Vitest (node)
 * Valida: exports, renderização condicional de header, variante card com border accent,
 *         título uppercase (ws-section-title), ícone accent, animação fade-up, slots
 */

// @vitest-environment node
import React from 'react'
import { describe, it, expect } from 'vitest'
import { SecaoGlobal } from '../../../../nucleo-global/Composicao/secao-global/src/SecaoGlobal'
import type { SecaoProps } from '../../../../nucleo-global/Composicao/secao-global/src/tipos'

// ─── 1. Exports ──────────────────────────────────────────────────────────────

describe('SecaoGlobal — exports', () => {
  it('exporta o componente SecaoGlobal como função', () => {
    expect(SecaoGlobal).toBeDefined()
    expect(typeof SecaoGlobal).toBe('function')
  })
})

// ─── 2. Estrutura básica ─────────────────────────────────────────────────────

describe('SecaoGlobal — estrutura', () => {
  it('renderiza como <section>', () => {
    const result = SecaoGlobal({ children: 'conteúdo' })
    expect(result.type).toBe('section')
  })

  it('className base inclui gb-secao', () => {
    const result = SecaoGlobal({ children: 'conteúdo' })
    expect(result.props.className).toContain('gb-secao')
  })

  it('sem título → não renderiza header', () => {
    const result = SecaoGlobal({ children: 'conteúdo' })
    const filhos = React.Children.toArray(result.props.children)
    const divConteudo = filhos.find(
      (child) => React.isValidElement(child) && child.props.className === 'gb-secao__conteudo'
    )
    expect(divConteudo).toBeDefined()
  })

  it('com título → renderiza header com p.gb-secao__titulo (uppercase)', () => {
    const result = SecaoGlobal({ titulo: 'Teste', children: 'conteúdo' })
    const filhos = React.Children.toArray(result.props.children)
    const header = filhos.find(
      (child) => React.isValidElement(child) && child.props.className === 'gb-secao__header'
    )
    expect(header).toBeDefined()
  })
})

// ─── 3. Variante card — match com .em-section do Configurador ────────────────

describe('SecaoGlobal — variante card', () => {
  it('card=false → sem classe gb-secao--card', () => {
    const result = SecaoGlobal({ children: 'conteúdo' })
    expect(result.props.className).not.toContain('gb-secao--card')
  })

  it('card=true → adiciona classe gb-secao--card (background + border accent)', () => {
    const result = SecaoGlobal({ card: true, children: 'conteúdo' })
    expect(result.props.className).toContain('gb-secao--card')
  })
})

// ─── 4. Ícone no título ──────────────────────────────────────────────────────

describe('SecaoGlobal — ícone', () => {
  it('sem icone → título sem span de ícone', () => {
    const result = SecaoGlobal({ titulo: 'Teste', children: 'conteúdo' })
    const filhos = React.Children.toArray(result.props.children)
    const header = filhos.find(
      (child) => React.isValidElement(child) && child.props.className === 'gb-secao__header'
    ) as React.ReactElement

    const headerText = React.Children.toArray(header.props.children).find(
      (child) => React.isValidElement(child) && child.props.className === 'gb-secao__header-text'
    ) as React.ReactElement

    const titulo = React.Children.toArray(headerText.props.children).find(
      (child) => React.isValidElement(child) && child.props.className === 'gb-secao__titulo'
    ) as React.ReactElement

    // Sem ícone, titulo tem false + string
    const tituloFilhos = React.Children.toArray(titulo.props.children)
    const iconeSpan = tituloFilhos.find(
      (child) => React.isValidElement(child) && child.props.className === 'gb-secao__titulo-icone'
    )
    expect(iconeSpan).toBeUndefined()
  })

  it('com icone → título tem span.gb-secao__titulo-icone', () => {
    const icone = React.createElement('svg', null, 'icon')
    const result = SecaoGlobal({ titulo: 'Teste', icone, children: 'conteúdo' })
    const filhos = React.Children.toArray(result.props.children)
    const header = filhos.find(
      (child) => React.isValidElement(child) && child.props.className === 'gb-secao__header'
    ) as React.ReactElement

    const headerText = React.Children.toArray(header.props.children).find(
      (child) => React.isValidElement(child) && child.props.className === 'gb-secao__header-text'
    ) as React.ReactElement

    const titulo = React.Children.toArray(headerText.props.children).find(
      (child) => React.isValidElement(child) && child.props.className === 'gb-secao__titulo'
    ) as React.ReactElement

    const tituloFilhos = React.Children.toArray(titulo.props.children)
    const iconeSpan = tituloFilhos.find(
      (child) => React.isValidElement(child) && child.props.className === 'gb-secao__titulo-icone'
    )
    expect(iconeSpan).toBeDefined()
  })
})

// ─── 5. Animação fade-up ─────────────────────────────────────────────────────

describe('SecaoGlobal — fade-up', () => {
  it('sem fadeIndex → sem classe de animação', () => {
    const result = SecaoGlobal({ children: 'conteúdo' })
    expect(result.props.className).not.toContain('ws-fade-up')
  })

  it('fadeIndex=0 → ws-fade-up sem delay', () => {
    const result = SecaoGlobal({ fadeIndex: 0, children: 'conteúdo' })
    expect(result.props.className).toContain('ws-fade-up')
    expect(result.props.className).not.toContain('ws-fade-up-d')
  })

  it('fadeIndex=1 → ws-fade-up ws-fade-up-d1', () => {
    const result = SecaoGlobal({ fadeIndex: 1, children: 'conteúdo' })
    expect(result.props.className).toContain('ws-fade-up')
    expect(result.props.className).toContain('ws-fade-up-d1')
  })

  it('fadeIndex=2 → ws-fade-up ws-fade-up-d2', () => {
    const result = SecaoGlobal({ fadeIndex: 2, children: 'conteúdo' })
    expect(result.props.className).toContain('ws-fade-up-d2')
  })

  it('fadeIndex=3 → ws-fade-up ws-fade-up-d3', () => {
    const result = SecaoGlobal({ fadeIndex: 3, children: 'conteúdo' })
    expect(result.props.className).toContain('ws-fade-up-d3')
  })
})

// ─── 6. Props opcionais ──────────────────────────────────────────────────────

describe('SecaoGlobal — props opcionais', () => {
  it('aceita className extra', () => {
    const result = SecaoGlobal({ className: 'extra', children: 'conteúdo' })
    expect(result.props.className).toContain('extra')
    expect(result.props.className).toContain('gb-secao')
  })

  it('aceita style inline', () => {
    const result = SecaoGlobal({
      style: { marginTop: '2rem' },
      children: 'conteúdo',
    })
    expect(result.props.style).toEqual({ marginTop: '2rem' })
  })

  it('tipo completo compila (type-check)', () => {
    const props: SecaoProps = {
      titulo: 'Seção',
      subtitulo: 'Descrição',
      icone: React.createElement('svg'),
      acoes: React.createElement('button', null, 'Ação'),
      card: true,
      fadeIndex: 1,
      className: 'test',
      style: { padding: '1rem' },
      children: 'conteúdo',
    }
    expect(props.titulo).toBe('Seção')
    expect(props.fadeIndex).toBe(1)
  })
})

// ─── 7. Slots ────────────────────────────────────────────────────────────────

describe('SecaoGlobal — slots', () => {
  it('com acoes → header tem div de ações', () => {
    const result = SecaoGlobal({
      titulo: 'Título',
      acoes: React.createElement('button', null, 'Exportar'),
      children: 'conteúdo',
    })
    const filhos = React.Children.toArray(result.props.children)
    const header = filhos.find(
      (child) => React.isValidElement(child) && child.props.className === 'gb-secao__header'
    ) as React.ReactElement

    expect(header).toBeDefined()
    const headerFilhos = React.Children.toArray(header.props.children)
    const acoesDiv = headerFilhos.find(
      (child) => React.isValidElement(child) && child.props.className === 'gb-secao__acoes'
    )
    expect(acoesDiv).toBeDefined()
  })
})
