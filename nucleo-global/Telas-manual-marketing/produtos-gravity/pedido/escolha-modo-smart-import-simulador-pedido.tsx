import { FileArrowUp, Lightning, PencilSimpleLine, Warning } from '@phosphor-icons/react'

export type ModoInicioSmartImportSimulador = 'manual' | 'exemplo'

type Props = {
  carregandoExemplo: boolean
  erroExemplo: string | null
  onEscolherManual: () => void
  onEscolherExemplo: () => void
}

export function EscolhaModoSmartImportSimuladorPedido({
  carregandoExemplo,
  erroExemplo,
  onEscolherManual,
  onEscolherExemplo,
}: Props) {
  return (
    <div className="smart-import__escolha-modo">
      <div className="smart-import__escolha-modo-header">
        <h3 className="smart-import__escolha-modo-titulo">Como você quer testar a importação?</h3>
        <p className="smart-import__escolha-modo-subtitulo">
          No simulador, só aceitamos planilha Excel (.xlsx): baixe o template vazio ou use a demonstração já preenchida.
        </p>
      </div>

      <div className="smart-import__escolha-modo-grid">
        <button
          type="button"
          className="smart-import__escolha-modo-card"
          onClick={onEscolherManual}
          disabled={carregandoExemplo}
        >
          <span className="smart-import__escolha-modo-icone smart-import__escolha-modo-icone--manual" aria-hidden>
            <PencilSimpleLine size={28} weight="duotone" />
          </span>
          <span className="smart-import__escolha-modo-card-titulo">Quero preencher para teste</span>
          <span className="smart-import__escolha-modo-card-desc">
            Baixe o template vazio, preencha no Excel e envie o arquivo quando estiver pronto.
          </span>
          <span className="smart-import__escolha-modo-card-dica">
            <FileArrowUp size={14} weight="bold" aria-hidden />
            Upload manual na próxima etapa
          </span>
        </button>

        <button
          type="button"
          className="smart-import__escolha-modo-card smart-import__escolha-modo-card--destaque"
          onClick={onEscolherExemplo}
          disabled={carregandoExemplo}
        >
          <span className="smart-import__escolha-modo-icone smart-import__escolha-modo-icone--rapido" aria-hidden>
            <Lightning size={28} weight="duotone" />
          </span>
          <span className="smart-import__escolha-modo-card-titulo">Quero usar um já preenchido</span>
          <span className="smart-import__escolha-modo-card-desc">
            Baixa nossa planilha de demonstração (1 pedido + 1 item) para você anexar na etapa de upload.
          </span>
          <span className="smart-import__escolha-modo-card-dica">
            {carregandoExemplo ? 'Baixando planilha...' : 'Download automático + aviso para anexar'}
          </span>
        </button>
      </div>

      {erroExemplo && (
        <div className="smart-import__erro" role="alert" style={{ marginTop: '1rem' }}>
          <Warning size={16} weight="fill" aria-hidden />
          <span>{erroExemplo}</span>
        </div>
      )}

      <p className="smart-import__escolha-modo-nota">
        Você pode trocar de modo fechando e abrindo a importação novamente.
      </p>
    </div>
  )
}
