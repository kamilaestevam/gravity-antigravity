/**
 * ModalNovoProcessoManual.tsx — Criação manual de processo (mock Onda 2).
 */
import React, { useState } from 'react'
import { Briefcase } from '@phosphor-icons/react'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { ProcessoAvoLinha } from '../../shared/lista/mockListaHierarquica'
import { ID_ORGANIZACAO_MOCK_LISTA } from '../../shared/lista/mockListaHierarquica'
import { lerStatusConfigProcesso } from '../../shared/lista/processoStatusConfig'

interface Props {
  aberto: boolean
  onFechar: () => void
  onCriar: (processo: ProcessoAvoLinha) => void
}

export function ModalNovoProcessoManual({ aberto, onFechar, onCriar }: Props) {
  const statusCfg = lerStatusConfigProcesso()
  const primeiroStatus = Object.entries(statusCfg).sort((a, b) => a[1].ordem - b[1].ordem)[0]

  const [numero, setNumero] = useState('')
  const [referencia, setReferencia] = useState('')
  const [tipo, setTipo] = useState<'importacao' | 'exportacao'>('importacao')
  const [carregando, setCarregando] = useState(false)

  const handleSalvar = () => {
    if (!numero.trim()) return
    setCarregando(true)
    try {
      const codigo = primeiroStatus?.[0] ?? 's2'
      const rotulo = primeiroStatus?.[1].label ?? 'Aberto'
      const cor = primeiroStatus?.[1].cor ?? '#60a5fa'
      onCriar({
        id_processo: `proc-${Date.now()}`,
        id_organizacao: ID_ORGANIZACAO_MOCK_LISTA,
        numero_processo: numero.trim(),
        codigo_status_processo: codigo,
        tipo_operacao_processo: tipo,
        rotulo_status_processo: rotulo,
        cor_status_processo: cor,
        referencia_interna_processo: referencia.trim() || null,
        nome_importador: '—',
        nome_exportador: '—',
        valor_total_agregado: 0,
        moeda_agregada: 'USD',
        peso_bruto_agregado: 0,
        data_criacao_processo: new Date().toISOString().slice(0, 10),
        responsavel_processo: '—',
      })
      setNumero('')
      setReferencia('')
      onFechar()
    } finally {
      setCarregando(false)
    }
  }

  return (
    <ModalFormularioGlobal
      aberto={aberto}
      aoFechar={onFechar}
      aoSalvar={handleSalvar}
      icone={<Briefcase size={24} weight="duotone" />}
      titulo="Novo processo"
      subtitulo="Preencha os dados básicos do processo"
      dirty
      podesSalvar={!!numero.trim() && !carregando}
      carregando={carregando}
      textoSalvar="Criar processo"
      tamanho="md"
      altura="420px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
        <CampoGeralGlobal label="Número do processo" obrigatorio>
          <input
            type="text"
            value={numero}
            placeholder="Ex: Gravity-00004/26"
            onChange={e => setNumero(e.target.value)}
          />
        </CampoGeralGlobal>
        <CampoGeralGlobal label="Referência interna">
          <input
            type="text"
            value={referencia}
            placeholder="Opcional"
            onChange={e => setReferencia(e.target.value)}
          />
        </CampoGeralGlobal>
        <CampoGeralGlobal label="Tipo de operação">
          <SelectGlobal
            opcoes={[
              { valor: 'importacao', rotulo: 'Importação' },
              { valor: 'exportacao', rotulo: 'Exportação' },
            ]}
            valor={tipo}
            aoMudarValor={v => setTipo((v ?? 'importacao') as 'importacao' | 'exportacao')}
          />
        </CampoGeralGlobal>
      </div>
    </ModalFormularioGlobal>
  )
}
