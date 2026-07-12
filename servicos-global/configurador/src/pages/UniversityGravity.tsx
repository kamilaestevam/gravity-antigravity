/**
 * UniversityGravity: layout da Gravity University (serviço de plataforma).
 *
 * ⚠️ PROTÓTIPO / WIP. Mesmo layout do Configurador: MenuLateralGlobal (sidebar)
 * com título "Gravity University" + opções e dropdown de organizações, e as
 * mesmas ações de topo (Hub, busca/localizar, dica, notificações, localizador,
 * idioma, usuário). Textos via i18n (namespace `university`). Implementação real em
 * documentos-tecnicos/produtos-gravity/university-gravity/ (PRD + MODELO-DADOS + SPECS).
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import {
  Books, FileText, PuzzlePiece, Path, Sparkle, GraduationCap, Info,
  SignIn, ShieldStar, Gear, SquaresFour, ShoppingBag, Package,
  MagnifyingGlass, AirplaneTilt, ArrowsLeftRight, GitBranch, CheckCircle,
  Clock, CheckFat, WarningCircle, Eye, EyeSlash, Envelope, Lock, ArrowsOut,
  Compass, CaretDown,
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
import { CONFIGURADOR_MANUAL_ITENS, resolverConfiguradorManualSlug } from './university/manual-configurador-conteudo'
import { DocConfiguradorManual, iconeConfiguradorManual, MANUAL_ESTILO_ACORDEON_SECAO, useManualSumarioScroll } from './university/manual-configurador-ui'
import { DOC_HUB_SUBTITULO } from './university/manual-hub-conteudo'
import { DOC_NAVEGACAO_SUBTITULO } from './university/manual-navegacao-conteudo'
import { DOC_STORE_SUBTITULO } from './university/manual-store-conteudo'
import { DOC_SMART_READ_SUBTITULO } from './university/manual-smart-read-conteudo'
import { DOC_PEDIDO_SUBTITULO } from './university/manual-pedido-conteudo'
import { DocNavegacaoManual } from './university/manual-navegacao-ui'
import { DocHubManual } from './university/manual-hub-ui'
import { DocStoreManual } from './university/manual-store-ui'
import { DocSmartReadManual } from './university/manual-smart-read-ui'
import { DocPedidoManual } from './university/manual-pedido-ui'
import { DocBidFreteManual } from './university/manual-bid-frete-ui'
import { DocApiCockpitManual } from './university/manual-api-cockpit-ui'
import { DOC_API_COCKPIT_SUBTITULO } from './university/manual-api-cockpit-conteudo'
import { MANUAL_ESPACO_PARAGRAFO_PX, MANUAL_ALINHAMENTO_CORPO, MANUAL_CORPO_TIPOGRAFIA, MANUAL_ESPACO_ENTRE_PASSOS_PX, manualMargemParagrafo } from './university/manual-tipografia'
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

// ── Catálogo WIP: virá do banco via API ───────────────────────────────────
const TRILHAS_POR_PRODUTO: Record<string, Trilha[]> = {
  login: [{
    tag: '#60a5fa', emoji: '🔑', nome: 'Primeiros Passos: Login', modulos: 3, duracao: '30m', prog: 100,
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

// Produtos que esta organização contratou (WIP: virá do backend)
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
  navegacao:    Compass,
  admin:        ShieldStar,
  configurador: Gear,
  gabi:         Sparkle,
  hub:          SquaresFour,
  store:        ShoppingBag,
  pedido:       Package,
  'smart-read': MagnifyingGlass,
  'bid-frete':  AirplaneTilt,
  'bid-cambio': ArrowsLeftRight,
  processo:     GitBranch,
} as const

type ProdutoSlug = keyof typeof ICON_MAP

// ── Manual de Login: dados enterprise ────────────────────────────────────
interface DocPassoVisual {
  num: number
  titulo: string
  paragrafos: string[]
  imagem?: string
  callout?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }
  callouts?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }[]
  painelRequisitosCadastro?: boolean
  galeriaTelas?: { legenda: string; imagem: string }[]
  linkCapitulo?: { texto: string; href: string }
  /** Screenshot em largura total abaixo do texto (evita buraco lateral quando há vários callouts). */
  imagemAbaixoTexto?: boolean
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

const DOC_LOGIN_SUBTITULO =
  'Login, cadastro, recuperação de senha e convites'

const DOC_LOGIN_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '1.0' },
  { rotulo: 'Atualizado em', valor: 'junho 2026' },
  { rotulo: 'Produto', valor: 'Configurador' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/login', href: true },
  { rotulo: 'Rota base', valor: '/login' },
]

const DOC_LOGIN_SECOES: DocSecao[] = [
  {
    num: 1,
    titulo: 'A tela de acesso',
    imagem: '/university/screenshots/login-tela-completa.png',
    layoutTextoImagemLateral: true,
    listaEmLinha: true,
    paragrafos: [
      'Esta é a primeira tela que você vê ao acessar a plataforma **Gravity**. No lado esquerdo, a identidade da plataforma: Logo e proposta de valor.',
      'No lado direito, o **formulário de acesso**. Você pode entrar com sua conta **Google** clicando em "Continuar com Google", ou digitar diretamente seu **e-mail** e **senha**. Ao clicar em "Entrar", o sistema valida suas credenciais e te direciona automaticamente para o lugar certo.',
    ],
    lista: [
      'Botão "Continuar com Google": Acesso rápido sem precisar digitar e-mail e senha',
      'Campo E-mail: Informe o e-mail com o qual você se cadastrou',
      'Campo Senha: Sua senha da plataforma, clique no ícone de olho {{icone:olho}} para revelar',
      'Botão "Entrar": Inicia a validação e te leva para o hub ou onboarding',
      'Link "Esqueceu a senha?": Recuperação por e-mail em dois passos',
      'Link "Registre-se": Cria uma nova conta na plataforma',
    ],
  },
  {
    num: 2,
    titulo: 'Fluxo 1: Criar sua conta',
    paragrafos: [
      'Se você ainda não tem conta na Gravity, o cadastro leva poucos minutos em duas etapas: Dados pessoais e confirmação por e-mail.',
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
          'O botão "Continuar" só é habilitado quando os sete itens abaixo estiverem verdes: Incluindo confirmação de senha e aceite dos Termos de Uso.',
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
        titulo: 'Receber o código',
        imagem: '/university/screenshots/login-fluxo1-passo-04-verificacao-email.png',
        paragrafos: [
          'Abra o e-mail da Gravity e copie o código de 6 dígitos. Confira se o endereço exibido na tela de verificação corresponde ao e-mail que você cadastrou.',
        ],
        callout: {
          tipo: 'dica',
          texto: 'Não chegou? Confira spam/lixo eletrônico, aba Promoções, filtros do antivírus ou bloqueio do remetente notifications@usegravity.com.br: E se o e-mail foi digitado corretamente. Só então use "Reenviar código" na tela de verificação.',
        },
      },
      {
        num: 6,
        titulo: 'Digitar o código',
        imagem: '/university/screenshots/login-fluxo1-passo-05-codigo-vazio.png',
        paragrafos: [
          'Na tela de verificação, preencha os seis campos numéricos: O foco avança automaticamente. Você também pode colar o código completo de uma vez.',
        ],
      },
      {
        num: 7,
        titulo: 'Concluir o cadastro',
        imagem: '/university/screenshots/login-fluxo1-passo-06-codigo-preenchido.png',
        paragrafos: [
          'Clique em "Verificar". Com o código correto, sua sessão é ativada e você é direcionado ao onboarding (/trial) para configurar a organização.',
        ],
        callouts: [
          {
            tipo: 'aviso',
            texto: 'Se aparecer um aviso vermelho abaixo do código (ex.: "Incorrect code"), o dígito informado provavelmente está errado ou expirou. Confira o e-mail; se o código estiver certo e o erro continuar, clique em "Reenviar código" e repita o processo.',
          },
          {
            tipo: 'dica',
            texto: 'Se o código expirar, use "Reenviar código" na tela de verificação: Um novo código é enviado ao mesmo e-mail.',
          },
        ],
      },
      {
        num: 8,
        titulo: 'Onboarding e destino no Hub',
        paragrafos: [
          'Pronto, você já está no Gravity. Em um minuto, digite o nome da empresa que está contratando, o CNPJ, e já está na tela {{link:/university-gravity/docs/hub|HUB}}.',
        ],
        galeriaTelas: [
          { legenda: '1 · Nome da organização', imagem: '/university/screenshots/onboarding-nome-preenchido.png' },
          { legenda: '2 · CNPJ da empresa', imagem: '/university/screenshots/onboarding-cnpj-preenchido.png' },
          { legenda: '3 · Hub: Destino final', imagem: '/university/screenshots/onboarding-hub-sem-produto.png' },
        ],
      },
    ],
  },
  {
    num: 3,
    titulo: 'Fluxo 2: Entrar com e-mail e senha',
    paragrafos: [
      'Para quem já tem conta: Acesse https://usegravity.com.br/login e siga os passos abaixo. Após entrar, você vai ao Hub ou ao onboarding; contas com 2FA pedem um código extra antes de concluir.',
    ],
    passosVisuais: [
      {
        num: 1,
        titulo: 'Informar e-mail e senha',
        imagem: '/university/screenshots/login-fluxo2-passo-01-tela-completa.png',
        paragrafos: [
          'Abra https://usegravity.com.br/login no navegador.',
          'Na tela "Acessar a plataforma", preencha o campo E-mail com o endereço cadastrado na Gravity e o campo Senha logo abaixo. O ícone de olho {{icone:olho}} à direita da senha revela ou oculta o que você digitou antes de enviar.',
        ],
        callouts: [
          {
            tipo: 'dica',
            texto: 'Prefere não digitar senha? Use "Continuar com Google" no topo do painel.',
          },
          {
            tipo: 'dica',
            texto: 'Ainda não tem conta? Clique em "Registre-se" no rodapé do formulário.',
          },
          {
            tipo: 'dica',
            texto: 'Esqueceu a senha? Use o link "Esqueceu a senha?" abaixo do botão Entrar: O fluxo completo está na seção 4 deste manual.',
          },
        ],
      },
      {
        num: 2,
        titulo: 'Clicar em Entrar',
        imagem: '/university/screenshots/login-tela-completa.png',
        paragrafos: [
          'Com os dois campos preenchidos, clique em "Entrar". Enquanto valida, o botão exibe carregamento. Se e-mail ou senha estiverem incorretos, um banner vermelho no topo do formulário explica o problema: Sem liberar o acesso.',
        ],
        callouts: [
          {
            tipo: 'aviso',
            texto: 'Após muitas tentativas erradas, o Clerk pode exigir CAPTCHA ou bloquear temporariamente o acesso. Aguarde alguns minutos antes de tentar de novo.',
          },
          {
            tipo: 'seguranca',
            texto: 'O login da Gravity é processado pelo Clerk, plataforma especializada em autenticação (certificação SOC 2). Sua senha nunca fica em texto puro: o Clerk aplica hash bcrypt e verifica se ela já apareceu em vazamentos conhecidos (Have I Been Pwned). A conexão é feita por HTTPS e a sessão usa tokens de curta duração com renovação automática. O Clerk confirma quem você é; permissões e dados da sua organização ficam nos sistemas da Gravity.',
          },
        ],
      },
      {
        num: 3,
        titulo: 'Verificação em duas etapas (opcional)',
        imagem: '/university/screenshots/login-fluxo1-passo-05-codigo-vazio.png',
        paragrafos: [
          'Este passo não é obrigatório: Só aparece se a sua conta ou organização tiver 2FA (autenticação em duas etapas) ativo. Sem 2FA, após a senha correta você segue direto para o Hub.',
          'Quando o 2FA está ligado, a tela pede um código de seis dígitos (e-mail ou autenticador). Preencha os campos ou cole o código inteiro para concluir a sessão.',
        ],
        callout: {
          tipo: 'dica',
          texto: 'Não recebeu o código por e-mail? Verifique spam, Promoções, filtros do antivírus ou bloqueio de notifications@usegravity.com.br antes de solicitar reenvio.',
        },
      },
      {
        num: 4,
        titulo: 'Próxima tela: O Hub',
        imagem: '/university/screenshots/hub-inicial-sem-produto-contratado.png',
        paragrafos: [
          'Pronto, você já está no Gravity. Com login concluído e organização ativa, a próxima tela é o {{link:/university-gravity/docs/hub|HUB}}: Daqui você escolhe produtos e workspaces.',
        ],
      },
    ],
  },
  {
    num: 4,
    titulo: 'Fluxo 3: Recuperar senha',
    paragrafos: [
      'Esqueceu a senha? Em poucos passos você solicita um código por e-mail e define uma nova senha: Sem precisar falar com o suporte.',
    ],
    passosVisuais: [
      {
        num: 1,
        titulo: 'Abrir a recuperação',
        imagem: '/university/screenshots/login-esqueci-senha-passo-01-seta-link.png',
        paragrafos: [
          'Na tela de login, clique em "Esqueceu a senha?" abaixo do botão Entrar. Você é levado para a página de recuperação.',
        ],
      },
      {
        num: 2,
        titulo: 'Informar o e-mail',
        imagem: '/university/screenshots/login-esqueci-senha-passo-02-preencher-email.png',
        paragrafos: [
          'Digite o e-mail com o qual você se cadastrou na Gravity e clique em "Enviar código". O sistema envia um código de 6 dígitos para essa caixa de entrada.',
        ],
      },
      {
        num: 3,
        titulo: 'Confirmação de envio',
        imagem: '/university/screenshots/login-esqueci-senha-passo-03-confirmacao-envio.png',
        paragrafos: [
          'A tela confirma que o e-mail foi disparado. Abra a caixa de entrada do endereço informado e procure a mensagem da Gravity.',
        ],
      },
      {
        num: 4,
        titulo: 'Receber o código',
        imagem: '/university/screenshots/login-esqueci-senha-passo-04-email-codigo.png',
        paragrafos: [
          'No e-mail da Gravity, copie o código de 6 dígitos. Confira se o destinatário é o mesmo e-mail que você digitou na etapa anterior.',
        ],
        callout: {
          tipo: 'dica',
          texto: 'Não chegou? Confira spam, Promoções, filtros do antivírus ou bloqueio de notifications@usegravity.com.br: E se o e-mail foi digitado corretamente.',
        },
      },
      {
        num: 5,
        titulo: 'Ir para a redefinição',
        imagem: '/university/screenshots/login-esqueci-senha-passo-05-tenho-codigo.png',
        paragrafos: [
          'De volta à tela de recuperação, clique em "Tenho o código" para abrir o formulário de redefinição com o e-mail já preenchido.',
        ],
        callout: {
          tipo: 'dica',
          texto: 'Se você fechou a aba, acesse https://usegravity.com.br/recuperar-senha/redefinir com o mesmo e-mail: Ou volte ao passo 2 e solicite um novo código.',
        },
      },
      {
        num: 6,
        titulo: 'Informar o código',
        imagem: '/university/screenshots/login-esqueci-senha-passo-06-validar-codigo.png',
        paragrafos: [
          'Na tela "Redefinir senha", preencha os seis campos do código recebido por e-mail. Você também pode colar o código completo de uma vez.',
        ],
        callout: {
          tipo: 'aviso',
          texto: 'Se aparecer um aviso vermelho (ex.: Código incorreto ou expirado), confira o e-mail e solicite "Reenviar código" antes de tentar de novo.',
        },
      },
      {
        num: 7,
        titulo: 'Definir a nova senha',
        imagem: '/university/screenshots/login-esqueci-senha-passo-07-trocar-senha.png',
        paragrafos: [
          'Informe a nova senha e a confirmação. A barra abaixo do campo mostra a força: As mesmas regras do cadastro se aplicam.',
          'Clique em "Redefinir senha". Com sucesso, sua sessão é ativada e você vai para o {{link:/university-gravity/docs/hub|HUB}}.',
        ],
      },
    ],
  },
  {
    num: 5,
    titulo: 'Fluxo 4: Convite de outro usuário',
    paragrafos: [
      'Apenas usuários **Master** podem convidar outras pessoas para a organização: Como **Master**, **Standard** ou **Fornecedor**. O convite é feito pelo **Configurador**; o convidado recebe um e-mail com link para completar o cadastro e entrar na organização.',
    ],
    passosVisuais: [
      {
        num: 1,
        titulo: 'Abrir o Configurador',
        imagem: '/university/screenshots/login-convite-passo-01-acesso-atalho.png',
        paragrafos: [
          'No menu superior, clique no ícone do usuário e escolha **Configurador**. Você também pode acessar pelo atalho na barra lateral.',
        ],
      },
      {
        num: 2,
        titulo: 'Acessar Usuários',
        imagem: '/university/screenshots/login-convite-passo-02-lista-usuarios.png',
        paragrafos: [
          'No menu lateral do **Configurador**, abra **Usuários** para ver a lista de pessoas da organização.',
        ],
      },
      {
        num: 3,
        titulo: 'Iniciar o convite',
        imagem: '/university/screenshots/login-convite-passo-03-botao-convidar.png',
        paragrafos: [
          'Na lista de usuários da organização, clique em "Convidar usuário". O modal de convite abre no centro da tela.',
        ],
      },
      {
        num: 4,
        titulo: 'Dados básicos',
        imagem: '/university/screenshots/login-convite-passo-04-formulario-vazio.png',
        paragrafos: [
          'Informe o e-mail do convidado e escolha o tipo de usuário (**Master**, **Standard** ou **Fornecedor**).',
        ],
      },
      {
        num: 5,
        titulo: 'Tipo de usuário',
        imagem: '/university/screenshots/login-convite-passo-05-nome-email-tipo.png',
        paragrafos: [
          '**Master** tem acesso total na organização. **Standard** e **Fornecedor** dependem das permissões e workspaces que você marcar nos próximos passos.',
        ],
        callout: {
          tipo: 'dica',
          texto: 'O e-mail do convite é o login do convidado. Confira se não há erro de digitação antes de enviar.',
        },
      },
      {
        num: 6,
        titulo: 'Permissões',
        imagem: '/university/screenshots/login-convite-passo-06-permissoes.png',
        paragrafos: [
          'Marque as {{link:/university-gravity/docs/configurador/usuarios#doc-sec-5|permissões}} que o convidado terá em cada área do **Configurador**. Só libere o que essa pessoa realmente precisa usar.',
        ],
      },
      {
        num: 7,
        titulo: 'Workspaces',
        imagem: '/university/screenshots/login-convite-passo-07-workspaces.png',
        paragrafos: [
          'Selecione os **workspaces** aos quais o convidado terá acesso. Pode ser filial, outra empresa do grupo ou cliente de despachante e agente. **Master** já acessa todos automaticamente.',
        ],
      },
      {
        num: 8,
        titulo: 'Status na lista',
        imagem: '/university/screenshots/login-convite-passo-08-lista-status.png',
        paragrafos: [
          'Depois de enviar o convite, o convidado aparece na lista com badge Convidado (amarelo) até concluir o cadastro pelo e-mail.',
          'Quando o fluxo termina, o badge muda para Ativo (verde) e a pessoa já pode entrar na plataforma.',
        ],
        callout: {
          tipo: 'dica',
          texto: 'Cada link de convite é de uso único. Se expirar ou for perdido, cancele ou reenvie o convite pela mesma lista de usuários.',
        },
      },
      {
        num: 9,
        titulo: 'O que o convidado faz',
        imagem: '/university/screenshots/login-fluxo1-passo-02-formulario-vazio.png',
        paragrafos: [
          'O convidado abre o e-mail e clica no link. Nome e e-mail já vêm preenchidos; ele define a senha, aceita os termos e verifica o código de 6 dígitos (mesmo fluxo da seção 02, Fluxo 1).',
          'Com o cadastro concluído, passa a acessar o Gravity com base nas permissões e workspaces marcados, entrando pelo {{link:/university-gravity/docs/hub|HUB}}.',
        ],
        callout: {
          tipo: 'aviso',
          texto: 'Se o convidado já estiver logado com outra conta no navegador, o sistema encerra essa sessão antes de processar o convite. Isso evita vincular o ticket à conta errada.',
        },
      },
    ],
  },
  {
    num: 6,
    titulo: 'Entrar com Google',
    paragrafos: [
      'Além de e-mail e senha, você pode usar o botão "Continuar com Google" na tela de login ou de cadastro.',
    ],
    passosVisuais: [
      {
        num: 1,
        titulo: 'O que é',
        imagem: '/university/screenshots/login-fluxo2-passo-01-tela-completa.png',
        paragrafos: [
          '"Continuar com Google" é um atalho de login: Você autoriza o Google a confirmar sua identidade para o Gravity. O e-mail da conta Google passa a ser o seu login na plataforma.',
          'O botão fica no topo do painel direito, antes dos campos de e-mail e senha.',
        ],
      },
      {
        num: 2,
        titulo: 'Como funciona',
        paragrafos: [
          'Ao clicar, o navegador abre a tela do Google para você escolher a conta e autorizar o acesso.',
          'Depois da autorização, o Google devolve você ao Gravity em uma página intermediária de retorno. Em condições normais, isso leva poucos segundos e você segue para o Hub (se já tem organização) ou para o onboarding (conta nova).',
        ],
      },
      {
        num: 3,
        titulo: 'Se der problema na tela de retorno',
        imagem: '/university/screenshots/login-google-problema-sso-callback.png',
        paragrafos: [
          'Às vezes, após autorizar no Google, o navegador para em uma tela escura na URL usegravity.com.br/login/sso-callback e não avança para o Hub. Isso já aconteceu com usuários reais.',
        ],
        callouts: [
          {
            tipo: 'exemplo',
            texto: 'Exemplo real: Alguém tentou entrar pelo Hub com conta Google e perguntou "não posso entrar com uma Google account?". Ao autorizar, a tela ficou escura em /login/sso-callback sem redirecionar.',
          },
          {
            tipo: 'aviso',
            texto: 'O que fazer: Feche a aba travada e abra https://usegravity.com.br/login em aba anônima. Confira se o e-mail Google corresponde ao convite ou cadastro. Se persistir, use login com e-mail e senha ou avise o suporte informando o e-mail usado.',
          },
        ],
      },
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

/** Manual descritivo: tokens SSOT: ONBOARDING-DOCUMENTO.md §9 */
const MANUAL_TITULO_COR = 'var(--ws-text,#f1f5f9)'
const MANUAL_CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const MANUAL_TIPO = {
  titulo: MANUAL_TITULO_COR,
  corpo: MANUAL_CORPO_70,
  secundario: 'var(--ws-muted,#c8d1dc)',
  meta: 'var(--ws-muted,#94a3b8)',
} as const

const MANUAL_ESTILO_PASSO_ROTULO: React.CSSProperties = {
  fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', color: '#818cf8',
  textTransform: 'uppercase', margin: '0 0 8px',
}

const MANUAL_ESTILO_PASSO_TITULO: React.CSSProperties = {
  fontWeight: 700, fontSize: '.92rem', color: MANUAL_TITULO_COR, margin: '0 0 10px',
}

const MANUAL_ESTILO_CORPO: React.CSSProperties = {
  ...MANUAL_CORPO_TIPOGRAFIA,
  color: MANUAL_CORPO_70,
}

const UNI_ESTILO_PAGE_HEADER: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18,
}

const UNI_ESTILO_PAGE_ICON: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}

const UNI_ESTILO_PAGE_TITLES: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0,
}

const UNI_ESTILO_PAGE_TITLE: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.1,
  color: 'var(--ws-text,#f1f5f9)', margin: 0,
}

const UNI_ESTILO_PAGE_SUBTITULO: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '0.8rem', color: 'var(--ws-muted,#94a3b8)', lineHeight: 1.5, margin: 0,
}

const MANUAL_ESTILO_SECAO_NUMERO: React.CSSProperties = {
  color: '#818cf8', fontSize: '.85rem', fontWeight: 700, flexShrink: 0, minWidth: 28,
}

const MANUAL_ESTILO_CALLOUT_CORPO: React.CSSProperties = {
  fontSize: '.82rem', color: MANUAL_CORPO_70, lineHeight: 1.65,
  textAlign: MANUAL_ALINHAMENTO_CORPO, textJustify: 'inter-word',
}

/** Ícones inline: token `{{icone:slug}}` + escrita descritiva no mesmo parágrafo */
const MANUAL_ICONES: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  olho: Eye,
  'olho-riscado': EyeSlash,
  envelope: Envelope,
  cadeado: Lock,
}

const MANUAL_LINK_STYLE: React.CSSProperties = {
  color: '#818cf8',
  textDecoration: 'underline',
  textUnderlineOffset: 2,
}

const MANUAL_ICONE_INLINE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  verticalAlign: 'text-bottom',
  margin: '0 3px',
  color: MANUAL_TIPO.secundario,
}

function ManualTextoRich({ texto }: { texto: string }) {
  const linhas = texto.split('\n')
  return (
    <>
      {linhas.map((linha, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          <ManualTextoRichLinha texto={linha} />
        </React.Fragment>
      ))}
    </>
  )
}

function ManualTextoRichSegmento({ texto }: { texto: string }) {
  if (!texto.includes('**')) return texto
  const partes: React.ReactNode[] = []
  const re = /\*\*([^*]+)\*\*/g
  let ultimo = 0
  let match: RegExpExecArray | null
  let ki = 0
  while ((match = re.exec(texto)) !== null) {
    if (match.index > ultimo) partes.push(texto.slice(ultimo, match.index))
    partes.push(
      <strong key={`b-${ki++}`} style={{ color: MANUAL_TIPO.titulo, fontWeight: 700 }}>
        {match[1]}
      </strong>,
    )
    ultimo = re.lastIndex
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo))
  return <>{partes}</>
}

function ManualTextoRichLinha({ texto }: { texto: string }) {
  const partes: React.ReactNode[] = []
  const re = /(https:\/\/[^\s]+|\{\{link:([^|]+)\|([^}]+)\}\}|\{\{icone:([a-z0-9-]+)\}\})/g
  let ultimo = 0
  let match: RegExpExecArray | null
  let ki = 0
  while ((match = re.exec(texto)) !== null) {
    if (match.index > ultimo) {
      partes.push(<ManualTextoRichSegmento key={`t-${ki++}`} texto={texto.slice(ultimo, match.index)} />)
    }
    if (match[1].startsWith('https://')) {
      partes.push(
        <a key={match.index} href={match[1]} target="_blank" rel="noreferrer" style={MANUAL_LINK_STYLE}>
          {match[1]}
        </a>,
      )
    } else if (match[2] !== undefined) {
      partes.push(
        <Link key={match.index} to={match[2]} style={MANUAL_LINK_STYLE}>
          {match[3]}
        </Link>,
      )
    } else {
      const Icon = MANUAL_ICONES[match[4]]
      partes.push(
        Icon ? (
          <span key={match.index} style={MANUAL_ICONE_INLINE_STYLE} aria-hidden>
            <Icon size={16} />
          </span>
        ) : (
          match[0]
        ),
      )
    }
    ultimo = re.lastIndex
  }
  if (ultimo < texto.length) {
    partes.push(<ManualTextoRichSegmento key={`t-${ki++}`} texto={texto.slice(ultimo)} />)
  }
  return <>{partes}</>
}

function ManualParagrafo({
  texto,
  marginBottom,
}: {
  texto: string
  marginBottom?: number | string
}) {
  return (
    <p style={{ ...MANUAL_ESTILO_CORPO, margin: marginBottom === 0 ? 0 : `0 0 ${marginBottom ?? MANUAL_ESPACO_PARAGRAFO_PX}px` }}>
      <ManualTextoRich texto={texto} />
    </p>
  )
}

function ManualFiguraScreenshot({ src, alt }: { src: string; alt: string }) {
  const [telaCheia, setTelaCheia] = useState(false)

  useEffect(() => {
    if (!telaCheia) return
    const onTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTelaCheia(false)
    }
    document.addEventListener('keydown', onTecla)
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onTecla)
      document.body.style.overflow = overflowAnterior
    }
  }, [telaCheia])

  const abrir = () => setTelaCheia(true)
  const fechar = () => setTelaCheia(false)

  return (
    <>
      <figure
        role="button"
        tabIndex={0}
        aria-label={`${alt}: Abrir em tela cheia`}
        onClick={abrir}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            abrir()
          }
        }}
        style={{
          margin: 0, borderRadius: 14, overflow: 'hidden', cursor: 'zoom-in',
          border: '1px solid rgba(148,163,184,.15)', boxShadow: '0 8px 32px rgba(0,0,0,.28)',
          background: 'rgba(8,12,24,.55)', position: 'relative',
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', display: 'block', verticalAlign: 'top', objectFit: 'contain' }}
          onError={(e) => {
            const el = e.currentTarget.parentElement!
            el.style.maxHeight = 'unset'
            el.style.cursor = 'default'
            el.removeAttribute('role')
            el.innerHTML = `<div style="padding:48px;text-align:center;color:#475569;font-size:.8rem;background:rgba(148,163,184,.04)">📸 Salve o screenshot em<br/><code style="color:#818cf8;font-size:.75rem">${src}</code></div>`
          }}
        />
        <span style={{
          position: 'absolute', top: 10, right: 10,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 11px', borderRadius: 9,
          background: 'rgba(99,102,241,.88)', border: '1px solid rgba(165,180,252,.45)',
          color: '#f8fafc', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.03em',
          backdropFilter: 'blur(8px)', boxShadow: '0 4px 14px rgba(0,0,0,.28)',
          pointerEvents: 'none',
        }}>
          <ArrowsOut size={15} weight="duotone" aria-hidden />
          Ampliar
        </span>
      </figure>

      {telaCheia && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={fechar}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', background: 'rgba(2,6,23,.92)', backdropFilter: 'blur(4px)',
          }}
        >
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar visualização em tela cheia"
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(148,163,184,.12)', border: '1px solid rgba(148,163,184,.25)',
              color: '#f1f5f9', borderRadius: 8, padding: '8px 14px',
              fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Fechar ✕
          </button>
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 'min(96vw, 1920px)', maxHeight: '92vh',
              width: 'auto', height: 'auto', objectFit: 'contain',
              borderRadius: 10, boxShadow: '0 24px 80px rgba(0,0,0,.55)',
            }}
          />
        </div>
      )}
    </>
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
                  <span style={{ fontSize: '.78rem', color: MANUAL_CORPO_70, lineHeight: 1.45 }}>{item}</span>
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
            <CheckCircle size={13} weight="fill" /> Atendido: item verde no formulário
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#f87171' }}>
            <WarningCircle size={13} weight="fill" /> Pendente: item vermelho até corrigir
          </span>
        </div>
      </div>
    </div>
  )
}

function ManualCalloutBloco({ callout, marginTop = 12 }: {
  callout: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }
  marginTop?: number
}) {
  const c = CALLOUT_STYLE[callout.tipo]
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.borda}`, borderRadius: 8,
      padding: '12px 16px', marginTop,
    }}>
      <p style={{
        fontSize: '.7rem', fontWeight: 700, color: c.cor, marginBottom: 5,
        letterSpacing: '.06em', textTransform: 'uppercase',
      }}>{c.label}</p>
      <p style={MANUAL_ESTILO_CALLOUT_CORPO}><ManualTextoRich texto={callout.texto} /></p>
    </div>
  )
}

function ManualBlocoPassoVisual({ passo }: { passo: DocPassoVisual }) {
  const calloutLista = passo.callouts ?? (passo.callout ? [passo.callout] : [])
  const empilharImagem =
    passo.imagemAbaixoTexto ??
    (Boolean(passo.imagem) &&
      calloutLista.length >= 2 &&
      calloutLista.every((c) => c.tipo === 'dica'))

  const blocoBase: React.CSSProperties = {
    paddingTop: passo.num === 1 ? 8 : MANUAL_ESPACO_ENTRE_PASSOS_PX,
    borderTop: passo.num === 1 ? undefined : '1px solid rgba(148,163,184,.1)',
    marginTop: passo.num === 1 ? 18 : 0,
  }

  const colunaTexto = (
    <div style={{ padding: '2px 0 0 18px', borderLeft: '3px solid rgba(99,102,241,.45)' }}>
      <p style={MANUAL_ESTILO_PASSO_ROTULO}>
        Passo {String(passo.num).padStart(2, '0')}
      </p>
      <p style={MANUAL_ESTILO_PASSO_TITULO}>{passo.titulo}</p>
      {passo.paragrafos.map((p, i) => (
        <ManualParagrafo
          key={i}
          texto={p}
          marginBottom={
            i === passo.paragrafos.length - 1 && !passo.painelRequisitosCadastro
              ? 0
              : manualMargemParagrafo(i, passo.paragrafos.length)
          }
        />
      ))}
      {passo.linkCapitulo && (
        <p style={{ marginTop: 12, marginBottom: 0 }}>
          <Link to={passo.linkCapitulo.href} style={MANUAL_LINK_STYLE}>
            {passo.linkCapitulo.texto}
          </Link>
        </p>
      )}
      {passo.painelRequisitosCadastro && <ManualPainelRequisitosCadastro />}
      {calloutLista.map((callout, i) => (
        <ManualCalloutBloco
          key={i}
          callout={callout}
          marginTop={i === 0 ? MANUAL_ESPACO_PARAGRAFO_PX : 8}
        />
      ))}
    </div>
  )

  if (passo.galeriaTelas?.length) {
    return (
      <div style={blocoBase}>
        {colunaTexto}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 14,
          marginTop: 20,
        }}>
          {passo.galeriaTelas.map((tela) => (
            <div key={tela.legenda}>
              <p style={{
                fontSize: '.72rem', fontWeight: 700, color: '#818cf8',
                marginBottom: 8, textAlign: 'center', letterSpacing: '.04em',
              }}>{tela.legenda}</p>
              <ManualFiguraScreenshot src={tela.imagem} alt={tela.legenda} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (empilharImagem && passo.imagem) {
    return (
      <div style={blocoBase}>
        {colunaTexto}
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <ManualFiguraScreenshot src={passo.imagem} alt={passo.titulo} />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      ...blocoBase,
      display: 'grid',
      gridTemplateColumns: 'minmax(240px, 36%) minmax(0, 1fr)',
      gap: 28,
      alignItems: 'start',
    }}>
      {colunaTexto}
      {passo.imagem && <ManualFiguraScreenshot src={passo.imagem} alt={passo.titulo} />}
    </div>
  )
}

function DocLoginManual() {
  const todosNums = DOC_LOGIN_SECOES.map(s => s.num)
  const [abertos, setAbertos] = useState<number[]>([])
  const todosAbertos = todosNums.every(n => abertos.includes(n))
  const toggle = (n: number) => setAbertos(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  const toggleTodos = () => setAbertos(todosAbertos ? [] : [...todosNums])
  const scrollTo = useManualSumarioScroll(abertos, setAbertos)

  return (
    <div style={{ maxWidth: '100%', color: 'var(--ws-text,#f1f5f9)' }}>
      {/* Badge */}
      <span style={{
        display: 'inline-block', background: 'rgba(99,102,241,.12)', color: '#818cf8',
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', padding: '4px 12px',
        borderRadius: 999, border: '1px solid rgba(99,102,241,.3)', marginBottom: 16,
        textTransform: 'uppercase',
      }}>Manual Descritivo de Tela</span>

      {/* Metadados */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 10,
        paddingBottom: 22,
        borderBottom: '1px solid rgba(148,163,184,.12)',
        marginBottom: 28,
      }}>
        {DOC_LOGIN_METADADOS.map(meta => (
          <div
            key={meta.rotulo}
            style={{
              background: 'rgba(148,163,184,.05)',
              border: '1px solid rgba(148,163,184,.12)',
              borderRadius: 10,
              padding: '10px 14px',
              minWidth: 0,
              ...(meta.href ? { gridColumn: 'span 2' } : {}),
            }}
          >
            <p style={{
              fontSize: '.62rem', fontWeight: 700, letterSpacing: '.08em',
              textTransform: 'uppercase', color: 'var(--ws-muted,#64748b)', margin: '0 0 4px',
            }}>
              {meta.rotulo}
            </p>
            <p style={{
              fontSize: '.82rem', color: 'var(--ws-text,#e2e8f0)', margin: 0, lineHeight: 1.4,
              overflowWrap: 'anywhere', wordBreak: 'break-word',
            }}>
              {meta.href ? (
                <a href={meta.valor} target="_blank" rel="noreferrer" style={{ ...MANUAL_LINK_STYLE, overflowWrap: 'anywhere' }}>{meta.valor}</a>
              ) : meta.valor}
            </p>
          </div>
        ))}
      </div>

      {/* Sumário */}
      <div style={{
        background: 'rgba(148,163,184,.05)', border: '1px solid rgba(148,163,184,.12)',
        borderRadius: 14, padding: '20px 26px', marginBottom: 16,
      }}>
        <p style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--ws-muted,#64748b)', textTransform: 'uppercase', marginBottom: 14 }}>
          Sumário
        </p>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', columns: 2, gap: 24, fontSize: '.85rem' }}>
          {DOC_LOGIN_SECOES.map(s => (
            <li key={s.num} style={{ marginBottom: 7, display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ ...MANUAL_ESTILO_SECAO_NUMERO, minWidth: 22 }}>{s.num}.</span>
              <button onClick={() => scrollTo(s.num)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', padding: 0, textAlign: 'left', lineHeight: 1.4 }}>
                {s.titulo}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Expandir / recolher todas */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button
          type="button"
          onClick={toggleTodos}
          title={todosAbertos ? 'Recolher todas as seções' : 'Expandir todas as seções'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ws-muted,#94a3b8)', fontSize: '.78rem', fontWeight: 600, padding: '4px 2px',
          }}
        >
          <CaretDown
            weight="bold"
            size={12}
            style={{
              transform: todosAbertos ? 'rotate(180deg)' : 'none',
              transition: 'transform .2s',
            }}
          />
          {todosAbertos ? 'Recolher todas' : 'Expandir todas'}
        </button>
      </div>

      {/* Seções */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {DOC_LOGIN_SECOES.map(s => {
          const aberto = abertos.includes(s.num)
          return (
            <div key={s.num} id={`doc-sec-${s.num}`} style={{
              ...MANUAL_ESTILO_ACORDEON_SECAO,
              border: `1px solid ${aberto ? 'rgba(99,102,241,.25)' : 'rgba(148,163,184,.12)'}`,
              borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s',
            }}>
              {/* Header da seção */}
              <button onClick={() => toggle(s.num)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                background: aberto ? 'rgba(99,102,241,.07)' : 'rgba(148,163,184,.03)',
                border: 'none', cursor: 'pointer', padding: '16px 22px',
                color: 'var(--ws-text,#f1f5f9)', textAlign: 'left', transition: 'background .15s',
              }}>
                <span style={MANUAL_ESTILO_SECAO_NUMERO}>{String(s.num).padStart(2, '0')}</span>
                <span style={{ fontWeight: 700, fontSize: '1rem', flex: 1, minWidth: 0 }}>{s.titulo}</span>
                <span style={{
                  color: '#818cf8', flexShrink: 0,
                  transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform .25s', fontSize: '.9rem',
                }}>▾</span>
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
                          <ManualParagrafo
                            key={i}
                            texto={p}
                            marginBottom={manualMargemParagrafo(i, s.paragrafos.length)}
                          />
                        ))}
                      </div>
                      <ManualFiguraScreenshot src={s.imagem} alt={s.titulo} />
                    </div>
                  ) : s.passosVisuais ? (
                    <>
                      {s.paragrafos.map((p, i) => (
                        <ManualParagrafo
                          key={i}
                          texto={p}
                          marginBottom={manualMargemParagrafo(i, s.paragrafos.length)}
                        />
                      ))}
                      {s.passosVisuais.map(passo => (
                        <ManualBlocoPassoVisual key={passo.num} passo={passo} />
                      ))}
                    </>
                  ) : (
                    <>
                      {s.paragrafos.map((p, i) => (
                        <ManualParagrafo key={i} texto={p} marginBottom={manualMargemParagrafo(i, s.paragrafos.length)} />
                      ))}

                      {s.imagem && (
                        <div style={{ marginTop: 20 }}>
                          <ManualFiguraScreenshot src={s.imagem} alt={s.titulo} />
                        </div>
                      )}
                    </>
                  )}

                  {/* Legenda: cards visuais em grid */}
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
                        const [label, ...rest] = item.replace(/^[-–]\s*/, '').split(':')
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
                                color: MANUAL_TITULO_COR, marginBottom: desc ? 3 : 0, lineHeight: 1.35,
                              }}><ManualTextoRich texto={label.trim()} /></p>
                              {desc && <p style={{
                                fontSize: s.listaEmLinha ? '.68rem' : '.78rem',
                                color: MANUAL_CORPO_70, lineHeight: 1.45,
                              }}><ManualTextoRich texto={desc} /></p>}
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
                            <p key={j} style={{ fontSize: '.8rem', color: MANUAL_CORPO_70, marginBottom: 4, lineHeight: 1.5 }}>
                              <ManualTextoRich texto={it} />
                            </p>
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
                            <p style={{ fontSize: '.8rem', color: MANUAL_CORPO_70, lineHeight: 1.55 }}>
                              <ManualTextoRich texto={t.desc} />
                            </p>
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
                        <p style={MANUAL_ESTILO_CALLOUT_CORPO}><ManualTextoRich texto={s.callout.texto} /></p>
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

  const academyPathSuffix = secao === 'academy'
    ? pathname.replace(/^\/university-gravity(?:\/academy)?\/?/, '')
    : ''
  const partesAcademy = academyPathSuffix.split('/').filter(Boolean)
  const produtoSlugBruto = (partesAcademy[0] ?? null) as ProdutoSlug | null
  const produtoSlug = produtoSlugBruto && produtoSlugBruto in ICON_MAP ? produtoSlugBruto : null
  const faseSlug = produtoSlug ? (partesAcademy[1] ?? null) : null

  const docsPathPartes = secao === 'docs'
    ? pathname.replace('/university-gravity/docs', '').split('/').filter(Boolean)
    : []

  const docsProdutoSlug = (docsPathPartes[0] ?? null) as ProdutoSlug | null

  const docsConfiguradorPagina = docsProdutoSlug === 'configurador'
    ? resolverConfiguradorManualSlug(docsPathPartes[1])
    : null

  const configuradorManualItem = docsConfiguradorPagina
    ? CONFIGURADOR_MANUAL_ITENS.find(i => i.pathSeg === docsConfiguradorPagina) ?? null
    : null

  const manualDocPublicado = secao === 'docs' && (
    docsProdutoSlug === 'login' ||
    docsProdutoSlug === 'navegacao' ||
    docsProdutoSlug === 'hub' ||
    docsProdutoSlug === 'store' ||
    docsProdutoSlug === 'smart-read' ||
    docsProdutoSlug === 'pedido' ||
    docsProdutoSlug === 'api-cockpit' ||
    (docsProdutoSlug === 'configurador' && docsConfiguradorPagina !== null)
  )

  const trilhasAtivas: Trilha[] | null = (produtoSlug && !faseSlug)
    ? (TRILHAS_POR_PRODUTO[produtoSlug] ?? null)
    : null

  // Controle local de aulas concluídas (WIP: virá do banco via API)
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

  const produtoIconManual = (slug: ProdutoSlug, size = 16) => {
    const IconComp = ICON_MAP[slug]
    return <IconComp weight="duotone" size={size} />
  }

  const produtoIconAcademy = (slug: ProdutoSlug, size = 16) => {
    const IconComp = ICON_MAP[slug]
    const prog = TRILHAS_POR_PRODUTO[slug]?.[0]?.prog ?? 0
    return prog >= 100
      ? <CheckCircle weight="fill" size={size} style={{ color: '#34d399' }} />
      : <IconComp weight="duotone" size={size} />
  }

  const badgeEmBreve = { badge: t('university.badge.em_breve'), badgeVariant: 'muted' as const }
  const badgeAdminOnboarding = {
    badge: t('university.badge.restrito'),
    badgeSecundario: t('university.badge.em_breve'),
    badgeVariant: 'muted' as const,
  }

  const navItems = [
    {
      to: '/university-gravity/academy',
      label: t('university.nav.academy'),
      icon: <Books weight="duotone" size={18} />,
      ...badgeEmBreve,
      children: [
        { to: '/university-gravity/academy/login',        label: t('university.produto.login'),        icon: produtoIconAcademy('login'),        ...badgeEmBreve },
        { to: '/university-gravity/academy/admin',        label: t('university.produto.admin'),        icon: produtoIconAcademy('admin'),        ...badgeAdminOnboarding },
        { to: '/university-gravity/academy/configurador', label: t('university.produto.configurador'), icon: produtoIconAcademy('configurador'), ...badgeEmBreve },
        { to: '/university-gravity/academy/gabi',         label: t('university.produto.gabi'),         icon: produtoIconAcademy('gabi'),         ...badgeEmBreve },
        { to: '/university-gravity/academy/hub',          label: t('university.produto.hub'),          icon: produtoIconAcademy('hub'),          ...badgeEmBreve },
        { to: '/university-gravity/academy/store',        label: t('university.produto.store'),        icon: produtoIconAcademy('store'),        ...badgeEmBreve },
        { to: '/university-gravity/academy/pedido',       label: t('university.produto.pedido'),       icon: produtoIconAcademy('pedido'),       ...badgeEmBreve },
        { to: '/university-gravity/academy/smart-read',   label: t('university.produto.smart_read'),   icon: produtoIconAcademy('smart-read'),   ...badgeEmBreve },
        { to: '/university-gravity/academy/bid-frete',    label: t('university.produto.bid_frete'),    icon: produtoIconAcademy('bid-frete'),    ...badgeEmBreve },
        { to: '/university-gravity/academy/bid-cambio',   label: t('university.produto.bid_cambio'),   icon: produtoIconAcademy('bid-cambio'),   ...badgeEmBreve },
        { to: '/university-gravity/academy/processo',     label: t('university.produto.processo'),     icon: produtoIconAcademy('processo'),     ...badgeEmBreve },
      ],
    },
    {
      to: '/university-gravity/docs',
      label: t('university.nav.docs'),
      icon: <FileText weight="duotone" size={18} />,
      children: [
        { to: '/university-gravity/docs/login',        label: t('university.produto.login'),        icon: produtoIconManual('login') },
        { to: '/university-gravity/docs/navegacao',    label: t('university.produto.navegacao'),    icon: produtoIconManual('navegacao') },
        { to: '/university-gravity/docs/admin',        label: t('university.produto.admin'),        icon: produtoIconManual('admin'),        ...badgeAdminOnboarding },
        {
          to: '/university-gravity/docs/configurador',
          label: t('university.produto.configurador'),
          icon: produtoIconManual('configurador'),
          children: CONFIGURADOR_MANUAL_ITENS.map(item => {
            const badgeEmBreveCapitulo: Partial<Record<typeof item.pathSeg, typeof badgeEmBreve>> = {
            }
            return {
              to: `/university-gravity/docs/configurador/${item.pathSeg}`,
              label: item.label,
              icon: iconeConfiguradorManual(item.pathSeg, 16),
              ...(badgeEmBreveCapitulo[item.pathSeg] ?? {}),
            }
          }),
        },
        { to: '/university-gravity/docs/gabi',         label: t('university.produto.gabi'),         icon: produtoIconManual('gabi'),         ...badgeEmBreve },
        { to: '/university-gravity/docs/hub',          label: t('university.produto.hub'),          icon: produtoIconManual('hub') },
        { to: '/university-gravity/docs/store',        label: t('university.produto.store'),        icon: produtoIconManual('store') },
        {
          to: '/university-gravity/docs/smart-read',
          label: t('university.nav.produtos_gravity'),
          icon: <PuzzlePiece weight="duotone" size={16} />,
          children: [
            { to: '/university-gravity/docs/pedido',     label: t('university.produto.pedido'),     icon: produtoIconManual('pedido') },
            { to: '/university-gravity/docs/smart-read', label: t('university.produto.smart_read'), icon: produtoIconManual('smart-read') },
            { to: '/university-gravity/docs/bid-frete',  label: t('university.produto.bid_frete'), icon: produtoIconManual('bid-frete') },
            { to: '/university-gravity/docs/bid-cambio', label: t('university.produto.bid_cambio'), icon: produtoIconManual('bid-cambio'), ...badgeEmBreve },
          ],
        },
        { to: '/university-gravity/docs/processo',     label: t('university.produto.processo'),     icon: produtoIconManual('processo'),     ...badgeEmBreve },
      ],
    },
    { to: '/university-gravity/builders',      label: t('university.nav.builders'),      icon: <PuzzlePiece weight="duotone" size={18} />, badge: t('university.badge.em_breve'), badgeVariant: 'muted' as const },
    { to: '/university-gravity/minha-jornada', label: t('university.nav.minha_jornada'), icon: <Path weight="duotone" size={18} />, badge: t('university.badge.em_breve'), badgeVariant: 'muted' as const },
  ]

  const tituloSecao = secao === 'docs'
    ? (configuradorManualItem
      ? configuradorManualItem.label
      : docsProdutoSlug === 'navegacao'
        ? t('university.manual.titulo_navegacao')
      : docsProdutoSlug
        ? t('university.manual.titulo_produto', {
          produto: t(`university.produto.${docsProdutoSlug.replaceAll('-', '_')}`),
        })
        : t('university.nav.docs'))
    : produtoSlug
    ? t(`university.produto.${produtoSlug.replaceAll('-', '_')}`)
    : secao === 'jornada' ? t('university.nav.minha_jornada')
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

          <button
            className="ws-global-btn"
            type="button"
            title={t('university.modulo_nome', 'Gravity University')}
            aria-label={t('university.modulo_nome', 'Gravity University')}
            onClick={() => navigate('/university-gravity')}
          >
            <GraduationCap size={20} weight="duotone" />
          </button>

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
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem 3rem' }} data-manual-scroll-root>

          {/* ── Cabeçalho (padrão MenuTopoGlobal: Insights) ── */}
          <div style={UNI_ESTILO_PAGE_HEADER}>
            <span style={{
              ...UNI_ESTILO_PAGE_ICON,
              color: secao === 'docs' && docsProdutoSlug === 'login' ? '#60a5fa' : UNI_COR,
            }}>
              {secao === 'docs' && docsProdutoSlug === 'login'
                ? <SignIn weight="duotone" size={22} />
                : secao === 'docs' && docsProdutoSlug === 'navegacao'
                  ? <Compass weight="duotone" size={22} />
                : secao === 'docs' && docsProdutoSlug === 'hub'
                  ? <SquaresFour weight="duotone" size={22} />
                : secao === 'docs' && docsProdutoSlug === 'store'
                  ? <ShoppingBag weight="duotone" size={22} />
                : secao === 'docs' && docsProdutoSlug === 'smart-read'
                  ? <MagnifyingGlass weight="duotone" size={22} />
                : secao === 'docs' && docsProdutoSlug === 'api-cockpit'
                  ? iconeConfiguradorManual('api-cockpit', 22)
                : secao === 'docs' && docsConfiguradorPagina
                  ? iconeConfiguradorManual(docsConfiguradorPagina, 22)
                  : <GraduationCap weight="duotone" size={22} />}
            </span>
            <div style={UNI_ESTILO_PAGE_TITLES}>
              <h1 style={UNI_ESTILO_PAGE_TITLE}>{tituloSecao}</h1>
              {secao === 'academy' && !produtoSlug && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{t('university.academy.subtitulo')}</span>
              )}
              {secao === 'docs' && docsProdutoSlug === 'login' && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{DOC_LOGIN_SUBTITULO}</span>
              )}
              {secao === 'docs' && docsProdutoSlug === 'navegacao' && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{DOC_NAVEGACAO_SUBTITULO}</span>
              )}
              {secao === 'docs' && docsProdutoSlug === 'hub' && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{DOC_HUB_SUBTITULO}</span>
              )}
              {secao === 'docs' && docsProdutoSlug === 'store' && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{DOC_STORE_SUBTITULO}</span>
              )}
              {secao === 'docs' && docsProdutoSlug === 'smart-read' && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{DOC_SMART_READ_SUBTITULO}</span>
              )}
              {secao === 'docs' && docsProdutoSlug === 'pedido' && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{DOC_PEDIDO_SUBTITULO}</span>
              )}
              {secao === 'docs' && docsProdutoSlug === 'api-cockpit' && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{DOC_API_COCKPIT_SUBTITULO}</span>
              )}
              {secao === 'docs' && configuradorManualItem && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{configuradorManualItem.subtitulo}</span>
              )}
            </div>
          </div>

          {/* ── Banner (oculto em manuais publicados) ── */}
          {!manualDocPublicado && (
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
          )}

          {/* ══ BARRA 3: Progresso nos produtos contratados (sempre visível no academy) ══ */}
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

                      {/* ── BARRA 2: conclusão do módulo ── */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <BarraProgresso pct={pctModulo} />
                        <span style={{ fontSize: '.75rem', fontWeight: 700, color: pctModulo >= 100 ? '#34d399' : 'var(--ws-muted,#94a3b8)', whiteSpace: 'nowrap' }}>
                          {pctModulo >= 100 ? t('university.acao.concluida') : `${pctModulo}%`}
                        </span>
                      </div>

                      {/* ── BARRA 1: fases individuais ── */}
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

          {secao === 'docs' && docsProdutoSlug === 'navegacao' && (
            <DocNavegacaoManual />
          )}

          {secao === 'docs' && docsProdutoSlug === 'login' && (
            <DocLoginManual />
          )}

          {secao === 'docs' && docsProdutoSlug === 'hub' && (
            <DocHubManual />
          )}

          {secao === 'docs' && docsProdutoSlug === 'store' && (
            <DocStoreManual />
          )}

          {secao === 'docs' && docsConfiguradorPagina && (
            <DocConfiguradorManual paginaSlug={docsConfiguradorPagina} />
          )}

          {secao === 'docs' && docsProdutoSlug === 'smart-read' && (
            <DocSmartReadManual />
          )}

          {secao === 'docs' && docsProdutoSlug === 'pedido' && (
            <DocPedidoManual />
          )}

          {secao === 'docs' && docsProdutoSlug === 'bid-frete' && (
            <DocBidFreteManual />
          )}

          {secao === 'docs' && docsProdutoSlug === 'api-cockpit' && (
            <DocApiCockpitManual />
          )}

          {secao === 'docs' && docsProdutoSlug && docsProdutoSlug !== 'login' && docsProdutoSlug !== 'navegacao' && docsProdutoSlug !== 'hub' && docsProdutoSlug !== 'store' && docsProdutoSlug !== 'smart-read' && docsProdutoSlug !== 'pedido' && docsProdutoSlug !== 'bid-frete' && docsProdutoSlug !== 'api-cockpit' && docsProdutoSlug !== 'configurador' && (
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
