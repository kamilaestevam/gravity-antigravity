---
name: antigravity-i18n-traducao
description: "Consulte esta skill antes de criar/modificar qualquer texto visivel ao usuario — labels, placeholders, tooltips, mensagens de erro, notificacoes, toasts. Define a arquitetura de internacionalizacao, convencoes de keys, pipeline de traducao automatica, lazy loading, formatadores locale-aware, e regras inviolaveis para garantir cobertura 100% em PT/EN/ES."
---

# Gravity — Internacionalizacao e Traducao (i18n)

## Regra Geral

Todo texto visivel ao usuario DEVE passar por `t('namespace.key')`. Nenhuma string em portugues (ou qualquer idioma) pode existir hardcoded em JSX, atributos HTML, constantes de UI, mensagens de erro ou notificacoes. O QA bloqueia qualquer entrega com strings hardcoded.

---

## Stack

| Camada | Tecnologia | Versao |
|--------|-----------|--------|
| Core | `i18next` | `^26.0.1` (locked via overrides) |
| React bindings | `react-i18next` | `^17.0.1` (locked via overrides) |
| Pipeline traducao | `scripts/translate.ts` | Gemini 2.0 Flash API |
| Formatadores | `Intl.*` (nativo) | ES2022+ |
| Auth UI | `@clerk/localizations` | `^4.2.3` |

> **Monorepo:** Versoes travadas em `package.json` raiz via `overrides`. Nunca instalar versao diferente.

---

## Arquitetura de Arquivos

```
nucleo-global/
  Utilidades/
    Localization/
      i18n.ts              <- Config central (registra idiomas, lazy loading)
      provider.tsx          <- React Provider (<I18nProvider>)
      useLocale.ts          <- Hook que conecta formatadores ao idioma ativo
      locales/
        pt.json             <- FONTE DA VERDADE (dev escreve aqui)
        en.json             <- Gerado pelo pipeline Gemini
        es.json             <- Gerado pelo pipeline Gemini
  Layout/
    language-switcher-global/  <- Componente seletor PT/EN/ES
  Utilidades/
    utils/src/
      formatadores.ts       <- Funcoes Intl (moeda, data, numero, percentual)

scripts/
  translate.ts              <- Pipeline Gemini (PT -> EN/ES)

servicos-global/
  shell/Layout.tsx          <- Deteccao de idioma (localStorage -> navigator -> pt)
  configurador/src/ptBR.ts  <- Localizacao Clerk
```

---

## Idiomas Suportados

| Codigo | Idioma | Status | Arquivo |
|--------|--------|--------|---------|
| `pt` | Portugues (BR) | Fonte da verdade | `locales/pt.json` |
| `en` | English (US) | Gerado automaticamente | `locales/en.json` |
| `es` | Espanol | Gerado automaticamente | `locales/es.json` |

> Idiomas legacy (zh, de, it, ar) foram arquivados. Nao registrar novos idiomas sem aprovacao do Lider.

---

## Namespaces — Convencao de Keys

Cada dominio tem seu namespace no JSON. Keys usam `snake_case` separadas por ponto.

### Estrutura do pt.json

```json
{
  "comum": { "salvar": "Salvar", "cancelar": "Cancelar" },
  "shell": { "busca_global": "Buscar...", "menu": { "pedidos": "Pedidos" } },
  "tabela": { "sem_resultados": "Nenhum resultado" },
  "pedido": { "label": { "exportador": "Exportador" }, "status": { "rascunho": "Rascunho" } },
  "simulacusto": { ... },
  "bidfrete": { ... },
  "admin": { "cockpit": { ... } }
}
```

### Regras de Naming

| Regra | Exemplo Correto | Exemplo Errado |
|-------|----------------|----------------|
| Namespace = dominio do produto/servico | `pedido.label.exportador` | `labels.pedido_exportador` |
| Keys em `snake_case` | `tipo_operacao` | `tipoOperacao` |
| Agrupamento semantico | `pedido.status.rascunho` | `pedido.rascunho` |
| Sem prefixo de tipo de componente | `pedido.label.moeda` | `pedido.select_label_moeda` |
| Pluralizacao com sufixo `_one`/`_other` | `pedido.itens_one`, `pedido.itens_other` | `pedido.itens_plural` |

### Namespaces Existentes

`comum`, `acoes`, `shell`, `tabela`, `calendario`, `campo`, `botoes`, `usuario`, `login`, `auth`, `modal`, `feedback`, `hub`, `store`, `sw`, `waitlist`, `contato`, `marketplace`, `admin`, `workspace`, `pedido`, `simulacusto`, `bidfrete`, `bidcambio`, `processo`, `lpco`, `nf_importacao`, `email_modulo`, `historico`, `cronometro`, `gabi`, `whatsapp`, `tenant_dashboard`, `atividades`

### Namespace Excluido de Traducao

`admin.cockpit` — somente PT. Interno Gravity, nao traduzido para EN/ES. O pipeline Gemini ignora automaticamente.

---

## Como Adicionar Novo Texto (Fluxo Dev)

### 1. Adicionar key no pt.json

```json
{
  "pedido": {
    "label": {
      "nova_key": "Texto em portugues"
    }
  }
}
```

### 2. Usar no componente

```tsx
import { useTranslation } from 'react-i18next'

function MeuComponente() {
  const { t } = useTranslation()
  return <label>{t('pedido.label.nova_key')}</label>
}
```

### 3. Gerar traducoes EN/ES

```bash
npx tsx scripts/translate.ts        # traduz chaves faltantes via Gemini
npx tsx scripts/translate.ts --dry-run  # lista sem traduzir (preview)
```

### 4. Pronto

O pipeline gera `en.json` e `es.json` automaticamente. Commit os 3 arquivos.

---

## Padroes Obrigatorios

### Labels de Formulario

```tsx
// CORRETO
<label>{t('pedido.label.exportador')}</label>
<input placeholder={t('pedido.placeholder.digite_nome')} />

// PROIBIDO
<label>Exportador</label>
<input placeholder="Digite o nome..." />
```

### Constantes de UI (Selects, Tabs, Status)

```tsx
// CORRETO — keys no objeto, t() no render
const STATUS_KEYS: Record<string, string> = {
  rascunho: 'pedido.status.rascunho',
  em_andamento: 'pedido.status.em_andamento',
  aprovado: 'pedido.status.aprovado',
}

// No JSX:
<span>{t(STATUS_KEYS[status])}</span>

// PROIBIDO — strings hardcoded
const STATUS_LABELS = { rascunho: 'Rascunho', em_andamento: 'Em Andamento' }
```

### Colunas de Tabela

```tsx
// CORRETO
const colunas = [
  { accessorKey: 'numero', header: t('pedido.coluna.numero') },
  { accessorKey: 'status', header: t('pedido.coluna.status') },
]

// PROIBIDO
const colunas = [
  { accessorKey: 'numero', header: 'N Pedido' },
]
```

### Tooltips

```tsx
// CORRETO
<TooltipGlobal descricao={t('pedido.tooltip.numero_referencia')}>

// PROIBIDO
<TooltipGlobal descricao="Numero de referencia do pedido">
```

> **Regra Tooltip:** Max 90 caracteres. Validar que traducoes EN/ES nao estouram esse limite.

### Aria-Labels e Acessibilidade

```tsx
// CORRETO
<button aria-label={t('comum.fechar')}><X /></button>

// PROIBIDO
<button aria-label="Fechar"><X /></button>
```

### Mensagens de Erro (Backend)

```tsx
// CORRETO — key i18n no AppError
throw new AppError('pedido.erro.numero_duplicado', 409)

// PROIBIDO — mensagem hardcoded
throw new AppError('Ja existe um pedido com este numero', 409)
```

### GABI (IA)

```tsx
// CORRETO — idioma do usuario no system prompt
const systemPrompt = `Responda sempre em ${locale === 'en' ? 'English' : locale === 'es' ? 'Espanol' : 'Portugues'}.`

// PROIBIDO — assumir portugues
const systemPrompt = 'Voce e um assistente...'
```

---

## useLocale() — Formatadores Locale-Aware

Todo componente que formata numero, moeda, data ou percentual DEVE usar o hook `useLocale()` em vez de chamar formatadores diretamente com `pt-BR` hardcoded.

```tsx
import { useLocale } from '@nucleo/Utilidades/localization/useLocale'

function MeuComponente() {
  const { formatarMoeda, formatarData, formatarNumero } = useLocale()

  return (
    <div>
      <span>{formatarMoeda(1500.50)}</span>     {/* R$ 1.500,50 ou $1,500.50 */}
      <span>{formatarData(new Date())}</span>    {/* 16/04/2026 ou 04/16/2026 */}
      <span>{formatarNumero(12345.67)}</span>    {/* 12.345,67 ou 12,345.67 */}
    </div>
  )
}
```

### Regras do useLocale

| Regra | Detalhe |
|-------|---------|
| Nunca chamar `formatarMoeda(v)` sem locale | Usar `useLocale().formatarMoeda(v)` |
| Nunca hardcodar `'pt-BR'` em formatadores | O hook resolve automaticamente |
| Locale segue idioma do i18n | PT -> `pt-BR`, EN -> `en-US`, ES -> `es-ES` |
| Moeda default e BRL | Pode ser overridden via `{ moeda: 'USD' }` |

---

## Lazy Loading de Locales

Os JSONs de idioma sao carregados sob demanda. Apenas o idioma ativo do usuario e importado no bundle inicial.

```typescript
// i18n.ts — carrega apenas o idioma necessario
const loadLocale = async (lang: string) => {
  const mod = await import(`./locales/${lang}.json`)
  return mod.default
}
```

### Beneficio

| Metrica | Sem lazy loading | Com lazy loading |
|---------|-----------------|-----------------|
| Bundle inicial (gzip) | ~120 KB (7 idiomas) | ~45 KB (1 idioma) |
| Troca de idioma | Instantanea | ~50ms (fetch async) |

---

## Pipeline de Traducao Automatica

### Comando

```bash
npx tsx scripts/translate.ts            # traduz faltantes
npx tsx scripts/translate.ts --dry-run  # preview sem chamar API
```

### Como Funciona

1. Le `pt.json` como fonte da verdade (flatten para key-value)
2. Compara com `en.json` e `es.json`
3. Identifica keys ausentes ou vazias
4. Envia batches de 50 keys para Gemini 2.0 Flash
5. Merge (nunca sobrescreve traducoes existentes)
6. Valida preservacao de variaveis (`{{count}}`, `{nome}`, tags HTML)

### Configuracao

- Requer `GEMINI_API_KEY` em `.env.local`
- Namespaces ignorados: `admin.cockpit`
- Temperature: `0.1` (consistencia)
- Response format: JSON

---

## Persistencia do Idioma

| Prioridade | Fonte | Onde |
|-----------|-------|------|
| 1 | localStorage | `gravity:language` |
| 2 | Navegador | `navigator.language` |
| 3 | Fallback | `pt` |

Ao trocar idioma no LanguageSwitcher:
1. `i18n.changeLanguage(code)` — atualiza todas as traducoes
2. `localStorage.setItem('gravity:language', code)` — persiste
3. `document.documentElement.setAttribute('lang', code)` — acessibilidade

---

## Regras Inviolaveis

### PROIBIDO

1. String visivel ao usuario hardcoded em JSX, atributos ou constantes
2. `formatarMoeda()`, `formatarData()` etc. com locale `pt-BR` hardcoded
3. `any` em keys de traducao — todo `t()` recebe string literal tipada
4. Criar novo arquivo `.json` de idioma sem aprovacao do Lider
5. Editar `en.json` ou `es.json` manualmente (so via pipeline Gemini)
6. Importar todos os idiomas estaticamente (usar lazy loading)
7. `console.log` com dados sensiveis em mensagens traduzidas

### OBRIGATORIO

1. Todo `t('key')` tem entry correspondente em `pt.json`
2. Toda key nova em `pt.json` deve rodar `npm run translate` antes do commit
3. Traducoes EN/ES nao podem ultrapassar 90 chars para tooltips
4. `useLocale()` para qualquer formatacao de numero/moeda/data
5. Clerk localizado para os 3 idiomas (ptBR, enUS, esES)
6. Testes validam que nenhuma key retorna fallback vazio

---

## Testes Obrigatorios

### Unitarios (Vitest)

```typescript
// Validar paridade de keys
it('en.json tem todas as keys de pt.json', () => {
  const ptKeys = Object.keys(flatten(pt))
  const enKeys = Object.keys(flatten(en))
  const missing = ptKeys.filter(k => !enKeys.includes(k) && !isSkipped(k))
  expect(missing).toEqual([])
})

// Validar sem valores vazios
it('nenhuma key com valor vazio em en.json', () => {
  const flat = flatten(en)
  const empty = Object.entries(flat).filter(([, v]) => v === '')
  expect(empty).toEqual([])
})

// Validar preservacao de variaveis
it('variaveis {{}} preservadas em traducoes', () => {
  const ptFlat = flatten(pt)
  const enFlat = flatten(en)
  for (const [key, ptVal] of Object.entries(ptFlat)) {
    const vars = ptVal.match(/\{\{.*?\}\}/g) || []
    if (vars.length > 0 && enFlat[key]) {
      for (const v of vars) {
        expect(enFlat[key]).toContain(v)
      }
    }
  }
})
```

### Funcionais (React Testing Library)

```typescript
// Componente renderiza com traducao
it('label usa t() em vez de string hardcoded', () => {
  render(<NovoPedido />, { wrapper: I18nProvider })
  expect(screen.getByText('Exportador')).toBeInTheDocument() // PT fallback
})
```

---

## Checklist Pre-Entrega (i18n)

- [ ] Toda string visivel usa `t('namespace.key')`?
- [ ] Keys adicionadas em `pt.json`?
- [ ] `npm run translate` rodou e gerou EN/ES?
- [ ] Tooltips com <= 90 chars em todos os idiomas?
- [ ] Formatadores usam `useLocale()` (nao `pt-BR` hardcoded)?
- [ ] Aria-labels traduzidos?
- [ ] Placeholders traduzidos?
- [ ] Mensagens de erro via key i18n (nao hardcoded)?
- [ ] Testes de paridade passam?

---

## Referencia Rapida

| Preciso... | Faco... |
|-----------|---------|
| Adicionar texto novo | Key no `pt.json` + `t('ns.key')` + `npm run translate` |
| Formatar moeda/data | `useLocale().formatarMoeda(v)` |
| Trocar idioma via UI | LanguageSwitcherGlobal (ja integrado no Shell) |
| Traduzir automaticamente | `npx tsx scripts/translate.ts` |
| Verificar cobertura | `npx tsx scripts/translate.ts --dry-run` |
| Constante com labels | Objeto com keys i18n + `t(KEY)` no render |
| Tooltip | `<TooltipGlobal descricao={t('ns.tooltip_key')}>` |
| Mensagem de erro (API) | `throw new AppError('ns.erro.key', statusCode)` |
| GABI responder no idioma | Incluir locale no system prompt |
