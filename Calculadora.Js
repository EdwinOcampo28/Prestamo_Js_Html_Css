"use strict";

let chart;

let totalPrestamo = 0;
let totalDeuda = 0;
let pagado = 0;

let cuotasTotales = 0;
let cuotasPagadas = 0;

let capitalPagado = 0;
let interesPagado = 0;

let capitalCuotas = [];
let interesCuotas = [];
let cuotasPagadasEstado = [];

function dinero(num){
return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
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