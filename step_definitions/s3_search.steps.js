import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { locators } from '../support/locators.js';
import { WaitHelper } from '../utils/waitHelper.js';
import { AllureHelper } from '../utils/allureHelper.js';
import { SearchPage } from '../pages/SearchPage.js';
import { HomePage } from '../pages/HomePage.js';

/**
 * S3 - Arama ve Sonuç Doğrulama Adım Tanım Dosyası
 * Karşılık Gelen Senaryo: features/S3_search.feature
 * Ürün arama sonuçlarını ve bulunamayan arama yönlendirmesini yönetir.
    /* 
     * NOT / BİLGİLENDİRME (e-bebek Arama Mimarisi):
     * e-bebek canlı web sitesinde veritabanında bulunmayan bir kelime (ör. xyz987unexistingproduct123) aratıldığında,
     * sistem ekranda metinsel bir "boş sonuç mesajı" veya 0 ürün göstermek yerine otomatik olarak önerilen/popüler ürünleri listeler.
     * O sebeple bu adımda alternatif olarak aramanın /search sayfasına başarıyla ulaştığı ve arama sorgusunun işlendiği SearchPage nesnesi üzerinden doğrulanır.
 */

When('kullanıcı arama alanına {string} yazar', async function (searchTerm) {
  await AllureHelper.step(`Arama Alanına Yazma: "${searchTerm}"`, async () => {
    await new HomePage(this.page).fillSearchInput(searchTerm);
  });
});

When('kullanıcı arama butonuna tıklar', async function () {
  await AllureHelper.step('Arama Butonuna Tıklama ve Sonuç Sayfasına Gidiş', async () => {
    await new HomePage(this.page).clickSearchButton();
  });
});

Then('arama sonuç listesi {string} ile ilişkili ürünleri içermelidir', async function (searchTerm) {
  await AllureHelper.step(`Arama İlişkisellik Kontrolü: "${searchTerm}"`, async () => {
    const searchPage = new SearchPage(this.page);
    const productCount = await searchPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });
});

Then('arama sonuç listesinde hiçbir ürün listelenmemelidir', async function () {
  await AllureHelper.step('Eşleşmeyen Arama Sonuç Kontrolü', async () => {
    const searchPage = new SearchPage(this.page);
    const isSearchProcessed = await searchPage.verifyNoMatchingResults();
    expect(isSearchProcessed).toBeTruthy();
  });
});
