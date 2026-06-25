import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { extrairCasosDoPlano } from '../../../servicos-global/configurador/server/lib/extrair-casos-plano.js'

const PLANO_LISTA = resolve(
  process.cwd(),
  'testes/testes-em-tela/produto-gravity/pedido/lista/editar-salvar/plano-de-teste/plano-teste-em-tela.md',
)

describe('extrairCasosDoPlano', () => {
  it('lista-editar-salvar — extrai prints além de 01 e 02', () => {
    const conteudo = readFileSync(PLANO_LISTA, 'utf8')
    const casos = extrairCasosDoPlano(conteudo, 'plano-teste-em-tela.md')
    const prints = casos.filter(c => c.secao === 'Prints planejados')
    const roteiro = casos.filter(c => c.secao === 'Roteiro')

    expect(prints.length).toBeGreaterThan(10)
    expect(prints.some(p => p.ordem === '03' || p.titulo.includes('03-editar-pedido'))).toBe(true)
    expect(prints.some(p => p.ordem === '29' || p.ordem.startsWith('29.'))).toBe(true)
    expect(prints.some(p => p.titulo.includes('porto-origem'))).toBe(true)
    expect(roteiro.length).toBeGreaterThan(20)
    const etapas = [...new Set(roteiro.map(r => r.titulo))]
    expect(etapas.some(t => t.includes('Nº PEDIDO'))).toBe(true)
    expect(etapas.some(t => t.includes('WORKSPACE'))).toBe(true)
    expect(etapas.some(t => t.includes('TIPO DE OPERAÇÃO'))).toBe(true)
    expect(etapas.some(t => t.includes('STATUS'))).toBe(true)
    expect(etapas.some(t => t.includes('IMPORTADOR') && !t.includes('REFERÊNCIA'))).toBe(true)
    expect(etapas.some(t => t.includes('EXPORTADOR') && !t.includes('REFERÊNCIA'))).toBe(true)
    expect(etapas.some(t => t.includes('REFERÊNCIA IMPORTADOR'))).toBe(true)
    expect(etapas.some(t => t.includes('REFERÊNCIA EXPORTADOR'))).toBe(true)
    expect(etapas.some(t => t.includes('INCOTERM'))).toBe(true)
    expect(etapas.some(t => t.includes('DESCRIÇÃO'))).toBe(true)
    expect(etapas.some(t => t.includes('PORTO DE ORIGEM'))).toBe(true)
    expect(etapas.some(t => t.includes('NCM'))).toBe(true)
    expect(etapas.some(t => t.includes('MOEDA DO PEDIDO/ITEM'))).toBe(true)
    expect(etapas.some(t => t.includes('VALOR TOTAL DO PEDIDO/ITEM'))).toBe(true)

    const passosNcm = roteiro.filter(x => x.titulo.includes('NCM'))
    expect(passosNcm.map(p => p.ordem)).toEqual(
      expect.arrayContaining(['35', '36', '37', '38', '39', '40', '41']),
    )

    const passosMoeda = roteiro.filter(x => x.titulo.includes('MOEDA DO PEDIDO/ITEM'))
    expect(passosMoeda.map(p => p.ordem)).toEqual(
      expect.arrayContaining(['56', '57', '58', '59', '60', '61']),
    )

    const passosValor = roteiro.filter(x => x.titulo.includes('VALOR TOTAL DO PEDIDO/ITEM'))
    expect(passosValor.map(p => p.ordem)).toEqual(
      expect.arrayContaining(['62', '63', '64', '65', '66']),
    )

    expect(casos.length).toBeGreaterThanOrEqual(190)

    const passo83 = roteiro.find(c => c.ordem === '83' && c.titulo.includes('QTD. TRANSFERIDA'))
    expect(passo83).toBeDefined()
    expect(passo83?.acao).toContain('Hover célula')
    expect(passo83?.aprovadoQuando).toContain('83-qtd-transf-cursor-pedido.png')

    const passosExpandidos = roteiro.filter(c => c.titulo.includes('Novo Pedido (Split)'))
    expect(passosExpandidos.map(p => p.ordem)).toEqual(
      expect.arrayContaining(['95', '96']),
    )
  })
})
