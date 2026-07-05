# DDD — Visão Fornecedor BID Frete Internacional

> **Identificador fixo:** `visao_fornecedor_bid_frete_internacional`  
> Tudo exclusivo do fornecedor logado usa este namespace (API, SPA, i18n, types, schemas Zod).  
> Entidades de domínio compartilhadas (`FornecedorBidFreteInternacional`, `DisparoCotacaoBidFreteInternacional`, `PropostaBidFreteInternacional`) **não** recebem o prefixo.

---

## API (autenticada)

Prefixo: `/api/v1/bid-frete-internacional/visao-fornecedor-bid-frete-internacional`

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/dashboard` | KPIs + classificação |
| GET | `/cotacoes-pendentes` | Disparos aguardando proposta |
| GET | `/propostas` | Histórico de propostas |
| POST | `/responder/:id_disparo_cotacao_bid_frete_internacional` | Enviar proposta |
| GET | `/desempenho` | Classificação + avaliações |
| GET | `/cobranca` | Resumo monetização |
| GET/POST/PUT/DELETE | `/tabelas-valor` | CRUD self-service (sem `:id_fornecedor` na URL) |

Arquivo: `server/src/routes/visao-fornecedor-bid-frete-internacional.ts`

Auth: `x-id-usuario` (Clerk) → lookup `fornecedor_bid_frete_internacional.id_clerk_usuario`.

---

## API (pública — token)

Prefixo: `/api/v1/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/publico`

| Método | Path |
|--------|------|
| GET | `/:token_resposta_disparo_cotacao_bid_frete_internacional` |
| POST | `/:token_resposta_disparo_cotacao_bid_frete_internacional/responder` |

Arquivo: `server/src/routes/visao-fornecedor-bid-frete-internacional-publico.ts`

---

## SPA (React Router)

Base: `/visao-fornecedor-bid-frete-internacional`

| Rota | Página |
|------|--------|
| `/dashboard` | `visao-fornecedor-bid-frete-internacional-dashboard.tsx` |
| `/cotacoes-pendentes` | `...-cotacoes-pendentes.tsx` |
| `/propostas` | `...-propostas.tsx` |
| `/tabelas-valor` | `...-tabelas-valor.tsx` |
| `/desempenho` | `...-desempenho.tsx` |
| `/responder/:id_disparo_cotacao_bid_frete_internacional` | `...-responder-cotacao.tsx` |
| `/publico/:token_resposta_disparo_cotacao_bid_frete_internacional` | `...-responder-publico.tsx` |

Redirect legado: `/portal/*` → `/visao-fornecedor-bid-frete-internacional/dashboard`

Nav dedicada: `PRODUCT_CONFIG.navigation_visao_fornecedor_bid_frete_internacional` (ativa quando URL contém `visao-fornecedor-bid-frete-internacional`).

---

## Contratos JSON (wrapper obrigatório)

### Dashboard

```json
{
  "visao_fornecedor_bid_frete_internacional": {
    "fornecedor_bid_frete_internacional": { "id_fornecedor_bid_frete_internacional", "nome_fornecedor_bid_frete_internacional", "tipo_fornecedor_bid_frete_internacional" },
    "metricas_visao_fornecedor_bid_frete_internacional": {
      "cotacoes_pendentes_visao_fornecedor_bid_frete_internacional": 0,
      "propostas_enviadas_visao_fornecedor_bid_frete_internacional": 0,
      "propostas_aprovadas_visao_fornecedor_bid_frete_internacional": 0,
      "disparos_recebidos_visao_fornecedor_bid_frete_internacional": 0,
      "taxa_resposta_visao_fornecedor_bid_frete_internacional": "0",
      "taxa_aprovacao_visao_fornecedor_bid_frete_internacional": "0"
    },
    "classificacao_bid_frete_internacional": { }
  }
}
```

### Público GET

```json
{
  "visao_fornecedor_bid_frete_internacional_publico": {
    "disparo_cotacao_bid_frete_internacional": { "cotacao": { }, "fornecedor": { } }
  }
}
```

Schema Zod front: `client/src/shared/visao-fornecedor-bid-frete-internacional-schemas.ts`

---

## i18n

Namespace: `bidfrete.visao_fornecedor_bid_frete_internacional.*`  
Público: `bidfrete.visao_fornecedor_bid_frete_internacional_publico.*`

---

## Link de e-mail (disparo)

`motor-bid-disparo-utils.ts` →  
`/produto/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/publico/{token}`

---

## Termos proibidos na visão fornecedor

| Legado | Canônico |
|--------|----------|
| `portal` | `visao_fornecedor_bid_frete_internacional` |
| `bidRequest` | `disparo_cotacao_bid_frete_internacional` |
| `respostas` | `propostas_bid_frete_internacional` |
| `TabelaPreco` | `TabelaBidFreteInternacional` |
| `rating` (payload) | `classificacao_bid_frete_internacional` |

Campo Prisma `via_portal_proposta_bid_frete_internacional` permanece (flag histórica = proposta via visão fornecedor autenticada).

---

## Serviços compartilhados

- `server/src/services/enviar-proposta-disparo-bid-frete-internacional.ts` — cria proposta + atualiza disparo/cotação (auth + público)

---

## Resposta — locais opcionais (TASK-000405)

Quando a cotação tem portos/aeroportos alternativos (`habilitar_opcao_*` + `codigos_opcao_*`), o fornecedor **deve** informar qual local utiliza na proposta.

### Exibição (detalhes da cotação)

`SecaoDetalhesCotacaoResposta` (`formulario-resposta-cotacao-bid-frete-internacional.tsx`) lista as opções abaixo da rota principal — paridade com o card Rota do comprador.

### Seleção obrigatória (formulário)

| Campo POST | Obrigatório quando |
|------------|-------------------|
| `codigo_porto_aeroporto_origem_proposta_bid_frete_internacional` | `exigeSelecaoLocalFornecedorRespostaBidFrete(cotacao, 'origem')` |
| `codigo_porto_aeroporto_destino_proposta_bid_frete_internacional` | Idem `'destino'` |

Elegíveis = local principal da cotação + códigos opcionais (dedupe). UI: `SelectGlobal` buscável no topo de **Sua Proposta**. Validação client: `obterErroValidacaoFormularioRespostaCotacao`; server: `validar-locais-proposta-resposta-bid-frete-internacional.ts`.

### Persistência do local escolhido

Sem coluna nova na proposta — serialização em `observacoes_proposta_bid_frete_internacional` via marcador estruturado:

```
__GRAVITY_BID_LOCAIS__{"codigo_porto_aeroporto_origem_proposta_bid_frete_internacional":"BRSSZ"}__GRAVITY_BID_LOCAIS__
```

SSOT: `shared/local-proposta-resposta-bid-frete-internacional.ts` (`serializarLocaisPropostaObservacoes`, `parseObservacoesPropostaComLocais`). Edição de proposta repopula os selects via `propostaToEstadoFormularioResposta`.

### Select da cotação no GET disparo

`COTACAO_SELECT_RESPOSTA_FORNECEDOR` em `enriquecer-disparo-resposta-fornecedor-bid-frete-internacional.ts` inclui `habilitar_opcao_*`, `codigos_opcao_*` e campos de porto/aeroporto principal.

### Páginas

| Contexto | Arquivo |
|----------|---------|
| Token público | `visao-fornecedor-bid-frete-internacional-responder-publico.tsx` — prop `cotacaoLocais={cotacao}` |
| Auth | `visao-fornecedor-bid-frete-internacional-responder-cotacao.tsx` — idem |

Schema Zod POST: `server/src/schemas/enviar-proposta-bid-frete-internacional-schema.ts`.
