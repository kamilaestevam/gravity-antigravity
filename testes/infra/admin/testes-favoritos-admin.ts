/**
 * testes/infra/admin/testes-favoritos-admin.ts
 * =============================================
 * CAMADA DE DOMÍNIO — lógica pura do modal «Rodar Testes» (Admin).
 *
 * O que mora AQUI (testes/infra/admin/):
 * - Contratos Zod (TesteFavoritoAdmin, planos_resumo)
 * - Persistência localStorage (chave por id_usuario)
 * - Helpers de rótulo, deduplicação, snapshot de planos ao salvar favorito
 * - Funções testáveis sem React, sem fetch, sem i18n
 *
 * O que NÃO mora aqui — fica no Configurador (UI):
 * - ModalTestesExecutar.tsx — layout, abas, pills, estilos, ícones
 * - Chamadas adminPlanosTesteApi / adminTestesApi
 * - Estado React (produto selecionado, planos marcados, loading)
 * - Tradução (useTranslation) e componentes @nucleo/*
 *
 * Consumidores:
 * - servicos-global/configurador/src/pages/admin/ModalTestesExecutar.tsx
 * - testes/testes-unitarios/configurador/testes-favoritos-admin.test.ts
 *
 * Import: `@testes/infra/admin/testes-favoritos-admin`
 */
import { z } from 'zod'

export const AMBIENTES_TESTE_FAVORITO = ['Local', 'Staging', 'Producao'] as const
export type AmbienteTesteFavorito = (typeof AMBIENTES_TESTE_FAVORITO)[number]

export const PRODUTOS_TESTE_FAVORITO = [
  'admin',
  'configurador',
  'pedido',
  'bid-frete',
  'bid-cambio',
  'lpco',
  'nf-importacao',
  'simula-custo',
] as const
export type ProdutoTesteFavorito = (typeof PRODUTOS_TESTE_FAVORITO)[number]

export const TIPOS_TESTE_FAVORITO = ['UNI', 'FUN', 'E2E', 'CRO', 'EMT'] as const
export type TipoTesteFavorito = (typeof TIPOS_TESTE_FAVORITO)[number]

const MAX_FAVORITOS = 20

const planoFavoritoResumoSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  descricao: z.string(),
  tipo: z.enum(TIPOS_TESTE_FAVORITO).optional(),
})

const testeFavoritoSchema = z.object({
  produto: z.enum(PRODUTOS_TESTE_FAVORITO),
  ambiente: z.enum(AMBIENTES_TESTE_FAVORITO),
  tipos: z.array(z.enum(TIPOS_TESTE_FAVORITO)).min(1),
  planos_ids: z.array(z.string().min(1)),
  /** Snapshot ao salvar — exibe título/descrição mesmo com outro produto selecionado. */
  planos_resumo: z.array(planoFavoritoResumoSchema).optional(),
})

const listaFavoritosSchema = z.array(testeFavoritoSchema).max(MAX_FAVORITOS)

export type TesteFavoritoAdmin = z.infer<typeof testeFavoritoSchema>
export type PlanoFavoritoResumo = z.infer<typeof planoFavoritoResumoSchema>

export interface PlanoFavoritoResumoOrigem {
  id: string
  tela?: string
  modulo?: string
  sublocal: string
  tipo?: string
  casosTotal?: number
}

/** Título exibido na lista de planos (igual ModalDetalhePlanoTeste). */
export function extrairTituloPlanoTeste(plano: PlanoFavoritoResumoOrigem): string {
  return (plano.tela ?? plano.modulo ?? plano.sublocal).trim()
}

/** Linha secundária — caminho + contagem de casos quando disponível. */
export function extrairDescricaoPlanoTeste(plano: PlanoFavoritoResumoOrigem): string {
  const titulo = extrairTituloPlanoTeste(plano)
  const partes: string[] = []
  if (plano.sublocal && plano.sublocal !== titulo) partes.push(plano.sublocal)
  if (typeof plano.casosTotal === 'number') {
    partes.push(`${plano.casosTotal} casos no registry`)
  }
  return partes.join(' · ')
}

export function montarResumoPlanosFavorito(
  planosIds: readonly string[],
  planosCatalogo: readonly PlanoFavoritoResumoOrigem[],
): PlanoFavoritoResumo[] {
  const mapa = new Map(planosCatalogo.map(p => [p.id, p]))
  return planosIds.map((id) => {
    const plano = mapa.get(id)
    if (!plano) {
      return { id, titulo: '', descricao: '' }
    }
    const tipo = plano.tipo
    return {
      id,
      titulo: extrairTituloPlanoTeste(plano),
      descricao: extrairDescricaoPlanoTeste(plano),
      ...(tipo && TIPOS_TESTE_FAVORITO.includes(tipo as TipoTesteFavorito)
        ? { tipo: tipo as TipoTesteFavorito }
        : {}),
    }
  })
}

/** Resolve planos para exibição no card de favorito (snapshot → catálogo → fallback id). */
export function planosExibicaoFavorito(
  fav: TesteFavoritoAdmin,
  planosCatalogo?: readonly PlanoFavoritoResumoOrigem[],
): PlanoFavoritoResumo[] {
  if (fav.planos_resumo && fav.planos_resumo.length > 0) {
    return fav.planos_resumo
  }
  if (planosCatalogo && planosCatalogo.length > 0) {
    return montarResumoPlanosFavorito(fav.planos_ids, planosCatalogo)
  }
  return fav.planos_ids.map(id => ({ id, titulo: '', descricao: '' }))
}

/** Evita exibir o ID duas vezes quando não há título humano no snapshot. */
export function tituloPlanoFavoritoExibicao(plano: PlanoFavoritoResumo): string {
  const titulo = plano.titulo.trim()
  if (!titulo || titulo === plano.id) return ''
  return titulo
}

export function chaveTestesFavoritosAdmin(idUsuario: string): string {
  return `admin:testes-favoritos:${idUsuario}`
}

export function chaveTesteFavoritoAdmin(fav: TesteFavoritoAdmin): string {
  const tipos = [...fav.tipos].sort().join(',')
  const planos = [...fav.planos_ids].sort().join(',')
  return `${fav.produto}|${fav.ambiente}|${tipos}|${planos}`
}

export function rotuloAmbienteTesteFavorito(ambiente: AmbienteTesteFavorito): string {
  if (ambiente === 'Producao') return 'Produção'
  return ambiente
}

export function rotuloTesteFavoritoAdmin(
  fav: TesteFavoritoAdmin,
  rotuloProduto?: string,
): string {
  const prod = rotuloProduto ?? fav.produto
  const tipos = [...fav.tipos].join(', ')
  const nPlanos = fav.planos_ids.length
  return `${prod} · ${rotuloAmbienteTesteFavorito(fav.ambiente)} · ${tipos} · ${nPlanos} plano${nPlanos !== 1 ? 's' : ''}`
}

export function filtrarPlanosFavoritoValidos(
  planosIds: readonly string[],
  planosDisponiveis: readonly { id: string }[],
): string[] {
  const disponiveis = new Set(planosDisponiveis.map(p => p.id))
  return planosIds.filter(id => disponiveis.has(id))
}

export function lerTestesFavoritosAdmin(idUsuario: string): TesteFavoritoAdmin[] {
  if (!idUsuario) return []
  try {
    const raw = localStorage.getItem(chaveTestesFavoritosAdmin(idUsuario))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    const result = listaFavoritosSchema.safeParse(parsed)
    return result.success ? result.data : []
  } catch {
    return []
  }
}

function gravarTestesFavoritosAdmin(idUsuario: string, favoritos: TesteFavoritoAdmin[]): TesteFavoritoAdmin[] {
  const validados = listaFavoritosSchema.safeParse(favoritos)
  const lista = validados.success ? validados.data : []
  try {
    if (lista.length === 0) {
      localStorage.removeItem(chaveTestesFavoritosAdmin(idUsuario))
    } else {
      localStorage.setItem(chaveTestesFavoritosAdmin(idUsuario), JSON.stringify(lista))
    }
  } catch {
    /* quota / private mode */
  }
  return lista
}

export function adicionarTesteFavoritoAdmin(
  idUsuario: string,
  favorito: TesteFavoritoAdmin,
): { favoritos: TesteFavoritoAdmin[]; adicionado: boolean; motivo?: 'duplicado' | 'limite' | 'invalido' } {
  const parsed = testeFavoritoSchema.safeParse(favorito)
  if (!parsed.success) {
    return { favoritos: lerTestesFavoritosAdmin(idUsuario), adicionado: false, motivo: 'invalido' }
  }

  const atual = lerTestesFavoritosAdmin(idUsuario)
  const chaveNova = chaveTesteFavoritoAdmin(parsed.data)
  if (atual.some(f => chaveTesteFavoritoAdmin(f) === chaveNova)) {
    return { favoritos: atual, adicionado: false, motivo: 'duplicado' }
  }
  if (atual.length >= MAX_FAVORITOS) {
    return { favoritos: atual, adicionado: false, motivo: 'limite' }
  }

  const favoritos = gravarTestesFavoritosAdmin(idUsuario, [...atual, parsed.data])
  return { favoritos, adicionado: true }
}

export function removerTesteFavoritoAdmin(idUsuario: string, indice: number): TesteFavoritoAdmin[] {
  const atual = lerTestesFavoritosAdmin(idUsuario)
  if (indice < 0 || indice >= atual.length) return atual
  const next = atual.filter((_, i) => i !== indice)
  return gravarTestesFavoritosAdmin(idUsuario, next)
}
