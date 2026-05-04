/**
 * @nucleo/banner-requisitos-global — Contexto + hook + RequisitoMensagem
 *
 * Centraliza a fonte de verdade dos requisitos para que inputs e mensagens
 * inline reajam automaticamente, sem cada modal recablear `borderColor` +
 * `<span>...</span>`.
 *
 * Uso:
 *   <BannerRequisitosContexto requisitos={requisitos}>
 *     <input {...useRequisitoCampo('cnpj_workspace')} />
 *     <RequisitoMensagem chave="cnpj_workspace" />
 *     ...
 *     <BannerRequisitosGlobal />
 *   </BannerRequisitosContexto>
 */
import React, { createContext, useContext, useMemo } from 'react'
import type { RequisitoSalvar, RequisitoCampoProps } from './tipos.js'

interface RequisitosCtx {
  requisitos: RequisitoSalvar[]
  pendentes: Set<string>
}

const Contexto = createContext<RequisitosCtx | null>(null)

export interface BannerRequisitosContextoProps {
  requisitos: RequisitoSalvar[]
  children: React.ReactNode
}

export function BannerRequisitosContexto({ requisitos, children }: BannerRequisitosContextoProps): React.ReactElement {
  const valor = useMemo<RequisitosCtx>(() => ({
    requisitos,
    pendentes: new Set(requisitos.filter((r) => !r.ok).map((r) => r.chave)),
  }), [requisitos])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

/**
 * Acessa o contexto. Lança erro se chamado fora do <BannerRequisitosContexto> —
 * falha alta (Mandamento 08), evita o bug silencioso de "renderizei sem feedback".
 */
function useRequisitosCtx(): RequisitosCtx {
  const ctx = useContext(Contexto)
  if (!ctx) {
    throw new Error('Componente do banner-requisitos-global usado fora de <BannerRequisitosContexto>')
  }
  return ctx
}

/**
 * Acessa o contexto sem lançar — útil para o `BannerRequisitosGlobal` que
 * tem fallback para a prop `requisitos` legada (compat).
 */
export function useRequisitosCtxOpcional(): RequisitosCtx | null {
  return useContext(Contexto)
}

/**
 * Retorna props para spread em um `<input>`/`<select>`/`<textarea>` que
 * destaca a borda quando o requisito está pendente. Acessibilidade:
 * `aria-invalid` para leitores de tela; `aria-describedby` aponta para o id
 * convencional `requisito-msg-<chave>` (vide `<RequisitoMensagem>`).
 *
 * @example
 *   <input {...useRequisitoCampo('cnpj_workspace')} value={cnpj} ... />
 */
export function useRequisitoCampo(chave: string): RequisitoCampoProps {
  const { pendentes } = useRequisitosCtx()
  const pendente = pendentes.has(chave)
  if (!pendente) return {}
  return {
    style: { borderColor: '#f87171' },
    'aria-invalid': true,
    'aria-describedby': `requisito-msg-${chave}`,
  }
}

export interface RequisitoMensagemProps {
  /** Chave do requisito a observar. */
  chave: string
  /**
   * Mensagem a exibir. Padrão: usa `mensagem` do requisito do contexto.
   * Útil quando se quer texto diferente do banner para o inline (ex: mais
   * curto ou imperativo).
   */
  mensagem?: string
  /**
   * Quando `true`, renderiza a mensagem mesmo se o requisito está OK
   * (útil para mensagens neutras tipo "campo opcional"). Padrão: `false`.
   */
  sempre?: boolean
}

/**
 * Renderiza a mensagem de erro inline sob o input quando o requisito da
 * `chave` está pendente. Quando atendido, não renderiza nada.
 *
 * @example
 *   <RequisitoMensagem chave="cnpj_workspace" />
 *   <RequisitoMensagem chave="cnpj_workspace" mensagem="Verifique os dígitos" />
 */
export function RequisitoMensagem({ chave, mensagem, sempre = false }: RequisitoMensagemProps): React.ReactElement | null {
  const { requisitos, pendentes } = useRequisitosCtx()
  const pendente = pendentes.has(chave)
  if (!pendente && !sempre) return null

  const requisito = requisitos.find((r) => r.chave === chave)
  const texto = mensagem ?? requisito?.mensagem ?? ''
  if (!texto) return null

  return (
    <span
      id={`requisito-msg-${chave}`}
      className={`requisito-mensagem-inline ${pendente ? 'requisito-mensagem-inline--erro' : ''}`}
      role={pendente ? 'alert' : undefined}
    >
      {texto}
    </span>
  )
}
