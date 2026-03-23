# Plano de Testes E2E — nucleo-global (TabelaGlobal, ModalGlobal, SelectGlobal)

**Data:** 2026-03-22
**Versão:** 1.0
**Status:** aguardando aprovação do dono

---

## Escopo

**Dentro do escopo:**
- `TabelaGlobal` — todos os comportamentos de CRUD local, filtros, paginação, exportação, seleção em massa e ordenação
- `ModalGlobal` — abertura, fechamento (X / ESC / overlay), abas, formulários internos
- `SelectGlobal` — abertura, seleção, busca interna, multi-select, grupos, chips
- Estados de interface: loading skeletons, empty state, error states

**Fora do escopo:**
- Chamadas de API / servidor (nucleo-global é 100% client-side)
- Tenant isolation (não aplicável — nucleo-global não tem acesso a banco)
- Auth / JWT (não aplicável)

---

## Entidades testadas

| Componente | Telas/contextos cobertos |
|---|---|
| `TabelaGlobal` | Qualquer tela com listagem + CRUD (simulação: página de produtos) |
| `ModalGlobal` | Modal de criação, modal de edição, modal de confirmação |
| `SelectGlobal` | Campos de seleção simples, multi-select, select com grupos |

---

## Categorias cobertas

- [x] CRUD
- [x] Filtros e Busca
- [x] Selects e Dropdowns
- [x] Importação e Exportação
- [x] Navegação e Layout
- [x] Modais e Formulários
- [x] Estados de Interface
- [x] Operações em Massa
- [x] Visualizações
- [x] Validação Visual (Percy)
- [x] Testes específicos do produto — não aplicável para componentes puros (ver justificativa)

---

## Fluxos detalhados

### Fluxo 1 — Exibição de tabela com dados
**Categoria:** CRUD / Visualizações
**Pré-condição:** página com TabelaGlobal montada com 30 registros de teste
**Passos:**
1. Navegar para a página de listagem
2. Verificar que os cabeçalhos de colunas estão visíveis
3. Verificar que 20 registros são exibidos (paginação padrão)
4. Verificar que a informação "1–20 de 30" aparece na paginação
**Resultado esperado:** tabela renderizada corretamente com dados e paginação funcional
**Critério de falha:** tabela vazia, dados ausentes ou paginação incorreta

---

### Fluxo 2 — Busca global na tabela
**Categoria:** Filtros e Busca
**Pré-condição:** tabela com 30 registros, campo de busca visível
**Passos:**
1. Clicar no campo de busca
2. Digitar o nome exato de um registro (ex: "Produto A1")
3. Aguardar atualização da lista
4. Verificar que apenas o registro correspondente aparece
5. Limpar o campo de busca
6. Verificar que a lista retorna ao estado original (30 registros)
**Resultado esperado:** filtragem em tempo real, sem chamada de servidor
**Critério de falha:** resultado incorreto, lista não restaurada, erro no console

---

### Fluxo 3 — Filtro por tipo select
**Categoria:** Filtros e Busca
**Pré-condição:** tabela com filtro de "Status" configurado (ativo/inativo)
**Passos:**
1. Clicar em "Filtros" para abrir o painel
2. Selecionar "Ativo" no filtro de status
3. Verificar que todos os registros exibidos têm badge verde (ativo)
4. Verificar que não há badges vermelhas (inativo) na lista
5. Selecionar "Inativo"
6. Verificar inversão dos badges
7. Clicar em "Limpar filtros"
8. Verificar que a lista volta ao estado original (mistura de status)
**Resultado esperado:** filtragem correta por campo exato
**Critério de falha:** registros errados exibidos, limpar não funciona

---

### Fluxo 4 — Paginação
**Categoria:** Filtros e Busca / Visualizações
**Pré-condição:** tabela com 35 registros, itensPorPagina=10
**Passos:**
1. Verificar que a página 1 exibe "1–10 de 35"
2. Clicar no botão "›" (próxima)
3. Verificar "11–20 de 35"
4. Clicar em "»" (última)
5. Verificar "31–35 de 35"
6. Verificar que o botão "›" está desabilitado
7. Clicar em "«" (primeira)
8. Verificar retorno à página 1
**Resultado esperado:** navegação de páginas funcional e indicadores corretos
**Critério de falha:** contador errado, botão habilitado quando deveria estar desabilitado

---

### Fluxo 5 — Exportação CSV
**Categoria:** Importação e Exportação
**Pré-condição:** tabela com 10 registros, exportConfig com formato csv
**Passos:**
1. Clicar no botão "↓ CSV"
2. Verificar que o download iniciou
3. Abrir o arquivo baixado
4. Verificar que a primeira linha contém os cabeçalhos das colunas
5. Verificar que os dados estão corretos e completos
**Resultado esperado:** arquivo CSV válido com todos os dados visíveis
**Critério de falha:** arquivo não baixado, dados corrompidos ou incompletos

---

### Fluxo 6 — Exportação CSV com filtro ativo
**Categoria:** Importação e Exportação
**Pré-condição:** tabela com 20 registros, filtro de status ativo aplicado (10 ativos)
**Passos:**
1. Aplicar filtro: status = "ativo"
2. Verificar que 10 registros aparecem
3. Clicar em "↓ CSV"
4. Abrir o arquivo
5. Verificar que o CSV contém apenas os 10 registros filtrados
**Resultado esperado:** exportação reflete exatamente o estado filtrado
**Critério de falha:** exporta mais registros do que o filtro mostra

---

### Fluxo 7 — Exportação JSON
**Categoria:** Importação e Exportação
**Pré-condição:** tabela com 5 registros, exportConfig com formato json
**Passos:**
1. Clicar no botão "↓ JSON"
2. Verificar que o download iniciou
3. Abrir o arquivo JSON
4. Verificar que o JSON é válido e contém um array de 5 objetos
**Resultado esperado:** JSON válido com estrutura de dados correta
**Critério de falha:** JSON inválido, estrutura incorreta

---

### Fluxo 8 — Ordenação de coluna
**Categoria:** Visualizações
**Pré-condição:** tabela com dados variados, coluna "Nome" com ordenável=true
**Passos:**
1. Clicar no cabeçalho "Nome"
2. Verificar que os registros estão em ordem alfabética crescente (A-Z)
3. Verificar ícone "↑" no cabeçalho
4. Clicar novamente em "Nome"
5. Verificar que os registros estão em ordem decrescente (Z-A)
6. Verificar ícone "↓" no cabeçalho
**Resultado esperado:** ordenação local bidirecional funcionando
**Critério de falha:** ordem incorreta, ícone ausente, chamada ao servidor

---

### Fluxo 9 — Seleção em massa
**Categoria:** Operações em Massa
**Pré-condição:** tabela com seleção habilitada e 20 registros
**Passos:**
1. Clicar no checkbox de uma linha
2. Verificar que a linha fica destacada
3. Verificar que o contador "1 selecionado" aparece
4. Clicar no checkbox de mais 2 linhas
5. Verificar "3 selecionados"
6. Clicar no checkbox global (select-all)
7. Verificar que todos os 20 registros ficam selecionados
8. Clicar novamente no select-all
9. Verificar que todos ficam desmarcados
**Resultado esperado:** seleção individual e em massa funcionando
**Critério de falha:** checkbox não funciona, contador incorreto

---

### Fluxo 10 — Ação de linha (editar/deletar)
**Categoria:** CRUD
**Pré-condição:** tabela com acoesLinha configurada (Editar, Deletar)
**Passos:**
1. Localizar uma linha na tabela
2. Clicar no botão "Editar" da linha
3. Verificar que o callback é chamado com os dados corretos da linha
4. Clicar no botão "Deletar"
5. Verificar que o callback é chamado com os dados corretos
**Resultado esperado:** callbacks disparados com o registro correto
**Critério de falha:** callback não disparado, dados errados passados

---

### Fluxo 11 — Abrir modal e fechar por X
**Categoria:** Modais e Formulários
**Pré-condição:** página com botão que abre ModalGlobal
**Passos:**
1. Clicar no botão "Abrir modal"
2. Verificar que o modal aparece com overlay
3. Verificar que o título está correto
4. Verificar que o conteúdo está correto
5. Clicar no botão X
6. Verificar que o modal fecha e o overlay desaparece
**Resultado esperado:** modal abre e fecha corretamente
**Critério de falha:** modal não abre, não fecha, overlay permanece

---

### Fluxo 12 — Fechar modal por ESC
**Categoria:** Modais e Formulários
**Pré-condição:** modal aberto
**Passos:**
1. Abrir o modal
2. Verificar que o modal está visível
3. Pressionar a tecla ESC
4. Verificar que o modal fecha
**Resultado esperado:** modal fecha ao pressionar ESC
**Critério de falha:** modal permanece aberto após ESC

---

### Fluxo 13 — Fechar modal clicando no overlay
**Categoria:** Modais e Formulários
**Pré-condição:** modal aberto com fecharAoClicarOverlay=true
**Passos:**
1. Abrir o modal
2. Clicar na área escura ao redor do modal (overlay)
3. Verificar que o modal fecha
**Resultado esperado:** modal fecha ao clicar no overlay
**Critério de falha:** modal não fecha, overlay não detecta clique

---

### Fluxo 14 — Navegação entre abas do modal
**Categoria:** Modais e Formulários
**Pré-condição:** ModalGlobal com 3 abas configuradas
**Passos:**
1. Abrir o modal
2. Verificar que a primeira aba está ativa (aria-selected=true)
3. Verificar que o conteúdo da primeira aba é exibido
4. Clicar na segunda aba
5. Verificar que a segunda aba fica ativa
6. Verificar que o conteúdo da segunda aba é exibido
7. Clicar na terceira aba
8. Verificar conteúdo da terceira aba
**Resultado esperado:** todas as abas navegáveis com conteúdo correto
**Critério de falha:** aba não ativa, conteúdo errado exibido

---

### Fluxo 15 — Formulário em modal — validação
**Categoria:** Modais e Formulários
**Pré-condição:** modal com formulário de criação de registro
**Passos:**
1. Abrir o modal de criação
2. Não preencher nenhum campo
3. Clicar em "Salvar"
4. Verificar que mensagens de erro aparecem nos campos obrigatórios
5. Preencher todos os campos obrigatórios
6. Clicar em "Salvar"
7. Verificar que o modal fecha e o registro aparece na tabela
**Resultado esperado:** validações exibidas, criação bem-sucedida
**Critério de falha:** formulário submete sem validar, erros não aparecem

---

### Fluxo 16 — SelectGlobal — seleção simples
**Categoria:** Selects e Dropdowns
**Pré-condição:** campo SelectGlobal com lista de opções visível
**Passos:**
1. Verificar que o placeholder é exibido
2. Clicar no campo select
3. Verificar que o dropdown abre com todas as opções
4. Confirmar que não existe elemento `<select>` nativo no DOM
5. Clicar na primeira opção
6. Verificar que o dropdown fecha
7. Verificar que o rótulo da opção selecionada aparece no campo
**Resultado esperado:** seleção funcional sem elemento nativo
**Critério de falha:** `<select>` nativo no DOM, dropdown não fecha, valor incorreto

---

### Fluxo 17 — SelectGlobal — busca interna
**Categoria:** Selects e Dropdowns
**Pré-condição:** SelectGlobal com buscavel=true e 10+ opções
**Passos:**
1. Clicar no campo select para abrir o dropdown
2. Verificar que o campo de busca aparece automaticamente com foco
3. Digitar parte do nome de uma opção
4. Verificar que apenas as opções que contêm o texto aparecem
5. Limpar a busca
6. Verificar que todas as opções voltam a aparecer
7. Digitar texto que não corresponde a nenhuma opção
8. Verificar a mensagem "Nenhuma opção encontrada"
9. Selecionar uma opção filtrada
**Resultado esperado:** busca funciona, filtra corretamente, "não encontrado" exibido
**Critério de falha:** opções não filtradas, busca não funciona, mensagem não aparece

---

### Fluxo 18 — SelectGlobal — multi-select com chips
**Categoria:** Selects e Dropdowns
**Pré-condição:** SelectGlobal com multiplo=true
**Passos:**
1. Abrir o dropdown
2. Selecionar 3 opções
3. Verificar que o dropdown permanece aberto
4. Verificar que 3 chips aparecem no campo
5. Verificar que cada chip tem um botão "✕" para remover
6. Clicar no "✕" de um chip
7. Verificar que o chip é removido e a opção volta a ser marcável
8. Clicar em "Limpar seleção"
9. Verificar que todos os chips são removidos
**Resultado esperado:** multi-select com chips funcionando
**Critério de falha:** dropdown fecha após seleção, chips não aparecem, remoção não funciona

---

### Fluxo 19 — SelectGlobal — fechamento por ESC e clique fora
**Categoria:** Selects e Dropdowns
**Pré-condição:** SelectGlobal visível na página
**Passos:**
1. Abrir o dropdown
2. Pressionar ESC
3. Verificar que o dropdown fecha
4. Abrir novamente
5. Clicar fora do componente
6. Verificar que o dropdown fecha
**Resultado esperado:** dropdown fechado em ambos os casos
**Critério de falha:** dropdown permanece aberto

---

### Fluxo 20 — Estado vazio da tabela
**Categoria:** Estados de Interface
**Pré-condição:** TabelaGlobal montada com dados=[]
**Passos:**
1. Verificar que a mensagem de estado vazio é exibida
2. Verificar que não há linhas na tabela (exceto a de mensagem)
3. Verificar que a paginação exibe "Nenhum registro"
**Resultado esperado:** estado vazio claro e sem erros
**Critério de falha:** erro no console, layout quebrado, mensagem ausente

---

### Fluxo 21 — Estado de loading (skeleton)
**Categoria:** Estados de Interface
**Pré-condição:** TabelaGlobal com carregando=true
**Passos:**
1. Verificar que o skeleton é exibido nas células
2. Verificar que a animação shimmer está ativa
3. Verificar que não há dados reais exibidos
**Resultado esperado:** skeleton animado visível, sem dados reais
**Critério de falha:** dados reais exibidos junto com skeleton, animação ausente

---

### Fluxo 22 — Navegação e layout geral
**Categoria:** Navegação e Layout
**Pré-condição:** página com TabelaGlobal e ModalGlobal integrados
**Passos:**
1. Acessar a página via URL direta
2. Verificar que o componente carrega sem erros
3. Usar botão voltar do browser
4. Voltar para a página
5. Verificar que o estado é limpo (sem filtros residuais)
**Resultado esperado:** navegação sem erros, estado limpo após
**Critério de falha:** erro de carregamento, estado sujo após navegação

---

### Fluxo 23 — Validação visual (Percy) — TabelaGlobal
**Categoria:** Validação Visual (Percy)
**Pré-condição:** storybook/página de demonstração com TabelaGlobal
**Snapshots obrigatórios:**
1. Estado padrão — sem dados (empty state)
2. Estado com dados — primeira página
3. Estado de loading — skeletons ativos
4. Com filtros aplicados
5. Com linhas selecionadas
6. Dropdown de filtros aberto
7. Dark mode (padrão)
8. Light mode (body.light-theme)
**Resultado esperado:** snapshots aprovados sem diff visual
**Critério de falha:** diff visual inesperado, tipografia incorreta, cores hardcoded

---

### Fluxo 24 — Validação visual (Percy) — ModalGlobal
**Categoria:** Validação Visual (Percy)
**Snapshots obrigatórios:**
1. Modal fechado (componente não renderizado)
2. Modal aberto — sem abas
3. Modal aberto — com abas, primeira selecionada
4. Modal aberto — segunda aba selecionada
5. Modal com botões no footer
6. Modal tamanho sm
7. Modal tamanho xl
8. Modal em mobile (viewport 375px) — bottom-sheet
**Resultado esperado:** snapshots aprovados sem diff visual
**Critério de falha:** animação incorreta, posicionamento errado, responsividade quebrada

---

### Fluxo 25 — Validação visual (Percy) — SelectGlobal
**Categoria:** Validação Visual (Percy)
**Snapshots obrigatórios:**
1. Campo fechado com placeholder
2. Campo fechado com valor selecionado
3. Dropdown aberto com opções
4. Dropdown com busca digitada e filtro ativo
5. Multi-select com 3 chips
6. Estado de erro
7. Estado desabilitado
8. Grupos de opções visíveis
**Resultado esperado:** snapshots aprovados sem diff visual
**Critério de falha:** chips malformados, dropdown fora do alinhamento, cores incorretas

---

## Dados de teste necessários

| Dado | Formato | Quantidade |
|---|---|---|
| Registros de produto simulados | `{ id, nome, preco, status, criado_em }` | 35 registros |
| Opções de select | `{ valor, rotulo, descricao? }` | 10–20 opções |
| Grupos de select | `{ rotulo, opcoes[] }` | 2 grupos |
| Viewport mobile | 375 × 812px | — |
| Viewport desktop | 1440 × 900px | — |

Todos os dados são **estáticos/mockados** — nenhum serviço de backend é necessário pois o nucleo-global é 100% client-side.

---

## Categorias não aplicáveis

| Categoria | Justificativa |
|---|---|
| **Categoria 11 — Testes específicos do produto** | O `nucleo-global` é composto por componentes puros e genéricos, sem lógica de negócio específica de produto. Esta categoria só será aplicável quando os componentes forem integrados a produtos concretos (SimulaCusto, etc.) nos testes E2E desses produtos. |

---

## Ambiente

Staging — nunca produção.

Os componentes do nucleo-global podem ser testados em qualquer ambiente que monte a aplicação React. Recomendado: storybook ou página de demonstração dedicada dentro do workspace da Onda 2 antes de integrar com produtos reais.

---

**Status: AGUARDANDO APROVAÇÃO DO DONO antes da criação dos specs e execução.**
