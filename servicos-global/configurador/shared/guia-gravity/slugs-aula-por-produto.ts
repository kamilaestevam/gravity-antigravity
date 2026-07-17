/**
 * Slugs de aula por produto — catálogo para elegibilidade de certificado no backend.
 * Mantido alinhado aos *_AULA_SLUGS dos manuais Academy.
 */

import { aulaGuiaEstaConcluida } from './conclusao-academy-guia-gravity.js'

export const SLUGS_AULA_POR_PRODUTO_GUIA: Readonly<Record<string, readonly string[]>> = {
  'bem-vindo': ['boas-vindas', 'o-que-e-o-gravity', 'o-guia-gravity'],
  login: ['meu-primeiro-acesso', 'entrar-email-senha', 'recuperar-senha'],
  navegacao: [
    'menus-plataforma',
    'acesso-gravity-university',
  ],
  admin: [
    'admin-visao-geral',
    'admin-como-acessar',
    'admin-areas-painel',
    'admin-impersonacao',
    'admin-monitor-apis-deploys',
  ],
  configurador: [
    'criando-a-organizacao',
    'acessar-workspaces',
    'administrando-usuarios',
    'cadastrando-fornecedores',
    'exportador-e-importador',
    'gerenciando-assinaturas',
    'financeiro-da-conta',
    'api-cockpit-integracoes',
    'taxas-e-moeda',
    'historico-e-auditoria',
  ],
  gabi: ['o-que-e-a-gabi', 'limites-e-permissoes'],
  hub: ['hub-tela-principal', 'gravity-store-na-tela-hub'],
  store: ['entenda-a-gravity-store'],
  pedido: [
    'pedido-gravity',
    'pedido-visao-insights',
    'pedido-visao-lista',
    'pedido-visao-dashboard',
    'pedido-visao-kanban',
    'pedido-configuracoes',
    'pedido-historico',
  ],
  'bid-frete': [
    'bid-frete-entendendo',
    'bid-frete-insights',
    'bid-frete-lista',
    'bid-frete-tipos-cotacao',
    'bid-frete-nova-cotacao',
    'bid-frete-painel-cotacao',
    'bid-frete-configuracoes',
  ],
  'smart-read': [
    'smart-read-visao-geral',
    'smart-read-acesso',
    'smart-read-tipos-visualizacao',
    'smart-read-visao-insight',
    'smart-read-visao-lista',
    'smart-read-nova-leitura',
    'smart-read-configuracoes',
    'smart-read-historico',
  ],
}

export const SLUGS_MODULO_BASICO_GUIA = [
  'bem-vindo',
  'login',
  'navegacao',
  'admin',
  'configurador',
  'gabi',
  'hub',
  'store',
] as const

export function produtoGuiaConcluido100(
  slugProduto: string,
  aulasConcluidas: ReadonlySet<string>,
): boolean {
  const slugs = SLUGS_AULA_POR_PRODUTO_GUIA[slugProduto]
  if (!slugs?.length) return false
  return slugs.every(slug => aulaGuiaEstaConcluida(slug, aulasConcluidas))
}
