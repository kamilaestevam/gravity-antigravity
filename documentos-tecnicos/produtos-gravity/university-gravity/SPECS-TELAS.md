# SPECS de Telas — Gravity University (MVP)

> **Status:** Especificação de UI do MVP (T-00 a T-07). Segue **exatamente** os padrões do sistema.
> **Companions:** [PRD.md](PRD.md) · [MODELO-DADOS.md](MODELO-DADOS.md)
> **Padrões-fonte (SSOT) seguidos aqui:**
> - `skills/ux/criacao-telas` — `PaginaGlobal` + `CabecalhoGlobal` obrigatórios; UX 10; empty/loading states; toasts via Shell
> - `skills/ux/design-system` — tema Solid Slate, tokens CSS, botões pill, KPI cards, Phosphor, Plus Jakarta Sans
> - `documentos-tecnicos/produtos-gravity/processo/PADRAO-UX-TELAS.md` — TOC sticky, cards, edit-in-place, SelectGlobal (para telas de detalhe/edição)
> - `documentos-tecnicos/arquitetura/seletor-universal-visualizacoes.md` — pills Insights/Lista/Dashboard/Kanban

---

## 0. Princípios (não negociar)

1. **Toda tela** usa `PaginaGlobal` + `CabecalhoGlobal` (ícone + título + subtítulo). Nunca reconstruir header/menu — vêm do Shell.
2. **Componentes núcleo-global** sempre que existir equivalente (`TabelaGlobal`, `SelectGlobal`, `CardEstatisticaGlobal`, `BotaoGlobal`, `TooltipGlobal`, `ModalGlobal`, `DashboardGrid`). Nada de `<select>` nativo, nada de toast manual.
3. **Tokens CSS** — sem hex hardcoded. Usar `var(--ws-accent)`, `var(--ws-surface)`, `var(--ws-text)`, `var(--ws-muted)`, `var(--ws-bg-body)`.
4. **Ícones** exclusivamente `@phosphor-icons/react`, `weight="duotone"` padrão.
5. **Tipografia** Plus Jakarta Sans; `.text-micro` sempre UPPERCASE.
6. **Estados** loading (skeleton/`.hs-spin`), empty (UX 10 envolvente), erro (toast via `addNotification`) em toda tela.
7. **Título = nome da view** (Catálogo / Player / Minha Jornada), nunca o nome do produto (regra de convenção de página).

---

## 1. Identidade visual da University

- **Tier de cor:** serviço de **plataforma** → acento **Gravity Indigo** `#818cf8` (`--ws-accent`) + roxo `#a78bfa` para hovers/accents, igual ao padrão Processo. (Se o dono quiser cor própria de produto depois, vem de `getProdutoMeta` — mas como serviço de plataforma, indigo é o correto.)
- **Ícone da marca:** `GraduationCap` (Phosphor) — usado no CabecalhoGlobal da Home e como símbolo da University no Shell.
- **Atalho global no header (SSOT):** em **todas** as telas autenticadas, o ícone `GraduationCap` aparece na barra superior **após busca e antes de notificações/dicas**, com `aria-label`/`title` = `university.modulo_nome` e navegação para `/university-gravity`. Implementação central:
  - Produtos: `MenuTopoGlobal` (`@nucleo/menu-topo-global`)
  - Serviços tenant: `servicos-global/shell/Header.tsx`
  - Configurador / Admin / Core / University: bloco `ws-global-actions` (e `TopbarPaginaGravity` / Hub `SelecionarWorkspace` onde já existia)
  - **Proibido** duplicar só em uma tela — novos layouts devem reutilizar um dos pontos acima.
- **GABI presente em toda tela** (D-002): painel/atalho de dúvida +, nas telas de jornada, mensagens proativas.

---

## 2. Componentes núcleo-global usados (mapa)

| Componente | Caminho | Uso na University |
|---|---|---|
| `PaginaGlobal` | `nucleo-global/Layout/pagina-global/src/pagina-global.tsx` | Wrapper de todas as telas (`layout="lista"`) |
| `CabecalhoGlobal` | `nucleo-global/Layout/cabecalho-global/src/cabecalho.tsx` | Header (ícone/título/subtítulo/acoes/viewToggle) |
| `CardEstatisticaGlobal` | `nucleo-global/Layout/card-global/src/CardEstatisticaGlobal.tsx` | KPIs (Home, Minha Jornada) |
| `BotaoGlobal` | `nucleo-global/Botoes/botao-global/src/botao.tsx` | Botões pill (Iniciar jornada, etc.) |
| `TabelaGlobal` | `nucleo-global/Tabelas/.../tabela-global/src/TabelaGlobal.tsx` | Listas (catálogo em modo lista, certificados) |
| `SelectGlobal` | `nucleo-global/Campos/campo-select-global/src/SelectGlobal.tsx` | Filtros (produto, tipo de trilha) |
| `TooltipGlobal` | `nucleo-global/Feedback/tooltip-global/src/tooltip.tsx` | Dicas (≤ 90 chars) |
| `ModalGlobal` | `nucleo-global/Modais/modal-global/src/ModalGlobal.tsx` | Confirmações |
| `GabiCampoIconeGlobal` | `nucleo-global/Gabi/gabi-field-icon-global/src/GabiCampoIconeGlobal.tsx` | Dúvida contextual em aulas |
| `ModalGabiCaixaAvisoGlobal` | `nucleo-global/Modais/modal-gabi-caixa-aviso/src/ModalGabiCaixaAvisoGlobal.tsx` | Guia de jornada proativa (card índigo "ao vivo") |

---

## 3. Navegação entre as 3 áreas

A Home (T-00) é a porta. **Academy / Docs / Builders** são as seções de topo. No MVP só **Academy** é funcional (Docs/Builders entram na Fase 2 — exibir como cards "em breve" na Home, sem rota ativa).

Dentro da **Academy**, a navegação é:
`Catálogo (T-01) → Detalhe da Trilha (T-02) → Player de Aula (T-03) → Avaliação (T-04) → Resultado (T-05) → Certificado (T-06)`, com **Minha Jornada (T-07)** acessível a qualquer momento.

---

## 4. GABI onipresente — como aparece

| Tela | Papel da GABI | Componente |
|---|---|---|
| Player de Aula (T-03) | **Dúvida contextual** sobre o conteúdo da aula | painel lateral de chat + `GabiCampoIconeGlobal` em termos-chave |
| Home / Minha Jornada | **Guia de jornada** (proativa): "você parou no módulo 3", "falta o quiz" | `ModalGabiCaixaAvisoGlobal` (card índigo "ao vivo") |
| Qualquer tela | **Atalho de dúvida** (reativa) | botão GABI fixo (já existe no Shell/topbar) |

> No MVP a GABI responde a partir da **KB atual** (docs Markdown). A ingestão do conteúdo da University na KB é Fase 2 (PRD Seção 18).

---

## 5. Telas

### T-00 — Home da University

- **Rota:** `/university-gravity`
- **Objetivo:** porta de entrada. Reconhece o usuário (sessão), mostra "continuar de onde parou", destaques e as 3 áreas.
- **Layout:** `PaginaGlobal layout="lista"`
  - `CabecalhoGlobal` — ícone `GraduationCap` · título **"Gravity University"** · subtítulo "Aprenda a usar a plataforma no seu ritmo"
  - `stats` (KPIs do usuário): `CardEstatisticaGlobal` ×3 — **Trilhas concluídas**, **Em andamento**, **Certificados** (ícones `CheckCircle`, `Play`, `Certificate`)
  - `children`:
    - **Continuar de onde parou** (se houver matrícula `IN_PROGRESS`): card largo com nome da trilha + barra de progresso + `BotaoGlobal` "Continuar" (`variante="primario"`)
    - **Guia da GABI** (`ModalGabiCaixaAvisoGlobal` inline): mensagem proativa de jornada
    - **3 áreas**: grid de 3 cards — **Academy** (ativo), **Docs** (badge "Em breve"), **Builders** (badge "Em breve")

```text
┌ Gravity University ───────────────────────────────────────┐
│ 🎓  Gravity University                          [🔎] [GABI]│
│     Aprenda a usar a plataforma no seu ritmo              │
├──────────────────────────────────────────────────────────┤
│ [✔ Concluídas: 2] [▶ Em andamento: 1] [🎖 Certificados: 2]│
├──────────────────────────────────────────────────────────┤
│ ▶ Continuar: Onboarding Pedido   ▓▓▓▓▓░░░ 62%  [Continuar]│
│ ✦ GABI: "Falta só o quiz pra liberar seu certificado."   │
│ ┌ Academy ─┐ ┌ Docs ───────┐ ┌ Builders ──┐             │
│ │ Trilhas  │ │ Em breve    │ │ Em breve   │             │
│ └──────────┘ └─────────────┘ └────────────┘             │
└──────────────────────────────────────────────────────────┘
```

- **Estados:** loading = skeleton dos cards; empty (usuário novo, sem matrícula) = sem bloco "continuar", GABI dá boas-vindas e CTA "Explorar trilhas".
- **Dados:** `GET /api/v1/university-gravity/home` → `{ kpis, matricula_em_andamento?, sugestao_gabi? }`
- **data-testids:** `uni-home`, `uni-home-kpi-{concluidas|andamento|certificados}`, `uni-home-continuar`, `uni-area-{academy|docs|builders}`

---

### T-01 — Catálogo de Trilhas (Academy)

- **Rota:** `/university-gravity/academy`
- **Objetivo:** listar/buscar trilhas publicadas; escolher uma.
- **Layout:** `PaginaGlobal layout="lista"`
  - `CabecalhoGlobal` — ícone `Books` · título **"Academy"** · subtítulo "Trilhas de aprendizado"
  - `viewToggle` (seletor universal — pills): **Galeria** (cards, default) | **Lista** (`TabelaGlobal`). data-testids `seletor-visao-tab-galeria` / `seletor-visao-tab-lista`
  - `toolbar`: busca (`MagnifyingGlass`) + `SelectGlobal` filtro **Produto** (`produto_alvo_trilha`) + `SelectGlobal` filtro **Tipo** (Plataforma/Produto), ambos `buscavel`
  - `children`:
    - **Galeria:** grid de cards de trilha (3–4 col responsivo). Card: ícone do produto, nome, descrição curta, pills (`Nº módulos`, `carga horária`), barra de progresso se já matriculado, `BotaoGlobal` "Iniciar jornada" / "Continuar"
    - **Lista:** `TabelaGlobal` — colunas: Trilha, Produto, Módulos, Carga horária, Progresso, ação (Abrir)

```text
┌ Academy ──────────────────────────────────────────────────┐
│ 📚  Academy                        [Galeria][Lista] [GABI] │
│     Trilhas de aprendizado                                │
│ [🔎 Buscar]   Produto ▾   Tipo ▾                          │
├──────────────────────────────────────────────────────────┤
│ ┌ Onboarding Pedido ─┐ ┌ Integração API ─┐ ┌ Processo ──┐│
│ │ 🟠 5 mód · 2h      │ │ 🧩 4 mód · 1h30 │ │ 🟡 6 mód   ││
│ │ ▓▓▓░░ 62%          │ │ Iniciar jornada │ │ Iniciar    ││
│ │ [Continuar]        │ └─────────────────┘ └────────────┘│
│ └────────────────────┘                                    │
└──────────────────────────────────────────────────────────┘
```

- **Estados:** loading = skeleton de cards; empty (sem trilhas) = UX 10 ("Nenhuma trilha publicada ainda").
- **Dados:** `GET /api/v1/university-gravity/trilhas?produto=&tipo=&busca=` → lista de trilhas + progresso do usuário (join com matrícula).
- **data-testids:** `uni-catalogo`, `seletor-visao-tab-galeria`, `seletor-visao-tab-lista`, `uni-trilha-card-{id_trilha}`, `uni-filtro-produto`, `uni-filtro-tipo`

---

### T-02 — Detalhe da Trilha

- **Rota:** `/university-gravity/academy/trilhas/:id_trilha`
- **Objetivo:** ver módulos/aulas, progresso, e **Iniciar jornada** (cria a matrícula — única ação explícita, D-012).
- **Layout (padrão Processo — TOC sticky + cards):** `PaginaGlobal layout="lista"` com grid `240px 1fr`
  - `CabecalhoGlobal` — ícone do produto da trilha · título = **nome da trilha** · subtítulo = descrição · `acoes`: `BotaoGlobal` **"Iniciar jornada"** (`primario`) quando não matriculado / **"Continuar"** quando em andamento
  - **Sidebar sticky** (igual `.dt-sidebar`): TOC dos módulos (item: ícone + nome + pill `X/Y aulas`) + card de stats (donut de progresso da trilha)
  - **Main:** módulos como **cards empilhados** (`.dt-secao`), cada um com header (ícone + nome + mini barra de progresso + contagem) e, dentro, as aulas como **mini-cards** (`.dt-row`): barra de status 4px (verde concluída / cinza pendente), ícone por tipo de aula (`VideoCamera`/`FileText`/`TextT`), título, duração. Click na aula → Player (T-03).

```text
┌ Onboarding Pedido ───────────────────────────────────────┐
│ 🟠 Onboarding Pedido                    [Iniciar jornada] │
│    Aprenda a operar o produto Pedido                     │
├──────────┬───────────────────────────────────────────────┤
│ TOC      │ ┌ Módulo 1 · Introdução ▓▓▓ 3/3 ─────────────┐│
│ ▸ Intro  │ │ ■ ▶ O que é o Pedido          4min   ✓     ││
│ ▸ Edição │ │ ■ 📄 Manual de campos          —     ✓     ││
│ ▸ Massa  │ └────────────────────────────────────────────┘│
│ ┌donut┐  │ ┌ Módulo 2 · Edição ░░░ 0/4 ─────────────────┐│
│ │ 62% │  │ │ □ ▶ Editar um pedido          6min         ││
│ └─────┘  │ └────────────────────────────────────────────┘│
└──────────┴───────────────────────────────────────────────┘
```

- **Interação "Iniciar jornada":** click → `POST matricula` → botão vira "Continuar", aulas destravam, GABI cumprimenta. Sem modal — ação direta. Toast de sucesso via `addNotification`.
- **Estados:** loading = skeleton TOC + cards; trilha não encontrada = empty + voltar ao catálogo.
- **Dados:** `GET /api/v1/university-gravity/trilhas/:id_trilha` (módulos + aulas + progresso) · `POST /api/v1/university-gravity/trilhas/:id_trilha/iniciar` (cria matrícula).
- **data-testids:** `uni-trilha-detalhe`, `uni-iniciar-jornada`, `uni-modulo-{id_modulo}`, `uni-aula-item-{id_aula}`

---

### T-03 — Player de Aula

- **Rota:** `/university-gravity/academy/aulas/:id_aula`
- **Objetivo:** consumir a aula (vídeo/PDF/texto), marcar conclusão, tirar dúvida com a GABI.
- **Layout:** `PaginaGlobal layout="lista"`, grid `1fr 320px` (conteúdo | GABI)
  - `CabecalhoGlobal` — ícone por tipo · título = título da aula · subtítulo = "Módulo X · Trilha Y" · `acoes`: navegação `Anterior`/`Próxima` (`BotaoGlobal secundario`)
  - **Conteúdo (centro):**
    - `VIDEO` → player embed (16:9) + `conteudo_aula` como URL
    - `DOCUMENT` → visualizador de PDF (`conteudo_aula` = caminho)
    - `TEXT` → corpo renderizado (markdown→HTML), tipografia `.text-body-lg`
    - Abaixo: `BotaoGlobal` **"Marcar como concluída"** (`primario`); quando concluída, vira badge verde "Concluída" + auto-avança opcional
  - **Painel GABI (direita, 320px):** chat contextual da aula — "Pergunte sobre esta aula". Termos-chave no texto podem ter `GabiCampoIconeGlobal` (✦) inline.

```text
┌ Editar um pedido ─────────────────────────────────────────┐
│ ▶ Editar um pedido        [‹ Anterior] [Próxima ›] [GABI] │
│   Módulo 2 · Onboarding Pedido                            │
├────────────────────────────────────┬─────────────────────┤
│ ┌────────────────────────────────┐ │ ✦ GABI              │
│ │        [ vídeo 16:9 ]          │ │ Pergunte sobre esta │
│ └────────────────────────────────┘ │ aula…               │
│ [ Marcar como concluída ]          │ ┌─────────────────┐ │
│                                    │ │ chat            │ │
└────────────────────────────────────┴─────────────────────┘
```

- **Interação:** "Marcar como concluída" → `POST progresso` → +pontos (toast discreto), barra da trilha atualiza, GABI pode sugerir próxima.
- **Estados:** loading do player = skeleton; vídeo/PDF indisponível = empty com retry.
- **Dados:** `GET .../aulas/:id_aula` · `POST .../aulas/:id_aula/concluir` · GABI: `POST /api/v1/university-gravity/gabi/duvida` (proxy → GABI, contexto = id_aula).
- **data-testids:** `uni-player`, `uni-aula-concluir`, `uni-aula-nav-anterior`, `uni-aula-nav-proxima`, `uni-gabi-painel`

---

### T-04 — Avaliação (Quiz)

- **Rota:** `/university-gravity/academy/avaliacoes/:id_avaliacao`
- **Objetivo:** responder o quiz da trilha (nota mínima para aprovar).
- **Layout:** `PaginaGlobal layout="lista"`, coluna central estreita (foco)
  - `CabecalhoGlobal` — ícone `Exam` · título = título da avaliação · subtítulo = "Nota mínima: X% · N questões"
  - **Questões** como cards empilhados: enunciado + alternativas como opções selecionáveis (radio para `MULTIPLE_CHOICE`/`TRUE_FALSE`). Indicador de progresso "Questão 3/10".
  - Rodapé fixo: `BannerRequisitosGlobal` (se faltam respostas) + `BotaoGlobal` **"Enviar avaliação"** (`primario`, desabilitado até responder tudo).
- **Interação:** enviar → calcula nota → grava `TentativaAvaliacao` → redireciona ao Resultado (T-05).
- **Estados:** loading = skeleton; sem questões = empty.
- **Dados:** `GET .../avaliacoes/:id_avaliacao` (questões + alternativas, **sem** marcar a correta) · `POST .../avaliacoes/:id_avaliacao/responder` `{ respostas }` → `{ nota, aprovado, id_tentativa }`.
- **data-testids:** `uni-avaliacao`, `uni-questao-{id_questao}`, `uni-alternativa-{id_alternativa}`, `uni-avaliacao-enviar`

---

### T-05 — Resultado da Avaliação

- **Rota:** `/university-gravity/academy/avaliacoes/:id_avaliacao/resultado`
- **Objetivo:** mostrar nota, aprovado/reprovado, e próximo passo.
- **Layout:** `PaginaGlobal layout="lista"`, conteúdo centralizado
  - **Aprovado:** card de sucesso (verde `--success`), nota grande (`.kpi-value`), `CheckCircle` fill, `BotaoGlobal` **"Ver meu certificado"** → T-06. GABI parabeniza + sugere próxima trilha.
  - **Reprovado:** card âmbar (`--warning`), nota, mensagem amigável, `BotaoGlobal` **"Refazer avaliação"** → T-04. GABI aponta os módulos a revisar.
- **Estados:** loading = skeleton da nota.
- **Dados:** `GET .../tentativas/:id_tentativa` (nota, aprovado, gabarito-resumo opcional).
- **data-testids:** `uni-resultado`, `uni-resultado-nota`, `uni-resultado-aprovado`, `uni-ver-certificado`, `uni-refazer`

---

### T-06 — Meu Certificado

- **Rota:** `/university-gravity/academy/certificados/:id_certificado`
- **Objetivo:** visualizar/baixar o certificado (emitido automaticamente ao aprovar).
- **Layout:** `PaginaGlobal layout="lista"`
  - `CabecalhoGlobal` — ícone `Certificate` · título **"Certificado"** · subtítulo = nome da trilha · `acoes`: `BotaoGlobal` **"Baixar PDF"** (`primario`, `DownloadSimple`)
  - **Pré-visualização do certificado** (card destacado, proporção paisagem): nome do aluno, nome da trilha, nota final, carga horária, data de emissão, **código de validação** (`codigo_validacao_certificado`) com `Copy`.
- **Estados:** loading = skeleton do card; certificado inexistente (não aprovou) = empty + CTA voltar à trilha.
- **Dados:** `GET .../certificados/:id_certificado` · `GET .../certificados/:id_certificado/pdf` (download).
- **data-testids:** `uni-certificado`, `uni-certificado-baixar`, `uni-certificado-codigo`

---

### T-07 — Minha Jornada

- **Rota:** `/university-gravity/minha-jornada`
- **Objetivo:** painel pessoal — trilhas em andamento, concluídas, certificados, pontos/badges.
- **Layout:** `PaginaGlobal layout="lista"`
  - `CabecalhoGlobal` — ícone `Path` · título **"Minha Jornada"** · subtítulo "Seu progresso na Gravity University"
  - `viewToggle` (seletor universal): **Visão geral** (default) | **Certificados** (`TabelaGlobal`)
  - `stats`: `CardEstatisticaGlobal` ×4 — **Pontos**, **Trilhas concluídas**, **Em andamento**, **Certificados**
  - **Visão geral:**
    - Seção "Em andamento": cards de trilha com barra de progresso + "Continuar"
    - Seção "Conquistas": badges (`ConquistaUsuario`) em grid
    - GABI (`ModalGabiCaixaAvisoGlobal`): próxima trilha recomendada
  - **Certificados:** `TabelaGlobal` — colunas: Trilha, Nota, Carga horária, Data de emissão, ação (Ver/Baixar)

```text
┌ Minha Jornada ────────────────────────────────────────────┐
│ 🛣  Minha Jornada              [Visão geral][Certificados] │
│ [★ Pontos: 1.240][✔ 2][▶ 1][🎖 2]                          │
├──────────────────────────────────────────────────────────┤
│ Em andamento                                              │
│  ▶ Onboarding Pedido   ▓▓▓▓▓░░ 62%   [Continuar]          │
│ Conquistas                                               │
│  [🏅 Pedido] [🏅 Primeiros passos]                        │
│ ✦ GABI: "Que tal a trilha de Processo agora?"            │
└──────────────────────────────────────────────────────────┘
```

- **Estados:** loading = skeleton; empty (sem jornada) = UX 10 + CTA "Explorar trilhas".
- **Dados:** `GET /api/v1/university-gravity/minha-jornada` → `{ kpis, em_andamento[], conquistas[], certificados[] }`.
- **data-testids:** `uni-minha-jornada`, `seletor-visao-tab-visao-geral`, `seletor-visao-tab-certificados`, `uni-jornada-kpi-{pontos|concluidas|andamento|certificados}`

---

## 6. Estados globais (todas as telas)

| Estado | Padrão |
|---|---|
| **Loading** | Skeleton dos blocos (nunca tela branca). Spinner `.hs-spin` só para ações pontuais |
| **Empty** | UX 10: ícone gigante opacidade `0.2`, título + subtítulo amigáveis, CTA primária |
| **Erro** | `addNotification({ type: 'error', ... })` via `useShellStore` — nunca toast manual; mensagem humana (memory `feedback_error_messages_user`) |
| **Sem permissão** | Não aplicável no geral (conteúdo aberto, D-003); ações administrativas seguem gating padrão |

---

## 7. Endpoints (resumo — backend a especificar com Coordenador)

| Método | Rota | Tela |
|---|---|---|
| GET | `/api/v1/university-gravity/home` | T-00 |
| GET | `/api/v1/university-gravity/trilhas` | T-01 |
| GET | `/api/v1/university-gravity/trilhas/:id_trilha` | T-02 |
| POST | `/api/v1/university-gravity/trilhas/:id_trilha/iniciar` | T-02 |
| GET | `/api/v1/university-gravity/aulas/:id_aula` | T-03 |
| POST | `/api/v1/university-gravity/aulas/:id_aula/concluir` | T-03 |
| POST | `/api/v1/university-gravity/gabi/duvida` | T-03 (proxy GABI) |
| GET | `/api/v1/university-gravity/avaliacoes/:id_avaliacao` | T-04 |
| POST | `/api/v1/university-gravity/avaliacoes/:id_avaliacao/responder` | T-04 |
| GET | `/api/v1/university-gravity/tentativas/:id_tentativa` | T-05 |
| GET | `/api/v1/university-gravity/certificados/:id_certificado` | T-06 |
| GET | `/api/v1/university-gravity/certificados/:id_certificado/pdf` | T-06 |
| GET | `/api/v1/university-gravity/minha-jornada` | T-07 |

> Toda rota: validação Zod antes do banco; resposta validada por schema Zod no front (Mandamentos 06/09). Rotas compõem no super-servidor de organização (porta 3001).

---

## 8. Checklist por tela (antes do PR)

- [ ] `PaginaGlobal` + `CabecalhoGlobal` (ícone + título = nome da view + subtítulo)
- [ ] Componentes núcleo-global (sem `<select>` nativo, sem toast manual)
- [ ] Tokens CSS (zero hex hardcoded); acento `--ws-accent` (#818cf8) + roxo #a78bfa
- [ ] Botões pill (`BotaoGlobal`); ícones Phosphor `duotone`
- [ ] Loading (skeleton) + Empty (UX 10) + Erro (toast Shell)
- [ ] GABI presente (dúvida contextual no Player; guia de jornada na Home/Jornada)
- [ ] data-testids definidos (seletor universal onde houver pills)
- [ ] i18n em todo texto (`t()`), pt-BR canônico
- [ ] Acessibilidade WCAG 2.1 AA (aria-labels, foco, teclado)

---

> SPECS sujeitas a refino com UX/UI Lead e Coordenador. Implementação segue o padrão dos arquivos canônicos (`DadosTecnicos.tsx` para detalhe/cards; telas de Dashboard/Lista dos produtos para KPIs/tabela).
