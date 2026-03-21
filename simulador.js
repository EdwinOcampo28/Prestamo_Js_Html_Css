let totalPrestamo = 0;
let pagado = 0;
let cuotasTotales = 0;
let cuotasPagadas = 0;
let chart;
let capitalCuotas = [];
let interesCuotas = [];

function dinero(v) {
  return v.toLocaleString("es-CO");
}

// Calcular préstamo con interés mensual y cuotas
function calcular() {
  let monto = parseFloat(document.getElementById("monto").value);
  let interesAnual = parseFloat(document.getElementById("interes").value) / 100;
  let cuotas = parseInt(document.getElementById("cuotas").value);
  let diaPago = parseInt(document.getElementById("diaPago").value);

  totalPrestamo = monto;
  cuotasTotales = cuotas;
  pagado = 0;
  cuotasPagadas = 0;
  capitalCuotas = [];
  interesCuotas = [];

  let interesMensual = interesAnual / 12;
  // Calculamos la cuota fija
  let cuota = monto * (interesMensual * Math.pow(1 + interesMensual, cuotas)) /
              (Math.pow(1 + interesMensual, cuotas) - 1);
  
  let saldo = monto;
  let tabla = document.getElementById("tabla");
  tabla.innerHTML = "";

  let labels = [];
  let saldos = [];

  for (let i = 1; i <= cuotas; i++) {
    let interesMes = saldo * interesMensual;
    let capital = cuota - interesMes;
    saldo -= capital;

    capitalCuotas.push(capital);
    interesCuotas.push(interesMes);

    let fecha = new Date();
    fecha.setMonth(fecha.getMonth() + i);
    fecha.setDate(diaPago);

    let fechaTexto = fecha.toLocaleDateString("es-CO");
    let hoy = new Date();

    let estado = "Pendiente";
    let clase = "";
    if (hoy > fecha) {
      estado = "Vencida";
      clase = "vencida";
    }

    labels.push("Cuota " + i);
    saldos.push(saldo);

    tabla.innerHTML += `
      <tr id="fila${i}" class="${clase}">
        <td>${i}</td>
        <td>${fechaTexto}</td>
        <td>$${dinero(cuota.toFixed(0))}</td>
        <td>$${dinero(interesMes.toFixed(0))}</td>
        <td>$${dinero(capital.toFixed(0))}</td>
        <td>$${dinero(saldo.toFixed(0))}</td>
        <td id="estado${i}">${estado}</td>
        <td>
          <button onclick="pagarCuota(${i}, this)">Pagar</button>
        </td>
      </tr>
    `;
  }

  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("grafica"), {
    type: "line",
    data: { labels: labels, datasets: [{ label: "Saldo restante", data: saldos }] }
  });

  // Reiniciar saldos y progreso
  document.getElementById("saldoPendiente").innerText = "$" + dinero(totalPrestamo);
  document.getElementById("totalPagado").innerText = "$0";
  document.getElementById("progresoPrestamo").innerText = "0%";
  document.getElementById("barraProgreso").style.width = "0%";
}

// Pagar cuota
function pagarCuota(numero, btn) {
  let fila = document.getElementById("fila" + numero);
  if (fila.classList.contains("pagada")) return;

  fila.classList.remove("vencida");
  fila.classList.add("pagada");

  btn.disabled = true;
  btn.style.backgroundColor = "#10b981"; // verde al pagar
  btn.style.cursor = "default";

  document.getElementById("estado" + numero).innerText = "Pagada";

  pagado += capitalCuotas[numero - 1] + interesCuotas[numero - 1];
  cuotasPagadas++;

  let saldo = totalPrestamo - pagado;
  if (saldo < 0) saldo = 0;

  let progreso = (pagado / totalPrestamo) * 100;
  if (progreso > 100) progreso = 100;

  document.getElementById("saldoPendiente").innerText = "$" + dinero(saldo);
  document.getElementById("totalPagado").innerText = "$" + dinero(pagado);
  document.getElementById("progresoPrestamo").innerText = progreso.toFixed(0) + "%";
  document.getElementById("barraProgreso").style.width = progreso + "%";
}

// Abonar a capital
function abonarCapital() {
  let abono = parseFloat(document.getElementById("abonoCapital").value);
  if (!abono || abono <= 0) { alert("Ingresa un valor válido"); return; }

  pagado += abono;
  let saldo = totalPrestamo - pagado;
  if (saldo < 0) saldo = 0;

  let progreso = (pagado / totalPrestamo) * 100;
  if (progreso > 100) progreso = 100;

  document.getElementById("saldoPendiente").innerText = "$" + dinero(saldo);
  document.getElementById("totalPagado").innerText = "$" + dinero(pagado);
  document.getElementById("progresoPrestamo").innerText = progreso.toFixed(0) + "%";
  document.getElementById("barraProgreso").style.width = progreso + "%";

  alert("Abono realizado correctamente");
}

// Reiniciar
function reiniciar() { location.reload(); }

// Generar PDF
function generarPDF() {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();
  doc.text("Simulación de préstamo", 20, 20);
  doc.text("Total pagado: " + document.getElementById("totalPagado").innerText, 20, 40);
  doc.text("Saldo pendiente: " + document.getElementById("saldoPendiente").innerText, 20, 50);
  doc.save("prestamo.pdf");
}