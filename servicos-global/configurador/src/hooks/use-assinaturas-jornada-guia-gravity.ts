import { useAuth } from '@clerk/clerk-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  assinaturaAtivaParaJornada,
  montarProdutosJornadaContratados,
} from '../../shared/guia-gravity/produtos-jornada-guia-gravity.js'
import { listaAssinaturasProdutoGravitySchema } from '../schemas/assinatura-produto-gravity'

export interface EstadoAssinaturasJornadaGuiaGravity {
  carregando: boolean
  erro: string | null
  produtosContratados: string[]
  slugsAssinaturaAtiva: ReadonlySet<string>
  recarregar: () => Promise<void>
}

export function useAssinaturasJornadaGuiaGravity(): EstadoAssinaturasJornadaGuiaGravity {
  const { getToken, isSignedIn } = useAuth()
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [slugsAssinatura, setSlugsAssinatura] = useState<string[]>([])

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
      const res = await fetch('/api/v1/organizacoes/me/assinaturas-produto-gravity', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Falha ao carregar assinaturas (${res.status})`)
      const raw = await res.json()
      const parsed = listaAssinaturasProdutoGravitySchema.parse(raw)
      const ativos = parsed.assinaturas
        .filter(a => assinaturaAtivaParaJornada(a.status_assinatura_produto_gravity))
        .map(a => a.produto.slug_produto_gravity)
      setSlugsAssinatura(ativos)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar assinaturas')
      setSlugsAssinatura([])
    } finally {
      setCarregando(false)
    }
  }, [getToken, isSignedIn])

  useEffect(() => {
    void recarregar()
  }, [recarregar])

  const slugsAssinaturaAtiva = useMemo(() => new Set(slugsAssinatura), [slugsAssinatura])
  const produtosContratados = useMemo(
    () => montarProdutosJornadaContratados(slugsAssinatura),
    [slugsAssinatura],
  )

  return {
    carregando,
    erro,
    produtosContratados,
    slugsAssinaturaAtiva,
    recarregar,
  }
}
