# Visão Arquitetural B2B: Módulo Core e Ecossistema de Produtos

Este documento estabelece as diretrizes arquiteturais, de banco de dados e UX para a construção unificada do ecossistema de Importação da plataforma Gravity. O objetivo é garantir a orquestração coesa entre múltiplos produtos independentes sob o escopo de um "Processo de Importação" centralizado.

---

## 1. O "Módulo Core" (A Raiz da Plataforma)

A Gravity abandona a ideia de ser apenas uma suíte de "aplicativos desconexos" para se tornar um ERP Componível. Para isso, estabelece-se o **Módulo Core** como o eixo central da navegação e organização de dados da plataforma.

### 1.1 O Que é o Módulo Core?
O Core é a infraestrutura de pastas e gerenciamento do Workspace. Ele é o provedor do conceito **"Processo" (ou Dossiê)**.
*   **Modelo Comercial:** O módulo Core é fundamentalmente gratuito para instâncias ativas da organização. É a porta de entrada.
*   **Finalidade Principal:** Oferecer uma visão Global do andamento dos processos da empresa via listagens, quadros Kanban ágeis e Dashboards de volume.
*   **O "Cavalo de Troia":** Ao clicar no Dossiê, o cliente acessa detalhes do processo onde são listados todos os *Plugins* (Produtos) disponíveis (Pedidos, DUIMP, L.I., Tracking, Financeiro). Produtos não contratados são renderizados com cadeados 🔒 (Upsell Direto).

---

## 2. Nomenclatura Global e IDs Padrão-Ouro (Stripe-Like)

Todo ID do banco de dados na Gravity deve possuir prefixos autoexplicativos curtos, concatenados com a entidade e a década atual. Este padrão garante rastreabilidade imediata em logs de sistema e URLs (Deep Linking), sem expor chaves cruas de UUIDv4 no frontend quando as informações possuírem significado de negócio frente ao despachante/importador.

Exemplos

**Formatação Técnica Estrita:** A plataforma deve gerar IDs curtos e sequenciais, injetados via código (middleware), abandonando os UUIDs crus visíveis para o cliente. 
A máscara oficial é: `[prefixo]_id_[sequencial_9_digitos]/[YY]`. Exemplo: `esti_id_000000001/26`.

**A Regra de Ouro do Gerador (Isolamento B2B):**
1. **Sequência Incremental por Workspace e Produto:** A contagem (1, 2, 3...) é isolada por *Workspace* (Filial) e por *Produto*. (A Filial SP tem sua `esti_000000001` independente da Filial Rio).
2. **Reset na Virada de Ano:** Quando o ano virar (ex: para `/27`), todas as sequências dos Workspaces são automaticamente reiniciadas para `000000001/27`.

**Exemplos de Referências Formais:**
*   Dossiê/Processo Central: `core_id_000001/26`
*   Estimativas SimulaCusto: `esti_id_108422/26`
*   Pedido (P.O.): `ped_id_108422/26`
*   DUIMP: `duim_id_108422/26`
*   Invoice/Fatura: `inv_id_001920/26`

---

## 3. Topologia de Banco de Dados: Flexibilidade Standalone x Vinculada

Os módulos de produto (Ex: SimulaCusto, Pedidos) foram construídos de maneira independente. A ligação entre eles e o Core deve ser **Relacional Flexível (Nullable / Opcional)** na camada do Prisma.

### Regra de Ouro (Prisma Schema):
> Toda entidade principal de um produto comercializado da Gravity **DEVE** possuir a coluna referencial `core_process_id String?`.

Isso permite nativamente as duas modalidades de venda/uso do produto:

**Modalidade 1: Produto "Solto" (Standalone)**
*   O usuário contrata o Simulador apenas para realizar cálculos de *what-if* (cenários hipotéticos).
*   Gera-se uma estimativa `esti_id_00001`. A coluna `core_process_id` é `NULL`. O sistema renderiza isso no painel isolado do "SimulaCusto".

**Modalidade 2: Produto "Vinculado" (Embedded)**
*   Uma Estimativa nasce a partir da visão interna do processo `core_id_000001/26`.
*   A coluna `core_process_id` recebe o id correspondente.
*   Quando o software consome a tela do Dossiê, o Frontend (React/Client) localiza e agrupa todos os artefatos `WHERE core_process_id = X`.

---

## 4. Arquitetura UX 10: Inversão de Contexto e Menu Lateral

A Gravity implementa o padrão *Nested Deep View* (Visão Submersa), resolvendo o paradoxo entre Visão Global de Negócios e Deep Work do Analista de Importação.

### 4.1 A Visão "Mundo Inteiro" (Menu Global Ativo)
Enquanto logado na plataforma raiz, a responsabilidade do Side Nav (Menu Lateral Global) é dar o acesso aos módulos de relatórios cruzados, faturamento, histórico e a **Central de Processos**.
*   A "Home" exibe um Kanban massivo ou Tabela de Processos Ativos e Encerrados.
*   *O usuário vê tudo.*

### 4.2 A Ação de "Mergulho" (Deep Work Mode)
Quando o analista abre um card do Kanban ou pesquisa o processo `core_id_000001/26`:
1.  **Transição de Sidebar:** O *Menu Lateral Global* "desliza" para fora ou é substituído integralmente pelo **Menu do Processo (Contextual Sidebar)**.
2.  **O Foco Estrito:** O menu do processo lista UNICAMENTE o workflow amarrado àquele dossiê: "Resumo, Workflow, Pedidos, L.I., D.I., DUIMP, Câmbio/Financeiro".
3.  **Válvula de Escape (Breadcrumb / Back Button):** Acima da nova Sidebar Submersa, repousa invariavelmente o botão (ex: `< Processos > Acompanhamento`) para retornar ao "Mundo Inteiro".

**Por que UX Nota 10?**
Um operador conferindo centavos decimais de recolhimento de impostos na visão de DUIMP **não** pode dividir espaço mental (área de clique e poluição visual) com menus sobre "Assinaturas do Tenant". A experiência deve exigir zero ruído visual até a aba processual estar tecnicamente concluída.

---

## 5. Serviços Transversais (Histórico Global, Emails, Tarefas)

Tabelas transversais devem absorver o contexto do seu "Pai", se existente.

**Tabelas Afetadas na Onda 3:**
*   `HistoryLog`
*   `EmailMessage` e `EmailThread`
*   `Atividade` e `KanbanCard`
*   `WhatsAppConversation`

Se um email for trocado na aba "Pedido" dentro do processo "Core-001":
*   O registro grava: `product_id = 'pedidocomex'`, `linked_id/process_id = 'core_001'`.
*   Aba "Meus Emails Global": Filtra e mostra todos, independente do `linked_id`.
*   Aba do Processo "Core-001": Filtra o Frontend para exibir apenas as conversas do `core_001`.
*   Aba do "Pedido" no "Core-001": Filtra estritamente o `product_id = 'pedidocomex'` do `linked_id = 'core_001'`.

Esta hierarquia permite que a "aba global" aja como radar amplo, e a "aba restrita" mantenha a organização focal do analista de importação, construindo um sistema inviolável, transparente e altamente escalável comercialmente.

---

## 6. Segurança em Profundidade (Alta Resiliência) e Modelagem de Ameaças

Como a plataforma lida com dados sensíveis de comércio exterior (valores, NCMs estratégicos, compliance, faturas cambiais), a arquitetura exige salvaguardas rigorosas. O vazamento de dados (ex: Cliente A ver a DUIMP do Cliente B) é classificado como um `Tier 1 Incident`.

A Gravity adota uma postura **Zero-Trust**, estruturada em camadas lógicas e de infraestrutura desenhadas para serem testáveis e altamente resistentes a falhas técnicas ou humanas.

### 6.1. Proteção Lógica: RLS Escopado à Transação (Database Layer)
A linha de defesa mais profunda é o Row-Level Security (RLS) do PostgreSQL.
*   **O Mecanismo:** O Prisma não injeta chaves globalmente. Toda a injeção é envelopada no utilitário núcleo (`withTenantContext`), utilizando a diretiva `SELECT set_config('app.current_tenant_id', $1, true)`.
*   **Isolamento de Memória (O significado do `true`):** O argumento `true` no *set_config* instrui *exclusivamente o PostgreSQL* a tratar a variável como um `SET LOCAL`. A variável de sessão existe apenas dentro da transação corrente e é matematicamente destruída no `COMMIT` ou `ROLLBACK`. O *PgBouncer*, operando em *transaction mode*, devolve a conexão estruturalmente limpa ao pool, garantindo que a próxima requisição receba contexto residual nulo.
*   **A Regra do Safe-Default (Prevenção contra Null):** Para garantir o *default-deny* verdadeiro, as regras de RLS do banco de dados obrigatoriamente invocam `AND current_tenant_id() IS NOT NULL`. Isso impede que, mediante um bug de middleware que gere "Contexto Nulo", a avaliação `NULL = NULL` abra a base de dados inteira. Erros de sistema devolvem acesso trancado.

### 6.2. Proteção de Autenticação (Workspace Bleed) e Enumeração
*   **Isolamento Lógico:** O Middleware HTTP exige validação da interseção `(user_id, company_id, product_key)` antes de consultar recursos do produto.
*   **Combate à Força-Bruta (Rate Limits):** O uso de IDs Sequenciais (ex: `esti_00001`) torna os recursos vulneráveis a Enumeração. A plataforma reage limitando *Requests por Minuto (RPM)* e implementando falsos-negativos.
*   **Decisão Arquitetural (404-Masking):** Caso um usuário de `Alpha` tente forçar por ID um recuso de `Beta`, a API é forçada a injetar falha silenciosa respondendo `HTTP 404 Not Found` em vez de `403 Forbidden`. Dessa forma, o atacante jamais consegue confirmar sequer a existência daquele processo na plataforma.

### 6.3. Governança Tier 1 e Prevenção Ativa (DevSecOps)
Para sustentar a proteção arquitetural contra degradação a longo prazo, o sistema opera sob baluartes estritos:

1.  **Suíte de Ataques Automatizados (Vitest):** A arquitetura inverte o ônus da prova. Testes ativamente tentam extrair dados de forma ilegal ("Empresa Alpha" atacando o ID da "Empresa Beta"). Sem passar no crivo Alpha x Beta localmente, implementações são barradas.
2.  **CI/CD Pipeline Security Gate:** Block de deploy caso a suite Vitest RLS retorne qualquer vulnerabilidade técnica que quebre o isolamento.
3.  **Logs Forenses (Append-Only):** Tabelas como `HistoryLog` rodam com políticas imutáveis, gerando rastreabilidade não repudiável de todos os acessos.
4.  **Job Workers Restritos:** Processos ETL noturnos e relatórios *não* operam via bypass deliberado (`BYPASSRLS`). A superfície de vazamento massivo é lacrada por design.
5.  **Criptografia Estratégica In-Rest:** Dados de negócio nevrálgicos (como `valorAduaneiro`, dados cambiais e segredos) adotam criptografia simétrica na camada de aplicação. Um `dump` do banco ou administrador de infraestrutura não possui acesso aos dados sensitivos em *plaintext* (*Insider Threat Protection*).
6.  **Invalidação Ativa de Sessão:** O mecanismo de Identidade (Clerk/Auth) suporta revogação sumária. Em caso de *Token Leak*, a validação via *Middleware* da API descarta o token vazado ativamente no Gateway, antes mesmo do expurgo do TTL natural (`exp`).

### 6.4. Camadas Externas: Cache (Redis) e Object Storage
O isolamento de dados multitenant não se limita ao banco PostgreSQL. O *Zero-Trust* engloba os ativos voláteis:
*   **Isolamento de Cache de Borda:** Entradas no Redis utilizam namespace multidimensional estruturado que obriga colisão de chave: `t:{tenantId}:c:{companyId}:...`. Evita transbordamento acidental.
*   **Armazenamento de Objetos (NF/D.I.):** PDFs e XMLs no Bucket AWS/R2 operam sem ACL Pública e seus paths reproduzem a hierarquia transacional. Antes da geração da URL pré-assinada (*Pre-Signed URL* de 300s), a API valida explícitamente se a *Object Key* solicitada pertence ao `tenant_id` ativo da sessão. Divergências retornam erro restritivo imediato na Autenticação (impedindo vazamento de objetos).

**Conclusão de Design:** Através do RLS estritamente transacional *NULL-safe*, barreiras ativas anti-enumeração HTTP e blindagem completa da nuvem (Storage/Cache), o *Blast Radius* da Gravity Cloud é minimizado ativamente. O ecossistema repousa numa arquitetura de defesa em profundidade continuamente validada.
