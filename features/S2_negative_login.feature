Feature: S2 - Negatif Giriş ve Form Doğrulama Senaryoları (Negative Login & Registration Validation)
  Hatalı e-posta formatı, kayıtlı olmayan dinamik e-posta ve eksik alan durumlarında sistem uygun uyarı mesajlarını göstermelidir.

  @negative @login @regression @s2
  Scenario Outline: Giriş ekranındaki boş ve geçersiz e-posta alanı kontrolleri
    Given kullanıcı giriş sayfasına gider
    When kullanıcı e-posta sekmesine tıklar
    And kullanıcı negatif e-posta alanına "<eposta>" yazar
    And kullanıcı devam et butonuna tıklar
    Then kullanıcı hata mesajında "<hataMesaji>" metnini görmelidir

    Examples:
      | eposta         | hataMesaji                          |
      |                | Lütfen e-posta alanını doldurun     |
      | sdsgsdsgsdgs   | Geçerli bir e-posta adresi giriniz |

  @negative @login @regression @s2
  Scenario Outline: Kayıtlı olmayan e-posta ile kayıt ekranında zorunlu alan uyarılarının kontrolü
    Given kullanıcı giriş sayfasına gider
    When kullanıcı e-posta sekmesine tıklar
    And kullanıcı negatif e-posta alanına "<eposta>" yazar
    And kullanıcı devam et butonuna tıklar
    And kullanıcı ad alanına "<ad>" yazar
    And kullanıcı soyad alanına "<soyad>" yazar
    And kullanıcı telefon alanına "<telefon>" yazar
    And kullanıcı negatif şifre alanına "<sifre>" yazar
    And kullanıcı hesap oluştur butonuna tıklar
    Then kullanıcı hata mesajında "<hataMesaji>" metnini görmelidir

    Examples:
      | eposta         | ad    | soyad  | telefon | sifre             | hataMesaji                                                 |
      | <RANDOM_EMAIL> |       |        |         |                   | Bu alan gereklidir                                         |
      | <RANDOM_EMAIL> |       |        |         | <RANDOM_PASSWORD> | Bu alan gereklidir                                         |
      | <RANDOM_EMAIL> | Ahmet |        |         |                   | Soyad en az 2 karakter uzunluğunda olmalıdır               |
      | <RANDOM_EMAIL> | Ahmet | Yılmaz |         |                   | Lütfen 10 haneli olan geçerli bir telefon numarası giriniz |
