# Regras — Cobertura Obrigatória por Tela

> Regras invioláveis de cobertura de testes. Toda tela do Gravity deve seguir o padrão **6 camadas × 20 categorias** definido aqui. CI bloqueia merges que violam.

---

## Princípio Zero

> **Toda tela tem 6 testes.** Sem exceção, sem desconto, sem "depois eu faço".

Os 6 são:
1. **Unitário** (UNI)
2. **Contract** (CON)
3. **Funcional** (FUN)
4. **Cross-tenant** (CRO)
5. **End-to-end** (E2E)
6. **Pentest** (PEN)

Se uma camada não se aplica à tela específica, ela é marcada como `nao_aplicavel` no plano com **justificativa obrigatória**. CI valida que a justificativa existe.

---

## Regra 1 — As 20 Categorias do Plano 10/10

Todo plano de teste deve cobrir as 20 categorias abaixo (ou marcar como `nao_aplicavel`):

| # | Categoria | Severidade |
|---|---|---|
| 1 | Carregamento da tela | 🔴 |
| 2 | Identidade visual | 🟡 |
| 3 | Navegação lateral / breadcrumb | 🟡 |
| 4 | Read / Listagem / Visualização | 🔴 |
| 5 | Update / Edição | 🔴 |
| 6 | Create / Criação | 🔴 |
| 7 | Delete / Exclusão | 🔴 |
| 8 | Validações de campo | 🔴 |
| 9 | Estados de erro | 🟡 |
| 10 | Estados vazios | 🟢 |
| 11 | Estados de loading | 🟢 |
| 12 | Filtros e busca | 🟡 |
| 13 | Ordenação | 🟢 |
| 14 | Permissões / RBAC | 🔴 |
| 15 | Multi-tenant / isolamento | 🔴 |
| 16 | Acessibilidade (a11y) | 🟡 |
| 17 | Responsividade | 🟡 |
| 18 | Internacionalização (i18n) | 🟢 |
| 19 | Performance | 🟡 |
| 20 | Persistência e refresh | 🟡 |

Detalhes de cada categoria em [skills/testes/agente-plano-teste/checklist-10-de-10.md](../../../skills/testes/agente-plano-teste/checklist-10-de-10.md).

---

## Regra 2 — Mínimo de Passos por Categoria por Criticidade

A criticidade da tela define quantos passos mínimos cada categoria deve ter.

| Categoria | Baixa | Média | Alta | Crítica |
|---|---|---|---|---|
| 1 — Carregamento | 2 | 3 | 4 | 5 |
| 2 — Identidade | 3 | 5 | 7 | 8 |
| 3 — Navegação | 2 | 4 | 6 | 8 |
| 4 — Read | 3 | 5 | 8 | 12 |
| 5 — Update | 0 | 5 | 10 | 15 |
| 6 — Create | 0 | 4 | 8 | 12 |
| 7 — Delete | 0 | 3 | 6 | 10 |
| 8 — Validações | 2 | 5 | 10 | 15 |
| 9 — Erros | 1 | 3 | 6 | 10 |
| 10 — Vazios | 1 | 2 | 3 | 4 |
| 11 — Loading | 1 | 2 | 3 | 4 |
| 12 — Filtros | 0 | 3 | 6 | 10 |
| 13 — Ordenação | 0 | 2 | 4 | 6 |
| 14 — RBAC | 1 | 3 | 6 | 10 |
| 15 — Multi-tenant | 1 | 2 | 4 | 6 |
| 16 — A11y | 2 | 4 | 6 | 8 |
| 17 — Responsivo | 1 | 3 | 4 | 5 |
| 18 — i18n | 1 | 2 | 4 | 5 |
| 19 — Performance | 0 | 2 | 4 | 6 |
| 20 — Persistência | 1 | 2 | 3 | 4 |
| **TOTAL MÍNIMO** | **22** | **64** | **108** | **163** |

---

## Regra 3 — Como Definir a Criticidade

| Criticidade | Critério | Exemplos |
|---|---|---|
| **Crítica** | Tela toca dinheiro OU dados sensíveis (CNPJ, CPF) OU permissões | Faturamento, Stripe, Auth, Organização |
| **Alta** | Tela é usada por todos os usuários OU é entrada do produto | Hub, Lista do Pedido, Dashboard |
| **Média** | Tela é secundária mas funcional | Configurações, Relatórios |
| **Baixa** | Tela informativa, ajuda, sobre | Sobre, Ajuda, Termos |

**Regras forçadas:**
- Se `temDinheiro = true` → criticidade mínima **alta**
- Se a tela tem inputs editáveis → categorias 5,6,7,8 com mínimo **media**
- Se a tela é pública (sem auth) → categorias 14,15 são `nao_aplicavel`
- Se a tela é read-only → categorias 5,6,7 podem ser `nao_aplicavel`

---

## Regra 4 — Justificativa Obrigatória para `nao_aplicavel`

Não pode marcar uma categoria como `nao_aplicavel` sem explicar por quê. **Validador rejeita.**

**Errado:**
```json
{ "categoria": 6, "status": "nao_aplicavel" }
```

**Certo:**
```json
{
  "categoria": 6,
  "status": "nao_aplicavel",
  "justificativa": "Organização é única por tenant — criação acontece via fluxo de onboarding (TST-E2E-CONFIG-000010), não nesta tela."
}
```

A justificativa deve ter **mínimo 30 caracteres** e mencionar:
- **Por que** não se aplica
- **Onde** acontece o teste equivalente (se houver)

---

## Regra 5 — Preservação de Planos Antigos

Se um plano já existe e o agente é chamado pra "expandir", ele **NUNCA remove passos do plano antigo**. Apenas:
- Mantém numeração original (1, 2, 3...)
- Adiciona novos no final (64, 65, 66...)
- Marca origem: `humano-original` ou `agente-adicionado`

**Validação:** ao expandir, o validador conta `passos.filter(p => p.origem === 'humano-original').length` antes e depois. Se diminuir, rejeita.

---

## Regra 6 — Cobertura Mínima por Camada

| Camada | Cobertura mínima |
|---|---|
| Unitário | 70% das funções puras tocadas pela tela |
| Contract | 100% das rotas usadas pela tela têm schema Zod |
| Funcional | 100% das rotas usadas pela tela têm pelo menos 1 teste funcional |
| Cross-tenant | 100% das rotas que tocam dados de tenant têm pelo menos 1 teste cross-tenant |
| E2E | 1 plano por tela cobrindo as 20 categorias |
| Pentest | 1 scan ZAP por escopo (não por tela) |

**Validação no CI:**
```bash
npm run validate:coverage --tela=configurador/organizacao
```

---

## Regra 7 — Mapeamento de Testids

Toda tela tem um arquivo de mapeamento em `testes/_mapeamentos/<escopo>/<sublocal>.testids.json`.

### Regras do mapeamento

1. **Todo `data-testid` no componente DEVE estar no mapeamento.**
2. **Todo testid no mapeamento DEVE existir no componente.**
3. O agente extrai automaticamente; humano não escreve à mão.
4. CI valida com `npm run validate:testids`.

### Estrutura
```json
{
  "componente": "servicos-global/configurador/src/pages/Organizacao.tsx",
  "extraidoEm": "2026-04-15T18:30:00Z",
  "elementos": {
    "input-nome-empresa": {
      "testid": "input-nome-empresa",
      "tipo": "input",
      "descricao": "Campo Nome da Empresa",
      "label": "NOME DA EMPRESA",
      "required": true
    }
  }
}
```

### Texto na tela = texto na ação

Se o passo do plano diz **"Clicar Salvar"**, o botão na tela deve exibir literalmente **"Salvar"** (ou a chave i18n `comum.salvar` que traduz pra "Salvar").

O mapeamento valida isso com o campo `texto` ou `i18nKey`.

---

## Regra 8 — Tipos Aplicáveis por Passo

Todo passo do plano tem `tiposAplicaveis: [...]` indicando em quais camadas ele deve gerar teste.

**Exemplos:**
- Verificar layout visual → `["E2E"]`
- Editar campo + salvar → `["E2E"]`
- Validação de CNPJ → `["E2E", "FUN", "UNI"]` (UI + API + função pura)
- Cross-tenant isolation → `["CRO"]`
- Brute force login → `["PEN"]`
- Schema de request → `["CON"]`

**Validação:** todo passo deve ter no mínimo 1 tipo aplicável.

---

## Regra 9 — Screenshots Obrigatórios

Categorias visuais (1, 2, 5, 9, 11, 14, 16, 17) devem ter **pelo menos 1 screenshot** por passo crítico.

Categorias não-visuais (8 com erros, 15, 19) podem ter `screenshot: null`.

**Padrão de nome:** `NN_descricao_em_snake_case` (ex: `01_tela_carregada`, `02_nome_editado`).

O Playwright grava como:
```
testes/test-results/<plano-id>/<numero>_<descricao>_<timestamp>.png
```

---

## Regra 10 — Validação no CI

Antes de qualquer merge, o CI roda:

```bash
npm run validate:testes
```

Que executa em sequência:

1. **`validate:test-ids`** — convenção de IDs (regra 1-10 do `01-convencao-ids.md`)
2. **`validate:cobertura`** — todas as 20 categorias presentes em todo plano
3. **`validate:justificativas`** — `nao_aplicavel` tem justificativa válida
4. **`validate:testids`** — mapeamentos batem com componentes
5. **`validate:registry`** — registry consistente (sem órfãos, sem duplicatas)
6. **`validate:planos-preservados`** — passos `humano-original` não foram removidos
7. **`validate:tipos-aplicaveis`** — todo passo tem tipo

Falhar qualquer um → PR bloqueado.

---

## Regra 11 — Ordem de Implementação por Tela

Quando uma tela nova é criada, a ordem obrigatória é:

1. **Componente** existe e renderiza
2. **Mapeamento de testids** gerado/atualizado
3. **Plano de teste** gerado pelo agente (status: `pendente_validacao`)
4. **Humano valida** o plano (status: `aprovado`)
5. **Specs gerados** pelo gerador (em todas as camadas aplicáveis)
6. **Testes rodam** e ficam verdes
7. **Merge** liberado

Pular qualquer etapa → CI rejeita.

---

## Regra 12 — Manutenção

Quando um componente é alterado:

1. **Re-extrair** mapeamento de testids (`npm run extract:testids -- --tela X`)
2. **Comparar** com mapeamento antigo
3. Se houver mudança:
   - Testid removido → buscar todos os specs que usam → atualizar
   - Testid adicionado → atualizar o plano (passo novo) ou marcar como não testado
   - Testid renomeado → buscar e substituir nos specs

Esse processo é **semi-automático** — o gerador de specs detecta drift e abre PR de atualização.

---

## Resumo executivo dessa página

- **6 camadas obrigatórias** por tela (com `nao_aplicavel` justificado quando não couber)
- **20 categorias obrigatórias** por plano (com `nao_aplicavel` justificado quando não couber)
- **Mínimos por criticidade** define quantos passos cada categoria precisa
- **Planos antigos são imutáveis** — só podem ser estendidos, nunca diminuídos
- **CI valida tudo** — não tem como burlar com merge manual
- **Mapeamento de testids = fonte de verdade** entre humano (plano) e máquina (spec)
