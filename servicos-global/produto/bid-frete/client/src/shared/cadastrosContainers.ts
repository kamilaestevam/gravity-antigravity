/**
 * cadastrosContainers.ts — SSOT containers via Cadastros (ISO 6346).
 */

const API_BASE = '/api/v1'

function headers(): Record<string, string> {
  const customHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'dev-key',
  }

  const orgId =
    sessionStorage.getItem('gravity_tenant_id') ||
    sessionStorage.getItem('gravity_company_id') ||
    sessionStorage.getItem('gravity_id_organizacao') ||
    import.meta.env.VITE_TENANT_ID ||
    import.meta.env.VITE_DEV_TENANT_ID ||
    'org_dev_default'

  const userId =
    sessionStorage.getItem('gravity_id_usuario') ||
    import.meta.env.VITE_USER_ID ||
    'user_dev_default'

  customHeaders['x-id-organizacao'] = orgId
  customHeaders['x-id-usuario'] = userId

  return customHeaders
}

export interface ContainerCadastro {
  id_container: string
  tipo_container: string
  tamanho_container: string
  codigo_iso_container: string | null
  armador_dono_container: string | null
  ativo_container: boolean
}

const ROTULOS_TIPO_CONTAINER: Record<string, string> = {
  DRY: 'Dry',
  REEFER: 'Reefer',
  OPEN_TOP: 'Open Top',
  FLAT_RACK: 'Flat Rack',
  TANK: 'Tank',
  BULK: 'Bulk',
  PLATAFORMA: 'Plataforma',
}

export function rotuloContainerCadastro(container: ContainerCadastro): string {
  const tipo = ROTULOS_TIPO_CONTAINER[container.tipo_container] ?? container.tipo_container
  const partes = [tipo, container.tamanho_container].filter(Boolean)
  if (container.armador_dono_container) {
    partes.push(container.armador_dono_container)
  }
  return partes.join(' · ')
}

export async function listarContainersCadastros(): Promise<ContainerCadastro[]> {
  const res = await fetch(`${API_BASE}/cadastros/containers?apenas_ativos=true&limit=500`, {
    headers: headers(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Erro ${res.status}`)
  }
  const data = (await res.json()) as { itens: ContainerCadastro[] }
  return data.itens
}
