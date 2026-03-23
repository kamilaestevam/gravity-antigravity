// src/index.ts
// Exportações públicas do pacote @tenant/conector-erp.
// Produtos importam este arquivo para consumir o conector como serviço.

// Tipos e interfaces públicos
export type { ODataCredentials, ODataRequestOptions, ODataResponse } from '../server/services/odata-client.js'
export type { ErpQueryResult } from '../server/services/erp-client.js'
export type { CircuitState, CircuitBreakerOptions } from '../server/lib/circuit-breaker.js'
export type { RetryOptions } from '../server/lib/retry.js'

// Exportar rotas para uso em produto (importar e registrar em app.use)
export { default as erpRoutes } from '../server/index.js'
