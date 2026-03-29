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

## 2. A Muralha Anti-Vazamento (Zero-Trust/RLS compliance)
Toda requisição/criação ao Prisma do módulo de Custo deve estar envelopada pelo wrapper `withTenantContext`.
* Se for fazer um `prisma.estimativa.findMany()`, garanta que haja um `where: { company_id: ctx.companyId }`.
* **Nuca Crie um model novo de custo sem colocar `tenant_id` E `company_id`.** Eles andam juntos. O RLS do PostrgreSQL bloqueia escritas que não tenham a dupla. Falta de `company_id` deixará a estimativa global, o que é um pesadelo arquitetural de Tier 1.

## 3. Acoplamento de Core Process 
A Estimativa é uma "fantasia" financeira. Assim que ela é validada pela diretoria, ela se torna real no módulo `CoreProcess` (`Serviços Globais / Núcleos de Importação`).
* Se você construir uma rota de "Aprovação de Estimativa", você DEVE buscar ou preencher o campo `core_id`.
* Após `core_id` estar não-nulo, a `Estimativa` entra no estado `Efetivada` e NENHUM update é permitido nos valores dos impostos dela. Você deve gerar exceção (HTTP 409 Conflict) se o usuário tentar alterar um Landed Cost de um Processo Real ativo.

## 4. Retornos 404 vs 403 (Masking)
Se um ID de Estimativa (`esti_id_xyz`) não for do `company_id` ativo da sessão, se estiver fazendo Query Raw, retorne `404 Not Found` (Masking de Enumeração) ao invés de `403 Forbidden`. O invasor não pode saber que aquele ID existe na base de outro cliente. 

**Resumo Sistêmico:** 1) Prefixos ID, 2) Dupla Trava de Keys, 3) Interceptação de Core-id, 4) 404 Masking.
_Fim do Sistema de Inteligência para SimulaCusto._
