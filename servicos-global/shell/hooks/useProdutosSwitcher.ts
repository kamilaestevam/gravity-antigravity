/**
 * useProdutosSwitcher — produtos que o usuário pode abrir no workspace ativo.
 *
 * Fonte: GET /api/v1/workspaces/:id_workspace/produtos-gravity (Configurador).
 * A rota aplica os 3 portões (org contratou, workspace habilitou, usuário permitido)
 * via produtos-acessiveis-service (SSOT).
 *
 * REGRA 06 — resposta validada com Zod antes de uso.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { cloneElement, createElement } from 'react'
import { Folders } from '@phosphor-icons/react'
import { getProdutoMeta } from '@nucleo/logo-produtos'
import { useShellStore } from '../store'
import {
  resolverSlugMetaProduto,
  slugsProdutoEquivalentes,
} from '../utils/resolver-rota-produto'
import { produtosWorkspaceResponseSchema } from '../schemas/produtos-workspace-response.schema'
import {
  SLUG_ATALHO_PROCESSOS,
  resolverNavegacaoTrocarProduto,
} from '../utils/navegacao-trocar-produto'
import type { ProductSwitcherItem } from '@nucleo/menu-lateral-global'

export { produtosWorkspaceResponseSchema } from '../schemas/produtos-workspace-response.schema'

const CONFIGURADOR_URL = import.meta.env.VITE_CONFIGURADOR_URL ?? ''

/** Dispare após alterar assinatura/habilitação de produto no Configurador. */
export const EVENTO_PRODUTOS_WORKSPACE_ATUALIZADOS = 'gravity:produtos-workspace-atualizados'

/** Ordem fixa do seletor de produtos (slug normalizado por resolverSlugMetaProduto). */
const ORDEM_PRODUTOS_SWITCHER = ['pedido', 'bid-frete', 'bid-cambio']

function ordenarProdutosSwitcher(a: ProductSwitcherItem, b: ProductSwitcherItem): number {
  const ia = ORDEM_PRODUTOS_SWITCHER.indexOf(resolverSlugMetaProduto(a.slug))
  const ib = ORDEM_PRODUTOS_SWITCHER.indexOf(resolverSlugMetaProduto(b.slug))
  const pa = ia === -1 ? Number.MAX_SAFE_INTEGER : ia
  const pb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib
  if (pa !== pb) return pa - pb
  return a.name.localeCompare(b.name, 'pt-BR')
}

function montarItemProduto(slug: string, nome?: string): ProductSwitcherItem {
  const slugCanonico = resolverSlugMetaProduto(slug)
  const meta = getProdutoMeta(slugCanonico)
  return {
    slug: slugCanonico,
    name: nome ?? slugCanonico,
    color: meta.color,
    icon: cloneElement(meta.icon, { size: 22 }),
  }
}

function deduplicarProdutosSwitcher(itens: ProductSwitcherItem[]): ProductSwitcherItem[] {
  const vistos = new Set<string>()
  return itens.filter(p => {
    if (p.kind === 'acao') return true
    const chave = resolverSlugMetaProduto(p.slug)
    if (vistos.has(chave)) return false
    vistos.add(chave)
    return true
  })
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

/**
 * Atalho "Processos" — não é um produto, é uma visão transversal de todos eles.
 * Ícone agregador (Folders, igual ao "Ver todos os processos" do Hub) e kind 'acao'
 * para o seletor renderizar separado, com seta de navegação em vez de check.
 */
function montarAtalhoProcessos(): ProductSwitcherItem {
  const meta = getProdutoMeta(SLUG_ATALHO_PROCESSOS)
  return {
    slug: SLUG_ATALHO_PROCESSOS,
    name: 'Processos',
    color: meta.color,
    icon: createElement(Folders, { weight: 'duotone', size: 22 }),
    kind: 'acao',
    sublabel: 'Visão unificada dos Produtos Gravity',
  }
}

/** Adiciona o atalho "Processos" sempre por último (não é um produto, é um link para o Hub). */
function adicionarAtalhoProcessos(itens: ProductSwitcherItem[]): ProductSwitcherItem[] {
  const semProcessos = itens.filter(p => p.slug !== SLUG_ATALHO_PROCESSOS)
  return [...semProcessos, montarAtalhoProcessos()]
}

/** Lista mínima síncrona — evita sumir o chevron do seletor enquanto a API responde. */
export function montarListaProdutosSwitcherInicial(
  produtoAtualSlug: string,
  nomeProdutoAtual?: string,
): ProductSwitcherItem[] {
  return adicionarAtalhoProcessos(garantirProdutoAtualNaLista([], produtoAtualSlug, nomeProdutoAtual))
}

export interface UseProdutosSwitcherOptions {
  /** Quando false, não busca API nem expõe seletor (ex.: Sidebar fora de /acesso-processos). */
  enabled?: boolean
}

export function useProdutosSwitcher(
  produtoAtualSlug: string,
  nomeProdutoAtual?: string,
  options?: UseProdutosSwitcherOptions,
) {
  const enabled = options?.enabled ?? true
  const { getToken } = useAuth()
  const idWorkspaceAtivo = useShellStore(s => s.idWorkspaceAtivo)
  const meStatus = useShellStore(s => s.meStatus)

  const [produtos, setProdutos] = useState<ProductSwitcherItem[]>(() =>
    enabled
      ? montarListaProdutosSwitcherInicial(produtoAtualSlug, nomeProdutoAtual)
      : [],
  )
  const [carregando, setCarregando] = useState(enabled)
  const produtosRef = useRef(produtos)
  produtosRef.current = produtos

  const idWorkspace =
    idWorkspaceAtivo ??
    (typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('gravity_company_id')
      : null)

  const carregar = useCallback(async () => {
    if (!enabled) {
      setCarregando(false)
      return
    }

    if (meStatus !== 'success' || !idWorkspace) {
      setCarregando(false)
      return
    }

    const primeiraCarga = produtosRef.current.length === 0
    if (primeiraCarga) setCarregando(true)
    try {
      const token = await getToken()
      if (!token) {
        console.warn('[useProdutosSwitcher] JWT ausente — não foi possível listar produtos')
        setProdutos(adicionarAtalhoProcessos(garantirProdutoAtualNaLista([], produtoAtualSlug, nomeProdutoAtual)))
        return
      }

      const base = CONFIGURADOR_URL || ''
      const res = await fetch(
        `${base}/api/v1/workspaces/${encodeURIComponent(idWorkspace)}/produtos-gravity`,
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (!res.ok) {
        console.warn('[useProdutosSwitcher] API retornou', res.status)
        setProdutos(adicionarAtalhoProcessos(garantirProdutoAtualNaLista([], produtoAtualSlug, nomeProdutoAtual)))
        return
      }

      const raw = await res.json()
      const parsed = produtosWorkspaceResponseSchema.parse(raw)

      const itens: ProductSwitcherItem[] = deduplicarProdutosSwitcher(
        parsed.products
          .filter(p => p.is_active)
          .map(p => montarItemProduto(p.product_key, p.catalog?.name ?? p.product_key))
          .sort(ordenarProdutosSwitcher),
      )

      setProdutos(adicionarAtalhoProcessos(garantirProdutoAtualNaLista(itens, produtoAtualSlug, nomeProdutoAtual)))
    } catch (err) {
      console.warn('[useProdutosSwitcher] Falha ao carregar produtos acessíveis:', err)
      setProdutos(adicionarAtalhoProcessos(garantirProdutoAtualNaLista([], produtoAtualSlug, nomeProdutoAtual)))
    } finally {
      setCarregando(false)
    }
  }, [enabled, getToken, idWorkspace, meStatus, produtoAtualSlug, nomeProdutoAtual])

  useEffect(() => {
    if (!enabled) return
    void carregar()
  }, [carregar, enabled])

  // Recarrega ao voltar à aba (ex.: suspendeu produto no Configurador em outra aba).
  useEffect(() => {
    if (!enabled || meStatus !== 'success' || !idWorkspace) return

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
  }, [carregar, enabled, meStatus, idWorkspace])

  const trocarProduto = useCallback(
    (slug: string) => {
      const destino = resolverNavegacaoTrocarProduto(slug, produtoAtualSlug)
      if (destino.tipo === 'redirect') {
        window.location.href = destino.href
      }
    },
    [produtoAtualSlug],
  )

  // Mantém o seletor visível com 1+ produto — inclusive durante refresh da API.
  const exibirSeletor = produtos.length >= 1

  return {
    produtos,
    carregando,
    exibirSeletor,
    trocarProduto,
    recarregar: carregar,
    produtoAtualSlug,
  }
}
