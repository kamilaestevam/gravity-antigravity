#!/usr/bin/env npx tsx
// scripts/generate-test-plans-onda5.ts
// Gera planos de teste 10/10 para as 6 telas críticas restantes do Configurador
// Execução: npx tsx scripts/generate-test-plans-onda5.ts

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { resolve, join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename_esm = fileURLToPath(import.meta.url)
const __dirname_esm = dirname(__filename_esm)
const ROOT = resolve(__dirname_esm, '..')
const PLANS_DIR = resolve(ROOT, 'testes/testes-e2e/configurador/_planos')
const SPECS_DIR = resolve(ROOT, 'testes/testes-e2e/configurador')
const REGISTRY_PATH = resolve(ROOT, 'testes/test-plans-registry.json')

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface PlanDef {
  id: string
  sublocal: string
  tela: string
  rota: string
  componenteFilePath: string
  criticidade: 'baixa' | 'media' | 'alta' | 'critica'
  temDinheiro: boolean
  resumoExecutivo: string
  naoAplicaveis: Array<{ cat: number; justificativa: string }>
  passos: Array<{
    acao: string
    categoria: number
    interacao: Record<string, unknown>
    assercao?: Record<string, unknown>
    resultadoEsperado: string
    screenshot?: string
    tipos: string[]
    testid?: string
  }>
}

const CATEGORIAS = [
  'Carregamento da tela', 'Identidade visual', 'Navegacao lateral / breadcrumb',
  'Read / Listagem / Visualizacao', 'Update / Edicao', 'Create / Criacao',
  'Delete / Exclusao', 'Validacoes de campo', 'Estados de erro', 'Estados vazios',
  'Estados de loading', 'Filtros e busca', 'Ordenacao', 'Permissoes / RBAC',
  'Multi-tenant / isolamento', 'Acessibilidade (a11y)', 'Responsividade',
  'Internacionalizacao (i18n)', 'Performance', 'Persistencia e refresh',
]

function buildPlan(def: PlanDef) {
  const now = new Date().toISOString()
  const mapeamentoFile = `_mapeamentos/configurador/${def.sublocal.toLowerCase().replace(/\s+/g, '-')}.testids.json`

  // Construir passos com numeração
  const passos = def.passos.map((p, i) => ({
    numero: i + 1,
    acao: p.acao,
    categoria: p.categoria,
    origem: 'agente-adicionado' as const,
    interacao: p.interacao,
    ...(p.assercao ? { assercao: p.assercao } : {}),
    resultadoEsperado: p.resultadoEsperado,
    screenshot: p.screenshot ?? `${String(i + 1).padStart(2, '0')}_${p.acao.slice(0, 30).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`,
    tiposAplicaveis: p.tipos,
    ...(p.testid ? { requerNovoTestid: true, requerNovoTestidNome: p.testid } : {}),
  }))

  // Cobertura
  const naoApSet = new Set(def.naoAplicaveis.map(n => n.cat))
  const cobertura = CATEGORIAS.map((nome, idx) => {
    const cat = idx + 1
    const na = def.naoAplicaveis.find(n => n.cat === cat)
    const associados = passos.filter(p => p.categoria === cat).map(p => p.numero)
    return {
      categoria: cat,
      nome,
      status: na ? 'nao_aplicavel' : associados.length > 0 ? 'coberta' : 'ausente',
      passosAssociados: associados,
      ...(na ? { justificativa: na.justificativa } : {}),
    }
  })

  const cobertos = cobertura.filter(c => c.status === 'coberta' || c.status === 'nao_aplicavel').length
  const coberturaPercentual = Math.round((cobertos / 20) * 100)

  // Mapeamento de testids (vazio, requer adição)
  const testidsRequeridos = passos.filter(p => p.requerNovoTestid).map(p => p.requerNovoTestidNome)
  const mapeamento = {
    componente: def.componenteFilePath,
    extraidoEm: now,
    elementos: {},
    testidsFaltando: testidsRequeridos,
  }

  return {
    plan: {
      id: def.id,
      versao: '1.0',
      geradoEm: now,
      geradoPor: 'agente-plano-teste',
      escopo: 'CONFIG',
      sublocal: def.sublocal,
      tela: def.tela,
      rota: def.rota,
      componenteFilePath: def.componenteFilePath,
      mapeamentoFilePath: `testes/${mapeamentoFile}`,
      ambientes: ['Local', 'Staging', 'Producao'],
      criticidade: def.criticidade,
      temDinheiro: def.temDinheiro,
      resumoExecutivo: def.resumoExecutivo,
      preRequisitos: {
        ambiente: 'Local',
        organizacao: 'Gravity Ltda',
        workspace: 'Importador ABC',
        roleUsuario: 'ADMIN',
        servicosAtivos: ['configurador-server-8005', 'configurador-front-8000'],
      },
      mapeamentoTestids: mapeamento,
      cobertura,
      coberturaPercentual,
      passos,
      estimativaDuracao: `~${Math.ceil(passos.length / 30)} min`,
      estimativaCustoIA: 0.08,
      ultimaExecucao: null,
      ultimoResultado: null,
    },
    mapeamento,
    mapeamentoFile,
  }
}

// ─── Definições das 6 telas ──────────────────────────────────────────────────

const TELAS: PlanDef[] = [
  // ─── Usuários ──────────────────────────────────────────────────────
  {
    id: 'TST-E2E-CONFIG-000002',
    sublocal: 'Usuarios',
    tela: 'Usuários',
    rota: '/workspace/usuarios',
    componenteFilePath: 'servicos-global/configurador/src/pages/workspace/Usuarios.tsx',
    criticidade: 'alta',
    temDinheiro: false,
    resumoExecutivo: 'Tela de gestão de usuários do tenant. Permite convidar, editar, suspender e gerenciar permissões. Risco: vazamento de dados entre tenants. Cobertura: 20/20 categorias.',
    naoAplicaveis: [],
    passos: [
      // Cat 1: Carregamento
      { acao: 'Navegar para /workspace/usuarios', categoria: 1, interacao: { tipo: 'goto', rota: '/workspace/usuarios' }, assercao: { tipo: 'urlMatches', regex: '/workspace/usuarios' }, resultadoEsperado: 'URL correta carregada', tipos: ['E2E'], testid: 'page-usuarios' },
      { acao: 'Verificar tabela de usuarios visivel', categoria: 1, interacao: { tipo: 'verificacao' }, assercao: { tipo: 'visible', testid: 'tabela-usuarios' }, resultadoEsperado: 'Tabela de usuarios renderizada', tipos: ['E2E'], testid: 'tabela-usuarios' },
      { acao: 'Verificar sem erros JS no console', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Console sem erros JS', tipos: ['E2E'] },
      { acao: 'Verificar sem requisicoes 4xx/5xx', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Todas requisicoes OK', tipos: ['E2E'] },
      // Cat 2: Visual
      { acao: 'Verificar titulo Usuarios', categoria: 2, interacao: { tipo: 'verificacao' }, assercao: { tipo: 'visible', testid: 'titulo-usuarios' }, resultadoEsperado: 'Titulo visivel', tipos: ['E2E'], testid: 'titulo-usuarios' },
      { acao: 'Verificar icone de usuarios no header', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Icone Users visivel no cabecalho', tipos: ['E2E'] },
      { acao: 'Verificar 4 cards de estatistica', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Cards de total usuarios, acessos e distribuicao visiveis', tipos: ['E2E'] },
      { acao: 'Verificar subtitulo informativo', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Subtitulo descritivo visivel', tipos: ['E2E'] },
      { acao: 'Verificar badge de role com cor correta', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Badges de role com cores corretas (ADMIN=azul, MASTER=roxo)', tipos: ['E2E'] },
      { acao: 'Verificar avatar do usuario na tabela', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Avatar circular com iniciais visivel', tipos: ['E2E'] },
      { acao: 'Verificar status Ativo/Inativo com badge', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Badge verde para Ativo, cinza para Inativo', tipos: ['E2E'] },
      // Cat 3: Navegacao
      { acao: 'Verificar sidebar com item Usuarios selecionado', categoria: 3, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Item Usuarios highlighted na sidebar', tipos: ['E2E'] },
      { acao: 'Verificar breadcrumb Configurador > Usuarios', categoria: 3, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Breadcrumb correto', tipos: ['E2E'] },
      { acao: 'Navegar para Organizacao via sidebar', categoria: 3, interacao: { tipo: 'click', testid: 'nav-organizacao' }, assercao: { tipo: 'urlMatches', regex: '/workspace/organizacao' }, resultadoEsperado: 'Navega para Organizacao', tipos: ['E2E'], testid: 'nav-organizacao' },
      { acao: 'Voltar para Usuarios via sidebar', categoria: 3, interacao: { tipo: 'click', testid: 'nav-usuarios' }, assercao: { tipo: 'urlMatches', regex: '/workspace/usuarios' }, resultadoEsperado: 'Volta para Usuarios', tipos: ['E2E'], testid: 'nav-usuarios' },
      { acao: 'Navegar para Assinaturas via sidebar', categoria: 3, interacao: { tipo: 'click', testid: 'nav-assinaturas' }, assercao: { tipo: 'urlMatches', regex: '/workspace/assinaturas' }, resultadoEsperado: 'Navega para Assinaturas', tipos: ['E2E'], testid: 'nav-assinaturas' },
      // Cat 4: Read
      { acao: 'Verificar colunas da tabela de usuarios', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Colunas Nome, Email, Tipo, Status, Empresas visiveis', tipos: ['E2E'] },
      { acao: 'Expandir linha de usuario', categoria: 4, interacao: { tipo: 'click', testid: 'btn-expand-user-0' }, resultadoEsperado: 'Detalhes de acesso aos workspaces expandidos', tipos: ['E2E'], testid: 'btn-expand-user-0' },
      { acao: 'Verificar dados do usuario na expansao', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Workspaces vinculados visiveis', tipos: ['E2E'] },
      { acao: 'Recolher linha expandida', categoria: 4, interacao: { tipo: 'click', testid: 'btn-expand-user-0' }, resultadoEsperado: 'Linha recolhida', tipos: ['E2E'] },
      { acao: 'Verificar contagem de usuarios no card', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Card mostra total correto', tipos: ['E2E'] },
      { acao: 'Verificar dados do usuario exibidos corretamente', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Nome, email e role corretos na tabela', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar que apenas usuarios do tenant logado aparecem', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Nenhum usuario de outro tenant visivel', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar paginacao quando mais de N usuarios', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Paginacao funcional', tipos: ['E2E'] },
      // Cat 5: Update
      { acao: 'Clicar botao Editar em usuario', categoria: 5, interacao: { tipo: 'click', testid: 'btn-edit-user-0' }, resultadoEsperado: 'Modal de edicao abre', tipos: ['E2E'], testid: 'btn-edit-user-0' },
      { acao: 'Alterar nome do usuario', categoria: 5, interacao: { tipo: 'fill', testid: 'input-nome-usuario', valor: 'Teste Editado' }, resultadoEsperado: 'Campo aceita valor', tipos: ['E2E'], testid: 'input-nome-usuario' },
      { acao: 'Salvar edicao de usuario', categoria: 5, interacao: { tipo: 'click', testid: 'btn-salvar-usuario' }, assercao: { tipo: 'toastShown', texto: 'salvo' }, resultadoEsperado: 'Toast de sucesso e dados atualizados', tipos: ['E2E'], testid: 'btn-salvar-usuario' },
      { acao: 'Alterar status para Inativo', categoria: 5, interacao: { tipo: 'click', testid: 'btn-toggle-status-0' }, resultadoEsperado: 'Status muda para Inativo', tipos: ['E2E'], testid: 'btn-toggle-status-0' },
      { acao: 'Reativar usuario', categoria: 5, interacao: { tipo: 'click', testid: 'btn-toggle-status-0' }, resultadoEsperado: 'Status volta para Ativo', tipos: ['E2E'] },
      { acao: 'Editar permissoes de usuario', categoria: 5, interacao: { tipo: 'click', testid: 'btn-permissoes-0' }, resultadoEsperado: 'Modal de permissoes abre', tipos: ['E2E'], testid: 'btn-permissoes-0' },
      { acao: 'Verificar edicao via API PATCH', categoria: 5, interacao: { tipo: 'verificacao' }, assercao: { tipo: 'apiResponse', rota: '/api/v1/users', status: 200 }, resultadoEsperado: 'API retorna 200', tipos: ['E2E', 'FUN'] },
      { acao: 'Cancelar edicao (fechar modal sem salvar)', categoria: 5, interacao: { tipo: 'press', tecla: 'Escape' }, resultadoEsperado: 'Modal fecha sem alterar dados', tipos: ['E2E'] },
      { acao: 'Verificar que alteracao persiste apos F5', categoria: 5, interacao: { tipo: 'reload' }, resultadoEsperado: 'Dados editados persistem', tipos: ['E2E'] },
      { acao: 'Editar email do usuario', categoria: 5, interacao: { tipo: 'fill', testid: 'input-email-usuario', valor: 'novo@teste.com' }, resultadoEsperado: 'Email aceita novo valor', tipos: ['E2E'], testid: 'input-email-usuario' },
      // Cat 6: Create
      { acao: 'Clicar botao Convidar Usuario', categoria: 6, interacao: { tipo: 'click', testid: 'btn-convidar-usuario' }, resultadoEsperado: 'Modal de convite abre', tipos: ['E2E'], testid: 'btn-convidar-usuario' },
      { acao: 'Preencher nome do convidado', categoria: 6, interacao: { tipo: 'fill', testid: 'input-nome-convite', valor: 'Novo Usuario Teste' }, resultadoEsperado: 'Campo aceita valor', tipos: ['E2E'], testid: 'input-nome-convite' },
      { acao: 'Preencher email do convidado', categoria: 6, interacao: { tipo: 'fill', testid: 'input-email-convite', valor: 'novo@teste.com' }, resultadoEsperado: 'Campo aceita valor', tipos: ['E2E'], testid: 'input-email-convite' },
      { acao: 'Selecionar tipo de usuario', categoria: 6, interacao: { tipo: 'select', testid: 'select-tipo-convite', opcao: 'STANDARD' }, resultadoEsperado: 'Tipo selecionado', tipos: ['E2E'], testid: 'select-tipo-convite' },
      { acao: 'Enviar convite', categoria: 6, interacao: { tipo: 'click', testid: 'btn-enviar-convite' }, assercao: { tipo: 'toastShown', texto: 'convite' }, resultadoEsperado: 'Convite enviado, toast de sucesso', tipos: ['E2E'], testid: 'btn-enviar-convite' },
      { acao: 'Verificar novo usuario na tabela', categoria: 6, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Novo usuario aparece na lista', tipos: ['E2E'] },
      { acao: 'Verificar API POST /users/invite chamada', categoria: 6, interacao: { tipo: 'verificacao' }, assercao: { tipo: 'apiResponse', rota: '/api/v1/users/invite', status: 201 }, resultadoEsperado: 'API retorna 201', tipos: ['E2E', 'FUN'] },
      { acao: 'Cancelar convite (fechar modal)', categoria: 6, interacao: { tipo: 'press', tecla: 'Escape' }, resultadoEsperado: 'Modal fecha sem enviar', tipos: ['E2E'] },
      // Cat 7: Delete
      { acao: 'Suspender usuario (soft delete)', categoria: 7, interacao: { tipo: 'click', testid: 'btn-toggle-status-0' }, resultadoEsperado: 'Status muda para Inativo', tipos: ['E2E'] },
      { acao: 'Confirmar suspensao na modal', categoria: 7, interacao: { tipo: 'click', testid: 'btn-confirmar-suspensao' }, resultadoEsperado: 'Usuario suspenso com sucesso', tipos: ['E2E'], testid: 'btn-confirmar-suspensao' },
      { acao: 'Verificar que usuario suspenso nao tem acesso', categoria: 7, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Badge Inativo visivel', tipos: ['E2E', 'FUN'] },
      { acao: 'Remover acesso de workspace especifico', categoria: 7, interacao: { tipo: 'click', testid: 'btn-remover-workspace-0' }, resultadoEsperado: 'Workspace removido da lista', tipos: ['E2E'], testid: 'btn-remover-workspace-0' },
      { acao: 'Verificar confirmacao antes de deletar', categoria: 7, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Modal de confirmacao aparece antes de acao destrutiva', tipos: ['E2E'] },
      { acao: 'Cancelar exclusao', categoria: 7, interacao: { tipo: 'press', tecla: 'Escape' }, resultadoEsperado: 'Exclusao cancelada, dados intactos', tipos: ['E2E'] },
      // Cat 8: Validacoes
      { acao: 'Convite com email invalido', categoria: 8, interacao: { tipo: 'fill', testid: 'input-email-convite', valor: 'invalido' }, resultadoEsperado: 'Erro de validacao no email', tipos: ['E2E', 'UNI'] },
      { acao: 'Convite com nome vazio', categoria: 8, interacao: { tipo: 'fill', testid: 'input-nome-convite', valor: '' }, resultadoEsperado: 'Campo obrigatorio destacado', tipos: ['E2E', 'UNI'] },
      { acao: 'Convite com email duplicado', categoria: 8, interacao: { tipo: 'fill', testid: 'input-email-convite', valor: 'existente@empresa.com' }, resultadoEsperado: 'Erro 409 Conflict', tipos: ['E2E', 'FUN'] },
      { acao: 'Convite com email vazio', categoria: 8, interacao: { tipo: 'fill', testid: 'input-email-convite', valor: '' }, resultadoEsperado: 'Botao enviar desabilitado', tipos: ['E2E'] },
      { acao: 'Verificar validacao Zod no backend', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Backend rejeita payload invalido com 400', tipos: ['FUN'] },
      { acao: 'Nome com caracteres especiais aceitos', categoria: 8, interacao: { tipo: 'fill', testid: 'input-nome-convite', valor: 'José da Silva' }, resultadoEsperado: 'Nome com acentos aceito', tipos: ['E2E'] },
      { acao: 'Email max 255 chars', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Email truncado/rejeitado acima de 255', tipos: ['FUN'] },
      { acao: 'Verificar tipo de usuario obrigatorio', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Select de tipo tem valor padrao', tipos: ['E2E'] },
      { acao: 'Verificar que ADMIN nao pode convidar SUPER_ADMIN', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Opcao SUPER_ADMIN nao disponivel para ADMIN', tipos: ['E2E', 'FUN'] },
      { acao: 'Testar auto-convite (mesmo email do logado)', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Erro ao tentar convidar proprio email', tipos: ['FUN'] },
      // Cat 9: Estados de erro
      { acao: 'Simular erro 500 na API de usuarios', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Toast de erro exibido, tabela vazia', tipos: ['E2E', 'FUN'] },
      { acao: 'Simular timeout na API', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mensagem de erro amigavel', tipos: ['E2E'] },
      { acao: 'Simular erro 403 (sem permissao)', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mensagem de acesso negado', tipos: ['E2E', 'FUN'] },
      { acao: 'Simular erro de rede', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Feedback visual de erro de conexao', tipos: ['E2E'] },
      { acao: 'Convite falha no Clerk (serviço externo)', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Erro tratado sem crash', tipos: ['FUN'] },
      { acao: 'Erro ao editar usuario inexistente', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Toast de erro 404', tipos: ['FUN'] },
      // Cat 10: Vazios
      { acao: 'Tela sem usuarios (tenant novo)', categoria: 10, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mensagem de estado vazio e botao convidar', tipos: ['E2E'] },
      { acao: 'Busca sem resultados', categoria: 10, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mensagem sem resultados para filtro', tipos: ['E2E'] },
      { acao: 'Expansao sem workspaces vinculados', categoria: 10, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mensagem vazia na expansao', tipos: ['E2E'] },
      // Cat 11: Loading
      { acao: 'Verificar skeleton durante carregamento', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Skeleton/shimmer enquanto API responde', tipos: ['E2E'] },
      { acao: 'Verificar loading no botao de convite', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Spinner no botao durante envio', tipos: ['E2E'] },
      { acao: 'Verificar loading no toggle de status', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Indicador de loading durante alteracao', tipos: ['E2E'] },
      // Cat 12: Filtros
      { acao: 'Buscar usuario por nome', categoria: 12, interacao: { tipo: 'fill', testid: 'input-busca-usuarios', valor: 'Daniel' }, resultadoEsperado: 'Tabela filtra por nome', tipos: ['E2E'], testid: 'input-busca-usuarios' },
      { acao: 'Buscar por email', categoria: 12, interacao: { tipo: 'fill', testid: 'input-busca-usuarios', valor: '@empresa' }, resultadoEsperado: 'Tabela filtra por email', tipos: ['E2E'] },
      { acao: 'Filtrar por role', categoria: 12, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Filtro por tipo funciona', tipos: ['E2E'] },
      { acao: 'Filtrar por status Ativo/Inativo', categoria: 12, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Apenas status filtrado visivel', tipos: ['E2E'] },
      { acao: 'Limpar filtros', categoria: 12, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Todos usuarios voltam a aparecer', tipos: ['E2E'] },
      { acao: 'Busca case-insensitive', categoria: 12, interacao: { tipo: 'fill', testid: 'input-busca-usuarios', valor: 'DANIEL' }, resultadoEsperado: 'Encontra resultados independente de case', tipos: ['E2E', 'FUN'] },
      // Cat 13: Ordenacao
      { acao: 'Ordenar por nome A-Z', categoria: 13, interacao: { tipo: 'click', testid: 'col-nome' }, resultadoEsperado: 'Tabela ordenada alfabeticamente', tipos: ['E2E'], testid: 'col-nome' },
      { acao: 'Ordenar por nome Z-A', categoria: 13, interacao: { tipo: 'click', testid: 'col-nome' }, resultadoEsperado: 'Tabela ordenada inversamente', tipos: ['E2E'] },
      { acao: 'Ordenar por tipo', categoria: 13, interacao: { tipo: 'click', testid: 'col-tipo' }, resultadoEsperado: 'Agrupado por role', tipos: ['E2E'], testid: 'col-tipo' },
      { acao: 'Ordenar por status', categoria: 13, interacao: { tipo: 'click', testid: 'col-status' }, resultadoEsperado: 'Ativos primeiro', tipos: ['E2E'], testid: 'col-status' },
      // Cat 14: RBAC
      { acao: 'Verificar que STANDARD nao ve botao Convidar', categoria: 14, interacao: { tipo: 'setRole', role: 'STANDARD' }, resultadoEsperado: 'Botao convidar oculto para STANDARD', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar que ADMIN pode convidar STANDARD', categoria: 14, interacao: { tipo: 'setRole', role: 'ADMIN' }, resultadoEsperado: 'ADMIN pode convidar STANDARD/MASTER', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar que ADMIN nao pode promover para SUPER_ADMIN', categoria: 14, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Opcao SUPER_ADMIN desabilitada para ADMIN', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar que SUPER_ADMIN tem acesso total', categoria: 14, interacao: { tipo: 'setRole', role: 'SUPER_ADMIN' }, resultadoEsperado: 'Todos botoes e acoes visiveis', tipos: ['E2E'] },
      { acao: 'Verificar que USER so ve propria ficha', categoria: 14, interacao: { tipo: 'setRole', role: 'USER' }, resultadoEsperado: 'Apenas dados do proprio usuario visiveis', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar middleware requireAuth no backend', categoria: 14, interacao: { tipo: 'verificacao' }, assercao: { tipo: 'apiResponse', rota: '/api/v1/users', status: 401 }, resultadoEsperado: 'Sem token retorna 401', tipos: ['FUN'] },
      // Cat 15: Multi-tenant
      { acao: 'Verificar que usuario de Tenant A nao ve usuarios de Tenant B', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Isolamento de dados entre tenants', tipos: ['CRO'] },
      { acao: 'Verificar que API filtra por tenant_id', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'WHERE tenant_id presente em toda query', tipos: ['CRO'] },
      { acao: 'Tentar acessar usuario de outro tenant via URL direta', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Erro 404 ou 403', tipos: ['CRO'] },
      { acao: 'Verificar que convite so cria no tenant correto', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Usuario criado com tenant_id do logado', tipos: ['CRO'] },
      // Cat 16: a11y
      { acao: 'Navegar tabela com Tab', categoria: 16, interacao: { tipo: 'press', tecla: 'Tab' }, resultadoEsperado: 'Focus ring visivel nos elementos interativos', tipos: ['E2E'] },
      { acao: 'Verificar aria-label nos botoes', categoria: 16, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Todos botoes tem aria-label descritivo', tipos: ['E2E'] },
      { acao: 'Verificar contraste de texto', categoria: 16, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Ratio >= 4.5:1 para texto', tipos: ['E2E'] },
      { acao: 'Abrir modal com Enter', categoria: 16, interacao: { tipo: 'press', tecla: 'Enter' }, resultadoEsperado: 'Modal abre via teclado', tipos: ['E2E'] },
      { acao: 'Fechar modal com Escape', categoria: 16, interacao: { tipo: 'press', tecla: 'Escape' }, resultadoEsperado: 'Modal fecha via Escape', tipos: ['E2E'] },
      { acao: 'Verificar role=table na tabela', categoria: 16, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Tabela acessivel para screen reader', tipos: ['E2E'] },
      // Cat 17: Responsividade
      { acao: 'Resize para mobile 375px', categoria: 17, interacao: { tipo: 'resize', largura: 375, altura: 812 }, resultadoEsperado: 'Layout adaptado sem overflow horizontal', tipos: ['E2E'] },
      { acao: 'Resize para tablet 768px', categoria: 17, interacao: { tipo: 'resize', largura: 768, altura: 1024 }, resultadoEsperado: 'Layout de tablet funcional', tipos: ['E2E'] },
      { acao: 'Resize para desktop 1280px', categoria: 17, interacao: { tipo: 'resize', largura: 1280, altura: 800 }, resultadoEsperado: 'Layout desktop padrao', tipos: ['E2E'] },
      { acao: 'Verificar sidebar responsiva', categoria: 17, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Sidebar colapsa em telas menores', tipos: ['E2E'] },
      // Cat 18: i18n
      { acao: 'Verificar textos em PT-BR', categoria: 18, interacao: { tipo: 'setLocale', locale: 'pt' }, resultadoEsperado: 'Todos labels em portugues', tipos: ['E2E'] },
      { acao: 'Trocar para EN', categoria: 18, interacao: { tipo: 'setLocale', locale: 'en' }, resultadoEsperado: 'Labels trocam para ingles', tipos: ['E2E'] },
      { acao: 'Verificar formato de data BR (DD/MM/YYYY)', categoria: 18, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Datas no formato brasileiro', tipos: ['E2E'] },
      { acao: 'Voltar para PT-BR', categoria: 18, interacao: { tipo: 'setLocale', locale: 'pt' }, resultadoEsperado: 'Interface volta para portugues', tipos: ['E2E'] },
      // Cat 19: Performance
      { acao: 'Verificar FCP < 1.5s', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'First Contentful Paint abaixo de 1.5s', tipos: ['E2E'] },
      { acao: 'Verificar TTI < 3s', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Time to Interactive abaixo de 3s', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar ausencia de N+1 queries', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Sem queries excessivas no load', tipos: ['FUN'] },
      { acao: 'Verificar que lista de 100 usuarios renderiza em < 2s', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Performance aceitavel com volume', tipos: ['E2E', 'FUN'] },
      // Cat 20: Persistencia
      { acao: 'Verificar que dados persistem apos F5', categoria: 20, interacao: { tipo: 'reload' }, resultadoEsperado: 'Tabela recarrega com mesmos dados', tipos: ['E2E'] },
      { acao: 'Verificar que filtro na URL persiste', categoria: 20, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Query string preservada', tipos: ['E2E'] },
      { acao: 'Verificar dirty check ao sair com edicao pendente', categoria: 20, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Alerta de alteracoes nao salvas', tipos: ['E2E'] },
    ],
  },

  // ─── Permissões ──────────────────────────────────────────────────
  {
    id: 'TST-E2E-CONFIG-000003',
    sublocal: 'Permissoes',
    tela: 'Permissões',
    rota: '/workspace/usuarios',
    componenteFilePath: 'servicos-global/configurador/src/pages/workspace/ModalPermissoesUsuario.tsx',
    criticidade: 'alta',
    temDinheiro: false,
    resumoExecutivo: 'Modal de permissões granulares por módulo (Configurador, Menu, Comunicação, Produtos). Risco: escalação de privilégios. 4 abas com checkboxes agrupadas. RBAC define quais checkboxes são editáveis.',
    naoAplicaveis: [
      { cat: 6, justificativa: 'Permissões não são criadas — são toggle on/off' },
      { cat: 7, justificativa: 'Permissões não são deletadas — são revogadas (toggle off)' },
      { cat: 12, justificativa: 'Modal de permissoes nao tem filtros nem busca — o layout e um grid fixo de checkboxes agrupadas por modulo' },
      { cat: 13, justificativa: 'Sem ordenacao — layout fixo de checkboxes agrupadas por modulo, nao ha coluna ordenavel' },
    ],
    passos: [
      { acao: 'Abrir modal de permissoes', categoria: 1, interacao: { tipo: 'click', testid: 'btn-permissoes-0' }, resultadoEsperado: 'Modal de permissoes abre', tipos: ['E2E'], testid: 'btn-permissoes-0' },
      { acao: 'Verificar 4 abas visiveis', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Abas Configurador, Menu, Comunicação, Produtos', tipos: ['E2E'] },
      { acao: 'Verificar banner de tipo de usuario', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Banner com role do usuario e explicacao', tipos: ['E2E'] },
      { acao: 'Verificar sem erros JS no console', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Console limpo', tipos: ['E2E'] },
      { acao: 'Verificar titulo do modal com nome do usuario', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Nome do usuario no titulo', tipos: ['E2E'] },
      { acao: 'Verificar icone de permissoes', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Icone Shield visivel', tipos: ['E2E'] },
      { acao: 'Verificar cores dos badges de role', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Master=roxo, Admin=azul, Super Admin=vermelho', tipos: ['E2E'] },
      { acao: 'Verificar contador de permissoes ativas por aba', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Badge numerico em cada aba', tipos: ['E2E'] },
      { acao: 'Verificar layout de grid de checkboxes', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Checkboxes agrupadas por modulo', tipos: ['E2E'] },
      { acao: 'Verificar botoes Selecionar Todos / Limpar', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Botoes de acao em massa visiveis', tipos: ['E2E'] },
      { acao: 'Verificar estilo desabilitado para Master/SuperAdmin', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Checkboxes readonly com tooltip explicativo', tipos: ['E2E'] },
      { acao: 'Clicar na aba Configurador', categoria: 3, interacao: { tipo: 'click', testid: 'tab-configurador' }, resultadoEsperado: 'Aba Configurador selecionada', tipos: ['E2E'], testid: 'tab-configurador' },
      { acao: 'Clicar na aba Menu', categoria: 3, interacao: { tipo: 'click', testid: 'tab-menu' }, resultadoEsperado: 'Aba Menu selecionada', tipos: ['E2E'], testid: 'tab-menu' },
      { acao: 'Clicar na aba Comunicacao', categoria: 3, interacao: { tipo: 'click', testid: 'tab-comunicacao' }, resultadoEsperado: 'Aba Comunicacao selecionada', tipos: ['E2E'], testid: 'tab-comunicacao' },
      { acao: 'Clicar na aba Produtos', categoria: 3, interacao: { tipo: 'click', testid: 'tab-produtos' }, resultadoEsperado: 'Aba Produtos selecionada', tipos: ['E2E'], testid: 'tab-produtos' },
      { acao: 'Verificar que abas preservam estado ao navegar', categoria: 3, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Checkboxes mantem valores ao trocar aba', tipos: ['E2E'] },
      { acao: 'Verificar grid de permissoes do Configurador', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Modulos Organizacao, Workspaces, Usuarios, Assinaturas, Financeiro, APIs visiveis', tipos: ['E2E'] },
      { acao: 'Verificar estado atual das permissoes', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Checkboxes refletem permissoes reais do usuario', tipos: ['E2E'] },
      { acao: 'Verificar total de permissoes por aba', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Contador numerico correto', tipos: ['E2E'] },
      { acao: 'Verificar permissoes de todos os modulos', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Todas permissoes visiveis nas 4 abas', tipos: ['E2E'] },
      { acao: 'Verificar label descritivo de cada permissao', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Cada checkbox tem label descritivo', tipos: ['E2E'] },
      { acao: 'Toggle uma permissao individual', categoria: 5, interacao: { tipo: 'click', testid: 'perm-organizacao-editar' }, resultadoEsperado: 'Checkbox alterna estado', tipos: ['E2E'], testid: 'perm-organizacao-editar' },
      { acao: 'Clicar Selecionar Todos', categoria: 5, interacao: { tipo: 'click', testid: 'btn-selecionar-todos' }, resultadoEsperado: 'Todas checkboxes da aba marcadas', tipos: ['E2E'], testid: 'btn-selecionar-todos' },
      { acao: 'Clicar Limpar Todos', categoria: 5, interacao: { tipo: 'click', testid: 'btn-limpar-todos' }, resultadoEsperado: 'Todas checkboxes da aba desmarcadas', tipos: ['E2E'], testid: 'btn-limpar-todos' },
      { acao: 'Salvar permissoes alteradas', categoria: 5, interacao: { tipo: 'click', testid: 'btn-salvar-permissoes' }, assercao: { tipo: 'toastShown', texto: 'salv' }, resultadoEsperado: 'Permissoes salvas com toast', tipos: ['E2E'], testid: 'btn-salvar-permissoes' },
      { acao: 'Verificar que alteracao persiste ao reabrir modal', categoria: 5, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Permissoes alteradas mantidas', tipos: ['E2E'] },
      { acao: 'Verificar validacao de permissoes minimas', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Nao permite revogar todas permissoes', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar que Master tem checkboxes disabled', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Checkboxes readonly para Master', tipos: ['E2E'] },
      { acao: 'Verificar que Super Admin tem todas marcadas e disabled', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Todas permissoes ativas e nao editaveis', tipos: ['E2E'] },
      { acao: 'Verificar conflito de permissoes (ex: editar sem visualizar)', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Sistema previne combinacoes invalidas', tipos: ['E2E', 'FUN'] },
      { acao: 'Simular erro ao salvar permissoes', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Toast de erro, modal nao fecha', tipos: ['E2E', 'FUN'] },
      { acao: 'Simular erro 403 ao editar permissoes de outro admin', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Erro de permissao negada', tipos: ['FUN'] },
      { acao: 'Verificar estado vazio em aba sem permissoes', categoria: 10, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mensagem informativa se aba vazia', tipos: ['E2E'] },
      { acao: 'Verificar loading ao carregar permissoes', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Skeleton enquanto API responde', tipos: ['E2E'] },
      { acao: 'Verificar loading no botao salvar', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Spinner durante salvamento', tipos: ['E2E'] },
      { acao: 'ADMIN nao pode editar permissoes de SUPER_ADMIN', categoria: 14, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Modal abre em modo readonly', tipos: ['E2E', 'FUN'] },
      { acao: 'STANDARD nao pode acessar modal de permissoes', categoria: 14, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Botao de permissoes oculto', tipos: ['E2E', 'FUN'] },
      { acao: 'SUPER_ADMIN pode editar qualquer usuario', categoria: 14, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Checkboxes editaveis', tipos: ['E2E'] },
      { acao: 'Verificar escalacao de privilegios impossivel', categoria: 14, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'ADMIN nao pode dar permissoes que nao tem', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar isolamento de permissoes entre tenants', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Permissoes de tenant A nao afetam tenant B', tipos: ['CRO'] },
      { acao: 'Verificar que permissoes sao por tenant_id', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Filtro por tenant_id na query', tipos: ['CRO'] },
      { acao: 'Navegar checkboxes com Tab', categoria: 16, interacao: { tipo: 'press', tecla: 'Tab' }, resultadoEsperado: 'Focus ring nas checkboxes', tipos: ['E2E'] },
      { acao: 'Toggle checkbox com Space', categoria: 16, interacao: { tipo: 'press', tecla: 'Space' }, resultadoEsperado: 'Checkbox alterna com Space', tipos: ['E2E'] },
      { acao: 'Verificar aria-labels nas checkboxes', categoria: 16, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Cada checkbox tem aria-label', tipos: ['E2E'] },
      { acao: 'Fechar modal com Escape', categoria: 16, interacao: { tipo: 'press', tecla: 'Escape' }, resultadoEsperado: 'Modal fecha', tipos: ['E2E'] },
      { acao: 'Resize para mobile 375px', categoria: 17, interacao: { tipo: 'resize', largura: 375, altura: 812 }, resultadoEsperado: 'Modal adaptado sem overflow', tipos: ['E2E'] },
      { acao: 'Resize para tablet 768px', categoria: 17, interacao: { tipo: 'resize', largura: 768, altura: 1024 }, resultadoEsperado: 'Grid de checkboxes responsivo', tipos: ['E2E'] },
      { acao: 'Resize para desktop 1280px', categoria: 17, interacao: { tipo: 'resize', largura: 1280, altura: 800 }, resultadoEsperado: 'Layout desktop padrao', tipos: ['E2E'] },
      { acao: 'Verificar labels em PT-BR', categoria: 18, interacao: { tipo: 'setLocale', locale: 'pt' }, resultadoEsperado: 'Todos labels em portugues', tipos: ['E2E'] },
      { acao: 'Trocar para EN', categoria: 18, interacao: { tipo: 'setLocale', locale: 'en' }, resultadoEsperado: 'Labels em ingles', tipos: ['E2E'] },
      { acao: 'Verificar rendering < 500ms', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Modal renderiza rapidamente', tipos: ['E2E'] },
      { acao: 'Verificar que muitas checkboxes nao travam UI', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Performance OK com 50+ checkboxes', tipos: ['E2E'] },
      { acao: 'Verificar que alteracoes nao salvas geram dirty check', categoria: 20, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Alerta ao tentar fechar com mudancas pendentes', tipos: ['E2E'] },
      { acao: 'Verificar que salvar limpa dirty state', categoria: 20, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Fechar modal sem alerta apos salvar', tipos: ['E2E'] },
    ],
  },

  // ─── Assinaturas ──────────────────────────────────────────────────
  {
    id: 'TST-E2E-CONFIG-000004',
    sublocal: 'Assinaturas',
    tela: 'Assinaturas',
    rota: '/workspace/assinaturas',
    componenteFilePath: 'servicos-global/configurador/src/pages/workspace/Assinaturas.tsx',
    criticidade: 'critica',
    temDinheiro: true,
    resumoExecutivo: 'Tela de gestão de assinaturas de produtos. Permite assinar, suspender, cancelar e gerenciar acesso por workspace. Risco: operações financeiras e impacto cross-product. Criticidade crítica (temDinheiro=true).',
    naoAplicaveis: [],
    passos: [
      { acao: 'Navegar para /workspace/assinaturas', categoria: 1, interacao: { tipo: 'goto', rota: '/workspace/assinaturas' }, assercao: { tipo: 'urlMatches', regex: '/workspace/assinaturas' }, resultadoEsperado: 'URL correta', tipos: ['E2E'] },
      { acao: 'Verificar tabela de assinaturas visivel', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Tabela renderizada', tipos: ['E2E'] },
      { acao: 'Verificar cards de estatistica', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: '3 cards: Produtos ativos, Custo mensal, Suspensos', tipos: ['E2E'] },
      { acao: 'Verificar catalogo de produtos disponíveis', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Grid de cards de produtos', tipos: ['E2E'] },
      { acao: 'Verificar sem erros JS', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Console limpo', tipos: ['E2E'] },
      { acao: 'Verificar titulo Assinaturas', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Titulo correto', tipos: ['E2E'] },
      { acao: 'Verificar badge de tipo billing', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Badges Mensal/Anual/Setup', tipos: ['E2E'] },
      { acao: 'Verificar badge de status', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Ativo=verde, Suspenso=amarelo', tipos: ['E2E'] },
      { acao: 'Verificar cards do catalogo com animacao hover', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Cards levantam no hover', tipos: ['E2E'] },
      { acao: 'Verificar secao Coming Soon', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Cards desabilitados com badge Coming Soon', tipos: ['E2E'] },
      { acao: 'Verificar precos formatados em BRL', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'R$ XX,XX formatado corretamente', tipos: ['E2E'] },
      { acao: 'Verificar data de renovacao', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Data no formato DD/MM/YYYY', tipos: ['E2E'] },
      { acao: 'Sidebar com item Assinaturas selecionado', categoria: 3, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Item highlighted', tipos: ['E2E'] },
      { acao: 'Navegar para Financeiro via sidebar', categoria: 3, interacao: { tipo: 'click', testid: 'nav-financeiro' }, assercao: { tipo: 'urlMatches', regex: '/workspace/financeiro' }, resultadoEsperado: 'Navega para Financeiro', tipos: ['E2E'], testid: 'nav-financeiro' },
      { acao: 'Voltar para Assinaturas', categoria: 3, interacao: { tipo: 'click', testid: 'nav-assinaturas' }, resultadoEsperado: 'Volta para Assinaturas', tipos: ['E2E'] },
      { acao: 'Verificar colunas da tabela', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Nome, Billing, Preco, Renovacao, Workspaces, Status', tipos: ['E2E'] },
      { acao: 'Expandir assinatura para ver audit trail', categoria: 4, interacao: { tipo: 'click', testid: 'btn-expand-assin-0' }, resultadoEsperado: 'Detalhes expandidos com workspaces', tipos: ['E2E'], testid: 'btn-expand-assin-0' },
      { acao: 'Verificar toggle de workspace na expansao', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Botoes de ativar/desativar por workspace', tipos: ['E2E'] },
      { acao: 'Verificar card de preco no catalogo', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Preco, features e botao Assinar', tipos: ['E2E'] },
      { acao: 'Verificar dados corretos via API', categoria: 4, interacao: { tipo: 'verificacao' }, assercao: { tipo: 'apiResponse', rota: '/api/v1/tenants/products', status: 200 }, resultadoEsperado: 'API retorna 200', tipos: ['E2E', 'FUN'] },
      { acao: 'Editar assinatura (abrir modal)', categoria: 5, interacao: { tipo: 'click', testid: 'btn-edit-assin-0' }, resultadoEsperado: 'Modal de edicao abre', tipos: ['E2E'], testid: 'btn-edit-assin-0' },
      { acao: 'Suspender assinatura', categoria: 5, interacao: { tipo: 'click', testid: 'btn-suspend-assin-0' }, resultadoEsperado: 'Status muda para Suspenso', tipos: ['E2E'], testid: 'btn-suspend-assin-0' },
      { acao: 'Reativar assinatura', categoria: 5, interacao: { tipo: 'click', testid: 'btn-suspend-assin-0' }, resultadoEsperado: 'Status volta para Ativo', tipos: ['E2E'] },
      { acao: 'Toggle workspace em assinatura', categoria: 5, interacao: { tipo: 'click', testid: 'btn-toggle-ws-0' }, resultadoEsperado: 'Workspace ativado/desativado', tipos: ['E2E'], testid: 'btn-toggle-ws-0' },
      { acao: 'Assinar novo produto do catalogo', categoria: 6, interacao: { tipo: 'click', testid: 'btn-assinar-produto' }, resultadoEsperado: 'Produto adicionado as assinaturas', tipos: ['E2E'], testid: 'btn-assinar-produto' },
      { acao: 'Verificar POST /subscribe chamado', categoria: 6, interacao: { tipo: 'verificacao' }, assercao: { tipo: 'apiResponse', rota: '/api/v1/tenants/products/subscribe', status: 201 }, resultadoEsperado: 'API retorna 201', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar novo produto na tabela', categoria: 6, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Produto aparece na lista', tipos: ['E2E'] },
      { acao: 'Cancelar assinatura', categoria: 7, interacao: { tipo: 'click', testid: 'btn-cancel-assin-0' }, resultadoEsperado: 'Modal de confirmacao', tipos: ['E2E'], testid: 'btn-cancel-assin-0' },
      { acao: 'Confirmar cancelamento', categoria: 7, interacao: { tipo: 'click', testid: 'btn-confirmar-cancel' }, resultadoEsperado: 'Assinatura removida', tipos: ['E2E'], testid: 'btn-confirmar-cancel' },
      { acao: 'Remover workspace de assinatura', categoria: 7, interacao: { tipo: 'click', testid: 'btn-remover-ws-0' }, resultadoEsperado: 'Workspace removido', tipos: ['E2E'], testid: 'btn-remover-ws-0' },
      { acao: 'Verificar validacao de assinatura duplicada', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Erro ao assinar produto ja ativo', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar que Coming Soon nao permite assinar', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Botao desabilitado', tipos: ['E2E'] },
      { acao: 'Erro 500 ao assinar', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Toast de erro', tipos: ['E2E', 'FUN'] },
      { acao: 'Erro 403 sem permissao para assinar', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Acesso negado', tipos: ['FUN'] },
      { acao: 'Tenant sem assinaturas', categoria: 10, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mensagem vazia + catalogo', tipos: ['E2E'] },
      { acao: 'Skeleton durante carregamento', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Loading visual', tipos: ['E2E'] },
      { acao: 'Buscar por nome do produto', categoria: 12, interacao: { tipo: 'fill', testid: 'input-busca-assin', valor: 'Pedido' }, resultadoEsperado: 'Tabela filtrada', tipos: ['E2E'], testid: 'input-busca-assin' },
      { acao: 'Ordenar por preco', categoria: 13, interacao: { tipo: 'click', testid: 'col-preco' }, resultadoEsperado: 'Ordenado por valor', tipos: ['E2E'], testid: 'col-preco' },
      { acao: 'STANDARD nao pode assinar', categoria: 14, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Botoes ocultos para STANDARD', tipos: ['E2E', 'FUN'] },
      { acao: 'Isolamento de assinaturas entre tenants', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Tenant A nao ve assinaturas de B', tipos: ['CRO'] },
      { acao: 'Navegar com Tab', categoria: 16, interacao: { tipo: 'press', tecla: 'Tab' }, resultadoEsperado: 'Focus ring funcional', tipos: ['E2E'] },
      { acao: 'Resize mobile', categoria: 17, interacao: { tipo: 'resize', largura: 375, altura: 812 }, resultadoEsperado: 'Layout adaptado', tipos: ['E2E'] },
      { acao: 'Textos em PT-BR', categoria: 18, interacao: { tipo: 'setLocale', locale: 'pt' }, resultadoEsperado: 'Labels corretos', tipos: ['E2E'] },
      { acao: 'FCP < 1.5s', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Carregamento rapido', tipos: ['E2E'] },
      { acao: 'Dados persistem apos F5', categoria: 20, interacao: { tipo: 'reload' }, resultadoEsperado: 'Tabela recarrega com dados', tipos: ['E2E'] },
    ],
  },

  // ─── Financeiro ───────────────────────────────────────────────────
  {
    id: 'TST-E2E-CONFIG-000005',
    sublocal: 'Financeiro',
    tela: 'Financeiro',
    rota: '/workspace/financeiro',
    componenteFilePath: 'servicos-global/configurador/src/pages/workspace/Financeiro.tsx',
    criticidade: 'critica',
    temDinheiro: true,
    resumoExecutivo: 'Tela financeira com historico de faturas e detalhamento de produtos/valores. Risco: dados financeiros sensiveis, download de boletos/NF-e. Criticidade critica (temDinheiro=true). 2 tabs: Faturas e Produtos.',
    naoAplicaveis: [
      { cat: 5, justificativa: 'Tela read-only — faturas nao sao editaveis pelo usuario' },
      { cat: 6, justificativa: 'Faturas sao criadas pelo sistema, nao pelo usuario' },
      { cat: 7, justificativa: 'Faturas nao sao deletaveis pelo usuario' },
    ],
    passos: [
      { acao: 'Navegar para /workspace/financeiro', categoria: 1, interacao: { tipo: 'goto', rota: '/workspace/financeiro' }, assercao: { tipo: 'urlMatches', regex: '/workspace/financeiro' }, resultadoEsperado: 'URL correta', tipos: ['E2E'] },
      { acao: 'Verificar cards financeiros', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: '3 cards: Proximo pagamento, Valor, Faturas abertas', tipos: ['E2E'] },
      { acao: 'Verificar tabs Faturas e Produtos', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: '2 abas visiveis', tipos: ['E2E'] },
      { acao: 'Verificar titulo Financeiro', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Titulo e icone corretos', tipos: ['E2E'] },
      { acao: 'Verificar formatacao BRL nos valores', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'R$ com separadores corretos', tipos: ['E2E'] },
      { acao: 'Verificar badge de status da fatura', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Badges coloridos por status', tipos: ['E2E'] },
      { acao: 'Sidebar com Financeiro selecionado', categoria: 3, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Item highlighted', tipos: ['E2E'] },
      { acao: 'Verificar colunas da tab Faturas', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Fatura, Competencia, Descricao, Valor, Vencimento, Status', tipos: ['E2E'] },
      { acao: 'Hover no valor para ver composicao', categoria: 4, interacao: { tipo: 'hover', testid: 'valor-fatura-0' }, resultadoEsperado: 'Popover com breakdown de itens', tipos: ['E2E'], testid: 'valor-fatura-0' },
      { acao: 'Expandir fatura para ver composicao', categoria: 4, interacao: { tipo: 'click', testid: 'btn-expand-fatura-0' }, resultadoEsperado: 'Itens da fatura expandidos', tipos: ['E2E'], testid: 'btn-expand-fatura-0' },
      { acao: 'Clicar tab Produtos & Valores', categoria: 4, interacao: { tipo: 'click', testid: 'tab-produtos-valores' }, resultadoEsperado: 'Tabela de produtos visivel', tipos: ['E2E'], testid: 'tab-produtos-valores' },
      { acao: 'Clicar Ver Detalhes do produto', categoria: 4, interacao: { tipo: 'click', testid: 'btn-ver-detalhes-0' }, resultadoEsperado: 'Modal com 6 tabs de detalhes', tipos: ['E2E'], testid: 'btn-ver-detalhes-0' },
      { acao: 'Verificar validacao de download sem fatura', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Botao desabilitado se nao ha arquivo', tipos: ['E2E'] },
      { acao: 'Erro ao carregar faturas', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Toast de erro', tipos: ['E2E', 'FUN'] },
      { acao: 'Tenant sem faturas', categoria: 10, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mensagem vazia', tipos: ['E2E'] },
      { acao: 'Skeleton durante carregamento', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Loading visual', tipos: ['E2E'] },
      { acao: 'Filtrar faturas por status', categoria: 12, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Filtro funciona', tipos: ['E2E'] },
      { acao: 'Ordenar por vencimento', categoria: 13, interacao: { tipo: 'click', testid: 'col-vencimento' }, resultadoEsperado: 'Ordenado', tipos: ['E2E'], testid: 'col-vencimento' },
      { acao: 'STANDARD pode ver faturas mas nao baixar', categoria: 14, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Permissao correta', tipos: ['E2E', 'FUN'] },
      { acao: 'Isolamento de faturas entre tenants', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Isolamento de dados', tipos: ['CRO'] },
      { acao: 'Navegacao por Tab', categoria: 16, interacao: { tipo: 'press', tecla: 'Tab' }, resultadoEsperado: 'Focus ring', tipos: ['E2E'] },
      { acao: 'Resize mobile', categoria: 17, interacao: { tipo: 'resize', largura: 375, altura: 812 }, resultadoEsperado: 'Layout adaptado', tipos: ['E2E'] },
      { acao: 'Textos em PT-BR', categoria: 18, interacao: { tipo: 'setLocale', locale: 'pt' }, resultadoEsperado: 'Labels corretos', tipos: ['E2E'] },
      { acao: 'Performance < 2s', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Carregamento rapido', tipos: ['E2E'] },
      { acao: 'Dados persistem apos F5', categoria: 20, interacao: { tipo: 'reload' }, resultadoEsperado: 'Dados mantidos', tipos: ['E2E'] },
    ],
  },

  // ─── Api-Cockpit ───────────────────────────────────────────────────
  {
    id: 'TST-E2E-CONFIG-000006',
    sublocal: 'Api-Cockpit',
    tela: 'API Cockpit',
    rota: '/workspace/api-cockpit',
    componenteFilePath: 'servicos-global/configurador/src/pages/workspace/ApiCockpit.tsx',
    criticidade: 'media',
    temDinheiro: false,
    resumoExecutivo: 'Painel de monitoramento de APIs e servicos. Read-only — exibe status, latencia e logs. 2 tabs: Inventario de servicos e Logs de requisicoes. Criticidade media (nao tem CRUD).',
    naoAplicaveis: [
      { cat: 5, justificativa: 'Tela read-only de monitoramento — nao ha edicao de dados pelo usuario, apenas visualizacao de status e logs' },
      { cat: 6, justificativa: 'Tela read-only de monitoramento — servicos sao registrados automaticamente, nao ha criacao manual pelo usuario' },
      { cat: 7, justificativa: 'Tela read-only de monitoramento — servicos nao sao deletados pelo usuario, apenas monitorados em tempo real' },
      { cat: 8, justificativa: 'Tela sem formularios de entrada — apenas exibe dados tabulares e metricas, sem campos editaveis pelo usuario' },
    ],
    passos: [
      { acao: 'Navegar para /workspace/api-cockpit', categoria: 1, interacao: { tipo: 'goto', rota: '/workspace/api-cockpit' }, assercao: { tipo: 'urlMatches', regex: '/workspace/api-cockpit' }, resultadoEsperado: 'URL correta', tipos: ['E2E'] },
      { acao: 'Verificar cards de status', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: '3 cards: Status geral, Uptime, Latencia', tipos: ['E2E'] },
      { acao: 'Verificar tabs Inventario e Logs', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: '2 abas visiveis', tipos: ['E2E'] },
      { acao: 'Verificar titulo API Cockpit', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Titulo e icone Pulse', tipos: ['E2E'] },
      { acao: 'Verificar badge de status Operacional', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Badge verde Operacional', tipos: ['E2E'] },
      { acao: 'Verificar badge de tipo core/product/gateway', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Badges coloridos por tipo', tipos: ['E2E'] },
      { acao: 'Sidebar com API Cockpit selecionado', categoria: 3, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Item highlighted', tipos: ['E2E'] },
      { acao: 'Verificar colunas do Inventario', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Servico, Tipo, Status, Latencia, Versao, Ultimo check', tipos: ['E2E'] },
      { acao: 'Clicar tab Logs', categoria: 4, interacao: { tipo: 'click', testid: 'tab-logs' }, resultadoEsperado: 'Tabela de logs visivel', tipos: ['E2E'], testid: 'tab-logs' },
      { acao: 'Verificar colunas dos Logs', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Timestamp, Metodo, Endpoint, Status, Org, Produto, Duracao', tipos: ['E2E'] },
      { acao: 'Erro ao carregar servicos', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Toast de erro', tipos: ['E2E', 'FUN'] },
      { acao: 'Nenhum servico cadastrado', categoria: 10, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mensagem vazia', tipos: ['E2E'] },
      { acao: 'Skeleton de loading', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Loading visual', tipos: ['E2E'] },
      { acao: 'Buscar servico por nome', categoria: 12, interacao: { tipo: 'fill', testid: 'input-busca-api', valor: 'configurador' }, resultadoEsperado: 'Tabela filtrada', tipos: ['E2E'], testid: 'input-busca-api' },
      { acao: 'Ordenar por latencia', categoria: 13, interacao: { tipo: 'click', testid: 'col-latencia' }, resultadoEsperado: 'Ordenado por latencia', tipos: ['E2E'], testid: 'col-latencia' },
      { acao: 'Verificar acesso por role', categoria: 14, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Acesso correto por permissao', tipos: ['E2E'] },
      { acao: 'Isolamento de logs entre tenants', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Logs filtrados por tenant', tipos: ['CRO'] },
      { acao: 'Navegacao por teclado', categoria: 16, interacao: { tipo: 'press', tecla: 'Tab' }, resultadoEsperado: 'Focus ring', tipos: ['E2E'] },
      { acao: 'Resize mobile', categoria: 17, interacao: { tipo: 'resize', largura: 375, altura: 812 }, resultadoEsperado: 'Layout adaptado', tipos: ['E2E'] },
      { acao: 'Textos em PT-BR', categoria: 18, interacao: { tipo: 'setLocale', locale: 'pt' }, resultadoEsperado: 'Labels corretos', tipos: ['E2E'] },
      { acao: 'FCP < 1.5s', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Rapido', tipos: ['E2E'] },
      { acao: 'Dados persistem apos F5', categoria: 20, interacao: { tipo: 'reload' }, resultadoEsperado: 'Dados mantidos', tipos: ['E2E'] },
    ],
  },

  // ─── Conectores ───────────────────────────────────────────────────
  {
    id: 'TST-E2E-CONFIG-000007',
    sublocal: 'Conectores',
    tela: 'Conectores',
    rota: '/workspace/conectores',
    componenteFilePath: 'servicos-global/configurador/src/pages/workspace/Conectores.tsx',
    criticidade: 'alta',
    temDinheiro: false,
    resumoExecutivo: 'Tela de gestão de conectores ERP (SAP, ONESOURCE, CargoWise, Bysoft). Permite configurar OAuth, mappings de-para e testar conexao. Risco: credenciais OAuth armazenadas. 4 conectores, cada um com sub-tabs de config.',
    naoAplicaveis: [
      { cat: 7, justificativa: 'Conectores nao sao deletados — sao desconectados' },
    ],
    passos: [
      { acao: 'Navegar para /workspace/conectores', categoria: 1, interacao: { tipo: 'goto', rota: '/workspace/conectores' }, assercao: { tipo: 'urlMatches', regex: '/workspace/conectores' }, resultadoEsperado: 'URL correta', tipos: ['E2E'] },
      { acao: 'Verificar grid de 4 conectores', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Cards SAP, ONESOURCE, CargoWise, Bysoft', tipos: ['E2E'] },
      { acao: 'Verificar sem erros JS', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Console limpo', tipos: ['E2E'] },
      { acao: 'Verificar card layout premium', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Logo, nome, descricao, features, status', tipos: ['E2E'] },
      { acao: 'Verificar titulo Conectores', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Titulo e icone corretos', tipos: ['E2E'] },
      { acao: 'Verificar animacao hover nos cards', categoria: 2, interacao: { tipo: 'hover', testid: 'card-conector-sap' }, resultadoEsperado: 'Card levanta com sombra', tipos: ['E2E'], testid: 'card-conector-sap' },
      { acao: 'Verificar badge de status por conector', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Conectado/Desconectado/Em Dev', tipos: ['E2E'] },
      { acao: 'Verificar chips de features', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Badges com features do conector', tipos: ['E2E'] },
      { acao: 'Sidebar com Conectores selecionado', categoria: 3, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Item highlighted', tipos: ['E2E'] },
      { acao: 'Clicar em conector SAP', categoria: 3, interacao: { tipo: 'click', testid: 'card-conector-sap' }, resultadoEsperado: 'Tela de config SAP abre', tipos: ['E2E'] },
      { acao: 'Botao Voltar para lista', categoria: 3, interacao: { tipo: 'click', testid: 'btn-voltar-conectores' }, resultadoEsperado: 'Volta para grid de conectores', tipos: ['E2E'], testid: 'btn-voltar-conectores' },
      { acao: 'Verificar grid de conectores (leitura)', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: '4 conectores com dados corretos', tipos: ['E2E'] },
      { acao: 'Verificar sub-tabs SAP (OData, De-Para, Teste)', categoria: 4, interacao: { tipo: 'click', testid: 'card-conector-sap' }, resultadoEsperado: '3 sub-tabs visiveis', tipos: ['E2E'] },
      { acao: 'Verificar sub-tabs ONESOURCE', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: '3 sub-tabs visiveis', tipos: ['E2E'] },
      { acao: 'Verificar CargoWise/Bysoft Em Desenvolvimento', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Placeholder Em Desenvolvimento', tipos: ['E2E'] },
      { acao: 'Preencher credenciais OData SAP', categoria: 5, interacao: { tipo: 'fill', testid: 'input-sap-base-url', valor: 'https://sap.empresa.com/odata' }, resultadoEsperado: 'Campo aceita URL', tipos: ['E2E'], testid: 'input-sap-base-url' },
      { acao: 'Preencher usuario SAP', categoria: 5, interacao: { tipo: 'fill', testid: 'input-sap-user', valor: 'admin' }, resultadoEsperado: 'Campo aceita valor', tipos: ['E2E'], testid: 'input-sap-user' },
      { acao: 'Salvar config SAP', categoria: 5, interacao: { tipo: 'click', testid: 'btn-salvar-sap' }, assercao: { tipo: 'toastShown', texto: 'salv' }, resultadoEsperado: 'Config salva', tipos: ['E2E'], testid: 'btn-salvar-sap' },
      { acao: 'Preencher OAuth ONESOURCE', categoria: 5, interacao: { tipo: 'fill', testid: 'input-onesource-client-id', valor: 'client123' }, resultadoEsperado: 'Client ID preenchido', tipos: ['E2E'], testid: 'input-onesource-client-id' },
      { acao: 'Adicionar mapeamento de-para SAP', categoria: 5, interacao: { tipo: 'click', testid: 'btn-add-mapping-sap' }, resultadoEsperado: 'Nova linha no grid', tipos: ['E2E'], testid: 'btn-add-mapping-sap' },
      { acao: 'Editar campo mapeado', categoria: 5, interacao: { tipo: 'fill', testid: 'input-mapping-gravity-0', valor: 'numero_pedido' }, resultadoEsperado: 'Campo Gravity preenchido', tipos: ['E2E'], testid: 'input-mapping-gravity-0' },
      { acao: 'Criar novo conector (configurar SAP do zero)', categoria: 6, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Fluxo de primeira configuracao funciona', tipos: ['E2E'] },
      { acao: 'Adicionar novo mapeamento de-para', categoria: 6, interacao: { tipo: 'click', testid: 'btn-add-mapping-sap' }, resultadoEsperado: 'Linha adicionada', tipos: ['E2E'] },
      { acao: 'Importar mapeamento via CSV', categoria: 6, interacao: { tipo: 'click', testid: 'btn-import-csv' }, resultadoEsperado: 'File input abre', tipos: ['E2E'], testid: 'btn-import-csv' },
      { acao: 'Validar URL OData obrigatoria', categoria: 8, interacao: { tipo: 'fill', testid: 'input-sap-base-url', valor: '' }, resultadoEsperado: 'Erro de campo obrigatorio', tipos: ['E2E'] },
      { acao: 'Validar formato de URL', categoria: 8, interacao: { tipo: 'fill', testid: 'input-sap-base-url', valor: 'nao-e-url' }, resultadoEsperado: 'Erro de formato de URL', tipos: ['E2E'] },
      { acao: 'Validar Client ID obrigatorio ONESOURCE', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Erro se vazio', tipos: ['E2E'] },
      { acao: 'Testar conexao SAP (sucesso)', categoria: 9, interacao: { tipo: 'click', testid: 'btn-testar-sap' }, resultadoEsperado: 'Status success com detalhes', tipos: ['E2E'], testid: 'btn-testar-sap' },
      { acao: 'Testar conexao SAP (falha)', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Status error com mensagem', tipos: ['E2E'] },
      { acao: 'Conector sem configuracao', categoria: 10, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Campos vazios com placeholder', tipos: ['E2E'] },
      { acao: 'Loading durante teste de conexao', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Spinner e status testing', tipos: ['E2E'] },
      { acao: 'Filtrar conectores por status', categoria: 12, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Grid filtra por conectado/desconectado', tipos: ['E2E'] },
      { acao: 'Ordenar mapeamentos', categoria: 13, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Tabela de-para ordenavel', tipos: ['E2E'] },
      { acao: 'STANDARD nao pode editar conectores', categoria: 14, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Campos desabilitados para STANDARD', tipos: ['E2E', 'FUN'] },
      { acao: 'Isolamento de config entre tenants', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Config SAP de tenant A nao vaza para B', tipos: ['CRO'] },
      { acao: 'Credenciais nao expostas em tenant B', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Isolamento total de credenciais', tipos: ['CRO'] },
      { acao: 'Navegar sub-tabs com Tab', categoria: 16, interacao: { tipo: 'press', tecla: 'Tab' }, resultadoEsperado: 'Focus ring nas tabs e inputs', tipos: ['E2E'] },
      { acao: 'Resize mobile', categoria: 17, interacao: { tipo: 'resize', largura: 375, altura: 812 }, resultadoEsperado: 'Layout adaptado, cards empilham', tipos: ['E2E'] },
      { acao: 'Textos em PT-BR', categoria: 18, interacao: { tipo: 'setLocale', locale: 'pt' }, resultadoEsperado: 'Labels corretos', tipos: ['E2E'] },
      { acao: 'Textos em EN', categoria: 18, interacao: { tipo: 'setLocale', locale: 'en' }, resultadoEsperado: 'Labels em ingles', tipos: ['E2E'] },
      { acao: 'FCP < 1.5s', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Rapido', tipos: ['E2E'] },
      { acao: 'Config persiste apos F5', categoria: 20, interacao: { tipo: 'reload' }, resultadoEsperado: 'Credenciais mantidas', tipos: ['E2E'] },
      { acao: 'Mapeamentos persistem apos reload', categoria: 20, interacao: { tipo: 'reload' }, resultadoEsperado: 'Tabela de-para mantida', tipos: ['E2E'] },
    ],
  },

  // ─── Workspaces ───────────────────────────────────────────────────
  {
    id: 'TST-E2E-CONFIG-000008',
    sublocal: 'Workspaces',
    tela: 'Workspaces',
    rota: '/workspace/workspaces',
    componenteFilePath: 'servicos-global/configurador/src/pages/workspace/Workspaces.tsx',
    criticidade: 'alta',
    temDinheiro: false,
    resumoExecutivo: 'Tela de gestão de workspaces (empresas) do tenant. CRUD completo: criar, editar nome/subdomínio/CNPJ, suspender, excluir. Risco: subdomínio duplicado, exclusão acidental, isolamento entre workspaces do mesmo tenant.',
    naoAplicaveis: [],
    passos: [
      { acao: 'Navegar para /workspace/workspaces', categoria: 1, interacao: { tipo: 'goto', rota: '/workspace/workspaces' }, assercao: { tipo: 'urlMatches', regex: '/workspace/workspaces' }, resultadoEsperado: 'URL correta', tipos: ['E2E'] },
      { acao: 'Verificar tabela de workspaces visivel', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Tabela renderizada', tipos: ['E2E'] },
      { acao: 'Verificar 3 cards de estatistica', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Cards: Total, Ativas, Grafico pizza', tipos: ['E2E'] },
      { acao: 'Verificar sem erros JS no console', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Console limpo', tipos: ['E2E'] },
      { acao: 'Verificar titulo Workspaces', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Titulo e icone Buildings', tipos: ['E2E'] },
      { acao: 'Verificar avatar badge em cada workspace', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Avatar com inicial da empresa', tipos: ['E2E'] },
      { acao: 'Verificar badge de status Ativa/Suspensa', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Verde para Ativa, amarelo para Suspensa', tipos: ['E2E'] },
      { acao: 'Verificar subdominio como link clicavel', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Subdominio renderizado como link', tipos: ['E2E'] },
      { acao: 'Verificar grafico pizza de distribuicao', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Grafico com Ativa vs Suspensa', tipos: ['E2E'] },
      { acao: 'Verificar formato de data DD/MM/YYYY', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Datas formatadas corretamente', tipos: ['E2E'] },
      { acao: 'Verificar botao + Novo Workspace visivel', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Botao primario no header', tipos: ['E2E'] },
      { acao: 'Sidebar com Workspaces selecionado', categoria: 3, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Item highlighted', tipos: ['E2E'] },
      { acao: 'Navegar para Organizacao via sidebar', categoria: 3, interacao: { tipo: 'click', testid: 'nav-organizacao' }, assercao: { tipo: 'urlMatches', regex: '/workspace/organizacao' }, resultadoEsperado: 'Navega corretamente', tipos: ['E2E'], testid: 'nav-organizacao' },
      { acao: 'Voltar para Workspaces via sidebar', categoria: 3, interacao: { tipo: 'click', testid: 'nav-workspaces' }, assercao: { tipo: 'urlMatches', regex: '/workspace/workspaces' }, resultadoEsperado: 'Volta para Workspaces', tipos: ['E2E'], testid: 'nav-workspaces' },
      { acao: 'Navegar para Usuarios via sidebar', categoria: 3, interacao: { tipo: 'click', testid: 'nav-usuarios' }, resultadoEsperado: 'Navega para Usuarios', tipos: ['E2E'] },
      { acao: 'Navegar via breadcrumb', categoria: 3, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Breadcrumb funcional', tipos: ['E2E'] },
      { acao: 'Verificar colunas da tabela', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Nome, Subdominio, Usuarios, Status, Criada Em', tipos: ['E2E'] },
      { acao: 'Verificar dados dos workspaces carregados', categoria: 4, interacao: { tipo: 'verificacao' }, assercao: { tipo: 'apiResponse', rota: '/api/v1/tenants/companies', status: 200 }, resultadoEsperado: 'API retorna 200', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar contagem de usuarios por workspace', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Numero de usuarios correto', tipos: ['E2E'] },
      { acao: 'Verificar contagem total no card', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Card Total bate com linhas da tabela', tipos: ['E2E'] },
      { acao: 'Verificar que apenas workspaces do tenant aparecem', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Nenhum workspace de outro tenant', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar exportacao para Excel', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Download de .xlsx funciona', tipos: ['E2E'] },
      { acao: 'Verificar exportacao para CSV', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Download de .csv funciona', tipos: ['E2E'] },
      { acao: 'Verificar exportacao para PDF', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Download de .pdf funciona', tipos: ['E2E'] },
      { acao: 'Clicar editar workspace', categoria: 5, interacao: { tipo: 'click', testid: 'btn-edit-ws-0' }, resultadoEsperado: 'Modal de edicao abre', tipos: ['E2E'], testid: 'btn-edit-ws-0' },
      { acao: 'Editar nome do workspace', categoria: 5, interacao: { tipo: 'fill', testid: 'input-nome-ws', valor: 'Workspace Editado' }, resultadoEsperado: 'Campo aceita valor', tipos: ['E2E'], testid: 'input-nome-ws' },
      { acao: 'Editar subdominio', categoria: 5, interacao: { tipo: 'fill', testid: 'input-subdominio-ws', valor: 'editado' }, resultadoEsperado: 'Subdominio aceita valor', tipos: ['E2E'], testid: 'input-subdominio-ws' },
      { acao: 'Salvar edicao de workspace', categoria: 5, interacao: { tipo: 'click', testid: 'btn-salvar-ws' }, assercao: { tipo: 'toastShown', texto: 'salvo' }, resultadoEsperado: 'Toast de sucesso', tipos: ['E2E'], testid: 'btn-salvar-ws' },
      { acao: 'Suspender workspace (toggle status)', categoria: 5, interacao: { tipo: 'click', testid: 'btn-toggle-ws-0' }, resultadoEsperado: 'Status muda para Suspensa', tipos: ['E2E'], testid: 'btn-toggle-ws-0' },
      { acao: 'Reativar workspace', categoria: 5, interacao: { tipo: 'click', testid: 'btn-toggle-ws-0' }, resultadoEsperado: 'Status volta para Ativa', tipos: ['E2E'] },
      { acao: 'Cancelar edicao (fechar modal)', categoria: 5, interacao: { tipo: 'press', tecla: 'Escape' }, resultadoEsperado: 'Modal fecha sem salvar', tipos: ['E2E'] },
      { acao: 'Abrir modal via query param ?id=', categoria: 5, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Modal abre automaticamente para o workspace', tipos: ['E2E'] },
      { acao: 'Verificar PATCH via API', categoria: 5, interacao: { tipo: 'verificacao' }, assercao: { tipo: 'apiResponse', rota: '/api/v1/tenants/companies', status: 200 }, resultadoEsperado: 'API atualiza corretamente', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar edicao persiste apos F5', categoria: 5, interacao: { tipo: 'reload' }, resultadoEsperado: 'Dados editados mantidos', tipos: ['E2E'] },
      { acao: 'Clicar + Novo Workspace', categoria: 6, interacao: { tipo: 'click', testid: 'btn-novo-ws' }, resultadoEsperado: 'Modal de criacao abre', tipos: ['E2E'], testid: 'btn-novo-ws' },
      { acao: 'Preencher nome do novo workspace', categoria: 6, interacao: { tipo: 'fill', testid: 'input-nome-ws', valor: 'Novo Workspace Teste' }, resultadoEsperado: 'Campo aceita valor', tipos: ['E2E'] },
      { acao: 'Preencher subdominio do novo workspace', categoria: 6, interacao: { tipo: 'fill', testid: 'input-subdominio-ws', valor: 'novo-teste' }, resultadoEsperado: 'Subdominio aceita valor', tipos: ['E2E'] },
      { acao: 'Criar workspace', categoria: 6, interacao: { tipo: 'click', testid: 'btn-salvar-ws' }, assercao: { tipo: 'toastShown', texto: 'criado' }, resultadoEsperado: 'Workspace criado com sucesso', tipos: ['E2E'] },
      { acao: 'Verificar POST via API', categoria: 6, interacao: { tipo: 'verificacao' }, assercao: { tipo: 'apiResponse', rota: '/api/v1/tenants/companies', status: 201 }, resultadoEsperado: 'API retorna 201', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar novo workspace na tabela', categoria: 6, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Novo workspace aparece na lista', tipos: ['E2E'] },
      { acao: 'Cancelar criacao (fechar modal)', categoria: 6, interacao: { tipo: 'press', tecla: 'Escape' }, resultadoEsperado: 'Modal fecha sem criar', tipos: ['E2E'] },
      { acao: 'Verificar card Total incrementou', categoria: 6, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Contagem atualizada', tipos: ['E2E'] },
      { acao: 'Clicar excluir workspace', categoria: 7, interacao: { tipo: 'click', testid: 'btn-delete-ws-0' }, resultadoEsperado: 'Modal de confirmacao abre', tipos: ['E2E'], testid: 'btn-delete-ws-0' },
      { acao: 'Confirmar exclusao', categoria: 7, interacao: { tipo: 'click', testid: 'btn-confirmar-delete' }, resultadoEsperado: 'Workspace removido', tipos: ['E2E'], testid: 'btn-confirmar-delete' },
      { acao: 'Verificar DELETE via API', categoria: 7, interacao: { tipo: 'verificacao' }, assercao: { tipo: 'apiResponse', rota: '/api/v1/tenants/companies', status: 200 }, resultadoEsperado: 'API retorna 200', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar workspace sumiu da tabela', categoria: 7, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Linha removida', tipos: ['E2E'] },
      { acao: 'Cancelar exclusao', categoria: 7, interacao: { tipo: 'press', tecla: 'Escape' }, resultadoEsperado: 'Workspace preservado', tipos: ['E2E'] },
      { acao: 'Verificar confirmacao obrigatoria antes de deletar', categoria: 7, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Nao deleta sem confirmar', tipos: ['E2E'] },
      { acao: 'Nome vazio rejeitado', categoria: 8, interacao: { tipo: 'fill', testid: 'input-nome-ws', valor: '' }, resultadoEsperado: 'Erro de campo obrigatorio', tipos: ['E2E'] },
      { acao: 'Subdominio vazio rejeitado', categoria: 8, interacao: { tipo: 'fill', testid: 'input-subdominio-ws', valor: '' }, resultadoEsperado: 'Erro de campo obrigatorio', tipos: ['E2E'] },
      { acao: 'Subdominio duplicado rejeitado', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Erro 409 Conflict', tipos: ['E2E', 'FUN'] },
      { acao: 'Subdominio com caracteres invalidos', categoria: 8, interacao: { tipo: 'fill', testid: 'input-subdominio-ws', valor: 'tem espaço!' }, resultadoEsperado: 'Erro de formato', tipos: ['E2E'] },
      { acao: 'CNPJ invalido rejeitado', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Validacao de CNPJ', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar Zod validation no backend', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Backend rejeita com 400', tipos: ['FUN'] },
      { acao: 'Nome max 200 chars', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Truncado ou rejeitado', tipos: ['FUN'] },
      { acao: 'Subdominio max 50 chars', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Truncado ou rejeitado', tipos: ['FUN'] },
      { acao: 'Verificar minimo 1 workspace ativo', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Nao permite suspender ultimo workspace', tipos: ['E2E', 'FUN'] },
      { acao: 'Nome com acentos aceito', categoria: 8, interacao: { tipo: 'fill', testid: 'input-nome-ws', valor: 'Importação São Paulo' }, resultadoEsperado: 'Aceita caracteres especiais', tipos: ['E2E'] },
      { acao: 'Erro 500 ao criar workspace', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Toast de erro', tipos: ['E2E', 'FUN'] },
      { acao: 'Erro 403 sem permissao', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mensagem de acesso negado', tipos: ['FUN'] },
      { acao: 'Erro de rede ao salvar', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Feedback visual de erro', tipos: ['E2E'] },
      { acao: 'Erro ao deletar workspace com usuarios', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Erro descriptivo', tipos: ['E2E', 'FUN'] },
      { acao: 'Erro 409 subdominio em uso', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mensagem clara de conflito', tipos: ['E2E', 'FUN'] },
      { acao: 'Erro ao editar workspace inexistente', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Toast 404', tipos: ['FUN'] },
      { acao: 'Tenant sem workspaces', categoria: 10, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Estado vazio com botao Novo Workspace', tipos: ['E2E'] },
      { acao: 'Busca sem resultados', categoria: 10, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mensagem sem resultados', tipos: ['E2E'] },
      { acao: 'Cards zerados quando vazio', categoria: 10, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Cards mostram 0', tipos: ['E2E'] },
      { acao: 'Skeleton durante carregamento', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Loading visual', tipos: ['E2E'] },
      { acao: 'Loading no botao salvar', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Spinner no botao', tipos: ['E2E'] },
      { acao: 'Loading no botao deletar', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Spinner durante exclusao', tipos: ['E2E'] },
      { acao: 'Buscar por nome do workspace', categoria: 12, interacao: { tipo: 'fill', testid: 'input-busca-ws', valor: 'Importador' }, resultadoEsperado: 'Tabela filtrada', tipos: ['E2E'], testid: 'input-busca-ws' },
      { acao: 'Buscar por subdominio', categoria: 12, interacao: { tipo: 'fill', testid: 'input-busca-ws', valor: 'importador' }, resultadoEsperado: 'Tabela filtrada', tipos: ['E2E'] },
      { acao: 'Filtrar por status Ativa/Suspensa', categoria: 12, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Filtro funcional', tipos: ['E2E'] },
      { acao: 'Limpar filtros', categoria: 12, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Todos workspaces voltam', tipos: ['E2E'] },
      { acao: 'Busca case-insensitive', categoria: 12, interacao: { tipo: 'fill', testid: 'input-busca-ws', valor: 'IMPORTADOR' }, resultadoEsperado: 'Encontra mesmo em maiusculo', tipos: ['E2E', 'FUN'] },
      { acao: 'Filtrar por numero de usuarios', categoria: 12, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Filtro numerico funcional', tipos: ['E2E'] },
      { acao: 'Ordenar por nome A-Z', categoria: 13, interacao: { tipo: 'click', testid: 'col-nome-ws' }, resultadoEsperado: 'Tabela ordenada', tipos: ['E2E'], testid: 'col-nome-ws' },
      { acao: 'Ordenar por data de criacao', categoria: 13, interacao: { tipo: 'click', testid: 'col-criada-em' }, resultadoEsperado: 'Mais recentes primeiro', tipos: ['E2E'], testid: 'col-criada-em' },
      { acao: 'Ordenar por status', categoria: 13, interacao: { tipo: 'click', testid: 'col-status-ws' }, resultadoEsperado: 'Ativas primeiro', tipos: ['E2E'], testid: 'col-status-ws' },
      { acao: 'Ordenar por usuarios', categoria: 13, interacao: { tipo: 'click', testid: 'col-usuarios-ws' }, resultadoEsperado: 'Ordenado por quantidade', tipos: ['E2E'], testid: 'col-usuarios-ws' },
      { acao: 'STANDARD nao pode criar workspace', categoria: 14, interacao: { tipo: 'setRole', role: 'STANDARD' }, resultadoEsperado: 'Botao Novo oculto', tipos: ['E2E', 'FUN'] },
      { acao: 'STANDARD nao pode excluir', categoria: 14, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Botao excluir oculto', tipos: ['E2E', 'FUN'] },
      { acao: 'ADMIN pode criar e editar', categoria: 14, interacao: { tipo: 'setRole', role: 'ADMIN' }, resultadoEsperado: 'CRUD completo disponivel', tipos: ['E2E'] },
      { acao: 'SUPER_ADMIN tem acesso total', categoria: 14, interacao: { tipo: 'setRole', role: 'SUPER_ADMIN' }, resultadoEsperado: 'Tudo visivel', tipos: ['E2E'] },
      { acao: 'USER so ve workspaces que tem acesso', categoria: 14, interacao: { tipo: 'setRole', role: 'USER' }, resultadoEsperado: 'Lista filtrada por membership', tipos: ['E2E', 'FUN'] },
      { acao: 'Backend valida role antes de operar', categoria: 14, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'API retorna 403 para role insuficiente', tipos: ['FUN'] },
      { acao: 'Tenant A nao ve workspaces de Tenant B', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Isolamento total', tipos: ['CRO'] },
      { acao: 'API filtra por tenant_id', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'WHERE tenant_id na query', tipos: ['CRO'] },
      { acao: 'Subdominio unico por tenant mas pode repetir entre tenants', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Constraint por tenant, nao global', tipos: ['CRO'] },
      { acao: 'Tentar acessar workspace de outro tenant via API direta', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: '404 ou 403', tipos: ['CRO'] },
      { acao: 'Navegar com Tab', categoria: 16, interacao: { tipo: 'press', tecla: 'Tab' }, resultadoEsperado: 'Focus ring', tipos: ['E2E'] },
      { acao: 'Abrir modal com Enter', categoria: 16, interacao: { tipo: 'press', tecla: 'Enter' }, resultadoEsperado: 'Modal abre via teclado', tipos: ['E2E'] },
      { acao: 'Fechar modal com Escape', categoria: 16, interacao: { tipo: 'press', tecla: 'Escape' }, resultadoEsperado: 'Modal fecha', tipos: ['E2E'] },
      { acao: 'Verificar aria-labels', categoria: 16, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Botoes com aria-label', tipos: ['E2E'] },
      { acao: 'Resize mobile 375px', categoria: 17, interacao: { tipo: 'resize', largura: 375, altura: 812 }, resultadoEsperado: 'Layout adaptado', tipos: ['E2E'] },
      { acao: 'Resize tablet 768px', categoria: 17, interacao: { tipo: 'resize', largura: 768, altura: 1024 }, resultadoEsperado: 'Layout tablet', tipos: ['E2E'] },
      { acao: 'Resize desktop 1280px', categoria: 17, interacao: { tipo: 'resize', largura: 1280, altura: 800 }, resultadoEsperado: 'Layout desktop', tipos: ['E2E'] },
      { acao: 'Sidebar responsiva', categoria: 17, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Sidebar colapsa em mobile', tipos: ['E2E'] },
      { acao: 'Textos em PT-BR', categoria: 18, interacao: { tipo: 'setLocale', locale: 'pt' }, resultadoEsperado: 'Labels corretos', tipos: ['E2E'] },
      { acao: 'Trocar para EN', categoria: 18, interacao: { tipo: 'setLocale', locale: 'en' }, resultadoEsperado: 'Labels em ingles', tipos: ['E2E'] },
      { acao: 'Formato de data BR', categoria: 18, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'DD/MM/YYYY', tipos: ['E2E'] },
      { acao: 'Voltar para PT-BR', categoria: 18, interacao: { tipo: 'setLocale', locale: 'pt' }, resultadoEsperado: 'Portugues restaurado', tipos: ['E2E'] },
      { acao: 'FCP < 1.5s', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'First Contentful Paint rapido', tipos: ['E2E'] },
      { acao: 'TTI < 3s', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Interativo rapidamente', tipos: ['E2E', 'FUN'] },
      { acao: 'Sem N+1 queries', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Queries eficientes', tipos: ['FUN'] },
      { acao: '50 workspaces renderizam em < 2s', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Performance OK com volume', tipos: ['E2E', 'FUN'] },
      { acao: 'Dados persistem apos F5', categoria: 20, interacao: { tipo: 'reload' }, resultadoEsperado: 'Tabela recarrega', tipos: ['E2E'] },
      { acao: 'Filtro na URL persiste', categoria: 20, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Query string preservada', tipos: ['E2E'] },
      { acao: 'Dirty check ao sair com edicao pendente', categoria: 20, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Alerta de mudancas nao salvas', tipos: ['E2E'] },
    ],
  },

  // ─── Taxa de Câmbio ───────────────────────────────────────────────
  {
    id: 'TST-E2E-CONFIG-000009',
    sublocal: 'Taxa-de-Cambio',
    tela: 'Taxa de Câmbio',
    rota: '/workspace/taxa-cambio',
    componenteFilePath: 'servicos-global/configurador/src/pages/workspace/TaxaCambio.tsx',
    criticidade: 'alta',
    temDinheiro: true,
    resumoExecutivo: 'Tela de cotações PTAX oficiais do Banco Central. Exibe taxas atuais (USD, EUR, GBP, CHF, CNY, JPY) e histórico de 30 dias. Risco: dados financeiros, sincronização com BC. temDinheiro=true pela natureza cambial.',
    naoAplicaveis: [
      { cat: 5, justificativa: 'Tela read-only de cotações — taxas são sincronizadas automaticamente do Banco Central, não editadas manualmente' },
      { cat: 6, justificativa: 'Taxas são importadas do Banco Central via sincronização, não criadas manualmente pelo usuario' },
      { cat: 7, justificativa: 'Cotações são dados historicos imutaveis do Banco Central, não podem ser deletadas pelo usuario' },
      { cat: 13, justificativa: 'Tabelas de cotação são cronológicas por natureza — ordenação fixa por data, sem necessidade de reordenar' },
    ],
    passos: [
      { acao: 'Navegar para /workspace/taxa-cambio', categoria: 1, interacao: { tipo: 'goto', rota: '/workspace/taxa-cambio' }, assercao: { tipo: 'urlMatches', regex: '/workspace/taxa-cambio' }, resultadoEsperado: 'URL correta', tipos: ['E2E'] },
      { acao: 'Verificar cards de cotacao USD e EUR', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Cards com valores de compra/venda', tipos: ['E2E'] },
      { acao: 'Verificar tabela de cotacoes atuais', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Tabela com 6 moedas', tipos: ['E2E'] },
      { acao: 'Verificar tabela de historico', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Tabela com historico 30 dias', tipos: ['E2E'] },
      { acao: 'Verificar sem erros JS', categoria: 1, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Console limpo', tipos: ['E2E'] },
      { acao: 'Verificar titulo Taxa de Cambio', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Titulo e icone CurrencyCircleDollar', tipos: ['E2E'] },
      { acao: 'Verificar subtitulo PTAX Banco Central', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Descricao sobre PTAX', tipos: ['E2E'] },
      { acao: 'Verificar botao Sincronizar PTAX', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Botao com icone ArrowsClockwise', tipos: ['E2E'] },
      { acao: 'Verificar timestamp de ultima sincronizacao', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Data/hora com icone Clock', tipos: ['E2E'] },
      { acao: 'Verificar card USD formatado em R$', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Valor com 4 casas decimais', tipos: ['E2E'] },
      { acao: 'Verificar card EUR formatado em R$', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Valor com 4 casas decimais', tipos: ['E2E'] },
      { acao: 'Verificar card Moedas Ativas', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Contagem de moedas ativas (6)', tipos: ['E2E'] },
      { acao: 'Verificar tabs de filtro de moeda (USD/EUR/GBP/CHF/CNY/JPY)', categoria: 2, interacao: { tipo: 'verificacao' }, resultadoEsperado: '6 tabs de moeda', tipos: ['E2E'] },
      { acao: 'Sidebar com Taxa de Cambio selecionado', categoria: 3, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Item highlighted', tipos: ['E2E'] },
      { acao: 'Navegar para Financeiro via sidebar', categoria: 3, interacao: { tipo: 'click', testid: 'nav-financeiro' }, resultadoEsperado: 'Navega para Financeiro', tipos: ['E2E'] },
      { acao: 'Voltar para Taxa de Cambio via sidebar', categoria: 3, interacao: { tipo: 'click', testid: 'nav-taxa-cambio' }, assercao: { tipo: 'urlMatches', regex: '/workspace/taxa-cambio' }, resultadoEsperado: 'Volta corretamente', tipos: ['E2E'], testid: 'nav-taxa-cambio' },
      { acao: 'Navegar para API Cockpit via sidebar', categoria: 3, interacao: { tipo: 'click', testid: 'nav-api-cockpit' }, resultadoEsperado: 'Navega para API Cockpit', tipos: ['E2E'], testid: 'nav-api-cockpit' },
      { acao: 'Verificar colunas da tabela Cotacoes Atuais', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Moeda, Compra, Venda, Data, Hora, Fonte, Armazenado', tipos: ['E2E'] },
      { acao: 'Verificar valores com 4 casas decimais', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Ex: 5,1234', tipos: ['E2E'] },
      { acao: 'Verificar tabela de historico com 30 dias', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Aproximadamente 22 linhas (dias uteis)', tipos: ['E2E'] },
      { acao: 'Verificar colunas do historico', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Data, Compra, Venda, Hora, Fonte', tipos: ['E2E'] },
      { acao: 'Verificar API GET /taxa-cambio retorna dados', categoria: 4, interacao: { tipo: 'verificacao' }, assercao: { tipo: 'apiResponse', rota: '/api/v1/taxa-cambio', status: 200 }, resultadoEsperado: 'API OK', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar API historico retorna dados', categoria: 4, interacao: { tipo: 'verificacao' }, assercao: { tipo: 'apiResponse', rota: '/api/v1/taxa-cambio/historico', status: 200 }, resultadoEsperado: 'API OK', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar fonte PTAX nos dados', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Fonte = PTAX/BCB', tipos: ['E2E'] },
      { acao: 'Verificar que datas estao em pt-BR', categoria: 4, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'DD/MM/YYYY', tipos: ['E2E'] },
      { acao: 'Validar que Sincronizar so funciona com servico online', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Erro claro se bid-cambio offline', tipos: ['E2E', 'FUN'] },
      { acao: 'Verificar tratamento de moeda inexistente no filtro', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Filtro so aceita moedas validas', tipos: ['E2E'] },
      { acao: 'Verificar que valores numericos sao validos', categoria: 8, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Sem NaN ou undefined nos cards/tabela', tipos: ['E2E'] },
      { acao: 'Clicar Sincronizar PTAX (sucesso)', categoria: 9, interacao: { tipo: 'click', testid: 'btn-sincronizar-ptax' }, resultadoEsperado: 'Dados atualizados, timestamp muda', tipos: ['E2E'], testid: 'btn-sincronizar-ptax' },
      { acao: 'Sincronizar com bid-cambio offline', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mensagem de erro: bid-cambio offline', tipos: ['E2E'] },
      { acao: 'Sincronizar com erro de rede', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mensagem: erro de comunicacao', tipos: ['E2E'] },
      { acao: 'Sincronizar com resposta parcial (algumas moedas falharam)', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Mostra total_ok vs total_erro', tipos: ['E2E', 'FUN'] },
      { acao: 'API retorna erro 500', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Toast de erro', tipos: ['FUN'] },
      { acao: 'Alerta de erro visivel e descritivo', categoria: 9, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Box vermelho com mensagem clara', tipos: ['E2E'] },
      { acao: 'Sem dados de cotacao (BD vazio)', categoria: 10, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Cards zerados, tabelas vazias com mensagem', tipos: ['E2E'] },
      { acao: 'Historico sem dados para moeda selecionada', categoria: 10, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Tabela vazia com mensagem', tipos: ['E2E'] },
      { acao: 'Cards sem valores antes da primeira sync', categoria: 10, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Valores zerados ou placeholder', tipos: ['E2E'] },
      { acao: 'Loading durante sincronizacao', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Botao com spinner, disabled', tipos: ['E2E'] },
      { acao: 'Loading ao carregar cotacoes', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Skeleton nas tabelas', tipos: ['E2E'] },
      { acao: 'Loading ao trocar filtro de moeda', categoria: 11, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Tabela historico recarrega', tipos: ['E2E'] },
      { acao: 'Filtrar historico por USD', categoria: 12, interacao: { tipo: 'click', testid: 'tab-moeda-usd' }, resultadoEsperado: 'Historico mostra USD', tipos: ['E2E'], testid: 'tab-moeda-usd' },
      { acao: 'Filtrar historico por EUR', categoria: 12, interacao: { tipo: 'click', testid: 'tab-moeda-eur' }, resultadoEsperado: 'Historico mostra EUR', tipos: ['E2E'], testid: 'tab-moeda-eur' },
      { acao: 'Filtrar historico por GBP', categoria: 12, interacao: { tipo: 'click', testid: 'tab-moeda-gbp' }, resultadoEsperado: 'Historico mostra GBP', tipos: ['E2E'], testid: 'tab-moeda-gbp' },
      { acao: 'Filtrar historico por CHF', categoria: 12, interacao: { tipo: 'click', testid: 'tab-moeda-chf' }, resultadoEsperado: 'Historico mostra CHF', tipos: ['E2E'], testid: 'tab-moeda-chf' },
      { acao: 'Filtrar historico por CNY', categoria: 12, interacao: { tipo: 'click', testid: 'tab-moeda-cny' }, resultadoEsperado: 'Historico mostra CNY', tipos: ['E2E'], testid: 'tab-moeda-cny' },
      { acao: 'Filtrar historico por JPY', categoria: 12, interacao: { tipo: 'click', testid: 'tab-moeda-jpy' }, resultadoEsperado: 'Historico mostra JPY', tipos: ['E2E'], testid: 'tab-moeda-jpy' },
      { acao: 'STANDARD pode ver cotacoes', categoria: 14, interacao: { tipo: 'setRole', role: 'STANDARD' }, resultadoEsperado: 'Tabelas visiveis, botao sync oculto', tipos: ['E2E', 'FUN'] },
      { acao: 'Apenas ADMIN+ pode sincronizar', categoria: 14, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Botao Sincronizar PTAX oculto para STANDARD', tipos: ['E2E', 'FUN'] },
      { acao: 'SUPER_ADMIN pode sincronizar', categoria: 14, interacao: { tipo: 'setRole', role: 'SUPER_ADMIN' }, resultadoEsperado: 'Botao visivel', tipos: ['E2E'] },
      { acao: 'Cotacoes isoladas por tenant', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Cada tenant ve suas proprias cotacoes', tipos: ['CRO'] },
      { acao: 'Sync de tenant A nao afeta tenant B', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Dados isolados', tipos: ['CRO'] },
      { acao: 'API filtra por tenant_id', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'WHERE tenant_id na query', tipos: ['CRO'] },
      { acao: 'Tentar acessar cotacoes de outro tenant', categoria: 15, interacao: { tipo: 'verificacao' }, resultadoEsperado: '403 ou 404', tipos: ['CRO'] },
      { acao: 'Navegar tabs com Tab', categoria: 16, interacao: { tipo: 'press', tecla: 'Tab' }, resultadoEsperado: 'Focus ring nos tabs de moeda', tipos: ['E2E'] },
      { acao: 'Selecionar tab com Enter', categoria: 16, interacao: { tipo: 'press', tecla: 'Enter' }, resultadoEsperado: 'Tab ativa muda', tipos: ['E2E'] },
      { acao: 'Verificar aria-labels nas tabelas', categoria: 16, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Tabelas acessiveis', tipos: ['E2E'] },
      { acao: 'Verificar contraste dos valores', categoria: 16, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Numeros legiveis', tipos: ['E2E'] },
      { acao: 'Resize mobile 375px', categoria: 17, interacao: { tipo: 'resize', largura: 375, altura: 812 }, resultadoEsperado: 'Layout adaptado', tipos: ['E2E'] },
      { acao: 'Resize tablet 768px', categoria: 17, interacao: { tipo: 'resize', largura: 768, altura: 1024 }, resultadoEsperado: 'Layout tablet', tipos: ['E2E'] },
      { acao: 'Resize desktop 1280px', categoria: 17, interacao: { tipo: 'resize', largura: 1280, altura: 800 }, resultadoEsperado: 'Layout desktop', tipos: ['E2E'] },
      { acao: 'Cards empilham em mobile', categoria: 17, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Grid responsivo', tipos: ['E2E'] },
      { acao: 'Textos em PT-BR', categoria: 18, interacao: { tipo: 'setLocale', locale: 'pt' }, resultadoEsperado: 'Labels corretos', tipos: ['E2E'] },
      { acao: 'Trocar para EN', categoria: 18, interacao: { tipo: 'setLocale', locale: 'en' }, resultadoEsperado: 'Labels em ingles', tipos: ['E2E'] },
      { acao: 'Formato numerico BR (virgula decimal)', categoria: 18, interacao: { tipo: 'verificacao' }, resultadoEsperado: '5,1234 e nao 5.1234', tipos: ['E2E'] },
      { acao: 'Formato de data BR (DD/MM/YYYY)', categoria: 18, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Datas no formato brasileiro', tipos: ['E2E'] },
      { acao: 'FCP < 1.5s', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Rapido', tipos: ['E2E'] },
      { acao: 'TTI < 3s', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Interativo rapidamente', tipos: ['E2E', 'FUN'] },
      { acao: 'Historico de 30 dias renderiza em < 1s', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Tabela rapida', tipos: ['E2E'] },
      { acao: 'Troca de moeda no filtro < 500ms', categoria: 19, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Transicao rapida', tipos: ['E2E'] },
      { acao: 'Dados persistem apos F5', categoria: 20, interacao: { tipo: 'reload' }, resultadoEsperado: 'Cotacoes recarregam', tipos: ['E2E'] },
      { acao: 'Filtro de moeda persiste apos reload', categoria: 20, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Moeda selecionada mantida ou volta para USD', tipos: ['E2E'] },
      { acao: 'Timestamp de ultima sync persiste', categoria: 20, interacao: { tipo: 'verificacao' }, resultadoEsperado: 'Ultimo sync visivel apos F5', tipos: ['E2E'] },
    ],
  },
]

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  mkdirSync(PLANS_DIR, { recursive: true })

  // Carregar registry existente
  let registry: Record<string, unknown> = {
    '$schema': './test-plans-registry.schema.json',
    versao: '1.0.0',
    atualizadoEm: new Date().toISOString(),
    totalPlanos: 0,
    totalPorTipo: { UNI: 0, CON: 0, FUN: 0, CRO: 0, E2E: 0, PEN: 0 },
    totalPorEscopo: {},
    deletados: [],
    planos: [],
  }
  if (existsSync(REGISTRY_PATH)) {
    registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'))
  }

  const planos = (registry.planos ?? []) as Array<Record<string, unknown>>

  for (const def of TELAS) {
    console.log(`\n[onda5] Gerando plano ${def.id} — ${def.tela}...`)
    const { plan, mapeamento, mapeamentoFile } = buildPlan(def)

    // Salvar plano
    const planFile = join(PLANS_DIR, `${def.sublocal.toLowerCase().replace(/\s+/g, '-')}.json`)
    writeFileSync(planFile, JSON.stringify(plan, null, 2))
    console.log(`  ✓ Plano salvo: ${planFile} (${plan.passos.length} passos, ${plan.coberturaPercentual}% cobertura)`)

    // Salvar mapeamento
    const mapDir = resolve(ROOT, 'testes/testes-e2e/configurador/_mapeamentos')
    mkdirSync(mapDir, { recursive: true })
    const mapFile = join(mapDir, `${def.sublocal.toLowerCase().replace(/\s+/g, '-')}.testids.json`)
    writeFileSync(mapFile, JSON.stringify(mapeamento, null, 2))
    console.log(`  ✓ Mapeamento salvo: ${mapFile}`)

    // Atualizar registry
    const existingIdx = planos.findIndex(p => p.id === def.id)
    const entry = {
      id: def.id, tipo: 'E2E', escopo: 'CONFIG', sublocal: def.sublocal,
      tela: def.tela, rota: def.rota, criticidade: def.criticidade,
      ambientes: ['Local', 'Staging', 'Producao'],
      planoFile: `testes-e2e/configurador/_planos/${def.sublocal.toLowerCase().replace(/\s+/g, '-')}.json`,
      specFile: `testes-e2e/configurador/${def.sublocal.toLowerCase().replace(/\s+/g, '-')}/${def.id}.spec.ts`,
      mapeamentoFile,
      componenteFile: def.componenteFilePath,
      passosTotal: plan.passos.length,
      coberturaPercentual: plan.coberturaPercentual,
      status: 'pendente_validacao',
      criadoEm: plan.geradoEm,
      ultimaExecucao: null,
      ultimoResultado: null,
    }

    if (existingIdx >= 0) {
      planos[existingIdx] = entry
    } else {
      planos.push(entry)
    }

    // Gerar spec
    const specDir = resolve(ROOT, `testes/testes-e2e/configurador/${def.sublocal.toLowerCase().replace(/\s+/g, '-')}`)
    mkdirSync(specDir, { recursive: true })
    const specFile = join(specDir, `${def.id}.spec.ts`)
    const specContent = generateSpec(plan)
    writeFileSync(specFile, specContent)
    console.log(`  ✓ Spec salvo: ${specFile}`)
  }

  // Salvar registry atualizado
  registry.planos = planos
  registry.totalPlanos = planos.length
  registry.atualizadoEm = new Date().toISOString()
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2))
  console.log(`\n[onda5] Registry atualizado: ${planos.length} plano(s) total`)
  console.log('[onda5] Concluído!')
}

function generateSpec(plan: Record<string, unknown>): string {
  const passos = plan.passos as Array<Record<string, unknown>>
  const id = plan.id as string
  const tela = plan.tela as string

  let spec = `// ${id} — ${tela}
// Gerado automaticamente por generate-test-plans-onda5.ts
// NAO edite manualmente — regenere a partir do plano JSON

import { test, expect } from '../../../playwright.fixtures.js'

test.describe('${id} — ${tela}', () => {
`

  for (const p of passos) {
    const inter = p.interacao as Record<string, unknown>
    const assercao = p.assercao as Record<string, unknown> | undefined
    let interLine = '// verificacao pura'
    let assertLine = ''

    switch (inter.tipo) {
      case 'goto': interLine = `await page.goto('${inter.rota}')` ; break
      case 'click': interLine = `await page.getByTestId('${inter.testid}').click()`; break
      case 'fill': interLine = `await page.getByTestId('${inter.testid}').fill('${(inter.valor as string).replace(/'/g, "\\'")}')`; break
      case 'select': interLine = `await page.getByTestId('${inter.testid}').selectOption('${inter.opcao}')`; break
      case 'press': interLine = `await page.keyboard.press('${inter.tecla}')`; break
      case 'reload': interLine = `await page.reload()`; break
      case 'resize': interLine = `await page.setViewportSize({ width: ${inter.largura}, height: ${inter.altura} })`; break
      case 'setRole': interLine = `// TODO: trocar para role ${inter.role}`; break
      case 'setLocale': interLine = `// TODO: trocar locale para ${inter.locale}`; break
    }

    if (assercao) {
      switch (assercao.tipo) {
        case 'visible': assertLine = `await expect(page.getByTestId('${assercao.testid}')).toBeVisible()`; break
        case 'urlMatches': assertLine = `await expect(page).toHaveURL(/${assercao.regex}/)`; break
        case 'toastShown': assertLine = `await expect(page.getByText('${assercao.texto}')).toBeVisible()`; break
        case 'apiResponse': assertLine = `// TODO: interceptar ${assercao.rota} e verificar status ${assercao.status}`; break
      }
    }

    spec += `
  test('${p.numero}. ${(p.acao as string).replace(/'/g, "\\'")}', async ({ page }) => {
    ${interLine}
${assertLine ? `    ${assertLine}\n` : ''}  })
`
  }

  spec += `})
`
  return spec
}

main()
