/**
 * Contatos de fornecedor no Cadastros (SSOT) — usado no preview/disparo BID.
 */

import { z } from 'zod'
import { useShellStore } from '@gravity/shell'

function headersCadastros(): Record<string, string> {
  const customHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'gravity-dev-internal-key-2026',
  }
  const state = useShellStore.getState()
  const orgId =
    state.organizacaoOverride?.idOrganizacao ??
    state.currentUser.idOrganizacao ??
    sessionStorage.getItem('gravity_tenant_id') ??
    import.meta.env.VITE_DEV_TENANT_ID ??
    'org_dev_default'
  const userId =
    state.currentUser.idUsuario ??
    sessionStorage.getItem('gravity_id_usuario') ??
    import.meta.env.VITE_USER_ID ??
    'user_dev_default'
  customHeaders['x-id-organizacao'] = orgId
  customHeaders['x-id-usuario'] = userId
  return customHeaders
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string; message?: string }
    throw new Error(typeof err.error === 'string' ? err.error : err.message ?? `Erro ${res.status}`)
  }
  return res.json() as Promise<T>
}

const contatoSchema = z.object({
  id_fornecedor_contato: z.string().optional(),
  tipo_canal_fornecedor_contato: z.enum(['EMAIL', 'WHATSAPP', 'TELEFONE']),
  valor_fornecedor_contato: z.string(),
  principal_fornecedor_contato: z.boolean().optional(),
  ordem_fornecedor_contato: z.number().optional(),
})

const fornecedorCadastrosSchema = z.object({
  id_fornecedor: z.string(),
  nome_fornecedor: z.string(),
  email_fornecedor: z.string().nullable().optional(),
  contatos_fornecedor: z.array(contatoSchema).optional(),
})

export type FornecedorContatoCadastros = z.infer<typeof contatoSchema>

export async function buscarFornecedorCadastrosContatos(id_fornecedor: string) {
  const res = await fetch(`/api/v1/fornecedores/${encodeURIComponent(id_fornecedor)}`, {
    headers: headersCadastros(),
  })
  const raw = await handleJson<unknown>(res)
  return fornecedorCadastrosSchema.parse(raw)
}

export function extrairEmailsContatoFornecedor(fornecedor: z.infer<typeof fornecedorCadastrosSchema>): string[] {
  const deContatos = (fornecedor.contatos_fornecedor ?? [])
    .filter(c => c.tipo_canal_fornecedor_contato === 'EMAIL')
    .map(c => c.valor_fornecedor_contato.trim().toLowerCase())
    .filter(e => e.length > 0 && !e.endsWith('@interno.gravity.local'))
  if (deContatos.length > 0) return [...new Set(deContatos)]
  const legado = fornecedor.email_fornecedor?.trim().toLowerCase()
  if (legado && !legado.endsWith('@interno.gravity.local')) return [legado]
  return []
}

export async function sincronizarEmailsFornecedorCadastros(
  id_fornecedor: string,
  emails_novos: string[],
): Promise<string[]> {
  const atual = await buscarFornecedorCadastrosContatos(id_fornecedor)
  const contatosAtuais = atual.contatos_fornecedor ?? []
  const outros = contatosAtuais.filter(c => c.tipo_canal_fornecedor_contato !== 'EMAIL')
  const emailsOrdenados = [...new Set(
    emails_novos.map(e => e.trim().toLowerCase()).filter(e => e.length > 0),
  )]
  const contatosEmail = emailsOrdenados.map((valor, idx) => ({
    tipo_canal_fornecedor_contato: 'EMAIL' as const,
    valor_fornecedor_contato: valor,
    principal_fornecedor_contato: idx === 0,
    ordem_fornecedor_contato: idx,
  }))
  const contatos_fornecedor = [
    ...outros.map((c, idx) => ({
      tipo_canal_fornecedor_contato: c.tipo_canal_fornecedor_contato,
      valor_fornecedor_contato: c.valor_fornecedor_contato,
      principal_fornecedor_contato: c.principal_fornecedor_contato ?? false,
      ordem_fornecedor_contato: c.ordem_fornecedor_contato ?? idx,
    })),
    ...contatosEmail,
  ]

  const res = await fetch(`/api/v1/fornecedores/${encodeURIComponent(id_fornecedor)}`, {
    method: 'PUT',
    headers: headersCadastros(),
    body: JSON.stringify({
      email_fornecedor: emailsOrdenados[0] ?? null,
      contatos_fornecedor,
    }),
  })
  const atualizado = fornecedorCadastrosSchema.parse(await handleJson<unknown>(res))
  return extrairEmailsContatoFornecedor(atualizado)
}

export async function adicionarEmailFornecedorCadastros(
  id_fornecedor: string,
  email_novo: string,
): Promise<string[]> {
  const atual = await buscarFornecedorCadastrosContatos(id_fornecedor)
  const email = email_novo.trim().toLowerCase()
  const existentes = extrairEmailsContatoFornecedor(atual)
  if (existentes.includes(email)) return existentes
  return sincronizarEmailsFornecedorCadastros(id_fornecedor, [...existentes, email])
}

export async function editarEmailFornecedorCadastros(
  id_fornecedor: string,
  email_anterior: string,
  email_novo: string,
): Promise<string[]> {
  const atual = await buscarFornecedorCadastrosContatos(id_fornecedor)
  const anterior = email_anterior.trim().toLowerCase()
  const novo = email_novo.trim().toLowerCase()
  const existentes = extrairEmailsContatoFornecedor(atual)
  if (!existentes.includes(anterior)) {
    throw new Error('E-mail não encontrado neste fornecedor')
  }
  if (novo !== anterior && existentes.includes(novo)) {
    throw new Error('Este e-mail já está cadastrado')
  }
  const atualizados = existentes.map(e => (e === anterior ? novo : e))
  return sincronizarEmailsFornecedorCadastros(id_fornecedor, atualizados)
}

export async function excluirEmailFornecedorCadastros(
  id_fornecedor: string,
  email_remover: string,
): Promise<string[]> {
  const atual = await buscarFornecedorCadastrosContatos(id_fornecedor)
  const alvo = email_remover.trim().toLowerCase()
  const existentes = extrairEmailsContatoFornecedor(atual).filter(e => e !== alvo)
  return sincronizarEmailsFornecedorCadastros(id_fornecedor, existentes)
}
