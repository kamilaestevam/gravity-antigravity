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
import { Spinner, CheckCircle, Warning } from '@phosphor-icons/react'
import { ModalOverlay } from '@nucleo/modal-global'
import type { TipoDocumentoGerar, IdiomaDocumento, GerarDocumentoPayload, GerarPdfPayload, GerarPdfResultado } from '../shared/types'
import { anexosApi, gerarDocumentoApi, templatePedidoApi } from '../shared/api'
import type { TemplateLocal } from '../shared/api'
import './ModalPedidoGerarPdf.css'

const IDIOMAS: { id: IdiomaDocumento; label: string; nome: string }[] = [
  { id: 'pt', label: 'PT', nome: 'Português' },
  { id: 'en', label: 'EN', nome: 'English'   },
  { id: 'es', label: 'ES', nome: 'Español'   },
  { id: 'zh', label: 'ZH', nome: '中文'      },
  { id: 'ja', label: 'JA', nome: '日本語'    },
  { id: 'ar', label: 'AR', nome: 'العربية'  },
]

export interface PedidoParaGerar {
  id: string
  numero: string
  item_ids?: string[]
}

interface ModalGerarPdfPedidoProps {
  pedidos: PedidoParaGerar[]
  onFechar: () => void
  onConcluido: () => void
}

type ModoGeracao = 'padrao' | 'template'

export function ModalGerarPdfPedido({ pedidos, onFechar, onConcluido }: ModalGerarPdfPedidoProps) {
  const { t, i18n } = useTranslation()

  const TIPOS_DOCUMENTO = useMemo(() => [
    { id: 'pedido_de_compra'   as TipoDocumentoGerar, label: t('pedido.modal_pdf.tipo_pc_label'),       desc: t('pedido.modal_pdf.tipo_pc_desc') },
    { id: 'pedido_de_venda'    as TipoDocumentoGerar, label: t('pedido.modal_pdf.tipo_pv_label'),       desc: t('pedido.modal_pdf.tipo_pv_desc') },
    { id: 'proforma_invoice'   as TipoDocumentoGerar, label: t('pedido.modal_pdf.tipo_proforma_label'), desc: t('pedido.modal_pdf.tipo_proforma_desc') },
    { id: 'invoice'            as TipoDocumentoGerar, label: t('pedido.modal_pdf.tipo_invoice_label'),  desc: t('pedido.modal_pdf.tipo_invoice_desc') },
    { id: 'packing_list'       as TipoDocumentoGerar, label: t('pedido.modal_pdf.tipo_pl_label'),       desc: t('pedido.modal_pdf.tipo_pl_desc') },
    { id: 'certificado_origem' as TipoDocumentoGerar, label: t('pedido.modal_pdf.tipo_co_label'),       desc: t('pedido.modal_pdf.tipo_co_desc') },
  ], [t])

  const [modo, setModo] = useState<ModoGeracao>('padrao')
  const [tiposSelecionados, setTiposSelecionados] = useState<TipoDocumentoGerar[]>(['invoice'])
  const [idioma, setIdioma] = useState<IdiomaDocumento>('en')
  const [templates, setTemplates] = useState<TemplateLocal[]>([])
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [carregandoTemplates, setCarregandoTemplates] = useState(false)
  const [salvarComoAnexo, setSalvarComoAnexo] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const isRtl = idioma === 'ar'
  const titulo = pedidos.length === 1
    ? t('pedido.modal_pdf.titulo_singular', { numero: pedidos[0].numero })
    : t('pedido.modal_pdf.titulo_plural', { count: pedidos.length })

  const alternarTipo = useCallback((tipo: TipoDocumentoGerar) => {
    setTiposSelecionados(prev =>
      prev.includes(tipo) ? prev.filter(tp => tp !== tipo) : [...prev, tipo]
    )
  }, [])

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

  const totalGeracoes = modo === 'padrao'
    ? pedidos.length * Math.max(tiposSelecionados.length, 1)
    : pedidos.length

  const baixarOuAbrir = useCallback(async (resultado: GerarPdfResultado, nomeArq: string) => {
    const blob = await anexosApi.download(resultado.anexo_id)
    const url = URL.createObjectURL(blob)

    if (resultado.is_pdf !== false) {
      const a = document.createElement('a')
      a.href = url
      a.download = nomeArq.endsWith('.pdf') ? nomeArq : `${nomeArq}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return
    }

    window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }, [])

  const handleGerar = useCallback(async () => {
    if (modo === 'padrao' && tiposSelecionados.length === 0) {
      setErro(t('pedido.modal_pdf.erro_selecione_tipo'))
      return
    }

    setGerando(true)
    setErro(null)
    setProgresso(0)

    try {
      let concluidos = 0

      for (const pedido of pedidos) {
        if (modo === 'padrao') {
          for (const tipo of tiposSelecionados) {
            const payload: GerarDocumentoPayload = {
              pedido_id: pedido.id,
              tipo_documento: tipo,
              idioma,
              salvar_como_anexo: salvarComoAnexo,
              ...(pedido.item_ids && pedido.item_ids.length > 0 ? { item_ids: pedido.item_ids } : {}),
            }
            const resultado = await gerarDocumentoApi.gerar(payload)
            await baixarOuAbrir(resultado, `${tipo}-${pedido.numero}-${idioma}.pdf`)
            concluidos += 1
            setProgresso(concluidos)
          }
        } else {
          if (!templateId) throw new Error(t('pedido.modal_pdf.erro_selecione_template'))
          const payload: GerarPdfPayload = {
            pedido_id: pedido.id,
            template_id: templateId,
            salvar_como_anexo: salvarComoAnexo,
          }
          const resultado = await templatePedidoApi.gerar(payload)
          await baixarOuAbrir(
            resultado,
            `${templates.find(tpl => tpl.id === templateId)?.nome ?? 'documento'}-${pedido.numero}.pdf`,
          )
          concluidos += 1
          setProgresso(concluidos)
        }
      }

      setSucesso(true)
      setTimeout(() => onConcluido(), 1500)
    } catch (err) {
      setErro(err instanceof Error ? err.message : t('pedido.modal_pdf.erro_gerar'))
    } finally {
      setGerando(false)
    }
  }, [pedidos, modo, tiposSelecionados, idioma, templateId, salvarComoAnexo, templates, onConcluido, baixarOuAbrir, t])

  const pedidosChips = (pedidos.length > 1 || pedidos.some(p => p.item_ids && p.item_ids.length > 0)) ? (
    <section className="modal-gerar-pdf__secao" aria-label={t('pedido.modal_pdf.aria_pedidos_selecionados')}>
      <p className="modal-gerar-pdf__label">{t('pedido.modal_pdf.pedidos_selecionados')}</p>
      <div className="modal-gerar-pdf__pedidos-chips">
        {pedidos.map(p => (
          <span key={p.id} className="modal-gerar-pdf__pedido-chip">
            {p.numero}
            {p.item_ids && p.item_ids.length > 0 && (
              <> · {t(p.item_ids.length === 1 ? 'pedido.modal_pdf.chip_itens_one' : 'pedido.modal_pdf.chip_itens_other', { count: p.item_ids.length })}</>
            )}
          </span>
        ))}
      </div>
    </section>
  ) : null

  const rodapeConteudo = (
    <div className="modal-gerar-pdf__rodape-conteudo">
      <label className="modal-gerar-pdf__checkbox-label">
        <input
          type="checkbox"
          checked={salvarComoAnexo}
          onChange={e => setSalvarComoAnexo(e.target.checked)}
          className="modal-gerar-pdf__checkbox"
        />
        <span>{t('pedido.modal_pdf.salvar_anexo')}</span>
      </label>

      {gerando && totalGeracoes > 1 && (
        <div className="modal-gerar-pdf__progresso" role="status" aria-live="polite">
          <div className="modal-gerar-pdf__progresso-barra-outer">
            <div
              className="modal-gerar-pdf__progresso-barra-inner"
              style={{ width: `${(progresso / totalGeracoes) * 100}%` }}
            />
          </div>
          <span className="modal-gerar-pdf__progresso-label">
            {t('pedido.modal_pdf.progresso_label', { done: progresso, total: totalGeracoes })}
          </span>
        </div>
      )}

      {erro && <div className="modal-gerar-pdf__erro" role="alert">{erro}</div>}

      {sucesso && (
        <div className="modal-gerar-pdf__sucesso" role="status">
          <CheckCircle size={16} weight="fill" aria-hidden="true" />
          {totalGeracoes === 1
            ? t('pedido.modal_pdf.sucesso_singular')
            : t('pedido.modal_pdf.sucesso_plural', { count: totalGeracoes })}
        </div>
      )}
    </div>
  )

  const abas = [
    {
      id: 'padrao',
      rotulo: t('pedido.modal_pdf.aba_padrao'),
      conteudo: (
        <div className="modal-gerar-pdf__corpo">
          {pedidosChips}
          <section className="modal-gerar-pdf__secao" aria-labelledby="label-tipo-doc">
            <p className="modal-gerar-pdf__label" id="label-tipo-doc">
              {t('pedido.modal_pdf.label_tipo_doc')}
            </p>
            <div className="modal-gerar-pdf__templates" role="group" aria-labelledby="label-tipo-doc">
              {TIPOS_DOCUMENTO.map(tipo => (
                <label
                  key={tipo.id}
                  className={`modal-gerar-pdf__template-opcao${tiposSelecionados.includes(tipo.id) ? ' modal-gerar-pdf__template-opcao--selecionada' : ''}`}
                >
                  <input
                    type="checkbox"
                    name="tipo_documento"
                    value={tipo.id}
                    checked={tiposSelecionados.includes(tipo.id)}
                    onChange={() => alternarTipo(tipo.id)}
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

          <section className="modal-gerar-pdf__secao" aria-labelledby="label-idioma">
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
                  className={`modal-gerar-pdf__idioma-btn${idioma === lang.id ? ' modal-gerar-pdf__idioma-btn--ativo' : ''}`}
                  onClick={() => setIdioma(lang.id)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </section>
          {rodapeConteudo}
        </div>
      ),
    },
    {
      id: 'template',
      rotulo: t('pedido.modal_pdf.aba_template'),
      conteudo: (
        <div className="modal-gerar-pdf__corpo">
          {pedidosChips}
          <section className="modal-gerar-pdf__secao" aria-labelledby="label-template">
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
          {rodapeConteudo}
        </div>
      ),
    },
  ]

  const rotuloGerar = gerando
    ? (totalGeracoes > 1
      ? t('pedido.modal_pdf.gerando_plural', { done: progresso, total: totalGeracoes })
      : t('pedido.modal_pdf.gerando_singular'))
    : (totalGeracoes === 1
      ? t('pedido.modal_pdf.gerar_singular')
      : t('pedido.modal_pdf.gerar_plural', { count: totalGeracoes }))

  const gerarDesabilitado =
    gerando || sucesso
    || (modo === 'padrao' && tiposSelecionados.length === 0)
    || (modo === 'template' && (!templateId || templates.length === 0))

  return (
    <ModalOverlay
      aberto
      aoFechar={onFechar}
      titulo={titulo}
      subtitulo={t('pedido.modal_pdf.subtitulo')}
      tamanho="md"
      tipoAbas="pill"
      centralizarAbas
      abaAtivaInicial="padrao"
      onAbaAtivaChange={(id) => setModo(id as ModoGeracao)}
      abas={abas}
      semFechar={gerando}
      carregandoFooter={gerando}
      footerEpoch={gerando ? `gerando-${progresso}` : 'idle'}
      botoes={[
        {
          rotulo: t('pedido.modal_pdf.cancelar'),
          variante: 'secondary',
          ao_clicar: onFechar,
          desabilitado: gerando,
        },
        {
          rotulo: rotuloGerar,
          variante: 'primary',
          ao_clicar: () => { void handleGerar() },
          desabilitado: gerarDesabilitado,
          carregando: gerando,
        },
      ]}
    />
  )
}
