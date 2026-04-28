# Gravity — Blueprint de Criação de Novos Produtos

Este documento define o padrão técnico absoluto para a criação de qualquer novo produto (ex: SimulaCusto, NF-Importação) no ecossistema Gravity. Siga esta arquitetura para garantir conformidade com o monorepo e isolamento de dados.

## 1. Localização e Isolamento (Monorepo)

Todo produto deve residir em:
`servicos-global/organizacao/[nome-do-produto]/` (Era Nova — pós-Onda Gamma-3)

Cada produto é um serviço independente, com seu próprio **Frontend (Client)**, **Backend (Server)** e **Banco de Dados (Schema Prisma)**.

---

## 2. Frontend (Client): SPA Integrada à Shell

O frontend deve ser uma **Vite React SPA** que consome o `@gravity/shell`.

### Estrutura de Pastas (Client)
```text
client/
├── src/
│   ├── main.tsx           # Entry point (StrictMode + BrowserRouter)
│   ├── App.tsx            # Raiz (Layout do Shell + Routes)
│   ├── pages/             # Uma pasta por rota do produto
│   └── shared/
│       ├── config.ts      # PRODUCT_CONFIG (Registry de serviços e Navigation)
│       ├── api.ts         # Chamadas fetch com header 'x-tenant-id' e 'x-internal-key'
│       └── types.ts       # Interfaces do domínio do produto
├── vite.config.ts         # Aliases: @nucleo, @shell, @tenant, @produto
└── tsconfig.json          # Paths alinhados ao Vite
```

### O papel do `PRODUCT_CONFIG`
O arquivo `client/src/shared/config.ts` é a semente do produto. Ele define:
1. **`tenantServices`**: Serviços globais que o produto "aluga" (ex: notificações, Gabi, histórico).
2. **`navigation`**: O mapa de menus que o `MenuLateralGlobal` renderizará.
3. **`productId`**: ID canônico para verificação de permissões do tenant.

---

## 3. Backend (Server): Express + Prisma

O motor do produto deve seguir o padrão de microsserviço isolado.

### A Ordem Canônica dos 11 Middlewares
O `server/src/index.ts` deve seguir esta ordem rigorosa para garantir segurança e performance:

1. **Body Parser**: `express.json()`
2. **CORS**: Permitir origens do configurador e do próprio client.
3. **Static Assets**: Servir o build do client (SPA fallback).
4. **Health Check**: `/health` (Sem autenticação, para UptimeRobot/Railway).
5. **Master Data**: `/api/v1/master-data` (Dados públicos/estáticos, sem auth).
6. **Autenticação S2S**: `requireInternalKey` (Valida o segredo entre serviços).
7. **Isolamento de Tenant**: `tenantIsolationMiddleware` (Extrai `x-tenant-id` do header e isola o Prisma).
8. **Rotas do Produto**: `/api/v1/[recurso]` (Lógica de negócio).
9. **SPA Fallback**: `app.get('*')` (Redirecionar rotas não-API para o `index.html`).
10. **Error Handler**: Middleware global para capturar erros e responder com status 500.
11. **Listen**: Iniciar o servidor (ex: porta 8020).

---

## 4. Banco de Dados: Isolamento e Composição

Nenhum produto compartilha banco com outro. O schema Prisma é gerado por composição:

1. **`schema.base.prisma`**: Contém o provider (postgresql) e datasource (DATABASE_URL).
2. **`fragment.prisma`**: Contém os models específicos do produto.
3. **`compose-schema.js`**: Script de automação que gera o `schema.prisma` final concatenando os dois acima.

**Regra Absoluta:** Todo model persistente (exceto caches/logs públicos) DEVE possuir o campo `id_organizacao` e índices compostos por `id_organizacao` para garantir o RLS (Row Level Security).

---

## 5. Checklist de Deploy (Railway)

- [ ] Criar novo serviço no Railway: `[nome-do-produto]`.
- [ ] Criar novo banco PostgreSQL dedicado: `[nome-do-produto]-db`.
- [ ] Configurar variáveis de ambiente (`.env.example` é o template).
- [ ] Rodar `npm run db:migrate` via CI/CD.
- [ ] Adicionar health check em um monitor de Uptime.

---

Este blueprint é a única fonte de verdade para a Onda 4 do projeto Gravity.
