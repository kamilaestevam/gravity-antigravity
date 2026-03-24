const fs = require('fs');
const path = require('path');

function processFile(filePath, replacements) {
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
  console.log('Updated ' + filePath);
}

const baseDir = 'c:\\Users\\danie\\OneDrive\\Documents\\Antigravity\\2. Gravity';

// 6. SKILLs and Docs
processFile(path.join(baseDir, 'skills/infra-estrutura/configurador/SKILL.md'), [
  { regex: true, from: /empresa mãe e empresas filhas/gi, to: 'organização e espaços de trabalho' },
  { regex: true, from: /empresa mãe/gi, to: 'organização' },
  { regex: true, from: /empresa filha/gi, to: 'espaço de trabalho' },
  { regex: true, from: /empresas filhas/gi, to: 'espaços de trabalho' }
]);

processFile(path.join(baseDir, 'skills/infra-estrutura/admin/SKILL.md'), [
  { regex: true, from: /empresa mãe/gi, to: 'organização' },
  { regex: true, from: /empresas filhas/gi, to: 'espaços de trabalho' },
  { regex: true, from: /quantidade de filiais/gi, to: 'quantidade de espaços' }
]);

processFile(path.join(baseDir, 'skills/ux/tooltip/SKILL.md'), [
  { regex: true, from: /EmpresaMae\.tsx/g, to: 'Organizacao.tsx' },
  { regex: true, from: /Empresa filha/gi, to: 'Espaço de trabalho' },
  { regex: true, from: /empresas filhas/gi, to: 'espaços de trabalho' },
  { regex: true, from: /Filial/g, to: 'Espaço' },
  { regex: true, from: /filial/g, to: 'espaço' }
]);

// 7. Tests - tenants.test.ts
processFile(path.join(baseDir, 'testes/testes-funcionais/configurador/tenants.test.ts'), [
  { regex: true, from: /empresas filhas/gi, to: 'espaços de trabalho' },
  { regex: true, from: /empresa filha/gi, to: 'espaço de trabalho' },
  { regex: true, from: /Filial/g, to: 'Espaço' }
]);

// 8. Tests - users.test.ts
processFile(path.join(baseDir, 'testes/testes-funcionais/configurador/users.test.ts'), [
  { regex: true, from: /empresas filhas/gi, to: 'espaços de trabalho' },
  { regex: true, from: /empresa filha/gi, to: 'espaço de trabalho' }
]);

// 9. Tests - plano-de-testes.md
processFile(path.join(baseDir, 'testes/testes-e2e/configurador/plano-de-testes.md'), [
  { regex: true, from: /empresas filhas/gi, to: 'espaços de trabalho' },
  { regex: true, from: /empresa filha/gi, to: 'espaço de trabalho' }
]);

console.log('Docs and Tests refactored.');
