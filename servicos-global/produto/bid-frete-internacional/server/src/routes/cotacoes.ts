/**
 * cotacoes.ts — CRUD de Cotacoes
 * POST   /                 Criar cotacao (manual ou bloco)
 * GET    /                 Listar cotacoes (com filtros)
 * GET    /:id              Detalhe da cotacao
 * PATCH  /:id              Atualizar cotacao
 * PATCH  /:id/status       Mudar status (aprovar/reprovar/cancelar)
 * DELETE /:id              Excluir cotacao (rascunho)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/erros.js'
import { resolverNomeUsuarioOrganizacaoBidFreteInternacional } from '../lib/resolver-nome-usuario-organizacao-bid-frete-internacional.js'
import { atividadesIntegration, historicoIntegration } from '../services/integracoes-tenant.js'
import { motorBid } from '../services/motor-bid-frete-internacional.js'
import { gerarNumeroCotacaoFreteInternacional } from '../../../shared/numeracao-bid-frete-internacional.js'
import { patchDeveMarcarCotacaoAlterada } from '../../../shared/status-cotacao-alterada-bid-frete-internacional.js'
import { sincronizarResumoBid } from '../services/agregar-resumo-bid-frete-internacional.js'
import { relancarSeSchemaDrift } from '../lib/prisma-erro-schema.js'
import { clausulaFiltroWorkspaceBidFrete } from '../shared/workspace-filtro-bid-frete-internacional.js'
import { assertWorkspacesAutorizadosNoRequest } from '../shared/validar-multi-workspace-bid-frete-internacional.js'
import { prepararCamposRotaCotacaoPersistencia } from '../lib/rota-cotacao-bid-frete-internacional.js'
import {
  carregarContextoCatalogoRotaBidFreteInternacional,
  garantirTerminaisRotaNoContextoCatalogo,
} from '../lib/carregar-contexto-catalogo-rota-bid-frete-internacional.js'
import { validarRotaCotacaoContraCadastros } from '../lib/validar-rota-cadastros-cotacao-bid-frete-internacional.js'
import {
  codigosOpcaoPortoAeroportoParaPersistencia,
  refinamentoOpcoesPortoAeroportoCotacao,
} from '../../../shared/opcao-porto-aeroporto-cotacao-bid-frete-internacional.js'
import { resolverRotulosLocaisOpcionaisDisparoBidFrete } from '../lib/resolver-rotulos-locais-opcionais-disparo-bid-frete-internacional.js'
import { filtrarFornecedorIdsElegiveisDisparoBidFreteInternacional } from '../services/filtrar-fornecedores-disparo-bid-frete-internacional.js'
import type { ModalRotaCotacao } from '../../../shared/rota-cotacao-bid-frete-internacional.js'
import { empresaPagadoraTaxaFechamentoPlataformaGravitySchema, normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity, rotuloEmpresaPagadoraTaxaFechamentoPlataformaGravity } from '../../../shared/empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'
import {
  lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional,
  registrarEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional,
} from '../lib/snapshot-empresa-pagadora-taxa-fechamento-cotacao-bid-frete-internacional.js'

const router = Router()

const CamposRotaModalCotacaoSchema = z.object({
  porto_origem_cotacao_bid_frete_internacional: z.string().optional(),
  porto_destino_cotacao_bid_frete_internacional: z.string().optional(),
  aeroporto_origem_cotacao_bid_frete_internacional: z.string().optional(),
  aeroporto_destino_cotacao_bid_frete_internacional: z.string().optional(),
  pais_origem_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  pais_destino_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  cidade_origem_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  cidade_destino_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  origem_codigo_cotacao_bid_frete_internacional: z.string().optional(),
  origem_nome_cotacao_bid_frete_internacional: z.string().optional(),
  origem_pais_cotacao_bid_frete_internacional: z.string().optional(),
  destino_codigo_cotacao_bid_frete_internacional: z.string().optional(),
  destino_nome_cotacao_bid_frete_internacional: z.string().optional(),
  destino_pais_cotacao_bid_frete_internacional: z.string().optional(),
})

// --- Schemas de validacao ---

const CriarCotacaoSchemaBase = z.object({
  id_bid_bid_frete_internacional: z.string().optional(),
  numero_cotacao_bid_frete_internacional: z.string().trim().min(1).max(80).optional(),
  referencia_interna_cotacao_bid_frete_internacional: z.string().optional(),
  tipo_operacao_cotacao_bid_frete_internacional: z.enum(['IMPORTACAO', 'EXPORTACAO']),
  modal_cotacao_bid_frete_internacional: z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO']),
  modalidade_cotacao_bid_frete_internacional: z.enum(['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL']),
}).merge(CamposRotaModalCotacaoSchema).extend({
  descricao_mercadoria_cotacao_bid_frete_internacional: z.string().min(1),
  ncm_cotacao_bid_frete_internacional: z.string().optional(),
  hs_code_cotacao_bid_frete_internacional: z.string().max(10).optional(),
  quantidade_volume_cotacao_bid_frete_internacional: z.number().int().positive().default(1),
  tipo_container_cotacao_bid_frete_internacional: z.string().optional(),
  peso_kg_cotacao_bid_frete_internacional: z.number().positive().optional(),
  peso_ton_cotacao_bid_frete_internacional: z.number().positive().optional(),
  codigo_unidade_cubagem_cotacao_bid_frete_internacional: z.string().min(1).max(8).optional(),
  comprimento_cubagem_cotacao_bid_frete_internacional: z.number().positive().optional(),
  largura_cubagem_cotacao_bid_frete_internacional: z.number().positive().optional(),
  altura_cubagem_cotacao_bid_frete_internacional: z.number().positive().optional(),
  cubagem_m3_cotacao_bid_frete_internacional: z.number().positive().optional(),
  incoterm_cotacao_bid_frete_internacional: z.string().min(1),
  zipcode_origem_cotacao_bid_frete_internacional: z.string().optional(),
  endereco_origem_cotacao_bid_frete_internacional: z.string().optional(),
  endereco_destino_cotacao_bid_frete_internacional: z.string().optional(),
  zipcode_destino_cotacao_bid_frete_internacional: z.string().optional(),
  valor_meta_cotacao_bid_frete_internacional: z.number().positive().optional(),
  moeda_meta_cotacao_bid_frete_internacional: z.string().default('USD'),
  visibilidade_cotacao_bid_frete_internacional: z.enum(['DIRECIONADA', 'ABERTA']).default('DIRECIONADA'),
  anonima_cotacao_bid_frete_internacional: z.boolean().default(false),
  data_limite_resposta_cotacao_bid_frete_internacional: z.string().datetime(),
  fornecedor_pode_alterar_proposta_cotacao_bid_frete_internacional: z.boolean(),
  eh_carga_perigosa_cotacao_bid_frete_internacional: z.boolean().default(false),
  numero_onu_cotacao_bid_frete_internacional: z.string().optional(),
  nome_tecnico_embarque_cotacao_bid_frete_internacional: z.string().optional(),
  classe_carga_perigosa_cotacao_bid_frete_internacional: z.number().int().min(1).max(9).optional(),
  divisao_carga_perigosa_cotacao_bid_frete_internacional: z.string().optional(),
  grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional: z.enum(['I', 'II', 'III']).optional(),
  observacoes_carga_perigosa_cotacao_bid_frete_internacional: z.string().max(500).optional(),
  incluir_armazenagem_cotacao_bid_frete_internacional: z.boolean().default(false),
  nomes_armazem_alfandegado_cotacao_bid_frete_internacional: z.array(z.string().min(1).max(200)).max(20).optional(),
  fornecedor_ids: z.array(z.string()).optional(),
  disparar_ao_criar: z.boolean().default(false),
  canais_disparo: z.array(z.enum(['EMAIL', 'WHATSAPP'])).default(['EMAIL']),
  emails_por_fornecedor: z.record(z.string(), z.array(z.string().email())).optional(),
  habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: z.boolean().default(false),
  codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: z.array(z.string().min(1)).optional(),
  habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional: z.boolean().default(false),
  codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional: z.array(z.string().min(1)).optional(),
  empresa_pagadora_taxa_fechamento_plataforma_gravity:
    empresaPagadoraTaxaFechamentoPlataformaGravitySchema.optional(),
})

type DadosCotacaoBase = z.infer<typeof CriarCotacaoSchemaBase>

const CAMPOS_ROTA_COTACAO = [
  'modal_cotacao_bid_frete_internacional',
  'porto_origem_cotacao_bid_frete_internacional',
  'porto_destino_cotacao_bid_frete_internacional',
  'aeroporto_origem_cotacao_bid_frete_internacional',
  'aeroporto_destino_cotacao_bid_frete_internacional',
  'pais_origem_rodoviario_cotacao_bid_frete_internacional',
  'pais_destino_rodoviario_cotacao_bid_frete_internacional',
  'estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional',
  'estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional',
  'cidade_origem_rodoviario_cotacao_bid_frete_internacional',
  'cidade_destino_rodoviario_cotacao_bid_frete_internacional',
  'origem_codigo_cotacao_bid_frete_internacional',
  'origem_nome_cotacao_bid_frete_internacional',
  'origem_pais_cotacao_bid_frete_internacional',
  'destino_codigo_cotacao_bid_frete_internacional',
  'destino_nome_cotacao_bid_frete_internacional',
  'destino_pais_cotacao_bid_frete_internacional',
] as const

const CAMPOS_CARGA_PERIGOSA_COTACAO = [
  'eh_carga_perigosa_cotacao_bid_frete_internacional',
  'numero_onu_cotacao_bid_frete_internacional',
  'nome_tecnico_embarque_cotacao_bid_frete_internacional',
  'classe_carga_perigosa_cotacao_bid_frete_internacional',
  'divisao_carga_perigosa_cotacao_bid_frete_internacional',
  'grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional',
  'observacoes_carga_perigosa_cotacao_bid_frete_internacional',
] as const

const CAMPOS_OPCAO_PORTO_AEROPORTO_COTACAO = [
  'habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional',
  'codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional',
  'habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional',
  'codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional',
] as const

function corpoPatchTocaCampo(body: Record<string, unknown>, campos: readonly string[]): boolean {
  return campos.some(campo => body[campo] !== undefined)
}

function executarRefinamentoCotacao(
  data: DadosCotacaoBase,
  refinamento: (payload: DadosCotacaoBase, ctx: z.RefinementCtx) => void,
): z.ZodIssue[] {
  const issues: z.ZodIssue[] = []
  refinamento(data, {
    addIssue: (issue) => {
      issues.push({
        code: 'custom',
        path: issue.path ?? [],
        message: issue.message ?? 'Validacao falhou',
      })
    },
  } as z.RefinementCtx)
  return issues
}

function refinamentoCargaPerigosa(data: DadosCotacaoBase, ctx: z.RefinementCtx): void {
  if (!data.eh_carga_perigosa_cotacao_bid_frete_internacional) return
  if (!data.numero_onu_cotacao_bid_frete_internacional?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'numero_onu obrigatorio para carga perigosa', path: ['numero_onu_cotacao_bid_frete_internacional'] })
  }
  if (!data.nome_tecnico_embarque_cotacao_bid_frete_internacional?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'nome_tecnico_embarque obrigatorio para carga perigosa', path: ['nome_tecnico_embarque_cotacao_bid_frete_internacional'] })
  }
  if (data.classe_carga_perigosa_cotacao_bid_frete_internacional == null) {
    ctx.addIssue({ code: 'custom', message: 'classe obrigatoria para carga perigosa', path: ['classe_carga_perigosa_cotacao_bid_frete_internacional'] })
  }
  if (!data.grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional && data.classe_carga_perigosa_cotacao_bid_frete_internacional != null) {
    const semGrupo = [1, 2, 7].includes(data.classe_carga_perigosa_cotacao_bid_frete_internacional)
    if (!semGrupo) {
      ctx.addIssue({ code: 'custom', message: 'grupo_embalagem obrigatorio para carga perigosa', path: ['grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional'] })
    }
  }
}

function refinamentoRota(data: DadosCotacaoBase, ctx: z.RefinementCtx): void {
  const preparado = prepararCamposRotaCotacaoPersistencia(data)
  if (!preparado.origem_codigo_cotacao_bid_frete_internacional) {
    ctx.addIssue({ code: 'custom', message: 'Origem obrigatoria para o modal selecionado', path: ['porto_origem_cotacao_bid_frete_internacional'] })
  }
  if (!preparado.destino_codigo_cotacao_bid_frete_internacional) {
    ctx.addIssue({ code: 'custom', message: 'Destino obrigatorio para o modal selecionado', path: ['porto_destino_cotacao_bid_frete_internacional'] })
  }
  if (!preparado.origem_nome_cotacao_bid_frete_internacional) {
    ctx.addIssue({ code: 'custom', message: 'Nome de origem obrigatorio', path: ['origem_nome_cotacao_bid_frete_internacional'] })
  }
  if (!preparado.destino_nome_cotacao_bid_frete_internacional) {
    ctx.addIssue({ code: 'custom', message: 'Nome de destino obrigatorio', path: ['destino_nome_cotacao_bid_frete_internacional'] })
  }
  if (!preparado.origem_pais_cotacao_bid_frete_internacional) {
    ctx.addIssue({ code: 'custom', message: 'Pais de origem obrigatorio', path: ['origem_pais_cotacao_bid_frete_internacional'] })
  }
  if (!preparado.destino_pais_cotacao_bid_frete_internacional) {
    ctx.addIssue({ code: 'custom', message: 'Pais de destino obrigatorio', path: ['destino_pais_cotacao_bid_frete_internacional'] })
  }
}

function refinamentoOpcoesPortoAeroporto(data: DadosCotacaoBase, ctx: z.RefinementCtx): void {
  refinamentoOpcoesPortoAeroportoCotacao(
    data.habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional,
    data.codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional,
    'codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional',
    ctx,
  )
  refinamentoOpcoesPortoAeroportoCotacao(
    data.habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional,
    data.codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional,
    'codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional',
    ctx,
  )
}

async function prepararCamposOpcaoPortoAeroportoCotacao(dados: DadosCotacaoBase) {
  const habilitarOrigem = dados.habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional ?? false
  const habilitarDestino = dados.habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional ?? false
  const modal = dados.modal_cotacao_bid_frete_internacional

  async function persistirOpcionais(
    habilitado: boolean,
    codigos: string[] | undefined,
  ): Promise<unknown[] | null> {
    if (!habilitado) return null
    const limpos = (codigos ?? []).map((c) => c.trim()).filter(Boolean)
    if (limpos.length === 0) return null
    const rotulos = await resolverRotulosLocaisOpcionaisDisparoBidFrete(modal, limpos)
    return codigosOpcaoPortoAeroportoParaPersistencia(
      true,
      limpos.map((codigo, indice) => {
        const rotulo = rotulos[indice]
        return rotulo && rotulo !== codigo ? { codigo, rotulo } : codigo
      }),
    )
  }

  return {
    habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: habilitarOrigem,
    codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: await persistirOpcionais(
      habilitarOrigem,
      dados.codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional,
    ),
    habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional: habilitarDestino,
    codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional: await persistirOpcionais(
      habilitarDestino,
      dados.codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional,
    ),
  }
}

/** Nomes de armazém só persistem quando o comprador optou por incluir armazenagem; vazios são descartados. */
function nomesArmazemAlfandegadoParaPersistencia(
  dados: Pick<
    DadosCotacaoBase,
    'incluir_armazenagem_cotacao_bid_frete_internacional' | 'nomes_armazem_alfandegado_cotacao_bid_frete_internacional'
  >,
): string[] | null {
  if (!dados.incluir_armazenagem_cotacao_bid_frete_internacional) return null
  const nomes = (dados.nomes_armazem_alfandegado_cotacao_bid_frete_internacional ?? [])
    .map((nome) => nome.trim())
    .filter(Boolean)
  return nomes.length > 0 ? nomes : null
}

async function prepararRotaComValidacaoCadastros(
  dados: DadosCotacaoBase,
  idOrganizacao: string,
): Promise<ReturnType<typeof prepararCamposRotaCotacaoPersistencia>> {
  const ctx = await carregarContextoCatalogoRotaBidFreteInternacional(idOrganizacao)
  await garantirTerminaisRotaNoContextoCatalogo(ctx, dados, idOrganizacao)
  const erros = await validarRotaCotacaoContraCadastros(dados, idOrganizacao, ctx)
  if (erros.length > 0) {
    throw new AppError(
      `Dados invalidos: ${erros.map((e) => `[${e.path}] ${e.message}`).join('; ')}`,
      400,
      'VALIDATION_ERROR',
    )
  }
  return prepararCamposRotaCotacaoPersistencia(dados, ctx)
}

function assertRefinamentosCotacaoPatch(
  merged: DadosCotacaoBase,
  body: Record<string, unknown>,
): void {
  const issues: z.ZodIssue[] = []
  if (corpoPatchTocaCampo(body, CAMPOS_CARGA_PERIGOSA_COTACAO)) {
    issues.push(...executarRefinamentoCotacao(merged, refinamentoCargaPerigosa))
  }
  if (corpoPatchTocaCampo(body, CAMPOS_ROTA_COTACAO)) {
    issues.push(...executarRefinamentoCotacao(merged, refinamentoRota))
  }
  if (corpoPatchTocaCampo(body, CAMPOS_OPCAO_PORTO_AEROPORTO_COTACAO)) {
    issues.push(...executarRefinamentoCotacao(merged, refinamentoOpcoesPortoAeroporto))
  }
  if (issues.length === 0) return
  throw new AppError(
    `Dados invalidos: ${issues.map(i => `[${i.path.join('.')}] ${i.message}`).join('; ')}`,
    400,
    'VALIDATION_ERROR',
  )
}

const CriarCotacaoSchema = CriarCotacaoSchemaBase
  .superRefine(refinamentoCargaPerigosa)
  .superRefine(refinamentoRota)
  .superRefine(refinamentoOpcoesPortoAeroporto)

const FiltrosCotacaoSchema = z.object({
  status: z.string().optional(),
  modal_cotacao_bid_frete_internacional: z.string().optional(),
  tipo_operacao_cotacao_bid_frete_internacional: z.string().optional(),
  origem: z.string().optional(),
  destino: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  // Paridade com COTACOES_LIMIT_LISTA (client) — KPIs e tabela filtram client-side
  limit: z.coerce.number().int().positive().max(500).default(20),
  order_by: z.string().default('data_criacao_cotacao_bid_frete_internacional'),
  order_dir: z.enum(['asc', 'desc']).default('desc'),
  /** Quando true, retorna só pedidos avulsos (sem BID pai) — paridade lista 2 camadas */
  apenas_avulsas: z.coerce.boolean().optional(),
})

/** Campos atualizáveis via PATCH /:id — whitelist evita 500 por campos só do formulário wizard. */
const AtualizarCotacaoSchema = CriarCotacaoSchemaBase.omit({
  fornecedor_ids: true,
  disparar_ao_criar: true,
  canais_disparo: true,
}).partial().extend({
  id_workspace: z.string().min(1).optional(),
  id_usuario: z.string().min(1).optional(),
  data_criacao_cotacao_bid_frete_internacional: z.coerce.date().optional(),
  data_aprovacao_cotacao_bid_frete_internacional: z.coerce.date().nullable().optional(),
  data_cancelamento_cotacao_bid_frete_internacional: z.coerce.date().nullable().optional(),
  data_limite_resposta_cotacao_bid_frete_internacional: z.coerce.date().nullable().optional(),
  ganho_valor_cotacao_bid_frete_internacional: z.number().nullable().optional(),
  ganho_percentual_cotacao_bid_frete_internacional: z.number().nullable().optional(),
  motivo_reprovacao_cotacao_bid_frete_internacional: z.string().nullable().optional(),
  motivo_cancelamento_cotacao_bid_frete_internacional: z.string().nullable().optional(),
})

const AtualizarStatusSchema = z.object({
  status: z.enum([
    'RASCUNHO',
    'ENVIADA_FORNECEDORES',
    'EM_COTACAO',
    'COTACAO_ALTERADA',
    'AGUARDANDO_APROVACAO',
    'APROVADA',
    'REPROVADA',
    'CANCELADA',
    'FALTA_INFORMACAO',
    'EXPIRADA',
  ]),
  id_fornecedor_vencedor_cotacao_bid_frete_internacional: z.string().optional(),
  motivo_reprovacao_cotacao_bid_frete_internacional: z.string().optional(),
  motivo_cancelamento_cotacao_bid_frete_internacional: z.string().optional(),
})

// --- Gerar numero_cotacao_bid_frete_internacional (prefixo COT-) ---
// Exportado para reuso em duplicacoes-bid-frete-internacional.ts (mesmo formato).
export function gerarNumeroCotacao(): string {
  return gerarNumeroCotacaoFreteInternacional()
}

function resolverIdWorkspace(req: Request): string | undefined {
  const header = req.headers['x-id-workspace'] as string | undefined
  const id = header?.trim()
  return id || undefined
}

/** Cotação aberta: intersect payload com fornecedores elegíveis (ATIVO + aceita aberta). */
async function filtrarIdsFornecedoresElegiveisCotacaoAberta(
  prisma: NonNullable<Request['prisma']>,
  fornecedor_ids: string[],
): Promise<string[]> {
  const rows = await (prisma as {
    fornecedorBidFreteInternacional: {
      findMany: (args: unknown) => Promise<Array<{ id_fornecedor_bid_frete_internacional: string }>>
    }
  }).fornecedorBidFreteInternacional.findMany({
    where: {
      id_produto_gravity: 'bid-frete-internacional',
      id_fornecedor_bid_frete_internacional: { in: fornecedor_ids },
      status_fornecedor_bid_frete_internacional: 'ATIVO',
      aceita_cotacao_aberta_fornecedor_bid_frete_internacional: true,
    },
    select: { id_fornecedor_bid_frete_internacional: true },
  })
  return rows.map(r => r.id_fornecedor_bid_frete_internacional)
}

// --- POST / — Criar cotacao ---
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CriarCotacaoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400, 'VALIDATION_ERROR')
    }

    const userId = req.headers['x-id-usuario'] as string
    if (!userId) throw new AppError('x-id-usuario obrigatorio', 401, 'UNAUTHORIZED')

    const idWorkspace = resolverIdWorkspace(req)
    const tenantId = req.tenantId
    if (!tenantId) throw new AppError('x-id-organizacao obrigatorio', 401, 'UNAUTHORIZED')
    const {
      fornecedor_ids,
      disparar_ao_criar,
      canais_disparo,
      emails_por_fornecedor,
      id_bid_bid_frete_internacional,
      empresa_pagadora_taxa_fechamento_plataforma_gravity,
      ...cotacaoData
    } = parsed.data
    const { data_limite_resposta_cotacao_bid_frete_internacional: dataLimiteIso, ...camposCotacao } = cotacaoData
    const camposPersistencia = await prepararRotaComValidacaoCadastros(camposCotacao, tenantId)
    const camposOpcaoPortoAeroporto = await prepararCamposOpcaoPortoAeroportoCotacao(camposCotacao)

    const cotacao = await (req.prisma as any).cotacaoBidFreteInternacional.create({
      data: {
        ...camposPersistencia,
        ...camposOpcaoPortoAeroporto,
        nomes_armazem_alfandegado_cotacao_bid_frete_internacional:
          nomesArmazemAlfandegadoParaPersistencia(camposCotacao),
        id_produto_gravity: 'bid-frete-internacional',
        id_usuario: userId,
        ...(idWorkspace ? { id_workspace: idWorkspace } : {}),
        ...(id_bid_bid_frete_internacional ? { id_bid_bid_frete_internacional } : {}),
        numero_cotacao_bid_frete_internacional:
          camposCotacao.numero_cotacao_bid_frete_internacional?.trim() || gerarNumeroCotacao(),
        data_limite_resposta_cotacao_bid_frete_internacional: new Date(dataLimiteIso),
      },
    })

    registrarEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional(
      cotacao.id_cotacao_bid_frete_internacional,
      normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity(
        empresa_pagadora_taxa_fechamento_plataforma_gravity,
      ),
    )

    if (id_bid_bid_frete_internacional) {
      await sincronizarResumoBid(req.prisma, id_bid_bid_frete_internacional)
    }

    // Integrações S2S (fire-and-forget)
    if (tenantId) {
      atividadesIntegration.cotacaoCriada(tenantId, userId, cotacao)
      historicoIntegration.cotacaoCriada(tenantId, userId, {
        id: cotacao.id_cotacao_bid_frete_internacional,
        numero_cotacao_bid_frete_internacional: cotacao.numero_cotacao_bid_frete_internacional,
      })
    }

    let disparo: Awaited<ReturnType<typeof motorBid.disparar>> | Awaited<ReturnType<typeof motorBid.dispararCotacaoAberta>> | null = null
    let disparo_erro: string | null = null
    if (disparar_ao_criar && tenantId) {
      const canais = canais_disparo.length > 0 ? canais_disparo : ['EMAIL']
      const modalDisparo = cotacao.modal_cotacao_bid_frete_internacional as ModalRotaCotacao
      try {
        if (cotacao.visibilidade_cotacao_bid_frete_internacional === 'ABERTA') {
          if (fornecedor_ids !== undefined) {
            const idsAberta = await filtrarIdsFornecedoresElegiveisCotacaoAberta(req.prisma!, fornecedor_ids)
            const idsElegiveis = await filtrarFornecedorIdsElegiveisDisparoBidFreteInternacional(
              tenantId,
              modalDisparo,
              idsAberta,
            )
            if (idsElegiveis.length > 0) {
              disparo = await motorBid.disparar(req.prisma!, {
                id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
                fornecedor_ids: idsElegiveis,
                canais,
                id_usuario: userId,
                id_organizacao: tenantId,
                emails_por_fornecedor,
              })
            } else {
              disparo = { disparos: 0, results: [], message: 'Nenhum fornecedor selecionado para disparo' }
            }
          } else {
            disparo = await motorBid.dispararCotacaoAberta(req.prisma!, {
              id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
              canais,
              id_usuario: userId,
              id_organizacao: tenantId,
            })
          }
        } else if (fornecedor_ids && fornecedor_ids.length > 0) {
          const idsElegiveis = await filtrarFornecedorIdsElegiveisDisparoBidFreteInternacional(
            tenantId,
            modalDisparo,
            fornecedor_ids,
          )
          if (idsElegiveis.length > 0) {
            disparo = await motorBid.disparar(req.prisma!, {
              id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
              fornecedor_ids: idsElegiveis,
              canais,
              id_usuario: userId,
              id_organizacao: tenantId,
              emails_por_fornecedor,
            })
          } else {
            disparo = { disparos: 0, results: [], message: 'Nenhum fornecedor elegivel para o modal da cotacao' }
          }
        }
      } catch (disparoErr: unknown) {
        disparo_erro = disparoErr instanceof Error ? disparoErr.message : String(disparoErr)
        console.error('[cotacoes] disparo ao criar falhou (cotacao persistida):', disparo_erro)
      }
    }

    res.status(201).json({ cotacao, disparo, ...(disparo_erro ? { disparo_erro } : {}) })
  } catch (err) {
    try {
      relancarSeSchemaDrift(err)
    } catch (e) {
      next(e)
    }
  }
})

// --- GET / — Listar cotacoes ---
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertWorkspacesAutorizadosNoRequest(req)
    const parsed = FiltrosCotacaoSchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError(
        `Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`,
        400,
        'VALIDATION_ERROR',
      )
    }
    const filtros = parsed.data

    const where: Record<string, unknown> = { id_produto_gravity: 'bid-frete-internacional' }
    if (filtros.status) where.status_cotacao_bid_frete_internacional = filtros.status
    if (filtros.modal_cotacao_bid_frete_internacional) where.modal_cotacao_bid_frete_internacional = filtros.modal_cotacao_bid_frete_internacional
    if (filtros.tipo_operacao_cotacao_bid_frete_internacional) where.tipo_operacao_cotacao_bid_frete_internacional = filtros.tipo_operacao_cotacao_bid_frete_internacional
    if (filtros.origem) where.origem_nome_cotacao_bid_frete_internacional = { contains: filtros.origem, mode: 'insensitive' }
    if (filtros.destino) where.destino_nome_cotacao_bid_frete_internacional = { contains: filtros.destino, mode: 'insensitive' }
    if (filtros.data_inicio || filtros.data_fim) {
      const createdAt: Record<string, unknown> = {}
      if (filtros.data_inicio) createdAt.gte = new Date(filtros.data_inicio)
      if (filtros.data_fim) createdAt.lte = new Date(filtros.data_fim)
      where.data_criacao_cotacao_bid_frete_internacional = createdAt
    }
    if (filtros.apenas_avulsas) {
      where.id_bid_bid_frete_internacional = null
    }

    Object.assign(where, clausulaFiltroWorkspaceBidFrete(req))

    const skip = (filtros.page - 1) * filtros.limit

    const [cotacoes, total] = await Promise.all([
      (req.prisma as any).cotacaoBidFreteInternacional.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy: { [filtros.order_by]: filtros.order_dir },
        include: {
          bid_bid_frete_internacional: {
            select: {
              id_bid_bid_frete_internacional: true,
              numero_bid_bid_frete_internacional: true,
              referencia_interna_bid_bid_frete_internacional: true,
              status_bid_bid_frete_internacional: true,
            },
          },
          disparos_cotacao: { select: { id_disparo_cotacao_bid_frete_internacional: true, id_fornecedor_bid_frete_internacional: true, status_disparo_cotacao_bid_frete_internacional: true } },
          propostas: { select: { id_proposta_bid_frete_internacional: true, id_fornecedor_bid_frete_internacional: true, valor_total_proposta_bid_frete_internacional: true, dias_transito_proposta_bid_frete_internacional: true, status_proposta_bid_frete_internacional: true, classificacao_valor_proposta_bid_frete_internacional: true, classificacao_transito_proposta_bid_frete_internacional: true } },
        },
      }),
      (req.prisma as any).cotacaoBidFreteInternacional.count({ where }),
    ])

    res.json({
      cotacoes,
      pagination: {
        page: filtros.page,
        limit: filtros.limit,
        total,
        pages: Math.ceil(total / filtros.limit),
      },
    })
  } catch (err) {
    try {
      relancarSeSchemaDrift(err)
    } catch (e) {
      next(e)
    }
  }
})

// --- GET /:id — Detalhe da cotacao ---
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cotacao = await (req.prisma as any).cotacaoBidFreteInternacional.findFirst({
      where: { id_cotacao_bid_frete_internacional: req.params.id },
      include: {
        bid_bid_frete_internacional: {
          select: {
            id_bid_bid_frete_internacional: true,
            numero_bid_bid_frete_internacional: true,
            referencia_interna_bid_bid_frete_internacional: true,
            status_bid_bid_frete_internacional: true,
            _count: { select: { cotacoes: true } },
          },
        },
        disparos_cotacao: {
          include: {
            fornecedor: { select: { id_fornecedor_bid_frete_internacional: true, nome_fornecedor_bid_frete_internacional: true, tipo_fornecedor_bid_frete_internacional: true, email_fornecedor_bid_frete_internacional: true } },
          },
        },
        propostas: {
          include: {
            fornecedor: { select: { id_fornecedor_bid_frete_internacional: true, nome_fornecedor_bid_frete_internacional: true, tipo_fornecedor_bid_frete_internacional: true, email_fornecedor_bid_frete_internacional: true } },
            taxas_origem: true,
            taxas_destino: true,
          },
          orderBy: { valor_total_proposta_bid_frete_internacional: 'asc' },
        },
      },
    })

    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')

    const historicoAprovado = await (req.prisma as any).cotacaoBidFreteInternacional.findMany({
      where: {
        origem_codigo_cotacao_bid_frete_internacional: cotacao.origem_codigo_cotacao_bid_frete_internacional,
        destino_codigo_cotacao_bid_frete_internacional: cotacao.destino_codigo_cotacao_bid_frete_internacional,
        modal_cotacao_bid_frete_internacional: cotacao.modal_cotacao_bid_frete_internacional,
        modalidade_cotacao_bid_frete_internacional: cotacao.modalidade_cotacao_bid_frete_internacional,
        tipo_container_cotacao_bid_frete_internacional: cotacao.tipo_container_cotacao_bid_frete_internacional,
        incoterm_cotacao_bid_frete_internacional: cotacao.incoterm_cotacao_bid_frete_internacional,
        status_cotacao_bid_frete_internacional: 'APROVADA',
        NOT: {
          id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
        },
      },
      select: {
        id_cotacao_bid_frete_internacional: true,
        numero_cotacao_bid_frete_internacional: true,
        data_criacao_cotacao_bid_frete_internacional: true,
        data_atualizacao_cotacao_bid_frete_internacional: true,
        data_limite_resposta_cotacao_bid_frete_internacional: true,
        data_aprovacao_cotacao_bid_frete_internacional: true,
        disparos_cotacao: {
          select: {
            data_envio_disparo_cotacao_bid_frete_internacional: true,
            data_resposta_disparo_cotacao_bid_frete_internacional: true,
          },
        },
        propostas: {
          select: {
            data_criacao_proposta_bid_frete_internacional: true,
            status_proposta_bid_frete_internacional: true,
            valor_total_proposta_bid_frete_internacional: true,
            moeda_proposta_bid_frete_internacional: true,
          },
        },
      },
      orderBy: {
        data_aprovacao_cotacao_bid_frete_internacional: 'desc',
      },
    })

    let id_usuario_aprovacao_ganho_bid_frete_internacional: string | null = null
    let nome_usuario_aprovacao_ganho_bid_frete_internacional: string | null = null
    if (cotacao.status_cotacao_bid_frete_internacional === 'APROVADA') {
      const ganhoAprovacao = await (req.prisma as any).ganhoBidFreteInternacional.findFirst({
        where: { id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional },
        orderBy: { data_criacao_ganho_bid_frete_internacional: 'desc' },
        select: { id_usuario: true },
      })
      id_usuario_aprovacao_ganho_bid_frete_internacional = ganhoAprovacao?.id_usuario ?? null
      if (id_usuario_aprovacao_ganho_bid_frete_internacional) {
        nome_usuario_aprovacao_ganho_bid_frete_internacional =
          await resolverNomeUsuarioOrganizacaoBidFreteInternacional(
            cotacao.id_organizacao,
            id_usuario_aprovacao_ganho_bid_frete_internacional,
          )
      }
    }

    res.json({
      cotacao: {
        ...cotacao,
        empresa_pagadora_taxa_fechamento_plataforma_gravity:
          lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional(
            cotacao.id_cotacao_bid_frete_internacional,
          ),
        historico_aprovado: historicoAprovado,
        id_usuario_aprovacao_ganho_bid_frete_internacional,
        nome_usuario_aprovacao_ganho_bid_frete_internacional,
      },
    })
  } catch (err) {
    next(err)
  }
})

// --- PATCH /:id — Atualizar cotacao ---
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AtualizarCotacaoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        `Dados invalidos: ${parsed.error.issues.map(i => `[${i.path.join('.')}] ${i.message}`).join('; ')}`,
        400,
        'VALIDATION_ERROR',
      )
    }

    const existing = await (req.prisma as any).cotacaoBidFreteInternacional.findFirst({ where: { id_cotacao_bid_frete_internacional: req.params.id } })
    if (!existing) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')

    const merged = { ...existing, ...parsed.data }
    assertRefinamentosCotacaoPatch(merged as DadosCotacaoBase, parsed.data as Record<string, unknown>)
    const tenantId = req.tenantId
    if (!tenantId) throw new AppError('x-id-organizacao obrigatorio', 401, 'UNAUTHORIZED')
    const tocaRota = corpoPatchTocaCampo(parsed.data as Record<string, unknown>, CAMPOS_ROTA_COTACAO)
    const camposPersistencia = tocaRota
      ? await prepararRotaComValidacaoCadastros(merged as DadosCotacaoBase, tenantId)
      : prepararCamposRotaCotacaoPersistencia(merged)
    const data: Record<string, unknown> = { ...parsed.data, ...camposPersistencia }

    if (parsed.data.eh_carga_perigosa_cotacao_bid_frete_internacional === false) {
      data.numero_onu_cotacao_bid_frete_internacional = null
      data.nome_tecnico_embarque_cotacao_bid_frete_internacional = null
      data.classe_carga_perigosa_cotacao_bid_frete_internacional = null
      data.divisao_carga_perigosa_cotacao_bid_frete_internacional = null
      data.grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional = null
      data.observacoes_carga_perigosa_cotacao_bid_frete_internacional = null
    }

    if (corpoPatchTocaCampo(parsed.data as Record<string, unknown>, CAMPOS_OPCAO_PORTO_AEROPORTO_COTACAO)) {
      Object.assign(data, await prepararCamposOpcaoPortoAeroportoCotacao(merged as DadosCotacaoBase))
    }

    if (patchDeveMarcarCotacaoAlterada(
      existing.status_cotacao_bid_frete_internacional,
      parsed.data as Record<string, unknown>,
    )) {
      data.status_cotacao_bid_frete_internacional = 'COTACAO_ALTERADA'
    }

    const cotacao = await (req.prisma as any).cotacaoBidFreteInternacional.update({
      where: { id_cotacao_bid_frete_internacional: req.params.id },
      data,
    })

    if (existing.id_bid_bid_frete_internacional) {
      await sincronizarResumoBid(req.prisma, existing.id_bid_bid_frete_internacional)
    }

    res.json({ cotacao })
  } catch (err) {
    try {
      relancarSeSchemaDrift(err)
    } catch (e) {
      next(e)
    }
  }
})

// --- PATCH /:id/status — Aprovar/Reprovar/Cancelar ---
router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AtualizarStatusSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const existing = await (req.prisma as any).cotacaoBidFreteInternacional.findFirst({ where: { id_cotacao_bid_frete_internacional: req.params.id } })
    if (!existing) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')

    const data: Record<string, unknown> = { status_cotacao_bid_frete_internacional: parsed.data.status }

    if (parsed.data.status === 'APROVADA') {
      data.data_aprovacao_cotacao_bid_frete_internacional = new Date()
      data.id_fornecedor_vencedor_cotacao_bid_frete_internacional = parsed.data.id_fornecedor_vencedor_cotacao_bid_frete_internacional
    } else if (parsed.data.status === 'REPROVADA') {
      data.motivo_reprovacao_cotacao_bid_frete_internacional = parsed.data.motivo_reprovacao_cotacao_bid_frete_internacional
    } else if (parsed.data.status === 'CANCELADA') {
      data.data_cancelamento_cotacao_bid_frete_internacional = new Date()
      data.motivo_cancelamento_cotacao_bid_frete_internacional = parsed.data.motivo_cancelamento_cotacao_bid_frete_internacional
    }

    const cotacao = await (req.prisma as any).cotacaoBidFreteInternacional.update({
      where: { id_cotacao_bid_frete_internacional: req.params.id },
      data,
    })

    if (existing.id_bid_bid_frete_internacional) {
      await sincronizarResumoBid(req.prisma, existing.id_bid_bid_frete_internacional)
    }

    res.json({ cotacao })
  } catch (err) {
    next(err)
  }
})

// --- DELETE /:id — Excluir rascunho ---
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await (req.prisma as any).cotacaoBidFreteInternacional.findFirst({ where: { id_cotacao_bid_frete_internacional: req.params.id } })
    if (!existing) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (existing.status_cotacao_bid_frete_internacional !== 'RASCUNHO') {
      throw new AppError('So e possivel excluir cotacoes em rascunho', 400, 'INVALID_STATUS')
    }

    await (req.prisma as any).cotacaoBidFreteInternacional.delete({ where: { id_cotacao_bid_frete_internacional: req.params.id } })
    res.json({ deleted: true })
  } catch (err) {
    next(err)
  }
})

// ─── IMPORTAÇÃO EM BLOCO ────────────────────────────────────────────────────────

const ItemBlocoSchema = z.object({
  referencia_interna_cotacao_bid_frete_internacional: z.string().optional(),
  tipo_operacao_cotacao_bid_frete_internacional: z.enum(['IMPORTACAO', 'EXPORTACAO']),
  modal_cotacao_bid_frete_internacional: z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO']),
  modalidade_cotacao_bid_frete_internacional: z.enum(['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL']),
  origem_codigo_cotacao_bid_frete_internacional: z.string().min(1),
  origem_nome_cotacao_bid_frete_internacional: z.string().min(1),
  origem_pais_cotacao_bid_frete_internacional: z.string().min(1),
  destino_codigo_cotacao_bid_frete_internacional: z.string().min(1),
  destino_nome_cotacao_bid_frete_internacional: z.string().min(1),
  destino_pais_cotacao_bid_frete_internacional: z.string().min(1),
  descricao_mercadoria_cotacao_bid_frete_internacional: z.string().min(1),
  ncm_cotacao_bid_frete_internacional: z.string().optional(),
  quantidade_volume_cotacao_bid_frete_internacional: z.number().int().positive().default(1),
  tipo_container_cotacao_bid_frete_internacional: z.string().optional(),
  peso_kg_cotacao_bid_frete_internacional: z.number().positive().optional(),
  cubagem_m3_cotacao_bid_frete_internacional: z.number().positive().optional(),
  incoterm_cotacao_bid_frete_internacional: z.string().min(1),
  valor_meta_cotacao_bid_frete_internacional: z.number().positive().optional(),
  moeda_meta_cotacao_bid_frete_internacional: z.string().default('USD'),
})

const ImportarBlocoSchema = z.object({
  itens: z.array(ItemBlocoSchema).min(1).max(500),
  data_limite_resposta_cotacao_bid_frete_internacional: z.string().datetime().optional(),
  visibilidade_cotacao_bid_frete_internacional: z.enum(['DIRECIONADA', 'ABERTA']).default('DIRECIONADA'),
  fornecedor_ids: z.array(z.string()).optional(),
  canais: z.array(z.enum(['EMAIL', 'WHATSAPP'])).optional(),
})

// --- POST /bloco — Importar cotações em bloco ---
router.post('/bloco', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ImportarBlocoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => `[${i.path}] ${i.message}`).join('; ')}`, 400, 'VALIDATION_ERROR')
    }

    const userId = req.headers['x-id-usuario'] as string
    if (!userId) throw new AppError('x-id-usuario obrigatorio', 401, 'UNAUTHORIZED')

    const idWorkspace = resolverIdWorkspace(req)
    const results: Array<{ linha: number; id?: string; numero_cotacao_bid_frete_internacional?: string; status: 'ok' | 'erro'; erro?: string }> = []

    for (let i = 0; i < parsed.data.itens.length; i++) {
      const item = parsed.data.itens[i]
      try {
        const numero_cotacao_bid_frete_internacional = gerarNumeroCotacao()
        const cotacao = await (req.prisma as any).cotacaoBidFreteInternacional.create({
          data: {
            ...item,
            id_produto_gravity: 'bid-frete-internacional',
            id_usuario: userId,
            ...(idWorkspace ? { id_workspace: idWorkspace } : {}),
            numero_cotacao_bid_frete_internacional,
            visibilidade_cotacao_bid_frete_internacional: parsed.data.visibilidade_cotacao_bid_frete_internacional,
            data_limite_resposta_cotacao_bid_frete_internacional: parsed.data.data_limite_resposta_cotacao_bid_frete_internacional ? new Date(parsed.data.data_limite_resposta_cotacao_bid_frete_internacional) : null,
          },
        })
        results.push({ linha: i + 1, id: cotacao.id_cotacao_bid_frete_internacional, numero_cotacao_bid_frete_internacional, status: 'ok' })
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        results.push({ linha: i + 1, status: 'erro', erro: errorMessage })
      }
    }

    const ok = results.filter(r => r.status === 'ok').length
    const erros = results.filter(r => r.status === 'erro').length

    // Integracoes
    const tenantId = (req as any).tenantId
    if (tenantId && ok > 0) {
      historicoIntegration.registrar(tenantId, {
        id_usuario: userId,
        acao: 'IMPORTAR_BLOCO',
        entidade: 'cotacao',
        entidade_id: 'batch',
        detalhes: `Importação em bloco: ${ok} cotações criadas, ${erros} erros`,
      })
    }

    res.status(201).json({
      total: parsed.data.itens.length,
      criadas: ok,
      erros,
      results,
    })
  } catch (err) {
    next(err)
  }
})

export { router as cotacoesRouter }
