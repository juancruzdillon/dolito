import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('--- BALLANZ ---');
  await page.goto('https://balanz.com/comisiones/');
  await page.waitForTimeout(3000);
  
  // get all text that has '%' inside
  const textBalanz = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*'))
      .filter(el => el.children.length === 0 && el.textContent.includes('%'))
      .map(el => el.textContent.trim())
      .join('\n');
  });
  console.log('Balanz percentages found:', textBalanz);

  console.log('--- BULL MARKET ---');
  await page.goto('https://help.bullmarketbrokers.com/guia/comisiones/');
  await page.waitForTimeout(3000);
  
  // extract table contents
  const tableBull = await page.evaluate(() => {
    const table = document.querySelector('table');
    if (!table) return 'No table found';
    return Array.from(table.rows).map(row => 
      Array.from(row.cells).map(c => c.textContent.trim()).join(' | ')
    ).join('\n');
  });
  console.log('Bull Market table:', tableBull);

  await browser.close();
})();
