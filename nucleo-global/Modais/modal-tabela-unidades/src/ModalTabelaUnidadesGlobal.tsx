/**
 * ModalTabelaUnidadesGlobal.tsx — Modal com tabela de unidades de medida Siscomex
 *
 * Uso:
 *   <ModalTabelaUnidadesGlobal
 *     aberto={open}
 *     aoFechar={() => setOpen(false)}
 *     aoSelecionar={(sigla) => setUnidade(sigla)}
 *     unidadeSelecionada={unidade}
 *   />
 */

import React, { useState } from 'react'
import { Ruler, MagnifyingGlass } from '@phosphor-icons/react'
import { ModalOverlay } from '@nucleo/modal-global'
import { UNIDADES_SISCOMEX, type UnidadeMedida } from './dados.js'
import './modal-tabela-unidades.css'

export interface ModalTabelaUnidadesProps {
  /** Controla visibilidade */
  aberto: boolean
  /** Fecha o modal */
  aoFechar: () => void
  /** Callback ao selecionar uma unidade */
  aoSelecionar: (sigla: string) => void
  /** Sigla atualmente selecionada (para highlight) */
  unidadeSelecionada?: string | null
  /** Lista customizada (opcional — usa UNIDADES_SISCOMEX por padrão) */
  unidades?: UnidadeMedida[]
}

export function ModalTabelaUnidadesGlobal({
  aberto,
  aoFechar,
  aoSelecionar,
  unidadeSelecionada,
  unidades = UNIDADES_SISCOMEX,
}: ModalTabelaUnidadesProps) {
  const [busca, setBusca] = useState('')

  const unidadesFiltradas = busca.trim()
    ? unidades.filter(u =>
        u.sigla.toLowerCase().includes(busca.toLowerCase()) ||
        u.descricao.toLowerCase().includes(busca.toLowerCase())
      )
    : unidades

  function handleSelecionar(sigla: string) {
    aoSelecionar(sigla)
    aoFechar()
  }

  return (
    <ModalOverlay
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Unidades de Medida"
      tamanho="md"
      altura="520px"
      botoes={[
        { rotulo: 'Fechar', variante: 'secondary', ao_clicar: aoFechar },
      ]}
    >
      <div className="mtu-modal-body">
        {/* Busca */}
        <div className="mtu-busca-wrap">
          <MagnifyingGlass size={14} weight="duotone" className="mtu-busca-icone" />
          <input
            type="text"
            className="mtu-busca-input"
            placeholder="Buscar por sigla ou descrição..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            autoFocus
          />
        </div>

        {/* Tabela */}
        <div className="mtu-tabela-wrap">
          <table className="mtu-tabela">
            <thead>
              <tr>
                <th className="mtu-th mtu-th--codigo">Cód.</th>
                <th className="mtu-th mtu-th--sigla">Sigla</th>
                <th className="mtu-th mtu-th--descricao">Descrição</th>
                <th className="mtu-th mtu-th--acao" />
              </tr>
            </thead>
            <tbody>
              {unidadesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="mtu-vazio">
                    Nenhuma unidade encontrada
                  </td>
                </tr>
              ) : (
                unidadesFiltradas.map(u => {
                  const ativa = u.sigla === unidadeSelecionada
                  return (
                    <tr
                      key={u.sigla}
                      className={`mtu-tr ${ativa ? 'mtu-tr--ativa' : ''}`}
                      onClick={() => handleSelecionar(u.sigla)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && handleSelecionar(u.sigla)}
                      aria-selected={ativa}
                    >
                      <td className="mtu-td mtu-td--codigo">
                        {u.codigo ?? '—'}
                      </td>
                      <td className="mtu-td mtu-td--sigla">
                        <span className="mtu-sigla-badge">{u.sigla}</span>
                      </td>
                      <td className="mtu-td mtu-td--descricao">{u.descricao}</td>
                      <td className="mtu-td mtu-td--acao">
                        {ativa && (
                          <span className="mtu-ativa-dot" aria-label="Selecionada" />
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
        <p className="mtu-fonte">
          <Ruler size={12} weight="duotone" />
          Padrão Siscomex — Portal Único
        </p>
      </div>
    </ModalOverlay>
  )
}
