/**
 * Observabilidade do SDK — spans + métricas + logging estruturado.
 *
 * Sprint 1: implementação leve — sem dependência de OTel ou prom-client.
 *   - getLogger()   → JSON para stderr (não bloqueia o caminho crítico).
 *   - recordSpan()  → no-op (plugável via OTel do produto consumidor no Sprint 2).
 *   - recordMetric() → no-op (plugável via prom-client no Sprint 2).
 *
 * Sprint 2: injeção de tracer/registry via `configureObservability(opts)`.
 */

export interface SpanAttributes {
  idOrganizacao?: string;
  idUsuario?: string;
  nomeSchema?: string;
  route?: string;
  idCorrelacao?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface SdkLogger {
  error(obj: Record<string, unknown>, msg: string): void;
  warn(obj: Record<string, unknown>, msg: string): void;
  info(obj: Record<string, unknown>, msg: string): void;
}

/** Singleton logger. Sprint 2: injetar pino via configureObservability(). */
let _logger: SdkLogger | null = null;

/**
 * Retorna o logger do SDK.
 *
 * Em produção escreve JSON em stderr com o prefixo do serviço para não
 * colidir com stdout da aplicação. Silencia level INFO em ambiente de teste
 * para não poluir a saída do vitest.
 */
export function getLogger(): SdkLogger {
  if (_logger !== null) return _logger;

  const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

  _logger = {
    error(obj, msg) {
      process.stderr.write(
        JSON.stringify({ level: 'error', service: '@gravity/resolver-organizacao', msg, ...obj }) + '\n',
      );
    },
    warn(obj, msg) {
      if (!isTest) {
        process.stderr.write(
          JSON.stringify({ level: 'warn', service: '@gravity/resolver-organizacao', msg, ...obj }) + '\n',
        );
      }
    },
    info(obj, msg) {
      if (!isTest) {
        process.stderr.write(
          JSON.stringify({ level: 'info', service: '@gravity/resolver-organizacao', msg, ...obj }) + '\n',
        );
      }
    },
  };

  return _logger;
}

/**
 * Registra um span de operação do SDK.
 *
 * Sprint 1: no-op não bloqueante — erros aqui não podem derrubar requests.
 * Sprint 2: plugar em `@opentelemetry/api` via `configureObservability()`.
 */
export function recordSpan(
  _name: string,
  _attributes: SpanAttributes,
  _durationMs: number,
): void {
  // Intencionalmente vazio. NÃO lançar exceção — observabilidade é auxiliar.
}

/**
 * Registra uma métrica (counter / histogram / gauge).
 *
 * Sprint 1: no-op não bloqueante.
 * Sprint 2: plugar em prom-client via `configureObservability()`.
 */
export function recordMetric(
  _name: string,
  _value: number,
  _labels: Record<string, string> = {},
): void {
  // Intencionalmente vazio. NÃO lançar exceção.
}

/**
 * Alias para compatibilidade com código que usa `emitSpan`.
 * @deprecated Usar `recordSpan`.
 */
export function emitSpan(
  name: string,
  attributes: SpanAttributes,
  durationMs: number,
): void {
  recordSpan(name, attributes, durationMs);
}

/** Reset de singleton — uso EXCLUSIVO em testes. */
export function _resetLoggerForTests(): void {
  _logger = null;
}
