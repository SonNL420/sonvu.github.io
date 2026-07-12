/* ============================================================================
 * shops.js — common supermarkets & food shops in NL / BE / FR / DE
 *
 * These populate the "Shop / market" field's suggestions so you can pick a
 * chain instead of typing it. Your own past shops always rank first; these
 * fill in the rest. Grouped by country for readability — the app uses the
 * flat de-duplicated list below.
 * ==========================================================================*/

export const SHOP_COUNTRIES = {
  Netherlands: [
    'Albert Heijn', 'Jumbo', 'Lidl', 'Aldi', 'Plus', 'Dirk', 'Coop', 'Spar',
    'Vomar', 'DekaMarkt', 'Hoogvliet', 'Nettorama', 'Boni', 'Jan Linders',
    'Poiesz', 'Ekoplaza', 'Picnic', 'Sligro', 'Makro', 'Amazing Oriental',
    'Action', 'HEMA', 'Kruidvat',
  ],
  Belgium: [
    'Colruyt', 'Delhaize', 'AD Delhaize', 'Proxy Delhaize', 'Carrefour',
    'Carrefour Market', 'Carrefour Express', 'Okay', 'Bio-Planet',
    'Intermarché', 'Match', 'Smatch', 'Cora', 'Louis Delhaize', 'Renmans',
  ],
  France: [
    'E.Leclerc', 'Auchan', 'Casino', 'Monoprix', 'Franprix', 'Super U',
    'Hyper U', 'U Express', 'Picard', 'Grand Frais', 'Biocoop', 'Naturalia',
    'Netto', 'Leader Price', 'G20', 'Carrefour City',
  ],
  Germany: [
    'Edeka', 'Rewe', 'Kaufland', 'Penny', 'Norma', 'Globus', 'tegut', 'Hit',
    'Famila', 'Combi', 'Alnatura', 'Denns Biomarkt', 'dm', 'Rossmann',
    'Müller', 'Metro',
  ],
  Markets: [
    'Markt', 'Wochenmarkt', 'Marché', 'Farmers market', 'Bakery', 'Butcher',
    'Toko', 'Turkish supermarket', 'Asian supermarket',
  ],
};

/** Flat, de-duplicated, alphabetically sorted list for the datalist. */
export const COMMON_SHOPS = (() => {
  const seen = new Set();
  const out = [];
  for (const shops of Object.values(SHOP_COUNTRIES)) {
    for (const name of shops) {
      const key = name.toLowerCase();
      if (!seen.has(key)) { seen.add(key); out.push(name); }
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
})();
