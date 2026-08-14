#!/usr/bin/env node
/**
 * Bir defelik skript: standart Angular TestBed boilerplate-e malik
 * spec fayllarina avtomatik olaraq provideTestingDependencies() elave edir.
 *
 * Isletme: apps/frontend qovluğunda: node fix-specs.mjs
 */

const fs = require('fs');
const path = require('path');

const files = [
  'src/app/pages/accounts/accounts.spec.ts',
  'src/app/pages/card-detail/card-detail.spec.ts',
  'src/app/pages/transaction-detail/transaction-detail.spec.ts',
  'src/app/pages/dashboard/dashboard.spec.ts',
  'src/app/pages/transactions/transactions.spec.ts',
  'src/app/layout/components/sidebar/sidebar.spec.ts',
  'src/app/layout/components/main-layout/main-layout.spec.ts',
  'src/app/shared/components/exchange-rates/exchange-rates.spec.ts',
  'src/app/pages/notifications/notifications.spec.ts',
  'src/app/pages/transfers/transfers.spec.ts',
  'src/app/pages/transfer-to-user/transfer-to-user.spec.ts',
  'src/app/pages/payments/payments.spec.ts',
  'src/app/layout/components/header/header.spec.ts',
  'src/app/pages/templates/templates.spec.ts',
];

const testingHelperAbsPath = path.resolve('src/testing/test-providers.ts');

let patched = 0;
let skipped = [];

for (const relFile of files) {
  const absFile = path.resolve(relFile);
  if (!fs.existsSync(absFile)) {
    skipped.push(`${relFile} (fayl tapilmadi)`);
    continue;
  }

  let content = fs.readFileSync(absFile, 'utf8');

  if (content.includes('provideTestingDependencies')) {
    skipped.push(`${relFile} (artiq patch olunub)`);
    continue;
  }

  // Import path-i hesabla (spec faylindan testing/test-providers.ts-e nisbeten)
  const specDir = path.dirname(absFile);
  let relImport = path.relative(specDir, testingHelperAbsPath.replace(/\.ts$/, ''));
  if (!relImport.startsWith('.')) relImport = './' + relImport;
  relImport = relImport.split(path.sep).join('/');

  // 1) Import setirini elave et (ilk import-dan sonra)
  const importStatement = `import { provideTestingDependencies } from '${relImport}';\n`;
  const firstImportMatch = content.match(/^import .+;\n/);
  if (!firstImportMatch) {
    skipped.push(`${relFile} (import setiri tapilmadi, elle bax)`);
    continue;
  }
  const insertAt = content.indexOf('\n\n', firstImportMatch.index) + 1;
  content = content.slice(0, insertAt) + importStatement + content.slice(insertAt);

  // 2) providers: [...] elave et, `}).compileComponents();`-den evvel
  const configureRegex =
    /(TestBed\.configureTestingModule\(\{[\s\S]*?)(\n\s*\}\)\.compileComponents\(\);)/;
  if (!configureRegex.test(content)) {
    skipped.push(`${relFile} (configureTestingModule pattern tapilmadi, elle bax)`);
    continue;
  }
  content = content.replace(configureRegex, (match, before, after) => {
    // eger artiq providers varsa, elave etme
    if (/providers\s*:/.test(before)) return match;
    const trimmedBefore = before.replace(/,?\s*$/, ',');
    return `${trimmedBefore}\n      providers: [provideTestingDependencies()],${after}`;
  });

  fs.writeFileSync(absFile, content, 'utf8');
  patched++;
  console.log(`✔ Patch olundu: ${relFile}`);
}

console.log(`\n${patched} fayl patch olundu.`);
if (skipped.length) {
  console.log(`\nAtlanan fayllar:`);
  skipped.forEach((f) => console.log(`  - ${f}`));
}
