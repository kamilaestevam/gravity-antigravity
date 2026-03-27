# Documentação Visual — StatusBadgeGlobal

Componente de etiqueta de status em formato *pill* — unificado e com processamento léxico automático para traduções de retornos do servidor. Referência fiel baseada em exames reais do DOM no navegador.

## 1. Folha de Especificação Técnica de UX
Documentação do padrão visual para identificação de entidades ativas e suspensas e respectiva parametrização de gênero linguístico.

![Folha de Especificação Técnica UX](./real-preview-estados.png)

---

## 2. Blueprint: Layout de Composição
Blueprint da arquitetura do componente com especificações de raio, bordas compensadas para visibilidade em *dark mode*, margens e tipografia reduzida. Medidas extraídas diretamente do `StatusBadgeGlobal.tsx`.

![Especificação de Composição](./real-preview-layout.png)

| Medida Relevante | Verificação Técnica no Código (Real) |
| :--- | :--- |
| **Padding (Pílula)** | `padding: '0.2rem 0.625rem'` → 3.2px vertical / 10px horizontal. |
| **Border-Radius** | `borderRadius: '9999px'` → pílula perfeita em qualquer largura. |
| **Fonte** | `fontSize: '0.6875rem'` (11px), `fontWeight: 700`, `letterSpacing: '0.04em'`. |
| **Cor ATIVO** | Texto `#34d399` / Fundo `rgba(52,211,153,0.12)` / Borda = fundo. |
| **Cor SUSPENSO** | Texto `#f87171` / Fundo `rgba(248,113,113,0.12)` / Borda `rgba(248,113,113,0.2)` (reforçada). |
| **Cor FALLBACK** | Texto `#64748b` / Fundo `rgba(100,116,139,0.12)` / Borda = fundo. |

---

## 3. Composição de Ancoragem Global (Contexto)
Comportamento de fluxo `inline-flex` para integração orgânica em células de tabelas, cartões e faixas de títulos sem distorção das linhas de grid.

![Composição de Ancoragem Global](./real-preview-contexto.png)

| Regra de Ancoragem | Referência Técnica |
| :--- | :--- |
| **Comportamento de Display** | Usa `display: 'inline-flex'` — nunca quebra o bloco onde for injetado. |
| **Parsing Seguro** | Normaliza via `.toLowerCase().trim()` antes de comparar com Set de valores mapeados. |
| **Tratamento de Exceções** | Strings não mapeadas exibidas em `.toUpperCase()` com paleta cinza (fallback). |
| **Gênero** | Prop `genero: 'masculino' | 'feminino'` — padrão `'feminino'` (Organizações/Faturas). |

---

## Anatomia do Componente

| Área / Propriedade | Medida / Valor |
| :--- | :--- |
| **Corpo (Pílula)** | `padding: 0.2rem 0.625rem` (3px / 10px respect.), `border-radius: 9999px`. |
| **Tipografia (Label)** | `font-size: 0.6875rem (11px)`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.04em`. |
| **Paleta "ATIVO/A"** | Texto `#34d399` / Fundo e borda `rgba(52,211,153,0.12)`. |
| **Paleta "SUSPENSO/A"** | Texto `#f87171` / Fundo `rgba(248,113,113,0.12)` / Borda `rgba(248,113,113,0.2)`. |
| **Paleta "FALLBACK"** | Texto `#64748b` / Fundo e borda `rgba(100,116,139,0.12)`. |

---

## Exemplo de Uso (Código)

```tsx
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'

{/* Contexto feminino (Padrão) -> Organizações e Faturas */}
<StatusBadgeGlobal valor="ACTIVE" />  {/* Exibe: ATIVA */}

{/* Contexto masculino -> Usuários e Produtos */}
<StatusBadgeGlobal valor={usuario.status} genero="masculino" /> {/* Exibe: ATIVO ou SUSPENSO */}

{/* Fallback transparente -> exibe a string como recebida */}
<StatusBadgeGlobal valor="Processando" /> {/* Exibe: PROCESSANDO */}
```
