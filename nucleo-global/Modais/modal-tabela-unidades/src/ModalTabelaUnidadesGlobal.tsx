/**
 * ModalTabelaUnidadesGlobal.tsx — Modal com tabela de unidades de medida.
 *
 * SSOT: lista vem do banco `gravity-cadastros-*.unidade` via hook
 * `useUnidades`. Aceita prop `unidades` para override em testes/storybook.
 *
 * Uso típico:
 *   <ModalTabelaUnidadesGlobal
 *     aberto={open}
 *     aoFechar={() => setOpen(false)}
 *     aoSelecionar={(codigo) => setUnidade(codigo)}
 *     unidadeSelecionada={unidade}
 *   />
 */

import React, { useState } from 'react'
import { Ruler, MagnifyingGlass, Warning } from '@phosphor-icons/react'
import { ModalOverlay } from '@nucleo/modal-global'
import { useUnidades, type Unidade } from './useUnidades.js'
import './modal-tabela-unidades.css'

export interface ModalTabelaUnidadesProps {
  aberto: boolean
  aoFechar: () => void
  /** Callback ao selecionar uma unidade (recebe `codigo_unidade`) */
  aoSelecionar: (codigo: string) => void
  /** Código atualmente selecionado (para highlight) */
  unidadeSelecionada?: string | null
  /** Lista customizada (opcional — sobrepõe o hook, útil em testes/storybook) */
  unidades?: Unidade[]
}

export function ModalTabelaUnidadesGlobal({
  aberto,
  aoFechar,
  aoSelecionar,
  unidadeSelecionada,
  unidades: unidadesProp,
}: ModalTabelaUnidadesProps) {
  const [busca, setBusca] = useState('')
  const { unidades: unidadesHook, loading, erro } = useUnidades()
  const unidades = unidadesProp ?? unidadesHook

  const unidadesFiltradas = busca.trim()
    ? unidades.filter((u) =>
        u.codigo_unidade.toLowerCase().includes(busca.toLowerCase()) ||
        u.nome_unidade.toLowerCase().includes(busca.toLowerCase()) ||
        u.tipo_unidade.toLowerCase().includes(busca.toLowerCase())
      )
    : unidades

  function handleSelecionar(codigo: string) {
    aoSelecionar(codigo)
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
            placeholder="Buscar por sigla, descrição ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            autoFocus
            disabled={loading}
          />
        </div>

        {erro && !unidadesProp && (
          <div className="mtu-erro" role="alert">
            <Warning size={14} weight="fill" /> {erro}
          </div>
        )}

        {/* Tabela */}
        <div className="mtu-tabela-wrap">
          <table className="mtu-tabela">
            <thead>
              <tr>
                <th className="mtu-th mtu-th--sigla">Código</th>
                <th className="mtu-th mtu-th--descricao">Descrição</th>
                <th className="mtu-th mtu-th--categoria">Categoria</th>
                <th className="mtu-th mtu-th--acao" />
              </tr>
            </thead>
            <tbody>
              {loading && !unidadesProp ? (
                <tr>
                  <td colSpan={4} className="mtu-vazio">Carregando…</td>
                </tr>
              ) : unidadesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="mtu-vazio">
                    Nenhuma unidade encontrada
                  </td>
                </tr>
              ) : (
                unidadesFiltradas.map((u) => {
                  const ativa = u.codigo_unidade === unidadeSelecionada
                  return (
                    <tr
                      key={u.codigo_unidade}
                      className={`mtu-tr ${ativa ? 'mtu-tr--ativa' : ''}`}
                      onClick={() => handleSelecionar(u.codigo_unidade)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSelecionar(u.codigo_unidade)}
                      aria-selected={ativa}
                    >
                      <td className="mtu-td mtu-td--sigla">
                        <span className="mtu-sigla-badge">{u.codigo_unidade}</span>
                      </td>
                      <td className="mtu-td mtu-td--descricao">{u.nome_unidade}</td>
                      <td className="mtu-td mtu-td--categoria">{u.tipo_unidade}</td>
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
          Cadastros (banco) — categorias: peso, volume, comprimento, área, contagem, embalagem, caixa…
        </p>
      </div>
    </ModalOverlay>
  )
}
