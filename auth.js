/* Acceso local del administrador. Contraseña derivada con PBKDF2; no se guarda en texto plano. */
(() => {
  "use strict";
  const AUTH_KEY = "prestamoSimulador_adminAuth_v1";
  const SESSION_KEY = "prestamoSimulador_adminSession_v1";
  const ITERATIONS = 210000;
  const $ = id => document.getElementById(id);
  let admin = null;

  function msg(el, text, type = "") {
    if (!el) return;
    el.textContent = text;
    el.dataset.type = type;
  }
  function readAdmin() {
    try {
      const value = localStorage.getItem(AUTH_KEY);
      if (!value) return null;
      const parsed = JSON.parse(value);
      return parsed && parsed.version === 1 && parsed.username && parsed.salt && parsed.passwordHash ? parsed : null;
    } catch (_) { return null; }
  }
  function b64(bytes) {
    let binary = "";
    new Uint8Array(bytes).forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }
  function randomSalt() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return b64(bytes);
  }
  async function derive(password, salt, iterations = ITERATIONS) {
    if (!window.crypto?.subtle || !window.TextEncoder) {
      throw new Error("Este navegador no permite cifrado seguro en esta apertura local. Prueba con una versión actual de Chrome o Edge.");
    }
    const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: Uint8Array.from(atob(salt), ch => ch.charCodeAt(0)), iterations }, material, 256);
    return b64(bits);
  }
  function validPassword(password) {
    return password.length >= 10 && /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(password) && /\d/.test(password);
  }
  function setMode(mode) {
    const setup = mode === "setup";
    $("authTitle").textContent = setup ? "Configura tu administrador" : "Iniciar sesión";
    $("authDescription").textContent = setup
      ? "Crea la cuenta de administrador para proteger el acceso a tu simulador en este navegador."
      : "Ingresa tus credenciales para abrir tu simulador financiero.";
    $("authNameLabel").hidden = !setup;
    $("authName").hidden = !setup;
    $("authName").required = setup;
    $("authConfirmWrap").hidden = !setup;
    $("authConfirm").required = setup;
    $("authPassword").setAttribute("autocomplete", setup ? "new-password" : "current-password");
    $("authPassword").placeholder = setup ? "Mínimo 10 caracteres" : "Tu contraseña";
    $("btnAuthSubmit").textContent = setup ? "Crear administrador" : "Entrar al simulador";
    $("authUsername").autocomplete = setup ? "username" : "username";
    msg($("authMessage"), "");
  }
  function showApp() {
    document.body.classList.add("auth-ok");
    $("authGate").hidden = true;
    renderAdmin();
  }
  function showGate() {
    document.body.classList.remove("auth-ok");
    $("authGate").hidden = false;
    $("adminProfileModal").hidden = true;
    admin = readAdmin();
    setMode(admin ? "login" : "setup");
    $("authName").value = admin?.displayName || "";
    $("authUsername").value = admin?.username || "";
    $("authPassword").value = "";
    $("authConfirm").value = "";
    setTimeout(() => $("authUsername")?.focus(), 0);
  }
  function renderAdmin() {
    const current = readAdmin();
    if (!current) return;
    $("adminDisplayName").textContent = current.displayName || current.username;
    $("adminAvatar").textContent = (current.displayName || current.username).trim().charAt(0).toUpperCase() || "A";
  }
  async function createAdmin(form) {
    const displayName = $("authName").value.trim();
    const username = $("authUsername").value.trim();
    const password = $("authPassword").value;
    const confirmPassword = $("authConfirm").value;
    if (!displayName || !username) throw new Error("Completa el nombre y el usuario.");
    if (!validPassword(password)) throw new Error("La contraseña debe tener al menos 10 caracteres e incluir letras y números.");
    if (password !== confirmPassword) throw new Error("Las contraseñas no coinciden.");
    const salt = randomSalt();
    const record = { version: 1, role: "admin", displayName, username, salt, iterations: ITERATIONS, passwordHash: await derive(password, salt), createdAt: new Date().toISOString() };
    localStorage.setItem(AUTH_KEY, JSON.stringify(record));
    admin = record;
    sessionStorage.setItem(SESSION_KEY, "authenticated");
    form.reset();
    showApp();
  }
  async function login() {
    const current = readAdmin();
    if (!current) { showGate(); return; }
    const username = $("authUsername").value.trim().toLocaleLowerCase();
    const password = $("authPassword").value;
    if (username !== String(current.username).trim().toLocaleLowerCase()) throw new Error("Usuario o contraseña incorrectos.");
    const actual = await derive(password, current.salt, current.iterations || ITERATIONS);
    if (actual !== current.passwordHash) throw new Error("Usuario o contraseña incorrectos.");
    admin = current;
    sessionStorage.setItem(SESSION_KEY, "authenticated");
    showApp();
  }
  function openProfile() {
    const current = readAdmin();
    if (!current) return;
    $("profileName").value = current.displayName || "";
    $("profileUsername").value = current.username || "";
    ["profileCurrentPassword", "profileNewPassword", "profileConfirmPassword"].forEach(id => $(id).value = "");
    msg($("profileMessage"), "");
    $("adminProfileModal").hidden = false;
    $("profileName").focus();
  }
  async function saveProfile(event) {
    event.preventDefault();
    const current = readAdmin();
    if (!current) return;
    const displayName = $("profileName").value.trim();
    const username = $("profileUsername").value.trim();
    const currentPassword = $("profileCurrentPassword").value;
    const newPassword = $("profileNewPassword").value;
    const confirmPassword = $("profileConfirmPassword").value;
    if (!displayName || !username) return msg($("profileMessage"), "Nombre y usuario son obligatorios.", "error");
    const updated = { ...current, displayName, username };
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) return msg($("profileMessage"), "Escribe tu contraseña actual para cambiarla.", "error");
      const check = await derive(currentPassword, current.salt, current.iterations || ITERATIONS);
      if (check !== current.passwordHash) return msg($("profileMessage"), "La contraseña actual no es correcta.", "error");
      if (!validPassword(newPassword)) return msg($("profileMessage"), "La nueva contraseña debe tener al menos 10 caracteres e incluir letras y números.", "error");
      if (newPassword !== confirmPassword) return msg($("profileMessage"), "Las nuevas contraseñas no coinciden.", "error");
      updated.salt = randomSalt();
      updated.iterations = ITERATIONS;
      updated.passwordHash = await derive(newPassword, updated.salt);
      updated.passwordChangedAt = new Date().toISOString();
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
    admin = updated;
    renderAdmin();
    msg($("profileMessage"), "Perfil actualizado correctamente.", "success");
    setTimeout(() => { $("adminProfileModal").hidden = true; }, 800);
  }
  document.addEventListener("DOMContentLoaded", () => {
    $("formAuth")?.addEventListener("submit", async event => {
      event.preventDefault();
      const button = $("btnAuthSubmit");
      button.disabled = true;
      msg($("authMessage"), "Verificando credenciales…");
      try {
        if (!readAdmin()) await createAdmin(event.currentTarget);
        else await login();
      } catch (error) {
        msg($("authMessage"), error?.message || "No se pudo completar la operación.", "error");
      } finally { button.disabled = false; }
    });
    $("btnAdminProfile")?.addEventListener("click", openProfile);
    $("btnLogout")?.addEventListener("click", () => {
      if (!confirm("¿Quieres cerrar la sesión del administrador? Los préstamos guardados se conservarán.")) return;
      sessionStorage.removeItem(SESSION_KEY);
      showGate();
    });
    $("btnCloseProfile")?.addEventListener("click", () => { $("adminProfileModal").hidden = true; });
    $("btnCancelProfile")?.addEventListener("click", () => { $("adminProfileModal").hidden = true; });
    $("adminProfileModal")?.querySelector("[data-close-profile]")?.addEventListener("click", () => { $("adminProfileModal").hidden = true; });
    $("formAdminProfile")?.addEventListener("submit", async event => {
      const button = event.submitter;
      if (button) button.disabled = true;
      try { await saveProfile(event); }
      catch (error) { msg($("profileMessage"), error?.message || "No se pudo guardar el perfil.", "error"); }
      finally { if (button) button.disabled = false; }
    });
    admin = readAdmin();
    if (admin && sessionStorage.getItem(SESSION_KEY) === "authenticated") showApp();
    else showGate();
  });
})();
