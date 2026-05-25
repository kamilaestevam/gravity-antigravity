// TST-FUNC-PED-CAD-001 — cadastrosApi expõe criarFornecedor (rename empresa→fornecedor)
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(import.meta.dirname, '../../..')

function lerArquivo(caminho: string): string {
  return readFileSync(resolve(ROOT, caminho), 'utf-8')
}

describe('cadastrosApi — cadastro rápido de fornecedor', () => {
  it('deve exportar criarFornecedor no cadastrosApi', () => {
    const conteudo = lerArquivo('servicos-global/produto/pedido/client/src/shared/cadastrosApi.ts')
    expect(conteudo).toMatch(/criarFornecedor:\s*criarFornecedorRapido/)
  })

  it('ModalEmpresaCadastroRapido deve chamar cadastrosApi.criarFornecedor', () => {
    const conteudo = lerArquivo(
      'servicos-global/produto/pedido/client/src/components/ModalEmpresaCadastroRapido.tsx',
    )
    expect(conteudo).toContain('cadastrosApi.criarFornecedor(')
    expect(conteudo).not.toContain('cadastrosApi.criarEmpresa(')
  })
})
