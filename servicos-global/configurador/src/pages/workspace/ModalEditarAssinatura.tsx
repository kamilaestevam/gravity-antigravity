import React, { useState, useEffect } from 'react'
import { ModalSemSessoesGlobal } from '@nucleo/modal-sem-sessoes-global'
import { GeralCampoGlobal } from '@nucleo/geral-campo-global'
import { Package, CurrencyDollar, CalendarBlank, Tag } from '@phosphor-icons/react'
import type { Produto } from './Assinaturas'

interface ModalEditarAssinaturaProps {
  produto: Produto | null
  aoFechar: () => void
  aoSalvar: (dados: Produto) => void
}

const BILLING_OPTIONS = [
  { value: 'SaaS',  label: 'SaaS — Mensalidade recorrente' },
  { value: 'Uso',   label: 'Uso — Por consumo/evento'       },
  { value: 'Setup', label: 'Setup — Implantação única'      },
]

export function ModalEditarAssinatura({ produto, aoFechar, aoSalvar }: ModalEditarAssinaturaProps) {
  const [nome,     setNome]     = useState('')
  const [billing,  setBilling]  = useState<Produto['billing']>('SaaS')
  const [valor,    setValor]    = useState('')
  const [renovacao,setRenovacao]= useState('')

  useEffect(() => {
    if (produto) {
      setNome(produto.nome)
      setBilling(produto.billing)
      setValor(produto.valor)
      setRenovacao(produto.renovacao)
    }
  }, [produto])

  const dirty = produto
    ? nome !== produto.nome || billing !== produto.billing || valor !== produto.valor || renovacao !== produto.renovacao
    : false

  function handleSalvar() {
    if (!produto) return
    aoSalvar({ ...produto, nome, billing, valor, renovacao })
  }

  return (
    <ModalSemSessoesGlobal
      aberto={!!produto}
      aoFechar={aoFechar}
      tamanho="md"
      altura="520px"
      titulo="Editar Assinatura"
      subtitulo="Ajuste os dados e condições do produto contratado"
      botoes={[
        { rotulo: 'Cancelar', variante: 'ghost', ao_clicar: aoFechar },
        { rotulo: 'Salvar Alterações', variante: 'primary', ao_clicar: handleSalvar, desabilitado: !dirty || !nome.trim() }
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
        <GeralCampoGlobal label="Nome do Produto" obrigatorio>
          <div className="ws-input-icon-wrap">
            <Package size={16} />
            <input
              value={nome}
              placeholder="Ex: Dashboard Global"
              onChange={e => setNome(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </GeralCampoGlobal>

        <GeralCampoGlobal label="Modelo de Cobrança">
          <div className="ws-input-icon-wrap" style={{ padding: 0 }}>
            <select
              value={billing}
              onChange={e => setBilling(e.target.value as Produto['billing'])}
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--ws-text)', padding: '0 1rem 0 2.5rem', appearance: 'none', height: '100%' }}
            >
              {BILLING_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <Tag size={16} style={{ position: 'absolute', left: '0.875rem', color: 'var(--ws-muted)' }} />
          </div>
        </GeralCampoGlobal>

        <GeralCampoGlobal label="Valor">
          <div className="ws-input-icon-wrap">
            <CurrencyDollar size={16} />
            <input
              value={valor}
              placeholder="Ex: R$ 299/mês"
              onChange={e => setValor(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </GeralCampoGlobal>

        <GeralCampoGlobal label="Renovação / Ciclo">
          <div className="ws-input-icon-wrap">
            <CalendarBlank size={16} />
            <input
              value={renovacao}
              placeholder="Ex: 01/05/2025 ou Variável"
              onChange={e => setRenovacao(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </GeralCampoGlobal>
      </div>
    </ModalSemSessoesGlobal>
  )
}
