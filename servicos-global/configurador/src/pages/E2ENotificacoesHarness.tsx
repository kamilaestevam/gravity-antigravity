/**
 * E2ENotificacoesHarness — rota de teste dev-only
 *
 * Renderiza AvisoInternoGlobal sem autenticação Clerk para que os
 * testes E2E do Playwright possam validar o componente isoladamente.
 *
 * SEGURANÇA: este componente só existe quando import.meta.env.DEV === true.
 * O Vite substitui DEV por false em builds de produção — a rota nunca é exposta.
 *
 * Expõe window.__e2eAddAviso para simular push SSE nos testes F5.
 */
import React, { useState, useCallback, useEffect } from 'react'
import {
  AvisoInternoGlobal,
  type AvisoInterno,
  type Canal,
} from '@nucleo/mensageria-global'

const MOCK_AVISOS: AvisoInterno[] = [
  {
    id: 'e2e-1',
    conteudo: 'Reunião de alinhamento amanhã às 10h sobre o fechamento do trimestre.',
    autor: { nome: 'Carlos Mendes' },
    dataHora: '17/04/2026, 09:14',
    lido: false,
    tipo: 'aviso',
  },
  {
    id: 'e2e-2',
    conteudo: 'Nova importação de NF concluída: 47 itens importados com sucesso, 2 com divergência de NCM.',
    autor: { nome: 'Sistema' },
    dataHora: '16/04/2026, 17:30',
    lido: false,
    tipo: 'sistema',
  },
  {
    id: 'e2e-3',
    conteudo: '@você Preciso que você revise os valores do SimulaCusto para o cliente Importadora Delta.',
    autor: { nome: 'Ana Lima' },
    dataHora: '15/04/2026, 14:10',
    lido: true,
    tipo: 'mencao',
    href: '/produto/simulacusto',
  },
]

const MOCK_USUARIOS = [
  { id: 'user-b', nome: 'Usuário Beta', email: 'beta@gravity.test' },
]

type WindowWithE2E = Window & {
  __e2eAddAviso?: (a: AvisoInterno) => void
}

export function E2ENotificacoesHarness() {
  const [avisos, setAvisos] = useState<AvisoInterno[]>(MOCK_AVISOS)

  const addAviso = useCallback((aviso: AvisoInterno) => {
    setAvisos(prev => [aviso, ...prev])
  }, [])

  // Expõe hook para Playwright simular push SSE (teste F5-02)
  useEffect(() => {
    (window as WindowWithE2E).__e2eAddAviso = addAviso
    return () => {
      delete (window as WindowWithE2E).__e2eAddAviso
    }
  }, [addAviso])

  const handleMarcarLido = useCallback((id: string) => {
    setAvisos(prev => prev.map(a => a.id === id ? { ...a, lido: true } : a))
  }, [])

  const handleMarcarTodosLidos = useCallback(() => {
    setAvisos(prev => prev.map(a => ({ ...a, lido: true })))
  }, [])

  const handleCriarAviso = useCallback(async (texto: string) => {
    const novo: AvisoInterno = {
      id: `e2e-nota-${Date.now()}`,
      conteudo: texto,
      autor: { nome: 'Você' },
      dataHora: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      lido: false,
      tipo: 'aviso',
    }
    setAvisos(prev => [novo, ...prev])
  }, [])

  const handleEnviarPara = useCallback(
    async (_destinatarios: string[], mensagem: string, _link?: string, _canais?: Canal[]) => {
      const novo: AvisoInterno = {
        id: `e2e-env-${Date.now()}`,
        conteudo: mensagem,
        autor: { nome: 'Você' },
        dataHora: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
        lido: false,
        tipo: 'enviado',
      }
      setAvisos(prev => [novo, ...prev])
    },
    []
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--ws-bg-body, #0f172a)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        padding: '0.75rem 1rem',
      }}
    >
      <AvisoInternoGlobal
        avisos={avisos}
        carregando={false}
        erro={null}
        onMarcarLido={handleMarcarLido}
        onMarcarTodosLidos={handleMarcarTodosLidos}
        onCriarAviso={handleCriarAviso}
        onEnviarPara={handleEnviarPara}
        onNavegarHref={() => {}}
        usuariosTenant={MOCK_USUARIOS}
        linkAtual="/e2e-notificacoes"
        canaisDisponiveis={{ email: true, whatsapp: false }}
      />
    </div>
  )
}
