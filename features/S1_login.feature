Feature: S1 - Başarılı Kullanıcı Girişi (Login)
  Kullanıcı e-posta ve şifre bilgilerini girerek sisteme başarıyla giriş yapabilmeli ve profil ekranını görebilmelidir.

  @login @positive @smoke @regression @s1
  Scenario: Geçerli kullanıcı bilgileri ile başarılı giriş doğrulaması
    Given kullanıcı "login" sayfasına gider
    When kullanıcı "e-posta sekmesine" tıklar
    And kullanıcı "e-posta alanına" "valid_email" yazar
    And kullanıcı "giriş yap hesap oluştur butonuna" tıklar
    And kullanıcı "şifre alanına" "valid_password" yazar
    And kullanıcı "giriş yap butonuna" tıklar
    And kullanıcı "ebebek Cüzdana" tıklar
    Then "Kişisel Bilgiler" metninin görünür olduğu kontrol edilir
