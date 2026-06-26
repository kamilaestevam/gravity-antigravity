// Registry de produtos
export { PRODUTO_META, getProdutoMeta } from './LogoProdutoGlobal'
export type { ProdutoMeta } from './LogoProdutoGlobal'
export {
  resolverSlugProdutoGravity,
  corOficialProdutoGravity,
  corOficialProdutoDim,
} from './cores-produto-gravity'
export {
  iconeOficialProdutoGravity,
  iconeOficialBidFreteInternacional,
  DIM_PRODUTO_HUB_CARD,
} from './icone-produto-gravity'
export type { IconeProdutoGravityOptions } from './icone-produto-gravity'
export {
  TAMANHO_ICONE_PRODUTO_HUB,
  visualProdutoGravityHub,
  visualProdutoGravityFallback,
} from './visual-produto-gravity'
export type { VisualProdutoGravity } from './visual-produto-gravity'

// Logos das zonas do sistema
export { LogoGravity }        from './logos/LogoGravity'
export { LogoHub }            from './logos/LogoHub'
export { LogoCore }           from './logos/LogoCore'
export { LogoConfigurador }   from './logos/LogoConfigurador'
export { LogoAdmin }          from './logos/LogoAdmin'

// Logos dos produtos COMEX
export { LogoSimulaCusto }    from './logos/LogoSimulaCusto'
export { LogoPedido }         from './logos/LogoPedido'
export { LogoBidCambio }      from './logos/LogoBidCambio'
export { LogoBidFrete }       from './logos/LogoBidFrete'
export { LogoLpco }           from './logos/LogoLpco'
export { LogoNfImportacao }   from './logos/LogoNfImportacao'
export { LogoProcesso }       from './logos/LogoProcesso'
export { LogoFinanceiroComex } from './logos/LogoFinanceiroComex'
export { LogoSmartDocs }      from './logos/LogoSmartDocs'
/** @deprecated alias — use LogoSmartDocs */
export { LogoSmartRead }      from './logos/LogoSmartRead'
