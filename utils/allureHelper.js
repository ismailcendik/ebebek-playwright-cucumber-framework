import fs from 'fs';
import path from 'path';
import { step } from 'allure-js-commons';
import { Config } from './config.js';

/**
 * Allure Raporlama Yardımcı Sınıfı (AllureHelper)
 * 
 * Bu sınıf Allure raporuna özel adımların (allure.step), ortam bilgilerinin (environment.properties)
 * ve başarısızlık anında alınan görsel kanıtların (screenshot, video, trace) eklenmesini yönetir.
 */
export class AllureHelper {
  /**
   * Belirtilen eylemi Allure raporunda özel bir alt adım (sub-step) olarak kaydeder.
   * @param {string} stepName - Allure raporunda görünecek adım açıklaması (Türkçe)
   * @param {Function} action - Çalıştırılacak async/sync fonksiyon
   */
  static async step(stepName, action) {
    if (typeof step === 'function') {
      const originalLog = console.log;
      console.log = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('no test runtime is found')) {
          return;
        }
        originalLog(...args);
      };
      try {
        return await step(stepName, action);
      } finally {
        console.log = originalLog;
      }
    }
    return await action();
  }

  /**
   * Allure raporunda görünmek üzere ortam (Environment) bilgilerini environment.properties dosyasına yazar.
   */
  static createEnvironmentFile() {
    const resultsDir = path.resolve('allure-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const envContent = [
      `Browser=Chromium (Playwright)`,
      `Base_URL=${Config.baseUrl}`,
      `Headless=${Config.isHeadless}`,
      `Workers=${process.env.CUCUMBER_TOTAL_WORKERS || 1}`,
      `Retries=${Config.retries}`,
      `Platform=${process.platform}`,
      `Node_Version=${process.version}`,
      `Execution_Time=${new Date().toLocaleString('tr-TR')}`
    ].join('\n');

    fs.writeFileSync(path.join(resultsDir, 'environment.properties'), envContent, 'utf-8');
  }

  /**
   * Ekran görüntüsünü Cucumber/Allure ek olarak bağlar.
   * @param {Object} world - Cucumber World nesnesi (this)
   * @param {Buffer} screenshotBuffer - Ekran görüntüsü verisi
   * @param {string} name - Ekran görüntüsü adı
   */
  static async attachScreenshot(world, screenshotBuffer, name = 'Başarısızlık Ekran Görüntüsü') {
    await world.attach(screenshotBuffer, 'image/png');
  }

  /**
   * Playwright Trace zip dosyasını Allure ek olarak bağlar.
   * @param {Object} world - Cucumber World nesnesi (this)
   * @param {Buffer} traceBuffer - Trace zip dosyası verisi
   */
  static async attachTrace(world, traceBuffer) {
    await world.attach(traceBuffer, 'application/zip');
  }

  /**
   * Test video kaydını Allure ek olarak bağlar.
   * @param {Object} world - Cucumber World nesnesi (this)
   * @param {Buffer} videoBuffer - Video dosyası verisi
   */
  static async attachVideo(world, videoBuffer) {
    await world.attach(videoBuffer, 'video/webm');
  }
}
