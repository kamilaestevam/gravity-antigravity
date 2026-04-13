import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enPath = path.join(__dirname, '../nucleo-global/Utilidades/Localization/locales/en.json');
const ptPath = path.join(__dirname, '../nucleo-global/Utilidades/Localization/locales/pt.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf-8')) as Record<string, Record<string, unknown>>;
const pt = JSON.parse(fs.readFileSync(ptPath, 'utf-8')) as Record<string, Record<string, unknown>>;

// ─── EN ─────────────────────────────────────────────────────────────────────

en.marketplace.exit_intent = {
  antes_ir: 'Before you go...',
  salvar_progresso: 'Save your progress',
  fechar: 'Close',
  descricao: 'We noticed you explored Gravity. Want to receive a link to continue where you left off?',
  dias_gratis: '14 days free, no credit card',
  setup_rapido: 'Setup in less than 60 seconds',
  cancele: 'Cancel anytime',
  seu_email: 'Your best email',
  placeholder_email: 'you@company.com',
  tooltip_enviar: 'Send access link to your email and continue where you left off',
  salvar_continuar: 'Save and Continue Later',
  sem_spam: 'No spam. Just one link. Promised.',
  perfeito: 'Perfect!',
  redirecionando: 'Link saved. Redirecting to setup...'
};

en.marketplace.onboarding = {
  aria_label: 'Gravity Preview',
  fechar: 'Close',
  passo_personalizar: 'Customize',
  passo_perfil: 'Profile',
  passo_dashboard: 'Dashboard',
  qual_cara: 'What is your brand style?',
  escolha_cor: 'Choose a color and watch the system adapt in real time.',
  azul_ceu: 'Sky Blue',
  violeta: 'Violet',
  esmeralda: 'Emerald',
  rosa: 'Rose',
  ambar: 'Amber',
  preview_tempo_real: 'Live preview',
  ficou_perfeito: 'Looks great! Next',
  voce_e: 'You are...',
  personalizar_experiencia: 'Let us customize your experience based on your role.',
  dev_label: 'Developer',
  dev_desc: 'APIs, integrations, code',
  designer_label: 'Designer',
  designer_desc: 'UI, UX, components',
  manager_label: 'Manager/Founder',
  manager_desc: 'Metrics, growth, team',
  continuar: 'Continue',
  workspace_pronto: 'Your workspace is ready!',
  dados_reais: 'See how it looks with real data',
  kpi_receita: 'Monthly Revenue',
  kpi_atividades: 'Activities',
  atividade_proposta: 'Proposal sent',
  atividade_reuniao: 'Meeting scheduled',
  atividade_simulacao: 'Comex Simulation',
  tooltip_iniciar_trial: 'Start 14-day free trial — no credit card required',
  comecar_trial: 'Start Free Trial — 14 days',
  sem_cartao: 'No card. No commitment.',
  tooltip_avancar: 'Advance to profile selection',
  tooltip_finalizar: 'Finish setup and view personalized dashboard',
  tab_atividades: 'Activities',
  tab_relatorios: 'Reports',
  tab_email: 'Email'
};

en.marketplace.paywall = {
  aria_label: 'Upgrade to Pro',
  fechar: 'Close',
  feature_pro: 'Pro Feature',
  desbloquear: 'Unlock full access',
  requer_plano: 'requires Professional plan.',
  numero_cartao: 'Card number',
  validade: 'Expiry',
  cvv: 'CVV',
  ssl: 'SSL Encrypted',
  stripe: 'Stripe Secure',
  lgpd: 'LGPD',
  confirmar: 'Confirm and Go to Setup',
  redirecionamento: 'You will be redirected to the Configurator to complete payment securely.',
  plano_pro: 'Pro Plan'
};

en.marketplace.footer = {
  tagline: 'Modular B2B SaaS platform. Shared services, specialized products, native multi-tenant.',
  produto: 'Product',
  catalogo: 'Catalog',
  precos: 'Pricing',
  trial: 'Free Trial',
  simulador_comex: 'Simulador Comex',
  empresa: 'Company',
  sobre: 'About',
  blog: 'Blog',
  carreiras: 'Careers',
  contato: 'Contact',
  legal: 'Legal',
  termos: 'Terms of Service',
  privacidade: 'Privacy',
  cookies: 'Cookies',
  lgpd: 'LGPD',
  copyright: '© {{year}} Gravity. All rights reserved.',
  status_online: 'Status: Online',
  lgpd_compliant: 'LGPD Compliant'
};

en.marketplace.navbar = {
  aria_home: 'Gravity Home',
  aria_nav: 'Main navigation',
  produtos: 'Products',
  precos: 'Pricing',
  trial: 'Trial',
  teste_gratis: 'Free Trial',
  comecar_agora: 'Get Started',
  fechar_menu: 'Close menu',
  abrir_menu: 'Open menu'
};

en.marketplace.checkout = {
  badge: 'Checkout',
  titulo: 'Order ',
  titulo_destaque: 'summary',
  o_que_recebe: 'What you get',
  plano: 'Plan',
  valor_mensal: 'Monthly value',
  por_mes: '/mo',
  pagamento_info: 'Payment will be processed securely by Stripe in the Configurator environment. This Marketplace',
  pagamento_nunca: ' never processes payments',
  pagamento_ponto: '.',
  confirmar: 'Confirm and Go to Setup',
  pagamento_seguro: 'Secure payment at Configurador',
  beneficios: {
    setup: 'Complete setup in less than 5 minutes',
    acesso: 'Immediate access after confirmation',
    cancelar: 'Cancel anytime without penalty',
    exportar: 'Exportable data 100% of the time',
    suporte: 'Dedicated support during onboarding'
  },
  seguranca: {
    ssl: 'SSL 256-bit',
    stripe: 'Stripe Secure',
    lgpd: 'LGPD Compliant'
  }
};

en.marketplace.precos = {
  badge: 'Plans',
  titulo: 'Simple. Transparent.',
  titulo_destaque: 'Fair.',
  subtitulo: 'Start free for 14 days. No credit card. Scale as you grow.',
  anual: 'Annual',
  mensal: 'Monthly',
  economize: 'Save 23%',
  personalizado: 'Custom',
  fale_equipe: 'Talk to our sales team',
  cobrado_anualmente: 'Billed annually',
  falar_vendas: 'Talk to Sales',
  comecar_com: 'Start with {{plano}}',
  faq_info: 'All plans include full access during the 14-day trial. No setup fee. Exportable data at any time.'
};

en.marketplace.produto_detalhe = {
  voltar: 'Back to Products',
  em_breve: 'Coming Soon',
  avaliacoes: 'reviews',
  recursos: 'Included features',
  entrar_waitlist: 'Join Waitlist',
  comecar_trial: 'Start Free Trial',
  ver_precos: 'View Pricing',
  nao_encontrado_404: '404',
  nao_encontrado_titulo: 'Product not found',
  nao_encontrado_desc: 'The product you are looking for does not exist in the catalog.',
  ver_todos: 'View All Products'
};

en.marketplace.simulador_comex = {
  badge: 'Product',
  descricao: 'Calculate real costs of foreign trade operations with precision. Taxes, freight, exchange rate variations — all in one simulator integrated with the Gravity platform.',
  teste_gratis: 'Free Trial — 14 days',
  assinar: 'Subscribe Now',
  preview_badge: 'Preview — Import Simulation',
  preview_dados: 'Real demo data',
  funcionalidades_titulo: 'Key ',
  funcionalidades_destaque: 'features',
  para_quem_titulo: 'Who is it ',
  para_quem_destaque: 'for'
};

en.marketplace.produtos = {
  badge: 'Catalog',
  titulo: 'Specialized ',
  titulo_destaque: 'products',
  subtitulo: 'Each product consumes the platform shared services. You pay once for the services, use in all products.',
  em_breve: 'Coming Soon',
  avaliacoes: 'reviews',
  teste_gratis: 'Free Trial',
  ver_detalhes: 'View Details',
  entrar_waitlist: 'Join Waitlist'
};

en.marketplace.trial = {
  badge: 'Free Trial',
  titulo: '14 days to feel the ',
  titulo_destaque: 'real value',
  selecionou: 'You selected: ',
  incluido_titulo: 'What is included',
  nao_necessario: 'Not required',
  sem_cartao: 'No credit card',
  sem_compromisso: 'No commitment',
  cancele: 'Cancel anytime',
  comece_titulo: 'Start in 60 seconds',
  comece_desc: 'Create your account in the Configurator and access the full environment right now.',
  duracao: 'Duration',
  mao_na_massa: "Let's get to work!",
  redirecionamento: 'You will be redirected to the Configurator to create your account. No credit card. No bureaucracy.',
  items_incluidos: {
    acesso: 'Full access to all plan modules',
    dias: '14-day trial at no cost',
    suporte: 'Chat support during the period',
    dados: 'Real data, not mock — your business, now',
    export: 'Export data before ending, if you want'
  }
};

en.auth = {
  headline: 'The marketplace of your',
  headline_destaque: 'operational efficiency.',
  subheadline: 'Independent or connected modules to scale your business. Reduce manual input with AI and take real control of your costs.',
  ecossistema_titulo: 'Modular Ecosystem',
  ecossistema_desc: 'Products that operate in isolation or in harmony, without data loss.',
  zero_digitacao_titulo: 'Zero Input',
  zero_digitacao_desc: 'Gabi AI automates manual processes and eliminates filling errors.',
  gestao_custos_titulo: 'Cost Management',
  gestao_custos_desc: 'Full visibility and financial control integrated into every module of the system.',
  padrao_enterprise_titulo: 'Enterprise Standard',
  padrao_enterprise_desc: 'Absolute privacy with full tenant isolation in SaaS architecture.'
};

// ─── PT ─────────────────────────────────────────────────────────────────────

pt.marketplace.exit_intent = {
  antes_ir: 'Antes de ir...',
  salvar_progresso: 'Salve seu progresso',
  fechar: 'Fechar',
  descricao: 'Vimos que você explorou o Gravity. Quer receber um link para continuar de onde parou?',
  dias_gratis: '14 dias grátis sem cartão',
  setup_rapido: 'Setup em menos de 60 segundos',
  cancele: 'Cancele quando quiser',
  seu_email: 'Seu melhor e-mail',
  placeholder_email: 'voce@empresa.com.br',
  tooltip_enviar: 'Enviar link de acesso para o seu e-mail e continuar de onde parou',
  salvar_continuar: 'Salvar e Continuar Depois',
  sem_spam: 'Sem spam. Apenas um link. Prometido.',
  perfeito: 'Perfeito!',
  redirecionando: 'Link salvo. Redirecionando para o setup...'
};

pt.marketplace.onboarding = {
  aria_label: 'Preview do Gravity',
  fechar: 'Fechar',
  passo_personalizar: 'Personalizar',
  passo_perfil: 'Perfil',
  passo_dashboard: 'Dashboard',
  qual_cara: 'Qual a cara da sua empresa?',
  escolha_cor: 'Escolha uma cor e veja o sistema se adaptar em tempo real.',
  azul_ceu: 'Azul Céu',
  violeta: 'Violeta',
  esmeralda: 'Esmeralda',
  rosa: 'Rosa',
  ambar: 'Âmbar',
  preview_tempo_real: 'Preview em tempo real',
  ficou_perfeito: 'Ficou perfeito! Próximo',
  voce_e: 'Você é...',
  personalizar_experiencia: 'Vamos personalizar sua experiência de acordo com seu papel.',
  dev_label: 'Desenvolvedor',
  dev_desc: 'APIs, integrações, código',
  designer_label: 'Designer',
  designer_desc: 'UI, UX, componentes',
  manager_label: 'Gestor/Fundador',
  manager_desc: 'Métricas, crescimento, equipe',
  continuar: 'Continuar',
  workspace_pronto: 'Seu workspace está pronto!',
  dados_reais: 'Veja como fica com dados reais',
  kpi_receita: 'Receita Mês',
  kpi_atividades: 'Atividades',
  atividade_proposta: 'Proposta enviada',
  atividade_reuniao: 'Reunião agendada',
  atividade_simulacao: 'Simulação Comex',
  tooltip_iniciar_trial: 'Iniciar teste gratuito de 14 dias — sem necessidade de cartão',
  comecar_trial: 'Começar Trial Grátis — 14 dias',
  sem_cartao: 'Sem cartão. Sem compromisso.',
  tooltip_avancar: 'Avançar para a seleção de perfil',
  tooltip_finalizar: 'Finalizar configuração e visualizar dashboard personalizado',
  tab_atividades: 'Atividades',
  tab_relatorios: 'Relatórios',
  tab_email: 'Email'
};

pt.marketplace.paywall = {
  aria_label: 'Upgrade para Pro',
  fechar: 'Fechar',
  feature_pro: 'Feature Pro',
  desbloquear: 'Desbloqueie acesso completo',
  requer_plano: 'requer plano Profissional.',
  numero_cartao: 'Número do cartão',
  validade: 'Validade',
  cvv: 'CVV',
  ssl: 'SSL Criptografado',
  stripe: 'Stripe Seguro',
  lgpd: 'LGPD',
  confirmar: 'Confirmar e Ir para Setup',
  redirecionamento: 'Você será redirecionado para o Configurador para finalizar o pagamento com segurança.',
  plano_pro: 'Plano Pro'
};

pt.marketplace.footer = {
  tagline: 'Plataforma SaaS B2B modular. Serviços compartilhados, produtos especializados, multi-tenant nativo.',
  produto: 'Produto',
  catalogo: 'Catálogo',
  precos: 'Preços',
  trial: 'Trial Gratuito',
  simulador_comex: 'Simulador Comex',
  empresa: 'Empresa',
  sobre: 'Sobre',
  blog: 'Blog',
  carreiras: 'Carreiras',
  contato: 'Contato',
  legal: 'Legal',
  termos: 'Termos de Uso',
  privacidade: 'Privacidade',
  cookies: 'Cookies',
  lgpd: 'LGPD',
  copyright: '© {{year}} Gravity. Todos os direitos reservados.',
  status_online: 'Status: Online',
  lgpd_compliant: 'LGPD Compliant'
};

pt.marketplace.navbar = {
  aria_home: 'Gravity Home',
  aria_nav: 'Navegação principal',
  produtos: 'Produtos',
  precos: 'Preços',
  trial: 'Trial',
  teste_gratis: 'Teste Grátis',
  comecar_agora: 'Começar Agora',
  fechar_menu: 'Fechar menu',
  abrir_menu: 'Abrir menu'
};

pt.marketplace.checkout = {
  badge: 'Checkout',
  titulo: 'Resumo do ',
  titulo_destaque: 'pedido',
  o_que_recebe: 'O que você recebe',
  plano: 'Plano',
  valor_mensal: 'Valor mensal',
  por_mes: '/mês',
  pagamento_info: 'O pagamento será processado com segurança pelo Stripe no ambiente do Configurador. Este Marketplace',
  pagamento_nunca: ' nunca processa pagamentos',
  pagamento_ponto: '.',
  confirmar: 'Confirmar e Ir para Setup',
  pagamento_seguro: 'Pagamento seguro no Configurador',
  beneficios: {
    setup: 'Setup completo em menos de 5 minutos',
    acesso: 'Acesso imediato após confirmação',
    cancelar: 'Cancele a qualquer momento sem multa',
    exportar: 'Dados exportáveis 100% do tempo',
    suporte: 'Suporte dedicado na implantação'
  },
  seguranca: {
    ssl: 'SSL 256-bit',
    stripe: 'Stripe Seguro',
    lgpd: 'LGPD Compliant'
  }
};

pt.marketplace.precos = {
  badge: 'Planos',
  titulo: 'Simples. Transparente.',
  titulo_destaque: 'Justo.',
  subtitulo: 'Comece grátis por 14 dias. Sem cartão. Escale conforme cresce.',
  anual: 'Anual',
  mensal: 'Mensal',
  economize: 'Economize 23%',
  personalizado: 'Personalizado',
  fale_equipe: 'Fale com nossa equipe de vendas',
  cobrado_anualmente: 'Cobrado anualmente',
  falar_vendas: 'Falar com Vendas',
  comecar_com: 'Começar com {{plano}}',
  faq_info: 'Todos os planos incluem acesso completo durante os 14 dias de trial. Sem taxa de setup. Dados exportáveis a qualquer momento.'
};

pt.marketplace.produto_detalhe = {
  voltar: 'Voltar para Produtos',
  em_breve: 'Em breve',
  avaliacoes: 'avaliações',
  recursos: 'Recursos inclusos',
  entrar_waitlist: 'Entrar na Waitlist',
  comecar_trial: 'Comecar Trial Gratis',
  ver_precos: 'Ver Precos',
  nao_encontrado_404: '404',
  nao_encontrado_titulo: 'Produto não encontrado',
  nao_encontrado_desc: 'O produto que você procura não existe no catálogo.',
  ver_todos: 'Ver Todos os Produtos'
};

pt.marketplace.simulador_comex = {
  badge: 'Produto',
  descricao: 'Calcule custos reais de operações de comércio exterior com precisão. Impostos, fretes, variações cambiais — tudo em um único simulador integrado à plataforma Gravity.',
  teste_gratis: 'Teste Grátis — 14 dias',
  assinar: 'Assinar Agora',
  preview_badge: 'Preview — Simulação de Importação',
  preview_dados: 'Dados reais de demonstração',
  funcionalidades_titulo: 'Funcionalidades ',
  funcionalidades_destaque: 'principais',
  para_quem_titulo: 'Para quem é ',
  para_quem_destaque: 'indicado'
};

pt.marketplace.produtos = {
  badge: 'Catálogo',
  titulo: 'Produtos ',
  titulo_destaque: 'especializados',
  subtitulo: 'Cada produto consome os serviços compartilhados da plataforma. Você paga uma vez pelos serviços, usa em todos os produtos.',
  em_breve: 'Em breve',
  avaliacoes: 'avaliações',
  teste_gratis: 'Teste Grátis',
  ver_detalhes: 'Ver Detalhes',
  entrar_waitlist: 'Entrar na Waitlist'
};

pt.marketplace.trial = {
  badge: 'Trial Gratuito',
  titulo: '14 dias para sentir o ',
  titulo_destaque: 'valor real',
  selecionou: 'Você selecionou: ',
  incluido_titulo: 'O que está incluído',
  nao_necessario: 'Não é necessário',
  sem_cartao: 'Sem cartão de crédito',
  sem_compromisso: 'Sem compromisso',
  cancele: 'Cancele a qualquer hora',
  comece_titulo: 'Comece em 60 segundos',
  comece_desc: 'Crie sua conta no Configurador e acesse o ambiente completo agora mesmo.',
  duracao: 'Duração',
  mao_na_massa: 'Mão na Massa!',
  redirecionamento: 'Você será redirecionado para o Configurador para criar sua conta. Sem cartão. Sem burocracia.',
  items_incluidos: {
    acesso: 'Acesso completo a todos os módulos do plano',
    dias: '14 dias de trial sem custo',
    suporte: 'Suporte via chat durante o período',
    dados: 'Dados reais, não mock — seu negócio, agora',
    export: 'Export de dados antes de finalizar, se quiser'
  }
};

pt.auth = {
  headline: 'O marketplace da sua',
  headline_destaque: 'eficiência operacional.',
  subheadline: 'Módulos independentes ou conectados para escalar seu negócio. Reduza a digitação manual com IA e assuma o controle real dos seus custos.',
  ecossistema_titulo: 'Ecossistema Modular',
  ecossistema_desc: 'Produtos que operam de forma isolada ou em harmonia, sem perda de dados.',
  zero_digitacao_titulo: 'Zero Digitação',
  zero_digitacao_desc: 'A Gabi AI automatiza processos braçais e elimina erros de preenchimento.',
  gestao_custos_titulo: 'Gestão de Custos',
  gestao_custos_desc: 'Visibilidade total e controle financeiro integrado a cada módulo do sistema.',
  padrao_enterprise_titulo: 'Padrão Enterprise',
  padrao_enterprise_desc: 'Privacidade absoluta com isolamento total por tenant em arquitetura SaaS.'
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2));
console.log('Both locale files updated successfully.');
