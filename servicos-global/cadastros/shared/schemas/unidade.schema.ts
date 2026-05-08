import { z } from 'zod'

/**
 * Validação Unidade — catálogo global.
 *
 * Categorias canônicas alinhadas com a Tabela Mestre ERP × uTrib (Siscomex)
 * × uCom (NF-e). 10 categorias cobrem o universo de medidas do Gravity:
 *   - peso         (G, KG, TON)
 *   - volume       (ML, LT, M3)
 *   - comprimento  (CM, M)
 *   - area         (CM2, M2)
 *   - contagem     (UN, PC, PARES, DUZIA, CENTO, MILHEI)
 *   - energia      (MWH)
 *   - gemas        (QUILAT)
 *   - agrupamento  (JOGO, CJ, KIT)
 *   - embalagem    (FRASCO, GALAO, BISNAG, ... ~30 tipos)
 *   - caixa        (CX, CX2, CX5, CX10, ... CX100)
 *
 * `quantidade` mantido por compat. — equivalente conceitual a `contagem`,
 * mas existe no histórico do banco. Novas unidades devem usar `contagem`.
 *
 * O schema.prisma define `tipo_unidade String` (sem enum), então o banco
 * aceita qualquer string. O enum vive aqui (Zod) e é o ponto único de
 * validação no boundary de API (POST/PUT). Quando expandir a lista,
 * atualizar também o `TipoUnidadeChip` em `CadastrosGlobaisAdmin.tsx`.
 */
export const tipoUnidadeEnum = z.enum([
  'peso',
  'volume',
  'comprimento',
  'area',
  'contagem',
  'energia',
  'gemas',
  'agrupamento',
  'embalagem',
  'caixa',
  'quantidade', // legado — equivalente a 'contagem'
])

export const unidadeSchema = z.object({
  codigo_unidade: z.string().min(1, 'codigo_unidade obrigatório').max(8, 'codigo_unidade tem no máximo 8 caracteres'),
  nome_unidade: z.string().min(1, 'nome_unidade obrigatório'),
  tipo_unidade: tipoUnidadeEnum,
  ativo_unidade: z.boolean(),
})

export const criarUnidadeSchema = unidadeSchema.extend({
  ativo_unidade: z.boolean().default(true),
})
export const atualizarUnidadeSchema = unidadeSchema.partial().omit({ codigo_unidade: true })

export type Unidade = z.infer<typeof unidadeSchema>
export type CriarUnidadeInput = z.infer<typeof criarUnidadeSchema>
export type AtualizarUnidadeInput = z.infer<typeof atualizarUnidadeSchema>
export type TipoUnidade = z.infer<typeof tipoUnidadeEnum>
