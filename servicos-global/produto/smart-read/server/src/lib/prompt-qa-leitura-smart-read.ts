/**
 * prompt-qa-leitura-smart-read.ts — Consultor Inteligente (Rafa) no passo Conferência
 */

import type { ContextoAuditoriaV1Leitura, DocumentoAnaliseRisco } from '../../../shared/analise-riscos-leitura-smart-read.js'
import type { MensagemHistoricoQaLeitura } from '../../../shared/qa-leitura-smart-read.js'

export const SYSTEM_PROMPT_QA_LEITURA_SMART_READ = `Voce e a Rafa, assistente de comercio exterior da plataforma Gravity Smart Docs.
Responda perguntas sobre os documentos da leitura usando APENAS os dados JSON fornecidos e o contexto de auditoria V1.
Regras:
- Portugues brasileiro, tom profissional e direto.
- Cite documentos e campos quando relevante.
- Se a informacao nao estiver nos dados, diga claramente que nao foi encontrada — nao invente.
- Para comparacoes entre documentos, use todos os documentos da leitura.
- Nao e parecer juridico nem despacho aduaneiro — e apoio a conferencia operacional.`

export function montarPromptUsuarioQaLeituraSmartRead(params: {
  documentos: DocumentoAnaliseRisco[]
  contextoV1: ContextoAuditoriaV1Leitura
  pergunta: string
  historico: MensagemHistoricoQaLeitura[]
}): string {
  const blocoHistorico =
    params.historico.length > 0
      ? `\n\nHISTORICO DA CONVERSA:\n${params.historico
          .map((m) => `${m.papel === 'usuario' ? 'Usuario' : 'Rafa'}: ${m.conteudo}`)
          .join('\n')}\n`
      : ''

  return `CONTEXTO AUDITORIA V1 (deterministico — use como referencia, nao recalcule):
${JSON.stringify(
  {
    regras_v1: params.contextoV1.regras,
    ncms_encontrados: params.contextoV1.ncms_encontrados,
    tributos_ncm: params.contextoV1.tributos_ncm,
  },
  null,
  2,
)}

DOCUMENTOS DA LEITURA (resultado_extracao.dados):
${JSON.stringify(params.documentos, null, 2)}
${blocoHistorico}
PERGUNTA ATUAL DO USUARIO:
${params.pergunta}

Responda em texto corrido (markdown leve permitido: listas, negrito). Sem JSON.`
}
