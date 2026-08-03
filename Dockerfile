# Microsoft Resmi Playwright Linux (Ubuntu Jammy) İmajı
FROM mcr.microsoft.com/playwright:v1.45.0-jammy

# Konteyner içi çalışma dizini
WORKDIR /app

# Paket bağımlılık dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları temiz bir şekilde yükle
RUN npm ci

# Projenin kaynak kodlarını kopyala
COPY . .

# Raporlama ve kanıt klasörlerini hazırlayalım
RUN mkdir -p allure-results reports/allure-report screenshots

# Varsayılan çalıştırma komutu (2 Worker ile Paralel BDD Test Koşumu)
CMD ["npm", "run", "test:parallel"]
