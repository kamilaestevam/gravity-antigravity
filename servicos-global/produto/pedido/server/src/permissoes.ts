// server/src/permissoes.ts
//
// Instância ÚNICA de `exigirPermissao` para o produto Pedido.
//
// Por que existe:
//   Quando o gating está em `router.use(exigirPermissao(...))` dentro de cada
//   router (decisão arquitetural 2026-05-13 — opção A do Líder Técnico), cada
//   router precisa da função `exigirPermissao` configurada. Sem este módulo,
//   cada router instanciaria seu próprio `criarRequirePermissao` (duplicação
//   de config: CONFIGURATOR_URL, CHAVE_INTERNA_SERVICO, flag env, cache).
//
// Aqui criamos UMA instância (singleton de módulo) e exportamos `exigirPermissao`
// e `exigirPorMetodo`. Cada router importa daqui — config centralizada, cache
// compartilhado entre routers do MESMO produto.
//
// Pattern recomendado em `seguranca/permissoes/SKILL.md` (regra "Composição
// de middleware" — gating mora no router, não no app.use).
//
// ───────────────────────────────────────────────────────────────────────────
// LAZY INIT — Mandamento 05 + 08 (Líder Técnico 2026-05-14):
//
// Anteriormente: `criarRequirePermissao({ configuradorBaseUrl: process.env.X! })`
// rodava em TEMPO DE IMPORT no top-level. Em ESM, todos os imports são
// resolvidos ANTES do código top-level do `index.ts` executar — incluindo o
// `dotenv.config()`. Resultado: a config era congelada com `baseUrl=undefined`
// e toda rota autenticada caía em 503 "Configurador indisponível".
//
// Correção: criar o middleware sob demanda na primeira request via getter
// memoizado. Quando a request chega, `process.env` JÁ está populado pelo
// dotenv. Bonus: se a env var faltar, falha RUIDOSA na 1ª request (Mand. 08),
// não engole o problema com `!` ou `?? ''`.
// ───────────────────────────────────────────────────────────────────────────

import type { RequestHandler } from 'express'
import { criarRequirePermissao, type ConfigCriarRequirePermissao } from '@gravity/resolver-organizacao'
import { securityAudit } from '../../../../../servicos-global/servicos-plataforma/historico-global/server/lib/securityAuditLogger.js'

/** Tipo do callback onShadowDeny extraído da config — necessário p/ rootDir. */
type ShadowDenyInfo = Parameters<NonNullable<ConfigCriarRequirePermissao['onShadowDeny']>>[0]

/** Tipo da função retornada por `criarRequirePermissao` — para tipar o cache. */
type ExigirPermissaoFn = ReturnType<typeof criarRequirePermissao>

/**
 * Singleton lazy. `undefined` até a 1ª request chamar `obterExigirPermissao()`,
 * momento em que `process.env` já está populado pelo `dotenv.config()` do
 * `index.ts`.
 */
let _instancia: ExigirPermissaoFn | undefined

/**
 * Cria (uma única vez) a instância de `criarRequirePermissao`. Falha ruidosa
 * se `CONFIGURATOR_URL` ou `CHAVE_INTERNA_SERVICO` faltar — não engole o
 * problema com `!` ou `?? ''`. Mand. 05 + 08.
 */
function obterExigirPermissao(): ExigirPermissaoFn {
  if (_instancia) return _instancia

  const configuradorBaseUrl = process.env.CONFIGURATOR_URL
  const chaveInterna = process.env.CHAVE_INTERNA_SERVICO

  if (!configuradorBaseUrl) {
    throw new Error(
      '[pedido/permissoes] CONFIGURATOR_URL ausente — verifique .env.local e o ' +
      'script "dev" do package.json (deve usar --env-file=...). ' +
      'Sem essa variável o middleware de permissões não consegue chamar o Configurador.',
    )
  }
  if (!chaveInterna) {
    throw new Error(
      '[pedido/permissoes] CHAVE_INTERNA_SERVICO ausente — verifique .env.local. ' +
      'Sem essa chave a autenticação S2S com o Configurador falha.',
    )
  }

  _instancia = criarRequirePermissao({
    chaveProduto:        'pedido',
    configuradorBaseUrl,
    chaveInterna,
    flagAtivaEnvName:    'PEDIDO_PERMISSOES_GRANULARES_ATIVO',
    onShadowDeny: (info: ShadowDenyInfo) => {
      // Audit do "rotaria 403 mas flag está OFF" — visibilidade do blast radius
      // antes de ligar a flag em prod. Fire-and-forget.
      void securityAudit.permissionDenied(info.idOrganizacao, info.idUsuario, {
        id_usuario_alvo:       info.idUsuario,
        slug_produto_gravity:  info.slugProduto,
        secao_produto:         info.secao,
        acao_produto:          info.acao as 'ver' | 'editar',
        rota_negada:           info.rota,
        metodo_http:           info.metodo,
      }).catch(() => { /* fire-and-forget */ })
    },
  })

  return _instancia
}

/**
 * `exigirPermissao(secao, acao)` — middleware que bloqueia 403 se a permissão
 * `pedido:<secao>:<acao>` faltar (Master/SAdmin/Admin bypass via Mand. 04).
 *
 * Feature flag `PEDIDO_PERMISSOES_GRANULARES_ATIVO`:
 *   - default (variável ausente ou !== 'false') → ATIVO, retorna 403
 *   - 'false' → shadow audit (log "rotaria 403" mas libera)
 *
 * Cache 30s por (usuario, workspace, slug, secao, acao). Cross-replica: cache
 * por processo. Padrão consistente com `requireAuth` do Configurador.
 *
 * NOTA: o middleware concreto é criado LAZY na 1ª request. Não tenta acessar
 * `process.env.CONFIGURATOR_URL` em tempo de import.
 */
export function exigirPermissao(secao: string, acao: 'ver' | 'editar'): RequestHandler {
  return (req, res, next) => obterExigirPermissao()(secao, acao)(req, res, next)
}

/**
 * Helper local — escolhe ver/editar conforme método HTTP:
 *   - GET, HEAD     → 'ver'
 *   - POST, PUT,
 *     PATCH, DELETE → 'editar'
 * Aplicável a routers que misturam leitura e mutação no mesmo path.
 */
export function exigirPorMetodo(secao: string): RequestHandler {
  return (req, res, next) => {
    const acao: 'ver' | 'editar' =
      req.method === 'GET' || req.method === 'HEAD' ? 'ver' : 'editar'
    return exigirPermissao(secao, acao)(req, res, next)
  }
}
