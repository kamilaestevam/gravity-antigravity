/**
 * TST-FUNC-CAD-FOR-001 — GET/PUT/DELETE /fornecedores/:id_fornecedor usa
 * req.params.id_fornecedor (não id_empresa legado).
 *
 * Bug: após rename empresa→fornecedor, a rota virou `/:id_fornecedor` mas
 * handlers ainda liam `req.params.id_empresa` (undefined). Prisma omitia o
 * filtro por id e devolvia o PRIMEIRO fornecedor da org — tipicamente a
 * empresa-da-org (CDE). O POST /pedidos gravava snapshot de exportador com
 * nome da organização mesmo quando o usuário selecionava EXPORTADOR 777.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const RAIZ = resolve(__dirname, '../../..')

function lerArquivo(relativo: string): string {
  return readFileSync(resolve(RAIZ, relativo), 'utf8')
}

describe('fornecedores.ts — param da rota :id_fornecedor', () => {
  it('handlers usam req.params.id_fornecedor (não id_empresa legado)', () => {
    const conteudo = lerArquivo('servicos-global/cadastros/server/src/routes/fornecedores.ts')
    expect(conteudo).toContain('req.params.id_fornecedor')
    expect(conteudo).not.toContain('req.params.id_empresa')
  })

  it('gen-fornecedores-route.mjs traduz req.params.id_empresa → id_fornecedor', () => {
    const conteudo = lerArquivo('servicos-global/cadastros/scripts/gen-fornecedores-route.mjs')
    expect(conteudo).toContain("['req.params.id_empresa', 'req.params.id_fornecedor']")
  })
})
