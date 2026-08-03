# e-bebek E2E Test Otomasyonu

Bu proje, **e-bebek** e-ticaret platformu üzerinde uçtan uca (E2E) tarayıcı testleri yürütmek için geliştirilmiş, Playwright + Cucumber JS tabanlı bir BDD otomasyon çerçevesidir. Testler Page Object Model yapısına ayrılmış, tüm seçiciler merkezi bir `locators.js` dosyasında yönetilmekte, test verileri fixture dosyalarında tutulmakta ve her senaryo ayrı bir `BrowserContext` ile izole biçimde çalışmaktadır. Konfigürasyonlar `.env` üzerinden okunur; kodda hardcoded veri bulunmaz.

---

## Teknoloji Yığını

| Katman | Araç |
|---|---|
| Tarayıcı otomasyonu | Playwright (`@playwright/test` v1.45) |
| BDD çerçevesi | Cucumber JS (`@cucumber/cucumber` v10) |
| Raporlama | Allure (`allure-cucumberjs` + `allure-commandline`) |
| Dil / Modül sistemi | JavaScript ES Modules (`"type": "module"`) |
| Ortam yönetimi | dotenv |
| Konteynerleştirme | Docker + Docker Compose |

---

## Gereksinimler

- Node.js ≥ 18
- npm ≥ 9

---

## Kurulum

### 1. Projeyi klonlayın

```bash
git clone <repository-url>
cd ebebek-web-test-automation
```

### 2. Bağımlılıkları yükleyin

```bash
npm install
```

### 3. Playwright tarayıcısını kurun

```bash
npx playwright install chromium
```

### 4. Ortam değişkenlerini hazırlayın

Projede `.env.example` dosyası hazır şablonuyla birlikte gelir. Onu `.env` adıyla kopyalayın:

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**
```bash
cp .env.example .env
```

Sonra `.env` dosyasını açıp gerçek kimlik bilgilerinizi girin:

```env
BASE_URL=https://www.e-bebek.com
EBEBEK_EMAIL=your_email@example.com     # Geçerli e-bebek hesabı e-postası
EBEBEK_PASSWORD=your_password           # Geçerli e-bebek hesabı şifresi
API_BEARER_TOKEN=your_bearer_token      # UI login bypass için OAuth Bearer Token
HEADLESS=true                          # false → tarayıcı görünür açılır
RETRIES=0                              # Başarısız test yeniden deneme sayısı
```

> **Not:** Testler gerçek kullanıcı kimlik bilgileriyle çalışır; `.env` dosyası `.gitignore`'a eklenmiştir ve repoya eklenmez.

---

## Test Çalıştırma

### Tüm testler

```bash
npm test
```

> `pretest` hook'u çalışmadan önce önceki Allure çıktılarını otomatik temizler.

### Paralel çalıştırma (≥ 2 worker)

```bash
npm run test:parallel
```

`--parallel 2` bayrağıyla çalışır. Worker sayısını artırmak için `cucumber.js` içindeki `parallel` değerini güncelleyin.

### Etiket bazlı çalıştırma

```bash
npm run test:smoke       # @smoke etiketli senaryolar
npm run test:regression  # @regression etiketli senaryolar
npm run test:negative    # @negative etiketli senaryolar
```

### Tekil senaryo çalıştırma ve gözlemleme (görünür tarayıcı)

Her feature dosyasına `@s1`–`@s6` etiketleri eklenmiştir. Senaryo bazında tarayıcıyı görünür açarak izlemek için:

```powershell
# Windows PowerShell
$env:HEADLESS="false"; npx cucumber-js --tags "@s1"   # S1 - Başarılı Login
$env:HEADLESS="false"; npx cucumber-js --tags "@s2"   # S2 - Negatif Giriş
$env:HEADLESS="false"; npx cucumber-js --tags "@s3"   # S3 - Ürün Araması
$env:HEADLESS="false"; npx cucumber-js --tags "@s4"   # S4 - Sepet İş Akışı
$env:HEADLESS="false"; npx cucumber-js --tags "@s5"   # S5 - Oturum Devamlılığı
$env:HEADLESS="false"; npx cucumber-js --tags "@s6"   # S6 - Logout / Route Guard
```

```bash
# macOS / Linux
HEADLESS=false npx cucumber-js --tags "@s1"
```

> `HEADLESS=false` ayarıyla tarayıcı penceresi açık kalır; testin her adımını gerçek zamanlı izleyebilirsiniz.

| Etiket | Senaryo |
|---|---|
| `@s1` | Başarılı kullanıcı girişi |
| `@s2` | Negatif giriş & form doğrulama |
| `@s3` | Ürün araması ve sonuç doğrulama |
| `@s4` | Alışveriş sepeti iş akışı ve sayısal hesaplama |
| `@s5` | Misafir sepet devamlılığı (State Preservation) |
| `@s6` | Çıkış yapma ve Route Guard doğrulaması |


## Allure Raporu

Testler tamamlandıktan sonra:

```bash
npm run report:generate   # Allure HTML raporunu derle
npm run report:open       # Raporu tarayıcıda aç
npm run report:clean      # Çıktıları temizle
```

| Dizin | İçerik |
|---|---|
| `allure-results/` | Ham JSON adım logları |
| `allure-report/` | HTML raporu (`index.html`) |
| `reports/screenshots/` | Başarısız testlerde otomatik ekran görüntüsü |
| `reports/traces/` | Playwright trace dosyaları (`.zip`) |
| `reports/videos/` | Test kayıt videoları (`.webm`) |

---

## Test İzolasyonu

Her senaryo, `support/hooks.js` içindeki `Before` hook'unda yeni bir `BrowserContext` açılarak ve `After` hook'unda kapatılarak izole edilir:

```
Before → yeni browser + context + page oluşturulur
After  → context.close() → tarayıcı oturumu tamamen temizlenir
```

Bu tasarımın sonuçları:

- Senaryolar birbirinin oturum bilgisini, cookie'sini veya localStorage'ını **etkileyemez**.
- Bir senaryo başarısız olsa bile bir sonraki senaryo temiz bir bağlamda başlar.
- `--parallel 2` ile koşulduğunda her worker ayrı `BrowserContext` üzerinde çalışır; paylaşılan durum yoktur.

---

## Flaky Test Çözümleri

Projede `waitForTimeout` / sabit `sleep` kullanılmamıştır. Tüm bekleme işlemleri **Playwright Auto Waiting** ve özel **`WaitHelper`** metodlarıyla yönetilir.

### Sepet sayfası kararsızlığı (Angular SPA re-render)

**Problem:** Sepet senaryolarında ürün adedi artırma veya silme işlemi sonrasında ara toplam (`subtotal`) güncellenmiş DOM değeri yerine eski değeri döndürüyordu. Sorunun kaynağı Angular'ın asenkron re-render döngüsüydü: backend PATCH/DELETE isteği 200 döndükten sonra bile DOM birkaç yüz milisaniye eski hâlinde kalabiliyordu.

**Başarısız yaklaşım:** `waitForTimeout(1000)` ile sabit bekleme — ortam hızına bağlı olarak ya çok kısa ya da gereksiz yere uzun kalıyordu.

**Çözüm — üç katmanlı bekleme stratejisi (`CartPage.js`):**

1. **`waitForCartReady()`** — sepet öğelerinin görünür olmasını, varsa loading spinner'ın kaybolmasını ve `networkidle` durumuna gelinmesini sırayla bekler:
   ```js
   await itemRows.first().waitFor({ state: 'visible', timeout: 15000 });
   await spinner.waitFor({ state: 'hidden', timeout: 10000 });
   await page.waitForLoadState('networkidle');
   ```

2. **API yanıtı dinleme** — `+` butonuna tıklamadan önce `page.waitForResponse()` ile PATCH isteğinin 200 OK dönmesi beklenir; DOM güncellenmeden devam edilmez:
   ```js
   const patchPromise = page.waitForResponse(
     res => res.url().includes('/entries') && res.status() === 200
   );
   await plusBtn.click();
   await patchPromise;
   ```

3. **`expect.poll()`** — ara toplam değerinin gerçekten değişip değişmediği Playwright'ın native polling mekanizmasıyla doğrulanır; eski değer ile eşleştiği sürece 200–1000 ms aralıklarla yeniden sorgulanır:
   ```js
   await expect.poll(async () => parseSubtotal(), {
     timeout: 8000, intervals: [200, 500, 1000]
   }).not.toBe(previousValue);
   ```

Bu üç katman birleşince sepet senaryoları ortam hızından bağımsız olarak kararlı hâle geldi.

---

## Docker ile Çalıştırma

```bash
docker compose up --build
```

---

## Proje Yapısı

```
features/          # Gherkin .feature dosyaları (S1–S6, B1) — @s1–@s6 tekil etiketleri
step_definitions/  # Step implementasyonları
pages/             # Page Object sınıfları
  ├── BasePage.js
  ├── HomePage.js
  ├── LoginPage.js
  ├── SearchPage.js
  ├── CartPage.js
  ├── ProductDetailPage.js
support/           # hooks.js, world.js, locators.js
fixtures/          # Test verisi üreticileri
utils/             # Config, WaitHelper, ApiHelper, AllureHelper
reports/           # Ekran görüntüsü, trace, video çıktıları
cucumber.js        # Cucumber yapılandırması
```


---

## AI Kullanımı

Geliştirme sürecinde AI araçları pair programming ortağı olarak kullanıldı: senaryo taslakları, bileşen iskeleti, refactoring önerileri ve mimari tartışmalar AI destekli yürütüldü. Üretilen her öneri manuel olarak incelendi; locator stabilitesi, bekleme stratejisi ve mimari uyum gibi kritik noktalarda geliştirici kararı esas alındı. AI'ın ürettiği hatalı veya Playwright izolasyon felsefesine aykırı yaklaşımlar (sahte assertion, session yutan catch bloğu, sabit sleep,uyumsuz pages yapısı vb.) tespit edilerek düzeltildi. Nihai kod, test senaryoları ve mimari tasarım tamamen geliştiriciye aittir. Ayrıntılı katkı tablosu ve öz değerlendirme için `REVIEW.md` dosyasına bakınız.

