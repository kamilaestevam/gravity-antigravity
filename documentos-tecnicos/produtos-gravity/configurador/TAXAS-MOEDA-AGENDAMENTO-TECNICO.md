# Admin › Taxas de Moeda — Agendamento PTAX / Focus

> **Escopo:** Configurador (Admin interno Gravity) · banco `gravity-configurador-producao`  
> **Task:** TASK-000266 · migration `20260615180000_add_taxa_moeda_sync_agendamento`

---

## Objetivo

Persistir a configuração dos crons de sincronização **PTAX** (→ tabela `cambio`) e **Focus** (→ tabela `previsao_taxa_futura_moeda`) em Postgres, substituindo o arquivo local `data/taxas-moeda-agendamento.json` (incompatível com multi-réplica no Railway).

---

## Banco de dados

| Item | Valor |
|:---|:---|
| **Serviço Railway** | `gravity-configurador-producao` |
| **Tabela** | `taxa_moeda_sync_agendamento` |
| **Model Prisma** | `TaxaMoedaSyncAgendamento` |
| **Registros fixos** | `id_taxa_moeda_sync_agendamento` = `'ptax'` \| `'focus'` |

### Colunas

| Coluna PostgreSQL | Tipo | Observação |
|:---|:---|:---|
| `id_taxa_moeda_sync_agendamento` | TEXT PK | `'ptax'` ou `'focus'` |
| `ativo_taxa_moeda_sync_agendamento` | BOOLEAN | default `false` |
| `frequencia_taxa_moeda_sync_agendamento` | TEXT | `Manual` \| `Diario` \| `Semanal` |
| `hora_taxa_moeda_sync_agendamento` | INTEGER | 0–23 (BRT) |
| `minuto_taxa_moeda_sync_agendamento` | INTEGER | 0–59 (BRT) |
| `alertas_taxa_moeda_sync_agendamento` | JSONB | array de alertas (mesmo shape do Admin › Testes) |
| `ultima_execucao_taxa_moeda_sync_agendamento` | TIMESTAMP(3) | nullable |
| `data_criacao_taxa_moeda_sync_agendamento` | TIMESTAMP(3) | `@default(now())` |
| `data_atualizacao_taxa_moeda_sync_agendamento` | TIMESTAMP(3) | `@updatedAt` |

**Índice:** `tmsa_ativo_idx` em `ativo_taxa_moeda_sync_agendamento`.

### Seed (migration)

| id | ativo | frequencia | hora | minuto |
|:---|:---|:---|:---|:---|
| `ptax` | true | Diario | 10 | 3 |
| `focus` | true | Semanal | 22 | 0 |

---

## API Admin

**Router:** `servicos-global/configurador/server/routes/admin-taxas-moeda-agendamento.ts`  
**Mount:** `/api/v1/admin/taxas-moeda/agendamento`  
**Auth:** `requireAuth` + `requireGravityAdmin` · PUT exige `tipo_usuario = SUPER_ADMIN`

| Método | Path | Descrição |
|:---|:---|:---|
| GET | `/:tipo` | Lê config (`tipo` = `ptax` \| `focus`) |
| PUT | `/:tipo` | Salva config |

### Payload PUT (body)

```json
{
  "ativo": true,
  "frequencia": "Diario",
  "hora": 22,
  "minuto": 0,
  "alertas": []
}
```

### Resposta GET/PUT (Zod: `taxaMoedaAgendamentoResponseSchema`)

Campos principais: `tipo`, `ativo`, `frequencia`, `hora`, `minuto`, `alertas`, `ultima_execucao`, `atualizado_em`.  
Para `tipo=ptax`, inclui `horarios_ptax_brt: [10, 11, 12, 13]` (slots BCB fixos).

**Regra PTAX:** backend força `hora=10`, `minuto=3` no save — workers disparam nos 4 slots 10h03–13h03 BRT em dias úteis.

---

## Workers

| Worker | Arquivo | Lê config | Executa sync | Persiste em |
|:---|:---|:---|:---|:---|
| PTAX | `server/queue/taxasMoedaSyncWorker.ts` | `ptax` | `executarSyncPtax` | `cambio` |
| Focus | `server/queue/previsao-taxa-futura-moeda-sync-worker.ts` | `focus` | `executarSyncFocus` | `previsao_taxa_futura_moeda` |

**Store:** `server/lib/taxas-moeda-agendamento-store.ts` (Prisma `taxaMoedaSyncAgendamento`).

Sync manual (`POST /api/v1/taxas-moeda/sync`, `POST /api/v1/previsao-taxa-futura-moeda/sync`) atualiza `ultima_execucao_taxa_moeda_sync_agendamento` quando há sucesso.

---

## Frontend

| Recurso | Caminho |
|:---|:---|
| Página | `src/pages/configurador/TaxasMoeda.tsx` |
| Modal | `src/pages/configurador/ModalTaxasMoedaAgendamento.tsx` |
| Schema FE | `src/shared/taxas-moeda-agendamento-schema.ts` |
| API client | `adminTaxasMoedaAgendamentoApi` em `src/services/api-client.ts` |

Botão **Agendamento** por aba (Cotação Atual / Cotação Futura), badge Ativo/Inativo, abas Configuração + Monitoramento (espelho Admin › Testes).

---

## Operação / migration

| Ação | Como |
|:---|:---|
| Migration Prisma | `configurador/prisma/migrations/20260615180000_add_taxa_moeda_sync_agendamento/` |
| Deploy CI produção | workflow `.github/workflows/migrate-configurador-producao.yml` + secret `PROD_CONFIGURADOR_DATABASE_URL` |
| Script local (TCP público) | `scripts/ativamente/migrate-configurador-railway-producao.ps1` |
| SQL manual (Railway Query) | `configurador/prisma/sql-manual/2026-06-15-taxa-moeda-sync-agendamento-producao.sql` |
| Migrar JSON legado → banco | `npm run migrar:taxa-moeda-agendamento-json` (Configurador) |

> ⚠️ **Bancos distintos:** `kodama:59138` = `gravity-configurador-teste` · `switchback:13516` = `gravity-configurador-producao`. Não confundir ao rodar migrate local.

---

## Auditoria

PUT dispara `AuditService.log` com ações `AGENDAR_SINCRONIZACAO_PTAX` / `AGENDAR_SINCRONIZACAO_FOCUS` e `estado_posterior_historico_log` = payload da resposta.
