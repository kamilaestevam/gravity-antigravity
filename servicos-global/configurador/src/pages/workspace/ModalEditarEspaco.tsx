/**
 * ModalEditarEspaco
 * Modal de edição de Espaço de Trabalho — padrão Gravity Design System.
 *
 * Componentes usados:
 *  - ModalGlobal         (@nucleo/modal-global)
 *  - GeralCampoGlobal    (@nucleo/geral-campo-global)
 *  - BotaoSalvar /
 *    BotaoCancelar       (@nucleo/botoes-salvar-global)
 *  - TooltipGlobal       (@nucleo/tooltip-global)
 *
 * Classes CSS do design system:
 *  - .em-section / .em-grid para layout de seções
 *  - .ws-field / .ws-input-icon-wrap para campos
 *  - .ws-section-title para cabeçalhos de seção
 */

import React, { useState, useEffect } from 'react'
import {
  Buildings,
  Globe,
  IdentificationCard,
  Gear,
  Warning,
  Lock,
  CalendarBlank,
  UsersThree,
  MapPin,
  Tag,
  Link,
  Info
} from '@phosphor-icons/react'
import { ModalGlobal } from '@nucleo/modal-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { GeralCampoGlobal } from '@nucleo/geral-campo-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { Empresa } from './EspacosDeTrabalho'

// ─── Helper ───────────────────────────────────────────────────────────────────

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Cabeçalho de seção — padrão Organizacao.tsx ─────────────────────────────

function SecaoTitulo({
  icone,
  titulo,
  tooltip,
}: {
  icone: React.ReactNode
  titulo: string
  tooltip?: string
}) {
  return (
    <p className="ws-section-title" style={{ width: 'max-content', marginBottom: '1rem', marginTop: 0 }}>
      {tooltip ? (
        <TooltipGlobal titulo={titulo} descricao={tooltip}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'help' }}>
            <span style={{ color: 'var(--ws-accent)', display: 'flex', alignItems: 'center' }}>{icone}</span>
            {titulo}
          </span>
        </TooltipGlobal>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ color: 'var(--ws-accent)', display: 'flex', alignItems: 'center' }}>{icone}</span>
          {titulo}
        </span>
      )}
    </p>
  )
}

// ─── Valor de campo readonly ──────────────────────────────────────────────────

function CampoReadonly({
  label,
  valor,
  icone,
  tooltip,
}: {
  label: string
  valor: string
  icone?: React.ReactNode
  tooltip?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ws-muted)' }}>
        {icone && (
          <span style={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>
            {icone}
          </span>
        )}
        <span style={{ fontStyle: 'italic', fontSize: '0.875rem' }}>
          {valor || '—'}
        </span>
        {tooltip && (
          <TooltipGlobal descricao={tooltip}>
            <Lock size={12} style={{ opacity: 0.5, cursor: 'help' }} />
          </TooltipGlobal>
        )}
      </div>
    </div>
  )
}

// ─── Aba: Informações (campos editáveis) ──────────────────────────────────────

function AbaInformacoes({
  empresa,
  nome,
  subdominio,
  erroSub,
  onNome,
  onSub,
  onDadoExtend
}: {
  empresa: Empresa
  nome: string
  subdominio: string
  erroSub: string
  onNome: (v: string) => void
  onSub: (v: string) => void
  onDadoExtend: (key: string, v: string) => void
}) {
  return (
    <div style={{ padding: '0 1.5rem 2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* Seção: Identidade */}
      <div>
        <SecaoTitulo
          icone={<IdentificationCard size={16} weight="duotone" />}
          titulo="Identidade"
          tooltip="Nome e identificação visual do espaço de trabalho na plataforma"
        />
        <div className="em-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <GeralCampoGlobal label="Nome da Empresa" obrigatorio>
              <div className="ws-input-icon-wrap">
                <Buildings size={16} />
                <input
                  value={nome}
                  placeholder="Ex: Acme Logística SP"
                  onChange={e => onNome(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </GeralCampoGlobal>
          </div>

          <div>
            <GeralCampoGlobal label="CNPJ">
              <div className="ws-input-icon-wrap">
                <IdentificationCard size={16} />
                <input
                  value={empresa.cnpj || ''}
                  placeholder="00.000.000/0000-00"
                  onChange={e => onDadoExtend('cnpj', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </GeralCampoGlobal>
          </div>

          <div>
            <GeralCampoGlobal label="Segmento">
              <div className="ws-input-icon-wrap">
                <Tag size={16} />
                <input
                  value={empresa.segmento || ''}
                  placeholder="Ex: Tecnologia"
                  onChange={e => onDadoExtend('segmento', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </GeralCampoGlobal>
          </div>

          <div>
            <GeralCampoGlobal label="Estado">
              <div className="ws-input-icon-wrap">
                <MapPin size={16} />
                <input
                  value={empresa.estado || ''}
                  placeholder="Ex: SP"
                  onChange={e => onDadoExtend('estado', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </GeralCampoGlobal>
          </div>

          <div>
            <GeralCampoGlobal label="Cidade">
              <div className="ws-input-icon-wrap">
                <MapPin size={16} />
                <input
                  value={empresa.cidade || ''}
                  placeholder="Ex: São Paulo"
                  onChange={e => onDadoExtend('cidade', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </GeralCampoGlobal>
          </div>
        </div>
      </div>

      {/* Seção: Endereço & Web */}
      <div>
        <SecaoTitulo
          icone={<Globe size={16} weight="duotone" />}
          titulo="Acesso e Web"
        />
        <div className="em-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <GeralCampoGlobal label="Site">
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
            <GeralCampoGlobal label="Domínio (Subdomínio)" obrigatorio>
              <div style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
                <div className="ws-input-icon-wrap" style={{ flex: 1, height: '40px' }}>
                  <Globe size={16} />
                  <input
                    value={subdominio}
                    placeholder="Ex: acme-logistica-sp"
                    onChange={e => onSub(slugify(e.target.value))}
                    style={{ borderRadius: '8px 0 0 8px', borderRight: 'none', width: '100%', height: '100%' }}
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

      {/* Seção: Dados do Sistema */}
      <div>
        <SecaoTitulo
          icone={<Info size={16} weight="duotone" />}
          titulo="Dados do Sistema"
        />
        <div className="em-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Status Label + Badge Borderless */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Status
            </label>
            <div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.6rem',
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
            </div>
          </div>

          <CampoReadonly
            label="Criado em"
            valor={empresa.criadaEm}
            icone={<CalendarBlank size={16} />}
          />

          <div style={{ gridColumn: '1 / -1' }}>
            <CampoReadonly
              label="Vinculado à Organização"
              valor={empresa.organizacao || 'Gravity Principal'}
              icone={<Buildings size={16} />}
            />
          </div>
        </div>
      </div>
      
      {/* Spacer para garantir scroll adicional da tela */}
      <div style={{ height: '5rem', width: '100%', flexShrink: 0 }} />
    </div>
  )
}

// ─── Modal principal ───────────────────────────────────────────────────────────

export interface ModalEditarEspacoProps {
  empresa: Empresa | null
  aoFechar: () => void
  aoSalvar: (dados: Partial<Empresa>) => void
  aoExcluir: (empresa: Empresa) => void
}

export function ModalEditarEspaco({
  empresa,
  aoFechar,
  aoSalvar,
  aoExcluir,
}: ModalEditarEspacoProps) {
  const [nome, setNome]         = useState('')
  const [sub, setSub]           = useState('')
  const [erroSub, setErroSub]   = useState('')
  const [extendData, setExtendData] = useState<Partial<Empresa>>({})

  // Preenche os campos ao abrir (empresa muda)
  useEffect(() => {
    if (empresa) {
      setNome(empresa.nome)
      setSub(empresa.subdominio)
      setErroSub('')
      setExtendData(empresa)
    }
  }, [empresa?.id])

  function handleSubChange(v: string) {
    const clean = slugify(v)
    setSub(clean)
    if (clean && !/^[a-z][a-z0-9-]*$/.test(clean)) {
      setErroSub('Use apenas letras minúsculas e hífens.')
    } else {
      setErroSub('')
    }
  }

  const dirty = !!empresa && (
    nome.trim() !== empresa.nome ||
    sub.trim()  !== empresa.subdominio ||
    ['cnpj', 'estado', 'cidade', 'segmento', 'site'].some(k => extendData[k as keyof Empresa] !== empresa[k as keyof Empresa])
  )
  const podesSalvar = dirty && !!nome.trim() && !!sub.trim() && !erroSub

  function handleSalvar() {
    if (!podesSalvar) return
    aoSalvar({ 
      ...extendData,
      nome: nome.trim(), 
      subdominio: sub.trim()
    })
  }

  function handleCancelar() {
    if (empresa) {
      setNome(empresa.nome)
      setSub(empresa.subdominio)
      setErroSub('')
      setExtendData(empresa)
    }
    aoFechar()
  }

  function handleExcluir() {
    if (!empresa) return
    if (!window.confirm(`Excluir permanentemente "${empresa.nome}"? Esta ação não pode ser desfeita.`)) return
    aoExcluir(empresa)
    aoFechar()
  }

  const abas = empresa ? [
    {
      id: 'informacoes',
      rotulo: 'Sessão 1',
      conteudo: (
        <AbaInformacoes
          empresa={{...empresa, ...extendData, nome, subdominio: sub}}
          nome={nome}
          subdominio={sub}
          erroSub={erroSub}
          onNome={setNome}
          onSub={handleSubChange}
          onDadoExtend={(k, v) => setExtendData(p => ({...p, [k]: v}))}
        />
      ),
    }
  ] : []

  return (
    <ModalGlobal
      aberto={!!empresa}
      aoFechar={handleCancelar}
      titulo="" // Preenchido via cabecalhoPersonalizado
      cabecalhoPersonalizado={
        <div className="ws-modal-cabecalho" style={{ borderBottom: '1px solid var(--ws-accent-border)', marginBottom: '1.5rem', paddingBottom: '0.2rem' }}>
          <CabecalhoGlobal
            icone={<Buildings weight="duotone" size={24} />}
            titulo={empresa?.nome ?? ''}
            subtitulo="Edite as informações e configurações do espaço de trabalho"
          />
        </div>
      }
      tamanho="lg"
      altura="680px"
      abas={abas}
      tipoAbas="pill"
      renderizarFooter={() => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '1.25rem 1.5rem', background: 'var(--bg-base)', borderTop: 'none', position: 'absolute', bottom: 0, left: 0, zIndex: 10 }}>
          {/* Custom style for exact button match */}
          <style>{`
            .botoes-footer-padrao {
              display: flex;
              gap: 0.75rem;
            }
            .botoes-footer-padrao button {
              height: 38px !important;
              padding: 0 1.25rem !important;
              font-size: 0.875rem !important;
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .mg-btn-danger-fix {
              height: 38px !important;
              padding: 0 1.25rem !important;
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
          `}</style>
          
          {/* Ação primária de perigo separada à esquerda */}
          <button
            className="mg-btn-danger mg-btn-danger-fix"
            onClick={handleExcluir}
          >
            Excluir
          </button>
          
          {/* Ações de formulário à direita */}
          <div className="botoes-footer-padrao">
            <BotaoCancelar
              dirty={dirty}
              rotulo="Cancelar"
              onClick={handleCancelar}
            />
            <BotaoSalvar
              dirty={podesSalvar}
              rotulo="Salvar Alterações"
              onClick={handleSalvar}
            />
          </div>
        </div>
      )}
    />
  )
}
