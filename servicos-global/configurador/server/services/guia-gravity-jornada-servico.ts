// server/services/guia-gravity-jornada-servico.ts
// Persistência e cálculos derivados da jornada Guia Gravity (University).

import type { Prisma } from '../../../../configurador/generated/index.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import {
  avaliarTiposCertificadoElegiveis,
  gerarCodigoVerificacaoGuia,
  gerarNumeroCertificadoGuia,
  xpModuloCertificado,
  type TipoCertificadoGuiaGravity,
} from '../../shared/guia-gravity/certificado-guia-gravity.js'
import { TOTAL_MANUAIS_GUIA_GRAVITY, slugManualGuiaGravityValido } from '../../shared/guia-gravity/catalogo-manuais-guia-gravity.js'
import { calcularNivelGuiaGravity } from '../../shared/guia-gravity/niveis-guia-gravity.js'
import { calcularDiasOfensivaGuiaGravity } from '../../shared/guia-gravity/ofensiva-guia-gravity.js'
import { obterXpAula } from '../../shared/guia-gravity/pesos-academy-guia-gravity.js'
import {
  calcularRitmoGuiaGravity,
  calcularXpMaximoCatalogo,
  calcularXpPorProduto,
  calcularXpTotalConclusoes,
} from '../../shared/guia-gravity/progresso-guia-gravity.js'
import type {
  GuiaGravityJornadaResponse,
  GuiaGravityRankingResponse,
} from '../../shared/guia-gravity/guia-gravity-jornada-schema.js'

function inicioDoDia(data: Date): Date {
  const d = new Date(data)
  d.setHours(0, 0, 0, 0)
  return d
}

async function garantirJornada(idOrganizacao: string, idUsuario: string) {
  const existente = await prisma.guiaGravityJornadaUsuario.findUnique({
    where: {
      id_organizacao_id_usuario: {
        id_organizacao: idOrganizacao,
        id_usuario: idUsuario,
      },
    },
  })
  if (existente) return existente

  return prisma.guiaGravityJornadaUsuario.create({
    data: {
      id_organizacao: idOrganizacao,
      id_usuario: idUsuario,
      data_inicio_jornada_guia_gravity: inicioDoDia(new Date()),
    },
  })
}

async function sincronizarCertificadosElegiveis(opts: {
  idOrganizacao: string
  idUsuario: string
  aulasConcluidas: Set<string>
  xpPorProduto: Record<string, number>
  xpTotal: number
  nivel: number
}) {
  const tiposElegiveis = avaliarTiposCertificadoElegiveis(opts.aulasConcluidas)
  if (!tiposElegiveis.length) return

  const existentes = await prisma.guiaGravityCertificadoEmitido.findMany({
    where: {
      id_organizacao: opts.idOrganizacao,
      id_usuario: opts.idUsuario,
    },
    select: { tipo_certificado_guia_gravity: true },
  })
  const tiposExistentes = new Set(existentes.map(c => c.tipo_certificado_guia_gravity))

  for (const tipo of tiposElegiveis) {
    if (tiposExistentes.has(tipo)) continue

    const emitidoEm = new Date()
    let codigo = gerarCodigoVerificacaoGuia(tipo, emitidoEm)
    let tentativas = 0
    while (tentativas < 5) {
      const colisao = await prisma.guiaGravityCertificadoEmitido.findUnique({
        where: { codigo_verificacao_certificado_guia_gravity: codigo },
        select: { id_guia_gravity_certificado_emitido: true },
      })
      if (!colisao) break
      codigo = gerarCodigoVerificacaoGuia(tipo, new Date(emitidoEm.getTime() + tentativas + 1))
      tentativas += 1
    }

    await prisma.guiaGravityCertificadoEmitido.create({
      data: {
        id_organizacao: opts.idOrganizacao,
        id_usuario: opts.idUsuario,
        tipo_certificado_guia_gravity: tipo,
        numero_certificado_guia_gravity: gerarNumeroCertificadoGuia(tipo),
        codigo_verificacao_certificado_guia_gravity: codigo,
        data_emissao_certificado_guia_gravity: emitidoEm,
        xp_modulo_certificado_guia_gravity: Math.round(xpModuloCertificado(tipo, opts.xpPorProduto)),
        nivel_certificado_guia_gravity: opts.nivel,
      },
    })
  }
}

function montarRespostaJornada(opts: {
  jornada: {
    id_guia_gravity_jornada_usuario: string
    data_inicio_jornada_guia_gravity: Date
    dias_ofensiva_guia_gravity: number
    data_ultima_atividade_jornada_guia_gravity: Date | null
  }
  conclusoes: Array<{
    slug_aula_guia_gravity: string
    slug_produto_guia_gravity: string
    xp_conquistado_aula_guia_gravity: Prisma.Decimal
    data_conclusao_aula_guia_gravity: Date
  }>
  certificados: Array<{
    tipo_certificado_guia_gravity: TipoCertificadoGuiaGravity
    numero_certificado_guia_gravity: string
    codigo_verificacao_certificado_guia_gravity: string
    data_emissao_certificado_guia_gravity: Date
    xp_modulo_certificado_guia_gravity: number
    nivel_certificado_guia_gravity: number
  }>
  manuaisLidos: Array<{
    slug_manual_guia_gravity: string
    data_leitura_manual_guia_gravity: Date
  }>
}): GuiaGravityJornadaResponse {
  const xpTotal = calcularXpTotalConclusoes(
    opts.conclusoes.map(c => ({
      slug_aula_guia_gravity: c.slug_aula_guia_gravity,
      xp_conquistado_aula_guia_gravity: Number(c.xp_conquistado_aula_guia_gravity),
    })),
  )
  const { nivel } = calcularNivelGuiaGravity(xpTotal)
  const xpMaximo = calcularXpMaximoCatalogo()
  const ritmo = calcularRitmoGuiaGravity({
    xpTotal,
    xpMaximo,
    dataInicio: opts.jornada.data_inicio_jornada_guia_gravity,
  })

  return {
    jornada: {
      id_guia_gravity_jornada_usuario: opts.jornada.id_guia_gravity_jornada_usuario,
      data_inicio_jornada_guia_gravity: opts.jornada.data_inicio_jornada_guia_gravity.toISOString(),
      dias_ofensiva_guia_gravity: opts.jornada.dias_ofensiva_guia_gravity,
      data_ultima_atividade_jornada_guia_gravity:
        opts.jornada.data_ultima_atividade_jornada_guia_gravity?.toISOString() ?? null,
    },
    aulas_concluidas: opts.conclusoes.map(c => ({
      slug_aula_guia_gravity: c.slug_aula_guia_gravity,
      slug_produto_guia_gravity: c.slug_produto_guia_gravity,
      xp_conquistado_aula_guia_gravity: Number(c.xp_conquistado_aula_guia_gravity),
      data_conclusao_aula_guia_gravity: c.data_conclusao_aula_guia_gravity.toISOString(),
    })),
    certificados: opts.certificados.map(c => ({
      tipo_certificado_guia_gravity: c.tipo_certificado_guia_gravity,
      numero_certificado_guia_gravity: c.numero_certificado_guia_gravity,
      codigo_verificacao_certificado_guia_gravity: c.codigo_verificacao_certificado_guia_gravity,
      data_emissao_certificado_guia_gravity: c.data_emissao_certificado_guia_gravity.toISOString(),
      xp_modulo_certificado_guia_gravity: c.xp_modulo_certificado_guia_gravity,
      nivel_certificado_guia_gravity: c.nivel_certificado_guia_gravity,
    })),
    manuais_lidos: opts.manuaisLidos.map(m => ({
      slug_manual_guia_gravity: m.slug_manual_guia_gravity,
      data_leitura_manual_guia_gravity: m.data_leitura_manual_guia_gravity.toISOString(),
    })),
    manuais_total: TOTAL_MANUAIS_GUIA_GRAVITY,
    xp_total: xpTotal,
    nivel,
    ritmo: {
      delta_dias: ritmo.delta_dias,
      pct_real: ritmo.pct_real,
      pct_ideal: ritmo.pct_ideal,
      dias_decorridos: ritmo.dias_decorridos,
    },
  }
}

async function carregarEstadoCompleto(idOrganizacao: string, idUsuario: string) {
  const jornada = await garantirJornada(idOrganizacao, idUsuario)
  const [conclusoes, certificados, manuaisLidos] = await Promise.all([
    prisma.guiaGravityAulaConclusao.findMany({
      where: { id_organizacao: idOrganizacao, id_usuario: idUsuario },
      orderBy: { data_conclusao_aula_guia_gravity: 'asc' },
    }),
    prisma.guiaGravityCertificadoEmitido.findMany({
      where: { id_organizacao: idOrganizacao, id_usuario: idUsuario },
      orderBy: { data_emissao_certificado_guia_gravity: 'asc' },
    }),
    prisma.guiaGravityManualLido.findMany({
      where: { id_organizacao: idOrganizacao, id_usuario: idUsuario },
      orderBy: { data_leitura_manual_guia_gravity: 'asc' },
    }),
  ])
  return { jornada, conclusoes, certificados, manuaisLidos }
}

async function atualizarOfensivaAposAtividade(opts: {
  idOrganizacao: string
  idUsuario: string
  dataUltimaAtividadeAnterior: Date | null
  diasOfensivaAnterior: number
  agora: Date
}) {
  const diasOfensiva = calcularDiasOfensivaGuiaGravity({
    diasOfensivaAtual: opts.diasOfensivaAnterior,
    dataUltimaAtividade: opts.dataUltimaAtividadeAnterior,
    agora: opts.agora,
  })

  return prisma.guiaGravityJornadaUsuario.update({
    where: {
      id_organizacao_id_usuario: {
        id_organizacao: opts.idOrganizacao,
        id_usuario: opts.idUsuario,
      },
    },
    data: {
      dias_ofensiva_guia_gravity: diasOfensiva,
      data_ultima_atividade_jornada_guia_gravity: opts.agora,
    },
  })
}

export const guiaGravityJornadaServico = {
  async obterJornada(idOrganizacao: string, idUsuario: string): Promise<GuiaGravityJornadaResponse> {
    const { jornada, conclusoes, certificados, manuaisLidos } = await carregarEstadoCompleto(
      idOrganizacao,
      idUsuario,
    )
    return montarRespostaJornada({ jornada, conclusoes, certificados, manuaisLidos })
  },

  async concluirAula(opts: {
    idOrganizacao: string
    idUsuario: string
    slugAula: string
    slugProduto: string
  }): Promise<GuiaGravityJornadaResponse> {
    const xp = obterXpAula(opts.slugProduto, opts.slugAula)
    if (xp <= 0) {
      throw new AppError('Aula não reconhecida no catálogo Guia Gravity', 404, 'AULA_GUIA_NAO_ENCONTRADA')
    }

    const jornadaAntes = await garantirJornada(opts.idOrganizacao, opts.idUsuario)
    const agora = new Date()

    await prisma.guiaGravityAulaConclusao.upsert({
      where: {
        id_organizacao_id_usuario_slug_aula_guia_gravity: {
          id_organizacao: opts.idOrganizacao,
          id_usuario: opts.idUsuario,
          slug_aula_guia_gravity: opts.slugAula,
        },
      },
      create: {
        id_organizacao: opts.idOrganizacao,
        id_usuario: opts.idUsuario,
        slug_aula_guia_gravity: opts.slugAula,
        slug_produto_guia_gravity: opts.slugProduto,
        xp_conquistado_aula_guia_gravity: xp,
        data_conclusao_aula_guia_gravity: agora,
      },
      update: {
        slug_produto_guia_gravity: opts.slugProduto,
      },
    })

    const jornada = await atualizarOfensivaAposAtividade({
      idOrganizacao: opts.idOrganizacao,
      idUsuario: opts.idUsuario,
      dataUltimaAtividadeAnterior: jornadaAntes.data_ultima_atividade_jornada_guia_gravity,
      diasOfensivaAnterior: jornadaAntes.dias_ofensiva_guia_gravity,
      agora,
    })

    const { conclusoes, manuaisLidos } = await carregarEstadoCompleto(opts.idOrganizacao, opts.idUsuario)

    const aulasConcluidas = new Set(conclusoes.map(c => c.slug_aula_guia_gravity))
    const xpTotal = calcularXpTotalConclusoes(
      conclusoes.map(c => ({
        slug_aula_guia_gravity: c.slug_aula_guia_gravity,
        xp_conquistado_aula_guia_gravity: Number(c.xp_conquistado_aula_guia_gravity),
      })),
    )
    const { nivel } = calcularNivelGuiaGravity(xpTotal)
    const xpPorProduto = calcularXpPorProduto(
      conclusoes.map(c => ({
        slug_aula_guia_gravity: c.slug_aula_guia_gravity,
        slug_produto_guia_gravity: c.slug_produto_guia_gravity,
        xp_conquistado_aula_guia_gravity: Number(c.xp_conquistado_aula_guia_gravity),
      })),
    )

    await sincronizarCertificadosElegiveis({
      idOrganizacao: opts.idOrganizacao,
      idUsuario: opts.idUsuario,
      aulasConcluidas,
      xpPorProduto,
      xpTotal,
      nivel,
    })

    const certificadosAtualizados = await prisma.guiaGravityCertificadoEmitido.findMany({
      where: { id_organizacao: opts.idOrganizacao, id_usuario: opts.idUsuario },
      orderBy: { data_emissao_certificado_guia_gravity: 'asc' },
    })

    return montarRespostaJornada({
      jornada,
      conclusoes,
      certificados: certificadosAtualizados,
      manuaisLidos,
    })
  },

  async marcarManualLido(opts: {
    idOrganizacao: string
    idUsuario: string
    slugManual: string
  }): Promise<GuiaGravityJornadaResponse> {
    if (!slugManualGuiaGravityValido(opts.slugManual)) {
      throw new AppError('Manual não reconhecido no catálogo Guia Gravity', 404, 'MANUAL_GUIA_NAO_ENCONTRADO')
    }

    const agora = new Date()
    await prisma.guiaGravityManualLido.upsert({
      where: {
        id_organizacao_id_usuario_slug_manual_guia_gravity: {
          id_organizacao: opts.idOrganizacao,
          id_usuario: opts.idUsuario,
          slug_manual_guia_gravity: opts.slugManual,
        },
      },
      create: {
        id_organizacao: opts.idOrganizacao,
        id_usuario: opts.idUsuario,
        slug_manual_guia_gravity: opts.slugManual,
        data_leitura_manual_guia_gravity: agora,
      },
      update: {},
    })

    return guiaGravityJornadaServico.obterJornada(opts.idOrganizacao, opts.idUsuario)
  },

  async obterRankingOrganizacao(opts: {
    idOrganizacao: string
    idUsuario: string
    limite?: number
  }): Promise<GuiaGravityRankingResponse> {
    const limite = Math.min(50, Math.max(1, opts.limite ?? 10))

    const agregados = await prisma.guiaGravityAulaConclusao.groupBy({
      by: ['id_usuario'],
      where: { id_organizacao: opts.idOrganizacao },
      _sum: { xp_conquistado_aula_guia_gravity: true },
      orderBy: { _sum: { xp_conquistado_aula_guia_gravity: 'desc' } },
      take: limite,
    })

    const idsUsuarios = agregados.map(a => a.id_usuario)
    const usuarios = idsUsuarios.length
      ? await prisma.usuario.findMany({
          where: {
            id_organizacao: opts.idOrganizacao,
            id_usuario: { in: idsUsuarios },
            status_usuario: 'ATIVO',
          },
          select: { id_usuario: true, nome_usuario: true },
        })
      : []

    const nomePorId = new Map(usuarios.map(u => [u.id_usuario, u.nome_usuario]))

    const ranking = agregados.map((linha, idx) => ({
      id_usuario: linha.id_usuario,
      nome_usuario: nomePorId.get(linha.id_usuario) ?? 'Usuário',
      xp_total: Math.round(Number(linha._sum.xp_conquistado_aula_guia_gravity ?? 0)),
      posicao: idx + 1,
      usuario_atual: linha.id_usuario === opts.idUsuario,
    }))

    const usuarioNoRanking = ranking.some(r => r.usuario_atual)
    if (!usuarioNoRanking) {
      const conclusoesUsuario = await prisma.guiaGravityAulaConclusao.findMany({
        where: { id_organizacao: opts.idOrganizacao, id_usuario: opts.idUsuario },
        select: { xp_conquistado_aula_guia_gravity: true },
      })
      const xpUsuario = Math.round(
        conclusoesUsuario.reduce((s, c) => s + Number(c.xp_conquistado_aula_guia_gravity), 0),
      )
      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: opts.idUsuario },
        select: { nome_usuario: true },
      })
      ranking.push({
        id_usuario: opts.idUsuario,
        nome_usuario: usuario?.nome_usuario ?? 'Usuário',
        xp_total: xpUsuario,
        posicao: ranking.length + 1,
        usuario_atual: true,
      })
    }

    return { ranking }
  },

  async verificarCertificado(codigoBruto: string) {
    const codigo = decodeURIComponent(codigoBruto).trim()
    const cert = await prisma.guiaGravityCertificadoEmitido.findUnique({
      where: { codigo_verificacao_certificado_guia_gravity: codigo },
      include: {
        usuario: { select: { nome_usuario: true } },
        organizacao: { select: { nome_organizacao: true } },
      },
    })

    if (!cert) {
      return { valido: false as const, certificado: null }
    }

    return {
      valido: true as const,
      certificado: {
        tipo_certificado_guia_gravity: cert.tipo_certificado_guia_gravity,
        numero_certificado_guia_gravity: cert.numero_certificado_guia_gravity,
        codigo_verificacao_certificado_guia_gravity: cert.codigo_verificacao_certificado_guia_gravity,
        data_emissao_certificado_guia_gravity: cert.data_emissao_certificado_guia_gravity.toISOString(),
        xp_modulo_certificado_guia_gravity: cert.xp_modulo_certificado_guia_gravity,
        nivel_certificado_guia_gravity: cert.nivel_certificado_guia_gravity,
        nome_usuario: cert.usuario.nome_usuario,
        nome_organizacao: cert.organizacao.nome_organizacao,
      },
    }
  },
}
