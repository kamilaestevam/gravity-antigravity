---
name: antigravity-dream-team-traducao
description: "Consulte esta skill antes de criar/modificar qualquer texto visivel ao usuario — labels, placeholders, tooltips, mensagens de erro, notificacoes, toasts. Define a arquitetura de internacionalizacao, convencoes de keys, pipeline de traducao automatica, lazy loading, formatadores locale-aware, higiene de git e regras inviolaveis para garantir cobertura 100% em PT/EN/ES."
---

# Gravity — Internacionalização e Tradução (i18n)

## Regra Geral

Todo texto visível ao usuário DEVE passar por `t('namespace.key')`. Nenhuma string em português (ou qualquer idioma) pode existir hardcoded em JSX, atributos HTML, constantes de UI, mensagens de erro ou notificações. O QA bloqueia qualquer entrega com strings hardcoded.

---

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Core | `i18next` | `^26.0.1` (locked via overrides) |
| React bindings | `react-i18next` | `^17.0.1` (locked via overrides) |
| Pipeline tradução | `scripts/ativamente/translate.ts` | Gemini 2.0 Flash API |
| Formatadores | `Intl.*` (nativo) | ES2022+ |
| Auth UI | `@clerk/localizations` | `^4.2.3` |

> **Monorepo:** Versões travadas em `package.json` raiz via `overrides`. Nunca instalar versão diferente.

---

## Arquitetura de Arquivos

```
nucleo-global/
  Utilidades/
    Localization/
      i18n.ts              ← Config central (registra idiomas, lazy loading)
      provider.tsx          ← React Provider (<I18nProvider>)
      useLocale.ts          ← Hook que conecta formatadores ao idioma ativo
      locales/
        pt.json             ← FONTE DA VERDADE (dev escreve aqui)
        en.json             ← Gerado pelo pipeline Gemini
        es.json             ← Gerado pelo pipeline Gemini
  Layout/
    language-switcher-global/  ← Componente seletor PT/EN/ES
  Utilidades/
    utils/src/
      formatadores.ts       ← Funções Intl (moeda, data, número, percentual)

scripts/
  translate.ts              ← Pipeline Gemini (PT → EN/ES)

servicos-global/
  shell/Layout.tsx          ← Detecção de idioma (localStorage → navigator → pt)
  configurador/src/ptBR.ts  ← Localização Clerk
```

---

## Idiomas Suportados

| Código | Idioma | Status | Arquivo |
|--------|--------|--------|---------|
| `pt` | Português (BR) | Fonte da verdade | `locales/pt.json` |
| `en` | English (US) | Gerado automaticamente | `locales/en.json` |
| `es` | Español | Gerado automaticamente | `locales/es.json` |

> Idiomas legacy (zh, de, it, ar) foram arquivados. Não registrar novos idiomas sem aprovação do Líder.

---

## Domínio COMEX — Jargões Intocáveis

Os seguintes termos são jargões técnicos de Comércio Exterior com reconhecimento global. **Nunca traduzi-los** — mantê-los como estão nos três idiomas:

`NCM`, `DUIMP`, `LPCO`, `Part Number`, `Incoterm`, `Invoice`, `DI`, `LI`, `RADAR`, `SisComex`, `Drawback`, `Ex-Tarifário`, `MAPA`, `ANVISA`, `FOB`, `CIF`, `EXW`, `DAP`

Se houver dúvida se um termo é jargão ou texto traduzível, consultar o Líder antes de agir.

---

## Namespaces — Convenção de Keys

Cada domínio tem seu namespace no JSON. Keys usam `snake_case` separadas por ponto.

### Estrutura do pt.json

```json
{
  "comum": { "salvar": "Salvar", "cancelar": "Cancelar" },
  "shell": { "busca_global": "Buscar...", "menu": { "pedidos": "Pedidos" } },
  "tabela": { "sem_resultados": "Nenhum resultado" },
  "pedido": { "label": { "exportador": "Exportador" }, "status": { "rascunho": "Rascunho" } },
  "simulacusto": { },
  "bidfrete": { },
  "admin": { "cockpit": { } }
}
```

### Regras de Naming

| Regra | Exemplo Correto | Exemplo Errado |
|-------|----------------|----------------|
| Namespace = domínio do produto/serviço | `pedido.label.exportador` | `labels.pedido_exportador` |
| Keys em `snake_case` | `tipo_operacao` | `tipoOperacao` |
| Agrupamento semântico | `pedido.status.rascunho` | `pedido.rascunho` |
| Sem prefixo de tipo de componente | `pedido.label.moeda` | `pedido.select_label_moeda` |
| Pluralização com sufixo `_one`/`_other` | `pedido.itens_one`, `pedido.itens_other` | `pedido.itens_plural` |

### Namespaces Existentes

`comum`, `acoes`, `shell`, `tabela`, `calendario`, `campo`, `botoes`, `usuario`, `login`, `auth`, `modal`, `feedback`, `hub`, `store`, `sw`, `waitlist`, `contato`, `marketplace`, `admin`, `workspace`, `pedido`, `simulacusto`, `bidfrete`, `bidcambio`, `processo`, `lpco`, `nf_importacao`, `email_modulo`, `historico`, `cronometro`, `gabi`, `whatsapp`, `tenant_dashboard`, `atividades`

### Namespace Excluído de Tradução

`admin.cockpit` — somente PT. Interno Gravity, não traduzido para EN/ES. O pipeline Gemini ignora automaticamente.

---

## Aprovação Prévia para Grandes Escopos

Ao mapear um novo escopo com **mais de 10 chaves**, gerar uma tabela de mapeamento em Markdown para auditoria humana antes de injetar nos JSONs:

| Key i18n | Texto PT | Traduzível? | Observação |
|----------|----------|-------------|------------|
| `pedido.label.exportador` | Exportador | Sim | — |
| `pedido.label.ncm` | NCM | **Não** | Jargão COMEX |

Aguardar aprovação explícita do usuário antes de prosseguir com a injeção.

---

## Como Adicionar Novo Texto (Fluxo Dev)

### 1. Adicionar key no pt.json

```json
{
  "pedido": {
    "label": {
      "nova_key": "Texto em português"
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

### 3. Gerar traduções EN/ES

```bash
npx tsx scripts/ativamente/translate.ts        # traduz chaves faltantes via Gemini
npx tsx scripts/ativamente/translate.ts --dry-run  # lista sem traduzir (preview)
```

### 4. Commit os 3 arquivos

```bash
git add nucleo-global/Utilidades/Localization/locales/pt.json
git add nucleo-global/Utilidades/Localization/locales/en.json
git add nucleo-global/Utilidades/Localization/locales/es.json
git commit -m "i18n(namespace): descrição do escopo"
```

---

## Padrões Obrigatórios

### Regra de Ouro dos Hooks

O hook `const { t } = useTranslation()` deve ficar **SEMPRE no nível superior do componente**. Nunca dentro de loops, condicionais ou funções aninhadas — isso viola as Rules of Hooks e causa bugs silenciosos.

```tsx
// ✅ CORRETO — nível superior
function MeuComponente() {
  const { t } = useTranslation()
  return <>{items.map(i => <span key={i.id}>{t('pedido.label.item')}</span>)}</>
}

// ❌ PROIBIDO — dentro de map
function MeuComponente() {
  return (
    <>
      {items.map(i => {
        const { t } = useTranslation() // viola Rules of Hooks
        return <span key={i.id}>{t('pedido.label.item')}</span>
      })}
    </>
  )
}
```

### Refatoração de Forma de Objeto + Consumer no Mesmo Edit

Quando uma refatoração muda a forma de um objeto E o consumer desse objeto (ex: `map()` que desestrutura o objeto), **fazer as duas mudanças no mesmo `Edit`** ou verificar `tsc --noEmit` entre elas. TypeScript acusará erro se forem dois edits separados com compilação no meio — mas pode passar silenciosamente em sessões sem checagem.

```tsx
// ❌ ERRADO — dois edits separados causam dessincronia temporária
// Edit 1: muda a definição
const grupos = [{ grupoKey: 'grupo_pedido', vars: [...] }]  // era: { grupo: 'Pedido', vars }

// Edit 2: (mais tarde) muda o consumer
grupos.map(({ grupo, vars }) => ...)  // ainda usa 'grupo' — TypeScript já acusa erro aqui

// ✅ CORRETO — definição + consumer no mesmo Edit
const grupos = [{ grupoKey: 'grupo_pedido', vars: [...] }]
grupos.map(({ grupoKey, vars }) => ...)  // mesmo Edit
```

### Arrays Estáticos e Performance (useMemo)

Se o arquivo possui arrays de configuração **fora do componente** (colunas, opções de select, tabs), mover para dentro e envolver em `useMemo([t])` antes de traduzir. Arrays fora do componente não têm acesso ao `t()` atualizado quando o idioma muda.

```tsx
// ✅ CORRETO — dentro do componente com useMemo
function TabelaPedidos() {
  const { t } = useTranslation()

  const colunas = useMemo(() => [
    { accessorKey: 'numero', header: t('pedido.coluna.numero') },
    { accessorKey: 'status', header: t('pedido.coluna.status') },
  ], [t])

  return <TabelaGlobal columns={colunas} />
}

// ❌ PROIBIDO — fora do componente (não reage à troca de idioma)
const colunas = [
  { accessorKey: 'numero', header: t('pedido.coluna.numero') }, // t não existe aqui
]
```

### Shadowing de t() em Callbacks

Antes de inserir `t()` em qualquer bloco, verificar se algum identificador `t` está sendo redefinido como parâmetro de callback, variável local ou desestruturação no mesmo escopo ou em escopos pai próximos. TypeScript **não acusa erro** nesse caso — o shadowing é silencioso.

```tsx
// ❌ ARMADILHA — t do map sobrescreve t do useTranslation
function Componente() {
  const { t } = useTranslation()

  return (
    <>
      {taxasHoje.map(t => (   // ← este 't' shadowa o t() acima
        <span>{t('comum.label')}</span>  // chama t.call() no objeto, não no hook
      ))}
    </>
  )
}

// ✅ CORRETO — renomear o parâmetro do callback
function Componente() {
  const { t } = useTranslation()

  return (
    <>
      {taxasHoje.map(taxa => (
        <span>{t('comum.label')}</span>  // t correto
      ))}
    </>
  )
}
```

**Regra:** Ao traduzir seções que já têm `map(t => ...)`, `filter(t => ...)` etc., renomear o parâmetro do callback antes de inserir chamadas `t()`.

### O Campo Minado — Isolamento Lógico

É **ESTRITAMENTE PROIBIDO** traduzir valores que trafegam para o backend ou controlam lógica de negócio. Traduzir apenas a **renderização visual (JSX)**. Nunca traduzir `value`, `id`, chaves de banco de dados, enums de API, ou nomes de campos Prisma.

```tsx
// ✅ CORRETO — value intocável, label traduzida
<Select>
  <option value="rascunho">{t('pedido.status.rascunho')}</option>
  <option value="aprovado">{t('pedido.status.aprovado')}</option>
</Select>

// ❌ PROIBIDO — value traduzido quebra o backend
<Select>
  <option value={t('pedido.status.rascunho')}>Rascunho</option>
</Select>

// ❌ PROIBIDO — campo de banco traduzido
const campo = t('pedido.campo.valor_total_brl') // nunca substituir 'valor_total_brl'
```

### Dados Dinâmicos do Banco — defaultValue Obrigatório

Dados que vêm do banco (nomes de status criados pelo usuário, categorias, templates) **nunca terão chave no bundle de tradução**. Usar `t()` direto retornaria a própria chave na tela.

```tsx
// ❌ PROIBIDO — status "meu_status" não tem key no bundle
<span>{t(`pedido.status.${status.nome}`)}</span>
// resultado: "pedido.status.meu_status" aparece na tela

// ✅ CORRETO — defaultValue com o valor original como fallback
<span>{t(`pedido.status.${status.nome}`, { defaultValue: status.nome })}</span>
// resultado: traduz se a key existe, senão exibe o valor original

// ✅ TAMBÉM CORRETO — distinguir status de sistema (traduzíveis) de dados do usuário
const SYSTEM_STATUSES = ['rascunho', 'em_andamento', 'aprovado', 'cancelado']
const label = SYSTEM_STATUSES.includes(status.nome)
  ? t(`pedido.status.${status.nome}`)
  : status.nome
```

**Regra:** Para qualquer campo que vem do banco, sempre usar `t(key, { defaultValue: valorOriginal })`. Tradução por chave só para strings de sistema definidas no código.

### Labels de Formulário

```tsx
// ✅ CORRETO
<label>{t('pedido.label.exportador')}</label>
<input placeholder={t('pedido.placeholder.digite_nome')} />

// ❌ PROIBIDO
<label>Exportador</label>
<input placeholder="Digite o nome..." />
```

### Constantes de UI (Selects, Tabs, Status)

```tsx
// ✅ CORRETO — keys no objeto, t() no render
const STATUS_KEYS: Record<string, string> = {
  rascunho: 'pedido.status.rascunho',
  em_andamento: 'pedido.status.em_andamento',
  aprovado: 'pedido.status.aprovado',
}

// No JSX:
<span>{t(STATUS_KEYS[status])}</span>

// ❌ PROIBIDO — strings hardcoded
const STATUS_LABELS = { rascunho: 'Rascunho', em_andamento: 'Em Andamento' }
```

### Colunas de Tabela

```tsx
// ✅ CORRETO
const colunas = useMemo(() => [
  { accessorKey: 'numero', header: t('pedido.coluna.numero') },
  { accessorKey: 'status', header: t('pedido.coluna.status') },
], [t])

// ❌ PROIBIDO
const colunas = [
  { accessorKey: 'numero', header: 'N Pedido' },
]
```

### Tooltips

```tsx
// ✅ CORRETO
<TooltipGlobal descricao={t('pedido.tooltip.numero_referencia')}>

// ❌ PROIBIDO
<TooltipGlobal descricao="Número de referência do pedido">
```

> **Regra Tooltip:** Máx 90 caracteres. Validar que traduções EN/ES não estouram esse limite.

### Aria-Labels e Acessibilidade

```tsx
// ✅ CORRETO
<button aria-label={t('comum.fechar')}><X /></button>

// ❌ PROIBIDO
<button aria-label="Fechar"><X /></button>
```

### Mensagens de Erro (Backend)

```tsx
// ✅ CORRETO — key i18n no AppError
throw new AppError('pedido.erro.numero_duplicado', 409)

// ❌ PROIBIDO — mensagem hardcoded
throw new AppError('Já existe um pedido com este número', 409)
```

### GABI (IA)

```tsx
// ✅ CORRETO — idioma do usuário no system prompt
const systemPrompt = `Responda sempre em ${locale === 'en' ? 'English' : locale === 'es' ? 'Español' : 'Português'}.`

// ❌ PROIBIDO — assumir português
const systemPrompt = 'Você é um assistente...'
```

---

## useLocale() — Formatadores Locale-Aware

Todo componente que formata número, moeda, data ou percentual DEVE usar o hook `useLocale()` em vez de chamar formatadores diretamente com `pt-BR` hardcoded.

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
| Locale segue idioma do i18n | PT → `pt-BR`, EN → `en-US`, ES → `es-ES` |
| Moeda default é BRL | Pode ser overridden via `{ moeda: 'USD' }` |

---

## Lazy Loading de Locales

Os JSONs de idioma são carregados sob demanda. Apenas o idioma ativo do usuário é importado no bundle inicial.

```typescript
// i18n.ts — carrega apenas o idioma necessário
const loadLocale = async (lang: string) => {
  const mod = await import(`./locales/${lang}.json`)
  return mod.default
}
```

### Benefício

| Métrica | Sem lazy loading | Com lazy loading |
|---------|-----------------|-----------------|
| Bundle inicial (gzip) | ~120 KB (7 idiomas) | ~45 KB (1 idioma) |
| Troca de idioma | Instantânea | ~50ms (fetch async) |

---

## Pipeline de Tradução Automática

### Comando

```bash
npx tsx scripts/ativamente/translate.ts            # traduz faltantes
npx tsx scripts/ativamente/translate.ts --dry-run  # preview sem chamar API
```

### Como Funciona

1. Lê `pt.json` como fonte da verdade (flatten para key-value)
2. Compara com `en.json` e `es.json`
3. Identifica keys ausentes ou vazias
4. Envia batches de 50 keys para Gemini 2.0 Flash
5. Merge (nunca sobrescreve traduções existentes)
6. Valida preservação de variáveis (`{{count}}`, `{nome}`, tags HTML)

### Configuração

- Requer `GEMINI_API_KEY` em `.env.local`
- Namespaces ignorados: `admin.cockpit`
- Temperature: `0.1` (consistência)
- Response format: JSON

### Validação de JSON por Arquivo

Após editar **cada** arquivo de locale (pt, en, es), validar o JSON antes de passar para o próximo. Não esperar o parity check final para descobrir JSON quebrado:

```bash
node -e "require('./nucleo-global/Utilidades/Localization/locales/pt.json')"
node -e "require('./nucleo-global/Utilidades/Localization/locales/en.json')"
node -e "require('./nucleo-global/Utilidades/Localization/locales/es.json')"
```

Se o comando não retornar nada = JSON válido. Se retornar erro = corrigir antes de continuar. Erros comuns: vírgula faltando, bloco fechado duas vezes, chave sem par.

---

## Persistência do Idioma

| Prioridade | Fonte | Onde |
|-----------|-------|------|
| 1 | localStorage | `gravity:language` |
| 2 | Navegador | `navigator.language` |
| 3 | Fallback | `pt` |

Ao trocar idioma no LanguageSwitcher:
1. `i18n.changeLanguage(code)` — atualiza todas as traduções
2. `localStorage.setItem('gravity:language', code)` — persiste
3. `document.documentElement.setAttribute('lang', code)` — acessibilidade

---

## Higiene de Git (Tolerância Zero a Contaminação)

Commits de i18n são especialmente propensos a contaminar o histórico com arquivos não relacionados. Regras invioláveis:

### Isolamento de Arquivos

**NUNCA usar `git add .` ou `git add -A`.** Adicionar apenas os arquivos explicitamente modificados pelo escopo atual:

```bash
# ✅ CORRETO — específico
git add nucleo-global/Utilidades/Localization/locales/pt.json
git add nucleo-global/Utilidades/Localization/locales/en.json
git add nucleo-global/Utilidades/Localization/locales/es.json
git add produto/pedido/client/src/pages/MinhaPage.tsx

# ❌ PROIBIDO — contamina o commit
git add .
git add -A
```

### Sincronização Prévia

Antes de editar qualquer arquivo JSON ou componente para i18n:

```bash
git status          # verificar arquivos modificados de outras sessões
git log --oneline -10  # entender o estado atual
```

Se houver código não commitado de outra sessão, **parar e avisar o usuário**. Nunca misturar escopos.

### Isolamento de Commit

**Um commit = um escopo funcional.** Não misturar:

| ❌ Errado (misturado) | ✅ Certo (isolado) |
|----------------------|-------------------|
| `fix scroll + i18n pedido labels` | `i18n(pedido): traduz labels do formulário` |
| `i18n + refactor ListaPedidos` | Dois commits separados |

### Gestão de Stash

Se o `lint-staged` ou o `husky` falharem durante um commit de i18n:

1. Ler o erro completo até o fim — não assumir o que falhou
2. Corrigir o problema na causa raiz
3. Verificar `git stash list` — o lint-staged cria `stash@{0}` de backup temporário
4. Descartar o stash de backup após resolução: `git stash drop`

**NUNCA encerrar sessão com `stash@{0}` não documentado.** Stash órfão = estado indetectável para a próxima sessão.

### Leitura de Arquivo Após Compactação de Contexto

Em sessões longas, o contexto pode ser compactado. Após compactação, arquivos "já lidos" perdem o estado na ferramenta `Edit`.

**Regra:** Antes de qualquer `Edit` em sessão com compactação de contexto (ou em sessão nova), re-ler o trecho exato do arquivo — mesmo que você acredite que já o leu antes. A ferramenta bloqueará com `"File has not been read yet"` se o estado foi perdido.

### Mensagem de Commit Padrão

```
i18n(namespace): descrição do escopo

# Exemplos:
i18n(pedido): traduz labels e placeholders do formulário principal
i18n(shell): adiciona traduções do menu de navegação
fix(i18n): corrige paridade de keys faltantes em en/es
```

---

## Regras Invioláveis

### PROIBIDO

1. String visível ao usuário hardcoded em JSX, atributos ou constantes
2. `formatarMoeda()`, `formatarData()` etc. com locale `pt-BR` hardcoded
3. `any` em keys de tradução — todo `t()` recebe string literal tipada
4. Criar novo arquivo `.json` de idioma sem aprovação do Líder
5. Editar `en.json` ou `es.json` manualmente (só via pipeline Gemini)
6. Importar todos os idiomas estaticamente (usar lazy loading)
7. `console.log` com dados sensíveis em mensagens traduzidas
8. Traduzir `value`, `id`, enums de API, ou nomes de campo do banco
9. `useTranslation()` dentro de loop, condicional ou função aninhada
10. `git add .` ou `git add -A` em commits de i18n
11. Traduzir jargões COMEX sem aprovação explícita
12. Usar `t()` em bloco onde existe variável local `t` (callback, desestruturação) — shadowinG silencioso
13. `t(key)` direto em dados do banco sem `{ defaultValue: original }`
14. Editar um arquivo de locale sem validar o JSON antes de passar ao próximo
15. Iniciar edições sem ler as skills obrigatórias — contexto de sessão anterior não substitui leitura

### OBRIGATÓRIO

1. Todo `t('key')` tem entry correspondente em `pt.json`
2. Toda key nova em `pt.json` deve rodar `npm run translate` antes do commit
3. Traduções EN/ES não podem ultrapassar 90 chars para tooltips
4. `useLocale()` para qualquer formatação de número/moeda/data
5. Clerk localizado para os 3 idiomas (ptBR, enUS, esES)
6. Testes validam que nenhuma key retorna fallback vazio
7. Arrays de configuração com `t()` dentro de `useMemo([t])`
8. Paridade 3-way: toda key nova vai para `pt.json`, `en.json` e `es.json`
9. Escopo com >10 keys novas exige tabela de auditoria aprovada antes da injeção
10. `git status` verificado antes de qualquer Edit — nunca assumir working tree limpo
11. JSON de cada locale validado com `node -e "require(...)"` após cada arquivo editado
12. Skills obrigatórias lidas no início de **toda sessão nova** — sem exceção, mesmo em continuações

---

## Testes Obrigatórios

### Unitários (Vitest)

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

// Validar preservação de variáveis
it('variáveis {{}} preservadas em traduções', () => {
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
// Componente renderiza com tradução
it('label usa t() em vez de string hardcoded', () => {
  render(<NovoPedido />, { wrapper: I18nProvider })
  expect(screen.getByText('Exportador')).toBeInTheDocument() // PT fallback
})
```

---

## Checklist Pré-Entrega (i18n)

**Sessão — Antes de começar:**
- [ ] Skills obrigatórias lidas nesta sessão (`agent-policy`, `code-standards`, esta skill)?
- [ ] `git status` verificado — working tree limpo de outras sessões?
- [ ] `git log --oneline -10` revisado para entender o estado atual?

**Código:**
- [ ] Toda string visível usa `t('namespace.key')`?
- [ ] `useTranslation()` sempre no nível superior do componente?
- [ ] Arrays com `t()` dentro de `useMemo([t])`?
- [ ] Nenhum `value`, `id` ou campo de banco traduzido?
- [ ] Jargões COMEX intocáveis (`NCM`, `DUIMP`, `Incoterm` etc.)?
- [ ] Verificado se há variável local `t` (callback, desestruturação) no escopo antes de inserir `t()`?
- [ ] Dados do banco usam `t(key, { defaultValue: original })` em vez de `t(key)` direto?
- [ ] Refatorações de forma de objeto: definição + consumer no mesmo Edit?

**JSONs:**
- [ ] Keys adicionadas em `pt.json`?
- [ ] JSON de `pt.json` validado com `node -e "require(...)"` após editar?
- [ ] `npm run translate` rodou e gerou EN/ES?
- [ ] JSON de `en.json` e `es.json` validados individualmente?
- [ ] Tooltips com ≤ 90 chars em todos os idiomas?
- [ ] Escopo >10 keys teve tabela de auditoria aprovada?

**Formatação:**
- [ ] Formatadores usam `useLocale()` (não `pt-BR` hardcoded)?
- [ ] Aria-labels traduzidos?
- [ ] Placeholders traduzidos?
- [ ] Mensagens de erro via key i18n (não hardcoded)?

**Git:**
- [ ] Apenas arquivos do escopo atual adicionados (sem `git add .`)?
- [ ] Commit isolado (sem mix de i18n + outras correções)?
- [ ] Se hook falhou: erro lido até o fim, causa corrigida, `git stash list` limpo?
- [ ] Nenhum stash órfão deixado para trás?

**Testes:**
- [ ] Testes de paridade passam?

---

## Referência Rápida

| Preciso... | Faço... |
|-----------|---------|
| Adicionar texto novo | Key no `pt.json` + `t('ns.key')` + `npm run translate` |
| Formatar moeda/data | `useLocale().formatarMoeda(v)` |
| Trocar idioma via UI | LanguageSwitcherGlobal (já integrado no Shell) |
| Traduzir automaticamente | `npx tsx scripts/ativamente/translate.ts` |
| Verificar cobertura | `npx tsx scripts/ativamente/translate.ts --dry-run` |
| Constante com labels | Objeto com keys i18n + `t(KEY)` no render |
| Colunas de tabela | `useMemo(() => [...], [t])` dentro do componente |
| Tooltip | `<TooltipGlobal descricao={t('ns.tooltip_key')}>` |
| Mensagem de erro (API) | `throw new AppError('ns.erro.key', statusCode)` |
| GABI responder no idioma | Incluir locale no system prompt |
| Escopo grande (>10 keys) | Gerar tabela Markdown → aguardar aprovação → injetar |
| Commitar i18n | `git add` arquivo por arquivo — nunca `git add .` |
| Dado do banco (nome usuário) | `t(key, { defaultValue: valorOriginal })` |
| Validar JSON de locale | `node -e "require('./path/to/file.json')"` |
| Hook falhou no commit | Ler erro + corrigir + `git stash list` + `git stash drop` |
| Editar após compactação | Re-ler o arquivo antes de qualquer `Edit` |
| Callback com nome `t` | Renomear parâmetro antes de inserir `t()` no bloco |
