---
name: antigravity-testes
description: "Skill de coordenação do ecossistema de testes do Gravity. Visão geral dos três níveis (Vitest unitário/funcional + Playwright E2E), padrões de organização, cobertura mínima por área e roteamento para as 7 skills filhas (padrões, contract testing, teste em tela, planos por tipo). Consultar antes de escrever qualquer teste — para decidir QUAL tipo, ONDE colocar e QUAIS padrões aplicar."
---

# Gravity — Coordenação de Testes

## Os Três Níveis

| Nível | Ferramenta | Onde mora | O que prova |
|:---|:---|:---|:---|
| **Unitário** | Vitest | `testes/testes-unitarios/` | Funções e componentes isolados funcionam |
| **Funcional** | Vitest + Supertest | `testes/testes-funcionais/` | Rotas/integração intra-serviço funcionam |
| **E2E** | Playwright | `testes/testes-e2e/` | Fluxos completos no navegador funcionam |

> **Pasta `testes/` é centralizada na raiz** — nenhum produto/serviço tem `__tests__` interno. Mantém specs separadas do código de produção e facilita CI.

---

## Cobertura Mínima Obrigatória

| Área | Cobertura unitária |
|:---|:---|
| `nucleo-global/` | ≥ 80% |
| `servicos-global/configurador/` | ≥ 70% |
| `servicos-global/servicos-plataforma/*/` | ≥ 70% |
| `produtos/*/` | ≥ 70% |
| `packages/resolver-organizacao/` | ≥ 90% (SDK crítico de isolamento) |

CI bloqueia merge abaixo do limite. Ver `padroes-vitest-playwright` para configuração.

---

## Testes Obrigatórios por Tipo de Código

### Rotas Express (qualquer servidor)
- [ ] Teste funcional do happy path
- [ ] Teste funcional de validação Zod (400 com payload inválido)
- [ ] Teste funcional de autorização (401/403)
- [ ] Teste funcional de erro de banco (500)

### Acesso a banco de produto (via SDK)
- [ ] Teste anti-cross-organização (`testes/security/cross-tenant-isolation.test.ts`)
- [ ] Teste de pool leak (`SET LOCAL` reset após crash do handler)

### Componentes React
- [ ] Teste unitário de render
- [ ] Teste unitário dos estados principais (loading, vazio, erro, sucesso)
- [ ] Teste funcional de interação se há lógica não-trivial

### Schemas Zod
- [ ] Teste unitário com payload válido
- [ ] Teste unitário com payload inválido (cada campo)
- [ ] **Contract test** se schema é compartilhado front↔back (ver `contract-testing`)

---

## Mapa das 7 Skills Filhas

| Skill | Quando consultar |
|:---|:---|
| `padroes-vitest-playwright` | Configurar Vitest/Playwright, estrutura de spec, mocks, fixtures |
| `contract-testing` | Schema Zod usado por front e back — CI bloqueia breaking changes (Mandamento 09) |
| `teste-em-tela` | Validação visual — Playwright com screenshots numerados em `testes/testes-em-tela/` |
| `agente-plano-teste` | Agente que cria planos de teste a partir de uma tela/feature |
| `agente-plano-teste-unitario` | Agente que detalha plano unitário (Vitest, categorias, cobertura) |
| `agente-plano-teste-funcional` | Agente que detalha plano funcional (rotas, fluxos, integração) |
| `agente-plano-teste-e2e` | Agente que detalha plano E2E (Playwright + Percy em staging) |

---

## Decisão: QUAL teste escrever?

```
Mudança em função pura, util, helper        → Unitário
Mudança em componente React isolado         → Unitário
Mudança em rota Express                     → Funcional + Unitário (do handler)
Mudança em schema Zod compartilhado         → Unitário + Contract
Mudança em fluxo do usuário (multi-tela)    → E2E + revisar Funcional/Unitário existente
Mudança visual (CSS, layout, ícone)         → Teste em Tela (skill teste-em-tela)
Mudança em SDK resolver-organizacao         → Unitário + anti-cross-org + pool-leak
```

---

## Decisão: ONDE colocar?

```
testes/
├── testes-unitarios/
│   ├── plano-de-testes/           ← planos .md (padrão ULTIMATE Auditor)
│   ├── nucleo-global/             ← espelha estrutura do código
│   ├── servicos-global/
│   ├── produtos/
│   └── packages/
├── testes-funcionais/
│   ├── plano-de-testes/
│   ├── configurador/
│   ├── organizacao/
│   └── produtos/
├── testes-e2e/
│   ├── plano-de-testes/
│   ├── configurador/
│   └── produtos/
├── testes-em-tela/                ← screenshots numerados (skill teste-em-tela)
│   ├── produto/
│   └── servico/
└── security/
    ├── cross-tenant-isolation.test.ts
    └── pool-leak.test.ts
```

**Regras:**
- O caminho do spec espelha o caminho do código de produção
- Plano de teste (`.md`) precede o spec (`.test.ts`/`.spec.ts`) sempre que a feature é nova
- Nenhum spec dentro de `produtos/`, `servicos-global/` ou `nucleo-global/`

---

## Fluxo Completo de uma Feature Nova

1. Agente recebe tarefa do Líder
2. Cria plano de teste (`agente-plano-teste*`) — para os 3 tipos
3. Plano aprovado pelo dono (E2E exige aprovação explícita — Mandamento 03 do QA)
4. Implementa código + specs Unitário/Funcional juntos
5. Roda Vitest local — todos verdes
6. Implementa specs E2E conforme plano
7. Roda Playwright local — todos verdes
8. PR aberto → CI roda os 3 níveis + cobertura + linter
9. QA acionado (skill `papeis/qa`) com checklist de 6 categorias
10. Aprovado → merge

---

## Regras Invioláveis

- **Nenhum teste com mock de banco quando o código real toca banco** — usar `testcontainers-postgres` ou banco de teste isolado
- **Nenhum spec E2E sem plano aprovado** pelo dono (regra do QA)
- **Nenhum `it.skip` ou `it.only`** chega no main — CI bloqueia
- **Nenhum spec dependente de ordem** — cada `it()` é independente
- **Nenhum `waitForTimeout(>1000)`** em E2E — se precisa, o app está lento
- **Schema Zod muda → contract test atualizado no MESMO commit** (Mandamento 09)
- **Cobertura abaixo do mínimo bloqueia merge** — sem exceção

---

## Checklist — Antes de Pedir Review

- [ ] 3 níveis presentes onde aplicável (unitário + funcional + E2E)?
- [ ] Cobertura ≥ limite da área?
- [ ] Plano de teste em `.md` para cada nível antes do spec?
- [ ] Anti-cross-organização + pool-leak para código que usa o SDK?
- [ ] Contract test atualizado se schema Zod mudou?
- [ ] Nenhum `it.skip`/`it.only`/`waitForTimeout` longo?
- [ ] CI verde local (`npm test` + `npm run test:e2e`)?
