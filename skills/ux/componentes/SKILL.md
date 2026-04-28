---
name: antigravity-componentes
description: "Use esta skill sempre que um agente precisar decidir qual componente global usar em uma situação específica. É um catálogo de decisão: dada uma necessidade de interface ou funcionalidade, aponta qual componente do nucleo-global ou serviço de organização usar, como importar e quando NÃO usar cada um. Não documenta implementação detalhada — para isso consultar antigravity-nucleo-global ou antigravity-servicos-organizacao."
---

# Gravity — Catálogo de Componentes

## Como Usar Este Catálogo

Antes de criar qualquer componente novo, consultar este catálogo. Se a necessidade já existe aqui → usar o componente existente. Se não existe → verificar com o Líder antes de criar algo novo.

> **Regra:** nunca criar um componente que já existe no `nucleo-global` ou nos serviços de organização. Duplicação é proibida.

---

## Decisão Rápida — Por Tipo de Necessidade

| Preciso de... | Usar |
|:---|:---|
| Página de listagem com tabela completa | **PaginaTabelaGlobal** (template) |
| Página de formulário com salvar/cancelar | **PaginaFormularioGlobal** (template) |
| Página de dashboard com KPIs | **PaginaDashboardGlobal** (template) |
| Empilhar elementos verticalmente | **StackGlobal** (composição) |
| Layout horizontal com alinhamento | **FlexGlobal** (composição) |
| Grid responsivo de cards/campos | **GridGlobal** (composição) |
| Agrupar conteúdo com título | **SecaoGlobal** (composição) |
| Tabela com filtros, busca, paginação, CRUD | **TabelaGlobal** |
| Modal com abas, header, footer | **ModalGlobal** |
| Confirmação antes de ação destrutiva | **ConfirmarGlobal** |
| Select com busca e múltipla seleção | **CaixaSelectGlobal** |
| Tooltip ou dica contextual | **DicaGlobal** |
| Chamada HTTP para API | `apiClient` de **api-global** |
| Formatar CPF, CNPJ, moeda, data | **utilitarios-global** |
| Botão de retorno ao Hub no header de qualquer layout | **HubButton** (ver seção abaixo) |
| Layout, sidebar, navegação entre módulos | **Shell** |
| Notificações toast (sucesso, erro, aviso) | **Shell** — `addNotification` |
| Comunicação entre módulos sem acoplamento | **Shell** — event bus |
| Gerenciar tarefas e atividades | Serviço de organização **atividades** |
| Enviar ou receber email | Serviço de organização **email** |
| Conversar via WhatsApp | Serviço de organização **whatsapp** |
| KPIs e métricas consolidadas | Serviço de organização **dashboard** |
| Cronometrar tempo por atividade | Serviço de organização **cronometro** |
| Relatórios cruzados entre produtos | Serviço de organização **relatorios** |
| Auditoria — quem fez o quê e quando | Serviço de organização **historico** |
| Calendário e agendamentos | Serviço de organização **agendamento** |
| Chat com IA contextual | Serviço de organização **gabi** |
| Suporte com tickets e SLA | Serviço produto **helpdesk** |

---

## Componentes do nucleo-global

### TabelaGlobal

**Quando usar:** toda tela que exibe uma lista de registros com filtros, busca, paginação, ordenação, seleção em massa ou exportação.

```typescript
import { TabelaGlobal, type TabelaConfig } from '@nucleo/tabela-global'
```

**Capacidades incluídas:**
- Filtros configuráveis por campo
- Busca global
- Ordenação por coluna
- Seleção em massa com checkboxes
- Toggle lista/kanban
- Importar CSV e Excel
- Exportar CSV, Excel, JSON e XML
- Editar em massa e excluir selecionados
- Modal genérico de edição

**Quando NÃO usar:**
- Para exibir apenas 1 ou 2 itens — usar cards simples
- Para dados que não têm operações CRUD — usar tabela HTML simples
- Para dados em tempo real que mudam a cada segundo — avaliar outro componente

---

### ModalPassoPassoGlobal

**Quando usar:** qualquer wizard ou fluxo guiado em múltiplos passos dentro de um modal — criação de widget, onboarding de funcionalidade, configuração multi-etapa.

```typescript
import { ModalPassoPassoGlobal, StepperPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
```

**Capacidades:** overlay com backdrop, indicador de passos (Design System § 12), footer com Cancelar/Voltar/Próximo/Salvar, fechamento por Escape e clique fora, animação de entrada, acessibilidade (`role="dialog"`, `aria-current="step"`).

**`StepperPassoPassoGlobal`** — exportado do mesmo pacote. Use quando o wizard é uma **página** (não um modal), como `NovaCotacao`. Renderiza apenas o indicador de passos sem overlay.

```typescript
// Modal com wizard
<ModalPassoPassoGlobal titulo="Novo Widget" aberto={open} passos={PASSOS} passoAtual={step} ...>
  {step === 1 && <Passo1 />}
</ModalPassoPassoGlobal>

// Página com wizard (sem modal)
<StepperPassoPassoGlobal passos={PASSOS} passoAtual={step} />
```

**Quando NÃO usar:**
- Para modais simples sem passos — usar `ModalGlobal`
- Para confirmações — usar `ConfirmarGlobal`

---

### ModalGlobal

**Quando usar:** toda abertura de formulário de criação/edição, visualização de detalhes ou qualquer conteúdo que precisa de foco total do usuário.

```typescript
import { ModalGlobal, type ModalConfig } from '@nucleo/modal-global'
```

**Capacidades incluídas:** header, body e footer padronizados, múltiplas abas, botões padrão, tamanhos configuráveis.

**Quando NÃO usar:**
- Para confirmações simples — usar `ConfirmarGlobal`
- Para alertas sem input — usar toast via `Shell`
- Para conteúdo que cabe inline — não usar modal

---

### ConfirmarGlobal

**Quando usar:** sempre antes de qualquer ação destrutiva — deletar, arquivar, cancelar, resetar.

```typescript
import { ConfirmarGlobal } from '@nucleo/confirmar-global'
```

> **Regra:** toda ação destrutiva tem `ConfirmarGlobal` antes de executar. Nenhuma deleção acontece com um único clique sem confirmação.

**Quando NÃO usar:**
- Para ações reversíveis (salvar, editar) — não precisam de confirmação

---

### CaixaSelectGlobal

**Quando usar:** todo campo de seleção — substituir selects nativos do HTML.

```typescript
import { CaixaSelectGlobal, type SelectConfig } from '@nucleo/caixa-campo-select-global'
```

**Capacidades:** busca interna, múltipla seleção via chips, carregamento assíncrono, validação com Zod.

**Quando NÃO usar:**
- Para menos de 4 opções — usar radio buttons ou toggle
- Para seleção de data — usar componente específico de data

---

### DicaGlobal

**Quando usar:** para explicar termos técnicos, siglas ou campos complexos que não cabem na label.

```typescript
import { DicaGlobal } from '@nucleo/dica-global'
```

---

### api-global

**Quando usar:** para todas as chamadas HTTP para o backend.

```typescript
import { apiClient } from '@nucleo/api-global'
```

> O `apiClient` já gerencia headers de autenticação, correlationID e erros globais automaticamente.

---

### utilitarios-global

**Quando usar:** toda formatação de dados — CPF, CNPJ, moeda, datas, máscaras.

```typescript
import { formatarCNPJ, formatarMoeda, formatarData } from '@nucleo/utilitarios-global'
```

**Quando NÃO usar:** nunca criar formatadores próprios para CPF, CNPJ ou moeda. Se precisar de um formatador que não existe → solicitar ao agente 1A.

---

### Shell

**Quando usar:** layout geral, navegação, notificações toast, comunicação entre módulos.

```typescript
import { Shell } from '@nucleo/shell'
import { useShellStore } from '@nucleo/shell'
import { emit, on } from '@nucleo/shell'
```

**Disparar notificação:**
```typescript
const { addNotification } = useShellStore()
addNotification({ type: 'success', message: 'Simulação salva com sucesso' })
addNotification({ type: 'error',   message: 'Erro ao salvar simulação' })
addNotification({ type: 'warning', message: 'Atenção: dados incompletos' })
```

**Comunicar entre módulos:**
```typescript
emit('venda-concluida', { id: 123 })
on('venda-concluida', (dados) => { ... })
```

**Quando NÃO usar o event bus:**
- Para estado persistente — usar a store do produto
- Para dados do servidor — usar query
- Para comunicação entre componentes do mesmo módulo — usar props ou context local

---

## Serviços de Organização

### atividades
**Usar quando:** exibir, criar ou gerenciar tarefas e atividades do usuário.
```typescript
// Declarar no PRODUCT_CONFIG
tenantServices: ['activities']
navigation: [{ id: 'activities', label: 'Atividades', icon: 'check-circle', source: 'organizacao' }]
// O shell carrega automaticamente via lazy loading
```
**NÃO usar** para checklists internos de formulário ou steps de wizard.

---

### email
**Usar quando:** inbox da empresa, envio de emails, monitoramento de status.
**NÃO usar** para notificações rápidas internas.

### whatsapp
**Usar quando:** conversas com contatos via WhatsApp Business.
**NÃO usar** para notificações push internas.

### dashboard
**Usar quando:** KPIs consolidados e métricas de múltiplos produtos.
**NÃO usar** para métricas específicas de uma tela — criar card local.

### cronometro
**Usar quando:** registrar tempo gasto por usuário em uma atividade.
**NÃO usar** para contagem regressiva — usar lógica local com Date.

### relatorios
**Usar quando:** relatórios complexos, cruzamento de dados de múltiplos produtos.
**NÃO usar** para exports simples — usar `TabelaGlobal`.

### historico
**Usar quando:** auditoria — quem fez o quê e quando. **Obrigatório** para conformidade financeira/fiscal.
**NÃO usar** para logs técnicos — usar Sentry.

### agendamento
**Usar quando:** calendário de eventos, lembretes e agendamentos.
**NÃO usar** para datepickers em formulários.

### gabi
**Usar quando:** chat inteligente com IA com contexto completo da organização.

---

## Serviço de Produto

### helpdesk
**Usar quando:** suporte com tickets e SLA configurável por produto.

---

## Tokens Centralizados

**Quando usar:** em todo entry point da aplicação para injetar as variáveis CSS globais.

```typescript
import '@nucleo/tokens'
```

Fornece todas as variáveis CSS do design system: cores, espaçamento, tipografia, raios, sombras. Inclui aliases de compatibilidade para variáveis `--ws-*` e `--color-*` legadas.

---

## Composição — Primitivos de Layout

### StackGlobal
**Quando usar:** empilhar elementos verticalmente com espaçamento consistente.

```typescript
import { StackGlobal } from '@nucleo/composicao'
```

**Quando NÃO usar:** para layout horizontal — usar FlexGlobal.

### FlexGlobal
**Quando usar:** layout horizontal com alinhamento e distribuição.

```typescript
import { FlexGlobal } from '@nucleo/composicao'
```

**Quando NÃO usar:** para empilhar vertical — usar StackGlobal.

### GridGlobal
**Quando usar:** grid de cards, formulários em colunas, layouts responsivos.

```typescript
import { GridGlobal } from '@nucleo/composicao'
```

Dois modos: fixo (`colunas={3}`) ou responsivo (`colunas="auto"` com `larguraMin`).

### SecaoGlobal
**Quando usar:** agrupar conteúdo com título, subtítulo e ações opcionais.

```typescript
import { SecaoGlobal } from '@nucleo/composicao'
```

Ideal para dividir formulários e dashboards em blocos visuais. Prop `card` adiciona background surface.

---

## Templates — Páginas Prontas

### PaginaTabelaGlobal
**Quando usar:** toda página de listagem com tabela CRUD.

```typescript
import { PaginaTabelaGlobal } from '@nucleo/templates'
```

Compõe automaticamente: CabecalhoGlobal + Stats + Toolbar + TabelaGlobal. Passa as props da tabela diretamente via prop `tabela`.

### PaginaFormularioGlobal
**Quando usar:** toda página de criação/edição com formulário.

```typescript
import { PaginaFormularioGlobal } from '@nucleo/templates'
```

Compõe automaticamente: CabecalhoGlobal + conteúdo centralizado + barra cancelar/salvar. Combine com SecaoGlobal + GridGlobal para organizar campos.

### PaginaDashboardGlobal
**Quando usar:** toda página de dashboard com KPIs e gráficos.

```typescript
import { PaginaDashboardGlobal } from '@nucleo/templates'
```

Compõe automaticamente: CabecalhoGlobal + grid de KPIs + conteúdo flexível.

---

## HubButton — Botão de Navegação para o Hub

**Arquivo:** `servicos-global/configurador/src/components/HubButton.tsx`

**Quando usar:** SEMPRE que um layout do configurador (Core, Workspace, Admin ou qualquer nova rota) precisar de um botão que leva o usuário de volta ao Hub.

```typescript
import { HubButton } from '../../components/HubButton'

// Uso básico
<HubButton onClick={() => navigate('/hub')} />

// Com escape hatch (Core — força seleção de workspace mesmo com preferido)
<HubButton onClick={() => navigate('/hub?select=1')} tooltip={t('shell.voltar_hub')} />
```

### Regra Inviolável — Ícone do Hub

> **O botão Hub SEMPRE usa o ícone `Graph` do `@phosphor-icons/react`.**
> NUNCA use `ArrowLeft`, `ArrowBack`, `CaretLeft` ou qualquer ícone de seta/voltar neste botão.
> O ícone representa "rede/cluster/hub", não "navegação de volta".

**Por que:** o ícone `ArrowLeft` causou regressões repetidas (confusão visual entre "voltar" e "ir ao Hub"). O `HubButton` é a única fonte de verdade — qualquer mudança de ícone deve ser feita apenas neste arquivo.

**Para o `shell/Header.tsx`** (pacote separado, não pode importar `HubButton`): usar `<Graph size={16} weight="bold" />` diretamente.

---

## Quando Criar um Componente Novo

Só criar componente novo se:
1. Não existe nenhum componente acima que atenda a necessidade
2. O Líder autorizou a criação
3. O componente passa no teste das 3 perguntas do `antigravity-nucleo-global`

> Se o novo componente for reutilizável em outros produtos → vai para `nucleo-global`. Se for específico de um produto → vai em `produtos/[produto]/src/` como componente local.
