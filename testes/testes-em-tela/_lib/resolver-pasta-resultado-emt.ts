import { mkdirSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'

/** Raiz do escopo EMT (pai de plano-teste/ ou plano-de-teste/). */
export function resolverFeatureRootEmt(scriptDir: string): string {
  const nome = basename(scriptDir)
  if (nome === 'plano-teste' || nome === 'plano-de-teste') {
    return dirname(scriptDir)
  }
  return scriptDir
}

/**
 * Pasta de saída isolada por run EMT.
 * @param featureRoot — diretório do escopo (ex.: .../pedido/lista/editar-salvar)
 * @param runId — ID do disparo Admin ou fallback local
 */
export function resolverPastaResultadoEmt(featureRoot: string, runId?: string): string {
  const id = runId ?? process.env.EMT_RUN_ID ?? `local-${Date.now()}`
  const pasta = resolve(featureRoot, 'resultado-teste', id)
  mkdirSync(pasta, { recursive: true })
  return pasta
}

/** Caminho relativo ao monorepo (para emt_pasta no log). */
export function pastaResultadoEmtRelativa(
  monorepoRoot: string,
  featureRoot: string,
  runId: string,
): string {
  const abs = resolve(featureRoot, 'resultado-teste', runId)
  return abs.replace(/\\/g, '/').replace(`${monorepoRoot.replace(/\\/g, '/')}/`, '')
}
