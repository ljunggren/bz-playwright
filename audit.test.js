const { test, expect, chromium } = require('@playwright/test');

// test('在有头模式下运行测试', async () => {
//   // 使用 chromium 启动有头模式
//   const browser = await chromium.launch({ headless: false });
//   const context = await browser.newContext();
//   const page = await context.newPage();

//   // 打开 Google 页面
//   await page.goto('https://www.google.com');
  
//   // 验证页面加载
//   const searchBox = page.locator('textarea.gLFyf');
//   await searchBox.fill('Playwright');
//   await searchBox.press('Enter');
  
//   // 等待搜索结果
//   await page.waitForSelector('#search');
  
//   await browser.close();
// });


test('在有头模式下运行测试', async () => {
  // 使用 chromium 启动有头模式
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 打开 Google 页面
  await page.goto('https://demov8.auditdashboard.com/Users');
  
  // 验证页面加载
  let name = page.locator('input[name=email]').nth(0);
  await name.fill('wensheng.li@boozang.com');
  let pwd = page.locator('input[type=password]').nth(0);
  await pwd.fill('Audit@123456');
  let btn = page.locator("button.loginBtn");
  await btn.click();
  // 等待搜索结果
  await page.waitForSelector("button[data-modal=Users_NewUser]");
  btn = page.locator("button[data-modal=Users_NewUser]");
  await btn.click();
  await page.waitForTimeout(5000);

  name= page.locator('input[placeholder="-- Select Company --"]');
  await name.fill("lws")

  name= page.locator('input[name="Info.Email"]');
  await name.fill("lws@test.com")

  name= page.locator('input[name="Info.FirstName"]');
  await name.fill("lws1")

  name= page.locator('input[name="Info.LastName"]');
  await name.fill("lws2")

  btn = page.locator('button[form="frmNewUser"]');
  await btn.click()

  await page.waitForSelector("input[data-modal=lws]")
  await browser.close();
});

