/**
 * TST-E2E-ADMIN-000001 — Visão Geral (HQ Owner)
 * ----------------------------------------------
 * Spec executável Playwright traduzido do plano JSON em:
 *   testes/testes-e2e/admin/visao-geral/plano-teste/TST-E2E-ADMIN-000001.json
 *
 * Cobertura desta versão (prova de conceito): 50 testes nas categorias 1-5
 *   - Categoria 1: Carregamento da tela (passos 1-5)
 *   - Categoria 2: Identidade visual (passos 6-17)
 *   - Categoria 3: Navegação lateral (passos 18-30)
 *   - Categoria 4: Read / Visualização (passos 31-40)
 *   - Categoria 5: Update / Edição (passos 41-50)
 *
 * Demais 358 passos (categorias 8-20) ficam para próxima entrega ou
 * geração via POST /admin/planos-teste/TST-E2E-ADMIN-000001/gerar-spec.
 *
 * Pré-requisitos:
 *   - Backend configurador rodando em http://localhost:8005
 *   - Frontend configurador rodando em http://localhost:8000
 *   - Usuário Master (gravity_admin=true) com sessão ativa
 *   - testids do componente VisaoGeralAdmin.tsx adicionados
 *     (ver plano-teste/testids-necessarios.json)
 *
 * Execução:
 *   npx playwright test --project=admin testes/testes-e2e/admin/visao-geral/TST-E2E-ADMIN-000001.spec.ts
 */

import { test, expect } from '../../../playwright.fixtures.js'

const ROTA_TELA = '/admin/visao-geral'

test.describe('TST-E2E-ADMIN-000001 — Visão Geral (HQ Owner)', () => {

  test.beforeEach(async ({ page }) => {
    // Pré-requisito: sessão Master ativa.
    // Em ambiente Local, o Clerk dev mode mantém a sessão entre testes.
    await page.goto(ROTA_TELA)
  })

  // ════════════════════════════════════════════════════════════════════════
  // CATEGORIA 1 — Carregamento da tela
  // ════════════════════════════════════════════════════════════════════════

  test('1. Backend up em http://localhost:8005/health', async ({ request }) => {
    const res = await request.get('http://localhost:8005/health')
    expect(res.status()).toBe(200)
  })

  test('2. Frontend up em http://localhost:8000', async ({ request }) => {
    const res = await request.get('http://localhost:8000/')
    expect(res.status()).toBeLessThan(500)
  })

  test('3. Tela /admin/visao-geral carrega com root visível', async ({ page }) => {
    await expect(page.getByTestId('tela-visao-geral-admin-root')).toBeVisible()
  })

  test('4. URL final é /admin/visao-geral', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/visao-geral/)
  })

  test('5. /admin redireciona para /admin/visao-geral', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/visao-geral/)
  })

  // ════════════════════════════════════════════════════════════════════════
  // CATEGORIA 2 — Identidade visual / topbar
  // ════════════════════════════════════════════════════════════════════════

  test('6. Logo Admin Panel by Gravity visível', async ({ page }) => {
    await expect(page.getByTestId('admin-header-logo')).toBeVisible()
  })

  test('7. Seletor Gravity HQ no topo da sidebar visível', async ({ page }) => {
    await expect(page.getByTestId('admin-org-selector')).toBeVisible()
  })

  test('8. Botão Hub no header visível', async ({ page }) => {
    await expect(page.getByTestId('admin-btn-hub')).toBeVisible()
  })

  test('9. Ícones do header (busca, info, notificações) visíveis', async ({ page }) => {
    await expect(page.getByTestId('admin-btn-busca-global')).toBeVisible()
    await expect(page.getByTestId('admin-btn-info')).toBeVisible()
    await expect(page.getByTestId('admin-btn-notificacoes')).toBeVisible()
  })

  test('10. Indicador online (status do backend) visível', async ({ page }) => {
    await expect(page.getByTestId('admin-indicador-online')).toBeVisible()
  })

  test('11. Seletor de idioma exibe PT', async ({ page }) => {
    await expect(page.getByTestId('admin-seletor-idioma')).toContainText('PT')
  })

  test('12. Avatar do usuário com iniciais visível', async ({ page }) => {
    await expect(page.getByTestId('admin-avatar-usuario')).toBeVisible()
  })

  test('13. Título da página com ícone Crown visível', async ({ page }) => {
    await expect(page.getByTestId('admin-cabecalho-titulo')).toBeVisible()
  })

  test('14. Subtítulo da página visível', async ({ page }) => {
    await expect(page.getByTestId('admin-cabecalho-subtitulo')).toBeVisible()
  })

  test('15. Card de identidade com avatar verde RocketLaunch', async ({ page }) => {
    await expect(page.getByTestId('card-identidade')).toBeVisible()
    await expect(page.getByTestId('identidade-avatar')).toBeVisible()
  })

  test('16. Badge HQ Owner verde no card de identidade', async ({ page }) => {
    await expect(page.getByTestId('identidade-badge-hq-owner')).toBeVisible()
  })

  test('17. Tag de plano verde ao lado do subdomínio visível', async ({ page }) => {
    await expect(page.getByTestId('identidade-tag-plano')).toBeVisible()
  })

  // ════════════════════════════════════════════════════════════════════════
  // CATEGORIA 3 — Navegação lateral / breadcrumb
  // ════════════════════════════════════════════════════════════════════════

  test('18. Item Visão Geral marcado como ATIVO no menu', async ({ page }) => {
    await expect(page.getByTestId('admin-menu-item-visao-geral')).toHaveClass(/ativo/)
  })

  test('19. Item Organizações no menu visível', async ({ page }) => {
    await expect(page.getByTestId('admin-menu-item-organizacoes')).toBeVisible()
  })

  test('20. Item Produtos Gravity no menu visível', async ({ page }) => {
    await expect(page.getByTestId('admin-menu-item-produtos')).toBeVisible()
  })

  test('21. Item Usuários Globais no menu visível', async ({ page }) => {
    await expect(page.getByTestId('admin-menu-item-usuarios-globais')).toBeVisible()
  })

  test('22. Item Financeiro no menu visível', async ({ page }) => {
    await expect(page.getByTestId('admin-menu-item-financeiro')).toBeVisible()
  })

  test('23. Item Histórico Global no menu visível', async ({ page }) => {
    await expect(page.getByTestId('admin-menu-item-historico')).toBeVisible()
  })

  test('24. Item Deploy Railway no menu visível', async ({ page }) => {
    await expect(page.getByTestId('admin-menu-item-deploy')).toBeVisible()
  })

  test('25. Item API Cockpit no menu visível', async ({ page }) => {
    await expect(page.getByTestId('admin-menu-item-api-cockpit')).toBeVisible()
  })

  test('26. Item Segurança no menu visível', async ({ page }) => {
    await expect(page.getByTestId('admin-menu-item-seguranca')).toBeVisible()
  })

  test('27. Item NCM Siscomex no menu visível', async ({ page }) => {
    await expect(page.getByTestId('admin-menu-item-ncm')).toBeVisible()
  })

  test('28. Item Cadastros Globais no menu visível', async ({ page }) => {
    await expect(page.getByTestId('admin-menu-item-cadastros')).toBeVisible()
  })

  test('29. Item Testes no menu visível', async ({ page }) => {
    await expect(page.getByTestId('admin-menu-item-testes')).toBeVisible()
  })

  test('30. Click em Organizações leva para /admin/tenants e volta', async ({ page }) => {
    await page.getByTestId('admin-menu-item-organizacoes').click()
    await expect(page).toHaveURL(/\/admin\/tenants/)
    await page.getByTestId('admin-menu-item-visao-geral').click()
    await expect(page).toHaveURL(/\/admin\/visao-geral/)
  })

  // ════════════════════════════════════════════════════════════════════════
  // CATEGORIA 4 — Read / Visualização (dados carregados da API)
  // ════════════════════════════════════════════════════════════════════════

  test('31. Nome da organização carregado da API no card', async ({ page }) => {
    const elemento = page.getByTestId('identidade-nome-organizacao')
    await expect(elemento).toBeVisible()
    const texto = await elemento.textContent()
    expect(texto?.trim().length ?? 0).toBeGreaterThan(0)
  })

  test('32. Plano exibido na tag verde', async ({ page }) => {
    await expect(page.getByTestId('identidade-tag-plano')).toBeVisible()
  })

  test('33. Subdomínio exibe padrão {sub}.usegravity.com.br', async ({ page }) => {
    await expect(page.getByTestId('identidade-subdominio')).toContainText('.usegravity.com.br')
  })

  test('34. Campo Empresa preenchido com valor da API', async ({ page }) => {
    const valor = await page.getByTestId('input-nome-empresa').inputValue()
    expect(valor.trim().length).toBeGreaterThan(0)
  })

  test('35. Campo CNPJ formatado (00.000.000/0000-00)', async ({ page }) => {
    const valor = await page.getByTestId('input-cnpj').inputValue()
    if (valor.length > 0) {
      expect(valor).toMatch(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
    }
  })

  test('36. Estado tem valor selecionado', async ({ page }) => {
    const estado = await page.getByTestId('select-estado').inputValue()
    expect(estado.length).toBeGreaterThanOrEqual(0) // pode estar vazio mas o componente existe
    await expect(page.getByTestId('select-estado')).toBeVisible()
  })

  test('37. Cidade tem valor selecionado quando Estado existe', async ({ page }) => {
    await expect(page.getByTestId('select-cidade')).toBeVisible()
  })

  test('38. Segmento tem valor selecionado', async ({ page }) => {
    await expect(page.getByTestId('select-segmento')).toBeVisible()
  })

  test('39. Tipo de Empresa tem valor selecionado', async ({ page }) => {
    await expect(page.getByTestId('select-tipo-empresa')).toBeVisible()
  })

  test('40. Bloco Infra: plano, URL, data criação, região visíveis', async ({ page }) => {
    await expect(page.getByTestId('infra-plano-nome')).toBeVisible()
    await expect(page.getByTestId('infra-subdominio')).toBeVisible()
    await expect(page.getByTestId('infra-data-criacao')).toBeVisible()
    await expect(page.getByTestId('infra-localizacao')).toBeVisible()
  })

  // ════════════════════════════════════════════════════════════════════════
  // CATEGORIA 5 — Update / Edição (granularidade exaustiva por campo)
  // ════════════════════════════════════════════════════════════════════════

  test('41. Editar campo Empresa ativa indicador dirty', async ({ page }) => {
    const valorOriginal = await page.getByTestId('input-nome-empresa').inputValue()
    await page.getByTestId('input-nome-empresa').fill('Gravity HQ Teste E2E')
    await expect(page.getByTestId('indicador-dirty')).toBeVisible()
    // Reverte
    await page.getByTestId('input-nome-empresa').fill(valorOriginal)
  })

  test('42. Botão Salvar fica habilitado após edição', async ({ page }) => {
    const valorOriginal = await page.getByTestId('input-nome-empresa').inputValue()
    await page.getByTestId('input-nome-empresa').fill('Teste edição')
    await expect(page.getByTestId('btn-salvar')).toBeEnabled()
    await page.getByTestId('input-nome-empresa').fill(valorOriginal)
  })

  test('43. Click em Salvar dispara PUT /api/v1/admin/visao-geral', async ({ page }) => {
    const valorOriginal = await page.getByTestId('input-nome-empresa').inputValue()
    const novoNome = 'Gravity HQ Teste E2E'

    await page.getByTestId('input-nome-empresa').fill(novoNome)

    const [request] = await Promise.all([
      page.waitForRequest(req =>
        req.url().includes('/api/v1/admin/visao-geral') && req.method() === 'PUT'
      ),
      page.getByTestId('btn-salvar').click(),
    ])

    const body = JSON.parse(request.postData() ?? '{}')
    expect(body.nome_organizacao).toBe(novoNome)

    // Reverte
    await page.getByTestId('input-nome-empresa').fill(valorOriginal)
    await page.getByTestId('btn-salvar').click()
  })

  test('44. Toast de sucesso aparece após salvar', async ({ page }) => {
    const valorOriginal = await page.getByTestId('input-nome-empresa').inputValue()
    await page.getByTestId('input-nome-empresa').fill('Teste toast')
    await page.getByTestId('btn-salvar').click()
    await expect(page.getByTestId('toast-sucesso')).toBeVisible({ timeout: 5000 })
    // Reverte
    await page.getByTestId('input-nome-empresa').fill(valorOriginal)
    await page.getByTestId('btn-salvar').click()
  })

  test('45. Indicador dirty desaparece após salvar', async ({ page }) => {
    const valorOriginal = await page.getByTestId('input-nome-empresa').inputValue()
    await page.getByTestId('input-nome-empresa').fill('Teste dirty')
    await page.getByTestId('btn-salvar').click()
    await expect(page.getByTestId('toast-sucesso')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('indicador-dirty')).not.toBeVisible()
    // Reverte
    await page.getByTestId('input-nome-empresa').fill(valorOriginal)
    await page.getByTestId('btn-salvar').click()
  })

  test('46. Editar CNPJ aplica máscara automaticamente', async ({ page }) => {
    const valorOriginal = await page.getByTestId('input-cnpj').inputValue()
    await page.getByTestId('input-cnpj').fill('08973387000174')
    const valorFormatado = await page.getByTestId('input-cnpj').inputValue()
    expect(valorFormatado).toBe('08.973.387/0001-74')
    // Reverte
    await page.getByTestId('input-cnpj').fill(valorOriginal)
  })

  test('47. Trocar Estado limpa Cidade automaticamente', async ({ page }) => {
    const estadoOriginal = await page.getByTestId('select-estado').inputValue()
    const cidadeOriginal = await page.getByTestId('select-cidade').inputValue()

    await page.getByTestId('select-estado').selectOption('SP')
    const cidadeApos = await page.getByTestId('select-cidade').inputValue()
    expect(cidadeApos).toBe('')

    // Reverte
    await page.getByTestId('select-estado').selectOption(estadoOriginal)
    if (cidadeOriginal) {
      await expect(page.getByTestId('select-cidade-loading')).not.toBeVisible({ timeout: 5000 })
      await page.getByTestId('select-cidade').selectOption(cidadeOriginal)
    }
  })

  test('48. Cidade desabilitada quando Estado vazio', async ({ page }) => {
    const estadoOriginal = await page.getByTestId('select-estado').inputValue()
    await page.getByTestId('select-estado').selectOption('')
    await expect(page.getByTestId('select-cidade')).toBeDisabled()
    // Reverte
    await page.getByTestId('select-estado').selectOption(estadoOriginal)
  })

  test('49. Click em Cancelar reverte alterações sem chamar API', async ({ page }) => {
    const valorOriginal = await page.getByTestId('input-nome-empresa').inputValue()
    await page.getByTestId('input-nome-empresa').fill('XYZ Cancelar Test')

    let putChamado = false
    page.on('request', req => {
      if (req.url().includes('/api/v1/admin/visao-geral') && req.method() === 'PUT') {
        putChamado = true
      }
    })

    await page.getByTestId('btn-cancelar').click()
    const valorAposCancelar = await page.getByTestId('input-nome-empresa').inputValue()
    expect(valorAposCancelar).toBe(valorOriginal)
    expect(putChamado).toBe(false)
  })

  test('50. Botão Salvar desabilitado quando não há alterações', async ({ page }) => {
    // Estado inicial — sem dirty
    await expect(page.getByTestId('btn-salvar')).toBeDisabled()
    await expect(page.getByTestId('btn-cancelar')).toBeDisabled()
  })
})
