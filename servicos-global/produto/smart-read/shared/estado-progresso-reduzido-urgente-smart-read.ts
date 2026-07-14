/**
 * Payload mínimo para PATCH keepalive (limite ~64KB do browser).
 * O BFF mescla com dados_sessao anterior — preserva extração já gravada.
 */

export type LeituraProgressoReduzidaUrgenteSmartRead = {
  id_leitura: string
  nome_leitura: string | null
  status_leitura: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  total_arquivos: number
  arquivos_processados: number
  arquivos: []
}

export type EstadoProgressoReduzidoUrgenteSmartRead = {
  passo: number
  nome: string
  leitura: LeituraProgressoReduzidaUrgenteSmartRead
}

export function estadoProgressoReduzidoUrgenteSmartRead(estado: {
  passo: number
  nome: string
  leitura: LeituraProgressoReduzidaUrgenteSmartRead & {
    arquivos: readonly unknown[]
  }
}): EstadoProgressoReduzidoUrgenteSmartRead {
  return {
    passo: estado.passo,
    nome: estado.nome,
    leitura: {
      id_leitura: estado.leitura.id_leitura,
      nome_leitura: estado.leitura.nome_leitura,
      status_leitura: estado.leitura.status_leitura,
      total_arquivos: estado.leitura.total_arquivos,
      arquivos_processados: estado.leitura.arquivos_processados,
      arquivos: [],
    },
  }
}

type ArquivoProgressoKeepaliveSmartRead = {
  id_arquivo: string
  nome_arquivo: string | null
  status_arquivo: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  resultado_extracao?: readonly unknown[] | null
}

/**
 * Remove só `resultado_extracao` (pesado) — mantém metadados dos arquivos para passo 2 no flush.
 */
export function estadoProgressoKeepaliveSmartRead(estado: {
  passo: number
  nome: string
  leitura: LeituraProgressoReduzidaUrgenteSmartRead & {
    arquivos: readonly ArquivoProgressoKeepaliveSmartRead[]
  }
  analise_riscos_cache?: Record<string, unknown>
}): typeof estado {
  return {
    passo: estado.passo,
    nome: estado.nome,
    ...(estado.analise_riscos_cache ? { analise_riscos_cache: estado.analise_riscos_cache } : {}),
    leitura: {
      id_leitura: estado.leitura.id_leitura,
      nome_leitura: estado.leitura.nome_leitura,
      status_leitura: estado.leitura.status_leitura,
      total_arquivos: estado.leitura.total_arquivos,
      arquivos_processados: estado.leitura.arquivos_processados,
      arquivos: estado.leitura.arquivos.map((arquivo) => ({
        id_arquivo: arquivo.id_arquivo,
        nome_arquivo: arquivo.nome_arquivo,
        status_arquivo: arquivo.status_arquivo,
        resultado_extracao: null,
      })),
    },
  }
}

/** Limite conservador do keepalive (Chrome ~64KB). */
export const LIMITE_CORPO_KEEPALIVE_PROGRESSO_SMART_READ = 60_000
