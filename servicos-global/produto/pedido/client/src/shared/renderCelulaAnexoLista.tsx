/**
 * renderCelulaAnexoLista.tsx — SSOT de células de anexo na lista (pedido/item).
 *
 * Colunas `anexo_*` usam CelulaAnexosColuna (ícone + upload), não edição inline de texto.
 */

import React from 'react'
import type { TFunction } from 'i18next'
import type { GTMapaColunasFilho } from '@nucleo/tabela-virtual-global'
import type { Pedido, PedidoItem } from './types'
import { CelulaAnexosColuna } from '../components/ConfiguracaoColunas/CelulaAnexosColuna'

export const CHAVES_COLUNA_ANEXO_PADRAO = [
  'anexo_pedido',
  'anexo_proforma',
  'anexo_invoice',
  'anexo_lpco',
] as const

export type ChaveColunaAnexoPadrao = (typeof CHAVES_COLUNA_ANEXO_PADRAO)[number]

export function isChaveColunaAnexo(chave: string): boolean {
  return chave.startsWith('anexo_')
}

/** Categoria gravada em `categoria_anexo_pedido` — alinhada ao DDD (`proforma`, `pedido`, …). */
export function categoriaAnexoPorChaveColuna(chaveColuna: string): string {
  if (chaveColuna.startsWith('anexo_')) return chaveColuna.slice('anexo_'.length)
  return chaveColuna
}

interface RenderCelulaAnexoListaOpts {
  vinculo: 'pedido' | 'item'
  vinculo_id: string
  chaveColuna: string
  colunaNome: string
  /** Colunas customizadas tipo anexo — categoria = id da coluna usuário */
  categoriaOverride?: string
}

export function renderCelulaAnexoLista(opts: RenderCelulaAnexoListaOpts): React.ReactElement {
  const categoria = opts.categoriaOverride ?? categoriaAnexoPorChaveColuna(opts.chaveColuna)
  return (
    <CelulaAnexosColuna
      vinculo_id={opts.vinculo_id}
      vinculo={opts.vinculo}
      colunaId={categoria}
      colunaNome={opts.colunaNome}
    />
  )
}

function rotuloAnexoPadrao(t: TFunction, chave: ChaveColunaAnexoPadrao): string {
  const mapa: Record<ChaveColunaAnexoPadrao, string> = {
    anexo_pedido: t('pedido.coluna_pai.anexo_pedido'),
    anexo_proforma: t('pedido.coluna_pai.anexo_proforma'),
    anexo_invoice: t('pedido.coluna_pai.anexo_invoice'),
    anexo_lpco: t('pedido.item.anexo_lpco'),
  }
  return mapa[chave]
}

/** Entradas do mapa filho GTV — anexos editáveis só pelo ícone na célula. */
/** Metadados GTV compartilhados — célula clicável (ícone), sem edição inline de texto. */
export const METADADOS_COLUNA_ANEXO_LISTA = {
  editavel: false as const,
  celulaInterativa: true as const,
  align: 'center' as const,
}

export function buildEntradasMapaAnexoLista(
  t: TFunction,
): Record<string, GTMapaColunasFilho<PedidoItem>> {
  const entries: Record<string, GTMapaColunasFilho<PedidoItem>> = {}
  for (const chave of CHAVES_COLUNA_ANEXO_PADRAO) {
    entries[chave] = {
      editavel: false,
      render: (row: PedidoItem) =>
        renderCelulaAnexoLista({
          vinculo: 'item',
          vinculo_id: row.id,
          chaveColuna: chave,
          colunaNome: rotuloAnexoPadrao(t, chave),
        }),
    }
  }
  return entries
}

export function renderColunaAnexoPedido(
  row: Pedido,
  chaveColuna: ChaveColunaAnexoPadrao,
  colunaNome: string,
): React.ReactElement {
  return renderCelulaAnexoLista({
    vinculo: 'pedido',
    vinculo_id: row.id,
    chaveColuna,
    colunaNome,
  })
}
