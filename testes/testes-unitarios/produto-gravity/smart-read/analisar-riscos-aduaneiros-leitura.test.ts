import { describe, expect, it } from 'vitest'
import {
  analisarRiscosAduaneirosLeitura,
  montarDocumentosAnaliseRiscoDeArquivoLocalSelecionado,
  validarCnpjBrasil,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/analisar-riscos-aduaneiros-leitura-smart-read.ts'
import type { ArquivoLocalNovaLeitura } from '../../../../servicos-global/produto/smart-read/client/src/shared/tipo-arquivo-nova-leitura-smart-read.ts'

function arquivoCompletoMock(
  nome: string,
  dados: Record<string, unknown>,
  tipo = 'INVOICE',
): ArquivoLocalNovaLeitura {
  const idArquivo = `api-${nome}`
  return {
    id_arquivo_local: `local-${nome}`,
    id_arquivo: idArquivo,
    arquivo: new File([''], nome, { type: 'application/pdf' }),
    status_arquivo_local: 'completo',
    id_leitura: 'leitura-1',
    mensagem_erro: null,
    expandido: false,
    leitura: {
      id_leitura: 'leitura-1',
      nome_leitura: 'Teste',
      status_leitura: 'COMPLETED',
      total_arquivos: 1,
      arquivos_processados: 1,
      arquivos: [
        {
          id_arquivo: idArquivo,
          nome_arquivo: nome,
          status_arquivo: 'COMPLETED',
          resultado_extracao: [{ tipo_documento: tipo, dados }],
        },
      ],
    },
  }
}

describe('Smart Read — analisar riscos aduaneiros', () => {
  it('valida CNPJ brasileiro com dígitos verificadores', () => {
    expect(validarCnpjBrasil('11.444.777/0001-61')).toBe(true)
    expect(validarCnpjBrasil('11.444.777/0001-62')).toBe(false)
    expect(validarCnpjBrasil(null)).toBe(false)
  })

  it('detecta Incoterm ausente em Invoice', () => {
    const resumo = analisarRiscosAduaneirosLeitura([
      arquivoCompletoMock('invoice.pdf', {
        importer: { cnpj: '11.444.777/0001-61' },
        items: [{ ncm: '84713012' }],
      }),
    ])

    expect(resumo.criticos).toBeGreaterThanOrEqual(1)
    expect(resumo.riscos.some((r) => r.titulo === 'Incoterm ausente')).toBe(true)
  })

  it('detecta divergência de NCM entre Invoice e Packing List', () => {
    const resumo = analisarRiscosAduaneirosLeitura([
      arquivoCompletoMock(
        'invoice.pdf',
        {
          document: { incoterm: 'FOB' },
          importer: { cnpj: '11.444.777/0001-61' },
          items: [{ ncm: '84713012' }],
        },
        'INVOICE',
      ),
      arquivoCompletoMock(
        'packing.pdf',
        {
          document: { incoterm: 'FOB' },
          items: [{ ncm: '85171231' }],
        },
        'PACKING_LIST',
      ),
    ])

    expect(
      resumo.riscos.some((r) =>
        r.titulo.includes('divergência de NCM entre Invoice e Packing List'),
      ),
    ).toBe(true)
  })

  it('detecta Incoterm divergente entre documentos', () => {
    const resumo = analisarRiscosAduaneirosLeitura([
      arquivoCompletoMock(
        'invoice.pdf',
        {
          document: { incoterm: 'FOB' },
          importer: { cnpj: '11.444.777/0001-61' },
          items: [{ ncm: '84713012' }],
        },
        'INVOICE',
      ),
      arquivoCompletoMock(
        'pl.pdf',
        {
          document: { incoterm: 'CIF' },
          items: [{ ncm: '84713012' }],
        },
        'PACKING_LIST',
      ),
    ])

    expect(resumo.riscos.some((r) => r.titulo === 'Incoterm divergente entre documentos')).toBe(
      true,
    )
  })

  it('detecta divergencia matematica na linha da invoice', () => {
    const resumo = analisarRiscosAduaneirosLeitura([
      arquivoCompletoMock(
        'invoice.pdf',
        {
          document: { incoterm: 'FOB' },
          importer: { cnpj: '11.444.777/0001-61' },
          items: [
            {
              ncm: '84713012',
              itemQuantity: '10',
              itemUnitPriceWithCurrency: '0.16',
              itemTotalPriceWithCurrency: '2.00',
            },
          ],
          values: { totalDocumentValue: '2.00' },
        },
        'INVOICE',
      ),
    ])

    expect(resumo.riscos.some((r) => r.titulo === 'Divergência no total da linha')).toBe(true)
    const linha = resumo.riscos.find((r) => r.titulo === 'Divergência no total da linha')
    expect(linha?.analise).toContain('na linha 1')
    expect(linha?.analise).toContain('itemQuantity')
    expect(linha?.analise).toContain('itemUnitPriceWithCurrency')
    expect(linha?.analise).toContain('divergência')
  })

  it('classificacao fiscal V1 nao usa instrucao meta para IA', () => {
    const resumo = analisarRiscosAduaneirosLeitura([
      arquivoCompletoMock(
        'invoice.pdf',
        {
          document: { incoterm: 'FOB' },
          importer: { cnpj: '11.444.777/0001-61' },
          items: [
            {
              descriptions: { portuguese: 'Diodo semicondutor SOT-23' },
              ncm: 'ncm',
            },
          ],
        },
        'INVOICE',
      ),
    ])

    const ncm = resumo.riscos.find((r) => r.titulo.includes('NCM ausente'))
    expect(ncm).toBeDefined()
    expect(ncm?.motivo).toContain('Diodo semicondutor')
    expect(ncm?.analise).not.toContain('A IA deve')
    expect(ncm?.correcao_sugerida).toBeUndefined()
  })

  it('montaDocumentosAnaliseRiscoDeArquivoLocalSelecionado retorna todos os subdocs (índice ignorado)', () => {
    const idArquivo = 'api-multi.pdf'
    const item: ArquivoLocalNovaLeitura = {
      id_arquivo_local: 'local-multi',
      id_arquivo: idArquivo,
      arquivo: new File([''], 'INVOICE77.pdf', { type: 'application/pdf' }),
      status_arquivo_local: 'completo',
      id_leitura: 'leitura-1',
      mensagem_erro: null,
      expandido: true,
      leitura: {
        id_leitura: 'leitura-1',
        nome_leitura: 'Teste',
        status_leitura: 'COMPLETED',
        total_arquivos: 1,
        arquivos_processados: 1,
        arquivos: [
          {
            id_arquivo: idArquivo,
            nome_arquivo: 'INVOICE77.pdf',
            status_arquivo: 'COMPLETED',
            resultado_extracao: [
              { tipo_documento: 'PACKING_LIST', dados: { items: [{ ncm: '11111111' }] } },
              { tipo_documento: 'INVOICE', dados: { items: [{ ncm: '22222222' }] } },
            ],
          },
        ],
      },
    }

    const packing = montarDocumentosAnaliseRiscoDeArquivoLocalSelecionado(item, 0)
    const invoice = montarDocumentosAnaliseRiscoDeArquivoLocalSelecionado(item, 1)

    // Função deprecada — delega para montarDocumentosAnaliseRiscoDeArquivoLocal (todos os subdocs)
    expect(packing).toHaveLength(2)
    expect(packing[0]?.tipo_documento).toBe('PACKING_LIST')
    expect(packing[1]?.tipo_documento).toBe('INVOICE')
    expect(invoice).toHaveLength(2)
    expect(invoice[0]?.tipo_documento).toBe('PACKING_LIST')
    expect(invoice[1]?.tipo_documento).toBe('INVOICE')
  })
})
