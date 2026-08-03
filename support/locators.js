export const locators = {
  // Temel ve Ortak Elemanlar
  base: {
    cookieAcceptButton: '#onetrust-accept-btn-handler, button:has-text("Kabul Et"), button:has-text("Tümünü Kabul Et"), .onetrust-close-btn-handler',
    loadingSpinner: '.loading-spinner, .spinner, eb-loading-spinner'
  },

  // Ana Sayfa Elementleri
  home: {
    searchInput: '#txtSearchBox, input[name="search"], input[type="search"], [data-testid="search-input"]',
    searchButton: 'button.search-back, button:has(img[alt="search icon"]), button:has(img[src*="search-normal"]), .btn-search, button[type="submit"], .search-icon, i.icon-search, button:has-text("Ara")',
    loginButton: '.btn-login, a[href*="login"], button:has-text("Giriş Yap")',
    accountMenu: '#lnkMyAccount, span#lnkMyAccount, .header__menu.account-its, a[href*="update-profile"]',
    logoutButton: '#lnkSignOutNavNode, a#lnkSignOutNavNode, a[href*="logout"], button:has-text("Çıkış Yap"), .logout-link'
  },

  // Giriş ve Kayıt Sayfası Elementleri (DevTools #btnLoginWithEmail, #lnkWallet, #btnMyProfile, #btnCreateAccount)
  login: {
    emailTab: '#btnLoginWithEmail, .login-email-desktop, .btnLoginWithEmail, a.btnLoginWithEmail, span:has-text("E-posta")',
    emailInput: '#email, input[name="email"], input[type="email"], input[placeholder*="posta"], [data-testid="email-input"]',
    passwordInput: '#password, input[name="password"], input[type="password"], [data-testid="password-input"]',
    continueButton: 'button[type="submit"], #btnSubmit, #btnLogin, .btn-login, .btn-submit, button:has-text("Devam"), button:has-text("Giriş Yap / Hesap Oluştur")',
    loginSubmitButton: 'button[type="submit"], #btnLogin, #btnSubmit, .btn-login, .btn-submit, button:has-text("Giriş")',
    walletButton: 'a#lnkWallet, #lnkWallet',
    personalInfoLink: '#btnMyProfile, a#btnMyProfile, a:has-text("Kişisel Bilgiler")',
    errorMessage: 'cx-form-errors p[role="alert"], cx-form-errors p, p[role="alert"], .emailInputError, .alert-danger, .error-message',
    registerTab: 'button:has-text("Kayıt Ol"), a[href*="register"]'
  },

  // Kayıt Ol Formu Elementleri (DevTools #btnCreateAccount, #txtLastnameRegister)
  register: {
    nameInput: '#firstName, input[name="firstName"], input[formcontrolname="firstname"], input[name="name"], input[placeholder*="Ad"], [data-testid="first-name"]',
    surnameInput: '#txtLastnameRegister, input[formcontrolname="lastname"], input[name="lastName"], input[placeholder*="Soyad"], [data-testid="last-name"]',
    phoneInput: '#phone, input[name="phone"], input[formcontrolname="phone"], input[placeholder*="Telefon"], [data-testid="phone-input"]',
    registerSubmitButton: '#btnCreateAccount, button[type="submit"]:has-text("Hesap Oluştur"), #btnRegister, button[type="submit"]:has-text("Kayıt Ol")'
  },

  // Ürün Detay Sayfası (PDP) Elementleri
  productDetail: {
    productTitle: 'h1.product-name, h1.product-detail-name, h1, .product-name',
    addToCartButton: '#addToCartBtn, button:has-text("Sepete Ekle"), .add-to-basket, button[class*="add-to-cart"]'
  },

  // Arama Sonuç Sayfası Elementleri
  searchResult: {
    searchHeader: '.search-result-header, h1.page-title, .search-title',
    productCards: 'eb-product-list-item, .product-item, .product-card, div.product-list-item',
    productTitle: 'eb-product-list-item h2, eb-product-list-item .product-item-anchor, eb-product-list-item .product-name, .product-list-title',
    addToCartButtons: '.btn-add-to-cart, button:has-text("Sepete Ekle"), eb-add-to-cart button, .add-to-basket-btn, button[class*="add-to-cart"]',
    addedToCartToast: '.info-text, p.info-text, p:has-text("Ürün Sepete Eklendi!"), div:has-text("Ürün Sepete Eklendi!")',
    addedToCartModalCloseButton: 'button.close-button, .close-button, button[aria-label="Close"], button:has(.icon-close-modal), .icon-close-modal, button.close',
    addedToCartModalDialog: 'cx-add-to-cart-dialog, .modal-dialog, .modal-content',
    noResultContainer: '.no-result, .search-no-result, div:has-text("sonuç bulunamadı"), .empty-search-result'
  },

  // Alışveriş Sepeti Sayfası Elementleri (Görsellerdeki DevTools Seçicileri)
  cart: {
    cartBadge: 'span.number.ng-star-inserted, #iconMiniCart span.number, .my-basket span.number',
    cartItems: 'eb-cart-item:has(span.remove-item), div.cx-item-list-row.cart-item:has(span.remove-item)',
    quantityIncreaseButtons: 'span.plus-btn, .quantity-control span.plus-btn, span.plus-btn img[alt="plus"]',
    deleteProductButtons: 'span.remove-item, span.remove-item img[alt="sil"], .quantity-control span.remove-item',
    confirmDeleteModalButton: '.btn-remove, button.btn-remove, button:has-text("Sil"), .btn-delete-confirm',
    itemPrices: '.cart-item-price, .product-price, .item-price, .cart-price, [class*="price"], .amount',
    itemQuantities: 'input.quantity-input, .cart-quantity, input[name*="quantity"], #quantity',
    cartSubtotalPrice: '#txtTotal, #txtTotal.total-price, .total-price',
    productNames: 'eb-cart-item:has(span.remove-item) a.cs-link, eb-cart-item:has(span.remove-item)',
    emptyCartMessage: '.empty-cart, div:has-text("Sepetiniz boş"), div:has-text("sepetinizde ürün bulunmamaktadır"), .cart-empty'
  }
};
