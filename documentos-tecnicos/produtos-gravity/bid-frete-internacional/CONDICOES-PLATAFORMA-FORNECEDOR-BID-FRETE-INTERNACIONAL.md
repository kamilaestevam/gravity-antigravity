# Condições de plataforma — fornecedor (BID Frete Internacional)

> **SSOT de conteúdo:** `servicos-global/produto/bid-frete-internacional/shared/condicoes-plataforma-fornecedor-bid-frete-internacional.ts`  
> **Página pública (sem login):** `/bid-frete/visao-fornecedor-bid-frete-internacional/condicoes-plataforma`  
> **E-mail de disparo:** tag de aviso inserida entre a tabela de resumo e o botão «Responder cotação».

---

## Resumo comercial

| Etapa | Cobrança |
|-------|----------|
| Receber convite, abrir link e enviar proposta | **Gratuito** |
| Cliente fecha o frete com o fornecedor na plataforma | **USD 10,00** (success fee) |

**Forma de cobrança:** boleto mensal — taxas de fechamento do mês consolidadas em um único boleto, detalhando cotação e valor.

---

## Texto do e-mail de disparo

### Nome da empresa visível (`anonima_cotacao_bid_frete_internacional = false`)

> **[nome da empresa]** selecionou você para uma cotação de frete internacional. Confira o resumo abaixo e envie sua proposta pelo botão.

### Nome oculto (`anonima_cotacao_bid_frete_internacional = true`)

> Um cliente (**que preferiu ficar oculto para a cotação**) selecionou você para uma cotação de frete internacional. Confira o resumo abaixo e envie sua proposta pelo botão.

### Tag de destaque (entre tabela e botão)

Caixa amarela (destaque médio) com:

- Cotação gratuita na plataforma — nada é cobrado para participar e enviar proposta.
- Taxa de **USD 10,00** se o cliente fechar o frete com a empresa do fornecedor.
- Link **«Leia aqui as condições»** → página pública acima.

---

## Implementação

| Peça | Caminho |
|------|---------|
| Intro + tag HTML | `shared/formatar-email-disparo-bid-frete-internacional.ts` |
| Conteúdo das condições | `shared/condicoes-plataforma-fornecedor-bid-frete-internacional.ts` |
| Página pública | `client/src/pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-condicoes-plataforma-bid-frete-internacional.tsx` |
| Rota (sem auth) | `client/src/App.tsx` — bloco `isPaginaPublicaFornecedor` |
| Aviso de aceite no formulário | `client/src/shared/formulario-resposta-cotacao-bid-frete-internacional.tsx` — `.brc-aceite-condicoes` acima do botão Enviar Proposta (público e logado) |

---

## Testes

- `testes/testes-unitarios/produto-gravity/bid-frete-internacional/formatar-email-disparo-bid-frete-internacional.test.ts` — intro visível/oculta + tag USD 10,00 + link condições.
