/**
 * capsolver.ts — CapSolver Connector
 * Resolve hCaptcha para acesso ao Portal Único Siscomex.
 * Skill: antigravity-simulacusto (Anti-Captcha Strategy)
 */

import axios from 'axios'

const CAPSOLVER_API_KEY = process.env.CAPSOLVER_API_KEY
const SISCOMEX_SITE_KEY = process.env.SISCOMEX_HCAPTCHA_SITE_KEY || '51829642-2c97-4db0-881c-d40b4ef3b259'
const CORE_URL = 'https://portalunico.siscomex.gov.br/portal/'

export class CapSolver {
  private client = axios.create({ baseURL: 'https://api.capsolver.com' })

  constructor(private apiKey: string = CAPSOLVER_API_KEY || '') {}

  async solve(type: 'HCaptchaTaskProxyLess' = 'HCaptchaTaskProxyLess'): Promise<string> {
    if (!this.apiKey) {
      console.warn('[CapSolver] API Key não configurada. Usando mock token.')
      return 'MOCK_TOKEN_RESOLVIDO'
    }

    try {
      // 1. Criar tarefa
      const createTask = await this.client.post('/createTask', {
        clientKey: this.apiKey,
        task: {
          type,
          websiteURL: CORE_URL,
          websiteKey: SISCOMEX_SITE_KEY,
        }
      })

      const taskId = createTask.data.taskId
      if (!taskId) throw new Error('Falha ao criar tarefa no CapSolver')

      // 2. Poll para resultado (timeout: 60s)
      let token = ''
      let count = 0
      while (count < 20) {
        await new Promise(r => setTimeout(r, 3000))
        const getTask = await this.client.post('/getTaskResult', {
          clientKey: this.apiKey,
          taskId
        })

        if (getTask.data.status === 'ready') {
          token = getTask.data.solution.gRecaptchaResponse
          break
        }
        count++
      }

      if (!token) throw new Error('Timeout ao resolver captcha')
      return token

    } catch (error: any) {
      console.error('[CapSolver] Erro:', error.response?.data || error.message)
      throw new Error(`Falha no Anti-Captcha: ${error.message}`)
    }
  }
}
