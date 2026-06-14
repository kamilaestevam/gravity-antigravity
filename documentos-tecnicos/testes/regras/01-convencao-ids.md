# Regras — Convenção de IDs de Testes

> Regras invioláveis de nomenclatura para todos os testes do Gravity. Qualquer agente que crie um teste DEVE seguir esta convenção. CI bloqueia PRs que violam.

---

## Formato Obrigatório — legado (UNI, CON, FUN, CRO, E2E, PEN)

```
TST-{TIPO}-{ESCOPO}-{NNNNNN}
```

| Parte | Valores |
|---|---|
| `TST` | fixo — **Teste** |
| `{TIPO}` | `UNI`, `CON`, `FUN`, `CRO`, `E2E`, `PEN` |
| `{ESCOPO}` | sigla do produto/serviço (`PEDIDO`, `CONFIG`, `ADMIN`, …) |
| `{NNNNNN}` | 6 dígitos sequenciais |

```
^TST-(UNI|CON|FUN|CRO|E2E|PEN)-(LOGIN|CONFIG|ADMIN|HUB|CORE|MARKET|TENANT|DBASE|PEDIDO|NFIMP|LPCO|BIDFRT|BIDCAM|SIMCUS|FINCOM|PROCSO|MBOTO)-\d{6}$
```

---

## Formato Obrigatório — EMT (Em Tela) — **a partir de 2026-06-06**

IDs de teste em tela são **legíveis** e espelham produto → área → o que o teste faz:

```
TST-EMT-{LOCAL}-{AREA}-{RESUMO}-{NNNNNN}
```

| Parte | Significado | Exemplos |
|---|---|---|
| `TST` | Teste (fixo) | `TST` |
| `EMT` | Tipo **Em Tela** | `EMT` |
| `{LOCAL}` | Produto ou módulo raiz | `PEDIDO`, `BID-FRETE`, `CONFIGURADOR`, `ADMIN`, `LOGIN` |
| `{AREA}` | Sub-local da UI | `LISTA`, `KANBAN`, `DASHBOARD`, `INSIGHTS`, `CONFIGURACOES` |
| `{RESUMO}` | Resumo kebab do escopo do teste | `EDITAR-SALVAR`, `CONFIG-STATUS`, `STATUS-REFLEXO` |
| `{NNNNNN}` | Sequencial **global** (6 dígitos — único em todo o catálogo) | `000045`, `000046` |

**Exemplo canônico:**
```
TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045
```

**Variante feature-first** (quando `{RESUMO}` identifica a operação transversal antes do local):
```
TST-EMT-EDICAO-EM-MASSA-LISTA-PEDIDO-000112
```
Pasta e `sublocal` no registry continuam alinhados com `{LOCAL}/{AREA}` (`pedido/lista/edicao-em-massa`, `lista/edicao-em-massa`) — só a ordem dos segmentos no ID muda.

**Onde cada parte também aparece:**
- `{LOCAL}` + `{AREA}` → pasta `testes/testes-em-tela/<local>/<area>/` e campo `sublocal` no registry (`lista/editar-salvar`)
- `{RESUMO}` → título humano no campo `modulo` do registry (ex.: "Edição e Salvar pedidos e itens")
- ID completo → campo `id` em `test-plans-registry.json`

**Regex EMT (sugestão CI):**
```
^TST-EMT-[A-Z0-9]+(-[A-Z0-9]+){2,}-\d{6}$
```

> Planos EMT antigos no formato `TST-EMT-PEDIDO-CONFIG-STATUS-001` permanecem válidos até renomeação explícita no registry (Regra 2).

---

## Formato Descritivo — tipos legado (UNI, FUN, CRO, E2E) — **paridade EMT**

Alguns domínios transversais usam IDs **descritivos legíveis** mesmo nos tipos legado (não só EMT). O escopo real fica no campo `escopo` do registry; o ID carrega o tema.

```
TST-{TIPO}-{TEMA-DESCRITIVO}-{NNNNNN}
```

**Famílias descritivas registradas** (lista fechada — adicionar um regex em `scripts/ativamente/validate-test-ids.ts` → `DESCRIPTIVE_REGEXES` antes de usar uma nova):

| Família | Regex | Escopo real (campo `escopo`) |
|---------|-------|------------------------------|
| `MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY` | `^TST-(UNI\|FUN\|CRO\|E2E)-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-\d{6}$` | CONFIG |
| `PEDIDO-USUARIO-FALTA-ORGANIZACAO` | `^TST-(UNI\|FUN\|CRO\|E2E)-PEDIDO-USUARIO-FALTA-ORGANIZACAO-\d{6}$` | PEDIDO / CONFIG |
| `DUPLICAR-LISTA-PEDIDO` | `^TST-(UNI\|FUN\|CRO\|E2E\|EMT)-DUPLICAR-LISTA-PEDIDO-\d{6}$` | PEDIDO |

> **`DUPLICAR-LISTA-PEDIDO`:** regex em `DESCRIPTIVE_DUPLICAR_LISTA_PEDIDO_REGEX` (não em `DESCRIPTIVE_REGEXES`) porque inclui tipo `EMT`. Mesma regra de registro: validador → esta tabela → criar IDs.

**Exemplos:**
```
TST-EMT-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000084   (em tela)
TST-UNI-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000085   (unitário — escopo real CONFIG/PEDIDO no registry)
TST-FUN-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000087   (funcional)
TST-UNI-DUPLICAR-LISTA-PEDIDO-000026              (unitário duplicar lista)
TST-EMT-DUPLICAR-LISTA-PEDIDO-000083              (em tela duplicar lista)
```

> **Para adicionar uma nova família descritiva:** (1) adicionar o regex em `DESCRIPTIVE_REGEXES` no validador, (2) registrar a família nesta tabela, (3) só então criar os IDs. O CI valida via `idValido()` que delega a `matchDescriptive()`.

---

## Regra 1 — Sequência global única (todo o catálogo)

O sufixo `{NNNNNN}` é **único em todo o `test-plans-registry.json`** — independente de tipo ou escopo.

```
TST-UNI-PEDIDO-000001        ✅ (plano #1 do catálogo)
TST-E2E-ADMIN-000019         ✅ (plano #19)
TST-FUN-ADMIN-000020         ✅ (plano #20 — outro tipo, outro número)
TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045  ✅ (plano #45 — EMT também)
```

**Errado:**
```
TST-E2E-ADMIN-000019     ✅
TST-FUN-ADMIN-000019     ❌ (mesmo sufixo em dois planos)
```

Próximo plano = `max(sufixo global) + 1` (`generatePlanId` / `proximaSequenciaGlobal`).

---

## Regra 2 — IDs nunca mudam após criação

Refactor de arquivo não muda o ID. Renomear `.spec.ts` não muda o ID. Mover de pasta não muda o ID.

**Por quê:** o ID é referenciado em screenshots, logs históricos, tickets, métricas. Mudar o ID quebra rastreabilidade.

**Exemplo:**
```
TST-E2E-CONFIG-000013 — criado 2026-04-15 com nome "organizacao.spec.ts"
                     ↓ (refactor 2026-08-20)
TST-E2E-CONFIG-000013 — agora se chama "organizacao-edicao.spec.ts"
                       MAS o ID continua o mesmo
```

---

## Regra 3 — Numeração com zero-pad (6 dígitos)

```
TST-E2E-CONFIG-000013    ✅
TST-E2E-CONFIG-000042    ✅
TST-E2E-CONFIG-001234    ✅
```

**Errado:**
```
TST-E2E-CONFIG-1         ❌ (sem zero-pad)
TST-E2E-CONFIG-0000001   ❌ (7 dígitos)
TST-E2E-CONFIG-00001     ❌ (5 dígitos)
```

---

## Regra 4 — Sublocal no ID

**EMT (2026-06-06+):** `{LOCAL}` e `{AREA}` **fazem parte do ID** (`TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045`). O caminho de pasta e `sublocal` no registry devem **alinhar** com esses segmentos. Exceção documentada: variantes feature-first (`TST-EMT-EDICAO-EM-MASSA-LISTA-PEDIDO-000112`) — pasta segue `pedido/lista/edicao-em-massa`.

**Demais tipos (UNI, FUN, E2E, …):** sublocal continua **só no metadata** do registry, não no ID.

```
TST-E2E-CONFIG-000013               ✅  + metadata.sublocal: "organizacao"
TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045  ✅  + sublocal: "lista/editar-salvar"
```

---

## Regra 5 — Nome do arquivo `.spec.ts`

Padrão:
```
testes/testes-e2e/<escopo>/<sublocal-kebab>/TST-{TIPO}-{ESCOPO}-{NNNNNN}.spec.ts
```

Exemplos:
```
testes/testes-e2e/configurador/organizacao/TST-E2E-CONFIG-000013.spec.ts
testes/testes-funcionais/admin/visao-geral/TST-FUN-ADMIN-000005.test.ts
testes/testes-cross-tenant/pedido/dashboard/TST-CRO-PEDIDO-000002.test.ts
```

**Por quê o ID no nome do arquivo:** facilita encontrar via `find` e via grep. O nome do arquivo **é** o ID, não tem ambiguidade.

---

## Regra 6 — IDs reservados nunca são reusados

Se um teste é deletado, seu ID **não pode ser reusado**. O próximo plano usa o próximo sufixo **global** (não reaproveita o deletado).

**Exemplo:**
```
TST-E2E-CONFIG-000013  → deletado em 2026-05-10
… planos até 000072 existem …
TST-UNI-PEDIDO-000073  ✅ (próximo a criar — não reutiliza 000007)
```

O registry mantém um campo `deletados: ["TST-E2E-CONFIG-000013"]` pra rastreabilidade histórica.

---

## Regra 7 — Tabela de tipos (3 letras)

| Sigla | Tipo completo | Ferramenta |
|---|---|---|
| `UNI` | Unitário | Vitest |
| `CON` | Contract Testing | Vitest + Zod |
| `FUN` | Funcional | Vitest + supertest |
| `CRO` | Cross-tenant | Vitest + 2 tenants |
| `E2E` | End-to-end | Playwright |
| `PEN` | Pentest | OWASP ZAP |
| `EMT` | Em Tela (visual + prints) | Playwright + `testes-em-tela/` |

**Não inventar siglas novas.** Se um novo tipo for criado, atualizar este documento + agent-policy + CI primeiro.

---

## Regra 8 — Tabela de escopos (5-6 letras)

| Sigla | Escopo | Onde mora |
|---|---|---|
| `LOGIN` | Login | `nucleo-global/Login/login-global/` |
| `CONFIG` | Configurador (sem Admin) | `servicos-global/configurador/` |
| `ADMIN` | Painel Admin | `servicos-global/configurador/src/pages/admin/` |
| `HUB` | Shell pós-login | `servicos-global/shell/` |
| `CORE` | Núcleo Global | `nucleo-global/` |
| `MARKET` | Marketplace público | `servicos-global/marketplace/` |
| `TENANT` | Serviços tenant | `servicos-global/tenant/*` |
| `DBASE` | Banco / Prisma | `servicos-global/configurador/prisma/` |
| `PEDIDO` | Produto Pedido | `produto/pedido/` |
| `NFIMP` | Produto NF Importação | `produto/nf-importacao/` |
| `LPCO` | Produto LPCO | `produto/lpco/` |
| `BIDFRT` | Produto BID Frete Internacional | `produto/bid-frete-internacional/` |
| `BIDCAM` | Produto Bid Câmbio | `produto/bid-cambio/` |
| `SIMCUS` | Produto SimulaCusto | `produto/simula-custo/` |
| `FINCOM` | Produto Financeiro Comex | `produto/financeiro-comex/` |
| `PROCSO` | Produto Processo | `produto/processo/` |

| `MBOTO` | Transversal — menu-botoes / seletor universal de visualizações | `testes/*/menu-botoes/seletor-universal-visoes/` |

**Total: 17 escopos.** PETSHOP foi removido (produto não existe).

**Híbrido MBOTO:** IDs usam escopo `MBOTO`; variantes por produto ficam em `matriz-produtos.json` (`produto_slug`).

**Para adicionar um novo escopo:**
1. Atualizar este documento
2. Atualizar `documentos-tecnicos/testes/tecnico/01-arquitetura-sistema-testes.md`
3. Atualizar `skills/testes/agente-plano-teste/SKILL.md`
4. Atualizar regex de validação no CI

---

## Regra 9 — Validador automático

Existe um script em `scripts/ativamente/validate-test-ids.ts` que:
1. Lê todos os arquivos `testes/**/TST-*` do projeto
2. Valida cada ID contra o regex
3. Detecta duplicatas
4. Detecta IDs órfãos no registry (entrada existe mas arquivo não)
5. Detecta arquivos órfãos (arquivo existe mas entrada no registry não)
6. Falha o CI se qualquer regra acima for violada

Rodar localmente antes de commit:
```bash
npm run validate:test-ids
```

---

## Regra 10 — Ao gerar testes via IA

Quando um agente IA gera um teste novo:
1. **Lê o registry** pra descobrir o próximo número da combinação tipo+escopo
2. **Gera o arquivo** com o nome no padrão acima
3. **Adiciona entrada no registry** com o ID + path
4. **Valida o ID** com o script antes de comitar

Se o agente não seguir essas 4 etapas, o PR é rejeitado pelo CI.

**Novos planos (jun/2026+):** a numeração é **automática** — `generatePlanId()` em `servicos-global/configurador/server/lib/agente-plano-teste.ts` lê o registry e devolve o próximo `TST-{TIPO}-{ESCOPO}-{NNNNNN}`; EMT segue a família `TST-EMT-{LOCAL}-{AREA}-{RESUMO}-{NNN}` com o próximo `{NNN}` da mesma família. O agente não escolhe número à mão.

---

## Regra 11 — Legados: numeração só ao revisar o plano

**Não** renomear todos os planos antigos de uma vez. Planos legados podem ter `-001` em vez de `-000001`, formato EMT antigo (`TST-EMT-LOGIN-PORTEIRO-SIGNUP-000041`) ou ID híbrido (`TST-UNI-PEDIDO-000029`).

**Política vigente:** ao abrir/revisar um plano legado, corrigir **somente a numeração sequencial** naquele plano — alinhar ID no `.md`, spec/runner, `test-plans-registry.json` e referências no **mesmo commit**. Fora de revisão ativa, o ID legado permanece (Regra 2).

| Situação | O que fazer |
|---|---|
| Plano **novo** | Numeração automática (Regra 10) |
| Plano **legado** em revisão | Ajustar sequência manualmente, plano a plano |
| Plano legado intocado | Manter ID atual até a próxima revisão |

**Migração em lote (2026-06-07):** 32 IDs do registry normalizados via `scripts/ativamente/migrate-legacy-test-ids.ts` (híbridos → `TST-{TIPO}-{ESCOPO}-{000001..N}`; EMT antigo → formato legível). Histórico de execução EMT em `test-logs/` não foi alterado.

---

## Exemplos completos

| ID | Tipo | Escopo | Significado |
|---|---|---|---|
| `TST-E2E-CONFIG-000013` | E2E | Configurador | Primeiro E2E do Config (tela Organização) |
| `TST-UNI-CORE-000042` | Unitário | Núcleo Global | Unitário 42 do CORE (componente Tabela) |
| `TST-FUN-PEDIDO-000062` | Funcional | Pedido | Funcional 7 do Pedido (rota /api/pedidos) |
| `TST-CRO-NFIMP-000003` | Cross-tenant | NF Imp | Cross-tenant 3 (isolamento de NFs entre tenants) |
| `TST-PEN-LOGIN-000001` | Pentest | Login | Primeiro pentest do Login (brute-force) |
| `TST-CON-CONFIG-000015` | Contract | Configurador | Contract 15 (schema da rota /api/users) |
