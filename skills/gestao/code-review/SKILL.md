---
name: antigravity-code-review
description: "Use esta skill para conduzir code reviews. Define padrões de revisão, checklist técnico, tempo máximo de resposta e regras de aprovação. Consultada pelo Líder Técnico ao revisar entregas de qualquer agente ou desenvolvedor."
---

# Gravity — Code Review

## Regra Fundamental

Todo código passa por review antes de merge. Nenhuma exceção. Nenhum "é urgente". O review é a última barreira antes do código ir para staging.

---

## Tempo Máximo de Resposta

| Tipo | Tempo máximo |
|:---|:---|
| Bug fix P0 (produção) | 2 horas |
| Bug fix P1 | 4 horas |
| Feature/refactor | 24 horas úteis |

> Review que passa de 24h úteis → Líder escala.

---

## Checklist Técnico do Reviewer

### Segurança (bloqueia merge se falhar)

- [ ] Toda rota tem validação Zod?
- [ ] `tenant_id` filtrado em toda query?
- [ ] `x-internal-key` em chamadas S2S?
- [ ] Nenhum dado sensível em logs?
- [ ] Nenhuma variável hardcoded?

### Qualidade de Código

- [ ] TypeScript strict, sem `any`?
- [ ] Funções ≤ 50 linhas?
- [ ] Nenhum código morto ou comentado?
- [ ] Naming segue convenções (camelCase, PascalCase, snake_case)?
- [ ] Imports via aliases?

### Testes

- [ ] Testes unitários presentes?
- [ ] Testes funcionais para rotas?
- [ ] Teste de cross-tenant (se serviço tenant)?
- [ ] Cobertura ≥ 70%?

### Arquitetura

- [ ] Escopo respeitado (agente só escreveu na sua pasta)?
- [ ] Sem import cruzado entre serviços?
- [ ] Comunicação entre serviços via API (não import)?
- [ ] Schema de banco segue padrão (3 índices, tenant_id)?

---

## Como Dar Feedback

### Categorias de Comentário

| Prefixo | Significado | Bloqueia merge? |
|:---|:---|:---|
| `[blocker]` | Problema de segurança ou arquitetura | Sim |
| `[must-fix]` | Bug ou violação de padrão | Sim |
| `[suggestion]` | Melhoria opcional | Não |
| `[question]` | Dúvida sobre a abordagem | Não |
| `[praise]` | Reconhecimento de boa prática | Não |

### Regras de Feedback

- Ser específico — apontar a linha, sugerir a alternativa
- Explicar o porquê — "isso viola X porque Y"
- Não reescrever — sugerir, não impor estilo pessoal
- Reconhecer o bom — não só apontar problemas

---

## Regras de Aprovação

- **1 aprovação** do Líder Técnico é suficiente para merge
- **Qualquer blocker** impede merge até ser resolvido
- **Autor não pode aprovar** o próprio PR
- **Re-review** necessário se mudanças foram feitas após feedback

---

## Auto-Merge (quando permitido)

PRs que podem ser auto-merged após CI verde:

- Atualização de dependências (minor/patch)
- Correção de typo em documentação
- Atualização de `.env.example`

> Todo o resto requer review humano ou do Líder Técnico.

---

## Checklist — Antes de Aprovar

- [ ] Li todo o diff, não só os arquivos que conheço?
- [ ] Testei localmente ou confio nos testes do CI?
- [ ] Verifiquei se a skill relevante foi seguida?
- [ ] Nenhum blocker pendente?
- [ ] Definition of Done atendido?
