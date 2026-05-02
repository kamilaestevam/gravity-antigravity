# Internacionalização (i18n) — Documento Técnico Completo

**Plataforma:** Gravity
**Data de implementação:** 2026-03-30
**Branch:** claude/dev
**Commit:** 735d06c
**Idiomas suportados:** Português (padrão), Inglês, Espanhol
**Arquivos modificados:** 64 (6316 inserções, 800 remoções)

---

## 1. Visão Geral

A plataforma Gravity agora suporta 3 idiomas: **português** (padrão), **inglês** e **espanhol**. A internacionalização cobre toda a interface — desde o shell de navegação até cada produto individual (SimulaCusto, BidFrete, BidCâmbio, Pedido), passando por admin, workspace, marketplace e serviços tenant.

O sistema usa **i18next + react-i18next** (já presentes no projeto) com arquivos JSON centralizados. Um pipeline de tradução automática via **Gemini API** permite que novas chaves adicionadas em português sejam automaticamente traduzidas para os outros idiomas.

---

## 2. Arquitetura

### 2.1 Stack Técnica

| Componente | Tecnologia | Versão |
|------------|-----------|--------|
| Framework i18n | i18next | ^26.0.1 |
| Binding React | react-i18next | ^17.0.1 |
| Tradução automática | Gemini API (2.0 Flash) | — |
| Testes unitários | Vitest + React Testing Library | ^4.1.2 |
| Testes E2E | Playwright | ^1.58.2 |
| Runtime | tsx | ^4.21.0 |

### 2.2 Decisão Arquitetural: Por que não Next.js i18n?

O projeto Gravity é 100% **Vite + React Router** (SPA), não Next.js. Por isso:

- **next-intl** e **next-i18next** não se aplicam
- Não há roteamento por prefixo de URL (`/pt/`, `/en/`, `/es/`)
- A troca de idioma é feita via `i18next.changeLanguage()` no client-side
- A persistência usa `localStorage` (chave `gravity:language`)
- O `<html lang="">` é atualizado dinamicamente

### 2.3 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    FONTE DA VERDADE                          │
│                      pt.json (~950 chaves)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │  scripts/ativamente/translate.ts   │
          │  (Pipeline Gemini)      │
          └────────────┬────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      en.json      es.json     (futuros idiomas)
      924 chaves   924 chaves
          │            │
          └────────────┼────────────┘
                       │
          ┌────────────┴────────────┐
          │   i18n.ts (nucleo)      │
          │   Carrega recursos      │
          └────────────┬────────────┘
                       │
          ┌────────────┴────────────┐
          │   I18nProvider          │
          │   (React Context)       │
          └────────────┬────────────┘
                       │
          ┌────────────┴────────────┐
          │   useTranslation()      │
          │   t('chave')            │
          │   50+ componentes       │
          └─────────────────────────┘
```

---

## 3. Estrutura de Arquivos

### 3.1 Arquivos de Tradução

```
nucleo-global/Utilidades/Localization/
├── i18n.ts              ← Configuração central (7 idiomas registrados)
├── provider.tsx          ← I18nProvider React
└── locales/
    ├── pt.json           ← FONTE DA VERDADE (~950 chaves)
    ├── en.json           ← Inglês (924 chaves)
    ├── es.json           ← Espanhol (924 chaves)
    ├── zh.json           ← Chinês (legado, 149 chaves)
    ├── de.json           ← Alemão (legado, 149 chaves)
    ├── it.json           ← Italiano (legado, 149 chaves)
    └── ar.json           ← Árabe (legado, 149 chaves)
```

> **Nota:** zh, de, it e ar são idiomas legados com apenas ~149 chaves do núcleo original. Podem ser expandidos futuramente rodando `npm run translate` com os idiomas adicionados ao script.

### 3.2 Componente LanguageSwitcher

```
nucleo-global/Layout/language-switcher-global/
├── package.json
└── src/
    ├── index.ts
    ├── LanguageSwitcherGlobal.tsx    ← Componente dropdown PT/EN/ES
    └── language-switcher-global.css  ← Estilos (CSS Variables)
```

### 3.3 Scripts de Tradução

```
scripts/
├── translate.ts           ← Pipeline principal (Gemini API)
└── translate-hook.ts      ← Hook pós-edição de pt.json
```

### 3.4 Testes

```
testes/
├── testes-unitarios/i18n/
│   ├── vitest.config.ts              ← Config Vitest isolada
│   ├── translate-script.test.ts      ← 9 testes do pipeline
│   ├── messages-integrity.test.ts    ← 13 testes de integridade
│   └── language-switcher.test.tsx    ← 11 testes do componente
└── testes-e2e/i18n/
    ├── language-routing.spec.ts      ← Roteamento e troca de idioma
    ├── language-persistence.spec.ts  ← Persistência entre navegações
    └── no-missing-translations.spec.ts ← Detecção de chaves cruas
```

---

## 4. Namespaces de Tradução

As ~950 chaves estão organizadas em namespaces semânticos dentro do pt.json:

| Namespace | Quantidade | Descrição |
|-----------|-----------|-----------|
| `comum` | ~40 | Termos genéricos (Salvar, Cancelar, Status...) |
| `acoes` | ~8 | Ações genéricas (Voltar, Continuar, Ver detalhes...) |
| `shell` | ~70 | Shell de navegação, header, sidebar, menus |
| `shell.menu` | ~20 | Itens do menu lateral |
| `shell.secao` | ~5 | Seções do menu |
| `shell.idioma` | ~5 | Seletor de idioma |
| `modal` | ~5 | Modais genéricos |
| `tabela` | ~30 | Componente TabelaGlobal |
| `campo` | ~10 | Componentes de campo/input |
| `calendario` | ~25 | Componente de calendário |
| `botoes` | ~6 | Componente de botões salvar/cancelar |
| `feedback` | ~5 | Status de salvamento |
| `usuario` | ~15 | Menu de perfil do usuário |
| `login` | ~20 | Tela de login/registro/recuperação |
| `admin.layout` | ~20 | Layout do painel admin |
| `admin.cockpit` | ~26 | **API Cockpit (PT-ONLY)** |
| `admin.monitor` | ~25 | Monitor de infraestrutura |
| `admin.overview` | ~35 | Visão geral admin |
| `admin.security` | ~60 | Painel de segurança |
| `admin.financial` | ~15 | Financeiro admin |
| `admin.users` | ~30 | Usuários globais |
| `admin.products` | ~25 | Catálogo de produtos |
| `admin.history` | ~25 | Histórico global |
| `admin.tests` | ~10 | Log de testes |
| `admin.deploy` | ~25 | Deploy Railway |
| `workspace.layout` | ~10 | Layout do configurador |
| `workspace.connectors` | ~15 | Conectores |
| `workspace.organization` | ~12 | Organização |
| `workspace.users` | ~6 | Usuários do workspace |
| `workspace.workspaces` | ~8 | Workspaces |
| `workspace.subscriptions` | ~15 | Assinaturas |
| `workspace.financeiro-configurador` | ~12 | Financeiro workspace |
| `simulacusto` | ~80 | Produto SimulaCusto |
| `bidfrete` | ~60 | Produto BID Frete |
| `bidcambio` | ~20 | Produto BID Câmbio |
| `pedido` | ~35 | Produto Pedidos |
| `processo` | ~50 | Produto Processos |
| `marketplace` | ~30 | Landing page Marketplace |
| `tenant_dashboard` | ~25 | Dashboard consolidado |

---

## 5. Regra de Exclusão: admin.cockpit

O namespace `admin.cockpit` contém textos do API Cockpit do painel admin, que é usado exclusivamente por administradores internos da Gravity. Por decisão de negócio:

- As chaves `admin.cockpit.*` existem **apenas em pt.json**
- **Não são traduzidas** para en.json ou es.json
- O pipeline Gemini as ignora via `SKIP_NAMESPACES = ['admin.cockpit']`
- Os testes de integridade validam que:
  - Todas as chaves `admin.cockpit.*` existem em pt.json com valor não vazio
  - Nenhuma chave `admin.cockpit.*` existe em en.json ou es.json

### Como adicionar mais namespaces excluídos

Edite a constante `SKIP_NAMESPACES` em dois locais:

1. **`scripts/ativamente/translate.ts`** — para o pipeline de tradução
2. **`testes/testes-unitarios/i18n/translate-script.test.ts`** — para os testes
3. **`testes/testes-unitarios/i18n/messages-integrity.test.ts`** — para os testes

---

## 6. Pipeline de Tradução Automática (Gemini)

### 6.1 Como funciona

```
pt.json (fonte) ──► flatten ──► comparar com en.json/es.json
                                       │
                                ┌──────┴──────┐
                                │ Chaves      │
                                │ faltantes   │
                                └──────┬──────┘
                                       │
                            ┌──────────┴──────────┐
                            │ Gemini API           │
                            │ (lotes de 50 chaves) │
                            └──────────┬──────────┘
                                       │
                                ┌──────┴──────┐
                                │ Merge seguro│
                                │ (não sobres-│
                                │ creve exist.)│
                                └──────┬──────┘
                                       │
                                en.json / es.json atualizados
```

### 6.2 Comandos

```bash
# Traduz chaves faltantes (requer GEMINI_API_KEY)
npm run translate

# Lista o que seria traduzido sem chamar a API
npm run translate:check
```

### 6.3 Configuração da API Key

A chave da API Gemini deve estar em `.env.local` na raiz do projeto:

```env
GEMINI_API_KEY=AIzaSy...
```

**Nunca** hardcodar a chave no código. O script falha com mensagem clara se não encontrar a variável.

### 6.4 Prompt usado para tradução

```
Traduza os seguintes textos de português para [idioma]. Retorne APENAS
um JSON válido com as mesmas chaves. Preserve variáveis como {nome},
{valor}, {{count}}, tags HTML, e letras maiúsculas intencionais.
Contexto: são textos de interface de uma plataforma SaaS de
logística/comércio exterior.
```

### 6.5 Garantias de segurança

- **Nunca sobrescreve** tradução existente (merge aditivo)
- **Lotes de 50** chaves para não exceder limites da API
- **Temperature 0.1** para traduções consistentes
- **responseMimeType: application/json** para parsing confiável
- **Fallback gracioso** se um lote falhar, os demais continuam

---

## 7. Componente LanguageSwitcherGlobal

### 7.1 Localização na UI

O LanguageSwitcher aparece em 3 locais:

1. **Shell Header** (navegação principal) — `servicos-global/shell/Header.tsx`
2. **Admin Layout** (painel admin) — `servicos-global/configurador/src/pages/admin/AdminLayout.tsx`
3. **Workspace Layout** (configurador) — `servicos-global/configurador/src/pages/workspace/WorkspaceLayout.tsx`

### 7.2 Comportamento

1. Exibe um botão compacto com ícone de globo + código do idioma (PT/EN/ES)
2. Ao clicar, abre dropdown com as 3 opções + bandeira
3. O idioma ativo é destacado com cor e `aria-selected=true`
4. Ao selecionar:
   - Chama `i18n.changeLanguage(code)`
   - Salva em `localStorage.setItem('gravity:language', code)`
   - Atualiza `document.documentElement.lang`
   - Fecha o dropdown
5. Click fora fecha o dropdown automaticamente

### 7.3 Props

```typescript
interface LanguageSwitcherGlobalProps {
  onLanguageChange?: (lang: string) => void  // Callback opcional
}
```

### 7.4 Alias Vite

Para usar o componente em qualquer app:

```typescript
// vite.config.ts
'@nucleo/language-switcher-global': path.resolve(
  __dirname, '../../nucleo-global/Layout/language-switcher-global/src/index.ts'
)
```

### 7.5 Import

```typescript
import { LanguageSwitcherGlobal } from '@nucleo/language-switcher-global'
```

---

## 8. Persistência de Idioma

### 8.1 Fluxo de inicialização (Layout.tsx)

```typescript
React.useEffect(() => {
  const saved = localStorage.getItem('gravity:language')
  const detected = navigator.language.split('-')[0]
  const language = saved ?? detected ?? 'pt'
  document.documentElement.setAttribute('lang', language)
  if (i18n.language !== language) {
    i18n.changeLanguage(language)
  }
}, [i18n])
```

**Prioridade:**
1. Idioma salvo no `localStorage` (seleção explícita do usuário)
2. Idioma do navegador (`navigator.language`)
3. Fallback: `pt` (português)

### 8.2 Chave de localStorage

```
gravity:language = "pt" | "en" | "es"
```

### 8.3 Garantias

- Idioma persiste entre reloads da página
- Idioma persiste entre navegações (SPA)
- Idioma persiste com back/forward do browser
- Idioma é restaurado ao abrir nova aba/janela

---

## 9. Componentes Atualizados

### 9.1 Shell (6 arquivos)

| Arquivo | Mudanças |
|---------|----------|
| `Header.tsx` | LanguageSwitcher integrado, breadcrumb via t(), tooltips, mock data |
| `Layout.tsx` | Sincronização i18n no mount, fallback texts |
| `Sidebar.tsx` | Menu items: Produtos Gravity, Meu Espaço, navegação |
| `Navigation.tsx` | ModulePlaceholder com t() |
| `ContextualSidebar.tsx` | Deep Work menu items |
| `ToastContainer.tsx` | aria-labels |

### 9.2 Nucleo-global (12 arquivos)

| Componente | Chaves usadas |
|------------|---------------|
| SelectGlobal | `campo.carregando`, `campo.nenhuma_opcao`, `campo.buscar_*` |
| CalendarioGlobal | `calendario.*` (meses, dias, presets, botões) |
| LocalizarExpandido | `campo.localizar_*` |
| BotoesSalvar | `botoes.salvar`, `botoes.salvando`, `botoes.cancelar` |
| StatusSalvar | `feedback.*` (5 estados) |
| ModalFormulario | `modal.salvar_alteracoes`, `modal.cancelar` |
| ModalFormularioAbas | `modal.salvar_alteracoes`, `modal.cancelar` |
| TabelaGlobal | `tabela.*` (~25 chaves) |
| TabelaCamadas | `tabela.*`, `comum.carregando` |
| VisibilidadeColunas | `tabela.paineis_visiveis`, `tabela.selecionar_tudo` |
| UsuarioGlobal | `usuario.*` (perfil, menu, tema) |
| LoginGlobal | `login.*` (20 chaves) |

### 9.3 Admin (6 arquivos)

| Página | Namespace |
|--------|-----------|
| AdminLayout | `admin.layout.*` |
| ApiCockpit | `admin.cockpit.*` (PT-only) |
| MonitorApisAdmin | `admin.monitor.*` |
| SegurancaAdmin | `admin.security.*` |
| HistoricoGlobalAdmin | `admin.history.*` |
| DeployRailwayAdmin | `admin.deploy.*` |

### 9.4 Workspace (7 arquivos)

| Página | Namespace |
|--------|-----------|
| WorkspaceLayout | `workspace.layout.*` |
| Organizacao | `workspace.organization.*` |
| Assinaturas | `workspace.subscriptions.*` |
| Financeiro | `workspace.financeiro-configurador.*` |
| Workspaces | `workspace.workspaces.*` |
| Usuarios | `workspace.users.*` |
| ApiCockpit | `admin.cockpit.*` |

### 9.5 Produtos (7 arquivos)

| Produto | Arquivos | Namespace |
|---------|----------|-----------|
| SimulaCusto | DashboardSimulaCusto, Estimativas, EstimativasDashboard | `simulacusto.*` |
| BID Frete | Dashboard, Cotacoes | `bidfrete.*` |
| BID Câmbio | Dashboard | `bidcambio.*` |
| Pedido | ListaPedidos | `pedido.*` |

### 9.6 Services (2 arquivos)

| Serviço | Namespace |
|---------|-----------|
| Dashboard Tenant | `tenant_dashboard.*` |
| Marketplace Home | `marketplace.*` |

---

## 10. Testes

### 10.1 Testes Unitários (33 testes — Vitest)

**Comando:** `npm test`

#### translate-script.test.ts (9 testes)

| Teste | O que valida |
|-------|-------------|
| Detecta chaves ausentes quando en.json está incompleto | Função `findMissingKeys` encontra gaps |
| Não inclui chaves que já existem no target | Chaves presentes são ignoradas |
| Detecta chaves com valor vazio como faltantes | String vazia = faltante |
| Ignora chaves do namespace admin.cockpit | `SKIP_NAMESPACES` funciona |
| Merge preserva traduções existentes | Nunca sobrescreve valor existente |
| Arquivos de tradução existem e são legíveis | pt/en/es.json estão no path correto |
| Variáveis devem estar presentes nos valores fonte | `{{count}}`, `{nome}` detectados |
| Variáveis em pt.json devem existir também em en.json | Paridade de placeholders |
| Script deve exigir GEMINI_API_KEY | Validação de segurança |

#### messages-integrity.test.ts (13 testes)

| Teste | O que valida |
|-------|-------------|
| en.json contém todas as chaves traduzíveis | Zero chaves faltantes |
| es.json contém todas as chaves traduzíveis | Zero chaves faltantes |
| en.json não tem valores vazios | Nenhuma string vazia |
| es.json não tem valores vazios | Nenhuma string vazia |
| en.json não tem valores longos idênticos ao PT | Tradução efetiva (threshold: <25) |
| en.json não tem chaves extras | Sem lixo de migração |
| es.json não tem chaves extras | Sem lixo de migração |
| admin.cockpit.* existem em pt.json | Chaves PT-only presentes |
| Nenhuma admin.cockpit.* em en.json | Exclusão funciona |
| Nenhuma admin.cockpit.* em es.json | Exclusão funciona |
| pt.json tem pelo menos 500 chaves | Consistência estrutural |
| en.json mesmo número que pt traduzível | 924 = 950 - 26 |
| es.json mesmo número que pt traduzível | 924 = 950 - 26 |

#### language-switcher.test.tsx (11 testes)

| Teste | O que valida |
|-------|-------------|
| Renderiza com idioma atual | Componente monta com "PT" |
| Abre dropdown ao clicar | Listbox aparece |
| Renderiza 3 opções | PT, EN, ES com labels corretos |
| Idioma ativo tem aria-selected=true | Acessibilidade |
| Idioma ativo tem classe CSS "active" | Visual feedback |
| Clicar EN muda para inglês | `i18n.language === 'en'` |
| Clicar ES muda para espanhol | `i18n.language === 'es'` |
| Troca salva no localStorage | `gravity:language` atualizado |
| Troca atualiza document.lang | `<html lang="es">` |
| Dropdown fecha após seleção | UX correto |
| Trigger mostra novo código | "EN" após troca |

### 10.2 Testes E2E (Playwright)

**Comando:** `npm run test:e2e`

> **Nota:** Os testes E2E requerem o Configurador rodando em `localhost:5010`.

#### language-routing.spec.ts

| Teste | O que valida |
|-------|-------------|
| Raiz carrega em português | `html[lang]` = "pt", switcher mostra "PT" |
| Trocar para EN exibe inglês | Textos em inglês visíveis |
| Trocar para ES exibe espanhol | Textos em espanhol visíveis |
| Troca mantém mesma página | URL não muda ao trocar idioma |

#### language-persistence.spec.ts

| Teste | O que valida |
|-------|-------------|
| Navegar mantém idioma | `/dashboard` → `/historico` mantém EN |
| Reload mantém idioma | F5 preserva ES via localStorage |
| Back/forward mantém idioma | Histórico não reseta idioma |

#### no-missing-translations.spec.ts

| Teste | O que valida |
|-------|-------------|
| Sem chaves cruas em PT | Nenhum "shell.menu.dashboard" visível |
| Sem chaves cruas em EN | Nenhuma chave i18n crua em inglês |
| Sem chaves cruas em ES | Nenhuma chave i18n crua em espanhol |
| Admin Cockpit PT-only | `/admin/apis` sem chaves cruas (apenas PT) |

### 10.3 Comandos de Teste

```bash
# Testes unitários (33 testes)
npm test

# Testes E2E (requer app rodando)
npm run test:e2e

# Todos os testes
npm run test:all
```

---

## 11. Guia para Desenvolvedores

### 11.1 Como adicionar um novo texto

1. Adicione a chave em **pt.json** com o texto em português:
   ```json
   {
     "simulacusto": {
       "nova_funcionalidade": "Texto da nova funcionalidade"
     }
   }
   ```

2. No componente, use `useTranslation()`:
   ```typescript
   import { useTranslation } from 'react-i18next'

   function MeuComponente() {
     const { t } = useTranslation()
     return <p>{t('simulacusto.nova_funcionalidade')}</p>
   }
   ```

3. Rode o pipeline para traduzir:
   ```bash
   npm run translate:check  # Verifica o que será traduzido
   npm run translate        # Traduz via Gemini
   ```

4. Rode os testes para validar:
   ```bash
   npm test
   ```

### 11.2 Como adicionar variáveis

```json
{
  "saudacao": "Olá, {{nome}}! Você tem {{count}} mensagens."
}
```

```typescript
t('saudacao', { nome: 'Daniel', count: 5 })
// → "Olá, Daniel! Você tem 5 mensagens."
```

### 11.3 Convenções de nomenclatura de chaves

| Padrão | Exemplo | Quando usar |
|--------|---------|-------------|
| `namespace.elemento` | `shell.busca_global` | Texto simples |
| `namespace.secao.elemento` | `shell.menu.dashboard` | Agrupamento |
| `namespace.tabela.coluna` | `admin.users.tabela.email` | Colunas de tabela |
| `namespace.status.valor` | `admin.deploy.status.concluido` | Status/badges |
| `namespace.vazio.contexto` | `admin.monitor.vazio.sem_servicos` | Empty states |
| `namespace.msg.tipo` | `workspace.organization.msg_sucesso` | Toasts/alertas |

### 11.4 Regras obrigatórias

1. **pt.json é sempre a fonte da verdade** — nunca editar en.json ou es.json manualmente
2. **Nunca hardcodar textos em português** — usar `t('chave')` sempre
3. **Nunca hardcodar GEMINI_API_KEY** — sempre via `.env.local`
4. **Todo texto novo vai para pt.json primeiro** — o pipeline cuida do resto
5. **Rodar `npm test` após mudanças** — garante integridade das traduções
6. **Chaves em snake_case** — `minha_nova_chave`, não `minhaNovaChave`
7. **Namespaces por módulo** — `simulacusto.*`, não `produtos.simulacusto.*`

### 11.5 Como adicionar um novo idioma

1. Crie o arquivo `{lang}.json` em `nucleo-global/Utilidades/Localization/locales/`
2. Adicione o idioma em `i18n.ts`:
   ```typescript
   import frTranslations from './locales/fr.json'
   // ...
   fr: { translation: frTranslations },
   ```
3. Adicione em `TARGET_LANGUAGES` no `scripts/ativamente/translate.ts`:
   ```typescript
   const TARGET_LANGUAGES = { en: 'inglês', es: 'espanhol', fr: 'francês' }
   const LANGUAGE_NAMES = { en: 'English', es: 'Spanish', fr: 'French' }
   ```
4. Adicione a opção no `LanguageSwitcherGlobal.tsx`:
   ```typescript
   const LANGUAGES = [
     { code: 'pt', label: 'Português', flag: '🇧🇷' },
     { code: 'en', label: 'English', flag: '🇺🇸' },
     { code: 'es', label: 'Español', flag: '🇪🇸' },
     { code: 'fr', label: 'Français', flag: '🇫🇷' },
   ]
   ```
5. Rode `npm run translate` para preencher o arquivo via Gemini.

---

## 12. Métricas

| Métrica | Valor |
|---------|-------|
| Total de chaves (pt.json) | ~950 |
| Chaves traduzíveis (en/es) | 924 |
| Chaves excluídas (admin.cockpit) | 26 |
| Arquivos modificados | 64 |
| Novos arquivos criados | 13 |
| Inserções de código | 6.316 |
| Remoções de código | 800 |
| Testes unitários | 33 (todos passando) |
| Testes E2E | 7 cenários |
| Componentes atualizados | 50+ |
| Namespaces de tradução | 20+ |

---

## 13. Dependências Adicionadas

```json
{
  "devDependencies": {
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@vitejs/plugin-react": "^6.0.1",
    "jsdom": "^29.0.1",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "vite": "^8.0.3"
  }
}
```

> Estas dependências foram adicionadas ao `package.json` raiz para suportar os testes unitários com React Testing Library e Vitest em ambiente jsdom.

---

## 14. Troubleshooting

### "GEMINI_API_KEY não definida"
Crie `.env.local` na raiz do projeto com `GEMINI_API_KEY=sua_chave`.

### Teste de integridade falha com "chaves faltantes"
Rode `npm run translate` para preencher as chaves ausentes via Gemini, ou adicione manualmente no en.json/es.json.

### Teste de "valores idênticos ao português" falha
Termos técnicos curtos são naturalmente iguais em ambos os idiomas (Dashboard, Status, Email). O threshold atual é <25 para strings com mais de 12 caracteres.

### LanguageSwitcher não aparece
Verifique se o alias `@nucleo/language-switcher-global` está configurado no `vite.config.ts` do app.

### Idioma reseta ao navegar
O `Layout.tsx` deve ter o `useEffect` que sincroniza `localStorage` → `i18n.changeLanguage()`. Verifique se o Layout está montado no topo da árvore de componentes.

### Testes E2E falham com timeout
Os testes E2E requerem o Configurador rodando em `localhost:5010`. Inicie com `npm run dev` antes de rodar `npm run test:e2e`.
