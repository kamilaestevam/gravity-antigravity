---
name: antigravity-backup-policy
description: "Use esta skill sempre que for executar migration destrutiva, alterar schema em produção, fazer operação de limpeza de dados ou tomar qualquer decisão que afete integridade de dados. Define os 4 tipos de backup obrigatórios, RPO de 24h, RTO de 1h e as regras absolutas 'backup manual obrigatório antes de migration destrutiva' e 'teste de restauração mensal obrigatório'."
---

# Gravity — Backup Policy (Lei)

> **Lei absoluta.** Implementação (scripts pg_dump, S3, Railway CLI, restore procedures, plano de DR) está em [Backup & DR](../../operacao/backup-disaster-recovery/SKILL.md). Esta skill define apenas as **regras**.

## RPO e RTO

| Métrica | Meta | Significado |
|:---|:---|:---|
| **RPO** (Recovery Point Objective) | **24 horas** | Perda máxima de dados aceitável |
| **RTO** (Recovery Time Objective) | **1 hora** | Tempo máximo para restaurar serviço |

---

## 4 Tipos de Backup Obrigatórios

| Tipo | Frequência | Responsável | Retenção |
|:---|:---|:---|:---|
| Automático diário (Railway) | Diário | Automático | 7 dias |
| **Manual pré-migration** | **Antes de migration destrutiva** | Dev/SRE | Até validação |
| Semanal externo (S3) | Semanal | SRE (script) | 30 dias |
| **Teste de restauração** | **Mensal** | SRE | N/A |

---

## Regras Absolutas

### 1. Backup manual OBRIGATÓRIO antes de:

- Qualquer migration destrutiva (remover coluna, renomear, mudar tipo)
- Alteração de schema em produção
- Operações de limpeza de dados

> Migration destrutiva sem backup pré → **trabalho rejeitado pelo QA, sem exceção.**

### 2. Teste de restauração mensal OBRIGATÓRIO

Um backup só tem valor se funciona. Todo mês:

- Escolher um banco aleatório
- Restaurar o último backup em ambiente de teste
- Verificar integridade dos dados (contagem de registros, smoke tests)
- Documentar resultado e tempo de restore

> Sem teste mensal → cobertura de backup é considerada inválida.

### 3. Redundância externa (Railway pode cair)

Backup semanal externo (S3) é a contingência contra falha do provedor.
**Não opcional.** Sem backup externo, RPO de 24h não está garantido.

---

## Onde Está a Implementação

- **Scripts de backup (pg_dump), restore, S3 upload, cron** → [Backup & DR](../../operacao/backup-disaster-recovery/SKILL.md)
- **Plano de Disaster Recovery (4 cenários: serviço caiu, banco corrompido, Railway fora, dados deletados por erro)** → [Backup & DR](../../operacao/backup-disaster-recovery/SKILL.md)
- **Comandos detalhados de restore por cenário** → [Backup & DR](../../operacao/backup-disaster-recovery/SKILL.md)
