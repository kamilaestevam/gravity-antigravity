# Histórico de Alterações — Manual de Regras de Negócio

> **Público:** Administradores do sistema Gravity, gestores de compliance, equipes de segurança e suporte técnico.  
> **Propósito:** Descrever o que é registrado, quem pode ver o quê, como interpretar os eventos e como usar as funcionalidades de alerta e exportação.

---

## 1. O que é o Histórico de Alterações

O **Histórico de Alterações** é o sistema de audit trail imutável do Gravity. Ele registra toda ação relevante executada na plataforma — por usuários humanos, automações, integrações e a IA Gabi — de forma que:

- **Nunca pode ser apagado ou editado** por nenhum usuário, incluindo administradores
- **Cada registro tem uma assinatura digital** (SHA-256) que detecta qualquer adulteração
- **Fica disponível por todo o ciclo de vida do contrato** do cliente com o Gravity
- **Respeita isolamento de tenant** — empresas diferentes nunca veem os dados uma da outra

### Para que serve

| Necessidade | Como o histórico ajuda |
|-------------|----------------------|
| **Compliance e auditoria** | Trilha completa de quem fez o quê e quando, exportável |
| **Investigação de incidentes** | Rastrear a sequência de eventos que levou a um problema |
| **Segurança** | Detectar acessos não autorizados, ações em massa, mudanças de permissão |
| **Responsabilização** | Saber qual usuário ou sistema executou cada alteração sensível |
| **LGPD** | Registro de operações sobre dados pessoais e solicitações de exclusão |

---

## 2. O que é Registrado

### 2.1 Tipos de Ator (quem agiu)

| Tipo | Descrição | Exemplos |
|------|-----------|---------|
| `USER` | Usuário humano autenticado | João alterou um pedido, Maria aprovou uma cotação |
| `API` | Chamada via API key (ERP, integração externa) | SAP importou uma nota fiscal |
| `AI` | A assistente Gabi | Gabi resumiu um processo, Gabi respondeu uma cotação automaticamente |
| `JOB` | Automação interna agendada | Job noturno de consolidação, rotina de sincronização |
| `INTEGRATION` | Webhook ou sistema externo | Stripe confirmou pagamento, Clerk registrou login |

### 2.2 Módulos monitorados

O campo `module` identifica a área de negócio do evento. Cada produto e serviço define seus próprios módulos:

| Módulo | Área |
|--------|------|
| `pedido` | Gestão de pedidos |
| `cotacao` | Cotações de frete e câmbio |
| `processo` | Processos de importação/exportação |
| `nf` | Notas fiscais |
| `usuario` | Gestão de usuários e permissões |
| `configuracao` | Configurações do workspace |
| `auth` | Autenticação e segurança |
| `billing` | Pagamentos e assinaturas |
| `email` | Envio e recebimento de emails |
| `whatsapp` | Mensagens WhatsApp |
| `api` | Uso de API keys e tokens |
| `relatorio` | Geração e exportação de relatórios |
| `admin` | Ações administrativas Gravity |

### 2.3 Ações típicas

| Ação | Significado |
|------|------------|
| `CREATE` | Criação de um novo registro |
| `UPDATE` | Alteração de dados existentes |
| `DELETE` | Exclusão de registro |
| `APPROVE` | Aprovação de um item (cotação, pedido, documento) |
| `REJECT` | Rejeição de um item |
| `EXPORT` | Exportação de dados |
| `IMPORT` | Importação de dados externos |
| `LOGIN` | Autenticação bem-sucedida |
| `LOGOUT` | Encerramento de sessão |
| `PERMISSION_GRANTED` | Permissão concedida a um usuário |
| `PERMISSION_REVOKED` | Permissão revogada de um usuário |
| `ROLE_CHANGED` | Mudança de papel/role de um usuário |
| `CROSS_TENANT_ATTEMPT` | Tentativa de acesso a dados de outro tenant |
| `AUTH_FAILURE` | Falha de autenticação |
| `RATE_LIMIT_HIT` | Limite de requisições atingido |
| `DATA_DELETED` | Dados excluídos (ex: solicitação LGPD) |

### 2.4 Status do evento

| Status | Significado |
|--------|------------|
| `SUCCESS` | A ação foi concluída com sucesso |
| `FAILURE` | A ação falhou (ex: erro de validação, permissão negada) |
| `PARTIAL` | Ação parcialmente concluída (ex: alguns itens de uma importação em lote falharam) |

### 2.5 O que NÃO é registrado

Para manter o sistema eficiente e evitar ruído:

- **Leituras simples** — consultar uma lista ou abrir um detalhe não gera log (exceto em módulos de compliance explícito como contratos)
- **Falha de patente sem cross-tenant** — 403 retornado por `requireGravityAdmin` ou similar em rota administrativa **NÃO** gera evento `TENTAR_ACESSO_OUTRA_ORGANIZACAO`. O middleware `auth-error-logger` só dispara `securityAudit.crossTenantAttempt` quando `req.query.id_organizacao !== auth.id_organizacao` explicitamente (cruzamento real de organização). Métricas de 403 em rotas admin ficam em Prometheus (`http_403_total{rota=...}`), separadas do audit trail. Regra adicionada em 2026-05-05 — o comportamento anterior gravava todo 403 como tentativa cross-tenant, gerando falsos-positivos críticos no painel de segurança.
- **Dados de sessão** — tokens internos, refresh tokens, dados de cache
- **Eventos de infraestrutura** — health checks, métricas de APM, logs de servidor
- **Dados sensíveis em plaintext** — senhas, tokens de API completos nunca aparecem nos campos `estado_anterior_historico_log` / `estado_posterior_historico_log`

---

## 3. Quem Pode Ver o Quê

O acesso ao histórico é determinado pelo **role** do usuário autenticado:

### 3.1 Tabela de visibilidade

| Role | O que vê | Onde acessa |
|------|----------|-------------|
| `SUPER_ADMIN` | **Todos** os logs de **todos** os tenants | `/admin/historico` (Painel Gravity) |
| `ADMIN` | **Todos** os logs de **todos** os tenants | `/admin/historico` (Painel Gravity) |
| `MASTER` | Todos os logs do **próprio tenant** (toda a organização) | `/core/historico` |
| `STANDARD` | Apenas os logs onde **ele próprio** foi o ator | `/core/historico` |
| `SUPPLIER` | Apenas os logs onde **ele próprio** foi o ator | `/core/historico` |

### 3.2 Casos de uso por role

**SUPER_ADMIN / ADMIN (equipe Gravity):**
- Investigar incidentes em qualquer cliente
- Auditar uso da plataforma para compliance
- Visualizar alertas globais (ex: tentativas cross-tenant)
- Configurar regras de alerta globais que se aplicam a todos os tenants

**MASTER (gestor do cliente):**
- Ver quem na organização fez o quê e quando
- Identificar ações não autorizadas de colaboradores
- Exportar dados para auditoria interna
- Visualizar alertas da própria organização

**STANDARD / SUPPLIER:**
- Ver o próprio histórico de ações (transparência)
- Confirmar que suas ações foram registradas corretamente

---

## 4. Como Interpretar um Registro

Cada entrada do histórico contém:

```
ID:             Identificador único (UUID)
Data/Hora:      Timestamp em UTC com timezone
Ator:           Quem agiu (tipo + ID + nome + IP)
Módulo:         Área de negócio (pedido, cotacao, auth...)
Tipo de Recurso: O que foi afetado (Pedido, Cotação, Usuário...)
ID do Recurso:  Identificador do objeto específico (se aplicável)
Ação:           O que foi feito (CREATE, UPDATE, DELETE...)
Detalhe:        Descrição human-readable da ação
Antes:          Estado do objeto antes da alteração (JSON)
Depois:         Estado do objeto após a alteração (JSON)
Status:         SUCCESS / FAILURE / PARTIAL
Hash:           Assinatura SHA-256 de integridade
```

### 4.1 Lendo o diff Antes/Depois

Quando um registro tem campos `Antes` e `Depois`, a interface exibe uma comparação visual dos campos alterados. Apenas os campos que mudaram são destacados.

**Exemplo prático:**
```
Módulo: pedido | Ação: UPDATE
Ator: Maria Santos (USER)
Detalhe: Atualizou status do pedido #PED-2026-001

ANTES:                          DEPOIS:
{                               {
  "status": "PENDENTE",           "status": "APROVADO",
  "valor_total": 15000.00,        "valor_total": 15000.00,
  "aprovado_por": null            "aprovado_por": "user-maria-123"
}                               }
```

### 4.2 Verificando integridade

A integridade de cada log é garantida por um hash SHA-256 calculado no momento da gravação. Se um log foi adulterado após a gravação (diretamente no banco, por exemplo), o hash calculado não baterá com o registrado.

> **Importante:** A verificação de integridade é realizada pelo sistema internamente. Não é necessária ação do usuário para garantir a imutabilidade dos logs.

---

## 5. Alertas

O sistema de alertas monitora automaticamente o histórico e notifica responsáveis quando padrões suspeitos são detectados.

### 5.1 O que são alertas

Um **alerta** é gerado automaticamente quando uma ação (ou conjunto de ações) corresponde a uma **regra de alerta** configurada. Exemplos:

- Um usuário deletou 15 registros em menos de 1 minuto
- Houve uma tentativa de acessar dados de outro tenant
- Uma API key foi usada fora do horário comercial
- Um usuário teve sua permissão elevada para MASTER

### 5.2 Tipos de regras de alerta

#### Regras sem threshold (disparo imediato)

Disparam no primeiro match da ação, sem contar eventos. Usadas para situações que já são graves por si só:

| Exemplo de regra | Actor | Ação | Módulo |
|-----------------|-------|------|--------|
| Tentativa cross-tenant | qualquer | `CROSS_TENANT_ATTEMPT` | `auth` |
| Falha de assinatura webhook | INTEGRATION | `WEBHOOK_SIGNATURE_FAILURE` | `auth` |
| Mudança de role de usuário | qualquer | `ROLE_CHANGED` | `configuracao` |
| Exclusão em massa de dados | qualquer | `DATA_DELETED` | qualquer |

#### Regras com threshold (disparo por volume)

Disparam apenas quando um número mínimo de eventos ocorre dentro de uma janela de tempo:

| Exemplo de regra | Threshold | Janela |
|-----------------|-----------|--------|
| Ação em massa (DELETE) | ≥ 10 eventos | 60 segundos |
| Múltiplas falhas de auth | ≥ 5 eventos | 5 minutos |
| Exportações em sequência | ≥ 3 eventos | 30 minutos |
| Uso intenso de API | ≥ 100 eventos | 1 hora |

### 5.3 Canais de notificação

Cada regra pode notificar por um ou mais canais:

| Canal | Configuração |
|-------|-------------|
| **In-app** | Notificação no painel Gravity (ícone de sino) |
| **Email** | Envio para lista de emails configurada na regra |
| **WhatsApp** | Mensagem para lista de números configurada na regra |

Canais falhos tentam novamente até 3 vezes (em 5s, 15s e 45s) antes de registrar falha definitiva.

### 5.4 Status de alertas

| Status | Significado | Quem pode alterar |
|--------|------------|-------------------|
| `PENDING` | Alerta gerado, ainda não revisado | — |
| `REVIEWED` | Revisado e considerado normal ou esperado | SUPER_ADMIN, ADMIN, MASTER |
| `ESCALATED` | Escalado para investigação ou ação | SUPER_ADMIN, ADMIN, MASTER |

### 5.5 Regras globais vs. por tenant

- **Regras globais** (`tenant_id = null`): Criadas pela equipe Gravity, aplicadas a todos os tenants. Não podem ser editadas por clientes.
- **Regras por tenant**: Criadas pelo MASTER de cada organização para monitorar comportamentos específicos do negócio deles.

### 5.6 Como criar uma regra de alerta

1. Acessar `/core/historico` → aba "Alertas" → botão "Nova Regra"
2. Definir **nome** e **descrição** da regra
3. Configurar **filtros** (opcional — null = qualquer valor):
   - Tipo de ator (USER, API, AI...)
   - Ação (DELETE, EXPORT...)
   - Módulo (pedido, auth...)
4. Configurar **threshold** (opcional):
   - Quantidade mínima de eventos
   - Janela de tempo em segundos
5. Selecionar **canais** de notificação e **destinatários**
6. Salvar e ativar

---

## 6. Exportação de Dados

O histórico pode ser exportado para análise em ferramentas externas (Excel, Power BI, sistemas de GRC).

### 6.1 Formatos disponíveis

| Formato | Uso recomendado |
|---------|----------------|
| **CSV** | Excel, Google Sheets, ferramentas de BI |
| **JSON** | Integração com sistemas, importação para outros bancos |

### 6.2 Filtros disponíveis na exportação

Todos os filtros da listagem são aplicáveis na exportação:

- Período (data/hora inicial e final)
- Tipo de ator
- Módulo
- Ação
- Status do evento

### 6.3 Limite de registros

| Quantidade | Comportamento |
|-----------|---------------|
| Até 10.000 registros | Download imediato |
| Acima de 10.000 registros | Processamento em background — link de download disponível em breve (ainda não implementado, retorna 202 com aviso) |

### 6.4 Quem pode exportar

Qualquer usuário pode exportar **seus próprios logs**. MASTER pode exportar logs de toda a organização. SUPER_ADMIN e ADMIN podem exportar logs de qualquer tenant.

---

## 7. Compliance e LGPD

### 7.1 Retenção de dados

Os logs do histórico são retidos por todo o período contratual do cliente. Não existe exclusão automática por tempo. Em caso de encerramento de contrato, a política de retenção pós-contrato é definida nos termos de serviço.

### 7.2 Solicitações de exclusão (LGPD Art. 18)

Quando um usuário solicita exclusão de dados pessoais (direito ao esquecimento):

1. A ação de exclusão **em si** é registrada no histórico com ação `DATA_DELETED`
2. Os **dados pessoais** dos registros anteriores podem ser anonimizados (substituídos por `[REMOVIDO]`)
3. O **registro da ação** permanece, mas sem dados identificadores
4. O alerta `DATA_DELETED` é disparado automaticamente para rastreabilidade

Esse processo garante conformidade com a LGPD sem perder a rastreabilidade de que a exclusão ocorreu.

### 7.3 Acesso por auditores externos

Para disponibilizar logs a auditores externos sem dar acesso ao sistema:

1. Usar a exportação para CSV/JSON com filtro de período
2. O arquivo exportado inclui o campo `integrity_hash` de cada log
3. Auditores podem verificar que os hashes são consistentes com as ações descritas

---

## 8. Perguntas Frequentes

### Um usuário deletou dados importantes. Como rastrear?

1. Ir em `/core/historico` (MASTER) ou `/admin/historico` (SUPER_ADMIN/ADMIN)
2. Filtrar por `Ação: DELETE` e o período aproximado
3. Filtrar por `Módulo` relevante (ex: `pedido`)
4. Abrir o log encontrado e verificar o campo `Antes` — ele contém o estado completo do objeto antes da exclusão

### Como saber se um log foi adulterado?

O campo `integrity_hash` de cada log é um SHA-256 calculado a partir do conteúdo no momento da gravação. A equipe de tecnologia do Gravity pode recalcular e comparar o hash para verificar adulteração. Usuários finais não precisam verificar manualmente — o sistema faz isso internamente.

### Por que vejo "Processando..." para alguns logs?

O log é registrado de forma assíncrona (para não atrasar a operação do usuário). Existe um atraso de milissegundos entre a ação e o log aparecer na listagem. Se após alguns segundos o log não aparecer, pode indicar falha na fila de processamento — reportar à equipe de suporte.

### Um alerta foi disparado erroneamente. O que fazer?

1. Abrir o alerta em `/core/historico` → aba "Alertas"
2. Clicar em "Revisar" e adicionar uma nota explicando que foi um falso positivo
3. Alterar o status para `REVIEWED`
4. Se a regra estiver gerando muitos falsos positivos, ajustar o threshold ou desativar a regra

### Como configurar alertas para ações específicas do meu negócio?

Exemplo: quero saber quando qualquer pedido for excluído.

1. Criar regra de alerta:
   - Módulo: `pedido`
   - Ação: `DELETE`
   - Threshold: sem threshold (disparo imediato)
   - Canal: email para o gerente
2. Qualquer exclusão de pedido gerará um alerta instantâneo para o email configurado

### Posso ver o histórico de outro usuário da minha organização?

Apenas se você tiver o role `MASTER` ou superior. Usuários com role `STANDARD` ou `SUPPLIER` veem apenas o próprio histórico.

### O histórico inclui dados de outros produtos (bid-frete, bid-câmbio)?

Sim, desde que esses produtos estejam instrumentados para enviar eventos ao historico-global. O campo `module` identifica de qual produto o evento veio. O campo `product_id` identifica o produto específico para filtros precisos.

---

## 9. Casos de Uso por Perfil

### Gerente de TI / Segurança

- Monitorar alertas de ações em massa (possível ataque ou erro humano)
- Investigar tentativas de acesso cross-tenant
- Verificar mudanças de permissão e role de usuários
- Exportar logs para SIEM ou sistema de GRC

### Compliance Officer

- Exportar histórico completo de um período para auditoria
- Verificar trilha de acesso a dados sensíveis
- Documentar ações tomadas em resposta a incidentes
- Registrar e rastrear solicitações LGPD

### Gerente de Operações (MASTER)

- Monitorar atividade da equipe em módulos críticos
- Investigar discrepâncias em dados (quem alterou o quê)
- Identificar usuários que não estão seguindo processos estabelecidos
- Configurar alertas para ações incomuns no negócio

### Suporte Técnico Gravity (ADMIN)

- Investigar problemas relatados por clientes
- Verificar se integrações externas estão operando corretamente
- Confirmar se jobs automáticos executaram com sucesso
- Correlacionar eventos de log com incidentes de sistema

---

## 10. Limitações Conhecidas

| Limitação | Plano futuro |
|-----------|-------------|
| Exportação > 10k registros retorna 202 sem link de download | Implementar job de exportação com armazenamento S3/R2 |
| Alertas não têm snooze ou horário de silêncio | Adicionar janelas de silêncio por regra |
| Diff visual funciona apenas para objetos JSON simples | Melhorar para diffs de arrays e objetos aninhados profundos |
| Não há relatório de resumo automático (ex: "resumo semanal") | Integrar com serviço de relatórios |
| `actor_name` é registrado no momento da ação — não atualiza se o usuário mudar de nome | Comportamento intencional para imutabilidade; o `actor_id` permite busca pelo usuário atual |

---

## 2026-05-03 — Política de subdomínio: sistema gera, unicidade global cross-tabela

**Decisão:** ver [ADR 0002](../decisoes-arquiteturais/0002-subdominio-system-generated-cross-tabela.md).

**Resumo:**
- Subdomínio (`<sub>.usegravity.com.br`) é **gerado pelo sistema** a partir do nome — usuário não escolhe.
- **Unicidade GLOBAL cross-tabela**: helper `proximoSubdominioDisponivel` em `organizacaoService.ts` consulta `organizacao.subdominio_organizacao` E `workspace.subdominio_workspace`. Auto-suffix `-2`, `-3`, ... (teto 100).
- **Race-safe** via captura de `P2002` (Prisma unique violation) com retry.
- **Imutável após criação** — PATCH não aceita `subdominio_workspace` no body.
- **Preview ao vivo** no modal: `GET /api/v1/me/sugestoes-subdominio?base=<slug>` com debounce 400ms.
- **Domínio canônico:** `usegravity.com.br` (substituiu `gravity.com.br` em 73 ocorrências do código).
