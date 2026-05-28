/**
 * useProdutosSwitcher — produtos que o usuário pode abrir no workspace ativo.
 *
 * Fonte: GET /api/v1/workspaces/:id_workspace/produtos-gravity (Configurador).
 * A rota aplica os 3 portões (org contratou, workspace habilitou, usuário permitido)
 * via produtos-acessiveis-service (SSOT).
 *
 * REGRA 06 — resposta validada com Zod antes de uso.
 */
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { z } from 'zod'
import { cloneElement } from 'react'
import { getProdutoMeta } from '@nucleo/logo-produtos'
import { useShellStore } from '../store'
import {
  resolverRotaProdutoGravity,
  resolverSlugMetaProduto,
  slugsProdutoEquivalentes,
} from '../utils/resolver-rota-produto'
import type { ProductSwitcherItem } from '@nucleo/menu-lateral-global'

const CONFIGURADOR_URL = import.meta.env.VITE_CONFIGURADOR_URL ?? ''

/** Dispare após alterar assinatura/habilitação de produto no Configurador. */
export const EVENTO_PRODUTOS_WORKSPACE_ATUALIZADOS = 'gravity:produtos-workspace-atualizados'

const produtoWorkspaceCatalogoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  status: z.string(),
}).nullable()

const produtoWorkspaceItemSchema = z.object({
  id: z.string(),
  product_key: z.string(),
  is_active: z.boolean(),
  activated_at: z.union([z.string(), z.date()]),
  catalog: produtoWorkspaceCatalogoSchema,
})

const produtosWorkspaceResponseSchema = z.object({
  products: z.array(produtoWorkspaceItemSchema),
})

function montarItemProduto(slug: string, nome?: string): ProductSwitcherItem {
  const meta = getProdutoMeta(resolverSlugMetaProduto(slug))
  return {
    slug,
    name: nome ?? slug,
    color: meta.color,
    icon: cloneElement(meta.icon, { size: 22 }),
  }
}

/** Garante o produto aberto na lista (ex.: API já removeu após suspensão). */
function garantirProdutoAtualNaLista(
  itens: ProductSwitcherItem[],
  produtoAtualSlug: string,
  nomeProdutoAtual?: string,
): ProductSwitcherItem[] {
  if (itens.some(p => slugsProdutoEquivalentes(p.slug, produtoAtualSlug))) {
    return itens
  }
  return [montarItemProduto(produtoAtualSlug, nomeProdutoAtual), ...itens]
}

export function useProdutosSwitcher(produtoAtualSlug: string, nomeProdutoAtual?: string) {
  const { getToken } = useAuth()
  const idWorkspaceAtivo = useShellStore(s => s.idWorkspaceAtivo)
  const meStatus = useShellStore(s => s.meStatus)

  const [produtos, setProdutos] = useState<ProductSwitcherItem[]>([])
  const [carregando, setCarregando] = useState(true)

  const idWorkspace =
    idWorkspaceAtivo ??
    (typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('gravity_company_id')
      : null)

  const carregar = useCallback(async () => {
    if (meStatus !== 'success' || !idWorkspace) {
      setCarregando(false)
      setProdutos([])
      return
    }

    setCarregando(true)
    try {
      const token = await getToken()
      if (!token) {
        console.warn('[useProdutosSwitcher] JWT ausente — não foi possível listar produtos')
        setProdutos(garantirProdutoAtualNaLista([], produtoAtualSlug, nomeProdutoAtual))
        return
      }

      const base = CONFIGURADOR_URL || ''
      const res = await fetch(
        `${base}/api/v1/workspaces/${encodeURIComponent(idWorkspace)}/produtos-gravity`,
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (!res.ok) {
        console.warn('[useProdutosSwitcher] API retornou', res.status)
        setProdutos(garantirProdutoAtualNaLista([], produtoAtualSlug, nomeProdutoAtual))
        return
      }

      const raw = await res.json()
      const parsed = produtosWorkspaceResponseSchema.parse(raw)

      const itens: ProductSwitcherItem[] = parsed.products
        .filter(p => p.is_active)
        .map(p => montarItemProduto(p.product_key, p.catalog?.name ?? p.product_key))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

      setProdutos(garantirProdutoAtualNaLista(itens, produtoAtualSlug, nomeProdutoAtual))
    } catch (err) {
      console.warn('[useProdutosSwitcher] Falha ao carregar produtos acessíveis:', err)
      setProdutos(garantirProdutoAtualNaLista([], produtoAtualSlug, nomeProdutoAtual))
    } finally {
      setCarregando(false)
    }
  }, [getToken, idWorkspace, meStatus, produtoAtualSlug, nomeProdutoAtual])

  useEffect(() => {
    void carregar()
  }, [carregar])

  // Recarrega ao voltar à aba (ex.: suspendeu produto no Configurador em outra aba).
  useEffect(() => {
    if (meStatus !== 'success' || !idWorkspace) return

    const aoFocar = () => { void carregar() }
    const aoVisibilidade = () => {
      if (document.visibilityState === 'visible') void carregar()
    }

    window.addEventListener('focus', aoFocar)
    document.addEventListener('visibilitychange', aoVisibilidade)
    window.addEventListener(EVENTO_PRODUTOS_WORKSPACE_ATUALIZADOS, aoFocar)

    return () => {
      window.removeEventListener('focus', aoFocar)
      document.removeEventListener('visibilitychange', aoVisibilidade)
      window.removeEventListener(EVENTO_PRODUTOS_WORKSPACE_ATUALIZADOS, aoFocar)
    }
  }, [carregar, meStatus, idWorkspace])

  const trocarProduto = useCallback(
    (slug: string) => {
      if (slugsProdutoEquivalentes(slug, produtoAtualSlug)) return
      window.location.href = resolverRotaProdutoGravity(slug)
    },
    [produtoAtualSlug],
  )

  // Mantém o seletor visível com 1 produto (lista atualizada após suspensão).
  const exibirSeletor = !carregando && produtos.length >= 1

  return {
    produtos,
    carregando,
    exibirSeletor,
    trocarProduto,
    recarregar: carregar,
    produtoAtualSlug,
  }
}
