/**
 * Resolve nome_usuario e email_usuario via Configurador (S2S).
 */

import { z } from 'zod'

const usuarioOrganizacaoResponseSchema = z.object({
  usuario: z.object({
    nome_usuario: z.string(),
    email_usuario: z.string().email(),
  }),
})

export type UsuarioOrganizacaoBidFreteInternacional = z.infer<
  typeof usuarioOrganizacaoResponseSchema
>['usuario']

export async function resolverUsuarioOrganizacaoBidFreteInternacional(
  id_organizacao: string,
  id_usuario: string,
): Promise<UsuarioOrganizacaoBidFreteInternacional | null> {
  const baseUrl = process.env.CONFIGURATOR_URL ?? 'http://127.0.0.1:8005'
  const chave = process.env.CHAVE_INTERNA_SERVICO
  if (!chave || !id_organizacao || !id_usuario) return null

  try {
    const params = new URLSearchParams({ id_organizacao })
    const url = `${baseUrl}/api/v1/internal/gabi/usuarios/${encodeURIComponent(id_usuario)}?${params}`
    const res = await fetch(url, {
      headers: {
        'x-chave-interna-servico': chave,
        'x-id-organizacao': id_organizacao,
        'x-id-usuario': id_usuario,
      },
    })
    if (!res.ok) {
      console.warn('[bid-frete] resolverUsuarioOrganizacao falhou', {
        id_organizacao,
        id_usuario,
        status: res.status,
      })
      return null
    }
    const raw = await res.json()
    return usuarioOrganizacaoResponseSchema.parse(raw).usuario
  } catch (err: unknown) {
    console.warn('[bid-frete] resolverUsuarioOrganizacao erro', {
      id_organizacao,
      id_usuario,
      erro: err instanceof Error ? err.message : err,
    })
    return null
  }
}
