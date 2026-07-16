/**
 * SSOT — visibilidade de seções da Gravity University.
 *
 * - **Academy** (`/university-gravity/academy/*`) — sempre acessível (autenticado).
 * - **Manuais** (`/university-gravity/docs/*`) — ocultos salvo flag explícita.
 *
 * Ver: documentos-tecnicos/produtos-gravity/university-gravity/PUBLICACAO-PRODUCAO.md
 */

/** Variável Vite — só `true` literal exibe Manuais (`/docs`) no menu e dashboard. */
export const ENV_UNIVERSITY_MANUAIS_DOCS_PUBLICA = 'VITE_UNIVERSITY_MANUAIS_DOCS_PUBLICA'

/**
 * `true` quando a seção **Manuais** (`/docs/*`) aparece no menu e no dashboard.
 * Fail-closed em todos os ambientes — só `VITE_UNIVERSITY_MANUAIS_DOCS_PUBLICA=true`.
 * Para editar manuais localmente, defina a variável em `.env.local` (não commitar).
 */
export function universityManuaisDocsVisiveis(): boolean {
  return import.meta.env.VITE_UNIVERSITY_MANUAIS_DOCS_PUBLICA === 'true'
}
