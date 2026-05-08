/**
 * ModalTabelaMoedaGlobal.tsx — Modal com tabela de moedas (ISO 4217)
 *
 * SSOT: lista vem do banco `gravity-cadastros-*.moeda` via hook `useMoedas`.
 * Aceita prop `moedas` para override em testes/storybook.
 *
 * Uso típico:
 *   <ModalTabelaMoedaGlobal
 *     aberto={open}
 *     aoFechar={() => setOpen(false)}
 *     aoSelecionar={(codigo) => setMoeda(codigo)}
 *     moedaSelecionada={moeda}
 *   />
 */

import React, { useState } from 'react'
import { CurrencyDollar, MagnifyingGlass, Warning } from '@phosphor-icons/react'
import { ModalOverlay } from '@nucleo/modal-global'
import { useMoedas, type Moeda } from './useMoedas.js'
import './modal-tabela-moeda.css'

export interface ModalTabelaMoedaProps {
  /** Controla visibilidade */
  aberto: boolean
  /** Fecha o modal */
  aoFechar: () => void
  /** Callback ao selecionar uma moeda (recebe código ISO alpha-3) */
  aoSelecionar: (codigo: string) => void
  /** Código atualmente selecionado (para highlight) */
  moedaSelecionada?: string | null
  /** Lista customizada (opcional — sobrepõe o hook, útil em testes/storybook) */
  moedas?: Moeda[]
}

export function ModalTabelaMoedaGlobal({
  aberto,
  aoFechar,
  aoSelecionar,
  moedaSelecionada,
  moedas: moedasProp,
}: ModalTabelaMoedaProps) {
  const [busca, setBusca] = useState('')
  const { moedas: moedasHook, loading, erro } = useMoedas()
  const moedas = moedasProp ?? moedasHook

  const moedasFiltradas = busca.trim()
    ? moedas.filter((m) =>
        m.codigo_moeda.toLowerCase().includes(busca.toLowerCase()) ||
        m.nome_moeda.toLowerCase().includes(busca.toLowerCase())
      )
    : moedas

  function handleSelecionar(codigo: string) {
    aoSelecionar(codigo)
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
            placeholder="Buscar por sigla ou descrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            autoFocus
            disabled={loading}
          />
        </div>

        {/* Erro de carga (Mandamento 08 — sem fallback silencioso) */}
        {erro && !moedasProp && (
          <div className="mtm-erro" role="alert">
            <Warning size={14} weight="fill" /> {erro}
          </div>
        )}

        {/* Tabela */}
        <div className="mtm-tabela-wrap">
          <table className="mtm-tabela">
            <thead>
              <tr>
                <th className="mtm-th mtm-th--sigla">Código</th>
                <th className="mtm-th mtm-th--descricao">Descrição</th>
                <th className="mtm-th mtm-th--acao" />
              </tr>
            </thead>
            <tbody>
              {loading && !moedasProp ? (
                <tr>
                  <td colSpan={3} className="mtm-vazio">Carregando…</td>
                </tr>
              ) : moedasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="mtm-vazio">
                    Nenhuma moeda encontrada
                  </td>
                </tr>
              ) : (
                moedasFiltradas.map((m) => {
                  const ativa = m.codigo_moeda === moedaSelecionada
                  return (
                    <tr
                      key={m.codigo_moeda}
                      className={`mtm-tr ${ativa ? 'mtm-tr--ativa' : ''}`}
                      onClick={() => handleSelecionar(m.codigo_moeda)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSelecionar(m.codigo_moeda)}
                      aria-selected={ativa}
                    >
                      <td className="mtm-td mtm-td--sigla">
                        <span className="mtm-sigla-badge">{m.codigo_moeda}</span>
                      </td>
                      <td className="mtm-td mtm-td--descricao">{m.nome_moeda}</td>
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
          ISO 4217 — Cadastros (banco)
        </p>
      </div>
    </ModalOverlay>
  )
}
