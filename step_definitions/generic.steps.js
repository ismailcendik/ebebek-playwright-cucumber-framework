import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { locators } from '../support/locators.js';
import { WaitHelper } from '../utils/waitHelper.js';
import { AllureHelper } from '../utils/allureHelper.js';
import { testData } from '../fixtures/testData.js';
import { HomePage } from '../pages/HomePage.js';
import { Config } from '../utils/config.js';

/**
 * Ortak ve Yeniden Kullanılabilir Atomik Generic Step Kütüphanesi (Madde 1.3 Uyumlu)
 * "x elementine tıklanır", "y alanına z yazılır", "t metni görünür" gibi tüm atomik adımları yönetir.
 * Tüm seçiciler merkezi support/locators.js nesnesinden çözümlenir.
 */

// Helper: Element key'i locators.js nesnesinde arayıp döndüren atomik çözücü
function resolveLocator(key) {
  const normalized = key.trim().toLowerCase();

  if (normalized.includes('e-posta sekme') || normalized.includes('email tab')) return locators.login.emailTab;
  if (normalized.includes('e-posta alan') || normalized.includes('email input') || normalized.includes('e-posta')) return locators.login.emailInput;
  if (normalized.includes('şifre alan') || normalized.includes('password input') || normalized.includes('şifre')) return locators.login.passwordInput;
  if (normalized.includes('devam et') || normalized.includes('hesap oluştur buton') || normalized.includes('giriş yap hesap oluştur') || normalized.includes('giriş yap / hesap oluştur')) return locators.login.continueButton;
  if (normalized.includes('giriş yap buton')) return locators.login.loginSubmitButton;
  if (normalized.includes('cüzdan')) return locators.login.walletButton;
  if (normalized.includes('kişisel bilgi')) return locators.login.personalInfoLink;
  if (normalized.includes('arama buton') || normalized.includes('search button')) return locators.home.searchButton;
  if (normalized.includes('arama alan') || normalized.includes('arama') || normalized.includes('search input')) return locators.home.searchInput;
  if (normalized.includes('hesabım') || normalized.includes('account menu')) return locators.home.accountMenu;
  if (normalized.includes('çıkış yap') || normalized.includes('logout')) return locators.home.logoutButton;
  if (normalized.includes('ad alan') || normalized.includes('first name')) return locators.register.nameInput;
  if (normalized.includes('soyad') || normalized.includes('last name')) return locators.register.surnameInput;
  if (normalized.includes('telefon') || normalized.includes('phone')) return locators.register.phoneInput;
  if (normalized.includes('kayıt ol') || normalized.includes('register button')) return locators.register.registerSubmitButton;

  // Doğrudan locators içindeki kategorilerde ara
  for (const category of Object.values(locators)) {
    if (category[key]) return category[key];
  }
  return key; // Ham CSS/ID seçici varsa doğrudan dön
}

// Helper: Element key'den Playwright Locator nesnesi çözen atomik DRY yardımcı
function getLocator(page, key) {
  const sel = resolveLocator(key);
  return page.locator(sel).first();
}

// ============================================================================
// 1. ATOMİK GENERIC NAVİGASYON ADIMLARI
// ============================================================================

Given('kullanıcı {string} sayfasına gider', async function (pageName) {
  await AllureHelper.step(`Sayfaya Yönlenme: "${pageName}"`, async () => {
    let path = pageName.startsWith('/') ? pageName : `/${pageName}`;
    const name = pageName.toLowerCase();
    if (name === 'login' || name === 'giriş') path = Config.routes.login;
    else if (name === 'sepet' || name === 'cart') path = Config.routes.cart;
    else if (name.includes('account') || name.includes('hesabım')) path = Config.routes.myAccount;

    await this.page.goto(path);
    await WaitHelper.waitForPageLoad(this.page);
    const cookieBtn = this.page.locator(locators.base.cookieAcceptButton);
    if (await cookieBtn.isVisible().catch(() => false)) {
      await cookieBtn.click().catch(() => { });
    }
  });
});

Given('kullanıcı ana sayfaya gider', async function () {
  await new HomePage(this.page).openHomePage();
});

// ============================================================================
// 2. ATOMİK GENERIC TIKLAMA ADIMLARI (MADDE 1.3 UYUMU - BIRLEŞTİRİLMİŞ STEP)
// ============================================================================

When(/(?:kullanıcı )?"([^"]+)" tıklar/, async function (elementKey) {
  await AllureHelper.step(`Generic Tıklama: "${elementKey}"`, async () => {
    const el = getLocator(this.page, elementKey);
    const keyLower = elementKey.toLowerCase();

    if (keyLower.includes('cüzdan') || keyLower.includes('wallet')) {
      await el.waitFor({ state: 'attached', timeout: 15000 });
      await el.evaluate(e => e.click()).catch(async () => {
        await el.click({ force: true });
      });
    } else if (keyLower.includes('giriş yap buton')) {
      await el.waitFor({ state: 'attached', timeout: 10000 });
      const tokenPromise = this.page.waitForResponse(
        res => res.url().includes('/oauth/token'),
        { timeout: 15000 }
      ).catch(() => null);
      await el.click({ force: true }).catch(async () => {
        await el.evaluate(e => e.click()).catch(() => { });
      });
      await tokenPromise;
    } else {
      await el.waitFor({ state: 'visible', timeout: 10000 });
      await el.click();
    }
  });
});

// ============================================================================
// 3. ATOMİK GENERIC YAZMA ADIMLARI (MADDE 1.3 UYUMU)
// ============================================================================

When('kullanıcı {string} {string} yazar', async function (elementKey, rawValue) {
  await AllureHelper.step(`Generic Yazma: "${elementKey}" -> "${rawValue}"`, async () => {
    let finalVal = rawValue;
    if (rawValue === 'valid_email') finalVal = testData.validUser.email;
    else if (rawValue === 'valid_password') finalVal = testData.validUser.password;

    const input = getLocator(this.page, elementKey);
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.fill(finalVal);
  });
});

// ============================================================================
// 4. ATOMİK GENERIC DOĞRULAMA ADIMLARI (ASSERTIONS - MADDE 1.3 UYUMU)
// ============================================================================

Then('{string} elemanının görünür olduğu doğrulanır', async function (elementKey) {
  await AllureHelper.step(`Generic Görünürlük Kontrolü: "${elementKey}"`, async () => {
    const el = getLocator(this.page, elementKey);
    await expect(el).toBeVisible({ timeout: 10000 });
  });
});

Then('{string} metninin görünür olduğu kontrol edilir', async function (expectedText) {
  await AllureHelper.step(`Generic Metin Görünürlük Kontrolü: "${expectedText}"`, async () => {
    const textLocator = this.page.locator(`text="${expectedText}"`).first();
    await expect(textLocator).toBeVisible({ timeout: 10000 });
  });
});
