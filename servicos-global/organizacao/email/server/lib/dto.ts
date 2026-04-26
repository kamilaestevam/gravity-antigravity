// server/lib/dto.ts
// ACL — Anti-Corruption Layer.
// Mantém o contrato público da API (camelCase ou nomes "limpos") estável,
// mesmo após o rename DDD dos campos físicos no banco/Prisma (Onda 28).
//
// Use to<Modelo>Dto() em respostas de rota.
// Use to<Modelo>Where() / to<Modelo>Data() ao montar inputs Prisma.

// ---------------------------------------------------------------------------
// EmailAssuntosParticipantes (thread)
// ---------------------------------------------------------------------------

export interface ThreadDto {
  id: string
  tenant_id: string
  product_id: string | null
  user_id: string | null
  subject: string
  status: string
  sentiment: number
  sentiment_label: string
  mensagens_count: number
  ultimo_contato: Date | null
  deep_link: string | null
  created_at: Date
  updated_at: Date
}

export function toThreadDto(t: {
  id_email_assuntos_participantes: string
  id_organizacao_email_assuntos_participantes: string
  id_produto_email_assuntos_participantes: string | null
  id_usuario_email_assuntos_participantes: string | null
  assunto_email_assuntos_participantes: string
  status_email_assuntos_participantes: string
  sentimento_email_assuntos_participantes: number
  rotulo_sentimento_email_assuntos_participantes: string
  contagem_mensagens_email_assuntos_participantes: number
  ultimo_contato_email_assuntos_participantes: Date | null
  deep_link_email_assuntos_participantes: string | null
  data_criacao_email_assuntos_participantes: Date
  data_atualizacao_email_assuntos_participantes: Date
}): ThreadDto {
  return {
    id: t.id_email_assuntos_participantes,
    tenant_id: t.id_organizacao_email_assuntos_participantes,
    product_id: t.id_produto_email_assuntos_participantes,
    user_id: t.id_usuario_email_assuntos_participantes,
    subject: t.assunto_email_assuntos_participantes,
    status: t.status_email_assuntos_participantes,
    sentiment: t.sentimento_email_assuntos_participantes,
    sentiment_label: t.rotulo_sentimento_email_assuntos_participantes,
    mensagens_count: t.contagem_mensagens_email_assuntos_participantes,
    ultimo_contato: t.ultimo_contato_email_assuntos_participantes,
    deep_link: t.deep_link_email_assuntos_participantes,
    created_at: t.data_criacao_email_assuntos_participantes,
    updated_at: t.data_atualizacao_email_assuntos_participantes,
  }
}

// ---------------------------------------------------------------------------
// EmailMensagem
// ---------------------------------------------------------------------------

export interface MensagemDto {
  id: string
  tenant_id: string
  product_id: string | null
  user_id: string | null
  thread_id: string
  resend_id: string | null
  direction: string
  from: string
  to: string
  subject: string | null
  body: string
  body_html: string | null
  dedup_key: string | null
  parent_message_id: string | null
  gabi_response: string | null
  gabi_confidence: number | null
  gabi_action: string | null
  sent_at: Date
  created_at: Date
  updated_at: Date
}

export function toMensagemDto(m: {
  id_email_mensagem: string
  id_organizacao_email_mensagem: string
  id_produto_email_mensagem: string | null
  id_usuario_email_mensagem: string | null
  id_thread_email_mensagem: string
  id_resend_email_mensagem: string | null
  direcao_email_mensagem: string
  remetente_email_mensagem: string
  destinatario_email_mensagem: string
  assunto_email_mensagem: string | null
  corpo_email_mensagem: string
  corpo_html_email_mensagem: string | null
  chave_dedup_email_mensagem: string | null
  id_mensagem_pai_email_mensagem: string | null
  resposta_gabi_email_mensagem: string | null
  confianca_gabi_email_mensagem: number | null
  acao_gabi_email_mensagem: string | null
  data_envio_email_mensagem: Date
  data_criacao_email_mensagem: Date
  data_atualizacao_email_mensagem: Date
}): MensagemDto {
  return {
    id: m.id_email_mensagem,
    tenant_id: m.id_organizacao_email_mensagem,
    product_id: m.id_produto_email_mensagem,
    user_id: m.id_usuario_email_mensagem,
    thread_id: m.id_thread_email_mensagem,
    resend_id: m.id_resend_email_mensagem,
    direction: m.direcao_email_mensagem,
    from: m.remetente_email_mensagem,
    to: m.destinatario_email_mensagem,
    subject: m.assunto_email_mensagem,
    body: m.corpo_email_mensagem,
    body_html: m.corpo_html_email_mensagem,
    dedup_key: m.chave_dedup_email_mensagem,
    parent_message_id: m.id_mensagem_pai_email_mensagem,
    gabi_response: m.resposta_gabi_email_mensagem,
    gabi_confidence: m.confianca_gabi_email_mensagem,
    gabi_action: m.acao_gabi_email_mensagem,
    sent_at: m.data_envio_email_mensagem,
    created_at: m.data_criacao_email_mensagem,
    updated_at: m.data_atualizacao_email_mensagem,
  }
}

// ---------------------------------------------------------------------------
// TemplateEmail
// ---------------------------------------------------------------------------

export interface TemplateDto {
  id: string
  tenant_id: string
  product_id: string | null
  user_id: string | null
  nome: string
  slug: string
  assunto: string
  corpo_html: string
  corpo_texto: string | null
  variaveis: string[]
  ativo: boolean
  descricao: string | null
  created_at: Date
  updated_at: Date
}

export function toTemplateDto(t: {
  id_template_email: string
  id_organizacao_template_email: string
  id_produto_template_email: string | null
  id_usuario_template_email: string | null
  nome_template_email: string
  slug_template_email: string
  assunto_template_email: string
  corpo_html_template_email: string
  corpo_texto_template_email: string | null
  variaveis_template_email: string[]
  ativo_template_email: boolean
  descricao_template_email: string | null
  data_criacao_template_email: Date
  data_atualizacao_template_email: Date
}): TemplateDto {
  return {
    id: t.id_template_email,
    tenant_id: t.id_organizacao_template_email,
    product_id: t.id_produto_template_email,
    user_id: t.id_usuario_template_email,
    nome: t.nome_template_email,
    slug: t.slug_template_email,
    assunto: t.assunto_template_email,
    corpo_html: t.corpo_html_template_email,
    corpo_texto: t.corpo_texto_template_email,
    variaveis: t.variaveis_template_email,
    ativo: t.ativo_template_email,
    descricao: t.descricao_template_email,
    created_at: t.data_criacao_template_email,
    updated_at: t.data_atualizacao_template_email,
  }
}

// ---------------------------------------------------------------------------
// EmailFilaEnvio
// ---------------------------------------------------------------------------

export interface FilaItemDto {
  id: string
  status: string
  prioridade: string
  tentativas: number
  max_tentativas: number
  next_retry_at: Date | null
  erro: string | null
  created_at: Date
  processado_at: Date | null
}

export function toFilaItemDto(f: {
  id_email_fila_envio: string
  status_email_fila_envio: string
  prioridade_email_fila_envio: string
  tentativas_email_fila_envio: number
  max_tentativas_email_fila_envio: number
  proxima_tentativa_em_email_fila_envio: Date | null
  erro_email_fila_envio: string | null
  data_criacao_email_fila_envio: Date
  processado_em_email_fila_envio: Date | null
}): FilaItemDto {
  return {
    id: f.id_email_fila_envio,
    status: f.status_email_fila_envio,
    prioridade: f.prioridade_email_fila_envio,
    tentativas: f.tentativas_email_fila_envio,
    max_tentativas: f.max_tentativas_email_fila_envio,
    next_retry_at: f.proxima_tentativa_em_email_fila_envio,
    erro: f.erro_email_fila_envio,
    created_at: f.data_criacao_email_fila_envio,
    processado_at: f.processado_em_email_fila_envio,
  }
}
