/**
 * @nucleo/modal-enviar-para-global — tipos
 *
 * Componente zero-lógica: recebe a lista de usuários via props, não faz fetch.
 * O produto/serviço que usa é responsável por buscar a lista de usuários do tenant.
 */

export interface UsuarioDestinatario {
  /** Clerk ID ou identificador único */
  id: string
  /** Nome de exibição */
  nome: string
  /** Email (exibido como hint) */
  email?: string
  /** URL do avatar (opcional) */
  avatarUrl?: string
}

export interface EnviarParaResultado {
  /** IDs dos usuários selecionados */
  destinatarios: string[]
  /** Mensagem opcional do remetente */
  mensagem: string
}

export interface ModalEnviarParaProps {
  /** Se true, o modal está aberto */
  aberto: boolean
  /** Callback para fechar o modal */
  aoFechar: () => void
  /** Callback ao confirmar o envio */
  aoEnviar: (resultado: EnviarParaResultado) => void
  /** Lista de usuários disponíveis para seleção (buscados pelo consumer) */
  usuarios: UsuarioDestinatario[]
  /** Título do modal. Padrão: "Enviar para" */
  titulo?: string
  /** Descrição do conteúdo sendo compartilhado (ex: "Dashboard Exportações") */
  descricaoConteudo?: string
  /** Se true, exibe spinner nos botões */
  carregando?: boolean
  /** Limite de destinatários. Padrão: 20 */
  maxDestinatarios?: number
}
