import { BasePage } from './BasePage.js';
import { locators } from '../support/locators.js';

/**
 * Urun Detay Sayfasi (ProductDetailPage) Page Object Sinifi
 * Urun detay sayfasina ait aksiyonlari ve eleman etkilesimlerini kapsüller.
 * Hata yonetimi (catch/warn) ve API senkronizasyonu bu katmanda kalir —
 * step_definitions bu detaylari bilmez; yalnizca metotlari cagirir.
 */
export class ProductDetailPage extends BasePage {
  constructor(page) {
    super(page);
  }

  /**
   * Urun detay sayfasindaki urun basligini okur.
   * Baslik okunamazsa bos string doner ve uyari loglanir.
   * @returns {Promise<string>} Temizlenmis urun basligi
   */
  async getProductTitle() {
    const titleEl = this.page.locator(locators.productDetail.productTitle).first();
    const rawTitle = await titleEl.innerText().catch(() => {
      console.warn('[ProductDetailPage] getProductTitle: productTitle innerText okunamadi.');
      return '';
    });
    return rawTitle.split('\n')[0].trim();
  }

  /**
   * Urun detay sayfasindaki Sepete Ekle butonuna tiklar.
   * Sepet API yanitini (POST/PUT/PATCH 200|201) senkronize bekler.
   * API yaniti alinamazsa uyari loglanir — test akisi kesilmez (SPA race toleransi).
   * @returns {Promise<import('@playwright/test').Response | null>}
   */
  async addToCart() {
    const addToCartBtn = this.page.locator(locators.productDetail.addToCartButton).first();
    await addToCartBtn.waitFor({ state: 'attached', timeout: 10000 });
    await addToCartBtn.scrollIntoViewIfNeeded().catch(() => { });

    const cartApiPromise = this.page.waitForResponse(
      res =>
        res.url().includes('cart') &&
        ['POST', 'PUT', 'PATCH'].includes(res.request().method()) &&
        (res.status() === 200 || res.status() === 201),
      { timeout: 15000 }
    ).catch(() => {
      console.warn('[ProductDetailPage] addToCart: Sepet API yaniti alinamadi (timeout veya farkli endpoint).');
      return null;
    });

    await addToCartBtn.click();
    return await cartApiPromise;
  }

  /**
   * Sepet rozetinin DOM'a attached olmasini bekler.
   * Rozet gorunmezse uyari loglanir.
   */
  async waitForCartBadge() {
    const badge = this.page.locator(this.locators.cart.cartBadge).first();
    await badge.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {
      console.warn('[ProductDetailPage] waitForCartBadge: cartBadge DOM a attached olmadi.');
    });
  }

  /**
   * SPA sepet cerezinin sunucuya yazilmasi icin networkidle bekler.
   * Angular uygulamalarda networkidle takilabilir meşru catch.
   */
  async waitForCartSync() {
    await this.page.waitForLoadState('networkidle').catch(() => { });
  }
}
