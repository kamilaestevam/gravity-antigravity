/**
 * Reexport agregado dos schemas Zod do serviço Cadastros.
 *
 * Estes arquivos são CONTRATOS BILATERAIS (Mandamento 09):
 * server e client SDK importam exatamente daqui — não duplicar.
 */

export * from './fornecedor.schema.js'
/** @deprecated aliases empresa* — manter até consumidores migrarem para fornecedor* */
export * from './empresa.schema.js'
export * from './moeda.schema.js'
export * from './unidade.schema.js'
export * from './incoterm.schema.js'
export * from './ncm.schema.js'
export * from './ope.schema.js'
export * from './pais.schema.js'
export * from './preview-impacto.schema.js'
export * from './fornecedor-organizacao.schema.js'
