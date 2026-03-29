---
name: antigravity-handoff
description: "Use esta skill para o processo de handoff entre Design e Desenvolvimento. Define como entregar specs, tokens, assets e validação visual. Consultada pelo Líder do Projeto, UX e Frontend antes de iniciar qualquer implementação de tela."
---

# Gravity — Handoff (Design → Dev)

## Regra Fundamental

Nenhuma tela é implementada sem handoff completo. O desenvolvedor não interpreta o design — ele recebe specs precisas.

---

## O Que o UX Entrega

| Entregável | Formato | Obrigatório |
|:---|:---|:---|
| Mockup final | Figma com auto-layout | Sim |
| Tokens de design | JSON exportado do Figma | Sim |
| Comportamento interativo | Anotações no Figma ou vídeo | Sim para fluxos complexos |
| Estados da tela | Empty, loading, error, filled, disabled | Sim |
| Responsividade | Breakpoints documentados (mobile, tablet, desktop) | Sim |
| Acessibilidade | Ordem de tab, aria-labels, contraste | Sim |
| Assets exportados | SVG/PNG otimizados | Quando necessário |

---

## Processo de Handoff

```
UX finaliza mockup → Review com PO → Aprovação → Handoff meeting (30min)
                                                    → Dev implementa
                                                    → QA valida visual (Percy)
                                                    → UX review final
```

### Handoff Meeting (30 min)

1. UX apresenta a tela completa (5 min)
2. Walk-through dos estados e interações (10 min)
3. Dev faz perguntas (10 min)
4. Alinhamento de tokens e componentes existentes (5 min)

---

## Tokens de Design

Os tokens do Figma são convertidos para variáveis CSS:

```css
/* nucleo-global/design-tokens.css */
:root {
  --color-primary: #2563EB;
  --color-success: #16A34A;
  --color-error: #DC2626;
  --color-warning: #F59E0B;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
}
```

> **Regra:** o dev nunca usa valores mágicos — sempre tokens. Se um valor não existe como token, pedir ao UX para adicioná-lo.

---

## Validação Visual — Percy Snapshots

Após implementação, o QA roda snapshots do Percy comparando com o mockup:

- Diferença visual > 2% → rejeitar e devolver ao dev
- Diferença < 2% → aprovado (tolerância para anti-aliasing/rendering)

---

## Componentes Existentes vs Novos

Antes de implementar:

1. **Verificar** se o componente já existe em `nucleo-global/`
2. **Se existe** → usar. Não recriar.
3. **Se não existe mas é genérico** → criar em `nucleo-global/` (solicitar ao agente 1A)
4. **Se é específico do produto** → criar localmente no produto

---

## Checklist — Antes de Implementar uma Tela

- [ ] Mockup aprovado pelo PO?
- [ ] Todos os estados documentados (empty, loading, error, filled)?
- [ ] Tokens de design disponíveis?
- [ ] Breakpoints de responsividade definidos?
- [ ] Acessibilidade especificada (tab order, aria-labels)?
- [ ] Handoff meeting realizado?
- [ ] Componentes existentes identificados para reuso?
