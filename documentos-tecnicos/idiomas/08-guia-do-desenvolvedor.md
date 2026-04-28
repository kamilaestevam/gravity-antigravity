# Guia do Desenvolvedor — Sistema de Idiomas

## Fluxo de trabalho diário

O fluxo para qualquer desenvolvedor que precisa adicionar textos à interface:

```
1. Adiciona texto em pt.json (fonte da verdade)
2. Usa t('chave') no componente
3. Roda npm run translate (ou translate:check para preview)
4. Roda npm test (valida integridade)
5. Commit
```

---

## Como adicionar um novo texto

### Passo 1 — Adicionar em pt.json

Abra `nucleo-global/Utilidades/Localization/locales/pt.json` e adicione a chave no namespace correto:

```json
{
  "simulacusto": {
    "nova_funcionalidade": "Descrição da nova funcionalidade",
    "outro_texto": "Outro texto aqui"
  }
}
```

### Passo 2 — Usar no componente

```typescript
import { useTranslation } from 'react-i18next'

function MeuComponente() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('simulacusto.nova_funcionalidade')}</h1>
      <p>{t('simulacusto.outro_texto')}</p>
    </div>
  )
}
```

### Passo 3 — Traduzir

```bash
# Preview (sem chamar API)
npm run translate:check

# Traduzir de verdade
npm run translate
```

### Passo 4 — Validar

```bash
npm test
# Deve mostrar 33/33 passando
```

---

## Como usar variáveis

### Variável simples

```json
{ "saudacao": "Olá, {{nome}}!" }
```

```typescript
t('saudacao', { nome: 'Daniel' })
// → "Olá, Daniel!"
```

### Contagem

```json
{
  "items_singular": "{{count}} item selecionado",
  "items_plural": "{{count}} itens selecionados"
}
```

```typescript
t('items_singular', { count: 1 })  // → "1 item selecionado"
t('items_plural', { count: 5 })    // → "5 itens selecionados"
```

### Variável em interpolação de tema

```json
{ "alternar_tema": "Alternar para Tema {{tema}}" }
```

```typescript
t('alternar_tema', { tema: t('shell.label_tema_escuro') })
// → "Alternar para Tema Tema escuro"
```

---

## Como adicionar um novo idioma

### 1. Criar arquivo vazio

```bash
echo "{}" > nucleo-global/Utilidades/Localization/locales/fr.json
```

### 2. Registrar em i18n.ts

```typescript
// nucleo-global/Utilidades/Localization/i18n.ts
import frTranslations from './locales/fr.json'

const resources = {
  // ... existentes
  fr: { translation: frTranslations },
}

export type SupportedLanguage = 'pt' | 'en' | 'es' | 'fr'
```

### 3. Adicionar ao pipeline

```typescript
// scripts/ativamente/translate.ts
const TARGET_LANGUAGES = {
  en: 'inglês',
  es: 'espanhol',
  fr: 'francês',      // ← novo
}

const LANGUAGE_NAMES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',       // ← novo
}
```

### 4. Adicionar ao LanguageSwitcher

```typescript
// nucleo-global/Layout/language-switcher-global/src/LanguageSwitcherGlobal.tsx
const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },  // ← novo
]
```

### 5. Traduzir

```bash
npm run translate
```

O pipeline vai detectar 924 chaves faltantes em `fr.json` e traduzir tudo via Gemini.

### 6. Validar

```bash
npm test
```

---

## Como excluir um namespace da tradução

Se um namespace deve existir apenas em português (como `admin.cockpit`):

### 1. Adicionar à lista de exclusão

Editar a constante `SKIP_NAMESPACES` em 3 arquivos:

```typescript
// scripts/ativamente/translate.ts
const SKIP_NAMESPACES = ['admin.cockpit', 'meu.novo.namespace']

// testes/testes-unitarios/i18n/translate-script.test.ts
const SKIP_NAMESPACES = ['admin.cockpit', 'meu.novo.namespace']

// testes/testes-unitarios/i18n/messages-integrity.test.ts
const SKIP_NAMESPACES = ['admin.cockpit', 'meu.novo.namespace']
```

### 2. Validar

```bash
npm run translate:check  # Não deve listar chaves do namespace excluído
npm test                  # Todos os testes devem passar
```

---

## Regras obrigatórias

### FAZER

- Sempre adicionar textos novos em `pt.json` primeiro
- Usar `t('chave')` para todos os textos visíveis ao usuário
- Usar snake_case para nomes de chaves
- Organizar por namespace do módulo
- Rodar `npm test` antes de commitar
- Preservar variáveis `{{count}}`, `{{nome}}` nas traduções

### NÃO FAZER

- Nunca editar `en.json` ou `es.json` manualmente
- Nunca hardcodar textos em português nos componentes
- Nunca hardcodar `GEMINI_API_KEY` no código
- Nunca usar camelCase em chaves (`minhaChave` → `minha_chave`)
- Nunca usar `@ts-ignore` para suprimir erros de i18n
- Nunca remover chaves de `pt.json` sem remover dos componentes também

---

## Troubleshooting

### "Texto aparece como chave crua (ex: shell.menu.dashboard)"

**Causa:** A chave não existe no JSON do idioma atual.
**Solução:** Verificar se a chave está em pt.json e se en/es.json foram atualizados (`npm run translate`).

### "GEMINI_API_KEY não definida"

**Causa:** Variável de ambiente ausente.
**Solução:** Criar `.env.local` na raiz com `GEMINI_API_KEY=sua_chave`.

### "Teste de integridade falha com chaves faltantes"

**Causa:** Novas chaves adicionadas em pt.json mas não traduzidas.
**Solução:** `npm run translate` para preencher via Gemini.

### "LanguageSwitcher não aparece"

**Causa:** Alias Vite não configurado.
**Solução:** Adicionar no `vite.config.ts` do app:
```typescript
'@nucleo/language-switcher-global': path.resolve(
  __dirname, '../../nucleo-global/Layout/language-switcher-global/src/index.ts'
)
```

### "Idioma reseta ao navegar"

**Causa:** Layout.tsx sem o useEffect de sincronização.
**Solução:** Verificar que o `Layout.tsx` tem o effect que lê `localStorage` e chama `i18n.changeLanguage()`.

### "Tradução igual ao português"

**Causa normal:** Termos técnicos internacionais (Dashboard, Status, Incoterm) são iguais.
**Causa de bug:** O Gemini retornou o texto original sem traduzir.
**Solução:** Se for bug, delete a chave em en/es.json e rode `npm run translate` novamente.

---

## Referência rápida de comandos

```bash
npm test                    # Rodar testes unitários (33 testes)
npm run test:e2e            # Rodar testes E2E (precisa app rodando)
npm run test:all            # Ambos
npm run translate           # Traduzir chaves faltantes via Gemini
npm run translate:check     # Preview do que seria traduzido (dry-run)
```
