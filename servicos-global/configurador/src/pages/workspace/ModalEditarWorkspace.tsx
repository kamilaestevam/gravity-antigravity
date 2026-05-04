import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Buildings,
  Globe,
  IdentificationCard,
  Warning,
  CalendarBlank,
  MapPin,
  Link,
  Package
} from '@phosphor-icons/react'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { SecaoFormulario } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { BannerRequisitosGlobal, type RequisitoSalvar } from '@nucleo/banner-requisitos-global'
import type { Workspace } from './Workspaces'
import { useCidadesIBGE } from '../../hooks/useCidadesIBGE'
import { useSugerirSubdominio } from '../../hooks/useSugerirSubdominio'

// ─── Constantes ─────────────────────────────────────────────────────────────

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

const OPCOES_ESTADOS: SelectOpcao[] = [
  { valor: '', rotulo: 'Selecione...' },
  ...ESTADOS_BR.map(uf => ({ valor: uf, rotulo: uf }))
]

const SEGMENTOS = [
  'Agronegócio', 'Alimentos e Bebidas', 'Armazenagem', 'Automotivo',
  'Calçados', 'Cosméticos', 'Despacho Aduaneiro', 'Eletrodomésticos',
  'Eletrônicos', 'Embalagens', 'Energia e Gás', 'Farmacêutico',
  'Ferramentas', 'Ferroviário', 'Financeiro', 'Higiene',
  'Hospitalar', 'Logística', 'Maquinário', 'Metalurgia',
  'Mineração', 'Papel', 'Químico', 'Seguro',
  'Têxtil', 'Trading', 'Transporte',
]

const OPCOES_SEGMENTOS: SelectOpcao[] = [
  { valor: '', rotulo: 'Selecione...' },
  ...SEGMENTOS.map(s => ({ valor: s, rotulo: s }))
]

// ─── Helpers ────────────────────────────────────────────────────────────────
// Slugify foi removido — o sistema gera o subdomínio (rota /me/sugestoes-subdominio)
// e o usuário não edita o campo. Política central definida em organizacaoService.ts.

function formatarCNPJ(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

// ─── Aba: Informações ──────────────────────────────────────────────────────

function AbaInformacoes({
  workspace,
  nome_workspace,
  subdominio_workspace,
  subdominioCarregando,
  subdominioAjustado,
  subdominioSolicitado,
  subdominioErro,
  onNome,
  onCampoExtra,
  cidades,
  carregandoCidades
}: {
  workspace: Partial<Workspace>
  nome_workspace: string
  subdominio_workspace: string
  subdominioCarregando: boolean
  subdominioAjustado: boolean
  subdominioSolicitado: string
  subdominioErro: string | null
  onNome: (v: string) => void
  onCampoExtra: (key: keyof Workspace, v: string) => void
  cidades: SelectOpcao[]
  carregandoCidades: boolean
}) {
  const { t } = useTranslation()
  const ehNovo = !workspace.id_workspace

  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* Seção: Identidade */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <SecaoFormulario
            icone={<IdentificationCard size={16} weight="duotone" />}
            titulo={t('workspace.workspaces.secao_identidade')}
            tooltip="Nome e identificação visual do workspace na plataforma"
            marginBottom={0}
          />
          {!ehNovo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: workspace.status_workspace === 'ATIVO' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                color: workspace.status_workspace === 'ATIVO' ? '#34d399' : '#f87171',
                border: `1px solid ${workspace.status_workspace === 'ATIVO' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
              }}>
                {workspace.status_workspace === 'ATIVO' ? 'Ativa' : 'Suspensa'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.75rem' }}>
                <CalendarBlank size={14} />
                <span>Criado em {workspace.data_criacao_workspace}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.75rem' }}>
                <Buildings size={14} />
                <span>{workspace.nome_organizacao || 'Gravity Principal'}</span>
              </div>
            </div>
          )}
        </div>
        <div className="em-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <CampoGeralGlobal label={t('workspace.organizacao.campo_nome')} obrigatorio>
              <div className="ws-input-icon-wrap">
                <Buildings size={16} />
                <input
                  value={nome_workspace}
                  placeholder="Ex: Acme Logística SP"
                  onChange={e => onNome(e.target.value)}
                  style={{ width: '100%' }}
                  autoFocus={ehNovo}
                />
              </div>
            </CampoGeralGlobal>
          </div>

          <div>
            <CampoGeralGlobal label={t('workspace.organizacao.campo_cnpj')}>
              <div className="ws-input-icon-wrap">
                <IdentificationCard size={16} />
                <input
                  value={workspace.cnpj_workspace || ''}
                  placeholder="00.000.000/0000-00"
                  onChange={e => onCampoExtra('cnpj_workspace', formatarCNPJ(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </CampoGeralGlobal>
          </div>

          <div>
            <CampoGeralGlobal label={t('workspace.organizacao.campo_segmento')}>
              <SelectGlobal
                iconeEsquerda={<Package size={16} />}
                opcoes={OPCOES_SEGMENTOS}
                valor={workspace.segmento_workspace || null}
                aoMudarValor={(v: string | number | null) => onCampoExtra('segmento_workspace', String(v ?? ''))}
                placeholder="Selecione..."
                buscavel
              />
            </CampoGeralGlobal>
          </div>

          <div>
            <CampoGeralGlobal label={t('workspace.organizacao.campo_estado')}>
              <SelectGlobal
                iconeEsquerda={<MapPin size={16} />}
                opcoes={OPCOES_ESTADOS}
                valor={workspace.estado_workspace || null}
                aoMudarValor={(v: string | number | null) => {
                  onCampoExtra('estado_workspace', String(v ?? ''))
                  onCampoExtra('cidade_workspace', '')
                }}
                placeholder="Ex: SP"
                buscavel
              />
            </CampoGeralGlobal>
          </div>

          <div>
            <CampoGeralGlobal label={t('workspace.organizacao.campo_cidade')}>
              <SelectGlobal
                iconeEsquerda={<MapPin size={16} />}
                opcoes={cidades}
                valor={workspace.cidade_workspace || null}
                aoMudarValor={v => onCampoExtra('cidade_workspace', String(v ?? ''))}
                placeholder={workspace.estado_workspace ? "Ex: São Paulo" : "Selecione o estado..."}
                buscavel
                desabilitado={!workspace.estado_workspace}
                carregando={carregandoCidades}
              />
            </CampoGeralGlobal>
          </div>
        </div>
      </div>

      {/* Seção: Endereço & Web */}
      <div>
        <SecaoFormulario
          icone={<Globe size={16} weight="duotone" />}
          titulo={t('workspace.workspaces.secao_acesso_web')}
        />
        <div className="em-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <CampoGeralGlobal label={t('workspace.organizacao.campo_site')}>
              <div className="ws-input-icon-wrap">
                <Link size={16} />
                <input
                  value={workspace.site_workspace || ''}
                  placeholder="Ex: https://www.acme.com.br"
                  onChange={e => onCampoExtra('site_workspace', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </CampoGeralGlobal>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <CampoGeralGlobal
              label={t('workspace.workspaces.campo_subdominio')}
              tooltipTitulo="Subdomínio gerado pelo sistema"
              tooltipDescricao="A plataforma gera automaticamente um subdomínio único a partir do nome do workspace. Você não precisa escolher — se já existir, o sistema adiciona um sufixo numérico (-2, -3...)."
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 0.875rem',
                background: 'var(--ws-surface)',
                border: '1px solid var(--ws-accent-border)',
                borderRadius: '8px',
                height: '40px',
                color: 'var(--ws-text)',
                fontSize: '0.8125rem',
                fontFamily: 'monospace',
              }}>
                <Globe size={16} style={{ marginRight: '0.5rem', color: 'var(--ws-muted)' }} />
                {subdominioCarregando ? (
                  <span style={{ color: 'var(--ws-muted)', fontStyle: 'italic' }}>gerando…</span>
                ) : subdominio_workspace ? (
                  <strong style={{ color: 'var(--ws-accent)' }}>
                    {subdominio_workspace}<span style={{ color: 'var(--ws-muted)', fontWeight: 400 }}>.usegravity.com.br</span>
                  </strong>
                ) : (
                  <span style={{ color: 'var(--ws-muted)', fontStyle: 'italic' }}>
                    {ehNovo ? 'Digite o nome para gerar o subdomínio' : '—'}
                  </span>
                )}
              </div>

              {subdominioErro && (
                <p style={{
                  fontSize: '0.75rem',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  margin: '0.375rem 0 0',
                }}>
                  <Warning size={12} weight="bold" />
                  {subdominioErro}
                </p>
              )}

              {ehNovo && subdominioAjustado && !subdominioErro && subdominio_workspace && (
                <p style={{
                  fontSize: '0.75rem',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  margin: '0.375rem 0 0',
                }}>
                  <Warning size={12} weight="bold" />
                  Subdomínio <code>{subdominioSolicitado}</code> já estava em uso. Ajustamos para <code>{subdominio_workspace}</code>.
                </p>
              )}
            </CampoGeralGlobal>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Modal principal ───────────────────────────────────────────────────────

export interface ModalEditarWorkspaceProps {
  workspace: Workspace | null // Se id_workspace ausente, vira criação
  aberto: boolean
  aoFechar: () => void
  aoSalvar: (dados: Partial<Workspace>) => void
}

export function ModalEditarWorkspace({
  workspace,
  aberto,
  aoFechar,
  aoSalvar,
}: ModalEditarWorkspaceProps) {
  const { t } = useTranslation()
  const [nome, setNome]           = useState('')
  const [extraData, setExtraData] = useState<Partial<Workspace>>({})
  const { cidades, carregando: carregandoCidades } = useCidadesIBGE(extraData.estado_workspace ?? '')

  const ehNovo = !workspace?.id_workspace

  // Hook de sugestão de subdomínio (sistema gera; usuário não escolhe).
  // Em CRIAÇÃO: pede ao backend o subdomínio que seria atribuído baseado no nome.
  // Em EDIÇÃO: usa o subdomínio existente do workspace (read-only, sem regerar).
  const sug = useSugerirSubdominio(nome, { enabled: ehNovo })
  const subExibido = ehNovo ? sug.sugestao : (workspace?.subdominio_workspace || '')

  // Preenche os campos ao abrir
  useEffect(() => {
    if (aberto) {
      if (workspace) {
        setNome(workspace.nome_workspace || '')
        setExtraData(workspace)
      } else {
        setNome('')
        setExtraData({})
      }
    }
  }, [aberto, workspace?.id_workspace])

  const dirty = ehNovo
    ? nome.trim().length > 0
    : (
      nome.trim() !== workspace?.nome_workspace ||
      (['cnpj_workspace', 'estado_workspace', 'cidade_workspace', 'segmento_workspace', 'site_workspace'] as Array<keyof Workspace>)
        .some(k => extraData[k] !== workspace?.[k])
    )

  const requisitos: RequisitoSalvar[] = ehNovo
    ? [
        { chave: 'nome',       ok: !!nome.trim(),       mensagem: 'Nome do workspace' },
        { chave: 'subdominio', ok: !!sug.sugestao && !sug.carregando, mensagem: sug.carregando ? 'Aguardando sugestão de subdomínio…' : 'Subdomínio sugerido' },
        { chave: 'sugErro',    ok: !sug.erro,           mensagem: sug.erro ?? 'Subdomínio válido' },
      ]
    : [
        { chave: 'nome', ok: !!nome.trim(), mensagem: 'Nome do workspace' },
      ]

  const podesSalvar = requisitos.every(r => r.ok)

  function handleSalvar() {
    if (!podesSalvar) return
    aoSalvar({
      ...extraData,
      nome_workspace: nome.trim(),
      // Em criação envia o subdomínio sugerido como base. Em edição, mantém o
      // existente (não enviamos para evitar regeneração indevida).
      ...(ehNovo
        ? { subdominio_workspace: sug.sugestao }
        : {}),
    })
  }

  const abas = useMemo(() => [
    {
      id: 'geral',
      rotulo: t('workspace.workspaces.aba_informacoes_gerais'),
      conteudo: (
        <>
          <AbaInformacoes
            workspace={{ ...extraData, id_workspace: workspace?.id_workspace, nome_workspace: nome, subdominio_workspace: subExibido }}
            nome_workspace={nome}
            subdominio_workspace={subExibido}
            subdominioCarregando={ehNovo && sug.carregando}
            subdominioAjustado={ehNovo && sug.ajustado}
            subdominioSolicitado={ehNovo ? sug.solicitado : ''}
            subdominioErro={ehNovo ? sug.erro : null}
            onNome={(v) => setNome(v)}
            onCampoExtra={(k, v) => setExtraData(p => ({ ...p, [k]: v }))}
            cidades={cidades}
            carregandoCidades={carregandoCidades}
          />
          <div style={{ padding: '0 1.5rem 1rem' }}>
            <BannerRequisitosGlobal requisitos={requisitos} />
          </div>
        </>
      )
    }
  ], [extraData, workspace?.id_workspace, nome, subExibido, sug.carregando, sug.ajustado, sug.solicitado, sug.erro, cidades, carregandoCidades, ehNovo, requisitos])

  return (
    <>
    <ModalFormularioAbasGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      aoSalvar={handleSalvar}
      icone={<Buildings weight="duotone" size={24} />}
      titulo={ehNovo ? (nome || t('workspace.workspaces.novo_workspace')) : (workspace?.nome_workspace ?? '')}
      subtitulo={ehNovo ? t('workspace.workspaces.modal_novo_subtitulo') : t('workspace.workspaces.modal_editar_subtitulo')}
      dirty={!!dirty}
      podesSalvar={podesSalvar}
      tamanho="lg"
      altura="680px"
      abas={abas}
    />
    </>
  )
}
