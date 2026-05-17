# Gravity — Testes Automatizados

> Pasta central de **todos** os testes do Gravity. Organizada por **6 tipos x 16 escopos x N sublocais**.
> Gerenciada pelo **pipeline multi-agente** (`skills/testes/multi-agente-plano-teste/SKILL.md`) como processo primario.

---

## REGRA ABSOLUTA -- FONTE PRIMARIA (2026-05-17)

> **Quando o pipeline multi-agente gera planos para um escopo, esses planos sao a UNICA fonte de verdade.**
> Testes legados (`.test.ts`, `.spec.ts`, planos `.json`/`.md`) do MESMO escopo sao **deletados e substituidos**.
> Testes de outros escopos permanecem intactos. Testes de seguranca (`testes/security/`) nunca sao deletados.

---

## Antes de criar QUALQUER teste

1. Ler `skills/testes/multi-agente-plano-teste/SKILL.md` **(processo primario)**
2. Ler `skills/testes/SKILL.md` (coordenacao dos 3 niveis)
3. Ler `documentos-tecnicos/testes/regras/01-convencao-ids.md`
4. Ler `documentos-tecnicos/testes/regras/02-cobertura-obrigatoria.md`
5. Verificar se existem testes legados do mesmo escopo (regra FONTE PRIMARIA)

**Pular leitura -> CI rejeita o PR.**

---

## Estrutura

```
testes/
├── README.md                          ← este arquivo
├── playwright.fixtures.ts             ← fixture global (screenshot em todo teste)
├── test-plans-registry.json           ← catálogo central de IDs
│
├── _fixtures/                         ← compartilhado entre tipos
│   ├── tenants.ts
│   ├── users.ts
│   ├── auth.ts
│   └── data-seed.ts
│
├── _mapeamentos/                      ← testids por tela (single source of truth)
│   └── <escopo>/<sublocal>.testids.json
│
├── _planos/                           ← planos de teste em JSON (gerados pelo agente)
│   └── <escopo>/<sublocal>.json
│
├── testes-unitarios/<escopo>/<sublocal>/TST-UNI-*.test.ts       ← Vitest
├── testes-contract/<escopo>/<sublocal>/TST-CON-*.test.ts        ← Vitest + Zod
├── testes-funcionais/<escopo>/<sublocal>/TST-FUN-*.test.ts      ← Vitest + supertest
├── testes-cross-tenant/<escopo>/<sublocal>/TST-CRO-*.test.ts    ← Vitest + 2 tenants
├── testes-e2e/<escopo>/<sublocal>/TST-E2E-*.spec.ts             ← Playwright
├── testes-pentest/<escopo>/<sublocal>/TST-PEN-*.yaml            ← OWASP ZAP
│
├── test-results/                      ← gerado: screenshots, traces (gitignored)
└── playwright-report/                 ← gerado: HTML reports (gitignored)
```

---

## Os 6 Tipos

| Sigla | Tipo | Ferramenta |
|---|---|---|
| **UNI** | Unitário | Vitest |
| **CON** | Contract Testing | Vitest + Zod |
| **FUN** | Funcional | Vitest + supertest |
| **CRO** | Cross-tenant | Vitest + 2 tenants |
| **E2E** | End-to-end | Playwright |
| **PEN** | Pentest | OWASP ZAP |

## Os 16 Escopos

| Sigla | Pasta | Onde mora |
|---|---|---|
| `LOGIN` | login/ | nucleo-global/Login/login-global/ |
| `CONFIG` | configurador/ | servicos-global/configurador/ |
| `ADMIN` | admin/ | servicos-global/configurador/src/pages/admin/ |
| `HUB` | hub/ | servicos-global/shell/ |
| `CORE` | core/ | nucleo-global/ |
| `MARKET` | marketplace/ | servicos-global/marketplace/ |
| `ORG` | organizacao/ | servicos-global/servicos-plataforma/ |
| `DBASE` | dbase/ | configurador/prisma/ |
| `PEDIDO` | pedido/ | servicos-global/produto/pedido/ |
| `NFIMP` | nf-importacao/ | servicos-global/produto/nf-importacao/ |
| `LPCO` | lpco/ | servicos-global/produto/lpco/ |
| `BIDFRT` | bid-frete/ | servicos-global/produto/bid-frete/ |
| `BIDCAM` | bid-cambio/ | servicos-global/produto/bid-cambio/ |
| `SIMCUS` | simula-custo/ | servicos-global/produto/simula-custo/ |
| `FINCOM` | financeiro-comex/ | servicos-global/produto/financeiro-comex/ |
| `PROCSO` | processo/ | servicos-global/produto/processo/ |

---

## Convenção de IDs

```
TST-{TIPO}-{ESCOPO}-{NNNNNN}
```

Exemplos:
- `TST-E2E-CONFIG-000001` — primeiro E2E do Configurador
- `TST-UNI-CORE-000042` — unitário 42 do CORE
- `TST-CRO-PEDIDO-000003` — cross-tenant 3 do Pedido

Detalhes em `documentos-tecnicos/testes/regras/01-convencao-ids.md`.

---

## Validadores

```bash
npm run validate:test-ids        # convenção de IDs
npm run validate:cobertura        # 20 categorias por plano
npm run validate:testids          # mapeamentos batem com componentes
npm run validate:registry         # consistência do registry
npm run validate:planos           # passos humano-original preservados
npm run validate:testes           # roda todos acima
```

---

## Comandos úteis

```bash
# Rodar testes E2E de um escopo específico
npx playwright test --project=configurador

# Rodar 1 plano específico
npx playwright test testes/testes-e2e/configurador/organizacao/TST-E2E-CONFIG-000001.spec.ts

# Rodar testes unitários de um escopo
npx vitest run testes/testes-unitarios/configurador

# Gerar plano para uma tela nova (chama o agente)
npm run gerar-plano -- --escopo CONFIG --sublocal Organização

# Extrair testids de um componente (atualiza mapeamento)
npm run extract-testids -- --tela configurador/organizacao
```

---

## Pipeline Multi-Agente (processo primario desde 2026-05-17)

O processo de criacao de planos de teste e executado por 8 agentes especializados em 6 fases:

```
FASE 1 (paralela): Analisador de Codigo + Analisador de Tela
FASE 2: Analisador de Variaveis (enumera TODAS as combinacoes)
FASE 3: QA Pleno (valida completude) -> QA Master (certeza 100%)
FASE 4: Elaborador (3 planos JSON: UNI + FUN + E2E)
FASE 5: Revisor (conformidade planos vs matriz)
FASE 6: Coordenador (aprovacao + apresentacao ao dono)
```

Skill completa: `skills/testes/multi-agente-plano-teste/SKILL.md`

---

## Estado atual (2026-05-17)

- **Estrutura**: criada (96 pastas)
- **Registry**: 28 planos ativos
- **Pipeline multi-agente**: definido (8 agentes, 6 fases)
- **Regra FONTE PRIMARIA**: ativa — planos multi-agente substituem legados
- **Testes executaveis**: 106 (67 UNI + 27 FUN + 11 E2E + 1 CRO)
- **Validadores CI**: a completar
