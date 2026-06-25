/**
 * testes/infra/admin/testes-favoritos-admin.ts
 * =============================================
 * CAMADA DE DOMÍNIO — lógica pura do modal «Rodar Testes» (Admin).
 *
 * O que mora AQUI (testes/infra/admin/):
 * - Contratos Zod (TesteFavoritoUsuario, planos_resumo) — espelham a tabela
 *   `teste_favorito_usuario` (model Prisma TesteFavoritoUsuario no Configurador).
 *   Paridade nominal absoluta: os campos usam EXATAMENTE os nomes das colunas.
 * - Helpers de rótulo, deduplicação, snapshot de planos ao salvar favorito
 * - Funções testáveis sem React, sem fetch, sem i18n
 *
 * O que NÃO mora aqui:
 * - Persistência: agora é no banco (tabela `teste_favorito_usuario`), via
 *   `adminTestesFavoritosApi` em servicos-global/configurador/src/services/api-client.ts.
 *   (até 2026-06-11 era localStorage por id_usuario — substituído para o favorito
 *    seguir o usuário entre navegadores/máquinas/sessões).
 * - ModalTestesExecutar.tsx — layout, abas, pills, estilos, ícones, estado React.
 *
 * Consumidores:
 * - servicos-global/configurador/src/pages/admin/ModalTestesExecutar.tsx
 * - servicos-global/configurador/src/services/api-client.ts (importa o schema)
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
  'smart-read',
  'bid-cambio',
  'lpco',
  'nf-importacao',
  'simula-custo',
] as const
export type ProdutoTesteFavorito = (typeof PRODUTOS_TESTE_FAVORITO)[number]

export const TIPOS_TESTE_FAVORITO = ['UNI', 'FUN', 'E2E', 'CRO', 'EMT'] as const
export type TipoTesteFavorito = (typeof TIPOS_TESTE_FAVORITO)[number]

/** Limite por usuário — espelhado no backend (POST /admin/testes-favoritos). */
export const MAX_TESTES_FAVORITOS_USUARIO = 20

export const planoFavoritoResumoSchema = z.object({
  id: z.string().min(1),
  titulo: z.string(),
  descricao: z.string(),
  tipo: z.enum(TIPOS_TESTE_FAVORITO).optional(),
})

/**
 * Contrato de um favorito — espelha a tabela `teste_favorito_usuario`.
 * `id_teste_favorito_usuario` e `data_criacao_teste_favorito_usuario` vêm do banco
 * (ausentes ao montar um favorito novo antes de salvar).
 */
export const testeFavoritoUsuarioSchema = z.object({
  id_teste_favorito_usuario: z.string().optional(),
  produto_teste_favorito_usuario: z.enum(PRODUTOS_TESTE_FAVORITO),
  ambiente_teste_favorito_usuario: z.enum(AMBIENTES_TESTE_FAVORITO),
  tipos_teste_favorito_usuario: z.array(z.enum(TIPOS_TESTE_FAVORITO)).min(1),
  planos_ids_teste_favorito_usuario: z.array(z.string().min(1)),
  /** Snapshot ao salvar — exibe título/descrição mesmo com outro produto selecionado. */
  planos_resumo_teste_favorito_usuario: z.array(planoFavoritoResumoSchema).nullish(),
  data_criacao_teste_favorito_usuario: z.string().optional(),
})

export type TesteFavoritoUsuario = z.infer<typeof testeFavoritoUsuarioSchema>
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

/**
 * Subtítulo do card no modal Rodar Testes (`tela` → `modulo`).
 * Coluna «O que foi testado» no histórico admin usa este texto; se vazio, cai no `id` do plano.
 */
export function resolverOqueFoiTestadoPlano(plano: Pick<PlanoFavoritoResumoOrigem, 'id' | 'tela' | 'modulo'>): string {
  const subtitulo = (plano.tela ?? plano.modulo ?? '').trim()
  return subtitulo || plano.id.trim()
}

/** Resolve rótulo humano para uma linha do histórico (logs legados gravavam só o ID). */
export function resolverOqueFoiTestadoLog(
  modulo: string,
  teste: string,
  catalogo?: ReadonlyMap<string, Pick<PlanoFavoritoResumoOrigem, 'id' | 'tela' | 'modulo'>>,
): string {
  const candidatoId = [modulo, teste].find(v => /^TST-/i.test(v.trim()))?.trim()
  if (candidatoId && catalogo?.has(candidatoId)) {
    return resolverOqueFoiTestadoPlano(catalogo.get(candidatoId)!)
  }
  const textoTeste = teste.trim()
  if (textoTeste && textoTeste !== 'N/A' && !/^TST-/i.test(textoTeste)) {
    return textoTeste
  }
  return candidatoId ?? textoTeste ?? modulo
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
  fav: TesteFavoritoUsuario,
  planosCatalogo?: readonly PlanoFavoritoResumoOrigem[],
): PlanoFavoritoResumo[] {
  const resumo = fav.planos_resumo_teste_favorito_usuario
  if (resumo && resumo.length > 0) {
    return resumo
  }
  if (planosCatalogo && planosCatalogo.length > 0) {
    return montarResumoPlanosFavorito(fav.planos_ids_teste_favorito_usuario, planosCatalogo)
  }
  return fav.planos_ids_teste_favorito_usuario.map(id => ({ id, titulo: '', descricao: '' }))
}

/** Evita exibir o ID duas vezes quando não há título humano no snapshot. */
export function tituloPlanoFavoritoExibicao(plano: PlanoFavoritoResumo): string {
  const titulo = plano.titulo.trim()
  if (!titulo || titulo === plano.id) return ''
  return titulo
}

/** Chave de deduplicação — ignora ordem de tipos e planos. Espelhada no backend. */
export function chaveTesteFavoritoUsuario(
  fav: Pick<
    TesteFavoritoUsuario,
    'produto_teste_favorito_usuario' | 'ambiente_teste_favorito_usuario' | 'tipos_teste_favorito_usuario' | 'planos_ids_teste_favorito_usuario'
  >,
): string {
  const tipos = [...fav.tipos_teste_favorito_usuario].sort().join(',')
  const planos = [...fav.planos_ids_teste_favorito_usuario].sort().join(',')
  return `${fav.produto_teste_favorito_usuario}|${fav.ambiente_teste_favorito_usuario}|${tipos}|${planos}`
}

export function rotuloAmbienteTesteFavorito(ambiente: AmbienteTesteFavorito): string {
  if (ambiente === 'Producao') return 'Produção'
  return ambiente
}

export function rotuloTesteFavoritoUsuario(
  fav: TesteFavoritoUsuario,
  rotuloProduto?: string,
): string {
  const prod = rotuloProduto ?? fav.produto_teste_favorito_usuario
  const tipos = [...fav.tipos_teste_favorito_usuario].join(', ')
  const nPlanos = fav.planos_ids_teste_favorito_usuario.length
  return `${prod} · ${rotuloAmbienteTesteFavorito(fav.ambiente_teste_favorito_usuario)} · ${tipos} · ${nPlanos} plano${nPlanos !== 1 ? 's' : ''}`
}

export function filtrarPlanosFavoritoValidos(
  planosIds: readonly string[],
  planosDisponiveis: readonly { id: string }[],
): string[] {
  const disponiveis = new Set(planosDisponiveis.map(p => p.id))
  return planosIds.filter(id => disponiveis.has(id))
}
