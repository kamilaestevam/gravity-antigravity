# Notificações — Documentação Técnica

## Visão Geral

O serviço de Notificações é um **serviço tenant** que gerencia alertas, avisos e lembretes para cada usuário dentro de um workspace. Ele opera com **degradação graciosa** — quando o backend não está disponível, o frontend funciona normalmente com dados mock locais, sem spam de erros no console.

---

## Arquitetura

```
┌─────────────────────────────────┐
│  Frontend (Notificacoes.tsx)    │
│  servicos-global/tenant/        │
│  notificacoes/src/              │
├─────────────────────────────────┤
│  1. Tenta SSE (stream)          │
│  2. Fallback: polling 60s       │
│  3. Fallback: mocks locais      │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Backend (routes/api.ts)        │
│  servicos-global/tenant/        │
│  notificacoes/server/           │
├─────────────────────────────────┤
│  Montado no Configurador:       │
│  /api/tenant/notificacoes       │
│                                 │
│  Auth: x-tenant-id + x-user-id │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Prisma — tabela notification   │
│  (tenant_id, user_id, type,     │
│   title, message, read)         │
└─────────────────────────────────┘
```

---

## Endpoints

| Método | Rota | Descrição | Headers |
|--------|------|-----------|---------|
| `GET` | `/api/tenant/notificacoes` | Lista notificações do usuário | `x-tenant-id`, `x-user-id` |
| `GET` | `/api/tenant/notificacoes/stream` | SSE (Server-Sent Events) para real-time | `userId` (query param) |
| `PUT` | `/api/tenant/notificacoes/:id/read` | Marcar uma como lida | `x-tenant-id`, `x-user-id` |
| `PUT` | `/api/tenant/notificacoes/read-all` | Marcar todas como lidas | `x-tenant-id`, `x-user-id` |
| `POST` | `/api/tenant/notificacoes` | Criar aviso/lembrete | `x-tenant-id`, `x-user-id` |

---

## Estratégia de Degradação Graciosa

O componente **nunca quebra a tela** mesmo quando o backend está indisponível:

1. **Primeira chamada** (`syncState`): tenta `GET /api/tenant/notificacoes`
   - Se `res.ok` → marca `backendDisponivel = true`, ativa polling e SSE
   - Se erro ou `!res.ok` → marca `backendDisponivel = false`, para polling, usa mocks

2. **SSE** (`EventSource`): tenta conectar ao stream
   - Se falha → fecha silenciosamente, sem warning repetido

3. **Polling**: roda a cada 60s
   - Só executa `syncState()` se `backendDisponivel !== false`
   - Não enche o console com erros repetidos

4. **Writes** (mark read, create aviso):
   - Atualização otimista local (UI atualiza imediatamente)
   - Se `backendDisponivel === false`, não tenta chamar a API

---

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `servicos-global/tenant/notificacoes/src/Notificacoes.tsx` | Componente React (frontend) |
| `servicos-global/tenant/notificacoes/server/routes/api.ts` | Rotas Express (backend) |
| `servicos-global/tenant/notificacoes/server/index.ts` | Server standalone (porta 3001) |
| `servicos-global/configurador/server/index.ts` | Onde a rota é montada no configurador |

---

## Montagem no Configurador

A rota é montada em `server/index.ts` do configurador:

```typescript
import { apiRoutes as notificacoesRouter } from '../../tenant/notificacoes/server/routes/api.js'
app.use('/api/tenant/notificacoes', notificacoesRouter)
```

---

## Mock Data (Dev)

Enquanto a tabela `notification` não existe no banco (Prisma não migrado), o componente opera com **30 notificações mock** geradas localmente. Os mocks incluem:

- Variações de tipo: `sistema`, `aviso`
- Estados de leitura: 8 não-lidas, 22 lidas
- Notificações atrasadas: 3 com `_isAtrasado = true`
- Textos longos para testar truncamento CSS (`line-clamp`)

---

## Pendências

- [ ] Rodar `prisma migrate` para criar tabela `notification`
- [ ] Remover mocks locais após migração
- [ ] Adicionar POST handler no backend (`routes/api.ts`)
- [ ] Integrar com Sentry para monitorar taxa de falhas
- [ ] Configurar TTL de notificações (auto-delete após 90 dias)
