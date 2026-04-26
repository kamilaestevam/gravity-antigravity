---
name: antigravity-dream-team-detetive-tela
description: "Análise forense completa de uma tela existente no Gravity: frontend, backend, rotas, APIs, banco, segurança, performance e UX. Produz relatório estruturado para o dream-team-tecnologia com todos os ajustes necessários priorizados."
---

# Dream Team — Detetive de Tela

> **Papel:** Detetive forense que analisa uma tela do Gravity de ponta a ponta — front, back, rotas, APIs, banco, estado, segurança, performance e UX — e entrega relatório completo ao dream-team-tecnologia.

---

## Quando Usar Esta Skill

- Antes de qualquer modificação em tela existente (substitui suposições por evidências)
- Quando um bug é reportado e a causa raiz é desconhecida
- Quando a QA rejeita uma entrega e o agente precisa entender o estado atual
- Quando performance de uma tela está degradada
- Quando uma tela precisa ser auditada por segurança
- Quando o time quer saber o "estado real" de uma tela antes de planejar melhorias

---

## Entrada Esperada

O agente que aciona esta skill deve fornecer:

```
TELA: [nome da tela ou rota, ex: "Lista de Pedidos" / "/pedidos"]
PRODUTO: [nome do produto, ex: "pedido"]
MÓDULO: [client/ ou server/ ou ambos]
FOCO: [opcional — área específica a investigar: "segurança", "performance", "UX", "banco"]
```

Se qualquer campo estiver ausente → **perguntar antes de começar**.

---

## As 8 Fases de Análise

### Fase 1 — Identificação e Mapeamento

**Objetivo:** Entender o que a tela é e o que ela faz.

Coletar:
- Rota(s) de frontend (React Router, arquivo de rotas)
- Rota(s) de backend (Express router, arquivo de rotas do servidor)
- Propósito da tela (criar, listar, editar, visualizar, relatório)
- Produto / serviço ao qual pertence
- Dependências diretas (outros produtos, serviços de organização, APIs externas)

Artefatos:
```
[ ] Arquivo de rotas frontend identificado
[ ] Arquivo de rotas backend identificado
[ ] Propósito documentado em 1 parágrafo
[ ] Lista de dependências externas
```

---

### Fase 2 — Análise do Frontend

**Objetivo:** Documentar a árvore de componentes, estado, props e CSS.

#### 2.1 Estrutura de Componentes
- Componente raiz da página (ex: `ListaPedidos.tsx`)
- Árvore de componentes filhos e sua hierarquia
- Componentes do `nucleo-global` utilizados
- Componentes customizados (locais ao produto)
- Componentes externos (shadcn, radix, etc.)

#### 2.2 Gerenciamento de Estado
- Stores Zustand utilizadas (nome, arquivo, campos consumidos)
- React Query / TanStack Query (queries, mutations, cache keys)
- Estado local (`useState`, `useReducer`) e seus propósitos
- Context API (se houver)
- Verificar conformidade com `skills/arquitetura/state-management/SKILL.md`

#### 2.3 Hooks e Efeitos
- Hooks customizados utilizados (arquivo + propósito)
- `useEffect` com dependências corretas?
- Risco de loops infinitos ou re-renders desnecessários

#### 2.4 Props e Contratos de Interface
- Props de cada componente documentadas
- Tipos TypeScript definidos (sem `any`?)
- Props obrigatórias vs. opcionais

#### 2.5 CSS e Design System
- Classes CSS customizadas em uso
- Conformidade com `skills/ux/design-system/SKILL.md`
- Responsividade presente?
- Variáveis CSS do design system sendo respeitadas

Artefatos:
```
[ ] Árvore de componentes (texto, não precisa ser gráfico)
[ ] Lista de stores e queries em uso
[ ] Lista de hooks customizados
[ ] Problemas de tipagem encontrados
[ ] Desvios do design system
```

---

### Fase 3 — Análise do Backend

**Objetivo:** Documentar as rotas, controllers, validações e middleware.

#### 3.1 Rotas Registradas
- Arquivo de router (ex: `routes/pedidos.ts`)
- Método HTTP + path + handler para cada rota da tela
- Middleware aplicado (auth, Isolamento de Organização, rate limit)

#### 3.2 Controllers / Handlers
- Arquivo e função de cada handler
- Lógica de negócio presente no handler (deveria estar em service?)
- Separação de responsabilidades respeitada?

#### 3.3 Validações de Entrada
- Esquema Zod presente para cada rota?
- Validação acontece antes do banco?
- Campos sensíveis sanitizados?

#### 3.4 Middleware de Segurança
- JWT validado via `@clerk/backend` (autenticação APENAS — Mandamento 01)?
- Permissões consultadas via `/api/v1/me` (Prisma) — nunca lendo `publicMetadata.role`?
- `x-chave-interna` validado em chamadas inter-serviço?
- Acesso ao banco via `withTenant` / `withTenantContext` do `@gravity/tenant-resolver` (PrismaClient direto é PROIBIDO)?
- Verificar conformidade com `skills/seguranca/seguranca-5-camadas/SKILL.md`

#### 3.5 Tratamento de Erros
- Erros retornados via `AppError`?
- Algum `res.status().json()` direto (violação)?
- Stack traces expostos em produção?

Artefatos:
```
[ ] Tabela de rotas (método | path | handler | middleware)
[ ] Problemas de validação encontrados
[ ] Violações de segurança encontradas
[ ] Violações de tratamento de erro encontradas
```

---

### Fase 4 — Análise de APIs e Contratos

**Objetivo:** Verificar se a API da tela é consistente com seus contratos declarados.

#### 4.1 Contrato em contracts.json
- O endpoint está registrado em `contracts.json`?
- O shape de resposta bate com o que o frontend consome?
- Versão do endpoint correta?

#### 4.2 Schemas Zod como Contrato
- Schemas de request e response definidos?
- Breaking changes não versionados?
- Verificar conformidade com `skills/arquitetura/contract-testing/SKILL.md`

#### 4.3 Paginação e Filtros
- Paginação implementada conforme `skills/gestao/api-design/SKILL.md`?
- Filtros validados antes do banco?
- Ordenação segura (sem SQL injection via campo dinâmico)?

#### 4.4 Chamadas entre Serviços
- Chamadas para outros serviços passam pelo proxy correto?
- Headers de autenticação S2S presentes?
- Verificar conformidade com `skills/seguranca/autenticacao-s2s/SKILL.md`

Artefatos:
```
[ ] Endpoints mapeados vs. contracts.json (OK / AUSENTE / DIVERGENTE)
[ ] Schemas Zod presentes? (sim/não por rota)
[ ] Chamadas S2S identificadas e validadas
```

---

### Fase 5 — Análise do Banco de Dados

**Objetivo:** Auditar queries, Isolamento de Organização e performance de banco.

#### 5.1 Models Prisma Utilizados
- Quais models são consultados por esta tela?
- Todos têm `id_organizacao String` com paridade Prisma↔PG (sem `@map` em coluna — DDD REGRA 2, Mandamento 03)?
- Todos têm `@@map("snake_case")` apontando para a tabela PG (DDD REGRA 2 + REGRA 10)?
- Todos têm os 3 índices obrigatórios?
  - `@@index([id_organizacao])`
  - `@@index([id_organizacao, id_produto])`
  - `@@index([id_organizacao, id_usuario])`

#### 5.2 Isolamento de Organização (Schema-per-Organização)
- Acesso ao banco via `withTenant` / `withTenantContext` do `@gravity/tenant-resolver`?
- Algum uso de `new PrismaClient()` direto (violação crítica)?
- `id_organizacao` vem do JWT — nunca do body da requisição?
- Verificar conformidade com `skills/arquitetura/isolamento-organizacao/SKILL.md`

#### 5.3 Performance de Queries
- Queries N+1 identificadas?
- Relações carregadas com `include` desnecessário?
- `select` limitado aos campos necessários?
- Queries em loop (deveria ser batch)?

#### 5.4 Seeds e Dados de Teste
- `seed.ts` cobre os cenários da tela?
- Dados de demonstração realistas?

Artefatos:
```
[ ] Lista de models acessados
[ ] Checklist de id_organizacao com paridade Prisma↔PG e @@map("snake_case") (por model)
[ ] Checklist de índices (por model)
[ ] Queries problemáticas identificadas (N+1, campos extras)
```

---

### Fase 6 — Análise de Segurança

**Objetivo:** Identificar vulnerabilidades e violações das 5 camadas de segurança.

Seguindo `skills/seguranca/seguranca-5-camadas/SKILL.md`:

#### Camada 1 — Rede
- Rate limiting configurado para as rotas?
- Headers de segurança presentes (CORS, CSP)?

#### Camada 2 — Autenticação (Clerk APENAS — Mandamento 01)
- JWT validado em todas as rotas protegidas?
- Token expirado tratado corretamente?
- Clerk configurado corretamente?
- **PROIBIDO** ler `publicMetadata.role` ou qualquer campo do Clerk para autorização

#### Camada 3 — Autorização (Prisma como fonte da verdade)
- Permissões consultadas via `/api/v1/me` + `meResponseSchema.parse()` (Mandamentos 01 + 06)?
- Decisão baseada em `tipo_usuario` ou `gravity_admin` (do Prisma; DDD REGRA 5 — booleans sem prefixo `is_`)?
- Master e Super Admin reconhecidos sem `UsuarioWorkspace` (Mandamento 04)?
- Sem fallback silencioso `(data?.x?.y ?? null) as Role` (Mandamento 08)?
- Verificar conformidade com `skills/seguranca/permissoes/SKILL.md`

#### Camada 4 — Isolamento (Schema-per-Organização)
- Nenhuma query vaza dados de outra organização?
- Produtos não acessam banco do Configurador diretamente?
- Produtos não acessam banco de outros produtos?
- Acesso ao banco via `@gravity/tenant-resolver`, nunca `PrismaClient` direto?

#### Camada 5 — Auditoria
- Ações críticas registradas no histórico?
- Logs sem dados sensíveis (`console.log` expondo PII)?
- Variáveis de ambiente sem hardcode?

Artefatos:
```
[ ] Checklist das 5 camadas (OK / FALHA / NÃO APLICÁVEL por item)
[ ] Vulnerabilidades encontradas com severidade (CRÍTICA / ALTA / MÉDIA / BAIXA)
```

---

### Fase 7 — Análise de Performance

**Objetivo:** Identificar gargalos de performance no frontend e backend.

#### 7.1 Frontend
- Bundle splitting configurado (lazy imports)?
- Componentes grandes memoizados (`React.memo`, `useMemo`, `useCallback`)?
- Imagens otimizadas?
- Re-renders desnecessários (componente pai re-renderizando filhos desnecessariamente)?

#### 7.2 Backend
- Tempo de resposta estimado dentro do budget de latência (200ms)?
  - 5ms rede + 10ms middleware + 5ms validação + 80ms banco + 50ms lógica + 5ms serialização = **155ms**
- Queries pesadas identificadas?
- Caching implementado onde necessário?
- Verificar conformidade com `skills/arquitetura/caching-strategy/SKILL.md`

#### 7.3 Carregamento
- Loading states implementados?
- Skeleton screens ou spinners?
- Dados paginados (nunca `findMany` sem `take`)?

Artefatos:
```
[ ] Estimativa de latência total da tela
[ ] Problemas de performance frontend identificados
[ ] Problemas de performance backend identificados
[ ] Oportunidades de cache identificadas
```

---

### Fase 8 — Análise de UX e Acessibilidade

**Objetivo:** Verificar conformidade com design system, UX patterns e WCAG 2.1 AA.

#### 8.1 Componentes e Design System
- Componentes do `nucleo-global` sendo usados corretamente?
- Desvios do design system documentados?
- Verificar conformidade com `skills/ux/componentes/SKILL.md`

#### 8.2 Estados da Interface
- Estado vazio (empty state) implementado?
- Estado de erro implementado?
- Estado de carregamento implementado?
- Estado de sucesso/confirmação implementado?

#### 8.3 Textos e Tooltips
- Labels de campos descritivos?
- Tooltips presentes onde necessário?
- Verificar conformidade com `skills/ux/tooltip/SKILL.md`

#### 8.4 Acessibilidade
- `aria-label` em elementos interativos sem texto visível?
- Navegação por teclado funcional?
- Contraste de cores adequado?
- Verificar conformidade com `skills/ux/acessibilidade/SKILL.md`

#### 8.5 Convenções Gravity
- Título da página = nome da view atual (Lista/Dashboard/Kanban)?
- Ações CRUD no toolbar, nunca no sidebar?
- Títulos de colunas centralizados (`.gtv-th`)?

Artefatos:
```
[ ] Estados implementados (vazio / erro / loading / sucesso)
[ ] Problemas de acessibilidade encontrados
[ ] Desvios de convenções Gravity
```

---

## Formato do Relatório Final

O relatório deve ser entregue ao dream-team-tecnologia no seguinte formato:

```markdown
# Relatório Detetive de Tela — [Nome da Tela]

**Data:** YYYY-MM-DD  
**Produto:** [nome]  
**Analisado por:** Detetive de Tela  
**Destinatário:** Dream Team Tecnologia

---

## 1. Identidade da Tela
[Descrição curta do que a tela faz e sua rota]

## 2. Inventário Completo

### Frontend
- Componente raiz: `[arquivo]`
- Componentes nucleo-global: [lista]
- Stores: [lista]
- Queries: [lista]

### Backend
- Rotas: [tabela método | path | handler]
- Middleware: [lista]

### Banco
- Models: [lista]
- Queries principais: [lista]

---

## 3. Achados por Categoria

### 🔴 CRÍTICO — Bloqueia entrega
[Itens com severidade crítica — segurança, Isolamento de Organização, dados expostos, autorização via publicMetadata]

### 🟠 ALTO — Corrigir nesta sprint
[Bugs funcionais, violações de código-standards, missing validations]

### 🟡 MÉDIO — Corrigir na próxima sprint
[Performance, UX gaps, missing states]

### 🟢 BAIXO — Melhoria futura
[Refactoring, otimizações, tooltips ausentes]

---

## 4. Plano de Ajustes para o Dream Team Tecnologia

| # | Ajuste | Categoria | Severidade | Arquivo(s) | Skill de Referência |
|---|--------|-----------|------------|------------|---------------------|
| 1 | [descrição] | Segurança | CRÍTICO | `arquivo.ts:linha` | `seguranca-5-camadas` |
| 2 | [descrição] | Backend | ALTO | `arquivo.ts:linha` | `code-standards` |
| 3 | [descrição] | Frontend | MÉDIO | `arquivo.tsx:linha` | `state-management` |

---

## 5. O Que Está Correto

[Listar explicitamente o que está bem implementado — evita regressões]

---

## 6. Próximos Passos Recomendados

1. [Ação imediata — CRÍTICO]
2. [Ação desta sprint — ALTO]
3. [Backlog — MÉDIO/BAIXO]

---

## 7. Skills Consultadas Nesta Análise

[Lista de skills que foram verificadas durante a análise]
```

---

## Regras do Detetive

1. **Nunca assumir** — se um arquivo não foi lido, não opinar sobre ele
2. **Nunca escrever código** — esta skill é somente de análise e relatório
3. **Citar linha exata** — todo achado deve ter `arquivo.ts:linha` para rastreabilidade
4. **Separar fato de opinião** — "linha 42 usa `any`" é fato; "poderia ser melhor" não é achado
5. **Priorizar corretamente** — CRÍTICO = risco de segurança ou perda de dados; ALTO = bug funcional; MÉDIO = degradação de UX; BAIXO = cosmético
6. **Não inflar o relatório** — 5 achados reais valem mais que 20 superficiais
7. **Registrar o que está correto** — relatório deve ter seção positiva para evitar regressões
8. **Ler skills de referência** — antes de classificar um achado, verificar a skill relevante

---

## Integração com Outras Skills

| Situação | Skill a Acionar Após o Relatório |
|----------|----------------------------------|
| Achados CRÍTICO de segurança | `skills/seguranca/seguranca-5-camadas/SKILL.md` + notificar Líder |
| Achados de banco sem `id_organizacao` ou usando `PrismaClient` direto | `skills/arquitetura/isolamento-organizacao/SKILL.md` + Coordenador |
| Achados de autorização via `publicMetadata` (anti-padrão) | `skills/governanca/9-mandamentos/SKILL.md` (Mandamento 01) + Coordenador |
| Achados de schema/model | `skills/arquitetura/schema-composition/SKILL.md` + Coordenador |
| Ajustes identificados | `skills/dream-team-ajustes/SKILL.md` (executor dos ajustes) |
| Validação pós-ajuste | `skills/agentes/qa/SKILL.md` |
| Teste visual pós-ajuste | `skills/arquitetura/teste-em-tela/SKILL.md` |

---

## Anti-Padrões a Evitar

- **Análise superficial:** Ler só o componente raiz e ignorar o backend
- **Relatório sem linha de código:** Todo achado precisa de rastreabilidade
- **Achados sem severidade:** Cada item deve ter CRÍTICO / ALTO / MÉDIO / BAIXO
- **Esquecer a seção "O que está correto":** Essencial para evitar regressões
- **Misturar análise com implementação:** O Detetive analisa — o dream-team-ajustes implementa
- **Não consultar skills de referência:** Classificar um achado sem ler a skill relevante gera falsos positivos
- **Relatório sem plano de ação:** O destinatário precisa saber o que fazer, não só o que está errado
