/**
 * SmartImportModal.tsx — Modal de importacao inteligente de pedidos (4 etapas)
 *
 * Etapas:
 *   1. Upload — drag-and-drop de arquivo
 *   2. Mapeamento — coluna arquivo → campo sistema, com confianca visual
 *   3. Preview — linhas com status ok/aviso/erro, decisoes de duplicata
 *   4. Confirmacao — resultado final
 *
 * Props:
 *   aberto      — controla visibilidade
 *   onFechar    — callback para fechar
 *   onConcluido — callback com IDs criados (para recarregar lista)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@clerk/clerk-react'
import { UploadSimple, X, Spinner } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import { StepperPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import type { PassoConfig } from '@nucleo/modal-passo-passo-global'
import { EtapaUpload }       from './EtapaUpload'
import { EtapaMapeamento }   from './EtapaMapeamento'
import { EtapaPreview }      from './EtapaPreview'
import { EtapaConfirmacao }  from './EtapaConfirmacao'
import { smartImportApi }    from '../../shared/api'
import type {
  ColunaMapeada,
  SmartImportPreview,
  SmartImportLinha,
  SmartImportResultado,
  DecisaoDuplicata,
  SmartImportConfirmar,
} from '../../shared/types'
import './ModalPedidoSmartImport.css'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ModalSmartImportPedidoProps {
  aberto: boolean
  onFechar: () => void
  onConcluido: (idsCriados: string[]) => void
}

// ── Tipos internos ────────────────────────────────────────────────────────────

type Etapa = 'upload' | 'mapeamento' | 'preview' | 'confirmacao'

type TFunc = (key: string, opts?: Record<string, unknown>) => string

/**
 * Estrutura rica de erro — substitui mensagem string por objeto com sugestoes
 * contextuais. Cada `code` mapeia para `titulo` + `mensagem` + `sugestoes`.
 *
 * Mand. 08 — jamais mascara totalmente o detalhe tecnico. O `code` aparece
 * sempre no rodape do alerta para suporte/debug.
 */
export interface ErroDetalhado {
  code: string                 // Para suporte/debug — sempre presente
  titulo: string               // "O que aconteceu" — uma linha
  mensagem: string             // Frase principal explicativa
  causa?: string               // "Por que aconteceu" — contexto opcional
  sugestoes: string[]          // Lista de acoes praticas
  retryable: boolean           // Mostra botao "Tentar novamente"?
  acoes?: Array<{ label: string; tipo: 'baixar_template' | 'recarregar' }>
}

/** Extrai message + code do response body do backend. */
async function lerErroBody(res: Response): Promise<{ message: string; code: string }> {
  const body = await res.json().catch(() => null) as { error?: { message?: string; code?: string } } | null
  return {
    message: body?.error?.message ?? `HTTP ${res.status}`,
    code:    body?.error?.code    ?? `HTTP_${res.status}`,
  }
}

/**
 * Traduz erro do backend (com code) ou erro de cliente (Failed to fetch, etc.)
 * para `ErroDetalhado` com sugestoes contextuais. Cobre todos os codes do backend
 * + erros de rede + HTTP genericos.
 */
function traduzirErroDetalhado(
  err: unknown,
  contexto: 'upload' | 'confirmar',
  t: TFunc,
  codeBackend?: string,
): ErroDetalhado {
  const msg = err instanceof Error ? err.message : String(err ?? '')

  // eslint-disable-next-line no-console
  console.error('[SmartImport] erro capturado (raw):', err, 'msg:', msg, 'code:', codeBackend)

  // ── Erros de rede / browser ─────────────────────────────────────────────
  if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('fetch')) {
    return {
      code: 'NETWORK_ERROR',
      titulo: 'Sem conexao com o servidor',
      mensagem: 'Nao foi possivel chegar no servidor.',
      causa: 'Pode ser internet instavel, servidor fora do ar ou firewall bloqueando.',
      sugestoes: [
        'Verifique sua conexao com a internet',
        'Atualize a pagina (F5) e tente novamente',
        'Se persistir, contate o suporte',
      ],
      retryable: true,
    }
  }

  // ── Codes do backend (mais especificos) ─────────────────────────────────
  switch (codeBackend) {
    case 'ARQUIVO_AUSENTE':
      return {
        code: codeBackend,
        titulo: 'Voce nao selecionou nenhum arquivo',
        mensagem: 'O upload chegou no servidor sem arquivo anexado.',
        sugestoes: [
          'Clique na area "Arraste um arquivo ou clique para selecionar"',
          'Escolha um arquivo .xlsx, .csv, .xml, .txt, .json ou .pdf',
        ],
        retryable: false,
      }

    case 'ARQUIVO_SEM_DADOS':
      return {
        code: codeBackend,
        titulo: 'A planilha esta vazia',
        mensagem: 'O arquivo nao tem nenhuma linha de dados.',
        causa: 'Voce baixou o template e nao preencheu nenhuma linha de dados.',
        sugestoes: [
          'Preencha pelo menos 1 linha de dados (linhas 3+ da planilha)',
          'Linha 1 e o cabecalho de grupo (PEDIDO/ITEM)',
          'Linha 2 e o cabecalho com o nome dos campos',
          'Use o template baixado como referencia',
        ],
        retryable: false,
        acoes: [{ label: 'Baixar template', tipo: 'baixar_template' }],
      }

    case 'FORMATO_NAO_SUPORTADO':
    case 'FORMATO_INVALIDO':
      return {
        code: codeBackend,
        titulo: 'Formato nao aceito',
        mensagem: msg || 'Esse formato de arquivo nao e suportado.',
        sugestoes: [
          'Aceitos: xlsx, xls, csv, xml, txt, json, pdf',
          'Salve seu arquivo em formato Excel (.xlsx) — File > Save As',
          'Para CSV, use UTF-8 e separador , ou ;',
        ],
        retryable: false,
      }

    case 'JSON_FORMATO_INVALIDO':
      return {
        code: codeBackend,
        titulo: 'JSON com formato esperado',
        mensagem: 'O arquivo JSON nao tem o formato que o sistema entende.',
        causa: 'O sistema espera um array de objetos: [{...}, {...}].',
        sugestoes: [
          'Verifique se o JSON e um array (comeca com [ e termina com ])',
          'Cada item do array deve ser um objeto com os campos do pedido',
          'Se possivel, prefira Excel (.xlsx) — e mais facil de editar',
        ],
        retryable: false,
      }

    case 'JSON_MALFORMADO':
      return {
        code: codeBackend,
        titulo: 'JSON malformado',
        mensagem: msg || 'O arquivo JSON tem erro de sintaxe.',
        causa: 'JSON invalido — virgula sobrando, chave nao fechada, aspas erradas, etc.',
        sugestoes: [
          'Cole o conteudo em https://jsonlint.com para identificar a linha do erro',
          'Verifique se todas as chaves abrem ({) e fecham (})',
          'Verifique se nao ha virgula apos o ultimo item',
          'Strings devem usar aspas duplas, nao simples',
        ],
        retryable: false,
      }

    case 'JSON_VAZIO':
      return {
        code: codeBackend,
        titulo: 'JSON sem dados',
        mensagem: 'O arquivo JSON e valido mas nao contem nenhum registro.',
        causa: 'Array vazio: [] — nao ha nada para importar.',
        sugestoes: [
          'Verifique a fonte que gerou o JSON',
          'Confirme se o filtro/query trouxe linhas',
          'Para template, prefira Excel (.xlsx)',
        ],
        retryable: false,
      }

    case 'PDF_PROTEGIDO':
      return {
        code: codeBackend,
        titulo: 'PDF protegido por senha',
        mensagem: 'O PDF tem protecao de senha e nao pode ser lido automaticamente.',
        sugestoes: [
          'Abra o PDF, va em Arquivo > Imprimir > Salvar como PDF (sem protecao)',
          'Ou use ferramentas como SmallPDF/iLovePDF para remover a senha',
          'Apos remover a protecao, faca o upload novamente',
        ],
        retryable: false,
      }

    case 'PDF_ESCANEADO':
      return {
        code: codeBackend,
        titulo: 'PDF escaneado (sem texto)',
        mensagem: 'O PDF parece ser escaneado — contem so imagens, sem texto extraivel.',
        causa: 'Documentos escaneados precisam passar por OCR (reconhecimento otico) antes.',
        sugestoes: [
          'Use Adobe Acrobat > Reconhecer texto (OCR) e salve novamente',
          'Ou ferramentas online: SmallPDF OCR, ilovepdf.com/ocr',
          'Apos OCR, exporte para Excel (.xlsx) — mais confiavel',
        ],
        retryable: false,
      }

    case 'PDF_INVALIDO':
      return {
        code: codeBackend,
        titulo: 'PDF nao e valido',
        mensagem: msg || 'O arquivo enviado nao e um PDF de verdade.',
        causa: 'Arquivos salvos como "pagina web" (.html) nao funcionam mesmo com extensao .pdf.',
        sugestoes: [
          'Abra no navegador e salve como PDF de verdade (Ctrl+P > Salvar como PDF)',
          'Ou prefira Excel (.xlsx) — extracao e mais confiavel',
          'PDFs escaneados (imagem) nao sao suportados — precisa OCR',
        ],
        retryable: false,
      }

    case 'RATE_LIMIT_EXCEEDED':
      return {
        code: codeBackend,
        titulo: 'Muitos uploads em pouco tempo',
        mensagem: 'O limite de uploads por minuto foi atingido.',
        sugestoes: [
          'Aguarde 60 segundos antes de fazer outro upload',
          'Limite: 10 uploads por minuto',
        ],
        retryable: true,
      }

    case 'UNAUTHORIZED_PREVIEW':
      return {
        code: codeBackend,
        titulo: 'Sessao expirou',
        mensagem: 'Os dados do preview nao pertencem mais a sua sessao.',
        sugestoes: [
          'Recarregue a pagina (Ctrl+Shift+R)',
          'Faca o upload do arquivo novamente',
        ],
        retryable: false,
        acoes: [{ label: 'Recarregar pagina', tipo: 'recarregar' }],
      }
  }

  // ── HTTP genericos (sem code do backend) ────────────────────────────────
  if (/^HTTP_5\d\d|^HTTP 5\d\d/.test(codeBackend ?? msg)) {
    return {
      code: codeBackend ?? 'HTTP_500',
      titulo: 'Erro no servidor',
      mensagem: 'O servidor falhou ao processar a requisicao.',
      sugestoes: [
        'Tente novamente em 30 segundos',
        'Se persistir, abra um chamado com o codigo abaixo',
      ],
      retryable: true,
    }
  }

  if (codeBackend === 'HTTP_413' || msg === 'HTTP 413') {
    return {
      code: 'HTTP_413',
      titulo: 'Arquivo muito grande',
      mensagem: 'O arquivo excede o limite de 10 MB.',
      sugestoes: [
        'Tamanho maximo: 10 MB',
        'Divida em varios arquivos menores',
        'Ou compacte (xlsx ja e compactado)',
      ],
      retryable: false,
    }
  }

  if (codeBackend === 'HTTP_401' || msg === 'HTTP 401' ||
      codeBackend === 'UNAUTHENTICATED' || msg.includes('Authorization')) {
    return {
      code: 'HTTP_401',
      titulo: 'Sessao expirou',
      mensagem: 'Voce precisa estar logado para importar pedidos.',
      sugestoes: [
        'Recarregue a pagina (Ctrl+Shift+R)',
        'Se persistir, faca login novamente',
      ],
      retryable: false,
      acoes: [{ label: 'Recarregar pagina', tipo: 'recarregar' }],
    }
  }

  if (codeBackend === 'HTTP_403' || msg === 'HTTP 403') {
    return {
      code: 'HTTP_403',
      titulo: 'Sem permissao',
      mensagem: 'Voce nao tem permissao para importar pedidos.',
      sugestoes: [
        'Solicite ao Master da sua organizacao a permissao "pedido:lista:editar"',
      ],
      retryable: false,
    }
  }

  // ── Fallback: erro com mensagem do backend mas sem code conhecido ──────
  if (msg && msg.length > 0 && !msg.startsWith('HTTP ')) {
    return {
      code: codeBackend ?? 'ERRO_DESCONHECIDO',
      titulo: contexto === 'upload' ? 'Nao foi possivel processar o arquivo' : 'Nao foi possivel concluir',
      mensagem: msg,
      sugestoes: [
        'Verifique se o arquivo segue o template baixavel',
        'Tente novamente — se persistir, abra chamado com o codigo abaixo',
      ],
      retryable: true,
    }
  }

  // ── Fallback final ──────────────────────────────────────────────────────
  return {
    code: codeBackend ?? 'ERRO_DESCONHECIDO',
    titulo: contexto === 'upload' ? 'Erro no upload' : 'Erro na confirmacao',
    mensagem: msg || (contexto === 'upload'
      ? t('pedido.smart_import.err_upload_gen')
      : t('pedido.smart_import.err_confirmar_gen')),
    sugestoes: [
      'Tente novamente',
      'Se persistir, abra um chamado com o codigo abaixo',
    ],
    retryable: true,
  }
}

/**
 * @deprecated Use traduzirErroDetalhado. Mantido como wrapper para compatibilidade
 * com chamadas legadas (etapa confirmar) que ainda esperam string.
 */
function traduzirErro(err: unknown, contexto: 'upload' | 'confirmar' = 'upload', t: TFunc): string {
  const detalhado = traduzirErroDetalhado(err, contexto, t)
  return detalhado.mensagem
}

const ORDEM_ETAPAS: Etapa[] = ['upload', 'mapeamento', 'preview', 'confirmacao']

// ── PASSOS_IMPORT — definido dentro do componente via useMemo([t]) ─────────────

function etapaParaId(e: Etapa): number {
  return ORDEM_ETAPAS.indexOf(e) + 1
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ModalSmartImportPedido({ aberto, onFechar, onConcluido }: ModalSmartImportPedidoProps) {
  const { t } = useTranslation()
  const { addNotification } = useShellStore()
  const { getToken } = useAuth()

  const PASSOS_IMPORT = useMemo<PassoConfig[]>(() => [
    { id: 1, label: t('pedido.smart_import.passo_upload') },
    { id: 2, label: t('pedido.smart_import.passo_mapeamento') },
    { id: 3, label: t('pedido.smart_import.passo_preview') },
    { id: 4, label: t('pedido.smart_import.passo_resultado') },
  ], [t])
  const [etapa, setEtapa]             = useState<Etapa>('upload')
  const [analisando, setAnalisando]   = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  // Erro rico — substitui string simples por estrutura ErroDetalhado com sugestoes contextuais.
  const [erro, setErro]               = useState<ErroDetalhado | null>(null)

  // Dados do fluxo
  const [preview, setPreview]                   = useState<SmartImportPreview | null>(null)
  const [mapeamento, setMapeamento]             = useState<ColunaMapeada[]>([])
  const [lembrarMapeamento, setLembrarMapeamento] = useState(true)
  const [linhasSelecionadas, setLinhasSelecionadas] = useState<Set<number>>(new Set())
  const [decisoesDuplicatas, setDecisoesDuplicatas] = useState<Record<string, DecisaoDuplicata>>({})
  const [numerosEditados, setNumerosEditados]     = useState<Record<number, string>>({})
  const [resultado, setResultado]               = useState<SmartImportResultado | null>(null)

  // Multi-sheet
  const [planilhas, setPlanilhas]                     = useState<string[]>([])
  const [planilhaSelecionada, setPlanilhaSelecionada] = useState<string | undefined>()
  const [arquivoAtual, setArquivoAtual]               = useState<File | null>(null)

  const [msgProgresso, setMsgProgresso] = React.useState(() => t('pedido.smart_import.analisando'))

  React.useEffect(() => {
    if (!analisando) return
    const isPdf = arquivoAtual?.name.toLowerCase().endsWith('.pdf') ?? false
    const msgs = isPdf
      ? [
          t('pedido.smart_import.prog_pdf_1'),
          t('pedido.smart_import.prog_pdf_2'),
          t('pedido.smart_import.prog_pdf_3'),
          t('pedido.smart_import.prog_pdf_4'),
          t('pedido.smart_import.prog_pdf_5'),
          t('pedido.smart_import.prog_pdf_6'),
        ]
      : [
          t('pedido.smart_import.prog_xlsx_1'),
          t('pedido.smart_import.prog_xlsx_2'),
          t('pedido.smart_import.prog_xlsx_3'),
          t('pedido.smart_import.prog_xlsx_4'),
        ]
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % msgs.length
      setMsgProgresso(msgs[idx])
    }, isPdf ? 4000 : 1800)
    return () => clearInterval(interval)
  }, [analisando, arquivoAtual, t])

  // Resetar ao fechar
  useEffect(() => {
    if (!aberto) {
      setTimeout(() => {
        setEtapa('upload')
        setAnalisando(false)
        setConfirmando(false)
        setErro(null)
        setPreview(null)
        setMapeamento([])
        setLinhasSelecionadas(new Set())
        setDecisoesDuplicatas({})
        setNumerosEditados({})
        setResultado(null)
        setPlanilhas([])
        setPlanilhaSelecionada(undefined)
        setArquivoAtual(null)
        setMsgProgresso(t('pedido.smart_import.analisando'))
      }, 300)
    }
  }, [aberto])

  // Fechar com Escape
  useEffect(() => {
    if (!aberto) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [aberto, onFechar])

  // Etapa 1: arquivo selecionado → chamar API
  const handleArquivoSelecionado = useCallback(async (arquivo: File, nomePlanilha?: string) => {
    setArquivoAtual(arquivo)
    setAnalisando(true)
    setErro(null)

    try {
      const formData = new FormData()
      formData.append('arquivo', arquivo)
      const url = nomePlanilha
        ? `/api/v1/pedidos/importacoes-inteligentes/analisar?sheet=${encodeURIComponent(nomePlanilha)}`
        : '/api/v1/pedidos/importacoes-inteligentes/analisar'

      const idOrganizacao =
        sessionStorage.getItem('gravity_id_organizacao') ||
        import.meta.env.VITE_DEV_ID_ORGANIZACAO ||
        ''
      // P17 — Portao 3 (security 12/05/2026 sessao paralela) exige x-id-workspace
      // em rotas do produto Pedido. Header vem do sessionStorage definido pelo
      // Shell em SelecionarWorkspace.tsx (chave gravity_company_id por convencao).
      const idWorkspace = sessionStorage.getItem('gravity_company_id') || ''
      const token = await getToken()
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'x-id-organizacao':       idOrganizacao,
          ...(idWorkspace ? { 'x-id-workspace': idWorkspace } : {}),
          'x-chave-interna-servico': import.meta.env.VITE_INTERNAL_SERVICE_KEY || '',
        },
      })
      if (!res.ok) {
        const { message, code } = await lerErroBody(res)
        // Lanca erro com code anexado para o catch traduzir corretamente.
        const errToThrow = new Error(message) as Error & { codeBackend: string }
        errToThrow.codeBackend = code
        throw errToThrow
      }
      const dados = await res.json() as Record<string, unknown>

      // Multiplas planilhas — mostrar seletor
      if (dados.multiplas_planilhas) {
        setPlanilhas((dados.planilhas as string[]) ?? [])
        return
      }

      // Preview normal
      const previewDados = dados as unknown as SmartImportPreview
      setPreview(previewDados)
      setMapeamento(previewDados.mapeamento)

      // Pre-selecionar linhas validas
      const validas = new Set(
        previewDados.linhas
          .filter((l: { status: string }) => l.status === 'ok')
          .map((l: { linha_arquivo: number }) => l.linha_arquivo)
      )
      setLinhasSelecionadas(validas)

      // Pre-preencher decisoes de duplicata com 'pular'
      const decisoes: Record<string, DecisaoDuplicata> = {}
      previewDados.linhas.forEach((l: { numero_pedido: string | null; alertas: { tipo: string }[] }) => {
        if (l.numero_pedido && l.alertas.some((a: { tipo: string }) => a.tipo === 'duplicado_sistema')) {
          decisoes[l.numero_pedido] = 'pular'
        }
      })
      setDecisoesDuplicatas(decisoes)

      setEtapa('mapeamento')
    } catch (err: unknown) {
      const codeBackend = (err as { codeBackend?: string })?.codeBackend
      setErro(traduzirErroDetalhado(err, 'upload', t, codeBackend))
    } finally {
      setAnalisando(false)
    }
  }, [])

  // P2.4 — Conflitos calculados sobre o mapeamento atual (reflete edicoes do usuario)
  const conflitosAtuais = (() => {
    const grupos = new Map<string, string[]>()
    for (const col of mapeamento) {
      if (!col.campo_sistema) continue
      if (col.nivel === 'ignorado') continue
      const arr = grupos.get(col.campo_sistema) ?? []
      arr.push(col.coluna_arquivo)
      grupos.set(col.campo_sistema, arr)
    }
    return Array.from(grupos.entries())
      .filter(([, cols]) => cols.length >= 2)
      .map(([campo_sistema, colunas_arquivo]) => ({ campo_sistema, colunas_arquivo }))
  })()

  // Avancar do mapeamento para preview
  function handleAvancarParaPreview() {
    // P2.4 — Bloqueia avanco se ha conflitos (banner vermelho fixo no topo
    // ja explica o problema; botao "Continuar" tambem fica disabled).
    if (conflitosAtuais.length > 0) return
    setEtapa('preview')
  }

  // Confirmar importacao
  const handleConfirmar = useCallback(async () => {
    if (!preview) return
    setConfirmando(true)
    setErro(null)

    const payload: SmartImportConfirmar = {
      preview_id: preview.preview_id,
      mapeamento_confirmado: mapeamento,
      decisoes_duplicatas: decisoesDuplicatas,
      linhas_incluidas: Array.from(linhasSelecionadas),
      salvar_mapeamento: lembrarMapeamento,
      numeros_editados: Object.keys(numerosEditados).length > 0 ? numerosEditados : undefined,
      linhas: preview.linhas,
    }

    try {
      const dados = await smartImportApi.confirmar(payload)
      setResultado(dados)
      setEtapa('confirmacao')
      addNotification({ type: 'success', message: `${dados.ids_criados?.length ?? 0} PO(s) importadas via SmartImport.`, duration: 4000 })
    } catch (err: unknown) {
      const codeBackend = (err as { codeBackend?: string })?.codeBackend
      const detalhado = traduzirErroDetalhado(err, 'confirmar', t, codeBackend)
      setErro(detalhado)
      addNotification({ type: 'error', message: `Falha na importação: ${detalhado.mensagem}`, duration: 4000 })
    } finally {
      setConfirmando(false)
    }
  }, [preview, mapeamento, decisoesDuplicatas, linhasSelecionadas, lembrarMapeamento, numerosEditados, addNotification])

  function handleDecisaoDuplicata(numeroPedido: string, decisao: DecisaoDuplicata) {
    setDecisoesDuplicatas(prev => ({ ...prev, [numeroPedido]: decisao }))
  }

  function handleNumeroEditado(linhaArquivo: number, numero: string) {
    setNumerosEditados(prev => ({ ...prev, [linhaArquivo]: numero }))
  }

  // P18.2 — Edita o valor exemplo da coluna do arquivo (1a linha) na etapa Mapeamento.
  //
  // 2 efeitos simultaneos:
  //   (a) Atualiza `mapeamento[i].valor_exemplo_coluna_pedido` — afeta o que aparece
  //       na celula "Valor Extraido" do mapeamento.
  //   (b) Atualiza `preview.dados_brutos[0].valores[col.coluna_arquivo]` E
  //       `preview.linhas[0].dados[col.campo_sistema]` — afeta o valor real que
  //       sera gravado quando o usuario confirmar (payload.linhas no /confirmar).
  //
  // Para edicao por linha (qualquer outra linha alem da 1a), o usuario usa o
  // Preview (P15.2 — onEditarCampoLinha).
  function handleValorExemploEditado(indexColuna: number, novoValor: string) {
    setMapeamento(prev => {
      const novo = [...prev]
      if (novo[indexColuna]) {
        novo[indexColuna] = { ...novo[indexColuna], valor_exemplo_coluna_pedido: novoValor }
      }
      return novo
    })
    setPreview(prev => {
      if (!prev) return prev
      const colArquivo = mapeamento[indexColuna]?.coluna_arquivo
      const campoSis   = mapeamento[indexColuna]?.campo_sistema
      if (!colArquivo) return prev
      // (b1) Atualiza dados_brutos[0] (visualizacao do documento)
      const dadosBrutosAtualizados = prev.dados_brutos
        ? prev.dados_brutos.map((row, i) =>
            i === 0 ? { ...row, valores: { ...row.valores, [colArquivo]: novoValor } } : row
          )
        : prev.dados_brutos
      // (b2) Atualiza linhas[0].dados[campo_sistema] (valor real para o /confirmar)
      const linhasAtualizadas = prev.linhas.map((l, i) => {
        if (i !== 0) return l
        if (!campoSis) return l
        return { ...l, dados: { ...l.dados, [campoSis]: novoValor } }
      })
      return { ...prev, dados_brutos: dadosBrutosAtualizados, linhas: linhasAtualizadas }
    })
  }

  // P15.1 — Adiciona uma nova SmartImportLinha (tipo ITEM) ao preview
  function handleAdicionarItemInline(linhaPedido: SmartImportLinha, dadosItem: Record<string, unknown>) {
    setPreview(prev => {
      if (!prev) return prev
      // Calcula proximo linha_arquivo (max + 1) para nao colidir com linhas reais
      const maxLinhaArquivo = prev.linhas.reduce((acc, l) => Math.max(acc, l.linha_arquivo), 0)
      const novaLinha: SmartImportLinha = {
        linha_arquivo: maxLinhaArquivo + 1,
        numero_pedido: linhaPedido.numero_pedido,
        status: 'ok',
        alertas: [],
        dados: dadosItem,
      }
      // Remove o alerta "sem ITEM associado" da linha PEDIDO afetada
      const linhasAtualizadas = prev.linhas.map(l => {
        if (l.linha_arquivo !== linhaPedido.linha_arquivo) return l
        const alertasSemFaltando = l.alertas.filter(a =>
          !(a.campo === 'tipo_linha' && /sem ITEM associado|nao tem nenhum ITEM/i.test(a.mensagem))
        )
        const novoStatus: SmartImportLinha['status'] =
          alertasSemFaltando.some(a => a.nivel === 'erro')  ? 'erro'  :
          alertasSemFaltando.some(a => a.nivel === 'aviso') ? 'aviso' :
          'ok'
        return { ...l, alertas: alertasSemFaltando, status: novoStatus }
      })
      return {
        ...prev,
        linhas: [...linhasAtualizadas, novaLinha],
        total_linhas: prev.total_linhas + 1,
        total_itens:  prev.total_itens + 1,
      }
    })
    // Auto-seleciona a nova linha
    setLinhasSelecionadas(prev => {
      const next = new Set(prev)
      // O linha_arquivo da nova sera o ultimo apos o set acima
      const proxLinha = (preview?.linhas.reduce((acc, l) => Math.max(acc, l.linha_arquivo), 0) ?? 0) + 1
      next.add(proxLinha)
      return next
    })
  }

  // P15.2 — Atualiza valor de um campo em linha existente do preview
  function handleEditarCampoLinha(linhaArquivo: number, campo: string, novoValor: string) {
    setPreview(prev => {
      if (!prev) return prev
      const linhasAtualizadas = prev.linhas.map(l => {
        if (l.linha_arquivo !== linhaArquivo) return l
        return { ...l, dados: { ...l.dados, [campo]: novoValor } }
      })
      return { ...prev, linhas: linhasAtualizadas }
    })
  }

  function handleVerPedidos() {
    onConcluido(resultado?.ids_criados ?? [])
  }

  // Tipo auxiliar para preview com campos opcionais da Onda 2
  const previewExt = preview as (SmartImportPreview & { limite_excedido?: boolean }) | null

  if (!aberto) return null

  return (
    <div
      className="smart-import__overlay"
      onClick={e => { if (e.target === e.currentTarget) onFechar() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-import-titulo"
    >
      <div className="smart-import__container">
        {/* Header */}
        <div className="smart-import__header">
          <h2 id="smart-import-titulo" className="smart-import__titulo">
            <UploadSimple size={18} weight="duotone" aria-hidden="true" />
            {t('pedido.smart_import.titulo')}
          </h2>
          <button
            className="smart-import__fechar"
            onClick={onFechar}
            aria-label={t('pedido.smart_import.aria_fechar')}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper */}
        <div style={{ padding: '0.5rem 1.25rem', borderBottom: '1px solid var(--border-subtle, #2d2d3d)', flexShrink: 0 }}>
          <StepperPassoPassoGlobal
            passos={PASSOS_IMPORT}
            passoAtual={etapaParaId(etapa)}
          />
        </div>

        {/* Contexto do arquivo — total_pedidos / total_itens / total_linhas */}
        {preview && (etapa === 'mapeamento' || etapa === 'preview') && (
          <div className="smart-import__contexto-arquivo">
            <span>{t('pedido.smart_import.contexto_arquivo', { pedidos: preview.total_pedidos, itens: preview.total_itens, linhas: preview.total_linhas })}</span>
            {preview.extrator_usado && (
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: '0.75rem', opacity: 0.7 }}>
                {preview.extrator_usado === 'gemini' ? t('pedido.smart_import.extrator_gemini') : t('pedido.smart_import.extrator_parser', { nome: preview.extrator_usado })}
              </span>
            )}
          </div>
        )}

        {/* Aviso de confiança global baixa */}
        {preview && etapa === 'mapeamento' && preview.confianca_global < 60 && (
          <div className="smart-import__aviso-confianca">
            {t('pedido.smart_import.aviso_confianca', { pct: preview.confianca_global })}
          </div>
        )}

        {/* P2.4 — Aviso de conflitos de mapeamento (2+ colunas -> mesmo campo) */}
        {etapa === 'mapeamento' && conflitosAtuais.length > 0 && (
          <div style={{
            padding: '0.625rem 1.25rem',
            background: 'rgba(239,68,68,0.08)',
            borderBottom: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444',
            fontSize: '0.75rem',
            fontWeight: 500,
            flexShrink: 0,
          }}>
            <strong>⚠️ Conflito de mapeamento:</strong>{' '}
            {conflitosAtuais.map((c) => (
              `"${c.colunas_arquivo.join('", "')}" apontam para "${c.campo_sistema}"`
            )).join(' · ')}
            . Escolha apenas 1 coluna por campo (marque as outras como "Ignorar").
          </div>
        )}

        {/* Aviso de limite de linhas excedido */}
        {previewExt && previewExt.limite_excedido && (
          <div style={{
            padding: '0.5rem 1.25rem',
            background: 'rgba(245,158,11,0.08)',
            borderBottom: '1px solid rgba(245,158,11,0.2)',
            color: '#f59e0b',
            fontSize: '0.75rem',
            fontWeight: 500,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            {t('pedido.smart_import.aviso_limite', { total: previewExt.total_linhas })}
          </div>
        )}

        {/* Corpo */}
        <div className="smart-import__corpo">
          {/* Analisando overlay */}
          {analisando && (
            <div className="smart-import__analisando" aria-live="polite" aria-busy="true">
              <Spinner size={32} className="smart-import__spinner" aria-hidden="true" />
              <span>{msgProgresso}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {arquivoAtual?.name.toLowerCase().endsWith('.pdf')
                  ? t('pedido.smart_import.pdf_aguarde')
                  : t('pedido.smart_import.xlsx_aguarde')}
              </span>
            </div>
          )}

          {!analisando && etapa === 'upload' && (
            <EtapaUpload
              onArquivoSelecionado={handleArquivoSelecionado}
              carregando={analisando}
              erro={erro}
              planilhas={planilhas}
              planilhaSelecionada={planilhaSelecionada}
              onBaixarTemplate={() => {
                window.open('/api/v1/pedidos/importacoes-inteligentes/template', '_blank')
              }}
              onPlanilhaSelecionada={(nome) => {
                setPlanilhaSelecionada(nome)
                setPlanilhas([])
                if (arquivoAtual) {
                  handleArquivoSelecionado(arquivoAtual, nome)
                }
              }}
            />
          )}

          {!analisando && etapa === 'mapeamento' && preview && (
            <EtapaMapeamento
              mapeamento={mapeamento}
              memoriaAplicada={preview.memoria_aplicada}
              lembrarMapeamento={lembrarMapeamento}
              dadosBrutos={preview.dados_brutos}
              onMapeamentoChange={setMapeamento}
              onLembrarChange={setLembrarMapeamento}
              onValorExemploEditado={handleValorExemploEditado}
              onVoltar={() => setEtapa('upload')}
              onResetarMapeamento={() => {
                // Recriar mapeamento sem memória — manter colunas mas limpar campo_sistema
                setMapeamento(prev => prev.map(m => ({ ...m, campo_sistema: null, confianca: 0, nivel: 'ignorado' as const, inferido_por: 'usuario' as const })))
              }}
            />
          )}

          {!analisando && etapa === 'preview' && preview && (
            <EtapaPreview
              linhas={preview.linhas}
              linhasSelecionadas={linhasSelecionadas}
              decisoesDuplicatas={decisoesDuplicatas}
              numerosEditados={numerosEditados}
              onSelecaoChange={setLinhasSelecionadas}
              onDecisaoDuplicata={handleDecisaoDuplicata}
              onNumeroEditado={handleNumeroEditado}
              onAdicionarItemInline={handleAdicionarItemInline}
              onEditarCampoLinha={handleEditarCampoLinha}
            />
          )}

          {etapa === 'confirmacao' && resultado && (
            <EtapaConfirmacao
              resultado={resultado}
              onVerPedidos={handleVerPedidos}
              onFechar={onFechar}
            />
          )}

          {/* Erro geral (nao na etapa de upload que tem seu proprio) */}
          {erro && etapa !== 'upload' && (
            <div className="smart-import__erro" role="alert">
              {erro}
            </div>
          )}
        </div>

        {/* Footer */}
        {etapa !== 'confirmacao' && (
          <div className="smart-import__footer">
            <BotaoGlobal
              variante="secundario"
              tamanho="medio"
              onClick={onFechar}
              disabled={analisando || confirmando}
            >
              {t('pedido.smart_import.cancelar')}
            </BotaoGlobal>
            <div className="smart-import__footer-acoes">
              {etapa === 'preview' && (
                <BotaoGlobal
                  variante="secundario"
                  tamanho="medio"
                  onClick={() => {
                    setEtapa('mapeamento')
                    document.querySelector('.smart-import__corpo')?.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={confirmando}
                >
                  {t('pedido.smart_import.voltar')}
                </BotaoGlobal>
              )}
              {etapa === 'mapeamento' && (
                <BotaoGlobal
                  variante="primario"
                  tamanho="medio"
                  onClick={handleAvancarParaPreview}
                  disabled={analisando || conflitosAtuais.length > 0}
                  title={conflitosAtuais.length > 0 ? 'Resolva os conflitos de mapeamento antes de continuar' : undefined}
                >
                  {t('pedido.smart_import.continuar')}
                </BotaoGlobal>
              )}
              {etapa === 'preview' && preview && (
                <BotaoGlobal
                  variante="primario"
                  tamanho="medio"
                  onClick={handleConfirmar}
                  disabled={confirmando || linhasSelecionadas.size === 0}
                  aria-busy={confirmando}
                >
                  {confirmando
                    ? t('pedido.smart_import.importando')
                    : linhasSelecionadas.size === preview.linhas.length
                      ? t('pedido.smart_import.importar_tudo')
                      : t('pedido.smart_import.importar_n', { count: linhasSelecionadas.size })}
                </BotaoGlobal>
              )}
            </div>
            {etapa === 'preview' && (
              <p style={{ width: '100%', margin: '0.5rem 0 0 0', fontSize: '0.6875rem', color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1/-1' }}>
                {t('pedido.smart_import.rascunho_hint')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
