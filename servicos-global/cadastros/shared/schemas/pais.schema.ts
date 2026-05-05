import { z } from 'zod'

/**
 * Pais — fonte única da verdade para país no monorepo Gravity.
 *
 * 251 países seedeados de planilha consolidada (RFB + BACEN + SPED + ISO).
 * Toda entidade que referencia país no Gravity deve apontar para `id_pais`
 * (lookup lógico cross-banco — sem FK física pois entidades vivem em DBs
 * distintos: Empresa em Cadastros, Workspace em Configurador, AgenteCarga
 * em organizacao-shared, etc.).
 *
 * Lei: skills/governanca/lei/cadastros-snapshot-policy/SKILL.md
 *
 * Schema-contrato BILATERAL (Mandamento 09): mesma fonte para backend (rota
 * GET /api/v1/cadastros/paises) e frontend (hook usePaises).
 */

export const paisSchema = z.object({
  id_pais:                            z.string(),
  nome_pais_portugues:                z.string(),
  nome_pais_ingles:                   z.string(),
  codigo_pais_portal_unico_siscomex:  z.string().nullable(),
  codigo_pais_bacen_4:                z.string().nullable(),
  codigo_pais_bacen_5:                z.string().nullable(),
  codigo_pais_sped_nfe:               z.string().nullable(),
  codigo_pais_sped_efd:               z.string().nullable(),
  codigo_pais_iso_alpha2:             z.string().nullable(),
  codigo_pais_iso_alpha3:             z.string().nullable(),
  codigo_pais_iso_numerico:           z.string().nullable(),
  ativo_pais:                         z.boolean(),
})

export const listaPaisesSchema = z.object({
  itens: z.array(paisSchema),
  total: z.number().int().nonnegative(),
})

export type Pais = z.infer<typeof paisSchema>
export type ListaPaises = z.infer<typeof listaPaisesSchema>
