/**
 * @nucleo/banner-requisitos-global — BannerRequisitosGlobal
 *
 * Renderiza a lista dos requisitos pendentes para o usuário saber EXATAMENTE
 * o que falta antes de clicar em "Salvar". Substitui o gate booleano único
 * `podeSalvar` (que torna o botão cinza sem motivo visível).
 *
 * Não renderiza nada quando todos os requisitos estão atendidos.
 *
 * @example
 * const requisitos: RequisitoSalvar[] = [
 *   { chave: 'nome', ok: nome.trim().length >= 2, mensagem: 'Nome com pelo menos 2 caracteres' },
 *   { chave: 'cnpj', ok: validarCNPJ(cnpj),       mensagem: 'CNPJ válido' },
 * ]
 * const podeSalvar = requisitos.every(r => r.ok)
 *
 * <BannerRequisitosGlobal requisitos={requisitos} />
 */
import React from 'react'
import './banner.css'
import type { BannerRequisitosGlobalProps, RequisitoSalvar } from './tipos.js'

export function BannerRequisitosGlobal({
  requisitos,
  titulo = 'Para salvar, ainda falta:',
}: BannerRequisitosGlobalProps): React.ReactElement | null {
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
 * @example
 * const camposPendentes = camposComRequisitoPendente(requisitos)
 * <input style={{ borderColor: camposPendentes.has('cnpj') ? '#f87171' : undefined }} />
 */
export function camposComRequisitoPendente(requisitos: RequisitoSalvar[]): Set<string> {
  return new Set(requisitos.filter((r) => !r.ok).map((r) => r.chave))
}
