/**
 * Testes unitários — Dashboard / widget-registry
 * Valida CATALOG_WIDGETS (48 itens), getWidgetsForProduct, getWidgetsForUser, findWidget.
 */

import { describe, it, expect } from 'vitest'
import {
  CATALOG_WIDGETS,
  getWidgetsForProduct,
  getWidgetsForUser,
  findWidget,
} from '../../../servicos-global/tenant/dashboard/server/lib/widget-registry.js'
import type { CatalogWidget } from '../../../servicos-global/tenant/dashboard/server/lib/catalog.js'
import { DATA_CATALOG } from '../../../servicos-global/tenant/dashboard/server/lib/catalog.js'

// ---------------------------------------------------------------------------
// Testes do WIDGET_REGISTRY
// ---------------------------------------------------------------------------

describe('CATALOG_WIDGETS', () => {
  // ── 1 ──────────────────────────────────────────────────────────────────
  it('should have 48 widgets total', () => {
    expect(CATALOG_WIDGETS).toHaveLength(48)
  })

  // ── 2 ──────────────────────────────────────────────────────────────────
  it('every widget should have required properties (id, title, productId, chartType, querySpec)', () => {
    for (const widget of CATALOG_WIDGETS) {
      expect(widget).toHaveProperty('id')
      expect(widget).toHaveProperty('title')
      expect(widget).toHaveProperty('productId')
      expect(widget).toHaveProperty('chartType')
      expect(widget).toHaveProperty('querySpec')
      expect(typeof widget.id).toBe('string')
      expect(widget.id.length).toBeGreaterThan(0)
      expect(typeof widget.title).toBe('string')
      expect(widget.title.length).toBeGreaterThan(0)
      expect(typeof widget.productId).toBe('string')
      expect(widget.productId.length).toBeGreaterThan(0)
      expect(typeof widget.chartType).toBe('string')
      expect(widget.querySpec).toBeDefined()
      expect(Array.isArray(widget.querySpec.fields)).toBe(true)
    }
  })

  // ── 3 ──────────────────────────────────────────────────────────────────
  it('every widget id should be unique', () => {
    const ids = CATALOG_WIDGETS.map((w: CatalogWidget) => w.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})

// ---------------------------------------------------------------------------
// Testes de getWidgetsForProduct
// ---------------------------------------------------------------------------

describe('getWidgetsForProduct', () => {
  // ── 4 ──────────────────────────────────────────────────────────────────
  it('should return only widgets for specified product', () => {
    const result = getWidgetsForProduct('bid-frete')
    for (const widget of result) {
      expect(widget.productId).toBe('bid-frete')
    }
  })

  // ── 5 ──────────────────────────────────────────────────────────────────
  it('should return empty array for unknown product', () => {
    const result = getWidgetsForProduct('produto-inexistente-xyz')
    expect(result).toEqual([])
  })

  // ── 6 ──────────────────────────────────────────────────────────────────
  it('should return correct count for bid-cambio (6 widgets)', () => {
    const result = getWidgetsForProduct('bid-cambio')
    expect(result).toHaveLength(6)
  })
})

// ---------------------------------------------------------------------------
// Testes de getWidgetsForUser
// ---------------------------------------------------------------------------

describe('getWidgetsForUser', () => {
  // ── 7 ──────────────────────────────────────────────────────────────────
  it('should return widgets whose fields are covered by permissions', () => {
    // Grant bid-cambio:read which covers all bid-cambio fields in DATA_CATALOG
    const bidCambioPermission = 'bid-cambio:read'
    const result = getWidgetsForUser([bidCambioPermission])

    // All returned widgets must have all their fields allowed
    const allowedKeys = new Set(
      DATA_CATALOG
        .filter(f => f.permission === bidCambioPermission)
        .map(f => f.key)
    )

    expect(result.length).toBeGreaterThan(0)
    for (const widget of result) {
      for (const field of widget.querySpec.fields) {
        expect(allowedKeys.has(field)).toBe(true)
      }
    }
  })

  // ── 8 ──────────────────────────────────────────────────────────────────
  it('empty permissions → empty result', () => {
    const result = getWidgetsForUser([])
    expect(result).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Testes de findWidget
// ---------------------------------------------------------------------------

describe('findWidget', () => {
  // ── 9 ──────────────────────────────────────────────────────────────────
  it('should find widget by id', () => {
    const widget = findWidget('bid-cambio.saving_total')
    expect(widget).toBeDefined()
    expect(widget?.id).toBe('bid-cambio.saving_total')
    expect(widget?.productId).toBe('bid-cambio')
    expect(widget?.chartType).toBe('KPI_CARD')
  })

  // ── 10 ─────────────────────────────────────────────────────────────────
  it('should return undefined for unknown id', () => {
    const widget = findWidget('id-que-nao-existe-99999')
    expect(widget).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Validação de formato dos campos querySpec
// ---------------------------------------------------------------------------

describe('querySpec fields format', () => {
  // ── 11 ─────────────────────────────────────────────────────────────────
  it('all fields should follow productId.metricName format', () => {
    // Pattern: at least one non-dot character, a dot, then at least one non-dot character
    const fieldPattern = /^[^.]+\.[^.]+$/

    for (const widget of CATALOG_WIDGETS) {
      for (const field of widget.querySpec.fields) {
        expect(field).toMatch(fieldPattern)
      }
    }
  })
})
