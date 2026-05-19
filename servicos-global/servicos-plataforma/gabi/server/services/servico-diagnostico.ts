// server/services/servico-diagnostico.ts
// Diagnostico de erros dos backends + abertura de chamados pela GABI.
// Models: GabiDiagnosticoErro, GabiChamado (fragment.prisma)

import prisma from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'

// ── Tipos ───────────────────────────────────────────────────────────────────

interface RegistroErro {
  id_organizacao: string
  id_usuario: string
  produto: string
  endpoint: string
  metodo: string
  status_http: number
  codigo_erro?: string
  detalhes?: string
  payload_resumo?: Record<string, unknown>
}

export interface ErroRecente {
  produto: string
  endpoint: string
  metodo: string
  status_http: number
  codigo_erro?: string
  detalhes?: string
  data_criacao: Date
}

interface DadosChamado {
  id_organizacao: string
  id_usuario: string
  tipo: string
  produto: string
  descricao_usuario: string
  diagnostico?: string
  id_conversa?: string
}

export interface Chamado {
  numero: string
  status: string
  tipo: string
  produto: string
  descricao_usuario: string
  data_criacao: Date
}

// ── Registrar erro (fire-and-forget dos backends) ───────────────────────────

export async function registrarErro(dados: RegistroErro): Promise<void> {
  try {
    await prisma.gabiDiagnosticoErro.create({
      data: {
        id_organizacao_gabi_diagnostico_erro: dados.id_organizacao,
        id_usuario_gabi_diagnostico_erro: dados.id_usuario,
        produto_gabi_diagnostico_erro: dados.produto,
        endpoint_gabi_diagnostico_erro: dados.endpoint,
        metodo_gabi_diagnostico_erro: dados.metodo,
        status_http_gabi_diagnostico_erro: dados.status_http,
        codigo_erro_gabi_diagnostico_erro: dados.codigo_erro,
        detalhes_gabi_diagnostico_erro: dados.detalhes?.slice(0, 5000),
        payload_resumo_gabi_diagnostico_erro: dados.payload_resumo ?? undefined,
      },
    })
  } catch (err) {
    console.error('[GABI/Diagnostico] Falha ao registrar erro:', err)
  }
}

// ── Consultar erros recentes do usuario ─────────────────────────────────────

export async function consultarErrosRecentes(
  id_organizacao: string,
  id_usuario: string,
  limite = 10,
  periodo_horas = 24,
): Promise<ErroRecente[]> {
  const desde = new Date(Date.now() - periodo_horas * 60 * 60 * 1000)

  const registros = await prisma.gabiDiagnosticoErro.findMany({
    where: {
      id_organizacao_gabi_diagnostico_erro: id_organizacao,
      id_usuario_gabi_diagnostico_erro: id_usuario,
      data_criacao_gabi_diagnostico_erro: { gte: desde },
    },
    orderBy: { data_criacao_gabi_diagnostico_erro: 'desc' },
    take: limite,
  })

  return registros.map((r) => ({
    produto: r.produto_gabi_diagnostico_erro,
    endpoint: r.endpoint_gabi_diagnostico_erro,
    metodo: r.metodo_gabi_diagnostico_erro,
    status_http: r.status_http_gabi_diagnostico_erro,
    codigo_erro: r.codigo_erro_gabi_diagnostico_erro ?? undefined,
    detalhes: r.detalhes_gabi_diagnostico_erro ?? undefined,
    data_criacao: r.data_criacao_gabi_diagnostico_erro,
  }))
}

// ── Diagnosticar problema do usuario ────────────────────────────────────────

export async function diagnosticarProblema(
  id_organizacao: string,
  id_usuario: string,
): Promise<string> {
  const erros = await consultarErrosRecentes(id_organizacao, id_usuario, 5, 1)

  if (erros.length === 0) {
    return 'Nenhum erro recente encontrado nos ultimos 60 minutos.'
  }

  const linhas: string[] = [`Encontrei ${erros.length} erro(s) recente(s):`]

  for (const e of erros) {
    const tempo = formatarTempoRelativo(e.data_criacao)
    linhas.push(`- ${e.metodo} ${e.endpoint} → HTTP ${e.status_http} (${e.produto}, ${tempo})`)
    if (e.codigo_erro) linhas.push(`  Codigo: ${e.codigo_erro}`)
    if (e.detalhes) linhas.push(`  Detalhes: ${e.detalhes.slice(0, 200)}`)
  }

  // Agrupar por produto/status para sugestao
  const agrupados = new Map<string, number>()
  for (const e of erros) {
    const chave = `${e.produto}:${e.status_http}`
    agrupados.set(chave, (agrupados.get(chave) ?? 0) + 1)
  }

  linhas.push('\nSugestao:')
  for (const [chave, count] of agrupados) {
    const [produto, status] = chave.split(':')
    const statusNum = Number(status)

    if (statusNum === 401 || statusNum === 403) {
      linhas.push(`- ${produto}: problema de autenticacao/permissao (${count}x). Verifique se seu login esta ativo.`)
    } else if (statusNum === 404) {
      linhas.push(`- ${produto}: recurso nao encontrado (${count}x). Verifique se o item ainda existe.`)
    } else if (statusNum >= 500) {
      linhas.push(`- ${produto}: erro interno do servidor (${count}x). Se persistir, abra um chamado.`)
    } else if (statusNum === 429) {
      linhas.push(`- ${produto}: limite de requisicoes atingido (${count}x). Aguarde alguns minutos.`)
    }
  }

  return linhas.join('\n')
}

// ── Abrir chamado ───────────────────────────────────────────────────────────

export async function abrirChamado(dados: DadosChamado): Promise<Chamado> {
  const numero = await gerarNumeroChamado()

  const registro = await prisma.gabiChamado.create({
    data: {
      id_organizacao_gabi_chamado: dados.id_organizacao,
      id_usuario_gabi_chamado: dados.id_usuario,
      numero_gabi_chamado: numero,
      tipo_gabi_chamado: dados.tipo,
      produto_gabi_chamado: dados.produto,
      descricao_usuario_gabi_chamado: dados.descricao_usuario,
      diagnostico_gabi_chamado: dados.diagnostico,
      id_conversa_gabi_chamado: dados.id_conversa,
    },
  })

  // Enviar email fire-and-forget
  enviarEmailChamado(numero, dados).catch(() => {})

  return {
    numero,
    status: 'aberto',
    tipo: dados.tipo,
    produto: dados.produto,
    descricao_usuario: dados.descricao_usuario,
    data_criacao: registro.data_criacao_gabi_chamado,
  }
}

// ── Consultar chamados do usuario ───────────────────────────────────────────

export async function consultarChamados(
  id_organizacao: string,
  id_usuario: string,
  limite = 10,
): Promise<Chamado[]> {
  const registros = await prisma.gabiChamado.findMany({
    where: {
      id_organizacao_gabi_chamado: id_organizacao,
      id_usuario_gabi_chamado: id_usuario,
    },
    orderBy: { data_criacao_gabi_chamado: 'desc' },
    take: limite,
  })

  return registros.map((r) => ({
    numero: r.numero_gabi_chamado,
    status: r.status_gabi_chamado,
    tipo: r.tipo_gabi_chamado,
    produto: r.produto_gabi_chamado,
    descricao_usuario: r.descricao_usuario_gabi_chamado,
    data_criacao: r.data_criacao_gabi_chamado,
  }))
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function gerarNumeroChamado(): Promise<string> {
  const ano = new Date().getFullYear()
  const count = await prisma.gabiChamado.count({
    where: {
      numero_gabi_chamado: { startsWith: `GABI-${ano}` },
    },
  })
  const seq = String(count + 1).padStart(4, '0')
  return `GABI-${ano}-${seq}`
}

async function enviarEmailChamado(numero: string, dados: DadosChamado): Promise<void> {
  const EMAIL_CHAMADOS = process.env.EMAIL_CHAMADOS ?? 'chamados@usegravity.com.br'
  const GABI_SERVICE_URL = process.env.GABI_SERVICE_URL ?? 'http://localhost:8009'

  try {
    await fetch(`${GABI_SERVICE_URL}/api/v1/gabi/internal/enviar-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destinatario: EMAIL_CHAMADOS,
        assunto: `[GABI Chamado ${numero}] ${dados.tipo} — ${dados.produto}`,
        corpo: [
          `Chamado: ${numero}`,
          `Tipo: ${dados.tipo}`,
          `Produto: ${dados.produto}`,
          `Organizacao: ${dados.id_organizacao}`,
          `Usuario: ${dados.id_usuario}`,
          `Descricao: ${dados.descricao_usuario}`,
          dados.diagnostico ? `Diagnostico GABI: ${dados.diagnostico}` : '',
        ].filter(Boolean).join('\n'),
      }),
      signal: AbortSignal.timeout(5_000),
    })
  } catch (err) {
    console.warn(`[GABI/Chamado] Falha ao enviar email para ${numero}:`, err)
  }
}

function formatarTempoRelativo(data: Date): string {
  const diff = Date.now() - data.getTime()
  const minutos = Math.floor(diff / 60_000)
  if (minutos < 1) return 'agora'
  if (minutos < 60) return `ha ${minutos}min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `ha ${horas}h`
  return `ha ${Math.floor(horas / 24)}d`
}
