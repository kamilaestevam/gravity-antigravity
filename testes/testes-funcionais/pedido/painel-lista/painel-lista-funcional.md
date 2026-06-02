# Plano funcional — Painéis da Lista (Pedido)

> **Status:** RASCUNHO — aguarda pipeline multi-agente (QA)  
> **Rotas:** `/api/v1/pedidos/lista/paineis`

## Casos mínimos

- [ ] GET vazio → cria Principal + migra colunas da preferência antiga
- [ ] POST cria painel; PUT renomeia; DELETE com ≥2 painéis
- [ ] PUT `config_json` com todos os campos v1 → GET idêntico (persistência completa)
- [ ] Reordenar painéis persiste `ordem`
- [ ] Cross-tenant: painel de outro usuário/org → 404/403
- [ ] `ids_workspaces` na listagem de pedidos valida IDs contra workspaces habilitados (regressão escopo sidebar)
