# Plano de Observabilidade — Gravity

> Atualizado em: 2025-03  
> Responsável: Agente DevOps — Onda 4

---

## 1. Health Check Endpoints

Todos os serviços Express expõem `GET /health` que retorna:

```json
{ "status": "ok", "service": "<nome>", "timestamp": "2025-03-23T00:00:00.000Z" }
```

O Marketplace (Next.js) usa `GET /` como health check alternativo.

---

## 2. UptimeRobot — Monitoramento de Disponibilidade

Configure monitors do tipo **HTTP(S)** no painel do UptimeRobot.  
Intervalo recomendado: **5 minutos**.  
Substituia `<RAILWAY_DOMAIN>` pelo domínio gerado pelo Railway para cada serviço.

| Serviço        | Porta | URL de monitoramento (Railway)                          | Caminho       |
|----------------|-------|---------------------------------------------------------|---------------|
| configurador   | 8005  | `https://configurador.<RAILWAY_DOMAIN>/health`          | `/health`     |
| tenant-server  | 3001  | `https://tenant.<RAILWAY_DOMAIN>/health`                | `/health`     |
| api-cockpit    | 8016  | `https://api-cockpit.<RAILWAY_DOMAIN>/health`           | `/health`     |
| conector-erp   | 8017  | `https://conector-erp.<RAILWAY_DOMAIN>/health`          | `/health`     |
| simula-custo   | 8020  | `https://simula-custo.<RAILWAY_DOMAIN>/health`          | `/health`     |
| bid-frete      | 8023  | `https://bid-frete.<RAILWAY_DOMAIN>/health`             | `/health`     |
| bid-cambio     | 8025  | `https://bid-cambio.<RAILWAY_DOMAIN>/health`            | `/health`     |
| processo       | 8026  | `https://processo.<RAILWAY_DOMAIN>/health`              | `/health`     |
| lpco           | 8027  | `https://lpco.<RAILWAY_DOMAIN>/health`                  | `/health`     |
| nf-importacao  | 8028  | `https://nf-importacao.<RAILWAY_DOMAIN>/health`         | `/health`     |
| financeiro-comex | 8029 | `https://financeiro.<RAILWAY_DOMAIN>/health`           | `/health`     |
| pedido         | 8030  | `https://pedido.<RAILWAY_DOMAIN>/health`                | `/health`     |
| marketplace    | 8001  | `https://marketplace.<RAILWAY_DOMAIN>/`                 | `/`           |

> **Nota:** Os 11 serviços tenant (atividades, cronômetro, email, gabi, dashboard, relatórios, histórico, notificações, agendamento, preferências, whatsapp) rodam no **super-servidor** (porta 3001). Um único monitor no `/health` cobre todos — a resposta inclui lista de serviços ativos.

### Alertas UptimeRobot
- Criar **Alert Contact** por e-mail/Slack para o time.
- Configurar alerta ao **cair abaixo de 99% de uptime** mensal.
- Configurar alerta imediato na **primeira falha** (não esperar 3+ falhas).

---

## 3. Sentry — Monitoramento de Erros

### DSN por serviço

Substitua `<DSN_PLACEHOLDER_X>` pelo DSN real do projeto no Sentry:

| Serviço        | Variável de ambiente   | DSN (placeholder)                                          |
|----------------|------------------------|------------------------------------------------------------|
| configurador   | `SENTRY_DSN`           | `https://<key>@o<org>.ingest.sentry.io/<project_id>`       |
| dashboard      | `SENTRY_DSN`           | `https://<key>@o<org>.ingest.sentry.io/<project_id>`       |
| relatorios     | `SENTRY_DSN`           | `https://<key>@o<org>.ingest.sentry.io/<project_id>`       |
| cronometro     | `SENTRY_DSN`           | `https://<key>@o<org>.ingest.sentry.io/<project_id>`       |
| notificacoes   | `SENTRY_DSN`           | `https://<key>@o<org>.ingest.sentry.io/<project_id>`       |
| historico      | `SENTRY_DSN`           | `https://<key>@o<org>.ingest.sentry.io/<project_id>`       |
| gabi           | `SENTRY_DSN`           | `https://<key>@o<org>.ingest.sentry.io/<project_id>`       |
| api-cockpit    | `SENTRY_DSN`           | `https://<key>@o<org>.ingest.sentry.io/<project_id>`       |
| conector-erp   | `SENTRY_DSN`           | `https://<key>@o<org>.ingest.sentry.io/<project_id>`       |
| agendamento    | `SENTRY_DSN`           | `https://<key>@o<org>.ingest.sentry.io/<project_id>`       |
| whatsapp       | `SENTRY_DSN`           | `https://<key>@o<org>.ingest.sentry.io/<project_id>`       |
| simula-custo   | `SENTRY_DSN`           | `https://<key>@o<org>.ingest.sentry.io/<project_id>`       |
| marketplace    | `NEXT_PUBLIC_SENTRY_DSN` | `https://<key>@o<org>.ingest.sentry.io/<project_id>`     |

### Inicialização Sentry (padrão para serviços Express)

```typescript
// src/instrument.ts — importe ANTES de qualquer outro módulo
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    Sentry.httpIntegration(),
    Sentry.expressIntegration(),
  ],
});
```

```typescript
// src/index.ts — após criar o app Express
import './instrument';
// ...
app.use(Sentry.expressErrorHandler());
```

### Instalação

```bash
# Em cada workspace de serviço
npm install @sentry/node
# Para marketplace (Next.js)
npm install @sentry/nextjs
```

---

## 4. Logs Estruturados

Recomendado usar **pino** em todos os serviços Express:

```typescript
import pino from 'pino';
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: { service: 'nome-do-servico', env: process.env.NODE_ENV },
});
```

O Railway captura automaticamente `stdout`/`stderr` e exibe no dashboard de logs.

---

## 5. Variáveis de Ambiente para Observabilidade

Adicionar na seção de variáveis de cada serviço no Railway:

```
SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<project_id>
LOG_LEVEL=info
```

---

## 6. Checklist de Deploy

- [ ] Confirmar que `/health` retorna HTTP 200 em todos os serviços
- [ ] Configurar monitors no UptimeRobot com as URLs do Railway
- [ ] Adicionar DSNs reais do Sentry nas variáveis do Railway
- [ ] Configurar `SENTRY_AUTH_TOKEN` no GitHub Secrets para source maps
- [ ] Revisar alertas de threshold de erro no Sentry (>1% error rate)
- [ ] Criar dashboard no Sentry com métricas de todos os serviços
