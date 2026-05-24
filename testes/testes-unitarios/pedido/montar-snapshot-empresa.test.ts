/**
 * montar-snapshot-empresa.test.ts — Mapeamento Fornecedor (Cadastros) →
 * PedidoSnapshotEmpresa após rename empresa → fornecedor.
 */
import { describe, it, expect } from 'vitest'
import { montarSnapshotEmpresa } from '../../../servicos-global/produto/processos-core/src/services/pedidoSnapshots'
import type { Empresa } from '../../../servicos-global/cadastros/shared/schemas/fornecedor.schema'

function fornecedorBR(id: string, cnpj = '12.345.678/0001-99'): Empresa {
  return {
    id_fornecedor: id,
    id_organizacao: 'org-test',
    nome_fornecedor: 'ACME Importadora',
    cnpj_fornecedor: cnpj,
    tin_fornecedor: null,
    pais_fornecedor: 'BR',
    estado_provincia_fornecedor: 'SP',
    cidade_fornecedor: 'Sao Paulo',
    endereco_fornecedor: 'Rua Teste, 100',
    cep_zipcode_fornecedor: '01000-000',
    email_principal_fornecedor: 'contato@acme.test',
    telefone_principal_fornecedor: null,
    whatsapp_principal_fornecedor: null,
    pode_ser_importador_fornecedor: true,
    pode_ser_exportador_fornecedor: false,
    pode_ser_fabricante_fornecedor: false,
    pode_ser_agente_fornecedor: false,
    pode_ser_despachante_fornecedor: false,
    pode_ser_armador_fornecedor: false,
    pode_ser_cia_aerea_fornecedor: false,
    pode_ser_transportadora_rodoviaria_nacional_fornecedor: false,
    pode_ser_transportadora_rodoviaria_internacional_fornecedor: false,
    pode_ser_armazem_alfandegado_fornecedor: false,
    pode_ser_armazem_nacional_fornecedor: false,
    pode_ser_banco_fornecedor: false,
    pode_ser_seguradora_internacional_fornecedor: false,
    pode_ser_seguradora_corretora_cambio_fornecedor: false,
    ativo_fornecedor: true,
    criado_em_fornecedor: '2026-04-22T00:00:00.000Z',
    atualizado_em_fornecedor: '2026-04-22T00:00:00.000Z',
  }
}

describe('montarSnapshotEmpresa — contrato fornecedor', () => {
  it('mapeia id_fornecedor → suid_empresa e nome_fornecedor → nome_empresa', () => {
    const snap = montarSnapshotEmpresa(
      fornecedorBR('BR-ACME-00001'),
      'exportador',
      'org-test',
      'ws-test',
    )

    expect(snap.suid_empresa).toBe('BR-ACME-00001')
    expect(snap.nome_empresa).toBe('ACME Importadora')
    expect(snap.tipo_documento).toBe('CNPJ')
    expect(snap.documento_principal).toBe('12.345.678/0001-99')
    expect(snap.cnpj_raiz).toBe('12345678')
    expect(snap.endereco_cidade).toBe('Sao Paulo')
    expect(snap.endereco_uf).toBe('SP')
    expect(snap.endereco_pais).toBe('BR')
    expect(snap.papel).toBe('exportador')
    expect(snap.id_workspace).toBe('ws-test')
  })

  it('estrangeiro usa tin_fornecedor como documento TIN', () => {
    const snap = montarSnapshotEmpresa(
      {
        ...fornecedorBR('US-BUYER-00001'),
        cnpj_fornecedor: null,
        tin_fornecedor: 'US-EIN-123456789',
        pais_fornecedor: 'US',
        estado_provincia_fornecedor: 'NY',
        cidade_fornecedor: 'New York',
      },
      'importador',
      'org-test',
    )

    expect(snap.tipo_documento).toBe('TIN')
    expect(snap.documento_principal).toBe('US-EIN-123456789')
    expect(snap.cnpj_raiz).toBeNull()
    expect(snap.endereco_pais).toBe('US')
  })

  it('fornecedor sem documento gera snapshot com identidade preenchida', () => {
    const snap = montarSnapshotEmpresa(
      { ...fornecedorBR('BR-X-00001'), cnpj_fornecedor: null },
      'exportador',
      'org-test',
    )

    expect(snap.suid_empresa).toBe('BR-X-00001')
    expect(snap.nome_empresa).toBe('ACME Importadora')
    expect(snap.documento_principal).toBeNull()
    expect(snap.tipo_documento).toBeNull()
  })

  it('fornecedor sem id_fornecedor lança erro explícito', () => {
    expect(() =>
      montarSnapshotEmpresa(
        { ...fornecedorBR('BR-X-00001'), id_fornecedor: '' },
        'exportador',
        'org-test',
      ),
    ).toThrow(/Fornecedor incompleto para snapshot/)
  })
})
