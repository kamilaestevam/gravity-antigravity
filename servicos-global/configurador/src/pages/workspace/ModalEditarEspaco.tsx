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
    <GeralCampoGlobal label={label}>
      <div className="em-readonly">
        {icone && (
          <span style={{ color: 'var(--ws-muted)', marginRight: '0.5rem', display: 'flex', alignItems: 'center' }}>
            {icone}
          </span>
        )}
        <span style={{ color: 'var(--ws-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>
          {valor || '—'}
        </span>
        {tooltip && (
          <TooltipGlobal descricao={tooltip}>
            <Lock size={12} style={{ color: 'var(--ws-muted)', marginLeft: 'auto', opacity: 0.5 }} />
          </TooltipGlobal>
        )}
      </div>
    </GeralCampoGlobal>
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
    <div style={{ padding: '1.5rem' }}>

      {/* Seção: Identidade */}
      <div style={{ marginBottom: '2rem' }}>
        <SecaoTitulo
          icone={<IdentificationCard size={14} weight="duotone" />}
          titulo="Identidade"
          tooltip="Nome e identificação visual do espaço de trabalho na plataforma"
        />
        <div className="em-grid">
          <div style={{ gridColumn: '1 / -1' }}>
            <GeralCampoGlobal label="Nome da Empresa" obrigatorio>
              <div className="ws-input-icon-wrap">
                <Buildings size={16} />
                <input
                  value={nome}
                  placeholder="Ex: Acme Logística SP"
                  onChange={e => onNome(e.target.value)}
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
                />
              </div>
            </GeralCampoGlobal>
          </div>
        </div>
      </div>

      {/* Seção: Endereço & Web */}
      <div style={{ marginBottom: '2rem' }}>
        <SecaoTitulo
          icone={<Globe size={14} weight="duotone" />}
          titulo="Acesso e Web"
        />
        <div className="em-grid">
          <div style={{ gridColumn: '1 / -1' }}>
            <GeralCampoGlobal label="Site">
              <div className="ws-input-icon-wrap">
                <Link size={16} />
                <input
                  value={empresa.site || ''}
                  placeholder="Ex: https://www.acme.com.br"
                  onChange={e => onDadoExtend('site', e.target.value)}
                />
              </div>
            </GeralCampoGlobal>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <GeralCampoGlobal label="Domínio (Subdomínio)" obrigatorio>
              <div style={{ display: 'flex', gap: '0' }}>
                <div className="ws-input-icon-wrap" style={{ flex: 1 }}>
                  <Globe size={16} />
                  <input
                    value={subdominio}
                    placeholder="Ex: acme-logistica-sp"
                    onChange={e => onSub(slugify(e.target.value))}
                    style={{ borderRadius: '8px 0 0 8px', borderRight: 'none' }}
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
          icone={<Info size={14} weight="duotone" />}
          titulo="Dados do Sistema"
        />
        <div className="em-grid">
          <GeralCampoGlobal label="Status">
            <div className="em-readonly">
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
          </GeralCampoGlobal>

          <CampoReadonly
            label="Criado em"
            valor={empresa.criadaEm}
            icone={<CalendarBlank size={14} />}
          />

          <div style={{ gridColumn: '1 / -1' }}>
            <CampoReadonly
              label="Vinculado à Organização"
              valor={empresa.organizacao || 'Gravity Principal'}
              icone={<Buildings size={14} />}
            />
          </div>
        </div>
      </div>
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
      id: 'info',
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
        <div className="ws-modal-cabecalho" style={{ borderBottom: '1px solid var(--ws-accent-border)', marginBottom: '1.5rem' }}>
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}>
          {/* Excluir — esquerda */}
          <button
            className="mg-btn-danger"
            onClick={handleExcluir}
          >
            Excluir
          </button>

          {/* Cancelar + Salvar — direita */}
          <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
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
