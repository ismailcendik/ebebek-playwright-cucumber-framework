import { Before, After, BeforeAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import fs from 'fs';
import path from 'path';
import { AllureHelper } from '../utils/allureHelper.js';

/**
 * Cucumber Hooks Yapılandırması ve Allure Raporlama Entegrasyonu
 * 
 * Bu dosya her test senaryosundan önce ve sonra çalışan hook'ları yönetir.
 * Başarısız olan testlerde otomatik olarak Ekran Görüntüsü (Screenshot), Trace ve Video kayıtlarını alarak
 * Allure raporuna bağlar. Ayrıca ortam (Environment) bilgilerini rapora ekler.
 */

// Paralel koşumda şebeke/render gecikmelerine karşı varsayılan adım zaman aşımını 60 saniyeye ayarlar
setDefaultTimeout(60000);

/**
 * Tüm senaryolar çalıştırılmadan önce bir kez çalışır.
 * Allure raporunda görüntülenecek ortam bilgilerini (environment.properties) üretir.
 */
BeforeAll(async function () {
  AllureHelper.createEnvironmentFile();
});

/**
 * Her senaryo başlamadan önce çalışır.
 * Test izolasyonu için bağımsız Playwright tarayıcı bağlamını başlatır.
 */
Before(async function () {
  await this.init();
  if (this.context) {
    await this.context.clearCookies().catch(() => {});
  }
});

/**
 * Her senaryo tamamlandıktan sonra çalışır.
 * Başarısızlık durumunda ekran görüntüsü, Playwright Trace ve Video kaydını Allure raporuna ekler.
 */
After(async function (scenario) {
  const isFailed = scenario.result?.status === Status.FAILED;

  // Kanıt 1: Başarısızlık anında tam sayfa PNG ekran görüntüsü (Screenshot) Allure attachment
  if (isFailed && this.page) {
    await AllureHelper.step('Başarısızlık Anında Ekran Görüntüsü Alma', async () => {
      const screenshotDir = path.resolve('reports/screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const screenshotPath = path.join(screenshotDir, `failed_${Date.now()}.png`);
      const screenshotBuffer = await this.page.screenshot({ path: screenshotPath, fullPage: true });
      await AllureHelper.attachScreenshot(this, screenshotBuffer, 'Başarısızlık Ekran Görüntüsü');
    });
  }

  // Kanıt 2: Başarısızlık anında Playwright Trace (.zip) kaydı Allure attachment
  if (this.context) {
    if (isFailed) {
      await AllureHelper.step('Başarısızlık Trace Kaydını Saklama', async () => {
        const traceDir = path.resolve('reports/traces');
        if (!fs.existsSync(traceDir)) {
          fs.mkdirSync(traceDir, { recursive: true });
        }

        const tracePath = path.join(traceDir, `trace_${Date.now()}.zip`);
        await this.context.tracing.stop({ path: tracePath });

        if (fs.existsSync(tracePath)) {
          const traceBuffer = fs.readFileSync(tracePath);
          await AllureHelper.attachTrace(this, traceBuffer);
        }
      });
    } else {
      // Başarılı senaryolarda trace dosyasını saklamadan kapatır
      await this.context.tracing.stop();
    }
  }

  // Kanıt 3: Başarısızlık anında test hareketi ekran videosu (.webm) Allure attachment
  if (isFailed && this.page) {
    await AllureHelper.step('Başarısızlık Video Kaydını Saklama', async () => {
      const video = this.page.video();
      if (video) {
        const videoPath = await video.path().catch(() => null);
        if (videoPath && fs.existsSync(videoPath)) {
          const videoBuffer = fs.readFileSync(videoPath);
          await AllureHelper.attachVideo(this, videoBuffer);
        }
      }
    });
  }

  // Tarayıcı oturumunu ve geçici kaynakları kapatır
  await this.cleanup();
});
