---
name: antigravity-ambiente
description: "Use esta skill sempre que um agente precisar iniciar um servidor local, abrir o navegador ou verificar qual porta usar. Todo agente do projeto Gravity opera em uma porta dedicada e exclusiva, e o navegador deve ser sempre aberto na Área de Trabalho 1 do Windows. Esta skill é obrigatória para todos os agentes — consultar antes de qualquer comando npm run dev ou equivalente."
---

# Gravity — Ambiente de Trabalho dos Agentes

## Regra 1 — Navegador na Área de Trabalho 1

Todo agente que precisar abrir ou interagir com o navegador deve garantir que ele esteja rodando na **Área de Trabalho 1** do Windows (Virtual Desktop 1).

- Nunca abrir o navegador em outras áreas de trabalho
- Se o navegador já estiver aberto em outra área, mover para a Área de Trabalho 1 antes de interagir

---

## Regra 2 — Portas de Frontend (Dev Server / Vite)

### Claude Code (CLI / Desktop / Web)
Quando o agente é o **Claude Code**, os dev servers de frontend **SEMPRE** usam portas a partir de **5000**:

| Instância Claude | Porta Frontend |
|:---|:---|
| 1o agente Claude | `5000` |
| 2o agente Claude | `5001` |
| 3o agente Claude | `5002` |
| Agente N | `5000 + (N-1)` |

### Outros agentes (Líder/Coordenador/QA)
Agentes internos do projeto usam portas a partir de **8000**:

| Agente | Porta |
|:---|:---|
| Agente 1 | `8000` |
| Agente 2 | `8001` |
| Agente N | `8000 + (N-1)` |

**Regra geral:**
- Antes de iniciar o servidor, verificar se a porta já está em uso
- Nunca usar a porta de outro agente
- Sempre especificar a porta explicitamente no comando

```bash
# Verificar se porta está em uso antes de iniciar
netstat -an | findstr :5000

# Claude Code — iniciar frontend na porta 5000
npm run dev -- --port 5000

# Ou configurar direto no vite.config.ts: server.port = 5000
```

---

## Regra 3 — Portas de Backend (API Servers)

Os backends têm **portas fixas** definidas em `servicos-global/contracts.json`. **Não alterar** — apenas subir o backend na porta que já está configurada.

### Serviços Tenant — Super-Servidor Único

**Todos os 11 serviços de tenant rodam em UM único processo na porta 3001.** Não subir portas individuais para eles.

| Serviço | Porta |
|:---|:---|
| Super-servidor tenant (atividades, cronômetro, email, gabi, dashboard, relatórios, histórico, notificações, agendamento, preferências, whatsapp) | `3001` |

Para subir o super-servidor: `npm --prefix servicos-global/tenant run dev`

### Produtos e Serviços Independentes

| Serviço | Porta Backend |
|:---|:---|
| Configurador | `8005` |
| API Cockpit | `8016` |
| Conector ERP | `8017` |
| SimulaCusto | `8020` |
| Bid Frete | `8023` |
| Bid Câmbio | `8025` |
| Processo | `8026` |
| LPCO | `8027` |
| NF Importação | `8028` |
| Financeiro Comex | `8029` |
| Pedido | `8030` |
| Ver detalhes | `servicos-global/contracts.json` |

---

## Regra 4 — Ordem de Inicialização

Quando o produto tem backend + frontend:
1. **Primeiro** subir o backend (`server/`) — verificar se deps estão instaladas
2. **Depois** subir o frontend (`client/`) — configurar porta conforme Regra 2
3. Se for **somente frontend** (sem backend), subir direto

---

## Regra 5 — Como Identificar Sua Porta

O agente deve identificar sua porta com base no número do seu slot de execução. Para Claude Code, **sempre começar em 5000**. Para agentes internos, o prompt de distribuição do Líder deve conter:

```
Porta designada: XXXX
```

---

## Checklist — Antes de Iniciar o Servidor

- [ ] Identificou se o produto tem backend? Se sim, subir primeiro
- [ ] Verificou que as deps estão instaladas (`node_modules`)?
- [ ] Verificou que a porta está livre?
- [ ] Iniciou o servidor com a porta explicitamente declarada?
- [ ] Abriu o navegador na Área de Trabalho 1?
