import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Upload,
  Trash,
  Certificate,
  Lightning,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { BotaoNovoAdminGlobal } from '@nucleo/botao-novo-admin-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { ModalOverlay } from '@nucleo/modal-global'
import { useShellStore } from '@gravity/shell'
import { adminCertificadosApi, type CertificadoMetadataApi } from '../../services/api-client'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

function diasRestantes(isoFim: string): number {
  return Math.ceil((new Date(isoFim).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function StatusBadge({ ativo }: { ativo: boolean }) {
  const { t } = useTranslation()
  if (ativo) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#34d399', fontWeight: 600, fontSize: '0.8rem' }}>
      <CheckCircle size={14} weight="fill" /> {t('admin.certificados.ativo', 'Ativo')}
    </span>
  )
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>
      <XCircle size={14} weight="fill" /> {t('admin.certificados.inativo', 'Inativo')}
    </span>
  )
}

function ValidadeBadge({ validadeFim }: { validadeFim: string }) {
  const dias = diasRestantes(validadeFim)
  if (dias < 0) return (
    <span style={{ color: '#f87171', fontWeight: 600, fontSize: '0.8rem' }}>Expirado</span>
  )
  if (dias < 30) return (
    <span style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.8rem' }}>{dias}d restantes</span>
  )
  return (
    <span style={{ color: '#34d399', fontSize: '0.8rem' }}>{formatDate(validadeFim)}</span>
  )
}

export default function CertificadosAdmin() {
  const { t } = useTranslation()
  const addNotification = useShellStore((s) => s.addNotification)

  const [certificados, setCertificados] = useState<CertificadoMetadataApi[]>([])
  const [loading, setLoading] = useState(true)
  const [modalUploadAberto, setModalUploadAberto] = useState(false)
  const [validando, setValidando] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const resp = await adminCertificadosApi.listar()
      setCertificados(resp.certificados)
    } catch {
      addNotification({ tipo: 'erro', mensagem: t('admin.certificados.erro_carregar', 'Erro ao carregar certificados') })
    } finally {
      setLoading(false)
    }
  }, [addNotification, t])

  useEffect(() => { carregar() }, [carregar])

  const certAtivo = certificados.find(c => c.ativo)

  const handleAtivar = async (id: string) => {
    try {
      await adminCertificadosApi.ativar(id)
      addNotification({ tipo: 'sucesso', mensagem: t('admin.certificados.ativado', 'Certificado ativado com sucesso') })
      carregar()
    } catch {
      addNotification({ tipo: 'erro', mensagem: t('admin.certificados.erro_ativar', 'Erro ao ativar certificado') })
    }
  }

  const handleRemover = async (id: string) => {
    try {
      await adminCertificadosApi.remover(id)
      addNotification({ tipo: 'sucesso', mensagem: t('admin.certificados.removido', 'Certificado removido') })
      carregar()
    } catch {
      addNotification({ tipo: 'erro', mensagem: t('admin.certificados.erro_remover', 'Erro ao remover certificado') })
    }
  }

  const handleValidar = async (id: string) => {
    setValidando(id)
    try {
      const resp = await adminCertificadosApi.validar(id)
      if (resp.valido) {
        addNotification({ tipo: 'sucesso', mensagem: t('admin.certificados.validacao_ok', 'Autenticação com Portal Único realizada com sucesso') })
      } else {
        addNotification({ tipo: 'erro', mensagem: resp.mensagem })
      }
    } catch {
      addNotification({ tipo: 'erro', mensagem: t('admin.certificados.erro_validar', 'Erro ao validar certificado') })
    } finally {
      setValidando(null)
    }
  }

  // ── Colunas da tabela ─────────────────────────────────────────────────────

  const colunas: TabelaGlobalColuna<CertificadoMetadataApi>[] = [
    {
      key: 'nome',
      label: t('admin.certificados.col_nome', 'Nome'),
      render: (_v, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.nome}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{row.cn}</div>
        </div>
      ),
    },
    {
      key: 'cnpj',
      label: t('admin.certificados.col_cnpj', 'CNPJ'),
      render: (_v, row) => row.cnpj ? formatarCnpj(row.cnpj) : '—',
    },
    {
      key: 'emissor',
      label: t('admin.certificados.col_emissor', 'Emissor'),
      render: (_v, row) => <span style={{ fontSize: '0.8rem' }}>{row.emissor}</span>,
    },
    {
      key: 'validade_fim',
      label: t('admin.certificados.col_validade', 'Validade'),
      render: (_v, row) => <ValidadeBadge validadeFim={row.validade_fim} />,
    },
    {
      key: 'ativo',
      label: t('admin.certificados.col_status', 'Status'),
      render: (_v, row) => <StatusBadge ativo={row.ativo} />,
    },
  ]

  // ── Ações de linha (padrão TabelaGlobal) ──────────────────────────────────

  const acoes: TabelaGlobalAcao<CertificadoMetadataApi>[] = [
    {
      id: 'ativar',
      icone: <Lightning size={15} weight="bold" />,
      tooltip: t('admin.certificados.ativar_btn', 'Ativar'),
      onClick: (row) => handleAtivar(row.id),
      disabled: (row) => row.ativo,
    },
    {
      id: 'validar',
      icone: <ShieldCheck size={15} weight="bold" />,
      tooltip: t('admin.certificados.validar_btn', 'Testar autenticação'),
      onClick: (row) => handleValidar(row.id),
    },
    {
      id: 'remover',
      icone: <Trash size={15} weight="bold" />,
      tooltip: t('admin.certificados.remover_btn', 'Remover'),
      onClick: (row) => handleRemover(row.id),
      confirmarExclusao: {
        titulo: t('admin.certificados.confirmar_remover_titulo', 'Remover certificado'),
        descricao: t('admin.certificados.confirmar_remover_desc', 'Tem certeza que deseja remover este certificado? Esta ação não pode ser desfeita.'),
        nomeItem: (row) => row.nome,
      },
    },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          icone={<Certificate weight="duotone" size={22} />}
          titulo={t('admin.certificados.titulo', 'Certificados Digitais Siscomex')}
          subtitulo={t('admin.certificados.subtitulo', 'Upload e gestão de e-CNPJ para autenticação no Portal Único')}
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo={t('admin.certificados.card_ativo', 'Certificado Ativo')}
            valor={certAtivo ? certAtivo.cn.split(':')[0] : '—'}
            icone={<Certificate weight="duotone" size={18} />}
            variante={certAtivo ? 'sucesso' : 'padrao'}
            tooltip={
              certAtivo ? (
                <>
                  <div className="cg-tooltip__row"><span>CN</span> <strong>{certAtivo.cn}</strong></div>
                  <div className="cg-tooltip__row"><span>Válido até</span> <strong>{new Date(certAtivo.validade_fim).toLocaleDateString('pt-BR')}</strong></div>
                </>
              ) : (
                <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', lineHeight: 1.4, display: 'block' }}>Nenhum certificado ativo no momento.</span>
              )
            }
          />
          <CardBasicoGlobal
            titulo={t('admin.certificados.card_validade', 'Validade')}
            valor={certAtivo ? `${diasRestantes(certAtivo.validade_fim)}d` : '—'}
            icone={<ShieldCheck weight="duotone" size={18} />}
            variante={certAtivo && diasRestantes(certAtivo.validade_fim) < 30 ? 'aviso' : 'sucesso'}
            tooltip={
              <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', lineHeight: 1.4, display: 'block' }}>Dias restantes até o vencimento do certificado ativo. Renove com antecedência para evitar interrupções.</span>
            }
          />
          <CardBasicoGlobal
            titulo={t('admin.certificados.card_total', 'Total Cadastrados')}
            valor={String(certificados.length)}
            icone={<Certificate weight="duotone" size={18} />}
            tooltip={
              <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', lineHeight: 1.4, display: 'block' }}>Total de certificados digitais cadastrados na plataforma, incluindo ativos e expirados.</span>
            }
          />
        </>
      }
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <BotaoNovoAdminGlobal
          rotulo={t('admin.certificados.btn_enviar', 'Enviar Certificado')}
          onClick={() => setModalUploadAberto(true)}
          ativo={modalUploadAberto}
        />
      </div>

      {/* Tabela de certificados */}
      <TabelaGlobal<CertificadoMetadataApi>
        id="admin-certificados"
        colunas={colunas}
        acoes={acoes}
        dados={certificados}
        carregando={loading}
        chaveUnica="id"
        mensagemVazio={t('admin.certificados.sem_certificados', 'Nenhum certificado cadastrado')}
      />

      {/* Modal de upload */}
      {modalUploadAberto && (
        <ModalUploadCertificado
          onClose={() => setModalUploadAberto(false)}
          onSucesso={() => { setModalUploadAberto(false); carregar() }}
        />
      )}
    </PaginaGlobal>
  )
}

// ─── Modal de Upload ─────────────────────────────────────────────────────────

function ModalUploadCertificado({
  onClose,
  onSucesso,
}: {
  onClose: () => void
  onSucesso: () => void
}) {
  const { t } = useTranslation()
  const addNotification = useShellStore((s) => s.addNotification)

  const [nome, setNome] = useState('')
  const [senhaPfx, setSenhaPfx] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [ativar, setAtivar] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setArquivo(file)
      if (!nome) setNome(file.name.replace(/\.(pfx|p12)$/i, ''))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && /\.(pfx|p12)$/i.test(file.name)) {
      setArquivo(file)
      if (!nome) setNome(file.name.replace(/\.(pfx|p12)$/i, ''))
    }
  }

  const handleEnviar = async () => {
    if (!arquivo || !nome || !senhaPfx) return

    setEnviando(true)
    try {
      const buffer = await arquivo.arrayBuffer()
      const pfx_base64 = btoa(
        new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), '')
      )

      await adminCertificadosApi.upload({ nome, pfx_base64, senha_pfx: senhaPfx, ativar })
      addNotification({ tipo: 'sucesso', mensagem: t('admin.certificados.upload_ok', 'Certificado enviado com sucesso') })
      onSucesso()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('admin.certificados.erro_upload', 'Erro ao enviar certificado')
      addNotification({ tipo: 'erro', mensagem: msg })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <ModalOverlay
      aberto
      aoFechar={onClose}
      titulo={t('admin.certificados.modal_titulo', 'Enviar Certificado Digital')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Drag & Drop area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? '#6366f1' : '#334155'}`,
            borderRadius: '0.75rem',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'rgba(99,102,241,0.05)' : 'transparent',
            transition: 'all 150ms',
          }}
          onClick={() => document.getElementById('cert-file-input')?.click()}
        >
          <Upload size={32} weight="duotone" style={{ color: '#6366f1', marginBottom: '0.5rem' }} />
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>
            {arquivo
              ? arquivo.name
              : t('admin.certificados.drop_area', 'Arraste o arquivo .pfx ou .p12 aqui, ou clique para selecionar')}
          </p>
          <input
            id="cert-file-input"
            type="file"
            accept=".pfx,.p12"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* Nome */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            {t('admin.certificados.campo_nome', 'Nome do certificado')}
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={t('admin.certificados.placeholder_nome', 'Ex: e-CNPJ Empresa XYZ')}
            style={{
              width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
              border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0',
              fontSize: '0.875rem',
            }}
          />
        </div>

        {/* Senha PFX */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            {t('admin.certificados.campo_senha', 'Senha do certificado')}
          </label>
          <input
            type="password"
            value={senhaPfx}
            onChange={(e) => setSenhaPfx(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
              border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0',
              fontSize: '0.875rem',
            }}
          />
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: '#64748b' }}>
            {t('admin.certificados.senha_nota', 'A senha é usada apenas para validar e será armazenada criptografada (AES-256-GCM)')}
          </p>
        </div>

        {/* Ativar checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={ativar}
            onChange={(e) => setAtivar(e.target.checked)}
            style={{ accentColor: '#6366f1' }}
          />
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            {t('admin.certificados.ativar_ao_enviar', 'Ativar este certificado imediatamente')}
          </span>
        </label>

        {/* Botões */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <BotaoGlobal variante="ghost" onClick={onClose}>
            {t('comum.cancelar', 'Cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            onClick={handleEnviar}
            carregando={enviando}
            desabilitado={!arquivo || !nome || !senhaPfx}
            iconeEsquerda={<Upload size={16} />}
          >
            {t('admin.certificados.btn_enviar_modal', 'Enviar')}
          </BotaoGlobal>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatarCnpj(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '')
  if (digits.length !== 14) return cnpj
  return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12)}`
}

export { CertificadosAdmin }
