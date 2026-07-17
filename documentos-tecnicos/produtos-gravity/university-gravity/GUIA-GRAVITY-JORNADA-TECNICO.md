# Guia Gravity — Jornada Academy (referência técnica)

> **Escopo:** implementação atual do **Guia Gravity** (`/university-gravity/academy/*`) no Configurador — trilhas, pesos XP, PlayerAula, manuais SSOT e menu lateral.
> **Companions:** [MANUAL-GRAVITY-ONBOARDING.md](./MANUAL-GRAVITY-ONBOARDING.md) · [PUBLICACAO-PRODUCAO.md](./PUBLICACAO-PRODUCAO.md) · [SPECS-TELAS.md](./SPECS-TELAS.md)
> **Última entrega documentada:** PR [#809](https://github.com/dmmltda/gravity-antigravity/pull/809) · branch `pedido-guia-02` · jul/2026

---

## 1. Visão geral

| Item | Valor |
|------|--------|
| **Rota dev** | `http://127.0.0.1:8002/university-gravity/academy` |
| **Shell** | `UniversityGravity.tsx` + `PlayerAula.tsx` |
| **Conteúdo SSOT** | `manual-*-conteudo.ts` (manual `/docs`) + `manual-*-academy.ts` (curadoria Academy) |
| **XP / GP** | `pesos-academy-guia-gravity.ts` (client + `shared/guia-gravity/`) |
| **Certificados por módulo** | `shared/guia-gravity/slugs-aula-por-produto.ts` |

O Guia Gravity **não** é o onboarding de produto (`/trial`). É help estruturado por trilhas, com progresso local/API e gamificação (XP, GP, níveis, certificados).

---

## 2. Entregas — módulo Navegação (jul/2026)

### 2.1 Trilha Academy (2 aulas)

| Ordem | Slug | Título | Duração | Fluxos manual | Curadoria |
|-------|------|--------|---------|---------------|-----------|
| 1 | `menus-plataforma` | Menus da plataforma | 53m | `[0,1,2,3,4]` | `incluirIntroSecao: true`, `tituloIntroAcademy: 'Menus da plataforma'`, renomeia fluxos 1–4 no menu |
| 2 | `funcionalidades-listas` | Funcionalidades das listas | 20m | `[7]` | `cabecalhoH1: true` (H1 sem intro completa da seção) |

**SSOT trilha:** `manual-navegacao-academy.ts` → `NAVEGACAO_TRILHA`, `AULAS_NAVEGACAO`, `NAVEGACAO_AULA_SLUGS`.

**Removido da Academy (mantido no manual `/docs/navegacao`):**

- Aula `acesso-gravity-university` — fluxos 5 e 6 permanecem em `DOC_NAVEGACAO_SECAO` para Manuais; não entram na trilha gamificada.

### 2.2 Infográfico «Funcionalidades das listas»

**Arquivos:**

| Papel | Caminho |
|-------|---------|
| SSOT textos + prints | `manual-navegacao-conteudo.ts` → `LOCAIS_LISTA_PLATAFORMA_MANUAL`, `FUNCIONALIDADES_LISTA_PLATAFORMA_MANUAL` |
| Componente infográfico | `manual-navegacao-funcionalidades-listas-infografico.tsx` |
| Wiring Academy | `academy-blocos-manual.ts` (flag `mostrarInfograficoFuncionalidadesLista`), `academy-infograficos.tsx` (id `funcionalidades-listas`) |
| Manual `/docs` | `manual-configurador-ui.tsx` (mesma flag no fluxo 7) |

**Seções do infográfico:**

1. **Onde a lista aparece na plataforma** — grade 4 cards: Configurador, Pedido, BID Frete, Smart Docs (prints em `public/university/screenshots/`).
2. **O que sempre é igual** — Localizar, arrastar colunas, filtros, Exportar (gestos GTV cross-product; prints reutilizados do Pedido/Navegação).

**Regra editorial:** sem travessão (`—`, `–`) no corpo visível ao aluno — usar dois-pontos, ponto ou vírgula (ver MANUAL-GRAVITY-ONBOARDING §9.1).

### 2.3 Cabeçalho H1 (paridade «Menus da plataforma»)

Aulas **sem** `incluirIntroSecao` que precisam do título grande com linha roxa (`.uni-player-aula__titulo-guia`) usam **`cabecalhoH1: true`** em `manual-navegacao-academy.ts` (padrão já existente em `manual-hub-academy.ts`):

```typescript
// Insere H1 antes dos blocos; remove H2 duplicado se o título do fluxo = título da aula
if (opcoes?.cabecalhoH1 && !opcoes.incluirIntroSecao) {
  blocos.unshift({ tipo: 'heading', dados: { text: tituloCabecalho, nivel: 1 } })
  // … remove heading nivel >= 2 com mesmo texto
}
```

### 2.4 Entregas anteriores na mesma branch (PR #806 + #809)

Documentadas aqui para rastreio único:

| Área | Entrega |
|------|---------|
| Menu superior | Infográfico 8 ícones (`manual-navegacao-icones-menu.tsx`), layout texto à esquerda / miniatura à direita |
| Menu usuário | Infográfico demais opções (`manual-navegacao-menu-usuario-infografico.tsx`), espaçamento intro 32px (`MANUAL_ESPACO_INTRO_INFOGRAFICO_MENU_USUARIO_PX`) |
| Menus plataforma | Prints Drive «3. Navegação», callouts Dica removidos onde solicitado |
| Troca produto / workspace | Prints menu lateral + reposicionamento de dicas |
| Configuração | Alternar tema = **Em breve** no infográfico menu avatar |
| Funcionalidades listas | Refactor cross-product (Localizar global, arrastar, filtros, exportar) |

---

## 3. XP e Gravity Points (GP)

### 3.1 Problema corrigido

Somas JavaScript de XP por aula (ex.: `5 × 1,43`) exibiam `7.1499999999999995 XP` e GP `14.299999999999999`. Meta de módulo sem peso PO (fallback peso 1 ÷ 7 aulas) mostrava `10,01 XP` em vez de `10`.

### 3.2 Helpers SSOT

**Arquivos:** `shared/guia-gravity/pesos-academy-guia-gravity.ts` (server) · espelho client `src/pages/university/pesos-academy-guia-gravity.ts`

| Função | Uso |
|--------|-----|
| `arredondarXpGuiaGravity(n)` | `Math.round(n * 100) / 100` |
| `somarXpGuiaGravity(iterable)` | Soma com arredondamento final |
| `formatarXpGuiaGravity(n)` | Exibição pt-BR (máx. 2 casas) |
| `calcularGpGuiaGravity(xp)` | `arredondar(xp * 2)` |
| `pesoParaXp(peso)` | 1 peso PO = 10 XP (já existia) |
| `montarMapaXpAulas(produto, fases)` | Mapa slug → XP; **última aula** absorve centavos na rateio |
| `obterXpMaxTrilha` / `obterXpMaxProduto` | Somas via `somarXpGuiaGravity` |

**Consumidores UI:** `UniversityGravity.tsx` (jornada, sidebar, ranking, dashboard onboarding).

**Consumidores server:** `progresso-guia-gravity.ts` (`calcularXpMaximoCatalogo`, `calcularXpTotalConclusoes`).

### 3.3 Rateio de peso (módulos sem peso por aula)

Função interna `aplicarXpRateadoPeso`: para `n` aulas, as primeiras `n-1` recebem `pesoParaXp(pesoTotal/n)`; a última recebe `xpModulo - acumulado` (ex.: BID Frete 7 aulas → 6×1,43 + 1×1,42 = 10 XP).

Módulos **Pedido** e **Smart Docs** usam `PESO_AULA_GUAI` explícito (sem rateio).

---

## 4. Menu lateral — badges

### 4.1 Admin: Restrito + Em Breve

`UniversityGravity.tsx` → `badgeAdminOnboarding`:

```typescript
{
  badge: t('university.badge.restrito'),
  badgeSecundario: t('university.badge.em_breve'),
  badgeVariant: 'muted',
}
```

Aplica-se aos itens **Admin** em Academy e Manuais (`MenuLateralGlobal` → `mlg-nav-badges-row`).

### 4.2 Outros badges

| Badge | Produtos / itens |
|-------|------------------|
| `Em Breve` | BID Câmbio, Processo, Builders, capítulos WIP Configurador |
| `Restrito` (+ opcional `Em Breve`) | Admin |

---

## 5. Mapa de arquivos por feature

```
servicos-global/configurador/
├── shared/guia-gravity/
│   ├── pesos-academy-guia-gravity.ts      # XP SSOT server
│   ├── progresso-guia-gravity.ts          # agregações XP
│   └── slugs-aula-por-produto.ts          # certificado Navegação: menus-plataforma, funcionalidades-listas
├── src/pages/
│   ├── UniversityGravity.tsx              # shell, nav, jornada, badges
│   └── university/
│       ├── PlayerAula.tsx                 # breadcrumb, H1, ritmo vertical
│       ├── manual-navegacao-conteudo.ts   # SSOT manual Navegação
│       ├── manual-navegacao-academy.ts    # curadoria trilha Navegação
│       ├── manual-navegacao-funcionalidades-listas-infografico.tsx
│       ├── manual-navegacao-icones-menu.tsx
│       ├── manual-navegacao-menu-usuario-infografico.tsx
│       ├── pesos-academy-guia-gravity.ts  # XP SSOT client
│       ├── academy-blocos-manual.ts       # blocosDeSecaoConfiguradorAcademy
│       └── manual-tipografia.ts           # tokens espaçamento / corpo
└── public/university/screenshots/         # prints Navegação (cache bust MANUAL_SCREENSHOT_CACHE_KEY)

nucleo-global/Layout/menu-lateral-global/  # badge + badgeSecundario
```

---

## 6. Certificado — módulo Navegação

`slugs-aula-por-produto.ts`:

```typescript
navegacao: ['menus-plataforma', 'funcionalidades-listas'],
```

Conclusão exige **ambas** as aulas (não inclui fluxos removidos da Academy).

---

## 7. Testes manuais (checklist)

- [ ] `/academy/navegacao/menus-plataforma` — H1 + linha roxa + sumário multi-tópico
- [ ] `/academy/navegacao/funcionalidades-listas` — H1 padrão, textos sem travessão, infográfico 4+4
- [ ] BID Frete (ou módulo fallback 7 aulas) — 5 aulas concluídas = **7,15 XP** / **14,3 GP**; meta **10 XP**
- [ ] Menu lateral Admin — **Restrito / Em Breve**
- [ ] Manuais `/docs/navegacao` — fluxos 5–6 ainda acessíveis (Gravity University onboarding)

---

## 8. Histórico de PRs (Navegação + jornada)

| PR | Resumo |
|----|--------|
| [#806](https://github.com/dmmltda/gravity-antigravity/pull/806) | Infográfico menu superior, Localizar, prints Navegação (mergeado) |
| [#809](https://github.com/dmmltda/gravity-antigravity/pull/809) | XP arredondado, H1 listas, travessões, Admin badges, trilha Navegação 2 aulas |
