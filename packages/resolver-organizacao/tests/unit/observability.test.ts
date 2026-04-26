import { describe, it, expect, afterEach } from 'vitest';
import {
  getLogger,
  recordSpan,
  recordMetric,
  emitSpan,
  _resetLoggerForTests,
} from '../../src/observability.js';

afterEach(() => {
  _resetLoggerForTests();
});

describe('getLogger', () => {
  it('retorna um objeto com error / warn / info', () => {
    const log = getLogger();
    expect(typeof log.error).toBe('function');
    expect(typeof log.warn).toBe('function');
    expect(typeof log.info).toBe('function');
  });

  it('error() não lança exceção', () => {
    expect(() =>
      getLogger().error({ tenantId: 'abc', code: 'ERR' }, 'mensagem de erro'),
    ).not.toThrow();
  });

  it('warn() não lança exceção', () => {
    expect(() =>
      getLogger().warn({ tenantId: 'abc' }, 'aviso'),
    ).not.toThrow();
  });

  it('info() não lança exceção', () => {
    expect(() =>
      getLogger().info({ route: '/test' }, 'info'),
    ).not.toThrow();
  });

  it('retorna o mesmo singleton em chamadas consecutivas', () => {
    const a = getLogger();
    const b = getLogger();
    expect(a).toBe(b);
  });

  it('_resetLoggerForTests força criação de novo singleton', () => {
    const a = getLogger();
    _resetLoggerForTests();
    const b = getLogger();
    // Após reset, são instâncias diferentes
    expect(a).not.toBe(b);
  });
});

describe('recordSpan', () => {
  it('não lança exceção com atributos válidos', () => {
    expect(() =>
      recordSpan('tenant_resolver.with_tenant', { tenantId: 'abc', correlationId: 'xyz' }, 42),
    ).not.toThrow();
  });

  it('não lança exceção com atributos vazios', () => {
    expect(() => recordSpan('noop', {}, 0)).not.toThrow();
  });

  it('retorna undefined', () => {
    expect(recordSpan('test', {}, 1)).toBeUndefined();
  });
});

describe('recordMetric', () => {
  it('não lança exceção', () => {
    expect(() =>
      recordMetric('tenant_resolver_cache_hits_total', 1, { product: 'pedido' }),
    ).not.toThrow();
  });

  it('não lança exceção sem labels', () => {
    expect(() => recordMetric('some_metric', 42)).not.toThrow();
  });

  it('retorna undefined', () => {
    expect(recordMetric('test', 1)).toBeUndefined();
  });
});

describe('emitSpan (alias legado)', () => {
  it('não lança exceção', () => {
    expect(() => emitSpan('legacy_span', { tenantId: 'abc' }, 10)).not.toThrow();
  });
});
