import dotenv from 'dotenv';

// Ortam değişkenlerini .env dosyasından yükler
dotenv.config();

/**
 * Konfigürasyon ve Ortam Değişkenleri Yönetici Sınıfı
 * Bu sınıf kod içerisinde hardcoded URL ve kullanıcı bilgilerinin bulunmasını engeller.
 */
export class Config {
  /**
   * Test edilecek ana uygulama URL'ini döndürür.
   * @returns {string} Base URL adresi
   */
  static get baseUrl() {
    const url = process.env.BASE_URL;
    if (!url) {
      throw new Error('HATA: BASE_URL ortam değişkeni .env dosyasında tanımlı değil!');
    }
    return url;
  }

  /**
   * Uygulama içi merkezi rota (route) tanımları
   */
  static get routes() {
    return {
      home: '/',
      login: '/login',
      cart: '/cart',
      myAccount: '/my-account',
      searchPath: '/search',
      search: (term) => `/search?text=${encodeURIComponent(term)}`
    };
  }

  /**
   * Geçerli test kullanıcısının e-posta adresini döndürür.
   * @returns {string} Kullanıcı e-posta adresi
   */
  static get validUserEmail() {
    return process.env.EBEBEK_EMAIL || '';
  }

  /**
   * Geçerli test kullanıcısının şifresini döndürür.
   * @returns {string} Kullanıcı şifresi
   */
  static get validUserPassword() {
    return process.env.EBEBEK_PASSWORD || '';
  }

  /**
   * API + UI hibrit oturum için Bearer Token değerini döndürür.
   * @returns {string} Bearer access_token
   */
  static get apiBearerToken() {
    return process.env.API_BEARER_TOKEN || '';
  }

  /**
   * Tarayıcının headless (ekransız) modda çalışıp çalışmayacağını döndürür.
   * @returns {boolean} Headless durumu
   */
  static get isHeadless() {
    return process.env.HEADLESS !== 'false';
  }

  /**
   * Başarısız testlerin tekrar çalıştırılma sayısını döndürür.
   * @returns {number} Retry sayısı
   */
  static get retries() {
    return Number(process.env.RETRIES) || 0;
  }
}
