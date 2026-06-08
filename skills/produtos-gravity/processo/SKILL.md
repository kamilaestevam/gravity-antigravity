---
name: antigravity-processo
description: "Use esta skill em qualquer tarefa do produto Processo (COMEX) — Workflow, DadosTecnicos, Pedidos (lista/resumo), Containers, Taxas, Financeiro, Email, To Do, Configurações, criação de novas telas. Define o PADRÃO UX OFICIAL das telas (layout, sidebar TOC, cards de campo, edit-in-place, paleta, comportamento)."
---

# Gravity — Processo (COMEX)

## O Que é o Processo

Produto que gerencia o ciclo de vida completo de um processo de comércio exterior
(importação ou exportação), do briefing até a entrega. Centraliza pedidos vinculados,
documentos (LI/DI/DUIMP/Retificação), follow-up, financeiro, containers e dados técnicos.

**Características-chave:**
- Multi-tenant por `id_organizacao` (Mand. 04)
- DDD-puro em todas as camadas (banco/back/front) — sem ACL legado
- **Sub-rotas com layout próprio** (`ProcessoLayout` com sidebar contextual + breadcrumb)
- Integra-se a produtos vizinhos (Pedido, Cadastros, BID-Frete) via REST

---

## Localização na Arquitetura

```text
servicos-global/produto/processo/
├── prisma/
│   ├── fragment.prisma
│   └── schema.prisma          ← gerado por compose-processo-schema.ts
├── client/src/
│   ├── components/
│   │   ├── ProcessoVisualizacaoLayout.tsx  ← pills Lista | Kanban (workspace)
│   │   ├── ProcessoMultiView.tsx           ← keep-alive
│   │   └── processo-visualizacao-context.tsx
│   ├── pages/
│   │   ├── ProcessoLayout.tsx            ← detalhe de um processo (sidebar)
│   │   ├── ProcessoLista.tsx, todos/TodosProcessosKanban.tsx
│   │   ├── dados-tecnicos/DadosTecnicos.tsx   ⭐ REFERÊNCIA DO PADRÃO UX
│   │   └── workflow/, email/, financeiro/, …
│   └── shared/
│       ├── processo-prefetch.ts
│       └── api.ts, types.ts, config.ts
└── server/src/...
```

**Seletor workspace (2 abas):** [seletor-universal-visualizacoes.md](../../../documentos-tecnicos/arquitetura/seletor-universal-visualizacoes.md) · `TST-E2E-MBOTO-000059`.

---

## ⭐ PADRÃO UX OBRIGATÓRIO

Toda tela do Processo segue o padrão estabelecido em **2026-05-31** durante o redesign
do DadosTecnicos. A documentação completa está em:

**[documentos-tecnicos/produtos-gravity/processo/PADRAO-UX-TELAS.md](../../../documentos-tecnicos/produtos-gravity/processo/PADRAO-UX-TELAS.md)**

Resumo dos pontos não-negociáveis:

### 1. Layout
- `PaginaGlobal layout="lista"` + `CabecalhoGlobal` no topo
- Grid `240px 1fr` (sidebar | main) — colapsada: `56px 1fr`
- Sidebar agrupa TOC + stats num bloco sticky (`top: 1rem`)
- **CRÍTICO**: `align-items: stretch` no grid + `align-self: start` na sidebar — sem isso `position: sticky` quebra

### 2. TOC
- **Default colapsada** (só ícones), toggle com `SidebarSimple`
- Pill `X/Y` por seção (verde 100% / roxo `#a78bfa` parcial)
- Scroll-spy via `IntersectionObserver` destaca seção visível
- Click no item: `expandirSecao` + **double-rAF** + `scrollIntoView` (single rAF não espera React)

### 3. Seções
- Cards com header (ícone 32×32 + título h2 + progress bar 80×4 + contagem + alerta)
- Expand/collapse individual, **default todas colapsadas**
- `scroll-margin-top: 1rem` OBRIGATÓRIO

### 4. Campos (`.dt-row`)
- Mini-card com **barra colorida 4px à esquerda**: verde preenchido / âmbar vazio obrigatório / cinza vazio opcional
- Background: `var(--proc-surface)` sólido (mesmo dos cards do Workflow — NÃO usar rgba transparente)
- Ícone próprio Phosphor por campo (User, Globe, Anchor, etc.)
- Hover lift `translateY(-1px)` + borda roxa `rgba(167, 139, 250, 0.35)` + shadow

### 5. Edit-in-place
- Texto: `<input>` com borda `var(--ws-accent)` (#818cf8 indigo) + glow `rgba(129, 140, 248, 0.25)`
- Select: **SEMPRE** `SelectGlobal` do `@nucleo/campo-select-global` com `buscavel` + `iconeEsquerda`
- Enter/blur salva, Esc cancela

### 6. Read-only
- `readonly?: 'calculado' | 'bloqueado' | 'sistema'` por campo + `motivoTexto` opcional pro tooltip
- **Mesma cor e tamanho dos editáveis** — diferença é só o ícone à direita + sem hover lift + cursor default
- Ícone **logo após o label** (mesmo lugar do `*` obrigatório): `Sparkle` ciano (calculado), `Lock` âmbar (bloqueado), `Gear` muted (sistema)
- **TooltipGlobal envolve SOMENTE o ícone** (anchor pequeno = posição correta, padrão do sistema)
- **NÃO usar readonly pra permissão de usuário** — permissão é do user, não do campo

### 7. Paleta

| Cor | Uso |
|-----|-----|
| `var(--ws-accent)` `#818cf8` | Foco input/select (padrão sistema — modal Convidar Usuário) |
| `#a78bfa` (roxo) | Hover, active TOC, ícones de seção |
| `#34d399` (verde) | Preenchido, 100% |
| `#fbbf24` (âmbar) | Vazio obrigatório, alertas |
| `var(--proc-surface)` `#1e293b` | Background dos cards |

---

## Implementação de Referência

Quando for criar/refatorar tela do Processo:

1. **Leia** [DadosTecnicos.tsx](../../../servicos-global/produto/processo/client/src/pages/dados-tecnicos/DadosTecnicos.tsx) e [DadosTecnicos.css](../../../servicos-global/produto/processo/client/src/pages/dados-tecnicos/DadosTecnicos.css)
2. **Copie** a estrutura (layout, sidebar, seções, campos, edit-in-place)
3. **Adapte** apenas os dados (SECOES, CampoConfig)
4. **Não invente** layout próprio nem nova paleta

---

## Anti-padrões já erradicados

| Anti-padrão | Por que é proibido |
|-------------|---------------------|
| `<select>` nativo HTML | Quebra design system — use SelectGlobal |
| Borda roxa `#a78bfa` no foco de input | Padrão do sistema é indigo `var(--ws-accent)` |
| `align-items: start` na grid do layout | Quebra `position: sticky` da sidebar |
| Single `requestAnimationFrame` antes de `scrollIntoView` | React não terminou re-render — usar double rAF |
| Background rgba transparente nos cards | Fica "apagado" — usar `var(--proc-surface)` sólido |
| Inventar nova paleta ad-hoc por tela | Só os tokens listados na seção Paleta |
| Item de menu sem rota correspondente | Causa 404 ou click sem ação — limpar `PRODUCT_CONFIG` + `ProcessoLayout` juntos |

---

## Sub-rotas do Processo

Definidas em [App.tsx](../../../servicos-global/produto/processo/client/src/App.tsx) e [ProcessoLayout.tsx](../../../servicos-global/produto/processo/client/src/pages/ProcessoLayout.tsx):

| Rota | Tela | Status |
|------|------|--------|
| `/processo/workflow` | Painel + Insights + timeline | ✅ Pronta |
| `/processo/pedidos/resumo` | Cards/infográfico dos pedidos | ✅ Pronta |
| `/processo/pedidos/lista` | TabelaVirtualGlobal | ✅ Pronta (mock) |
| `/processo/dados-tecnicos` | TOC + seções + edit-in-place | ✅ **REFERÊNCIA DO PADRÃO** |
| `/processo/containers` | — | ⏳ Falta |
| `/processo/taxas` | — | ⏳ Falta |
| `/processo/financeiro` | Placeholder | ⏳ Falta |
| `/processo/workspace` | Placeholder | ⏳ Falta |
| `/processo/email` | Tela básica | ⏳ Refinar |
| `/processo/li`, `/di`, `/duimp`, `/retificacao` | — | ⏳ Faltam |

> Quando criar qualquer uma dessas: **siga PADRAO-UX-TELAS.md**.

---

## Checklist antes de PR (telas do Processo)

- [ ] Layout `.dt-layout` ou justificativa documentada da variação
- [ ] Sidebar TOC colapsável (default 56px) + card de stats se aplicável
- [ ] Seções como cards com header completo (ícone + título + progress + contagem)
- [ ] Default todas as seções colapsadas
- [ ] Campos como `.dt-row` com barra de status + ícone próprio + LABEL UPPERCASE
- [ ] Background `var(--proc-surface)` sólido nos cards
- [ ] Edit-in-place: input com borda indigo + SelectGlobal com `buscavel`
- [ ] Click TOC: expand + double-rAF + scrollIntoView
- [ ] Scroll-spy ativo
- [ ] Sem cor fora dos tokens da paleta
- [ ] Sem `<select>` nativo HTML
- [ ] `PRODUCT_CONFIG` + `ProcessoLayout` + rota em `App.tsx` sincronizados

---

## Histórico

| Data | Marco |
|------|-------|
| 2026-05-30 | Redesign DadosTecnicos (TOC + edit-in-place + cards individuais) |
| 2026-05-31 | SelectGlobal + borda indigo do sistema → padrão consolidado e documentado |
| 2026-05-31 | Padrão de campos read-only (calculado/bloqueado/sistema) com ícone + tooltip + visual dessaturado |
