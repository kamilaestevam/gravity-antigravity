# Condições de plataforma — fornecedor (BID Frete Internacional)

> **SSOT de conteúdo:** `servicos-global/produto/bid-frete-internacional/shared/condicoes-plataforma-fornecedor-bid-frete-internacional.ts`  
> **Página pública (sem login):** `/bid-frete/visao-fornecedor-bid-frete-internacional/condicoes-plataforma`  
> **E-mail de disparo:** tag de aviso inserida entre a tabela de resumo e o botão «Responder cotação».

---

## Natureza jurídica (TASK-000411)

O conteúdo da página pública é um **documento legal formal**: «Aviso de Condições Comerciais — Fornecedores», de natureza **informativa pré-contratual** (dever de informação / boa-fé objetiva — art. 422 do Código Civil). Pontos-chave:

- **Não constitui contrato, proposta vinculante ou oferta** (arts. 427 e ss. do CC). O contrato («li e aceito») é celebrado **apenas no Fechamento** do frete, entre partes plenamente identificadas (art. 107 do CC + art. 10, § 2º, da MP 2.200-2/2001).
- **Envio de proposta = declaração de ciência** (registrada com data/hora), não aceite de contrato — nenhuma obrigação de pagamento nasce nesse momento.
- **USD é só indexador** (Lei nº 14.286/2022): cobrança em BRL, conversão PTAX venda do dia útil anterior à emissão da cobrança.
- **Atraso > 5 dias corridos** no boleto → suspensão do acesso do fornecedor até quitação (art. 476 do CC); não cancela taxas já geradas.
- **Confidencialidade do solicitante vale só na fase de cotação** — no Fechamento a identidade é revelada e o contrato é celebrado normalmente.
- **LGPD** (Lei nº 13.709/2018, art. 7º, V) cobre o tratamento dos dados de contato do fornecedor.
- **Versionamento obrigatório:** constantes `VERSAO_*` e `DATA_VIGENCIA_*` no SSOT; alterações não retroagem (vale a versão vigente na data do envio da proposta).

Estrutura: 12 seções (`SECOES_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL`): 1. Natureza · 2. Definições · 3. Gratuidade · 4. Taxa de Fechamento · 5. Forma de cobrança · 6. Atraso de pagamento e suspensão · 7. Momento da contratação · 8. Declaração de ciência · 9. Confidencialidade do Solicitante · 10. Proteção de dados pessoais · 11. Relação empresarial · 12. Atualizações.

> ⚠️ Texto redigido por agente — validar com assessoria jurídica antes de alterações de mérito. Mudanças de conteúdo exigem incrementar `VERSAO_*` e `DATA_VIGENCIA_*`.

---

## Resumo comercial

| Etapa | Cobrança |
|-------|----------|
| Receber convite, abrir link e enviar proposta | **Gratuito** |
| Cliente fecha o frete com o fornecedor na plataforma | **USD 10,00** (success fee) — indexado em USD, cobrado em BRL (PTAX venda D-1 da emissão) |

**Forma de cobrança:** boleto mensal — taxas de fechamento do mês consolidadas em um único boleto, detalhando cotação e valor. Atraso superior a 5 dias corridos suspende o acesso até a quitação.

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
