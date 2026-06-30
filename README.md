# 🏷️ PriceBook — Grocery Price Tracker

A tiny, fast web app for **remembering grocery prices across the shops and markets you
visit**, so you can instantly tell whether the price in front of you is actually a good
deal.

No accounts required to start, works **offline**, and **installs to your phone's home
screen**. Optional cross-device sync via a free Supabase project.

> Built as a static site — plain HTML/CSS/JS, no build step — so it runs directly on
> GitHub Pages.

---

## What it does

- **Log a price** in seconds: item, shop, price, quantity + unit (each / kg / g / lb / oz
  / L / ml / dozen), date, optional note.
- **Normalises units** automatically — "$2 for 500 g" and "$3.50 for 1 kg" are compared on
  the same _price-per-kg_ basis, so comparisons are always fair.
- **Deal checker**: open an item, type the price you're looking at, and get an instant
  verdict — **Best price yet 🏆 / Good deal 👍 / About average 😐 / Pricey 👎** — measured
  against your own history, with the cheapest reference shown.
- **Per-item history**: every price you've logged, cheapest shop, your average, last paid.
- **Search** your items quickly while standing in the aisle.
- **Backup**: export/import your whole price book as a JSON file.
- **Currency** of your choice (auto-guessed from your device region).

## Using it

1. **Add** tab → fill in item, shop, price, quantity + unit → **Save price**. The shop,
   unit and date stay put so logging several items in one shop is quick.
2. **Items** tab → search or tap an item to open its detail.
3. In the item detail, use **"Is it a good deal?"** — type the shelf price and quantity and
   read the verdict.

### Install on your phone (PWA)

- **iPhone (Safari):** Share → _Add to Home Screen_.
- **Android (Chrome):** menu ⋮ → _Install app_ / _Add to Home Screen_.

Once installed it opens full-screen and works offline — your data lives on the device.

---

## Optional: sync across devices (Supabase)

By default everything is stored locally in your browser. To use the same price book on
your phone **and** laptop, connect a free [Supabase](https://supabase.com) project (takes
~2 minutes). Your Supabase **anon key is safe to use in the browser** — row-level security
(below) ensures each signed-in user can only ever see their own rows.

1. Create a free account at supabase.com and a new project.
2. In the project's **SQL Editor**, run:

   ```sql
   create table if not exists public.prices (
     id          uuid primary key,
     user_id     uuid not null references auth.users(id) on delete cascade,
     item        text,
     item_key    text,
     shop        text,
     price       numeric,
     quantity    numeric,
     unit        text,
     unit_price  numeric,
     base_unit   text,
     date        date,
     notes       text,
     created_at  timestamptz,
     updated_at  timestamptz,
     deleted     boolean default false
   );

   alter table public.prices enable row level security;

   create policy "prices_select_own" on public.prices
     for select using (auth.uid() = user_id);
   create policy "prices_insert_own" on public.prices
     for insert with check (auth.uid() = user_id);
   create policy "prices_update_own" on public.prices
     for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
   create policy "prices_delete_own" on public.prices
     for delete using (auth.uid() = user_id);
   ```

3. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.
4. In **Authentication → Sign In / Providers → Email**, turn **off "Confirm email."** This
   lets the app sign you in with just an email + password — no verification emails (which
   avoids rate limits and mail-client link issues).
5. In PriceBook → **Settings → Sync across devices**, paste the URL + anon key, **Save
   connection**, then enter an **email + password** and tap **Sign in / Create account**.
   The first time creates your account; use the **same email + password on every device**
   to share data.

After that, prices sync automatically on load and whenever you add/edit/delete (a manual
**Sync now** button is there too). Merging is **last-write-wins** on each record's
`updated_at`, and deletions propagate as soft-delete tombstones.

The sync indicator in the top-right shows **Local**, **Sign in**, **Synced**, or
**Offline**.

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell — tabs, forms, views |
| `styles.css` | Mobile-first styling (light + dark) |
| `app.js` | UI controller: navigation, rendering, deal verdict |
| `data.js` | Local-first data layer: storage, unit normalisation, stats, export/import |
| `sync.js` | Optional Supabase sync (loaded lazily; no-ops until configured) |
| `manifest.webmanifest`, `service-worker.js`, `icons/` | PWA install + offline shell |

### Regenerating the app icons

PNG icons are rendered from `icons/icon.svg` with headless Chromium:

```bash
node scripts/gen-icons.js   # see commit history; uses Playwright's chromium
```

---

## Deploying

It's a static site. Push to the branch GitHub Pages serves and open the Pages URL. No
build, no dependencies, nothing to install.

## Privacy

Your prices stay in your browser's local storage unless you explicitly enable Supabase
sync. Export a JSON backup any time from **Settings → Backup & data**.
