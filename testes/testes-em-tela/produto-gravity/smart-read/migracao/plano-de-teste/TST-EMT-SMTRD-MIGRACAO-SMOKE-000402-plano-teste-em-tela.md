# Plano Teste em Tela — TST-EMT-SMTRD-MIGRACAO-SMOKE-000402

**ID:** TST-EMT-SMTRD-MIGRACAO-SMOKE-000402  
**Objetivo:** Smoke pós-deploy / pré-lote de migração DATI → Gravity com **legado real** (não mock).

**Ambiente:** staging ou produção · `SMART_READ_MOCK_LEGADO=0`  
**Artefato:** `invoice_ficticia.pdf` (mesmo PDF usado no DATI QA)

---

## Pré-condições

- [ ] `SMART_READ_LEGADO_URL` + `SMART_READ_LEGADO_CHAVE_GRAVITY` configurados
- [ ] Sidecar `:8033` healthy (`/health` ou `_sidecarStatus['smart-read'].ok`)
- [ ] `SMART_READ_DATABASE_URL` + migrations aplicadas
- [ ] De-para org → company validado (§2 de `MIGRACAO-DATI-GRAVITY.md`)

---

## Roteiro (passo 1 → 3)

| # | Ação | APROVADO quando |
|---|------|-----------------|
| 1 | Nova Leitura → anexar `invoice_ficticia.pdf` → Enviar | Passo 2 abre em &lt; 75s · sidebar «Análise completa» |
| 2 | Conferir passo 2 | Métricas/globo 100% · sem erro infra na sidebar |
| 3 | Avançar para Conferência (passo 3) | Seções além de stub: Importador, itens/mercadoria, totais (paridade DATI ± campos vazios legítimos) |
| 4 | Comparar tempo DATI direto vs Gravity | Conclusão passo 2 dentro de ±30% do DATI na mesma org |

**Prints:** `testes/testes-em-tela/produto-gravity/smart-read/migracao/resultado-teste/<runId>/`

---

## Referência

`documentos-tecnicos/produtos-gravity/smart-read/MIGRACAO-DATI-GRAVITY.md` §7
