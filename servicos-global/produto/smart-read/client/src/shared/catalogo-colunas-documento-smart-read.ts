/**
 * Re-export SSOT — catálogo vive em shared/ (cópia do gerador).
 * Evita drift entre allowlist server e colunas editáveis no client.
 */
export {
  CATALOGO_COLUNAS_DOCUMENTO_SMART_READ,
  type ColunaDocumentoCatalogoSmartRead,
  type StatusMapeamentoColunaSmartRead,
  type TipoDocumentoSmartRead,
} from '../../../shared/catalogo-colunas-documento-smart-read'
