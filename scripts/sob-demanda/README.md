# scripts/sob-demanda/

Scripts utilitários executados sob demanda — backfills, migrações pontuais, limpezas, seeds.

> **ATENÇÃO:** scripts/ é escopo exclusivo do Coordenador. Nenhum outro agente
> modifica arquivos aqui sem autorização explícita.

---

## Índice

| Script | Tipo | Descrição |
|--------|------|-----------|
| `backfill-suid-empresa.ts` | Backfill | Cria Empresa em Cadastros para Organizacoes com `suid_empresa = NULL` (Fase 3 PASSO 06 DDD) |
| `check-products.ts` | Diagnóstico | Lista produtos cadastrados em uma Organizacao |
| `cleanup-seed-tenants.ts` | Limpeza | Remove tenants de seed/demo do Configurador |
| `cleanup-users.ts` | Limpeza | Remove usuários órfãos |
| `dev-local.ps1` | Dev | Sobe stack local de dev |
| `gerar-atlas-ddd.py` | DDD | Gera planilha mestre DDD |
| `gerar-ddd/` | DDD | Geradores auxiliares de mapas DDD |
| `migrate-stripe-metadata.ts` | Migração prod | Renomeia metadata legacy do Stripe (Customers + Subscriptions) para nomenclatura DDD |
| `seed-demo.ts` | Seed | Cria dados de demonstração |
| `seed-dev.ts` | Seed | Cria dados de desenvolvimento |
| `seed-test-user.ts` | Seed | Cria usuário de teste |
| `setup-dev.ts` | Setup | Bootstrap inicial do ambiente de dev |
| `start-configurador-backend.bat` | Dev | Sobe backend do Configurador (Windows) |

---

## migrate-stripe-metadata.ts

Migração one-shot para renomear metadata legacy nos objetos do Stripe (Customers
e Subscriptions) para a nomenclatura DDD ubíqua estabelecida no DB-2.

### Mapeamento

| Chave Legada | Chave DDD |
|--------------|-----------|
| `tenant_id` | `id_organizacao` |
| `user_id` | `id_usuario` |
| `company_id` | `id_workspace` |
| `product_id` | `id_produto` |

A migração apaga a chave legada (envia `metadata.<chaveLegada> = null` no
update — contrato documentado da Stripe API).

### Uso

```bash
# 1. Dry-run (padrão) — só lista o que migraria
export STRIPE_SECRET_KEY=sk_live_...
npx tsx scripts/sob-demanda/migrate-stripe-metadata.ts --dry-run

# 2. Aplicar de verdade
npx tsx scripts/sob-demanda/migrate-stripe-metadata.ts --apply

# 3. Debug — limita a leitura a 1 página de 100 itens
npx tsx scripts/sob-demanda/migrate-stripe-metadata.ts --dry-run --limit=1
```

### Pré-requisitos

- `STRIPE_SECRET_KEY` exportado no shell (chave de produção para o `--apply`).
- `stripe` package instalado (já está em `node_modules/` da raiz do monorepo).
- Backup recomendado antes do `--apply`: rodar o `--dry-run` e arquivar o
  output como evidência do estado pré-migração.

### Idempotência

Rodar 2x não causa estrago: após a 1ª passada, as chaves legadas já não
existem nos objetos Stripe, então o item entra em `skipped` na 2ª.

### Quando rodar

Em janela de manutenção, com o Coordenador presente. A migração não tem
downtime — é apenas um rewrite de metadata, e o código runtime já lê
ambas as chaves (Fase 3 do DB-2 garantiu compatibilidade transitória).
