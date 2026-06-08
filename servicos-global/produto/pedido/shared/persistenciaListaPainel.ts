/**
 * Helpers puros de persistência dos painéis da Lista (Pedido).
 * Sem dependências React — testáveis unitariamente.
 */

export function podePersistirPainelLista(
  id: string | null,
  aplicandoConfig: boolean,
  painelHidratadoId: string | null,
): id is string {
  return Boolean(id && !aplicandoConfig && painelHidratadoId === id)
}
