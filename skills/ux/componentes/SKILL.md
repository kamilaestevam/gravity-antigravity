---
name: antigravity-componentes
description: "Use esta skill sempre que um agente precisar decidir qual componente global usar em uma situação específica. É um catálogo de decisão: dada uma necessidade de interface ou funcionalidade, aponta qual componente do nucleo-global ou serviço de organização usar, como importar e quando NÃO usar cada um. Não documenta implementação detalhada — para isso consultar antigravity-nucleo-global ou antigravity-servicos-plataforma."
---

# Gravity — Catálogo de Componentes

## Como Usar Este Catálogo

Antes de criar qualquer componente novo, consultar este catálogo. Se a necessidade já existe aqui → usar o componente existente. Se não existe → verificar com o Líder antes de criar algo novo.

> **Regra:** nunca criar um componente que já existe no `nucleo-global` ou nos serviços de organização. Duplicação é proibida.

> ⚠️ **REGRA ABSOLUTA:** Ver [`skills/governanca/lei/agent-policy/SKILL.md`](../../governanca/lei/agent-policy/SKILL.md) — seção **Componentes compartilhados (`nucleo-global`)**. Alterar `TabelaVirtualGlobal`, `TabelaGlobal` ou qualquer export do núcleo **sem autorização explícita do dono** é proibido. Preferir props/callbacks já existentes no produto vertical (ex.: `renderConectorPai` no BID Frete).

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
| Formulário modal com abas pill (2+ seções) | **ModalFormularioAbasGlobal** |
| Lista de e-mails/telefones/WhatsApp com chips | **ListaValoresContatoGlobal** |
| Confirmação antes de ação destrutiva | **ConfirmarGlobal** |
| Select com busca e múltipla seleção | **CaixaSelectGlobal** |
| Tooltip ou dica contextual | **DicaGlobal** |
| Chamada HTTP para API | `apiClient` de **api-global** |
| Formatar CPF, CNPJ, moeda, data | **utilitarios-global** |
| Botão de retorno ao Hub no header de qualquer layout | **HubButton** (ver seção abaixo) |
| Atalho Gravity University no header global (capelo) | **MenuTopoGlobal** / layouts `ws-global-actions` / `Header` shell (ver seção abaixo) |
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
| Card de campo em painel (editável / leitura / bloqueado) | **CampoDadoGlobal** |

---

## Componentes do nucleo-global

### CampoDadoGlobal

**Quando usar:** painéis de detalhe, abas “Dados gerais” ou seções estilo Processo › Dados Técnicos — um rótulo + valor (ou controle customizado) com **modo explícito** para o usuário.

```typescript
import { CampoDadoGlobal } from '@nucleo/campo-dado-global'
```

**Modos (`modo`):**
- `somente_leitura` — badge “Somente leitura” (ícone olho); datas e metadados fixos
- `editavel` — badge “Editável” (ícone lápis); hover com destaque; use `children` para popover/input
- `bloqueado` — badge “Bloqueado” (ícone cadeado); `motivo` obrigatório quando a regra de negócio impede edição

**Barra lateral:** `statusPreenchimento` — `preenchido` | `vazio-opc` | `vazio-obrig` (verde / cinza / amarelo).

**i18n:** `comum.campo_modo_editavel`, `comum.campo_modo_somente_leitura`, `comum.campo_modo_bloqueado`.

**Referência de uso:** BID › Cotação › Dados gerais (`painel-dados-gerais-cotacao-bid-frete-internacional.tsx`).

**Quando NÃO usar:** formulários de cadastro em fluxo wizard — usar inputs do design system; listagens — usar **TabelaGlobal**.

---

### TabelaGlobal

**Quando usar:** toda tela que exibe uma lista de registros com filtros, busca, paginação, ordenação, seleção em massa ou exportação.

```typescript
import { TabelaGlobal, type TabelaConfig } from '@nucleo/tabela-global'
```

**Props obrigatórias** (TypeScript bloqueia build se faltar):
- `dados: T[]` — array de itens
- `colunas: TabelaGlobalColuna<T>[]` — definição das colunas
- `idKey: keyof T & string` — campo único da linha (ex: `'id_workspace'`, `'codigo_ncm'`)

> ⚠️ Sem `idKey`, a seleção em massa marca **todas** as linhas ao clicar **uma**. Bug histórico corrigido em 2026-05-06 — agora compile-time error. Sempre passe o campo identificador real do tipo.

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

**Modais empilhados (wizard + confirmação):** `ModalPassoPassoGlobal` usa `Z_INDEX_MODAL_PASSO_PASSO` (9999). Confirmações cascateadas via `ModalOverlay` devem passar `zIndex` **acima** desse valor (ex.: `Z_INDEX_MODAL_PASSO_PASSO + 51` no Novo Pedido).

---

### ModalGlobal

**Quando usar:** toda abertura de formulário de criação/edição, visualização de detalhes ou qualquer conteúdo que precisa de foco total do usuário.

```typescript
import { ModalGlobal, type ModalConfig } from '@nucleo/modal-global'
```

**Capacidades incluídas:** header, body e footer padronizados, múltiplas abas, botões padrão, tamanhos configuráveis.

**Prop `zIndex` (opt-in):** sobrescreve o default CSS (`1000`) quando o modal abre **sobre** outro overlay (ex.: wizard em `Z_INDEX_MODAL_PASSO_PASSO`).

**Quando NÃO usar:**
- Para confirmações simples — usar `ConfirmarGlobal`
- Para alertas sem input — usar toast via `Shell`
- Para conteúdo que cabe inline — não usar modal

---

### ModalFormularioAbasGlobal

**Quando usar:** formulários de criação/edição com **2 ou mais seções** em abas pill (ex.: Configurador › Fornecedores — Dados Gerais | Contatos).

```typescript
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
```

**Espaçamento (2026-06):** 24px entre linha divisória do cabeçalho e abas; 24px entre abas e primeiro campo (`modal.css` + `ModalFormularioAbas.tsx`). Evitar padding extra em `.cg-header` no workspace do Configurador.

**Quando NÃO usar:**
- Formulário de uma única seção — `ModalFormularioGlobal`
- Wizard multi-passo — `ModalPassoPassoGlobal`

**Referência:** `servicos-global/configurador/src/pages/configurador/ModalEditarFornecedor.tsx`

---

### ListaValoresContatoGlobal

**Quando usar:** campos com **múltiplos valores** do mesmo canal (e-mails, telefones E.164, WhatsApp E.164) — entrada + chip removível.

```typescript
import { ListaValoresContatoGlobal } from '@nucleo/lista-valores-contato-global'
```

**Contrato típico:** arrays `emails` / `telefones` / `whatsapps` no estado do formulário → `montarContatosFornecedorPayload` (Cadastros Zod) no submit.

**Quando NÃO usar:**
- Valor único obrigatório sem lista — input simples ou `CaixaSelectGlobal`
- Contatos que não são canal de comunicação — outro componente de lista

**Referência:** aba *Contatos do Fornecedor* em `ModalEditarFornecedor.tsx`

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

### CampoGeralGlobal

**Quando usar:** wrapper canônico para **qualquer campo de formulário** (input, select, textarea, calendário). Gerencia label, asterisco de obrigatoriedade, borda vermelha de erro/vazio e mensagem de erro inline em uma única abstração.

```typescript
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'

<CampoGeralGlobal
  label="Número do Pedido"
  obrigatorio                            // adiciona asterisco vermelho no label
  vazio={!form.numero_pedido.trim()}     // dispara borda vermelha quando obrigatorio && vazio
  erro={erros.numero_pedido}             // mensagem de erro pós-validação (opcional)
>
  <input value={form.numero_pedido} onChange={onChange} />
</CampoGeralGlobal>
```

**Path:** `nucleo-global/Campos/campo-geral-global/`

**Regra oficial — "obrigatorio + vazio = vermelho":**
- `obrigatorio={true}` + `vazio={true}` ⇒ asterisco vermelho no label + borda vermelha no campo filho
- `erro="..."` ⇒ borda vermelha + mensagem abaixo do campo (2ª camada — validação pós-submit)
- Sem nenhum dos dois ⇒ aparência neutra

**Como funciona internamente:**
- Adiciona a classe `cg-wrapper--erro` quando há erro/vazio
- CSS canônico (`campo-geral.css`) aplica `border-color: #f87171 !important` em qualquer `<input>`, `<select>`, `<textarea>` ou `.sg-campo` (SelectGlobal) filho
- O `!important` é obrigatório — sobrescreve `border` inline aplicado por `style={...}` em muitos consumidores

**Acessibilidade:**
- Asterisco visual + `aria-invalid` setado quando vazio/erro (use `aria-invalid={...}` no input filho pra ativar)
- Mensagem de erro com `role="alert"` pra screen readers

**Padrão composto com BannerRequisitosGlobal:** para forms com múltiplos campos obrigatórios, combine `CampoGeralGlobal` em cada campo com `BannerRequisitosGlobal` consolidando as pendências em um só bloco antes do botão de submeter. Ver `nucleo-global/Feedback/banner-requisitos-global/`.

**Quando NÃO usar:**
- Para layout especial onde o label precisa conviver com botão inline (ex: "+ Cadastrar nova"). Nesse caso renderize seu wrapper custom e adicione manualmente `className="cg-wrapper cg-wrapper--erro"` para reaproveitar a CSS canônica + renderize o asterisco vermelho separadamente. Não invente outline próprio.

**Referência completa do padrão de campo obrigatório:** ver `skills/ux/design-system/SKILL.md` seção "Padrão de Campo Obrigatório (3 sinais oficiais)".

**Hints abaixo de campos — 3 tiers oficiais:** ver `skills/ux/design-system/SKILL.md` seção "Hints e Dicas Abaixo de Campos". Tier 1 = hint puro (prop `hint`), Tier 2 = dica contextual com ícone Info (render fora do componente), Tier 3 = badge de status (custom). Documento técnico completo: `documentos-tecnicos/ux/design-system/hints-e-dicas.md`.

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

## Atalho Gravity University — ícone no header global

**SSOT:** `MenuTopoGlobal` (`nucleo-global/Layout/menu-topo-global`) para produtos via `TelaProdutoGlobal`; `servicos-global/shell/Header.tsx` para serviços tenant; blocos `ws-global-actions` no Configurador (Core, Workspace, Admin, University) e `TopbarPaginaGravity` / Hub quando aplicável.

**Quando usar:** o atalho **sempre** visível em telas autenticadas — não implementar só no Hub.

```typescript
// Padrão (produto — já embutido no MenuTopoGlobal)
// Navegação: window.location.href = '/university-gravity'

// Configurador (ws-global-actions / TopbarPaginaGravity)
<button
  className="ws-global-btn"
  type="button"
  title={t('university.modulo_nome', 'Gravity University')}
  aria-label={t('university.modulo_nome', 'Gravity University')}
  onClick={() => navigate('/university-gravity')}
>
  <GraduationCap size={20} weight="duotone" />
</button>
```

### Regra — ordem no header

Ordem canônica à direita: **busca → University (`GraduationCap`) → notificações → dicas → localizador → idioma → usuário** (Hub/Config podem ter atalhos extras antes ou depois, mas University fica logo após busca).

### Regra — ícone University

> **Sempre `GraduationCap` com `weight="duotone"`** e label i18n `university.modulo_nome`. Não usar outro ícone para o mesmo atalho.

---

## Quando Criar um Componente Novo

Só criar componente novo se:
1. Não existe nenhum componente acima que atenda a necessidade
2. O Líder autorizou a criação
3. O componente passa no teste das 3 perguntas do `antigravity-nucleo-global`

> Se o novo componente for reutilizável em outros produtos → vai para `nucleo-global`. Se for específico de um produto → vai em `produtos/[produto]/src/` como componente local.
