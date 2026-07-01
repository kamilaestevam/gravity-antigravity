/**
 * Grava valor em dados[caminho] (ex.: "document.documentNumber").
 * Caminhos com array ([]) não são persistidos inline.
 */
export function definirValorPorCaminhoDadosLeituraSmartRead(
  raiz: Record<string, unknown>,
  caminho: string,
  valor: string,
): boolean {
  if (caminho.includes('[')) return false
  const partes = caminho.split('.')
  let alvo: Record<string, unknown> = raiz
  for (let i = 0; i < partes.length - 1; i++) {
    const parte = partes[i]
    const atual = alvo[parte]
    if (typeof atual !== 'object' || atual === null || Array.isArray(atual)) {
      alvo[parte] = {}
    }
    alvo = alvo[parte] as Record<string, unknown>
  }
  const ultima = partes[partes.length - 1]
  if (!ultima) return false
  alvo[ultima] = valor
  return true
}
