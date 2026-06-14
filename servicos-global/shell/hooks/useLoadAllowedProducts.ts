// shell/hooks/useLoadAllowedProducts.ts
// Gating de produtos no sidebar (ponto de extensão).
//
// SEGURANÇA — 2026-06-14
// A versão anterior buscava GET /api/v1/internal/organizacao-produtos a partir do
// browser, enviando a chave interna S2S (VITE_CHAVE_INTERNA_SERVICO) embutida no
// bundle público e passando idOrganizacao por query param. Isso (a) expunha a
// credencial de serviço a qualquer um que abrisse o JS e (b) permitia ler os produtos
// de QUALQUER organização trocando o ID na URL (IDOR). Além disso, o shape da resposta
// (chave_produto_configuracao_produto_gravity / ativo_...) nunca bateu com o consumidor
// (product_key / is_active), então o gating sempre degradou para "permite tudo".
//
// Decisão do dono: manter o comportamento atual ("mostra tudo") e fechar a falha de
// segurança. A chamada com chave interna foi removida do browser — `productsLoaded`
// permanece false e isProductAllowed() retorna true para todos os produtos (permit-all),
// exatamente como já era na prática. Nenhuma mudança visível no sidebar.
//
// FOLLOW-UP (re-habilitar o gating de forma segura): expor um endpoint
// user-authenticado (requireAuth + organização derivada do JWT do /me, sem query param
// e sem chave interna no browser) e corrigir o shape do contrato no mesmo commit.

/**
 * Mantido como no-op intencional: não faz fetch e não popula `allowedProducts`,
 * preservando o permit-all. Continua sendo chamado no Layout para servir de ponto
 * único de re-habilitação futura do gating (ver FOLLOW-UP acima).
 */
export function useLoadAllowedProducts() {
  // Sem chamada de rede por decisão de produto + segurança. Gating permissivo.
}
