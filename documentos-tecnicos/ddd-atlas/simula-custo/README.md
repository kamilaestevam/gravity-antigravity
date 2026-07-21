# Atlas DDD — Simula COMEX (Simula Custo)

> Documentação DDD do produto **Simula Custo** (`simula-custo`) — simula de custo de importação/exportação (Landed Cost).
> Entidade canônica: `simula_custo`. DDD aprovado pelo dono em TASK-000425.

---

## Índice

| # | Arquivo | O que mapeia |
|:--|:--|:--|
| 1 | [`01-campos.md`](./01-campos.md) | Campos (db/back/front) — 8 models + 10 enums |
| — | *02–08* | *A criar nas próximas ondas (rotas, models, enums, páginas)* |

---

## Identidade do Produto

| Atributo | Valor |
|:--|:--|
| Nome canônico (slug) | `simula-custo` |
| Nome exibição | Simula COMEX / Simula Custo |
| Prefixo de tabela PG | `*_simula_custo` / `simula_custo` |
| Prefixo de model Prisma | `SimulaCusto`, `*SimulaCusto` |
| Porta backend | 8020 |
| `fragment.prisma` | `servicos-global/produto/simula-custo/prisma/fragment.prisma` |
| Banco Railway | `gravity-simula-custo` |
| Área task registry | `FINCOM` / código testes `SIMCUS` |
| Docs produto | `documentos-tecnicos/produtos-gravity/simulador-comex/` |

---

## Migrations (ordem)

1. `20260719015830_init_ddd_simula_custo`
2. `20260720120000_prazo_pagamento_simula_custo`
3. `20260720160000_modalidade_recolhimento_icms_simula_custo`
4. `20260720180000_fato_gerador_no_bl_prazo_pagamento`
5. `20260720190000_enviar_solicitacao_cotacao_frete_simula_custo`

---

## Skill e governança

- Nomenclatura: `skills/governanca/lei/ddd-nomenclatura/SKILL.md`
- Banco: `skills/governanca/lei/database-governance/SKILL.md`
- Multi-tenant: `scripts/ativamente/migrate-all-tenants.ts --product=simula-custo`
