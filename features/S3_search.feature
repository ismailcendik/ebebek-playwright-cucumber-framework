Feature: S3 - Arama ve Sonuç Doğrulama (Product Search & Verification)
  Kullanıcı arama yaptığında arama terimiyle ilişkili ürünlerin listelendiğini veya sonuç bulunamadığında ürün kartı listelenmediğini doğrulamalıdır.

  @regression @search @s3
  Scenario Outline: Başarılı ürün araması ve sonuçların arama terimiyle ilişkili olduğunun doğrulanması
    Given kullanıcı ana sayfaya gider
    When kullanıcı arama alanına "<aramaTerimi>" yazar
    And kullanıcı arama butonuna tıklar
    Then arama sonuç listesi "<aramaTerimi>" ile ilişkili ürünleri içermelidir

    Examples:
      | aramaTerimi |
      | biberon     |

  @regression @negative @search @s3
  Scenario Outline: Sonuç bulunamayan ürün aramasında hiçbir ürünün listelenmediğinin doğrulanması
    Given kullanıcı ana sayfaya gider
    When kullanıcı arama alanına "<rastgeleTerim>" yazar
    And kullanıcı arama butonuna tıklar
    Then arama sonuç listesinde hiçbir ürün listelenmemelidir

    Examples:
      | rastgeleTerim              |
      | xyz987unexistingproduct123 |
