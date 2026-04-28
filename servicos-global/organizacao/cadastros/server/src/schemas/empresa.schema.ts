/**
 * Reexporte dos schemas oficiais — fonte canônica em
 * `servicos-global/tenant/cadastros/shared/schemas/empresa.schema.ts`.
 *
 * Mantemos este arquivo como ponte para não quebrar imports relativos
 * antigos. Novos consumidores devem importar de `../../../shared/schemas`.
 */
export * from '../../../shared/schemas/empresa.schema.js'
