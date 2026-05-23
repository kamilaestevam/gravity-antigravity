# Espelhamento Teste → Produção

> **Status:** Guia operacional aprovado em 2026-05-02.
> **Aplica-se a:** todos os 4 bancos PostgreSQL do Gravity (cadastros, configurador, servicos-plataforma compartilha com configurador, pedido).

## Conceito-chave: o que significa "perfeitamente espelhado"

Há **duas dimensões** que podem ser espelhadas, e elas exigem estratégias diferentes:

| Dimensão | Exemplo | Quando espelhar prod ↔ teste |
|---|---|---|
| **Estrutura (schema)** | tabelas, colunas, tipos, índices, enums, FKs, migrations aplicadas | Sempre — produção e teste **devem** ter o mesmo schema |
| **Dados (rows)** | empresas cadastradas, pedidos criados, usuários, billing | **Quase nunca** — produção tem dados reais de cliente; teste tem dados fakes |

A regra de ouro: **espelhar SCHEMA é obrigatório, espelhar DADOS é raro e perigoso.**

### Por que não copiar dados de teste para produção
- Sobrescreve dados reais → perda imediata de informação de cliente
- Viola LGPD se dados de teste contiverem PII
- Quebra integrações ativas (Stripe, Clerk, ERP) se IDs mudam

### Por que não copiar dados de produção para teste
- Vaza dados pessoais para ambiente menos seguro (LGPD)
- Confunde testes (dados reais tem casos extremos não previstos)
- Cresce o banco de teste indefinidamente

**Exceção válida:** clonar produção para teste **mascarando PII** quando se precisa reproduzir um bug específico. Sempre com janela de manutenção e descarte do clone após.

---

## Os 3 cenários práticos

### Cenário A — Fresh production setup (1ª vez)

**Quando:** você está subindo a produção pela primeira vez, ou recriando do zero.

**Estratégia:** schema-only deploy + seed de dados mínimos.

```bash
# 1. Provisionar bancos vazios no Railway production
#    - gravity-cadastros-prod
#    - gravity-configurador-prod
#    - gravity-pedido-prod
#    (servicos-plataforma compartilha com configurador-prod)

# 2. Aplicar migrations Prisma em cada banco
DATABASE_URL=<URL prod cadastros>     npx prisma migrate deploy --schema servicos-global/cadastros/prisma/schema.prisma
DATABASE_URL=<URL prod configurador>  npx prisma migrate deploy --schema servicos-global/configurador/prisma/schema.prisma
DATABASE_URL=<URL prod pedido>        npx prisma migrate deploy --schema servicos-global/pedido/prisma/schema.prisma

# 3. Rodar seeds mínimos (apenas o essencial — enums, configs, master admin)
DATABASE_URL=<URL prod cadastros>     npx tsx scripts/seed/cadastros-seed-prod.ts
DATABASE_URL=<URL prod configurador>  npx tsx scripts/seed/configurador-seed-prod.ts

# 4. Validar
DATABASE_URL=<URL prod cadastros> npx prisma db pull --print | grep -c "model "
# Esperado: mesmo número de models que em servicos-global/cadastros/prisma/schema.prisma
```

**O que NÃO copiar:** dados de teste (DMM LTDA, CDE, Gravity orgs, pedidos fake).

### Cenário B — Sync recorrente de schema (deploys regulares)

**Quando:** dia-a-dia. A cada deploy de feature, novas migrations precisam rolar em produção.

**Estratégia:** migrations versionadas via Prisma + CI/CD.

```bash
# Pipeline CI/CD (GitHub Actions, etc.) — exemplo simplificado
on: push to main

steps:
  - composição dos schemas (compose-cadastros-schema, compose-plataforma-schema, etc.)
  - prisma migrate diff (gera migration se houver mudança)
  - tests passam → migrate deploy em STAGING
  - tests passam em staging → migrate deploy em PROD
```

**Princípio:** **a migration roda em teste primeiro, depois produção.** Nunca em produção primeiro.

**Verificação pós-deploy:**
```bash
# Em qualquer ambiente, listar migrations aplicadas
DATABASE_URL=<URL> psql -c "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at DESC LIMIT 10;"
```

Compara teste vs produção. Se faltar uma em produção, deploy não terminou.

### Cenário C — Clone produção → teste (debug forensico)

**Quando:** bug em produção que não conseguem reproduzir em teste. Precisa de uma cópia do estado atual de produção, com dados anonimizados.

**Estratégia:** dump → mascarar PII → restore em teste.

```bash
# 1. Dump produção (em janela de manutenção ou snapshot read-replica)
pg_dump $PROD_DATABASE_URL --no-owner --no-acl > /tmp/prod-snapshot.sql

# 2. Mascarar dados sensíveis ANTES de restaurar em teste
# Exemplo: anonimizar e-mails, CNPJs
sed -i 's/[a-zA-Z0-9._-]\+@[a-zA-Z0-9.-]\+/email-mascarado@teste.local/g' /tmp/prod-snapshot.sql
# (script real de masking é mais robusto — usar pg-anonymizer ou similar)

# 3. Restore em teste (limpa teste primeiro)
psql $TESTE_DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql $TESTE_DATABASE_URL < /tmp/prod-snapshot.sql

# 4. APAGAR o dump local após uso
shred -u /tmp/prod-snapshot.sql
```

**⚠️ Cuidados:**
- Janela de manutenção em prod (pg_dump pode ser pesado)
- Anonimização TEM que rodar — auditável
- Descartar o dump físico depois (`shred`, não `rm`)

---

## Setup recorrente recomendado para Gravity hoje

O ambiente de produção foi configurado em 2026-05-18 com os bancos e serviços listados abaixo:

### Passo 1 — Criar bancos production no Railway

Para cada um dos 3 bancos únicos do teste, criar um equivalente em produção:

| Teste | Produção |
|---|---|
| `gravity-cadastros-teste` | `gravity-cadastros-prod` |
| `gravity-configurador-teste` (compartilhado) | `gravity-configurador-prod` (compartilhado) |
| `gravity-pedido-teste` | `gravity-pedido-prod` |

No Railway: cada um é um novo serviço PostgreSQL.

### Passo 2 — Aplicar migrations idênticas

Não copiar dados. Aplicar as MESMAS migrations que rodaram em teste:

```bash
# Listar migrations aplicadas em teste (referência)
DATABASE_URL=$CADASTROS_TESTE_URL psql -c "SELECT migration_name FROM _prisma_migrations ORDER BY started_at;"

# Aplicar em produção (rodando do zero — mesmo histórico)
DATABASE_URL=$CADASTROS_PROD_URL npx prisma migrate deploy --schema servicos-global/cadastros/prisma/schema.prisma
```

Resultado: produção fica com **mesmo schema** que teste, **sem dados de teste**.

### Passo 3 — Seed de dados de produção

Diferente do seed de teste. Em produção:
- **NÃO seed:** organizações fake, pedidos fake, usuários teste
- **Sim seed:** enums (TipoOperacao, StatusPedido), configurações default (planos, faixas de preço), conta master admin Gravity

Crie um script novo: `scripts/seed/<banco>-seed-prod.ts` que insere apenas o estritamente necessário.

### Passo 4 — Validação automática (CI/CD)

Adiciona um job no pipeline:

```yaml
- name: Compare schema teste vs produção
  run: |
    DATABASE_URL=$TESTE_URL npx prisma db pull --print > /tmp/schema-teste.prisma
    DATABASE_URL=$PROD_URL npx prisma db pull --print > /tmp/schema-prod.prisma
    diff /tmp/schema-teste.prisma /tmp/schema-prod.prisma
    # Se há diff → falha o build (algo desincronizou)
```

### Passo 5 — Backup automático de produção

Independente do espelhamento, configurar:

- **Railway:** aba **Backups** → **Schedule** → diário às 3am UTC
- **Retenção:** 30 dias
- **Teste de restauração:** mensal (restaurar em ambiente isolado e validar)

Ver também: `skills/governanca/lei/backup-policy/SKILL.md` (RPO 24h, RTO 1h).

---

## ⚠️ O que NUNCA fazer

1. ❌ **`pg_dump $TESTE | psql $PROD`** — sobrescreve produção com dados de teste
2. ❌ **Editar tabela direto em produção** sem migration — gera drift que volta a morder
3. ❌ **Compartilhar credenciais de produção** em `.env.example`, slack, e-mail, etc.
4. ❌ **Restaurar backup sem janela de manutenção** — pode corromper estado em uso
5. ❌ **Copiar dados de produção para teste** sem mascarar PII — viola LGPD

## ✅ Checklist final pra "perfeitamente espelhado"

- [ ] Mesmas migrations aplicadas em ambos (`_prisma_migrations` idêntico)
- [ ] Schema Prisma compõe igual (`prisma db pull` produz o mesmo arquivo)
- [ ] Enums têm mesmos valores (mesmas labels, mesma ordem)
- [ ] Indexes têm mesmos nomes e colunas
- [ ] FKs apontam para mesmas tabelas
- [ ] Versão Prisma e PostgreSQL iguais entre os 2
- [ ] Backup automático ativo em produção
- [ ] CI/CD bloqueia deploy se schema diverge

Estrutura idêntica. Dados independentes. Backups regulares. **Isso é "perfeitamente espelhado".**

---

## Referências

- [`skills/governanca/lei/database-governance/SKILL.md`](../../skills/governanca/lei/database-governance/SKILL.md) — regras absolutas de banco
- [`skills/governanca/lei/backup-policy/SKILL.md`](../../skills/governanca/lei/backup-policy/SKILL.md) — RPO/RTO/política de backup
- [`skills/governanca/operacao/backup-disaster-recovery/SKILL.md`](../../skills/governanca/operacao/backup-disaster-recovery/SKILL.md) — runbook de DR
