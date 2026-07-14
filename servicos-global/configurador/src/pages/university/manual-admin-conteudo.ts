/**
 * Manual Admin Gravity — SSOT compartilhado entre /docs/admin e Guia Academy.
 * Prints: badge «Em desenvolvimento» até publicação em public/university/screenshots/.
 */

import type { DocFluxo, DocPassoVisual, DocSecao } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const DOC_ADMIN_SUBTITULO =
  'Painel interno da equipe Gravity — organizações, usuários, deploy e saúde da plataforma'

export const DOC_ADMIN_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '1.0' },
  { rotulo: 'Atualizado em', valor: 'julho 2026' },
  { rotulo: 'Produto', valor: 'Admin Gravity' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/admin/visao-geral', href: true },
  { rotulo: 'Audiência', valor: 'Equipe Gravity (gravity_admin)' },
]

export const DOC_ADMIN_SECAO: DocSecao = {
  num: 1,
  titulo: 'Painel Administrativo Gravity',
  paragrafos: [
    'O **Painel Admin** é a interface **exclusiva da equipe Gravity** para operar a plataforma como um todo. Não é o **Configurador** (área do cliente): aqui você enxerga **todas as organizações**, usuários globais, financeiro consolidado, deploys, saúde dos serviços e trilhas de auditoria.',
    'O acesso exige **`gravity_admin = true`** (ou patente interna equivalente validada em `/api/v1/me` pelo backend — **nunca** via metadados do Clerk).',
  ],
  lista: [
    'Visão geral: dados cadastrais da organização Gravity HQ',
    'Organizações: tenants, status, produtos contratados e ações administrativas',
    'Usuários globais: convites cross-org, vínculos de workspace e suporte',
    'Financeiro e Histórico: faturamento e auditoria cross-tenant',
    'Deploy Railway e API Cockpit: releases e monitor de serviços em tempo real',
    'Segurança, NCM, certificados, cadastros globais e taxas de moeda',
  ],
  listaColunas: 2,
  mostrarInfograficoAdminTelas: true,
  callout: {
    tipo: 'seguranca',
    texto: 'Toda ação sensível (impersonação, edição de organização, deploy, permissões) gera **log de auditoria** obrigatório. Consulte **Segurança › Audit Trail** após operações de suporte.',
  },
  fluxos: [
    {
      titulo: 'Como acessar o Painel Admin',
      tituloSumario: 'Como acessar',
      paragrafos: [
        'Usuários com **`gravity_admin`** veem o atalho **Painel Admin** no **menu do usuário** (canto superior direito) em qualquer produto Gravity. Também é possível navegar direto para **`/admin/visao-geral`** quando já autenticado.',
        'Detalhes do menu superior e ícones estão no {{link:/university-gravity/docs/navegacao|Manual de Navegação}}.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Menu do usuário — Painel Admin',
          tituloCurto: 'Menu do usuário',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Clique no **avatar** no topo da tela e escolha **Painel Admin** (ou equivalente no localizador). O sistema valida `gravity_admin` no backend antes de renderizar o layout `/admin/*`.',
          ],
        },
        {
          titulo: 'Rota direta',
          tituloCurto: 'URL direta',
          paragrafos: [
            'Com sessão Clerk ativa e perfil autorizado, abra **`/admin/visao-geral`**. Sem permissão, o layout redireciona para o **Hub** — falha fechada, sem vazar telas administrativas.',
          ],
        },
      ]),
    },
    {
      titulo: 'Visão geral do Admin',
      tituloSumario: 'Visão geral do Admin',
      prefixoPassosVisuais: 'Admin',
      ancoraPassosPrefix: 'admin-areas',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'O menu lateral reúne **todas as áreas administrativas**. O infográfico da introdução resume os grupos; abaixo, cada subtópico descreve o que você faz em cada tela.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Visão geral (HQ)',
          tituloCurto: 'Visão geral',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Tela inicial **`/admin/visao-geral`**: dados cadastrais da **organização Gravity** (nome, CNPJ, UF, cidade, segmento). Edições passam por `PATCH` administrativo com auditoria.',
          ],
        },
        {
          titulo: 'Organizações',
          tituloCurto: 'Organizações',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Lista **todos os tenants**: status (Ativo, Trial, Suspenso, Churn), produtos contratados, quantidade de workspaces e usuários. Ações: ver detalhes, editar cadastro, suspender.',
            'O modal **Editar organização** aceita `nome_organizacao`, CNPJ, UF, cidade, segmento e status — strings vazias viram `null` no banco.',
          ],
        },
        {
          titulo: 'Produtos Gravity',
          tituloCurto: 'Produtos',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Catálogo administrativo dos **produtos Gravity** e configurações de contratação por organização — base para o que aparece no Hub e na Store do cliente.',
          ],
        },
        {
          titulo: 'Usuários globais',
          tituloCurto: 'Usuários',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Visão **cross-tenant** de todas as contas. Convite **cross-org** (Super Admin), edição de patentes, suspensão, expansão de vínculos por workspace e exportação da tabela.',
          ],
        },
        {
          titulo: 'Financeiro',
          tituloCurto: 'Financeiro',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Consolidação de **faturas e receita** por organização — visão interna para billing e suporte comercial.',
          ],
        },
        {
          titulo: 'Histórico global',
          tituloCurto: 'Histórico',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Trilha de eventos **cross-tenant** (ações em produtos, admin, integrações). Complementa o histórico por workspace que o cliente vê no Configurador.',
          ],
        },
        {
          titulo: 'Segurança',
          tituloCurto: 'Segurança',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Abas **Monitor**, **Infra**, **Isolamento**, **Compliance** e **Audit Trail**. KPIs de impersonações (F-03), mudanças de permissão e operações administrativas.',
          ],
        },
      ]),
    },
    {
      titulo: 'Impersonação de usuário',
      tituloSumario: 'Impersonação',
      prefixoPassosVisuais: 'Impersonação',
      ancoraPassosPrefix: 'impersonacao',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'A **impersonação** permite à equipe Gravity **assumir a sessão de um cliente** para suporte. É operação **altamente sensível**: exige permissão explícita, deixa rastro no **Audit Trail** e deve ser usada só com ticket registrado.',
      ],
      callout: {
        tipo: 'seguranca',
        texto: 'Logs obrigatórios: `actor_type`, `triggered_by` e `impersonating`. Filtro **IMPERSONACAO (F-03)** em **Segurança › Audit Trail**.',
      },
      passosVisuais: renumerarPassos([
        {
          titulo: 'Quem pode impersonar',
          tituloCurto: 'Permissão',
          paragrafos: [
            'A permissão **`admin:usuarios:impersonate`** controla quem pode iniciar sessão como outro usuário. Patentes internas **Super Admin** e fluxos de suporte usam essa capability — validada no backend, não no Clerk.',
          ],
        },
        {
          titulo: 'Trocar organização (override)',
          tituloCurto: 'Trocar org',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Antes de impersonar, admins com **override** podem **trocar a organização ativa** pelo modal **Trocar organização** — útil para navegar no tenant do cliente sem misturar dados.',
          ],
        },
        {
          titulo: 'Localizar o usuário',
          tituloCurto: 'Localizar',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Em **Admin › Usuários globais**, busque por **e-mail**, organização ou patente. Expanda a linha para ver **vínculos de workspace** (lazy-load por organização).',
          ],
        },
        {
          titulo: 'Iniciar impersonação',
          tituloCurto: 'Iniciar',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Na ação do usuário, escolha **Impersonar** (ou fluxo equivalente na UI). A sessão passa a refletir o **contexto do cliente**; um indicador visual alerta que você está personificando.',
          ],
          callout: {
            tipo: 'aviso',
            texto: 'Não realize alterações destrutivas durante impersonação sem alinhamento com o cliente e registro interno.',
          },
        },
        {
          titulo: 'Auditoria F-03',
          tituloCurto: 'Auditoria',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Em **Segurança › Audit Trail**, filtre **Impersonações (F-03)** para listar acessos como outro usuário. O card **Impersonações** na visão geral de Segurança mostra o total do período.',
          ],
        },
        {
          titulo: 'Encerrar sessão',
          tituloCurto: 'Encerrar',
          paragrafos: [
            'Finalize a impersonação pelo **controle de sessão** (sair do modo personificado ou logout). Confirme no Audit Trail que o evento de encerramento foi registrado quando aplicável.',
          ],
        },
      ]),
    },
    {
      titulo: 'Monitor de APIs e deploys',
      tituloSumario: 'APIs e deploys',
      prefixoPassosVisuais: 'Monitor',
      ancoraPassosPrefix: 'monitor',
      mostrarMapaSubtopicosPassos: true,
      paragrafos: [
        'Duas áreas críticas para operação da plataforma: **API Cockpit Admin** (saúde dos microsserviços em tempo real) e **Deploy Railway** (histórico de releases, rollback e registro manual).',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'API Cockpit — Servidores',
          tituloCurto: 'Servidores',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Em **`/admin/api-cockpit`**, a aba **Servidores** lista cada microsserviço com status **ONLINE**, **DEGRADADO** ou **OFFLINE**, latência e versão deployada.',
            'A tela faz **polling a cada 30 segundos** — alinhado à skill de observabilidade mínima da plataforma.',
          ],
        },
        {
          titulo: 'Métricas de requisições',
          tituloCurto: 'Métricas',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Cards consolidam **volume de requisições**, erros HTTP, **latência média**, **uptime** e série diária. Útil para correlacionar incidentes com deploys ou picos de um tenant.',
          ],
        },
        {
          titulo: 'Painel Deploy Railway',
          tituloCurto: 'Deploy',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            '**`/admin/deploy`** exibe histórico de deploys por **área** (configurador, pedido, smart-read, gabi…), ambiente, commit, autor e status (sucesso/falha).',
          ],
        },
        {
          titulo: 'Registrar deploy manual',
          tituloCurto: 'Registro manual',
          badgeEmDesenvolvimento: true,
          paragrafos: [
            'Quando um release não passa pelo pipeline automático, registre manualmente com **área**, ambiente, commit e responsável — `deployed_by` vem do admin autenticado.',
          ],
        },
        {
          titulo: 'Rollback e alertas',
          tituloCurto: 'Rollback',
          paragrafos: [
            'Em incidentes, use o histórico para identificar o último deploy estável e acione **rollback** no Railway conforme runbook interno.',
            'Serviços **OFFLINE** ou latência **> 3×** a média devem gerar investigação imediata — status **Degradado** indica degradação parcial.',
          ],
          callout: {
            tipo: 'dica',
            texto: 'Cruze **API Cockpit** (sintoma) com **Deploy** (causa provável) e **Audit Trail** (quem alterou configuração sensível).',
          },
        },
      ]),
    },
  ],
}
