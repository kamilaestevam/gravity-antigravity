# Infraestrutura e DevOps — Gravity Platform 🏗️

Manuais e guias de deploy, escalabilidade e observabilidade.

---

## 🚀 Fluxo de Deploy
O Gravity utiliza um pipeline de CI/CD automatizado com o GitHub Actions, filtrado por aprovação manual para o ambiente de produção.

1.  **Commit em `main`**: Dispara o build e testes automatizados.
2.  **Deploy Staging (T26)**: Aplica migrations e atualiza o ambiente de teste no Railway.
3.  **Gate de Paridade**: O GitHub Actions compara o schema de Staging com o de Produção.
4.  **Aprovação Manual**: Requer aprovação do Líder Técnico no GitHub.
5.  **Deploy Produção (P26)**: Finaliza o promote para o ambiente live.

---

## 📈 Escalabilidade (Target: 50.000 reqs)
Para atingir o SLA de performance (200ms) sob carga:

1.  **Connection Pooling**: Ativado via **PgBouncer** no Railway para evitar exaustão de conexões.
2.  **Horizontal Scaling**: Todos os microserviços são `stateless`, permitindo escalar réplicas no Railway conforme a carga (CPU/RAM).
3.  **Read Replicas**: Estrutura preparada para leitura em réplicas do PostgreSQL se necessário.

---

## 🛠️ Observabilidade
- **Sentry**: Captura de erros em tempo real.
- **Health Checks**: `/health` monitorado via UptimeRobot.
- **Railway Logs**: Monitoramento centralizado de processos.
