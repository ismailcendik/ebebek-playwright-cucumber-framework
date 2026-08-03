import { Config } from '../utils/config.js';

/**
 * Dinamik ve Yapılandırılabilir Test Verileri Modülü (Fixture)
 */
export const testData = {
  // Geçerli kullanıcı bilgileri (.env üzerinden dinamik yüklenir)
  validUser: {
    get email() {
      return Config.validUserEmail || 'test_user@example.com';
    },
    get password() {
      return Config.validUserPassword || 'ValidPass123!';
    }
  },

  // Negatif ve kayıt testleri için dinamik/geçersiz veri üreteci
  invalidUsers: {
    getUnregisteredEmail: () => `unreg_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`,
    getRandomPassword: () => `WrongPass_${Date.now()}!`
  },

  // Arama senaryoları için dinamik arama terimleri
  searchTerms: {
    validProduct: 'biberon',
    nonExistingProduct: 'xyz987unexistingproduct123'
  }
};
