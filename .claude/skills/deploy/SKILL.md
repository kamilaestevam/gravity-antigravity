---
description: Fluxo de deploy/migração no Gravity
---

Você vai executar um fluxo de **deploy ou migração** no Gravity.

Antes de qualquer ação:
1. Leia `skills/governanca/deploy/SKILL.md` completamente
2. Leia `skills/governanca/agent-policy/SKILL.md`
3. Leia `skills/arquitetura/observabilidade/SKILL.md`

Regras fundamentais:
- NENHUM deploy sem seguir o documento de deploy
- NENHUMA migração destrutiva sem backup + plano de rollback
- NENHUM deploy em produção sem validação em staging primeiro

Ordem de deploy (dependências):
1. configurador (sem dependências)
2. tenant-services (depende de configurador)
3. produtos (depende de configurador + tenant-services)
4. marketplace (sem dependências, qualquer momento)

Após cada deploy: verificar health check antes de prosseguir.
