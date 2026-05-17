/**
 * CRUD de Empresa (cartório de identidades COMEX).
 *
 * Onda 38 — DDD Cadastros: campos físicos com sufixo _empresa
 * (id_organizacao_empresa, id_produto_empresa, id_usuario_empresa).
 * Contrato público de API mantido — `toEmpresaDto()` traduz para o nome
 * exposto na schema Zod (`id_organizacao` sem sufixo).
 *
 * - Toda query filtra por `id_organizacao_empresa` (Tenant Isolation).
 * - 404 ao buscar SUID alheio (não 403 — não vazamos existência).
 * - Soft delete via `ativo_empresa = false` (DELETE /empresas/:id_empresa).
 * - Hard delete (DELETE /empresas/:id_empresa/compensacao) — exclusivo para
 *   compensação de saga inter-serviço quando a criação da Organizacao no
 *   Configurador falha após a Empresa ter sido criada aqui.
 * - SUID gerado por `gerarSuid()` no formato `${PAIS}-${SLUG}-${SEQ_5}`.
 */
import { Router } from 'express'
import { Prisma, type Empresa as PrismaEmpresa } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import {
  criarEmpresaSchema,
  atualizarEmpresaSchema,
} from '../../../shared/schemas/index.js'
import { gerarSuid } from '../utils/gerar-suid.js'
import { consultarImpacto } from '../services/preview-impacto.js'
import { notificarMudancaEntidade } from '../services/notifyPedido.js'

const router = Router()
router.use(requireInternalKey)

/**
 * ACL — traduz registro físico (Prisma) para o contrato público da API.
 * Preserva `id_organizacao` sem sufixo conforme `empresaSchema` (Zod).
 */
function toEmpresaDto(e: PrismaEmpresa): Record<string, unknown> {
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
    pode_ser_armazem_alfandegado_empresa:                      e.pode_ser_armazem_alfandegado_empresa,
    pode_ser_transportadora_rodoviaria_nacional_empresa:       e.pode_ser_transportadora_rodoviaria_nacional_empresa,
    pode_ser_cia_aerea_empresa:                                e.pode_ser_cia_aerea_empresa,
    pode_ser_transportadora_rodoviaria_internacional_empresa:  e.pode_ser_transportadora_rodoviaria_internacional_empresa,
    pode_ser_seguradora_internacional_empresa:                 e.pode_ser_seguradora_internacional_empresa,
    pode_ser_seguradora_corretora_cambio_empresa:              e.pode_ser_seguradora_corretora_cambio_empresa,
    pode_ser_banco_empresa:                                    e.pode_ser_banco_empresa,
    pode_ser_armazem_nacional_empresa:                         e.pode_ser_armazem_nacional_empresa,
    ativo_empresa:                                             e.ativo_empresa,
    criado_em_empresa:                                         e.criado_em_empresa.toISOString(),
    atualizado_em_empresa:                                     e.atualizado_em_empresa.toISOString(),
  }
}

/**
 * Lê e valida `id_organizacao` da query OU do header `x-id-organizacao`.
 * Header tem precedência (caminho oficial inter-serviço — DDD canônico
 * do Gravity, alinhado com `request()` do frontend e demais serviços).
 *
 * Compat: também aceita `x-organizacao-id` (nome legado) para não quebrar
 * chamadas internas que ainda não migraram (ver preview-impacto.ts).
 */
function extrairIdOrganizacao(req: import('express').Request): string {
  const headerCanonico = req.headers['x-id-organizacao']
  const headerLegado = req.headers['x-organizacao-id']
  const fromHeader =
    typeof headerCanonico === 'string' ? headerCanonico
    : typeof headerLegado === 'string' ? headerLegado
    : undefined
  const fromQuery = typeof req.query.id_organizacao === 'string' ? req.query.id_organizacao : undefined
  const escolhido = fromHeader ?? fromQuery
  if (!escolhido || escolhido.length === 0) {
    throw new AppError(
      'id_organizacao é obrigatório (header x-id-organizacao ou query ?id_organizacao=)',
      400,
      'ORGANIZACAO_AUSENTE',
    )
  }
  return escolhido
}

// ---------------------------------------------------------------------------
// POST /empresas — cria
// ---------------------------------------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    // Fallback: se id_organizacao não vier no body, tenta do header
    // (caminho oficial S2S). Mantém validação Zod intacta — apenas
    // injeta o valor antes do parse para que o schema não falhe.
    const bodyComOrg =
      req.body && typeof req.body === 'object' && !(req.body as { id_organizacao?: string }).id_organizacao
        ? (() => {
            try {
              return { ...req.body, id_organizacao: extrairIdOrganizacao(req) }
            } catch {
              return req.body // deixa Zod falhar com mensagem clara
            }
          })()
        : req.body
    const dados = criarEmpresaSchema.parse(bodyComOrg)
    const suid_empresa = dados.suid_empresa ?? (await gerarSuid(prisma, {
      id_organizacao: dados.id_organizacao,
      pais_empresa: dados.pais_empresa,
      nome_empresa: dados.nome_empresa,
    }))

    const criada = await prisma.empresa.create({
      data: {
        suid_empresa,
        id_organizacao_empresa: dados.id_organizacao,
        nome_empresa: dados.nome_empresa,
        cnpj_empresa: dados.cnpj_empresa ?? null,
        tin_empresa: dados.tin_empresa ?? null,
        pais_empresa: dados.pais_empresa,
        estado_empresa: dados.estado_empresa ?? null,
        cidade_empresa: dados.cidade_empresa ?? null,
        endereco_empresa: dados.endereco_empresa ?? null,
        zipcode_empresa: dados.zipcode_empresa ?? null,
        email_empresa: dados.email_empresa ?? null,
        telefone_empresa: dados.telefone_empresa ?? null,
        whatsapp_empresa: dados.whatsapp_empresa ?? null,
        pode_ser_importador_empresa: dados.pode_ser_importador_empresa,
        pode_ser_exportador_empresa: dados.pode_ser_exportador_empresa,
        pode_ser_fabricante_empresa: dados.pode_ser_fabricante_empresa,
        pode_ser_agente_empresa: dados.pode_ser_agente_empresa,
        pode_ser_despachante_empresa: dados.pode_ser_despachante_empresa,
        pode_ser_armador_empresa: dados.pode_ser_armador_empresa,
        pode_ser_cia_aerea_empresa: dados.pode_ser_cia_aerea_empresa,
        pode_ser_transportadora_rodoviaria_nacional_empresa: dados.pode_ser_transportadora_rodoviaria_nacional_empresa,
        pode_ser_transportadora_rodoviaria_internacional_empresa: dados.pode_ser_transportadora_rodoviaria_internacional_empresa,
        pode_ser_armazem_alfandegado_empresa: dados.pode_ser_armazem_alfandegado_empresa,
        pode_ser_armazem_nacional_empresa: dados.pode_ser_armazem_nacional_empresa,
        pode_ser_banco_empresa: dados.pode_ser_banco_empresa,
        pode_ser_seguradora_internacional_empresa: dados.pode_ser_seguradora_internacional_empresa,
        pode_ser_seguradora_corretora_cambio_empresa: dados.pode_ser_seguradora_corretora_cambio_empresa,
        ativo_empresa: dados.ativo_empresa,
      },
    })
    // Webhook fire-and-forget: notifica Pedido para reavaliar snapshots.
    void notificarMudancaEntidade('empresa', criada.suid_empresa, criada.id_organizacao_empresa)
    res.status(201).json(toEmpresaDto(criada))
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(AppError.conflito('Empresa duplicada (SUID, CNPJ ou TIN já existente para este tenant)'))
    }
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /empresas — lista paginada
// ---------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const pagina = Math.max(1, Number(req.query.pagina ?? 1))
    const porPagina = Math.min(200, Math.max(1, Number(req.query.por_pagina ?? 50)))
    const podeSerImportador = req.query.pode_ser_importador_empresa === 'true' ? true : undefined
    const pais_empresa = typeof req.query.pais_empresa === 'string' ? req.query.pais_empresa : undefined
    const busca = typeof req.query.busca === 'string' ? req.query.busca : undefined

    const where: Prisma.EmpresaWhereInput = {
      id_organizacao_empresa: idOrganizacao,
      ...(podeSerImportador !== undefined ? { pode_ser_importador_empresa: true } : {}),
      ...(pais_empresa ? { pais_empresa } : {}),
      ...(busca ? { nome_empresa: { contains: busca, mode: 'insensitive' } } : {}),
    }

    const [itens, total] = await Promise.all([
      prisma.empresa.findMany({
        where,
        orderBy: { nome_empresa: 'asc' },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.empresa.count({ where }),
    ])

    res.status(200).json({ itens: itens.map(toEmpresaDto), total, pagina, por_pagina: porPagina })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /empresas/da-organizacao — resolve a empresa-da-organização (1:1)
//
// Distingue a empresa-da-org das demais (parceiros importadores/exportadores
// estrangeiros, fabricantes etc.) via lookup cross-banco no Configurador:
// Organizacao.suid_empresa_organizacao aponta para a empresa "de si mesma"
// no Cadastros.
//
// Caminho oficial pra:
//   - Auto-fill do lado-da-organização no ModalPedidoNovo (Importador em
//     IMPORTACAO, Exportador em EXPORTACAO).
//
// Falha alta (Mand. 08):
//   - 404 com código EMPRESA_DA_ORG_AUSENTE se a Organizacao não tem
//     suid_empresa_organizacao (onboarding incompleto)
//   - 404 com código EMPRESA_NAO_CADASTRADA se o suid existe na Organizacao
//     mas a Empresa não está em cadastros (drift cross-banco)
//
// IMPORTANTE: rota declarada ANTES de `/:id_empresa` para evitar shadowing.
// ---------------------------------------------------------------------------
router.get('/da-organizacao', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)

    // Resolve suid_empresa_organizacao consultando o Configurador (S2S).
    const baseUrlConfigurador = process.env.CONFIGURADOR_BASE_URL ?? 'http://localhost:8005'
    // Mand. 08 — sem fallback silencioso. Sem chave configurada, falha alto
    // com 500 explícito em vez de mandar string vazia e receber 401 indistinguível.
    const internalKey = process.env.CHAVE_INTERNA_SERVICO
    if (!internalKey) {
      throw new AppError(
        'CHAVE_INTERNA_SERVICO ausente no .env do Cadastros',
        500,
        'CONFIG_ERROR',
      )
    }
    const url = `${baseUrlConfigurador.replace(/\/$/, '')}/api/v1/internal/organizacoes/${encodeURIComponent(idOrganizacao)}`
    const respostaConfigurador = await fetch(url, {
      method: 'GET',
      headers: {
        'x-chave-interna-servico': internalKey,
        'x-internal-key': internalKey, // compat com middleware do Configurador
        'content-type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    })
    if (!respostaConfigurador.ok) {
      throw new AppError(
        `Falha ao resolver organização no Configurador (status ${respostaConfigurador.status})`,
        502,
        'CONFIGURADOR_INDISPONIVEL',
      )
    }
    const dadosOrg = await respostaConfigurador.json() as { suid_empresa_organizacao?: string | null }
    const suid = dadosOrg.suid_empresa_organizacao
    if (!suid) {
      throw new AppError(
        'Organização não tem empresa-da-org cadastrada (onboarding incompleto). Conclua o cadastro da empresa nos Cadastros antes de criar pedidos.',
        404,
        'EMPRESA_DA_ORG_AUSENTE',
      )
    }

    // Busca a Empresa local pelo SUID + tenant isolation.
    const empresa = await prisma.empresa.findFirst({
      where: { suid_empresa: suid, id_organizacao_empresa: idOrganizacao },
    })
    if (!empresa) {
      throw new AppError(
        `Configurador aponta suid_empresa_organizacao=${suid}, mas Empresa não foi encontrada no Cadastros (drift cross-banco — contate o suporte).`,
        404,
        'EMPRESA_NAO_CADASTRADA',
      )
    }

    res.status(200).json(toEmpresaDto(empresa))
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /empresas/:id_empresa — busca uma
// ---------------------------------------------------------------------------
router.get('/:id_empresa', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const empresa = await prisma.empresa.findFirst({
      where: { suid_empresa: req.params.id_empresa, id_organizacao_empresa: idOrganizacao },
    })
    if (!empresa) throw AppError.naoEncontrado('Empresa')
    res.status(200).json(toEmpresaDto(empresa))
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /empresas/:id_empresa/preview-impacto
// ---------------------------------------------------------------------------
router.get('/:id_empresa/preview-impacto', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const existe = await prisma.empresa.findFirst({
      where: { suid_empresa: req.params.id_empresa, id_organizacao_empresa: idOrganizacao },
      select: { suid_empresa: true },
    })
    if (!existe) throw AppError.naoEncontrado('Empresa')
    const resultado = await consultarImpacto(req.params.id_empresa, idOrganizacao)
    res.status(200).json(resultado)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// PUT /empresas/:id_empresa — atualiza
// ---------------------------------------------------------------------------
router.put('/:id_empresa', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const dados = atualizarEmpresaSchema.parse(req.body)

    // Busca primeiro pra garantir tenant ownership (404 se alheio).
    const existente = await prisma.empresa.findFirst({
      where: { suid_empresa: req.params.id_empresa, id_organizacao_empresa: idOrganizacao },
    })
    if (!existente) throw AppError.naoEncontrado('Empresa')

    const atualizada = await prisma.empresa.update({
      where: { suid_empresa: existente.suid_empresa },
      data: {
        ...(dados.nome_empresa !== undefined ? { nome_empresa: dados.nome_empresa } : {}),
        ...(dados.cnpj_empresa !== undefined ? { cnpj_empresa: dados.cnpj_empresa } : {}),
        ...(dados.tin_empresa !== undefined ? { tin_empresa: dados.tin_empresa } : {}),
        ...(dados.pais_empresa !== undefined ? { pais_empresa: dados.pais_empresa } : {}),
        ...(dados.estado_empresa !== undefined ? { estado_empresa: dados.estado_empresa } : {}),
        ...(dados.cidade_empresa !== undefined ? { cidade_empresa: dados.cidade_empresa } : {}),
        ...(dados.endereco_empresa !== undefined ? { endereco_empresa: dados.endereco_empresa } : {}),
        ...(dados.zipcode_empresa !== undefined ? { zipcode_empresa: dados.zipcode_empresa } : {}),
        ...(dados.email_empresa !== undefined ? { email_empresa: dados.email_empresa } : {}),
        ...(dados.telefone_empresa !== undefined ? { telefone_empresa: dados.telefone_empresa } : {}),
        ...(dados.whatsapp_empresa !== undefined ? { whatsapp_empresa: dados.whatsapp_empresa } : {}),
        ...(dados.pode_ser_importador_empresa !== undefined ? { pode_ser_importador_empresa: dados.pode_ser_importador_empresa } : {}),
        ...(dados.pode_ser_exportador_empresa !== undefined ? { pode_ser_exportador_empresa: dados.pode_ser_exportador_empresa } : {}),
        ...(dados.pode_ser_fabricante_empresa !== undefined ? { pode_ser_fabricante_empresa: dados.pode_ser_fabricante_empresa } : {}),
        ...(dados.pode_ser_agente_empresa !== undefined ? { pode_ser_agente_empresa: dados.pode_ser_agente_empresa } : {}),
        ...(dados.pode_ser_despachante_empresa !== undefined ? { pode_ser_despachante_empresa: dados.pode_ser_despachante_empresa } : {}),
        ...(dados.pode_ser_armador_empresa !== undefined ? { pode_ser_armador_empresa: dados.pode_ser_armador_empresa } : {}),
        ...(dados.pode_ser_cia_aerea_empresa !== undefined ? { pode_ser_cia_aerea_empresa: dados.pode_ser_cia_aerea_empresa } : {}),
        ...(dados.pode_ser_transportadora_rodoviaria_nacional_empresa !== undefined ? { pode_ser_transportadora_rodoviaria_nacional_empresa: dados.pode_ser_transportadora_rodoviaria_nacional_empresa } : {}),
        ...(dados.pode_ser_transportadora_rodoviaria_internacional_empresa !== undefined ? { pode_ser_transportadora_rodoviaria_internacional_empresa: dados.pode_ser_transportadora_rodoviaria_internacional_empresa } : {}),
        ...(dados.pode_ser_armazem_alfandegado_empresa !== undefined ? { pode_ser_armazem_alfandegado_empresa: dados.pode_ser_armazem_alfandegado_empresa } : {}),
        ...(dados.pode_ser_armazem_nacional_empresa !== undefined ? { pode_ser_armazem_nacional_empresa: dados.pode_ser_armazem_nacional_empresa } : {}),
        ...(dados.pode_ser_banco_empresa !== undefined ? { pode_ser_banco_empresa: dados.pode_ser_banco_empresa } : {}),
        ...(dados.pode_ser_seguradora_internacional_empresa !== undefined ? { pode_ser_seguradora_internacional_empresa: dados.pode_ser_seguradora_internacional_empresa } : {}),
        ...(dados.pode_ser_seguradora_corretora_cambio_empresa !== undefined ? { pode_ser_seguradora_corretora_cambio_empresa: dados.pode_ser_seguradora_corretora_cambio_empresa } : {}),
        ...(dados.ativo_empresa !== undefined ? { ativo_empresa: dados.ativo_empresa } : {}),
      },
    })
    // Webhook fire-and-forget: notifica Pedido para reavaliar snapshots.
    void notificarMudancaEntidade('empresa', atualizada.suid_empresa, atualizada.id_organizacao_empresa)
    res.status(200).json(toEmpresaDto(atualizada))
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(AppError.conflito('Atualização viola unicidade (CNPJ/TIN duplicado neste tenant)'))
    }
    next(err)
  }
})

// ---------------------------------------------------------------------------
// DELETE /empresas/:id_empresa/compensacao — hard delete para saga
//
// Rota EXCLUSIVA para compensação quando a criação da Organizacao no
// Configurador falha após a Empresa ter sido criada aqui. Remove o registro
// fisicamente para não deixar "empresa fantasma" no cadastro.
//
// NÃO usar para uso normal — a rota canônica de exclusão continua sendo
// DELETE /empresas/:id_empresa (soft delete).
// ---------------------------------------------------------------------------
router.delete('/:id_empresa/compensacao', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const existente = await prisma.empresa.findFirst({
      where: { suid_empresa: req.params.id_empresa, id_organizacao_empresa: idOrganizacao },
      select: { suid_empresa: true },
    })
    if (!existente) throw AppError.naoEncontrado('Empresa')

    await prisma.empresa.delete({ where: { suid_empresa: existente.suid_empresa } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// DELETE /empresas/:id_empresa — soft delete (ativo=false)
// ---------------------------------------------------------------------------
router.delete('/:id_empresa', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const existente = await prisma.empresa.findFirst({
      where: { suid_empresa: req.params.id_empresa, id_organizacao_empresa: idOrganizacao },
    })
    if (!existente) throw AppError.naoEncontrado('Empresa')

    const desativada = await prisma.empresa.update({
      where: { suid_empresa: existente.suid_empresa },
      data: { ativo_empresa: false },
    })
    // Webhook fire-and-forget: notifica Pedido para reavaliar snapshots.
    void notificarMudancaEntidade('empresa', desativada.suid_empresa, desativada.id_organizacao_empresa)
    res.status(200).json(toEmpresaDto(desativada))
  } catch (err) {
    next(err)
  }
})

export { router as empresasRouter }
