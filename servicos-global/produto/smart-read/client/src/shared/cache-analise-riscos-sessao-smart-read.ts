/**
 * cache-analise-riscos-sessao-smart-read.ts — evita requisição duplicada (prefetch + aba Riscos)
 */

import type { AnaliseRiscosLeituraResponse } from '../../../shared/analise-riscos-leitura-smart-read'

const cache = new Map<string, AnaliseRiscosLeituraResponse>()

export function obterCacheAnaliseRiscosSessaoSmartRead(
  chave: string,
): AnaliseRiscosLeituraResponse | null {
  return cache.get(chave) ?? null
}

export function salvarCacheAnaliseRiscosSessaoSmartRead(
  chave: string,
  resposta: AnaliseRiscosLeituraResponse,
): void {
  cache.set(chave, resposta)
}

export function limparCacheAnaliseRiscosSessaoSmartRead(): void {
  cache.clear()
}
