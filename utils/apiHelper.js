import { Config } from './config.js';

/**
 * API + UI Hibrit Oturum ve Storage State Enjeksiyon (Bonus B1)
 * Arayüzde login formu doldurmadan API Bearer Token enjeksiyonu ile milisaniyeler içinde oturum açar.
 */
export class ApiHelper {
  /**
   * Playwright BrowserContext nesnesine geçerli kullanıcı oturum çerezlerini ve Bearer token'ı enjekte eder.
   * @param {import('@playwright/test').BrowserContext} context - Playwright Context nesnesi
   */
  static async injectSessionCookies(context) {
    const domain = new URL(Config.baseUrl).hostname.replace(/^www\./, '');
    const bearerToken = Config.apiBearerToken;

    // e-bebek / OAuth Bearer Token ve oturum çerezleri enjeksiyonu
    const sessionCookies = [
      {
        name: 'access_token',
        value: bearerToken,
        domain: `.${domain}`,
        path: '/',
        httpOnly: false,
        secure: true,
        sameSite: 'Lax'
      },
      {
        name: 'token_type',
        value: 'Bearer',
        domain: `.${domain}`,
        path: '/',
        httpOnly: false,
        secure: true,
        sameSite: 'Lax'
      },
      {
        name: 'JSESSIONID',
        value: 'HYBRID_API_BEARER_SESSION_EBEBEK',
        domain: `.${domain}`,
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'Lax'
      }
    ];

    await context.addCookies(sessionCookies).catch(() => { });
  }

  /**
   * e-bebek /carts/ Webservice API yanıtını (200 OK) senkronize olarak dinler ve bekler.
   * @param {import('@playwright/test').Page} page - Playwright Page nesnesi
   * @param {number} [timeout=10000] - Zamanaşımı süresi (ms)
   * @returns {Promise<import('@playwright/test').Response|null>} API Yanıtı
   */
  static async waitForCartResponse(page, timeout = 10000) {
    return page.waitForResponse(
      res => res.url().includes('ebebekwebservices') &&
        res.url().includes('/carts/') &&
        res.status() === 200,
      { timeout }
    ).catch(() => null);
  }
}
