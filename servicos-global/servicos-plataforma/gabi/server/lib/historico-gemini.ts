// Normalização do histórico para Google Gemini startChat.
// Gemini exige que o primeiro turno tenha role 'user', não 'model'.

export interface HistoricoTurno {
  role: string
  content: string
}

export type GeminiHistoryEntry = {
  role: 'user' | 'model'
  parts: [{ text: string }]
}

function mapearRoleGemini(role: string): 'user' | 'model' {
  if (role === 'assistant' || role === 'model') return 'model'
  return 'user'
}

/** Filtra system, mapeia roles e remove turnos model iniciais órfãos. */
export function normalizarHistoricoGemini(historico: HistoricoTurno[]): GeminiHistoryEntry[] {
  const turnos = historico
    .filter((h) => h.role !== 'system' && h.content.trim().length > 0)
    .map((h) => ({
      role: mapearRoleGemini(h.role),
      content: h.content,
    }))

  let inicio = 0
  while (inicio < turnos.length && turnos[inicio].role === 'model') {
    inicio++
  }

  return turnos.slice(inicio).map((h) => ({
    role: h.role,
    parts: [{ text: h.content }],
  }))
}
