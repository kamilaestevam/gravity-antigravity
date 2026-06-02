/**
 * ModalDuplicarProcesso.tsx — Duplica processos selecionados (mock).
 */
import React, { useState } from 'react'
import { CopySimple } from '@phosphor-icons/react'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'
import type { ProcessoAvoLinha } from '../../shared/lista/mockListaHierarquica'

interface Props {
  aberto: boolean
  processos: ProcessoAvoLinha[]
  onFechar: () => void
  onDuplicar: (pares: Array<{ origemId: string; copia: ProcessoAvoLinha }>) => void
}

export function ModalDuplicarProcesso({ aberto, processos, onFechar, onDuplicar }: Props) {
  const [carregando, setCarregando] = useState(false)

  const handleSalvar = () => {
    setCarregando(true)
    try {
      const pares = processos.map((p, i) => ({
        origemId: p.id_processo,
        copia: {
          ...p,
          id_processo: `proc-dup-${Date.now()}-${i}`,
          numero_processo: `${p.numero_processo}-CÓPIA`,
          referencia_interna_processo: p.referencia_interna_processo
            ? `${p.referencia_interna_processo}-CÓPIA`
            : null,
        },
      }))
      onDuplicar(pares)
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
      icone={<CopySimple size={24} weight="duotone" />}
      titulo="Duplicar processos"
      subtitulo={`Serão criadas ${processos.length} cópia${processos.length !== 1 ? 's' : ''} com pedidos vinculados (mock).`}
      dirty
      podesSalvar={processos.length > 0 && !carregando}
      carregando={carregando}
      textoSalvar="Duplicar"
      tamanho="md"
      altura="400px"
    >
      <ul style={{ margin: 0, padding: '0.5rem 1.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        {processos.map(p => (
          <li key={p.id_processo}>{p.numero_processo}</li>
        ))}
      </ul>
    </ModalFormularioGlobal>
  )
}
