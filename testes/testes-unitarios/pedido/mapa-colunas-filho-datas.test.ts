import { describe, it, expect } from 'vitest'

/**
 * @vitest-environment node
 *
 * Verifica que buildMapaColunasFilho contém entradas para TODAS as 44 colunas
 * de data replicáveis (pedido→item). Sem mapa, TabelaVirtualGlobal faz
 * fallback para String(valor) — exibindo datas em ISO cru ao invés de DD/MM/AAAA.
 */

const CHAVES_DATAS_REPLICAVEIS = [
  'data_prevista_pedido_pronto', 'data_confirmada_pedido_pronto', 'data_meta_pedido_pronto',
  'data_prevista_inspecao_pedido', 'data_confirmada_inspecao_pedido', 'data_meta_inspecao_pedido',
  'data_prevista_coleta_pedido', 'data_confirmada_coleta_pedido', 'data_meta_coleta_pedido',
  'data_consolidacao_pedido', 'data_transferencia_saldo_pedido',
  'data_prevista_recebimento_rascunho_pedido', 'data_confirmada_recebimento_rascunho_pedido', 'data_meta_recebimento_rascunho_pedido',
  'data_prevista_aprovacao_rascunho_pedido', 'data_confirmada_aprovacao_rascunho_pedido', 'data_meta_aprovacao_rascunho_pedido',
  'data_documento_pedido',
  'data_prevista_recebimento_rascunho_proforma', 'data_confirmada_recebimento_rascunho_proforma', 'data_meta_recebimento_rascunho_proforma',
  'data_prevista_aprovacao_rascunho_proforma', 'data_confirmada_aprovacao_rascunho_proforma', 'data_meta_aprovacao_rascunho_proforma',
  'data_prevista_envio_original_proforma', 'data_confirmada_envio_original_proforma', 'data_meta_envio_original_proforma',
  'data_prevista_recebimento_original_proforma', 'data_confirmada_recebimento_original_proforma', 'data_meta_recebimento_original_proforma',
  'data_proforma_invoice',
  'data_prevista_recebimento_rascunho_invoice', 'data_confirmada_recebimento_rascunho_invoice', 'data_meta_recebimento_rascunho_invoice',
  'data_prevista_aprovacao_rascunho_invoice', 'data_confirmada_aprovacao_rascunho_invoice', 'data_meta_aprovacao_rascunho_invoice',
  'data_prevista_envio_original_invoice', 'data_confirmada_envio_original_invoice', 'data_meta_envio_original_invoice',
  'data_prevista_recebimento_original_invoice', 'data_confirmada_recebimento_original_invoice', 'data_meta_recebimento_original_invoice',
  'data_invoice',
] as const

describe('buildMapaColunasFilho — datas replicáveis devem ter render com fmtData', () => {
  it('são exatamente 44 chaves de datas replicáveis', () => {
    expect(CHAVES_DATAS_REPLICAVEIS.length).toBe(44)
  })

  it('nenhuma chave duplicada', () => {
    const unicos = new Set(CHAVES_DATAS_REPLICAVEIS)
    expect(unicos.size).toBe(CHAVES_DATAS_REPLICAVEIS.length)
  })

  it('todas as chaves começam com data_', () => {
    for (const k of CHAVES_DATAS_REPLICAVEIS) {
      expect(k.startsWith('data_')).toBe(true)
    }
  })

  it('Pedidos.tsx contém todas as 44 chaves no buildMapaColunasFilho', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const pedidosPath = path.resolve(__dirname, '../../../servicos-global/produto/pedido/client/src/pages/Pedidos.tsx')
    const conteudo = fs.readFileSync(pedidosPath, 'utf-8')

    const inicioFn = conteudo.indexOf('function buildMapaColunasFilho')
    expect(inicioFn).toBeGreaterThan(-1)

    let depth = 0
    let fimFn = -1
    for (let i = inicioFn; i < conteudo.length; i++) {
      if (conteudo[i] === '{') depth++
      if (conteudo[i] === '}') {
        depth--
        if (depth === 0) { fimFn = i; break }
      }
    }
    expect(fimFn).toBeGreaterThan(inicioFn)

    const corpoFn = conteudo.slice(inicioFn, fimFn + 1)

    const faltando: string[] = []
    for (const chave of CHAVES_DATAS_REPLICAVEIS) {
      if (!corpoFn.includes(`'${chave}'`)) {
        faltando.push(chave)
      }
    }

    expect(faltando, `Chaves faltando no buildMapaColunasFilho: ${faltando.join(', ')}`).toEqual([])
  })

  it('todas as 44 chaves usam fmtData no render', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const pedidosPath = path.resolve(__dirname, '../../../servicos-global/produto/pedido/client/src/pages/Pedidos.tsx')
    const conteudo = fs.readFileSync(pedidosPath, 'utf-8')

    const inicioFn = conteudo.indexOf('function buildMapaColunasFilho')
    let depth = 0
    let fimFn = -1
    for (let i = inicioFn; i < conteudo.length; i++) {
      if (conteudo[i] === '{') depth++
      if (conteudo[i] === '}') { depth--; if (depth === 0) { fimFn = i; break } }
    }
    const corpoFn = conteudo.slice(inicioFn, fimFn + 1)

    expect(corpoFn).toContain('fmtData')
  })
})
