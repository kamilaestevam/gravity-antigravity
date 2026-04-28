# Refatoração DDD — Onda 0 (tooling)

Automação da **FASE 06 DDD** do Gravity: renomear ~1.528 campos, ~185 models,
~30 enums e ~300 rotas através de 4 camadas (PostgreSQL, Prisma, backend,
frontend) a partir da planilha `planilha_geral_gravity.xlsx`.

## Lei das cores (da planilha)

| Cor     | Significado          | Ação             |
|---------|----------------------|------------------|
| 🔵 Azul | RENAME (alvo DDD)    | renomear         |
| 🔴 Vermelho | DELETE definitivo | remover          |
| 🟡 Amarelo | GHOST FIELD        | criar (faltando em DB) |

## Trava de UI (inviolável)

- **PROIBIDO** alterar colunas "Nome em tela - Atual" e "Nome em tela - DDD".
- Labels, botões, títulos, tooltips, i18n → **intocados**.
- Escopo desta onda: **banco + backend + propriedades no front**.

## Regras honradas

- **REGRA 02**: sem `@map` / `@@map`. Nome Prisma = nome PostgreSQL.
- **REGRA 07**: valores de enum permanecem **EN UPPER_SNAKE**. Só o nome do enum
  é traduzido para PascalCase PT-BR.

## Fluxo

```bash
# 1) Parse da planilha (gera plano.json)
tsx scripts/refatoracao-ddd/parse-planilha.ts "C:/Users/danie/Downloads/planilha_geral_gravity (16).xlsx"

# 2) Inspecione o plano legível de um serviço
tsx scripts/refatoracao-ddd/gerar-plano-servico.ts Cadastros

# 3) Aplique no fragment.prisma (dry primeiro!)
tsx scripts/refatoracao-ddd/aplicar-prisma.ts Cadastros --dry
tsx scripts/refatoracao-ddd/aplicar-prisma.ts Cadastros

# 4) Aplique em .ts/.tsx (codemod seguro, fora de strings)
tsx scripts/refatoracao-ddd/aplicar-codigo.ts Cadastros --dry
tsx scripts/refatoracao-ddd/aplicar-codigo.ts Cadastros

# 5) Gere a migration SQL (aplicação manual)
tsx scripts/refatoracao-ddd/gerar-migration.ts Cadastros
# → scripts/refatoracao-ddd/migrations/<timestamp>_cadastros.sql
```

## Arquivos

- `tipos.ts` — tipos compartilhados do plano.
- `parse-planilha.ts` — XLSX → `plano.json`.
- `gerar-plano-servico.ts` — imprime plano legível de um serviço.
- `aplicar-prisma.ts` — edita o fragment.prisma do serviço.
- `aplicar-codigo.ts` — codemod TS/TSX preservando strings.
- `gerar-migration.ts` — emite arquivo SQL em `migrations/`.

## Ordem de execução recomendada (Onda 1 — Cadastros)

1. `parse-planilha.ts`
2. `gerar-plano-servico.ts Cadastros` → revisar output
3. `aplicar-prisma.ts Cadastros --dry` → revisar mudanças
4. `aplicar-prisma.ts Cadastros` → salvar
5. `aplicar-codigo.ts Cadastros --dry` → revisar
6. `aplicar-codigo.ts Cadastros` → salvar
7. `gerar-migration.ts Cadastros` → revisar SQL
8. Executar SQL no banco de desenvolvimento (psql manual).
9. `npm run build` no workspace do serviço → validar TypeScript.
10. `npm test` → validar suite.
11. QA manual no ambiente local.

## O que NÃO faz (ainda)

- **Não executa** a migration — apenas gera o .sql.
- **Não atualiza** schemas Zod automaticamente (REGRA 09 — revisão manual
  obrigatória por ora).
- **Não toca** em `schema.prisma` composto — apenas no `fragment.prisma` do
  serviço. A composição fica com o Coordenador.
- **Não mexe** em `.md`, `.json` (exceto `plano.json`) nem em strings JS/TSX.

## Dependências

- `xlsx` (resolvido pelo root do monorepo)
- `tsx` (já em `scripts/package.json`)

## Escopo

`scripts/` é exclusivo do Coordenador. Nenhum outro agente modifica arquivos
aqui sem autorização.
