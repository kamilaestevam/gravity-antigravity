import { useAuth } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import {
  guiaGravityJornadaResponseSchema,
  type GuiaGravityJornadaResponse,
} from '../../shared/guia-gravity/guia-gravity-jornada-schema.js'
import {
  certificadosApiParaMapaGuia,
  normalizarSlugsConclusaoAcademy,
} from '../pages/university/certificado-guia-gravity'
import type { MapaCertificadosGuia } from '../pages/university/certificado-guia-gravity'

export interface EstadoJornadaGuiaGravity {
  carregando: boolean
  erro: string | null
  dados: GuiaGravityJornadaResponse | null
  aulasConcluidas: Set<string>
  mapaCertificados: MapaCertificadosGuia
  dataInicioJornada: Date | null
  diasOfensiva: number
  recarregar: () => Promise<void>
  marcarAulaConcluida: (slugAula: string, slugProduto: string) => Promise<void>
  marcarManualLido: (slugManual: string) => Promise<void>
}

function aplicarRespostaJornada(data: GuiaGravityJornadaResponse): Pick<
  EstadoJornadaGuiaGravity,
  'dados' | 'aulasConcluidas' | 'mapaCertificados' | 'dataInicioJornada' | 'diasOfensiva'
> {
  const slugs = data.aulas_concluidas.map(a => a.slug_aula_guia_gravity)
  return {
    dados: data,
    aulasConcluidas: normalizarSlugsConclusaoAcademy(slugs),
    mapaCertificados: certificadosApiParaMapaGuia(data.certificados),
    dataInicioJornada: new Date(data.jornada.data_inicio_jornada_guia_gravity),
    diasOfensiva: data.jornada.dias_ofensiva_guia_gravity,
  }
}

export function useJornadaGuiaGravity(): EstadoJornadaGuiaGravity {
  const { getToken, isSignedIn } = useAuth()
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [dados, setDados] = useState<GuiaGravityJornadaResponse | null>(null)
  const [aulasConcluidas, setAulasConcluidas] = useState<Set<string>>(() => new Set())
  const [mapaCertificados, setMapaCertificados] = useState<MapaCertificadosGuia>({})
  const [dataInicioJornada, setDataInicioJornada] = useState<Date | null>(null)
  const [diasOfensiva, setDiasOfensiva] = useState(0)

  const recarregar = useCallback(async () => {
    if (!isSignedIn) {
      setCarregando(false)
      return
    }
    setCarregando(true)
    setErro(null)
    try {
      const token = await getToken()
      if (!token) throw new Error('Sessão expirada')
      const res = await fetch('/api/v1/guia-gravity/jornada', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Falha ao carregar jornada (${res.status})`)
      const raw = await res.json()
      const parsed = guiaGravityJornadaResponseSchema.parse(raw)
      const aplicado = aplicarRespostaJornada(parsed)
      setDados(aplicado.dados)
      setAulasConcluidas(aplicado.aulasConcluidas)
      setMapaCertificados(aplicado.mapaCertificados)
      setDataInicioJornada(aplicado.dataInicioJornada)
      setDiasOfensiva(aplicado.diasOfensiva)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar jornada')
    } finally {
      setCarregando(false)
    }
  }, [getToken, isSignedIn])

  useEffect(() => {
    void recarregar()
  }, [recarregar])

  const marcarAulaConcluida = useCallback(async (slugAula: string, slugProduto: string) => {
    const token = await getToken()
    if (!token) throw new Error('Sessão expirada')
    const res = await fetch(`/api/v1/guia-gravity/aulas/${encodeURIComponent(slugAula)}/concluir`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slug_produto_guia_gravity: slugProduto }),
    })
    if (!res.ok) throw new Error(`Falha ao concluir aula (${res.status})`)
    const raw = await res.json()
    const parsed = guiaGravityJornadaResponseSchema.parse(raw)
    const aplicado = aplicarRespostaJornada(parsed)
    setDados(aplicado.dados)
    setAulasConcluidas(aplicado.aulasConcluidas)
    setMapaCertificados(aplicado.mapaCertificados)
    setDataInicioJornada(aplicado.dataInicioJornada)
    setDiasOfensiva(aplicado.diasOfensiva)
  }, [getToken])

  const marcarManualLido = useCallback(async (slugManual: string) => {
    const token = await getToken()
    if (!token) throw new Error('Sessão expirada')
    const res = await fetch(
      `/api/v1/guia-gravity/manuais/${encodeURIComponent(slugManual)}/marcar-lido`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    if (!res.ok) throw new Error(`Falha ao marcar manual (${res.status})`)
    const raw = await res.json()
    const parsed = guiaGravityJornadaResponseSchema.parse(raw)
    const aplicado = aplicarRespostaJornada(parsed)
    setDados(aplicado.dados)
    setAulasConcluidas(aplicado.aulasConcluidas)
    setMapaCertificados(aplicado.mapaCertificados)
    setDataInicioJornada(aplicado.dataInicioJornada)
    setDiasOfensiva(aplicado.diasOfensiva)
  }, [getToken])

  return {
    carregando,
    erro,
    dados,
    aulasConcluidas,
    mapaCertificados,
    dataInicioJornada,
    diasOfensiva,
    recarregar,
    marcarAulaConcluida,
    marcarManualLido,
  }
}
