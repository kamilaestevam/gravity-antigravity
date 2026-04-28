import { z } from 'zod'

/**
 * Schema de resposta para OPE — somente leitura (escrita é prerrogativa do
 * job de sincronização Portal Único).
 */
export const opeSchema = z.object({
  suid_ope: z.string(),
  id_organizacao: z.string(),
  codigo_portal_unico_ope: z.string(),
  situacao_ope: z.string(),
  versao_ope: z.string(),
  nome_ope: z.string(),
  cnpj_raiz_empresa_ope: z.string(),
  pais_ope: z.string(),
  estado_ope: z.string().nullable(),
  cidade_ope: z.string().nullable(),
  endereco_ope: z.string().nullable(),
  zip_ope: z.string().nullable(),
  tin_ope: z.string().nullable(),
  email_ope: z.string().nullable(),
  ultima_sincronizacao_ope: z.string(),
  origem_ope: z.string(),
})

export type OPE = z.infer<typeof opeSchema>
