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

/** Limite conservador do keepalive (Chrome ~64KB). */
export const LIMITE_CORPO_KEEPALIVE_PROGRESSO_SMART_READ = 60_000
