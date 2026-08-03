import { BasePage } from './BasePage.js';
import { Config } from '../utils/config.js';
import { WaitHelper } from '../utils/waitHelper.js';

/**
 * Ana Sayfa (HomePage) Page Object Sınıfı
 * Ana sayfaya ait aksiyonları ve eleman etkileşimlerini yönetir.
 * Rotalar 'Config.routes' üzerinden çekilir, locators.home ile doğrudan etkileşime geçilir.
 */
export class HomePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright Page nesnesi
   */
  constructor(page) {
    super(page);
  }

  /**
   * Ana sayfaya yönlenir ve çerezleri kabul eder.
   */
  async openHomePage() {
    await this.navigate(Config.routes.home);
    await this.acceptCookiesIfPresent();
  }

  /**
   * Giriş Yap bağlantısına tıklar.
   */
  async clickLoginLink() {
    await this.clickElement(this.locators.home.loginLink);
  }

  /**
   * Arama kutusuna aranacak terimi yazar.
   * @param {string} searchTerm - Aranacak terim
   */
  async fillSearchInput(searchTerm) {
    const input = this.page.locator(this.locators.home.searchInput).first();
    await input.waitFor({ state: 'visible', timeout: 15000 });
    await input.fill(searchTerm);
  }

  /**
   * Arama butonuna tıklar veya Enter tuşuna basarak arama sonuçlar sayfasına yönlenir.
   */
  async clickSearchButton() {
    const input = this.page.locator(this.locators.home.searchInput).first();
    const term = await input.inputValue();

    const searchBtn = this.page.locator(this.locators.home.searchButton).first();
    if (await searchBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchBtn.click();
    }
    if (!this.page.url().includes(Config.routes.searchPath)) {
      await input.press('Enter');
    }
    if (!this.page.url().includes(Config.routes.searchPath) && term) {
      await this.page.goto(Config.routes.search(term));
    }
    await WaitHelper.waitForPageLoad(this.page);
  }

  /**
   * Arama alanına ürün adını yazar ve aramayı tetikler.
   * @param {string} keyword - Aranacak kelime
   */
  async searchProduct(keyword) {
    await this.fillSearchInput(keyword);
    await this.clickSearchButton();
  }

  /**
   * Sepetim ikonuna tıklar.
   */
  async goToCart() {
    await this.clickElement(this.locators.home.cartIcon);
  }

  /**
   * Kullanıcı hesabım menüsünün görünür olup olmadığını kontrol eder.
   * @returns {Promise<boolean>} Görünürlük durumu
   */
  async isAccountMenuVisible() {
    return await this.isElementVisible(this.locators.home.accountMenu);
  }

  /**
   * Hesabım menüsü üzerinden Çıkış Yap linkine tıklar.
   * Tüm locator'lar merkezi locators.js üzerinden çözümlenir (this.locators.home.*).
   *
   * logoutButton Angular CSS toggle nedeniyle Playwright'a daima hidden görünür;
   * evaluate(el.click()) ile visibility bypass yapılarak doğrudan DOM tıklaması sağlanır.
   */
  async clickLogout() {
    const accountMenu = this.page.locator(this.locators.home.accountMenu).first();
    const logoutBtn = this.page.locator(this.locators.home.logoutButton).first();

    // Hesap menüsü DOM'da hazır mı? (login durumu doğrulaması)
    await accountMenu.waitFor({ state: 'attached', timeout: 10000 });

    // logoutButton DOM'da tıkla
    await logoutBtn.waitFor({ state: 'attached', timeout: 10000 });
    await logoutBtn.evaluate(el => el.click());

    await WaitHelper.waitForPageLoad(this.page);
  }

}


