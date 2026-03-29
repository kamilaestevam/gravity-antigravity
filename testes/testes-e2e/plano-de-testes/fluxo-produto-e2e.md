# Plano de Testes E2E — Fluxo Completo de Produto (SimulaCusto)

**Data:** 2026-03-29
**Versao:** 1.0
**Status:** aguardando aprovacao do dono

## Escopo

Cobertura E2E do fluxo completo de um produto na plataforma Gravity, usando SimulaCusto como caso de referencia. Abrange desde a ativacao do produto no catalogo ate a operacao completa pelo usuario final.

**Fora do escopo:** Integracoes com Siscomex real, deploy em staging, fluxos de billing/Stripe.

## Entidades testadas

1. ProdutoCatalogo (catalogo de produtos)
2. Tenant (workspace do cliente)
3. Estimativa (simula_custo_estimativas)
4. ResultadoFiscal (calculo de landed cost)
5. KPIs (metricas agregadas)

## Categorias cobertas

- [x] Categoria 1 — Ativacao de Produto (Admin)
- [x] Categoria 2 — Sidebar e Navegacao
- [x] Categoria 3 — Dashboard e KPIs
- [x] Categoria 4 — CRUD de Estimativas
- [x] Categoria 5 — Simulacao Fiscal
- [x] Categoria 6 — Store e Catalogo Publico

---

## Fluxos Detalhados

### Categoria 1 — Ativacao de Produto (Admin)

#### Fluxo 1.1 — Admin: produto SimulaCusto visivel no catalogo
**Pre-condicao:** Admin autenticado no Configurador
**Passos:**
1. Acessar pagina do Configurador (Hub)
2. Verificar que SimulaCusto aparece na lista de produtos do catalogo
3. Verificar dados: nome, descricao, tipo de cobranca, preco unitario
**Resultado esperado:** SimulaCusto listado com status "Ativo", slug "simula-custo"
**Criterio de falha:** Produto ausente, dados incorretos, slug divergente

#### Fluxo 1.2 — Admin: ativar SimulaCusto para tenant demo
**Pre-condicao:** Admin autenticado, SimulaCusto no catalogo com status "Ativo"
**Passos:**
1. Chamar API de ativacao de produto para o tenant (POST /api/v1/configurador/tenant/products)
2. Verificar resposta 200 com product_key = "simula-custo"
3. Verificar via GET que o produto esta ativo para o tenant
**Resultado esperado:** Produto vinculado ao tenant, retorno da API com dados corretos
**Criterio de falha:** Ativacao falha, produto nao aparece no tenant

### Categoria 2 — Sidebar e Navegacao

#### Fluxo 2.1 — Sidebar: SimulaCusto aparece quando ativado
**Pre-condicao:** SimulaCusto ativado para o tenant do usuario logado
**Passos:**
1. Navegar para a pagina principal (Shell)
2. Verificar que a Sidebar contém item "SimulaCusto" com icone Calculator
3. Verificar que o link aponta para /simula-custo ou rota equivalente
4. Clicar no item e verificar navegacao
**Resultado esperado:** Item presente na sidebar, navegacao funcional sem reload
**Criterio de falha:** Item ausente, link quebrado, pagina recarrega

#### Fluxo 2.2 — Sidebar: SimulaCusto desaparece quando desativado
**Pre-condicao:** SimulaCusto desativado para o tenant
**Passos:**
1. Desativar produto via API
2. Recarregar a pagina principal
3. Verificar que "SimulaCusto" nao aparece mais na Sidebar
**Resultado esperado:** Item removido da sidebar, sem erro visual
**Criterio de falha:** Item ainda visivel apos desativacao, erro no console

### Categoria 3 — Dashboard e KPIs

#### Fluxo 3.1 — Dashboard: KPIs carregam corretamente
**Pre-condicao:** SimulaCusto ativado, estimativas existentes no banco
**Passos:**
1. Navegar para /estimativas (dashboard do SimulaCusto)
2. Aguardar carregamento completo
3. Verificar 4 KPI cards: "Total de Estimativas", "Em Criacao", "Criadas", "Landed Cost Medio"
4. Verificar que valores numericos sao consistentes (total = em_criacao + criadas + arquivadas)
**Resultado esperado:** KPIs exibidos com valores corretos, layout responsivo
**Criterio de falha:** KPIs com valor zero quando ha dados, layout quebrado

#### Fluxo 3.2 — Dashboard: tabela de estimativas vazia inicialmente
**Pre-condicao:** Tenant novo sem estimativas
**Passos:**
1. Navegar para /estimativas
2. Verificar mensagem "Nenhuma estimativa encontrada"
3. Verificar botao "Nova Estimativa" visivel
**Resultado esperado:** Estado vazio com mensagem orientadora e CTA
**Criterio de falha:** Tabela sem mensagem, spinner infinito, erro

### Categoria 4 — CRUD de Estimativas

#### Fluxo 4.1 — Nova estimativa: formulario carrega campos obrigatorios
**Pre-condicao:** Usuario autenticado com SimulaCusto ativo
**Passos:**
1. Clicar "Nova Estimativa" no dashboard
2. Verificar redirecionamento para /estimativas/nova
3. Verificar secoes do formulario: Operacao, Produto & Origem, Valores, Aliquotas
4. Verificar campos obrigatorios: NCM, Pais de Origem, UF Desembaraco, Valor do Produto
5. Verificar valores padrao: Operacao=IMPORTACAO, Incoterm=FOB, Moeda=USD, UF=SP
**Resultado esperado:** Formulario completo com todos os campos, defaults aplicados
**Criterio de falha:** Campos ausentes, defaults incorretos, formulario nao renderiza

#### Fluxo 4.2 — Nova estimativa: simular custo retorna resultado fiscal
**Pre-condicao:** Formulario de nova estimativa preenchido corretamente
**Passos:**
1. Preencher NCM: 84713019
2. Preencher Pais Origem: US
3. Preencher Valor Produto: 5925.00 USD
4. Preencher Frete: 500.00 USD
5. Preencher Seguro: 50.00 USD
6. Preencher aliquotas: II=16%, IPI=0%, PIS=2.10%, COFINS=9.65%, ICMS=18%
7. Clicar "Simular Custo"
8. Aguardar resultado
**Resultado esperado:** Painel de resultado exibe: Valor Aduaneiro, 5 tributos (II, IPI, PIS, COFINS, ICMS), Total de Tributos, Landed Cost Total, PTAX utilizada, badge de source
**Criterio de falha:** Erro na simulacao, resultado incompleto, valores negativos

#### Fluxo 4.3 — Nova estimativa: salvar persiste no banco
**Pre-condicao:** Simulacao realizada com resultado visivel
**Passos:**
1. Apos simulacao bem-sucedida, clicar "Salvar Estimativa"
2. Verificar redirecionamento para /estimativas (dashboard)
3. Verificar via API GET que a estimativa foi persistida com dados corretos
**Resultado esperado:** Estimativa criada com status EM_CRIACAO ou CRIADA, dados consistentes com input
**Criterio de falha:** Dados nao persistidos, status incorreto, valores divergentes

#### Fluxo 5.1 — Lista: estimativa salva aparece com status correto
**Pre-condicao:** Estimativa criada no fluxo 4.3
**Passos:**
1. No dashboard, verificar que a nova estimativa aparece na tabela
2. Verificar colunas: Numero, Status (badge), Operacao, NCM, Referencia, Landed Cost, Tributos, Data
3. Verificar que o status exibido corresponde ao badge correto (EM_CRIACAO=warning, CRIADA=success)
**Resultado esperado:** Estimativa listada com todos os campos corretos
**Criterio de falha:** Estimativa ausente da lista, badge incorreto, dados truncados

#### Fluxo 5.2 — Lista: duplicar estimativa cria copia
**Pre-condicao:** Estimativa existente na lista
**Passos:**
1. Na linha da estimativa, clicar acao "Duplicar" (icone CopySimple)
2. Verificar que nova linha aparece na tabela
3. Verificar que a copia tem numero diferente mas mesmos dados (NCM, valor, operacao)
**Resultado esperado:** Copia criada com novo ID/numero, dados identicos ao original
**Criterio de falha:** Duplicacao falha, dados da copia divergem, numero repetido

#### Fluxo 5.3 — Lista: arquivar estimativa altera status
**Pre-condicao:** Estimativa com status EM_CRIACAO ou CRIADA
**Passos:**
1. Na linha da estimativa, clicar acao "Arquivar" (icone Archive)
2. Verificar que o status muda para "Arquivada" (badge default/cinza)
3. Verificar que o botao Arquivar fica desabilitado para estimativas ja arquivadas
4. Verificar via API que o status foi atualizado para ARQUIVADA
**Resultado esperado:** Status atualizado na UI e no banco, botao desabilitado
**Criterio de falha:** Status nao muda, botao permite re-arquivar, erro no backend

### Categoria 5 — Simulacao Fiscal

> Coberta pelos fluxos 4.2 e 4.3 acima.

### Categoria 6 — Store e Catalogo Publico

#### Fluxo 6.1 — Store: produtos do catalogo carregam da API
**Pre-condicao:** Catalogo com produtos seedados (SimulaCusto, Smart Read, BID Frete)
**Passos:**
1. Acessar pagina da Store (Marketplace)
2. Verificar que os 3 produtos aparecem como cards
3. Para cada produto: nome, descricao, icone, categoria exibidos corretamente
**Resultado esperado:** Cards renderizados com dados do catalogo, icones corretos por slug
**Criterio de falha:** Cards ausentes, icone generico, dados truncados

#### Fluxo 6.2 — Store: produto suspenso nao aparece
**Pre-condicao:** Um produto com status "Suspenso" no catalogo
**Passos:**
1. Suspender produto via API (toggleProdutoStatus)
2. Acessar Store
3. Verificar que o produto suspenso nao e exibido
4. Reativar produto
5. Verificar que volta a aparecer
**Resultado esperado:** Apenas produtos com status "Ativo" sao exibidos
**Criterio de falha:** Produto suspenso visivel, produto reativado nao retorna

#### Fluxo 6.3 — Store: precos e tipo de cobranca exibidos corretamente
**Pre-condicao:** Catalogo com produtos com diferentes tipos de cobranca
**Passos:**
1. Acessar Store
2. Para SimulaCusto: verificar "R$ 10,99 /estimativa"
3. Para Smart Read: verificar "R$ 5,99 /documento"
4. Para BID Frete: verificar "R$ 1,99 /processo"
5. Verificar formatacao monetaria (BRL, separadores brasileiros)
**Resultado esperado:** Precos e tipos de cobranca corretos para cada produto
**Criterio de falha:** Preco incorreto, tipo de cobranca ausente, formatacao errada

---

## Dados de teste necessarios

- 1 tenant de teste (tenant-teste)
- 1 usuario de teste (user-teste)
- Catalogo seedado com 3 produtos (SimulaCusto, Smart Read, BID Frete)
- SimulaCusto ativado para tenant-teste
- Master data: NCMs, UFs, paises

## Ambiente

Staging — nunca producao.
Base URL SimulaCusto: configuravel via E2E_BASE_URL (default: http://localhost:8020)
Base URL Configurador: configuravel via CONFIGURADOR_BASE_URL (default: http://localhost:5002)
Base URL Store: configuravel via STORE_BASE_URL (default: http://localhost:5001)
