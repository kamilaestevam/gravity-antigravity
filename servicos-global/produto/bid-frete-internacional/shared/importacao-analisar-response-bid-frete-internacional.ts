import { z } from 'zod'
import type {
  CampoImportacaoBidFreteInternacional,
  ColunaMapeadaBidFreteInternacional,
  LinhaImportacaoBidFreteInternacional,
} from './tipos-importacao-bid-frete-internacional'

const colunaMapeadaSchema = z.object({
  coluna_arquivo: z.string(),
  campo_sistema: z.string().nullable(),
  confianca: z.number(),
  nivel: z.enum(['auto', 'confirmado', 'ignorado']),
  inferido_por: z.enum(['rotulo', 'nome_interno', 'alias', 'dados', 'usuario']),
  valor_exemplo: z.string().nullable(),
})

export const analisarImportacaoBidResponseSchema = z.object({
  linhas: z.array(z.record(z.string())),
  mapeamento: z.array(colunaMapeadaSchema),
  confianca_global: z.number(),
  score_essenciais: z.number(),
  colunas_detectadas: z.array(z.string()),
  linhas_brutas: z.array(z.record(z.string())),
})

export type AnalisarImportacaoBidResponse = z.infer<typeof analisarImportacaoBidResponseSchema> & {
  linhas: LinhaImportacaoBidFreteInternacional[]
  mapeamento: ColunaMapeadaBidFreteInternacional[]
  colunas_detectadas: CampoImportacaoBidFreteInternacional[]
}
