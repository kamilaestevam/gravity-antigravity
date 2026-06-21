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
  atualizarVinculoFornecedorOrganizacao,
  buscarFornecedorPorEmailNaOrganizacao,
  criarFornecedor,
  criarVinculoFornecedorOrganizacao,
  listarVinculosFornecedorOrganizacaoPorOrganizacao,
  listarVinculosFornecedorPorUsuario,
  obterFornecedorPorIdNaOrganizacao,
} from './cadastros-client.js'
import {
  CODIGO_ERRO_BID_SYNC_INDISPONIVEL,
  CODIGO_ERRO_FORNECEDOR_NAO_PROVISIONADO,
  CODIGO_ERRO_FORNECEDOR_PENDENTE_APROVACAO,
  CODIGO_ERRO_FORNECEDOR_VINCULO_INATIVO,
  CODIGO_ERRO_FORNECEDOR_VINCULO_ORG_DIVERGENTE,
  CODIGO_ERRO_BID_SYNC_FALHOU,
  criarAppErrorVisaoFornecedorPermissao,
} from '../../shared/mensagens-erro-visao-fornecedor-permissao.js'

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
  if (org) {
    cacheIdOrganizacaoGravity = org.id_organizacao
    return org.id_organizacao
  }

  // Fallback canônico: subdomínio gravity (Gravity - Interno) — prod sem flag marcada
  const orgSubdominio = await prisma.organizacao.findFirst({
    where: { subdominio_organizacao: 'gravity', status_organizacao: 'ATIVO' },
    orderBy: { data_criacao_organizacao: 'asc' },
    select: { id_organizacao: true, nome_organizacao: true },
  })
  if (orgSubdominio) {
    log.warn(
      { id_organizacao: orgSubdominio.id_organizacao, nome: orgSubdominio.nome_organizacao },
      'ORG_GRAVITY: fallback subdominio_organizacao=gravity — marque hospeda_colaboradores_gravity ou defina ID_ORGANIZACAO_GRAVITY',
    )
    cacheIdOrganizacaoGravity = orgSubdominio.id_organizacao
    return orgSubdominio.id_organizacao
  }

  throw new AppError(
    'Organização Gravity não configurada (hospeda_colaboradores_gravity)',
    503,
    'ORG_GRAVITY_AUSENTE',
  )
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

/** CONVIDADO = id_clerk_usuario pending_* (mesma regra da listagem de usuários). */
async function usuarioEstaConvidado(id_usuario: string, id_organizacao: string): Promise<boolean> {
  const usuario = await prisma.usuario.findFirst({
    where: { id_usuario, id_organizacao },
    select: { id_clerk_usuario: true },
  })
  return usuario?.id_clerk_usuario?.startsWith('pending_') ?? false
}

/**
 * Vínculo fornecedor+org+tipo pode já existir no cartório (sem id_usuario ou com
 * convite pendente antigo). Garante que o usuário convidado fique associado —
 * sem bloquear o convite nem lançar erro para usuário ativo já vinculado.
 */
async function associarUsuarioAoVinculoExistente(args: {
  id_fornecedor: string
  id_organizacao: string
  tipo_fornecedor_organizacao: TipoFornecedorOrganizacao
  id_usuario: string
  correlation_id?: string
}): Promise<void> {
  const ctx = ctxCadastros(args.id_organizacao, args.correlation_id)
  const vinculosOrg = await listarVinculosFornecedorOrganizacaoPorOrganizacao(ctx)
  const existente = vinculosOrg.find(
    (v) =>
      v.id_fornecedor === args.id_fornecedor
      && v.id_organizacao === args.id_organizacao
      && v.tipo_fornecedor_organizacao === args.tipo_fornecedor_organizacao,
  )
  if (!existente) return
  if (existente.id_usuario === args.id_usuario) return

  const podeReatribuir =
    !existente.id_usuario
    || await usuarioEstaConvidado(existente.id_usuario, args.id_organizacao)

  if (!podeReatribuir) {
    log.warn('prestador.vinculo_ocupado_usuario_ativo', {
      id_fornecedor: args.id_fornecedor,
      id_organizacao: args.id_organizacao,
      id_usuario_ocupante: existente.id_usuario,
      id_usuario_novo: args.id_usuario,
    })
    return
  }

  await atualizarVinculoFornecedorOrganizacao(
    existente.id_fornecedor_organizacao,
    { id_usuario: args.id_usuario },
    ctx,
  )
  log.info('prestador.vinculo_usuario_associado', {
    id_fornecedor_organizacao: existente.id_fornecedor_organizacao,
    id_usuario: args.id_usuario,
    substituiu_convite_pendente: !!existente.id_usuario,
  })
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

  // Cartório pode ter linha pré-cadastrada (id_usuario null) — associa antes do POST.
  await associarUsuarioAoVinculoExistente(args)
  const vinculosAposAssociar = await listarVinculosFornecedorPorUsuario(args.id_usuario, ctx)
  if (
    vinculosAposAssociar.some(
      (v) =>
        v.id_organizacao === args.id_organizacao
        && v.tipo_fornecedor_organizacao === args.tipo_fornecedor_organizacao
        && v.id_fornecedor === args.id_fornecedor,
    )
  ) {
    return 'existente'
  }

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
      await associarUsuarioAoVinculoExistente(args)
      return 'existente'
    }
    throw err
  }
}

export interface VinculoFornecedorAtivoResumo {
  id_fornecedor: string
  id_organizacao: string
}

/**
 * Passo 01 do convite FORNECEDOR — exige vínculo ATIVO no Cadastros antes de
 * conceder `visao_fornecedor:cotar` (autorização sem identidade = lista BID quebrada).
 */
export async function exigirVinculosCadastrosFornecedorAtivos(args: {
  id_usuario: string
  id_organizacao: string
  correlation_id?: string
}): Promise<VinculoFornecedorAtivoResumo[]> {
  const ctx = ctxCadastros(args.id_organizacao, args.correlation_id)
  const vinculos = await listarVinculosFornecedorPorUsuario(args.id_usuario, ctx)
  const ativos = vinculos.filter(
    (v) =>
      v.id_organizacao === args.id_organizacao
      && v.status_fornecedor_organizacao === 'ATIVO',
  )
  if (ativos.length > 0) {
    return ativos.map((v) => ({
      id_fornecedor: v.id_fornecedor,
      id_organizacao: v.id_organizacao,
    }))
  }

  const naOrg = vinculos.filter((v) => v.id_organizacao === args.id_organizacao)
  if (naOrg.some((v) => v.status_fornecedor_organizacao === 'PENDENTE_APROVACAO')) {
    const cfg = criarAppErrorVisaoFornecedorPermissao(CODIGO_ERRO_FORNECEDOR_PENDENTE_APROVACAO)
    throw new AppError(cfg.message, cfg.statusCode, cfg.code, cfg.details)
  }
  if (naOrg.some((v) => v.status_fornecedor_organizacao === 'INATIVO')) {
    const cfg = criarAppErrorVisaoFornecedorPermissao(CODIGO_ERRO_FORNECEDOR_VINCULO_INATIVO)
    throw new AppError(cfg.message, cfg.statusCode, cfg.code, cfg.details)
  }
  if (vinculos.length > 0) {
    const cfg = criarAppErrorVisaoFornecedorPermissao(CODIGO_ERRO_FORNECEDOR_VINCULO_ORG_DIVERGENTE)
    throw new AppError(cfg.message, cfg.statusCode, cfg.code, cfg.details)
  }

  const cfg = criarAppErrorVisaoFornecedorPermissao(CODIGO_ERRO_FORNECEDOR_NAO_PROVISIONADO)
  throw new AppError(cfg.message, cfg.statusCode, cfg.code, cfg.details)
}

/** Espelha id_usuario Gravity (+ Clerk opcional) no BID via id_fornecedor Cadastros. */
export async function sincronizarUsuarioBidFreteFornecedor(args: {
  id_organizacao_cliente: string
  id_fornecedor: string
  id_usuario: string
  id_clerk_usuario?: string | null
  correlation_id?: string
  /** Quando true, falha de sync propaga erro (ex.: PUT permissoes com cotar). */
  obrigatorio?: boolean
}): Promise<void> {
  if (!args.id_fornecedor?.trim() || !args.id_usuario?.trim()) return

  const baseUrl = process.env.BID_FRETE_INTERNATIONAL_SERVICE_URL ?? 'http://127.0.0.1:8023'
  const chave = process.env.CHAVE_INTERNA_SERVICO
  if (!chave) {
    if (args.obrigatorio) {
      const cfg = criarAppErrorVisaoFornecedorPermissao(CODIGO_ERRO_BID_SYNC_INDISPONIVEL)
      throw new AppError(cfg.message, 503, cfg.code, cfg.details)
    }
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
      if (args.obrigatorio) {
        const cfg = criarAppErrorVisaoFornecedorPermissao(CODIGO_ERRO_BID_SYNC_FALHOU)
        throw new AppError(cfg.message, res.status >= 500 ? 502 : 422, cfg.code, cfg.details)
      }
      log.warn('bid.sync_usuario.falhou', { status: res.status, id_fornecedor: args.id_fornecedor })
    }
  } catch (err) {
    if (args.obrigatorio && err instanceof AppError) throw err
    if (args.obrigatorio) {
      const detalhe = err instanceof Error ? err.message : String(err)
      const cfg = criarAppErrorVisaoFornecedorPermissao(CODIGO_ERRO_BID_SYNC_FALHOU)
      throw new AppError(
        `${cfg.message} (${detalhe})`,
        502,
        cfg.code,
        cfg.details,
      )
    }
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
    await sincronizarUsuarioBidFreteFornecedor({
      id_organizacao_cliente: args.id_organizacao_cliente,
      id_fornecedor: idFornecedor,
      id_usuario: args.id_usuario,
      id_clerk_usuario: args.id_clerk_usuario,
      correlation_id: args.correlation_id,
      obrigatorio: true,
    })
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
    try {
      await sincronizarUsuarioBidFreteFornecedor({
        id_organizacao_cliente: args.id_organizacao,
        id_fornecedor: vinculo.id_fornecedor,
        id_usuario: args.id_usuario,
        id_clerk_usuario: args.id_clerk_usuario,
        obrigatorio: true,
      })
    } catch (err) {
      log.warn('bid.sync_pos_login.falhou', {
        id_usuario: args.id_usuario,
        id_fornecedor: vinculo.id_fornecedor,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
}
