import { z } from 'zod'

/**
 * Schema de resposta para OPE — somente leitura (escrita é prerrogativa do
 * job de sincronização Portal Único).
 */
export const opeSchema = z.object({
  suid: z.string(),
  id_organizacao: z.string(),
  codigo_portal_unico: z.string(),
  situacao: z.string(),
  versao: z.string(),
  nome_ope: z.string(),
  cnpj_raiz_empresa: z.string(),
  pais: z.string(),
  estado: z.string().nullable(),
  cidade: z.string().nullable(),
  endereco: z.string().nullable(),
  zip: z.string().nullable(),
  tin: z.string().nullable(),
  email: z.string().nullable(),
  ultima_sincronizacao: z.string(),
  origem: z.string(),
})

export type OPE = z.infer<typeof opeSchema>
