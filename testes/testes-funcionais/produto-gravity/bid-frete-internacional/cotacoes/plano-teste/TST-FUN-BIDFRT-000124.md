# Plano — TST-FUN-BIDFRT-000124

**ID:** TST-FUN-BIDFRT-000124

**Objetivo:** GET `/cotacoes/:id` retorna `historico_aprovado` e `historico_propostas_recebidas` filtrados pelo matching do termômetro (FCL container, exclusão da cotação atual).

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F01** | GET cotação FCL 40HC com histórico misto (40HC + 20GP) | 200 + `historico_aprovado` só com 40HC compatível |
| **F02** | Mesma resposta | `historico_propostas_recebidas` sem cotação atual e sem 20GP |
| **F03** | Parse Zod no body | `parseHistoricoTermometroListaFromServer` aceita arrays da resposta |
