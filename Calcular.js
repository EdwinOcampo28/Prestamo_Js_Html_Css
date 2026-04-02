"use strict";

function calcular() {
  // 📌 Obtener valores del formulario
  const monto = parseInt(document.getElementById("monto").value);
  const interesAnual = parseFloat(document.getElementById("interes").value) / 100;
  const cuotas = parseInt(document.getElementById("cuotas").value);
  const diaPago = parseInt(document.getElementById("diaPago").value);

  // 🚨 Validación
  if ([monto, interesAnual, cuotas, diaPago].some(isNaN) || monto <= 0 || cuotas <= 0 || diaPago <= 0 || diaPago > 31) {
    alert("Completa todos los campos correctamente");
    return;
  }

  // 🔄 Reiniciar variables globales
  totalPrestamo = monto;
  cuotasTotales = cuotas;
  pagado = 0;
  cuotasPagadas = 0;
  capitalPagado = 0;
  interesPagado = 0;
  capitalCuotas = [];
  interesCuotas = [];
  cuotasPagadasEstado = new Array(cuotas).fill(false);

  const interesMensual = interesAnual / 12;

  // 📌 Cálculo de cuota mensual
  let cuota = monto * (interesMensual * Math.pow(1 + interesMensual, cuotas)) / (Math.pow(1 + interesMensual, cuotas) - 1);
  cuota = Math.round(cuota); // 🔹 Redondear a entero

  let saldo = monto;
  const tabla = document.getElementById("tabla");
  tabla.innerHTML = "";
  const labels = [];
  const saldos = [];
  let totalInteres = 0;
  const fechaBase = new Date();

  // 🗓 Generar cuotas
  for (let i = 1; i <= cuotas; i++) {
    let interesMes = Math.round(saldo * interesMensual); // 🔹 Redondear
    let capital = Math.round(cuota - interesMes);        // 🔹 Redondear

    saldo -= capital;
    saldo = Math.max(0, saldo); // 🔹 No permitir saldo negativo

    capitalCuotas.push(capital);
    interesCuotas.push(interesMes);
    totalInteres += interesMes;

    // 📌 Fecha de pago
    const fecha = new Date(fechaBase);
    fecha.setMonth(fecha.getMonth() + i);
    fecha.setDate(diaPago);
    const fechaTexto = fecha.toLocaleDateString("es-CO");

    // 🔹 Estado de la cuota
    const hoy = new Date();
    let estado = "Pendiente";
    let clase = "";
    if (hoy > fecha) {
      estado = "Vencida";
      clase = "vencida";
    }

    labels.push("Cuota " + i);
    saldos.push(saldo);

    // 📄 Fila de tabla
    tabla.innerHTML += `
      <tr id="fila${i}" class="${clase}">
        <td>${i}</td>
        <td>${fechaTexto}</td>
        <td>$${dinero(cuota)}</td>
        <td>$${dinero(interesMes)}</td>
        <td>$${dinero(capital)}</td>
        <td>$${dinero(saldo)}</td>
        <td id="estado${i}">${estado}</td>
        <td>
          <button onclick="pagarCuota(${i}, this)">Pagar</button>
        </td>
      </tr>
    `;
  }

  totalDeuda = monto + totalInteres;
  totalPrestamo = monto; // 🔹 Asegura que saldo inicial sea correcto

  // 🔹 Actualizar gráfico
  if (chart) {
    chart.destroy();
    chart = null;
  }

  chart = new Chart(document.getElementById("grafica"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Saldo restante",
          data: saldos,
          borderColor: "#007bff",
          backgroundColor: "rgba(0,123,255,0.1)",
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
      },
    },
  });

  actualizarEstado();
}