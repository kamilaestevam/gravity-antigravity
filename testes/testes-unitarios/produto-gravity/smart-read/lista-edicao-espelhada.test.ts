import { describe, expect, it } from 'vitest'
import {
  aplicarEdicaoCampoDocumentoListaSmartRead,
  extrairGrupoEspelhoNomeDocumentoSmartRead,
  listarAlvosEspelhoGrupoListaSmartRead,
  montarAlvosDocumentoListaEdicao,
  ListaEdicaoSmartReadErro,
} from '../../../../servicos-global/produto/smart-read/shared/lista-edicao-espelhada-smart-read.ts'
import { EditarCampoDocumentoListaRequestSchema } from '../../../../servicos-global/produto/smart-read/server/src/schemas/leitura-smart-read.ts'

const CATALOGO_MINIMO = [
  {
    key: 'numero_documento',
    tipos: ['INVOICE', 'PACKING_LIST'],
    caminhos: ['document.documentNumber', 'document.number'],
    status: 'mapeado' as const,
  },
  {
    key: 'nome_exportador',
    tipos: ['INVOICE', 'PACKING_LIST'],
    caminhos: ['exporter.name'],
    status: 'mapeado' as const,
  },
]

function leituraComGrupoA() {
  return {
    id_leitura: 'leitura-1',
    arquivos: [
      {
        id_arquivo: 'arq-1',
        resultado_extracao: [
          {
            tipo_documento: 'INVOICE',
            dados: { document: { documentNumber: '100' }, exporter: { name: 'Foo' } },
          },
          {
            tipo_documento: 'INVOICE',
            dados: { document: { documentNumber: '101' }, exporter: { name: 'Foo2' } },
          },
          {
            tipo_documento: 'PACKING_LIST',
            dados: { document: { number: '100' }, exporter: { name: 'Foo' } },
          },
          {
            tipo_documento: 'PACKING_LIST',
            dados: { document: { number: '101' }, exporter: { name: 'Foo2' } },
          },
        ],
      },
    ],
  }
}

describe('Smart Read — lista edição espelhada', () => {
  it('extrai grupo A/B do nome do documento', () => {
    expect(extrairGrupoEspelhoNomeDocumentoSmartRead('COMMERCIAL_INVOICE A')).toBe('A')
    expect(extrairGrupoEspelhoNomeDocumentoSmartRead('Packing List')).toBeNull()
  })

  it('espelha numero_documento entre INVOICE A e PACKING_LIST A', () => {
    const leitura = leituraComGrupoA()
    const documentos = montarAlvosDocumentoListaEdicao(leitura)
    const origem = documentos.find((d) => d.tipo_documento === 'INVOICE' && d.nome_documento.endsWith(' A'))
    expect(origem).toBeDefined()

    const alvos = listarAlvosEspelhoGrupoListaSmartRead(
      documentos,
      origem!,
      'numero_documento',
      CATALOGO_MINIMO,
    )
    expect(alvos).toHaveLength(2)

    const editada = aplicarEdicaoCampoDocumentoListaSmartRead({
      leitura,
      id_arquivo: origem!.id_arquivo,
      indice_documento: origem!.indice_extracao,
      campo_coluna: 'numero_documento',
      valor: '999',
      catalogo: CATALOGO_MINIMO,
    })

    const invoiceA = editada.arquivos[0]?.resultado_extracao?.[0]?.dados as Record<string, unknown>
    const packingA = editada.arquivos[0]?.resultado_extracao?.[2]?.dados as Record<string, unknown>
    expect((invoiceA.document as Record<string, unknown>).documentNumber).toBe('999')
    expect((packingA.document as Record<string, unknown>).number).toBe('999')
  })

  it('espelha coluna de catálogo mapeada (nome_exportador) no mesmo grupo', () => {
    const leitura = leituraComGrupoA()
    const documentos = montarAlvosDocumentoListaEdicao(leitura)
    const origem = documentos.find((d) => d.tipo_documento === 'PACKING_LIST' && d.nome_documento.endsWith(' A'))
    expect(origem).toBeDefined()

    const editada = aplicarEdicaoCampoDocumentoListaSmartRead({
      leitura,
      id_arquivo: origem!.id_arquivo,
      indice_documento: origem!.indice_extracao,
      campo_coluna: 'nome_exportador',
      valor: 'Bar Ltd',
      catalogo: CATALOGO_MINIMO,
    })

    const invoiceA = editada.arquivos[0]?.resultado_extracao?.[0]?.dados as Record<string, unknown>
    const packingA = editada.arquivos[0]?.resultado_extracao?.[2]?.dados as Record<string, unknown>
    expect((invoiceA.exporter as Record<string, unknown>).name).toBe('Bar Ltd')
    expect((packingA.exporter as Record<string, unknown>).name).toBe('Bar Ltd')
  })

  it('rejeita coluna não editável com ListaEdicaoSmartReadErro', () => {
    expect(() =>
      aplicarEdicaoCampoDocumentoListaSmartRead({
        leitura: leituraComGrupoA(),
        id_arquivo: 'arq-1',
        indice_documento: 0,
        campo_coluna: 'campo_inexistente',
        valor: 'x',
        catalogo: CATALOGO_MINIMO,
      }),
    ).toThrow(ListaEdicaoSmartReadErro)
  })

  it('schema server rejeita campo_coluna fora da allowlist', () => {
    const resultado = EditarCampoDocumentoListaRequestSchema.safeParse({
      id_arquivo: 'arq-1',
      indice_documento: 0,
      campo_coluna: 'campo_inexistente',
      valor: 'x',
    })
    expect(resultado.success).toBe(false)
  })

  it('schema server aceita numeros_documento (alias lista)', () => {
    const resultado = EditarCampoDocumentoListaRequestSchema.safeParse({
      id_arquivo: 'arq-1',
      indice_documento: 0,
      campo_coluna: 'numeros_documento',
      valor: '123',
    })
    expect(resultado.success).toBe(true)
  })
})
