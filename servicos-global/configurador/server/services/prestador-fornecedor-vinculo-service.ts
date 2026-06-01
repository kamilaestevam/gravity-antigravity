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
  fornecedorAtendeTipoOrganizacao,
} from '../../shared/tipo-fornecedor-organizacao.js'
import {
  type CadastrosRequestContext,
  buscarFornecedorPorEmailNaOrganizacao,
  criarFornecedor,
  criarVinculoFornecedorOrganizacao,
  listarVinculosFornecedorPorUsuario,
  obterFornecedorPorIdNaOrganizacao,
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
  /** Fornecedor existente no cartório da org cliente (convite). Omitir = auto-registro. */
  id_fornecedor?: string
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

async function resolverFornecedorConvite(args: {
  id_fornecedor: string
  id_organizacao_cliente: string
  tipo_fornecedor_organizacao: TipoFornecedorOrganizacao
  correlation_id?: string
}): Promise<string> {
  const ctx = ctxCadastros(args.id_organizacao_cliente, args.correlation_id)
  const fornecedor = await obterFornecedorPorIdNaOrganizacao(args.id_fornecedor, ctx)
  if (!fornecedor) {
    throw new AppError(
      'Fornecedor não encontrado no cartório da organização',
      404,
      'FORNECEDOR_NAO_ENCONTRADO',
    )
  }
  if (!fornecedor.ativo_fornecedor) {
    throw new AppError(
      'Fornecedor inativo não pode receber usuário FORNECEDOR',
      400,
      'FORNECEDOR_INATIVO',
    )
  }
  if (!fornecedorAtendeTipoOrganizacao(fornecedor, args.tipo_fornecedor_organizacao)) {
    throw new AppError(
      'Fornecedor selecionado não possui o papel COMEX da categoria escolhida',
      400,
      'FORNECEDOR_CATEGORIA_INCOMPATIVEL',
    )
  }
  return fornecedor.id_fornecedor
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

/** Best-effort — espelha id_usuario Gravity (+ Clerk opcional) no BID via id_fornecedor Cadastros. */
export async function sincronizarUsuarioBidFreteFornecedor(args: {
  id_organizacao_cliente: string
  id_fornecedor: string
  id_usuario: string
  id_clerk_usuario?: string | null
  correlation_id?: string
}): Promise<void> {
  if (!args.id_fornecedor?.trim() || !args.id_usuario?.trim()) return

  const baseUrl = process.env.BID_FRETE_INTERNATIONAL_SERVICE_URL ?? 'http://127.0.0.1:8023'
  const chave = process.env.CHAVE_INTERNA_SERVICO
  if (!chave) {
    log.warn('bid.sync_usuario.skip', { reason: 'CHAVE_INTERNA_SERVICO ausente' })
    return
  }

  try {
    const res = await fetch(
      `${baseUrl}/api/v1/bid-frete-internacional/fornecedores/${encodeURIComponent(args.id_fornecedor)}/vincular-usuario`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': chave,
          'x-id-organizacao': args.id_organizacao_cliente,
          'x-correlation-id': args.correlation_id ?? crypto.randomUUID(),
        },
        body: JSON.stringify({
          id_usuario: args.id_usuario,
          id_clerk_usuario: args.id_clerk_usuario?.startsWith('pending_')
            ? undefined
            : args.id_clerk_usuario ?? undefined,
        }),
        signal: AbortSignal.timeout(5_000),
      },
    )
    if (!res.ok) {
      log.warn('bid.sync_usuario.falhou', { status: res.status, id_fornecedor: args.id_fornecedor })
    }
  } catch (err) {
    log.warn('bid.sync_usuario.erro', {
      id_fornecedor: args.id_fornecedor,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}

/**
 * @deprecated Use sincronizarUsuarioBidFreteFornecedor — casamento por e-mail era frágil.
 */
export async function sincronizarClerkBidFreteFornecedor(args: {
  id_organizacao_cliente: string
  id_clerk_usuario: string
  email_usuario: string
  correlation_id?: string
}): Promise<void> {
  log.warn('bid.sync_clerk.legado', { email: args.email_usuario })
}

/**
 * Provisiona cartório + vínculos Gravity (+ org cliente quando convite).
 * Idempotente — chamadas repetidas não duplicam vínculos.
 */
export async function provisionarPrestadorFornecedor(
  args: ProvisionarPrestadorFornecedorArgs,
): Promise<ProvisionarPrestadorFornecedorResult> {
  const idOrganizacaoGravity = await resolverIdOrganizacaoGravity()

  let idFornecedor: string
  let orgsAlvo: string[]

  if (args.id_fornecedor) {
    if (!args.id_organizacao_cliente) {
      throw new AppError(
        'Convite FORNECEDOR com id_fornecedor exige id_organizacao_cliente',
        400,
        'ORG_CLIENTE_AUSENTE',
      )
    }
    idFornecedor = await resolverFornecedorConvite({
      id_fornecedor: args.id_fornecedor,
      id_organizacao_cliente: args.id_organizacao_cliente,
      tipo_fornecedor_organizacao: args.tipo_fornecedor_organizacao,
      correlation_id: args.correlation_id,
    })
    orgsAlvo = [args.id_organizacao_cliente]
  } else {
    orgsAlvo = [idOrganizacaoGravity]
    if (args.id_organizacao_cliente && args.id_organizacao_cliente !== idOrganizacaoGravity) {
      orgsAlvo.push(args.id_organizacao_cliente)
    }
    idFornecedor = await garantirCartorioFornecedor({
      id_organizacao_cadastro: idOrganizacaoGravity,
      nome_usuario: args.nome_usuario,
      email_usuario: args.email_usuario,
      tipo_fornecedor_organizacao: args.tipo_fornecedor_organizacao,
      correlation_id: args.correlation_id,
    })
  }

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

  if (args.id_organizacao_cliente) {
    sincronizarUsuarioBidFreteFornecedor({
      id_organizacao_cliente: args.id_organizacao_cliente,
      id_fornecedor: idFornecedor,
      id_usuario: args.id_usuario,
      id_clerk_usuario: args.id_clerk_usuario,
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

  const ctx = ctxCadastros(args.id_organizacao)
  const vinculos = await listarVinculosFornecedorPorUsuario(args.id_usuario, ctx)
  for (const vinculo of vinculos) {
    if (vinculo.id_organizacao !== args.id_organizacao) continue
    await sincronizarUsuarioBidFreteFornecedor({
      id_organizacao_cliente: args.id_organizacao,
      id_fornecedor: vinculo.id_fornecedor,
      id_usuario: args.id_usuario,
      id_clerk_usuario: args.id_clerk_usuario,
    })
  }
}
