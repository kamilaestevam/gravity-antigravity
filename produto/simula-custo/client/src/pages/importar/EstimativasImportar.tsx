/**
 * EstimativasImportar.tsx — Tela de Importação em Massa de Estimativas
 * Fase 2 do produto — usa PaginaGlobal + CabecalhoGlobal.
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Upload } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'

export default function EstimativasImportar() {
  const { t } = useTranslation()
  return (
    <PaginaGlobal
      layout="formulario"
      cabecalho={
        <CabecalhoGlobal
          titulo={t('simulacusto.importar_massa.titulo')}
          subtitulo={t('simulacusto.importar_massa.subtitulo')}
          icone={<Upload weight="duotone" size={22} color="#818cf8" />}
        />
      }
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: 'var(--ws-muted, #94a3b8)',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}>
        <Upload weight="duotone" size={48} style={{ opacity: 0.3 }} />
        <p style={{ fontSize: '0.9375rem', maxWidth: 400 }}>
          {t('simulacusto.importar_massa.fase_2', 'Funcionalidade disponível na Fase 2 do SimulaCusto.')}
        </p>
      </div>
    </PaginaGlobal>
  )
}
