# PLAN_FRONTEND_Configurador — Plano de Batalha (Frontend)

> **Diretório raiz:** `servicos-global/configurador/src/`
> **Fase:** 2 — Plano aprovado. Não executar sem Fase 3 iniciada.

---

## 1. CAMPO DE BUSCA — LOCALIZAR REFERÊNCIAS AOS NOMES ANTIGOS

Execute em `servicos-global/configurador/src/`:

```bash
# Organizacao (Tenant)
grep -r "\.name\b" src/                    # pode ser nome da org
grep -r "\.slug\b" src/                    # → subdominio_organizacao
grep -r "\.plan\b" src/                    # EXCLUIR — vai para assinatura

# Usuário
grep -r "\.role\b" src/                    # → tipo_usuario
grep -r "is_active" src/                   # → status_usuario (calculado)

# Produto
grep -r "PriceTier\|priceTier" src/        # → inline em ProdutoGravity
grep -r "SpecialNegotiation" src/          # → inline em ProdutoGravity
grep -r "ProductConfig\|productConfig" src/

# Deploy
grep -r "DeployLog\|deployLog" src/        # → Deploy

# Testes
grep -r "TestPlan\|testPlan" src/          # → Testes (merged)
grep -r "TestLog\|testLog" src/
grep -r "TestSchedule\|testSchedule" src/
```

---

## 2. COMPONENTES A ATUALIZAR (por entidade)

### Organização (Tenant)
| Componente / arquivo provável | O que muda |
|---|---|
| `pages/admin/ModalEditarOrganizacao.tsx` (git: modificado) | Campos do formulário: `name` → `nome_organizacao`, `slug` → `subdominio_organizacao` |
| `pages/admin/HistoricoGlobalAdmin.tsx` (git: modificado) | Referências a `Tenant` → `Organizacao` |
| `pages/AdminPanel.tsx` (git: modificado) | Listagens de tenant/organizacao |
| `pages/admin/ProdutosGravityAdmin.tsx` (git: modificado) | Listagens de `Product` → `ProdutoGravity` |
| `App.tsx` (git: modificado) | Imports e tipos globais |

### Produto Gravity (Product + PriceTier + SpecialNegotiation + ProductConfig)
| Campo antigo | Campo novo | Onde aparece |
|---|---|---|
| `product.name` | `nome_produto_gravity` | Cards de produto, marketplace |
| `product.description` | `descricao_produto_gravity` | Cards de produto |
| `product.slug` | `slug_produto_gravity` | URLs, links |
| `product.status` | `status_produto_gravity` | Badge/toggle |
| `priceTier.min` / `priceTier.max` | `inicial_faixa_valor_produto_gravity` / `final_faixa_valor_produto_gravity` | Modal de preço |
| `priceTier.price` | `valor_faixa_produto_gravity` | Modal de preço |

### Deploy
| Campo antigo | Campo novo |
|---|---|
| `deployLog.area` (ou `service`) | `area_deploy` |
| `deployLog.version` | `versao_deploy` |
| `deployLog.status` | `status_deploy` |
| `deployLog.environment` | `ambiente_deploy` |
| `deployLog.executed_at` | `data_execucao_deploy` |
| `deployLog.deployed_by` | `quem_deploy` |

### Testes (TestLog + TestPlan + TestSchedule → unified)
| Campo antigo | Campo novo |
|---|---|
| `testLog.tipo_teste` | manter |
| `testLog.resultado_teste` | manter |
| `testPlan.local` | `local_plano_teste` |
| `testPlan.rotal` (typo no DDD) | `rotal_plano_teste` |

---

## 3. NOVOS COMPONENTES / PÁGINAS NECESSÁRIOS

| Componente | Descrição |
|---|---|
| `pages/admin/FaturaProdutosGravity.tsx` | CRUD de faturas de serviços Gravity |
| `pages/admin/MetricasGemini.tsx` | Visualização de métricas de LLM |

---

## 4. API RESPONSES — ADAPTER LAYER

Se o backend retorna os novos nomes de campo e o frontend ainda usa os antigos, criar adapter temporário enquanto migra:

```typescript
// TEMPORÁRIO durante migração — remover ao final
function adaptOrganizacao(raw: any) {
  return {
    nome_organizacao: raw.name ?? raw.nome_organizacao,
    subdominio_organizacao: raw.slug ?? raw.subdominio_organizacao,
    // ...
  }
}
```

---

## 5. LABELS DE TELA (referência)

| Campo banco | Label na tela |
|---|---|
| `nome_organizacao` | "Nome da Organização" |
| `cnpj_organizacao` | "CNPJ da Organização" |
| `estado_organizacao` | "Estado da Organização" |
| `cidade_organizacao` | "Cidade da Organização" |
| `segmento_organizacao` | "Segmento da Organização" |
| `tipo_organizacao` | "Tipo da Organização" |
| `subdominio_organizacao` | "Subdomínio da Organização" |
| `status_organizacao` | "Status da Organização" |
| `nome_usuario` | "Nome do Usuário" |
| `email_usuario` | "Email do Usuário" |
| `tipo_usuario` | "Tipo de Usuário" |
| `status_usuario` | "Status do Usuário" |
| `nome_produto_gravity` | "Nome do Produto Gravity" |
| `status_produto_gravity` | "Status do Produto Gravity" |
| `area_deploy` | "Área do Deploy" |
| `versao_deploy` | "Versão do Deploy" |
| `status_deploy` | "Status do Deploy" |

---

## 6. CHECKLIST FASE 3

```bash
grep -r "\.name\b" src/pages/admin/          # revisar contexto
grep -r "priceTier\|PriceTier" src/           # zero
grep -r "specialNegotiation\|SpecialNegotiation" src/ # zero
grep -r "productConfig\|ProductConfig" src/   # zero
grep -r "deployLog\|DeployLog" src/           # zero
grep -r "testPlan\|TestPlan" src/             # zero
npx tsc --noEmit                              # zero erros
```
