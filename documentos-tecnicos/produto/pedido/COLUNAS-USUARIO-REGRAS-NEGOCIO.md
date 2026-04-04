# Colunas do Usuário — Regras de Negócio

> **Produto:** Pedido (COMEX)
> **Versão:** 1.0
> **Data:** Abril 2026

---

## O que é
Permite que o usuário crie campos customizados para enriquecer pedidos e itens sem necessidade de desenvolvimento. Uma coluna criada pode aparecer no pedido, no item, ou em ambos.

---

## Tipos de Coluna

| Tipo | Descrição | Exemplo |
|---|---|---|
| **Texto** | Campo de texto livre | Referência interna, Observação |
| **Número** | Valor numérico | Taxa, Código numérico |
| **Data** | Data (sem hora) | Data de vencimento, Prazo |
| **Select** | Lista de opções configurável | Prioridade: Alta/Média/Baixa |
| **Checkbox** | Verdadeiro / Falso | Aprovado, Revisado |
| **Percentual (%)** | Número formatado como percentual | Margem, Desconto |
| **Tipo de Documento** | Lista de tipos pré-definidos (Invoice, BL, Packing List, etc.) | Tipo de doc vinculado |

---

## Escopo da Coluna

Ao criar uma coluna, o usuário escolhe onde ela aparece:

| Opção | Aparece em |
|---|---|
| **Pedido** | Só no cabeçalho do pedido |
| **Item** | Só nos itens do pedido |
| **Ambos** | No cabeçalho e nos itens |

---

## Visibilidade

Ao criar uma coluna, o usuário configura quem pode vê-la:

| Opção | Descrição |
|---|---|
| **Todos do tenant** | Visível para todos os usuários da empresa |
| **Por perfil/role** | Só usuários com determinado perfil veem |
| **Só eu** | Coluna privada — só o criador vê |

---

## Propriedades de uma Coluna

| Propriedade | Tipo | Obrigatório |
|---|---|---|
| `nome` | Texto | Sim |
| `tipo` | Enum (ver tipos acima) | Sim |
| `escopo` | `pedido` / `item` / `ambos` | Sim |
| `visibilidade` | `todos` / `roles` / `privado` | Sim |
| `roles_permitidas` | string[] | Se visibilidade = `roles` |
| `obrigatorio` | boolean | Não (default: false) |
| `opcoes` | string[] | Só para tipo `select` |
| `descricao` | Texto | Não |
| `valor_padrao` | Variado | Não |

---

## Comportamento nas Features Existentes

| Feature | Comportamento |
|---|---|
| **Tabela (lista de pedidos)** | Colunas do usuário aparecem no seletor de colunas e podem ser exibidas/ocultadas |
| **Drawer (criar/editar)** | Colunas do usuário aparecem como campos adicionais no formulário |
| **Edição em Massa** | Colunas do usuário aparecem na lista de campos editáveis |
| **Smart Import** | Colunas do usuário são incluídas no mapeamento de colunas |
| **Exportação Excel** | Colunas do usuário são incluídas na exportação |
| **Gerar PDF** | Disponíveis como variáveis `{{coluna_nome}}` no template |
| **Filtros** | Colunas do usuário aparecem nos filtros disponíveis |
| **Duplicar** | Valores das colunas do usuário são copiados junto com o pedido |

---

## Gerenciamento

- Colunas são criadas/editadas/excluídas em **Configurações do Produto** (tela de settings do pedido)
- Excluir uma coluna: dados existentes são **preservados** mas a coluna some da interface
- Reativar uma coluna: dados voltam a aparecer
- Ordenação das colunas: drag-and-drop na tela de configurações

---

## Regras Transversais

| Regra | Valor |
|---|---|
| Máximo de colunas por tenant | 50 |
| Nome único por tenant | Sim |
| Tipo não pode ser alterado após criação | Sim (para não corromper dados existentes) |
| Escopo pode ser alterado | Sim |
