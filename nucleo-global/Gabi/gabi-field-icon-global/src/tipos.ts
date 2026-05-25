export interface GabiAviso {
  titulo:    string
  texto:     string
  sugestao?: string
}

export interface CampoMeta {
  chave:    string
  label:    string
  produto?: string
}

export type GabiFieldEstado = 'disponivel' | 'hover' | 'carregando' | 'esgotado' | 'oculto'

export interface GabiFieldIconProps {
  campo:      string
  label:      string
  contexto?:  Record<string, unknown>
  gabiEndpoint?: string
  className?: string
}

export interface GabiTokenBadgeProps {
  tokensUsados:  number
  quotaMensal:   number
  className?:    string
}

export interface QuotaInfo {
  tokens_usados:       number
  tokens_contratados?: number
  tokens_saldo?:       number
  quota_mensal:        number
  percentual:          number
  mes_ref:             string
  dias_para_renovar?:  number
}

export interface UseGabiOnDemandResult {
  consultar:   () => Promise<void>
  resposta:    string | null
  carregando:  boolean
  esgotado:    boolean
  erro:        string | null
  limpar:      () => void
}

export interface UseGabiQuotaResult {
  quota:        QuotaInfo | null
  carregando:   boolean
  recarregar:   () => Promise<void>
}
