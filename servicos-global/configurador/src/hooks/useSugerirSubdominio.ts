import { useEffect, useRef, useState } from 'react'
import { workspaceApi } from '../services/apiClient'

/**
 * Hook que pede ao backend o subdomínio que o sistema atribuiria, dado um
 * nome/base, com debounce. Usado pelos modais de criação de workspace e
 * organização para mostrar preview ao vivo (`<sub>.usegravity.com.br`).
 *
 * Política da plataforma: o sistema gera o subdomínio (cross-tabela único,
 * auto-suffix `-2`, `-3`, ...). O usuário NÃO edita o campo — só vê o que
 * será atribuído conforme digita o nome.
 */
export function useSugerirSubdominio(base: string, opts?: { debounceMs?: number; enabled?: boolean }) {
  const debounceMs = opts?.debounceMs ?? 400
  const enabled = opts?.enabled ?? true

  const [sugestao, setSugestao] = useState<string>('')
  const [solicitado, setSolicitado] = useState<string>('')
  const [ajustado, setAjustado] = useState<boolean>(false)
  const [carregando, setCarregando] = useState<boolean>(false)
  const [erro, setErro] = useState<string | null>(null)
  const ultimoBaseRef = useRef<string>('')

  useEffect(() => {
    if (!enabled) return
    const baseTrim = base.trim()
    if (!baseTrim) {
      setSugestao('')
      setSolicitado('')
      setAjustado(false)
      setErro(null)
      return
    }

    const timer = setTimeout(async () => {
      ultimoBaseRef.current = baseTrim
      setCarregando(true)
      setErro(null)
      try {
        const res = await workspaceApi.sugerirSubdominio(baseTrim)
        // Ignora respostas defasadas (usuário continuou digitando).
        if (ultimoBaseRef.current !== baseTrim) return
        setSugestao(res.subdominio_sugerido)
        setSolicitado(res.subdominio_solicitado)
        setAjustado(res.subdominio_ajustado)
      } catch (err) {
        if (ultimoBaseRef.current !== baseTrim) return
        setErro(err instanceof Error ? err.message : 'Falha ao sugerir subdomínio')
      } finally {
        if (ultimoBaseRef.current === baseTrim) setCarregando(false)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [base, enabled, debounceMs])

  return { sugestao, solicitado, ajustado, carregando, erro }
}
