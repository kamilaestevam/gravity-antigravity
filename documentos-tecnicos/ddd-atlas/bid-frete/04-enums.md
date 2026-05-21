# Atlas DDD — BID Frete Internacional — Aba 4: Enums

> Mapeamento DDD dos 11 enums do fragment.prisma.
> Regras aplicadas: REGRA 07 (PascalCase PT-BR, valores UPPER_SNAKE), REGRA 12 (@@map obrigatorio).

## Como ler

- **Nome atual (legado)**: nome do enum como esta hoje no fragment.prisma.
- **Nome DDD**: nome final apos refatoracao DDD (PascalCase, `BidFreteInternacional<Atributo>`).
- **@@map DDD**: valor do `@@map("...")` obrigatorio.
- **Valores Prisma**: lista de valores UPPER_SNAKE_CASE.
- **Usado em models**: models Prisma que referenciam o enum.
- **Descricao**: significado do enum.

## Tabela (11 enums)

| Nome atual (legado) | Nome DDD | @@map DDD | Valores Prisma | Usado em models | Descricao |
|---|---|---|---|---|---|
| BidFreteTipoOperacao | BidFreteInternacionalTipoOperacao | `bid_frete_internacional_tipo_operacao` | IMPORTACAO, EXPORTACAO | BidFreteInternacionalCotacao | Tipo de operacao comercial (importacao ou exportacao) |
| BidFreteModalidade | BidFreteInternacionalModalidade | `bid_frete_internacional_modalidade` | MARITIMO, AEREO, RODOVIARIO | BidFreteInternacionalCotacao, BidFreteInternacionalTabelaValor | Modal de transporte |
| BidFreteCargaModalidade | BidFreteInternacionalModalidadeCarga | `bid_frete_internacional_modalidade_carga` | FCL, LCL, AEREO_GERAL, RODOVIARIO_FTL, RODOVIARIO_LTL | BidFreteInternacionalCotacao, BidFreteInternacionalTabelaValor | Tipo de carga por modal |
| BidFreteCotacaoStatus | BidFreteInternacionalStatusCotacao | `bid_frete_internacional_status_cotacao` | RASCUNHO, ENVIADA_FORNECEDORES, EM_COTACAO, AGUARDANDO_APROVACAO, APROVADA, REPROVADA, CANCELADA, FALTA_INFORMACAO, EXPIRADA | BidFreteInternacionalCotacao | Status do ciclo de vida da cotacao |
| BidFreteCotacaoFreteIntCanal | BidFreteInternacionalCanalDisparo | `bid_frete_internacional_canal_disparo` | EMAIL, WHATSAPP, API, PORTAL | BidFreteInternacionalPedidoCotacao | Canal de envio do pedido de cotacao ao fornecedor |
| BidFreteCotacao | BidFreteInternacionalStatusPedidoCotacao | `bid_frete_internacional_status_pedido_cotacao` | PENDENTE, ENVIADO, VISUALIZADO, RESPONDIDO, EXPIRADO, ERRO_ENVIO | BidFreteInternacionalPedidoCotacao | Status do disparo de cotacao para um fornecedor |
| BidFretePropostaStatus | BidFreteInternacionalStatusProposta | `bid_frete_internacional_status_proposta` | RECEBIDA, EM_ANALISE, MELHOR_PRECO, MELHOR_TRANSIT, MELHOR_AVALIACAO, APROVADA, REPROVADA | BidFreteInternacionalProposta | Status da proposta/resposta do fornecedor |
| BidFreteTipoFornecedor | BidFreteInternacionalTipoFornecedor | `bid_frete_internacional_tipo_fornecedor` | AGENTE_CARGA, ARMADOR, CIA_AEREA, TRANSPORTADORA | BidFreteInternacionalFornecedor | Categoria do fornecedor de frete |
| BidFreteStatusFornecedor | BidFreteInternacionalStatusFornecedor | `bid_frete_internacional_status_fornecedor` | ATIVO, INATIVO, PENDENTE_APROVACAO, BLOQUEADO | BidFreteInternacionalFornecedor | Status cadastral do fornecedor |
| BidFreteCotacaoVisibilidade | BidFreteInternacionalVisibilidade | `bid_frete_internacional_visibilidade` | DIRECIONADA, ABERTA | BidFreteInternacionalCotacao | Se a cotacao e direcionada (convite) ou aberta (qualquer fornecedor) |
| BidFreteIntegracao | BidFreteInternacionalTipoIntegracao | `bid_frete_internacional_tipo_integracao` | API_REST, API_SOAP, ODATA, MANUAL | BidFreteInternacionalIntegracao | Tipo de conector externo do fornecedor ou ERP |

## Valores por Enum (detalhamento)

### BidFreteInternacionalStatusCotacao

| Valor | Label UI | Cor badge | E default? | Descricao |
|---|---|---|---|---|
| RASCUNHO | Rascunho | default | Sim | Cotacao em edicao, nao enviada |
| ENVIADA_FORNECEDORES | Enviada ao fornecedor | info | Nao | Disparada para fornecedores, aguardando respostas |
| EM_COTACAO | Em cotacao | info | Nao | Pelo menos uma resposta recebida |
| AGUARDANDO_APROVACAO | Aprovacao pendente | warning | Nao | Respostas analisadas, aguardando decisao |
| APROVADA | Aprovada | success | Nao | Fornecedor vencedor definido |
| REPROVADA | Reprovada | danger | Nao | Todas as propostas rejeitadas |
| CANCELADA | Cancelada | default | Nao | Cotacao cancelada pelo usuario |
| FALTA_INFORMACAO | Falta de informacao | warning | Nao | Dados incompletos, aguardando complemento |
| EXPIRADA | Expirada | default | Nao | Prazo de resposta vencido |

### BidFreteInternacionalStatusProposta

| Valor | Label UI | Cor badge | E default? | Descricao |
|---|---|---|---|---|
| RECEBIDA | Recebida | info | Sim | Proposta recebida, nao analisada |
| EM_ANALISE | Em analise | warning | Nao | Proposta sendo avaliada |
| MELHOR_PRECO | Melhor preco | success | Nao | Menor valor total entre as propostas |
| MELHOR_TRANSIT | Melhor transit | success | Nao | Menor tempo de transito |
| MELHOR_AVALIACAO | Melhor avaliacao | success | Nao | Fornecedor com melhor rating |
| APROVADA | Aprovada | success | Nao | Proposta aceita pelo usuario |
| REPROVADA | Reprovada | danger | Nao | Proposta rejeitada |

### BidFreteInternacionalStatusPedidoCotacao

| Valor | Label UI | Cor badge | E default? | Descricao |
|---|---|---|---|---|
| PENDENTE | Pendente | default | Sim | Aguardando envio |
| ENVIADO | Enviado | info | Nao | Mensagem enviada ao fornecedor |
| VISUALIZADO | Visualizado | info | Nao | Fornecedor abriu o link/email |
| RESPONDIDO | Respondido | success | Nao | Fornecedor enviou proposta |
| EXPIRADO | Expirado | default | Nao | Prazo de resposta vencido |
| ERRO_ENVIO | Erro de envio | danger | Nao | Falha no envio (email bounce, WhatsApp invalido) |
