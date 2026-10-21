import fs from 'fs/promises';
import path from 'path';

const SERVICES_FILE = path.join(process.cwd(), 'src', 'data', 'services.json');
const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'settings.json');
const BOOKINGS_FILE = path.join(process.cwd(), 'src', 'data', 'bookings.json');

// --- Services Helper ---
export async function getServices() {
  try {
    const data = await fs.readFile(SERVICES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading services:', error);
    return [];
  }
}

export async function saveServices(services) {
  await fs.writeFile(SERVICES_FILE, JSON.stringify(services, null, 2), 'utf-8');
}

// --- Settings Helper ---
export async function getSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading settings:', error);
    return {};
  }
}

export async function saveSettings(settings) {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

// --- Bookings Helper ---
export async function getBookings() {
  try {
    const data = await fs.readFile(BOOKINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading bookings:', error);
    return [];
  }
}

export async function saveBookings(bookings) {
  await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
}
