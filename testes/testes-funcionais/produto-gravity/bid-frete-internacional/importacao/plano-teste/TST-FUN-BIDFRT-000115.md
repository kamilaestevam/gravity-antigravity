# Plano — TST-FUN-BIDFRT-000115

**ID:** TST-FUN-BIDFRT-000115

**Objetivo geral:** rota de download do template XLSX com listas Cadastros (Zod S2S + fallback).

---

### ETAPA 1 — GET importacao/template

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F01** | Cadastros mock OK | 200 + content-type XLSX + attachment |
| **F02** | Payload Cadastros inválido | 200 com template padrão (fallback) |
