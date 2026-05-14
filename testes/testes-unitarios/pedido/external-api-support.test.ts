// @vitest-environment node
/**
 * Testa o suporte a chamadas S2S de API externa no produto Pedido.
 *
 * Verifica: resolveOrganizacaoById exportado, wrapper no resolverOrganizacao,
 * bypass do verificarAcessoProduto, escopo no exigirPermissao.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const indexPath = path.resolve(
  __dirname,
  '../../../servicos-global/produto/pedido/server/src/index.ts',
)
const indexContent = readFileSync(indexPath, 'utf-8')

const permissoesPath = path.resolve(
  __dirname,
  '../../../servicos-global/produto/pedido/server/src/permissoes.ts',
)
const permissoesContent = readFileSync(permissoesPath, 'utf-8')

const resolverIndexPath = path.resolve(
  __dirname,
  '../../../packages/resolver-organizacao/src/index.ts',
)
const resolverIndexContent = readFileSync(resolverIndexPath, 'utf-8')

describe('pedido/index.ts — suporte S2S external API', () => {
  it('importa resolveOrganizacaoById do resolver-organizacao', () => {
    expect(indexContent).toContain('resolveOrganizacaoById')
    expect(indexContent).toContain("from '@gravity/resolver-organizacao'")
  })

  it('wrapper detecta chamada S2S (sem JWT + com x-id-organizacao)', () => {
    expect(indexContent).toContain("x-id-organizacao")
    expect(indexContent).toContain('authorization')
    expect(indexContent).toContain('resolveOrganizacaoById(idOrg)')
  })

  it('marca req.externalApi = true para downstream', () => {
    expect(indexContent).toContain('externalApi')
  })

  it('wrapper do verificarAcessoProduto pula para externalApi', () => {
    expect(indexContent).toContain('_verificarAcesso')
    expect(indexContent).toContain('externalApi')
    expect(indexContent).toContain('return next()')
  })
})

describe('pedido/permissoes.ts — escopo do token para external API', () => {
  it('exigirPermissao verifica externalApi flag', () => {
    expect(permissoesContent).toContain('externalApi')
  })

  it('bloqueia token LEITURA em ação editar', () => {
    expect(permissoesContent).toContain("escopo === 'LEITURA'")
    expect(permissoesContent).toContain("acao === 'editar'")
  })

  it('lê escopo do header x-api-token-escopo', () => {
    expect(permissoesContent).toContain('x-api-token-escopo')
  })

  it('importa AppError para erro tipado', () => {
    expect(permissoesContent).toContain("AppError")
    expect(permissoesContent).toContain("from '@gravity/resolver-organizacao'")
  })
})

describe('resolver-organizacao/index.ts — resolveOrganizacaoById exportado', () => {
  it('exporta resolveOrganizacaoById publicamente', () => {
    expect(resolverIndexContent).toContain("export { resolveOrganizacaoById }")
  })
})
