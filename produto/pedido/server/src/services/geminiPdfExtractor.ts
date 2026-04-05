/**
 * geminiPdfExtractor.ts — Extração de dados de invoice PDF via Gemini
 *
 * PROVISÓRIO — para testes. Ativar via GEMINI_PDF_ENABLED=true no .env
 *
 * Fluxo:
 *   1. Recebe Buffer do PDF
 *   2. Envia para Gemini como inline data (base64)
 *   3. Prompt estruturado pede JSON com todos os itens da invoice
 *   4. Retorna LinhaArquivo[] — mesmo formato dos outros parsers
 *
 * Fallback automático para parsePdfText se:
 *   - GEMINI_API_KEY não definida
 *   - GEMINI_PDF_ENABLED !== 'true'
 *   - Gemini retornar erro ou JSON inválido
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { LinhaArquivo } from './importEngine.js'

// ── Config ────────────────────────────────────────────────────────────────────

const GEMINI_API_KEY      = process.env.GEMINI_API_KEY ?? ''
const GEMINI_PDF_ENABLED  = process.env.GEMINI_PDF_ENABLED === 'true'

// Modelo mais barato para extração estruturada — ~$0.001/documento
const MODEL = 'gemini-2.0-flash'

// ── Tipos internos ────────────────────────────────────────────────────────────

interface InvoiceItem {
  invoice_number?:  string
  invoice_date?:    string
  shipper?:         string
  manufacturer?:    string
  incoterms?:       string
  currency?:        string
  payment_terms?:   string
  po_number?:       string
  code?:            string
  description?:     string
  unit?:            string
  quantity?:        string | number
  unit_price?:      string | number
  total_amount?:    string | number
  customs_tariff?:  string
  net_weight?:      string | number
}

// ── Prompt ────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é um extrator especializado em invoices comerciais de importação/exportação.
Extraia TODOS os itens de linha do documento e retorne APENAS um JSON array válido, sem texto adicional.

Cada item do array deve ter estes campos (use null se não encontrar):
- invoice_number: número da invoice/fatura
- invoice_date: data da invoice (formato original do documento)
- shipper: nome do exportador/fornecedor
- manufacturer: fabricante (se diferente do shipper)
- incoterms: termos de entrega (ex: FOB, EX WORKS, CIF)
- currency: moeda (ex: EUR, USD)
- payment_terms: condições de pagamento
- po_number: número do pedido de compra do cliente (Your ref / PO number)
- code: código/part number do item
- description: descrição do item
- unit: unidade de medida (ex: PZ, UN, KG)
- quantity: quantidade
- unit_price: preço unitário (número)
- total_amount: valor total do item (número)
- customs_tariff: código NCM/HS (ex: 8413.9100)
- net_weight: peso líquido do item se disponível

IMPORTANTE:
- Repita os campos de cabeçalho (invoice_number, shipper, currency, etc.) em CADA item
- Inclua TODOS os itens de linha, de todas as páginas
- Retorne SOMENTE o JSON array, sem markdown, sem explicações`

// ── Extrator principal ────────────────────────────────────────────────────────

export async function extrairPdfComGemini(
  buffer: Buffer,
): Promise<{ linhas: LinhaArquivo[]; tokensUsados: number; custoUsd: number } | null> {
  if (!GEMINI_PDF_ENABLED || !GEMINI_API_KEY) {
    return null
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: MODEL })

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: buffer.toString('base64'),
        },
      },
    ])

    const usage = result.response.usageMetadata
    const tokensUsados = (usage?.promptTokenCount ?? 0) + (usage?.candidatesTokenCount ?? 0)
    const custoUsd = calcularCusto(
      usage?.promptTokenCount ?? 0,
      usage?.candidatesTokenCount ?? 0,
    )

    const texto = result.response.text().trim()

    // Limpar possíveis markdown fences do output
    const jsonBruto = texto
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const itens: InvoiceItem[] = JSON.parse(jsonBruto)

    if (!Array.isArray(itens) || itens.length === 0) {
      console.warn('[GeminiPDF] JSON retornado não é array ou está vazio')
      return null
    }

    const linhas: LinhaArquivo[] = itens.map(item =>
      Object.fromEntries(
        Object.entries(mapearCampos(item)).map(([k, v]) => [k, String(v ?? '')])
      )
    )

    console.info(
      `[GeminiPDF] Extraídos ${linhas.length} itens | ${tokensUsados} tokens | $${custoUsd.toFixed(5)}`
    )

    return { linhas, tokensUsados, custoUsd }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[GeminiPDF] Falhou — usando parser fallback. Erro: ${msg}`)
    return null
  }
}

// ── Mapear campos Gemini → campos do sistema Pedido ──────────────────────────

function mapearCampos(item: InvoiceItem): Record<string, string | number | null> {
  return {
    // Cabeçalho da invoice
    numero_pedido:          item.po_number        ?? item.invoice_number ?? null,
    exportador:             item.shipper           ?? null,
    fabricante:             item.manufacturer      ?? null,
    incoterm:               item.incoterms         ?? null,
    moeda_pedido:           item.currency          ?? null,
    data_emissao_pedido:    item.invoice_date      ?? null,

    // Itens
    part_number:            item.code              ?? null,
    descricao:              item.description       ?? null,
    unidade:                item.unit              ?? null,
    quantidade_inicial_item_pedido: item.quantity  ?? null,
    valor_unitario:         item.unit_price        ?? null,
    valor_item:             item.total_amount      ?? null,
    ncm:                    item.customs_tariff    ?? null,

    // Metadados (para exibição na etapa de mapeamento)
    _invoice_number:        item.invoice_number    ?? null,
    _payment_terms:         item.payment_terms     ?? null,
    _net_weight:            item.net_weight        ?? null,
  }
}

// ── Cálculo de custo ──────────────────────────────────────────────────────────

const PRICING: Record<string, { input: number; output: number }> = {
  'gemini-2.0-flash': { input: 0.075, output: 0.30 },
  'gemini-2.5-flash': { input: 0.15,  output: 0.60 },
}

function calcularCusto(tokensIn: number, tokensOut: number): number {
  const p = PRICING[MODEL] ?? { input: 0.15, output: 0.60 }
  return (tokensIn * p.input + tokensOut * p.output) / 1_000_000
}

// ── Export da flag para uso no importEngine ───────────────────────────────────

export const geminiPdfAtivo = GEMINI_PDF_ENABLED && Boolean(GEMINI_API_KEY)
