/**
 * ModalEdicaoMassaProcesso.tsx — Edição em massa de processos (mock).
 */
import React, { useMemo, useState } from 'react'
import { PencilLine } from '@phosphor-icons/react'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import type { ProcessoAvoLinha } from '../../shared/lista/mockListaHierarquica'
import { lerStatusConfigProcesso } from '../../shared/lista/processoStatusConfig'

interface Props {
  aberto: boolean
  processos: ProcessoAvoLinha[]
  onFechar: () => void
  onAplicar: (ids: string[], campo: string, valor: unknown) => void
}

const CAMPOS = [
  { valor: 'codigo_status_processo', rotulo: 'Status do processo', tipo: 'status' as const },
  { valor: 'referencia_interna_processo', rotulo: 'Referência interna', tipo: 'texto' as const },
  { valor: 'responsavel_processo', rotulo: 'Responsável', tipo: 'texto' as const },
  { valor: 'tipo_operacao_processo', rotulo: 'Tipo de operação', tipo: 'tipo' as const },
]

export function ModalEdicaoMassaProcesso({ aberto, processos, onFechar, onAplicar }: Props) {
  const [campo, setCampo] = useState(CAMPOS[0].valor)
  const [valorTexto, setValorTexto] = useState('')
  const [valorStatus, setValorStatus] = useState('')
  const [valorTipo, setValorTipo] = useState<'importacao' | 'exportacao'>('importacao')
  const [carregando, setCarregando] = useState(false)

  const statusOpcoes = useMemo(() => {
    const cfg = lerStatusConfigProcesso()
    return Object.entries(cfg)
      .sort((a, b) => a[1].ordem - b[1].ordem)
      .map(([id, s]) => ({ valor: id, rotulo: s.label }))
  }, [aberto])

  const def = CAMPOS.find(c => c.valor === campo) ?? CAMPOS[0]

  const handleSalvar = () => {
    setCarregando(true)
    try {
      const ids = processos.map(p => p.id_processo)
      if (def.tipo === 'status') {
        onAplicar(ids, 'codigo_status_processo', valorStatus || statusOpcoes[0]?.valor)
      } else if (def.tipo === 'tipo') {
        onAplicar(ids, 'tipo_operacao_processo', valorTipo)
      } else {
        onAplicar(ids, campo, valorTexto.trim() || null)
      }
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
      icone={<PencilLine size={24} weight="duotone" />}
      titulo="Edição em massa"
      subtitulo={`${processos.length} processo${processos.length !== 1 ? 's' : ''} selecionado${processos.length !== 1 ? 's' : ''}`}
      dirty
      podesSalvar={processos.length > 0 && !carregando}
      carregando={carregando}
      textoSalvar="Aplicar alterações"
      tamanho="md"
      altura="440px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
        <CampoGeralGlobal label="Campo">
          <SelectGlobal
            opcoes={CAMPOS.map(c => ({ valor: c.valor, rotulo: c.rotulo }))}
            valor={campo}
            aoMudarValor={v => setCampo(String(v ?? CAMPOS[0].valor))}
          />
        </CampoGeralGlobal>
        {def.tipo === 'status' && (
          <CampoGeralGlobal label="Novo status">
            <SelectGlobal
              opcoes={statusOpcoes}
              valor={valorStatus || statusOpcoes[0]?.valor || ''}
              aoMudarValor={v => setValorStatus(String(v ?? ''))}
            />
          </CampoGeralGlobal>
        )}
        {def.tipo === 'tipo' && (
          <CampoGeralGlobal label="Tipo de operação">
            <SelectGlobal
              opcoes={[
                { valor: 'importacao', rotulo: 'Importação' },
                { valor: 'exportacao', rotulo: 'Exportação' },
              ]}
              valor={valorTipo}
              aoMudarValor={v => setValorTipo((v ?? 'importacao') as 'importacao' | 'exportacao')}
            />
          </CampoGeralGlobal>
        )}
        {def.tipo === 'texto' && (
          <CampoGeralGlobal label="Novo valor">
            <input type="text" value={valorTexto} onChange={e => setValorTexto(e.target.value)} />
          </CampoGeralGlobal>
        )}
      </div>
    </ModalFormularioGlobal>
  )
}
