# Testes do Sistema de Idiomas

## Visão Geral

| Tipo | Framework | Quantidade | Comando |
|------|-----------|-----------|---------|
| Unitários | Vitest + React Testing Library | 33 testes | `npm test` |
| E2E | Playwright | 7 cenários | `npm run test:e2e` |
| Todos | — | 40 total | `npm run test:all` |

---

## Testes Unitários (33/33 passando)

### Configuração

```
testes/testes-unitarios/i18n/
├── vitest.config.ts              ← Config isolada (jsdom, react plugin)
├── translate-script.test.ts      ← 9 testes
├── messages-integrity.test.ts    ← 13 testes
└── language-switcher.test.tsx    ← 11 testes
```

O `vitest.config.ts` usa environment `jsdom` e o plugin `@vitejs/plugin-react` para suportar JSX nos testes do LanguageSwitcher.

---

### translate-script.test.ts (9 testes)

Valida a lógica interna do pipeline de tradução.

| # | Teste | O que valida |
|---|-------|-------------|
| 1 | Detecta chaves ausentes quando en.json está incompleto | `findMissingKeys()` encontra gaps corretamente |
| 2 | Não inclui chaves que já existem no target | Chaves presentes são ignoradas |
| 3 | Detecta chaves com valor vazio como faltantes | String vazia `""` é tratada como ausente |
| 4 | Ignora chaves do namespace admin.cockpit | `SKIP_NAMESPACES` funciona — chaves cockpit não são reportadas |
| 5 | Merge preserva traduções existentes | `mergeTranslations()` nunca sobrescreve valor existente |
| 6 | Arquivos de tradução existem e são legíveis | pt/en/es.json existem no path correto, são JSON válido |
| 7 | Variáveis devem estar presentes nos valores fonte | `{{count}}`, `{{nome}}` são detectados no pt.json |
| 8 | Variáveis em pt.json devem existir também em en.json | Se pt tem `{{count}}`, en também deve ter `{{count}}` |
| 9 | Script deve exigir GEMINI_API_KEY | O código contém a validação e `process.exit(1)` |

---

### messages-integrity.test.ts (13 testes)

Valida a integridade e completude dos 3 arquivos JSON.

| # | Teste | O que valida |
|---|-------|-------------|
| 1 | en.json contém todas as chaves traduzíveis de pt.json | Zero chaves faltantes em inglês |
| 2 | es.json contém todas as chaves traduzíveis de pt.json | Zero chaves faltantes em espanhol |
| 3 | en.json não tem valores vazios | Nenhuma string vazia em en.json |
| 4 | es.json não tem valores vazios | Nenhuma string vazia em es.json |
| 5 | en.json não tem valores longos idênticos ao PT | Strings >12 chars iguais indicam falha de tradução (threshold: <25) |
| 6 | en.json não tem chaves extras que não existem em pt.json | Sem chaves órfãs/lixo |
| 7 | es.json não tem chaves extras que não existem em pt.json | Sem chaves órfãs/lixo |
| 8 | Chaves admin.cockpit.* existem em pt.json com valor não vazio | Namespace PT-only está presente e preenchido |
| 9 | Nenhuma chave admin.cockpit.* existe em en.json | Exclusão do pipeline funciona (EN) |
| 10 | Nenhuma chave admin.cockpit.* existe em es.json | Exclusão do pipeline funciona (ES) |
| 11 | pt.json é JSON válido com pelo menos 500 chaves | Estrutura não foi corrompida |
| 12 | en.json tem o mesmo número de chaves traduzíveis que pt.json | 924 = 950 - 26 cockpit |
| 13 | es.json tem o mesmo número de chaves traduzíveis que pt.json | 924 = 950 - 26 cockpit |

**Sobre o teste #5 (valores idênticos):** Até ~25 strings longas podem ser idênticas entre PT e EN porque são termos técnicos internacionais que não mudam (ex: "Gravity Store", "Deploy Railway", "Rate Limiting", "Client Secret", "Timestamp ISO", "Incoterm").

---

### language-switcher.test.tsx (11 testes)

Valida o componente visual de troca de idioma.

| # | Grupo | Teste | O que valida |
|---|-------|-------|-------------|
| 1 | Renderização | Renderiza com idioma atual | Componente monta e mostra "PT" |
| 2 | Renderização | Abre dropdown ao clicar | Listbox aparece no DOM |
| 3 | Renderização | Renderiza 3 opções de idioma | PT, EN, ES com labels "Português", "English", "Español" |
| 4 | Idioma ativo | Idioma ativo tem aria-selected=true | Acessibilidade ARIA correta |
| 5 | Idioma ativo | Idioma ativo tem classe CSS "active" | Feedback visual de seleção |
| 6 | Troca | Clicar EN muda para inglês | `i18n.language === 'en'` |
| 7 | Troca | Clicar ES muda para espanhol | `i18n.language === 'es'` |
| 8 | Troca | Salva no localStorage | `gravity:language` = "en" |
| 9 | Troca | Atualiza document.lang | `<html lang="es">` |
| 10 | Troca | Dropdown fecha após seleção | Listbox some do DOM |
| 11 | Troca | Trigger mostra novo código | Botão exibe "EN" após trocar |

---

## Testes E2E (Playwright)

### Pré-requisito

O Configurador deve estar rodando em `http://localhost:5010`:

```bash
npm run dev
```

### Configuração

Os testes E2E estão em `testes/testes-e2e/i18n/` e usam o projeto `i18n` definido em `playwright.config.ts`:

```typescript
{
  name: 'i18n',
  testDir: './testes/testes-e2e/i18n',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:5010',
  },
}
```

---

### language-routing.spec.ts (4 cenários)

| # | Teste | O que valida |
|---|-------|-------------|
| 1 | Raiz carrega em português | `html[lang]="pt"`, switcher mostra "PT" |
| 2 | Trocar para EN exibe inglês | `html[lang]="en"`, termos em inglês visíveis (Settings, Dashboard, etc.) |
| 3 | Trocar para ES exibe espanhol | `html[lang]="es"`, termos em espanhol visíveis (Configuración, etc.) |
| 4 | Troca mantém mesma página | URL não muda ao trocar idioma em `/dashboard` |

---

### language-persistence.spec.ts (3 cenários)

| # | Teste | O que valida |
|---|-------|-------------|
| 1 | Navegar mantém idioma | Troca EN → navega `/historico` → ainda EN |
| 2 | Reload mantém idioma | Troca ES → F5 → ainda ES |
| 3 | Back/forward mantém idioma | Troca EN → navega → back → forward → ainda EN |

---

### no-missing-translations.spec.ts (7 cenários)

Verifica que nenhuma chave crua (ex: `"shell.menu.dashboard"`) aparece na interface.

| # | Idioma | Rota | O que valida |
|---|--------|------|-------------|
| 1 | PT | /dashboard | Sem chaves cruas visíveis |
| 2 | PT | /configurador | Sem chaves cruas visíveis |
| 3 | EN | /dashboard | Sem chaves cruas visíveis |
| 4 | EN | /configurador | Sem chaves cruas visíveis |
| 5 | ES | /dashboard | Sem chaves cruas visíveis |
| 6 | ES | /configurador | Sem chaves cruas visíveis |
| 7 | PT | /admin/apis | Admin Cockpit sem chaves cruas (PT-only) |

**Detecção de chaves cruas:** O teste usa um regex `\b[a-z][a-z0-9]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]+` para encontrar padrões como `shell.menu.dashboard` no texto visível da página. Falsos positivos (URLs, emails) são filtrados.

---

## Como Rodar

```bash
# Unitários (rápido, não precisa de app rodando)
npm test

# E2E (precisa do app rodando em localhost:5010)
npm run test:e2e

# Todos juntos
npm run test:all

# E2E apenas o projeto i18n
npx playwright test --project=i18n

# E2E com UI do Playwright
npx playwright test --project=i18n --ui

# Unitários com modo watch
npx vitest --config testes/testes-unitarios/i18n/vitest.config.ts
```
