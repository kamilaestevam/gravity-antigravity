---
name: antigravity-service-registry
description: "Use esta skill sempre que uma tarefa envolver a declaração de serviços no PRODUCT_CONFIG de um produto, configuração da navegação do shell, ou decisão sobre qual serviço um produto deve usar. Define como declarar serviços no config.ts, a diferença entre source organização e source product, e como o shell consome a navegação."
---

# Gravity — Service Registry

## O Que é o Service Registry

O **PRODUCT_CONFIG** em `src/shared/config.ts` é a fonte de verdade de um produto. Ele declara:
- Quais serviços de organização o produto usa
- Quais serviços de produto (templates) o produto instancia
- Como a navegação lateral é montada pelo shell

O shell lê o `PRODUCT_CONFIG` e monta automaticamente a sidebar e o roteamento. O servidor lê o `PRODUCT_CONFIG` e sabe quais rotas montar e para onde proxiar.

---

## Estrutura Completa do PRODUCT_CONFIG

```typescript
// produtos/[nome-do-produto]/src/shared/config.ts

export interface NavigationItem {
  id: string         // identificador único da seção
  label: string      // texto exibido na sidebar
  icon: string       // nome do ícone (biblioteca do design system)
  source: 'product' | 'organização'  // de onde vem o componente
}

export const PRODUCT_CONFIG = {
  id: '[nome-do-produto]',    // identificador único no ecossistema
  name: '[Nome do Produto]',  // nome exibido na interface

  // Serviços de organização que este produto usa
  // O proxy será configurado automaticamente para estes serviços
  tenantServices: [
    'activities',
    'email',
    'whatsapp',
    'dashboard',
    'reports',
    'history',
    'schedule',
    'gabi'
  ],

  // Serviços de produto (templates) instanciados neste produto
  // O banco é do produto — o código é compartilhado
  productServices: ['helpdesk'],

  // Navegação da sidebar — ordem define a ordem de exibição
  navigation: [
    // Pages específicas do produto (source: 'product')
    { id: '[pagina-1]', label: '[Label]', icon: '[icon]', source: 'product' },

    // Serviços de organização (source: 'organização')
    { id: 'activities', label: 'Atividades', icon: 'check-circle',   source: 'organização' },
    { id: 'email',      label: 'Email',      icon: 'mail',           source: 'organização' },
    { id: 'whatsapp',   label: 'WhatsApp',   icon: 'message-circle', source: 'organização' },

    // Serviços de produto (source: 'product')
    { id: 'helpdesk', label: 'Helpdesk', icon: 'headphones', source: 'product' },

    // Serviços de organização de consolidação
    { id: 'dashboard', label: 'Dashboard',  icon: 'layout',    source: 'organização' },
    { id: 'reports',   label: 'Relatórios', icon: 'bar-chart', source: 'organização' },
    { id: 'history',   label: 'Histórico',  icon: 'clock',     source: 'organização' },
    { id: 'schedule',  label: 'Agenda',     icon: 'calendar',  source: 'organização' },
    { id: 'gabi',      label: 'Gabi',       icon: 'cpu',       source: 'organização' },
  ] satisfies NavigationItem[]
} as const
```

---

## A Diferença entre source: organização e source: product

### `source: 'organização'`
- O componente React vem de `servicos-global/organização/[servico]/src/`
- O backend roda no servidor de organização — não no servidor do produto
- O produto acessa via proxy: `/api/organização/[servico]`
- Os dados pertencem à empresa (organização), não ao produto
- **Quando usar:** email, atividades, whatsapp, dashboard, relatórios, histórico, agenda, gabi

### `source: 'product'`
- O componente React vem de `produtos/[produto]/src/pages/[pagina]/`
- O backend roda no servidor do produto
- O produto acessa diretamente: `/api/v1/[pagina]`
- Os dados pertencem ao produto
- **Quando usar:** telas específicas do domínio do produto + helpdesk (template de produto)

---

## Como o Shell Usa o PRODUCT_CONFIG

```typescript
// nucleo-global/shell/navigation.tsx
import { lazy, Suspense } from 'react'
import type { NavigationItem } from '../types'

// Módulos de organização — carregados via lazy loading
const tenantModules: Record<string, React.LazyExoticComponent<React.FC>> = {
  activities: lazy(() => import('@organização/atividades/src/Atividades')),
  email:      lazy(() => import('@organização/email/src/Email')),
  whatsapp:   lazy(() => import('@organização/whatsapp/src/WhatsApp')),
  dashboard:  lazy(() => import('@organização/dashboard/src/Dashboard')),
  reports:    lazy(() => import('@organização/relatorios/src/Relatorios')),
  history:    lazy(() => import('@organização/historico/src/Historico')),
  schedule:   lazy(() => import('@organização/agendamento/src/Agendamento')),
  gabi:       lazy(() => import('@organização/gabi/src/Gabi')),
}

export function renderModule(
  item: NavigationItem,
  productPages: Record<string, React.LazyExoticComponent<React.FC>>
) {
  // source: 'organização'  → carrega do tenantModules
  // source: 'product' → carrega das pages do produto
  const Component = item.source === 'organização'
    ? tenantModules[item.id]
    : productPages[item.id]

  if (!Component) return null

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Component />
    </Suspense>
  )
}
```

---

## Como o Backend Usa o PRODUCT_CONFIG

```typescript
// produtos/[nome-do-produto]/server/index.ts
import { createTenantProxy } from '@organização/proxy'
import { PRODUCT_CONFIG } from '../src/shared/config'

// Proxy automático para todos os serviços de organização declarados
app.use('/api/organização', createTenantProxy({
  baseUrl: process.env.TENANT_SERVICES_URL!,
  services: PRODUCT_CONFIG.tenantServices
}))

// O proxy monta automaticamente:
// /api/organização/activities → organização-services/api/v1/activities
// /api/organização/email      → organização-services/api/v1/email
// /api/organização/whatsapp   → organização-services/api/v1/whatsapp
// etc.
```

---

## Catálogo de Serviços Disponíveis

### Serviços de Organização — usar com `source: 'organização'`

| id | label sugerido | icon sugerido | O que faz |
|:---|:---|:---|:---|
| `activities` | Atividades | `check-circle` | Tarefas e atividades unificadas |
| `email` | Email | `mail` | Inbox da empresa |
| `whatsapp` | WhatsApp | `message-circle` | Conversas por contato |
| `dashboard` | Dashboard | `layout` | KPIs consolidados |
| `reports` | Relatórios | `bar-chart` | Relatórios cruzados |
| `history` | Histórico | `clock` | Auditoria completa |
| `schedule` | Agenda | `calendar` | Calendário do usuário |
| `gabi` | Gabi | `cpu` | IA com contexto completo |
| `timers` | Cronômetro | `timer` | Tempo por atividade |

### Serviços de Produto — usar com `source: 'product'`

| id | label sugerido | icon sugerido | O que faz |
|:---|:---|:---|:---|
| `helpdesk` | Helpdesk | `headphones` | Suporte com SLA configurável por produto |

---

## Regras de Declaração

- Todo item de `navigation` deve ter `source` explícito — nunca implícito
- A ordem em `navigation` define a ordem de exibição na sidebar
- Itens com `source: 'organização'` devem estar em `tenantServices`
- Itens com `source: 'product'` e que são templates devem estar em `productServices`
- Pages específicas do produto (`source: 'product'`) não precisam de entrada em `productServices`
- Não declarar serviços de organização que o produto não usa — gera proxy desnecessário

---

## Checklist — Antes de Finalizar o PRODUCT_CONFIG

- [ ] `id` do produto é único no ecossistema?
- [ ] Todos os itens de `navigation` com `source: 'organização'` estão em `tenantServices`?
- [ ] Todos os templates de serviço de produto estão em `productServices`?
- [ ] Nenhum serviço de organização declarado que o produto não vai usar?
- [ ] Ordem da `navigation` reflete a ordem desejada na sidebar?
- [ ] Todos os `icon` usam nomes da biblioteca de ícones do design system?
- [ ] `satisfies NavigationItem[]` presente para garantir tipagem?
- [ ] `as const` no final para inferência de tipos?
