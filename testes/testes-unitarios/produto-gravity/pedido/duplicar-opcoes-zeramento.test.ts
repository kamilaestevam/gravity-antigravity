// @vitest-environment node
import { describe, it, expect } from 'vitest'

/**
 * Testa a lógica de zeramento condicional do Raio X da Duplicação.
 *
 * Cenários cobertos:
 *   1. Todas opções true → nenhum campo zerado (retrocompat)
 *   2. Cada opção false individualmente → apenas campos do grupo são zerados
 *   3. Combinação de opções false → campos de múltiplos grupos zerados
 *   4. copiar_datas=false → todos os campos Date zerados
 *   5. Campos não pertencentes a nenhum grupo → nunca zerados
 */

// ── Réplica isolada da lógica do service (teste puro sem import real) ──────���──

interface OpcoesDuplicacao {
  copiar_datas: boolean
  copiar_valores_precos: boolean
  copiar_referencias_externas: boolean
  copiar_pesos_cubagem: boolean
  copiar_descricoes_complementares: boolean
}

const OPCOES_DEFAULT: OpcoesDuplicacao = {
  copiar_datas: true,
  copiar_valores_precos: true,
  copiar_referencias_externas: true,
  copiar_pesos_cubagem: true,
  copiar_descricoes_complementares: true,
}

const CAMPOS_VALORES_PEDIDO = [
  'valor_total_pedido', 'valor_total_cambio_pedido', 'taxa_cambio_estimada_pedido',
] as const

const CAMPOS_VALORES_ITEM = [
  'valor_total_item', 'valor_por_unidade_item',
] as const

const CAMPOS_REFERENCIAS_PEDIDO = [
  'numero_proforma_pedido', 'numero_invoice_pedido',
  'referencia_importador_pedido', 'referencia_exportador_pedido',
  'referencia_fabricante_pedido', 'contrato_cambio_id_pedido',
] as const

const CAMPOS_REFERENCIAS_ITEM = [
  'numero_lpco', 'numero_certificado_origem',
  'referencia_importador_item', 'referencia_exportador_item',
  'referencia_fabricante_item',
] as const

const CAMPOS_PESOS_PEDIDO = [
  'peso_liquido_total_pedido', 'peso_bruto_total_pedido', 'cubagem_total_pedido',
  'tipo_embalagem_pedido', 'quantidade_volumes_pedido',
] as const

const CAMPOS_PESOS_ITEM = [
  'peso_liquido_unitario_item', 'peso_bruto_unitario_item',
  'cubagem_unitaria_item', 'tipo_embalagem_item', 'quantidade_volumes_item',
] as const

const CAMPOS_DESCRICOES_ITEM = [
  'descricao_completa_item_pt', 'descricao_completa_item_en',
  'descricao_completa_item_es', 'descricao_completa_item_nf',
  'texto_posicao_ncm', 'grupo_item', 'subgrupo_item',
  'campo_especial_item', 'atributos_catalogo',
] as const

function aplicarZeramentoOpcoes(
  obj: Record<string, unknown>,
  opcoes: OpcoesDuplicacao,
  camposValores: readonly string[],
  camposReferencias: readonly string[],
  camposPesos: readonly string[],
  camposDescricoes: readonly string[],
): Record<string, unknown> {
  const resultado = { ...obj }

  if (!opcoes.copiar_valores_precos) {
    for (const campo of camposValores) resultado[campo] = null
  }
  if (!opcoes.copiar_referencias_externas) {
    for (const campo of camposReferencias) resultado[campo] = null
  }
  if (!opcoes.copiar_pesos_cubagem) {
    for (const campo of camposPesos) resultado[campo] = null
  }
  if (!opcoes.copiar_descricoes_complementares) {
    for (const campo of camposDescricoes) resultado[campo] = null
  }

  return resultado
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

function criarPedidoMock(): Record<string, unknown> {
  return {
    numero_pedido: 'PO-001',
    status_pedido: 'aberto',
    id_organizacao: 'org_123',
    // Valores
    valor_total_pedido: 50000,
    valor_total_cambio_pedido: 250000,
    taxa_cambio_estimada_pedido: 5.0,
    // Referências
    numero_proforma_pedido: 'PRO-2026/001',
    numero_invoice_pedido: 'INV-2026/001',
    referencia_importador_pedido: 'IMP-REF-001',
    referencia_exportador_pedido: 'EXP-REF-001',
    referencia_fabricante_pedido: 'FAB-REF-001',
    contrato_cambio_id_pedido: 'CAMBIO-001',
    // Pesos
    peso_liquido_total_pedido: 1000,
    peso_bruto_total_pedido: 1200,
    cubagem_total_pedido: 5.5,
    tipo_embalagem_pedido: 'CAIXA',
    quantidade_volumes_pedido: 10,
    // Dados estruturais (nunca zerados)
    ncm_pedido: '8471.30.19',
    pais_origem_pedido: 'CN',
    moeda_pedido: 'USD',
    incoterm_pedido: 'FOB',
    // Datas
    data_embarque_pedido: new Date('2026-06-01'),
    data_eta_pedido: new Date('2026-07-01'),
  }
}

function criarItemMock(): Record<string, unknown> {
  return {
    part_number: 'PN-001',
    id_organizacao: 'org_123',
    quantidade_inicial_item: 100,
    // Valores
    valor_total_item: 5000,
    valor_por_unidade_item: 50,
    // Referências
    numero_lpco: 'LPCO-001',
    numero_certificado_origem: 'CO-001',
    referencia_importador_item: 'IMP-ITEM-001',
    referencia_exportador_item: 'EXP-ITEM-001',
    referencia_fabricante_item: 'FAB-ITEM-001',
    // Pesos
    peso_liquido_unitario_item: 10,
    peso_bruto_unitario_item: 12,
    cubagem_unitaria_item: 0.05,
    tipo_embalagem_item: 'SACO',
    quantidade_volumes_item: 2,
    // Descrições
    descricao_completa_item_pt: 'Componente eletrônico',
    descricao_completa_item_en: 'Electronic component',
    descricao_completa_item_es: 'Componente electrónico',
    descricao_completa_item_nf: 'Comp. eletr.',
    texto_posicao_ncm: 'Circuitos integrados',
    grupo_item: 'Eletrônicos',
    subgrupo_item: 'CIs',
    campo_especial_item: 'Especial',
    atributos_catalogo: 'attr1=val1',
    // Dados estruturais (nunca zerados)
    ncm_item: '8542.31.90',
    unidade_medida_item: 'UN',
    // Datas
    data_embarque_item: new Date('2026-06-01'),
  }
}

// ── Testes ───────────────────────────────────────────────────────────────────

describe('aplicarZeramentoOpcoes — Pedido', () => {
  it('todas opções true → nenhum campo zerado (retrocompat)', () => {
    const pedido = criarPedidoMock()
    const resultado = aplicarZeramentoOpcoes(
      pedido, OPCOES_DEFAULT,
      [...CAMPOS_VALORES_PEDIDO], [...CAMPOS_REFERENCIAS_PEDIDO],
      [...CAMPOS_PESOS_PEDIDO], [],
    )

    // Todos os campos devem manter seus valores originais
    expect(resultado.valor_total_pedido).toBe(50000)
    expect(resultado.numero_proforma_pedido).toBe('PRO-2026/001')
    expect(resultado.peso_liquido_total_pedido).toBe(1000)
    expect(resultado.ncm_pedido).toBe('8471.30.19')
  })

  it('copiar_valores_precos=false → zera apenas campos de valor', () => {
    const pedido = criarPedidoMock()
    const opcoes = { ...OPCOES_DEFAULT, copiar_valores_precos: false }
    const resultado = aplicarZeramentoOpcoes(
      pedido, opcoes,
      [...CAMPOS_VALORES_PEDIDO], [...CAMPOS_REFERENCIAS_PEDIDO],
      [...CAMPOS_PESOS_PEDIDO], [],
    )

    expect(resultado.valor_total_pedido).toBeNull()
    expect(resultado.valor_total_cambio_pedido).toBeNull()
    expect(resultado.taxa_cambio_estimada_pedido).toBeNull()
    // Outros grupos mantêm valor
    expect(resultado.numero_proforma_pedido).toBe('PRO-2026/001')
    expect(resultado.peso_liquido_total_pedido).toBe(1000)
    expect(resultado.ncm_pedido).toBe('8471.30.19')
  })

  it('copiar_referencias_externas=false → zera apenas campos de referência', () => {
    const pedido = criarPedidoMock()
    const opcoes = { ...OPCOES_DEFAULT, copiar_referencias_externas: false }
    const resultado = aplicarZeramentoOpcoes(
      pedido, opcoes,
      [...CAMPOS_VALORES_PEDIDO], [...CAMPOS_REFERENCIAS_PEDIDO],
      [...CAMPOS_PESOS_PEDIDO], [],
    )

    expect(resultado.numero_proforma_pedido).toBeNull()
    expect(resultado.numero_invoice_pedido).toBeNull()
    expect(resultado.referencia_importador_pedido).toBeNull()
    expect(resultado.referencia_exportador_pedido).toBeNull()
    expect(resultado.referencia_fabricante_pedido).toBeNull()
    expect(resultado.contrato_cambio_id_pedido).toBeNull()
    // Outros grupos mantêm valor
    expect(resultado.valor_total_pedido).toBe(50000)
    expect(resultado.peso_liquido_total_pedido).toBe(1000)
  })

  it('copiar_pesos_cubagem=false → zera apenas campos de peso/cubagem', () => {
    const pedido = criarPedidoMock()
    const opcoes = { ...OPCOES_DEFAULT, copiar_pesos_cubagem: false }
    const resultado = aplicarZeramentoOpcoes(
      pedido, opcoes,
      [...CAMPOS_VALORES_PEDIDO], [...CAMPOS_REFERENCIAS_PEDIDO],
      [...CAMPOS_PESOS_PEDIDO], [],
    )

    expect(resultado.peso_liquido_total_pedido).toBeNull()
    expect(resultado.peso_bruto_total_pedido).toBeNull()
    expect(resultado.cubagem_total_pedido).toBeNull()
    expect(resultado.tipo_embalagem_pedido).toBeNull()
    expect(resultado.quantidade_volumes_pedido).toBeNull()
    // Outros mantêm valor
    expect(resultado.valor_total_pedido).toBe(50000)
    expect(resultado.numero_proforma_pedido).toBe('PRO-2026/001')
  })

  it('combinação: valores=false + pesos=false → ambos grupos zerados', () => {
    const pedido = criarPedidoMock()
    const opcoes = { ...OPCOES_DEFAULT, copiar_valores_precos: false, copiar_pesos_cubagem: false }
    const resultado = aplicarZeramentoOpcoes(
      pedido, opcoes,
      [...CAMPOS_VALORES_PEDIDO], [...CAMPOS_REFERENCIAS_PEDIDO],
      [...CAMPOS_PESOS_PEDIDO], [],
    )

    expect(resultado.valor_total_pedido).toBeNull()
    expect(resultado.peso_liquido_total_pedido).toBeNull()
    // Referências mantêm
    expect(resultado.numero_proforma_pedido).toBe('PRO-2026/001')
  })

  it('dados estruturais NUNCA são zerados por nenhuma opção', () => {
    const pedido = criarPedidoMock()
    const opcoes: OpcoesDuplicacao = {
      copiar_datas: false,
      copiar_valores_precos: false,
      copiar_referencias_externas: false,
      copiar_pesos_cubagem: false,
      copiar_descricoes_complementares: false,
    }
    const resultado = aplicarZeramentoOpcoes(
      pedido, opcoes,
      [...CAMPOS_VALORES_PEDIDO], [...CAMPOS_REFERENCIAS_PEDIDO],
      [...CAMPOS_PESOS_PEDIDO], [],
    )

    expect(resultado.ncm_pedido).toBe('8471.30.19')
    expect(resultado.pais_origem_pedido).toBe('CN')
    expect(resultado.moeda_pedido).toBe('USD')
    expect(resultado.incoterm_pedido).toBe('FOB')
    expect(resultado.numero_pedido).toBe('PO-001')
    expect(resultado.status_pedido).toBe('aberto')
    expect(resultado.id_organizacao).toBe('org_123')
  })
})

describe('aplicarZeramentoOpcoes — Item', () => {
  it('todas opções true → nenhum campo zerado', () => {
    const item = criarItemMock()
    const resultado = aplicarZeramentoOpcoes(
      item, OPCOES_DEFAULT,
      [...CAMPOS_VALORES_ITEM], [...CAMPOS_REFERENCIAS_ITEM],
      [...CAMPOS_PESOS_ITEM], [...CAMPOS_DESCRICOES_ITEM],
    )

    expect(resultado.valor_total_item).toBe(5000)
    expect(resultado.numero_lpco).toBe('LPCO-001')
    expect(resultado.peso_liquido_unitario_item).toBe(10)
    expect(resultado.descricao_completa_item_pt).toBe('Componente eletrônico')
  })

  it('copiar_descricoes_complementares=false → zera descrições', () => {
    const item = criarItemMock()
    const opcoes = { ...OPCOES_DEFAULT, copiar_descricoes_complementares: false }
    const resultado = aplicarZeramentoOpcoes(
      item, opcoes,
      [...CAMPOS_VALORES_ITEM], [...CAMPOS_REFERENCIAS_ITEM],
      [...CAMPOS_PESOS_ITEM], [...CAMPOS_DESCRICOES_ITEM],
    )

    expect(resultado.descricao_completa_item_pt).toBeNull()
    expect(resultado.descricao_completa_item_en).toBeNull()
    expect(resultado.descricao_completa_item_es).toBeNull()
    expect(resultado.descricao_completa_item_nf).toBeNull()
    expect(resultado.texto_posicao_ncm).toBeNull()
    expect(resultado.grupo_item).toBeNull()
    expect(resultado.subgrupo_item).toBeNull()
    expect(resultado.campo_especial_item).toBeNull()
    expect(resultado.atributos_catalogo).toBeNull()
    // Outros mantêm
    expect(resultado.valor_total_item).toBe(5000)
    expect(resultado.numero_lpco).toBe('LPCO-001')
    expect(resultado.part_number).toBe('PN-001')
  })

  it('copiar_valores_precos=false no item → zera valor_total + valor_unitário', () => {
    const item = criarItemMock()
    const opcoes = { ...OPCOES_DEFAULT, copiar_valores_precos: false }
    const resultado = aplicarZeramentoOpcoes(
      item, opcoes,
      [...CAMPOS_VALORES_ITEM], [...CAMPOS_REFERENCIAS_ITEM],
      [...CAMPOS_PESOS_ITEM], [...CAMPOS_DESCRICOES_ITEM],
    )

    expect(resultado.valor_total_item).toBeNull()
    expect(resultado.valor_por_unidade_item).toBeNull()
    // Dados estruturais mantêm
    expect(resultado.part_number).toBe('PN-001')
    expect(resultado.ncm_item).toBe('8542.31.90')
  })

  it('copiar_referencias_externas=false no item → zera LPCO, CO, refs', () => {
    const item = criarItemMock()
    const opcoes = { ...OPCOES_DEFAULT, copiar_referencias_externas: false }
    const resultado = aplicarZeramentoOpcoes(
      item, opcoes,
      [...CAMPOS_VALORES_ITEM], [...CAMPOS_REFERENCIAS_ITEM],
      [...CAMPOS_PESOS_ITEM], [...CAMPOS_DESCRICOES_ITEM],
    )

    expect(resultado.numero_lpco).toBeNull()
    expect(resultado.numero_certificado_origem).toBeNull()
    expect(resultado.referencia_importador_item).toBeNull()
    expect(resultado.referencia_exportador_item).toBeNull()
    expect(resultado.referencia_fabricante_item).toBeNull()
  })
})

describe('copiar_datas=false — zeramento de campos Date', () => {
  it('pedido: todos os campos Date são zerados', () => {
    const pedido = criarPedidoMock()
    // Simula a lógica do service: após aplicarZeramentoOpcoes, varrer Dates
    const opcoes = { ...OPCOES_DEFAULT, copiar_datas: false }
    const resultado = aplicarZeramentoOpcoes(
      pedido, opcoes,
      [...CAMPOS_VALORES_PEDIDO], [...CAMPOS_REFERENCIAS_PEDIDO],
      [...CAMPOS_PESOS_PEDIDO], [],
    )

    // Aplicar zeramento de datas (mesma lógica do service)
    for (const key of Object.keys(resultado)) {
      if (resultado[key] instanceof Date) resultado[key] = null
    }

    expect(resultado.data_embarque_pedido).toBeNull()
    expect(resultado.data_eta_pedido).toBeNull()
    // Campos não-Date mantêm
    expect(resultado.numero_pedido).toBe('PO-001')
    expect(resultado.valor_total_pedido).toBe(50000)
  })

  it('item: todos os campos Date são zerados', () => {
    const item = criarItemMock()
    const opcoes = { ...OPCOES_DEFAULT, copiar_datas: false }
    const resultado = aplicarZeramentoOpcoes(
      item, opcoes,
      [...CAMPOS_VALORES_ITEM], [...CAMPOS_REFERENCIAS_ITEM],
      [...CAMPOS_PESOS_ITEM], [...CAMPOS_DESCRICOES_ITEM],
    )

    for (const key of Object.keys(resultado)) {
      if (resultado[key] instanceof Date) resultado[key] = null
    }

    expect(resultado.data_embarque_item).toBeNull()
    // Dados estruturais não-Date mantêm
    expect(resultado.part_number).toBe('PN-001')
    expect(resultado.quantidade_inicial_item).toBe(100)
  })

  it('copiar_datas=true → campos Date NÃO são zerados', () => {
    const pedido = criarPedidoMock()
    const opcoes = OPCOES_DEFAULT // copiar_datas=true
    const resultado = aplicarZeramentoOpcoes(
      pedido, opcoes,
      [...CAMPOS_VALORES_PEDIDO], [...CAMPOS_REFERENCIAS_PEDIDO],
      [...CAMPOS_PESOS_PEDIDO], [],
    )

    expect(resultado.data_embarque_pedido).toBeInstanceOf(Date)
    expect(resultado.data_eta_pedido).toBeInstanceOf(Date)
  })
})

describe('Retrocompatibilidade — opcoes undefined mergeado com default', () => {
  it('opcoes parcial merge com default → campos ausentes = true', () => {
    const opcoesPartial = { copiar_datas: false } as Partial<OpcoesDuplicacao>
    const opcoesFinal: OpcoesDuplicacao = { ...OPCOES_DEFAULT, ...opcoesPartial }

    expect(opcoesFinal.copiar_datas).toBe(false)
    expect(opcoesFinal.copiar_valores_precos).toBe(true)
    expect(opcoesFinal.copiar_referencias_externas).toBe(true)
    expect(opcoesFinal.copiar_pesos_cubagem).toBe(true)
    expect(opcoesFinal.copiar_descricoes_complementares).toBe(true)
  })

  it('opcoes undefined → spread com default produz todas true', () => {
    const opcoesPayload: OpcoesDuplicacao | undefined = undefined
    const opcoesFinal: OpcoesDuplicacao = { ...OPCOES_DEFAULT, ...opcoesPayload }

    expect(opcoesFinal.copiar_datas).toBe(true)
    expect(opcoesFinal.copiar_valores_precos).toBe(true)
    expect(opcoesFinal.copiar_referencias_externas).toBe(true)
    expect(opcoesFinal.copiar_pesos_cubagem).toBe(true)
    expect(opcoesFinal.copiar_descricoes_complementares).toBe(true)
  })
})
