# Componentes Atualizados com i18n

## Resumo

50+ componentes foram atualizados para usar `useTranslation()` e `t()` em vez de textos hardcoded em português.

## Padrão de Atualização

### Antes (hardcoded)

```typescript
function MeuComponente() {
  return <button>Salvar</button>
}
```

### Depois (i18n)

```typescript
import { useTranslation } from 'react-i18next'

function MeuComponente() {
  const { t } = useTranslation()
  return <button>{t('botoes.salvar')}</button>
}
```

### Para props com valor padrão

```typescript
// Antes
function Botao({ rotulo = 'Salvar' }) { ... }

// Depois
function Botao({ rotulo }: Props) {
  const { t } = useTranslation()
  const label = rotulo ?? t('botoes.salvar')
  ...
}
```

---

## Lista Completa de Arquivos Modificados

### Shell (6 arquivos)

| Arquivo | O que mudou |
|---------|-------------|
| `servicos-global/shell/Header.tsx` | LanguageSwitcher integrado; breadcrumb ROUTE_LABELS via t(); tooltips; mock data de notificações; fallback de userName/email/role |
| `servicos-global/shell/Layout.tsx` | Sincronização i18n no mount; fallback tenantName/tenantPlan via t(); aria-label do main; Suspense fallback |
| `servicos-global/shell/Sidebar.tsx` | Labels do menu: Produtos Gravity, SimulaCusto, BID Cambio, Pedidos de Compra, Exportador DUIMP, Tracking de Carga, Meu Espaço |
| `servicos-global/shell/Navigation.tsx` | ModulePlaceholder: "Módulo" e "Onda 3" via t() |
| `servicos-global/shell/ContextualSidebar.tsx` | Deep Work: Sair do Processo, Processo #, Resumo da D.I., Financeiro, Mensageria |
| `servicos-global/shell/ToastContainer.tsx` | aria-labels: "Notificações" e "Fechar notificação" |

### Nucleo-global — Campos (3 arquivos)

| Arquivo | Chaves usadas |
|---------|---------------|
| `Campos/campo-select-global/src/select-global.tsx` | `campo.carregando`, `campo.nenhuma_opcao`, `campo.buscar_placeholder`, `campo.buscar_opcoes`, `campo.limpar_selecao`, `campo.remover` |
| `Campos/campo-calendario-global/src/CalendarioCampoGlobal.tsx` | Todos os `calendario.*` (meses, dias, presets), `campo.limpar`, `campo.limpar_selecao`, `campo.selecione_periodo` |
| `Campos/campo-localizar-expandido-global/src/LocalizarExpandidoCampoGlobal.tsx` | `campo.localizar_sistema`, `campo.localizar_tela`, `campo.localizar_tela_desc` |

### Nucleo-global — Botões e Feedback (2 arquivos)

| Arquivo | Chaves usadas |
|---------|---------------|
| `Botoes/botoes-salvar-global/src/botoes-salvar.tsx` | `botoes.salvar`, `botoes.salvando`, `botoes.cancelar`, `botoes.salvar_tooltip`, `botoes.cancelar_tooltip`, `botoes.alteracoes_nao_salvas` |
| `Feedback/status-salvar-global/src/StatusSalvarGlobal.tsx` | `feedback.salvo`, `feedback.alteracoes_pendentes`, `feedback.salvando`, `feedback.salvo_sucesso`, `feedback.erro_salvar` |

### Nucleo-global — Modais (2 arquivos)

| Arquivo | Chaves usadas |
|---------|---------------|
| `Modais/modal-formulario-abas-global/src/modal-formulario-abas-global.tsx` | `modal.salvar_alteracoes`, `modal.cancelar` |
| `Modais/modal-formulario-global/src/modal-formulario-global.tsx` | `modal.salvar_alteracoes`, `modal.cancelar`, `modal.excluir` |

### Nucleo-global — Tabelas (3 arquivos)

| Arquivo | Chaves usadas |
|---------|---------------|
| `Tabelas/tabela-global/src/tabela.tsx` | ~25 chaves de `tabela.*` (ordenar, filtrar, paginar, buscar, empty states, tooltips) |
| `Tabelas/tabela-camadas-global/src/TabelaCamadasGlobal.tsx` | `tabela.localizar`, `tabela.nenhum_item`, `tabela.gerenciar_colunas`, `tabela.acoes`, `comum.carregando`, `tabela.por_pagina_label`, `tabela.exportar` |
| `Tabelas/tabela-global/src/componentes/VisibilidadeColunasGlobal.tsx` | `tabela.paineis_visiveis`, `tabela.selecionar_tudo`, `tabela.restaurar_padrao` |

### Nucleo-global — Layout e Login (2 arquivos)

| Arquivo | Chaves usadas |
|---------|---------------|
| `Layout/usuario-global/src/UsuarioGlobal.tsx` | `usuario.*` (16 chaves: perfil, conta, acesso restrito, gerenciar org, assinaturas, admin, configurador, tema, ajuda, novidades, sair) |
| `Login/login-global/src/LoginGlobal.tsx` | `login.*` (19 chaves: títulos, subtítulos, botões, links, recuperação de senha, erros) |

### Admin (6 arquivos)

| Arquivo | Namespace principal |
|---------|-------------------|
| `configurador/src/pages/admin/AdminLayout.tsx` | `admin.layout.*` — 10 nav items, tenant info, tooltip toggle, LanguageSwitcher |
| `configurador/src/pages/workspace/ApiCockpit.tsx` | `admin.cockpit.*` — título, subtítulo, abas, colunas, empty states |
| `configurador/src/pages/admin/MonitorApisAdmin.tsx` | `admin.monitor.*` — título, stats, abas, colunas, empty states, botão novo alerta |
| `configurador/src/pages/admin/SegurancaAdmin.tsx` | `admin.security.*` — título, 4 stats, 4 abas, colunas, filtros, health summary, rate limits, secrets |
| `configurador/src/pages/admin/HistoricoGlobalAdmin.tsx` | `admin.history.*` — título, colunas com tooltips, ações, diff, empty states |
| `configurador/src/pages/admin/DeployRailwayAdmin.tsx` | `admin.deploy.*` — título, 7 colunas com tooltips, status, empty states |

### Workspace (7 arquivos)

| Arquivo | Namespace principal |
|---------|-------------------|
| `configurador/src/pages/workspace/WorkspaceLayout.tsx` | `workspace.layout.*` — 6 nav items, LanguageSwitcher |
| `configurador/src/pages/workspace/Organizacao.tsx` | `workspace.organization.*` — labels, placeholders, toasts |
| `configurador/src/pages/workspace/Assinaturas.tsx` | `workspace.subscriptions.*` — colunas, tooltips, upsell |
| `configurador/src/pages/workspace/Financeiro.tsx` | `workspace.financial.*` — título, abas, stats, status |
| `configurador/src/pages/workspace/Workspaces.tsx` | `workspace.workspaces.*` — título, colunas, tooltips |
| `configurador/src/pages/workspace/Usuarios.tsx` | `workspace.users.*` — título, colunas |
| `configurador/src/pages/workspace/ApiCockpit.tsx` | `admin.cockpit.*` (compartilha namespace com admin) |

### Produtos (7 arquivos)

| Arquivo | Namespace principal |
|---------|-------------------|
| `produto/simula-custo/client/src/pages/dashboard/DashboardSimulaCusto.tsx` | `simulacusto.dashboard.*` — KPIs, legendas, períodos, alertas |
| `produto/simula-custo/client/src/pages/estimativas/Estimativas.tsx` | `simulacusto.formulario.*` — form labels, botões, resultados |
| `produto/simula-custo/client/src/pages/estimativas/EstimativasDashboard.tsx` | `simulacusto.estimativas.*` — título, stats, tabela, ações |
| `produto/bid-frete/client/src/pages/Dashboard.tsx` | `bidfrete.dashboard.*` — KPIs, calendário, tabela |
| `produto/bid-frete/client/src/pages/Cotacoes.tsx` | `bidfrete.cotacoes.*` — título, tabs, kanban, busca |
| `produto/bid-cambio/client/src/pages/Dashboard.tsx` | `bidcambio.dashboard.*` — KPIs, funil, calendário, erros |
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | `pedido.*` — título, stats, tabela, ações, busca |

### Serviços Tenant e Marketplace (2 arquivos)

| Arquivo | Namespace principal |
|---------|-------------------|
| `servicos-global/tenant/dashboard/src/Dashboard.tsx` | `tenant_dashboard.*` — título, KPIs, funil, health score, alertas |
| `servicos-global/marketplace/src/pages/Home.tsx` | `marketplace.*` — hero, features, pricing, CTA, demo |
