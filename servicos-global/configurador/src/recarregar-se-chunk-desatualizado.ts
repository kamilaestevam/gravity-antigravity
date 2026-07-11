/**
 * Após deploy, o index.html em cache pode apontar para chunks JS antigos (hash mudou).
 * O navegador falha com "Failed to fetch dynamically imported module" até o usuário
 * dar refresh manual. Recarrega uma vez automaticamente nesse cenário.
 */

const CHAVE_RECARGA_CHUNK = 'gravity:chunk-reload-pendente'

const PADROES_ERRO_CHUNK =
  /Failed to fetch dynamically imported module|Loading chunk \d+ failed|Importing a module script failed|error loading dynamically imported module/i

export function ehErroChunkDesatualizado(mensagem: string): boolean {
  return PADROES_ERRO_CHUNK.test(mensagem)
}

export function tentarRecarregarPorChunkDesatualizado(): boolean {
  if (sessionStorage.getItem(CHAVE_RECARGA_CHUNK) === '1') return false
  sessionStorage.setItem(CHAVE_RECARGA_CHUNK, '1')
  window.location.reload()
  return true
}

export function registrarRecargaAutomaticaChunkDesatualizado(): void {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    tentarRecarregarPorChunkDesatualizado()
  })

  window.addEventListener('load', () => {
    sessionStorage.removeItem(CHAVE_RECARGA_CHUNK)
  })
}
