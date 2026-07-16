import type { GTColuna, GTMapaColunasFilho } from '../../../Tabelas/tabela-virtual-global/src/tipos'
import type { DocumentoLeituraListaSimulador, TransacaoLeituraSimulador } from './dados-lista-simulador-smart-doc'
import { CATALOGO_COLUNAS_DOCUMENTO_SMART_READ } from './catalogo-colunas-documento-simulador-smart-doc'
import {
  formatarDataLeituraSimulador,
  formatarDuracaoMsLeituraSimulador,
  formatarPercentualLeituraSimulador,
  formatarSavingHorasLeituraSimulador,
  formatarSavingValorLeituraSimulador,
} from './formatacao-lista-simulador-smart-doc'
import { PillStatusListaSimuladorSmartDoc } from './pill-status-lista-simulador-smart-doc'

const COLUNA_SOMENTE_LEITURA = { editavel: false as const }
const COLUNA_NOME_LINK = { editavel: false as const, celulaInterativa: true as const }

function criarColunasCatalogoDocumento(): GTColuna<TransacaoLeituraSimulador>[] {
  return CATALOGO_COLUNAS_DOCUMENTO_SMART_READ.map((cat) => ({
    key: cat.key,
    label: cat.label,
    grupo: cat.secao,
    oculta: false,
    filtravel: false,
    sortavel: false,
    editavel: false,
    render: () => '—',
    findDisplay: () => '',
  }))
}

function criarMapaColunasCatalogoDocumento(): Record<string, GTMapaColunasFilho<DocumentoLeituraListaSimulador>> {
  const mapa: Record<string, GTMapaColunasFilho<DocumentoLeituraListaSimulador>> = {}
  for (const cat of CATALOGO_COLUNAS_DOCUMENTO_SMART_READ) {
    mapa[cat.key] = {
      editavel: false,
      render: (item) => item.valores_colunas[cat.key]?.trim() || '—',
      findDisplay: (item) => item.valores_colunas[cat.key] ?? '',
    }
  }
  return mapa
}

export function criarColunasListaSimuladorSmartDoc(
  onAbrirLeitura: (item: TransacaoLeituraSimulador) => void,
  opcoesTutorial?: { idAlvoNomePrimeiraLinha?: string; idAlvoStatusPrimeiraLinha?: string },
): GTColuna<TransacaoLeituraSimulador>[] {
  let primeiraLinha = true
  let primeiroStatus = true

  const colunasPai: GTColuna<TransacaoLeituraSimulador>[] = [
    {
      key: 'nome_leitura',
      label: 'Nome da leitura',
      naoOcultavel: true,
      filtravel: true,
      sortavel: false,
      ...COLUNA_NOME_LINK,
      render: (_valor, item) => {
        const alvo = primeiraLinha ? opcoesTutorial?.idAlvoNomePrimeiraLinha : undefined
        if (primeiraLinha) primeiraLinha = false
        return (
          <button
            type="button"
            className="sds-lista-nome-link gtv-celula-link"
            data-sds-tutorial-alvo={alvo}
            onClick={(evento) => {
              evento.stopPropagation()
              onAbrirLeitura(item)
            }}
          >
            {item.nome_leitura ?? item.nome_arquivo ?? item.id_leitura}
          </button>
        )
      },
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
      ...COLUNA_SOMENTE_LEITURA,
      render: () => '—',
      findDisplay: () => '',
    },
    {
      key: 'status_leitura',
      label: 'Status',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => {
        const alvo = primeiroStatus ? opcoesTutorial?.idAlvoStatusPrimeiraLinha : undefined
        if (primeiroStatus) primeiroStatus = false
        return (
          <span data-sds-tutorial-alvo={alvo}>
            <PillStatusListaSimuladorSmartDoc status={item.status_leitura} />
          </span>
        )
      },
      findDisplay: (item) => item.status_leitura,
    },
    {
      key: 'total_arquivos',
      label: 'Arquivos',
      tipo: 'numero',
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => item.total_arquivos,
    },
    {
      key: 'total_documentos',
      label: 'Documentos',
      tipo: 'numero',
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => item.total_documentos,
    },
    {
      key: 'total_campos_extraidos',
      label: 'Campos extraídos',
      tipo: 'numero',
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => item.total_campos_extraidos,
    },
    {
      key: 'total_campos_corretos',
      label: 'Campos corretos',
      tipo: 'numero',
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => item.total_campos_corretos,
    },
    {
      key: 'total_campos_errados',
      label: 'Campos errados',
      tipo: 'numero',
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
      render: (_valor, item) => formatarPercentualLeituraSimulador(item.media_acertos),
      findDisplay: (item) => formatarPercentualLeituraSimulador(item.media_acertos),
    },
    {
      key: 'tempo_extracao_ia_ms',
      label: 'Tempo extração (IA)',
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => formatarDuracaoMsLeituraSimulador(item.tempo_extracao_ia_ms),
      findDisplay: (item) => formatarDuracaoMsLeituraSimulador(item.tempo_extracao_ia_ms),
    },
    {
      key: 'tempo_processo_total_ms',
      label: 'Tempo processo total',
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => formatarDuracaoMsLeituraSimulador(item.tempo_processo_total_ms),
      findDisplay: (item) => formatarDuracaoMsLeituraSimulador(item.tempo_processo_total_ms),
    },
    {
      key: 'saving_total_minutos',
      label: 'Saving (horas)',
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => formatarSavingHorasLeituraSimulador(item.saving_total_minutos),
      findDisplay: (item) => formatarSavingHorasLeituraSimulador(item.saving_total_minutos),
    },
    {
      key: 'saving_total_brl',
      label: 'Saving (valor)',
      align: 'center',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => formatarSavingValorLeituraSimulador(item.saving_total_brl),
      findDisplay: (item) => formatarSavingValorLeituraSimulador(item.saving_total_brl),
    },
    {
      key: 'data_envio',
      label: 'Data de envio',
      filtravel: true,
      sortavel: false,
      ...COLUNA_SOMENTE_LEITURA,
      render: (_valor, item) => formatarDataLeituraSimulador(item.data_envio),
      findDisplay: (item) => formatarDataLeituraSimulador(item.data_envio),
    },
  ]

  return [...colunasPai, ...criarColunasCatalogoDocumento()]
}

export function criarMapaColunasDocumentoLeituraSimulador(
  onAbrirLeitura: (item: DocumentoLeituraListaSimulador) => void,
): Record<string, GTMapaColunasFilho<DocumentoLeituraListaSimulador>> {
  return {
    nome_leitura: {
      render: (item) => (
        <button
          type="button"
          className="sds-lista-nome-link sds-lista-nome-link--filho gtv-celula-link"
          data-sds-tutorial-alvo="lista-documento-filho"
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
      editavel: false,
      render: (item) => <PillStatusListaSimuladorSmartDoc status={item.status_documento} />,
    },
    tipos_documento: {
      editavel: false,
      render: (item) => item.tipo_documento ?? '—',
    },
    numeros_documento: {
      editavel: false,
      render: (item) => item.numero_documento ?? '—',
    },
    media_acertos: {
      editavel: false,
      render: (item) => formatarPercentualLeituraSimulador(item.media_acertos),
    },
    data_envio: {
      editavel: false,
      render: (item) => formatarDataLeituraSimulador(item.data_envio),
    },
    total_arquivos: { editavel: false, render: () => '—' },
    total_documentos: { editavel: false, render: () => '—' },
    total_campos_extraidos: { editavel: false, render: () => '—' },
    total_campos_corretos: { editavel: false, render: () => '—' },
    total_campos_errados: { editavel: false, render: () => '—' },
    tempo_extracao_ia_ms: { editavel: false, render: () => '—' },
    tempo_processo_total_ms: { editavel: false, render: () => '—' },
    saving_total_minutos: { editavel: false, render: () => '—' },
    saving_total_brl: { editavel: false, render: () => '—' },
    ...criarMapaColunasCatalogoDocumento(),
  }
}
