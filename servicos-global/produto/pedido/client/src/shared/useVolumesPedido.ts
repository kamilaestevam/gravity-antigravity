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
import { rotuloExibicaoUnidadeOpcao, type GTUnidadeOpcao } from './useUnidadesPedido'

const PLURAL_PRIMEIRA_PALAVRA_VOLUME: Record<string, string> = {
  caixa: 'caixas',
  tambor: 'tambores',
  saco: 'sacos',
  pacote: 'pacotes',
  peça: 'peças',
  amarrado: 'amarrados',
  envelope: 'envelopes',
  canudo: 'canudos',
  engradado: 'engradados',
  mala: 'malas',
  urna: 'urnas',
  baú: 'baús',
  palete: 'paletes',
  granel: 'granel',
  diversos: 'diversos',
  'light-van': 'light-vans',
}

function pluralizarPrimeiraPalavraVolume(palavra: string, plural: boolean): string {
  if (!plural) return palavra
  const lower = palavra.toLowerCase()
  if (PLURAL_PRIMEIRA_PALAVRA_VOLUME[lower]) return PLURAL_PRIMEIRA_PALAVRA_VOLUME[lower]
  if (lower.endsWith('ão')) return `${palavra.slice(0, -2)}ões`
  if (lower.endsWith('a')) return `${palavra}s`
  if (lower.endsWith('r')) return `${palavra}es`
  if (lower.endsWith('e')) return `${palavra}s`
  if (lower.endsWith('o')) return `${palavra}es`
  return `${palavra}s`
}

/** Nome do tipo em minúsculas; pluraliza só a primeira palavra (ex.: 10 → "caixas de papelão"). */
export function formatarNomeVolumeExibicao(nomeVolume: string, qtd: number): string {
  const nome = nomeVolume.trim()
  if (!nome) return '—'
  const partes = nome.split(/\s+/)
  const primeira = partes[0] ?? nome
  const resto = partes.slice(1).join(' ')
  const primeiraFmt = pluralizarPrimeiraPalavraVolume(primeira, qtd !== 1)
  const texto = resto ? `${primeiraFmt} ${resto}` : primeiraFmt
  return texto.charAt(0).toLowerCase() + texto.slice(1)
}

/** Ex.: `10 caixas de papelão` — quantidade + tipo (sem código Siscomex). */
export function formatarExibicaoQuantidadeVolume(
  qtd: number | null | undefined,
  codigoTipo: string | null | undefined,
  opcoes: readonly GTUnidadeOpcao[],
): string {
  const nomeTipo = rotuloExibicaoUnidadeOpcao(codigoTipo, opcoes)
  if (!codigoTipo || nomeTipo === '—') {
    return qtd != null && Number(qtd) > 0 ? String(Math.round(Number(qtd))) : '—'
  }
  const n = qtd != null ? Math.max(0, Math.round(Number(qtd))) : null
  if (n == null || n === 0) return formatarNomeVolumeExibicao(nomeTipo, 1)
  return `${n} ${formatarNomeVolumeExibicao(nomeTipo, n)}`
}

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
