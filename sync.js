/* ============================================================================
 * sync.js — optional cross-device sync via Supabase
 *
 * This layer is entirely opt-in. With no URL/key configured (or while offline)
 * every function below no-ops gracefully, so the app keeps working purely from
 * localStorage. Once the user pastes their Supabase project URL + anon key in
 * Settings and signs in with an email magic link, records sync across devices
 * using simple last-write-wins on `updatedAt`.
 *
 * The Supabase JS client is loaded lazily from a CDN only when needed, so the
 * offline app shell never depends on it.
 * ==========================================================================*/

import { getSettings, getAllRaw, upsertMany } from './data.js';

const SUPABASE_ESM = 'https://esm.sh/@supabase/supabase-js@2';
const TABLE = 'prices';

let client = null;          // cached Supabase client
let clientKey = '';         // url|key the cached client was built for

/** True when the user has entered a project URL + anon key. */
export function isConfigured() {
  const { supabaseUrl, supabaseKey } = getSettings();
  return Boolean(supabaseUrl && supabaseKey);
}

/** Lazily create (and cache) the Supabase client. Returns null if unconfigured. */
async function getClient() {
  if (!isConfigured()) return null;
  const { supabaseUrl, supabaseKey } = getSettings();
  const key = `${supabaseUrl}|${supabaseKey}`;
  if (client && clientKey === key) return client;

  const { createClient } = await import(/* @vite-ignore */ SUPABASE_ESM);
  client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  clientKey = key;
  return client;
}

/** Currently signed-in user, or null. */
export async function getUser() {
  try {
    const sb = await getClient();
    if (!sb) return null;
    const { data } = await sb.auth.getUser();
    return data ? data.user : null;
  } catch (err) {
    console.warn('getUser failed', err);
    return null;
  }
}

/**
 * Sign in with email + password, creating the account on first use.
 *
 * Requires "Confirm email" to be OFF in Supabase so sign-up returns a session
 * immediately — no verification email, which sidesteps email rate limits and
 * mail-client link scanners entirely.
 */
export async function signInWithPassword(email, password) {
  const sb = await getClient();
  if (!sb) throw new Error('Add your Supabase URL and key first.');

  // 1. Try to sign in to an existing account.
  const signIn = await sb.auth.signInWithPassword({ email, password });
  if (!signIn.error) return signIn.data.user;

  // 2. No matching account → create one.
  const signUp = await sb.auth.signUp({ email, password });
  if (signUp.error) {
    const msg = (signUp.error.message || '').toLowerCase();
    if (msg.includes('already registered') || msg.includes('already exists')) {
      throw new Error('That email already has an account — the password looks wrong.');
    }
    if (msg.includes('password')) {
      throw new Error('Password too weak — use at least 6 characters.');
    }
    throw new Error(signUp.error.message || 'Could not create the account.');
  }
  if (signUp.data.session) return signUp.data.user;

  // 3. Sign-up worked but no session → email confirmation is still on.
  throw new Error('Account created, but Supabase still has "Confirm email" turned ON. Turn it off (Authentication → Sign In / Providers → Email) and sign in again.');
}

export async function signOut() {
  const sb = await getClient();
  if (!sb) return;
  await sb.auth.signOut();
}

/** React to auth changes (sign-in via magic link, sign-out, token refresh). */
export async function onAuthChange(cb) {
  const sb = await getClient();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((_event, session) => cb(session ? session.user : null));
  return () => data.subscription.unsubscribe();
}

/* ── Mapping between local camelCase and DB snake_case ──────────────────── */
function toRow(r, userId) {
  return {
    id: r.id,
    user_id: userId,
    item: r.item,
    item_key: r.itemKey,
    shop: r.shop,
    price: r.price,
    quantity: r.quantity,
    unit: r.unit,
    unit_price: r.unitPrice,
    base_unit: r.baseUnit,
    date: r.date,
    notes: r.notes,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    deleted: r.deleted,
  };
}

function fromRow(row) {
  return {
    id: row.id,
    item: row.item,
    itemKey: row.item_key,
    shop: row.shop,
    price: Number(row.price),
    quantity: Number(row.quantity),
    unit: row.unit,
    unitPrice: row.unit_price != null ? Number(row.unit_price) : null,
    baseUnit: row.base_unit,
    date: row.date,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deleted: !!row.deleted,
  };
}

/**
 * Two-way sync. Pull remote rows, merge into local (last-write-wins), then push
 * the merged set back so both sides converge.
 * Returns { ok, pulled, pushed, reason }.
 */
export async function sync() {
  if (!isConfigured()) return { ok: false, reason: 'not-configured' };
  if (!navigator.onLine) return { ok: false, reason: 'offline' };

  let sb;
  try {
    sb = await getClient();
  } catch (err) {
    return { ok: false, reason: 'load-failed', error: err };
  }

  const user = await getUser();
  if (!user) return { ok: false, reason: 'signed-out' };

  // 1. Pull everything the user owns (RLS scopes this to their rows).
  const { data: remoteRows, error: pullErr } = await sb.from(TABLE).select('*');
  if (pullErr) return { ok: false, reason: 'pull-failed', error: pullErr };

  const remote = (remoteRows || []).map(fromRow);
  const remoteById = new Map(remote.map((r) => [r.id, r]));

  // 2. Merge remote → local.
  const pulled = upsertMany(remote);

  // 3. Push local rows that are newer than (or missing from) remote.
  const local = getAllRaw();
  const toPush = local.filter((r) => {
    const rem = remoteById.get(r.id);
    return !rem || (r.updatedAt || '') > (rem.updatedAt || '');
  });

  let pushed = 0;
  if (toPush.length) {
    const rows = toPush.map((r) => toRow(r, user.id));
    const { error: pushErr } = await sb.from(TABLE).upsert(rows, { onConflict: 'id' });
    if (pushErr) return { ok: false, reason: 'push-failed', error: pushErr, pulled };
    pushed = toPush.length;
  }

  return { ok: true, pulled, pushed };
}
