/**
 * Certificado visual — Guia Gravity (modelo oficial University).
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  GraduationCap,
  HandWaving,
  Package,
  AirplaneTilt,
  FileText,
} from '@phosphor-icons/react'
import type { CertificadoEmitidoGuia, TipoCertificadoGuia } from './certificado-guia-gravity'
import { chaveI18nCertificadoGuia, formatarDataCertificadoGuia } from './certificado-guia-gravity'

const ICONES_TIPO_CERTIFICADO: Record<TipoCertificadoGuia, React.ComponentType<{ size?: number; weight?: 'duotone' | 'fill'; color?: string }>> = {
  'modulo-basico': GraduationCap,
  pedido: Package,
  'bid-frete': AirplaneTilt,
  'smart-read': FileText,
}

export function IconeTipoCertificadoGuia({ tipo, size = 18 }: { tipo: TipoCertificadoGuia; size?: number }) {
  const Icon = ICONES_TIPO_CERTIFICADO[tipo] ?? Package
  return <Icon weight="duotone" size={size} color="#c4b5fd" />
}

/** @deprecated use IconeTipoCertificadoGuia */
function IconeModuloCertificado({ slug, size = 18 }: { slug: string; size?: number }) {
  const mapa: Record<string, TipoCertificadoGuia> = {
    pedido: 'pedido',
    'bid-frete': 'bid-frete',
    'smart-read': 'smart-read',
    'modulo-basico': 'modulo-basico',
  }
  const tipo = mapa[slug]
  if (tipo) return <IconeTipoCertificadoGuia tipo={tipo} size={size} />
  return <HandWaving weight="duotone" size={size} color="#c4b5fd" />
}

export interface DadosCertificadoGuiaProps {
  certificado: CertificadoEmitidoGuia
  nomeUsuario: string
  xpModulo: number
  xpTotal: number
  nivel: number
  tituloNivel: string
  compacto?: boolean
}

export function CertificadoGuiaGravityVisual({
  certificado,
  nomeUsuario,
  xpModulo,
  xpTotal,
  nivel,
  tituloNivel,
  compacto = false,
}: DadosCertificadoGuiaProps) {
  const { t, i18n } = useTranslation()
  const tipo = certificado.tipo_certificado
  const nomeModulo = t(chaveI18nCertificadoGuia(tipo))
  const dataFormatada = formatarDataCertificadoGuia(certificado.emitido_em, i18n.language)

  return (
    <article
      className={`uni-certificado${compacto ? ' uni-certificado--compacto' : ''}`}
      aria-label={t('university.certificado.aria_certificado', { modulo: nomeModulo })}
    >
      <div className="uni-certificado__cantos" aria-hidden />
      <header className="uni-certificado__topo">
        <div className="uni-certificado__marca">
          <span className="uni-certificado__marca-icone" aria-hidden>
            <GraduationCap size={compacto ? 14 : 16} weight="fill" />
          </span>
          <div className="uni-certificado__marca-texto">
            <span className="uni-certificado__marca-nome">Gravity University</span>
            <span className="uni-certificado__marca-by">BY GRAVITY</span>
          </div>
        </div>
        <div className="uni-certificado__meta-topo">
          <span className="uni-certificado__tipo">{t('university.certificado.tipo')}</span>
          <span className="uni-certificado__numero">{t('university.certificado.numero', { numero: certificado.numero })}</span>
        </div>
      </header>

      <div className="uni-certificado__corpo">
        <div className="uni-certificado__texto-principal">
          <p className="uni-certificado__intro">{t('university.certificado.intro')}</p>
          <h2 className="uni-certificado__nome">{nomeUsuario}</h2>
          <p className="uni-certificado__descricao">{t('university.certificado.descricao')}</p>
          <div className="uni-certificado__modulo-badge">
            <span className="uni-certificado__modulo-icone" aria-hidden>
              <IconeTipoCertificadoGuia tipo={tipo} size={compacto ? 16 : 18} />
            </span>
            <span className="uni-certificado__modulo-nome">{nomeModulo}</span>
          </div>
        </div>

        {!compacto && (
          <div className="uni-certificado__selo" aria-hidden>
            <div className="uni-certificado__selo-anel">
              <span className="uni-certificado__selo-arco">GRAVITY UNIVERSITY</span>
              <div className="uni-certificado__selo-centro">
                <span className="uni-certificado__selo-gu">GU</span>
                <span className="uni-certificado__selo-certified">CERTIFIED</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="uni-certificado__metricas">
        <div className="uni-certificado__metrica">
          <span className="uni-certificado__metrica-rotulo">{t('university.certificado.nivel_rotulo')}</span>
          <span className="uni-certificado__metrica-valor">
            {t('university.dashboard.nivel_rotulo', { nivel, titulo: tituloNivel })}
          </span>
        </div>
        <div className="uni-certificado__metrica">
          <span className="uni-certificado__metrica-rotulo">{t('university.certificado.xp_rotulo')}</span>
          <span className="uni-certificado__metrica-valor">{xpModulo} XP</span>
        </div>
        <div className="uni-certificado__metrica">
          <span className="uni-certificado__metrica-rotulo">{t('university.certificado.data_rotulo')}</span>
          <span className="uni-certificado__metrica-valor">{dataFormatada}</span>
        </div>
      </div>

      {!compacto && (
        <footer className="uni-certificado__rodape">
          <div className="uni-certificado__assinatura">
            <div className="uni-certificado__assinatura-linha" aria-hidden />
            <span className="uni-certificado__assinatura-marca">Gravity</span>
            <span className="uni-certificado__assinatura-equipe">{t('university.certificado.equipe')}</span>
            <span className="uni-certificado__assinatura-emissao">{t('university.certificado.emissao_oficial')}</span>
          </div>
          <div className="uni-certificado__verificacao">
            <div className="uni-certificado__codigo-barras" aria-hidden />
            <span className="uni-certificado__codigo">{certificado.codigo_verificacao}</span>
            <span className="uni-certificado__verificar">{t('university.certificado.verificar_em')}</span>
          </div>
        </footer>
      )}
    </article>
  )
}

export { IconeModuloCertificado }
