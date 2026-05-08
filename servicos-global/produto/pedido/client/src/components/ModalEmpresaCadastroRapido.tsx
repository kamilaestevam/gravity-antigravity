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
  onFechar,
  onCriado,
}: ModalEmpresaCadastroRapidoProps): React.JSX.Element | null {
  const { t } = useTranslation()
  const { addNotification } = useShellStore()

  const [nome, setNome] = useState('')
  const [pais, setPais] = useState('BR')
  const [cnpj, setCnpj] = useState('')
  const [paises, setPaises] = useState<Pais[]>([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

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
      setPais('BR')
      setCnpj('')
      setErro(null)
      setSalvando(false)
    }
  }, [aberto])

  // Esc fecha
  useEffect(() => {
    if (!aberto) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [aberto, onFechar])

  const opcoesPais = useMemo(
    () =>
      paises.map((p) => ({
        valor: p.codigo_pais,
        rotulo: `${p.nome_pais_portugues} (${p.codigo_pais})`,
      })),
    [paises],
  )

  const podeSalvar = nome.trim().length >= 2 && !!pais && !salvando

  async function handleSalvar() {
    if (!podeSalvar) return
    setSalvando(true)
    setErro(null)
    try {
      const empresa = await cadastrosApi.criarEmpresa({
        nome_empresa: nome,
        pais_empresa: pais,
        cnpj_empresa: pais === 'BR' && cnpj.trim() ? cnpj.trim() : null,
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
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle, #333)',
          }}
        >
          <h3 id="mecr-titulo" style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Buildings size={18} weight="duotone" />
            {t('pedido.cadastro_empresa.titulo')}
          </h3>
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
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
              {t('pedido.cadastro_empresa.label_nome')}
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

          {/* CNPJ — só se BR */}
          {pais === 'BR' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                {t('pedido.cadastro_empresa.label_cnpj')}
              </label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
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
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {t('pedido.cadastro_empresa.cnpj_opcional')}
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
