# Documentação Visual — BotaoGlobal

Referência definitiva de design (Padrão Workspace — Roxo).

## 1. Folha de Especificação Técnica de UX
Definição visual de todos os estados, cores de marca e ícones do componente.

![Folha de Especificação Técnica de UX](./preview-estados.png)

---

## 2. Especificação de Composição
Blueprint técnico detalhando a anatomia do componente, dimensões e espaçamentos internos.

![Especificação de Composição](./preview-layout.png)

---

## 3. Composição de Ancoragem Global
Blueprint de contexto mostrando o posicionamento do componente dentro da interface Gravity.

![Composição de Ancoragem Global](./preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | Alinhado à base inferior dos StatCards. |
| **Referência Horizontal (X)** | Ponto extremo à direita (Margem Lateral de 24px). |
| **Espaçamento Relacional** | Manter **16px** (p-4) de distância do topo da Tabela. |
| **Gap de Grupo** | Distância de **8px** entre botões do mesmo grupo. |

---

## Exemplo de Uso (Código)

```tsx
import { BotaoGlobal } from '@nucleo/botoes/botao-global'
import { Plus } from '@phosphor-icons/react'

<BotaoGlobal icone={<Plus weight="bold" size={14} />}>
  Gerar Relatório
</BotaoGlobal>
```
