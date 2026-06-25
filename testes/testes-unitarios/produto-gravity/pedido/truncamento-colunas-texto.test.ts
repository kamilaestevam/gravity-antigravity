import { describe, it, expect } from 'vitest'

/**
 * @vitest-environment node
 *
 * Verifica que todas as colunas de texto nos 3 arquivos de colunas do Pedido
 * possuem truncamento (50 chars + Eye + tooltip) em vez de renderizar valor cru.
 *
 * Padrões aceitos como "com truncamento":
 *   - renderDescricaoTruncada(...)       ColunasFilho.tsx
 *   - renderTextoTruncado(...)           ColunasPai.tsx
 *   - truncarParaAgregado(...)           ColunasPai.tsx (dentro de renderAgregado)
 *   - .slice(0, 50)                      Pedidos.tsx (inline)
 *   - renderTextoC2(...)                 colunas do usuário — 150 chars
 *   - fmtData(...)                       colunas de data, não texto
 *   - fmtQuantidade(...)                 colunas numéricas
 *
 * Padrão rejeitado (render de texto cru):
 *   - <span>{row.campo}</span> sem nenhum wrapper de truncamento
 *   - render: (row) => row.campo  (retorno direto)
 */

import fs from 'fs'
import path from 'path'

function lerArquivo(relativo: string): string {
  const abs = path.resolve(__dirname, relativo)
  return fs.readFileSync(abs, 'utf-8')
}

describe('Truncamento de colunas texto — ColunasFilho.tsx', () => {
  const conteudo = lerArquivo('../../../servicos-global/produto/pedido/client/src/components/lista/ColunasFilho.tsx')

  it('contém helper renderDescricaoTruncada', () => {
    expect(conteudo).toContain('function renderDescricaoTruncada')
  })

  it('part_number usa truncamento (não renderiza raw)', () => {
    const match = conteudo.match(/key:\s*'part_number'[\s\S]*?render:\s*\([^)]*\)\s*=>\s*\{[\s\S]*?slice\(0,\s*50\)/)
    expect(match, 'part_number deve usar .slice(0, 50) para truncamento').not.toBeNull()
  })

  it('ncm usa truncamento (não renderiza raw)', () => {
    const match = conteudo.match(/key:\s*'ncm'[\s\S]*?render:\s*\([^)]*\)\s*=>\s*\{[\s\S]*?slice\(0,\s*50\)/)
    expect(match, 'ncm deve usar .slice(0, 50) para truncamento').not.toBeNull()
  })

  it('descricao_item usa renderDescricaoTruncada', () => {
    expect(conteudo).toContain("renderDescricaoTruncada(row.descricao_item")
  })

  it('buildMapaColunasFilho — nome_exportador usa renderDescricaoTruncada', () => {
    const inicioFn = conteudo.indexOf('export function buildMapaColunasFilho')
    expect(inicioFn).toBeGreaterThan(-1)

    let depth = 0
    let fimFn = -1
    for (let i = inicioFn; i < conteudo.length; i++) {
      if (conteudo[i] === '{') depth++
      if (conteudo[i] === '}') { depth--; if (depth === 0) { fimFn = i; break } }
    }
    const corpo = conteudo.slice(inicioFn, fimFn + 1)

    expect(corpo).toContain("nome_exportador")
    expect(corpo).toContain("renderDescricaoTruncada")
  })

  it('buildMapaColunasFilho — nome_importador usa renderDescricaoTruncada', () => {
    const inicioFn = conteudo.indexOf('export function buildMapaColunasFilho')
    let depth = 0
    let fimFn = -1
    for (let i = inicioFn; i < conteudo.length; i++) {
      if (conteudo[i] === '{') depth++
      if (conteudo[i] === '}') { depth--; if (depth === 0) { fimFn = i; break } }
    }
    const corpo = conteudo.slice(inicioFn, fimFn + 1)

    const exportadorIdx = corpo.indexOf("nome_exportador")
    const importadorIdx = corpo.indexOf("nome_importador")
    expect(importadorIdx).toBeGreaterThan(exportadorIdx)

    const importadorSection = corpo.slice(importadorIdx, importadorIdx + 1200)
    expect(importadorSection).toContain("renderDescricaoTruncada")
  })

  it('nenhuma coluna texto retorna valor raw sem wrapper', () => {
    const rawPatterns = [
      /render:\s*\([^)]*PedidoItem[^)]*\)\s*=>\s*<span[^>]*>\{row\.\w+\s*\?\?\s*'—'\}<\/span>/g,
    ]

    const falhas: string[] = []
    for (const pat of rawPatterns) {
      let m: RegExpExecArray | null
      while ((m = pat.exec(conteudo)) !== null) {
        falhas.push(m[0].trim().slice(0, 80))
      }
    }

    expect(falhas, `Colunas texto com render raw encontradas: ${falhas.join(' | ')}`).toEqual([])
  })

  const COLUNAS_COM_RENDER_DESCRICAO_TRUNCADA = [
    'descricao_item',
    'descricao_completa_item_pt',
    'descricao_completa_item_nf',
    'tipo_embalagem',
    'numero_lpco',
    'numero_certificado_origem',
    'grupo_item',
    'subgrupo_item',
    'campo_especial_item',
    'descricao_completa_item_en',
    'descricao_completa_item_es',
    'texto_posicao_ncm',
    'atributos_catalogo',
    'tipo_operacao_duimp',
    'descricao_resumida_duimp',
    'versao_produto_duimp',
    'atributos_duimp',
    'aplicacao_mercadoria_duimp',
    'condicao_mercadoria_duimp',
    'relacao_exportador_fabricante_duimp',
    'vinculacao_preco_duimp',
    'descricao_completa_duimp',
    'descricao_complementar_duimp',
    'codigo_ope_duimp',
    'nome_ope_duimp',
    'pais_ope_duimp',
    'codigo_ope_fabricante_duimp',
    'nome_ope_fabricante_duimp',
    'pais_fabricante_ope_duimp',
    'metodo_valoracao_duimp',
    'incoterm_duimp',
    'moeda_produto_duimp',
    'tipo_cobertura_cambial_duimp',
    'numero_rof_bacen_duimp',
    'motivo_sem_cobertura_duimp',
    'existe_tratamento_administrativo_duimp',
    'tipo_trat_adm_duimp',
    'orgao_trat_adm_duimp',
    'numero_lpco_trat_adm_duimp',
    'condicao_pagamento',
    'incoterm',
    'referencia_fabricante',
    'cobertura_cambial',
  ]

  it('colunas de texto com renderDescricaoTruncada estão todas presentes', () => {
    const faltando: string[] = []
    for (const col of COLUNAS_COM_RENDER_DESCRICAO_TRUNCADA) {
      if (!conteudo.includes(`renderDescricaoTruncada(row.${col}`)) {
        faltando.push(col)
      }
    }
    expect(faltando, `Colunas faltando renderDescricaoTruncada: ${faltando.join(', ')}`).toEqual([])
  })
})

describe('Truncamento de colunas texto — ColunasPai.tsx', () => {
  const conteudo = lerArquivo('../../../servicos-global/produto/pedido/client/src/components/lista/ColunasPai.tsx')

  it('contém helper renderTextoTruncado', () => {
    expect(conteudo).toContain('function renderTextoTruncado')
  })

  it('contém helper truncarParaAgregado', () => {
    expect(conteudo).toContain('function truncarParaAgregado')
  })

  it('id_workspace (nome) usa truncamento', () => {
    const wsIdx = conteudo.indexOf("key: 'id_workspace'")
    expect(wsIdx).toBeGreaterThan(-1)
    const section = conteudo.slice(wsIdx, wsIdx + 1000)
    expect(section).toContain('slice(0, 50)')
  })

  it('nome_exportador usa truncarParaAgregado', () => {
    expect(conteudo).toContain("truncarParaAgregado(row.nome_exportador")
  })

  it('nome_importador usa truncarParaAgregado', () => {
    expect(conteudo).toContain("truncarParaAgregado(row.nome_importador")
  })

  it('nome_fabricante usa truncarParaAgregado', () => {
    expect(conteudo).toContain("truncarParaAgregado(row.nome_fabricante")
  })

  it('referencia_importador usa truncarParaAgregado', () => {
    expect(conteudo).toContain("truncarParaAgregado(row.referencia_importador")
  })

  it('referencia_exportador usa truncarParaAgregado', () => {
    expect(conteudo).toContain("truncarParaAgregado(row.referencia_exportador")
  })

  it('referencia_fabricante usa truncarParaAgregado', () => {
    expect(conteudo).toContain("truncarParaAgregado(row.referencia_fabricante")
  })

  it('cobertura_cambial_valor_unico usa truncarParaAgregado', () => {
    expect(conteudo).toContain("truncarParaAgregado(row.cobertura_cambial_valor_unico")
  })

  it('condicao_pagamento usa truncarParaAgregado', () => {
    expect(conteudo).toContain("truncarParaAgregado(row.condicao_pagamento")
  })

  const COLUNAS_COM_RENDER_TEXTO_TRUNCADO = [
    'numero_proforma',
    'numero_invoice',
    'contrato_cambio_id_pedido',
    'pais_exportador',
    'estado_exportador',
    'cidade_exportador',
    'endereco_exportador',
    'zip_code_exportador',
    'exportador_ou_fabricante',
    'relacao_exportador_fabricante',
    'nome_contato_exportador',
    'email_contato_exportador',
    'whatsapp_contato_exportador',
    'cargo_contato_exportador',
    'departamento_contato_exportador',
    'pais_fabricante',
    'estado_fabricante',
    'cidade_fabricante',
    'endereco_fabricante',
    'zip_code_fabricante',
    'cnpj_raiz_empresa_responsavel',
    'codigo_ope',
    'situacao_ope',
    'versao_ope',
    'nome_ope',
    'pais_ope',
    'estado_ope',
    'cidade_ope',
    'endereco_ope',
    'zip_code_ope',
    'tin_ope',
    'email_ope',
  ]

  it('colunas de texto com renderTextoTruncado estão todas presentes', () => {
    const faltando: string[] = []
    for (const col of COLUNAS_COM_RENDER_TEXTO_TRUNCADO) {
      if (!conteudo.includes(`renderTextoTruncado(row.${col}`)) {
        faltando.push(col)
      }
    }
    expect(faltando, `Colunas faltando renderTextoTruncado: ${faltando.join(', ')}`).toEqual([])
  })

  it('nenhuma coluna texto retorna valor raw sem wrapper', () => {
    const rawPatterns = [
      /render:\s*\([^)]*Pedido[^)]*\)\s*=>\s*<span[^>]*>\{row\.\w+\s*\?\?\s*'—'\}<\/span>/g,
    ]

    const falhas: string[] = []
    for (const pat of rawPatterns) {
      let m: RegExpExecArray | null
      while ((m = pat.exec(conteudo)) !== null) {
        if (!m[0].includes('fmtData') && !m[0].includes('fmtQuantidade') && !m[0].includes('tabular-nums')) {
          falhas.push(m[0].trim().slice(0, 80))
        }
      }
    }

    expect(falhas, `Colunas texto com render raw encontradas: ${falhas.join(' | ')}`).toEqual([])
  })
})

describe('Truncamento de colunas texto — Pedidos.tsx', () => {
  const conteudo = lerArquivo('../../../servicos-global/produto/pedido/client/src/pages/Pedidos.tsx')

  it('part_number em COLUNAS_FILHO usa truncamento', () => {
    const colunasFilhoIdx = conteudo.indexOf("const COLUNAS_FILHO")
    expect(colunasFilhoIdx).toBeGreaterThan(-1)

    const partIdx = conteudo.indexOf("key: 'part_number'", colunasFilhoIdx)
    expect(partIdx).toBeGreaterThan(-1)
    const section = conteudo.slice(partIdx, partIdx + 1000)
    expect(section).toContain('slice(0, 50)')
  })

  it('descricao_item em COLUNAS_FILHO usa truncamento', () => {
    const colunasFilhoIdx = conteudo.indexOf("const COLUNAS_FILHO")
    const descIdx = conteudo.indexOf("key: 'descricao_item'", colunasFilhoIdx)
    expect(descIdx).toBeGreaterThan(-1)
    const section = conteudo.slice(descIdx, descIdx + 1000)
    expect(section).toContain('slice(0, 50)')
  })

  it('ncm_duimp usa truncamento', () => {
    const ncmDuimpIdx = conteudo.indexOf("key: 'ncm_duimp'")
    expect(ncmDuimpIdx).toBeGreaterThan(-1)
    const section = conteudo.slice(ncmDuimpIdx, ncmDuimpIdx + 1000)
    expect(section).toContain('slice(0, 50)')
  })

  it('buildMapaColunasFilho — numero_pedido (part_number) usa truncamento', () => {
    const inicioFn = conteudo.indexOf('function buildMapaColunasFilho')
    expect(inicioFn).toBeGreaterThan(-1)

    let depth = 0
    let fimFn = -1
    for (let i = inicioFn; i < conteudo.length; i++) {
      if (conteudo[i] === '{') depth++
      if (conteudo[i] === '}') { depth--; if (depth === 0) { fimFn = i; break } }
    }
    const corpo = conteudo.slice(inicioFn, fimFn + 1)

    const numPedidoIdx = corpo.indexOf("numero_pedido:")
    expect(numPedidoIdx).toBeGreaterThan(-1)
    const section = corpo.slice(numPedidoIdx, numPedidoIdx + 1000)
    expect(section).toContain('slice(0, 50)')
  })

  it('buildMapaColunasFilho — nome_exportador usa truncamento', () => {
    const inicioFn = conteudo.indexOf('function buildMapaColunasFilho')
    let depth = 0
    let fimFn = -1
    for (let i = inicioFn; i < conteudo.length; i++) {
      if (conteudo[i] === '{') depth++
      if (conteudo[i] === '}') { depth--; if (depth === 0) { fimFn = i; break } }
    }
    const corpo = conteudo.slice(inicioFn, fimFn + 1)

    const expIdx = corpo.indexOf("nome_exportador:")
    expect(expIdx).toBeGreaterThan(-1)
    const section = corpo.slice(expIdx, expIdx + 1200)
    expect(section).toContain('slice(0, 50)')
  })

  it('buildMapaColunasFilho — nome_importador usa truncamento', () => {
    const inicioFn = conteudo.indexOf('function buildMapaColunasFilho')
    let depth = 0
    let fimFn = -1
    for (let i = inicioFn; i < conteudo.length; i++) {
      if (conteudo[i] === '{') depth++
      if (conteudo[i] === '}') { depth--; if (depth === 0) { fimFn = i; break } }
    }
    const corpo = conteudo.slice(inicioFn, fimFn + 1)

    const impIdx = corpo.indexOf("nome_importador:")
    expect(impIdx).toBeGreaterThan(-1)
    const section = corpo.slice(impIdx, impIdx + 1200)
    expect(section).toContain('slice(0, 50)')
  })

  it('nenhuma coluna texto em COLUNAS_FILHO retorna valor raw sem wrapper', () => {
    const colunasFilhoIdx = conteudo.indexOf("const COLUNAS_FILHO")
    const fimArray = conteudo.indexOf("] satisfies", colunasFilhoIdx)
    if (fimArray === -1) return

    const bloco = conteudo.slice(colunasFilhoIdx, fimArray)

    const rawPatterns = [
      /render:\s*\([^)]*\)\s*=>\s*<span[^>]*>\{row\.\w+\}<\/span>/g,
      /render:\s*\([^)]*\)\s*=>\s*row\.\w+\s*[,\n]/g,
    ]

    const falhas: string[] = []
    for (const pat of rawPatterns) {
      let m: RegExpExecArray | null
      while ((m = pat.exec(bloco)) !== null) {
        if (!m[0].includes('fmtData') && !m[0].includes('fmtQuantidade') && !m[0].includes('tabular-nums')) {
          falhas.push(m[0].trim().slice(0, 80))
        }
      }
    }

    expect(falhas, `Colunas texto com render raw encontradas: ${falhas.join(' | ')}`).toEqual([])
  })
})
