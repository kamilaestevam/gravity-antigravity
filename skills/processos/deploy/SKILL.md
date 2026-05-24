---
name: antigravity-deploy
description: "Use esta skill sempre que uma tarefa envolver deploy, migrations, variáveis de ambiente, configuração de infraestrutura no Railway, CI/CD ou rollback. Todo agente consulta esta skill antes de qualquer operação que afete ambientes de staging ou produção."
---

# Gravity — Deploy

## Regra Fundamental

Nenhuma operação de deploy é feita sem seguir este documento. Nenhuma migration destrutiva sem backup e plano de rollback documentado. Nenhum deploy em produção sem passar por staging primeiro.

---

## Topologia de Serviços no Railway

**Railway Project: Gravity Platform**

### Ambientes no Railway

| Ambiente | Serviços | Bancos |
|:---|:---|:---|
| **production** | site-usegravity, gravity-cadastros-prod, gravity-configurador-prod, gravity-servicos-prod, gravity-pedido-producao | 5 PostgreSQL volumes |
| **teste** | gravity-cadastros-teste, gravity-configurador-teste, gravity-servicos-teste, gravity-pedido-teste | 4 PostgreSQL volumes |

### Serviço Principal (Frontend + Backend unificado)

| Serviço | Porta | Domínio | Build |
|:---|:---|:---|:---|
| `site-usegravity` | 8080 | `www.usegravity.com.br` | Dockerfile (Vite build + tsx loader) |

> O `site-usegravity` serve o frontend Vite (SPA) e o backend Express do Configurador em um único container. O build usa `scripts/build-site.sh` (Custom Build Command) ou o `Dockerfile` na raiz.

### Bancos de Dados

| Banco | Serviço Railway | Schema Prisma |
|:---|:---|:---|
| Configurador | `gravity-configurador-prod` | `configurador/prisma/schema.prisma` |
| Serviços Plataforma | `gravity-servicos-prod` | `servicos-global/servicos-plataforma/prisma/schema.prisma` |
| Cadastros | `gravity-cadastros-prod` | `servicos-global/cadastros/prisma/schema.prisma` |
| Pedido | `gravity-pedido-producao` | produto-específico |

> **Regra:** cada produto/serviço tem seu próprio banco no Railway. Nenhum produto compartilha banco com outro.

---

## Domínio e DNS

### Domínio Público

**Domínio principal:** `www.usegravity.com.br`
**Domínio raiz:** `usegravity.com.br` (redireciona para www)

### Provedor DNS: Cloudflare (Free)

O DNS do domínio `usegravity.com.br` é gerenciado pelo **Cloudflare** (não mais pelo Registro.br diretamente). O Registro.br aponta os nameservers para o Cloudflare.

**Nameservers no Registro.br:**
- `andy.ns.cloudflare.com`
- `jen.ns.cloudflare.com`

**Registros DNS no Cloudflare:**

| Tipo | Nome | Valor | Proxy |
|:---|:---|:---|:---|
| CNAME | `@` | `1n4xz192.up.railway.app` | DNS only |
| CNAME | `www` | `45cutyak.up.railway.app` | DNS only |
| TXT | `_railway-verify` | `railway-verify=fd2f856a...` | — |
| TXT | `_railway-verify.www` | `railway-verify=a0559586...` | — |
| CNAME | `accounts` | `accounts.clerk.services` | DNS only |
| CNAME | `clerk` | `frontend-api.clerk.services` | DNS only |
| CNAME | `clkmail` | `mail.qop3hdfnkx4f.clerk.services` | DNS only |
| CNAME | `clk._domainkey` | `dkim1.qop3hdfnkx4f.clerk.services` | DNS only |
| CNAME | `clk2._domainkey` | `dkim2.qop3hdfnkx4f.clerk.services` | DNS only |

**Configuração SSL/TLS no Cloudflare:** `Full` (não Full Strict, não Flexible). Railway já possui SSL próprio.

> **Por que Cloudflare:** O Registro.br não suporta CNAME no domínio raiz (`@`). O Cloudflare suporta via CNAME flattening, permitindo que tanto `usegravity.com.br` quanto `www.usegravity.com.br` apontem para o Railway com SSL.

### Subdomínios do Clerk (Produção)

O Clerk Production usa subdomínios próprios sob `usegravity.com.br`:
- `accounts.usegravity.com.br` — tela de login/signup
- `clerk.usegravity.com.br` — Frontend API do Clerk

> **Importante:** o Clerk tem duas instâncias separadas — **Development** (funciona apenas em localhost) e **Production** (funciona com o domínio `usegravity.com.br`). As chaves (`CLERK_SECRET_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`) são diferentes entre ambientes.

---

## Ambientes

| Ambiente | Uso | Banco |
|:---|:---|:---|
| **staging** | Testes antes de produção, QA, validação | Banco separado com dados de teste |
| **production** | Clientes reais | Banco de produção |

**Fluxo obrigatório:**
```
feature branch → PR → merge na main → deploy automático em staging
→ testes E2E rodam → aprovação manual → promote para production
```

Serviços compartilhados (configurador, organizacao-services) têm staging próprio. Produtos apontam para o staging dos serviços compartilhados no ambiente de staging.

---

## Variáveis de Ambiente

Padrão de naming: `SERVICO_PROVIDER_TIPO`

```bash
# === configurador ===
DATABASE_URL=postgresql://...configurador-db...
CLERK_SECRET_KEY=sk_live_...        # APENAS para autenticação (Mandamento 01)

# === organizacao-services ===
ORGANIZACAO_DATABASE_URL=postgresql://...organizacao-db...
CLERK_SECRET_KEY=sk_live_...        # APENAS para autenticação (Mandamento 01)
RESEND_API_KEY=re_...
META_WHATSAPP_TOKEN=...
OPENAI_API_KEY=sk-...

# === simulador-comex (primeiro produto) ===
DATABASE_URL=postgresql://...simulador-comex-db...
CLERK_SECRET_KEY=sk_live_...        # APENAS para autenticação (Mandamento 01)
ORGANIZACAO_SERVICES_URL=http://organizacao-services.railway.internal:3001
CONFIGURATOR_URL=http://configurador.railway.internal:3000
CHAVE_INTERNA_SERVICO=...

# === nf-importacao (próximo produto) ===
DATABASE_URL=postgresql://...nf-importacao-db...
CLERK_SECRET_KEY=sk_live_...        # APENAS para autenticação (Mandamento 01)
ORGANIZACAO_SERVICES_URL=http://organizacao-services.railway.internal:3001
CONFIGURATOR_URL=http://configurador.railway.internal:3000
CHAVE_INTERNA_SERVICO=...
```

**Regras:**
- Toda variável de ambiente está documentada no `.env.example` do serviço
- Nenhuma variável hardcoded no código — pre-commit hook `scripts/ativamente/check-secrets.ts` bloqueia (detecta DB URLs com senha, API keys Stripe/Clerk/Resend, hex keys longas)
- `CHAVE_INTERNA_SERVICO` rotacionada trimestralmente
- Variáveis de staging e produção são sempre diferentes
- `ENCRYPTION_KEY` (AES-256-GCM) documentada em `servicos-global/servicos-plataforma/api-cockpit/.env.example` — gerar com `openssl rand -hex 32`

---

## Ordem de Deploy entre Serviços

A ordem importa. Serviços dependentes só sobem após os serviços que dependem estarem saudáveis.

1. **configurador** — sem dependências
2. **organizacao-services** — depende do configurador para auth
3. **produtos** — dependem do configurador + organizacao-services
4. **marketplace** — sem dependências, pode subir a qualquer momento

Verificar health check antes de subir o próximo:
```bash
curl https://[servico].railway.app/health
# esperado: { "status": "ok", "service": "nome-do-servico" }
```

---

## Provisionamento de Ambiente Limpo (Bootstrap Obrigatório)

> **Banco vazio = 401. Esse é o comportamento correto e intencional.**

O `requireAuth` do Configurador exige que o usuário exista na tabela `usuario` do banco. Sem esse registro, qualquer requisição autenticada retorna `401 Unauthorized` — mesmo que o usuário esteja válido no Clerk. Não há bypasses. Não há exceções.

### Por que isso ocorre

A autenticação da Gravity opera em duas camadas independentes (Mandamento 01):

- **Clerk** — prova de identidade APENAS (quem você é). Login, senha, e-mail, `clerk_user_id`. PROIBIDO usar para autorização.
- **Banco `Usuario` (Prisma)** — prova de autorização (você tem acesso a este sistema). `tipo_usuario`, `gravity_admin` etc. lidos via `GET /api/v1/me`.

Um usuário pode existir no Clerk e não ter acesso à plataforma. Esse é o modelo correto: usuários só entram no sistema após provisionamento explícito no Prisma.

### Quando executar o bootstrap

Obrigatório toda vez que um banco do Configurador for criado ou zerado:

- Criação de novo ambiente (staging, produção, dev local)
- Após `DROP SCHEMA public CASCADE` ou restore de backup zerado
- Após qualquer operação que apague as tabelas `Organizacao` e `Usuario`

### Procedimento obrigatório

```bash
# 1. Aplicar migrations DDD (cria as tabelas em branco)
cd configurador
npx prisma migrate deploy

# 2. Seed de infraestrutura: cria a org Gravity + Root Admin
cd servicos-global/configurador
npx tsx server/scripts/bootstrap-seed.ts

# 3. Seed de catálogo: popula produtos disponíveis no Hub
npx tsx server/scripts/seedProducts.ts
```

O `bootstrap-seed.ts` cria:
- A organizacao matriz (`slug: gravity`, `status: ACTIVE`)
- O usuário Root Admin (`dmmltda@gmail.com`, `tipo_usuario: SUPER_ADMIN`, `gravity_admin: true`)
- Um `clerk_user_id` placeholder — o `requireAuth` auto-vincula ao ID real do Clerk no primeiro login, via fallback de email (1 candidato único = link seguro)

O script é **idempotente**: pode ser executado múltiplas vezes sem duplicar dados.

> **ATENÇÃO — formato do `id_usuario`:** O Prisma gera IDs em formato **CUID** (ex: `codlrdaha85z7ymwknqi1zq6`). O hook `useCarregarTipoUsuario` no frontend valida com `z.string().cuid()`. Se o `id_usuario` for UUID (ex: `f7e2b963-3ae6-...`), o Zod rejeita e o `tipo_usuario` fica `null` — resultando em badge "STANDARD" em vez do tipo real. **Nunca use `gen_random_uuid()` para inserir registros manualmente** — use CUIDs gerados pelo Prisma ou via o script `bootstrap-seed.ts`.

### Bootstrap via SQL (alternativa para Railway Console)

Se o `bootstrap-seed.ts` não puder ser executado (ex: Railway não tem CLI configurada), o bootstrap pode ser feito via SQL direto no Railway Database Console. **Atenção:** usar CUIDs, não UUIDs.

```sql
-- 1. Criar organização Gravity
INSERT INTO organizacao (id_organizacao, nome_organizacao, subdominio_organizacao, status_organizacao, hospeda_colaboradores_gravity, created_at, updated_at)
VALUES ('cuid_gerado_aqui', 'Gravity', 'gravity.usegravity.com.br', 'ATIVA', true, NOW(), NOW());

-- 2. Criar usuário SUPER_ADMIN (id_clerk_usuario placeholder — será auto-vinculado no primeiro login)
INSERT INTO usuario (id_usuario, nome_usuario, email_usuario, tipo_usuario, gravity_admin, status_usuario, id_organizacao, id_clerk_usuario, created_at, updated_at)
VALUES ('cuid_gerado_aqui', 'Daniel', 'dmmltda@gmail.com', 'SUPER_ADMIN', true, 'ATIVO', '<id_organizacao_acima>', 'bootstrap_placeholder', NOW(), NOW());
```

> **Fluxo pós-bootstrap:** No primeiro login, o `requireAuth` middleware não encontra o `bootstrap_placeholder` como `id_clerk_usuario`, então faz fallback por email. Encontra 1 candidato → auto-vincula com o `user_*` real do Clerk.

### Comportamento esperado antes do bootstrap

| Ação | Resultado esperado |
|:-----|:-------------------|
| Login no Clerk | Funciona (Clerk não depende do banco Gravity) |
| `GET /api/v1/me` | `401 Unauthorized` — correto |
| `GET /api/v1/hub/init` | `401 Unauthorized` — correto |
| Qualquer rota protegida | `401 Unauthorized` — correto |

Esse comportamento **não é um bug**. É a garantia de que nenhum usuário acessa o sistema sem provisionamento explícito.

---

## Protocolo de Migrations

### Antes de qualquer migration
1. **Backup manual obrigatório** — mesmo que Railway faça backup automático
2. Verificar se há conexões ativas no banco
3. Comunicar o time antes de migrations destrutivas

### Migrations não destrutivas (adicionar coluna, nova tabela)

```bash
# 1. Compor schema (se organizacao-services)
npx ts-node scripts/compose-product-schema.ts

# 2. Validar schema
npx prisma validate

# 3. Gerar migration
npx prisma migrate dev --name descricao-clara-da-migration

# 4. Revisar o arquivo de migration gerado antes de aplicar em produção
# 5. Aplicar em staging
npx prisma migrate deploy

# 6. Validar em staging — só então aplicar em produção
```

### Migrations destrutivas (remover coluna, renomear, mudar tipo)

Nunca em um único passo. Sempre em duas fases:

**Fase A — retrocompatível (deploy sem quebrar nada):**
- Adicionar coluna/tabela nova
- Deploy do código que usa a nova estrutura
- Validar em staging e produção

**Fase B — limpeza (só após validação completa):**
- Remover coluna/tabela antiga
- Deploy final

> **Regra:** se a Fase A falhar → rollback do deploy e restore do backup. Fase B só começa após Fase A validada em produção.

---

## Backup

Automático: Railway faz backup diário com retenção de 7 dias.

**Manual obrigatório antes de:**
- Qualquer migration destrutiva
- Qualquer alteração de schema em produção
- Qualquer operação de limpeza de dados

**Backup semanal:** exportado para storage externo (redundância fora do Railway).  
**Teste de restauração:** mensal — um backup só tem valor se funciona.

```bash
# Backup manual via Railway CLI
railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## Rollback

Railway suporta rollback instantâneo para o deploy anterior.

**Procedimento:**
1. Detectar falha (Sentry alert ou health check down)
2. Railway Dashboard → Service → Deployments → Rollback
3. Serviço reverte para a imagem anterior em < 30s
4. Verificar health check após rollback
5. Reportar o incidente com causa e solução

**Para migrations destrutivas que falharam:**
1. Rollback do deploy (Railway Dashboard)
2. Restore do backup manual feito antes da migration
3. Validar que o serviço voltou ao estado anterior
4. Investigar a causa antes de tentar novamente

---

## Private Networking no Railway

Comunicação entre serviços usa rede interna do Railway — nunca internet pública.

```bash
# Endereços internos (usar nas variáveis de ambiente)
configurador.railway.internal:3000
organizacao-services.railway.internal:3001
simulador-comex.railway.internal:3002
```

> **Regra:** tráfego público só no marketplace. Todos os outros serviços acessíveis apenas via rede interna ou API Gateway autenticado.

---

## CI/CD com GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:functional

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: railwayapp/railway-github-action@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: ${{ env.SERVICE_NAME }}
          environment: staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production  # requer aprovação manual
    steps:
      - uses: actions/checkout@v4
      - uses: railwayapp/railway-github-action@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: ${{ env.SERVICE_NAME }}
          environment: production
```

---

## Monitoramento

| Ferramenta | O que monitora |
|:---|:---|
| **Sentry** | Erros de aplicação (backend e frontend), stack traces, contexto do organizacao |
| **UptimeRobot** | Health check de cada serviço a cada 5 minutos |
| **Railway Metrics** | CPU, memória, conexões de banco |

> **Regra P0:** se um serviço cair, o responsável é notificado em menos de 5 minutos.

**Health check obrigatório em todo servidor:**

```typescript
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', service: 'nome-do-servico' })
  } catch (e) {
    res.status(503).json({ status: 'down' })
  }
})
```

---

## Protocolo de Emergência

Se um serviço em produção estiver fora do ar:

1. Verificar UptimeRobot — qual serviço caiu?
2. Verificar Sentry — qual erro gerou a queda?
3. Railway Dashboard → verificar logs do serviço
4. Se causa identificada e fix < 15min → corrigir e fazer novo deploy
5. Se causa não identificada → rollback imediato para deploy anterior
6. Comunicar o time com status e ETA de resolução

---

## Auto-Scaling Rules
### Railway — Configuração por serviço

| Serviço | Min | Max | CPU trigger | RAM trigger |
|:---|:---|:---|:---|:---|
| configurador | 1 | 3 | 70% | 80% |
| organizacao-services | 1 | 5 | 70% | 80% |
| produtos | 1 | 3 | 70% | 80% |
| marketplace | 0 | 2 | 60% | 70% |

### Alertas de Custo

| Threshold | Ação |
|:---|:---|
| 70% do budget | Alerta informativo (email) |
| 80% do budget | Alerta de atenção (Slack) |
| 90% do budget | Alerta crítico (Slack + Daniel) |
| 95% do budget | Scaling horizontal BLOQUEADO |

### Scale-to-Zero

Apenas **marketplace** pode ir a zero instâncias. Serviços com banco ativo **nunca** vão a zero.

> Para detalhes completos, ver skill `antigravity-auto-scaling`.

---

## Fluxo Staging → Production com Aprovação Manual
```
feature branch → PR → CI (lint + test:unit + test:functional + test:contracts)
  → merge main → deploy automático em staging
  → testes E2E rodam em staging
  → aprovação manual (environment: production no GitHub)
  → promote para production
  → monitorar por 30 min
```

**Regras de aprovação:**
- QA valida em staging
- Líder Técnico aprova o deploy
- Nenhum deploy em sexta-feira após 16h (exceto P0)

---

## Backup Antes de Migration Destrutiva
**OBRIGATÓRIO** — antes de qualquer migration que remove ou altera colunas:

```bash
# 1. Backup manual
railway run pg_dump $DATABASE_URL > backup_pre_migration_$(date +%Y%m%d).sql

# 2. Upload para storage externo
aws s3 cp backup_pre_migration_*.sql s3://gravity-backups/pre-migration/

# 3. Verificar tamanho (sanity check)
ls -lh backup_pre_migration_*.sql
```

Sem backup confirmado → migration **NÃO** pode ser executada.

> Para estratégia completa de backup, ver skill `antigravity-backup-disaster-recovery`.

---

## Checklist de Deploy

### Antes de qualquer deploy em produção
- [ ] Todos os testes passam em staging?
- [ ] Health check de todos os serviços dependentes está ok?
- [ ] Variáveis de ambiente de produção estão configuradas?
- [ ] Migration (se houver) foi testada em staging?
- [ ] Backup manual feito (se migration destrutiva)?
- [ ] Plano de rollback documentado?
- [ ] Auto-scaling configurado para o serviço?
- [ ] Alertas de custo ativos?
- [ ] Aprovação manual do Líder Técnico obtida?
- [ ] **Se banco novo/zerado:** bootstrap-seed executado e validado? (`GET /api/v1/me` retorna 200?)

### Após deploy em produção
- [ ] Health check do serviço deployado está ok?
- [ ] Sentry não reportou novos erros críticos?
- [ ] UptimeRobot confirma serviço ativo?
- [ ] Fluxo principal do serviço validado manualmente?
- [ ] Latência p95 dentro do budget (≤ 200ms)?
