import type { ReactNode } from 'react'

/**
 * Props do template PaginaFormularioGlobal.
 *
 * Compõe automaticamente: CabecalhoGlobal + conteúdo centralizado + BotoesSalvarGlobal
 * dentro de um PaginaGlobal com layout formulário.
 *
 * Match visual com Organizacao.tsx do Configurador.
 */
export interface PaginaFormularioProps {
  /* ─── Cabeçalho ─── */
  /** Título da página */
  titulo: string
  /** Subtítulo da página */
  subtitulo?: string
  /** Ícone do cabeçalho (Phosphor React element) */
  icone?: ReactNode

  /* ─── Conteúdo ─── */
  /** Conteúdo do formulário (SecaoGlobal + GridGlobal + campos) */
  children: ReactNode

  /* ─── Ações (BotoesSalvarGlobal) ─── */
  /** Há alterações pendentes? Controla enable/disable dos botões */
  dirty?: boolean
  /** Estado de loading do salvar */
  salvando?: boolean
  /** Callback do botão salvar */
  aoSalvar?: () => void
  /** Callback do botão cancelar */
  aoCancelar?: () => void
  /** Esconde BotoesSalvarGlobal completamente */
  semAcoes?: boolean

  /* ─── Toolbar ─── */
  /** Toolbar fixo entre cabeçalho e conteúdo (abas do formulário) */
  toolbar?: ReactNode

  /** Classes extras no container raiz */
  className?: string
}
