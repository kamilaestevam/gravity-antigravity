# Portal de Documentação Gravity Platform 🏛️

Bem-vindo à documentação centralizada da plataforma Gravity. Este portal serve como a **Fonte Única de Verdade (SSOT)** para engenharia, infraestrutura e produto.

---

## 📂 Navegação Técnica

| Módulo | Descrição | Status |
|:---|:---|:---:|
| [**APIs**](api/README.md) | Contrato de endpoints Cockpit vs Configurador | ✅ |
| [**Banco de Dados**](banco-de-dados/README.md) | Topologia, Isolamento de Tenant e Segurança RLS | ✅ |
| [**Infraestrutura**](infra/README.md) | Resolução de GAPs, Pipeline CI/CD e Railway | ✅ |
| [**Componentes (UI Kit)**](componentes/README.md) | Guia visual e PREVISÃO_VISUAL de componentes | ✅ |

---

## 🚀 Padrões de Engenharia
- **Isolamento:** Híbrido (App Middleware + DB RLS).
- **Paridade:** Env Teste (T26) e Prod (P26) espelhados via CI Gate.
- **Microserviços:** Orquestração via pasta `servicos-global`.
- **UI Kit:** Baseado no `nucleo-global` com design system proprietário.

---

**Última Auditoria:** Março 2026
**Responsável Técnico:** Antigravity AI
