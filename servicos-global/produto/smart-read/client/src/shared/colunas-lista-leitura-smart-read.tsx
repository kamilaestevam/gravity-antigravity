import type { GTColuna, GTMapaColunasFilho, GTTipo } from '@nucleo/tabela-virtual-global'
import { PillStatusLeitura } from '../components/pill-status-leitura-smart-read'
import {
  CATALOGO_COLUNAS_DOCUMENTO_SMART_READ,
} from './catalogo-colunas-documento-smart-read'
import {
  formatarDataLeitura,
  formatarPercentualLeitura,
} from './formatacao-leitura-smart-read'
import type { DocumentoLeituraLista } from './montar-documentos-leitura-smart-read'
import type { TransacaoLeitura } from './schemas'

/** Colunas fixas da linha pai (leitura) — visíveis por padrão. */
export const COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ = [
  'nome_leitura',
  'status_leitura',
  'total_arquivos',
  'media_acertos',
  'data_envio',
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
    default:
      return ''
  }
}
