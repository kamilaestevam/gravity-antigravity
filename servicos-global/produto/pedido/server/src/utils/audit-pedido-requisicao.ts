/**
 * Auditoria explícita para mutações Pedido que respondem HTTP 204 (sem corpo).
 * O product-audit-plugin só intercepta res.json() — estas rotas precisam de log dedicado.
 */
import type { Request } from 'express'
import type { ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { auditLog, type AuditLogPayload } from '../../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js'

type CamposAuditPedido = Pick<
  AuditLogPayload,
  | 'acao_historico_log'
  | 'tipo_recurso_historico_log'
  | 'id_recurso_historico_log'
  | 'detalhe_acao_historico_log'
  | 'estado_anterior_historico_log'
  | 'estado_posterior_historico_log'
>

/** Fire-and-forget — espelha getActorFromReq do plugin em pedido/server/src/index.ts */
export function auditPedidoRequisicao204(req: Request, campos: CamposAuditPedido): void {
  const ctx = (req as unknown as { organizacao?: ContextoOrganizacao }).organizacao
  const id_organizacao = ctx?.idOrganizacao
  const id_ator_historico_log = ctx?.idUsuario
  const nome_ator_historico_log =
    (req.headers['x-user-name'] as string | undefined) ?? id_ator_historico_log
  if (!id_organizacao || !id_ator_historico_log || !nome_ator_historico_log) return

  auditLog({
    id_organizacao,
    id_produto_historico_log: 'pedido',
    tipo_ator_historico_log: 'USUARIO',
    id_ator_historico_log,
    nome_ator_historico_log,
    id_usuario: id_ator_historico_log,
    ip_ator_historico_log: req.ip,
    modulo_historico_log: 'pedido',
    metadata_ator_historico_log: {
      user_agent: req.headers['user-agent'],
      correlation_id: req.headers['x-correlation-id'],
      method: req.method,
      endpoint: req.originalUrl || req.url,
    },
    status_historico_log: 'SUCESSO',
    ...campos,
  })
}
