---
description: Blindagem e Regras de Negócios para IAs que desenvolvam o Módulo SimulaCusto e o Modelo Estimativa.
---

# 🧠 SKILL: SimulaCusto & Estimativas (AI Directive)

> **ATENÇÃO IA (Antigravity ou Copilots):** Se você for acionado pelo Desenvolvedor para gerar Queries Prisma, criar rotas de API Express/Next, ou modificar o banco de dados relacionado a `Estimativa` ou `TaxaEstimativa`, você é OBRIGADO a acatar as diretrizes abaixo. A violação causará falha em testes Zero-Trust e *Build Blockage* agressivo.

## 1. A Regra Sagrada: Identidades Fortes (IDs Corporativos)
**NÃO** use `cuid()`, **NÃO** use `uuid()`.
Todo objeto gerado na família SimulaCusto deve ter prefixos únicos. Se mandarem você criar uma "TaxaNova", aplique:
* `Estimativa`: `esti_id_[SEQUENCIAL NA TELA]/[YY]` (ex: esti_id_000000001/26)
* `TaxaEstimativa`: `txes_id_[SEQUENCIAL]/[YY]` 

## 2. A Muralha Anti-Vazamento (Isolamento de Organização + Workspace)
Toda requisição/criação ao Prisma do módulo de Custo deve estar envelopada pelo wrapper `withTenantContext` do `@gravity/tenant-resolver` (nome do pacote npm preservado por compatibilidade — semântica DDD: Organização).
* Se for fazer um `prisma.estimativa.findMany()`, garanta que haja um `where: { id_workspace: ctx.workspaceId }` (campo Prisma DDD do fragment de SimulaCusto; o `ctx.workspaceId` da API atual do SDK corresponde semanticamente a `idWorkspace`).
* **Nunca crie um model novo de custo sem os campos Prisma DDD de Organização E Workspace** (`id_organizacao` E `id_workspace`; em models legados que ainda persistem colunas físicas antigas use `@map("tenant_id")` / `@map("company_id")`). Eles andam juntos. O Schema-per-Organização + checagem de Workspace bloqueia escritas que não tenham a dupla. Falta de Workspace deixará a estimativa global, o que é um pesadelo arquitetural de Tier 1.

> Em models novos, use `id_organizacao`/`id_workspace` direto. Em models legados que ainda persistem colunas físicas no banco, mantenha `id_organizacao String @map("tenant_id")` e `id_workspace String @map("company_id")` — o `schema.prisma` é INTOCÁVEL (Mandamento 02). Em payloads, JSON e variáveis TypeScript, use sempre a nomenclatura DDD (`idOrganizacao`, `idWorkspace`).

## 3. Acoplamento de Core Process 
A Estimativa é uma "fantasia" financeira. Assim que ela é validada pela diretoria, ela se torna real no módulo `CoreProcess` (`Serviços Globais / Núcleos de Importação`).
* Se você construir uma rota de "Aprovação de Estimativa", você DEVE buscar ou preencher o campo `core_id`.
* Após `core_id` estar não-nulo, a `Estimativa` entra no estado `Efetivada` e NENHUM update é permitido nos valores dos impostos dela. Você deve gerar exceção (HTTP 409 Conflict) se o usuário tentar alterar um Landed Cost de um Processo Real ativo.

## 4. Retornos 404 vs 403 (Masking)
Se um ID de Estimativa (`esti_id_xyz`) não for do Workspace ativo da sessão (`req.tenant.workspaceId` — semântica: `idWorkspace`), se estiver fazendo Query Raw, retorne `404 Not Found` (Masking de Enumeração) ao invés de `403 Forbidden`. O invasor não pode saber que aquele ID existe na base de outro cliente.

**Resumo Sistêmico:** 1) Prefixos ID, 2) Dupla Trava de Keys, 3) Interceptação de Core-id, 4) 404 Masking.
_Fim do Sistema de Inteligência para SimulaCusto._
