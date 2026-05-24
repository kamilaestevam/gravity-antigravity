import fs from 'fs'
import path from 'path'

const files = [
  'servicos-global/configurador/src/pages/configurador/EmpresasEParceiros.tsx',
  'servicos-global/configurador/src/pages/configurador/ModalEditarEmpresa.tsx',
  'servicos-global/configurador/src/pages/admin/EmpresasEParceirosAdmin.tsx',
  'servicos-global/produto/pedido/client/src/shared/cadastrosApi.ts',
  'servicos-global/configurador/server/services/organizacao-service.ts',
  'servicos-global/configurador/server/routes/admin-empresas.ts',
  'servicos-global/produto/pedido/client/src/components/ModalPedidoNovo.tsx',
  'servicos-global/produto/pedido/client/src/components/ModalEmpresaCadastroRapido.tsx',
  'servicos-global/produto/pedido/server/src/routes/fase4-pedidos-snapshot.test.ts',
]

const reps = [
  ['criarEmpresaSchema', 'criarFornecedorSchema'],
  ['atualizarEmpresaSchema', 'atualizarFornecedorSchema'],
  ['empresaSchema', 'fornecedorSchema'],
  ['listaEmpresasSchema', 'listaFornecedoresSchema'],
  ['suid_empresa', 'id_fornecedor'],
  ['nome_empresa', 'nome_fornecedor'],
  ['pais_empresa', 'pais_fornecedor'],
  ['cnpj_empresa', 'cnpj_fornecedor'],
  ['tin_empresa', 'tin_fornecedor'],
  ['estado_empresa', 'estado_provincia_fornecedor'],
  ['cidade_empresa', 'cidade_fornecedor'],
  ['endereco_empresa', 'endereco_fornecedor'],
  ['zipcode_empresa', 'cep_zipcode_fornecedor'],
  ['email_empresa', 'email_principal_fornecedor'],
  ['telefone_empresa', 'telefone_principal_fornecedor'],
  ['whatsapp_empresa', 'whatsapp_principal_fornecedor'],
  ['ativo_empresa', 'ativo_fornecedor'],
  ['criado_em_empresa', 'criado_em_fornecedor'],
  ['atualizado_em_empresa', 'atualizado_em_fornecedor'],
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
  ['/api/v1/admin/empresas', '/api/v1/admin/fornecedores'],
  ['/api/v1/empresas', '/api/v1/fornecedores'],
  ['criarEmpresa(', 'criarFornecedor('],
  ['compensarEmpresa(', 'compensarFornecedor('],
  ['empresaCadastros.suid_empresa', 'fornecedorCadastros.id_fornecedor'],
  ['const suid = empresaCadastros', 'const suid = fornecedorCadastros'],
  ['const empresaCadastros', 'const fornecedorCadastros'],
]

const root = path.resolve(import.meta.dirname, '..')

for (const rel of files) {
  const fp = path.join(root, rel)
  if (!fs.existsSync(fp)) {
    console.warn('skip', rel)
    continue
  }
  let s = fs.readFileSync(fp, 'utf8')
  for (const [a, b] of reps) s = s.split(a).join(b)
  fs.writeFileSync(fp, s)
  console.log('ok', rel)
}
