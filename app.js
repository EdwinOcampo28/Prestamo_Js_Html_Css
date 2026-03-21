let chart;
let totalPrestamo = 0;
let pagado = 0;
let cuotasTotales = 0;
let cuotasPagadas = 0;
let capitalCuotas = [];
let interesCuotas = [];

// Crear gráfica de barras: Capital vs Interés
function crearGrafica(labels, capital, interes) {
  if(chart) chart.destroy();
  chart = new Chart(document.getElementById("grafica"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Capital",
          data: capital,
          backgroundColor: "#06d6a0"
        },
        {
          label: "Interés",
          data: interes,
          backgroundColor: "#ef4444"
        }
      ]
    }
  });
}

// Login/Logout/Navegación
function login() {
  let user = document.getElementById("usuario").value;
  let pass = document.getElementById("clave").value;
  if(user === "admin" && pass === "1234") {
    localStorage.setItem("usuario", user);
    window.location = "dashboard.html";
  } else {
    alert("Credenciales incorrectas");
  }
}

function logout() {
  localStorage.clear();
  window.location = "login.html";
}

function irSimulador() {
  window.location = "simulador.html";
}

function volverDashboard() {
  window.location = "dashboard.html";
}

// Simular préstamo
function simularPrestamo() {
  let monto = parseFloat(document.getElementById("monto").value);
  let interesAnual = parseFloat(document.getElementById("interes").value)/100;
  let cuotas = parseInt(document.getElementById("cuotas").value);
  let dia = parseInt(document.getElementById("diaPago").value);

  totalPrestamo = monto;
  cuotasTotales = cuotas;
  pagado = 0;
  cuotasPagadas = 0;
  capitalCuotas = [];
  interesCuotas = [];

  let interesMensual = interesAnual/12;
  let cuota = monto*(interesMensual*Math.pow(1+interesMensual,cuotas)) /
              (Math.pow(1+interesMensual,cuotas)-1);

  let saldo = monto;
  let tabla = document.getElementById("tabla");
  tabla.innerHTML = "";

  let labels = [];
  let capitalData = [];
  let interesData = [];

  for(let i=1;i<=cuotas;i++){
    let interesMes = saldo * interesMensual;
    let capital = cuota - interesMes;
    saldo -= capital;

    capitalCuotas.push(capital);
    interesCuotas.push(interesMes);

    tabla.innerHTML += `
      <tr id="fila${i}">
        <td>${i}</td>
        <td>${new Date().setMonth(new Date().getMonth()+i)},${dia}</td>
        <td>$${cuota.toFixed(0)}</td>
        <td>$${interesMes.toFixed(0)}</td>
        <td>$${capital.toFixed(0)}</td>
        <td>$${saldo.toFixed(0)}</td>
        <td>Pendiente</td>
        <td>
          <button onclick="pagarCuota(${i})">Pagar</button>
        </td>
      </tr>
    `;

    labels.push("Cuota "+i);
    capitalData.push(capital.toFixed(0));
    interesData.push(interesMes.toFixed(0));
  }

  // Crear gráfica
  crearGrafica(labels, capitalData, interesData);

  // Actualizar info
  document.getElementById("saldoPendiente").innerText = "$" + totalPrestamo.toLocaleString("es-CO");
  document.getElementById("totalPagado").innerText = "$0";
  document.getElementById("progresoPrestamo").innerText = "0%";
  document.getElementById("barraProgreso").style.width = "0%";
}

// Pagar cuota
function pagarCuota(numero) {
  let fila = document.getElementById("fila" + numero);
  if(fila.classList.contains("pagada")) return;

  fila.classList.add("pagada");

  pagado += capitalCuotas[numero-1] + interesCuotas[numero-1];
  cuotasPagadas++;

  let saldo = totalPrestamo - pagado;
  if(saldo < 0) saldo = 0;

  let progreso = (cuotasPagadas / cuotasTotales) * 100;

  document.getElementById("saldoPendiente").innerText = "$" + saldo.toLocaleString("es-CO");
  document.getElementById("totalPagado").innerText = "$" + pagado.toLocaleString("es-CO");
  document.getElementById("progresoPrestamo").innerText = progreso.toFixed(0) + "%";
  document.getElementById("barraProgreso").style.width = progreso + "%";
}

// Abonar a capital
function abonarCapital() {
  let abono = parseFloat(document.getElementById("abonoCapital").value);
  if(!abono || abono <= 0) {
    alert("Ingresa un valor válido");
    return;
  }

  pagado += abono;
  let saldo = totalPrestamo - pagado;
  if(saldo < 0) saldo = 0;

  document.getElementById("saldoPendiente").innerText = "$" + saldo.toLocaleString("es-CO");
  document.getElementById("totalPagado").innerText = "$" + pagado.toLocaleString("es-CO");

  alert("Abono realizado correctamente");
}