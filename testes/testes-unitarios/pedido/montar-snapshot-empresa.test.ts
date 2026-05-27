/**
 * montarSnapshotIdentidadeComex — Empresa (1:1 org) e Fornecedor (parceiro).
 */
import { describe, it, expect } from 'vitest'
import {
  montarSnapshotIdentidadeComex,
  montarSnapshotDeEmpresa,
  montarSnapshotDeFornecedor,
} from '../../../servicos-global/produto/processos-core/src/services/pedidoSnapshots'
import type { Empresa } from '../../../servicos-global/cadastros/shared/schemas/empresa.schema'
import type { Fornecedor } from '../../../servicos-global/cadastros/shared/schemas/fornecedor.schema'

function empresaBR(id: string, cnpj = '12.345.678/0001-99'): Empresa {
  return {
    id_empresa: id,
    id_organizacao: 'org-test',
    nome_empresa: 'Gravity Org',
    cnpj_empresa: cnpj,
    tin_empresa: null,
    pais_empresa: 'BR',
    estado_provincia_empresa: 'SP',
    cidade_empresa: 'Sao Paulo',
    endereco_empresa: 'Rua Teste, 100',
    cep_zipcode_empresa: '01000-000',
    email_principal_empresa: 'contato@acme.test',
    telefone_principal_empresa: null,
    whatsapp_principal_empresa: null,
    pode_ser_importador_empresa: true,
    pode_ser_exportador_empresa: false,
    pode_ser_fabricante_empresa: false,
    pode_ser_agente_empresa: false,
    pode_ser_despachante_empresa: false,
    pode_ser_armador_empresa: false,
    pode_ser_cia_aerea_empresa: false,
    pode_ser_transportadora_rodoviaria_nacional_empresa: false,
    pode_ser_transportadora_rodoviaria_internacional_empresa: false,
    pode_ser_armazem_alfandegado_empresa: false,
    pode_ser_armazem_nacional_empresa: false,
    pode_ser_banco_empresa: false,
    pode_ser_seguradora_internacional_empresa: false,
    pode_ser_seguradora_corretora_cambio_empresa: false,
    ativo_empresa: true,
    criado_em_empresa: '2026-04-22T00:00:00.000Z',
    atualizado_em_empresa: '2026-04-22T00:00:00.000Z',
  }
}

function fornecedorBR(id: string, cnpj = '12.345.678/0001-99'): Fornecedor {
  return {
    id_fornecedor: id,
    id_organizacao: 'org-test',
    nome_fornecedor: 'ACME Parceiro',
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
    pode_ser_importador_fornecedor: false,
    pode_ser_exportador_fornecedor: true,
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

describe('montarSnapshotIdentidadeComex — DDD empresa × fornecedor', () => {
  it('Empresa: id_empresa → suid_empresa no snapshot', () => {
    const snap = montarSnapshotDeEmpresa(empresaBR('BR-ORG-00001'), 'importador', 'org-test', 'ws-test')
    expect(snap.suid_empresa).toBe('BR-ORG-00001')
    expect(snap.nome_empresa).toBe('Gravity Org')
    expect(snap.tipo_documento).toBe('CNPJ')
  })

  it('Fornecedor: id_fornecedor → suid_empresa no snapshot', () => {
    const snap = montarSnapshotDeFornecedor(fornecedorBR('BR-PAR-00002'), 'exportador', 'org-test')
    expect(snap.suid_empresa).toBe('BR-PAR-00002')
    expect(snap.nome_empresa).toBe('ACME Parceiro')
  })

  it('estrangeiro usa tin como documento TIN', () => {
    const snap = montarSnapshotIdentidadeComex(
      {
        ...fornecedorBR('US-BUYER-00001'),
        cnpj_fornecedor: null,
        tin_fornecedor: 'US-EIN-123456789',
        pais_fornecedor: 'US',
      },
      'importador',
      'org-test',
    )
    expect(snap.tipo_documento).toBe('TIN')
    expect(snap.documento_principal).toBe('US-EIN-123456789')
  })

  it('identidade sem documento gera snapshot com suid e nome', () => {
    const snap = montarSnapshotIdentidadeComex(
      { ...empresaBR('BR-X-00001'), cnpj_empresa: null },
      'exportador',
      'org-test',
    )
    expect(snap.documento_principal).toBeNull()
    expect(snap.tipo_documento).toBeNull()
  })

  it('identidade sem suid lança erro explícito', () => {
    expect(() =>
      montarSnapshotIdentidadeComex(
        { ...empresaBR('BR-X-00001'), id_empresa: '' },
        'exportador',
        'org-test',
      ),
    ).toThrow(/Empresa incompleto para snapshot/)
  })
})
