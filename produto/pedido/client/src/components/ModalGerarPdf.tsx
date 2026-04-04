/**
 * ModalGerarPdf.tsx — Modal para seleção de template e geração de PDF
 *
 * Fluxo:
 *   1. Lista templates disponíveis do tenant
 *   2. Usuário seleciona template → preview em miniatura (HTML renderizado)
 *   3. Checkbox "Salvar como anexo" (sempre true conforme spec)
 *   4. Botão "Baixar PDF" → gera, baixa e fecha o modal
 *
 * Props:
 *   pedido_id     — ID do pedido
 *   numeroPedido  — Número do pedido (para título)
 *   onFechar      — Callback para fechar o modal
 *   onConcluido   — Callback após PDF gerado com sucesso
 */

import React, { useState, useEffect, useCallback } from 'react'
import { FilePdf, Spinner, X, CheckCircle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { TemplatePdf, GerarPdfPayload } from '../shared/types'
import { pdfApi } from '../shared/api'
import './ModalGerarPdf.css'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalGerarPdfProps {
  pedido_id: string
  numeroPedido: string
  onFechar: () => void
  onConcluido: () => void
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ModalGerarPdf({ pedido_id, numeroPedido, onFechar, onConcluido }: ModalGerarPdfProps) {
  const [templates, setTemplates] = useState<TemplatePdf[]>([])
  const [carregandoTemplates, setCarregandoTemplates] = useState(true)
  const [templateSelecionado, setTemplateSelecionado] = useState<string | null>(null)
  const [salvarComoAnexo, setSalvarComoAnexo] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    pdfApi.listarTemplates()
      .then(dados => {
        setTemplates(dados)
        if (dados.length > 0) setTemplateSelecionado(dados[0].id)
      })
      .catch(() => setErro('Erro ao carregar templates'))
      .finally(() => setCarregandoTemplates(false))
  }, [])

  const templateAtual = templates.find(t => t.id === templateSelecionado) ?? null

  const handleGerar = useCallback(async () => {
    if (!templateSelecionado) return

    setGerando(true)
    setErro(null)

    try {
      const payload: GerarPdfPayload = {
        pedido_id,
        template_id: templateSelecionado,
        salvar_como_anexo: salvarComoAnexo,
      }

      const resultado = await pdfApi.gerar(payload)

      // Baixar o arquivo via link temporário
      const a = document.createElement('a')
      a.href = resultado.url_download
      a.download = ''
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      setSucesso(true)
      setTimeout(() => {
        onConcluido()
      }, 1200)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar PDF'
      setErro(msg)
    } finally {
      setGerando(false)
    }
  }, [pedido_id, templateSelecionado, salvarComoAnexo, onConcluido])

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onFechar()
  }, [onFechar])

  return (
    <div
      className="modal-gerar-pdf__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-gerar-pdf-titulo"
      onClick={handleOverlayClick}
    >
      <div className="modal-gerar-pdf__caixa">
        {/* Cabeçalho */}
        <div className="modal-gerar-pdf__cabecalho">
          <div className="modal-gerar-pdf__titulo-grupo">
            <FilePdf size={18} weight="fill" className="modal-gerar-pdf__icone-titulo" aria-hidden="true" />
            <h2 className="modal-gerar-pdf__titulo" id="modal-gerar-pdf-titulo">
              Gerar PDF — {numeroPedido}
            </h2>
          </div>
          <button
            type="button"
            className="modal-gerar-pdf__btn-fechar"
            onClick={onFechar}
            aria-label="Fechar modal"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Corpo */}
        <div className="modal-gerar-pdf__corpo">
          {carregandoTemplates ? (
            <div className="modal-gerar-pdf__carregando">
              <Spinner size={20} className="modal-gerar-pdf__spinner" aria-hidden="true" />
              <span>Carregando templates...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="modal-gerar-pdf__vazio">
              Nenhum template configurado para este tenant.
            </div>
          ) : (
            <>
              {/* Lista de templates */}
              <section aria-labelledby="label-template">
                <p className="modal-gerar-pdf__label" id="label-template">
                  Template:
                </p>
                <div className="modal-gerar-pdf__templates" role="radiogroup" aria-labelledby="label-template">
                  {templates.map(tpl => (
                    <label
                      key={tpl.id}
                      className={`modal-gerar-pdf__template-opcao${templateSelecionado === tpl.id ? ' modal-gerar-pdf__template-opcao--selecionada' : ''}`}
                    >
                      <input
                        type="radio"
                        name="template"
                        value={tpl.id}
                        checked={templateSelecionado === tpl.id}
                        onChange={() => setTemplateSelecionado(tpl.id)}
                        className="modal-gerar-pdf__radio"
                      />
                      <div className="modal-gerar-pdf__template-info">
                        <span className="modal-gerar-pdf__template-nome">{tpl.nome}</span>
                        {tpl.descricao && (
                          <span className="modal-gerar-pdf__template-descricao">{tpl.descricao}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* Preview */}
              {templateAtual && (
                <section className="modal-gerar-pdf__preview-secao" aria-label="Preview do template">
                  <p className="modal-gerar-pdf__label">Preview:</p>
                  <div
                    className="modal-gerar-pdf__preview-caixa"
                    // Renderizar HTML do template como preview (somente leitura)
                    dangerouslySetInnerHTML={{ __html: templateAtual.conteudo_html }}
                    aria-label="Visualização do template PDF"
                  />
                </section>
              )}

              {/* Checkbox salvar como anexo */}
              <label className="modal-gerar-pdf__checkbox-label">
                <input
                  type="checkbox"
                  checked={salvarComoAnexo}
                  onChange={e => setSalvarComoAnexo(e.target.checked)}
                  className="modal-gerar-pdf__checkbox"
                />
                <span>Salvar como anexo no pedido</span>
              </label>
            </>
          )}

          {/* Erro */}
          {erro && (
            <div className="modal-gerar-pdf__erro" role="alert">
              {erro}
            </div>
          )}

          {/* Sucesso */}
          {sucesso && (
            <div className="modal-gerar-pdf__sucesso" role="status">
              <CheckCircle size={16} weight="fill" aria-hidden="true" />
              PDF gerado e salvo como anexo!
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="modal-gerar-pdf__rodape">
          <BotaoGlobal
            variante="secundario"
            onClick={onFechar}
            disabled={gerando}
          >
            Cancelar
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            onClick={handleGerar}
            disabled={!templateSelecionado || gerando || carregandoTemplates || sucesso}
            aria-busy={gerando}
          >
            {gerando ? (
              <>
                <Spinner size={14} className="modal-gerar-pdf__spinner" aria-hidden="true" />
                Gerando...
              </>
            ) : (
              <>
                <FilePdf size={14} aria-hidden="true" />
                Baixar PDF
              </>
            )}
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )
}
