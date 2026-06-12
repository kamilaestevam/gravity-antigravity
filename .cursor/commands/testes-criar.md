# /testes-criar — Criação obrigatória dos 5 tipos de teste

> **SSOT:** espelho de `.claude/commands/testes-criar.md` — alterar nos dois lugares.
> **Este comando existe porque agentes erram escopo, pasta, ID, formato EMT e entregam planos vazios.**
> Nenhuma etapa pode ser pulada. Nenhum atalho é permitido.
> **Proibido perguntar ao dono** nome de pasta, ID ou “onde colocar” — o agente **deriva** tudo deste comando + registry + SSOT.

---

## Quando invocado

O agente **PARA** qualquer outra tarefa e executa as etapas **0 → 8 nesta ordem**, sem pular.

Papéis ativos durante todo o fluxo:
- **Líder** — checkpoints internos (skills lidas, pacote completo)
- **Coordenador** — IDs, registry, pastas, contratos, FONTE PRIMÁRIA
- **QA** — formato EMT, prints, cobertura dos 5 tipos, gate final

---

## Regra zero — Os 5 tipos são obrigatórios

Para **todo escopo** que toca banco de produto ou UI, o pacote mínimo entregue é:

| # | Tipo | Pasta raiz | Sigla ID | Plano |
|---|------|------------|----------|-------|
| 1 | Unitário | `testes/testes-unitarios/` | `UNI` | `plano-teste/` |
| 2 | Funcional | `testes/testes-funcionais/` | `FUN` | `plano-de-teste/` |
| 3 | E2E | `testes/testes-e2e/` | `E2E` | `plano-teste/` |
| 4 | Cross-organização | `testes/testes-cross-organizacao/` | `CRO` | `plano-teste/` |
| 5 | Em tela (EMT) | `testes/testes-em-tela/` | `EMT` | `plano-teste/` ou `plano-de-teste/` (legado Pedido Lista — manter se já existir no escopo) |

**Entregar só 3 tipos (UNI+FUN+E2E) sem os outros 2 = REPROVAÇÃO imediata do QA**, salvo escopo explicitamente sem UI (sem EMT) ou sem acesso a banco (sem CRO) — nesse caso o agente **documenta a exceção na tabela de diagnóstico** e o dono aprova na ETAPA 3.

---

## Derivação automática de caminhos (NÃO PERGUNTAR)

A partir do escopo informado pelo dono (`produto`, `área`, `feature`), o agente monta:

```
BASE = testes/<tipo>/<produto-kebab>/<area-kebab>/<feature-kebab>/
```

| Campo | Regra | Exemplo |
|-------|-------|---------|
| `produto-kebab` | minúsculas, hífen | `pedido`, `configurador`, `gravity-store` |
| `area-kebab` | minúsculas | `lista`, `dashboard`, `configuracoes` |
| `feature-kebab` | minúsculas, verbo-ação | `duplicar`, `editar-salvar`, `edicao-em-massa` |
| `sublocal` (registry) | `{Area}/{feature}` com capitalização da área se legado Pedido | `Lista/duplicar` ou `lista/duplicar` — **alinhar com entradas existentes no registry para o mesmo escopo** |

**Espelho obrigatório:** o caminho do teste espelha o código de produção (ex.: feature em `servicos-global/produto/pedido/.../lista` → `.../pedido/lista/<feature>/`).

**Anti-padrões que reprovam:**
- Spec dentro de `servicos-global/`, `produtos/` ou `nucleo-global/`
- Plano solto na raiz de `testes/` sem `plano-teste/` ou `plano-de-teste/`
- Prints em pasta datada compartilhada (`YYYY-MM-DD-*`) ou na raiz do escopo
- Misturar `Lista` e `lista` **no mesmo escopo** — escolher um e usar nos 5 tipos

---

## Derivação automática de IDs (NÃO PERGUNTAR)

1. Ler `testes/test-plans-registry.json` (campo `planos` + `deletados`)
2. Próximo sufixo global = `max(NNNNNN) + 1` em **todo** o catálogo (Regra 1 de `01-convencao-ids.md`)
3. Gerar IDs **sem perguntar ao dono**:

| Tipo | Formato |
|------|---------|
| UNI, FUN, E2E, CRO | `TST-{TIPO}-{ESCOPO}-{NNNNNN}` |
| EMT | `TST-EMT-{LOCAL}-{AREA}-{RESUMO}-{NNNNNN}` |

- `{ESCOPO}` / `{LOCAL}`: tabela em `documentos-tecnicos/testes/regras/01-convencao-ids.md` (ex.: `PEDIDO`, `CONFIG`, `ADMIN`)
- `{AREA}`: segmento UPPER (ex.: `LISTA`, `DASHBOARD`)
- `{RESUMO}`: UPPER kebab do feature (ex.: `EDITAR-SALVAR`, `DUPLICAR`)
- `{NNNNNN}`: **6 dígitos**, único global — pode reutilizar lógica de `proximaSequenciaGlobal()` em `scripts/ativamente/assign-global-test-sequence.ts` ou `generatePlanId()` em `servicos-global/configurador/server/lib/agente-plano-teste.ts`

4. Nome do arquivo spec E2E/CRO: `TST-{TIPO}-{ESCOPO}-{NNNNNN}.spec.ts` dentro de `plano-teste/`
5. Nome do arquivo test UNI/FUN: descritivo + `.test.ts` dentro de `plano-teste/` ou `plano-de-teste/`
6. Rodar `npm run validate:test-ids` antes de apresentar ao dono

**Proibido:** inventar número à mão, reusar ID deletado, perguntar “qual ID usar?”.

---

## Registry — formato de `planoFile` e `specFile` (CRÍTICO — evita “Arquivo do plano não encontrado”)

Caminhos no `test-plans-registry.json` são **relativos à pasta `testes/`** — **sem** prefixo `testes/` no JSON.

| Campo | Formato no registry | Arquivo físico no disco |
|-------|---------------------|-------------------------|
| `planoFile` | `testes-unitarios/.../plano.md` | `testes/testes-unitarios/.../plano.md` |
| `specFile` | `testes-unitarios/.../TST-UNI-....test.ts` | `testes/testes-unitarios/.../TST-UNI-....test.ts` |

**Exemplo correto (Preferência Admin 000091):**
```json
"planoFile": "testes-unitarios/admin/testes/aba-plano-de-teste/plano-de-teste/preferencia-teste-usuario-admin-unitario.md",
"specFile": "testes-unitarios/admin/testes/aba-plano-de-teste/plano-de-teste/TST-UNI-PREFERENCIA-TESTE-USUARIO-ADMIN-000091.test.ts"
```

**Errado (quebra modal Admin e CI):**
```json
"planoFile": "testes/testes-unitarios/admin/.../plano.md"
```

**Resolução no Admin:** `resolverArquivoPlanoTeste()` em `servicos-global/configurador/server/lib/raiz-repositorio-gravity.ts` procura em `testes/{planoFile}`. **Produção só abre o modal se o deploy incluiu os arquivos em `testes/`** — registry sem arquivos no servidor = “0 items” / “Arquivo do plano não encontrado”.

**Ordem inviolável:** (1) criar **todos** os arquivos no disco → (2) **depois** atualizar registry → (3) `npm run validate:test-ids` → (4) apresentar ao dono. **Nunca** registry antes do arquivo.

---

## ETAPA 0 — Leitura obrigatória (prova antes de continuar)

Ler **com Read** e apresentar checklist ✅/❌:

### Governança (sempre)
- `skills/governanca/lei/9-mandamentos/SKILL.md`
- `skills/governanca/lei/agent-policy/SKILL.md`
- `skills/governanca/lei/ddd-nomenclatura/SKILL.md`
- `skills/governanca/lei/isolamento-organizacao/SKILL.md`

### Testes (sempre)
- `skills/testes/SKILL.md`
- `skills/testes/multi-agente-plano-teste/SKILL.md` ← **autoridade máxima**
- `skills/testes/padroes-vitest-playwright/SKILL.md`
- `skills/testes/teste-em-tela/SKILL.md`
- `skills/testes/agente-plano-teste-unitario/SKILL.md`
- `skills/testes/agente-plano-teste-funcional/SKILL.md`
- `skills/testes/agente-plano-teste-e2e/SKILL.md`

### Documentos técnicos (sempre)
- `documentos-tecnicos/testes/README.md`
- `documentos-tecnicos/testes/regras/01-convencao-ids.md`
- `documentos-tecnicos/testes/regras/02-cobertura-obrigatoria.md`
- `documentos-tecnicos/testes/regras/07-organizacao-plano-resultado-por-escopo.md`
- `documentos-tecnicos/testes/tecnico/01-arquitetura-sistema-testes.md`
- `documentos-tecnicos/testes/tecnico/06-frontend-admin-testes.md` ← **modal Objetivo / casos / Script**

### Escopo do produto (conforme feature)
- Skill vertical em `skills/produtos-gravity/<produto>/SKILL.md`
- Documentos em `documentos-tecnicos/produtos-gravity/<produto>/` **que citem a feature**

### Referência canônica EMT (se feature tem UI)
- `testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/plano-teste-em-tela.md` — **modelo de ETAPAs, prints e persistência**

**Qualquer ❌ → CHECKPOINT VERMELHO → ler e reapresentar.**

---

## ETAPA 1 — Tabela de diagnóstico do escopo

Preencher **antes** de escrever arquivo:

| Campo | Valor derivado |
|-------|----------------|
| Produto | |
| Área | |
| Feature | |
| Código-fonte principal (paths) | |
| Documento técnico SSOT | |
| `sublocal` registry | |
| Caminho UNI | |
| Caminho FUN | |
| Caminho E2E | |
| Caminho CRO | |
| Caminho EMT | |
| IDs reservados (5) | |
| Testes legados a substituir (FONTE PRIMÁRIA) | |

---

## ETAPA 2 — Pipeline multi-agente (6 fases, 8 agentes)

Executar conforme `skills/testes/multi-agente-plano-teste/SKILL.md`:

1. **Analisador de Código** — mapa de arquivos, endpoints, Zod, Prisma, testids
2. **Analisador de Tela** — elementos, estados, fluxos (se UI)
3. **Analisador de Variáveis** — matriz de combinações
4. **QA Pleno** — matriz 100% coberta?
5. **QA Master** — nada ficou de fora?
6. **Elaborador** — planos nos formatos das skills `agente-plano-teste-*`
7. **Revisor** — matriz ↔ planos, veredicto CONFORME
8. **Coordenador** — pacote + lista de legados a deletar + pastas a criar

**Output mínimo:** matriz de cenários + 5 planos (UNI, FUN, E2E, CRO, EMT) **não vazios**.

---

## ETAPA 3 — CHECKPOINT DO DONO

Apresentar ao dono **somente**:
- Tabela de diagnóstico (ETAPA 1)
- Resumo: N cenários, arquivos a criar, legados a deletar
- Os 5 IDs reservados

**Aguardar aprovação explícita.** Sem aprovação → não persistir arquivos.

---

## ETAPA 4 — Persistência dos 5 pacotes

Criar **todas** as pastas na mesma entrega:

```
testes/<tipo>/<produto>/<area>/<feature>/
├── plano-teste/          (ou plano-de-teste/ para FUN e legado EMT Pedido Lista)
│   ├── *.md              plano humano
│   ├── *.test.ts         specs UNI/FUN/CRO
│   ├── TST-*-*.spec.ts   specs E2E
│   └── run-*.ts          runner EMT (Playwright)
└── resultado-teste/      (.gitkeep — prints só após execução)
    └── <runId>/          criado pelo runner, não pelo plano vazio
```

### Conteúdo mínimo por tipo

| Tipo | Arquivo plano | Spec/runner | Casos mínimos |
|------|---------------|-------------|---------------|
| UNI | `{feature}-unitario.md` | `*.test.ts` | schemas Zod, funções puras, hooks/componentes |
| FUN | `{feature}-funcional.md` | `*.test.ts` | happy path, 400 Zod, 401/403, persistência GET após PATCH |
| E2E | `{feature}-e2e.md` | `TST-E2E-*.spec.ts` | fluxo usuário, data-testid do mapa Agente 1 |
| CRO | `{feature}-cross-org.md` | `*.test.ts` | leitura/modificação cross-org, pool leak se aplicável |
| EMT | `plano-teste-em-tela.md` | `run-{feature}.ts` | fluxo usuário, data-testid do mapa Agente 1 |

### Formato modal Admin — **todos os 5 tipos** (não só EMT)

O `.md` do plano alimenta `ModalDetalhePlanoTeste` via `GET /admin/planos-teste/:id/casos`. **SSOT:** `documentos-tecnicos/testes/tecnico/06-frontend-admin-testes.md`.

**Ordem no modal:** Objetivo → O que será testado (N casos) → Script (`specFile` do registry).

**Obrigatório em todo plano `.md`:**

```markdown
**Objetivo geral:** uma frase — por que este pacote existe.

## Roteiro de execução

### ETAPA 1 — Título do grupo

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U01** | O que o teste faz | Critério de aceitação verificável |
```

- **Objetivo geral** — bloco verde no modal; fallback: `## Escopo` ou `## Resumo Executivo`
- **Passo / Ação / APROVADO quando** — cada linha = um item em «O que será testado»; clique «Visualizar» abre Ação + critério
- **Script** — vem do registry (`specFile`); card no rodapé explica que é o arquivo executado pelo runner

**Legado ainda parseado** (migrar para ETAPA+tabela quando revisar): check-list `- [x] **U01** — …` e tabelas `| U-ZOD-01 | Caso | Resultado |`.

**Gate QA:** abrir modal no Admin local — proibido entregar plano com «0 items» se `casosTotal > 0` no registry.

### ETAPA 4.5 — Prova de existência dos 5 pacotes (ANTES do registry)

Para **cada** um dos 5 tipos, o agente **Read** ou confere no disco e apresenta:

| Tipo | ID | planoFile existe? | specFile existe? | Caminho disco plano |
|------|-----|-------------------|------------------|---------------------|
| UNI | | ✅/❌ | ✅/❌ | `testes/{planoFile}` |
| FUN | | ✅/❌ | ✅/❌ | … |
| E2E | | ✅/❌ | ✅/❌ | … |
| CRO | | ✅/❌ | ✅/❌ | … |
| EMT | | ✅/❌ | ✅/❌ | … |

**Qualquer ❌ → CHECKPOINT VERMELHO → criar o arquivo faltante → reapresentar. Proibido tocar no registry enquanto houver ❌.**

Rodar `npm run validate:test-ids` e corrigir erros **dos 5 IDs deste escopo** antes de seguir.

### Registry (somente após ETAPA 4.5 verde)

Atualizar `testes/test-plans-registry.json` — **5 entradas** (ou menos só com exceção aprovada ETAPA 3), campos:
`id`, `tipo`, `escopo`, `sublocal`, `modulo`, `criticidade`, `planoFile`, `specFile`, `specFiles[]`, `componenteFile`

`planoFile` / `specFile`: formato da seção **Registry — formato de planoFile e specFile** (relativo a `testes/`, sem `testes/` duplicado).

### FONTE PRIMÁRIA

Se existiam testes legados do **mesmo escopo**: deletar **após** aprovação ETAPA 3, registrar em `deletados[]`.

---

## Formato EMT obrigatório (resolve problemas 5 e 6)

Plano `plano-teste-em-tela.md` **nunca** pode ser esqueleto vazio. Deve conter **todas** as seções abaixo e **renderizar o modal Admin** (`ModalDetalhePlanoTeste.tsx`) com ETAPAs colapsáveis, link **Expandir todas** e contagem correta.

> **Parser do modal:** `servicos-global/configurador/server/lib/extrair-casos-plano.ts` lê `### ETAPA …`, passos numerados ou tabela `| Passo | Ação | APROVADO quando |`, e `## Prints planejados`. **Modelo ouro:** `testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/plano-teste-em-tela.md`.

### 1. Cabeçalho
```markdown
**ID:** TST-EMT-...
**Escopo pasta:** testes/testes-em-tela/...
**Plano + runner:** plano-teste/ ou plano-de-teste/
**Prints:** ../resultado-teste/<runId>/
**Regras de negócio:** link documentos-tecnicos/...
**Total passos no modal (roteiro):** N        ← passos extraídos das ETAPAs
**Total itens no modal (roteiro + prints):** M  ← N + linhas em «Prints planejados»
```

### 2. Tríade obrigatória de prints em edições

Todo passo que **edita** dado na UI exige **três momentos visuais** — no plano **e** no runner:

| Momento | O que provar | Sufixo típico | Veredicto |
|---------|--------------|---------------|-----------|
| **O que será editado** | Valor **atual** visível; célula/campo **destacado**; intenção clara do que muda | `-antes.png` ou contexto no início de `-selecao.png` | — |
| **A edição** | Popover/select/modal **aberto**; valor **sendo escolhido** antes de confirmar | `-selecao.png` | — |
| **Resultado** | Grade **após salvar** — persistiu, erro, toast ou alerta visível | `-resultado.png` | **Aprovado** ou **Reprovado** |

**Regra de ouro:** cada print documenta **sucesso ou erro** — nunca só “happy path”. No roteiro, **sempre** suffixar `(sucesso ou erro)` após o nome do arquivo.

**Padrão canônico (select/popover):** par `-selecao.png` + `-resultado.png` quando o “antes” já está legível no frame da seleção; caso contrário, **três arquivos** `-antes`, `-selecao`, `-resultado`.

**Alertas/tooltips:** só `-resultado.png` ou `-tooltip-*.png` — sem tríade completa.

**Proibido:** passo de edição com um único print final; omitir `(sucesso ou erro)`; runner que não grava os PNG listados no plano.

### 3. Formato de **cada passo com print** (modelo do modal)

Estrutura **sempre** `ETAPAS` → `PASSOS`. Cada passo com print **copia este modelo** (tabela ou lista numerada):

```markdown
### ETAPA 1 — Nº PEDIDO / Nº ITEM

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **02** | Navegar lista; expandir pedido | Grade visível · Print `02-lista-carregada.png` (sucesso ou erro) |
| **03** | Editar número do pedido | Valor salvo · Print `03-editar-pedido-antes.png` · Print `03-editar-pedido-selecao.png` · Print `03-editar-pedido-resultado.png` (sucesso ou erro) |
```

**Obrigatório em todo passo com print:**
- Coluna **Passo** com número global (`**02**`, `**03**`, …) — o modal exibe esse número à esquerda
- Coluna **Ação** — verbo + alvo (o que será editado)
- Coluna **APROVADO quando** — critério + `Print \`NN-nome.png\` (sucesso ou erro)` para **cada** PNG do passo
- Sintaxe exata detectada pelo modal: `` Print `arquivo.png` (sucesso ou erro) `` (com backticks)

Passos **sem** screenshot (ex.: preparação textual) podem omitir Print — mas passos **com** screenshot **nunca** fogem do modelo acima.

### 4. Estrutura ETAPAS + PASSOS (contrato modal)

1. Seção `## Roteiro de execução` antes das ETAPAs
2. Cada bloco: heading **`### ETAPA N — TÍTULO EM MAIÚSCULAS (PASSOS XX–YY)`** — o título vira **aba colapsável** no modal
3. Dentro: **somente** passos numerados (`1. …`) ou tabela `| Passo | Ação | APROVADO quando |`
4. **Quantidade por ETAPA:** o modal mostra `N passos` à direita de cada ETAPA = linhas extraídas **daquela** ETAPA. O agente **confere** que N bate com a tabela/lista (não contar regras WS/STATUS documentadas sem passo)
5. **Quantidade total no modal:** cabeçalho `O que será testado (M items)` = passos do roteiro **+** linhas de `## Prints planejados`. Registrar **M** no cabeçalho do plano e validar após gerar o `.md`
6. **Expandir todas:** o modal exibe o link quando há **≥2 ETAPAs** com passos; ETAPAs começam colapsadas. Plano **deve** usar `### ETAPA 0`, `### ETAPA 1`, … (nunca um bloco único sem ETAPAs) — senão some o roteiro por abas e o botão **Expandir todas**

ETAPA 0 = preparação (ambiente, pasta `resultado-teste/<runId>/`, login → `01-pos-login.png`). ETAPA final de relatório → `RESULTADO.txt` com linhas `EMT_ROW|…|Aprovado|Reprovado`.

### 5. Persistência por ETAPA

Toda ETAPA que altera dados termina com navegação hub → lista → reexpandir pedido + print `{passo}-{slug}-persistencia-apos-navegar-resultado.png` (copiar regra de editar-salvar §Regra universal).

### 6. Seção **Prints planejados**

Tabela numerada — **cada PNG** listado, inclusive `-antes`, `-selecao`, `-resultado`:

| # | Arquivo | Estado capturado |
|---|---------|------------------|
| 01 | `01-pos-login.png` | Hub/pós-login — sucesso ou erro de login |
| 03 | `03-editar-pedido-antes.png` | Valor atual antes de editar número do pedido |
| 03 | `03-editar-pedido-selecao.png` | Popover aberto durante a edição |
| 03 | `03-editar-pedido-resultado.png` | Grade após salvar — aprovado ou reprovado |

Listar **todos** os PNG **antes** de executar — o modal Admin exibe esta seção em bloco separado e soma ao total de items.

### 7. Runner `run-*.ts`

- `resolverPastaResultadoEmt()` → `resultado-teste/<runId>/`
- Viewport `1440x900`, `networkidle` antes de screenshot
- Implementar **todos** os prints do roteiro + tabela «Prints planejados»
- `99-erro.png` **somente** no `catch`
- Gravar `RESULTADO.txt` com checklist ✓/✗ e veredicto **Aprovado/Reprovado** por passo

**Modelo de código:** `testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-lista-editar-salvar.ts`

### 8. Checklist EMT antes de entregar (QA)

- [ ] Tríade antes/seleção/resultado em **cada** passo de edição
- [ ] Todo passo com print usa `Print \`…\` (sucesso ou erro)`
- [ ] Roteiro só com `### ETAPA` + passos (tabela ou lista)
- [ ] Cada ETAPA tem contagem de passos coerente com o modal
- [ ] Cabeçalho declara total roteiro + total modal
- [ ] ≥2 ETAPAs com passos (habilita **Expandir todas**)
- [ ] Seção «Prints planejados» completa e alinhada ao runner

---

## ETAPA 5 — Implementação dos specs

- Vitest UNI/FUN/CRO: `@vitest-environment node` onde aplicável
- E2E: Playwright, sem `waitForTimeout(>1000)`, sem `it.skip`/`it.only`
- Zod compartilhado front/back → contract test no mesmo commit (Mandamento 09)
- Rodar testes localmente; reportar verde/vermelho

---

## ETAPA 6 — Gate QA (6 categorias)

QA reprova se **qualquer** item falhar:

1. **Segurança** — isolamento org, Zod, sem Clerk metadata
2. **5 tipos** — todos presentes ou exceção documentada e aprovada
3. **Pastas** — caminhos batem com ETAPA 1 e doc 07
4. **IDs** — `validate:test-ids` verde; registry atualizado
5. **EMT** — tríade o-que-edita/seleção/resultado; passos no modelo `Print \`…\` (sucesso ou erro)`; ETAPAS+PASSOS; contagem por etapa e total modal; ≥2 ETAPAs (Expandir todas)
6. **FONTE PRIMÁRIA** — legados do escopo removidos; sem duplicata de plano

Veredicto: `APROVADO` ou `REPROVADO` com lista de gaps.

---

## ETAPA 7 — CHECKPOINT DO DONO (entrega)

Apresentar:
- Lista dos **5 caminhos** criados
- IDs no registry
- Resultado `npm run validate:test-ids`
- Resultado testes (Vitest + Playwright se rodou)
- Veredicto QA

**Aguardar aprovação antes de commit** (se o dono pedir commit).

---

## ETAPA 8 — Proibições explícitas (causam os 6 erros reportados)

| Erro | Proibido |
|------|----------|
| 01 Ignorar docs/skills | Começar sem ETAPA 0 completa |
| 02 Só 3 tipos | Entregar pacote sem CRO e/ou EMT sem exceção aprovada |
| 03 Perguntar nome/ID | Perguntar ao dono pasta ou ID — derivar do registry |
| 04 Pasta errada | Criar fora de `testes/testes-*` ou sem `plano-teste/`; registry com `testes/testes-...`; registry antes do arquivo no disco |
| 05 Plano EMT vazio | `.md` sem ETAPAs, sem prints planejados, sem passos no modelo |
| 06 Prints errados | Só screenshot final; faltar tríade o-que-edita/seleção/resultado; omitir `(sucesso ou erro)` |
| 07 Modal sem abas | Roteiro sem `### ETAPA`; sem contagem por etapa; total de items não conferido |
| 08 Sem Expandir todas | Menos de 2 ETAPAs com passos — modal não exibe o controle |

---

## Referências rápidas

| Necessidade | Onde |
|-------------|------|
| Onde colocar | `documentos-tecnicos/testes/regras/07-organizacao-plano-resultado-por-escopo.md` |
| IDs | `documentos-tecnicos/testes/regras/01-convencao-ids.md` |
| Pipeline | `skills/testes/multi-agente-plano-teste/SKILL.md` |
| EMT | `skills/testes/teste-em-tela/SKILL.md` |
| Modal «Detalhe do plano» | `documentos-tecnicos/testes/tecnico/06-frontend-admin-testes.md` |
| Exemplo ouro EMT | `testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/` |
| Exemplo 5 tipos (duplicar) | `testes/testes-unitarios/pedido/lista/duplicar/plano-de-teste/` + paralelos FUN/E2E/CRO/EMT |
| Validar IDs | `npm run validate:test-ids` |
