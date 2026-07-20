/** Rota interna — captura de screenshots do manual Smart Docs › Histórico (Playwright). */
import { SmartDocSimulator } from '../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/smart-doc/SmartDocSimulator'

export default function DevCapturaHistoricoSmartDocs() {
  return (
    <div style={{ minHeight: '100vh', background: '#0b0f1a', padding: 16 }}>
      <SmartDocSimulator sidebarInicial="historico" />
    </div>
  )
}
