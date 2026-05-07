# Runbook — Aplicar 26 Migrations Pendentes do Pedido (Onda 7 + 8)

**Status:** 🟡 Aguardando execução
**Aprovado por:** Coordenador (parecer em conversa de 2026-05-07)
**Data alvo:** _[a definir pelo executor]_
**Executor:** humano com acesso ao banco — não pode ser agente automatizado

---

## Contexto resumido

26 migrations Prisma estão versionadas em `produto/pedido/prisma/migrations/` mas **não foram aplicadas** no banco do Pedido. Resultado:

- Banco com schema da onda anterior (até `~20260424...`).
- Prisma Client (quando gerado contra o schema novo) referencia tabelas/colunas que ainda existem no banco com nome legado.
- Hoje encoberto pelo bug arquitetural do SDK (ADR-0003 em proposta) — `db.<modelo>` é `undefined` antes de tocar banco. Após o ADR-0003, esses erros aparecem como `PrismaClientKnownRequestError`.

**Por isso este runbook precisa rodar ANTES do ADR-0003 ser executado.**

---

## Análise das migrations

### Tipo de operações

Auditoria executada em 2026-05-07:

| Operação | Count |
|---|---|
| `ALTER TABLE ... RENAME COLUMN` | ~324+ |
| `DROP TABLE` | **0** |
| `DROP COLUMN` | **0** |
| `RENAME TABLE` | 0 |

**Conclusão da auditoria:** todas as migrations são renames. Risco de perda de dados é zero — `RENAME COLUMN` preserva valores. Comentário das próprias migrations confirma: *"Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill)."*

### Lista das 26 migrations pendentes

```
20260425000000_pedido_item_ddd_correto
20260425010000_pedido_fks_ddd_correto
20260425020000_pedido_datas_ddd_correto
20260425030000_sub_onda_7d_parciais_leves
20260425040000_sub_onda_7e_pedido_template
20260425050000_sub_onda_7g1_kanban_preferencias
20260425060000_sub_onda_7g2_pedido_preferencia_padrao
20260425070000_sub_onda_7g3_pedido_config_atualizacao
20260425080000_sub_onda_7h1_dashboard_painel
20260425090000_sub_onda_7h2_dashboard_preferencias
20260425100000_sub_onda_7i1_pedido_status
20260425110000_sub_onda_7i2_pedido_status_timestamps
20260425120000_sub_onda_7j1_pedido_coluna
20260425130000_sub_onda_7j2_pedido_coluna_resto
20260425140000_sub_onda_7k1_pedido_casas_decimais
20260425150000_sub_onda_7k2_pedido_casas_decimais_resto
20260425160000_sub_onda_7l1_tracking_items_transferidos
20260425170000_sub_onda_7l2_tracking_items_transferidos_resto
20260425180000_sub_onda_7m1_pedido_snapshot_ope
20260425190000_sub_onda_7m2_pedido_snapshot_ope_resto
20260425200000_sub_onda_7n1_coluna_usuario_pedido
20260425210000_sub_onda_7n2_coluna_usuario_pedido_resto
20260425220000_sub_onda_7p_aprendizado_importacao_dados
20260425230000_sub_onda_7q_pedido_snapshot_empresa
20260425240000_sub_onda_7r_pedido_config_atualizacao_cadastros
20260425250000_sub_onda_8_processo_grupo_completo
```

A última (`sub_onda_8`) é a maior (20KB, 161 col renames cobrindo 4 tabelas: `Processo`, `ProcessoFatura`, `ProcessoItem`, `ProcessoContainer`). As demais são incrementais por sub-onda (1-3KB cada).

---

## Pré-requisitos

Antes de iniciar:

- [ ] Acesso de leitura+escrita ao banco do Pedido (`PEDIDO_DATABASE_URL`)
- [ ] `pg_dump` instalado e funcional na máquina executora
- [ ] Espaço em disco suficiente para o dump (≥ 2× tamanho atual do banco)
- [ ] Servidor do Pedido **parado** durante a janela (evita locks concorrentes)
- [ ] Aviso enviado a usuários/equipe sobre downtime esperado
- [ ] **Janela de manutenção alinhada com Coordenador** se for prod

---

## Passo a passo

### 1. Backup completo do banco

```bash
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backup/pedido-pre-onda-7-8-$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

pg_dump "$PEDIDO_DATABASE_URL" \
  --format=custom \
  --no-owner --no-privileges \
  --file="$BACKUP_DIR/pedido-completo.dump"

# Validar tamanho do dump (não pode ser 0 bytes)
ls -lh "$BACKUP_DIR/pedido-completo.dump"
```

**Critério de sucesso:** arquivo `.dump` com tamanho > 0 bytes (esperado: MB-GB dependendo do volume).

**Se falhar:** abortar tudo. Não prosseguir sem backup confirmado.

---

### 2. Capturar estado pré-migration (referência futura)

```bash
cd /caminho/para/gravity-antigravity/servicos-global/produto/pedido

# Salvar status atual das migrations
npx prisma migrate status --schema=prisma/schema.prisma > "$BACKUP_DIR/migrate-status-pre.txt" 2>&1

# Salvar estrutura atual do schema (DDL)
pg_dump "$PEDIDO_DATABASE_URL" --schema-only > "$BACKUP_DIR/schema-pre.sql"
```

---

### 3. Aplicar migrations no schema `public` (template)

```bash
cd /caminho/para/gravity-antigravity/servicos-global/produto/pedido

# IMPORTANTE: usa migrate deploy (idempotente, prod-safe), NÃO migrate dev
npx prisma migrate deploy --schema=prisma/schema.prisma 2>&1 | tee "$BACKUP_DIR/migrate-deploy.log"
```

**Critério de sucesso:** log termina com `All migrations have been successfully applied.`

**Se falhar a meio caminho:**
1. Não rodar `migrate deploy` de novo cegamente.
2. Inspecionar `migrate-deploy.log` para identificar qual migration falhou.
3. Decidir entre:
   - (a) **Restaurar do backup** (Passo 7) e re-tentar tudo.
   - (b) **Corrigir migration falhada** e rodar `prisma migrate resolve --applied <nome>` se aplicável.
4. Não prosseguir para Passo 4 enquanto não tiver `migrate status` limpo.

---

### 4. Regenerar Prisma Client

```bash
cd /caminho/para/gravity-antigravity/servicos-global/produto/pedido
npx prisma generate
```

**Importante:** isso atualiza o `node_modules/.prisma/client` da **raiz do monorepo** (problema documentado no ADR-0003). Após o ADR-0003 ser executado, cada produto terá seu próprio path de generate; por enquanto, a raiz fica com o client do Pedido (último a rodar `generate` ganha).

---

### 5. Re-provisionar schemas tenant (`tenant_<id_organizacao>`)

> **Pré-requisito conceitual:** o banco do Pedido usa schema-per-org. Aplicar migration no `public` é só template; cada org real vive em `tenant_<id>` separado.

```bash
cd /caminho/para/gravity-antigravity

# Script existente — replica DDL do public para todos os schemas tenant_*
npx tsx scripts/ativamente/migrate-tenants/02-backfill.ts pedido 2>&1 | tee "$BACKUP_DIR/migrate-tenants.log"
```

**Critério de sucesso:** log termina sem erros e indica N tenants sincronizados.

**Se faltarem schemas tenant** (ex: ambiente dev sem orgs reais), o script deve apenas dizer "0 tenants" e sair limpo. Em prod, esperado N > 0.

---

### 6. Smoke test funcional

Subir o servidor do Pedido em modo dev e validar:

```bash
cd /caminho/para/gravity-antigravity/servicos-global/produto/pedido
npm run dev   # tsx watch server/src/index.ts
```

**Checklist:**

- [ ] Servidor sobe sem erro de Prisma (`PrismaClientInitializationError`)
- [ ] Frontend Pedido carrega sem 500 nos endpoints abaixo:
  - [ ] `GET /api/v1/pedidos?ordenar=desc&limit=100` → 200
  - [ ] `GET /api/v1/pedidos/configuracoes/saldo-formula` → 200
  - [ ] `GET /api/v1/pedidos/configuracoes/casas-decimais` → 200
  - [ ] `GET /api/v1/pedidos/colunas-usuario` → 200
  - [ ] `GET /api/v1/pedidos/config/status` → 200
- [ ] Tela "Lista" abre e renderiza tabela (mesmo que vazia)
- [ ] Tela "Configurações" abre sem erro
- [ ] Tela "Dashboard" abre sem erro

**Se algum 500 persistir:** provavelmente é o bug do ADR-0003 (SDK Prisma client errado), não falha de migration. Documentar e prosseguir para o ADR-0003.

---

### 7. Plano de rollback (se necessário)

**Quando rolar back:**
- Smoke test do Passo 6 falha de modo NOVO (não relacionado ao bug do SDK)
- Aparece erro de coluna inexistente em queries que antes funcionavam
- Reportes de usuários (em prod) sobre comportamento estranho

**Como rolar back:**

```bash
# 1. Parar o servidor do Pedido
# 2. Restaurar dump do Passo 1
pg_restore \
  --clean --if-exists --no-owner --no-privileges \
  --dbname="$PEDIDO_DATABASE_URL" \
  "$BACKUP_DIR/pedido-completo.dump"

# 3. Resetar migration history do Prisma (se necessário)
# CUIDADO: só rodar se restore não recriou _prisma_migrations table
# npx prisma migrate resolve --rolled-back <ultimo_id_aplicado>

# 4. Re-gerar client contra schema antigo
git stash   # ou checkout do schema antigo
npx prisma generate
```

**Após rollback:** abrir incidente, identificar root cause, e re-planejar antes de tentar de novo.

---

## Decisões pendentes para o executor

Antes de rodar este runbook, definir:

1. **Ambiente de execução:** dev local ou prod direto?
   - **Recomendação:** dev local primeiro (validar Passo 6), depois prod com janela combinada.
2. **Janela de manutenção em prod:** quando? Quem comunica?
3. **Backup destino:** disco local ou S3? Retenção?
4. **Quem executa:** Coordenador? DevOps? Líder Técnico?

---

## Próximos passos pós-runbook

Após F3 concluída com sucesso:

- ✅ Banco do Pedido íntegro com schema atualizado.
- ⏭️ **F4 (ADR-0003) pode ser executada** — refator do SDK em estado conhecido.
- ⏭️ Após F4, smoke test final dos 7 produtos consumidores do SDK.

---

## Referências

- ADR-0003 — `documentos-tecnicos/decisoes-arquiteturais/0003-sdk-resolver-organizacao-prisma-instance-injetado.md`
- Mandamento 02 — `skills/governanca/lei/9-mandamentos/SKILL.md` (schema intocável)
- Script de re-provisionar tenants — `scripts/ativamente/migrate-tenants/02-backfill.ts`
- Migrations versionadas — `servicos-global/produto/pedido/prisma/migrations/`
