import { ArrowLeft } from '@phosphor-icons/react'

const ULTIMA_ATUALIZACAO = '20 de maio de 2026'

export function TermosDeUsoPage() {
  const handleVoltar = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.close()
    }
  }

  return (
    <div className="legal-page">
      <div className="legal-page-inner">
        <button
          onClick={handleVoltar}
          className="legal-back"
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        <article className="legal-doc">
          <h1>Termos de Uso da Plataforma Gravity</h1>
          <p className="legal-date">Ultima atualizacao: {ULTIMA_ATUALIZACAO}</p>

          <section>
            <h2>Identificacao do Fornecedor</h2>
            <p>
              <strong>DATI INOVACAO E TECNOLOGIA EM COMERCIO EXTERIOR S.A.</strong>, inscrita no CNPJ/MF sob
              n. 32.964.709/0001-01, com sede na Rod. Jose Carlos Daux, 5500, Torre Campeche A, sl. 328 CFL,
              Florianopolis, Santa Catarina, Brasil, CEP: 88.032-005, neste ato representada por sua Diretora
              Juridica <strong>Marina Martins Mendes Perfetti</strong>.
            </p>
            <p>Plataforma: <strong>Gravity</strong> (acessivel em gravity.com.br e seus subdominios)</p>
            <p>E-mail de contato: contato@gravity.com.br</p>
            <p>Canal de atendimento ao titular de dados: privacidade@gravity.com.br</p>
          </section>

          <section>
            <h2>1. Objeto</h2>
            <p>
              1.1. Estes Termos de Uso (&quot;Termos&quot;) regulam as condicoes de acesso e utilizacao da
              plataforma Gravity (&quot;Plataforma&quot;), uma solucao SaaS (Software as a Service) B2B modular
              voltada a operacoes de comercio exterior, gestao empresarial e servicos correlatos, disponibilizada
              pela DATI.
            </p>
            <p>1.2. A Plataforma oferece, entre outros, os seguintes modulos e funcionalidades, conforme o plano contratado:</p>
            <ul>
              <li><strong>Configurador:</strong> gestao de organizacoes, workspaces, usuarios e permissoes;</li>
              <li><strong>Produtos verticais:</strong> simulacao de custos de importacao, gestao de pedidos, notas fiscais de importacao, bid de frete, entre outros;</li>
              <li><strong>Servicos compartilhados:</strong> atividades, dashboard, e-mail, relatorios, historico, notificacoes, agendamento e assistente de inteligencia artificial (&quot;Gabi&quot;);</li>
              <li><strong>Marketplace:</strong> catalogo de produtos disponiveis na Plataforma;</li>
              <li><strong>API Cockpit:</strong> gestao de tokens, webhooks e integracoes com sistemas externos (ERP/SAP).</li>
            </ul>
            <p>
              1.3. Ao criar uma conta, marcar a caixa &quot;Li e aceito os Termos de Uso e a Politica de
              Privacidade&quot; ou utilizar a Plataforma de qualquer forma, o Usuario declara ter lido,
              compreendido e aceito integralmente estes Termos e a Politica de Privacidade, vinculando-se a ambos
              os documentos.
            </p>
          </section>

          <section>
            <h2>2. Definicoes</h2>
            <table>
              <thead><tr><th>Termo</th><th>Definicao</th></tr></thead>
              <tbody>
                <tr><td><strong>Usuario</strong></td><td>Toda pessoa fisica que acessa ou utiliza a Plataforma, seja como representante de pessoa juridica (Organizacao) ou em nome proprio.</td></tr>
                <tr><td><strong>Organizacao</strong></td><td>Pessoa juridica que contrata a Plataforma e sob cuja titularidade sao gerenciados os dados, workspaces e produtos.</td></tr>
                <tr><td><strong>Workspace</strong></td><td>Unidade operacional dentro de uma Organizacao (ex.: filial, departamento, unidade de negocio).</td></tr>
                <tr><td><strong>Administrador</strong></td><td>Usuario com permissoes de gestao sobre a Organizacao e/ou Workspace.</td></tr>
                <tr><td><strong>Plano</strong></td><td>Conjunto de funcionalidades, limites e condicoes comerciais contratado pela Organizacao.</td></tr>
                <tr><td><strong>Dados do Usuario</strong></td><td>Informacoes pessoais fornecidas pelo Usuario no cadastro e no uso da Plataforma.</td></tr>
                <tr><td><strong>Dados da Organizacao</strong></td><td>Informacoes comerciais, operacionais e financeiras inseridas na Plataforma pela Organizacao e seus Usuarios.</td></tr>
                <tr><td><strong>Conteudo</strong></td><td>Quaisquer dados, textos, arquivos, documentos, imagens ou informacoes inseridos na Plataforma pelo Usuario ou pela Organizacao.</td></tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>3. Condicoes de Acesso, Cadastro e Declaracao de Representacao</h2>
            <p>3.1. Para utilizar a Plataforma, o Usuario deve:</p>
            <ol type="a">
              <li>ser maior de 18 (dezoito) anos ou emancipado nos termos da legislacao civil brasileira;</li>
              <li>fornecer informacoes verdadeiras, completas e atualizadas no cadastro;</li>
              <li>aceitar integralmente estes Termos e a Politica de Privacidade.</li>
            </ol>
            <p><strong>3.2. Declaracao de representacao:</strong> ao criar uma Organizacao na Plataforma ou ao aceitar um convite para ingressar em uma Organizacao existente, o Usuario declara, sob as penas da lei, que:</p>
            <ol type="a">
              <li>e representante autorizado da pessoa juridica (Organizacao) que esta cadastrando ou a qual esta se vinculando;</li>
              <li>possui poderes legais, contratuais ou estatutarios para contratar servicos e assumir obrigacoes em nome da Organizacao;</li>
              <li>todas as informacoes da Organizacao fornecidas no cadastro (razao social, CNPJ, endereco) sao verdadeiras e correspondem a pessoa juridica regular e legalmente constituida;</li>
              <li>a Organizacao e uma empresa legitima e suas atividades estao em conformidade com a legislacao brasileira.</li>
            </ol>
            <p>3.2.1. A DATI podera, a qualquer tempo, solicitar documentacao comprobatoria da representacao declarada (contrato social, procuracao, ata de assembleia ou equivalente). A nao apresentacao da documentacao no prazo de 15 (quinze) dias uteis apos a solicitacao podera ensejar a suspensao do acesso da Organizacao.</p>
            <p>3.2.2. A falsidade da declaracao de representacao responsabiliza o Usuario civil e criminalmente, nos termos dos arts. 186 e 927 do Codigo Civil e art. 299 do Codigo Penal, sem prejuizo da responsabilidade solidaria pelos danos causados a DATI e a terceiros.</p>
          </section>

          <section>
            <h2>4. Funcionalidades, Disponibilidade e SLA</h2>
            <p>4.1. A DATI compromete-se a manter a Plataforma disponivel com indice de disponibilidade minimo de <strong>99,5%</strong> ao mes (&quot;Uptime Garantido&quot;), calculado sobre o total de minutos do mes calendario, descontados os periodos de Manutencao Programada e eventos de Forca Maior.</p>
            <p>4.2. Manutencoes programadas serao comunicadas com antecedencia minima de 48 horas por e-mail e/ou aviso na Plataforma.</p>
            <p>4.3. Caso a disponibilidade mensal fique abaixo do Uptime Garantido, a Organizacao tera direito a creditos de servico:</p>
            <table>
              <thead><tr><th>Disponibilidade mensal</th><th>Credito sobre o valor mensal</th></tr></thead>
              <tbody>
                <tr><td>99,0% a 99,4%</td><td>5%</td></tr>
                <tr><td>98,0% a 98,9%</td><td>10%</td></tr>
                <tr><td>95,0% a 97,9%</td><td>20%</td></tr>
                <tr><td>Abaixo de 95,0%</td><td>30%</td></tr>
              </tbody>
            </table>
            <p>Os creditos constituem o unico e exclusivo remedio da Organizacao em relacao a indisponibilidade.</p>
          </section>

          <section>
            <h2>5. Planos, Periodo de Teste, Pagamento e Cobranca</h2>
            <p><strong>5.1. Trial:</strong> a Organizacao podera utilizar a Plataforma gratuitamente durante 14 (quatorze) dias corridos. Nao havera cobranca automatica sem que a Organizacao forneca ativamente os dados de pagamento.</p>
            <p><strong>5.2. Precificacao:</strong> os valores, condicoes comerciais, limites de uso, taxas de setup e periodos de carencia sao os publicados e vigentes na area administrativa da Plataforma e no Marketplace no momento da contratacao ou renovacao.</p>
            <p><strong>5.3. Vigencia:</strong> os Planos sao contratados com periodicidade mensal e renovacao automatica. A Organizacao sera notificada por e-mail com antecedencia minima de 5 dias antes de cada renovacao.</p>
            <p><strong>5.4. Formas de pagamento:</strong> cartao de credito (recorrente), boleto bancario e PIX.</p>
            <p><strong>5.5. Inadimplencia:</strong> atraso superior a 15 dias autoriza suspensao (multa de 2% e juros de 1% ao mes). Atraso superior a 30 dias autoriza cancelamento definitivo.</p>
            <p><strong>5.6. Nota Fiscal:</strong> a DATI emitira NFS-e referente a cada cobranca. Reajustes mediante aviso previo de 30 dias.</p>
          </section>

          <section>
            <h2>6. Obrigacoes do Usuario</h2>
            <p>O Usuario compromete-se a utilizar a Plataforma exclusivamente para fins licitos, nao reproduzir ou realizar engenharia reversa, nao acessar areas restritas sem autorizacao, nao inserir conteudo ilicito e manter informacoes cadastrais atualizadas.</p>
          </section>

          <section>
            <h2>7. Propriedade Intelectual</h2>
            <p>A Plataforma e de propriedade exclusiva da DATI. Estes Termos concedem apenas uma licenca limitada, nao exclusiva, intransferivel e revogavel de uso. O Conteudo inserido pelo Usuario permanece de propriedade de seus titulares.</p>
          </section>

          <section>
            <h2>8. Indenidade, Compliance e Uso Licito</h2>
            <p>A Organizacao obriga-se a indenizar a DATI contra quaisquer perdas decorrentes de uso ilicito da Plataforma, incluindo contrabando, descaminho, subfaturamento, lavagem de dinheiro, evasao fiscal ou violacao de sancoes internacionais.</p>
            <p>A Organizacao declara que utilizara a Plataforma em conformidade com a legislacao aduaneira e de comercio exterior, incluindo o Regulamento Aduaneiro (Decreto n. 6.759/2009).</p>
          </section>

          <section>
            <h2>9. Limitacao de Responsabilidade</h2>
            <p>A responsabilidade total da DATI esta limitada ao valor pago pela Organizacao nos 12 meses anteriores ao evento. Simulacoes e calculos possuem carater meramente informativo e nao substituem a consulta a profissionais especializados.</p>
          </section>

          <section>
            <h2>10. Suspensao e Cancelamento</h2>
            <p>A Organizacao podera cancelar seu Plano a qualquer tempo. Apos o cancelamento, tera 30 dias para exportar seus dados. A DATI podera suspender o acesso em caso de violacao, inadimplencia ou suspeita de ilicitos.</p>
          </section>

          <section>
            <h2>11. Comunicacoes</h2>
            <p>O Usuario consente em receber comunicacoes operacionais, transacionais e comerciais por e-mail, podendo optar por nao receber comunicacoes comerciais a qualquer tempo.</p>
          </section>

          <section>
            <h2>12. Alteracoes nos Termos</h2>
            <p>A DATI podera alterar estes Termos mediante aviso previo de 15 dias. O uso continuado da Plataforma apos a vigencia das alteracoes implica aceitacao.</p>
          </section>

          <section>
            <h2>13. Legislacao Aplicavel e Foro</h2>
            <p>Estes Termos sao regidos pelas leis brasileiras (LGPD, Marco Civil da Internet, CDC, Codigo Civil, Regulamento Aduaneiro). Foro: Comarca de Florianopolis, Santa Catarina.</p>
          </section>

          <section>
            <h2>14. Disposicoes Gerais</h2>
            <p>As clausulas 7 (Propriedade Intelectual), 8 (Indenidade), 9 (Limitacao de Responsabilidade) e 14 (Disposicoes Gerais) sobrevivem ao termino ou cancelamento destes Termos.</p>
            <p>Contato: contato@gravity.com.br</p>
          </section>

          <p className="legal-footer">
            Documento elaborado em conformidade com a Lei n. 13.709/2018 (LGPD), Lei n. 12.965/2014
            (Marco Civil da Internet), Lei n. 8.078/1990 (CDC) e demais normas aplicaveis da legislacao brasileira.
          </p>
        </article>
      </div>

      <style>{`
        .legal-page {
          position: fixed;
          inset: 0;
          background: #e8e8e8;
          padding: 2rem 1rem;
          overflow-y: auto;
          z-index: 9999;
        }
        .legal-page-inner {
          max-width: 860px;
          margin: 0 auto;
        }
        .legal-back {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #555;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          background: none;
          border: none;
          cursor: pointer;
        }
        .legal-back:hover { color: #222; }
        .legal-doc {
          background: #fff;
          border-radius: 4px;
          padding: 3rem 3.5rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.12);
          color: #1a1a1a;
          line-height: 1.8;
        }
        .legal-doc h1 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
          color: #111;
        }
        .legal-date {
          font-size: 0.8125rem;
          color: #888;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }
        .legal-doc h2 {
          font-size: 1.0625rem;
          font-weight: 700;
          margin: 2rem 0 0.75rem;
          color: #2d2d7f;
        }
        .legal-doc p {
          margin: 0.5rem 0;
          font-size: 0.875rem;
          color: #333;
        }
        .legal-doc ul, .legal-doc ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .legal-doc li {
          font-size: 0.875rem;
          margin: 0.25rem 0;
          color: #333;
        }
        .legal-doc strong {
          color: #111;
        }
        .legal-doc table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.75rem 0;
          font-size: 0.8125rem;
        }
        .legal-doc th, .legal-doc td {
          border: 1px solid #d0d0d0;
          padding: 0.5rem 0.75rem;
          text-align: left;
          color: #333;
        }
        .legal-doc th {
          background: #f5f5f5;
          font-weight: 600;
          color: #222;
        }
        .legal-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e0e0e0;
          font-size: 0.75rem;
          color: #888;
          font-style: italic;
        }
      `}</style>
    </div>
  )
}
