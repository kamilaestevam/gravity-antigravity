/**
 * Rotas de OPE — APENAS leitura (Portal Único é fonte da verdade SISCOMEX).
 *
 * Onda 38 — DDD Cadastros: model Ope (renomeado de OPE) com fields físicos
 * sufixados em _ope; OpeHistoricoStatus com fields _ope_historico_status
 * casando com @@map. Contrato público preservado via toOpeDto/toEventoDto.
 *
 * O job de sincronização (não implementado nesta task) é o único autorizado
 * a escrever — edições manuais seriam sobrescritas no próximo ciclo.
 */
import { Router } from 'express'
import type { Ope as PrismaOpe, OpeHistoricoStatus as PrismaOpeEvento } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'

const router = Router()
router.use(requireInternalKey)

/**
 * ACL — traduz registro físico Ope (Prisma) para o contrato público
 * `opeSchema` (Zod), que expõe `id_organizacao` sem sufixo.
 */
function toOpeDto(o: PrismaOpe): Record<string, unknown> {
  return {
    suid_ope:                 o.suid_ope,
    id_organizacao:           o.id_organizacao_ope,
    codigo_portal_unico_ope:  o.codigo_portal_unico_ope,
    situacao_ope:             o.situacao_ope,
    versao_ope:               o.versao_ope,
    nome_ope:                 o.nome_ope,
    cnpj_raiz_empresa_ope:    o.cnpj_raiz_empresa_ope,
    pais_ope:                 o.pais_ope,
    estado_ope:               o.estado_ope,
    cidade_ope:               o.cidade_ope,
    endereco_ope:             o.endereco_ope,
    zip_ope:                  o.zip_ope,
    tin_ope:                  o.tin_ope,
    email_ope:                o.email_ope,
    ultima_sincronizacao_ope: o.ultima_sincronizacao_ope.toISOString(),
    origem_ope:               o.origem_ope,
  }
}

/**
 * ACL — eventos do histórico para resposta pública. Mantemos os nomes
 * antigos `_historico_status_ope` (sem sufixo invertido) que os
 * consumidores usavam, mapeando do físico `_ope_historico_status`.
 */
function toEventoDto(e: PrismaOpeEvento): Record<string, unknown> {
  return {
    id_historico_status_ope:              e.id_ope_historico_status,
    suid_ope_historico_status_ope:        e.suid_ope_historico_status,
    status_anterior_historico_status_ope: e.status_anterior_ope_historico_status,
    status_novo_historico_status_ope:     e.status_novo_ope_historico_status,
    origem_historico_status_ope:          e.origem_ope_historico_status,
    payload_historico_status_ope:         e.payload_ope_historico_status,
    registrado_em_historico_status_ope:   e.registrado_em_ope_historico_status.toISOString(),
  }
}

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
    const itens = await prisma.ope.findMany({
      where: { id_organizacao_ope: idOrganizacao },
      orderBy: { ultima_sincronizacao_ope: 'desc' },
    })
    const dto = itens.map(toOpeDto)
    res.status(200).json({ itens: dto, total: dto.length })
  } catch (err) {
    next(err)
  }
})

router.get('/:suid', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const ope = await prisma.ope.findFirst({
      where: { suid_ope: req.params.suid, id_organizacao_ope: idOrganizacao },
    })
    if (!ope) throw AppError.naoEncontrado('OPE')
    res.status(200).json(toOpeDto(ope))
  } catch (err) {
    next(err)
  }
})

router.get('/portal-unico/:codigo_portal_unico', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const ope = await prisma.ope.findFirst({
      where: { codigo_portal_unico_ope: req.params.codigo_portal_unico, id_organizacao_ope: idOrganizacao },
    })
    if (!ope) throw AppError.naoEncontrado('OPE')
    res.status(200).json(toOpeDto(ope))
  } catch (err) {
    next(err)
  }
})

router.get('/:suid/eventos', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const ope = await prisma.ope.findFirst({
      where: { suid_ope: req.params.suid, id_organizacao_ope: idOrganizacao },
      select: { suid_ope: true },
    })
    if (!ope) throw AppError.naoEncontrado('OPE')
    const eventos = await prisma.opeHistoricoStatus.findMany({
      where: { suid_ope_historico_status: req.params.suid },
      orderBy: { registrado_em_ope_historico_status: 'desc' },
      take: 100,
    })
    const dto = eventos.map(toEventoDto)
    res.status(200).json({ itens: dto, total: dto.length })
  } catch (err) {
    next(err)
  }
})

export { router as opeRouter }
