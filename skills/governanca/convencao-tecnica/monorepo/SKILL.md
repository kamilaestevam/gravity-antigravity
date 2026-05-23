---
name: antigravity-monorepo
description: "Consulte esta skill antes de alterar package.json, tsconfig.json, vite.config.ts, instalar dependências ou criar novos pacotes. Define as regras de proteção do monorepo: workspaces, aliases, versões, overrides e estrutura de build."
---

# Gravity — Governança do Monorepo (Fase 1)

> **Contexto:** O projeto está na **Fase 1 — Fundação**. A arquitetura é "monorepo simples" com NPM workspaces padrão, conforme o Documento de Arquitetura. Ferramentas avançadas de monorepo (Turborepo, Nx, Lerna) e package managers alternativos (pnpm, yarn, bun) estão planejados para **Fases futuras** (Fase 3 — com 3+ produtos em produção). Adotá-los agora causaria quebras estruturais inaceitáveis.

## Regra de Ouro — NPM Apenas

O projeto usa **exclusivamente `npm workspaces`**. Esta é a regra de maior prioridade.

### ❌ Estritamente Proibido

- **Nunca** instalar, sugerir, configurar ou migrar para `pnpm`, `yarn`, `bun` ou qualquer outro package manager
- **Nunca** instalar ou configurar `Turborepo`, `Nx`, `Lerna` ou qualquer ferramenta de orquestração de monorepo
- **Nunca** adicionar `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb` ou qualquer lockfile que não seja `package-lock.json`

> **Por quê?** Na Fase 1, o monorepo funciona com NPM workspaces + overrides + aliases Vite. Migrar o "motor" agora quebraria imports que funcionam hoje (dependências fantasmas) e exigiria auditar cada import de cada produto. O Documento de Arquitetura diz explicitamente: *"Sem ferramenta de monorepo por enquanto"* e *"Migrar para pnpm workspaces"* está na Fase 3.

---

## Regra Fundamental

O monorepo Gravity tem uma infraestrutura padronizada que **nunca pode ser alterada sem aprovação do Líder**. Todo agente que precise instalar dependências, criar pacotes ou modificar configuração de build deve consultar esta skill primeiro.

---

## Arquivos Protegidos — Nunca Alterar Sem Aprovação

| Arquivo | Quem pode alterar | O que protege |
|:---|:---|:---|
| `package.json` (raiz) | Líder ou Coordenador | Workspaces, overrides, versões base |
| `tsconfig.json` (raiz) | Líder ou Coordenador | Paths base de todo o monorepo |
| `tsconfig.paths-produto.json` | Líder ou Coordenador | Paths para `produto/*/client` e `server` |
| `tsconfig.paths-servico.json` | Líder ou Coordenador | Paths para `servicos-global/*` |
| `tsconfig.paths-plataforma.json` | Líder ou Coordenador | Paths para `servicos-global/servicos-plataforma/*` |
| `tsconfig.paths-plataforma-client.json` | Líder ou Coordenador | Paths para `servicos-global/servicos-plataforma/*/client` |
| `nucleo-global/vite-aliases.ts` | Líder ou Coordenador | Aliases automáticos do Vite |

---

## 1. Workspaces

O `package.json` raiz define **todos os pacotes** do monorepo via `workspaces`. O NPM cria symlinks automaticamente em `node_modules/`.

### ✅ Correto

```bash
# Para adicionar um novo pacote ao monorepo:
# 1. Criar a pasta com package.json (name obrigatório)
# 2. Adicionar ao array "workspaces" no package.json raiz
# 3. Rodar npm install na raiz
```

### ❌ Proibido

```bash
# Nunca rodar npm install dentro de um sub-pacote
cd produto/pedido/client && npm install  # ❌ PROIBIDO

# Nunca remover workspaces do package.json raiz
# Nunca criar package.json sem "name"
```

---

## 1.bis. Scripts `dev` — padrão `--env-file` obrigatório (2026-05-14)

Todo serviço backend (tsx watch) **deve** carregar env via `--env-file` do tsx, não confiar só em `dotenv.config()` inline no `index.ts`.

### Razão

ESM hoista todos os imports antes do corpo do módulo executar. Se algum módulo importado lê `process.env.X` em tempo de import (ex: `criarMiddleware({ url: process.env.X! })` no top-level de `permissoes.ts`), a variável ainda é `undefined` — `dotenv.config()` do `index.ts` só roda depois. Bug **quebrou produção do Pedido em 2026-05-14**. Detalhes em [`lei/sdk-resolvedor-organizacao`](../../lei/sdk-resolvedor-organizacao/SKILL.md#-regra-absoluta--lazy-init-quando-o-middleware-mora-em-arquivo-separado-2026-05-14).

### Padrão obrigatório

```json
// package.json de qualquer serviço backend
{
  "scripts": {
    "dev": "tsx watch --env-file=<path>/.env.local --env-file=.env server/src/index.ts"
  }
}
```

O `--env-file` do tsx popula `process.env` **antes** do Node ler o primeiro `import` — fechando o gap do ESM hoisting.

### Profundidade do `--env-file` por localização

| Serviço fica em | `--env-file` do `.env.local` da raiz |
|:---|:---|
| `servicos-global/<x>/` (ex: configurador, marketplace, cadastros) | `../../.env.local` |
| `servicos-global/servicos-plataforma/<x>/` (ex: api-cockpit, email) | `../../../.env.local` |
| `servicos-global/produto/<x>/` (ex: pedido, processo) | `../../../.env.local` |
| `servicos-global/produto/<x>/server/` | `../../../../.env.local` |

Local `.env` do serviço sempre fica em `--env-file=.env` (relativo ao cwd do `npm run dev`).

### Padrão proibido

```json
// ❌ Frágil — depende de dotenv.config() inline carregar ANTES de qualquer
// import ler env (não funciona em ESM)
"dev": "tsx watch server/src/index.ts"
```

### Orchestrator PM2 — `ecosystem.config.cjs` (2026-05-23)

O dev master passou de `concurrently -k` para **PM2** (`npm run pm2:start`). O PM2 garante:
- Cada serviço reinicia **independentemente** — crash de um não derruba os outros
- PORT explícito em cada entry — sem herança de variável de ambiente
- Backoff exponencial — evita loop de crash em falha de banco
- Todos os 14 serviços sobem com um único comando

| Nome PM2 | Serviço | Porta |
|:---|:---|:---:|
| cfg-back | Configurador backend | 8005 |
| cfg-front | Configurador Vite frontend | 8000 |
| org | Plataforma super-server | 3001 |
| cockpit | API-Cockpit | 8016 |
| conector-erp | Conector ERP | 8017 |
| sc-back | Simula-Custo | 8020 |
| bid-frete | Bid Frete Internacional | 8023 |
| bid-cambio | Bid Câmbio | 8025 |
| proc-back | Processo | 8026 |
| lpco | LPCO | 8027 |
| nf-importacao | NF Importação | 8028 |
| fin-comex | Financeiro COMEX | 8029 |
| pedido | Pedido | 8030 |
| cadastros | Cadastros | 8031 |

**Comandos:**

```bash
npm run pm2:start      # sobe todos os 14
npm run pm2:stop       # para todos
npm run pm2:restart    # reinicia todos
npm run pm2:status     # lista status + PID + restarts
npm run pm2:logs       # tail de todos os logs
npm run dev:reset      # PM2 delete + kill portas + clear .vite (reset total)
```

Adicionar/remover serviços do `ecosystem.config.cjs` exige aprovação do Líder.

### Regra absoluta — `--env-file` em todo script `dev` de backend (2026-05-14)

> Ver seção "1.bis" acima para a regra completa e motivo (ESM hoisting bug).

### Comando de reset

`npm run dev:reset` (script em `scripts/ativamente/dev-reset.ts`):
1. Remove todos os processos PM2 (`pm2 delete ecosystem.config.cjs`)
2. Mata processos node nas 14 portas conhecidas (zombies EADDRINUSE)
3. Apaga todos os `node_modules/.vite` (cache stale após mudança de estrutura)

Não toca em banco, `.env`, ou código. Higiene de PM2 + processos + caches.

---

## 2. Aliases do Vite — Automáticos via `vite-aliases.ts`

O arquivo `nucleo-global/vite-aliases.ts` escaneia automaticamente todas as categorias do `nucleo-global/` e gera aliases `@nucleo/*` em runtime.

### ✅ Correto — Criar novo componente no nucleo-global

```bash
# Basta criar a pasta com a estrutura padrão:
nucleo-global/Campos/meu-novo-campo/src/index.ts

# O vite-aliases.ts detecta automaticamente — NENHUM vite.config.ts precisa mudar
```

### ✅ Correto — Componente fora do padrão

Se o componente **não** segue `Categoria/componente/src/index.ts`, adicionar em `getSpecialAliases()` dentro de `vite-aliases.ts`:

```typescript
// Em nucleo-global/vite-aliases.ts → getSpecialAliases()
'@nucleo/meu-alias': path.resolve(nucleoRoot, 'Caminho/especial/arquivo.ts'),
```

### ❌ Proibido — Alias manual no vite.config.ts

```typescript
// ❌ NUNCA adicionar alias manual em vite.config.ts de produto
alias: {
  '@nucleo/meu-componente': path.resolve(...) // PROIBIDO
}

// ✅ O vite-aliases.ts já cuida disso automaticamente
alias: {
  ...createNucleoAliases(monorepoRoot),  // gera todos os aliases
}
```

### ❌ Proibido — Caminhos relativos longos

```typescript
// ❌ NUNCA cruzar fronteiras de pacote com caminhos relativos
import { TabelaGlobal } from '../../../../nucleo-global/Tabelas/tabela-global/src'
import { something } from '../../../servicos-global/servicos-plataforma/gabi/src'

// ✅ SEMPRE usar aliases configurados
import { TabelaGlobal } from '@nucleo/tabela-global'
import { something } from '@tenant/gabi'
```

### Três funções disponíveis

| Função | O que gera | Quando usar |
|:---|:---|:---|
| `createNucleoAliases(root)` | `@nucleo/*` para 16 categorias | **Todo** vite.config.ts de client |
| `createServiceAliases(root)` | `@gravity/shell`, `@shell`, `@tenant`, `@produto` (alias `@tenant` preservado por compatibilidade do vite-aliases.ts) | **Todo** vite.config.ts |
| `createTenantAliases(root, [...])` | `@tenant/gabi`, `@tenant/historico`, etc. | Só quando importar organizacao específico |

---

## 3. TypeScript — Extends Obrigatório

Todo `tsconfig.json` de produto ou serviço **deve usar `extends`** dos arquivos base da raiz.

### ✅ Correto — Client de produto

```json
{
  "extends": ["../../../tsconfig.json", "../../../tsconfig.paths-produto.json"],
  "compilerOptions": { "baseUrl": "." },
  "include": ["src"]
}
```

### ✅ Correto — Server de produto

```json
{
  "extends": ["../../../tsconfig.json", "../../../tsconfig.paths-produto.json"],
  "compilerOptions": { "baseUrl": ".", "outDir": "dist", "rootDir": "." },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### ✅ Correto — Organizacao service

```json
{
  "extends": ["../../../tsconfig.json", "../../../tsconfig.paths-plataforma.json"],
  "compilerOptions": { "baseUrl": ".", "rootDir": ".", "outDir": "dist" },
  "include": ["src/**/*", "server/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### ❌ Proibido

```json
// ❌ Nunca duplicar paths manualmente
{
  "compilerOptions": {
    "paths": {
      "@nucleo/*": ["../../../nucleo-global/*"]  // PROIBIDO — usar extends
    }
  }
}

// ❌ Nunca criar tsconfig sem extends
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022"  // PROIBIDO — já está no tsconfig.json raiz
  }
}
```

---

## 4. Versões Travadas — Overrides

O `package.json` raiz tem `overrides` que **forçam versão única** das libs críticas em todo o monorepo:

| Lib | Versão travada | Motivo |
|:---|:---|:---|
| `react` | `^18.3.0` | Evitar conflito React 18 vs 19 |
| `react-dom` | `^18.3.0` | Par do React |
| `i18next` | `^26.0.1` | Versão única de i18n |
| `react-i18next` | `^17.0.1` | Par do i18next |
| `zustand` | `^5.0.12` | Store global compartilhado |
| `@prisma/client` | `^5.22.0` | ORM único |
| `express` | `^4.19.0` | Backend padronizado |
| `zod` | `^3.25.76` | Validação padronizada |
| `vite` | `^5.4.21` | Build tool |
| `typescript` | `^5.4.0` | Compilador |

### ✅ Correto — Instalar dependência em sub-pacote

```bash
# Sempre instalar via workspace na raiz
npm install nova-lib -w produto/pedido/client
```

### ❌ Proibido

```bash
# Nunca instalar versão diferente de lib travada
npm install react@19 -w produto/pedido/client  # ❌ override vai bloquear

# Nunca remover ou alterar overrides sem aprovação do Líder
```

---

## 5. Estrutura Obrigatória de Pacote

Todo novo pacote no monorepo deve seguir esta estrutura:

### Client (frontend)

```
produto/meu-produto/client/
├── package.json          ← name obrigatório, type: "module"
├── tsconfig.json         ← extends do tsconfig.paths-produto.json
├── vite.config.ts        ← usa createNucleoAliases + createServiceAliases
└── src/
    └── index.ts
```

### Server (backend)

```
produto/meu-produto/server/
├── package.json          ← name obrigatório, type: "module"
├── tsconfig.json         ← extends do tsconfig.paths-produto.json
└── src/
    └── index.ts
```

### Componente nucleo-global

```
nucleo-global/Categoria/meu-componente/
├── package.json          ← name: @nucleo/meu-componente
├── tsconfig.json
└── src/
    └── index.ts          ← export principal (detectado automaticamente)
```

---

## 6. Lib de Ícones — Phosphor Icons

O projeto usa **@phosphor-icons/react** como lib de ícones padrão.

### ❌ Proibido

- Nunca instalar `lucide-react` em novos pacotes (legado tolerado apenas onde já existe)
- Nunca instalar outras libs de ícones (heroicons, fontawesome, etc.)
- Nunca usar SVGs inline quando o ícone existe no Phosphor Icons

---

## 7. Pre-commit Hooks (Husky + lint-staged)

Todo commit passa por verificação automática via Husky + lint-staged:

- `package.json` alterado → `check-deps.ts` valida versões e type:module
- `.ts/.tsx` alterado → `check-deps.ts` verifica require(), @ts-ignore, any

### ❌ Proibido

- Nunca commitar com `--no-verify` para pular hooks
- Nunca remover ou alterar `.husky/pre-commit` sem aprovação do Líder

---

## Checklist — Antes de Alterar Infraestrutura

- [ ] Li esta skill?
- [ ] A alteração está dentro do meu escopo autorizado?
- [ ] Se vou instalar uma dependência → é via `npm install -w` na raiz?
- [ ] Se vou criar um pacote → adicionei ao `workspaces` da raiz?
- [ ] Se vou criar um componente no nucleo-global → segue `Categoria/componente/src/index.ts`?
- [ ] Se vou criar vite.config.ts → usa `createNucleoAliases` e `createServiceAliases`?
- [ ] Se vou criar tsconfig.json → usa `extends` do arquivo base?
- [ ] Não estou instalando versão diferente de uma lib travada nos overrides?
- [ ] Se bloqueado → parar e notificar o Líder?

---

## Quando Escalar

O agente **para e notifica o Líder** quando:

- Precisa alterar qualquer arquivo listado em "Arquivos Protegidos"
- Precisa instalar versão diferente de uma lib travada nos overrides
- Precisa criar uma nova categoria no `nucleo-global/`
- Precisa alterar a estrutura de workspaces
- Há conflito de dependência que não se resolve com `npm install`
