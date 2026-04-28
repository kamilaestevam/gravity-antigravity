---
name: antigravity-mapa-paginas
description: Convenção técnica do inventário de páginas frontend do Gravity — define como cada página React é catalogada na aba "6. mapa-paginas" da planilha DDD (URL, título, arquivo, componente, tipo de view, autenticação, patente mínima, rotas API consumidas, modais abertos). Use ao registrar página nova, auditar conformidade DDD ou propor renomeação. Não toca em código — só lê código para cruzar e só escreve na planilha após aprovação.
---

# Convenção Técnica — Mapa de Páginas

> ⚠️ **REGRAS ABSOLUTAS:** os nomes (URL, arquivo, componente, título) seguem [`lei/ddd-nomenclatura`](../../lei/ddd-nomenclatura/SKILL.md). O padrão de criação de tela mora em [`ux/criacao-telas`](../../../ux/criacao-telas/SKILL.md). As rotas API consumidas fazem cruzamento com [`mapa-rotas`](../mapa-rotas/SKILL.md).
> Esta skill **operacionaliza** o inventário de páginas — **não redefine** naming nem padrão visual.

---

## Princípio fundamental

A aba **`6. mapa-paginas`** é o inventário de **toda página React do monorepo** — uma linha por componente de tela montado em rota (`<Route element={...}>`). Cada linha cruza implementação real (arquivo, componente, URL atual) com a forma DDD (URL canônica, arquivo renomeado, título correto), classificação de view, controle de acesso (autenticação + patente mínima) e dependências (rotas API consumidas, modais abertos). **É a fonte da verdade do que existe na UI versus o que deveria existir.** Antes de criar, renomear ou auditar qualquer página, consulte esta aba.

---

## Estrutura obrigatória

Cada linha tem 23 colunas. A relação chave é:

```
Local + Produto Gravity  →  Arquivo (path .tsx)  →  Componente (PascalCase)
                                          ↓ (Router do produto)
                                      URL rota - Atual
                                          ↓ (ddd-nomenclatura + ux/criacao-telas)
        URL DDD  +  Arquivo DDD  +  Componente DDD  +  Titulo DDD
```

| # | Coluna | Conteúdo | Fonte |
|---|---|---|---|
| 1 | `Local` | `Organizacao` \| `Produto` \| `Configurador` \| `Marketplace` | código |
| 2 | `URL rota - Atual` | path como aparece no `<Route path="...">` (ex: `cotacoes/:id`) | código |
| 3 | `URL rota - DDD` | path canônico DDD (ex: `cotacoes/:id_cotacao`) | esta skill |
| 4 | `Explicação` | 1 frase do que a tela faz para o usuário final | esta skill |
| 5 | `Titulo exibido - Atual` | string mostrada no `<h1>` ou no breadcrumb (ex: `Cambios`) | código |
| 6 | `Titulo exibido - DDD` | título canônico (= nome da view; ver REGRA 4) | esta skill |
| 7 | `Nome do arquivo` | nome do `.tsx` (ex: `DetalheCorretora.tsx`) | código |
| 8 | `Nome do arquivo - DDD` | nome canônico (PascalCase, sem typo, alinhado ao componente) | esta skill |
| 9 | `Nome do componente` | identificador exportado (ex: `DetalheCorretora`) | código |
| 10 | `Nome do componente - DDD` | canônico (= arquivo sem `.tsx`) | esta skill |
| 11 | `Produto Gravity` | slug do produto (ex: `pedido`, `bid-cambio`, `Configurador`) | código |
| 12 | `Area` | `Organizacao` \| `Configurador` \| `Admin` \| `Marketing` | esta skill |
| 13 | `Tipo de view` | enum fechado — ver REGRA 3 | esta skill |
| 14 | `Breadcrumb` | trilha textual (ex: `Pedidos › Detalhe`) | esta skill |
| 15 | `Autenticacao` | `Logado` \| `Publica` | código |
| 16 | `Patente minima` | `tipo_usuario` mínima (EN UPPER_SNAKE — REGRA 7) | esta skill + RBAC |
| 17 | `Rotas de API consumidas` | rotas chamadas, separadas por ` \| ` | código (grep) |
| 18 | `Models lidos (heuristico)` | models Prisma derivados das rotas consumidas | cruzamento aba 3 |
| 19 | `Modais/Drawers abertos` | nomes dos componentes modais/drawers abertos pela tela | código (grep) |
| 20 | `E mobile-ready?` | `Sim` \| `Parcial` \| `Nao` | esta skill |
| 21 | `Arquivo` | path completo do `.tsx` (ex: `produto/pedido/client/src/pages/...`) | código |
| 22 | `Status DDD` | `OK` \| `RENOMEAR` \| `DEPRECAR` \| `NOVA` | esta skill |
| 23 | `Observacoes` | qualquer divergência ou nota técnica | esta skill |

---

## Regras

1. **Uma linha por componente de tela montado em rota.** Layouts (`<Outlet/>`) ocupam linha própria com `Tipo de view = Layout`. Componentes reutilizáveis que **não** são telas vão para a aba `9. Componentes Locais`, não aqui.

2. **`URL rota - Atual` é literal.** Copia exatamente como aparece no `<Route path="...">`, com ou sem barra inicial, com `:param` como o código declara.
   - ❌ "normalizar" `cotacoes/:id` para `/cotacoes/:id` na coluna Atual
   - ✅ Atual: `cotacoes/:id` | DDD: `cotacoes/:id_cotacao`

3. **`Tipo de view` é um enum fechado de 9 valores** (extraídos da realidade da planilha):
   - `Layout` — wrapper com `<Outlet/>` (sem conteúdo próprio)
   - `Lista` — tabela/grid principal de uma entidade
   - `Detalhe` — tela de uma instância (`/:id_<entidade>`)
   - `Dashboard` — agregações, gráficos, KPIs
   - `Kanban` — board com colunas arrastáveis
   - `Formulario` — formulário standalone (criar/editar fora de modal)
   - `Configuração` — tela de settings de uma feature
   - `Modal` — componente que monta `<Dialog>`/`<Drawer>` como tela inteira (raro; modais reais vão para aba `7. Modais`)
   - `Autenticação` — login, signup, recuperação
   - ❌ inventar (`Wizard`, `Stepper`, `Editor`, `Workflow`) — se precisar de um novo tipo, **trava e pergunta**.

4. **`Titulo exibido - DDD` = nome da view, não nome do produto** (memória `feedback_page_title_convention`):
   - ✅ `Lista` (na tela de pedidos kanban: `Kanban`; dashboard: `Dashboard`)
   - ❌ `Pedidos` (nome do produto na barra de título — proibido)
   - Exceção: telas públicas (Marketplace) e telas de Configurador master usam título descritivo (`Checkout`, `Faturas`).

5. **`Nome do arquivo - DDD` = `Nome do componente - DDD` + `.tsx`.** Sempre PascalCase, sem typo, alinhado ao componente exportado.
   - Padrões observados na planilha (manter):
     - Sufixo `Admin` para telas do painel master Configurador (`DeployAdmin`, `FinanceiroAdmin`)
     - Sufixo `Detalhe` para telas de instância (`DetalheCorretora` → cuidado: convenção atual mistura prefixo e sufixo)
     - Prefixo `Modal` apenas para componentes modais (não use em página de tela inteira)
   - ❌ `TenantDetail.tsx` → ✅ `OrganizacaoDetalhe.tsx` (DDD: substituir `Tenant` por `Organizacao`, EN por PT, ordem entidade-primeiro inversa do api-design — telas usam `<Entidade><Tipo>`)
   - ❌ `MetricasGeminiAdmin.tsx` → ✅ `MetricasLLMAdmin.tsx` (Gemini é fornecedor; LLM é o domínio)

6. **`Local`, `Area` e `Produto Gravity` são vocabulários fechados:**

   | Local | Area | Quando |
   |---|---|---|
   | `Organizacao` | `Organizacao` | tela em `servicos-global/organizacao/<servico>/client/` |
   | `Produto` | (vazio) ou nome do agrupamento | tela em `produto/<produto>/client/` |
   | `Configurador` | `Configurador` ou `Admin` | tela em `servicos-global/configurador/src/pages/{configurador,admin}/` |
   | `Marketplace` | `Marketing` | tela pública em `servicos-global/marketplace/` |

   `Produto Gravity` é o slug da pasta (kebab-case: `pedido`, `bid-cambio`, `nf-importacao`, `simula-custo`) **ou** `Configurador` quando `Local = Configurador`.

7. **`Autenticacao` é binária:** `Logado` (JWT Clerk obrigatório) ou `Publica` (sem auth — só Marketplace e portais públicos como `portal/public/responder/:token`). **Nunca** combinar.

8. **`Patente minima` em EN UPPER_SNAKE** (REGRA 7 do `ddd-nomenclatura`). Mesmo vocabulário fechado de `mapa-rotas`: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `STANDARD`, `VIEWER`, `PUBLIC`. Telas de `Area = Admin` exigem `SUPER_ADMIN` (gravity_admin = true).

9. **`Rotas de API consumidas` cruza com aba `5. mapa-rotas`.** Lista as rotas chamadas pela tela (via `fetch`/SDK), separadas por ` | `. Cada rota listada **deve existir** na aba 5. Se não existir, é achado 🔴 (rota fantasma ou tela quebrada). Use **a coluna Atual da rota**, não a DDD — esta coluna espelha o código atual.

10. **`Modais/Drawers abertos` cruza com aba `7. Modais`.** Lista os componentes modais que esta tela abre. Mesma disciplina de cruzamento da regra 9.

11. **`E mobile-ready?` é tridicotômico:** `Sim` (responsivo testado), `Parcial` (funciona mas com perdas), `Nao` (desktop-only). Default conservador é `Nao` quando não auditado — **não deixar vazio**.

12. **`Status DDD` é o mesmo enum fechado de outras skills:** `OK`, `RENOMEAR`, `DEPRECAR`, `NOVA`. Quando 1 tela atual deve virar N DDD (split de página) ou N viram 1 (merge), reportar com 1 linha por destino + linha origem como `DEPRECAR`.

13. **Páginas órfãs** (`.tsx` em `pages/` sem linha) e **páginas fantasmas** (linha sem `.tsx`) são **achados críticos** 🔴.

---

## Conversão: Página real → linha completa da planilha

| Passo | Regra | Exemplo |
|---|---|---|
| 1 | Localizar `.tsx` em `*/client/src/pages/**` | `produto/bid-cambio/client/src/pages/DetalheCorretora.tsx` |
| 2 | Ler `export default function <Componente>` | `Nome do componente = DetalheCorretora` |
| 3 | Localizar `<Route path="..." element={<DetalheCorretora/>}/>` no router do produto | `URL rota - Atual = corretoras/:id` |
| 4 | Aplicar [`ddd-nomenclatura`](../../lei/ddd-nomenclatura/SKILL.md) ao param | `URL DDD = corretoras/:id_corretora` |
| 5 | Classificar em `Tipo de view` (enum REGRA 3) | path `:id` + componente "Detalhe…" → `Detalhe` |
| 6 | Definir `Titulo DDD` = nome da view (REGRA 4) | `Titulo DDD = Detalhe` |
| 7 | Detectar `Autenticacao` (presença de `<RequireAuth>`/Clerk) e `Patente minima` (cruzamento RBAC) | `Logado` + `STANDARD` |
| 8 | Listar rotas API consumidas (grep `fetch(` / `api.`) e cruzar com aba 5 | `/api/v1/bid-cambio/corretoras/:id` |
| 9 | Listar modais/drawers abertos (grep `<*Modal`/`<*Drawer`) | `ModalEditarCorretora` |
| 10 | Comparar Atual vs DDD: igual → `OK`; diferente → `RENOMEAR` | `Status DDD = RENOMEAR` |

---

## Exemplo completo

Página em `produto/bid-cambio/client/src/pages/DetalheCorretora.tsx` montada com `<Route path="corretoras/:id" element={<DetalheCorretora/>}/>` dentro do shell autenticado do produto, consumindo `GET /api/v1/bid-cambio/corretoras/:id` e abrindo `ModalEditarCorretora`:

| Coluna | Valor |
|---|---|
| Local | `Produto` |
| URL rota - Atual | `corretoras/:id` |
| URL rota - DDD | `corretoras/:id_corretora` |
| Explicação | Mostra o cadastro completo de uma corretora (dados, contatos, ranking) e permite editar. |
| Titulo exibido - Atual | (vazio) |
| Titulo exibido - DDD | `Detalhe` |
| Nome do arquivo | `DetalheCorretora.tsx` |
| Nome do arquivo - DDD | `DetalheCorretora.tsx` |
| Nome do componente | `DetalheCorretora` |
| Nome do componente - DDD | `DetalheCorretora` |
| Produto Gravity | `bid-cambio` |
| Area | (vazio — Local=Produto não exige Area) |
| Tipo de view | `Detalhe` |
| Breadcrumb | `Corretoras › Detalhe` |
| Autenticacao | `Logado` |
| Patente minima | `STANDARD` |
| Rotas de API consumidas | `/api/v1/bid-cambio/corretoras/:id` |
| Models lidos (heuristico) | `Corretora` |
| Modais/Drawers abertos | `ModalEditarCorretora` |
| E mobile-ready? | `Parcial` |
| Arquivo | `produto/bid-cambio/client/src/pages/DetalheCorretora.tsx` |
| Status DDD | `RENOMEAR` |
| Observacoes | URL Atual usa `:id` genérico — DDD exige `:id_corretora`. |

**Achados a reportar:**
- 🟡 `RENOMEAR`: param `:id` → `:id_corretora` (REGRA `ddd-nomenclatura`)
- 🟡 `Titulo exibido - Atual` vazio — front não renderiza `<h1>`; padronizar para `Detalhe` (REGRA 4)
- 🟢 rota `/api/v1/bid-cambio/corretoras/:id` consumida ainda usa o slug `bid-cambio/` no path — cruzar com aba 5 e marcar a rota como `RENOMEAR` lá também

---

## Checklist de validação (aplicar a cada linha da aba `6. mapa-paginas`)

- [ ] `Local` ∈ {`Organizacao`, `Produto`, `Configurador`, `Marketplace`}?
- [ ] `URL rota - Atual` literal ao código (sem reescrita)?
- [ ] `URL rota - DDD` segue [`ddd-nomenclatura`](../../lei/ddd-nomenclatura/SKILL.md) (param `:id_<entidade>`)?
- [ ] `Tipo de view` ∈ {`Layout`, `Lista`, `Detalhe`, `Dashboard`, `Kanban`, `Formulario`, `Configuração`, `Modal`, `Autenticação`}?
- [ ] `Titulo exibido - DDD` é o **nome da view**, não o nome do produto?
- [ ] `Nome do arquivo - DDD` = `Nome do componente - DDD` + `.tsx`?
- [ ] `Produto Gravity` corresponde a uma pasta real do monorepo?
- [ ] `Autenticacao` ∈ {`Logado`, `Publica`} (nunca combinar)?
- [ ] `Patente minima` em EN UPPER_SNAKE (REGRA 7)? Telas Admin = `SUPER_ADMIN`?
- [ ] Cada rota em `Rotas de API consumidas` existe na aba `5. mapa-rotas`?
- [ ] Cada modal em `Modais/Drawers abertos` existe na aba `7. Modais`?
- [ ] `E mobile-ready?` ∈ {`Sim`, `Parcial`, `Nao`} (não deixar vazio)?
- [ ] `Status DDD` ∈ {`OK`, `RENOMEAR`, `DEPRECAR`, `NOVA`}?
- [ ] Não há página órfã (`.tsx` sem linha) ou fantasma (linha sem `.tsx`)?

---

## Limites duros

- ❌ Editar código (`.tsx`, `.ts`, router)
- ❌ Renomear arquivo no repositório (refactor é fora do escopo)
- ❌ Decidir patente mínima sem cruzar com RBAC do Configurador
- ❌ Inventar valor fora dos enums fechados (`Tipo de view`, `Local`, `Area`, `Status DDD`)
- ❌ Sobrescrever o `.xlsx` original
- ✅ Auditar a aba `6. mapa-paginas`
- ✅ Propor preenchimento/correção de células após aprovação

---

## Skills vizinhas (referência apenas)

- [`lei/ddd-nomenclatura`](../../lei/ddd-nomenclatura/SKILL.md) — nomes de URL, arquivo, componente, param
- [`ux/criacao-telas`](../../../ux/criacao-telas/SKILL.md) — padrão inviolável de criação/replicação de tela
- [`convencao-tecnica/mapa-rotas`](../mapa-rotas/SKILL.md) — cruzamento da coluna `Rotas de API consumidas`
- [`seguranca/permissoes`](../../../seguranca/permissoes/SKILL.md) — patentes (`tipo_usuario`)
- Aba `7. Modais` — cruzamento da coluna `Modais/Drawers abertos`
- Aba `9. Componentes Locais` — destino de componentes que **não** são telas
