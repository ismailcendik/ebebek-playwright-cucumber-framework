import dotenv from 'dotenv';

// .env ortam değişkenlerini yükler
dotenv.config();

/**
 * Cucumber JS Merkezi Çalıştırma Yapılandırması
 * Bu dosya senaryo yollarını, step_definition ve support import'larını,
 * Allure raporlayıcısını, paralel koşum worker sayısını ve retry ayarlarını yönetir.
 */
export default {
  // Gherkin senaryo (.feature) dosyalarının konumu
  paths: ['features/*.feature'],

  // ES Module formatında yüklenen support ve step_definition dosyaları
  import: [
    'support/*.js',
    'step_definitions/*.js'
  ],

  // Raporlama biçimleri: Konsol özeti, ilerleme çubuğu ve Allure CucumberJS Raporlayıcısı
  format: [
    ['summary', 'reports/cucumber-summary.txt'],
    ['allure-cucumberjs/reporter', 'reports/allure-cucumber-reporter.log'],
    'progress'
  ],

  // Allure rapor ham verilerinin kaydedileceği dizin
  formatOptions: {
    resultsDir: 'allure-results',

  },

  // Başarısız testlerin tekrar çalıştırılma sayısı (.env RETRIES parametresiyle yapılandırılabilir)
  retry: Number(process.env.RETRIES) || 0,

  // Cucumber yayınlama bildirimini sessize alır
  publishQuiet: true
};
