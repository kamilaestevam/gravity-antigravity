/**
 * EtapaConfirmacao.tsx — Etapa 4 do Smart Import
 * Resumo dos resultados: criados / atualizados / pulados / erros
 */

import React from 'react'
import { CheckCircle, XCircle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { SmartImportResultado } from '../../shared/types'

// ── Props ─────────────────────────────────────────────────────────────────────

interface EtapaConfirmacaoProps {
  resultado: SmartImportResultado
  onVerPedidos: () => void
  onFechar: () => void
}

// ── Componente ────────────────────────────────────────────────────────────────

export function EtapaConfirmacao({ resultado, onVerPedidos, onFechar }: EtapaConfirmacaoProps) {
  const totalSucesso = resultado.criados + resultado.atualizados

  return (
    <div className="smart-import__resultado" role="status" aria-live="polite">
      {totalSucesso > 0 ? (
        <CheckCircle
          size={56}
          weight="duotone"
          className="smart-import__resultado-icone"
          aria-hidden="true"
        />
      ) : (
        <XCircle
          size={56}
          weight="duotone"
          style={{ color: '#ef4444' }}
          aria-hidden="true"
        />
      )}

      <h3 className="smart-import__resultado-titulo">
        {totalSucesso > 0
          ? `Importacao concluida — ${totalSucesso} pedido(s) processado(s)`
          : 'Nenhum pedido foi importado'}
      </h3>

      <div className="smart-import__resultado-grid">
        <div className="smart-import__resultado-card">
          <div className="smart-import__resultado-numero" style={{ color: '#34d399' }}>
            {resultado.criados}
          </div>
          <div className="smart-import__resultado-label">Criados</div>
        </div>
        <div className="smart-import__resultado-card">
          <div className="smart-import__resultado-numero" style={{ color: '#60a5fa' }}>
            {resultado.atualizados}
          </div>
          <div className="smart-import__resultado-label">Atualizados</div>
        </div>
        <div className="smart-import__resultado-card">
          <div className="smart-import__resultado-numero" style={{ color: '#94a3b8' }}>
            {resultado.pulados}
          </div>
          <div className="smart-import__resultado-label">Pulados</div>
        </div>
        <div className="smart-import__resultado-card">
          <div className="smart-import__resultado-numero" style={{ color: resultado.erros.length > 0 ? '#ef4444' : '#94a3b8' }}>
            {resultado.erros.length}
          </div>
          <div className="smart-import__resultado-label">Erros</div>
        </div>
      </div>

      {resultado.erros.length > 0 && (
        <div style={{ width: '100%', maxWidth: 520, textAlign: 'left' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>
            Linhas com erro:
          </p>
          <ul style={{ margin: 0, padding: '0 0 0 1rem', fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>
            {resultado.erros.map((e, i) => (
              <li key={i}>
                Linha {e.linha}: {e.motivo}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>
        Pedidos criados com status Rascunho. Valide os dados e altere para Aberto.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <BotaoGlobal variante="secundario" tamanho="medio" onClick={onFechar}>
          Fechar
        </BotaoGlobal>
        {resultado.ids_criados.length > 0 && (
          <BotaoGlobal variante="primario" tamanho="medio" onClick={onVerPedidos}>
            Ver Pedidos Importados
          </BotaoGlobal>
        )}
      </div>
    </div>
  )
}
