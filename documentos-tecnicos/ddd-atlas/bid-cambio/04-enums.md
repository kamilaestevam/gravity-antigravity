# Atlas DDD — BID Cambio — Aba 4: Enums

> Mapeamento DDD dos 12 enums do fragment.prisma.
> Regras aplicadas: REGRA 07 (PascalCase PT-BR, valores UPPER_SNAKE), REGRA 12 (@@map obrigatorio).

## Como ler

- **Nome atual (legado)**: nome do enum antes da refatoracao DDD.
- **Nome DDD**: nome final apos refatoracao DDD (PascalCase, `BidCambio<Atributo>`).
- **@@map DDD**: valor do `@@map("...")` obrigatorio.
- **Valores Prisma**: lista de valores UPPER_SNAKE_CASE.
- **Usado em models**: models Prisma que referenciam o enum.
- **Descricao**: significado do enum.

## Tabela (12 enums)

| Nome atual (legado) | Nome DDD | @@map DDD | Valores Prisma | Usado em models | Descricao |
|---|---|---|---|---|---|
| CambioTipoOperacao | BidCambioTipoOperacao | `CambioTipoOperacao` | IMPORTACAO, EXPORTACAO | BidCambioCotacao | Tipo de operacao comercial (importacao ou exportacao) |
| CambioModalidade | BidCambioModalidade | `CambioModalidade` | PRONTO, FUTURO | BidCambioCotacao | Modalidade de contratacao do cambio (pronto ou futuro) |
| CambioLiquidacao | BidCambioLiquidacao | `CambioLiquidacao` | D0, D1, D2 | BidCambioCotacao, BidCambioRespostaCotacao | Prazo de liquidacao financeira (D+0, D+1, D+2) |
| CambioMoeda | BidCambioMoeda | `CambioMoeda` | USD, EUR, GBP, CHF, BRL, CNY, JPY | BidCambioParcela, BidCambioCotacao, BidCambioGanho | Moeda estrangeira da operacao |
| CambioParcelaStatus | BidCambioStatusParcela | `CambioParcelaStatus` | PENDENTE, AGENDADO, PAGO | BidCambioParcela | Status do ciclo de vida da parcela de cambio |
| CambioCotacaoStatus | BidCambioStatusCotacao | `CambioCotacaoStatus` | RASCUNHO, ENVIADA_CORRETORAS, EM_COTACAO, AGUARDANDO_APROVACAO, APROVADA, REPROVADA, CANCELADA, EXPIRADA | BidCambioCotacao | Status do ciclo de vida da cotacao de cambio |
| CambioDisparoCanal | BidCambioCanalDisparo | `CambioDisparoCanal` | EMAIL, PORTAL | BidCambioDisparoCotacao | Canal de envio do disparo de cotacao a corretora |
| CambioStatusCotacoes | BidCambioStatusDisparoCotacao | `CambioStatusCotacoes` | PENDENTE, ENVIADO, VISUALIZADO, RESPONDIDO, EXPIRADO, ERRO_ENVIO | BidCambioDisparoCotacao | Status do disparo de cotacao para uma corretora |
| StatusBidResponseCambio | BidCambioStatusRespostaCotacao | `StatusBidResponseCambio` | RECEBIDA, EM_ANALISE, MELHOR_TAXA, MELHOR_SPREAD, MELHOR_AVALIACAO, APROVADA, REPROVADA | BidCambioRespostaCotacao | Status da resposta/proposta da corretora |
| CambioCorretoraTipo | BidCambioTipoCorretora | `CambioCorretoraTipo` | CORRETORA_CAMBIO, BANCO_COMERCIAL, BANCO_CAMBIO, FINTECH | BidCambioCorretora | Categoria da instituicao financeira |
| CambioCorretoraStatus | BidCambioStatusCorretora | `CambioCorretoraStatus` | ATIVA, INATIVA, BLOQUEADA | BidCambioCorretora | Status cadastral da corretora |
| CambioBaseVencimento | BidCambioBaseVencimento | `CambioBaseVencimento` | DATA_EMBARQUE, DATA_CHEGADA, DATA_REGISTRO_DI, DATA_DESEMBARACO, DATA_ENTREGA, PRONTIDAO_CARGA, DATA_FIXA | BidCambioParcela, BidCambioConfiguracaoParcela | Base de calculo para data de vencimento da parcela |

> **Nota — Colisao de @@map:** Os enums `BidCambioStatusDisparoCotacao` e `BidCambioStatusRespostaCotacao` possuem @@map distintos (`CambioStatusCotacoes` vs `StatusBidResponseCambio`) porque a planilha mestre DDD originalmente mapeava ambos para o mesmo nome. Como os valores sao 100% disjuntos, a separacao foi mantida.

## Valores por Enum (detalhamento)

### BidCambioStatusCotacao

| Valor | Label UI | Cor badge | E default? | Descricao |
|---|---|---|---|---|
| RASCUNHO | Rascunho | default | Sim | Cotacao em edicao, nao enviada |
| ENVIADA_CORRETORAS | Enviada as corretoras | info | Nao | Disparada para corretoras, aguardando respostas |
| EM_COTACAO | Em cotacao | info | Nao | Pelo menos uma resposta recebida |
| AGUARDANDO_APROVACAO | Aprovacao pendente | warning | Nao | Respostas analisadas, aguardando decisao |
| APROVADA | Aprovada | success | Nao | Corretora vencedora definida |
| REPROVADA | Reprovada | danger | Nao | Todas as propostas rejeitadas |
| CANCELADA | Cancelada | default | Nao | Cotacao cancelada pelo usuario |
| EXPIRADA | Expirada | default | Nao | Prazo de resposta vencido |

### BidCambioStatusRespostaCotacao

| Valor | Label UI | Cor badge | E default? | Descricao |
|---|---|---|---|---|
| RECEBIDA | Recebida | info | Sim | Resposta recebida, nao analisada |
| EM_ANALISE | Em analise | warning | Nao | Resposta sendo avaliada |
| MELHOR_TAXA | Melhor taxa | success | Nao | Menor taxa cambial entre as respostas |
| MELHOR_SPREAD | Melhor spread | success | Nao | Menor spread entre as respostas |
| MELHOR_AVALIACAO | Melhor avaliacao | success | Nao | Corretora com melhor classificacao |
| APROVADA | Aprovada | success | Nao | Resposta aceita pelo usuario |
| REPROVADA | Reprovada | danger | Nao | Resposta rejeitada |

### BidCambioStatusDisparoCotacao

| Valor | Label UI | Cor badge | E default? | Descricao |
|---|---|---|---|---|
| PENDENTE | Pendente | default | Sim | Aguardando envio |
| ENVIADO | Enviado | info | Nao | Mensagem enviada a corretora |
| VISUALIZADO | Visualizado | info | Nao | Corretora abriu o link/email |
| RESPONDIDO | Respondido | success | Nao | Corretora enviou proposta |
| EXPIRADO | Expirado | default | Nao | Prazo de resposta vencido |
| ERRO_ENVIO | Erro de envio | danger | Nao | Falha no envio (email bounce, erro de conexao) |

### BidCambioStatusParcela

| Valor | Label UI | Cor badge | E default? | Descricao |
|---|---|---|---|---|
| PENDENTE | Pendente | default | Sim | Parcela aguardando agendamento |
| AGENDADO | Agendado | info | Nao | Parcela com data de pagamento agendada |
| PAGO | Pago | success | Nao | Parcela liquidada |

### BidCambioTipoOperacao

| Valor | Label UI | Cor badge | E default? | Descricao |
|---|---|---|---|---|
| IMPORTACAO | Importacao | info | Sim | Compra de moeda estrangeira (pagamento ao exterior) |
| EXPORTACAO | Exportacao | success | Nao | Venda de moeda estrangeira (recebimento do exterior) |

### BidCambioModalidade

| Valor | Label UI | Cor badge | E default? | Descricao |
|---|---|---|---|---|
| PRONTO | Pronto | info | Sim | Fechamento imediato (spot) |
| FUTURO | Futuro | warning | Nao | Fechamento com data futura pre-acordada |

### BidCambioLiquidacao

| Valor | Label UI | Cor badge | E default? | Descricao |
|---|---|---|---|---|
| D0 | D+0 (mesmo dia) | success | Nao | Liquidacao no mesmo dia |
| D1 | D+1 (1 dia util) | info | Nao | Liquidacao em 1 dia util |
| D2 | D+2 (2 dias uteis) | default | Sim | Liquidacao em 2 dias uteis (padrao de mercado) |

### BidCambioMoeda

| Valor | Label UI | Cor badge | E default? | Descricao |
|---|---|---|---|---|
| USD | Dolar Americano (US$) | info | Sim | Moeda mais operada em comercio exterior |
| EUR | Euro (EUR) | info | Nao | Moeda da zona euro |
| GBP | Libra Esterlina (GBP) | info | Nao | Moeda do Reino Unido |
| CHF | Franco Suico (CHF) | info | Nao | Moeda da Suica |
| BRL | Real Brasileiro (R$) | default | Nao | Moeda local (usado como referencia) |
| CNY | Yuan Chines (CNY) | info | Nao | Moeda da China |
| JPY | Iene Japones (JPY) | info | Nao | Moeda do Japao |

### BidCambioTipoCorretora

| Valor | Label UI | Cor badge | E default? | Descricao |
|---|---|---|---|---|
| CORRETORA_CAMBIO | Corretora de cambio | info | Sim | Corretora especializada em cambio |
| BANCO_COMERCIAL | Banco comercial | default | Nao | Banco com mesa de cambio |
| BANCO_CAMBIO | Banco de cambio | info | Nao | Banco especializado em operacoes cambiais |
| FINTECH | Fintech | success | Nao | Empresa de tecnologia financeira |

### BidCambioStatusCorretora

| Valor | Label UI | Cor badge | E default? | Descricao |
|---|---|---|---|---|
| ATIVA | Ativa | success | Sim | Corretora ativa, elegivel para receber cotacoes |
| INATIVA | Inativa | default | Nao | Corretora desativada temporariamente |
| BLOQUEADA | Bloqueada | danger | Nao | Corretora bloqueada por violacao ou problema |

### BidCambioBaseVencimento

| Valor | Label UI | Cor badge | E default? | Descricao |
|---|---|---|---|---|
| DATA_EMBARQUE | Data de embarque | info | Nao | Vencimento calculado a partir da data de embarque |
| DATA_CHEGADA | Data de chegada | info | Nao | Vencimento calculado a partir da data de chegada |
| DATA_REGISTRO_DI | Data de registro da DI | info | Nao | Vencimento calculado a partir do registro da DI |
| DATA_DESEMBARACO | Data de desembaraco | info | Nao | Vencimento calculado a partir do desembaraco aduaneiro |
| DATA_ENTREGA | Data de entrega | info | Nao | Vencimento calculado a partir da entrega |
| PRONTIDAO_CARGA | Prontidao de carga | info | Nao | Vencimento calculado a partir da prontidao de carga |
| DATA_FIXA | Data fixa | default | Nao | Data de vencimento definida manualmente |
