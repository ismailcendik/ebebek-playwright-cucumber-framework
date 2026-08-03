Feature: S6 - Çıkış Yapma (Logout) ve Korumalı Sayfa Erişimi Kontrolü (Route Guard)
  Kullanıcı sisteme giriş yaptıktan sonra çıkış yapabilmeli ve oturum kapatıldıktan sonra korumalı sayfaya erişmeye çalıştığında giriş sayfasına yönlendirilmelidir.

  @logout @guard @regression @s6
  Scenario: Kullanıcı çıkış yapma ve korumalı sayfaya erişim engeli (Route Guard) doğrulaması
    Given kullanıcı "login" sayfasına gider
    When kullanıcı "e-posta sekmesine" tıklar
    And kullanıcı "e-posta alanına" "valid_email" yazar
    And kullanıcı "giriş yap hesap oluştur butonuna" tıklar
    And kullanıcı "şifre alanına" "valid_password" yazar
    And kullanıcı "giriş yap butonuna" tıklar
    When kullanıcı çıkış yap butonuna tıklar
    And kullanıcı korumalı kullanıcı sayfasına erişmeye çalışır
    Then kullanıcı "login" sayfasına yönlendirilir
