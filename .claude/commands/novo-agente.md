# /novo-agente — Registrar referência sequencial do agente

> **SSOT:** espelho de `.cursor/commands/novo-agente.md` — alterar nos dois lugares.
> **Registry:** `documentos-tecnicos/processos/registro-agentes.json`
> **Convenção de título:** `documentos-tecnicos/processos/convencao-titulos-agente.md`
> **Este comando existe porque conversas e subagentes não tinham referência humana sequencial para rastrear, citar e auditar sessões.**

---

## Quando invocado

Ao **abrir ou iniciar** uma conversa nova (ou quando o dono pedir referência), o agente **PARA** e executa as etapas **0 → 5 nesta ordem**, sem pular.

**Entrada do dono (recomendada na mesma mensagem):**

```
/novo-agente {TIPO_SESSAO} {LOCAL} [{AREA}] {TIPO_ENTREGA} {RESUMO...}
```

Exemplos:

```
/novo-agente ANA BIDFRT BUG ERRO-ABERTURA-COTACAO
/novo-agente ANA BIDFRT LISTA BUG ERRO-ABERTURA-COTACAO
/novo-agente PLN PEDIDO NOV FILTRO-MULTI-WORKSPACE
```

Se faltar segmento obrigatório → perguntar **uma vez** com a lista fechada (ver convenção).

---

## ETAPA 0 — Skills e convenção (ler antes de registrar)

1. `skills/governanca/lei/agent-policy/SKILL.md`
2. `documentos-tecnicos/processos/convencao-titulos-agente.md`

---

## ETAPA 1 — Ler o registry (obrigatório)

1. Ler `documentos-tecnicos/processos/registro-agentes.json`
2. Validar que `proximo_numero` é inteiro ≥ 264
3. Se o arquivo não existir ou estiver corrompido → **parar** e avisar o dono (não inventar número)

---

## ETAPA 2 — Montar e validar o título canônico

1. Montar string: `{TIPO_SESSAO}-{LOCAL}(-{AREA})?-{TIPO_ENTREGA}-{RESUMO}`
2. Validar contra tabelas fechadas da convenção (LOCAL = mesma tabela TST)
3. Se inválido → corrigir com o dono ou **parar** (não gravar título fora do padrão)

**Título de exibição** (opcional, derivado):

```
{TIPO_SESSAO} [{LOCAL legível}] {TIPO_ENTREGA} — {resumo humano 3–8 palavras}
```

---

## ETAPA 3 — Alocar e persistir

1. `numero_atual` ← `proximo_numero`
2. `referencia` ← `AGT-` + 6 dígitos (ex.: `264` → `AGT-000264`)
3. Incrementar `proximo_numero` em **+1**
4. Acrescentar em `entradas`:

```json
{
  "referencia": "AGT-000264",
  "numero": 264,
  "titulo_canonico": "ANA-BIDFRT-BUG-ERRO-ABERTURA-COTACAO",
  "titulo_exibicao": "ANA [BID Frete] BUG — Erro abertura cotação",
  "tipo_sessao": "ANA",
  "local": "BIDFRT",
  "area": null,
  "tipo_entrega": "BUG",
  "resumo": "ERRO-ABERTURA-COTACAO",
  "data_registro": "<ISO-8601 UTC>",
  "tipo": "conversa_principal",
  "id_transcript": null
}
```

5. **Gravar** o JSON atualizado

**Regra:** cada invocação consome **exatamente um** número. Nunca reutilizar.

---

## ETAPA 4 — Título (se pendente)

Se segmentos obrigatórios faltarem, perguntar **uma vez**:

> «Monte o título: `{TIPO_SESSAO}` + `{LOCAL}` + `{TIPO_ENTREGA}` + `{RESUMO}` — ex.: `ANA BIDFRT BUG ERRO-ABERTURA-COTACAO`»

Tabelas rápidas:

- **TIPO_SESSAO:** `ANA` `PLN` `IMP` `RSP` `REV` `DOC` `TST` `OPS` `GOV`
- **TIPO_ENTREGA:** `BUG` `MEL` `NOV` `REF` `AUD` `CFG` `DUV`
- **LOCAL:** ver convenção (paridade TST: `BIDFRT`, `BIDCAM`, `PEDIDO`, `CONFIG`, `LOGIN`, …)

---

## ETAPA 5 — Veredito final (formato fixo)

```
## Novo agente registrado

**Referência:** AGT-000264
**Título canônico:** ANA-BIDFRT-BUG-ERRO-ABERTURA-COTACAO
**Exibição:** ANA [BID Frete] BUG — Erro abertura cotação
**Próximo número:** AGT-000265

Citação: AGT-000264 | ANA-BIDFRT-BUG-ERRO-ABERTURA-COTACAO
Markdown: [ANA BID-FRETE bug cotação](AGT-000264)
```

**Regras de uso:**

- Commits/docs: `AGT-NNNNNN | {titulo_canonico}`
- Subagentes: `AGT-000264 › subagente Explore` (não consomem número)
- Sessão que gera teste: cruzar `AGT-… → TST-…` no mesmo commit/doc
- Legado 1–263: sem título canônico; a partir de 264 o padrão é obrigatório

---

## Proibido

- Emitir referência sem ler/atualizar `registro-agentes.json`
- Título fora da convenção (siglas inventadas, `[BID-F]` no canônico, minúsculas no RESUMO)
- Pular incremento ou reutilizar número
- Registry paralelo em outro caminho
