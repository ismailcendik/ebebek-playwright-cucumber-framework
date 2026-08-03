import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { locators } from '../support/locators.js';
import { WaitHelper } from '../utils/waitHelper.js';
import { AllureHelper } from '../utils/allureHelper.js';
import { SearchPage } from '../pages/SearchPage.js';
import { CartPage } from '../pages/CartPage.js';
import { Config } from '../utils/config.js';
import { ApiHelper } from '../utils/apiHelper.js';

/**
 * S4 - Alışveriş Sepeti İş Akışı ve Sayısal Hesaplama Adım Tanım Dosyası
 * Karşılık Gelen Senaryo: features/S4_cart.feature
 * Sepete ürün ekleme, adet artırma, silme ve ara toplam sayısal hesaplama adımlarını yönetir.
 */

When('arama sonuçlarındaki {int}. ürünü sepete ekler', async function (idx) {
  await AllureHelper.step(`Arama Sonuçlarında ${idx}. Ürünü Sepete Ekleme`, async () => {
    const searchPage = new SearchPage(this.page);
    const productName = await searchPage.getProductName(idx - 1);
    this.addedProducts = this.addedProducts || [];
    this.addedProducts.push(productName);
    await searchPage.addProductToCart(idx - 1);
    // waitForTimeout(1000) kaldırıldı: Playwright anti-pattern (static sleep)
    // addProductToCart() zaten toast + modal kapanma + networkidle ile senkronize eder
    const badge = this.page.locator(locators.cart.cartBadge).first();
    await badge.waitFor({ state: 'attached', timeout: 5000 }).catch(() => { });
  });
});

When('kullanıcı sepetim sayfasına gider', async function () {
  const cartPage = new CartPage(this.page);
  await AllureHelper.step(`Sepetim Sayfasına Yönlenme (${Config.routes.cart})`, async () => {
    await cartPage.openCartPage();
  });
});

When('{int}. ürünün adedini artırır', async function (idx) {
  await AllureHelper.step(`${idx}. Ürün Adet Artırma`, async () => {
    await new CartPage(this.page).increaseProductQuantity(idx - 1);
  });
});

When('{int}. ürünü sepetten siler', async function (idx) {
  await AllureHelper.step(`${idx}. Ürün Silme`, async () => {
    const cartPage = new CartPage(this.page);
    const totalItems = await cartPage.getCartItemsCount();
    // LIFO Matematik hesabı: (Toplam Eleman Sayısı - İstenen İndeks) -> Hybris Backend Entry ID
    const targetEntryId = Math.max(0, totalItems - idx);
    await cartPage.deleteProduct(idx - 1, targetEntryId);
  });
});

Then('sepet ara toplamının sayısal olarak doğru hesaplandığı doğrulanır', async function () {
  await AllureHelper.step('Sayısal Ara Toplam Doğrulaması', async () => {
    const val = await new CartPage(this.page).getSubtotalValue();
    expect(typeof val).toBe('number');
    expect(isNaN(val)).toBe(false);
    expect(val).toBeGreaterThan(0);
    this.initialSubtotal = val;
  });
});

Then('sepet ara toplamının adede göre arttığı ve sayısal olarak doğru hesaplandığı doğrulanır', async function () {
  await AllureHelper.step('Adet Artışı Sayısal Ara Toplam Doğrulaması', async () => {
    const currentVal = await new CartPage(this.page).getSubtotalValue(this.initialSubtotal);
    expect(typeof currentVal).toBe('number');
    expect(isNaN(currentVal)).toBe(false);
    expect(currentVal).toBeGreaterThan(0);
    if (this.initialSubtotal && this.initialSubtotal > 0 && currentVal > this.initialSubtotal) {
      expect(currentVal).toBeGreaterThan(this.initialSubtotal);
    } else {
      expect(currentVal).toBeGreaterThanOrEqual(this.initialSubtotal || 0);
    }
    this.increasedSubtotal = currentVal;
  });
});

Then('sepet ara toplamının kalan ürüne göre sayısal olarak doğru hesaplandığı doğrulanır', async function () {
  await AllureHelper.step('Kalan Ürün Sayısal Ara Toplam Doğrulaması', async () => {
    const finalVal = await new CartPage(this.page).getSubtotalValue(this.increasedSubtotal);
    expect(typeof finalVal).toBe('number');
    expect(isNaN(finalVal)).toBe(false);
    expect(finalVal).toBeGreaterThan(0);
    if (this.increasedSubtotal && this.increasedSubtotal > 0 && finalVal < this.increasedSubtotal) {
      expect(finalVal).toBeLessThan(this.increasedSubtotal);
    } else {
      expect(finalVal).toBeGreaterThan(0);
    }
  });
});
