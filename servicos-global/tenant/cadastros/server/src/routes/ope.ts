/**
 * Rotas de OPE — APENAS leitura (Portal Único é fonte da verdade SISCOMEX).
 * O job de sincronização (não implementado nesta task) é o único autorizado
 * a escrever — edições manuais seriam sobrescritas no próximo ciclo.
 */
import { Router } from 'express'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'

const router = Router()
router.use(requireInternalKey)

function extrairIdOrganizacao(req: import('express').Request): string {
  const header = req.headers['x-organizacao-id']
  const fromHeader = typeof header === 'string' ? header : undefined
  const fromQuery = typeof req.query.id_organizacao === 'string' ? req.query.id_organizacao : undefined
  const escolhido = fromHeader ?? fromQuery
  if (!escolhido) {
    throw new AppError(
      'id_organizacao é obrigatório (header x-organizacao-id ou query ?id_organizacao=)',
      400,
      'ORGANIZACAO_AUSENTE',
    )
  }
  return escolhido
}

router.get('/', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const itens = await prisma.oPE.findMany({
      where: { id_organizacao: idOrganizacao },
      orderBy: { ultima_sincronizacao_ope: 'desc' },
    })
    res.status(200).json({ itens, total: itens.length })
  } catch (err) {
    next(err)
  }
})

router.get('/:suid', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const ope = await prisma.oPE.findFirst({
      where: { suid_ope: req.params.suid, id_organizacao: idOrganizacao },
    })
    if (!ope) throw AppError.naoEncontrado('OPE')
    res.status(200).json(ope)
  } catch (err) {
    next(err)
  }
})

router.get('/portal-unico/:codigo_portal_unico', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const ope = await prisma.oPE.findFirst({
      where: { codigo_portal_unico_ope: req.params.codigo_portal_unico, id_organizacao: idOrganizacao },
    })
    if (!ope) throw AppError.naoEncontrado('OPE')
    res.status(200).json(ope)
  } catch (err) {
    next(err)
  }
})

router.get('/:suid/eventos', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const ope = await prisma.oPE.findFirst({
      where: { suid_ope: req.params.suid, id_organizacao: idOrganizacao },
      select: { suid_ope: true },
    })
    if (!ope) throw AppError.naoEncontrado('OPE')
    const eventos = await prisma.opeHistoricoStatus.findMany({
      where: { suid_ope_historico_status_ope: req.params.suid },
      orderBy: { registrado_em_historico_status_ope: 'desc' },
      take: 100,
    })
    res.status(200).json({ itens: eventos, total: eventos.length })
  } catch (err) {
    next(err)
  }
})

export { router as opeRouter }
