# Nova Tela de Produto — Regras de Negócio e Funcionalidade

> Define o comportamento esperado de cada elemento da tela padrão de produto Gravity do ponto de vista do usuário e do negócio.

---

## 1. Identidade Visual do Produto

### O que o usuário vê
- Sidebar com a **cor única do produto** aplicada no nome, ícone ativo e destaques
- Logo exclusivo do produto no canto superior esquerdo da sidebar
- Nome do produto visível abaixo do logo ("by Gravity")

### Regra de negócio
- Cada produto tem **uma única cor** — definida uma vez e nunca sobrescrita por CSS local
- A cor é aplicada automaticamente em **todo o layout** sem configuração adicional por tela
- Se um produto não tiver cor definida, o sistema exibe a cor padrão Gravity (#818cf8) — nunca quebra

---

## 2. Menu Lateral (Sidebar)

### O que o usuário vê
- Lista de navegação com ícones e labels das views do produto
- Botão de colapsar que reduz a sidebar a apenas ícones
- Empresa do usuário e plano no topo da sidebar

### Regras de negócio
- Itens de navegação são **definidos por produto** — cada produto escolhe suas próprias views
- A sidebar pode ser colapsada pelo usuário — preferência persiste na sessão
- Quando colapsada, apenas ícones são exibidos — labels ficam em tooltip
- **Itens marcados "Em breve"** ficam visíveis mas desabilitados — comunicam roadmap sem criar expectativa falsa

---

## 3. Menu Superior (Topo)

### O que o usuário vê
- Título da view atual (ex: "Dashboard", "Lista", "Configurações")
- Quando sidebar colapsada: título muda para o nome do produto
- Ícones de: busca, informações, localizador, notificações
- Botões Hub e Core para navegação do ecossistema
- Avatar do usuário com menu de perfil

### Regras de negócio
- **Título da view:** sempre a primeira letra maiúscula. Reflete exatamente onde o usuário está
- **Título colapsado:** exibe o nome do produto — ajuda o usuário a saber em qual produto está
- O título **nunca exibe o nome do produto e da view ao mesmo tempo** — são estados mutuamente exclusivos
- Tooltips do menu topo podem ser desabilitados pelo usuário — preferência salva globalmente
- Hub e Core sempre levam para o ecossistema — nunca para dentro do produto

---

## 4. Localizador do Ecossistema

### O que o usuário vê
- Indicador de onde está no ecossistema Gravity (workspace → produto → página)
- Histórico de navegação recente entre produtos e páginas
- Mapa visual dos produtos acessíveis

### Regras de negócio
- Histórico é mantido por **sessão** — não persiste entre abas ou logins
- Máximo de 10 entradas no histórico — mais antigas são descartadas
- Produto atual sempre marcado como "current" — não pode ser clicado novamente
- Produtos não acessíveis ao plano do usuário aparecem como "locked"

---

## 5. Dashboard — Cards de KPI

### O que o usuário vê
- Faixa horizontal de cards com métricas do produto
- Cada card exibe: título, valor principal, subtexto e tooltip com detalhamento
- Cards respondem a hover com elevação sutil
- Quando há muitos cards, a faixa rola horizontalmente sem barra visível

### Regras de negócio
- **Só cards visíveis são exibidos** — usuário controla quais ver em Configurações
- **Ordem dos cards** é a ordem definida pelo usuário em Configurações
- Cards com valor zero devem exibir `0` ou `—` (BRL) — nunca valor vazio ou erro
- **Tooltip é obrigatório** para cards com valores financeiros — detalha a composição
- O subtexto contextualiza o valor principal (ex: "75% do total", "Média BRL por registro")
- Cards não são clicáveis na versão atual — são informativos

---

## 6. Configurações — Período de Comparação

### O que o usuário vê
- Pills de seleção: 7 dias / 30 dias / 6 meses / 1 ano / Tudo
- Pill ativo destacado com a cor do produto
- Descrição explicando o que o período afeta

### Regras de negócio
- **Padrão:** 30 dias — aplicado na primeira vez que o usuário acessa
- Seleção persiste no localStorage com chave única do produto — sobrevive ao refresh
- O período selecionado afeta os **badges de tendência** dos cards (ex: +12% vs período anterior)
- Período não afeta o valor absoluto do card — apenas a comparação/tendência
- Um e apenas um período pode estar ativo por vez

---

## 7. Configurações — Meus Cards

### O que o usuário vê
- Lista dos cards ativos, na ordem que aparecem no Dashboard
- Handle de arrastar (⠿) para reordenar
- Ícone de olho para mostrar/ocultar sem remover
- Botão × para remover da lista
- Botão "Restaurar padrão" que volta para os 4 cards iniciais

### Regras de negócio
- **Reordenação:** arrastar e soltar — nova ordem salva imediatamente, sem botão de salvar
- **Ocultar:** o card deixa de aparecer no Dashboard mas permanece na lista de Meus Cards
  - Card oculto: visual esmaecido na lista de configuração
  - Card oculto: ícone de olho fechado
- **Remover:** o card vai para "Métricas disponíveis" — pode ser readicionado
- **Restaurar padrão:** retorna os 4 cards padrão do produto, visíveis, na ordem original
  - Cards removidos pelo usuário voltam a aparecer em "Métricas disponíveis"
- Mudanças sincronizam em tempo real entre abas do mesmo produto (via CustomEvent)
- Mínimo de cards: zero — usuário pode remover todos
- Máximo de cards: todos do catálogo

---

## 8. Configurações — Métricas Disponíveis

### O que o usuário vê
- Lista de métricas ainda não adicionadas pelo usuário
- Cada item exibe: ícone colorido, nome, descrição, tipo de agregação e botão +
- Seção só aparece quando há ao menos uma métrica não adicionada

### Regras de negócio
- Uma métrica **ou está em Meus Cards ou está em Métricas Disponíveis** — nunca nos dois
- Clicar em + adiciona o card ao **final** da lista de Meus Cards, visível
- O tipo de agregação (Contagem / Soma / Média) é informativo — define como o valor é calculado
- Seção desaparece completamente quando o usuário adiciona todas as métricas

---

## 9. Temas

### O que o usuário vê
- Botão de alternância de tema no menu do usuário (topo direito)
- Toda a interface muda instantaneamente entre dark e light

### Regras de negócio
- Padrão: tema escuro (dark)
- Preferência salva globalmente — afeta todos os produtos do workspace
- A cor do produto não muda com o tema — é sempre a cor de destaque definida
- Tooltips, bordas, fundos e textos seguem as variáveis CSS `[data-theme]`

---

## 10. Comportamento de Erros e Estados Vazios

| Situação | O que exibir |
|---|---|
| API de KPIs indisponível | Cards com valor `0` — nunca tela de erro |
| Nenhum card adicionado | Mensagem: "Nenhum card adicionado. Escolha no catálogo abaixo." |
| Todas as métricas adicionadas | Seção "Métricas disponíveis" some completamente |
| Produto sem dados | Cards com `0` ou `—` para valores monetários |
| Rota desconhecida | Redireciona para Dashboard silenciosamente |

---

## 11. Navegação Entre Views

### Regras de negócio
- Cada produto define suas próprias views — não há lista fixa obrigatória
- Views mínimas recomendadas: Dashboard, Lista, Configurações
- Views opcionais: Kanban, Histórico, Relatórios, Importar
- A view ativa é sempre destacada no menu lateral
- A URL reflete a view atual — o usuário pode compartilhar links diretos
- O botão voltar do browser funciona normalmente — navegação não usa modais para troca de view

---

## 12. Persistência de Estado

| Estado | Onde salva | Escopo |
|---|---|---|
| Cards ativos e ordem | `localStorage` chave `X:cards-v1` | Permanente por dispositivo |
| Período de comparação | `localStorage` chave `X:periodo-comparacao` | Permanente por dispositivo |
| Histórico de navegação | `sessionStorage` | Só durante a sessão |
| Sidebar colapsada | Memória (estado React) | Só durante a sessão |
| Tema dark/light | Shell global | Global, todos os produtos |
| Tooltips ativados | Shell global | Global, todos os produtos |

---

## 13. Acessibilidade

- Todos os botões têm `aria-label` descritivo
- Drag handle tem `aria-label="Arrastar para reordenar"`
- Ícone de olho tem `aria-label` dinâmico: "Ocultar card" / "Exibir card"
- Navegação por teclado funciona em toda a interface
- Contraste de texto respeita WCAG 2.1 AA em dark e light
