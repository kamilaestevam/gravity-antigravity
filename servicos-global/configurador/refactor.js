const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\danie\\OneDrive\\Documents\\Antigravity\\2. Gravity\\servicos-global\\configurador\\src\\pages\\workspace';

function processFile(filename, replacements) {
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  for (let r of replacements) {
    content = content.replace(r.from, r.to);
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + filename);
}

// 2. EspacosDeTrabalho.tsx
processFile('EspacosDeTrabalho.tsx', [
  { from: /Empresas/g, to: 'EspacosDeTrabalho' },
  { from: /Empresas Filhas/g, to: 'Espaços de Trabalho' },
  { from: /Empresa Filha/g, to: 'Espaço de Trabalho' },
  { from: /Empresa filial/g, to: 'Espaço de Trabalho' },
  { from: /empresa filial/g, to: 'espaço de trabalho' },
  { from: /Nova Filial/g, to: 'Novo Espaço' },
  { from: /Filial/g, to: 'Espaço' },
  { from: /filial/g, to: 'espaço' },
  { from: /TabelaEmpresas/g, to: 'TabelaEspacosTrabalho' },
  { from: /em-filha/g, to: 'em-espaco' }
]);

// 3. TabelaEspacosTrabalho.tsx
processFile('TabelaEspacosTrabalho.tsx', [
  { from: /TabelaEmpresas/g, to: 'TabelaEspacosTrabalho' },
  { from: /Empresas Filhas/g, to: 'Espaços de Trabalho' },
  { from: /Empresa Filha/g, to: 'Espaço de Trabalho' },
  { from: /Empresa filial/g, to: 'Espaço de Trabalho' },
  { from: /empresa filial/g, to: 'espaço de trabalho' },
  { from: /Filial/g, to: 'Espaço' },
  { from: /filial/g, to: 'espaço' }
]);

// 4. Usuarios.tsx
processFile('Usuarios.tsx', [
  { from: /Filial/g, to: 'EspacoTrabalho' },
  { from: /filiais/g, to: 'espacos' },
  { from: /mockFiliais/g, to: 'mockEspacos' },
  { from: /empresasDoUsuario/g, to: 'espacosDoUsuario' },
  { from: /Acesso por Empresa Filha/g, to: 'Acesso por Espaço de Trabalho' },
  { from: /acesso-por-empresa-filha/g, to: 'acesso-por-espaco-trabalho' },
  { from: /empresa filha/g, to: 'espaço de trabalho' }
]);

// 5. workspace.css
processFile('workspace.css', [
  { from: /Empresa Mãe/g, to: 'Organização' },
  { from: /EmpresaMae/g, to: 'Organizacao' },
  { from: /em-filha/g, to: 'em-espaco' }
]);

console.log('Done others');
