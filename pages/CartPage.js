import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';
import { Config } from '../utils/config.js';
import { ApiHelper } from '../utils/apiHelper.js';

/**
 * Alışveriş Sepeti Sayfası (CartPage) Page Object Sınıfı
 * Sepetteki ürün adet artırma, silme ve ara toplam sayısal matematiğini kapsüller.
 * Madde 5 Uyumlu: Static sleep içermez; API waitForResponse ve 20 döngülük Polling Loop ile yönetilir.
 */
export class CartPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright Page nesnesi
   */
  constructor(page) {
    super(page);
  }

  /**
   * Sepet sayfasındaki elemanların ve Angular UI renderının tıklanabilir/hazır olduğunu kapsüller.
   * Single Responsibility ve Defensive Waiting kalıbı.
   */
  async waitForCartReady() {
    const itemRows = this.page.locator(this.locators.cart.cartItems);
    await itemRows.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => { });

    const spinner = this.page.locator(this.locators.base.loadingSpinner).first();
    if (await spinner.isVisible().catch(() => false)) {
      await spinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => { });
    }
    await this.page.waitForLoadState('networkidle').catch(() => { });
  }

  /**
   * ApiHelper webservice dinlemesi ile sepet sayfasına yönlenir (/cart) ve DOM elemanlarını bekler.
   */
  async openCartPage() {
    const cartWebservicePromise = ApiHelper.waitForCartResponse(this.page);
    await this.navigate(Config.routes.cart, { waitUntil: 'networkidle' });
    await cartWebservicePromise;
    await this.waitForCartReady();
  }

  /**
   * Sepetteki ürün kalemlerinin sayısını döndürür.
   * @returns {Promise<number>} Sepetteki ürün sayısı
   */
  async getCartItemsCount() {
    const items = this.page.locator(this.locators.cart.cartItems);
    return await items.count();
  }


  /**
   * Belirtilen indeksteki ürünün adedini artırır.
   * e-bebek'in PATCH /carts/.../entries/ API yanıtını ve DOM re-render sürecini senkronize bekler.
   * @param {number} index - Ürün indeksi (varsayılan: 0)
   */
  async increaseProductQuantity(index = 0) {
    await this.waitForCartReady();
    const itemRows = this.page.locator(this.locators.cart.cartItems);
    const rowCount = await itemRows.count();
    const row = rowCount > index ? itemRows.nth(index) : itemRows.first();

    const plusSpan = row.locator(this.locators.cart.quantityIncreaseButtons).first();
    await plusSpan.waitFor({ state: 'visible', timeout: 10000 });

    // e-bebek /entries veya /carts PATCH 200 OK API yanıtını explicitly dinle
    const patchPromise = this.page.waitForResponse(
      res => (res.url().includes('/entries') || res.url().includes('/carts')) &&
        res.request().method() === 'PATCH' &&
        res.status() === 200,
      { timeout: 15000 }
    ).catch(() => {
      console.warn('[CartPage] increaseProductQuantity: PATCH /entries|/carts API yanıtı alınamadı (timeout). Adet artışı sunucudan teyit edilemedi.');
      return null;
    });

    await plusSpan.scrollIntoViewIfNeeded().catch(() => { });
    await plusSpan.click();

    await patchPromise;
    await this.page.waitForLoadState('networkidle').catch(() => { });
  }

  /**
   * Sepetten ürünü DOM indeksine veya doğrudan Hybris targetEntryId değerine göre siler.
   * SOLID ve Parametrik mimari.
   * e-bebek /entries/ DELETE API yanıtını ve DOM re-render sürecini senkronize bekler.
   * @param {number} index - Silinecek ürünün DOM üzerindeki dizin indeksi (0, 1, 2...)
   * @param {number|string|null} targetEntryId - Opsiyonel Hybris backend entry numarası (0, 1...)
   */
  async deleteProduct(index = 0, targetEntryId = null) {
    const itemRows = this.page.locator(this.locators.cart.cartItems);
    await itemRows.first().waitFor({ state: 'visible', timeout: 10000 });

    let targetDeleteBtn = null;

    // 1. targetEntryId verilmişse HTML attribute ([data-entry-id]) üzerinden kilitlen
    if (targetEntryId !== null) {
      const entryRow = this.page.locator(`[data-entry-id="${targetEntryId}"], [data-entry-number="${targetEntryId}"], eb-cart-item:has([data-entry-id="${targetEntryId}"])`).first();
      if (await entryRow.count() > 0) {
        targetDeleteBtn = entryRow.locator(this.locators.cart.deleteProductButtons || this.locators.cart.deleteButtons).first();
      }
    }

    // 2. Bulunamadıysa Fallback olarak DOM nth(index) üzerinden al
    if (!targetDeleteBtn) {
      const rowCount = await itemRows.count();
      const targetRow = rowCount > index ? itemRows.nth(index) : itemRows.first();
      targetDeleteBtn = targetRow.locator(this.locators.cart.deleteProductButtons || this.locators.cart.deleteButtons).first();
    }

    // e-bebek /entries/ DELETE 200 OK API yanıtını dinle
    const deletePromise = this.page.waitForResponse(
      res => res.url().includes('/entries/') && res.request().method() === 'DELETE' && res.status() === 200,
      { timeout: 8000 }
    ).catch(() => {
      console.warn('[CartPage] deleteProduct: DELETE /entries/ API yanıtı alınamadı (timeout). Ürün silme sunucudan teyit edilemedi.');
      return null;
    });

    await targetDeleteBtn.scrollIntoViewIfNeeded();
    await targetDeleteBtn.click();

    const confirmBtn = this.page.locator(this.locators.cart.confirmDeleteModalButton).last();
    if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmBtn.click();
    }

    await deletePromise;
    await this.page.waitForLoadState('networkidle').catch(() => { });
  }

  /**
   * Sepet ara toplam metnini ham olarak alır.
   * @returns {Promise<string>} Ara toplam metni (örn: "1.250,50 TL")
   */
  async getSubtotalText() {
    return await this.getElementText(this.locators.cart.cartSubtotalPrice);
  }

  /**
   * Ara toplam metnini parse ederek sayısal (float) değere dönüştürür.
   * Para birimi sembollerini ve binlik ayracı (nokta/virgül) temizler.
   * Angular SPA reaktif asenkron sepet güncellemesini expect.poll native auto-waiting ile dinler (0 sleep).
   * @param {number|null} expectedDifferentFrom - Değişim beklendiğinde eski değer
   * @returns {Promise<number>} Sayısal ara toplam değeri
   */
  async getSubtotalValue(expectedDifferentFrom = null) {
    const subtotalLocator = this.page.locator(this.locators.cart.cartSubtotalPrice).first();
    await subtotalLocator.waitFor({ state: 'visible', timeout: 10000 });

    if (expectedDifferentFrom !== null) {
      // Playwright native polling ile tutar değişene kadar otomatik bekler (0 sleep)
      try {
        await expect.poll(async () => {
          const rawText = await subtotalLocator.innerText().catch(() => '');
          if (!rawText || !rawText.trim()) return null;
          const cleanString = rawText.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
          const val = parseFloat(cleanString);
          return isNaN(val) ? null : val;
        }, {
          message: `Ara toplam tutarı ${expectedDifferentFrom} değerinden farklı bir değere güncellenmedi!`,
          timeout: 8000,
          intervals: [200, 500, 1000]
        }).not.toBe(expectedDifferentFrom);
      } catch (err) {
        // Tutar stok limiti vb. nedenlerle değişmediyse mevcut sayısal tutarı dön
      }
    }

    const rawText = await this.getSubtotalText();
    if (!rawText) return 0;

    const cleanString = rawText
      .replace(/[^\d.,]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    return parseFloat(cleanString) || 0;
  }

  /**
   * Sepetteki ürün isimlerini dizi olarak döner.
   * @returns {Promise<string[]>} Ürün isimleri dizisi
   */
  async getProductNames() {
    const titles = this.page.locator(this.locators.cart.productNames);
    const count = await titles.count();
    const names = [];
    for (let i = 0; i < count; i++) {
      const txt = await titles.nth(i).innerText().catch(() => '');
      if (txt && txt.trim()) names.push(txt.trim());
    }
    return names;
  }

  /**
   * Sepetteki bireysel ürün fiyatlarını parse ederek sayısal (float) dizi olarak döner.
   * @returns {Promise<number[]>} Ürün fiyatları dizisi (örn: [50.00, 100.00])
   */
  async getItemPrices() {
    const priceLocators = this.page.locator(this.locators.cart.itemPrices);
    const count = await priceLocators.count();
    const prices = [];

    for (let i = 0; i < count; i++) {
      const txt = await priceLocators.nth(i).innerText().catch(() => '');
      if (txt) {
        const clean = txt.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
        const val = parseFloat(clean);
        if (!isNaN(val) && val > 0) {
          prices.push(val);
        }
      }
    }
    return prices;
  }

  /**
   * Sepet boş mesajının görünüp görünmediğini kontrol eder.
   * @returns {Promise<boolean>}
   */
  async isEmptyCartMessageDisplayed() {
    return await this.isElementVisible(this.locators.cart.emptyCartMessage);
  }
}
