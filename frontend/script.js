const API_URL = "https://compass-riu7.onrender.com";

// DOM Elements - Form & Grid
const itemForm = document.getElementById("itemForm");
const itemGrid = document.getElementById("itemGrid");
const locateBtn = document.getElementById("locateBtn");
const locationStatus = document.getElementById("locationStatus");

// DOM Elements - Report intro / gating
const reportIntro = document.getElementById("reportIntro");
const startLostBtn = document.getElementById("startLostBtn");
const startFoundBtn = document.getElementById("startFoundBtn");
const cancelReportBtn = document.getElementById("cancelReportBtn");
const reportAuthNote = document.getElementById("reportAuthNote");
const reportLoginLink = document.getElementById("reportLoginLink");

// DOM Elements - Auth Modals & Buttons
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const resendModal = document.getElementById("resendModal");
const openLoginBtn = document.getElementById("openLoginBtn");
const openRegisterBtn = document.getElementById("openRegisterBtn");
const openResendBtn = document.getElementById("openResendBtn");
const closeLogin = document.getElementById("closeLogin");
const closeRegister = document.getElementById("closeRegister");
const closeResend = document.getElementById("closeResend");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const resendForm = document.getElementById("resendForm");
const authLoggedOut = document.getElementById("authLoggedOut");
const authLoggedIn = document.getElementById("authLoggedIn");
const userGreeting = document.getElementById("userGreeting");
const logoutBtn = document.getElementById("logoutBtn");

// ----------------------------------------------------
// 1. AUTH STATE + MODAL CONTROLS
// ----------------------------------------------------

function isLoggedIn() {
  return !!localStorage.getItem("compassUser");
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("compassUser"));
  } catch {
    return null;
  }
}

function getToken() {
  return localStorage.getItem("compassToken");
}

function openModal(modal) {
  modal.classList.add("active");
}
function closeModal(modal) {
  modal.classList.remove("active");
}

openLoginBtn.addEventListener("click", () => openModal(loginModal));
openRegisterBtn.addEventListener("click", () => openModal(registerModal));
closeLogin.addEventListener("click", () => closeModal(loginModal));
closeRegister.addEventListener("click", () => closeModal(registerModal));

openResendBtn.addEventListener("click", () => {
  closeModal(loginModal);
  openModal(resendModal);
});
closeResend.addEventListener("click", () => closeModal(resendModal));

reportLoginLink.addEventListener("click", () => openModal(loginModal));

// Close modals when clicking outside modal box
window.addEventListener("click", (e) => {
  if (e.target === loginModal) closeModal(loginModal);
  if (e.target === registerModal) closeModal(registerModal);
  if (e.target === resendModal) closeModal(resendModal);
});

// Close on Escape
window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  [loginModal, registerModal, resendModal].forEach((m) => closeModal(m));
});

// Update UI based on logged-in user state
function checkAuthState() {
  const user = getCurrentUser();
  if (user) {
    authLoggedOut.style.display = "none";
    authLoggedIn.style.display = "flex";
    userGreeting.textContent = `👋 Hi, ${user.fullName.split(" ")[0]}`;
    reportAuthNote.hidden = true;
  } else {
    authLoggedOut.style.display = "flex";
    authLoggedIn.style.display = "none";
    reportAuthNote.hidden = false;
  }
}

// REGISTER FORM SUBMISSION
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fullName = document.getElementById("regFullName").value;
  const phone = document.getElementById("regPhone").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone, email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to register");

    alert(data.message);
    registerForm.reset();
    closeModal(registerModal);
  } catch (err) {
    alert("Registration failed: " + err.message);
  }
});

// LOGIN FORM SUBMISSION
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to login");

    localStorage.setItem("compassUser", JSON.stringify(data.user));
    localStorage.setItem("compassToken", data.token);
    loginForm.reset();
    closeModal(loginModal);
    checkAuthState();
    loadItems(); // re-render so gated contact info / actions reflect the new session
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

// RESEND VERIFICATION FORM SUBMISSION
resendForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("resendEmail").value;

  try {
    const res = await fetch(`${API_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to resend");

    alert(data.message);
    resendForm.reset();
    closeModal(resendModal);
  } catch (err) {
    alert("Error: " + err.message);
  }
});

// LOGOUT
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("compassUser");
  localStorage.removeItem("compassToken");
  checkAuthState();
  closeReportForm();
  loadItems();
});

// ----------------------------------------------------
// 2. REPORT FLOW (hidden until "I lost something" / "I found something",
//    and gated behind login)
// ----------------------------------------------------

function openReportForm(status) {
  if (!isLoggedIn()) {
    openModal(loginModal);
    return;
  }
  const statusInput = itemForm.querySelector(
    `input[name="status"][value="${status}"]`,
  );
  if (statusInput) statusInput.checked = true;

  reportIntro.hidden = true;
  itemForm.hidden = false;
  itemForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeReportForm() {
  itemForm.hidden = true;
  reportIntro.hidden = false;
  itemForm.reset();
  locationStatus.textContent = "";
  resetWizard();
  clearPhotoPreview();
}

startLostBtn.addEventListener("click", () => openReportForm("lost"));
startFoundBtn.addEventListener("click", () => openReportForm("found"));
cancelReportBtn.addEventListener("click", closeReportForm);

// ----------------------------------------------------
// 3. CATEGORY / SUB-CATEGORY WIZARD (one step visible at a time)
// ----------------------------------------------------

const wizardProgress = document.getElementById("wizardProgress");
const progressDots = document.querySelectorAll(".progress-dot");

const step1 = document.getElementById("step1");
const step2Sub = document.getElementById("step2Sub");
const step2Describe = document.getElementById("step2Describe");
const wizardSummary = document.getElementById("wizardSummary");
const summaryIcon = document.getElementById("summaryIcon");
const summaryText = document.getElementById("summaryText");
const summaryChangeBtn = document.getElementById("summaryChangeBtn");

const categoryCards = document.querySelectorAll(".category-card");
const subCategoryCardsContainer = document.getElementById("subCategoryCards");
const customSubRow = document.getElementById("customSubRow");
const customSubInput = document.getElementById("customSubInput");
const subContinueBtn = document.getElementById("subContinueBtn");
const customDescribeInput = document.getElementById("customDescribeInput");
const describeContinueBtn = document.getElementById("describeContinueBtn");
const subBackBtn = document.getElementById("subBackBtn");
const describeBackBtn = document.getElementById("describeBackBtn");

const categoryInput = document.getElementById("categoryInput");
const subCategoryInput = document.getElementById("subCategoryInput");
const restOfForm = document.getElementById("restOfForm");

const CATEGORY_ICONS = {
  Electronics: "💻",
  "Bag / Wallet": "🎒",
  "Documents / ID": "📄",
  Keys: "🔑",
  Other: "🗂️",
};

// Categories that get a sub-type picker (step2Sub) instead of a free-text
// "describe it" step (step2Describe).
const SUBCATEGORIES_BY_CATEGORY = {
  Electronics: [
    "Phone",
    "Laptop",
    "Earbuds",
    "Charger",
    "Tablet",
    "Smartwatch",
  ],
  "Bag / Wallet": ["Backpack", "Wallet", "Purse", "Handbag", "Pouch"],
};

// Show exactly one wizard step, hide everything else
function showOnlyStep(step) {
  [step1, step2Sub, step2Describe, wizardSummary].forEach((el) => {
    el.hidden = el !== step;
  });
  wizardProgress.hidden = step === wizardSummary;
}

function setActiveDot(n) {
  progressDots.forEach((dot) => {
    const dotNum = Number(dot.dataset.dot);
    dot.classList.toggle("active", dotNum === n);
    dot.classList.toggle("completed", dotNum < n);
  });
}

function resetWizard() {
  categoryCards.forEach((c) => c.classList.remove("selected"));
  categoryInput.value = "";
  subCategoryInput.value = "";
  customSubRow.hidden = true;
  customSubInput.value = "";
  customDescribeInput.value = "";
  subCategoryCardsContainer.innerHTML = "";

  showOnlyStep(step1);
  setActiveDot(1);

  restOfForm.hidden = true;
}

function completeWizard(category, subCategory) {
  categoryInput.value = category;
  subCategoryInput.value = subCategory || "";

  summaryIcon.textContent = CATEGORY_ICONS[category] || "🗂️";
  summaryText.textContent = subCategory
    ? `${category} · ${subCategory}`
    : category;

  showOnlyStep(wizardSummary);
  restOfForm.hidden = false;
}

function renderSubCategoryCards(category) {
  subCategoryCardsContainer.innerHTML = "";
  customSubRow.hidden = true;
  customSubInput.value = "";

  const subtypes = SUBCATEGORIES_BY_CATEGORY[category] || [];

  subtypes.forEach((subtype) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "subcategory-card";
    btn.textContent = subtype;
    btn.addEventListener("click", () => {
      completeWizard(category, subtype);
    });
    subCategoryCardsContainer.appendChild(btn);
  });

  const otherBtn = document.createElement("button");
  otherBtn.type = "button";
  otherBtn.className = "subcategory-card subcategory-card-other";
  otherBtn.textContent = "Other";
  otherBtn.addEventListener("click", () => {
    subCategoryCardsContainer
      .querySelectorAll(".subcategory-card")
      .forEach((b) => b.classList.remove("selected"));
    otherBtn.classList.add("selected");
    customSubRow.hidden = false;
    customSubInput.focus();
  });
  subCategoryCardsContainer.appendChild(otherBtn);
}

categoryCards.forEach((card) => {
  card.addEventListener("click", () => {
    categoryCards.forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    const category = card.dataset.category;

    setActiveDot(2);

    if (SUBCATEGORIES_BY_CATEGORY[category]) {
      renderSubCategoryCards(category);
      showOnlyStep(step2Sub);
    } else {
      showOnlyStep(step2Describe);
      customDescribeInput.value = "";
      customDescribeInput.focus();
    }
  });
});

subContinueBtn.addEventListener("click", () => {
  const subtype = customSubInput.value.trim();
  if (!subtype) {
    customSubInput.focus();
    return;
  }
  const category = categoryCardsSelected();
  completeWizard(category, subtype);
});

describeContinueBtn.addEventListener("click", () => {
  const description = customDescribeInput.value.trim();
  if (!description) {
    customDescribeInput.focus();
    return;
  }
  const category = categoryCardsSelected();
  completeWizard(category, description);
});

function categoryCardsSelected() {
  const selected = document.querySelector(".category-card.selected");
  return selected ? selected.dataset.category : "";
}

subBackBtn.addEventListener("click", () => {
  showOnlyStep(step1);
  setActiveDot(1);
});

describeBackBtn.addEventListener("click", () => {
  showOnlyStep(step1);
  setActiveDot(1);
});

// "change" on the summary chip reopens step 1 so the person can pick a
// different category/sub-type without leaving the report form entirely.
summaryChangeBtn.addEventListener("click", resetWizard);

// Initialize wizard to step 1 on load
resetWizard();

// ----------------------------------------------------
// 4. PHOTO PREVIEW
// ----------------------------------------------------

const photoInput = document.getElementById("photoInput");
const photoField = document.getElementById("photoField");
const photoPreview = document.getElementById("photoPreview");

function clearPhotoPreview() {
  photoField.classList.remove("has-photo");
  photoPreview.hidden = true;
  photoPreview.src = "";
}

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) {
    clearPhotoPreview();
    return;
  }
  const url = URL.createObjectURL(file);
  photoPreview.src = url;
  photoPreview.hidden = false;
  photoField.classList.add("has-photo");
});

// ----------------------------------------------------
// 5. ITEM REPORTING & FEED LOGIC
// ----------------------------------------------------

locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    locationStatus.textContent = "Geolocation not supported.";
    return;
  }
  locationStatus.textContent = "Locating...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      document.getElementById("latInput").value = pos.coords.latitude;
      document.getElementById("lngInput").value = pos.coords.longitude;
      locationStatus.textContent = "✅ Location captured";
    },
    () => {
      locationStatus.textContent = "❌ Location access denied";
    },
  );
});

itemForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isLoggedIn()) {
    openModal(loginModal);
    return;
  }

  if (!categoryInput.value.trim()) {
    alert("Please choose what kind of item it is.");
    return;
  }

  const formData = new FormData(itemForm);

  try {
    const res = await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || "Failed to submit");
    }
    closeReportForm();
    loadItems();
  } catch (err) {
    alert("Something went wrong: " + err.message);
  }
});

async function loadItems(query = "") {
  try {
    const res = await fetch(`${API_URL}/items${query}`);
    const items = await res.json();
    renderItems(items);
  } catch (err) {
    itemGrid.innerHTML =
      '<p class="feed-error">Could not load items. Is the backend running?</p>';
  }
}

// DELETE an item you posted
async function deleteItem(id) {
  if (!confirm("Delete this report? This can't be undone.")) return;
  try {
    const res = await fetch(`${API_URL}/items/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete");
    loadItems();
  } catch (err) {
    alert("Could not delete: " + err.message);
  }
}

// Mark an item you posted as resolved
async function resolveItem(id) {
  try {
    const res = await fetch(`${API_URL}/items/${id}/resolve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update");
    loadItems();
  } catch (err) {
    alert("Could not update: " + err.message);
  }
}

// Inline icon markup for the owner-action buttons (kept as constants so
// renderItems stays readable)
const ICON_CHECK =
  '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_TRASH =
  '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h12M8 6V4.5A1.5 1.5 0 019.5 3h1A1.5 1.5 0 0112 4.5V6m-6.5 0l.6 9.4a1.5 1.5 0 001.5 1.6h3.8a1.5 1.5 0 001.5-1.6l.6-9.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function renderItems(items) {
  itemGrid.innerHTML = "";
  if (!Array.isArray(items) || items.length === 0) {
    itemGrid.innerHTML =
      '<p class="feed-empty">No reports yet — be the first to post one.</p>';
    return;
  }

  const loggedIn = isLoggedIn();
  const currentUser = getCurrentUser();

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";

    const isOwner = loggedIn && currentUser && item.postedBy === currentUser.id;

    card.innerHTML = `
      <img src="${item.photoUrl ? item.photoUrl : "https://via.placeholder.com/300x180?text=No+Photo"}" alt="${item.itemName}">
      <div class="item-card-body">
        <span class="status-badge status-${item.status}">${item.status.toUpperCase()}</span>
        <h3>${item.itemName}</h3>
        <p><strong>${item.category}</strong> ${item.subCategory ? "· " + item.subCategory : ""}</p>
        <p>📍 ${item.city}</p>
        <p>${item.description || ""}</p>
        <div class="item-contact">
          ${
            loggedIn
              ? `<p class="contact-line">📞 ${item.contactInfo}</p>`
              : `<button type="button" class="reveal-contact-btn">🔒 Log in to view contact</button>`
          }
        </div>
        ${
          isOwner
            ? `<div class="item-owner-actions">
                <button type="button" class="owner-btn resolve-btn">${ICON_CHECK}Mark resolved</button>
                <button type="button" class="owner-btn delete-btn">${ICON_TRASH}Delete</button>
              </div>`
            : ""
        }
      </div>
    `;
    if (!loggedIn) {
      card
        .querySelector(".reveal-contact-btn")
        .addEventListener("click", () => openModal(loginModal));
    }
    if (isOwner) {
      card
        .querySelector(".resolve-btn")
        .addEventListener("click", () => resolveItem(item._id));
      card
        .querySelector(".delete-btn")
        .addEventListener("click", () => deleteItem(item._id));
    }
    itemGrid.appendChild(card);
  });

  observeCards();
}

// Fade cards in as they scroll into view
let cardObserver;
function observeCards() {
  if (!("IntersectionObserver" in window)) {
    document
      .querySelectorAll(".item-card")
      .forEach((c) => c.classList.add("in-view"));
    return;
  }
  if (!cardObserver) {
    cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            cardObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
  }
  document
    .querySelectorAll(".item-card:not(.in-view)")
    .forEach((c) => cardObserver.observe(c));
}

document.getElementById("filterBtn").addEventListener("click", () => {
  const city = document.getElementById("filterCity").value;
  const status = document.getElementById("filterStatus").value;
  const params = new URLSearchParams();
  if (city) params.append("city", city);
  if (status) params.append("status", status);
  loadItems("?" + params.toString());
});

document.getElementById("nearMeBtn").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `${API_URL}/items/nearby?lat=${latitude}&lng=${longitude}&radiusKm=15`,
      );
      const items = await res.json();
      renderItems(items);
    },
    () => alert("Location access denied."),
  );
});

// Initial Setup
checkAuthState();
loadItems();
