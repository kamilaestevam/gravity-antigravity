# Plano de Testes E2E — BID Frete

**Data:** 2026-03-28
**Versao:** 1.0
**Status:** aguardando aprovacao do dono

## Escopo

Cobertura E2E completa do produto BID Frete (porta 8023), incluindo:
- Dashboard com KPIs
- CRUD de cotacoes (lista, kanban, wizard 7 etapas)
- Disparo de BIDs para fornecedores
- Comparativo e aprovacao de respostas
- Gestao de fornecedores e tabelas de preco
- Portal do fornecedor (autenticado e publico)
- Importacao em bloco
- Master data (portos, incoterms, modais, moedas)
- Monetizacao e savings

**Fora do escopo:** Integracao com conectores ERP externos reais, deploy em staging.

## Entidades testadas

1. Cotacao (bid_cotacoes)
2. Fornecedor (bid_fornecedores)
3. BidRequest (bid_requests)
4. BidResponse (bid_responses)
5. TabelaPreco (bid_tabelas_preco)
6. Avaliacao (bid_avaliacoes)
7. Saving (bid_savings)
8. Porto (bid_portos)

## Categorias cobertas

- [x] Categoria 1 — Operacoes CRUD
- [x] Categoria 2 — Filtros e Busca
- [x] Categoria 3 — Selects e Dropdowns
- [x] Categoria 4 — Importacao e Exportacao
- [x] Categoria 5 — Navegacao e Layout
- [x] Categoria 6 — Modais e Formularios
- [x] Categoria 7 — Estados de Interface
- [x] Categoria 8 — Operacoes em Massa
- [x] Categoria 9 — Visualizacoes
- [x] Categoria 10 — Validacao Visual (Percy)
- [x] Categoria 11 — Testes Especificos do Produto

---

## Fluxos Detalhados

### Categoria 1 — Operacoes CRUD

#### Fluxo 1.1 — Criar cotacao via wizard (caminho feliz)
**Pre-condicao:** Usuario autenticado, ao menos 1 fornecedor ativo cadastrado
**Passos:**
1. Navegar para /cotacoes
2. Clicar "Nova Cotacao"
3. Etapa 1: Selecionar modal MARITIMO
4. Etapa 2: Selecionar origem (porto Santos)
5. Etapa 3: Selecionar destino (porto Shanghai)
6. Etapa 4: Preencher dados da carga (peso, volume, container 40HC)
7. Etapa 5: Selecionar incoterm FOB
8. Etapa 6: Selecionar fornecedores
9. Etapa 7: Revisar e confirmar
**Resultado esperado:** Cotacao criada com status RASCUNHO, redirecionamento para detalhe
**Criterio de falha:** Cotacao nao aparece na lista, status incorreto, dados perdidos entre etapas

#### Fluxo 1.2 — Criar cotacao com dados invalidos
**Pre-condicao:** Usuario autenticado
**Passos:**
1. Navegar para /cotacoes > Nova Cotacao
2. Tentar avancar etapa 1 sem selecionar modal
3. Tentar avancar etapa 4 sem peso/volume
4. Tentar confirmar sem fornecedores selecionados
**Resultado esperado:** Validacoes exibidas em cada etapa, wizard nao avanca
**Criterio de falha:** Wizard avanca sem dados obrigatorios, cotacao criada incompleta

#### Fluxo 1.3 — Visualizar detalhe de cotacao
**Pre-condicao:** Cotacao existente com status ENVIADA_FORNECEDORES
**Passos:**
1. Navegar para /cotacoes
2. Clicar na cotacao
3. Verificar todos os campos: modal, origem, destino, carga, incoterm, fornecedores convidados
4. Verificar timeline de status
**Resultado esperado:** Todos os dados exibidos corretamente, timeline com historico
**Criterio de falha:** Dados ausentes, timeline vazia

#### Fluxo 1.4 — Editar cotacao (rascunho)
**Pre-condicao:** Cotacao em status RASCUNHO
**Passos:**
1. Abrir detalhe da cotacao
2. Clicar editar
3. Alterar incoterm de FOB para CIF
4. Salvar
**Resultado esperado:** Incoterm atualizado, toast de sucesso
**Criterio de falha:** Dados nao salvos, erro ao editar

#### Fluxo 1.5 — Deletar cotacao (rascunho)
**Pre-condicao:** Cotacao em status RASCUNHO
**Passos:**
1. Na lista, selecionar cotacao rascunho
2. Clicar deletar
3. Confirmar no modal de confirmacao
**Resultado esperado:** Cotacao removida da lista, toast de sucesso
**Criterio de falha:** Cotacao ainda visivel, erro 500

#### Fluxo 1.6 — CRUD de fornecedor
**Pre-condicao:** Usuario autenticado
**Passos:**
1. Navegar para /fornecedores
2. Criar fornecedor (nome, email, tipo AGENTE_CARGA, telefone)
3. Visualizar detalhe
4. Editar telefone
5. Alterar status para INATIVO
6. Deletar fornecedor
**Resultado esperado:** Cada operacao com feedback correto, dados persistidos
**Criterio de falha:** Duplicata de email permitida, status nao atualizado

#### Fluxo 1.7 — Criar fornecedor com email duplicado
**Pre-condicao:** Fornecedor ja cadastrado com email X
**Passos:**
1. Tentar criar novo fornecedor com mesmo email
**Resultado esperado:** Erro 409 Conflict exibido ao usuario
**Criterio de falha:** Duplicata criada sem erro

### Categoria 2 — Filtros e Busca

#### Fluxo 2.1 — Filtrar cotacoes por status
**Pre-condicao:** Cotacoes em diferentes status (RASCUNHO, EM_COTACAO, APROVADA)
**Passos:**
1. Na lista de cotacoes, selecionar filtro status = EM_COTACAO
2. Verificar que apenas cotacoes EM_COTACAO aparecem
3. Limpar filtro
4. Verificar que todas voltam
**Resultado esperado:** Filtro funcional, limpeza restaura lista completa
**Criterio de falha:** Filtro nao funciona, lista vazia apos limpar

#### Fluxo 2.2 — Filtrar cotacoes por modal
**Pre-condicao:** Cotacoes com modais diferentes (MARITIMO, AEREO)
**Passos:**
1. Filtrar por MARITIMO
2. Verificar resultados
3. Filtrar por AEREO
4. Combinar status + modal
**Resultado esperado:** Filtros combinados funcionando
**Criterio de falha:** Combinacao de filtros retorna resultados incorretos

#### Fluxo 2.3 — Filtrar fornecedores por tipo
**Pre-condicao:** Fornecedores de tipos diferentes
**Passos:**
1. Filtrar por ARMADOR
2. Verificar que apenas armadores aparecem
3. Buscar por nome parcial
4. Combinar tipo + busca
**Resultado esperado:** Resultados corretos para cada combinacao
**Criterio de falha:** Busca case-sensitive, filtro ignorado

#### Fluxo 2.4 — Paginacao com filtro ativo
**Pre-condicao:** > 20 cotacoes, filtro por status ativo
**Passos:**
1. Aplicar filtro
2. Navegar para pagina 2
3. Verificar que filtro permanece ativo
**Resultado esperado:** Paginacao respeita filtro
**Criterio de falha:** Filtro resetado ao mudar pagina

### Categoria 3 — Selects e Dropdowns

#### Fluxo 3.1 — Select de modal no wizard
**Passos:**
1. Abrir wizard de nova cotacao
2. Verificar opcoes: MARITIMO, AEREO, RODOVIARIO
3. Selecionar MARITIMO
4. Verificar que modalidades atualizam (FCL, LCL)
5. Selecionar AEREO
6. Verificar que modalidades atualizam (AEREO_GERAL)
**Resultado esperado:** Cascade select funcional
**Criterio de falha:** Modalidades nao atualizam ao trocar modal

#### Fluxo 3.2 — Select de portos com busca
**Passos:**
1. No wizard etapa 2 (origem), digitar "Santos"
2. Verificar que portos com "Santos" aparecem
3. Selecionar um porto
4. Repetir para destino
**Resultado esperado:** Busca filtra portos corretamente
**Criterio de falha:** Busca nao filtra, porto nao selecionavel

#### Fluxo 3.3 — Select multiplo de fornecedores
**Passos:**
1. Na etapa 6 do wizard, visualizar fornecedores disponiveis
2. Selecionar 3 fornecedores
3. Desmarcar 1
4. Verificar contagem atualizada
**Resultado esperado:** Multi-select funcional com contagem
**Criterio de falha:** Nao permite multi-selecao, contagem incorreta

#### Fluxo 3.4 — Select de incoterms agrupados
**Passos:**
1. Na etapa 5, abrir select de incoterms
2. Verificar agrupamento (E, F, C, D)
3. Verificar que todas as 11 opcoes estao presentes
4. Selecionar FOB
**Resultado esperado:** 11 incoterms exibidos com agrupamento
**Criterio de falha:** Opcoes ausentes, sem agrupamento

### Categoria 4 — Importacao e Exportacao

#### Fluxo 4.1 — Importar cotacoes em bloco (sucesso)
**Pre-condicao:** Arquivo CSV/Excel no formato correto
**Passos:**
1. Navegar para /importar-bloco
2. Upload do arquivo
3. Verificar preview dos dados
4. Confirmar importacao
**Resultado esperado:** Cotacoes criadas, resumo com total importado
**Criterio de falha:** Importacao falha sem mensagem clara

#### Fluxo 4.2 — Importar arquivo com formato incorreto
**Passos:**
1. Upload de arquivo .txt ou .pdf
**Resultado esperado:** Erro de formato exibido, nenhum dado importado
**Criterio de falha:** Sistema aceita formato invalido

#### Fluxo 4.3 — Importar com dados invalidos por linha
**Pre-condicao:** Arquivo com 5 linhas, 2 com erros de validacao
**Passos:**
1. Upload do arquivo
2. Verificar report de erros por linha
3. Confirmar importacao parcial (3 validas)
**Resultado esperado:** Erros reportados por linha, 3 cotacoes criadas
**Criterio de falha:** Import all-or-nothing, sem report por linha

#### Fluxo 4.4 — Baixar modelo de importacao
**Passos:**
1. Na tela de importacao, clicar "Baixar modelo"
**Resultado esperado:** Download de arquivo template
**Criterio de falha:** Link quebrado, arquivo vazio

### Categoria 5 — Navegacao e Layout

#### Fluxo 5.1 — Navegacao entre secoes do produto
**Passos:**
1. Dashboard > Cotacoes > Fornecedores > Configuracoes > Dashboard
2. Verificar breadcrumb/rota ativa em cada secao
3. Verificar sidebar highlight
**Resultado esperado:** Navegacao fluida SPA, sem reload
**Criterio de falha:** Pagina recarrega, breadcrumb incorreto

#### Fluxo 5.2 — Navegacao profunda e botao voltar
**Passos:**
1. Cotacoes > DetalheCotacao > Comparativo
2. Clicar voltar
3. Verificar retorno para DetalheCotacao
4. Clicar voltar novamente
5. Verificar retorno para lista
**Resultado esperado:** Navegacao de pilha correta
**Criterio de falha:** Volta para pagina errada, perde contexto

#### Fluxo 5.3 — Acesso direto via URL
**Passos:**
1. Acessar /cotacoes/id-inexistente
2. Acessar /comparativo/id-valido sem autenticacao
**Resultado esperado:** 404 para ID inexistente, redirect para login sem auth
**Criterio de falha:** Tela branca, erro 500 exposto

#### Fluxo 5.4 — Menu lateral expansao/retracao
**Passos:**
1. Retrair sidebar
2. Verificar que icones permanecem visiveis
3. Expandir sidebar
4. Verificar labels visiveis
**Resultado esperado:** Sidebar responsiva com transicao suave
**Criterio de falha:** Conteudo cortado, sem transicao

### Categoria 6 — Modais e Formularios

#### Fluxo 6.1 — Modal de confirmacao de disparo BID
**Pre-condicao:** Cotacao em RASCUNHO com fornecedores selecionados
**Passos:**
1. No detalhe da cotacao, clicar "Disparar BID"
2. Verificar modal com resumo (fornecedores, canais)
3. Fechar pelo X
4. Reabrir e confirmar
**Resultado esperado:** Modal exibe dados corretos, disparo executado
**Criterio de falha:** Modal sem dados, disparo sem confirmacao

#### Fluxo 6.2 — Formulario de resposta do fornecedor (portal publico)
**Pre-condicao:** Token publico valido gerado
**Passos:**
1. Acessar URL publica com token
2. Visualizar dados da cotacao (somente leitura)
3. Preencher preco, transit time, validade
4. Submeter
5. Tentar submeter novamente (idempotencia)
**Resultado esperado:** Resposta registrada, segunda submissao bloqueada
**Criterio de falha:** Dados da cotacao editaveis, duplicata permitida

#### Fluxo 6.3 — Formulario vazio e validacoes
**Passos:**
1. Abrir form de novo fornecedor
2. Clicar salvar sem preencher
3. Verificar validacoes em cada campo obrigatorio
4. Preencher parcialmente e salvar
5. Verificar que apenas campos faltantes sao sinalizados
**Resultado esperado:** Validacao granular por campo
**Criterio de falha:** Mensagem generica, sem highlight de campo

#### Fluxo 6.4 — Wizard de cotacao: navegacao entre etapas
**Passos:**
1. Preencher etapas 1-3
2. Voltar para etapa 1
3. Verificar que dados preenchidos permanecem
4. Avancar ate etapa 7
**Resultado esperado:** Estado preservado entre etapas
**Criterio de falha:** Dados perdidos ao navegar entre etapas

### Categoria 7 — Estados de Interface

#### Fluxo 7.1 — Estado vazio (sem cotacoes)
**Pre-condicao:** Tenant novo sem dados
**Passos:**
1. Acessar /cotacoes
**Resultado esperado:** Mensagem "Nenhuma cotacao encontrada" com CTA "Criar primeira cotacao"
**Criterio de falha:** Lista vazia sem orientacao

#### Fluxo 7.2 — Loading durante disparo de BID
**Passos:**
1. Disparar BID para 10 fornecedores
2. Observar estado de loading
**Resultado esperado:** Spinner/skeleton durante processamento, botao desabilitado
**Criterio de falha:** Duplo clique permite disparo duplicado

#### Fluxo 7.3 — Estado de erro (servico indisponivel)
**Passos:**
1. Simular falha no backend (mock)
2. Tentar listar cotacoes
**Resultado esperado:** Mensagem de erro com botao retry
**Criterio de falha:** Tela branca, erro tecnico exposto ao usuario

#### Fluxo 7.4 — Toasts de sucesso e erro
**Passos:**
1. Criar cotacao (observar toast sucesso)
2. Tentar criar com dados invalidos (observar toast erro)
3. Deletar cotacao (observar toast sucesso)
**Resultado esperado:** Toasts aparecem e desaparecem automaticamente
**Criterio de falha:** Toast nao aparece, toast permanente

### Categoria 8 — Operacoes em Massa

#### Fluxo 8.1 — Selecao multipla de cotacoes
**Passos:**
1. Na lista, marcar checkbox de 3 cotacoes
2. Verificar barra de acoes em massa
3. Marcar "selecionar todos"
4. Desmarcar todos
**Resultado esperado:** Selecao funcional com contagem
**Criterio de falha:** Checkbox nao funciona, contagem incorreta

#### Fluxo 8.2 — Deletar cotacoes em massa
**Pre-condicao:** 3 cotacoes RASCUNHO selecionadas
**Passos:**
1. Selecionar 3 rascunhos
2. Clicar "Deletar selecionados"
3. Confirmar no modal
**Resultado esperado:** 3 removidas, toast "3 cotacoes deletadas"
**Criterio de falha:** Deleta cotacoes nao-rascunho, sem confirmacao

### Categoria 9 — Visualizacoes

#### Fluxo 9.1 — Alternar lista/kanban em cotacoes
**Pre-condicao:** Cotacoes em diferentes status
**Passos:**
1. Visualizar em modo lista
2. Alternar para kanban
3. Verificar colunas por status (RASCUNHO, EM_COTACAO, APROVADA, etc.)
4. Voltar para lista
5. Verificar que dados permanecem
**Resultado esperado:** Ambas visualizacoes corretas, estado preservado
**Criterio de falha:** Kanban sem colunas, dados perdidos ao alternar

#### Fluxo 9.2 — Ordenacao por coluna
**Passos:**
1. Na lista de cotacoes, ordenar por data (crescente)
2. Ordenar por data (decrescente)
3. Ordenar por status
**Resultado esperado:** Ordenacao correta em cada clique
**Criterio de falha:** Ordenacao incorreta, paginacao quebrada

### Categoria 10 — Validacao Visual (Percy)

#### Fluxo 10.1 — Screenshots dos estados principais
**Passos:**
1. Capturar: Dashboard com KPIs
2. Capturar: Lista de cotacoes (vazia)
3. Capturar: Lista de cotacoes (com dados)
4. Capturar: Kanban de cotacoes
5. Capturar: Wizard etapa 1
6. Capturar: Detalhe de cotacao
7. Capturar: Comparativo com ranking
8. Capturar: Portal do fornecedor
9. Capturar: Modal de disparo BID
10. Capturar: Formulario de resposta publica
**Resultado esperado:** Todos os snapshots baseline aprovados
**Criterio de falha:** Diferencas visuais nao intencionais

#### Fluxo 10.2 — Responsividade
**Passos:**
1. Capturar telas em 1920px, 1366px, 768px
2. Verificar que layout adapta sem quebras
**Resultado esperado:** Layout responsivo em todas as resoluções
**Criterio de falha:** Overflow, elementos sobrepostos

### Categoria 11 — Testes Especificos do Produto (BID Frete)

> Fluxos de dominio especificos do BID Frete, aprovados pelo dono.

#### Fluxo 11.1 — Ciclo completo de cotacao (happy path)
**Pre-condicao:** Fornecedores ativos cadastrados
**Passos:**
1. Criar cotacao via wizard (MARITIMO, FOB, Santos > Shanghai, 40HC)
2. Disparar BID para 3 fornecedores (EMAIL)
3. Acessar portal publico como fornecedor A e responder (USD 3500, 25 dias)
4. Acessar portal publico como fornecedor B e responder (USD 3200, 28 dias)
5. Acessar portal publico como fornecedor C e responder (USD 3800, 22 dias)
6. Acessar comparativo: verificar ranking por preco (B > A > C)
7. Aprovar resposta do fornecedor B (2-click)
8. Verificar: cotacao status APROVADA, fornecedor_vencedor = B
9. Verificar: saving calculado (vs target ou vs media)
10. Verificar: monetizacao registrada para fornecedor B
**Resultado esperado:** Ciclo completo funcional, savings e monetizacao corretos
**Criterio de falha:** Qualquer etapa falha, dados inconsistentes

#### Fluxo 11.2 — Resposta automatica via tabela de precos
**Pre-condicao:** Fornecedor com tabela de precos ativa (Santos > Shanghai, MARITIMO, FCL)
**Passos:**
1. Criar cotacao que match a tabela do fornecedor
2. Disparar BID
3. Verificar que BidResponse automatica foi criada
4. Verificar que BidRequest status = RESPONDIDO
5. No comparativo, verificar que resposta automatica aparece
**Resultado esperado:** Auto-response gerada instantaneamente
**Criterio de falha:** Sem resposta automatica, match incorreto

#### Fluxo 11.3 — Monetizacao: free tier e cobranca
**Pre-condicao:** Fornecedor com 9 cotacoes aprovadas (free tier = 10)
**Passos:**
1. Aprovar cotacao 10 para o fornecedor (status ISENTA)
2. Aprovar cotacao 11 (status PENDENTE, USD 5.00)
3. Verificar resumo de monetizacao do fornecedor
**Resultado esperado:** Free tier esgotado apos 10, cobranca a partir da 11
**Criterio de falha:** Cobranca antes do limite, free tier sem limite

#### Fluxo 11.4 — Rating cross-tenant do fornecedor
**Pre-condicao:** Fornecedor com avaliacoes de multiplos tenants
**Passos:**
1. Tenant A avalia fornecedor (frete: 4, atendimento: 5)
2. Tenant B avalia fornecedor (frete: 3, atendimento: 4)
3. Verificar rating global: media ponderada 40% auto + 60% manual
4. Verificar que rating aparece no comparativo
**Resultado esperado:** Rating consolidado cross-tenant
**Criterio de falha:** Rating isolado por tenant, calculo incorreto

#### Fluxo 11.5 — Portal do fornecedor autenticado
**Pre-condicao:** Fornecedor com login ativo, cotacoes pendentes
**Passos:**
1. Acessar portal/dashboard
2. Verificar KPIs (pendentes, respondidas, aprovadas)
3. Navegar para cotacoes pendentes
4. Responder uma cotacao
5. Verificar em "Minhas Respostas" que aparece
6. Verificar "Meu Desempenho" atualizado (taxa resposta, tempo medio)
**Resultado esperado:** Portal funcional com metricas atualizadas
**Criterio de falha:** KPIs incorretos, resposta nao refletida

#### Fluxo 11.6 — Reprovacao e cancelamento
**Passos:**
1. Cotacao com respostas recebidas
2. Reprovar todas as respostas (com motivo)
3. Verificar status REPROVADA
4. Criar nova cotacao e cancelar antes de disparar
5. Verificar status CANCELADA
**Resultado esperado:** Status terminal correto, motivo registrado
**Criterio de falha:** Cotacao reprovada permite novo disparo

#### Fluxo 11.7 — Disparo aberto (todos os fornecedores ativos)
**Pre-condicao:** 5 fornecedores ativos, 2 inativos
**Passos:**
1. Criar cotacao
2. Disparar como "cotacao aberta"
3. Verificar que 5 BidRequests criados (apenas ativos)
**Resultado esperado:** Apenas fornecedores ativos recebem
**Criterio de falha:** Inativos recebem, contagem incorreta

#### Fluxo 11.8 — Token publico expirado
**Pre-condicao:** Token gerado ha mais de 7 dias (mock)
**Passos:**
1. Acessar URL publica com token expirado
**Resultado esperado:** Mensagem "Link expirado" com instrucoes
**Criterio de falha:** Formulario acessivel, erro tecnico

## Dados de teste necessarios

- 2 tenants (tenant-teste, tenant-outro)
- 5 fornecedores ativos (tipos variados: AGENTE_CARGA, ARMADOR, CIA_AEREA)
- 2 fornecedores inativos
- 1 fornecedor com tabela de preco ativa (Santos > Shanghai, MARITIMO, FCL)
- 10+ cotacoes em estados variados
- 3+ respostas por cotacao para testes de comparativo
- Portos seedados (Santos, Shanghai, Rotterdam, Miami)
- Master data: incoterms, modais, moedas, containers

## Categorias nao aplicaveis

Nenhuma — todas as 11 categorias se aplicam ao BID Frete.

## Ambiente

Staging — nunca producao.
Base URL: configuravel via E2E_BASE_URL (default: http://localhost:8023)
