# Configurador — Hub: Notificações e E-mail (PR #447)

> Skill: [`configurador`](../../../skills/produtos-gravity/configurador/SKILL.md) · Hub layout: [`FLUXO-POS-LOGIN.md`](./FLUXO-POS-LOGIN.md)

---

## Visão geral

O sininho do `/hub` (`SelecionarWorkspace`) e da rota legada `Hub.tsx` usa o componente **`Notificacoes`**, não mais `AvisoInternoGlobal` com mocks locais.

O composer (`AvisoInternoGlobal` em `@nucleo/mensageria-global`) suporta canal **e-mail** com assunto, destinatário externo, link anexo e scroll no modal.

| Camada | SSOT |
|--------|------|
| Componente UI | `@gravity/shell` → `Notificacoes` (não importar `notificacoes/src` nas páginas) |
| Contratos front | `notificacoes/src/notificacoes-api.schema.ts` (Zod) |
| API | `POST /api/v1/notificacoes/enviar` via proxy cfg-back |
| Fila | pg-boss v12 (`send-notification`) — instância compartilhada com `historico-global` |
| Entrega | worker S2S → org `POST /api/v1/envios-email` → Resend |

---

## Fluxo de e-mail

```
[Hub UI] POST /api/v1/notificacoes/enviar  (JWT via proxy cfg-back)
    → boss.send (antes do registro "enviado")
    → Prisma (status pending se e-mail)
    → worker → org /api/v1/envios-email → Resend
```

| Variável | Uso |
|----------|-----|
| `CHAVE_INTERNA_SERVICO` | S2S worker → org |
| `RESEND_API_KEY` | org → Resend |
| `VITE_NOTIFICACOES_MOCKS` | `true` em dev para mocks opcionais no sininho |

**Resend dev:** com `no-reply@resend.dev`, entrega só para e-mail da conta Resend até verificar domínio.

**Mocks em dev:** desligados por padrão; ativar com `VITE_NOTIFICACOES_MOCKS=true` no `.env` do configurador.

**Contratos front:** schemas Zod em `notificacoes/src/notificacoes-api.schema.ts` (Mandamento 06+09).

---

## Hub — KPIs de operações

`GET /api/v1/hub/operacoes` agrega processos e pendências cross-produto (Processo, Pedido, BID Frete, etc.).

- Serviço: `configurador/server/services/hub-operacoes-service.ts`
- Schema: `hubOperacoesResumoSchema` — validado em `hub-init.ts` antes de responder

---

**Última revisão:** 2026-06-25
