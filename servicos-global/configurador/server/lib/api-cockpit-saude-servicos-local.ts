/**
 * Health-check do inventário de serviços direto no BFF do Configurador.
 * Usado quando o sidecar api-cockpit (:8016) está indisponível — mesma lógica de
 * monitoramento-api.ts, sem depender do proxy S2S.
 */
import {
  descobrirServicosInventario,
  dominioCanonico,
  ehAmbienteProducao,
} from '../../../servicos-plataforma/api-cockpit/server/src/lib/inventario-servicos-runtime.js'

type StatusServicoPlataforma = 'ONLINE' | 'DEGRADADO' | 'OFFLINE'

interface HealthCheckResult {
  ok: boolean
  latencia: number
  versao: string
}

export async function executarSaudeServicosInventario(): Promise<{
  servicos: Array<{
    nome_servico_plataforma: string
    status_servico_plataforma: StatusServicoPlataforma
    latencia_ms_servico_plataforma: number
    versao_servico_plataforma: string
    data_ultimo_check_servico_plataforma: string
    tipo_servico_plataforma: string
    endpoint_publico_servico_plataforma: string | null
  }>
  meta_inventario_servicos: {
    ambiente_producao: boolean
    dominio_canonico: string
    modo: string
  }
}> {
  const servicosDescobertos = descobrirServicosInventario()
  const baseUrlsUnicas = [...new Set(servicosDescobertos.map((s) => s.base_url_health_servico_plataforma))]
  const healthPorBaseUrl = new Map<string, HealthCheckResult>()

  await Promise.allSettled(
    baseUrlsUnicas.map(async (baseUrl) => {
      const inicio = Date.now()
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3_000)
        const resp = await fetch(`${baseUrl}/health`, { signal: controller.signal })
        clearTimeout(timeout)
        const latencia = Date.now() - inicio
        const data = (await resp.json().catch(() => ({}))) as { version?: string; service?: string }
        const versao =
          data.version ??
          (typeof data.service === 'string' ? data.service : undefined) ??
          (resp.ok ? '1.0.0' : '-')
        healthPorBaseUrl.set(baseUrl, { ok: resp.ok, latencia, versao })
      } catch {
        healthPorBaseUrl.set(baseUrl, {
          ok: false,
          latencia: Date.now() - inicio,
          versao: '-',
        })
      }
    }),
  )

  const agora = new Date().toISOString()
  const servicos = servicosDescobertos.map((svc) => {
    const health = healthPorBaseUrl.get(svc.base_url_health_servico_plataforma) ?? {
      ok: false,
      latencia: 0,
      versao: '-',
    }
    const status: StatusServicoPlataforma = health.ok
      ? health.latencia > 1000
        ? 'DEGRADADO'
        : 'ONLINE'
      : 'OFFLINE'
    return {
      nome_servico_plataforma: svc.nome_servico_plataforma,
      status_servico_plataforma: status,
      latencia_ms_servico_plataforma: health.latencia,
      versao_servico_plataforma: health.versao,
      data_ultimo_check_servico_plataforma: agora,
      tipo_servico_plataforma: svc.tipo_servico_plataforma,
      endpoint_publico_servico_plataforma: svc.endpoint_publico_servico_plataforma,
    }
  })

  const ordem: Record<StatusServicoPlataforma, number> = { ONLINE: 0, DEGRADADO: 1, OFFLINE: 2 }
  servicos.sort((a, b) => ordem[a.status_servico_plataforma] - ordem[b.status_servico_plataforma])

  return {
    servicos,
    meta_inventario_servicos: {
      ambiente_producao: ehAmbienteProducao(),
      dominio_canonico: dominioCanonico(),
      modo: 'bff-fallback',
    },
  }
}
