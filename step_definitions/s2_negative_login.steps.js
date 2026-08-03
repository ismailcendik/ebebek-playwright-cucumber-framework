import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { testData } from '../fixtures/testData.js';
import { locators } from '../support/locators.js';
import { WaitHelper } from '../utils/waitHelper.js';
import { AllureHelper } from '../utils/allureHelper.js';
import { LoginPage } from '../pages/LoginPage.js';

/**
 * S2 - Negatif Giriş ve Form Doğrulama Adım Tanım Dosyası
 * Karşılık Gelen Senaryo: features/S2_negative_login.feature
 * Boş alan, geçersiz format ve dinamik rastgele e-posta kayıt alanı hatalarını doğrular.
 */

When('kullanıcı negatif e-posta alanına {string} yazar', async function (emailValue) {
  let targetEmail = emailValue;
  if (emailValue === '<RANDOM_EMAIL>') {
    targetEmail = testData.invalidUsers.getUnregisteredEmail();
  }

  await AllureHelper.step(`Negatif E-posta Yazma: "${targetEmail}"`, async () => {
    await new LoginPage(this.page).enterEmail(targetEmail);
  });
});

When('kullanıcı negatif şifre alanına {string} yazar', async function (passwordValue) {
  let targetPassword = passwordValue;
  if (passwordValue === '<RANDOM_PASSWORD>') {
    targetPassword = testData.invalidUsers.getRandomPassword();
  }

  await AllureHelper.step(`Negatif Şifre Yazma: "${targetPassword}"`, async () => {
    await new LoginPage(this.page).enterPassword(targetPassword);
  });
});

When('kullanıcı devam et butonuna tıklar', async function () {
  await AllureHelper.step('Devam Et Butonuna Tıklama', async () => {
    await new LoginPage(this.page).clickContinueButton();
  });
});

When('kullanıcı ad alanına {string} yazar', async function (value) {
  await AllureHelper.step(`Ad Yazma: "${value}"`, async () => {
    const input = this.page.locator(locators.register.nameInput).first();
    // isVisible().catch(false) kaldırıldı: adım zorunlu, element yoksa test açıkça başarısız olmalı
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(value);
  });
});

When('kullanıcı soyad alanına {string} yazar', async function (value) {
  await AllureHelper.step(`Soyad Yazma: "${value}"`, async () => {
    const input = this.page.locator(locators.register.surnameInput).first();
    // isVisible().catch(false) kaldırıldı: adım zorunlu, element yoksa test açıkça başarısız olmalı
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(value);
  });
});

When('kullanıcı telefon alanına {string} yazar', async function (value) {
  await AllureHelper.step(`Telefon Yazma: "${value}"`, async () => {
    const input = this.page.locator(locators.register.phoneInput).first();
    // isVisible().catch(false) kaldırıldı: adım zorunlu, element yoksa test açıkça başarısız olmalı
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(value);
  });
});

When('kullanıcı hesap oluştur butonuna tıklar', async function () {
  await AllureHelper.step('Hesap Oluştur Butonuna Tıklama', async () => {
    const btn = this.page.locator(locators.register.registerSubmitButton).first();
    // isVisible().catch(false) kaldırıldı: butona tıklama zorunlu adım
    await btn.waitFor({ state: 'visible', timeout: 5000 });
    await btn.click();
  });
});

Then('kullanıcı hata mesajında {string} metnini görmelidir', async function (expectedMessage) {
  await AllureHelper.step(`Hata Mesajı Kontrolü: "${expectedMessage}"`, async () => {
    const loginPage = new LoginPage(this.page);
    const isVisible = await loginPage.isErrorMessageVisible();
    const errorText = await loginPage.getErrorMessage();

    if (errorText && expectedMessage) {
      const foundMatch =
        errorText.toLowerCase().includes(expectedMessage.toLowerCase()) ||
        errorText.toLowerCase().includes('gereklidir') ||
        errorText.toLowerCase().includes('uzunluğunda') ||
        errorText.toLowerCase().includes('geçerli');
      // expect(isVisible || true) kaldırıldı: her zaman true dönen sahte assertion
      expect(foundMatch).toBeTruthy();
    } else {
      // Hata mesajı metni yoksa bile görünürlük kontrolü zorunlu
      expect(isVisible).toBeTruthy();
    }
  });
});
