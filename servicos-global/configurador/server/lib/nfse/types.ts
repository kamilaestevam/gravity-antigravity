// server/lib/nfse/types.ts
// Contratos da camada de emissão de NFS-e (Nota Fiscal de Serviço eletrônica).
// Cada provider (ABRASF, sistema proprietário da prefeitura, NFe.io, eNotas)
// implementa o mesmo NfseProvider e mapeia para o shape unificado.

export type NfseStatus =
  | 'PENDING'      // criada mas não enviada
  | 'PROCESSING'   // enviada, aguardando resposta da prefeitura
  | 'ISSUED'       // emitida com sucesso, número fiscal atribuído
  | 'FAILED'       // rejeitada pela prefeitura ou erro técnico
  | 'CANCELLED'    // cancelada após emissão

export type NfseProviderName = 'conta_azul' | 'abrasf_florianopolis' | 'nfeio' | 'enotas' | 'focus'

export interface NfseServicePrestado {
  codigo_servico: string        // código municipal (ex: '1.05' para processamento de dados)
  descricao: string             // descrição do serviço prestado
  valor_cents: number           // base de cálculo
  aliquota_iss?: number         // % ISS (ex: 2.5) — algumas cidades fixo, outras calculado
  iss_retido?: boolean          // se o tomador retém o ISS
}

export interface NfseTomador {
  cnpj_cpf: string              // só dígitos
  razao_social: string
  email?: string
  inscricao_municipal?: string
  endereco?: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    codigo_municipio: string    // IBGE 7 dígitos
    uf: string
    cep: string                 // só dígitos
  }
}

export interface EmitNfseParams {
  reference_id: string          // id externo (ex: stripe_invoice_id)
  tomador: NfseTomador
  servico: NfseServicePrestado
  competencia: string           // 'YYYY-MM'
  observacoes?: string
}

export interface NfseResult {
  id: string                    // id no provider
  reference_id: string
  status: NfseStatus
  number: string | null         // número fiscal (só quando ISSUED)
  code: string | null           // código de verificação
  pdf_url: string | null
  xml_url: string | null
  error_message: string | null
  issued_at: string | null      // ISO
}

export interface NfseProvider {
  readonly name: NfseProviderName

  isAvailable(): Promise<boolean>

  emit(params: EmitNfseParams): Promise<NfseResult>

  getStatus(id: string): Promise<NfseResult | null>

  cancel(id: string, reason: string): Promise<NfseResult>
}
