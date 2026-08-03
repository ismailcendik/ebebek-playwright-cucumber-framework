import { BasePage } from './BasePage.js';
import { Config } from '../utils/config.js';

/**
 * Giriş Sayfası (LoginPage) Page Object Sınıfı
 * Kullanıcı giriş ekranına ait aksiyonları ve eleman etkileşimlerini yönetir.
 * Rotalar 'Config.routes' üzerinden çekilir, locators.login ile etkileşime geçilir.
 */
export class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright Page nesnesi
   */
  constructor(page) {
    super(page);
  }

  /**
   * Doğrudan giriş sayfasına (/login) yönlenir ve çerezleri kabul eder.
   */
  async openLoginPage() {
    await this.navigate(Config.routes.login);
    await this.acceptCookiesIfPresent();
  }

  /**
   * E-posta sekmesine tıklar.
   */
  async selectEmailTab() {
    await this.clickElement(this.locators.login.emailTab);
  }

  /**
   * E-posta alanını doldurur.
   * @param {string} email - E-posta adresi
   */
  async enterEmail(email) {
    await this.fillInput(this.locators.login.emailInput, email);
  }

  /**
   * Devam Et / Giriş Yap / Hesap Oluştur butonuna tıklar.
   */
  async clickContinueButton() {
    await this.clickElement(this.locators.login.continueButton);
  }

  /**
   * Şifre alanını doldurur.
   * @param {string} password - Şifre
   */
  async enterPassword(password) {
    await this.fillInput(this.locators.login.passwordInput, password);
  }

  /**
   * Giriş Yap butonuna tıklar ve /oauth/token API yanıtını bekler.
   */
  async submitLogin() {
    const tokenPromise = this.page.waitForResponse(
      res => res.url().includes('/oauth/token'),
      { timeout: 15000 }
    ).catch(() => {
      console.warn('[LoginPage] submitLogin: /oauth/token API yanıtı alınamadı. Giriş teyit edilemedi.');
      return null;
    });

    await this.clickElement(this.locators.login.loginSubmitButton || this.locators.login.continueButton);
    const res = await tokenPromise;
    await this.page.waitForLoadState('networkidle').catch(() => {});
    return res;
  }

  /**
   * E-posta ve şifre girerek giriş yapma işlemini tamamlar.
   * @param {string} email - E-posta adresi
   * @param {string} password - Şifre
   */
  async login(email, password) {
    if (email) await this.enterEmail(email);
    if (password) await this.enterPassword(password);
    await this.submitLogin();
  }

  /**
   * Gösterilen tüm form hata mesajlarının birleştirilmiş metnini alır (POM).
   * @returns {Promise<string>} Hata mesajı metinleri
   */
  async getErrorMessage() {
    const errorLocators = this.page.locator(this.locators.login.errorMessage);
    await errorLocators.first().waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
    const count = await errorLocators.count();
    const messages = [];
    for (let i = 0; i < count; i++) {
      const text = await errorLocators.nth(i).innerText().catch(() => '');
      if (text.trim()) messages.push(text.trim());
    }
    return messages.join(' | ');
  }

  /**
   * Hata mesajı etiketinin ekranda görünürlüğünü kontrol eder (POM).
   * @param {number} [timeout=10000] - Zamanaşımı süresi
   * @returns {Promise<boolean>} Görünürlük durumu
   */
  async isErrorMessageVisible(timeout = 10000) {
    const locator = this.page.locator(this.locators.login.errorMessage).first();
    return await locator.isVisible({ timeout }).catch(() => false);
  }
}
