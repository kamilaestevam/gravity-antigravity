// server/src/routes/importacao-pedido-wrapper.ts
//
// Wrapper local que monta o `importacaoRouter` compartilhado (processos-core)
// com gating granular `pedido:lista:editar` aplicado via `router.use(...)`.
//
// Por que existe:
//   `processos-core/routes/importacao.ts` é compartilhado entre Pedido e
//   Processo (e potencialmente outros). Não podemos embutir gating de
//   um produto específico lá — viola a regra de pacote reusável.
//
//   Solução: cada produto cria seu wrapper local que aplica seu próprio gating.
//   Aqui no Pedido: `pedido:lista:editar` (POST /importar, /importar/confirmar,
//   /exportar — todas mutações).
//
// Decisão Líder Técnico 2026-05-13 — opção (A) do refator de gating: gating
// dentro do router (não no app.use), evita bug de middleware chain do Express.

import { Router } from 'express'
import { importacaoRouter } from '../../../../processos-core/src/routes/importacao.js'
import { exigirPermissao } from '../permissoes.js'

export const importacaoPedidoWrapper = Router()

// Gating local — todas as 3 rotas do importacaoRouter são POST (mutação).
importacaoPedidoWrapper.use(exigirPermissao('lista', 'editar'))

// Re-monta o router compartilhado sob este wrapper.
importacaoPedidoWrapper.use('/', importacaoRouter)
