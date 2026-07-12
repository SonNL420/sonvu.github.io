/* ============================================================================
 * app.js — UI controller for PriceBook
 * ==========================================================================*/

import * as DB from './data.js';
import * as Sync from './sync.js';
import { COMMON_FOODS } from './foods.js';
import { COMMON_SHOPS } from './shops.js';
import * as Charts from './charts.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const CURRENCIES = [
  ['USD', 'US Dollar'], ['EUR', 'Euro'], ['GBP', 'British Pound'], ['VND', 'Vietnamese Dong'],
  ['JPY', 'Japanese Yen'], ['CNY', 'Chinese Yuan'], ['INR', 'Indian Rupee'], ['CAD', 'Canadian Dollar'],
  ['AUD', 'Australian Dollar'], ['CHF', 'Swiss Franc'], ['SEK', 'Swedish Krona'], ['NOK', 'Norwegian Krone'],
  ['DKK', 'Danish Krone'], ['PLN', 'Polish Zloty'], ['CZK', 'Czech Koruna'], ['HUF', 'Hungarian Forint'],
  ['RON', 'Romanian Leu'], ['BRL', 'Brazilian Real'], ['MXN', 'Mexican Peso'], ['KRW', 'Korean Won'],
  ['SGD', 'Singapore Dollar'], ['THB', 'Thai Baht'], ['PHP', 'Philippine Peso'], ['IDR', 'Indonesian Rupiah'],
  ['MYR', 'Malaysian Ringgit'], ['ZAR', 'South African Rand'], ['NZD', 'NZ Dollar'], ['HKD', 'Hong Kong Dollar'],
  ['TRY', 'Turkish Lira'], ['AED', 'UAE Dirham'], ['SAR', 'Saudi Riyal'], ['ILS', 'Israeli Shekel'],
];

let currentView = 'add';
let currentItemKey = null;

/* ── Toast ───────────────────────────────────────────────────────────────── */
let toastTimer;
function toast(msg, isError = false) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.toggle('toast-error', isError);
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => { el.hidden = true; }, 250);
  }, 2600);
}

/* ── Unit <select> helpers ───────────────────────────────────────────────── */
function unitOptionsHTML(selected) {
  return Object.entries(DB.UNITS)
    .map(([key, u]) => `<option value="${key}"${key === selected ? ' selected' : ''}>${u.label}</option>`)
    .join('');
}

/* ── Navigation ──────────────────────────────────────────────────────────── */
function show(view, opts = {}) {
  currentView = view;
  $$('.view').forEach((v) => { v.hidden = v.dataset.view !== view; });
  $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.go === view));
  window.scrollTo(0, 0);

  if (view === 'add') renderAddDefaults();
  if (view === 'items') renderItems();
  if (view === 'detail') renderDetail(opts.itemKey);
  if (view === 'settings') renderSettings();
}

/* ════════════════════════════════ ADD ═══════════════════════════════════ */
function renderAddDefaults() {
  const unitSel = $('#f-unit');
  if (!unitSel.options.length) unitSel.innerHTML = unitOptionsHTML('each');
  const dateEl = $('#f-date');
  if (!dateEl.value) dateEl.value = new Date().toISOString().slice(0, 10);
  refreshDatalists();
  updateUnitPreview();
}

/* Suggestions: keep the <datalist> tiny at all times. Rendering the full
 * ~800-item list caused iOS Safari to hang, so we only ever put a small,
 * filtered set of matches in the DOM (rebuilt as the user types). */
const SUGGEST_LIMIT = 30;
let itemBase = [];
let shopBase = [];

/** Your own entries first, then the starter list (de-duplicated case-insensitively). */
function mergeSuggestions(userValues, commonValues) {
  const seen = new Set(userValues.map((n) => n.toLowerCase()));
  const merged = [...userValues];
  for (const v of commonValues) {
    if (!seen.has(v.toLowerCase())) { seen.add(v.toLowerCase()); merged.push(v); }
  }
  return merged;
}

function rebuildSuggestionBase() {
  itemBase = mergeSuggestions(DB.getItemNames(), COMMON_FOODS);
  shopBase = mergeSuggestions(DB.getShops(), COMMON_SHOPS);
}

/** Put at most SUGGEST_LIMIT matches (prefix-matches first) into a datalist. */
function fillDatalist(datalistEl, base, query) {
  const q = String(query || '').trim().toLowerCase();
  let matches;
  if (!q) {
    matches = base.slice(0, SUGGEST_LIMIT);
  } else {
    const starts = [], contains = [];
    for (const v of base) {
      const lv = v.toLowerCase();
      if (lv.startsWith(q)) starts.push(v);
      else if (lv.includes(q)) contains.push(v);
      if (starts.length >= SUGGEST_LIMIT) break;
    }
    matches = starts.concat(contains).slice(0, SUGGEST_LIMIT);
  }
  datalistEl.innerHTML = matches.map((n) => `<option value="${escapeAttr(n)}"></option>`).join('');
}

function refreshDatalists() {
  rebuildSuggestionBase();
  fillDatalist($('#items-datalist'), itemBase, $('#f-item').value);
  fillDatalist($('#shops-datalist'), shopBase, $('#f-shop').value);
}

function updateUnitPreview() {
  const price = parseFloat($('#f-price').value);
  const qty = parseFloat($('#f-qty').value);
  const unit = $('#f-unit').value;
  const preview = $('#unitPreview');
  const up = DB.computeUnitPrice(price, qty, unit);
  if (up == null || !isFinite(up)) { preview.hidden = true; return; }
  const base = DB.UNITS[unit].base;
  preview.textContent = `That's ${DB.formatUnitPrice(up, base)}`;
  preview.hidden = false;
}

function onAddSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const item = form.item.value.trim();
  const shop = form.shop.value.trim();
  const price = parseFloat(form.price.value);
  const qty = parseFloat(form.quantity.value);
  if (!item || !shop || !isFinite(price) || !isFinite(qty) || qty <= 0) {
    toast('Fill in item, shop, price and quantity.', true);
    return;
  }
  DB.addRecord({
    item, shop, price, quantity: qty,
    unit: form.unit.value,
    date: form.date.value,
    notes: form.notes.value,
  });

  // keep shop + date + unit for fast repeat entry; clear item/price/notes
  form.item.value = '';
  form.price.value = '';
  form.notes.value = '';
  form.quantity.value = '1';
  $('#unitPreview').hidden = true;
  // reset the item suggestions to the small top set before re-focusing so the
  // datalist popup never has to render the whole list (iOS hang guard)
  fillDatalist($('#items-datalist'), itemBase, '');
  form.item.focus();

  toast(`Saved ${item} at ${shop} ✓`);
  triggerSync();
}

/* ════════════════════════════════ ITEMS ═════════════════════════════════ */
function renderItems() {
  const q = $('#searchInput').value.trim().toLowerCase();
  let items = DB.getItemSummaries();
  if (q) items = items.filter((it) => it.item.toLowerCase().includes(q));

  const list = $('#itemsList');
  const empty = $('#itemsEmpty');
  const allEmpty = DB.getRecords().length === 0;

  empty.hidden = !allEmpty;
  if (allEmpty) { list.innerHTML = ''; return; }

  if (!items.length) {
    list.innerHTML = `<p class="muted" style="text-align:center;padding:24px">No items match “${escapeHTML(q)}”.</p>`;
    return;
  }

  list.innerHTML = items.map((it) => {
    const best = it.cheapest
      ? `<div class="item-card-best">${escapeHTML(DB.formatUnitPrice(it.cheapest.unitPrice, it.baseUnit))}</div>
         <div class="item-card-best-label">best · ${escapeHTML(it.cheapest.shop)}</div>`
      : '';
    const meta = `${it.count} ${it.count === 1 ? 'entry' : 'entries'} · ${it.shopCount} ${it.shopCount === 1 ? 'shop' : 'shops'}`;
    return `<button class="item-card" data-key="${escapeAttr(it.itemKey)}">
        <div class="item-card-main">
          <div class="item-card-name">${escapeHTML(it.item)}</div>
          <div class="item-card-meta">${meta}</div>
        </div>
        <div class="item-card-price">${best}</div>
      </button>`;
  }).join('');

  $$('.item-card', list).forEach((btn) => {
    btn.addEventListener('click', () => show('detail', { itemKey: btn.dataset.key }));
  });
}

/* ════════════════════════════════ DETAIL ════════════════════════════════ */
function renderDetail(itemKey) {
  if (itemKey) currentItemKey = itemKey;
  const detail = DB.getItemDetail(currentItemKey);
  if (!detail.records.length) { show('items'); return; }

  $('#detailTitle').textContent = detail.item;

  // Deal checker defaults: most common unit for this item, qty 1
  const commonUnit = mostCommonUnit(detail.records);
  $('#d-unit').innerHTML = unitOptionsHTML(commonUnit);
  $('#d-qty').value = '1';
  $('#d-price').value = '';
  $('#verdict').hidden = true;

  renderStats(detail);
  renderCharts(detail);
  renderHistory(detail);
}

function renderCharts(detail) {
  const el = $('#detailCharts');
  const s = detail.stats;
  if (!s) { el.innerHTML = ''; return; }

  const baseRecs = detail.records.filter((r) => r.baseUnit === detail.primaryBase);
  const perUnit = DB.perBaseLabel(detail.primaryBase);
  let html = '';

  const trend = Charts.priceTrendSVG(baseRecs, detail.primaryBase);
  if (trend) {
    html += `<div class="card chart-card">
        <h2 class="card-title">Price trend</h2>
        <p class="muted small">Unit price (${escapeHTML(perUnit)}) over time · cheapest point in green.</p>
        ${trend}
      </div>`;
  }

  if (s.perShop && s.perShop.length > 1) {
    html += `<div class="card chart-card">
        <h2 class="card-title">By shop</h2>
        <p class="muted small">Latest price ${escapeHTML(perUnit)} per shop — cheapest first.</p>
        <div class="bars">${Charts.shopBarsHTML(s.perShop, detail.primaryBase)}</div>
      </div>`;
  }

  el.innerHTML = html;
}

function mostCommonUnit(records) {
  const counts = {};
  records.forEach((r) => { counts[r.unit] = (counts[r.unit] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'each';
}

function renderStats(detail) {
  const s = detail.stats;
  const grid = $('#detailStats');
  if (!s) { grid.innerHTML = ''; return; }
  const lastPaid = s.mostRecent;
  grid.innerHTML = `
    <div class="stat">
      <div class="stat-label">Cheapest</div>
      <div class="stat-value">${escapeHTML(DB.formatUnitPrice(s.min, s.baseUnit))}</div>
      <div class="stat-sub">${escapeHTML(s.cheapest.shop)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Average</div>
      <div class="stat-value">${escapeHTML(DB.formatUnitPrice(s.mean, s.baseUnit))}</div>
      <div class="stat-sub">${s.count} ${s.count === 1 ? 'price' : 'prices'}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Last paid</div>
      <div class="stat-value">${escapeHTML(DB.formatUnitPrice(lastPaid.unitPrice, lastPaid.baseUnit))}</div>
      <div class="stat-sub">${escapeHTML(fmtDate(lastPaid.date))}</div>
    </div>`;
}

function updateVerdict() {
  const price = parseFloat($('#d-price').value);
  const qty = parseFloat($('#d-qty').value);
  const unit = $('#d-unit').value;
  const box = $('#verdict');
  if (!isFinite(price) || !isFinite(qty) || qty <= 0) { box.hidden = true; return; }

  const base = DB.UNITS[unit].base;
  const up = DB.computeUnitPrice(price, qty, unit);
  const detail = DB.getItemDetail(currentItemKey);
  const stats = DB.statsForBase(detail.records, base);
  const v = DB.verdict(up, stats);

  let ref = '';
  if (stats) {
    ref = `<div class="verdict-ref">You pay ${DB.formatUnitPrice(up, base)} here · cheapest seen ${DB.formatUnitPrice(stats.min, base)} at ${escapeHTML(stats.cheapest.shop)} (${escapeHTML(fmtDate(stats.cheapest.date))})</div>`;
  } else {
    ref = `<div class="verdict-ref">No past prices for this item in ${DB.perBaseLabel(base)} yet — this will be your first.</div>`;
  }
  box.className = `verdict ${v.level}`;
  box.innerHTML = `<div class="verdict-label">${v.label}</div><div class="verdict-note">${v.note}</div>${ref}`;
  box.hidden = false;
}

function renderHistory(detail) {
  const list = $('#historyList');
  const cheapestId = detail.stats ? detail.stats.cheapest.id : null;
  list.innerHTML = detail.records.map((r) => {
    const isCheapest = r.id === cheapestId;
    return `<div class="history-row${isCheapest ? ' history-cheapest' : ''}">
        <div class="history-main">
          <div class="history-shop">${escapeHTML(r.shop)}${isCheapest ? ' 🏆' : ''}</div>
          <div class="history-sub">${escapeHTML(fmtDate(r.date))} · ${escapeHTML(fmtQty(r.quantity))} ${escapeHTML(DB.UNITS[r.unit]?.label || r.unit)}${r.notes ? ' · ' + escapeHTML(r.notes) : ''}</div>
        </div>
        <div class="history-price">
          <div class="history-amount">${escapeHTML(DB.formatMoney(r.price))}</div>
          <div class="history-unit">${escapeHTML(DB.formatUnitPrice(r.unitPrice, r.baseUnit))}</div>
        </div>
        <button class="del-btn" data-del="${escapeAttr(r.id)}" title="Delete entry" aria-label="Delete entry">✕</button>
      </div>`;
  }).join('');

  $$('.del-btn', list).forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this price entry?')) return;
      DB.deleteRecord(btn.dataset.del);
      toast('Entry deleted');
      triggerSync();
      const left = DB.getItemDetail(currentItemKey);
      if (left.records.length) renderDetail(); else show('items');
    });
  });
}

/* ════════════════════════════════ SETTINGS ══════════════════════════════ */
function renderSettings() {
  const s = DB.getSettings();

  const curSel = $('#s-currency');
  if (!curSel.options.length) {
    const codes = new Set(CURRENCIES.map((c) => c[0]));
    if (!codes.has(s.currency)) CURRENCIES.unshift([s.currency, s.currency]);
    curSel.innerHTML = CURRENCIES.map(([code, name]) => `<option value="${code}">${code} — ${name}</option>`).join('');
  }
  curSel.value = s.currency;

  $('#s-url').value = s.supabaseUrl || '';
  $('#s-key').value = s.supabaseKey || '';
  refreshAuthUI();
}

async function refreshAuthUI() {
  const block = $('#authBlock');
  block.hidden = !Sync.isConfigured();
  if (!Sync.isConfigured()) return;

  const user = await Sync.getUser();
  $('#signedIn').hidden = !user;
  $('#signedOut').hidden = !!user;
  if (user) $('#userEmail').textContent = user.email || 'your account';
}

/* ── Sync status pill ────────────────────────────────────────────────────── */
let lastSyncError = null;

async function refreshSyncStatus() {
  const pill = $('#syncPill');
  const label = $('#syncLabel');
  pill.className = 'sync-pill';
  if (!Sync.isConfigured()) { label.textContent = 'Local'; return; }
  if (!navigator.onLine) { pill.classList.add('is-offline'); label.textContent = 'Offline'; return; }
  // A real sync failure trumps everything else so it can't be silently hidden.
  if (lastSyncError) { pill.classList.add('is-error'); label.textContent = 'Sync error'; return; }
  const user = await Sync.getUser();
  if (!user) { label.textContent = 'Sign in'; return; }
  pill.classList.add('is-synced'); label.textContent = 'Synced';
}

/** Turn a failed sync result into a plain-language message (or null if it's an
 *  expected state like offline/signed-out that the badge already shows). */
function syncErrorText(res) {
  const detail = res.error && (res.error.message || res.error.msg || res.error.hint || '');
  switch (res.reason) {
    case 'signed-out':
    case 'offline':
    case 'not-configured':
      return null;
    case 'load-failed':
      return 'Sync failed: couldn’t load the Supabase client (offline or blocked?).';
    case 'push-failed':
    case 'pull-failed':
      if (/relation .*prices.* does not exist|could not find the table|schema cache/i.test(detail)) {
        return 'Sync failed: the “prices” table is missing in Supabase — run the setup SQL from the README.';
      }
      if (/jwt|invalid.*key|api key/i.test(detail)) {
        return 'Sync failed: Supabase key looks wrong — re-check the anon key in Settings.';
      }
      return `Sync failed (${res.reason})${detail ? ': ' + detail : ''}`;
    default:
      return `Sync failed (${res.reason || 'unknown'})`;
  }
}

let syncing = false;
async function triggerSync(showResult = false) {
  if (!Sync.isConfigured() || !navigator.onLine || syncing) return;
  syncing = true;
  try {
    const res = await Sync.sync();
    if (res.ok) {
      lastSyncError = null;
      if (showResult) toast(`Synced · ${res.pulled} in, ${res.pushed} out`);
    } else {
      const msg = syncErrorText(res);
      if (msg) {
        // Surface real failures even on automatic syncs — but don't repeat the
        // same message on every retry (badge stays red regardless).
        const isNew = msg !== lastSyncError;
        lastSyncError = msg;
        if (showResult || isNew) toast(msg, true);
        console.error('Sync error:', res);
      } else if (showResult && res.reason === 'signed-out') {
        toast('Sign in to sync (Settings → Sync).', true);
      }
    }
  } catch (err) {
    console.error(err);
    lastSyncError = 'Sync failed unexpectedly — see the browser console.';
    if (showResult) toast(lastSyncError, true);
  } finally {
    syncing = false;
    refreshSyncStatus();
  }
}

/* ── Formatting helpers ──────────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(d)) return iso;
  try {
    return d.toLocaleDateString(DB.getLocale(), { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}
function fmtQty(q) {
  try {
    return Number(q).toLocaleString(DB.getLocale(), { maximumFractionDigits: 3 });
  } catch {
    return String(q);
  }
}
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(s) { return escapeHTML(s); }

/* ════════════════════════════════ WIRING ════════════════════════════════ */
function wire() {
  // tabs
  $$('.tab').forEach((t) => t.addEventListener('click', () => show(t.dataset.go)));
  $('#backBtn').addEventListener('click', () => show('items'));

  // add form
  $('#addForm').addEventListener('submit', onAddSubmit);
  ['#f-price', '#f-qty', '#f-unit'].forEach((sel) => {
    $(sel).addEventListener('input', updateUnitPreview);
    $(sel).addEventListener('change', updateUnitPreview);
  });

  // live-filter the suggestion datalists (keeps them tiny → no iOS hang)
  $('#f-item').addEventListener('input', () => fillDatalist($('#items-datalist'), itemBase, $('#f-item').value));
  $('#f-shop').addEventListener('input', () => fillDatalist($('#shops-datalist'), shopBase, $('#f-shop').value));

  // items search
  $('#searchInput').addEventListener('input', renderItems);

  // deal checker
  ['#d-price', '#d-qty', '#d-unit'].forEach((sel) => {
    $(sel).addEventListener('input', updateVerdict);
    $(sel).addEventListener('change', updateVerdict);
  });

  // settings: currency
  $('#s-currency').addEventListener('change', (e) => {
    DB.setSettings({ currency: e.target.value });
    toast('Currency updated');
  });

  // settings: supabase connection
  $('#saveSupabase').addEventListener('click', () => {
    const url = $('#s-url').value.trim().replace(/\/$/, '');
    const key = $('#s-key').value.trim();
    DB.setSettings({ supabaseUrl: url, supabaseKey: key });
    toast(url && key ? 'Connection saved' : 'Connection cleared');
    refreshAuthUI();
    refreshSyncStatus();
  });

  $('#signInBtn').addEventListener('click', async () => {
    const email = $('#s-email').value.trim();
    const password = $('#s-password').value;
    const msg = $('#authMsg');
    msg.hidden = true;
    if (!email || !password) { toast('Enter your email and password.', true); return; }
    const btn = $('#signInBtn');
    btn.disabled = true; btn.textContent = 'Signing in…';
    try {
      await Sync.signInWithPassword(email, password);
      $('#s-password').value = '';
      toast('Signed in ✓');
      await refreshAuthUI();
      await triggerSync(true);
      refreshSyncStatus();
    } catch (err) {
      msg.textContent = err.message || 'Could not sign in.';
      msg.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'Sign in / Create account';
    }
  });

  $('#syncNow').addEventListener('click', () => triggerSync(true));
  $('#signOut').addEventListener('click', async () => {
    await Sync.signOut();
    toast('Signed out');
    refreshAuthUI();
    refreshSyncStatus();
  });

  $('#syncPill').addEventListener('click', () => {
    if (Sync.isConfigured() && navigator.onLine) triggerSync(true);
    else show('settings');
  });

  // settings: export / import / clear
  $('#exportBtn').addEventListener('click', exportData);
  $('#importBtn').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', importData);
  $('#clearBtn').addEventListener('click', clearAll);

  // react to any data change
  DB.subscribe(() => {
    if (currentView === 'items') renderItems();
    if (currentView === 'detail') renderDetail();
    if (currentView === 'add') refreshDatalists();
  });

  // connectivity
  window.addEventListener('online', () => { refreshSyncStatus(); triggerSync(); });
  window.addEventListener('offline', refreshSyncStatus);
}

function exportData() {
  const blob = new Blob([DB.exportJSON()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pricebook-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Backup downloaded');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const { imported, total } = DB.importJSON(reader.result, 'merge');
      toast(`Imported ${imported} of ${total} entries`);
      triggerSync();
    } catch (err) {
      toast('Could not read that file.', true);
      console.error(err);
    }
    e.target.value = '';
  };
  reader.readAsText(file);
}

function clearAll() {
  if (!confirm('Delete ALL price data on this device? This cannot be undone (export a backup first).')) return;
  DB.getAllRaw().forEach((r) => { if (!r.deleted) DB.deleteRecord(r.id); });
  toast('All data deleted');
  triggerSync();
  show('items');
}

/* ── Service worker ──────────────────────────────────────────────────────── */
function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch((err) => console.warn('SW failed', err));
  });
}

/* ── Boot ────────────────────────────────────────────────────────────────── */
function init() {
  wire();
  registerSW();
  show('add');
  refreshSyncStatus();
  // initial sync + listen for sign-in arriving via magic link
  triggerSync();
  Sync.onAuthChange(() => { refreshAuthUI(); refreshSyncStatus(); triggerSync(); }).catch(() => {});
}

init();
