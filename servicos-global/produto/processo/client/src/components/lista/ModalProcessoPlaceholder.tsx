/**
 * ModalProcessoPlaceholder.tsx — Stub para Import/API até Onda 7.
 */
import React from 'react'
import { UploadSimple, ArrowsLeftRight } from '@phosphor-icons/react'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'

interface Props {
  aberto: boolean
  titulo: string
  subtitulo: string
  tipo: 'import' | 'api'
  onFechar: () => void
}

export function ModalProcessoPlaceholder({ aberto, titulo, subtitulo, tipo, onFechar }: Props) {
  const icone = tipo === 'import'
    ? <UploadSimple size={24} weight="duotone" />
    : <ArrowsLeftRight size={24} weight="duotone" />

  return (
    <ModalFormularioGlobal
      aberto={aberto}
      aoFechar={onFechar}
      aoSalvar={onFechar}
      icone={icone}
      titulo={titulo}
      subtitulo={subtitulo}
      dirty={false}
      podesSalvar={false}
      tamanho="md"
      altura="360px"
      textoCancelar="Fechar"
    >
      <p style={{ margin: 0, padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
        Fluxo mock — a importação completa (mapeamento, preview e confirmação) será conectada
        na Onda 7 com a API do produto Processo. Por enquanto use <strong>Manual</strong> para
        criar processos de teste.
      </p>
    </ModalFormularioGlobal>
  )
}
