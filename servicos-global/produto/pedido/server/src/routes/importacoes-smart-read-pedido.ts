/**
 * importacoes-smart-read-pedido.ts — Ponte Smart Docs → Pedido (S2S)
 *
 * POST /api/v1/pedidos/importacoes-smart-read/criar
 */
import { Router, Request, Response, NextFunction } from 'express'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { CriarPedidoDeLeituraSmartReadRequestSchema } from '../../../../smart-read/shared/conversao-leitura-pedido-smart-read-schema.js'
import { criarSmartReadParaPedidoService } from '../services/smartReadParaPedidoService.js'
import { exigirPermissao } from '../permissoes.js'

export const importacoesSmartReadPedidoRouter = Router()

importacoesSmartReadPedidoRouter.use(exigirPermissao('lista', 'editar'))

importacoesSmartReadPedidoRouter.post('/criar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = CriarPedidoDeLeituraSmartReadRequestSchema.parse(req.body)
    const idUsuario = (req.headers['x-id-usuario'] as string | undefined) ?? ''
    const nomeUsuario = (req.headers['x-nome-usuario'] as string | undefined) ?? idUsuario

    await withOrganizacao(req, async (rawDb) => {
      const ctx = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idWorkspace = req.headers['x-id-workspace'] as string | undefined
      if (!idWorkspace || idWorkspace === ctx.idOrganizacao) {
        res.status(400).json({
          error: {
            code: 'WORKSPACE_OBRIGATORIO',
            message: 'Header x-id-workspace obrigatorio e deve ser um workspace valido.',
          },
        })
        return
      }
      const service = criarSmartReadParaPedidoService(rawDb)
      const resultado = await service.criarDeLeitura({
        idOrganizacao: ctx.idOrganizacao,
        idUsuario,
        idWorkspace,
        nomeUsuario,
        payload,
      })
      res.status(201).json(resultado)
    })
  } catch (err) {
    next(err)
  }
})
