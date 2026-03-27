# Documentação Visual — CalendarioCampoGlobal

Seletor de intervalo de datas (Date Range Picker) do Gravity Design System. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Estados do componente: campo fechado (input compacto) e painel aberto (sidebar + grade + rodapé).

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Anatomia técnica do painel: sidebar de atalhos (170px), grade 7×6 (células 36×36px), rodapé com botões pill. Verificação milimétrica dos espaçamentos definidos em `calendario.css`.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no CSS (Real) |
| :--- | :--- |
| **Grid de Células** | Grade 7×6 com células de exatos **36×36px** (`width: 2.25rem`). |
| **Sidebar Fixed Width** | A coluna de atalhos possui largura estática de **170px** para comportar textos de presets. |
| **Altura do Rodapé** | Rodapé fixo com **56px** (`h-14`) contendo botões de ação (Aplicar/Cancelar). |

---

## 3. Composição de Ancoragem Global (Contexto)
Posicionamento do painel de calendário em relação ao campo de input em formulários e modais.

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Referência Vertical (Y)** | O painel abre exatos **8px** abaixo da borda inferior do input pai. |
| **Referência Horizontal (X)** | Alinhado à borda esquerda do input pai (`left: 0` relativo ao wrapper). |
| **Z-Index de Sobreposição** | `z-index: 9999` para garantir visibilidade sobre modais e overlays. |

---

## Anatomia do Componente

| Área | Medida / Valor |
| :--- | :--- |
| **Input Fechado** | `border-radius: 6px`, fundo `rgba(129,140,248,0.05)`, borda `rgba(129,140,248,0.15)` |
| **Sidebar de Atalhos** | Largura fixa **170px**, presets: Hoje, Ontem, 7 dias, 30 dias, Este mês, Mês passado, Este ano |
| **Grade de Dias** | 7 colunas (Dom–Sáb), células **36×36px**, `border-radius: 50%` |
| **Seleção Ativa** | Fundo `#818cf8`, sombra `0 0 10px rgba(129,140,248,0.4)` |
| **Range Highlight** | Fundo `rgba(129,140,248,0.15)` com gradiente nas pontas |
| **Rodapé** | Botões Pill: "Cancelar" (fantasma) + "Aplicar" (primário roxo) |

---

## Exemplo de Uso (Código)

```tsx
import { CalendarioCampoGlobal } from '@nucleo/campo-calendario-global'

<CalendarioCampoGlobal
  rotulo="Período de Análise"
  valor={{ inicio: dataInicio, fim: dataFim }}
  aoMudarValor={({ inicio, fim }) => {
    setDataInicio(inicio)
    setDataFim(fim)
  }}
/>
```
