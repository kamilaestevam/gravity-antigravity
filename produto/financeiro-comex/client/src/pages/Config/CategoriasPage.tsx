/**
 * CategoriasPage.tsx — Catálogo de categorias de despesa (por tenant)
 */

import { useState, useEffect } from 'react'
import { categorias as categoriasApi } from '../../shared/api'
import type { FinanceiroCategorias } from '../../shared/types'

export default function CategoriasPage() {
  const [lista, setLista] = useState<FinanceiroCategorias[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<FinanceiroCategorias | null>(null)
  const [criando, setCriando] = useState(false)

  // Form state
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [grupo_custo, setGrupoCusto] = useState<'IMPOSTOS_FEDERAIS' | 'CUSTO_OPERACIONAL'>('CUSTO_OPERACIONAL')
  const [tipo_operacao, setTipoOperacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function carregar() {
    setLoading(true)
    try {
      const res = await categoriasApi.listar()
      setLista(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  function abrirEdicao(cat: FinanceiroCategorias) {
    setEditando(cat)
    setCodigo(cat.codigo)
    setNome(cat.nome)
    setGrupoCusto(cat.grupo_custo)
    setTipoOperacao(cat.tipo_operacao ?? '')
    setErro('')
  }

  function abrirCriar() {
    setEditando(null)
    setCriando(true)
    setCodigo('')
    setNome('')
    setGrupoCusto('CUSTO_OPERACIONAL')
    setTipoOperacao('')
    setErro('')
  }

  function cancelar() {
    setEditando(null)
    setCriando(false)
  }

  async function salvar() {
    if (!codigo.trim() || !nome.trim()) { setErro('Codigo e nome sao obrigatorios'); return }
    setSalvando(true)
    setErro('')
    try {
      const payload = {
        codigo,
        nome,
        grupo_custo,
        tipo_operacao: tipo_operacao || undefined,
        ativo: true,
      }
      if (editando) {
        await categoriasApi.editar(editando.id, payload)
      } else {
        await categoriasApi.criar(payload)
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
    if (!confirm('Excluir esta categoria?')) return
    await categoriasApi.excluir(id)
    carregar()
  }

  return (
    <div className="fincom-page">
      <div className="fincom-acoes">
        <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary, #e0e0f0)' }}>Categorias</h1>
        <button className="fincom-btn fincom-btn--primary" onClick={abrirCriar}>+ Nova Categoria</button>
      </div>

      {(criando || editando) && (
        <div className="fincom-form-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {editando ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <div className="fincom-form-cols">
            <label className="fincom-label">
              Codigo *
              <input type="text" className="fincom-input" value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ex: 300" />
            </label>
            <label className="fincom-label">
              Nome *
              <input type="text" className="fincom-input" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Frete Internacional" />
            </label>
          </div>
          <div className="fincom-form-cols">
            <label className="fincom-label">
              Grupo de Custo
              <select className="fincom-select" value={grupo_custo} onChange={e => setGrupoCusto(e.target.value as typeof grupo_custo)}>
                <option value="CUSTO_OPERACIONAL">Custo Operacional</option>
                <option value="IMPOSTOS_FEDERAIS">Impostos Federais</option>
              </select>
            </label>
            <label className="fincom-label">
              Tipo de Operacao
              <select className="fincom-select" value={tipo_operacao} onChange={e => setTipoOperacao(e.target.value)}>
                <option value="">Ambas</option>
                <option value="IMPORTACAO">Importacao</option>
                <option value="EXPORTACAO">Exportacao</option>
              </select>
            </label>
          </div>
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
              <tr>
                <th>Codigo</th>
                <th>Nome</th>
                <th>Grupo</th>
                <th>Operacao</th>
                <th>Ativo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lista.map(cat => (
                <tr key={cat.id} className="fincom-table__row" onClick={() => abrirEdicao(cat)}>
                  <td className="fincom-monospace">{cat.codigo}</td>
                  <td>{cat.nome}</td>
                  <td>{cat.grupo_custo === 'IMPOSTOS_FEDERAIS' ? 'Impostos Federais' : 'Custo Operacional'}</td>
                  <td>{cat.tipo_operacao ?? 'Ambas'}</td>
                  <td>{cat.ativo ? '✓' : '—'}</td>
                  <td>
                    <button className="fincom-btn-icon" onClick={e => { e.stopPropagation(); excluir(cat.id) }}>🗑</button>
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
