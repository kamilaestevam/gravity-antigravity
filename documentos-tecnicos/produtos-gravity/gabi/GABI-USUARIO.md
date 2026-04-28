# GABI — Guia do Usuário: Assistente de Campos

> **Para quem é este guia:** usuários que utilizam qualquer campo com o ícone ✦ nos produtos Gravity.

---

## O que é a GABI

A GABI é uma assistente integrada disponível em campos selecionados de todos os produtos Gravity. Ela fica em silêncio até você precisar: clique no ícone `✦` ao lado do label de um campo para receber uma explicação contextual, exemplos e orientações de negócio.

Cada consulta consome **tokens** da sua quota mensal. O badge `✦ X / Y tokens` no topo da tela mostra quanto você já usou.

> **Fórmulas:** a análise de sintaxe e erros semânticos de fórmulas (card colorido abaixo do campo de expressão) é gratuita e não consome tokens — funciona de forma automática.

---

## Como usar a GABI

1. Localize o ícone `✦` ao lado do label de um campo
2. Clique no ícone — o popover abre imediatamente com a resposta carregando
3. Leia a explicação contextual da GABI
4. Feche o popover com `[×]` ou clicando fora

**Se o ícone estiver acinzentado:** sua quota de tokens do mês foi esgotada. Se você tiver permissão, verá a opção de adquirir tokens adicionais. Caso contrário, contate o administrador.

---

## Badge de tokens

O badge `✦ X / Y tokens` no topo da tela mostra seu consumo mensal em tempo real.

| Cor do badge | Significado |
|---|---|
| Verde | 0–69% da quota usada |
| Amarelo | 70–89% — use com moderação |
| Laranja | 90–99% — quase no limite |
| Vermelho | 100% — quota esgotada |

---

## Análise automática de fórmulas (gratuita, sem tokens)

Ao criar uma coluna do tipo **Fórmula** em Configurações, o card colorido abaixo do campo de expressão funciona de forma automática e **não consome tokens**:

| Cor do card | Significado | O que fazer |
|-----|-------------|-------------|
| **Roxo** | Campo vazio — instruções iniciais | Comece digitando ou clique em um chip de campo |
| **Amarelo** | Aviso semântico — fórmula válida mas suspeita | Leia a sugestão e decida se aplica |
| **Vermelho** | Erro — fórmula inválida | Corrija antes de salvar |
| **Verde** | Tudo certo — fórmula válida | Preencha os demais campos e salve |

> Durante a digitação o card some — é normal. Ele reaparece 0,6 segundos após você parar de digitar.

---

## Campos disponíveis

Clique nos chips abaixo do label "Quantidades" ou "Financeiro" para inserir um campo. Isso evita erros de digitação.

### Quantidades

| Campo | O que representa |
|-------|-----------------|
| Quantidade Inicial | Total de itens no pedido quando foi criado |
| Quantidade Cancelada | Itens cancelados (parcela da Quantidade Inicial) |
| Quantidade Transferida | Itens transferidos para outro pedido (parcela da Quantidade Inicial) |
| Quantidade Pronta | Itens com produção concluída (parcela da Quantidade Inicial) |
| Saldo | Quantidade disponível — calculado automaticamente |

### Financeiro

| Campo | O que representa |
|-------|-----------------|
| Valor Total | Soma financeira total do pedido |
| Peso Líquido | Peso sem embalagem (em kg) |
| Peso Bruto | Peso com embalagem (em kg) |
| Cubagem | Volume total (em m³) |

---

## Operadores disponíveis

| Operador | Exemplo | Resultado |
|----------|---------|-----------|
| `+` | `peso_liquido_total_pedido + peso_bruto_total_pedido` | Soma |
| `-` | `quantidade_total_inicial_pedido - quantidade_cancelada_total_pedido` | Subtração |
| `*` | `quantidade_total_inicial_pedido * 0.15` | Multiplicação |
| `/` | `valor_total / quantidade_total_inicial_pedido` | Divisão |
| `( )` | `(a + b) * c` | Prioridade de cálculo |

---

## A função SE() — divisão segura

Se você dividir por um campo que pode ser zero, a fórmula vai gerar erro em pedidos onde esse campo for zero. Use `SE()` para proteger:

```
SE(denominador == 0, 0, numerador / denominador)
```

**Exemplo prático — preço médio por unidade:**
```
SE(quantidade_total_inicial_pedido == 0, 0, valor_total / quantidade_total_inicial_pedido)
```

> Se a quantidade for zero, o resultado é 0. Caso contrário, calcula o preço unitário.

---

## A função SOMA_ITENS()

Soma o valor de um campo em todos os itens do pedido.

```
SOMA_ITENS(quantidade_total_inicial_pedido)
```

---

## Avisos mais comuns da GABI

### "Parcela somada ao seu total"

**O que aconteceu:** você somou uma parte com o todo. Por exemplo, `Quantidade Cancelada + Quantidade Inicial` — como a cancelada já está dentro da inicial, você estaria contando duas vezes.

**Sugestão da GABI:** `quantidade_total_inicial_pedido - quantidade_cancelada_total_pedido`

Use o botão **Usar** para aplicar a correção automaticamente.

---

### "Campo somado com ele mesmo"

**O que aconteceu:** `valor_total + valor_total` é equivalente a `valor_total * 2`.

**Sugestão da GABI:** `valor_total * 2`

---

### "Divisão sem proteção"

**O que aconteceu:** você dividiu por um campo que pode ser zero em algum pedido.

**Sugestão da GABI:** `SE(denominador == 0, 0, numerador / denominador)`

---

### "Unidades incompatíveis"

**O que aconteceu:** você somou ou subtraiu grandezas diferentes, como quantidade com valor financeiro. Isso raramente faz sentido de negócio.

Revise se os campos são realmente o que você quer combinar.

---

### "Campo não reconhecido"

**O que aconteceu:** um dos nomes digitados não corresponde a nenhum campo disponível — provavelmente um erro de digitação ou um campo cortado.

**O que fazer:** apague o trecho problemático e use os chips acima para inserir o campo correto.

---

### "Falta um operador"

**O que aconteceu:** dois campos estão lado a lado sem operador entre eles, como `valor_total peso_liquido_total_pedido`.

**Sugestão da GABI:** `valor_total + peso_liquido_total_pedido`

Use o botão **Usar** ou escolha o operador que faz sentido para o seu caso.

---

## Exemplos de fórmulas prontas

### Percentual cancelado
```
SE(quantidade_total_inicial_pedido == 0, 0, quantidade_cancelada_total_pedido / quantidade_total_inicial_pedido)
```
> Mostra a proporção do pedido que foi cancelada. Retorna 0 se a quantidade inicial for zero.

### Saldo disponível
```
quantidade_total_inicial_pedido - quantidade_cancelada_total_pedido - quantidade_transferida_total
```
> Quanto ainda está disponível (exclui cancelados e transferidos).

### Peso médio por unidade
```
SE(quantidade_total_inicial_pedido == 0, 0, peso_bruto_total_pedido / quantidade_total_inicial_pedido)
```

### Margem sobre o valor (ex: 15%)
```
valor_total * 0.15
```

### Cubagem por unidade
```
SE(quantidade_total_inicial_pedido == 0, 0, cubagem_total_pedido / quantidade_total_inicial_pedido)
```

---

## Dicas rápidas

- **Clique nos chips** em vez de digitar — evita erros de nome de campo
- O botão **Usar** aplica a sugestão da GABI com um clique
- A fórmula só é salva quando você clicar em **Salvar coluna** — experimente sem medo
- Campos de texto, data e checkbox valem **0** em operações matemáticas
- A GABI analisa de novo sempre que você parar de digitar por 0,6 segundos
