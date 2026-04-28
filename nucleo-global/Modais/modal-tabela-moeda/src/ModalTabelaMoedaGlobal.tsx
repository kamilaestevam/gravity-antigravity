/**
 * ModalTabelaMoedaGlobal.tsx — Modal com tabela de moedas ISO 4217 / Siscomex
 *
 * Uso:
 *   <ModalTabelaMoedaGlobal
 *     aberto={open}
 *     aoFechar={() => setOpen(false)}
 *     aoSelecionar={(sigla) => setMoeda(sigla)}
 *     moedaSelecionada={moeda}
 *   />
 */

import React, { useState } from 'react'
import { CurrencyDollar, MagnifyingGlass } from '@phosphor-icons/react'
import { ModalOverlay } from '@nucleo/modal-global'
import { MOEDAS_SISCOMEX, type MoedaSiscomex } from './dados.js'
import './modal-tabela-moeda.css'

export interface ModalTabelaMoedaProps {
  /** Controla visibilidade */
  aberto: boolean
  /** Fecha o modal */
  aoFechar: () => void
  /** Callback ao selecionar uma moeda */
  aoSelecionar: (sigla: string) => void
  /** Sigla atualmente selecionada (para highlight) */
  moedaSelecionada?: string | null
  /** Lista customizada (opcional — usa MOEDAS_SISCOMEX por padrão) */
  moedas?: MoedaSiscomex[]
}

export function ModalTabelaMoedaGlobal({
  aberto,
  aoFechar,
  aoSelecionar,
  moedaSelecionada,
  moedas = MOEDAS_SISCOMEX,
}: ModalTabelaMoedaProps) {
  const [busca, setBusca] = useState('')

  const moedasFiltradas = busca.trim()
    ? moedas.filter(m =>
        m.sigla.toLowerCase().includes(busca.toLowerCase()) ||
        m.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        String(m.codigo).includes(busca)
      )
    : moedas

  function handleSelecionar(sigla: string) {
    aoSelecionar(sigla)
    aoFechar()
  }

  return (
    <ModalOverlay
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Moedas"
      tamanho="md"
      altura="560px"
      botoes={[
        { rotulo: 'Fechar', variante: 'secondary', ao_clicar: aoFechar },
      ]}
    >
      <div className="mtm-modal-body">
        {/* Busca */}
        <div className="mtm-busca-wrap">
          <MagnifyingGlass size={14} weight="duotone" className="mtm-busca-icone" />
          <input
            type="text"
            className="mtm-busca-input"
            placeholder="Buscar por sigla, descrição ou código..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            autoFocus
          />
        </div>

        {/* Tabela */}
        <div className="mtm-tabela-wrap">
          <table className="mtm-tabela">
            <thead>
              <tr>
                <th className="mtm-th mtm-th--codigo">Cód.</th>
                <th className="mtm-th mtm-th--sigla">Sigla</th>
                <th className="mtm-th mtm-th--descricao">Descrição</th>
                <th className="mtm-th mtm-th--acao" />
              </tr>
            </thead>
            <tbody>
              {moedasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="mtm-vazio">
                    Nenhuma moeda encontrada
                  </td>
                </tr>
              ) : (
                moedasFiltradas.map(m => {
                  const ativa = m.sigla === moedaSelecionada
                  return (
                    <tr
                      key={m.sigla}
                      className={`mtm-tr ${ativa ? 'mtm-tr--ativa' : ''}`}
                      onClick={() => handleSelecionar(m.sigla)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && handleSelecionar(m.sigla)}
                      aria-selected={ativa}
                    >
                      <td className="mtm-td mtm-td--codigo">{m.codigo}</td>
                      <td className="mtm-td mtm-td--sigla">
                        <span className="mtm-sigla-badge">{m.sigla}</span>
                      </td>
                      <td className="mtm-td mtm-td--descricao">{m.descricao}</td>
                      <td className="mtm-td mtm-td--acao">
                        {ativa && (
                          <span className="mtm-ativa-dot" aria-label="Selecionada" />
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé informativo */}
        <p className="mtm-fonte">
          <CurrencyDollar size={12} weight="duotone" />
          ISO 4217 — Padrão Siscomex
        </p>
      </div>
    </ModalOverlay>
  )
}
