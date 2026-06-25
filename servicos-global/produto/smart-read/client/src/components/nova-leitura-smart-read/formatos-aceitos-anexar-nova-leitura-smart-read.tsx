/**
 * formatos-aceitos-anexar-nova-leitura-smart-read.tsx — formatos aceitos (passo 1)
 */

import {
  FileCode,
  FileCsv,
  FileImage,
  FilePdf,
  Table,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  EXTENSOES_ARQUIVO_LEITURA_SMART_READ,
  TOOLTIP_FORMATO_ARQUIVO_LEITURA_SMART_READ,
  type ExtensaoArquivoLeituraSmartRead,
} from '../../shared/entrada-arquivo-leitura-smart-read'

const ICONE_POR_EXTENSAO: Record<ExtensaoArquivoLeituraSmartRead, Icon> = {
  pdf: FilePdf,
  jpg: FileImage,
  jpeg: FileImage,
  png: FileImage,
  xml: FileCode,
  csv: FileCsv,
  xls: Table,
  xlsx: Table,
}

export function FormatosAceitosAnexarNovaLeituraSmartRead() {
  return (
    <section
      className="sr-wizard-formatos-aceitos"
      aria-labelledby="sr-wizard-formatos-aceitos-titulo"
    >
      <p id="sr-wizard-formatos-aceitos-titulo" className="sr-wizard-formatos-aceitos-titulo">
        Formatos aceitos pela plataforma
      </p>
      <div className="sr-wizard-formatos-aceitos-linha" role="list">
        {EXTENSOES_ARQUIVO_LEITURA_SMART_READ.map((extensao) => {
          const IconeFormato = ICONE_POR_EXTENSAO[extensao]
          const tooltip = TOOLTIP_FORMATO_ARQUIVO_LEITURA_SMART_READ[extensao]
          return (
            <TooltipGlobal
              key={extensao}
              titulo={tooltip.titulo}
              descricao={tooltip.descricao}
            >
              <div className="sr-wizard-formatos-aceitos-item" role="listitem">
                <IconeFormato
                  size={22}
                  weight="duotone"
                  className="sr-wizard-formatos-aceitos-icone"
                  aria-hidden
                />
                <span className="sr-wizard-formatos-aceitos-nome">.{extensao}</span>
              </div>
            </TooltipGlobal>
          )
        })}
      </div>
    </section>
  )
}
