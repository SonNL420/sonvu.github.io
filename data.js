/* ============================================================================
 * data.js — local-first data layer for PriceBook
 *
 * Source of truth lives in localStorage. Every record carries an `updatedAt`
 * timestamp and a `deleted` flag (soft delete) so the optional Supabase sync
 * layer (sync.js) can merge devices with simple last-write-wins.
 *
 * Nothing in here touches the network — the app is fully usable offline.
 * ==========================================================================*/

const RECORDS_KEY = 'pricebook.records.v1';
const SETTINGS_KEY = 'pricebook.settings.v1';

/* ── Units ──────────────────────────────────────────────────────────────────
 * Every unit maps onto a base unit (kg, L or each) with a multiplier so we can
 * normalise any entry to a comparable "price per base unit". That's what lets
 * us compare "$2 for 500 g" against "$3.50 for 1 kg".
 * ------------------------------------------------------------------------- */
export const UNITS = {
  each:    { label: 'each',  base: 'each', factor: 1 },
  dozen:   { label: 'dozen', base: 'each', factor: 12 },
  g:       { label: 'g',     base: 'kg',   factor: 0.001 },
  kg:      { label: 'kg',    base: 'kg',   factor: 1 },
  oz:      { label: 'oz',    base: 'kg',   factor: 0.0283495 },
  lb:      { label: 'lb',    base: 'kg',   factor: 0.453592 },
  ml:      { label: 'ml',    base: 'L',    factor: 0.001 },
  l:       { label: 'L',     base: 'L',    factor: 1 },
  'fl-oz': { label: 'fl oz', base: 'L',    factor: 0.0295735 },
};

/** Human label for a base unit, e.g. "per kg". */
export function perBaseLabel(base) {
  return base === 'each' ? 'each' : `per ${base}`;
}

/* ── Tiny pub/sub so the UI can re-render on any data change ─────────────── */
const listeners = new Set();
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function notify() {
  listeners.forEach((fn) => {
    try { fn(); } catch (err) { console.error('listener error', err); }
  });
}

/* ── Low-level persistence ──────────────────────────────────────────────── */
function readRaw() {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read records', err);
    return [];
  }
}

function writeRaw(records) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  notify();
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
export function uuid() {
  if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function itemKeyOf(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function nowISO() {
  return new Date().toISOString();
}

/** price / (quantity in base units) → comparable unit price. */
export function computeUnitPrice(price, quantity, unit) {
  const u = UNITS[unit];
  const qty = Number(quantity);
  const p = Number(price);
  if (!u || !isFinite(qty) || qty <= 0 || !isFinite(p)) return null;
  return p / (qty * u.factor);
}

/* ── Reads ──────────────────────────────────────────────────────────────── */

/** All non-deleted records, newest first. */
export function getRecords() {
  return readRaw()
    .filter((r) => !r.deleted)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (a.createdAt < b.createdAt ? 1 : -1)));
}

/** Raw rows including soft-deleted ones (used by sync + export). */
export function getAllRaw() {
  return readRaw();
}

/** Distinct shop names seen so far, alphabetical. */
export function getShops() {
  const set = new Set();
  getRecords().forEach((r) => r.shop && set.add(r.shop));
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Distinct item display names seen so far. */
export function getItemNames() {
  const map = new Map();
  getRecords().forEach((r) => { if (!map.has(r.itemKey)) map.set(r.itemKey, r.item); });
  return [...map.values()].sort((a, b) => a.localeCompare(b));
}

/* ── Stats & deal verdict ───────────────────────────────────────────────── */

function median(sortedNums) {
  if (!sortedNums.length) return null;
  const mid = Math.floor(sortedNums.length / 2);
  return sortedNums.length % 2 ? sortedNums[mid] : (sortedNums[mid - 1] + sortedNums[mid]) / 2;
}

/** The base unit ('kg' | 'L' | 'each') used by the most records in a set. */
export function primaryBaseUnit(records) {
  const counts = {};
  records.forEach((r) => { counts[r.baseUnit] = (counts[r.baseUnit] || 0) + 1; });
  let best = null;
  let n = -1;
  for (const [base, c] of Object.entries(counts)) {
    if (c > n) { n = c; best = base; }
  }
  return best;
}

/** Stats restricted to the records that share a given base unit. */
export function statsForBase(records, base) {
  return computeStats(records.filter((r) => r.baseUnit === base));
}

/**
 * Stats for a set of records sharing the same base unit.
 * Callers must pass records of a single base unit (see statsForBase); mixing
 * "per kg" and "each" prices would be meaningless.
 * Returns null when there's nothing comparable.
 */
export function computeStats(records) {
  const valid = records.filter((r) => isFinite(r.unitPrice) && r.unitPrice != null);
  if (!valid.length) return null;

  const prices = valid.map((r) => r.unitPrice).sort((a, b) => a - b);
  const cheapest = valid.reduce((min, r) => (r.unitPrice < min.unitPrice ? r : min), valid[0]);
  const mostRecent = valid.reduce((rec, r) => (r.date > rec.date ? r : rec), valid[0]);

  // latest price per shop
  const byShop = new Map();
  valid.forEach((r) => {
    const cur = byShop.get(r.shop);
    if (!cur || r.date > cur.date) byShop.set(r.shop, r);
  });

  return {
    count: valid.length,
    baseUnit: valid[0].baseUnit,
    min: prices[0],
    max: prices[prices.length - 1],
    median: median(prices),
    mean: prices.reduce((a, b) => a + b, 0) / prices.length,
    cheapest,
    mostRecent,
    perShop: [...byShop.values()].sort((a, b) => a.unitPrice - b.unitPrice),
  };
}

/**
 * Judge a unit price against historical stats.
 * Returns { level, label, note } where level ∈ best|good|average|pricey|none.
 */
export function verdict(unitPrice, stats) {
  if (!stats || !isFinite(unitPrice)) {
    return { level: 'none', label: 'No history yet', note: 'Log a few prices to compare.' };
  }
  const { min, median: med } = stats;
  if (unitPrice <= min * 1.001) {
    return { level: 'best', label: 'Best price yet 🏆', note: 'Cheapest you have ever recorded.' };
  }
  if (unitPrice <= med) {
    return { level: 'good', label: 'Good deal 👍', note: 'Below your typical price.' };
  }
  if (unitPrice <= med * 1.15) {
    return { level: 'average', label: 'About average 😐', note: 'Roughly what you usually pay.' };
  }
  return { level: 'pricey', label: 'Pricey 👎', note: 'Above your typical price.' };
}

/**
 * One summary row per distinct item, for the Items list.
 */
export function getItemSummaries() {
  const groups = new Map();
  getRecords().forEach((r) => {
    if (!groups.has(r.itemKey)) groups.set(r.itemKey, []);
    groups.get(r.itemKey).push(r);
  });

  const out = [];
  for (const [key, recs] of groups) {
    const base = primaryBaseUnit(recs);
    const stats = statsForBase(recs, base);
    const lastPaid = recs.reduce((rec, r) => (r.date > rec.date ? r : rec), recs[0]);
    out.push({
      itemKey: key,
      item: recs[0].item,
      count: recs.length,
      baseUnit: base,
      cheapest: stats ? stats.cheapest : null,
      mean: stats ? stats.mean : null,
      lastPaid,
      shopCount: new Set(recs.map((r) => r.shop)).size,
    });
  }
  return out.sort((a, b) => a.item.localeCompare(b.item));
}

/** Full detail for one item: its records + stats for the primary base unit. */
export function getItemDetail(itemKey) {
  const recs = getRecords().filter((r) => r.itemKey === itemKey);
  const base = primaryBaseUnit(recs);
  return {
    itemKey,
    item: recs[0] ? recs[0].item : itemKey,
    records: recs,
    primaryBase: base,
    stats: statsForBase(recs, base),
  };
}

/* ── Writes ─────────────────────────────────────────────────────────────── */

/** Create a record from raw form input. Returns the stored record. */
export function addRecord(input) {
  const records = readRaw();
  const unit = input.unit in UNITS ? input.unit : 'each';
  const rec = {
    id: uuid(),
    item: String(input.item || '').trim(),
    itemKey: itemKeyOf(input.item),
    shop: String(input.shop || '').trim(),
    price: Number(input.price),
    quantity: Number(input.quantity) || 1,
    unit,
    unitPrice: computeUnitPrice(input.price, input.quantity || 1, unit),
    baseUnit: UNITS[unit].base,
    date: input.date || nowISO().slice(0, 10),
    notes: String(input.notes || '').trim(),
    createdAt: nowISO(),
    updatedAt: nowISO(),
    deleted: false,
  };
  records.push(rec);
  writeRaw(records);
  return rec;
}

/** Patch an existing record and recompute derived fields. */
export function updateRecord(id, patch) {
  const records = readRaw();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const merged = { ...records[idx], ...patch };
  merged.itemKey = itemKeyOf(merged.item);
  const unit = merged.unit in UNITS ? merged.unit : 'each';
  merged.unit = unit;
  merged.baseUnit = UNITS[unit].base;
  merged.unitPrice = computeUnitPrice(merged.price, merged.quantity, unit);
  merged.updatedAt = nowISO();
  records[idx] = merged;
  writeRaw(records);
  return merged;
}

/** Soft-delete (keeps a tombstone so sync can propagate the removal). */
export function deleteRecord(id) {
  const records = readRaw();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return;
  records[idx] = { ...records[idx], deleted: true, updatedAt: nowISO() };
  writeRaw(records);
}

/**
 * Merge incoming records (e.g. from sync) using last-write-wins on updatedAt.
 * Returns the number of local rows that changed.
 */
export function upsertMany(incoming) {
  const records = readRaw();
  const byId = new Map(records.map((r) => [r.id, r]));
  let changed = 0;
  for (const remote of incoming) {
    if (!remote || !remote.id) continue;
    const local = byId.get(remote.id);
    if (!local || (remote.updatedAt || '') > (local.updatedAt || '')) {
      byId.set(remote.id, { ...local, ...remote });
      changed++;
    }
  }
  if (changed) writeRaw([...byId.values()]);
  return changed;
}

/* ── Settings (currency + sync config) ──────────────────────────────────── */
const DEFAULT_SETTINGS = {
  currency: guessCurrency(),
  locale: sanitizeLocale(navigator.language),
  supabaseUrl: '',
  supabaseKey: '',
};

/**
 * Some environments report non-standard locale tags (e.g. "en-US@posix" or
 * "en_US.UTF-8") that make Intl throw. Normalise to a valid BCP-47 tag.
 */
function sanitizeLocale(tag) {
  try {
    const cleaned = String(tag || '').split('@')[0].split('.')[0].replace(/_/g, '-');
    const canonical = Intl.getCanonicalLocales(cleaned);
    return canonical[0] || 'en-US';
  } catch {
    return 'en-US';
  }
}

/** The user's validated display locale. */
export function getLocale() {
  return sanitizeLocale(getSettings().locale);
}

function guessCurrency() {
  try {
    const region = sanitizeLocale(navigator.language).split('-')[1];
    const map = {
      US: 'USD', GB: 'GBP', VN: 'VND', DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR',
      NL: 'EUR', IE: 'EUR', PT: 'EUR', AT: 'EUR', BE: 'EUR', FI: 'EUR',
      JP: 'JPY', CN: 'CNY', IN: 'INR', CA: 'CAD', AU: 'AUD', CH: 'CHF',
      SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', BR: 'BRL', MX: 'MXN',
      KR: 'KRW', SG: 'SGD', TH: 'THB', PH: 'PHP', ID: 'IDR', MY: 'MYR',
    };
    return map[region] || 'USD';
  } catch {
    return 'USD';
  }
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function setSettings(patch) {
  const next = { ...getSettings(), ...patch };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  notify();
  return next;
}

/** Format a money amount in the user's chosen currency. */
export function formatMoney(amount, opts = {}) {
  if (amount == null || !isFinite(amount)) return '—';
  const { currency } = getSettings();
  const locale = getLocale();
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: opts.maxFractionDigits ?? 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/** Unit price formatted with its "per kg / per L / each" suffix. */
export function formatUnitPrice(unitPrice, baseUnit) {
  if (unitPrice == null || !isFinite(unitPrice)) return '—';
  return `${formatMoney(unitPrice, { maxFractionDigits: unitPrice < 10 ? 2 : 0 })} ${perBaseLabel(baseUnit)}`;
}

/* ── Export / import ────────────────────────────────────────────────────── */
export function exportJSON() {
  return JSON.stringify(
    { app: 'PriceBook', version: 1, exportedAt: nowISO(), records: readRaw() },
    null,
    2,
  );
}

/**
 * Import a previously exported file.
 * mode 'merge' (default) keeps existing rows and merges by id/updatedAt;
 * mode 'replace' wipes local rows first.
 * Returns { imported, total }.
 */
export function importJSON(text, mode = 'merge') {
  const data = JSON.parse(text);
  const incoming = Array.isArray(data) ? data : data.records;
  if (!Array.isArray(incoming)) throw new Error('No records found in file.');

  // normalise/repair each row so older or partial exports still load
  const cleaned = incoming.map((r) => {
    const unit = r.unit in UNITS ? r.unit : 'each';
    return {
      id: r.id || uuid(),
      item: String(r.item || '').trim(),
      itemKey: r.itemKey || itemKeyOf(r.item),
      shop: String(r.shop || '').trim(),
      price: Number(r.price),
      quantity: Number(r.quantity) || 1,
      unit,
      unitPrice: r.unitPrice != null ? Number(r.unitPrice) : computeUnitPrice(r.price, r.quantity || 1, unit),
      baseUnit: r.baseUnit || UNITS[unit].base,
      date: r.date || nowISO().slice(0, 10),
      notes: String(r.notes || ''),
      createdAt: r.createdAt || nowISO(),
      updatedAt: r.updatedAt || nowISO(),
      deleted: !!r.deleted,
    };
  });

  if (mode === 'replace') writeRaw([]);
  const imported = upsertMany(cleaned);
  return { imported, total: cleaned.length };
}
