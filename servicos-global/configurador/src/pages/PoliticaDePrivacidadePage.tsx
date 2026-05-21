import { ArrowLeft } from '@phosphor-icons/react'

const ULTIMA_ATUALIZACAO = '20 de maio de 2026'

export function PoliticaDePrivacidadePage() {
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
          <h1>Politica de Privacidade da Plataforma Gravity</h1>
          <p className="legal-date">Ultima atualizacao: {ULTIMA_ATUALIZACAO}</p>

          <section>
            <h2>Identificacao do Controlador</h2>
            <p>
              <strong>DATI INOVACAO E TECNOLOGIA EM COMERCIO EXTERIOR S.A.</strong>, inscrita no CNPJ/MF sob
              n. 32.964.709/0001-01, com sede na Rod. Jose Carlos Daux, 5500, Torre Campeche A, sl. 328 CFL,
              Florianopolis, Santa Catarina, Brasil, CEP: 88.032-005.
            </p>
            <p>Doravante denominada simplesmente <strong>&quot;DATI&quot;</strong>, <strong>&quot;Controlador&quot;</strong> ou <strong>&quot;nos&quot;</strong>.</p>
            <p>Plataforma: <strong>Gravity</strong> (acessivel em gravity.com.br e seus subdominios)</p>
            <p>Encarregada de Protecao de Dados (DPO): <strong>Marina Martins Mendes Perfetti</strong> — privacidade@gravity.com.br</p>
            <p>Canal de atendimento ao titular: privacidade@gravity.com.br</p>
          </section>

          <section>
            <h2>1. Introducao</h2>
            <p>
              1.1. Esta Politica de Privacidade (&quot;Politica&quot;) descreve como a DATI coleta, utiliza, armazena,
              compartilha e protege os dados pessoais tratados na plataforma Gravity (&quot;Plataforma&quot;), em
              conformidade com a Lei n. 13.709/2018 — Lei Geral de Protecao de Dados Pessoais (&quot;LGPD&quot;) e
              demais normas aplicaveis.
            </p>
            <p>
              1.2. Ao utilizar a Plataforma, o Usuario (&quot;Titular&quot;) declara ter lido e compreendido esta
              Politica. Esta Politica e parte integrante dos Termos de Uso da Plataforma.
            </p>
            <p><strong>1.3. Qualificacao da DATI — Controladora e Operadora:</strong></p>
            <p>A DATI desempenha <strong>papeis distintos</strong> conforme a natureza dos dados pessoais tratados:</p>
            <table>
              <thead><tr><th>Papel LGPD</th><th>Quando se aplica</th><th>Exemplos</th></tr></thead>
              <tbody>
                <tr>
                  <td><strong>Controladora</strong> (art. 5, VI)</td>
                  <td>Dados pessoais coletados diretamente pela DATI para prestacao do servico, gestao da Plataforma e cumprimento de obrigacoes legais</td>
                  <td>Dados de cadastro do Usuario (nome, e-mail, senha), dados de faturamento, registros de acesso (logs), cookies, dados de navegacao</td>
                </tr>
                <tr>
                  <td><strong>Operadora</strong> (art. 5, VII)</td>
                  <td>Dados pessoais de terceiros inseridos na Plataforma pela Organizacao no ambito das operacoes de negocio da Organizacao</td>
                  <td>Dados pessoais contidos em pedidos de importacao, manifestos de carga, faturas comerciais, conhecimentos de embarque (BL), nomes de motoristas/transportadores, dados de fornecedores estrangeiros</td>
                </tr>
              </tbody>
            </table>
            <p>
              1.3.1. <strong>Quando a DATI e Controladora:</strong> a DATI decide as finalidades e os meios do
              tratamento. O Titular (Usuario da Plataforma) pode exercer todos os direitos previstos no art. 18 da
              LGPD diretamente perante a DATI, conforme secao 10 desta Politica.
            </p>
            <p>
              1.3.2. <strong>Quando a DATI e Operadora:</strong> a Organizacao e a Controladora dos dados pessoais de
              terceiros que insere na Plataforma. A DATI trata esses dados exclusivamente conforme as instrucoes da
              Organizacao e para a finalidade de prestacao do servico contratado. Titulares terceiros que desejarem
              exercer seus direitos sob a LGPD devem dirigir-se diretamente a Organizacao responsavel.
            </p>
            <p>
              1.3.3. <strong>Responsabilidades da Organizacao como Controladora:</strong> ao inserir dados pessoais de
              terceiros na Plataforma, a Organizacao declara e garante que: (i) possui base legal valida para o
              tratamento desses dados conforme a LGPD; (ii) obteve os consentimentos necessarios, quando aplicavel;
              (iii) informou adequadamente os titulares sobre o tratamento; (iv) e integralmente responsavel pela
              licitude, veracidade e pertinencia dos dados inseridos.
            </p>
          </section>

          <section>
            <h2>2. Definicoes (conforme LGPD — art. 5)</h2>
            <table>
              <thead><tr><th>Termo</th><th>Definicao</th></tr></thead>
              <tbody>
                <tr><td><strong>Dado Pessoal</strong></td><td>Informacao relacionada a pessoa natural identificada ou identificavel (art. 5, I).</td></tr>
                <tr><td><strong>Dado Pessoal Sensivel</strong></td><td>Dado pessoal sobre origem racial ou etnica, conviccao religiosa, opiniao politica, filiacao a sindicato ou a organizacao de carater religioso, filosofico ou politico, dado referente a saude ou a vida sexual, dado genetico ou biometrico (art. 5, II).</td></tr>
                <tr><td><strong>Titular</strong></td><td>Pessoa natural a quem se referem os dados pessoais (art. 5, V). O Usuario da Plataforma.</td></tr>
                <tr><td><strong>Controlador</strong></td><td>Pessoa natural ou juridica a quem competem as decisoes referentes ao tratamento de dados pessoais (art. 5, VI). A DATI.</td></tr>
                <tr><td><strong>Operador</strong></td><td>Pessoa natural ou juridica que realiza o tratamento de dados pessoais em nome do Controlador (art. 5, VII).</td></tr>
                <tr><td><strong>Encarregado (DPO)</strong></td><td>Pessoa indicada pelo Controlador para atuar como canal de comunicacao entre o Controlador, os Titulares e a ANPD (art. 5, VIII).</td></tr>
                <tr><td><strong>Tratamento</strong></td><td>Toda operacao realizada com dados pessoais (coleta, producao, recepcao, classificacao, utilizacao, acesso, reproducao, transmissao, distribuicao, processamento, arquivamento, armazenamento, eliminacao, avaliacao, controle, modificacao, comunicacao, transferencia, difusao ou extracao) (art. 5, X).</td></tr>
                <tr><td><strong>Consentimento</strong></td><td>Manifestacao livre, informada e inequivoca pela qual o Titular concorda com o tratamento de seus dados pessoais para uma finalidade determinada (art. 5, XII).</td></tr>
                <tr><td><strong>ANPD</strong></td><td>Autoridade Nacional de Protecao de Dados, orgao da administracao publica responsavel por zelar, implementar e fiscalizar o cumprimento da LGPD (art. 5, XIX).</td></tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>3. Dados Pessoais Coletados</h2>
            <h3>3.1. Dados fornecidos diretamente pelo Titular</h3>
            <table>
              <thead><tr><th>Dado</th><th>Momento da Coleta</th><th>Finalidade</th></tr></thead>
              <tbody>
                <tr><td>Nome completo</td><td>Cadastro</td><td>Identificacao do Usuario na Plataforma</td></tr>
                <tr><td>Endereco de e-mail</td><td>Cadastro</td><td>Autenticacao, comunicacoes operacionais e transacionais</td></tr>
                <tr><td>Senha (armazenada em hash)</td><td>Cadastro</td><td>Autenticacao segura</td></tr>
                <tr><td>Cargo/funcao na Organizacao</td><td>Cadastro ou configuracao</td><td>Atribuicao de permissoes adequadas</td></tr>
                <tr><td>Telefone (quando fornecido)</td><td>Configuracao de perfil</td><td>Comunicacoes de suporte e seguranca</td></tr>
                <tr><td>Dados de faturamento (CNPJ, razao social, endereco fiscal)</td><td>Contratacao de Plano</td><td>Emissao de NF-e e cobranca</td></tr>
              </tbody>
            </table>

            <h3>3.2. Dados coletados automaticamente</h3>
            <table>
              <thead><tr><th>Dado</th><th>Finalidade</th></tr></thead>
              <tbody>
                <tr><td>Endereco IP</td><td>Seguranca, prevencao a fraudes, cumprimento do Marco Civil da Internet (art. 15)</td></tr>
                <tr><td>Tipo e versao do navegador</td><td>Compatibilidade e otimizacao da Plataforma</td></tr>
                <tr><td>Sistema operacional</td><td>Compatibilidade e otimizacao da Plataforma</td></tr>
                <tr><td>Paginas acessadas e tempo de permanencia</td><td>Melhoria da experiencia do Usuario e analise de uso</td></tr>
                <tr><td>Data e hora de acesso</td><td>Registros de acesso (obrigatorio — art. 15 do Marco Civil da Internet)</td></tr>
                <tr><td>Dados de cookies e tecnologias semelhantes</td><td>Conforme secao 8 desta Politica</td></tr>
              </tbody>
            </table>

            <h3>3.3. Dados gerados pelo uso da Plataforma</h3>
            <table>
              <thead><tr><th>Dado</th><th>Finalidade</th></tr></thead>
              <tbody>
                <tr><td>Registros de atividades (logs)</td><td>Auditoria, seguranca e suporte tecnico</td></tr>
                <tr><td>Preferencias de configuracao (idioma, workspace preferido, layout)</td><td>Personalizacao da experiencia</td></tr>
                <tr><td>Historico de acoes na Plataforma</td><td>Rastreabilidade e auditoria interna</td></tr>
                <tr><td>Conteudo inserido pelo Usuario (dados comerciais, pedidos, documentos fiscais)</td><td>Prestacao do servico contratado</td></tr>
              </tbody>
            </table>

            <h3>3.4. Dados que NAO coletamos</h3>
            <p>
              A DATI <strong>nao coleta</strong> dados pessoais sensiveis (art. 5, II, LGPD), tais como: dados de
              saude, dados biometricos, origem racial ou etnica, conviccao religiosa, opiniao politica, filiacao
              sindical ou dados referentes a vida sexual. Caso, no futuro, a coleta de qualquer dado sensivel se torne
              necessaria, o Titular sera informado previamente e sera solicitado consentimento especifico e destacado,
              conforme art. 11 da LGPD.
            </p>
          </section>

          <section>
            <h2>4. Bases Legais para o Tratamento (art. 7 da LGPD)</h2>
            <table>
              <thead><tr><th>Base Legal</th><th>Artigo LGPD</th><th>Aplicacao</th></tr></thead>
              <tbody>
                <tr><td><strong>Execucao de contrato</strong></td><td>Art. 7, V</td><td>Prestacao dos servicos contratados (cadastro, acesso a Plataforma, funcionalidades do Plano)</td></tr>
                <tr><td><strong>Consentimento</strong></td><td>Art. 7, I</td><td>Envio de comunicacoes comerciais e de marketing; uso de cookies nao essenciais</td></tr>
                <tr><td><strong>Cumprimento de obrigacao legal ou regulatoria</strong></td><td>Art. 7, II</td><td>Guarda de registros de acesso (Marco Civil da Internet, art. 15); emissao de NF-e (legislacao tributaria)</td></tr>
                <tr><td><strong>Legitimo interesse</strong></td><td>Art. 7, IX</td><td>Melhoria da Plataforma; prevencao a fraudes; seguranca da informacao; analise de uso agregada e anonimizada</td></tr>
                <tr><td><strong>Exercicio regular de direitos</strong></td><td>Art. 7, VI</td><td>Defesa em processos judiciais, administrativos ou arbitrais</td></tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>5. Finalidades do Tratamento</h2>
            <p><strong>a) Prestacao do servico:</strong></p>
            <ul>
              <li>Criacao e gestao de conta do Usuario;</li>
              <li>Autenticacao e controle de acesso;</li>
              <li>Atribuicao de permissoes conforme o perfil do Usuario na Organizacao;</li>
              <li>Processamento de funcionalidades contratadas (simulacoes, pedidos, documentos fiscais, dashboards);</li>
              <li>Suporte tecnico e atendimento ao Usuario.</li>
            </ul>
            <p><strong>b) Comunicacao:</strong></p>
            <ul>
              <li>Envio de notificacoes operacionais (manutencoes, atualizacoes, incidentes de seguranca);</li>
              <li>Envio de comunicacoes transacionais (confirmacoes, convites, redefinicao de senha, notas fiscais);</li>
              <li>Envio de comunicacoes comerciais e de marketing (mediante consentimento — art. 7, I).</li>
            </ul>
            <p><strong>c) Seguranca e compliance:</strong></p>
            <ul>
              <li>Prevencao, deteccao e resposta a incidentes de seguranca;</li>
              <li>Prevencao a fraudes e acessos nao autorizados;</li>
              <li>Manutencao de registros de acesso a aplicacoes de internet pelo prazo de 6 (seis) meses, conforme art. 15 do Marco Civil da Internet;</li>
              <li>Cumprimento de obrigacoes fiscais e tributarias.</li>
            </ul>
            <p><strong>d) Melhoria e desenvolvimento:</strong></p>
            <ul>
              <li>Analise de uso da Plataforma para identificacao de melhorias;</li>
              <li>Pesquisa e desenvolvimento de novos produtos e funcionalidades;</li>
              <li>Geracao de relatorios estatisticos e analiticos com dados agregados e anonimizados.</li>
            </ul>
          </section>

          <section>
            <h2>6. Compartilhamento de Dados</h2>
            <p>6.1. A DATI podera compartilhar dados pessoais com os seguintes destinatarios:</p>
            <h3>6.1.1. Operadores e prestadores de servico</h3>
            <table>
              <thead><tr><th>Operador/Prestador</th><th>Finalidade</th><th>Dados compartilhados</th></tr></thead>
              <tbody>
                <tr><td><strong>Clerk</strong></td><td>Autenticacao de Usuarios (login, senha, e-mail)</td><td>Nome, e-mail, identificador de usuario</td></tr>
                <tr><td><strong>Resend</strong></td><td>Envio de e-mails transacionais</td><td>Endereco de e-mail, nome</td></tr>
                <tr><td><strong>Railway</strong></td><td>Hospedagem da infraestrutura da Plataforma</td><td>Dados armazenados na Plataforma (criptografados)</td></tr>
                <tr><td><strong>Sentry</strong></td><td>Monitoramento de erros e estabilidade</td><td>Dados tecnicos de sessao (IP anonimizado, navegador, stack traces)</td></tr>
                <tr><td><strong>OpenAI</strong></td><td>Motor do assistente de IA &quot;Gabi&quot;</td><td>Dados de contexto de conversacao</td></tr>
                <tr><td><strong>Provedores de pagamento</strong></td><td>Processamento de cobrancas</td><td>Dados de faturamento (CNPJ, razao social)</td></tr>
                <tr><td><strong>Meta / WhatsApp Cloud API</strong></td><td>Integracao de WhatsApp (quando contratada)</td><td>Numero de telefone, mensagens trocadas</td></tr>
              </tbody>
            </table>
            <p>
              6.1.2. A DATI exige contratualmente que todos os Operadores e prestadores de servico mantenham nivel
              adequado de protecao de dados pessoais, em conformidade com a LGPD, celebrando contratos com clausulas
              especificas de protecao de dados (art. 39 da LGPD).
            </p>
            <h3>6.1.3. Transferencia internacional de dados</h3>
            <p>
              Alguns dos Operadores listados acima podem armazenar ou processar dados em servidores localizados fora
              do Brasil. Nesses casos, a transferencia internacional de dados e realizada em conformidade com o art. 33
              da LGPD, garantindo-se que o pais destinatario proporcione grau de protecao adequado ou que o Controlador
              ofereca e comprove garantias de cumprimento dos principios da LGPD.
            </p>
            <h3>6.1.4. Compartilhamento com autoridades</h3>
            <p>
              A DATI podera compartilhar dados pessoais com autoridades publicas, judiciais ou administrativas, quando
              houver determinacao legal, judicial ou administrativa; for necessario para cumprir obrigacao legal ou
              regulatoria (art. 7, II); ou for necessario para o exercicio regular de direitos em processo judicial,
              administrativo ou arbitral (art. 7, VI).
            </p>
            <p>6.2. A DATI <strong>nao vende, aluga ou comercializa</strong> dados pessoais dos Titulares a terceiros para fins de marketing ou qualquer outra finalidade.</p>
          </section>

          <section>
            <h2>7. Armazenamento e Retencao de Dados</h2>
            <p>
              7.1. Os dados pessoais sao armazenados em bancos de dados PostgreSQL hospedados em infraestrutura segura
              (Railway), com isolamento logico por Organizacao (schema-per-organization), garantindo a segregacao dos
              dados entre diferentes Organizacoes.
            </p>
            <p>7.2. Os dados pessoais serao retidos pelo tempo necessario para o cumprimento das finalidades para as quais foram coletados:</p>
            <table>
              <thead><tr><th>Tipo de dado</th><th>Prazo de retencao</th><th>Fundamentacao</th></tr></thead>
              <tbody>
                <tr><td>Registros de acesso a aplicacoes de internet</td><td>6 (seis) meses</td><td>Art. 15 do Marco Civil da Internet</td></tr>
                <tr><td>Dados fiscais e de faturamento</td><td>5 (cinco) anos</td><td>Codigo Tributario Nacional (art. 173)</td></tr>
                <tr><td>Dados para exercicio regular de direitos</td><td>Ate prescricao da pretensao</td><td>Codigo Civil (art. 205 e 206)</td></tr>
                <tr><td>Dados de conta de Usuario</td><td>Enquanto a conta estiver ativa + 30 dias apos cancelamento</td><td>Termos de Uso (clausula 9.3)</td></tr>
              </tbody>
            </table>
            <p>
              7.3. Apos o termino do periodo de retencao ou apos solicitacao de eliminacao pelo Titular (quando nao
              houver obrigacao legal de manutencao), os dados serao eliminados de forma segura.
            </p>
          </section>

          <section>
            <h2>8. Cookies e Tecnologias Semelhantes</h2>
            <p>8.1. A Plataforma utiliza cookies e tecnologias semelhantes para melhorar a experiencia do Usuario.</p>
            <p>8.2. Tipos de cookies utilizados:</p>
            <table>
              <thead><tr><th>Tipo</th><th>Finalidade</th><th>Base Legal</th><th>Obrigatorio?</th></tr></thead>
              <tbody>
                <tr><td><strong>Essenciais</strong></td><td>Autenticacao, seguranca, funcionamento basico da Plataforma</td><td>Execucao de contrato (art. 7, V)</td><td>Sim</td></tr>
                <tr><td><strong>Funcionais</strong></td><td>Preferencias do Usuario (idioma, tema, layout)</td><td>Legitimo interesse (art. 7, IX)</td><td>Nao</td></tr>
                <tr><td><strong>Analiticos</strong></td><td>Metricas de uso, performance, identificacao de erros</td><td>Consentimento (art. 7, I)</td><td>Nao</td></tr>
                <tr><td><strong>Marketing</strong></td><td>Personalizacao de comunicacoes comerciais</td><td>Consentimento (art. 7, I)</td><td>Nao</td></tr>
              </tbody>
            </table>
            <p>
              8.3. No primeiro acesso a Plataforma, o Usuario sera informado sobre o uso de cookies por meio de um
              banner, podendo aceitar ou recusar cookies nao essenciais. O Usuario podera alterar suas preferencias
              de cookies a qualquer tempo.
            </p>
            <p>8.4. A desativacao de cookies essenciais pode comprometer o funcionamento da Plataforma.</p>
          </section>

          <section>
            <h2>9. Seguranca dos Dados</h2>
            <p>
              9.1. A DATI adota medidas tecnicas e administrativas aptas a proteger os dados pessoais contra acessos
              nao autorizados, situacoes acidentais ou ilicitas de destruicao, perda, alteracao, comunicacao ou difusao,
              conforme art. 46 da LGPD, incluindo:
            </p>
            <p><strong>Medidas tecnicas:</strong></p>
            <ul>
              <li>Criptografia de dados em transito (TLS/HTTPS);</li>
              <li>Hash de senhas com algoritmos seguros (bcrypt via Clerk);</li>
              <li>Isolamento logico de dados por Organizacao no banco de dados (schema-per-organization);</li>
              <li>Validacao de entrada em todas as rotas de API (Zod schema validation);</li>
              <li>Autenticacao via tokens JWT com expiracao;</li>
              <li>Autenticacao inter-servico com chaves internas;</li>
              <li>Controle de acesso baseado em perfis e permissoes (RBAC);</li>
              <li>Monitoramento continuo de erros e incidentes (Sentry);</li>
              <li>Monitoramento de disponibilidade (UptimeRobot);</li>
              <li>Backups regulares do banco de dados.</li>
            </ul>
            <p><strong>Medidas administrativas:</strong></p>
            <ul>
              <li>Politica de acesso minimo (principio do menor privilegio);</li>
              <li>Treinamento da equipe sobre protecao de dados;</li>
              <li>Contratos com clausulas de protecao de dados com todos os Operadores;</li>
              <li>Plano de resposta a incidentes de seguranca.</li>
            </ul>
            <p>
              9.2. Nenhum sistema e 100% seguro. A DATI nao pode garantir protecao absoluta contra todas as ameacas,
              mas se compromete a adotar as melhores praticas de mercado e a comunicar eventuais incidentes de seguranca
              conforme previsto na LGPD (art. 48).
            </p>
          </section>

          <section>
            <h2>10. Direitos do Titular (art. 18 da LGPD)</h2>
            <p>10.1. O Titular dos dados pessoais tem direito a, mediante requisicao ao Controlador:</p>
            <table>
              <thead><tr><th>Direito</th><th>Descricao</th><th>Artigo LGPD</th></tr></thead>
              <tbody>
                <tr><td><strong>Confirmacao</strong></td><td>Confirmar a existencia de tratamento de seus dados pessoais</td><td>Art. 18, I</td></tr>
                <tr><td><strong>Acesso</strong></td><td>Acessar seus dados pessoais tratados pelo Controlador</td><td>Art. 18, II</td></tr>
                <tr><td><strong>Correcao</strong></td><td>Solicitar a correcao de dados incompletos, inexatos ou desatualizados</td><td>Art. 18, III</td></tr>
                <tr><td><strong>Anonimizacao, bloqueio ou eliminacao</strong></td><td>Solicitar a anonimizacao, bloqueio ou eliminacao de dados desnecessarios ou excessivos</td><td>Art. 18, IV</td></tr>
                <tr><td><strong>Portabilidade</strong></td><td>Solicitar a portabilidade dos dados a outro fornecedor de servico</td><td>Art. 18, V</td></tr>
                <tr><td><strong>Eliminacao</strong></td><td>Solicitar a eliminacao dos dados pessoais tratados com base no consentimento</td><td>Art. 18, VI</td></tr>
                <tr><td><strong>Informacao sobre compartilhamento</strong></td><td>Ser informado sobre as entidades com as quais o Controlador realizou uso compartilhado de dados</td><td>Art. 18, VII</td></tr>
                <tr><td><strong>Informacao sobre consentimento</strong></td><td>Ser informado sobre a possibilidade de nao fornecer consentimento e sobre as consequencias da negativa</td><td>Art. 18, VIII</td></tr>
                <tr><td><strong>Revogacao do consentimento</strong></td><td>Revogar o consentimento a qualquer tempo, mediante manifestacao expressa</td><td>Art. 18, IX</td></tr>
              </tbody>
            </table>
            <p>
              10.2. <strong>Como exercer seus direitos:</strong> o Titular podera exercer seus direitos enviando
              requisicao ao Encarregado pelo e-mail <strong>privacidade@gravity.com.br</strong>, indicando nome
              completo, e-mail cadastrado na Plataforma, o direito que deseja exercer e descricao detalhada da
              solicitacao.
            </p>
            <p>
              10.3. A DATI respondera as requisicoes do Titular no prazo de ate <strong>15 (quinze) dias uteis</strong> contados
              do recebimento da requisicao, conforme art. 18, §5 da LGPD.
            </p>
            <p>10.4. O Titular tem o direito de peticionar a ANPD caso considere que o tratamento de seus dados pessoais viola a LGPD (art. 18, §1).</p>
          </section>

          <section>
            <h2>11. Tratamento de Dados de Menores</h2>
            <p>
              11.1. A Plataforma e destinada exclusivamente a maiores de 18 (dezoito) anos ou emancipados. A DATI nao
              coleta intencionalmente dados pessoais de criancas ou adolescentes.
            </p>
            <p>
              11.2. Caso a DATI tome conhecimento de que coletou dados pessoais de menor de 18 anos sem a devida
              autorizacao, adotara as medidas necessarias para a eliminacao imediata desses dados, conforme art. 14
              da LGPD.
            </p>
          </section>

          <section>
            <h2>12. Inteligencia Artificial (&quot;GABI&quot;)</h2>
            <p>
              12.1. A Plataforma oferece um assistente de inteligencia artificial denominado &quot;Gabi&quot;, que utiliza
              tecnologia de processamento de linguagem natural para auxiliar o Usuario em tarefas relacionadas aos
              produtos contratados.
            </p>
            <p>12.2. O Usuario e informado que:</p>
            <ol type="a">
              <li>dados de contexto das conversas com a Gabi podem ser processados por provedores de IA (atualmente OpenAI) hospedados no exterior, conforme secao 6.1.3;</li>
              <li>o Usuario deve evitar inserir dados pessoais sensiveis ou confidenciais nas conversas com a Gabi;</li>
              <li>as respostas da Gabi possuem carater meramente informativo e nao substituem aconselhamento profissional especializado;</li>
              <li>a DATI nao se responsabiliza por decisoes tomadas com base exclusivamente em respostas geradas pela Gabi.</li>
            </ol>
            <p>12.3. Os dados de conversacao com a Gabi sao retidos pelo prazo necessario a prestacao do servico e sao tratados conforme as bases legais descritas na secao 4.</p>
          </section>

          <section>
            <h2>13. Incidentes de Seguranca</h2>
            <p>13.1. Em caso de incidente de seguranca que possa acarretar risco ou dano relevante aos Titulares, a DATI comunicara:</p>
            <ol type="a">
              <li>a Autoridade Nacional de Protecao de Dados (ANPD), em prazo razoavel, conforme art. 48 da LGPD e regulamentacao da ANPD;</li>
              <li>ao Titular, quando o incidente puder acarretar-lhe risco ou dano relevante.</li>
            </ol>
            <p>13.2. A comunicacao contera, no minimo:</p>
            <ol type="a">
              <li>a descricao da natureza dos dados pessoais afetados;</li>
              <li>as informacoes sobre os Titulares envolvidos;</li>
              <li>a indicacao das medidas tecnicas e de seguranca utilizadas para protecao dos dados;</li>
              <li>os riscos relacionados ao incidente;</li>
              <li>os motivos da demora, caso a comunicacao nao tenha sido imediata;</li>
              <li>as medidas adotadas ou a serem adotadas para reverter ou mitigar os efeitos do incidente.</li>
            </ol>
          </section>

          <section>
            <h2>14. Alteracoes nesta Politica</h2>
            <p>
              14.1. A DATI podera atualizar esta Politica a qualquer tempo para refletir mudancas nas praticas de
              tratamento de dados, novas funcionalidades da Plataforma, alteracoes legislativas ou regulatorias, ou
              decisoes da ANPD.
            </p>
            <p>
              14.2. Alteracoes substanciais serao comunicadas ao Titular por e-mail e/ou por meio de aviso destacado na
              Plataforma, com antecedencia minima de 15 (quinze) dias antes da entrada em vigor.
            </p>
            <p>14.3. O uso continuado da Plataforma apos a data de vigencia das alteracoes implica a ciencia e aceitacao da Politica atualizada.</p>
          </section>

          <section>
            <h2>15. Encarregado de Protecao de Dados (DPO)</h2>
            <p>
              15.1. A DATI designou um Encarregado de Protecao de Dados (Data Protection Officer — DPO), conforme
              art. 41 da LGPD, que e o ponto de contato entre a DATI, os Titulares de dados e a ANPD.
            </p>
            <p>
              15.2. A Encarregada designada e <strong>Marina Martins Mendes Perfetti</strong>, Diretora Juridica da
              DATI, que pode ser contatada pelo e-mail: <strong>privacidade@gravity.com.br</strong>
            </p>
            <p>15.3. As atribuicoes do Encarregado incluem:</p>
            <ol type="a">
              <li>aceitar reclamacoes e comunicacoes dos Titulares, prestar esclarecimentos e adotar providencias;</li>
              <li>receber comunicacoes da ANPD e adotar providencias;</li>
              <li>orientar os funcionarios e contratados da DATI sobre as praticas de protecao de dados pessoais;</li>
              <li>executar as demais atribuicoes determinadas pelo Controlador ou estabelecidas em normas complementares.</li>
            </ol>
          </section>

          <section>
            <h2>16. Legislacao Aplicavel e Foro</h2>
            <p>16.1. Esta Politica e regida pela legislacao da Republica Federativa do Brasil, em especial:</p>
            <ul>
              <li>Lei n. 13.709/2018 (Lei Geral de Protecao de Dados Pessoais — LGPD);</li>
              <li>Lei n. 12.965/2014 (Marco Civil da Internet);</li>
              <li>Decreto n. 8.771/2016 (regulamenta o Marco Civil da Internet);</li>
              <li>Lei n. 8.078/1990 (Codigo de Defesa do Consumidor), quando aplicavel.</li>
            </ul>
            <p>
              16.2. Fica eleito o foro da Comarca de <strong>Florianopolis, Estado de Santa Catarina</strong>, sede da
              DATI, para dirimir quaisquer controversias decorrentes desta Politica, ressalvado o foro do domicilio
              do consumidor nos casos em que a legislacao consumerista for aplicavel.
            </p>
          </section>

          <section>
            <h2>17. Glossario LGPD — Referencia Rapida</h2>
            <ul>
              <li><strong>LGPD:</strong> Lei Geral de Protecao de Dados Pessoais (Lei n. 13.709/2018), que regula o tratamento de dados pessoais no Brasil.</li>
              <li><strong>ANPD:</strong> Autoridade Nacional de Protecao de Dados, orgao responsavel pela fiscalizacao e aplicacao da LGPD.</li>
              <li><strong>Tratamento:</strong> qualquer operacao realizada com dados pessoais (da coleta a eliminacao).</li>
              <li><strong>Controlador:</strong> quem decide sobre o tratamento dos dados (a DATI).</li>
              <li><strong>Operador:</strong> quem trata dados em nome do Controlador (ex.: Clerk, Railway, Resend).</li>
              <li><strong>Encarregado (DPO):</strong> pessoa de contato entre a empresa, os titulares e a ANPD.</li>
              <li><strong>Titular:</strong> a pessoa a quem os dados se referem (o Usuario).</li>
              <li><strong>Consentimento:</strong> autorizacao livre, informada e inequivoca do Titular para tratamento de seus dados.</li>
            </ul>
          </section>

          <section>
            <h2>18. Acordo de Processamento de Dados — DPA (Data Processing Agreement)</h2>
            <p className="legal-dpa-note">
              Esta secao constitui o Acordo de Processamento de Dados entre a DATI (Operadora) e a Organizacao
              (Controladora), nos termos dos arts. 37 a 40 da LGPD, aplicavel sempre que a DATI tratar dados pessoais
              de terceiros inseridos pela Organizacao na Plataforma.
            </p>

            <h3>18.1. Objeto do DPA</h3>
            <p>
              Este DPA regula o tratamento pela DATI, na qualidade de <strong>Operadora</strong>, dos dados pessoais de
              terceiros que a Organizacao, na qualidade de <strong>Controladora</strong>, insere, armazena ou processa
              por meio da Plataforma Gravity no ambito de suas operacoes de negocio.
            </p>

            <h3>18.2. Escopo dos dados processados</h3>
            <table>
              <thead><tr><th>Categoria de dados</th><th>Exemplos tipicos no contexto de Comex</th></tr></thead>
              <tbody>
                <tr><td>Dados de identificacao</td><td>Nomes de importadores, exportadores, fornecedores, transportadores, motoristas, despachantes</td></tr>
                <tr><td>Dados de contato comercial</td><td>E-mails, telefones, enderecos comerciais de parceiros e fornecedores</td></tr>
                <tr><td>Dados documentais</td><td>CPF/CNPJ, numeros de passaporte, dados constantes em faturas comerciais, packing lists, BLs, AWBs</td></tr>
                <tr><td>Dados financeiros comerciais</td><td>Valores de operacoes, dados bancarios para fins de cambio (quando inseridos pela Organizacao)</td></tr>
              </tbody>
            </table>

            <h3>18.3. Finalidade e limitacao do tratamento</h3>
            <p>18.3.1. A DATI tratara os dados pessoais de terceiros <strong>exclusivamente</strong> para as seguintes finalidades:</p>
            <ol type="a">
              <li>armazenamento seguro na infraestrutura da Plataforma;</li>
              <li>processamento necessario para as funcionalidades contratadas pela Organizacao;</li>
              <li>backup e recuperacao de desastres;</li>
              <li>suporte tecnico, quando solicitado pela Organizacao.</li>
            </ol>
            <p>
              18.3.2. A DATI <strong>nao</strong> tratara os dados pessoais de terceiros para finalidades proprias, de
              marketing, analise agregada ou qualquer outra finalidade que nao esteja diretamente vinculada a prestacao
              do servico contratado pela Organizacao.
            </p>

            <h3>18.4. Obrigacoes da DATI como Operadora</h3>
            <p>A DATI compromete-se a:</p>
            <ol type="a">
              <li>tratar os dados pessoais de terceiros apenas segundo as instrucoes documentadas da Organizacao;</li>
              <li>garantir que as pessoas autorizadas a tratar os dados pessoais assumam compromisso de confidencialidade;</li>
              <li>adotar as medidas tecnicas e organizativas de seguranca descritas na secao 9 desta Politica;</li>
              <li>manter o isolamento logico dos dados de cada Organizacao por meio de schema-per-organization no banco de dados;</li>
              <li>nao subcontratar outro Operador para o tratamento sem autorizacao previa da Organizacao. Alteracoes na lista de sub-operadores serao comunicadas com 30 (trinta) dias de antecedencia;</li>
              <li>auxiliar a Organizacao no atendimento as requisicoes de titulares (art. 18 da LGPD) e no cumprimento de obrigacoes perante a ANPD;</li>
              <li>notificar a Organizacao, sem demora injustificada e em prazo nao superior a 72 (setenta e duas) horas, apos tomar conhecimento de qualquer incidente de seguranca;</li>
              <li>ao termino do contrato, devolver ou eliminar os dados pessoais de terceiros, salvo quando a retencao for exigida por lei;</li>
              <li>disponibilizar a Organizacao todas as informacoes necessarias para demonstrar o cumprimento das obrigacoes deste DPA, permitindo auditorias com aviso previo de 30 (trinta) dias.</li>
            </ol>

            <h3>18.5. Obrigacoes da Organizacao como Controladora</h3>
            <p>A Organizacao compromete-se a:</p>
            <ol type="a">
              <li>garantir que possui base legal adequada (art. 7 da LGPD) para o tratamento dos dados pessoais de terceiros que insere na Plataforma;</li>
              <li>informar adequadamente os titulares terceiros sobre o tratamento de seus dados;</li>
              <li>responder diretamente as requisicoes de titulares terceiros no exercicio de seus direitos (art. 18 da LGPD);</li>
              <li>fornecer a DATI instrucoes licitas e documentadas para o tratamento dos dados;</li>
              <li>nao inserir na Plataforma dados pessoais sensiveis (art. 5, II) de terceiros sem consentimento especifico e destacado do titular (art. 11);</li>
              <li>indenizar a DATI por quaisquer danos decorrentes do tratamento de dados pessoais de terceiros em desacordo com a LGPD.</li>
            </ol>

            <h3>18.6. Transferencia internacional de dados no ambito do DPA</h3>
            <p>
              Quando o tratamento dos dados pessoais de terceiros envolver transferencia internacional, aplicam-se as
              garantias descritas na secao 6.1.3 desta Politica. A Organizacao consente com a transferencia
              internacional necessaria a prestacao do servico, desde que observadas as salvaguardas previstas no
              art. 33 da LGPD.
            </p>

            <h3>18.7. Vigencia do DPA</h3>
            <p>
              Este DPA vigora pelo mesmo periodo do contrato entre a Organizacao e a DATI (Termos de Uso). As
              obrigacoes de confidencialidade e seguranca dos dados sobrevivem ao termino do contrato pelo prazo
              necessario a eliminacao completa dos dados ou pelo prazo legal de retencao, o que for maior.
            </p>

            <h3>18.8. Registro de operacoes de tratamento</h3>
            <p>
              A DATI mantera registro das operacoes de tratamento de dados pessoais realizadas na qualidade de
              Operadora, conforme art. 37 da LGPD, contendo no minimo: (i) a identificacao da Organizacao
              Controladora; (ii) as categorias de dados pessoais tratados; (iii) as finalidades do tratamento;
              (iv) os sub-operadores envolvidos; (v) as medidas de seguranca adotadas.
            </p>
          </section>

          <p className="legal-footer">
            Documento elaborado em conformidade com a Lei n. 13.709/2018 (LGPD), Lei n. 12.965/2014
            (Marco Civil da Internet), Decreto n. 8.771/2016 e demais normas aplicaveis da legislacao brasileira.
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
        .legal-doc h3 {
          font-size: 0.9375rem;
          font-weight: 600;
          margin: 1.25rem 0 0.5rem;
          color: #333;
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
        .legal-dpa-note {
          background: #f0f0ff;
          border-left: 3px solid #2d2d7f;
          padding: 0.75rem 1rem;
          border-radius: 0 4px 4px 0;
          font-style: italic;
          color: #444;
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
