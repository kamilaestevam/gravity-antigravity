/**
 * documentGenerator.ts — DOCX Template Engine
 * Gera a "Memória de Cálculo" oficial em formato editável (DOCX).
 * Skill: antigravity-simulacusto (Geração de PDF/DOCX)
 */

import { createReport } from 'docx-templates'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface ExportData {
  ncm: string
  landedCost: string
  ii: string
  ipi: string
  pis: string
  cofins: string
  icms: string
  va: string
  ptax: string
  data: string
  moeda: string
}

export async function generateCalcMemory(data: ExportData): Promise<Buffer> {
  const templatePath = join(__dirname, '..', '..', 'templates', 'memoria_calculo.docx')

  try {
    const template = readFileSync(templatePath)

    const report = await createReport({
      template,
      data,
      cmdDelimiter: ['{', '}'],
    })

    return Buffer.from(report)
  } catch {
    // Fallback texto se template DOCX não existir ainda
    return Buffer.from(
      `MEMÓRIA DE CÁLCULO — SIMULACUSTO\n` +
      `NCM: ${data.ncm}\n` +
      `Data: ${data.data}\n` +
      `Valor Aduaneiro: ${data.va} (${data.moeda} @ PTAX ${data.ptax})\n` +
      `II: ${data.ii}\n` +
      `IPI: ${data.ipi}\n` +
      `PIS: ${data.pis}\n` +
      `COFINS: ${data.cofins}\n` +
      `ICMS: ${data.icms}\n` +
      `Landed Cost Total: ${data.landedCost}`
    )
  }
}
