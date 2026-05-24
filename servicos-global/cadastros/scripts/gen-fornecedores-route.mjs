import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../server/src/routes')
let s = fs.readFileSync(path.join(dir, 'empresas.ts'), 'utf8')

const reps = [
  ['empresasRouter', 'fornecedoresRouter'],
  ['criarEmpresaSchema', 'criarFornecedorSchema'],
  ['atualizarEmpresaSchema', 'atualizarFornecedorSchema'],
  ['toEmpresaDto', 'toFornecedorDto'],
  ['prisma.empresa', 'prisma.fornecedor'],
  ['type Empresa as PrismaEmpresa', 'type Fornecedor as PrismaFornecedor'],
  ['PrismaEmpresa', 'PrismaFornecedor'],
  ['EmpresaWhereInput', 'FornecedorWhereInput'],
  ['suid_empresa', 'id_fornecedor'],
  ['id_organizacao_empresa', 'id_organizacao_cadastro_fornecedor'],
  ['id_produto_empresa', 'id_produto_fornecedor'],
  ['id_usuario_empresa', 'id_usuario_cadastro_fornecedor'],
  ['nome_empresa', 'nome_fornecedor'],
  ['cnpj_empresa', 'cnpj_fornecedor'],
  ['tin_empresa', 'tin_fornecedor'],
  ['pais_empresa', 'pais_fornecedor'],
  ['estado_empresa', 'estado_provincia_fornecedor'],
  ['cidade_empresa', 'cidade_fornecedor'],
  ['endereco_empresa', 'endereco_fornecedor'],
  ['zipcode_empresa', 'cep_zipcode_fornecedor'],
  ['email_empresa', 'email_principal_fornecedor'],
  ['telefone_empresa', 'telefone_principal_fornecedor'],
  ['whatsapp_empresa', 'whatsapp_principal_fornecedor'],
  ['pode_ser_importador_empresa', 'pode_ser_importador_fornecedor'],
  ['pode_ser_exportador_empresa', 'pode_ser_exportador_fornecedor'],
  ['pode_ser_fabricante_empresa', 'pode_ser_fabricante_fornecedor'],
  ['pode_ser_agente_empresa', 'pode_ser_agente_fornecedor'],
  ['pode_ser_despachante_empresa', 'pode_ser_despachante_fornecedor'],
  ['pode_ser_armador_empresa', 'pode_ser_armador_fornecedor'],
  ['pode_ser_cia_aerea_empresa', 'pode_ser_cia_aerea_fornecedor'],
  ['pode_ser_transportadora_rodoviaria_nacional_empresa', 'pode_ser_transportadora_rodoviaria_nacional_fornecedor'],
  ['pode_ser_transportadora_rodoviaria_internacional_empresa', 'pode_ser_transportadora_rodoviaria_internacional_fornecedor'],
  ['pode_ser_armazem_alfandegado_empresa', 'pode_ser_armazem_alfandegado_fornecedor'],
  ['pode_ser_armazem_nacional_empresa', 'pode_ser_armazem_nacional_fornecedor'],
  ['pode_ser_banco_empresa', 'pode_ser_banco_fornecedor'],
  ['pode_ser_seguradora_internacional_empresa', 'pode_ser_seguradora_internacional_fornecedor'],
  ['pode_ser_seguradora_corretora_cambio_empresa', 'pode_ser_seguradora_corretora_cambio_fornecedor'],
  ['ativo_empresa', 'ativo_fornecedor'],
  ['criado_em_empresa', 'criado_em_fornecedor'],
  ['atualizado_em_empresa', 'atualizado_em_fornecedor'],
  ['/:id_empresa', '/:id_fornecedor'],
  ["'empresa'", "'fornecedor'"],
  ['/empresas', '/fornecedores'],
  ['Empresa duplicada', 'Fornecedor duplicado'],
  ["AppError.naoEncontrado('Empresa')", "AppError.naoEncontrado('Fornecedor')"],
  ['empresa-da-org', 'fornecedor-da-org'],
  ['EMPRESA_DA_ORG', 'FORNECEDOR_DA_ORG'],
  ['EMPRESA_NAO_CADASTRADA', 'FORNECEDOR_NAO_CADASTRADO'],
  ['Empresa da Organização', 'Fornecedor da Organização'],
  ['empresa fantasma', 'fornecedor fantasma'],
  ['CRUD de Empresa', 'CRUD de Fornecedor'],
  ['let empresa =', 'let fornecedor ='],
  ['const empresa =', 'const fornecedor ='],
  ['empresa = await', 'fornecedor = await'],
  ['if (!empresa)', 'if (!fornecedor)'],
  ['toFornecedorDto(empresa)', 'toFornecedorDto(fornecedor)'],
  ['empresaSchema', 'fornecedorSchema'],
]

for (const [from, to] of reps) {
  s = s.split(from).join(to)
}

fs.writeFileSync(path.join(dir, 'fornecedores.ts'), s)

let admin = fs.readFileSync(path.join(dir, 'admin-empresas.ts'), 'utf8')
const adminReps = [
  ...reps,
  ['adminEmpresasRouter', 'adminFornecedoresRouter'],
  ['/admin/empresas', '/admin/fornecedores'],
  ['admin/empresas', 'admin/fornecedores'],
  ['empresas de TODAS', 'fornecedores de TODAS'],
  ['listagem CROSS-ORGANIZAÇÃO de empresas', 'listagem CROSS-ORGANIZAÇÃO de fornecedores'],
  ['toEmpresaAdminDto', 'toFornecedorAdminDto'],
  ['Prisma.EmpresaWhereInput', 'Prisma.FornecedorWhereInput'],
  ['prisma.empresa', 'prisma.fornecedor'],
  ['pode_ser_<tipo>_empresa', 'pode_ser_<tipo>_fornecedor'],
  ['id_organizacao_empresa', 'id_organizacao_cadastro_fornecedor'],
  ['pais_empresa', 'pais_fornecedor'],
]
for (const [from, to] of adminReps) {
  admin = admin.split(from).join(to)
}
fs.writeFileSync(path.join(dir, 'admin-fornecedores.ts'), admin)
console.log('fornecedores.ts + admin-fornecedores.ts written')
