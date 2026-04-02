"use strict";

function pagarSeparado() {
  // 📌 Obtener abono y tipo
  const abono = parseFloat(document.getElementById("abonoCapital").value);
  const tipo = document.getElementById("tipoAbono").value;

  // 🚨 Validación
  if (!abono || abono <= 0) {
    alert("Ingresa un valor de abono");
    return;
  }

  const cuotasRestantes = cuotasTotales - cuotasPagadas;
  if (cuotasRestantes <= 0) {
    alert("El préstamo ya está pagado");
    return;
  }

  // 🔹 Actualizar montos globales
 capitalPagado += Math.round(abono);
pagado = capitalPagado + interesPagado;

totalPrestamo -= Math.round(abono);
totalDeuda -= Math.round(abono);
if (totalPrestamo < 0) totalPrestamo = 0;
if (totalDeuda < 0) totalDeuda = 0;

  // 📌 Cálculo de interés
  const interesAnual = parseFloat(document.getElementById("interes").value) / 100;
  const interesMensual = interesAnual / 12;

  let saldo = totalPrestamo;
  const labels = [];
  const saldos = [];

  // 🔹 Función helper para actualizar fila de tabla
  function actualizarFila(i, cuota, interesMes, capital, saldo) {
    const fila = document.getElementById("fila" + (i + 1));
    if (!fila) return;

    const celdas = fila.getElementsByTagName("td");
    celdas[2].innerText = "$" + dinero(cuota);
    celdas[3].innerText = "$" + dinero(interesMes);
    celdas[4].innerText = "$" + dinero(capital);
    celdas[5].innerText = "$" + dinero(saldo);

    labels.push("Cuota " + (i + 1));
    saldos.push(saldo);
  }

  if (tipo === "cuota") {
    const nuevaCuota =
      saldo *
      (interesMensual * Math.pow(1 + interesMensual, cuotasRestantes)) /
      (Math.pow(1 + interesMensual, cuotasRestantes) - 1);

    for (let i = cuotasPagadas; i < cuotasTotales; i++) {
      const interesMes = saldo * interesMensual;
      const capital = nuevaCuota - interesMes;
      saldo = Math.max(saldo - capital, 0);

      capitalCuotas[i] = capital;
      interesCuotas[i] = interesMes;

      actualizarFila(i, nuevaCuota, interesMes, capital, saldo);
    }
  }

  if (tipo === "plazo") {
    const cuotaOriginal = capitalCuotas[cuotasPagadas] + interesCuotas[cuotasPagadas];
    let i = cuotasPagadas;

    while (saldo > 0 && i < cuotasTotales) {
      const interesMes = saldo * interesMensual;
      const capital = cuotaOriginal - interesMes;
      saldo = Math.max(saldo - capital, 0);

      capitalCuotas[i] = capital;
      interesCuotas[i] = interesMes;

      actualizarFila(i, cuotaOriginal, interesMes, capital, saldo);
      i++;
    }

    cuotasTotales = i; // Ajustar total de cuotas si se reduce el plazo
  }

  // 🔹 Actualizar gráfico
  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("grafica"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Saldo restante",
          data: saldos,
          borderColor: "#28a745",
          backgroundColor: "rgba(40,167,69,0.1)",
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
    },
  });

  actualizarEstado();

  document.getElementById("abonoCapital").value = "";

  alert("Abono aplicado correctamente");
}