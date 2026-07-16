/**
 * SSOT — publicação da Gravity University (Manual + Academy) em produção.
 *
 * Decisão PO MASTER (Daniel Mendes, 2026-07-15):
 * - **Guia Gravity** (Academy `/academy/*`) — canal oficial de onboarding.
 * - **Manuais** (`/docs/*`) — fora da UI e de produção; código permanece no repo.
 *
 * Ver: documentos-tecnicos/produtos-gravity/university-gravity/PUBLICACAO-PRODUCAO.md
 */

/** Variável Vite — só `true` literal habilita University inteira em build de produção. */
export const ENV_UNIVERSITY_GRAVITY_PUBLICA = 'VITE_UNIVERSITY_GRAVITY_PUBLICA'

/** Variável Vite — só `true` literal exibe Manuais (`/docs`) no menu e dashboard. */
export const ENV_UNIVERSITY_MANUAIS_DOCS_PUBLICA = 'VITE_UNIVERSITY_MANUAIS_DOCS_PUBLICA'

/**
 * `true` quando Academy/Docs/Manual podem ser exibidos ao usuário logado.
 * Fail-closed: dev/local sempre on; produção só com flag explícita.
 */
export function universityGravityPublicada(): boolean {
  if (import.meta.env.DEV) return true
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') return true
  }
  return import.meta.env.VITE_UNIVERSITY_GRAVITY_PUBLICA === 'true'
}

/**
 * `true` quando a seção **Manuais** (`/docs/*`) aparece no menu e no dashboard.
 * Fail-closed em todos os ambientes — só `VITE_UNIVERSITY_MANUAIS_DOCS_PUBLICA=true`.
 * Para editar manuais localmente, defina a variável em `.env.local` (não commitar).
 */
export function universityManuaisDocsVisiveis(): boolean {
  return import.meta.env.VITE_UNIVERSITY_MANUAIS_DOCS_PUBLICA === 'true'
}
