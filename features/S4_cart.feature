Feature: S4 - Alışveriş Sepeti İş Akışı ve Sayısal Hesaplama Doğrulaması (Cart & Subtotal Verification)
  Kullanıcı iki farklı ürünü sepete ekleyebilmeli, birinin adedini artırıp diğerini sepetten silebilmeli ve sepet ara toplamının sayısal olarak doğru hesaplandığını doğrulayabilmelidir.

  @cart @regression @s4
  Scenario: İki farklı ürünü (biberon ve emzik) sepete ekleme, adet artırma, silme ve ara toplam sayısal hesaplama doğrulaması
    Given kullanıcı ana sayfaya gider
    When kullanıcı arama alanına "biberon" yazar
    And kullanıcı arama butonuna tıklar
    And arama sonuçlarındaki 1. ürünü sepete ekler
    When kullanıcı arama alanına "emzik" yazar
    And kullanıcı arama butonuna tıklar
    And arama sonuçlarındaki 1. ürünü sepete ekler
    And kullanıcı sepetim sayfasına gider
    Then sepet ara toplamının sayısal olarak doğru hesaplandığı doğrulanır
    When 1. ürünün adedini artırır
    Then sepet ara toplamının adede göre arttığı ve sayısal olarak doğru hesaplandığı doğrulanır
    When 2. ürünü sepetten siler
    Then sepet ara toplamının kalan ürüne göre sayısal olarak doğru hesaplandığı doğrulanır
