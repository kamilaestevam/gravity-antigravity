/**
 * ModalImportar.tsx — Importação multi-canal (XML DUIMP, Portal Único, Smart Read, Planilha)
 */

import { useState } from 'react'
import { importar } from '../../shared/api'

interface Props {
  processoId: string
  onClose: () => void
  onImportado: () => void
}

type Canal = 'xml' | 'portal_unico' | 'smart_read' | 'planilha'

interface LancamentoPreview {
  categoria_codigo: string
  descricao: string
  moeda: string
  taxa_cambio: number
  valor: number
  icms_origem_portal?: boolean
  selecionado?: boolean
}

export default function ModalImportarLancamentos({ processoId, onClose, onImportado }: Props) {
  const [canal, setCanal] = useState<Canal>('xml')
  const [xmlContent, setXmlContent] = useState('')
  const [duimpNumero, setDuimpNumero] = useState('')
  const [preview, setPreview] = useState<LancamentoPreview[]>([])
  const [buscando, setBuscando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro] = useState('')

  async function buscar() {
    setErro('')
    setBuscando(true)
    try {
      let res
      if (canal === 'xml') {
        if (!xmlContent.trim()) { setErro('Cole o conteudo XML da DUIMP'); setBuscando(false); return }
        res = await importar.previewXml(processoId, xmlContent)
      } else if (canal === 'portal_unico') {
        if (!duimpNumero.trim()) { setErro('Informe o numero da DUIMP'); setBuscando(false); return }
        res = await importar.previewPortalUnico(processoId, duimpNumero)
      } else {
        setErro('Canal em implementacao. Use XML ou Portal Unico.')
        setBuscando(false)
        return
      }
      setPreview((res.data as LancamentoPreview[]).map(l => ({ ...l, selecionado: true })))
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao buscar impostos')
    } finally {
      setBuscando(false)
    }
  }

  async function confirmar() {
    const selecionados = preview.filter(l => l.selecionado)
    if (selecionados.length === 0) { setErro('Selecione ao menos um lancamento'); return }
    setConfirmando(true)
    try {
      if (canal === 'xml') {
        await importar.confirmarXml(processoId, selecionados)
      } else {
        await importar.confirmarPortalUnico(processoId, selecionados)
      }
      onImportado()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao confirmar importacao')
    } finally {
      setConfirmando(false)
    }
  }

  function toggleItem(i: number) {
    setPreview(prev => prev.map((l, idx) => idx === i ? { ...l, selecionado: !l.selecionado } : l))
  }

  return (
    <div className="fincom-modal-overlay" onClick={onClose}>
      <div className="fincom-modal fincom-modal--lg" onClick={e => e.stopPropagation()}>
        <div className="fincom-modal__header">
          <h2>Importar Lancamentos</h2>
          <button className="fincom-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="fincom-modal__body">
          {/* Seleção de canal */}
          <div className="fincom-canal-tabs">
            {(['xml', 'portal_unico', 'smart_read', 'planilha'] as Canal[]).map(c => (
              <button
                key={c}
                className={`fincom-canal-tab ${canal === c ? 'fincom-canal-tab--active' : ''}`}
                onClick={() => { setCanal(c); setPreview([]); setErro('') }}
              >
                {c === 'xml' ? 'XML (DUIMP)' : c === 'portal_unico' ? 'Portal Unico' : c === 'smart_read' ? 'Smart Read' : 'Planilha'}
              </button>
            ))}
          </div>

          {canal === 'xml' && (
            <label className="fincom-label">
              Cole o conteudo XML da DUIMP
              <textarea
                className="fincom-input fincom-textarea fincom-textarea--lg"
                placeholder="<?xml version..."
                value={xmlContent}
                onChange={e => setXmlContent(e.target.value)}
              />
            </label>
          )}

          {canal === 'portal_unico' && (
            <label className="fincom-label">
              Numero da DUIMP
              <input
                type="text"
                className="fincom-input"
                placeholder="Ex: 2515896315"
                value={duimpNumero}
                onChange={e => setDuimpNumero(e.target.value)}
              />
            </label>
          )}

          {(canal === 'smart_read' || canal === 'planilha') && (
            <p className="fincom-info">
              {canal === 'smart_read'
                ? 'Smart Read: envia PDF ou imagem de fatura para OCR. Disponivel em breve.'
                : 'Planilha: baixe o template, preencha e envie. Disponivel em breve.'}
            </p>
          )}

          {erro && <p className="fincom-erro-msg">{erro}</p>}

          {preview.length === 0 ? (
            <button
              className="fincom-btn fincom-btn--primary"
              onClick={buscar}
              disabled={buscando}
            >
              {buscando ? 'Buscando...' : 'Buscar'}
            </button>
          ) : (
            <div>
              <p className="fincom-preview-titulo">{preview.length} lancamento(s) encontrado(s) — selecione os que deseja importar:</p>
              <table className="fincom-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Descricao</th>
                    <th>Moeda</th>
                    <th>Taxa</th>
                    <th>Valor</th>
                    <th>ICMS Portal</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((l, i) => (
                    <tr key={i}>
                      <td><input type="checkbox" checked={!!l.selecionado} onChange={() => toggleItem(i)} /></td>
                      <td>{l.descricao}</td>
                      <td>{l.moeda}</td>
                      <td>{l.taxa_cambio?.toFixed(7)}</td>
                      <td>{l.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td>{l.icms_origem_portal ? 'Sim' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="fincom-modal__footer">
          <button className="fincom-btn fincom-btn--secondary" onClick={onClose}>Cancelar</button>
          {preview.length > 0 && (
            <button className="fincom-btn fincom-btn--primary" onClick={confirmar} disabled={confirmando}>
              {confirmando ? 'Importando...' : `Confirmar (${preview.filter(l => l.selecionado).length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
