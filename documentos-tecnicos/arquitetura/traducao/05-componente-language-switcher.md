# Componente LanguageSwitcherGlobal

## O que é

Um dropdown compacto que permite ao usuário trocar o idioma da interface entre Português, Inglês e Espanhol. Faz parte do nucleo-global e pode ser usado em qualquer app do monorepo.

## Localização na UI

O LanguageSwitcher aparece em **3 locais**:

| Local | Arquivo | Posição |
|-------|---------|---------|
| Shell Header | `servicos-global/shell/Header.tsx` | Entre notificações e perfil |
| Admin Layout | `configurador/src/pages/admin/AdminLayout.tsx` | Barra de ações global |
| Workspace Layout | `configurador/src/pages/workspace/WorkspaceLayout.tsx` | Barra de ações global |

## Visual

```
┌──────────────────────────────────────────────────────────────┐
│  [🔍] [ℹ️] [🔔]  [🌐 PT ▾]  │ ── Divisor ──│  [DA] Daniel ▾ │
│                      ↑                                        │
│               LanguageSwitcher                                │
└──────────────────────────────────────────────────────────────┘

Ao clicar:
┌──────────┐
│ 🇧🇷 Português  ← (ativo, destacado)
│ 🇺🇸 English
│ 🇪🇸 Español
└──────────┘
```

## Comportamento

1. **Exibe** botão compacto com ícone de globo + código do idioma (PT/EN/ES)
2. **Ao clicar**, abre dropdown com 3 opções + bandeira emoji
3. **Idioma ativo** destacado com cor accent e `aria-selected=true`
4. **Ao selecionar** um idioma:
   - `i18n.changeLanguage(code)` — atualiza todas as traduções na tela
   - `localStorage.setItem('gravity:language', code)` — persiste a escolha
   - `document.documentElement.setAttribute('lang', code)` — atualiza `<html lang>`
   - Fecha o dropdown automaticamente
5. **Click fora** fecha o dropdown (via `mousedown` listener)

## Código

### Import

```typescript
import { LanguageSwitcherGlobal } from '@nucleo/language-switcher-global'
```

### Uso básico

```tsx
<LanguageSwitcherGlobal />
```

### Com callback

```tsx
<LanguageSwitcherGlobal
  onLanguageChange={(lang) => {
    console.log('Idioma trocado para:', lang)
  }}
/>
```

### Props

```typescript
interface LanguageSwitcherGlobalProps {
  onLanguageChange?: (lang: string) => void  // Callback opcional após troca
}
```

## Idiomas Configurados

```typescript
const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]
```

## Acessibilidade

| Atributo | Valor |
|----------|-------|
| `role="listbox"` | No dropdown |
| `role="option"` | Em cada item |
| `aria-selected` | `true` no idioma ativo |
| `aria-label` | "Trocar idioma" (traduzido) |
| `aria-expanded` | Estado do dropdown |
| `aria-haspopup="listbox"` | Indica dropdown |

## CSS

O componente usa CSS Variables do design system Gravity:

```css
/* Dark theme (padrão) */
.lang-switcher__trigger {
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

/* Light theme */
body.light-theme .lang-switcher__trigger {
  border-color: var(--border-default, #cbd5e1);
  color: var(--text-secondary, #334155);
}
```

## Arquivos do Componente

```
nucleo-global/Layout/language-switcher-global/
├── package.json                        ← Peer deps: react, i18next, phosphor-icons
└── src/
    ├── index.ts                        ← Export barrel
    ├── LanguageSwitcherGlobal.tsx       ← Componente React
    └── language-switcher-global.css    ← Estilos (dark + light theme)
```

## Alias Vite (necessário em cada app)

```typescript
// vite.config.ts
'@nucleo/language-switcher-global': path.resolve(
  __dirname, '../../nucleo-global/Layout/language-switcher-global/src/index.ts'
)
```

Atualmente configurado em:
- `servicos-global/configurador/vite.config.ts`
