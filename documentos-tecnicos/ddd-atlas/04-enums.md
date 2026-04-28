# Atlas DDD - Aba 4: Enums

> Gerado de planilha v52 em 2026-04-28 por `scripts/sob-demanda/gerar-atlas-ddd.py`.
> NAO edite manualmente. Re-execute o script apos mudanca na planilha mestre.

## Como ler

- **Local**: produto/servico onde o enum esta declarado.
- **Enum DDD**: nome canonical do enum (PascalCase, `<Entidade><Atributo>`).
- **Valor Prisma**: valor literal (UPPER_SNAKE_CASE - constante tecnica do banco).
- **Usado em models**: models Prisma que referenciam o enum.
- **Cor / Icone**: marcadores de UI (badge).
- **E default?**: se este e o valor padrao da coluna.
- **Descricao**: significado do valor.
- **Alias historico**: valor anterior (antes do rename DDD).

Convencoes:
- Apenas valores DDD-finais. Nao mostra estado pre-rename.
- Onde aplicavel, coluna "Alias historico" mostra nome legado (util para grep e git log --follow).
- Linhas marcadas `—` na planilha estao no apendice (nao sao acionaveis).

## Tabela (381 linhas)

| Local | Enum DDD | Valor Prisma | Usado em models | Cor | Icone | E default? | Descricao | Alias historico |
|---|---|---|---|---|---|---|---|---|
|  | AlertaStatus |  |  |  |  |  |  | AlertaStatus |
|  | CambioCotacaoStatusMelhorAvaliacao |  |  |  |  |  |  |  |
|  | CambioCotacaoStatusMelhorValor |  |  |  |  |  |  |  |
|  | CambioPropostaStatusEmAvaliacao |  |  |  |  |  | Cotação em avaliação pelo cliente |  |
|  | DashboardGraficoTipo |  |  |  |  |  |  | TipoGrafico |
|  | DashboardWidgetTipo |  |  |  |  |  |  | TipoWidget |
|  | EmailFilaPrioridade |  |  |  |  |  |  | FilaEmailPrioridade |
|  | EmailSentimento |  |  |  |  |  |  | EmailNivelSentimento |
|  | EmailStatus |  |  |  |  |  |  | EmailStatus |
|  | EventoStatus |  |  |  |  |  |  | EventoStatus |
|  | NCMSincronizacaoOrigem |  |  |  |  |  |  | NcmSyncOrigem |
|  | StatusNcmSync |  |  |  |  |  |  | NcmSyncStatus |
|  | StatusThreadEmail |  |  |  |  |  |  | EmailStatusThread |
|  | TipoAtor |  |  |  |  |  |  | TipoAtor |
| Configurador | APITokenChamadas | SERVICE |  |  |  | Nao | Token usado para chamadas de API entre serviços/aplicações. | EscopoTokenServico |
| Configurador | APITokenCron | CRON |  |  |  | Nao | Token usado por jobs agendados (cron) para autenticar-se. | EscopoTokenServico |
| Configurador | APITokenValidar | WEBHOOK |  |  |  | Nao | Token usado para assinar/validar webhooks recebidos. | EscopoTokenServico |
| Configurador | DeployAmbienteLocal | DEVELOPMENT | Deploy |  |  | Nao | Deploy em ambiente de desenvolvimento local/dev. | AmbienteDeploy |
| Configurador | DeployAmbienteProducao | PRODUCTION | Deploy |  |  | Sim | Deploy em produção (valor padrão do sistema). | AmbienteDeploy |
| Configurador | DeployAmbienteTeste | STAGING | Deploy |  |  | Nao | Deploy em homologação (pré-produção). | AmbienteDeploy |
| Configurador | DeployAmbienteTodos | ALL | Deploy |  |  | Nao | Deploy aplicado em todos os ambientes simultaneamente. | AmbienteDeploy |
| Configurador | DeployStatusConcluido | SUCCESS | Deploy |  |  | Sim | Deploy concluído com sucesso. | StatusDeploy |
| Configurador | DeployStatusEmAndamento | IN_PROGRESS | Deploy |  |  | Nao | Deploy em andamento no momento. | StatusDeploy |
| Configurador | DeployStatusFalha | FAILED | Deploy |  |  | Nao | Deploy falhou durante execução. | StatusDeploy |
| Configurador | DeployStatusRevertidoVersaoAnterior | ROLLBACK | Deploy |  |  | Nao | Deploy revertido para versão anterior. | StatusDeploy |
| Configurador | EmpresaStatus | ACTIVE | Empresa |  |  | Sim | Workspace/empresa-filha em operação. | StatusEmpresa |
| Configurador | EmpresaStatus | INACTIVE | Empresa |  |  | Nao | Workspace desativado — sem acesso, dados preservados. | StatusEmpresa |
| Configurador | FaturaProdutoGravityStatusAguardandoPagamento | OPEN | FaturaProdutosGravity |  |  | Nao | Fatura emitida e aguardando pagamento. | FaturaStatus |
| Configurador | FaturaProdutoGravityStatusAnulada | VOID | FaturaProdutosGravity |  |  | Nao | Fatura anulada (sem efeito fiscal). | FaturaStatus |
| Configurador | FaturaProdutoGravityStatusEmAndamento | DRAFT | FaturaProdutosGravity |  |  | Sim | Fatura em rascunho — ainda não emitida. | FaturaStatus |
| Configurador | FaturaProdutoGravityStatusIncobravel | UNCOLLECTIBLE | FaturaProdutosGravity |  |  | Nao | Fatura marcada como incobrável (baixa de prejuízo). | FaturaStatus |
| Configurador | FaturaProdutoGravityStatusPaga | PAID | FaturaProdutosGravity |  |  | Nao | Fatura paga. | FaturaStatus |
| Configurador | FaturaProdutoGravityStatusVencida | OVERDUE | FaturaProdutosGravity |  |  | Nao | Fatura vencida sem pagamento. | FaturaStatus |
| Configurador | OrganizacaoStatus | ACTIVE | Organizacao |  |  | Nao | Organização operando normalmente, tudo ativo. | StatusOrganizacao |
| Configurador | OrganizacaoStatus | CANCELLED | Organizacao |  |  | Nao | Organização cancelou o serviço; dados preservados mas sem acesso. | StatusOrganizacao |
| Configurador | OrganizacaoStatus | PENDING_SETUP | Organizacao |  |  | Sim | Organização recém-criada; ainda passando pelo onboarding inicial. | StatusOrganizacao |
| Configurador | OrganizacaoStatus | SUSPENDED | Organizacao |  |  | Nao | Conta suspensa (ex: falta de pagamento) — acesso bloqueado até regularizar. | StatusOrganizacao |
| Configurador | ProdutoGravityCobrancaCadastroAtivo | PER_PRODUCT | ProdutoGravity |  |  | Nao | Cobra por produto cadastrado ativo. | TipoCobranca |
| Configurador | ProdutoGravityCobrancaFixaMensal | MONTHLY | ProdutoGravity |  |  | Sim | Cobrança fixa mensal (assinatura SaaS tradicional). | TipoCobranca |
| Configurador | ProdutoGravityCobrancaPorDocumento | PER_DOCUMENT | ProdutoGravity |  |  | Nao | Cobra por documento emitido/processado. | TipoCobranca |
| Configurador | ProdutoGravityCobrancaPorDUE | PER_DUE | ProdutoGravity |  |  | Nao | Cobra por Declaração Única de Exportação emitida. | TipoCobranca |
| Configurador | ProdutoGravityCobrancaPorDUIMP | PER_DI_DUIMP | ProdutoGravity |  |  | Nao | Cobra por DI ou DUIMP registrada. | TipoCobranca |
| Configurador | ProdutoGravityCobrancaPorEstimativa | PER_ESTIMATE | ProdutoGravity |  |  | Nao | Cobra por estimativa de custo gerada (SimulaCusto). | TipoCobranca |
| Configurador | ProdutoGravityCobrancaPorLPCO | PER_LPCO | ProdutoGravity |  |  | Nao | Cobra por LPCO emitido. | TipoCobranca |
| Configurador | ProdutoGravityCobrancaPorProcesso | PER_PROCESS | ProdutoGravity |  |  | Nao | Cobra por processo COMEX criado. | TipoCobranca |
| Configurador | ProdutoGravityCobrancaPorWorlflow | PER_FLOW | ProdutoGravity |  |  | Nao | Cobra por fluxo/workflow executado. | TipoCobranca |
| Configurador | ProdutoGravityCobrancaQuantidadeUsuario | LIMITED | ProdutoGravity |  |  | Nao | Produto com cota de usuários (depois cobra extra por usuário adicional). | TipoLimiteUsuario |
| Configurador | ProdutoGravityDisponivel | ACTIVE | ProdutoGravity |  |  | Sim | Produto disponível no catálogo, pode ser assinado. | StatusProduto |
| Configurador | ProdutoGravityEmbreve | COMING_SOON | ProdutoGravity |  |  | Nao | Produto anunciado mas ainda não lançado. | StatusProduto |
| Configurador | ProdutoGravityInativo | LEGACY | ProdutoGravity |  |  | Nao | Produto em descontinuação — só clientes antigos têm acesso. | StatusProduto |
| Configurador | ProdutoGravityIndisponivel | SUSPENDED | ProdutoGravity |  |  | Nao | Produto temporariamente indisponível para novas assinaturas. | StatusProduto |
| Configurador | ProdutoGravityRemovido | INACTIVE | ProdutoGravity |  |  | Nao | Produto removido do catálogo. | StatusProduto |
| Configurador | ProdutoGravityUsuarioIlimitado | UNLIMITED | ProdutoGravity |  |  | Sim | Produto sem limite de usuários. | TipoLimiteUsuario |
| Configurador | StatusAssinaturaProdutoGravity | ACTIVE | AssinaturaProdutoGravity |  |  | Nao | Assinatura em dia, cobrança ocorrendo normalmente. | StatusAssinatura |
| Configurador | StatusAssinaturaProdutoGravity | CANCELLED | AssinaturaProdutoGravity |  |  | Nao | Assinatura cancelada (pelo cliente ou por inadimplência prolongada). | StatusAssinatura |
| Configurador | StatusAssinaturaProdutoGravity | INCOMPLETE | AssinaturaProdutoGravity |  |  | Nao | Tentativa de cobrança inicial falhou; Stripe aguardando ação. | StatusAssinatura |
| Configurador | StatusAssinaturaProdutoGravity | PAST_DUE | AssinaturaProdutoGravity |  |  | Nao | Fatura vencida sem pagamento; próxima tentativa de cobrança agendada. | StatusAssinatura |
| Configurador | StatusAssinaturaProdutoGravity | TRIALING | AssinaturaProdutoGravity |  |  | Sim | Em período de teste gratuito (antes da 1ª cobrança). | StatusAssinatura |
| Configurador | TipoUsuarioEmpresa | SUPPLIER | UsuarioWorkspace |  |  | Nao | Fornecedor externo com acesso limitado ao workspace. | TipoMembroEmpresa |
| Configurador | UsuarioTipo | ADMIN | Usuario |  |  | Nao | Admin interno do time Gravity com permissões granulares (ver PermissaoAdminGravity). | TipoUsuario |
| Configurador | UsuarioTipo | MASTER | Usuario |  |  | Nao | Dono/gestor da organização cliente — administra usuários, produtos e permissões. | TipoUsuario |
| Configurador | UsuarioTipo | STANDARD | Usuario |  |  | Sim | Usuário padrão da organização — usa os produtos, sem administração. | TipoUsuario |
| Configurador | UsuarioTipo | SUPER_ADMIN | Usuario |  |  | Nao | Admin interno do time Gravity com acesso irrestrito à plataforma. | TipoUsuario |
| Configurador | UsuarioTipo | SUPPLIER | Usuario |  |  | Nao | Fornecedor externo cross-tenant (ex: despachante atendendo vários clientes). | TipoUsuario |
| Configurador | UsuarioTipoWorkspace | STANDARD | UsuarioWorkspace |  |  | Sim | Patente padrão dentro do workspace — usa os produtos. | TipoMembroEmpresa |
| Configurador | UsuarioWorkspace | MASTER | UsuarioWorkspace |  |  | Nao | Patente do usuário dentro de um workspace — administra esse workspace. | TipoMembroEmpresa |
| Produto - bid-cambio | CambioBaseVencimentoChegadaPortoAeroporto | DATA_CHEGADA | ParcelaCambio \| ConfigParcelaCambio |  |  | Nao | Vence em X dias da chegada ao porto/aeroporto. | MetodoVencimento |
| Produto - bid-cambio | CambioBaseVencimentoDataEmbarque | DATA_EMBARQUE | ParcelaCambio \| ConfigParcelaCambio |  |  | Nao | Parcela vence em X dias contando da data de embarque. | MetodoVencimento |
| Produto - bid-cambio | CambioBaseVencimentoDefinidoManual | DATA_FIXA | ParcelaCambio \| ConfigParcelaCambio |  |  | Nao | Data específica definida manualmente. | MetodoVencimento |
| Produto - bid-cambio | CambioBaseVencimentoDespachoAduaneiro | DATA_DESEMBARACO | ParcelaCambio \| ConfigParcelaCambio |  |  | Nao | Vence em X dias do desembaraço aduaneiro. | MetodoVencimento |
| Produto - bid-cambio | CambioBaseVencimentoEntregaImportador | DATA_ENTREGA | ParcelaCambio \| ConfigParcelaCambio |  |  | Nao | Vence em X dias da entrega final ao importador. | MetodoVencimento |
| Produto - bid-cambio | CambioBaseVencimentoProntaOrigem | PRONTIDAO_CARGA | ParcelaCambio \| ConfigParcelaCambio |  |  | Nao | Vence quando carga estiver pronta na origem. | MetodoVencimento |
| Produto - bid-cambio | CambioBaseVencimentoRegistroDUIMP | DATA_REGISTRO_DI | ParcelaCambio \| ConfigParcelaCambio |  |  | Nao | Vence em X dias do registro da DI. | MetodoVencimento |
| Produto - bid-cambio | CambioBIDStatusAguardandoEnvio | PENDENTE | BidRequestCambio |  |  | Sim | BID aguardando envio. | StatusBidRequestCambio |
| Produto - bid-cambio | CambioBIDStatusEmAvaliacao | EM_ANALISE | BidResponseCambio |  |  | Nao | Proposta sendo avaliada. | StatusBidResponseCambio |
| Produto - bid-cambio | CambioBIDStatusEmPreparacao | VISUALIZADO | BidRequestCambio |  |  | Nao | Corretora abriu/viu o BID. | StatusBidRequestCambio |
| Produto - bid-cambio | CambioBIDStatusFalhaEnvio | ERRO_ENVIO | BidRequestCambio |  |  | Nao | Falha ao enviar o BID (email bounce, etc.). | StatusBidRequestCambio |
| Produto - bid-cambio | CambioBIDStatusMelhorAprovada | APROVADA | BidResponseCambio |  |  | Nao | Proposta escolhida e aprovada. | StatusBidResponseCambio |
| Produto - bid-cambio | CambioBIDStatusMelhorAvaliacao | MELHOR_AVALIACAO | BidResponseCambio |  |  | Nao | Badge — corretora com melhor avaliação global. | StatusBidResponseCambio |
| Produto - bid-cambio | CambioBIDStatusMelhorReprovada | REPROVADA | BidResponseCambio |  |  | Nao | Proposta rejeitada. | StatusBidResponseCambio |
| Produto - bid-cambio | CambioBIDStatusMelhorSpread | MELHOR_SPREAD | BidResponseCambio |  |  | Nao | Badge — proposta com menor spread. | StatusBidResponseCambio |
| Produto - bid-cambio | CambioBIDStatusMelhorTaxa | MELHOR_TAXA | BidResponseCambio |  |  | Nao | Badge — proposta com melhor taxa de câmbio. | StatusBidResponseCambio |
| Produto - bid-cambio | CambioBIDStatusRecebida | RECEBIDA | BidResponseCambio |  |  | Sim | Proposta da corretora recebida. | StatusBidResponseCambio |
| Produto - bid-cambio | CambioBIDStatusRecebida | RESPONDIDO | BidRequestCambio |  |  | Nao | Corretora enviou proposta. | StatusBidRequestCambio |
| Produto - bid-cambio | CambioBIDStatusSolicitado | ENVIADO | BidRequestCambio |  |  | Nao | BID enviado com sucesso para a corretora. | StatusBidRequestCambio |
| Produto - bid-cambio | CambioBIDStatusVencida | EXPIRADO | BidRequestCambio |  |  | Nao | BID expirou sem resposta. | StatusBidRequestCambio |
| Produto - bid-cambio | CambioCorretoraBloqueada | BLOQUEADA | Corretora |  |  | Nao | Corretora bloqueada permanentemente (ex: má avaliação). | StatusCorretora |
| Produto - bid-cambio | CambioCorretoraNaoRecebeBid | INATIVA | Corretora |  |  | Nao | Corretora pausada, não recebe novos BIDs. | StatusCorretora |
| Produto - bid-cambio | CambioCorretoraRecebeBid | ATIVA | Corretora |  |  | Sim | Corretora em uso, recebe BIDs normalmente. | StatusCorretora |
| Produto - bid-cambio | CambioCorretoraTipo | BANCO_CAMBIO | Corretora |  |  | Nao | Banco dedicado a operações de câmbio. | TipoCorretora |
| Produto - bid-cambio | CambioCorretoraTipoFintech | FINTECH | Corretora |  |  | Nao | Fintech com oferta de câmbio (ex: Wise, Remessa). | TipoCorretora |
| Produto - bid-cambio | CambioCotacaoCanalApi | PORTAL | BidRequestCambio |  |  | Nao | Cotação disparada via portal/API das corretoras. | CanalDisparoCambio |
| Produto - bid-cambio | CambioCotacaoCanalEmail | EMAIL | BidRequestCambio |  |  | Sim | Cotação enviada às corretoras por email. | CanalDisparoCambio |
| Produto - bid-cambio | CambioCotacaoStatusAguardandoEnvio | RASCUNHO | CotacaoCambio |  |  | Sim | Cotação em preparação, ainda não enviada. | StatusCotacaoCambio |
| Produto - bid-cambio | CambioCotacaoStatusCancelada | CANCELADA | CotacaoCambio |  |  | Nao | Cotação cancelada antes de fechar. | StatusCotacaoCambio |
| Produto - bid-cambio | CambioCotacaoStatusEmPreparacao | EM_COTACAO | CotacaoCambio |  |  | Nao | Corretoras estão preparando propostas. | StatusCotacaoCambio |
| Produto - bid-cambio | CambioCotacaoStatusSolicitado | ENVIADA_CORRETORAS | CotacaoCambio |  |  | Nao | Pedido enviado às corretoras para cotarem. | StatusCotacaoCambio |
| Produto - bid-cambio | CambioCotacaoStatusVencida | EXPIRADA | CotacaoCambio |  |  | Nao | Prazo de validade da cotação venceu. | StatusCotacaoCambio |
| Produto - bid-cambio | CambioFornecedorTipoBanco | BANCO_COMERCIAL | Corretora |  |  | Nao | Banco tradicional com área de câmbio. | TipoCorretora |
| Produto - bid-cambio | CambioFornecedorTipoCorretora | CORRETORA_CAMBIO | Corretora |  |  | Sim | Corretora especializada em câmbio. | TipoCorretora |
| Produto - bid-cambio | CambioLiquidacaoD0 | D0 | CotacaoCambio \| BidResponseCambio |  |  | Nao | Liquidação no mesmo dia da operação. | LiquidacaoCambio |
| Produto - bid-cambio | CambioLiquidacaoD1 | D1 | CotacaoCambio \| BidResponseCambio |  |  | Nao | Liquidação no dia útil seguinte. | LiquidacaoCambio |
| Produto - bid-cambio | CambioLiquidacaoD2uteis | D2 | CotacaoCambio \| BidResponseCambio |  |  | Sim | Liquidação em 2 dias úteis. | LiquidacaoCambio |
| Produto - bid-cambio | CambioModalidadeATermo | FUTURO | CotacaoCambio |  |  | Nao | Câmbio a termo (entrega em data futura pactuada). | ModalidadeCambio |
| Produto - bid-cambio | CambioModalidadeAVista | PRONTO | CotacaoCambio |  |  | Sim | Câmbio fechado à vista (entrega imediata). | ModalidadeCambio |
| Produto - bid-cambio | CambioMoedaDolarAmericano | USD | ParcelaCambio \| CotacaoCambio \| SavingCambio |  |  | Sim | Dólar americano. | MoedaCambio |
| Produto - bid-cambio | CambioMoedaEuro | EUR | ParcelaCambio \| CotacaoCambio \| SavingCambio |  |  | Nao | Euro. | MoedaCambio |
| Produto - bid-cambio | CambioMoedaFrancoSuico | CHF | ParcelaCambio \| CotacaoCambio \| SavingCambio |  |  | Nao | Franco suíço. | MoedaCambio |
| Produto - bid-cambio | CambioMoedaIeneJapones | JPY | ParcelaCambio \| CotacaoCambio \| SavingCambio |  |  | Nao | Iene japonês. | MoedaCambio |
| Produto - bid-cambio | CambioMoedaLibraEsterlina | GBP | ParcelaCambio \| CotacaoCambio \| SavingCambio |  |  | Nao | Libra esterlina. | MoedaCambio |
| Produto - bid-cambio | CambioMoedaRealBrasileiro | BRL | ParcelaCambio \| CotacaoCambio \| SavingCambio |  |  | Nao | Real brasileiro. | MoedaCambio |
| Produto - bid-cambio | CambioMoedaYuanChines | CNY | ParcelaCambio \| CotacaoCambio \| SavingCambio |  |  | Nao | Yuan chinês. | MoedaCambio |
| Produto - bid-cambio | CambioParcelaStatusAguardandoAcao | PENDENTE | ParcelaCambio |  |  | Sim | Parcela aguardando ação. | StatusParcela |
| Produto - bid-cambio | CambioParcelaStatusLiquidada | PAGO | ParcelaCambio |  |  | Nao | Parcela quitada. | StatusParcela |
| Produto - bid-cambio | CambioParcelaStatusProgramadaDataFutura | AGENDADO | ParcelaCambio |  |  | Nao | Parcela programada para pagamento em data futura. | StatusParcela |
| Produto - bid-cambio | CambioPropostaStatusAprovada | APROVADA | CotacaoCambio |  |  | Nao | Cotação aprovada — vai para fechamento. | StatusCotacaoCambio |
| Produto - bid-cambio | CambioPropostaStatusRecebida | AGUARDANDO_APROVACAO | CotacaoCambio |  |  | Nao | Propostas recebidas, aguardando decisão interna. | StatusCotacaoCambio |
| Produto - bid-cambio | CambioPropostaStatusReprovada | REPROVADA | CotacaoCambio |  |  | Nao | Cotação rejeitada internamente. | StatusCotacaoCambio |
| Produto - bid-cambio | CambioTipoOperacaoExportacao | EXPORTACAO | CotacaoCambio |  |  | Nao | Operação de câmbio para recebimento de exportação. | TipoOperacaoCambio |
| Produto - bid-cambio | CambioTipoOperacaoImportacao | IMPORTACAO | CotacaoCambio |  |  | Sim | Operação de câmbio para pagamento de importação. | TipoOperacaoCambio |
| Produto - bid-frete | BidFreteCargaModalidade | AEREO_GERAL | Cotacao \| TabelaPreco |  |  | Nao | Carga aérea em porão geral. | ModalidadeCarga |
| Produto - bid-frete | BidFreteIntBidEmPreparacao | VISUALIZADO | BidRequest |  |  | Nao | Fornecedor abriu o BID. | StatusBidRequest |
| Produto - bid-frete | BidFreteIntBidExpiradoSemResposta | EXPIRADO | BidRequest |  |  | Nao | BID expirou sem resposta. | StatusBidRequest |
| Produto - bid-frete | BidFreteIntBidFalhaEnvio | ERRO_ENVIO | BidRequest |  |  | Nao | Falha ao enviar o BID. | StatusBidRequest |
| Produto - bid-frete | BidFreteIntBidrecebido | RECEBIDA | BidResponse |  |  | Sim | Proposta do fornecedor recebida. | StatusBidResponse |
| Produto - bid-frete | BidFreteIntBidRecebido | RESPONDIDO | BidRequest |  |  | Nao | Fornecedor mandou proposta. | StatusBidRequest |
| Produto - bid-frete | BidFreteIntCaminhaoFracionado | RODOVIARIO_LTL | Cotacao \| TabelaPreco |  |  | Nao | Caminhão fracionado (Less than Truckload) — consolidado. | ModalidadeCarga |
| Produto - bid-frete | BidFreteIntCaminhaoFull | RODOVIARIO_FTL | Cotacao \| TabelaPreco |  |  | Nao | Caminhão fechado (Full Truckload) — ocupa veículo inteiro. | ModalidadeCarga |
| Produto - bid-frete | BidFreteIntContainerFcl | FCL | Cotacao \| TabelaPreco |  |  | Nao | Container cheio (Full Container Load) — carga ocupa container inteiro. | ModalidadeCarga |
| Produto - bid-frete | BidFreteIntContainerLcl | LCL | Cotacao \| TabelaPreco |  |  | Nao | Container compartilhado (Less than Container Load) — consolidado. | ModalidadeCarga |
| Produto - bid-frete | BidFreteIntCotacaoAguardandoDados | FALTA_INFORMACAO | Cotacao |  |  | Nao | Aguardando dados para continuar. | StatusCotacao |
| Produto - bid-frete | BidFreteIntCotacaoAguardandoEnvio | PENDENTE | BidRequest |  |  | Sim | BID aguardando envio. | StatusBidRequest |
| Produto - bid-frete | BidFreteIntCotacaoCanalEmail | EMAIL | BidRequest |  |  | Sim | Disparo por email. | CanalDisparo |
| Produto - bid-frete | BidFreteIntCotacaoCanalPortalweb | PORTAL | BidRequest |  |  | Nao | Disparo pelo portal web. | CanalDisparo |
| Produto - bid-frete | BidFreteIntCotacaoCanalWhatAPI | API | BidRequest |  |  | Nao | Disparo via integração direta por API. | CanalDisparo |
| Produto - bid-frete | BidFreteIntCotacaoCanalWhatsapp | WHATSAPP | BidRequest |  |  | Nao | Disparo pelo WhatsApp. | CanalDisparo |
| Produto - bid-frete | BidFreteIntCotacaoDadosVencidos | EXPIRADA | Cotacao |  |  | Nao | Prazo venceu sem conclusão. | StatusCotacao |
| Produto - bid-frete | BidFreteIntCotacaoEnviadoFornecedor | ENVIADO | BidRequest |  |  | Nao | BID enviado ao fornecedor. | StatusBidRequest |
| Produto - bid-frete | BidFreteIntCotacaoStatusCancelada | CANCELADA | Cotacao |  |  | Nao | Cotação cancelada antes de fechar. | StatusCotacao |
| Produto - bid-frete | BidFreteIntCotacaoStatusEmPreparacao | EM_COTACAO | Cotacao |  |  | Nao | Fornecedores preparando propostas. | StatusCotacao |
| Produto - bid-frete | BidFreteIntCotacaoStatusSolicitada | ENVIADA_FORNECEDORES | Cotacao |  |  | Nao | Cotação enviada aos fornecedores de frete. | StatusCotacao |
| Produto - bid-frete | BidFreteIntCotaçãoVisibildadeFornecedorPreferencia | DIRECIONADA | Cotacao |  |  | Sim | Cotação enviada apenas para fornecedores selecionados. | VisibilidadeCotacao |
| Produto - bid-frete | BidFreteIntCotaçãoVisibildadeTodosFornecedores | ABERTA | Cotacao |  |  | Nao | Cotação aberta para qualquer fornecedor do marketplace. | VisibilidadeCotacao |
| Produto - bid-frete | BidFreteIntIntegracaoApi | API_REST | ConnectorConfig |  |  | Nao | Integração via API REST (JSON). | TipoConector |
| Produto - bid-frete | BidFreteIntIntegracaoODataSap | ODATA | ConnectorConfig |  |  | Nao | Integração via protocolo OData (SAP). | TipoConector |
| Produto - bid-frete | BidFreteIntIntegracaoSoapXml | API_SOAP | ConnectorConfig |  |  | Nao | Integração via SOAP/XML. | TipoConector |
| Produto - bid-frete | BidFreteIntModalAereo | AEREO | Cotacao \| TabelaPreco |  |  | Nao | Transporte por avião. | ModalFrete |
| Produto - bid-frete | BidFreteIntModalMaritimo | MARITIMO | Cotacao \| TabelaPreco |  |  | Nao | Transporte por navio. | ModalFrete |
| Produto - bid-frete | BidFreteIntModalRodoviario | RODOVIARIO | Cotacao \| TabelaPreco |  |  | Nao | Transporte por caminhão. | ModalFrete |
| Produto - bid-frete | BidFreteIntPropostaAprovada | APROVADA | BidResponse |  |  | Nao | Proposta escolhida. | StatusBidResponse |
| Produto - bid-frete | BidFreteIntPropostaAprovadaAgente | AGENTE_CARGA | Fornecedor |  |  | Nao | Agente/forwarder consolidador de frete. | TipoFornecedor |
| Produto - bid-frete | BidFreteIntPropostaAprovadaArmador | ARMADOR | Fornecedor |  |  | Nao | Companhia marítima dona do navio. | TipoFornecedor |
| Produto - bid-frete | BidFreteIntPropostaAprovadaCiaArea | CIA_AEREA | Fornecedor |  |  | Nao | Companhia aérea cargueira. | TipoFornecedor |
| Produto - bid-frete | BidFreteIntPropostaAprovadaTransportadoraRodoviariaInternacional | TRANSPORTADORA | Fornecedor |  |  | Nao | Transportadora rodoviária. | TipoFornecedor |
| Produto - bid-frete | BidFreteIntPropostaStatusAprovada | APROVADA | Cotacao |  |  | Nao | Cotação aprovada. | StatusCotacao |
| Produto - bid-frete | BidFreteIntPropostaStatusEmAvaliacao | EM_ANALISE | BidResponse |  |  | Nao | Proposta sendo avaliada. | StatusBidResponse |
| Produto - bid-frete | BidFreteIntPropostaStatusMelhorAvaliacao | MELHOR_AVALIACAO | BidResponse |  |  | Nao | Badge — fornecedor com melhor avaliação. | StatusBidResponse |
| Produto - bid-frete | BidFreteIntPropostaStatusMelhorTransitTime | MELHOR_TRANSIT | BidResponse |  |  | Nao | Badge — melhor tempo de trânsito. | StatusBidResponse |
| Produto - bid-frete | BidFreteIntPropostaStatusMelhorValor | MELHOR_PRECO | BidResponse |  |  | Nao | Badge — proposta mais barata. | StatusBidResponse |
| Produto - bid-frete | BidFreteIntPropostaStatusRecebida | AGUARDANDO_APROVACAO | Cotacao |  |  | Nao | Propostas recebidas, aguardando decisão. | StatusCotacao |
| Produto - bid-frete | BidFreteIntPropostaStatusReprovada | REPROVADA | Cotacao |  |  | Nao | Cotação rejeitada. | StatusCotacao |
| Produto - bid-frete | BidFreteIntsemIntegracao | MANUAL | ConnectorConfig |  |  | Nao | Sem integração — dados inseridos manualmente. | TipoConector |
| Produto - bid-frete | BidFreteIntStatus | RASCUNHO | Cotacao |  |  | Sim | Cotação em preparação. | StatusCotacao |
| Produto - bid-frete | BidFreteIntStatusFornecedorAtivo | ATIVO | Fornecedor |  |  | Sim | Fornecedor em uso. | StatusFornecedor |
| Produto - bid-frete | BidFreteIntStatusFornecedorBloqueado | BLOQUEADO | Fornecedor |  |  | Nao | Fornecedor bloqueado (má performance ou exclusão comercial). | StatusFornecedor |
| Produto - bid-frete | BidFreteIntStatusFornecedorEmAprovacao | PENDENTE_APROVACAO | Fornecedor |  |  | Nao | Aguardando aprovação interna para virar ativo. | StatusFornecedor |
| Produto - bid-frete | BidFreteIntStatusFornecedorInativo | INATIVO | Fornecedor |  |  | Nao | Fornecedor pausado. | StatusFornecedor |
| Produto - bid-frete | BidFreteIntTipoOperacaoExportacao | EXPORTACAO | Cotacao |  |  | Nao | Frete para levar carga do Brasil. | TipoOperacao |
| Produto - bid-frete | BidFreteIntTipoOperacaoImportacao | IMPORTACAO | Cotacao |  |  | Nao | Frete para trazer carga ao Brasil. | TipoOperacao |
| Produto - bid-frete | BidFretePropostaStatus | REPROVADA | BidResponse |  |  | Nao | Proposta rejeitada. | StatusBidResponse |
| Produto - financeiro-comex | FinanceiroGrupoCustoImpostos | IMPOSTOS_FEDERAIS | FinanceiroLancamento \| FinanceiroCategorias |  |  | Nao | Despesa classificada como imposto federal (II, IPI, PIS, COFINS). | GrupoCusto |
| Produto - financeiro-comex | FinanceiroGrupoCustoOperacionais | CUSTO_OPERACIONAL | FinanceiroLancamento \| FinanceiroCategorias |  |  | Nao | Despesa classificada como custo operacional (frete, armazenagem, etc.). | GrupoCusto |
| Produto - financeiro-comex | FinanceiroLancamentoOrigemAnexoEmail | EMAIL | FinanceiroLancamento |  |  | Nao | Extraído de anexo de e-mail. | CanalEntradaFinanceiro |
| Produto - financeiro-comex | FinanceiroLancamentoOrigemDuimp | XML_DUIMP | FinanceiroLancamento |  |  | Nao | Lançamento importado do XML da DUIMP. | CanalEntradaFinanceiro |
| Produto - financeiro-comex | FinanceiroLancamentoOrigemExcelCsv | PLANILHA | FinanceiroLancamento |  |  | Nao | Importado de planilha Excel/CSV. | CanalEntradaFinanceiro |
| Produto - financeiro-comex | FinanceiroLancamentoOrigemManual | MANUAL | FinanceiroLancamento |  |  | Sim | Lançamento digitado à mão. | CanalEntradaFinanceiro |
| Produto - financeiro-comex | FinanceiroLancamentoOrigemPortalUnico | PORTAL_UNICO | FinanceiroLancamento |  |  | Nao | Extraído do Portal Único SISCOMEX. | CanalEntradaFinanceiro |
| Produto - financeiro-comex | FinanceiroLancamentoOrigemSmartRead | SMART_READ | FinanceiroLancamento |  |  | Nao | Lido automaticamente por OCR/IA de documento. | CanalEntradaFinanceiro |
| Produto - financeiro-comex | FinanceiroLancamentoTipoBoletoBancario | BOLETO | FinanceiroLancamento |  |  | Nao | Boleto bancário. | TipoDocumentoFinanceiro |
| Produto - financeiro-comex | FinanceiroLancamentoTipoDemonstrativo | DEMONSTRATIVO | FinanceiroLancamento |  |  | Nao | Demonstrativo de cálculo do fornecedor. | TipoDocumentoFinanceiro |
| Produto - financeiro-comex | FinanceiroLancamentoTipoInvoice | FATURA | FinanceiroLancamento |  |  | Nao | Fatura/invoice. | TipoDocumentoFinanceiro |
| Produto - financeiro-comex | FinanceiroLancamentoTipoInvoice | FATURAMENTO | FinanceiroLancamento |  |  | Nao | Documento de faturamento consolidado. | TipoDocumentoFinanceiro |
| Produto - financeiro-comex | FinanceiroLancamentoTipoNotaFiscal | NOTA_FISCAL | FinanceiroLancamento |  |  | Nao | Nota fiscal eletrônica. | TipoDocumentoFinanceiro |
| Produto - financeiro-comex | FinanceiroPagamentoStatus | AGENDADO | FinanceiroLancamento |  |  | Nao | Pagamento programado para data futura. | StatusPagamento |
| Produto - financeiro-comex | FinanceiroPagamentoStatus | PAGO | FinanceiroLancamento |  |  | Nao | Pagamento realizado. | StatusPagamento |
| Produto - financeiro-comex | FinanceiroPagamentoStatus | PENDENTE | FinanceiroLancamento |  |  | Sim | Pagamento aguardando ação. | StatusPagamento |
| Produto - financeiro-comex | FinanceiroTipoDocumentoAgenteCarga | AGENTE_DE_CARGA | FinanceiroLancamento |  |  | Nao | Agente/forwarder. | TipoFornecedorFinanceiro |
| Produto - financeiro-comex | FinanceiroTipoDocumentoArmador | ARMADOR | FinanceiroLancamento |  |  | Nao | Companhia marítima. | TipoFornecedorFinanceiro |
| Produto - financeiro-comex | FinanceiroTipoDocumentoArmazemAlfandegado | ARMAZEM_ALFANDEGADO | FinanceiroLancamento |  |  | Nao | Armazém dentro de recinto aduaneiro. | TipoFornecedorFinanceiro |
| Produto - financeiro-comex | FinanceiroTipoDocumentoArmazemGeral | ARMAZEM | FinanceiroLancamento |  |  | Nao | Armazém comum. | TipoFornecedorFinanceiro |
| Produto - financeiro-comex | FinanceiroTipoDocumentoCiaAerea | CIA_AEREA | FinanceiroLancamento |  |  | Nao | Companhia aérea. | TipoFornecedorFinanceiro |
| Produto - financeiro-comex | FinanceiroTipoDocumentoCorretoraCambio | CORRETORA_DE_CAMBIO | FinanceiroLancamento |  |  | Nao | Corretora de câmbio. | TipoFornecedorFinanceiro |
| Produto - financeiro-comex | FinanceiroTipoDocumentoDespachanteAduaneiro | DESPACHANTE | FinanceiroLancamento |  |  | Nao | Despachante aduaneiro. | TipoFornecedorFinanceiro |
| Produto - financeiro-comex | FinanceiroTipoDocumentoExportador | EXPORTADOR | FinanceiroLancamento |  |  | Nao | Exportador estrangeiro. | TipoFornecedorFinanceiro |
| Produto - financeiro-comex | FinanceiroTipoDocumentoFabricante | FABRICANTE | FinanceiroLancamento |  |  | Nao | Fabricante da mercadoria. | TipoFornecedorFinanceiro |
| Produto - financeiro-comex | FinanceiroTipoDocumentoImpostos | RECEITA_FEDERAL | FinanceiroLancamento |  |  | Nao | Receita Federal (impostos/taxas). | TipoFornecedorFinanceiro |
| Produto - financeiro-comex | FinanceiroTipoDocumentoOutros | OUTRO | FinanceiroLancamento |  |  | Nao | Outros tipos de documento. | TipoDocumentoFinanceiro |
| Produto - financeiro-comex | FinanceiroTipoDocumentoOutros | OUTRO | FinanceiroLancamento |  |  | Nao | Outros tipos. | TipoFornecedorFinanceiro |
| Produto - financeiro-comex | FinanceiroTipoDocumentoSeguradoraInternacional | SEGURADORA | FinanceiroLancamento |  |  | Nao | Empresa seguradora. | TipoFornecedorFinanceiro |
| Produto - financeiro-comex | FinanceiroTipoDocumentoTrading | TRADING | FinanceiroLancamento |  |  | Nao | Trading company intermediária. | TipoFornecedorFinanceiro |
| Produto - financeiro-comex | FinanceiroTipoDocumentoTransportadoraRodoviariaNacional | TRANSPORTADORA_RODOVIARIA | FinanceiroLancamento |  |  | Nao | Transportadora rodoviária. | TipoFornecedorFinanceiro |
| Produto - financeiro-comex | FinanceiroVinculoExportacao | EXPORTACAO | FinanceiroProcesso \| FinanceiroCategorias |  |  | Nao | Lançamento financeiro vinculado à exportação. | TipoOperacaoFinanceiro |
| Produto - financeiro-comex | FinanceiroVinculoImportacao | IMPORTACAO | FinanceiroProcesso \| FinanceiroCategorias |  |  | Nao | Lançamento financeiro vinculado à importação. | TipoOperacaoFinanceiro |
| Produto - financeiro-comex | VEM DO CADASTRO | ARS | FinanceiroLancamento \| FinanceiroNumerarioDespesa |  |  | Nao | Peso argentino. | MoedaFinanceiro |
| Produto - financeiro-comex | VEM DO CADASTRO | BRL | FinanceiroLancamento \| FinanceiroNumerarioDespesa |  |  | Nao | Real brasileiro. | MoedaFinanceiro |
| Produto - financeiro-comex | VEM DO CADASTRO | CHF | FinanceiroLancamento \| FinanceiroNumerarioDespesa |  |  | Nao | Franco suíço. | MoedaFinanceiro |
| Produto - financeiro-comex | VEM DO CADASTRO | CNY | FinanceiroLancamento \| FinanceiroNumerarioDespesa |  |  | Nao | Yuan chinês. | MoedaFinanceiro |
| Produto - financeiro-comex | VEM DO CADASTRO | EUR | FinanceiroLancamento \| FinanceiroNumerarioDespesa |  |  | Nao | Euro. | MoedaFinanceiro |
| Produto - financeiro-comex | VEM DO CADASTRO | GBP | FinanceiroLancamento \| FinanceiroNumerarioDespesa |  |  | Nao | Libra esterlina. | MoedaFinanceiro |
| Produto - financeiro-comex | VEM DO CADASTRO | USD | FinanceiroLancamento \| FinanceiroNumerarioDespesa |  |  | Nao | Dólar americano. | MoedaFinanceiro |
| Produto - financeiro-comex | VEM DO CADASTRO | UYU | FinanceiroLancamento \| FinanceiroNumerarioDespesa |  |  | Nao | Peso uruguaio. | MoedaFinanceiro |
| Produto - Helpdesk (template) | HelpdeskTicketPrioridadeAlta | HIGH | HelpdeskSLA \| HelpdeskTicket |  |  | Nao | Prioridade alta — atender com rapidez. | HelpdeskTicketPriority |
| Produto - Helpdesk (template) | HelpdeskTicketPrioridadeBaixa | LOW | HelpdeskSLA \| HelpdeskTicket |  |  | Nao | Prioridade baixa — pode aguardar. | HelpdeskTicketPriority |
| Produto - Helpdesk (template) | HelpdeskTicketPrioridadePadrao | MEDIUM | HelpdeskSLA \| HelpdeskTicket |  |  | Sim | Prioridade padrão. | HelpdeskTicketPriority |
| Produto - Helpdesk (template) | HelpdeskTicketPrioridadeUrgente | URGENT | HelpdeskSLA \| HelpdeskTicket |  |  | Nao | Urgente — bloqueando operação do cliente. | HelpdeskTicketPriority |
| Produto - Helpdesk (template) | HelpdeskTicketStatusAguardandoCliente | WAITING_ON_CUSTOMER | HelpdeskTicket |  |  | Nao | Aguardando retorno do cliente para continuar. | HelpdeskTicketStatus |
| Produto - Helpdesk (template) | HelpdeskTicketStatusEmAndamento | IN_PROGRESS | HelpdeskTicket |  |  | Nao | Ticket sendo tratado por um agente. | HelpdeskTicketStatus |
| Produto - Helpdesk (template) | HelpdeskTicketStatusFechado | CLOSED | HelpdeskTicket |  |  | Nao | Ticket fechado definitivamente. | HelpdeskTicketStatus |
| Produto - Helpdesk (template) | HelpdeskTicketStatusNaoAtribuido | OPEN | HelpdeskTicket |  |  | Sim | Ticket recém-aberto, ainda não foi atribuído. | HelpdeskTicketStatus |
| Produto - Helpdesk (template) | HelpdeskTicketStatusResolvido | RESOLVED | HelpdeskTicket |  |  | Nao | Problema resolvido, aguardando confirmação. | HelpdeskTicketStatus |
| Produto - nf-importacao | NFImportacaoEmitidaCancelada | cancelada | NfImportacao |  |  | Nao | NF cancelada. | StatusNf |
| Produto - nf-importacao | NfImportacaoMetodoRateioFormulaCustomizada | CUSTOMIZADO | NfImportacaoDespesa \| NfImportacaoRateio \| DespesaCatalogo \| DespesaTemplateItem |  |  | Nao | Fórmula customizada pelo tenant. | MetodoRateio |
| Produto - nf-importacao | NfImportacaoMetodoRateioII | VALOR_II | NfImportacaoDespesa \| NfImportacaoRateio \| DespesaCatalogo \| DespesaTemplateItem |  |  | Nao | Rateia proporcional ao valor do II pago. | MetodoRateio |
| Produto - nf-importacao | NfImportacaoMetodoRateioItemEscolhodi | MANUAL | NfImportacaoDespesa \| NfImportacaoRateio \| DespesaCatalogo \| DespesaTemplateItem |  |  | Nao | Rateio definido item a item pelo usuário. | MetodoRateio |
| Produto - nf-importacao | NfImportacaoMetodoRateioPesoBruto | PESO_BRUTO | NfImportacaoDespesa \| NfImportacaoRateio \| DespesaCatalogo \| DespesaTemplateItem |  |  | Nao | Rateia proporcional ao peso bruto. | MetodoRateio |
| Produto - nf-importacao | NfImportacaoMetodoRateioPesoLiquido | PESO_LIQUIDO | NfImportacaoDespesa \| NfImportacaoRateio \| DespesaCatalogo \| DespesaTemplateItem |  |  | Nao | Rateia despesa proporcional ao peso líquido dos itens. | MetodoRateio |
| Produto - nf-importacao | NfImportacaoMetodoRateioQuantidade | QUANTIDADE | NfImportacaoDespesa \| NfImportacaoRateio \| DespesaCatalogo \| DespesaTemplateItem |  |  | Nao | Rateia proporcional à quantidade. | MetodoRateio |
| Produto - nf-importacao | NfImportacaoMetodoRateioTodosItens | IGUALITARIO | NfImportacaoDespesa \| NfImportacaoRateio \| DespesaCatalogo \| DespesaTemplateItem |  |  | Nao | Rateia em partes iguais entre todos os itens. | MetodoRateio |
| Produto - nf-importacao | NfImportacaoMetodoRateioValorCif | VALOR_CIF | NfImportacaoDespesa \| NfImportacaoRateio \| DespesaCatalogo \| DespesaTemplateItem |  |  | Sim | Rateia proporcional ao valor CIF de cada item. | MetodoRateio |
| Produto - nf-importacao | NfImportacaoMetodoRateioValorFob | VALOR_FOB | NfImportacaoDespesa \| NfImportacaoRateio \| DespesaCatalogo \| DespesaTemplateItem |  |  | Nao | Rateia proporcional ao valor FOB. | MetodoRateio |
| Produto - nf-importacao | NfImportacaoOrigemDespesaIA | SMART_READ | NfImportacaoDespesa |  |  | Nao | Despesa extraída por IA de documento. | OrigemDespesa |
| Produto - nf-importacao | NfImportacaoOrigemDespesaManual | MANUAL | NfImportacaoDespesa |  |  | Sim | Despesa criada manualmente. | OrigemDespesa |
| Produto - nf-importacao | NfImportacaoOrigemDespesaPlanilha | PLANILHA | NfImportacaoDespesa |  |  | Nao | Despesa importada de planilha. | OrigemDespesa |
| Produto - nf-importacao | NfImportacaoOrigemDespesaTemplate | TEMPLATE | NfImportacaoDespesa |  |  | Nao | Despesa vinda de um template aplicado. | OrigemDespesa |
| Produto - nf-importacao | NFImportacaoStatusEmitida | pronta | NfImportacao |  |  | Nao | NF completa, pronta para exportação/ERP. | StatusNf |
| Produto - nf-importacao | NFImportacaoStatusEmitidaIntegrada | exportada | NfImportacao |  |  | Nao | NF já exportada para o ERP do cliente. | StatusNf |
| Produto - nf-importacao | NFImportacaoStatusRascunhoPreenchida | em_composicao | NfImportacao |  |  | Nao | NF sendo montada com itens e despesas. | StatusNf |
| Produto - nf-importacao | NFImportacaoStatusRascunhoVazia | rascunho | NfImportacao |  |  | Sim | NF em rascunho, sem itens ainda. | StatusNf |
| Produto - nf-importacao | NfImportacaoTipoAlinhamentoCentralizado | CENTRO | ExportLayoutCampo |  |  | Nao | Alinhamento centralizado. | Alinhamento |
| Produto - nf-importacao | NfImportacaoTipoAlinhamentoDireita | DIREITA | ExportLayoutCampo |  |  | Nao | Alinhamento à direita (padrão para números). | Alinhamento |
| Produto - nf-importacao | NfImportacaoTipoAlinhamentoEsquerda | ESQUERDA | ExportLayoutCampo |  |  | Sim | Alinhamento à esquerda. | Alinhamento |
| Produto - nf-importacao | NfImportacaoTipoCanalEntradaErp | ERP | NfImportacao |  |  | Nao | Puxada do ERP do cliente. | CanalEntrada |
| Produto - nf-importacao | NfImportacaoTipoCanalEntradaManual | MANUAL | NfImportacao |  |  | Sim | NF digitada à mão. | CanalEntrada |
| Produto - nf-importacao | NfImportacaoTipoCanalEntradaPortalUnico | PORTAL_UNICO | NfImportacao |  |  | Nao | Importada do Portal Único SISCOMEX. | CanalEntrada |
| Produto - nf-importacao | NfImportacaoTipoCanalEntradaProcesso | PROCESSO | NfImportacao |  |  | Nao | Criada a partir de um processo existente. | CanalEntrada |
| Produto - nf-importacao | NfImportacaoTipoCanalEntradaSmartRead | SMART_READ | NfImportacao |  |  | Nao | Lida por IA/OCR. | CanalEntrada |
| Produto - nf-importacao | NfImportacaoTipoCanalEntradaXlm | XML | NfImportacao |  |  | Nao | Importada de arquivo XML. | CanalEntrada |
| Produto - nf-importacao | NfImportacaoTipoDadoData | DATA | ExportLayoutCampo |  |  | Nao | Coluna do tipo data. | TipoDado |
| Produto - nf-importacao | NfImportacaoTipoDadoDecimal | DECIMAL | ExportLayoutCampo |  |  | Nao | Coluna do tipo decimal. | TipoDado |
| Produto - nf-importacao | NfImportacaoTipoDadoNumeroInteiro | NUMERO | ExportLayoutCampo |  |  | Nao | Coluna do tipo número inteiro. | TipoDado |
| Produto - nf-importacao | NfImportacaoTipoDadoTexto | TEXTO | ExportLayoutCampo |  |  | Sim | Coluna do tipo texto. | TipoDado |
| Produto - nf-importacao | NfImportacaoTipoFormatoCsv | CSV | NfImportacao \| ExportLayout |  |  | Nao | Exporta para CSV. | FormatoExport |
| Produto - nf-importacao | NfImportacaoTipoFormatoJson | JSON | NfImportacao \| ExportLayout |  |  | Nao | Exporta para JSON. | FormatoExport |
| Produto - nf-importacao | NfImportacaoTipoFormatoPdf | PDF | NfImportacao \| ExportLayout |  |  | Nao | Exporta para PDF. | FormatoExport |
| Produto - nf-importacao | NfImportacaoTipoFormatoTextoPuro | TXT | NfImportacao \| ExportLayout |  |  | Nao | Exporta para texto puro. | FormatoExport |
| Produto - nf-importacao | NfImportacaoTipoFormatoXlsx | EXCEL | NfImportacao \| ExportLayout |  |  | Nao | Exporta para XLSX. | FormatoExport |
| Produto - nf-importacao | NfImportacaoTipoFormatoXml | XML | NfImportacao \| ExportLayout |  |  | Nao | Exporta para arquivo XML. | FormatoExport |
| Produto - pedido | PedidoIncotermCfr | CFR |  |  |  | Nao | CFR (Cost and Freight) — exportador paga frete ao porto de destino, sem seguro. | IncotermPedido |
| Produto - pedido | PedidoIncotermCif | CIF |  |  |  | Nao | CIF (Cost, Insurance, Freight) — exportador paga frete e seguro até o porto de destino. | IncotermPedido |
| Produto - pedido | PedidoIncotermCip | CIP |  |  |  | Nao | CIP (Carriage and Insurance Paid) — como CPT, mas com seguro incluído. | IncotermPedido |
| Produto - pedido | PedidoIncotermCpt | CPT |  |  |  | Nao | CPT (Carriage Paid To) — exportador paga transporte até local nomeado, sem seguro. | IncotermPedido |
| Produto - pedido | PedidoIncotermDap | DAP |  |  |  | Nao | DAP (Delivered At Place) — exportador entrega no local de destino (sem impostos). | IncotermPedido |
| Produto - pedido | PedidoIncotermDdp | DDP |  |  |  | Nao | DDP (Delivered Duty Paid) — exportador entrega com impostos pagos no destino. | IncotermPedido |
| Produto - pedido | PedidoIncotermDpu | DPU |  |  |  | Nao | DPU (Delivered at Place Unloaded) — exportador entrega descarregado no destino. | IncotermPedido |
| Produto - pedido | PedidoIncotermExw | EXW |  |  |  | Nao | EXW (Ex Works) — comprador retira na fábrica/armazém do exportador. | IncotermPedido |
| Produto - pedido | PedidoIncotermFas | FAS |  |  |  | Nao | FAS (Free Alongside Ship) — exportador entrega ao lado do navio no porto. | IncotermPedido |
| Produto - pedido | PedidoIncotermFca | FCA |  |  |  | Nao | FCA (Free Carrier) — exportador entrega ao transportador nomeado pelo comprador. | IncotermPedido |
| Produto - pedido | PedidoIncotermFob | FOB |  |  |  | Nao | FOB (Free On Board) — exportador entrega a bordo no porto de origem. | IncotermPedido |
| Produto - pedido | PedidoMoedaDolarAmericano | USD |  |  |  | Nao | Pedido negociado em dólar americano. | MoedaPedido |
| Produto - pedido | PedidoMoedaEuro | EUR |  |  |  | Nao | Pedido em euro. | MoedaPedido |
| Produto - pedido | PedidoMoedaIeneJapones | JPY |  |  |  | Nao | Pedido em iene. | MoedaPedido |
| Produto - pedido | PedidoMoedaLibraEsterlina | GBP |  |  |  | Nao | Pedido em libra. | MoedaPedido |
| Produto - pedido | PedidoMoedaRealBrasileiro | BRL |  |  |  | Nao | Pedido em real (uso raro em comex). | MoedaPedido |
| Produto - pedido | PedidoMoedaYuanChines | CNY |  |  |  | Nao | Pedido em yuan chinês. | MoedaPedido |
| Produto - pedido | PedidoStatusAprovadoImportador | aprovado |  |  |  | Nao | Pedido aprovado pelo importador. | StatusPedido |
| Produto - pedido | PedidoStatusCancelado | cancelado |  |  |  | Nao | Pedido cancelado. | StatusPedido |
| Produto - pedido | PedidoStatusConsolidado | consolidado |  |  |  | Nao | Pedido consolidado em um processo/embarque. | StatusPedido |
| Produto - pedido | PedidoStatusCriado | aberto |  |  |  | Nao | Pedido criado e ativo, em início de operação. | StatusPedido |
| Produto - pedido | PedidoStatusEmProducao | em_andamento |  |  |  | Nao | Pedido em processamento/produção no fornecedor. | StatusPedido |
| Produto - pedido | PedidoStatusItenTransferido | transferencia |  |  |  | Nao | Itens sendo transferidos entre pedidos (split/merge). | StatusPedido |
| Produto - pedido | PedidoStatusRascunho | draft |  |  |  | Nao | Pedido em rascunho. | StatusPedido |
| Produto - pedido | PedidoTipoOperacaoExportacao | exportacao | Cotacao |  |  | Nao | Pedido de exportação (venda internacional). | TipoOperacao |
| Produto - pedido | PedidoTipoOperacaoImportacao | importacao | Cotacao |  |  | Nao | Pedido de importação (compra internacional). | TipoOperacao |
| Produto - pedido | PedidoUnidadeComercializadaDuzia | DUZIA |  |  |  | Nao | Dúzia (12 unidades). | UnidadeComercializada |
| Produto - pedido | PedidoUnidadeComercializadaJogoKit | JOGO |  |  |  | Nao | Jogo/kit. | UnidadeComercializada |
| Produto - pedido | PedidoUnidadeComercializadaLitro | LT |  |  |  | Nao | Litro. | UnidadeComercializada |
| Produto - pedido | PedidoUnidadeComercializadaMetroCubico | M3 |  |  |  | Nao | Metro cúbico. | UnidadeComercializada |
| Produto - pedido | PedidoUnidadeComercializadaMetroLinear | M |  |  |  | Nao | Metro linear. | UnidadeComercializada |
| Produto - pedido | PedidoUnidadeComercializadaMetroQuadrado | M2 |  |  |  | Nao | Metro quadrado. | UnidadeComercializada |
| Produto - pedido | PedidoUnidadeComercializadaPar | PARES |  |  |  | Nao | Par (ex: calçados). | UnidadeComercializada |
| Produto - pedido | PedidoUnidadeComercializadaQuilograma | KG |  |  |  | Nao | Quilograma. | UnidadeComercializada |
| Produto - pedido | PedidoUnidadeComercializadaTonelada | TON |  |  |  | Nao | Tonelada. | UnidadeComercializada |
| Produto - pedido | PedidoUnidadeComercializadaUnidade | UNID |  |  |  | Nao | Unidade (peça). | UnidadeComercializada |
| Produto - simula-custo | SimuaCustoTipoCobrancaPorAwb | AWB | TaxaEstimativa |  |  | Nao | Cobrança por AWB (conhecimento aéreo). | CobrancaTipo |
| Produto - simula-custo | SimuaCustoTipoCobrancaPorCaixa | CAIXA | TaxaEstimativa |  |  | Nao | Cobrança por caixa. | CobrancaTipo |
| Produto - simula-custo | SimuaCustoTipoCobrancaPorContainer | CONTAINER | TaxaEstimativa |  |  | Nao | Cobrança por container. | CobrancaTipo |
| Produto - simula-custo | SimuaCustoTipoCobrancaPorCrt | CRT | TaxaEstimativa |  |  | Nao | Cobrança por CRT (conhecimento rodoviário). | CobrancaTipo |
| Produto - simula-custo | SimuaCustoTipoCobrancaporMetroCubico | M3 | TaxaEstimativa |  |  | Nao | Cobrança por metro cúbico. | CobrancaTipo |
| Produto - simula-custo | SimuaCustoTipoCobrancaPorProcesso | PROCESSO | TaxaEstimativa |  |  | Sim | Cobrança por processo. | CobrancaTipo |
| Produto - simula-custo | SimuaCustoTipoCobrancaPorQuilo | KGS | TaxaEstimativa |  |  | Nao | Cobrança por quilo. | CobrancaTipo |
| Produto - simula-custo | SimuaCustoTipoCobrancaPorTonelada | TON | TaxaEstimativa |  |  | Nao | Cobrança por tonelada. | CobrancaTipo |
| Produto - simula-custo | SimuaCustoTipoCobrancPorBl | BL | TaxaEstimativa |  |  | Nao | Cobrança por Bill of Lading. | CobrancaTipo |
| Produto - simula-custo | SimuaCustoTipoDocumentoInvoice | INVOICE | DocumentoEstimativa |  |  | Nao | Commercial invoice (fatura comercial). | DocumentoTipo |
| Produto - simula-custo | SimuaCustoTipoDocumentoOutrosDocumentos | OUTRO | DocumentoEstimativa |  |  | Nao | Outros documentos. | DocumentoTipo |
| Produto - simula-custo | SimuaCustoTipoDocumentoPedidoCompra | PEDIDO_COMPRA | DocumentoEstimativa |  |  | Nao | Pedido de compra (buyer side). | DocumentoTipo |
| Produto - simula-custo | SimuaCustoTipoDocumentoPedidoVenda | PEDIDO_VENDA | DocumentoEstimativa |  |  | Nao | Pedido de venda (seller side). | DocumentoTipo |
| Produto - simula-custo | SimuaCustoTipoDocumentoProforma | PROFORMA | DocumentoEstimativa |  |  | Nao | Proforma invoice (pré-fatura). | DocumentoTipo |
| Produto - simula-custo | SimuaCustoTipoProdutoCOFINS | COFINS | TributoEstimativa |  |  | Nao | COFINS Importação. | TributoTipo |
| Produto - simula-custo | SimuaCustoTipoProdutoICMS | ICMS | TributoEstimativa |  |  | Nao | ICMS Importação (estadual). | TributoTipo |
| Produto - simula-custo | SimuaCustoTipoProdutoII | II | TributoEstimativa |  |  | Nao | Imposto de Importação (II). | TributoTipo |
| Produto - simula-custo | SimuaCustoTipoProdutoIPI | IPI | TributoEstimativa |  |  | Nao | Imposto sobre Produtos Industrializados (IPI). | TributoTipo |
| Produto - simula-custo | SimuaCustoTipoProdutoPIS | PIS | TributoEstimativa |  |  | Nao | PIS Importação. | TributoTipo |
| Produto - simula-custo | SimulaCustoDetalheOperacaoComercialExportadora | COMERCIAL_EXPORTADORA | Estimativa |  |  | Nao | Operação via comercial exportadora. | TipoOperacaoDetalhe |
| Produto - simula-custo | SimulaCustoDetalheOperacaoContaeOrdem | CONTA_ORDEM | Estimativa |  |  | Nao | Importação por conta e ordem (trading compra para terceiro). | TipoOperacaoDetalhe |
| Produto - simula-custo | SimulaCustoDetalheOperacaoDireta | DIRETA | Estimativa |  |  | Sim | Importação direta pelo importador. | TipoOperacaoDetalhe |
| Produto - simula-custo | SimulaCustoDetalheOperacaoEncomenda | ENCOMENDA | Estimativa |  |  | Nao | Importação por encomenda (trading pré-vende para importador). | TipoOperacaoDetalhe |
| Produto - simula-custo | SimulaCustoEstimativaStatusArquivada | ARQUIVADA | Estimativa |  |  | Nao | Estimativa arquivada (não mais em uso). | EstimativaStatus |
| Produto - simula-custo | SimulaCustoEstimativaStatusEmAndamento | EM_CRIACAO | Estimativa |  |  | Sim | Estimativa sendo preenchida. | EstimativaStatus |
| Produto - simula-custo | SimulaCustoEstimativaStatusFinalizada | CRIADA | Estimativa |  |  | Nao | Estimativa finalizada e válida. | EstimativaStatus |
| Produto - simula-custo | SimulaCustoTipoOperacaoExportacao | EXPORTACAO | Estimativa |  |  | Nao | Simulação de custo de exportação. | OperacaoTipo |
| Produto - simula-custo | SimulaCustoTipoOperacaoImportacao | IMPORTACAO | Estimativa |  |  | Sim | Simulação de custo de importação. | OperacaoTipo |
| Produto - simula-custo | SimulaCustoTipoTaxaCollect | DESTINO | TaxaEstimativa |  |  | Nao | Taxa cobrada no destino (Brasil). | TaxaTipo |
| Produto - simula-custo | SimulaCustoTipoTaxaPrepaid | ORIGEM | TaxaEstimativa |  |  | Nao | Taxa cobrada na origem (país de embarque). | TaxaTipo |
| Tenant | AcaoExecutadaPor | USER | HistoricoLog \| AlertRule \| AlertEvent |  |  | Nao | Ação executada por um usuário humano. | TipoAtor |
| Tenant | AcaoExecutadaPorCron | JOB | HistoricoLog \| AlertRule \| AlertEvent |  |  | Nao | Ação automática de cron/job agendado. | TipoAtor |
| Tenant | AcaoExecutadaPorErpWebhok | INTEGRATION | HistoricoLog \| AlertRule \| AlertEvent |  |  | Nao | Ação vinda de integração externa (ERP, webhook). | TipoAtor |
| Tenant | AcaoExecutadaPorGabi | AI | HistoricoLog \| AlertRule \| AlertEvent |  |  | Nao | Ação executada pela Gabi (LLM). | TipoAtor |
| Tenant | AcaoExecutadaviaToken | API | HistoricoLog \| AlertRule \| AlertEvent |  |  | Nao | Ação vinda de chamada externa via token de API. | TipoAtor |
| Tenant | AlertaStatusAnalisadoClassificado | REVIEWED | AlertEvent |  |  | Nao | Alerta analisado e classificado. | StatusAlerta |
| Tenant | AlertaStatusEmAnalise | PENDING | AlertEvent |  |  | Sim | Alerta recém-disparado, aguardando análise. | StatusAlerta |
| Tenant | AlertaStatusTimeSeguranca | ESCALATED | AlertEvent |  |  | Nao | Alerta escalado para time de segurança/admin. | StatusAlerta |
| Tenant | DashboardGraficoArea | AREA | DashboardCriar |  |  | Nao | Gráfico de área (linhas preenchidas). | TipoGrafico |
| Tenant | DashboardGraficoBarrasHorizontais | BAR_HORIZONTAL | DashboardCriar |  |  | Nao | Gráfico de barras horizontais. | TipoGrafico |
| Tenant | DashboardGraficoBarrasVerticais | BAR | DashboardCriar |  |  | Nao | Gráfico de barras verticais. | TipoGrafico |
| Tenant | DashboardGraficoFrequencia | HISTOGRAM | DashboardCriar |  |  | Nao | Histograma (distribuição de frequência). | TipoGrafico |
| Tenant | DashboardGraficoFunil | FUNNEL | DashboardCriar |  |  | Nao | Funil (etapas de conversão). | TipoGrafico |
| Tenant | DashboardGraficoIndicadorChave | KPI_CARD | DashboardCriar |  |  | Sim | Card numérico com um indicador-chave (ex: "R$ 1.2M"). | TipoGrafico |
| Tenant | DashboardGraficoLinhas | LINE | DashboardCriar |  |  | Nao | Gráfico de linhas (evolução temporal). | TipoGrafico |
| Tenant | DashboardGraficoMapa | MAP | DashboardCriar |  |  | Nao | Mapa geográfico com marcadores. | TipoGrafico |
| Tenant | DashboardGraficoRosca | DONUT | DashboardCriar |  |  | Nao | Gráfico de rosca (distribuição percentual). | TipoGrafico |
| Tenant | DashboardGraficoTabela | TABLE | DashboardCriar |  |  | Nao | Tabela de dados. | TipoGrafico |
| Tenant | DashboardGraficoVelocimetro | GAUGE | DashboardCriar |  |  | Nao | Medidor tipo velocímetro (progresso até uma meta). | TipoGrafico |
| Tenant | DashboardModoCrossProdutoGravity | GENERAL | DashboardConfiguracao |  |  | Nao | Dashboard consolidado com dados cross-produto. | ModoDashboard |
| Tenant | DashboardModoProdutoGravity | PRODUCT | DashboardConfiguracao |  |  | Sim | Dashboard focado em dados de um produto específico. | ModoDashboard |
| Tenant | DashboardWidgetCustomizado | CUSTOM | DashboardCriar |  |  | Nao | Widget customizado criado pelo usuário. | TipoWidget |
| Tenant | DashboardWidgetGeradoAlimentadoIA | GABI | DashboardCriar |  |  | Nao | Widget gerado/alimentado pela IA Gabi. | TipoWidget |
| Tenant | DashboardWidgetPreConfigurado | CATALOG | DashboardCriar |  |  | Sim | Widget do catálogo pré-configurado do Gravity. | TipoWidget |
| Tenant | EmailFilaPrioridadeAlta | ALTA | EmailFilaEnvio |  |  | Nao | Prioridade elevada — processa na frente dos normais. | FilaEmailPrioridade |
| Tenant | EmailFilaPrioridadeBaixa | BAIXA | EmailFilaEnvio |  |  | Nao | Email de baixa prioridade (ex: newsletter) — processa depois. | FilaEmailPrioridade |
| Tenant | EmailFilaPrioridadePadrao | NORMAL | EmailFilaEnvio |  |  | Sim | Prioridade padrão da fila. | FilaEmailPrioridade |
| Tenant | EmailFilaPrioridadeUrgente | URGENTE | EmailFilaEnvio |  |  | Nao | Processa imediatamente, à frente de todos. | FilaEmailPrioridade |
| Tenant | EmailSentimentoCritico | MUITO_NEGATIVO | EmailAssuntosParticipantes |  |  | Nao | Tom muito crítico/raivoso — atenção urgente. | NivelSentimentoEmail |
| Tenant | EmailSentimentoInformativo | NEUTRO | EmailAssuntosParticipantes |  |  | Sim | Tom neutro/informativo. | NivelSentimentoEmail |
| Tenant | EmailSentimentoInstatisfeito | NEGATIVO | EmailAssuntosParticipantes |  |  | Nao | Tom com sinais de reclamação/insatisfação. | NivelSentimentoEmail |
| Tenant | EmailSentimentoPositivo | POSITIVO | EmailAssuntosParticipantes |  |  | Nao | Tom geralmente positivo. | NivelSentimentoEmail |
| Tenant | EmailSentimentoSatisfeito | MUITO_POSITIVO | EmailAssuntosParticipantes |  |  | Nao | Análise da Gabi detectou tom muito satisfeito/elogioso. | NivelSentimentoEmail |
| Tenant | EmailStatusAguardando | PENDENTE | EmailRegistroEnvio \| EmailFilaEnvio |  |  | Sim | Email aguardando ser processado pela fila. | StatusEmail |
| Tenant | EmailStatusCanceladoManualmente | CANCELADO | EmailRegistroEnvio \| EmailFilaEnvio |  |  | Nao | Envio cancelado manualmente antes de sair. | StatusEmail |
| Tenant | EmailStatusEntregue | ENVIADO | EmailRegistroEnvio \| EmailFilaEnvio |  |  | Nao | Email entregue com sucesso ao provedor. | StatusEmail |
| Tenant | EmailStatusEnviadoChamadoResend | PROCESSANDO | EmailRegistroEnvio \| EmailFilaEnvio |  |  | Nao | Email sendo enviado agora mesmo (Resend chamado). | StatusEmail |
| Tenant | EmailStatusEnviadoSaida | OUTBOUND | EmailMensagem |  |  | Sim | Email enviado (saiu do tenant). | DirecaoEmail |
| Tenant | EmailStatusFalhaEnvio | FALHOU | EmailRegistroEnvio \| EmailFilaEnvio |  |  | Nao | Envio falhou após todas as tentativas. | StatusEmail |
| Tenant | EmailStatusRecebido | INBOUND | EmailMensagem |  |  | Nao | Email recebido (chegou no tenant). | DirecaoEmail |
| Tenant | EmailThreadAtiva | ABERTA | EmailAssuntosParticipantes |  |  | Sim | Thread ativa, aguardando continuidade da conversa. | StatusThreadEmail |
| Tenant | EmailThreadConcluida | RESOLVIDA | EmailAssuntosParticipantes |  |  | Nao | Thread marcada como concluída/resolvida. | StatusThreadEmail |
| Tenant | EmailThreadSemAcao | ARQUIVADA | EmailAssuntosParticipantes |  |  | Nao | Thread guardada sem ação pendente. | StatusThreadEmail |
| Tenant | EventoStatusConcluido | SUCCESS | HistoricoLog \| AlertRule |  |  | Sim | Evento concluído com sucesso. | StatusEvento |
| Tenant | EventoStatusFalha | FAILURE | HistoricoLog \| AlertRule |  |  | Nao | Evento falhou totalmente. | StatusEvento |
| Tenant | EventoStatusParcial | PARTIAL | HistoricoLog \| AlertRule |  |  | Nao | Evento parcialmente bem-sucedido (ex: lote com algumas falhas). | StatusEvento |
| Tenant | NCMOrigemSincronizacaoCliqueManual | MANUAL | NcmSyncLog |  |  | Nao | Sincronização iniciada por clique humano. | NcmSyncOrigem |
| Tenant | NCMOrigemSincronizacaoDisparada | JOB | NcmSyncLog |  |  | Sim | Sincronização disparada pelo cron (automática). | NcmSyncOrigem |
| Tenant | NCMStatusSincronizacaoConcluida | SUCCESS | NcmSyncLog |  |  | Nao | Sincronização concluída sem erros. | StatusNcmSync |
| Tenant | NCMStatusSincronizacaoEmAndamento | RUNNING | NcmSyncLog |  |  | Sim | Sincronização NCM em andamento. | StatusNcmSync |
| Tenant | NCMStatusSincronizacaoFalha | ERROR | NcmSyncLog |  |  | Nao | Sincronização falhou. | StatusNcmSync |
| Tenant | TokenDeletar | DELETE | TokenAPI |  |  | Nao | Token pode remover registros. | TokenScope |
| Tenant | TokenGet | READ | TokenAPI |  |  | Sim | Token só pode fazer GET/leitura. | TokenScope |
| Tenant | TokenPostPutPatch | WRITE | TokenAPI |  |  | Nao | Token pode POST/PUT/PATCH (criar/atualizar). | TokenScope |
| Tenant | TokenSemValidade | NEVER | TokenAPI |  |  | Sim | Token sem expiração (não recomendado em produção). | TokenExpiration |
| Tenant | TokenValidade30dias | DAYS_30 | TokenAPI |  |  | Nao | Token válido por 30 dias. | TokenExpiration |
| Tenant | TokenValidade90dias | DAYS_90 | TokenAPI |  |  | Nao | Token válido por 90 dias. | TokenExpiration |
| Tenant | TokenValidadeManual | CUSTOM | TokenAPI |  |  | Nao | Data de expiração definida manualmente pelo usuário. | TokenExpiration |


## Apendice - Linhas SKIP / exempt (0 linhas)

_(nenhuma linha exempt nesta aba)_
