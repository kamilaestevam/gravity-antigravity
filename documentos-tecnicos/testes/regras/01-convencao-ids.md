# Regras — Convenção de IDs de Testes

> Regras invioláveis de nomenclatura para todos os testes do Gravity. Qualquer agente que crie um teste DEVE seguir esta convenção. CI bloqueia PRs que violam.

---

## Formato Obrigatório

```
TST-{TIPO}-{ESCOPO}-{NNNNNN}
```

### Componentes

| Parte | Tamanho | Valores válidos |
|---|---|---|
| `TST` | fixo | sempre `TST` |
| `{TIPO}` | 3 letras | `UNI`, `CON`, `FUN`, `CRO`, `E2E`, `PEN` |
| `{ESCOPO}` | 5-6 letras | `LOGIN`, `CONFIG`, `ADMIN`, `HUB`, `CORE`, `MARKET`, `TENANT`, `DBASE`, `PEDIDO`, `NFIMP`, `LPCO`, `BIDFRT`, `BIDCAM`, `SIMCUS`, `FINCOM`, `PROCSO` |
| `{NNNNNN}` | 6 dígitos | sequencial com zero-padding |

### Regex de validação
```
^TST-(UNI|CON|FUN|CRO|E2E|PEN)-(LOGIN|CONFIG|ADMIN|HUB|CORE|MARKET|TENANT|DBASE|PEDIDO|NFIMP|LPCO|BIDFRT|BIDCAM|SIMCUS|FINCOM|PROCSO)-\d{6}$
```

---

## Regra 1 — Numeração reseta por combinação `tipo+escopo`

Cada combinação tipo+escopo tem sua própria sequência. Exemplos válidos coexistindo:

```
TST-E2E-CONFIG-000001     ✅ (E2E #1 do Configurador)
TST-E2E-PEDIDO-000001     ✅ (E2E #1 do Pedido — sequência separada)
TST-UNI-CONFIG-000001     ✅ (Unitário #1 do Configurador — sequência separada)
TST-FUN-CONFIG-000001     ✅
```

**Errado:**
```
TST-E2E-CONFIG-000001     ✅
TST-E2E-CONFIG-000001     ❌ (duplicado!)
```

---

## Regra 2 — IDs nunca mudam após criação

Refactor de arquivo não muda o ID. Renomear `.spec.ts` não muda o ID. Mover de pasta não muda o ID.

**Por quê:** o ID é referenciado em screenshots, logs históricos, tickets, métricas. Mudar o ID quebra rastreabilidade.

**Exemplo:**
```
TST-E2E-CONFIG-000001 — criado 2026-04-15 com nome "organizacao.spec.ts"
                     ↓ (refactor 2026-08-20)
TST-E2E-CONFIG-000001 — agora se chama "organizacao-edicao.spec.ts"
                       MAS o ID continua o mesmo
```

---

## Regra 3 — Numeração com zero-pad (6 dígitos)

```
TST-E2E-CONFIG-000001    ✅
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

## Regra 4 — Sublocal NÃO entra no ID

Sublocais (Organização, Workspaces, Dashboard, etc.) ficam **no metadata do registry**, não no ID. Razões:

- IDs precisam caber em colunas, logs, URLs
- Sublocais podem ser renomeados sem invalidar IDs
- Filtros por sublocal acontecem no backend lendo o registry

**Errado:**
```
TST-E2E-CONFIG-ORGANIZACAO-000001   ❌ (sublocal no ID)
TST-E2E-CONFIG-ORG-000001           ❌
```

**Certo:**
```
TST-E2E-CONFIG-000001               ✅
  + metadata.sublocal: "Organização"
```

---

## Regra 5 — Nome do arquivo `.spec.ts`

Padrão:
```
testes/testes-e2e/<escopo>/<sublocal-kebab>/TST-{TIPO}-{ESCOPO}-{NNNNNN}.spec.ts
```

Exemplos:
```
testes/testes-e2e/configurador/organizacao/TST-E2E-CONFIG-000001.spec.ts
testes/testes-funcionais/admin/visao-geral/TST-FUN-ADMIN-000005.test.ts
testes/testes-cross-tenant/pedido/dashboard/TST-CRO-PEDIDO-000002.test.ts
```

**Por quê o ID no nome do arquivo:** facilita encontrar via `find` e via grep. O nome do arquivo **é** o ID, não tem ambiguidade.

---

## Regra 6 — IDs reservados nunca são reusados

Se um teste é deletado, seu ID **não pode ser reusado**. Próximo teste daquela combinação tipo+escopo continua a sequência.

**Exemplo:**
```
TST-E2E-CONFIG-000001  → deletado em 2026-05-10
TST-E2E-CONFIG-000002  ✅ (existe)
TST-E2E-CONFIG-000003  ✅ (próximo a criar — não pula pro 000001)
```

O registry mantém um campo `deletados: ["TST-E2E-CONFIG-000001"]` pra rastreabilidade histórica.

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
| `BIDFRT` | Produto Bid Frete | `produto/bid-frete/` |
| `BIDCAM` | Produto Bid Câmbio | `produto/bid-cambio/` |
| `SIMCUS` | Produto SimulaCusto | `produto/simula-custo/` |
| `FINCOM` | Produto Financeiro Comex | `produto/financeiro-comex/` |
| `PROCSO` | Produto Processo | `produto/processo/` |

**Total: 16 escopos.** PETSHOP foi removido (produto não existe).

**Para adicionar um novo escopo:**
1. Atualizar este documento
2. Atualizar `documentos-tecnicos/testes/tecnico/01-arquitetura-sistema-testes.md`
3. Atualizar `skills/testes/agente-plano-teste/SKILL.md`
4. Atualizar regex de validação no CI

---

## Regra 9 — Validador automático

Existe um script em `scripts/validate-test-ids.ts` que:
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

---

## Exemplos completos

| ID | Tipo | Escopo | Significado |
|---|---|---|---|
| `TST-E2E-CONFIG-000001` | E2E | Configurador | Primeiro E2E do Config (tela Organização) |
| `TST-UNI-CORE-000042` | Unitário | Núcleo Global | Unitário 42 do CORE (componente Tabela) |
| `TST-FUN-PEDIDO-000007` | Funcional | Pedido | Funcional 7 do Pedido (rota /api/pedidos) |
| `TST-CRO-NFIMP-000003` | Cross-tenant | NF Imp | Cross-tenant 3 (isolamento de NFs entre tenants) |
| `TST-PEN-LOGIN-000001` | Pentest | Login | Primeiro pentest do Login (brute-force) |
| `TST-CON-CONFIG-000015` | Contract | Configurador | Contract 15 (schema da rota /api/users) |
