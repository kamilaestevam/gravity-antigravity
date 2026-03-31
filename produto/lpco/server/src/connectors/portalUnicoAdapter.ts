/**
 * portalUnicoAdapter.ts — Adapter bidirecional com API do Portal Unico Siscomex
 *
 * Operacoes:
 * - Registrar LPCO (importacao/exportacao)
 * - Consultar status
 * - Responder exigencia
 * - Anexar documento
 * - Simular tratamento administrativo
 *
 * Autenticacao via strategy pattern (portalUnicoAuth.ts)
 */

import { PortalUnicoAuth } from './portalUnicoAuth.js'

export class PortalUnicoAdapter {
  private auth: PortalUnicoAuth

  constructor() {
    this.auth = new PortalUnicoAuth()
  }

  // TODO: implementar registrar, consultar, responder, anexar, simularTA
}
