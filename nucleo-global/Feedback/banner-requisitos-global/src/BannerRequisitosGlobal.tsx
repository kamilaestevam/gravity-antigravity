/**
 * @nucleo/banner-requisitos-global — BannerRequisitosGlobal
 *
 * Renderiza a lista dos requisitos pendentes para o usuário saber EXATAMENTE
 * o que falta antes de clicar em "Salvar". Substitui o gate booleano único
 * `podeSalvar` (que torna o botão cinza sem motivo visível).
 *
 * Não renderiza nada quando todos os requisitos estão atendidos.
 *
 * Duas formas de uso:
 *
 * 1. **Com Provider (recomendado)** — ganhe inline + banner em sincronia:
 *
 *    <BannerRequisitosProvider requisitos={requisitos}>
 *      <input {...useRequisitoInput('cnpj')} />
 *      <RequisitoMensagem chave="cnpj" />
 *      ...
 *      <BannerRequisitosGlobal />
 *    </BannerRequisitosProvider>
 *
 * 2. **Standalone (compat)** — apenas o banner, sem feedback inline:
 *
 *    <BannerRequisitosGlobal requisitos={requisitos} />
 */
import React from 'react'
import './banner.css'
import type { BannerRequisitosGlobalProps, RequisitoSalvar } from './tipos.js'
import { useRequisitosCtxOpcional } from './contexto.js'

export function BannerRequisitosGlobal({
  requisitos: requisitosProp,
  titulo = 'Para salvar, ainda falta:',
}: BannerRequisitosGlobalProps): React.ReactElement | null {
  const ctx = useRequisitosCtxOpcional()
  const requisitos = requisitosProp ?? ctx?.requisitos
  if (!requisitos) {
    throw new Error(
      '<BannerRequisitosGlobal> precisa de prop `requisitos` ou estar dentro de <BannerRequisitosProvider>',
    )
  }

  const faltando = requisitos.filter((r) => !r.ok)
  if (faltando.length === 0) return null

  return (
    <div role="status" aria-live="polite" className="banner-requisitos">
      <span className="banner-requisitos__titulo">{titulo}</span>
      <ul className="banner-requisitos__lista">
        {faltando.map((r) => (
          <li key={r.chave}>{r.mensagem}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Helper utilitário para destacar campos pendentes inline (borda vermelha).
 *
 * Mantido para compat — em código novo, prefira `useRequisitoInput(chave)`
 * via contexto, que já devolve as props prontas para spread.
 *
 * @example
 * const camposPendentes = camposComRequisitoPendente(requisitos)
 * <input style={{ borderColor: camposPendentes.has('cnpj') ? '#f87171' : undefined }} />
 */
export function camposComRequisitoPendente(requisitos: RequisitoSalvar[]): Set<string> {
  return new Set(requisitos.filter((r) => !r.ok).map((r) => r.chave))
}
