/**
 * securityAuditLogger.ts — Logger de eventos de segurança
 *
 * Encaminha todos os eventos de segurança para o `AuditService.log()`,
 * que persiste em `historico_log` via fila PG Boss de forma assíncrona, e
 * também espelha no painel `/admin/seguranca` do Configurador via rota
 * interna `/api/v1/internal/eventos-seguranca`.
 *
 * Nomes alinhados ao Atlas DDD e Mandamento 03 (PT-BR + glossário canônico):
 *  - parâmetros usam `id_usuario`/`nome_usuario` (User→Usuario do glossário)
 *  - `details` usa `id_usuario_alvo`/`id_organizacao_alvo` (REGRA `_alvo`)
 *  - mapeia para campos físicos do `historico_log` quando disponível
 *    (`tipo_recurso_historico_log`, `id_recurso_historico_log`,
 *    `modulo_historico_log`, `mensagem_erro_historico_log`,
 *    `ip_ator_historico_log`, `status_historico_log`)
 *  - resto vai pra `metadata_ator_historico_log` (jsonb) com chaves PT-BR
 *
 * Mandamento 08 — `resolverNomeAtor()` falha alto quando `tipo_ator=USUARIO`
 * mas o caller esqueceu de passar `nome_usuario`. Não cai silenciosamente
 * no cuid; grava placeholder explícito + console.warn.
 */

import { randomUUID } from 'crypto'
import { AuditService } from '../services/audit.service.js'
import { AcaoExecutadaPor, EventoStatus } from '../../../generated/index.js'

const CONFIGURADOR_URL = process.env.CONFIGURADOR_URL || process.env.CONFIGURADOR_SERVICE_URL || ''
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY || ''

type SeveridadeEventoSeguranca = 'INFO' | 'WARNING' | 'CRITICAL'

interface SecurityEventInput {
  id_organizacao: string
  id_ator_historico_log: string
  /**
   * Nome humano do ator. Quando o ator é USUARIO real (cuid), DEVE ser
   * `req.auth.nome_usuario`. Quando ausente em ator USUARIO, `resolverNomeAtor`
   * grava placeholder explícito (Mandamento 08). Para atores não-humanos
   * (`'system'`, `'webhook'`, `'anonymous'`, jobName), o id já é label legível.
   */
  nome_ator_historico_log?: string
  tipo_ator_historico_log: AcaoExecutadaPor
  acao_historico_log: string
  modulo_historico_log?: string
  /** PascalCase do recurso afetado (ex: 'Workspace', 'Permissao'). */
  tipo_recurso_historico_log?: string
  /** ID do recurso afetado quando aplicável. */
  id_recurso_historico_log?: string
  /** Usuário-alvo da ação (quem teve permissão/patente alterada, dado excluído etc). */
  id_usuario?: string
  id_produto_historico_log?: string
  ip_ator_historico_log?: string
  /** Texto humano final (PT-BR) que vai pra coluna "Detalhes" da tela do Histórico. */
  detalhe_acao_historico_log: string
  /** Snapshot ANTES (usado em alteração de patente, permissão etc). */
  estado_anterior_historico_log?: Record<string, unknown>
  /** Snapshot DEPOIS. */
  estado_posterior_historico_log?: Record<string, unknown>
  status_historico_log?: EventoStatus
  /** Mensagem de erro técnica quando `status_historico_log = FALHA`. */
  mensagem_erro_historico_log?: string
  /**
   * Metadados livres do evento (jsonb). Chaves SEMPRE em PT-BR.
   * Já recebe `severidade_evento_seguranca` mesclada por logSecurityEvent.
   */
  metadata_ator_historico_log?: Record<string, unknown>
  severidade_evento_seguranca: SeveridadeEventoSeguranca
  id_correlacao?: string
}

/**
 * Resolve `nome_ator_historico_log` aplicando Mandamento 08 (falha ruidosa em
 * autorização / dados de identidade).
 *
 * Regras:
 *  - Caller passou nome → usa direto.
 *  - Ator não-humano (tipo ≠ USUARIO) → fallback para `id_ator_historico_log`
 *    é correto (id já é label legível: `'system'`, `'webhook'`, `'anonymous'`).
 *  - Ator USUARIO sem nome → grava placeholder explícito + console.warn em vez
 *    de cair silenciosamente no cuid.
 */
function resolverNomeAtor(event: SecurityEventInput): string {
  if (event.nome_ator_historico_log) return event.nome_ator_historico_log

  if (event.tipo_ator_historico_log !== AcaoExecutadaPor.USUARIO) {
    return event.id_ator_historico_log
  }

  console.warn(
    '[securityAudit] Mandamento 08: USUARIO sem nome_usuario — caller deve passar `nome_usuario` no 4º argumento.',
    {
      acao_historico_log:    event.acao_historico_log,
      modulo_historico_log:  event.modulo_historico_log,
      id_ator_historico_log: event.id_ator_historico_log,
    },
  )
  const idCurto = event.id_ator_historico_log.slice(0, 8)
  return `(nome ausente — id ${idCurto})`
}

async function logSecurityEvent(event: SecurityEventInput): Promise<void> {
  const nome_ator_historico_log = resolverNomeAtor(event)
  const status_historico_log = event.status_historico_log ?? EventoStatus.SUCESSO
  const metadata_final: Record<string, unknown> = {
    severidade_evento_seguranca: event.severidade_evento_seguranca,
    ...(event.id_correlacao ? { id_correlacao: event.id_correlacao } : {}),
    ...(event.metadata_ator_historico_log ?? {}),
  }

  // 1. Gravar no audit trail imutável via AuditService
  await AuditService.log({
    id_organizacao:                 event.id_organizacao,
    tipo_ator_historico_log:        event.tipo_ator_historico_log,
    id_ator_historico_log:          event.id_ator_historico_log,
    nome_ator_historico_log,
    ip_ator_historico_log:          event.ip_ator_historico_log,
    metadata_ator_historico_log:    metadata_final,
    modulo_historico_log:           event.modulo_historico_log ?? 'auth',
    tipo_recurso_historico_log:     event.tipo_recurso_historico_log ?? 'EventoSeguranca',
    id_recurso_historico_log:       event.id_recurso_historico_log,
    acao_historico_log:             event.acao_historico_log,
    detalhe_acao_historico_log:     event.detalhe_acao_historico_log,
    estado_anterior_historico_log:  event.estado_anterior_historico_log,
    estado_posterior_historico_log: event.estado_posterior_historico_log,
    status_historico_log,
    mensagem_erro_historico_log:    event.mensagem_erro_historico_log,
    id_usuario:                     event.id_usuario,
    id_produto_historico_log:       event.id_produto_historico_log,
  })

  // 2. Espelhar no painel /admin/seguranca via rota interna do Configurador.
  // Validada por x-internal-key (withInternalKeyValidation) — sem JWT.
  if (CONFIGURADOR_URL) {
    fetch(`${CONFIGURADOR_URL}/api/v1/internal/eventos-seguranca`, {
      method: 'POST',
      headers: {
        'Content-Type':       'application/json',
        'x-internal-key':     INTERNAL_KEY,
        'x-correlation-id':   event.id_correlacao ?? randomUUID(),
      },
      body: JSON.stringify({
        id_organizacao:           event.id_organizacao,
        id_ator_historico_log:    event.id_ator_historico_log,
        tipo_ator_historico_log:  event.tipo_ator_historico_log,
        acao_historico_log:       event.acao_historico_log,
        severidade_evento_seguranca: event.severidade_evento_seguranca,
        status:                   status_historico_log === EventoStatus.FALHA ? 'BLOCKED' : 'DETECTED',
        description:              event.detalhe_acao_historico_log.slice(0, 500),
        ip:                       event.ip_ator_historico_log,
        endpoint:                 typeof metadata_final.endpoint === 'string' ? metadata_final.endpoint : undefined,
        id_usuario:               event.id_usuario,
        id_produto_historico_log: event.id_produto_historico_log,
        id_correlacao:            event.id_correlacao,
        metadata_ator_historico_log: metadata_final,
      }),
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : 'unknown'
      console.error(`[securityAudit] Falha ao persistir no Configurador: ${msg}`)
    })
  }
}

export const securityAudit = {
  /**
   * Permissão concedida ou revogada de um usuário.
   */
  permissionChanged(
    id_organizacao: string,
    id_usuario: string,
    details: {
      id_usuario_alvo: string
      nome_permissao:  string
      acao_permissao:  'GRANTED' | 'REVOKED'
    },
    nome_usuario?: string,
  ) {
    const verbo = details.acao_permissao === 'GRANTED' ? 'Concedeu' : 'Revogou'
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log:        id_usuario,
      nome_ator_historico_log:      nome_usuario,
      tipo_ator_historico_log:      AcaoExecutadaPor.USUARIO,
      acao_historico_log:           `PERMISSAO_${details.acao_permissao}`,
      modulo_historico_log:         'configuracao',
      tipo_recurso_historico_log:   'Permissao',
      id_usuario:                   details.id_usuario_alvo,
      detalhe_acao_historico_log:   `${verbo} permissão "${details.nome_permissao}" do usuário ${details.id_usuario_alvo}`,
      severidade_evento_seguranca:  'WARNING',
      metadata_ator_historico_log:  { nome_permissao: details.nome_permissao },
    })
  },

  /**
   * Auto-vínculo em LOTE de usuários PADRAO/FORNECEDOR a um workspace recém-criado
   * (feature `acesso_workspaces_futuros` — decisão arquitetural 2026-05-05).
   * Um único evento agregado em vez de N permissionChanged.
   */
  workspaceAutoLinkBatch(
    id_organizacao: string,
    id_usuario: string,
    details: {
      id_workspace_criado:           string
      nome_workspace_criado:         string
      ids_usuarios_auto_vinculados:  string[]
      motivo_auto_vinculo:           'WORKSPACE_CRIADO_ACESSO_FUTUROS'
    },
    nome_usuario?: string,
  ) {
    const quantidade = details.ids_usuarios_auto_vinculados.length
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log:        id_usuario,
      nome_ator_historico_log:      nome_usuario,
      tipo_ator_historico_log:      AcaoExecutadaPor.USUARIO,
      acao_historico_log:           'AUTO_VINCULAR_WORKSPACE_LOTE',
      modulo_historico_log:         'configuracao',
      tipo_recurso_historico_log:   'Workspace',
      id_recurso_historico_log:     details.id_workspace_criado,
      detalhe_acao_historico_log:   `Auto-vinculou ${quantidade} usuário${quantidade === 1 ? '' : 's'} ao workspace "${details.nome_workspace_criado}"`,
      severidade_evento_seguranca:  'INFO',
      metadata_ator_historico_log:  {
        nome_workspace_criado:        details.nome_workspace_criado,
        ids_usuarios_auto_vinculados: details.ids_usuarios_auto_vinculados,
        quantidade_usuarios:          quantidade,
        motivo_auto_vinculo:          details.motivo_auto_vinculo,
      },
    })
  },

  /**
   * Patente (`tipo_usuario`) de um usuário foi alterada.
   * Usa estado_anterior/posterior_historico_log para diff X→Y nativo.
   */
  roleChanged(
    id_organizacao: string,
    id_usuario: string,
    details: {
      id_usuario_alvo:        string
      tipo_usuario_anterior:  string
      tipo_usuario_novo:      string
    },
    nome_usuario?: string,
  ) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log:          id_usuario,
      nome_ator_historico_log:        nome_usuario,
      tipo_ator_historico_log:        AcaoExecutadaPor.USUARIO,
      acao_historico_log:             'ALTERAR_PATENTE',
      modulo_historico_log:           'configuracao',
      tipo_recurso_historico_log:     'Usuario',
      id_recurso_historico_log:       details.id_usuario_alvo,
      id_usuario:                     details.id_usuario_alvo,
      detalhe_acao_historico_log:     `Alterou patente do usuário ${details.id_usuario_alvo} de "${details.tipo_usuario_anterior}" para "${details.tipo_usuario_novo}"`,
      estado_anterior_historico_log:  { tipo_usuario: details.tipo_usuario_anterior },
      estado_posterior_historico_log: { tipo_usuario: details.tipo_usuario_novo },
      severidade_evento_seguranca:    'CRITICAL',
    })
  },

  /**
   * Mudança de `status_usuario` (ATIVO ↔ INATIVO). Persistido no enum
   * `StatusUsuario` do Prisma (decisão dono 2026-05-12).
   *
   * Distinto de `roleChanged` (que loga mudança de patente/tipo_usuario):
   *   - `acao_historico_log = 'ALTERAR_STATUS_USUARIO'` (filtrável separadamente)
   *   - severidade `WARNING` (não CRITICAL — não muda autorização permanente,
   *      só bloqueia login. Reversível pelo mesmo admin)
   *   - diff `{ status_usuario: ... }` reconstrói cronologia
   *
   * Histórico (2026-05-13): rotas de PATCH /status usavam roleChanged com
   * `tipo_usuario_anterior === novo` (mesmo valor) — inflava painel /admin/
   * seguranca com CRITICAL falsos. Substituído por esta função dedicada.
   */
  statusChanged(
    id_organizacao: string,
    id_usuario: string,
    details: {
      id_usuario_alvo:    string
      status_anterior:    'ATIVO' | 'INATIVO'
      status_novo:        'ATIVO' | 'INATIVO'
    },
    nome_usuario?: string,
  ) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log:          id_usuario,
      nome_ator_historico_log:        nome_usuario,
      tipo_ator_historico_log:        AcaoExecutadaPor.USUARIO,
      acao_historico_log:             'ALTERAR_STATUS_USUARIO',
      modulo_historico_log:           'configuracao',
      tipo_recurso_historico_log:     'Usuario',
      id_recurso_historico_log:       details.id_usuario_alvo,
      id_usuario:                     details.id_usuario_alvo,
      detalhe_acao_historico_log:     details.status_novo === 'INATIVO'
        ? `Desativou usuário ${details.id_usuario_alvo}`
        : `Reativou usuário ${details.id_usuario_alvo}`,
      estado_anterior_historico_log:  { status_usuario: details.status_anterior },
      estado_posterior_historico_log: { status_usuario: details.status_novo },
      severidade_evento_seguranca:    'WARNING',
    })
  },

  /**
   * Negação de acesso por falta de permissão granular `<slug>:<secao>:<acao>`.
   *
   * Emitida pelo middleware `requirePermissao` no backend quando bloqueia
   * uma request HTTP por falta da chave em `UsuarioPermissao` (e o ator
   * NÃO tem bypass — Master/SAdmin/Admin nunca disparam).
   *
   * Distinto de `crossTenantAttempt`:
   *   - `crossTenantAttempt`: ator tentou acessar OUTRA org (isolamento).
   *   - `permissionDenied`:   ator dentro da própria org, sem chave granular.
   *
   * Severidade `WARNING` (não CRITICAL): é fluxo normal de gating, não
   * tentativa de escalada. CRITICAL fica reservado para crossTenantAttempt
   * e roleChanged (mudança de patente).
   *
   * Payload em DDD canônico (Mand. 03 — PT-BR + sufixo _alvo nos campos do
   * recurso afetado). Decisão dono 2026-05-13.
   */
  permissionDenied(
    id_organizacao: string,
    id_usuario_ator: string,
    details: {
      /** Geralmente == id_usuario_ator (auto-negação). Mantido por simetria com
       *  outras funções e para casos S2S onde ator e alvo divergem. */
      id_usuario_alvo:         string
      slug_produto_gravity:    string  // 'pedido', 'bid-cambio', etc.
      secao_produto:           string  // 'lista', 'kanban', 'dashboard', ...
      acao_produto:            'ver' | 'editar'
      rota_negada:             string  // '/api/v1/pedidos/kanban/preferencias'
      metodo_http:             string  // 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    },
    nome_usuario?: string,
    ip_ator_historico_log?: string,
  ) {
    const chave = `${details.slug_produto_gravity}:${details.secao_produto}:${details.acao_produto}`
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log:          id_usuario_ator,
      nome_ator_historico_log:        nome_usuario,
      tipo_ator_historico_log:        AcaoExecutadaPor.USUARIO,
      acao_historico_log:             'NEGAR_ACESSO_PERMISSAO',
      modulo_historico_log:           details.slug_produto_gravity,
      tipo_recurso_historico_log:     'Permissao',
      id_recurso_historico_log:       chave,
      id_usuario:                     details.id_usuario_alvo,
      id_produto_historico_log:       details.slug_produto_gravity,
      ip_ator_historico_log,
      detalhe_acao_historico_log:
        `Negado acesso a "${chave}" em ${details.metodo_http} ${details.rota_negada}`,
      status_historico_log:           EventoStatus.FALHA,
      severidade_evento_seguranca:    'WARNING',
      metadata_ator_historico_log:    {
        slug_produto_gravity: details.slug_produto_gravity,
        secao_produto:        details.secao_produto,
        acao_produto:         details.acao_produto,
        chave_permissao:      chave,
        rota_negada:          details.rota_negada,
        metodo_http:          details.metodo_http,
      },
    })
  },

  /**
   * Tentativa REAL de acesso a outra organização (cross-tenant).
   * Status sempre FALHA — só é logado quando a tentativa foi bloqueada.
   */
  crossTenantAttempt(
    id_organizacao: string,
    id_usuario: string,
    details: {
      id_organizacao_alvo: string
      endpoint:            string
    },
    nome_usuario?: string,
  ) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log:        id_usuario,
      nome_ator_historico_log:      nome_usuario,
      tipo_ator_historico_log:      AcaoExecutadaPor.USUARIO,
      acao_historico_log:           'TENTAR_ACESSO_OUTRA_ORGANIZACAO',
      modulo_historico_log:         'auth',
      tipo_recurso_historico_log:   'Organizacao',
      id_recurso_historico_log:     details.id_organizacao_alvo,
      detalhe_acao_historico_log:   `Tentou acessar a organização ${details.id_organizacao_alvo} via ${details.endpoint}`,
      status_historico_log:         EventoStatus.FALHA,
      severidade_evento_seguranca:  'CRITICAL',
      metadata_ator_historico_log:  {
        id_organizacao_alvo: details.id_organizacao_alvo,
        endpoint:            details.endpoint,
      },
    })
  },

  /**
   * Falha de autenticação. Disparado por `requireAuth` em token ausente/inválido.
   */
  authFailure(
    id_organizacao: string,
    details: {
      ip:           string
      motivo_falha: string
      endpoint:     string
    },
  ) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log:        'anonymous',
      tipo_ator_historico_log:      AcaoExecutadaPor.USUARIO,
      acao_historico_log:           'FALHAR_AUTENTICACAO',
      modulo_historico_log:         'auth',
      ip_ator_historico_log:        details.ip,
      tipo_recurso_historico_log:   'Sessao',
      detalhe_acao_historico_log:   `Falha de autenticação em ${details.endpoint}: ${details.motivo_falha}`,
      mensagem_erro_historico_log:  details.motivo_falha,
      status_historico_log:         EventoStatus.FALHA,
      severidade_evento_seguranca:  'WARNING',
      metadata_ator_historico_log:  { endpoint: details.endpoint },
    })
  },

  /**
   * Limite de taxa atingido (rate limiter).
   */
  rateLimitHit(
    id_organizacao: string,
    details: {
      ip:                                string
      endpoint:                          string
      quantidade_tentativas_rate_limit:  number
    },
  ) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log:        'system',
      tipo_ator_historico_log:      AcaoExecutadaPor.INTEGRACAO,
      acao_historico_log:           'ATINGIR_LIMITE_TAXA',
      modulo_historico_log:         'auth',
      ip_ator_historico_log:        details.ip,
      tipo_recurso_historico_log:   'LimiteTaxa',
      detalhe_acao_historico_log:   `Atingiu limite de taxa em ${details.endpoint} (${details.quantidade_tentativas_rate_limit} tentativas)`,
      status_historico_log:         EventoStatus.FALHA,
      severidade_evento_seguranca:  'WARNING',
      metadata_ator_historico_log:  {
        endpoint:                          details.endpoint,
        quantidade_tentativas_rate_limit:  details.quantidade_tentativas_rate_limit,
      },
    })
  },

  /**
   * Operação em credencial (criar/revogar/rotacionar API key, service token, etc).
   */
  credentialOperation(
    id_organizacao: string,
    id_usuario: string,
    details: {
      tipo_operacao_credencial: 'CRIAR' | 'REVOGAR' | 'ROTACIONAR'
      tipo_credencial:          'API_KEY' | 'SERVICE_TOKEN' | 'INTERNAL_KEY'
      id_credencial?:           string
    },
    nome_usuario?: string,
  ) {
    const verbosPorOperacao: Record<typeof details.tipo_operacao_credencial, string> = {
      CRIAR:       'Criou',
      REVOGAR:     'Revogou',
      ROTACIONAR:  'Rotacionou',
    }
    const verbo = verbosPorOperacao[details.tipo_operacao_credencial]
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log:        id_usuario,
      nome_ator_historico_log:      nome_usuario,
      tipo_ator_historico_log:      AcaoExecutadaPor.USUARIO,
      acao_historico_log:           `CREDENCIAL_${details.tipo_operacao_credencial}`,
      modulo_historico_log:         'configuracao',
      tipo_recurso_historico_log:   details.tipo_credencial,
      id_recurso_historico_log:     details.id_credencial,
      detalhe_acao_historico_log:   `${verbo} credencial ${details.tipo_credencial}${details.id_credencial ? ` (${details.id_credencial})` : ''}`,
      severidade_evento_seguranca:  'WARNING',
    })
  },

  /**
   * Acesso administrativo (Gravity admin entrando em rota privilegiada).
   */
  adminAccess(
    id_organizacao: string,
    id_usuario: string,
    details: {
      id_organizacao_alvo: string
      endpoint:            string
      tipo_acao_admin:     string
    },
    nome_usuario?: string,
  ) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log:        id_usuario,
      nome_ator_historico_log:      nome_usuario,
      tipo_ator_historico_log:      AcaoExecutadaPor.USUARIO,
      acao_historico_log:           `ACESSAR_ADMIN_${details.tipo_acao_admin}`,
      modulo_historico_log:         'admin',
      tipo_recurso_historico_log:   'AreaAdmin',
      detalhe_acao_historico_log:   `Acessou área admin "${details.tipo_acao_admin}" da organização ${details.id_organizacao_alvo} (${details.endpoint})`,
      severidade_evento_seguranca:  'INFO',
      metadata_ator_historico_log:  {
        id_organizacao_alvo: details.id_organizacao_alvo,
        endpoint:            details.endpoint,
        tipo_acao_admin:     details.tipo_acao_admin,
      },
    })
  },

  /**
   * Falha de assinatura HMAC em webhook recebido.
   */
  webhookSignatureFailure(
    id_organizacao: string,
    details: {
      origem_webhook: 'CLERK' | 'STRIPE' | 'RESEND' | 'WHATSAPP'
      ip:             string
      motivo_falha:   string
    },
  ) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log:        'webhook',
      tipo_ator_historico_log:      AcaoExecutadaPor.INTEGRACAO,
      acao_historico_log:           'FALHAR_ASSINATURA_WEBHOOK',
      modulo_historico_log:         'auth',
      ip_ator_historico_log:        details.ip,
      tipo_recurso_historico_log:   'AssinaturaWebhook',
      detalhe_acao_historico_log:   `Falha de assinatura webhook ${details.origem_webhook}: ${details.motivo_falha}`,
      mensagem_erro_historico_log:  details.motivo_falha,
      status_historico_log:         EventoStatus.FALHA,
      severidade_evento_seguranca:  'CRITICAL',
      metadata_ator_historico_log:  { origem_webhook: details.origem_webhook },
    })
  },

  /**
   * Exclusão de dados (LGPD Art.18, ação admin, fechamento de conta).
   */
  dataDeleted(
    id_organizacao: string,
    id_usuario: string,
    details: {
      id_usuario_alvo:                string
      tabelas_afetadas:               string[]
      quantidade_registros_excluidos: number
      motivo_exclusao:                'LGPD_REQUEST' | 'ADMIN_ACTION' | 'ACCOUNT_CLOSURE'
    },
    nome_usuario?: string,
  ) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log:        id_usuario,
      nome_ator_historico_log:      nome_usuario,
      tipo_ator_historico_log:      AcaoExecutadaPor.USUARIO,
      acao_historico_log:           'EXCLUIR_DADO',
      modulo_historico_log:         'admin',
      tipo_recurso_historico_log:   'DadosUsuario',
      id_recurso_historico_log:     details.id_usuario_alvo,
      id_usuario:                   details.id_usuario_alvo,
      detalhe_acao_historico_log:   `Excluiu ${details.quantidade_registros_excluidos} registros do usuário ${details.id_usuario_alvo} (motivo: ${details.motivo_exclusao})`,
      severidade_evento_seguranca:  'CRITICAL',
      metadata_ator_historico_log:  {
        tabelas_afetadas:               details.tabelas_afetadas,
        quantidade_registros_excluidos: details.quantidade_registros_excluidos,
        motivo_exclusao:                details.motivo_exclusao,
      },
    })
  },

  /**
   * Chamada de API autenticada via API key.
   * Ator é a chave (`tipo_ator = API`). O id_usuario é do owner da chave.
   */
  apiKeyUsed(
    id_organizacao: string,
    id_usuario: string,
    details: {
      id_chave_api:    string
      modulo_acessado: string
      endpoint:        string
      ip:              string
    },
    nome_usuario?: string,
  ) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log:        details.id_chave_api,
      nome_ator_historico_log:      nome_usuario ?? details.id_chave_api,
      tipo_ator_historico_log:      AcaoExecutadaPor.API,
      acao_historico_log:           'CHAMAR_API',
      modulo_historico_log:         details.modulo_acessado,
      tipo_recurso_historico_log:   'ChaveApi',
      id_recurso_historico_log:     details.id_chave_api,
      ip_ator_historico_log:        details.ip,
      id_usuario:                   id_usuario,
      detalhe_acao_historico_log:   `API chamada em ${details.endpoint} via chave ${details.id_chave_api}`,
      severidade_evento_seguranca:  'INFO',
      metadata_ator_historico_log:  { endpoint: details.endpoint },
    })
  },
}
