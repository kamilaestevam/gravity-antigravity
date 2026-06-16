/**
 * Resolve nome_usuario via Configurador (S2S) — somente leitura.
 */

export async function resolverNomeUsuarioOrganizacaoBidFreteInternacional(
  id_organizacao: string,
  id_usuario: string,
): Promise<string | null> {
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
    if (!res.ok) return null
    const raw = (await res.json()) as { usuario?: { nome_usuario?: string } }
    return raw.usuario?.nome_usuario ?? null
  } catch {
    return null
  }
}
