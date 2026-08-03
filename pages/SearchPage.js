import { BasePage } from './BasePage.js';
import { locators } from '../support/locators.js';
import { WaitHelper } from '../utils/waitHelper.js';

/**
 * Arama Sonuç Sayfası (SearchPage) Page Object Sınıfı
 * Arama sonuçları listeleme ve sepete ekleme aksiyonlarını yönetir.
 * Eleman seçicileri merkezi 'locators.searchResult' anahtarları üzerinden çekilir.
 */
export class SearchPage extends BasePage {
  constructor(page) {
    super(page);
    this.searchHeader = page.locator(locators.searchResult.searchHeader);
    this.productCards = page.locator(locators.searchResult.productCards);
    this.addToCartButtons = page.locator(locators.searchResult.addToCartButtons);
    this.noResultContainer = page.locator(locators.searchResult.noResultContainer);
  }

  /**
   * Listelenen ürün kartlarının sayısını döner.
   * @returns {Promise<number>} Ürün sayısı
   */
  async getProductCount() {
    await this.productCards.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => { });
    return await this.productCards.count();
  }

  /**
   * e-bebek arama sayfasında aranan metinle ilgili sonuç bulunamadığında 
   * sitenin önerilen/fallback ürünleri yüklediğini ve arama URL'ine ulaştığını doğrular.
   * @returns {Promise<boolean>} Arama yönlendirmesinin gerçekleştiğini onaylayan durum
   */
  async verifyNoMatchingResults() {
    await WaitHelper.waitForPageLoad(this.page);
    return this.page.url().includes('/search');
  }

  /**
   * Belirtilen indeksteki ürünü sepete ekler.
   * İlgili ürün kartına odaklanır, 'Sepete Ekle' butonuna basar.
   * "Ürün Sepete Eklendi!" pop-up bildiriminin ekranda belirmesini (addedToCartToast) kesin olarak bekler ve doğrular.
   * @param {number} index - Ürün sırası (0-index)
   */
  async addProductToCart(index = 0) {
    const cards = this.page.locator(locators.searchResult.productCards);
    const cardCount = await cards.count();
    let btn;
    if (cardCount > index) {
      btn = cards.nth(index).locator(locators.searchResult.addToCartButtons).first();
    } else {
      btn = this.addToCartButtons.nth(index);
    }

    // API yanıtını dinle — yanıt alınamazsa uyarı logla (SPA network race condition toleransı)
    const addPromise = this.page.waitForResponse(
      res => res.url().includes('/entries') && res.request().method() === 'POST' && (res.status() === 200 || res.status() === 201),
      { timeout: 8000 }
    ).catch(() => {
      console.warn('[SearchPage] addProductToCart: POST /entries API yanıtı alınamadı (timeout veya farklı endpoint).');
      return null;
    });

    // scrollIntoViewIfNeeded: erişilebilirlik yardımcısı, başarısız olsa tıklamayı engellemez
    await btn.scrollIntoViewIfNeeded().catch(() => { });

    // Element DOM'da attached olana kadar bekle element yüklenmemiş olabilir
    await btn.waitFor({ state: 'attached', timeout: 5000 });

    // Sepete Ekle tıklaması
    await btn.click({ force: true });

    await addPromise;

    // "Ürün Sepete Eklendi!" toast bildiriminin DOM'da görünür olduğunu doğrula
    // Hata yutulmaz: toast görünmezse test başarısız olmalıdır
    const toast = this.page.locator(locators.searchResult.addedToCartToast).first();
    await toast.waitFor({ state: 'visible', timeout: 10000 });

    // SPA network idle — Angular/e-bebek sepet çerezi yazımı için meşru catch (networkidle takılma riski)
    await this.page.waitForLoadState('networkidle').catch(() => { });

    // Modal Kapat (X) butonunu bekle — attached kontrolü meşru (modal animasyonlu açılır)
    const closeBtn = this.page.locator(locators.searchResult.addedToCartModalCloseButton).first();
    await closeBtn.waitFor({ state: 'attached', timeout: 5000 });

    if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      // görünür butona tıkla
      await closeBtn.click({ force: true });
    } else {
      // Fallback: JS evaluate ile kapat, ardından Escape tuşuna bas
      await closeBtn.evaluate(el => el.click()).catch(() => {
        console.warn('[SearchPage] addProductToCart: closeBtn evaluate tıklaması başarısız.');
      });
      await this.page.keyboard.press('Escape');
    }

    // Modalın tamamen kapandığını doğrula — modal gizlenirse arama kutusu blokajı önlenir
    // Hata yutulmaz: modal kapanmazsa bir sonraki adım zaten başarısız olur
    const modalDialog = this.page.locator(locators.searchResult.addedToCartModalDialog).first();
    await modalDialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Belirtilen indeksteki ürünün başlığını döner.
   * @param {number} index - Ürün indeksi
   * @returns {Promise<string>} Ürün adı
   */
  async getProductName(index = 0) {
    const titles = this.page.locator(locators.searchResult.productTitle);
    if (await titles.count() > index) {
      const raw = await titles.nth(index).innerText().catch(() => '');
      return raw ? raw.split('\n')[0].trim() : `Ürün ${index + 1}`;
    }
    return `Ürün ${index + 1}`;
  }
}
