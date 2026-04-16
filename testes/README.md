# Gravity — Testes Automatizados

> Pasta central de **todos** os testes do Gravity. Organizada por **6 tipos × 16 escopos × N sublocais**.
> Gerenciada pelos agentes `analista-erros-testes-gemini` e `agente-plano-teste` em `skills/testes/`.

---

## ⚠️ Antes de criar QUALQUER teste

1. Ler `documentos-tecnicos/testes/regras/01-convencao-ids.md`
2. Ler `documentos-tecnicos/testes/regras/02-cobertura-obrigatoria.md`
3. Ler `skills/testes/agente-plano-teste/SKILL.md`
4. Ler `skills/testes/analista-erros-testes-gemini/SKILL.md`

**Pular leitura → CI rejeita o PR.**

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
| `TENANT` | tenant/ | servicos-global/tenant/ |
| `DBASE` | dbase/ | configurador/prisma/ |
| `PEDIDO` | pedido/ | produto/pedido/ |
| `NFIMP` | nf-importacao/ | produto/nf-importacao/ |
| `LPCO` | lpco/ | produto/lpco/ |
| `BIDFRT` | bid-frete/ | produto/bid-frete/ |
| `BIDCAM` | bid-cambio/ | produto/bid-cambio/ |
| `SIMCUS` | simula-custo/ | produto/simula-custo/ |
| `FINCOM` | financeiro-comex/ | produto/financeiro-comex/ |
| `PROCSO` | processo/ | produto/processo/ |

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

## Estado atual (2026-04-15)

- **Estrutura**: ✅ criada (96 pastas)
- **Registry**: ✅ vazio com 1 entrada (Organização)
- **Plano de exemplo**: ✅ `_planos/configurador/organizacao.json` (126 passos)
- **Mapeamento de exemplo**: ⚠️ embedded no plano, falta extrair pra `_mapeamentos/`
- **Specs gerados**: ❌ aguarda Onda 1 (gerador de specs)
- **Validadores CI**: ⚠️ a criar nas próximas etapas da Onda 0
