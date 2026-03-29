/**
 * NovaCotacao.tsx — Wizard de Nova Cotacao (7 passos)
 * Passo 1: Modal e Operacao
 * Passo 2: Origem
 * Passo 3: Destino
 * Passo 4: Mercadoria e NCM
 * Passo 5: Incoterm e Zip Code
 * Passo 6: Fornecedores e Canais
 * Passo 7: Valor Referencial e Resumo
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cotacoesApi, fornecedoresApi, masterDataApi, bidsApi } from '../shared/api.js'

interface WizardData {
  tipo_operacao: string
  modal: string
  modalidade: string
  origem_codigo: string
  origem_nome: string
  origem_pais: string
  destino_codigo: string
  destino_nome: string
  destino_pais: string
  descricao_mercadoria: string
  ncm: string
  quantidade: number
  tipo_container: string
  peso_kg: number | undefined
  cubagem_m3: number | undefined
  incoterm: string
  zip_code_origem: string
  zip_code_destino: string
  valor_target: number | undefined
  moeda_target: string
  visibilidade: 'DIRECIONADA' | 'ABERTA'
  ocultar_nome_empresa: boolean
  data_limite_resposta: string
  fornecedor_ids: string[]
  canais: ('EMAIL' | 'WHATSAPP')[]
}

const PASSOS = [
  'Modal e Operacao',
  'Origem',
  'Destino',
  'Mercadoria',
  'Incoterm',
  'Fornecedores',
  'Resumo',
]

export default function NovaCotacao() {
  const navigate = useNavigate()
  const [passo, setPasso] = useState(0)
  const [data, setData] = useState<WizardData>({
    tipo_operacao: 'IMPORTACAO',
    modal: 'MARITIMO',
    modalidade: 'FCL',
    origem_codigo: '', origem_nome: '', origem_pais: '',
    destino_codigo: '', destino_nome: '', destino_pais: '',
    descricao_mercadoria: '', ncm: '',
    quantidade: 1, tipo_container: '20DRY',
    peso_kg: undefined, cubagem_m3: undefined,
    incoterm: 'FOB',
    zip_code_origem: '', zip_code_destino: '',
    valor_target: undefined, moeda_target: 'USD',
    visibilidade: 'DIRECIONADA',
    ocultar_nome_empresa: false,
    data_limite_resposta: '',
    fornecedor_ids: [],
    canais: ['EMAIL'],
  })
  const [masterData, setMasterData] = useState<any>({})
  const [fornecedores, setFornecedores] = useState<any[]>([])
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    Promise.all([
      masterDataApi.modais(),
      masterDataApi.incoterms(),
      masterDataApi.containers(),
      fornecedoresApi.listar({ limit: 100 }),
    ]).then(([modais, incoterms, containers, forn]) => {
      setMasterData({ modais: modais.modais, incoterms: incoterms.incoterms, containers: containers.containers })
      setFornecedores(forn.fornecedores)
    })
  }, [])

  const update = (fields: Partial<WizardData>) => setData(prev => ({ ...prev, ...fields }))

  async function enviar() {
    setEnviando(true)
    try {
      const { fornecedor_ids, canais, ...cotacaoData } = data
      const res = await cotacoesApi.criar(cotacaoData)

      if (fornecedor_ids.length > 0) {
        await bidsApi.disparar({
          cotacao_id: res.cotacao.id,
          fornecedor_ids,
          canais,
        })
      } else if (data.visibilidade === 'ABERTA') {
        await bidsApi.dispararAberto({
          cotacao_id: res.cotacao.id,
          canais,
        })
      }

      navigate(`/cotacoes/${res.cotacao.id}`)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nova Cotacao de Frete</h1>

      {/* Stepper */}
      <div className="flex gap-1 mb-8">
        {PASSOS.map((p, i) => (
          <div key={i} className={`flex-1 h-2 rounded ${i <= passo ? 'bg-blue-600' : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className="text-sm text-gray-500 mb-4">Passo {passo + 1} de {PASSOS.length} — {PASSOS[passo]}</p>

      {/* Passo 1: Modal e Operacao */}
      {passo === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Operacao</label>
            <select value={data.tipo_operacao} onChange={e => update({ tipo_operacao: e.target.value })} className="w-full border rounded p-2">
              <option value="IMPORTACAO">Importacao</option>
              <option value="EXPORTACAO">Exportacao</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Modal</label>
            <div className="grid grid-cols-3 gap-2">
              {['MARITIMO', 'AEREO', 'RODOVIARIO'].map(m => (
                <button key={m} onClick={() => update({ modal: m })} className={`p-3 border rounded text-center ${data.modal === m ? 'border-blue-600 bg-blue-50' : ''}`}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Modalidade</label>
            <select value={data.modalidade} onChange={e => update({ modalidade: e.target.value })} className="w-full border rounded p-2">
              <option value="FCL">FCL (Container cheio)</option>
              <option value="LCL">LCL (Carga fracionada)</option>
              <option value="AEREO_GERAL">Aereo - Carga geral</option>
              <option value="RODOVIARIO_FTL">Rodoviario - Caminhao cheio</option>
              <option value="RODOVIARIO_LTL">Rodoviario - Carga fracionada</option>
            </select>
          </div>
        </div>
      )}

      {/* Passo 2: Origem */}
      {passo === 1 && (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Codigo (UN/LOCODE)</label>
            <input value={data.origem_codigo} onChange={e => update({ origem_codigo: e.target.value })} className="w-full border rounded p-2" placeholder="ex: CNSHA" /></div>
          <div><label className="block text-sm font-medium mb-1">Nome</label>
            <input value={data.origem_nome} onChange={e => update({ origem_nome: e.target.value })} className="w-full border rounded p-2" placeholder="ex: Shanghai" /></div>
          <div><label className="block text-sm font-medium mb-1">Pais</label>
            <input value={data.origem_pais} onChange={e => update({ origem_pais: e.target.value })} className="w-full border rounded p-2" placeholder="ex: China" /></div>
        </div>
      )}

      {/* Passo 3: Destino */}
      {passo === 2 && (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Codigo (UN/LOCODE)</label>
            <input value={data.destino_codigo} onChange={e => update({ destino_codigo: e.target.value })} className="w-full border rounded p-2" placeholder="ex: BRSSZ" /></div>
          <div><label className="block text-sm font-medium mb-1">Nome</label>
            <input value={data.destino_nome} onChange={e => update({ destino_nome: e.target.value })} className="w-full border rounded p-2" placeholder="ex: Santos" /></div>
          <div><label className="block text-sm font-medium mb-1">Pais</label>
            <input value={data.destino_pais} onChange={e => update({ destino_pais: e.target.value })} className="w-full border rounded p-2" placeholder="ex: Brasil" /></div>
        </div>
      )}

      {/* Passo 4: Mercadoria */}
      {passo === 3 && (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Descricao da Mercadoria</label>
            <input value={data.descricao_mercadoria} onChange={e => update({ descricao_mercadoria: e.target.value })} className="w-full border rounded p-2" placeholder="ex: Auto Parts" /></div>
          <div><label className="block text-sm font-medium mb-1">NCM</label>
            <input value={data.ncm} onChange={e => update({ ncm: e.target.value })} className="w-full border rounded p-2" placeholder="ex: 8708.99.90" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Quantidade</label>
              <input type="number" value={data.quantidade} onChange={e => update({ quantidade: Number(e.target.value) })} className="w-full border rounded p-2" /></div>
            <div><label className="block text-sm font-medium mb-1">Container</label>
              <select value={data.tipo_container} onChange={e => update({ tipo_container: e.target.value })} className="w-full border rounded p-2">
                {masterData.containers?.map((c: any) => <option key={c.codigo} value={c.codigo}>{c.nome}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Peso (kg)</label>
              <input type="number" value={data.peso_kg ?? ''} onChange={e => update({ peso_kg: e.target.value ? Number(e.target.value) : undefined })} className="w-full border rounded p-2" /></div>
          </div>
        </div>
      )}

      {/* Passo 5: Incoterm */}
      {passo === 4 && (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Incoterm</label>
            <select value={data.incoterm} onChange={e => update({ incoterm: e.target.value })} className="w-full border rounded p-2">
              {masterData.incoterms?.map((i: any) => <option key={i.codigo} value={i.codigo}>{i.codigo} - {i.nome}</option>)}
            </select></div>
          {data.incoterm === 'EXW' && (
            <div><label className="block text-sm font-medium mb-1">Zip Code Origem</label>
              <input value={data.zip_code_origem} onChange={e => update({ zip_code_origem: e.target.value })} className="w-full border rounded p-2" /></div>
          )}
          <div><label className="block text-sm font-medium mb-1">Data Limite de Resposta</label>
            <input type="datetime-local" value={data.data_limite_resposta} onChange={e => update({ data_limite_resposta: e.target.value })} className="w-full border rounded p-2" /></div>
        </div>
      )}

      {/* Passo 6: Fornecedores */}
      {passo === 5 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Visibilidade</label>
            <div className="flex gap-2">
              <button onClick={() => update({ visibilidade: 'DIRECIONADA' })} className={`px-4 py-2 border rounded ${data.visibilidade === 'DIRECIONADA' ? 'border-blue-600 bg-blue-50' : ''}`}>Direcionada</button>
              <button onClick={() => update({ visibilidade: 'ABERTA' })} className={`px-4 py-2 border rounded ${data.visibilidade === 'ABERTA' ? 'border-blue-600 bg-blue-50' : ''}`}>Aberta (todos)</button>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={data.ocultar_nome_empresa} onChange={e => update({ ocultar_nome_empresa: e.target.checked })} />
              Ocultar nome da empresa (cotacao anonima)
            </label>
          </div>
          {data.visibilidade === 'DIRECIONADA' && (
            <div>
              <label className="block text-sm font-medium mb-1">Selecionar Fornecedores</label>
              <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-1">
                {fornecedores.map((f: any) => (
                  <label key={f.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.fornecedor_ids.includes(f.id)}
                      onChange={e => {
                        const ids = e.target.checked
                          ? [...data.fornecedor_ids, f.id]
                          : data.fornecedor_ids.filter(id => id !== f.id)
                        update({ fornecedor_ids: ids })
                      }}
                    />
                    <span className="text-sm">{f.nome}</span>
                    <span className="text-xs text-gray-400">{f.tipo}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Canais de Disparo</label>
            <div className="flex gap-2">
              {(['EMAIL', 'WHATSAPP'] as const).map(c => (
                <label key={c} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={data.canais.includes(c)}
                    onChange={e => {
                      const canais = e.target.checked
                        ? [...data.canais, c]
                        : data.canais.filter(x => x !== c)
                      update({ canais })
                    }}
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Passo 7: Resumo */}
      {passo === 6 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Valor Referencial / Target (opcional)</label>
            <div className="flex gap-2">
              <select value={data.moeda_target} onChange={e => update({ moeda_target: e.target.value })} className="border rounded p-2 w-24">
                <option value="USD">USD</option><option value="BRL">BRL</option><option value="EUR">EUR</option>
              </select>
              <input type="number" value={data.valor_target ?? ''} onChange={e => update({ valor_target: e.target.value ? Number(e.target.value) : undefined })} className="flex-1 border rounded p-2" placeholder="Valor que deseja atingir" />
            </div>
          </div>
          <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
            <h3 className="font-semibold">Resumo da Cotacao</h3>
            <p>{data.tipo_operacao} | {data.modal} | {data.modalidade}</p>
            <p>{data.origem_nome} ({data.origem_pais}) → {data.destino_nome} ({data.destino_pais})</p>
            <p>Mercadoria: {data.descricao_mercadoria} {data.ncm ? `(NCM: ${data.ncm})` : ''}</p>
            <p>Incoterm: {data.incoterm}</p>
            <p>Fornecedores: {data.visibilidade === 'ABERTA' ? 'Aberta para todos' : `${data.fornecedor_ids.length} selecionados`}</p>
            <p>Canais: {data.canais.join(', ')}</p>
          </div>
        </div>
      )}

      {/* Navegacao */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => passo > 0 ? setPasso(passo - 1) : navigate('/cotacoes')}
          className="px-4 py-2 border rounded text-sm"
        >{passo > 0 ? 'Voltar' : 'Cancelar'}</button>

        {passo < PASSOS.length - 1 ? (
          <button onClick={() => setPasso(passo + 1)} className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            Proximo
          </button>
        ) : (
          <button onClick={enviar} disabled={enviando} className="px-6 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
            {enviando ? 'Enviando...' : 'Enviar Cotacao'}
          </button>
        )}
      </div>
    </div>
  )
}
