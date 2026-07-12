/* ============================================================================
 * charts.js — tiny dependency-free charts for the item detail view
 *
 * Everything is inline SVG / HTML so it works offline, needs no library, and
 * inherits the app's light/dark theme via CSS variables. Two charts:
 *   - priceTrendSVG: unit price over time (line + points, cheapest highlighted)
 *   - shopBarsHTML:  latest unit price per shop (bars, cheapest first)
 * ==========================================================================*/

import * as DB from './data.js';

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function shortDate(iso) {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString(DB.getLocale(), { day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}

/**
 * Line chart of unit price over time. Returns '' when there are fewer than two
 * comparable points (caller then skips the card).
 */
export function priceTrendSVG(records, baseUnit) {
  const pts = records
    .filter((r) => r.unitPrice != null && isFinite(r.unitPrice))
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  if (pts.length < 2) return '';

  const W = 320, H = 150, padL = 50, padR = 14, padT = 12, padB = 26;
  const iw = W - padL - padR, ih = H - padT - padB;

  const times = pts.map((p) => new Date(p.date + 'T00:00:00').getTime());
  const minT = Math.min(...times), maxT = Math.max(...times);
  const prices = pts.map((p) => p.unitPrice);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const pad = (hi - lo) * 0.12 || hi * 0.1 || 1;
  const y0 = Math.max(0, lo - pad), y1 = hi + pad;

  const xFor = (t) => (maxT === minT ? padL + iw / 2 : padL + ((t - minT) / (maxT - minT)) * iw);
  const yFor = (v) => padT + (1 - (v - y0) / (y1 - y0)) * ih;

  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minVal = Math.min(...prices);
  const avgY = yFor(mean).toFixed(1);

  const linePts = pts.map((p, i) => `${xFor(times[i]).toFixed(1)},${yFor(p.unitPrice).toFixed(1)}`).join(' ');
  const dots = pts.map((p, i) => {
    const best = p.unitPrice === minVal;
    return `<circle class="chart-dot${best ? ' chart-dot-best' : ''}" cx="${xFor(times[i]).toFixed(1)}" cy="${yFor(p.unitPrice).toFixed(1)}" r="${best ? 4 : 3}">`
      + `<title>${escapeHTML(DB.formatUnitPrice(p.unitPrice, baseUnit))} · ${escapeHTML(p.shop)} · ${escapeHTML(shortDate(p.date))}</title></circle>`;
  }).join('');

  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Unit price over time">
    <line class="chart-axis" x1="${padL}" y1="${padT}" x2="${padL}" y2="${H - padB}"/>
    <line class="chart-axis" x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}"/>
    <line class="chart-avg" x1="${padL}" y1="${avgY}" x2="${W - padR}" y2="${avgY}"/>
    <text class="chart-avg-label" x="${W - padR}" y="${(avgY - 4)}" text-anchor="end">avg</text>
    <polyline class="chart-line" points="${linePts}"/>
    ${dots}
    <text class="chart-ylabel" x="${padL - 6}" y="${(padT + 4).toFixed(1)}" text-anchor="end">${escapeHTML(DB.formatMoney(y1))}</text>
    <text class="chart-ylabel" x="${padL - 6}" y="${(H - padB).toFixed(1)}" text-anchor="end">${escapeHTML(DB.formatMoney(y0))}</text>
    <text class="chart-xlabel" x="${padL}" y="${H - 8}" text-anchor="start">${escapeHTML(shortDate(pts[0].date))}</text>
    <text class="chart-xlabel" x="${W - padR}" y="${H - 8}" text-anchor="end">${escapeHTML(shortDate(pts[pts.length - 1].date))}</text>
  </svg>`;
}

/**
 * Horizontal bars of the latest unit price per shop (perShop is pre-sorted
 * cheapest-first by data.js). The cheapest bar is highlighted green.
 */
export function shopBarsHTML(perShop, baseUnit) {
  if (!perShop || !perShop.length) return '';
  const max = Math.max(...perShop.map((r) => r.unitPrice));
  return perShop.map((r, i) => {
    const pct = max > 0 ? Math.max(4, (r.unitPrice / max) * 100) : 4;
    return `<div class="bar-row">
      <div class="bar-shop" title="${escapeHTML(r.shop)}">${escapeHTML(r.shop)}</div>
      <div class="bar-track"><div class="bar-fill${i === 0 ? ' bar-best' : ''}" style="width:${pct.toFixed(1)}%"></div></div>
      <div class="bar-value">${escapeHTML(DB.formatUnitPrice(r.unitPrice, baseUnit))}</div>
    </div>`;
  }).join('');
}
