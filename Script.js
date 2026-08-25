(function(){
  "use strict";

  const TOTAL_STEPS = 7; // step 7 = Bestätigung (kein Nav)
  const STEP_LABELS = ["Produkte", "Menge & Farbe", "Versand", "Bezahlung", "Kontakt", "Übersicht"];

  let currentStep = 1;
  // selection: { [productId]: { qty: number, colors: string[], sizes?: string[] } }
  let selection = {};
  let shippingMethod = "abholung";
  let paymentMethod = "bar";
  let customer = { name: "", email: "", phone: "", note: "" };

  const el = (id) => document.getElementById(id);
  const fmt = (n) => n.toLocaleString('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  // ---------------- Render: Step 1 – Produktliste ----------------
  function renderProducts(){
    const grid = el('productGrid');
    grid.innerHTML = "";
    PRODUCTS.forEach(p => {
      const checked = !!selection[p.id];
      const item = document.createElement('div');
      item.className = "product-item" + (checked ? " is-checked" : "");
      item.setAttribute('role', 'checkbox');
      item.setAttribute('aria-checked', checked ? 'true' : 'false');
      item.tabIndex = 0;
      const imagePath = p.img || p.image;
      item.innerHTML = `
        <div class="product-thumb">
          ${imagePath ? `<img src="${imagePath}" alt="${p.name}" loading="lazy" decoding="async" width="56" height="56">` : p.icon}
        </div>
        <div class="product-info">
          <p class="product-name">${p.name}</p>
          <p class="product-desc">${p.desc}</p>
          <p class="product-price">${fmt(p.price)} / Stück</p>
        </div>
        <div class="checkbox">
          <svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      `;
      const toggle = () => toggleProduct(p.id);
      item.addEventListener('click', toggle);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
      });
      grid.appendChild(item);
    });
  }

  function toggleProduct(id){
    if (selection[id]){
      delete selection[id];
    } else {
      selection[id] = {
        qty: 1,
        colors: [COLOR_OPTIONS[0]],
        ...(SIZE_PRODUCT_IDS.includes(id) ? { sizes: [SIZE_OPTIONS[1]] } : {}),
        ...(TEXT_PRODUCT_IDS.includes(id) ? { texts: [""] } : {})
      };
    }
    renderProducts();
  }

  // ---------------- Render: Step 2 – Menge & Farbe ----------------
  function renderConfig(){
    const list = el('configList');
    list.innerHTML = "";
    const ids = Object.keys(selection);

    if (ids.length === 0){
      list.innerHTML = `<div class="card"><p class="step-desc" style="margin:0;">Du hast noch keine Produkte ausgewählt. Geh einen Schritt zurück.</p></div>`;
      return;
    }

    ids.forEach(id => {
      const p = PRODUCTS.find(x => x.id === id);
      const conf = selection[id];
      const hasSizes = SIZE_PRODUCT_IDS.includes(id);
      const card = document.createElement('div');
      card.className = "config-card";

      const colorRows = conf.colors.map((c, i) => `
        <div class="unit-color-row">
          <span class="unit-label">${p.name} #${i+1}</span>
          <select data-role="color" data-id="${id}" data-idx="${i}">
            ${COLOR_OPTIONS.map(opt => `<option value="${opt}" ${opt===c?'selected':''}>${opt}</option>`).join('')}
          </select>
          ${hasSizes ? `
            <div class="size-options" role="group" aria-label="Größe für ${p.name} Nummer ${i+1}">
              ${SIZE_OPTIONS.map(size => `<button type="button" class="size-option ${(conf.sizes?.[i] || SIZE_OPTIONS[1]) === size ? 'is-selected' : ''}" data-role="size" data-id="${id}" data-idx="${i}" data-size="${size}">${size}</button>`).join('')}
            </div>
          ` : ''}
        </div>
        ${TEXT_PRODUCT_IDS.includes(id) ? `
          <div class="custom-text-row">
            <label for="custom-text-${id}-${i}">Wunschtext für dieses Schild</label>
            <input id="custom-text-${id}-${i}" type="text" data-role="custom-text" data-id="${id}" data-idx="${i}" placeholder="z. B. Beste Mama">
          </div>
        ` : ''}
      `).join('');

      card.innerHTML = `
        <div class="config-card-head">
          <div class="config-thumb">${p.icon}</div>
          <div class="config-title">${p.name}<div class="config-unit-price">${fmt(p.price)} / Stück</div>${TEXT_PRODUCT_IDS.includes(id) ? '<div class="config-note">Nach deiner Bestellung kontaktieren wir dich, um das Design abzusprechen.</div>' : ''}</div>
        </div>
        <div class="qty-row">
          <span class="qty-label">Menge</span>
          <button type="button" class="qty-btn" data-role="dec" data-id="${id}" aria-label="weniger">−</button>
          <span class="qty-value">${conf.qty}</span>
          <button type="button" class="qty-btn" data-role="inc" data-id="${id}" aria-label="mehr">+</button>
        </div>
        <div class="unit-color-list">${colorRows}</div>
      `;
      list.appendChild(card);
    });

    // Event delegation for qty buttons and color selects
    list.querySelectorAll('[data-role="inc"]').forEach(btn => {
      btn.addEventListener('click', () => changeQty(btn.dataset.id, 1));
    });
    list.querySelectorAll('[data-role="dec"]').forEach(btn => {
      btn.addEventListener('click', () => changeQty(btn.dataset.id, -1));
    });
    list.querySelectorAll('[data-role="color"]').forEach(sel => {
      sel.addEventListener('change', () => {
        selection[sel.dataset.id].colors[parseInt(sel.dataset.idx, 10)] = sel.value;
      });
    });
    list.querySelectorAll('[data-role="size"]').forEach(button => {
      button.addEventListener('click', () => {
        const conf = selection[button.dataset.id];
        conf.sizes[parseInt(button.dataset.idx, 10)] = button.dataset.size;
        renderConfig();
      });
    });
    list.querySelectorAll('[data-role="custom-text"]').forEach(input => {
      const conf = selection[input.dataset.id];
      const index = parseInt(input.dataset.idx, 10);
      input.value = conf.texts?.[index] || '';
      input.addEventListener('input', () => {
        conf.texts[index] = input.value;
      });
    });
  }

  function changeQty(id, delta){
    const conf = selection[id];
    if (!conf) return;
    const newQty = Math.max(1, Math.min(20, conf.qty + delta));
    if (newQty === conf.qty) return;
    conf.qty = newQty;
    while (conf.colors.length < newQty) conf.colors.push(COLOR_OPTIONS[0]);
    while (conf.colors.length > newQty) conf.colors.pop();
    if (TEXT_PRODUCT_IDS.includes(id)){
      if (!conf.texts) conf.texts = [];
      while (conf.texts.length < newQty) conf.texts.push('');
      while (conf.texts.length > newQty) conf.texts.pop();
    }
    if (SIZE_PRODUCT_IDS.includes(id)){
      if (!conf.sizes) conf.sizes = [];
      while (conf.sizes.length < newQty) conf.sizes.push(SIZE_OPTIONS[1]);
      while (conf.sizes.length > newQty) conf.sizes.pop();
    }
    renderConfig();
  }

  // ---------------- Render: Step 3 – Versand ----------------
  const SHIPPING_OPTIONS = [
    { id: "abholung", title: "Abholung", text: "Du holst deine Bestellung persönlich ab. Wir vereinbaren einen Termin per E-Mail.", disabled: false },
    { id: "post", title: "Versand per Post", text: "Lieferung direkt zu dir nach Hause.", disabled: true }
  ];

  function renderShipping(){
    const list = el('shippingList');
    list.innerHTML = SHIPPING_OPTIONS.map(o => `
      <div class="option-card ${o.disabled ? 'is-disabled' : (shippingMethod===o.id ? 'is-selected' : '')}" data-id="${o.id}" data-disabled="${o.disabled}">
        <div class="option-radio"></div>
        <div class="option-body">
          <div class="option-title-row">
            <span class="option-title">${o.title}</span>
            <span class="badge ${o.disabled ? 'badge-soon' : 'badge-live'}">${o.disabled ? 'Bald verfügbar' : 'Verfügbar'}</span>
          </div>
          <p class="option-text">${o.text}</p>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', () => {
        if (card.dataset.disabled === "true") return;
        shippingMethod = card.dataset.id;
        renderShipping();
      });
    });
  }

  // ---------------- Render: Step 4 – Bezahlung ----------------
  const PAYMENT_OPTIONS = [
    { id: "bar", title: "Barzahlung", text: "Bezahlung bei Abholung in bar.", disabled: false },
    { id: "karte", title: "Kreditkarte", text: "Online-Zahlung per Kreditkarte.", disabled: true }
  ];

  function renderPayment(){
    const list = el('paymentList');
    list.innerHTML = PAYMENT_OPTIONS.map(o => `
      <div class="option-card ${o.disabled ? 'is-disabled' : (paymentMethod===o.id ? 'is-selected' : '')}" data-id="${o.id}" data-disabled="${o.disabled}">
        <div class="option-radio"></div>
        <div class="option-body">
          <div class="option-title-row">
            <span class="option-title">${o.title}</span>
            <span class="badge ${o.disabled ? 'badge-soon' : 'badge-live'}">${o.disabled ? 'Bald verfügbar' : 'Verfügbar'}</span>
          </div>
          <p class="option-text">${o.text}</p>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', () => {
        if (card.dataset.disabled === "true") return;
        paymentMethod = card.dataset.id;
        renderPayment();
      });
    });
  }

  // ---------------- Step 5 – Kontakt: sync fields ----------------
  function syncCustomerFromInputs(){
    customer.name = el('custName').value.trim();
    customer.email = el('custEmail').value.trim();
    customer.phone = el('custPhone').value.trim();
    customer.note = el('custNote').value.trim();
  }

  // ---------------- Render: Step 6 – Zusammenfassung ----------------
  function computeTotal(){
    return Object.entries(selection).reduce((sum, [id, conf]) => {
      const p = PRODUCTS.find(x => x.id === id);
      return sum + p.price * conf.qty;
    }, 0);
  }

  function renderSummary(){
    const card = el('summaryCard');
    const total = computeTotal();
    const shipObj = SHIPPING_OPTIONS.find(o => o.id === shippingMethod);
    const payObj = PAYMENT_OPTIONS.find(o => o.id === paymentMethod);

    const productLines = Object.entries(selection).map(([id, conf]) => {
      const p = PRODUCTS.find(x => x.id === id);
      const colorSummary = conf.colors.map((color, i) => {
        const size = SIZE_PRODUCT_IDS.includes(p.id) ? `, ${conf.sizes?.[i] || SIZE_OPTIONS[1]}` : '';
        const text = TEXT_PRODUCT_IDS.includes(p.id) && conf.texts?.[i] ? `, Wunschtext: ${conf.texts[i]}` : '';
        return `${color}${size}${text}`;
      }).join(" | ");
      return `
        <div class="summary-line">
          <div>
            <div class="summary-line-main">${p.name} × ${conf.qty}</div>
            <div class="summary-line-sub">Farbe${SIZE_PRODUCT_IDS.includes(p.id) ? " und Größe" : ""}: ${colorSummary}</div>
          </div>
          <div class="summary-price">${fmt(p.price * conf.qty)}</div>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div class="summary-block">
        <p class="summary-heading">Produkte</p>
        ${productLines}
      </div>
      <div class="summary-block">
        <p class="summary-heading">Versand &amp; Bezahlung</p>
        <div class="summary-line"><div class="summary-line-main">${shipObj.title}</div></div>
        <div class="summary-line"><div class="summary-line-main">${payObj.title}</div></div>
      </div>
      <div class="summary-block">
        <p class="summary-heading">Kontakt</p>
        <div class="summary-line"><div class="summary-line-main">${customer.name}</div><div class="summary-line-sub">${customer.email}${customer.phone ? ' · ' + customer.phone : ''}</div></div>
        ${customer.note ? `<div class="summary-line"><div class="summary-line-sub">${customer.note}</div></div>` : ''}
      </div>
      <div class="summary-total"><span>Gesamt</span><span>${fmt(total)}</span></div>
    `;
  }

  // ---------------- Navigation ----------------
  function updateProgress(){
    const pct = ((currentStep - 1) / (STEP_LABELS.length - 1)) * 100;
    el('progressFill').style.width = Math.min(pct, 100) + "%";
    el('progressHead').style.left = Math.min(pct, 100) + "%";

    const labelsWrap = el('progressLabels');
    labelsWrap.innerHTML = STEP_LABELS.map((l, i) => {
      const stepNum = i + 1;
      return `<span class="${stepNum === currentStep ? 'is-current' : ''}">${l}</span>`;
    }).join('');
  }

  function showStep(n){
    document.querySelectorAll('.step').forEach(s => {
      s.classList.toggle('is-active', parseInt(s.dataset.step, 10) === n);
    });

    const navRow = el('navRow');
    const backBtn = el('backBtn');
    const nextBtn = el('nextBtn');
    const submitBtn = el('submitBtn');

    if (n === 7){
      navRow.style.display = "none";
    } else {
      navRow.style.display = "flex";
      backBtn.style.visibility = n === 1 ? "hidden" : "visible";
      if (n === 6){
        nextBtn.style.display = "none";
        submitBtn.style.display = "inline-flex";
      } else {
        nextBtn.style.display = "inline-flex";
        submitBtn.style.display = "none";
      }
    }

    if (n <= 6) updateProgress();

    if (n === 2) renderConfig();
    if (n === 3) renderShipping();
    if (n === 4) renderPayment();
    if (n === 6) renderSummary();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateStep(n){
    if (n === 1){
      const ok = Object.keys(selection).length > 0;
      el('step1Error').classList.toggle('is-visible', !ok);
      return ok;
    }
    if (n === 2){
      const ok = Object.values(selection).every(c => c.colors.every(col => !!col));
      el('step2Error').classList.toggle('is-visible', !ok);
      return ok;
    }
    if (n === 5){
      syncCustomerFromInputs();
      const ok = customer.name.length > 1 && /\S+@\S+\.\S+/.test(customer.email);
      el('step5Error').classList.toggle('is-visible', !ok);
      return ok;
    }
    return true;
  }

  function goNext(){
    if (!validateStep(currentStep)) return;
    if (currentStep < TOTAL_STEPS){
      currentStep++;
      showStep(currentStep);
    }
  }

  function goBack(){
    if (currentStep > 1){
      currentStep--;
      showStep(currentStep);
    }
  }

  // ---------------- Submit / order storage ----------------
  function genOrderId(){
    return "KP-" + Date.now().toString(36).toUpperCase().slice(-6);
  }

  function saveOrder(){
    const order = {
      id: genOrderId(),
      date: new Date().toISOString(),
      items: Object.entries(selection).map(([id, conf]) => {
        const p = PRODUCTS.find(x => x.id === id);
        return { id, name: p.name, qty: conf.qty, colors: conf.colors, sizes: conf.sizes || [], texts: conf.texts || [], unitPrice: p.price, lineTotal: +(p.price * conf.qty).toFixed(2) };
      }),
      total: +computeTotal().toFixed(2),
      shipping: shippingMethod,
      payment: paymentMethod,
      customer: { ...customer }
    };

    // Lokal speichern (für Admin-Panel)
    const orders = JSON.parse(localStorage.getItem('klamsiprints_orders') || '[]');
    orders.push(order);
    localStorage.setItem('klamsiprints_orders', JSON.stringify(orders));

    // An Google Sheets senden. URL kommt aus dem Admin-Panel (falls dort geändert), sonst Standard-URL.
    const DEFAULT_SHEET_URL = "https://script.google.com/macros/s/AKfycbzLazmx0vyPWP_-3LXhPIBmPrmZAm2ueuB7wooHXePGOEYfG4zQ60VGvJDDE2oAgVzn/exec";
    const sheetUrl = localStorage.getItem('klamsiprints_sheet_url') || DEFAULT_SHEET_URL;
    if (sheetUrl){
      const payload = {
        id: order.id,
        date: order.date,
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        note: order.customer.note,
        products: order.items.map(i => `${i.name} x${i.qty} (${i.colors.map((color, index) => `${color}${i.sizes?.[index] ? ', ' + i.sizes[index] : ''}${i.texts?.[index] ? ', Wunschtext: ' + i.texts[index] : ''}`).join('/')})`).join('; '),
        total: order.total,
        shipping: order.shipping,
        payment: order.payment
      };
      fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors', // Apps Script Web Apps unterstützen meist kein CORS-Preflight
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).catch(() => { /* offline oder URL falsch – Bestellung bleibt trotzdem lokal gespeichert */ });
    }

    return order;
  }

  function resetForm(){
    selection = {};
    shippingMethod = "abholung";
    paymentMethod = "bar";
    customer = { name: "", email: "", phone: "", note: "" };
    el('custName').value = "";
    el('custEmail').value = "";
    el('custPhone').value = "";
    el('custNote').value = "";
    renderProducts();
    currentStep = 1;
    showStep(1);
  }

  // ---------------- Hidden admin trigger ----------------
  let logoClicks = 0;
  let logoClickTimer = null;
  el('logoBtn').addEventListener('click', () => {
    logoClicks++;
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => { logoClicks = 0; }, 1500);
    if (logoClicks >= 5){
      logoClicks = 0;
      window.location.href = "Admin.html";
    }
  });

  // ---------------- Wire up ----------------
  el('nextBtn').addEventListener('click', goNext);
  el('backBtn').addEventListener('click', goBack);
  el('submitBtn').addEventListener('click', () => {
    const order = saveOrder();
    el('confirmOrderId').textContent = "#" + order.id;
    currentStep = 7;
    showStep(7);
  });
  el('restartBtn').addEventListener('click', resetForm);
  el('orderForm').addEventListener('submit', (e) => e.preventDefault());

  // ---------------- Init ----------------
  renderProducts();
  showStep(1);
})();