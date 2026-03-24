const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\danie\\OneDrive\\Documents\\Antigravity\\2. Gravity\\servicos-global\\configurador\\src\\pages\\workspace';

function processFile(filename, replacements) {
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  for (let r of replacements) {
    if (r.regex) {
      content = content.replace(r.from, r.to);
    } else {
      content = content.split(r.from).join(r.to);
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + filename);
}

// 1. Organizacao.tsx (re-run as some changes might have been missed due to previous missing regex 'g' flag, wait, I used /g before)
processFile('Organizacao.tsx', [
  { regex: true, from: /EmpresaMae/g, to: 'Organizacao' },
  { regex: true, from: /Empresa Mãe/g, to: 'Organização' },
  { regex: true, from: /EMPRESAS_FILHAS_MOCK/g, to: 'ESPACOS_TRABALHO_MOCK' },
  { regex: true, from: /Empresa Filha/g, to: 'Espaço de Trabalho' },
  { regex: true, from: /Empresa filha/g, to: 'Espaço de Trabalho' },
  { regex: true, from: /empresa filha/g, to: 'espaço de trabalho' },
  { regex: true, from: /empresa-filha-ativa/g, to: 'espaco-trabalho-ativo' },
  { regex: true, from: /OPCOES_FILHAS/g, to: 'OPCOES_ESPACOS' },
  { regex: true, from: /filhaInicial/g, to: 'espacoInicial' },
  { regex: true, from: /filhaAtivaId/g, to: 'espacoAtivoId' },
  { regex: true, from: /filhaAtiva/g, to: 'espacoAtivo' },
  { regex: true, from: /dirtyFilha/g, to: 'dirtyEspaco' },
  { regex: true, from: /resetFilha/g, to: 'resetEspaco' },
  { regex: true, from: /em-filha/g, to: 'em-espaco' }
]);

// 2. EspacosDeTrabalho.tsx
processFile('EspacosDeTrabalho.tsx', [
  { regex: true, from: /Empresas/g, to: 'EspacosDeTrabalho' },
  { regex: true, from: /Empresas Filhas/g, to: 'Espaços de Trabalho' },
  { regex: true, from: /Empresa Filha/g, to: 'Espaço de Trabalho' },
  { regex: true, from: /Empresa filial/g, to: 'Espaço de Trabalho' },
  { regex: true, from: /empresa filial/g, to: 'espaço de trabalho' },
  { regex: true, from: /Nova Filial/g, to: 'Novo Espaço' },
  { regex: true, from: /Filial/g, to: 'Espaço de Trabalho' },
  { regex: true, from: /filial/g, to: 'espaço de trabalho' },
  { regex: true, from: /TabelaEmpresas/g, to: 'TabelaEspacosTrabalho' },
  { regex: true, from: /em-filha/g, to: 'em-espaco' },
  { regex: true, from: /TabelaEspacosTrabalho/g, to: 'TabelaEspacosTrabalho' }, // Correct any over-replacements if any
  { regex: true, from: /TabelaEspaco de Trabalhos/g, to: 'TabelaEspacosTrabalho' }
]);

// 3. TabelaEspacosTrabalho.tsx
processFile('TabelaEspacosTrabalho.tsx', [
  { regex: true, from: /TabelaEmpresas/g, to: 'TabelaEspacosTrabalho' },
  { regex: true, from: /Empresas Filhas/g, to: 'Espaços de Trabalho' },
  { regex: true, from: /Empresa Filha/g, to: 'Espaço de Trabalho' },
  { regex: true, from: /Empresa filial/g, to: 'Espaço de Trabalho' },
  { regex: true, from: /empresa filial/g, to: 'espaço de trabalho' },
  { regex: true, from: /Filial|filiais/g, to: 'Espaço de Trabalho' },
  { regex: true, from: /filial/gi, to: 'espaço de trabalho' }
]);

// 4. Usuarios.tsx
processFile('Usuarios.tsx', [
  { regex: true, from: /Filial/g, to: 'EspacoTrabalho' },
  { regex: true, from: /filiais/g, to: 'espacos' },
  { regex: true, from: /mockFiliais/g, to: 'mockEspacos' },
  { regex: true, from: /empresasDoUsuario/g, to: 'espacosDoUsuario' },
  { regex: true, from: /Acesso por Empresa Filha/g, to: 'Acesso por Espaço de Trabalho' },
  { regex: true, from: /acesso-por-empresa-filha/g, to: 'acesso-por-espaco-trabalho' },
  { regex: true, from: /empresa filha/g, to: 'espaço de trabalho' }
]);

// 5. workspace.css
processFile('workspace.css', [
  { regex: true, from: /Empresa Mãe/g, to: 'Organização' },
  { regex: true, from: /EmpresaMae/g, to: 'Organizacao' },
  { regex: true, from: /em-filha/g, to: 'em-espaco' }
]);

console.log('Done others');
