---
name: antigravity-backup-disaster-recovery
description: "Use esta skill para estratégia de backup e recuperação de desastres. Define os 4 tipos de backup (diário, manual, semanal, teste mensal), RPO/RTO, procedimentos de restore e plano de contingência. Consultada pelo DevOps/SRE e Estrutura de Dados antes de qualquer operação destrutiva."
---

# Gravity — Backup & Disaster Recovery

## 4 Tipos de Backup

| Tipo | Frequência | Responsável | Retenção |
|:---|:---|:---|:---|
| Automático diário | Diário (Railway) | Automático | 7 dias |
| Manual pré-migration | Antes de migration destrutiva | Dev/SRE | Até validação |
| Semanal externo | Semanal | SRE (script) | 30 dias |
| Teste de restauração | Mensal | SRE | N/A |

---

## RPO e RTO

| Métrica | Meta | Significado |
|:---|:---|:---|
| **RPO** (Recovery Point Objective) | 24 horas | Perda máxima de dados aceitável |
| **RTO** (Recovery Time Objective) | 1 hora | Tempo máximo para restaurar serviço |

> Com backup diário, o RPO é 24h. Com backup semanal externo, temos redundância contra falha do Railway.

---

## Backup Automático (Railway)

- Railway faz backup automático diário dos bancos PostgreSQL
- Retenção de 7 dias
- Restore via Railway Dashboard (< 5 min)
- **Limitação:** se o Railway cair, backups ficam inacessíveis

---

## Backup Manual Pré-Migration

**OBRIGATÓRIO antes de:**
- Qualquer migration destrutiva (remover coluna, renomear, mudar tipo)
- Alteração de schema em produção
- Operações de limpeza de dados

```bash
# Backup manual via Railway CLI
railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Verificar tamanho do backup (sanity check)
ls -lh backup_*.sql

# Upload para storage externo
aws s3 cp backup_*.sql s3://gravity-backups/manual/
```

---

## Backup Semanal Externo

Redundância fora do Railway para proteção contra falha do provedor:

```bash
#!/bin/bash
# scripts/backup-semanal.sh — rodar via cron no domingo às 03:00

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="s3://gravity-backups/semanal"

# Backup de cada banco
for DB in configurador organização simula-custo bid-frete; do
  railway run pg_dump ${DB^^}_DATABASE_URL \
    | gzip > ${DB}_${TIMESTAMP}.sql.gz
  aws s3 cp ${DB}_${TIMESTAMP}.sql.gz ${BACKUP_DIR}/${DB}/
  rm ${DB}_${TIMESTAMP}.sql.gz
done

# Notificar sucesso
echo "Backup semanal concluído: ${TIMESTAMP}" | \
  curl -X POST -d @- $SLACK_WEBHOOK_URL
```

---

## Teste de Restauração (Mensal)

**Um backup só tem valor se funciona.** Todo mês:

1. Escolher um banco aleatório
2. Restaurar o último backup em ambiente de teste
3. Verificar integridade dos dados
4. Executar smoke tests contra o banco restaurado
5. Documentar resultado e tempo de restore

```bash
# Restaurar backup em banco de teste
createdb gravity_restore_test
pg_restore -d gravity_restore_test backup_file.sql

# Verificar contagem de registros
psql gravity_restore_test -c "SELECT count(*) FROM cotacoes;"
psql gravity_restore_test -c "SELECT count(*) FROM activities;"

# Limpar após teste
dropdb gravity_restore_test
```

---

## Plano de Disaster Recovery

### Cenário 1: Serviço caiu (mas banco ok)

1. Rollback para deploy anterior (Railway Dashboard, < 30s)
2. Verificar health check
3. Investigar causa

### Cenário 2: Banco corrompido

1. Parar serviço afetado
2. Restaurar último backup Railway (< 5 min)
3. Aplicar WAL logs se disponível
4. Validar dados
5. Reiniciar serviço

### Cenário 3: Railway fora do ar

1. Usar backup semanal externo (S3)
2. Subir em provedor alternativo (Render, Fly.io)
3. Atualizar DNS
4. Monitorar até Railway voltar
5. Re-sincronizar dados se necessário

### Cenário 4: Dados deletados por erro

1. Identificar timestamp da deleção
2. Restaurar backup anterior ao evento
3. Extrair registros deletados
4. Reinserir no banco de produção
5. Validar com o time

---

## Checklist — Backup & DR

- [ ] Backup automático Railway ativo?
- [ ] Backup manual feito antes de migration destrutiva?
- [ ] Backup semanal externo configurado?
- [ ] Teste de restauração realizado este mês?
- [ ] RPO/RTO documentados e comunicados ao time?
- [ ] Plano de DR revisado trimestralmente?
- [ ] Credenciais de storage externo atualizadas?
