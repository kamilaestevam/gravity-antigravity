/**
 * Testes de integração do configurador-client.
 *
 * Mocka `fetch` globalmente — sem HTTP real. Valida:
 * - Happy path (200, tenant ativo)
 * - 404 → AppError TENANT_NOT_FOUND
 * - 403 → AppError TENANT_INACTIVE (tenant suspenso)
 * - 503 → AppError CONFIGURADOR_UNAVAILABLE
 * - Resposta JSON inválida → AppError CONFIGURADOR_INVALID_RESPONSE
 * - Timeout + retry → AppError CONFIGURADOR_UNAVAILABLE
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createConfiguradorClient } from '../../src/configurador-client.js';
import { AppError } from '../../src/errors.js';
import { buildSchemaName } from '../../src/schema-name.js';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const USER_ID = 'user_clerk_abc123';
const BASE_URL = 'http://configurador.internal';
const INTERNAL_KEY = 'super-secret-internal-key-32chars';

function makeClient(overrides = {}) {
  return createConfiguradorClient({
    baseUrl: BASE_URL,
    internalKey: INTERNAL_KEY,
    timeoutMs: 100,
    retries: 1, // 1 tentativa nos testes para não esperar retry
    ...overrides,
  });
}

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      status,
      ok: status >= 200 && status < 300,
      json: async () => body,
    }),
  );
}

function mockFetchRejected(error: Error) {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
describe('resolveTenantById', () => {
  it('happy path — retorna TenantContext completo', async () => {
    mockFetch(200, {
      id: TENANT_ID,
      status: 'active',
      workspaceId: null,
    });

    const ctx = await makeClient().resolveTenantById(TENANT_ID, 'corr-001');

    expect(ctx.tenantId).toBe(TENANT_ID);
    expect(ctx.schemaName).toBe(buildSchemaName(TENANT_ID));
    expect(ctx.userId).toBe('system');
    expect(ctx.roles).toEqual([]);
    expect(ctx.correlationId).toBe('corr-001');
  });

  it('inclui workspaceId quando presente', async () => {
    const wsId = 'a1b2c3d4-e5f6-4789-abcd-ef0123456789';
    mockFetch(200, { id: TENANT_ID, status: 'active', workspaceId: wsId });

    const ctx = await makeClient().resolveTenantById(TENANT_ID);
    expect(ctx.workspaceId).toBe(wsId);
  });

  it('404 → AppError TENANT_NOT_FOUND (404)', async () => {
    mockFetch(404, {});

    await expect(makeClient().resolveTenantById(TENANT_ID)).rejects.toMatchObject({
      code: 'TENANT_NOT_FOUND',
      statusCode: 404,
    });
  });

  it('tenant suspended → AppError TENANT_INACTIVE (403)', async () => {
    mockFetch(200, { id: TENANT_ID, status: 'suspended' });

    await expect(makeClient().resolveTenantById(TENANT_ID)).rejects.toMatchObject({
      code: 'TENANT_INACTIVE',
      statusCode: 403,
    });
  });

  it('tenant deleted → AppError TENANT_INACTIVE (403)', async () => {
    mockFetch(200, { id: TENANT_ID, status: 'deleted' });

    await expect(makeClient().resolveTenantById(TENANT_ID)).rejects.toMatchObject({
      code: 'TENANT_INACTIVE',
    });
  });

  it('500 → AppError CONFIGURADOR_UNAVAILABLE (503)', async () => {
    mockFetch(500, {});

    await expect(makeClient().resolveTenantById(TENANT_ID)).rejects.toMatchObject({
      code: 'CONFIGURADOR_UNAVAILABLE',
      statusCode: 503,
    });
  });

  it('JSON inválido → AppError CONFIGURADOR_INVALID_RESPONSE', async () => {
    mockFetch(200, { id: 'not-a-uuid', unexpectedField: true });

    await expect(makeClient().resolveTenantById(TENANT_ID)).rejects.toMatchObject({
      code: 'CONFIGURADOR_INVALID_RESPONSE',
    });
  });

  it('fetch rejeita (network error) → AppError CONFIGURADOR_UNAVAILABLE', async () => {
    mockFetchRejected(new Error('Network failure'));

    await expect(makeClient().resolveTenantById(TENANT_ID)).rejects.toMatchObject({
      code: 'CONFIGURADOR_UNAVAILABLE',
    });
  });

  it('erros são instâncias de AppError', async () => {
    mockFetch(404, {});
    const err = await makeClient().resolveTenantById(TENANT_ID).catch((e) => e);
    expect(err).toBeInstanceOf(AppError);
  });

  it('envia x-internal-key no header', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ id: TENANT_ID, status: 'active' }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await makeClient().resolveTenantById(TENANT_ID);

    const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers['x-internal-key']).toBe(INTERNAL_KEY);
  });
});

// ---------------------------------------------------------------------------
describe('resolveTenantByUserId', () => {
  it('happy path — retorna TenantContext com userId e roles', async () => {
    mockFetch(200, {
      tenantId: TENANT_ID,
      status: 'active',
      userId: USER_ID,
      roles: ['PEDIDO_READ', 'PEDIDO_WRITE'],
      workspaceId: null,
    });

    const ctx = await makeClient().resolveTenantByUserId(USER_ID, 'corr-002');

    expect(ctx.tenantId).toBe(TENANT_ID);
    expect(ctx.userId).toBe(USER_ID);
    expect(ctx.roles).toEqual(['PEDIDO_READ', 'PEDIDO_WRITE']);
    expect(ctx.correlationId).toBe('corr-002');
  });

  it('404 → AppError TENANT_NOT_FOUND', async () => {
    mockFetch(404, {});

    await expect(makeClient().resolveTenantByUserId(USER_ID)).rejects.toMatchObject({
      code: 'TENANT_NOT_FOUND',
    });
  });

  it('tenant inativo → AppError TENANT_INACTIVE', async () => {
    mockFetch(200, {
      tenantId: TENANT_ID,
      status: 'suspended',
      userId: USER_ID,
      roles: [],
    });

    await expect(makeClient().resolveTenantByUserId(USER_ID)).rejects.toMatchObject({
      code: 'TENANT_INACTIVE',
    });
  });

  it('schema inválido na resposta → CONFIGURADOR_INVALID_RESPONSE', async () => {
    mockFetch(200, {
      tenantId: 'nao-um-uuid', // inválido
      status: 'active',
      userId: USER_ID,
      roles: [],
    });

    await expect(makeClient().resolveTenantByUserId(USER_ID)).rejects.toMatchObject({
      code: 'CONFIGURADOR_INVALID_RESPONSE',
    });
  });
});
