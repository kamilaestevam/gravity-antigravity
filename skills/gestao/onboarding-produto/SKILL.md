---
name: antigravity-onboarding-produto
description: "Use esta skill ao implementar o fluxo de primeiro uso de qualquer produto. Define o wizard de onboarding, dados demo, tutorial interativo e métricas de ativação. Consultada pelo Líder do Projeto e PO ao planejar a experiência de primeiro uso."
---

# Gravity — Onboarding de Produto

## Fluxo Completo de um Novo Cliente

```
1. DESCOBERTA    → Marketplace (landing, preços, demos)
2. AQUISIÇÃO     → Configurador (Clerk para autenticação; organização, plano, pagamento via Prisma — Mandamento 01)
3. ONBOARDING    → Wizard de primeiro uso (dados demo, tutorial)
4. ATIVAÇÃO      → Primeiro valor real (criar cotação, importar dados)
5. EXPANSÃO      → Adicionar produtos com 1 clique
```

---

## Wizard de Primeiro Uso

Todo produto implementa um wizard de 3-5 passos no primeiro acesso:

### Passo 1 — Boas-vindas
- Nome do produto, o que ele faz em uma frase
- Opção: "Carregar dados demo" ou "Começar do zero"

### Passo 2 — Configuração mínima
- Apenas o essencial para funcionar (ex: moeda padrão, timezone)
- Máximo 5 campos — menos é mais

### Passo 3 — Dados demo (opcional)
- Se o usuário escolheu, popular com dados realistas
- Dados demo marcados visualmente (badge "Demo")
- Opção de limpar dados demo a qualquer momento

### Passo 4 — Tutorial interativo
- Highlight dos 3 recursos principais
- Tooltips guiados (step-by-step)
- Skip disponível a qualquer momento

### Passo 5 — Primeiro valor
- Guiar o usuário para a primeira ação real
- Ex: "Crie sua primeira cotação" com campos pré-preenchidos

---

## Dados Demo

Cada produto tem um script de seed com dados demo:

```typescript
// scripts/sob-demanda/seed-demo.ts — usar withTenantContext do @gravity/tenant-resolver
import { withTenantContext } from '@gravity/tenant-resolver'

export async function seedDemo(idOrganizacao: string) {
  await withTenantContext(idOrganizacao, async (_ctx, rawDb) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = rawDb as any
    // Dados marcados como demo para fácil limpeza
    await db.cotacao.createMany({
      data: [
        { id_organizacao: idOrganizacao, titulo: 'Cotação Exemplo 1', is_demo: true },
        { id_organizacao: idOrganizacao, titulo: 'Cotação Exemplo 2', is_demo: true },
      ]
    })
  })
}

export async function clearDemo(idOrganizacao: string) {
  await withTenantContext(idOrganizacao, async (_ctx, rawDb) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = rawDb as any
    await db.cotacao.deleteMany({
      where: { id_organizacao: idOrganizacao, is_demo: true }
    })
  })
}
```

**Regras:**
- Todo registro demo tem `is_demo: true`
- Dados demo não contam em KPIs ou relatórios
- Limpar dados demo é uma ação irreversível com confirmação

---

## Métricas de Ativação

| Métrica | O que mede | Meta |
|:---|:---|:---|
| Onboarding completion | % que terminou o wizard | > 80% |
| Time to first value | Tempo até primeira ação real | < 10 min |
| Demo conversion | % que converteu demo → dados reais | > 30% |
| Day-1 retention | % que voltou no dia seguinte | > 60% |

---

## Expansão — Adicionar Produto

Quando o cliente já está na plataforma e adiciona um novo produto:

1. Organização, usuários e pagamento **já existem** no Configurador
2. Serviços por organização (email, atividades, dashboard) **já funcionam**
3. Apenas rodar o wizard de onboarding do novo produto
4. Dados da organização (atividades, histórico) automaticamente disponíveis

---

## Checklist — Antes de Lançar um Produto

- [ ] Wizard de onboarding implementado (3-5 passos)?
- [ ] Script de seed demo criado e testado?
- [ ] Dados demo marcados com `is_demo: true`?
- [ ] Limpeza de dados demo funciona?
- [ ] Tutorial interativo com skip?
- [ ] Métricas de ativação instrumentadas?
- [ ] Primeiro valor guiado (ação pré-preenchida)?
