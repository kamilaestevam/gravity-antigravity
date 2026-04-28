import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TenantCache } from '../../src/cache.js';
import type { TenantContext } from '../../src/types.js';

function makeCtx(overrides: Partial<TenantContext> = {}): TenantContext {
  return {
    tenantId: 'tenant-aaa',
    schemaName: 'tenant_aaa',
    userId: 'user-001',
    roles: ['PEDIDO_READ'],
    correlationId: 'corr-001',
    ...overrides,
  };
}

describe('TenantCache', () => {
  let cache: TenantCache;

  beforeEach(() => {
    cache = new TenantCache({ ttlMs: 5_000 });
  });

  // -------------------------------------------------------------------------
  describe('get / set básico', () => {
    it('retorna null para userId desconhecido', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('retorna o ctx após set', () => {
      const ctx = makeCtx();
      cache.set('user-001', ctx);
      expect(cache.get('user-001')).toEqual(ctx);
    });

    it('size() reflete o número de entradas', () => {
      expect(cache.size()).toBe(0);
      cache.set('user-001', makeCtx());
      cache.set('user-002', makeCtx({ userId: 'user-002' }));
      expect(cache.size()).toBe(2);
    });
  });

  // -------------------------------------------------------------------------
  describe('TTL — expiração', () => {
    it('retorna null após TTL expirar', async () => {
      cache = new TenantCache({ ttlMs: 10 }); // 10ms
      cache.set('user-001', makeCtx());

      await new Promise((r) => setTimeout(r, 20));

      expect(cache.get('user-001')).toBeNull();
    });

    it('evicção lazy limpa o size()', async () => {
      cache = new TenantCache({ ttlMs: 10 });
      cache.set('user-001', makeCtx());
      expect(cache.size()).toBe(1);

      await new Promise((r) => setTimeout(r, 20));
      cache.get('user-001'); // trigger lazy eviction

      expect(cache.size()).toBe(0);
    });

    it('não expira antes do TTL', () => {
      cache = new TenantCache({ ttlMs: 60_000 });
      const ctx = makeCtx();
      cache.set('user-001', ctx);
      expect(cache.get('user-001')).toEqual(ctx);
    });
  });

  // -------------------------------------------------------------------------
  describe('invalidateByTenant', () => {
    it('remove todos os usuários do tenant', () => {
      cache.set('user-001', makeCtx({ userId: 'user-001', tenantId: 'tenant-aaa' }));
      cache.set('user-002', makeCtx({ userId: 'user-002', tenantId: 'tenant-aaa' }));
      cache.set('user-003', makeCtx({ userId: 'user-003', tenantId: 'tenant-bbb', schemaName: 'tenant_bbb' }));

      cache.invalidateByTenant('tenant-aaa');

      expect(cache.get('user-001')).toBeNull();
      expect(cache.get('user-002')).toBeNull();
      // Outro tenant não afetado
      expect(cache.get('user-003')).not.toBeNull();
    });

    it('é idempotente para tenant inexistente', () => {
      expect(() => cache.invalidateByTenant('nao-existe')).not.toThrow();
    });

    it('size() é atualizado após invalidação', () => {
      cache.set('user-001', makeCtx({ userId: 'user-001' }));
      cache.set('user-002', makeCtx({ userId: 'user-002' }));
      expect(cache.size()).toBe(2);

      cache.invalidateByTenant('tenant-aaa');
      expect(cache.size()).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  describe('invalidateByUser', () => {
    it('remove apenas o usuário alvo', () => {
      cache.set('user-001', makeCtx({ userId: 'user-001' }));
      cache.set('user-002', makeCtx({ userId: 'user-002' }));

      cache.invalidateByUser('user-001');

      expect(cache.get('user-001')).toBeNull();
      expect(cache.get('user-002')).not.toBeNull();
    });

    it('é idempotente para userId inexistente', () => {
      expect(() => cache.invalidateByUser('nao-existe')).not.toThrow();
    });

    it('limpa índice reverso quando último usuário do tenant é removido', () => {
      cache.set('user-001', makeCtx({ userId: 'user-001' }));
      cache.invalidateByUser('user-001');

      // Tenant sem usuários não deve gerar erro ao tentar invalidar
      expect(() => cache.invalidateByTenant('tenant-aaa')).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  describe('troca de tenant do usuário', () => {
    it('atualiza índice reverso quando usuário muda de tenant', () => {
      cache.set('user-001', makeCtx({ userId: 'user-001', tenantId: 'tenant-aaa', schemaName: 'tenant_aaa' }));
      // Usuário muda para outro tenant (ex.: troca de workspace)
      cache.set('user-001', makeCtx({ userId: 'user-001', tenantId: 'tenant-bbb', schemaName: 'tenant_bbb' }));

      // Invalidar tenant antigo não deve afetar o usuário
      cache.invalidateByTenant('tenant-aaa');
      const ctx = cache.get('user-001');
      expect(ctx).not.toBeNull();
      expect(ctx!.tenantId).toBe('tenant-bbb');
    });
  });

  // -------------------------------------------------------------------------
  describe('TTL padrão', () => {
    it('usa 60_000ms por padrão', () => {
      const c = new TenantCache(); // sem opções
      vi.useFakeTimers();
      c.set('user-001', makeCtx());
      vi.advanceTimersByTime(59_999);
      expect(c.get('user-001')).not.toBeNull();
      vi.advanceTimersByTime(2);
      expect(c.get('user-001')).toBeNull();
      vi.useRealTimers();
    });
  });
});
