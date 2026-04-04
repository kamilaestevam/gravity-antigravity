# HANDOFF — Pedido (Gestao de Pedidos COMEX)

> **De:** Dream Team de Produtos (8 agentes)
> **Para:** Dream Team de Tecnologia (11 papeis, 57 skills)
> **Data:** 29/03/2026
> **Product Owner:** Daniel Mendes
> **Status:** Aprovado — pronto para implementacao

---

## 1. Contexto Executivo (PM — 10 min)

### O que e

Pedido e o produto de **gestao de pedidos de importacao e exportacao** da Gravity Platform. E o componente central para orquestrar fluxos de COMEX onde quantidades solicitadas raramente coincidem com uma entrega unica.

O sistema resolve:
- **Fatiamento de carga** em multiplos embarques
- **Consolidacao** de itens de origens distintas
- **Rastreabilidade extrema** de saldo por item (o "elo sagrado")
- **Sincronizacao ERP** como espelho dinamico de Purchase Orders / Sales Orders

### Arquitetura 3-Tier

| Camada | Entidade | Papel |
|--------|----------|-------|
| **1 — Pedido** | `Pedido` | Documento comercial mestre (PO/SO). Define Incoterm, Moeda, Parceiros. |
| **2 — Rastreador de Saldo** | `PedidoItem` | O "elo sagrado" — controla quantidade inicial, atual, transferida, pronta, cancelada. |
| **3 — Execucao Logistica** | `Processo` | Booking/Embarque. **NAO faz parte deste produto** — existe apenas no produto Processo. |

> **Regra:** O Pedido funciona standalone. A Camada 3 (Processo) so aparece quando o item e vinculado a um processo logistico, e isso acontece dentro do produto Processo.

### Por que agora

- Gestao de pedidos COMEX e feita em planilhas ou ERPs limitados
- Saldo de itens se perde quando ha fatiamento entre embarques
- O legado DATI valida que a matematica de saldo funciona por anos de uso real
- E o pilar central que conecta todos os outros produtos (SimulaCusto, BID Frete, BID Cambio, Processo)

### O que esta no MVP

| Area | Funcionalidades |
|------|----------------|
| Lista de Pedidos | Grid hierarquico virtualizado (TabelaVirtualGlobal), Pedido como pai (99 colunas), PedidoItem como filho (165 colunas), filtros, busca, exportacao, resize de colunas, overlay de edicao |
| Gestao de Itens | Quantidade Inicial/Atual/Transferida/Pronta/Cancelada, unidade de medida, valores |
| Entrada de Dados | Manual, importacao de arquivo (Excel, CSV, XML, TXT, JSON), integracao ERP via API Cockpit |
| Ciclo de Vida | Draft -> Aberto -> Vinculado -> Liquidado |
| Importacao/Exportacao | Suporte dual com Escudo Anti-Conflito (prefixos operacionais) |

### O que NAO esta no MVP

- Smart Read (leitura inteligente de documentos) — Fase 2 (produto Gravity ja existente, integracao futura)
- Dashboard analitico de pedidos — Fase 2
- Alertas automaticos de saldo baixo — Fase 2
- Workflow de aprovacao de pedidos — Fase 3
- Integracao bidirecional com ERP (push de status) — Fase 3

---

## 2. Regras de Negocio Criticas (SME — 10 min)

### Top 5 que o time DEVE saber

| # | Regra | Por que importa |
|---|-------|----------------|
| 1 | **Matematica de Saldo Imutavel:** `quantidade_inicial = quantidade_atual + quantidade_transferida + quantidade_cancelada` | A quantidade_inicial NUNCA muda apos criacao. E a constante que garante rastreabilidade. Toda operacao de transferencia/cancelamento e uma operacao atomica que debita de quantidade_atual. |
| 2 | **Escudo Anti-Conflito:** Usar `importacao_exportador_id` e `exportacao_importador_id`, NUNCA `fornecedor_id` ou `cliente_id` genericos. | Importacao e Exportacao coexistem nas mesmas tabelas. O prefixo operacional impede ambiguidade de UX e dados. |
| 3 | **Isolamento Zero-Trust:** Toda query exige `tenant_id` + `company_id`. | Uma filial NUNCA enxerga pedidos de outra, exceto com perfil Master Cross-Company. |
| 4 | **Valores monetarios:** `casas_decimais_total_pedido` e `casas_decimais_quantidade` sao configuraveis por pedido. | Diferentes operacoes usam precisoes diferentes (2 casas para valores FOB, 3+ para quantidades fracionarias como TON, m3). |
| 5 | **PedidoItem e o elo sagrado entre Comercial e Logistico.** | Quando um ProcessoItem e criado no produto Processo, ele debita de `quantidade_atual` do PedidoItem via `pedido_item_id`. O Pedido so sabe que foi debitado — quem faz o debito e o Processo. |

### Regras de Saldo Detalhadas

- **Transferencia:** Ao vincular item a um Processo, debita `quantidade_atual` e credita `quantidade_transferida`. Operacao atomica.
- **Cancelamento:** Debita `quantidade_atual` e credita `quantidade_cancelada`. Irreversivel.
- **Quantidade Pronta:** Quantidade produzida pela fabrica, pronta para o proximo embarque. Informativa — nao afeta a formula de saldo.
- **Sobre-execucao:** IMPOSSIVEL. O sistema impede transferencia quando `quantidade_atual < quantidade_solicitada`.

### Ciclo de Vida

```
Draft ──> Aberto ──> Vinculado ──> Liquidado
  │                    │
  │                    └── Quando algum PedidoItem tem quantidade_transferida > 0
  │
  └── Pedido espelhado do ERP ou criado manualmente, dados nao validados
```

- **Draft:** Dados iniciais, ainda nao validados
- **Aberto:** Saldo positivo em `quantidade_atual`, apto para vincular a processos
- **Vinculado:** Parte dos itens ja associada a um ou mais Processos
- **Liquidado:** `quantidade_atual` = 0 em todos os itens (totalmente embarcado ou cancelado)

---

## 3. Publico-Alvo e Personas (UX Researcher)

### 3 Personas

| Persona | Perfil | JTBD Principal |
|---------|--------|---------------|
| **Ana** — Analista de Importacao | Mid-market, 20-80 POs/mes | "Controlar saldo de itens sem planilha, saber o que ja embarcou e o que falta" |
| **Roberto** — Coordenador de Exportacao | Trading, 100+ SOs/mes | "Consolidar pedidos de clientes diferentes em embarques otimizados" |
| **Marcos** — Gerente de Supply Chain | Industria, supervisiona 5 analistas | "Visao consolidada de todos os pedidos, com status e valores por exportador" |

---

## 4. Telas e Fluxos (Designer — 15 min)

### 3 Telas Principais

| # | Tela | Complexidade | Componentes Nucleo-Global | 5 Estados |
|---|------|-------------|--------------------------|-----------|
| 1 | Lista de Pedidos | G | TabelaCamadasGlobal, StatusBadgeGlobal, BotaoGlobal, CabecalhoGlobal, CardBasicoGlobal | empty (sem pedidos), loading (skeleton), error, filled (grid hierarquico), disabled (sem permissao) |
| 2 | Novo/Editar Pedido | M | ModalGlobal ou PaginaGlobal, InputTexto, CaixaSelectGlobal, BotaoGlobal | empty (form limpo), loading (salvando), error (validacao), filled (editando), disabled (somente leitura) |
| 3 | Importacao de Arquivo | M | ModalGlobal, BotaoGlobal, Loading | empty (nenhum arquivo), loading (processando), error (arquivo invalido), filled (preview dos dados), disabled |

### Grid Principal — Lista de Pedidos (TabelaCamadasGlobal)

**Colunas pai (Pedido):**

| Coluna | Campo | Tipo | Filtro |
|--------|-------|------|--------|
| Pedido/Item | `numero_pedido` | String | Busca textual |
| P.O Tipo | `tipo_operacao` | Enum | Select (importacao/exportacao) |
| Importador | `tenant_id` (resolve nome) | FK | Select |
| Ref. Importador | campo livre | String | — |
| Exportador | `importacao_exportador_id` | FK | Select |
| Ref. Exportador | campo livre | String | — |
| Fabricante | FK cadastro | FK | Select |
| Ref. Fabricante | campo livre | String | — |
| Numero Proforma | `numero_proforma` | String | Busca |
| Numero Invoice | `numero_invoice` | String | Busca |
| Data P.O | `data_emissao_pedido` | Date | Range |

**Colunas filha (PedidoItem) — expandidas via "Ver Itens":**

| Coluna | Campo | Tipo |
|--------|-------|------|
| Quantidade Inicial | `quantidade_inicial` | Float (formatado pt-BR) |
| Quantidade Atual | `quantidade_atual` | Float |
| Quantidade Transferida | `quantidade_transferida` | Float |
| Quantidade Pronta | `quantidade_pronta` | Float |
| Quantidade Para Transferir | input editavel | Float (campo de entrada) |
| Descricao Quantidade | `unidade_comercializada_item` | String (UoM: Unidade, Metro, Litro, cm3, Metro Quadrado) |

### Toolbar (Barra de Ferramentas Superior)

| Icone | Funcao | Descricao |
|-------|--------|-----------|
| Plus | Adicionar | Novo pedido manual |
| Lixeira | Deletar | Remover pedido(s) selecionado(s) |
| Copiar | Copiar | Duplicar pedido selecionado |
| Filtros | Filtros avancados | Painel de filtros por coluna |
| Engrenagem | Configuracao de colunas | Mostrar/ocultar colunas |
| Expansao | Expandir lateral | Detalhe expandido |
| Inversao | Inverter visualizacao | Alternar visao grid/cards |
| Historico | Logs de auditoria | Acesso ao historico de alteracoes |
| Calendario | Eventos | Calendario de datas relevantes |
| Upload | Importar arquivo | Excel, CSV, XML, TXT, JSON |
| Download | Exportar | Exportar dados filtrados |
| Refresh | Atualizar | Sincronizar dados com ERP |
| Localizar | Busca | Campo de busca textual |

### Fluxos Navegacionais

**Fluxo 1 — Visualizacao e Gestao:**
```
Login -> Produto Pedido -> Lista de Pedidos
  -> Filtrar (Status, Tipo Operacao, Exportador, Datas)
  -> Clicar no Pedido -> Expandir itens (TabelaCamadasGlobal chevron)
  -> Ver saldos: Inicial, Atual, Transferida, Pronta, Cancelada
```

**Fluxo 2 — Criacao Manual:**
```
Lista de Pedidos -> [+] Novo Pedido -> Preencher header (PO, tipo, exportador, incoterm, moeda)
  -> Adicionar itens (part_number, NCM, descricao, quantidade, valor)
  -> Salvar -> Status = Draft
  -> Validar -> Status = Aberto
```

**Fluxo 3 — Importacao de Arquivo:**
```
Lista de Pedidos -> [Upload] Importar -> Selecionar arquivo (Excel/CSV/XML/TXT/JSON)
  -> Preview dos dados mapeados -> Confirmar -> Pedidos criados com status Draft
```

**Fluxo 4 — Integracao ERP (via API Cockpit):**
```
ERP envia PO via API -> Conector ERP recebe -> Cria Pedido com status Draft
  -> Analista visualiza na lista -> Valida dados -> Status = Aberto
```

### Specs visuais

- **Design System:** Solid Slate (variaveis CSS: --bg-body-dark, --bg-base, --bg-surface, --accent #6366f1)
- **Tipografia:** Plus Jakarta Sans, DM Mono para codigos
- **Icones:** Phosphor Icons (`@phosphor-icons/react`), weight="duotone"
- **Botoes:** Pill (border-radius: 9999px), font-weight: 600
- **Dark mode first**
- **Breakpoints:** Desktop 1280px+, Tablet 768-1279px, Mobile <768px
- **Acessibilidade:** Contraste 4.5:1 (AA), tab order, aria-labels, focus visible
- **Expansao de itens:** Chevron rotacao 90deg, animacao fade-slide 0.18s, conectores de hierarquia

---

## 5. Arquitetura Tecnica (Tech Lead — 15 min)

### Ficha do Produto

| Item | Valor |
|------|-------|
| Product ID | `pedido` |
| Servidor proprio | **NAO** — usa rotas do `processos-core` (tenant service) |
| Database | Tenant DB (dados em `pedidos_comerciais` e `pedido_itens`) |
| Models Prisma | 2 tabelas proprias: `Pedido`, `PedidoItem` |
| Fragment Prisma | `servicos-global/tenant/processos-core/prisma/fragment.prisma` (compartilhado) |
| Client dev port | 5178 |

### Por que NAO tem servidor proprio

O Pedido opera sobre os models `Pedido` e `PedidoItem` que ja existem no fragment do `processos-core`. Os dados vivem no tenant DB, acessados via rotas do servico tenant `processos-core`. O produto Pedido e um **client standalone** que:

1. Se comunica com o backend via rotas existentes de `processos-core`
2. Usa `requireInternalKey` + `tenantIsolation` do servico tenant
3. Pode tambem receber dados via API Cockpit (integracao ERP) e Conector ERP

### O que reutilizar do Gravity

| Servico/Componente | Uso no Pedido |
|-------------------|--------------|
| processos-core (tenant) | Backend: CRUD de Pedido e PedidoItem, logica de saldo |
| Configurador (8003) | Auth Clerk, JWT, permissoes, workspace |
| API Cockpit (8016) | Integracao ERP — entrada de pedidos via API |
| Conector ERP (8017) | Sincronizacao bidirecional ERP |
| Atividades (8012) | Log de acoes |
| Historico (8014) | Audit trail |
| Notificacoes (8013) | Alertas in-app |
| TabelaCamadasGlobal | Grid hierarquico pai-filho com expansao |
| StatusBadgeGlobal | Status do pedido (Draft, Aberto, Vinculado, Liquidado) |
| CabecalhoGlobal | Header da pagina |
| CardBasicoGlobal | Cards de KPI (total pedidos, valor FOB, etc.) |
| BotaoGlobal | Acoes |
| PaginaGlobal | Layout da pagina |
| ModalGlobal | Formularios de criacao/edicao |
| InputTexto | Campos de entrada |
| CaixaSelectGlobal | Selects de filtro |

### O que criar do zero

| Componente | Justificativa |
|-----------|-------------|
| Rotas de Pedido no processos-core | CRUD completo: listar, criar, editar, deletar pedidos e itens |
| saldoEngine | Logica de validacao da matematica de saldo (atomicidade, anti-sobre-execucao) |
| importEngine | Parser de arquivos (Excel, CSV, XML, TXT, JSON) para criacao batch de pedidos |
| Pagina Lista de Pedidos | Client React standalone usando TabelaCamadasGlobal |
| Pagina Novo/Editar Pedido | Formulario de criacao/edicao com itens |
| Modal Importacao | Upload + preview + mapeamento de colunas |

### Estrutura de pastas

```
produto/pedido/
├── client/
│   └── src/
│       ├── pages/
│       │   ├── ListaPedidos.tsx          # Grid principal (TabelaCamadasGlobal)
│       │   ├── NovoPedido.tsx            # Formulario de criacao
│       │   └── ImportarArquivo.tsx        # Upload + preview + mapeamento
│       ├── shared/
│       │   ├── api.ts                     # Client API functions
│       │   ├── config.ts                  # PRODUCT_CONFIG
│       │   └── types.ts                   # TypeScript types
│       ├── App.tsx
│       └── main.tsx
├── package.json
└── README.md
```

**Backend (rotas adicionadas ao processos-core existente):**
```
servicos-global/tenant/processos-core/
├── src/
│   ├── routes/
│   │   ├── pedidos.ts                    # CRUD Pedido + PedidoItem
│   │   └── importacao.ts                 # Parse e criacao batch
│   ├── services/
│   │   ├── saldoEngine.ts               # Matematica de saldo atomica
│   │   └── importEngine.ts              # Parser multi-formato
│   └── ...
└── prisma/
    └── fragment.prisma                   # JA EXISTE — Pedido + PedidoItem
```

### PRODUCT_CONFIG

```typescript
export const PRODUCT_CONFIG = {
  id: 'pedido',
  productId: 'pedido',
  name: 'Pedido',

  tenantServices: [
    'atividades',
    'historico',
    'notificacoes',
    'api-cockpit',
    'conector-erp',
  ],

  productServices: [
    'saldo-engine',
    'import-engine',
  ],

  navigation: [
    { id: 'pedidos',     label: 'Pedidos',     icon: 'package',       source: 'product' },
    { id: 'importar',    label: 'Importar',    icon: 'upload-simple', source: 'product' },
  ],

  features: {
    importacao_exportacao: true,
    importacao_arquivo: true,
    integracao_erp: true,
    smart_read: false,            // Fase 2
    dashboard_analitico: false,   // Fase 2
  },
}
```

### API Endpoints (rotas em processos-core)

#### Pedidos

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/pedidos` | Listar pedidos com itens (filtros: status, tipo_operacao, exportador, datas, paginacao) |
| GET | `/api/v1/pedidos/:id` | Detalhe do pedido com itens expandidos |
| POST | `/api/v1/pedidos` | Criar pedido com itens |
| PUT | `/api/v1/pedidos/:id` | Atualizar pedido (so Draft/Aberto) |
| DELETE | `/api/v1/pedidos/:id` | Deletar pedido (so Draft) |
| PATCH | `/api/v1/pedidos/:id/status` | Transicao de status (Draft->Aberto, etc.) |
| POST | `/api/v1/pedidos/:id/duplicar` | Duplicar pedido completo |

#### Itens do Pedido

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/v1/pedidos/:id/itens` | Adicionar item ao pedido |
| PUT | `/api/v1/pedidos/:id/itens/:itemId` | Atualizar item |
| DELETE | `/api/v1/pedidos/:id/itens/:itemId` | Remover item (so se quantidade_transferida == 0) |
| PATCH | `/api/v1/pedidos/:id/itens/:itemId/cancelar` | Cancelar quantidade (debita atual, credita cancelada) |
| PATCH | `/api/v1/pedidos/:id/itens/:itemId/pronta` | Atualizar quantidade pronta |

#### Importacao

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/v1/pedidos/importar` | Upload de arquivo (Excel, CSV, XML, TXT, JSON) |
| POST | `/api/v1/pedidos/importar/preview` | Preview dos dados mapeados antes de confirmar |
| POST | `/api/v1/pedidos/importar/confirmar` | Confirmar importacao e criar pedidos |

#### Exportacao

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/v1/pedidos/exportar` | Exportar pedidos filtrados (CSV, Excel) |

---

## 6. Criterios de Aceite (BA — 10 min)

### Por funcionalidade do MVP

| RF | Funcionalidade | Criterios | Cenarios-chave |
|----|---------------|-----------|---------------|
| RF-001 | Lista de Pedidos | CA-001 a CA-003 | Grid hierarquico, expansao de itens, filtros, busca |
| RF-002 | Criacao Manual | CA-004, CA-005 | Criar pedido + itens, validacao de campos obrigatorios |
| RF-003 | Edicao de Pedido | CA-006 | Editar header e itens (so Draft/Aberto) |
| RF-004 | Matematica de Saldo | CA-007, CA-008 | Formula imutavel, anti-sobre-execucao |
| RF-005 | Importacao de Arquivo | CA-009, CA-010 | Parse multi-formato, preview, confirmacao |
| RF-006 | Ciclo de Vida | CA-011 | Transicoes de status validas |
| RF-007 | Importacao/Exportacao | CA-012 | Escudo Anti-Conflito, prefixos operacionais |

### Criterios detalhados

```gherkin
Cenario: CA-001 — Lista hierarquica de pedidos
  Dado que existem pedidos cadastrados para o tenant
  Quando o usuario acessa a lista de pedidos
  Entao o grid exibe pedidos como linhas pai (TabelaCamadasGlobal)
  E cada pedido mostra: numero, P.O Tipo, Importador, Exportador, Fabricante, Proforma, Invoice, Data P.O
  E ao clicar no chevron, os itens expandem com: Qtd Inicial, Atual, Transferida, Pronta, Para Transferir, UoM

Cenario: CA-004 — Criar pedido manualmente
  Dado que o usuario esta na lista de pedidos
  Quando clica em [+] Novo Pedido
  E preenche tipo_operacao, numero_pedido, exportador, incoterm, moeda
  E adiciona pelo menos 1 item com part_number, NCM, descricao, quantidade_inicial, valor
  E clica em Salvar
  Entao o pedido e criado com status "Draft"
  E quantidade_atual = quantidade_inicial para cada item
  E quantidade_transferida = 0, quantidade_cancelada = 0

Cenario: CA-007 — Matematica de saldo imutavel
  Dado que um PedidoItem tem quantidade_inicial = 1000
  E quantidade_atual = 1000, transferida = 0, cancelada = 0
  Quando o Processo solicita transferencia de 400 unidades
  Entao quantidade_atual = 600
  E quantidade_transferida = 400
  E quantidade_inicial permanece 1000 (imutavel)
  E a formula quantidade_inicial = atual + transferida + cancelada e valida

Cenario: CA-008 — Anti-sobre-execucao
  Dado que um PedidoItem tem quantidade_atual = 100
  Quando o sistema tenta transferir 150 unidades
  Entao a operacao e REJEITADA
  E retorna erro "Quantidade solicitada (150) excede saldo disponivel (100)"
  E nenhum dado e alterado

Cenario: CA-009 — Importacao de arquivo Excel
  Dado que o usuario clica em [Upload] Importar
  Quando seleciona um arquivo Excel com colunas mapeadas
  Entao o sistema exibe preview dos dados extraidos
  E o usuario pode corrigir mapeamento de colunas
  E ao confirmar, os pedidos sao criados com status "Draft"
```

### Criterios universais (todo endpoint)

```gherkin
Cenario: Isolamento de Tenant + Company
  Dado que estou logado no tenant "A", company "Filial SP"
  Quando faco qualquer operacao
  Entao nenhum dado do tenant "B" ou company "Filial RJ" e acessivel

Cenario: Validacao Zod
  Dado que envio dados invalidos para qualquer endpoint
  Entao recebo erro 400 com mensagem descritiva
  E nenhum dado e gravado no banco

Cenario: Autenticacao S2S
  Dado que faco chamada sem x-internal-key
  Entao recebo erro 401
```

---

## 7. Metricas de Sucesso (Data Analyst — 5 min)

| KPI | Meta (6 meses) | Como medir |
|-----|----------------|-----------|
| Pedidos gerenciados/mes | 500+ por tenant ativo | Count Pedido por tenant por mes |
| Taxa de liquidacao | >80% dos pedidos liquidados em 90 dias | Pedidos com status=Liquidado / total |
| Tempo de importacao | <30 seg para 100 pedidos via arquivo | Timestamp inicio/fim do importEngine |

### Metricas secundarias

- Itens com saldo zerado no prazo (%) — PedidoItem onde quantidade_atual = 0
- Taxa de uso de importacao vs manual (%) — Pedidos criados via importEngine / total
- Acuracia de saldo — Validacao diaria da formula imutavel (zero discrepancias)

---

## 8. Estimativas de Complexidade

### Por funcionalidade

| Funcionalidade | Tamanho | Dias |
|---------------|---------|------|
| Lista de Pedidos (TabelaCamadasGlobal) | G | 3-5 |
| saldoEngine (matematica atomica) | M | 2-3 |
| importEngine (parser multi-formato) | G | 3-5 |
| Rotas CRUD pedidos + itens | M | 2-3 |
| Formulario Novo/Editar Pedido | M | 2-3 |
| Modal Importacao + Preview | M | 2-3 |
| Ciclo de vida (estados) | P | 1 |
| Exportacao (CSV/Excel) | P | 1 |

### Estimativa total MVP

| Categoria | Estimativa |
|-----------|-----------|
| Backend (rotas + engines em processos-core) | 1-2 semanas |
| Frontend (3 telas + componentes) | 1-2 semanas |
| Testes | 3-5 dias |
| **TOTAL MVP** | **2-4 semanas** |

---

## 9. Riscos que o Time Deve Saber

| Risco | Prob. | Impacto | Mitigacao |
|-------|-------|---------|-----------|
| Conflito de rotas no processos-core | Media | Alto | Namespace `/api/v1/pedidos` isolado, sem colisao com `/api/v1/processos` |
| Parser de arquivo falha com formatos inesperados | Alta | Medio | Validacao rigorosa + preview antes de confirmar + mensagens de erro claras |
| Sobre-execucao de saldo por race condition | Baixa | Critico | Transacao atomica no Prisma ($transaction), lock otimista |
| Importacao ERP com dados incompletos | Media | Medio | Criar como Draft, analista valida antes de abrir |
| Performance com muitos itens por pedido | Media | Medio | Paginacao server-side na expansao de itens, lazy loading |

---

## 10. Decisoes Tomadas

| # | Data | Decisao | Razao |
|---|------|---------|-------|
| D-001 | 29/03/2026 | Sem servidor proprio — usa processos-core | Models ja existem no fragment, evita duplicacao de dados |
| D-002 | 29/03/2026 | TabelaCamadasGlobal para grid hierarquico | Componente ja pronto com expansao pai-filho, animacoes e acessibilidade |
| D-003 | 29/03/2026 | Camada 3 (Processo) nao faz parte deste produto | Separacao de responsabilidades — Pedido gerencia intencao comercial, Processo gerencia execucao logistica |
| D-004 | 29/03/2026 | 5 formatos de importacao (Excel, CSV, XML, TXT, JSON) | Cobrir todos os formatos de ERP do mercado |
| D-005 | 29/03/2026 | Casas decimais configuraveis por pedido | Diferentes operacoes usam precisoes diferentes |
| D-006 | 29/03/2026 | Client dev port 5178 | Proxima disponivel apos bid-cambio (5176/5177) |

---

## 11. Indice dos Artefatos

| # | Artefato | Local | Status |
|---|---------|-------|--------|
| 1 | Especificacao Tecnica (PDF) | `C:\Users\danie\Downloads\pedido.pdf` | Completo |
| 2 | Arquitetura 3-Tier | `documentos-tecnicos/produto/itens-pedido-processo/arquitetura-3-tier.md` | Completo |
| 3 | Fragment Prisma (Models) | `servicos-global/tenant/processos-core/prisma/fragment.prisma` | Completo |
| 4 | PedidosPage (referencia dentro do Processo) | `produto/processo/client/src/pages/pedidos/PedidosPage.tsx` | Referencia |
| 5 | TabelaCamadasGlobal (componente de grid) | `nucleo-global/Tabelas/tabela-camadas-global/src/TabelaCamadasGlobal.tsx` | Pronto |
| 6 | HANDOFF | `documentos-tecnicos/produto/pedido/HANDOFF.md` | Este documento |

---

## 12. Contatos

| Assunto | Quem Procurar |
|---------|--------------|
| Duvidas de produto/escopo | PM (este documento) |
| Duvidas de regras de negocio/saldo | SME (secao 2) |
| Duvidas de design/telas | Designer (screenshots no PDF + TabelaCamadasGlobal existente) |
| Duvidas de arquitetura | Tech Lead (secao 5 + arquitetura-3-tier.md) |
| Duvidas de fragment.prisma | Coordenador (processos-core/fragment.prisma) |
| Aprovacao do dono | Daniel Mendes (Product Owner) |

---

## 13. Como Ativar o Dream Team Tecnologia

```
/dream-team-tecnologia
```

Depois:

> **"Novo produto: Pedido. O handoff completo esta em `documentos-tecnicos/produto/pedido/HANDOFF.md`. O fragment.prisma ja existe em `servicos-global/tenant/processos-core/prisma/fragment.prisma`. A referencia visual esta em `produto/processo/client/src/pages/pedidos/PedidosPage.tsx` e o componente de grid em `nucleo-global/Tabelas/tabela-camadas-global/`. Leiam o handoff e comecem pela implementacao."**

### Ordem sugerida de implementacao

1. **Backend:** Criar rotas CRUD em `processos-core/src/routes/pedidos.ts`
2. **saldoEngine:** Implementar matematica de saldo atomica com validacao anti-sobre-execucao
3. **importEngine:** Parser multi-formato (Excel, CSV, XML, TXT, JSON)
4. **Frontend:** `produto/pedido/client/` com ListaPedidos.tsx usando TabelaCamadasGlobal
5. **Formulario:** NovoPedido.tsx para criacao/edicao manual
6. **Importacao:** ImportarArquivo.tsx com preview e confirmacao
7. **Testes:** Unitarios do saldoEngine + funcionais das rotas + cross-tenant
8. **QA:** Revisao com checklist de 6 categorias

---

## 14. Checklist Final — Handoff Completo?

### Documentos
- [x] Especificacao tecnica completa (PDF 8 paginas)
- [x] Arquitetura 3-Tier documentada (arquitetura-3-tier.md)
- [x] Regras de negocio operacionalizadas (matematica de saldo, escudo anti-conflito)
- [x] Casos de uso (7 RFs com fluxos detalhados)
- [x] Criterios de aceite em Gherkin para todo RF do MVP

### Design
- [x] Screenshots do sistema legado (4 imagens no PDF)
- [x] Componente TabelaCamadasGlobal pronto para reuso
- [x] PedidosPage.tsx como referencia visual existente
- [x] Design system Solid Slate aplicado
- [x] Dark mode first
- [x] Acessibilidade especificada (chevron, aria-labels, tab order)

### Tecnico
- [x] Fragment.prisma completo (Pedido + PedidoItem ja existem)
- [x] PRODUCT_CONFIG definido
- [x] Endpoints detalhados (CRUD + importacao + exportacao)
- [x] Mapa de reuso (servicos + componentes)
- [x] Estimativas de complexidade (P/M/G)

### Gestao
- [x] Backlog priorizado (MVP vs Fase 2 vs Fase 3)
- [x] Cronograma com estimativas (2-4 semanas MVP)
- [x] Metricas de sucesso (3 KPIs)
- [x] Riscos documentados com mitigacao (5 riscos)
- [x] Decisoes registradas (6 decisoes com razao)

### Aprovacoes
- [x] Especificacao tecnica validada (PDF do PO)
- [x] Arquitetura 3-Tier validada (documento existente)
- [x] Fragment.prisma validado (em producao no processos-core)
- [x] Product Owner aprovou escopo
