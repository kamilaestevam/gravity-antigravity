# Namespaces e Chaves de Tradução

## Organização

Os 950 textos estão organizados em namespaces semânticos dentro do `pt.json`. Cada namespace corresponde a um módulo ou área da plataforma.

## Mapa Completo de Namespaces

### Núcleo (compartilhado por toda a plataforma)

| Namespace | Chaves | Descrição | Exemplo |
|-----------|--------|-----------|---------|
| `comum` | 33 | Termos universais | `comum.salvar` → "Salvar" |
| `acoes` | 8 | Ações genéricas | `acoes.ver_detalhes` → "Ver detalhes" |
| `modal` | 5 | Texto de modais | `modal.salvar_alteracoes` → "Salvar Alterações" |
| `tabela` | 28 | Componente TabelaGlobal | `tabela.ordenar` → "Ordenar" |
| `campo` | 11 | Campos de formulário | `campo.buscar_placeholder` → "Buscar..." |
| `calendario` | 25 | Componente calendário | `calendario.mes_0` → "Janeiro" |
| `botoes` | 6 | Botões salvar/cancelar | `botoes.salvando` → "Salvando…" |
| `feedback` | 5 | Status de operações | `feedback.salvo_sucesso` → "Salvo com sucesso" |

### Shell (navegação principal)

| Namespace | Chaves | Descrição | Exemplo |
|-----------|--------|-----------|---------|
| `shell` | 30 | Header, layout, estados | `shell.busca_global` → "Busca global" |
| `shell.menu` | 22 | Itens do menu lateral | `shell.menu.dashboard` → "Dashboard" |
| `shell.secao` | 5 | Seções do menu | `shell.secao.comunicacao` → "Comunicação" |
| `shell.idioma` | 5 | Seletor de idioma | `shell.idioma.trocar_idioma` → "Trocar idioma" |
| `shell.notificacoes_mock` | 2 | Avisos de exemplo | `shell.notificacoes_mock.boas_vindas` |

### Autenticação

| Namespace | Chaves | Descrição | Exemplo |
|-----------|--------|-----------|---------|
| `login` | 19 | Telas de login/registro | `login.acessar_titulo` → "Acessar a plataforma" |
| `usuario` | 16 | Menu de perfil | `usuario.gerenciar_organizacao` → "Gerenciar Organização" |

### Admin (painel interno Gravity)

| Namespace | Chaves | Descrição | Traduzido? |
|-----------|--------|-----------|------------|
| `admin.layout` | 19 | Menu e layout admin | Sim |
| `admin.cockpit` | **26** | **API Cockpit** | **NÃO (PT-only)** |
| `admin.monitor` | 23 | Monitor de infraestrutura | Sim |
| `admin.overview` | 34 | Visão geral da plataforma | Sim |
| `admin.security` | 57 | Painel de segurança | Sim |
| `admin.financial` | 17 | Financeiro global | Sim |
| `admin.users` | 30 | Usuários globais | Sim |
| `admin.products` | 21 | Catálogo de produtos | Sim |
| `admin.history` | 55 | Histórico global (audit) | Sim |
| `admin.tests` | 7 | Log de testes | Sim |
| `admin.deploy` | 32 | Deploy Railway | Sim |

### Workspace (configurador por tenant)

| Namespace | Chaves | Descrição | Exemplo |
|-----------|--------|-----------|---------|
| `workspace.layout` | 9 | Menu do configurador | `workspace.layout.organizacao` → "Organização" |
| `workspace.connectors` | 14 | Conectores (CargoWise, etc.) | `workspace.connectors.aba_teste` → "Teste de Conexão" |
| `workspace.organization` | 10 | Dados da organização | `workspace.organization.msg_sucesso` |
| `workspace.users` | 6 | Gestão de usuários | `workspace.users.tabela.usuario` → "Usuário" |
| `workspace.workspaces` | 7 | Gestão de workspaces | `workspace.workspaces.titulo` → "Workspaces" |
| `workspace.subscriptions` | 16 | Assinaturas e upsell | `workspace.subscriptions.upsell.nfe` |
| `workspace.financial` | 9 | Financeiro do tenant | `workspace.financial.aba_faturas` |

### Produtos

| Namespace | Chaves | Descrição |
|-----------|--------|-----------|
| `simulacusto.dashboard` | 17 | Dashboard do SimulaCusto |
| `simulacusto.periodos` | 8 | Filtros de período |
| `simulacusto.estimativas` | 22 | Gestão de estimativas |
| `simulacusto.formulario` | 22 | Formulário de custo |
| `simulacusto.modal_simulacao` | 3 | Modal de nova simulação |
| `simulacusto.importar_massa` | 3 | Importação em massa |
| `simulacusto.relatorios` | 18 | Relatórios financeiros |
| `bidfrete.dashboard` | 13 | Dashboard BID Frete |
| `bidfrete.tabela` | 10 | Colunas da tabela |
| `bidfrete.cotacoes` | 16 | Gestão de cotações |
| `bidfrete.nova_cotacao` | 17 | Formulário de cotação |
| `bidfrete.calendario` | 3 | Calendário de cotações |
| `bidcambio.dashboard` | 16 | Dashboard BID Câmbio |
| `pedido` | 13 | Gestão de pedidos |
| `pedido.tabela` | 20 | Colunas da tabela |
| `pedido.acoes` | 4 | Ações de pedido |
| `processo` | 5 | Processo geral |
| `processo.status` | 6 | Status do processo |
| `processo.menu` | 13 | Menu do processo |
| `processo.dados_tecnicos` | 28 | Dados técnicos |

### Serviços e Marketplace

| Namespace | Chaves | Descrição |
|-----------|--------|-----------|
| `marketplace.hero` | 3 | Hero section da landing |
| `marketplace.features` | 12 | Cards de funcionalidades |
| `marketplace.social_proof` | 1 | Social proof |
| `marketplace.servicos` | 2 | Seção de serviços |
| `marketplace.demo` | 2 | Seção de demo |
| `marketplace.pricing` | 4 | Preços |
| `marketplace.cta` | 4 | Call to action |
| `marketplace.kpi` | 3 | KPIs do demo |
| `tenant_dashboard` | 21 | Dashboard consolidado |

## Convenção de Nomenclatura

### Padrão geral

```
namespace.elemento
namespace.sub_namespace.elemento
```

### Regras

| Regra | Exemplo correto | Exemplo errado |
|-------|----------------|----------------|
| snake_case sempre | `shell.busca_global` | `shell.buscaGlobal` |
| Namespace por módulo | `simulacusto.titulo` | `produtos.simulacusto.titulo` |
| Agrupamento por tipo | `admin.users.tabela.email` | `admin.users.email_coluna` |
| Status separado | `admin.deploy.status.concluido` | `admin.deploy.concluido` |
| Vazio/empty states | `admin.monitor.vazio.sem_servicos` | `admin.monitor.nenhum_servico` |
| Mensagens (toast) | `workspace.organization.msg_sucesso` | `workspace.organization.sucesso_toast` |
| Tooltips | `admin.history.tabela.quando_tooltip` | `admin.history.tooltip_quando` |

### Variáveis de interpolação

```json
{
  "saudacao": "Olá, {{nome}}!",
  "contagem": "{{count}} item selecionado",
  "tema": "Alternar para Tema {{tema}}"
}
```

Uso no componente:
```typescript
t('saudacao', { nome: 'Daniel' })     // → "Olá, Daniel!"
t('contagem', { count: 5 })           // → "5 item selecionado"
t('tema', { tema: 'Escuro' })         // → "Alternar para Tema Escuro"
```
