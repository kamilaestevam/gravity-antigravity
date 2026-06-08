/**
 * useVolumesPedido.ts — Lista canônica de tipos de volume/embalagem do Cadastros.
 *
 * SSOT: `cadastros.volume` via `/api/v1/cadastros/volumes`.
 * Formato de opção espelha `useUnidadesPedido` (`GTUnidadeOpcao`) para reutilizar
 * o editor `tipo: 'unidade'` do TabelaVirtualGlobal.
 *
 * Mandamento 06+09: resposta validada com Zod antes de virar estado React.
 */
import { useEffect, useState, useMemo } from 'react'
import { z } from 'zod'
import type { GTUnidadeOpcao } from './useUnidadesPedido'

const volumeSchema = z.object({
  codigo_volume: z.string().min(1),
  nome_volume: z.string().min(1),
  ativo_volume: z.boolean(),
})

const listaVolumesSchema = z.object({
  itens: z.array(volumeSchema),
  total: z.number(),
})

type Volume = z.infer<typeof volumeSchema>

let cacheVolumes: Volume[] | null = null
let cacheErro: string | null = null
let inflight: Promise<Volume[]> | null = null

function formatarRotuloVolume(v: Volume): string {
  return `${v.codigo_volume} — ${v.nome_volume}`
}

async function carregarVolumes(): Promise<Volume[]> {
  if (cacheVolumes) return cacheVolumes
  if (inflight) return inflight
  inflight = fetch('/api/v1/cadastros/volumes?apenas_ativas=true')
    .then(async (res) => {
      if (!res.ok) throw new Error(`Cadastros volumes HTTP ${res.status}`)
      const raw: unknown = await res.json()
      const parsed = listaVolumesSchema.parse(raw)
      cacheVolumes = parsed.itens
      cacheErro = null
      return parsed.itens
    })
    .catch((err: unknown) => {
      cacheErro = err instanceof Error ? err.message : 'Erro ao carregar volumes'
      inflight = null
      throw err
    })
  return inflight
}

export interface UseVolumesPedidoResult {
  volumesOpcoes: GTUnidadeOpcao[]
  loading: boolean
  erro: string | null
}

export function useVolumesPedido(): UseVolumesPedidoResult {
  const [volumes, setVolumes] = useState<Volume[]>(cacheVolumes ?? [])
  const [loading, setLoading] = useState(cacheVolumes == null)
  const [erro, setErro] = useState<string | null>(cacheErro)

  useEffect(() => {
    if (cacheVolumes) {
      setVolumes(cacheVolumes)
      setLoading(false)
      setErro(cacheErro)
      return
    }
    let ativo = true
    setLoading(true)
    carregarVolumes()
      .then((itens) => {
        if (!ativo) return
        setVolumes(itens)
        setErro(null)
      })
      .catch((err: unknown) => {
        if (!ativo) return
        setErro(err instanceof Error ? err.message : 'Erro ao carregar volumes')
      })
      .finally(() => {
        if (ativo) setLoading(false)
      })
    return () => { ativo = false }
  }, [])

  return useMemo(
    () => ({
      volumesOpcoes: volumes.map((v) => ({
        sigla: v.codigo_volume,
        rotulo: formatarRotuloVolume(v),
      })),
      loading,
      erro,
    }),
    [volumes, loading, erro],
  )
}
