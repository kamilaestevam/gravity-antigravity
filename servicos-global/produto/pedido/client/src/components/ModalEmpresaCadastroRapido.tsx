/**
 * ModalEmpresaCadastroRapido.tsx — Mini-modal de cadastro inline de Empresa.
 *
 * Aberto a partir do `ModalPedidoNovo` quando o usuário clica em
 * "+ Cadastrar nova empresa" no SelectGlobal de Exportador/Importador/Fabricante.
 *
 * Pede APENAS o mínimo (nome, país, CNPJ se BR). Os demais dados o usuário
 * preenche depois no produto Cadastros — toast de sucesso traz deep-link.
 *
 * Mandamento 08 (fim dos fallbacks silenciosos): trata 401/403/409/422 com
 * mensagens específicas em vez de "erro genérico".
 */

import React, { useEffect, useState, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'
import { X, Buildings, Warning } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { useShellStore } from '@gravity/shell'
import {
  cadastrosApi,
  type Empresa,
  type Pais,
  type PapelEmpresaRapido,
} from '../shared/cadastrosApi'

export interface ModalEmpresaCadastroRapidoProps {
  aberto: boolean
  papel: PapelEmpresaRapido
  /**
   * Quando true, BR é removido da lista de países e o usuário precisa escolher
   * um país estrangeiro. Documento exigido vira TIN (Tax ID).
   *
   * Regra de negócio: em IMPORTAÇÃO o Exportador é estrangeiro (a empresa-da-org
   * é o Importador BR); em EXPORTAÇÃO o Importador é estrangeiro. Para essas
   * contrapartes nunca cabe CNPJ — passar `forcarEstrangeiro={true}`.
   *
   * Para Fabricante (e papéis flexíveis) deixar `false` (padrão).
   */
  forcarEstrangeiro?: boolean
  onFechar: () => void
  onCriado: (empresa: Empresa) => void
}

type TFunc = (key: string, opts?: Record<string, unknown>) => string

function rotuloPapel(papel: PapelEmpresaRapido, t: TFunc): string {
  switch (papel) {
    case 'importador':
      return t('pedido.cadastro_empresa.papel_importador')
    case 'exportador':
      return t('pedido.cadastro_empresa.papel_exportador')
    case 'fabricante':
      return t('pedido.cadastro_empresa.papel_fabricante')
  }
}

function traduzirErroCadastro(err: unknown, t: TFunc): string {
  if (!(err instanceof Error)) return t('pedido.cadastro_empresa.erro_inesperado')
  const msg = err.message || ''

  // Erros HTTP genéricos
  if (msg === 'HTTP 401') return t('pedido.cadastro_empresa.erro_401')
  if (msg === 'HTTP 403') return t('pedido.cadastro_empresa.erro_403')
  if (msg === 'HTTP 409') return t('pedido.cadastro_empresa.erro_409')
  if (msg === 'HTTP 422') return t('pedido.cadastro_empresa.erro_422')

  // Mensagem do backend (ex: "Empresa duplicada (...)")
  if (msg.toLowerCase().includes('duplicad')) return t('pedido.cadastro_empresa.erro_409')
  if (msg.toLowerCase().includes('cnpj')) return t('pedido.cadastro_empresa.erro_cnpj')

  return msg || t('pedido.cadastro_empresa.erro_inesperado')
}

export function ModalEmpresaCadastroRapido({
  aberto,
  papel,
  forcarEstrangeiro = false,
  onFechar,
  onCriado,
}: ModalEmpresaCadastroRapidoProps): React.JSX.Element | null {
  const { t } = useTranslation()
  const { addNotification } = useShellStore()

  const [nome, setNome] = useState('')
  // Default: BR para Fabricante (papel flexível); '' (forçar escolha) quando
  // a contraparte é obrigatoriamente estrangeira (Exportador em IMP, Importador
  // em EXP) — evita BR ser selecionado por engano.
  const [pais, setPais] = useState(forcarEstrangeiro ? '' : 'BR')
  const [cnpj, setCnpj] = useState('')
  const [tin, setTin]   = useState('')
  const [paises, setPaises] = useState<Pais[]>([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const ehBr = pais === 'BR'

  // Carrega lista de países quando abre
  useEffect(() => {
    if (!aberto) return
    let cancelado = false
    cadastrosApi
      .listarPaises()
      .then((resp) => {
        if (!cancelado) setPaises(resp.itens.filter((p) => p.ativo_pais))
      })
      .catch(() => {
        if (!cancelado) setPaises([])
      })
    return () => {
      cancelado = true
    }
  }, [aberto])

  // Reset ao abrir
  useEffect(() => {
    if (aberto) {
      setNome('')
      setPais(forcarEstrangeiro ? '' : 'BR')
      setCnpj('')
      setTin('')
      setErro(null)
      setSalvando(false)
    }
  }, [aberto, forcarEstrangeiro])

  // Esc fecha
  useEffect(() => {
    if (!aberto) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [aberto, onFechar])

  // Quando a contraparte é obrigatoriamente estrangeira, removemos BR da lista
  // — não queremos que o usuário caia na armadilha de cadastrar Exportador BR
  // numa importação (a empresa BR já é a empresa-da-org, do outro lado).
  const opcoesPais = useMemo(
    () =>
      paises
        .filter((p) => !forcarEstrangeiro || p.codigo_pais_iso_alpha2 !== 'BR')
        .map((p) => ({
          valor: p.codigo_pais_iso_alpha2,
          rotulo: `${p.nome_pais_portugues} (${p.codigo_pais_iso_alpha2})`,
        })),
    [paises, forcarEstrangeiro],
  )

  // CNPJ obrigatório quando BR (decisão de produto: empresa BR sem CNPJ não
  // serve para emitir DUE/DI/NF). TIN do exterior é opcional aqui — quando
  // ausente, o ModalPedidoNovo bloqueia a criação do pedido com mensagem
  // amigável no banner ("XYZ ainda não tem CNPJ/Tax ID em Cadastros"),
  // permitindo que o usuário cadastre a empresa rápido agora e complete TIN
  // depois pelo Cadastros se quiser.
  const cnpjOk = ehBr ? cnpj.trim().length > 0 : true
  const podeSalvar = nome.trim().length >= 2 && !!pais && cnpjOk && !salvando

  async function handleSalvar() {
    if (!podeSalvar) return
    setSalvando(true)
    setErro(null)
    try {
      const empresa = await cadastrosApi.criarEmpresa({
        nome_empresa: nome,
        pais_empresa: pais,
        cnpj_empresa: ehBr && cnpj.trim() ? cnpj.trim() : null,
        tin_empresa:  !ehBr && tin.trim() ? tin.trim() : null,
        papel,
      })
      addNotification({
        type: 'success',
        message: t('pedido.cadastro_empresa.sucesso_toast', { nome: empresa.nome_empresa }),
        duration: 5000,
      })
      onCriado(empresa)
    } catch (err: unknown) {
      setErro(traduzirErroCadastro(err, t))
    } finally {
      setSalvando(false)
    }
  }

  if (!aberto) return null

  // Renderizado via Portal direto em document.body para escapar do stacking
  // context do parent (ModalNovoPedido fica dentro de Pedidos.tsx → algum
  // ancestral cria stacking context que confina position:fixed). O wizard
  // ModalPassoPassoGlobal também usa portal, então sem isso o cascade fica
  // visualmente debaixo do wizard, mesmo com z-index numericamente maior.
  const conteudo = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mecr-titulo"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000, // acima do ModalPassoPassoGlobal (9999)
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar()
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface, #1e1e2e)',
          border: '1px solid var(--border-subtle, #333)',
          borderRadius: '0.75rem',
          width: 'min(440px, 92vw)',
          maxHeight: '92vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--bg-elevated, #334155)',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <h3 id="mecr-titulo" style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Buildings size={20} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
              {t('pedido.cadastro_empresa.titulo_papel', { papel: rotuloPapel(papel, t) })}
            </h3>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>Cadastre rapidamente uma nova empresa</p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label={t('comum.fechar', 'Fechar')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Corpo */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {t('pedido.cadastro_empresa.papel_atribuido', { papel: rotuloPapel(papel, t) })}
          </p>

          {/* Nome */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
              {t('pedido.cadastro_empresa.label_nome_papel', { papel: rotuloPapel(papel, t) })}
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={t('pedido.cadastro_empresa.ph_nome')}
              autoFocus
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                background: 'var(--bg-input, #11111a)',
                border: '1px solid var(--border-subtle, #333)',
                borderRadius: '0.375rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* País */}
          <div>
            <SelectGlobal
              label={t('pedido.cadastro_empresa.label_pais')}
              opcoes={opcoesPais}
              valor={pais}
              aoMudarValor={(v) => setPais(String(v ?? 'BR'))}
              buscavel
              placeholder={opcoesPais.length === 0 ? t('campo.carregando') : t('pedido.cadastro_empresa.ph_pais')}
            />
          </div>

          {/* Documento — CNPJ obrigatório se BR; TIN obrigatório caso contrário.
              Sem documento o snapshot do Pedido não pode ser gerado, então
              exigimos aqui (alinhado a `pedidoSnapshots.montarSnapshotEmpresa`). */}
          {ehBr ? (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: cnpj.trim() ? 'var(--text-muted)' : 'var(--danger, #ef4444)',
                  marginBottom: '0.375rem',
                }}
              >
                {t('pedido.cadastro_empresa.label_cnpj_obrigatorio')}
              </label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                aria-invalid={!cnpj.trim()}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--bg-input, #11111a)',
                  border: `1px solid ${cnpj.trim() ? 'var(--border-subtle, #333)' : 'var(--danger, #ef4444)'}`,
                  borderRadius: '0.375rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('pedido.cadastro_empresa.cnpj_obrigatorio_motivo')}
              </p>
            </div>
          ) : (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: '0.375rem',
                }}
              >
                {t('pedido.cadastro_empresa.label_tin_opcional')}
              </label>
              <input
                type="text"
                value={tin}
                onChange={(e) => setTin(e.target.value)}
                placeholder={t('pedido.cadastro_empresa.ph_tin')}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--bg-input, #11111a)',
                  border: '1px solid var(--border-subtle, #333)',
                  borderRadius: '0.375rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('pedido.cadastro_empresa.tin_opcional_motivo')}
              </p>
            </div>
          )}

          {erro && (
            <div
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.625rem 0.75rem',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '0.5rem',
                color: '#ef4444',
                fontSize: '0.8125rem',
              }}
            >
              <Warning size={14} weight="fill" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              <span>{erro}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid var(--border-subtle, #333)',
          }}
        >
          <BotaoGlobal variante="secundario" tamanho="padrao" onClick={onFechar} disabled={salvando}>
            {t('comum.cancelar', 'Cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            tamanho="padrao"
            onClick={handleSalvar}
            disabled={!podeSalvar}
            aria-busy={salvando}
          >
            {salvando ? t('pedido.cadastro_empresa.salvando') : t('pedido.cadastro_empresa.salvar_e_usar')}
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )

  return ReactDOM.createPortal(conteudo, document.body)
}
