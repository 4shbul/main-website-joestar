const products = [
  {
    id: "ret-10",
    name: "Retatrutide",
    variant: "10mg",
    price: 1800000,
    image: "img-optimized/1.jpg.jpeg",
    category: "Peptide",
    tags: ["Fat Loss", "Healing"],
    description: "Peptide riset metabolik dengan fokus pada regulasi berat badan.",
    storage: "Simpan 2-8°C. Hindari cahaya langsung.",
    benefits: ["Metabolic support", "Appetite modulation", "Energy balance"],
  },
  {
    id: "ret-30",
    name: "Retatrutide",
    variant: "30mg",
    price: 5100000,
    image: "img-optimized/2.jpg.jpeg",
    category: "Peptide",
    tags: ["Fat Loss", "Healing"],
    description: "Konsentrasi lebih tinggi untuk kebutuhan riset intensif.",
    storage: "Simpan 2-8°C. Gunakan segera setelah reconstitusi.",
    benefits: ["Metabolic support", "Weight research", "Sustained protocol"],
  },
  {
    id: "cjc-ipa",
    name: "CJC + Ipamorelin",
    variant: "10mg",
    price: 1400000,
    image: "img-optimized/3.jpg.jpeg",
    category: "Peptide",
    tags: ["Muscle Growth", "Healing"],
    description: "Blend untuk riset hormon pertumbuhan dan pemulihan.",
    storage: "Simpan 2-8°C.",
    benefits: ["Recovery support", "Muscle research", "Sleep quality"],
    comingSoon: false,
  },
  {
    id: "ghk-cu",
    name: "GHK-Cu",
    variant: "100mg",
    price: 1100000,
    image: "img-optimized/4.jpg.jpeg",
    category: "Peptide",
    tags: ["Skin", "Healing"],
    description: "Copper peptide untuk riset peremajaan kulit.",
    storage: "Simpan 2-8°C.",
    benefits: ["Skin renewal", "Collagen support", "Healing"],
  },
  {
    id: "semax",
    name: "Semax",
    variant: "10mg",
    price: 1200000,
    image: "img-optimized/5.jpg.jpeg",
    category: "Peptide",
    tags: ["Cognitive"],
    description: "Peptide neuromodulator untuk riset kognitif.",
    storage: "Simpan 2-8°C.",
    benefits: ["Focus", "Neuro support", "Memory"],
  },
  {
    id: "motsc",
    name: "MOTS-c",
    variant: "10mg",
    price: 1200000,
    image: "img-optimized/6.jpg.jpeg",
    category: "Peptide",
    tags: ["Fat Loss", "Healing"],
    description: "Peptide mitokondria untuk riset energi selular.",
    storage: "Simpan 2-8°C.",
    benefits: ["Energy balance", "Metabolic support", "Recovery"],
  },
  {
    id: "selank",
    name: "Selank",
    variant: "10mg",
    price: 1200000,
    image: "img-optimized/7.jpg.jpeg",
    category: "Peptide",
    tags: ["Cognitive"],
    description: "Peptide anxiolytic untuk riset stres.",
    storage: "Simpan 2-8°C.",
    benefits: ["Stress balance", "Mood research", "Focus"],
  },
  {
    id: "dsip",
    name: "DSIP",
    variant: "10mg",
    price: 1200000,
    image: "img-optimized/8.jpg.jpeg",
    category: "Peptide",
    tags: ["Healing"],
    description: "Delta Sleep-Inducing Peptide untuk riset tidur.",
    storage: "Simpan 2-8°C.",
    benefits: ["Sleep quality", "Recovery", "Relaxation"],
  },
  {
    id: "wolverine",
    name: "Wolverine",
    variant: "10mg",
    price: 1500000,
    image: "img-optimized/9.jpg.jpeg",
    category: "Peptide",
    tags: ["Healing", "Muscle Growth"],
    description: "Peptide riset regenerasi jaringan.",
    storage: "Simpan 2-8°C.",
    benefits: ["Tissue repair", "Recovery", "Performance"],
  },
  {
    id: "kisspeptin",
    name: "Kisspeptin",
    variant: "10mg",
    price: 2000000,
    image: "img-optimized/10.jpg.jpeg",
    category: "Peptide",
    tags: ["Healing"],
    description: "Peptide hormonal untuk riset regulasi reproduksi.",
    storage: "Simpan 2-8°C.",
    benefits: ["Hormonal research", "Balance", "Protocol support"],
  },
  {
    id: "glutathione",
    name: "Glutathione",
    variant: "1500mg",
    price: 2000000,
    image: "img-optimized/11.jpg.jpeg",
    category: "Peptide",
    tags: ["Healing", "Skin"],
    description: "Antioksidan untuk riset detoksifikasi.",
    storage: "Simpan 2-8°C.",
    benefits: ["Detox", "Skin clarity", "Recovery"],
  },
  {
    id: "klow",
    name: "Klow",
    variant: "80mg",
    price: 3200000,
    image: "img-optimized/12.jpg.jpeg",
    category: "Peptide",
    tags: ["Healing"],
    description: "Produk riset khusus (detail menyusul).",
    storage: "Simpan 2-8°C.",
    benefits: ["Custom protocol", "Research only"],
    comingSoon: true,
  },
  {
    id: "bac-3",
    name: "Bac Water",
    variant: "3ml",
    price: 300000,
    image: "img-optimized/13.jpg.jpeg",
    category: "Supplies",
    tags: ["Supplies"],
    description: "Bacteriostatic water untuk reconstitusi.",
    storage: "Simpan suhu ruang sejuk.",
    benefits: ["Sterile", "Reconstitution"],
  },
  {
    id: "bac-10",
    name: "Bac Water",
    variant: "10ml",
    price: 500000,
    image: "img-optimized/14.jpg.jpeg",
    category: "Supplies",
    tags: ["Supplies"],
    description: "Bacteriostatic water untuk reconstitusi.",
    storage: "Simpan suhu ruang sejuk.",
    benefits: ["Sterile", "Reconstitution"],
    comingSoon: true,
  },
  {
    id: "hgh-150",
    name: "HGH 191AA / Somatropin (PO)",
    variant: "150 IU",
    price: 2500000,
    image: "img-optimized/15.jpg.jpeg",
    category: "HGH",
    tags: ["Muscle Growth", "Healing"],
    description: "Somatropin untuk riset hormon pertumbuhan.",
    storage: "Simpan 2-8°C.",
    benefits: ["Growth research", "Recovery", "Performance"],
  },
  {
    id: "hgh-240",
    name: "HGH 191AA / Somatropin (PO)",
    variant: "240 IU",
    price: 4000000,
    image: "img-optimized/16.jpg.jpeg",
    category: "HGH",
    tags: ["Muscle Growth", "Healing"],
    description: "Somatropin untuk riset hormon pertumbuhan.",
    storage: "Simpan 2-8°C.",
    benefits: ["Growth research", "Recovery", "Performance"],
  },
  {
    id: "hgh-360",
    name: "HGH 191AA / Somatropin (PO)",
    variant: "360 IU",
    price: 7000000,
    image: "img-optimized/17.jpg.jpeg",
    category: "HGH",
    tags: ["Muscle Growth", "Healing"],
    description: "Somatropin untuk kebutuhan riset intensif.",
    storage: "Simpan 2-8°C.",
    benefits: ["Growth research", "Performance", "Recovery"],
    comingSoon: true,
  },
];

const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const tagFilters = document.getElementById("tagFilters");
const cartDrawer = document.getElementById("cartDrawer");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const openCartBtn = document.getElementById("openCart");
const closeCartBtn = document.getElementById("closeCart");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckoutModal = document.getElementById("closeCheckoutModal");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutName = document.getElementById("checkoutName");
const checkoutPhone = document.getElementById("checkoutPhone");
const checkoutCity = document.getElementById("checkoutCity");
const checkoutPostal = document.getElementById("checkoutPostal");
const checkoutAddress = document.getElementById("checkoutAddress");
const checkoutNotes = document.getElementById("checkoutNotes");
const detailModal = document.getElementById("detailModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const newsletterModal = document.getElementById("newsletterModal");
const closeNewsletter = document.getElementById("closeNewsletter");
const otpModal = document.getElementById("otpModal");
const closeOtpModal = document.getElementById("closeOtpModal");
const otpForm = document.getElementById("otpForm");
const otpInput = document.getElementById("otpInput");
const toast = document.getElementById("toast");
const resendOtpBtn = document.getElementById("resendOtpBtn");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const forgotModal = document.getElementById("forgotModal");
const closeForgotModal = document.getElementById("closeForgotModal");
const forgotForm = document.getElementById("forgotForm");
const forgotUsername = document.getElementById("forgotUsername");
const resetModal = document.getElementById("resetModal");
const closeResetModal = document.getElementById("closeResetModal");
const resetForm = document.getElementById("resetForm");
const resetToken = document.getElementById("resetToken");
const resetPassword = document.getElementById("resetPassword");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const redeemForm = document.getElementById("redeemForm");
const logoutBtn = document.getElementById("logoutBtn");
const affiliateStatus = document.getElementById("affiliateStatus");
const salesTotalEl = document.getElementById("salesTotal");
const commissionTotalEl = document.getElementById("commissionTotal");
const affiliateCodeEl = document.getElementById("affiliateCode");
const salesList = document.getElementById("salesList");
const redeemInput = document.getElementById("redeemInput");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const accountName = document.getElementById("accountName");
const accountUsername = document.getElementById("accountUsername");
const accountStatus = document.getElementById("accountStatus");
const accountRole = document.getElementById("accountRole");
const accountLastLogin = document.getElementById("accountLastLogin");
const authDebug = document.getElementById("authDebug");
const generateCodesForm = document.getElementById("generateCodesForm");
const codeCount = document.getElementById("codeCount");
const generatedCodes = document.getElementById("generatedCodes");
const affiliateList = document.getElementById("affiliateList");
const refreshAffiliatesBtn = document.getElementById("refreshAffiliatesBtn");
const adminGuard = document.getElementById("adminGuard");
const adminGuardMessage = document.getElementById("adminGuardMessage");
const affiliateSearch = document.getElementById("affiliateSearch");
const statusFilter = document.getElementById("statusFilter");
const roleFilter = document.getElementById("roleFilter");
const limitFilter = document.getElementById("limitFilter");
const exportAffiliatesBtn = document.getElementById("exportAffiliatesBtn");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");
const auditLog = document.getElementById("auditLog");
const refreshAuditBtn = document.getElementById("refreshAuditBtn");
const adminTokenStatus = document.getElementById("adminTokenStatus");
const adminRoleStatus = document.getElementById("adminRoleStatus");
const orderForm = document.getElementById("orderForm");
const orderNumber = document.getElementById("orderNumber");
const orderTotal = document.getElementById("orderTotal");
const orderDate = document.getElementById("orderDate");
const orderAffiliate = document.getElementById("orderAffiliate");

const cart = {};
let activeTag = "all";
const COMMISSION_RATE = 0.04;
let pendingOtpSessionId = null;
const API_BASE =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "/api";

const formatIDR = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);

const renderProducts = () => {
  if (!grid) return;
  const query = searchInput.value.toLowerCase();
  const filtered = products.filter((product) => {
    const matchesTag =
      activeTag === "all" || product.tags.includes(activeTag) || product.category === activeTag;
    const matchesQuery =
      product.name.toLowerCase().includes(query) ||
      product.variant.toLowerCase().includes(query) ||
      product.tags.join(" ").toLowerCase().includes(query);
    return matchesTag && matchesQuery;
  });

  grid.innerHTML = "";
  filtered.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.productId = product.id;

    const priceLabel = product.price ? formatIDR(product.price) : "Hubungi Kami";
    card.innerHTML = `
      ${product.comingSoon ? '<span class="badge">COMING SOON</span>' : ""}
      <div class="product-image" data-detail="${product.id}">
        <img src="${product.image}" alt="${product.name} ${product.variant}" loading="lazy" />
      </div>
      <div>
        <h3>${product.name}</h3>
        <p class="product-meta">${product.variant} · ${product.category}</p>
      </div>
      <p class="price">${priceLabel}</p>
      <p class="product-meta">${product.tags.join(" · ")}</p>
      <button class="ghost" type="button" data-detail="${product.id}">View Details</button>
      <button class="primary" type="button" data-add="${product.id}" ${product.comingSoon ? "disabled" : ""}>
        ${product.comingSoon ? "Coming Soon" : "Add to Cart"}
      </button>
    `;

    grid.appendChild(card);
  });
};

const updateCartUI = () => {
  if (!cartItemsEl || !cartTotalEl || !cartCount) return;
  cartItemsEl.innerHTML = "";
  const items = Object.values(cart);
  let total = 0;

  if (!items.length) {
    cartItemsEl.innerHTML = "<p class=\"product-meta\">Keranjang masih kosong.</p>";
  }

  items.forEach((item) => {
    const itemTotal = (item.price || 0) * item.qty;
    total += itemTotal;

    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <strong>${item.name} ${item.variant}</strong>
      <span class="product-meta">${item.price ? formatIDR(item.price) : "Hubungi kami"}</span>
      <div class="cart-item-actions">
        <button data-dec="${item.id}">-</button>
        <span>${item.qty}</span>
        <button data-inc="${item.id}">+</button>
      </div>
    `;
    cartItemsEl.appendChild(el);
  });

  cartTotalEl.textContent = formatIDR(total);
  cartCount.textContent = items.reduce((sum, item) => sum + item.qty, 0);
};

const addToCart = (id) => {
  const product = products.find((item) => item.id === id);
  if (!product || product.comingSoon) return;

  if (!cart[id]) {
    cart[id] = { ...product, qty: 1 };
  } else {
    cart[id].qty += 1;
  }

  updateCartUI();
  cartDrawer.classList.add("active");
};

const changeQty = (id, delta) => {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) {
    delete cart[id];
  }
  updateCartUI();
};

const openDetail = (id) => {
  if (!detailModal || !modalBody) return;
  const product = products.find((item) => item.id === id);
  if (!product) return;

  modalBody.innerHTML = `
    <div class="detail-image">
      <img src="${product.image}" alt="${product.name} ${product.variant}" loading="lazy" />
    </div>
    <h3>${product.name} · ${product.variant}</h3>
    <p>${product.description}</p>
    <div>
      <h4>Benefits</h4>
      <ul>${product.benefits.map((b) => `<li>${b}</li>`).join("")}</ul>
    </div>
    <div>
      <h4>Storage</h4>
      <p>${product.storage}</p>
    </div>
    <p class="small">Disclaimer: Produk hanya untuk tujuan riset dan edukasi.</p>
  `;
  detailModal.classList.add("active");
};

const checkoutWhatsApp = (details) => {
  const items = Object.values(cart);
  if (!items.length) {
    showToast("Keranjang masih kosong. Silakan pilih produk terlebih dahulu.");
    return;
  }

  const affiliate = storage.get("jp_affiliate_code");
  const affiliateLine = affiliate ? `\nKode afiliasi: ${affiliate}` : "";
  const lines = items.map(
    (item) => `- ${item.name} ${item.variant} x${item.qty} (${item.price ? formatIDR(item.price) : "Hubungi"})`
  );
  const detailLines = details
    ? [
        `Nama: ${details.name}`,
        `WhatsApp: ${details.phone}`,
        `Kota: ${details.city}`,
        `Kode pos: ${details.postal}`,
        `Alamat: ${details.address}`,
        details.notes ? `Catatan: ${details.notes}` : "",
      ].filter(Boolean)
    : [];
  const message = [
    "Halo Joestar Peptide, saya ingin order:",
    ...lines,
    "",
    "Data pengiriman:",
    ...detailLines,
    affiliateLine,
    "\nMohon info total dan pembayaran. Terima kasih.",
  ].join("\n");

  const url = `https://wa.me/6287732013193?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
};

const setActiveTag = (tag) => {
  activeTag = tag;
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.tag === tag);
  });
  renderProducts();
};

if (searchInput) searchInput.addEventListener("input", renderProducts);

if (tagFilters) tagFilters.addEventListener("click", (event) => {
  const tag = event.target.dataset.tag;
  if (!tag) return;
  setActiveTag(tag === "Supplies" ? "Supplies" : tag);
});

const openCheckoutModal = () => {
  const items = Object.values(cart);
  if (!items.length) {
    showToast("Keranjang masih kosong. Silakan pilih produk terlebih dahulu.");
    return;
  }
  if (!checkoutModal) return;
  checkoutModal.classList.add("active");
};

if (openCartBtn) openCartBtn.addEventListener("click", () => cartDrawer.classList.add("active"));
if (closeCartBtn) closeCartBtn.addEventListener("click", () => cartDrawer.classList.remove("active"));
if (closeModal) closeModal.addEventListener("click", () => detailModal.classList.remove("active"));
if (checkoutBtn) checkoutBtn.addEventListener("click", openCheckoutModal);
if (closeCheckoutModal) closeCheckoutModal.addEventListener("click", () => checkoutModal.classList.remove("active"));
if (closeNewsletter) closeNewsletter.addEventListener("click", () => newsletterModal.classList.remove("active"));
if (closeOtpModal) closeOtpModal.addEventListener("click", closeOtp);
if (closeForgotModal) closeForgotModal.addEventListener("click", closeForgot);
if (closeResetModal) closeResetModal.addEventListener("click", closeReset);

if (forgotPasswordBtn) forgotPasswordBtn.addEventListener("click", openForgot);
if (resetPasswordBtn) resetPasswordBtn.addEventListener("click", () => openReset(""));

if (resendOtpBtn) {
  resendOtpBtn.addEventListener("click", async () => {
    if (!pendingOtpSessionId) return;
    try {
      await apiFetch("/auth/otp/resend", {
        method: "POST",
        body: JSON.stringify({ sessionId: pendingOtpSessionId }),
      });
      showToast("OTP dikirim ulang.");
    } catch (error) {
      showToast(error.message);
    }
  });
}

if (navToggle && navMenu) {
  navMenu.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");

  const toggleNav = (event) => {
    event.preventDefault();
    const isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  };

  navToggle.addEventListener("click", toggleNav);
  navToggle.addEventListener("touchstart", toggleNav, { passive: false });

  window.addEventListener("resize", () => {
    if (window.innerWidth > NAV_BREAKPOINT) {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
dropdownToggles.forEach((toggle) => {
  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    const parent = toggle.closest(".dropdown");
    if (!parent) return;
    parent.classList.toggle("open");
  });
});

if (grid) grid.addEventListener("click", (event) => {
  const addBtn = event.target.closest("[data-add]");
  const detailBtn = event.target.closest("[data-detail]");
  const addId = addBtn?.dataset.add;
  const detailId = detailBtn?.dataset.detail;
  const card = event.target.closest(".product-card");

  if (addId) {
    addToCart(addId);
    return;
  }
  if (detailId) {
    openDetail(detailId);
    return;
  }
  if (card && card.dataset.productId) {
    const imageClick = event.target.closest(".product-image");
    if (imageClick) {
      openDetail(card.dataset.productId);
    }
  }
});

if (cartItemsEl) cartItemsEl.addEventListener("click", (event) => {
  const inc = event.target.dataset.inc;
  const dec = event.target.dataset.dec;
  if (inc) changeQty(inc, 1);
  if (dec) changeQty(dec, -1);
});

const dropdownLinks = document.querySelectorAll(".dropdown-menu a");
dropdownLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const tag = event.target.dataset.tag;
    if (tag) setActiveTag(tag);
  });
});

const smoothScrollTo = (target) => {
  if (!target) return;
  const header = document.querySelector(".site-header");
  const offset = header ? header.offsetHeight + 12 : 0;
  const start = window.scrollY;
  const end = target.getBoundingClientRect().top + window.scrollY - offset;
  const distance = end - start;
  const duration = 650;
  const startTime = performance.now();

  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    window.scrollTo(0, start + distance * eased);
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

const NAV_BREAKPOINT = 1100;

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href") || "";
    if (href.startsWith("#")) {
      event.preventDefault();
      const target = document.querySelector(href);
      smoothScrollTo(target);
    }
    if (window.innerWidth <= NAV_BREAKPOINT && navMenu && navToggle) {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
});

const navSections = Array.from(document.querySelectorAll("main section[id]"));
const navLinks = Array.from(document.querySelectorAll(".nav-links a[href^=\"#\"]"));
if (navSections.length && navLinks.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0.1 }
  );

  navSections.forEach((section) => observer.observe(section));
}

const newsletterForm = document.getElementById("newsletterForm");
const newsletterPopupForm = document.getElementById("newsletterPopupForm");

const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      return;
    }
  },
};

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
};

const setCookie = (name, value, days = 7) => {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/`;
};

const getToken = () => {
  const local = storage.get("jp_auth_token");
  if (local) return local;
  const cookie = getCookie("jp_auth_token");
  if (cookie) storage.set("jp_auth_token", cookie);
  return cookie;
};

const setToken = (token) => {
  storage.set("jp_auth_token", token || "");
  if (token) setCookie("jp_auth_token", token);
};

const getRefreshToken = () => {
  const local = storage.get("jp_refresh_token");
  if (local) return local;
  const cookie = getCookie("jp_refresh_token");
  if (cookie) storage.set("jp_refresh_token", cookie);
  return cookie;
};

const setRefreshToken = (token) => {
  storage.set("jp_refresh_token", token || "");
  if (token) setCookie("jp_refresh_token", token);
};

const getCachedUser = () => {
  const raw = storage.get("jp_user_cache");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const setCachedUser = (user) => {
  if (!user) return;
  try {
    storage.set("jp_user_cache", JSON.stringify(user));
  } catch (error) {
    return;
  }
};

const decodeJwt = (token) => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch (error) {
    return null;
  }
};

const applyUserToUI = (user) => {
  if (!user) return;
  affiliateStatus.textContent = user.status || "active";
  affiliateCodeEl.textContent = user.affiliateCode || "-";
  if (accountName) accountName.textContent = user.name || "-";
  if (accountUsername) accountUsername.textContent = user.username || "-";
  if (accountStatus) accountStatus.textContent = user.status || "-";
  if (accountRole) accountRole.textContent = user.role || "-";
  if (accountLastLogin) {
    accountLastLogin.textContent = user.lastLogin
      ? new Date(user.lastLogin).toLocaleString("id-ID")
      : "-";
  }
};

const updateAuthDebug = (state = {}) => {
  if (!authDebug) return;
  const token = getToken();
  const refreshToken = getRefreshToken();
  const bits = [
    `token: ${token ? "OK" : "Missing"}`,
    `refresh: ${refreshToken ? "OK" : "Missing"}`,
  ];
  if (state.note) bits.push(`note: ${state.note}`);
  if (state.error) bits.push(`error: ${state.error}`);
  authDebug.textContent = bits.join(" | ");
};

const runSelfCheck = async () => {
  if (!authDebug) return;
  const token = getToken();
  let apiStatus = "unknown";
  let meStatus = "skip";
  try {
    const health = await fetch(`${API_BASE}/health`);
    apiStatus = health.ok ? "ok" : `err:${health.status}`;
  } catch (error) {
    apiStatus = "down";
  }

  if (token) {
    try {
      const meResp = await fetch(`${API_BASE}/affiliate/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      meStatus = meResp.ok ? "ok" : `err:${meResp.status}`;
    } catch (error) {
      meStatus = "down";
    }
  }

  updateAuthDebug({ note: `api:${apiStatus} me:${meStatus}` });
};

const getStoredUsername = () => {
  const newKey = storage.get("jp_affiliate_username");
  if (newKey) return newKey;
  const legacy = storage.get("jp_affiliate_email");
  if (legacy) {
    storage.set("jp_affiliate_username", legacy);
    storage.set("jp_affiliate_email", "");
    return legacy;
  }
  return "";
};

const setStoredUsername = (value) => storage.set("jp_affiliate_username", value || "");
const apiFetch = async (path, options = {}) => {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = {};
    }
  }
  if (!response.ok) {
    if (response.status === 401) {
      const refreshToken = getRefreshToken();
      if (refreshToken && !options._retry) {
        try {
          const refreshed = await apiFetch("/auth/refresh", {
            method: "POST",
            body: JSON.stringify({ refreshToken }),
            _retry: true,
          });
          setToken(refreshed.token);
          setRefreshToken(refreshed.refreshToken);
          return apiFetch(path, { ...options, _retry: true });
        } catch (error) {
          setToken("");
          setRefreshToken("");
        }
      }
    }
    const message = data.message || "Terjadi kesalahan pada server.";
    throw new Error(message);
  }
  return data;
};

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
};

const openOtpModal = (sessionId) => {
  if (!otpModal) return;
  pendingOtpSessionId = sessionId;
  otpInput.value = "";
  otpModal.classList.add("active");
};

const closeOtp = () => {
  if (!otpModal) return;
  otpModal.classList.remove("active");
  pendingOtpSessionId = null;
};

const openForgot = () => {
  if (!forgotModal) return;
  if (forgotUsername) forgotUsername.value = "";
  forgotModal.classList.add("active");
};

const closeForgot = () => {
  if (!forgotModal) return;
  forgotModal.classList.remove("active");
};

const openReset = (token) => {
  if (!resetModal) return;
  resetToken.value = token || "";
  resetPassword.value = "";
  resetModal.classList.add("active");
};

const renderAffiliateList = (affiliates) => {
  if (!affiliateList) return;
  if (!affiliates.length) {
    affiliateList.innerHTML = "<p class=\"product-meta\">Belum ada data affiliate.</p>";
    return;
  }

  affiliateList.innerHTML = affiliates
    .map(
      (item) => `
      <div class="admin-row">
        <div>
          <strong>${item.name}</strong>
          <div class="product-meta">${item.username}</div>
        </div>
        <div>${item.affiliate_code || "-"}</div>
        <div>${item.status}</div>
        <div>${item.role}</div>
        <div class="admin-actions">
          <select data-status="${item.id}">
            <option value="active" ${item.status === "active" ? "selected" : ""}>active</option>
            <option value="pending" ${item.status === "pending" ? "selected" : ""}>pending</option>
            <option value="banned" ${item.status === "banned" ? "selected" : ""}>banned</option>
          </select>
          <select data-role="${item.id}">
            <option value="affiliate" ${item.role === "affiliate" ? "selected" : ""}>affiliate</option>
            <option value="admin" ${item.role === "admin" ? "selected" : ""}>admin</option>
          </select>
          <button class="ghost" data-save="${item.id}">Save</button>
          <button class="ghost" data-otp="${item.id}">OTP</button>
          <button class="ghost" data-reset="${item.id}">Reset</button>
        </div>
      </div>
    `
    )
    .join("");
};

const adminState = {
  page: 1,
  limit: 10,
  search: "",
  status: "all",
  role: "all",
};

const updatePageInfo = (total) => {
  if (!pageInfo) return;
  const pages = Math.max(Math.ceil(total / adminState.limit), 1);
  pageInfo.textContent = `Page ${adminState.page} / ${pages}`;
  if (prevPageBtn) prevPageBtn.disabled = adminState.page <= 1;
  if (nextPageBtn) nextPageBtn.disabled = adminState.page >= pages;
};

const loadAffiliates = async () => {
  if (!affiliateList) return;
  try {
    const query = new URLSearchParams({
      page: adminState.page,
      limit: adminState.limit,
      search: adminState.search,
      status: adminState.status,
      role: adminState.role,
    });
    const result = await apiFetch(`/admin/affiliates?${query.toString()}`);
    renderAffiliateList(result.affiliates || []);
    updatePageInfo(result.total || 0);
  } catch (error) {
    affiliateList.innerHTML = `<p class="product-meta">${error.message}</p>`;
    showToast(error.message);
  }
};

const hideAdminPanel = () => {
  const adminSection = document.getElementById("admin");
  if (adminSection) adminSection.classList.add("hidden");
  if (adminGuard) adminGuard.style.display = "block";
};

const showAdminPanel = () => {
  const adminSection = document.getElementById("admin");
  if (adminSection) adminSection.classList.remove("hidden");
  if (adminGuard) adminGuard.style.display = "none";
};

const verifyAdminToken = async () => {
  try {
    const me = await apiFetch("/affiliate/me");
    if (me.role === "admin") {
      if (adminTokenStatus) adminTokenStatus.textContent = getToken() ? "OK" : "Missing";
      if (adminRoleStatus) adminRoleStatus.textContent = me.role || "-";
      showAdminPanel();
      loadAffiliates();
      loadAuditLog();
      return true;
    }
  } catch (error) {
    // ignore
  }
  return false;
};

const closeReset = () => {
  if (!resetModal) return;
  resetModal.classList.remove("active");
};


const updateAffiliateUI = async () => {
  if (!affiliateStatus || !affiliateCodeEl || !salesTotalEl || !commissionTotalEl || !salesList) return;
  const token = getToken();
  if (!token) {
    affiliateStatus.textContent = "Guest";
    affiliateCodeEl.textContent = "-";
    salesTotalEl.textContent = formatIDR(0);
    commissionTotalEl.textContent = formatIDR(0);
    salesList.innerHTML = "<p class=\"product-meta\">Silakan login untuk melihat penjualan.</p>";
    if (accountName) accountName.textContent = "-";
    if (accountUsername) accountUsername.textContent = "-";
    if (accountStatus) accountStatus.textContent = "-";
    if (accountRole) accountRole.textContent = "-";
    if (accountLastLogin) accountLastLogin.textContent = "-";
    updateAuthDebug({ note: "guest" });
    runSelfCheck();
    return;
  }

  let cached = getCachedUser();
  if (!cached) {
    const payload = decodeJwt(token);
    if (payload) {
      cached = {
        username: payload.username || "-",
        role: payload.role || "-",
        status: "active",
        affiliateCode: storage.get("jp_affiliate_code") || "-",
        lastLogin: null,
      };
      setCachedUser(cached);
    }
  }
  if (cached) applyUserToUI(cached);

  try {
    const me = await apiFetch("/affiliate/me");
    setCachedUser(me);
    const code = storage.get("jp_affiliate_code") || me.affiliateCode || "";

    applyUserToUI(me);

    if (!code) {
      salesList.innerHTML = "<p class=\"product-meta\">Masukkan kode redeem untuk melihat penjualan.</p>";
      salesTotalEl.textContent = formatIDR(0);
      commissionTotalEl.textContent = formatIDR(0);
      updateAuthDebug({ note: `user:${me.username}` });
      runSelfCheck();
      return;
    }

    const salesData = await apiFetch(`/affiliate/sales?code=${encodeURIComponent(code)}`);
    const sales = salesData.sales || [];
    const total = salesData.total || 0;
    const commission = salesData.commissionTotal || Math.round(total * COMMISSION_RATE);

    salesTotalEl.textContent = formatIDR(total);
    commissionTotalEl.textContent = formatIDR(commission);

    if (!sales.length) {
      salesList.innerHTML = "<p class=\"product-meta\">Belum ada data penjualan untuk kode ini.</p>";
      updateAuthDebug({ note: `user:${me.username}` });
      runSelfCheck();
      return;
    }

    salesList.innerHTML = sales
      .map(
        (sale) => `
        <div class="sales-item">
          <div>
            <strong>${sale.orderNumber}</strong>
            <p class="product-meta">${sale.orderDate}</p>
          </div>
          <span>${formatIDR(sale.totalAmount)}</span>
        </div>
      `
      )
      .join("");
    updateAuthDebug({ note: `user:${me.username}` });
    runSelfCheck();
  } catch (error) {
    if (!getToken()) {
      affiliateStatus.textContent = "Guest";
      affiliateCodeEl.textContent = "-";
      salesTotalEl.textContent = formatIDR(0);
      commissionTotalEl.textContent = formatIDR(0);
      if (accountName) accountName.textContent = "-";
      if (accountUsername) accountUsername.textContent = "-";
      if (accountStatus) accountStatus.textContent = "-";
      if (accountRole) accountRole.textContent = "-";
      if (accountLastLogin) accountLastLogin.textContent = "-";
    }
    const cached = getCachedUser();
    if (cached) applyUserToUI(cached);
    salesList.innerHTML = `<p class="product-meta">${error.message}</p>`;
    updateAuthDebug({ error: error.message });
    runSelfCheck();
  }
};

const handleLogin = async (event) => {
  event.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  if (!username || !password) {
    showToast("Username dan password wajib diisi.");
    return;
  }

  showToast("Memproses login...");
  try {
    const result = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (result.otpRequired) {
      openOtpModal(result.sessionId);
      showToast("OTP dikirim ke WhatsApp.");
      return;
    }

    if (result.token) {
      setToken(result.token);
      setRefreshToken(result.refreshToken || "");
      storage.set("jp_affiliate_username", result.user?.username || username);
      storage.set("jp_affiliate_code", result.user?.affiliateCode || "");
      setCachedUser(result.user || { username });
      updateAffiliateUI();
    }
    showToast("Login berhasil.");
  } catch (error) {
    showToast(error.message);
  }
};

const handleSignup = async (event) => {
  event.preventDefault();
  const name = document.getElementById("signupName").value.trim();
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const code = document.getElementById("signupCode").value.trim().toUpperCase();
  const phone = document.getElementById("signupPhone").value.trim();

  if (!name || !username || !password || !code || !phone) {
    showToast("Lengkapi semua field signup.");
    return;
  }
  showToast("Memproses signup...");
  try {
    await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, username, password, redeemCode: code, phone }),
    });
    showToast("Akun berhasil dibuat. Silakan login.");
    signupForm.reset();
  } catch (error) {
    showToast(error.message);
  }
};

const handleRedeem = async (event) => {
  event.preventDefault();
  const code = redeemInput.value.trim().toUpperCase();
  if (!code) return;
  storage.set("jp_affiliate_code", code);
  await updateAffiliateUI();
};

const handleLogout = async () => {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      // ignore
    }
  }
  storage.set("jp_affiliate_username", "");
  storage.set("jp_affiliate_name", "");
  storage.set("jp_affiliate_code", "");
  setToken("");
  setRefreshToken("");
  updateAffiliateUI();
};

const handleNewsletter = (event) => {
  event.preventDefault();
  showToast("Terima kasih! Anda telah terdaftar di newsletter.");
  newsletterModal.classList.remove("active");
};

if (newsletterForm) newsletterForm.addEventListener("submit", handleNewsletter);
if (newsletterPopupForm) newsletterPopupForm.addEventListener("submit", handleNewsletter);
if (checkoutForm) {
  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const details = {
      name: checkoutName?.value.trim(),
      phone: checkoutPhone?.value.trim(),
      city: checkoutCity?.value.trim(),
      postal: checkoutPostal?.value.trim(),
      address: checkoutAddress?.value.trim(),
      notes: checkoutNotes?.value.trim(),
    };

    if (!details.name || !details.phone || !details.city || !details.postal || !details.address) {
      showToast("Lengkapi nama, nomor WhatsApp, kota, kode pos, dan alamat.");
      return;
    }

    checkoutWhatsApp(details);
    checkoutModal.classList.remove("active");
    checkoutForm.reset();
  });
}
if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
  loginForm.dataset.bound = "app";
}
if (signupForm) {
  signupForm.addEventListener("submit", handleSignup);
  signupForm.dataset.bound = "app";
}
if (redeemForm) redeemForm.addEventListener("submit", handleRedeem);
if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
if (otpForm) otpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!pendingOtpSessionId) {
    showToast("Session OTP tidak ditemukan. Silakan login ulang.");
    return;
  }
  const code = otpInput.value.trim();
  if (!code) {
    showToast("Masukkan kode OTP.");
    return;
  }

  try {
    showToast("Memproses OTP...");
    const verify = await apiFetch("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ sessionId: pendingOtpSessionId, code }),
    });
    setToken(verify.token);
    setRefreshToken(verify.refreshToken || "");
    storage.set("jp_affiliate_username", verify.user.username);
    storage.set("jp_affiliate_code", verify.user.affiliateCode || "");
    setCachedUser(verify.user);
    applyUserToUI(verify.user);
    loginForm.reset();
    updateAffiliateUI();
    updateAuthDebug({ note: `user:${verify.user.username}` });
    closeOtp();
    showToast("Login berhasil.");
    if (adminGuard) {
      if (verify.user.role === "admin") {
        showAdminPanel();
        loadAffiliates();
        loadAuditLog();
      } else {
        showToast("Akun ini bukan admin.");
        handleLogout();
      }
    }
  } catch (error) {
    showToast(error.message);
  }
});

if (forgotForm) forgotForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = forgotUsername.value.trim();
  if (!username) return;
  try {
    await apiFetch("/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
    showToast("Token reset dikirim ke WhatsApp.");
    closeForgot();
  } catch (error) {
    showToast(error.message);
  }
});

if (resetForm) resetForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = resetToken.value.trim();
  const password = resetPassword.value.trim();
  if (!token || !password) return;
  try {
    await apiFetch("/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
    showToast("Password berhasil direset.");
    closeReset();
  } catch (error) {
    showToast(error.message);
  }
});


if (generateCodesForm) {
  generateCodesForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const count = Number(codeCount.value || 1);
    try {
      const result = await apiFetch("/admin/redeem-codes", {
        method: "POST",
        body: JSON.stringify({ count }),
      });
      const codes = result.codes || [];
      if (generatedCodes) {
        generatedCodes.innerHTML = codes
          .map((code) => `<span class="code-pill">${code}</span>`)
          .join("");
      }
      showToast("Kode berhasil dibuat.");
      loadAffiliates();
    } catch (error) {
      showToast(error.message);
    }
  });
}

if (refreshAffiliatesBtn) {
  refreshAffiliatesBtn.addEventListener("click", loadAffiliates);
}

if (affiliateList) {
  affiliateList.addEventListener("click", async (event) => {
    const saveId = event.target.dataset.save;
    const otpId = event.target.dataset.otp;
    const resetId = event.target.dataset.reset;

    if (saveId) {
      const statusSelect = affiliateList.querySelector(`select[data-status="${saveId}"]`);
      const roleSelect = affiliateList.querySelector(`select[data-role="${saveId}"]`);
      if (!statusSelect || !roleSelect) return;
      try {
        await apiFetch(`/admin/affiliates/${saveId}`, {
          method: "PATCH",
          body: JSON.stringify({ status: statusSelect.value }),
        });
        await apiFetch(`/admin/users/${saveId}/role`, {
          method: "PATCH",
          body: JSON.stringify({ role: roleSelect.value }),
        });
        showToast("Update berhasil.");
        loadAffiliates();
      } catch (error) {
        showToast(error.message);
      }
      return;
    }

    if (otpId) {
      try {
        await apiFetch(`/admin/users/${otpId}/otp/resend`, { method: "POST" });
        showToast("OTP dikirim ulang.");
      } catch (error) {
        showToast(error.message);
      }
      return;
    }

    if (resetId) {
      try {
        const result = await apiFetch(`/admin/users/${resetId}/reset-password`, { method: "POST" });
        showToast("Token reset dibuat.");
        if (result.token && generatedCodes) {
          generatedCodes.innerHTML = `<span class="code-pill">${result.token}</span>`;
        }
      } catch (error) {
        showToast(error.message);
      }
    }
  });
}

if (affiliateSearch) {
  affiliateSearch.addEventListener("input", (event) => {
    adminState.search = event.target.value.trim().toLowerCase();
    adminState.page = 1;
    loadAffiliates();
  });
}

if (statusFilter) {
  statusFilter.addEventListener("change", (event) => {
    adminState.status = event.target.value;
    adminState.page = 1;
    loadAffiliates();
  });
}

if (roleFilter) {
  roleFilter.addEventListener("change", (event) => {
    adminState.role = event.target.value;
    adminState.page = 1;
    loadAffiliates();
  });
}

if (limitFilter) {
  limitFilter.addEventListener("change", (event) => {
    adminState.limit = Number(event.target.value);
    adminState.page = 1;
    loadAffiliates();
  });
}

if (prevPageBtn) {
  prevPageBtn.addEventListener("click", () => {
    if (adminState.page > 1) {
      adminState.page -= 1;
      loadAffiliates();
    }
  });
}

if (nextPageBtn) {
  nextPageBtn.addEventListener("click", () => {
    adminState.page += 1;
    loadAffiliates();
  });
}

if (exportAffiliatesBtn) {
  exportAffiliatesBtn.addEventListener("click", async () => {
    const query = new URLSearchParams({
      search: adminState.search,
      status: adminState.status,
      role: adminState.role,
    });
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/affiliates/export?${query.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Gagal export data.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "affiliates.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Export berhasil.");
    } catch (error) {
      showToast(error.message);
    }
  });
}

const loadAuditLog = async () => {
  if (!auditLog) return;
  try {
    const result = await apiFetch("/admin/audit-log");
    const logs = result.logs || [];
    if (!logs.length) {
      auditLog.innerHTML = "<p class=\"product-meta\">Belum ada aktivitas admin.</p>";
      return;
    }
    auditLog.innerHTML = logs
      .map(
        (log) => `
        <div class="admin-row">
          <div><strong>${log.action}</strong></div>
          <div>${log.admin_username || "-"}</div>
          <div>${log.target_user_id || "-"}</div>
          <div>${new Date(log.created_at).toLocaleString("id-ID")}</div>
          <div>${log.metadata ? JSON.stringify(log.metadata) : "-"}</div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    auditLog.innerHTML = `<p class="product-meta">${error.message}</p>`;
  }
};

if (refreshAuditBtn) {
  refreshAuditBtn.addEventListener("click", loadAuditLog);
}

if (orderForm) {
  orderForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      orderNumber: orderNumber.value.trim(),
      totalAmount: Number(orderTotal.value),
      orderDate: orderDate.value,
      affiliateCode: orderAffiliate.value.trim() || null,
    };
    if (!payload.orderNumber || !payload.totalAmount || !payload.orderDate) {
      showToast("Lengkapi order number, total, dan tanggal.");
      return;
    }
    try {
      await apiFetch("/admin/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showToast("Order tersimpan.");
      orderForm.reset();
      loadAffiliates();
    } catch (error) {
      showToast(error.message);
    }
  });
}

const maybeShowNewsletter = () => {
  if (!newsletterModal) return;
  if (storage.get("jp_newsletter") === "hidden") return;
  setTimeout(() => {
    newsletterModal.classList.add("active");
    storage.set("jp_newsletter", "hidden");
  }, 2200);
};

renderProducts();
updateCartUI();
maybeShowNewsletter();
updateAffiliateUI();
if (adminGuard) {
  if (getToken()) {
    verifyAdminToken().then((ok) => {
      if (!ok) hideAdminPanel();
    });
  } else {
    hideAdminPanel();
  }
} else {
  loadAffiliates();
}

window.addEventListener("admin:login", () => {
  showAdminPanel();
  if (adminTokenStatus) adminTokenStatus.textContent = getToken() ? "OK" : "Missing";
  if (adminRoleStatus) adminRoleStatus.textContent = "admin";
  loadAffiliates();
  loadAuditLog();
});

if (window.location.hash.startsWith("#reset-")) {
  const token = window.location.hash.replace("#reset-", "");
  if (token) {
    openReset(token);
  }
}
