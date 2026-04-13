/**
 * auditClient.ts — Cliente de auditoria para mutações de Pedido
 *
 * Fire-and-forget: nunca bloqueia a resposta HTTP.
 * Envia eventos para o serviço historico-global via REST S2S.
 *
 * Usa fetch nativo (Node 18+) — sem dependência de axios.
 *
 * Referência: skills/servicos/historico/SKILL.md
 */

const HISTORICO_URL = process.env.HISTORICO_SERVICE_URL || 'http://localhost:8011'
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY || ''
const PRODUCT_ID = 'pedido'

interface AuditEvent {
  tenant_id: string
  user_id: string
  acao: string
  entidade: string
  entidade_id: string
  campo?: string
  valor_antes?: string
  valor_depois?: string
  detalhes?: string
}

function registrar(event: AuditEvent): void {
  // Fire-and-forget: não aguardamos nem propagamos erros
  fetch(`${HISTORICO_URL}/api/v1/historico`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-key': INTERNAL_KEY,
      'x-tenant-id': event.tenant_id,
      'x-user-id': event.user_id,
    },
    body: JSON.stringify({
      ...event,
      product_id: PRODUCT_ID,
      timestamp: new Date().toISOString(),
    }),
    signal: AbortSignal.timeout(5_000),
  }).catch(() => {
    // Silencia erros — auditoria não deve travar operações de negócio
  })
}

export const pedidoAudit = {
  pedidoCriado(tenant_id: string, user_id: string, pedido: { id: string; numero_pedido: string }) {
    registrar({
      tenant_id, user_id,
      acao: 'CRIAR',
      entidade: 'pedido',
      entidade_id: pedido.id,
      detalhes: `Pedido ${pedido.numero_pedido} criado`,
    })
  },

  pedidoAtualizado(tenant_id: string, user_id: string, pedido: { id: string; numero_pedido: string }) {
    registrar({
      tenant_id, user_id,
      acao: 'ATUALIZAR',
      entidade: 'pedido',
      entidade_id: pedido.id,
      detalhes: `Pedido ${pedido.numero_pedido} atualizado`,
    })
  },

  pedidoDeletado(tenant_id: string, user_id: string, pedido: { id: string; numero_pedido: string }) {
    registrar({
      tenant_id, user_id,
      acao: 'DELETAR',
      entidade: 'pedido',
      entidade_id: pedido.id,
      detalhes: `Pedido ${pedido.numero_pedido} excluído`,
    })
  },

  statusAlterado(tenant_id: string, user_id: string, pedido: { id: string; numero_pedido: string }, statusAntes: string, statusDepois: string) {
    registrar({
      tenant_id, user_id,
      acao: 'ALTERAR_STATUS',
      entidade: 'pedido',
      entidade_id: pedido.id,
      campo: 'status',
      valor_antes: statusAntes,
      valor_depois: statusDepois,
      detalhes: `Status do pedido ${pedido.numero_pedido} alterado: ${statusAntes} → ${statusDepois}`,
    })
  },

  pedidoDuplicado(tenant_id: string, user_id: string, original: { id: string; numero_pedido: string }, novo: { id: string; numero_pedido: string }) {
    registrar({
      tenant_id, user_id,
      acao: 'DUPLICAR',
      entidade: 'pedido',
      entidade_id: novo.id,
      detalhes: `Pedido ${novo.numero_pedido} duplicado a partir de ${original.numero_pedido}`,
    })
  },

  itemAdicionado(tenant_id: string, user_id: string, pedido_id: string, item: { id: string; part_number: string }) {
    registrar({
      tenant_id, user_id,
      acao: 'ADICIONAR_ITEM',
      entidade: 'pedido_item',
      entidade_id: item.id,
      detalhes: `Item ${item.part_number} adicionado ao pedido ${pedido_id}`,
    })
  },

  itemAtualizado(tenant_id: string, user_id: string, item: { id: string; part_number: string }) {
    registrar({
      tenant_id, user_id,
      acao: 'ATUALIZAR_ITEM',
      entidade: 'pedido_item',
      entidade_id: item.id,
      detalhes: `Item ${item.part_number} atualizado`,
    })
  },

  itemRemovido(tenant_id: string, user_id: string, item_id: string) {
    registrar({
      tenant_id, user_id,
      acao: 'REMOVER_ITEM',
      entidade: 'pedido_item',
      entidade_id: item_id,
      detalhes: `Item ${item_id} removido do pedido`,
    })
  },

  quantidadeCancelada(tenant_id: string, user_id: string, item: { id: string }, quantidade: number) {
    registrar({
      tenant_id, user_id,
      acao: 'CANCELAR_QUANTIDADE',
      entidade: 'pedido_item',
      entidade_id: item.id,
      detalhes: `${quantidade} unidades canceladas no item ${item.id}`,
    })
  },

  quantidadeProntaAtualizada(tenant_id: string, user_id: string, item: { id: string }, quantidade: number) {
    registrar({
      tenant_id, user_id,
      acao: 'ATUALIZAR_PRONTA',
      entidade: 'pedido_item',
      entidade_id: item.id,
      detalhes: `Quantidade pronta do item ${item.id} atualizada para ${quantidade}`,
    })
  },
}
