import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Buildings,
  Globe,
  IdentificationCard,
  Warning,
  CalendarBlank,
  MapPin,
  Tag,
  Link,
  Package
} from '@phosphor-icons/react'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { SecaoFormularioGlobal } from '@nucleo/modal-formulario-global'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import type { Empresa } from './Workspaces'

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

// ─── Helper ─────────────────────────────────────────────────────────────────

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatarCNPJ(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

// ─── Aba: Informações (campos editáveis) ──────────────────────────────────────

function AbaInformacoes({
  empresa,
  nome,
  subdominio,
  erroSub,
  onNome,
  onSub,
  onDadoExtend,
  cidades,
  carregandoCidades
}: {
  empresa: Partial<Empresa>
  nome: string
  subdominio: string
  erroSub: string
  onNome: (v: string) => void
  onSub: (v: string) => void
  onDadoExtend: (key: string, v: string) => void
  cidades: SelectOpcao[]
  carregandoCidades: boolean
}) {
  const { t } = useTranslation()
  const ehNovo = !empresa.id

  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* Seção: Identidade */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <SecaoFormularioGlobal
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
                background: empresa.status === 'Ativa' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                color: empresa.status === 'Ativa' ? '#34d399' : '#f87171',
                border: `1px solid ${empresa.status === 'Ativa' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
              }}>
                {empresa.status}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.75rem' }}>
                <CalendarBlank size={14} />
                <span>Criado em {empresa.criadaEm}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.75rem' }}>
                <Buildings size={14} />
                <span>{empresa.organizacao || 'Gravity Principal'}</span>
              </div>
            </div>
          )}
        </div>
        <div className="em-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <GeralCampoGlobal label={t('workspace.organization.campo_nome')} obrigatorio>
              <div className="ws-input-icon-wrap">
                <Buildings size={16} />
                <input
                  value={nome}
                  placeholder="Ex: Acme Logística SP"
                  onChange={e => onNome(e.target.value)}
                  style={{ width: '100%' }}
                  autoFocus={ehNovo}
                />
              </div>
            </GeralCampoGlobal>
          </div>

          <div>
            <GeralCampoGlobal label={t('workspace.organization.campo_cnpj')}>
              <div className="ws-input-icon-wrap">
                <IdentificationCard size={16} />
                <input
                  value={empresa.cnpj || ''}
                  placeholder="00.000.000/0000-00"
                  onChange={e => onDadoExtend('cnpj', formatarCNPJ(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </GeralCampoGlobal>
          </div>

          <div>
            <GeralCampoGlobal label={t('workspace.organization.campo_segmento')}>
              <SelectGlobal
                iconeEsquerda={<Package size={16} />}
                opcoes={OPCOES_SEGMENTOS}
                valor={empresa.segmento || null}
                aoMudarValor={(v: string | number | null) => onDadoExtend('segmento', String(v ?? ''))}
                placeholder="Selecione..."
                buscavel
              />
            </GeralCampoGlobal>
          </div>

          <div>
            <GeralCampoGlobal label={t('workspace.organization.campo_estado')}>
              <SelectGlobal
                iconeEsquerda={<MapPin size={16} />}
                opcoes={OPCOES_ESTADOS}
                valor={empresa.estado || null}
                aoMudarValor={(v: string | number | null) => {
                  onDadoExtend('estado', String(v ?? ''))
                  onDadoExtend('cidade', '')
                }}
                placeholder="Ex: SP"
                buscavel
              />
            </GeralCampoGlobal>
          </div>

          <div>
            <GeralCampoGlobal label={t('workspace.organization.campo_cidade')}>
              <SelectGlobal
                iconeEsquerda={<MapPin size={16} />}
                opcoes={cidades}
                valor={empresa.cidade || null}
                aoMudarValor={v => onDadoExtend('cidade', String(v ?? ''))}
                placeholder={empresa.estado ? "Ex: São Paulo" : "Selecione o estado..."}
                buscavel
                desabilitado={!empresa.estado}
                carregando={carregandoCidades}
              />
            </GeralCampoGlobal>
          </div>
        </div>
      </div>

      {/* Seção: Endereço & Web */}
      <div>
        <SecaoFormularioGlobal
          icone={<Globe size={16} weight="duotone" />}
          titulo={t('workspace.workspaces.secao_acesso_web')}
        />
        <div className="em-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <GeralCampoGlobal label={t('workspace.organization.campo_site')}>
              <div className="ws-input-icon-wrap">
                <Link size={16} />
                <input
                  value={empresa.site || ''}
                  placeholder="Ex: https://www.acme.com.br"
                  onChange={e => onDadoExtend('site', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </GeralCampoGlobal>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <GeralCampoGlobal label={t('workspace.workspaces.campo_subdominio')} obrigatorio>
              <div style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
                <div className="ws-input-icon-wrap" style={{ flex: 1, height: '40px' }}>
                  <Globe size={16} />
                  <input
                    value={subdominio}
                    placeholder="Ex: acme-logistica-sp"
                    onChange={e => onSub(slugify(e.target.value))}
                    disabled={ehNovo}
                    style={{ borderRadius: '8px 0 0 8px', borderRight: 'none', width: '100%', height: '100%', cursor: ehNovo ? 'not-allowed' : 'text', opacity: ehNovo ? 0.7 : 1 }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 0.875rem',
                  background: 'var(--ws-surface)',
                  border: '1px solid var(--ws-accent-border)',
                  borderLeft: 'none',
                  borderRadius: '0 8px 8px 0',
                  color: 'var(--ws-muted)',
                  fontSize: '0.8125rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  height: '40px',
                }}>
                  .gravity.com.br
                </div>
              </div>

              {/* Erro de validação */}
              {erroSub && (
                <p style={{
                  fontSize: '0.75rem',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  margin: '0.375rem 0 0',
                }}>
                  <Warning size={12} weight="bold" />
                  {erroSub}
                </p>
              )}

              {/* Preview da URL */}
              {subdominio && !erroSub && (
                <p style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', margin: '0.375rem 0 0' }}>
                  URL:{' '}
                  <strong style={{ color: 'var(--ws-accent)' }}>
                    {subdominio}.gravity.com.br
                  </strong>
                </p>
              )}
            </GeralCampoGlobal>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Modal principal ───────────────────────────────────────────────────────────

export interface ModalEditarWorkspaceProps {
  empresa: Empresa | null // Se id sumir, vira criação
  aberto: boolean
  aoFechar: () => void
  aoSalvar: (dados: Partial<Empresa>) => void
}

export function ModalEditarWorkspace({
  empresa,
  aberto,
  aoFechar,
  aoSalvar,
}: ModalEditarWorkspaceProps) {
  const { t } = useTranslation()
  const [nome, setNome]         = useState('')
  const [sub, setSub]           = useState('')
  const [erroSub, setErroSub]   = useState('')
  const [extendData, setExtendData] = useState<Partial<Empresa>>({})
  const [manualSub, setManualSub] = useState(false)
  const [cidades, setCidades]         = useState<SelectOpcao[]>([])
  const [carregandoCidades, setCarregandoCidades] = useState(false)

  // ── Carregar Cidades do IBGE ─────────────────────────────────────────────
  useEffect(() => {
    // Busca o estado atual do extendData ou da empresa original
    const estadoAtual = extendData.estado
    
    if (!estadoAtual) {
      setCidades([])
      return
    }

    setCarregandoCidades(true)
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoAtual}/municipios`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          setCidades([])
          return
        }
        const opcoes = data.map((c: any) => ({
          valor: c.nome,
          rotulo: c.nome
        }))
        opcoes.sort((a: SelectOpcao, b: SelectOpcao) => a.rotulo.localeCompare(b.rotulo))
        setCidades(opcoes)
      })
      .catch(err => {
        console.error("Erro ao buscar cidades do IBGE:", err)
        setCidades([])
      })
      .finally(() => setCarregandoCidades(false))
  }, [extendData.estado])

  // Preenche os campos ao abrir
  useEffect(() => {
    if (aberto) {
      if (empresa) {
        setNome(empresa.nome || '')
        setSub(empresa.subdominio || '')
        setErroSub('')
        setExtendData(empresa)
      } else {
        setNome('')
        setSub('')
        setErroSub('')
        setExtendData({})
        setManualSub(false)
      }
    }
  }, [aberto, empresa?.id])

  function handleSubChange(v: string) {
    const clean = slugify(v)
    setSub(clean)
    if (clean && !/^[a-z][a-z0-9-]*$/.test(clean)) {
      setErroSub('Use apenas letras minúsculas e hífens.')
    } else {
      setErroSub('')
    }
  }

  const ehNovo = !empresa?.id
  const dirty = ehNovo 
    ? (nome.trim().length > 0 || sub.trim().length > 0)
    : (
      nome.trim() !== empresa?.nome ||
      sub.trim()  !== empresa?.subdominio ||
      ['cnpj', 'estado', 'cidade', 'segmento', 'site'].some(k => extendData[k as keyof Empresa] !== empresa?.[k as keyof Empresa])
    )
    
  const podesSalvar = !!nome.trim() && !!sub.trim() && !erroSub

  function handleSalvar() {
    if (!podesSalvar) return
    aoSalvar({ 
      ...extendData,
      nome: nome.trim(), 
      subdominio: sub.trim()
    })
  }

  const abas = useMemo(() => [
    {
      id: 'geral',
      rotulo: t('workspace.workspaces.aba_informacoes_gerais'),
      conteudo: (
        <AbaInformacoes
          empresa={{...extendData, id: empresa?.id, nome, subdominio: sub}}
          nome={nome}
          subdominio={sub}
          erroSub={erroSub}
          onNome={(v) => {
            setNome(v)
            if (ehNovo && !manualSub) {
              handleSubChange(v)
            }
          }}
          onSub={(v) => {
            setManualSub(true)
            handleSubChange(v)
          }}
          onDadoExtend={(k, v) => setExtendData(p => ({...p, [k]: v}))}
          cidades={cidades}
          carregandoCidades={carregandoCidades}
        />
      )
    }
  ], [extendData, empresa?.id, nome, sub, erroSub, cidades, carregandoCidades])

  return (
    <>
    <ModalFormularioAbasGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      aoSalvar={handleSalvar}
      icone={<Buildings weight="duotone" size={24} />}
      titulo={ehNovo ? (nome || t('workspace.workspaces.novo_workspace')) : (empresa?.nome ?? '')}
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
