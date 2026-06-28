/**
 * UniversityGravity — layout da Gravity University (serviço de plataforma).
 *
 * ⚠️ PROTÓTIPO / WIP. Mesmo layout do Configurador: MenuLateralGlobal (sidebar)
 * com título "Gravity University" + opções e dropdown de organizações, e as
 * mesmas ações de topo (Hub, busca/localizar, dica, notificações, localizador,
 * idioma, usuário). Textos via i18n (namespace `university`). Implementação real em
 * documentos-tecnicos/produtos-gravity/university-gravity/ (PRD + MODELO-DADOS + SPECS).
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import {
  Books, FileText, PuzzlePiece, Path, Sparkle, GraduationCap, Info,
  SignIn, ShieldStar, Gear, SquaresFour, ShoppingBag, Package,
  MagnifyingGlass, AirplaneTilt, ArrowsLeftRight, GitBranch, CheckCircle,
  Clock, CheckFat, WarningCircle,
} from '@phosphor-icons/react'
import { useShellStore, Notificacoes, ToastContainer, useMeSync, type OrganizacaoShell } from '@gravity/shell'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { SeletorIdiomaGlobal } from '@nucleo/language-switcher-global'
import { CampoLocalizarExpandidoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { LocalizadorGlobal, useLocalizadorHistory, buildEcosystemNodes, type EcosystemNode } from '@nucleo/localizador-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { MenuLateralGlobal } from '@nucleo/menu-lateral-global'
import { useCarregarTipoUsuario } from '../hooks/use-carregar-tipo-usuario'
import { mapRole } from '../types/niveis-acesso'
import { HubBotao } from '../components/HubBotao'
import { PlayerAula } from './university/PlayerAula'
import { getAulaDemo, getAulasDemo } from './university/conteudo-demo'
import './configurador/workspace.css'

const UNI_COR = '#818cf8'

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Fase {
  slug: string
  nome: string
  duracao: string
  concluida: boolean
}
interface Trilha {
  tag: string
  emoji: string
  nome: string
  modulos: number
  duracao: string
  prog: number
  fases: Fase[]
}

// ── Catálogo WIP — virá do banco via API ───────────────────────────────────
const TRILHAS_POR_PRODUTO: Record<string, Trilha[]> = {
  login: [{
    tag: '#60a5fa', emoji: '🔑', nome: 'Primeiros Passos — Login', modulos: 3, duracao: '30m', prog: 100,
    fases: [
      { slug: 'o-que-e-o-gravity',       nome: 'O que é o Gravity',     duracao: '10m', concluida: true },
      { slug: 'criando-sua-conta',        nome: 'Criando sua conta',     duracao: '10m', concluida: true },
      { slug: 'configurando-seu-perfil',  nome: 'Configurando seu perfil', duracao: '10m', concluida: true },
    ],
  }],
  admin: [{
    tag: '#f43f5e', emoji: '🛡️', nome: 'Painel Administrativo', modulos: 3, duracao: '1h', prog: 0,
    fases: [
      { nome: 'Visão geral do Admin', duracao: '20m', concluida: false },
      { nome: 'Impersonação de usuário', duracao: '20m', concluida: false },
      { nome: 'Monitor de APIs e deploys', duracao: '20m', concluida: false },
    ],
  }],
  configurador: [{
    tag: '#60a5fa', emoji: '🧭', nome: 'Conhecendo o Gravity', modulos: 3, duracao: '1h', prog: 100,
    fases: [
      { nome: 'Criando a Organização', duracao: '20m', concluida: true },
      { nome: 'Configurando Workspaces', duracao: '20m', concluida: true },
      { nome: 'Convidando usuários', duracao: '20m', concluida: true },
    ],
  }],
  hub: [{
    tag: '#a78bfa', emoji: '🏠', nome: 'Hub e Navegação', modulos: 2, duracao: '30m', prog: 0,
    fases: [
      { nome: 'Navegando pelo Hub', duracao: '15m', concluida: false },
      { nome: 'Trocando de Workspace', duracao: '15m', concluida: false },
    ],
  }],
  store: [{
    tag: '#10b981', emoji: '🛒', nome: 'Gravity Store', modulos: 2, duracao: '45m', prog: 0,
    fases: [
      { nome: 'Explorando o Marketplace', duracao: '25m', concluida: false },
      { nome: 'Contratando um produto', duracao: '20m', concluida: false },
    ],
  }],
  pedido: [{
    tag: '#f59e0b', emoji: '📦', nome: 'Onboarding Pedido', modulos: 5, duracao: '2h', prog: 62,
    fases: [
      { nome: 'Lista de Pedidos', duracao: '25m', concluida: true },
      { nome: 'Criando um Pedido', duracao: '20m', concluida: true },
      { nome: 'Edição em Massa', duracao: '25m', concluida: true },
      { nome: 'Colunas e Filtros', duracao: '25m', concluida: false },
      { nome: 'Relatórios e Exportação', duracao: '25m', concluida: false },
    ],
  }],
  'smart-read': [{
    tag: '#c084fc', emoji: '📄', nome: 'Onboarding Smart Docs', modulos: 4, duracao: '1h30', prog: 0,
    fases: [
      { nome: 'Anexando documentos', duracao: '25m', concluida: false },
      { nome: 'Leitura inteligente', duracao: '25m', concluida: false },
      { nome: 'Análise de Riscos', duracao: '25m', concluida: false },
      { nome: 'Exportando Insights', duracao: '15m', concluida: false },
    ],
  }],
  'bid-frete': [{
    tag: '#60a5fa', emoji: '✈️', nome: 'BID Frete Internacional', modulos: 4, duracao: '1h30', prog: 0,
    fases: [
      { nome: 'Nova Cotação', duracao: '25m', concluida: false },
      { nome: 'Comparando Fretes', duracao: '25m', concluida: false },
      { nome: 'Aprovação e Follow-up', duracao: '25m', concluida: false },
      { nome: 'Relatórios de Frete', duracao: '15m', concluida: false },
    ],
  }],
  'bid-cambio': [{
    tag: '#facc15', emoji: '💱', nome: 'BID Câmbio', modulos: 3, duracao: '1h', prog: 0,
    fases: [
      { nome: 'Simulação de Câmbio', duracao: '20m', concluida: false },
      { nome: 'Fechamento de Câmbio', duracao: '20m', concluida: false },
      { nome: 'Histórico e Relatórios', duracao: '20m', concluida: false },
    ],
  }],
  processo: [{
    tag: '#facc15', emoji: '🔀', nome: 'Onboarding Processo', modulos: 6, duracao: '2h30', prog: 0,
    fases: [
      { nome: 'Criando um Processo', duracao: '25m', concluida: false },
      { nome: 'Dados Técnicos', duracao: '25m', concluida: false },
      { nome: 'Vinculando Pedidos', duracao: '25m', concluida: false },
      { nome: 'Containers e Taxas', duracao: '25m', concluida: false },
      { nome: 'Workflow e Status', duracao: '25m', concluida: false },
      { nome: 'Relatórios', duracao: '25m', concluida: false },
    ],
  }],
}

// Produtos que esta organização contratou (WIP — virá do backend)
const PRODUTOS_CONTRATADOS: (keyof typeof TRILHAS_POR_PRODUTO)[] = [
  'login', 'configurador', 'pedido', 'processo', 'smart-read',
]

// Visão geral agrupada (sem produto selecionado)
const GRUPOS_TRILHAS = [
  { tituloKey: 'university.grupo.comece_aqui',  trilhas: [TRILHAS_POR_PRODUTO.login[0], TRILHAS_POR_PRODUTO.configurador[0]] },
  { tituloKey: 'university.grupo.seus_produtos', trilhas: [TRILHAS_POR_PRODUTO.pedido[0], TRILHAS_POR_PRODUTO.processo[0], TRILHAS_POR_PRODUTO['smart-read'][0]] },
  { tituloKey: 'university.grupo.explorar',      trilhas: [TRILHAS_POR_PRODUTO['bid-frete'][0], TRILHAS_POR_PRODUTO['bid-cambio'][0], TRILHAS_POR_PRODUTO.store[0]] },
]

const ICON_MAP = {
  login:        SignIn,
  admin:        ShieldStar,
  configurador: Gear,
  hub:          SquaresFour,
  store:        ShoppingBag,
  pedido:       Package,
  'smart-read': MagnifyingGlass,
  'bid-frete':  AirplaneTilt,
  'bid-cambio': ArrowsLeftRight,
  processo:     GitBranch,
} as const

type ProdutoSlug = keyof typeof ICON_MAP

// ── Manual de Login — dados enterprise ────────────────────────────────────
interface DocPassoVisual {
  num: number
  titulo: string
  paragrafos: string[]
  imagem: string
  callout?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }
  painelRequisitosCadastro?: boolean
}

interface DocSecao {
  num: number
  titulo: string
  paragrafos: string[]
  imagem?: string
  layoutTextoImagemLateral?: boolean
  listaEmLinha?: boolean
  lista?: string[]
  passosVisuais?: DocPassoVisual[]
  cardsBilaterais?: { esquerdo: { label: string; titulo: string; itens: string[] }; direito: { label: string; titulo: string; itens: string[] } }
  timeline?: { passo: number; titulo: string; desc: string }[]
  callout?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }
}

const DOC_LOGIN_SECOES: DocSecao[] = [
  {
    num: 1,
    titulo: 'A tela de acesso',
    imagem: '/university/screenshots/login-tela-completa.png',
    layoutTextoImagemLateral: true,
    listaEmLinha: true,
    paragrafos: [
      'Esta é a primeira tela que você vê ao acessar a plataforma Gravity. No lado esquerdo, a identidade da plataforma: logo e proposta de valor.',
      'No lado direito, o formulário de acesso. Você pode entrar com sua conta Google clicando em "Continuar com Google", ou digitar diretamente seu e-mail e senha. Ao clicar em "Entrar", o sistema valida suas credenciais e te direciona automaticamente para o lugar certo.',
    ],
    lista: [
      '– Botão "Continuar com Google": acesso rápido sem precisar digitar e-mail e senha',
      '– Campo E-mail: informe o e-mail com o qual você se cadastrou',
      '– Campo Senha: sua senha da plataforma — clique no ícone de olho para revelar',
      '– Botão "Entrar": inicia a validação e te leva para o hub ou onboarding',
      '– Link "Esqueceu a senha?": recuperação por e-mail em dois passos',
      '– Link "Registre-se": cria uma nova conta na plataforma',
    ],
  },
  {
    num: 2,
    titulo: 'Fluxo 1 — criar sua conta',
    paragrafos: [
      'Se você ainda não tem conta na Gravity, o cadastro leva poucos minutos em duas etapas: dados pessoais e confirmação por e-mail.',
      'Depois de validar o código, você segue para o onboarding e cria sua organização e workspace.',
    ],
    passosVisuais: [
      {
        num: 1,
        titulo: 'Abrir o cadastro',
        imagem: '/university/screenshots/login-fluxo1-passo-01-registre-se.png',
        paragrafos: [
          'Na tela de login, clique em "Registre-se" (ou alterne para a aba Cadastro). O formulário de criação de conta é exibido no mesmo painel direito.',
        ],
      },
      {
        num: 2,
        titulo: 'Preencher os dados',
        imagem: '/university/screenshots/login-fluxo1-passo-02-formulario-vazio.png',
        paragrafos: [
          'Informe nome, sobrenome, e-mail e senha. Marque o aceite dos Termos de Uso. A barra abaixo da senha mostra a força conforme você digita.',
        ],
        callout: {
          tipo: 'dica',
          texto: 'Para voltar ao menu principal (tela de login), clique em "Voltar para o login" abaixo do botão Continuar.',
        },
      },
      {
        num: 3,
        titulo: 'Corrigir pendências do formulário',
        imagem: '/university/screenshots/login-fluxo1-passo-03-validacao-erros.png',
        painelRequisitosCadastro: true,
        paragrafos: [
          'O formulário exibe um checklist em tempo real abaixo da senha. Cada exigência obrigatória muda de vermelho (pendente) para verde (atendida) conforme você digita.',
          'O botão "Continuar" só é habilitado quando os sete itens abaixo estiverem verdes — incluindo confirmação de senha e aceite dos Termos de Uso.',
        ],
      },
      {
        num: 4,
        titulo: 'Enviar o formulário',
        imagem: '/university/screenshots/login-fluxo1-passo-03-formulario-preenchido.png',
        paragrafos: [
          'Com todos os campos válidos, clique em "Continuar". O sistema cria a conta e envia um código de verificação para o e-mail informado.',
        ],
      },
      {
        num: 5,
        titulo: 'Digitar o código',
        imagem: '/university/screenshots/login-fluxo1-passo-05-codigo-vazio.png',
        paragrafos: [
          'Preencha os seis campos numéricos — o foco avança automaticamente. Você também pode colar o código completo de uma vez.',
        ],
      },
      {
        num: 6,
        titulo: 'Receber o código',
        imagem: '/university/screenshots/login-fluxo1-passo-04-verificacao-email.png',
        paragrafos: [
          'Abra o e-mail da Gravity e copie o código de 6 dígitos. Volte à tela de verificação, confirme o endereço exibido e informe o código recebido.',
        ],
        callout: {
          tipo: 'dica',
          texto: 'Não chegou? Confira spam/lixo eletrônico, aba Promoções, filtros do antivírus ou bloqueio do remetente notifications@usegravity.com.br — e se o e-mail foi digitado corretamente. Só então use "Reenviar código" na tela de verificação.',
        },
      },
      {
        num: 7,
        titulo: 'Concluir o cadastro',
        imagem: '/university/screenshots/login-fluxo1-passo-06-codigo-preenchido.png',
        paragrafos: [
          'Clique em "Verificar". Com o código correto, sua sessão é ativada e você é direcionado ao onboarding (/trial) para configurar a organização.',
        ],
      },
    ],
    callout: { tipo: 'dica', texto: 'Se o código expirar, use "Reenviar código" na tela de verificação — um novo código é enviado ao mesmo e-mail.' },
  },
  {
    num: 3,
    titulo: 'Fluxo 2 — entrar com e-mail e senha',
    paragrafos: [
      'Se você já tem conta, use a rota /login: informe o e-mail cadastrado, digite a senha e clique em "Entrar". O sistema valida com o Clerk e, se tudo estiver correto, ativa sua sessão e te leva ao Hub ou ao onboarding.',
      'Contas com verificação em duas etapas (2FA) pedem um código adicional por e-mail ou autenticador — o mesmo padrão visual de seis dígitos do cadastro.',
    ],
    passosVisuais: [
      {
        num: 1,
        titulo: 'Informar e-mail e senha',
        imagem: '/university/screenshots/login-tela-completa.png',
        paragrafos: [
          'Na tela "Acessar a plataforma", preencha o e-mail com o qual você se cadastrou e a senha. Use o ícone de olho para conferir o que digitou antes de enviar.',
        ],
        callout: {
          tipo: 'dica',
          texto: 'Ainda não tem conta? Clique em "Registre-se" no rodapé. Esqueceu a senha? Use o link "Esqueceu a senha?" — fluxo descrito na seção 4 deste manual.',
        },
      },
      {
        num: 2,
        titulo: 'Clicar em Entrar',
        imagem: '/university/screenshots/login-tela-completa.png',
        paragrafos: [
          'Com os dois campos preenchidos, clique em "Entrar". Enquanto valida, o botão exibe carregamento. Se e-mail ou senha estiverem incorretos, um banner vermelho no topo do formulário explica o problema — sem liberar o acesso.',
        ],
        callout: {
          tipo: 'aviso',
          texto: 'Após muitas tentativas erradas, o Clerk pode exigir CAPTCHA ou bloquear temporariamente o acesso. Aguarde alguns minutos antes de tentar de novo.',
        },
      },
      {
        num: 3,
        titulo: 'Verificação em duas etapas (se ativa)',
        imagem: '/university/screenshots/login-fluxo1-passo-05-codigo-vazio.png',
        paragrafos: [
          'Se a sua conta tiver 2FA, após a senha correta a tela pede um código de seis dígitos — enviado ao e-mail ou gerado no autenticador, conforme a configuração da organização.',
          'Preencha os seis campos (ou cole o código inteiro). Só então a sessão é concluída.',
        ],
        callout: {
          tipo: 'dica',
          texto: 'Não recebeu o código por e-mail? Verifique spam, Promoções, filtros do antivírus ou bloqueio de notifications@usegravity.com.br antes de solicitar reenvio.',
        },
      },
      {
        num: 4,
        titulo: 'Acesso liberado',
        imagem: '/university/screenshots/login-tela-completa.png',
        paragrafos: [
          'Com credenciais válidas (e 2FA concluído, se aplicável), você entra na plataforma: usuário com organização vai ao Hub (/hub); conta nova ou sem organização segue para o onboarding (/trial).',
        ],
        callout: {
          tipo: 'exemplo',
          texto: 'Super Admins e usuários Master nunca ficam presos em "Nenhum workspace" — o porteiro reconhece acesso global mesmo sem vínculo físico na filial.',
        },
      },
    ],
  },
  {
    num: 4,
    titulo: 'Fluxo 3 — recuperar senha',
    paragrafos: [
      'A recuperação de senha é dividida em duas páginas separadas. A primeira (/recuperar-senha) solicita o e-mail registrado e chama signIn.create({ strategy: "reset_password_email_code", identifier: email }). Exibe um estado de sucesso com instruções para verificar a caixa de entrada.',
      'A segunda página (/recuperar-senha/redefinir?email=) recebe o e-mail via query string e apresenta três campos: código de 6 dígitos, nova senha e confirmação. O indicador de força de senha é o mesmo do cadastro. Ao submeter, signIn.attemptFirstFactor() valida o código e atualiza a senha. Em caso de sucesso, setActive() ativa a sessão e o porteiro direciona para /hub (usuário existente).',
    ],
    cardsBilaterais: {
      esquerdo: {
        label: 'PÁGINA 1 — /recuperar-senha',
        titulo: 'Solicitar redefinição',
        itens: ['– Campo de e-mail', '– Botão "Enviar código"', '– Estado de sucesso com ícone ✓', '– Link para voltar ao login', '– strategy: reset_password_email_code'],
      },
      direito: {
        label: 'PÁGINA 2 — /recuperar-senha/redefinir',
        titulo: 'Redefinir senha',
        itens: ['– 6 inputs numéricos (código do e-mail)', '– Campo nova senha (com força visual)', '– Campo confirmação de senha', '– Botão "Redefinir senha"', '– Após sucesso → setActive() → /hub'],
      },
    },
    callout: { tipo: 'aviso', texto: 'O link "Tenho o código" na página 1 redireciona para /recuperar-senha/redefinir?email=<email_codificado>. Se o usuário acessar a página 2 diretamente sem o parâmetro ?email=, o campo de e-mail fica vazio e o submit falha com erro de validação.' },
  },
  {
    num: 5,
    titulo: 'Convite de outro usuário',
    paragrafos: [
      'Quando um administrador convida um usuário via painel do Configurador, o Clerk gera um ticket único. O convidado recebe um e-mail com link para /cadastro/continuar?__clerk_ticket=<ticket>. Essa rota é protegida pelo guard ConviteContinuarRoute: se o usuário já estiver logado com outra conta, o sistema faz signOut() automaticamente antes de processar o convite.',
      'O componente CadastroContinuarPage usa signUp.create({ strategy: "ticket", ticket }) para pré-popular nome e e-mail do convite. O usuário preenche apenas nome, sobrenome e senha. Após verificação OTP e setActive(), o porteiro direciona para /trial (nova conta vinculada) ou /hub (conta já existente no Prisma).',
    ],
    timeline: [
      { passo: 1, titulo: 'Admin envia convite', desc: 'Clerk gera ticket único; e-mail enviado para o convidado com link /cadastro/continuar?__clerk_ticket=<ticket>' },
      { passo: 2, titulo: 'Convidado clica no link', desc: 'ConviteContinuarRoute verifica: se logado → signOut() automático; se sem conta → processa ticket' },
      { passo: 3, titulo: 'processarTicketConvite()', desc: 'signUp.create({ strategy: "ticket", ticket }) — pré-popula e-mail e nome do convite' },
      { passo: 4, titulo: 'Usuário preenche dados restantes', desc: 'Apenas nome, sobrenome e senha (e-mail já vem preenchido e bloqueado para edição)' },
      { passo: 5, titulo: 'Verificação OTP de e-mail', desc: 'Mesmo fluxo do cadastro normal — 6 dígitos, foco automático, paste' },
      { passo: 6, titulo: 'Sessão ativada → porteiro decide', desc: 'setActive() → /api/v1/me → destino: /trial (nova conta) ou /hub (conta já no Prisma)' },
    ],
    callout: { tipo: 'aviso', texto: 'O ticket de convite é de uso único. Se o usuário recarregar a página durante o fluxo, o hook useLoginAutomaticoPosConvite() detecta credenciais salvas em sessionStorage e faz login automático — até 6 tentativas — para retomar o onboarding sem perda de contexto.' },
  },
  {
    num: 6,
    titulo: 'Pós-autenticação — porteiro e destino final',
    paragrafos: [
      'Após qualquer autenticação bem-sucedida (login, cadastro, convite ou OAuth), o sistema chama navegarDestinoPosAutenticacao(), que faz fetch em /api/v1/me com o token Bearer do Clerk. A resposta determina o destino: se a organização for null ou a resposta for 401/404, o usuário é enviado para /trial (onboarding). Se a organização existir, vai para /hub.',
      'O /hub (SelecionarWorkspace) avalia 4 condições para skip automático para /core: o parâmetro ?select=1 não estar presente, o workspace preferido estar definido, o usuário ter workspaces ativos, e o tipo_usuario não ser FORNECEDOR. Se todas forem verdadeiras, a navegação para /core acontece sem intervenção do usuário.',
    ],
    cardsBilaterais: {
      esquerdo: {
        label: 'NOVO USUÁRIO',
        titulo: '→ /trial (Onboarding)',
        itens: ['– porteiro: organizacao === null', '– porteiro: status 401 (não no Prisma)', '– Cria organização e workspace', '– Após concluir → /hub'],
      },
      direito: {
        label: 'USUÁRIO EXISTENTE',
        titulo: '→ /hub (ou /core direto)',
        itens: ['– porteiro: organizacao ≠ null', '– Avalia 4 condições de skip', '– workspace preferido → /core direto', '– Sem preferência → seleciona workspace'],
      },
    },
    callout: { tipo: 'exemplo', texto: 'Usuário SUPER_ADMIN ou ADMIN nunca fica preso no limbo mesmo sem vinculação em UsuarioWorkspace — o porteiro /api/v1/me retorna acesso global a todos os workspaces da organização diretamente via query no banco (Mandamento 04 — LIMBO).' },
  },
  {
    num: 7,
    titulo: 'Autenticação via Google (OAuth)',
    paragrafos: [
      'O botão "Continuar com Google" está disponível tanto no login quanto no cadastro. Ao clicar, chama authenticateWithRedirect() com strategy "oauth_google" e redirectUrl apontando para o callback customizado da respectiva rota. O Clerk gerencia o redirect para o Google, a validação do token e o retorno ao sistema.',
      'O callback SsoCallbackPage usa o componente AuthenticateWithRedirectCallback do Clerk com três URLs configuradas: continueSignUpUrl (/cadastro/continuar) para quando campos obrigatórios faltarem, signInFallbackRedirectUrl (/hub) para usuário existente, e signUpFallbackRedirectUrl (/trial) para conta nova.',
    ],
    cardsBilaterais: {
      esquerdo: {
        label: 'LOGIN COM GOOGLE — /login',
        titulo: 'signIn.authenticateWithRedirect()',
        itens: ['– strategy: oauth_google', '– redirectUrl: /login/sso-callback', '– redirectUrlComplete: /hub', '– Spinner durante redirect', '– Sem etapa de OTP'],
      },
      direito: {
        label: 'CADASTRO COM GOOGLE — /cadastro',
        titulo: 'signUp.authenticateWithRedirect()',
        itens: ['– strategy: oauth_google', '– redirectUrl: /cadastro/sso-callback', '– redirectUrlComplete: /trial', '– Campos faltando → /cadastro/continuar', '– Sem etapa de OTP'],
      },
    },
  },
  {
    num: 8,
    titulo: 'Estados de erro e comportamentos de sistema',
    paragrafos: [
      'Os erros são exibidos em banner no topo do formulário, nunca inline nos campos. Cada código de erro do Clerk é mapeado para uma mensagem amigável em português. O sistema respeita o Mandamento 08 (sem fallback silencioso): se o tipo_usuario não for encontrado, o erro é registrado via console.warn com contexto completo.',
      'Erros de sessão gravada indevidamente (ex: porteiro retorna erro de autorização) são armazenados em sessionStorage.gravity_login_error e exibidos como banner de aviso na próxima vez que AutenticacaoPage carregar, para informar o usuário do motivo do logout forçado.',
    ],
    lista: [
      '– form_password_incorrect: "Senha incorreta. Verifique e tente novamente."',
      '– form_identifier_not_found: "Conta não encontrada com esse e-mail."',
      '– too_many_requests: "Muitas tentativas. Aguarde alguns minutos."',
      '– network_error: "Falha de conexão. Verifique sua internet."',
      '– gravity_login_error (sessionStorage): banner âmbar com motivo do logout forçado',
      '– CAPTCHA exigido: erro registrado em console.error — formulário customizado não suporta',
      '– Ticket inválido/revogado: mensagem específica com orientação para solicitar novo convite',
    ],
  },
  {
    num: 9,
    titulo: 'Paleta, tipografia e referência técnica',
    paragrafos: [
      'O tema padrão é escuro. O Configurador suporta alternância para light-theme via classe CSS no document.body. Todos os tokens de cor usam variáveis CSS para garantir consistência entre temas.',
    ],
    lista: [
      '– Primário (indigo): #6366f1 — botões, links, badge, foco de campo',
      '– Fundo: #0b0f1a — background da tela completa',
      '– Card formulário: #1a1f2e com backdrop-filter: blur(20px)',
      '– Texto principal: #f1f5f9',
      '– Texto muted: #94a3b8 — labels, placeholders, hints',
      '– Erro: #fca5a5 (texto) / rgba(239,68,68,.1) (fundo do banner)',
      '– Sucesso: #4ade80 — ícone de e-mail verificado, senha forte',
      '– Tipografia: Plus Jakarta Sans (Google Fonts) — pesos 400, 500, 600, 700',
      '– Botões: border-radius 9999px (pílula) — padrão universal do Gravity',
      '– Rotas: /login/* → AutenticacaoPage · /cadastro/continuar → CadastroContinuarPage · /login/sso-callback → SsoCallbackPage · /recuperar-senha/redefinir → RecuperarSenhaRedefinirPage',
    ],
  },
]

// ── Componente Manual Login ─────────────────────────────────────────────────
const CALLOUT_STYLE: Record<string, { bg: string; borda: string; label: string; cor: string }> = {
  aviso:    { bg: 'rgba(251,191,36,.07)',  borda: 'rgba(251,191,36,.3)',  label: '⚠ Atenção',   cor: '#fbbf24' },
  exemplo:  { bg: 'rgba(99,102,241,.07)',  borda: 'rgba(99,102,241,.3)',  label: '💡 Exemplo',  cor: '#818cf8' },
  dica:     { bg: 'rgba(99,102,241,.07)',  borda: 'rgba(99,102,241,.3)',  label: '💡 Dica',     cor: '#818cf8' },
  seguranca:{ bg: 'rgba(239,68,68,.07)',   borda: 'rgba(239,68,68,.3)',   label: '🔒 Segurança', cor: '#f87171' },
}

/** Manual descritivo — corpo mais claro que ws-muted; secundário para legendas dos cards */
const MANUAL_TIPO = {
  corpo: 'var(--ws-text,#e8edf4)',
  secundario: 'var(--ws-muted,#c8d1dc)',
  meta: 'var(--ws-muted,#94a3b8)',
} as const

function ManualFiguraScreenshot({ src, alt }: { src: string; alt: string }) {
  return (
    <figure style={{
      margin: 0, borderRadius: 14, overflow: 'hidden',
      border: '1px solid rgba(148,163,184,.15)', boxShadow: '0 8px 32px rgba(0,0,0,.28)',
      background: 'rgba(8,12,24,.55)',
    }}>
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', display: 'block', verticalAlign: 'top', objectFit: 'contain' }}
        onError={(e) => {
          const el = e.currentTarget.parentElement!
          el.style.maxHeight = 'unset'
          el.innerHTML = `<div style="padding:48px;text-align:center;color:#475569;font-size:.8rem;background:rgba(148,163,184,.04)">📸 Salve o screenshot em<br/><code style="color:#818cf8;font-size:.75rem">${src}</code></div>`
        }}
      />
    </figure>
  )
}

function ManualPainelRequisitosCadastro() {
  const grupos: { rotulo: string; itens: string[] }[] = [
    {
      rotulo: 'Composição da senha',
      itens: [
        'No mínimo 8 caracteres',
        'Pelo menos 1 letra maiúscula',
        'Pelo menos 1 letra minúscula',
        'Pelo menos 1 número',
        'Pelo menos 1 caractere especial',
      ],
    },
    {
      rotulo: 'Confirmação e aceite legal',
      itens: [
        'A confirmação de senha confere',
        'Aceite dos Termos de Uso e Política de Privacidade',
      ],
    },
  ]

  return (
    <div style={{
      marginTop: 14,
      borderRadius: 12,
      border: '1px solid rgba(99,102,241,.22)',
      background: 'linear-gradient(165deg, rgba(99,102,241,.08) 0%, rgba(15,23,42,.35) 48%)',
      overflow: 'hidden',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        padding: '10px 14px', borderBottom: '1px solid rgba(148,163,184,.12)',
        background: 'rgba(99,102,241,.06)',
      }}>
        <span style={{
          fontSize: '.65rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
          color: '#a5b4fc',
        }}>
          Exigências obrigatórias
        </span>
        <span style={{
          fontSize: '.62rem', fontWeight: 700, color: '#818cf8',
          background: 'rgba(99,102,241,.14)', border: '1px solid rgba(99,102,241,.25)',
          borderRadius: 999, padding: '2px 8px',
        }}>
          7 itens
        </span>
      </div>

      <div style={{ padding: '12px 14px 10px' }}>
        {grupos.map((grupo, gi) => (
          <div key={grupo.rotulo} style={{ marginTop: gi === 0 ? 0 : 12 }}>
            <p style={{
              fontSize: '.62rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
              color: MANUAL_TIPO.meta, margin: '0 0 8px', paddingBottom: 6,
              borderBottom: '1px solid rgba(148,163,184,.1)',
            }}>
              {grupo.rotulo}
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {grupo.itens.map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, position: 'relative' }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 999, flexShrink: 0, marginTop: 1,
                    display: 'grid', placeItems: 'center',
                    background: 'rgba(239,68,68,.12)', border: '1px solid rgba(248,113,113,.45)',
                    color: '#f87171',
                  }}>
                    <WarningCircle size={11} weight="fill" />
                  </span>
                  <span style={{ fontSize: '.78rem', color: MANUAL_TIPO.corpo, lineHeight: 1.45 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 12, paddingTop: 10,
          borderTop: '1px dashed rgba(148,163,184,.15)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#4ade80' }}>
            <CheckCircle size={13} weight="fill" /> Atendido — item verde no formulário
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#f87171' }}>
            <WarningCircle size={13} weight="fill" /> Pendente — item vermelho até corrigir
          </span>
        </div>
      </div>
    </div>
  )
}

function ManualBlocoPassoVisual({ passo }: { passo: DocPassoVisual }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(240px, 36%) minmax(0, 1fr)',
      gap: 28,
      alignItems: 'start',
      paddingTop: passo.num === 1 ? 8 : 22,
      borderTop: passo.num === 1 ? undefined : '1px solid rgba(148,163,184,.1)',
      marginTop: passo.num === 1 ? 18 : 0,
    }}>
      <div style={{ padding: '2px 0 0 18px', borderLeft: '3px solid rgba(99,102,241,.45)' }}>
        <p style={{
          fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', color: '#818cf8',
          textTransform: 'uppercase', margin: '0 0 8px',
        }}>
          Passo {String(passo.num).padStart(2, '0')}
        </p>
        <p style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ws-text,#f1f5f9)', margin: '0 0 10px' }}>
          {passo.titulo}
        </p>
        {passo.paragrafos.map((p, i) => (
          <p key={i} style={{
            fontSize: '.9rem', color: MANUAL_TIPO.corpo, lineHeight: 1.8,
            margin: i === passo.paragrafos.length - 1 && !passo.painelRequisitosCadastro ? 0 : '0 0 10px',
          }}>{p}</p>
        ))}
        {passo.painelRequisitosCadastro && <ManualPainelRequisitosCadastro />}
        {passo.callout && (() => {
          const c = CALLOUT_STYLE[passo.callout.tipo]
          return (
            <div style={{ background: c.bg, border: `1px solid ${c.borda}`, borderRadius: 8, padding: '12px 16px', marginTop: 12 }}>
              <p style={{ fontSize: '.7rem', fontWeight: 700, color: c.cor, marginBottom: 5, letterSpacing: '.06em', textTransform: 'uppercase' }}>{c.label}</p>
              <p style={{ fontSize: '.82rem', color: MANUAL_TIPO.corpo, lineHeight: 1.65 }}>{passo.callout.texto}</p>
            </div>
          )
        })()}
      </div>
      <ManualFiguraScreenshot src={passo.imagem} alt={passo.titulo} />
    </div>
  )
}

function DocLoginManual() {
  const [abertos, setAbertos] = useState<number[]>([1])
  const toggle = (n: number) => setAbertos(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  const scrollTo = (n: number) => {
    if (!abertos.includes(n)) setAbertos(prev => [...prev, n])
    setTimeout(() => document.getElementById(`doc-sec-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  return (
    <div style={{ maxWidth: '100%', color: 'var(--ws-text,#f1f5f9)' }}>
      {/* Badge */}
      <span style={{
        display: 'inline-block', background: 'rgba(99,102,241,.12)', color: '#818cf8',
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', padding: '4px 12px',
        borderRadius: 999, border: '1px solid rgba(99,102,241,.3)', marginBottom: 16,
        textTransform: 'uppercase',
      }}>Manual Descritivo de Tela</span>

      <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.2 }}>
        Tela de Login — Gravity Platform
      </h1>
      <p style={{ fontSize: '.9rem', color: MANUAL_TIPO.corpo, marginBottom: 22, lineHeight: 1.7, maxWidth: 620 }}>
        Documentação técnica completa da experiência de autenticação: layout, fluxos de acesso,
        cadastro, recuperação de senha, convites e roteamento pós-autenticação.
      </p>

      {/* Metadados */}
      <div style={{
        display: 'flex', gap: 32, flexWrap: 'wrap', fontSize: '.78rem',
        color: 'var(--ws-muted,#94a3b8)', paddingBottom: 22,
        borderBottom: '1px solid rgba(148,163,184,.12)', marginBottom: 28,
      }}>
        {[['Versão','1.0'],['Data','junho 2026'],['Produto','Configurador'],['Rota base','/login'],['Componente','AutenticacaoPage']].map(([k,v]) => (
          <span key={k}><strong style={{ color: 'var(--ws-text,#e2e8f0)', marginRight: 4 }}>{k}</strong>{v}</span>
        ))}
      </div>

      {/* Sumário */}
      <div style={{
        background: 'rgba(148,163,184,.05)', border: '1px solid rgba(148,163,184,.12)',
        borderRadius: 14, padding: '20px 26px', marginBottom: 32,
      }}>
        <p style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--ws-muted,#64748b)', textTransform: 'uppercase', marginBottom: 14 }}>
          Sumário
        </p>
        <ol style={{ margin: 0, paddingLeft: 20, columns: 2, gap: 24, fontSize: '.85rem' }}>
          {DOC_LOGIN_SECOES.map(s => (
            <li key={s.num} style={{ marginBottom: 7 }}>
              <button onClick={() => scrollTo(s.num)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', padding: 0, textAlign: 'left', lineHeight: 1.4 }}>
                {s.titulo}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Seções */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {DOC_LOGIN_SECOES.map(s => {
          const aberto = abertos.includes(s.num)
          return (
            <div key={s.num} id={`doc-sec-${s.num}`} style={{
              border: `1px solid ${aberto ? 'rgba(99,102,241,.25)' : 'rgba(148,163,184,.12)'}`,
              borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s',
            }}>
              {/* Header da seção */}
              <button onClick={() => toggle(s.num)} style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: aberto ? 'rgba(99,102,241,.07)' : 'rgba(148,163,184,.03)',
                border: 'none', cursor: 'pointer', padding: '16px 22px',
                color: 'var(--ws-text,#f1f5f9)', textAlign: 'left', transition: 'background .15s',
              }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                  <span style={{ color: '#818cf8', marginRight: 10, fontSize: '.85rem' }}>{String(s.num).padStart(2,'0')}</span>
                  {s.titulo}
                </span>
                <span style={{ color: '#818cf8', transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform .25s', fontSize: '.9rem' }}>▾</span>
              </button>

              {/* Corpo da seção */}
              {aberto && (
                <div style={{ padding: '22px 26px 26px', borderTop: '1px solid rgba(148,163,184,.1)' }}>

                  {s.layoutTextoImagemLateral && s.imagem ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(240px, 36%) minmax(0, 1fr)',
                      gap: 28,
                      alignItems: 'start',
                      marginBottom: s.lista ? 28 : 0,
                    }}>
                      <div style={{
                        padding: '2px 0 0 18px',
                        borderLeft: '3px solid rgba(99,102,241,.45)',
                      }}>
                        {s.paragrafos.map((p, i) => (
                          <p key={i} style={{
                            fontSize: '.9rem', color: MANUAL_TIPO.corpo,
                            lineHeight: 1.8,
                            margin: i === s.paragrafos.length - 1 ? 0 : '0 0 12px',
                          }}>{p}</p>
                        ))}
                      </div>
                      <ManualFiguraScreenshot src={s.imagem} alt={s.titulo} />
                    </div>
                  ) : s.passosVisuais ? (
                    <>
                      {s.paragrafos.map((p, i) => (
                        <p key={i} style={{
                          fontSize: '.9rem', color: MANUAL_TIPO.corpo, lineHeight: 1.8,
                          margin: i === s.paragrafos.length - 1 ? '0 0 4px' : '0 0 12px',
                        }}>{p}</p>
                      ))}
                      {s.passosVisuais.map(passo => (
                        <ManualBlocoPassoVisual key={passo.num} passo={passo} />
                      ))}
                    </>
                  ) : (
                    <>
                      {s.paragrafos.map((p, i) => (
                        <p key={i} style={{ fontSize: '.875rem', color: MANUAL_TIPO.corpo, lineHeight: 1.75, marginBottom: 14 }}>{p}</p>
                      ))}

                      {s.imagem && (
                        <div style={{ marginTop: 20 }}>
                          <ManualFiguraScreenshot src={s.imagem} alt={s.titulo} />
                        </div>
                      )}
                    </>
                  )}

                  {/* Legenda — cards visuais em grid */}
                  {s.lista && !s.cardsBilaterais && !s.timeline && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: s.listaEmLinha
                        ? `repeat(${s.lista.length}, minmax(0, 1fr))`
                        : 'repeat(auto-fill, minmax(260px, 1fr))',
                      gap: s.listaEmLinha ? 8 : 10,
                      marginTop: 20,
                      overflowX: s.listaEmLinha ? 'auto' : undefined,
                    }}>
                      {s.lista.map((item, i) => {
                        const [label, ...rest] = item.replace(/^–\s*/, '').split(':')
                        const desc = rest.join(':').trim()
                        return (
                          <div key={i} style={{
                            background: 'rgba(148,163,184,.05)', border: '1px solid rgba(148,163,184,.12)',
                            borderRadius: 10, padding: s.listaEmLinha ? '10px 10px' : '12px 14px',
                            display: 'flex', gap: s.listaEmLinha ? 8 : 10, alignItems: 'flex-start',
                            minWidth: s.listaEmLinha ? 0 : undefined,
                          }}>
                            <div style={{
                              width: s.listaEmLinha ? 24 : 28, height: s.listaEmLinha ? 24 : 28, borderRadius: 8,
                              background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              fontSize: s.listaEmLinha ? '.7rem' : '.75rem', color: '#818cf8', fontWeight: 700,
                            }}>{i + 1}</div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{
                                fontWeight: 600, fontSize: s.listaEmLinha ? '.75rem' : '.82rem',
                                color: MANUAL_TIPO.corpo, marginBottom: desc ? 3 : 0, lineHeight: 1.35,
                              }}>{label.trim()}</p>
                              {desc && <p style={{
                                fontSize: s.listaEmLinha ? '.68rem' : '.78rem',
                                color: MANUAL_TIPO.secundario, lineHeight: 1.45,
                              }}>{desc}</p>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Cards bilaterais */}
                  {s.cardsBilaterais && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: '18px 0' }}>
                      {[s.cardsBilaterais.esquerdo, s.cardsBilaterais.direito].map((card, i) => (
                        <div key={i} style={{ background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.2)', borderRadius: 10, padding: '16px 18px' }}>
                          <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', color: '#818cf8', textTransform: 'uppercase', marginBottom: 6 }}>{card.label}</p>
                          <p style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 10, color: 'var(--ws-text,#f1f5f9)' }}>{card.titulo}</p>
                          {card.itens.map((it, j) => (
                            <p key={j} style={{ fontSize: '.8rem', color: MANUAL_TIPO.secundario, marginBottom: 4, lineHeight: 1.5 }}>{it}</p>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timeline */}
                  {s.timeline && (
                    <div style={{ margin: '18px 0', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 17, top: 20, bottom: 20, width: 2, background: 'rgba(99,102,241,.2)' }} />
                      {s.timeline.map((t) => (
                        <div key={t.passo} style={{ display: 'flex', gap: 16, marginBottom: 16, position: 'relative' }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 999, background: 'rgba(99,102,241,.15)',
                            border: '2px solid rgba(99,102,241,.4)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0, color: '#818cf8', fontWeight: 700, fontSize: '.8rem',
                          }}>{t.passo}</div>
                          <div style={{ paddingTop: 6 }}>
                            <p style={{ fontWeight: 600, fontSize: '.875rem', color: 'var(--ws-text,#f1f5f9)', marginBottom: 3 }}>{t.titulo}</p>
                            <p style={{ fontSize: '.8rem', color: MANUAL_TIPO.secundario, lineHeight: 1.55 }}>{t.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}


                  {/* Callout */}
                  {s.callout && (() => {
                    const c = CALLOUT_STYLE[s.callout.tipo]
                    return (
                      <div style={{ background: c.bg, border: `1px solid ${c.borda}`, borderRadius: 8, padding: '12px 16px', marginTop: 14 }}>
                        <p style={{ fontSize: '.7rem', fontWeight: 700, color: c.cor, marginBottom: 5, letterSpacing: '.06em', textTransform: 'uppercase' }}>{c.label}</p>
                        <p style={{ fontSize: '.82rem', color: MANUAL_TIPO.corpo, lineHeight: 1.65 }}>{s.callout.texto}</p>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────
function BarraProgresso({ pct, cor = UNI_COR, altura = 7 }: { pct: number; cor?: string; altura?: number }) {
  return (
    <div style={{ height: altura, borderRadius: 9, background: 'rgba(148,163,184,.12)', overflow: 'hidden', flex: 1 }}>
      <span style={{
        display: 'block', height: '100%', width: `${Math.min(100, pct)}%`,
        background: pct >= 100 ? 'linear-gradient(90deg,#34d399,#10b981)' : `linear-gradient(90deg,${cor},#a78bfa)`,
        transition: 'width .4s ease',
      }} />
    </div>
  )
}

export function UniversityGravity() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useUser()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const {
    currentUser, currentTheme, toggleTheme,
    tooltipsDisabled, toggleTooltips,
    organizacoes, setOrganizacoes,
  } = useShellStore()
  const { gravityAdmin: isGravityAdmin, tipoUsuario: dbRole } = useCarregarTipoUsuario()
  const isLight = currentTheme === 'light'

  useMeSync()

  const secao = pathname.includes('/docs') ? 'docs'
    : pathname.includes('/builders') ? 'builders'
    : pathname.includes('/minha-jornada') ? 'jornada'
    : 'academy'

  const partes = pathname.replace('/university-gravity/academy', '').split('/').filter(Boolean)
  const produtoSlug = (partes[0] ?? null) as ProdutoSlug | null
  const faseSlug = partes[1] ?? null

  const docsProdutoSlug = secao === 'docs'
    ? (pathname.replace('/university-gravity/docs', '').split('/').filter(Boolean)[0] ?? null) as ProdutoSlug | null
    : null

  const trilhasAtivas: Trilha[] | null = (produtoSlug && !faseSlug)
    ? (TRILHAS_POR_PRODUTO[produtoSlug] ?? null)
    : null

  // Controle local de aulas concluídas (WIP — virá do banco via API)
  const [aulasConcluidas, setAulasConcluidas] = useState<Set<string>>(() => {
    const salvo = sessionStorage.getItem('university_concluidas')
    return salvo ? new Set(JSON.parse(salvo)) : new Set(['o-que-e-o-gravity', 'criando-sua-conta', 'configurando-seu-perfil'])
  })
  const marcarConcluida = useCallback((slug: string) => {
    setAulasConcluidas(prev => {
      const novo = new Set(prev)
      novo.add(slug)
      sessionStorage.setItem('university_concluidas', JSON.stringify([...novo]))
      return novo
    })
  }, [])

  // Progresso geral nos produtos contratados
  const progressoContratados = PRODUTOS_CONTRATADOS.map(slug => ({
    slug,
    prog: TRILHAS_POR_PRODUTO[slug]?.[0]?.prog ?? 0,
    emoji: TRILHAS_POR_PRODUTO[slug]?.[0]?.emoji ?? '📦',
  }))
  const concluidos = progressoContratados.filter(p => p.prog >= 100).length
  const pctGeral = Math.round((concluidos / progressoContratados.length) * 100)

  const nomeOrganizacao = currentUser?.nomeOrganizacao ?? 'Organização'
  const userName = currentUser.name ?? user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = currentUser.email ?? user?.primaryEmailAddress?.emailAddress ?? 'usuario@usegravity.com.br'

  const orgsFetchedRef = useRef(false)
  useEffect(() => {
    if (!isGravityAdmin || orgsFetchedRef.current) return
    orgsFetchedRef.current = true
    ;(async () => {
      try {
        const token = await getToken()
        if (!token) return
        const res = await fetch('/api/v1/me/organizacoes', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.organizacoes)) setOrganizacoes(data.organizacoes)
      } catch { /* UX opcional */ }
    })()
  }, [isGravityAdmin, getToken, setOrganizacoes])

  const handleTrocarOrganizacao = async (idOrg: string) => {
    try {
      const token = await getToken()
      if (!token) return
      const res = await fetch('/api/v1/me/organizacao-ativa', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_organizacao: idOrg }),
      })
      if (!res.ok) return
      sessionStorage.removeItem('gravity_company_id')
      window.location.href = '/university-gravity/academy'
    } catch { /* silencioso */ }
  }

  const orgWorkspaceItems = isGravityAdmin
    ? organizacoes.map((org: OrganizacaoShell) => ({ id: org.id_organizacao, name: org.nome_organizacao, plan: org.subdominio_organizacao }))
    : []

  const { history: locHistory, addEntry: locAddEntry } = useLocalizadorHistory('configurador')
  const [ecoNodes] = useState<EcosystemNode[]>(buildEcosystemNodes({ currentProductId: 'configurador' }))
  useEffect(() => {
    locAddEntry({ productId: 'configurador', productLabel: t('university.modulo_nome'), productColor: UNI_COR, pageLabel: t('university.modulo_nome'), pagePath: '/university-gravity' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { document.body.classList.toggle('light-theme', isLight) }, [isLight])
  useEffect(() => { document.body.classList.toggle('tooltips-disabled', tooltipsDisabled) }, [tooltipsDisabled])

  const produtoIcon = (slug: ProdutoSlug, size = 16) => {
    const IconComp = ICON_MAP[slug]
    const prog = TRILHAS_POR_PRODUTO[slug]?.[0]?.prog ?? 0
    return prog >= 100
      ? <CheckCircle weight="fill" size={size} style={{ color: '#34d399' }} />
      : <IconComp weight="duotone" size={size} />
  }

  const navItems = [
    {
      to: '/university-gravity/academy',
      label: t('university.nav.academy'),
      icon: <Books weight="duotone" size={18} />,
      children: [
        { to: '/university-gravity/academy/login',        label: t('university.produto.login'),        icon: produtoIcon('login') },
        { to: '/university-gravity/academy/admin',        label: t('university.produto.admin'),        icon: produtoIcon('admin'), badge: t('university.badge.restrito'), badgeVariant: 'muted' as const },
        { to: '/university-gravity/academy/configurador', label: t('university.produto.configurador'), icon: produtoIcon('configurador') },
        { to: '/university-gravity/academy/hub',          label: t('university.produto.hub'),          icon: produtoIcon('hub') },
        { to: '/university-gravity/academy/store',        label: t('university.produto.store'),        icon: produtoIcon('store') },
        { to: '/university-gravity/academy/pedido',       label: t('university.produto.pedido'),       icon: produtoIcon('pedido') },
        { to: '/university-gravity/academy/smart-read',   label: t('university.produto.smart_read'),   icon: produtoIcon('smart-read') },
        { to: '/university-gravity/academy/bid-frete',    label: t('university.produto.bid_frete'),    icon: produtoIcon('bid-frete') },
        { to: '/university-gravity/academy/bid-cambio',   label: t('university.produto.bid_cambio'),   icon: produtoIcon('bid-cambio') },
        { to: '/university-gravity/academy/processo',     label: t('university.produto.processo'),     icon: produtoIcon('processo') },
      ],
    },
    {
      to: '/university-gravity/docs',
      label: t('university.nav.docs'),
      icon: <FileText weight="duotone" size={18} />,
      children: [
        { to: '/university-gravity/docs/login',        label: t('university.produto.login'),        icon: produtoIcon('login') },
        { to: '/university-gravity/docs/admin',        label: t('university.produto.admin'),        icon: produtoIcon('admin'), badge: t('university.badge.restrito'), badgeVariant: 'muted' as const },
        { to: '/university-gravity/docs/configurador', label: t('university.produto.configurador'), icon: produtoIcon('configurador') },
        { to: '/university-gravity/docs/hub',          label: t('university.produto.hub'),          icon: produtoIcon('hub') },
        { to: '/university-gravity/docs/store',        label: t('university.produto.store'),        icon: produtoIcon('store') },
        { to: '/university-gravity/docs/pedido',       label: t('university.produto.pedido'),       icon: produtoIcon('pedido') },
        { to: '/university-gravity/docs/smart-read',   label: t('university.produto.smart_read'),   icon: produtoIcon('smart-read') },
        { to: '/university-gravity/docs/bid-frete',    label: t('university.produto.bid_frete'),    icon: produtoIcon('bid-frete') },
        { to: '/university-gravity/docs/bid-cambio',   label: t('university.produto.bid_cambio'),   icon: produtoIcon('bid-cambio') },
        { to: '/university-gravity/docs/processo',     label: t('university.produto.processo'),     icon: produtoIcon('processo') },
      ],
    },
    { to: '/university-gravity/builders',      label: t('university.nav.builders'),      icon: <PuzzlePiece weight="duotone" size={18} />, badge: t('university.badge.em_breve'), badgeVariant: 'muted' as const },
    { to: '/university-gravity/minha-jornada', label: t('university.nav.minha_jornada'), icon: <Path weight="duotone" size={18} /> },
  ]

  const tituloSecao = produtoSlug
    ? t(`university.produto.${produtoSlug.replaceAll('-', '_')}`)
    : secao === 'jornada' ? t('university.nav.minha_jornada')
    : secao === 'docs' ? t('university.nav.docs')
    : secao === 'builders' ? t('university.nav.builders')
    : t('university.nav.academy')

  return (
    <div className="ws-shell">
      <MenuLateralGlobal
        tenantName={nomeOrganizacao}
        tenantPlan={isGravityAdmin ? 'Super Admin' : (currentUser?.nomeWorkspacePreferido ?? nomeOrganizacao)}
        navItems={navItems}
        moduleName={t('university.modulo_nome')}
        moduleColor={UNI_COR}
        defaultCollapsed={false}
        workspaces={isGravityAdmin ? orgWorkspaceItems : undefined}
        onSwitchWorkspace={isGravityAdmin ? handleTrocarOrganizacao : undefined}
        dropdownSearchPlaceholder={isGravityAdmin ? t('university.busca.organizacao') : undefined}
      />

      <div className="ws-main">
        <div className="ws-global-actions">
          <HubBotao onClick={() => navigate('/hub?select=1')} />

          <CampoLocalizarExpandidoGlobal
            onBuscarNavigate={(term) => {
              const alvo = navItems.find(i => i.label.toLowerCase().includes(term.toLowerCase()))
              if (alvo) navigate(alvo.to ?? '/university-gravity/academy')
            }}
          />

          <TooltipGlobal
            titulo={t('university.dica.titulo')}
            descricao={
              <span style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} weight="fill" style={{ color: UNI_COR, flexShrink: 0 }} />
                  <span>{t('university.dica.habilitadas')}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} weight="regular" style={{ color: '#64748b', flexShrink: 0 }} />
                  <span>{t('university.dica.desabilitadas')}</span>
                </span>
              </span>
            }
          >
            <button
              className="ws-global-btn"
              onClick={toggleTooltips}
              style={{ color: tooltipsDisabled ? 'var(--ws-muted)' : 'var(--ws-accent)' }}
              type="button"
            >
              <Info size={20} weight={tooltipsDisabled ? 'regular' : 'fill'} />
            </button>
          </TooltipGlobal>

          <Notificacoes />

          <LocalizadorGlobal
            workspaceName={nomeOrganizacao}
            currentProductId="configurador"
            currentProductLabel={t('university.modulo_nome')}
            currentProductColor={UNI_COR}
            currentPageLabel={tituloSecao}
            history={locHistory}
            nodes={ecoNodes}
            onNavigate={(node) => {
              if (node.type === 'hub')               navigate('/hub?select=1')
              else if (node.type === 'configurador') navigate('/configurador/workspaces')
              else if (node.type === 'core')         navigate('/core')
              else if (node.type === 'admin')        navigate('/admin/visao-geral')
              else if (node.type === 'produto')      navigate(`/produto/${node.id}`)
            }}
            iconOnly
          />

          <SeletorIdiomaGlobal />

          <div style={{ width: '1px', height: '24px', background: 'var(--bg-elevated)', margin: '0 0.25rem' }} />

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole={mapRole(dbRole)}
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateWorkspace={() => navigate('/configurador/organizacao')}
            onNavigateMarketPlace={() => navigate('/store')}
            onSignOut={() => signOut()}
            isAdmin={isGravityAdmin}
            onNavigateAdmin={() => navigate('/admin/visao-geral')}
            compact
          />
        </div>

        {/* ══ Player de aula (rota /academy/{produto}/{fase}) ══ */}
        {secao === 'academy' && faseSlug && produtoSlug && (() => {
          const aula = getAulaDemo(produtoSlug, faseSlug)
          const todasAulas = getAulasDemo(produtoSlug)
          if (!aula) return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ws-muted,#94a3b8)' }}>
              Aula não encontrada.
            </div>
          )
          return (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <PlayerAula
                produtoSlug={produtoSlug}
                faseSlug={faseSlug}
                aula={aula}
                todasAulas={todasAulas}
                concluidas={aulasConcluidas}
                onMarcarConcluida={marcarConcluida}
              />
            </div>
          )
        })()}

        {/* ══ Resto das views (overview, jornada, docs, builders) ══ */}
        {!(secao === 'academy' && faseSlug) && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem 3rem' }}>

          {/* ── Cabeçalho ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <GraduationCap weight="duotone" size={24} color={UNI_COR} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ws-text,#f1f5f9)' }}>
              {tituloSecao}
            </h1>
          </div>

          {/* ── Banner ── */}
          <div style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            background: 'linear-gradient(135deg, rgba(167,139,250,.12), rgba(129,140,248,.05))',
            border: '1px solid rgba(167,139,250,.28)', borderRadius: 14, padding: '14px 16px', marginBottom: 24,
          }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#a78bfa,#818cf8)', color: '#0b1220' }}>
              <Sparkle weight="fill" size={18} />
            </div>
            <div>
              <div style={{ fontSize: '.62rem', fontWeight: 800, letterSpacing: '.08em', color: '#a78bfa', textTransform: 'uppercase' }}>
                {t('university.banner.em_construcao')}
              </div>
              <p style={{ fontSize: '.86rem', marginTop: 4, lineHeight: 1.55, color: 'var(--ws-text,#f1f5f9)' }}>
                {t('university.banner.descricao')}
              </p>
            </div>
          </div>

          {/* ══ BARRA 3 — Progresso nos produtos contratados (sempre visível no academy) ══ */}
          {secao === 'academy' && (
            <div style={{
              background: 'var(--bg-base,#1e293b)',
              border: '1px solid rgba(148,163,184,.12)',
              borderRadius: 14, padding: '14px 18px', marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ws-muted,#94a3b8)' }}>
                  {t('university.progresso.produtos_contratados')}
                </span>
                <span style={{ fontSize: '.78rem', fontWeight: 700, color: pctGeral >= 100 ? '#34d399' : 'var(--ws-text,#f1f5f9)' }}>
                  {concluidos} / {progressoContratados.length} {t('university.progresso.concluidos')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <BarraProgresso pct={pctGeral} altura={8} />
                <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--ws-muted,#94a3b8)', whiteSpace: 'nowrap' }}>{pctGeral}%</span>
              </div>
              {/* Pills de produto */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {progressoContratados.map(p => (
                  <button
                    key={p.slug}
                    onClick={() => navigate(`/university-gravity/academy/${p.slug}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: '.72rem', fontWeight: 700,
                      background: p.prog >= 100 ? 'rgba(52,211,153,.15)' : p.prog > 0 ? 'rgba(129,140,248,.15)' : 'rgba(148,163,184,.08)',
                      color: p.prog >= 100 ? '#34d399' : p.prog > 0 ? UNI_COR : 'var(--ws-muted,#94a3b8)',
                    }}
                  >
                    <span>{p.emoji}</span>
                    <span>{t(`university.produto.${p.slug.replaceAll('-', '_')}`)}</span>
                    {p.prog >= 100 && <CheckFat weight="fill" size={11} />}
                    {p.prog > 0 && p.prog < 100 && <span style={{ color: 'var(--ws-muted,#94a3b8)' }}>{p.prog}%</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══ VIEW: produto específico ══ */}
          {secao === 'academy' && trilhasAtivas && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {trilhasAtivas.map(tr => {
                const fasesFeitas = tr.fases.filter(f => f.concluida).length
                const pctModulo = Math.round((fasesFeitas / tr.fases.length) * 100)

                return (
                  <div key={tr.nome}>
                    {/* ── CARD: header do módulo ── */}
                    <div style={{
                      background: 'var(--bg-base,#1e293b)', border: '1px solid rgba(148,163,184,.12)',
                      borderRadius: 14, padding: '18px 20px',
                    }}>
                      {/* Título + tempo total */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 11, display: 'grid', placeItems: 'center', background: `${tr.tag}22`, fontSize: 22 }}>
                            {tr.emoji}
                          </div>
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{tr.nome}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--ws-muted,#94a3b8)', marginTop: 2 }}>
                              {t('university.trilha.modulos', { count: tr.modulos })}
                            </div>
                          </div>
                        </div>
                        {/* Tempo total */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          background: 'rgba(148,163,184,.08)', borderRadius: 9999, padding: '5px 12px',
                          fontSize: '.75rem', fontWeight: 700, color: 'var(--ws-muted,#94a3b8)', flexShrink: 0,
                        }}>
                          <Clock weight="duotone" size={14} style={{ color: UNI_COR }} />
                          {t('university.trilha.total')} {tr.duracao}
                        </div>
                      </div>

                      {/* ── BARRA 2 — conclusão do módulo ── */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <BarraProgresso pct={pctModulo} />
                        <span style={{ fontSize: '.75rem', fontWeight: 700, color: pctModulo >= 100 ? '#34d399' : 'var(--ws-muted,#94a3b8)', whiteSpace: 'nowrap' }}>
                          {pctModulo >= 100 ? t('university.acao.concluida') : `${pctModulo}%`}
                        </span>
                      </div>

                      {/* ── BARRA 1 — fases individuais ── */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {tr.fases.map((fase, idx) => (
                          <div
                            key={fase.nome}
                            onClick={() => navigate(`/university-gravity/academy/${produtoSlug}/${fase.slug}`)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                              borderTop: idx > 0 ? '1px solid rgba(148,163,184,.07)' : 'none',
                              cursor: 'pointer',
                            }}
                          >
                            {/* Indicador */}
                            <div style={{
                              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                              display: 'grid', placeItems: 'center',
                              background: fase.concluida ? 'rgba(52,211,153,.15)' : 'rgba(148,163,184,.08)',
                              border: fase.concluida ? '1.5px solid rgba(52,211,153,.4)' : '1.5px solid rgba(148,163,184,.15)',
                            }}>
                              {fase.concluida
                                ? <CheckCircle weight="fill" size={14} style={{ color: '#34d399' }} />
                                : <span style={{ fontSize: '.6rem', fontWeight: 800, color: 'var(--ws-muted,#94a3b8)' }}>{idx + 1}</span>
                              }
                            </div>
                            {/* Nome */}
                            <span style={{
                              flex: 1, fontSize: '.86rem', fontWeight: 600,
                              color: 'var(--ws-text,#f1f5f9)',
                            }}>
                              {fase.nome}
                            </span>
                            {/* Tempo individual */}
                            <span style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              fontSize: '.72rem', fontWeight: 700, color: 'var(--ws-muted,#94a3b8)', flexShrink: 0,
                            }}>
                              <Clock size={12} />
                              {fase.duracao}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div style={{ marginTop: 16 }}>
                        <button style={{
                          border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.82rem', padding: '9px 18px',
                          borderRadius: 9999,
                          background: pctModulo >= 100 ? 'rgba(52,211,153,.15)' : UNI_COR,
                          color: pctModulo >= 100 ? '#34d399' : '#0b1220',
                        }}>
                          {pctModulo >= 100 ? t('university.acao.concluida') : pctModulo > 0 ? t('university.acao.continuar') : t('university.acao.iniciar_jornada')}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ══ VIEW: visão geral agrupada ══ */}
          {secao === 'academy' && !trilhasAtivas && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {GRUPOS_TRILHAS.map(grupo => (
                <div key={grupo.tituloKey}>
                  <h2 style={{ fontSize: '.74rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ws-muted,#94a3b8)', marginBottom: 12 }}>
                    {t(grupo.tituloKey)}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                    {grupo.trilhas.map(tr => (
                      <div key={tr.nome} style={{
                        background: 'var(--bg-base,#1e293b)', border: '1px solid rgba(148,163,184,.12)',
                        borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 11,
                      }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, display: 'grid', placeItems: 'center', background: `${tr.tag}22`, fontSize: 20 }}>
                          {tr.emoji}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700 }}>{tr.nome}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', color: 'var(--ws-muted,#94a3b8)' }}>
                          <Clock size={12} />
                          {t('university.trilha.modulos', { count: tr.modulos })} · {tr.duracao}
                        </div>
                        {tr.prog > 0 && <BarraProgresso pct={tr.prog} />}
                        <button style={{
                          border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.82rem', padding: '8px 14px',
                          borderRadius: 9999,
                          background: tr.prog >= 100 ? 'rgba(52,211,153,.15)' : UNI_COR,
                          color: tr.prog >= 100 ? '#34d399' : '#0b1220',
                        }}>
                          {tr.prog >= 100 ? t('university.acao.concluida') : tr.prog > 0 ? t('university.acao.continuar') : t('university.acao.iniciar_jornada')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {secao === 'jornada' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              {[
                { k: 'university.jornada.pontos', v: '1.240' },
                { k: 'university.jornada.concluidas', v: '2' },
                { k: 'university.jornada.em_andamento', v: '1' },
                { k: 'university.jornada.certificados', v: '2' },
              ].map(kpi => (
                <div key={kpi.k} style={{ background: 'var(--bg-surface,#334155)', borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ws-muted,#94a3b8)' }}>{t(kpi.k)}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 6 }}>{kpi.v}</div>
                </div>
              ))}
            </div>
          )}

          {secao === 'docs' && !docsProdutoSlug && (
            <div style={{
              textAlign: 'center', padding: '60px 20px', color: 'var(--ws-muted,#94a3b8)',
              border: '1px dashed rgba(148,163,184,.2)', borderRadius: 14,
            }}>
              <div style={{ fontSize: 48, opacity: .2 }}>📚</div>
              <p style={{ marginTop: 10, fontWeight: 600 }}>Selecione um produto no menu lateral</p>
              <p style={{ fontSize: '.82rem', marginTop: 4 }}>{t('university.docs.descricao')}</p>
            </div>
          )}

          {secao === 'docs' && docsProdutoSlug === 'login' && (
            <DocLoginManual />
          )}

          {secao === 'docs' && docsProdutoSlug && docsProdutoSlug !== 'login' && (
            <div style={{
              textAlign: 'center', padding: '60px 20px', color: 'var(--ws-muted,#94a3b8)',
              border: '1px dashed rgba(148,163,184,.2)', borderRadius: 14,
            }}>
              <div style={{ fontSize: 48, opacity: .2 }}>📄</div>
              <p style={{ marginTop: 10, fontWeight: 600 }}>Manual em construção</p>
              <p style={{ fontSize: '.82rem', marginTop: 4 }}>O manual de <strong>{docsProdutoSlug}</strong> estará disponível em breve.</p>
            </div>
          )}

          {secao === 'builders' && (
            <div style={{
              textAlign: 'center', padding: '60px 20px', color: 'var(--ws-muted,#94a3b8)',
              border: '1px dashed rgba(148,163,184,.2)', borderRadius: 14,
            }}>
              <div style={{ fontSize: 48, opacity: .2 }}>🧩</div>
              <p style={{ marginTop: 10, fontWeight: 600 }}>{t('university.vazio.em_breve', { secao: tituloSecao })}</p>
              <p style={{ fontSize: '.82rem', marginTop: 4 }}>{t('university.builders.descricao')}</p>
            </div>
          )}

        </div>
        )}
      </div>

      <ToastContainer />
    </div>
  )
}
