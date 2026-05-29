import { useEffect, useRef, useState } from 'react'
import { useSignIn } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  lerLoginPendenteConvite,
  limparLoginPendenteConvite,
} from './clerk-sessao-convite'

const MAX_TENTATIVAS = 6
const INTERVALO_MS = 1500

/**
 * Se o Clerk recarregar /login após concluir convite, faz login automático
 * com as credenciais guardadas em sessionStorage.
 */
export function useLoginAutomaticoPosConvite(): boolean {
  const navigate = useNavigate()
  const { isLoaded, signIn, setActive } = useSignIn()
  const [executando, setExecutando] = useState(false)
  const iniciouRef = useRef(false)

  useEffect(() => {
    if (!isLoaded || !signIn || !setActive || iniciouRef.current) return

    const credenciais = lerLoginPendenteConvite()
    if (!credenciais) return

    iniciouRef.current = true
    setExecutando(true)

    void (async () => {
      try {
        for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa += 1) {
          try {
            let login = await signIn.create({ transfer: true })

            if (login.status !== 'complete') {
              login = await signIn.create({
                identifier: credenciais.email,
                password: credenciais.senha,
              })
            }

            if (login.status === 'complete' && signIn.createdSessionId) {
              limparLoginPendenteConvite()
              await setActive({ session: signIn.createdSessionId })
              navigate('/hub', { replace: true })
              return
            }

            console.error('[LoginPosConvite] signIn incompleto após convite', {
              tentativa: tentativa + 1,
              status: login.status,
            })
          } catch (err) {
            const erroClerk = err as { errors?: Array<{ code?: string; message?: string }> }
            console.error('[LoginPosConvite] Falha no login automático pós-convite', {
              tentativa: tentativa + 1,
              code: erroClerk?.errors?.[0]?.code,
              message: erroClerk?.errors?.[0]?.message,
            })
          }

          if (tentativa < MAX_TENTATIVAS - 1) {
            await new Promise((resolve) => setTimeout(resolve, INTERVALO_MS))
          }
        }
      } finally {
        setExecutando(false)
      }
    })()
  }, [isLoaded, signIn, setActive, navigate])

  return executando
}
