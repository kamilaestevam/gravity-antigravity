---
name: antigravity-criacao-telas
description: "Use esta skill sempre que uma tarefa envolver criação de novas telas no Gravity. Define o fluxo ponta-a-ponta de criação e validação (UX 10), os 4 papeis envolvidos (PM, UX/UI Lead, Engenheiro Frontend, Tech Lead), as 5 etapas (discovery, design system, estruturacao modular, implementacao com fallbacks, validacao final) e o checklist de 4 vias antes do merge. Toda nova tela passa por este funil de excelencia antes de entrar em producao."
---

# 🎨 Workflow: Criação e Validação de Novas Telas (UX 10)

Esta diretriz (Skill) define o processo ponta a ponta para a criação de interfaces na Plataforma Gravity. Nenhuma nova tela entra em produção sem passar pelo funil de excelência e pelos crivos rigorosos do nosso design system global.

A expectativa para qualquer nova interface é que ela entregue uma experiência visual **Premium (UX 10)**, utilizando glassmorphism, tipografias ajustadas e micro-interações que passem uma percepção imediata de alto valor ao usuário.

## 👥 A Equipe de Elite (Papéis na Criação)

Cada nova funcionalidade visual exige a colaboração sistêmica dos seguintes papéis operacionais:
1. **Product Manager (PM):** Define a visão de negócio, as necessidades do cliente (Organização/Workspace) e o escopo esperado para a jornada do usuário.
2. **UX/UI Lead:** Evocador do Padrão "UX 10". Responsável pela arquitetura da informação, fidelidade visual, especificação de micro-interações (glow, sombras translúcidas, glass) e coerência com a harmonia da plataforma Gravity.
3. **Engenheiro Frontend / Arquiteto UI:** Transforma os construtos do UX em código eficiente e escalável, utilizando o design system base (`@nucleo` e `@gravity/shell`).
4. **Tech Lead:** Valida as integrações rest, as nuances do GraphQL/Prisma, estados atípicos (carregando, erro limite de API), e a eficiência da árvore de renderização.

## ⚙️ As 5 Etapas de Criação e Validação

### Fase 1: Entendimento e Plantas-Baixas (UX Research & Discovery)
- Validamos o insumo do PM com os casos de uso.
- **Pergunta Chave:** Qual o problema central? Quais os módulos envolvidos (HUB, Store, Configurador)?
- **Prototipação:** Rabiscos mentais ou wireframes focados na hierarquia: Qual será a Hero Section? Como lidar com Listas vs Grids? Quais são as métricas principais a destacar no topo?

### Fase 2: Aplicação do Design System (Standard High-Fidelity)
Neste momento a engenharia une-se à concepção visual:
- O background nunca deve utilizar brancos duros em temas escuros (`var(--color-surface)` indiscriminado). Deve-se aplicar variações sutis e backgrounds radiantes invisíveis (`radial-gradient`), como o ambient-glow.
- **Glassmorphism & Micro-interações:** Qualquer badge, Card de Produto ou botão primário deve oferecer resposta profunda de física (levitação com `translateY`, troca de bordas opacas para bordas luminosas `rgba`).
- **Tipografia Escalonada:** Títulos ganham gradientes prateados sutis (`background-clip: text`) para transmitir requinte. Números de dashboards devem ser imponentes.

### Fase 3: Estruturação Modular (O Código Frontend)
- A adesão aos layouts bases do design system é mandatória. **O uso da `PaginaGlobal` e do `CabecalhoGlobal` é obrigatório** caso a interface represente uma tela ou área logada dentro do Configurador.
- **Menu e Header System:** Barra superior (UsuarioGlobal, Notificações, Buscar) e Menus laterais (MenuLateralGlobal) devem vir empacotados pelo Shell/WorkspaceLayout; eles não podem ser reconstruídos por tela.
- Nada de invólucros aleatórios para listagens: utilize fatias padronizadas como a `TabelaGlobal`, `CardBasicoGlobal` ou Componentes de Grade com hover premium já consolidados (`.hs-product-grid`).

### Fase 4: Implementação, Tratamentos & Fallbacks
- A tela é escrita no código.
- **Empty States (Estados Vazios):** Uma tela sem dados jamais deve ser frustrante. O Empty State UX 10 é envolvente (ex: background semi-transparente curvo com outline desvanecido, ícones gigantes opacos `0.2` e chamadas instigantes).
- **Loading States:** Abandone saltos bruscos ou páginas brancas de loading. Substitua pela indicação visual em `.hs-spin` ou Skeleton preload.
- Tratamento de erro elegante obrigatoriamente ligado ao `ToastContainer` do Shell Global.

### Fase 5: Validação Final e QA (Quality Assurance)
Antes de realizar o push para Master, aplique o seguinte checklist de 4 vias:

- [ ] **1. Verificação de Consistência e Layout:** As margens laterais e top paddings estão respeitando 100% as definições das outras páginas (Padrão de layout/paginação)? A página respira?
- [ ] **2. Teste de Tooltips (Dicas de UX):** A interface implementa as caixas do `TooltipGlobal` que exibem detalhes explicativos caso o usuário ative a ajuda na engrenagem? 
- [ ] **3. Hardcodes Zerados:** Removeu todas as cores de hexadecimais puros que não são padrão? Garantiu uso dos tokens CSS como `var(--ws-accent)`, `var(--color-text-muted)`?
- [ ] **4. Comportamento Real-Time:** Os fluxos assíncronos não quebram o visual dinamicamente? Animações fluem em suaves `<300ms` cúbicos (`cubic-bezier`)?

---

## 📋 Padrão de Sistema — Edição em Massa via Linha Expandida

> **Cânone documentado em 2026-05-05** após decisão do dono. Quando uma tela mestre tem itens filhos que precisam ser ligados/desligados em massa (vínculos, ativações, habilitações), **este é o padrão único** — replicado fielmente, sem reinventar a roda.

### Quando aplicar

Sempre que a relação for **(Entidade-Pai) × N (Entidade-Filho)** com bind/unbind ou habilitar/bloquear granular. Exemplos:

- **Assinaturas × Workspaces** — produto contratado, habilitar/bloquear nos workspaces (referência canônica)
- **Usuários × Workspaces** — usuário Standard/Fornecedor, vincular/desvincular workspaces
- Empresas × Parceiros (futuro), produtos × módulos (futuro), etc.

### Estrutura obrigatória

| Camada | Componente / Pattern |
|---|---|
| **Estado** | `edicoesPendentes: Record<idPai, Record<idFilho, { tipo: 'toggle'; ativo: boolean }>>` (rascunho local) |
| **Estado** | `selecaoPorEntidade: Record<idPai, idFilho[]>` (multi-select para ações em massa) |
| **Estado** | `salvandoEdicoes: Set<idPai>` (lock de save por entidade) |
| **Handler** | `aoStagedToggle(idPai, idFilho)` — toggle individual; idempotente (segundo clique remove pendência) |
| **Handler** | `aoStagedAcaoEmMassa(idPai, idsFilho[], 'habilitar' \| 'bloquear')` — aplica ação a todos selecionados; pula filhos já no estado-alvo |
| **Handler** | `descartarEdicoes(idPai)` — limpa pendências e seleção |
| **Handler** | `salvarEdicoes(idPai)` — persiste, refetch antes de descartar pendências (evita flicker) |
| **Helper** | `efetivoPorFilho(idPai, idFilho)` — combina servidor + pendência |
| **Toolbar do expandido** | (1) Título da seção; (2) Botões de ação em massa quando seleção > 0; (3) Pill "X alterações pendentes" + Descartar/Salvar quando pendentes > 0 |
| **TabelaGlobal interna** | `selecionadosExternos`, `onSelecionadosChange`, `bannerSelecaoCustom` (pill "X selecionados" + "Selecionar todos da tabela" / "Limpar seleção") |
| **Coluna de ação** | Ícone Play/Pause ou equivalente — toggle individual sem precisar de seleção |

### Vocabulário

**Estrutura é única, vocabulário é fiel ao domínio.** Cada tela usa os termos do seu DDD:

| Tela | Status | Ação |
|---|---|---|
| Assinaturas (produto × workspace) | `HABILITADO` / `BLOQUEADO` | Habilitar / Bloquear |
| Usuários (usuário × workspace) | `HABILITADO` / `BLOQUEADO` | Habilitar / Bloquear |
| Futuras telas | seguir padrão Habilitar/Bloquear quando aplicável; usar termos DDD próprios se conceitualmente diferente |

### Backend

- **Modelo per-item** (`PUT /:pai/:item` com body `{ ativo }`): para itens com vida própria (billing, ativação independente). Frontend dispara N `Promise.all` no save.
- **Modelo replace-all** (`PUT /:pai/items` com array): para conjuntos coesos (vínculos do usuário são "uma decisão"). Atomicidade via `$transaction(deleteMany + createMany)`. **Aceitar array vazio** quando "revogar todos" for estado válido — defesa em camada bloqueia tipos especiais (Mand. 04).
- A escolha do modelo é decisão por contexto, não premissa do padrão UX.

### Mandamentos a respeitar

- **Mand. 04** — tipos com acesso implícito (Master/SAdmin/Admin) **nunca** entram no editor; renderizam panel "Acesso implícito" read-only. Backend bloqueia defensivamente.
- **Mand. 06 + 09** — Zod bilateral. Afrouxar regras só no mesmo PR que atualiza ambos os lados.
- **Mand. 08** — gating UI via `usePodeEditarUsuario` (ou hook análogo). Anti-self-edit por id_usuario. Sem fallbacks silenciosos.

### Referências canônicas

- [Assinaturas.tsx](../../../servicos-global/configurador/src/pages/configurador/Assinaturas.tsx) — implementação per-item (toggle independente por workspace, N requests no save via `Promise.all`)
- [Usuarios.tsx](../../../servicos-global/configurador/src/pages/configurador/Usuarios.tsx) — implementação replace-all (Configurador, escopo da org logada)
- [UsuariosAdmin.tsx](../../../servicos-global/configurador/src/pages/admin/UsuariosAdmin.tsx) — implementação replace-all cross-org (Admin Panel, lazy-load via `GET /v1/admin/organizacoes/:id/workspaces`)

### Componente compartilhado

Em **2026-05-05** o sub-component `ExpandidoEditorVinculos` foi extraído de `Usuarios.tsx` para [src/components/expandido-editor-vinculos](../../../servicos-global/configurador/src/components/expandido-editor-vinculos/index.tsx) e é reusado pelas duas telas que editam vínculos `usuario × workspace`. O componente é **agnóstico de gating** — espera prop `podeEditar: boolean` calculada pelo caller, porque cada tela tem regra distinta:

| Caller | Cálculo de `podeEditar` |
|---|---|
| `Usuarios.tsx` | `usePodeEditarUsuario(alvo).podeAlterarVinculosWorkspace && !ehProprio` (Mand. 08) |
| `UsuariosAdmin.tsx` | `perfilLogado === 'Super Admin'` (opção α — apenas SAdmin edita cross-org) |

Cada caller mantém um wrapper local (`ExpandidoEditorVinculosConfigurador`, etc.) que aplica seu gating e instancia o componente compartilhado.

### Quando extrair para hook genérico

Com 3 implementações independentes (Assinaturas per-item, Usuarios replace-all, UsuariosAdmin replace-all cross-org), **a próxima evolução natural é extrair `useEdicoesPendentesPorEntidade<P, F>`** para encapsular o estado pendente + handlers (`aoStagedToggle`, `aoStagedAcaoEmMassa`, `descartarEdicoes`, `salvarEdicoes`). Postergado até a 4ª tela aparecer (EmpresasEParceiros é a candidata) — duas implementações replace-all (Usuarios + UsuariosAdmin) compartilharam por enquanto via componente, não via hook.

---

> **Diretiva Imutável do Agente:** Esta formatação de processo (SKILL) deve ser acionada sempre que uma nova tela for demandada do zero (ex: *"Crie o dashboard da funcionalidade X" ou "Adeque a tela de relatórios"*). Use as guidelines listadas aqui para arquitetar as soluções sem desvios do refinamento UX 10.
