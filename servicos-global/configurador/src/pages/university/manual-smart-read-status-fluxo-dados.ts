import {
  ROTULO_STATUS_FLUXO_LEITURA,
  STATUS_FLUXO_CONCLUIDA_KPI,
  type StatusFluxoLeitura,
} from '@produto/smart-read/shared/status-fluxo-leitura-smart-read'

export type EstiloPillStatusFluxoManual = {
  cor: string
  fundo: string
  borda: string
}

export type EtapaStatusFluxoManualSmartRead = {
  codigo: StatusFluxoLeitura
  ordem: string
  rotulo: string
  estilo: EstiloPillStatusFluxoManual
  passoWizard: number | null
  gatilhoEntrada: string
  gatilhoSaida: string
  ativo: boolean
  reservado: boolean
  inicioFluxo?: boolean
  fimFluxo?: boolean
  kpiConcluida?: boolean
}

const ESTILO_PILL_STATUS_FLUXO: Record<StatusFluxoLeitura, EstiloPillStatusFluxoManual> = {
  ANEXAR_ARQUIVO: { cor: '#fbbf24', fundo: 'rgba(251,191,36,.15)', borda: 'rgba(251,191,36,.32)' },
  ANALISE_ARQUIVO: { cor: '#818cf8', fundo: 'rgba(129,140,248,.15)', borda: 'rgba(129,140,248,.32)' },
  CONFERENCIA: { cor: '#a78bfa', fundo: 'rgba(167,139,250,.15)', borda: 'rgba(167,139,250,.32)' },
  RESULTADO_LEITURAS: { cor: '#34d399', fundo: 'rgba(52,211,153,.15)', borda: 'rgba(52,211,153,.32)' },
  EM_INTEGRACAO: { cor: '#38bdf8', fundo: 'rgba(56,189,248,.15)', borda: 'rgba(56,189,248,.32)' },
  INTEGRACAO_CONFIRMADA: { cor: '#2dd4bf', fundo: 'rgba(45,212,191,.15)', borda: 'rgba(45,212,191,.32)' },
  FALHOU: { cor: '#f87171', fundo: 'rgba(248,113,113,.15)', borda: 'rgba(248,113,113,.32)' },
}

function montarEtapa(
  codigo: StatusFluxoLeitura,
  ordem: string,
  opcoes: {
    passoWizard: number | null
    gatilhoEntrada: string
    gatilhoSaida: string
    ativo: boolean
    reservado?: boolean
    inicioFluxo?: boolean
    fimFluxo?: boolean
    kpiConcluida?: boolean
  },
): EtapaStatusFluxoManualSmartRead {
  return {
    codigo,
    ordem,
    rotulo: ROTULO_STATUS_FLUXO_LEITURA[codigo],
    estilo: ESTILO_PILL_STATUS_FLUXO[codigo],
    ...opcoes,
    reservado: opcoes.reservado ?? false,
  }
}

/** SSOT manual — paridade com `shared/status-fluxo-leitura-smart-read.ts` e LISTA §14. */
export const ETAPAS_STATUS_FLUXO_MANUAL_SMART_READ: EtapaStatusFluxoManualSmartRead[] = [
  montarEtapa('ANEXAR_ARQUIVO', '01', {
    passoWizard: 1,
    gatilhoEntrada: '**+ Novo** na aba Insights ou Lista — o wizard abre no passo **Anexar**.',
    gatilhoSaida: '**Enviar** com ao menos um arquivo anexado.',
    ativo: true,
    inicioFluxo: true,
  }),
  montarEtapa('ANALISE_ARQUIVO', '02', {
    passoWizard: 2,
    gatilhoEntrada: 'Upload concluído — a IA classifica e extrai os documentos.',
    gatilhoSaida: '**Continuar** após a análise (ou **Voltar** para revisar anexos).',
    ativo: true,
  }),
  montarEtapa('CONFERENCIA', '03', {
    passoWizard: 3,
    gatilhoEntrada: '**Continuar** no passo 2 — abre Conferência de Campos e ferramentas da aba.',
    gatilhoSaida: 'Avançar para o passo **Resultado** (após revisar campos e concluir pendências).',
    ativo: true,
  }),
  montarEtapa('RESULTADO_LEITURAS', '04', {
    passoWizard: 4,
    gatilhoEntrada: 'Conclusão do passo 3 — pacote pronto para download e integrações.',
    gatilhoSaida: 'Fim do wizard — leitura conta no KPI **concluída(s)** da Lista.',
    ativo: true,
    fimFluxo: true,
    kpiConcluida: true,
  }),
  montarEtapa('FALHOU', '—', {
    passoWizard: 2,
    gatilhoEntrada: 'Erro na extração (legado **FAILED**) ou falha Gravity no passo 2.',
    gatilhoSaida: 'Reinicie a leitura ou corrija o arquivo — não avança no wizard.',
    ativo: true,
  }),
  montarEtapa('EM_INTEGRACAO', '05', {
    passoWizard: null,
    gatilhoEntrada: 'Reservado — envio via **API Cockpit** em processamento.',
    gatilhoSaida: 'Aguarda confirmação do sistema externo.',
    ativo: false,
    reservado: true,
  }),
  montarEtapa('INTEGRACAO_CONFIRMADA', '06', {
    passoWizard: null,
    gatilhoEntrada: 'Reservado — integração API confirmada pelo parceiro.',
    gatilhoSaida: 'Estado final pós-integração (futuro).',
    ativo: false,
    reservado: true,
  }),
]

export const ETAPAS_STATUS_FLUXO_ATIVAS_MANUAL = ETAPAS_STATUS_FLUXO_MANUAL_SMART_READ.filter(
  (etapa) => etapa.ativo && !etapa.reservado,
)

export const ETAPAS_STATUS_FLUXO_RESERVADAS_MANUAL = ETAPAS_STATUS_FLUXO_MANUAL_SMART_READ.filter(
  (etapa) => etapa.reservado,
)

/** Abas do infográfico — fluxo ativo + reservados API na mesma lista. */
export const ETAPAS_STATUS_FLUXO_ABAS_MANUAL = [
  ...ETAPAS_STATUS_FLUXO_ATIVAS_MANUAL,
  ...ETAPAS_STATUS_FLUXO_RESERVADAS_MANUAL,
]

export const CODIGO_STATUS_KPI_CONCLUIDA = STATUS_FLUXO_CONCLUIDA_KPI
