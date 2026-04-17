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

function guardarPrestamo() {
  const datos = {
    totalPrestamo,
    totalDeuda,
    pagado,
    cuotasTotales,
    montoInicial,
    interesAnualPrestamo,
    diaPagoPrestamo,
    fechaInicioPrestamo,
    capitalPagado,
    interesPagado,
    cuotasPagadas,
    capitalCuotas,
    interesCuotas,
    cuotasPagadasEstado,
    historialAbonos,
    interesTotalOriginal,
    comparador: {
      interesOriginal: document.getElementById("interesOriginal")?.innerText || "$0",
      interesConAbono: document.getElementById("interesConAbono")?.innerText || "$0",
      ahorroTotal: document.getElementById("ahorroTotal")?.innerText || "$0",
      cuotasReducidas: document.getElementById("cuotasReducidas")?.innerText || "0",
      interesAhorrado: document.getElementById("interesAhorrado")?.innerText || "$0"
    }
  };

  localStorage.setItem("prestamoSimulador", JSON.stringify(datos));
}

function cargarPrestamo() {
  const raw = localStorage.getItem("prestamoSimulador");
  if (!raw) return;

  const p = JSON.parse(raw);

  totalPrestamo = p.totalPrestamo || 0;
  totalDeuda = p.totalDeuda || 0;
  pagado = p.pagado || 0;
  cuotasTotales = p.cuotasTotales || 0;

  montoInicial = p.montoInicial || 0;
  interesAnualPrestamo = p.interesAnualPrestamo || 0;
  diaPagoPrestamo = p.diaPagoPrestamo || 1;
  fechaInicioPrestamo = p.fechaInicioPrestamo || "";

  capitalPagado = p.capitalPagado || 0;
  interesPagado = p.interesPagado || 0;
  cuotasPagadas = p.cuotasPagadas || 0;

  capitalCuotas = p.capitalCuotas || [];
  interesCuotas = p.interesCuotas || [];
  cuotasPagadasEstado = p.cuotasPagadasEstado || [];
  historialAbonos = p.historialAbonos || [];

  interesTotalOriginal = p.interesTotalOriginal || 0;

  cuotasTotales = cuotasTotales || capitalCuotas.length;

  if (!interesAnualPrestamo) {
    interesAnualPrestamo = aNumero(document.getElementById("interes")?.value) / 100;
  }

  if (!montoInicial) {
    montoInicial = aNumero(document.getElementById("monto")?.value) || totalPrestamo;
  }

  restaurarFormularioPrestamo();
  reconstruirTabla?.();
  actualizarEstado?.();

  if (p.comparador) {
    actualizarTexto("interesOriginal", p.comparador.interesOriginal);
    actualizarTexto("interesConAbono", p.comparador.interesConAbono);
    actualizarTexto("ahorroTotal", p.comparador.ahorroTotal);
    actualizarTexto("cuotasReducidas", p.comparador.cuotasReducidas);
    actualizarTexto("interesAhorrado", p.comparador.interesAhorrado || "$0");
  }
}

function calcularProgreso() {
  const pag = capitalPagado + interesPagado;
  const interesPendiente = sumarInteresPendiente();
  const total = pag + totalPrestamo + interesPendiente;

  if (!total) return 0;

  const progreso = (pag / total) * 100;
  return Math.min(100, Math.max(0, progreso));
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
