# Plano E2E — Agendamento NCM Admin

**ID:** TST-E2E-AGENDAMENTO-NCM-ADMIN-000098  
**Status:** aguardando aprovação do dono (execução em staging)  
**Rota:** `/admin/ncm-integracao`  
**Tela:** Admin › Integração NCM Siscomex › modal Agendamento NCM  
**Pré-condições:** staging, storageState **SUPER_ADMIN**, Cadastros migrado (`ncm_sync_agendamento`)

## Escopo

Fluxo UI: configurar agendamento Diário 02h, persistir, sincronizar manualmente.  
Contrato **403 ADMIN** coberto por **FUN F3** (supertest — requer JWT ADMIN separado no browser).

## Matriz de cenários

| # | Cenário |
|---|---------|
| E1 | Página carrega status e histórico |
| E2 | Abrir modal Agendamento — aba Configuração |
| E3 | Ativado + Diário + 02h → Salvar → toast sucesso |
| E4 | Reabrir modal — cron `00 02 * * *`, sem Alterações pendentes |
| E5 | Sincronizar Agora — toast sucesso |
| — | PUT ADMIN 403 → **FUN F3** (paridade API) |

## Categorias E2E (checklist QA)

| Categoria | Cobertura |
|-----------|-----------|
| 1 CRUD | E3–E4 (update + read persistido) |
| 2 Filtros/Busca | N/A — sem filtros na tela |
| 3 Selects/Dropdowns | E3 (Ativado, Diário, 02h, 00min) |
| 4 Import/Export | N/A — exportação da tabela fora do escopo deste plano |
| 5 Navegação/Layout | E1 (rota direta `/admin/ncm-integracao`) |
| 6 Modais/Formulários | E2–E4 (abrir, editar, salvar, tabs) |
| 7 Estados de Interface | E3 toast sucesso; E5 sync |
| 8 Operações em Massa | N/A |
| 9 Visualizações | N/A — só lista de histórico |
| 10 Percy | E1, E2, E3, E5 |
| 11 Produto (NCM) | E5 sync Siscomex; agendamento global singleton |

## Categorias não aplicáveis

- **Filtros/Busca** — histórico paginado sem filtros de usuário neste escopo.
- **Import/Export** — export da tabela não valida agendamento.
- **Massa / Kanban** — inexistente na tela.
