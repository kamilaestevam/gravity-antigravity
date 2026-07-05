import { describe, it, expect } from 'vitest'
import {
  montarDadosDocumentoComercialPedido,
  montarHtmlDocumentoComercialPedido,
  NOME_ARQUIVO_DOCUMENTO_COMERCIAL,
  TIPOS_DOCUMENTO_COMERCIAL_PEDIDO,
  type TipoDocumentoComercialPedido,
  type IdiomaDocumentoPedido,
} from '../../../../servicos-global/produto/pedido/server/src/services/documentos-comerciais-pedido.js'

const pedidoPrismaFake = {
  numero_pedido: 'PO-2026/001',
  tipo_operacao_pedido: 'importacao',
  incoterm_pedido: 'FOB',
  moeda_pedido: 'USD',
  condicao_pagamento_pedido: '30 dias',
  numero_proforma_pedido: 'PRO-001',
  numero_invoice_pedido: 'INV-001',
  referencia_importador_pedido: 'REF-IMP',
  referencia_exportador_pedido: null,
  data_emissao_pedido: new Date('2026-06-01T00:00:00.000Z'),
  detalhes_operacionais_pedido: {
    nome_exportador: 'BRITISH ENGINES LTD',
    nome_importador: 'GRAVITY BRASIL SA',
    nome_fabricante: 'ACME FACTORY',
  },
  itens_pedido: [
    {
      part_number_item: 'ABC-001',
      descricao_item: 'Motor elétrico <industrial>',
      ncm_item: '8501.10.10',
      quantidade_atual_item: '10',
      unidade_comercializada_item: 'UN',
      moeda_item: 'USD',
      valor_por_unidade_item: '150.5',
      valor_total_item: '1505',
      peso_liquido_unitario_item: '2.5',
      peso_bruto_unitario_item: '3',
      cubagem_unitaria_item: '0.01',
      tipo_embalagem: 'Caixa',
      tipo_volume_item: 'Pallet',
      numero_certificado_origem: 'CO-999',
    },
    {
      part_number_item: 'DEF-002',
      descricao_item: 'Bomba hidráulica',
      ncm_item: '8413.60.11',
      quantidade_atual_item: '4',
      unidade_comercializada_item: 'UN',
      moeda_item: 'USD',
      valor_por_unidade_item: null,
      valor_total_item: null,
      peso_liquido_unitario_item: null,
      peso_bruto_unitario_item: null,
      cubagem_unitaria_item: null,
      tipo_embalagem: null,
      tipo_volume_item: null,
      numero_certificado_origem: null,
    },
  ],
}

describe('montarDadosDocumentoComercialPedido', () => {
  it('mapeia cabeçalho, partes e itens do registro Prisma', () => {
    const dados = montarDadosDocumentoComercialPedido(pedidoPrismaFake, 'Gravity')
    expect(dados.numero_pedido).toBe('PO-2026/001')
    expect(dados.nome_organizacao).toBe('Gravity')
    expect(dados.nome_exportador).toBe('BRITISH ENGINES LTD')
    expect(dados.nome_importador).toBe('GRAVITY BRASIL SA')
    expect(dados.incoterm).toBe('FOB')
    expect(dados.itens).toHaveLength(2)
    expect(dados.itens[0].part_number).toBe('ABC-001')
    expect(dados.itens[0].quantidade).toBe(10)
  })

  it('calcula pesos e cubagem totais por item (unitário × quantidade)', () => {
    const dados = montarDadosDocumentoComercialPedido(pedidoPrismaFake, 'Gravity')
    expect(dados.itens[0].peso_liquido_total).toBeCloseTo(25)
    expect(dados.itens[0].peso_bruto_total).toBeCloseTo(30)
    expect(dados.itens[0].cubagem_total).toBeCloseTo(0.1)
    // Sem peso unitário → total null (não inventa zero)
    expect(dados.itens[1].peso_liquido_total).toBeNull()
  })

  it('normaliza vazios para null (sem mock preguiçoso)', () => {
    const dados = montarDadosDocumentoComercialPedido(pedidoPrismaFake, 'Gravity')
    expect(dados.referencia_exportador).toBeNull()
    expect(dados.itens[1].valor_total).toBeNull()
    expect(dados.itens[1].tipo_embalagem).toBeNull()
  })

  it('usa snapshots dos itens quando detalhes_operacionais_pedido não tem parceiros', () => {
    const pedidoSemDetalhes = {
      ...pedidoPrismaFake,
      detalhes_operacionais_pedido: {},
      itens_pedido: [
        {
          part_number_item: 'PN-1',
          descricao_item: 'Produto teste',
          ncm_item: '1234',
          quantidade_atual_item: '2',
          nome_exportador_item: 'Export Co',
          nome_importador_item: 'Import Co',
          valor_por_unidade_item: '100',
        },
      ],
    }
    const dados = montarDadosDocumentoComercialPedido(pedidoSemDetalhes, 'Gravity')
    expect(dados.nome_exportador).toBe('Export Co')
    expect(dados.nome_importador).toBe('Import Co')
    expect(dados.itens[0].valor_total).toBe(200)
  })
})

describe('montarHtmlDocumentoComercialPedido', () => {
  const dados = montarDadosDocumentoComercialPedido(pedidoPrismaFake, 'Gravity')
  const idiomas: IdiomaDocumentoPedido[] = ['pt', 'en', 'es', 'zh', 'ja', 'ar']

  it('gera HTML válido para todos os 6 tipos em todos os 6 idiomas', () => {
    for (const tipo of TIPOS_DOCUMENTO_COMERCIAL_PEDIDO) {
      for (const idioma of idiomas) {
        const html = montarHtmlDocumentoComercialPedido(tipo, idioma, dados)
        expect(html).toContain('<!DOCTYPE html>')
        expect(html).toContain('PO-2026/001')
        expect(html).toContain(`lang="${idioma}"`)
      }
    }
  })

  it('usa títulos localizados por tipo', () => {
    expect(montarHtmlDocumentoComercialPedido('pedido_de_compra', 'en', dados)).toContain('Purchase Order')
    expect(montarHtmlDocumentoComercialPedido('pedido_de_venda', 'en', dados)).toContain('Sales Order')
    expect(montarHtmlDocumentoComercialPedido('invoice', 'pt', dados)).toContain('Invoice Comercial')
    expect(montarHtmlDocumentoComercialPedido('packing_list', 'es', dados)).toContain('Lista de Empaque')
    expect(montarHtmlDocumentoComercialPedido('certificado_origem', 'pt', dados)).toContain('Certificado de Origem')
  })

  it('aplica direção RTL para árabe e LTR para os demais', () => {
    expect(montarHtmlDocumentoComercialPedido('invoice', 'ar', dados)).toContain('dir="rtl"')
    expect(montarHtmlDocumentoComercialPedido('invoice', 'en', dados)).toContain('dir="ltr"')
  })

  it('escapa HTML nos dados do pedido (sem injeção)', () => {
    const html = montarHtmlDocumentoComercialPedido('invoice', 'pt', dados)
    expect(html).toContain('Motor elétrico &lt;industrial&gt;')
    expect(html).not.toContain('<industrial>')
  })

  it('packing list traz pesos e cubagem; certificado traz declaração e assinaturas', () => {
    const pl = montarHtmlDocumentoComercialPedido('packing_list', 'pt', dados)
    expect(pl).toContain('Peso Líquido')
    expect(pl).toContain('Peso Bruto')
    expect(pl).toContain('Cubagem')

    const co = montarHtmlDocumentoComercialPedido('certificado_origem', 'pt', dados)
    expect(co).toContain('CO-999')
    expect(co).toContain('Assinatura Autorizada')
    expect(co).toContain('doc-declaracao')
  })

  it('documentos financeiros trazem totais somados', () => {
    const html = montarHtmlDocumentoComercialPedido('invoice', 'en', dados)
    // total quantidade 14 · total valor 1.505,00 (itens sem valor somam 0)
    expect(html).toContain('14.00')
    expect(html).toContain('1,505.00')
  })

  it('nome de arquivo definido para cada tipo', () => {
    const tipos = Object.keys(NOME_ARQUIVO_DOCUMENTO_COMERCIAL) as TipoDocumentoComercialPedido[]
    expect(tipos.sort()).toEqual([...TIPOS_DOCUMENTO_COMERCIAL_PEDIDO].sort())
    expect(NOME_ARQUIVO_DOCUMENTO_COMERCIAL.packing_list).toBe('packing-list')
  })
})
