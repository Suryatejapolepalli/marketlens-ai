import { registerUser } from "../services/api";

const ID_KEY = "marketlens_user_id";
const NAME_KEY = "marketlens_user_name";

export function getLocalDisplayName() {
  return localStorage.getItem(NAME_KEY) || "Guest Trader";
}

export function setLocalDisplayName(name) {
  localStorage.setItem(NAME_KEY, name);
}

export async function ensureDemoUser() {
  const existing = localStorage.getItem(ID_KEY);
  if (existing) return existing;

  const name = getLocalDisplayName();
  const email = `${crypto.randomUUID()}@marketlens.demo`;

  const result = await registerUser(name, email, crypto.randomUUID());
  localStorage.setItem(ID_KEY, result.user_id);
  return result.user_id;
}
