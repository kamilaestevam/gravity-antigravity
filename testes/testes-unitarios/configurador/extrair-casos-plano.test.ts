import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { extrairCasosDoPlano } from '../../../servicos-global/configurador/server/lib/extrair-casos-plano.js'

const PLANO_PEDIDO_LISTA = resolve(
  import.meta.dirname,
  '../../testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/plano-teste-em-tela.md',
)

describe('extrairCasosDoPlano — roteiro ETAPA', () => {
  it('extrai ETAPAs com número, travessão e passos em tabela markdown', () => {
    const conteudo = readFileSync(PLANO_PEDIDO_LISTA, 'utf-8')
    const casos = extrairCasosDoPlano(conteudo, 'plano-teste-em-tela.md')
    const roteiro = casos.filter(c => c.secao === 'Roteiro')

    expect(roteiro.length).toBeGreaterThanOrEqual(28)

    const titulos = [...new Set(roteiro.map(c => c.titulo))]
    expect(titulos.some(t => t.includes('IMPORTADOR'))).toBe(true)
    expect(titulos.some(t => t.includes('EXPORTADOR'))).toBe(true)
    expect(titulos.some(t => t.includes('NCM'))).toBe(true)
    expect(titulos.some(t => t.includes('TIPO DE OPERAÇÃO'))).toBe(true)
  })
})
