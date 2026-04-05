# GABI — Guia do Usuário: Assistente de Fórmulas

> **Para quem é este guia:** usuários que criam colunas personalizadas do tipo Fórmula em Configurações → Colunas.

---

## O que é a GABI

A GABI é uma assistente integrada que aparece automaticamente quando você cria uma coluna do tipo **Fórmula**. Ela analisa em tempo real o que você está digitando e oferece orientações, alertas e sugestões de correção — sem que você precise pedir.

---

## Como acessar

1. Acesse **Configurações** no menu lateral
2. Clique na aba **Colunas**
3. Role até **Colunas Personalizadas**
4. Selecione o tipo **Fórmula** no campo Tipo
5. A GABI aparece automaticamente na área de Expressão

---

## O que cada cor do card significa

| Cor | Significado | O que fazer |
|-----|-------------|-------------|
| **Roxo** | Instruções iniciais — campo vazio | Comece digitando ou clique em um campo |
| **Amarelo** | Aviso — fórmula válida, mas pode ter problema | Leia a sugestão e decida se aplica |
| **Vermelho** | Erro — fórmula inválida | Corrija antes de salvar |
| **Verde** | Tudo certo — fórmula válida e sem alertas | Preencha os demais campos e salve |

> A GABI analisa automaticamente após **0,6 segundos** sem digitação. Enquanto você digita, o card some — é normal.

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
