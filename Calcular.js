"use strict";

function calcular() {

  const monto = parseFloat(document.getElementById("monto")?.value);
  const interesAnual = parseFloat(document.getElementById("interes")?.value) / 100;
  const cuotas = parseInt(document.getElementById("cuotas")?.value);
  const diaPago = parseInt(document.getElementById("diaPago")?.value);

  if ([monto, interesAnual, cuotas, diaPago].some(isNaN) || monto <= 0 || cuotas <= 0 || diaPago <= 0 || diaPago > 31) {
    alert("Completa todos los campos correctamente");
    return;
  }

  /* =========================
     RESET TOTAL
  ========================= */
  totalPrestamo = monto;
  cuotasTotales = cuotas;
  pagado = 0;
  cuotasPagadas = 0;
  capitalPagado = 0;
  interesPagado = 0;

  capitalCuotas = [];
  interesCuotas = [];
  cuotasPagadasEstado = new Array(cuotas).fill(false);

  historialAbonos = []; // ✅ IMPORTANTE (nuevo préstamo limpio)

  const interesMensual = interesAnual / 12;

  /* CUOTA */
  let cuota;

  if(interesMensual === 0){
    cuota = monto / cuotas;
  }else{
    cuota = monto *
      (interesMensual * Math.pow(1 + interesMensual, cuotas)) /
      (Math.pow(1 + interesMensual, cuotas) - 1);
  }

  let saldo = monto;

  const tabla = document.getElementById("tabla");
  if (!tabla) return;

  tabla.innerHTML = "";

  const labels = [];
  const saldos = [];

  let totalInteres = 0;

  const fechaBase = new Date();

  for (let i = 1; i <= cuotas; i++) {

    let interesMes = saldo * interesMensual;
    let capital = cuota - interesMes;

    if(capital > saldo){
      capital = saldo;
    }

    saldo -= capital;
    saldo = Math.max(0, saldo);

    capitalCuotas.push(capital);
    interesCuotas.push(interesMes);

    totalInteres += interesMes;

    const fecha = new Date(fechaBase);
    fecha.setMonth(fechaBase.getMonth() + i);
    fecha.setDate(diaPago);

    const fechaTexto = fecha.toLocaleDateString("es-CO");

    const hoy = new Date();
    let estado = "Pendiente";
    let clase = "";

    if (cuotasPagadasEstado[i-1]) {
      estado = "Pagado";
      clase = "fila-pagada";
    }
    else if (hoy > fecha) {
      estado = "Vencida";
      clase = "fila-vencida";
    }

    labels.push("Cuota " + i);
    saldos.push(saldo);

    tabla.innerHTML += `
      <tr id="fila${i}" class="${clase}">
        <td>${i}</td>
        <td>${fechaTexto}</td>
        <td>$${dinero(Math.round(cuota))}</td>
        <td>$${dinero(Math.round(interesMes))}</td>
        <td>$${dinero(Math.round(capital))}</td>
        <td>$${dinero(Math.round(saldo))}</td>
        <td id="estado${i}">${estado}</td>
        <td>
          <button onclick="pagarCuota(${i}, this)">
            Pagar
          </button>
        </td>
      </tr>
    `;
  }

  /* GUARDAR INTERÉS ORIGINAL */
  interesTotalOriginal = totalInteres;

  totalDeuda = monto + totalInteres;
  totalPrestamo = monto;

  /* GRÁFICA */
  if (chart) {
    chart.destroy();
    chart = null;
  }

  if (typeof Chart !== "undefined") {
    chart = new Chart(document.getElementById("grafica"), {
      type: "line",
      data: {
        labels: labels,
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
        animation:{
          duration:1200,
          easing:"easeOutQuart"
        },
        plugins:{
          legend:{ display:true }
        },
        scales:{
          y:{ beginAtZero:true }
        }
      }
    });
  }

  actualizarEstado();
  guardarPrestamo();
  renderHistorial(); // ✅ para limpiar visualmente
}