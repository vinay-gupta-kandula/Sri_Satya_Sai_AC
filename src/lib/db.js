import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const TMP_DIR = os.tmpdir();

const LOCAL_SERVICES_FILE = path.join(process.cwd(), 'src', 'data', 'services.json');
const LOCAL_SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'settings.json');
const LOCAL_BOOKINGS_FILE = path.join(process.cwd(), 'src', 'data', 'bookings.json');

const TMP_SERVICES_FILE = path.join(TMP_DIR, 'sai_services.json');
const TMP_SETTINGS_FILE = path.join(TMP_DIR, 'sai_settings.json');
const TMP_BOOKINGS_FILE = path.join(TMP_DIR, 'sai_bookings.json');

// Global memory cache to retain state across serverless lambda invocations
if (!globalThis.__saiDb) {
  globalThis.__saiDb = {
    services: null,
    settings: null,
    bookings: null,
  };
}

// --- Services Helper ---
export async function getServices() {
  if (globalThis.__saiDb.services && Array.isArray(globalThis.__saiDb.services) && globalThis.__saiDb.services.length > 0) {
    return globalThis.__saiDb.services;
  }
  // Try /tmp first
  try {
    const data = await fs.readFile(TMP_SERVICES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      globalThis.__saiDb.services = parsed;
      return parsed;
    }
  } catch {}

  // Fallback to local bundled file
  try {
    const data = await fs.readFile(LOCAL_SERVICES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    globalThis.__saiDb.services = parsed;
    return parsed;
  } catch (error) {
    console.error('Error reading services:', error);
    return [];
  }
}

export async function saveServices(services) {
  globalThis.__saiDb.services = services;
  // Write to /tmp (always writable on Vercel and local)
  try {
    await fs.writeFile(TMP_SERVICES_FILE, JSON.stringify(services, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not write services to /tmp:', e.message);
  }
  // Try writing to local repo file if writable (local dev)
  try {
    await fs.writeFile(LOCAL_SERVICES_FILE, JSON.stringify(services, null, 2), 'utf-8');
  } catch {}
}

// --- Settings Helper ---
export async function getSettings() {
  if (globalThis.__saiDb.settings && Object.keys(globalThis.__saiDb.settings).length > 0) {
    return globalThis.__saiDb.settings;
  }
  try {
    const data = await fs.readFile(TMP_SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (parsed && Object.keys(parsed).length > 0) {
      globalThis.__saiDb.settings = parsed;
      return parsed;
    }
  } catch {}

  try {
    const data = await fs.readFile(LOCAL_SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    globalThis.__saiDb.settings = parsed;
    return parsed;
  } catch (error) {
    console.error('Error reading settings:', error);
    return {};
  }
}

export async function saveSettings(settings) {
  globalThis.__saiDb.settings = settings;
  try {
    await fs.writeFile(TMP_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not write settings to /tmp:', e.message);
  }
  try {
    await fs.writeFile(LOCAL_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch {}
}

// --- Bookings Helper ---
export async function getBookings() {
  if (globalThis.__saiDb.bookings && Array.isArray(globalThis.__saiDb.bookings)) {
    return globalThis.__saiDb.bookings;
  }
  try {
    const data = await fs.readFile(TMP_BOOKINGS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      globalThis.__saiDb.bookings = parsed;
      return parsed;
    }
  } catch {}

  try {
    const data = await fs.readFile(LOCAL_BOOKINGS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    globalThis.__saiDb.bookings = parsed;
    return parsed;
  } catch (error) {
    console.error('Error reading bookings:', error);
    globalThis.__saiDb.bookings = [];
    return [];
  }
}

export async function saveBookings(bookings) {
  globalThis.__saiDb.bookings = bookings;
  // Write to /tmp (guaranteed writable on Vercel)
  try {
    await fs.writeFile(TMP_BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not write bookings to /tmp:', e.message);
  }
  // Try writing to local repo file if writable (local dev)
  try {
    await fs.writeFile(LOCAL_BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch {}
}
