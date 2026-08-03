/**
 * Akıllı Bekleme ve Stabilizasyon Yardımcı Fonksiyonları (Wait Helper)
 * 
 * Projenin hiçbir yerinde 'sleep' veya 'waitForTimeout'
 * kullanımı yasaktır. Bu yardımcı sınıf Playwright'ın reaktif auto-waiting ve
 * DOM event/state kontrol mekanizmalarını kullanarak testlerin stabil çalışmasını sağlar.
 */
export class WaitHelper {
  /**
   * Elementin DOM üzerinde görünür (visible) duruma gelmesini bekler.
   * @param {import('@playwright/test').Locator} locator - Beklenecek element locator'ı
   * @param {number} timeout - Maksimum bekleme süresi (milisaniye)
   */
  static async waitForVisible(locator, timeout = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Sayfanın DOM içeriğinin yüklenmesini bekler (networkidle takılmasını önler).
   * @param {import('@playwright/test').Page} page - Playwright Page nesnesi
   */
  static async waitForPageLoad(page) {
    await page.waitForLoadState('domcontentloaded');
  }
}
