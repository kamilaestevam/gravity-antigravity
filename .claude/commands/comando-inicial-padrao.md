# Comando Inicial Padrão

> **Este comando define o procedimento obrigatório para QUALQUER tarefa de desenvolvimento.**
> Nenhuma etapa pode ser pulada. Nenhum atalho é permitido.

---

## Sistema de Checkpoints

Cada etapa possui um **checkpoint** ao final. O **Líder Técnico** (papel do agente, conforme `skills/papeis/lider/SKILL.md`) é responsável por aprovar cada checkpoint antes de avançar.

- **CHECKPOINT VERDE** → Líder aprova automaticamente, fluxo segue
- **CHECKPOINT VERMELHO** → Líder identifica falha, agente corrige e resubmete
- **CHECKPOINT DO DONO** → Apenas nas etapas 3 e 7, o dono (usuário) é quem aprova

O dono **NÃO** é incomodado em checkpoints internos. Líder, Coordenador e QA resolvem entre si.

---

## ETAPA 0 — Leitura Obrigatória de Skills e Documentos

Antes de qualquer análise ou código, o agente DEVE ler:

1. **Governança › Lei (TODAS)** — são vitais independente da tarefa:
   - `skills/governanca/lei/9-mandamentos/SKILL.md`
   - `skills/governanca/lei/agent-policy/SKILL.md`
   - `skills/governanca/lei/ddd-nomenclatura/SKILL.md`
   - `skills/governanca/lei/visao-geral/SKILL.md`
   - `skills/governanca/lei/terminal/SKILL.md`
   - `skills/governanca/lei/isolamento-organizacao/SKILL.md`
   - `skills/governanca/lei/sdk-resolvedor-organizacao/SKILL.md`
   - `skills/governanca/lei/sla-metas/SKILL.md`
   - `skills/governanca/lei/cost-budget/SKILL.md`
   - `skills/governanca/lei/backup-policy/SKILL.md`
   - `skills/governanca/lei/database-governance/SKILL.md`
   - `skills/governanca/lei/cadastros-snapshot-policy/SKILL.md`

2. **Governança › Convenção Técnica (TODAS):**
   - `skills/governanca/convencao-tecnica/code-standards/SKILL.md`
   - `skills/governanca/convencao-tecnica/monorepo/SKILL.md`
   - `skills/governanca/convencao-tecnica/lint-tenant-safety/SKILL.md`
   - `skills/governanca/convencao-tecnica/api-design/SKILL.md`
   - `skills/governanca/convencao-tecnica/criptografia/SKILL.md`
   - `skills/governanca/convencao-tecnica/observabilidade-minima/SKILL.md`
   - `skills/governanca/convencao-tecnica/enum/SKILL.md`

3. **Skills específicas da área** sendo trabalhada (conforme mapa do CLAUDE.md)

4. **Documentos técnicos relevantes** em `documentos-tecnicos/`

**Se a leitura não foi feita, o trabalho NÃO começa.**

### Prova de leitura (OBRIGATÓRIA)

Após ler todas as skills, o agente DEVE apresentar um **checklist de confirmação** listando cada skill lida com o status:

```
✅ skills/governanca/lei/9-mandamentos/SKILL.md — LIDA
✅ skills/governanca/lei/agent-policy/SKILL.md — LIDA
✅ skills/governanca/convencao-tecnica/code-standards/SKILL.md — LIDA
... (todas as demais)
```

**Se qualquer skill aparecer como não lida, o agente DEVE lê-la antes de prosseguir.**
O agente NÃO pode marcar como "LIDA" sem ter efetivamente usado a ferramenta Read no arquivo.

### 🔒 CHECKPOINT 0 — Líder verifica

O Líder Técnico confere:
- Todas as skills de governança (lei + convenção técnica) foram lidas?
- As skills específicas da área foram identificadas e lidas?
- Documentos técnicos relevantes foram consultados?

**Se faltar qualquer skill → CHECKPOINT VERMELHO → agente lê o que falta e reapresenta o checklist.**

---

## ETAPA 1 — Tabela de Diagnóstico Completa

O agente DEVE montar e apresentar uma **tabela completa** contendo:

| Coluna | Descrição |
|--------|-----------|
| **O que será feito** | Descrição clara da tarefa/alteração |
| **Banco (como está)** | Estado atual dos models/tabelas relevantes |
| **Schema Prisma (como está)** | Campos, relações e índices atuais |
| **Outros locais relevantes** | Rotas, componentes, services, hooks afetados |
| **Onde está** | Caminho exato dos arquivos |
| **Como está** | Comportamento/código atual |
| **Como ficará** | Comportamento/código após a alteração |

A tabela deve ser **exaustiva** — nenhum arquivo afetado pode ficar de fora.

### 🔒 CHECKPOINT 1 — Líder verifica

O Líder Técnico confere:
- A tabela cobre todos os arquivos afetados?
- Os caminhos estão corretos?
- O "como ficará" é coerente com as skills de governança?
- Nenhum arquivo foi esquecido?

**Se incompleta → CHECKPOINT VERMELHO → agente complementa e reapresenta.**

---

## ETAPA 2 — Revisão PROFUNDA do Coordenador e Líder Técnico

Imediatamente após a tabela, o agente DEVE:

**Pré-requisito:** antes de assumir cada papel, o agente DEVE ler a skill correspondente **por inteiro**:
- Coordenador → `skills/papeis/coordenador/SKILL.md`
- Líder → `skills/papeis/lider/SKILL.md`

**REGRA: análise rasa é proibida.** Cada papel deve produzir uma análise completa e estruturada, como se fosse acionado sozinho. Respostas de uma linha como "Nenhum impacto" ou "Viabilidade: Alta" são INACEITÁVEIS — cada ponto deve ter justificativa com evidência (arquivo, linha, regra, skill).

---

### 2.1 — Coordenador (análise completa obrigatória)

O Coordenador DEVE produzir um relatório estruturado cobrindo TODOS os itens abaixo:

| Item | O que analisar | Formato esperado |
|------|---------------|-----------------|
| **Schema/Contratos** | Quais models/tabelas são afetados? Campos adicionados/removidos/renomeados? Índices? Relações? Zod schemas precisam atualizar? | Listar cada model, campo e schema Zod afetado com caminho do arquivo |
| **Ondas** | Em qual onda esta tarefa se enquadra? Os pré-requisitos da onda anterior estão validados? | Citar a onda e justificar |
| **Dependências entre serviços** | Quais serviços consomem ou são consumidos? Rotas inter-serviço afetadas? Headers `x-chave-interna-servico`? | Listar cada serviço e rota com impacto |
| **Isolamento de organização** | Toda query filtra por `id_organizacao`? Risco de vazamento cross-tenant? | Citar cada query e confirmar filtro |
| **Contratos bilaterais (Regra 09)** | Os schemas Zod do frontend estão sincronizados com o payload do backend? | Listar cada schema e confirmar sincronia |
| **DDD Nomenclatura** | Todos os nomes seguem o DDD? Algum nome legado (`tenant`, `company`, `role`)? | Listar cada nome novo/alterado e confirmar conformidade |
| **Riscos identificados** | O que pode dar errado? Efeitos colaterais? Regressões possíveis? | Lista com severidade (baixo/médio/alto) e mitigação |

**Formato de entrega:**
```
## Coordenador — Relatório de Revisão

### Schema/Contratos
[análise detalhada com arquivos e linhas]

### Ondas
[análise detalhada]

### Dependências entre serviços
[análise detalhada]

### Isolamento de organização
[análise detalhada]

### Contratos bilaterais
[análise detalhada]

### DDD Nomenclatura
[análise detalhada]

### Riscos
[lista com severidade e mitigação]

### Veredicto: CONCORDO / NÃO CONCORDO
[justificativa]
```

---

### 2.2 — Líder Técnico (análise completa obrigatória)

O Líder DEVE produzir um relatório estruturado cobrindo TODOS os itens abaixo:

| Item | O que analisar | Formato esperado |
|------|---------------|-----------------|
| **Viabilidade técnica** | A solução proposta é a melhor abordagem? Existem alternativas? Trade-offs? | Descrever abordagem escolhida e alternativas descartadas com motivo |
| **9 Mandamentos** | A implementação respeita cada um dos 9 Mandamentos aplicáveis? | Verificar cada Mandamento relevante, citando o que se aplica |
| **Code-standards** | Padrões de código serão respeitados? TypeScript strict? Imports via alias? ESModules? | Confirmar cada padrão que se aplica |
| **Impacto em arquivos existentes** | Quais arquivos existentes serão modificados? Risco de quebra? | Lista com caminho e tipo de modificação |
| **Performance** | A mudança impacta latência? SLA (200ms p95)? Queries N+1? | Citar endpoints afetados e impacto estimado |
| **Segurança** | Validação Zod em rotas? JWT? `x-chave-interna-servico`? OWASP? | Checklist de segurança ponto a ponto |
| **Riscos e bloqueios** | O que pode bloquear? Dependências externas? Dados que precisam existir? | Lista com severidade e plano de mitigação |
| **Testes necessários** | Quais tipos de teste serão necessários? Quais cenários cobrir? | Lista por tipo (unitário, funcional, E2E, cross-tenant) |

**Formato de entrega:**
```
## Líder Técnico — Relatório de Revisão

### Viabilidade técnica
[análise detalhada com alternativas]

### 9 Mandamentos
[verificação ponto a ponto]

### Code-standards
[verificação ponto a ponto]

### Impacto em arquivos existentes
[lista detalhada]

### Performance
[análise com endpoints e estimativas]

### Segurança
[checklist ponto a ponto]

### Riscos e bloqueios
[lista com severidade e mitigação]

### Testes necessários
[lista por tipo com cenários]

### Veredicto: CONCORDO / NÃO CONCORDO
[justificativa]
```

---

### 2.3 — Convergência

- Ambos DEVEM declarar explicitamente: **"CONCORDO"** ou **"NÃO CONCORDO — motivo: ..."**
- Se qualquer um NÃO concordar:
  - A tabela é **refeita** incorporando os ajustes
  - Nova rodada de revisão até ambos concordarem
- **Análises rasas ou genéricas invalidam o checkpoint** — o agente deve refazer com profundidade

### 🔒 CHECKPOINT 2 — Coordenador + Líder concordam

**Ambos devem declarar "CONCORDO" com relatório completo preenchido. Relatórios incompletos ou rasos = CHECKPOINT VERMELHO → refazer com profundidade.**

---

## ETAPA 3 — Aprovação do Dono

A tabela aprovada por Coordenador + Líder é apresentada ao dono (usuário).

- **O agente NÃO escreve nenhuma linha de código antes da aprovação.**
- O dono pode pedir ajustes → volta para ETAPA 1 ou 2.
- O dono aprova → segue para ETAPA 4.

### 🔒 CHECKPOINT 3 — DONO APROVA

**Este é um dos dois únicos checkpoints que envolvem o dono. O agente DEVE aguardar aprovação explícita do dono antes de prosseguir.**

---

## ETAPA 4 — Implementação

O agente executa a implementação conforme a tabela aprovada:

- Segue estritamente os 9 Mandamentos e todas as skills de governança
- Respeita code-standards, DDD-nomenclatura, monorepo
- **Pausa apenas em caso de erro grave** que invalide a tabela aprovada
- Se pausar → notifica o dono com diagnóstico antes de continuar

### 🔒 CHECKPOINT 4 — Líder verifica implementação

O Líder Técnico confere:
- O código segue os 9 Mandamentos?
- Nomenclatura DDD está correta?
- Code-standards foram respeitados?
- A implementação corresponde à tabela aprovada (sem desvios)?
- Nenhum arquivo fora do escopo foi alterado?

**Se desvio encontrado → CHECKPOINT VERMELHO → agente corrige e reapresenta.**

---

## ETAPA 5 — Testes Obrigatórios

### 5.1 — Estrutura de pastas (INVIOLÁVEL)

Cada teste DEVE ser colocado na pasta correta por **tipo** e **produto/sistema**:

```
testes/
├── testes-unitarios/
│   ├── admin/
│   ├── api-cockpit/
│   ├── configurador/
│   ├── gabi/
│   ├── historico/
│   ├── infra/
│   ├── nucleo-global/
│   ├── pedido/
│   └── tenant/
├── testes-funcionais/
│   └── <produto>/        ← mesma lógica de subpastas por produto
├── testes-e2e/
│   └── <produto>/        ← mesma lógica de subpastas por produto
└── testes-cross-organizacao/
    └── <produto>/        ← obrigatório para serviços tenant
```

**Regras:**
- **NUNCA** colocar teste na raiz de `testes/` — sempre dentro do tipo correto
- **NUNCA** misturar testes de produtos diferentes na mesma subpasta
- Se a subpasta do produto não existir, **criar** seguindo o padrão existente
- Testes cross-tenant vão em `testes-cross-organizacao/<produto>/`

### 5.2 — Skills de teste (leitura obrigatória ANTES de escrever cada tipo)

Cada tipo de teste DEVE seguir estritamente sua skill correspondente:

| Tipo | Skill obrigatória | Ler ANTES de escrever |
|------|-------------------|-----------------------|
| Coordenação geral | `skills/testes/SKILL.md` | SEMPRE (primeira leitura) |
| Padrões Vitest/Playwright | `skills/testes/padroes-vitest-playwright/SKILL.md` | SEMPRE (primeira leitura) |
| Plano de teste (geral) | `skills/testes/agente-plano-teste/SKILL.md` | Antes de criar qualquer plano |
| Testes unitários | `skills/testes/agente-plano-teste-unitario/SKILL.md` | Antes de escrever teste unitário |
| Testes funcionais | `skills/testes/agente-plano-teste-funcional/SKILL.md` | Antes de escrever teste funcional |
| Testes E2E | `skills/testes/agente-plano-teste-e2e/SKILL.md` | Antes de escrever teste E2E |
| Contract testing | `skills/testes/contract-testing/SKILL.md` | Antes de escrever contract test |
| Teste em tela | `skills/testes/teste-em-tela/SKILL.md` | Antes de validação visual |

**O agente DEVE ler a skill do tipo de teste IMEDIATAMENTE ANTES de escrevê-lo (não basta ter lido na ETAPA 0). Se não leu neste momento, não escreve.**

### 5.3 — Requisitos

- **Testes unitários** — Vitest, cobertura mínima conforme skill
- **Testes funcionais** — rotas, fluxos, integração
- **Testes E2E** — Playwright (após plano aprovado pelo dono)
- Testes cross-tenant obrigatórios para serviços tenant
- Todos os testes devem **passar** antes de prosseguir

### 🔒 CHECKPOINT 5 — Líder verifica testes

O Líder Técnico confere **CADA** item:
- [ ] Skill de coordenação de testes (`skills/testes/SKILL.md`) foi lida?
- [ ] Skill de padrões Vitest/Playwright foi lida?
- [ ] Para cada tipo de teste escrito: a skill correspondente foi lida imediatamente antes?
- [ ] Cada arquivo de teste está na pasta correta (`testes-unitarios/<produto>/`, `testes-funcionais/<produto>/`, etc.)?
- [ ] Nenhum teste está na raiz de `testes/` ou misturado com outro produto?
- [ ] Testes cross-tenant existem (se serviço tenant)?
- [ ] Todos os testes passam?
- [ ] Cobertura mínima atingida?

**Se qualquer item falhar → CHECKPOINT VERMELHO → agente corrige e o Líder re-verifica TODOS os itens.**

---

## ETAPA 6 — QA Completo (Código + Testes)

Imediatamente após os testes, o agente DEVE acionar o QA:

**Pré-requisito:** ler `skills/papeis/qa/SKILL.md` antes de iniciar a revisão.

O QA revisa **TUDO** — implementação E testes juntos:

- Checklist completo das **6 categorias obrigatórias**
- **Verificação adicional de testes:**
  - Cada teste está na pasta correta? (`testes-unitarios/<produto>/`, `testes-funcionais/<produto>/`, etc.)
  - Cada teste segue a skill correspondente da seção 5.2?
  - Cobertura mínima atingida? (80% nucleo-global, 70% demais)
  - Testes cross-tenant existem para serviços tenant?
  - Todos os testes passam?
- Se rejeitado → agente corrige (código OU testes) e resubmete ao QA
- Ciclo repete até o QA **APROVAR**

### 🔒 CHECKPOINT 6 — QA aprova

**QA deve declarar "APROVADO" com checklist completo preenchido. Se "REJEITADO" → agente corrige e resubmete. O dono NÃO é envolvido neste checkpoint.**

---

## ETAPA 7 — Aprovação Final do Dono

O agente apresenta ao dono:

- Resumo do que foi implementado
- Resultado do QA (aprovado — com checklist)
- Resultado dos testes (todos passando — com lista de arquivos e pastas)
- Lista completa de arquivos alterados/criados

### 🔒 CHECKPOINT 7 — DONO APROVA

**Este é o segundo e último checkpoint que envolve o dono. O agente DEVE aguardar aprovação explícita do dono antes de fazer commit/push.**

---

## ETAPA 8 — Commit e Push

Regras estritas:

1. **SOMENTE arquivos tocados por este agente** — nada de fora
2. Fazer `git diff` e `git status` antes para confirmar escopo
3. Adicionar apenas os arquivos listados na ETAPA 7 (por nome, NUNCA `git add .` ou `git add -A`)
4. Commit com mensagem descritiva seguindo o padrão do repositório
5. Push para `master`

### 🔒 CHECKPOINT 8 — Líder verifica commit

O Líder confere antes do push:
- `git diff --staged` mostra apenas arquivos da tabela aprovada?
- Nenhum arquivo externo foi incluído?
- Mensagem de commit segue o padrão?

**Se arquivo estranho detectado → CHECKPOINT VERMELHO → agente remove do staging e reapresenta.**

---

## REGRA ABSOLUTA — Worktrees, Branches e Master

**PROIBIDO commitar direto na master.** Toda mudança passa por branch + PR + revisão. Master fica sempre verde e deployável (auto-deploy do Railway dispara em ~1s após merge — código quebrado em master = produção quebrada).

**Cada agente trabalha em sua branch.** O nome reflete a tarefa: `feature/<nome>`, `fix/<nome>`, `hotfix/<nome>`, `docs/<nome>`, `seguranca/<nome>`. Branches auxiliares são esperadas e necessárias — não são "ruído".

**Worktrees são permitidas e recomendadas para paralelismo.** Quando múltiplos agentes trabalham simultaneamente, cada um deve ter sua worktree própria. O Cowork cria automaticamente com o toggle `worktree ✅`, ou manualmente:

```bash
git worktree add ../gravity-<nome-da-tarefa> -b feature/<nome-da-tarefa>
```

**Worktree órfã não pode acumular.** Após o merge do PR e remoção da branch:

```bash
git worktree remove ../gravity-<nome-da-tarefa>
```

Periodicamente: `git worktree list` para auditar e `git worktree prune` para limpar referências mortas.

**Quando NÃO usar worktree:** dois agentes que precisam colaborar serialmente no MESMO arquivo (um termina, outro começa). Aí mesma worktree + mesma branch, mas um agente por vez. **Nunca** dois agentes editando simultaneamente o mesmo working tree — causa sobrescrita silenciosa e commits misturados.

**Antes de qualquer edição, todo agente DEVE rodar:**

```bash
git status
git rev-parse --abbrev-ref HEAD
git worktree list
```

E confirmar que está na pasta certa, na branch certa, com working tree limpo. Se algo estiver fora do esperado, PARAR e avisar o dono.

---

## Resumo do Fluxo

```
ETAPA 0: Ler TODAS as skills + apresentar checklist de prova
    🔒 Líder verifica leitura
    ↓
ETAPA 1: Tabela de diagnóstico completa
    🔒 Líder verifica completude
    ↓
ETAPA 2: Coordenador + Líder revisam, concordam ou rebatem
    🔒 Ambos declaram "CONCORDO"
    ↓
ETAPA 3: DONO aprova a tabela ← (única interação do dono)
    ↓
ETAPA 4: Implementação
    🔒 Líder verifica código vs tabela vs 9 Mandamentos
    ↓
ETAPA 5: Testes — lê skill específica → escreve → coloca na pasta correta
    🔒 Líder verifica: skills lidas, pastas corretas, testes passando
    ↓
ETAPA 6: QA completo (código + testes + pastas + cobertura)
    🔒 QA declara "APROVADO"
    ↓
ETAPA 7: DONO aprova resultado final ← (última interação do dono)
    ↓
ETAPA 8: Commit + Push na branch da tarefa → abrir PR → revisão → merge em master
    🔒 Líder verifica staging antes do push
    🔒 Após merge: confirmar deploy em produção via `railway deployment list --json --limit 1`
```
