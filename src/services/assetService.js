import { SCRIPT_URL } from '../config/env';

export async function fetchAssets() {
  const res = await fetch(SCRIPT_URL);
  return res.json();
}