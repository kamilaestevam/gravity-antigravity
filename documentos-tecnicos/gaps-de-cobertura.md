# Gaps de Cobertura — Testes Playwright

| Data | Produto | Fluxo sem cobertura | Registrado por |
|:-----|:--------|:--------------------|:---------------|
| 2026-04-06 | pedido | Configurações > Colunas > Casas Decimais — sem cobertura E2E | teste-em-tela |
| 2026-04-07 | pedido | Edição inline condicional por tipo_operacao (exportador_nome / importador_nome) — sem spec Playwright | teste-em-tela |
| 2026-04-07 | pedido | Edição em massa — filtro every/visivel por tipo_operacao no modal — sem spec Playwright | teste-em-tela |
| 2026-04-07 | pedido | Edição em massa — merge detalhes_operacionais no serviço (exportador/importador/fabricante) — sem spec Playwright | teste-em-tela |
| 2026-04-07 | pedido | Duplicar Itens — botão "Duplicar" toolbar (3 testes em duplicar-itens.spec.ts untracked com falha pré-existente) | teste-em-tela |
| 2026-04-07 | pedido | Edição em massa híbrida — fast path (updateMany) + slow path ($transaction 60s) + aviso de performance — sem spec Playwright | teste-em-tela |
| 2026-04-09 | pedido | smart-import — upload PDF, fluxo completo 4 etapas (upload→mapeamento→preview→confirmação) — sem spec Playwright | teste-em-tela |
| 2026-04-09 | pedido | Cobertura Cambial — edição inline na linha PAI sem spec dedicado; só filho coberto | teste-em-tela |
| 2026-04-09 | pedido | `.gtv-linha--pai` não visível em 6 testes @critico (edicao-inline-item + adicionar-item) — RESOLVIDO após fix frontend | teste-em-tela |
| 2026-04-09 | pedido | Cobertura Cambial linha filho → verificação de persistência no banco após edição inline — sem spec E2E dedicado | teste-em-tela |
| 2026-04-09 | pedido | Cobertura Cambial linha PAI → consenso (todos iguais→valor / divergem→▲) — sem spec Playwright | teste-em-tela |
| 2026-04-09 | pedido | Cobertura Cambial ModalEdicaoEmMassa → `nivel: 'item'` após migração do campo — sem spec Playwright | teste-em-tela |
| 2026-04-09 | pedido | smart-import fixture ausente: `testes/fixtures/pedido/test_import_campos.csv` e `invoice-test.pdf` — testes bloqueados por ENOENT pré-existente | teste-em-tela |
| 2026-04-09 | pedido | configuracoes-regras.spec.ts — 8 testes com falha pré-existente (Configuracoes.tsx modificado fora desta sessão, seções toggles Duplicar/Excluir quebradas) | teste-em-tela |
| 2026-04-09 | pedido | gabi-insights.spec.ts — botões dp-gabi-nav-btn ausentes na tela (falha pré-existente, não relacionada ao modal transferir) | teste-em-tela |
| 2026-04-09 | pedido | kanban-config-modal.spec.ts — testes 04/05 (restaurar padrão, contador X/N) com falha pré-existente | teste-em-tela |
| 2026-04-09 | pedido | kanban.spec.ts — 3 abas configuráveis / aba Lembrete com falha pré-existente | teste-em-tela |
