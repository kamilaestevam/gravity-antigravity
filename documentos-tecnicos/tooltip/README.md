# Documentação Técnica — Sistema de Tooltips (TooltipGlobal)

Este documento descreve a arquitetura, o comportamento visual e as diretrizes de implementação do sistema de tooltips unificado da plataforma Gravity.

---

## 1. Visão Geral (UX 10)

O `TooltipGlobal` não é apenas um guia de ajuda; é uma camada de inteligência contextual que auxilia o usuário na tomada de decisão sem poluir a interface.

### Diferenciais Premium:
- **Zero Flash:** Posicionamento via Portal com cálculo de viewport em tempo real.
- **Micro-Interação:** Ícone `ⓘ` que surge via expansão lateral (`width`) e fade-in no hover.
- **Controle Global:** Respeita a regra `tooltips-disabled` no `body` para ocultação imediata em toda a plataforma.

---

## 2. Arquitetura Técnica

O componente utiliza o padrão **Trigger-Portal**. O conteúdo da tooltip nunca é renderizado dentro do fluxo normal da página, evitando problemas de `z-index` ou `overflow: hidden` em containers pai.

### Estrutura de Pastas:
- `nucleo-global/Feedback/tooltip-global/`
  - `src/tooltip.tsx`: Lógica React e Portal.
  - `src/tooltip.css`: Estilização e animações de micro-interação.
  - `src/tipos.ts`: Definições de interface TypeScript.

---

## 3. Especificações Visuais (Tokens)

As tooltips seguem o padrão **Dark Glass** da Gravity:

| Elemento | Valor |
| :--- | :--- |
| **Fundo** | `#0f172a` (Deep Slate) |
| **Borda** | `1px solid rgba(129, 140, 248, 0.22)` (Indigo Soft) |
| **Sombra** | `0 12px 32px rgba(0, 0, 0, 0.6)` |
| **Tipografia** | Plus Jakarta Sans (Regular 12px / Bold 13px) |
| **Animação In** | Fade + Scale (`0.15s` cubic-bezier) |

---

## 4. Comportamento do Mouse (Hover)

Ao contrário de tooltips genéricas, a Gravity utiliza um gatilho visual explícito:

1. **Estado Repouso:** O mouse é o cursor padrão do sistema.
2. **Estado Hover:**
   - O elemento torna-se um `inline-flex`.
   - Um pseudoselamento `::after` (ícone `ⓘ`) expande sua largura de `0` para `13px`.
   - Ocorre um deslocamento suave de `6px` para o lado, indicando que há informação extra disponível.

---

## 5. Diretrizes de Escrita (Skill)

Para manter a voz e o tom da plataforma, siga rigorosamente estas regras:

- **Sem Ponto Final:** Descrições nunca terminam com ponto.
- **Foco no Benefício:** Responda "o que isso faz pela empresa?", não "o que este campo salva no banco".
- **Limite de Caracteres:** Máximo de **90 caracteres** na descrição para leitura rápida.
- **Linguagem do Usuário:** Use "Organizações", nunca "Tenants". Use "Documentos", nunca "Rows".

---

## 6. Implementação (Snippet)

```tsx
import { TooltipGlobal } from '@nucleo/tooltip-global'

// Exemplo de uso em um campo de formulário
<TooltipGlobal 
  titulo="Localização"
  descricao="Estado onde a empresa possui sede fiscal registrada"
>
  <label>ESTADO</label>
</TooltipGlobal>
```

---

## 7. Acessibilidade e Performance

- **Pointer-events: none:** O card da tooltip nunca interfere nos cliques ou no scroll.
- **Cálculo de Viewport:** Se o elemento estiver no topo da tela, a tooltip inverte automaticamente sua posição para baixo para não ser cortada.
- **Conditional Rendering:** O componente só monta o Portal no DOM quando o estado `show` é ativado, economizando recursos de renderização inicial.
