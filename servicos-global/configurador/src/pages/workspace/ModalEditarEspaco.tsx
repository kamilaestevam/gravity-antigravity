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
import { ModalSemSessoesGlobal } from '@nucleo/modal-sem-sessoes-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { GeralCampoGlobal } from '@nucleo/geral-campo-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { StatusSalvarGlobal } from '@nucleo/status-salvar-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { SelectGlobal } from '@nucleo/select-global'
import type { SelectOpcao } from '@nucleo/select-global'
import { ModalExclusao } from './ModalExclusao'
import type { Empresa } from './EspacosDeTrabalho'

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

// ─── Helper ─────────────────────────────────────────────────────────────────

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
  marginBottom = '1rem',
}: {
  icone: React.ReactNode
  titulo: string
  tooltip?: string
  marginBottom?: string | number
}) {
  return (
    <p className="ws-section-title" style={{ width: 'max-content', marginBottom, marginTop: 0 }}>
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
  const [cidades, setCidades] = useState<SelectOpcao[]>([])
  const [carregandoCidades, setCarregandoCidades] = useState(false)

  // ── Carregar Cidades do IBGE ─────────────────────────────────────────────
  useEffect(() => {
    if (!empresa.estado) {
      setCidades([])
      return
    }
    setCarregandoCidades(true)
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${empresa.estado}/municipios`)
      .then(res => res.json())
      .then(data => {
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
  }, [empresa.estado])

  return (
    <div style={{ padding: '0 1.5rem 2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* Seção: Identidade */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <SecaoTitulo
            icone={<IdentificationCard size={16} weight="duotone" />}
            titulo="Identidade"
            tooltip="Nome e identificação visual do espaço de trabalho na plataforma"
            marginBottom={0}
          />
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
        </div>
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
            <GeralCampoGlobal label="Cidade">
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
  const [mostrarExclusao, setMostrarExclusao] = useState(false)

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
    setMostrarExclusao(true)
  }

  function confirmarExclusao() {
    if (!empresa) return
    aoExcluir(empresa)
    setMostrarExclusao(false)
    aoFechar()
  }

  return (
    <>
    <ModalSemSessoesGlobal
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
      renderizarFooter={() => (
        <div className="mg-footer-personalizado">
          
          {/* Ação primária de perigo separada à esquerda */}
          <button
            className="mg-btn-danger mg-btn-danger-fix"
            onClick={handleExcluir}
          >
            Excluir
          </button>
          
          {/* Ações de formulário à direita */}
          <div className="botoes-footer-padrao">
            <StatusSalvarGlobal status={dirty ? 'dirty' : 'idle'} hideOnIdle={true} />
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
    >
      {empresa && (
        <AbaInformacoes
          empresa={{...empresa, ...extendData, nome, subdominio: sub}}
          nome={nome}
          subdominio={sub}
          erroSub={erroSub}
          onNome={setNome}
          onSub={handleSubChange}
          onDadoExtend={(k, v) => setExtendData(p => ({...p, [k]: v}))}
        />
      )}
    </ModalSemSessoesGlobal>

    <ModalExclusao
      aberto={mostrarExclusao}
      titulo="Excluir Espaço de Trabalho"
      descricao={<>Tem certeza de que deseja excluir permanentemente o espaço de trabalho <strong>{empresa?.nome}</strong>?</>}
      nomeItem="Esta ação é irreversível e excluirá todos os dados permanentemente."
      aoConfirmar={confirmarExclusao}
      aoCancelar={() => setMostrarExclusao(false)}
    />
    </>
  )
}
