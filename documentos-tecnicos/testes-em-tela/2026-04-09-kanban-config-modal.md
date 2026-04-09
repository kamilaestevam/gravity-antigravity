# Resultado — Teste em Tela
**Data:** 2026-04-09 16:30
**Produto:** produto/pedido
**Ajuste relacionado:** Implementação Kanban customizado (sessão anterior)
**Pasta de prints:** testes/testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/

---

## FLUXO CORRIGIDO — Configurações Kanban ↔ Modal

| Teste | Resultado | Tempo | Observação |
|:------|:----------|:------|:-----------|
| 01 remover campo da aba Pedido → campo some do modal | ✅ | 22.8s | Campo "Nº Pedido" removido; modal exibiu apenas campos restantes |
| 02 adicionar campo disponível → campo aparece no modal | ✅ | 20.4s | 14 campos disponíveis; campo readicionado com sucesso |
| 03 ocultar campo com eye → campo some do modal | ✅ | 19.4s | Toggle de visibilidade refletido no modal |
| 04 restaurar padrão → modal exibe campos originais | ✅ | 20.8s | 4 abas do modal confirmadas após restauração |
| 05 contador X/N campos atualiza ao remover e ao adicionar | ✅ | 14.1s | "8/10 campos" → "7/10 campos" após remover |
| 06 modal exibe 4 abas: Pedido, Quantidades, Datas, Lembrete | ✅ | 14.6s | Abas: ['Pedido', 'Quantidades', 'Datas', 'Lembrete'] |

**Total: 6/6 passaram (1m 54s)**

---

## PRINTS CAPTURADOS

| # | Arquivo | Etapa |
|:--|:--------|:------|
| 01 | [01a-config-antes-remover.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/01a-config-antes-remover.png) | Configurações antes de remover campo |
| 02 | [01b-config-apos-remover.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/01b-config-apos-remover.png) | Configurações após remover campo |
| 03 | [01c-modal-apos-remover.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/01c-modal-apos-remover.png) | Modal após remoção — campo ausente |
| 04 | [01d-modal-aba-pedido.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/01d-modal-aba-pedido.png) | Aba Pedido no modal após remoção |
| 05 | [02a-campo-removido.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/02a-campo-removido.png) | Campo removido para liberar disponíveis |
| 06 | [02b-campo-adicionado.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/02b-campo-adicionado.png) | Campo readicionado à aba |
| 07 | [02c-modal-com-campo-adicionado.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/02c-modal-com-campo-adicionado.png) | Modal com campo adicionado |
| 08 | [03a-antes-ocultar.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/03a-antes-ocultar.png) | Antes de ocultar campo |
| 09 | [03b-apos-ocultar.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/03b-apos-ocultar.png) | Após ocultar campo com eye |
| 10 | [03c-modal-campo-oculto.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/03c-modal-campo-oculto.png) | Modal com campo oculto |
| 11 | [04a-apos-restaurar.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/04a-apos-restaurar.png) | Configurações após restaurar padrão |
| 12 | [04c-modal-padrao-restaurado.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/04c-modal-padrao-restaurado.png) | Modal com padrão restaurado |
| 13 | [05a-contador-inicial.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/05a-contador-inicial.png) | Contador inicial: 8/10 campos |
| 14 | [05b-contador-apos-remover.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/05b-contador-apos-remover.png) | Contador após remover: 7/10 campos |
| 15 | [06a-kanban-antes-clicar.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/06a-kanban-antes-clicar.png) | Kanban com cards visíveis |
| 16 | [06b-modal-aberto.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/06b-modal-aberto.png) | Modal aberto ao clicar no card |
| 17 | [06c-modal-abas.png](../../testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal/06c-modal-abas.png) | 4 abas do modal: Pedido, Quantidades, Datas, Lembrete |

---

## GAPS DE COBERTURA

Nenhum.

---

## FALHAS ENCONTRADAS

Nenhuma — todos os 6 testes passaram.

---

## NOTAS TÉCNICAS

- **Schema fix:** `pedidos_origem_id` precisava de `@map("pedidos_origem")` no schema.prisma (coluna real no DB é `pedidos_origem`)
- **DB fix:** Coluna `cnpj_importador` faltava no DB — adicionada via ALTER TABLE
- **Seed:** Pedidos de teste criados para `tenant-dev-gravity-2026` via INSERT raw SQL (seed.ts estava com campos renomeados desatualizados)

---

## DECISÃO

[x] ✅ TUDO PASSOU — implementação do Kanban customizado do Pedido validada em tela
