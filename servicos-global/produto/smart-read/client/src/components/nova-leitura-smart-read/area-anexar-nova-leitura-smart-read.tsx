/**
 * AreaAnexarNovaLeituraSmartRead — passo 1: zona de upload
 */

import { useRef, useState } from 'react'
import { CloudArrowUp } from '@phosphor-icons/react'
import { ACCEPT_ARQUIVO_LEITURA_SMART_READ } from '../../shared/entrada-arquivo-leitura-smart-read'

type Props = {
  onArquivosAdicionados: (arquivos: File[]) => void
}

export function AreaAnexarNovaLeituraSmartRead({ onArquivosAdicionados }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [arrastando, setArrastando] = useState(false)

  function processarLista(lista: FileList | null) {
    if (!lista || lista.length === 0) return
    onArquivosAdicionados(Array.from(lista))
  }

  return (
    <div className="sr-wizard-principal sr-wizard-principal--anexar">
      <div
        className={`sr-wizard-dropzone${arrastando ? ' sr-wizard-dropzone--ativa' : ''}`}
        onDragOver={(evento) => {
          evento.preventDefault()
          setArrastando(true)
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(evento) => {
          evento.preventDefault()
          setArrastando(false)
          processarLista(evento.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(evento) => {
          if (evento.key === 'Enter' || evento.key === ' ') inputRef.current?.click()
        }}
      >
        <div className="sr-wizard-dropzone-inner">
          <h2>Bem-vindo ao Smart Read</h2>
          <p>Envie o documento que deseja extrair as informações.</p>
          <div className="sr-wizard-dropzone-box">
            <CloudArrowUp size={40} weight="duotone" />
            <strong>Clique ou arraste o arquivo desejado</strong>
            <span>Você será informado caso o formato do arquivo não seja compatível com a plataforma.</span>
          </div>
          <p className="sr-wizard-dropzone-nota">
            Caso o arquivo tenha mais de um documento, estes serão separados automaticamente e contabilizados de forma unitária
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ARQUIVO_LEITURA_SMART_READ}
          multiple
          className="sr-input-arquivo-oculto"
          aria-hidden
          tabIndex={-1}
          onChange={(evento) => {
            processarLista(evento.target.files)
            evento.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
