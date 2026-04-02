function pagarSeparado() {
  let abono = parseFloat(document.getElementById("abonoCapital").value);
  if (!abono || abono <= 0) {
    alert("Ingresa un valor de abono");
    return;
  }

  const tipo = document.getElementById("tipoAbono").value;

  // 🔹 Limitar abono al capital restante
  if (abono > totalPrestamo) abono = totalPrestamo;

  // 🔹 Aplicar abono al capital
  capitalPagado += Math.round(abono);
  pagado = capitalPagado + interesPagado;
  totalPrestamo = Math.max(0, totalPrestamo - Math.round(abono));
  totalDeuda = Math.max(0, totalPrestamo + totalDeuda - Math.round(abono));

  const interesAnual = parseFloat(document.getElementById("interes").value) / 100;
  const interesMensual = interesAnual / 12;

  const tabla = document.getElementById("tabla");
  tabla.innerHTML = "";

  let saldo = totalPrestamo;
  const labels = [];
  const saldos = [];
  const fechaBase = new Date();

  if (tipo === "cuota") {
    // 🔹 Reducir cuota → recalcular cuotas restantes normalmente
    const cuotasRestantes = cuotasTotales - cuotasPagadas;
    if (cuotasRestantes > 0) {
      let nuevaCuota = saldo * (interesMensual * Math.pow(1 + interesMensual, cuotasRestantes)) / (Math.pow(1 + interesMensual, cuotasRestantes) - 1);
      nuevaCuota = Math.round(nuevaCuota);

      for (let i = cuotasPagadas; i < cuotasTotales; i++) {
        const interesMes = Math.round(saldo * interesMensual);
        const capital = Math.round(nuevaCuota - interesMes);
        saldo -= capital;
        saldo = Math.max(0, saldo);

        capitalCuotas[i] = capital;
        interesCuotas[i] = interesMes;

        labels.push("Cuota " + (i + 1));
        saldos.push(saldo);

        const fecha = new Date(fechaBase);
        fecha.setMonth(fecha.getMonth() + (i + 1));
        fecha.setDate(parseInt(document.getElementById("diaPago").value));
        const fechaTexto = fecha.toLocaleDateString("es-CO");

        tabla.innerHTML += `
          <tr id="fila${i + 1}">
            <td>${i + 1}</td>
            <td>${fechaTexto}</td>
            <td>$${dinero(nuevaCuota)}</td>
            <td>$${dinero(interesMes)}</td>
            <td>$${dinero(capital)}</td>
            <td>$${dinero(saldo)}</td>
            <td id="estado${i + 1}">Pendiente</td>
            <td><button onclick="pagarCuota(${i + 1}, this)">Pagar</button></td>
          </tr>
        `;
      }
    }
  } else if (tipo === "plazo") {
    // 🔹 Reducir plazo → cubrir cuotas completas con el abono
    let i = cuotasPagadas;
    let abonoRestante = abono;

    while (i < cuotasTotales && abonoRestante > 0) {
      const cuotaTotal = capitalCuotas[i] + interesCuotas[i];
      if (!cuotasPagadasEstado[i]) {
        if (abonoRestante >= cuotaTotal) {
          abonoRestante -= cuotaTotal;
          capitalCuotas[i] = 0;
          interesCuotas[i] = 0;
          cuotasPagadasEstado[i] = true;
        } else {
          capitalCuotas[i] -= abonoRestante;
          abonoRestante = 0;
        }
      }
      i++;
    }

    // 🔹 Generar tabla solo con cuotas que tengan saldo pendiente
    saldo = totalPrestamo;
    for (let j = cuotasPagadas; j < cuotasTotales; j++) {
      if (capitalCuotas[j] + interesCuotas[j] <= 0) continue;

      saldo -= capitalCuotas[j];
      saldo = Math.max(0, saldo);

      const fecha = new Date(fechaBase);
      fecha.setMonth(fecha.getMonth() + (j + 1));
      fecha.setDate(parseInt(document.getElementById("diaPago").value));
      const fechaTexto = fecha.toLocaleDateString("es-CO");

      tabla.innerHTML += `
        <tr id="fila${j + 1}">
          <td>${j + 1}</td>
          <td>${fechaTexto}</td>
          <td>$${dinero(capitalCuotas[j] + interesCuotas[j])}</td>
          <td>$${dinero(interesCuotas[j])}</td>
          <td>$${dinero(capitalCuotas[j])}</td>
          <td>$${dinero(saldo)}</td>
          <td id="estado${j + 1}">Pendiente</td>
          <td><button onclick="pagarCuota(${j + 1}, this)">Pagar</button></td>
        </tr>
      `;

      labels.push("Cuota " + (j + 1));
      saldos.push(saldo);
    }
  }

  // 🔹 Actualizar gráfico
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("grafica"), {
    type: "line",
    data: { labels: labels, datasets: [{ label: "Saldo restante", data: saldos, borderColor: "#007bff", backgroundColor: "rgba(0,123,255,0.1)", tension: 0.3 }] },
    options: { responsive: true, plugins: { legend: { display: true } } }
  });

  actualizarEstado();
  document.getElementById("abonoCapital").value = "";
  alert("Abono aplicado correctamente. El pago nunca excede el capital ni intereses totales.");
}