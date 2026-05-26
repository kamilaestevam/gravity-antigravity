/**
 * TST-FUNC-CAD-ORG-001 — GET /fornecedores/da-organizacao e cascata empresa-org.
 *
 * Valida contrato estático + shape Zod esperado pelo Pedido (Novo Pedido).
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fornecedorSchema } from '../../../servicos-global/cadastros/shared/schemas/fornecedor.schema.js'

const RAIZ = resolve(__dirname, '../../..')

function lerArquivo(relativo: string): string {
  return readFileSync(resolve(RAIZ, relativo), 'utf8')
}

describe('GET /fornecedores/da-organizacao — rota e resolver', () => {
  it('fornecedores.ts expõe rota /da-organizacao antes de /:id_fornecedor', () => {
    const conteudo = lerArquivo('servicos-global/cadastros/server/src/routes/fornecedores.ts')
    const idxDaOrg = conteudo.indexOf("router.get('/da-organizacao'")
    const idxParam = conteudo.indexOf("router.get('/:id_fornecedor'")
    expect(idxDaOrg).toBeGreaterThan(-1)
    expect(idxParam).toBeGreaterThan(-1)
    expect(idxDaOrg).toBeLessThan(idxParam)
  })

  it('empresa-org.service usa cascata empresa → SUID → fornecedor', () => {
    const conteudo = lerArquivo('servicos-global/cadastros/server/src/services/empresa-org.service.ts')
    expect(conteudo).toContain('obterEmpresaDaOrganizacao')
    expect(conteudo).toMatch(/empresa\.findUnique|empresa\.findFirst/)
    expect(conteudo).toMatch(/fornecedor\.findFirst/)
  })

  it('empresas.ts expõe GET /empresas/da-organizacao (SSOT §4.1)', () => {
    const conteudo = lerArquivo('servicos-global/cadastros/server/src/routes/empresas.ts')
    expect(conteudo).toContain("router.get('/da-organizacao'")
  })

  it('errorHandler mapeia P2021 (tabela ausente) para 503, não P2002', () => {
    const conteudo = lerArquivo('servicos-global/cadastros/server/src/lib/app-error.ts')
    expect(conteudo).toContain("'P2021'")
    expect(conteudo).not.toMatch(/CODIGOS_PRISMA_INFRA[\s\S]*'P2002'/)
  })
})

describe('Contrato fornecedorSchema — compat Pedido Novo Pedido', () => {
  it('parse aceita DTO compatível retornado por empresaParaFornecedorCompatDto', () => {
    const dto = {
      id_fornecedor: 'BR-ORG-00001',
      id_organizacao: 'org-test',
      nome_fornecedor: 'Gravity Org',
      cnpj_fornecedor: '12.345.678/0001-99',
      tin_fornecedor: null,
      pais_fornecedor: 'BR',
      estado_provincia_fornecedor: 'SP',
      cidade_fornecedor: 'Sao Paulo',
      endereco_fornecedor: null,
      cep_zipcode_fornecedor: null,
      email_principal_fornecedor: null,
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
      criado_em_fornecedor: '2026-05-01T12:00:00.000Z',
      atualizado_em_fornecedor: '2026-05-01T12:00:00.000Z',
    }
    expect(fornecedorSchema.safeParse(dto).success).toBe(true)
  })

  it('parse rejeita shape legado empresa (id_empresa / nome_empresa)', () => {
    const legado = {
      id_empresa: 'emp-001',
      id_organizacao: 'org-test',
      nome_empresa: 'Gravity Org',
      pais_empresa: 'BR',
    }
    expect(fornecedorSchema.safeParse(legado).success).toBe(false)
  })
})
