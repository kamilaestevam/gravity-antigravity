/**
 * CondicoesPagamentoPage.tsx — Condições de pagamento (por tenant)
 */

import { useState, useEffect } from 'react'
import { condicoes as condicoesApi } from '../../shared/api'
import type { FinanceiroCondicaoPagamento } from '../../shared/types'

export default function CondicoesPagamentoPage() {
  const [lista, setLista] = useState<FinanceiroCondicaoPagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<FinanceiroCondicaoPagamento | null>(null)
  const [criando, setCriando] = useState(false)

  const [codigo, setCodigo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [dias_prazo, setDiasPrazo] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function carregar() {
    setLoading(true)
    try {
      const res = await condicoesApi.listar()
      setLista(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  function abrirEdicao(cond: FinanceiroCondicaoPagamento) {
    setEditando(cond)
    setCodigo(cond.codigo)
    setDescricao(cond.descricao)
    setDiasPrazo(String(cond.dias_prazo ?? ''))
    setErro('')
  }

  function abrirCriar() {
    setEditando(null)
    setCriando(true)
    setCodigo('')
    setDescricao('')
    setDiasPrazo('')
    setErro('')
  }

  function cancelar() { setEditando(null); setCriando(false) }

  async function salvar() {
    if (!codigo.trim() || !descricao.trim()) { setErro('Codigo e descricao sao obrigatorios'); return }
    setSalvando(true)
    setErro('')
    try {
      const payload = {
        codigo,
        descricao,
        dias_prazo: dias_prazo ? parseInt(dias_prazo) : undefined,
        ativo: true,
      }
      if (editando) {
        await condicoesApi.editar(editando.id, payload)
      } else {
        await condicoesApi.criar(payload)
      }
      await carregar()
      cancelar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta condicao?')) return
    await condicoesApi.excluir(id)
    carregar()
  }

  return (
    <div className="fincom-page">
      <div className="fincom-acoes">
        <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary, #e0e0f0)' }}>Condicoes de Pagamento</h1>
        <button className="fincom-btn fincom-btn--primary" onClick={abrirCriar}>+ Nova Condicao</button>
      </div>

      {(criando || editando) && (
        <div className="fincom-form-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {editando ? 'Editar Condicao' : 'Nova Condicao'}
          </h3>
          <div className="fincom-form-cols">
            <label className="fincom-label">
              Codigo *
              <input type="text" className="fincom-input" value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ex: 002" />
            </label>
            <label className="fincom-label">
              Dias de Prazo
              <input type="number" className="fincom-input" value={dias_prazo} onChange={e => setDiasPrazo(e.target.value)} placeholder="Ex: 60" />
            </label>
          </div>
          <label className="fincom-label">
            Descricao *
            <input type="text" className="fincom-input" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Pagamento em 60 dias" />
          </label>
          {erro && <p className="fincom-erro-msg">{erro}</p>}
          <div className="fincom-form-btns">
            <button className="fincom-btn fincom-btn--secondary" onClick={cancelar}>Cancelar</button>
            <button className="fincom-btn fincom-btn--primary" onClick={salvar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="fincom-skeleton fincom-skeleton--table" />
      ) : (
        <div className="fincom-table-wrapper">
          <table className="fincom-table">
            <thead>
              <tr><th>Codigo</th><th>Descricao</th><th>Dias</th><th>Ativo</th><th></th></tr>
            </thead>
            <tbody>
              {lista.map(cond => (
                <tr key={cond.id} className="fincom-table__row" onClick={() => abrirEdicao(cond)}>
                  <td className="fincom-monospace">{cond.codigo}</td>
                  <td>{cond.descricao}</td>
                  <td>{cond.dias_prazo ?? '—'}</td>
                  <td>{cond.ativo ? '✓' : '—'}</td>
                  <td>
                    <button className="fincom-btn-icon" onClick={e => { e.stopPropagation(); excluir(cond.id) }}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
