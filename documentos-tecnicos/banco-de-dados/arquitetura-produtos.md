# Arquitetura Multi-Tenant de Acesso a Produtos

A plataforma Gravity utiliza uma arquitetura de acesso a produtos em **três níveis (Cadeias)**, baseada no princípio de isolamento total e menor privilégio. Esta documentação descreve as tabelas responsáveis por cada camada e suas regras.

---

## 🏗️ Cadeia de Níveis de Acesso

O ecossistema é suportado por tabelas relacionais do Configurador — garantindo alta performance e controle preciso, evitando _anti-patterns_ de JSONs enormes.

### 1. Nível Organizacional (Tenant)
**O que define:** A empresa matriz comprou/assinou este produto?
**Tabela:** `ProductConfig`
**Mecânica:** Vincula um `tenant_id` a um `product_key`. Se o módulo estiver ativo aqui, a organização inteira tem direito comercial a distribuí-lo. O `config` JSON pode guardar limites de _billing/licenciamento_.

### 2. Nível Workspace (Company) — *A Cadeia 1.5*
**O que define:** O produto está habilitado para esta unidade de negócio/filial?
**Tabela:** `CompanyProduct`
**Mecânica:** Vincula a matriz `tenant_id` à filial `company_id` e a uma `product_key`. Permissões e menus apenas "existem" no workspace selecionado pelo usuário caso o produto conste aqui. Garante isolamento funcional entre filiais.

### 3. Nível Usuário (Cadeia 2)
**O que define:** O usuário logado, especificamente neste workspace, pode ler/editar este produto?
**Tabela:** `UserPermission`
**Mecânica:** O sistema valida a tríade `(user_id, company_id, product_key)` junto ao identificador granular de `permission` (ex: `read`, `write`). Baseia-se no princípio do menor privilégio.

---

## 📐 Padrão Ouro B2B

1. **Flexibilidade Dinâmica:** O uso de strings textuais (ex: `'simulacusto'`, `'gabi'`) para as chaves `product_key` em vez de Enums de banco de dados permite que a agência Gravity lance novos produtos sem engessar a governança com frequentes migrações de Schema.
2. **Consultas em Nanosegundos:** As interfaces administrativas consultam as tabelas e índices otimizados para agrupar e ativar Menus (`useShellStore`) num único evento de _load_, provendo um Shell livre de lentidões.
3. **Escala Master:** O próprio dono do Workspace (papel _Master_) é bypassado do *check* do Nível 3 (`UserPermission`), porém o shell UI *sempre e obrigatoriamente* acatará a ativação dos Níveis 1 e 2.
