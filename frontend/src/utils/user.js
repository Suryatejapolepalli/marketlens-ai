const ID_KEY = "marketlens_user_id";
const NAME_KEY = "marketlens_user_name";

export function getLocalDisplayName() {
  return localStorage.getItem(NAME_KEY) || "Guest Trader";
}

export function setLocalDisplayName(name) {
  localStorage.setItem(NAME_KEY, name);
}

export function getUserId() {
  return localStorage.getItem(ID_KEY);
}

export function setSession(userId, name) {
  localStorage.setItem(ID_KEY, userId);
  if (name) setLocalDisplayName(name);
}

export function clearSession() {
  localStorage.removeItem(ID_KEY);
}
