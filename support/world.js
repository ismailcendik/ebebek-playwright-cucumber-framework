import { setWorldConstructor, setDefaultTimeout, World } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { Config } from '../utils/config.js';

// Paralel koşumda şebeke/render gecikmelerine karşı varsayılan adım zaman aşımını 60 saniyeye ayarlar
setDefaultTimeout(60000);

/**
 * Custom Cucumber World Sınıfı
 * Her senaryo çalıştırılmadan önce Cucumber tarafından örneği (instance) oluşturulur.
 * Test izolasyonu sağlamak amacıyla her senaryo için bağımsız bir Playwright BrowserContext
 * ve Page nesnesi başlatır.
 */
export class CustomWorld extends World {
  /**
   * @param {Object} options - Cucumber World seçenekleri
   */
  constructor(options) {
    super(options);

    /** @type {import('@playwright/test').Browser | null} */
    this.browser = null;

    /** @type {import('@playwright/test').BrowserContext | null} */
    this.context = null;

    /** @type {import('@playwright/test').Page | null} */
    this.page = null;
  }

  /**
   * Tarayıcıyı, izolasyonlu ortam bağlamını (context) ve yeni sayfayı (page) başlatır.
   */
  async init() {
    // Tarayıcı başlatma parametreleri (.env dosyasındaki HEADLESS parametresine duyarlıdır)
    this.browser = await chromium.launch({
      headless: Config.isHeadless,
      args: ['--start-maximized']
    });

    // Her senaryo için sıfır (isolated) BrowserContext oluşturulur (baseURL eklenmiştir)
    this.context = await this.browser.newContext({
      baseURL: Config.baseUrl,
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      recordVideo: { dir: 'reports/videos/' }
    });

    // Playwright Trace başlatma (Başarısızlık durumlarında incelenmek üzere)
    await this.context.tracing.start({ screenshots: true, snapshots: true });

    // Bağlam içerisinde yeni sayfa oluşturulur
    this.page = await this.context.newPage();
  }

  /**
   * Senaryo tamamlandığında kaynakları güvenli bir şekilde temizler ve kapatır.
   */
  async cleanup() {
    if (this.page) {
      await this.page.close().catch(() => {});
    }
    if (this.context) {
      await this.context.close().catch(() => {});
    }
    if (this.browser) {
      await this.browser.close().catch(() => {});
    }
  }
}

// Custom World sınıfını Cucumber ortamına tanımlar
setWorldConstructor(CustomWorld);
