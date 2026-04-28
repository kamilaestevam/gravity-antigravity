# Arquitetura Técnica do Sistema de Idiomas

## Stack

| Componente | Tecnologia | Versão | Função |
|------------|-----------|--------|--------|
| Motor i18n | i18next | ^26.0.1 | Gerencia traduções, interpolação de variáveis, fallback |
| Binding React | react-i18next | ^17.0.1 | Hook `useTranslation()`, `<I18nextProvider>` |
| Tradução automática | Gemini API 2.0 Flash | — | Traduz chaves novas de PT para EN/ES |
| Executor de scripts | tsx | ^4.21.0 | Roda scripts TypeScript (translate.ts) |
| Testes unitários | Vitest | ^4.1.2 | 33 testes de integridade e componente |
| Testes E2E | Playwright | ^1.58.2 | 7 cenários de roteamento e persistência |

## Por que i18next e não next-intl

O Gravity é **100% Vite + React Router** (SPA), não Next.js. Por isso:

- `next-intl` e `next-i18next` não se aplicam
- Não há Server Components nem roteamento server-side por idioma
- A troca de idioma é client-side via `i18next.changeLanguage()`
- Não existem prefixos de URL (`/pt/`, `/en/`, `/es/`) — o idioma é controlado por `localStorage`

## Fluxo de Dados

```
                    ┌────────────────────┐
                    │     pt.json        │
                    │  FONTE DA VERDADE  │
                    │    950 chaves      │
                    └─────────┬──────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
           ┌─────────┐  ┌─────────┐  ┌─────────┐
           │ en.json  │  │ es.json  │  │ (outros) │
           │ 924 keys │  │ 924 keys │  │ futuros  │
           └────┬─────┘  └────┬─────┘  └──────────┘
                │             │
                └──────┬──────┘
                       │
                ┌──────┴──────┐
                │   i18n.ts   │
                │  (nucleo)   │
                │  Carrega    │
                │  resources  │
                └──────┬──────┘
                       │
                ┌──────┴──────┐
                │ I18nProvider │
                │  (Context)   │
                └──────┬──────┘
                       │
              ┌────────┼────────┐
              │        │        │
              ▼        ▼        ▼
          Shell    Admin    Produtos
         Header   Layout   SimulaCusto
        Sidebar   Pages    BidFrete
        Layout    ...      Pedido ...
```

## Estrutura de Arquivos

```
gravity/
├── nucleo-global/
│   └── Utilidades/Localization/
│       ├── i18n.ts                    ← Configuração central
│       ├── provider.tsx               ← I18nProvider React
│       └── locales/
│           ├── pt.json                ← FONTE DA VERDADE (950 chaves)
│           ├── en.json                ← Inglês (924 chaves)
│           ├── es.json                ← Espanhol (924 chaves)
│           ├── zh.json                ← Chinês (legado, 149 chaves)
│           ├── de.json                ← Alemão (legado, 149 chaves)
│           ├── it.json                ← Italiano (legado, 149 chaves)
│           └── ar.json                ← Árabe (legado, 149 chaves)
│
├── nucleo-global/Layout/language-switcher-global/
│   ├── package.json
│   └── src/
│       ├── index.ts
│       ├── LanguageSwitcherGlobal.tsx ← Componente seletor de idioma
│       └── language-switcher-global.css
│
├── scripts/
│   ├── translate.ts                   ← Pipeline de tradução Gemini
│   └── translate-hook.ts             ← Hook pós-edição
│
└── testes/
    ├── testes-unitarios/i18n/
    │   ├── vitest.config.ts
    │   ├── translate-script.test.ts   ← 9 testes
    │   ├── messages-integrity.test.ts ← 13 testes
    │   └── language-switcher.test.tsx ← 11 testes
    └── testes-e2e/i18n/
        ├── language-routing.spec.ts
        ├── language-persistence.spec.ts
        └── no-missing-translations.spec.ts
```

## Configuração Central (i18n.ts)

Localizado em `nucleo-global/Utilidades/Localization/i18n.ts`:

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ptTranslations from './locales/pt.json'
import enTranslations from './locales/en.json'
import esTranslations from './locales/es.json'
// ... outros idiomas

i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: ptTranslations },
    en: { translation: enTranslations },
    es: { translation: esTranslations },
    // ...
  },
  lng: 'pt',             // idioma inicial
  fallbackLng: 'pt',     // fallback se chave não existir
  interpolation: {
    escapeValue: false,   // React protege contra XSS
  },
})
```

## Provider React (provider.tsx)

Envolve a aplicação raiz:

```typescript
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'

export function I18nProvider({ children }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
```

## Alias Vite

Para que qualquer app do monorepo possa importar o LanguageSwitcher, o alias está configurado em `servicos-global/configurador/vite.config.ts`:

```typescript
resolve: {
  alias: {
    '@nucleo/language-switcher-global': path.resolve(
      __dirname, '../../nucleo-global/Layout/language-switcher-global/src/index.ts'
    ),
    '@nucleo/Utilidades/localization/i18n': path.resolve(
      __dirname, '../../nucleo-global/Utilidades/Localization/i18n.ts'
    ),
    '@nucleo/Utilidades/localization/provider': path.resolve(
      __dirname, '../../nucleo-global/Utilidades/Localization/provider.tsx'
    ),
  }
}
```

## Persistência de Idioma

### Fluxo de inicialização (Layout.tsx do Shell)

```typescript
React.useEffect(() => {
  const saved = localStorage.getItem('gravity:language')   // 1. Salvo pelo usuário?
  const detected = navigator.language.split('-')[0]         // 2. Idioma do browser?
  const language = saved ?? detected ?? 'pt'                // 3. Fallback: PT
  document.documentElement.setAttribute('lang', language)
  if (i18n.language !== language) {
    i18n.changeLanguage(language)
  }
}, [i18n])
```

### Prioridade de detecção

1. `localStorage.getItem('gravity:language')` — seleção explícita do usuário
2. `navigator.language` — idioma configurado no browser
3. `'pt'` — fallback padrão (português)

### Chave de persistência

```
localStorage key: gravity:language
Valores válidos: "pt" | "en" | "es"
```

### Quando é salvo

O `LanguageSwitcherGlobal` executa ao selecionar:

```typescript
i18n.changeLanguage(code)                          // Atualiza i18next
localStorage.setItem('gravity:language', code)     // Persiste
document.documentElement.setAttribute('lang', code) // Atualiza <html lang>
```

### Garantias de persistência

| Cenário | Idioma preservado? |
|---------|-------------------|
| Reload da página (F5) | Sim |
| Navegar entre páginas | Sim |
| Voltar/avançar no browser | Sim |
| Abrir nova aba | Sim |
| Fechar e reabrir browser | Sim |
| Limpar localStorage | Reseta para idioma do browser ou PT |
