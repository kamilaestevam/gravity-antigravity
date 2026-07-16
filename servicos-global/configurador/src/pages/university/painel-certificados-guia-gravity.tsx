/**
 * Painel e modal de certificados — dashboard Minha jornada.
 */

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Certificate, X } from '@phosphor-icons/react'
import {
  chaveI18nCertificadoGuia,
  listarCertificadosOrdenados,
  SLUGS_MODULO_BASICO_GUIA,
  TIPOS_CERTIFICADO_GUIA,
  type CertificadoEmitidoGuia,
  type MapaCertificadosGuia,
  type TipoCertificadoGuia,
} from './certificado-guia-gravity'
import {
  CertificadoGuiaGravityVisual,
  IconeTipoCertificadoGuia,
} from './certificado-guia-gravity-visual'

export function xpCertificadoGuia(
  tipo: TipoCertificadoGuia,
  xpPorSlug: Record<string, number>,
): number {
  if (tipo === 'modulo-basico') {
    return SLUGS_MODULO_BASICO_GUIA.reduce((s, slug) => s + (xpPorSlug[slug] ?? 0), 0)
  }
  return xpPorSlug[tipo] ?? 0
}

export function ModalCertificadoGuiaGravity({
  certificado,
  nomeUsuario,
  xpModulo,
  xpTotal,
  nivel,
  tituloNivel,
  onFechar,
}: {
  certificado: CertificadoEmitidoGuia
  nomeUsuario: string
  xpModulo: number
  xpTotal: number
  nivel: number
  tituloNivel: string
  onFechar: () => void
}) {
  const { t } = useTranslation()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onFechar])

  return createPortal(
    <div className="uni-certificado-modal" role="dialog" aria-modal="true" aria-labelledby="uni-certificado-modal-titulo">
      <button type="button" className="uni-certificado-modal__backdrop" aria-label={t('university.certificado.fechar')} onClick={onFechar} />
      <div className="uni-certificado-modal__conteudo">
        <div className="uni-certificado-modal__cabecalho">
          <h2 id="uni-certificado-modal-titulo" className="uni-certificado-modal__titulo">
            {t('university.certificado.modal_titulo')}
          </h2>
          <button type="button" className="uni-certificado-modal__fechar" aria-label={t('university.certificado.fechar')} onClick={onFechar}>
            <X size={18} weight="bold" />
          </button>
        </div>
        <CertificadoGuiaGravityVisual
          certificado={certificado}
          nomeUsuario={nomeUsuario}
          xpModulo={xpModulo}
          xpTotal={xpTotal}
          nivel={nivel}
          tituloNivel={tituloNivel}
        />
      </div>
    </div>,
    document.body,
  )
}

interface PainelCertificadosGuiaGravityProps {
  nomeUsuario: string
  xpTotal: number
  nivel: number
  tituloNivel: string
  xpPorSlug: Record<string, number>
  mapaCertificados: MapaCertificadosGuia
  certificadoAberto: CertificadoEmitidoGuia | null
  onAbrirCertificado: (cert: CertificadoEmitidoGuia) => void
  onFecharCertificado: () => void
}

export function PainelCertificadosGuiaGravity({
  nomeUsuario,
  xpTotal,
  nivel,
  tituloNivel,
  xpPorSlug,
  mapaCertificados,
  certificadoAberto,
  onAbrirCertificado,
  onFecharCertificado,
}: PainelCertificadosGuiaGravityProps) {
  const { t } = useTranslation()
  const certificados = listarCertificadosOrdenados(mapaCertificados)

  if (certificados.length === 0) {
    return (
      <>
        <div className="uni-certificados-vazio">
          <Certificate size={28} weight="duotone" color="#64748b" aria-hidden />
          <p>{t('university.certificado.vazio')}</p>
        </div>
        {certificadoAberto && (
          <ModalCertificadoGuiaGravity
            certificado={certificadoAberto}
            nomeUsuario={nomeUsuario}
            xpModulo={xpCertificadoGuia(certificadoAberto.tipo_certificado, xpPorSlug)}
            xpTotal={xpTotal}
            nivel={nivel}
            tituloNivel={tituloNivel}
            onFechar={onFecharCertificado}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="uni-certificados-grade">
        {certificados.map(cert => {
          const nome = t(chaveI18nCertificadoGuia(cert.tipo_certificado))
          return (
            <button
              key={cert.tipo_certificado}
              type="button"
              className="uni-certificados-card"
              onClick={() => onAbrirCertificado(cert)}
              aria-label={t('university.certificado.abrir', { modulo: nome })}
            >
              <div className="uni-certificados-card__preview-area">
                <div className="uni-certificados-card__preview">
                  <CertificadoGuiaGravityVisual
                  certificado={cert}
                  nomeUsuario={nomeUsuario}
                  xpModulo={xpCertificadoGuia(cert.tipo_certificado, xpPorSlug)}
                  xpTotal={xpTotal}
                  nivel={nivel}
                  tituloNivel={tituloNivel}
                  compacto
                />
                </div>
              </div>
              <div className="uni-certificados-card__rotulo">
                <span className="uni-certificados-card__icone" aria-hidden>
                  <IconeTipoCertificadoGuia tipo={cert.tipo_certificado} size={16} />
                </span>
                <span className="uni-certificados-card__nome">{nome}</span>
                <span className="uni-certificados-card__acao">{t('university.certificado.ver')}</span>
              </div>
            </button>
          )
        })}
      </div>

      {certificadoAberto && (
        <ModalCertificadoGuiaGravity
          certificado={certificadoAberto}
          nomeUsuario={nomeUsuario}
          xpModulo={xpCertificadoGuia(certificadoAberto.tipo_certificado, xpPorSlug)}
          xpTotal={xpTotal}
          nivel={nivel}
          tituloNivel={tituloNivel}
          onFechar={onFecharCertificado}
        />
      )}
    </>
  )
}

export { TIPOS_CERTIFICADO_GUIA }
