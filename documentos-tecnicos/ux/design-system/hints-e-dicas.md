# Hints e Dicas Abaixo de Campos — Spec Completa

> **Status:** Aprovado
> **Data:** 2026-05-16
> **Referencia:** `skills/ux/design-system/SKILL.md` seção "Hints e Dicas Abaixo de Campos (3 tiers oficiais)"

---

## Contexto

O Gravity possui 3 tipos de texto auxiliar abaixo de campos de formulário. Antes desta padronização, cada produto implementava variações próprias (com/sem ícone, tamanhos diferentes, cores inconsistentes). Este documento oficializa os 3 tiers e suas regras.

---

## Os 3 Tiers

### Tier 1 — Hint Padrão (`.cg-hint`)

**Propósito:** Orientação estática sobre formato, restrição ou exemplo.

**Exemplos de uso:**
- "Formato: 0000.00.00" (campo NCM)
- "Máximo 255 caracteres" (campo de texto)
- "Apenas números" (campo numérico)

**Implementação:** Via prop `hint` do `CampoGeralGlobal`.

```tsx
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'

<CampoGeralGlobal label="NCM" hint="Formato: 0000.00.00">
  <input value={valor} onChange={onChange} />
</CampoGeralGlobal>
```

**CSS (canônico — em `campo-geral.css`):**

```css
.cg-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--ws-muted, var(--text-muted, #94a3b8));
}
```

**Spec:**

| Propriedade | Valor |
|---|---|
| `display` | `block` |
| `font-size` | `0.8rem` (12.8px) |
| `color` | `var(--text-muted, #94a3b8)` |
| Ícone | Nenhum |
| Visibilidade | Oculto quando há `erro` (erro tem prioridade) |

**Caminho:** `nucleo-global/Campos/campo-geral-global/src/campo-geral.css`

---

### Tier 2 — Dica Contextual (`.cg-hint-contextual`)

**Propósito:** Informar o usuário sobre um comportamento do campo — sugestão automática, valor calculado que pode ser editado, preenchimento inteligente.

**Exemplos de uso:**
- "Sugestão automática — você pode editar livremente." (número de pedido consolidado)
- "Calculado a partir dos itens — editável." (campo de total)
- "Preenchido pelo sistema — ajuste se necessário." (campo de data)

**Implementação:** Renderizado fora do `CampoGeralGlobal` (pois aceita ReactNode com ícone).

```tsx
import { Info } from '@phosphor-icons/react'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'

<CampoGeralGlobal label="Número do Pedido Consolidado" obrigatorio>
  <input value={valor} onChange={onChange} />
</CampoGeralGlobal>
<span className="cg-hint-contextual">
  <Info size={14} weight="fill" style={{ flexShrink: 0, opacity: 0.6 }} />
  Sugestão automática — você pode editar livremente.
</span>
```

**Alternativa inline style (quando CSS class não está disponível):**

```tsx
<span style={{
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: '0.8rem',
  color: 'var(--text-muted, #94a3b8)',
}}>
  <Info size={14} weight="fill" style={{ flexShrink: 0, opacity: 0.6 }} />
  Sugestão automática — você pode editar livremente.
</span>
```

**Spec:**

| Propriedade | Valor | Justificativa |
|---|---|---|
| `display` | `flex` | Para alinhar ícone + texto na mesma linha |
| `align-items` | `center` | Centraliza ícone com texto |
| `gap` | `0.375rem` (6px) | Espaçamento confortável ícone-texto |
| `font-size` | `0.8rem` (12.8px) | Alinhado com Tier 1 (`.cg-hint`) |
| `color` | `var(--text-muted, #94a3b8)` | Mesmo tom do hint padrão |
| Ícone | `<Info size={14} weight="fill">` | Phosphor Info, fill para destaque sutil |
| Opacidade ícone | `0.6` | Notável sem competir com o label |
| `flex-shrink` ícone | `0` | Impede que o ícone encolha em linhas longas |

**Quando usar Tier 2 (e não Tier 1):**
- O campo tem valor **gerado pelo sistema** que o usuário pode alterar
- O campo tem **preenchimento automático** baseado em contexto
- O campo tem **cálculo** visível que precisa de explicação
- O texto descreve **comportamento**, não formato

---

### Tier 3 — Status Badge

**Propósito:** Indicar estado de validação dinâmico — o campo está sendo verificado, é válido ou inválido.

**Exemplos de uso:**
- "NCM válido" (verde + CheckCircle)
- "NCM não encontrado na TEC" (amarelo + Warning)
- "Verificando..." (muted + spinner)

**Implementação:** Componente custom por contexto (não há componente global — cada produto implementa conforme necessidade).

```tsx
import { CheckCircle, Warning, ArrowsClockwise } from '@phosphor-icons/react'

// Estado válido
<span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#22c55e' }}>
  <CheckCircle size={12} weight="fill" />
  NCM válido
</span>

// Estado atenção
<span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#f59e0b' }}>
  <Warning size={12} weight="fill" />
  NCM não encontrado na TEC
</span>

// Estado carregando
<span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
  <ArrowsClockwise size={12} weight="regular" className="spin" />
  Verificando...
</span>
```

**Spec:**

| Propriedade | Valor |
|---|---|
| `font-size` | `0.75rem` (12px) — menor que hints |
| `gap` | `0.25rem` (4px) — mais compacto |
| Ícone size | `12px` |
| Cores | Semânticas: `--success`, `--warning`, `--danger`, `--text-muted` |

**Mapa de estados:**

| Estado | Cor | Ícone | Weight |
|---|---|---|---|
| Válido | `var(--success)` `#22c55e` | `CheckCircle` | `fill` |
| Atenção | `var(--warning)` `#f59e0b` | `Warning` | `fill` |
| Erro | `var(--danger)` `#ef4444` | `XCircle` | `fill` |
| Carregando | `var(--text-muted)` `#94a3b8` | `ArrowsClockwise` | `regular` + animação CSS `spin` |

---

## Regras de Decisão

```
O texto descreve FORMATO ou RESTRIÇÃO?
  → Tier 1 (hint puro, sem ícone)

O texto descreve COMPORTAMENTO DO CAMPO (sugestão, cálculo, auto-fill)?
  → Tier 2 (com ícone Info)

O texto indica ESTADO que MUDA (válido/inválido/carregando)?
  → Tier 3 (badge colorido com ícone semântico)
```

---

## Anti-patterns Proibidos

| Anti-pattern | Por que é errado | Correção |
|---|---|---|
| Usar ícone Info em hint de formato | Ícone implica comportamento ativo; formato é estático | Tier 1 (sem ícone) |
| Usar badge colorido para info estática | Badge é para estado dinâmico que muda | Tier 1 ou Tier 2 |
| Cor diferente de `--text-muted` no Tier 1/2 | Quebra harmonia visual com label e campo | Usar `var(--text-muted, #94a3b8)` |
| Tamanho diferente de `0.8rem` no Tier 1/2 | Inconsistência tipográfica | Padronizar em `0.8rem` |
| Ícone maior que 14px no Tier 2 | Compite com o campo — ícone é auxiliar | Fixar em 14px |
| Ícone `weight="duotone"` no Tier 2 | Muito detalhado para 14px | Usar `fill` (mais legível em tamanho pequeno) |

---

## Onde Este Padrão Já Está Implementado

| Local | Tier | Texto |
|---|---|---|
| `ModalPedidosConsolidar.tsx` | Tier 2 | "Sugestão automática — você pode editar livremente." |
| `CampoGeralGlobal` (prop `hint`) | Tier 1 | Qualquer texto via prop |
| NCM (ColunasFilho) | Tier 3 | Status de validação NCM |

---

## Evolução Futura

- **Tier 2 como prop do `CampoGeralGlobal`:** quando houver demanda suficiente, considerar adicionar prop `hintIcone?: boolean` ou `hintTipo?: 'padrao' | 'contextual'` ao `CampoGeralGlobal` para renderizar o ícone Info automaticamente. Por enquanto, renderizar fora do componente é aceitável.
- **Componente `StatusBadgeCampo`:** quando Tier 3 for usado em 3+ produtos, criar componente global em `nucleo-global/Feedback/`.
