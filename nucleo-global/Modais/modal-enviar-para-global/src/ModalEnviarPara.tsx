/**
 * @nucleo/modal-enviar-para-global
 *
 * Modal reutilizável para enviar conteúdo (deep link) a outros usuários do tenant.
 * Zero lógica de negócio — recebe lista de usuários via props, retorna IDs + mensagem.
 *
 * Uso típico:
 *   <ModalEnviarParaGlobal
 *     aberto={aberto}
 *     aoFechar={fechar}
 *     aoEnviar={({ destinatarios, mensagem }) => { ... }}
 *     usuarios={usuariosDoTenant}
 *     descricaoConteudo="Dashboard Exportações — Abril"
 *   />
 */

import React, { useState, useMemo } from 'react'
import { PaperPlaneTilt, MagnifyingGlass, UserCirclePlus, X } from '@phosphor-icons/react'
import { ModalGlobal } from '@nucleo/modal-global'
import type { ModalEnviarParaProps, UsuarioDestinatario } from './tipos'

const CHAR_LIMIT = 500

export function ModalEnviarPara({
  aberto,
  aoFechar,
  aoEnviar,
  usuarios,
  titulo = 'Enviar para',
  descricaoConteudo,
  carregando = false,
  maxDestinatarios = 20,
}: ModalEnviarParaProps) {
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [mensagem, setMensagem] = useState('')
  const [busca, setBusca] = useState('')

  const resetState = () => {
    setSelecionados([])
    setMensagem('')
    setBusca('')
  }

  const handleFechar = () => {
    resetState()
    aoFechar()
  }

  const handleEnviar = () => {
    if (selecionados.length === 0) return
    aoEnviar({ destinatarios: selecionados, mensagem: mensagem.trim() })
    resetState()
  }

  const toggleUsuario = (id: string) => {
    setSelecionados((prev) => {
      if (prev.includes(id)) return prev.filter((uid) => uid !== id)
      if (prev.length >= maxDestinatarios) return prev
      return [...prev, id]
    })
  }

  const removerUsuario = (id: string) => {
    setSelecionados((prev) => prev.filter((uid) => uid !== id))
  }

  const usuariosFiltrados = useMemo(() => {
    if (!busca.trim()) return usuarios
    const termo = busca.toLowerCase()
    return usuarios.filter(
      (u) => u.nome.toLowerCase().includes(termo) || (u.email?.toLowerCase().includes(termo) ?? false)
    )
  }, [usuarios, busca])

  const selecionadosInfo = useMemo(
    () => usuarios.filter((u) => selecionados.includes(u.id)),
    [usuarios, selecionados]
  )

  return (
    <ModalGlobal
      aberto={aberto}
      aoFechar={handleFechar}
      titulo={titulo}
      iconeTitulo="ph-paper-plane-tilt"
      tamanho="md"
      botoes={[
        {
          rotulo: 'Cancelar',
          variante: 'ghost',
          ao_clicar: handleFechar,
        },
        {
          rotulo: selecionados.length > 1
            ? `Enviar para ${selecionados.length} pessoas`
            : 'Enviar',
          variante: 'primary',
          ao_clicar: handleEnviar,
          desabilitado: selecionados.length === 0 || carregando,
          carregando,
          icone: 'ph-paper-plane-tilt',
        },
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Descrição do conteúdo */}
        {descricaoConteudo && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            background: 'var(--bg-elevated, rgba(99, 102, 241, 0.08))',
            border: '1px solid var(--border-subtle, rgba(99, 102, 241, 0.15))',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary, #94a3b8)',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>
              Compartilhando:
            </span>{' '}
            {descricaoConteudo}
          </div>
        )}

        {/* Pills dos selecionados */}
        {selecionadosInfo.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.375rem',
          }}>
            {selecionadosInfo.map((u) => (
              <span
                key={u.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  background: 'var(--accent-indigo-bg, rgba(99, 102, 241, 0.15))',
                  color: 'var(--accent-indigo, #818cf8)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {u.nome}
                <button
                  type="button"
                  onClick={() => removerUsuario(u.id)}
                  aria-label={`Remover ${u.nome}`}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: '50%',
                    padding: '1px',
                  }}
                >
                  <X size={12} weight="bold" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Busca */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.5rem',
          background: 'var(--bg-input, rgba(15, 23, 42, 0.5))',
          border: '1px solid var(--border-default, rgba(148, 163, 184, 0.15))',
        }}>
          <MagnifyingGlass size={16} weight="bold" style={{ color: 'var(--text-muted, #64748b)', flexShrink: 0 }} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou email..."
            aria-label="Buscar usuários"
            style={{
              all: 'unset',
              flex: 1,
              fontSize: '0.8125rem',
              color: 'var(--text-primary, #f1f5f9)',
            }}
          />
        </div>

        {/* Lista de usuários */}
        <div
          style={{
            maxHeight: '220px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
          role="listbox"
          aria-label="Selecionar destinatários"
          aria-multiselectable="true"
        >
          {usuariosFiltrados.length === 0 ? (
            <div style={{
              padding: '1.5rem',
              textAlign: 'center',
              fontSize: '0.8125rem',
              color: 'var(--text-muted, #64748b)',
            }}>
              {busca ? 'Nenhum usuário encontrado.' : 'Nenhum usuário disponível.'}
            </div>
          ) : (
            usuariosFiltrados.map((u) => {
              const checked = selecionados.includes(u.id)
              return (
                <button
                  key={u.id}
                  type="button"
                  role="option"
                  aria-selected={checked}
                  onClick={() => toggleUsuario(u.id)}
                  style={{
                    all: 'unset',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    background: checked
                      ? 'var(--accent-indigo-bg, rgba(99, 102, 241, 0.1))'
                      : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: checked
                      ? 'var(--accent-indigo, #6366f1)'
                      : 'var(--bg-elevated, rgba(148, 163, 184, 0.15))',
                    color: checked ? '#fff' : 'var(--text-secondary, #94a3b8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}>
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      u.nome.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--text-primary, #f1f5f9)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {u.nome}
                    </div>
                    {u.email && (
                      <div style={{
                        fontSize: '0.6875rem',
                        color: 'var(--text-muted, #64748b)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {u.email}
                      </div>
                    )}
                  </div>

                  {/* Check indicator */}
                  {checked && (
                    <div style={{ color: 'var(--accent-indigo, #6366f1)', flexShrink: 0 }}>
                      <UserCirclePlus size={18} weight="fill" />
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Mensagem opcional */}
        <div>
          <label
            htmlFor="enviar-para-mensagem"
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--text-secondary, #94a3b8)',
              marginBottom: '0.375rem',
            }}
          >
            Mensagem (opcional)
          </label>
          <textarea
            id="enviar-para-mensagem"
            value={mensagem}
            onChange={(e) => {
              if (e.target.value.length <= CHAR_LIMIT) setMensagem(e.target.value)
            }}
            placeholder="Adicione uma mensagem para o destinatário..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-default, rgba(148, 163, 184, 0.15))',
              background: 'var(--bg-input, rgba(15, 23, 42, 0.5))',
              color: 'var(--text-primary, #f1f5f9)',
              fontSize: '0.8125rem',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <div style={{
            textAlign: 'right',
            fontSize: '0.625rem',
            color: 'var(--text-muted, #64748b)',
            marginTop: '0.25rem',
          }}>
            {mensagem.length} / {CHAR_LIMIT}
          </div>
        </div>
      </div>
    </ModalGlobal>
  )
}
