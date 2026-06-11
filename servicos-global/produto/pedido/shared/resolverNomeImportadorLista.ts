/**
 * resolverNomeImportadorLista.ts — SSOT dos campos nome_importador e nome_exportador na Lista.
 *
 * Importador:
 * - IMPORTAÇÃO → workspace (nome legível). Nunca CUID/id_workspace.
 * - EXPORTAÇÃO → fornecedor importador (snapshot/det legível).
 *
 * Exportador (espelho invertido):
 * - EXPORTAÇÃO → workspace (nome legível). Nunca CUID/id_workspace.
 * - IMPORTAÇÃO → fornecedor exportador (snapshot/det legível).
 */

const CUID_INTERNO_RE = /^c[a-z0-9]{8,}$/i

export function pareceIdInternoGravity(valor: string | null | undefined): boolean {
  if (!valor) return false
  return CUID_INTERNO_RE.test(valor.trim())
}

function textoLegivel(
  valor: string | null | undefined,
  idWorkspace?: string | null,
): string | null {
  const s = valor?.trim()
  if (!s) return null
  const idWs = idWorkspace?.trim()
  if (idWs && s === idWs) return null
  if (pareceIdInternoGravity(s)) return null
  return s
}

export interface ResolverNomeImportadorEntrada {
  tipo_operacao_pedido?: string | null
  tipo_operacao?: string | null
  id_workspace?: string | null
  company_id?: string | null
  nomeSnapshotImportador?: string | null
  nomeDetalhes?: string | null
  nomeExtras?: string | null
  nomeItemUnico?: string | null
  /** Nome legível do workspace (quando já resolvido via Configurador). */
  nomeWorkspace?: string | null
}

function normalizarTipoOp(
  entrada: ResolverNomeImportadorEntrada,
): 'importacao' | 'exportacao' | null {
  const raw = String(entrada.tipo_operacao_pedido ?? entrada.tipo_operacao ?? '').trim().toLowerCase()
  if (raw === 'importacao' || raw === 'importação') return 'importacao'
  if (raw === 'exportacao' || raw === 'exportação') return 'exportacao'
  return null
}

function idWorkspaceDeEntrada(entrada: ResolverNomeImportadorEntrada): string {
  return String(entrada.id_workspace ?? entrada.company_id ?? '').trim()
}

/**
 * Resolve nome_importador para o contrato JSON da Lista (mapPedido / UI).
 */
export function resolverNomeImportadorLista(entrada: ResolverNomeImportadorEntrada): string | null {
  const tipo = normalizarTipoOp(entrada)
  const idWs = idWorkspaceDeEntrada(entrada)

  const snap = textoLegivel(entrada.nomeSnapshotImportador, idWs)
  const det = textoLegivel(entrada.nomeDetalhes, idWs)
  const extras = textoLegivel(entrada.nomeExtras, idWs)
  const item = textoLegivel(entrada.nomeItemUnico, idWs)
  const nomeWs = textoLegivel(entrada.nomeWorkspace, idWs)

  if (tipo === 'importacao') {
    // IMP: espelha workspace — prioriza nome já resolvido, depois snapshot legível.
    return nomeWs ?? snap ?? det ?? extras ?? item ?? null
  }

  if (tipo === 'exportacao') {
    // EXP: fornecedor importador — nunca workspace id/CUID em det/extras.
    return snap ?? det ?? extras ?? item ?? null
  }

  // Tipo ausente: só retorna texto legível (evita CUID na UI).
  return snap ?? det ?? extras ?? item ?? nomeWs ?? null
}

export type ResolverNomeExportadorEntrada = ResolverNomeImportadorEntrada

/**
 * Resolve nome_exportador para o contrato JSON da Lista (mapPedido / UI).
 */
export function resolverNomeExportadorLista(entrada: ResolverNomeExportadorEntrada): string | null {
  const tipo = normalizarTipoOp(entrada)
  const idWs = idWorkspaceDeEntrada(entrada)

  const snap = textoLegivel(entrada.nomeSnapshotImportador, idWs)
  const det = textoLegivel(entrada.nomeDetalhes, idWs)
  const extras = textoLegivel(entrada.nomeExtras, idWs)
  const item = textoLegivel(entrada.nomeItemUnico, idWs)
  const nomeWs = textoLegivel(entrada.nomeWorkspace, idWs)

  if (tipo === 'exportacao') {
    return nomeWs ?? snap ?? det ?? extras ?? item ?? null
  }

  if (tipo === 'importacao') {
    return snap ?? det ?? extras ?? item ?? null
  }

  return snap ?? det ?? extras ?? item ?? nomeWs ?? null
}
