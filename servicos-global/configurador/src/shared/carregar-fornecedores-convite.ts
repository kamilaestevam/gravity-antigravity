/**
 * Lista fornecedores do cartório para o modal de convite FORNECEDOR.
 */
import {
  listaFornecedoresAdminSchema,
  listaFornecedoresSchema,
  type Fornecedor,
  type FornecedorAdmin,
} from '@cadastros/shared/schemas'

export type FornecedorConvite = Pick<
  Fornecedor,
  'id_fornecedor' | 'nome_fornecedor' | 'ativo_fornecedor'
> & FornecedorFlagsConvite

type FornecedorFlagsConvite = Pick<
  Fornecedor,
  | 'pode_ser_agente_fornecedor'
  | 'pode_ser_despachante_fornecedor'
  | 'pode_ser_armador_fornecedor'
  | 'pode_ser_cia_aerea_fornecedor'
  | 'pode_ser_transportadora_rodoviaria_nacional_fornecedor'
  | 'pode_ser_transportadora_rodoviaria_internacional_fornecedor'
  | 'pode_ser_armazem_alfandegado_fornecedor'
  | 'pode_ser_armazem_nacional_fornecedor'
  | 'pode_ser_banco_fornecedor'
  | 'pode_ser_seguradora_internacional_fornecedor'
  | 'pode_ser_seguradora_corretora_cambio_fornecedor'
  | 'pode_ser_fabricante_fornecedor'
>

async function montarHeadersAuth(idOrganizacao?: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    const session = await (window as unknown as { Clerk?: { session?: { getToken(): Promise<string | null> } } }).Clerk?.session
    const token = session ? await session.getToken() : null
    if (token) headers['Authorization'] = `Bearer ${token}`
  } catch {
    /* sem token */
  }
  if (idOrganizacao) headers['x-organizacao-id'] = idOrganizacao
  return headers
}

export function mapFornecedorConvite(f: Fornecedor | FornecedorAdmin): FornecedorConvite {
  return {
    id_fornecedor: f.id_fornecedor,
    nome_fornecedor: f.nome_fornecedor,
    ativo_fornecedor: f.ativo_fornecedor,
    pode_ser_agente_fornecedor: f.pode_ser_agente_fornecedor,
    pode_ser_despachante_fornecedor: f.pode_ser_despachante_fornecedor,
    pode_ser_armador_fornecedor: f.pode_ser_armador_fornecedor,
    pode_ser_cia_aerea_fornecedor: f.pode_ser_cia_aerea_fornecedor,
    pode_ser_transportadora_rodoviaria_nacional_fornecedor:
      f.pode_ser_transportadora_rodoviaria_nacional_fornecedor,
    pode_ser_transportadora_rodoviaria_internacional_fornecedor:
      f.pode_ser_transportadora_rodoviaria_internacional_fornecedor,
    pode_ser_armazem_alfandegado_fornecedor: f.pode_ser_armazem_alfandegado_fornecedor,
    pode_ser_armazem_nacional_fornecedor: f.pode_ser_armazem_nacional_fornecedor,
    pode_ser_banco_fornecedor: f.pode_ser_banco_fornecedor,
    pode_ser_seguradora_internacional_fornecedor: f.pode_ser_seguradora_internacional_fornecedor,
    pode_ser_seguradora_corretora_cambio_fornecedor:
      f.pode_ser_seguradora_corretora_cambio_fornecedor,
    pode_ser_fabricante_fornecedor: f.pode_ser_fabricante_fornecedor,
  }
}

/** Cartório da org logada (Master convidando na própria org). */
export async function carregarFornecedoresConviteTenant(
  idOrganizacao: string,
): Promise<FornecedorConvite[]> {
  const headers = await montarHeadersAuth(idOrganizacao)
  const res = await fetch('/api/v1/fornecedores?pagina=1&por_pagina=200', { headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      (body as { error?: { message?: string } })?.error?.message
        ?? 'Falha ao carregar fornecedores do cartório.',
    )
  }
  const raw = await res.json()
  const parsed = listaFornecedoresSchema.parse(raw)
  return parsed.itens.map(mapFornecedorConvite)
}

/** Cartório de org alvo (Super Admin convidando cross-org). */
export async function carregarFornecedoresConviteAdmin(
  idOrganizacaoAlvo: string,
): Promise<FornecedorConvite[]> {
  const headers = await montarHeadersAuth()
  const qs = new URLSearchParams({
    id_organizacao: idOrganizacaoAlvo,
    pagina: '1',
    por_pagina: '200',
  })
  const res = await fetch(`/api/v1/admin/fornecedores?${qs.toString()}`, { headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      (body as { error?: { message?: string } })?.error?.message
        ?? 'Falha ao carregar fornecedores da organização alvo.',
    )
  }
  const raw = await res.json()
  const parsed = listaFornecedoresAdminSchema.parse(raw)
  return parsed.itens.map(mapFornecedorConvite)
}
