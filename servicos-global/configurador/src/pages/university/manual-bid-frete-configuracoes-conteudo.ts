/**
 * Manual BID Frete §11 Configurações — todas as telas do Drive.
 */
import type { DocPassoVisual } from './manual-configurador-conteudo'
import { screenshotBidFreteInt } from './manual-bid-frete-catalogo-screenshots'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const S = screenshotBidFreteInt

function fig(sufixoDrive: string, paragrafoAntes: string) {
  return { legenda: '', imagem: S(sufixoDrive), paragrafoAntes }
}

const CALLOUT_SALVAR_CONFIGURACOES = {
  tipo: 'dica' as const,
  texto: 'É obrigatório salvar as modificações clicando em {{botao:salvar-configuracoes}}',
}

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const PASSOS_MANUAL_BID_FRETE_CONFIGURACOES: DocPassoVisual[] = renumerarPassos([
  {
    titulo: 'Visão geral das Configurações',
    paragrafos: [
      'No menu lateral do **BID Frete Internacional**, **Configurações** concentra preferências do workspace: **status**, **taxa de câmbio**, **colunas** da lista, **cards** de Insights, **Kanban** e demais abas administrativas.',
    ],
    imagem: S('configuracoes_tabela'),
    imagemAbaixoTexto: true,
  },
  {
    titulo: 'CARD',
    paragrafos: [
      'Na aba **Cards**, escolha o **período de comparação**, inclua indicadores em **Ativos** e remova os que não devem aparecer — o **preview** mostra como ficará em **Insights** e **Lista** antes de **Salvar**.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          fig(
            'configuracoes_cards_periodo_de_comparacao',
            'Abra **Configurações → Cards** e escolha o **período de comparação** (7 dias, 30 dias, 6 meses, 1 ano ou Tudo).',
          ),
          fig(
            'configuracoes_cards_incluir',
            'Em **Disponíveis para adicionar**, clique em **+** no card que deseja incluir em **Ativos**.',
          ),
          fig(
            'configuracoes_cards_incluir_2',
            'O indicador incluído aparece em **Ativos** e entra no **preview** do cockpit.',
          ),
          fig(
            'configuracoes_cards_desativar_1',
            'Em **Ativos**, clique em **×** no card que deseja remover da lista.',
          ),
          fig(
            'configuracoes_cards_desativar_2',
            'Clique em **Salvar** e confirme a remoção para atualizar **Insights** e **Lista**.',
          ),
        ],
      },
    ],
  },
  {
    titulo: 'Tabela',
    paragrafos: [
      'Em **Tabela**, defina **linhas por página** padrão da **Lista** virtual e o **destaque visual** de cotações prestes a expirar.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          fig(
            'configuracoes_tabela',
            'Abra **Configurações → Tabela**. Defina **linhas por página** e ligue **Destacar cotações prestes a expirar**.',
          ),
          fig(
            'configuracoes_tabela_1',
            'É possível deixar cotações que estão prestes a vencer **destacadas**. Para isso, selecione o **prazo** que deseja — de **1 hora** a **24 horas** ou de **1 dia** a **100 dias**. O badge **Como funciona o destaque** resume **gatilho**, **status elegíveis** e **resultado esperado** na Lista.',
          ),
          fig(
            'configuracoes_tabela_2',
            'Na **Lista**, a linha recebe **borda avermelhada** à esquerda quando o **Prazo para resposta** está dentro da antecedência configurada.',
          ),
        ],
        calloutApos: {
          tipo: 'dica',
          texto:
            'Clique em **Salvar** para aplicar na **Lista** aberta. Padrão: **2 horas** de antecedência.',
        },
      },
    ],
  },
  {
    titulo: 'Colunas',
    paragrafos: [
      'Em **Colunas**, ajuste **casas decimais**, **formato de datas** e **colunas personalizadas** da **Lista**.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 1,
        rotuloPasso: 'Casas Decimais',
        textoAcimaEstiloCorpo: true,
        telas: [
          fig(
            'configuracoes_casas_decimais_1',
            'Abra **Configurações → Colunas → Casas Decimais**. Use **−** e **+** (ou digite) para definir as casas de cada coluna — **Frete base**, **Taxas de Origem**, **Taxas de Destino**, **Valor do Frete Total** e demais campos numéricos.',
          ),
        ],
        calloutApos: {
          tipo: 'dica',
          texto:
            'Clique em **Salvar**: as casas decimais respectivas passam a valer na **Lista** para cada coluna ajustada.',
        },
      },
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          fig(
            'configuracoes_casas_decimais',
            'Na **Lista**, as colunas **Frete base**, **Taxas de Origem**, **Taxas de Destino** e **Valor do Frete Total** exibem os valores com as casas decimais definidas em **Configurações**.',
          ),
        ],
      },
      {
        indice: 0,
        colunas: 1,
        rotuloPasso: 'Formato de data',
        textoAcimaEstiloCorpo: true,
        telas: [
          fig(
            'configuracoes_formato_data',
            'Abra **Configurações → Colunas → Formato de Data**. Escolha o padrão de exibição — **DD/MM/AAAA**, **MM/DD/AAAA**, **AAAA-MM-DD** e demais formatos — para datas na **Lista**, inputs de edição e exportações.',
          ),
        ],
        calloutApos: {
          tipo: 'dica',
          texto:
            'Clique em **Salvar** para aplicar o formato de data na **Lista** e demais telas do workspace.',
        },
      },
      {
        indice: 0,
        colunas: 1,
        rotuloPasso: 'Personalizadas',
        textoAcimaEstiloCorpo: true,
        textoIntro:
          'Abra **Configurações → Colunas → Personalizadas**. Crie colunas extras para a **Lista** — **numérico**, **data**, **texto**, **select** e demais tipos — com **+ Criar Coluna**.',
        telas: [
          fig(
            'configuracoes_personalizada_1',
            '**01.** Em **Personalizadas**, clique **+ Criar Coluna** para abrir o modal **Nova Coluna**.',
          ),
        ],
      },
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: S('configuracoes_personalizada_3'),
            paragrafoAntes:
              '**02.** Informe o **nome**, escolha o **tipo**, defina **visibilidade** e, se quiser, **descrição**; confirme com **Salvar** no modal.',
            calloutDepois: {
              tipo: 'dica',
              texto:
                'Crie colunas personalizadas nos formatos **Texto**, **Número**, **Lista**, **Data**, **Percentual**, **Checkbox**, **Tipo de documento** e **Fórmula** — escolha o **tipo** no modal **Nova Coluna**.',
            },
          },
          {
            legenda: '',
            calloutDepois: {
              tipo: 'dica',
              texto:
                'Em **Visibilidade**, escolha **Privado** (só você vê a coluna) ou **Todos** (todos os usuários do **workspace**). **Por perfil** restringe a patentes específicas.',
            },
          },
          fig(
            'configuracoes_personalizada_4',
            '**03.** A coluna entra na lista de **Personalizadas**; clique **Salvar** no rodapé para gravar no workspace.',
          ),
          fig(
            'configuracoes_personalizada_5',
            '**04.** Na **Lista**, a coluna aparece na tabela — edite o valor **inline** na célula.',
          ),
          fig(
            'configuracoes_personalizada_6',
            '**05.** No seletor **Colunas → Manuais**, a coluna nova já vem **marcada** (exibida por padrão).',
          ),
        ],
        calloutApos: {
          tipo: 'dica',
          texto:
            'Toda coluna personalizada **nova** passa a valer na **Lista** já **selecionada** no seletor **Colunas**. Para ocultar depois, desmarque no seletor ou use o ícone **olho** em **Personalizadas**.',
        },
      },
    ],
  },
  {
    titulo: 'Kanban',
    paragrafos: [
      'Ajuste **colunas**, **cards** e **modal** da visão Kanban — preferências do **workspace** em **Configurações → Kanban**.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 1,
        rotuloPasso: 'Colunas Kanban',
        textoAcimaEstiloCorpo: true,
        textoIntro:
          'Em **Configurações → Kanban → Colunas**, escolha quais **status** aparecem no board. O **preview** no topo mostra a ordem das colunas visíveis. Em **Ativos**, as colunas de **sistema** (badge **sistema** e **cadeado**) ficam **sempre** no Kanban — não dá para ocultá-las.',
        telas: [
          {
            legenda: '',
            paragrafoAntes:
              'As **demais** colunas são opcionais: use o **olho** ou **×** para retirar do board (o status vai para **Disponíveis para adicionar**); clique **+** para incluir de novo. Novos status de **Status Cotação** entram na lista automaticamente. Clique **Salvar** no rodapé para aplicar no workspace.',
          },
          fig('configuracoes_kanban_1', ''),
        ],
        calloutApos: {
          tipo: 'dica',
          texto:
            'Para **criar novos status**, acesse **Status Cotação** no menu lateral — eles passam a aparecer em **Disponíveis para adicionar** ou em **Ativos**, conforme a configuração.',
        },
      },
      {
        indice: 0,
        colunas: 1,
        rotuloPasso: 'Card',
        textoAcimaEstiloCorpo: true,
        textoIntro:
          'Defina quais **campos** aparecem em cada cartão de cotação. O **número da cotação** e o **tipo de operação** são **fixos** no topo do card.',
        telas: [
          {
            legenda: '',
            imagem: S('configuracoes_kanban_2'),
            paragrafoAntes:
              'Abra **Kanban → Card**. O **preview** mostra o layout; em **Ativos**, use o **olho** para ocultar um campo ou **×** para movê-lo para **Disponíveis para adicionar**.',
          },
        ],
        calloutApos: {
          tipo: 'dica',
          texto:
            'Em **Disponíveis para adicionar**, clique **+** no campo desejado. Opcional: escolha a **data crítica** no rodapé do card. Clique **Salvar** para aplicar.',
        },
      },
      {
        indice: 0,
        colunas: 1,
        rotuloPasso: 'Modal',
        textoAcimaEstiloCorpo: true,
        textoIntro:
          'Configure o **modal rápido** ao clicar um cartão — abas **Cotação**, **Rota**, **Datas** e **Lembrete**.',
        telas: [
          {
            legenda: '',
            imagem: S('configuracoes_kanban_3'),
          },
        ],
        calloutApos: {
          tipo: 'dica',
          texto:
            'Campos removidos ficam em **Disponíveis para adicionar** — use **+** para incluir de novo. O detalhe completo da cotação permanece em **Detalhes**. Clique **Salvar** no rodapé.',
        },
      },
    ],
  },
  {
    titulo: 'Status de cotação',
    tituloCurto: 'Status',
    paragrafos: [
      '**Status de Cotação** lista todos os status do workspace.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: S('status_1'),
            paragrafoAntes: 'Lista de status',
            calloutDepois: {
              tipo: 'dica',
              texto:
                '**Arraste** para reordenar (reflete no Kanban). Status de **sistema** são fixos — sem editar ou excluir.',
            },
          },
          {
            legenda: '',
            imagem: S('status_4'),
            paragrafoAntes:
              'Informe o **nome** do novo status, clique **+ Adicionar à lista** e, em seguida, **Salvar** no rodapé para gravar.',
            calloutDepois: {
              tipo: 'dica',
              texto:
                'É obrigatório clicar em {{botao:salvar-configuracoes}} — sem **Salvar**, o status novo não é persistido no workspace.',
            },
          },
          {
            legenda: '',
            imagem: S('status_5'),
            paragrafoAntes:
              'Após **Salvar**, o **novo status** aparece no **painel de seleção de status** da **Lista**.',
          },
          {
            legenda: '',
            imagem: S('status_6'),
            paragrafoAntes:
              '**Editar** status customizado **na Lista** — abra o seletor **STATUS** da cotação, escolha o **novo status** e clique **Confirmar**.',
          },
        ],
      },
    ],
    callout: CALLOUT_SALVAR_CONFIGURACOES,
  },
  {
    titulo: 'Preferências',
    paragrafos: [
      'Em **Preferências**, defina padrões da organização para novas cotações — **autorização do fornecedor** editar proposta e **cópias de e-mail** transacionais para você.',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 1,
        rotuloPasso: 'Autorização para fornecedor atualizar cotação',
        textoAcimaEstiloCorpo: true,
        textoIntro:
          'O **padrão do workspace** define se o fornecedor pode alterar dados da proposta **até a validade**. Com o toggle **desligado** (padrão), o fornecedor **não edita** após o envio; no wizard **Nova cotação**, a escolha **Sim/Não** por cotação continua **obrigatória**.',
        telas: [
          {
            legenda: '',
            imagem: S('preferencia_alterar_cotacao_1'),
            paragrafoAntes:
              'Abra **Configurações → Preferências** e ligue ou desligue **O fornecedor pode alterar dados da cotação até a validade**.',
          },
          {
            legenda: '',
            imagem: S('preferencia_alterar_cotacao_2'),
            paragrafoAntes:
              'A seleção em **Configurações** irá preencher esse campo como **padrão** em todas as cotações.',
          },
          {
            legenda: '',
            imagem: S('preferencia_alterar_cotacao_3'),
            paragrafoAntes:
              'Com permissão ativa, o fornecedor edita a proposta (tela abaixo do fornecedor) enquanto o prazo de resposta estiver aberto.',
          },
        ],
      },
      {
        indice: 0,
        colunas: 1,
        rotuloPasso: 'Configuração de e-mails',
        textoAcimaEstiloCorpo: true,
        textoIntro:
          'Em **E-mails para você**, ative cópias transacionais no **seu e-mail** cadastrado na organização. São **três tipos** independentes — ligue só o que precisa acompanhar.',
        telas: [
          {
            legenda: '',
            imagem: S('preferencia_email_cotacao_1'),
            paragrafoAntes:
              '**Envio da solicitação** — confirmação quando a cotação é disparada aos fornecedores. **Resposta do fornecedor** — aviso ao enviar ou atualizar proposta. **Confirmação do vencedor** — quando o ganhador aceita após aprovação.',
          },
          {
            legenda: '',
            imagem: S('preferencia_email_cotacao_2'),
            paragrafoAntes:
              'Com **Resposta do fornecedor** ligado, chega e-mail **Nova resposta** (primeiro envio) ou **Proposta atualizada** (alteração) quando o fornecedor envia ou altera a proposta na cotação.',
          },
          {
            legenda: '',
            imagem: S('preferencia_email_cotacao_4'),
            paragrafoAntes:
              'Com **Confirmação do fornecedor vencedor** ligado, chega e-mail **Aceite confirmado** quando o ganhador confirma **Recebi e estou de acordo**.',
          },
        ],
      },
    ],
    callout: CALLOUT_SALVAR_CONFIGURACOES,
  },
  {
    titulo: 'Taxa de Câmbio',
    tituloCurto: 'Taxa de câmbio',
    paragrafos: [
      'Em **Configurações → Taxa de Câmbio**, você controla a cotação das **principais moedas do mundo** em **quatro boletins diários** (PTAX) e a **projeção do dólar futuro** (BACEN Focus).',
    ],
    galeriaComparacaoAposParagrafo: [
      {
        indice: 0,
        colunas: 1,
        textoAcimaEstiloCorpo: true,
        telas: [
          {
            legenda: '',
            imagem: S('preferencia_taxa_cambio'),
          },
        ],
      },
    ],
  },
])
