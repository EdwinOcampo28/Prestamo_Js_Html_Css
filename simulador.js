"use strict";

let totalPrestamo = 0;
let totalDeuda = 0;

let pagado = 0;

let capitalPagado = 0;
let interesPagado = 0;

let cuotasTotales = 0;
let cuotasPagadas = 0;

let chart;

let capitalCuotas = [];
let interesCuotas = [];

function dinero(v){
  return Number(v).toLocaleString("es-CO");
}

function pagarCuota(numero, btn){

  let fila = document.getElementById("fila" + numero);

  if(!fila || fila.classList.contains("pagada")) return;

  fila.classList.remove("vencida");
  fila.classList.add("pagada");

  btn.disabled = true;
  btn.style.backgroundColor = "#10b981";
  btn.style.cursor = "default";

  document.getElementById("estado" + numero).innerText = "Pagada";

  let capital = capitalCuotas[numero - 1] || 0;
  let interes = interesCuotas[numero - 1] || 0;

  capitalPagado += capital;
  interesPagado += interes;

  pagado = capitalPagado + interesPagado;

  cuotasPagadas++;

  totalPrestamo -= capital;

  if(totalPrestamo < 0) totalPrestamo = 0;

  actualizarEstado();
}

function pagarSeparado(){

  let abonoCapital = parseFloat(
    document.getElementById("abonoCapital").value
  );

  let tipo = document.getElementById("tipoAbono").value;

  if(isNaN(abonoCapital) || abonoCapital <= 0){
    alert("Ingresa un valor válido de pago");
    return;
  }

  // registrar pago
  capitalPagado += abonoCapital;
  pagado = capitalPagado + interesPagado;

  // reducir deuda
  totalPrestamo -= abonoCapital;
  totalDeuda -= abonoCapital;

  if(totalPrestamo < 0) totalPrestamo = 0;
  if(totalDeuda < 0) totalDeuda = 0;

  let interesAnual =
    parseFloat(document.getElementById("interes").value) / 100;

  let interesMensual = interesAnual / 12;

  let cuotasRestantes = cuotasTotales - cuotasPagadas;

  if(cuotasRestantes <= 0){
    actualizarEstado();
    return;
  }

  let saldo = totalPrestamo;

  // 🔵 Reducir cuota
  if(tipo === "cuota"){

    let nuevaCuota =
      saldo *
      (interesMensual * Math.pow(1 + interesMensual, cuotasRestantes)) /
      (Math.pow(1 + interesMensual, cuotasRestantes) - 1);

    for(let i = cuotasPagadas; i < cuotasTotales; i++){

      let interesMes = saldo * interesMensual;
      let capital = nuevaCuota - interesMes;

      saldo -= capital;

      if(saldo < 0) saldo = 0;

      capitalCuotas[i] = capital;
      interesCuotas[i] = interesMes;

      let fila = document.getElementById("fila" + (i + 1));
      if(!fila) continue;

      let celdas = fila.getElementsByTagName("td");

      celdas[2].innerText = "$" + dinero(nuevaCuota.toFixed(0));
      celdas[3].innerText = "$" + dinero(interesMes.toFixed(0));
      celdas[4].innerText = "$" + dinero(capital.toFixed(0));
      celdas[5].innerText = "$" + dinero(saldo.toFixed(0));
    }
  }

  // 🟢 Reducir plazo
  if(tipo === "plazo"){

    let cuotaOriginal =
      (capitalCuotas[cuotasPagadas] || 0) +
      (interesCuotas[cuotasPagadas] || 0);

    let i = cuotasPagadas;

    while(saldo > 0 && i < cuotasTotales){

      let interesMes = saldo * interesMensual;
      let capital = cuotaOriginal - interesMes;

      saldo -= capital;

      if(saldo < 0) saldo = 0;

      capitalCuotas[i] = capital;
      interesCuotas[i] = interesMes;

      let fila = document.getElementById("fila" + (i + 1));
      if(!fila) continue;

      let celdas = fila.getElementsByTagName("td");

      celdas[2].innerText = "$" + dinero(cuotaOriginal.toFixed(0));
      celdas[3].innerText = "$" + dinero(interesMes.toFixed(0));
      celdas[4].innerText = "$" + dinero(capital.toFixed(0));
      celdas[5].innerText = "$" + dinero(saldo.toFixed(0));

      i++;
    }

    cuotasTotales = i;

    for(let j = i + 1; j <= capitalCuotas.length; j++){
      let fila = document.getElementById("fila" + j);
      if(fila) fila.style.display = "none";
    }
  }

  actualizarEstado();

  document.getElementById("abonoCapital").value = "";

  alert("Pago aplicado correctamente");
}

function actualizarEstado(){

  let progreso =
    ((capitalPagado + interesPagado) /
      (capitalPagado + interesPagado + totalPrestamo)) * 100;

  if(progreso > 100) progreso = 100;

  document.getElementById("saldoPendiente").innerText =
    "$" + dinero(totalPrestamo);

  document.getElementById("capitalPagado").innerText =
    "$" + dinero(capitalPagado);

  document.getElementById("interesPagado").innerText =
    "$" + dinero(interesPagado);

  document.getElementById("totalPagado").innerText =
    "$" + dinero(pagado);

  document.getElementById("progresoPrestamo").innerText =
    progreso.toFixed(0) + "%";

  document.getElementById("barraProgreso").style.width =
    progreso + "%";
}