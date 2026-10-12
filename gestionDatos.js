"use strict";

// Modo local sin servidor: clientes, préstamos y movimientos se guardan en localStorage.
const CLAVE_DATOS_LOCALES = "prestamoSimulador_datosLocales_v1";
let clienteActivoId = null;
let prestamoActivoId = null;
let clienteDelPrestamoActivoId = null;
let datosLocales = { version: 1, siguienteClienteId: 1, siguientePrestamoId: 1, clientes: [], prestamos: [], movimientos: [] };

function estadoBackend(mensaje, estado = "ok") {
  const el = document.getElementById("estadoBackend");
  if (!el) return;
  el.textContent = mensaje;
  el.dataset.estado = estado;
}

function guardarDatosLocales() {
  try {
    localStorage.setItem(CLAVE_DATOS_LOCALES, JSON.stringify(datosLocales));
    return true;
  } catch (error) {
    console.error("No se pudieron guardar los datos locales", error);
    estadoBackend("No se pudieron guardar los datos. Exporta un respaldo.", "error");
    alert("El navegador no pudo guardar los datos. Exporta un respaldo y libera espacio si es necesario.");
    return false;
  }
}

function cargarDatosLocales() {
  try {
    const raw = localStorage.getItem(CLAVE_DATOS_LOCALES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && Array.isArray(parsed.clientes) && Array.isArray(parsed.prestamos)) {
        datosLocales = {
          version: 1,
          siguienteClienteId: Math.max(1, Number(parsed.siguienteClienteId) || 1),
          siguientePrestamoId: Math.max(1, Number(parsed.siguientePrestamoId) || 1),
          clientes: parsed.clientes,
          prestamos: parsed.prestamos,
          movimientos: Array.isArray(parsed.movimientos) ? parsed.movimientos : []
        };
        // Evita reutilizar identificadores si el archivo fue importado desde una versión anterior.
        datosLocales.siguienteClienteId = Math.max(datosLocales.siguienteClienteId, ...datosLocales.clientes.map(x => Number(x.id) + 1), 1);
        datosLocales.siguientePrestamoId = Math.max(datosLocales.siguientePrestamoId, ...datosLocales.prestamos.map(x => Number(x.id) + 1), 1);
      }
    }
    estadoBackend("✓ Almacenamiento local listo · sin servidor", "ok");
  } catch (error) {
    console.error(error);
    estadoBackend("No se pudieron leer los datos locales", "error");
  }
}

function establecerPrestamoActual(id, clienteId = clienteActivoId, persistir = true) {
  prestamoActivoId = id == null || id === "" ? null : Number(id);
  clienteDelPrestamoActivoId = prestamoActivoId == null ? null : Number(clienteId);
  if (persistir) {
    try {
      if (prestamoActivoId == null) localStorage.removeItem("prestamoSimulador_prestamoActivoId");
      else localStorage.setItem("prestamoSimulador_prestamoActivoId", String(prestamoActivoId));
    } catch (_) {}
  }
}
function obtenerPrestamoActualId() { return prestamoActivoId; }
function obtenerClienteActualId() { return clienteActivoId; }

function actualizarResumenCliente(cliente) {
  const el = document.getElementById("resumenCliente");
  if (!el) return;
  if (!cliente) { el.textContent = "Registra o selecciona un cliente para comenzar."; return; }
  const cantidad = datosLocales.prestamos.filter(p => Number(p.cliente_id) === Number(cliente.id)).length;
  el.textContent = `${cliente.nombre} · Documento ${cliente.cedula} · ${cantidad} préstamo(s) registrado(s)`;
}

function llenarSelectPrestamos(prestamos) {
  const select = document.getElementById("prestamoActual");
  if (!select) return;
  select.replaceChildren(new Option("Selecciona un préstamo…", ""));
  prestamos.forEach(p => {
    const snap = p.snapshot || {};
    const estado = Number(snap.totalPrestamo) <= 0 ? "Liquidado" : "Activo";
    const fecha = p.fecha ? new Date(p.fecha).toLocaleDateString("es-CO") : "";
    select.add(new Option(`#${p.id} · $${dinero(snap.montoInicial || 0)} · ${snap.cuotasTotales || 0} cuotas · ${estado} · ${fecha}`, String(p.id)));
  });
  if (prestamoActivoId && prestamos.some(p => Number(p.id) === prestamoActivoId)) select.value = String(prestamoActivoId);
  if (!prestamos.length) select.replaceChildren(new Option("Este cliente aún no tiene préstamos", ""));
}

function cargarClientes(seleccionPreferida = null) {
  const select = document.getElementById("clienteActual");
  if (!select) return;
  const guardado = seleccionPreferida ?? localStorage.getItem("prestamoSimulador_clienteActivoId");
  select.replaceChildren(new Option("Selecciona un cliente…", ""));
  datosLocales.clientes.slice().sort((a,b) => a.nombre.localeCompare(b.nombre, "es")).forEach(c => select.add(new Option(`${c.nombre} · ${c.cedula}`, String(c.id))));
  const elegido = datosLocales.clientes.find(c => String(c.id) === String(guardado)) || datosLocales.clientes[0];
  if (elegido) {
    select.value = String(elegido.id);
    clienteActivoId = Number(elegido.id);
    try { localStorage.setItem("prestamoSimulador_clienteActivoId", String(clienteActivoId)); } catch (_) {}
    actualizarResumenCliente(elegido);
    cargarPrestamosCliente();
  } else {
    clienteActivoId = null;
    select.value = "";
    actualizarResumenCliente(null);
    llenarSelectPrestamos([]);
  }
}

function cargarPrestamosCliente() {
  const prestamos = datosLocales.prestamos.filter(p => Number(p.cliente_id) === Number(clienteActivoId)).sort((a,b) => Number(b.id)-Number(a.id));
  llenarSelectPrestamos(prestamos);
  actualizarResumenCliente(datosLocales.clientes.find(c => Number(c.id) === Number(clienteActivoId)) || null);
}

function guardarCliente(event) {
  event.preventDefault();
  const form = document.getElementById("formCliente");
  const cliente = Object.fromEntries(new FormData(form).entries());
  cliente.nombre = String(cliente.nombre || "").trim();
  cliente.cedula = String(cliente.cedula || "").trim();
  cliente.telefono = String(cliente.telefono || "").trim();
  cliente.correo = String(cliente.correo || "").trim();
  cliente.direccion = String(cliente.direccion || "").trim();
  if (!cliente.nombre || !cliente.cedula) return alert("Nombre y documento son obligatorios.");
  const existente = datosLocales.clientes.find(c => String(c.cedula).toLocaleLowerCase() === cliente.cedula.toLocaleLowerCase());
  if (existente) {
    alert("Ya existe un cliente con ese documento. Seleccioné el registro existente.");
    clienteActivoId = Number(existente.id);
    cargarClientes(clienteActivoId);
    document.getElementById("clienteActual").value = String(clienteActivoId);
    return;
  }
  const boton = document.getElementById("btnGuardarCliente");
  if (boton) boton.disabled = true;
  try {
    const creado = { id: datosLocales.siguienteClienteId++, ...cliente, creadoEn: new Date().toISOString() };
    datosLocales.clientes.push(creado);
    if (!guardarDatosLocales()) { datosLocales.clientes = datosLocales.clientes.filter(c => c.id !== creado.id); return; }
    form.reset();
    const seleccionDespuesDeGuardar = prestamoActivoId ? clienteActivoId : creado.id;
    cargarClientes(seleccionDespuesDeGuardar);
    estadoBackend(`Cliente ${creado.nombre} guardado en este navegador`, "ok");
    if (!prestamoActivoId && cuotasTotales > 0 && montoInicial > 0) guardarPrestamo();
  } finally { if (boton) boton.disabled = false; }
}

function cambiarCliente(event) {
  const nuevoId = Number(event.target.value) || null;
  if (prestamoActivoId && nuevoId !== clienteDelPrestamoActivoId) {
    if (!confirm("Cambiar de cliente cerrará el préstamo que estás viendo. El préstamo guardado se conservará. ¿Continuar?")) {
      event.target.value = String(clienteActivoId || ""); return;
    }
    establecerPrestamoActual(null);
    reiniciar(false);
  }
  clienteActivoId = nuevoId;
  try { if (nuevoId) localStorage.setItem("prestamoSimulador_clienteActivoId", String(nuevoId)); else localStorage.removeItem("prestamoSimulador_clienteActivoId"); } catch (_) {}
  cargarPrestamosCliente();
  if (!prestamoActivoId && cuotasTotales > 0 && montoInicial > 0 && nuevoId) guardarPrestamo();
}

function abrirPrestamoSeleccionado() {
  const id = Number(document.getElementById("prestamoActual")?.value);
  if (!id) return alert("Selecciona un préstamo para abrirlo.");
  const registro = datosLocales.prestamos.find(p => Number(p.id) === id);
  if (!registro || !registro.snapshot) return alert("No se encontró el préstamo guardado.");
  clienteActivoId = Number(registro.cliente_id);
  const selectCliente = document.getElementById("clienteActual");
  if (selectCliente) selectCliente.value = String(clienteActivoId);
  establecerPrestamoActual(id, clienteActivoId);
  aplicarDatosPrestamo(registro.snapshot);
  try { localStorage.setItem(CLAVE_PRESTAMO, JSON.stringify(registro.snapshot)); } catch (_) {}
  cargarPrestamosCliente();
  const selectPrestamo = document.getElementById("prestamoActual");
  if (selectPrestamo) selectPrestamo.value = String(id);
  estadoBackend(`Préstamo #${id} cargado desde almacenamiento local`, "ok");
}

function iniciarNuevoPrestamo() {
  if (!clienteActivoId) return alert("Primero registra o selecciona un cliente.");
  if (cuotasTotales > 0 && totalPrestamo > 0 && !confirm("Se limpiará la pantalla para crear otro préstamo. El préstamo actual permanecerá guardado. ¿Continuar?")) return;
  establecerPrestamoActual(null);
  reiniciar(false);
  const select = document.getElementById("prestamoActual");
  if (select) select.value = "";
  estadoBackend("Listo para calcular un nuevo préstamo", "ok");
  document.getElementById("monto")?.focus();
}

function persistirPrestamoBackend(snapshot) {
  if (!clienteActivoId) {
    estadoBackend("Selecciona un cliente para guardar el préstamo en su historial", "aviso");
    return;
  }
  if (!snapshot || !snapshot.cuotasTotales || !snapshot.montoInicial) return;
  const clienteObjetivo = Number(clienteActivoId);
  let registro = prestamoActivoId ? datosLocales.prestamos.find(p => Number(p.id) === Number(prestamoActivoId)) : null;
  if (registro && Number(registro.cliente_id) !== clienteObjetivo) registro = null;
  if (!registro) {
    registro = { id: datosLocales.siguientePrestamoId++, cliente_id: clienteObjetivo, fecha: new Date().toISOString(), creadoEn: new Date().toISOString(), snapshot: null };
    datosLocales.prestamos.push(registro);
    establecerPrestamoActual(registro.id, clienteObjetivo);
  }
  registro.snapshot = JSON.parse(JSON.stringify(snapshot));
  registro.actualizadoEn = new Date().toISOString();
  if (guardarDatosLocales()) {
    cargarPrestamosCliente();
    const select = document.getElementById("prestamoActual");
    if (select && Number(clienteActivoId) === clienteObjetivo) select.value = String(registro.id);
    estadoBackend(`✓ Préstamo #${registro.id} guardado localmente`, "ok");
  }
}

function registrarMovimientoBackend(tipo, valor, detalle = {}) {
  if (!prestamoActivoId) return;
  datosLocales.movimientos.push({
    id: datosLocales.movimientos.length ? Math.max(...datosLocales.movimientos.map(m => Number(m.id) || 0)) + 1 : 1,
    prestamo_id: Number(prestamoActivoId), cliente_id: Number(clienteDelPrestamoActivoId || clienteActivoId),
    tipo: String(tipo), valor: Math.max(0, Number(valor) || 0), detalle: JSON.parse(JSON.stringify(detalle || {})), fecha: new Date().toISOString()
  });
  guardarDatosLocales();
}

function exportarBaseLocal() {
  try {
    const respaldo = { ...datosLocales, exportadoEn: new Date().toISOString(), app: "Simulador de Préstamos local" };
    const blob = new Blob([JSON.stringify(respaldo, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `respaldo_simulador_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
    estadoBackend("Copia de clientes, préstamos y movimientos descargada", "ok");
  } catch (error) { estadoBackend("No se pudo exportar el respaldo", "error"); alert(error.message); }
}

function importarBaseLocal(archivo) {
  if (!archivo) return;
  const lector = new FileReader();
  lector.onload = () => {
    try {
      const parsed = JSON.parse(String(lector.result || ""));
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.clientes) || !Array.isArray(parsed.prestamos) || !Array.isArray(parsed.movimientos)) throw new Error("El archivo no es un respaldo válido de la base local.");
      if (!confirm("Importar reemplazará los clientes, préstamos y movimientos de este navegador. Exporta una copia antes de continuar. ¿Deseas continuar?")) return;
      datosLocales = {
        version: 1,
        siguienteClienteId: Math.max(Number(parsed.siguienteClienteId)||1, ...parsed.clientes.map(c => Number(c.id)+1), 1),
        siguientePrestamoId: Math.max(Number(parsed.siguientePrestamoId)||1, ...parsed.prestamos.map(p => Number(p.id)+1), 1),
        clientes: parsed.clientes, prestamos: parsed.prestamos, movimientos: parsed.movimientos
      };
      guardarDatosLocales();
      establecerPrestamoActual(null);
      cargarClientes();
      reiniciar(false);
      estadoBackend("Respaldo importado correctamente", "ok");
    } catch (error) { alert("No se pudo importar el respaldo: " + error.message); }
  };
  lector.readAsText(archivo);
}

function iniciarGestionDatos() {
  document.getElementById("formCliente")?.addEventListener("submit", guardarCliente);
  document.getElementById("clienteActual")?.addEventListener("change", cambiarCliente);
  document.getElementById("btnCargarPrestamo")?.addEventListener("click", abrirPrestamoSeleccionado);
  document.getElementById("btnNuevoPrestamo")?.addEventListener("click", iniciarNuevoPrestamo);
  document.getElementById("btnRespaldoSQLite")?.addEventListener("click", exportarBaseLocal);
  document.getElementById("btnImportarRespaldoBase")?.addEventListener("click", () => document.getElementById("archivoRespaldoBase")?.click());
  document.getElementById("archivoRespaldoBase")?.addEventListener("change", event => { importarBaseLocal(event.target.files?.[0]); event.target.value = ""; });
  cargarDatosLocales();
  cargarClientes();
  const prestamoGuardado = Number(localStorage.getItem("prestamoSimulador_prestamoActivoId")) || null;
  const registro = prestamoGuardado ? datosLocales.prestamos.find(p => Number(p.id) === prestamoGuardado) : null;
  if (registro?.snapshot) {
    clienteActivoId = Number(registro.cliente_id);
    clienteDelPrestamoActivoId = clienteActivoId;
    establecerPrestamoActual(registro.id, clienteActivoId);
    const clienteSelect = document.getElementById("clienteActual");
    if (clienteSelect) clienteSelect.value = String(clienteActivoId);
    aplicarDatosPrestamo(registro.snapshot);
    cargarPrestamosCliente();
    const loanSelect = document.getElementById("prestamoActual");
    if (loanSelect) loanSelect.value = String(registro.id);
    estadoBackend(`Préstamo #${registro.id} recuperado automáticamente`, "ok");
  } else {
    // Compatibilidad con el préstamo local guardado por versiones previas.
    const raw = localStorage.getItem(CLAVE_PRESTAMO);
    if (raw) {
      try { const snapshot = JSON.parse(raw); if (datosPrestamoValidos(snapshot)) aplicarDatosPrestamo(snapshot); } catch (_) {}
    }
  }
}

document.addEventListener("DOMContentLoaded", iniciarGestionDatos);
