import { locators } from '../support/locators.js';
import { WaitHelper } from '../utils/waitHelper.js';
import { AllureHelper } from '../utils/allureHelper.js';

/**
 * Tüm Page Object sınıfları için temel türetim sınıfı (BasePage)
 * Ortak sayfa aksiyonlarını ve merkezi locator erişimlerini kapsüller.
 * işlemler Allure.step ile raporlanır.
 */
export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright Page nesnesi
   */
  constructor(page) {
    this.page = page;
    this.locators = locators;
  }

  /**
   * Belirtilen URL yoluna (path) gider.
   * @param {string} path - URL uzantısı (varsayılan: '/')
   */
  async navigate(path = '/') {
    await AllureHelper.step(`Sayfaya Yönlenme: ${path}`, async () => {
      await this.page.goto(path);
      await WaitHelper.waitForPageLoad(this.page);
    });
  }

  /**
   * Cookie / İzin pop-up'ı görünür ise kabul eder.
   */
  async acceptCookiesIfPresent() {
    await AllureHelper.step('Çerez/İzin Pop-up Kabul Etme', async () => {
      const cookieBtn = this.page.locator(this.locators.base.cookieAcceptButton);
      if (await cookieBtn.isVisible().catch(() => false)) {
        await cookieBtn.click().catch(() => { });
      }
    });
  }

  /**
   * Verilen selector string'ine tıklama işlemi gerçekleştirir.
   * @param {string} selector - Selector metni
   */
  async clickElement(selector) {
    await AllureHelper.step(`Elemente Tıklama: [${selector}]`, async () => {
      const element = this.page.locator(selector).first();
      await element.waitFor({ state: 'attached', timeout: 10000 });
      await element.click();
    });
  }

  /**
   * Input alanına metin girer.
   * @param {string} selector - Input selector metni
   * @param {string} text - Yazılacak değer
   */
  async fillInput(selector, text) {
    await AllureHelper.step(`Input Alanı Doldurma: [${selector}] -> "${text}"`, async () => {
      const element = this.page.locator(selector);
      await WaitHelper.waitForVisible(element);
      await element.fill(text);
    });
  }

  /**
   * Elementin metin içeriğini alır.
   * @param {string} selector - Selector metni
   * @returns {Promise<string>} Element metni
   */
  async getElementText(selector) {
    return await AllureHelper.step(`Element Metnini Okuma: [${selector}]`, async () => {
      const element = this.page.locator(selector).first();
      await WaitHelper.waitForVisible(element);
      return (await element.textContent())?.trim() || '';
    });
  }

  /**
   * Elementin görünürlük durumunu kontrol eder.
   * @param {string} selector - Selector metni
   * @returns {Promise<boolean>} Görünür mü?
   */
  async isElementVisible(selector) {
    return await AllureHelper.step(`Element Görünürlük Kontrolü: [${selector}]`, async () => {
      const element = this.page.locator(selector).first();
      return await element.isVisible().catch(() => false);
    });
  }
}
