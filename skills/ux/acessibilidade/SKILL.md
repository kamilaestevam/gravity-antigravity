---
name: antigravity-acessibilidade
description: "Use esta skill ao implementar ou revisar interfaces de usuário. Define conformidade WCAG 2.1 AA, aria-labels, contraste, navegação por teclado e testes de acessibilidade. Consultada pelo UX e Frontend ao criar ou modificar qualquer tela."
---

# Gravity — Acessibilidade (WCAG 2.1 AA)

## Regra Fundamental

Toda interface do Gravity deve ser acessível por teclado, leitores de tela e atender o nível AA do WCAG 2.1. Acessibilidade não é "nice to have" — é obrigatório.

---

## Navegação por Teclado

### Ordem de tab (focus order)

- Segue a ordem visual da tela (esquerda→direita, topo→baixo)
- Elementos interativos recebem foco na ordem correta
- Skip links no topo: "Pular para o conteúdo principal"

```tsx
// Skip link — primeiro elemento do Layout
<a href="#main-content" className="sr-only focus:not-sr-only">
  Pular para o conteúdo principal
</a>
```

### Atalhos de teclado

| Ação | Atalho |
|:---|:---|
| Navegar entre itens | `Tab` / `Shift+Tab` |
| Ativar botão/link | `Enter` ou `Space` |
| Fechar modal/dropdown | `Escape` |
| Navegar dentro de lista | `Arrow Up/Down` |
| Selecionar/deselecionar | `Space` |

### Focus trap em modais

```tsx
// Modal deve prender o foco dentro dele
// Usar @headlessui/react ou @radix-ui/react-dialog
<Dialog open={isOpen} onClose={() => setIsOpen(false)}>
  {/* Focus fica preso aqui até fechar */}
</Dialog>
```

---

## Contraste de Cores

| Contexto | Ratio mínimo (AA) |
|:---|:---|
| Texto normal (< 18px) | 4.5:1 |
| Texto grande (≥ 18px ou bold ≥ 14px) | 3:1 |
| Ícones e elementos UI | 3:1 |
| Focus indicator | 3:1 contra adjacente |

> Testar com ferramentas: axe-core, Lighthouse, ou extensão WAVE.

---

## Aria Labels

### Regras obrigatórias

```tsx
// Botões sem texto visível
<button aria-label="Fechar modal"><XIcon /></button>

// Ícones decorativos
<Icon aria-hidden="true" />

// Inputs com label
<label htmlFor="titulo">Título</label>
<input id="titulo" type="text" />

// Se não tem label visível
<input aria-label="Buscar cotações" type="search" />

// Regiões da página
<nav aria-label="Menu principal">
<main id="main-content" role="main">
<aside aria-label="Filtros">
```

### Live regions (notificações dinâmicas)

```tsx
// Toast de sucesso/erro — lido automaticamente pelo leitor de tela
<div role="alert" aria-live="polite">
  {mensagem}
</div>

// Contadores que atualizam
<span aria-live="polite" aria-atomic="true">
  {total} resultados encontrados
</span>
```

---

## Formulários Acessíveis

```tsx
// Feedback de erro acessível
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <span id="email-error" role="alert" className="text-red-600">
    {errors.email}
  </span>
)}

// Campos obrigatórios
<label htmlFor="titulo">
  Título <span aria-label="obrigatório">*</span>
</label>
```

---

## Tabelas Acessíveis

```tsx
<table>
  <caption>Cotações abertas</caption>
  <thead>
    <tr>
      <th scope="col">Referência</th>
      <th scope="col">Status</th>
      <th scope="col">Ações</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>COT-001</td>
      <td>Aberta</td>
      <td>
        <button aria-label="Editar cotação COT-001">Editar</button>
      </td>
    </tr>
  </tbody>
</table>
```

---

## Testes de Acessibilidade

### Automatizados (CI)

```typescript
// vitest + axe-core
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('page has no accessibility violations', async () => {
  const { container } = render(<MinhaPagina />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Manuais (QA)

- [ ] Navegar toda a tela apenas com teclado
- [ ] Testar com leitor de tela (NVDA ou VoiceOver)
- [ ] Verificar contraste com WAVE
- [ ] Testar com zoom 200%

---

## Checklist — Antes de Entregar uma Tela

- [ ] Ordem de tab correta e lógica?
- [ ] Skip link implementado?
- [ ] Todos os botões/ícones têm aria-label?
- [ ] Contraste AA validado?
- [ ] Formulários com labels e feedback de erro acessível?
- [ ] Modais com focus trap?
- [ ] Live regions para notificações dinâmicas?
- [ ] Teste axe-core sem violações?
