# GABI Fórmulas — Plano de Extração como Serviço Reutilizável

> **Objetivo:** transformar a GABI de fórmulas (atualmente acoplada ao produto Pedido) em um conjunto de pacotes reutilizáveis que qualquer produto do Gravity pode consumir.
> **Status:** Planejamento — nenhuma tarefa iniciada.
> **Data:** Abril 2026

---

## Visão Geral da Extração

### Estado Atual (acoplado ao Pedido)

```
produto/pedido/client/src/shared/
├── formulaEngine.ts        ← parser puro — candidato a nucleo-global
└── gabiSemantica.ts        ← regras semânticas do Pedido — fica no produto

produto/pedido/client/src/pages/
└── Configuracoes.tsx       ← card UI + hook + debounce — candidato a nucleo-global

produto/pedido/server/src/services/
└── geminiFormulaAdvisor.ts ← integração Gemini — fica por produto

produto/pedido/server/src/routes/
└── colunasUsuario.ts       ← endpoint /gabi-analise — fica por produto
```

### Estado Alvo (extraído)

```
nucleo-global/
├── Formula/
│   └── formula-engine-global/    ← parser puro, testado, sem deps
│       ├── src/formulaEngine.ts
│       ├── src/index.ts
│       └── package.json          → @nucleo/formula-engine-global
└── Gabi/
    └── gabi-formula-global/      ← card UI + hook injetável
        ├── src/GabiFormulaCard.tsx
        ├── src/useGabiFormula.ts
        ├── src/types.ts           → GabiAviso (contrato público)
        ├── src/gabi-formula.css   → tokens do design system
        └── package.json           → @nucleo/gabi-formula-global

produto/pedido/client/src/shared/
└── gabiSemantica.ts        ← fica — regras específicas do domínio Pedido

produto/pedido/server/src/services/
└── geminiFormulaAdvisor.ts ← fica — prompt customizado por produto
```

---

## Contrato Público (definido antes de tudo)

```ts
// @nucleo/gabi-formula-global — types.ts
export interface GabiAviso {
  titulo:    string
  texto:     string
  sugestao?: string   // todos opcionais na v1 para evitar breaking changes futuros
}

// Hook público
export function useGabiFormula(
  expressao:    string,
  campos:       CampoMeta[],
  analisador:   (expr: string) => GabiAviso | null,
  opcoes?:      { debounceMs?: number; gabiEndpoint?: string }
): UseGabiFormulaResult

export interface UseGabiFormulaResult {
  estado:   'vazio' | 'pendente' | 'erro' | 'aviso' | 'ok'
  aviso:    GabiAviso | null
  erro:     string | null
  valida:   boolean
}
```

---

## Ondas de Execução

### Onda 0 — Pré-condições (bloqueante para tudo)

Nenhuma onda pode iniciar sem que estas tarefas estejam concluídas.

| ID | Tarefa | Responsável | Dependência |
|----|--------|-------------|-------------|
| P-01 | Mapear tokens do design system para as 5 variantes do card (roxo, amarelo, vermelho, verde, azul) | UX | — |
| P-02 | Validar cobertura atual de testes: formulaEngine + gabiSemantica devem atingir ≥ 80% de branches | QA | — |
| P-03 | Definir e aprovar o contrato `GabiAviso` + assinatura do `useGabiFormula` | Líder Técnico + Sistemas | — |
| P-04 | Adicionar delimitadores anti-injection no prompt do Gemini (`<formula>...</formula>`) | Segurança + Backend | — |
| P-05 | Adicionar `express-rate-limit` por tenant no endpoint `/gabi-analise` | Backend | — |

**Critério de saída da Onda 0:** todas as 5 tarefas aprovadas pelo QA.

---

### Onda 1 — Núcleo: Parser

**Objetivo:** mover `formulaEngine.ts` para `nucleo-global` como pacote independente e testado.

| ID | Tarefa | Responsável | Dependência |
|----|--------|-------------|-------------|
| 1-01 | Criar estrutura de pastas `nucleo-global/Formula/formula-engine-global/` com `package.json`, `tsconfig.json` e `src/index.ts` | Líder Técnico | P-03 |
| 1-02 | Mover `formulaEngine.ts` para o novo pacote, ajustar exports públicos vs internos | Líder Técnico | 1-01 |
| 1-03 | Mover `gabiSemantica.test.ts` (parser tests) e escrever testes adicionais até 80% branches | QA | 1-02 |
| 1-04 | Atualizar imports no Pedido: `formulaEngine.ts` local → `@nucleo/formula-engine-global` | Frontend (Pedido) | 1-03 |
| 1-05 | Atualizar `vitest.config.ts` e alias `@nucleo/formula-engine-global` nos testes do Pedido | DevOps | 1-04 |
| 1-06 | Verificar build order no CI — nucleo deve buildar antes dos produtos | DevOps | 1-05 |

**Critério de saída da Onda 1:** Pedido compila, todos os 34+ testes passam, cobertura ≥ 80%.

---

### Onda 2 — Núcleo: Card + Hook

**Objetivo:** criar `@nucleo/gabi-formula-global` com o card UI e o hook injetável.

| ID | Tarefa | Responsável | Dependência |
|----|--------|-------------|-------------|
| 2-01 | Criar estrutura `nucleo-global/Gabi/gabi-formula-global/` com `package.json`, `tsconfig.json` | Líder Técnico | Onda 1 completa |
| 2-02 | Extrair `GabiFormulaCard` de `Configuracoes.tsx` como componente puro, sem deps de produto | Frontend | 2-01 |
| 2-03 | Migrar CSS do card: variáveis hardcoded → tokens do design system (mapa de P-01) | UX + Frontend | 2-02, P-01 |
| 2-04 | Criar `useGabiFormula` hook com debounce, estados, injeção de analisador e chamada opcional a endpoint | Frontend | 2-03 |
| 2-05 | Exportar `GabiAviso`, `CampoMeta`, `UseGabiFormulaResult` de `src/types.ts` | Frontend | 2-04 |
| 2-06 | Escrever testes de integração do hook: debounce, estados, analisador customizado, chamada Gemini mockada | QA | 2-05 |
| 2-07 | Escrever testes de renderização do card: todas as 5 variantes, botão "Usar", prop `onAplicarSugestao` | QA | 2-06 |
| 2-08 | Cobertura ≥ 80% no pacote `gabi-formula-global` | QA | 2-07 |

**Critério de saída da Onda 2:** pacote publicável, testes passam, cobertura ≥ 80%, CSS usando tokens.

---

### Onda 3 — Integração no Pedido

**Objetivo:** fazer o Pedido consumir os dois novos pacotes sem regressão.

| ID | Tarefa | Responsável | Dependência |
|----|--------|-------------|-------------|
| 3-01 | Substituir uso local de `GabiFormulaCard` em `Configuracoes.tsx` pelo pacote `@nucleo/gabi-formula-global` | Frontend (Pedido) | Onda 2 completa |
| 3-02 | Substituir `useGabiFormula` inline por `useGabiFormula` do pacote, injetando `analisarSemanticaFormula` (gabiSemantica.ts local) | Frontend (Pedido) | 3-01 |
| 3-03 | Atualizar mock `@nucleo/gabi-formula-global` em `testes/testes-unitarios/pedido/__mocks__/nucleo.tsx` | QA | 3-02 |
| 3-04 | Rodar suite completa de testes do Pedido — zero regressão | QA | 3-03 |
| 3-05 | Review de código pelo Líder Técnico — checklist de Code Review | Líder Técnico | 3-04 |

**Critério de saída da Onda 3:** Pedido funcionando com os pacotes, zero regressão, review aprovado.

---

### Onda 4 — Segurança e Operação

**Objetivo:** garantir que a infraestrutura está pronta para o componente rodar em produção.

| ID | Tarefa | Responsável | Dependência |
|----|--------|-------------|-------------|
| 4-01 | Implementar `express-rate-limit` por tenant em `/gabi-analise` (de P-05, agora com componente estabilizado) | Backend | Onda 3 completa |
| 4-02 | Adicionar delimitadores `<formula>...</formula>` no prompt do Gemini (de P-04) | Backend | Onda 3 completa |
| 4-03 | Contract test no CI: verifica que `GabiAviso` não mudou forma sem versionamento | Sistemas + DevOps | 4-01 |
| 4-04 | Adicionar pacotes ao pipeline de build do CI/CD Railway | DevOps | 4-03 |
| 4-05 | QA final: checklist completo das 6 categorias | QA | 4-04 |

**Critério de saída da Onda 4:** CI verde, contract test rodando, rate limit ativo, QA aprovado.

---

### Onda 5 — Validação e Documentação

**Objetivo:** garantir que o próximo produto pode consumir sem precisar de ajuda.

| ID | Tarefa | Responsável | Dependência |
|----|--------|-------------|-------------|
| 5-01 | Atualizar `documentos-tecnicos/produtos-gravity/gabi/GABI-TECNICO.md` com nova arquitetura de pacotes | Líder Técnico | Onda 4 completa |
| 5-02 | Escrever `nucleo-global/Gabi/gabi-formula-global/README.md` com exemplo mínimo de uso por produto novo | Líder Técnico | 5-01 |
| 5-03 | Atualizar skill `skills/arquitetura/nucleo-global/SKILL.md` com os dois novos pacotes no catálogo | Líder Técnico | 5-02 |
| 5-04 | Implementação de referência: um segundo produto consumindo `@nucleo/gabi-formula-global` com seus próprios SEMANTICA_CAMPOS | Líder Técnico + PO | 5-03 |

**Critério de saída da Onda 5 (e do projeto):** segundo produto usando o pacote em produção.

---

## Mapa de Dependências

```
P-01 ──────────────────────────────────────────────► 2-03
P-02 ──► (valida viabilidade)
P-03 ──► 1-01 ──► 1-02 ──► 1-03 ──► 1-04 ──► 1-05 ──► 1-06
                                                          │
                                          2-01 ◄──────────┘
                                            │
P-01 ──► 2-03 ◄── 2-02 ◄── 2-01
                    │
                  2-04 ──► 2-05 ──► 2-06 ──► 2-07 ──► 2-08
                                                          │
                                        3-01 ◄────────────┘
                                          │
                                        3-02 ──► 3-03 ──► 3-04 ──► 3-05
                                                                       │
                              4-01, 4-02 ◄────────────────────────────┘
                                   │
                                 4-03 ──► 4-04 ──► 4-05
                                                      │
                                          5-01 ──► 5-02 ──► 5-03 ──► 5-04
```

---

## Responsáveis por Onda

| Onda | Responsável Principal | Apoio |
|------|----------------------|-------|
| 0 — Pré-condições | QA + Segurança | UX, Backend, Líder Técnico |
| 1 — Parser | Líder Técnico | QA, DevOps |
| 2 — Card + Hook | Frontend | UX, QA |
| 3 — Integração Pedido | Frontend (Pedido) | QA, Líder Técnico |
| 4 — Segurança/Ops | Backend + DevOps | Sistemas, QA |
| 5 — Validação/Docs | Líder Técnico | PO |

---

## Total de Tarefas

| Onda | Tarefas | Bloqueante |
|------|---------|-----------|
| 0 — Pré-condições | 5 | Sim — bloqueia tudo |
| 1 — Parser | 6 | Sim — bloqueia Onda 2 |
| 2 — Card + Hook | 8 | Sim — bloqueia Onda 3 |
| 3 — Integração Pedido | 5 | Sim — bloqueia Onda 4 |
| 4 — Segurança/Ops | 5 | Sim — bloqueia Onda 5 |
| 5 — Validação/Docs | 4 | Fim |
| **Total** | **33** | |

---

## O que NÃO muda

- `gabiSemantica.ts` — permanece em cada produto com seus próprios metadados de domínio
- `geminiFormulaAdvisor.ts` — permanece em cada produto com prompt customizado
- Endpoint `/gabi-analise` — permanece em cada produto
- Testes unitários de `gabiSemantica.test.ts` — permanecem em `testes/testes-unitarios/pedido/`
- Nenhuma alteração em banco de dados
- Nenhuma migration necessária
