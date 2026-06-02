# Processo — Padrão UX das Telas

> **Status:** Padrão oficial estabelecido em **2026-05-31** durante o redesign da tela DadosTecnicos.
> Aplica-se a TODAS as telas do produto Processo (Workflow, DadosTecnicos, Containers, Taxas, Financeiro, Email, To Do, Configurações, novas telas).

Este documento é o **SSOT visual e de interação** do produto Processo. Toda nova tela ou refatoração deve seguir estes padrões.

---

## 1. Layout Geral

```text
PaginaGlobal layout="lista"
├── CabecalhoGlobal (icone + título + subtítulo)
└── conteúdo
    └── grid 240px 1fr (TOC sticky | main scrolla)
        ├── .dt-sidebar (sticky, top: 1rem, align-self: start)
        │   ├── TOC navegação entre seções
        │   └── Card de estatísticas (donut + métricas)
        └── .dt-main (flex column, gap 1.25rem)
            └── seções empilhadas (cards)
                └── campos individuais (mini-cards)
```

**Regras de layout:**
- `PaginaGlobal` + `CabecalhoGlobal` SEMPRE no topo (ícone + título + subtítulo)
- `.dt-layout` é grid `240px 1fr` (colapsado: `56px 1fr`)
- `.dt-sidebar` agrupa TOC + stats num só bloco sticky (`top: 1rem`)
- Default **align-items: stretch** na grid + `align-self: start` na sidebar — pra `position: sticky` ter altura sobrando pra atuar (CRÍTICO)

---

## 2. Sidebar (TOC + Stats)

### TOC (Table of Contents)

- **Default colapsada** (56px, só ícones com tooltip)
- Botão **toggle no topo** com ícone `SidebarSimple` alterna entre 56px ↔ 240px
- Cada item: ícone + label + pill `X/Y` (preenchidos/total)
- Pill verde quando 100%, roxo (`#a78bfa`) quando faltam
- **Bolinha de status** no canto sup. direito do ícone (substitui a pill no modo colapsado)
- Hover/active visual:
  - Hover: `background: rgba(167, 139, 250, 0.08)` + `color: #f1f5f9`
  - Active: `background: rgba(167, 139, 250, 0.15)` + `color: #a78bfa`
- **Scroll-spy**: `IntersectionObserver` (rootMargin `-100px 0px -60% 0px`) destaca automaticamente a seção visível

### Card de Estatísticas

- Donut (`conic-gradient`) no topo do card
- Modo colapsado da TOC: donut reduz pra 40×40, padding diminui
- Toggle **Total / Obrigatórios** acima do donut
- Métricas embaixo: `X de Y campos` + `X/Y obrigatórios` (verde se 100%, âmbar se pendentes)

---

## 3. Seções (Cards Empilhados)

```css
.dt-secao {
  background: rgba(30, 41, 59, 0.35);
  border: 1px solid rgba(167, 139, 250, 0.1);
  border-radius: 14px;
  padding: 1.25rem 1.5rem 1.5rem;
  scroll-margin-top: 1rem;  /* OBRIGATÓRIO para scrollIntoView */
}
```

**Header da seção:**
- Ícone (32×32, fundo `rgba(167, 139, 250, 0.1)`, cor `#a78bfa`)
- Título (h2, 0.9375rem, weight 700, letter-spacing -0.01em)
- Toggle expand/collapse (CaretDown rotaciona)
- **Mini barra de progresso** (80×4px, verde se 100% ou roxo)
- Contagem + alerta de obrigatórios pendentes em âmbar (`#fbbf24`)

**Comportamento:**
- Seções colapsáveis individualmente
- **Default: todas colapsadas** (tela inicia compacta)
- Botão `toggleTodas` no topo do main expande/recolhe tudo
- Click no item do TOC: `expandirSecao` + **double-rAF** + `scrollIntoView` (essencial — single rAF não espera o React re-renderizar)

---

## 4. Campos (Mini-Cards Individuais)

> Este é o padrão de campo do Processo. **Sempre** usar este modelo.

```css
.dt-row {
  display: grid;
  grid-template-columns: 4px 1fr;  /* barra de status | conteúdo */
  background: var(--proc-surface, var(--ws-surface, #1e293b));  /* IGUAL Workflow cards */
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 10px;
  overflow: hidden;
}
```

### Estrutura visual

```text
┌─┬─────────────────────────────────┐
│■│ [ícone] LABEL UPPERCASE *       │  ← head (vertical layout)
│■│ valor do campo                  │  ← value (click pra editar)
└─┴─────────────────────────────────┘
 ↑
 barra colorida de 4px (status)
```

### Status (barra esquerda 4px)

| Status | Cor | Quando |
|--------|-----|--------|
| Preenchido | `#34d399` (verde) | tem valor não-vazio |
| Vazio obrigatório | `#fbbf24` (âmbar) | obrigatório sem valor |
| Vazio opcional | `rgba(148, 163, 184, 0.35)` (cinza) | opcional sem valor |

### Ícone do campo (`campo.icone`)

- **Cada campo TEM seu próprio ícone Phosphor** (não compartilha com a seção)
- 14×14px, cor `rgba(167, 139, 250, 0.85)` (roxo a 85%)
- Mapeamento típico:
  - Pessoa/responsável → `User`, `UserCircle`
  - Localização → `MapPin`, `Globe`, `Anchor`
  - Documento → `FileText`, `Certificate`, `IdentificationCard`, `IdentificationBadge`
  - Identificador → `Hash`, `Barcode`
  - Empresa → `Buildings`, `Briefcase`, `Warehouse`
  - Valor/moeda → `CurrencyDollar`
  - Lista/processo → `ListChecks`, `Scales`, `ShieldCheck`
  - Transporte → `AirplaneTakeoff`, `Boat`, `Anchor`, `Package`
  - Conversa/obs → `ChatText`

### Hover (lift)

```css
.dt-row:hover {
  transform: translateY(-1px);
  border-color: rgba(167, 139, 250, 0.35);  /* roxo a 35% */
  box-shadow: 0 6px 18px -8px rgba(0,0,0,0.4),
              0 0 0 1px rgba(167, 139, 250, 0.15);
}
```

---

## 5. Edit-in-place (estilo Linear/Notion)

### Padrão de interação

- Read mode: valor é texto clickable; aparece **PencilSimple** discreto à direita no hover
- Click no valor → vira input/select
- `Enter` ou `blur` salva
- `Esc` cancela
- Para `select`: **usar SelectGlobal** do `@nucleo/campo-select-global` (não `<select>` nativo)

### Estilo do input/select em foco

> **OBRIGATÓRIO: usar o token do sistema** — mesmo padrão do modal "Convidar Usuário", do `SelectGlobal`, etc.

```css
.dt-row-edit input,
.dt-row-edit select {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--ws-accent, #818cf8);          /* INDIGO sistema */
  border-radius: 6px;
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.25);      /* glow suave */
  transition: border-color .18s ease, box-shadow .18s ease;
}
```

### SelectGlobal

```tsx
<SelectGlobal
  opcoes={campo.opcoes.map(o => ({ valor: o.valor, rotulo: o.label }))}
  valor={valorLocal}
  aoMudarValor={(v) => { setValorLocal(String(v ?? '')); onSalvar(...); }}
  buscavel
  iconeEsquerda={campo.icone}
  placeholder="Selecione…"
/>
```

- **`buscavel` SEMPRE ativo** — selects de Processo podem ter dezenas/centenas de opções
- `iconeEsquerda` recebe o ícone do campo pra manter consistência com a barra colapsada

---

## 6. Campos Não-Editáveis (Read-only)

Campos podem ser inerentemente não-editáveis por 3 motivos distintos. Cada um tem ícone, cor e tooltip próprios — usuário entende **por quê** o campo não responde a clique.

### Configuração

```ts
interface CampoConfig {
  // ... outros campos
  readonly?: 'calculado' | 'bloqueado' | 'sistema'
  motivoTexto?: string  // texto customizado pro tooltip; default usa o motivo
}
```

### Os 3 motivos

| Motivo | Ícone | Cor | Quando usar |
|--------|-------|-----|-------------|
| `calculado` | `Sparkle` (fill) | `#22d3ee` ciano | Derivado de fórmula/soma — ex: Total FOB = Σ pedidos |
| `bloqueado` | `Lock` (duotone) | `#fbbf24` âmbar | Travado por status — ex: Canal após RF, Certificado após emissão |
| `sistema` | `Gear` (duotone) | cinza muted | Gerado automaticamente — ex: Número do Processo, timestamps |

### Tratamento visual

> **Princípio:** mesma cor, tamanho e layout dos cards editáveis. A diferença é **só o ícone à direita + comportamento do mouse**. Distinção forte demais (bg escurecido, opacity) faz o campo parecer "vazio" ou "quebrado".

1. **Mesma cor de fundo** (`var(--proc-surface)`) e **mesmo tamanho** dos cards editáveis
2. **Sem hover lift**: `transform: none`, sem borda roxa, sem shadow
3. **Cursor default** no card todo (não `text` de campo editável)
4. **`cursor: help`** no ícone — sinaliza que ali tem informação
5. **Ícone do motivo logo após o label** (mesmo lugar onde fica o asterisco `*` de obrigatório), colorido por tipo. Fica próximo ao nome do campo, fácil de associar visualmente.
6. **TooltipGlobal ancorado SOMENTE no ícone** (não no card todo) — anchor pequeno = posicionamento correto, mesmo padrão de tooltip do resto do sistema

### CSS canônico

```css
.dt-row--readonly {
  cursor: default;
}
.dt-row--readonly:hover {
  transform: none;
  border-color: rgba(148, 163, 184, 0.08);
  background: var(--proc-surface, var(--ws-surface, #1e293b));
  box-shadow: none;
}
.dt-row-value--readonly { cursor: default; }
.dt-row-value--readonly:hover {
  background: transparent;
  border-color: transparent;
  color: var(--ws-text, #f1f5f9);
}

.dt-row-readonly-icon {
  cursor: help;
  /* Fica no .dt-row-head, logo apos o label — mesmo lugar do asterisco. */
}

.dt-row--readonly-calculado .dt-row-readonly-icon { color: #22d3ee; }
.dt-row--readonly-bloqueado .dt-row-readonly-icon { color: #fbbf24; }
.dt-row--readonly-sistema   .dt-row-readonly-icon { color: rgba(148, 163, 184, 0.85); }
```

### Exemplos práticos

```ts
// Sistema — gerado na criacao
{ key: 'numero_processo', label: 'Número do Processo', tipo: 'texto',
  readonly: 'sistema', motivoTexto: 'Gerado automaticamente na criação do processo' }

// Bloqueado — apos emissao
{ key: 'certificado', label: 'Certificado', tipo: 'texto',
  readonly: 'bloqueado', motivoTexto: 'Bloqueado após emissão do certificado' }

// Calculado — soma dos pedidos
{ key: 'total_fob', label: 'Total FOB', tipo: 'texto',
  readonly: 'calculado', motivoTexto: 'Soma do valor FOB de todos os pedidos vinculados' }

// Select tambem aceita readonly (ex: Canal bloqueado pela RF)
{ key: 'canal', label: 'Canal', tipo: 'select', icone: <TrafficSign />,
  readonly: 'bloqueado', motivoTexto: 'Definido pela RF após parametrização da DI',
  opcoes: [...] }
```

### Regra: barra de status continua válida

Mesmo readonly, o campo respeita a barra colorida à esquerda (verde preenchido / âmbar vazio obrigatório / cinza vazio opcional). Read-only **não substitui** o status — são dimensões ortogonais (status = "tem valor?" / readonly = "posso editar?").

### Quando NÃO usar readonly

- Campo que **pode** ser editado mas o usuário atual **não tem permissão** → mostre o campo normal e trate no botão de salvar (tooltip "Sem permissão") em vez de readonly visual permanente. Razão: a permissão é do user, não do campo.
- Campo que é readonly **temporariamente** (ex: processando) → use estado de loading, não readonly.

---

## 7. Paleta de Cores (Processo)

> Estes são os **únicos** tokens permitidos. Não inventar cores ad-hoc.

| Token / Hex | Uso |
|-------------|-----|
| `var(--ws-accent)` = `#818cf8` (indigo) | **Foco** de inputs/selects, link/ação ativa |
| `#a78bfa` (roxo 400) | Hover, active TOC, ícone das seções, accents de tema |
| `#34d399` (verde 400) | Preenchido, completude 100%, sucesso |
| `#fbbf24` (âmbar 400) | Vazio obrigatório, alertas não-críticos |
| `#f87171` (vermelho 400) | Asterisco obrigatório, erro |
| `rgba(148, 163, 184, ...)` | Muted, vazio opcional, dividers |
| `var(--proc-surface)` = `#1e293b` | **Background dos cards** (mesmo do Workflow KPI) |
| `var(--ws-text)` = `#f1f5f9` | Texto principal |
| `var(--ws-muted)` = `#94a3b8` | Labels uppercase, hints, descrições |

**Background dos cards de campo** = `var(--proc-surface)` **sólido**, igual ao Workflow (`VALOR FOB TOTAL`, `TEMPO DE TRÂNSITO`, `PROGRESSO`). Não usar rgba transparente — fica "apagado" demais.

---

## 8. Busca

Quando a tela tem muitos campos, oferecer busca em tempo real:
- **Por nome do campo** (label match parcial)
- **Por conteúdo** (valor match parcial)
- Filtra dentro de cada seção (esconde campos que não casam)

Ícone `MagnifyingGlass` na esquerda, `X` no botão de clear quando há termo.

---

## 9. Implementação de referência

Arquivo canônico que define todos esses padrões:

- [DadosTecnicos.tsx](servicos-global/produto/processo/client/src/pages/dados-tecnicos/DadosTecnicos.tsx)
- [DadosTecnicos.css](servicos-global/produto/processo/client/src/pages/dados-tecnicos/DadosTecnicos.css)

Quando criar uma tela nova no Processo, **copie a estrutura desses dois arquivos** e adapte os dados/seções. Não invente layout próprio.

---

## 10. Checklist para nova tela do Processo

Antes de abrir PR, confirmar:

- [ ] `PaginaGlobal layout="lista"` + `CabecalhoGlobal` com ícone, título, subtítulo
- [ ] Layout `.dt-layout` (grid 240px 1fr) ou justificar variação
- [ ] Se tem múltiplas seções: TOC sticky colapsável (default 56px) + card de stats
- [ ] Seções como cards empilhados com header completo (ícone + título + progress + contagem)
- [ ] Default **todas as seções colapsadas**
- [ ] Campos como mini-cards `.dt-row` com:
  - [ ] Barra de status à esquerda (verde/âmbar/cinza)
  - [ ] Ícone próprio por campo
  - [ ] LABEL UPPERCASE + asterisco se obrigatório
  - [ ] Background `var(--proc-surface)` sólido
  - [ ] Hover lift
- [ ] Edit-in-place:
  - [ ] Texto: `<input>` com borda `var(--ws-accent)` + glow indigo
  - [ ] Select: `SelectGlobal` com `buscavel` + `iconeEsquerda`
  - [ ] Enter/blur salva, Esc cancela
- [ ] Campos read-only:
  - [ ] `readonly: 'calculado' | 'bloqueado' | 'sistema'` definido por campo
  - [ ] `motivoTexto` claro pro tooltip (não usar texto genérico se possível)
  - [ ] Visual: sem hover lift, cursor default, background `rgba(15, 23, 42, 0.6)`, ícone Sparkle/Lock/Gear à direita
- [ ] Click no TOC: `expandirSecao` + **double-rAF** + `scrollIntoView`
- [ ] Scroll-spy ativo destacando a seção visível
- [ ] Paleta de cores estritamente dentro dos tokens listados
- [ ] Sem `position: sticky` quebrado: `align-items: stretch` no parent + `align-self: start` na sidebar

---

## 12. Seletor workspace (Lista | Kanban)

Fora do padrão TOC/cards — aplica-se à **listagem de processos do workspace** (`/acesso-processos/lista` e `/kanban`):

| Item | Padrão |
|------|--------|
| Pills | `TodosProcessosTabs` — classes `.tpt-tab` |
| Layout | `ProcessoVisualizacaoLayout` (tabs fixas + `Outlet`) |
| Conteúdo | `ProcessoMultiView` — keep-alive; `embedTabs={false}` nas páginas |
| testids | `seletor-visao-tab-lista`, `seletor-visao-tab-kanban`, `seletor-visao-painel-*` |
| SSOT cross-produto | [seletor-universal-visualizacoes.md](../../arquitetura/seletor-universal-visualizacoes.md) |

---

## Histórico

| Data | Marco |
|------|-------|
| 2026-06-02 | Seletor workspace Lista \| Kanban documentado (paridade MBOTO / keep-alive) |
| 2026-05-30 | Redesign inicial DadosTecnicos (TOC + edit-in-place + cards) |
| 2026-05-31 | SelectGlobal substitui `<select>` nativo + borda indigo unificada com modal Convidar Usuário → **padrão consolidado** |
| 2026-05-31 | Padrão de campos read-only (`calculado` / `bloqueado` / `sistema`) com ícone + tooltip + visual dessaturado |
