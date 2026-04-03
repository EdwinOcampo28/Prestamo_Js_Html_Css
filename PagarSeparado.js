function pagarSeparado() {

let interesAntes = interesPagado;

// 🔹 calcular interés total real antes del abono
for (let i = 0; i < interesCuotas.length; i++) {
  if (!cuotasPagadasEstado[i]) {
    interesAntes += interesCuotas[i];
  }
}

let cuotasAntes = 0;

for (let i = 0; i < capitalCuotas.length; i++) {
  if (!cuotasPagadasEstado[i]) {
    cuotasAntes++;
  }
}

let abono = parseFloat(document.getElementById("abonoCapital")?.value);

if (!abono || abono <= 0 || isNaN(abono)) {
  alert("Ingresa un valor de abono");
  return;
}

if (abono > totalPrestamo) abono = totalPrestamo;

const tipo = document.getElementById("tipoAbono")?.value || "cuota";

const interesAnual = parseFloat(document.getElementById("interes")?.value) / 100 || 0;
const interesMensual = interesAnual / 12;

let interesNuevoRestante = 0;

// aplicar abono
totalPrestamo -= abono;
capitalPagado += abono;
pagado = capitalPagado + interesPagado;

const tabla = document.getElementById("tabla");
if (!tabla) return;

tabla.innerHTML = "";

const labels = [];
const saldos = [];

let saldo = totalPrestamo;

const fechaBase = new Date();

if (tipo === "cuota") {

const cuotasRestantes = cuotasTotales - cuotasPagadas;

let nuevaCuota =
  saldo *
  (interesMensual * Math.pow(1 + interesMensual, cuotasRestantes)) /
  (Math.pow(1 + interesMensual, cuotasRestantes) - 1);

nuevaCuota = Math.round(nuevaCuota);

for (let i = cuotasPagadas; i < cuotasTotales; i++) {

  if (saldo <= 0) break;

  const interesMes = Math.max(0, Math.round(saldo * interesMensual));
  let capital = Math.round(nuevaCuota - interesMes);

  if (capital > saldo) capital = saldo;

  saldo -= capital;
  saldo = Math.max(0, saldo);

  interesCuotas[i] = interesMes;
  capitalCuotas[i] = capital;

  interesNuevoRestante += interesMes;

  labels.push("Cuota " + (i + 1));
  saldos.push(saldo);

  const fecha = new Date(fechaBase);
  fecha.setMonth(fecha.getMonth() + (i + 1));
  fecha.setDate(parseInt(document.getElementById("diaPago")?.value));

  const fechaTexto = fecha.toLocaleDateString("es-CO");

  tabla.innerHTML += `
    <tr id="fila${i + 1}">
      <td>${i + 1}</td>
      <td>${fechaTexto}</td>
      <td>$${dinero(nuevaCuota)}</td>
      <td>$${dinero(interesMes)}</td>
      <td>$${dinero(capital)}</td>
      <td>$${dinero(saldo)}</td>
      <td>Pendiente</td>
      <td>
      <button onclick="pagarCuota(${i + 1}, this)" style="background:#28a745;color:white;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;">
      Pagar
      </button>
      </td>
    </tr>
  `;
}

} else {

// 🔹 reducir plazo
for (let i = cuotasPagadas; i < cuotasTotales; i++) {

  if (saldo <= 0) {

    cuotasPagadasEstado[i] = true;

    const fila = document.getElementById("fila" + (i + 1));
    if (fila) fila.classList.add("fila-cancelada");

    continue;
  }

  const interesMes = Math.max(0, Math.round(saldo * interesMensual));
  let capital = capitalCuotas[i];

  if (capital > saldo) capital = saldo;

  saldo -= capital;
  saldo = Math.max(0, saldo);

  interesCuotas[i] = interesMes;
  capitalCuotas[i] = capital;

  interesNuevoRestante += interesMes;

  labels.push("Cuota " + (i + 1));
  saldos.push(saldo);

  const fecha = new Date(fechaBase);
  fecha.setMonth(fecha.getMonth() + (i + 1));
  fecha.setDate(parseInt(document.getElementById("diaPago")?.value));

  const fechaTexto = fecha.toLocaleDateString("es-CO");

  tabla.innerHTML += `
    <tr id="fila${i + 1}">
      <td>${i + 1}</td>
      <td>${fechaTexto}</td>
      <td>$${dinero(capital + interesMes)}</td>
      <td>$${dinero(interesMes)}</td>
      <td>$${dinero(capital)}</td>
      <td>$${dinero(saldo)}</td>
      <td>Pendiente</td>
      <td>
      <button onclick="pagarCuota(${i + 1}, this)" style="background:#28a745;color:white;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;">
      Pagar
      </button>
      </td>
    </tr>
  `;
}

}

const interesAhorradoEl = document.getElementById("interesAhorrado");

if(interesAhorradoEl){
interesAhorradoEl.innerText =
"$" + dinero(Math.round(interesAntes - (interesPagado + interesNuevoRestante)));
}

// actualizar grafica
if (chart) chart.destroy();

if (typeof Chart !== "undefined") {

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
      tension: 0.3
    }
  ]
},
options: {

responsive:true,

animation:{
duration:1200,
easing:"easeOutQuart"
},

plugins:{
legend:{
display:true
}
},

scales:{
y:{
beginAtZero:true
}
}

}
});

}

actualizarEstado();

const inputAbono = document.getElementById("abonoCapital");
if(inputAbono) inputAbono.value = "";

let interesDespues = interesPagado;

for (let i = 0; i < interesCuotas.length; i++) {
if (!cuotasPagadasEstado[i]) {
  interesDespues += interesCuotas[i];
}
}

let cuotasDespues = 0;

for (let i = 0; i < capitalCuotas.length; i++) {
if (!cuotasPagadasEstado[i] && capitalCuotas[i] + interesCuotas[i] > 0) {
  cuotasDespues++;
}
}

let ahorro = Math.round(interesAntes - interesDespues);
let cuotasReducidas = cuotasAntes - cuotasDespues;

// actualizar comparador

const interesOriginalEl = document.getElementById("interesOriginal");
const interesConAbonoEl = document.getElementById("interesConAbono");
const ahorroTotalEl = document.getElementById("ahorroTotal");
const cuotasReducidasEl = document.getElementById("cuotasReducidas");

if(interesOriginalEl) interesOriginalEl.innerText = "$" + dinero(interesAntes);
if(interesConAbonoEl) interesConAbonoEl.innerText = "$" + dinero(interesDespues);
if(ahorroTotalEl) ahorroTotalEl.innerText = "$" + dinero(ahorro);
if(cuotasReducidasEl) cuotasReducidasEl.innerText = cuotasReducidas;

const resultado = document.getElementById("resultadoAbono");

if (resultado) {

resultado.innerHTML = `
💰 <strong>Ahorro en intereses:</strong> $${dinero(ahorro)} <br>
📉 <strong>Cuotas reducidas:</strong> ${cuotasReducidas}
`;

}

alert("Abono aplicado correctamente");

guardarPrestamo();
}