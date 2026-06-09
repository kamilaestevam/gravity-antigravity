# Checklist — Secrets do Gravity Deploy

O workflow `.github/workflows/deploy.yml` (**Gravity Deploy**) falha no passo
`Validar secrets obrigatórios` quando os secrets abaixo não estão cadastrados no
**GitHub Environment** correto (não basta variável local ou Railway).

## Onde cadastrar

**GitHub → repositório `gravity-antigravity` → Settings → Environments**

| Environment  | Usado em |
|--------------|----------|
| `staging`    | Deploy Staging (T26000001) |
| `production` | Gate de paridade + Deploy Produção (P26000001) |

Em cada environment: **Environment secrets → Add secret**.

---

## Staging (obrigatórios)

| Secret | Origem |
|--------|--------|
| `STAGING_CONFIGURADOR_DATABASE_URL` | Railway → Postgres Configurador (teste/staging) → `DATABASE_URL` |
| `STAGING_ORGANIZACAO_DATABASE_URL` | Railway → Postgres Serviços/Tenant (teste/staging) |
| `RAILWAY_TOKEN_STAGING` | Railway → Account Settings → Tokens |
| `CLERK_SECRET_KEY` | Clerk → API Keys → Secret key do ambiente de **staging/dev** |

Opcional (pula migrations Pedido se ausente):

| Secret | Origem |
|--------|--------|
| `STAGING_PEDIDO_DATABASE_URL` | Railway → Postgres Pedido (teste/staging) |

---

## Produção (obrigatórios)

| Secret | Origem |
|--------|--------|
| `PROD_CONFIGURADOR_DATABASE_URL` | Railway → Postgres Configurador **produção** |
| `PROD_ORGANIZACAO_DATABASE_URL` | Railway → Postgres Serviços/Tenant **produção** |
| `RAILWAY_TOKEN_PRODUCTION` | Railway → token com acesso ao project **production** |
| `CLERK_SECRET_KEY` | Clerk → Secret key **produção** (`sk_live_...`) |

Opcional:

| Secret | Origem |
|--------|--------|
| `PROD_PEDIDO_DATABASE_URL` | Railway → Postgres Pedido produção |

---

## Disparar deploy após configurar secrets

1. **Merge** deste PR (ou qualquer push no `master`) — dispara Gravity Deploy automaticamente.
2. Ou: **Actions → Gravity Deploy → Run workflow** → escolher `staging` ou `production`.

O Railway continua fazendo build/deploy do `site-usegravity` pelo hook de git; este workflow
aplica **migrations** e **health check** antes de promover produção.

---

## Verificação rápida

```bash
gh api repos/dmmltda/gravity-antigravity/environments/staging/secrets --jq '.secrets[].name'
gh api repos/dmmltda/gravity-antigravity/environments/production/secrets --jq '.secrets[].name'
```

Lista vazia = deploy vai falhar no validador de secrets.
