/**
 * BannerSnapshotAtualizado.tsx — Banner retroativo do snapshot do Pedido
 *
 * Contexto (FASE 06E — Frente 3):
 * Quando os dados-base no Cadastros (Empresa, OPE, NCM, Moeda, Unidade) são
 * atualizados E a política do workspace permite re-sincronizar, o snapshot
 * do Pedido é re-congelado. Este banner avisa o usuário, retroativamente,
 * que isso aconteceu — para que ele saiba que os valores que está vendo
 * no detalhe do pedido refletem a atualização recente.
 *
 * Props:
 *   ultimaAtualizacao    — Date | string | null (ISO8601). null → não renderiza.
 *   papeisAtualizados    — lista de papéis afetados ('empresa', 'ope', 'ncm', 'moeda', 'unidade').
 *   onFechar?            — opcional; sem ele o botão de fechar fica oculto.
 *
 * Render:
 *   Se `ultimaAtualizacao` é null OU `papeisAtualizados` vazio → não renderiza nada.
 *
 * Estilo:
 *   Banner âmbar coerente com `msc-feedback--aviso` da Configuração de Snapshot
 *   (mesmo tom #fbbf24 usado em todo o pedido para avisos informativos).
 */

import { useTranslation } from 'react-i18next'
import { Info, X } from '@phosphor-icons/react'
import './BannerSnapshotAtualizado.css'

export type PapelSnapshotBanner = 'empresa' | 'ope' | 'ncm' | 'moeda' | 'unidade'

export interface BannerSnapshotAtualizadoProps {
  ultimaAtualizacao: Date | string | null
  papeisAtualizados: PapelSnapshotBanner[]
  onFechar?: () => void
}

const PAPEL_LABEL_PT: Record<PapelSnapshotBanner, string> = {
  empresa: 'Empresa',
  ope:     'OPE',
  ncm:     'NCM',
  moeda:   'Moeda',
  unidade: 'Unidade',
}

function formatarDataHora(data: Date | string, locale: string): string {
  const d = typeof data === 'string' ? new Date(data) : data
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(locale || 'pt-BR', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

function listarPapeis(papeis: PapelSnapshotBanner[], traduzir: (chave: PapelSnapshotBanner) => string): string {
  if (papeis.length === 0) return ''
  if (papeis.length === 1) return traduzir(papeis[0])
  if (papeis.length === 2) return `${traduzir(papeis[0])} e ${traduzir(papeis[1])}`
  const tudo = papeis.map(traduzir)
  const ultimo = tudo.pop()
  return `${tudo.join(', ')} e ${ultimo}`
}

export function BannerSnapshotAtualizado({
  ultimaAtualizacao,
  papeisAtualizados,
  onFechar,
}: BannerSnapshotAtualizadoProps) {
  const { t, i18n } = useTranslation()

  // Não renderiza sem dados (REGRA 05 — falha silenciosa ok pois não é autorização)
  if (!ultimaAtualizacao || papeisAtualizados.length === 0) return null

  const dataFormatada = formatarDataHora(ultimaAtualizacao, i18n.language)
  if (!dataFormatada) return null

  // Tradução por papel: tenta i18n; se chave faltar, cai no PT-BR canonical.
  const traduzirPapel = (papel: PapelSnapshotBanner): string => {
    const chave = `pedido.banner.snapshot_papel_${papel}`
    const traducao = t(chave)
    return traducao === chave ? PAPEL_LABEL_PT[papel] : traducao
  }

  const papeisListados = listarPapeis(papeisAtualizados, traduzirPapel)

  // Título e descrição: i18n com fallback PT-BR.
  const tituloChave = 'pedido.banner.snapshot_atualizado_titulo'
  const tituloTraduzido = t(tituloChave)
  const titulo = tituloTraduzido === tituloChave ? 'Cadastros atualizados' : tituloTraduzido

  const descChave = 'pedido.banner.snapshot_atualizado_descricao'
  const descTraduzida = t(descChave, {
    papeis: papeisListados,
    data:   dataFormatada,
  })
  const descricao = descTraduzida === descChave
    ? `Os dados de ${papeisListados} foram atualizados em ${dataFormatada} com base em mudanças no Cadastros.`
    : descTraduzida

  const fecharLabel = (() => {
    const chave = 'pedido.banner.fechar'
    const traducao = t(chave)
    return traducao === chave ? 'Fechar' : traducao
  })()

  return (
    <div className="banner-snapshot-atualizado" role="status" aria-live="polite">
      <Info
        size={18}
        weight="duotone"
        aria-hidden="true"
        className="banner-snapshot-atualizado__icone"
      />
      <div className="banner-snapshot-atualizado__corpo">
        <div className="banner-snapshot-atualizado__titulo">{titulo}</div>
        <div
          className="banner-snapshot-atualizado__descricao"
          // Renderiza papéis em <strong> sem precisar de i18n com Trans:
          // o template canonical em PT-BR ja tras o destaque visualmente
          // suficiente; quem quiser HTML rico no i18n pode usar Trans.
        >
          {descricao}
        </div>
      </div>
      {onFechar && (
        <button
          type="button"
          className="banner-snapshot-atualizado__fechar"
          onClick={onFechar}
          aria-label={fecharLabel}
        >
          <X size={14} weight="bold" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
