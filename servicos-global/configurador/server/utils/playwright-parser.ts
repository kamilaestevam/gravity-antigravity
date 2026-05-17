// server/utils/playwright-parser.ts
// Utilitário para parsear o JSON output do Playwright (`--reporter=json`)
// e converter em entradas de log compatíveis com o schema de test-logs

/**
 * Análise estruturada de uma falha de teste.
 * É o que o frontend renderiza no bloco "Análise Especialista IA"
 * (renderExpandido do LogTestes.tsx). Preenchida heuristicamente a partir
 * da mensagem/stack do Playwright; no futuro pode ser sobrescrita por
 * uma chamada real ao Gabi AI.
 */
export interface AiAnalysis {
  erroResumo:       string
  motivo:           string
  sugestaoCorrecao: string
  arquivo:          string
  codigoDiff?:      { old: string; new: string }
  provaVisual?:     string
}

export interface TestLogEntry {
  type:      string
  module:    string
  test_name: string
  result:    'APROVADO' | 'REPROVADO' | 'ERRO'
  duration:  string
  error_log:   string | null
  ai_analysis: AiAnalysis | null
}

// Mapa de status Playwright → resultado Gravity
const PW_STATUS_MAP: Record<string, 'APROVADO' | 'REPROVADO' | 'ERRO'> = {
  passed:   'APROVADO',
  failed:   'REPROVADO',
  timedOut: 'ERRO',
  skipped:  'REPROVADO',
  interrupted: 'ERRO',
}

export interface PwSpec {
  title:  string
  ok:     boolean
  file?:  string
  tests?: Array<{
    projectName?: string
    annotations?: Array<{ type: string }>
    expectedStatus?: string
    results?: Array<{
      status:   string
      duration: number
      error?:   { message?: string; stack?: string }
      errors?:  Array<{ message?: string; stack?: string }>
    }>
  }>
}

export interface PwSuite {
  title?:  string
  file?:   string
  specs?:  PwSpec[]
  suites?: PwSuite[]
}

// ─── Heurísticas de análise da falha ────────────────────────────────────────

interface ErrorFacts {
  kind:         'not_visible' | 'not_found' | 'timeout' | 'assertion' | 'selector' | 'network' | 'unknown'
  locator?:     string
  roleName?:    string
  expectedText?: string
  fileHint?:    string
  lineHint?:    string
  headline:     string
}

/**
 * Extrai fatos estruturados de uma mensagem de erro bruta do Playwright.
 * O objetivo é capturar o suficiente para gerar um bloco de análise útil —
 * sem pretender ser um LLM.
 */
function parseErrorFacts(errMsg: string, specFile: string | undefined): ErrorFacts {
  const text = errMsg || ''
  const firstLine = text.split('\n').find(Boolean) ?? text

  // Arquivo/linha — "at xxx.spec.ts:42"
  const fileLineMatch = text.match(/([\w./\\-]+\.(?:spec|test)\.[tj]sx?)(?::(\d+))?/)
  const fileHint = fileLineMatch?.[1] ?? specFile
  const lineHint = fileLineMatch?.[2]

  // getByRole('button', { name: 'X' })
  const roleMatch = text.match(/getByRole\(\s*['"]([\w-]+)['"]\s*,\s*\{\s*name:\s*['"]([^'"]+)['"]/)
  // getByTestId('...')
  const testIdMatch = text.match(/getByTestId\(\s*['"]([^'"]+)['"]\s*\)/)
  // locator('...')
  const locatorMatch = text.match(/locator\(\s*['"]([^'"]+)['"]\s*\)/)

  const locator = roleMatch
    ? `getByRole('${roleMatch[1]}', { name: '${roleMatch[2]}' })`
    : testIdMatch
      ? `getByTestId('${testIdMatch[1]}')`
      : locatorMatch?.[1]

  const roleName = roleMatch?.[2]

  let kind: ErrorFacts['kind'] = 'unknown'
  let headline = firstLine.slice(0, 160)

  if (/expected element to be visible/i.test(text) || /element is not visible/i.test(text)) {
    kind = 'not_visible'
    headline = roleName
      ? `Elemento "${roleName}" não está visível`
      : 'Elemento esperado não ficou visível a tempo'
  } else if (/not found in DOM|element\(s\) not found|failed to find element/i.test(text)) {
    kind = 'not_found'
    headline = roleName
      ? `Elemento "${roleName}" não foi encontrado`
      : 'Elemento esperado não existe na página'
  } else if (/TimeoutError|waiting for locator|Test timeout.*exceeded/i.test(text)) {
    kind = 'timeout'
    headline = 'Timeout aguardando condição esperada'
  } else if (/AssertionError|toBe|toEqual|toHaveText|toContain/i.test(text)) {
    kind = 'assertion'
    headline = firstLine.replace(/^.*?AssertionError:\s*/, '').slice(0, 160) || 'Asserção falhou'
  } else if (/net::|ECONNREFUSED|fetch failed|5\d\d|4\d\d/i.test(text)) {
    kind = 'network'
    headline = 'Falha de rede ou resposta não esperada da API'
  } else if (locator) {
    kind = 'selector'
    headline = `Seletor não casou com nenhum elemento: ${locator}`
  }

  return { kind, locator, roleName, fileHint, lineHint, headline }
}

/**
 * Produz o bloco de análise (O QUE É, MOTIVO, ONDE, CORREÇÃO SUGERIDA)
 * a partir dos fatos extraídos. Heurístico, mas consistente — o frontend
 * renderiza exatamente estes campos.
 */
export function generateAiAnalysis(errMsg: string | null, specFile?: string): AiAnalysis | null {
  if (!errMsg) return null

  const facts = parseErrorFacts(errMsg, specFile)

  const arquivo = facts.fileHint
    ? facts.lineHint ? `${facts.fileHint}:${facts.lineHint}` : facts.fileHint
    : (specFile ?? 'arquivo desconhecido')

  // Monta motivo, sugestão e diff por tipo de falha ------------------------
  let motivo:           string
  let sugestaoCorrecao: string
  let codigoDiff:       AiAnalysis['codigoDiff']

  switch (facts.kind) {
    case 'not_visible':
      motivo = facts.roleName
        ? `O teste esperava que o botão/elemento "${facts.roleName}" estivesse visível, mas ele não apareceu antes do timeout. Isso costuma acontecer quando o componente foi renomeado, o aria-label mudou, ou o elemento é renderizado condicionalmente depois de uma ação que o teste não executa.`
        : 'O elemento alvo nunca apareceu na tela dentro do tempo de espera. Pode ter sido renomeado ou depende de uma ação prévia que o teste não executa.'
      sugestaoCorrecao = facts.locator
        ? `Troque o seletor atual (${facts.locator}) por um \`getByTestId(...)\` estável, e garanta que o componente esteja marcado com \`data-testid\` dedicado. Seletores por role/nome quebram facilmente em refactors.`
        : 'Adicione um `data-testid` estável ao elemento e use `getByTestId` em vez de seletores por texto/role.'
      if (facts.locator && facts.roleName) {
        const testId = `btn-${facts.roleName.toLowerCase().replace(/\s+/g, '-')}`
        codigoDiff = {
          old: facts.locator,
          new: `getByTestId('${testId}')`,
        }
      }
      break

    case 'not_found':
      motivo = 'O seletor não encontrou nenhum elemento correspondente no DOM. A tela pode ter sido refatorada e o atributo que o teste usa sumiu, ou o componente ainda não foi montado quando o teste tenta acessá-lo.'
      sugestaoCorrecao = 'Confirme se o componente ficou com o mesmo `name`/`aria-label`/`data-testid`. Se o refactor mudou a API do componente, atualize o teste para a nova forma — idealmente adicionando `data-testid` para quebrar essa dependência.'
      if (facts.locator) {
        codigoDiff = {
          old: facts.locator,
          new: facts.locator.replace(/getByRole\([^)]+\)/, "getByTestId('<id-estavel>')"),
        }
      }
      break

    case 'timeout':
      motivo = 'A página ficou em um estado de carregamento mais longo do que o esperado, ou a condição aguardada nunca se satisfez. Pode ser um request lento, um `useEffect` que não dispara, ou uma animação/transição que ainda está em curso.'
      sugestaoCorrecao = 'Aumente o timeout localmente (`{ timeout: 10_000 }`) APENAS após investigar a causa. Idealmente, adicione um `waitFor` na condição específica (ex: `await expect(row).toBeVisible()`) em vez de depender do timeout padrão.'
      break

    case 'assertion':
      motivo = 'O valor encontrado pelo teste difere do esperado. Pode ser um teste desatualizado (texto/valor mudou no produto), um bug real de renderização, ou um problema de timing (comparação feita antes do dado carregar).'
      sugestaoCorrecao = 'Verifique se o valor esperado no teste ainda reflete o comportamento desejado do produto. Se sim, o bug é no código; se não, atualize o teste para o novo valor canônico.'
      break

    case 'network':
      motivo = 'O teste recebeu uma resposta HTTP inesperada (erro 4xx/5xx) ou a conexão falhou. O backend pode estar fora, uma rota pode ter mudado, ou o payload enviado pelo teste não é mais válido.'
      sugestaoCorrecao = 'Confirme se o serviço alvo está rodando (check de `/health`). Se o endpoint mudou, atualize o teste para o novo contrato. Se o payload quebrou, sincronize com o schema Zod atual.'
      break

    case 'selector':
      motivo = 'O seletor usado pelo teste não casa mais com nenhum elemento. Um refactor provavelmente mudou a classe, o texto, ou a estrutura que o seletor dependia.'
      sugestaoCorrecao = 'Prefira `getByTestId` para pontos de ancoragem estáveis. Evite seletores por classe CSS ou XPath — eles quebram em qualquer refactor visual.'
      break

    default:
      motivo = 'Não foi possível classificar a falha automaticamente a partir da mensagem. Abra o erro bruto acima para ver o stack completo.'
      sugestaoCorrecao = 'Execute o teste localmente com `--headed` e `--debug` para reproduzir passo a passo. Se o erro for intermitente, pode ser uma race condition — envolva a asserção final num `waitFor`.'
  }

  return {
    erroResumo: facts.headline,
    motivo,
    sugestaoCorrecao,
    arquivo,
    codigoDiff,
  }
}

/**
 * Percorre recursivamente a árvore de suites do Playwright
 * e empurra entradas formatadas em `entries`.
 */
export function walkSuite(suite: PwSuite, entries: TestLogEntry[]): void {
  // Percorre sub-suites recursivamente
  for (const sub of suite.suites ?? []) {
    walkSuite(sub, entries)
  }

  // Processa specs do nível atual
  for (const spec of suite.specs ?? []) {
    const test     = spec.tests?.[0]
    const result0  = test?.results?.[0]
    const hasResults = (test?.results?.length ?? 0) > 0

    const module = (test?.projectName ?? suite.title ?? 'unknown')
      .replace(/\\/g, '/')
      .split('/').pop() ?? 'unknown'

    const isSkipped = result0?.status === 'skipped' || test?.expectedStatus === 'skipped'
      || test?.annotations?.some(a => a.type === 'skip' || a.type === 'fixme')

    if (isSkipped) {
      const skipReason = test?.annotations?.find(a => a.type === 'skip' || a.type === 'fixme')?.type ?? 'skip'
      const skipMsg = `Teste marcado como ${skipReason} no código fonte. O Playwright listou mas não executou este teste.`
      entries.push({
        type:      'E2E',
        module,
        test_name: spec.title,
        result:    'REPROVADO',
        duration:  '0ms',
        error_log: skipMsg,
        ai_analysis: {
          erroResumo: `Teste com annotation "${skipReason}" — não executado`,
          motivo: `Este teste está marcado com test.describe.${skipReason}() ou test.${skipReason}() no spec file. O Playwright reconhece o teste mas pula a execução. Isso é intencional quando o teste depende de funcionalidade ainda não implementada, ou quando está temporariamente desabilitado.`,
          sugestaoCorrecao: `Remover o .${skipReason}() do describe/test quando a funcionalidade estiver pronta. Localizar a annotation na linha do spec file e avaliar se a condição de skip ainda é válida.`,
          arquivo: spec.file ?? suite.file ?? 'arquivo desconhecido',
        },
      })
      continue
    }

    if (!hasResults) {
      const noRunMsg = 'Teste não foi executado pelo Playwright (results vazio). O browser pode não ter sido iniciado, ou o --project não casou com este spec.'
      entries.push({
        type:      'E2E',
        module,
        test_name: spec.title,
        result:    'REPROVADO',
        duration:  '0ms',
        error_log: noRunMsg,
        ai_analysis: {
          erroResumo: 'Teste não executado',
          motivo: 'O Playwright listou este teste mas não o executou. Isso acontece quando: (1) o browser não está disponível/instalado, (2) o --project do Playwright não casa com o spec, (3) o teste foi filtrado por tag/grep, ou (4) o processo encerrou antes de iniciar a execução.',
          sugestaoCorrecao: 'Execute localmente: npx playwright test <spec> --project <projeto> --headed. Verifique se o browser está instalado (npx playwright install). Confirme que o projeto no playwright.config.ts inclui o diretório do spec.',
          arquivo: spec.file ?? suite.file ?? 'arquivo desconhecido',
        },
      })
      continue
    }

    const status   = result0?.status ?? 'failed'
    const duration = result0?.duration ?? 0
    // Playwright usa tanto `error` (singular) quanto `errors` (array) dependendo da versão
    const errMsg   = result0?.error?.message ?? result0?.error?.stack
      ?? result0?.errors?.[0]?.message ?? result0?.errors?.[0]?.stack ?? null

    const errorLogTrimmed = errMsg ? String(errMsg).slice(0, 500) : null
    const mappedResult = PW_STATUS_MAP[status] ?? 'REPROVADO'

    entries.push({
      type:      'E2E',
      module,
      test_name: spec.title,
      result:    mappedResult,
      duration:  `${duration}ms`,
      error_log: errorLogTrimmed,
      ai_analysis: mappedResult === 'APROVADO'
        ? null
        : generateAiAnalysis(errorLogTrimmed, spec.file ?? suite.file),
    })
  }
}
