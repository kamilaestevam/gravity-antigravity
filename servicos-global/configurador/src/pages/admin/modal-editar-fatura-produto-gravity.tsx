// pages/admin/modal-editar-fatura-produto-gravity.tsx
// Modal de edição de fatura Gravity — 2 abas:
//   1. Dados — campos editáveis + CRUD de itens (somente DRAFT/OPEN)
//   2. Anexos — upload/listar/excluir documentos (sempre disponível)
//
// Mandamentos 06 (Zod) + 09 (contrato bilateral) + REGRA 04 isolamento.

import React, { useEffect, useRef, useState } from 'react'
import { Receipt, Paperclip, Plus, Trash, DownloadSimple, FilePdf } from '@phosphor-icons/react'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { SecaoFormulario } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { apiFetch } from '../../services/api-client'
import {
  listaDocumentosFaturaProdutoGravitySchema,
  type DocumentoAnexoFaturaProdutoGravity,
  type FaturaProdutoGravity,
  type StatusFaturaProdutoGravity,
  type TipoDocumentoFaturaProdutoGravity,
} from '../../schemas/fatura-produto-gravity'

const TIPOS_DOCUMENTO: Array<{ value: TipoDocumentoFaturaProdutoGravity; label: string }> = [
  { value: 'BOLETO',       label: 'Boleto' },
  { value: 'NFE',          label: 'NF-e' },
  { value: 'RECIBO',       label: 'Recibo' },
  { value: 'PDF_GENERICO', label: 'PDF Genérico' },
  { value: 'OUTRO',        label: 'Outro' },
]

const STATUS_TERMINAIS: StatusFaturaProdutoGravity[] = ['PAID', 'VOID', 'UNCOLLECTIBLE']

interface ItemEditavel {
  id_fatura_item_produto_gravity?:            string
  descricao_fatura_item_produto_gravity:      string
  quantidade_fatura_item_produto_gravity:     number
  valor_unitario_fatura_item_produto_gravity: number
  moeda_fatura_item_produto_gravity:          string
}

interface Props {
  fatura:        FaturaProdutoGravity | null
  aoFechar:      () => void
  aoSalvarDados: () => void  // chamado após PATCH bem-sucedido — admin recarrega lista
}

export function ModalEditarFaturaProdutoGravity({ fatura, aoFechar, aoSalvarDados }: Props) {
  const aberto = !!fatura
  const podeEditarDados = !!fatura && !STATUS_TERMINAIS.includes(fatura.status_fatura_produto_gravity)

  // ── State da aba 1 (Dados) ──────────────────────────────────────────────
  const [competencia,   setCompetencia]   = useState<string>('')
  const [dataVenc,      setDataVenc]      = useState<string>('')
  const [emailOrg,      setEmailOrg]      = useState<string>('')
  const [moeda,         setMoeda]         = useState<string>('brl')
  const [itens,         setItens]         = useState<ItemEditavel[]>([])
  const [salvandoDados, setSalvandoDados] = useState(false)
  const [erroDados,     setErroDados]     = useState<string | null>(null)

  // ── State da aba 2 (Anexos) ─────────────────────────────────────────────
  const [documentos,    setDocumentos]    = useState<DocumentoAnexoFaturaProdutoGravity[]>([])
  const [tipoNovo,      setTipoNovo]      = useState<TipoDocumentoFaturaProdutoGravity>('BOLETO')
  const [arquivoNovo,   setArquivoNovo]   = useState<File | null>(null)
  const [enviandoAnexo, setEnviandoAnexo] = useState(false)
  const [erroAnexo,     setErroAnexo]     = useState<string | null>(null)
  const inputArquivoRef = useRef<HTMLInputElement>(null)

  // ── Carrega dados da fatura ao abrir ────────────────────────────────────
  useEffect(() => {
    if (!fatura) return
    setCompetencia(fatura.competencia_fatura_produto_gravity ?? '')
    setDataVenc(fatura.data_vencimento_fatura_produto_gravity?.slice(0, 10) ?? '')
    setEmailOrg(fatura.email_organizacao_fatura_produto_gravity ?? '')
    setMoeda(fatura.moeda_fatura_produto_gravity)
    setErroDados(null)
    setErroAnexo(null)

    // Itens
    apiFetch(`/api/v1/faturas/${encodeURIComponent(fatura.id_fatura_produto_gravity)}/itens`)
      .then(r => r.json())
      .then(j => {
        const arr = (j?.itens_fatura_produto_gravity ?? []) as ItemEditavel[]
        setItens(arr.map(i => ({
          id_fatura_item_produto_gravity:             i.id_fatura_item_produto_gravity,
          descricao_fatura_item_produto_gravity:      i.descricao_fatura_item_produto_gravity,
          quantidade_fatura_item_produto_gravity:     i.quantidade_fatura_item_produto_gravity,
          valor_unitario_fatura_item_produto_gravity: i.valor_unitario_fatura_item_produto_gravity,
          moeda_fatura_item_produto_gravity:          i.moeda_fatura_item_produto_gravity,
        })))
      })
      .catch(() => setItens([]))

    // Documentos
    carregarDocumentos(fatura.id_fatura_produto_gravity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fatura?.id_fatura_produto_gravity])

  async function carregarDocumentos(id_fatura: string) {
    try {
      const res = await apiFetch(`/api/v1/faturas/${encodeURIComponent(id_fatura)}/documentos`)
      if (!res.ok) return
      const raw = await res.json()
      const parsed = listaDocumentosFaturaProdutoGravitySchema.safeParse(raw)
      if (!parsed.success) {
        console.error('[ModalEditarFatura] documentos fora do contrato', parsed.error)
        return
      }
      setDocumentos(parsed.data.documentos_fatura_produto_gravity)
    } catch (err) {
      console.error('[ModalEditarFatura] erro ao listar documentos', err)
    }
  }

  // ── Handlers de itens ───────────────────────────────────────────────────
  const adicionarItem = () => setItens(prev => [...prev, {
    descricao_fatura_item_produto_gravity:      '',
    quantidade_fatura_item_produto_gravity:     1,
    valor_unitario_fatura_item_produto_gravity: 0,
    moeda_fatura_item_produto_gravity:          moeda,
  }])

  const removerItem = (idx: number) => setItens(prev => prev.filter((_, i) => i !== idx))

  const atualizarItem = (idx: number, patch: Partial<ItemEditavel>) =>
    setItens(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it))

  // ── Salvar dados (PATCH) ────────────────────────────────────────────────
  async function salvarDados() {
    if (!fatura) return
    setSalvandoDados(true)
    setErroDados(null)
    try {
      const body = {
        competencia_fatura_produto_gravity:       competencia || null,
        data_vencimento_fatura_produto_gravity:   dataVenc ? new Date(dataVenc).toISOString() : null,
        email_organizacao_fatura_produto_gravity: emailOrg || null,
        moeda_fatura_produto_gravity:             moeda,
        itens_fatura_produto_gravity:             itens.map(it => ({
          id_fatura_item_produto_gravity:             it.id_fatura_item_produto_gravity,
          descricao_fatura_item_produto_gravity:      it.descricao_fatura_item_produto_gravity,
          quantidade_fatura_item_produto_gravity:     it.quantidade_fatura_item_produto_gravity,
          valor_unitario_fatura_item_produto_gravity: it.valor_unitario_fatura_item_produto_gravity,
          moeda_fatura_item_produto_gravity:          it.moeda_fatura_item_produto_gravity,
        })),
      }
      const res = await apiFetch(`/api/v1/faturas/${encodeURIComponent(fatura.id_fatura_produto_gravity)}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const erro = await res.json().catch(() => ({}))
        throw new Error(erro?.error?.message ?? `HTTP ${res.status}`)
      }
      aoSalvarDados()
      aoFechar()
    } catch (err: unknown) {
      setErroDados(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSalvandoDados(false)
    }
  }

  // ── Anexar documento ────────────────────────────────────────────────────
  async function anexarDocumento() {
    if (!fatura || !arquivoNovo) return
    setEnviandoAnexo(true)
    setErroAnexo(null)
    try {
      const fd = new FormData()
      fd.append('arquivo', arquivoNovo)
      fd.append('tipo_documento_fatura_produto_gravity', tipoNovo)

      // FormData precisa que o browser seta Content-Type com boundary —
      // não usar apiFetch que injeta application/json.
      const session = await (window as unknown as { Clerk?: { session?: { getToken(): Promise<string | null> } } }).Clerk?.session
      const token = session ? await session.getToken() : null
      const res = await fetch(
        `/api/v1/faturas/${encodeURIComponent(fatura.id_fatura_produto_gravity)}/documentos`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: fd,
        },
      )
      if (!res.ok) {
        const erro = await res.json().catch(() => ({}))
        throw new Error(erro?.error?.message ?? `HTTP ${res.status}`)
      }
      setArquivoNovo(null)
      if (inputArquivoRef.current) inputArquivoRef.current.value = ''
      await carregarDocumentos(fatura.id_fatura_produto_gravity)
    } catch (err: unknown) {
      setErroAnexo(err instanceof Error ? err.message : 'Erro ao anexar')
    } finally {
      setEnviandoAnexo(false)
    }
  }

  async function excluirDocumento(id_documento: string) {
    if (!fatura) return
    if (!window.confirm('Excluir este documento?')) return
    try {
      const res = await apiFetch(
        `/api/v1/faturas/${encodeURIComponent(fatura.id_fatura_produto_gravity)}/documentos/${encodeURIComponent(id_documento)}`,
        { method: 'DELETE' },
      )
      if (!res.ok && res.status !== 204) {
        const erro = await res.json().catch(() => ({}))
        throw new Error(erro?.error?.message ?? `HTTP ${res.status}`)
      }
      await carregarDocumentos(fatura.id_fatura_produto_gravity)
    } catch (err: unknown) {
      setErroAnexo(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  if (!fatura) return null

  const valorTotal = itens.reduce(
    (s, it) => s + (it.quantidade_fatura_item_produto_gravity * it.valor_unitario_fatura_item_produto_gravity),
    0,
  )

  return (
    <ModalFormularioAbasGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      aoSalvar={() => { void salvarDados() }}
      icone={<Receipt weight="duotone" size={24} />}
      titulo={`Editar Fatura ${fatura.numero_fatura_produto_gravity ?? ''}`}
      subtitulo={`Status: ${fatura.status_fatura_produto_gravity}`}
      tamanho="lg"
      dirty={true}
      podesSalvar={podeEditarDados && !salvandoDados}
      abas={[
        // ── Aba 1: Dados ─────────────────────────────────────────────────
        {
          id: 'dados',
          rotulo: 'Dados',
          conteudo: (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SecaoFormulario icone={<Receipt size={16} weight="duotone" />} titulo="Dados da Fatura" />

              {!podeEditarDados && (
                <div style={{
                  padding: '0.875rem 1.25rem', borderRadius: '10px',
                  background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                  color: '#f87171', fontSize: '0.8125rem',
                }}>
                  Fatura em status <strong>{fatura.status_fatura_produto_gravity}</strong> não pode ser editada.
                  Apenas anexos podem ser gerenciados.
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <CampoGeralGlobal label="Competência" tooltipDescricao="Período de faturamento (mês/ano)">
                  <CampoCalendarioGlobal
                    valor={{
                      inicio: competencia ? new Date(`${competencia}-01T00:00:00`) : null,
                      fim:    competencia ? new Date(`${competencia}-01T00:00:00`) : null,
                    }}
                    aoMudarValor={(v) => {
                      const d = v.inicio
                      if (!d) { setCompetencia(''); return }
                      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                      setCompetencia(ym)
                    }}
                    disabled={!podeEditarDados}
                    placeholder="aaaa-mm"
                  />
                </CampoGeralGlobal>
                <CampoGeralGlobal label="Data de Vencimento">
                  <CampoCalendarioGlobal
                    valor={{
                      inicio: dataVenc ? new Date(dataVenc + 'T00:00:00') : null,
                      fim:    dataVenc ? new Date(dataVenc + 'T00:00:00') : null,
                    }}
                    aoMudarValor={(v) => {
                      const d = v.inicio
                      if (!d) { setDataVenc(''); return }
                      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                      setDataVenc(iso)
                    }}
                    disabled={!podeEditarDados}
                    placeholder="dd/mm/aaaa"
                  />
                </CampoGeralGlobal>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <CampoGeralGlobal label="E-mail da Organização (cobrança)">
                  <input
                    type="email"
                    value={emailOrg}
                    onChange={e => setEmailOrg(e.target.value)}
                    disabled={!podeEditarDados}
                    placeholder="financeiro@cliente.com"
                    className="ws-input"
                  />
                </CampoGeralGlobal>
                <CampoGeralGlobal label="Moeda">
                  <SelectGlobal
                    valor={moeda}
                    aoMudarValor={(v) => setMoeda(String(v ?? 'brl'))}
                    desabilitado={!podeEditarDados}
                    opcoes={[
                      { valor: 'brl', rotulo: 'BRL (R$)' },
                      { valor: 'usd', rotulo: 'USD ($)' },
                      { valor: 'eur', rotulo: 'EUR (€)' },
                    ]}
                  />
                </CampoGeralGlobal>
              </div>

              <SecaoFormulario icone={<Receipt size={16} weight="duotone" />} titulo="Itens da Fatura" />

              {/* Cabeçalho da grade de itens */}
              <div style={{
                display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr 36px', gap: '8px',
                padding: '0 0.75rem', fontSize: '0.6875rem', textTransform: 'uppercase',
                letterSpacing: '0.04em', fontWeight: 700, color: 'var(--ws-muted)',
              }}>
                <span>Descrição</span>
                <span>Qtd.</span>
                <span>Valor unit.</span>
                <span style={{ textAlign: 'right' }}>Total</span>
                <span></span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {itens.length === 0 && (
                  <div style={{
                    padding: '1.25rem', borderRadius: '8px', textAlign: 'center',
                    background: 'rgba(255,255,255,0.01)', border: '2px dashed rgba(255,255,255,0.04)',
                    color: 'var(--ws-muted)', fontSize: '0.8125rem',
                  }}>
                    Nenhum item cadastrado.{' '}
                    {podeEditarDados && <>Use <strong style={{ color: '#818cf8' }}>+ Adicionar item</strong> abaixo.</>}
                  </div>
                )}
                {itens.map((it, idx) => {
                  const inputBaseStyle: React.CSSProperties = {
                    width: '100%',
                    padding: '0.5rem 0.625rem',
                    borderRadius: '6px',
                    background: 'rgba(15,23,42,0.6)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--ws-text)',
                    fontSize: '0.8125rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                  }
                  return (
                    <div key={it.id_fatura_item_produto_gravity ?? `novo-${idx}`} style={{
                      display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr 36px', gap: '8px', alignItems: 'center',
                      padding: '0.5rem 0.75rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <input
                        type="text"
                        value={it.descricao_fatura_item_produto_gravity}
                        onChange={e => atualizarItem(idx, { descricao_fatura_item_produto_gravity: e.target.value })}
                        disabled={!podeEditarDados}
                        placeholder="Descrição do item"
                        style={inputBaseStyle}
                      />
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={it.quantidade_fatura_item_produto_gravity}
                        onChange={e => atualizarItem(idx, { quantidade_fatura_item_produto_gravity: Number(e.target.value) || 0 })}
                        disabled={!podeEditarDados}
                        style={{ ...inputBaseStyle, textAlign: 'right' }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={it.valor_unitario_fatura_item_produto_gravity}
                        onChange={e => atualizarItem(idx, { valor_unitario_fatura_item_produto_gravity: Number(e.target.value) || 0 })}
                        disabled={!podeEditarDados}
                        placeholder="0,00"
                        style={{ ...inputBaseStyle, textAlign: 'right' }}
                      />
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#818cf8', fontSize: '0.875rem', textAlign: 'right' }}>
                        {(it.quantidade_fatura_item_produto_gravity * it.valor_unitario_fatura_item_produto_gravity).toFixed(2)}
                      </span>
                      <TooltipGlobal descricao="Remover item">
                        <button
                          type="button"
                          onClick={() => removerItem(idx)}
                          disabled={!podeEditarDados}
                          style={{
                            width: 28, height: 28, borderRadius: '50%', border: 'none',
                            background: 'transparent', color: '#94a3b8', cursor: podeEditarDados ? 'pointer' : 'not-allowed',
                          }}
                        >
                          <Trash size={14} weight="bold" />
                        </button>
                      </TooltipGlobal>
                    </div>
                  )
                })}

                {podeEditarDados && (
                  <button
                    type="button"
                    onClick={adicionarItem}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '0.5rem 1rem', borderRadius: '8px',
                      background: 'rgba(129,140,248,0.08)', color: '#818cf8',
                      border: '1px dashed rgba(129,140,248,0.3)', cursor: 'pointer',
                      fontSize: '0.8125rem', fontWeight: 600, marginTop: '0.5rem',
                    }}
                  >
                    <Plus size={14} weight="bold" /> Adicionar item
                  </button>
                )}
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem', borderRadius: '10px',
                background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.2)',
                marginTop: '0.5rem',
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ws-muted)', letterSpacing: '0.04em' }}>Total</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: 800, color: 'var(--ws-text)' }}>
                  {valorTotal.toFixed(2)} {moeda.toUpperCase()}
                </strong>
              </div>

              {erroDados && (
                <div style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '0.8125rem' }}>
                  {erroDados}
                </div>
              )}
            </div>
          ),
        },
        // ── Aba 2: Anexos ────────────────────────────────────────────────
        {
          id: 'anexos',
          rotulo: 'Anexos',
          conteudo: (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SecaoFormulario icone={<Paperclip size={16} weight="duotone" />} titulo="Documentos da Fatura" tooltip="Boletos, NF-e, recibos e outros PDFs" />

              {/* Upload */}
              <div style={{
                padding: '1rem', borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <CampoGeralGlobal label="Tipo do Documento">
                    <SelectGlobal
                      valor={tipoNovo}
                      aoMudarValor={(v) => setTipoNovo((v ?? 'BOLETO') as TipoDocumentoFaturaProdutoGravity)}
                      opcoes={TIPOS_DOCUMENTO.map(t => ({ valor: t.value, rotulo: t.label }))}
                    />
                  </CampoGeralGlobal>
                  <CampoGeralGlobal label="Arquivo" tooltipDescricao="PDF, PNG, JPG ou XML — até 10 MB">
                    {/* Input nativo escondido + botão estilizado consistente com plataforma */}
                    <input
                      ref={inputArquivoRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.xml,application/pdf,image/png,image/jpeg,application/xml,text/xml"
                      onChange={e => setArquivoNovo(e.target.files?.[0] ?? null)}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => inputArquivoRef.current?.click()}
                      style={{
                        // Mesmas variáveis CSS e dimensões do .sg-trigger do SelectGlobal
                        // (nucleo-global/Campos/campo-select-global/src/select.css)
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
                        width: '100%',
                        padding: '0.5625rem 0.875rem',
                        borderRadius: '8px',
                        background: 'var(--ws-bg-body, #0f172a)',
                        border: '1.5px solid var(--ws-accent-border, rgba(129,140,248,0.2))',
                        color: arquivoNovo ? 'var(--ws-text)' : 'var(--ws-muted)',
                        fontSize: '0.875rem', fontFamily: 'inherit',
                        cursor: 'pointer', textAlign: 'left',
                        minHeight: '2.5rem',
                        boxSizing: 'border-box',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.45)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ws-accent-border, rgba(129,140,248,0.2))' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Paperclip size={14} weight="bold" />
                        {arquivoNovo ? arquivoNovo.name : 'Selecionar arquivo…'}
                      </span>
                      {arquivoNovo && (
                        <span style={{
                          fontSize: '0.6875rem', fontWeight: 700,
                          padding: '0.125rem 0.4rem', borderRadius: '4px',
                          background: 'rgba(52,211,153,0.12)', color: '#34d399',
                          textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
                        }}>
                          {(arquivoNovo.size / 1024).toFixed(0)} KB
                        </span>
                      )}
                    </button>
                  </CampoGeralGlobal>
                </div>
                <button
                  type="button"
                  onClick={anexarDocumento}
                  disabled={!arquivoNovo || enviandoAnexo}
                  style={{
                    padding: '0.625rem 1rem', borderRadius: '8px', border: 'none',
                    background: arquivoNovo && !enviandoAnexo ? '#818cf8' : 'rgba(100,116,139,0.3)',
                    color: 'white', fontWeight: 600, fontSize: '0.875rem',
                    cursor: arquivoNovo && !enviandoAnexo ? 'pointer' : 'not-allowed',
                  }}
                >
                  {enviandoAnexo ? 'Enviando…' : 'Anexar Documento'}
                </button>
                {erroAnexo && (
                  <div style={{ color: '#f87171', fontSize: '0.8125rem' }}>{erroAnexo}</div>
                )}
              </div>

              {/* Lista */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {documentos.length === 0 && (
                  <div style={{
                    padding: '2rem', borderRadius: '10px', textAlign: 'center',
                    background: 'rgba(255,255,255,0.01)', border: '2px dashed rgba(255,255,255,0.04)',
                  }}>
                    <Paperclip size={28} weight="duotone" style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ws-muted)' }}>
                      Nenhum documento anexado ainda.
                    </p>
                  </div>
                )}

                {documentos.map(doc => {
                  const tipoLabel = TIPOS_DOCUMENTO.find(t => t.value === doc.tipo_documento_fatura_produto_gravity)?.label ?? doc.tipo_documento_fatura_produto_gravity
                  return (
                    <div key={doc.id_documento_fatura_produto_gravity} style={{
                      display: 'grid', gridTemplateColumns: '32px 1fr 100px 100px 60px', gap: '0.75rem', alignItems: 'center',
                      padding: '0.625rem 0.875rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <FilePdf size={20} weight="duotone" color="#818cf8" />
                      <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--ws-text)' }}>{doc.nome_documento_fatura_produto_gravity}</p>
                        <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--ws-muted)' }}>
                          {tipoLabel} · {new Date(doc.data_criacao_documento_fatura_produto_gravity).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', textAlign: 'right' }}>
                        {doc.tamanho_documento_fatura_produto_gravity ? `${(doc.tamanho_documento_fatura_produto_gravity / 1024).toFixed(0)} KB` : '—'}
                      </span>
                      <a
                        href={doc.url_documento_fatura_produto_gravity}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '0.375rem 0.625rem', borderRadius: '6px', background: 'rgba(129,140,248,0.12)', color: '#818cf8', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}
                      >
                        <DownloadSimple size={12} weight="bold" /> Baixar
                      </a>
                      <TooltipGlobal descricao="Excluir">
                        <button
                          type="button"
                          onClick={() => excluirDocumento(doc.id_documento_fatura_produto_gravity)}
                          style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
                        >
                          <Trash size={14} weight="bold" />
                        </button>
                      </TooltipGlobal>
                    </div>
                  )
                })}
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}

export default ModalEditarFaturaProdutoGravity
