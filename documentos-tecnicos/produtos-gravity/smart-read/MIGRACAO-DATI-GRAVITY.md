# Migração DATI → Gravity Smart Docs — Checklist operacional

> **Público:** deploy, suporte e QA antes de migrar usuários do DATI Importação para o Smart Docs no Gravity.  
> **Código:** `servicos-global/produto/smart-read/` · BFF **8033** · Legado `external-readings`

---

## 1. Três dependências (todas obrigatórias em produção)

| # | Componente | O que validar | Sintoma se falhar |
|---|------------|---------------|-------------------|
| 1 | **Legado DATI** (`SMART_READ_LEGADO_URL` + `SMART_READ_LEGADO_CHAVE_GRAVITY`) | Upload + OCR em segundos no DATI direto | Análise lenta ou eterna no Gravity |
| 2 | **BFF Gravity** (sidecar `:8033`, `/health` ok) | `GET http://127.0.0.1:8033/health` ou proxy `/dev-health/smart-read` | «Enviando arquivo...» + barras 99% (animação fake) |
| 3 | **Postgres Gravity** (`SMART_READ_DATABASE_URL` + migrations) | `prisma migrate deploy` no serviço `gravity-smart-read-*` | Lista vazia, progresso não salva; heal-on-read cobre wizard |

**Não confundir:** lentidão do motor OCR (legado) com falha de infra Gravity (BFF/DB). A UI antiga mostrava 99% mesmo com BFF down — o passo 2 agora exibe erro na sidebar quando o polling falha.

---

## 2. Paridade org → company (item 10 do code review)

Antes do go-live por organização:

1. Confirmar entrada em `SMART_READ_DE_PARA_ORGANIZACAO` ou `SMART_READ_ID_COMPANY_LEGADO_PADRAO` para cada tenant migrado.
2. No DATI legado, anotar o `x-company-id` usado na UI antiga.
3. No Gravity, `resolverCompanyLegado(id_organizacao)` deve resolver o **mesmo** company id.
4. Smoke: mesma `invoice_ficticia.pdf` — tempo de conclusão comparável (±30%) entre DATI direto e Gravity passo 2.

---

## 3. Checklist pré-migração (por ambiente)

### Staging / produção

- [ ] `SMART_READ_LEGADO_URL` e `SMART_READ_LEGADO_CHAVE_GRAVITY` configurados (mesmo par do DATI QA/prod)
- [ ] `SMART_READ_DATABASE_URL` aponta para `gravity-smart-read-*` (não Configurador)
- [ ] Migrations aplicadas (`scripts/start-site.sh` ou `npm run prisma:migrate:deploy` no produto)
- [ ] Sidecar `:8033` healthy no boot do site (`_sidecarStatus['smart-read'].ok`)
- [ ] Prisma Client gerado no deploy (`start-site.sh` já executa)
- [ ] Smoke E2E passo 1→2: Enviar → «Análise completa» em &lt; 75s

### Dev local (preview `:8000`)

- [ ] Configurador API `:8005` **ou** `cd servicos-global/produto/smart-read && npm run dev` (sidecar `:8033`)
- [ ] `GET /dev-health/smart-read` retorna 200 (Vite proxy)
- [ ] Sem `SMART_READ_DATABASE_URL`: wizard ok com mock legado; lista/progresso degradados (esperado)

---

## 4. Fluxo heal-on-read (resiliência)

1. `POST /leituras` cria leitura no DATI e tenta `registrarVinculo` no Postgres.
2. Se Postgres falhar → POST ainda retorna **202** (leitura existe no legado); log `[smart-read][vinculo]`.
3. `GET /leituras/:id` consulta legado primeiro; se existir, executa **heal-on-read** do vínculo.
4. Polling do passo 2 conclui com `COMPLETED` mesmo após falha transitória de Postgres.

---

## 5. Limitações conhecidas (não são bugs desta entrega)

| Item | Impacto na migração |
|------|---------------------|
| **1 arquivo = 1 leitura legado** | Vários PDFs no mesmo wizard criam leituras separadas no DATI |
| **PDF/binário só no legado** | Gravity não replica storage; snapshot guarda JSON normalizado |
| **Status Lista** | Pill ainda usa `status_leitura` legado; `status_fluxo_*` em wiring pendente (LISTA §14) |

---

## 6. Documentos relacionados

| Doc | Conteúdo |
|-----|----------|
| [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) | Onde vive cada dado; §5.1 regras de banco |
| [NOVA-LEITURA-PASSO-DOIS-TECNICO.md](./NOVA-LEITURA-PASSO-DOIS-TECNICO.md) | Polling, SLA 75s, checklist EMT |
| [README.md](./README.md) | Índice do produto |
