/**
 * ModalExibirAnexo.tsx — Visualizador de PDF do numerário
 */

interface Props {
  url: string
  onClose: () => void
}

export default function ModalExibirAnexoNumerario({ url, onClose }: Props) {
  return (
    <div className="fincom-modal-overlay" onClick={onClose}>
      <div className="fincom-modal fincom-modal--xl" onClick={e => e.stopPropagation()}>
        <div className="fincom-modal__header">
          <h2>Anexo — Prestacao de Contas</h2>
          <button className="fincom-modal__close" onClick={onClose}>×</button>
        </div>
        <div className="fincom-modal__body fincom-modal__body--pdf">
          <iframe
            src={url}
            title="Anexo PDF"
            style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '0.375rem' }}
          />
        </div>
        <div className="fincom-modal__footer">
          <a href={url} download className="fincom-btn fincom-btn--secondary">Download</a>
          <button className="fincom-btn fincom-btn--primary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}
