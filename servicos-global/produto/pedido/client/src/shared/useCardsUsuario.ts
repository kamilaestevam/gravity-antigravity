/**
 * useCardsUsuario — CRUD de cards customizados do usuário (backend)
 *
 * Padrão idêntico a useCardPreferences mas persistido no servidor.
 * Sincronização via custom event para múltiplas instâncias do hook.
 */

import { useState, useCallback, useEffect } from 'react'
import type { CardUsuario } from './types'
import { cardsUsuarioApi } from './api'

const SYNC_EVENT = 'pedido:cards-usuario-updated'

export function useCardsUsuario() {
  const [cards, setCards] = useState<CardUsuario[]>([])
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    try {
      const lista = await cardsUsuarioApi.listar()
      setCards(lista)
    } catch {
      setCards([])
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    function onSync() { carregar() }
    window.addEventListener(SYNC_EVENT, onSync)
    return () => { window.removeEventListener(SYNC_EVENT, onSync) }
  }, [carregar])

  function notificar() {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT))
  }

  const criar = useCallback(async (data: Omit<CardUsuario, 'id' | 'tenant_id' | 'created_by' | 'created_at'>) => {
    const novo = await cardsUsuarioApi.criar(data)
    setCards(prev => [...prev, novo])
    notificar()
    return novo
  }, [])

  const atualizar = useCallback(async (id: string, data: Partial<CardUsuario>) => {
    const atualizado = await cardsUsuarioApi.atualizar(id, data)
    setCards(prev => prev.map(c => c.id === id ? atualizado : c))
    notificar()
    return atualizado
  }, [])

  const excluir = useCallback(async (id: string) => {
    await cardsUsuarioApi.excluir(id)
    setCards(prev => prev.filter(c => c.id !== id))
    notificar()
  }, [])

  const reordenar = useCallback(async (ids: string[]) => {
    await cardsUsuarioApi.reordenar(ids)
    setCards(prev => {
      const mapa = new Map(prev.map(c => [c.id, c]))
      return ids.map(id => mapa.get(id)!).filter(Boolean)
    })
    notificar()
  }, [])

  const toggleAtivo = useCallback(async (id: string) => {
    const card = cards.find(c => c.id === id)
    if (!card) return
    await atualizar(id, { ativo: !card.ativo })
  }, [cards, atualizar])

  return { cards, carregando, criar, atualizar, excluir, reordenar, toggleAtivo, recarregar: carregar }
}
