/**
 * Catalogo canonico de eventos webhook para integracao Gravity ↔ SAP/CPI.
 * SSOT para portal, dispatcher e pacote integration-suite.
 */

export const EVENTOS_WEBHOOK_INTEGRACAO = [
  'pedido.criado',
  'pedido.atualizado',
  'teste.evento',
] as const

export type TipoEventoWebhookIntegracao = (typeof EVENTOS_WEBHOOK_INTEGRACAO)[number]

export function eventoWebhookIntegracaoValido(
  evento: string,
): evento is TipoEventoWebhookIntegracao {
  return (EVENTOS_WEBHOOK_INTEGRACAO as readonly string[]).includes(evento)
}

export const DESCRICAO_EVENTOS_WEBHOOK_INTEGRACAO: Record<TipoEventoWebhookIntegracao, string> = {
  'pedido.criado':    'Disparado quando um pedido e criado via API ou UI.',
  'pedido.atualizado': 'Disparado quando um pedido e atualizado (status ou campos).',
  'teste.evento':     'Evento de teste do portal API Cockpit.',
}
