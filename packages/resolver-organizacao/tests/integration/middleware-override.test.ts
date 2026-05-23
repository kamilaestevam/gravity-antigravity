/**
 * Testes funcionais do middleware `resolverOrganizacao` — comportamento do
 * header `x-organizacao-override` (Pendência #4, Passo 8.5).
 *
 * Cobre os 6 cenários do plano:
 *  (a) sem header → fluxo padrão, sem override aplicado
 *  (b) admin (SUPER_ADMIN) + CUID válido + org ativa → ctx é mutado
 *  (c) não-admin com header → 403 OVERRIDE_NAO_AUTORIZADO
 *  (d) header com formato inválido → 400 OVERRIDE_FORMATO_INVALIDO
 *  (e) org alvo inativa → 403 ORGANIZACAO_INACTIVE (propagado pelo client)
 *  (f) Configurador indisponível → 503 CONFIGURADOR_UNAVAILABLE
 *
 * Mocka @clerk/backend.verifyToken, createConfiguradorClient e global fetch
 * (audit fire-and-forget é silenciado).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { resolverOrganizacao } from '../../src/middleware.js';
import { AppError } from '../../src/errors.js';
import { buildSchemaName } from '../../src/schema-name.js';
import type { ContextoOrganizacao } from '../../src/types.js';

// ---------------------------------------------------------------------------
// Constantes — CUIDs reais (regex `^c[a-z0-9]{24}$`)
// ---------------------------------------------------------------------------

const ID_ORG_ADMIN = 'cgravityadminorg00000aaaa';
const ID_ORG_ALVO  = 'cclientexyzalvo000000bbbb';
const ID_USUARIO   = 'cusrabcdef1234567890aaaaa';
const CLERK_SUB    = 'user_clerk_abc123';

const VALID_TOKEN = 'Bearer valid.jwt.token';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@clerk/backend', () => ({
  verifyToken: vi.fn(),
}));

// Mock factory do configuradorClient — cada teste sobrescreve o behavior
// dos métodos retornados via mockResolvedValue / mockRejectedValue.
const mockResolveByUsuario = vi.fn();
const mockResolveById      = vi.fn();

vi.mock('../../src/configurador-client.js', () => ({
  createConfiguradorClient: vi.fn(() => ({
    resolveOrganizacaoByIdUsuario: mockResolveByUsuario,
    resolveOrganizacaoById:        mockResolveById,
    verificarAcessoProduto:        vi.fn(),
    verificarPermissaoGranular:    vi.fn(),
    obterWorkspacesHabilitadosDoUsuario: vi.fn(),
    obterWorkspaces:               vi.fn(),
  })),
}));

import { verifyToken } from '@clerk/backend';
const mockVerifyToken = vi.mocked(verifyToken);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeConfig() {
  return {
    chaveProduto:        'pedido' as const,
    configuradorBaseUrl: 'http://configurador.internal',
    chaveInterna:        'super-secret-internal-key-32chars!!',
    clerkSecretKey:      'dummy-clerk-key-for-unit-tests',
  };
}

function makeReq(headers: Record<string, string> = {}): Request {
  return {
    headers: { authorization: VALID_TOKEN, ...headers },
    ip: '198.51.100.42',
    organizacao: undefined,
  } as unknown as Request;
}

function makeRes(): Response {
  return {} as Response;
}

function makeNext(): NextFunction & { mock: { calls: unknown[][] } } {
  return vi.fn() as unknown as NextFunction & { mock: { calls: unknown[][] } };
}

function ctxAdmin(tipo: 'SUPER_ADMIN' | 'ADMIN' = 'SUPER_ADMIN'): ContextoOrganizacao {
  return {
    idOrganizacao: ID_ORG_ADMIN,
    nomeSchema:    buildSchemaName(ID_ORG_ADMIN),
    idUsuario:     ID_USUARIO,
    tiposUsuario:  [tipo],
    idCorrelacao:  'corr-original',
  };
}

function ctxAlvo(): ContextoOrganizacao {
  return {
    idOrganizacao: ID_ORG_ALVO,
    nomeSchema:    buildSchemaName(ID_ORG_ALVO),
    idUsuario:     'system',
    tiposUsuario:  [],
    idCorrelacao:  'corr-alvo',
  };
}

// ---------------------------------------------------------------------------
beforeEach(() => {
  // Reset mocks
  mockVerifyToken.mockResolvedValue({ sub: CLERK_SUB } as unknown as Awaited<ReturnType<typeof verifyToken>>);
  mockResolveByUsuario.mockReset();
  mockResolveById.mockReset();

  // Silencia o fetch fire-and-forget do audit log — fora do escopo destes testes
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ ok: true }) }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Cenário (a) — sem header
// ---------------------------------------------------------------------------

describe('resolverOrganizacao — override de organização', () => {
  it('(a) sem header — fluxo padrão, ctx mantém org do ator', async () => {
    mockResolveByUsuario.mockResolvedValueOnce(ctxAdmin());

    const middleware = resolverOrganizacao(makeConfig());
    const req = makeReq();
    const next = makeNext();

    await middleware(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.organizacao?.idOrganizacao).toBe(ID_ORG_ADMIN);
    expect(req.organizacao?.idOrganizacaoOriginal).toBeUndefined();
    expect(mockResolveById).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Cenário (b) — admin + CUID válido + org ativa
  // ---------------------------------------------------------------------------

  it('(b) SUPER_ADMIN + CUID válido + org ativa → ctx mutado', async () => {
    mockResolveByUsuario.mockResolvedValueOnce(ctxAdmin('SUPER_ADMIN'));
    mockResolveById.mockResolvedValueOnce(ctxAlvo());

    const middleware = resolverOrganizacao(makeConfig());
    const req = makeReq({ 'x-organizacao-override': ID_ORG_ALVO });
    const next = makeNext();

    await middleware(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.organizacao?.idOrganizacao).toBe(ID_ORG_ALVO);
    expect(req.organizacao?.idOrganizacaoOriginal).toBe(ID_ORG_ADMIN);
    expect(req.organizacao?.nomeSchema).toBe(buildSchemaName(ID_ORG_ALVO));
    // tiposUsuario preservado (admin continua admin sob override — Mand. 04)
    expect(req.organizacao?.tiposUsuario).toEqual(['SUPER_ADMIN']);
    // workspace é zerado (admin escolherá outro no /hub da org alvo)
    expect(req.organizacao?.idWorkspace).toBeUndefined();
  });

  it('(b2) ADMIN também é aceito', async () => {
    mockResolveByUsuario.mockResolvedValueOnce(ctxAdmin('ADMIN'));
    mockResolveById.mockResolvedValueOnce(ctxAlvo());

    const middleware = resolverOrganizacao(makeConfig());
    const req = makeReq({ 'x-organizacao-override': ID_ORG_ALVO });
    const next = makeNext();

    await middleware(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.organizacao?.idOrganizacao).toBe(ID_ORG_ALVO);
  });

  it('(b3) override apontando para a própria org é idempotente (no-op)', async () => {
    mockResolveByUsuario.mockResolvedValueOnce(ctxAdmin('SUPER_ADMIN'));

    const middleware = resolverOrganizacao(makeConfig());
    const req = makeReq({ 'x-organizacao-override': ID_ORG_ADMIN });
    const next = makeNext();

    await middleware(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.organizacao?.idOrganizacao).toBe(ID_ORG_ADMIN);
    expect(req.organizacao?.idOrganizacaoOriginal).toBeUndefined();
    expect(mockResolveById).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Cenário (c) — não-admin com header → 403 OVERRIDE_NAO_AUTORIZADO
  // ---------------------------------------------------------------------------

  it.each([
    'MASTER',
    'PADRAO',
    'FORNECEDOR',
  ])('(c) tipoUsuario=%s com header → 403 OVERRIDE_NAO_AUTORIZADO', async (tipo) => {
    mockResolveByUsuario.mockResolvedValueOnce({
      ...ctxAdmin('SUPER_ADMIN'),
      tiposUsuario: [tipo],
    });

    const middleware = resolverOrganizacao(makeConfig());
    const req = makeReq({ 'x-organizacao-override': ID_ORG_ALVO });
    const next = makeNext();

    await middleware(req, makeRes(), next);

    const err = (next as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]?.[0] as AppError;
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe('OVERRIDE_NAO_AUTORIZADO');
    expect(err.statusCode).toBe(403);
    expect(mockResolveById).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Cenário (d) — header com formato inválido
  // ---------------------------------------------------------------------------

  it.each([
    ['nao-cuid', 'string arbitrária'],
    ['c123', 'CUID curto'],
    ['cAABBccDDeeFFgghhIIjjKKll', 'CUID com maiúsculas'],
    ['x1234567890abcdefghijklmn', 'CUID sem prefixo c'],
  ])('(d) header "%s" (%s) → 400 OVERRIDE_FORMATO_INVALIDO', async (header) => {
    mockResolveByUsuario.mockResolvedValueOnce(ctxAdmin('SUPER_ADMIN'));

    const middleware = resolverOrganizacao(makeConfig());
    const req = makeReq({ 'x-organizacao-override': header });
    const next = makeNext();

    await middleware(req, makeRes(), next);

    const err = (next as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]?.[0] as AppError;
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe('OVERRIDE_FORMATO_INVALIDO');
    expect(err.statusCode).toBe(400);
    expect(mockResolveById).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Cenário (e) — org alvo inativa
  // ---------------------------------------------------------------------------

  it('(e) org alvo INATIVA → erro propagado pelo client (403 ORGANIZACAO_INACTIVE)', async () => {
    mockResolveByUsuario.mockResolvedValueOnce(ctxAdmin('SUPER_ADMIN'));
    mockResolveById.mockRejectedValueOnce(
      new AppError('Organização inativa ou suspensa', 403, 'ORGANIZACAO_INACTIVE'),
    );

    const middleware = resolverOrganizacao(makeConfig());
    const req = makeReq({ 'x-organizacao-override': ID_ORG_ALVO });
    const next = makeNext();

    await middleware(req, makeRes(), next);

    const err = (next as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]?.[0] as AppError;
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe('ORGANIZACAO_INACTIVE');
    expect(err.statusCode).toBe(403);
  });

  // ---------------------------------------------------------------------------
  // Cenário (f) — Configurador indisponível
  // ---------------------------------------------------------------------------

  it('(f) Configurador indisponível → 503 CONFIGURADOR_UNAVAILABLE', async () => {
    mockResolveByUsuario.mockResolvedValueOnce(ctxAdmin('SUPER_ADMIN'));
    mockResolveById.mockRejectedValueOnce(
      new AppError('Configurador indisponível', 503, 'CONFIGURADOR_UNAVAILABLE'),
    );

    const middleware = resolverOrganizacao(makeConfig());
    const req = makeReq({ 'x-organizacao-override': ID_ORG_ALVO });
    const next = makeNext();

    await middleware(req, makeRes(), next);

    const err = (next as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]?.[0] as AppError;
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe('CONFIGURADOR_UNAVAILABLE');
    expect(err.statusCode).toBe(503);
  });

  // ---------------------------------------------------------------------------
  // Audit fire-and-forget — dispara fetch quando override é aceito
  // ---------------------------------------------------------------------------

  it('dispara POST de audit log quando override é aceito (fire-and-forget)', async () => {
    mockResolveByUsuario.mockResolvedValueOnce(ctxAdmin('SUPER_ADMIN'));
    mockResolveById.mockResolvedValueOnce(ctxAlvo());

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);

    const middleware = resolverOrganizacao(makeConfig());
    const req = makeReq({ 'x-organizacao-override': ID_ORG_ALVO });
    await middleware(req, makeRes(), makeNext());

    expect(fetchMock).toHaveBeenCalledWith(
      'http://configurador.internal/api/v1/internal/admin/audit-organizacao-override',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-chave-interna-servico': 'super-secret-internal-key-32chars!!',
        }),
      }),
    );

    const callArgs = fetchMock.mock.calls[0]?.[1] as { body: string };
    const body = JSON.parse(callArgs.body);
    expect(body).toMatchObject({
      id_usuario_ator:        ID_USUARIO,
      tipo_usuario_ator:      'SUPER_ADMIN',
      id_organizacao_origem:  ID_ORG_ADMIN,
      id_organizacao_destino: ID_ORG_ALVO,
    });
    expect(body.ip_origem).toBeTruthy();
    expect(body.correlation_id).toBeTruthy();
  });

  it('falha do audit log NÃO derruba a request (Mand. 08 — log alto, não throw)', async () => {
    mockResolveByUsuario.mockResolvedValueOnce(ctxAdmin('SUPER_ADMIN'));
    mockResolveById.mockResolvedValueOnce(ctxAlvo());

    // Audit fetch dá erro de rede
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    const middleware = resolverOrganizacao(makeConfig());
    const req = makeReq({ 'x-organizacao-override': ID_ORG_ALVO });
    const next = makeNext();

    await middleware(req, makeRes(), next);

    // Override aplicado mesmo com audit falhando
    expect(next).toHaveBeenCalledWith();
    expect(req.organizacao?.idOrganizacao).toBe(ID_ORG_ALVO);
  });
});
