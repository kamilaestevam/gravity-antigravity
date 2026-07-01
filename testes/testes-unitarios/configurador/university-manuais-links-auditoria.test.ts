import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  CONFIGURADOR_MANUAL_ITENS,
  DOC_CONFIGURADOR_SECOES,
  montarItensSumarioManual,
  type DocSecao,
} from '../../../servicos-global/configurador/src/pages/university/manual-configurador-conteudo'
import { DOC_HUB_SECAO } from '../../../servicos-global/configurador/src/pages/university/manual-hub-conteudo'
import { DOC_NAVEGACAO_SECAO } from '../../../servicos-global/configurador/src/pages/university/manual-navegacao-conteudo'
import { DOC_STORE_SECAO } from '../../../servicos-global/configurador/src/pages/university/manual-store-conteudo'

const RAIZ_PAGES = join(process.cwd(), 'servicos-global/configurador/src/pages')

const ROTAS_MANUAIS_PUBLICADOS = new Set([
  '/university-gravity/docs/login',
  '/university-gravity/docs/navegacao',
  '/university-gravity/docs/hub',
  '/university-gravity/docs/store',
  ...CONFIGURADOR_MANUAL_ITENS.map(
    item => `/university-gravity/docs/configurador/${item.pathSeg}`,
  ),
])

const LINK_INTERNO_RE = /\{\{link:([^|]+)\|[^}]+\}\}/g

function extrairLinksInternosDeTexto(texto: string): string[] {
  const rotas: string[] = []
  let match: RegExpExecArray | null
  while ((match = LINK_INTERNO_RE.exec(texto)) !== null) {
    rotas.push(match[1])
  }
  return rotas
}

function coletarStringsProfundas(valor: unknown, acumulado: string[]): void {
  if (typeof valor === 'string') {
    acumulado.push(valor)
    return
  }
  if (Array.isArray(valor)) {
    valor.forEach(item => coletarStringsProfundas(item, acumulado))
    return
  }
  if (valor && typeof valor === 'object') {
    Object.values(valor).forEach(item => coletarStringsProfundas(item, acumulado))
  }
}

function extrairLinksInternosDeSecao(secao: DocSecao): string[] {
  const textos: string[] = []
  coletarStringsProfundas(secao, textos)
  return textos.flatMap(extrairLinksInternosDeTexto)
}

function auditarSumarioSecao(secao: DocSecao, rotulo: string): void {
  const itens = montarItensSumarioManual(secao)
  const esperado = 1 + (secao.fluxos?.length ?? 0)
  expect(itens, `${rotulo}: quantidade de itens do sumário`).toHaveLength(esperado)

  itens.forEach((item, indice) => {
    const numEsperado = indice + 1
    expect(item.num, `${rotulo} item ${numEsperado}`).toBe(numEsperado)
    expect(item.titulo.trim(), `${rotulo} título vazio no item ${numEsperado}`).not.toBe('')
  })

  const titulosFluxo = secao.fluxos?.map(f => f.titulo) ?? []
  const duplicados = titulosFluxo.filter((t, i) => titulosFluxo.indexOf(t) !== i)
  expect(duplicados, `${rotulo}: títulos de fluxo duplicados`).toEqual([])
}

function auditarArquivosManuaisNoDisco(): string[] {
  const arquivos = readdirSync(join(RAIZ_PAGES, 'university'))
    .filter(nome => nome.endsWith('.ts') && nome.includes('manual'))
  arquivos.push('UniversityGravity.tsx')

  const rotas: string[] = []
  for (const arquivo of arquivos) {
    const caminho = arquivo === 'UniversityGravity.tsx'
      ? join(RAIZ_PAGES, arquivo)
      : join(RAIZ_PAGES, 'university', arquivo)
    const conteudo = readFileSync(caminho, 'utf8')
    rotas.push(...extrairLinksInternosDeTexto(conteudo))
  }
  return [...new Set(rotas)]
}

describe('University — auditoria de links Manuais', () => {
  it('sumário do manual Usuários inclui Permissões do usuário no item 5', () => {
    const secao = DOC_CONFIGURADOR_SECOES.find(s => s.titulo === 'Usuários')
    expect(secao).toBeDefined()
    const itens = montarItensSumarioManual(secao!)
    expect(itens[4]).toEqual({ num: 5, titulo: 'Permissões do usuário' })
  })

  it('sumários de Hub, Store e Navegação batem com a quantidade de fluxos', () => {
    auditarSumarioSecao(DOC_HUB_SECAO, 'Hub')
    auditarSumarioSecao(DOC_STORE_SECAO, 'Store')
    auditarSumarioSecao(DOC_NAVEGACAO_SECAO, 'Navegação')
  })

  it('sumários de todas as páginas do Configurador batem com a quantidade de fluxos', () => {
    for (const item of CONFIGURADOR_MANUAL_ITENS) {
      const secao = DOC_CONFIGURADOR_SECOES.find(s => s.num === item.secaoNum)
      expect(secao, `seção ${item.pathSeg}`).toBeDefined()
      auditarSumarioSecao(secao!, `Configurador/${item.pathSeg}`)
    }
  })

  it('links internos {{link:...}} apontam para rotas válidas da University', () => {
    const rotasArquivos = auditarArquivosManuaisNoDisco()
    const rotasSecoes = [
      ...extrairLinksInternosDeSecao(DOC_HUB_SECAO),
      ...extrairLinksInternosDeSecao(DOC_STORE_SECAO),
      ...extrairLinksInternosDeSecao(DOC_NAVEGACAO_SECAO),
      ...DOC_CONFIGURADOR_SECOES.flatMap(extrairLinksInternosDeSecao),
    ]
    const rotas = [...new Set([...rotasArquivos, ...rotasSecoes])]

    expect(rotas.length).toBeGreaterThan(0)
    for (const rota of rotas) {
      const rotaBase = rota.split('#')[0]
      expect(ROTAS_MANUAIS_PUBLICADOS.has(rotaBase), `rota inválida: ${rota}`).toBe(true)
    }
  })
})
