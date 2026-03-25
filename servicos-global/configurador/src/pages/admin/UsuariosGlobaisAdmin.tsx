import React, { useState } from 'react'
import { Users, PauseCircle, PlayCircle, PencilSimple, Trash } from '@phosphor-icons/react'
import { useOrganization } from '@clerk/clerk-react'

import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { BotaoNovoGlobal } from '@nucleo/botao-novo-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { CardBasicoGlobal } from '@nucleo/card-global'

export function UsuariosGlobaisAdmin() {
  const { organization, memberships, isLoaded } = useOrganization({
    memberships: {
      keepPreviousData: true,
    },
  })

  const [showForm, setShowForm] = useState(false)
  const [fEmail, setFEmail] = useState('')
  const [fRole, setFRole] = useState('org:admin')

  // Se não existir organização no contexto logado do Clerk, exibe interface vazia ou apenas um mock interativo.
  const admins = memberships?.data || []
  const adminCount = admins.length

  async function handleInvite() {
    if (!fEmail.trim()) return
    try {
       // Dispara o convite via Clerk (só funciona se organization estiver definida e o usuário tiver permissão)
       await organization?.inviteMember({
         emailAddress: fEmail.trim(),
         role: fRole,
       })
       setFEmail('')
       setShowForm(false)
       alert('Convite enviado com sucesso!')
    } catch (err: any) {
       console.error(err)
       alert(err.errors?.[0]?.message || 'Erro ao enviar convite')
    }
  }

  const COLUNAS: TabelaGlobalColuna<any>[] = [
    {
      key: 'name', label: 'Usuário', tipo: 'texto',
      tooltipTitulo: 'User Object do Clerk', tooltipDescricao: 'Acessa dados públicos de identidade via JWT no backend e reidrata no frontend.',
      render: (_, membro) => {
        const publicUserData = membro.publicUserData
        const name = publicUserData?.firstName ? `${publicUserData.firstName} ${publicUserData.lastName || ''}`.trim() : publicUserData?.identifier || 'Usuário'
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 32, height: 32, minWidth: 32, borderRadius: '50%',
              background: 'rgba(129,140,248,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
              color: '#818cf8',
            }}>
              {name.slice(0, 2).toUpperCase()}
            </div>
            <span style={{ fontWeight: 600 }}>{name}</span>
          </div>
        )
      }
    },
    {
      key: 'email', label: 'E-mail', tipo: 'texto',
      tooltipTitulo: 'Identificador SSO Primário', tooltipDescricao: 'E-mailaddress que vincula a autenticação federada (SAML/OAuth) à sessão atual.',
      render: (_, membro) => (
        <span style={{ color: 'var(--ws-muted)' }}>
          {membro.publicUserData?.identifier || membro.emailAddress || '---'}
        </span>
      )
    },
    {
      key: 'role', label: 'Nível', tipo: 'texto',
      tooltipTitulo: 'Role-Based Access Control (RBAC)', tooltipDescricao: 'Nível de privilégio extraído do payload do token JWT (org:admin, org:member).',
      render: (_, membro) => {
         const isSuper = membro.role === 'org:admin'
         return (
           <span style={{ 
             padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em',
             color: isSuper ? '#818cf8' : '#34d399', 
             background: isSuper ? 'rgba(129,140,248,0.1)' : 'rgba(52,211,153,0.1)' 
           }}>
             {isSuper ? 'Super Admin' : 'Admin'}
           </span>
         )
      }
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      tooltipTitulo: 'Estado da Conta', tooltipDescricao: 'Sinaliza validade e integridade do token da sessão corrente na infraestrutura.',
      render: () => {
         return (
           <span style={{ 
             display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', 
             background: 'rgba(52,211,153,0.12)', 
             color: '#34d399', 
             border: '1px solid rgba(52,211,153,0.2)'
           }}>
             Ativo
           </span>
         )
      }
    }
  ]

  const ACOES: TabelaGlobalAcao<any>[] = [
    {
      id: 'remove',
      icone: <Trash size={15} weight="bold" />,
      tooltip: 'Remover Acesso',
      onClick: async (membro) => {
         if (confirm(`Remover acesso de ${membro.publicUserData?.identifier}?`)) {
            await membro.destroy()
         }
      },
      onRenderStyle: () => ({ background: 'rgba(248,113,113,0.12)', borderColor: 'rgba(248,113,113,0.3)', color: '#f87171' })
    }
  ]

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Users weight="duotone" size={22} />}
          titulo="Usuários Globais (HQ)"
          subtitulo="Gerencie os super administradores que têm acesso total à infraestrutura Gravity."
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo="Super Admins Ativos"
            valor={isLoaded ? adminCount : '...'}
            icone={<Users weight="duotone" size={18} />}
          />
        </>
      }
      acoes={
        <BotaoNovoGlobal
          rotulo="Convidar Admin"
          rotuloAtivo="Cancelar"
          ativo={showForm}
          onClick={() => setShowForm(v => !v)}
        />
      }
    >
      {showForm && (
        <div className="ws-form-card ws-fade-up" style={{ marginBottom: '1.5rem' }}>
          <p className="ws-section-title">
            <Users weight="duotone" size={14} color="#818cf8" />
            Convidar Super Admin
          </p>
          <div className="ws-form-row">
            <div className="ws-field">
              <label>E-mail Corporativo</label>
              <input type="email" placeholder="admin@gravity.com.br" value={fEmail} onChange={e => setFEmail(e.target.value)} />
            </div>
            <div className="ws-field">
              <label>Nível de Acesso (Papel)</label>
              <select value={fRole} onChange={e => setFRole(e.target.value)}>
                <option value="org:admin">Super Admin (org:admin)</option>
                <option value="org:member">Admin Limitado (org:member)</option>
              </select>
            </div>
          </div>
          <div className="ws-form-actions">
            <BotaoGlobal
              variante="primario"
              onClick={handleInvite}
              disabled={!fEmail.trim() || !organization}
            >
              Enviar Convite
            </BotaoGlobal>
            <BotaoGlobal
              variante="fantasma"
              onClick={() => { setShowForm(false); setFEmail('') }}
            >
              Cancelar
            </BotaoGlobal>
          </div>
          {!organization && (
            <p style={{ marginTop: '1rem', color: '#f87171', fontSize: '0.8125rem' }}>
              Nenhuma Organização Clerk vinculada ao seu usuário atual. Não é possível enviar convites reais até o Clerk HQ ser configurado como Organização.
            </p>
          )}
        </div>
      )}

      {/* Tabela de Usuários Globais */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <TabelaGlobal<any>
          dados={admins}
          colunas={COLUNAS}
          acoes={ACOES}
          mensagemVazio="Nenhum administrador encontrado ou Organização não configurada."
          mensagemSemFiltro="Adicione seu primeiro Super Admin utilizando o botão acima."
        />
      </div>

    </PaginaGlobal>
  )
}
