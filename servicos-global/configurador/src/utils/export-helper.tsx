/**
 * export-helper.tsx — shim de retro-compatibilidade.
 *
 * O helper `getAcoesExportacaoPadrao` foi promovido para `@nucleo/export-utils`
 * em 2026-05-05. Este arquivo permanece como re-export para não quebrar os ~13
 * imports já existentes em `pages/admin` e `pages/workspace`.
 *
 * Para código novo, importe diretamente de `@nucleo/export-utils`.
 */

export { getAcoesExportacaoPadrao } from '@nucleo/export-utils'
