/**
 * nucleo-global/vite-aliases.ts
 *
 * Gera aliases do Vite automaticamente a partir da estrutura de pastas do nucleo-global.
 * Importar em cada vite.config.ts para eliminar duplicação de aliases manuais.
 *
 * Uso:
 *   import { createNucleoAliases, createServiceAliases } from '../../../nucleo-global/vite-aliases'
 *   // ou ajuste o path relativo conforme a localização do vite.config.ts
 *
 *   export default defineConfig({
 *     resolve: {
 *       alias: {
 *         ...createNucleoAliases(monorepoRoot),
 *         ...createServiceAliases(monorepoRoot),
 *       },
 *     },
 *   })
 */

import { readdirSync, existsSync } from 'fs'
import path from 'path'

// Categorias que contêm componentes com estrutura: Categoria/componente/src/index.ts
const NUCLEO_CATEGORIES = [
  'Botoes',
  'Campos',
  'Composicao',
  'Configuracoes',
  'Dashboard',
  'Feedback',
  'Gabi',
  'Kanban',
  'Layout',
  'Login',
  'Logo',
  'Mensageria Global',
  'Modais',
  'Tabelas',
  'Templates',
  'Utilidades',
]

/**
 * Aliases especiais que NÃO seguem o padrão Categoria/componente/src/index.ts.
 * Manter atualizado manualmente quando componentes fora do padrão forem criados.
 */
function getSpecialAliases(nucleoRoot: string): Record<string, string> {
  return {
    // Utilidades sem src/index.ts
    '@nucleo/export-utils': path.resolve(nucleoRoot, 'Utilidades/export-utils/exportUtils.ts'),
    '@nucleo/Utilidades/localization/i18n': path.resolve(nucleoRoot, 'Utilidades/Localization/i18n.ts'),
    '@nucleo/Utilidades/localization/provider': path.resolve(nucleoRoot, 'Utilidades/Localization/provider.tsx'),

    // Sub-export do Dashboard
    '@nucleo/query-builder-global': path.resolve(nucleoRoot, 'Dashboard/dashboard-global/src/QueryBuilder/QueryBuilder.tsx'),

    // Modal com alias diferente do nome da pasta
    '@nucleo/modal-campo-select-global': path.resolve(nucleoRoot, 'Modais/modal-select-global/src/index.ts'),

    // Tokens (estrutura flat, sem subpasta)
    '@nucleo/tokens': path.resolve(nucleoRoot, 'Tokens/index.ts'),
  }
}

/**
 * Escaneia nucleo-global e gera aliases @nucleo/<componente> automaticamente.
 *
 * Para cada Categoria/componente/src/index.ts encontrado, cria:
 *   '@nucleo/<componente>' → '<nucleoRoot>/Categoria/componente/src/index.ts'
 *
 * @param monorepoRoot — caminho absoluto da raiz do monorepo
 */
export function createNucleoAliases(monorepoRoot: string): Record<string, string> {
  const nucleoRoot = path.resolve(monorepoRoot, 'nucleo-global')
  const aliases: Record<string, string> = {}

  for (const category of NUCLEO_CATEGORIES) {
    const categoryPath = path.resolve(nucleoRoot, category)
    if (!existsSync(categoryPath)) continue

    let entries: string[]
    try {
      entries = readdirSync(categoryPath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    } catch {
      continue
    }

    for (const component of entries) {
      // Ignorar pastas demo/ e node_modules/
      if (component === 'demo' || component === 'node_modules') continue

      const indexPath = path.resolve(categoryPath, component, 'src/index.ts')
      if (existsSync(indexPath)) {
        aliases[`@nucleo/${component}`] = indexPath
      }
    }
  }

  // Adicionar aliases especiais (sobrescrevem se houver conflito)
  Object.assign(aliases, getSpecialAliases(nucleoRoot))

  return aliases
}

/**
 * Gera aliases para serviços compartilhados (@shell, @tenant, @produto, @gravity/shell).
 *
 * @param monorepoRoot — caminho absoluto da raiz do monorepo
 */
export function createServiceAliases(monorepoRoot: string): Record<string, string> {
  return {
    '@gravity/shell': path.resolve(monorepoRoot, 'servicos-global/shell/index.ts'),
    '@shell': path.resolve(monorepoRoot, 'servicos-global/shell'),
    '@tenant': path.resolve(monorepoRoot, 'servicos-global/tenant'),
    '@produto': path.resolve(monorepoRoot, 'servicos-global/produto'),
  }
}

/**
 * Aliases para serviços tenant específicos (quando o produto importa um módulo
 * diretamente, ex: @tenant/historico, @tenant/gabi).
 *
 * @param monorepoRoot — caminho absoluto da raiz do monorepo
 * @param services — lista de nomes de serviços tenant a incluir
 */
export function createTenantAliases(
  monorepoRoot: string,
  services: string[],
): Record<string, string> {
  const aliases: Record<string, string> = {}
  for (const svc of services) {
    aliases[`@tenant/${svc}`] = path.resolve(monorepoRoot, `servicos-global/tenant/${svc}`)
  }
  return aliases
}
