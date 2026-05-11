import React, { ReactNode } from 'react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import './campo-geral.css'

/**
 * CampoGeralGlobal — wrapper unificado de campos (input, select, calendário…).
 *
 * REGRA OFICIAL DO GRAVITY (UX de obrigatórios — não-negociável):
 *   `obrigatorio={true}` + `vazio={true}` ⇒ asterisco vermelho no label
 *                                            + borda vermelha no campo filho.
 *
 * Esses são os únicos sinais de "campo obrigatório ainda pendente". A
 * mensagem textual fica fora do campo (ver `AvisoCamposObrigatoriosGlobal`),
 * que consolida tudo num bloco "PARA AVANÇAR, AINDA FALTA" no rodapé do form.
 *
 * `erro` (string) é uma 2ª camada — para validação pós-tentativa de submit
 * (ex: "CNPJ inválido"). Erro também pinta de vermelho, mas adiciona texto
 * abaixo do campo. Vazio + erro podem coexistir.
 *
 * Compatibilidade: telas que NÃO passam `vazio` continuam exatamente como
 * antes (apenas asterisco quando `obrigatorio`, sem borda vermelha). Adoção
 * é gradual — a regra está no componente, mas só dispara quando o consumidor
 * informa explicitamente que o valor está vazio.
 */
export interface CampoGeralGlobalProps {
  label?: string
  tooltipTitulo?: string
  tooltipDescricao?: string
  children: ReactNode
  className?: string
  /** Marca o campo como obrigatório — adiciona asterisco no label. */
  obrigatorio?: boolean
  /**
   * Indica que o valor atual está vazio. Quando `obrigatorio && vazio`,
   * dispara a borda vermelha automaticamente (regra oficial). Default: false.
   * O consumidor calcula com `vazio={!valor}` ou `vazio={!valor.trim()}`.
   */
  vazio?: boolean
  /** Mensagem de erro (2ª camada — pós-validação). Pinta vermelho + texto. */
  erro?: string
  hint?: string
  /** ID do input filho — associa o `<label htmlFor>` ao input. */
  htmlFor?: string
}

export function CampoGeralGlobal({
  label,
  tooltipTitulo,
  tooltipDescricao,
  children,
  className = '',
  obrigatorio = false,
  vazio = false,
  erro,
  hint,
}: CampoGeralGlobalProps) {
  // Regra oficial: obrigatório + vazio dispara o estado visual de erro.
  const obrigatorioPendente = obrigatorio && vazio
  const mostrarVermelho = Boolean(erro) || obrigatorioPendente

  const compLabel = label ? (obrigatorio ? `${label} *` : label) : null

  return (
    <div className={`cg-wrapper ${mostrarVermelho ? 'cg-wrapper--erro' : ''} ${className}`.trim()}>
      {compLabel && (
        <label className="cg-label">
          {tooltipTitulo && tooltipDescricao ? (
            <TooltipGlobal titulo={tooltipTitulo} descricao={tooltipDescricao}>
              <span>{compLabel}</span>
            </TooltipGlobal>
          ) : (
            <span>{compLabel}</span>
          )}
        </label>
      )}
      {children}
      {hint && !erro && (
        <span className="cg-hint">{hint}</span>
      )}
      {erro && (
        <span className="cg-erro" role="alert">{erro}</span>
      )}
    </div>
  )
}
