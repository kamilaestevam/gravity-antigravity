import type { GTColuna, GTMapaColunasFilho, GTTipo } from '@nucleo/tabela-virtual-global'
import { PillStatusLeitura } from '../components/pill-status-leitura-smart-read'
import {
  CATALOGO_COLUNAS_DOCUMENTO_SMART_READ,
} from './catalogo-colunas-documento-smart-read'
import {
  formatarDataLeitura,
  formatarDuracaoMsLeitura,
  formatarPercentualLeitura,
  formatarSavingHorasLeitura,
  formatarSavingValorLeitura,
} from './formatacao-leitura-smart-read'
import type { DocumentoLeituraLista } from './montar-documentos-leitura-smart-read'
import type { TransacaoLeitura } from './schemas'

/** Colunas da linha pai (leitura) visíveis por padrão — métricas da leitura, não campos extraídos do documento. */
export const COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ = [
  'nome_leitura',
  'status_leitura',
  'total_arquivos',
  'media_acertos',
  'data_envio',
  'tipos_documento',
  'numeros_documento',
  'total_documentos',
  'total_campos_extraidos',
  'total_campos_corretos',
  'total_campos_errados',
  'tempo_extracao_ia_ms',
  'tempo_processo_total_ms',
  'saving_total_minutos',
  'saving_total_brl',
] as const

export const CHAVES_COLUNAS_PAI_LISTA_LEITURA_SMART_READ = COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ

const CHAVES_CATALOGO = new Set(CATALOGO_COLUNAS_DOCUMENTO_SMART_READ.map((c) => c.key))

export function ehColunaCatalogoDocumentoSmartRead(key: string): boolean {
  return CHAVES_CATALOGO.has(key)
}

function criarColunasCatalogoDocumento(): GTColuna<TransacaoLeitura>[] {
  return CATALOGO_COLUNAS_DOCUMENTO_SMART_READ.map((cat) => ({
    key: cat.key,
    label: cat.label,
    grupo: cat.secao,
    oculta: true,
    filtravel: false,
    sortavel: false,
    render: () => '—',
    findDisplay: () => '',
  }))
}

function criarMapaColunasCatalogoDocumento(): Record<string, GTMapaColunasFilho<DocumentoLeituraLista>> {
  const mapa: Record<string, GTMapaColunasFilho<DocumentoLeituraLista>> = {}
  for (const cat of CATALOGO_COLUNAS_DOCUMENTO_SMART_READ) {
    mapa[cat.key] = {
      render: (item) => item.valores_colunas[cat.key]?.trim() || '—',
      findDisplay: (item) => item.valores_colunas[cat.key] ?? '',
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
): GTColuna<TransacaoLeitura>[] {
  const colunasPai: GTColuna<TransacaoLeitura>[] = [
    {
      key: 'nome_leitura',
      label: 'Nome da leitura',
      naoOcultavel: true,
      filtravel: true,
      sortavel: false,
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
      key: 'status_leitura',
      label: 'Status',
      filtravel: true,
      sortavel: false,
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
      render: (_valor, item) => item.total_arquivos,
    },
    {
      key: 'media_acertos',
      label: 'Média de acertos',
      align: 'center',
      sortavel: false,
      render: (_valor, item) => formatarPercentualLeitura(item.media_acertos),
      findDisplay: (item) => formatarPercentualLeitura(item.media_acertos),
    },
    {
      key: 'data_envio',
      label: 'Data de envio',
      filtravel: true,
      sortavel: false,
      render: (_valor, item) => formatarDataLeitura(item.data_envio),
      findDisplay: (item) => formatarDataLeitura(item.data_envio),
    },
    {
      key: 'total_documentos',
      label: 'Documentos',
      tipo: 'numero' as GTTipo,
      align: 'center',
      filtravel: true,
      sortavel: false,
      render: (_valor, item) => item.total_documentos,
    },
    {
      key: 'total_campos_extraidos',
      label: 'Campos extraídos',
      tipo: 'numero' as GTTipo,
      align: 'center',
      filtravel: true,
      sortavel: false,
      render: (_valor, item) => item.total_campos_extraidos,
    },
    {
      key: 'total_campos_corretos',
      label: 'Campos corretos',
      tipo: 'numero' as GTTipo,
      align: 'center',
      filtravel: true,
      sortavel: false,
      render: (_valor, item) => item.total_campos_corretos,
    },
    {
      key: 'total_campos_errados',
      label: 'Campos errados',
      tipo: 'numero' as GTTipo,
      align: 'center',
      filtravel: true,
      sortavel: false,
      render: (_valor, item) => item.total_campos_errados,
    },
    {
      key: 'tipos_documento',
      label: 'Tipo de documento',
      filtravel: true,
      sortavel: false,
      render: (_valor, item) => item.tipos_documento ?? '—',
      findDisplay: (item) => item.tipos_documento ?? '',
    },
    {
      key: 'numeros_documento',
      label: 'Nº documento',
      filtravel: true,
      sortavel: false,
      render: () => '—',
      findDisplay: () => '',
    },
    {
      key: 'tempo_extracao_ia_ms',
      label: 'Tempo extração (IA)',
      align: 'center',
      filtravel: true,
      sortavel: false,
      render: (_valor, item) => formatarDuracaoMsLeitura(item.tempo_extracao_ia_ms),
      findDisplay: (item) => formatarDuracaoMsLeitura(item.tempo_extracao_ia_ms),
    },
    {
      key: 'tempo_processo_total_ms',
      label: 'Tempo processo total',
      align: 'center',
      filtravel: true,
      sortavel: false,
      render: (_valor, item) => formatarDuracaoMsLeitura(item.tempo_processo_total_ms),
      findDisplay: (item) => formatarDuracaoMsLeitura(item.tempo_processo_total_ms),
    },
    {
      key: 'saving_total_minutos',
      label: 'Saving (horas)',
      align: 'center',
      filtravel: true,
      sortavel: false,
      render: (_valor, item) => formatarSavingHorasLeitura(item.saving_total_minutos),
      findDisplay: (item) => formatarSavingHorasLeitura(item.saving_total_minutos),
    },
    {
      key: 'saving_total_brl',
      label: 'Saving (valor)',
      align: 'center',
      filtravel: true,
      sortavel: false,
      render: (_valor, item) => formatarSavingValorLeitura(item.saving_total_brl),
      findDisplay: (item) => formatarSavingValorLeitura(item.saving_total_brl),
    },
  ]

  return [...colunasPai, ...criarColunasCatalogoDocumento()]
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
      render: (item) => <PillStatusLeitura status={item.status_documento} />,
    },
    total_arquivos: {
      render: () => '—',
    },
    media_acertos: {
      render: (item) => formatarPercentualLeitura(item.media_acertos),
    },
    data_envio: {
      render: (item) => formatarDataLeitura(item.data_envio),
    },
    total_documentos: {
      render: () => '—',
    },
    total_campos_extraidos: {
      render: () => '—',
    },
    total_campos_corretos: {
      render: () => '—',
    },
    total_campos_errados: {
      render: () => '—',
    },
    tipos_documento: {
      render: (item) => item.tipo_documento ?? '—',
    },
    numeros_documento: {
      render: (item) => item.numero_documento ?? '—',
    },
    tempo_extracao_ia_ms: {
      render: () => '—',
    },
    tempo_processo_total_ms: {
      render: () => '—',
    },
    saving_total_minutos: {
      render: () => '—',
    },
    saving_total_brl: {
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
      return ''
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
