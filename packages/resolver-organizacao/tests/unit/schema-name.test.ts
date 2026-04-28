/**
 * Testes unitários de `buildSchemaName` / `isValidSchemaName`.
 * Padrão de ID: CUID v1 (@default(cuid()) do Prisma) — 25 chars, começa com 'c'.
 */

import { describe, expect, it } from 'vitest';
import {
  buildSchemaName,
  isValidSchemaName,
  SCHEMA_NAME_REGEX,
} from '../../src/schema-name.js';
import { AppError } from '../../src/errors.js';

describe('buildSchemaName', () => {
  describe('aceita CUIDs válidos', () => {
    it('CUID real do banco de teste', () => {
      const id = 'cmngiwl0n00011097dok8jcmo';
      expect(buildSchemaName(id)).toBe('tenant_cmngiwl0n00011097dok8jcmo');
    });

    it('CUID genérico válido', () => {
      const id = 'clh7z2k0f0000ld08gxyz1234';
      expect(buildSchemaName(id)).toBe('tenant_clh7z2k0f0000ld08gxyz1234');
    });

    it('produz schema que casa com SCHEMA_NAME_REGEX', () => {
      const id = 'cmngiwl0n00011097dok8jcmo';
      const name = buildSchemaName(id);
      expect(SCHEMA_NAME_REGEX.test(name)).toBe(true);
    });

    it('schema resultante começa com tenant_c', () => {
      const id = 'cmngiwl0n00011097dok8jcmo';
      expect(buildSchemaName(id).startsWith('tenant_c')).toBe(true);
    });

    it('schema resultante tem 32 chars (tenant_ + 25)', () => {
      const id = 'cmngiwl0n00011097dok8jcmo';
      expect(buildSchemaName(id).length).toBe('tenant_'.length + 25);
    });
  });

  describe('rejeita IDs inválidos', () => {
    it('string vazia', () => {
      expect(() => buildSchemaName('')).toThrow(AppError);
      expect(() => buildSchemaName('')).toThrow(/inválido/i);
    });

    it('rejeita undefined / não-string', () => {
      // @ts-expect-error — testando guard runtime
      expect(() => buildSchemaName(undefined)).toThrow(AppError);
      // @ts-expect-error — testando guard runtime
      expect(() => buildSchemaName(null)).toThrow(AppError);
      // @ts-expect-error — testando guard runtime
      expect(() => buildSchemaName(123)).toThrow(AppError);
    });

    it('rejeita ID manual legado (tenant-dev-001)', () => {
      expect(() => buildSchemaName('tenant-dev-001')).toThrow(AppError);
    });

    it('rejeita UUID (formato antigo)', () => {
      expect(() =>
        buildSchemaName('550e8400-e29b-41d4-a716-446655440000'),
      ).toThrow(AppError);
      expect(() =>
        buildSchemaName('550e8400e29b41d4a716446655440000'),
      ).toThrow(AppError);
    });

    it('rejeita CUID com tamanho errado (< 25)', () => {
      expect(() => buildSchemaName('cmngiwl0n')).toThrow(AppError);
    });

    it('rejeita CUID com tamanho errado (> 25)', () => {
      expect(() => buildSchemaName('cmngiwl0n00011097dok8jcmoXXX')).toThrow(AppError);
    });

    it('rejeita string que não começa com c', () => {
      expect(() => buildSchemaName('amngiwl0n00011097dok8jcmo')).toThrow(AppError);
    });

    it('rejeita uppercase', () => {
      expect(() => buildSchemaName('CMNGIWL0N00011097DOK8JCMO')).toThrow(AppError);
    });

    it('SQL injection attempt', () => {
      expect(() =>
        buildSchemaName('"; DROP SCHEMA public CASCADE; --'),
      ).toThrow(AppError);
    });

    it('lança AppError com code INVALID_TENANT_ID e statusCode 400', () => {
      try {
        buildSchemaName('tenant-dev-001');
        expect.fail('deveria ter lançado');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe('INVALID_TENANT_ID');
        expect((err as AppError).statusCode).toBe(400);
      }
    });
  });
});

describe('isValidSchemaName', () => {
  it('aceita schemaName CUID válido', () => {
    expect(isValidSchemaName('tenant_cmngiwl0n00011097dok8jcmo')).toBe(true);
  });

  it('rejeita prefixo errado', () => {
    expect(isValidSchemaName('public')).toBe(false);
    expect(isValidSchemaName('tnt_cmngiwl0n00011097dok8jcmo')).toBe(false);
  });

  it('rejeita schema no formato UUID antigo', () => {
    expect(isValidSchemaName('tenant_550e8400e29b41d4a716446655440000')).toBe(false);
  });

  it('rejeita não-string', () => {
    // @ts-expect-error — testando guard runtime
    expect(isValidSchemaName(undefined)).toBe(false);
    // @ts-expect-error — testando guard runtime
    expect(isValidSchemaName(null)).toBe(false);
  });
});
