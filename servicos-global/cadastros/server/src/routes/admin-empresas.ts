/**
 * GET /api/v1/admin/empresas — listagem CROSS-ORGANIZAÇÃO de empresas.
 *
 * Endpoint S2S exclusivo para admins Gravity (SUPER_ADMIN/ADMIN). Não usa
 * `extrairIdOrganizacao`. Lista empresas de TODAS as organizações.
 *
 * LINT-EXCEPTION: admin endpoint, S2S only, audit logged. Ver
 * skills/governanca/convencao-tecnica/lint-tenant-safety/SKILL.md (seção
 * "Exceções permitidas") — a omissão do filtro `id_organizacao_empresa` só é
 * autorizada se TODAS as condições abaixo forem verdadeiras:
 *   (a) Auth via `requireInternalKey` (S2S only)
 *   (b) Audit log persistente em `audit_log_admin` (gravado pelo proxy do
 *       Configurador antes/depois de chamar este endpoint)
 *   (c) Teto duro `por_pagina <= 200`
 *   (d) Sem aceitação de body — apenas query string
 *
 * Convenção:
 * - Apenas GET /. Não há POST/PUT/DELETE no escopo admin (read-only).
 * - Filtros aceitos via query: `id_organizacao?`, `tipo_parceiro?`, `pais?`,
 *   `pagina?`, `por_pagina?` (default 50, max 200).
 * - `tipo_parceiro` é mapeado para a flag `pode_ser_<tipo>_empresa = true`.
 * - Resposta inclui `alerta_volume = true` quando `total > 500` (frontend
 *   exibe modal de aviso).
 *
 * Skill: skills/produtos-gravity/configurador/admin/SKILL.md (seção
 * "Empresas e Parceiros — Cross-Org").
 */
import { Router } from 'express'
import { Prisma, type Empresa as PrismaEmpresa } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'

const router = Router()
router.use(requireInternalKey)

const TIPOS_PARCEIRO_VALIDOS = new Set([
  'importador',
  'exportador',
  'fabricante',
  'agente',
  'despachante',
  'armador',
  'cia_aerea',
  'transportadora_rodoviaria_nacional',
  'transportadora_rodoviaria_internacional',
  'armazem_alfandegado',
  'armazem_nacional',
  'banco',
  'seguradora_internacional',
  'seguradora_corretora_cambio',
])

/**
 * ACL para o endpoint admin — preserva todos os campos do tenant DTO.
 * `nome_organizacao` é enriquecido pelo proxy do Configurador (este
 * endpoint não tem acesso ao banco do Configurador).
 */
function toEmpresaAdminDto(e: PrismaEmpresa): Record<string, unknown> {
  return {
    suid_empresa:                                              e.suid_empresa,
    id_organizacao:                                            e.id_organizacao_empresa,
    nome_empresa:                                              e.nome_empresa,
    cnpj_empresa:                                              e.cnpj_empresa,
    tin_empresa:                                               e.tin_empresa,
    pais_empresa:                                              e.pais_empresa,
    estado_empresa:                                            e.estado_empresa,
    cidade_empresa:                                            e.cidade_empresa,
    endereco_empresa:                                          e.endereco_empresa,
    zipcode_empresa:                                           e.zipcode_empresa,
    email_empresa:                                             e.email_empresa,
    telefone_empresa:                                          e.telefone_empresa,
    whatsapp_empresa:                                          e.whatsapp_empresa,
    pode_ser_importador_empresa:                               e.pode_ser_importador_empresa,
    pode_ser_exportador_empresa:                               e.pode_ser_exportador_empresa,
    pode_ser_fabricante_empresa:                               e.pode_ser_fabricante_empresa,
    pode_ser_agente_empresa:                                   e.pode_ser_agente_empresa,
    pode_ser_despachante_empresa:                              e.pode_ser_despachante_empresa,
    pode_ser_armador_empresa:                                  e.pode_ser_armador_empresa,
    pode_ser_cia_aerea_empresa:                                e.pode_ser_cia_aerea_empresa,
    pode_ser_transportadora_rodoviaria_nacional_empresa:       e.pode_ser_transportadora_rodoviaria_nacional_empresa,
    pode_ser_transportadora_rodoviaria_internacional_empresa:  e.pode_ser_transportadora_rodoviaria_internacional_empresa,
    pode_ser_armazem_alfandegado_empresa:                      e.pode_ser_armazem_alfandegado_empresa,
    pode_ser_armazem_nacional_empresa:                         e.pode_ser_armazem_nacional_empresa,
    pode_ser_banco_empresa:                                    e.pode_ser_banco_empresa,
    pode_ser_seguradora_internacional_empresa:                 e.pode_ser_seguradora_internacional_empresa,
    pode_ser_seguradora_corretora_cambio_empresa:              e.pode_ser_seguradora_corretora_cambio_empresa,
    ativo_empresa:                                             e.ativo_empresa,
    criado_em_empresa:                                         e.criado_em_empresa.toISOString(),
    atualizado_em_empresa:                                     e.atualizado_em_empresa.toISOString(),
    // nome_organizacao preenchido pelo proxy do Configurador via batch IN(...).
    // Aqui retornamos string vazia — o proxy SOBRESCREVE antes de devolver.
    nome_organizacao: '',
  }
}

/**
 * Constrói filtro Prisma a partir de `tipo_parceiro` (alias amigável que
 * vem do frontend). Falha alta (Mand. 08) — tipo desconhecido vira 400.
 */
function filtroPorTipoParceiro(tipoParceiro: string): Prisma.EmpresaWhereInput {
  if (!TIPOS_PARCEIRO_VALIDOS.has(tipoParceiro)) {
    throw new AppError(
      `tipo_parceiro inválido: '${tipoParceiro}'. Aceitos: ${Array.from(TIPOS_PARCEIRO_VALIDOS).join(', ')}`,
      400,
      'TIPO_PARCEIRO_INVALIDO',
    )
  }
  // Mapeia o alias para o campo físico `pode_ser_<tipo>_empresa = true`.
  const campo = `pode_ser_${tipoParceiro}_empresa` as keyof Prisma.EmpresaWhereInput
  return { [campo]: true } as Prisma.EmpresaWhereInput
}

// ---------------------------------------------------------------------------
// GET /api/v1/admin/empresas — listagem cross-org
// ---------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    // Parsing seguro de paginação (teto duro 200).
    const pagina = Math.max(1, Number(req.query.pagina ?? 1))
    const porPagina = Math.min(200, Math.max(1, Number(req.query.por_pagina ?? 50)))

    const filtroIdOrganizacao =
      typeof req.query.id_organizacao === 'string' && req.query.id_organizacao.length > 0
        ? req.query.id_organizacao
        : undefined
    const filtroTipoParceiro =
      typeof req.query.tipo_parceiro === 'string' && req.query.tipo_parceiro.length > 0
        ? req.query.tipo_parceiro
        : undefined
    const filtroPais =
      typeof req.query.pais === 'string' && req.query.pais.length > 0
        ? req.query.pais.toUpperCase()
        : undefined
    const filtroBusca =
      typeof req.query.busca === 'string' && req.query.busca.length > 0
        ? req.query.busca
        : undefined

    // ATENÇÃO LINT-EXCEPTION: where SEM filtro obrigatório de id_organizacao.
    // Quando filtroIdOrganizacao vier no query, aplicamos; caso contrário,
    // consulta cross-organização (auditada pelo proxy do Configurador).
    const where: Prisma.EmpresaWhereInput = {
      ...(filtroIdOrganizacao ? { id_organizacao_empresa: filtroIdOrganizacao } : {}),
      ...(filtroTipoParceiro ? filtroPorTipoParceiro(filtroTipoParceiro) : {}),
      ...(filtroPais ? { pais_empresa: filtroPais } : {}),
      ...(filtroBusca ? { nome_empresa: { contains: filtroBusca, mode: 'insensitive' } } : {}),
    }

    const [itens, total] = await Promise.all([
      prisma.empresa.findMany({
        where,
        orderBy: [
          { id_organizacao_empresa: 'asc' },
          { nome_empresa: 'asc' },
        ],
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.empresa.count({ where }),
    ])

    const alertaVolume = total > 500

    res.status(200).json({
      itens: itens.map(toEmpresaAdminDto),
      total,
      pagina,
      por_pagina: porPagina,
      alerta_volume: alertaVolume,
    })
  } catch (err) {
    next(err)
  }
})

export { router as adminEmpresasRouter }
