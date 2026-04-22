---
name: antigravity-dream-team-ajustes
description: "Protocolo obrigatório para qualquer modificação em código existente. Antes de tocar uma linha, mapeia o contexto, lê skills relevantes com paths exatos, verifica histórico git, calcula raio de impacto, identifica causa raiz real e define plano de validação. Elimina o ciclo fix→regressão→fix. Ativar com /ajuste para toda correção, ajuste, refactor ou melhoria pontual em arquivo já existente."
---

# Gravity — Dream Team Ajustes
## Cirurgia de Código v3.0

## Por que esta skill existe

O efeito cascata é o inimigo central: um ajuste pontual resolve A, mas quebra B
silenciosamente porque ninguém mapeou que B depende de A. Ajustes são feitos em
velocidade de feature, quando exigem velocidade de cirurgião.

Esta skill existe para tornar cada ajuste **rastreável, reversível e verificado**
— eliminando o ciclo vicioso de "enxugar gelo".

Esta skill **não substitui o QA**. Ela prepara e executa o ajuste com segurança.
O QA skill é acionado obrigatoriamente após a Fase 7, conforme regras definidas
na seção "Integração com o Ecossistema" ao final deste documento.

---

## Quando Esta Skill É Obrigatória

Ativar SEMPRE que o arquivo a modificar **já existe** e qualquer condição abaixo for verdadeira:

- O arquivo tem importadores (outros arquivos que o importam)
- A mudança afeta tipo, interface ou schema Zod
- A mudança afeta rota de API (GET/POST/PUT/DELETE)
- A mudança afeta componente React usado em mais de uma tela
- A mudança afeta CSS (classe ou variável de design token)
- A mudança afeta query Prisma, campo de banco ou migration
- A mudança afeta middleware (auth, organização, correlação)
- O mesmo sintoma retornou após fix anterior neste arquivo (sinal de ciclo)

**Não se aplica apenas:** arquivo novo criado do zero, sem nenhum consumidor ainda.

---

## FASE 0 — Leitura Obrigatória de Contexto

**Esta fase não é opcional. Nenhum trabalho começa sem ela.**
**Cada item abaixo é um bloqueante — não uma sugestão.**

### 0.1 — Ler as skills relevantes do projeto

O agente deve abrir e ler cada skill relevante para o tipo de mudança antes de
qualquer análise. "Conhecer" a skill de memória não substitui a releitura — o
conteúdo pode ter mudado desde a última sessão.

**Duas skills são universais — ler em todo ajuste, sem exceção:**

```
skills/governanca/agent-policy/SKILL.md
skills/governanca/code-standards/SKILL.md
```

**Skills adicionais por tipo de mudança — ler as que se aplicam:**

| Tipo de Mudança | Skills a Ler (paths exatos) |
|:----------------|:----------------------------|
| Rota de API backend | `skills/seguranca/sla-performance/SKILL.md` + `skills/arquitetura/tenant-isolation/SKILL.md` |
| Query Prisma / campo de banco | `skills/arquitetura/tenant-isolation/SKILL.md` + `skills/infra-estrutura/database-operations/SKILL.md` |
| Schema Zod exportado | `skills/arquitetura/contract-testing/SKILL.md` |
| Componente React (`nucleo-global/`) | `skills/arquitetura/nucleo-global/SKILL.md` + `skills/ux/design-system/SKILL.md` |
| Middleware de autenticação | `skills/seguranca/autenticacao-s2s/SKILL.md` + `skills/seguranca/permissoes/SKILL.md` |
| Chamada entre serviços (S2S) | `skills/seguranca/autenticacao-s2s/SKILL.md` + `skills/arquitetura/resilience-patterns/SKILL.md` |
| CSS compartilhado / design tokens | `skills/ux/design-system/SKILL.md` + `skills/ux/acessibilidade/SKILL.md` |
| Migration Prisma | `skills/governanca/deploy/SKILL.md` + `skills/infra-estrutura/database-operations/SKILL.md` |
| `shared/types.ts` | `skills/arquitetura/contract-testing/SKILL.md` |
| Estado global (store/context) | `skills/arquitetura/state-management/SKILL.md` |

> **Regra:** se uma skill existe e é ignorada durante o ajuste, o ajuste está
> incompleto por definição — independente da qualidade técnica da execução.

**Confirmar:** `[ ]` Todas as skills relevantes para este tipo de mudança foram
lidas nesta sessão.

### 0.2 — Confirmar a visão geral do produto

Antes de mapear arquivos, confirmar a arquitetura do produto:

```
- Qual é o nome do produto sendo ajustado?
- Qual porta ele roda localmente?
- Qual é a stack principal (framework, banco, ORM)?
- Quais serviços externos ele consome ou expõe?
- Há comunicação assíncrona (webhooks, filas, eventos)?
- Qual é o modelo de multi-tenancy (se aplicável)?
```

Sem essa confirmação, o mapeamento de dependências é cego para integrações
que não aparecem nos imports de arquivos — por exemplo, dois serviços que se
comunicam via webhook assíncrono nunca aparecerão num grep de imports.

### 0.3 — Mapear a estrutura do projeto

**Windows (PowerShell) — ambiente padrão deste projeto:**
```powershell
Get-ChildItem -Recurse -Include "*.ts","*.tsx" | Select-Object -ExpandProperty FullName | Select-Object -First 80
Get-ChildItem src, apps, packages, shared -ErrorAction SilentlyContinue
```

**Ou via ferramentas nativas do Claude Code (preferencial):**
Usar Glob com padrão `**/*.ts` e `**/*.tsx` no diretório do módulo afetado.

**Ambos os ambientes:**
```bash
cat package.json
cat tsconfig.json
```

> **Nota de ambiente:** este projeto roda em Windows 11. Sempre preferir
> PowerShell ou ferramentas nativas do Claude Code. Evitar comandos `find`
> Unix sem confirmação de que WSL está disponível.

### 0.4 — Ler o histórico recente de commits

```bash
git log --oneline -20
git log --oneline --all --since="7 days ago"
```

**Por quê:** o ciclo vicioso frequentemente tem origem em um commit recente
que tocou num contrato compartilhado. Sem ler o histórico, o Analista opera
às cegas sobre o que já foi tentado antes.

### 0.5 — Identificar zona de risco (arquivos alterados recentemente)

```bash
git diff --name-only HEAD~5 HEAD
# Para arquivos críticos suspeitos:
git log --oneline --follow -- shared/types.ts
git log --oneline --follow -- [arquivo-suspeito]
```

**Detecção de ciclo obrigatória:**

```
HISTÓRICO DO ARQUIVO ALVO:
  Último commit que tocou neste arquivo: [hash + mensagem]
  Há quantos dias: [N dias]
  Estava dentro de um fix anterior: [ ] Sim / [ ] Não

DETECÇÃO DE CICLO:
  O mesmo sintoma já retornou após um fix anterior neste arquivo? [ ] Sim / [ ] Não
  Se SIM → PARAR IMEDIATAMENTE.
  Criar o Relatório de Impacto agora em:
    documentos-tecnicos/ajustes/YYYY-MM-DD-ciclo-[arquivo].md
  Preencher os campos: PROBLEMA, causa raiz hipótese, "Padrão de ciclo detectado: sim".
  Salvar em disco. Escalar ao Líder com o path do arquivo.
  O ciclo foi identificado. O problema não é pontual — aplicar Fase 4.
  Nenhum código é escrito até o Líder decidir o próximo passo.
```

**Entregável obrigatório da Fase 0:**
> Mapa de Contexto — skills lidas com confirmação, produto confirmado,
> estrutura de módulos identificada, commits relevantes listados,
> ciclo descartado ou escalado.

---

## Os 4 Papéis do Dream Team

### Papel 1 — Analista de Impacto
**Nunca toca código. Só mapeia.**

Responsabilidades:
- Executar a Fase 0 completa antes de qualquer análise
- Reproduzir o problema antes de qualquer mapeamento
- Mapear todos os arquivos que dependem do código a ser alterado
- Classificar o risco (LOW / MEDIUM / HIGH / CRITICAL)
- Emitir o Relatório de Impacto com blast radius completo
- Declarar o Escopo Negativo explicitamente
- Definir critério de sucesso, critério de parada e plano de rollback
- **Decidir: este problema é um ajuste ou uma reescrita?**
  (ver seção "Fase 4 — Critério de Saída: Ajuste vs. Reescrita")

**Entregável obrigatório:** Relatório de Impacto preenchido e salvo em
`documentos-tecnicos/ajustes/YYYY-MM-DD-[descrição-curta].md`

---

### Papel 2 — Cirurgião
**Opera apenas dentro do plano aprovado. Nada além.**

Responsabilidades:
- Executar exatamente o que está no Relatório de Impacto
- Atualizar o Relatório com qualquer descoberta feita durante a execução
- Se encontrar problema fora do escopo: **parar, documentar, abrir issue separada**
- Nunca refatora, renomeia ou "melhora" código fora do escopo
- 1 problema = 1 commit (ou no máximo 1 PR)
- Se precisar tocar arquivo fora do plano: volta ao Analista para reclassificação

**Critério de parada obrigatório:**

| Situação | Ação |
|:---------|:-----|
| Encontrou problema não mapeado | Parar. Documentar no Relatório. Voltar ao Analista. |
| Fix exige arquivo fora do plano | Parar. Reclassificar risco. Obter aprovação. |
| Após 2 tentativas o problema persiste | Parar. Escalar para arquiteto. Não continuar iterando. |
| Fix resolve A mas quebra B | Parar. Não commitar. Replanejar com Analista. |

---

### Papel 3 — Verificador
**Prova que nada quebrou além do que foi consertado.**

Responsabilidades:
- Testar o módulo alterado (unitários + funcionais)
- Testar **todos** os dependentes mapeados pelo Analista
- Verificar SLA ≤ 200ms nos endpoints afetados
- Validar o fluxo de UI que consome o código alterado
- Testar cenário cross-organização se aplicável
- **Regressão histórica:** testar os cenários que quebraram nos últimos 5 commits

---

### Papel 4 — Guardião de Governança
**Última barreira antes do handoff para o QA.**

Verificar **todas** as skills lidas na Fase 0.1:
- [ ] Isolamento de Organização intacto?
- [ ] Nenhum `any` introduzido?
- [ ] Nenhum `console.log` esquecido?
- [ ] TypeScript compila limpo? (`npx tsc --noEmit`)
- [ ] Correlation ID preservado em todas as rotas afetadas?
- [ ] SLA ≤ 200ms validado?
- [ ] Escopo Negativo respeitado — os arquivos declarados fora do escopo não foram tocados?
- [ ] Todas as skills da Fase 0.1 respeitadas integralmente?

---

## Protocolo Completo — Fases 0 a 7

### FASE 1 — Diagnóstico (nunca pular)

1. **Reproduzir o problema** — se não consegue reproduzir, o problema não está
   definido. Parar e pedir mais contexto.
2. **Localizar arquivo e linha exatos** — "está quebrando o modal" não é
   diagnóstico. `ModalEdicaoEmMassa.tsx:247` é.
3. **Entender o porquê** — sintoma ≠ causa. Corrigir o sintoma é a raiz do
   "enxugando gelo".
4. **Verificar se o problema já foi tentado antes:**

```bash
git log --oneline --all -S "termoBuscado"
git log --oneline -- caminho/do/arquivo
```

**Regra:** se não reproduziu e não localizou a causa raiz, o trabalho não começa.

---

### FASE 2 — Mapeamento de Dependências

Para todo código que será alterado, mapear cada área:

**Windows (PowerShell):**
```powershell
# Buscar função ou tipo
Select-String -Recurse -Include "*.ts","*.tsx" -Pattern "NomeDaFuncaoOuTipo" -Path .

# Buscar estado global
Select-String -Recurse -Include "*.ts","*.tsx" -Pattern "nomeDoStore|nomeDoContext" -Path .

# Buscar variável de ambiente
Get-ChildItem -Recurse -Include "*.ts","*.tsx",".env*" |
  Select-String -Pattern "NOME_DA_VAR"
```

**Unix/WSL:**
```bash
grep -r "NomeDaFuncaoOuTipo" --include="*.ts" --include="*.tsx" .
grep -r "nomeDoStore\|nomeDoContext" --include="*.ts" --include="*.tsx" .
grep -r "NOME_DA_VAR" --include="*.ts" .
```

**Frontend — mapear:**
- Quais componentes importam o arquivo/função/tipo?
- Quais pages usam o componente alterado?
- Quais hooks dependem da função?

**Backend — mapear:**
- Quais rotas chamam o service alterado?
- Qual middleware é aplicado nas rotas afetadas?
- Quais outros services chamam este service?

**Contratos (o mais crítico) — mapear:**
- `shared/types.ts` — quem importa os tipos que mudarão?
- Schemas Zod — algum schema exportado muda?
- Endpoints — algum `api.ts` no frontend usa a rota alterada?

**Banco de dados — mapear:**
- Se o schema muda: quais queries usam o modelo?
- Algum índice será afetado?
- Há migration necessária?

Todos os resultados devem ser listados no Relatório de Impacto.

---

### FASE 3 — Classificação de Risco e Aprovação

| Nível | Critério | Protocolo obrigatório |
|:------|:---------|:----------------------|
| **LOW** | ≤ 2 arquivos, sem dependentes externos, zero alteração de contrato | Executar + comunicar depois |
| **MEDIUM** | 3–6 arquivos, dependentes internos ao módulo, sem mudança de contrato público | Comunicar antes + plano de rollback |
| **HIGH** | Afeta contratos públicos (tipos, endpoints), múltiplos módulos ou shared | Aprovação do Líder antes + janela de mudança definida |
| **CRITICAL** | Schema Prisma, middleware de auth, Isolamento de Organização, múltiplos produtos | Aprovação do Líder + staging obrigatório + janela de mudança + rollback testado em staging |

**Regra:** em caso de dúvida sobre nível, classificar sempre para cima.

**Janela de mudança (obrigatória para HIGH e CRITICAL):**
- Definir horário de execução (preferencialmente fora do horário de pico)
- Comunicar stakeholders antes de iniciar
- Confirmar que o responsável pelo rollback está disponível durante a execução
- Registrar o tempo estimado de rollback — se for > 30 minutos, a janela deve
  ser planejada em horário de baixo impacto

---

### FASE 4 — Critério de Saída: Ajuste vs. Reescrita

**Esta decisão é feita pelo Analista antes de qualquer execução.**

O problema pertence a esta skill (ajuste cirúrgico) se:
- A causa raiz está isolada em ≤ 1 módulo
- A correção não exige alterar contratos públicos de forma incompatível
- O blast radius é mapeável e verificável em menos de 1 ciclo de QA

O problema **sai do escopo desta skill** e entra em escopo de refatoração/reescrita se:
- A causa raiz é arquitetural (ex: estado global mal modelado, contrato público inconsistente)
- O mesmo sintoma retornou após um fix anterior — padrão de ciclo detectado, independente
  de contagem ou prazo
- O blast radius exige alterar mais de 3 contratos públicos simultaneamente
- O Cirurgião identificou efeito cascata em cascata (A→B→C→A) em ciclos anteriores

**Quando o escopo sai desta skill:**
1. Parar. Não iniciar nenhum ajuste.
2. Documentar o diagnóstico no Relatório de Impacto como "Problema Estrutural Identificado".
3. Escalar ao Líder com o Relatório de Impacto completo.
4. O Líder decide o próximo passo: refatoração planejada, coordenação entre módulos,
   ou redesenho de contrato. A execução sairá desta skill e será tratada como tarefa
   de arquitetura, com escopo e aprovação próprios.

---

### FASE 5 — Relatório de Impacto

**Salvar obrigatoriamente em:**
`documentos-tecnicos/ajustes/YYYY-MM-DD-[descrição-curta].md`

Criar o diretório se não existir. O arquivo deve persistir no repositório —
não existe apenas na conversa.

```markdown
# Relatório de Impacto — [DESCRIÇÃO CURTA]

**Data:** YYYY-MM-DD
**Responsável:** ___________
**Nível de risco:** LOW / MEDIUM / HIGH / CRITICAL
**Aprovação obtida:** sim / não / não necessária

---

## PROBLEMA

- **Descrição:** ___________
- **Reproduzido em:** ___________
- **Causa raiz identificada:** ___________
- **Arquivo e linha exatos:** ___________
- **Relacionado a ajuste anterior?** sim / não
  - Se sim, qual: `documentos-tecnicos/ajustes/[arquivo-anterior].md`
  - Padrão de ciclo detectado? ___________

---

## ESCOPO POSITIVO (o que será alterado)

| Arquivo | Motivo da alteração |
|:--------|:--------------------|
| ___     | ___                 |

## ESCOPO NEGATIVO (o que NÃO será tocado)

| Arquivo / Módulo | Motivo de exclusão explícita |
|:-----------------|:-----------------------------|
| ___              | ___                          |

---

## BLAST RADIUS

- **Dependentes diretos:** ___________
- **Dependentes indiretos:** ___________
- **Contratos afetados:** ___________
- **Skills que devem ser respeitadas neste ajuste:** ___________

---

## CRITÉRIO DE SUCESSO

- ___________

## CRITÉRIO DE PARADA

- Se ___________, parar e escalar antes de continuar.

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1     | ___       |
| 2     | ___       |

- **Tempo estimado de rollback:** ___ minutos
- **Rollback testado em staging?** sim / não / não aplicável

---

## JANELA DE MUDANÇA (HIGH/CRITICAL)

- **Horário planejado:** ___________
- **Stakeholders comunicados:** sim / não
- **Responsável pelo rollback disponível:** ___________

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** ___________
- **Divergências do plano original:** ___________
- **Descobertas inesperadas:** ___________
- **Issues abertas separadamente:** ___________

---

## VERIFICAÇÃO — PREENCHIDO PELO VERIFICADOR

- **Camadas concluídas:** 1 / 2 / 3 / 4
- **Testes que passaram:** ___________
- **Testes que falharam:** nenhum / ___________
- **SLA validado:** sim / não / não aplicável

---

## GOVERNANÇA — PREENCHIDO PELO GUARDIÃO

- [ ] Isolamento de Organização intacto
- [ ] Zero `any` introduzido
- [ ] Zero `console.log` esquecido
- [ ] TypeScript compila limpo
- [ ] Correlation ID preservado
- [ ] SLA ≤ 200ms confirmado
- [ ] Todas as skills da Fase 0.1 respeitadas
- [ ] Escopo Negativo respeitado

**Próximo passo:** QA skill acionada? sim / não / aguardando aprovação
```

---

### FASE 6 — Execução Cirúrgica

**Lei do Ajuste Mínimo:**
- Mude apenas o que o Relatório de Impacto lista
- Cada linha alterada deve ter justificativa direta no problema
- "Aproveitei para melhorar X" = violação do escopo

**Checklist em tempo real durante a execução:**
- [ ] Cada arquivo tocado estava no Relatório de Impacto?
- [ ] Alguma descoberta inesperada? → Parar e documentar no Relatório antes de continuar
- [ ] TypeScript continua compilando após cada arquivo alterado?

**Git atômico:**
```
fix(módulo): corrigir [PROBLEMA ESPECÍFICO]

Causa: [o que causava o problema]
Arquivos alterados: [lista]
Dependentes verificados: [lista]
Relatório de Impacto: documentos-tecnicos/ajustes/YYYY-MM-DD-[descrição].md
Skills verificadas: [lista]
```

---

### FASE 7 — Verificação em Camadas

**Camada 1 — Obrigatória para todo ajuste (LOW+):**
- [ ] O problema original foi resolvido?
- [ ] TypeScript compila sem erros (`npx tsc --noEmit`)?
- [ ] Testes unitários do módulo alterado passam?
- [ ] Nenhum teste existente quebrou?
- [ ] Escopo Negativo respeitado?
- [ ] O arquivo alterado pertence a um fluxo crítico? (ver seção "Definição de Fluxos Críticos")
  - Se SIM → E2E obrigatório para esse fluxo, independente do nível de risco

**Camada 2 — Obrigatória para MEDIUM+:**
- [ ] Todos os testes do módulo (unitários + funcionais) passam?
- [ ] Todos os dependentes mapeados foram testados?
- [ ] Endpoints afetados respondem em ≤ 200ms?
- [ ] Zod schemas continuam válidos?
- [ ] Skills de governança verificadas pelo Guardião?

**Camada 3 — Obrigatória para HIGH+:**
- [ ] Fluxo completo frontend → backend → DB funciona?
- [ ] UI que consome o código alterado está funcionando?
- [ ] Fluxo cross-organização: ação da organização A não afeta organização B?
- [ ] Todos os módulos que importam os tipos alterados compilam?
- [ ] Regressão histórica: cenários dos últimos 5 commits continuam funcionando?
- [ ] E2E dos fluxos afetados pelo ajuste executado e aprovado?

**Camada 4 — Obrigatória para CRITICAL:**
- [ ] Health checks de todos os serviços afetados retornam 200?
- [ ] Migration testada em staging (nunca diretamente em produção)?
- [ ] Rollback executado e revertido com sucesso em staging?
- [ ] Load test mínimo (100 users) confirma SLA após mudança?
- [ ] Stakeholders comunicados pós-execução?

---

## Handoff Formal entre Papéis

O handoff é um documento salvo em disco, não uma conversa na sessão.
Cada handoff bloqueia o início do papel seguinte.

```
HANDOFF: Analista → Cirurgião
- Relatório de Impacto salvo em: documentos-tecnicos/ajustes/[arquivo].md
- Escopo Negativo declarado: sim / não
- Risco classificado como: LOW / MEDIUM / HIGH / CRITICAL
- Aprovação obtida: sim / não / não necessária
- Skills verificadas na Fase 0.1: [lista com paths]
- Decisão Ajuste vs. Reescrita: AJUSTE — pode prosseguir
- Bloqueadores identificados: [lista ou "nenhum"]

HANDOFF: Cirurgião → Verificador
- Commits realizados: [hashes]
- Arquivos efetivamente alterados: [lista]
- Divergências do plano original: [lista ou "nenhuma"]
- Descobertas inesperadas: [lista ou "nenhuma"]
- Issues abertas separadamente: [lista ou "nenhuma"]
- Relatório atualizado com execução: sim / não

HANDOFF: Verificador → Guardião
- Camadas de verificação concluídas: 1 / 2 / 3 / 4
- Testes que passaram: [lista]
- Testes que falharam: [lista ou "nenhum"]
- SLA validado: sim / não / não aplicável
- Pendências para o Guardião: [lista ou "nenhuma"]

HANDOFF: Guardião → QA Skill
- Checklist de governança: aprovado / reprovado em [item]
- Nível do ajuste: LOW / MEDIUM / HIGH / CRITICAL
- QA skill deve ser acionada: sim (MEDIUM+) / não (LOW sem regressão)
- Relatório final disponível em: documentos-tecnicos/ajustes/[arquivo].md
```

---

## Mapa de Blast Radius por Tipo de Mudança

| Tipo de Mudança | O que pode quebrar | Verificações obrigatórias |
|:----------------|:-------------------|:--------------------------|
| CSS / classe visual | Componentes que usam a classe | Visual nos estados: default, hover, loading, erro |
| Props de componente React | Todos os consumers do componente | TypeScript + visual em cada consumer |
| Função utilitária (`utils/`) | Todos os callers da função | Unitários da função + smoke dos callers |
| Endpoint API — shape do payload | Frontend que monta o request | Funcional de rota + smoke da UI |
| Schema Zod exportado | Rota que usa + frontend que importa o type | TypeScript + funcional |
| `shared/types.ts` | Todo arquivo que importa o tipo | TypeScript em todo o módulo (`tsc --noEmit`) |
| Service / lógica de negócio | Rotas que chamam o service + testes | Unitário do service + funcional das rotas |
| Schema Prisma / migration | Todas as queries do model afetado | Funcional completo + staging obrigatório |
| Middleware de autenticação | Todas as rotas que passam pelo middleware | Funcional de todas as rotas protegidas |
| Variável de ambiente | Todo serviço que lê a variável | Health check + smoke de todas as rotas |
| `vite.config` / `tsconfig.json` | Todo o build do produto | Build completo (`npm run build`) |
| Estado global (store/context) | Todo componente que lê o estado | TypeScript + smoke de todos os consumers |
| Parâmetro de rota (`:id` → `:pedidoId`) | Todos os links hardcoded no frontend | Grep de todos os usos + smoke |
| Hook customizado | Todos os componentes que usam o hook | TypeScript + smoke dos componentes |
| Enum — adição de valor | Todo `switch/case` que usa o enum | Grep por todos os switch + `tsc --noEmit` |
| Enum — remoção de valor | Código que depende do valor removido | Grep + TypeScript estrito |

---

## Definição de Fluxos Críticos

Um fluxo é **crítico** se qualquer uma das condições abaixo for verdadeira:

- Envolve criação, edição ou exclusão de dados financeiros ou fiscais
- Está no caminho crítico da operação principal do produto (ex: criar pedido, emitir nota)
- Cruza boundary de organização (lê ou escreve dados de mais de uma organização)
- Envolve autenticação, permissão ou token
- Uma falha nele impede o usuário de completar sua tarefa principal no produto

O Analista classifica os fluxos afetados pelo ajuste como críticos ou não usando
o critério acima e registra no Relatório de Impacto. Essa classificação determina
se E2E é obrigatório na Camada 1 (LOW).

**Produtos que já documentaram seus fluxos críticos na própria skill** devem
consultar essa lista em vez de reclassificar a cada ajuste. O critério genérico
acima é o fallback quando a lista do produto não existe.

**Tabela a preencher por produto (adicionar na skill do produto):**

| Fluxo | Descrição | Motivo de ser crítico |
|:------|:----------|:----------------------|
| ___ | ___ | ___ |

---

## As 11 Armadilhas Clássicas

### Armadilha 1 — O tipo compartilhado silencioso
Alterar `shared/types.ts` quebra TypeScript em arquivos não óbvios. Só aparece se
rodar `tsc`.

**Protocolo:** buscar `TipoAlterado` em todos os arquivos → listar todos →
rodar `tsc --noEmit` após mudança.

### Armadilha 2 — O enum sem `default`
Adicionar valor a um enum quebra `switch` sem `default`.

**Protocolo:** antes de adicionar valor de enum, buscar todos os `switch` que o usam.

### Armadilha 3 — O campo Zod removido
Remover campo "opcional" de schema Zod faz validação rejeitar requests de clientes
que ainda enviam o campo.

**Protocolo:** nunca remover campo de schema público — marcar como `.optional()` antes,
remover na versão seguinte.

### Armadilha 4 — O cache invisível
Corrigir lógica de função cacheada não resolve o problema até o cache expirar.

**Protocolo:** após qualquer fix em código cacheado, invalidar o cache explicitamente.

### Armadilha 5 — O middleware que bloqueia silenciosamente
Alterar middleware de auth pode bloquear rotas sem erro explícito — apenas
401/403 silencioso.

**Protocolo:** após alterar qualquer middleware, testar **todas** as rotas que
passam por ele.

### Armadilha 6 — O import circular
Mover função para outro arquivo pode criar dependência circular que só aparece
no build.

**Protocolo:** após mover qualquer função, rodar `npm run build` antes de
testar manualmente.

### Armadilha 7 — A migration destrutiva sem rollback
Renomear campo no Prisma sem migration explícita causa perda de dados em produção.

**Protocolo:** nunca renomear campo — criar novo, migrar dados, deprecar antigo
em ciclos separados.

### Armadilha 8 — O CSS que vaza
Alterar seletor global afeta todos os componentes que o usam.

**Protocolo:** buscar `.classe-alterada` em todos os arquivos antes de qualquer
mudança de CSS compartilhado.

### Armadilha 9 — O efeito cascata em cascata
Corrigir A → B quebra → corrigir B → C quebra → corrigir C → A volta a quebrar.

Isso indica que o problema real está na **arquitetura**, não nos pontos.

**Protocolo:** após 2 correções que causam regressão em cadeia, **parar
completamente**. Não commitar. Escalar para o arquiteto. Documentar o padrão
no Relatório de Impacto como "Problema Estrutural Identificado". Aplicar o
critério da Fase 4 (Ajuste vs. Reescrita).

### Armadilha 10 — O fix que funciona localmente mas falha em staging
Diferença de variável de ambiente, seed de banco ou configuração de CORS.

**Protocolo:** para HIGH e CRITICAL, checar paridade entre ambiente local e
staging antes de executar. Listar todas as variáveis de ambiente usadas pelo
código alterado.

### Armadilha 11 — O handoff sem documentação
O Cirurgião faz o fix mas não registra o que encontrou de inesperado. O
Verificador testa sem contexto real. O ciclo vicioso recomeça no próximo sprint.

**Protocolo:** o Cirurgião deve atualizar o Relatório de Impacto com tudo que
foi descoberto durante a execução **antes** de passar para o Verificador. O
handoff é um documento salvo em disco, não uma conversa na sessão.

---

## Integração com o Ecossistema de Skills

Esta skill ocupa uma posição específica no fluxo. Não substitui nenhuma outra.

```
[Detecção do problema]
        ↓
[Dream Team Ajustes — esta skill]
  Fase 0: Contexto + Skills relevantes lidas
  Fase 1: Diagnóstico
  Fase 2: Mapeamento de dependências
  Fase 3: Classificação de risco
  Fase 4: Ajuste vs. Reescrita ──→ [Líder → tarefa de arquitetura]
  Fase 5: Relatório de Impacto salvo em disco
  Fase 6: Execução cirúrgica
  Fase 7: Verificação em camadas
        ↓
[QA Skill — skills/agentes/qa/SKILL.md]
  Acionada obrigatoriamente para MEDIUM, HIGH e CRITICAL
  Opcional para LOW sem regressão detectada
        ↓
[Deploy — skills/governanca/deploy/SKILL.md]
```

**Regra de acionamento do QA:**

| Nível | QA Skill obrigatória? |
|:------|:----------------------|
| LOW — sem regressão detectada | Não obrigatória |
| LOW — com qualquer regressão detectada | Sim |
| MEDIUM | Sim, sempre |
| HIGH | Sim, sempre |
| CRITICAL | Sim, sempre — antes e depois do staging |

---

## As 12 Regras de Ouro

1. **Se não reproduziu, não começa.**
2. **Se não leu as skills da Fase 0.1, não começa.**
3. **Se não mapeou os dependentes, não começa.**
4. **Se o Relatório de Impacto não foi salvo em disco, não começa.**
5. **Se encontrou algo inesperado durante o fix, para antes de continuar.**
6. **Se o mesmo sintoma retornou após fix anterior, para e escala — é ciclo, não bug.**
7. **Cada ajuste é uma cirurgia. Cirurgião não improvisa dentro do paciente.**
8. **Skills ignoradas = ajuste incompleto por definição.**
9. **Escopo negativo declarado é tão importante quanto escopo positivo.**
10. **Handoff é documento salvo em disco, não conversa na sessão.**
11. **Em caso de dúvida sobre nível de risco, classificar sempre para cima.**
12. **Esta skill termina no Guardião. O QA skill começa depois.**

---

## Slash Command `/ajuste`

Ativa o protocolo completo. Uso:

```
/ajuste [descrição do problema]
```

O agente responde imediatamente com:
1. Fase 0 executada — skills lidas, histórico verificado, ciclo descartado ou escalado
2. Diagnóstico — sintoma vs. causa raiz com arquivo + linha
3. Mapa de dependências — todos os consumidores do código afetado
4. Raio de impacto calculado por área
5. Nível de risco classificado (LOW / MEDIUM / HIGH / CRITICAL)
6. Decisão Ajuste vs. Reescrita declarada:
   - **AJUSTE** → prosseguir para execução
   - **REESCRITA** → Relatório salvo com status "Problema Estrutural Identificado",
     Líder escalado com o path do arquivo, nenhum código escrito
7. Relatório de Impacto salvo em `documentos-tecnicos/ajustes/`

**Nenhum código é escrito antes desse output existir.**
