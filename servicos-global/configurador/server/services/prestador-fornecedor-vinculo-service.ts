/**
 * prestador-fornecedor-vinculo-service.ts
 *
 * Passo 04 — convite FORNECEDOR + vínculo Cadastros (fornecedor_organizacao).
 *
 * Regras de negócio (dono 2026-05-26):
 *   - Modo 02 (auto-registro): sempre vínculo na org Gravity.
 *   - Modo 01 (convite pelo Master): vínculo Gravity + org cliente convidante.
 *   - Um prestador pode acumular orgs B, C, D via novos convites (idempotente).
 *   - Categoria COMEX = tipo_fornecedor_organizacao (ENUM Cadastros SSOT).
 */

import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { logger } from '../lib/logger.js'
import {
  type TipoFornecedorOrganizacao,
  flagsCadastroPorTipoFornecedorOrganizacao,
} from '../../shared/tipo-fornecedor-organizacao.js'
import {
  type CadastrosRequestContext,
  buscarFornecedorPorEmailNaOrganizacao,
  criarFornecedor,
  criarVinculoFornecedorOrganizacao,
  listarVinculosFornecedorPorUsuario,
} from './cadastros-client.js'

const log = logger.child({ module: 'prestador-fornecedor-vinculo' })

let cacheIdOrganizacaoGravity: string | null = null

/** Resolve org Gravity (hospeda_colaboradores_gravity) — cache em memória por processo. */
export async function resolverIdOrganizacaoGravity(): Promise<string> {
  const fromEnv = process.env.ID_ORGANIZACAO_GRAVITY?.trim()
  if (fromEnv) return fromEnv
  if (cacheIdOrganizacaoGravity) return cacheIdOrganizacaoGravity

  const org = await prisma.organizacao.findFirst({
    where: { hospeda_colaboradores_gravity: true, status_organizacao: 'ATIVO' },
    orderBy: { data_criacao_organizacao: 'asc' },
    select: { id_organizacao: true },
  })
  if (!org) {
    throw new AppError(
      'Organização Gravity não configurada (hospeda_colaboradores_gravity)',
      503,
      'ORG_GRAVITY_AUSENTE',
    )
  }
  cacheIdOrganizacaoGravity = org.id_organizacao
  return org.id_organizacao
}

export interface ProvisionarPrestadorFornecedorArgs {
  id_usuario: string
  email_usuario: string
  nome_usuario: string
  tipo_fornecedor_organizacao: TipoFornecedorOrganizacao
  /** Org do Master que convidou (modo 01). Omitir = só Gravity (modo 02). */
  id_organizacao_cliente?: string
  id_clerk_usuario?: string | null
  correlation_id?: string
}

export interface ProvisionarPrestadorFornecedorResult {
  id_fornecedor: string
  id_organizacao_gravity: string
  vinculos_criados: string[]
  vinculos_existentes: string[]
}

function ctxCadastros(id_organizacao: string, correlation_id?: string): CadastrosRequestContext {
  return {
    id_organizacao,
    correlation_id: correlation_id ?? crypto.randomUUID(),
  }
}

async function garantirCartorioFornecedor(args: {
  id_organizacao_cadastro: string
  nome_usuario: string
  email_usuario: string
  tipo_fornecedor_organizacao: TipoFornecedorOrganizacao
  correlation_id?: string
}): Promise<string> {
  const ctx = ctxCadastros(args.id_organizacao_cadastro, args.correlation_id)
  const existente = await buscarFornecedorPorEmailNaOrganizacao(args.email_usuario, ctx)
  if (existente) return existente.id_fornecedor

  const flags = flagsCadastroPorTipoFornecedorOrganizacao(args.tipo_fornecedor_organizacao)
  const criado = await criarFornecedor(
    {
      id_organizacao: args.id_organizacao_cadastro,
      nome_fornecedor: args.nome_usuario.trim(),
      email_principal_fornecedor: args.email_usuario.trim(),
      pais_fornecedor: 'BR',
      ativo_fornecedor: true,
      pode_ser_importador_fornecedor: false,
      pode_ser_exportador_fornecedor: false,
      ...flags,
    },
    ctx,
  )
  return criado.id_fornecedor
}

async function garantirVinculo(args: {
  id_fornecedor: string
  id_organizacao: string
  tipo_fornecedor_organizacao: TipoFornecedorOrganizacao
  id_usuario: string
  correlation_id?: string
}): Promise<'criado' | 'existente'> {
  const ctx = ctxCadastros(args.id_organizacao, args.correlation_id)
  const vinculos = await listarVinculosFornecedorPorUsuario(args.id_usuario, ctx)
  const jaExiste = vinculos.some(
    (v) =>
      v.id_organizacao === args.id_organizacao
      && v.tipo_fornecedor_organizacao === args.tipo_fornecedor_organizacao
      && v.id_fornecedor === args.id_fornecedor,
  )
  if (jaExiste) return 'existente'

  try {
    await criarVinculoFornecedorOrganizacao(
      {
        id_fornecedor: args.id_fornecedor,
        id_organizacao: args.id_organizacao,
        tipo_fornecedor_organizacao: args.tipo_fornecedor_organizacao,
        status_fornecedor_organizacao: 'ATIVO',
        id_usuario: args.id_usuario,
      },
      ctx,
    )
    return 'criado'
  } catch (err) {
    if (err instanceof AppError && err.code === 'VINCULO_DUPLICADO') {
      return 'existente'
    }
    throw err
  }
}

/** Best-effort — espelha id_clerk_usuario no BID quando Clerk já está resolvido. */
export async function sincronizarClerkBidFreteFornecedor(args: {
  id_organizacao_cliente: string
  id_clerk_usuario: string
  email_usuario: string
  correlation_id?: string
}): Promise<void> {
  if (!args.id_clerk_usuario || args.id_clerk_usuario.startsWith('pending_')) return

  const baseUrl = process.env.BID_FRETE_INTERNATIONAL_SERVICE_URL ?? 'http://127.0.0.1:8023'
  const chave = process.env.CHAVE_INTERNA_SERVICO
  if (!chave) {
    log.warn('bid.sync_clerk.skip', { reason: 'CHAVE_INTERNA_SERVICO ausente' })
    return
  }

  try {
    const listRes = await fetch(
      `${baseUrl}/api/v1/bid-frete-internacional/fornecedores?por_pagina=200`,
      {
        headers: {
          'x-internal-key': chave,
          'x-id-organizacao': args.id_organizacao_cliente,
          'x-correlation-id': args.correlation_id ?? crypto.randomUUID(),
        },
        signal: AbortSignal.timeout(5_000),
      },
    )
    if (!listRes.ok) {
      log.warn('bid.sync_clerk.list_falhou', { status: listRes.status })
      return
    }
    const lista = await listRes.json() as {
      fornecedores?: Array<{
        id_fornecedor_bid_frete_internacional: string
        email_fornecedor_bid_frete_internacional?: string
      }>
    }
    const emailNorm = args.email_usuario.trim().toLowerCase()
    const espelho = (lista.fornecedores ?? []).find(
      (f) => (f.email_fornecedor_bid_frete_internacional ?? '').trim().toLowerCase() === emailNorm,
    )
    if (!espelho) return

    await fetch(
      `${baseUrl}/api/v1/bid-frete-internacional/fornecedores/${espelho.id_fornecedor_bid_frete_internacional}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': chave,
          'x-id-organizacao': args.id_organizacao_cliente,
        },
        body: JSON.stringify({ id_clerk_usuario: args.id_clerk_usuario }),
        signal: AbortSignal.timeout(5_000),
      },
    )
  } catch (err) {
    log.warn('bid.sync_clerk.erro', {
      error: err instanceof Error ? err.message : String(err),
    })
  }
}

/**
 * Provisiona cartório + vínculos Gravity (+ org cliente quando convite).
 * Idempotente — chamadas repetidas não duplicam vínculos.
 */
export async function provisionarPrestadorFornecedor(
  args: ProvisionarPrestadorFornecedorArgs,
): Promise<ProvisionarPrestadorFornecedorResult> {
  const idOrganizacaoGravity = await resolverIdOrganizacaoGravity()
  const orgsAlvo = [idOrganizacaoGravity]
  if (args.id_organizacao_cliente && args.id_organizacao_cliente !== idOrganizacaoGravity) {
    orgsAlvo.push(args.id_organizacao_cliente)
  }

  const idFornecedor = await garantirCartorioFornecedor({
    id_organizacao_cadastro: idOrganizacaoGravity,
    nome_usuario: args.nome_usuario,
    email_usuario: args.email_usuario,
    tipo_fornecedor_organizacao: args.tipo_fornecedor_organizacao,
    correlation_id: args.correlation_id,
  })

  const vinculosCriados: string[] = []
  const vinculosExistentes: string[] = []

  for (const idOrg of orgsAlvo) {
    const resultado = await garantirVinculo({
      id_fornecedor: idFornecedor,
      id_organizacao: idOrg,
      tipo_fornecedor_organizacao: args.tipo_fornecedor_organizacao,
      id_usuario: args.id_usuario,
      correlation_id: args.correlation_id,
    })
    if (resultado === 'criado') vinculosCriados.push(idOrg)
    else vinculosExistentes.push(idOrg)
  }

  if (args.id_organizacao_cliente && args.id_clerk_usuario) {
    sincronizarClerkBidFreteFornecedor({
      id_organizacao_cliente: args.id_organizacao_cliente,
      id_clerk_usuario: args.id_clerk_usuario,
      email_usuario: args.email_usuario,
      correlation_id: args.correlation_id,
    }).catch(() => { /* best-effort */ })
  }

  log.info('prestador.provisionado', {
    id_usuario: args.id_usuario,
    id_fornecedor: idFornecedor,
    id_organizacao_gravity: idOrganizacaoGravity,
    vinculos_criados: vinculosCriados,
  })

  return {
    id_fornecedor: idFornecedor,
    id_organizacao_gravity: idOrganizacaoGravity,
    vinculos_criados: vinculosCriados,
    vinculos_existentes: vinculosExistentes,
  }
}

/** Chamado após Clerk resolver pending_* → user_* (login pós-convite). */
export async function aposClerkVinculadoPrestadorFornecedor(args: {
  id_usuario: string
  id_clerk_usuario: string
  email_usuario: string
  id_organizacao: string
}): Promise<void> {
  const usuario = await prisma.usuario.findFirst({
    where: { id_usuario: args.id_usuario },
    select: { tipo_usuario: true },
  })
  if (usuario?.tipo_usuario !== 'FORNECEDOR') return

  await sincronizarClerkBidFreteFornecedor({
    id_organizacao_cliente: args.id_organizacao,
    id_clerk_usuario: args.id_clerk_usuario,
    email_usuario: args.email_usuario,
  })
}
