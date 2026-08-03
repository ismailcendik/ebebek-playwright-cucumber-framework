Feature: S5 - Oturum ve Sayfa Durumu (Oturum Devamlılığı ve State Preservation)
  Misafir kullanıcı olarak eklenen ürünlerin giriş yapıldıktan sonra sepetinde korunduğu doğrulanmalıdır.

  @state @continuity @regression @s5
  Scenario: Misafir kullanıcı olarak sepete eklenen bez ürününün giriş yapıldıktan sonra sepetinde korunduğunun doğrulanması (Oturum Devamlılığı)
    Given kullanıcı ana sayfaya gider
    When kullanıcı arama alanına "bez" yazar
    And kullanıcı arama butonuna tıklar
    And ilk ürüne tıklar
    And ürün detay sayfasında sepete ekle butonuna tıklar
    And kullanıcı giriş sayfasına gider
    And kullanıcı e-posta sekmesine tıklar
    And kullanıcı e-posta alanına "valid_email" yazar
    And kullanıcı giriş yap hesap oluştur butonuna tıklar
    And kullanıcı şifre alanına "valid_password" yazar
    And kullanıcı giriş yap butonuna tıklar
    And kullanıcı sepetim sayfasına gider
    Then misafirken eklenen ürünün sepette korunduğu doğrulanır
