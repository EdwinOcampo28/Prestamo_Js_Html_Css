"use strict";

let chart;

let totalPrestamo = 0;
let totalDeuda = 0;
let pagado = 0;

let cuotasTotales = 0;
let cuotasPagadas = 0;

let capitalPagado = 0;
let interesPagado = 0;
let interesTotalOriginal = 0;

let capitalCuotas = [];
let interesCuotas = [];
let cuotasPagadasEstado = [];
let historialAbonos = [];

let montoInicial = 0;
let interesAnualPrestamo = 0;
let diaPagoPrestamo = 1;
let fechaInicioPrestamo = "";

const EPSILON_MONEDA = 0.01;

function aNumero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

function normalizarMoneda(valor) {
  return Math.round(aNumero(valor));
}

function obtenerInteresMensual() {
  return aNumero(interesAnualPrestamo) / 12;
}

function obtenerDiaPago() {
  return Number.isInteger(diaPagoPrestamo) && diaPagoPrestamo >= 1
    ? diaPagoPrestamo
    : Number(document.getElementById("diaPago")?.value) || 1;
}

function obtenerFechaBasePrestamo() {
  const fecha = fechaInicioPrestamo ? new Date(fechaInicioPrestamo) : new Date();
  return Number.isNaN(fecha.getTime()) ? new Date() : fecha;
}

function esCuotaActiva(i) {
  if (cuotasPagadasEstado[i]) return false;
  return aNumero(capitalCuotas[i]) + aNumero(interesCuotas[i]) > EPSILON_MONEDA;
}

function obtenerIndicesCuotasActivas() {
  const res = [];
  for (let i = 0; i < cuotasTotales; i++) {
    if (esCuotaActiva(i)) res.push(i);
  }
  return res;
}

function contarCuotasActivas() {
  return obtenerIndicesCuotasActivas().length;
}

function sumarInteresPendiente() {
  let total = 0;

  for (let i = 0; i < cuotasTotales; i++) {
    if (!cuotasPagadasEstado[i]) {
      total += aNumero(interesCuotas[i]);
    }
  }

  return normalizarMoneda(total);
}

function obtenerCuotaPendienteActual() {
  const idx = obtenerIndicesCuotasActivas()[0];
  if (idx == null) return 0;

  return normalizarMoneda(
    aNumero(capitalCuotas[idx]) + aNumero(interesCuotas[idx])
  );
}

function calcularCuotaNivelada(saldo, interesMensual, cuotas) {
  const s = normalizarMoneda(saldo);
  if (s <= 0 || cuotas <= 0) return 0;

  if (interesMensual === 0) return normalizarMoneda(s / cuotas);

  const f = Math.pow(1 + interesMensual, cuotas);

  return normalizarMoneda(s * ((interesMensual * f) / (f - 1)));
}

function actualizarCuotasPendientesPorCuota(indices, saldoInicial, interesMensual) {
  const pos = Array.isArray(indices) ? indices : [];
  let saldo = normalizarMoneda(saldoInicial);

  if (!pos.length) return saldo;

  const cuotaFija = calcularCuotaNivelada(saldo, interesMensual, pos.length);

  pos.forEach((indice, p) => {
    if (saldo <= 0) {
      capitalCuotas[indice] = 0;
      interesCuotas[indice] = 0;
      return;
    }

    const interes = interesMensual === 0
      ? 0
      : normalizarMoneda(saldo * interesMensual);

    let capital = normalizarMoneda(cuotaFija - interes);

    if (capital <= 0) capital = p === pos.length - 1 ? saldo : 0;
    if (capital >= saldo || p === pos.length - 1) capital = saldo;

    capitalCuotas[indice] = capital;
    interesCuotas[indice] = interes;

    saldo = Math.max(0, saldo - capital);
  });

  return saldo;
}

function actualizarCuotasPendientesPorPlazo(indices, saldoInicial, interesMensual, cuotaObjetivo) {
  const pos = Array.isArray(indices) ? indices : [];
  let saldo = normalizarMoneda(saldoInicial);

  if (!pos.length) return saldo;

  const cuotaBase = Math.max(
    0,
    normalizarMoneda(cuotaObjetivo) ||
    calcularCuotaNivelada(saldo, interesMensual, pos.length)
  );

  pos.forEach((indice, p) => {
    if (saldo <= 0) {
      capitalCuotas[indice] = 0;
      interesCuotas[indice] = 0;
      return;
    }

    const interes = interesMensual === 0
      ? 0
      : normalizarMoneda(saldo * interesMensual);

    let capital = interesMensual === 0
      ? Math.min(cuotaBase, saldo)
      : normalizarMoneda(cuotaBase - interes);

    if (capital <= 0) capital = p === pos.length - 1 ? saldo : 0;

    if (capital >= saldo || cuotaBase >= saldo + interes || p === pos.length - 1) {
      capital = saldo;
    }

    capitalCuotas[indice] = capital;
    interesCuotas[indice] = interes;

    saldo = Math.max(0, saldo - capital);
  });

  return saldo;
}

function recalcularCronogramaPendiente(tipo = "cuota", opciones = {}) {
  const indices = Array.isArray(opciones.indices)
    ? opciones.indices
    : obtenerIndicesCuotasActivas();

  const interesMensual = aNumero(opciones.interesMensual) || obtenerInteresMensual();

  const saldoInicial =
    opciones.saldo != null
      ? normalizarMoneda(opciones.saldo)
      : totalPrestamo;

  if (!indices.length) return saldoInicial;

  if (tipo === "plazo") {
    return actualizarCuotasPendientesPorPlazo(
      indices,
      saldoInicial,
      interesMensual,
      opciones.cuotaObjetivo
    );
  }

  return actualizarCuotasPendientesPorCuota(indices, saldoInicial, interesMensual);
}

function restaurarFormularioPrestamo() {
  const montoInput = document.getElementById("monto");
  const interesInput = document.getElementById("interes");
  const cuotasInput = document.getElementById("cuotas");
  const diaPagoInput = document.getElementById("diaPago");

  if (montoInput && montoInicial > 0) montoInput.value = montoInicial;
  if (interesInput && interesAnualPrestamo >= 0) interesInput.value = aNumero(interesAnualPrestamo) * 100;
  if (cuotasInput && cuotasTotales > 0) cuotasInput.value = cuotasTotales;
  if (diaPagoInput && obtenerDiaPago() > 0) diaPagoInput.value = obtenerDiaPago();
}

function dinero(valor) {
  return normalizarMoneda(valor).toLocaleString("es-CO");
}

function actualizarTexto(id, valor) {
  const el = document.getElementById(id);
  if (el) el.innerText = valor;
}

const CLAVE_PRESTAMO = "prestamoSimulador";
const CLAVE_RESPALDO_PRESTAMO = "prestamoSimulador_respaldo";
const VERSION_DATOS_PRESTAMO = 2;

function leerFormularioPrestamo() {
  return {
    monto: document.getElementById("monto")?.value ?? "",
    interes: document.getElementById("interes")?.value ?? "",
    cuotas: document.getElementById("cuotas")?.value ?? "",
    diaPago: document.getElementById("diaPago")?.value ?? "",
    tipoAbono: document.getElementById("tipoAbono")?.value ?? "cuota"
  };
}

function actualizarIndicadorGuardado(mensaje, estado = "ok") {
  const el = document.getElementById("estadoGuardado");
  if (!el) return;
  el.textContent = mensaje;
  el.dataset.estado = estado;
}

function crearSnapshotPrestamo() {
  return {
    versionDatos: VERSION_DATOS_PRESTAMO,
    actualizadoEn: new Date().toISOString(),
    formulario: leerFormularioPrestamo(),
    totalPrestamo, totalDeuda, pagado, cuotasTotales, montoInicial,
    interesAnualPrestamo, diaPagoPrestamo, fechaInicioPrestamo,
    capitalPagado, interesPagado, cuotasPagadas, capitalCuotas,
    interesCuotas, cuotasPagadasEstado, historialAbonos,
    interesTotalOriginal,
    comparador: {
      interesOriginal: document.getElementById("interesOriginal")?.innerText || "$0",
      interesConAbono: document.getElementById("interesConAbono")?.innerText || "$0",
      ahorroTotal: document.getElementById("ahorroTotal")?.innerText || "$0",
      cuotasReducidas: document.getElementById("cuotasReducidas")?.innerText || "0",
      interesAhorrado: document.getElementById("interesAhorrado")?.innerText || "$0"
    }
  };
}

function guardarPrestamo() {
  try {
    const anterior = localStorage.getItem(CLAVE_PRESTAMO);
    if (anterior) localStorage.setItem(CLAVE_RESPALDO_PRESTAMO, anterior);
    const snapshot = crearSnapshotPrestamo();
    localStorage.setItem(CLAVE_PRESTAMO, JSON.stringify(snapshot));
    actualizarIndicadorGuardado("✓ Guardado localmente · " + new Date().toLocaleTimeString("es-CO", {hour:"2-digit", minute:"2-digit"}));
    if (typeof persistirPrestamoBackend === "function") persistirPrestamoBackend(snapshot);
    return true;
  } catch (error) {
    console.error("No fue posible guardar el préstamo.", error);
    actualizarIndicadorGuardado("No se pudo guardar. Exporta un respaldo.", "error");
    return false;
  }
}

function datosPrestamoValidos(p) {
  if (!p || typeof p !== "object" || Array.isArray(p)) return false;
  const arrays = [p.capitalCuotas, p.interesCuotas, p.cuotasPagadasEstado, p.historialAbonos];
  if (!arrays.every(Array.isArray)) return false;
  if (p.capitalCuotas.length > 1200 || p.interesCuotas.length > 1200 || p.cuotasPagadasEstado.length > 1200) return false;
  if (p.cuotasTotales != null && (!Number.isInteger(Number(p.cuotasTotales)) || Number(p.cuotasTotales) < 0 || Number(p.cuotasTotales) > 1200)) return false;
  return true;
}

function aplicarDatosPrestamo(p) {
  if (!datosPrestamoValidos(p)) throw new Error("El archivo de datos no tiene una estructura válida.");
  totalPrestamo = aNumero(p.totalPrestamo);
  totalDeuda = aNumero(p.totalDeuda);
  pagado = aNumero(p.pagado);
  cuotasTotales = Math.max(0, Math.floor(aNumero(p.cuotasTotales)));
  montoInicial = aNumero(p.montoInicial);
  interesAnualPrestamo = Math.max(0, aNumero(p.interesAnualPrestamo));
  diaPagoPrestamo = Math.min(31, Math.max(1, Math.floor(aNumero(p.diaPagoPrestamo) || 1)));
  fechaInicioPrestamo = typeof p.fechaInicioPrestamo === "string" ? p.fechaInicioPrestamo : "";
  capitalPagado = aNumero(p.capitalPagado);
  interesPagado = aNumero(p.interesPagado);
  cuotasPagadas = Math.max(0, Math.floor(aNumero(p.cuotasPagadas)));
  capitalCuotas = p.capitalCuotas.map(v => Math.max(0, aNumero(v)));
  interesCuotas = p.interesCuotas.map(v => Math.max(0, aNumero(v)));
  cuotasPagadasEstado = p.cuotasPagadasEstado.map(Boolean);
  historialAbonos = p.historialAbonos.filter(a => a && typeof a === "object").map(a => ({
    valor: Math.max(0, aNumero(a.valor)),
    fecha: String(a.fecha || ""),
    tipo: String(a.tipo || "cuota"),
    ahorro: Math.max(0, aNumero(a.ahorro))
  }));
  interesTotalOriginal = Math.max(0, aNumero(p.interesTotalOriginal));
  cuotasTotales = Math.max(cuotasTotales, capitalCuotas.length, interesCuotas.length, cuotasPagadasEstado.length);
  while (capitalCuotas.length < cuotasTotales) capitalCuotas.push(0);
  while (interesCuotas.length < cuotasTotales) interesCuotas.push(0);
  while (cuotasPagadasEstado.length < cuotasTotales) cuotasPagadasEstado.push(false);

  const f = p.formulario || {};
  for (const [id, key] of [["monto","monto"],["interes","interes"],["cuotas","cuotas"],["diaPago","diaPago"],["tipoAbono","tipoAbono"]]) {
    const el = document.getElementById(id);
    if (el && f[key] != null && String(f[key]).length < 100) el.value = f[key];
  }
  restaurarFormularioPrestamo();
  reconstruirTabla?.();
  actualizarEstado?.();
  if (p.comparador) {
    for (const id of ["interesOriginal", "interesConAbono", "ahorroTotal", "cuotasReducidas", "interesAhorrado"]) {
      if (typeof p.comparador[id] === "string") actualizarTexto(id, p.comparador[id]);
    }
  }
  renderHistorial?.();
}

function cargarPrestamo() {
  let raw = null;
  try { raw = localStorage.getItem(CLAVE_PRESTAMO); }
  catch (error) {
    actualizarIndicadorGuardado("Almacenamiento del navegador no disponible", "error");
    console.warn("No fue posible leer los datos guardados.", error);
    return;
  }
  if (!raw) {
    actualizarIndicadorGuardado("Sin préstamo guardado todavía", "vacio");
    return;
  }
  try {
    aplicarDatosPrestamo(JSON.parse(raw));
    actualizarIndicadorGuardado("✓ Datos recuperados automáticamente");
  } catch (error) {
    console.error("No se pudo recuperar el préstamo principal; se intentará el respaldo.", error);
    try {
      const respaldo = localStorage.getItem(CLAVE_RESPALDO_PRESTAMO);
      if (!respaldo) throw error;
      aplicarDatosPrestamo(JSON.parse(respaldo));
      actualizarIndicadorGuardado("⚠ Recuperado desde el respaldo local", "aviso");
    } catch (errorRespaldo) {
      actualizarIndicadorGuardado("No se pudieron recuperar los datos. Importa un respaldo.", "error");
    }
  }
}

function exportarRespaldoPrestamo() {
  try {
    const datos = crearSnapshotPrestamo();
    const blob = new Blob([JSON.stringify(datos, null, 2)], {type:"application/json;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `respaldo_prestamo_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
    actualizarIndicadorGuardado("Respaldo descargado correctamente");
  } catch (error) {
    console.error(error);
    alert("No se pudo crear el respaldo.");
  }
}

function importarRespaldoPrestamo(archivo) {
  if (!archivo) return;
  const lector = new FileReader();
  lector.onload = () => {
    try {
      const datos = JSON.parse(String(lector.result || ""));
      if (!datosPrestamoValidos(datos)) throw new Error("Formato de respaldo inválido.");
      if (!confirm("Importar este respaldo reemplazará los datos actuales de este navegador. ¿Deseas continuar?")) return;
      aplicarDatosPrestamo(datos);
      if (!guardarPrestamo()) throw new Error("No se pudieron guardar los datos importados.");
      actualizarIndicadorGuardado("Respaldo importado y guardado");
      alert("Respaldo importado correctamente.");
    } catch (error) {
      console.error(error);
      alert("No se pudo importar el archivo. Selecciona un respaldo JSON válido de este simulador.");
    }
  };
  lector.onerror = () => alert("No se pudo leer el archivo seleccionado.");
  lector.readAsText(archivo);
}

function calcularProgreso() {
  // El denominador es el compromiso original. No debe cambiar cuando se hace un abono
  // extraordinario, porque eso inflaría artificialmente el porcentaje de progreso.
  const totalOriginal = normalizarMoneda(montoInicial + interesTotalOriginal);
  if (totalOriginal <= 0) return 0;
  const pagadoAcumulado = normalizarMoneda(capitalPagado + interesPagado);
  return Math.min(100, Math.max(0, (pagadoAcumulado / totalOriginal) * 100));
}

function actualizarEstado() {
  pagado = capitalPagado + interesPagado;

  const progreso = calcularProgreso();

  actualizarTexto("saldoPendiente", "$" + dinero(totalPrestamo));
  actualizarTexto("capitalPagado", "$" + dinero(capitalPagado));
  actualizarTexto("interesPagado", "$" + dinero(interesPagado));
  actualizarTexto("totalPagado", "$" + dinero(pagado));
  actualizarTexto("progresoPrestamo", progreso.toFixed(0) + "%");

  const barra = document.getElementById("barraProgreso");

  if (barra) {
    requestAnimationFrame(() => {
      barra.style.width = progreso + "%";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarPrestamo();
  renderHistorial?.();
});

function actualizarGrafica() {
  if (typeof Chart === "undefined") return;

  const canvas = document.getElementById("grafica");
  if (!canvas) return;

  const labels = [];
  const saldos = [];
  let saldo = totalPrestamo;

  for (let i = 0; i < cuotasTotales; i++) {
    if (!esCuotaActiva(i)) continue;

    saldo = Math.max(0, saldo - aNumero(capitalCuotas[i]));
    labels.push("Cuota " + (i + 1));
    saldos.push(saldo);
  }

  if (chart) {
    chart.destroy();
    chart = null;
  }

  if (!labels.length) return;

  chart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Saldo restante",
          data: saldos,
          borderColor: "#38bdf8",
          backgroundColor: "rgba(56,189,248,0.1)",
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      animation: {
        duration: 1200,
        easing: "easeOutQuart"
      },
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
