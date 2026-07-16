/** Manual Login — SSOT compartilhado entre docs (/docs/login) e Guia Gravity (/academy/login). */

import type {
  DocEntradaSumarioManual,
  DocItemSumarioManual,
} from './manual-configurador-conteudo'
import { ancoraPassosLogin, idPassoManual } from './manual-leitura-progresso'

export interface DocPassoVisual {
  num: number
  titulo: string
  paragrafos: string[]
  imagem?: string
  callout?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }
  callouts?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }[]
  painelRequisitosCadastro?: boolean
  galeriaTelas?: { legenda: string; imagem: string }[]
  linkCapitulo?: { texto: string; href: string }
  imagemAbaixoTexto?: boolean
}

export interface DocSecao {
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

export const DOC_LOGIN_SUBTITULO =
  'Login, cadastro, recuperação de senha e convites'

export const DOC_LOGIN_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '1.0' },
  { rotulo: 'Atualizado em', valor: 'junho 2026' },
  { rotulo: 'Produto', valor: 'Configurador' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/login', href: true },
  { rotulo: 'Rota base', valor: '/login' },
]

export const DOC_LOGIN_SECOES: DocSecao[] = [
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
    titulo: 'Criar sua conta',
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
    titulo: 'Entrar com e-mail e senha',
    paragrafos: [
      'Para quem já tem conta: Acesse https://usegravity.com.br/login e siga os passos abaixo. Após entrar, você vai ao Hub ou ao onboarding; contas com 2FA (autenticação em dois fatores) pedem um código extra antes de concluir.',
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
            texto: 'Após muitas tentativas erradas, a plataforma pode exigir CAPTCHA ou bloquear temporariamente o acesso. Aguarde alguns minutos antes de tentar de novo.',
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
    titulo: 'Recuperar senha',
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
    titulo: 'Convite de outro usuário',
    paragrafos: [
      'Apenas usuários **Master** podem convidar outras pessoas para a organização. O convite é feito pelo **Configurador**; o convidado recebe um e-mail com link para completar o cadastro e entrar na organização.',
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
          'O convidado abre o e-mail e clica no link. Nome e e-mail já vêm preenchidos; ele define a senha, aceita os termos e verifica o código de 6 dígitos (mesmo fluxo da seção 02, Criar sua conta).',
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

/** Sumário hierárquico do manual Login (capítulos = seções; subcapítulos = passos visuais). */
export function montarEntradasSumarioLogin(): DocEntradaSumarioManual[] {
  return DOC_LOGIN_SECOES.map((s): DocEntradaSumarioManual => ({
    capitulo: {
      rotulo: String(s.num),
      titulo: s.titulo,
      secaoAcordeao: s.num,
      num: s.num,
    },
    subitens: s.passosVisuais?.map((p): DocItemSumarioManual => ({
      rotulo: `${s.num}.${String(p.num).padStart(2, '0')}`,
      titulo: p.titulo,
      secaoAcordeao: s.num,
      elementoScroll: idPassoManual(ancoraPassosLogin(s.num), p.num),
      subitem: true,
      subitemNivel: 1,
    })),
  }))
}
