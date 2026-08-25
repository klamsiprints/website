// ---------------------------------------------------------------
// KlamsiPrints – Produktkatalog
// Hier kannst du Produkte hinzufügen, ändern oder entfernen.
// price = Preis pro Stück in Euro.
// icon = SVG-Fallback; image = optionaler Pfad zu einem eigenen Produktbild.
// ---------------------------------------------------------------

const COLOR_OPTIONS = [
  "Schwarz", "Weiß", "Hellbraun (Holz-Farbe)", "Braun", "Dunkelbraun", "Creme-Weiß"
];
const SIZE_OPTIONS = ["Klein", "Mittel", "Groß"];
const SIZE_PRODUCT_IDS = ["osterhase", "huhn"];
const TEXT_PRODUCT_IDS = ["schilder"];

const ICONS = {
  bunny: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 18c-2-5-1-11 2-12 2 1 3 6 2 11" stroke="#1B4F9C" stroke-width="2" stroke-linecap="round"/>
    <path d="M31 18c2-5 1-11-2-12-2 1-3 6-2 11" stroke="#1B4F9C" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="24" cy="28" rx="11" ry="10" stroke="#1B4F9C" stroke-width="2"/>
    <circle cx="20" cy="26" r="1.4" fill="#1B4F9C"/>
    <circle cx="28" cy="26" r="1.4" fill="#1B4F9C"/>
    <path d="M22 31c1 1 3 1 4 0" stroke="#1B4F9C" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
  phoneHolder: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 34h28" stroke="#1B4F9C" stroke-width="2" stroke-linecap="round"/>
    <path d="M14 34V26l8-8 12 12" stroke="#1B4F9C" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <rect x="26" y="14" width="10" height="16" rx="2" transform="rotate(8 26 14)" stroke="#1B4F9C" stroke-width="2"/>
  </svg>`,
  keychain: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="6" stroke="#1B4F9C" stroke-width="2"/>
    <path d="M20 20l12 12" stroke="#1B4F9C" stroke-width="2" stroke-linecap="round"/>
    <path d="M28 28l4-4 4 4-4 4z" stroke="#1B4F9C" stroke-width="2" stroke-linejoin="round"/>
  </svg>`,
  vase: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 10h10l2 6-3 4v16a4 4 0 01-8 0V20l-3-4 2-6z" stroke="#1B4F9C" stroke-width="2" stroke-linejoin="round"/>
    <path d="M18 20h12" stroke="#1B4F9C" stroke-width="1.4"/>
    <path d="M18 26h12" stroke="#1B4F9C" stroke-width="1.4"/>
  </svg>`,
  cableClip: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 24a10 10 0 0120 0" stroke="#1B4F9C" stroke-width="2" stroke-linecap="round"/>
    <path d="M14 24v6a2 2 0 002 2h4" stroke="#1B4F9C" stroke-width="2" stroke-linecap="round"/>
    <path d="M34 24v6a2 2 0 01-2 2h-4" stroke="#1B4F9C" stroke-width="2" stroke-linecap="round"/>
    <path d="M10 24h4M34 24h4" stroke="#1B4F9C" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  toothbrush: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="10" width="18" height="26" rx="4" stroke="#1B4F9C" stroke-width="2"/>
    <circle cx="20" cy="17" r="1.3" fill="#1B4F9C"/>
    <circle cx="28" cy="17" r="1.3" fill="#1B4F9C"/>
    <circle cx="24" cy="21" r="1.3" fill="#1B4F9C"/>
    <path d="M19 30h10" stroke="#1B4F9C" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
  planter: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8c2 4 2 6 0 9M24 6c1 4 1 7-1 10M32 8c-2 4-2 6 0 9" stroke="#1B4F9C" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M14 20h20l-3 16H17l-3-16z" stroke="#1B4F9C" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="24" cy="38" rx="12" ry="2.4" stroke="#1B4F9C" stroke-width="1.6"/>
  </svg>`,
  standfoot: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 34c0-8 4-14 4-14h16s4 6 4 14" stroke="#1B4F9C" stroke-width="2" stroke-linejoin="round"/>
    <path d="M9 34h30" stroke="#1B4F9C" stroke-width="2" stroke-linecap="round"/>
    <rect x="18" y="12" width="12" height="9" rx="1.5" transform="rotate(-14 24 16)" stroke="#1B4F9C" stroke-width="2"/>
  </svg>`
};

const PRODUCTS = [
  { id: "osterhase-klein",  name: "Osterhase (Klein)",        desc: "Dekofigur, die dein Zuhause verschönert",  price: 3.5, category: "Frühling", icon: ICONS.bunny, img: "img/Hase.webp" },
  { id: "osterhase-mittel", name: "Osterhase (Mittel)", desc: "Mittlere Dekofigur für dein Zuhause", price: 4.5, category: "Frühling", icon: ICONS.bunny, img: "img/HasePflanze.webp" },
  { id: "osterhase-gross", name: "Osterhase (Groß)", desc: "Große Dekofigur für dein Zuhause", price: 5.5, category: "Frühling", icon: ICONS.bunny, img: "img/Hase.webp" },
  { id: "schilder", name: "Personalisierte Schilder",         desc: "Wunschtext eingeben, Design wird danach abgesprochen", price: 14, category: "Besondere Stücke", icon: ICONS.phoneHolder, img: "img/besteMAMA.webp" },
  { id: "huhn-klein",        name: "Huhn (Klein)",              desc: "Dekofigur, die dein Zuhause verschönert",           price: 3.5, category: "Frühling", icon: ICONS.vase, img: "img/HuhnFull.webp" },
  { id: "huhn-mittel", name: "Huhn (Mittel)", desc: "Mittlere Dekofigur für dein Zuhause", price: 4.5, category: "Frühling", icon: ICONS.vase, img: "img/HuhnPflanze.webp" },
  { id: "huhn-gross", name: "Huhn (Groß)", desc: "Große Dekofigur für dein Zuhause", price: 5.5, category: "Frühling", icon: ICONS.vase, img: "img/HuhnFull.webp" },
  { id: "hitster", name: "Hitster-Tower",       desc: "Perfekte für den Spieleabend",   price: 12.0, category: "Besondere Stücke", icon: ICONS.keychain, img: "img/Hitster-Tower.webp" },
  
];