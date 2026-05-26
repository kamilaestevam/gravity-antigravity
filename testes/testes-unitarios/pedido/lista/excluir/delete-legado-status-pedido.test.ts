/**
 * Regressão — DELETE /pedidos/:id legado usa status_pedido (não status).
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const RAIZ = resolve(__dirname, '../../../../../')

describe('DELETE /pedidos/:id — rota legada', () => {
  it('valida status_pedido e decodifica id na URL', () => {
    const conteudo = readFileSync(
      resolve(RAIZ, 'servicos-global/produto/processos-core/src/routes/pedidos.ts'),
      'utf8',
    )
    const blocoDelete = conteudo.slice(conteudo.indexOf("pedidosRouter.delete('/:id'"))
    expect(blocoDelete).toContain('decodeURIComponent(req.params.id)')
    expect(blocoDelete).toContain('pedido.status_pedido')
    expect(blocoDelete).not.toMatch(/pedido\.status[^_]/)
  })
})
