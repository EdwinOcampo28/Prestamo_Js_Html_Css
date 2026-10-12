"use strict";

function actualizarProximoPago() {
  const fechaEl = document.getElementById("proximoPagoFecha");
  const valorEl = document.getElementById("proximoPagoValor");
  const estadoEl = document.getElementById("proximoPagoEstado");
  if (!fechaEl || !valorEl || !estadoEl) return;

  const indices = typeof obtenerIndicesCuotasActivas === "function"
    ? obtenerIndicesCuotasActivas()
    : [];

  if (!indices.length || totalPrestamo <= 0) {
    fechaEl.textContent = "Sin cuotas pendientes";
    valorEl.textContent = "$0";
    estadoEl.textContent = "Préstamo al día o liquidado";
    estadoEl.dataset.estado = "ok";
    return;
  }

  const i = indices[0];
  const fecha = generarFechaObjeto(obtenerFechaBasePrestamo(), i, obtenerDiaPago());
  const cuota = normalizarMoneda(aNumero(capitalCuotas[i]) + aNumero(interesCuotas[i]));
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(fecha);
  vencimiento.setHours(0, 0, 0, 0);
  const dias = Math.ceil((vencimiento.getTime() - hoy.getTime()) / 86400000);

  fechaEl.textContent = fecha.toLocaleDateString("es-CO", {day:"2-digit", month:"long", year:"numeric"});
  valorEl.textContent = "$" + dinero(cuota);
  if (dias < 0) {
    estadoEl.textContent = "Vencida hace " + Math.abs(dias) + (Math.abs(dias) === 1 ? " día" : " días");
    estadoEl.dataset.estado = "vencido";
  } else if (dias === 0) {
    estadoEl.textContent = "Vence hoy";
    estadoEl.dataset.estado = "hoy";
  } else {
    estadoEl.textContent = "Vence en " + dias + (dias === 1 ? " día" : " días");
    estadoEl.dataset.estado = "ok";
  }
}

function filtrarCuotas() {
  const filtro = document.getElementById("filtroCuotas")?.value || "todas";
  const filas = document.querySelectorAll("#tabla tr");
  let visibles = 0;
  filas.forEach(fila => {
    const estado = (fila.cells[6]?.textContent || "").trim().toLowerCase();
    const mostrar = filtro === "todas" || estado === filtro;
    fila.hidden = !mostrar;
    if (mostrar) visibles++;
  });
  const resultado = document.getElementById("resultadoFiltroCuotas");
  if (resultado) {
    resultado.textContent = visibles === 0
      ? "No hay cuotas que coincidan con este filtro."
      : visibles + (visibles === 1 ? " cuota visible" : " cuotas visibles");
  }
}

function exportarCronogramaCSV() {
  const tabla = document.getElementById("tablaPrincipal");
  const filas = tabla?.querySelectorAll("tbody tr") || [];
  if (!filas.length) {
    alert("Primero calcula un préstamo para exportar el cronograma.");
    return;
  }
  const encabezados = ["Numero", "Fecha", "Cuota", "Interes", "Capital", "Saldo pendiente", "Estado"];
  const contenido = [encabezados.map(csvEscapar).join(";")];
  filas.forEach(fila => {
    const celdas = Array.from(fila.cells).slice(0, 7).map(celda => {
      // El estado se conserva como texto; no se exportan los botones de acción.
      return (celda.textContent || "").trim().replace(/\s+/g, " ");
    });
    contenido.push(celdas.map(csvEscapar).join(";"));
  });
  const blob = new Blob(["\uFEFF" + contenido.join("\r\n")], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "cronograma_prestamo_" + new Date().toISOString().slice(0, 10) + ".csv";
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvEscapar(valor) {
  const texto = String(valor ?? "");
  return '"' + texto.replace(/"/g, '""') + '"';
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("filtroCuotas")?.addEventListener("change", filtrarCuotas);
  document.getElementById("btnExportarCSV")?.addEventListener("click", exportarCronogramaCSV);
  // Se vuelve a actualizar al cambiar de pestaña o regresar al simulador.
  window.addEventListener("focus", actualizarProximoPago);
  actualizarProximoPago();
  filtrarCuotas();
});
