/**
 * CelulaIdCopiavel — célula de tabela para IDs técnicos (decisão dono 2026-06-12).
 *
 * Padrão único das colunas "ID *" do Configurador/Admin: monospace discreto,
 * clique copia para a área de transferência e dispara toast de confirmação.
 * Extraído no code-review do PR #303 ([suggestion] DRY — 6 células repetiam
 * o mesmo snippet inline).
 *
 * Vive em `configurador/src/shared` (não em nucleo-global) por decisão do
 * Coordenador: todos os consumidores são telas do Configurador. Promover ao
 * núcleo apenas quando outro produto precisar do mesmo padrão.
 */
import { useShellStore } from '@gravity/shell'

interface CelulaIdCopiavelProps {
  /** O ID técnico exibido e copiado. */
  valor: string
  /** Mensagem do toast pós-cópia (passar já traduzida quando a tela usa i18n). */
  mensagemCopiado: string
  /** Tooltip nativo (atributo title). */
  titulo?: string
}

export function CelulaIdCopiavel({ valor, mensagemCopiado, titulo = 'Clique para copiar' }: CelulaIdCopiavelProps) {
  const addNotification = useShellStore((state) => state.addNotification)
  return (
    <span
      style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--ws-muted)', cursor: 'pointer', userSelect: 'all' }}
      title={titulo}
      onClick={ev => {
        ev.stopPropagation()
        void navigator.clipboard.writeText(valor)
        addNotification({ type: 'success', message: mensagemCopiado })
      }}
    >
      {valor}
    </span>
  )
}
