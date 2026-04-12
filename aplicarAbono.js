function aplicarAbono(ctx = {}) {

    let { abono = 0, tipoOperacion, cuotasAntes = 0 } = ctx;

    abono = Number(abono) || 0;

    if (tipoOperacion === "liquidacion_total") {
        abono = totalPrestamo;
    }

    totalPrestamo -= abono;
    totalPrestamo = Math.max(0, totalPrestamo);

    capitalPagado += abono;
    pagado = capitalPagado + interesPagado;

    if (tipoOperacion === "liquidacion_total") {

        let interesRestanteAntes = 0;

        for (let i = 0; i < interesCuotas.length; i++) {
            if (!cuotasPagadasEstado[i]) {
                interesRestanteAntes += interesCuotas[i];
            }
        }

        for (let i = 0; i < cuotasTotales; i++) {
            if (!cuotasPagadasEstado[i]) {
                cuotasPagadasEstado[i] = true;
                capitalCuotas[i] = 0;
                interesCuotas[i] = 0;
            }
        }

        const ahorroTotal = Math.round(interesTotalOriginal - interesPagado);
        const ahorroIndividual = Math.round(interesRestanteAntes);

        actualizarTexto("interesAhorrado", "$" + dinero(ahorroTotal));

        const elInteresOriginal = document.getElementById("interesOriginal");
        const elInteresConAbono = document.getElementById("interesConAbono");
        const elAhorroTotal = document.getElementById("ahorroTotal");
        const elCuotasReducidas = document.getElementById("cuotasReducidas");

        if (elInteresOriginal) elInteresOriginal.innerText = "$" + dinero(interesTotalOriginal);
        if (elInteresConAbono) elInteresConAbono.innerText = "$" + dinero(interesPagado);
        if (elAhorroTotal) elAhorroTotal.innerText = "$" + dinero(ahorroTotal);
        if (elCuotasReducidas) {
            elCuotasReducidas.innerText = cuotasAntes + " cuotas menos (plazo: 0)";
        }

        historialAbonos.push({
            valor: abono,
            fecha: new Date().toLocaleString("es-CO"),
            tipo: "liquidación total",
            ahorro: ahorroIndividual
        });

        reconstruirTabla();
        guardarPrestamo();
        actualizarEstado();
        renderHistorial();

        alert("Préstamo liquidado completamente ✅");

        return "liquidado";
    }

    return "continuar";
}

function pagarSeparado() {

    const contexto = prepararYValidarAbono();
    if (!contexto) return;

    const resultado = aplicarAbono(contexto);
    if (resultado === "liquidado") return;

    recalcularYRenderizar(contexto);
}