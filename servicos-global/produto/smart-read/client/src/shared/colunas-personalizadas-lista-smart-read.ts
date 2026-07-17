/**
 * colunas-personalizadas-lista-smart-read.ts — colunas custom da Configurações na Lista
 */

import type { ReactNode } from 'react'
import type { GTColuna, GTMapaColunasFilho, GTPreferencias, GTTipo } from '@nucleo/tabela-virtual-global'
import type {
  ColunaPersonalizadaSmartRead,
  TipoColunaSmartReadArmazenado,
} from '../components/ModalNovaColunaSmartRead'
import {
  formatarDataSomenteDiaLeitura,
  formatarPercentualLeitura,
} from './formatacao-leitura-smart-read'
import type { DocumentoLeituraLista } from './montar-documentos-leitura-smart-read'
import { COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ } from './colunas-lista-leitura-smart-read'
import type { TransacaoLeitura } from './schemas'

export function ehColunaPersonalizadaListaLeituraSmartRead(key: string): boolean {
  return key.startsWith('custom-')
}

export function colunaPersonalizadaEditavelSmartRead(tipo: TipoColunaSmartReadArmazenado): boolean {
  return tipo !== 'formula'
}

function resolverTipoColunaPersonalizadaLista(tipo: TipoColunaSmartReadArmazenado): TipoColunaSmartReadArmazenado {
  if (tipo === 'tipo_documento') return 'select'
  return tipo
}

function mapTipoColunaPersonalizada(tipo: TipoColunaSmartReadArmazenado): GTTipo {
  const resolvido = resolverTipoColunaPersonalizadaLista(tipo)
  if (resolvido === 'numero' || resolvido === 'percentual') return 'numero'
  if (resolvido === 'data') return 'periodo'
  if (resolvido === 'checkbox') return 'texto'
  return 'texto'
}

export function valorColunaPersonalizadaSalvoEhVazio(
  valor: string,
  tipo: TipoColunaSmartReadArmazenado,
): boolean {
  if (tipo === 'checkbox') return valor !== 'true' && valor !== 'false'
  return valor.trim().length === 0
}

function mapaValoresColunasPersonalizadas(
  item: TransacaoLeitura | DocumentoLeituraLista,
): Record<string, string> | undefined {
  return (item as Record<string, unknown>)._colunas_personalizadas as
    Record<string, string> | undefined
}

export function resolverValorColunaPersonalizadaListaSmartRead(
  item: TransacaoLeitura | DocumentoLeituraLista,
  colId: string,
): string {
  return mapaValoresColunasPersonalizadas(item)?.[colId]?.trim() ?? ''
}

function resolverOpcoesColunaPersonalizada(
  col: ColunaPersonalizadaSmartRead,
): { valor: string; label: string }[] | undefined {
  if (col.tipo === 'checkbox') {
    return [
      { valor: 'true', label: '✓ Sim' },
      { valor: 'false', label: '✗ Não' },
    ]
  }
  if ((col.tipo === 'select' || col.tipo === 'tipo_documento') && col.opcoes?.length) {
    return col.opcoes.map((opcao) => ({ valor: opcao, label: opcao }))
  }
  return undefined
}

function resolverValorEditarColunaPersonalizada(
  item: TransacaoLeitura | DocumentoLeituraLista,
  col: ColunaPersonalizadaSmartRead,
): unknown {
  const raw = resolverValorColunaPersonalizadaListaSmartRead(item, col.id)
  if (col.tipo === 'data') return raw || ''
  const tipoResolvido = resolverTipoColunaPersonalizadaLista(col.tipo)
  if (tipoResolvido === 'numero' || tipoResolvido === 'percentual') return Number(raw) || 0
  return raw
}

function renderValorColunaPersonalizada(
  item: TransacaoLeitura | DocumentoLeituraLista,
  col: ColunaPersonalizadaSmartRead,
): ReactNode {
  const valor = resolverValorColunaPersonalizadaListaSmartRead(item, col.id)
  if (!valor) return '—'
  if (col.tipo === 'checkbox') {
    if (valor === 'true') return '✓'
    if (valor === 'false') return '✗'
    return '—'
  }
  if (col.tipo === 'percentual') {
    const num = Number(valor)
    if (Number.isFinite(num)) return formatarPercentualLeitura(num)
  }
  if (col.tipo === 'data') return formatarDataSomenteDiaLeitura(valor)
  return valor.length > 150 ? `${valor.slice(0, 150)}…` : valor
}

export function criarColunasPersonalizadasListaLeituraSmartRead(
  personalizadas: ColunaPersonalizadaSmartRead[],
): GTColuna<TransacaoLeitura>[] {
  return personalizadas.map((col) => {
    const tipoResolvido = resolverTipoColunaPersonalizadaLista(col.tipo)
    const tipo = mapTipoColunaPersonalizada(col.tipo)
    return {
      key: col.id,
      label: col.obrigatorio ? `${col.nome} *` : col.nome,
      grupo: 'Personalizadas',
      tipo,
      filtravel: false,
      sortavel: false,
      editavel: colunaPersonalizadaEditavelSmartRead(col.tipo),
      align:
        tipoResolvido === 'numero' || tipoResolvido === 'percentual'
          ? 'right'
          : tipoResolvido === 'checkbox' || tipoResolvido === 'data'
            ? 'center'
            : undefined,
      opcoes: resolverOpcoesColunaPersonalizada(col),
      tooltipTitulo: col.nome,
      ...(col.descricao || col.obrigatorio
        ? {
            tooltipDescricao: [
              col.obrigatorio ? 'Campo obrigatório — preencha antes de concluir a edição.' : '',
              col.descricao ?? '',
            ].filter(Boolean).join(' '),
          }
        : {}),
      getValorEditar: (item) => resolverValorEditarColunaPersonalizada(item, col),
      render: (_valor, item) => renderValorColunaPersonalizada(item, col),
      findDisplay: (item) => resolverValorColunaPersonalizadaListaSmartRead(item, col.id),
    }
  })
}

export function criarMapaColunasPersonalizadasDocumentoLeitura(
  personalizadas: ColunaPersonalizadaSmartRead[],
): Record<string, GTMapaColunasFilho<DocumentoLeituraLista>> {
  const mapa: Record<string, GTMapaColunasFilho<DocumentoLeituraLista>> = {}
  for (const col of personalizadas) {
    mapa[col.id] = {
      editavel: colunaPersonalizadaEditavelSmartRead(col.tipo),
      opcoes: resolverOpcoesColunaPersonalizada(col),
      getValorEditar: (item) => resolverValorEditarColunaPersonalizada(item, col),
      render: (item) => renderValorColunaPersonalizada(item, col),
      findDisplay: (item) => resolverValorColunaPersonalizadaListaSmartRead(item, col.id),
    }
  }
  return mapa
}

/** Insere colunas custom novas em `colunas_visiveis` do painel (paridade Pedido). */
export function mesclarColunasPersonalizadasNasPreferenciasLista(
  colunasAtivas: ColunaPersonalizadaSmartRead[],
  prev: GTPreferencias | undefined,
): GTPreferencias {
  const keys = colunasAtivas.map((col) => col.id)
  const padrao = [...COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ]
  const savedVisible = prev?.colunas_visiveis?.length ? [...prev.colunas_visiveis] : [...padrao]
  const savedSet = new Set(savedVisible)
  const conhecidasAntigas = new Set(prev?.colunas_manuais_conhecidas ?? [])
  const keysSet = new Set(keys)

  const novas = keys.filter((k) => !savedSet.has(k) && !conhecidasAntigas.has(k))
  const removidas = [...conhecidasAntigas].filter(
    (k) => ehColunaPersonalizadaListaLeituraSmartRead(k) && !keysSet.has(k),
  )

  let visivel = savedVisible.filter((k) => !removidas.includes(k))
  if (novas.length > 0) visivel = [...visivel, ...novas]

  const conhecidasNovas = Array.from(new Set([...conhecidasAntigas, ...keys]))

  if (
    novas.length === 0
    && removidas.length === 0
    && prev
    && JSON.stringify(prev.colunas_manuais_conhecidas ?? []) === JSON.stringify(conhecidasNovas)
  ) {
    return prev
  }

  return {
    ...prev,
    colunas_visiveis: visivel,
    colunas_manuais_conhecidas: conhecidasNovas,
  }
}
