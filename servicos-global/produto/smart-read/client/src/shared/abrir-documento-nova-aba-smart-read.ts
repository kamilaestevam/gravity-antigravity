/**
 * abrir-documento-nova-aba-smart-read.ts — paridade DATI: PDF/anexo em nova aba do navegador.
 */

/** Abre URL em nova aba (gesto do usuário). Retorna null se pop-up bloqueado. */
export function abrirDocumentoNovaAba(url: string): Window | null {
  return window.open(url, '_blank', 'noopener,noreferrer')
}

/** Reserva aba vazia no clique — necessário antes de fetch assíncrono do blob remoto. */
export function reservarAbaDocumento(): Window | null {
  return window.open('about:blank', '_blank', 'noopener,noreferrer')
}

/** Navega aba reservada para a URL do documento. */
export function navegarAbaDocumento(aba: Window, url: string): void {
  try {
    aba.location.replace(url)
  } catch {
    aba.close()
    abrirDocumentoNovaAba(url)
  }
}

export const MENSAGEM_POPUP_BLOQUEADO_SMART_READ =
  'Não foi possível abrir nova aba. Permita pop-ups para este site ou use o preview na tela.'
