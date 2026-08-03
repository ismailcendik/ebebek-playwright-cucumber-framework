import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { locators } from '../support/locators.js';
import { WaitHelper } from '../utils/waitHelper.js';
import { AllureHelper } from '../utils/allureHelper.js';
import { testData } from '../fixtures/testData.js';
import { LoginPage } from '../pages/LoginPage.js';
import { Config } from '../utils/config.js';

/**
 * S1 - Başarılı Kullanıcı Girişi Adım Tanım Dosyası
 * Karşılık Gelen Senaryo: features/S1_login.feature
 * Pozitif giriş akışını ve /oauth/token API yanıt senkronizasyonunu yönetir.
 */

Given('kullanıcı giriş sayfasına gider', async function () {
  await AllureHelper.step(`Giriş Sayfasına Yönlenme (${Config.routes.login})`, async () => {
    await new LoginPage(this.page).openLoginPage();
    const emailTab = this.page.locator(locators.login.emailTab).first();
    await expect(emailTab).toBeVisible({ timeout: 15000 });
  });
});

When('kullanıcı e-posta sekmesine tıklar', async function () {
  await AllureHelper.step('E-posta Sekmesine Tıklama', async () => {
    await new LoginPage(this.page).selectEmailTab();
  });
});

When('kullanıcı e-posta alanına {string} yazar', async function (emailValue) {
  const targetEmail = (emailValue && emailValue !== 'valid_email' && !emailValue.includes('@example.com')) ? emailValue : testData.validUser.email;
  await AllureHelper.step(`E-posta Yazma: "${targetEmail}"`, async () => {
    await new LoginPage(this.page).enterEmail(targetEmail);
  });
});

When('kullanıcı giriş yap hesap oluştur butonuna tıklar', async function () {
  await AllureHelper.step('Giriş Yap / Hesap Oluştur Butonuna Tıklama', async () => {
    await new LoginPage(this.page).clickContinueButton();
  });
});

When('kullanıcı şifre alanına {string} yazar', async function (passwordValue) {
  const targetPassword = (passwordValue && passwordValue !== 'valid_password' && passwordValue !== 'ValidPass123') ? passwordValue : testData.validUser.password;
  await AllureHelper.step('Pozitif Giriş Şifresi Yazma', async () => {
    await new LoginPage(this.page).enterPassword(targetPassword);
  });
});

When('kullanıcı giriş yap butonuna tıklar', async function () {
  await AllureHelper.step('Giriş Yap Butonuna Tıklama ve OAuth Token Bekleme', async () => {
    await new LoginPage(this.page).submitLogin();
  });
});

When('kullanıcı ebebek Cüzdana tıklar', async function () {
  await AllureHelper.step('ebebek Cüzdana Tıklama', async () => {
    await WaitHelper.waitForPageLoad(this.page);
    const walletBtn = this.page.locator(locators.login.walletButton).first();
    await walletBtn.waitFor({ state: 'attached', timeout: 15000 });
    await walletBtn.click();
  });
});

Then('açılan ekranda kişisel bilgiler ekranını görmelidir', async function () {
  await AllureHelper.step('Kişisel Bilgiler Ekranı Kontrolü (#btnMyProfile)', async () => {
    const profileBtn = this.page.locator(locators.login.personalInfoLink).first();
    await expect(profileBtn).toBeVisible({ timeout: 15000 });
  });
});
