# UX — Layout e Margens de Página

> Padrão oficial do ecossistema Gravity para espaçamento lateral, largura máxima e centralização de conteúdo.

---

## 1. Os Dois Padrões de Layout

O Gravity usa **dois layouts de página distintos**, cada um com propósito específico.

### `layout-centered` — Telas de Apresentação

Usado em telas de **navegação, catálogo ou descoberta**, onde o usuário consome informação em vez de trabalhar com ela. O conteúdo é limitado a 1280px e centralizado automaticamente em telas maiores.

```css
.container {
  padding: [top] 2rem [bottom];  /* 2rem = 32px lateral, igual dos dois lados */
  max-width: 1280px;
  margin: 0 auto;
}
```

**Quando usar:** Store, Hub, Premium, páginas de onboarding, catálogos.

**Por quê:** Em telas largas (1440px+), o olho humano não precisa viajar toda a largura. O conteúdo centralizado e contido melhora escaneabilidade e foco visual.

---

### `layout-full` — Telas de Trabalho

Usado em telas **operacionais**, onde o usuário precisa de máxima densidade de informação — tabelas, formulários, KPIs, dashboards.

```css
.container {
  padding: [top] 2rem [bottom];  /* 2rem = 32px lateral */
  /* sem max-width — ocupa 100% da área útil */
}
```

**Quando usar:** Configurador, Admin, páginas internas de produto (workspace).

**Por quê:** Ferramentas de trabalho se beneficiam de mais espaço horizontal — tabelas com mais colunas visíveis, formulários sem quebra de linha desnecessária.

---

## 2. Mapeamento por Tela

| Tela | Arquivo CSS | Classe Container | Padding Lateral | Max-width | Centralizado | Layout |
|------|-------------|-----------------|-----------------|-----------|--------------|--------|
| **Hub** (SelecionarWorkspace) | `selecionar-workspace.css` | `.sw-content` | `32px` (2rem) | `1280px` | Sim | `centered` |
| **Store** (Gravity Store) | `hub-store.css` | `.gs-store` | `2rem` | `1280px` | Sim | `centered` |
| **Premium** | `premium.css` | `.premium-wrapper` + `.premium-content` | `32px` (wrapper) | `1280px` (inner) | Sim | `centered` |
| **Configurador** (Workspace) | `workspace.css` | `.ws-content` | `2rem` | — | Não | `full` |
| **Admin** | `admin.css` + `workspace.css` | `.ws-content` (herdado) | `2rem` | — | Não | `full` |
| **Auth / Login** | `auth.css` | `.auth-root` | — | — | Flex split | especial |

> **Nota:** Topbars e sidebars sempre ocupam 100% da largura disponível, independente do layout da página. O `max-width` se aplica apenas à área de conteúdo rolável.

---

## 3. Por Que 1280px?

| Resolução | Usuários (~) | Comportamento com 1280px |
|-----------|-------------|--------------------------|
| 1280px | comum | conteúdo ocupa 100% |
| 1366px | muito comum | 43px de margem auto em cada lado |
| 1440px | comum (dev/design) | 80px de margem auto em cada lado |
| 1920px | monitores grandes | 320px de margem auto em cada lado |
| 2560px (ultrawide) | raro | 640px de margem auto em cada lado |

Em 1440px — a resolução mais comum entre desenvolvedores e usuários corporativos — o conteúdo fica com **80px de respiro em cada lado**, proporção próxima à regra dos terços. Abaixo de 1280px o comportamento é idêntico ao full-width.

---

## 4. O Valor `2rem` como Padrão Universal

Todas as telas do Gravity usam `2rem` (= `32px`) como padding lateral mínimo, sem exceção. Isso garante:

- **Consistência visual** entre telas
- **Responsividade** natural — em mobile cai para `1rem` via media query
- **Referência única** — um único token, sem magic numbers

### Media query obrigatória para mobile

```css
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
```

---

## 5. Referências no Mercado SaaS

| Produto | Telas operacionais | Telas de catálogo/home |
|---------|--------------------|------------------------|
| **Linear** | Full-width | Centralizado ~1200px |
| **Vercel Dashboard** | Full-width | Max-width centralizado |
| **Stripe Dashboard** | Full-width | Max-width centralizado |
| **Notion** | Full-width (com sidebar) | Centralizado |
| **GitHub** | Full-width | Max-width ~1280px |

O padrão do Gravity está alinhado com o mercado: ferramentas = full-width, apresentação = max-width centralizado.

---

## 6. Regra de Decisão — Qual Layout Usar?

```
A tela serve para o usuário TRABALHAR (criar, editar, listar, operar)?
  → layout-full  (sem max-width)

A tela serve para o usuário NAVEGAR, DESCOBRIR ou CONSUMIR informação?
  → layout-centered  (max-width: 1280px + margin: 0 auto)
```

---

## 7. Checklist para Novas Telas

- [ ] Definir se é `layout-centered` ou `layout-full`
- [ ] Padding lateral sempre `2rem` (nunca hardcodar valores diferentes)
- [ ] Se `layout-centered`: adicionar `max-width: 1280px` + `margin: 0 auto`
- [ ] Topbar sempre full-width (não sofre restrição de max-width)
- [ ] Media query mobile com `padding: 1rem` em ≤ 768px
