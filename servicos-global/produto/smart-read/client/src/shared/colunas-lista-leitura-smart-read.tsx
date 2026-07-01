import type { ReactNode } from 'react'
import type { GTColuna, GTMapaColunasFilho, GTTipo } from '@nucleo/tabela-virtual-global'
import { PillStatusLeitura } from '../components/pill-status-leitura-smart-read'
import {
  CATALOGO_COLUNAS_DOCUMENTO_SMART_READ,
  type ColunaDocumentoCatalogoSmartRead,
} from './catalogo-colunas-documento-smart-read'
import {
  formatarDataLeitura,
  formatarDuracaoMsLeitura,
  formatarPercentualLeitura,
  formatarSavingHorasLeitura,
  formatarSavingValorLeitura,
} from './formatacao-leitura-smart-read'
import {
  classeMoedaBadgeListaSmartRead,
  formatarValorCelulaCatalogoSmartRead,
  tipoColunaCatalogoSmartRead,
} from './formatacao-coluna-lista-smart-read'
import type { DocumentoLeituraLista } from './montar-documentos-leitura-smart-read'
import type { TransacaoLeitura } from './schemas'
import {
  CAMPOS_EDITAVEIS_FILHO_LISTA_SMART_READ,
  getEditavelFilhoListaSmartRead,
} from './column-behavior-lista-smart-read'
import {
  resolverCasasDecimaisColunaListaSmartRead,
  resolverTipoColunaListaSmartRead,
} from '../../../shared/tipo-coluna-lista-smart-read'
import { normalizarValorDataConferenciaParaIso } from './data-campo-conferencia-leitura-smart-read'

export { CAMPOS_EDITAVEIS_FILHO_LISTA_SMART_READ }

/** Colunas da linha pai (leitura) visíveis por padrão — métricas da leitura, não campos extraídos do documento. */
export const COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ = [
  'nome_leitura',
  'tipos_documento',
  'numeros_documento',
  'status_leitura',
  'total_arquivos',
  'total_documentos',
  'total_campos_extraidos',
  'total_campos_corretos',
  'total_campos_errados',
  'media_acertos',
  'tempo_extracao_ia_ms',
  'tempo_processo_total_ms',
  'saving_total_minutos',
  'saving_total_brl',
  'data_envio',
] as const

export const CHAVES_COLUNAS_PAI_LISTA_LEITURA_SMART_READ = COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ

const CHAVES_CATALOGO = new Set(CATALOGO_COLUNAS_DOCUMENTO_SMART_READ.map((c) => c.key))

/** Lista Smart Read: métricas do pai somente leitura; campos de documento espelham editabilidade dos filhos. */
const COLUNA_SOMENTE_LEITURA = { editavel: false as const }
const COLUNA_NOME_LINK = { editavel: false as const, celulaInterativa: true as const }
const MAPA_FILHO_SOMENTE_LEITURA = { editavel: false as const }

export type OpcaoMoedaListaSmartRead = { valor: string; label: string }

export type OpcoesColunasListaLeituraSmartRead = {
  opcoesMoedas?: OpcaoMoedaListaSmartRead[]
  /** Valor exibido/editável na linha pai para colunas do catálogo de documento. */
  getValorCatalogoPai?: (item: TransacaoLeitura, key: string) => string | null | undefined
}

/** Mesmas colunas editáveis no pai e no filho (paridade Pedido). */
export const CAMPOS_EDITAVEIS_PAI_LISTA_SMART_READ = CAMPOS_EDITAVEIS_FILHO_LISTA_SMART_READ

function resolverGtvTipoColunaCatalogo(
  cat: ColunaDocumentoCatalogoSmartRead,
): { tipo: GTTipo; casasDecimais?: number; opcoes?: OpcaoMoedaListaSmartRead[] } {
  const tipoInterno = resolverTipoColunaListaSmartRead(cat)
  if (tipoInterno === 'periodo') return { tipo: 'periodo' }
  if (tipoInterno === 'select_moeda') return { tipo: 'select' }
  if (tipoInterno === 'numero') {
    return { tipo: 'numero', casasDecimais: resolverCasasDecimaisColunaListaSmartRead(cat.key) }
  }
  return { tipo: 'texto' }
}

function renderCelulaCatalogoDocumento(
  cat: ColunaDocumentoCatalogoSmartRead,
  valor: string | null | undefined,
): ReactNode {
  const texto = formatarValorCelulaCatalogoSmartRead(cat, valor)
  if (texto === '—') return texto
  if (tipoColunaCatalogoSmartRead(cat) === 'select_moeda') {
    return (
      <span className="gtv-celula-moeda">
        <span className={classeMoedaBadgeListaSmartRead(texto)}>{texto}</span>
      </span>
    )
  }
  if (tipoColunaCatalogoSmartRead(cat) === 'numero') {
    return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{texto}</span>
  }
  return texto
}

function getValorEditarCatalogoDocumento(
  cat: ColunaDocumentoCatalogoSmartRead,
  valor: string | null | undefined,
): unknown {
  const bruto = valor?.trim()
  if (!bruto) return ''
  if (tipoColunaCatalogoSmartRead(cat) === 'periodo') {
    return normalizarValorDataConferenciaParaIso(bruto) ?? bruto
  }
  if (tipoColunaCatalogoSmartRead(cat) === 'select_moeda') {
    return bruto.toUpperCase()
  }
  if (tipoColunaCatalogoSmartRead(cat) === 'numero') {
    const br = bruto.replace(/\./g, '').replace(',', '.')
    const num = Number.parseFloat(br)
    return Number.isFinite(num) ? num : bruto
  }
  return bruto
}

export function ehColunaCatalogoDocumentoSmartRead(key: string): boolean {
  return CHAVES_CATALOGO.has(key)
}

function criarColunasCatalogoDocumento(
  opcoes: OpcoesColunasListaLeituraSmartRead = {},
): GTColuna<TransacaoLeitura>[] {
  const { opcoesMoedas, getValorCatalogoPai } = opcoes
  return CATALOGO_COLUNAS_DOCUMENTO_SMART_READ.map((cat) => {
    const gtv = resolverGtvTipoColunaCatalogo(cat)
    return {
      key: cat.key,
      label: cat.label,
      grupo: cat.secao,
      oculta: true,
      filtravel: false,
      sortavel: false,
      editavel: getEditavelFilhoListaSmartRead(cat.key),
      tipo: gtv.tipo,
      casasDecimais: gtv.casasDecimais,
      opcoes: gtv.tipo === 'select' ? opcoesMoedas : undefined,
      render: (_valor, item) =>
        renderCelulaCatalogoDocumento(cat, getValorCatalogoPai?.(item, cat.key)),
      findDisplay: (item) =>
        formatarValorCelulaCatalogoSmartRead(cat, getValorCatalogoPai?.(item, cat.key)),
      getValorEditar: (item) =>
        getValorEditarCatalogoDocumento(cat, getValorCatalogoPai?.(item, cat.key) ?? null),
    }
  })
}

function criarMapaColunasCatalogoDocumento(): Record<string, GTMapaColunasFilho<DocumentoLeituraLista>> {
  const mapa: Record<string, GTMapaColunasFilho<DocumentoLeituraLista>> = {}
  for (const cat of CATALOGO_COLUNAS_DOCUMENTO_SMART_READ) {
    mapa[cat.key] = {
      editavel: getEditavelFilhoListaSmartRead(cat.key),
      render: (item) => renderCelulaCatalogoDocumento(cat, item.valores_colunas[cat.key]),
      findDisplay: (item) => formatarValorCelulaCatalogoSmartRead(cat, item.valores_colunas[cat.key]),
      getValorEditar: (item) =>
        getValorEditarCatalogoDocumento(cat, item.valores_colunas[cat.key] ?? null),
    }
  }
  return mapa
}

/**
 * Colunas da lista de leituras. O nome é um hiperlink que abre a leitura no
 * passo atual (modo "retomar") via `onAbrirLeitura`.
 */
export function criarColunasListaLeituraSmartRead(
  onAbrirLeitura: (item: TransacaoLeitura) => void,
  opcoes: OpcoesColunasListaLeituraSmartRead = {},
): GTColuna<TransacaoLeitura>[] {
  const colunasPai: GTColuna<TransacaoLeitura>[] = [
    {
      key: 'nome_leitura',
      label: 'Nome da leitura',
      naoOcultavel: true,
      filtravel: true,
      sortavel: false,
      ...COLUNA_NOME_LINK,
      render: (_valor, item) => (
        <button
          type="button"
          className="sr-nome-celula sr-nome-link gtv-celula-link"
          onClick={(evento) => {
            evento.stopPropagation()
            onAbrirLeitura(item)
          }}
        >
          {item.nome_leitura ?? item.nome_arquivo ?? item.id_leitura}
        </button>
      ),
      findDisplay: (item) => item.nome_leitura ?? item.nome_arquivo ?? item.id_leitura,
    },
    {
      key: 'tipos_documento',
      label: 'Tipo de documento',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => item.tipos_documento ?? '—',
      findDisplay: (item) => item.tipos_documento ?? '',
    },
    {
      key: 'numeros_documento',
      label: 'Nº documento',
      filtravel: true,
      sortavel: false,
      tipo: 'texto' as GTTipo,
      editavel: getEditavelFilhoListaSmartRead('numeros_documento'),
      render: (_valor, item) => item.numeros_documento?.trim() || '—',
      findDisplay: (item) => item.numeros_documento ?? '',
    },
    {
      key: 'status_leitura',
      label: 'Status',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => <PillStatusLeitura status={item.status_leitura} />,
      findDisplay: (item) => item.status_leitura,
    },
    {
      key: 'total_arquivos',
      label: 'Arquivos',
      tipo: 'numero' as GTTipo,
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => item.total_arquivos,
    },
    {
      key: 'total_documentos',
      label: 'Documentos',
      tipo: 'numero' as GTTipo,
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => item.total_documentos,
    },
    {
      key: 'total_campos_extraidos',
      label: 'Campos extraídos',
      tipo: 'numero' as GTTipo,
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => item.total_campos_extraidos,
    },
    {
      key: 'total_campos_corretos',
      label: 'Campos corretos',
      tipo: 'numero' as GTTipo,
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => item.total_campos_corretos,
    },
    {
      key: 'total_campos_errados',
      label: 'Campos errados',
      tipo: 'numero' as GTTipo,
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => item.total_campos_errados,
    },
    {
      key: 'media_acertos',
      label: 'Média de acertos',
      align: 'center',
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => formatarPercentualLeitura(item.media_acertos),
      findDisplay: (item) => formatarPercentualLeitura(item.media_acertos),
    },
    {
      key: 'tempo_extracao_ia_ms',
      label: 'Tempo extração (IA)',
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => formatarDuracaoMsLeitura(item.tempo_extracao_ia_ms),
      findDisplay: (item) => formatarDuracaoMsLeitura(item.tempo_extracao_ia_ms),
    },
    {
      key: 'tempo_processo_total_ms',
      label: 'Tempo processo total',
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => formatarDuracaoMsLeitura(item.tempo_processo_total_ms),
      findDisplay: (item) => formatarDuracaoMsLeitura(item.tempo_processo_total_ms),
    },
    {
      key: 'saving_total_minutos',
      label: 'Saving (horas)',
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => formatarSavingHorasLeitura(item.saving_total_minutos),
      findDisplay: (item) => formatarSavingHorasLeitura(item.saving_total_minutos),
    },
    {
      key: 'saving_total_brl',
      label: 'Saving (valor)',
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => formatarSavingValorLeitura(item.saving_total_brl),
      findDisplay: (item) => formatarSavingValorLeitura(item.saving_total_brl),
    },
    {
      key: 'data_envio',
      label: 'Data de envio',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => formatarDataLeitura(item.data_envio),
      findDisplay: (item) => formatarDataLeitura(item.data_envio),
    },
  ]

  return [...colunasPai, ...criarColunasCatalogoDocumento(opcoes)]
}

/**
 * Mapa de colunas das linhas-filhas (documentos). O nome do documento também é
 * um hiperlink que abre a leitura-pai no passo atual.
 */
export function criarMapaColunasDocumentoLeitura(
  onAbrirLeitura: (item: DocumentoLeituraLista) => void,
): Record<string, GTMapaColunasFilho<DocumentoLeituraLista>> {
  return {
    nome_leitura: {
      render: (item) => (
        <button
          type="button"
          className="sr-nome-celula sr-nome-celula--filho sr-nome-link gtv-celula-link"
          onClick={(evento) => {
            evento.stopPropagation()
            onAbrirLeitura(item)
          }}
        >
          {item.nome_documento}
        </button>
      ),
    },
    status_leitura: {
      ...MAPA_FILHO_SOMENTE_LEITURA,
      render: (item) => <PillStatusLeitura status={item.status_documento} />,
    },
    total_arquivos: {
      ...MAPA_FILHO_SOMENTE_LEITURA,
      render: () => '—',
    },
    media_acertos: {
      ...MAPA_FILHO_SOMENTE_LEITURA,
      render: (item) => formatarPercentualLeitura(item.media_acertos),
    },
    data_envio: {
      ...MAPA_FILHO_SOMENTE_LEITURA,
      render: (item) => formatarDataLeitura(item.data_envio),
    },
    total_documentos: {
      ...MAPA_FILHO_SOMENTE_LEITURA,
      render: () => '—',
    },
    total_campos_extraidos: {
      ...MAPA_FILHO_SOMENTE_LEITURA,
      render: () => '—',
    },
    total_campos_corretos: {
      ...MAPA_FILHO_SOMENTE_LEITURA,
      render: () => '—',
    },
    total_campos_errados: {
      ...MAPA_FILHO_SOMENTE_LEITURA,
      render: () => '—',
    },
    tipos_documento: {
      ...MAPA_FILHO_SOMENTE_LEITURA,
      render: (item) => item.tipo_documento ?? '—',
    },
    numeros_documento: {
      editavel: getEditavelFilhoListaSmartRead('numeros_documento'),
      render: (item) => item.numero_documento?.trim() || '—',
      findDisplay: (item) => item.numero_documento ?? '',
      getValorEditar: (item) => item.numero_documento ?? '',
    },
    tempo_extracao_ia_ms: {
      ...MAPA_FILHO_SOMENTE_LEITURA,
      render: () => '—',
    },
    tempo_processo_total_ms: {
      ...MAPA_FILHO_SOMENTE_LEITURA,
      render: () => '—',
    },
    saving_total_minutos: {
      ...MAPA_FILHO_SOMENTE_LEITURA,
      render: () => '—',
    },
    saving_total_brl: {
      ...MAPA_FILHO_SOMENTE_LEITURA,
      render: () => '—',
    },
    ...criarMapaColunasCatalogoDocumento(),
  }
}

/** Valor textual para exportação (linha pai). */
export function formatarValorExportColunaLeituraSmartRead(
  key: string,
  item: TransacaoLeitura,
): string {
  switch (key) {
    case 'nome_leitura':
      return item.nome_leitura ?? item.nome_arquivo ?? item.id_leitura
    case 'status_leitura':
      return item.status_leitura
    case 'total_arquivos':
      return String(item.total_arquivos)
    case 'media_acertos':
      return formatarPercentualLeitura(item.media_acertos)
    case 'data_envio':
      return formatarDataLeitura(item.data_envio)
    case 'total_documentos':
      return String(item.total_documentos)
    case 'total_campos_extraidos':
      return String(item.total_campos_extraidos)
    case 'total_campos_corretos':
      return String(item.total_campos_corretos)
    case 'total_campos_errados':
      return String(item.total_campos_errados)
    case 'tipos_documento':
      return item.tipos_documento ?? ''
    case 'numeros_documento':
      return item.numeros_documento ?? ''
    case 'tempo_extracao_ia_ms':
      return formatarDuracaoMsLeitura(item.tempo_extracao_ia_ms)
    case 'tempo_processo_total_ms':
      return formatarDuracaoMsLeitura(item.tempo_processo_total_ms)
    case 'saving_total_minutos':
      return formatarSavingHorasLeitura(item.saving_total_minutos)
    case 'saving_total_brl':
      return formatarSavingValorLeitura(item.saving_total_brl)
    default:
      return ''
  }
}
