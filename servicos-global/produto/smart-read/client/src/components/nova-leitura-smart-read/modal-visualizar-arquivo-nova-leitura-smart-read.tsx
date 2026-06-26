/**
 * ModalVisualizarArquivoNovaLeituraSmartRead — preview in-app do arquivo original (PDF/imagem).
 */

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CircleNotch, Eye, WarningCircle, X } from '@phosphor-icons/react'
import type { ContextoEvidenciaRiscoNovaLeitura } from '../../shared/contexto-evidencia-risco-nova-leitura-smart-read'

type ModoPreview = 'pdf' | 'imagem' | 'indisponivel'

type Props = {
  aberto: boolean
  nomeArquivo: string
  url: string | null
  carregando: boolean
  erro: string | null
  evidenciaRisco?: ContextoEvidenciaRiscoNovaLeitura | null
  onErroRender?: () => void
  onFechar: () => void
}

function resolverModoPreview(nomeArquivo: string): ModoPreview {
  const nome = nomeArquivo.toLowerCase()
  if (nome.endsWith('.pdf')) return 'pdf'
  if (/\.(jpe?g|png|webp|gif|bmp)$/.test(nome)) return 'imagem'
  return 'indisponivel'
}

export function ModalVisualizarArquivoNovaLeituraSmartRead({
  aberto,
  nomeArquivo,
  url,
  carregando,
  erro,
  evidenciaRisco,
  onErroRender,
  onFechar,
}: Props) {
  const [renderImagemFalhou, setRenderImagemFalhou] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setRenderImagemFalhou(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [aberto, onFechar])

  useEffect(() => {
    setRenderImagemFalhou(false)
  }, [url])

  if (!aberto) return null

  const modo = resolverModoPreview(nomeArquivo)
  const podeRenderizar = url && modo !== 'indisponivel'

  const conteudo = (
    <div
      className="sr-prev-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Visualizar ${nomeArquivo}`}
      onClick={onFechar}
    >
      <div className="sr-prev-painel" onClick={(e) => e.stopPropagation()}>
        <header className="sr-prev-cabecalho">
          <div className="sr-prev-cabecalho-titulo">
            <Eye size={20} weight="duotone" className="sr-prev-cabecalho-icone" />
            <strong title={nomeArquivo}>{nomeArquivo}</strong>
          </div>
          <button type="button" className="sr-prev-cabecalho-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={18} weight="bold" />
          </button>
        </header>

        {evidenciaRisco && (
          <aside className="sr-prev-evidencia" role="note" aria-label="Ponto em conferência">
            <WarningCircle size={20} weight="fill" className="sr-prev-evidencia-icone" aria-hidden />
            <div className="sr-prev-evidencia-texto">
              <strong>{evidenciaRisco.tituloRisco}</strong>
              {evidenciaRisco.campo && (
                <span className="sr-prev-evidencia-campo">
                  Campo: <code>{evidenciaRisco.campo}</code>
                  {evidenciaRisco.valorAtual?.trim()
                    ? ` — valor lido: ${evidenciaRisco.valorAtual}`
                    : ' — ausente ou ilegível no documento'}
                </span>
              )}
              {evidenciaRisco.correcao && (
                <span className="sr-prev-evidencia-correcao">{evidenciaRisco.correcao}</span>
              )}
            </div>
          </aside>
        )}

        <div className="sr-prev-corpo">
          {carregando ? (
            <div className="sr-prev-vazio">
              <CircleNotch size={28} className="sr-wizard-card-spin" aria-hidden />
              <strong>Carregando documento…</strong>
            </div>
          ) : erro ? (
            <div className="sr-prev-vazio">
              <strong>Não foi possível carregar o arquivo</strong>
              <p>{erro}</p>
            </div>
          ) : !url ? (
            <div className="sr-prev-vazio">
              <strong>Não foi possível carregar o arquivo</strong>
              <p>Tente fechar e reabrir a leitura ou anexar o arquivo novamente.</p>
            </div>
          ) : renderImagemFalhou && !carregando ? (
            <div className="sr-prev-vazio">
              <CircleNotch size={28} className="sr-wizard-card-spin" aria-hidden />
              <strong>Validando documento…</strong>
            </div>
          ) : podeRenderizar && modo === 'pdf' ? (
            <iframe
              src={url}
              className="sr-prev-iframe"
              title={`Visualizar ${nomeArquivo}`}
            />
          ) : podeRenderizar && modo === 'imagem' ? (
            <img
              src={url}
              alt={nomeArquivo}
              className="sr-prev-imagem"
              onError={() => {
                setRenderImagemFalhou(true)
                onErroRender?.()
              }}
            />
          ) : (
            <div className="sr-prev-vazio">
              <strong>Pré-visualização não disponível para este formato</strong>
              <p>Use o download para abrir {nomeArquivo} no aplicativo padrão.</p>
              <a href={url} download={nomeArquivo} className="sr-prev-download">
                Baixar arquivo
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(conteudo, document.body)
}
