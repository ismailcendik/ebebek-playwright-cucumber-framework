import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { locators } from '../support/locators.js';
import { WaitHelper } from '../utils/waitHelper.js';
import { AllureHelper } from '../utils/allureHelper.js';
import { Config } from '../utils/config.js';
import { HomePage } from '../pages/HomePage.js';

/**
 * S6 - Çıkış Yapma ve Route Guard Adım Tanım Dosyası
 * Karşılık Gelen Senaryo: features/S6_logout.feature
 * Oturum kapatmayı (#lnkSignOutNavNode) ve korumalı adreste /login yönlendirmesini doğrular.
 */

When('kullanıcı çıkış yap butonuna tıklar', async function () {
  await AllureHelper.step('Çıkış Yap Butonuna Tıklama (#lnkSignOutNavNode)', async () => {
    await new HomePage(this.page).clickLogout();
  });
});

When('kullanıcı korumalı kullanıcı sayfasına erişmeye çalışır', async function () {
  await AllureHelper.step(`Korumalı Sayfaya Yönlenme Denemesi (${Config.routes.myAccount})`, async () => {
    await this.page.goto(Config.routes.myAccount);
    await WaitHelper.waitForPageLoad(this.page);
  });
});

Then('kullanıcı {string} sayfasına yönlendirilir', async function (expectedPage) {
  await AllureHelper.step(`Route Guard Yönlendirme Doğrulaması (${expectedPage})`, async () => {
    // Oturum kapandıktan sonra korumalı sayfaya erişilemediğini, login sayfasına fırlatıldığını kesin doğrula
    await expect(this.page).toHaveURL(new RegExp(Config.routes.login), { timeout: 10000 });
    const emailTab = this.page.locator(locators.login.emailTab).first();
    await expect(emailTab).toBeVisible({ timeout: 10000 });
  });
});
