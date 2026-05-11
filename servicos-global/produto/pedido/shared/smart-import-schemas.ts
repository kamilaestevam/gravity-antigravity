/**
 * smart-import-schemas.ts — Contratos Zod do fluxo Smart Import (cross-tier)
 *
 * REGRA 06 + REGRA 09 dos 9 Mandamentos: validacao bilateral obrigatoria
 * entre server (envio) e client (recebimento) da resposta de POST /analisar.
 *
 * Importado por:
 *   - servicos-global/produto/pedido/server/src/routes/importacoes-inteligentes-pedido.ts
 *     -> valida o payload antes de devolver (defensive serialization)
 *   - servicos-global/produto/pedido/client/src/shared/api.ts
 *     -> .parse() a resposta antes de deixar a UI consumir
 *
 * Se este schema mudar, o commit DEVE atualizar tambem as interfaces
 * espelhadas em client/src/shared/types.ts (SmartImportPreview etc.) —
 * REGRA 07 (sincronia front+back).
 */

import { z } from 'zod'

// ── Atomicos ─────────────────────────────────────────────────────────────────

export const colunaMapeadaSchema = z.object({
  coluna_arquivo: z.string(),
  campo_sistema:  z.string().nullable(),
  confianca:      z.number(),
  nivel:          z.enum(['auto', 'confirmado', 'manual', 'ignorado']),
  inferido_por:   z.enum(['ia', 'dados', 'memoria', 'usuario']),
  exemplo_valor:  z.string().nullable().optional(),
})

export const smartImportAlertaSchema = z.object({
  campo:    z.string(),
  tipo:     z.enum([
    'obrigatorio_ausente',
    'formato_invalido',
    'valor_negativo',
    'duplicado_sistema',
    'duplicado_arquivo',
  ]),
  mensagem: z.string(),
  nivel:    z.enum(['aviso', 'erro']),
})

export const smartImportLinhaSchema = z.object({
  linha_arquivo: z.number(),
  numero_pedido: z.string().nullable(),
  status:        z.enum(['ok', 'aviso', 'erro']),
  alertas:       z.array(smartImportAlertaSchema),
  dados:         z.record(z.unknown()),
})

export const smartImportLinhaRawSchema = z.object({
  linha:   z.number(),
  valores: z.record(z.string()),
})

/** P2.4 — Conflito quando 2+ colunas apontam para o mesmo campo_sistema. */
export const conflitoMapeamentoSchema = z.object({
  campo_sistema:    z.string(),
  colunas_arquivo:  z.array(z.string()),
})

// ── Preview (resposta de POST /analisar) ─────────────────────────────────────

export const smartImportPreviewSchema = z.object({
  preview_id:           z.string(),
  total_linhas:         z.number(),
  total_pedidos:        z.number(),
  total_itens:          z.number(),
  mapeamento:           z.array(colunaMapeadaSchema),
  confianca_global:     z.number(),
  memoria_aplicada:     z.boolean(),
  linhas:               z.array(smartImportLinhaSchema),
  dados_brutos:         z.array(smartImportLinhaRawSchema).optional(),
  extrator_usado:       z.string().optional(),
  limite_excedido:      z.boolean().optional(),
  /** P2.4 — Lista de conflitos onde 2+ colunas apontam para o mesmo campo_sistema. */
  conflitos_mapeamento: z.array(conflitoMapeamentoSchema).optional(),
})

export type SmartImportPreviewParsed = z.infer<typeof smartImportPreviewSchema>
