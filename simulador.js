"use strict";

let totalPrestamo = 0;
let totalDeuda = 0; // capital + interes total
let pagado = 0;

let cuotasTotales = 0;
let cuotasPagadas = 0;

let chart;

let capitalCuotas = [];
let interesCuotas = [];

function dinero(v) {
  return Number(v).toLocaleString("es-CO");
}

// ----------------------------
// PAGAR CUOTA
// ----------------------------
function pagarCuota(numero, btn) {

  let fila = document.getElementById("fila" + numero);

  if (fila.classList.contains("pagada")) return;

  fila.classList.remove("vencida");
  fila.classList.add("pagada");

  btn.disabled = true;
  btn.style.backgroundColor = "#10b981";
  btn.style.cursor = "default";

  document.getElementById("estado" + numero).innerText = "Pagada";

  let capital = capitalCuotas[numero - 1];
  let interes = interesCuotas[numero - 1];

  let pago = capital + interes;

  // evitar pagar más del total
  if (pagado + pago > totalDeuda) {
    pago = totalDeuda - pagado;
  }

  pagado += pago;
  cuotasPagadas++;

  // solo el capital reduce el préstamo
  totalPrestamo -= capital;

  if (totalPrestamo < 0) totalPrestamo = 0;

  actualizarEstado();
}

// ----------------------------
// ABONAR A CAPITAL
// ----------------------------
function abonarCapital() {

let abono = parseFloat(document.getElementById("abonoCapital").value);
let tipo = document.getElementById("tipoAbono").value;

if (!abono || abono <= 0) {
alert("Ingresa un valor válido");
return;
}

if (pagado + abono > totalDeuda) {
abono = totalDeuda - pagado;
}

pagado += abono;
totalPrestamo -= abono;

if (totalPrestamo < 0) totalPrestamo = 0;

let interesAnual = parseFloat(document.getElementById("interes").value) / 100;
let interesMensual = interesAnual / 12;

let cuotasRestantes = cuotasTotales - cuotasPagadas;

if (cuotasRestantes <= 0) return;

let saldo = totalPrestamo;

if (tipo === "cuota") {

// recalcular cuota
let nuevaCuota =
saldo *
(interesMensual * Math.pow(1 + interesMensual, cuotasRestantes)) /
(Math.pow(1 + interesMensual, cuotasRestantes) - 1);

for (let i = cuotasPagadas; i < cuotasTotales; i++) {

let interesMes = saldo * interesMensual;
let capital = nuevaCuota - interesMes;

saldo -= capital;

if (saldo < 0) saldo = 0;

capitalCuotas[i] = capital;
interesCuotas[i] = interesMes;

let fila = document.getElementById("fila" + (i + 1));
let celdas = fila.getElementsByTagName("td");

celdas[2].innerText = "$" + dinero(nuevaCuota.toFixed(0));
celdas[3].innerText = "$" + dinero(interesMes.toFixed(0));
celdas[4].innerText = "$" + dinero(capital.toFixed(0));
celdas[5].innerText = "$" + dinero(saldo.toFixed(0));
}

}

if (tipo === "plazo") {

// mantener cuota original
let cuotaOriginal =
capitalCuotas[cuotasPagadas] + interesCuotas[cuotasPagadas];

let i = cuotasPagadas;
let nuevaTabla = "";

while (saldo > 0 && i < cuotasTotales) {

let interesMes = saldo * interesMensual;
let capital = cuotaOriginal - interesMes;

saldo -= capital;

if (saldo < 0) saldo = 0;

capitalCuotas[i] = capital;
interesCuotas[i] = interesMes;

let fila = document.getElementById("fila" + (i + 1));
let celdas = fila.getElementsByTagName("td");

celdas[2].innerText = "$" + dinero(cuotaOriginal.toFixed(0));
celdas[3].innerText = "$" + dinero(interesMes.toFixed(0));
celdas[4].innerText = "$" + dinero(capital.toFixed(0));
celdas[5].innerText = "$" + dinero(saldo.toFixed(0));

i++;
}

cuotasTotales = i;

}

actualizarEstado();

document.getElementById("abonoCapital").value = "";

alert("Abono aplicado correctamente");

}

// ----------------------------
// ACTUALIZAR ESTADO GENERAL
// ----------------------------
function actualizarEstado() {

  let progreso = (pagado / totalDeuda) * 100;

  if (progreso > 100) progreso = 100;

  document.getElementById("saldoPendiente").innerText =
    "$" + dinero(totalPrestamo);

  document.getElementById("totalPagado").innerText =
    "$" + dinero(pagado);

  document.getElementById("progresoPrestamo").innerText =
    progreso.toFixed(0) + "%";

  document.getElementById("barraProgreso").style.width =
    progreso + "%";
}

// ----------------------------
// REINICIAR SIMULADOR
// ----------------------------
function reiniciar() {
  location.reload();
}