Feature: B1 - Bonus Görev: API + UI Hibrit Oturum (Storage State Enjeksiyonu)
  UI login formunu doldurmadan API üzerinden hızlıca oturum açıp çerez/storage state enjekte ederek oturumun doğrulanması.

  @b1 @api @hybrid @regression
  Scenario: API üzerinden hızlı oturum açma ve oturumun doğrulanması (Hybrid API Login)
    Given kullanıcı API üzerinden giriş yaparak oturum açar
    When kullanıcı "my-account" sayfasına gider
    Then kullanıcı hesabım menüsünü ve oturumun açıldığını görmelidir
