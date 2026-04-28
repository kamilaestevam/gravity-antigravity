/**
 * ModalInserirNumerario.tsx — Criar/Editar numerário com lista dinâmica de despesas
 */

import { useState } from 'react'
import { numerario as numerarioApi } from '../../shared/api'
import type { FinanceiroNumerario } from '../../shared/types'
import { MOEDA_LABEL } from '../../shared/types'

interface DespesaLinha {
  descricao: string
  moeda: string
  taxa_cambio: string
  valor: string
  responsavel: string
}

interface Props {
  processoId: string
  numerario?: FinanceiroNumerario
  onClose: () => void
  onSalvo: () => void
}

export default function ModalInserirNumerario({ processoId, numerario, onClose, onSalvo }: Props) {
  const isEdicao = !!numerario

  const [descricao, setDescricao] = useState(numerario?.descricao ?? '')
  const [is_principal, setIsPrincipal] = useState(numerario?.is_principal ?? false)
  const [data, setData] = useState(numerario?.data?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
  const [despesas, setDespesas] = useState<DespesaLinha[]>(
    numerario?.despesas?.map(d => ({
      descricao: d.descricao,
      moeda: d.moeda,
      taxa_cambio: String(d.taxa_cambio),
      valor: String(d.valor),
      responsavel: d.responsavel ?? '',
    })) ?? []
  )
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function addDespesa() {
    setDespesas(prev => [...prev, { descricao: '', moeda: 'BRL', taxa_cambio: '1.0000000', valor: '', responsavel: '' }])
  }

  function updateDespesa(i: number, field: keyof DespesaLinha, value: string) {
    setDespesas(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d))
  }

  function removeDespesa(i: number) {
    setDespesas(prev => prev.filter((_, idx) => idx !== i))
  }

  async function salvar() {
    if (!descricao.trim()) { setErro('Informe a descricao do numerario'); return }
    if (!data) { setErro('Informe a data'); return }
    setSalvando(true)
    setErro('')
    try {
      const payload = {
        descricao,
        is_principal,
        data: new Date(data).toISOString(),
        despesas: despesas.filter(d => d.descricao && d.valor).map(d => ({
          descricao: d.descricao,
          moeda: d.moeda,
          taxa_cambio: parseFloat(d.taxa_cambio),
          valor: parseFloat(d.valor),
          responsavel: d.responsavel || undefined,
        })),
      }

      if (isEdicao && numerario) {
        await numerarioApi.editar(processoId, numerario.id, payload)
      } else {
        await numerarioApi.criar(processoId, payload)
      }
      onSalvo()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fincom-modal-overlay" onClick={onClose}>
      <div className="fincom-modal fincom-modal--lg" onClick={e => e.stopPropagation()}>
        <div className="fincom-modal__header">
          <h2>{isEdicao ? 'Editar Numerario' : 'Inserir Numerario'}</h2>
          <button className="fincom-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="fincom-modal__body">
          <label className="fincom-label">
            Descricao *
            <input type="text" className="fincom-input" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Numerario Principal" />
          </label>

          <div className="fincom-form-cols">
            <label className="fincom-label">
              Data *
              <input type="date" className="fincom-input" value={data} onChange={e => setData(e.target.value)} />
            </label>
            <label className="fincom-toggle-label fincom-toggle-label--inline">
              <input type="checkbox" checked={is_principal} onChange={e => setIsPrincipal(e.target.checked)} />
              <span>Numerario Principal</span>
            </label>
          </div>

          <div className="fincom-despesas-section">
            <div className="fincom-despesas-header">
              <span>Despesas</span>
              <button className="fincom-btn fincom-btn--ghost" onClick={addDespesa}>+ Adicionar linha</button>
            </div>

            {despesas.length > 0 && (
              <table className="fincom-table">
                <thead>
                  <tr>
                    <th>Descricao</th>
                    <th>Moeda</th>
                    <th>Taxa</th>
                    <th>Valor</th>
                    <th>Responsavel</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {despesas.map((d, i) => (
                    <tr key={i}>
                      <td>
                        <input type="text" className="fincom-input fincom-input--sm" value={d.descricao} onChange={e => updateDespesa(i, 'descricao', e.target.value)} />
                      </td>
                      <td>
                        <select className="fincom-select fincom-input--sm" value={d.moeda} onChange={e => updateDespesa(i, 'moeda', e.target.value)}>
                          {Object.entries(MOEDA_LABEL).map(([k]) => <option key={k} value={k}>{k}</option>)}
                        </select>
                      </td>
                      <td>
                        <input type="number" step="0.0000001" className="fincom-input fincom-input--sm" value={d.taxa_cambio} onChange={e => updateDespesa(i, 'taxa_cambio', e.target.value)} />
                      </td>
                      <td>
                        <input type="number" step="0.01" className="fincom-input fincom-input--sm" value={d.valor} onChange={e => updateDespesa(i, 'valor', e.target.value)} />
                      </td>
                      <td>
                        <input type="text" className="fincom-input fincom-input--sm" value={d.responsavel} onChange={e => updateDespesa(i, 'responsavel', e.target.value)} />
                      </td>
                      <td>
                        <button className="fincom-btn-icon" onClick={() => removeDespesa(i)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {erro && <p className="fincom-erro-msg">{erro}</p>}
        </div>

        <div className="fincom-modal__footer">
          <button className="fincom-btn fincom-btn--secondary" onClick={onClose}>Cancelar</button>
          <button className="fincom-btn fincom-btn--primary" onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
