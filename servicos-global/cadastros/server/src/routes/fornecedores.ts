/**
 * CRUD de Fornecedor (cartório de identidades COMEX).
 *
 * Onda 38 — DDD Cadastros: campos físicos com sufixo _empresa
 * (id_organizacao_cadastro_fornecedor, id_produto_fornecedor, id_usuario_cadastro_fornecedor).
 * Contrato público de API mantido — `toFornecedorDto()` traduz para o nome
 * exposto na schema Zod (`id_organizacao` sem sufixo).
 *
 * - Toda query filtra por `id_organizacao_cadastro_fornecedor` (Tenant Isolation).
 * - 404 ao buscar SUID alheio (não 403 — não vazamos existência).
 * - Soft delete via `ativo_fornecedor = false` (DELETE /fornecedores/:id_fornecedor).
 * - Hard delete (DELETE /fornecedores/:id_fornecedor/compensacao) — exclusivo para
 *   compensação de saga inter-serviço quando a criação da Organizacao no
 *   Configurador falha após a Empresa ter sido criada aqui.
 * - SUID gerado por `gerarSuid()` no formato `${PAIS}-${SLUG}-${SEQ_5}`.
 */
import { Router } from 'express'
import { Prisma, type Fornecedor as PrismaFornecedor } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import {
  criarFornecedorSchema,
  atualizarFornecedorSchema,
} from '../../../shared/schemas/index.js'
import { gerarSuid } from '../utils/gerar-suid.js'
import { consultarImpacto } from '../services/preview-impacto.js'
import { notificarMudancaEntidade } from '../services/notifyPedido.js'
import { obterEmpresaDaOrganizacao } from '../services/empresa-org.service.js'
import { empresaParaFornecedorCompatDto } from '../services/empresa-dto.js'

const router = Router()
router.use(requireInternalKey)

/**
 * ACL — traduz registro físico (Prisma) para o contrato público da API.
 * Preserva `id_organizacao` sem sufixo conforme `fornecedorSchema` (Zod).
 */
function toFornecedorDto(e: PrismaFornecedor): Record<string, unknown> {
  return {
    id_fornecedor:                                              e.id_fornecedor,
    id_organizacao:                                            e.id_organizacao_cadastro_fornecedor,
    nome_fornecedor:                                              e.nome_fornecedor,
    cnpj_fornecedor:                                              e.cnpj_fornecedor,
    tin_fornecedor:                                               e.tin_fornecedor,
    pais_fornecedor:                                              e.pais_fornecedor,
    estado_provincia_fornecedor:                                            e.estado_provincia_fornecedor,
    cidade_fornecedor:                                            e.cidade_fornecedor,
    endereco_fornecedor:                                          e.endereco_fornecedor,
    cep_zipcode_fornecedor:                                           e.cep_zipcode_fornecedor,
    email_principal_fornecedor:                                             e.email_principal_fornecedor,
    telefone_principal_fornecedor:                                          e.telefone_principal_fornecedor,
    whatsapp_principal_fornecedor:                                          e.whatsapp_principal_fornecedor,
    pode_ser_importador_fornecedor:                               e.pode_ser_importador_fornecedor,
    pode_ser_exportador_fornecedor:                               e.pode_ser_exportador_fornecedor,
    pode_ser_fabricante_fornecedor:                               e.pode_ser_fabricante_fornecedor,
    pode_ser_agente_fornecedor:                                   e.pode_ser_agente_fornecedor,
    pode_ser_despachante_fornecedor:                              e.pode_ser_despachante_fornecedor,
    pode_ser_armador_fornecedor:                                  e.pode_ser_armador_fornecedor,
    pode_ser_armazem_alfandegado_fornecedor:                      e.pode_ser_armazem_alfandegado_fornecedor,
    pode_ser_transportadora_rodoviaria_nacional_fornecedor:       e.pode_ser_transportadora_rodoviaria_nacional_fornecedor,
    pode_ser_cia_aerea_fornecedor:                                e.pode_ser_cia_aerea_fornecedor,
    pode_ser_transportadora_rodoviaria_internacional_fornecedor:  e.pode_ser_transportadora_rodoviaria_internacional_fornecedor,
    pode_ser_seguradora_internacional_fornecedor:                 e.pode_ser_seguradora_internacional_fornecedor,
    pode_ser_seguradora_corretora_cambio_fornecedor:              e.pode_ser_seguradora_corretora_cambio_fornecedor,
    pode_ser_banco_fornecedor:                                    e.pode_ser_banco_fornecedor,
    pode_ser_armazem_nacional_fornecedor:                         e.pode_ser_armazem_nacional_fornecedor,
    ativo_fornecedor:                                             e.ativo_fornecedor,
    criado_em_fornecedor:                                         e.criado_em_fornecedor.toISOString(),
    atualizado_em_fornecedor:                                     e.atualizado_em_fornecedor.toISOString(),
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
// POST /fornecedores — cria
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
    const dados = criarFornecedorSchema.parse(bodyComOrg)
    const id_fornecedor = dados.id_fornecedor ?? (await gerarSuid(prisma, {
      id_organizacao: dados.id_organizacao,
      pais_fornecedor: dados.pais_fornecedor,
      nome_fornecedor: dados.nome_fornecedor,
    }))

    const criada = await prisma.fornecedor.create({
      data: {
        id_fornecedor,
        id_organizacao_cadastro_fornecedor: dados.id_organizacao,
        nome_fornecedor: dados.nome_fornecedor,
        cnpj_fornecedor: dados.cnpj_fornecedor ?? null,
        tin_fornecedor: dados.tin_fornecedor ?? null,
        pais_fornecedor: dados.pais_fornecedor,
        estado_provincia_fornecedor: dados.estado_provincia_fornecedor ?? null,
        cidade_fornecedor: dados.cidade_fornecedor ?? null,
        endereco_fornecedor: dados.endereco_fornecedor ?? null,
        cep_zipcode_fornecedor: dados.cep_zipcode_fornecedor ?? null,
        email_principal_fornecedor: dados.email_principal_fornecedor ?? null,
        telefone_principal_fornecedor: dados.telefone_principal_fornecedor ?? null,
        whatsapp_principal_fornecedor: dados.whatsapp_principal_fornecedor ?? null,
        pode_ser_importador_fornecedor: dados.pode_ser_importador_fornecedor,
        pode_ser_exportador_fornecedor: dados.pode_ser_exportador_fornecedor,
        pode_ser_fabricante_fornecedor: dados.pode_ser_fabricante_fornecedor,
        pode_ser_agente_fornecedor: dados.pode_ser_agente_fornecedor,
        pode_ser_despachante_fornecedor: dados.pode_ser_despachante_fornecedor,
        pode_ser_armador_fornecedor: dados.pode_ser_armador_fornecedor,
        pode_ser_cia_aerea_fornecedor: dados.pode_ser_cia_aerea_fornecedor,
        pode_ser_transportadora_rodoviaria_nacional_fornecedor: dados.pode_ser_transportadora_rodoviaria_nacional_fornecedor,
        pode_ser_transportadora_rodoviaria_internacional_fornecedor: dados.pode_ser_transportadora_rodoviaria_internacional_fornecedor,
        pode_ser_armazem_alfandegado_fornecedor: dados.pode_ser_armazem_alfandegado_fornecedor,
        pode_ser_armazem_nacional_fornecedor: dados.pode_ser_armazem_nacional_fornecedor,
        pode_ser_banco_fornecedor: dados.pode_ser_banco_fornecedor,
        pode_ser_seguradora_internacional_fornecedor: dados.pode_ser_seguradora_internacional_fornecedor,
        pode_ser_seguradora_corretora_cambio_fornecedor: dados.pode_ser_seguradora_corretora_cambio_fornecedor,
        ativo_fornecedor: dados.ativo_fornecedor,
      },
    })
    // Webhook fire-and-forget: notifica Pedido para reavaliar snapshots.
    void notificarMudancaEntidade('fornecedor', criada.id_fornecedor, criada.id_organizacao_cadastro_fornecedor)
    res.status(201).json(toFornecedorDto(criada))
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(AppError.conflito('Fornecedor duplicado (SUID, CNPJ ou TIN já existente para este tenant)'))
    }
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /fornecedores — lista paginada
// ---------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const pagina = Math.max(1, Number(req.query.pagina ?? 1))
    const porPagina = Math.min(200, Math.max(1, Number(req.query.por_pagina ?? 50)))
    const podeSerImportador = req.query.pode_ser_importador_fornecedor === 'true' ? true : undefined
    const pais_fornecedor = typeof req.query.pais_fornecedor === 'string' ? req.query.pais_fornecedor : undefined
    const busca = typeof req.query.busca === 'string' ? req.query.busca : undefined

    const escopo = typeof req.query.escopo === 'string' ? req.query.escopo : undefined

    const idsExcluir: string[] = []
    if (escopo === 'parceiros') {
      const empresaOrg = await obterEmpresaDaOrganizacao(idOrganizacao)
      if (empresaOrg) idsExcluir.push(empresaOrg.id_empresa)
      const baseUrlConfigurador = process.env.CONFIGURADOR_BASE_URL ?? 'http://localhost:8005'
      const internalKey = process.env.CHAVE_INTERNA_SERVICO
      if (internalKey) {
        try {
          const resOrg = await fetch(
            `${baseUrlConfigurador.replace(/\/$/, '')}/api/v1/internal/organizacoes/${encodeURIComponent(idOrganizacao)}`,
            {
              headers: { 'x-chave-interna-servico': internalKey, 'x-internal-key': internalKey },
              signal: AbortSignal.timeout(5000),
            },
          )
          if (resOrg.ok) {
            const org = await resOrg.json() as { suid_empresa_organizacao?: string | null }
            if (org.suid_empresa_organizacao) idsExcluir.push(org.suid_empresa_organizacao)
          }
        } catch {
          /* mantém filtro parcial */
        }
      }
    }

    const where: Prisma.FornecedorWhereInput = {
      id_organizacao_cadastro_fornecedor: idOrganizacao,
      ...(idsExcluir.length > 0 ? { id_fornecedor: { notIn: [...new Set(idsExcluir)] } } : {}),
      ...(podeSerImportador !== undefined ? { pode_ser_importador_fornecedor: true } : {}),
      ...(pais_fornecedor ? { pais_fornecedor } : {}),
      ...(busca ? { nome_fornecedor: { contains: busca, mode: 'insensitive' } } : {}),
    }

    const [itens, total] = await Promise.all([
      prisma.fornecedor.findMany({
        where,
        orderBy: { nome_fornecedor: 'asc' },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.fornecedor.count({ where }),
    ])

    res.status(200).json({ itens: itens.map(toFornecedorDto), total, pagina, por_pagina: porPagina })
  } catch (err) {
    next(err)
  }
})

// GET /fornecedores/da-organizacao — @deprecated Use GET /empresas/da-organizacao (SSOT §4.1).
router.get('/da-organizacao', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const empresa = await obterEmpresaDaOrganizacao(idOrganizacao)
    if (!empresa) {
      throw new AppError(
        'Organização não tem Empresa cadastrada (onboarding incompleto).',
        404,
        'EMPRESA_DA_ORG_AUSENTE',
      )
    }
    res.status(200).json(empresaParaFornecedorCompatDto(empresa))
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /fornecedores/:id_fornecedor — parceiro COMEX (tabela fornecedor apenas)
// ---------------------------------------------------------------------------
router.get('/:id_fornecedor', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const fornecedor = await prisma.fornecedor.findFirst({
      where: { id_fornecedor: req.params.id_fornecedor, id_organizacao_cadastro_fornecedor: idOrganizacao },
    })
    if (!fornecedor) throw AppError.naoEncontrado('Fornecedor')
    res.status(200).json(toFornecedorDto(fornecedor))
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /fornecedores/:id_fornecedor/preview-impacto
// ---------------------------------------------------------------------------
router.get('/:id_fornecedor/preview-impacto', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const existe = await prisma.fornecedor.findFirst({
      where: { id_fornecedor: req.params.id_fornecedor, id_organizacao_cadastro_fornecedor: idOrganizacao },
      select: { id_fornecedor: true },
    })
    if (!existe) throw AppError.naoEncontrado('Fornecedor')
    const resultado = await consultarImpacto(req.params.id_fornecedor, idOrganizacao)
    res.status(200).json(resultado)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// PUT /fornecedores/:id_fornecedor — atualiza
// ---------------------------------------------------------------------------
router.put('/:id_fornecedor', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const dados = atualizarFornecedorSchema.parse(req.body)

    // Busca primeiro pra garantir tenant ownership (404 se alheio).
    const existente = await prisma.fornecedor.findFirst({
      where: { id_fornecedor: req.params.id_fornecedor, id_organizacao_cadastro_fornecedor: idOrganizacao },
    })
    if (!existente) throw AppError.naoEncontrado('Fornecedor')

    const atualizada = await prisma.fornecedor.update({
      where: { id_fornecedor: existente.id_fornecedor },
      data: {
        ...(dados.nome_fornecedor !== undefined ? { nome_fornecedor: dados.nome_fornecedor } : {}),
        ...(dados.cnpj_fornecedor !== undefined ? { cnpj_fornecedor: dados.cnpj_fornecedor } : {}),
        ...(dados.tin_fornecedor !== undefined ? { tin_fornecedor: dados.tin_fornecedor } : {}),
        ...(dados.pais_fornecedor !== undefined ? { pais_fornecedor: dados.pais_fornecedor } : {}),
        ...(dados.estado_provincia_fornecedor !== undefined ? { estado_provincia_fornecedor: dados.estado_provincia_fornecedor } : {}),
        ...(dados.cidade_fornecedor !== undefined ? { cidade_fornecedor: dados.cidade_fornecedor } : {}),
        ...(dados.endereco_fornecedor !== undefined ? { endereco_fornecedor: dados.endereco_fornecedor } : {}),
        ...(dados.cep_zipcode_fornecedor !== undefined ? { cep_zipcode_fornecedor: dados.cep_zipcode_fornecedor } : {}),
        ...(dados.email_principal_fornecedor !== undefined ? { email_principal_fornecedor: dados.email_principal_fornecedor } : {}),
        ...(dados.telefone_principal_fornecedor !== undefined ? { telefone_principal_fornecedor: dados.telefone_principal_fornecedor } : {}),
        ...(dados.whatsapp_principal_fornecedor !== undefined ? { whatsapp_principal_fornecedor: dados.whatsapp_principal_fornecedor } : {}),
        ...(dados.pode_ser_importador_fornecedor !== undefined ? { pode_ser_importador_fornecedor: dados.pode_ser_importador_fornecedor } : {}),
        ...(dados.pode_ser_exportador_fornecedor !== undefined ? { pode_ser_exportador_fornecedor: dados.pode_ser_exportador_fornecedor } : {}),
        ...(dados.pode_ser_fabricante_fornecedor !== undefined ? { pode_ser_fabricante_fornecedor: dados.pode_ser_fabricante_fornecedor } : {}),
        ...(dados.pode_ser_agente_fornecedor !== undefined ? { pode_ser_agente_fornecedor: dados.pode_ser_agente_fornecedor } : {}),
        ...(dados.pode_ser_despachante_fornecedor !== undefined ? { pode_ser_despachante_fornecedor: dados.pode_ser_despachante_fornecedor } : {}),
        ...(dados.pode_ser_armador_fornecedor !== undefined ? { pode_ser_armador_fornecedor: dados.pode_ser_armador_fornecedor } : {}),
        ...(dados.pode_ser_cia_aerea_fornecedor !== undefined ? { pode_ser_cia_aerea_fornecedor: dados.pode_ser_cia_aerea_fornecedor } : {}),
        ...(dados.pode_ser_transportadora_rodoviaria_nacional_fornecedor !== undefined ? { pode_ser_transportadora_rodoviaria_nacional_fornecedor: dados.pode_ser_transportadora_rodoviaria_nacional_fornecedor } : {}),
        ...(dados.pode_ser_transportadora_rodoviaria_internacional_fornecedor !== undefined ? { pode_ser_transportadora_rodoviaria_internacional_fornecedor: dados.pode_ser_transportadora_rodoviaria_internacional_fornecedor } : {}),
        ...(dados.pode_ser_armazem_alfandegado_fornecedor !== undefined ? { pode_ser_armazem_alfandegado_fornecedor: dados.pode_ser_armazem_alfandegado_fornecedor } : {}),
        ...(dados.pode_ser_armazem_nacional_fornecedor !== undefined ? { pode_ser_armazem_nacional_fornecedor: dados.pode_ser_armazem_nacional_fornecedor } : {}),
        ...(dados.pode_ser_banco_fornecedor !== undefined ? { pode_ser_banco_fornecedor: dados.pode_ser_banco_fornecedor } : {}),
        ...(dados.pode_ser_seguradora_internacional_fornecedor !== undefined ? { pode_ser_seguradora_internacional_fornecedor: dados.pode_ser_seguradora_internacional_fornecedor } : {}),
        ...(dados.pode_ser_seguradora_corretora_cambio_fornecedor !== undefined ? { pode_ser_seguradora_corretora_cambio_fornecedor: dados.pode_ser_seguradora_corretora_cambio_fornecedor } : {}),
        ...(dados.ativo_fornecedor !== undefined ? { ativo_fornecedor: dados.ativo_fornecedor } : {}),
      },
    })
    // Webhook fire-and-forget: notifica Pedido para reavaliar snapshots.
    void notificarMudancaEntidade('fornecedor', atualizada.id_fornecedor, atualizada.id_organizacao_cadastro_fornecedor)
    res.status(200).json(toFornecedorDto(atualizada))
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(AppError.conflito('Atualização viola unicidade (CNPJ/TIN duplicado neste tenant)'))
    }
    next(err)
  }
})

// ---------------------------------------------------------------------------
// DELETE /fornecedores/:id_fornecedor/compensacao — hard delete para saga
//
// Rota EXCLUSIVA para compensação quando a criação da Organizacao no
// Configurador falha após a Empresa ter sido criada aqui. Remove o registro
// fisicamente para não deixar "fornecedor fantasma" no cadastro.
//
// NÃO usar para uso normal — a rota canônica de exclusão continua sendo
// DELETE /fornecedores/:id_fornecedor (soft delete).
// ---------------------------------------------------------------------------
router.delete('/:id_fornecedor/compensacao', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const existente = await prisma.fornecedor.findFirst({
      where: { id_fornecedor: req.params.id_fornecedor, id_organizacao_cadastro_fornecedor: idOrganizacao },
      select: { id_fornecedor: true },
    })
    if (!existente) throw AppError.naoEncontrado('Fornecedor')

    await prisma.fornecedor.delete({ where: { id_fornecedor: existente.id_fornecedor } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// DELETE /fornecedores/:id_fornecedor — soft delete (ativo=false)
// ---------------------------------------------------------------------------
router.delete('/:id_fornecedor', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const existente = await prisma.fornecedor.findFirst({
      where: { id_fornecedor: req.params.id_fornecedor, id_organizacao_cadastro_fornecedor: idOrganizacao },
    })
    if (!existente) throw AppError.naoEncontrado('Fornecedor')

    const desativada = await prisma.fornecedor.update({
      where: { id_fornecedor: existente.id_fornecedor },
      data: { ativo_fornecedor: false },
    })
    // Webhook fire-and-forget: notifica Pedido para reavaliar snapshots.
    void notificarMudancaEntidade('fornecedor', desativada.id_fornecedor, desativada.id_organizacao_cadastro_fornecedor)
    res.status(200).json(toFornecedorDto(desativada))
  } catch (err) {
    next(err)
  }
})

export { router as fornecedoresRouter }
