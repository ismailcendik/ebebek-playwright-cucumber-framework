import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

// .env dosyasındaki ortam değişkenlerini yükler
dotenv.config();

/**
 * Playwright Merkezi Konfigürasyon Dosyası
 * Bu dosya tarayıcı motoru, zaman aşımları, ekran görünürlüğü ve izleme (trace/video) ayarlarını yönetir.
 */
export default defineConfig({
  // Test senaryosu başına maksimum zaman aşımı (30 saniye)
  timeout: 30000,
  
  // Assertion (doğrulama) işlemleri için zaman aşımı (5 saniye)
  expect: {
    timeout: 5000
  },

  // Başarısız olan senaryolar için tekrar deneme (retry) sayısı (.env üzerinden yapılandırılabilir)
  retries: Number(process.env.RETRIES) || 0,

  // Tarayıcı ve sayfa davranış ayarları
  use: {
    // Ortam değişkeninden alınan ana URL (Hardcoded URL kesinlikle kullanılmaz)
    baseURL: process.env.BASE_URL || 'https://www.e-bebek.com',

    // Headless / Headed durumu .env dosyasından dinamik kontrol edilir
    headless: process.env.HEADLESS !== 'false',

    // Varsayılan ekran çözünürlüğü
    viewport: { width: 1280, height: 720 },

    // SSL ve HTTPS sertifika hatalarını yoksayar
    ignoreHTTPSErrors: true,

    // Ekran görüntüsü alma stratejisi: Sadece başarısız testlerde alır
    screenshot: 'only-on-failure',

    // Video kaydı alma stratejisi: Başarısız testlerde videoyu tutar
    video: 'retain-on-failure',

    // Trace kaydı (Playwright Trace Viewer): Başarısızlık durumunda detayı saklar
    trace: 'retain-on-failure',

    // UI aksiyonları için zaman aşımı (10 saniye)
    actionTimeout: 10000,

    // Sayfa navigasyonu için zaman aşımı (15 saniye)
    navigationTimeout: 15000
  }
});
