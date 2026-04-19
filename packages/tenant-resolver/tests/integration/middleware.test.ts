/**
 * Testes de integração do middleware `tenantResolver`.
 *
 * Mocka @clerk/backend.verifyToken e configurador-client.
 * Valida os 10 passos do fluxo (ADR-002 §5).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { tenantResolver } from '../../src/middleware.js';
import { AppError } from '../../src/errors.js';
import { buildSchemaName } from '../../src/schema-name.js';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const USER_ID = 'user_clerk_abc123';
const VALID_TOKEN = 'Bearer valid.jwt.token';

vi.mock('@clerk/backend', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('../../src/configurador-client.js', () => ({
  createConfiguradorClient: vi.fn(() => ({
    resolveTenantByUserId: vi.fn(async (_userId: string, correlationId?: string) => ({
      tenantId: TENANT_ID,
      schemaName: buildSchemaName(TENANT_ID),
      userId: USER_ID,
      roles: ['PEDIDO_READ'],
      correlationId: correlationId ?? 'mock-corr',
    })),
    resolveTenantById: vi.fn(),
  })),
}));

import { verifyToken } from '@clerk/backend';
import { createConfiguradorClient } from '../../src/configurador-client.js';

const mockVerifyToken = vi.mocked(verifyToken);
const mockCreateClient = vi.mocked(createConfiguradorClient);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeConfig() {
  return {
    productKey: 'pedido' as const,
    configuradorBaseUrl: 'http://configurador.internal',
    internalKey: 'super-secret-internal-key-32chars!!',
    clerkSecretKey: 'sk_test_fakeclerkkey',
  };
}

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: { authorization: VALID_TOKEN },
    tenant: undefined,
    ...overrides,
  } as unknown as Request;
}

function makeRes(): Response {
  return {} as Response;
}

function makeNext(): NextFunction {
  return vi.fn() as unknown as NextFunction;
}

// ---------------------------------------------------------------------------
beforeEach(() => {
  mockVerifyToken.mockResolvedValue({ sub: USER_ID } as ReturnType<typeof verifyToken> extends Promise<infer T> ? T : never);
});

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
describe('tenantResolver — bootstrap', () => {
  it('lança Error síncrono se configuradorBaseUrl for inválida', () => {
    expect(() =>
      tenantResolver({ ...makeConfig(), configuradorBaseUrl: 'not-a-url' }),
    ).toThrow(/Configuração inválida/i);
  });

  it('lança Error síncrono se internalKey for curta demais', () => {
    expect(() =>
      tenantResolver({ ...makeConfig(), internalKey: 'curta' }),
    ).toThrow(/Configuração inválida/i);
  });

  it('lança Error síncrono se clerkSecretKey for ausente', () => {
    // Remove env var para garantir ausência
    const orig = process.env.CLERK_SECRET_KEY;
    delete process.env.CLERK_SECRET_KEY;

    expect(() =>
      tenantResolver({ ...makeConfig(), clerkSecretKey: undefined }),
    ).toThrow(/clerkSecretKey/i);

    process.env.CLERK_SECRET_KEY = orig;
  });
});

// ---------------------------------------------------------------------------
describe('tenantResolver — happy path', () => {
  it('popula req.tenant e chama next() sem erro', async () => {
    const middleware = tenantResolver(makeConfig());
    const req = makeReq();
    const next = makeNext();

    await middleware(req, makeRes(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(/* sem argumento = sem erro */);
    expect(req.tenant).toBeDefined();
    expect(req.tenant!.tenantId).toBe(TENANT_ID);
    expect(req.tenant!.userId).toBe(USER_ID);
    expect(req.tenant!.roles).toEqual(['PEDIDO_READ']);
    expect(typeof req.tenant!.correlationId).toBe('string');
  });

  it('schemaName é válido', async () => {
    const middleware = tenantResolver(makeConfig());
    const req = makeReq();
    await middleware(req, makeRes(), makeNext());
    expect(req.tenant!.schemaName).toBe(buildSchemaName(TENANT_ID));
  });

  it('correlationId é UUID único por request', async () => {
    const middleware = tenantResolver(makeConfig());
    const req1 = makeReq();
    const req2 = makeReq();
    await middleware(req1, makeRes(), makeNext());
    await middleware(req2, makeRes(), makeNext());
    expect(req1.tenant!.correlationId).not.toBe(req2.tenant!.correlationId);
  });
});

// ---------------------------------------------------------------------------
describe('tenantResolver — erros de autenticação', () => {
  it('sem Authorization header → next(AppError 401 UNAUTHENTICATED)', async () => {
    const middleware = tenantResolver(makeConfig());
    const req = makeReq({ headers: {} });
    const next = makeNext();

    await middleware(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'UNAUTHENTICATED', statusCode: 401 }),
    );
  });

  it('header sem "Bearer " → next(AppError 401)', async () => {
    const middleware = tenantResolver(makeConfig());
    const req = makeReq({ headers: { authorization: 'Token abc' } });
    const next = makeNext();

    await middleware(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'UNAUTHENTICATED' }),
    );
  });

  it('verifyToken lança → next(AppError 401)', async () => {
    mockVerifyToken.mockRejectedValueOnce(new Error('invalid token'));

    const middleware = tenantResolver(makeConfig());
    const req = makeReq();
    const next = makeNext();

    await middleware(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'UNAUTHENTICATED', statusCode: 401 }),
    );
  });
});

// ---------------------------------------------------------------------------
describe('tenantResolver — erros do Configurador', () => {
  it('TENANT_NOT_FOUND → next(AppError) propagado', async () => {
    const middleware = tenantResolver(makeConfig());
    const mockClient = mockCreateClient.mock.results[mockCreateClient.mock.results.length - 1]!.value;
    vi.mocked(mockClient.resolveTenantByUserId).mockRejectedValueOnce(
      new AppError('not found', 404, 'TENANT_NOT_FOUND'),
    );

    const req = makeReq();
    const next = makeNext();

    await middleware(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'TENANT_NOT_FOUND' }),
    );
  });

  it('TENANT_INACTIVE → next(AppError) propagado', async () => {
    const middleware = tenantResolver(makeConfig());
    const mockClient = mockCreateClient.mock.results[mockCreateClient.mock.results.length - 1]!.value;
    vi.mocked(mockClient.resolveTenantByUserId).mockRejectedValueOnce(
      new AppError('inactive', 403, 'TENANT_INACTIVE'),
    );

    const req = makeReq();
    const next = makeNext();

    await middleware(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'TENANT_INACTIVE' }),
    );
  });
});

// ---------------------------------------------------------------------------
describe('tenantResolver — cache', () => {
  it('segunda request do mesmo userId não chama resolveTenantByUserId', async () => {
    const middleware = tenantResolver(makeConfig());
    const mockClient = mockCreateClient.mock.results[mockCreateClient.mock.results.length - 1]?.value;
    const resolveSpy = vi.mocked(mockClient.resolveTenantByUserId);

    await middleware(makeReq(), makeRes(), makeNext());
    await middleware(makeReq(), makeRes(), makeNext());

    // Segundo request usa cache — só 1 chamada ao Configurador
    expect(resolveSpy).toHaveBeenCalledTimes(1);
  });
});
