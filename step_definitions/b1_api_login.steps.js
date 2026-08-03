import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { locators } from '../support/locators.js';
import { WaitHelper } from '../utils/waitHelper.js';
import { AllureHelper } from '../utils/allureHelper.js';
import { ApiHelper } from '../utils/apiHelper.js';
import { Config } from '../utils/config.js';

/**
 * B1 - API + UI Hibrit Oturum (Bonus) Adım Tanım Dosyası
 * Karşılık Gelen Senaryo: features/B1_api_login.feature
 * UI login formunu doldurmadan Bearer Token enjeksiyonu ile oturum doğrulaması yapar.
 */

Given('kullanıcı API üzerinden giriş yaparak oturum açar', async function () {
  await AllureHelper.step('API Bearer Token Oturum Enjeksiyonu (Storage State / Cookies)', async () => {
    await ApiHelper.injectSessionCookies(this.context);
  });
});

Then('kullanıcı hesabım menüsünü ve oturumun açıldığını görmelidir', async function () {
  await AllureHelper.step('API Bearer Token UI Oturum Doğrulaması', async () => {
    const currentUrl = this.page.url();
    // Oturumun gerçekten açıldığını (/my-account adresine girildiğini ve /login'e yönlendirilmediğini) doğrular
    expect(currentUrl).toContain(Config.routes.myAccount);
  });
});
