/**
 * translate.ts — Pipeline de tradução automática via Gemini API.
 *
 * Lê pt.json como fonte da verdade, compara com en.json e es.json,
 * identifica chaves ausentes ou desatualizadas, e envia APENAS as
 * chaves faltantes para a API do Gemini para tradução.
 *
 * Uso:
 *   npx tsx scripts/translate.ts            # traduz chaves faltantes
 *   npx tsx scripts/translate.ts --dry-run  # lista sem traduzir
 *
 * A chave da API deve estar em GEMINI_API_KEY no .env.local
 */

import fs from 'node:fs'
import path from 'node:path'

// ─── Configuração ────────────────────────────────────────────────────────

const LOCALES_DIR = path.resolve(
  import.meta.dirname,
  '../nucleo-global/Utilidades/Localization/locales'
)

const TARGET_LANGUAGES: Record<string, string> = {
  en: 'inglês',
  es: 'espanhol',
}

/**
 * Namespaces excluídos da tradução automática.
 * Chaves que começam com qualquer destes prefixos são ignoradas.
 */
const SKIP_NAMESPACES = ['admin.cockpit']

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
}

// ─── Utilidades de flatten/unflatten ─────────────────────────────────────

type FlatMap = Record<string, string>

function flatten(obj: Record<string, unknown>, prefix = ''): FlatMap {
  const result: FlatMap = {}
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value as Record<string, unknown>, fullKey))
    } else {
      result[fullKey] = String(value)
    }
  }
  return result
}

function unflatten(flat: FlatMap): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.')
    let current = result
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {}
      }
      current = current[parts[i]] as Record<string, unknown>
    }
    current[parts[parts.length - 1]] = value
  }
  return result
}

// ─── Detecção de chaves faltantes ────────────────────────────────────────

function isSkippedKey(key: string): boolean {
  return SKIP_NAMESPACES.some((ns) => key.startsWith(ns))
}

function findMissingKeys(source: FlatMap, target: FlatMap): FlatMap {
  const missing: FlatMap = {}
  for (const [key, value] of Object.entries(source)) {
    if (isSkippedKey(key)) continue
    if (!(key in target) || target[key] === '') {
      missing[key] = value
    }
  }
  return missing
}

function findExtraKeys(source: FlatMap, target: FlatMap): string[] {
  return Object.keys(target).filter(
    (key) => !(key in source) && !isSkippedKey(key)
  )
}

// ─── Chamada à API do Gemini ─────────────────────────────────────────────

async function translateWithGemini(
  texts: FlatMap,
  targetLang: string,
  apiKey: string
): Promise<FlatMap> {
  const prompt = `Traduza os seguintes textos de português para ${targetLang}. Retorne APENAS um JSON válido com as mesmas chaves. Preserve variáveis como {nome}, {valor}, {{count}}, tags HTML, e letras maiúsculas intencionais. Contexto: são textos de interface de uma plataforma SaaS de logística/comércio exterior.\n\n${JSON.stringify(texts, null, 2)}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Gemini API error (${response.status}): ${errorText.slice(0, 500)}`
    )
  }

  const data = await response.json()
  const rawText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  try {
    return JSON.parse(rawText) as FlatMap
  } catch {
    throw new Error(
      `Gemini retornou JSON inválido. Primeiros 500 chars: ${rawText.slice(0, 500)}`
    )
  }
}

// ─── Merge seguro (não sobrescreve existentes) ──────────────────────────

function mergeTranslations(
  existing: FlatMap,
  newTranslations: FlatMap
): FlatMap {
  const merged = { ...existing }
  for (const [key, value] of Object.entries(newTranslations)) {
    // Nunca sobrescreve tradução existente
    if (!(key in merged) || merged[key] === '') {
      merged[key] = value
    }
  }
  return merged
}

// ─── Batch: divide chaves em lotes para não exceder limites da API ──────

function batch<T>(items: T[], size: number): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size))
  }
  return batches
}

// ─── Main ────────────────────────────────────────────────────────────────

async function main() {
  const isDryRun = process.argv.includes('--dry-run')

  // Verificar API key
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey && !isDryRun) {
    console.error(
      '❌ GEMINI_API_KEY não definida. Defina em .env.local ou como variável de ambiente.'
    )
    console.error(
      '   Para apenas listar o que seria traduzido, use: --dry-run'
    )
    process.exit(1)
  }

  // Carregar pt.json (fonte da verdade)
  const ptPath = path.join(LOCALES_DIR, 'pt.json')
  const ptData = JSON.parse(fs.readFileSync(ptPath, 'utf-8'))
  const ptFlat = flatten(ptData)

  console.log(`\n📖 pt.json: ${Object.keys(ptFlat).length} chaves totais`)
  console.log(
    `🚫 Namespaces excluídos: ${SKIP_NAMESPACES.join(', ') || 'nenhum'}\n`
  )

  for (const [langCode, langName] of Object.entries(TARGET_LANGUAGES)) {
    const langPath = path.join(LOCALES_DIR, `${langCode}.json`)

    // Carregar arquivo existente ou criar vazio
    let existingData: Record<string, unknown> = {}
    if (fs.existsSync(langPath)) {
      existingData = JSON.parse(fs.readFileSync(langPath, 'utf-8'))
    }
    const existingFlat = flatten(existingData)

    // Encontrar chaves faltantes
    const missing = findMissingKeys(ptFlat, existingFlat)
    const extra = findExtraKeys(ptFlat, existingFlat)
    const missingCount = Object.keys(missing).length

    console.log(`── ${langCode.toUpperCase()} (${langName}) ──`)
    console.log(`   Existentes: ${Object.keys(existingFlat).length}`)
    console.log(`   Faltantes:  ${missingCount}`)
    console.log(`   Extras:     ${extra.length}`)

    if (extra.length > 0) {
      console.log(
        `   ⚠️  Chaves extras (não existem em pt.json): ${extra.slice(0, 5).join(', ')}${extra.length > 5 ? '...' : ''}`
      )
    }

    if (missingCount === 0) {
      console.log(`   ✅ Todas as chaves traduzidas!\n`)
      continue
    }

    if (isDryRun) {
      console.log(`   📋 Chaves que seriam traduzidas:`)
      for (const key of Object.keys(missing).slice(0, 20)) {
        console.log(`      - ${key}: "${missing[key]}"`)
      }
      if (missingCount > 20) {
        console.log(`      ... e mais ${missingCount - 20} chaves`)
      }
      console.log()
      continue
    }

    // Traduzir em lotes de 50 chaves
    console.log(`   🔄 Traduzindo ${missingCount} chaves via Gemini...`)

    const missingEntries = Object.entries(missing)
    const batches = batch(missingEntries, 50)
    let translated: FlatMap = {}

    for (let i = 0; i < batches.length; i++) {
      const batchMap = Object.fromEntries(batches[i])
      console.log(
        `      Lote ${i + 1}/${batches.length} (${batches[i].length} chaves)...`
      )

      try {
        const result = await translateWithGemini(
          batchMap,
          LANGUAGE_NAMES[langCode],
          apiKey!
        )
        translated = { ...translated, ...result }
      } catch (err) {
        console.error(
          `      ❌ Erro no lote ${i + 1}: ${err instanceof Error ? err.message : String(err)}`
        )
      }
    }

    // Merge e salvar
    const mergedFlat = mergeTranslations(existingFlat, translated)
    const mergedNested = unflatten(mergedFlat)

    fs.writeFileSync(langPath, JSON.stringify(mergedNested, null, 2) + '\n', 'utf-8')

    const translatedCount = Object.keys(translated).length
    console.log(
      `   ✅ ${translatedCount}/${missingCount} chaves traduzidas e salvas\n`
    )
  }

  console.log('🏁 Pipeline de tradução concluído.')
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
