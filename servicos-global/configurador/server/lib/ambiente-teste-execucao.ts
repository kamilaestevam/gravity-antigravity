/** URL padrão da UI de produção para execução de testes E2E/EMT (admin → Playwright). */
export const GRAVITY_PROD_UI_URL_PADRAO = 'https://usegravity.com.br'

export type AmbienteTesteUi = 'Local' | 'Staging' | 'Producao'

export interface AmbienteExecucaoInfo {
  ambiente: AmbienteTesteUi
  rotulo: string
  uiUrl: string
  apiUrl: string
  nota: string
}

const DEFAULT_UI: Record<AmbienteTesteUi, string> = {
  Local:    'http://localhost:8000',
  Staging:  process.env.GRAVITY_STAGING_UI_URL ?? 'https://staging.gravity.com.br',
  Producao: process.env.GRAVITY_PROD_UI_URL ?? GRAVITY_PROD_UI_URL_PADRAO,
}

export function resolverAmbienteExecucao(ambiente?: AmbienteTesteUi): AmbienteExecucaoInfo {
  const resolved = ambiente ?? 'Local'
  const uiUrl = DEFAULT_UI[resolved]
  const apiUrl = resolved === 'Local' ? 'http://localhost:8005' : uiUrl

  const notas: Record<AmbienteTesteUi, string> = {
    Local:    'Playwright usa localhost:8000 (UI) e :8005 (API). Passos de “subir servidor” aplicam-se.',
    Staging:  'Serviços já em Staging — runner usa PLAYWRIGHT_BASE_URL; não sobe processo local.',
    Producao: 'Serviços já em Produção — runner usa PLAYWRIGHT_BASE_URL; não sobe processo local.',
  }

  const rotulos: Record<AmbienteTesteUi, string> = {
    Local: 'Local',
    Staging: 'Staging',
    Producao: 'Produção',
  }

  return {
    ambiente: resolved,
    rotulo: rotulos[resolved],
    uiUrl,
    apiUrl,
    nota: notas[resolved],
  }
}

export function adaptarTextoCasoParaAmbiente(texto: string, info: AmbienteExecucaoInfo): string {
  if (info.ambiente === 'Local') return texto

  if (/^Subir backend\b/i.test(texto)) {
    return `Backend ${info.rotulo} — ${info.apiUrl} (já em execução; sem subir localhost:8005)`
  }
  if (/^Subir frontend\b/i.test(texto)) {
    return `Frontend ${info.rotulo} — ${info.uiUrl} (PLAYWRIGHT_BASE_URL; sem subir localhost:8000)`
  }
  if (/Confirmar servidor em `?localhost:8000`?/i.test(texto)) {
    return `Navegar em ${info.rotulo}: ${info.uiUrl}`
  }

  return texto
    .replace(/http:\/\/localhost:8005/g, info.apiUrl)
    .replace(/http:\/\/localhost:8000/g, info.uiUrl)
    .replace(/localhost:8005/g, info.apiUrl.replace(/^https?:\/\//, ''))
    .replace(/localhost:8000/g, info.uiUrl.replace(/^https?:\/\//, ''))
}
