/**
 * Helpers puros de persistência dos painéis da Lista (BID Frete Internacional).
 * Espelho de `pedido/shared/persistenciaListaPainel.ts` — sem import cross-produto.
 */

export interface OpcoesPersistirPainelLista {
  /**
   * Ação explícita do usuário (reordenar colunas, sort, toggle).
   * Libera PUT assim que há id do painel e config não está sendo aplicada —
   * não exige painelHidratadoId (evita perda silenciosa entre load e hidratação).
   */
  acaoUsuario?: boolean
}

export function podePersistirPainelLista(
  id: string | null,
  aplicandoConfig: boolean,
  painelHidratadoId: string | null,
  opcoes?: OpcoesPersistirPainelLista,
): id is string {
  if (!id || aplicandoConfig) return false
  if (opcoes?.acaoUsuario) return true
  return painelHidratadoId === id
}
