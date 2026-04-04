# MANUAL DE REGRAS DE NEGOCIO — MODULO PEDIDO (TABELA DE PEDIDOS)

> **Versao:** 1.0
> **Data:** 02/04/2026
> **Modulo:** Pedido — Gestao de Pedidos COMEX
> **Audiencia:** Desenvolvedores e Gestores
> **Status:** Oficial — Referencia Primaria do Modulo

---

## SUMARIO

1. [Visao Geral do Modulo](#1-visao-geral-do-modulo)
2. [Hierarquia de Dados](#2-hierarquia-de-dados)
3. [Ciclo de Vida do Pedido — Status](#3-ciclo-de-vida-do-pedido--status)
4. [Matematica do Saldo — Elo Sagrado](#4-matematica-do-saldo--elo-sagrado)
5. [Toolbar — Todas as Acoes](#5-toolbar--todas-as-acoes)
6. [Configuracoes do Modulo](#6-configuracoes-do-modulo)
7. [Edicao Inline](#7-edicao-inline)
8. [Selecao em Massa](#8-selecao-em-massa)
9. [Abas por Status](#9-abas-por-status)
10. [Linhas Expansiveis — Hierarquia](#10-linhas-expansiveis--hierarquia)
11. [Filtros](#11-filtros)
12. [Busca em Tempo Real](#12-busca-em-tempo-real)
13. [Ordenacao](#13-ordenacao)
14. [Preferencias de Colunas por Usuario](#14-preferencias-de-colunas-por-usuario)
15. [Colunas Customizadas — Regras de Negocio](#15-colunas-customizadas--regras-de-negocio)
16. [Checkout Modal — Fluxo de Confirmacao](#16-checkout-modal--fluxo-de-confirmacao)
17. [Smart Read (Fase 2)](#17-smart-read-fase-2)
18. [Estados Visuais da Tabela](#18-estados-visuais-da-tabela)
19. [Seguranca e Permissoes](#19-seguranca-e-permissoes)
20. [Auditoria](#20-auditoria)

---

## 1. VISAO GERAL DO MODULO

O modulo de Pedidos gerencia a compra de mercadorias de exportadores estrangeiros dentro de processos de importacao e exportacao COMEX (comercio exterior).

### Problema Central

O desafio operacional do modulo e controlar grandes volumes de pedidos em cenarios onde:

- Exportadores entregam **parcialmente** o que foi solicitado
- Exportadores entregam **a mais** do que o pedido original previa
- Exportadores entregam **a menos** do que o pedido original previa
- Pedidos precisam ser **consolidados** em um unico embarque
- Pedidos precisam ser **divididos** entre multiplos embarques
- Pedidos precisam ser **transferidos** entre processos distintos

### Escopo do Modulo

O modulo de Pedidos gerencia:

- Criacao, edicao e exclusao de pedidos e seus itens
- Rastreamento de saldos de quantidade ao longo do ciclo de vida
- Transferencias de saldo para embarques
- Consolidacao de pedidos em containers
- Autorizacao de embarque
- Integracao com sistemas ERP externos
- Importacao e exportacao de dados em multiplos formatos
- Colunas customizadas por tenant
- Status personalizados por tenant
- Auditoria imutavel de todas as operacoes

### O que o Modulo NAO Gerencia

- Gestao de processos (avos na hierarquia integrada) — responsabilidade de outro modulo
- Gestao de embarques/containers como entidades principais
- Desembaraco aduaneiro
- Financeiro e faturamento

---

## 2. HIERARQUIA DE DADOS

O modulo opera em dois modos distintos de hierarquia, configurados de acordo com o contexto de uso do tenant.

### 2.1 Modo Standalone (2 Niveis)

Usado quando o modulo de Pedidos opera de forma independente, sem integracao com um modulo de Processos.

```
Pedido (pai — nivel 0)
  └── Item do Pedido (filho — nivel 1)
  └── Item do Pedido (filho — nivel 1)
  └── Item do Pedido (filho — nivel 1)
```

- O Pedido e a entidade raiz
- Cada Pedido possui um ou mais Itens
- Nao ha nivel acima do Pedido
- A tabela exibe Pedidos como linhas pai expandiveis

### 2.2 Modo Integrado (3 Niveis)

Usado quando o modulo de Pedidos e parte de um ecossistema maior que inclui Processos de importacao.

```
Processo (avo — nivel 0)
  └── Pedido (pai — nivel 1)
        └── Item do Pedido (filho — nivel 2)
        └── Item do Pedido (filho — nivel 2)
  └── Pedido (pai — nivel 1)
        └── Item do Pedido (filho — nivel 2)
```

- O Processo e a entidade raiz (nivel 0), gerenciado por outro modulo
- O Pedido (nivel 1) e o dono da hierarquia dentro do modulo de Pedidos
- Cada Pedido possui um ou mais Itens (nivel 2)
- A tabela exibe 3 niveis de expansao: Processo → Pedido → Item

### 2.3 Regras da Hierarquia

| Regra | Detalhe |
|-------|---------|
| Profundidade maxima | 3 niveis (Processo → Pedido → Item) |
| Dono da hierarquia | Pedido e sempre o dono das regras de negocio |
| Gestao do Processo | Fora do escopo deste modulo |
| Itens em lote | Itens NAO sao selecionaveis para operacoes em lote — apenas Pedidos pai |
| Lazy loading | Filhos so sao buscados no momento da expansao |

---

## 3. CICLO DE VIDA DO PEDIDO — STATUS

### 3.1 Status Padrao do Sistema

Estes status sao criados automaticamente na instalacao do modulo. Representam o fluxo padrao do ciclo de vida de um pedido COMEX:

| Ordem | Status | Significado |
|-------|--------|-------------|
| 1 | Pedido Criado | Pedido registrado no sistema, sem nenhuma confirmacao do exportador |
| 2 | Aguardando Data Previsao Pedido Pronto | Pedido existe mas o exportador ainda nao confirmou a data em que a mercadoria estara pronta |
| 3 | Pedido Pronto | Exportador confirmou que a mercadoria esta pronta para embarque |
| 4 | Pedido Transferido | Todo o saldo do pedido foi transferido para um embarque |
| 5 | Pedido Consolidado | Pedido foi consolidado em um container ou embarque especifico |

### 3.2 Gestao de Status pelo Usuario

Status sao **entidades gerenciadas pelo usuario**, nao valores fixos no codigo. Isso significa:

- O usuario pode criar novos status alem dos 5 padrao
- O usuario pode editar nome, cor e icone de qualquer status (inclusive os padrao)
- O usuario pode reordenar os status (afeta a ordem das abas)
- O usuario pode excluir status — exceto se houver pedidos associados a ele

### 3.3 Atributos de Cada Status

| Atributo | Tipo | Regra |
|----------|------|-------|
| Nome | Texto | Obrigatorio, unico por tenant |
| Cor | Hex (#RRGGBB) | Obrigatorio — exibida como badge e cor da aba |
| Icone | Phosphor Icons | Obrigatorio — exibido ao lado do nome |
| Ordem | Inteiro | Define sequencia das abas na tabela |

### 3.4 Regras de Transicao de Status

- **Nao ha fluxo forcado**: um pedido pode ir de qualquer status para qualquer outro status
- A transicao e feita manualmente pelo usuario (edicao inline ou edicao em massa)
- Excecao: o sistema atualiza o status automaticamente para "Pedido Transferido" quando o saldo do pedido chega a zero apos uma transferencia
- Excecao: o sistema atualiza o status automaticamente para "Pedido Consolidado" apos a acao de Consolidar ser confirmada

### 3.5 Regra de Exclusao de Status

- Um status que possui pedidos associados **nao pode ser excluido**
- O sistema exibe uma mensagem informando quantos pedidos estao vinculados ao status antes de bloquear a exclusao
- O usuario deve primeiro migrar os pedidos para outro status antes de poder excluir

### 3.6 Abas Geradas Automaticamente

- Cada status existente gera uma aba na parte superior da tabela
- A aba "Todos" e sempre a primeira e nao pode ser removida
- A ordem das abas segue a ordem definida pelo usuario nos status
- Cada aba exibe um contador de pedidos (ex: "Pedido Pronto (47)")

---

## 4. MATEMATICA DO SALDO — ELO SAGRADO

Esta secao define o nucleo matematico do modulo. Qualquer desvio nestas regras e um bug critico.

### 4.1 As 5 Colunas de Saldo

| Coluna | Descricao | Editavel? |
|--------|-----------|-----------|
| `quantidade_inicial` | Quantidade definida na criacao do item | Apenas via configuracao especifica |
| `quantidade_pronta` | Quantidade confirmada pelo exportador como pronta para embarque | Sim (inline) |
| `quantidade_a_transferir` | Quantidade pendente de transferencia (calculada) | Nao — calculada |
| `quantidade_transferida` | Quantidade ja transferida para embarque (acumulada) | Nao — acumulada pelo sistema |
| `saldo` | Quantidade restante disponivel (calculada) | Nao — calculada |

### 4.2 Formula do Saldo — Imutavel

```
Saldo = Quantidade Inicial - Quantidade Transferida - Quantidade Cancelada
```

Esta formula e absoluta. Nenhuma operacao pode alterar o saldo por outra via que nao seja:
- Aumentar `quantidade_transferida` (via acao Transferir)
- Aumentar `quantidade_cancelada` (via cancelamento de item)
- Editar `quantidade_inicial` (apenas quando configuracao especifica estiver ativa)

### 4.3 Regras Absolutas do Saldo

| Regra | Descricao |
|-------|-----------|
| Saldo nunca negativo | Por padrao, o sistema bloqueia qualquer operacao que resulte em saldo negativo |
| Transferencia nao excede saldo | `quantidade_transferida` nunca pode exceder `quantidade_inicial` (quando trava ativa) |
| `quantidade_inicial` imutavel por padrao | So editavel se configuracao "Permitir edicao de quantidade inicial" estiver ativa E usuario tiver permissao |
| Auditoria obrigatoria | Toda alteracao em qualquer campo de quantidade gera registro de auditoria imutavel |

### 4.4 Casas Decimais Configuráveis

- Para cada campo de quantidade (incluindo colunas customizadas de tipo numero): o tenant escolhe 0, 2, 4 ou 6 casas decimais
- A configuracao afeta tanto a exibicao quanto a validacao de entrada
- A configuracao e por tenant, nao por usuario
- Internamente, todos os campos de quantidade sao armazenados como `Decimal(18,6)`

### 4.5 Regra da Quantidade Inicial Editavel

| Cenario | Comportamento |
|---------|--------------|
| Configuracao desativada (padrao) | Campo `quantidade_inicial` bloqueado para todos os usuarios |
| Configuracao ativada + usuario sem permissao | Campo bloqueado — cursor nao-editavel |
| Configuracao ativada + usuario com permissao | Campo editavel inline |
| Apos edicao da quantidade inicial | Registro de auditoria gerado com valor anterior e novo valor |

### 4.6 Saldo Negativo — Modo Permissivo

Quando a configuracao "Travar Transferencia Acima do Saldo" estiver **desativada**:

- O sistema **permite** transferir quantidade acima do saldo disponivel
- O saldo resultante pode ser negativo
- A linha do pedido exibe aviso visual destacando o saldo negativo (cor vermelha)
- A operacao e registrada normalmente em auditoria
- Essa configuracao existe para casos onde o exportador entregou mais do que o pedido original previa

---

## 5. TOOLBAR — TODAS AS ACOES

A toolbar e a barra de acoes principal do modulo, localizada acima da tabela. Cada acao segue regras especificas de visibilidade, habilitacao e fluxo.

### 5.1 Novo Pedido

**Visibilidade:** Sempre visivel quando o contexto esta no nivel Pedido (standalone ou integrado).

**Habilitacao:** Sempre habilitada.

**Fluxo:**
1. Usuario clica "Novo Pedido"
2. Modal ou formulario lateral de criacao e aberto
3. Usuario preenche os campos
4. Confirmar → pedido criado com status inicial definido no formulario

**Campos Obrigatorios:**
- Numero do pedido (unico por tenant)
- Exportador (referencia a entidade do modulo de fornecedores ou texto livre)
- Status inicial (dropdown dos status existentes do tenant)

**Campos Opcionais:**
- Todos os demais campos do pedido
- Itens: quando configuracao "Permitir Pedidos Vazios" esta desativada, ao menos 1 item e obrigatorio

### 5.2 Novo Item

**Visibilidade:** Visivel quando o contexto esta no nivel Item (linha de pedido expandida e selecionada).

**Habilitacao:** Ativa quando um pedido esta expandido e selecionado.

**Fluxo:**
1. Usuario expande um pedido
2. Clica "Novo Item"
3. Modal de criacao de item e aberto, pre-associado ao pedido pai
4. Usuario preenche os campos
5. Confirmar → item criado e vinculado ao pedido

**Campos Obrigatorios:**
- Descricao do item
- Quantidade Inicial (com casas decimais conforme configuracao do tenant)

### 5.3 Excluir

**Visibilidade:** Sempre visivel.

**Habilitacao:** Ativa apenas quando ha um ou mais itens selecionados.

**Fluxo:**
1. Usuario seleciona pedidos
2. Clica "Excluir"
3. Checkout Modal abre com lista completa dos pedidos que serao excluidos
4. Sistema identifica e destaca pedidos que NAO podem ser excluidos com motivo
5. Usuario confirma
6. Apenas os pedidos elegíveis sao excluidos

**Regras de Bloqueio de Exclusao:**

| Condicao | Comportamento |
|----------|--------------|
| Pedido com `quantidade_transferida > 0` | Nao pode ser excluido — exibe aviso na lista do modal |
| Pedido com status "Consolidado" | Nao pode ser excluido |
| Pedido com embarque autorizado | Nao pode ser excluido |

**Exclusao em Cascata:**
- Excluir um pedido exclui automaticamente todos os seus itens
- O registro de exclusao e gerado na auditoria (soft delete ou hard delete conforme configuracao)
- A acao gera registro de auditoria com usuario, timestamp e lista de entidades excluidas

### 5.4 Selecionar Tudo

**Visibilidade:** Sempre visivel.

**Habilitacao:** Sempre ativa.

**Comportamento:**
- Primeira acao: seleciona todos os pedidos da **pagina atual**
- Segunda acao disponivel: "Selecionar todos (incluindo outras paginas)" — seleciona todos os IDs que passam pelos filtros ativos, independente da pagina
- A selecao de paginas seguintes carrega apenas os IDs (nao os dados completos) para economizar memoria
- **Limite global:** 500 itens para operacoes em lote — se a selecao exceder 500, o sistema exibe aviso e limita a 500

### 5.5 Transferir

**Visibilidade:** Sempre visivel.

**Habilitacao:** Ativa quando ha pedidos selecionados com `saldo > 0`.

**Fluxo Completo (preview → confirmar):**

1. Usuario seleciona um ou mais pedidos
2. Clica "Transferir"
3. **Modal de Preview** abre com:
   - Lista de todos os pedidos selecionados
   - Saldo disponivel de cada pedido
   - Campo editavel de "quantidade a transferir" por pedido (pre-preenchido com o saldo total)
   - Campo de destino (processo ou embarque) — obrigatorio
4. Usuario pode ajustar as quantidades no preview (nao precisa transferir o saldo inteiro)
5. Validacoes em tempo real no preview:
   - Quantidade nao pode exceder saldo (quando trava ativa)
   - Destino e obrigatorio
6. Usuario clica Confirmar
7. Sistema executa a transferencia, atualiza `quantidade_transferida` e `saldo` de cada item
8. Se saldo do pedido chega a zero: status atualizado automaticamente para "Pedido Transferido"
9. Auditoria gerada para cada pedido e item afetado
10. Toast de sucesso + tabela atualiza

**Configuracao "Travar quando tentar transferir mais do que o saldo":**
- Quando ativa (padrao): confirmacao e bloqueada se qualquer item tiver quantidade > saldo
- Quando desativada: permite transferir acima do saldo (saldo fica negativo com aviso visual)

### 5.6 Consolidar

**Visibilidade:** Sempre visivel.

**Habilitacao:** Ativa quando ha pedidos selecionados elegiveis para consolidacao.

**Fluxo Completo (preview → confirmar):**

1. Usuario seleciona pedidos
2. Clica "Consolidar"
3. **Modal de Preview** abre com:
   - Lista de pedidos selecionados e suas quantidades
   - Container ou embarque destino (campo de selecao)
   - Validacoes: por padrao, pedido deve ter status "Pedido Pronto" para ser consolidado
   - Configuracao alternativa: permite consolidar de qualquer status (configuracao do modulo)
4. Usuario confirma
5. Pedidos marcados como consolidados: `status` atualizado para "Pedido Consolidado"
6. Icone visual de consolidado aparece na linha do pedido (Seal fill, cor success)
7. Auditoria gerada

**Estado Visual Pos-Consolidacao:**
- Icone Seal fill (Phosphor Icons) na linha do pedido
- Cor do icone: `var(--color-success)`
- Pedidos consolidados nao podem ser excluidos

### 5.7 Autorizar Embarque

**Visibilidade:** Sempre visivel.

**Habilitacao:** Ativa quando ha pedidos selecionados consolidados ou prontos para embarque.

**Fluxo Completo (preview → confirmar):**

1. Usuario seleciona pedidos
2. Clica "Autorizar Embarque"
3. **Modal de Preview** abre com:
   - Lista de pedidos afetados
   - Valores totais (quantidade, valor monetario se disponivel)
   - Documentos necessarios (checklist, se configurado)
4. Usuario confirma
5. Pedidos recebem flag de "embarque autorizado"
6. Icone visual na linha: Anchor fill (Phosphor Icons), cor `#38bdf8`
7. Auditoria gerada com usuario e timestamp

**Restricao Pos-Autorizacao:**
- Pedidos com embarque autorizado nao podem ser excluidos
- Pedidos com embarque autorizado nao podem ter quantidade_transferida revertida

### 5.8 Integrar

**Visibilidade:** Sempre visivel (quando integracao esta configurada).

**Habilitacao:** Depende da configuracao de integracao do tenant.

**Funcionalidade:**
- Abre modal de integracao com duas opcoes:
  1. **Importar do ERP**: busca pedidos do sistema ERP conectado via Conector ERP (produto existente no Gravity)
  2. **Exportar para ERP**: envia pedidos selecionados para o sistema ERP
- Tambem conecta com Cockpit API para integracoes externas personalizadas

**Dependencias:**
- Requer que o produto Conector ERP esteja instalado e configurado no workspace
- Credenciais e endpoints do ERP sao gerenciados no modulo Conector ERP
- Este modulo nao armazena credenciais de ERP diretamente

### 5.9 Duplicar

**Visibilidade:** Sempre visivel.

**Habilitacao:** Ativa quando ha um ou mais pedidos selecionados.

**Fluxo:**
1. Usuario seleciona pedidos
2. Clica "Duplicar"
3. Checkout Modal exibe lista dos pedidos que serao duplicados
4. Usuario confirma
5. Copias sao criadas

**Regras da Copia:**

| Campo | Comportamento na Copia |
|-------|----------------------|
| `numero_pedido` | Original + sufixo "-COPIA" (ex: "PO-2026-001-COPIA") |
| `status` | Resetado para "Pedido Criado" |
| `quantidade_inicial` | Mantida igual ao original |
| `quantidade_transferida` | Resetada para 0 |
| `quantidade_consolidada` | Resetada para 0 |
| `quantidade_pronta` | Resetada para 0 |
| `saldo` | Igual a `quantidade_inicial` (zerado de transferencias) |
| Itens | Todos os itens do pedido original sao duplicados junto com o pai |
| Campos customizados | Mantidos iguais ao original |
| Auditoria | Registro gerado para cada pedido e item duplicado |

### 5.10 Edicao em Massa

**Visibilidade:** Sempre visivel.

**Habilitacao:** Ativa quando ha 2 ou mais pedidos selecionados.

**Fluxo Completo (preview → confirmar):**

1. Usuario seleciona 2 ou mais pedidos
2. Clica "Edicao em Massa"
3. Modal abre com:
   - Dropdown: usuario escolhe qual campo alterar (lista de todos os campos editáveis)
   - Campo de entrada: usuario digita o novo valor
4. **Preview**: lista todos os pedidos afetados com coluna "Valor Atual" e coluna "Novo Valor"
5. Usuario revisa e confirma
6. Sistema aplica o novo valor a todos os pedidos selecionados
7. Auditoria gerada para cada pedido alterado individualmente

**Campos Bloqueados para Edicao em Massa:**

| Campo | Motivo do Bloqueio |
|-------|--------------------|
| `id` | Identificador imutavel |
| `tenant_id` | Isolamento de tenant |
| `product_id` | Associacao de produto |
| `created_at`, `updated_at` | Gerenciados automaticamente |
| `quantidade_inicial` | Regra do elo sagrado (editavel separadamente via configuracao) |
| `quantidade_transferida` | Calculado pelo sistema |
| `saldo` | Calculado pelo sistema |
| `quantidade_consolidada` | Calculado pelo sistema |

**Validacoes da Edicao em Massa:**
- Campos de quantidade: casas decimais conforme configuracao do tenant
- Campos de data: formato ISO 8601
- Campos select: valor deve estar na lista de opcoes validas

**Caso de Uso Tipico:**
> Selecionar 50 pedidos e alterar todos para Incoterm FOB de uma vez, sem editar linha por linha.

### 5.11 Importar

**Visibilidade:** Sempre visivel.

**Habilitacao:** Ativa para usuarios com permissao de "criar pedido".

**Formatos Suportados:**

| Formato | Extensao |
|---------|---------|
| Excel | `.xlsx` |
| CSV | `.csv` |
| Texto delimitado | `.txt` |
| JSON | `.json` |
| XML | `.xml` |

**Fluxo Completo:**

1. Usuario clica "Importar"
2. Modal de importacao abre com opcoes de fonte:

   **Opcao A — Upload de Arquivo:**
   - Interface de drag-and-drop ou selecao de arquivo
   - Tamanho maximo: 10MB por arquivo
   - Sistema processa o arquivo e exibe preview

   **Opcao B — Cockpit API:**
   - Importa via integracao configurada no Cockpit API
   - Usuario seleciona a integracao ativa

   **Opcao C — Smart Read (Em breve — Fase 2):**
   - Botao visivel com badge "Em breve"
   - Desabilitado na versao atual

3. **Preview da Importacao:**
   - Total de linhas encontradas no arquivo
   - Linhas validas / linhas com erro
   - Preview das primeiras 10 linhas em formato de tabela
   - Erros identificados por linha: campo obrigatorio faltando, formato invalido, valor fora do range

4. **Opcoes antes de confirmar:**
   - Importar apenas linhas validas (ignorando as com erro)
   - Corrigir erros manualmente no preview antes de confirmar

5. Usuario confirma → sistema importa os registros validos

6. **Resultado da importacao:**
   - Toast com: "X pedidos importados com sucesso, Y com erro"
   - Relatorio de erros disponivel para download

**Rate Limit de Importacao:**
- Maximo de 5 importacoes por minuto por tenant
- Se excedido: erro 429 com tempo de espera informado

**Campos Obrigatorios na Importacao:**

| Campo | Observacao |
|-------|-----------|
| `numero_pedido` | Unico por tenant |
| `exportador` | Nome ou ID do exportador |
| Ao menos 1 item | Com `quantidade_inicial` preenchida |

### 5.12 Exportar

**Visibilidade:** Sempre visivel.

**Habilitacao:** Sempre ativa (exporta o que estiver na visao atual).

**Formatos Suportados:**

| Formato | Extensao |
|---------|---------|
| Excel | `.xlsx` |
| CSV | `.csv` |
| Texto delimitado | `.txt` |
| XML | `.xml` |
| JSON | `.json` |

**Regras da Exportacao:**

| Regra | Detalhe |
|-------|---------|
| Filtros aplicados | Exporta apenas os registros que passam pelos filtros ativos |
| Colunas | Usuario escolhe: todas as colunas ou apenas colunas visiveis |
| Colunas customizadas | Incluidas na exportacao |
| Casas decimais | Respeitadas conforme configuracao do tenant |
| Paginacao | Exporta todos os registros (nao apenas a pagina atual) |

### 5.13 Criar Nova Coluna

**Visibilidade:** Sempre visivel.

**Habilitacao:** Ativa para usuarios com permissao de administracao do modulo.

**Fluxo:**
1. Usuario clica "Criar Nova Coluna"
2. Modal `CriarColunaModal` abre
3. Usuario preenche os campos da nova coluna
4. Confirma → coluna criada e disponivel para todos os usuarios do tenant

**Campos do Modal:**

| Campo | Tipo | Regra |
|-------|------|-------|
| Nome da coluna | Texto | Obrigatorio, unico por tenant |
| Tipo | Enum | Obrigatorio: texto / numero / data / select / booleano |
| Casas decimais | Enum | Apenas para tipo numero: 0, 2, 4, 6 |
| Opcoes | Lista de texto | Apenas para tipo select — maximo 50 opcoes |
| Exibida por padrao | Booleano | Define se novos usuarios veem a coluna inicialmente |

**Tipos e Suas Regras de Filtro:**

| Tipo | Filtros Disponiveis | Indexacao |
|------|--------------------|-----------| 
| Texto | Igualdade, busca parcial (GIN trgm) | GIN automatico |
| Numero | Igualdade, maior que, menor que, entre (range) | Expression index automatico |
| Data | Igualdade, antes de, depois de, entre (range) | Expression index automatico |
| Select | Igualdade (chip de opcoes) | GIN automatico |
| Booleano | Sim/Nao | GIN automatico |

**Limites por Tenant:**

| Limite | Valor |
|--------|-------|
| Maximo de colunas customizadas | 30 colunas |
| Maximo de expression indexes (tipo numero e data) | 5 por tenant |

**Indexacao em Background:**
- Colunas de tipo numero e data disparam `CREATE INDEX CONCURRENTLY` em background apos criacao
- Durante a indexacao: badge "indexando..." aparece no cabecalho da coluna
- Filtros funcionam durante a indexacao, porem com performance reduzida para este campo especifico
- Apos conclusao da indexacao: performance normal (target ≤ 80ms)

---

## 6. CONFIGURACOES DO MODULO

O painel de configuracoes e acessivel via icone de engrenagem (⚙) na toolbar. Apenas administradores do workspace podem alterar configuracoes.

### 6.1 Permitir Pedidos Vazios

| Atributo | Valor |
|----------|-------|
| Padrao | Desativado |
| Quando ativo | Permite criar pedido sem nenhum item |
| Quando desativado | Pedido precisa ter ao menos 1 item para ser salvo |

### 6.2 Permitir Edicao de Quantidade Inicial

| Atributo | Valor |
|----------|-------|
| Padrao | Desativado |
| Quando ativo | Usuarios com permissao especifica podem editar `quantidade_inicial` via edicao inline |
| Quando desativado | Campo `quantidade_inicial` bloqueado para todos |
| Auditoria | Toda edicao gera registro com valor anterior e novo valor |

### 6.3 Travar Transferencia Acima do Saldo

| Atributo | Valor |
|----------|-------|
| Padrao | Ativo |
| Quando ativo | Sistema bloqueia confirmacao de transferencia que exceda o saldo disponivel |
| Quando desativado | Permite transferir acima do saldo — saldo fica negativo com aviso visual vermelho |

### 6.4 Organizar e Exibir Colunas

Abre o gerenciador de colunas do tenant:
- Arrastar e soltar para reordenar colunas (define ordem padrao para novos usuarios)
- Toggle para mostrar/ocultar cada coluna no padrao do workspace
- Esta mesma opcao esta disponivel no botao de colunas nativo da tabela

### 6.5 Gerenciar Status

CRUD completo de status:
- **Criar**: define nome, cor (hex picker), icone (seletor de Phosphor Icons), posicao na ordem
- **Editar**: qualquer campo do status, inclusive dos 5 status padrao
- **Reordenar**: drag-and-drop define a sequencia das abas
- **Excluir**: nao permitido se houver pedidos associados ao status

### 6.6 Casas Decimais por Campo

- Para cada campo numerico do modulo (incluindo colunas customizadas de tipo numero): escolher entre 0, 2, 4 ou 6 casas decimais
- A configuracao afeta tanto a exibicao visual quanto a validacao de entrada
- Configuracao por tenant, nao por usuario individual
- A alteracao das casas decimais nao converte dados existentes — apenas muda exibicao e validacao a partir da alteracao

---

## 7. EDICAO INLINE

A edicao inline permite alterar o valor de um campo diretamente na celula da tabela, sem abrir um modal separado.

### 7.1 Fluxo de Edicao Inline

| Etapa | Comportamento |
|-------|--------------|
| Clicar na celula | Input aparece com valor atual — latencia 0ms |
| Editar + Enter ou Tab | Valor otimista aparece imediatamente na tela |
| PATCH em background | Requisicao enviada para o servidor de forma assincrona |
| Servidor retorna 200 | Nada muda na tela — valor otimista era correto |
| Servidor retorna 409 | Rollback visual + modal de conflito |
| Servidor retorna 5xx | Rollback do valor + toast de erro |

### 7.2 Campos Bloqueados para Edicao Inline

Estes campos nunca sao editaveis por esta via:

| Campo | Motivo |
|-------|--------|
| `id` | Identificador imutavel |
| `tenant_id` | Isolamento de tenant |
| `product_id` | Associacao de produto |
| `created_at`, `updated_at` | Gerenciados automaticamente |
| `quantidade_transferida` | Calculado automaticamente pelo sistema |
| `saldo` | Calculado automaticamente pelo sistema |
| `quantidade_inicial` | Bloqueado por padrao — liberavel via configuracao |

### 7.3 Resolucao de Conflito (409)

Quando dois usuarios editam o mesmo campo simultaneamente:

1. Sistema detecta o conflito via timestamp de versao
2. Retorna HTTP 409 com: valor local e valor atual no servidor
3. Highlight vermelho aparece nos campos em conflito
4. Modal de conflito abre automaticamente com:
   - Descricao do conflito
   - Coluna "Seu valor" vs coluna "Valor no servidor"
5. Usuario escolhe:
   - **Manter meu valor**: forca o PATCH com o valor local (sobrescreve)
   - **Aceitar valor do servidor**: descarta a edicao local

### 7.4 Controle de Permissao por Campo

- Todo campo editavel verifica a permissao do usuario via Configurador API **antes** de renderizar o input
- Campo sem permissao: exibe cursor nao-editavel, nao abre input ao clicar
- A verificacao e granular: usuario pode ter permissao para editar o campo X mas nao o campo Y
- Esta granularidade existe no modelo de dados, mas a configuracao granular por campo e Fase 2 — na versao atual, a permissao e baseada no role (admin pode tudo, viewer nao edita nada)

---

## 8. SELECAO EM MASSA

### 8.1 Checkbox de Selecao

- Coluna mais a esquerda de cada linha contem um checkbox
- Checkbox no cabecalho: seleciona/deseleciona todos os pedidos da pagina atual
- Ao selecionar: barra de acoes em lote aparece abaixo da toolbar

### 8.2 Barra de Acoes em Lote

Exibida sempre que ha pedidos selecionados:
- Texto: "X itens selecionados"
- Acoes disponiveis contextualmente (Transferir, Consolidar, Excluir, etc.)
- Botao "Limpar selecao" no final da barra

### 8.3 Selecao Entre Paginas

- Selecao padrao: apenas os itens da pagina atual
- Opcao adicional: "Selecionar todos (incluindo outras paginas)"
  - Busca todos os IDs que passam pelos filtros ativos (sem carregar dados completos)
  - Exibe aviso: "Todos os X pedidos desta busca estao selecionados"
- Selecao persiste ao navegar entre paginas (armazenada como `Set<string>` com IDs)

### 8.4 Limite de Selecao

| Parametro | Valor |
|-----------|-------|
| Limite para operacoes em lote | 500 itens |
| Comportamento ao exceder | Aviso exibido, selecao limitada a 500 |

### 8.5 Itens NAO Selecionaveis

- Itens filhos (nivel 2 na hierarquia) nao possuem checkbox
- Apenas Pedidos pai (nivel 1) sao selecionaveis para operacoes em lote
- Operacoes sobre itens sao feitas via edicao inline ou acoes no menu de contexto do item

---

## 9. ABAS POR STATUS

### 9.1 Estrutura das Abas

- Localizadas no topo da tabela, acima do cabecalho de colunas
- Geradas **dinamicamente** com base nos status existentes do tenant
- A aba "Todos" e sempre a primeira e nao pode ser removida ou reordenada

### 9.2 Comportamento das Abas

| Comportamento | Detalhe |
|--------------|---------|
| Clicar em uma aba | Filtra a tabela pelo status correspondente |
| Contador | Cada aba exibe a contagem de pedidos naquele status ex: "Pedido Pronto (47)" |
| Atualizacao do contador | Atualiza automaticamente ao modificar pedidos (sem necessidade de recarregar a pagina) |
| Ordem | Segue a ordem definida pelo usuario na configuracao de status |
| Nova aba | Criada automaticamente ao criar um novo status |
| Aba removida | Removida automaticamente ao excluir um status |

### 9.3 Aba "Todos"

- Sempre primeira na sequencia
- Nao filtra por status — exibe todos os pedidos do tenant
- Contador exibe o total geral de pedidos (somando todos os status)
- Nao pode ser removida ou reordenada

---

## 10. LINHAS EXPANSIVEIS — HIERARQUIA

### 10.1 Pedido (Linha Pai — Nivel 1)

| Elemento | Detalhe |
|----------|---------|
| Indicador | Chevron ▶ na primeira celula indica que o pedido tem itens filhos |
| Expandir | Clicar no chevron OU na linha do pedido expande/recolhe os itens |
| Carregamento | Lazy loading — itens so sao buscados no momento da expansao |
| Contador | Badge com numero de itens: ex "3 itens" |
| Icones de estado | Visíveis na linha do pedido, indicam estado geral (consolidado, autorizado, etc.) |

**Icones de Estado na Linha do Pedido:**

| Icone | Significado | Cor |
|-------|-------------|-----|
| Seal fill | Pedido consolidado | `var(--color-success)` |
| Anchor fill | Embarque autorizado | `#38bdf8` |

### 10.2 Item (Linha Filho — Nivel 2)

| Elemento | Detalhe |
|----------|---------|
| Indentacao | 24px em relacao a linha pai |
| Conector visual | `├` para itens intermediarios, `└` para o ultimo item |
| Selecionavel | Nao — itens nao tem checkbox, apenas pedidos pai |
| Edicao | Editavel inline (sujeito a permissoes) |

**Icones de Estado por Item:**

| Icone | Tipo | Significado | Cor |
|-------|------|-------------|-----|
| Seta direita (fill) | ItemTransferido | Quantidade do item totalmente transferida | `var(--color-accent)` |
| Check circle (fill) | ItemConsolidado | Item incluido em consolidacao | `var(--color-success)` |
| Circle half (fill) | ItemParcial | Quantidade parcialmente transferida (saldo > 0 mas transferida > 0) | `var(--color-warning)` |

### 10.3 Processo (Linha Avo — Nivel 0 — Modo Integrado)

| Elemento | Detalhe |
|----------|---------|
| Indentacao | Nenhuma (nivel raiz) |
| Expansao | Expande para mostrar Pedidos filhos |
| Gestao | Processo nao e gerenciado por este modulo |
| Expansao dupla | Pedidos expandem para mostrar Itens (3 niveis maximo) |
| Selecionavel | Nao — apenas Pedidos (nivel 1) sao selecionaveis |

---

## 11. FILTROS

### 11.1 Implementacao

Os filtros seguem a mesma implementacao da `tabela-camadas-global` existente no nucleo-global. Nenhuma mudanca de comportamento e introduzida.

### 11.2 Interface de Filtros

- Popover de filtros acessado pelo botao "Filtros" na toolbar
- Contador de filtros ativos exibido no botao ex: "Filtros (3)"
- Botao "Limpar X filtros" quando ha filtros ativos

**Dentro do Popover:**
- Campo de busca para localizar rapidamente o filtro desejado
- Filtros organizados por categoria (similar ao painel de campos do Excel)
- Colunas favoritadas aparecem no topo da lista
- Chips toggleaveis para cada valor disponivel

### 11.3 Tipos de Filtro por Tipo de Coluna

| Tipo de Coluna | Interface de Filtro | Operacoes |
|---------------|--------------------|-----------| 
| Texto | Chips de valores + busca textual | Igualdade, busca parcial |
| Select | Chips das opcoes disponiveis | Igualdade |
| Numero | Campos de range | Maior que, menor que, entre |
| Data | Seletores de data range | Antes de, depois de, entre |
| Booleano | Chips Sim / Nao | Igualdade |

### 11.4 Combinacao de Filtros

- Filtros de colunas diferentes combinam com **AND** (todos devem ser atendidos)
- Multiplos valores no mesmo filtro combinam com **OR** (qualquer um atende)
- Filtros combinam com a busca em tempo real simultaneamente

### 11.5 Abrangencia dos Filtros

- Todas as colunas fixas do sistema sao filtráveis
- Todas as colunas customizadas do tenant sao filtráveis
- Os filtros retornam resultados paginados via cursor

---

## 12. BUSCA EM TEMPO REAL

### 12.1 Campo de Busca

- Localizado na toolbar, a esquerda das acoes
- Placeholder: "Buscar por numero do pedido ou exportador..."
- Botao X para limpar a busca

### 12.2 Comportamento

| Parametro | Valor |
|-----------|-------|
| Debounce | 300ms antes de chamar a API |
| Minimo de caracteres | 2 caracteres para disparar busca |
| Campos buscados | Numero do Pedido + Nome do Exportador |
| Tecnologia | GIN index + pg_trgm (PostgreSQL) |
| Combinacao | Busca combinada com filtros ativos simultaneamente |

### 12.3 Campos NAO Buscados pela Busca Global

A busca global cobre apenas os 2 campos acima. Para buscar em outros campos, o usuario deve usar os filtros por coluna.

---

## 13. ORDENACAO

### 13.1 Implementacao

Mesma implementacao da `tabela-camadas-global` existente. Nenhuma mudanca de comportamento.

### 13.2 Comportamento

| Acao | Resultado |
|------|-----------|
| 1 clique no cabecalho | Ordenacao crescente (A→Z, 0→9, mais antigo→mais novo) |
| 2 cliques no cabecalho | Ordenacao decrescente (Z→A, 9→0, mais novo→mais antigo) |
| 3 cliques no cabecalho | Remove a ordenacao |
| Icone de seta | Exibido no cabecalho indicando direcao e campo ativo |

### 13.3 Integracao com Paginacao

- A ordenacao e enviada como parametro para a API junto com o cursor de paginacao
- A paginacao cursor (keyset) e integrada com a ordenacao para manter consistencia
- Mudar a ordenacao reseta o cursor para a primeira pagina

---

## 14. PREFERENCIAS DE COLUNAS POR USUARIO

### 14.1 O que e Salvo

Cada usuario tem suas proprias preferencias armazenadas no banco de dados (tabela `PedidoPreferenciaUsuario`):
- Quais colunas estao visiveis
- Em qual ordem as colunas aparecem

### 14.2 Regras de Preferencia

| Cenario | Comportamento |
|---------|--------------|
| Novo usuario | Herda o padrao do workspace (definido pelo admin via "Organizar e Exibir Colunas") |
| Usuario arrasta coluna | Nova ordem e salva automaticamente no banco |
| Usuario oculta coluna | Preferencia salva automaticamente no banco |
| Troca de dispositivo | Mesmas preferencias (banco, nao localStorage) |
| Usuario A oculta coluna X | Nao afeta o usuario B |
| Botao "Restaurar padrao" | Volta ao padrao definido pelo admin do workspace |

### 14.3 Armazenamento

- Persistido no banco de dados, nao no localStorage do navegador
- Garante consistencia entre computadores, navegadores e sessoes
- Tabela: `PedidoPreferenciaUsuario` com `user_id`, `tenant_id`, `coluna_id`, `visivel`, `ordem`

---

## 15. COLUNAS CUSTOMIZADAS — REGRAS DE NEGOCIO

### 15.1 Criacao de Coluna

Detalhado na secao 5.13. Resumo das regras de criacao:

| Regra | Detalhe |
|-------|---------|
| Criador | Qualquer usuario com permissao de admin do modulo |
| Visibilidade | Coluna criada aparece para todos os usuarios do tenant |
| Preferencia individual | Cada usuario pode ocultar a coluna nas suas preferencias |
| Limite | 30 colunas por tenant |

### 15.2 Edicao de Valores

- Colunas customizadas sao editáveis inline (sujeito a permissoes do usuario)
- Valores armazenados em JSONB no registro do pedido ou item
- Casas decimais sao respeitadas na exibicao e na validacao de entrada
- A edicao inline segue o mesmo fluxo das colunas fixas (secao 7)

### 15.3 Armazenamento Interno

- Valores armazenados em campo `dados_customizados JSONB` no modelo `Pedido` e `PedidoItem`
- Chave: `coluna_{id}` onde `id` e o ID da coluna customizada
- Nao ha colunas fisicas adicionais na tabela para cada coluna customizada

### 15.4 Exclusao de Coluna

| Etapa | Detalhe |
|-------|---------|
| 1. Confirmacao | Modal de aviso informando que os dados serao perdidos permanentemente |
| 2. Remover coluna | Remove o registro da coluna do catalogo |
| 3. Remover valores | Remove os valores de todos os pedidos e itens (irreversivel) |
| 4. Remover index | Remove o expression index se existir (para tipo numero/data) |
| 5. Auditoria | Registro gerado para a exclusao da coluna |

A exclusao e **irreversivel**. Os valores removidos nao podem ser recuperados.

### 15.5 Performance e Indexacao

| Fase | Performance |
|------|-------------|
| Durante indexacao (tipo numero/data) | Filtros funcionam, porem mais lentos para este campo |
| Apos indexacao concluida | ≤ 80ms por query de filtro |
| Tipo texto/select | GIN index criado imediatamente |
| Badge "indexando..." | Visivel no cabecalho da coluna durante o processo |

---

## 16. CHECKOUT MODAL — FLUXO DE CONFIRMACAO

O Checkout Modal e o componente de confirmacao usado antes de executar acoes destrutivas ou de alto impacto.

### 16.1 Acoes que Disparam o Checkout Modal

- Transferir (em massa)
- Consolidar
- Autorizar Embarque
- Excluir (em massa)
- Edicao em Massa

### 16.2 Estrutura do Modal

| Secao | Conteudo |
|-------|---------|
| Titulo | Nome da acao ex: "Confirmar Transferencia" |
| Resumo de impacto | "X pedidos serao afetados, Y itens, total de Z unidades" |
| Tabela de preview | Lista detalhada do que sera feito, item por item |
| Campos ajustaveis | Para Transferir e Edicao em Massa: usuario pode alterar valores no modal antes de confirmar |
| Avisos | Alertas contextuais ex: "Pedido X ja foi parcialmente transferido" |
| Botoes | Cancelar (sem acao) \| Confirmar (executa) |

### 16.3 Regras do Modal

| Regra | Detalhe |
|-------|---------|
| Acao so executada apos Confirmar | Fechar o modal sem confirmar: zero alteracao no banco |
| Sucesso | Toast de sucesso + tabela atualiza automaticamente |
| Erro | Toast de erro + dados nao alterados (rollback automatico) |
| Campos ajustaveis | Permitidos apenas em Transferir e Edicao em Massa |
| Validacao em tempo real | Validacoes executadas enquanto usuario edita campos no modal |

---

## 17. SMART READ (FASE 2)

### 17.1 Descricao

Smart Read e um produto legado do ecossistema Gravity especializado em leitura inteligente de documentos via IA.

### 17.2 Integracao com o Modulo de Pedidos

- Na tela de importacao: botao "Smart Read" visivel com badge "Em breve"
- O botao esta **desabilitado** na versao atual (Fase 1)

### 17.3 Comportamento Quando Integrado (Fase 2)

1. Usuario clica "Smart Read" no modal de importacao
2. Interface de upload aceita: PDF, imagens de invoice, proforma invoice, packing list
3. Smart Read processa o documento via IA
4. Sistema sugere os campos do pedido preenchidos automaticamente com os dados extraidos
5. Preview e exibido para revisao do usuario
6. Usuario ajusta campos incorretos ou incompletos
7. Usuario confirma → dados importados como pedidos/itens normais

---

## 18. ESTADOS VISUAIS DA TABELA

### 18.1 Carregando (Loading)

- Skeleton animado em todas as celulas da tabela
- Toolbar e cabecalho de colunas permanecem visiveis durante o carregamento
- Nenhuma interacao disponivel durante o skeleton inicial

### 18.2 Tabela Vazia (Sem Dados, Sem Filtros)

| Elemento | Conteudo |
|----------|---------|
| Icone | Icone centralizado (caixa vazia ou equivalente) |
| Titulo | "Nenhum pedido encontrado" |
| Descricao | "Crie o primeiro pedido para comecar" |
| Botao de acao | "Novo Pedido" |

### 18.3 Tabela Vazia com Filtros Ativos

| Elemento | Conteudo |
|----------|---------|
| Titulo | "Nenhum resultado para os filtros aplicados" |
| Descricao | "Tente ajustar ou limpar os filtros para ver os pedidos" |
| Botao de acao | "Limpar filtros" |

### 18.4 Erro de Rede

| Elemento | Comportamento |
|----------|--------------|
| Toast | Erro exibido no canto superior direito |
| Linha com erro | Icone de alerta na linha afetada |
| Botao de retry | Visivel para tentar novamente |

### 18.5 Salvando (Edicao Inline em Progresso)

| Elemento | Comportamento |
|----------|--------------|
| Spinner | Exibido na celula sendo salva |
| Fundo da celula | Levemente destacado (diferente do estado normal) |

### 18.6 Salvo com Sucesso

| Elemento | Comportamento |
|----------|--------------|
| Checkmark | Aparece brevemente na celula (400ms) |
| Estado | Volta ao normal apos o checkmark |

### 18.7 Conflito de Edicao (HTTP 409)

| Elemento | Comportamento |
|----------|--------------|
| Highlight | Vermelho nos campos em conflito |
| Modal automatico | Abre explicando o conflito com dois valores: local vs servidor |
| Opcao 1 | "Manter meu valor" — forca PATCH (sobrescreve) |
| Opcao 2 | "Aceitar valor do servidor" — descarta edicao local |

### 18.8 Saldo Negativo (Modo Permissivo)

| Elemento | Comportamento |
|----------|--------------|
| Celula de saldo | Cor vermelha + icone de aviso |
| Tooltip | Explica que o saldo esta negativo |
| Linha | Destaque sutil indicando estado anormal |

---

## 19. SEGURANCA E PERMISSOES

### 19.1 Modelo de Permissoes

| Nivel | Descricao |
|-------|-----------|
| Fase 1 (atual) | Permissao baseada em role: admin pode tudo, viewer nao edita |
| Fase 2 (roadmap) | Permissao granular por campo — usuario pode editar campo X mas nao Y |

### 19.2 Permissoes por Acao

| Acao | Permissao Necessaria |
|------|---------------------|
| Visualizar pedidos | Viewer ou superior |
| Criar pedido | Permissao "criar pedido" |
| Editar pedido (campos basicos) | Permissao "editar pedido" |
| Editar `quantidade_inicial` | Permissao especifica + configuracao ativa |
| Excluir pedido | Permissao "excluir pedido" |
| Transferir | Permissao "transferir pedido" |
| Consolidar | Permissao "consolidar pedido" |
| Autorizar Embarque | Permissao "autorizar embarque" |
| Importar pedidos | Permissao "criar pedido" |
| Exportar pedidos | Viewer ou superior |
| Criar coluna customizada | Admin do workspace |
| Alterar configuracoes do modulo | Admin do workspace |

### 19.3 Verificacao de Permissao em Edicao Inline

- Antes de renderizar o input em uma celula, o sistema verifica a permissao do usuario via **Configurador API**
- Se sem permissao: cursor nao-editavel, input nao abre ao clicar
- A verificacao ocorre no cliente (baseada no token de sessao) e e validada novamente no servidor no PATCH

### 19.4 Isolamento de Tenant

- Todo acesso ao banco de dados inclui filtro por `tenant_id`
- Nenhuma query retorna dados de outro tenant
- `tenant_id` e injetado automaticamente pelo middleware — nunca recebido do cliente
- Colunas customizadas, status e preferencias sao isolados por tenant

### 19.5 Regras de Seguranca de Dados

| Regra | Implementacao |
|-------|--------------|
| Validacao de input | Zod antes de qualquer operacao no banco |
| JWT | Validado via `@clerk/backend` em todas as rotas protegidas |
| Chamadas inter-servico | Header `x-internal-key` obrigatorio |
| Logs | Sem `console.log` expondo dados de pedidos ou quantidades financeiras |
| Variaveis de ambiente | Nunca hardcoded — sempre via `.env` |
| Erros | Via `AppError` — nunca `res.status().json()` direto |

---

## 20. AUDITORIA

### 20.1 Principio

Toda operacao que **modifica dados** gera um registro imutavel no servico de Historico do Gravity. Os registros de auditoria nao podem ser editados ou excluidos.

### 20.2 Operacoes Auditadas

| Operacao | Registros Gerados |
|----------|------------------|
| Criar pedido | 1 registro por pedido criado |
| Editar qualquer campo do pedido | 1 registro por campo alterado |
| Editar `quantidade_inicial` | 1 registro com valor anterior e novo valor |
| Transferir | 1 registro por pedido transferido, com quantidade e destino |
| Consolidar | 1 registro por pedido consolidado |
| Autorizar Embarque | 1 registro por pedido autorizado, com usuario e timestamp |
| Excluir | 1 registro marcando a exclusao (soft delete ou hard delete) |
| Importar | 1 registro do lote completo + 1 por pedido importado |
| Duplicar | 1 registro por pedido duplicado (origem e destino) |
| Edicao em Massa | 1 registro por pedido alterado |
| Criar coluna customizada | 1 registro com definicao da coluna |
| Editar coluna customizada | 1 registro com valores anterior e novo |
| Excluir coluna customizada | 1 registro com dados da coluna excluida |
| Criar status | 1 registro |
| Editar status | 1 registro com valores anterior e novo |
| Excluir status | 1 registro |

### 20.3 Estrutura de Cada Registro de Auditoria

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | UUID | Identificador unico do registro |
| `tenant_id` | String | Tenant ao qual pertence o registro |
| `usuario_id` | String | ID do usuario que realizou a acao (Clerk user ID) |
| `usuario_email` | String | Email do usuario no momento da acao |
| `acao` | Enum | Tipo da acao (CRIAR, EDITAR, EXCLUIR, TRANSFERIR, etc.) |
| `entidade` | Enum | Entidade afetada (PEDIDO, PEDIDO_ITEM, STATUS, COLUNA) |
| `entidade_id` | String | ID da entidade afetada |
| `valores_antes` | JSONB | Estado dos campos antes da alteracao |
| `valores_depois` | JSONB | Estado dos campos apos a alteracao |
| `timestamp` | DateTime | Data e hora exatas da operacao (UTC) |
| `ip_origem` | String | IP do cliente (quando disponivel) |
| `contexto` | JSONB | Dados extras contextuais (ex: ID do processo pai, ID do embarque destino) |

### 20.4 Acesso a Auditoria

- Os registros de auditoria sao acessiveis via o servico de Historico do Gravity
- O modulo de Pedidos exibe um painel de historico por pedido (botao na linha da tabela)
- Filtros disponiveis: por usuario, por tipo de acao, por periodo de data
- Exportacao do historico disponivel em CSV/Excel

---

## APENDICE A — GLOSSARIO

| Termo | Definicao |
|-------|-----------|
| Pedido | Solicitacao de compra de mercadorias a um exportador estrangeiro |
| Item do Pedido | Linha individual dentro de um pedido, com NCM, descricao e quantidade propria |
| Processo | Processo de importacao ou exportacao (avô na hierarquia integrada) |
| Saldo | Quantidade ainda disponivel no pedido para ser transferida |
| Transferencia | Acao de alocar quantidade de um pedido para um embarque especifico |
| Consolidacao | Agrupamento de pedidos em um container ou embarque fisico |
| Embarque Autorizado | Estado final do pedido indicando que o embarque foi oficialmente autorizado |
| Exportador | Fornecedor estrangeiro de onde as mercadorias serao compradas |
| Tenant | Empresa cliente do Gravity que usa o modulo |
| Expression Index | Indice PostgreSQL criado sobre uma expressao extraida de um campo JSONB |
| Cursor Pagination | Tecnica de paginacao por ponteiro de registro, sem OFFSET, para alta performance |
| Smart Read | Produto Gravity para leitura inteligente de documentos via IA |
| Checkout Modal | Modal de confirmacao antes de acoes de alto impacto |
| Edicao Inline | Edicao de campo diretamente na celula da tabela, sem modal separado |

---

## APENDICE B — LIMITES DO SISTEMA

| Parametro | Limite |
|-----------|--------|
| Colunas customizadas por tenant | 30 |
| Expression indexes por tenant | 5 |
| Opcoes em coluna do tipo select | 50 |
| Itens selecionaveis para operacoes em lote | 500 |
| Tamanho maximo de arquivo para importacao | 10MB |
| Rate limit de importacoes | 5 por minuto por tenant |
| Casas decimais disponiveis | 0, 2, 4 ou 6 |
| Niveis de hierarquia | 3 (Processo → Pedido → Item) |
| Debounce da busca em tempo real | 300ms |
| Minimo de caracteres para busca | 2 |

---

## APENDICE C — FLUXO RESUMIDO DE ACOES CRITICAS

### Fluxo de Transferencia

```
1. Selecionar pedido(s) com saldo > 0
2. Clicar Transferir
3. Modal Preview: ajustar quantidade por item, definir destino
4. Validacao: quantidade <= saldo (se trava ativa)
5. Confirmar
6. Sistema atualiza quantidade_transferida e saldo
7. Se saldo = 0: status → "Pedido Transferido" (automatico)
8. Auditoria gerada
9. Toast de sucesso + tabela atualiza
```

### Fluxo de Importacao

```
1. Clicar Importar
2. Escolher fonte: arquivo / Cockpit API / Smart Read (Em breve)
3. Sistema processa → exibe preview com erros identificados
4. Usuario decide: importar todos validos ou corrigir erros antes
5. Confirmar
6. Sistema importa, gera auditoria do lote
7. Toast: "X importados, Y com erro"
```

### Fluxo de Criacao de Coluna Customizada

```
1. Clicar "Criar Nova Coluna"
2. Definir: nome, tipo, opcoes (se select), casas decimais (se numero)
3. Confirmar
4. Coluna aparece para todos os usuarios do tenant
5. Para tipo numero/data: expression index criado em background
6. Badge "indexando..." no cabecalho ate concluir
7. Apos indexacao: performance normal (≤ 80ms em filtros)
```
