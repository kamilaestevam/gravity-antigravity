import type { DocPassoVisual, DocSecao } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const DOC_HUB_SUBTITULO =
  'Painel principal da plataforma: produtos contratados, operações em andamento, Gravity Store e insights da GABI.'

export const DOC_HUB_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '1.0' },
  { rotulo: 'Atualizado em', valor: 'junho 2026' },
  { rotulo: 'Produto', valor: 'Hub' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/hub', href: true },
  { rotulo: 'Rota base', valor: '/hub' },
  { rotulo: 'Componente', valor: 'SelecionarWorkspace' },
]

export const DOC_HUB_SECAO: DocSecao = {
  num: 1,
  titulo: 'Hub — painel principal da plataforma',
  paragrafos: [
    'O **Hub** é a tela inicial da Gravity após o login. Você pode voltar a ela a qualquer momento pelo atalho **Hub** na barra superior de qualquer produto ou pela rota `/hub`.',
    'De um único lugar você escolhe o **workspace**, abre **produtos contratados**, acompanha **processos COMEX**, descobre novos módulos na **Gravity Store** e lê **insights da GABI** sobre a operação.',
    'O porteiro pós-login (`GET /api/v1/me`) envia usuários com organização ativa para o Hub. Usuários **Fornecedor** ou sem workspace preferido podem ver a seleção de workspace antes do painel completo.',
  ],
  fluxos: [
    {
      titulo: 'Fluxo 1 — visão geral do Hub',
      tituloSumario: 'Visão geral',
      paragrafos: [
        'A faixa superior mostra saudação, resumo do workspace e contadores de processos. Abaixo vêm, nesta ordem: **Seus Produtos Gravity**, **Operações em andamento**, **Gravity Store** (vitrine) e **GABI AI** (insights).',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Hub sem produto contratado',
          imagem: '/university/screenshots/hub-tela-sem-produto-contratado.png',
          paragrafos: [
            'Quando nenhum módulo está ativo no workspace, o puzzle exibe as peças em prévia (cinza) e um banner convida a **Ativar na Gravity Store**.',
            'Ainda assim você já vê a estrutura do Hub — operações, vitrine e GABI — pronta para quando o primeiro produto for contratado.',
          ],
          callout: {
            tipo: 'dica',
            texto: 'Contrate e habilite produtos em Configurador → Assinaturas e, por workspace, em Assinaturas → Workspaces por produto.',
          },
        },
        {
          titulo: 'Hub com produtos ativos',
          imagem: '/university/screenshots/hub-tela-com-produto-contratado.png',
          paragrafos: [
            'Com assinaturas ativas, as peças **contratadas** ficam iluminadas e clicáveis — abrem o produto no workspace selecionado.',
            'O hero resume: nome do workspace, processos em andamento, itens aguardando ação e quantidade de produtos no puzzle.',
            'Use o seletor de workspace no topo para trocar de filial/cliente sem sair do Hub.',
          ],
        },
      ]),
    },
    {
      titulo: 'Fluxo 2 — Seus Produtos Gravity',
      tituloSumario: 'Seus Produtos',
      paragrafos: [
        'A seção **Seus Produtos Gravity** usa o mesmo puzzle visual da Gravity Store. Aqui aparecem **somente produtos com status ATIVO no catálogo** — a prévia do ecossistema completo.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Peças contratadas × disponíveis × em breve',
          imagem: '/university/screenshots/hub-tela-com-produto-contratado.png',
          paragrafos: [
            '**Contratado e ativo (owned)** — assinatura ativa na organização **e** produto habilitado no workspace. Peça colorida (`gs-piece--on`): clique abre o módulo (Pedido, Processo, Smart Docs, etc.).',
            '**Disponível para contratar (available)** — no catálogo ATIVO, mas sem assinatura ativa. Peça mais discreta (`gs-piece--compravel-hub`): clique leva à {{link:/university-gravity/docs/store|Gravity Store}}.',
            '**Em breve (soon)** — status `EM_BREVE` no catálogo Admin. Peça com selo “Em breve”; não é clicável para operação.',
            'O medidor à direita mostra **X de Y** — quantas peças você já possui versus o total do puzzle oficial.',
          ],
          callout: {
            tipo: 'aviso',
            texto: 'Produto contratado na organização mas desabilitado no workspace não aparece como “owned” clicável — revise Assinaturas → Workspaces por produto no Configurador.',
          },
        },
        {
          titulo: 'Atalho Gravity Store no cabeçalho da seção',
          paragrafos: [
            'O botão **Gravity Store** (pill com ícone de sacola) no canto superior direito da seção abre a vitrine completa em `/store`.',
          ],
        },
      ]),
    },
    {
      titulo: 'Fluxo 3 — acesso à Gravity Store',
      tituloSumario: 'Acesso à Store',
      paragrafos: [
        'A Gravity Store é o catálogo de módulos Gravity. No Hub existem **quatro caminhos** principais até ela.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Caminhos para abrir a Store',
          imagem: '/university/screenshots/hub-tela-sem-produto-contratado.png',
          paragrafos: [
            '1. **Banner “Ative seu primeiro módulo”** — CTA primário quando não há peça owned.',
            '2. **Link Gravity Store** no cabeçalho de Seus Produtos Gravity.',
            '3. **Painel Gravity Store** na faixa inferior (card em carrossel — ver Fluxo 5).',
            '4. **Menu do usuário** (canto superior direito) → item Marketplace / Gravity Store.',
          ],
          linkCapitulo: {
            texto: 'Manual completo da Gravity Store',
            href: '/university-gravity/docs/store',
          },
        },
      ]),
    },
    {
      titulo: 'Fluxo 4 — Aguardando ação',
      tituloSumario: 'Aguardando ação',
      paragrafos: [
        'O card **Aguardando ação** fica na faixa **Operações em andamento**, junto com Processos em andamento e NFs de importação. O valor vem de `GET /api/v1/hub/operacoes`.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'O que entra na contagem',
          imagem: '/university/screenshots/hub-tela-com-produto-contratado.png',
          paragrafos: [
            'O número é a **soma de pendências humanas** nos produtos **contratados e ativos** que você pode acessar:',
            '– **Pedido** — pedidos atrasados + pedidos sem exportador vinculado',
            '– **BID Frete Internacional** — alertas de cotação (vence hoje, resposta, aprovação, fora do prazo)',
            '– **BID Câmbio** — operações com vencimento nos próximos 30 dias',
            '– **Simula Custo** — simulações inviáveis ou em atenção',
            '– **LPCO** — licenças com status suspensa',
          ],
          callout: {
            tipo: 'dica',
            texto: 'Notas fiscais pendentes têm card próprio (NFs de importação) — não entram em Aguardando ação.',
          },
        },
        {
          titulo: 'O que você vê na tela',
          paragrafos: [
            '**Valor numérico** — total de pendências. Enquanto carrega, aparece **—**.',
            '**Tag amarela ⚠ N pendentes** — só quando o contador é maior que zero.',
            '**Aviso cinza** — quando nenhum produto contratado alimenta o KPI ou o serviço ainda não respondeu.',
            '**Reordenação** — com alertas, o Hub pode trazer este card para a primeira posição da linha de KPIs.',
          ],
        },
      ]),
    },
    {
      titulo: 'Fluxo 5 — vitrine Gravity Store no Hub',
      tituloSumario: 'Vitrine Store',
      paragrafos: [
        'O painel inferior esquerdo **Gravity Store** é uma vitrine dos módulos que você **ainda não contratou**.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Carrossel automático',
          imagem: '/university/screenshots/hub-tela-com-produto-contratado.png',
          paragrafos: [
            'Lista apenas produtos **available** ou **soon** (não mostra os já owned).',
            'O carrossel **gira a cada 3,5 segundos**. Ao passar o mouse, a rotação **pausa**.',
            'Setas e **bolinhas** permitem navegar manualmente. Clique no card para abrir `/store`.',
          ],
        },
        {
          titulo: 'Badges do card',
          paragrafos: [
            '**Disponível** — badge verde; módulo pronto para contratação.',
            '**Em breve** — badge âmbar; produto anunciado mas ainda não liberado.',
          ],
        },
      ]),
    },
    {
      titulo: 'Fluxo 6 — Insights da GABI',
      tituloSumario: 'Insights GABI',
      paragrafos: [
        'O painel **GABI AI** exibe até **três insights por página**, gerados a partir dos KPIs dos produtos ativos.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'De onde vêm os insights',
          imagem: '/university/screenshots/hub-tela-com-produto-contratado.png',
          paragrafos: [
            'O frontend chama `GET /api/v1/hub/insights`. O backend agrega dashboards de **Pedido, BID Câmbio, BID Frete, Simula Custo, LPCO e NF Importação** — somente produtos com assinatura ativa e acesso do usuário.',
            'Cada insight recebe **score** ponderado pelo **papel** (`tipo_usuario`). O motor mistura ~**90% alertas operacionais** e ~**10% dicas de plataforma** (mínimo 4, máximo 12 cards). Cache **5 min** por organização+usuário.',
          ],
        },
        {
          titulo: 'Rotação e navegação',
          paragrafos: [
            '**3 insights por página** — auto-avanço **a cada 5 segundos**; pausa com o mouse sobre o painel.',
            'Badge **AO VIVO** (ponto verde). Setas ◀ ▶ e bolinhas trocam a página.',
          ],
        },
        {
          titulo: 'Anatomia de cada card',
          paragrafos: [
            '**Tag** — origem (ex.: “PEDIDO · Atrasos”). Ícone foguete (default) ou aviso (warn).',
            '**Variante default** — destaque índigo; **warn** — destaque âmbar para pendências.',
            '**Texto** — achado objetivo. **Stat** opcional no rodapé. **Link** abre o produto quando há `rota`.',
          ],
        },
      ]),
    },
  ],
}
