# Plano E2E — Conector ERP | Onda 3 | 12/13

## Agente: Conector ERP | Porta 8017
## Data: 2026-03-22

---

## 1. Escopo

Testes End-to-End para o serviço Conector ERP. O servidor roda em `http://localhost:8017`. O banco de dados é o `tenant-db` compartilhado com os outros serviços de tenant.

---

## 2. Pré-condições

- `TENANT_DATABASE_URL` configurada para banco de staging
- `ERP_ENCRYPTION_KEY` configurada com 64 chars hex
- Servidor do Conector ERP rodando (`npm run dev`)
- Banco SAP de staging disponível em `https://sap-staging.example.com`

---

## 3. Casos de Teste E2E

### 3.1 Health Check

| # | Ação | Esperado |
|---|------|----------|
| 1 | `GET /health` | `{ ok: true, service: "conector-erp", port: 8017 }` |
| 2 | DB offline → `GET /health` | HTTP 503 com `{ ok: false }` |

---

### 3.2 Gerenciamento de Conexões

| # | Ação | Esperado |
|---|------|----------|
| 3 | `POST /api/v1/erp/conexoes` com dados válidos | HTTP 201, `connection_status: "untested"` |
| 4 | `GET /api/v1/erp/conexoes?tenant_id=T1` | Lista apenas conexões de T1 |
| 5 | `GET /api/v1/erp/conexoes?tenant_id=T2` | Não retorna conexões de T1 (isolamento) |
| 6 | `PATCH /api/v1/erp/conexoes/:id` com `base_url` novo | URL atualizada, credencial mantida |
| 7 | `DELETE /api/v1/erp/conexoes/:id` de outro tenant | HTTP 404 |
| 8 | Response de GET **não contém** `credentials_encrypted` | Campo ausente no JSON |

---

### 3.3 Teste de Conexão ERP

| # | Ação | Esperado |
|---|------|----------|
| 9 | `POST /api/v1/erp/conexoes/testar` com SAP staging válido | `{ ok: true, latencyMs: <N> }` |
| 10 | Testar com credenciais inválidas | `{ ok: false }`, `connection_status: "failed"` no banco |
| 11 | Após sucesso: `circuit_failures = 0`, `circuit_breaker_open = false` | Estado resetado no banco |

---

### 3.4 Circuit Breaker

| # | Ação | Esperado |
|---|------|----------|
| 12 | 5 chamadas OData com falha consecutiva | `circuit_breaker_open: true` no banco |
| 13 | 6ª chamada com circuito aberto | HTTP 503, `code: "CIRCUIT_OPEN"` |
| 14 | Após 60s de cooldown: nova chamada bem-sucedida | Circuito fecha, `circuit_failures: 0` |

---

### 3.5 Retry com Backoff Exponencial

| # | Ação | Esperado |
|---|------|----------|
| 15 | Simular SAP retornando 500 temporariamente | Serviço retenta 3x (1s, 4s, 16s) antes de falhar |
| 16 | SAP retorna 500 na 1ª e 200 na 2ª | Sucesso na 2ª tentativa, sem erro para o cliente |

---

### 3.6 Sincronização OData

| # | Ação | Esperado |
|---|------|----------|
| 17 | `POST /api/v1/erp/sincronizar` com entidade válida | HTTP 202, `status: "running"` |
| 18 | `GET /api/v1/erp/sincronizacoes/:id` após conclusão | `status: "success"`, `rows_processed > 0` |
| 19 | Sincronizar com filtro `$filter=PostingDate ge '2025-01-01'` | Query aplicada na chamada SAP |
| 20 | Isolamento: tenant T1 não vê logs de T2 | Filtro `tenant_id` obrigatório |

---

### 3.7 Mapeamentos de Campo

| # | Ação | Esperado |
|---|------|----------|
| 21 | `POST /api/v1/erp/mapeamentos` com entidade + campos | HTTP 201 |
| 22 | `GET /api/v1/erp/mapeamentos?entidade=GoodsMovementSet` | Filtra por entidade |
| 23 | Criar mapeamento duplicado (mesmo tenant+conexao+entidade+campo_erp) | HTTP 5xx (unique constraint) |
| 24 | `DELETE /api/v1/erp/mapeamentos/:id` | HTTP 200 |

---

### 3.8 Alertas Inteligentes

| # | Ação | Esperado |
|---|------|----------|
| 25 | `POST /api/v1/erp/alertas` tipo `li_expiring` | HTTP 201, `severity: "warning"` |
| 26 | `GET /api/v1/erp/alertas?dismissed=false` | Apenas alertas ativos |
| 27 | `PATCH /api/v1/erp/alertas/:id/dismiss` | `dismissed: true`, `dismissed_at` preenchido |
| 28 | GET após dismiss com `?dismissed=true` | Alerta aparece na listagem |

---

### 3.9 Segurança — Tenant Isolation

| # | Ação | Esperado |
|---|------|----------|
| 29 | Tenant A tenta ler conexão do Tenant B via URL direta | HTTP 404 |
| 30 | Tenant A tenta dispensar alerta do Tenant B | HTTP 404 |
| 31 | Tenant A tenta ver logs de sincronização do Tenant B | Lista vazia |

---

### 3.10 Validação Zod

| # | Ação | Esperado |
|---|------|----------|
| 32 | POST conexão com `base_url: "nao-e-url"` | HTTP 400, `code: "VALIDATION_ERROR"` |
| 33 | POST conexão sem `password` | HTTP 400 |
| 34 | POST sincronizar sem `entity` | HTTP 400 |

---

### 3.11 Correlation ID

| # | Ação | Esperado |
|---|------|----------|
| 35 | Request com header `x-correlation-id: test-123` | Response de erro inclui `correlationId: "test-123"` |
| 36 | Request sem correlation ID | Response gera UUID próprio |

---

## 4. Critérios de Aceite

- Todos os 36 cenários passam em ambiente de staging
- Nenhum log expõe `credentials_encrypted` ou senha em plain text
- Circuit breaker abre após exatamente 5 falhas
- Retry usa backoff 1s→4s→16s (verificado via timestamps em logs)
- Tenant isolation: 100% de isolamento entre tenants diferentes

---

## 5. Ferramentas Recomendadas

- **Playwright** para cenários de browser (se integrado ao produto)
- **curl / Insomnia / Postman** para testes de API manuais
- **Vitest** para testes unitários automatizados (já entregues)
