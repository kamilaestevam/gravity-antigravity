/**
 * ImportarBloco.tsx — Upload de planilha CSV/XLSX para criar multiplas cotacoes em bloco
 * Drag-and-drop, preview de linhas parseadas, validacao e envio
 */

import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { cotacoesApi } from '../shared/api.js'
import type { TipoOperacao, ModalFrete, ModalidadeCarga } from '../shared/types.js'

interface ParsedRow {
  linha: number
  tipo_operacao: TipoOperacao
  modal: ModalFrete
  modalidade: ModalidadeCarga
  origem_codigo: string
  origem_nome: string
  origem_pais: string
  destino_codigo: string
  destino_nome: string
  destino_pais: string
  descricao_mercadoria: string
  ncm: string
  quantidade: number
  incoterm: string
  peso_kg?: number
  erros: string[]
}

const COLUNAS_ESPERADAS = [
  'tipo_operacao', 'modal', 'modalidade', 'origem_codigo', 'origem_nome', 'origem_pais',
  'destino_codigo', 'destino_nome', 'destino_pais', 'descricao_mercadoria', 'ncm',
  'quantidade', 'incoterm', 'peso_kg',
]

function parseCsv(text: string): string[][] {
  return text.trim().split('\n').map(line =>
    line.split(/[,;\t]/).map(cell => cell.trim().replace(/^"|"$/g, ''))
  )
}

function validarLinha(row: Record<string, string>, linha: number): ParsedRow {
  const erros: string[] = []
  if (!row.tipo_operacao || !['IMPORTACAO', 'EXPORTACAO'].includes(row.tipo_operacao)) {
    erros.push('tipo_operacao invalido')
  }
  if (!row.modal || !['MARITIMO', 'AEREO', 'RODOVIARIO'].includes(row.modal)) {
    erros.push('modal invalido')
  }
  if (!row.origem_codigo) erros.push('origem_codigo obrigatorio')
  if (!row.destino_codigo) erros.push('destino_codigo obrigatorio')
  if (!row.descricao_mercadoria) erros.push('descricao_mercadoria obrigatorio')
  if (!row.incoterm) erros.push('incoterm obrigatorio')
  const qtd = Number(row.quantidade)
  if (!qtd || qtd < 1) erros.push('quantidade invalida')

  return {
    linha,
    tipo_operacao: (row.tipo_operacao || 'IMPORTACAO') as TipoOperacao,
    modal: (row.modal || 'MARITIMO') as ModalFrete,
    modalidade: (row.modalidade || 'FCL') as ModalidadeCarga,
    origem_codigo: row.origem_codigo || '',
    origem_nome: row.origem_nome || '',
    origem_pais: row.origem_pais || '',
    destino_codigo: row.destino_codigo || '',
    destino_nome: row.destino_nome || '',
    destino_pais: row.destino_pais || '',
    descricao_mercadoria: row.descricao_mercadoria || '',
    ncm: row.ncm || '',
    quantidade: qtd || 1,
    incoterm: row.incoterm || '',
    peso_kg: row.peso_kg ? Number(row.peso_kg) : undefined,
    erros,
  }
}

export default function ImportarBloco() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<{ sucesso: number; erros: number } | null>(null)
  const [error, setError] = useState('')

  const processFile = useCallback((file: File) => {
    setError('')
    setResultado(null)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parsed = parseCsv(text)
        if (parsed.length < 2) {
          setError('Arquivo deve conter ao menos um cabecalho e uma linha de dados')
          return
        }
        const headers = parsed[0].map(h => h.toLowerCase().replace(/\s+/g, '_'))
        const dataRows = parsed.slice(1).filter(r => r.some(c => c.length > 0))
        const validated = dataRows.map((cells, idx) => {
          const record: Record<string, string> = {}
          headers.forEach((h, i) => { record[h] = cells[i] || '' })
          return validarLinha(record, idx + 2)
        })
        setRows(validated)
      } catch {
        setError('Erro ao processar arquivo. Verifique o formato CSV.')
      }
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const totalValidas = rows.filter(r => r.erros.length === 0).length
  const totalComErro = rows.filter(r => r.erros.length > 0).length

  async function enviarBloco() {
    const validas = rows.filter(r => r.erros.length === 0)
    if (validas.length === 0) return
    setEnviando(true)
    setError('')
    let sucesso = 0
    let erros = 0
    try {
      for (const row of validas) {
        try {
          await cotacoesApi.criar({
            tipo_operacao: row.tipo_operacao,
            modal: row.modal,
            modalidade: row.modalidade,
            origem_codigo: row.origem_codigo,
            origem_nome: row.origem_nome,
            origem_pais: row.origem_pais,
            destino_codigo: row.destino_codigo,
            destino_nome: row.destino_nome,
            destino_pais: row.destino_pais,
            descricao_mercadoria: row.descricao_mercadoria,
            ncm: row.ncm,
            quantidade: row.quantidade,
            incoterm: row.incoterm,
            peso_kg: row.peso_kg,
            visibilidade: 'DIRECIONADA',
            ocultar_nome_empresa: false,
          })
          sucesso++
        } catch {
          erros++
        }
      }
      setResultado({ sucesso, erros })
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar cotacoes')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Importar Cotacoes em Bloco</h1>
        <button onClick={() => navigate('/cotacoes')} className="px-4 py-2 border rounded text-sm">
          Voltar
        </button>
      </div>

      {/* Drag and Drop Area */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
        <div className="text-gray-500">
          <p className="text-lg font-medium">Arraste um arquivo CSV aqui ou clique para selecionar</p>
          <p className="text-sm mt-1">Formatos aceitos: .csv (separado por virgula, ponto-e-virgula ou tab)</p>
          <p className="text-xs mt-2 text-gray-400">
            Colunas esperadas: {COLUNAS_ESPERADAS.join(', ')}
          </p>
        </div>
      </div>

      {fileName && (
        <p className="text-sm text-gray-600">Arquivo: <span className="font-medium">{fileName}</span></p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">{error}</div>
      )}

      {resultado && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-sm">
          <p className="text-green-700 font-medium">Importacao concluida!</p>
          <p className="text-green-600">{resultado.sucesso} cotacoes criadas com sucesso</p>
          {resultado.erros > 0 && <p className="text-red-600">{resultado.erros} cotacoes com erro</p>}
          <button onClick={() => navigate('/cotacoes')} className="mt-2 text-blue-600 underline text-sm">
            Ver cotacoes
          </button>
        </div>
      )}

      {/* Preview Table */}
      {rows.length > 0 && (
        <>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{rows.length} linha(s) encontrada(s)</span>
            <span className="text-sm text-green-600">{totalValidas} valida(s)</span>
            {totalComErro > 0 && <span className="text-sm text-red-600">{totalComErro} com erro(s)</span>}
          </div>

          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-2 text-left">Linha</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Tipo</th>
                  <th className="p-2 text-left">Modal</th>
                  <th className="p-2 text-left">Origem</th>
                  <th className="p-2 text-left">Destino</th>
                  <th className="p-2 text-left">Mercadoria</th>
                  <th className="p-2 text-left">Incoterm</th>
                  <th className="p-2 text-left">Qtd</th>
                  <th className="p-2 text-left">Erros</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.linha} className={`border-b ${r.erros.length > 0 ? 'bg-red-50' : ''}`}>
                    <td className="p-2 text-xs">{r.linha}</td>
                    <td className="p-2">
                      {r.erros.length === 0
                        ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">OK</span>
                        : <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">Erro</span>
                      }
                    </td>
                    <td className="p-2">{r.tipo_operacao}</td>
                    <td className="p-2">{r.modal}</td>
                    <td className="p-2">{r.origem_codigo} {r.origem_nome}</td>
                    <td className="p-2">{r.destino_codigo} {r.destino_nome}</td>
                    <td className="p-2">{r.descricao_mercadoria}</td>
                    <td className="p-2">{r.incoterm}</td>
                    <td className="p-2">{r.quantidade}</td>
                    <td className="p-2 text-xs text-red-600">{r.erros.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={enviarBloco}
              disabled={enviando || totalValidas === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : `Criar ${totalValidas} cotacao(oes)`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
