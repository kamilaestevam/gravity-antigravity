/**
 * ModalGerarPdf.tsx — Modal para geração de documentos PDF
 *
 * Dois modos:
 *   - "Documento Padrão"    → tipo de documento + idioma (multilíngue)
 *   - "Template Personalizado" → seleciona template salvo em Configurações
 *
 * Suporta múltiplos pedidos: gera um PDF por pedido selecionado.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FilePdf, Spinner, X, CheckCircle, FileText, Warning } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { TipoDocumentoGerar, IdiomaDocumento, GerarDocumentoPayload, GerarPdfPayload } from '../shared/types'
import { gerarDocumentoApi, templatePedidoApi } from '../shared/api'
import type { TemplateLocal } from '../shared/api'
import './ModalPedidoGerarPdf.css'

// ── Constantes ────────────────────────────────────────────────────────────────

// TIPOS_DOCUMENTO movido para dentro do componente (depende de t())

const IDIOMAS: { id: IdiomaDocumento; label: string; nome: string }[] = [
  { id: 'pt', label: 'PT', nome: 'Português' },
  { id: 'en', label: 'EN', nome: 'English'   },
  { id: 'es', label: 'ES', nome: 'Español'   },
  { id: 'zh', label: 'ZH', nome: '中文'      },
  { id: 'ja', label: 'JA', nome: '日本語'    },
  { id: 'ar', label: 'AR', nome: 'العربية'  },
]

// ── Props ─────────────────────────────────────────────────────────────────────

export interface PedidoParaGerar {
  id: string
  numero: string
}

interface ModalGerarPdfPedidoProps {
  pedidos: PedidoParaGerar[]
  onFechar: () => void
  onConcluido: () => void
}

type ModoGeracao = 'padrao' | 'template'

// ── Componente ────────────────────────────────────────────────────────────────

export function ModalGerarPdfPedido({ pedidos, onFechar, onConcluido }: ModalGerarPdfPedidoProps) {
  const { t, i18n } = useTranslation()

  const TIPOS_DOCUMENTO = useMemo(() => [
    { id: 'pedido_de_venda'  as TipoDocumentoGerar, label: t('pedido.modal_pdf.tipo_pv_label'),       desc: t('pedido.modal_pdf.tipo_pv_desc') },
    { id: 'proforma_invoice' as TipoDocumentoGerar, label: t('pedido.modal_pdf.tipo_proforma_label'), desc: t('pedido.modal_pdf.tipo_proforma_desc') },
    { id: 'invoice'          as TipoDocumentoGerar, label: t('pedido.modal_pdf.tipo_invoice_label'),  desc: t('pedido.modal_pdf.tipo_invoice_desc') },
  ], [t])

  const [modo, setModo] = useState<ModoGeracao>('padrao')

  // Modo padrão
  const [tipoDocs, setTipoDocs] = useState<TipoDocumentoGerar>('invoice')
  const [idioma, setIdioma] = useState<IdiomaDocumento>('en')

  // Modo template
  const [templates, setTemplates] = useState<TemplateLocal[]>([])
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [carregandoTemplates, setCarregandoTemplates] = useState(false)

  // Estado geral
  const [salvarComoAnexo, setSalvarComoAnexo] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [progresso, setProgresso] = useState(0) // 0..pedidos.length
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const isRtl = idioma === 'ar'
  const titulo = pedidos.length === 1
    ? t('pedido.modal_pdf.titulo_singular', { numero: pedidos[0].numero })
    : t('pedido.modal_pdf.titulo_plural', { count: pedidos.length })

  // Carrega templates ao entrar no modo template
  useEffect(() => {
    if (modo !== 'template') return
    setCarregandoTemplates(true)
    templatePedidoApi.listarTemplates()
      .then(res => {
        setTemplates(res.data)
        if (res.data.length > 0 && !templateId) setTemplateId(res.data[0].id)
      })
      .catch(() => setErro(t('pedido.modal_pdf.erro_templates')))
      .finally(() => setCarregandoTemplates(false))
  }, [modo]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGerar = useCallback(async () => {
    setGerando(true)
    setErro(null)
    setProgresso(0)

    try {
      for (let i = 0; i < pedidos.length; i++) {
        const pedido = pedidos[i]

        let urlDownload: string
        let isPdf = true

        if (modo === 'padrao') {
          const payload: GerarDocumentoPayload = {
            pedido_id: pedido.id,
            tipo_documento: tipoDocs,
            idioma,
            salvar_como_anexo: salvarComoAnexo,
          }
          const resultado = await gerarDocumentoApi.gerar(payload)
          urlDownload = resultado.url_download
          isPdf = resultado.is_pdf !== false
        } else {
          if (!templateId) throw new Error('Selecione um template.')
          const payload: GerarPdfPayload = {
            pedido_id: pedido.id,
            template_id: templateId,
            salvar_como_anexo: salvarComoAnexo,
          }
          const resultado = await templatePedidoApi.gerar(payload)
          urlDownload = resultado.url_download
          isPdf = resultado.is_pdf !== false
        }

        if (isPdf) {
          // PDF real — força download com extensão .pdf
          const a = document.createElement('a')
          a.href = urlDownload
          const nomeArq = modo === 'padrao'
            ? `${tipoDocs}-${pedido.numero}-${idioma}.pdf`
            : `${templates.find(t => t.id === templateId)?.nome ?? 'documento'}-${pedido.numero}.pdf`
          a.download = nomeArq
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        } else {
          // Fallback HTML (sem Puppeteer) — abre em nova aba para visualização/impressão
          window.open(urlDownload, '_blank', 'noopener,noreferrer')
        }

        setProgresso(i + 1)
      }

      setSucesso(true)
      setTimeout(() => onConcluido(), 1500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar documento'
      setErro(msg)
    } finally {
      setGerando(false)
    }
  }, [pedidos, modo, tipoDocs, idioma, templateId, salvarComoAnexo, templates, onConcluido])

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div className="modal-gerar-pdf__titulo-grupo">
              <FilePdf size={20} weight="duotone" className="modal-gerar-pdf__icone-titulo" aria-hidden="true" />
              <h2 className="modal-gerar-pdf__titulo" id="modal-gerar-pdf-titulo">
                {titulo}
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>Gere documentos PDF dos pedidos selecionados</p>
          </div>
          <button
            type="button"
            className="modal-gerar-pdf__btn-fechar"
            onClick={onFechar}
            aria-label={t('pedido.modal_pdf.aria_fechar')}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Corpo */}
        <div className="modal-gerar-pdf__corpo">

          {/* Pedidos selecionados (quando múltiplos) */}
          {pedidos.length > 1 && (
            <section aria-label={t('pedido.modal_pdf.aria_pedidos_selecionados')}>
              <p className="modal-gerar-pdf__label">{t('pedido.modal_pdf.pedidos_selecionados')}</p>
              <div className="modal-gerar-pdf__pedidos-chips">
                {pedidos.map(p => (
                  <span key={p.id} className="modal-gerar-pdf__pedido-chip">{p.numero}</span>
                ))}
              </div>
            </section>
          )}

          {/* Tabs de modo */}
          <div className="modal-gerar-pdf__tabs" role="tablist" aria-label={t('pedido.modal_pdf.aria_modo_geracao')}>
            <button
              role="tab"
              aria-selected={modo === 'padrao'}
              className={`modal-gerar-pdf__tab${modo === 'padrao' ? ' modal-gerar-pdf__tab--ativo' : ''}`}
              onClick={() => setModo('padrao')}
            >
              <FileText size={14} weight="duotone" aria-hidden="true" />
              {t('pedido.modal_pdf.aba_padrao')}
            </button>
            <button
              role="tab"
              aria-selected={modo === 'template'}
              className={`modal-gerar-pdf__tab${modo === 'template' ? ' modal-gerar-pdf__tab--ativo' : ''}`}
              onClick={() => setModo('template')}
            >
              <FilePdf size={14} weight="duotone" aria-hidden="true" />
              {t('pedido.modal_pdf.aba_template')}
            </button>
          </div>

          {/* ── Modo Padrão ── */}
          {modo === 'padrao' && (
            <>
              <section aria-labelledby="label-tipo-doc">
                <p className="modal-gerar-pdf__label" id="label-tipo-doc">
                  {t('pedido.modal_pdf.label_tipo_doc')}
                </p>
                <div className="modal-gerar-pdf__templates" role="radiogroup" aria-labelledby="label-tipo-doc">
                  {TIPOS_DOCUMENTO.map(tipo => (
                    <label
                      key={tipo.id}
                      className={`modal-gerar-pdf__template-opcao${tipoDocs === tipo.id ? ' modal-gerar-pdf__template-opcao--selecionada' : ''}`}
                    >
                      <input
                        type="radio"
                        name="tipo_documento"
                        value={tipo.id}
                        checked={tipoDocs === tipo.id}
                        onChange={() => setTipoDocs(tipo.id)}
                        className="modal-gerar-pdf__radio"
                      />
                      <div className="modal-gerar-pdf__template-info">
                        <span className="modal-gerar-pdf__template-nome">{tipo.label}</span>
                        <span className="modal-gerar-pdf__template-descricao">{tipo.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              <section aria-labelledby="label-idioma">
                <p className="modal-gerar-pdf__label" id="label-idioma">
                  {t('pedido.modal_pdf.label_idioma')}
                </p>
                <div
                  className="modal-gerar-pdf__idiomas"
                  role="radiogroup"
                  aria-labelledby="label-idioma"
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  {IDIOMAS.map(lang => (
                    <button
                      key={lang.id}
                      type="button"
                      role="radio"
                      aria-checked={idioma === lang.id}
                      aria-label={lang.nome}
                      title={lang.nome}
                      className={`modal-pdf__idioma-btn${idioma === lang.id ? ' modal-pdf__idioma-btn--ativo' : ''}`}
                      onClick={() => setIdioma(lang.id)}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ── Modo Template ── */}
          {modo === 'template' && (
            <section aria-labelledby="label-template">
              <p className="modal-gerar-pdf__label" id="label-template">
                {t('pedido.modal_pdf.label_template')}
              </p>

              {carregandoTemplates && (
                <div className="modal-gerar-pdf__carregando">
                  <Spinner size={16} className="modal-gerar-pdf__spinner" aria-hidden="true" />
                  {t('pedido.modal_pdf.carregando_templates')}
                </div>
              )}

              {!carregandoTemplates && templates.length === 0 && (
                <div className="modal-gerar-pdf__vazio">
                  <Warning size={16} aria-hidden="true" />
                  {t('pedido.modal_pdf.sem_templates')}
                </div>
              )}

              {!carregandoTemplates && templates.length > 0 && (
                <div className="modal-gerar-pdf__templates" role="radiogroup" aria-labelledby="label-template">
                  {templates.map(tpl => (
                    <label
                      key={tpl.id}
                      className={`modal-gerar-pdf__template-opcao${templateId === tpl.id ? ' modal-gerar-pdf__template-opcao--selecionada' : ''}`}
                    >
                      <input
                        type="radio"
                        name="template_id"
                        value={tpl.id}
                        checked={templateId === tpl.id}
                        onChange={() => setTemplateId(tpl.id)}
                        className="modal-gerar-pdf__radio"
                      />
                      <div className="modal-gerar-pdf__template-info">
                        <span className="modal-gerar-pdf__template-nome">{tpl.nome}</span>
                        <span className="modal-gerar-pdf__template-descricao">
                          {t('pedido.modal_pdf.criado_em', { data: new Date(tpl.criadoEm).toLocaleDateString(i18n.language) })}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
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
            <span>{t('pedido.modal_pdf.salvar_anexo')}</span>
          </label>

          {/* Progresso (múltiplos pedidos) */}
          {gerando && pedidos.length > 1 && (
            <div className="modal-gerar-pdf__progresso" role="status" aria-live="polite">
              <div className="modal-gerar-pdf__progresso-barra-outer">
                <div
                  className="modal-gerar-pdf__progresso-barra-inner"
                  style={{ width: `${(progresso / pedidos.length) * 100}%` }}
                />
              </div>
              <span className="modal-gerar-pdf__progresso-label">
                {t('pedido.modal_pdf.progresso_label', { done: progresso, total: pedidos.length })}
              </span>
            </div>
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
              {pedidos.length === 1
                ? t('pedido.modal_pdf.sucesso_singular')
                : t('pedido.modal_pdf.sucesso_plural', { count: pedidos.length })}
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
            {t('pedido.modal_pdf.cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            onClick={handleGerar}
            disabled={gerando || sucesso || (modo === 'template' && (!templateId || templates.length === 0))}
            aria-busy={gerando}
          >
            {gerando ? (
              <>
                <Spinner size={14} className="modal-gerar-pdf__spinner" aria-hidden="true" />
                {pedidos.length > 1
                  ? t('pedido.modal_pdf.gerando_plural', { done: progresso, total: pedidos.length })
                  : t('pedido.modal_pdf.gerando_singular')}
              </>
            ) : (
              <>
                <FilePdf size={14} aria-hidden="true" />
                {pedidos.length === 1
                  ? t('pedido.modal_pdf.gerar_singular')
                  : t('pedido.modal_pdf.gerar_plural', { count: pedidos.length })}
              </>
            )}
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )
}
