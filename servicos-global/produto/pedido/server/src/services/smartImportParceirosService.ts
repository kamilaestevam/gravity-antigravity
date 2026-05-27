/**
 * smartImportParceirosService.ts — Resolve parceiros COMEX a partir dos dados
 * da planilha (Smart Import): busca no Cadastros ou cria fornecedor, retornando
 * SUIDs + snapshots para gravar no Pedido.
 *
 * Chamado ANTES de `withOrganizacao` — I/O de rede não pode segurar transação Prisma.
 */

import type { Empresa, Fornecedor } from '../../../../cadastros/shared/schemas/index.js'
import type { CadastrosRequestContext } from '../../../../processos-core/src/services/cadastrosClient.js'
import {
  criarFornecedor,
  listarFornecedoresPorBusca,
  obterEmpresaDaOrganizacao,
} from '../../../../processos-core/src/services/cadastrosClient.js'
import {
  montarSnapshotIdentidadeComex,
  type PapelEmpresa,
  type SnapshotEmpresaData,
} from '../../../../processos-core/src/services/pedidoSnapshots.js'
import { derivarNomesEmpresaParaItem, type NomesEmpresaItem } from '../../../shared/mapaPropagacaoPedidoItem.js'
import type { SmartImportLinha } from './smartImportService.js'

export type TipoOperacaoPedido = 'importacao' | 'exportacao'

export interface ParceirosResolvidosPedido {
  tipo_operacao: TipoOperacaoPedido
  suid_importador: string | null
  suid_exportador: string | null
  suid_fabricante: string | null
  snapshots: SnapshotEmpresaData[]
  nomesItem: NomesEmpresaItem
}

const CAMPOS_EXPORTADOR = [
  'nome_exportador', 'endereco_exportador', 'pais_exportador',
  'estado_exportador', 'cidade_exportador', 'zip_code_exportador',
  'exportador_ou_fabricante', 'relacao_exportador_fabricante',
  'nome_contato_exportador', 'email_contato_exportador',
  'whatsapp_contato_exportador', 'cargo_contato_exportador',
  'departamento_contato_exportador',
] as const

const CAMPOS_IMPORTADOR = ['nome_importador'] as const

const CAMPOS_FABRICANTE = [
  'nome_fabricante', 'endereco_fabricante', 'pais_fabricante',
  'estado_fabricante', 'cidade_fabricante', 'zip_code_fabricante',
] as const

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const E164_REGEX = /^\+[1-9]\d{1,14}$/

const PAIS_NOME_PARA_ISO: Record<string, string> = {
  brasil: 'BR',
  brazil: 'BR',
  'estados unidos': 'US',
  'united states': 'US',
  usa: 'US',
  noruega: 'NO',
  norway: 'NO',
  china: 'CN',
  alemanha: 'DE',
  germany: 'DE',
  'reino unido': 'GB',
  'united kingdom': 'GB',
  uk: 'GB',
}

interface DadosParceiroPlanilha {
  nome: string
  endereco: string | null
  pais: string | null
  estado: string | null
  cidade: string | null
  zip: string | null
  email: string | null
  whatsapp: string | null
  cnpj: string | null
}

function textoCampo(dados: Record<string, unknown>, campo: string): string | null {
  const raw = dados[campo]
  if (raw === undefined || raw === null) return null
  const s = String(raw).trim()
  return s.length > 0 ? s : null
}

function normalizarNomeComparacao(nome: string): string {
  return nome.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function normalizarPaisIso2(valor: string | null | undefined, fallback = 'US'): string {
  if (!valor) return fallback
  const s = valor.trim()
  if (/^[A-Za-z]{2}$/.test(s)) return s.toUpperCase()
  const mapped = PAIS_NOME_PARA_ISO[s.toLowerCase()]
  return mapped ?? fallback
}

function mergeCamposParceiro(
  dest: Record<string, string>,
  dados: Record<string, unknown>,
  campos: readonly string[],
): void {
  for (const campo of campos) {
    const val = textoCampo(dados, campo)
    if (val && !dest[campo]) dest[campo] = val
  }
}

function extrairDadosExportador(campos: Record<string, string>): DadosParceiroPlanilha | null {
  const nome = campos.nome_exportador
  if (!nome) return null
  return {
    nome,
    endereco: campos.endereco_exportador ?? null,
    pais: campos.pais_exportador ?? null,
    estado: campos.estado_exportador ?? null,
    cidade: campos.cidade_exportador ?? null,
    zip: campos.zip_code_exportador ?? null,
    email: campos.email_contato_exportador ?? null,
    whatsapp: campos.whatsapp_contato_exportador ?? null,
    cnpj: null,
  }
}

function extrairDadosImportador(campos: Record<string, string>): DadosParceiroPlanilha | null {
  const nome = campos.nome_importador
  if (!nome) return null
  return {
    nome,
    endereco: null,
    pais: 'BR',
    estado: null,
    cidade: null,
    zip: null,
    email: null,
    whatsapp: null,
    cnpj: null,
  }
}

function extrairDadosFabricante(campos: Record<string, string>): DadosParceiroPlanilha | null {
  const nome = campos.nome_fabricante
  if (!nome) return null
  return {
    nome,
    endereco: campos.endereco_fabricante ?? null,
    pais: campos.pais_fabricante ?? null,
    estado: campos.estado_fabricante ?? null,
    cidade: campos.cidade_fabricante ?? null,
    zip: campos.zip_code_fabricante ?? null,
    email: null,
    whatsapp: null,
    cnpj: null,
  }
}

function coletarNomesFabricanteDistintosPorPedido(
  linhas: readonly SmartImportLinha[],
  numerosEditados: Record<number, string>,
  numeroPedido: string,
): string[] {
  const nomes = new Set<string>()
  for (const linha of linhas) {
    const numero =
      numerosEditados[linha.linha_arquivo]
      ?? textoCampo(linha.dados, 'numero_pedido')
      ?? linha.numero_pedido
    if (numero !== numeroPedido) continue
    const nome = textoCampo(linha.dados, 'nome_fabricante')
      ?? textoCampo(linha.dados, 'nome_fabricante_item')
    if (nome) nomes.add(normalizarNomeComparacao(nome))
  }
  return [...nomes]
}

function inferirTipoOperacao(_campos: Record<string, string>, dadosLinha: Record<string, unknown>): TipoOperacaoPedido {
  const raw = textoCampo(dadosLinha, 'tipo_operacao_pedido') ?? textoCampo(dadosLinha, 'tipo_operacao')
  if (raw === 'exportacao' || raw === 'importacao') return raw
  return 'importacao'
}

/** Agrega campos de parceiro por numero_pedido (ordem do arquivo). */
export function extrairCamposParceirosPorNumeroPedido(
  linhas: readonly SmartImportLinha[],
  numerosEditados: Record<number, string> = {},
): Map<string, { campos: Record<string, string>; tipo_operacao: TipoOperacaoPedido }> {
  const map = new Map<string, { campos: Record<string, string>; tipo_operacao: TipoOperacaoPedido }>()

  for (const linha of linhas) {
    const numero =
      numerosEditados[linha.linha_arquivo]
      ?? textoCampo(linha.dados, 'numero_pedido')
      ?? linha.numero_pedido
    if (!numero) continue

    const dados = { ...linha.dados }
    const tipoLinha = String(dados['tipo_linha'] ?? '').trim().toUpperCase()
    if (tipoLinha === 'ITEM') {
      for (const campo of ['valor_total_pedido', 'quantidade_total_pedido'] as const) {
        delete dados[campo]
      }
    }

    let entry = map.get(numero)
    if (!entry) {
      entry = { campos: {}, tipo_operacao: inferirTipoOperacao({}, dados) }
      map.set(numero, entry)
    }

    mergeCamposParceiro(entry.campos, dados, CAMPOS_EXPORTADOR)
    mergeCamposParceiro(entry.campos, dados, CAMPOS_IMPORTADOR)
    mergeCamposParceiro(entry.campos, dados, CAMPOS_FABRICANTE)

    const tipoLinhaOp = inferirTipoOperacao(entry.campos, dados)
    if (textoCampo(dados, 'tipo_operacao_pedido') || textoCampo(dados, 'tipo_operacao')) {
      entry.tipo_operacao = tipoLinhaOp
    }
  }

  return map
}

function sanitizarEmail(email: string | null): string | null {
  if (!email) return null
  const val = email.trim()
  return EMAIL_REGEX.test(val) ? val : null
}

function sanitizarWhatsapp(whatsapp: string | null): string | null {
  if (!whatsapp) return null
  const val = whatsapp.trim()
  return E164_REGEX.test(val) ? val : null
}

function montarPayloadCriarFornecedor(
  idOrganizacao: string,
  dados: DadosParceiroPlanilha,
  papel: PapelEmpresa,
): Parameters<typeof criarFornecedor>[0] {
  const pais = normalizarPaisIso2(dados.pais, papel === 'importador' ? 'BR' : 'US')
  const ehBr = pais === 'BR'

  const flags = {
    pode_ser_importador_fornecedor: papel === 'importador',
    pode_ser_exportador_fornecedor: papel === 'exportador',
    pode_ser_fabricante_fornecedor: papel === 'fabricante',
  }

  return {
    id_organizacao: idOrganizacao,
    nome_fornecedor: dados.nome.trim(),
    pais_fornecedor: pais,
    cnpj_fornecedor: ehBr && dados.cnpj ? dados.cnpj : null,
    tin_fornecedor: !ehBr ? null : null,
    estado_provincia_fornecedor: dados.estado,
    cidade_fornecedor: dados.cidade,
    endereco_fornecedor: dados.endereco,
    cep_zipcode_fornecedor: dados.zip,
    email_principal_fornecedor: sanitizarEmail(dados.email),
    whatsapp_principal_fornecedor: sanitizarWhatsapp(dados.whatsapp),
    ...flags,
    ativo_fornecedor: true,
  }
}

function identidadeParaSnapshot(
  identidade: Empresa | Fornecedor,
  papel: PapelEmpresa,
  idOrganizacao: string,
  idWorkspace: string,
): SnapshotEmpresaData {
  return montarSnapshotIdentidadeComex(identidade, papel, idOrganizacao, idWorkspace, 'emissao')
}

async function resolverFornecedorPlanilha(
  dados: DadosParceiroPlanilha,
  papel: PapelEmpresa,
  ctx: CadastrosRequestContext,
  cache: Map<string, Fornecedor>,
): Promise<Fornecedor> {
  const cacheKey = `${papel}:${normalizarNomeComparacao(dados.nome)}:${normalizarPaisIso2(dados.pais, 'US')}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const alvo = normalizarNomeComparacao(dados.nome)
  const candidatos = await listarFornecedoresPorBusca(dados.nome, ctx)
  const existente = candidatos.find(
    (f) => normalizarNomeComparacao(f.nome_fornecedor) === alvo,
  )
  if (existente) {
    cache.set(cacheKey, existente)
    return existente
  }

  const criado = await criarFornecedor(montarPayloadCriarFornecedor(ctx.id_organizacao, dados, papel), ctx)
  cache.set(cacheKey, criado)
  return criado
}

/** Resolve parceiros no Cadastros para cada numero_pedido da importação. */
export async function resolverParceirosSmartImport(
  linhasFiltradas: readonly SmartImportLinha[],
  numerosEditados: Record<number, string>,
  ctx: CadastrosRequestContext,
  idWorkspace: string,
): Promise<Map<string, ParceirosResolvidosPedido>> {
  const agregados = extrairCamposParceirosPorNumeroPedido(linhasFiltradas, numerosEditados)
  const resultado = new Map<string, ParceirosResolvidosPedido>()
  if (agregados.size === 0) return resultado

  const cacheFornecedores = new Map<string, Fornecedor>()
  let empresaOrg: Empresa | null = null

  for (const [numero, { campos, tipo_operacao }] of agregados) {
    const dadosExportador = extrairDadosExportador(campos)
    const dadosImportador = extrairDadosImportador(campos)
    const dadosFabricante = extrairDadosFabricante(campos)

    if (!dadosExportador && !dadosImportador && !dadosFabricante) continue

    const snapshots: SnapshotEmpresaData[] = []
    let suidImportador: string | null = null
    let suidExportador: string | null = null
    let suidFabricante: string | null = null

    if (tipo_operacao === 'importacao') {
      if (!empresaOrg) {
        empresaOrg = await obterEmpresaDaOrganizacao(ctx)
      }
      if (empresaOrg) {
        suidImportador = empresaOrg.id_empresa
        snapshots.push(identidadeParaSnapshot(empresaOrg, 'importador', ctx.id_organizacao, idWorkspace))
      }

      if (dadosExportador) {
        const exportador = await resolverFornecedorPlanilha(dadosExportador, 'exportador', ctx, cacheFornecedores)
        suidExportador = exportador.id_fornecedor
        snapshots.push(identidadeParaSnapshot(exportador, 'exportador', ctx.id_organizacao, idWorkspace))
      }
    } else {
      if (!empresaOrg) {
        empresaOrg = await obterEmpresaDaOrganizacao(ctx)
      }
      if (empresaOrg) {
        suidExportador = empresaOrg.id_empresa
        snapshots.push(identidadeParaSnapshot(empresaOrg, 'exportador', ctx.id_organizacao, idWorkspace))
      }

      if (dadosImportador) {
        const importador = await resolverFornecedorPlanilha(dadosImportador, 'importador', ctx, cacheFornecedores)
        suidImportador = importador.id_fornecedor
        snapshots.push(identidadeParaSnapshot(importador, 'importador', ctx.id_organizacao, idWorkspace))
      }
    }

    if (dadosFabricante) {
      const nomesDistintos = coletarNomesFabricanteDistintosPorPedido(
        linhasFiltradas,
        numerosEditados,
        numero,
      )

      if (nomesDistintos.length === 1) {
        const mesmoNomeExportador =
          dadosExportador
          && nomesDistintos[0] === normalizarNomeComparacao(dadosExportador.nome)

        if (mesmoNomeExportador && suidExportador) {
          suidFabricante = suidExportador
          if (!snapshots.some((s) => s.papel === 'fabricante')) {
            const exportadorSnap = snapshots.find((s) => s.papel === 'exportador')
            if (exportadorSnap) {
              snapshots.push({ ...exportadorSnap, papel: 'fabricante' })
            }
          }
        } else {
          const fabricante = await resolverFornecedorPlanilha(dadosFabricante, 'fabricante', ctx, cacheFornecedores)
          suidFabricante = fabricante.id_fornecedor
          snapshots.push(identidadeParaSnapshot(fabricante, 'fabricante', ctx.id_organizacao, idWorkspace))
        }
      } else if (nomesDistintos.length > 1) {
        for (const nomeNorm of nomesDistintos) {
          const linhaComNome = linhasFiltradas.find((l) => {
            const num =
              numerosEditados[l.linha_arquivo]
              ?? textoCampo(l.dados, 'numero_pedido')
              ?? l.numero_pedido
            if (num !== numero) return false
            const n = textoCampo(l.dados, 'nome_fabricante') ?? textoCampo(l.dados, 'nome_fabricante_item')
            return n && normalizarNomeComparacao(n) === nomeNorm
          })
          if (!linhaComNome) continue
          const dadosFabLinha = extrairDadosFabricante({
            nome_fabricante: textoCampo(linhaComNome.dados, 'nome_fabricante')
              ?? textoCampo(linhaComNome.dados, 'nome_fabricante_item')
              ?? '',
            endereco_fabricante: textoCampo(linhaComNome.dados, 'endereco_fabricante') ?? undefined,
            pais_fabricante: textoCampo(linhaComNome.dados, 'pais_fabricante') ?? undefined,
            estado_fabricante: textoCampo(linhaComNome.dados, 'estado_fabricante') ?? undefined,
            cidade_fabricante: textoCampo(linhaComNome.dados, 'cidade_fabricante') ?? undefined,
            zip_code_fabricante: textoCampo(linhaComNome.dados, 'zip_code_fabricante') ?? undefined,
          } as Record<string, string>)
          if (dadosFabLinha) {
            await resolverFornecedorPlanilha(dadosFabLinha, 'fabricante', ctx, cacheFornecedores)
          }
        }
      }
    }

    resultado.set(numero, {
      tipo_operacao,
      suid_importador: suidImportador,
      suid_exportador: suidExportador,
      suid_fabricante: suidFabricante,
      snapshots,
      nomesItem: derivarNomesEmpresaParaItem(snapshots),
    })
  }

  return resultado
}

interface DbParceirosPedido {
  pedido: {
    update: (args: {
      where: { id_pedido: string }
      data: Record<string, unknown>
    }) => Promise<unknown>
  }
  pedidoSnapshotEmpresa: {
    findMany: (args: {
      where: { id_pedido: string; id_organizacao: string }
      select: { papel: true }
    }) => Promise<Array<{ papel: string }>>
    createMany: (args: { data: Array<SnapshotEmpresaData & { id_pedido: string }> }) => Promise<unknown>
  }
  pedidoItem: {
    updateMany: (args: {
      where: { id_pedido: string; id_organizacao: string }
      data: Record<string, string | null | undefined>
    }) => Promise<unknown>
  }
}

/** Garante FKs + snapshots + nomes nos itens para pedidos já existentes. */
export async function aplicarParceirosResolvidosNoPedido(
  db: DbParceirosPedido,
  idPedido: string,
  tenantId: string,
  parceiros: ParceirosResolvidosPedido,
): Promise<void> {
  const updateData: Record<string, unknown> = {}

  if (parceiros.tipo_operacao === 'importacao' && parceiros.suid_exportador) {
    updateData.id_importacao_exportador_pedido = parceiros.suid_exportador
  }
  if (parceiros.tipo_operacao === 'exportacao' && parceiros.suid_importador) {
    updateData.id_exportacao_importador_pedido = parceiros.suid_importador
  }
  if (parceiros.suid_fabricante) {
    updateData.id_fabricante_pedido = parceiros.suid_fabricante
  }

  if (Object.keys(updateData).length > 0) {
    await db.pedido.update({
      where: { id_pedido: idPedido },
      data: updateData,
    })
  }

  if (parceiros.snapshots.length > 0) {
    const existentes = await db.pedidoSnapshotEmpresa.findMany({
      where: { id_pedido: idPedido, id_organizacao: tenantId },
      select: { papel: true },
    })
    const papeisExistentes = new Set(existentes.map((s) => s.papel))
    const novos = parceiros.snapshots.filter((s) => !papeisExistentes.has(s.papel))
    if (novos.length > 0) {
      await db.pedidoSnapshotEmpresa.createMany({
        data: novos.map((s) => ({ ...s, id_pedido: idPedido })),
      })
    }
  }

  const nomes = parceiros.nomesItem
  const temNomeExportador = nomes.nome_exportador_item
  const temNomeImportador = nomes.nome_importador_item
  if (temNomeExportador || temNomeImportador) {
    await db.pedidoItem.updateMany({
      where: { id_pedido: idPedido, id_organizacao: tenantId },
      data: {
        ...(temNomeExportador ? { nome_exportador_item: nomes.nome_exportador_item } : {}),
        ...(temNomeImportador ? { nome_importador_item: nomes.nome_importador_item } : {}),
      },
    })
  }
}
