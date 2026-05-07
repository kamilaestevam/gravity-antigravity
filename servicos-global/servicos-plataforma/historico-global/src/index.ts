// Componente <Historico /> removido em 2026-05-07 — UI de auditoria centralizada
// no Configurador (HistoricoGlobalAdmin para Gravity admins; HistoricoOrganizacao
// para Master/Standard/Fornecedor). Este pacote agora exporta apenas o cliente de
// escrita (auditLog) e o plugin Express usado pelos backends dos produtos.
export { auditLog } from './audit-client.js'
export type { AuditLogPayload } from './audit-client.js'
export { createProductAuditPlugin } from './product-audit-plugin.js'
export type { ProductAuditPluginOptions, AuditActorContext } from './product-audit-plugin.js'
